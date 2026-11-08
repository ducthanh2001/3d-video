"""SFX for PAYDAY v3.2 (no music: the user adds "Funk Universo" in the Shorts editor from 0:00).
Every time is read from src/episodes/payday/events.ts (Q). Output: audio/payday/sfx.wav (48 kHz stereo, exactly LEN frames),
mastered quieter than a full mix (about -20 LUFS) so the music added in the app stays on top.
usage: .venv/Scripts/python.exe audio/make_audio_payday.py"""
import pathlib
import re

import numpy as np
import soundfile as sf
from scipy import signal

HERE = pathlib.Path(__file__).resolve().parent
src = (HERE.parent / "src" / "episodes" / "payday" / "events.ts").read_text(encoding="utf-8")
i0 = src.index("export const Q = {")
QF = {k: int(v) for k, v in re.findall(r"(\w+): (\d+)", src[i0:src.index("};", i0)])}
FPS, SR = 30, 48000
S = {k: v / FPS for k, v in QF.items()}
N = int(round(SR * S["LEN"]))
OUT = HERE / "payday"
OUT.mkdir(exist_ok=True)
rng = np.random.default_rng(7)


def tt(n): return np.arange(n) / SR
def db(x): return 10 ** (x / 20)
def lp(x, fc, o=2): return signal.sosfilt(signal.butter(o, fc, "low", fs=SR, output="sos"), x)
def hp(x, fc, o=2): return signal.sosfilt(signal.butter(o, fc, "high", fs=SR, output="sos"), x)
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo, hi], "band", fs=SR, output="sos"), x)
def noise(n): return rng.standard_normal(n)
def env(n, a=0.002, d=0.2, k=4.0):
    t = tt(n); return np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * k / max(d, 1e-4))


buf = np.zeros((N, 2))
def put(sig, t, g=1.0, pan=0.0):
    st = np.stack([sig * np.sqrt(1 - pan), sig * np.sqrt(1 + pan)], 1)
    i = int(round(t * SR))
    if i >= N or i + len(st) <= 0: return
    a, b = max(0, -i), min(len(st), N - i)
    buf[i + a:i + b] += g * st[a:b]


# ---------------------------------------------------------------- sounds
def kaching():
    n = int(1.2 * SR); t = tt(n)
    bell = sum(np.sin(2 * np.pi * f * t) * a for f, a in ((2093, 1), (2637, 0.7), (3136, 0.5))) * env(n, 0.002, 0.7, 4) * (t > 0.08)
    drawer = hp(noise(n), 1500) * env(n, 0.001, 0.05, 5) * 0.6 + np.sin(2 * np.pi * 180 * t) * env(n, 0.001, 0.08, 5) * 0.5
    return 0.35 * bell + drawer * 0.6
def blip(f0, f1, dur=0.12, g=1.0):
    n = int(dur * SR); fr = np.linspace(f0, f1, n)
    return g * np.sign(np.sin(2 * np.pi * np.cumsum(fr) / SR)) * env(n, 0.002, dur * 0.8, 3) * 0.25
def drain(dur=0.5):
    n = int(dur * SR); fr = np.geomspace(900, 120, n)
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.linspace(1, 0.2, n) * 0.4
def rewind(dur):
    n = int(dur * SR); x = bp(noise(n), 800, 4000) * 0.3
    warble = np.sin(2 * np.pi * np.cumsum(np.linspace(300, 1400, n) + 80 * np.sin(2 * np.pi * 9 * tt(n))) / SR) * 0.25
    return (x + warble) * np.minimum(1, tt(n) / 0.05) * np.minimum(1, (dur - tt(n)) / 0.08).clip(0, 1)
def clack():
    n = int(0.12 * SR); t = tt(n)
    return (np.sin(2 * np.pi * 1350 * t) * env(n, 0.001, 0.04, 5) + 0.5 * bp(noise(n), 1500, 5000) * env(n, 0.0005, 0.015, 5)) * 0.5
def rustle(dur=0.4):
    n = int(dur * SR); g = (rng.random(n) < 0.02).astype(float) * noise(n)
    return bp(lp(g, 6000) + 0.15 * noise(n), 1200, 8000) * np.sin(np.pi * tt(n) / dur) * 0.9
def thud(g=1.0):
    n = int(0.35 * SR); t = tt(n)
    return g * (np.sin(2 * np.pi * np.cumsum(70 + 80 * np.exp(-t * 28)) / SR) * env(n, 0.001, 0.2, 5) + 0.3 * lp(noise(n), 600) * env(n, 0.001, 0.04, 5))
def tap():
    n = int(0.05 * SR); return hp(noise(n), 2500) * env(n, 0.0005, 0.01, 5) * 0.5
def ding(f1=1318.5, f2=1760, g=1.0):
    n = int(0.8 * SR); t = tt(n)
    return g * 0.35 * (np.sin(2 * np.pi * f1 * t) * env(n, 0.002, 0.5, 4) + 0.7 * np.sin(2 * np.pi * f2 * t) * env(n, 0.002, 0.5, 4) * (t > 0.08))
def whoosh(dur=0.4, g=1.0):
    n = int(dur * SR); return g * lp(noise(n), 1800) * np.sin(np.pi * tt(n) / dur) ** 2 * 0.5
def flutter(dur=0.25):
    n = int(dur * SR); am = 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 22 * tt(n)))
    return bp(noise(n), 900, 5000) * am * np.sin(np.pi * tt(n) / dur) * 0.35
def clink(f=2400):
    n = int(0.4 * SR); t = tt(n)
    return (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 2.7 * t)) * env(n, 0.001, 0.25, 5) * 0.25
def step():
    n = int(0.08 * SR); return lp(noise(n), 900) * env(n, 0.001, 0.03, 5) * 0.5
def sad_bonk():
    n = int(0.6 * SR); fr = np.geomspace(400, 160, n)
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(n, 0.002, 0.45, 3) * 0.4


# ---------------------------------------------------------------- the timeline
put(kaching(), 0.02)
put(drain(0.5), S["DRAIN1"])
put(sad_bonk(), S["DRAIN1"] + 0.5)
put(rewind(S["DAY1"] - S["REWIND"]), S["REWIND"])
put(kaching() * 0.6, S["DAY1"])
put(whoosh(0.35), S["TOCORNER"] / 1)
for i in range(22):
    put(clack(), S["CUP0"] + i * 4.75 / FPS, 0.8, pan=0.3 if i % 2 else -0.1)
put(kaching() * 0.5, S["SUM"])
put(whoosh(0.35, 0.8), S["CLOSET"] - 0.1)
for k in range(4): put(step(), S["CLOSET"] + k * 0.18)
put(rustle(0.5), S["BAGS"] - 0.1)
for k in range(5): put(rustle(0.25), S["SPILL"] + k * 5 / FPS, 0.7, pan=0.3)
put(blip(600, 300, 0.2), S["TAGS"])
for k in ("TAP1", "TAP2", "TAP3"):
    put(tap(), S[k]); put(ding(1568, 2093, 0.5), S[k] + 0.03)
put(whoosh(0.4), S["MORNING"] - 0.1)
for i in range(7): put(thud(0.8), (QF["BOXES"] + i * 4 + 8) / FPS, pan=0.3)
put(blip(500, 220, 0.25), S["MINUS"])
put(thud(1.2), S["DROP"])
for k in range(int((QF["PILE_END"] - 20 - QF["DROP"]) / 6)):
    put(flutter(), (QF["DROP"] + k * 6) / FPS, 0.6, pan=0.4)
for k in range(5): put(clink(2200 + k * 120), (QF["DROP"] + k * 5 + 22) / FPS, 0.8, pan=-0.3)
put(ding(1046.5, 1568, 0.7), S["JAR_DONE"])
put(sad_bonk(), (QF["PILE_END"] - 20) / FPS)
put(whoosh(0.35), S["HOLE"] - 0.05)
for k in range(int((QF["STOP"] - QF["HOLE"]) / 9)): put(step(), (QF["HOLE"] + k * 9) / FPS, 0.6)
for k in range(int((QF["STOP"] - QF["HOLE"]) / 22) + 1): put(flutter(0.3), (QF["HOLE"] + 10 + k * 22) / FPS, 0.7, pan=-0.2)
put(sad_bonk(), S["POCKET"])
put(whoosh(1.0, 1.0), S["TRAIL"])
put(blip(700, 200, 0.35), S["TOTAL"])
put(whoosh(0.35), S["DAY30"] - 0.05)
for m in range(12): put(clink(2000 + m * 60), S["MONTHS"] + m * (S["MONTHS_END"] - S["MONTHS"]) / 12, 0.7)
put(kaching(), S["MONTHS_END"])
put(kaching() * 0.8, S["LEN"] - 0.6)

# ---------------------------------------------------------------- master: about -20 LUFS (quiet bed under the app music)
rms = np.sqrt(np.mean(buf ** 2)); buf *= db(-24) / max(rms, 1e-9)
ceil = db(-3); buf = np.tanh(buf / ceil) * ceil
sf.write(OUT / "sfx.wav", buf.astype(np.float32), SR, subtype="PCM_24")
print(f"sfx.wav {N / SR:.2f}s")
