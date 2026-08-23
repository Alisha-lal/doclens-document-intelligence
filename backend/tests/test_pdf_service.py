import fitz
import pytest

from app.services.pdf_service import PdfExtractionError, extract_pdf


def _make_text_pdf(text: str) -> bytes:
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((72, 72), text)
    raw = doc.tobytes()
    doc.close()
    return raw


def test_extract_pdf_native_text():
    text = " ".join(["This is a real sentence with enough words to count as text."] * 3)
    pdf_bytes = _make_text_pdf(text)
    extracted_text, page_count, method = extract_pdf(pdf_bytes)
    assert page_count == 1
    assert method == "pdf_text"
    assert "real sentence" in extracted_text


def test_extract_pdf_rejects_corrupted_file():
    with pytest.raises(PdfExtractionError):
        extract_pdf(b"not a real pdf")


def test_extract_pdf_falls_back_to_ocr_for_blank_page():
    # A page with no text at all should trigger the OCR fallback path
    # rather than raising, since extract_pdf only raises for files that
    # cannot be opened/parsed.
    doc = fitz.open()
    doc.new_page()
    raw = doc.tobytes()
    doc.close()
    extracted_text, page_count, method = extract_pdf(raw)
    assert page_count == 1
    assert method == "ocr"
    assert extracted_text == ""
