"""
Lightweight lexical retrieval for the "Ask Your Document" feature.

INTENTIONALLY NOT a vector database. This is an 8-hour MVP that answers
questions about a single, already-loaded document. A full semantic
retrieval pipeline (embeddings + a vector index) would add real value if
the product needed to search across many large documents, but for one
document at a time, scoring chunks by lexical word-overlap is simple,
fast, dependency-free, and good enough.

If this product grew to support large documents or cross-document search,
the natural next step would be swapping `select_relevant_chunks` for an
embedding-based nearest-neighbor lookup (e.g. via a vector DB) without
touching the rest of the Q&A flow.
"""
import re
from collections import Counter

from app.utils.text_utils import chunk_text

_STOPWORDS = {
    "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
    "of", "to", "in", "on", "at", "for", "with", "and", "or", "but", "if",
    "what", "when", "where", "who", "why", "how", "does", "do", "did",
    "this", "that", "these", "those", "it", "its", "as", "by", "from",
    "about", "into", "than", "then", "so", "can", "could", "would", "should",
}


def _tokenize(text: str) -> list[str]:
    words = re.findall(r"[a-zA-Z0-9']+", text.lower())
    return [w for w in words if w not in _STOPWORDS and len(w) > 1]


def select_relevant_chunks(document_text: str, question: str, top_k: int = 4) -> list[str]:
    """
    Splits the document into chunks and returns the `top_k` chunks with the
    highest lexical overlap with the question (simple term-frequency scoring).
    """
    chunks = chunk_text(document_text)
    if not chunks:
        return []

    question_terms = Counter(_tokenize(question))
    if not question_terms:
        # No usable terms in the question; fall back to the first chunks.
        return chunks[:top_k]

    scored: list[tuple[float, int, str]] = []
    for idx, chunk in enumerate(chunks):
        chunk_terms = Counter(_tokenize(chunk))
        score = sum(count * chunk_terms.get(term, 0) for term, count in question_terms.items())
        scored.append((score, idx, chunk))

    scored.sort(key=lambda item: (-item[0], item[1]))

    top = [chunk for score, _, chunk in scored[:top_k] if score > 0]
    if not top:
        # Nothing matched lexically; still give the model *something* rather
        # than nothing, using the first chunks in document order.
        top = chunks[:top_k]
    return top
