from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["ai_mode"] in {"gemini", "mock"}


def test_analyze_rejects_unsupported_file_type():
    response = client.post(
        "/api/documents/analyze",
        files={"file": ("notes.txt", b"hello world", "text/plain")},
    )
    assert response.status_code == 400


def test_analyze_rejects_empty_file():
    response = client.post(
        "/api/documents/analyze",
        files={"file": ("empty.png", b"", "image/png")},
    )
    assert response.status_code == 400


def test_ask_returns_404_for_unknown_document():
    response = client.post(
        "/api/documents/ask",
        json={"document_id": "does-not-exist", "question": "What is this about?"},
    )
    assert response.status_code == 404
