import pytest

from app.utils.validators import ValidationError, validate_extension, validate_size


def test_validate_extension_accepts_pdf():
    assert validate_extension("report.pdf") == "pdf"


def test_validate_extension_accepts_images():
    assert validate_extension("scan.PNG") == "image"
    assert validate_extension("photo.jpg") == "image"
    assert validate_extension("photo.jpeg") == "image"


def test_validate_extension_rejects_unsupported():
    with pytest.raises(ValidationError):
        validate_extension("archive.zip")


def test_validate_extension_rejects_no_extension():
    with pytest.raises(ValidationError):
        validate_extension("noextension")


def test_validate_size_rejects_empty():
    with pytest.raises(ValidationError):
        validate_size(0)


def test_validate_size_accepts_reasonable_size():
    validate_size(1024 * 1024)  # should not raise
