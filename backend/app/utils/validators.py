"""Upload validation helpers, kept separate from route handlers."""
from fastapi import UploadFile

from app.config import get_settings

ALLOWED_CONTENT_TYPES = {
    "application/pdf": "pdf",
    "image/png": "image",
    "image/jpeg": "image",
}

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}


class ValidationError(Exception):
    """Raised when an uploaded file fails validation. Carries a user-safe message."""


def validate_extension(filename: str) -> str:
    """Returns 'pdf' or 'image' based on file extension, or raises ValidationError."""
    lower = filename.lower()
    ext = "." + lower.rsplit(".", 1)[-1] if "." in lower else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise ValidationError(
            "Unsupported file type. Please upload a PDF, PNG, or JPG/JPEG file."
        )
    return "pdf" if ext == ".pdf" else "image"


def validate_content_type(content_type: str | None) -> None:
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise ValidationError(
            "Unsupported file type. Please upload a PDF, PNG, or JPG/JPEG file."
        )


def validate_size(size_bytes: int) -> None:
    settings = get_settings()
    if size_bytes <= 0:
        raise ValidationError("The uploaded file appears to be empty.")
    if size_bytes > settings.max_file_size_bytes:
        raise ValidationError(
            f"File is too large. Maximum allowed size is {settings.max_file_size_mb}MB."
        )


async def validate_upload(file: UploadFile) -> tuple[str, bytes]:
    """
    Runs all upload validations and returns (doc_type, raw_bytes).
    doc_type is 'pdf' or 'image'.
    """
    if not file.filename:
        raise ValidationError("No file was provided.")

    doc_type = validate_extension(file.filename)
    validate_content_type(file.content_type)

    raw_bytes = await file.read()
    validate_size(len(raw_bytes))

    return doc_type, raw_bytes
