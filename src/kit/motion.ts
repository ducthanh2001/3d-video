// Motion helpers that take the "made by a computer" stiffness out of a move (anticipation, springs, staggers, arcs,
// follow-through, landing on the beat). Pure functions of time like the rest of the kit.
// Rules and numbers adapted from cinecode (MIT, (c) 2026 Sarp Yildiz, https://github.com/sarpstar/cinecode),
// references/motion.md and references/camera-moves.md; see .claude/skills/shorts-craft/.
import { V, clamp, ease } from "./core";

const FPS = 30;

/** camera easing inside a sequence: already moving on the first frame, still moving at the cut (35% linear + 65% smoothstep) */
export const inertia = (t: number) => { t = clamp(t); return 0.35 * t + 0.65 * ease.inOut(t); };

/**
 * A damped spring released `tau` seconds ago, going 0 → 1. `zeta` sets the overshoot, `hz` the speed.
 * firm 1.0 (none) · soft 0.8 (~1.5%) · lively 0.7 (~5%, labels and cards) · bouncy 0.5 (~16%) · elastic 0.4 (~25%, once) · rubber 0.3 (cartoon, once).
 * 1–1.5 Hz big/heavy, 2–3 Hz standard, 4+ Hz small and snappy. Settles in about 0.64 / (zeta × hz) s.
 */
export const spring = (tau: number, zeta = 0.7, hz = 2) => {
  if (tau <= 0) return 0;
  const w = 2 * Math.PI * hz;
  if (zeta >= 1) return 1 - Math.exp(-w * tau) * (1 + w * tau);
  const s = Math.sqrt(1 - zeta * zeta), wd = w * s;
  return 1 - Math.exp(-zeta * w * tau) * (Math.cos(wd * tau) + (zeta / s) * Math.sin(wd * tau));
};
/** the same spring driven by frames: released at frame `f0` */
export const springF = (f: number, f0: number, zeta = 0.7, hz = 2, fps = FPS) => spring((f - f0) / fps, zeta, hz);
export const SPRING = { firm: 1, soft: 0.8, lively: 0.7, bouncy: 0.5, elastic: 0.4, rubber: 0.3 } as const;

/**
 * Anticipation: a small move the opposite way before the main one. t 0..1 over the whole move (wind-up included);
 * returns a progress that dips to -amount during the first `share` of the time, then travels to 1 with an ease-out.
 * amount 0.1–0.2 of the move; the wind-up 0.1–0.2 s (3–6 frames). Skip it for accents under 0.15 s.
 */
export const anticipate = (t: number, amount = 0.15, share = 0.25) => {
  t = clamp(t);
  if (t < share) return -amount * Math.sin((Math.PI / 2) * (t / share));
  return -amount + (1 + amount) * ease.out((t - share) / (1 - share));
};

/**
 * Stagger: progress 0..1 of item `i` of `n`, all sharing one easing; only the start differs.
 * step: 1 frame tight cascade (letters), 2–3 standard (rows, icons), 3–5 dramatic build. dur: each item's own move.
 * order: "forward" (reading order), "reverse" (exits), "center" (a burst around a hero).
 */
export const stagger = (f: number, f0: number, i: number, n: number, step = 2, dur = 8, order: "forward" | "reverse" | "center" = "forward", e: keyof typeof ease = "out") => {
  const k = order === "reverse" ? n - 1 - i : order === "center" ? Math.abs(i - (n - 1) / 2) : i;
  return ease[e]((f - f0 - k * step) / dur);
};

/** a living thing travels on a curve: the point at t on a→b bowed sideways by `bow` × the distance (5–20%; negative = the other side) */
export const arc = (a: V, b: V, t: number, bow = 0.12): V => {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L, ny = dx / L, h = 4 * t * (1 - t) * bow * L;
  return [a[0] + dx * t + nx * h, a[1] + dy * t + ny * h];
};

/** follow-through / overlap: a part hanging off a body (cloth, a flag, a rope, a bag) reads the body's time `lagF` frames late (1–4 start, 2–5 stop) */
export const lagged = (f: number, lagF = 3) => f - lagF;

/** the frame a move must START so that its landing (contact) sits on the cue; add the anticipation in front */
export const startFor = (cueF: number, moveF: number, windUpF = 0) => cueF - moveF - windUpF;

/** weight is timing: base duration scaled by material (metal 1.2, rubber 0.8, water 1.5, paper 1.0, smoke 2, glass 0.9) */
export const WEIGHT = { metal: 1.2, rubber: 0.8, water: 1.5, paper: 1.0, smoke: 2.0, glass: 0.9 } as const;

/** a step that moves in the first part of each count and rests in the rest (heavy, effortful progress: climbing, pushing) */
export const stepped = (n: number, moveShare = 0.55) => Math.floor(n) + ease.inOut(clamp((n - Math.floor(n)) / moveShare));
