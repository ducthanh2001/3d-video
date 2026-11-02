"""Re-voices single script lines that Kokoro said badly, without moving anything else.
For each line, every text variant (plain text, forced stress / phonemes in Kokoro's [word](/phonemes/) syntax, a pause mark in front)
is synthesized with the episode's voice, sped to the exact length the line had in voice_raw.wav, transcribed by Whisper and scored
against the script line; the best variant (first perfect one) replaces the line's samples in voice_raw.wav. The old take is kept as
voice_raw_prev.wav. Afterwards run pad_voice.py again (it rebuilds voice.wav from voice_raw.wav), delete words.json and run
make_voice.py to re-time the words.
usage: .venv\\Scripts\\python.exe scripts\\fix_voice_lines.py ep002 am_santa fixes.json
  fixes.json: {"2": ["[Case](/kˈAs/) one. France. ...", "... Case one. France. ..."], ...}  (line numbers from script.txt)"""
import json
import pathlib
import re
import shutil
import sys

import numpy as np
import soundfile as sf

EP, VOICE, FIX = sys.argv[1], sys.argv[2], json.loads(pathlib.Path(sys.argv[3]).read_text(encoding="utf-8"))
VD = pathlib.Path(__file__).resolve().parent.parent / "voice" / EP
SR = 24000
lines = [l.strip() for l in (VD / "script.txt").read_text(encoding="utf-8").splitlines() if l.strip()]
sents = json.loads((VD / "sentences_raw.json").read_text(encoding="utf-8"))
raw = VD / "voice_raw.wav"
x, _ = sf.read(raw, dtype="float32")
norm = lambda s: [re.sub(r"[^a-z0-9']", "", w.lower()) for w in re.sub(r"\[([^\]]+)\]\(/[^)]*/\)", r"\1", s).replace("…", " ").split() if re.sub(r"[^a-z0-9']", "", w.lower())]

from kokoro import KPipeline
from faster_whisper import WhisperModel
pipe = KPipeline(lang_code="b" if VOICE.startswith("b") else "a")
model = WhisperModel("small.en", device="cpu", compute_type="int8")


def say(text, speed):
    return np.concatenate([np.asarray(a, dtype=np.float32) for _, _, a in pipe(text, voice=VOICE, speed=speed)])


def fit(text, want):
    speed = 1.4
    a = say(text, speed)
    for _ in range(4):
        speed = float(np.clip(speed * (len(a) / SR) / want, 0.85, 1.9))
        a = say(text, speed)
        if abs(len(a) / SR - want) < 0.03: break
    n = int(round(want * SR))
    return (a[:n] if len(a) > n else np.concatenate([a, np.zeros(n - len(a), dtype=np.float32)])), speed


def hear(a):
    pad = np.zeros(int(0.4 * SR), dtype=np.float32)
    y = np.concatenate([pad, a, pad])
    y16 = np.interp(np.arange(0, len(y), SR / 16000), np.arange(len(y)), y).astype(np.float32)
    segs, _ = model.transcribe(y16, language="en")
    return " ".join(s.text.strip() for s in segs)


def score(script, heard):
    a, b = norm(script), norm(heard)
    import difflib
    return difflib.SequenceMatcher(a=a, b=b, autojunk=False).ratio()


shutil.copy(raw, VD / "voice_raw_prev.wav")
for ln, variants in FIX.items():
    i = int(ln) - 1
    s = sents[i]
    i0, i1 = int(round(s["start"] * SR)), int(round(s["end"] * SR))
    want = (i1 - i0) / SR
    print(f"line {ln}: \"{lines[i]}\" ({want:.2f} s)")
    print(f"  current : {hear(x[i0:i1])!r}  score {score(lines[i], hear(x[i0:i1])):.2f}")
    best = None
    for v in variants:
        a, sp = fit(v, want)
        h = hear(a); sc = score(lines[i], h)
        print(f"  {sc:.2f}  speed {sp:.2f}  {v!r} -> {h!r}")
        if best is None or sc > best[0]: best = (sc, v, a)
        if sc >= 0.999: break
    x[i0:i1] = best[2]
    print(f"  -> using {best[1]!r} ({best[0]:.2f})")
sf.write(raw, x, SR)
print("voice_raw.wav updated (previous take: voice_raw_prev.wav)")
