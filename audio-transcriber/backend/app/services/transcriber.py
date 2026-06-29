import logging
from pathlib import Path
from typing import Optional

from faster_whisper import WhisperModel

from app.config import settings

logger = logging.getLogger(__name__)

_model: Optional[WhisperModel] = None
_current_model_name: str = ""
_loaded_device: str = ""
_loaded_compute_type: str = ""


def get_model() -> WhisperModel:
    global _model, _current_model_name, _loaded_device, _loaded_compute_type

    if _model is not None:
        return _model

    device = settings.WHISPER_DEVICE
    compute_type = settings.WHISPER_COMPUTE_TYPE

    if device == "auto":
        import torch
        device = "cuda" if torch.cuda.is_available() else "cpu"

    if compute_type == "auto":
        compute_type = "float16" if device == "cuda" else "int8"

    model_name = settings.WHISPER_MODEL
    model_path = settings.whisper_model_path or model_name

    logger.info(
        "Loading Whisper model %s on %s (%s)...", model_name, device, compute_type
    )
    _model = WhisperModel(
        model_path,
        device=device,
        compute_type=compute_type,
        download_root=settings.MODEL_DIR,
    )
    _current_model_name = model_name
    _loaded_device = device
    _loaded_compute_type = compute_type
    return _model


def load_model(model_name: str) -> dict:
    global _model, _current_model_name, _loaded_device, _loaded_compute_type

    if _model is not None:
        del _model
        _model = None

    old_name = settings.WHISPER_MODEL
    settings.WHISPER_MODEL = model_name
    try:
        get_model()
        return {
            "name": model_name,
            "device": _loaded_device,
            "compute_type": _loaded_compute_type,
        }
    except Exception:
        settings.WHISPER_MODEL = old_name
        raise


def get_model_info() -> dict:
    if _model is None:
        return {
            "name": settings.WHISPER_MODEL,
            "loaded": False,
            "device": "N/A",
            "compute_type": "N/A",
        }
    return {
        "name": _current_model_name,
        "loaded": True,
        "device": _loaded_device,
        "compute_type": _loaded_compute_type,
    }


def transcribe(
    audio_path: Path,
    language: Optional[str] = None,
    word_timestamps: bool = False,
    progress_callback: Optional[callable] = None,
) -> dict:
    model = get_model()

    if progress_callback:
        progress_callback(10, "Loading audio...")

    segments, info = model.transcribe(
        str(audio_path),
        language=language,
        task="transcribe",
        beam_size=5,
        word_timestamps=word_timestamps,
        vad_filter=True,
        vad_parameters=dict(
            min_silence_duration_ms=500,
            threshold=0.5,
        ),
    )

    result_segments = []
    total_duration = info.duration

    if progress_callback:
        progress_callback(20, "Transcribing...")

    segment_count = 0
    last_progress = 20

    for seg in segments:
        seg_data = {
            "start": round(seg.start, 3),
            "end": round(seg.end, 3),
            "text": seg.text.strip(),
        }
        if word_timestamps and seg.words:
            seg_data["words"] = [
                {
                    "word": w.word,
                    "start": round(w.start, 3),
                    "end": round(w.end, 3),
                    "probability": round(w.probability, 3),
                }
                for w in seg.words
            ]
        result_segments.append(seg_data)
        segment_count += 1

        if progress_callback and total_duration > 0:
            progress = min(
                90, 20 + int(70 * seg.end / total_duration)
            )
            if progress > last_progress:
                last_progress = progress
                progress_callback(progress, f"Transcribing... ({segment_count} segments)")

    full_text = "\n".join(s["text"] for s in result_segments)

    if progress_callback:
        progress_callback(95, "Finalizing...")

    return {
        "segments": result_segments,
        "text": full_text,
        "language": info.language,
        "language_probability": round(info.language_probability, 3),
        "duration": round(total_duration, 2) if total_duration else None,
    }
