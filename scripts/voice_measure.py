"""Measure voices: median pitch (Hz), pitch variation (semitones), speaking rate (words/s) and brightness (spectral centroid, Hz).
usage: .venv\\Scripts\\python.exe scripts\\voice_measure.py <reference.wav> [samples dir]
Reference is only for measuring; its audio is never reused."""
import pathlib
import sys

import numpy as np
import soundfile as sf
from scipy import signal

ref = pathlib.Path(sys.argv[1])
samples = pathlib.Path(sys.argv[2]) if len(sys.argv) > 2 else pathlib.Path("voice/samples")


def load(p):
    x, sr = sf.read(p, dtype="float32")
    if x.ndim > 1: x = x.mean(1)
    if sr != 16000: x = signal.resample_poly(x, 16000, sr).astype(np.float32); sr = 16000
    return x / (np.abs(x).max() + 1e-9), sr


def f0_track(x, sr, fmin=70, fmax=330):
    n, hop = int(0.04 * sr), int(0.01 * sr)
    lo, hi = int(sr / fmax), int(sr / fmin)
    out = []
    thr = 0.25 * np.sqrt(np.mean(x ** 2))
    for i in range(0, len(x) - n, hop):
        w = x[i:i + n] * np.hanning(n)
        if np.sqrt(np.mean(w ** 2)) < thr: continue
        ac = np.correlate(w, w, "full")[n - 1:]
        ac /= ac[0] + 1e-9
        k = lo + np.argmax(ac[lo:hi])
        if ac[k] > 0.5: out.append(sr / k)
    return np.array(out)


def centroid(x, sr):
    f, _, S = signal.stft(x, sr, nperseg=512)
    m = np.abs(S).mean(1)
    return float((f * m).sum() / (m.sum() + 1e-9))


def rate(x, sr):
    from faster_whisper import WhisperModel
    global _model
    try: _model
    except NameError: _model = WhisperModel("small.en", device="cpu", compute_type="int8")
    segs, _ = _model.transcribe(x, word_timestamps=True, language="en")
    w = [(a.start, a.end) for s in segs for a in s.words]
    if len(w) < 3: return float("nan"), len(w)
    return len(w) / (w[-1][1] - w[0][0]), len(w)


rows = []
for p in [ref] + sorted(samples.glob("*.wav")):
    x, sr = load(p)
    f = f0_track(x, sr)
    st = 12 * np.log2(f / np.median(f))
    wps, nw = rate(x, sr)
    rows.append((p.stem if p != ref else "REFERENCE", float(np.median(f)), float(np.percentile(st, 90) - np.percentile(st, 10)), wps, centroid(x, sr)))
print(f"{'voice':14s} {'pitch Hz':>9s} {'var (st)':>9s} {'words/s':>8s} {'bright Hz':>10s}")
for r in rows: print(f"{r[0]:14s} {r[1]:9.0f} {r[2]:9.1f} {r[3]:8.2f} {r[4]:10.0f}")
R = rows[0]
sc = []
for r in rows[1:]:
    d = abs(np.log2(r[1] / R[1])) * 12 / 3 + abs(r[2] - R[2]) / 3 + abs(r[4] - R[4]) / 600  # speed is adjustable, so it is not scored
    sc.append((d, r[0]))
print("closest (lower = closer):", ", ".join(f"{n} {d:.2f}" for d, n in sorted(sc)[:8]))
