# DocLens

**Understand any document in seconds.**

## DocLens — Document Intelligence

### Live Application

https://doclens-document-intelligence.vercel.app

DocLens is an AI-powered document intelligence assistant that accepts PDFs and images, extracts their content, generates grounded summaries, surfaces key insights and topics, and allows users to ask questions about the uploaded document.

The application is designed as a focused MVP with an emphasis on clean architecture, reliable document processing, grounded AI responses, and a simple user experience.

---

## Problem

Reading and understanding long documents such as reports, research papers, scanned forms, and contracts can be time-consuming.

Many document tools also struggle with scanned documents because they contain images rather than machine-readable text.

DocLens addresses this by providing a single workflow for both digital and scanned documents, combining PDF extraction, OCR, AI summarization, and document-based question answering.

---

## Solution

DocLens accepts PDF and image files, validates the upload, extracts the document text, automatically performs OCR when required, and sends the extracted content to Gemini for structured analysis.

The application generates:

- Short summary
- Medium summary
- Long summary
- Key points
- Main ideas
- Key insights
- Topics
- Important entities
- Improvement suggestions

Users can also:

- Ask questions about the document
- Request a simple/ELI5 explanation
- View document statistics
- Understand how the document was extracted

All AI responses are grounded in the supplied document content.

---

## Features

- Drag-and-drop or file-picker upload
- PDF support
- PNG/JPG/JPEG image support
- Automatic OCR fallback for scanned PDFs
- OCR for standalone images using Tesseract
- Reading-order-aware PDF text extraction using PyMuPDF
- Document statistics:
  - Pages
  - Words
  - Characters
  - Estimated reading time
- AI summaries at three lengths:
  - Short
  - Medium
  - Long
- Key points and main ideas
- Key insights:
  - Main objective
  - Major finding
  - Important conclusion
  - Important consideration
- Topic and entity extraction
- AI-generated improvement suggestions
- Ask Your Document
- Explain Simply (ELI5)
- Grounded responses based on document content
- Friendly error handling
- Loading and processing states
- Fully responsive UI
- Mock AI mode for testing without a Gemini API key

---

## Architecture

```text
                  ┌──────────────────────┐
                  │      React UI        │
                  │        Vite          │
                  └──────────┬───────────┘
                             │
                             │ HTTP / JSON
                             ▼
                  ┌──────────────────────┐
                  │       FastAPI        │
                  │        API           │
                  └──────────┬───────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
       ┌────────────┐ ┌────────────┐ ┌─────────────┐
       │  PyMuPDF   │ │ Tesseract  │ │   Gemini    │
       │ PDF Parser │ │    OCR     │ │     AI      │
       └────────────┘ └────────────┘ └─────────────┘
