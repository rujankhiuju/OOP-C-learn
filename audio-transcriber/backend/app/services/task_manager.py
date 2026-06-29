import logging
import time
from pathlib import Path
from typing import Optional, Callable
from concurrent.futures import ThreadPoolExecutor

from sqlalchemy.orm import Session

from app.config import settings
from app.database import SessionLocal
from app.models import TranscriptionTask, TaskStatus
from app.services.media import (
    get_media_type,
    is_supported,
    get_duration,
    extract_audio,
    convert_to_wav,
)
from app.services.url_fetcher import fetch_media_from_url
from app.services.transcriber import transcribe
from app.services.exporter import export_json
from app.services.diarization import diarize, assign_speakers
from app.utils.file_utils import (
    ensure_dirs,
    save_transcript_json,
)

logger = logging.getLogger(__name__)

_executor = ThreadPoolExecutor(max_workers=2)


def process_task_in_thread(task_id: str):
    db = SessionLocal()
    try:
        task = db.query(TranscriptionTask).filter_by(id=task_id).first()
        if not task:
            logger.error("Task %s not found", task_id)
            return

        task.status = TaskStatus.PROCESSING
        task.progress = 0.0
        db.commit()

        _process_task(task, db)
    except Exception as e:
        logger.exception("Task %s failed", task_id)
        task = db.query(TranscriptionTask).filter_by(id=task_id).first()
        if task:
            task.status = TaskStatus.FAILED
            task.error = str(e)[:1000]
            db.commit()
    finally:
        db.close()


def progress_callback_factory(
    task_id: str, db: Session
) -> Callable[[float, str], None]:
    def cb(progress: float, _: str):
        try:
            task = db.query(TranscriptionTask).filter_by(id=task_id).first()
            if task:
                task.progress = progress
                db.commit()
        except Exception:
            pass
    return cb


def _process_task(task: TranscriptionTask, db: Session):
    ensure_dirs()
    task_dir = settings.OUTPUT_DIR / task.id
    task_dir.mkdir(parents=True, exist_ok=True)

    filepath = settings.UPLOAD_DIR / task.filename
    audio_path: Optional[Path] = None

    try:
        if task.source_type == "url" and task.source_url:
            cb = progress_callback_factory(task.id, db)
            cb(5, "Downloading from URL...")
            downloaded_path, err = fetch_media_from_url(task.source_url)
            if err:
                raise ValueError(f"URL download failed: {err}")
            filepath = downloaded_path
            task.filename = filepath.name

        if not filepath.exists():
            raise FileNotFoundError(f"File not found: {filepath}")

        if not is_supported(filepath):
            raise ValueError(f"Unsupported file format: {filepath.suffix}")

        media_type = get_media_type(filepath)
        task.media_type = media_type
        db.commit()

        cb = progress_callback_factory(task.id, db)
        cb(3, "Checking media...")

        duration = get_duration(filepath)
        if duration:
            task.duration = round(duration, 2)
            db.commit()

        if media_type == "video":
            cb(8, "Extracting audio...")
            audio_path = task_dir / "audio.wav"
            extract_audio(filepath, audio_path)
        else:
            audio_path = task_dir / "audio.wav"
            convert_to_wav(filepath, audio_path)

        cb(15, "Transcribing...")

        word_ts = False
        language = None

        result = transcribe(
            audio_path,
            language=language,
            word_timestamps=word_ts,
            progress_callback=cb,
        )

        task.detected_language = result["language"]
        task.duration = result.get("duration") or task.duration
        db.commit()

        segments = result["segments"]

        if settings.DIARIZATION_ENABLED:
            cb(85, "Running speaker diarization...")
            try:
                diarization_segments = diarize(audio_path)
                segments = assign_speakers(segments, diarization_segments)
            except Exception as e:
                logger.warning("Diarization failed (non-fatal): %s", e)

        cb(95, "Saving results...")

        output_data = export_json(segments, {
            "task_id": task.id,
            "filename": task.filename,
            "duration": task.duration,
            "detected_language": task.detected_language,
        })

        save_transcript_json(task.id, output_data)

        task.status = TaskStatus.COMPLETED
        task.progress = 100.0
        task.completed_at = time.time()
        db.commit()

    except Exception:
        logger.exception("Processing error")
        raise
    finally:
        if (
            task.source_type == "url"
            and filepath
            and filepath.parent == settings.UPLOAD_DIR
        ):
            try:
                filepath.unlink(missing_ok=True)
            except Exception:
                pass


def start_task(task_id: str):
    _executor.submit(process_task_in_thread, task_id)
