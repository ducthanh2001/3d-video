// ep001 v4 "How to prove you're innocent in medieval England": shot table, cameras, lens and kicks, timed to voice/ep001/words.json
// (54.3 s of voice, 30 fps). Frame numbers = word onsets x 30, minus 2-3 f so the picture reacts just before the word.
// Internal shot ids (18) are the script's 16 scenes, with scenes 5 / 11 / 12 cut into the places they visit.
import type { LightName } from "./lights";
export const FPS = 30;
export const TOTAL = 1672;
export const D0 = 0; // the ground is y = 0 in this episode
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 4;
/** x of the king's court-room, the church court and the stable (see sets.ts) */
export const INT = 1000, CHURCH = 1100, STABLE = 1200;

export type Light = LightName;
export type ShotDef = { id: number; a: number; b: number; light: Light; tau: (t: number) => number };
const tau = (t: number) => t;
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 150, light: "day", tau }, // accused, the crowd, three options
  { id: 2, a: 150, b: 273, light: "day", tau }, // option 1: the hot iron, three steps, the bandage
  { id: 3, a: 273, b: 378, light: "day", tau }, // three days: calendar, healed, infected
  { id: 4, a: 378, b: 448, light: "day", tau }, // not healing: guilty
  { id: 5, a: 448, b: 488, light: "day", tau }, // "Fine."
  { id: 6, a: 488, b: 650, light: "day", tau }, // option 2: the arena, the Normans, no witnesses, no evidence
  { id: 7, a: 650, b: 775, light: "day", tau }, // Greg and the giant
  { id: 8, a: 775, b: 822, light: "day", tau }, // four seconds
  { id: 9, a: 822, b: 930, light: "day", tau }, // two down
  { id: 10, a: 930, b: 1020, light: "interior", tau }, // option 3: the book
  { id: 11, a: 1020, b: 1190, light: "interior", tau }, // church court, king's court, the gavel
  { id: 12, a: 1190, b: 1240, light: "interior", tau }, // the farmer in the stable
  { id: 13, a: 1240, b: 1272, light: "day", tau }, // the rope on the far frame
  { id: 14, a: 1272, b: 1314, light: "interior", tau }, // the neck verse
  { id: 15, a: 1314, b: 1387, light: "interior", tau }, // Milo opens the book and reads
  { id: 16, a: 1387, b: 1430, light: "interior", tau }, // verdict: innocent
  { id: 17, a: 1430, b: 1548, light: "interior", tau }, // the twist
  { id: 18, a: 1548, b: TOTAL, light: "day", tau }, // back to the opening frame
];
export const XFADE: Record<number, number> = { 6: 6, 10: 10, 18: 10 };
export const FLASH_AT = 146;

export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (const s of SHOTS) {
    const x = XFADE[s.id];
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }];
  }
  return [{ id: shotAt(f).id, alpha: 1 }];
};

// ---------------- Milo's three hopping steps with the iron (shot 2) ----------------
export const WALK0 = 203, STEP_F = 10, STEP_LEN = 0.7, MILO2_X0 = -0.2;
export const stepsDone = (f: number) => Math.max(0, Math.min(3, (f - WALK0) / STEP_F));
export const miloX2 = (f: number) => MILO2_X0 + STEP_LEN * (Math.floor(stepsDone(f)) + smooth(stepsDone(f) % 1));
export const miloHop2 = (f: number) => { const s = stepsDone(f); return s <= 0 || s >= 3 ? 0 : 0.26 * Math.sin(Math.PI * Math.min(1, (s % 1) / 0.8)); };

// ---------------- camera ----------------
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Shot = Partial<Cam> & { pos: V3; look: V3 };
type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const mix = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3, look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});
const full = (c: Shot): Cam => ({ fov: 40, roll: 0, ...c });
const run = (keys: Key[], f: number) => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : mix(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};
const T = (f: number) => f / FPS;
const pushK = (f: number, f0: number, rate: number) => Math.exp(-rate * Math.max(0, f - f0));
const dolly = (pos: V3, look: V3, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest });

// 1 and 18 share the opening frame: Milo bound on the green, a packed crowd round him, 1 - 2 - 3 over his head
const S1a = (f: number) => dolly([0.15, 1.5, 4.6], [0, 1.35, 0], pushK(f, 0, 0.0016), { fov: 42 });
const S1b = (f: number) => dolly([0.1, 1.5, 3.7], [0, 1.4, 0], pushK(f, 90, 0.0016), { fov: 40 });
const S18a = (f: number) => dolly([0.15, 1.5, 4.6], [0, 1.35, 0], pushK(f, 1548, 0.0016), { fov: 42 });
// 2: priest and Milo, follow the three steps, then the bandage
const S2a = (f: number) => dolly([-0.4, 1.4, 5.2], [-0.4, 1.25, 0.4], pushK(f, 150, 0.0016), { fov: 42 });
const S2b = (f: number) => { const x = miloX2(f); return { pos: [x + 0.5, 1.4, 5.0] as V3, look: [x + 0.2, 1.25, 0.5] as V3, fov: 42 }; };
const S2c = (f: number) => dolly([2.1, 1.4, 4.2], [2.1, 1.2, 0.6], pushK(f, 236, 0.0018), { fov: 38 });
// 3: calendar, then the hand card
const S3a = (f: number) => dolly([0, 1.5, 3.2], [0, 1.45, 0], pushK(f, 273, 0.0018), { fov: 40 });
const S3b = (f: number) => dolly([0.1, 1.65, 4.4], [0.0, 1.6, 0.2], pushK(f, 301, 0.0016), { fov: 40 });
const S3c = (f: number) => dolly([0.1, 1.65, 4.4], [0.0, 1.6, 0.2], pushK(f, 338, 0.0016), { fov: 40, roll: 0.03 });
const S4a = (f: number) => dolly([0.1, 1.65, 4.4], [0.0, 1.6, 0.2], pushK(f, 378, 0.0016), { fov: 40 });
const S5a = (f: number) => dolly([0.2, 1.4, 4.0], [0, 1.3, 0.4], pushK(f, 448, 0.002), { fov: 38 });
// 6: the arena
const S6a = (f: number) => dolly([0.0, 2.2, 8.8], [-0.2, 1.2, -0.3], pushK(f, 488, 0.0014), { fov: 44 });
const S6b = (f: number) => dolly([0.0, 1.6, 6.6], [-0.8, 1.5, -0.2], pushK(f, 565, 0.0014), { fov: 44 });
// 7: Milo points at Greg, Greg walks in, the giant, Milo shocked
const S7a = (f: number) => dolly([-0.8, 1.5, 5.0], [-0.6, 1.2, 0.8], pushK(f, 650, 0.0016), { fov: 42 });
const S7b = (f: number) => dolly([0.2, 1.4, 4.8], [0.1, 1.0, 0.5], pushK(f, 700, 0.0016), { fov: 42 });
const S7c = (f: number) => dolly([1.0, 1.9, 7.6], [1.2, 1.9, 0.3], pushK(f, 731, 0.0010), { fov: 50 });
const S7d = (f: number) => dolly([-0.8, 1.5, 2.8], [-1.3, 1.35, 1.2], pushK(f, 756, 0.002), { fov: 34 });
const S8a = (f: number) => dolly([0.5, 1.9, 7.4], [0.7, 1.9, 0.3], pushK(f, 775, 0.0010), { fov: 50 });
const S9a = (f: number) => dolly([0.2, 0.9, 2.7], [0, 0.7, 0.3], pushK(f, 822, 0.002), { fov: 38 });
// 10-17: the court-room, the church court, the stable
const S10a = (f: number) => dolly([INT + 0.4, 1.5, 5.0], [INT, 1.45, -0.8], pushK(f, 930, 0.0015), { fov: 44 });
const S10b = (f: number) => dolly([INT + 0.1, 1.35, 2.7], [INT, 1.25, 0.6], pushK(f, 975, 0.002), { fov: 36 });
const S11a = (f: number) => dolly([CHURCH + 0.3, 1.5, 4.6], [CHURCH, 1.3, -0.8], pushK(f, 1020, 0.0015), { fov: 42 });
const S11b = (f: number) => dolly([INT + 0.4, 1.5, 5.0], [INT, 1.5, -1.0], pushK(f, 1066, 0.0015), { fov: 44 });
const S11c = (f: number) => dolly([INT + 0.6, 1.8, 4.8], [INT + 0.1, 1.7, -1.8], pushK(f, 1111, 0.0014), { fov: 38 });
const S12a = (f: number) => dolly([STABLE + 0.3, 1.4, 3.6], [STABLE, 1.2, 0.6], pushK(f, 1190, 0.0018), { fov: 38 });
export const GALLOWS: [number, number] = [-26, -4];
const GC: [number, number] = [-25.5, 12], GA0 = Math.atan2(GALLOWS[0] - GC[0], -(GALLOWS[1] - GC[1]));
const gl = (d: number): V3 => [GC[0] + 20 * Math.sin(GA0 + d), 3.0, GC[1] - 20 * Math.cos(GA0 + d)];
const S13a = (_f: number) => ({ pos: [GC[0], 1.5, GC[1]] as V3, look: gl(0.45), fov: 40 });
const S13b = (_f: number) => ({ pos: [GC[0], 1.5, GC[1]] as V3, look: gl(-0.45), fov: 40 });
const S14a = (f: number) => dolly([STABLE + 0.1, 1.4, 2.4], [STABLE, 1.35, 0.5], pushK(f, 1272, 0.002), { fov: 32 });
const S15a = (f: number) => dolly([INT, 1.45, 2.6], [INT, 1.4, 0.2], pushK(f, 1314, 0.0018), { fov: 32 });
const S16a = (f: number) => dolly([INT + 0.2, 1.6, 4.8], [INT, 1.6, -0.6], pushK(f, 1387, 0.0014), { fov: 42 });
const S17a = (f: number) => dolly([INT + 0.05, 1.45, 2.3], [INT, 1.45, 0.4], pushK(f, 1430, 0.0016), { fov: 32 });

const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: S1a }, { f: 90, dur: 50, s: S1b }],
  2: [{ f: 150, s: S2a }, { f: 196, dur: 14, s: S2b }, { f: 236, dur: 16, s: S2c }],
  3: [{ f: 273, s: S3a }, { f: 301, cut: true, s: S3b }, { f: 338, cut: true, s: S3c }],
  4: [{ f: 378, s: S4a }],
  5: [{ f: 448, s: S5a }],
  6: [{ f: 488, s: S6a }, { f: 565, dur: 24, s: S6b }],
  7: [{ f: 650, s: S7a }, { f: 692, dur: 16, s: S7b }, { f: 731, cut: true, s: S7c }, { f: 756, cut: true, s: S7d }],
  8: [{ f: 775, s: S8a }],
  9: [{ f: 822, s: S9a }],
  10: [{ f: 930, s: S10a }, { f: 975, cut: true, s: S10b }],
  11: [{ f: 1020, s: S11a }, { f: 1066, cut: true, s: S11b }, { f: 1111, cut: true, s: S11c }],
  12: [{ f: 1190, s: S12a }],
  13: [{ f: 1240, s: S13a }, { f: 1241, dur: 30, s: S13b }],
  14: [{ f: 1272, s: S14a }],
  15: [{ f: 1314, s: S15a }],
  16: [{ f: 1387, s: S16a }],
  17: [{ f: 1430, s: S17a }],
  18: [{ f: 1548, s: S18a }],
};

// impact kicks (seconds, strength): the stamps, three hot steps, the giant's steps, Greg's launch, the gavel
const KICKS: [number, number][] = [[0.4, 1], [7.1, 0.4], [7.43, 0.4], [7.77, 0.4], [14.27, 0.9], [24.5, 0.4], [24.85, 0.5], [25.2, 0.6], [26.77, 1], [46.33, 0.8], [46.5, 0.6]];
export const kickAt = (t: number) => {
  let a = 0;
  for (const [t0, g] of KICKS) {
    const n = Math.floor((t - t0) * FPS + 1e-6);
    if (n >= 0 && n < 7) a += g * (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5;
  }
  return a;
};
export const camAt = (id: number, f: number): Cam => {
  const c = run(CAMS[id], f), a = kickAt(T(f));
  if (!a) return c;
  const d: V3 = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]];
  const L = Math.hypot(...d), h = Math.hypot(d[0], d[2]) || 1;
  const m = (3 / 640) * Math.tan((c.fov * Math.PI) / 360) * L * a;
  return { ...c, look: [c.look[0] - (d[2] / h) * m, c.look[1] + 0.6 * m, c.look[2] + (d[0] / h) * m], roll: c.roll + a * 0.004 };
};

// ---------------- lens ----------------
export type Dof = { f: number; dur?: number; cInf: number; focus?: (f: number) => V3 };
export const DOF: Dof[] = [
  { f: 0, cInf: 6 }, { f: 150, cInf: 7 }, { f: 273, cInf: 8 }, { f: 301, cInf: 14 }, { f: 378, cInf: 10 }, { f: 448, cInf: 8 }, { f: 488, cInf: 3 }, { f: 565, cInf: 6 },
  { f: 650, cInf: 6 }, { f: 731, cInf: 5 }, { f: 756, cInf: 12 }, { f: 775, cInf: 5 }, { f: 822, cInf: 12 }, { f: 930, cInf: 5 }, { f: 975, cInf: 10 }, { f: 1020, cInf: 5 },
  { f: 1111, cInf: 8 }, { f: 1190, cInf: 8 }, { f: 1240, cInf: 4 }, { f: 1272, cInf: 14 }, { f: 1314, cInf: 14 }, { f: 1387, cInf: 7 }, { f: 1430, cInf: 14 }, { f: 1548, cInf: 6 },
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};

/** near framing objects (none in this episode) */
export type Fg = { a: number; b: number; kit: string; pos: V3; s?: number; yaw?: number };
export const FOREGROUND: Fg[] = [];
