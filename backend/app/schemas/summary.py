"""Schemas for structured AI analysis output and the API response envelope."""
from pydantic import BaseModel, Field

from app.schemas.document import DocumentStats


class KeyInsights(BaseModel):
    """A small, fixed set of headline insights (not a wall of text)."""

    main_objective: str = Field(..., description="What the document is trying to achieve")
    major_finding: str = Field(..., description="The most important finding or claim")
    important_conclusion: str = Field(..., description="The document's conclusion, if any")
    important_consideration: str = Field(
        ..., description="A caveat, risk, or consideration worth flagging"
    )


class DocumentAnalysis(BaseModel):
    """Structured output requested from the AI model in a single call."""

    title: str = Field(..., description="A concise, descriptive title for the document")
    short_summary: str = Field(..., description="~30-60 word summary")
    medium_summary: str = Field(..., description="~100-150 word summary")
    long_summary: str = Field(..., description="~250-400 word summary")
    key_points: list[str] = Field(default_factory=list)
    main_ideas: list[str] = Field(default_factory=list)
    key_insights: KeyInsights
    topics: list[str] = Field(default_factory=list, description="3-8 topic tags")
    important_entities: list[str] = Field(default_factory=list)
    improvement_suggestions: list[str] = Field(default_factory=list)


class AnalyzeResponse(BaseModel):
    """Full response returned by POST /api/documents/analyze."""

    filename: str
    file_type: str
    stats: DocumentStats
    analysis: DocumentAnalysis
    ai_mode: str = Field(..., description="'gemini' or 'mock'")
    document_id: str = Field(..., description="Opaque id used for follow-up Ask/Explain calls")
