// Shared maths of the stick-film kit (src/kit). Everything in the kit is a PURE function of the frame number: no state, no Math.random.
// Units: screen px of the 1080x1920 frame unless a component says otherwise. y grows down.
export type V = [number, number];

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerpV = (a: V, b: V, t: number): V => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
export const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1]];
export const D2R = Math.PI / 180;

/** easing curves (t in 0..1) */
export const ease = {
  linear: (t: number) => t,
  inOut: (t: number) => { t = clamp(t); return t * t * (3 - 2 * t); },
  in: (t: number) => { t = clamp(t); return t * t * t; },
  out: (t: number) => { t = clamp(t); return 1 - Math.pow(1 - t, 3); },
  /** the channel's camera move: fastest on the first frame, settles over the rest (expo out) */
  burst: (t: number) => { t = clamp(t); return t >= 1 ? 1 : 1 - Math.pow(2, -9 * t); },
  back: (t: number) => { t = clamp(t); const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
  elastic: (t: number) => { t = clamp(t); if (t === 0 || t === 1) return t; return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1; },
  bounce: (t: number) => {
    t = clamp(t); const n = 7.5625, d = 2.75;
    if (t < 1 / d) return n * t * t;
    if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
    if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
    return n * (t -= 2.625 / d) * t + 0.984375;
  },
};
export type EaseName = keyof typeof ease;

/** progress of frame f inside [a, b] with an easing */
export const prog = (f: number, a: number, b: number, e: EaseName = "inOut") => ease[e]((f - a) / Math.max(1e-6, b - a));

/** keyframed number: keys sorted by f; each key's `e` is the easing used to arrive at it */
export type Key<T> = { f: number; v: T; e?: EaseName };
export function track(f: number, keys: Key<number>[]): number {
  if (f <= keys[0].f) return keys[0].v;
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f <= k.f) { const p = keys[i - 1]; return lerp(p.v, k.v, ease[k.e ?? "inOut"]((f - p.f) / Math.max(1e-6, k.f - p.f))); }
  }
  return keys[keys.length - 1].v;
}

/** seeded random (mulberry32) and a cheap hash noise */
export const rng = (seed: number) => { let a = seed | 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
export const hash = (i: number) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
/** smooth 1-D value noise in -1..1 */
export const noise1 = (x: number, seed = 0) => {
  const i = Math.floor(x), t = x - i, u = t * t * (3 - 2 * t);
  return lerp(hash(i + seed * 101) * 2 - 1, hash(i + 1 + seed * 101) * 2 - 1, u);
};

/** SVG path helpers */
export const P = (p: V) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
export const poly = (...pts: V[]) => pts.map((q, i) => `${i ? "L" : "M"}${P(q)}`).join(" ");

/** two-bone IK (elbow / knee); bend = +1 or -1 picks the side; the end is clamped to reach */
export const ik2 = (root: V, target: V, l1: number, l2: number, bend: number): { mid: V; end: V } => {
  const dx = target[0] - root[0], dy = target[1] - root[1];
  const dist = Math.hypot(dx, dy) || 1e-6, d = Math.min(Math.max(dist, Math.abs(l1 - l2) + 1), l1 + l2 - 0.01);
  const base = Math.atan2(dy, dx);
  const a = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  const mid: V = [root[0] + l1 * Math.cos(base + bend * a), root[1] + l1 * Math.sin(base + bend * a)];
  return { mid, end: [root[0] + (dx / dist) * d, root[1] + (dy / dist) * d] };
};

/** unique-ish ids for SVG defs inside one frame */
let idc = 0;
export const uid = (p: string) => `${p}${(idc = (idc + 1) % 1e6)}`;
