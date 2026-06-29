import subprocess
import tempfile
from pathlib import Path
from typing import Optional

import requests

from app.config import settings
from app.utils.security import validate_url


def is_youtube_url(url: str) -> bool:
    import re
    patterns = [
        r"(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=[\w-]+",
        r"(?:https?:\/\/)?(?:www\.)?youtu\.be\/[\w-]+",
        r"(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/[\w-]+",
    ]
    return any(re.match(p, url) for p in patterns)


def is_direct_media_url(url: str) -> bool:
    audio_exts = {".mp3", ".wav", ".ogg", ".m4a", ".flac", ".aac", ".opus"}
    video_exts = {".mp4", ".mkv", ".avi", ".mov", ".webm"}
    from urllib.parse import urlparse
    path = urlparse(url).path.lower()
    ext = Path(path).suffix
    return ext in audio_exts or ext in video_exts


def fetch_media_from_url(url: str) -> tuple[Optional[Path], Optional[str]]:
    valid, err = validate_url(url)
    if not valid:
        return None, err

    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; AudioTranscriber/1.0)"
    }

    try:
        if is_youtube_url(url) or not is_direct_media_url(url):
            return _download_with_ytdlp(url)
        return _download_direct(url, headers)
    except Exception as e:
        return None, str(e)


def _download_with_ytdlp(url: str) -> tuple[Optional[Path], Optional[str]]:
    tmp = tempfile.mktemp(suffix=".%(ext)s", dir=settings.UPLOAD_DIR)
    output_template = tmp.replace(".%(ext)s", "")

    cmd = [
        "yt-dlp",
        "--no-playlist",
        "--max-filesize", f"{settings.MAX_URL_DOWNLOAD_SIZE_MB}M",
        "-o", output_template + ".%(ext)s",
        "--print", "filename",
        url,
    ]

    result = subprocess.run(
        cmd, capture_output=True, text=True, timeout=600
    )

    if result.returncode != 0:
        return None, f"yt-dlp failed: {result.stderr.strip()[:500]}"

    filenames = result.stdout.strip().split("\n")
    for fname in filenames:
        if fname and Path(fname).exists():
            return Path(fname), None

    return None, "Could not locate downloaded file"


def _download_direct(
    url: str, headers: dict
) -> tuple[Optional[Path], Optional[str]]:
    resp = requests.get(
        url,
        headers=headers,
        stream=True,
        timeout=settings.REQUEST_TIMEOUT_SECONDS,
        allow_redirects=True,
    )
    resp.raise_for_status()

    content_type = resp.headers.get("content-type", "")
    if "text/html" in content_type and not is_direct_media_url(url):
        return None, "URL points to an HTML page, not a direct media file"

    ext = _extract_ext(url, content_type)
    tmp = tempfile.NamedTemporaryFile(
        delete=False, suffix=ext, dir=settings.UPLOAD_DIR
    )
    tmp_path = Path(tmp.name)

    downloaded = 0
    max_bytes = settings.MAX_URL_DOWNLOAD_SIZE_MB * 1024 * 1024
    for chunk in resp.iter_content(chunk_size=8192):
        if chunk:
            downloaded += len(chunk)
            if downloaded > max_bytes:
                tmp_path.unlink(missing_ok=True)
                return None, f"Download exceeds {settings.MAX_URL_DOWNLOAD_SIZE_MB}MB limit"
            tmp.write(chunk)

    tmp.close()
    return tmp_path, None


def _extract_ext(url: str, content_type: str) -> str:
    from urllib.parse import urlparse
    path = urlparse(url).path
    ext = Path(path).suffix.lower()
    if ext:
        return ext

    content_map = {
        "audio/mpeg": ".mp3",
        "audio/wav": ".wav",
        "audio/ogg": ".ogg",
        "audio/mp4": ".m4a",
        "audio/flac": ".flac",
        "audio/aac": ".aac",
        "video/mp4": ".mp4",
        "video/webm": ".webm",
        "video/x-matroska": ".mkv",
    }
    for ct, e in content_map.items():
        if ct in content_type:
            return e
    return ".mp4"
