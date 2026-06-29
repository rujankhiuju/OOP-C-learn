import logging
from pathlib import Path
from typing import Optional

from app.config import settings

logger = logging.getLogger(__name__)

_diarization_pipeline = None


def _get_pipeline():
    global _diarization_pipeline
    if _diarization_pipeline is not None:
        return _diarization_pipeline

    try:
        from pyannote.audio import Pipeline
        token = settings.HUGGINGFACE_TOKEN
        if not token:
            raise ValueError(
                "HUGGINGFACE_TOKEN not set. "
                "Get a free token at https://huggingface.co/settings/tokens "
                "and accept user conditions for pyannote/speaker-diarization-3.1"
            )
        _diarization_pipeline = Pipeline.from_pretrained(
            "pyannote/speaker-diarization-3.1",
            use_auth_token=token,
        )
        return _diarization_pipeline
    except Exception as e:
        logger.error("Failed to load diarization pipeline: %s", e)
        raise


def diarize(
    audio_path: Path,
    num_speakers: Optional[int] = None,
) -> list[dict]:
    pipeline = _get_pipeline()

    kwargs = {}
    if num_speakers:
        kwargs["num_speakers"] = num_speakers

    diarization = pipeline(str(audio_path), **kwargs)

    segments = []
    for turn, _, speaker in diarization.itertracks(yield_label=True):
        segments.append({
            "start": round(turn.start, 3),
            "end": round(turn.end, 3),
            "speaker": speaker,
        })

    return segments


def assign_speakers(
    transcript_segments: list[dict],
    diarization_segments: list[dict],
) -> list[dict]:
    for seg in transcript_segments:
        seg_start = seg["start"]
        seg_end = seg["end"]
        best_speaker = None
        best_overlap = 0.0

        for dseg in diarization_segments:
            d_start = dseg["start"]
            d_end = dseg["end"]

            overlap_start = max(seg_start, d_start)
            overlap_end = min(seg_end, d_end)
            overlap = max(0, overlap_end - overlap_start)

            if overlap > best_overlap:
                best_overlap = overlap
                best_speaker = dseg["speaker"]

        seg["speaker"] = best_speaker

    return transcript_segments
