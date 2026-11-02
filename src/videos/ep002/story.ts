// ep002 "Medieval Trials: Real or Myth?": shot table, cameras, lens and kicks, timed to voice/ep002/words.json (30 fps).
// Every cue lives in Q (frames = word onset x 30, minus 2 f so the picture reacts just before the word). Shot ids 1-18 are
// the script's 18 scenes; id 19 is the loop tail (the opening frame held for 15 frames).
import type { LightName } from "../ep001/lights";
export const FPS = 30;
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 4;
/** x of each place (sets.ts): Milo's office, the church court in France, the synod hall in Rome, the square in Rome */
export const OF = 2000, FR = 2100, RO = 2200, PZ = 2300;

/** cue frames from words.json */
export const Q = {
  L1: 0, first: 47, second: 98, flash: 136,
  L2: 147, summoned: 202, showed: 227, realQ1: 248,
  L3: 288, argument: 330, scared: 366,
  L4: 404, L5: 466, extra: 489, round: 522,
  L6: 566, real1: 571, L7: 606, dead7: 673,
  L8: 700, rome: 737, nine: 800, realQ2: 822,
  L9: 850, dug: 878, sat: 899, trial9: 942,
  L10: 970, defend: 1018, L11: 1054, guilty: 1073,
  L12: 1108, wait: 1137,
  L13: 1172, prison: 1238, L14: 1264, canceled: 1281,
  L15: 1332, banned: 1373, L16: 1428, real2: 1431,
  L17: 1465, won: 1512, history: 1520,
  L18: 1558, rooster: 1583, egg: 1613, would: 1631,
  END: 1700,
};
export const TOTAL = Q.END;
export const LOOP = TOTAL - 15;

export type Light = LightName;
export type ShotDef = { id: number; a: number; b: number; light: Light };
export const SHOTS: ShotDef[] = [
  { id: 1, a: Q.L1, b: Q.L2, light: "interior" }, // the office: two folders
  { id: 2, a: Q.L2, b: Q.L3, light: "day" }, // church court, France: summons, empty bench, rats behind the door
  { id: 3, a: Q.L3, b: Q.L4, light: "day" }, // Milo's argument: SCARED
  { id: 4, a: Q.L4, b: Q.L5, light: "day" }, // the judge thinks it over
  { id: 5, a: Q.L5, b: Q.L6, light: "day" }, // extra time: Milo wins round one
  { id: 6, a: Q.L6, b: Q.L7, light: "day" }, // REAL
  { id: 7, a: Q.L7, b: Q.L8, light: "interior" }, // back in the office: the second folder
  { id: 8, a: Q.L8, b: Q.L9, light: "interior" }, // Rome, 897: the dark hall, the empty throne
  { id: 9, a: Q.L9, b: Q.L10, light: "interior" }, // Stephen, the bearers, the throne
  { id: 10, a: Q.L10, b: Q.L11, light: "interior" }, // Milo the deacon at the lectern
  { id: 11, a: Q.L11, b: Q.L12, light: "interior" }, // GUILTY
  { id: 12, a: Q.L12, b: Q.L13, light: "interior" }, // but wait
  { id: 13, a: Q.L13, b: Q.L14, light: "day" }, // the square: crowd, prison gate
  { id: 14, a: Q.L14, b: Q.L15, light: "day" }, // the new pope tears the verdict
  { id: 15, a: Q.L15, b: Q.L16, light: "day" }, // 898: no more corpse trials
  { id: 16, a: Q.L16, b: Q.L17, light: "day" }, // REAL
  { id: 17, a: Q.L17, b: Q.L18, light: "interior" }, // won in history
  { id: 18, a: Q.L18, b: LOOP, light: "interior" }, // next case
  { id: 19, a: LOOP, b: TOTAL, light: "interior" }, // the opening frame again
  { id: 20, a: TOTAL + 100, b: TOTAL + 101, light: "interior" }, // thumbnail only (Thumb.tsx), never on the timeline
];
/** crossfades (frames) into these shots: the place changes */
export const XFADE: Record<number, number> = { 2: 10, 7: 10, 8: 10, 13: 10, 17: 10, 19: 8 };
export const FLASH_AT = Q.flash;

export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (const s of SHOTS) {
    const x = XFADE[s.id];
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }];
  }
  return [{ id: shotAt(f).id, alpha: 1 }];
};

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

// 1 / 19: Milo behind his desk, two folders; slow push to his face
const S1a = (f: number) => dolly([OF + 0.15, 1.5, 2.3], [OF, 1.08, -0.95], pushK(f, 0, 0.0022), { fov: 40 });
// 2: the church court in France
const S2a = (f: number) => dolly([FR + 0.3, 2.4, 7.4], [FR + 0.3, 1.5, -2.4], pushK(f, Q.L2, 0.0016), { fov: 52 });
const S2b = (f: number) => dolly([FR + 2.0, 1.45, -1.7], [FR + 2.95, 0.95, -4.2], pushK(f, Q.summoned, 0.002), { fov: 42 });
// 3: Milo up with the paper; the rats; Milo points
const S3a = (f: number) => dolly([FR - 1.1, 1.5, 1.7], [FR - 1.5, 1.3, -0.9], pushK(f, Q.L3, 0.002), { fov: 38 });
const S3b = (f: number) => dolly([FR + 2.35, 0.9, -1.8], [FR + 2.95, 0.62, -3.9], pushK(f, Q.argument, 0.002), { fov: 38 });
const S3c = (f: number) => dolly([FR - 0.75, 1.5, 1.3], [FR - 1.25, 1.3, -0.9], pushK(f, Q.scared + 18, 0.002), { fov: 40 });
// 4 / 5: the judge; then Milo jumps
const S4a = (f: number) => dolly([FR + 0.15, 2.5, -0.4], [FR + 0.1, 2.45, -3.2], pushK(f, Q.L4, 0.0024), { fov: 38 });
const S5a = (f: number) => dolly([FR + 0.25, 2.45, -0.2], [FR + 0.15, 2.35, -3.2], pushK(f, Q.L5, 0.002), { fov: 40 });
const S5b = (f: number) => dolly([FR - 1.0, 1.45, 3.2], [FR - 1.2, 1.2, -0.4], pushK(f, Q.round, 0.002), { fov: 44 });
// 6: the whole court
const S6a = (f: number) => dolly([FR - 0.6, 2.5, 6.2], [FR - 0.6, 1.3, -1.6], pushK(f, Q.L6, 0.002), { fov: 46 });
// 7: office, the second folder
const S7a = (f: number) => dolly([OF + 0.1, 1.38, 1.7], [OF + 0.05, 1.02, -0.8], pushK(f, Q.L7, 0.002), { fov: 38 });
const S7b = (f: number) => dolly([OF + 0.18, 1.3, 1.3], [OF + 0.15, 1.1, -0.8], pushK(f, Q.dead7 - 6, 0.0024), { fov: 38 });
// 8-12: the synod hall in Rome
const S8a = (f: number) => dolly([RO, 2.1, 8.0], [RO, 1.9, -3.8], pushK(f, Q.L8, 0.0016), { fov: 44 });
const S9a = (f: number) => dolly([RO - 0.9, 1.95, -0.2], [RO - 1.45, 1.6, -3.0], pushK(f, Q.L9, 0.002), { fov: 38 });
const S9b = (f: number) => dolly([RO - 0.9, 2.3, 3.6], [RO + 0.2, 1.4, -3.4], pushK(f, Q.dug + 10, 0.0016), { fov: 46 });
const S9c = (f: number) => dolly([RO + 0.2, 1.85, -1.0], [RO, 1.75, -4.6], pushK(f, Q.trial9 - 6, 0.002), { fov: 38 });
const S10a = (f: number) => dolly([RO + 1.2, 1.6, 2.4], [RO + 0.8, 1.35, -2.4], pushK(f, Q.L10, 0.0016), { fov: 42 });
const S10b = (f: number) => dolly([RO + 1.34, 1.62, 1.0], [RO + 1.3, 1.6, -1.15], pushK(f, Q.defend - 4, 0.002), { fov: 40 });
const S11a = (f: number) => dolly([RO - 1.0, 2.0, -0.2], [RO - 1.4, 1.85, -3.0], pushK(f, Q.L11, 0.002), { fov: 40 });
const S12a = (f: number) => dolly([RO + 1.3, 1.5, 0.95], [RO + 1.3, 1.45, -1.15], pushK(f, Q.L12, 0.0024), { fov: 38 });
// 13-16: the square in Rome
const S13a = (f: number) => dolly([PZ - 0.2, 1.9, 6.4], [PZ - 1.1, 2.1, -6.0], pushK(f, Q.L13, 0.0016), { fov: 42 });
const S13b = (f: number) => dolly([PZ - 1.6, 1.7, -3.4], [PZ - 1.6, 1.55, -6.85], pushK(f, Q.prison - 10, 0.002), { fov: 46 });
const S14a = (f: number) => dolly([PZ + 2.3, 2.5, 0.9], [PZ + 2.6, 2.45, -3.8], pushK(f, Q.L14, 0.0018), { fov: 38 });
const S15a = (f: number) => dolly([PZ + 2.3, 2.4, 0.8], [PZ + 2.45, 2.3, -3.6], pushK(f, Q.L15, 0.0018), { fov: 40 });
const S16a = (f: number) => dolly([PZ + 2.15, 2.05, -1.1], [PZ + 2.15, 2.0, -3.25], pushK(f, Q.L16, 0.0024), { fov: 36 });
// 17 / 18: the office again
const S17a = (f: number) => dolly([OF + 0.12, 1.4, 1.5], [OF + 0.1, 1.12, -1.2], pushK(f, Q.L17, 0.0022), { fov: 38 });
const S18a = (f: number) => dolly([OF + 0.32, 1.45, 1.9], [OF + 0.3, 1.12, -0.9], pushK(f, Q.L18, 0.0018), { fov: 40 });
const S19a = (_f: number) => S1a(0);
// 20: thumbnail: low, close on Milo with the seated pope on his throne above and behind him
const S20a = (_f: number): Shot => ({ pos: [RO - 0.02, 1.3, 1.2], look: [RO - 0.2, 1.78, -4.6], fov: 46 });

const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: S1a }],
  2: [{ f: Q.L2, s: S2a }, { f: Q.summoned, cut: true, s: S2b }],
  3: [{ f: Q.L3, s: S3a }, { f: Q.argument, cut: true, s: S3b }, { f: Q.scared + 18, cut: true, s: S3c }],
  4: [{ f: Q.L4, s: S4a }],
  5: [{ f: Q.L5, s: S5a }, { f: Q.round, cut: true, s: S5b }],
  6: [{ f: Q.L6, s: S6a }],
  7: [{ f: Q.L7, s: S7a }, { f: Q.dead7 - 6, cut: true, s: S7b }],
  8: [{ f: Q.L8, s: S8a }],
  9: [{ f: Q.L9, s: S9a }, { f: Q.dug + 10, cut: true, s: S9b }, { f: Q.trial9 - 6, cut: true, s: S9c }],
  10: [{ f: Q.L10, s: S10a }, { f: Q.defend - 4, cut: true, s: S10b }],
  11: [{ f: Q.L11, s: S11a }],
  12: [{ f: Q.L12, s: S12a }],
  13: [{ f: Q.L13, s: S13a }, { f: Q.prison - 10, cut: true, s: S13b }],
  14: [{ f: Q.L14, s: S14a }],
  15: [{ f: Q.L15, s: S15a }],
  16: [{ f: Q.L16, s: S16a }],
  17: [{ f: Q.L17, s: S17a }],
  18: [{ f: Q.L18, s: S18a }],
  19: [{ f: LOOP, s: S19a }],
  20: [{ f: 0, s: S20a }],
};

// impact kicks (seconds, strength): REAL stamps, the thud on the throne, GUILTY, the gate, the 898 seal
const KICKS: [number, number][] = [
  [Q.real1 / FPS, 1], [(Q.trial9 - 2) / FPS, 0.6], [(Q.guilty + 4) / FPS, 1], [(Q.prison + 4) / FPS, 0.8],
  [(Q.banned + 6) / FPS, 0.6], [Q.real2 / FPS, 1],
];
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
  { f: 0, cInf: 9 }, { f: Q.L2, cInf: 4 }, { f: Q.summoned, cInf: 10 }, { f: Q.L3, cInf: 9 }, { f: Q.argument, cInf: 14 }, { f: Q.scared + 18, cInf: 6 },
  { f: Q.L4, cInf: 12 }, { f: Q.L5, cInf: 10 }, { f: Q.round, cInf: 7 }, { f: Q.L6, cInf: 4 }, { f: Q.L7, cInf: 9 }, { f: Q.dead7 - 6, cInf: 12 },
  { f: Q.L8, cInf: 4 }, { f: Q.L9, cInf: 9 }, { f: Q.dug + 10, cInf: 5 }, { f: Q.trial9 - 6, cInf: 9 }, { f: Q.L10, cInf: 6 }, { f: Q.defend - 4, cInf: 13 },
  { f: Q.L11, cInf: 10 }, { f: Q.L12, cInf: 15 }, { f: Q.L13, cInf: 4 }, { f: Q.prison - 10, cInf: 6 }, { f: Q.L14, cInf: 8 }, { f: Q.L15, cInf: 8 },
  { f: Q.L16, cInf: 10 }, { f: Q.L17, cInf: 13 }, { f: Q.L18, cInf: 9 }, { f: LOOP, cInf: 9 },
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
