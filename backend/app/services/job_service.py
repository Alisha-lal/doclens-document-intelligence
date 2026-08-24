"""
Tracks async document-analysis jobs in memory, following the same
short-lived, single-process pattern as document_service's document store.

Why: OCR + the Gemini call can take well past typical proxy timeouts
(e.g. Render's), which turns a slow-but-successful request into a
502/CORS-looking failure in the browser. Instead, /documents/analyze
returns a job_id immediately, does the real work in a background task,
and the frontend polls /documents/analyze/status/{job_id} for the result.
"""
import time
import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Any

JOB_TTL_SECONDS = 60 * 30  # 30 minutes, matches document_service's TTL


class JobStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    DONE = "done"
    ERROR = "error"


@dataclass
class _Job:
    status: JobStatus = JobStatus.PENDING
    result: Any = None
    error_detail: str | None = None
    error_status_code: int = 500
    created_at: float = field(default_factory=time.time)


_JOBS: dict[str, _Job] = {}


def _evict_expired() -> None:
    now = time.time()
    expired = [key for key, val in _JOBS.items() if now - val.created_at > JOB_TTL_SECONDS]
    for key in expired:
        _JOBS.pop(key, None)


def create_job() -> str:
    """Creates a new pending job and returns its id."""
    _evict_expired()
    job_id = uuid.uuid4().hex
    _JOBS[job_id] = _Job()
    return job_id


def mark_processing(job_id: str) -> None:
    job = _JOBS.get(job_id)
    if job:
        job.status = JobStatus.PROCESSING


def mark_done(job_id: str, result: Any) -> None:
    job = _JOBS.get(job_id)
    if job:
        job.status = JobStatus.DONE
        job.result = result


def mark_error(job_id: str, detail: str, status_code: int = 500) -> None:
    job = _JOBS.get(job_id)
    if job:
        job.status = JobStatus.ERROR
        job.error_detail = detail
        job.error_status_code = status_code


def get_job(job_id: str) -> _Job | None:
    _evict_expired()
    return _JOBS.get(job_id)