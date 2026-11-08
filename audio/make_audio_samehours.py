"""Sound for "SAME HOURS" (no voice): an ORIGINAL slowed-phonk style score (94.7 BPM, pitched cowbell lead, distorted 808,
Brazilian-funk style drums) + synthesized SFX for every action. No sample or melody is taken from any existing track.
Times come from src/episodes/samehours/events.ts (shared with the picture).
usage: .venv/Scripts/python.exe audio/make_audio_samehours.py -> audio/samehours/mix.wav (+ music.wav, sfx.wav, sfx_only.wav)
Form (beats): 0 boom + cowbell riff alone (the hook) · 8 hats · 9 riser · 12 DROP 1 · 41 one beat of silence · 42 riff + pad only
(the waiting) · 46 riser · 48 DROP 2 under the camera reveal · 54 end."""
import pathlib
import re

import numpy as np
import soundfile as sf
from scipy import signal

HERE = pathlib.Path(__file__).resolve().parent
src = (HERE.parent / "src" / "episodes" / "samehours" / "events.ts").read_text(encoding="utf-8")
i0 = src.index("export const Q = {")
QF = {k: int(v) for k, v in re.findall(r"(\w+): (\d+)", src[i0:src.index("};", i0)])}
c0 = src.index("export const C = {")
CF = {k: float(v) for k, v in re.findall(r"(\w+): ([\d.]+)", src[c0:src.index("};", c0)])}
BPM = float(re.search(r"export const BPM = ([\d.]+)", src).group(1))
FPS, SR = 30, 48000
S = {k: v / FPS for k, v in QF.items()}
DUR = S["LEN"]
N = int(round(SR * DUR))
BT = 60 / BPM
def beat(n): return n * BT
OUT = HERE / "samehours"
OUT.mkdir(exist_ok=True)
rng = np.random.default_rng(47)


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

# ---------------------------------------------------------------- composition (G minor; an original 2-bar riff, new for this film)
G2, Bb2, D3, F2, Eb2, C3 = 31, 34, 38, 29, 27, 36
RIFF_A = [79, None, 79, 77, None, 74, None, 77, 79, None, 82, None, 79, 77, None, 74,
          72, None, 74, None, 70, 72, None, 74, 77, None, 74, 72, None, 70, None, 67]
RIFF_B = [74, None, 74, 72, None, 70, None, 72, 74, None, 77, None, 74, 72, None, 70,
          67, None, 70, None, 72, None, 74, None, 79, None, 77, None, 74, None, 70, None]
BASS = [(0, 6, G2), (6, 4, G2), (10, 6, Eb2), (16, 6, Bb2 - 12 + 12), (22, 4, F2), (26, 6, D3 - 12)]
KICKS, CLAPS = [0, 3, 6, 10, 11], [4, 12]
S16 = BT / 4
END = DUR / BT
def in_silence(t): return beat(41) <= t < beat(42)
def calm(t): return t < beat(12) or beat(42) <= t < beat(48)

mus = np.zeros((N, 2))
put(mus, boom(0.9), 0.0)
for b2 in range(0, 56, 8):
    riff = RIFF_A if (b2 // 8) % 2 == 0 else RIFF_B
    for k, m in enumerate(riff):
        if m is None: continue
        t = beat(b2) + k * S16
        if t >= DUR or in_silence(t): continue
        put(mus, cowbell(m, 1.5 if calm(t) else 0.8), t, pan=0.15 if k % 2 else -0.15)
        if t >= beat(48) and k % 4 == 0: put(mus, cowbell(m + 12, 0.25, 0.15), t, pan=0.4)
for b4 in (12, 28):
    ch = [55, 58, 62] if b4 == 12 else [51, 55, 58]
    put(mus, pad(ch, min(16 * BT, beat(41) - beat(b4)), 0.22), beat(b4))
put(mus, pad([55, 58, 62], beat(48) - beat(42), 0.32), beat(42))
put(mus, pad([51, 55, 58], DUR - beat(48), 0.22), beat(48))
for k in range(16, int(END * 2)):
    t = k * BT / 2
    if in_silence(t): continue
    put(mus, hat(0.5 if calm(t) else 0.6, open_=(k % 4 == 3)), t, pan=0.3)
for b in list(range(12, 41)) + list(range(48, int(np.ceil(END)))):
    for s16 in (1, 3): put(mus, hat(0.3), beat(b) + s16 * S16, pan=-0.3)
put(mus, riser(beat(12) - beat(9), 0.8), beat(9))
put(mus, riser(beat(48) - beat(45), 0.8), beat(45))
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
groove(12, 41)
put(mus, revcym(BT, 1.0), beat(40))
groove(48, int(np.ceil(END)), 1.1)
for b in (12, 48):
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
def crunch(g=1.0):
    n = int(0.9 * SR); grains = lp((rng.random(n) < 0.03) * noise(n), 5000); x = grains * 3 + lp(noise(n), 300) * env(n, 0.002, 0.4, 4)
    return g * np.tanh(x) * 0.7
def thud(g=1.0):
    n = int(0.3 * SR); t = tt(n); return g * np.sin(2 * np.pi * np.cumsum(60 + 90 * np.exp(-t * 30)) / SR) * env(n, 0.001, 0.15, 5)
def snap(g=1.0):
    n = int(0.18 * SR); t = tt(n)
    return g * (0.9 * hp(noise(n), 2500) * env(n, 0.0003, 0.012, 5) + 0.5 * np.sin(2 * np.pi * 3400 * t) * env(n, 0.0003, 0.03, 6) + 0.4 * lp(noise(n), 900) * env(n, 0.001, 0.05, 5))
def rasp(dur=0.3, g=1.0):
    n = int(dur * SR); t = tt(n); am = 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 38 * t))
    return g * bp(noise(n), 1800, 6500) * am * np.sin(np.pi * t / dur) * 0.35
def hiss(dur, g=1.0):
    n = int(dur * SR); t = tt(n)
    return g * bp(noise(n), 1500, 7000) * 0.09 * np.minimum(1, t / 0.15) * np.minimum(1, (dur - t) / 0.2) * (0.8 + 0.2 * np.sin(2 * np.pi * 3 * t))
def crackle(dur, g=1.0, rate=0.004):
    n = int(dur * SR); grains = (rng.random(n) < rate) * noise(n)
    return g * (hp(lp(grains, 6000), 900) * 0.8 + lp(noise(n), 500) * 0.03)
def pfft(g=1.0):
    n = int(0.6 * SR); return g * lp(noise(n), 1400) * env(n, 0.005, 0.25, 4) * 0.8
def page(g=1.0):
    n = int(0.22 * SR); t = tt(n); return g * bp(noise(n), 2500, 9000) * np.sin(np.pi * t / 0.22) ** 2 * 0.25
def wood(g=1.0):
    n = int(0.25 * SR); t = tt(n)
    return g * (np.sin(2 * np.pi * np.cumsum(180 + 120 * np.exp(-t * 60)) / SR) * env(n, 0.0005, 0.08, 5) + 0.4 * bp(noise(n), 800, 3000) * env(n, 0.0005, 0.02, 5))
def step(g=1.0):
    n = int(0.12 * SR); return g * lp(noise(n), 1200) * env(n, 0.001, 0.04, 5) * 0.5
def glass(g=1.0):
    n = int(0.8 * SR); t = tt(n); return g * sum(np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, d in ((1870, 5), (2950, 7), (4410, 9))) * 0.12

def L(seg, fr): return S[seg] + fr / FPS
for k in ("S2", "S3", "S4", "S5"):
    put(sfx, whoosh(0.35, 0.8), S[k] - 0.15)
# 1 · bricks: one landing per half beat (both lanes at once), the hops, the flag
for k in range(21):
    t = L("S1", CF["LAND0"] + k * CF["HALF"])
    put(sfx, thud(0.75), t); put(sfx, clink(0.12), t, pan=-0.3)
for c in range(6):
    put(sfx, whoosh(0.18, 0.4), L("S1", CF["LAND0"] + ((c + 1) * (c + 2) / 2 - 1) * CF["HALF"] + 2))
put(sfx, chime(1568, 1.0), L("S1", CF["FLAG1"]))
put(sfx, tick(2400, 0.6), L("S1", CF["LINE1A"])); put(sfx, tick(3000, 0.7), L("S1", CF["LINE1B"]))
# 2 · keys: three snaps + the stubs hitting the floor; filing on the beat; footsteps; unlock and the door
for k in ("SNAP1", "SNAP2", "SNAP3"):
    put(sfx, snap(1.0), L("S2", CF[k]), pan=0.2); put(sfx, clink(0.5), L("S2", CF[k] + 26), pan=-0.4)
for b in range(6):
    put(sfx, rasp(0.3, 0.9), L("S2", CF["FILE0"] + b * BT * FPS), pan=-0.3)
for s in range(6):
    put(sfx, step(0.6), L("S2", CF["FILE1"] + 14 + s * 4.5))
put(sfx, tick(1500, 1.0), L("S2", CF["UNLOCK"])); put(sfx, clink(0.4), L("S2", CF["UNLOCK"] + 3))
put(sfx, whoosh(0.6, 0.9), L("S2", CF["OPEN"])); put(sfx, chime(1318.5, 1.0), L("S2", CF["OPEN"] + 2)); put(sfx, thud(0.6), L("S2", CF["OPEN"]))
# 3 · sand and rocks
put(sfx, hiss((CF["SAND_T1"] - CF["SAND_T0"]) / FPS, 1.0), L("S3", CF["SAND_T0"]), pan=0.2)
put(sfx, hiss((CF["SAND_B1"] - CF["SAND_B0"]) / FPS, 1.0), L("S3", CF["SAND_B0"]), pan=-0.2)
put(sfx, crunch(0.5), L("S3", CF["ROCK_T1"])); put(sfx, thud(0.6), L("S3", CF["ROCK_T1"]))
put(sfx, thud(0.6), L("S3", CF["ROCK_T2"])); put(sfx, glass(0.6), L("S3", CF["ROCK_T2"])); put(sfx, thud(0.9), L("S3", CF["ROCK_T2"] + 20))
for k in ("ROCK_B1", "ROCK_B2", "ROCK_B3"):
    put(sfx, thud(1.0), L("S3", CF[k])); put(sfx, glass(0.5), L("S3", CF[k]))
put(sfx, clink(0.9), L("S3", CF["LID"])); put(sfx, chime(1568, 0.9), L("S3", CF["LID"] + 4))
# 4 · the candles: a loud fast crackle that dies, a quiet steady one; pages turning
put(sfx, crackle(CF["OUT"] / FPS, 1.0, 0.006), L("S4", 0), pan=0.25)
put(sfx, crackle(S["S5"] - S["S4"], 0.45, 0.0015), L("S4", 0), pan=-0.25)
put(sfx, pfft(1.0), L("S4", CF["OUT"])); put(sfx, thud(0.5), L("S4", CF["OUT"]))
for b in range(0, 10, 2):
    put(sfx, page(1.0), L("S4", b * BT * FPS), pan=-0.3)
put(sfx, chime(1318.5, 0.9), L("S4", CF["DAY365"]))
# 5 · the bridge: watch ticks, a knock per plank, the reveal, steps, the flag
for b in range(0, 8, 2):
    put(sfx, tick(4200, 0.5), L("S5", b * BT * FPS + 8), pan=0.3)
for i in range(7):
    put(sfx, wood(1.0), L("S5", CF["PLANK0"] + i * CF["PLANKD"]))
put(sfx, whoosh(0.9, 1.0), L("S5", CF["REVEAL0"]))
for s in range(7):
    put(sfx, step(0.6), L("S5", CF["PLANK0"] + 6 * CF["PLANKD"] + 6 + s * 5))
put(sfx, chime(1568, 1.0), L("S5", CF["FLAG5"])); put(sfx, boom(0.5), L("S5", CF["FLAG5"]))
put(sfx, tick(2400, 0.6), L("S5", CF["LINE5A"])); put(sfx, tick(3000, 0.7), L("S5", CF["LINE5B"]))

# ---------------------------------------------------------------- mix
def norm(x, p=0.9): m = np.max(np.abs(x)); return x * p / m if m else x
mix = norm(mus, 0.8) * db(-1) + norm(sfx, 0.8) * db(-4)
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
