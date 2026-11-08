"""ep007 sound ("300 Spartans Held Off a MILLION Persians? Real or Myth?"): original synthesized score + SFX, mixed with the Kokoro voice
(voice/ep007/voice.wav). EVERY cue time is read from the Q table in src/episodes/ep007-thermopylae/events.ts (the single source of time),
so a re-timed picture keeps its sound in sync, and the same table is written to audio/ep007/sfx-cues.json.
usage: .venv/Scripts/python.exe audio/make_audio_ep007.py -> audio/ep007/mix.wav (48 kHz stereo, exactly END frames) + sfx-cues.json
Score: a low war-drum pulse with a minor-key marimba motif (12 dB under the voice); it stops for 0.3 s at the shield lock and at the stamp."""
import json
import pathlib
import re

import numpy as np
import soundfile as sf
from scipy import signal

HERE = pathlib.Path(__file__).resolve().parent
story = (HERE.parent / "src" / "episodes" / "ep007-thermopylae" / "events.ts").read_text(encoding="utf-8")
i0 = story.index("export const Q = {")
QF = {k: int(v) for k, v in re.findall(r"(\w+): (\d+)", story[i0:story.index("};", i0)])}  # frames
FPS = 30
Q = {k: v / FPS for k, v in QF.items()}  # seconds
SR = 48000
DUR = Q["END"]
N = int(SR * DUR)
ROOT = HERE / "ep007"
ROOT.mkdir(exist_ok=True)
rng = np.random.default_rng(480)
T = lambda n: np.arange(n) / SR
fs = lambda name: QF[name] / FPS


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
D_MIN = [293.66, 349.23, 440.0, 392.0, 349.23, 329.63, 293.66, 261.63]   # D minor motif
BEAT = 60 / 96


def war(t0, t1, gain=1.0, motif=True):
    """a low drum pulse (hits on 1 and 3, a lighter hit on the off-beats) and, optionally, the minor motif"""
    b = 0
    while t0 + b * 4 * BEAT < t1:
        tb = t0 + b * 4 * BEAT
        for k in range(4):
            put(music, thump(58 if k % 2 == 0 else 74, 0.4, 0.12 if k % 2 == 0 else 0.07), tb + k * BEAT, (0.55 if k % 2 == 0 else 0.3) * gain)
            put(music, click(0.03, 900, 2600) * 0.5, tb + (k + 0.5) * BEAT, 0.08 * gain)
        if motif:
            for j in range(8): put(music, marimba(D_MIN[(j + b * 3) % 8], 0.4, 0.14), tb + j * BEAT / 2, 0.16 * gain)
        b += 1


war(0.0, fs("rehook") - 0.03, 0.8)                                    # the opening: the pulse under the Persian sea
war(fs("rehook") + 0.34, fs("L7"), 1.15)                              # the pass: louder, the battle
for k, (t0, chord) in enumerate([(fs("L7"), (73.42, 110.0, 146.83)), (fs("L8"), (65.41, 98.0, 155.56))]):   # "how did it fall?", Ephialtes: tense organ
    for f in chord: put(music, organ(f, (fs("L9") if k else fs("L8")) - t0 + 0.4), t0, 0.45)
for k in range(int((fs("L10") - fs("L9")) / 0.85)):                    # the night path: a slow heartbeat
    put(music, thump(52, 0.3, 0.09), fs("L9") + 0.85 * k, 0.2); put(music, thump(52, 0.3, 0.09), fs("L9") + 0.85 * k + 0.21, 0.12)
for f in (73.42, 110.0, 174.61): put(music, organ(f, fs("L11") - fs("L10") + 0.4), fs("L10"), 0.5)   # Leonidas: a heroic held chord
for k, f in enumerate([293.66, 349.23, 440.0, 587.33]): put(music, marimba(f, 0.7, 0.25), fs("wave_off") + 0.1 * k, 0.28)
for k, f in enumerate([293.66, 440.0, 587.33, 698.46, 880.0]): put(music, marimba(f, 0.7, 0.25), fs("stamp") + 0.34 + 0.07 * k, 0.3)   # after the stamp: a major lift
for f in (146.83, 220.0, 369.99): put(music, organ(f, 2.0), fs("stamp") + 0.34, 0.5)
war(fs("L12"), DUR, 0.5, motif=True)

cut = np.ones(N)


def hole(a, b, fade=0.05, floor=0.0):
    i0, i1, i2 = int((a - fade) * SR), int(a * SR), int(b * SR)
    cut[i0:i1] = np.minimum(cut[i0:i1], np.linspace(1, floor, i1 - i0)); cut[i1:i2] = np.minimum(cut[i1:i2], floor)
    j = min(N, i2 + int(0.1 * SR)); cut[i2:j] = np.minimum(cut[i2:j], np.linspace(floor, 1, j - i2))


hole(fs("rehook") - 0.03, fs("rehook") + 0.3)                          # the music stops for the shield lock (0.3 s)
hole(fs("stamp") - 0.03, fs("stamp") + 0.3)                            # ... and for the stamp
hole(fs("L11"), fs("stamp") - 0.05, 0.1, 0.5)                          # "Verdict:" dips under the voice
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


def clang(t0, g=0.6, f=1250):
    """a spear or shield hit: a bright metal ring over a short noise burst and a thud"""
    put(sfx, add(bell(f, 0.9, 0.09) * 0.9, bell(f * 1.51, 0.5, 0.05) * 0.5, hp(noise(int(0.08 * SR)), 2000) * np.exp(-T(int(0.08 * SR)) / 0.015) * 2, thump(110, 0.18, 0.04) * 0.6), t0, g)


def scratch(t0, g=0.6):
    for k, (dur, f0, f1) in enumerate([(0.28, 1400, 160), (0.22, 220, 900)]):
        n = int(dur * SR); tt = T(n)
        fr = f0 * (f1 / f0) ** (tt / dur); ph = np.cumsum(fr) / SR
        s = bp(2 * (ph % 1) - 1, 250, 4500) * 0.8 + 0.5 * bp(noise(n), 1500, 6500)
        put(sfx, s * np.sin(np.pi * np.minimum(1, tt / dur)) ** 0.6 * np.minimum(1, (dur - tt) / 0.03), t0 + 0.30 * k, g)


def tick(t0, g=0.12):
    put(sfx, add(click(0.015, 2500, 7000), thump(900, 0.03, 0.01) * 0.3), t0, g)


def sweep(t0, dur, f0, f1, g=0.1):
    n = int(dur * SR); tt = T(n)
    put(sfx, np.sin(2 * np.pi * np.cumsum(f0 + (f1 - f0) * (tt / dur)) / SR) * np.sin(np.pi * tt / dur) * 0.6, t0, g)


def pop(t0, g=0.4):
    n = int(0.12 * SR); tt = T(n)
    put(sfx, add(np.sin(2 * np.pi * np.cumsum(np.maximum(200, 900 - 5200 * tt)) / SR) * np.exp(-tt / 0.03), click(0.01, 2000, 7000) * 0.4), t0, g)


def step(t0, g=0.14):
    put(sfx, add(thump(85, 0.1, 0.03) * 0.5, lp(noise(int(0.08 * SR)), 900) * np.exp(-T(int(0.08 * SR)) / 0.02)), t0, g)


# the opening: the weight of the horde (a low rumble that ends the moment the first line is spoken) and the dull hit at frame 0
n = int(2.4 * SR); put(sfx, lp(noise(n), 160) * np.sin(np.linspace(0, np.pi, n)) ** 0.5 * 4, 0.0, 0.18)
put(sfx, thump(60, 0.5, 0.16), 0.02, 0.8)
# "million": the boom that goes with the word and the pulse of the headline
put(sfx, add(thump(45, 1.1, 0.35), lp(noise(int(0.5 * SR)), 400) * np.exp(-T(int(0.5 * SR)) / 0.12) * 2), fs("million"), 0.9)
# scene cuts: a soft whoosh before every sentence start
for name in ["L2", "L3", "L4", "L6", "L7", "L8", "L9", "L10", "L11", "L12", "L13"]:
    whoosh(fs(name) - 0.12, 0.3, 400, 4500, 0.2)
# 2: the stamps, the meter comes on
stamp(fs("L2") + 8 / FPS, 0.5); stamp(fs("L2") + 26 / FPS, 0.5)
for k in range(6): tick(fs("meter_on") + 0.1 + 0.2 * k, 0.07)
# the clue chips
ding(fs("clue1"), 0.5); ding(fs("clue2"), 0.5); ding(fs("L8"), 0.5)
# 3: the count: a strike-through scratch and a drop in pitch, then the new number lands
sweep(fs("count_p") - 0.25, 0.3, 900, 300, 0.1); stamp(fs("count_p"), 0.5); ding(fs("count_p") + 0.15, 0.3)
# 4: "not 300" struck out, then the dots gather: a stream of small pops, and the needle rises
stamp(fs("not300"), 0.4)
for k in range(34): pop(fs("count_g") + 0.04 * k + 0.02 * rng.random(), 0.12)
sweep(fs("count_g"), 0.7, 400, 900, 0.1)
# 5: the re-hook: record scratch + shield clang + thud on the SAME event frame
scratch(fs("rehook") - 0.08, 0.7)
for k in range(5): clang(fs("rehook") + 0.012 * k, 0.5, 1100 + 90 * k)
put(sfx, thump(48, 0.6, 0.2), fs("rehook"), 0.8)
for k in range(5): tick(fs("rehook") + 0.04 * k, 0.12)
boing(fs("rehook") + 0.1, 300, 750, 0.25, 0.25)
# 6: two thrusts: a whoosh ahead of each, the clang on the contact frame
for name in ("thrust_1", "thrust_2"):
    whoosh(fs(name) - 0.2, 0.2, 800, 5000, 0.3); clang(fs(name), 0.8, 1350 if name == "thrust_1" else 1500); put(sfx, thump(90, 0.2, 0.05), fs(name), 0.4)
# 7: Pip scratches his head (a tiny boing)
boing(fs("L7") + 0.15, 220, 420, 0.2, 0.22)
# 8: Ephialtes' footsteps (march: one step every 12 frames) and the point
for k in range(int((fs("point") - 12 / FPS - fs("L8")) / 0.4)): step(fs("L8") + 0.4 * k + 0.1, 0.15)
whoosh(fs("point") - 0.1, 0.3, 500, 3500, 0.2); boing(fs("point"), 240, 520, 0.2, 0.2)
# 9: the night path: torch crackle, the guard's surprise sting and Pip's gasp
n = int((fs("L10") - fs("L9")) * SR); put(sfx, hp(noise(n), 2500) * (rng.random(n) > 0.985) * 0.5, fs("L9"), 0.12)
whoosh(fs("night") - 0.1, 0.6, 300, 2500, 0.2)
for tt_, f in [(fs("surprise") - 0.03, 311), (fs("surprise") + 0.12, 294)]: put(sfx, add(bell(f * 2, 0.8, 0.3) * 0.6, organ(f, 0.8) * 0.8), tt_, 0.4)
boing(fs("surprise") + 0.03, 260, 800, 0.2, 0.28)
# 10: the wave, the army leaves (march), the small group locks its shields on ev:stand
whoosh(fs("wave_off") - 0.1, 0.3, 500, 3500, 0.2)
for k in range(int((fs("L11") - fs("wave_off") - 0.3) / 0.4)): step(fs("wave_off") + 0.3 + 0.4 * k, 0.1 * (1 - 0.7 * k / 8) if k < 8 else 0.03)
for k in range(3): clang(fs("stand") + 0.067 * k, 0.45, 1000 + 120 * k)
# 11: the verdict
stamp(fs("stamp"), 1.0)
for k, f in enumerate([1047, 1319, 1568]): put(sfx, bell(f, 0.8, 0.3), fs("stamp") + 0.1 + 0.07 * k, 0.22)
sweep(fs("stamp") - 0.05, 0.5, 700, 1600, 0.12)
# 13: SUBSCRIBE: boing in, ding, press, bell; the loop frame
boing(fs("subscribe") - 0.07, 200, 500, 0.15, 0.25); ding(fs("subscribe"), 0.55)
put(sfx, add(thump(120, 0.1, 0.03), click(0.02, 1500, 5000)), fs("subscribe") + 22 / FPS, 0.25)
for k in range(5): put(sfx, bell(2349 if k % 2 else 2093, 0.5, 0.12), fs("subscribe") + (24 + 3 * k) / FPS, 0.22 * (1 - 0.15 * k))
pop(fs("LOOP") - 0.2, 0.3)

amb = lp(noise(N), 500) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.15 * T(N))) * 0.02
amb *= cut ** 0.5

# ---------------------------------------------------------------- voice, ducking, mix (music +3 dB, SFX -6 dB, voice as is)
v, vsr = sf.read(HERE.parent / "voice" / "ep007" / "voice.wav", dtype="float32")
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

# the cue sheet: every event with the sound that goes on it (frames from events.ts)
SOUND = {"reveal": "low hit + horde rumble", "million": "boom", "meter_on": "meter ticks", "count_p": "strike-through + ding", "count_g": "pops + rising sweep",
         "rehook": "record scratch + shield clang + thud", "thrust_1": "whoosh + spear clang", "thrust_2": "whoosh + spear clang", "point": "whoosh + boing",
         "night": "torch whoosh + crackle", "surprise": "sting + gasp boing", "wave_off": "whoosh", "stand": "three soft shield clangs", "stamp": "stamp + chime",
         "clue1": "ding", "clue2": "ding", "not300": "stamp", "subscribe": "ding + press + bell"}
cues = [{"event": k, "frame": QF[k], "seconds": round(QF[k] / FPS, 3), "sfx": SOUND[k]} for k in sorted(SOUND, key=lambda k: QF[k])]
(ROOT / "sfx-cues.json").write_text(json.dumps(cues, indent=1), encoding="utf-8")
rms = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
sp = np.convolve(np.abs(voice), np.ones(4800) / 4800, "same") > 0.02
print("in speech: voice", round(rms(voice[sp]), 1), "music", round(rms(M[sp]), 1), "sfx", round(rms(Sx[sp & (np.abs(Sx) > 1e-4)]), 1), "| music outside speech", round(rms(M[~sp & (np.abs(M) > 1e-4)]), 1))
print("peak", round(float(np.abs(stereo).max()), 3), "length", len(L) / SR, "s;", len(cues), "cues ->", ROOT / "sfx-cues.json")
