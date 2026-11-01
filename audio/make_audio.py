"""24 Shots sound: original synthesized score + SFX timed to the picture, mixed with the Kokoro voice.
usage: .venv\\Scripts\\python.exe audio\\make_audio.py   ->  audio/mix.wav (48 kHz stereo, exactly 58.0 s) + stems music.wav / sfx.wav / voice48.wav
Mix rules from the brief: voice unchanged, music +3 dB, SFX -6 dB (relative to the nominal levels below), music ducked under the voice.
Part 1 (0-26.5 s) is tense: pulses that speed up like notifications. It cuts to near silence when the phone dies (22.9 s, "nothing buzzes").
From 26.5 s the score turns warm and slow (guitar arpeggios, soft piano chords)."""
import pathlib

import numpy as np
import soundfile as sf
from scipy import signal

SR = 48000
DUR = 58.0
N = int(SR * DUR)
ROOT = pathlib.Path(__file__).resolve().parent
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


# ---------------------------------------------------------------- music
music = np.zeros(N)
# part 1: accelerating pulse (period 0.62 s -> 0.2 s by 22.8 s)
t, k = 0.0, 0
A = [220.0, 261.63, 329.63, 392.0, 440.0, 523.25]
while t < 22.85:
    u = t / 22.85
    period = 0.62 + (0.2 - 0.62) * u ** 0.8
    put(music, thump(55, 0.3, 0.09), t, 0.5)
    put(music, hp(noise(int(0.05 * SR)), 6000) * np.exp(-T(int(0.05 * SR)) / 0.01) * 2, t + period / 2, 0.07 + 0.05 * u)
    if k % 2 == 0:
        put(music, pluck(A[(k * 3) % 6] * (1.5 if u > 0.55 else 1.0), 0.5, 1.4, 0.12), t + period / 4, 0.16)
    t += period; k += 1
# drone + riser under part 1
n1 = int(22.9 * SR); tt = T(n1)
drone = 0.06 * (np.sin(2 * np.pi * 55 * tt) + 0.5 * np.sin(2 * np.pi * 82.4 * tt)) * (1 + 0.15 * np.sin(2 * np.pi * 0.4 * tt))
music[:n1] += drone * np.minimum(1, tt / 1.5)
riser_n = int((22.85 - 18.6) * SR)
riser = bp(noise(riser_n), 400, 5000) * np.linspace(0, 1, riser_n) ** 2.5 * 0.35
put(music, riser, 18.6, 1.0)
# the phone dies: the score is cut dead (a short fade), then silence until the shop
cut = np.ones(N)
a0, a1, b0, b1 = int(22.78 * SR), int(22.9 * SR), int(26.3 * SR), int(26.9 * SR)
cut[a0:a1] = np.linspace(1, 0, a1 - a0)
cut[a1:b0] = 0.0
# part 2: warm, 76 bpm; C - Am - F - G
CH = {"C": (130.81, 164.81, 196.0, 261.63), "Am": (110.0, 130.81, 164.81, 220.0), "F": (87.31, 110.0, 130.81, 174.61), "G": (98.0, 123.47, 146.83, 196.0)}
PROG = ["C", "Am", "F", "G"]
beat = 60 / 76; eighth = beat / 2; t0 = 26.45
bar = 0
while t0 + bar * 4 * beat < DUR + 1:
    ch = CH[PROG[bar % 4]]; tb = t0 + bar * 4 * beat
    lastbar = tb + 4 * beat >= DUR - 0.5
    put(music, piano(ch[0], 3.5), tb, 0.30)                                     # bass note
    for f in ch[1:]:
        put(music, piano(f * 2, 3.2), tb + 0.01 * rng.random(), 0.12)         # soft chord
    if not lastbar:
        for j, idx in enumerate([0, 2, 1, 2, 3, 2, 1, 2]):
            put(music, pluck(ch[idx] * 2, 1.2, 0.9, 0.5), tb + j * eighth, 0.22 + 0.04 * (j % 2 == 0))
        for j in (1, 3, 5, 7):
            put(music, hp(noise(int(0.08 * SR)), 4000) * np.exp(-T(int(0.08 * SR)) / 0.02) * 1.5, tb + j * eighth, 0.025)  # soft shaker
    bar += 1
# closing motif over the last sunset (callback), after "stays in her pocket"
for j, (f, dt) in enumerate([(523.25, 0), (659.25, 0.5), (783.99, 1.0), (1046.5, 1.7)]):
    put(music, piano(f, 3.0), 55.0 + dt, 0.2)
music *= cut
# gentle 1.5 s fade in at the start and a 1.2 s fade out at the end
music *= np.minimum(1, T(N) / 1.0) * np.minimum(1, (DUR - T(N)) / 1.4)

# ---------------------------------------------------------------- sfx
sfx = np.zeros(N)
NOTIF_T = [0.3 + 0.36 * k - 0.014 * k * k for k in range(14)]
for k, t in enumerate(NOTIF_T):                                                  # notification flurry (shot 1)
    put(sfx, bell([1318, 1568, 1760, 1976, 1397][k % 5], 0.7, 0.18), t, 0.35 + 0.02 * k)
    if k > 6: put(sfx, bell([1760, 1976, 2093][k % 3] * 1.5, 0.4, 0.1), t + 0.07, 0.18)
put(sfx, add(thump(60, 0.5, 0.15) * 1.2, lp(noise(int(0.5 * SR)), 3000) * np.exp(-T(int(0.5 * SR)) / 0.12)), 5.2, 0.6)  # flash after the hook
put(sfx, bell(1568, 0.6, 0.16), 6.6, 0.3)                                       # bus stop notification
for tb in (9.4, 10.65):                                                         # phone buzzes on the cuts
    put(sfx, lp(np.sign(np.sin(2 * np.pi * 160 * T(int(0.22 * SR)))) * (np.sin(2 * np.pi * 14 * T(int(0.22 * SR))) > -0.3), 900) * 0.7, tb, 0.5)
put(sfx, bell(880, 0.9, 0.35), 9.4, 0.28); put(sfx, bell(659, 1.0, 0.4), 9.7, 0.25)  # elevator ding
put(sfx, bell(1568, 0.6, 0.16), 9.9, 0.28)                                      # elevator notification
brush_n = int(1.3 * SR); put(sfx, bp(noise(brush_n), 1800, 7000) * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * T(brush_n))) * 0.4, 10.67, 0.35)  # brushing
put(sfx, bell(1568, 0.6, 0.16), 11.1, 0.28)                                     # bathroom notification
for tt_ in (16.0,):                                                             # phone photo (screen shutter)
    put(sfx, add(np.sin(2 * np.pi * 1200 * T(int(0.06 * SR))) * np.exp(-T(int(0.06 * SR)) / 0.015), click(0.03) * 0.6), tt_, 0.5)
    put(sfx, np.sin(2 * np.pi * 800 * T(int(0.06 * SR))) * np.exp(-T(int(0.06 * SR)) / 0.015), tt_ + 0.07, 0.4)
for k in range(4): put(sfx, bell([1760, 1568, 1976, 1397][k], 0.5, 0.12), 17.1 + 0.28 * k, 0.2)  # she scrolls
put(sfx, bp(noise(int(0.7 * SR)), 300, 2500) * np.sin(np.linspace(0, np.pi, int(0.7 * SR))) ** 2, 18.8, 0.18)  # whoosh into dusk
# the phone dies at 22.9 s: power-down sweep, shards of glass, then nothing
n = int(0.7 * SR); tt = T(n); f_ = 900 * np.exp(-tt * 5.5) + 50
put(sfx, np.sin(2 * np.pi * np.cumsum(f_) / SR) * np.exp(-tt / 0.3), 22.85, 0.55)
put(sfx, click(0.03, 800, 6000) * 1.2, 22.85, 0.6)
for k in range(10): put(sfx, np.sin(2 * np.pi * rng.uniform(3000, 7500) * T(int(0.18 * SR))) * np.exp(-T(int(0.18 * SR)) / rng.uniform(0.03, 0.08)), 22.9 + 0.02 * k + 0.06 * rng.random(), 0.12)
put(sfx, hp(noise(int(0.35 * SR)), 5000) * np.exp(-T(int(0.35 * SR)) / 0.08), 22.9, 0.2)
put(sfx, lp(noise(int(2.0 * SR)), 400) * 0.15, 23.2, 0.12)                       # a very faint room tone in the silence
# camera shop: the camera appears, film advance, counter, flipping it over
def ratchet(n_clicks=9, gap=0.032, g=0.8):
    out = np.zeros(int((n_clicks * gap + 0.1) * SR))
    for i in range(n_clicks): put(out, click(0.02, 1800 + 150 * i, 6000), i * gap, g * (0.7 + 0.3 * (i % 2)))
    return out
put(sfx, ratchet(), 27.55, 0.5); put(sfx, bell(1047, 0.5, 0.12), 27.88, 0.2); put(sfx, ratchet(5), 28.0, 0.35)
for k, tk in enumerate([29.0, 29.35, 29.7, 30.05, 30.4]): put(sfx, ratchet(3 + k % 2, 0.04), tk, 0.25)   # looking for the screen
put(sfx, lp(noise(int(0.4 * SR)), 1500) * np.sin(np.linspace(0, np.pi, int(0.4 * SR))), 30.6, 0.12)
put(sfx, thump(90, 0.2, 0.04) * 0.6, 32.6, 0.3)                                  # "trust it": a soft tap
# three shots: mechanical shutter + wind-on
for ts in (37.95, 39.7, 41.3):
    put(sfx, add(click(0.03, 1200, 4500) * 1.1, thump(110, 0.08, 0.02) * 0.4), ts, 0.7)
    put(sfx, click(0.03, 900, 3000) * 0.8, ts + 0.065, 0.55)
    put(sfx, ratchet(8, 0.04, 0.6), ts + 0.45, 0.35)
# dog panting
for k in range(5):
    tp = 38.85 + k * 0.3
    put(sfx, bp(noise(int(0.2 * SR)), 500, 2200) * np.sin(np.linspace(0, np.pi, int(0.2 * SR))) ** 2, tp, 0.16)
put(sfx, bell(1568, 0.6, 0.2), 41.9, 0.0)
# buffet clatter, one quiet clink for the small plate
for k in range(34):
    tc = 42.0 + 2.6 * rng.random() ** 0.8
    put(sfx, add(np.sin(2 * np.pi * rng.uniform(2500, 6500) * T(int(0.25 * SR))) * np.exp(-T(int(0.25 * SR)) / rng.uniform(0.02, 0.07)), 0.5 * click(0.02, 2000, 7000)), tc, 0.1 + 0.1 * rng.random())
put(sfx, bell(3300, 0.6, 0.2), 45.15, 0.22)
# darkroom: drips, photos appear, memories
for td in (48.7, 49.4): put(sfx, np.sin(2 * np.pi * np.cumsum(900 - 5000 * T(int(0.1 * SR))) / SR) * np.exp(-T(int(0.1 * SR)) / 0.03), td, 0.25)
for i in range(4):
    tp = (1498 + 8 * i) / 30
    n = int(0.12 * SR); put(sfx, add(np.sin(2 * np.pi * np.cumsum(300 + 3500 * T(n)) / SR) * np.exp(-T(n) / 0.05), click(0.02, 3000, 8000) * 0.3), tp, 0.3)
for tm, f in zip((51.13, 51.57, 52.0), (784, 988, 1175)): put(sfx, bell(f, 1.4, 0.5), tm, 0.28)
# footsteps and the phone going into the pocket
for k, ts in enumerate([54.1, 54.85, 55.6, 56.35, 57.1]):
    put(sfx, lp(noise(int(0.12 * SR)), 450) * np.exp(-T(int(0.12 * SR)) / 0.03) * 4, ts, 0.3)
put(sfx, bp(noise(int(0.3 * SR)), 600, 3500) * np.sin(np.linspace(0, np.pi, int(0.3 * SR))) * 0.5, 55.8, 0.25)
# whooshes on the long crossfades
for tw in (11.9, 26.5, 33.9, 47.6, 52.7):
    n = int(0.6 * SR); put(sfx, bp(noise(n), 250, 3500) * np.sin(np.linspace(0, np.pi, n)) ** 2, tw, 0.2)

# ambience: soft river air in the outdoor shots (shots 4, 8, 11)
amb = np.zeros(N)
for a, b in ((11.8, 22.5), (33.9, 41.9), (52.7, 58.0)):
    i0, i1 = int(a * SR), min(N, int(b * SR)); m = i1 - i0
    env = np.minimum(1, np.minimum(T(m) / 0.8, (m - np.arange(m)) / SR / 0.8))
    amb[i0:i1] += lp(noise(m), 700) * env * (0.5 + 0.5 * np.sin(2 * np.pi * 0.17 * T(m))) * 0.05

# ---------------------------------------------------------------- voice, ducking, mix
v, vsr = sf.read(ROOT.parent / "voice" / "voice.wav", dtype="float32")
v = signal.resample_poly(v, SR, vsr).astype(np.float64)
voice = np.zeros(N); voice[:min(N, len(v))] = v[:N]
voice *= 0.7 / np.abs(voice).max()
env = lp(np.abs(voice), 12, 1)
tgt = np.clip(env / (0.12 * env.max() + 1e-9), 0, 1) ** 0.7                       # 0 = no voice, 1 = speaking
duck = 1 - (1 - db(-13)) * lp(tgt, 6, 1)                                         # -13 dB under the voice, ~170 ms smoothing
music_g = db(3) * 0.4                                                          # +3 dB music
sfx_g = db(-6) * 0.55                                                            # -6 dB SFX
M = music * music_g * duck
Sx = sfx * sfx_g
L = voice + M + Sx + amb
Rr = voice + np.roll(M, int(0.012 * SR)) * 0.98 + Sx + np.roll(amb, 97)
stereo = np.stack([L, Rr], 1)
stereo = np.tanh(stereo * 0.9) / np.tanh(0.9)                                   # soft safety limiter
stereo *= 0.89 / np.abs(stereo).max()                                         # peak -1 dBFS, no clipping
sf.write(ROOT / "mix.wav", stereo.astype(np.float32), SR, subtype="PCM_16")
sf.write(ROOT / "music.wav", (M / max(1e-9, np.abs(M).max()) * 0.5).astype(np.float32), SR, subtype="PCM_16")
sf.write(ROOT / "sfx.wav", (Sx / max(1e-9, np.abs(Sx).max()) * 0.5).astype(np.float32), SR, subtype="PCM_16")
sf.write(ROOT / "voice48.wav", voice.astype(np.float32), SR, subtype="PCM_16")
rms = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
print("peak", round(float(np.abs(stereo).max()), 3), "| rms dB: voice", round(rms(voice[voice != 0]), 1), "music", round(rms(M[M != 0]), 1), "sfx", round(rms(Sx[Sx != 0]), 1))
sp = np.convolve(np.abs(voice), np.ones(4800) / 4800, "same") > 0.02
print("in speech: voice", round(rms(voice[sp]), 1), "music", round(rms(M[sp]), 1), "sfx", round(rms(Sx[sp & (np.abs(Sx) > 1e-4)]), 1), "| music outside speech", round(rms(M[~sp & (np.abs(M) > 1e-4)]), 1))
print("length", len(L) / SR, "s")
