"""Health check and the main document analyze endpoint."""
import logging

from fastapi import APIRouter, HTTPException, UploadFile, File

from app.config import get_settings
from app.services import document_service
from app.services.ai_service import AIResponseError, get_ai_provider
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


@router.post("/documents/analyze", response_model=AnalyzeResponse)
async def analyze_document(file: UploadFile = File(...)):
    # 1. Validate the upload
    try:
        doc_type, raw_bytes = await validate_upload(file)
    except ValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    # 2. Extract text (PDF text extraction and/or OCR happens inside here)
    try:
        extracted = document_service.extract_document(file.filename, doc_type, raw_bytes)
    except document_service.DocumentProcessingError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception:
        logger.exception("Unexpected error during document extraction")
        raise HTTPException(
            status_code=500,
            detail="Something went wrong while processing this document. Please try again.",
        )

    # 3. Run the single structured AI analysis call
    provider = get_ai_provider()
    settings = get_settings()
    try:
        analysis = provider.analyze_document(extracted.text)
    except AIResponseError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception:
        logger.exception("Unexpected error calling the AI provider")
        raise HTTPException(
            status_code=502,
            detail="The AI service is temporarily unavailable. Please try again shortly.",
        )

    # 4. Store the extracted text briefly for follow-up Ask/Explain calls
    document_id = document_service.store_document(extracted)

    return AnalyzeResponse(
        filename=extracted.filename,
        file_type=extracted.file_type,
        stats=extracted.stats,
        analysis=analysis,
        ai_mode=settings.ai_mode,
        document_id=document_id,
    )
