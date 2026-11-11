// "Work smart, not just hard." props: real objects drawn in the SAME HOURS look (black, grey gradients with a lit edge, thin black
// ink), natural colour only where the object really has it (wood, leaves, sparks). Every prop takes world coordinates.
import React from "react";
import { V, clamp, rng } from "../../kit/core";
import { GOLD, RED, SANS } from "../samehours/StyleFrames";

export const W = "#f2f2f2", DIM = "#8a8a92";
export const D2 = Math.PI / 180;
export const rotV = (v: V, a: number): V => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
export const addV = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1]];
export const subV = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1]];
export const mulV = (a: V, k: number): V => [a[0] * k, a[1] * k];
export const lenV = (a: V) => Math.hypot(a[0], a[1]);
export const normV = (a: V): V => mulV(a, 1 / (lenV(a) || 1));
export const lerpV2 = (a: V, b: V, u: number): V => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];

export const SmartDefs: React.FC = () => (
  <defs>
    <linearGradient id="sm-rock" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stopColor="#9a9aa0" /><stop offset="1" stopColor="#3e3e45" /></linearGradient>
    <radialGradient id="sm-shade" cx="35%" cy="28%" r="80%"><stop offset="0" stopColor="#ffffff" stopOpacity={0.28} /><stop offset="0.55" stopColor="#ffffff" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.45} /></radialGradient>
    <linearGradient id="sm-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c4975c" /><stop offset="1" stopColor="#7c5530" /></linearGradient>
    <linearGradient id="sm-bark" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#4a3a2c" /><stop offset="0.45" stopColor="#7a6048" /><stop offset="1" stopColor="#3a2d22" /></linearGradient>
    <radialGradient id="sm-leaf" cx="40%" cy="35%" r="70%"><stop offset="0" stopColor="#6f9a5c" /><stop offset="1" stopColor="#2f4a2a" /></radialGradient>
    <linearGradient id="sm-steel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d9dbe0" /><stop offset="1" stopColor="#6b6e76" /></linearGradient>
    <linearGradient id="sm-metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a4a52" /><stop offset="1" stopColor="#1c1c22" /></linearGradient>
    <linearGradient id="sm-ivory" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fbfaf4" /><stop offset="1" stopColor="#bdb9ad" /></linearGradient>
    <linearGradient id="sm-stone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b4b4ba" /><stop offset="1" stopColor="#5a5a62" /></linearGradient>
  </defs>
);

/** a counter line: "Moved: 0 cm" */
export const Count: React.FC<{ x: number; y: number; k: string; v: string; c?: string; size?: number; anchor?: "start" | "middle" | "end" }> = ({ x, y, k, v, c = W, size = 40, anchor = "middle" }) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={SANS} fontWeight={600} fontSize={size} fill={DIM}>{k} <tspan fill={c} fontWeight={800}>{v}</tspan></text>
);

/** sweat drops flying off the back of the head while straining */
export const Sweat: React.FC<{ t: number; at: V; dir?: number; a?: number }> = ({ t, at, dir = -1, a = 1 }) => (
  <g opacity={a}>
    {[0, 1, 2, 3, 4].map((k) => {
      const u = ((t + k * 6) % 30) / 30, s = [1, 0.7, 0.85, 0.6, 0.95][k];
      const x = at[0] + dir * (14 + u * 60 * s) + (k % 2 ? 6 : -4), y = at[1] - 22 + k * 5 - u * 34 * s + u * u * 90;
      return <path key={k} d={`M${x} ${y - 12} Q${x + 8} ${y + 2} ${x} ${y + 7} Q${x - 8} ${y + 2} ${x} ${y - 12}Z`} fill="#d4ecff" stroke="#000" strokeWidth={1.5} opacity={(1 - u) * 0.95} />;
    })}
  </g>
);

/** a dust puff where something hits the ground */
export const Puff: React.FC<{ t: number; at: number; x: number; y: number; w?: number; dur?: number }> = ({ t, at, x, y, w = 60, dur = 18 }) => {
  const u = (t - at) / dur;
  if (u < 0 || u > 1) return null;
  return <g opacity={(1 - u) * 0.6}>{[-1, -0.4, 0.4, 1].map((d, i) => <ellipse key={i} cx={x + d * (w * 0.4 + u * w * 0.8)} cy={y - 6 - u * 16 * (1 - Math.abs(d) * 0.3)} rx={10 + u * w * 0.35} ry={6 + u * w * 0.18} fill="#b9b9c0" />)}</g>;
};

/** impact lines (a hit, a clank) */
export const Hit: React.FC<{ t: number; at: number; x: number; y: number; r?: number; c?: string }> = ({ t, at, x, y, r = 40, c = W }) => {
  const u = (t - at) / 7;
  if (u < 0 || u > 1) return null;
  return <g opacity={1 - u}>{Array.from({ length: 7 }, (_, i) => { const a = (-150 + i * 50) * D2; return <line key={i} x1={x + Math.cos(a) * r * (0.4 + u * 0.4)} y1={y + Math.sin(a) * r * (0.4 + u * 0.4)} x2={x + Math.cos(a) * r * (0.9 + u * 0.5)} y2={y + Math.sin(a) * r * (0.9 + u * 0.5)} stroke={c} strokeWidth={4} strokeLinecap="round" />; })}</g>;
};

// ================================================================ rock, plank, fulcrum stone
const rockPts = (r: number, seed: number, n = 14, k0 = 0.92, k1 = 0.1): V[] => {
  const R = rng(seed);
  return Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2, k = r * (k0 + R() * k1); return [Math.cos(a) * k, Math.sin(a) * k * 0.97] as V; });
};
const smooth = (p: V[]) => {
  const n = p.length, m = (a: V, b: V): V => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let d = `M${m(p[n - 1], p[0]).map((v) => v.toFixed(1)).join(" ")}`;
  for (let i = 0; i < n; i++) { const q = m(p[i], p[(i + 1) % n]); d += ` Q${p[i][0].toFixed(1)} ${p[i][1].toFixed(1)} ${q[0].toFixed(1)} ${q[1].toFixed(1)}`; }
  return d + "Z";
};
/** a big round boulder (centre c, radius r), rotated by rot degrees (rolling); the light stays top-left */
export const Boulder: React.FC<{ c: V; r: number; rot?: number; seed?: number }> = ({ c, r, rot = 0, seed = 3 }) => {
  const d = smooth(rockPts(r, seed));
  const R = rng(seed + 7);
  const cracks = Array.from({ length: 4 }, () => { const a = R() * 6.28, l = r * (0.25 + R() * 0.3), x = Math.cos(a) * r * 0.35, y = Math.sin(a) * r * 0.35; return `M${x.toFixed(1)} ${y.toFixed(1)} l${(Math.cos(a + 0.6) * l * 0.5).toFixed(1)} ${(Math.sin(a + 0.6) * l * 0.5).toFixed(1)} l${(Math.cos(a - 0.3) * l * 0.5).toFixed(1)} ${(Math.sin(a - 0.3) * l * 0.5).toFixed(1)}`; });
  const specks = Array.from({ length: 16 }, () => [(R() - 0.5) * r * 1.4, (R() - 0.5) * r * 1.4, 2 + R() * 4] as const).filter(([x, y]) => x * x + y * y < r * r * 0.7);
  return (
    <g>
      <ellipse cx={c[0]} cy={c[1] + r * 0.98} rx={r * 0.9} ry={r * 0.08} fill="#000" opacity={0.55} />
      <g transform={`translate(${c[0]} ${c[1]}) rotate(${rot})`}>
        <path d={d} fill="url(#sm-rock)" stroke="#000" strokeWidth={5} strokeLinejoin="round" />
        {cracks.map((p, i) => <path key={i} d={p} fill="none" stroke="#25252b" strokeWidth={3.5} strokeLinecap="round" opacity={0.8} />)}
        {specks.map(([x, y, s], i) => <circle key={i} cx={x} cy={y} r={s} fill="#2c2c32" opacity={0.5} />)}
      </g>
      <circle cx={c[0]} cy={c[1]} r={r * 0.97} fill="url(#sm-shade)" />
      <path d={`M${c[0] - r * 0.62} ${c[1] - r * 0.5} Q${c[0] - r * 0.1} ${c[1] - r * 0.98} ${c[0] + r * 0.5} ${c[1] - r * 0.7}`} fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.35} />
    </g>
  );
};
/** a low flat stone (the fulcrum): sits on the ground at x, its top at g - h */
export const Pebble: React.FC<{ x: number; g: number; w: number; h: number; seed?: number }> = ({ x, g, w, h, seed = 5 }) => {
  const R = rng(seed);
  const top = Array.from({ length: 7 }, (_, i) => { const u = i / 6; return [x - w / 2 + u * w, g - h * Math.sin(Math.PI * (0.1 + u * 0.8)) * (0.92 + R() * 0.1)] as V; });
  const d = `M${x - w / 2} ${g} ` + top.map((p) => `L${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ") + ` L${x + w / 2} ${g} Z`;
  return <g><path d={d} fill="url(#sm-stone)" stroke="#000" strokeWidth={4} strokeLinejoin="round" /><path d={`M${x - w * 0.28} ${g - h * 0.72} Q${x} ${g - h * 1.02} ${x + w * 0.25} ${g - h * 0.78}`} fill="none" stroke="#fff" strokeWidth={3} opacity={0.4} strokeLinecap="round" /></g>;
};
/** a wooden plank from a to b (its centre line), thickness w */
export const Plank: React.FC<{ a: V; b: V; w?: number }> = ({ a, b, w = 18 }) => {
  const d = subV(b, a), L = lenV(d), ang = Math.atan2(d[1], d[0]) / D2;
  return (
    <g transform={`translate(${a[0]} ${a[1]}) rotate(${ang})`}>
      <rect x={0} y={-w / 2} width={L} height={w} rx={3} fill="url(#sm-wood)" stroke="#000" strokeWidth={3} />
      <path d={`M${L * 0.08} ${-w * 0.12} Q${L * 0.3} ${-w * 0.3} ${L * 0.55} ${-w * 0.1} T${L * 0.92} ${-w * 0.14}`} fill="none" stroke="#5a3b1e" strokeWidth={1.6} opacity={0.6} />
      <path d={`M${L * 0.15} ${w * 0.2} Q${L * 0.42} ${w * 0.05} ${L * 0.7} ${w * 0.22}`} fill="none" stroke="#5a3b1e" strokeWidth={1.4} opacity={0.5} />
      <circle cx={L * 0.36} cy={w * 0.05} r={2.4} fill="#4a2f16" opacity={0.7} />
    </g>
  );
};

// ================================================================ escalator
export const ESC = { X0: 200, X1: 860, H: 380, N: 14 };
export const escTan = ESC.H / (ESC.X1 - ESC.X0);
export const escY = (g: number, x: number) => g - clamp(x - ESC.X0, 0, ESC.X1 - ESC.X0) * escTan;
export const railY = (g: number, x: number) => escY(g, x) - 122;
/** dir +1 = steps move up, -1 = steps move down; v = px per frame along x */
export const Escalator: React.FC<{ g: number; t: number; dir: number; v: number; color: string; floorLit?: number }> = ({ g, t, dir, v, color, floorLit = 0 }) => {
  const { X0, X1, H, N } = ESC, R = H / N, TR = R / escTan;
  const off = (((dir * v * t) % TR) + TR) % TR;
  const pts: V[] = [];
  for (let k = -2; k <= N + 2; k++) {
    const nx = X0 + off + k * TR - TR, ny = escY(g, nx) + R * 0.5;
    pts.push([nx, ny], [nx + TR, ny]);
  }
  const prof = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${Math.min(g, p[1]).toFixed(1)}`).join(" ");
  const band = `M${X0 - 40} ${g} L${X1} ${g - H} L${X1 + 40} ${g - H} L${X1 + 40} ${g - H + 84} L${X1} ${g - H + 84} L${X0 + 84 / escTan} ${g} Z`;
  const rail = `M${X0 - 96} ${g - 98} Q${X0 - 118} ${g - 122} ${X0} ${g - 122} L${X1} ${g - H - 122} Q${X1 + 118} ${g - H - 122} ${X1 + 96} ${g - H - 98}`;
  const glass = `M${X0 - 96} ${g} L${X0 - 96} ${g - 98} Q${X0 - 118} ${g - 122} ${X0} ${g - 122} L${X1} ${g - H - 122} Q${X1 + 118} ${g - H - 122} ${X1 + 96} ${g - H - 98} L${X1 + 96} ${g - H} L${X1} ${g - H} L${X0} ${g} Z`;
  const ang = -Math.atan(escTan) / D2;
  const span = (X1 - X0) / Math.cos(Math.atan(escTan));
  const id = `esc${g}`;
  return (
    <g>
      {/* floors */}
      <rect x={X1} y={g - H} width={1080 - X1 + 40} height={26} fill="url(#sm-metal)" stroke="#6a6a72" strokeWidth={3} />
      <rect x={X1} y={g - H} width={1080 - X1 + 40} height={6} fill={floorLit > 0 ? GOLD : "#9a9aa2"} opacity={0.6 + floorLit * 0.4} />
      <rect x={-40} y={g} width={X0 + 40} height={6} fill="#8a8a92" />
      {/* glass balustrade + truss */}
      <path d={glass} fill="#ffffff" opacity={0.05} stroke="#ffffff" strokeOpacity={0.18} strokeWidth={3} />
      <path d={band} fill="url(#sm-metal)" stroke="#6a6a72" strokeWidth={3} />
      <clipPath id={id}><path d={`M${X0 - 40} ${g + 2} L${X0} ${g + 2} L${X1} ${g - H + 2} L${X1 + 40} ${g - H + 2} L${X1 + 40} ${g - H - 60} L${X1} ${g - H - 60} L${X0} ${g - 60} L${X0 - 40} ${g - 60} Z`} /></clipPath>
      <g clipPath={`url(#${id})`}>
        <path d={`${prof} L${X1 + 60} ${g - H + 30} L${X0} ${g + 30} Z`} fill="#3a3a42" />
        <path d={prof} fill="none" stroke="#b4b4bc" strokeWidth={4} strokeLinejoin="round" />
      </g>
      {/* comb plates */}
      <rect x={X0 - 70} y={g - 4} width={90} height={8} fill="#b4b4bc" />
      <rect x={X1 - 20} y={g - H - 4} width={90} height={8} fill="#b4b4bc" />
      {/* direction chevrons on the glass */}
      {Array.from({ length: 5 }, (_, k) => {
        const s = (((k * span) / 5 + dir * v * 1.6 * t) % span + span) % span, x = X0 + s * Math.cos(Math.atan(escTan)), y = escY(g, x) - 62;
        const a = clamp(Math.min(s, span - s) / 60);
        return <path key={k} d="M-12 -14 L6 0 L-12 14" transform={`translate(${x} ${y}) rotate(${dir > 0 ? ang : ang + 180})`} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" opacity={0.85 * a} />;
      })}
      {/* handrail */}
      <path d={rail} fill="none" stroke="#6a6a72" strokeWidth={18} strokeLinecap="round" />
      <path d={rail} fill="none" stroke="#141418" strokeWidth={12} strokeLinecap="round" />
    </g>
  );
};
/** a floor sign: "1F" */
export const FloorSign: React.FC<{ x: number; y: number; t: string; lit?: number }> = ({ x, y, t, lit = 0 }) => (
  <g>
    <line x1={x} y1={y + 46} x2={x} y2={y + 90} stroke="#6a6a72" strokeWidth={5} />
    <rect x={x - 54} y={y - 44} width={108} height={90} rx={12} fill={lit > 0 ? GOLD : "#2a2a30"} stroke={lit > 0 ? "#000" : "#8a8a92"} strokeWidth={4} />
    <text x={x} y={y + 20} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={52} fill={lit > 0 ? "#1a1205" : W}>{t}</text>
  </g>
);

// ================================================================ tree, axe, grindstone
export const TREE = { TW: 64, CUT: 96, H: 300 };
/** a tree whose trunk is centred on x, a felling notch `notch` px deep on the left at CUT height, falling to the right by `fall` degrees */
export const CutTree: React.FC<{ x: number; g: number; notch: number; fall?: number; seed?: number }> = ({ x, g, notch, fall = 0, seed = 2 }) => {
  const { TW, CUT, H } = TREE, hy = g - CUT, L = x - TW / 2, Rr = x + TW / 2;
  const R = rng(seed);
  const n = Math.min(notch, TW - 6);
  const leaves = Array.from({ length: 9 }, (_, i) => { const a = (i / 9) * 6.28 + R(); return [x + Math.cos(a) * 70 * (0.6 + R() * 0.5), g - H - 70 + Math.sin(a) * 58 * (0.6 + R() * 0.5), 58 + R() * 26] as const; });
  const bark = (y0: number, y1: number) => Array.from({ length: 4 }, (_, i) => <line key={i} x1={L + 10 + i * 14} y1={y0} x2={L + 12 + i * 14 + (i % 2 ? 3 : -3)} y2={y1} stroke="#2a2018" strokeWidth={3} opacity={0.6} />);
  return (
    <g>
      {/* stump with the lower lip of the cut */}
      <path d={`M${L - 16} ${g} Q${L - 2} ${g - 12} ${L} ${g - 40} L${L} ${hy + 10} L${L + n} ${hy} L${Rr} ${hy} L${Rr} ${g - 40} Q${Rr + 2} ${g - 12} ${Rr + 16} ${g} Z`} fill="url(#sm-bark)" stroke="#000" strokeWidth={4} strokeLinejoin="round" />
      {bark(g - 30, hy + 12)}
      {/* the upper part, hinged on the right edge of the cut */}
      <g transform={`rotate(${fall} ${Rr} ${hy})`}>
        <path d={`M${L} ${hy - 12} L${L + n} ${hy} L${Rr} ${hy} L${Rr - 4} ${g - H + 10} L${L + 4} ${g - H + 10} Z`} fill="url(#sm-bark)" stroke="#000" strokeWidth={4} strokeLinejoin="round" />
        {bark(hy - 20, g - H + 20)}
        <path d={`M${x} ${g - H + 30} L${x - 50} ${g - H - 40} M${x + 4} ${g - H + 50} L${x + 52} ${g - H - 20}`} stroke="#4a3a2c" strokeWidth={10} strokeLinecap="round" />
        {leaves.map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill="url(#sm-leaf)" stroke="#000" strokeWidth={3} />)}
        <circle cx={x - 30} cy={g - H - 110} r={40} fill="#9ac07f" opacity={0.18} />
      </g>
      {/* the pale wood inside the notch */}
      {n > 4 && <path d={`M${L} ${hy - 12} L${L + n} ${hy} L${L} ${hy + 10} Z`} fill="#e6c58e" stroke="#000" strokeWidth={2.5} />}
    </g>
  );
};
/** an axe: `tip` = the middle of the cutting edge, `ang` = the handle direction (degrees, from the handle end toward the head) */
export const AXE = { HEAD: 30, HANDLE: 118 };
export const axeGrip = (tip: V, ang: number, d: number): V => { const u: V = [Math.cos(ang * D2), Math.sin(ang * D2)]; return subV(tip, mulV(u, AXE.HEAD + d)); };
export const Axe: React.FC<{ tip: V; ang: number; sharp?: boolean; glint?: number }> = ({ tip, ang, sharp, glint = 0 }) => {
  const { HEAD, HANDLE } = AXE;
  return (
    <g transform={`translate(${tip[0]} ${tip[1]}) rotate(${ang})`}>
      <rect x={-HEAD - HANDLE} y={-6} width={HANDLE + 10} height={12} rx={6} fill="url(#sm-wood)" stroke="#000" strokeWidth={3} />
      {/* head: eye wrapped round the handle end, the bit flaring to a tall curved edge */}
      <path d={`M${-HEAD - 6} -12 L${-HEAD + 10} -12 L-4 -26 Q4 0 -4 26 L${-HEAD + 10} 12 L${-HEAD - 6} 12 Z`} fill="url(#sm-steel)" stroke="#000" strokeWidth={3} strokeLinejoin="round" />
      <path d={sharp ? "M-5 -24 Q2 0 -5 24" : "M-5 -24 L-2 -15 L-6 -8 L-2 0 L-6 8 L-2 15 L-5 24"} fill="none" stroke={sharp ? "#ffffff" : "#5a5c62"} strokeWidth={sharp ? 4 : 3} strokeLinejoin="round" />
      {glint > 0 && <g transform="translate(0 -10)" opacity={glint}><path d="M0 -26 L4 -4 L26 0 L4 4 L0 26 L-4 4 L-26 0 L-4 -4 Z" fill="#ffffff" /></g>}
    </g>
  );
};
/** a treadle grindstone: wheel centre (x, g - 112), turning `spin` degrees; the treadle is pumped by `ped` (0..1) */
export const Grindstone: React.FC<{ x: number; g: number; spin: number; ped: number }> = ({ x, g, spin, ped }) => {
  const cy = g - 112, r = 72;
  const pedY = g - 14 - ped * 16;
  return (
    <g>
      <line x1={x - 62} y1={g} x2={x - 6} y2={cy + 6} stroke="#7c5530" strokeWidth={14} strokeLinecap="round" />
      <line x1={x + 62} y1={g} x2={x + 6} y2={cy + 6} stroke="#7c5530" strokeWidth={14} strokeLinecap="round" />
      <rect x={x - 66} y={g - 70} width={132} height={34} rx={4} fill="url(#sm-wood)" stroke="#000" strokeWidth={3} />
      <rect x={x - 60} y={g - 66} width={120} height={10} fill="#5a8fb8" opacity={0.6} />
      <g transform={`translate(${x} ${cy}) rotate(${spin})`}>
        <circle r={r} fill="url(#sm-stone)" stroke="#000" strokeWidth={5} />
        <circle r={r - 10} fill="none" stroke="#3a3a42" strokeWidth={3} opacity={0.6} />
        {[0, 60, 120, 180, 240, 300].map((a) => <line key={a} x1={Math.cos(a * D2) * 18} y1={Math.sin(a * D2) * 18} x2={Math.cos(a * D2) * (r - 14)} y2={Math.sin(a * D2) * (r - 14)} stroke="#4a4a52" strokeWidth={3} opacity={0.5} />)}
        <circle r={14} fill="#2a2a30" stroke="#000" strokeWidth={3} />
      </g>
      {/* crank rod from the axle to the treadle */}
      <line x1={x + Math.cos(spin * D2) * 14} y1={cy + Math.sin(spin * D2) * 14} x2={x - 70} y2={pedY} stroke="#8a8a92" strokeWidth={5} />
      <line x1={x + 40} y1={g - 4} x2={x - 150} y2={pedY} stroke="#5a3b1e" strokeWidth={13} strokeLinecap="round" />
    </g>
  );
};
/** a stool */
export const Stool: React.FC<{ x: number; g: number; h: number }> = ({ x, g, h }) => (
  <g>
    <line x1={x - 26} y1={g} x2={x - 18} y2={g - h + 6} stroke="#5a3b1e" strokeWidth={9} strokeLinecap="round" />
    <line x1={x + 26} y1={g} x2={x + 18} y2={g - h + 6} stroke="#5a3b1e" strokeWidth={9} strokeLinecap="round" />
    <rect x={x - 40} y={g - h - 4} width={80} height={14} rx={5} fill="url(#sm-wood)" stroke="#000" strokeWidth={3} />
  </g>
);
/** wood chips flying back from a cut, `big` for a sharp axe */
export const Chips: React.FC<{ t: number; at: number; x: number; y: number; big?: boolean; seed?: number; floor: number }> = ({ t, at, x, y, big, seed = 1, floor }) => {
  const u = t - at;
  if (u < 0 || u > 30) return null;
  const R = rng(seed + at * 13), n = big ? 9 : 3;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const vx = -(2 + R() * (big ? 9 : 4)), vy = -(4 + R() * (big ? 9 : 4)), s = big ? 7 + R() * 9 : 3 + R() * 3, sp = R() * 40 - 20;
        const px = x + vx * u, py = Math.min(floor - 3, y + vy * u + 0.55 * u * u);
        return <rect key={i} x={px - s / 2} y={py - s / 4} width={s} height={s / 2} fill="#e6c58e" stroke="#000" strokeWidth={1.5} transform={`rotate(${sp * u * 0.4} ${px} ${py})`} opacity={clamp((30 - u) / 8)} />;
      })}
    </g>
  );
};
/** sparks off the grindstone, a continuous spray going down the wheel's turning direction */
export const SparkSpray: React.FC<{ t: number; at: V; on: number }> = ({ t, at, on }) => {
  if (on <= 0) return null;
  return (
    <g opacity={on}>
      {Array.from({ length: 12 }, (_, i) => {
        const R = rng(i * 31 + Math.floor((t + i * 3) / 9) * 7), u = ((t + i * 3) % 9) / 9;
        const a = (100 + R() * 50) * D2, sp = 30 + R() * 70;
        const x = at[0] + Math.cos(a) * sp * u, y = at[1] + Math.sin(a) * sp * u + 30 * u * u;
        const x2 = x - Math.cos(a) * 10, y2 = y - Math.sin(a) * 10;
        return <line key={i} x1={x} y1={y} x2={x2} y2={y2} stroke={i % 3 ? "#ffcf5a" : "#fff4c8"} strokeWidth={3} strokeLinecap="round" opacity={1 - u} />;
      })}
    </g>
  );
};

// ================================================================ maze (generated, deterministic)
export const MZ = { C: 7, R: 4, CW: 120, CH: 104, X: 120 };
type Cell = [number, number];
const key = (a: Cell, b: Cell) => (a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]) ? `${a}|${b}` : `${b}|${a}`);
const inb = (c: Cell) => c[0] >= 0 && c[0] < MZ.C && c[1] >= 0 && c[1] < MZ.R;
const nbrs = (c: Cell): Cell[] => [[c[0] + 1, c[1]], [c[0] - 1, c[1]], [c[0], c[1] + 1], [c[0], c[1] - 1]];
export const START: Cell = [0, MZ.R - 1], EXIT: Cell = [MZ.C - 1, 0];
const gen = (seed: number) => {
  const R = rng(seed), open = new Set<string>(), seen = new Set<string>([`${START}`]), st: Cell[] = [START];
  while (st.length) {
    const c = st[st.length - 1], nb = nbrs(c).filter((n) => inb(n) && !seen.has(`${n}`));
    if (!nb.length) { st.pop(); continue; }
    const n = nb[Math.floor(R() * nb.length)];
    open.add(key(c, n)); seen.add(`${n}`); st.push(n);
  }
  return open;
};
const solve = (open: Set<string>): Cell[] => {
  const prev = new Map<string, Cell | null>([[`${START}`, null]]), q: Cell[] = [START];
  while (q.length) { const c = q.shift()!; if (`${c}` === `${EXIT}`) break; for (const n of nbrs(c)) if (inb(n) && open.has(key(c, n)) && !prev.has(`${n}`)) { prev.set(`${n}`, c); q.push(n); } }
  const path: Cell[] = []; let c: Cell | null = EXIT; while (c) { path.unshift(c); c = prev.get(`${c}`) ?? null; } return path;
};
/** a rusher who explores depth-first without a plan: the visited cells in order, including the walks back out of dead ends */
const rush = (open: Set<string>, pref: number[]): Cell[] => {
  const seen = new Set<string>([`${START}`]), st: Cell[] = [START], moves: Cell[] = [START];
  while (st.length) {
    const c = st[st.length - 1];
    if (`${c}` === `${EXIT}`) break;
    const nb = pref.map((i) => nbrs(c)[i]).filter((n) => inb(n) && open.has(key(c, n)) && !seen.has(`${n}`));
    if (!nb.length) { st.pop(); if (st.length) moves.push(st[st.length - 1]); continue; }
    seen.add(`${nb[0]}`); st.push(nb[0]); moves.push(nb[0]);
  }
  return moves;
};
export const MAZE = (() => {
  for (let s = 1; s < 4000; s++) {
    const open = gen(s), sol = solve(open);
    if (sol.length < 11 || sol.length > 12) continue;
    const r = rush(open, [2, 1, 0, 3]); // prefers down, then left, then right, then up: the wrong way first
    const deadEnds = r.filter((_, i) => i > 0 && i < r.length - 1 && `${r[i + 1]}` === `${r[i - 1]}`).length;
    if (r.length < 40 || deadEnds < 4) continue;
    return { open, sol, rush: r, seed: s };
  }
  throw new Error("no maze");
})();
export const cellXY = (c: Cell, top: number): V => [MZ.X + c[0] * MZ.CW + MZ.CW / 2, top + c[1] * MZ.CH + MZ.CH / 2];
export const Maze: React.FC<{ top: number; flagLit: number; t: number }> = ({ top, flagLit, t }) => {
  const { C, R, CW, CH, X } = MZ, open = MAZE.open;
  const segs: [V, V][] = [];
  for (let r = 0; r <= R; r++) for (let c = 0; c < C; c++) if (r === 0 || r === R || !open.has(key([c, r - 1], [c, r]))) segs.push([[X + c * CW, top + r * CH], [X + (c + 1) * CW, top + r * CH]]);
  for (let c = 0; c <= C; c++) for (let r = 0; r < R; r++) {
    if (c === 0 && r === START[1]) continue;
    if (c === C && r === EXIT[1]) continue;
    if (c === 0 || c === C || !open.has(key([c - 1, r], [c, r]))) segs.push([[X + c * CW, top + r * CH], [X + c * CW, top + (r + 1) * CH]]);
  }
  const fx = X + C * CW + 46, fy = top + EXIT[1] * CH + CH / 2 + 26;
  const wv = Math.sin(t * 0.25) * 5;
  return (
    <g>
      <rect x={X - 6} y={top - 6} width={C * CW + 12} height={R * CH + 12} fill="#121216" />
      {segs.map(([a, b], i) => <line key={`d${i}`} x1={a[0]} y1={a[1] + 9} x2={b[0]} y2={b[1] + 9} stroke="#2c2c33" strokeWidth={11} strokeLinecap="round" />)}
      {segs.map(([a, b], i) => <line key={`t${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#c4c4cc" strokeWidth={8} strokeLinecap="round" />)}
      {/* the exit flag */}
      <line x1={fx} y1={fy} x2={fx} y2={fy - 110} stroke="#d6d6dc" strokeWidth={5} />
      <path d={`M${fx} ${fy - 108} Q${fx + 30} ${fy - 102 + wv} ${fx + 62} ${fy - 92} Q${fx + 30} ${fy - 82 - wv} ${fx} ${fy - 74} Z`} fill={flagLit > 0 ? GOLD : "#6e6e76"} />
    </g>
  );
};

// ================================================================ dominoes
const PIPS: Record<number, V[]> = {
  0: [], 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
};
export const DOM_W = 0.44;
/** a domino standing on g with its left edge at x, height h, tipped `ang` degrees to the right about its bottom-right corner */
export const Domino: React.FC<{ x: number; g: number; h: number; ang?: number; a?: number; b?: number }> = ({ x, g, h, ang = 0, a = 5, b = 3 }) => {
  const w = h * DOM_W, sw = Math.max(1.5, h * 0.016), pr = w * 0.085;
  const half = (n: number, cy: number) => PIPS[n].map(([px, py], i) => <circle key={`${cy}${i}`} cx={x + w / 2 + px * w * 0.26} cy={cy + py * h * 0.13} r={pr} fill="#111" />);
  return (
    <g transform={`rotate(${ang} ${x + w} ${g})`}>
      <rect x={x} y={g - h} width={w} height={h} rx={w * 0.12} fill="url(#sm-ivory)" stroke="#000" strokeWidth={sw * 1.6} />
      <line x1={x + w * 0.14} y1={g - h / 2} x2={x + w * 0.86} y2={g - h / 2} stroke="#111" strokeWidth={sw} />
      {h > 18 && half(a, g - h * 0.75)}
      {h > 18 && half(b, g - h * 0.25)}
      <rect x={x + w * 0.1} y={g - h + h * 0.03} width={w * 0.12} height={h * 0.4} rx={w * 0.05} fill="#fff" opacity={0.5} />
    </g>
  );
};

// ================================================================ painting a wall
export const WALL = { X0: 400, X1: 1002, H: 340 };
export const PAINT = "#e9b23a", PAINT_D = "#b88412";
/** a plastered wall section standing on the ground, x0..x1, height H, with a skirting board */
export const PlainWall: React.FC<{ g: number }> = ({ g }) => {
  const { X0, X1, H } = WALL;
  return (
    <g>
      <rect x={X0} y={g - H} width={X1 - X0} height={H} fill="#2e2e35" stroke="#6a6a72" strokeWidth={4} />
      {Array.from({ length: 6 }, (_, i) => <line key={i} x1={X0 + 8} y1={g - H + 40 + i * 52} x2={X1 - 8} y2={g - H + 40 + i * 52 + (i % 2 ? 3 : -3)} stroke="#3a3a42" strokeWidth={2} opacity={0.5} />)}
      <rect x={X0 - 6} y={g - H - 12} width={X1 - X0 + 12} height={14} fill="#4a4a52" stroke="#000" strokeWidth={3} />
    </g>
  );
};
/** a brushed dab of paint (centre, size, seed) */
export const Dab: React.FC<{ c: V; w: number; h: number; seed: number }> = ({ c, w, h, seed }) => {
  const R = rng(seed);
  const pts = Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * 6.283, k = 0.8 + R() * 0.3; return [c[0] + Math.cos(a) * w * 0.5 * k, c[1] + Math.sin(a) * h * 0.5 * k] as V; });
  return (
    <g>
      <path d={pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ") + "Z"} fill={PAINT} />
      {[-0.25, 0, 0.25].map((d, i) => <line key={i} x1={c[0] - w * 0.4} y1={c[1] + d * h} x2={c[0] + w * 0.4} y2={c[1] + d * h + 1} stroke={PAINT_D} strokeWidth={1.5} opacity={0.6} />)}
    </g>
  );
};
/** a small paint brush: `tip` = the bristle tip on the wall, the handle pointing back along `ang` degrees */
export const Brush: React.FC<{ tip: V; ang: number }> = ({ tip, ang }) => (
  <g transform={`translate(${tip[0]} ${tip[1]}) rotate(${ang})`}>
    <rect x={-58} y={-4} width={36} height={8} rx={4} fill="url(#sm-wood)" stroke="#000" strokeWidth={2.5} />
    <rect x={-24} y={-8} width={10} height={16} fill="url(#sm-steel)" stroke="#000" strokeWidth={2.5} />
    <path d="M-14 -8 L0 -7 L2 0 L0 7 L-14 8 Z" fill={PAINT} stroke="#000" strokeWidth={2.5} strokeLinejoin="round" />
  </g>
);
/** a paint roller on an extension pole: roller centred at r (its axis horizontal, on the wall), pole from the frame to `base` */
export const Roller: React.FC<{ r: V; base: V; wet: number }> = ({ r, base, wet }) => {
  const bend: V = [r[0] - 14, r[1] + 26];
  return (
    <g>
      <line x1={base[0]} y1={base[1]} x2={bend[0]} y2={bend[1]} stroke="#9a9aa2" strokeWidth={8} strokeLinecap="round" />
      <line x1={base[0]} y1={base[1]} x2={bend[0]} y2={bend[1]} stroke="#000" strokeWidth={2} strokeLinecap="round" opacity={0.4} />
      <path d={`M${bend[0]} ${bend[1]} L${r[0] - 4} ${r[1] + 14} L${r[0] - 44} ${r[1] + 14} L${r[0] - 44} ${r[1]}`} fill="none" stroke="#c4c4cc" strokeWidth={4} strokeLinejoin="round" />
      <rect x={r[0] - 42} y={r[1] - 12} width={84} height={24} rx={11} fill={wet > 0 ? PAINT : "#d8d8de"} stroke="#000" strokeWidth={3} />
      <line x1={r[0] - 36} y1={r[1] - 4} x2={r[0] + 36} y2={r[1] - 4} stroke="#fff" strokeWidth={3} opacity={0.4} />
    </g>
  );
};
/** a paint tray on the ground at x (fill 0..1) */
export const Tray: React.FC<{ x: number; g: number; fill: number }> = ({ x, g, fill }) => (
  <g>
    <path d={`M${x - 50} ${g} L${x - 44} ${g - 16} L${x + 50} ${g - 16} L${x + 56} ${g} Z`} fill="#8a8a92" stroke="#000" strokeWidth={3} />
    {fill > 0 && <rect x={x - 40} y={g - 15} width={84 * fill} height={7} fill={PAINT} />}
  </g>
);
/** a paint can (bottom centre b), tipped `tilt` degrees about its bottom-right edge, pouring when tilted past 70 */
export const Can: React.FC<{ b: V; tilt: number }> = ({ b, tilt }) => (
  <g transform={`rotate(${tilt} ${b[0] + 22} ${b[1]})`}>
    <rect x={b[0] - 22} y={b[1] - 52} width={44} height={52} rx={4} fill="url(#sm-steel)" stroke="#000" strokeWidth={3} />
    <rect x={b[0] - 22} y={b[1] - 38} width={44} height={22} fill={PAINT} stroke="#000" strokeWidth={2} />
    <path d={`M${b[0] - 18} ${b[1] - 52} Q${b[0]} ${b[1] - 74} ${b[0] + 18} ${b[1] - 52}`} fill="none" stroke="#6a6a72" strokeWidth={3} />
  </g>
);

export { GOLD, RED };
