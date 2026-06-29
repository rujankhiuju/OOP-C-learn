import whisper
import os

_model = None


def get_model(model_name="small"):
    global _model
    if _model is None:
        _model = whisper.load_model(model_name)
    return _model


def transcribe(audio_path, language=None):
    model = get_model()

    options = {}
    if language and language != "auto":
        options["language"] = language

    result = model.transcribe(audio_path, **options)

    return {
        "text": result["text"].strip(),
        "segments": result.get("segments", []),
        "detected_language": result.get("language", "unknown"),
    }


def format_as_srt(segments):
    def _fmt(seconds):
        h = int(seconds // 3600)
        m = int((seconds % 3600) // 60)
        s = int(seconds % 60)
        ms = int((seconds % 1) * 1000)
        return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

    parts = []
    for i, seg in enumerate(segments, 1):
        parts.append(f"{i}\n{_fmt(seg['start'])} --> {_fmt(seg['end'])}\n{seg['text'].strip()}\n")

    return "\n".join(parts)
