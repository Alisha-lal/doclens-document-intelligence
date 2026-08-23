"""
PDF text extraction using PyMuPDF (fitz).

Strategy per page:
1. Try native text extraction, using "blocks" mode so text comes out in
   reading order (top-to-bottom, left-to-right) rather than however the
   PDF's internal object order happens to be.
2. If a page has little/no extractable text, treat it as a scanned page:
   render it to an image and hand it to the OCR service.

The document's overall `extraction_method` reflects what actually happened:
- "pdf_text": every page had native text
- "ocr":      every page needed OCR
- "hybrid":   a mix of both
"""
import io
import logging

import fitz  # PyMuPDF
from PIL import Image

from app.services.ocr_service import run_ocr
from app.utils.text_utils import has_meaningful_text

logger = logging.getLogger(__name__)

# Render scale for pages that need OCR. 2x roughly approximates 144 DPI,
# a reasonable balance between OCR accuracy and processing time.
OCR_RENDER_SCALE = 2.0


class PdfExtractionError(Exception):
    """Raised when a PDF cannot be opened or parsed at all."""


def _extract_page_text_in_reading_order(page: "fitz.Page") -> str:
    """Extracts text using block layout, sorted top-to-bottom then left-to-right."""
    blocks = page.get_text("blocks")
    # Each block: (x0, y0, x1, y1, text, block_no, block_type)
    sorted_blocks = sorted(blocks, key=lambda b: (round(b[1], 1), round(b[0], 1)))
    parts = [b[4].strip() for b in sorted_blocks if b[4] and b[4].strip()]
    return "\n\n".join(parts)


def _render_page_to_image(page: "fitz.Page") -> Image.Image:
    matrix = fitz.Matrix(OCR_RENDER_SCALE, OCR_RENDER_SCALE)
    pixmap = page.get_pixmap(matrix=matrix)
    return Image.open(io.BytesIO(pixmap.tobytes("png")))


def extract_pdf(raw_bytes: bytes) -> tuple[str, int, str]:
    """
    Extracts text from a PDF.

    Returns (full_text, page_count, extraction_method).
    Raises PdfExtractionError if the file cannot be parsed at all.
    """
    try:
        doc = fitz.open(stream=raw_bytes, filetype="pdf")
    except Exception as exc:  # PyMuPDF raises its own exception types
        raise PdfExtractionError("This PDF could not be opened. It may be corrupted.") from exc

    if doc.page_count == 0:
        raise PdfExtractionError("This PDF has no pages.")

    page_texts: list[str] = []
    used_pdf_text = False
    used_ocr = False

    for page in doc:
        native_text = _extract_page_text_in_reading_order(page)

        if has_meaningful_text(native_text):
            page_texts.append(native_text)
            used_pdf_text = True
            continue

        # Fall back to OCR for this page
        try:
            image = _render_page_to_image(page)
            ocr_text = run_ocr(image)
            used_ocr = True
            # Combine any sparse native text (e.g. a page number) with OCR output
            combined = "\n".join(t for t in [native_text, ocr_text] if t.strip())
            page_texts.append(combined)
        except Exception:
            logger.exception("OCR failed for a page; continuing with remaining pages")
            page_texts.append(native_text)  # keep whatever little text existed

    page_count = doc.page_count
    doc.close()

    if used_pdf_text and used_ocr:
        method = "hybrid"
    elif used_ocr:
        method = "ocr"
    else:
        method = "pdf_text"

    full_text = "\n\n".join(t for t in page_texts if t.strip())
    return full_text, page_count, method
