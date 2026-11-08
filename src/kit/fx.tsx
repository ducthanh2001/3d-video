// Effects for the kit: seeded particle bursts (money, debris, sparks, dust, confetti, shards, coins), light rays, speed lines,
// impact rings, sparkles, cracks and floating motes. All pure functions of the frame.
import React from "react";
import { V, clamp, rng } from "./core";

export type Particle = { x: number; y: number; rot: number; a: number; s: number; t: number; i: number; r: () => number; seed: number };
export type Burst = {
  f: number; f0: number; n: number; at: V; seed?: number;
  /** launch speed (px/frame) range and direction cone (deg, 0 = up, + = right) */
  speed?: [number, number]; dir?: number; cone?: number;
  gravity?: number; drag?: number; life?: [number, number]; spin?: number; size?: [number, number];
  /** paper-like flutter (bills, confetti) */
  flutter?: number;
  /** emit over this many frames instead of all at once */
  spread?: number;
  floor?: number; // bounce/stop at this y
  draw: (p: Particle) => React.ReactNode;
};

export const Particles: React.FC<Burst> = (b) => {
  const { f, f0, n, at, seed = 1, speed = [6, 16], dir = 0, cone = 70, gravity = 0.6, drag = 0.985, life = [30, 50], spin = 12, size = [0.8, 1.2], flutter = 0, spread = 0, floor } = b;
  const out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const r = rng(seed * 1000 + i);
    const birth = f0 + r() * spread, t = f - birth, L = life[0] + r() * (life[1] - life[0]);
    if (t < 0 || t > L) { r(); continue; }
    const ang = ((dir + (r() - 0.5) * cone) * Math.PI) / 180, v = speed[0] + r() * (speed[1] - speed[0]);
    let vx = Math.sin(ang) * v, vy = -Math.cos(ang) * v;
    // closed-form motion with drag: sum of a geometric series
    const k = drag, sumK = k === 1 ? t : (1 - Math.pow(k, t)) / (1 - k);
    let x = at[0] + vx * sumK, y = at[1] + vy * sumK + gravity * (t * t) * 0.5;
    if (flutter) { x += Math.sin(t * 0.25 + i) * flutter * Math.min(1, t / 10); y -= gravity * t * t * 0.5 * 0.7; y += t * gravity * 2.2; }
    if (floor !== undefined && y > floor) y = floor;
    const s = size[0] + r() * (size[1] - size[0]), rot = (r() - 0.5) * 2 * spin * t + r() * 360;
    const a = clamp(Math.min(t / 3, (L - t) / 10));
    vx = vy = 0;
    out.push(<g key={i}>{b.draw({ x, y, rot, a, s, t, i, r, seed })}</g>);
  }
  return <g>{out}</g>;
};

// ---------------------------------------------------------------- particle looks
export const drawBill = (p: Particle) => (
  <g transform={`translate(${p.x} ${p.y}) rotate(${p.rot}) scale(${p.s} ${p.s * Math.abs(Math.cos(p.t * 0.3 + p.i))})`} opacity={p.a}>
    <rect x={-22} y={-11} width={44} height={22} rx={3} fill="#3f8f4a" stroke="#14361a" strokeWidth={2} />
    <rect x={-17} y={-7} width={34} height={14} rx={2} fill="none" stroke="#9fd9a2" strokeWidth={1.5} opacity={0.7} />
    <circle cx={0} cy={0} r={4.5} fill="#9fd9a2" opacity={0.8} />
  </g>
);
export const drawCoin = (p: Particle) => (
  <g transform={`translate(${p.x} ${p.y}) scale(${p.s * Math.max(0.15, Math.abs(Math.cos(p.t * 0.35 + p.i)))} ${p.s})`} opacity={p.a}>
    <circle r={13} fill="#f2c13b" stroke="#7a5410" strokeWidth={2.5} /><circle r={8} fill="none" stroke="#ffe48a" strokeWidth={2} />
  </g>
);
export const drawBrick = (p: Particle) => (
  <g transform={`translate(${p.x} ${p.y}) rotate(${p.rot}) scale(${p.s})`} opacity={p.a}>
    <rect x={-16} y={-8} width={32} height={16} rx={2} fill="#9a9aa0" stroke="#111" strokeWidth={2.5} /><rect x={-14} y={-6} width={28} height={4} fill="#fff" opacity={0.25} />
  </g>
);
export const drawRedBrick = (p: Particle) => (
  <g transform={`translate(${p.x} ${p.y}) rotate(${p.rot}) scale(${p.s})`} opacity={p.a}>
    <rect x={-16} y={-8} width={32} height={16} rx={2} fill="#9a4a32" stroke="#2b1912" strokeWidth={2.5} />
  </g>
);
export const drawShard = (p: Particle) => (
  <g transform={`translate(${p.x} ${p.y}) rotate(${p.rot}) scale(${p.s})`} opacity={p.a}>
    <path d="M0 -14 L9 6 L-7 10 Z" fill="#e8f2ff" stroke="#0b0b0d" strokeWidth={2} />
  </g>
);
export const drawSpark = (p: Particle) => (
  <g transform={`translate(${p.x} ${p.y}) rotate(${p.rot})`} opacity={p.a}>
    <rect x={-1.5} y={-9 * p.s} width={3} height={18 * p.s} rx={1.5} fill="#fff6c8" /><circle r={3 * p.s} fill="#ffd36a" />
  </g>
);
export const drawDust = (p: Particle) => <circle cx={p.x} cy={p.y} r={(4 + p.t * 0.5) * p.s} fill="#d8d8d8" opacity={p.a * 0.35} />;
const CONF = ["#ff4d5e", "#ffd23f", "#3fc1ff", "#7dff7a", "#ffffff", "#c77dff"];
export const drawConfetti = (p: Particle) => (
  <rect x={-6} y={-3} width={12} height={6} transform={`translate(${p.x} ${p.y}) rotate(${p.rot}) scale(1 ${Math.cos(p.t * 0.4 + p.i)})`} fill={CONF[p.i % CONF.length]} opacity={p.a} />
);

/** presets: <Burst.Money f f0 at/> etc. */
export const Money: React.FC<{ f: number; f0: number; at: V; n?: number; seed?: number; spread?: number; up?: number }> = ({ f, f0, at, n = 24, seed = 3, spread = 0, up = 12 }) => (
  <Particles f={f} f0={f0} n={n} at={at} seed={seed} speed={[up * 0.5, up]} cone={90} gravity={0.25} flutter={18} life={[50, 80]} spin={4} spread={spread} draw={drawBill} />
);
export const Debris: React.FC<{ f: number; f0: number; at: V; n?: number; seed?: number; floor?: number; red?: boolean }> = ({ f, f0, at, n = 14, seed = 5, floor, red }) => (
  <Particles f={f} f0={f0} n={n} at={at} seed={seed} speed={[5, 14]} cone={120} gravity={0.9} life={[30, 45]} spin={14} floor={floor} draw={red ? drawRedBrick : drawBrick} />
);
export const Sparks: React.FC<{ f: number; f0: number; at: V; n?: number; seed?: number }> = ({ f, f0, at, n = 18, seed = 7 }) => (
  <Particles f={f} f0={f0} n={n} at={at} seed={seed} speed={[8, 20]} cone={360} gravity={0.35} drag={0.9} life={[10, 20]} spin={0} draw={drawSpark} />
);
export const Dust: React.FC<{ f: number; f0: number; at: V; n?: number; seed?: number }> = ({ f, f0, at, n = 10, seed = 9 }) => (
  <Particles f={f} f0={f0} n={n} at={at} seed={seed} speed={[1.5, 4]} dir={0} cone={170} gravity={-0.02} drag={0.92} life={[18, 30]} spin={0} draw={drawDust} />
);
export const Confetti: React.FC<{ f: number; f0: number; at: V; n?: number; seed?: number }> = ({ f, f0, at, n = 60, seed = 11 }) => (
  <Particles f={f} f0={f0} n={n} at={at} seed={seed} speed={[10, 22]} cone={80} gravity={0.3} flutter={10} life={[60, 90]} spin={10} draw={drawConfetti} />
);
export const Shards: React.FC<{ f: number; f0: number; at: V; n?: number; seed?: number }> = ({ f, f0, at, n = 16, seed = 13 }) => (
  <Particles f={f} f0={f0} n={n} at={at} seed={seed} speed={[6, 15]} cone={360} gravity={0.5} life={[24, 40]} spin={18} draw={drawShard} />
);
export const Coins: React.FC<{ f: number; f0: number; at: V; n?: number; seed?: number; floor?: number }> = ({ f, f0, at, n = 12, seed = 15, floor }) => (
  <Particles f={f} f0={f0} n={n} at={at} seed={seed} speed={[8, 15]} cone={70} gravity={0.7} life={[40, 60]} spin={0} floor={floor} draw={drawCoin} />
);

// ---------------------------------------------------------------- light and motion marks
/** rotating light rays from a point (victory, revelation). `a` = strength 0..1 */
export const Rays: React.FC<{ f: number; at: V; n?: number; len?: number; a?: number; color?: string; speed?: number; width?: number }> = ({ f, at, n = 16, len = 1400, a = 1, color = "#fff2c8", speed = 0.15, width = 7 }) => {
  const id = React.useId().replace(/:/g, "");
  if (a <= 0) return null;
  return (
    <g style={{ mixBlendMode: "screen" }} opacity={a}>
      <defs><radialGradient id={id} cx={0} cy={0} r={len} gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor={color} stopOpacity={0.55} /><stop offset="100%" stopColor={color} stopOpacity={0} /></radialGradient></defs>
      <g transform={`translate(${at[0]} ${at[1]}) rotate(${f * speed})`}>
        {Array.from({ length: n }, (_, i) => {
          const a0 = (i / n) * 360, w = width * (0.6 + 0.4 * Math.sin(i * 2.3));
          return <path key={i} transform={`rotate(${a0})`} d={`M0 0 L${-w * len / 100} ${-len} L${w * len / 100} ${-len} Z`} fill={`url(#${id})`} />;
        })}
      </g>
    </g>
  );
};
/** glow blob (screen blend) */
export const Glow: React.FC<{ at: V; r: number; color?: string; a?: number }> = ({ at, r, color = "#ffffff", a = 0.7 }) => {
  const id = React.useId().replace(/:/g, "");
  return (
    <g style={{ mixBlendMode: "screen" }}>
      <defs><radialGradient id={id}><stop offset="0%" stopColor={color} stopOpacity={a} /><stop offset="35%" stopColor={color} stopOpacity={a * 0.4} /><stop offset="100%" stopColor={color} stopOpacity={0} /></radialGradient></defs>
      <circle cx={at[0]} cy={at[1]} r={r} fill={`url(#${id})`} />
    </g>
  );
};
/** speed lines behind a mover going in direction `dir` (deg, 0 = right) */
export const SpeedLines: React.FC<{ f: number; at: V; dir?: number; n?: number; len?: number; spread?: number; a?: number; seed?: number }> = ({ f, at, dir = 0, n = 10, len = 220, spread = 180, a = 0.7, seed = 2 }) => {
  const r = rng(seed);
  return (
    <g transform={`translate(${at[0]} ${at[1]}) rotate(${dir})`} opacity={a}>
      {Array.from({ length: n }, (_, i) => {
        const y = (r() - 0.5) * spread, l = len * (0.5 + r() * 0.5), ph = (f * 0.9 + r() * 10) % 1, x = -40 - ph * 60 - l;
        return <line key={i} x1={x} y1={y} x2={x + l} y2={y} stroke="#fff" strokeWidth={2 + r() * 3} strokeLinecap="round" opacity={0.3 + r() * 0.6} />;
      })}
    </g>
  );
};
/** expanding ring on impact / landing */
export const ImpactRing: React.FC<{ f: number; f0: number; at: V; size?: number; dur?: number; color?: string; flat?: number }> = ({ f, f0, at, size = 160, dur = 14, color = "#ffffff", flat = 0.25 }) => {
  const t = (f - f0) / dur; if (t < 0 || t > 1) return null;
  const e = 1 - Math.pow(1 - t, 3);
  return <ellipse cx={at[0]} cy={at[1]} rx={size * e} ry={size * e * flat} fill="none" stroke={color} strokeWidth={6 * (1 - t) + 1} opacity={1 - t} />;
};
/** 4-point twinkle */
export const Sparkle: React.FC<{ f: number; at: V; s?: number; ph?: number; color?: string }> = ({ f, at, s = 1, ph = 0, color = "#fff" }) => {
  const k = Math.max(0, Math.sin(f * 0.18 + ph)), r = 16 * s * k;
  if (r < 0.5) return null;
  return <path transform={`translate(${at[0]} ${at[1]}) rotate(${f * 2})`} d={`M0 ${-r} Q${r * 0.12} ${-r * 0.12} ${r} 0 Q${r * 0.12} ${r * 0.12} 0 ${r} Q${-r * 0.12} ${r * 0.12} ${-r} 0 Q${-r * 0.12} ${-r * 0.12} 0 ${-r} Z`} fill={color} />;
};
/** a crack spreading from a point (glass, a head, the ground). p = 0..1 */
export const Crack: React.FC<{ at: V; p: number; size?: number; seed?: number; color?: string; width?: number }> = ({ at, p, size = 120, seed = 4, color = "#0b0b0d", width = 4 }) => {
  if (p <= 0) return null;
  const r = rng(seed);
  const arms = Array.from({ length: 9 }, (_, i) => {
    const a0 = (i / 9) * Math.PI * 2 + r() * 0.5; let x = 0, y = 0; const pts: V[] = [[0, 0]];
    const L = size * (0.6 + r() * 0.5);
    for (let k = 0; k < 5; k++) { const a = a0 + (r() - 0.5) * 0.7; x += Math.cos(a) * L / 5; y += Math.sin(a) * L / 5; pts.push([x, y]); }
    return pts;
  });
  return (
    <g transform={`translate(${at[0]} ${at[1]})`} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
      {arms.map((pts, i) => {
        const m = Math.max(1, Math.round(pts.length * clamp(p * 1.2 - i * 0.02)));
        return <polyline key={i} points={pts.slice(0, m + 1).map((q) => q.join(",")).join(" ")} />;
      })}
      {p > 0.5 && <circle r={size * 0.42} strokeWidth={width * 0.6} opacity={(p - 0.5) * 2} strokeDasharray="18 22" />}
    </g>
  );
};
/** floating dust in the air (inside a light beam): a box of motes drifting upward */
export const Motes: React.FC<{ f: number; x: number; y: number; w: number; h: number; n?: number; seed?: number; a?: number }> = ({ f, x, y, w, h, n = 40, seed = 21, a = 0.6 }) => {
  const r = rng(seed);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const px = r(), py = r(), v = 0.2 + r() * 0.5, s = 1 + r() * 2.2, ph = r() * 6.3;
        const yy = y + ((((py * h - f * v) % h) + h) % h), xx = x + px * w + Math.sin(f * 0.03 + ph) * 10;
        return <circle key={i} cx={xx} cy={yy} r={s} fill="#fff" opacity={a * (0.4 + 0.6 * Math.abs(Math.sin(f * 0.05 + ph)))} />;
      })}
    </g>
  );
};
