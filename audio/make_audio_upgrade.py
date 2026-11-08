"""Sound for "YOUR PHONE UPGRADES EVERY YEAR. DO YOU?" (no voice): an original driving score + synthesized SFX.
Every time is read from the Q table in src/episodes/upgrade/events.ts (the single source of time shared with the picture).
usage: .venv/Scripts/python.exe audio/make_audio_upgrade.py -> audio/upgrade/mix.wav (48 kHz stereo, exactly LEN frames) + stems
Score: A minor, 120 BPM (1 beat = 15 frames). Tension intro -> driving build -> silence + heartbeat at the failure ->
the DROP when he picks the pencil up again -> hush at "his phone got an upgrade" -> piano rebuild -> final hit."""
import pathlib
import re

import numpy as np
import soundfile as sf
from scipy import signal

HERE = pathlib.Path(__file__).resolve().parent
src = (HERE.parent / "src" / "episodes" / "upgrade" / "events.ts").read_text(encoding="utf-8")
i0 = src.index("export const Q = {")
QF = {k: int(v) for k, v in re.findall(r"(\w+): (\d+)", src[i0:src.index("};", i0)])}
FPS, SR = 30, 48000
S = {k: v / FPS for k, v in QF.items()}  # seconds
DUR = S["LEN"]
N = int(round(SR * DUR))
BEAT = 0.5
OUT = HERE / "upgrade"
OUT.mkdir(exist_ok=True)
rng = np.random.default_rng(2026)


def tt(n): return np.arange(n) / SR
def db(x): return 10 ** (x / 20)


def put(buf, sig, t, g=1.0, pan=0.0):
    """add a mono or stereo signal into a stereo buffer at time t (s)"""
    if sig.ndim == 1:
        l, r = np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))
        sig = np.stack([sig * l * 1.414, sig * r * 1.414], 1)
    i = int(round(t * SR))
    if i >= len(buf) or i + len(sig) <= 0:
        return
    a, b = max(0, -i), min(len(sig), len(buf) - i)
    buf[i + a:i + b] += g * sig[a:b]


def env(n, a=0.002, d=0.2, curve=4.0):
    t = tt(n)
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * curve / max(d, 1e-4))
    return e


def lp(x, fc, order=2): return signal.sosfilt(signal.butter(order, fc, "low", fs=SR, output="sos"), x)
def hp(x, fc, order=2): return signal.sosfilt(signal.butter(order, fc, "high", fs=SR, output="sos"), x)
def bp(x, lo, hi, order=2): return signal.sosfilt(signal.butter(order, [lo, hi], "band", fs=SR, output="sos"), x)
def noise(n): return rng.standard_normal(n)
def saw(f, n, ph=0.0): return 2 * ((tt(n) * f + ph) % 1) - 1


NOTE = {"A": 0, "B": 2, "C": 3, "D": 5, "E": 7, "F": 8, "G": 10}
def hz(name, octv):  # A4 = 440
    return 440 * 2 ** ((NOTE[name] + (octv - 4) * 12 - (12 if NOTE[name] >= 3 else 0)) / 12)


CHORDS = [("A", ["A", "C", "E"]), ("F", ["F", "A", "C"]), ("C", ["C", "E", "G"]), ("G", ["G", "B", "D"])]  # i VI III VII
def chord_at(t): return CHORDS[int(t // 2.0) % 4]


# ---------------------------------------------------------------- instruments
def kick(g=1.0):
    n = int(0.45 * SR); t = tt(n)
    f = 45 + 110 * np.exp(-t * 28)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.35, 5)
    s += 0.4 * hp(noise(n), 2000) * env(n, 0.0005, 0.01, 6)
    return g * s
def clap():
    n = int(0.3 * SR); x = bp(noise(n), 900, 3500)
    e = sum(env(n, 0.001, 0.012, 3) * (tt(n) >= k * 0.011) for k in range(3)) + 0.6 * env(n, 0.001, 0.18, 4)
    return x * e * 0.8 + 0.3 * np.sin(2 * np.pi * 190 * tt(n)) * env(n, 0.001, 0.05, 5)
def hat(open_=False):
    n = int((0.25 if open_ else 0.06) * SR)
    return hp(noise(n), 7000, 4) * env(n, 0.0005, 0.2 if open_ else 0.03, 5) * 0.5
def tick(f0=3200, g=1.0):
    n = int(0.03 * SR)
    return g * (0.6 * hp(noise(n), 3000) * env(n, 0.0003, 0.004, 5) + 0.5 * np.sin(2 * np.pi * f0 * tt(n)) * env(n, 0.0005, 0.01, 6))
def bass_note(f, dur):
    n = int(dur * SR)
    x = 0.6 * saw(f, n) + 0.5 * np.sin(2 * np.pi * f * tt(n))
    return lp(x, 380) * env(n, 0.004, dur * 0.9, 2.5)
def pluck(f, dur, bright):
    n = int(dur * SR)
    x = 0.5 * saw(f, n) + 0.3 * np.sign(np.sin(2 * np.pi * f * tt(n)))
    return lp(x, 300 + 3500 * bright) * env(n, 0.002, 0.16, 5)
def pad(freqs, dur, bright=0.4):
    n = int(dur * SR); out = np.zeros((n, 2))
    for f in freqs:
        for k, det in enumerate((-0.07, 0.0, 0.08)):
            x = saw(f * 2 ** (det / 12), n, ph=rng.random())
            out[:, k % 2] += x
    out = np.stack([lp(out[:, 0], 500 + 2200 * bright), lp(out[:, 1], 500 + 2200 * bright)], 1)
    a = np.minimum(1, tt(n) / 0.25) * np.minimum(1, (dur - tt(n)) / 0.3)
    return out * a[:, None] / (len(freqs) * 2.5)
def riser(dur, g=1.0):
    n = int(dur * SR); t = tt(n) / dur
    x = noise(n)
    # sweep a band-pass up by filtering in chunks
    y = np.zeros(n); step = int(0.02 * SR)
    for i in range(0, n, step):
        c = 400 + 7000 * (i / n) ** 2
        y[i:i + step] = bp(x[i:i + step], c, min(c * 1.8, 20000))
    tone = np.sin(2 * np.pi * np.cumsum(200 + 900 * t ** 2) / SR) * 0.25
    return g * (y * 0.6 + tone) * t ** 2
def boom(g=1.0):
    n = int(2.2 * SR); t = tt(n)
    s = np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-t * 6)) / SR) * env(n, 0.002, 1.6, 3)
    s += 0.5 * lp(noise(n), 900) * env(n, 0.001, 0.25, 4)
    return g * s
def crash(g=1.0):
    n = int(2.0 * SR)
    return g * hp(noise(n), 4500) * env(n, 0.001, 1.6, 3) * 0.45
def heartbeat():
    n = int(0.5 * SR); out = np.zeros(n)
    for k, (d, a) in enumerate(((0.0, 1.0), (0.2, 0.7))):
        m = int(0.18 * SR); s = np.sin(2 * np.pi * 52 * tt(m)) * env(m, 0.005, 0.12, 5) * a
        i = int(d * SR); out[i:i + m] += s
    return out
def piano(f, dur=1.4):
    n = int(dur * SR); t = tt(n)
    x = sum(np.sin(2 * np.pi * f * h * t) * (0.6 / h) * np.exp(-t * (2.5 + h)) for h in (1, 2, 3, 4))
    return x * np.minimum(1, t / 0.003)


# ---------------------------------------------------------------- score
mus = np.zeros((N, 2))
def beats(t0, t1, step=BEAT):
    k = np.ceil(t0 / step - 1e-6)
    out = []
    while k * step < t1 - 1e-6:
        out.append(k * step); k += 1
    return out

SIL0, SIL1 = S["SILENCE"], S["DROP"]
DROP, HUSH, REB, HIT = S["DROP"], S["HUSH"], S["DAY1"], S["HIT"]

# pads all along (except the silence), brighter in the drop
for b0 in np.arange(0, DUR, 2.0):
    if SIL0 <= b0 < SIL1 - 1e-6:
        continue
    root, notes = chord_at(b0)
    seg = min(2.0, DUR - b0)
    if b0 < SIL0 < b0 + seg: seg = SIL0 - b0
    bright = 0.85 if DROP <= b0 < HUSH else 0.25 if HUSH <= b0 < REB else 0.45
    g = 0.55 if DROP <= b0 < HUSH else 0.3 if b0 < S["BUILD"] or HUSH <= b0 < HIT else 0.42
    put(mus, pad([hz(n, 3) for n in notes] + [hz(notes[0], 4)], seg, bright), b0, g)

# clock tick on every beat in the intro and the hush
for b in beats(0, S["BUILD"]) + beats(HUSH, REB):
    put(mus, tick(2600 if int(b / BEAT) % 2 else 3300), b, 0.5, pan=0.3)

# sub pulse in the intro (8ths), ostinato fades in during the maths
for b in beats(0, S["BUILD"], BEAT / 2):
    put(mus, bass_note(hz(chord_at(b)[0], 1), 0.22), b, 0.35)
for b in beats(S["MATH"], SIL0, BEAT / 4):
    k = int(round(b / (BEAT / 4)))
    root, notes = chord_at(b)
    f = hz(notes[k % 3], 4) * (2 if k % 8 == 7 else 1)
    bright = min(1, (b - S["MATH"]) / 10)
    put(mus, pluck(f, 0.2, bright), b, 0.18 + 0.1 * bright, pan=0.25 if k % 2 else -0.25)
for b in beats(S["GRID0"] / 1, S["BUILD"], BEAT / 4):
    put(mus, hat(), b, 0.25 + 0.4 * (b - S["GRID0"]) / (S["BUILD"] - S["GRID0"]), pan=0.4)
put(mus, riser(S["BUILD"] - S["DAYS"] + 0.4, 0.5), S["DAYS"] - 0.4)
put(mus, boom(0.7), S["DAYS"])

# the build: four on the floor, bass 8ths, hats, claps from the late-night shot
def groove(t0, t1, clap_from, hats16=False, g=1.0):
    for b in beats(t0, t1):
        put(mus, kick(1.0 * g), b)
        if b >= clap_from and int(round(b / BEAT)) % 2 == 1:
            put(mus, clap(), b, 0.55 * g)
    for b in beats(t0, t1, BEAT / 2):
        put(mus, bass_note(hz(chord_at(b)[0], 2), 0.24), b, 0.5 * g)
        put(mus, hat(open_=(int(round(b / (BEAT / 2))) % 2 == 1)), b + BEAT / 4 if not hats16 else b, 0.3 * g, pan=-0.3)
    if hats16:
        for b in beats(t0, t1, BEAT / 4):
            put(mus, hat(), b, 0.18 * g, pan=0.35)
groove(S["BUILD"], SIL0, clap_from=S["LATE"], hats16=False)
# snare fill into the failure
for k, b in enumerate(np.arange(S["FAIL"] - 1.0, S["FAIL"], BEAT / 4)):
    put(mus, clap(), b, 0.25 + 0.05 * k)
put(mus, crash(0.6), S["FAIL"])

# the silence: only a heartbeat and a low drone, then a riser + accelerating roll into the drop
for b in np.arange(SIL0 + 0.1, SIL1 - 0.6, 0.85):
    put(mus, heartbeat(), b, 0.9)
drone_n = int((SIL1 - SIL0) * SR)
put(mus, lp(saw(hz("A", 1), drone_n), 160) * np.minimum(1, tt(drone_n) / 0.4) * 0.25, SIL0)
put(mus, riser(SIL1 - S["LOOKUP"], 0.9), S["LOOKUP"])
roll_t = S["LOOKUP"] + 0.4
gap = 0.18
while roll_t < SIL1 - 0.03:
    put(mus, clap(), roll_t, 0.15 + 0.5 * (roll_t - S["LOOKUP"]) / (SIL1 - S["LOOKUP"]))
    roll_t += gap; gap = max(0.04, gap * 0.86)

# THE DROP
put(mus, boom(1.0), DROP); put(mus, crash(0.9), DROP)
groove(DROP, HUSH, clap_from=DROP, hats16=True, g=1.1)
for b in beats(DROP, HUSH, BEAT / 4):
    k = int(round(b / (BEAT / 4)))
    root, notes = chord_at(b)
    put(mus, pluck(hz(notes[k % 3], 5) if k % 4 else hz(notes[0], 4), 0.18, 1.0), b, 0.22, pan=0.35 if k % 2 else -0.35)
for b in np.arange(DROP, HUSH, 4.0):
    put(mus, crash(0.5), b)
put(mus, riser(1.0, 0.4), HUSH - 1.0)

# hush: a low sub note under the ticks (already placed) and the pad
put(mus, bass_note(hz("A", 1), HUSH - HUSH + (REB - HUSH)) * 0.4, HUSH)

# rebuild: piano arpeggio climbing, kick returns on half notes then quarters, riser into the hit
arp = ["A", "C", "E", "A", "C", "E", "G", "B", "D", "G", "B", "D"]
for k, b in enumerate(beats(REB, HIT, BEAT / 2)):
    n = arp[k % len(arp)]
    put(mus, piano(hz(n, 4 + (k // 6) % 2)), b, 0.35 + 0.02 * k, pan=0.2 if k % 2 else -0.2)
for b in beats(REB + 1.0, HIT, BEAT * 2):
    put(mus, kick(0.7), b)
for b in beats(HIT - 1.0, HIT, BEAT / 2):
    put(mus, kick(0.9), b)
put(mus, riser(1.5, 0.7), HIT - 1.5)

# the final hit and ring-out
put(mus, boom(1.1), HIT); put(mus, crash(1.0), HIT)
put(mus, pad([hz("A", 2), hz("A", 3), hz("C", 4), hz("E", 4)], DUR - HIT, 0.7), HIT, 0.9)
for b in beats(HIT + 1.5, DUR):
    put(mus, tick(3000), b, 0.35)

# ---------------------------------------------------------------- sfx
sfx = np.zeros((N, 2))
def ding(f1=1318.5, f2=1760, g=1.0):
    n = int(0.9 * SR); t = tt(n)
    x = np.sin(2 * np.pi * f1 * t) * env(n, 0.002, 0.5, 4) + 0.7 * np.sin(2 * np.pi * f2 * t) * env(n, 0.002, 0.5, 4) * (t > 0.09)
    return g * x * 0.5
def swipe(dur=0.18, up=True):
    n = int(dur * SR); x = noise(n); y = np.zeros(n); step = int(0.01 * SR)
    for i in range(0, n, step):
        c = 1500 + 5000 * ((i / n) if up else 1 - i / n)
        y[i:i + step] = bp(x[i:i + step], c, c * 1.6)
    return y * np.sin(np.pi * tt(n) / dur) * 0.6
def whoosh(dur=0.35, g=1.0):
    n = int(dur * SR); x = lp(noise(n), 1800)
    return g * x * np.sin(np.pi * tt(n) / dur) ** 2 * 0.6
def clank():
    n = int(0.35 * SR); t = tt(n)
    return sum(np.sin(2 * np.pi * f * t) for f in (1210, 1870, 2930)) * env(n, 0.001, 0.2, 5) * 0.2 + 0.2 * hp(noise(n), 3000) * env(n, 0.001, 0.02, 5)
def click(): n = int(0.03 * SR); return hp(noise(n), 1500) * env(n, 0.0005, 0.008, 5) * 0.8
def flip():
    n = int(0.22 * SR); return bp(noise(n), 800, 5000) * np.sin(np.pi * tt(n) / 0.22) ** 0.5 * env(n, 0.01, 0.2, 2) * 0.5
def scratch(dur):
    n = int(dur * SR); x = bp(noise(n), 2500, 7000)
    am = 0.5 + 0.5 * np.sin(2 * np.pi * 7 * tt(n)) ** 2
    return x * am * 0.12
def rip():
    n = int(0.45 * SR); x = bp(noise(n), 600, 6000)
    grains = (rng.random(n) < 0.02).astype(float); grains = lp(grains, 3000)
    return x * (0.3 + 3 * grains) * np.sin(np.pi * tt(n) / 0.45) * 0.4
def crumple():
    n = int(0.4 * SR); g = lp((rng.random(n) < 0.01).astype(float) * noise(n), 4000)
    return hp(g, 600) * 3 * np.sin(np.pi * tt(n) / 0.4)
def thud(g=1.0):
    n = int(0.3 * SR); t = tt(n)
    return g * (np.sin(2 * np.pi * np.cumsum(70 + 80 * np.exp(-t * 30)) / SR) * env(n, 0.001, 0.15, 5) + 0.3 * lp(noise(n), 600) * env(n, 0.001, 0.03, 5))
def tink(f):
    n = int(0.6 * SR); t = tt(n)
    return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t)) * env(n, 0.001, 0.35, 5) * 0.35

put(sfx, ding(), S["NOTIF"] + 0.02, 0.8)
put(sfx, swipe(0.22), S["SWIPE"], 1.0, pan=0.4)
for k in range(30):
    put(sfx, tick(2400 + 40 * k, 0.6), S["GRID0"] + k * (S["GRID1"] - S["GRID0"]) / 30, pan=-0.5 + k / 30)
put(sfx, thud(0.8), S["DAYS"])
put(sfx, whoosh(0.3), S["BUILD"] - 0.05); put(sfx, whoosh(0.35, 0.8), S["TILT"]); put(sfx, whoosh(0.45, 0.8), S["WIDE"])
for k in range(10):
    put(sfx, swipe(0.12, k % 2 == 0), S["BUILD"] + 0.6 + k * 0.33, 0.35, pan=-0.3)
t = S["SPIN0"]; step = 0.12
while t < S["SPIN1"]:
    put(sfx, tick(3600, 0.7), t, pan=-0.2); t += step; step = max(0.035, step * 0.9)
for k in range(10):
    put(sfx, swipe(0.1, k % 2 == 1), S["LATE"] + k * (S["BOOK"] - S["LATE"]) / 10, 0.45, pan=-0.3)
put(sfx, clank(), S["CAN1"], pan=0.2); put(sfx, clank(), S["CAN2"], pan=0.25)
put(sfx, click(), S["LAMPOFF"], 0.9)
put(sfx, whoosh(0.3), S["BOOK"] - 0.1)
put(sfx, scratch(S["FLIP1"] - S["BOOK"]), S["BOOK"])
for k in ("FLIP1", "FLIP2", "FLIP3"):
    put(sfx, flip(), S[k], 0.9)
put(sfx, scratch(S["TEAR"] - S["FAIL"]) * 1.6, S["FAIL"])
put(sfx, rip(), S["TEAR"], 1.0); put(sfx, crumple(), S["BALL"] - 0.1, 0.9); put(sfx, thud(0.6), S["THUD"])
put(sfx, scratch(S["YEAR"] - S["PENCIL"]) * 1.5, S["PENCIL"])
put(sfx, whoosh(0.4), S["YEAR"] - 0.1)
for k, name in enumerate(("ART1", "ART2", "ART3", "ART4", "ART5")):
    put(sfx, tink(880 * 2 ** (k * 2 / 12)), S[name], 0.9, pan=-0.3 + 0.15 * k)
put(sfx, whoosh(0.4), S["DOWN"]); put(sfx, whoosh(0.35), S["MAIL"] - 0.15)
put(sfx, ding(1046.5, 1568, 1.0), S["POP"]); put(sfx, whoosh(0.3, 0.8), S["ZOOM"])
put(sfx, whoosh(0.4, 0.6), S["UPG"] - 0.1)
for k in range(6):
    put(sfx, swipe(0.12), S["UPG"] + 0.5 + k * 0.4, 0.3, pan=0.3)
put(sfx, thud(1.0), S["FACEDOWN"]); put(sfx, flip(), S["OPEN"], 1.0); put(sfx, scratch(S["LINE1"] - S["LINE0"]) * 2.2, S["LINE0"])
put(sfx, ding(), S["LOOP"] + 0.05, 0.8)

# ---------------------------------------------------------------- mix
def norm_peak(x, p=0.9): m = np.max(np.abs(x)); return x * (p / m) if m > 0 else x
mus = norm_peak(mus, 0.8)
sfx = norm_peak(sfx, 0.8)
mix = mus * db(-1.5) + sfx * db(-4)
# loudness to about -14 LUFS (pyloudnorm when available, else RMS), then a soft limiter at -1 dBFS
try:
    import pyloudnorm as pyln
    meter = pyln.Meter(SR); lufs = meter.integrated_loudness(mix)
    mix = mix * db(-14 - lufs)
except Exception:
    rms = np.sqrt(np.mean(mix ** 2)); mix = mix * (db(-16) / rms)
ceil = db(-3.2)  # leaves room for inter-sample peaks (true peak stays under -1 dBTP)
mix = np.tanh(mix / ceil) * ceil
fade = int(0.02 * SR); mix[:fade] *= np.linspace(0, 1, fade)[:, None]
sf.write(OUT / "music.wav", mus.astype(np.float32), SR)
sf.write(OUT / "sfx.wav", sfx.astype(np.float32), SR)
sf.write(OUT / "mix.wav", mix.astype(np.float32), SR, subtype="PCM_24")
print(f"mix.wav {len(mix) / SR:.3f}s  peak {20 * np.log10(np.max(np.abs(mix))):.2f} dBFS")
