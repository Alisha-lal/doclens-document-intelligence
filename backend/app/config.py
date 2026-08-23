import os
from functools import lru_cache

from dotenv import load_dotenv


load_dotenv()


class Settings:
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    gemini_model: str = os.getenv(
        "GEMINI_MODEL",
        "gemini-3.7-flash",
    )

    frontend_url: str = os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173",
    )

    max_file_size_mb: int = int(
        os.getenv("MAX_FILE_SIZE_MB", "15")
    )

    request_timeout_seconds: int = int(
        os.getenv("REQUEST_TIMEOUT_SECONDS", "60")
    )

    @property
    def max_file_size_bytes(self) -> int:
        return self.max_file_size_mb * 1024 * 1024

    @property
    def allowed_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.frontend_url.split(",")
            if origin.strip()
        ]

    @property
    def ai_mode(self) -> str:
        return "gemini" if self.gemini_api_key else "mock"


@lru_cache
def get_settings() -> Settings:
    return Settings()