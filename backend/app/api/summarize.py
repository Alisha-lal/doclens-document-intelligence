"""Explain Simply (ELI5) endpoint. Named summarize.py as it's an alternate
grounded summary of the same document, generated on demand."""
import logging

from fastapi import APIRouter, HTTPException

from app.config import get_settings
from app.services import document_service
from app.services.ai_service import get_ai_provider
from app.schemas.question import ExplainRequest, ExplainResponse

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/documents/explain", response_model=ExplainResponse)
async def explain_simply(payload: ExplainRequest):
    document = document_service.get_document(payload.document_id)
    if document is None:
        raise HTTPException(
            status_code=404,
            detail="This document is no longer available. Please upload it again.",
        )

    provider = get_ai_provider()
    try:
        explanation = provider.explain_simply(document.text)
    except Exception:
        logger.exception("Unexpected error generating a simple explanation")
        raise HTTPException(
            status_code=502,
            detail="The AI service is temporarily unavailable. Please try again shortly.",
        )

    return ExplainResponse(explanation=explanation, ai_mode=get_settings().ai_mode)
