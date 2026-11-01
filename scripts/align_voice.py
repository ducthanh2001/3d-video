"""Warps voice/voice.wav so its key words land exactly where the earlier voice said them (voice/michael/words.json).
Each stretch is a small ffmpeg `atempo` between two cuts placed in the quietest 5 ms just before a word, so the picture, music and
SFX (all timed to the first voice) stay in sync without re-rendering.
usage: .venv\\Scripts\\python.exe scripts\\align_voice.py   (then delete voice/words.json and run make_voice.py to re-time the words)"""
import json
import pathlib
import re
import shutil
import subprocess
import tempfile

import numpy as np
import soundfile as sf

root = pathlib.Path(__file__).resolve().parent.parent / "voice"
raw = root / "voice_raw.wav"
if not raw.exists(): shutil.copy(root / "voice.wav", raw)  # keep the unwarped am_santa
x, sr = sf.read(raw, dtype="float32")
old = json.loads((root / "michael" / "words.json").read_text(encoding="utf-8"))
new = json.loads((root / "words_raw.json").read_text(encoding="utf-8")) if (root / "words_raw.json").exists() else json.loads((root / "words.json").read_text(encoding="utf-8"))
(root / "words_raw.json").write_text(json.dumps(new, indent=1), encoding="utf-8")
norm = lambda w: re.sub(r"[^a-z0-9']", "", w.lower())


def find(ws, key, n):
    c = 0
    for w in ws:
        k = norm(w["w"])
        ok = k == key or (key == "24" and k in ("24", "twentyfour")) or (key == "remembers" and "remember" in k) or (key == "handprint" and "hand" in k)
        if ok:
            c += 1
            if c == n: return w["s"]
    return None


KEYS = [("205", 1), ("elevator", 1), ("brushing", 1), ("photo", 1), ("scrolling", 1), ("looks", 1), ("dies", 1), ("good", 1), ("bad", 1),
        ("camera", 1), ("24", 1), ("screen", 1), ("can't", 1), ("trust", 1), ("handprint", 1), ("dog", 1), ("bridge", 1), ("buffet", 1),
        ("one", 2), ("lab", 1), ("remembers", 1), ("pocket", 1)]
quiet = lambda t: t - 0.15 + 0.005 * int(np.argmin([np.sqrt(np.mean(x[int((t - 0.15 + 0.005 * j) * sr):int((t - 0.15 + 0.005 * (j + 1)) * sr)] ** 2)) for j in range(30)]))
anch = [(0.0, 0.0)]
for k, n in KEYS:
    a, b = find(new, k, n), find(old, k, n)
    if a is None or b is None: print("skip", k, n); continue
    cut = quiet(a)
    anch.append((cut, b - (a - cut)))
info = sf.info(root / "michael" / "voice.wav")
tot_new, tot_old = len(x) / sr, info.frames / info.samplerate  # the first voice, trailing gap included
anch.append((tot_new, tot_old))
anch.sort()
clean = [anch[0]]
for a, b in anch[1:]:
    if a > clean[-1][0] + 0.15 and b > clean[-1][1] + 0.15: clean.append((a, b))
anch = clean
# never stretch speech by more than 20 %: drop the later anchor of any segment that would need it (that word then lands a little off)
while True:
    bad = [(abs(np.log((anch[i + 1][0] - anch[i][0]) / (anch[i + 1][1] - anch[i][1]))), i) for i in range(len(anch) - 1)]
    worst, i = max(bad)
    if worst < np.log(1.2) or len(anch) <= 2: break
    j = i + 1 if i + 1 < len(anch) - 1 else i
    print("drop anchor", round(anch[j][1], 2), "(tempo", round((anch[i + 1][0] - anch[i][0]) / (anch[i + 1][1] - anch[i][1]), 2), ")")
    del anch[j]
print(len(anch), "anchors")
tmp = pathlib.Path(tempfile.mkdtemp(prefix="align_", dir=str(root.parent / "voice")))
parts = []
for i in range(len(anch) - 1):
    (a0, b0), (a1, b1) = anch[i], anch[i + 1]
    seg = x[int(a0 * sr):int(a1 * sr)]
    tempo = (a1 - a0) / (b1 - b0)  # >1 = speed up
    if abs(tempo - 1) > 0.002:
        f_in, f_out = tmp / f"s{i}.wav", tmp / f"o{i}.wav"
        sf.write(f_in, seg, sr)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(f_in), "-af", f"atempo={np.clip(tempo, 0.5, 2.0):.5f}", str(f_out)], check=True)
        seg, _ = sf.read(f_out, dtype="float32")
    want = int(round((b1 - b0) * sr))
    seg = seg[:want] if len(seg) >= want else np.concatenate([seg, np.zeros(want - len(seg), dtype=np.float32)])
    parts.append(seg)
    print(f"{a0:6.2f}->{b0:6.2f}  tempo {tempo:.3f}")
out = np.concatenate(parts)
# 6 ms fades at every cut so the joins do not click
fade = int(0.006 * sr); pos = 0
for p in parts[:-1]:
    pos += len(p)
    out[pos - fade:pos] *= np.linspace(1, 0.3, fade); out[pos:pos + fade] *= np.linspace(0.3, 1, fade)
sf.write(root / "voice.wav", out, sr)
shutil.rmtree(tmp, ignore_errors=True)
print("aligned voice.wav", round(len(out) / sr, 2), "s")
