from app.services.analysis_service import select_relevant_chunks

DOCUMENT = (
    "The quarterly report shows revenue growth of 12 percent. "
    "Marketing spend increased significantly this quarter. " * 20
    + "The risk section discusses supply chain disruptions and their impact on delivery timelines. "
    * 20
)


def test_select_relevant_chunks_returns_results():
    chunks = select_relevant_chunks(DOCUMENT, "What risks are mentioned?")
    assert len(chunks) > 0
    assert any("risk" in c.lower() or "supply" in c.lower() for c in chunks)


def test_select_relevant_chunks_handles_empty_document():
    assert select_relevant_chunks("", "What is this about?") == []


def test_select_relevant_chunks_handles_generic_question():
    chunks = select_relevant_chunks(DOCUMENT, "???")
    assert len(chunks) > 0  # falls back to first chunks rather than erroring
