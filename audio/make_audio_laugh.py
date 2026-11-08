"""Sound for "LET THEM LAUGH" (no voice-over): an ORIGINAL slowed-phonk style score (94.7 BPM, pitched cowbell lead, distorted 808,
funk drums) + synthesized SFX for every action (brush, crowd laughs, stones, skateboard, cart bell, paper, camera shutters).
No sample or melody is taken from any existing track. Times come from src/episodes/laugh/events.ts (shared with the picture).
usage: .venv/Scripts/python.exe audio/make_audio_laugh.py -> audio/laugh/mix.wav (+ music.wav, sfx.wav, sfx_only.wav)
Form (beats): 0 boom + riff alone (the hook) · 4 riser · 7 DROP 1 (the castle) · 40 one beat of silence · 41 groove (he runs)
· 44 riff + pad only (the painting) · 47 riser · 50 DROP 2 under the camera pull-back · 56 end."""
import pathlib
import re

import numpy as np
import soundfile as sf
from scipy import signal

HERE = pathlib.Path(__file__).resolve().parent
src = (HERE.parent / "src" / "episodes" / "laugh" / "events.ts").read_text(encoding="utf-8")
i0 = src.index("export const Q = {")
QF = {k: int(v) for k, v in re.findall(r"(\w+): (\d+)", src[i0:src.index("};", i0)])}
c0 = src.index("export const C = {")
CB = {k: float(v) for k, v in re.findall(r"(\w+): ([\d.]+)", src[c0:src.index("};", c0)])}
BPM = float(re.search(r"export const BPM = ([\d.]+)", src).group(1))
FPS, SR = 30, 48000
S = {k: v / FPS for k, v in QF.items()}
DUR = S["LEN"]
N = int(round(SR * DUR))
BT = 60 / BPM
def beat(n): return n * BT
OUT = HERE / "laugh"
OUT.mkdir(exist_ok=True)
rng = np.random.default_rng(51)


def tt(n): return np.arange(n) / SR
def db(x): return 10 ** (x / 20)
def put(buf, sig, t, g=1.0, pan=0.0):
    if sig.ndim == 1:
        l, r = np.sqrt(1 - pan) if pan > 0 else 1.0, np.sqrt(1 + pan) if pan < 0 else 1.0
        sig = np.stack([sig * l, sig * r], 1)
    i = int(round(t * SR))
    if i >= len(buf) or i + len(sig) <= 0: return
    a, b = max(0, -i), min(len(sig), len(buf) - i)
    buf[i + a:i + b] += g * sig[a:b]
def env(n, a=0.002, d=0.2, k=4.0):
    t = tt(n); return np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * k / max(d, 1e-4))
def lp(x, fc, o=2): return signal.sosfilt(signal.butter(o, fc, "low", fs=SR, output="sos"), x)
def hp(x, fc, o=2): return signal.sosfilt(signal.butter(o, fc, "high", fs=SR, output="sos"), x)
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo, hi], "band", fs=SR, output="sos"), x)
def noise(n): return rng.standard_normal(n)
def sq(f, n): return np.sign(np.sin(2 * np.pi * np.cumsum(np.broadcast_to(f, (n,))) / SR))
def midi(m): return 440 * 2 ** ((m - 69) / 12)


# ---------------------------------------------------------------- instruments
def cowbell(m, g=1.0, dur=0.22):
    n = int(dur * SR); f = midi(m)
    x = 0.6 * sq(f, n) + 0.45 * sq(f * 1.483, n)
    x = bp(x, f * 0.9, min(f * 6, 16000)) * env(n, 0.001, dur * 0.55, 4)
    return g * np.tanh(2.2 * x) * 0.6
def b808(m, dur, g=1.0):
    n = int(dur * SR); t = tt(n); f0 = midi(m)
    f = f0 * (2 ** np.exp(-t * 40))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR)
    e = np.minimum(1, t / 0.004) * np.exp(-t * 1.6) * np.minimum(1, (dur - t) / 0.03)
    return g * np.tanh(3.2 * x * e) * 0.75
def kick(g=1.0):
    n = int(0.3 * SR); t = tt(n)
    x = np.sin(2 * np.pi * np.cumsum(50 + 140 * np.exp(-t * 35)) / SR) * env(n, 0.001, 0.22, 4)
    return g * np.tanh(1.8 * (x + 0.3 * hp(noise(n), 3000) * env(n, 0.0005, 0.006, 5)))
def clap(g=1.0):
    n = int(0.28 * SR); x = bp(noise(n), 1000, 4500)
    e = sum(env(n, 0.0008, 0.01, 3) * (tt(n) >= k * 0.009) for k in range(3)) + 0.7 * env(n, 0.001, 0.16, 4)
    return g * np.tanh(1.5 * x * e) * 0.7
def hat(g=1.0, open_=False):
    n = int((0.2 if open_ else 0.05) * SR); return g * hp(noise(n), 8000, 4) * env(n, 0.0004, 0.15 if open_ else 0.025, 5) * 0.45
def boom(g=1.0):
    n = int(2.4 * SR); t = tt(n)
    x = np.sin(2 * np.pi * np.cumsum(32 + 70 * np.exp(-t * 7)) / SR) * env(n, 0.002, 1.8, 3)
    return g * np.tanh(2 * (x + 0.5 * lp(noise(n), 700) * env(n, 0.001, 0.2, 4)))
def crash(g=1.0):
    n = int(2.2 * SR); return g * hp(noise(n), 5000) * env(n, 0.001, 1.8, 3) * 0.4
def riser(dur, g=1.0):
    n = int(dur * SR); u = tt(n) / dur; x = noise(n); y = np.zeros(n); st = int(0.02 * SR)
    for i in range(0, n, st):
        c = 300 + 8000 * (i / n) ** 2; y[i:i + st] = bp(x[i:i + st], c, min(c * 1.7, 20000))
    return g * y * u ** 2 * 0.7
def revcym(dur=0.6, g=1.0):
    n = int(dur * SR); return g * hp(noise(n), 4000) * (tt(n) / dur) ** 3 * 0.5
def pad(ms, dur, g=1.0):
    n = int(dur * SR); x = np.zeros(n)
    for m in ms:
        for d in (-0.08, 0.0, 0.09):
            f = midi(m) * 2 ** (d / 12); x += 2 * ((tt(n) * f + rng.random()) % 1) - 1
    x = lp(x, 900) / (len(ms) * 3)
    return g * x * np.minimum(1, tt(n) / 0.4) * np.minimum(1, (dur - tt(n)) / 0.4)

# ---------------------------------------------------------------- composition (A minor; an original 2-bar riff, new for this film)
A1, C2, D2, E2, F2, G2 = 33, 36, 38, 40, 41, 43
RIFF_A = [81, None, 81, 79, None, 76, None, 79, 81, None, 84, None, 81, 79, None, 76,
          74, None, 76, None, 72, 74, None, 76, 79, None, 76, 74, None, 72, None, 69]
RIFF_B = [76, None, 76, 74, None, 72, None, 74, 76, None, 79, None, 76, 74, None, 72,
          69, None, 72, None, 74, None, 76, None, 81, None, 79, None, 76, None, 72, None]
BASS = [(0, 6, A1), (6, 4, A1), (10, 6, F2 - 12), (16, 6, C2), (22, 4, G2 - 12), (26, 6, E2 - 12)]
KICKS, CLAPS = [0, 3, 6, 10, 11], [4, 12]
S16 = BT / 4
END = DUR / BT
D1, SIL0, SIL1, CALM0, D2 = 7, 40, 41, 44, 50
def in_silence(t): return beat(SIL0) <= t < beat(SIL1)
def calm(t): return t < beat(D1) or beat(CALM0) <= t < beat(D2)

mus = np.zeros((N, 2))
put(mus, boom(0.9), 0.0)
for b2 in range(0, 58, 8):
    riff = RIFF_A if (b2 // 8) % 2 == 0 else RIFF_B
    for k, m in enumerate(riff):
        if m is None: continue
        t = beat(b2) + k * S16
        if t >= DUR or in_silence(t): continue
        put(mus, cowbell(m, 1.5 if calm(t) else 0.8), t, pan=0.15 if k % 2 else -0.15)
        if t >= beat(D2) and k % 4 == 0: put(mus, cowbell(m + 12, 0.25, 0.15), t, pan=0.4)
put(mus, pad([57, 60, 64], beat(23) - beat(D1), 0.22), beat(D1))
put(mus, pad([53, 57, 60], beat(SIL0) - beat(23), 0.22), beat(23))
put(mus, pad([57, 60, 64], beat(D2) - beat(CALM0), 0.32), beat(CALM0))
put(mus, pad([53, 57, 60], DUR - beat(D2), 0.22), beat(D2))
for k in range(8, int(END * 2)):
    t = k * BT / 2
    if in_silence(t): continue
    put(mus, hat(0.5 if calm(t) else 0.6, open_=(k % 4 == 3)), t, pan=0.3)
for b in list(range(D1, SIL0)) + list(range(SIL1, CALM0)) + list(range(D2, int(np.ceil(END)))):
    for s16 in (1, 3): put(mus, hat(0.3), beat(b) + s16 * S16, pan=-0.3)
put(mus, riser(beat(D1) - beat(4), 0.8), beat(4))
put(mus, riser(beat(D2) - beat(47), 0.8), beat(47))
def groove(b0, b1, g=1.0):
    for bar in range(b0, b1, 4):
        for s in KICKS:
            t = beat(bar) + s * S16
            if t < beat(b1): put(mus, kick(g), t)
        for s in CLAPS:
            t = beat(bar) + s * S16
            if t < beat(b1): put(mus, clap(0.8 * g), t)
    for b2 in range(b0, b1, 8):
        for s, L, m in BASS:
            t = beat(b2) + s * S16
            if t >= beat(b1): continue
            put(mus, b808(m, min(L * S16, beat(b1) - t), 0.85 * g), t)
groove(D1, SIL0)
put(mus, revcym(BT, 1.0), beat(SIL0 - 1))
groove(SIL1, CALM0, 1.05)
groove(D2, int(np.ceil(END)), 1.1)
for b in (D1, SIL1, D2):
    put(mus, crash(0.8), beat(b)); put(mus, boom(0.7), beat(b))

# ---------------------------------------------------------------- sfx
sfx = np.zeros((N, 2))
def tick(f0=3000, g=1.0):
    n = int(0.025 * SR); return g * (0.6 * hp(noise(n), 3000) * env(n, 0.0003, 0.004, 5) + 0.5 * np.sin(2 * np.pi * f0 * tt(n)) * env(n, 0.0005, 0.01, 6))
def chime(f=1318.5, g=1.0):
    n = int(1.2 * SR); t = tt(n)
    return g * sum(np.sin(2 * np.pi * f * h * t) * (0.5 / h) * np.exp(-t * (2 + h)) for h in (1, 2.01, 3.02)) * 0.5
def whoosh(dur=0.35, g=1.0): n = int(dur * SR); return g * lp(noise(n), 2200) * np.sin(np.pi * tt(n) / dur) ** 2 * 0.5
def clink(g=1.0):
    n = int(0.4 * SR); t = tt(n)
    return g * (sum(np.sin(2 * np.pi * f * t) for f in (2100, 3170, 4420)) * env(n, 0.0005, 0.25, 5) * 0.18 + 0.3 * hp(noise(n), 4000) * env(n, 0.0005, 0.01, 5))
def thud(g=1.0):
    n = int(0.3 * SR); t = tt(n); return g * np.sin(2 * np.pi * np.cumsum(60 + 90 * np.exp(-t * 30)) / SR) * env(n, 0.001, 0.15, 5)
def stone(g=1.0):
    n = int(0.25 * SR); t = tt(n)
    return g * (0.8 * np.sin(2 * np.pi * np.cumsum(110 + 160 * np.exp(-t * 40)) / SR) * env(n, 0.0005, 0.08, 5) + 0.5 * bp(noise(n), 600, 3500) * env(n, 0.0005, 0.03, 5))
def brush(dur, g=1.0):
    n = int(dur * SR); t = tt(n); am = 0.7 + 0.3 * np.sin(2 * np.pi * 9 * t)
    return g * bp(noise(n), 900, 5000) * am * np.sin(np.pi * t / dur) ** 0.6 * 0.35
def drip(g=1.0):
    n = int(0.12 * SR); t = tt(n); return g * np.sin(2 * np.pi * np.cumsum(900 + 1400 * t / 0.12) / SR) * env(n, 0.001, 0.05, 5) * 0.4
def ha(f0, dur=0.11):
    """one voiced 'ha': a glottal buzz shaped by two formants + breath"""
    n = int(dur * SR); t = tt(n)
    f = f0 * (1 + 0.03 * np.sin(2 * np.pi * 6 * t)) * (1 - 0.15 * t / dur)
    buzz = 2 * ((np.cumsum(f) / SR) % 1) - 1
    v = bp(buzz, 600, 900) * 1.2 + bp(buzz, 1100, 1500) * 0.7 + bp(noise(n), 800, 3000) * 0.25
    return v * np.sin(np.pi * np.minimum(1, t / dur)) ** 0.7
def laugh(f0=210, k=4, gap=0.15):
    out = np.zeros(int((k * gap + 0.2) * SR))
    for i in range(k):
        s = ha(f0 * (1 - 0.05 * i)); j = int(i * gap * SR); out[j:j + len(s)] += s * (1 - 0.12 * i)
    return out
def crowd_laugh(g=1.0, voices=5):
    out = np.zeros((int(1.2 * SR), 2))
    for v in range(voices):
        s = laugh(150 + rng.random() * 140, 3 + int(rng.random() * 3), 0.12 + rng.random() * 0.06)
        put(out, s, rng.random() * 0.12, 1.0, pan=rng.random() * 1.4 - 0.7)
    return g * np.tanh(out * 1.5) * 0.5
def roll(dur, g=1.0):
    n = int(dur * SR); t = tt(n)
    x = lp(noise(n), 400) * 0.6 + bp(noise(n), 1500, 3000) * 0.08 * (1 + np.sign(np.sin(2 * np.pi * 14 * t))) / 2
    return g * x * np.minimum(1, t / 0.05) * np.minimum(1, (dur - t) / 0.08)
def wood(g=1.0):
    n = int(0.25 * SR); t = tt(n)
    return g * (np.sin(2 * np.pi * np.cumsum(180 + 120 * np.exp(-t * 60)) / SR) * env(n, 0.0005, 0.08, 5) + 0.4 * bp(noise(n), 800, 3000) * env(n, 0.0005, 0.02, 5))
def bell(g=1.0):
    n = int(1.0 * SR); t = tt(n)
    return g * sum(np.sin(2 * np.pi * f * t) * a * np.exp(-t * d) for f, a, d in ((2637, 0.5, 4), (3951, 0.3, 6), (5274, 0.2, 8))) * 0.35
def paper(g=1.0):
    n = int(0.3 * SR); t = tt(n); grains = (rng.random(n) < 0.05) * noise(n)
    return g * (hp(grains, 2500) * 1.2 + bp(noise(n), 3000, 9000) * 0.15) * np.sin(np.pi * t / 0.3)
def step(g=1.0):
    n = int(0.12 * SR); return g * lp(noise(n), 1200) * env(n, 0.001, 0.04, 5) * 0.5
def shutter(g=1.0):
    n = int(0.12 * SR); t = tt(n)
    c1 = hp(noise(n), 3000) * env(n, 0.0003, 0.008, 5); c2 = np.roll(c1, int(0.05 * SR)) * 0.8
    return g * (c1 + c2) * 0.6
def hiss(dur, g=1.0):
    n = int(dur * SR); t = tt(n)
    return g * bp(noise(n), 1500, 7000) * 0.06 * np.minimum(1, t / 0.15) * np.minimum(1, (dur - t) / 0.2)

def L(seg, beats=0.0, frames=0.0): return S[seg] + beats * BT + frames / FPS
for k in ("S1", "S2", "S3", "S4", "S5"):
    put(sfx, whoosh(0.35, 0.8), S[k] - 0.15)
# 0 · the brush, drips, the half circle, the laughs
put(sfx, brush((CB["ST1B"] - CB["ST1A"]) * BT, 1.0), L("S0", CB["ST1A"]))
put(sfx, brush((CB["ST2B"] - CB["ST2A"]) * BT, 0.9), L("S0", CB["ST2A"]))
put(sfx, brush((CB["ARCB"] - CB["ARCA"]) * BT, 0.6), L("S0", CB["ARCA"]))
for k, bt in enumerate((0.6, 1.2, 2.2, 2.7)):
    put(sfx, drip(0.8), L("S0", bt + 0.3), pan=0.2 * (k - 1.5))
for k in ("LAUGH1", "LAUGH2", "LAUGH3", "LAUGH4"):
    put(sfx, crowd_laugh(1.0, 4 if k != "LAUGH4" else 6), L("S0", CB[k]))
put(sfx, tick(2400, 0.6), L("S0", CB["TXT0"]))
# 1 · a stone thrown and caught on every beat, the build, the flag
for k in range(int(CB["CATCHN"] - CB["CATCH0"]) + 1):
    c = L("S1", CB["CATCH0"] + k)
    put(sfx, whoosh(0.4, 0.7), c - 14 / FPS, pan=-0.4)
    put(sfx, stone(1.0), c); put(sfx, thud(0.7), c + 0.05)
put(sfx, crowd_laugh(0.5, 3), L("S1", 0.3), pan=-0.5)
put(sfx, chime(1568, 1.0), L("S1", CB["FLAG1"])); put(sfx, boom(0.4), L("S1", CB["FLAG1"]))
put(sfx, tick(2400, 0.6), L("S1", CB["TXT1A"])); put(sfx, tick(3000, 0.7), L("S1", CB["TXT1B"]))
# 2 · rides, falls, laughs; the run that works, the silence
for k in ("FALL1", "FALL2", "FALL3"):
    a = L("S2", CB[k])
    put(sfx, roll(16 / FPS, 1.0), a)
    put(sfx, wood(1.0), a + 16 / FPS); put(sfx, thud(1.0), a + 28 / FPS); put(sfx, wood(0.7), a + 30 / FPS)
    put(sfx, crowd_laugh(1.0, 5), a + 30 / FPS)
put(sfx, roll(17 / FPS, 1.1), L("S2", CB["GO"]))
put(sfx, whoosh(0.7, 1.0), L("S2", CB["GO"], 17))
put(sfx, chime(1568, 1.0), L("S2", CB["WOW"])); put(sfx, boom(0.5), L("S2", CB["AIR"]))
put(sfx, tick(2400, 0.6), L("S2", CB["TXT2A"])); put(sfx, tick(3000, 0.7), L("S2", CB["TXT2B"]))
# 3 · the cart: a laugh, the bell for every customer, the sign, steam
put(sfx, hiss(S["S4"] - S["S3"], 0.8), L("S3"), pan=0.3)
put(sfx, crowd_laugh(0.8, 2), L("S3", 0.6), pan=-0.4)
for i in range(6):
    put(sfx, bell(0.7), L("S3", CB["CUST0"] + i, 16)); put(sfx, step(0.5), L("S3", CB["CUST0"] + i, 4))
put(sfx, chime(1318.5, 0.9), L("S3", CB["OPEN3"])); put(sfx, clink(0.5), L("S3", CB["MORE"]))
put(sfx, tick(2400, 0.6), L("S3", CB["TXT3A"])); put(sfx, tick(3000, 0.7), L("S3", CB["TXT3B"]))
# 4 · heavy slow steps, a sheet stuffed on every beat, the drop, running
for s in range(int(CB["DROP"] * 2)):
    put(sfx, step(0.9), L("S4", s * 0.5 + 0.25), pan=-0.2)
for k in range(5):
    put(sfx, paper(1.0), L("S4", CB["SHEET0"] + k)); put(sfx, thud(0.35), L("S4", CB["SHEET0"] + k))
put(sfx, thud(1.2), L("S4", CB["DROP"], 10)); put(sfx, paper(1.0), L("S4", CB["DROP"], 11)); put(sfx, boom(0.5), L("S4", CB["DROP"], 10))
for s in range(12):
    put(sfx, step(0.7), L("S4", CB["RUN"], s * 5.5), pan=0.2)
put(sfx, tick(2400, 0.6), L("S4", CB["TXT4A"])); put(sfx, tick(3000, 0.7), L("S4", CB["TXT4B"]))
# 5 · the painting fills in (a brush per stage), the pull-back, the phones, the circle
for k in range(7):
    put(sfx, brush(0.45, 0.7), L("S5", k), pan=0.3 * ((k % 3) - 1))
put(sfx, whoosh(1.2, 1.0), L("S5", CB["PULL0"]))
for i in range(6):
    put(sfx, shutter(0.9), L("S5", 9 + (i % 3) * 0.33, i), pan=(i - 2.5) * 0.25)
put(sfx, brush(0.4, 0.6), L("S5", CB["RING"])); put(sfx, chime(1568, 1.0), L("S5", CB["RING"] + 0.5))
put(sfx, tick(2400, 0.6), L("S5", CB["TXT5A"])); put(sfx, tick(3000, 0.7), L("S5", CB["TXT5B"]))

# ---------------------------------------------------------------- mix
def norm(x, p=0.9): m = np.max(np.abs(x)); return x * p / m if m else x
mix = norm(mus, 0.8) * db(-1) + norm(sfx, 0.8) * db(-3)
lvl = np.sqrt(signal.sosfilt(signal.butter(1, 8, "low", fs=SR, output="sos"), (mix ** 2).mean(1)) + 1e-9)
mix = mix * np.minimum(1, (db(-14) / lvl) ** 0.5)[:, None]
mix = mix * db(-13.6) / np.sqrt(np.mean(mix ** 2))
ceil = db(-2.2); mix = np.tanh(mix / ceil) * ceil
fade = int(0.01 * SR); mix[:fade] *= np.linspace(0, 1, fade)[:, None]
tail = int(0.4 * SR); mix[-tail:] *= np.linspace(1, 0, tail)[:, None]
sfx_only = norm(sfx, 0.8)
sfx_only = sfx_only * db(-22) / max(np.sqrt(np.mean(sfx_only ** 2)), 1e-9)
sfx_only = np.tanh(sfx_only / db(-3)) * db(-3)
sf.write(OUT / "sfx_only.wav", sfx_only.astype(np.float32), SR, subtype="PCM_24")
sf.write(OUT / "music.wav", mus.astype(np.float32), SR)
sf.write(OUT / "sfx.wav", sfx.astype(np.float32), SR)
sf.write(OUT / "mix.wav", mix.astype(np.float32), SR, subtype="PCM_24")
print(f"mix.wav {len(mix) / SR:.3f}s at {BPM} BPM, peak {20 * np.log10(np.max(np.abs(mix))):.2f} dBFS")
