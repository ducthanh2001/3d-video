// Stick-figure kinematics as PURE functions of the frame number (Remotion renders every frame on its own): feet pinned to the
// contact table (events.ts), hip from a monotone curve, hip height from the planted feet (inverted pendulum, lowered whenever a
// foot would be out of reach), torso lean / head / arms from phase curves, camera = sliding mean of the hip over 12 frames.
// Bones never change length: legs are 2-bone IK (src/flat/rig ik2), arms and torso are forward kinematics.
import { ik2, V } from "../../flat/rig/rig";
import { CONTACTS, VIRTUAL, LIFT_OVERRIDE, SWING, SHAKES, FLOOR_Y, SCREEN_X, Contact, Foot } from "./events";

export const BONE = { head: 26, neck: 16, torso: 120, uArm: 70, fArm: 70, thigh: 96, shin: 96, foot: 22, stroke: 9 };
export const ANKLE = 4.5; // ankle height above the floor line (the 9 px foot stroke sits on the floor)
export const REACH = BONE.thigh + BONE.shin - 2; // maximum leg reach = thigh + shin - 2 px
const R_WALK = 182; // inverted-pendulum radius for the hip height: stays below REACH so a leg is never fully straight

const sm = (x: number) => { const t = Math.min(1, Math.max(0, x)); return t * t * (3 - 2 * t); };
const ramp = (f: number, a: number, b: number) => sm((f - a) / (b - a));
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

// ---------------------------------------------------------------- feet
type Seg = { c: number; x: number; lift: number; n: number; next?: Seg };
const buildFoot = (foot: Foot): Seg[] => {
  const mine = [...VIRTUAL, ...CONTACTS].filter((q) => q.foot === foot).sort((a, b) => a.f - b.f);
  const opp = [...VIRTUAL, ...CONTACTS].filter((q) => q.foot !== foot).sort((a, b) => a.f - b.f);
  const segs: Seg[] = mine.map((q: Contact, i) => {
    const o = opp.find((p) => p.f > q.f);
    const lift = i === mine.length - 1 ? Infinity : LIFT_OVERRIDE[q.n] ?? (o ? o.f + 2 : Infinity);
    return { c: q.f, x: q.x, lift, n: q.n };
  });
  segs.forEach((s, i) => (s.next = segs[i + 1]));
  return segs;
};
const FEET: Record<Foot, Seg[]> = { L: buildFoot("L"), R: buildFoot("R") };

export type FootState = { x: number; y: number; pitch: number; pinned: boolean };
/** world x of the ankle, its height above the ankle plane, the foot pitch (rad, + = toe up) and whether it is planted */
export const footAt = (foot: Foot, f: number): FootState => {
  const segs = FEET[foot];
  let seg = segs[0];
  for (const s of segs) if (f >= s.c) seg = s;
  if (f < seg.lift || !seg.next) return { x: seg.x, y: 0, pitch: 0, pinned: true };
  const nx = seg.next, u = clamp((f - seg.lift) / (nx.c - seg.lift), 0, 1), st = SWING[nx.n] ?? { peak: 34 };
  const s = st.brake ? sm(Math.pow(u, 0.7)) : sm(u); // the trapped foot spends its speed early and stops against the tile; every other swing eases in and out
  const x = seg.x + (nx.x - seg.x) * s;
  const y = st.peak * Math.pow(Math.sin(Math.PI * u), 0.9);
  const pitch = u < 0.3 ? -0.6 * Math.sin((Math.PI * u) / 0.3) : 0.35 * Math.sin((Math.PI * (u - 0.3)) / 0.7);
  return { x, y, pitch, pinned: false };
};

// ---------------------------------------------------------------- hip
/** monotone cubic Hermite interpolation (Fritsch-Carlson): smooth, never overshoots */
const mono = (keys: [number, number][]) => {
  const n = keys.length, h: number[] = [], d: number[] = [], m: number[] = new Array(n).fill(0);
  for (let i = 0; i < n - 1; i++) { h.push(keys[i + 1][0] - keys[i][0]); d.push((keys[i + 1][1] - keys[i][1]) / h[i]); }
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
    if (s > 9) { const t = 3 / Math.sqrt(s); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
  }
  return (x: number) => {
    if (x <= keys[0][0]) return keys[0][1] + m[0] * (x - keys[0][0]);
    if (x >= keys[n - 1][0]) return keys[n - 1][1] + m[n - 1] * (x - keys[n - 1][0]);
    let i = 0; while (x > keys[i + 1][0]) i++;
    const t = (x - keys[i][0]) / h[i], t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * keys[i][1] + (t3 - 2 * t2 + t) * h[i] * m[i] + (-2 * t3 + 3 * t2) * keys[i + 1][1] + (t3 - t2) * h[i] * m[i + 1];
  };
};
/** the hip is midway between the feet at every contact; it hardly moves while the balance is found (86-98) */
const hipXf = mono([[-18, -225], [-3, -75], [12, 75], [27, 225], [42, 375], [57, 525], [72, 645], [79, 712], [86, 790], [98, 808], [111, 975], [126, 1125], [141, 1275], [156, 1425], [171, 1575], [180, 1582]]);
export const hipX = (f: number) => hipXf(f);

const trap = (f: number, a: number, b: number, c: number, d: number) => ramp(f, a, b) * (1 - ramp(f, c, d));
/** hip height above the ankle plane */
export const hipH = (f: number): number => {
  const raw = (g: number) => {
    let h = R_WALK;
    for (const foot of ["L", "R"] as Foot[]) {
      const s = footAt(foot, g);
      if (s.pinned) { const dx = hipX(g) - s.x; h = Math.min(h, Math.sqrt(Math.max(1, R_WALK * R_WALK - dx * dx))); }
    }
    return h;
  };
  // nothing may ever be out of reach: the hip is lowered until every foot (planted or swinging) is within thigh + shin - 2 ...
  const capped = (g: number) => {
    let h = raw(g);
    for (const foot of ["L", "R"] as Foot[]) {
      const s = footAt(foot, g), dx = hipX(g) - s.x;
      h = Math.min(h, s.y + Math.sqrt(Math.max(1, (REACH - 0.5) * (REACH - 0.5) - dx * dx)));
    }
    return h;
  };
  // ... and the result is smoothed over 5 frames so the hip never bobs at a lift-off
  let H = 0;
  for (let k = -2; k <= 2; k++) H += capped(f + k) / 5;
  H -= 9 * trap(f, 72, 74, 80, 86); // the knee buckles when the toe catches
  H += 2 * Math.sin(((f - 102) / 6) * Math.PI) * trap(f, 102, 103, 107, 108); // one breath after the balance
  for (const foot of ["L", "R"] as Foot[]) { // final guard (never triggers by more than a pixel)
    const s = footAt(foot, f), dx = hipX(f) - s.x;
    H = Math.min(H, s.y + Math.sqrt(Math.max(1, REACH * REACH - dx * dx)));
  }
  return H;
};

// ---------------------------------------------------------------- torso, head, arms
/** forward lean of the torso in degrees (+ = toward +x) */
export const lean = (f: number): number => {
  if (f <= 72) return 3;
  if (f <= 75) return 3 + (-1 - 3) * sm((f - 72) / 3); // wind-up: a small pull back as the toe catches
  if (f <= 84) { const t = (f - 75) / 9; return -1 + 36 * t * t; } // pitching forward: accelerating
  if (f <= 90) return 35 - 4 * sm((f - 84) / 6);
  const at102 = 6 + 25 * Math.exp(-12 / 4.5) * Math.cos(12 * 0.42);
  if (f <= 102) { const t = f - 90; return 6 + 25 * Math.exp(-t / 4.5) * Math.cos(t * 0.42); } // balance: a damped oscillation
  if (f <= 108) return at102 * (1 - sm((f - 102) / 6)); // upright
  if (f <= 111) return 3 * sm((f - 108) / 3);
  return 3;
};
const headExtra = (f: number) => -5 - 8 * trap(f, 76, 84, 90, 104); // the head is tipped up a little when walking, looks ahead in the lunge

const gaitArm = (xFoot: number, hip: number) => -0.42 * clamp((xFoot - hip) / 75, -1.3, 1.3);
const armAngles = (f: number, hx: number, xL: number, xR: number) => {
  // gait weight: 1 while walking, fades out while the body pitches forward (74-93), fades back in once he is upright again (102-118)
  const wG = 1 - ramp(f, 74, 93) * (1 - ramp(f, 102, 118));
  // the "set" of the stumble: reaching forward, then spread out (one hand ahead, one behind) with a damped wobble (sin x exponential)
  const s = ramp(f, 86, 104), osc = f >= 90 ? 0.2 * Math.exp(-(f - 90) / 6) * Math.sin((f - 90) * 0.55) : 0;
  const setL = 1.55 * (1 - s) + (1.7 + osc) * s, setR = 1.8 * (1 - s) + (-0.5 - osc) * s;
  const gL = gaitArm(xL, hx), gR = gaitArm(xR, hx);
  const L = wG * gL + (1 - wG) * setL, R = wG * gR + (1 - wG) * setR;
  const bend = (a: number) => wG * (0.45 + (a > 0 ? 0.1 * a : 0)) + (1 - wG) * 0.12;
  return { L, R, fL: L + bend(gL), fR: R + bend(gR) };
};

export type Frame = {
  f: number; hip: V; kneeL: V; kneeR: V; ankleL: V; ankleR: V; toeL: V; toeR: V; shoulder: V; neck: V; head: V; elbowL: V; wristL: V; elbowR: V; wristR: V;
  footL: FootState; footR: FootState; legDistL: number; legDistR: number; leanDeg: number; headDeg: number;
};
const dir = (deg: number): V => [Math.sin((deg * Math.PI) / 180), -Math.cos((deg * Math.PI) / 180)];

/** every joint at frame f, in world px (x along the floor, y = screen y with the floor line at FLOOR_Y) */
export const frameJoints = (f: number): Frame => {
  const hx = hipX(f), H = hipH(f), hip: V = [hx, FLOOR_Y - ANKLE - H];
  const L = footAt("L", f), R = footAt("R", f);
  const legs = (s: FootState) => {
    const ankle: V = [s.x, FLOOR_Y - ANKLE - s.y];
    const { mid, end } = ik2(hip, ankle, BONE.thigh, BONE.shin, -1); // knee bends toward +x
    return { knee: mid, ankle: end, dist: Math.hypot(ankle[0] - hip[0], ankle[1] - hip[1]), toe: [end[0] + BONE.foot * Math.cos(s.pitch), end[1] - BONE.foot * Math.sin(s.pitch)] as V };
  };
  const lL = legs(L), lR = legs(R);
  const leanDeg = lean(f), headDeg = lean(f - 2) + headExtra(f);
  const sd = dir(leanDeg), shoulder: V = [hip[0] + BONE.torso * sd[0], hip[1] + BONE.torso * sd[1]];
  const hd = dir(headDeg), neck: V = [shoulder[0] + BONE.neck * hd[0], shoulder[1] + BONE.neck * hd[1]];
  const head: V = [neck[0] + BONE.head * hd[0], neck[1] + BONE.head * hd[1]];
  const a = armAngles(f, hx, L.x, R.x);
  const arm = (u: number, fo: number) => {
    const el: V = [shoulder[0] + BONE.uArm * Math.sin(u), shoulder[1] + BONE.uArm * Math.cos(u)];
    return { el, wr: [el[0] + BONE.fArm * Math.sin(fo), el[1] + BONE.fArm * Math.cos(fo)] as V };
  };
  const aL = arm(a.L, a.fL), aR = arm(a.R, a.fR);
  return { f, hip, kneeL: lL.knee, kneeR: lR.knee, ankleL: lL.ankle, ankleR: lR.ankle, toeL: lL.toe, toeR: lR.toe, shoulder, neck, head, elbowL: aL.el, wristL: aL.wr, elbowR: aR.el, wristR: aR.wr, footL: L, footR: R, legDistL: lL.dist, legDistR: lR.dist, leanDeg, headDeg };
};

// ---------------------------------------------------------------- camera
/** camera x: the sliding mean of the hip over the frames f-11..f (computed straight from the position function, no integration) */
export const cameraX = (f: number): number => {
  let s = 0;
  for (let k = 0; k < 12; k++) s += hipX(f - k) / 12;
  return s - SCREEN_X;
};
/** 7-frame camera shake: the sign flips every frame and the amplitude decays */
export const shakeAt = (f: number): { dx: number; dy: number } => {
  let dx = 0, dy = 0;
  for (const [c, amp] of SHAKES) {
    const u = f - c;
    if (u >= 0 && u < 7) { const k = (1 - u / 7) * amp, s = u % 2 ? 1 : -1; dx += s * k; dy += -s * k * 0.7; }
  }
  return { dx, dy };
};
