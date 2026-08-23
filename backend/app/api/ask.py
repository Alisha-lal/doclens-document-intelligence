"""Ask Your Document endpoint: lightweight retrieval + grounded Q&A."""
import logging

from fastapi import APIRouter, HTTPException

from app.config import get_settings
from app.services import document_service
from app.services.ai_service import get_ai_provider
from app.services.analysis_service import select_relevant_chunks
from app.schemas.question import AskRequest, AskResponse

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/documents/ask", response_model=AskResponse)
async def ask_document(payload: AskRequest):
    document = document_service.get_document(payload.document_id)
    if document is None:
        raise HTTPException(
            status_code=404,
            detail="This document is no longer available. Please upload it again.",
        )

    chunks = select_relevant_chunks(document.text, payload.question)

    provider = get_ai_provider()
    try:
        answer = provider.answer_question(chunks, payload.question)
    except Exception:
        logger.exception("Unexpected error answering a document question")
        raise HTTPException(
            status_code=502,
            detail="The AI service is temporarily unavailable. Please try again shortly.",
        )

    return AskResponse(answer=answer, used_chunks=len(chunks), ai_mode=get_settings().ai_mode)
