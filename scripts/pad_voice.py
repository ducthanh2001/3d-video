"""Inserts silence after given script lines of voice/<ep>/voice.wav (the beats the picture needs: a title card, a held face,
a stamp) and shifts sentences.json to match. Keeps the unpadded take as voice_raw.wav, so running it again starts from that.
usage: .venv\\Scripts\\python.exe scripts\\pad_voice.py ep002 "2:1.1,4:0.5,8:1.1"
then delete voice/<ep>/words.json and run make_voice.py again (it only re-runs Whisper while voice.wav exists)."""
import json
import pathlib
import shutil
import sys

import numpy as np
import soundfile as sf

root = pathlib.Path(__file__).resolve().parent.parent / "voice" / sys.argv[1]
pads = {int(k): float(v) for k, v in (p.split(":") for p in sys.argv[2].split(","))}
raw, sraw = root / "voice_raw.wav", root / "sentences_raw.json"
if not raw.exists():
    shutil.copy(root / "voice.wav", raw)
    shutil.copy(root / "sentences.json", sraw)
x, sr = sf.read(raw, dtype="float32")
sent = json.loads(sraw.read_text(encoding="utf-8"))
out, shift, prev = [], 0.0, 0
for s in sent:
    end = int(round(s["end"] * sr))
    s["start"] = round(s["start"] + shift, 3)
    s["end"] = round(s["end"] + shift, 3)
    out.append(x[prev:end])
    prev = end
    pad = pads.get(s["i"], 0.0)
    out.append(np.zeros(int(round(pad * sr)), dtype=np.float32))
    shift += pad
out.append(x[prev:])
y = np.concatenate(out)
sf.write(root / "voice.wav", y, sr)
(root / "sentences.json").write_text(json.dumps(sent, indent=1), encoding="utf-8")
print("voice.wav", round(len(y) / sr, 2), "s, padded", round(shift, 2), "s")
