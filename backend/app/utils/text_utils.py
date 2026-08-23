"""
Text normalization, statistics, and lightweight chunking utilities.

These are pure functions with no external dependencies so they're easy
to unit test in isolation.
"""
import re

WORDS_PER_MINUTE = 200  # documented assumption used for reading-time estimates


def normalize_text(text: str) -> str:
    """Collapses excess whitespace while preserving paragraph breaks."""
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    # Collapse 3+ blank lines down to a single paragraph break
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Collapse runs of spaces/tabs
    text = re.sub(r"[ \t]{2,}", " ", text)
    return text.strip()


def word_count(text: str) -> int:
    return len(text.split()) if text.strip() else 0


def character_count(text: str) -> int:
    return len(text)


def estimated_reading_minutes(text: str) -> float:
    words = word_count(text)
    return round(words / WORDS_PER_MINUTE, 1) if words else 0.0


def has_meaningful_text(text: str, min_words: int = 15) -> bool:
    """
    Heuristic used to decide whether a PDF page needs OCR.
    A page with only a handful of words (e.g. a header) is treated as scanned.
    """
    return word_count(text) >= min_words


def chunk_text(text: str, chunk_size_words: int = 180, overlap_words: int = 30) -> list[str]:
    """
    Splits text into overlapping word-based chunks for lightweight retrieval.

    Overlap avoids losing an answer that straddles a chunk boundary.
    This is intentionally simple (no sentence-boundary awareness) since
    it only needs to support single-document, in-memory Q&A.
    """
    words = text.split()
    if not words:
        return []

    chunks = []
    step = max(chunk_size_words - overlap_words, 1)
    for start in range(0, len(words), step):
        chunk_words = words[start : start + chunk_size_words]
        if not chunk_words:
            break
        chunks.append(" ".join(chunk_words))
        if start + chunk_size_words >= len(words):
            break
    return chunks
