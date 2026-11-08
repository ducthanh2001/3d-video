"""ep005 sound ("Einstein Failed Math? Real or Myth?"): original synthesized score + SFX timed to the picture, mixed with the Kokoro
voice (voice/ep005/voice.wav). Every cue time is read from the Q table in src/episodes/ep005-einstein-failed-math/story.ts, so a
re-timed picture keeps its sound in sync.
usage: .venv/Scripts/python.exe audio/make_audio_ep005.py -> audio/ep005/mix.wav (48 kHz stereo, exactly END frames long)
Score: a light marimba-pluck theme in C major (120 bpm, 12 dB under the voice), the music stops for the re-hook (record scratch) and
for "He failed it", comes back as a tense low line in the exam hall and as a bright theme again from the second clue on."""
import pathlib
import re

import numpy as np
import soundfile as sf
from scipy import signal

HERE = pathlib.Path(__file__).resolve().parent
story = (HERE.parent / "src" / "episodes" / "ep005-einstein-failed-math" / "story.ts").read_text(encoding="utf-8")
i0 = story.index("export const Q = {")
QF = {k: int(v) for k, v in re.findall(r"(\w+): (\d+)", story[i0:story.index("};", i0)])}  # frames
FPS = 30
Q = {k: v / FPS for k, v in QF.items()}  # seconds
SR = 48000
DUR = Q["END"]
N = int(SR * DUR)
ROOT = HERE / "ep005"
ROOT.mkdir(exist_ok=True)
rng = np.random.default_rng(1905)
T = lambda n: np.arange(n) / SR


def db(x): return 10 ** (x / 20)


def put(buf, sig, t, g=1.0):
    i = int(t * SR)
    if i >= len(buf) or i + len(sig) <= 0:
        return
    a, b = max(0, -i), min(len(sig), len(buf) - i)
    buf[i + a:i + b] += g * sig[a:b]


def bp(x, lo, hi, order=2): return signal.sosfilt(signal.butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)
def lp(x, f, order=2): return signal.sosfilt(signal.butter(order, f, btype="low", fs=SR, output="sos"), x)
def hp(x, f, order=2): return signal.sosfilt(signal.butter(order, f, btype="high", fs=SR, output="sos"), x)
def noise(n): return rng.standard_normal(n)


def add(*xs):
    out = np.zeros(max(len(x) for x in xs))
    for x in xs: out[:len(x)] += x
    return out


# ---------------------------------------------------------------- instruments
def marimba(f, dur=0.5, d=0.16):
    n = int(dur * SR); t = T(n)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t / 0.05) + 0.12 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t / 0.02)
    return s * np.exp(-t / d) * np.minimum(1, t / 0.002) * 0.6


def pluck(f, dur=1.0, bright=1.0, decay=0.4):
    n = int(dur * SR); t = T(n); s = np.zeros(n)
    for k in range(1, 8):
        s += (1 / k ** (1.2 / bright)) * np.sin(2 * np.pi * k * f * t) * np.exp(-t * (1 / decay) * (1 + 0.55 * k))
    return s * np.minimum(1, t / 0.003) * 0.6


def bell(f, dur=0.9, d=0.25):
    n = int(dur * SR); t = T(n)
    s = np.sin(2 * np.pi * f * t) + 0.45 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / (d * 0.5)) + 0.2 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t / (d * 0.3))
    return s * np.exp(-t / d) * np.minimum(1, t / 0.002) * 0.6


def organ(f, dur):
    n = int(dur * SR); t = T(n)
    s = sum((1 / k) * np.sin(2 * np.pi * k * f * t) for k in (1, 2, 3, 5))
    env = np.minimum(1, t / 0.4) * np.minimum(1, (dur - t) / 0.5)
    return s * env * (0.85 + 0.15 * np.sin(2 * np.pi * 5.2 * t)) * 0.25


def thump(f=70, dur=0.35, d=0.1):
    n = int(dur * SR); t = T(n)
    return np.sin(2 * np.pi * (f + 90 * np.exp(-t / 0.03)) * t) * np.exp(-t / d)


def click(dur=0.02, lo=1500, hi=5000, d=0.004):
    n = int(dur * SR)
    return bp(noise(n), lo, hi) * np.exp(-T(n) / d) * 4


# ---------------------------------------------------------------- music
music = np.zeros(N)
beat = 60 / 120
C_LINE = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 587.33, 523.25]   # C major, bouncing
BASS = [65.41, 65.41, 87.31, 98.0]


def theme(t0, t1, gain=1.0):
    b = 0
    while t0 + b * 4 * beat < t1:
        tb = t0 + b * 4 * beat
        for k, bass in enumerate(BASS): put(music, pluck(bass, 0.5, 0.7, 0.2), tb + k * beat, 0.5 * gain)
        for j in range(8): put(music, marimba(C_LINE[(j + b * 3) % 8]), tb + (j + 0.5) * beat / 2 + (0.015 if j % 2 else 0), 0.22 * gain)
        for j in range(4): put(music, click(0.03, 1200, 3000) * 0.5, tb + j * beat + beat / 2, 0.09 * gain)
        b += 1


theme(0.0, Q["L7"])                       # the opening: bright
theme(Q["L7"] + 0.9, Q["L8"], 0.8)        # after the record scratch: the same tune, a little smaller
# exam hall: a tense low line (organ + a slow heartbeat), the music nearly gone
for t0, chord in [(Q["L8"], (110.0, 164.81, 196.0)), (Q["L8"] + 2.2, (103.83, 155.56, 207.65))]:
    for f in chord: put(music, organ(f, 2.6), t0, 0.5)
for k in range(int((Q["L9"] - Q["L8"]) / 0.9)):
    put(music, thump(52, 0.3, 0.09), Q["L8"] + 0.9 * k, 0.2); put(music, thump(52, 0.3, 0.09), Q["L8"] + 0.9 * k + 0.22, 0.12)
theme(Q["L10"], Q["L13"], 0.9)            # the report card turns it round: the tune is back
for k, f in enumerate([523.25, 659.25, 783.99, 1046.5]): put(music, marimba(f, 0.6, 0.2), Q["L13"] - 0.15 + 0.07 * k, 0.3)
theme(Q["L13"], Q["mythStamp"] - 0.05, 1.0)
# the verdict: a triumphant run and a held chord, then the tune to the end
for k, f in enumerate([523.25, 659.25, 783.99, 1046.5, 1318.5]): put(music, marimba(f, 0.7, 0.25), Q["mythStamp"] + 0.12 + 0.07 * k, 0.32)
for f in (261.63, 329.63, 392.0): put(music, organ(f, 1.6), Q["mythStamp"] + 0.05, 0.5)
theme(Q["L14"] + 1.6, DUR, 1.0)

cut = np.ones(N)


def hole(a, b, fade=0.06, floor=0.0):
    i0, i1, i2 = int((a - fade) * SR), int(a * SR), int(b * SR)
    cut[i0:i1] = np.minimum(cut[i0:i1], np.linspace(1, floor, i1 - i0)); cut[i1:i2] = np.minimum(cut[i1:i2], floor)
    j = min(N, i2 + int(0.12 * SR)); cut[i2:j] = np.minimum(cut[i2:j], np.linspace(floor, 1, j - i2))


hole(Q["L7"] - 0.03, Q["L7"] + 0.85)                    # record scratch: the music dies
hole(Q["L9"] - 0.45, Q["stamp"] + 0.3, 0.12)           # "He failed it.": silence, then the stamp
hole(Q["L16"] + 2.4, DUR, 0.5, 0.35)                   # settle under the last words
music *= cut
music *= np.minimum(1, T(N) / 0.2) * np.minimum(1, (DUR - T(N)) / 0.15)

# ---------------------------------------------------------------- sfx
sfx = np.zeros(N)


def whoosh(t0, dur=0.4, lo=300, hi=4000, g=0.2):
    n = int(dur * SR); put(sfx, bp(noise(n), lo, hi) * np.sin(np.linspace(0, np.pi, n)) ** 2, t0, g)


def boing(t0, f0=300, f1=700, dur=0.28, g=0.3):
    n = int(dur * SR); tt = T(n); fr = f0 + (f1 - f0) * np.sin(np.pi * tt / dur)
    put(sfx, np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tt / 0.12) * np.minimum(1, tt / 0.005), t0, g)


def stamp(t0, g=0.9):
    put(sfx, add(thump(70, 0.4, 0.1), click(0.04, 800, 4000) * 0.8, lp(noise(int(0.12 * SR)), 2500) * np.exp(-T(int(0.12 * SR)) / 0.03)), t0, g)


def ding(t0, g=0.4):
    put(sfx, add(bell(1568, 1.0, 0.35), bell(2093, 0.8, 0.25) * 0.6), t0, g)


def scratch(t0, g=0.6):
    """record scratch: a pitched saw dragged down and back, plus a rasp"""
    for k, (dur, f0, f1) in enumerate([(0.28, 1400, 160), (0.22, 220, 900)]):
        n = int(dur * SR); tt = T(n)
        fr = f0 * (f1 / f0) ** (tt / dur)
        ph = np.cumsum(fr) / SR
        saw = 2 * (ph % 1) - 1
        s = bp(saw, 250, 4500) * 0.8 + 0.5 * bp(noise(n), 1500, 6500)
        put(sfx, s * np.sin(np.pi * np.minimum(1, tt / dur * 1.0)) ** 0.6 * np.minimum(1, (dur - tt) / 0.03), t0 + 0.30 * k, g)


def tick(t0, g=0.12):
    put(sfx, add(click(0.015, 2500, 7000), thump(900, 0.03, 0.01) * 0.3), t0, g)


def sweep(t0, dur, f0, f1, g=0.1):
    n = int(dur * SR); tt = T(n)
    put(sfx, np.sin(2 * np.pi * np.cumsum(f0 + (f1 - f0) * (tt / dur)) / SR) * np.sin(np.pi * tt / dur) * 0.6, t0, g)


def pop(t0, g=0.4):
    n = int(0.12 * SR); tt = T(n)
    put(sfx, add(np.sin(2 * np.pi * np.cumsum(np.maximum(200, 900 - 5200 * tt)) / SR) * np.exp(-tt / 0.03), click(0.01, 2000, 7000) * 0.4), t0, g)


def paper(t0, dur=0.3, g=0.22):
    n = int(dur * SR); put(sfx, bp(noise(n), 1500, 7000) * (0.4 + 0.6 * (rng.random(n) > 0.7)) * np.sin(np.linspace(0, np.pi, n)), t0, g)


fs = lambda name: QF[name] / FPS

# 1: the title: the stamp lands at frame 0 (thump + paper rattle)
stamp(0.03, 1.0); paper(0.05, 0.25, 0.2)
# scene cuts: a soft whoosh before every cut
for name in ["L2", "L3", "L4", "L5", "L6", "L8", "L10", "L12", "L13", "L14", "L15", "L16"]:
    whoosh(fs(name) - 0.12, 0.3, 400, 4500, 0.22)
# 3: REAL / MYTH stamps slide in and land, the needle wobbles
stamp(fs("L3") + 0.07, 0.55); stamp(fs("myth"), 0.55)
for k in range(6): tick(fs("L3") + 0.12 + 0.2 * k, 0.07)
# 4: the report card: a paper flip
paper(fs("L4") + 0.1, 0.3, 0.2)
# clue 1 / 2 / 3: the chip ding
ding(fs("clue1"), 0.5); ding(fs("section"), 0.5); ding(fs("four"), 0.5)
# 5: age 12 pencil scratches the page; 6: chalk lines
for k in range(int((fs("L6") - fs("twelve")) / 0.12)):
    n = int(0.06 * SR); put(sfx, bp(noise(n), 2500, 8000) * np.sin(np.linspace(0, np.pi, n)), fs("twelve") + 0.5 + 0.12 * k, 0.04 * (0.6 + 0.4 * rng.random()))
for k in range(int((fs("L7") - 0.2 - fs("L6") - 0.4) / 0.14)):
    n = int(0.08 * SR); put(sfx, bp(noise(n), 1800, 7000) * np.sin(np.linspace(0, np.pi, n)), fs("L6") + 0.4 + 0.14 * k, 0.04 * (0.6 + 0.4 * rng.random()))
sweep(fs("calculus"), 0.45, 500, 900, 0.1)
# 7: the re-hook: record scratch, a hit, the needle snaps back
scratch(fs("L7") - 0.08, 0.7); stamp(fs("L7") + 0.62, 0.5)
for k in range(5): tick(fs("L7") + 0.04 * k, 0.12)
boing(fs("wait"), 300, 750, 0.25, 0.28)
# 8/9: the exam hall: a hush, then THE stamp
whoosh(fs("L8") + 0.05, 0.5, 200, 1500, 0.1)
stamp(fs("stamp"), 1.0); put(sfx, np.sin(2 * np.pi * 44 * T(int(0.8 * SR))) * np.exp(-T(int(0.8 * SR)) / 0.3), fs("stamp"), 0.35)
for k, f in enumerate([392, 311]): put(sfx, pluck(f, 0.7, 0.9, 0.3), fs("stamp") + 0.35 + 0.18 * k, 0.28)
# 10/11: the rows: a red thud, two green sparkles with gold stars, the needle rises
stamp(fs("general"), 0.5)
for name, f in [("math", 1319), ("physics", 1568)]:
    put(sfx, add(bell(f, 0.7, 0.25), bell(f * 2, 0.5, 0.15) * 0.4), fs(name) + 0.05, 0.3)
sweep(fs("distinction"), 0.6, 500, 1100, 0.1)
# 12: Pip scratches his head (a little boing)
boing(fs("L12") + 0.1, 220, 420, 0.2, 0.22)
# 13: four papers fly up and make the 4
whoosh(fs("four") - 0.05, 0.6, 500, 5000, 0.28)
for k in range(4): paper(fs("four") + 0.04 * k * 4 / 4, 0.18, 0.22)
put(sfx, bell(1047, 0.6, 0.2), fs("four") + 0.5, 0.2)
sweep(fs("papers"), 0.7, 600, 1400, 0.1)
# 14: MYTH comes down: stamp, shake, a sparkle, the needle hits 100 %
stamp(fs("mythStamp"), 1.0)
for k, f in enumerate([1568, 2093, 2637]): put(sfx, bell(f, 0.8, 0.3), fs("mythStamp") + 0.1 + 0.07 * k, 0.24)
sweep(fs("mythStamp") - 0.05, 0.5, 700, 1600, 0.12)
# 15: Pip's finger goes up (boing), Einstein nods (two soft taps)
boing(fs("one") - 0.05, 240, 560, 0.2, 0.25)
for k in range(3): put(sfx, thump(90, 0.1, 0.03) * 0.4, fs("L15") + 0.3 + 0.2 * k, 0.12)
# 16: Pip points; SUBSCRIBE: boing in, ding, press, bell
boing(fs("L16") + 0.05, 220, 480, 0.18, 0.22)
boing(fs("subscribe") - 0.07, 200, 500, 0.15, 0.25)
ding(fs("subscribe"), 0.55)
put(sfx, add(thump(120, 0.1, 0.03), click(0.02, 1500, 5000)), fs("subscribe") + 22 / FPS, 0.25)
for k in range(5): put(sfx, bell(2349 if k % 2 else 2093, 0.5, 0.12), fs("subscribe") + (24 + 3 * k) / FPS, 0.22 * (1 - 0.15 * k))
pop(fs("LOOP") - 0.2, 0.3)

# a little room tone so the pauses are never dead
amb = lp(noise(N), 500) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.15 * T(N))) * 0.02
amb *= cut ** 0.5

# ---------------------------------------------------------------- voice, ducking, mix (music +3 dB, SFX -6 dB, voice as is)
v, vsr = sf.read(HERE.parent / "voice" / "ep005" / "voice.wav", dtype="float32")
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
