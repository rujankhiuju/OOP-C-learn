from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models import TranscriptionTask, TaskStatus
from app.schemas import TaskResponse, TranscriptResult, Segment
from app.services.exporter import export_txt, export_srt, export_json
from app.utils.file_utils import load_transcript_json, cleanup_task

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("/", response_model=list[TaskResponse])
async def list_tasks(
    status: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(TranscriptionTask).order_by(
        TranscriptionTask.created_at.desc()
    )
    if status:
        q = q.filter(TranscriptionTask.status == status)
    return q.limit(limit).all()


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: str, db: Session = Depends(get_db)):
    task = db.query(TranscriptionTask).filter_by(id=task_id).first()
    if not task:
        raise HTTPException(404, "Task not found")
    return task


@router.get("/{task_id}/result", response_model=TranscriptResult)
async def get_result(task_id: str, db: Session = Depends(get_db)):
    task = db.query(TranscriptionTask).filter_by(id=task_id).first()
    if not task:
        raise HTTPException(404, "Task not found")
    if task.status != TaskStatus.COMPLETED:
        raise HTTPException(400, f"Task is {task.status}, not completed")

    data = load_transcript_json(task_id)
    if not data:
        raise HTTPException(404, "Transcript data not found")

    return TranscriptResult(
        task_id=task.id,
        status=task.status.value,
        filename=task.filename,
        duration=task.duration,
        detected_language=task.detected_language,
        segments=[Segment(**s) for s in data.get("segments", [])],
        text=data.get("text", ""),
    )


@router.get("/{task_id}/download/{fmt}")
async def download_transcript(
    task_id: str,
    fmt: str = Query(pattern="^(txt|srt|json)$"),
    db: Session = Depends(get_db),
):
    task = db.query(TranscriptionTask).filter_by(id=task_id).first()
    if not task:
        raise HTTPException(404, "Task not found")
    if task.status != TaskStatus.COMPLETED:
        raise HTTPException(400, f"Task is {task.status}, not completed")

    data = load_transcript_json(task_id)
    if not data:
        raise HTTPException(404, "Transcript data not found")

    segments = data.get("segments", [])
    basename = Path(task.filename).stem

    if fmt == "txt":
        content = export_txt(segments, data.get("text", ""))
        return PlainTextResponse(
            content,
            media_type="text/plain",
            headers={"Content-Disposition": f'attachment; filename="{basename}.txt"'},
        )
    elif fmt == "srt":
        content = export_srt(segments)
        return PlainTextResponse(
            content,
            media_type="text/plain",
            headers={"Content-Disposition": f'attachment; filename="{basename}.srt"'},
        )
    elif fmt == "json":
        content = export_json(segments, {k: v for k, v in data.items() if k != "segments"})
        import json
        return PlainTextResponse(
            json.dumps(content, ensure_ascii=False, indent=2),
            media_type="application/json",
            headers={"Content-Disposition": f'attachment; filename="{basename}.json"'},
        )


@router.delete("/{task_id}", status_code=204)
async def delete_task(task_id: str, db: Session = Depends(get_db)):
    task = db.query(TranscriptionTask).filter_by(id=task_id).first()
    if not task:
        raise HTTPException(404, "Task not found")
    cleanup_task(task_id)
    db.delete(task)
    db.commit()
