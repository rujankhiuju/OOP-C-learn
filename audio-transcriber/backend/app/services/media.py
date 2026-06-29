import subprocess
import json
from pathlib import Path
from typing import Optional

AUDIO_EXTENSIONS = {".mp3", ".wav", ".ogg", ".m4a", ".flac", ".aac", ".wma", ".opus"}
VIDEO_EXTENSIONS = {".mp4", ".mkv", ".avi", ".mov", ".webm", ".flv", ".wmv", ".mts"}
SUPPORTED_EXTENSIONS = AUDIO_EXTENSIONS | VIDEO_EXTENSIONS


def get_media_type(filepath: Path) -> Optional[str]:
    ext = filepath.suffix.lower()
    if ext in AUDIO_EXTENSIONS:
        return "audio"
    if ext in VIDEO_EXTENSIONS:
        return "video"
    return None


def is_supported(filepath: Path) -> bool:
    return filepath.suffix.lower() in SUPPORTED_EXTENSIONS


def get_duration(filepath: Path) -> Optional[float]:
    try:
        result = subprocess.run(
            [
                "ffprobe",
                "-v", "quiet",
                "-print_format", "json",
                "-show_format",
                str(filepath),
            ],
            capture_output=True,
            text=True,
            timeout=30,
        )
        data = json.loads(result.stdout)
        return float(data["format"]["duration"])
    except Exception:
        return None


def extract_audio(
    video_path: Path, output_path: Optional[Path] = None
) -> Path:
    if output_path is None:
        output_path = video_path.with_suffix(".wav")

    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i", str(video_path),
            "-vn",
            "-acodec", "pcm_s16le",
            "-ar", "16000",
            "-ac", "1",
            str(output_path),
        ],
        check=True,
        capture_output=True,
        timeout=3600,
    )
    return output_path


def convert_to_wav(audio_path: Path, output_path: Optional[Path] = None) -> Path:
    if output_path is None:
        output_path = audio_path.with_suffix(".wav")
    if audio_path.suffix == ".wav":
        import shutil
        shutil.copy2(audio_path, output_path)
        return output_path

    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i", str(audio_path),
            "-acodec", "pcm_s16le",
            "-ar", "16000",
            "-ac", "1",
            str(output_path),
        ],
        check=True,
        capture_output=True,
        timeout=3600,
    )
    return output_path
