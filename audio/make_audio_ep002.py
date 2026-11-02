"""ep002 sound: original synthesized score + SFX timed to the picture, mixed with the Kokoro voice (voice/ep002/voice.wav).
Every cue time is read from the Q table in src/videos/ep002/story.ts, so a re-timed picture keeps its sound in sync.
usage: .venv/Scripts/python.exe audio/make_audio_ep002.py -> audio/ep002/mix.wav (48 kHz stereo, exactly TOTAL frames long)"""
import pathlib
import re

import numpy as np
import soundfile as sf
from scipy import signal

HERE = pathlib.Path(__file__).resolve().parent
story = (HERE.parent / "src" / "videos" / "ep002" / "story.ts").read_text(encoding="utf-8")
Q = {k: int(v) / 30 for k, v in re.findall(r"(\w+): (\d+)", story[story.index("export const Q = {"):story.index("};", story.index("export const Q = {"))])}
SR = 48000
DUR = Q["END"]
N = int(SR * DUR)
ROOT = HERE / "ep002"
ROOT.mkdir(exist_ok=True)
rng = np.random.default_rng(897)
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
# A: a bouncy, slightly comic F-major line for the lawyer (scenes 1-7), ~108 bpm, pizzicato bass + woodblock
beat = 60 / 108
F_MAJ = [349.23, 440.0, 523.25, 440.0, 392.0, 466.16, 392.0, 349.23]
BASS_A = [87.31, 87.31, 116.54, 130.81]


def theme(t0, t1, gain=1.0):
    b = 0
    while t0 + b * 4 * beat < t1:
        tb = t0 + b * 4 * beat
        for k, bass in enumerate(BASS_A):
            put(music, pluck(bass, 0.6, 0.7, 0.25), tb + k * beat, 0.5 * gain)
        for j in range(8):
            put(music, pluck(F_MAJ[(j + b * 3) % 8], 0.35, 1.3, 0.09), tb + (j + 0.5) * beat / 2 + (0.02 if j % 2 else 0), 0.2 * gain)
        for j in range(4): put(music, click(0.03, 1200, 3000) * 0.5, tb + j * beat + beat / 2, 0.1 * gain)
        b += 1


theme(0.0, Q["L8"] - 0.4)
# B: Rome, 897 (scenes 8-11): dark organ in D minor, a slow low piano, a heartbeat pulse
for k, (t0, chord) in enumerate([(Q["L8"], (73.42, 110.0, 146.83)), (Q["L8"] + 3.3, (65.41, 98.0, 155.56)), (Q["L9"], (73.42, 110.0, 174.61)),
                                  (Q["L9"] + 3.0, (58.27, 87.31, 146.83)), (Q["L10"], (73.42, 110.0, 146.83)), (Q["L11"], (69.3, 103.83, 138.59))]):
    nxt = [Q["L8"] + 3.3, Q["L9"], Q["L9"] + 3.0, Q["L10"], Q["L11"], Q["L12"]][k]
    for f in chord: put(music, organ(f, nxt - t0 + 0.4), t0, 0.5)
for k in range(int((Q["L12"] - Q["L8"]) / 0.9)):
    put(music, thump(52, 0.3, 0.09), Q["L8"] + 0.9 * k, 0.25)
    put(music, thump(52, 0.3, 0.09), Q["L8"] + 0.9 * k + 0.22, 0.15)
for k, f in enumerate([146.83, 174.61, 220.0, 207.65, 174.61, 146.83, 138.59, 146.83]):
    put(music, piano(f, 2.0), Q["L8"] + 0.5 + 1.6 * k, 0.12)
# "Case lost": two falling notes; "But wait": a rising pluck run into section C
for k, f in enumerate([220.0, 207.65, 196.0]): put(music, piano(f, 1.6), Q["L12"] + 0.05 + 0.3 * k, 0.22)
for k, f in enumerate([293.66, 349.23, 440.0, 523.25, 587.33]): put(music, pluck(f, 0.4, 1.3, 0.12), Q["wait"] + 0.35 + 0.09 * k, 0.3)
# C: history turns (scenes 13-17): bright D major, ~124 bpm
beat_c = 60 / 124
D_MAJ = [293.66, 369.99, 440.0, 587.33, 440.0, 369.99, 329.63, 369.99]
b = 0
while Q["L13"] + b * 4 * beat_c < Q["L18"] - 0.3:
    tb = Q["L13"] + b * 4 * beat_c
    for k, bass in enumerate([73.42, 73.42, 98.0, 110.0]): put(music, pluck(bass, 0.5, 0.8, 0.3), tb + k * beat_c, 0.55)
    for j in range(8): put(music, pluck(D_MAJ[(j + b * 2) % 8], 0.4, 1.2, 0.12), tb + j * beat_c / 2, 0.24)
    for j in range(8): put(music, click(0.03, 1500, 4000) * 0.5, tb + j * beat_c / 2 + beat_c / 4, 0.1)
    b += 1
for f in (293.66, 369.99, 440.0, 587.33, 880.0): put(music, piano(f, 2.4), Q["won"], 0.2)   # the chord under "won in history"
# D: the opening theme again (scene 18 matches scene 1)
theme(Q["L18"], DUR)

cut = np.ones(N)
def hole(a, b, fade=0.12, floor=0.0):
    i0, i1, i2 = int((a - fade) * SR), int(a * SR), int(b * SR)
    cut[i0:i1] = np.minimum(cut[i0:i1], np.linspace(1, floor, i1 - i0)); cut[i1:i2] = np.minimum(cut[i1:i2], floor)
    j = min(N, i2 + int(0.15 * SR)); cut[i2:j] = np.minimum(cut[i2:j], np.linspace(floor, 1, j - i2))
hole(Q["realQ1"] + 0.25, Q["L3"] - 0.05)          # the 0.8 s "REAL OR MYTH?" silences
hole(Q["realQ2"] + 0.25, Q["L9"] - 0.05)
hole(Q["L4"] + 0.1, Q["L5"] - 0.1, 0.3, 0.3)       # the judge thinks: music very low
hole(Q["wait"] + 0.25, Q["L13"] - 0.05, 0.1, 0.0)  # hold on Milo's face
hole(Q["L7"] - 0.25, Q["L7"], 0.1, 0.0)
music *= cut
music *= np.minimum(1, T(N) / 0.5) * np.minimum(1, (DUR - T(N)) / 0.6)

# ---------------------------------------------------------------- sfx
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


def squeak(t0, f=2600, g=0.25, n_=3):
    """rat squeaks: short upward chirps"""
    for k in range(n_):
        d = 0.07 + 0.02 * (k % 2); n = int(d * SR); tt = T(n)
        fr = f * (1 + 0.35 * tt / d) * (1 + 0.04 * k)
        put(sfx, np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.sin(np.pi * tt / d) ** 2, t0 + 0.11 * k, g)


def paper(t0, dur=0.3, g=0.25):
    n = int(dur * SR); put(sfx, bp(noise(n), 1500, 7000) * (0.4 + 0.6 * (rng.random(n) > 0.7)) * np.sin(np.linspace(0, np.pi, n)), t0, g)


def cheer(t0, dur, g=0.14):
    for k in range(int(dur / 0.8)):
        n = int(0.9 * SR); put(sfx, bp(noise(n), 400, 2200) * (0.6 + 0.4 * np.sin(T(n) * 15)) * np.sin(np.linspace(0, np.pi, n)), t0 + 0.8 * k, g)


def murmur(t0, dur, g=0.06, lo=250, hi=1100):
    for k in range(int(dur / 0.5)):
        n = int(0.5 * SR); put(sfx, bp(noise(n), lo, hi) * (0.5 + 0.5 * np.sin(T(n) * 20 + k)) * np.sin(np.linspace(0, np.pi, n)), t0 + 0.5 * k, g)


def drum(t0, g=0.6):
    """the 'dun' under each REAL OR MYTH? card"""
    put(sfx, add(thump(55, 0.9, 0.3), bell(110, 0.9, 0.4) * 0.3), t0, g)


def clang(t0, g=0.8):
    n = int(1.2 * SR); tt = T(n)
    s = sum(a * np.sin(2 * np.pi * f * tt) * np.exp(-tt / d) for f, a, d in [(180, 1, 0.5), (437, 0.6, 0.35), (811, 0.4, 0.25), (1290, 0.25, 0.15)])
    put(sfx, add(s * 0.6, thump(60, 0.5, 0.12), click(0.05, 500, 4000)), t0, g)


def tear(t0, g=0.35):
    n = int(0.45 * SR); tt = T(n)
    put(sfx, bp(noise(n), 1200, 8000) * (0.5 + 0.5 * (rng.random(n) > 0.5)) * np.minimum(1, tt / 0.02) * np.exp(-tt / 0.25), t0, g)


def cluck(t0, g=0.3):
    for k in range(3):
        n = int(0.09 * SR); tt = T(n)
        put(sfx, bp(noise(n), 700, 1800) * np.sin(np.pi * tt / 0.09) * 2 + np.sin(2 * np.pi * 620 * tt) * np.sin(np.pi * tt / 0.09) * 0.4, t0 + 0.14 * k, g)


# 1: the office: candle, the two CLIENT tags, the flash
for tp, f in [(Q["first"] - 0.07, 880), (Q["second"] - 0.07, 1047)]: put(sfx, bell(f, 0.5, 0.15), tp, 0.28); paper(tp + 0.02, 0.2, 0.12)
whoosh(Q["flash"] - 0.2, 0.35, 400, 5000, 0.35)
# 2: France: the case label, the summons, the rats peek, REAL OR MYTH?
whoosh(Q["L2"] - 0.2, 0.4, 300, 4000, 0.25); put(sfx, bell(784, 0.9, 0.35), Q["L2"] + 0.13, 0.22)
murmur(Q["L2"], 3.0, 0.05)
gavel(Q["summoned"] + 0.05, 0.25)
squeak(Q["showed"] + 0.15, 2900, 0.18, 2)
drum(Q["realQ1"], 0.7)
# 3: the argument: squeaks, shivers, the bubble
paper(Q["L3"] + 0.1, 0.3, 0.2)
squeak(Q["argument"] + 0.05, 2600, 0.22, 4)
n = int(1.2 * SR); put(sfx, bp(noise(n), 2000, 6000) * (0.5 + 0.5 * np.sin(T(n) * 2 * np.pi * 18)) * np.sin(np.linspace(0, np.pi, n)), Q["argument"] + 0.2, 0.06)
boing(Q["scared"] - 0.05, 500, 900, 0.18, 0.25); squeak(Q["scared"] + 0.25, 3200, 0.2, 3)
# 4: the judge thinks: a gavel tap, three soft ticks for the dots
gavel(Q["L4"] + 0.05, 0.35)
for k in range(3): put(sfx, bell(1319 + 200 * k, 0.4, 0.1), Q["L4"] + 0.6 + 0.4 * k, 0.12)
# 5: extra time: pages flip, Milo jumps, rats cheer
for k in range(6): paper(Q["extra"] + 0.05 + 0.2 * k, 0.12, 0.25)
put(sfx, bell(880, 0.6, 0.2), Q["extra"], 0.2)
for k in range(4): boing(Q["round"] + 0.05 + 0.37 * k, 300, 700, 0.25, 0.22)
squeak(Q["round"] + 0.1, 3000, 0.2, 5); cheer(Q["round"], 2.2, 0.08)
# 6: REAL
stamp(Q["real1"], 0.95)
for k, f in enumerate([1047, 1319, 1568]): put(sfx, bell(f, 0.8, 0.3), Q["real1"] + 0.1 + 0.07 * k, 0.22)
# 7: back in the office: the folder opens, the shock
whoosh(Q["L7"] - 0.2, 0.4, 300, 4000, 0.22)
paper(Q["L7"] + 1.1, 0.35, 0.3)
put(sfx, add(bell(1661, 0.8, 0.2), bell(1760, 0.8, 0.2)), Q["dead7"] - 0.05, 0.25)
# 8: Rome: a low boom, the label bell, REAL OR MYTH?
put(sfx, add(thump(40, 1.6, 0.6), lp(noise(int(1.5 * SR)), 200) * np.exp(-T(int(1.5 * SR)) / 0.5)), Q["L8"] - 0.1, 0.6)
put(sfx, bell(587, 1.2, 0.5), Q["L8"] + 0.15, 0.2)
put(sfx, lp(noise(int((Q["L12"] - Q["L8"]) * SR)), 250) * 0.05, Q["L8"], 1.0)       # room tone of the big hall
drum(Q["realQ2"], 0.7)
# 9: Stephen orders, the bearers' steps, the soft thud on the throne
put(sfx, bp(noise(int(0.4 * SR)), 300, 1800) * np.sin(np.linspace(0, np.pi, int(0.4 * SR))), Q["L9"] + 0.3, 0.1)
for k in range(8): put(sfx, add(thump(110, 0.12, 0.03) * 0.5, click(0.02, 400, 1500) * 0.4), Q["dug"] + 0.4 + 0.27 * k, 0.25)
put(sfx, add(thump(65, 0.4, 0.1), lp(noise(int(0.3 * SR)), 800) * np.exp(-T(int(0.3 * SR)) / 0.08) * 1.5), Q["trial9"] - 0.15, 0.6)
# 10: Milo shoved to the lectern; the little bubble
whoosh(Q["L10"], 0.5, 300, 3000, 0.25); boing(Q["L10"] + 0.6, 250, 600, 0.25, 0.2)
put(sfx, add(thump(90, 0.2, 0.05), click(0.03, 600, 2500)), Q["L10"] + 1.0, 0.35)
boing(Q["defend"] + 0.27, 600, 900, 0.12, 0.15)
# 11: guilty: gavel, stamp, sad
gavel(Q["guilty"] - 0.05, 0.9); stamp(Q["guilty"] + 0.07, 0.85); sad(Q["guilty"] + 0.3, 0.3)
murmur(Q["guilty"] + 0.2, 1.0, 0.06)
# 12: but wait
put(sfx, add(bell(988, 0.6, 0.2), bell(1319, 0.6, 0.2)), Q["wait"] - 0.05, 0.3)
n = int(0.6 * SR); put(sfx, bp(noise(n), 800, 6000) * np.linspace(0, 1, n) ** 2, Q["wait"] + 0.25, 0.18)     # riser into C
# 13: the square: the crowd, the gate drops and slams
cheer(Q["L13"], Q["prison"] - Q["L13"] + 0.8, 0.14)
put(sfx, bell(784, 0.9, 0.35), Q["L13"] + 0.1, 0.2)
n = int(0.45 * SR); put(sfx, bp(noise(n), 400, 3000) * (rng.random(n) > 0.9) * 2, Q["prison"] - 0.4, 0.25)    # chain rattle
clang(Q["prison"] + 0.07, 0.8)
# 14: the new pope tears the verdict
tear(Q["canceled"] - 0.13, 0.4); cheer(Q["canceled"] + 0.1, 1.6, 0.12)
for k in range(8): put(sfx, add(hp(noise(int(0.08 * SR)), 3000) * np.exp(-T(int(0.08 * SR)) / 0.02) * 3, click(0.02, 2000, 6000)), Q["canceled"] + 0.2 + 0.1 * k, 0.1)
# 15: 898: a bell for the year, the seal
put(sfx, bell(880, 0.8, 0.3), Q["L15"] + 0.07, 0.22)
gavel(Q["banned"] - 0.03, 0.6); stamp(Q["banned"] + 0.07, 0.6)
# 16: REAL
stamp(Q["real2"], 0.95)
for k, f in enumerate([1047, 1319, 1568]): put(sfx, bell(f, 0.8, 0.3), Q["real2"] + 0.1 + 0.07 * k, 0.22)
# 17: one "ting" per word of WON IN HISTORY, the POPE cell turns over
whoosh(Q["won"] - 0.15, 0.3, 800, 5000, 0.2)
for tw, f in [(Q["won"], 1047), (Q["won"] + 5 / 30, 1319), (Q["history"] + 2 / 30, 1568)]: put(sfx, bell(f, 0.9, 0.3), tw, 0.3)
# 18: the NEXT CASE card flips; the rooster; the question
whoosh(Q["rooster"] - 0.35, 0.35, 600, 5000, 0.3); paper(Q["rooster"] - 0.1, 0.15, 0.2)
cluck(Q["rooster"] + 0.4, 0.3)
put(sfx, add(thump(120, 0.15, 0.03), click(0.02, 2000, 5000)), Q["egg"] + 0.05, 0.3)
for tw, f in [(Q["would"] + 0.2, 660), (Q["would"] + 0.45, 784), (Q["would"] + 0.75, 988)]: put(sfx, add(pluck(f, 0.4, 1.4, 0.1), click(0.02, 800, 3000)), tw, 0.35)
amb = np.zeros(N)
for a, b in ((0.0, Q["L2"]), (Q["L7"], Q["L8"]), (Q["L17"], DUR)):          # the office: a quiet warm room tone
    i0, i1 = int(a * SR), min(N, int(b * SR)); m = i1 - i0
    amb[i0:i1] += lp(noise(m), 500) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.15 * T(m))) * 0.025

# ---------------------------------------------------------------- voice, ducking, mix (music +3 dB, SFX -6 dB, voice as is)
v, vsr = sf.read(HERE.parent / "voice" / "ep002" / "voice.wav", dtype="float32")
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
