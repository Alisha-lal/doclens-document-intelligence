"""OCR extraction for images and scanned PDF pages, via Tesseract."""
import io
import logging

import pytesseract
from PIL import Image, UnidentifiedImageError

logger = logging.getLogger(__name__)


class OcrError(Exception):
    """Raised when an image cannot be read or OCR produces no output."""


def load_image(raw_bytes: bytes) -> Image.Image:
    try:
        image = Image.open(io.BytesIO(raw_bytes))
        image.load()
        return image
    except UnidentifiedImageError as exc:
        raise OcrError("This image could not be read. Try a different file.") from exc


def run_ocr(image: Image.Image) -> str:
    """Runs Tesseract OCR on a PIL image and returns cleaned text."""
    # Normalize mode: Tesseract works most reliably on RGB/L images.
    if image.mode not in ("RGB", "L"):
        image = image.convert("RGB")
    try:
        text = pytesseract.image_to_string(image)
    except pytesseract.TesseractError as exc:
        logger.exception("Tesseract failed to process the image")
        raise OcrError("OCR failed while processing this document.") from exc
    return text.strip()


def extract_from_image_bytes(raw_bytes: bytes) -> str:
    """Full pipeline for a standalone image upload (PNG/JPG)."""
    image = load_image(raw_bytes)
    text = run_ocr(image)
    if not text:
        raise OcrError(
            "We couldn't extract readable text from this document. Try uploading a clearer scan."
        )
    return text
