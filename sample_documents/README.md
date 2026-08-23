# Sample / Test Documents

To keep this repository free of copyrighted material, no sample PDFs or
images are bundled here. Instead, use these quick recipes to generate the
four test cases DocLens is designed to handle:

## 1. Normal text PDF

Any PDF with selectable text works. Quick options:
- Export any Word/Google Doc as PDF.
- Print any webpage to PDF from your browser.
- Generate one programmatically:

```python
import fitz  # PyMuPDF
doc = fitz.open()
page = doc.new_page()
page.insert_text((72, 72), "Your test content here...")
doc.save("normal_text.pdf")
```

## 2. Scanned image (tests the OCR path)

Take a photo of a printed page, or a screenshot of a page of text saved
as PNG/JPG. Any image with legible printed text will exercise the OCR
pipeline (`pytesseract` + Tesseract).

## 3. Poor / empty document (tests error handling)

- A PDF with a single blank page (no text, no scanned image) — DocLens
  should return a friendly "couldn't extract readable text" error.
- A heavily blurred or very low-resolution photo of text — OCR will
  likely return little or nothing, triggering the same error path.

## 4. Unsupported file (tests validation)

Any non-PDF, non-image file — a `.txt`, `.docx`, or `.zip` — should be
rejected immediately by both the frontend and backend with a clear
"unsupported file type" message.
