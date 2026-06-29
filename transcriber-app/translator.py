import asyncio
from googletrans import Translator as GoogleTranslator

_translator = None


def _ensure_event_loop():
    try:
        asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)


def get_translator():
    global _translator
    if _translator is None:
        _ensure_event_loop()
        _translator = GoogleTranslator()
    return _translator


def translate(text, target_language, source_language="auto"):
    if not text or not text.strip():
        return ""

    try:
        translator = get_translator()
        result = translator.translate(text, src=source_language, dest=target_language)
        return result.text
    except Exception as e:
        return f"[Translation failed: {e}]\n\n{text}"
