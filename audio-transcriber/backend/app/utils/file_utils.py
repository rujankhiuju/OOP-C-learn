import shutil
from pathlib import Path
from typing import Optional

from app.config import settings


def ensure_dirs():
    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    settings.OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def get_task_dir(task_id: str) -> Path:
    return settings.OUTPUT_DIR / task_id


def ensure_task_dir(task_id: str) -> Path:
    d = get_task_dir(task_id)
    d.mkdir(parents=True, exist_ok=True)
    return d


def save_transcript_json(task_id: str, data: dict) -> Path:
    task_dir = ensure_task_dir(task_id)
    path = task_dir / "transcript.json"
    import json
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    return path


def load_transcript_json(task_id: str) -> Optional[dict]:
    path = get_task_dir(task_id) / "transcript.json"
    if not path.exists():
        return None
    import json
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def cleanup_task(task_id: str):
    task_dir = get_task_dir(task_id)
    if task_dir.exists():
        shutil.rmtree(task_dir, ignore_errors=True)


def cleanup_old_tasks(max_age_hours: int = 24):
    import time
    now = time.time()
    for d in settings.OUTPUT_DIR.iterdir():
        if d.is_dir():
            mtime = d.stat().st_mtime
            if now - mtime > max_age_hours * 3600:
                shutil.rmtree(d, ignore_errors=True)
