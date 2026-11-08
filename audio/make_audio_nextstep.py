"""Sound for "THE MOUNTAIN / THE NEXT STEP" (no voice): an ORIGINAL slowed-phonk score + synthesized SFX.
Every time is read from src/episodes/nextstep/events.ts (Q), shared with the picture.
usage: .venv/Scripts/python.exe audio/make_audio_nextstep.py -> audio/nextstep/mix.wav (48 kHz stereo, exactly LEN frames) + stems
Style (measured on the reference the user pointed to, not copied): 95 BPM, F minor, pitched-cowbell lead in the 350-700 Hz range,
distorted 808 around 44 Hz, half-time clap on beat 3, heavy compression. Melody-only intro -> 808 drop at bar 8 -> silence for the slide
-> second, bigger drop at bar 15 -> a single bell to loop."""
import pathlib
import re

import numpy as np
import soundfile as sf
from scipy import signal

HERE = pathlib.Path(__file__).resolve().parent
src = (HERE.parent / "src" / "episodes" / "nextstep" / "events.ts").read_text(encoding="utf-8")
i0 = src.index("export const Q = {")
QF = {k: int(v) for k, v in re.findall(r"(\w+): (\d+)", src[i0:src.index("};", i0)])}
FPS, SR, BPM = 30, 48000, 95
S = {k: v / FPS for k, v in QF.items()}
DUR = S["LEN"]
N = int(round(SR * DUR))
BEAT = 60 / BPM
STEP = BEAT / 4  # 16th note
BAR = BEAT * 4
OUT = HERE / "nextstep"
OUT.mkdir(exist_ok=True)
rng = np.random.default_rng(95)


def tt(n): return np.arange(n) / SR
def db(x): return 10 ** (x / 20)
def lp(x, fc, o=2): return signal.sosfilt(signal.butter(o, fc, "low", fs=SR, output="sos"), x)
def hp(x, fc, o=2): return signal.sosfilt(signal.butter(o, fc, "high", fs=SR, output="sos"), x)
def bp(x, lo, hi, o=2): return signal.sosfilt(signal.butter(o, [lo, hi], "band", fs=SR, output="sos"), x)
def noise(n): return rng.standard_normal(n)
def env(n, a=0.002, d=0.2, k=4.0):
    t = tt(n); return np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * k / max(d, 1e-4))
def sq(f, n): return np.sign(np.sin(2 * np.pi * f * tt(n)))


def put(buf, sig, t, g=1.0, pan=0.0):
    if sig.ndim == 1:
        sig = np.stack([sig * np.sqrt(1 - pan) , sig * np.sqrt(1 + pan)], 1) * 0.7071 * 1.414
    i = int(round(t * SR))
    if i >= len(buf) or i + len(sig) <= 0: return
    a, b = max(0, -i), min(len(sig), len(buf) - i)
    buf[i + a:i + b] += g * sig[a:b]


NOTES = {"C": -9, "Db": -8, "D": -7, "Eb": -6, "E": -5, "F": -4, "Gb": -3, "G": -2, "Ab": -1, "A": 0, "Bb": 1, "B": 2}
def hz(name, o): return 440 * 2 ** ((NOTES[name] + (o - 4) * 12) / 12)


# ---------------------------------------------------------------- instruments
def cowbell(f, dur=0.32):
    n = int(dur * SR)
    x = 0.6 * sq(f, n) + 0.6 * sq(f * 1.4836, n)
    x = bp(x, f * 0.9, min(f * 6, 9000))
    return np.tanh(1.5 * x) * env(n, 0.001, dur * 0.7, 4) * 0.5
def kick808(f0=43.65, dur=0.9, drive=2.2):
    n = int(dur * SR); t = tt(n)
    fr = f0 + 90 * np.exp(-t * 35)
    x = np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(n, 0.001, dur * 0.85, 2.2)
    return np.tanh(drive * x) / np.tanh(drive)
def bass808(f, dur, glide_from=None, drive=3.0):
    n = int(dur * SR); t = tt(n)
    fr = np.full(n, f) if glide_from is None else f + (glide_from - f) * np.exp(-t * 18)
    x = np.sin(2 * np.pi * np.cumsum(fr) / SR)
    x = np.tanh(drive * x) / np.tanh(drive)
    return lp(x, 900) * np.minimum(1, t / 0.004) * np.minimum(1, (dur - t) / 0.03).clip(0, 1)
def clap():
    n = int(0.35 * SR); x = bp(noise(n), 900, 4000)
    e = sum(env(n, 0.001, 0.01, 3) * (tt(n) >= k * 0.012) for k in range(3)) + 0.7 * env(n, 0.001, 0.22, 4)
    return x * e * 0.9
def hat(open_=False):
    n = int((0.22 if open_ else 0.05) * SR)
    return hp(noise(n), 7500, 4) * env(n, 0.0005, 0.18 if open_ else 0.025, 5) * 0.5
def pad(freqs, dur, bright=0.3):
    n = int(dur * SR); out = np.zeros((n, 2))
    for f in freqs:
        for k, det in enumerate((-0.08, 0.0, 0.07)):
            out[:, k % 2] += 2 * ((tt(n) * f * 2 ** (det / 12) + rng.random()) % 1) - 1
    out = np.stack([lp(out[:, 0], 300 + 1500 * bright), lp(out[:, 1], 300 + 1500 * bright)], 1)
    a = np.minimum(1, tt(n) / 0.6) * np.minimum(1, (dur - tt(n)) / 0.6).clip(0, 1)
    return out * a[:, None] / (len(freqs) * 3)
def riser(dur, g=1.0):
    n = int(dur * SR); t = tt(n) / dur; x = noise(n); y = np.zeros(n); st = int(0.02 * SR)
    for i in range(0, n, st):
        c = 300 + 7000 * (i / n) ** 2; y[i:i + st] = bp(x[i:i + st], c, min(c * 1.8, 20000))
    return g * (0.6 * y + 0.25 * np.sin(2 * np.pi * np.cumsum(150 + 800 * t ** 2) / SR)) * t ** 2
def boom(g=1.0):
    n = int(2.5 * SR); t = tt(n)
    return g * (np.sin(2 * np.pi * np.cumsum(36 + 50 * np.exp(-t * 5)) / SR) * env(n, 0.002, 2.0, 3) + 0.5 * lp(noise(n), 800) * env(n, 0.001, 0.3, 4))
def crash(g=1.0):
    n = int(2.2 * SR); return g * hp(noise(n), 4500) * env(n, 0.001, 1.8, 3) * 0.4
def echo(x, delay=BEAT * 0.75, fb=0.35, mix=0.35):
    d = int(delay * SR); y = x.copy()
    for k in range(1, 5): y[d * k:] += x[:-d * k] * (fb ** k) * mix if d * k < len(x) else 0
    return y


# ---------------------------------------------------------------- score
mus = np.zeros((N, 2))
DROP1, SLIDE, LOOKDOWN, DROP2, FINAL = S["DROP1"], S["SLIDE"], S["LOOKDOWN"], S["DROP2"], S["FINAL"]

# original 2-bar cowbell riff (16th grid): (step, note, octave)
RIFF = [(0, "F", 5), (3, "Ab", 5), (6, "C", 6), (8, "Bb", 5), (10, "Ab", 5), (11, "G", 5), (14, "F", 5),
        (16, "Eb", 5), (19, "F", 5), (22, "Ab", 5), (24, "G", 5), (26, "F", 5), (28, "Eb", 5), (30, "C", 5)]
RIFF_B = [(0, "F", 5), (3, "Ab", 5), (6, "C", 6), (8, "Db", 6), (10, "C", 6), (11, "Bb", 5), (14, "Ab", 5),
          (16, "G", 5), (19, "Ab", 5), (22, "Bb", 5), (24, "C", 6), (26, "Bb", 5), (28, "Ab", 5), (30, "G", 5)]
ROOTS = [("F", 1), ("F", 1), ("Db", 1), ("Eb", 1)]  # one per bar, 4-bar cycle

bell = np.zeros(N)
def riff_span(t0, t1, octave_shift=0, g=1.0):
    nbar = int(np.floor(t0 / (2 * BAR)))
    while nbar * 2 * BAR < t1:
        base = nbar * 2 * BAR
        riff = RIFF if nbar % 2 == 0 else RIFF_B
        for st, nm, o in riff:
            t = base + st * STEP
            if t0 - 1e-6 <= t < t1:
                sig = cowbell(hz(nm, o - 1 + octave_shift))
                i = int(t * SR); m = min(len(sig), N - i)
                if m > 0: bell[i:i + m] += g * sig[:m]
        nbar += 1
riff_span(0, SLIDE, 0, 1.0)
riff_span(DROP2, FINAL, 0, 1.0)
riff_span(DROP2, FINAL, 1, 0.35)  # octave doubling in the big drop
for k, (nm, o) in enumerate((("F", 4), ("C", 5), ("F", 5))):  # the last bells, ringing into the loop
    sig = cowbell(hz(nm, o), 0.6); i = int((FINAL + 0.3 + k * BEAT) * SR); m = min(len(sig), N - i)
    if m > 0: bell[i:i + m] += sig[:m]
bell = echo(bell)
put(mus, np.stack([bell, np.roll(bell, int(0.012 * SR))], 1) * 0.9, 0)

# dark pad under everything except the slide
for b0 in np.arange(0, DUR, BAR):
    if SLIDE <= b0 < DROP2 - 1e-6: continue
    seg = min(BAR, DUR - b0)
    if b0 < SLIDE < b0 + seg: seg = SLIDE - b0
    r = ROOTS[int(round(b0 / BAR)) % 4][0]
    chord = {"F": ["F", "Ab", "C"], "Db": ["Db", "F", "Ab"], "Eb": ["Eb", "G", "Bb"]}[r]
    put(mus, pad([hz(c, 3) for c in chord], seg, 0.25), b0, 0.5 if b0 < DROP1 else 0.35)

# light hats from bar 6 of the intro, riser into the drop
for t in np.arange(6 * BAR, DROP1, BEAT / 2): put(mus, hat(), t, 0.25 + 0.3 * (t - 6 * BAR) / (DROP1 - 6 * BAR), pan=0.3)
put(mus, riser(DROP1 - S["DAY1"], 0.6), S["DAY1"])

def groove(t0, t1, g=1.0, big=False):
    for bar_t in np.arange(t0, t1 - 1e-6, BAR):
        bi = int(round(bar_t / BAR))
        root, o = ROOTS[bi % 4]
        f = hz(root, o)
        # kick + 808 on 1 and the "and" of 3 (half-time phonk)
        for st in (0, 10) if not big else (0, 7, 10):
            t = bar_t + st * STEP
            if t < t1: put(mus, kick808(f, 0.25), t, 0.9 * g)
        for st, dur, gl in ((0, 6, None), (6, 4, f * 1.5), (10, 6, f * 0.75)):
            t = bar_t + st * STEP
            if t < t1: put(mus, bass808(f, min(dur * STEP, t1 - t), gl), t, 0.75 * g)
        t = bar_t + 8 * STEP
        if t < t1: put(mus, clap(), t, 0.8 * g)
        for k in range(16 if big else 8):
            t = bar_t + k * (STEP if big else 2 * STEP)
            if t < t1: put(mus, hat(open_=(k % 8 == 6)), t, 0.28 * g, pan=-0.3 if k % 2 else 0.3)
        # a 32nd hat roll at the end of every other bar
        if bi % 2 == 1:
            for k in range(6): put(mus, hat(), bar_t + 14 * STEP + k * STEP / 3, 0.2 * g, pan=0.2)

put(mus, boom(0.9), DROP1); put(mus, crash(0.7), DROP1)
groove(DROP1, SLIDE)
# the slide: everything stops; a sub drone and a heartbeat; riser + roll into the second drop
dn = int((DROP2 - SLIDE) * SR)
put(mus, bass808(hz("F", 0) * 2, DROP2 - SLIDE, drive=1.2) * np.minimum(1, tt(dn) / 1.0) * 0.35, SLIDE)
for t in np.arange(S["SLIDE_END"] + 0.6, LOOKDOWN, 0.9):
    for d, a in ((0, 1.0), (0.2, 0.7)):
        m = int(0.18 * SR); put(mus, np.sin(2 * np.pi * 52 * tt(m)) * env(m, 0.005, 0.12, 5) * a, t + d, 0.9)
put(mus, riser(DROP2 - LOOKDOWN, 0.9), LOOKDOWN)
t, gap = LOOKDOWN + 0.6, 0.2
while t < DROP2 - 0.03:
    put(mus, clap(), t, 0.15 + 0.5 * (t - LOOKDOWN) / (DROP2 - LOOKDOWN)); t += gap; gap = max(0.04, gap * 0.87)
put(mus, boom(1.1), DROP2); put(mus, crash(1.0), DROP2)
groove(DROP2, FINAL, 1.05, big=True)
for t in np.arange(DROP2 + 4 * BAR, FINAL, 4 * BAR): put(mus, crash(0.5), t)
put(mus, boom(0.8), S["FLAG"])
# the end: one bell rings out
put(mus, crash(0.4), FINAL)

# ---------------------------------------------------------------- sfx
sfx = np.zeros((N, 2))
def whoosh(dur, g=1.0):
    n = int(dur * SR); return g * lp(noise(n), 1600) * np.sin(np.pi * tt(n) / dur) ** 2 * 0.6
def thud(g=1.0):
    n = int(0.4 * SR); t = tt(n)
    return g * (np.sin(2 * np.pi * np.cumsum(60 + 90 * np.exp(-t * 25)) / SR) * env(n, 0.001, 0.25, 5) + 0.35 * lp(noise(n), 700) * env(n, 0.001, 0.05, 5))
def tink(f):
    n = int(0.7 * SR); t = tt(n); return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t)) * env(n, 0.001, 0.45, 5) * 0.3
def rumble(dur):
    n = int(dur * SR); x = lp(noise(n), 250) * 2.5 + 0.4 * bp((rng.random(n) < 0.004).astype(float) * noise(n) * 8, 300, 3000)
    return x * np.sin(np.pi * tt(n) / dur) ** 0.6 * 0.6
def rain(dur):
    n = int(dur * SR); x = bp(noise(n), 1500, 9000) * 0.12 + 0.3 * hp((rng.random(n) < 0.0015).astype(float) * noise(n), 2000)
    return x * np.minimum(1, tt(n) / 0.8) * np.minimum(1, (dur - tt(n)) / 0.8).clip(0, 1)
def ding(f1=1318.5, f2=1975.5, g=1.0):
    n = int(1.2 * SR); t = tt(n)
    return g * 0.45 * (np.sin(2 * np.pi * f1 * t) * env(n, 0.002, 0.8, 4) + 0.6 * np.sin(2 * np.pi * f2 * t) * env(n, 0.002, 0.8, 4) * (t > 0.1))

wn = int(S["TOP"] * SR)
put(sfx, lp(noise(wn), 900) * np.linspace(0.1, 1, wn) * 0.5, 0)       # rising wind on the tilt up
put(sfx, whoosh(0.5), S["WHIP"])
for k in ("NUM1", "NUM2", "NUM3"):
    put(sfx, whoosh(0.3, 0.5), S[k]); put(sfx, thud(1.0), S[k] + 10 / FPS)
for k, t0 in enumerate((300, 355, 410, 465)):
    put(sfx, tink(698 * 2 ** (k * 2 / 12)), (t0 + 18) / FPS, 0.6, pan=0.3)
put(sfx, np.stack([rain(SLIDE - DROP1 + 0.6)] * 2, 1), DROP1 + 0.4, 1.0)
for t in np.arange(DROP1 + 1.5, SLIDE, 2.4): put(sfx, whoosh(1.2, 0.5), t, pan=0.5)
put(sfx, rumble(1.6), SLIDE - 0.2, 1.0); put(sfx, thud(1.2), S["SLIDE_END"])
put(sfx, whoosh(0.6, 0.7), S["LOOKUP"]); put(sfx, tink(880), LOOKDOWN, 0.8)
put(sfx, whoosh(0.4), S["WIDE0"]); put(sfx, whoosh(0.5), S["SUMMIT"])
put(sfx, thud(0.9), S["FLAG"]); put(sfx, tink(1046.5), S["FLAG"] + 0.05, 0.8)
put(sfx, whoosh(1.2, 0.8), S["PASS"]); put(sfx, ding(), S["RING"], 1.0)
put(sfx, thud(0.6), S["ASTEP"] + 18 / FPS); put(sfx, tink(698), S["ASTEP"] + 18 / FPS, 0.7)

# ---------------------------------------------------------------- mix
def peak(x, p=0.8): m = np.max(np.abs(x)); return x * (p / m) if m else x
mus, sfx = peak(mus), peak(sfx)
mix = mus * db(-1) + sfx * db(-5)
rms = np.sqrt(np.mean(mix ** 2)); mix *= db(-12.3) / rms  # lands near -14 LUFS after the soft limiter
ceil = db(-3.2); mix = np.tanh(mix / ceil) * ceil
f = int(0.01 * SR); mix[:f] *= np.linspace(0, 1, f)[:, None]; mix[-int(0.05 * SR):] *= np.linspace(1, 0, int(0.05 * SR))[:, None]
sf.write(OUT / "music.wav", mus.astype(np.float32), SR)
sf.write(OUT / "sfx.wav", sfx.astype(np.float32), SR)
sf.write(OUT / "mix.wav", mix.astype(np.float32), SR, subtype="PCM_24")
print(f"mix.wav {len(mix) / SR:.3f}s peak {20 * np.log10(np.max(np.abs(mix))):.2f} dBFS")
