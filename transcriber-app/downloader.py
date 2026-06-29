import subprocess
import os
import tempfile


def download_instagram_audio(url, output_dir=None):
    if output_dir is None:
        output_dir = tempfile.mkdtemp()

    os.makedirs(output_dir, exist_ok=True)

    output_template = os.path.join(output_dir, "%(id)s.%(ext)s")

    cmd = [
        "yt-dlp",
        "-x",
        "--audio-format", "mp3",
        "--audio-quality", "0",
        "-o", output_template,
        "--no-playlist",
        "--quiet",
        url,
    ]

    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True, timeout=120)
    except subprocess.CalledProcessError as e:
        stderr = e.stderr[:500] if e.stderr else ""
        raise RuntimeError(f"Download failed: {stderr}")
    except subprocess.TimeoutExpired:
        raise RuntimeError("Download timed out (120s). Try a shorter video or upload the file directly.")
    except FileNotFoundError:
        raise RuntimeError("yt-dlp not found. Install it: pip install yt-dlp")

    mp3_files = [f for f in os.listdir(output_dir) if f.endswith('.mp3')]
    if not mp3_files:
        files = os.listdir(output_dir)
        if files:
            return os.path.join(output_dir, files[0])
        raise RuntimeError("No audio file could be downloaded.")

    mp3_files.sort(key=lambda f: os.path.getmtime(os.path.join(output_dir, f)), reverse=True)
    return os.path.join(output_dir, mp3_files[0])


def is_valid_instagram_url(url):
    return "instagram.com" in url or "instagr.am" in url
