// Acting poses for SMALL TRUTHS: effort and fatigue must read without words.
// All poses are kit Poses (local units, root = ground point under the hip, facing +x). `a` = ground slope in degrees,
// + = uphill in the facing direction; on a slope the feet are placed ON the ground line through the root.
import { V } from "../../kit/core";
import { BONE, HIP_H, POSES, Pose, mixPose, walk } from "../../kit/hero";

const D = Math.PI / 180;

/** put both feet on a slope through the root */
export const onSlope = (p: Pose, a: number): Pose => {
  const t = Math.tan(a * D);
  const adj = (v: V): V => [v[0], v[1] - v[0] * t];
  return { ...p, fN: adj(p.fN), fF: adj(p.fF) };
};

/** walking up/down a moderate slope; tired 0..1 bends the body and drops the head */
export const slopeWalk = (phase: number, a: number, energy = 0.8, tired = 0): Pose => {
  const w = walk(phase, energy);
  return onSlope({ ...w, lean: w.lean + Math.max(0, a) * 0.55 + tired * 14, head: w.head + tired * 14 - Math.min(0, a) * 0.3 }, a);
};

/** scrambling up a steep slope on hands and feet (a = 40..60 deg) */
export const scramble = (phase: number, a: number): Pose => {
  const t = Math.tan(a * D), ph = phase * Math.PI * 2;
  const hip: V = [0, -150], lean = 50;
  const sh: V = [hip[0] + Math.sin(lean * D) * BONE.torso, hip[1] - Math.cos(lean * D) * BONE.torso];
  const fx1 = 46 * Math.sin(ph), fx2 = -fx1 - 18;
  const lift1 = Math.max(0, Math.cos(ph)) * 22, lift2 = Math.max(0, -Math.cos(ph)) * 22;
  const hand = (hx: number, lift: number): V => [hx - sh[0], -hx * t - lift - sh[1] - 4];
  return {
    hip, lean, head: -26,
    hN: hand(92 + 34 * Math.sin(ph + Math.PI), Math.max(0, Math.cos(ph + Math.PI)) * 16),
    hF: hand(92 + 34 * Math.sin(ph), Math.max(0, Math.cos(ph)) * 16),
    fN: [fx1, -fx1 * t - lift1], fF: [fx2, -fx2 * t - lift2], elbow: 1,
  };
};

/** bent over, hands on the knees, breathing hard (the head bobs with each breath) */
export const pant = (f: number, a = 0): Pose =>
  onSlope({ hip: [0, -HIP_H + 26], lean: 50, head: 16 + Math.sin(f * 0.4) * 5, hN: [30, 98 + Math.sin(f * 0.4) * 3], hF: [20, 102], fN: [28, 0], fF: [-26, 0], elbow: 1 }, a);

/** heavy hauling: deep lean, short steps, both fists at the chest holding a rope that runs back over the shoulder */
export const haul = (phase: number, strain = 1): Pose => {
  const w = walk(phase, 0.42);
  return { ...w, hip: [w.hip[0], w.hip[1] + 14 * strain], lean: 30 + 14 * strain, head: 8 + 8 * strain, hN: [34, 26], hF: [20, 36], elbow: 1 };
};
/** reaching back to cut the rope (used for a few frames before each cut) */
export const reachBack = (): Pose => ({ hip: [0, -HIP_H + 10], lean: 18, head: 30, hN: [-96, 70], hF: [-80, 80], fN: [30, 0], fF: [-30, 0] });

/** sitting on a low rock (seat height in local units), elbow on the knee, chin on the hand, looking up */
export const sitChin = (seat = 70, look = -24): Pose => ({ hip: [0, -seat - 6], lean: 24, head: look, hN: [40, -4], hF: [70, 64], fN: [94, 0], fF: [78, 0], elbow: 1 });
/** sitting on the ground, legs out, both hands holding a phone at the lap, head bowed */
export const groundPhone = (f: number): Pose => ({ hip: [0, -18], lean: 14, head: 42, hN: [48, 56 + Math.sin(f * 0.6) * 2], hF: [38, 62], fN: [150, 0], fF: [138, -4], elbow: 1 });
/** standing with the shoulders dropped (disappointment) */
export const slump = (): Pose => ({ ...POSES.sad(), lean: 16, head: 38 });

export { mixPose };
