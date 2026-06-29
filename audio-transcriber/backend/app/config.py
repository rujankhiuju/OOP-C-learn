import os
from pathlib import Path
from typing import Optional


class Settings:
    APP_NAME: str = "Audio Transcriber"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"

    # Directories
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    UPLOAD_DIR: Path = Path(os.getenv("UPLOAD_DIR", str(BASE_DIR / "uploads")))
    OUTPUT_DIR: Path = Path(os.getenv("OUTPUT_DIR", str(BASE_DIR / "outputs")))
    MODEL_DIR: Optional[Path] = (
        Path(os.getenv("MODEL_DIR")) if os.getenv("MODEL_DIR") else None
    )

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", f"sqlite:///{BASE_DIR / 'transcriber.db'}"
    )

    # ASR Model
    WHISPER_MODEL: str = os.getenv("WHISPER_MODEL", "large-v3")
    WHISPER_DEVICE: str = os.getenv("WHISPER_DEVICE", "auto")
    WHISPER_COMPUTE_TYPE: str = os.getenv("WHISPER_COMPUTE_TYPE", "auto")

    # Diarization
    DIARIZATION_ENABLED: bool = (
        os.getenv("DIARIZATION_ENABLED", "false").lower() == "true"
    )
    HUGGINGFACE_TOKEN: Optional[str] = os.getenv("HUGGINGFACE_TOKEN")

    # Limits
    MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "500"))
    MAX_FILE_SIZE_BYTES: int = MAX_FILE_SIZE_MB * 1024 * 1024
    MAX_URL_DOWNLOAD_SIZE_MB: int = int(
        os.getenv("MAX_URL_DOWNLOAD_SIZE_MB", "200")
    )
    REQUEST_TIMEOUT_SECONDS: int = int(
        os.getenv("REQUEST_TIMEOUT_SECONDS", "30")
    )

    # Allowed domains for URL fetching (empty = allow all except private)
    ALLOWED_DOMAINS: Optional[list[str]] = None  # e.g. ["youtube.com", "vimeo.com"]

    @property
    def whisper_model_path(self) -> Optional[str]:
        return str(self.MODEL_DIR) if self.MODEL_DIR else None


settings = Settings()
