// "24 Shots": shot table, cameras, lens and impact kicks, timed to voice/words.json (57.4 s, 30 fps).
// Camera grammar is the bridge short's (smootherstep glides of 18-40 f, hard cuts on big reframes, every hold pushes in).
// Frame numbers below are word onsets from words.json x 30, minus 2-3 f so the picture reacts just before the word.
import type { LightName } from "./lights";
export const FPS = 30;
export const TOTAL = 1740;
export const D0 = 6.0; // bank top + deck height (m)
export const HALF = 27; // bridge towers at z = +-27, span 54 m
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 4;

// ---------------- places (world coordinates) ----------------
/** x of each open-top room (floor at y = 0), see sets.ts */
export const SET = { elevator: 2000, bath: 2040, shop: 2080, buffet: 2120, plate: 2160, dark: 2200 } as const;
/** bus stop and bakery annex on the south quay (the quay is z 30.5 .. 36.5, the river lies at z < 30) */
export const BUS: [number, number] = [-46, 33.4];
export const BAKERY: [number, number] = [26, 33.8];
export const DOG: [number, number] = [-12, 33.3];
/** where June stands to watch the sunset (shots 4, 5, 6, 11) */
export const SUNSET: [number, number] = [-19, 31.7];

// ---------------- bridge (intact, never moves in this story; world.ts still poses it) ----------------
export const PARK: V3 = [70, D0, -75];
export type BridgeState = { bounce: number; drop: number; snap: number; collapsed: boolean };
export const shapeZ = (z: number) => (Math.abs(z) < HALF ? Math.cos((Math.PI * z) / (2 * HALF)) : 0);
export const dropW = (z: number) => smooth((20 - z) / 26);
export const deckY = (z: number, b: BridgeState) => D0 + b.bounce * shapeZ(z) - b.drop * 6.6 * dropW(z);
export const bridgeState = (): BridgeState => ({ bounce: 0, drop: 0, snap: 0, collapsed: false });
export const SNAP = 1e9;
export const ANCHOR: V3 = [-2.7, D0 + 0.62, -37];
export const snapEnd = (snap: number): V3 => [ANCHOR[0] - 0.6 * snap, ANCHOR[1] + 5.5 * snap, ANCHOR[2] + 4.5 * snap];

// ---------------- shots ----------------
export type Light = LightName;
export type ShotDef = { id: number; a: number; b: number; light: Light; tau: (t: number) => number };
const tau = (t: number) => t;
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 162, light: "day", tau }, // hook: June and the notifications
  { id: 2, a: 162, b: 237, light: "day", tau }, // bus stop crowd, all looking down
  { id: 3, a: 237, b: 359, light: "day", tau }, // bus stop / elevator / bathroom
  { id: 4, a: 360, b: 560, light: "golden", tau }, // the sunset she photographs once
  { id: 5, a: 560, b: 672, light: "dusk", tau }, // she looks up: dark
  { id: 6, a: 672, b: 796, light: "dusk", tau }, // the phone dies
  { id: 7, a: 796, b: 1021, light: "day", tau }, // the camera shop
  { id: 8, a: 1021, b: 1256, light: "golden", tau }, // looking before shooting
  { id: 9, a: 1256, b: 1431, light: "day", tau }, // buffet / one small plate
  { id: 10, a: 1431, b: 1584, light: "day", tau }, // the darkroom
  { id: 11, a: 1584, b: TOTAL, light: "golden", tau }, // same sunset, phone in the pocket
];
/** crossfades (frames) at place / time-of-day changes; a white 4-frame flash after the hook */
export const XFADE: Record<number, number> = { 4: 12, 5: 14, 7: 8, 8: 8, 10: 8, 11: 12 };
export const FLASH_AT = 156;

export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
/** layers to draw at frame f: base shot, plus the next shot fading in during a crossfade */
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
/** push-in factor since f0: the subject grows ~rate per frame */
const pushK = (f: number, f0: number, rate: number) => Math.exp(-rate * Math.max(0, f - f0));
const dolly = (pos: V3, look: V3, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest });
const zoom = (pos: V3, look: V3, fov: number, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos, look, fov: (360 / Math.PI) * Math.atan(Math.tan((fov * Math.PI) / 360) * k), ...rest });

const [BX, BZ] = BUS, [KX, KZ] = BAKERY, [DX, DZ] = DOG, [SX, SZ] = SUNSET;
const E = SET.elevator, B = SET.bath, S = SET.shop, F = SET.buffet, P = SET.plate, D = SET.dark;
const J1X = 12, J1Z = 33.0; // June, hook
const JBX = BX + 1.4, JBZ = BZ - 0.5; // June at the bus stop
const J8X = 8, J8Z = 33.2; // June, "looking before shooting"
export const J8R: [number, number] = [22.3, 31.3]; // June watching the bridge

// shot 1: June, phone, notifications
const S1a = (f: number) => dolly([J1X + 0.25, D0 + 1.55, 35.6], [J1X, D0 + 1.45, J1Z], pushK(f, 0, 0.0022), { fov: 36 });
const S1b = (f: number) => dolly([J1X + 3.4, D0 + 2.3, 36.0], [J1X + 0.3, D0 + 1.9, J1Z], pushK(f, 90, 0.002), { fov: 42, roll: -0.04 });
const S1c = (f: number) => dolly([J1X + 5.2, D0 + 3.0, 36.0], [J1X, D0 + 2.1, J1Z], pushK(f, 126, 0.002), { fov: 46, roll: 0.03 });
// shot 2: the bus stop
const S2a = (f: number) => dolly([BX + 9.5, D0 + 1.5, BZ - 7.5], [BX + 0.3, D0 + 1.4, BZ - 0.2], pushK(f, 162, 0.0022), { fov: 40 });
const S2b = (f: number) => dolly([BX + 6.5, D0 + 1.45, BZ - 5.6], [BX + 0.9, D0 + 1.4, BZ - 0.3], pushK(f, 200, 0.002), { fov: 38, roll: 0.03 });
// shot 3: stop CU, elevator, bathroom
const S3a = (f: number) => dolly([JBX + 3.4, D0 + 1.4, JBZ - 3.4], [JBX, D0 + 1.4, JBZ], pushK(f, 237, 0.0025), { fov: 36 });
const S3b = (f: number) => dolly([E, 1.5, 3.1], [E, 1.4, -0.2], pushK(f, 282, 0.002), { fov: 38 });
const S3c = (f: number) => dolly([B, 1.5, 2.8], [B, 1.45, -0.5], pushK(f, 320, 0.002), { fov: 36 });
// shot 4: golden sunset, June seen from behind
const S4a = (f: number) => zoom([SX - 13.5, D0 + 1.7, 36.0], [SX + 3.5, D0 + 3.4, SZ - 2], 40, pushK(f, 360, 0.0012));
const S4b = (f: number) => dolly([SX - 0.6, D0 + 1.5, 36.1], [SX, D0 + 1.9, SZ - 6], pushK(f, 462, 0.002), { fov: 36 });
const S4c = (f: number) => dolly([SX - 5, D0 + 2.2, 36.1], [SX + 3, D0 + 4.2, SZ - 10], pushK(f, 500, 0.0012), { fov: 42 });
// shot 5: dusk
const S5a = (f: number) => dolly([SX - 4.2, D0 + 1.7, 36.1], [SX, D0 + 2.4, SZ - 6], pushK(f, 560, 0.0015), { fov: 40 });
const S5b = (f: number) => dolly([SX - 4.2, D0 + 1.7, 36.1], [SX + 3, D0 + 6.8, SZ - 10], pushK(f, 575, 0.0012), { fov: 44 });
// shot 6: phone dies
const S6a = (f: number) => dolly([SX + 0.3, D0 + 1.45, SZ - 2.2], [SX, D0 + 1.5, SZ], pushK(f, 672, 0.0028), { fov: 34 });
const S6b = (f: number) => dolly([SX + 0.3, D0 + 1.45, SZ - 2.2], [SX, D0 + 1.5, SZ], pushK(f, 750, 0.0028), { fov: 34, roll: 0.02 });
// shot 7: the shop
const S7a = (f: number) => dolly([S + 0.4, 1.6, 5.0], [S + 0.4, 1.4, -1.0], pushK(f, 796, 0.0018), { fov: 44 });
const S7b = (f: number) => dolly([S - 0.1, 1.5, 2.9], [S - 0.4, 1.35, -0.3], pushK(f, 834, 0.0022), { fov: 34 });
const S7c = (f: number) => dolly([S + 0.3, 1.5, 2.7], [S - 0.4, 1.45, -0.3], pushK(f, 866, 0.002), { fov: 36 });
const S7d = (f: number) => dolly([S + 0.5, 1.6, 4.8], [S + 0.4, 1.4, -0.8], pushK(f, 915, 0.002), { fov: 42, roll: -0.03 });
const S7e = (f: number) => dolly([S - 0.3, 1.5, 2.9], [S - 0.4, 1.5, -0.3], pushK(f, 972, 0.0028), { fov: 32 });
// shot 8: three things worth a frame
const S8a = (f: number) => dolly([J8X + 0.4, D0 + 1.5, 36.0], [J8X, D0 + 1.5, J8Z], pushK(f, 1021, 0.0022), { fov: 36 });
const S8b = (f: number) => dolly([KX - 8.2, D0 + 1.4, KZ - 0.1], [KX - 0.2, D0 + 1.3, KZ - 0.2], pushK(f, 1100, 0.0018), { fov: 38 });
const S8c = (f: number) => dolly([DX - 5.4, D0 + 0.95, DZ + 0.2], [DX + 1.2, D0 + 0.9, DZ], pushK(f, 1158, 0.002), { fov: 38 });
const S8d = (f: number) => dolly([25.4, D0 + 1.6, 35.4], [-2, D0 + 5, 4], pushK(f, 1201, 0.0016), { fov: 40 });
// shot 9: buffet, one small plate
const S9a = (f: number) => dolly([F, 1.7, 9.0], [F, 1.5, -1.4], pushK(f, 1256, 0.0014), { fov: 46 });
const S9b = (f: number) => dolly([P, 0.95, 2.5], [P, 0.7, -0.5], pushK(f, 1332, 0.002), { fov: 36 });
// shot 10: darkroom
const S10a = (f: number) => dolly([D + 0.4, 1.6, 7.6], [D + 0.4, 1.6, -1.2], pushK(f, 1431, 0.0016), { fov: 44 });
const S10b = (f: number) => dolly([D - 0.15, 1.9, 3.8], [D - 0.15, 1.8, -1.7], pushK(f, 1482, 0.0022), { fov: 40 });
const S10c = (f: number) => dolly([D + 1.9, 1.5, 3.4], [D + 1.9, 1.75, -0.3], pushK(f, 1532, 0.002), { fov: 38 });
// shot 11: same sunset as shot 4, phone in the pocket
const S11a = (f: number) => zoom([SX - 13.5, D0 + 1.7, 36.0], [SX + 3.5, D0 + 3.4, SZ - 2], 40, pushK(f, 1584, 0.0012));
const S11b = (f: number) => dolly([SX - 0.6, D0 + 1.5, 36.1], [SX, D0 + 1.9, SZ - 6], pushK(f, 1606, 0.0016), { fov: 36 });
const S11c = (f: number) => dolly([SX - 9.5, D0 + 5.0, 36.2], [SX + 3, D0 + 2.8, SZ - 1.5], pushK(f, 1672, 0.0005), { fov: 46 });

const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: S1a }, { f: 90, cut: true, s: S1b }, { f: 126, dur: 24, s: S1c }],
  2: [{ f: 162, s: S2a }, { f: 200, dur: 24, s: S2b }],
  3: [{ f: 237, s: S3a }, { f: 282, cut: true, s: S3b }, { f: 320, cut: true, s: S3c }],
  4: [{ f: 360, s: S4a }, { f: 462, cut: true, s: S4b }, { f: 500, dur: 40, s: S4c }],
  5: [{ f: 560, s: S5a }, { f: 575, dur: 40, s: S5b }],
  6: [{ f: 672, s: S6a }, { f: 750, cut: true, s: S6b }],
  7: [{ f: 796, s: S7a }, { f: 834, cut: true, s: S7b }, { f: 866, cut: true, s: S7c }, { f: 915, cut: true, s: S7d }, { f: 972, cut: true, s: S7e }],
  8: [{ f: 1021, s: S8a }, { f: 1100, cut: true, s: S8b }, { f: 1158, cut: true, s: S8c }, { f: 1201, cut: true, s: S8d }],
  9: [{ f: 1256, s: S9a }, { f: 1332, cut: true, s: S9b }],
  10: [{ f: 1431, s: S10a }, { f: 1482, cut: true, s: S10b }, { f: 1532, cut: true, s: S10c }],
  11: [{ f: 1584, s: S11a }, { f: 1606, cut: true, s: S11b }, { f: 1672, dur: 40, s: S11c }],
};

// impact kicks: phone buzzes on the cuts in shot 3, the shutter in shots 4 and 8 (seconds, strength)
const KICKS: [number, number][] = [[9.4, 0.6], [10.65, 0.6], [16.0, 0.8], [37.95, 1], [39.7, 1], [41.3, 1]];
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
export const keyEnd = (id: number, f: number) => {
  let e = 0;
  for (const k of CAMS[id]) if (f >= k.f) e = k.f + (k.cut ? 0 : k.dur ?? 24);
  return Math.max(f, e);
};

// ---------------- lens: depth of field ----------------
export type Dof = { f: number; dur?: number; cInf: number; focus?: (f: number) => V3 };
export const DOF: Dof[] = [
  { f: 0, cInf: 14 }, // hook CU: June sharp, the far bank soft
  { f: 90, cInf: 12 },
  { f: 162, cInf: 6 }, // bus stop
  { f: 237, cInf: 11 },
  { f: 282, cInf: 9 }, // elevator
  { f: 320, cInf: 12 }, // bathroom
  { f: 360, cInf: 0 }, // golden wide
  { f: 462, cInf: 8 },
  { f: 500, dur: 40, cInf: 4 },
  { f: 560, cInf: 6 },
  { f: 672, cInf: 14 }, // phone dies CU
  { f: 796, cInf: 6 }, // shop wide
  { f: 834, cInf: 14 }, // counter CU
  { f: 866, cInf: 11 },
  { f: 915, cInf: 8 },
  { f: 972, cInf: 14 },
  { f: 1021, cInf: 10 },
  { f: 1100, cInf: 12, focus: () => [KX - 3.6, D0 + 1.4, KZ - 0.3] },
  { f: 1158, cInf: 12, focus: () => [DX, D0 + 0.5, DZ] },
  { f: 1201, cInf: 0 }, // the bridge at five: wide and sharp
  { f: 1256, cInf: 6 },
  { f: 1332, cInf: 12 },
  { f: 1431, cInf: 6 },
  { f: 1482, cInf: 12 },
  { f: 1532, cInf: 10 },
  { f: 1584, cInf: 0 },
  { f: 1606, cInf: 8 },
  { f: 1672, dur: 40, cInf: 0 },
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
export const focusAt = (id: number, f: number): V3 => {
  const d = dofAt(f);
  return d.focus ? d.focus(f) : camAt(id, f).look;
};

/** near framing objects (none in this story) */
export type Fg = { a: number; b: number; kit: string; pos: V3; s?: number; yaw?: number };
export const FOREGROUND: Fg[] = [];
