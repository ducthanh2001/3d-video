"""Reads the opening lines of voice/script.txt with several deeper Kokoro voices -> voice/samples/<voice>.wav.
usage: .venv\\Scripts\\python.exe scripts\\voice_samples.py [voice ...]"""
import pathlib
import sys

import numpy as np
import soundfile as sf
from kokoro import KPipeline

root = pathlib.Path(__file__).resolve().parent.parent / "voice"
out = root / "samples"
out.mkdir(exist_ok=True)
lines = [l.strip() for l in (root / "script.txt").read_text(encoding="utf-8").splitlines() if l.strip()][:3]
voices = sys.argv[1:] or ["am_onyx", "am_adam", "am_fenrir", "bm_george", "bm_fable", "am_michael"]
SR = 24000
for v in voices:
    pipe = KPipeline(lang_code="b" if v.startswith("b") else "a")
    parts = []
    for line in lines:
        parts += [np.asarray(a, dtype=np.float32) for _, _, a in pipe(line, voice=v, speed=1.4)] + [np.zeros(int(0.22 * SR), dtype=np.float32)]
    a = np.concatenate(parts)
    sf.write(out / f"{v}.wav", a, SR)
    print(v, round(len(a) / SR, 2), "s")
