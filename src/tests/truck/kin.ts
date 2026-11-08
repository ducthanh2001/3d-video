// Kinematics of the truck scene as pure functions of the frame. The stick figure keeps its bone lengths (BONE from the stick test):
// every limb is stored as ANGLES (arms and legs from straight down, + = forward) so poses can be blended without stretching a bone.
// Phases: driving (IK to the wheel and pedals) -> startle -> thrown out by the blast (ballistic hip + spin + flailing limbs)
// -> tumble and slide on the road -> lying on his back -> sitting up -> looking at the wreck and scratching his head.
import { ik2, V } from "../../flat/rig/rig";
import { BONE } from "../stick/motion";
import { BLAST, F, F_LAND, FLOOR_Y, SHAKES, SLIDE, V as SPEED, WRECK_DECEL } from "./events";

const PI = Math.PI, D = PI / 180;
export const sm = (x: number) => { const t = Math.min(1, Math.max(0, x)); return t * t * (3 - 2 * t); };
const ramp = (f: number, a: number, b: number) => sm((f - a) / (b - a));
const easeOut = (x: number) => { const t = Math.min(1, Math.max(0, x)); return 1 - (1 - t) * (1 - t); };

export type A2 = [number, number];
export type Pose = { hip: V; torso: number; head: number; armL: A2; armR: A2; legL: A2; legR: A2; toeL: number; toeR: number };
export type Joints = { hip: V; kneeL: V; ankleL: V; toeL: V; kneeR: V; ankleR: V; toeR: V; shoulder: V; neck: V; head: V; elbowL: V; wristL: V; elbowR: V; wristR: V };

const dirDown = (a: number): V => [Math.sin(a), Math.cos(a)];
export const joints = (p: Pose): Joints => {
  const sh: V = [p.hip[0] + BONE.torso * Math.sin(p.torso), p.hip[1] - BONE.torso * Math.cos(p.torso)];
  const nk: V = [sh[0] + BONE.neck * Math.sin(p.head), sh[1] - BONE.neck * Math.cos(p.head)];
  const hd: V = [nk[0] + BONE.head * Math.sin(p.head), nk[1] - BONE.head * Math.cos(p.head)];
  const chain = (root: V, a: A2, l1: number, l2: number): [V, V] => { const d1 = dirDown(a[0]), m: V = [root[0] + l1 * d1[0], root[1] + l1 * d1[1]], d2 = dirDown(a[1]); return [m, [m[0] + l2 * d2[0], m[1] + l2 * d2[1]]]; };
  const [eL, wL] = chain(sh, p.armL, BONE.uArm, BONE.fArm), [eR, wR] = chain(sh, p.armR, BONE.uArm, BONE.fArm);
  const [kL, aL] = chain(p.hip, p.legL, BONE.thigh, BONE.shin), [kR, aR] = chain(p.hip, p.legR, BONE.thigh, BONE.shin);
  const toe = (a: V, t: number): V => [a[0] + BONE.foot * Math.cos(t), a[1] - BONE.foot * Math.sin(t)];
  return { hip: p.hip, kneeL: kL, ankleL: aL, toeL: toe(aL, p.toeL), kneeR: kR, ankleR: aR, toeR: toe(aR, p.toeR), shoulder: sh, neck: nk, head: hd, elbowL: eL, wristL: wL, elbowR: eR, wristR: wR };
};

/** blend two poses by angle (an angle channel is moved the short way round: `near`), so no bone ever changes length */
const near = (cur: number, target: number) => target + 2 * PI * Math.round((cur - target) / (2 * PI));
const mixA = (a: number, b: number, t: number) => a + (near(a, b) - a) * t;
const mix2 = (a: A2, b: A2, t: number): A2 => [mixA(a[0], b[0], t), mixA(a[1], b[1], t)];
export const blend = (a: Pose, b: Pose, t: number): Pose => ({
  hip: [a.hip[0] + (b.hip[0] - a.hip[0]) * t, a.hip[1] + (b.hip[1] - a.hip[1]) * t], torso: mixA(a.torso, b.torso, t), head: mixA(a.head, b.head, t),
  armL: mix2(a.armL, b.armL, t), armR: mix2(a.armR, b.armR, t), legL: mix2(a.legL, b.legL, t), legR: mix2(a.legR, b.legR, t), toeL: mixA(a.toeL, b.toeL, t), toeR: mixA(a.toeR, b.toeR, t),
});

// ---------------------------------------------------------------- the truck
export const truckX = (f: number) => SPEED * f; // world x of the truck origin (continues as a "virtual" truck after the strike: the camera uses it)
const bobRaw = (f: number) => 2.4 * Math.sin(f * 0.8) + 1.2 * Math.sin(f * 2.1);
export const bob = (f: number) => (f < F.hit ? bobRaw(f) : 0);
export const WHEEL_R = 46;
export const wheelAngle = (f: number) => truckX(Math.min(f, F.hit)) / WHEEL_R; // rolling without slipping: angle = distance / radius

// ---------------------------------------------------------------- the driver
const ikAngles = (root: V, target: V, l1: number, l2: number, bend: 1 | -1): { a: A2; end: V } => {
  const { mid, end } = ik2(root, target, l1, l2, bend);
  return { a: [Math.atan2(mid[0] - root[0], mid[1] - root[1]), Math.atan2(end[0] - mid[0], end[1] - mid[1])], end };
};
export const SEAT = { dx: 26, h: 108 }; // the hip is 108 px above the road, 26 px in front of the truck origin

export const drivePose = (f: number): Pose => {
  const b = bobRaw(f), hip: V = [truckX(f) + SEAT.dx, FLOOR_Y - SEAT.h + b];
  const torso = 0.07 + 0.012 * Math.sin(f * 0.5) - 0.23 * ramp(f, F.startle - 1, F.startle + 4); // upright, jerks back when he sees it
  const head = -0.05 + 0.03 * Math.sin(f * 0.37 + 1) - 0.6 * ramp(f, F.notice, F.notice + 6); // looks up at the sky
  const sh: V = [hip[0] + BONE.torso * Math.sin(torso), hip[1] - BONE.torso * Math.cos(torso)];
  const wheel: V = [truckX(f) + 92, FLOOR_Y - 190 + b];
  const aN = ikAngles(sh, [wheel[0] - 2, wheel[1] + 6], BONE.uArm, BONE.fArm, 1).a, aF = ikAngles(sh, [wheel[0] + 6, wheel[1] - 4], BONE.uArm, BONE.fArm, 1).a;
  const lN = ikAngles(hip, [hip[0] + 92, FLOOR_Y - 82.5 + b], BONE.thigh, BONE.shin, -1).a, lF = ikAngles(hip, [hip[0] + 102, FLOOR_Y - 82.5 + b], BONE.thigh, BONE.shin, -1).a;
  const base: Pose = { hip, torso, head, armL: aN, armR: aF, legL: lN, legR: lF, toeL: 0, toeR: 0 };
  const up: Pose = { ...base, armL: [2.4, 2.8], armR: [2.1, 2.6], legL: [2.0, 0.4], legR: [1.8, 0.2] }; // hands up, knees pulled up
  return blend(base, up, ramp(f, F.startle, F.startle + 7));
};

/** the blast: hip is ballistic, the whole body spins forward, the limbs flail (angles relative to the body, then turned by the spin) */
const flightHip = (t: number): V => {
  const d = drivePoseHip();
  return [d[0] + BLAST.vx * t, d[1] + BLAST.vy * t + 0.5 * BLAST.g * t * t];
};
const drivePoseHip = (): V => [truckX(F.hit) + SEAT.dx, FLOOR_Y - SEAT.h + bobRaw(F.hit)];
const body = (r: number, t: number, flail: number, rest: { arm: number; leg: number }): Pose["armL"][] => {
  // the flail starts from the pose he already has when the blast hits (hands up, knees up) and swings slowly (period ~20 frames)
  const w = (a: number, b: number) => b * flail + a * (1 - flail), s = (ph: number) => Math.sin(0.3 * t + ph);
  return [
    [-r + w(rest.arm, 2.4 + 0.45 * s(0)), -r + w(rest.arm, 2.8 + 0.45 * s(0.4))],
    [-r + w(rest.arm, 2.1 + 0.45 * s(2)), -r + w(rest.arm, 2.6 + 0.45 * s(2.4))],
    [-r + w(rest.leg, 2.0 + 0.5 * s(1)), -r + w(rest.leg, 0.4 + 0.4 * s(1.5))],
    [-r + w(rest.leg, 1.8 + 0.5 * s(3)), -r + w(rest.leg, 0.2 + 0.4 * s(3.5))],
  ];
};
const flightPose = (f: number): Pose => {
  const t = f - F.hit, r = (4 + BLAST.spin * t) * D, [aL, aR, lL, lR] = body(r, t, 1, { arm: 0, leg: 0 });
  return { hip: flightHip(t), torso: r, head: r - 0.15 + 0.2 * Math.sin(0.8 * t), armL: aL, armR: aR, legL: lL, legR: lR, toeL: -r, toeR: -r };
};

const R_LAND = (4 + BLAST.spin * (F_LAND - F.hit)) * D; // spin at touchdown (272 deg)
const H_LAND = FLOOR_Y - flightHip(F_LAND - F.hit)[1]; // hip height above the road at touchdown
const R_LIE = 276 * D; // lying on his back, head toward -x (and slightly raised: the head disc rests on the road), feet toward +x
const T_STOP = BLAST.vx / SLIDE.decel;
const slideDist = (u: number) => { const x = Math.min(u, T_STOP); return BLAST.vx * x - 0.5 * SLIDE.decel * x * x; };
export const LAND_X = flightHip(F_LAND - F.hit)[0];
export const LIE_X = LAND_X + slideDist(1e9);

const tumblePose = (f: number): Pose => {
  const u = f - F_LAND, t = f - F.hit, e = easeOut(u / SLIDE.lie), flail = 1 - easeOut(u / 12);
  const r = R_LAND + (R_LIE - R_LAND) * e;
  const [aL, aR, lL, lR] = body(r, t, flail, { arm: 0.12, leg: 0.04 });
  const hipH = 12 + (H_LAND - 12) * (1 - e) + 12 * Math.sin(PI * Math.min(u, 10) / 10) * Math.exp(-u / 8);
  return { hip: [LAND_X + slideDist(u), FLOOR_Y - hipH], torso: r, head: r + 0.35 * e, armL: aL, armR: aR, legL: lL, legR: lR, toeL: -r + 0.2, toeR: -r + 0.2 };
};

// resting poses in WORLD angles (explicit, because the legs must stay on the road while the torso comes up)
const LEG_W = 90 * D; // legs point toward +x along the road
const liePose = (f: number): Pose => {
  const br = Math.sin((f - F_LAND) * 0.16);
  return { hip: [LIE_X, FLOOR_Y - 12 + 0.6 * br], torso: R_LIE + 0.01 * br, head: R_LIE + 0.35, armL: [LEG_W + 0.1, LEG_W + 0.16], armR: [LEG_W + 0.04, LEG_W + 0.1], legL: [LEG_W + 0.02, LEG_W + 0.08], legR: [LEG_W - 0.04, LEG_W + 0.02], toeL: 1.15, toeR: 1.25 };
};
const sitPose = (f: number): Pose => {
  const s = ramp(f, F.sitUp, F.sitUp + 34), lk = ramp(f, F.look, F.look + 14);
  const torso = R_LIE + (372 * D - R_LIE) * s - 0.1 * lk, br = Math.sin(f * 0.15);
  const hip: V = [LIE_X, FLOOR_Y - 12 + 6 * s], lie = liePose(F.sitUp);
  // while he sits up the arms swing (straight) from lying along his body to propped behind him; straight arms have no elbow branch to flip
  const k = ramp(s, 0.15, 0.95), propL: A2 = [-0.55, -0.5], propR: A2 = [-0.5, -0.45];
  const curl = -1.8 * Math.sin(PI * Math.pow(k, 0.7)); // the forearm folds while the arm swings down past the road, then straightens
  const armL: A2 = [mixA(lie.armL[0], propL[0], k), mixA(lie.armL[1], propL[1], k) + curl];
  const scratch = Math.sin((f - F.look) * 0.8) * 0.3 * lk;
  const armR: A2 = [mixA(mixA(lie.armR[0], propR[0], k), 2.7, lk), mixA(mixA(lie.armR[1], propR[1], k) + curl, 3.2 + scratch, lk)];
  return { hip, torso, head: torso + 0.35 * (1 - s) - 0.05 * s + 0.12 * lk + 0.02 * br, armL, armR, legL: [LEG_W - 0.02, LEG_W + 0.06 + 0.1 * s], legR: [LEG_W - 0.08, LEG_W - 0.02 + 0.1 * s], toeL: 1.2 - 0.3 * s, toeR: 1.2 - 0.3 * s };
};

export const driverPose = (f: number): Pose => {
  if (f < F.hit) return drivePose(f);
  if (f < F.hit + 6) return blend(drivePose(F.hit - 1), flightPose(f), sm((f - F.hit + 1) / 7)); // a short blend out of the seat
  if (f < F_LAND) return flightPose(f);
  if (f < F_LAND + SLIDE.lie) return tumblePose(f);
  if (f < F.sitUp) return liePose(f);
  return sitPose(f);
};
export const driverJoints = (f: number): Joints => joints(driverPose(f));

// ---------------------------------------------------------------- wreck, camera, shake
export const WRECK_STOP = SPEED / WRECK_DECEL; // frames until the coasting wreck stops
export const wreckX = (f: number): number => { const t = Math.min(Math.max(0, f - F.hit), WRECK_STOP); return truckX(F.hit) + SPEED * t - 0.5 * WRECK_DECEL * t * t; };
export const WRECK_FINAL = wreckX(1e6);
const CAM_FINAL = (WRECK_FINAL + LIE_X) / 2 - 540;
const follow = (f: number) => { let s = 0; for (let k = 0; k < 12; k++) s += truckX(f - k) / 12; return s - 420; };
/** camera x: the sliding mean of the truck over 12 frames; after the strike it eases onto the spot that frames both the wreck and the man */
export const cameraX = (f: number): number => (f <= F.hit ? follow(f) : follow(f) + (CAM_FINAL - follow(f)) * sm((f - F.hit) / 46));
export const shakeAt = (f: number): { dx: number; dy: number } => {
  let dx = 0, dy = 0;
  for (const [c, amp] of SHAKES) { const u = f - c; if (u >= 0 && u < 7) { const k = (1 - u / 7) * amp, s = u % 2 ? 1 : -1; dx += s * k; dy += -s * k * 0.7; } }
  if (f < F.hit) dy += 0.8 * Math.sin(f * 1.9); // the engine's vibration
  return { dx, dy };
};

// ---------------------------------------------------------------- meteor (world coordinates)
export const HIT_W: V = [truckX(F.hit) - 20, FLOOR_Y - 200]; // where it strikes: the middle of the cargo box
const DIR: V = [0.5, -0.866];
const meteorU = (f: number) => Math.min(1, Math.max(0, (f - F.meteor) / (F.hit - F.meteor)));
export const meteorAt = (f: number): { p: V; r: number; u: number } => {
  const u = meteorU(f), len = 2300 * Math.pow(1 - u, 1.45); // accelerates toward the strike
  return { p: [HIT_W[0] + DIR[0] * len, HIT_W[1] + DIR[1] * len], r: 12 + 44 * u * u, u };
};

/** ballistic flight with up to three bounces (closed form: pure function of t) and rolling friction afterwards */
export const ballistic = (x0: number, y0: number, vx: number, vy: number, g: number, gy: number, t: number, rest = 0.38): { x: number; y: number; air: boolean } => {
  let x = x0, y = y0, vyc = vy, vxc = vx, tt = t;
  for (let b = 0; b < 3; b++) {
    const disc = vyc * vyc + 2 * g * (gy - y), tau = (-vyc + Math.sqrt(Math.max(0, disc))) / g;
    if (tt <= tau) return { x: x + vxc * tt, y: y + vyc * tt + 0.5 * g * tt * tt, air: true };
    tt -= tau; x += vxc * tau; y = gy; vyc = -(vyc + g * tau) * rest; vxc *= 0.78;
    if (Math.abs(vyc) < 1.8) break;
  }
  const roll = Math.min(tt, 30);
  return { x: x + vxc * roll - 0.5 * (vxc / 30) * roll * roll, y: gy, air: false };
};
