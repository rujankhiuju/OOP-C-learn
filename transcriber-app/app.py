import gradio as gr
import os
import tempfile
import shutil
import atexit
from pathlib import Path

from audio import extract_audio, is_audio_file, is_video_file
from transcriber import transcribe, format_as_srt
from translator import translate
from downloader import download_instagram_audio, is_valid_instagram_url

WHISPER_LANGUAGES = {
    "auto": "Auto-detect",
    "en": "English",
    "hi": "Hindi",
    "ne": "Nepali",
    "de": "German",
    "es": "Spanish",
    "fr": "French",
    "ja": "Japanese",
    "ko": "Korean",
    "zh": "Chinese",
    "ar": "Arabic",
    "pt": "Portuguese",
    "ru": "Russian",
    "it": "Italian",
}

TRANSLATE_LANGUAGES = {
    "none": "No translation",
    "en": "English",
    "hi": "Hindi",
    "ne": "Nepali",
    "de": "German",
    "es": "Spanish",
    "fr": "French",
    "ja": "Japanese",
    "ko": "Korean",
    "zh": "Chinese",
    "ar": "Arabic",
    "pt": "Portuguese",
    "ru": "Russian",
    "it": "Italian",
}

TEMP_DIR = tempfile.mkdtemp()


def _cleanup():
    shutil.rmtree(TEMP_DIR, ignore_errors=True)


atexit.register(_cleanup)


def _build_output(text, detected_lang, segments, target_lang):
    lines = [f"Detected language: {detected_lang}", "", text]

    if target_lang and target_lang != "none":
        translated = translate(text, target_lang, source_lang=detected_lang)
        lang_name = TRANSLATE_LANGUAGES.get(target_lang, target_lang)
        lines.extend(["", "=" * 50, f"Translation ({lang_name}):", "", translated])

    return "\n".join(lines)


def _save_files(base_name, text, detected_lang, segments, target_lang, output_dir):
    full_text = _build_output(text, detected_lang, segments, target_lang)

    txt_path = os.path.join(output_dir, f"{base_name}_transcript.txt")
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write(full_text)

    srt_path = None
    if segments:
        srt_path = os.path.join(output_dir, f"{base_name}_transcript.srt")
        with open(srt_path, "w", encoding="utf-8") as f:
            f.write(format_as_srt(segments))

    return full_text, txt_path, srt_path


def process_file(file, source_lang, target_lang, progress=gr.Progress()):
    if file is None:
        return "Please upload a file.", None, None

    filepath = file.name
    stem = Path(filepath).stem

    progress(0.1, desc="Processing audio...")

    audio_path = filepath
    if is_video_file(filepath):
        progress(0.2, desc="Extracting audio from video...")
        audio_path = extract_audio(filepath, os.path.join(TEMP_DIR, f"{stem}_audio.wav"))
    elif not is_audio_file(filepath):
        progress(0.2, desc="Converting audio format...")
        audio_path = extract_audio(filepath, os.path.join(TEMP_DIR, f"{stem}_converted.wav"))

    progress(0.4, desc="Transcribing... (this may take a while on first run)")
    lang = source_lang if source_lang != "auto" else None
    result = transcribe(audio_path, language=lang)

    progress(0.8, desc="Finalizing...")
    full_text, txt_path, srt_path = _save_files(
        stem, result["text"], result["detected_language"],
        result["segments"], target_lang, TEMP_DIR
    )

    progress(1.0, desc="Done!")
    return full_text, txt_path, srt_path


def process_url(url, source_lang, target_lang, progress=gr.Progress()):
    if not url or not url.strip():
        return "Please enter an Instagram URL.", None, None

    url = url.strip()

    if not is_valid_instagram_url(url):
        return "Please enter a valid Instagram URL (e.g., https://www.instagram.com/reel/...).", None, None

    progress(0.1, desc="Downloading from Instagram...")
    try:
        audio_path = download_instagram_audio(url, TEMP_DIR)
    except RuntimeError as e:
        return str(e), None, None

    progress(0.4, desc="Transcribing...")
    lang = source_lang if source_lang != "auto" else None
    result = transcribe(audio_path, language=lang)

    progress(0.8, desc="Finalizing...")
    full_text, txt_path, srt_path = _save_files(
        "instagram_video", result["text"], result["detected_language"],
        result["segments"], target_lang, TEMP_DIR
    )

    progress(1.0, desc="Done!")
    return full_text, txt_path, srt_path


with gr.Blocks(title="Free Transcriber", theme=gr.themes.Soft()) as demo:
    gr.Markdown(
        """
        # Free Audio/Video Transcriber
        **No API keys · 100% free · Runs locally**

        Transcribe audio from files or Instagram videos. Optionally translate to any language.
        Supports English, Hindi, Nepali, German, and 90+ languages.
        """
    )

    with gr.Tab("Upload File"):
        with gr.Row():
            with gr.Column(scale=1):
                file_input = gr.File(
                    label="Upload audio or video file",
                    file_types=[
                        ".mp3", ".mp4", ".wav", ".m4a", ".webm",
                        ".mpga", ".ogg", ".flac", ".avi", ".mov", ".mkv",
                    ],
                )

                source_lang_file = gr.Dropdown(
                    choices=[(v, k) for k, v in WHISPER_LANGUAGES.items()],
                    value="auto",
                    label="Audio language",
                )
                trans_lang_file = gr.Dropdown(
                    choices=[(v, k) for k, v in TRANSLATE_LANGUAGES.items()],
                    value="none",
                    label="Translate to",
                )

                transcribe_file_btn = gr.Button("Transcribe", variant="primary", size="lg")

            with gr.Column(scale=2):
                output_file = gr.Textbox(label="Result", lines=20, show_copy_button=True)

                with gr.Row():
                    download_txt_file = gr.File(label="Download TXT")
                    download_srt_file = gr.File(label="Download SRT")

    with gr.Tab("Instagram URL"):
        with gr.Row():
            with gr.Column(scale=1):
                url_input = gr.Textbox(
                    label="Instagram URL",
                    placeholder="https://www.instagram.com/reel/...",
                )

                source_lang_url = gr.Dropdown(
                    choices=[(v, k) for k, v in WHISPER_LANGUAGES.items()],
                    value="auto",
                    label="Audio language",
                )
                trans_lang_url = gr.Dropdown(
                    choices=[(v, k) for k, v in TRANSLATE_LANGUAGES.items()],
                    value="none",
                    label="Translate to",
                )

                transcribe_url_btn = gr.Button("Transcribe", variant="primary", size="lg")

            with gr.Column(scale=2):
                output_url = gr.Textbox(label="Result", lines=20, show_copy_button=True)

                with gr.Row():
                    download_txt_url = gr.File(label="Download TXT")
                    download_srt_url = gr.File(label="Download SRT")

    transcribe_file_btn.click(
        fn=process_file,
        inputs=[file_input, source_lang_file, trans_lang_file],
        outputs=[output_file, download_txt_file, download_srt_file],
    )

    transcribe_url_btn.click(
        fn=process_url,
        inputs=[url_input, source_lang_url, trans_lang_url],
        outputs=[output_url, download_txt_url, download_srt_url],
    )

if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860)
