// ep003 "They put a rooster on trial for laying an egg": shot table, cameras, lens and kicks, timed to voice/ep003/words.json (30 fps).
// Every cue lives in Q (frames = word onset x 30, minus 2 f so the picture reacts just before the word). Shot ids 1-18 are
// the script's 18 scenes (scene 18 = the opening frame again), id 19 is the loop tail (the opening frame held for 15 frames).
import type { LightName } from "../ep001/lights";
export const FPS = 30;
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 4;
/** x of each place (sets.ts): Milo's office (ep002's) and the village square of Basel */
export const OF = 2000, SQ = 2400;

/** cue frames from words.json */
export const Q = {
  L1: 0, rooster: 24, egg: 71, flash: 86,
  L2: 91, basel: 105, real: 145,
  L3: 198, judge3: 202, milo3: 259,
  L4: 282, monster: 355,
  L5: 377, simple: 407, roosters: 429,
  L6: 475, care: 495, round1: 514, lost1: 533,
  L7: 553, realdef: 588, inv: 625, evil: 648, hurt: 676,
  L8: 706, hesitates: 719,
  L9: 765, pros: 775, satan: 801, animals: 830,
  L10: 855, lost2: 875, move: 896, idea: 925,
  L11: 950, owner: 965, ifegg: 982, trial: 1017,
  L12: 1054, silence: 1065,
  L13: 1113, guilty: 1129,
  L14: 1165, crowd: 1166, sentenced: 1217, burn: 1256,
  L15: 1294, never: 1313,
  L16: 1347, real2: 1350,
  L17: 1389, lostc: 1394, next: 1416, train: 1434, subscribe: 1460, take: 1473,
  L18: 1488, would: 1500,
  END: 1590,
};
export const TOTAL = Q.END;
export const LOOP = TOTAL - 15;

export type Light = LightName;
export type ShotDef = { id: number; a: number; b: number; light: Light };
export const SHOTS: ShotDef[] = [
  { id: 1, a: Q.L1, b: Q.L2, light: "interior" }, // the office: the rooster's file
  { id: 2, a: Q.L2, b: Q.L3, light: "day" }, // Basel square: REAL OR MYTH?
  { id: 3, a: Q.L3, b: Q.L4, light: "day" }, // the judge points at Milo
  { id: 4, a: Q.L4, b: Q.L5, light: "day" }, // the crowd imagines a monster
  { id: 5, a: Q.L5, b: Q.L6, light: "day" }, // Milo's first argument
  { id: 6, a: Q.L6, b: Q.L7, light: "day" }, // the judge does not care: LOST
  { id: 7, a: Q.L7, b: Q.L8, light: "day" }, // the real defense: three cards
  { id: 8, a: Q.L8, b: Q.L9, light: "day" }, // the judge hesitates
  { id: 9, a: Q.L9, b: Q.L10, light: "day" }, // the prosecutor strikes back: Satan
  { id: 10, a: Q.L10, b: Q.L11, light: "day" }, // LOST; one move left
  { id: 11, a: Q.L11, b: Q.L12, light: "day" }, // Milo points at the owner
  { id: 12, a: Q.L12, b: Q.L13, light: "day" }, // silence
  { id: 13, a: Q.L13, b: Q.L14, light: "day" }, // GUILTY
  { id: 14, a: Q.L14, b: Q.L15, light: "golden" }, // the crowd looks far away; Milo's head is down
  { id: 15, a: Q.L15, b: Q.L16, light: "golden" }, // the owner strolls off
  { id: 16, a: Q.L16, b: Q.L17, light: "golden" }, // REAL
  { id: 17, a: Q.L17, b: Q.L18, light: "interior" }, // the office: next case, the train, SUBSCRIBE
  { id: 18, a: Q.L18, b: LOOP, light: "interior" }, // the opening frame again
  { id: 19, a: LOOP, b: TOTAL, light: "interior" }, // held
  { id: 20, a: Q.L11, b: Q.ifegg + 28, light: "day" }, // split-screen panel: Milo (never found by shotAt, see PANELS)
  { id: 21, a: Q.L11, b: Q.ifegg + 28, light: "day" }, // split-screen panel: the owner
  { id: 22, a: TOTAL + 100, b: TOTAL + 101, light: "day" }, // thumbnail only (Thumb.tsx), never on the timeline
];
/** crossfades (frames) into these shots: the place changes */
export const XFADE: Record<number, number> = { 2: 10, 14: 8, 17: 10, 19: 8 };
export const FLASH_AT = Q.flash;

export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number; clip?: string }[] => {
  if (f >= PANELS.a && f < PANELS.b) return [{ id: PANELS.ids[0], alpha: 1, clip: PANEL_CLIPS[0] }, { id: PANELS.ids[1], alpha: 1, clip: PANEL_CLIPS[1] }];
  for (const s of SHOTS) {
    const x = XFADE[s.id];
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }];
  }
  return [{ id: shotAt(f).id, alpha: 1 }];
};

// ---------------- where people stand in the square (x relative to SQ) ----------------
export const SPOT = {
  milo: [-1.0, 0, -0.3] as V3, dock: [0.8, 0.5, -1.0] as V3, egg: [1.95, 0.78, -1.0] as V3, owner: [2.55, 0, -0.35] as V3,
  prosecutor: [-3.0, 0, -1.8] as V3, scribe: [-2.7, 0, -3.3] as V3, guard: [2.1, 0, -1.9] as V3, judge: [0, 0.9, -4.1] as V3,
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
const X = (x: number) => SQ + x;

// ---- camera plan (every beat has its own kind of angle so the middle of the episode does not look like ep002's front-on court) ----
//  1 office (brand frame, loops)        2 crane down an oblique side view -> LOW dutch shot of the rooster
//  3 low angle up at the judge from the side -> Milo from the left      4 slow arc up and around the crowd under the bubble
//  5 oblique two-shot from the right -> Milo low from the left          6 the ROOSTER'S POV of the yawning judge -> Milo from the right
//  7 ORBIT round Milo and the rooster -> rooster low -> Milo oblique    8 high dutch angle on the judge
//  9 prosecutor from below (dutch) -> the dock from the left -> wide    10 Milo close (grey, then the idea: pulled back)
// 11 DIAGONAL SPLIT: Milo points / the owner sweats -> wide             12 HIGH three-quarter map view: the frozen ring and the tumbleweed
// 13 judge from below-left -> Milo   14 Milo, then a crane up and out   15 static oblique: the owner strolls off into the depth
// 16 golden wide                     17-19 the office again
// 1 / 18 / 19: Milo behind his desk with the open file; slow push to his face
export const S1a = (f: number) => dolly([OF + 0.15, 1.5, 2.3], [OF, 1.08, -0.95], pushK(f, 0, 0.0022), { fov: 40 });
const S1b = (f: number) => dolly([OF + 0.55, 1.2, 1.5], [OF + 0.45, 0.98, -0.45], pushK(f, Q.rooster - 4, 0.002), { fov: 36 });
const S1c = (f: number) => dolly([OF + 0.1, 1.38, 1.7], [OF, 1.1, -1.2], pushK(f, Q.egg - 6, 0.0026), { fov: 34 });
// 2: Basel from the right side, craning down; then the rooster from below with a tilt
const S2a = (f: number) => dolly([X(7.2), 4.8, 10.4], [X(-0.2), 1.4, -2.2], pushK(f, Q.L2, 0.001), { fov: 52 });
const S2a2 = (f: number) => dolly([X(4.2), 2.3, 8.0], [X(0.2), 1.4, -1.6], pushK(f, 96, 0.001), { fov: 50 });
const S2b = (f: number) => dolly([X(-0.5), 0.8, 2.7], [X(0.8), 1.15, -1.0], pushK(f, 131, 0.0016), { fov: 46, roll: 0.07 });
// 3: low angle from the right up at the judge; Milo from the left
const S3a = (f: number) => dolly([X(1.7), 0.8, 2.6], [X(0.0), 2.3, -4.0], pushK(f, Q.L3, 0.002), { fov: 46, roll: -0.05 });
const S3b = (f: number) => dolly([X(-2.7), 1.45, 2.4], [X(-1.0), 1.35, -0.3], pushK(f, Q.milo3 - 4, 0.002), { fov: 38 });
// 4: a slow arc up and round the right-hand crowd, the bubble over their heads
const S4a = (f: number) => { const u = smooth((f - Q.L4) / 95); return { pos: [X(2.0 + 3.6 * u), 1.4 + 1.3 * u, 5.0 - 1.6 * u] as V3, look: [X(4.2), 2.1, -1.5] as V3, fov: 46, roll: 0.03 * u }; };
// 5: oblique two-shot from the right (the rooster near, Milo far), then Milo low from the left
const S5a = (f: number) => dolly([X(3.1), 1.6, 4.6], [X(-0.3), 1.45, -0.7], pushK(f, Q.L5, 0.0015), { fov: 44 });
const S5b = (f: number) => dolly([X(-2.3), 1.0, 2.5], [X(-0.9), 1.55, -0.3], pushK(f, Q.roosters - 4, 0.002), { fov: 40, roll: 0.05 });
// 6: the rooster's point of view: inside the dock, looking up past the crowd at the yawning judge; then Milo from the right
const S6a = (f: number) => dolly([X(0.9), 2.0, -0.7], [X(0.0), 2.7, -4.0], pushK(f, Q.L6, 0.0018), { fov: 50 });
const S6b = (f: number) => dolly([X(0.8), 1.5, 2.6], [X(-1.0), 1.3, -0.3], pushK(f, Q.lost1 - 8, 0.002), { fov: 38 });
// 7: an orbit round Milo and the rooster (about 80 degrees), then the rooster from below, then Milo from the left
const ORB = (f: number): Shot => { const u = smooth((f - Q.L7) / (Q.evil - 4 - Q.L7)), a = -0.75 + 1.5 * u; return { pos: [X(-0.1) + 5.6 * Math.sin(a), 1.8, -0.6 + 5.6 * Math.cos(a)] as V3, look: [X(-0.1), 1.8, -0.6] as V3, fov: 42 }; };
const S7c = (f: number) => dolly([X(0.0), 0.7, 2.4], [X(0.8), 1.15, -1.0], pushK(f, Q.evil - 4, 0.0018), { fov: 38, roll: -0.05 });
const S7d = (f: number) => dolly([X(-2.7), 1.6, 2.7], [X(-0.9), 1.7, -0.3], pushK(f, Q.hurt - 4, 0.002), { fov: 40 });
// 8: high and tilted on the hesitating judge
const S8a = (f: number) => dolly([X(0.7), 3.5, 2.4], [X(0.0), 2.0, -3.9], pushK(f, Q.L8, 0.0022), { fov: 36, roll: 0.05 });
// 9: the prosecutor from below (a tilted villain angle), the dock from the left, then a wide
const S9a = (f: number) => dolly([X(-2.5), 0.6, 0.7], [X(-3.0), 1.9, -1.8], pushK(f, Q.L9, 0.002), { fov: 44, roll: -0.08 });
const S9b = (f: number) => dolly([X(-1.5), 1.3, 3.3], [X(1.0), 1.25, -1.0], pushK(f, Q.satan - 4, 0.0016), { fov: 42 });
const S9c = (f: number) => dolly([X(0.0), 2.4, 5.2], [X(0.0), 1.8, -2.2], pushK(f, Q.animals, 0.0018), { fov: 46 });
// 10: Milo drained of colour, then the idea (pulled back so the bulb fits)
const S10a = (f: number) => dolly([X(-1.0), 1.55, 2.4], [X(-1.0), 1.45, -0.3], pushK(f, Q.L10, 0.0022), { fov: 36 });
const S10b = (f: number) => dolly([X(-1.0), 1.7, 3.4], [X(-1.0), 1.7, -0.3], pushK(f, Q.idea - 2, 0.0014), { fov: 42 });
// 11: the diagonal split (panel 20 = Milo in the upper half, panel 21 = the owner in the lower half), then the wide with the question
export const PANELS = { a: Q.L11, b: Q.ifegg + 28, ids: [20, 21] as [number, number] };
export const PANEL_CLIPS = ["polygon(0 0, 100% 0, 100% 47%, 0 53%)", "polygon(0 53%, 100% 47%, 100% 100%, 0 100%)"];
const S20 = (f: number) => dolly([X(-0.4), 1.5, 3.0], [X(-0.9), 1.2, -0.3], pushK(f, Q.L11, 0.002), { fov: 40 });
const S21 = (f: number) => dolly([X(2.0), 1.7, 3.0], [X(2.55), 2.4, -0.35], pushK(f, Q.L11, 0.002), { fov: 40 });
const S11c = (f: number) => dolly([X(0.7), 2.4, 9.4], [X(0.7), 1.5, -1.0], pushK(f, Q.ifegg + 28, 0.0012), { fov: 52 });
// 12: silence from high up (the whole ring frozen, the tumbleweed crossing the empty cobbles)
const S12a = (f: number) => dolly([X(0.4), 8.6, 10.4], [X(0.2), 0.7, -1.8], pushK(f, Q.L12, 0.0008), { fov: 40, roll: 0.06 });
// 13: the judge from below on the left, Milo's reaction
const S13a = (f: number) => dolly([X(1.0), 1.0, 2.6], [X(0.05), 2.2, -3.9], pushK(f, Q.L13, 0.002), { fov: 42, roll: 0.05 });
const S13b = (f: number) => dolly([X(-1.0), 1.5, 2.7], [X(-1.0), 1.3, -0.3], pushK(f, 1143, 0.002), { fov: 38 });
// 14: golden: Milo with his head down, then a crane up and out over the crowd looking away
const S14a = (f: number) => dolly([X(-1.0), 1.4, 2.4], [X(-1.0), 1.15, -0.3], pushK(f, Q.L14, 0.0022), { fov: 36 });
const S14b = (f: number) => { const u = smooth((f - 1210) / 80); return { pos: [X(-0.6 + 3.0 * u), 1.7 + 3.6 * u, 3.4 + 7.4 * u] as V3, look: [X(0.2), 1.4, -1.5] as V3, fov: 40 + 8 * u }; };
// 15: one static oblique wide from the left: Milo near, the owner strolling away into the depth
const S15a = (f: number) => dolly([X(-4.6), 1.7, 3.3], [X(1.6), 1.4, -1.6], pushK(f, Q.L15, 0.0008), { fov: 50 });
// 16: golden wide, a little from the left and high
const S16a = (f: number) => dolly([X(-1.2), 3.2, 10.0], [X(0.2), 1.6, -1.4], pushK(f, Q.L16, 0.0012), { fov: 54 });
// 17: the office: the old file, the train file, the button
const S17a = (f: number) => dolly([OF + 0.12, 1.4, 1.5], [OF + 0.1, 1.12, -1.2], pushK(f, Q.L17, 0.0022), { fov: 38 });
const S17b = (f: number) => dolly([OF + 0.3, 1.3, 1.5], [OF + 0.2, 1.0, -0.7], pushK(f, Q.next - 6, 0.002), { fov: 38 });
const S17c = (f: number) => dolly([OF + 0.2, 1.7, 2.3], [OF + 0.15, 1.55, -1.2], pushK(f, Q.subscribe - 6, 0.0014), { fov: 44 });
const S18a = (f: number) => S1a(Math.max(0, f - Q.L18));
const S19a = (_f: number) => S1a(0);

const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: S1a }, { f: Q.rooster - 4, cut: true, s: S1b }, { f: Q.egg - 6, cut: true, s: S1c }],
  2: [{ f: Q.L2, s: S2a }, { f: 96, dur: 30, s: S2a2 }, { f: 131, cut: true, s: S2b }],
  3: [{ f: Q.L3, s: S3a }, { f: Q.milo3 - 4, cut: true, s: S3b }],
  4: [{ f: Q.L4, s: S4a }],
  5: [{ f: Q.L5, s: S5a }, { f: Q.roosters - 4, cut: true, s: S5b }],
  6: [{ f: Q.L6, s: S6a }, { f: Q.lost1 - 8, cut: true, s: S6b }],
  7: [{ f: Q.L7, s: ORB }, { f: Q.evil - 4, cut: true, s: S7c }, { f: Q.hurt - 4, cut: true, s: S7d }],
  8: [{ f: Q.L8, s: S8a }],
  9: [{ f: Q.L9, s: S9a }, { f: Q.satan - 4, cut: true, s: S9b }, { f: Q.animals, cut: true, s: S9c }],
  10: [{ f: Q.L10, s: S10a }, { f: Q.idea - 2, cut: true, s: S10b }],
  11: [{ f: Q.L11, s: S11c }],
  12: [{ f: Q.L12, s: S12a }],
  13: [{ f: Q.L13, s: S13a }, { f: 1143, cut: true, s: S13b }],
  14: [{ f: Q.L14, s: S14a }, { f: 1210, cut: true, s: S14b }],
  15: [{ f: Q.L15, s: S15a }],
  16: [{ f: Q.L16, s: S16a }],
  17: [{ f: Q.L17, s: S17a }, { f: Q.next - 6, cut: true, s: S17b }, { f: Q.subscribe - 6, cut: true, s: S17c }],
  18: [{ f: Q.L18, s: S18a }],
  19: [{ f: LOOP, s: S19a }],
  20: [{ f: PANELS.a, s: S20 }],
  21: [{ f: PANELS.a, s: S21 }],
  22: [{ f: 0, s: (_f: number): Shot => ({ pos: [X(0.3), 1.4, 3.3], look: [X(0.3), 1.45, -0.6], fov: 46 }) }],
};

// impact kicks (seconds, strength): gavels, the three stamps, the owner's gulp, Satan's swoop
const KICKS: [number, number][] = [
  [Q.judge3 / FPS, 0.6], [(Q.lost1 + 1) / FPS, 1], [(Q.lost2 + 1) / FPS, 1], [(Q.guilty - 1) / FPS, 1], [(Q.guilty + 4) / FPS, 0.7],
  [Q.real2 / FPS, 1], [(Q.satan + 6) / FPS, 0.5], [(Q.monster + 5) / FPS, 0.4],
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
  { f: 0, cInf: 9 }, { f: Q.rooster - 4, cInf: 12 }, { f: Q.egg - 6, cInf: 12 }, { f: Q.L2, cInf: 3 }, { f: 131, cInf: 8 }, { f: Q.L3, cInf: 8 }, { f: Q.milo3 - 4, cInf: 11 },
  { f: Q.L4, cInf: 6 }, { f: Q.L5, cInf: 5 }, { f: Q.roosters - 4, cInf: 11 }, { f: Q.L6, cInf: 8 }, { f: Q.lost1 - 8, cInf: 11 }, { f: Q.L7, cInf: 4 }, { f: Q.evil - 4, cInf: 12 },
  { f: Q.hurt - 4, cInf: 10 }, { f: Q.L8, cInf: 12 }, { f: Q.L9, cInf: 10 }, { f: Q.satan - 4, cInf: 9 }, { f: Q.animals, cInf: 4 }, { f: Q.L10, cInf: 12 }, { f: Q.L11, cInf: 10 },
  { f: Q.owner - 4, cInf: 12 }, { f: Q.ifegg + 28, cInf: 3 }, { f: Q.L12, cInf: 3 }, { f: Q.L13, cInf: 8 }, { f: 1143, cInf: 7 }, { f: Q.L14, cInf: 11 }, { f: 1210, cInf: 4 },
  { f: Q.L15, cInf: 7 }, { f: Q.L16, cInf: 3 }, { f: Q.L17, cInf: 12 }, { f: Q.next - 6, cInf: 10 }, { f: Q.subscribe - 6, cInf: 9 }, { f: Q.L18, cInf: 9 },
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
