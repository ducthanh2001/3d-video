"""Checks an episode's voice against its script and its picture.
usage: .venv\\Scripts\\python.exe scripts\\check_voice.py ep002 [final.mp4]
  1. VOICE   which Kokoro voice made voice/<ep>/voice_raw.wav (or voice.wav): line 1 is re-synthesized with several voices at the
             speed make_voice.py uses and compared (log-mel distance after time alignment); Kokoro is deterministic, so the
             voice that was used matches almost exactly.
  2. WORDS   Whisper's words (words.json) against script.txt: every missing / swapped / extra word.
  3. CUES    each cue in src/videos/<ep>/story.ts (Q table) against the onset of the word it is meant to land on (picture should
             react 0-3 frames before the word).
  4. MP4     (optional) the voice inside the final video: lag against voice.wav by cross-correlation.
Needs SSL_CERT_FILE / REQUESTS_CA_BUNDLE set when Kokoro has to download a voice file."""
import difflib
import json
import pathlib
import re
import subprocess
import sys
import tempfile

import numpy as np
import soundfile as sf
from scipy import signal

EP = sys.argv[1]
MP4 = sys.argv[2] if len(sys.argv) > 2 else None
ROOT = pathlib.Path(__file__).resolve().parent.parent
VD = ROOT / "voice" / EP
SR = 24000
norm = lambda w: re.sub(r"[^a-z0-9']", "", w.lower().replace("’", "'"))
lines = [l.strip() for l in (VD / "script.txt").read_text(encoding="utf-8").splitlines() if l.strip()]
sents = json.loads(((VD / "sentences_raw.json") if (VD / "sentences_raw.json").exists() else (VD / "sentences.json")).read_text(encoding="utf-8"))
raw = VD / "voice_raw.wav" if (VD / "voice_raw.wav").exists() else VD / "voice.wav"
x, sr = sf.read(raw, dtype="float32")
assert sr == SR


def logmel(a):
    f, t, S = signal.stft(a, SR, nperseg=1024, noverlap=768)
    mel = np.log(np.abs(S[:400]) ** 2 + 1e-8)
    return (mel - mel.mean(1, keepdims=True)).T  # frames x bins, per-bin mean removed


def dist(a, b):
    """mean frame distance after DTW alignment (handles small length differences)"""
    A, B = logmel(a), logmel(b)
    C = np.sqrt(((A[:, None, :] - B[None, :, :]) ** 2).mean(-1))
    n, m = C.shape
    D = np.full((n + 1, m + 1), np.inf); D[0, 0] = 0
    for i in range(1, n + 1):
        D[i, 1:] = C[i - 1] + np.minimum.reduce([D[i - 1, 1:], D[i - 1, :-1], np.full(m, np.inf)])
        for j in range(1, m + 1): D[i, j] = min(D[i, j], C[i - 1, j - 1] + D[i, j - 1])
    return D[n, m] / (n + m)


print(f"== 1. VOICE ({raw.name}, line 1)")
seg = x[int(sents[0]["start"] * SR):int(sents[0]["end"] * SR)]
seg = seg[: SR * 3]  # 3 s are enough and keep the DTW small
from kokoro import KPipeline
pipe_a = KPipeline(lang_code="a"); pipe_b = None
res = []
for v in ["am_santa", "am_michael", "am_adam", "am_echo", "am_eric", "am_puck", "bm_george", "bm_fable"]:
    if v.startswith("b") and pipe_b is None: pipe_b = KPipeline(lang_code="b")
    p = pipe_b if v.startswith("b") else pipe_a
    a = np.concatenate([np.asarray(c, dtype=np.float32) for _, _, c in p(lines[0], voice=v, speed=1.4)])[: SR * 3]
    res.append((dist(seg, a), v, float(np.corrcoef(seg[:len(a)], a[:len(seg)])[0, 1]) if len(a) and len(seg) else 0))
for d, v, c in sorted(res):
    print(f"  {v:11s} spectral distance {d:6.3f}   waveform corr {c:+.3f}")
best = min(res)
print(f"  -> closest: {best[1]}" + ("  (sample-identical: this is the voice that was used)" if sorted(res)[0][2] > 0.98 else ""))

print("\n== 2. WORDS (script.txt vs Whisper words.json)")
script_words = [norm(w) for l in lines for w in l.split() if norm(w)]
words = json.loads((VD / "words.json").read_text(encoding="utf-8"))
heard = [norm(w["w"]) for w in words]
sm = difflib.SequenceMatcher(a=script_words, b=heard, autojunk=False)
bad = 0
for op, i0, i1, j0, j1 in sm.get_opcodes():
    if op == "equal": continue
    bad += max(i1 - i0, j1 - j0)
    t = words[j0]["s"] if j0 < len(words) else words[-1]["e"]
    print(f"  {op:7s} @ {t:6.2f}s  script: {' '.join(script_words[i0:i1]) or '-':30s} heard: {' '.join(heard[j0:j1]) or '-'}")
print(f"  {len(script_words)} script words, {bad} differ ({100 * bad / len(script_words):.1f} %)")
print("  (numbers like 897 / 898 and spelling variants count as differences; listen to anything else)")

print("\n== 3. CUES (story.ts Q vs word onsets; frame = onset x 30, picture should lead by 0-3 f)")
story = (ROOT / "src" / "videos" / EP / "story.ts").read_text(encoding="utf-8")
qb = story[story.index("export const Q = {"):story.index("};", story.index("export const Q = {"))]
Q = {k: int(v) for k, v in re.findall(r"(\w+): (\d+)", qb)}
cur = json.loads((VD / "sentences.json").read_text(encoding="utf-8"))
# the word each named cue is meant to land on: (word stem, nth occurrence); L<n> = first word of script line n
MAP = {"first": ("first", 1), "second": ("second", 1), "summoned": ("summoned", 1), "showed": ("showed", 1), "argument": ("argument", 1),
       "scared": ("scared", 1), "extra": ("extra", 1), "round": ("round", 1), "real1": ("real", 1), "dead7": ("dead", 2), "rome": ("rome", 1),
       "nine": ("nine", 1), "dug": ("dug", 1), "sat": ("sat", 1), "trial9": ("trial", 1), "defend": ("defend", 1), "guilty": ("guilty", 1),
       "wait": ("wait", 1), "prison": ("prison", 1), "canceled": ("cancel", 1), "banned": ("banned", 1), "real2": ("real", 2), "won": ("won", 1),
       "history": ("history", 1), "rooster": ("rooster", 1), "egg": ("egg", 1), "would": ("would", 1)}
def onset(stem, n):
    c = 0
    for w in words:
        if norm(w["w"]).startswith(stem):
            c += 1
            if c == n: return w["s"]
first_word = []  # onset of the first Whisper word inside each script line
for s in cur:
    ws = [w["s"] for w in words if s["start"] - 0.35 <= w["s"] < s["end"]]  # Whisper may put a line's first word slightly early
    first_word.append(min(ws) if ws else s["start"])
rows = []
for k, f in Q.items():
    if k in MAP: t = onset(*MAP[k])
    elif re.fullmatch(r"L\d+", k) and int(k[1:]) <= len(first_word): t = first_word[int(k[1:]) - 1]
    else: continue
    if t is None: rows.append((k, f, None, None)); continue
    rows.append((k, f, round(t * 30), round(t * 30) - f))
for k, f, w, lead in rows:
    flag = "" if lead is not None and 0 <= lead <= 4 else ("  <-- picture AFTER the word" if lead is not None and lead < 0 else "  <-- early" if lead is not None else "  <-- word not found")
    if k.startswith("L") and lead is not None and -2 <= lead <= 12: flag = ""  # a shot may cut in up to ~0.4 s before its line
    print(f"  {k:9s} cue f{f:5d}   word f{w if w is not None else '-':>5}   lead {lead if lead is not None else '-':>3}{flag}")
print(f"  voice ends at f{round(cur[-1]['end'] * 30)}, picture ends at f{Q['END']}")

if MP4:
    print("\n== 4. MP4 (voice inside the final video vs voice.wav)")
    ff = next((ROOT / "node_modules" / "@remotion").glob("compositor-*/ffmpeg*"), None)
    with tempfile.TemporaryDirectory() as td:
        out = pathlib.Path(td) / "a.wav"
        subprocess.run([str(ff) if ff else "ffmpeg", "-v", "error", "-y", "-i", MP4, "-vn", "-ac", "1", "-ar", str(SR), str(out)], check=True)
        a, _ = sf.read(out, dtype="float32")
    v, _ = sf.read(VD / "voice.wav", dtype="float32")
    n = min(len(a), len(v), SR * 20)
    A, V = a[:n] - a[:n].mean(), v[:n] - v[:n].mean()
    cc = signal.correlate(A, V, mode="full", method="fft")
    lag = (np.argmax(cc) - (n - 1)) / SR
    print(f"  audio lag vs voice.wav: {lag * 1000:+.1f} ms ({lag * 30:+.2f} frames); mp4 audio {len(a) / SR:.3f} s")
