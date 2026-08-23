"""Schemas describing extracted document data and its statistics."""
from typing import Literal
from pydantic import BaseModel, Field

ExtractionMethod = Literal["pdf_text", "ocr", "hybrid"]


class DocumentStats(BaseModel):
    """Locally-computed statistics. Never asked of the AI model."""

    page_count: int = Field(..., description="Number of pages / images processed")
    word_count: int = Field(..., description="Total extracted word count")
    character_count: int = Field(..., description="Total extracted character count")
    estimated_reading_minutes: float = Field(
        ..., description="Estimated reading time, assuming 200 words/minute"
    )
    extraction_method: ExtractionMethod


class ExtractedDocument(BaseModel):
    """Internal representation of an extracted document, used across services."""

    filename: str
    file_type: str
    text: str
    stats: DocumentStats
