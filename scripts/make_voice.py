"""voice/script.txt -> voice/voice.wav (Kokoro, one line per story sentence) + voice/words.json (faster-whisper word times)
usage: .venv\\Scripts\\python.exe scripts\\make_voice.py [voice=am_santa]
Delete voice/voice.wav first to regenerate the speech. voice/sentences.json gets the start/end seconds of each script line.
If voice/sentences_ref.json exists, every line is stretched (by the speaking speed, not by resampling) to the duration it had in that
reference, so the picture, music and SFX timed to the earlier voice stay in sync without re-rendering the video."""
import json
import pathlib
import sys

import numpy as np
import soundfile as sf

root = pathlib.Path(__file__).resolve().parent.parent / "voice" / (sys.argv[2] if len(sys.argv) > 2 else "")  # usage: make_voice.py [voice] [subfolder of voice/]
VOICE = sys.argv[1] if len(sys.argv) > 1 else "am_santa"
lines = [l.strip() for l in (root / "script.txt").read_text(encoding="utf-8").splitlines() if l.strip()]
ref = json.loads((root / "sentences_ref.json").read_text(encoding="utf-8")) if (root / "sentences_ref.json").exists() else None

SR = 24000
GAP = 0.22
if not (root / "voice.wav").exists():
    from kokoro import KPipeline

    pipe = KPipeline(lang_code="b" if VOICE.startswith("b") else "a")

    def say(line, speed):
        return np.concatenate([np.asarray(a, dtype=np.float32) for _, _, a in pipe(line, voice=VOICE, speed=speed)])

    chunks, sent, t = [], [], 0.0
    for i, line in enumerate(lines):
        speed = 1.4 if not ref else 1.2
        a = say(line, speed)
        if ref:
            want = ref[i]["end"] - ref[i]["start"]
            for _ in range(3):  # converge the line length on the reference length
                speed = float(np.clip(speed * (len(a) / SR) / want, 0.85, 1.9))
                a = say(line, speed)
                if abs(len(a) / SR - want) < 0.03: break
            n = int(round(want * SR))
            a = a[:n] if len(a) > n else np.concatenate([a, np.zeros(n - len(a), dtype=np.float32)])
        print(f"line {i + 1}: speed {speed:.2f}, {len(a) / SR:.2f} s")
        sent.append({"i": i + 1, "start": round(t, 3), "end": round(t + len(a) / SR, 3), "text": line})
        chunks += [a, np.zeros(int(GAP * SR), dtype=np.float32)]
        t += len(a) / SR + GAP
    audio = np.concatenate(chunks)
    sf.write(root / "voice.wav", audio, SR)
    (root / "sentences.json").write_text(json.dumps(sent, indent=1), encoding="utf-8")
    print("voice.wav", round(len(audio) / SR, 2), "s")

from faster_whisper import WhisperModel

model = WhisperModel("small.en", device="cpu", compute_type="int8")
wav, sr = sf.read(root / "voice.wav", dtype="float32")
wav16 = np.interp(np.arange(0, len(wav), sr / 16000), np.arange(len(wav)), wav).astype(np.float32)  # plain linear resample to 16 kHz
segs, _ = model.transcribe(wav16, word_timestamps=True, language="en")
words = [{"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3)} for s in segs for w in s.words]
(root / "words.json").write_text(json.dumps(words, indent=1), encoding="utf-8")
print(len(words), "words")
