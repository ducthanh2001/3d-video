// Motion clips of the action characters on the shared rig. A clip is a pure function of the frame (Remotion renders frames on their
// own): (frame, event frame) -> RigPose. Rules every clip follows: anticipation (4-6 frames before a hit), an ease on both sides,
// the contact pose HELD for 2 frames, then follow-through and settle. Feet are never slid: the march cycle gives each foot a WORLD
// position that moves backwards at exactly the walking speed while it is on the ground (see MARCH_REL), so the figure must travel at
// marchSpeedPx() per frame. Persians use the same clips with `flip`.
import { RigPose, V, lerpPose } from "../rig/rig";
import { POSES } from "../characters/thermo";

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** smooth in/out */
export const eio = (t: number) => { const u = clamp01(t); return u * u * (3 - 2 * u); };
/** ease out with a small overshoot (a settle) */
export const eob = (t: number, k = 1.2) => { const u = clamp01(t) - 1; return 1 + (k + 1) * u * u * u + k * u * u; };
const sin = Math.sin, PI = Math.PI;

const P = POSES as Record<string, RigPose>;
const add = (p: RigPose, d: Partial<{ hip: V; lean: number; handL: V; handR: V; sway: number }>): RigPose => ({
  ...p,
  hip: d.hip ? [(p.hip ?? [0, -150])[0] + d.hip[0], (p.hip ?? [0, -150])[1] + d.hip[1]] : p.hip,
  lean: (p.lean ?? 0) + (d.lean ?? 0),
  handL: d.handL ? [p.handL[0] + d.handL[0], p.handL[1] + d.handL[1]] : p.handL,
  handR: d.handR ? [p.handR[0] + d.handR[0], p.handR[1] + d.handR[1]] : p.handR,
  sway: (p.sway ?? 0) + (d.sway ?? 0),
});

/** piecewise blend through keyframes [frameOffset, pose, ease] (offsets relative to the event frame) */
export const track = (f: number, keys: [number, RigPose, ((t: number) => number)?][]): RigPose => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (f <= keys[i][0]) {
      const [a, pa] = keys[i - 1], [b, pb, ease] = keys[i];
      return lerpPose(pa, pb, (ease ?? eio)((f - a) / Math.max(1, b - a)));
    }
  }
  return keys[keys.length - 1][1];
};

// ---- idle / stand ---------------------------------------------------------------------------------------------------------------------
/** idle_breathe: 60-frame loop, chest rises and falls, shoulders and hands follow a little; `phase` shifts a soldier by a few frames */
export const idleBreathe = (f: number, base: RigPose = P.stand_firm, phase = 0): RigPose => {
  const b = sin(((f + phase) / 60) * 2 * PI);
  return add(base, { hip: [0, 2.2 * b], lean: 0.5 * b, handL: [0, 1.6 * b], handR: [0, 1.2 * b], sway: 3 * b });
};
export const standFirm = (f: number, c: number, from: RigPose = P.stand, phase = 0): RigPose => idleBreathe(f, lerpPose(from, P.stand_firm, eob((f - c) / 8, 0.7)), phase);

// ---- march (foot lock) ----------------------------------------------------------------------------------------------------------------
export const MARCH_LEN = 24, MARCH_S = 46; // frames per cycle, half stride (units)
/** relative speed of a foot on the ground, units per frame: the figure must travel at this speed (x scale x size) to not slide */
export const MARCH_REL = (2 * MARCH_S) / (MARCH_LEN / 2);
export const marchSpeedPx = (scale: number, size = 1) => MARCH_REL * scale * size;
/** march_cycle: 24 frames, left foot lands at 0, right foot at 12; the hip bobs twice per cycle; hands swing */
export const marchCycle = (f: number, base: RigPose = P.march): RigPose => {
  const p = (((f % MARCH_LEN) + MARCH_LEN) % MARCH_LEN) / MARCH_LEN;
  const foot = (q: number): V => {
    const h = ((q % 1) + 1) % 1;
    if (h < 0.5) return [MARCH_S - 2 * MARCH_S * (h / 0.5), -14]; // stance: slides backwards at MARCH_REL
    const s = (h - 0.5) / 0.5;
    return [-MARCH_S + 2 * MARCH_S * eio(s), -14 - 38 * sin(PI * s)]; // swing: forward with a lift
  };
  const bob = 5 * Math.abs(sin(2 * PI * p));
  return { ...add(base, { hip: [0, -bob + 2], lean: 2 + 1.5 * sin(2 * PI * p), handL: [0, 4 * sin(2 * PI * p)], handR: [0, -3 * sin(2 * PI * p)] }), footL: foot(p), footR: foot(p + 0.5) };
};

// ---- fighting -------------------------------------------------------------------------------------------------------------------------
/** shield_lock: the line snaps from `from` to the locked pose in 4 frames with a slight overshoot; `c` = the event (contact) frame */
export const shieldLock = (f: number, c: number, from: RigPose = P.stand_firm, phase = 0): RigPose => {
  const t = (f - (c + phase)) / 4;
  return t < 0 ? idleBreathe(f, from, phase) : idleBreathe(f, lerpPose(from, P.shield_lock, eob(t, 1.4)), phase);
};
/** spear_thrust: wind-up 6 frames, strike 3 frames, contact held 2 frames, follow-through 4, back to the guard by +16; c = contact frame */
export const spearThrust = (f: number, c: number, guard: RigPose = P.shield_lock): RigPose =>
  track(f - c, [
    [-14, guard], [-6, P.thrust_windup, eio], [0, P.thrust_contact, (t) => t * t * (1.6 - 0.6 * t)], [2, P.thrust_contact],
    [6, P.thrust_follow, eio], [16, guard, eio],
  ]);
/** shield_block: the Persian takes the spear on the shield, leaning back a little (c = contact frame) */
export const shieldBlock = (f: number, c: number): RigPose =>
  track(f - c, [[-10, P.persian_block], [0, add(P.persian_block, { lean: -5, handL: [-6, 0] }), eio], [4, add(P.persian_block, { lean: -5, handL: [-6, 0] })], [14, P.persian_block, eio]]);
/** stagger_back: pushed one step back, no fall: lean back, feet shuffle, then recover (c = contact frame) */
export const staggerBack = (f: number, c: number): RigPose =>
  track(f - c, [[-2, P.persian_block], [4, P.persian_stagger, eob], [16, P.persian_stagger], [30, P.persian_block, eio]]);
/** how far (units, in the facing direction, negative = backwards) the pushed figure moves in total */
export const staggerShift = (f: number, c: number): number => -46 * eio((f - c) / 6) * (1 - 0.0 * clamp01((f - c) / 40));

// ---- reactions and gestures -----------------------------------------------------------------------------------------------------------
/** turn_head_surprise: a quick start with an overshoot, held, a slow relax */
export const turnHeadSurprise = (f: number, c: number, from: RigPose = P.stand): RigPose =>
  track(f - c, [[-2, from], [5, P.surprised, (t) => eob(t, 1.5)], [40, P.surprised], [60, from, eio]]);
export const pointUp = (f: number, c: number, from: RigPose = P.stand): RigPose => {
  const p = track(f - c, [[-8, from], [4, P.point_up, eob]]);
  const k = clamp01((f - c) / 6);
  return add(p, { handR: [0, -3 * sin(((f - c) / 14) * PI) * k], hip: [0, 0] });
};
export const waveOff = (f: number, c: number, from: RigPose = P.stand_firm): RigPose => {
  const p = track(f - c, [[-6, from], [6, P.wave_off, eob]]);
  const k = clamp01((f - c - 6) / 4), swing = sin(((f - c) / 8) * 2 * PI) * 28 * k;
  return add(p, { handR: [-swing * 0.4, swing] });
};
export const sitThrone = (f: number, phase = 0): RigPose => add(P.sit, { hip: [0, 1.4 * sin(((f + phase) / 70) * 2 * PI)], handR: [0, 1.5 * sin(((f + phase) / 70) * 2 * PI)] });
