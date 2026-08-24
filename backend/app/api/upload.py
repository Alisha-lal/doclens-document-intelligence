"""Health check and the main document analyze endpoint.

The analyze flow is split into two steps to avoid long-held HTTP requests
(OCR + the Gemini call can take well past a typical proxy timeout, e.g.
Render's, which turns a slow-but-successful request into a confusing
502/CORS-looking failure in the browser):

1. POST /documents/analyze  -> validates the upload fast, kicks off the
   slow work in a background task, returns a job_id immediately.
2. GET  /documents/analyze/status/{job_id} -> the frontend polls this
   until status is "done" or "error".
"""
import logging

from fastapi import APIRouter, BackgroundTasks, HTTPException, UploadFile, File

from app.config import get_settings
from app.services import document_service, job_service
from app.services.ai_service import AIResponseError, get_ai_provider
from app.services.job_service import JobStatus
from app.utils.validators import ValidationError, validate_upload
from app.schemas.summary import AnalyzeResponse

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/health")
def health_check():
    settings = get_settings()
    return {
        "status": "ok",
        "ai_mode": settings.ai_mode,
        "max_file_size_mb": settings.max_file_size_mb,
    }


def _run_analysis(job_id: str, filename: str, doc_type: str, raw_bytes: bytes) -> None:
    """
    Runs the slow part (extraction + AI analysis) in the background.
    This is a plain sync function, so FastAPI/Starlette runs it in a
    threadpool automatically and won't block the event loop.
    """
    job_service.mark_processing(job_id)
    settings = get_settings()

    try:
        extracted = document_service.extract_document(filename, doc_type, raw_bytes)
    except document_service.DocumentProcessingError as exc:
        job_service.mark_error(job_id, str(exc), status_code=422)
        return
    except Exception:
        logger.exception("Unexpected error during document extraction")
        job_service.mark_error(
            job_id,
            "Something went wrong while processing this document. Please try again.",
            status_code=500,
        )
        return

    provider = get_ai_provider()
    try:
        analysis = provider.analyze_document(extracted.text)
    except AIResponseError as exc:
        job_service.mark_error(job_id, str(exc), status_code=502)
        return
    except Exception:
        logger.exception("Unexpected error calling the AI provider")
        job_service.mark_error(
            job_id,
            "The AI service is temporarily unavailable. Please try again shortly.",
            status_code=502,
        )
        return

    document_id = document_service.store_document(extracted)

    result = AnalyzeResponse(
        filename=extracted.filename,
        file_type=extracted.file_type,
        stats=extracted.stats,
        analysis=analysis,
        ai_mode=settings.ai_mode,
        document_id=document_id,
    )
    job_service.mark_done(job_id, result)


@router.post("/documents/analyze")
async def start_analyze_document(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """Validates the upload (fast) and schedules the slow work in the background.
    Returns immediately with a job_id for polling."""
    try:
        doc_type, raw_bytes = await validate_upload(file)
    except ValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    job_id = job_service.create_job()
    background_tasks.add_task(_run_analysis, job_id, file.filename, doc_type, raw_bytes)

    return {"job_id": job_id, "status": JobStatus.PENDING}


@router.get("/documents/analyze/status/{job_id}")
def get_analyze_status(job_id: str):
    job = job_service.get_job(job_id)
    if job is None:
        raise HTTPException(
            status_code=404,
            detail="This analysis job was not found. It may have expired — please upload again.",
        )

    if job.status == JobStatus.ERROR:
        raise HTTPException(status_code=job.error_status_code, detail=job.error_detail)

    if job.status == JobStatus.DONE:
        return {"status": JobStatus.DONE, "result": job.result}

    return {"status": job.status}