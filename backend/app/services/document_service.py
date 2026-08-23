"""
Orchestrates document extraction and holds a short-lived, in-memory store
of extracted text keyed by document_id.

Why in-memory instead of a database:
The assignment doesn't require persistent history across sessions, and a
single-process FastAPI app can safely hold a handful of recently-analyzed
documents in memory. Entries expire after DOCUMENT_TTL_SECONDS so nothing
lingers indefinitely. This is explicitly not meant to survive a restart
or scale across multiple backend processes.
"""
import time
import uuid
from dataclasses import dataclass, field

from app.schemas.document import DocumentStats, ExtractedDocument
from app.services.ocr_service import OcrError, extract_from_image_bytes
from app.services.pdf_service import PdfExtractionError, extract_pdf
from app.utils.text_utils import (
    character_count,
    estimated_reading_minutes,
    normalize_text,
    word_count,
)

DOCUMENT_TTL_SECONDS = 60 * 30  # 30 minutes


class DocumentProcessingError(Exception):
    """User-safe error raised when extraction fails for any reason."""


@dataclass
class _StoredDocument:
    document: ExtractedDocument
    created_at: float = field(default_factory=time.time)


_STORE: dict[str, _StoredDocument] = {}


def _evict_expired() -> None:
    now = time.time()
    expired = [key for key, val in _STORE.items() if now - val.created_at > DOCUMENT_TTL_SECONDS]
    for key in expired:
        _STORE.pop(key, None)


def extract_document(filename: str, doc_type: str, raw_bytes: bytes) -> ExtractedDocument:
    """
    Routes a validated upload to the right extractor and computes statistics.
    Raises DocumentProcessingError with a user-safe message on failure.
    """
    try:
        if doc_type == "pdf":
            raw_text, page_count, method = extract_pdf(raw_bytes)
        else:
            raw_text = extract_from_image_bytes(raw_bytes)
            page_count, method = 1, "ocr"
    except PdfExtractionError as exc:
        raise DocumentProcessingError(str(exc)) from exc
    except OcrError as exc:
        raise DocumentProcessingError(str(exc)) from exc

    text = normalize_text(raw_text)

    if not text:
        raise DocumentProcessingError(
            "We couldn't extract readable text from this document. Try uploading a clearer scan."
        )

    stats = DocumentStats(
        page_count=page_count,
        word_count=word_count(text),
        character_count=character_count(text),
        estimated_reading_minutes=estimated_reading_minutes(text),
        extraction_method=method,
    )

    file_type = "pdf" if doc_type == "pdf" else "image"
    return ExtractedDocument(filename=filename, file_type=file_type, text=text, stats=stats)


def store_document(document: ExtractedDocument) -> str:
    """Stores a document in memory and returns its id for follow-up requests."""
    _evict_expired()
    document_id = uuid.uuid4().hex
    _STORE[document_id] = _StoredDocument(document=document)
    return document_id


def get_document(document_id: str) -> ExtractedDocument | None:
    _evict_expired()
    entry = _STORE.get(document_id)
    return entry.document if entry else None
