// Shared skeleton of the action characters (see RIG.md). Units: character units, feet at y = 0, y grows DOWN, +x is the way the
// figure faces (Greeks face right on screen, Persians are drawn the same and flipped). Bone lengths are the same for everybody
// (a character's `size` scales the whole figure); what differs is the look (FigSpec in Figure.tsx).
export type V = [number, number];

export const BONES = { legU: 75, legL: 75, armU: 80, armL: 82, shoulderX: 14, hipX: 14, hipY: 150, shoulderUp: 168, head: 330 };

/** Pose = where things are. Hands and feet are WORLD targets (character units); the elbows and knees come from the IK. */
export type RigPose = {
  hip?: V; // default [0, -150]
  lean?: number; // upper body rotation about the hip, degrees, + = forward (toward +x)
  handL: V; // near arm: holds the shield
  handR: V; // far arm: holds the weapon
  footL: V; // near leg
  footR: V; // far leg
  weaponAngle?: number; // degrees, 0 = pointing forward, -90 = pointing up
  headTilt?: number;
  bendL?: 1 | -1;
  bendR?: 1 | -1;
  /** the cloak swings back by this many units */
  sway?: number;
  /** draw the far arm over the head (pointing / waving above the shoulder line) */
  armFront?: boolean;
  /** an index finger sticks out of the far hand along the arm (pointing) */
  point?: boolean;
};

const rad = (d: number) => (d * Math.PI) / 180;
export const rot = (p: V, deg: number): V => { const a = rad(deg), c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; };

/** two-bone IK: the middle joint (elbow / knee) for a root and a target; the end joint is clamped to the reach */
export const ik2 = (root: V, target: V, l1: number, l2: number, bend: 1 | -1): { mid: V; end: V } => {
  const dx = target[0] - root[0], dy = target[1] - root[1];
  const dist = Math.hypot(dx, dy) || 1e-6, d = Math.min(Math.max(dist, Math.abs(l1 - l2) + 1), l1 + l2 - 0.01);
  const base = Math.atan2(dy, dx);
  const a = Math.acos(Math.min(1, Math.max(-1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
  const mid: V = [root[0] + l1 * Math.cos(base + bend * a), root[1] + l1 * Math.sin(base + bend * a)];
  const end: V = [root[0] + (dx / dist) * d, root[1] + (dy / dist) * d];
  return { mid, end };
};

export type Solved = {
  hip: V; lean: number; torso: V; head: V;
  shoulderL: V; shoulderR: V; elbowL: V; elbowR: V; handL: V; handR: V;
  hipL: V; hipR: V; kneeL: V; kneeR: V; footL: V; footR: V;
  /** attachment points: the weapon is gripped by the far hand, the shield by the near hand */
  weaponGrip: V; shieldGrip: V;
};

export const solve = (pose: RigPose): Solved => {
  const B = BONES, hip = pose.hip ?? [0, -B.hipY], lean = pose.lean ?? 0;
  const up = (o: V): V => { const r = rot(o, lean); return [hip[0] + r[0], hip[1] + r[1]]; };
  const shoulderL = up([B.shoulderX, -B.shoulderUp]), shoulderR = up([-B.shoulderX, -B.shoulderUp]);
  const armL = ik2(shoulderL, pose.handL, B.armU, B.armL, pose.bendL ?? 1);
  const armR = ik2(shoulderR, pose.handR, B.armU, B.armL, pose.bendR ?? 1);
  const hipL: V = [hip[0] + B.hipX, hip[1]], hipR: V = [hip[0] - B.hipX, hip[1]];
  const legL = ik2(hipL, pose.footL, B.legU, B.legL, -1);
  const legR = ik2(hipR, pose.footR, B.legU, B.legL, -1);
  return {
    hip, lean, torso: up([0, -100]), head: up([0, -B.head]),
    shoulderL, shoulderR, elbowL: armL.mid, elbowR: armR.mid, handL: armL.end, handR: armR.end,
    hipL, hipR, kneeL: legL.mid, kneeR: legR.mid, footL: legL.end, footR: legR.end,
    weaponGrip: armR.end, shieldGrip: armL.end,
  };
};

export const lerpV = (a: V, b: V, t: number): V => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
/** blend two poses (t = 0 -> a, 1 -> b) */
export const lerpPose = (a: RigPose, b: RigPose, t: number): RigPose => ({
  hip: lerpV(a.hip ?? [0, -150], b.hip ?? [0, -150], t), lean: (a.lean ?? 0) + ((b.lean ?? 0) - (a.lean ?? 0)) * t,
  handL: lerpV(a.handL, b.handL, t), handR: lerpV(a.handR, b.handR, t), footL: lerpV(a.footL, b.footL, t), footR: lerpV(a.footR, b.footR, t),
  weaponAngle: (a.weaponAngle ?? 0) + ((b.weaponAngle ?? 0) - (a.weaponAngle ?? 0)) * t,
  headTilt: (a.headTilt ?? 0) + ((b.headTilt ?? 0) - (a.headTilt ?? 0)) * t,
  sway: (a.sway ?? 0) + ((b.sway ?? 0) - (a.sway ?? 0)) * t,
  bendL: b.bendL ?? a.bendL, bendR: b.bendR ?? a.bendR,
});
