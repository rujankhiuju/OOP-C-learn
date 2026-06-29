


def format_timestamp(seconds: float, srt_format: bool = False) -> str:
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = seconds % 60
    if srt_format:
        millis = int(round((secs - int(secs)) * 1000))
        return f"{hours:02d}:{minutes:02d}:{int(secs):02d},{millis:03d}"
    millis = int(round((secs - int(secs)) * 1000))
    return f"{hours:02d}:{minutes:02d}:{int(secs):02d}.{millis:03d}"


def export_txt(segments: list[dict], text: str) -> str:
    lines = []
    for seg in segments:
        ts = format_timestamp(seg["start"])
        speaker = seg.get("speaker")
        prefix = f"[{speaker}] " if speaker else ""
        lines.append(f"[{ts}] {prefix}{seg['text']}")
    return "\n".join(lines) if lines else text


def export_srt(segments: list[dict]) -> str:
    lines = []
    for i, seg in enumerate(segments, 1):
        start = format_timestamp(seg["start"], srt_format=True)
        end = format_timestamp(seg["end"], srt_format=True)
        speaker = seg.get("speaker")
        text = seg["text"]
        if speaker:
            text = f"{speaker}: {text}"
        lines.append(str(i))
        lines.append(f"{start} --> {end}")
        lines.append(text)
        lines.append("")
    return "\n".join(lines)


def export_json(segments: list[dict], extra: dict | None = None) -> dict:
    result = {
        "segments": segments,
        "text": "\n".join(s["text"] for s in segments),
    }
    if extra:
        result.update(extra)
    return result
