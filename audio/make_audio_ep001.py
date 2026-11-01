"""ep001 sound: original synthesized score + SFX timed to the picture, mixed with the Kokoro voice.
usage: .venv/Scripts/python.exe audio/make_audio_ep001.py -> audio/ep001/mix.wav (48 kHz stereo, exactly 55.73 s)"""
import pathlib

import numpy as np
import soundfile as sf
from scipy import signal

SR = 48000
DUR = 55.7333
N = int(SR * DUR)
ROOT = pathlib.Path(__file__).resolve().parent / "ep001"
ROOT.mkdir(exist_ok=True)
rng = np.random.default_rng(24)
T = lambda n: np.arange(n) / SR


def db(x): return 10 ** (x / 20)


def put(buf, sig, t, g=1.0):
    i = int(t * SR)
    if i >= len(buf) or i + len(sig) <= 0:
        return
    a, b = max(0, -i), min(len(sig), len(buf) - i)
    buf[i + a:i + b] += g * sig[a:b]


def bp(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], btype="band", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def lp(x, f, order=2): return signal.sosfilt(signal.butter(order, f, btype="low", fs=SR, output="sos"), x)
def hp(x, f, order=2): return signal.sosfilt(signal.butter(order, f, btype="high", fs=SR, output="sos"), x)


def noise(n): return rng.standard_normal(n)


def add(*xs):
    out = np.zeros(max(len(x) for x in xs))
    for x in xs: out[:len(x)] += x
    return out


def adsr(n, a=0.003, d=0.3):
    t = T(n)
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)


# ---------------------------------------------------------------- instruments
def pluck(f, dur=1.4, bright=1.0, decay=0.45):
    n = int(dur * SR); t = T(n); s = np.zeros(n)
    for k in range(1, 8):
        s += (1 / k ** (1.2 / bright)) * np.sin(2 * np.pi * k * f * t) * np.exp(-t * (1 / decay) * (1 + 0.55 * k))
    return s * np.minimum(1, t / 0.003) * 0.6


def piano(f, dur=2.4):
    n = int(dur * SR); t = T(n); s = np.zeros(n)
    for k, (a, d) in enumerate([(1, 1.4), (0.5, 0.9), (0.25, 0.6), (0.12, 0.4)], 1):
        s += a * np.sin(2 * np.pi * k * f * t * (1 + 0.0004 * k * k)) * np.exp(-t / d)
    return s * np.minimum(1, t / 0.006) * 0.5


def bell(f, dur=0.9, d=0.25):
    n = int(dur * SR); t = T(n)
    s = np.sin(2 * np.pi * f * t) + 0.45 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / (d * 0.5)) + 0.2 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t / (d * 0.3))
    return s * np.exp(-t / d) * np.minimum(1, t / 0.002) * 0.6


def thump(f=70, dur=0.35, d=0.1):
    n = int(dur * SR); t = T(n)
    return np.sin(2 * np.pi * (f + 90 * np.exp(-t / 0.03)) * t) * np.exp(-t / d)


def click(dur=0.02, lo=1500, hi=5000, d=0.004):
    n = int(dur * SR)
    return bp(noise(n), lo, hi) * np.exp(-T(n) / d) * 4





# ---------------------------------------------------------------- music (v4)
# A (0 - 31 s, scenes 1-9): quick, slightly comic D-minor pluck line, ~104 bpm.
# B (31 - 46.2 s, scenes 10-13): the court-room: slow, low and tense, fading almost out while Milo reads (43.8 - 46.2 s).
# C (46.3 - 50.7 s, scenes 14-15): the verdict: the music pops back up, bright and major, ~120 bpm. Dead silence 50.68 - 51.0 s before "read".
# D (51.6 s - end): the opening theme comes back (scene 16 matches scene 1).
music = np.zeros(N)
beat = 60 / 104
D_MIN = [293.66, 349.23, 440.0, 392.0, 349.23, 293.66, 261.63, 293.66]


def theme(t0, bars, gain=1.0):
    for b in range(bars):
        tb = t0 + b * 4 * beat
        for k, bass in enumerate([73.42, 73.42, 87.31, 65.41]):
            put(music, pluck(bass, 0.6, 0.7, 0.25), tb + k * beat, 0.5 * gain)
        for j in range(8):
            f = D_MIN[(j + b * 3) % 8]
            put(music, pluck(f, 0.35, 1.3, 0.09), tb + (j + 0.5) * beat / 2 + (0.02 if j % 2 else 0), 0.2 * gain)
        for j in range(4): put(music, click(0.03, 1200, 3000) * 0.5, tb + j * beat + beat / 2, 0.1 * gain)


theme(0.0, 13)                                                                   # up to ~30 s
# B: low and tense
beat_b = 60 / 66
for bar in range(4):
    tb = 31.0 + bar * 4 * beat_b
    for root in (73.42, 65.41, 98.0, 110.0)[bar:bar + 1]: put(music, piano(root, 3.6), tb, 0.3)
    for j in range(8): put(music, pluck([146.83, 174.61, 220.0, 174.61][j % 4], 0.9, 0.8, 0.45), tb + j * beat_b / 2, 0.14)
n = int(6 * SR); tt = T(n)
put(music, (np.sin(2 * np.pi * 55 * tt) + 0.5 * np.sin(2 * np.pi * 82.4 * tt)) * 0.12 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.5 * tt)), 31.0, 1.0)
# C: the verdict, bright
D_MAJ = [293.66, 369.99, 440.0, 587.33, 440.0, 369.99, 329.63, 369.99]
beat_c = 60 / 120
for b in range(2):
    tb = 46.3 + b * 4 * beat_c
    for k, bass in enumerate([73.42, 73.42, 98.0, 110.0]): put(music, pluck(bass, 0.5, 0.8, 0.3), tb + k * beat_c, 0.55)
    for j in range(8): put(music, pluck(D_MAJ[(j + b * 2) % 8], 0.4, 1.2, 0.12), tb + j * beat_c / 2, 0.24)
    for j in range(8): put(music, click(0.03, 1500, 4000) * 0.5, tb + j * beat_c / 2 + beat_c / 4, 0.1)
for f in (293.66, 369.99, 440.0, 587.33): put(music, piano(f, 2.2), 46.3, 0.18)
for f in (293.66, 369.99, 440.0, 587.33, 880.0): put(music, piano(f, 2.4), 51.0, 0.2)      # the chord under "read"
theme(51.6, 4)
cut = np.ones(N)
def hole(a, b, fade=0.12):
    i0, i1, i2 = int((a - fade) * SR), int(a * SR), int(b * SR)
    cut[i0:i1] = np.minimum(cut[i0:i1], np.linspace(1, 0, i1 - i0)); cut[i1:i2] = 0.0
hole(50.68, 51.0)
# a long dip while Milo reads (43.8 - 46.25 s)
i0, i1 = int(43.8 * SR), int(46.25 * SR)
cut[i0:i1] = np.minimum(cut[i0:i1], np.concatenate([np.linspace(1, 0.12, int(0.6 * SR)), np.full(i1 - i0 - int(0.6 * SR), 0.12)]))
music *= cut
music *= np.minimum(1, T(N) / 0.5) * np.minimum(1, (DUR - T(N)) / 1.2)

# ---------------------------------------------------------------- sfx
sfx = np.zeros(N)


def whoosh(t0, dur=0.5, lo=300, hi=4000, g=0.2):
    n = int(dur * SR); put(sfx, bp(noise(n), lo, hi) * np.sin(np.linspace(0, np.pi, n)) ** 2, t0, g)


def boing(t0, f0=300, f1=700, dur=0.28, g=0.3):
    n = int(dur * SR); tt = T(n); fr = f0 + (f1 - f0) * np.sin(np.pi * tt / dur)
    put(sfx, np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tt / 0.12) * np.minimum(1, tt / 0.005), t0, g)


def stamp(t0, g=0.9):
    put(sfx, add(thump(70, 0.4, 0.1), click(0.04, 800, 4000) * 0.8, lp(noise(int(0.12 * SR)), 2500) * np.exp(-T(int(0.12 * SR)) / 0.03)), t0, g)


def sad(t0, g=0.3):
    for k, f in enumerate([392, 311]): put(sfx, pluck(f, 0.7, 0.9, 0.3), t0 + 0.18 * k, g)


def stomp(t0, g=0.8):
    put(sfx, add(thump(48, 0.7, 0.22), lp(noise(int(0.4 * SR)), 500) * np.exp(-T(int(0.4 * SR)) / 0.1) * 2), t0, g)


def murmur(t0, dur, g=0.06, lo=250, hi=1100):
    for k in range(int(dur / 0.5)):
        n = int(0.5 * SR); put(sfx, bp(noise(n), lo, hi) * (0.5 + 0.5 * np.sin(T(n) * 20 + k)) * np.sin(np.linspace(0, np.pi, n)), t0 + 0.5 * k, g)


def cheer(t0, dur, g=0.14):
    for k in range(int(dur / 0.8)):
        n = int(0.9 * SR); put(sfx, bp(noise(n), 400, 2200) * (0.6 + 0.4 * np.sin(T(n) * 15)) * np.sin(np.linspace(0, np.pi, n)), t0 + 0.8 * k, g)


# 1: stamp, number pops, crowd, the right one blinks, flash
stamp(0.4)
for tp, f in [(2.23, 880), (2.43, 1047), (2.63, 1319)]: put(sfx, bell(f, 0.4, 0.1), tp, 0.28)
murmur(0.2, 4.6, 0.07)
for k in range(4): put(sfx, bell(1568 if k % 2 else 1319, 0.5, 0.15), 3.93 + 0.133 * 2 * k, 0.2)
whoosh(4.82, 0.35, 400, 5000, 0.35)
# 2: option 1, the iron
put(sfx, bell(784, 0.9, 0.35), 5.35, 0.22)
n = int(2.0 * SR); put(sfx, hp(noise(n), 4000) * (rng.random(n) > 0.985) * 3 + hp(noise(n), 5000) * 0.02, 5.0, 0.2)
put(sfx, hp(noise(int(0.9 * SR)), 3000) * np.exp(-T(int(0.9 * SR)) / 0.35), 6.67, 0.4)
for ts in (7.1, 7.43, 7.77): put(sfx, add(thump(95, 0.2, 0.05), hp(noise(int(0.25 * SR)), 3500) * np.exp(-T(int(0.25 * SR)) / 0.08)), ts, 0.45)
boing(6.8, 280, 760, 0.3, 0.3); put(sfx, bell(660, 0.5, 0.15), 7.1, 0.2)
for k in range(9): put(sfx, bp(noise(int(0.1 * SR)), 1500, 7000) * np.exp(-T(int(0.1 * SR)) / 0.03) * 2.5, 7.87 + 0.09 * k, 0.28)
put(sfx, bell(1047, 0.5, 0.15), 7.93, 0.2)
# 3: three days, healed, infected
put(sfx, bell(880, 0.5, 0.15), 9.13, 0.22)
for tf in (9.47, 9.73): put(sfx, add(bp(noise(int(0.12 * SR)), 1500, 6000) * np.exp(-T(int(0.12 * SR)) / 0.03) * 3, click(0.02, 3000, 8000)), tf, 0.4)
for k, f in enumerate([880, 1175, 1568]): put(sfx, bell(f, 0.9, 0.3), 10.03 + 0.09 * k, 0.28)
n = int(0.7 * SR); tt = T(n); put(sfx, np.sin(2 * np.pi * np.cumsum(260 - 150 * tt / 0.7 + 40 * np.sin(tt * 40)) / SR) * np.exp(-tt / 0.25), 11.27, 0.4)
put(sfx, lp(noise(int(1.0 * SR)), 900) * np.sin(np.linspace(0, np.pi, int(1.0 * SR))) * 0.5, 11.35, 0.12)
# 4: guilty
for k in range(3): put(sfx, lp(noise(int(0.12 * SR)), 1500) * np.exp(-T(int(0.12 * SR)) / 0.05) * 2, 13.75 + 0.18 * k, 0.12)      # "tsk"
stamp(14.27, 0.95); sad(14.45, 0.32)
# 5: Fine.
put(sfx, bp(noise(int(0.5 * SR)), 300, 1800) * np.sin(np.linspace(0, np.pi, int(0.5 * SR))), 15.07, 0.14)
for tp in (15.4, 15.6, 15.8): put(sfx, thump(110, 0.1, 0.03) * 0.6, tp, 0.3)
# 6: the arena
whoosh(16.2, 0.4, 300, 4000, 0.25); put(sfx, bell(784, 0.9, 0.35), 16.33, 0.22); cheer(16.3, 5.0, 0.15)
put(sfx, add(click(0.05, 400, 2500), thump(120, 0.15, 0.03)), 18.87, 0.6); put(sfx, add(click(0.05, 400, 2500), thump(120, 0.15, 0.03)), 19.53, 0.6)
whoosh(19.45, 0.15, 800, 5000, 0.3); whoosh(20.1, 0.15, 800, 5000, 0.3)
# 7: Greg and the giant
for k in range(8): put(sfx, click(0.02, 1200, 4000) * 0.5, 23.0 + 0.17 * k, 0.12)                    # tiptoe
for ts, g in [(24.5, 0.6), (24.85, 0.75), (25.2, 1.0)]: stomp(ts, g)
boing(25.2, 500, 1000, 0.2, 0.25)
# 8: four seconds
for k, f in enumerate([660, 784, 880, 1047]): put(sfx, add(pluck(f, 0.3, 1.4, 0.08), click(0.02, 800, 3000)), 26.1 + 0.2 * k, 0.4)
put(sfx, add(thump(60, 0.3, 0.08), bp(noise(int(0.4 * SR)), 300, 3000) * np.exp(-T(int(0.4 * SR)) / 0.12)), 26.77, 0.8); whoosh(26.8, 0.7, 200, 3500, 0.35)
for k in range(4): put(sfx, bell(1760 + 200 * k, 0.5, 0.15), 26.85 + 0.1 * k, 0.2); sad(26.9, 0.3)
# 9: dazed
for k in range(10): put(sfx, bell(1568 if k % 2 else 1319, 0.5, 0.2), 27.6 + 0.3 * k, 0.1)
for tq in (29.4, 29.8, 30.2): boing(tq, 400, 800, 0.2, 0.15)
# 10: option 3, the court-room
whoosh(30.9, 0.5, 200, 3000, 0.25); put(sfx, bell(784, 0.9, 0.35), 31.33, 0.22)
put(sfx, lp(noise(int(14 * SR)), 300) * 0.04, 31.0, 1.0)
put(sfx, add(thump(80, 0.25, 0.06) * 1.2, lp(noise(int(0.2 * SR)), 1500) * np.exp(-T(int(0.2 * SR)) / 0.05)), 32.73, 0.7)
for tf in (32.95, 33.3): put(sfx, bp(noise(int(0.2 * SR)), 1000, 6000) * np.exp(-T(int(0.2 * SR)) / 0.05) * 2, tf, 0.25)
# 11: church (bright) and king's (heavy), the gavel, the peasants
put(sfx, bell(1047, 0.8, 0.3), 34.0, 0.2); put(sfx, bell(1319, 0.8, 0.3), 34.12, 0.2); put(sfx, bell(784, 0.9, 0.35), 34.27, 0.2)
put(sfx, add(thump(55, 0.8, 0.28), bell(220, 1.0, 0.5) * 0.4), 35.53, 0.7); put(sfx, bell(784, 0.9, 0.35), 35.6, 0.2)
put(sfx, add(click(0.05, 600, 3000), thump(100, 0.2, 0.05)) * 1.5, 37.07, 0.9)
for k in range(8): put(sfx, lp(noise(int(0.12 * SR)), 450) * np.exp(-T(int(0.12 * SR)) / 0.03) * 3, 37.5 + 0.17 * k, 0.12)
# 12-14: the stable, the rope, the neck verse
for k in range(5): put(sfx, bp(noise(int(0.3 * SR)), 1500, 6000) * np.sin(np.linspace(0, np.pi, int(0.3 * SR))) * 0.5, 39.7 + 0.3 * k, 0.07)
murmur(39.9, 1.7, 0.08, 500, 2500)
whoosh(41.35, 1.0, 200, 3500, 0.4); put(sfx, bp(noise(int(0.5 * SR)), 300, 900) * np.sin(np.linspace(0, np.pi, int(0.5 * SR))) * 1.2, 41.85, 0.2)
put(sfx, bell(784, 0.9, 0.35), 42.47, 0.2)
# 15: Milo reads
put(sfx, add(thump(70, 0.2, 0.05), bp(noise(int(0.25 * SR)), 800, 4000) * np.exp(-T(int(0.25 * SR)) / 0.06)), 43.9, 0.4)
put(sfx, bp(noise(int(0.6 * SR)), 300, 2200) * np.sin(np.linspace(0, np.pi, int(0.6 * SR))), 44.6, 0.1)                 # a breath in
murmur(45.4, 0.8, 0.05, 500, 2000)
# 16: verdict
put(sfx, add(click(0.05, 600, 3000), thump(100, 0.2, 0.05)) * 1.5, 46.33, 1.0); stamp(46.5, 0.8)
for k, f in enumerate([1047, 1319, 1568]): put(sfx, bell(f, 0.9, 0.3), 46.57 + 0.08 * k, 0.28)
for k in range(10): put(sfx, add(hp(noise(int(0.08 * SR)), 3000) * np.exp(-T(int(0.08 * SR)) / 0.02) * 3, click(0.02, 2000, 6000)), 46.6 + 0.1 * k + 0.03 * rng.random(), 0.12)
cheer(46.6, 3.0, 0.13)
# 17: the twist, one chime per word
for tw, f in [(50.47, 1047), (50.67, 1175)]: put(sfx, bell(f, 0.8, 0.3), tw, 0.3)
put(sfx, bell(2093, 1.4, 0.6), 51.03, 0.3)
# 18: the loop
for tw, f in [(52.8, 660), (53.13, 784), (53.53, 988)]: put(sfx, add(pluck(f, 0.4, 1.4, 0.1), click(0.02, 800, 3000)), tw, 0.4)
murmur(51.6, 4.0, 0.06)
amb = np.zeros(N)
for a, b in ((0.0, 31.0), (41.3, 42.5), (51.5, 55.7)):
    i0, i1 = int(a * SR), min(N, int(b * SR)); m = i1 - i0
    amb[i0:i1] += lp(noise(m), 600) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.2 * T(m))) * 0.03

# ---------------------------------------------------------------- voice, ducking, mix
v, vsr = sf.read(ROOT.parent.parent / "voice" / "ep001" / "voice.wav", dtype="float32")
v = signal.resample_poly(v, SR, vsr).astype(np.float64)
voice = np.zeros(N); voice[:min(N, len(v))] = v[:N]
voice *= 0.7 / np.abs(voice).max()
env = lp(np.abs(voice), 12, 1)
tgt = np.clip(env / (0.12 * env.max() + 1e-9), 0, 1) ** 0.7
duck = 1 - (1 - db(-13)) * lp(tgt, 6, 1)
M = music * db(3) * 0.4 * duck
Sx = sfx * db(-6) * 0.55
L = voice + M + Sx + amb
Rr = voice + np.roll(M, int(0.012 * SR)) * 0.98 + Sx + np.roll(amb, 97)
stereo = np.stack([L, Rr], 1)
stereo = np.tanh(stereo * 0.9) / np.tanh(0.9)
stereo *= 0.89 / np.abs(stereo).max()
sf.write(ROOT / "mix.wav", stereo.astype(np.float32), SR, subtype="PCM_16")
rms = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
sp = np.convolve(np.abs(voice), np.ones(4800) / 4800, "same") > 0.02
print("in speech: voice", round(rms(voice[sp]), 1), "music", round(rms(M[sp]), 1), "sfx", round(rms(Sx[sp & (np.abs(Sx) > 1e-4)]), 1), "| music outside speech", round(rms(M[~sp & (np.abs(M) > 1e-4)]), 1))
print("peak", round(float(np.abs(stereo).max()), 3), "length", len(L) / SR, "s")
