from app.utils.text_utils import (
    chunk_text,
    estimated_reading_minutes,
    has_meaningful_text,
    normalize_text,
    word_count,
)


def test_normalize_text_collapses_blank_lines():
    text = "Para one.\n\n\n\n\nPara two."
    assert normalize_text(text) == "Para one.\n\nPara two."


def test_word_count_basic():
    assert word_count("one two three") == 3
    assert word_count("") == 0


def test_estimated_reading_minutes_uses_200_wpm():
    text = " ".join(["word"] * 400)
    assert estimated_reading_minutes(text) == 2.0


def test_has_meaningful_text_threshold():
    assert has_meaningful_text("just a few words here") is False
    assert has_meaningful_text(" ".join(["word"] * 20)) is True


def test_chunk_text_produces_overlapping_chunks():
    text = " ".join(f"w{i}" for i in range(500))
    chunks = chunk_text(text, chunk_size_words=100, overlap_words=20)
    assert len(chunks) > 1
    # Each chunk should have at most chunk_size_words words
    assert all(len(c.split()) <= 100 for c in chunks)


def test_chunk_text_empty_input():
    assert chunk_text("") == []
