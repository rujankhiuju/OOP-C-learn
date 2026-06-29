from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime


class TranscribeURLRequest(BaseModel):
    url: str = Field(..., description="URL to an audio/video file or page")
    language: Optional[str] = Field(
        None, description="Language code (e.g., 'en', 'hi', 'de'). Auto-detect if omitted."
    )
    word_timestamps: bool = Field(False, description="Include word-level timestamps")
    diarization: bool = Field(False, description="Enable speaker diarization")
    translate: bool = Field(False, description="Translate to English")


class TaskResponse(BaseModel):
    id: str
    status: str
    filename: str
    media_type: Optional[str] = None
    duration: Optional[float] = None
    detected_language: Optional[str] = None
    progress: float = 0.0
    error: Optional[str] = None
    source_type: Optional[str] = None
    source_url: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class Segment(BaseModel):
    start: float
    end: float
    text: str
    speaker: Optional[str] = None
    words: Optional[list[dict[str, Any]]] = None


class TranscriptResult(BaseModel):
    task_id: str
    status: str
    filename: str
    duration: Optional[float] = None
    detected_language: Optional[str] = None
    segments: list[Segment] = []
    text: str = ""


class ModelInfo(BaseModel):
    name: str
    loaded: bool
    device: str
    compute_type: str


class ModelLoadRequest(BaseModel):
    model: str = Field(
        ..., description="Whisper model size: tiny, base, small, medium, large-v3"
    )
