// The kit's stick figure, in the look of dark "simply animated" motivational shorts (our own drawing, measured from reference frames):
// white capsule limbs with a thin black outline, a big round head with an outline and soft shading, far limbs a step greyer, a faint
// white glow around the whole body. No face: feeling comes from posture and head tilt.
//
// LOCAL units: the root is the ground point under the hip (x = 0, y = 0), the figure faces +x, y grows down. Hands are targets
// RELATIVE TO THE SHOULDER, feet are targets relative to the root. Elbows and knees come from 2-bone IK so bone lengths never change.
// Poses are plain data: mix them with mixPose, drive cycles with a phase (walk/run/climb), place them with <Hero x y s flip>.
import React from "react";
import { D2R, V, clamp, ik2, lerp, lerpV, poly } from "./core";

export const BONE = { head: 31, neck: 9, torso: 124, uArm: 72, fArm: 70, thigh: 98, shin: 96, width: 17, outline: 3 };
export const HIP_H = BONE.thigh + BONE.shin - 6; // standing hip height (knees a hair soft)

export type Pose = {
  hip: V; // hip position (root-relative)
  lean: number; // torso angle from vertical, degrees, + = forward
  head: number; // extra head tilt, degrees
  hN: V; hF: V; // near / far hand, relative to the shoulder
  fN: V; fF: V; // near / far foot (the end of the shin), relative to the root
  elbow?: number; // +1 = elbows back (default), -1 = elbows forward
};

export const mixPose = (a: Pose, b: Pose, t: number): Pose => ({
  hip: lerpV(a.hip, b.hip, t), lean: lerp(a.lean, b.lean, t), head: lerp(a.head, b.head, t),
  hN: lerpV(a.hN, b.hN, t), hF: lerpV(a.hF, b.hF, t), fN: lerpV(a.fN, b.fN, t), fF: lerpV(a.fF, b.fF, t),
  elbow: t < 0.5 ? a.elbow : b.elbow,
});

// ---------------------------------------------------------------- pose library
const H = HIP_H, AR = BONE.uArm + BONE.fArm;
export const POSES = {
  stand: (): Pose => ({ hip: [0, -H], lean: 0, head: 0, hN: [18, AR - 10], hF: [-12, AR - 10], fN: [16, 0], fF: [-16, 0] }),
  /** breathing idle: chest rises, hands drift */
  idle: (f: number): Pose => { const b = Math.sin(f * 0.09); return { hip: [0, -H + b * 1.5], lean: b * 1.2, head: Math.sin(f * 0.05) * 3, hN: [10 + b * 2, AR - 7], hF: [-8 - b * 2, AR - 7], fN: [16, 0], fF: [-16, 0] }; },
  sad: (): Pose => ({ hip: [0, -H + 6], lean: 12, head: 32, hN: [6, AR - 2], hF: [-2, AR - 2], fN: [14, 0], fF: [-12, 0] }),
  armsUp: (): Pose => ({ hip: [0, -H], lean: -4, head: -8, hN: [70, -AR + 34], hF: [-58, -AR + 34], fN: [30, 0], fF: [-30, 0] }),
  /** both hands on the head (stress / overthinking) */
  headInHands: (): Pose => ({ hip: [0, -H + 40], lean: 18, head: 30, hN: [4, -46], hF: [14, -56], elbow: -1, fN: [52, 0], fF: [-50, 0] }),
  point: (): Pose => ({ hip: [0, -H], lean: 0, head: -4, hN: [AR - 4, -10], hF: [-6, AR - 8], fN: [18, 0], fF: [-18, 0] }),
  think: (): Pose => ({ hip: [0, -H], lean: 0, head: 12, hN: [40, -4], hF: [30, 58], fN: [14, 0], fF: [-14, 0], elbow: 1 }),
  push: (): Pose => ({ hip: [-22, -H + 22], lean: 30, head: -10, hN: [AR - 10, 6], hF: [AR - 16, 14], fN: [28, 0], fF: [-100, 0] }),
  carry: (): Pose => ({ hip: [0, -H], lean: -4, head: 6, hN: [64, 64], hF: [54, 70], fN: [16, 0], fF: [-16, 0] }),
  crouch: (): Pose => ({ hip: [-10, -112], lean: 30, head: -6, hN: [60, 90], hF: [40, 96], fN: [34, 0], fF: [-24, 0] }),
  kneel: (): Pose => ({ hip: [-6, -104], lean: 6, head: 18, hN: [26, AR - 30], hF: [6, AR - 30], fN: [70, 0], fF: [-92, -4] }),
  /** sitting on a seat of height `seat` */
  sit: (seat = 100): Pose => ({ hip: [0, -seat - 6], lean: 4, head: 4, hN: [70, 70], hF: [56, 76], fN: [BONE.thigh - 6, 0], fF: [BONE.thigh + 18, 0] }),
  /** sitting on the floor hugging the knees */
  hugKnees: (): Pose => ({ hip: [0, -8], lean: 30, head: 30, hN: [88, 22], hF: [80, 28], fN: [96, 0], fF: [112, 0] }),
  lie: (): Pose => ({ hip: [0, -14], lean: -88, head: -6, hN: [-10, 70], hF: [10, 70], fN: [190, -12], fF: [184, -14] }),
  jumpLoad: (): Pose => ({ hip: [0, -H + 62], lean: 22, head: -4, hN: [-50, 110], hF: [-60, 104], fN: [26, 0], fF: [-22, 0] }),
  jumpAir: (): Pose => ({ hip: [0, -H - 24], lean: -4, head: -10, hN: [40, -AR + 20], hF: [-24, -AR + 24], fN: [20, -24], fF: [-30, -10] }),
  tuck: (): Pose => ({ hip: [0, -H + 20], lean: 26, head: 10, hN: [60, 60], hF: [50, 70], fN: [50, -70], fF: [36, -60] }),
  wave: (f: number): Pose => ({ hip: [0, -H], lean: 0, head: -6, hN: [40 + Math.sin(f * 0.35) * 26, -AR + 24], hF: [-8, AR - 6], fN: [16, 0], fF: [-16, 0], elbow: -1 }),
  celebrate: (f: number): Pose => { const b = Math.abs(Math.sin(f * 0.25)); return { hip: [0, -H - b * 34], lean: -4, head: -18, hN: [40, -AR + 6], hF: [-36, -AR + 6], fN: [22, -b * 34], fF: [-22, -b * 34] }; },
  fallBack: (): Pose => ({ hip: [-30, -96], lean: -55, head: -20, hN: [-70, 30], hF: [-40, -60], fN: [80, -30], fF: [60, -6] }),
  kick: (): Pose => ({ hip: [0, -H + 4], lean: -14, head: -4, hN: [-50, 70], hF: [70, 30], fN: [150, -120], fF: [-12, 0] }),
  kickLoad: (): Pose => ({ hip: [0, -H + 14], lean: 8, head: 4, hN: [50, 70], hF: [-40, 80], fN: [-90, -50], fF: [10, 0] }),
  throw: (): Pose => ({ hip: [0, -H], lean: 8, head: -8, hN: [AR - 8, -40], hF: [-60, 80], fN: [44, 0], fF: [-44, 0] }),
};

/** walk cycle. phase in turns (1 = two steps). The root moves STRIDE*2 per turn: drive phase = distance / (2*STRIDE) and the feet stay planted. */
export const STRIDE = 104;
export const walk = (phase: number, energy = 1): Pose => {
  const L = STRIDE * energy;
  const foot = (p: number): V => {
    p = ((p % 1) + 1) % 1;
    if (p < 0.5) return [L / 2 - (p / 0.5) * L, 0]; // stance: slides back under the moving body (planted in the world)
    const s = (p - 0.5) / 0.5, e = s * s * (3 - 2 * s);
    return [-L / 2 + e * L, -Math.sin(s * Math.PI) * 34 * energy];
  };
  const bob = Math.cos(phase * 4 * Math.PI) * 5 * energy, sw = Math.sin(phase * 2 * Math.PI);
  return { hip: [0, -H + 3 - bob], lean: 4 * energy, head: -2, hN: armAt(-sw * 26 * energy + 2, 18 + 14 * Math.max(0, -sw)), hF: armAt(sw * 26 * energy + 2, 18 + 14 * Math.max(0, sw)), fN: foot(phase), fF: foot(phase + 0.5) };
};
export const RUN_STRIDE = 176;
export const run = (phase: number): Pose => {
  const L = RUN_STRIDE;
  const foot = (p: number): V => {
    p = ((p % 1) + 1) % 1;
    if (p < 0.36) return [L * 0.42 - (p / 0.36) * L * 0.84, 0];
    const s = (p - 0.36) / 0.64, e = s * s * (3 - 2 * s);
    return [-L * 0.42 + e * L * 0.84 + Math.sin(s * Math.PI) * 10, -Math.sin(s * Math.PI) * 92 - (s < 0.5 ? s * 40 : (1 - s) * 40)];
  };
  const bob = Math.abs(Math.sin(phase * 2 * Math.PI)) * 16, sw = Math.sin(phase * 2 * Math.PI);
  return { hip: [0, -H + 16 - bob], lean: 15, head: -10, hN: armAt(-sw * 55 + 5, 95), hF: armAt(sw * 55 + 5, 95), fN: foot(phase), fF: foot(phase + 0.5), elbow: 1 };
};
/** hand target (shoulder-relative) for an upper arm at `swing` degrees from straight down (+ = forward) and an elbow bent `bend` degrees forward */
export const armAt = (swing: number, bend: number): V => {
  const a = swing * D2R, b = (swing + bend) * D2R;
  return [Math.sin(a) * BONE.uArm + Math.sin(b) * BONE.fArm, Math.cos(a) * BONE.uArm + Math.cos(b) * BONE.fArm];
};
/** ladder climb: rung spacing `rung`; phase in turns (one turn = 2 rungs). Root stays put, the CALLER raises y by rung*2 per turn. */
export const climb = (phase: number, rung = 70): Pose => {
  const s = Math.sin(phase * 2 * Math.PI) * 0.5;
  return { hip: [-34, -H + 10], lean: 10, head: -14, hN: [44, -96 + s * rung], hF: [40, -96 - s * rung], fN: [16, -40 - s * rung - rung * 0.5], fF: [12, -40 + s * rung - rung * 0.5] };
};

/** jump arc helper: returns the pose and the root lift for a jump of `dur` frames starting at t=0 (load 0-8, air, land) */
export const jump = (t: number, dur = 30, height = 220): { pose: Pose; lift: number } => {
  const P = POSES;
  if (t < 8) return { pose: mixPose(P.stand(), P.jumpLoad(), clamp(t / 8)), lift: 0 };
  const a = (t - 8) / (dur - 8);
  if (a < 1) {
    const lift = Math.sin(a * Math.PI) * height;
    const pose = a < 0.5 ? mixPose(P.jumpAir(), P.tuck(), clamp(a / 0.5)) : mixPose(P.tuck(), P.jumpAir(), clamp((a - 0.5) / 0.5));
    return { pose, lift };
  }
  const l = clamp((t - dur) / 10);
  return { pose: l < 0.4 ? mixPose(P.jumpAir(), P.jumpLoad(), l / 0.4) : mixPose(P.jumpLoad(), P.stand(), (l - 0.4) / 0.6), lift: 0 };
};

// ---------------------------------------------------------------- solving
export type Joints = { hip: V; sh: V; neck: V; head: V; eN: V; wN: V; eF: V; wF: V; kN: V; aN: V; kF: V; aF: V };
const rotUp = (o: V, len: number, deg: number): V => [o[0] + Math.sin(deg * D2R) * len, o[1] - Math.cos(deg * D2R) * len];
export const solvePose = (p: Pose): Joints => {
  const sh = rotUp(p.hip, BONE.torso, p.lean);
  const neck = rotUp(sh, BONE.neck, p.lean + p.head * 0.4);
  const head = rotUp(neck, BONE.head * 0.92, p.lean + p.head);
  const eb = p.elbow ?? 1;
  const aN = ik2(sh, [sh[0] + p.hN[0], sh[1] + p.hN[1]], BONE.uArm, BONE.fArm, eb);
  const aF = ik2(sh, [sh[0] + p.hF[0], sh[1] + p.hF[1]], BONE.uArm, BONE.fArm, eb);
  const lN = ik2(p.hip, p.fN, BONE.thigh, BONE.shin, -1);
  const lF = ik2(p.hip, p.fF, BONE.thigh, BONE.shin, -1);
  return { hip: p.hip, sh, neck, head, eN: aN.mid, wN: aN.end, eF: aF.mid, wF: aF.end, kN: lN.mid, aN: lN.end, kF: lF.mid, aF: lF.end };
};

// ---------------------------------------------------------------- drawing
export type HeroLook = {
  body?: string; // lit colour of near parts
  far?: string; // colour of far limbs
  ink?: string; // outline colour
  glow?: number; // 0..1 white halo strength
  glowColor?: string;
  width?: number; // limb width multiplier
  head?: number; // head radius multiplier (bold pictogram look: ~1.15)
  eyes?: "side" | "front"; // two dot eyes (off by default): "side" = both on the facing half, "front" = centred
  eyeColor?: string;
  eyeDown?: number; // shift the eyes down (looking down), in head radii
};
export const LOOK_WHITE: HeroLook = { body: "#f7f7f5", far: "#b9b9b9", ink: "#0b0b0d", glow: 0.45, glowColor: "#ffffff" };
export const LOOK_GREY: HeroLook = { body: "#9d9d9d", far: "#6f6f6f", ink: "#0b0b0d", glow: 0, glowColor: "#ffffff" };

const Limb: React.FC<{ pts: V[]; w: number; ink: string; fill: string; ol: number }> = ({ pts, w, ink, fill, ol }) => {
  const d = poly(...pts);
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={ink} strokeWidth={w + ol * 2} />
      <path d={d} stroke={fill} strokeWidth={w} />
    </g>
  );
};

/** two dot eyes on the head, turned with the head angle */
const eyes = (j: Joints, L: HeroLook) => {
  const R = BONE.head * (L.head ?? 1), dx = j.head[0] - j.neck[0], dy = j.head[1] - j.neck[1], n = Math.hypot(dx, dy) || 1;
  const up: V = [dx / n, dy / n], fw: V = [-up[1], up[0]];
  const offs = L.eyes === "front" ? [-0.3, 0.3] : [0.2, 0.62], v = 0.1 - (L.eyeDown ?? 0);
  return offs.map((o, i) => (
    <ellipse key={i} cx={j.head[0] + fw[0] * o * R + up[0] * v * R} cy={j.head[1] + fw[1] * o * R + up[1] * v * R} rx={R * 0.13} ry={R * 0.17} fill={L.eyeColor ?? "#101012"} />
  ));
};

export type HeroProps = {
  x: number; y: number; // where the root is on screen
  pose: Pose;
  s?: number; // scale
  flip?: boolean; // face left
  look?: HeroLook;
  /** extra drawing in LOCAL coordinates after the body (things held in hands): gets the solved joints */
  hold?: (j: Joints) => React.ReactNode;
  /** drawn before the far limbs (a backpack, a cape) */
  behind?: (j: Joints) => React.ReactNode;
  shadow?: number; // contact shadow opacity (0 = none)
  rot?: number; // whole-body rotation about the root, degrees (falls, flips)
  opacity?: number;
};

export const Hero: React.FC<HeroProps> = ({ x, y, pose, s = 1, flip, look = LOOK_WHITE, hold, behind, shadow = 0.35, rot = 0, opacity = 1 }) => {
  const id = React.useId().replace(/:/g, "");
  const j = solvePose(pose);
  const L = { ...LOOK_WHITE, ...look };
  const w = BONE.width * (L.width ?? 1), ol = BONE.outline, ink = L.ink!;
  const shade = `${id}sh`;
  const body = (glowPass: boolean) => {
    const near = glowPass ? L.glowColor! : L.body!, far = glowPass ? L.glowColor! : L.far!, k = glowPass ? "transparent" : ink;
    const ww = glowPass ? w + 10 : w;
    return (
      <g>
        <Limb pts={[j.hip, j.kF, j.aF]} w={ww * 0.96} ink={k} fill={far} ol={ol} />
        <Limb pts={[j.sh, j.eF, j.wF]} w={ww * 0.9} ink={k} fill={far} ol={ol} />
        <Limb pts={[j.hip, j.sh, j.neck]} w={ww * 1.06} ink={k} fill={near} ol={ol} />
        <circle cx={j.head[0]} cy={j.head[1]} r={BONE.head * (L.head ?? 1) + (glowPass ? 6 : 0)} fill={glowPass ? near : `url(#${shade})`} stroke={k} strokeWidth={ol} />
        {!glowPass && L.eyes && eyes(j, L)}
        <Limb pts={[j.hip, j.kN, j.aN]} w={ww} ink={k} fill={near} ol={ol} />
        <Limb pts={[j.sh, j.eN, j.wN]} w={ww * 0.94} ink={k} fill={near} ol={ol} />
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`} opacity={opacity}>
      <defs>
        <radialGradient id={shade} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor={L.body} />
          <stop offset="70%" stopColor={L.body} />
          <stop offset="100%" stopColor={L.far} />
        </radialGradient>
        <filter id={`${id}gl`} x="-60%" y="-40%" width="220%" height="180%"><feGaussianBlur stdDeviation={12} /></filter>
      </defs>
      {shadow > 0 && <ellipse cx={j.hip[0] * 0.5} cy={2} rx={70} ry={9} fill="#000" opacity={shadow} />}
      <g transform={`rotate(${rot})`}>
        {L.glow! > 0 && <g filter={`url(#${id}gl)`} opacity={L.glow}>{body(true)}</g>}
        {behind?.(j)}
        {body(false)}
        {hold?.(j)}
      </g>
    </g>
  );
};

/** a walker: gives the root x and the pose for walking from x0 at `speed` px/frame (feet planted; speed ~ 5 for a walk, 12 for a run) */
export const walkerAt = (f: number, x0: number, speed: number, mode: "walk" | "run" = "walk") => {
  // distance covered by the root per turn of the cycle = how far a planted foot slides back during its stance
  const perTurn = mode === "walk" ? 2 * STRIDE : (RUN_STRIDE * 0.84) / 0.36;
  const x = x0 + f * speed, phase = (f * Math.abs(speed)) / perTurn;
  return { x, pose: mode === "walk" ? walk(phase) : run(phase), flip: speed < 0 };
};
