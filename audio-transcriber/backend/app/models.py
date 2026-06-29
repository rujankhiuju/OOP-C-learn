import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Float, Enum as SAEnum, Text, DateTime

from app.database import Base

import enum


class TaskStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


def generate_uuid() -> str:
    return str(uuid.uuid4())


class TranscriptionTask(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, default=generate_uuid)
    status = Column(SAEnum(TaskStatus), default=TaskStatus.PENDING, nullable=False)
    filename = Column(String, nullable=False)
    media_type = Column(String, nullable=True)
    duration = Column(Float, nullable=True)
    detected_language = Column(String, nullable=True)
    progress = Column(Float, default=0.0)
    error = Column(Text, nullable=True)
    source_type = Column(String, nullable=True)  # "upload" or "url"
    source_url = Column(Text, nullable=True)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    completed_at = Column(DateTime, nullable=True)
