import { ttsUrl } from "./api";

/**
 * TTS player with a small in-memory cache (blob URLs) so replaying a cue is instant.
 * Simple ducking: pass an <audio> for music and it will lower/restore volume.
 */
class TTSPlayer {
    constructor() {
        this.cache = new Map(); // text -> blob url
        this.audio = new Audio();
        this.audio.preload = "auto";
        this.enabled = true;
        this.currentToken = 0;
        this.musicRef = null;
        this._boundEnded = null;
    }

    setMusic(ref) {
        this.musicRef = ref;
    }

    setEnabled(v) {
        this.enabled = !!v;
        if (!v) this.stop();
    }

    async _fetchBlobUrl(text) {
        const cached = this.cache.get(text);
        if (cached) return cached;
        const res = await fetch(ttsUrl(), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
        });
        if (!res.ok) throw new Error(`tts ${res.status}`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        this.cache.set(text, url);
        return url;
    }

    stop() {
        try {
            this.audio.pause();
        } catch (e) {}
        this._restoreMusic();
    }

    _duckMusic() {
        const m = this.musicRef?.current;
        if (m && !m.paused) {
            m._preDuck = m.volume;
            m.volume = Math.max(0.06, m.volume * 0.25);
        }
    }
    _restoreMusic() {
        const m = this.musicRef?.current;
        if (m && m._preDuck != null) {
            m.volume = m._preDuck;
            m._preDuck = null;
        }
    }

    async play(text) {
        if (!this.enabled || !text) return;
        const token = ++this.currentToken;
        try {
            const url = await this._fetchBlobUrl(text);
            if (token !== this.currentToken) return; // superseded
            this.stop();
            this.audio.src = url;
            this._duckMusic();
            if (this._boundEnded) this.audio.removeEventListener("ended", this._boundEnded);
            this._boundEnded = () => this._restoreMusic();
            this.audio.addEventListener("ended", this._boundEnded, { once: true });
            await this.audio.play();
        } catch (e) {
            // autoplay policies / offline — silent fail
            this._restoreMusic();
        }
    }
}

export const tts = new TTSPlayer();
