"""TTS generation + on-disk cache. Uses OpenAI TTS via emergentintegrations."""
import os
import hashlib
from pathlib import Path
from emergentintegrations.llm.openai import OpenAITextToSpeech

CACHE_DIR = Path(__file__).parent / "tts_cache"
CACHE_DIR.mkdir(exist_ok=True)

# Deep, calm male voice - "onyx" is the deepest OpenAI voice.
DEFAULT_VOICE = "onyx"
DEFAULT_MODEL = "tts-1"


def _cache_key(text: str, voice: str, model: str) -> str:
    raw = f"{voice}|{model}|{text}".encode("utf-8")
    return hashlib.sha1(raw).hexdigest()


async def get_or_generate_audio(text: str, voice: str = DEFAULT_VOICE, model: str = DEFAULT_MODEL) -> Path:
    """Returns a Path to an mp3 file, generating + caching it if needed."""
    text = (text or "").strip()
    if not text:
        raise ValueError("empty text")

    key = _cache_key(text, voice, model)
    fp = CACHE_DIR / f"{key}.mp3"
    if fp.exists() and fp.stat().st_size > 0:
        return fp

    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise RuntimeError("EMERGENT_LLM_KEY not set")

    tts = OpenAITextToSpeech(api_key=api_key)
    audio_bytes = await tts.generate_speech(
        text=text,
        model=model,
        voice=voice,
        response_format="mp3",
    )
    fp.write_bytes(audio_bytes)
    return fp
