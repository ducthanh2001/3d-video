"""ep003 sound: original synthesized score + SFX timed to the picture, mixed with the Kokoro voice (voice/ep003/voice.wav).
Every cue time is read from the Q table in src/videos/ep002/story.ts, so a re-timed picture keeps its sound in sync.
usage: .venv/Scripts/python.exe audio/make_audio_ep003.py -> audio/ep003/mix.wav (48 kHz stereo, exactly TOTAL frames long)"""
import pathlib
import re

import numpy as np
import soundfile as sf
from scipy import signal

HERE = pathlib.Path(__file__).resolve().parent
story = (HERE.parent / "src" / "videos" / "ep003" / "story.ts").read_text(encoding="utf-8")
Q = {k: int(v) / 30 for k, v in re.findall(r"(\w+): (\d+)", story[story.index("export const Q = {"):story.index("};", story.index("export const Q = {"))])}
SR = 48000
DUR = Q["END"]
N = int(SR * DUR)
ROOT = HERE / "ep003"
ROOT.mkdir(exist_ok=True)
rng = np.random.default_rng(1474)
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


def organ(f, dur):
    """soft reedy organ chord tone for the synod hall: odd harmonics, slow swell, gentle tremolo"""
    n = int(dur * SR); t = T(n)
    s = sum((1 / k) * np.sin(2 * np.pi * k * f * t) for k in (1, 2, 3, 5))
    env = np.minimum(1, t / 0.5) * np.minimum(1, (dur - t) / 0.6)
    return s * env * (0.85 + 0.15 * np.sin(2 * np.pi * 5.2 * t)) * 0.25


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
# A: the bouncy F-major line of the series (scenes 1-6), ~108 bpm; faster (126 bpm) while Milo paces his real defense (scene 7)
beat = 60 / 108
F_MAJ = [349.23, 440.0, 523.25, 440.0, 392.0, 466.16, 392.0, 349.23]
BASS_A = [87.31, 87.31, 116.54, 130.81]


def theme(t0, t1, gain=1.0, bpm=108):
    bt = 60 / bpm; b = 0
    while t0 + b * 4 * bt < t1:
        tb = t0 + b * 4 * bt
        for k, bass in enumerate(BASS_A):
            put(music, pluck(bass, 0.6, 0.7, 0.25), tb + k * bt, 0.5 * gain)
        for j in range(8):
            put(music, pluck(F_MAJ[(j + b * 3) % 8], 0.35, 1.3, 0.09), tb + (j + 0.5) * bt / 2 + (0.02 if j % 2 else 0), 0.2 * gain)
        for j in range(4): put(music, click(0.03, 1200, 3000) * 0.5, tb + j * bt + bt / 2, 0.1 * gain)
        b += 1


theme(0.0, Q["L7"] - 0.1)
theme(Q["L7"], Q["L8"] - 0.1, 1.0, 126)
# B: the judge hesitates, the prosecutor strikes, "one move left" (scenes 8-11): low and tense: a low organ, a heartbeat, a creeping piano
for k, (t0, chord) in enumerate([(Q["L8"], (73.42, 110.0, 146.83)), (Q["L9"], (65.41, 98.0, 155.56)), (Q["L10"], (73.42, 110.0, 174.61)), (Q["L11"], (69.3, 103.83, 138.59))]):
    nxt = [Q["L9"], Q["L10"], Q["L11"], Q["L12"]][k]
    for f in chord: put(music, organ(f, nxt - t0 + 0.4), t0, 0.45)
for k in range(int((Q["L12"] - Q["L8"]) / 0.85)):
    put(music, thump(52, 0.3, 0.09), Q["L8"] + 0.85 * k, 0.22); put(music, thump(52, 0.3, 0.09), Q["L8"] + 0.85 * k + 0.21, 0.13)
for k, f in enumerate([146.83, 174.61, 220.0, 207.65, 174.61, 146.83, 138.59, 146.83, 130.81, 146.83]):
    put(music, piano(f, 1.8), Q["L8"] + 0.4 + 1.4 * k, 0.11)
# the idea: a rising pluck run into the owner scene
for k, f in enumerate([293.66, 349.23, 440.0, 523.25, 587.33]): put(music, pluck(f, 0.4, 1.3, 0.12), Q["idea"] - 0.1 + 0.08 * k, 0.3)
# C: the verdict and the sentence (scenes 13-15): slow, low and heavy, a distant minor line, no drums
for k, f in enumerate([110.0, 98.0, 87.31, 82.41, 98.0, 87.31, 73.42, 73.42]):
    put(music, piano(f, 3.0), Q["L13"] + 1.45 * k, 0.26)
    if k % 2: put(music, organ(f * 2, 2.0), Q["L13"] + 1.45 * k, 0.3)
# D: the series theme comes back at REAL and plays to the end (scene 18 matches scene 1)
theme(Q["L16"], DUR)

cut = np.ones(N)
def hole(a, b, fade=0.12, floor=0.0):
    i0, i1, i2 = int((a - fade) * SR), int(a * SR), int(b * SR)
    cut[i0:i1] = np.minimum(cut[i0:i1], np.linspace(1, floor, i1 - i0)); cut[i1:i2] = np.minimum(cut[i1:i2], floor)
    j = min(N, i2 + int(0.15 * SR)); cut[i2:j] = np.minimum(cut[i2:j], np.linspace(floor, 1, j - i2))
hole(Q["real"] + 0.25, Q["L3"] - 0.05)             # the 0.8 s "REAL OR MYTH?" silence
hole(Q["L8"] + 1.0, Q["L9"] - 0.05, 0.2, 0.25)       # the judge hesitates: the music nearly stops
hole(Q["L10"] + 2.2, Q["L11"] - 0.05, 0.2, 0.0)      # the 0.5 s held face with the bulb
hole(Q["L12"] - 0.3, Q["L13"] - 0.02, 0.2, 0.0)      # SILENCE
hole(Q["L16"] - 0.12, Q["L16"] + 0.0, 0.05, 0.0)
music *= cut
music *= np.minimum(1, T(N) / 0.5) * np.minimum(1, (DUR - T(N)) / 0.6)

# ---------------------------------------------------------------- sfx
# from here on Q holds FRAMES (the music above used seconds); every cue below is written as frames / FPS
FPS = 30
Q = {k: round(v * FPS) for k, v in Q.items()}
sfx = np.zeros(N)


def whoosh(t0, dur=0.5, lo=300, hi=4000, g=0.2):
    n = int(dur * SR); put(sfx, bp(noise(n), lo, hi) * np.sin(np.linspace(0, np.pi, n)) ** 2, t0, g)


def boing(t0, f0=300, f1=700, dur=0.28, g=0.3):
    n = int(dur * SR); tt = T(n); fr = f0 + (f1 - f0) * np.sin(np.pi * tt / dur)
    put(sfx, np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tt / 0.12) * np.minimum(1, tt / 0.005), t0, g)


def stamp(t0, g=0.9):
    put(sfx, add(thump(70, 0.4, 0.1), click(0.04, 800, 4000) * 0.8, lp(noise(int(0.12 * SR)), 2500) * np.exp(-T(int(0.12 * SR)) / 0.03)), t0, g)


def gavel(t0, g=0.8):
    put(sfx, add(click(0.05, 600, 3000), thump(100, 0.2, 0.05)) * 1.5, t0, g)


def sad(t0, g=0.3):
    for k, f in enumerate([392, 311]): put(sfx, pluck(f, 0.7, 0.9, 0.3), t0 + 0.18 * k, g)


def paper(t0, dur=0.3, g=0.25):
    n = int(dur * SR); put(sfx, bp(noise(n), 1500, 7000) * (0.4 + 0.6 * (rng.random(n) > 0.7)) * np.sin(np.linspace(0, np.pi, n)), t0, g)


def cheer(t0, dur, g=0.14):
    for k in range(int(dur / 0.8)):
        n = int(0.9 * SR); put(sfx, bp(noise(n), 400, 2200) * (0.6 + 0.4 * np.sin(T(n) * 15)) * np.sin(np.linspace(0, np.pi, n)), t0 + 0.8 * k, g)


def murmur(t0, dur, g=0.06, lo=250, hi=1100):
    for k in range(int(dur / 0.5)):
        n = int(0.5 * SR); put(sfx, bp(noise(n), lo, hi) * (0.5 + 0.5 * np.sin(T(n) * 20 + k)) * np.sin(np.linspace(0, np.pi, n)), t0 + 0.5 * k, g)


def drum(t0, g=0.6):
    put(sfx, add(thump(55, 0.9, 0.3), bell(110, 0.9, 0.4) * 0.3), t0, g)


def cluck(t0, g=0.3, n_=3):
    for k in range(n_):
        n = int(0.09 * SR); tt = T(n)
        put(sfx, bp(noise(n), 700, 1800) * np.sin(np.pi * tt / 0.09) * 2 + np.sin(2 * np.pi * 620 * tt) * np.sin(np.pi * tt / 0.09) * 0.4, t0 + 0.14 * k, g)


def crack(t0, g=0.6):
    """an egg cracking: a dry snap, a tiny shell tinkle"""
    put(sfx, add(click(0.03, 1800, 7000) * 1.5, thump(160, 0.06, 0.015) * 0.4), t0, g)
    for k in range(4): put(sfx, np.sin(2 * np.pi * rng.uniform(3200, 6000) * T(int(0.12 * SR))) * np.exp(-T(int(0.12 * SR)) / 0.03), t0 + 0.05 + 0.04 * k + 0.02 * rng.random(), g * 0.25)


def pop(t0, g=0.4):
    n = int(0.12 * SR); tt = T(n)
    put(sfx, add(np.sin(2 * np.pi * np.cumsum(np.maximum(200, 900 - 5200 * tt)) / SR) * np.exp(-tt / 0.03), click(0.01, 2000, 7000) * 0.4), t0, g)


def ding(t0, g=0.4):
    put(sfx, add(bell(1568, 1.0, 0.35), bell(2093, 0.8, 0.25) * 0.6), t0, g)


def whistle_note(t0, f, dur=0.22, g=0.2):
    n = int(dur * SR); tt = T(n)
    fr = f * (1 + 0.012 * np.sin(2 * np.pi * 6 * tt)) * (1 + 0.04 * np.minimum(1, tt / 0.04))
    put(sfx, (np.sin(2 * np.pi * np.cumsum(fr) / SR) * 0.8 + 0.2 * bp(noise(n), f * 0.8, f * 1.3)) * np.minimum(1, tt / 0.02) * np.minimum(1, (dur - tt) / 0.04), t0, g)


def train_whistle(t0, g=0.45):
    for f, d, off in [(740, 0.28, 0.0), (554, 0.7, 0.3)]:
        n = int(d * SR); tt = T(n)
        s = (np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(2 * np.pi * f * 2.01 * tt) + 0.3 * np.sin(2 * np.pi * f * 3 * tt)) * (1 + 0.04 * np.sin(2 * np.pi * 8 * tt))
        put(sfx, (s * 0.5 + 0.3 * bp(noise(n), f, f * 3)) * np.minimum(1, tt / 0.03) * np.minimum(1, (d - tt) / 0.12), t0 + off, g)


def chug(t0, k=6, gap=0.22, g=0.22):
    for i in range(k):
        n = int(0.14 * SR); put(sfx, lp(noise(n), 1400 - 40 * i) * np.exp(-T(n) / 0.045) * 3, t0 + gap * i, g * (1 - 0.06 * i))


def scribble(t0, dur, g=0.05):
    for k in range(int(dur / 0.11)):
        n = int(0.07 * SR); put(sfx, bp(noise(n), 2500, 8000) * np.sin(np.linspace(0, np.pi, n)), t0 + 0.11 * k, g * (0.6 + 0.4 * rng.random()))


# 1: the office: folder, the rooster's cluck, the egg tap, the flash
paper(Q["L1"] + 0.15, 0.3, 0.2)
pop(Q["rooster"] / FPS - 0.1, 0.35); cluck(Q["rooster"] / FPS + 0.05, 0.28, 2)
put(sfx, add(thump(120, 0.1, 0.03), click(0.02, 2000, 5000)), Q["egg"] / FPS, 0.3)
whoosh(Q["flash"] / FPS - 0.2, 0.35, 400, 5000, 0.35)
# 2: Basel: the label bell, the crowd, REAL OR MYTH?
whoosh(Q["L2"] / FPS - 0.1, 0.4, 300, 4000, 0.25); put(sfx, bell(784, 0.9, 0.35), Q["basel"] / FPS, 0.22)
murmur(Q["L2"] / FPS, 3.0, 0.05)
cluck(Q["real"] / FPS + 1.0, 0.2, 2)
drum(Q["real"] / FPS, 0.7)
# 3: the judge's gavel, Milo startles
gavel(Q["judge3"] / FPS, 0.9); boing(Q["milo3"] / FPS, 250, 750, 0.22, 0.28)
# 4: the thought bubble: the egg knocks, cracks, a cute monster hatches, the bubble pops
for k in range(8): put(sfx, add(thump(220, 0.05, 0.02) * 0.5, click(0.01, 1000, 3000) * 0.6), (290 + 6 * k * (1 + 0.1 * k)) / FPS, 0.2)
crack(Q["monster"] / FPS - 0.5, 0.35)
boing(Q["monster"] / FPS, 350, 1000, 0.25, 0.3); put(sfx, np.sin(2 * np.pi * np.cumsum(1300 + 500 * np.sin(2 * np.pi * 14 * T(int(0.4 * SR)))) / SR) * np.sin(np.linspace(0, np.pi, int(0.4 * SR))) * 0.3, Q["monster"] / FPS + 0.2, 0.2)
pop(372 / FPS, 0.45)
cluck(Q["L4"] / FPS + 0.2, 0.12, 2)
# 5: Milo's confident first argument: a small fanfare, the card
for k, f in enumerate([523, 659, 784]): put(sfx, add(pluck(f, 0.4, 1.4, 0.1), click(0.02, 800, 3000)), Q["simple"] / FPS + 0.08 * k, 0.3)
whoosh(Q["roosters"] / FPS - 0.1, 0.3, 500, 5000, 0.25); cluck(Q["roosters"] / FPS + 0.3, 0.25, 3)
# 6: the judge yawns (a long falling "haaa"), waves it off; LOST and a crack
n = int(0.75 * SR); tt = T(n); put(sfx, (np.sin(2 * np.pi * np.cumsum(250 - 90 * tt / 0.75) / SR) * 0.5 + 0.5 * bp(noise(n), 400, 1600)) * np.sin(np.linspace(0, np.pi, n)) ** 1.3, Q["L6"] / FPS + 0.6, 0.3)
whoosh(515 / FPS, 0.25, 600, 3500, 0.2)
stamp(Q["lost1"] / FPS, 0.95); crack(Q["lost1"] / FPS + 0.03, 0.7); sad(Q["lost1"] / FPS + 0.2, 0.3)
# 7: the real defense: a bell per card, the rooster nods, the clerk's quill
whoosh(Q["realdef"] / FPS - 0.1, 0.3, 500, 5000, 0.25); put(sfx, bell(880, 0.6, 0.2), Q["realdef"] / FPS, 0.2)
for tw, f in [(Q["inv"], 1047), (Q["evil"], 1175), (Q["hurt"], 1319)]:
    put(sfx, bell(f, 0.8, 0.3), tw / FPS, 0.3); paper(tw / FPS - 0.02, 0.12, 0.2); cluck(tw / FPS + 0.1, 0.18, 2)
scribble(Q["L7"] / FPS + 0.3, 4.0, 0.045)
for k in range(10): put(sfx, add(thump(110, 0.1, 0.03) * 0.5, click(0.02, 500, 1800) * 0.4), (Q["L7"] + 6 + 14.5 * k) / FPS, 0.12)
# 8: the judge hesitates: three ticks for the dots
for k in range(3): put(sfx, bell(1319 + 200 * k, 0.4, 0.1), (Q["L8"] + 14 + 12 * k) / FPS, 0.12)
# 9: Satan: a sting, a swoosh across, a squeak from the rooster; the clerk gasps
for tt_, f in [(Q["pros"] - 6, 147), (Q["pros"] + 2, 139)]: put(sfx, add(organ(f, 1.0) * 0.5, thump(55, 0.5, 0.15)), tt_ / FPS, 0.5)
whoosh(Q["satan"] / FPS - 0.15, 0.8, 200, 3500, 0.4); put(sfx, np.sin(2 * np.pi * np.cumsum(180 + 120 * np.sin(2 * np.pi * 7 * T(int(0.7 * SR)))) / SR) * np.sin(np.linspace(0, np.pi, int(0.7 * SR))) * 0.5, Q["satan"] / FPS, 0.22)
boing(Q["satan"] / FPS + 0.08, 500, 950, 0.18, 0.28); cluck(Q["satan"] / FPS + 0.2, 0.3, 4)
put(sfx, bp(noise(int(0.4 * SR)), 500, 2500) * np.sin(np.linspace(0, np.pi, int(0.4 * SR))), Q["satan"] / FPS + 0.1, 0.1)
# 10: LOST again and a crack; the sad two notes; then the bulb
stamp(Q["lost2"] / FPS, 0.95); crack(Q["lost2"] / FPS + 0.03, 0.7); sad(Q["lost2"] / FPS + 0.2, 0.3)
put(sfx, np.sin(2 * np.pi * np.cumsum(500 - 280 * T(int(0.7 * SR)) / 0.7) / SR) * np.sin(np.linspace(0, np.pi, int(0.7 * SR))) * 0.5, Q["move"] / FPS + 0.3, 0.1)
ding(Q["idea"] / FPS, 0.45)
for k in range(4): put(sfx, bell(2093 * (1 + 0.25 * k), 0.4, 0.1), Q["idea"] / FPS + 0.07 * k, 0.12)
# 11: Milo points; the owner gulps and sweats; the question
whoosh(Q["L11"] / FPS - 0.1, 0.25, 500, 4000, 0.2)
boing(1000 / FPS, 160, 90, 0.25, 0.3); put(sfx, bell(2400, 0.3, 0.08), 1008 / FPS, 0.12); put(sfx, bell(2800, 0.3, 0.08), 1016 / FPS, 0.1)
murmur(Q["ifegg"] / FPS, 1.0, 0.05)
# 12: silence: only the wind, a creaking wheel, nothing else
n = int((Q["L13"] - Q["L12"] + 8) / FPS * SR); tt = T(n)
put(sfx, bp(noise(n), 200, 900) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.5 * tt)) * np.minimum(1, tt / 0.5), Q["L12"] / FPS - 0.1, 0.07)
for k in range(6): put(sfx, np.sin(2 * np.pi * (900 + 60 * k) * T(int(0.1 * SR))) * np.sin(np.linspace(0, np.pi, int(0.1 * SR))) * 0.5, (Q["L12"] + 16 + 7 * k) / FPS, 0.025)
# 13: the verdict: the gavel, the stamp, the third crack, the crowd's "oooh"
gavel(Q["guilty"] / FPS - 0.03, 1.0); stamp(Q["guilty"] / FPS + 0.03, 0.9); crack(Q["guilty"] / FPS + 0.08, 0.75)
n = int(1.0 * SR); put(sfx, bp(noise(n), 300, 1500) * np.sin(np.linspace(0, np.pi, n)) ** 2, Q["guilty"] / FPS + 0.1, 0.12)
# 14: the sentence: two low bell tolls and a far murmur (nothing else)
for k in range(2): put(sfx, add(bell(196, 2.4, 0.9), bell(392, 1.8, 0.6) * 0.4), (Q["L14"] + 8 + 56 * k) / FPS, 0.28)
murmur(Q["L14"] / FPS + 0.3, 3.0, 0.04, 200, 800)
# 15: the owner's whistle and his footsteps
for k, (dt, f) in enumerate([(0.0, 1175), (0.25, 1319), (0.5, 1568), (0.75, 1319), (1.1, 1175), (1.35, 1047), (1.6, 1175)]): whistle_note(Q["L15"] / FPS + 0.15 + dt, f, 0.2, 0.18)
for k in range(5): put(sfx, add(thump(90, 0.1, 0.03) * 0.4, click(0.02, 400, 1500) * 0.4), (Q["L15"] + 4 + 11 * k) / FPS, 0.14)
# 16: REAL
stamp(Q["real2"] / FPS, 0.95)
for k, f in enumerate([1047, 1319, 1568]): put(sfx, bell(f, 0.8, 0.3), Q["real2"] / FPS + 0.1 + 0.07 * k, 0.22)
# 17: the old file slides off, the new one slides in; the whistle, the chugs; DING for the button
whoosh((Q["next"] - 14) / FPS, 0.35, 400, 4500, 0.25); paper((Q["next"] - 4) / FPS, 0.25, 0.25)
train_whistle(Q["train"] / FPS - 0.05, 0.5); chug((Q["train"] + 12) / FPS, 8, 0.2, 0.22)
put(sfx, hp(noise(int(0.8 * SR)), 3000) * np.exp(-T(int(0.8 * SR)) / 0.3), (Q["train"] + 6) / FPS, 0.12)
boing((Q["subscribe"] - 4) / FPS, 200, 500, 0.15, 0.25)
ding(Q["subscribe"] / FPS, 0.5)
put(sfx, add(thump(120, 0.1, 0.03), click(0.02, 1500, 5000)), (Q["subscribe"] + 22) / FPS, 0.25)       # the "press"
for k in range(5): put(sfx, bell(2349 if k % 2 else 2093, 0.5, 0.12), (Q["subscribe"] + 24 + 3 * k) / FPS, 0.22 * (1 - 0.15 * k))   # the bell rings
# 18: the button shrinks away, then the question: three plucks
pop((Q["L18"] + 22) / FPS, 0.25)
for tw, f in [(Q["would"] + 6, 660), (Q["would"] + 14, 784), (Q["would"] + 24, 988)]: put(sfx, add(pluck(f, 0.4, 1.4, 0.1), click(0.02, 800, 3000)), tw / FPS, 0.35)
# ambience: the square in daylight (a light breeze and a few small birds), the office (a warm room tone)
amb = np.zeros(N)
for a, b in ((Q["L2"] / FPS, Q["L12"] / FPS - 0.3), (Q["L13"] / FPS, Q["L17"] / FPS)):
    i0, i1 = int(a * SR), min(N, int(b * SR)); m = i1 - i0
    amb[i0:i1] += lp(noise(m), 600) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.17 * T(m))) * 0.03
for tb in [4.2, 7.6, 10.4, 13.1, 16.8, 20.3, 24.5, 28.6, 32.1, 38.9]:
    if Q["L12"] / FPS - 0.3 < tb < Q["L13"] / FPS: continue
    for k in range(3):
        d = 0.09; n = int(d * SR); tt = T(n)
        put(amb, np.sin(2 * np.pi * np.cumsum(3200 + 1800 * np.sin(np.pi * tt / d)) / SR) * np.sin(np.pi * tt / d) ** 2 * 0.5, tb + 0.12 * k, 0.04)
for a, b in ((0.0, Q["L2"] / FPS), (Q["L17"] / FPS, DUR)):
    i0, i1 = int(a * SR), min(N, int(b * SR)); m = i1 - i0
    amb[i0:i1] += lp(noise(m), 500) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.15 * T(m))) * 0.025

# ---------------------------------------------------------------- voice, ducking, mix (music +3 dB, SFX -6 dB, voice as is)
v, vsr = sf.read(HERE.parent / "voice" / "ep003" / "voice.wav", dtype="float32")
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
