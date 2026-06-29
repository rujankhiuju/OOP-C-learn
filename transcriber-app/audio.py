import subprocess
import os


AUDIO_EXTENSIONS = {'.mp3', '.wav', '.m4a', '.webm', '.ogg', '.flac', '.aac', '.wma', '.mpga'}
VIDEO_EXTENSIONS = {'.mp4', '.avi', '.mov', '.mkv', '.flv', '.webm', '.mpeg', '.mpg'}


def extract_audio(input_path, output_path=None):
    if output_path is None:
        output_path = os.path.splitext(input_path)[0] + "_audio.wav"

    cmd = [
        "ffmpeg", "-i", input_path,
        "-vn",
        "-acodec", "pcm_s16le",
        "-ar", "16000",
        "-ac", "1",
        "-y",
        output_path
    ]

    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True)
        return output_path
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"FFmpeg failed: {e.stderr[:500]}")
    except FileNotFoundError:
        raise RuntimeError("FFmpeg not found. Install it: sudo apt install ffmpeg")


def is_audio_file(filename):
    return os.path.splitext(filename)[1].lower() in AUDIO_EXTENSIONS


def is_video_file(filename):
    return os.path.splitext(filename)[1].lower() in VIDEO_EXTENSIONS
