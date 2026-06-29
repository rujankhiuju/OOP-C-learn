import uuid
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import TranscriptionTask
from app.schemas import TranscribeURLRequest, TaskResponse
from app.services.media import SUPPORTED_EXTENSIONS
from app.services.task_manager import start_task
from app.config import settings
from app.utils.security import sanitize_filename

router = APIRouter(prefix="/api", tags=["transcribe"])

SUPPORTED_STR = ", ".join(sorted(SUPPORTED_EXTENSIONS))


@router.post("/transcribe", response_model=TaskResponse, status_code=201)
async def transcribe_upload(
    file: UploadFile = File(...),
    language: str = Form(None),
    db: Session = Depends(get_db),
):
    if not file.filename:
        raise HTTPException(400, "No file provided")

    ext = Path(file.filename).suffix.lower()
    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            400,
            f"Unsupported file type '{ext}'. Supported: {SUPPORTED_STR}",
        )

    content = await file.read()
    if len(content) > settings.MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            413,
            f"File exceeds {settings.MAX_FILE_SIZE_MB}MB limit",
        )

    safe_name = f"{uuid.uuid4().hex}{ext}"
    dest = settings.UPLOAD_DIR / safe_name
    with open(dest, "wb") as f:
        f.write(content)

    task = TranscriptionTask(
        filename=safe_name,
        source_type="upload",
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    start_task(task.id)

    return task


@router.post("/transcribe-url", response_model=TaskResponse, status_code=201)
async def transcribe_url(
    req: TranscribeURLRequest,
    db: Session = Depends(get_db),
):

    placeholder_name = sanitize_filename(
        req.url.split("/")[-1][:100] or "url_input"
    )

    task = TranscriptionTask(
        filename=placeholder_name,
        source_type="url",
        source_url=req.url,
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    start_task(task.id)

    return task
