// Animals in the same look as the hero (white shapes, thin black outline, far limbs greyer, faint glow).
// <Animal kind="goat" x y s flip phase pose/> : a shared four-legged rig (gait from `phase`, like the hero's walk) with a head per species.
// <Bird/> flaps or perches, <Fish/> swims. (x, y) = ground point under the body (for fish/bird: the body centre).
import React from "react";
import { V, clamp, ik2, poly } from "./core";
import { LOOK_WHITE, HeroLook } from "./hero";

const OL = 3;
export type AnimalKind = "goat" | "dog" | "cat" | "horse" | "sheep";
type Spec = { bodyW: number; bodyH: number; legU: number; legL: number; legW: number; bx: number; neck: number; neckAng: number; stride: number; tail: number };
const SPECS: Record<AnimalKind, Spec> = {
  goat: { bodyW: 250, bodyH: 110, legU: 70, legL: 70, legW: 20, bx: 82, neck: 70, neckAng: 40, stride: 70, tail: 26 },
  dog: { bodyW: 200, bodyH: 84, legU: 50, legL: 50, legW: 18, bx: 62, neck: 38, neckAng: 50, stride: 60, tail: 50 },
  cat: { bodyW: 170, bodyH: 66, legU: 44, legL: 44, legW: 14, bx: 56, neck: 22, neckAng: 60, stride: 50, tail: 90 },
  horse: { bodyW: 300, bodyH: 120, legU: 100, legL: 100, legW: 22, bx: 100, neck: 130, neckAng: 32, stride: 100, tail: 90 },
  sheep: { bodyW: 220, bodyH: 120, legU: 46, legL: 46, legW: 16, bx: 66, neck: 28, neckAng: 50, stride: 50, tail: 16 },
};

export type AnimalPose = "stand" | "walk" | "run" | "sit" | "graze" | "jump";

const Cap: React.FC<{ pts: V[]; w: number; fill: string; ink: string }> = ({ pts, w, fill, ink }) => (
  <g fill="none" strokeLinecap="round" strokeLinejoin="round"><path d={poly(...pts)} stroke={ink} strokeWidth={w + OL * 2} /><path d={poly(...pts)} stroke={fill} strokeWidth={w} /></g>
);

export const Animal: React.FC<{
  kind: AnimalKind; x: number; y: number; s?: number; flip?: boolean; phase?: number; pose?: AnimalPose; f?: number;
  /** goat horns / growth 0..1 */ horns?: number; look?: HeroLook; lift?: number; shadow?: number;
}> = ({ kind, x, y, s = 1, flip, phase = 0, pose = "stand", f = 0, horns = 0.4, look = LOOK_WHITE, lift = 0, shadow = 0.35 }) => {
  const id = React.useId().replace(/:/g, "");
  const S = SPECS[kind], L = { ...LOOK_WHITE, ...look };
  const ink = L.ink!, near = L.body!, far = L.far!;
  const run = pose === "run", moving = pose === "walk" || run;
  const legH = S.legU + S.legL - 6;
  const bob = moving ? Math.abs(Math.sin(phase * Math.PI * 2)) * (run ? 14 : 4) : Math.sin(f * 0.08) * 1.5;
  const sit = pose === "sit";
  const bodyY = -legH - S.bodyH * 0.25 - bob + (sit ? 30 : 0) - lift;
  const tilt = sit ? -22 : pose === "graze" ? 6 : run ? Math.sin(phase * Math.PI * 4) * 3 : 0;
  // feet
  const stride = S.stride * (run ? 1.6 : 1);
  const foot = (p: number, base: number, front: boolean): V => {
    if (!moving) {
      if (sit && !front) return [base + 30, 0];
      if (pose === "jump") return [base + (front ? 40 : -40), -lift - 40];
      return [base, 0];
    }
    p = ((p % 1) + 1) % 1; const duty = run ? 0.4 : 0.6;
    if (p < duty) return [base + stride / 2 - (p / duty) * stride, 0];
    const t = (p - duty) / (1 - duty), e = t * t * (3 - 2 * t);
    return [base - stride / 2 + e * stride, -Math.sin(t * Math.PI) * (run ? 50 : 26)];
  };
  const rot = (p: V): V => { const a = (tilt * Math.PI) / 180, c = Math.cos(a), sn = Math.sin(a); return [p[0] * c - p[1] * sn, p[0] * sn + p[1] * c + bodyY]; };
  const hipB = rot([-S.bx, S.bodyH * 0.18]), hipF = rot([S.bx, S.bodyH * 0.18]);
  const order = run ? [0, 0.1, 0.5, 0.6] : [0, 0.5, 0.25, 0.75]; // back-near, back-far, front-near, front-far
  const legs = [
    { root: hipB, foot: foot(phase + order[0], -S.bx + 6, false), bend: 1, near: true },
    { root: hipB, foot: foot(phase + order[1], -S.bx - 6, false), bend: 1, near: false },
    { root: hipF, foot: foot(phase + order[2], S.bx + 6, true), bend: -1, near: true },
    { root: hipF, foot: foot(phase + order[3], S.bx - 6, true), bend: -1, near: false },
  ].map((l) => { const k = ik2(l.root, [l.foot[0], l.foot[1] - lift * 0], S.legU, S.legL, l.bend * (sit && l.bend > 0 ? -1 : 1)); return { ...l, knee: k.mid, end: k.end }; });
  const graze = pose === "graze";
  const neckBase = rot([S.bodyW * 0.38, -S.bodyH * 0.2]);
  const na = ((graze ? -50 : S.neckAng + (moving ? Math.sin(phase * Math.PI * 4) * 4 : Math.sin(f * 0.05) * 3)) * Math.PI) / 180;
  const headP: V = [neckBase[0] + Math.cos(na) * S.neck * (graze ? 1.6 : 1), neckBase[1] - Math.sin(na) * S.neck * (graze ? 1.6 : 1)];
  const tailBase = rot([-S.bodyW * 0.48, -S.bodyH * 0.2]);
  const wag = kind === "dog" ? Math.sin(f * 0.6) * 25 : Math.sin(f * 0.07) * 8;

  const legDraw = (l: (typeof legs)[number]) => (
    <g key={`${l.near}${l.bend}`}>
      <Cap pts={[l.root, l.knee, l.end]} w={S.legW} fill={l.near ? near : far} ink={ink} />
      <ellipse cx={l.end[0] + (kind === "horse" || kind === "goat" ? 2 : 6)} cy={l.end[1] - 2} rx={S.legW * 0.62} ry={S.legW * 0.42} fill={kind === "horse" || kind === "goat" ? "#2a2a2e" : l.near ? near : far} stroke={ink} strokeWidth={2.5} />
    </g>
  );
  const tail = () => {
    const a = ((kind === "cat" ? 70 : kind === "dog" ? 40 + wag : kind === "horse" ? -70 + wag * 0.5 : 30 + wag) * Math.PI) / 180;
    if (kind === "cat") { const p1: V = [tailBase[0] - 40, tailBase[1] - 40], p2: V = [tailBase[0] - 20 + Math.sin(f * 0.06) * 14, tailBase[1] - S.tail]; return <path d={`M${tailBase[0]} ${tailBase[1]} Q${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]}`} fill="none" stroke={ink} strokeWidth={14 + OL * 2} strokeLinecap="round" />; }
    const end: V = [tailBase[0] - Math.cos(a) * S.tail, tailBase[1] - Math.sin(a) * S.tail];
    if (kind === "horse") return <path d={`M${tailBase[0]} ${tailBase[1]} Q${tailBase[0] - 50} ${tailBase[1] + 10} ${end[0] - 10} ${end[1] + 60}`} fill="none" stroke="#3a3a40" strokeWidth={26} strokeLinecap="round" />;
    return <Cap pts={[tailBase, end]} w={kind === "dog" ? 12 : 14} fill={near} ink={ink} />;
  };
  const tailFill = kind === "cat" ? <path d={`M${tailBase[0]} ${tailBase[1]} Q${tailBase[0] - 40} ${tailBase[1] - 40} ${tailBase[0] - 20 + Math.sin(f * 0.06) * 14} ${tailBase[1] - S.tail}`} fill="none" stroke={near} strokeWidth={14} strokeLinecap="round" /> : null;

  const head = () => {
    const [hx, hy] = headP, dir = graze ? 40 : 0;
    switch (kind) {
      case "goat": {
        const hl = horns;
        return (
          <g transform={`translate(${hx} ${hy}) rotate(${dir + 18})`}>
            {hl > 0 && <path d={`M-14 -22 Q${-30 - 40 * hl} ${-60 - 70 * hl} ${-70 - 60 * hl} ${-20 - 30 * hl * hl}`} fill="none" stroke={ink} strokeWidth={10 + 8 * hl + OL * 2} strokeLinecap="round" />}
            {hl > 0 && <path d={`M-14 -22 Q${-30 - 40 * hl} ${-60 - 70 * hl} ${-70 - 60 * hl} ${-20 - 30 * hl * hl}`} fill="none" stroke="#dcdcd6" strokeWidth={10 + 8 * hl} strokeLinecap="round" />}
            <path d="M-34 -6 L-64 4 L-36 10 Z" fill={near} stroke={ink} strokeWidth={OL} strokeLinejoin="round" />
            <path d="M-28 -26 Q20 -40 58 -8 Q66 8 50 18 Q10 26 -26 14 Q-40 -6 -28 -26 Z" fill={near} stroke={ink} strokeWidth={OL} />
            <path d="M40 16 Q36 40 26 50 Q22 30 24 18" fill={near} stroke={ink} strokeWidth={OL} strokeLinejoin="round" />
            <circle cx={12} cy={-10} r={4.5} fill={ink} />
          </g>
        );
      }
      case "dog": return (
        <g transform={`translate(${hx} ${hy}) rotate(${dir})`}>
          <circle cx={0} cy={0} r={34} fill={near} stroke={ink} strokeWidth={OL} />
          <path d="M18 -10 Q60 -8 62 10 Q58 26 22 22 Z" fill={near} stroke={ink} strokeWidth={OL} strokeLinejoin="round" />
          <ellipse cx={60} cy={4} rx={8} ry={7} fill={ink} />
          <path d="M-20 -26 Q-44 -10 -36 30 Q-22 26 -10 -4 Z" fill="#7a7a80" stroke={ink} strokeWidth={OL} strokeLinejoin="round" transform={`rotate(${Math.sin(f * 0.2) * 6} -20 -26)`} />
          <circle cx={10} cy={-8} r={5} fill={ink} />
        </g>
      );
      case "cat": return (
        <g transform={`translate(${hx} ${hy}) rotate(${dir})`}>
          <path d="M-22 -18 L-26 -50 L-4 -28 Z M8 -28 L26 -50 L24 -16 Z" fill={near} stroke={ink} strokeWidth={OL} strokeLinejoin="round" />
          <ellipse cx={0} cy={0} rx={34} ry={30} fill={near} stroke={ink} strokeWidth={OL} />
          <circle cx={12} cy={-4} r={4.5} fill={ink} /><circle cx={-8} cy={-4} r={4.5} fill={ink} opacity={0.6} />
          <path d="M28 8 L56 2 M28 12 L56 16" stroke={ink} strokeWidth={2} />
        </g>
      );
      case "horse": return (
        <g transform={`translate(${hx} ${hy}) rotate(${dir + 34})`}>
          <path d="M-20 -30 L-10 -58 L4 -30 Z" fill={near} stroke={ink} strokeWidth={OL} strokeLinejoin="round" />
          <path d="M-30 -30 Q10 -42 80 -6 Q96 6 84 22 Q40 30 -24 18 Q-40 -8 -30 -30 Z" fill={near} stroke={ink} strokeWidth={OL} />
          <circle cx={4} cy={-14} r={5} fill={ink} /><ellipse cx={80} cy={8} rx={4} ry={3} fill={ink} />
        </g>
      );
      case "sheep": return (
        <g transform={`translate(${hx} ${hy}) rotate(${dir})`}>
          <ellipse cx={-14} cy={-6} rx={18} ry={8} fill="#3a3a40" stroke={ink} strokeWidth={2.5} transform="rotate(-30 -14 -6)" />
          <ellipse cx={10} cy={4} rx={30} ry={22} fill="#3a3a40" stroke={ink} strokeWidth={OL} />
          {[-16, -2, 12].map((k, i) => <circle key={i} cx={k} cy={-20} r={13} fill={near} stroke={ink} strokeWidth={2.5} />)}
          <circle cx={20} cy={-2} r={4} fill="#fff" />
        </g>
      );
    }
  };
  const bodyShape = kind === "sheep"
    ? <g transform={`translate(0 ${bodyY}) rotate(${tilt})`}>{Array.from({ length: 11 }, (_, i) => { const a = (i / 11) * Math.PI * 2; return <circle key={i} cx={Math.cos(a) * S.bodyW * 0.38} cy={Math.sin(a) * S.bodyH * 0.32} r={S.bodyH * 0.3} fill={near} stroke={ink} strokeWidth={OL} />; })}<ellipse cx={0} cy={0} rx={S.bodyW * 0.42} ry={S.bodyH * 0.36} fill={near} /></g>
    : <g transform={`translate(0 ${bodyY}) rotate(${tilt})`}><ellipse cx={0} cy={0} rx={S.bodyW / 2} ry={S.bodyH / 2} fill={`url(#${id}b)`} stroke={ink} strokeWidth={OL} /></g>;
  const neckW = kind === "horse" ? 46 : kind === "goat" ? 34 : 30;
  const all = (
    <g>
      {legs.filter((l) => !l.near).map(legDraw)}
      {tail()}{tailFill}
      {kind === "horse" && <path d={`M${neckBase[0] - 10} ${neckBase[1] - 10} Q${(neckBase[0] + headP[0]) / 2 - 30} ${(neckBase[1] + headP[1]) / 2 - 30} ${headP[0] - 20} ${headP[1] - 20}`} fill="none" stroke="#3a3a40" strokeWidth={26} strokeLinecap="round" />}
      {kind !== "sheep" && kind !== "cat" && <Cap pts={[neckBase, headP]} w={neckW} fill={near} ink={ink} />}
      {bodyShape}
      {kind === "cat" && <Cap pts={[neckBase, headP]} w={neckW} fill={near} ink={ink} />}
      {legs.filter((l) => l.near).map(legDraw)}
      {head()}
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
      <defs>
        <radialGradient id={`${id}b`} cx="40%" cy="30%" r="80%"><stop offset="0%" stopColor={near} /><stop offset="65%" stopColor={near} /><stop offset="100%" stopColor={far} /></radialGradient>
        <filter id={`${id}g`} x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation={12} /></filter>
      </defs>
      {shadow > 0 && <ellipse cx={0} cy={2} rx={S.bodyW * 0.6 * (1 - clamp(lift / 400) * 0.5)} ry={12} fill="#000" opacity={shadow * (1 - clamp(lift / 400) * 0.6)} />}
      {L.glow! > 0 && <g filter={`url(#${id}g)`} opacity={L.glow! * 0.8}><ellipse cx={0} cy={bodyY} rx={S.bodyW * 0.55} ry={S.bodyH * 0.6} fill={L.glowColor} /></g>}
      {all}
    </g>
  );
};

/** a bird: flying (flap phase in turns) or perched; facing +x */
export const Bird: React.FC<{ x: number; y: number; s?: number; flap?: number; perched?: boolean; flip?: boolean; color?: string; f?: number }> = ({ x, y, s = 1, flap = 0, perched, flip, color = "#f4f4f2", f = 0 }) => {
  const w = perched ? -0.15 : Math.sin(flap * Math.PI * 2);
  const wing = (k: number) => <path d={`M-6 -4 Q${-16} ${-60 * w * k - 10} ${-44} ${-90 * w * k - 6} Q${-20} ${-30 * w * k} 18 -2 Z`} fill={k > 0.9 ? color : "#bdbdbd"} stroke={LOOK_WHITE.ink} strokeWidth={2.5} strokeLinejoin="round" />;
  const hop = perched ? Math.max(0, Math.sin(f * 0.3)) * 0 : 0;
  return (
    <g transform={`translate(${x} ${y - hop}) scale(${(flip ? -1 : 1) * s} ${s})`}>
      {wing(0.8)}
      <path d="M-40 4 L-62 -6 L-60 12 Z" fill={color} stroke={LOOK_WHITE.ink} strokeWidth={2.5} strokeLinejoin="round" />
      <ellipse cx={0} cy={0} rx={38} ry={20} fill={color} stroke={LOOK_WHITE.ink} strokeWidth={OL} />
      <circle cx={30} cy={-14} r={16} fill={color} stroke={LOOK_WHITE.ink} strokeWidth={OL} />
      <path d="M44 -16 L60 -10 L44 -6 Z" fill="#f0b030" stroke={LOOK_WHITE.ink} strokeWidth={2} strokeLinejoin="round" />
      <circle cx={34} cy={-17} r={3} fill={LOOK_WHITE.ink} />
      {wing(1)}
      {perched && <path d="M-4 18 L-6 34 M8 18 L8 34" stroke={LOOK_WHITE.ink} strokeWidth={3} />}
    </g>
  );
};

/** a fish swimming toward +x; f drives the tail wag */
export const Fish: React.FC<{ x: number; y: number; s?: number; f?: number; flip?: boolean; color?: string; belly?: string }> = ({ x, y, s = 1, f = 0, flip, color = "#c8d2dc", belly = "#f0f4f8" }) => {
  const wag = Math.sin(f * 0.35) * 14;
  return (
    <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`} stroke={LOOK_WHITE.ink} strokeWidth={OL} strokeLinejoin="round">
      <path d={`M-58 0 L${-96} ${-30 + wag} L${-90} ${30 + wag} Z`} fill={color} />
      <path d="M-10 -22 Q4 -44 22 -24 Z" fill={color} />
      <path d="M-62 0 Q-30 -36 20 -30 Q62 -20 70 0 Q62 22 20 28 Q-30 34 -62 0 Z" fill={color} />
      <path d="M-50 6 Q-20 26 20 24 Q56 18 66 4 Q30 14 -50 6 Z" fill={belly} strokeWidth={0} />
      <path d="M30 -24 Q40 0 30 24" fill="none" strokeWidth={2} />
      <circle cx={46} cy={-6} r={6} fill="#fff" strokeWidth={2} /><circle cx={47} cy={-6} r={3} fill={LOOK_WHITE.ink} stroke="none" />
      <path d={`M-10 10 Q0 ${22 + wag * 0.3} 10 12`} fill={color} strokeWidth={2} />
    </g>
  );
};

/** helper: gait phase for an animal walking at `speed` px/frame (feet stay planted) */
export const gaitPhase = (f: number, speed: number, kind: AnimalKind, run = false) => {
  const S = SPECS[kind], stride = S.stride * (run ? 1.6 : 1), duty = run ? 0.4 : 0.6;
  return (f * Math.abs(speed)) / (stride / duty);
};
export const ANIMAL_SPECS = SPECS;
