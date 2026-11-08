"""Sound for "SMALL TRUTHS" (no voice): an ORIGINAL slowed-phonk style score (95 BPM, pitched cowbell lead, distorted 808 with
pitch glides, Brazilian-funk style drums, heavy compression) + synthesized SFX. Written for this film; no sample or melody is
taken from any existing track. Times come from src/episodes/truths/events.ts (single source of time shared with the picture).
usage: .venv/Scripts/python.exe audio/make_audio_truths.py -> audio/truths/mix.wav (+ music.wav, sfx.wav)
Form (beats): 0 boom + cowbell riff alone · 12 hats · 20 riser · 24 DROP 1 (808 + drums) · 46 break · 48 DROP 2 (bigger)
· 83 one beat of silence · 84 DROP 3 · 96 end."""
import pathlib
import re

import numpy as np
import soundfile as sf
from scipy import signal

HERE = pathlib.Path(__file__).resolve().parent
src = (HERE.parent / "src" / "episodes" / "truths" / "events.ts").read_text(encoding="utf-8")
i0 = src.index("export const Q = {")
QF = {k: int(v) for k, v in re.findall(r"(\w+): (\d+)", src[i0:src.index("};", i0)])}
BPM = float(re.search(r"export const BPM = ([\d.]+)", src).group(1))
FPS, SR = 30, 48000
S = {k: v / FPS for k, v in QF.items()}
DUR = S["LEN"]
N = int(round(SR * DUR))
BT = 60 / BPM            # one beat in seconds
def beat(n): return n * BT
OUT = HERE / "truths"
OUT.mkdir(exist_ok=True)
rng = np.random.default_rng(95)


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
    """pitched phonk cowbell: two detuned squares a fifth-ish apart, band-passed, fast decay, a bit of drive"""
    n = int(dur * SR); f = midi(m)
    x = 0.6 * sq(f, n) + 0.45 * sq(f * 1.483, n)
    x = bp(x, f * 0.9, min(f * 6, 16000)) * env(n, 0.001, dur * 0.55, 4)
    return g * np.tanh(2.2 * x) * 0.6
def b808(m, dur, g=1.0, glide=True):
    """808: sine with a fast pitch drop into the note, long body, heavy saturation"""
    n = int(dur * SR); t = tt(n); f0 = midi(m)
    f = f0 * (2 ** (np.exp(-t * 40) * (1.0 if glide else 0.3)))
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
    n = int(dur * SR); return g * (hp(noise(n), 4000) * (tt(n) / dur) ** 3)[::1] * 0.5
def pad(ms, dur, g=1.0):
    n = int(dur * SR); x = np.zeros(n)
    for m in ms:
        for d in (-0.08, 0.0, 0.09):
            f = midi(m) * 2 ** (d / 12); x += 2 * ((tt(n) * f + rng.random()) % 1) - 1
    x = lp(x, 900) / (len(ms) * 3)
    a = np.minimum(1, tt(n) / 0.4) * np.minimum(1, (dur - tt(n)) / 0.4)
    return g * x * a

# ---------------------------------------------------------------- composition (G minor; an original 2-bar riff)
G2, Bb2, C3, D3, F2, Eb2 = 31, 34, 36, 38, 29, 27  # one octave down: the 808 sits around 40-60 Hz like slowed phonk
# cowbell riff: 32 sixteenth slots over 2 bars, None = rest (pitches in MIDI: G4=67 Bb4=70 C5=72 D5=74 F5=77 G5=79)
RIFF_A = [79, None, 77, 74, None, 74, 72, None, 74, None, 70, None, 72, 74, None, 67,
          79, None, 77, 74, None, 77, 79, None, 82, None, 79, 77, None, 74, 72, None]
RIFF_B = [74, None, 72, 70, None, 70, 67, None, 70, None, 72, None, 74, None, 77, None,
          79, None, 77, None, 74, 72, None, 70, 72, None, 74, None, 70, None, 67, None]
# 808 line per 2 bars: (start 16th, length in 16ths, midi)
BASS = [(0, 6, G2), (6, 4, G2), (10, 6, Bb2), (16, 6, Eb2 + 12 - 12), (22, 4, F2), (26, 6, D3 - 12)]
# Brazilian-funk style groove per bar (16ths): kick + clap pattern
KICKS, CLAPS, HATS16 = [0, 3, 6, 10, 11], [4, 12], range(16)

mus = np.zeros((N, 2))
S16 = BT / 4
def in_silence(t): return beat(83) <= t < beat(84)

# boom on frame 0 (the hook)
put(mus, boom(0.9), 0.0)
# cowbell riff all along (A for the first half of each 4 bars, B for the second), louder from the drops
for b2 in range(0, 96, 8):                  # every 2 bars = 8 beats
    riff = RIFF_A if (b2 // 8) % 2 == 0 else RIFF_B
    for k, m in enumerate(riff):
        if m is None: continue
        t = beat(b2) + k * S16
        if t >= DUR or in_silence(t): continue
        g = 1.5 if t < beat(24) else 0.8  # the riff carries the hook alone: keep the intro only ~6-8 dB under the drop
        put(mus, cowbell(m, g), t, pan=0.15 if k % 2 else -0.15)
        if t >= beat(48) and k % 4 == 0:
            put(mus, cowbell(m + 12, 0.25, 0.15), t, pan=0.4)
# dark pad under everything after the first drop
for b4 in range(24, 96, 16):
    ch = [55, 58, 62] if (b4 // 16) % 2 == 0 else [51, 55, 58]
    put(mus, pad(ch, min(16 * BT, DUR - beat(b4)), 0.22), beat(b4))
# hats from beat 12 (8ths), 16ths after the drops, little rolls every 4 bars
for k in range(int(12 * 2), int(96 * 2)):
    t = k * BT / 2
    if in_silence(t) or beat(46) <= t < beat(48): continue
    put(mus, hat(0.5 if t < beat(24) else 0.6, open_=(k % 4 == 3)), t, pan=0.3)
for b in range(24, 96):
    for s16 in (1, 3):
        t = beat(b) + s16 * S16
        if not in_silence(t) and not (beat(46) <= t < beat(48)): put(mus, hat(0.3), t, pan=-0.3)
put(mus, riser(beat(24) - beat(20), 0.8), beat(20))
# drums + 808 in the three drops
def groove(b0, b1, g=1.0):
    for bar in range(b0, b1, 4):
        for s in KICKS:
            t = beat(bar) + s * S16
            if t < beat(b1) and not in_silence(t): put(mus, kick(g), t)
        for s in CLAPS:
            t = beat(bar) + s * S16
            if t < beat(b1) and not in_silence(t): put(mus, clap(0.8 * g), t)
    for b2 in range(b0, b1, 8):
        for s, L, m in BASS:
            t = beat(b2) + s * S16
            if t >= beat(b1) or in_silence(t): continue
            dur = min(L * S16, beat(b1) - t, (beat(83) - t) if t < beat(83) else 99)
            put(mus, b808(m, dur, 0.85 * g), t)
groove(24, 46)
put(mus, revcym(beat(48) - beat(46), 0.9), beat(46)); put(mus, riser(beat(48) - beat(46), 0.6), beat(46))
groove(48, 96, 1.1)
for b in (24, 48, 84):
    put(mus, crash(0.8), beat(b)); put(mus, boom(0.6 if b != 48 else 0.8), beat(b))
put(mus, revcym(BT, 1.0), beat(83))      # suck into the last drop
put(mus, boom(0.7), beat(95))

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
def scrape(dur, g=1.0): n = int(dur * SR); return g * bp(noise(n), 200, 1200) * (0.6 + 0.4 * np.sin(2 * np.pi * 2.2 * tt(n))) * 0.12
def thunder(g=1.0):
    n = int(2.0 * SR); x = lp(noise(n), 400) * env(n, 0.01, 1.4, 3) + 0.6 * hp(noise(n), 1500) * env(n, 0.001, 0.05, 5)
    return g * np.tanh(2 * x) * 0.8
def rain(dur, g=1.0): n = int(dur * SR); return g * hp(lp(noise(n), 7000), 1500) * 0.06 * np.minimum(1, tt(n) / 0.3) * np.minimum(1, (dur - tt(n)) / 0.3)
def plip(g=1.0):
    n = int(0.25 * SR); t = tt(n); f = 900 + 1300 * np.exp(-t * 40)
    return g * np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.08, 5) * 0.6
def crunch(g=1.0):
    n = int(0.9 * SR); grains = lp((rng.random(n) < 0.03) * noise(n), 5000); x = grains * 3 + lp(noise(n), 300) * env(n, 0.002, 0.4, 4)
    return g * np.tanh(x) * 0.7
def thud(g=1.0):
    n = int(0.3 * SR); t = tt(n); return g * np.sin(2 * np.pi * np.cumsum(60 + 90 * np.exp(-t * 30)) / SR) * env(n, 0.001, 0.15, 5)

# segment whooshes
for k in ("S2", "S3", "S4", "S5", "S6", "S7", "S8"):
    put(sfx, whoosh(0.35, 0.8), S[k] - 0.15)
# 1 · the count: ticks speeding up with the counter, then the multiplier hit
c0, c1 = S["COUNT0"], S["COUNT1"]; t = c0; step = 0.16
while t < c1:
    put(sfx, tick(2600 + 1400 * (t - c0) / (c1 - c0), 0.7), t, pan=0.2); step = max(0.03, step * 0.93); t += step
put(sfx, chime(1568, 1.0), S["MULT"]); put(sfx, thud(0.8), S["MULT"])
# 2 · chains: a scrape under the walk, a clink at every cut
put(sfx, scrape(S["S3"] - S["S2"], 1.0), S["S2"])
for k in ("CUT1", "CUT2", "CUT3"):
    put(sfx, clink(1.0), S[k], pan=-0.2)
# 3 · rain, thunder, summit
put(sfx, rain(S["S4"] - S["S3"], 1.0), S["S3"])
for k in ("BOLT1", "BOLT2"):
    put(sfx, thunder(0.9), S[k])
put(sfx, chime(1318.5, 0.9), S["SUMMIT"])
# 4 · drops on every beat, the crack, the split
for k in range(10):
    put(sfx, plip(0.9), S["S4"] + beat(k) + 10 / FPS)
put(sfx, crunch(0.6), S["CRACK"]); put(sfx, crunch(1.0), S["SPLIT"]); put(sfx, thud(1.0), S["SPLIT"])
# 5 · the bucket: a pull and a fall at every grab, a chime on the escape
for k in ("GRAB1", "GRAB2", "GRAB3"):
    put(sfx, whoosh(0.25, 0.9), S[k]); put(sfx, thud(0.9), S[k] + 12 / FPS)
put(sfx, chime(1568, 0.9), S["ESCAPE"] + 10 / FPS)
# 6 · the finish
put(sfx, chime(1760, 1.0), S["FINISH"])
# 7 · the top
put(sfx, chime(1318.5, 0.9), S["TOP"])
# 8 · the question and the reset to DAY 1
put(sfx, thud(0.7), S["QUESTION"])
put(sfx, tick(3200, 1.0), S["RESET"])

# ---------------------------------------------------------------- mix (phonk is loud and dense)
def norm(x, p=0.9): m = np.max(np.abs(x)); return x * p / m if m else x
mix = norm(mus, 0.8) * db(-1) + norm(sfx, 0.8) * db(-5)
# glue compression: simple RMS follower + makeup, then a soft clip
lvl = np.sqrt(signal.sosfilt(signal.butter(1, 8, "low", fs=SR, output="sos"), (mix ** 2).mean(1)) + 1e-9)
gain = np.minimum(1, (db(-14) / lvl) ** 0.5)
mix = mix * gain[:, None]
rms = np.sqrt(np.mean(mix ** 2)); mix = mix * db(-13.6) / rms
ceil = db(-2.2); mix = np.tanh(mix / ceil) * ceil
fade = int(0.01 * SR); mix[:fade] *= np.linspace(0, 1, fade)[:, None]
tail = int(0.4 * SR); mix[-tail:] *= np.linspace(1, 0, tail)[:, None]
# SFX-only master for uploading with the Shorts library track: the sound effects alone, loud and clear (about -18 LUFS
# short-term at the hits), so YouTube's "original sound" slider can sit them on top of the added music.
sfx_only = norm(sfx, 0.8)
srms = np.sqrt(np.mean(sfx_only ** 2)); sfx_only = sfx_only * db(-22) / max(srms, 1e-9)
sfx_only = np.tanh(sfx_only / db(-3)) * db(-3)
sf.write(OUT / "sfx_only.wav", sfx_only.astype(np.float32), SR, subtype="PCM_24")
sf.write(OUT / "music.wav", mus.astype(np.float32), SR)
sf.write(OUT / "sfx.wav", sfx.astype(np.float32), SR)
sf.write(OUT / "mix.wav", mix.astype(np.float32), SR, subtype="PCM_24")
print(f"mix.wav {len(mix) / SR:.3f}s at {BPM} BPM, peak {20 * np.log10(np.max(np.abs(mix))):.2f} dBFS")
