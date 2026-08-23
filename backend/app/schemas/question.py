"""Schemas for the Ask Document (Q&A) and Explain Simply (ELI5) endpoints."""
from pydantic import BaseModel, Field


class AskRequest(BaseModel):
    document_id: str
    question: str = Field(..., min_length=3, max_length=500)


class AskResponse(BaseModel):
    answer: str
    used_chunks: int = Field(..., description="Number of text chunks sent to the model as context")
    ai_mode: str


class ExplainRequest(BaseModel):
    document_id: str


class ExplainResponse(BaseModel):
    explanation: str
    ai_mode: str
