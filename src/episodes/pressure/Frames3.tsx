// "Pressure makes diamonds." v5 style frames: two lanes all film, top = "Avoids pressure", bottom = "Trains under it".
// Each scene: practice (top looks better) → the real moment (top breaks, bottom shines). Real objects, real physics, no faces.
// 0 practice penalties (10/10 vs 4/10) · 1 the final 90+4' (over the bar / GOAL) · 2 study (easy ticks vs timed hard set)
// · 3 the exam room (52 / 94) · 4 speech practice (mirror vs heckling friends) · 5 the hall of 500 · 6 rain training
// · 7 race day storm (km 5 / 42 km) · 8 the end: lifted on shoulders, the night practice loop.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { V, clamp } from "../../kit/core";
import { HIP_H, Hero, HeroLook, POSES, Pose, solvePose } from "../../kit/hero";
import { KitDefs, Vignette } from "../../kit/materials";
import { Glow, Rays } from "../../kit/fx";
import { EMOTE } from "../../kit/acting";
import { BOLD, BOLD_GREY, Defs, GOLD, SANS } from "../samehours/StyleFrames";

export const PRESSURE3_FRAMES = 13;
export const S = 0.7, H = HIP_H, G1 = 830, G2 = 1660, W = "#f2f2f2", DIM = "#8a8a92", RED = "#e0483e", GREEN = "#4cc46a";
export const HAND = '"Segoe Print", "Ink Free", "Comic Sans MS", cursive';
export const STAND = POSES.stand();
export const GREYL: HeroLook = { ...BOLD_GREY };
export const J = (x: number, y: number, pose: Pose, flip = false, s = S) => {
  const j = solvePose(pose), k = flip ? -1 : 1, w = (p: V): V => [x + k * p[0] * s, y + p[1] * s];
  return { wN: w(j.wN), wF: w(j.wF), sh: w(j.sh), head: w(j.head), hip: w(j.hip), aN: w(j.aN), aF: w(j.aF) };
};
export const reach = (base: Pose, x: number, y: number, tN: V, tF: V, flip = false, s = S): Pose => {
  const sh = solvePose(base).sh, k = flip ? -1 : 1, loc = (t: V): V => [((t[0] - x) * k) / s - sh[0], (t[1] - y) / s - sh[1]];
  return { ...base, hN: loc(tN), hF: loc(tF) };
};
export const rnd = (i: number) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// ---------------------------------------------------------------- shared words
export const Label: React.FC<{ y: number; t: string }> = ({ y, t }) => (
  <g><rect x={0} y={y - 50} width={1080} height={70} fill="#000" opacity={0.55} /><text x={540} y={y} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={46} fill={W}>{t}</text></g>
);
export const Lanes: React.FC = () => <g><Label y={230} t="Avoids pressure" /><Label y={1010} t="Trains under it" /></g>;
export const Bubble: React.FC<{ x: number; y: number; t: string; tail?: V }> = ({ x, y, t, tail }) => {
  const w = t.length * 19 + 44;
  return (
    <g>
      {tail && <path d={`M${x - 14} ${y + 26} L${tail[0]} ${tail[1]} L${x + 14} ${y + 26} Z`} fill="#f4f4f4" stroke="#000" strokeWidth={3} strokeLinejoin="round" />}
      <rect x={x - w / 2} y={y - 32} width={w} height={60} rx={28} fill="#f4f4f4" stroke="#000" strokeWidth={3} />
      <text x={x} y={y + 10} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={32} fill="#111">{t}</text>
    </g>
  );
};
export const Big: React.FC<{ x: number; y: number; t: string; c: string; s?: number }> = ({ x, y, t, c, s = 64 }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={s} fill={c} stroke="#000" strokeWidth={s * 0.08} paintOrder="stroke">{t}</text>
);
export const Hit: React.FC<{ t: number; at: number; x: number; y: number }> = ({ x, y }) => <g stroke={W} strokeWidth={3} strokeLinecap="round">{[0, 60, 120, 180, 240, 300].map((a) => { const r = (a * Math.PI) / 180; return <line key={a} x1={x + Math.cos(r) * 20} y1={y + Math.sin(r) * 20} x2={x + Math.cos(r) * 32} y2={y + Math.sin(r) * 32} />; })}</g>;
export const Shout: React.FC<{ at: V; dir?: number }> = ({ at, dir = 1 }) => (
  <g stroke={W} strokeWidth={4} strokeLinecap="round">{[-24, 0, 24].map((a, i) => { const r = (a * Math.PI) / 180, c = Math.cos(r) * dir, s = Math.sin(r); return <line key={i} x1={at[0] + c * 26} y1={at[1] + s * 26} x2={at[0] + c * 50} y2={at[1] + s * 50} />; })}</g>
);
export const Sweat: React.FC<{ at: V; dir?: number }> = ({ at, dir = -1 }) => <g>{[[30, -14], [46, 10], [22, 24]].map(([dx, dy], i) => { const x = at[0] + dir * dx, y = at[1] + dy; return <path key={i} d={`M${x} ${y - 10} Q${x + 7} ${y + 2} ${x} ${y + 7} Q${x - 7} ${y + 2} ${x} ${y - 10}Z`} fill="#d4ecff" stroke="#000" strokeWidth={1.5} />; })}</g>;
export const Shake: React.FC<{ at: V; r?: number }> = ({ at, r = 30 }) => <g stroke={W} strokeWidth={3} strokeLinecap="round" opacity={0.8}>{[-1, 1].map((d) => <path key={d} d={`M${at[0] + d * r} ${at[1] - 12} q${d * 8} 6 0 12 q${-d * 8} 6 0 12`} fill="none" />)}</g>;

// ---------------------------------------------------------------- football
export const Ball: React.FC<{ x: number; y: number; r?: number; rot?: number }> = ({ x, y, r = 15, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <circle r={r} fill="#f6f6f6" stroke="#000" strokeWidth={2.5} />
    <path d={`M0 ${-r * 0.42} L${r * 0.4} ${-r * 0.13} L${r * 0.25} ${r * 0.34} L${-r * 0.25} ${r * 0.34} L${-r * 0.4} ${-r * 0.13} Z`} fill="#111" />
    {[0, 72, 144, 216, 288].map((a) => <line key={a} x1={0} y1={-r * 0.42} x2={0} y2={-r * 0.95} stroke="#111" strokeWidth={1.8} transform={`rotate(${a})`} />)}
  </g>
);
/** a full-size goal in 3/4 view, the mouth facing left: front post at x (near, lower), back post up-right (far) */
export const Pitch: React.FC<{ g: number; h?: number; night?: boolean }> = ({ g, h = 170, night }) => (
  <g>
    <rect x={0} y={g} width={1080} height={h} fill={night ? "#1d3a22" : "#2a4a2c"} />
    {Array.from({ length: 6 }, (_, i) => <rect key={i} x={i * 180} y={g} width={90} height={h} fill="#ffffff" opacity={0.035} />)}
    <rect x={0} y={g - 2} width={1080} height={4} fill="#5f8a5c" />
    <rect x={0} y={g + h - 30} width={1080} height={30} fill="#000" opacity={0.5} />
  </g>
);
export const KEEP_READY: Pose = { hip: [0, -H + 46], lean: 16, head: -6, hN: [56, 6], hF: [44, 14], elbow: 1, fN: [44, 0], fF: [-44, 0] };
export const KEEP_DIVE: Pose = { hip: [0, -H], lean: -4, head: -8, hN: [22, -140], hF: [4, -140], elbow: -1, fN: [16, 4], fF: [-18, 10] };
export const KICK_OVER: Pose = { hip: [-10, -H + 10], lean: -20, head: -18, hN: [-84, -6], hF: [62, -8], elbow: 1, fN: [134, -128], fF: [-8, 0] };
export const KICK_LOW: Pose = { hip: [14, -H + 18], lean: 14, head: 18, hN: [-88, -8], hF: [64, 12], elbow: 1, fN: [152, -48], fF: [-4, 0] };
export const SHOUTER: Pose = { ...STAND, head: -14, hN: [18, -60], hF: [6, -56], elbow: -1 };
export const Glove = (at: V) => <circle cx={at[0]} cy={at[1]} r={11} fill="#f0d23a" stroke="#000" strokeWidth={2.5} />;
export const Counter: React.FC<{ x: number; y: number; n: string; c: string; k?: string }> = ({ x, y, n, c, k }) => (
  <g>{k && <text x={x} y={y - 58} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={28} fill={DIM}>{k}</text>}<Big x={x} y={y} t={n} c={c} s={62} /></g>
);

// ================================================================ 1 · the final, 90+4'
// ================================================================ 2 · study at home
export const Desk: React.FC<{ x: number; g: number }> = ({ x, g }) => (
  <g>
    <rect x={x - 160} y={g - 150} width={320} height={18} fill="url(#pr2-wood)" stroke="#000" strokeWidth={3} />
    <line x1={x - 140} y1={g - 132} x2={x - 140} y2={g} stroke="#5a3b1e" strokeWidth={10} /><line x1={x + 140} y1={g - 132} x2={x + 140} y2={g} stroke="#5a3b1e" strokeWidth={10} />
  </g>
);
export const Lamp: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <rect x={x - 28} y={y - 8} width={56} height={10} rx={4} fill="#2a2a30" />
    <path d={`M${x} ${y - 6} L${x + 20} ${y - 110} L${x + 70} ${y - 130}`} fill="none" stroke="#3a3a42" strokeWidth={7} strokeLinejoin="round" />
    <path d={`M${x + 50} ${y - 150} L${x + 104} ${y - 128} L${x + 82} ${y - 100} Z`} fill="#3a3a42" stroke="#000" strokeWidth={3} />
    <path d={`M${x + 92} ${y - 112} L${x + 30} ${y} L${x + 200} ${y} Z`} fill="#ffe2a0" opacity={0.18} />
    <Glow at={[x + 92, y - 112]} r={160} color="#ffd890" a={0.45} />
  </g>
);
export const Paper: React.FC<{ x: number; y: number; marks: ("ok" | "x" | "line")[]; rot?: number; score?: string; scoreC?: string; shown?: number }> = ({ x, y, marks, rot = 0, score, scoreC, shown = 99 }) => (
  <g transform={`rotate(${rot} ${x} ${y})`}>
    <rect x={x - 70} y={y - 46} width={140} height={92} fill="#f4f1e6" stroke="#000" strokeWidth={2.5} />
    {marks.map((m, i) => { const yy = y - 30 + i * 15; return <g key={i}><line x1={x - 56} y1={yy} x2={x + 26} y2={yy} stroke="#9a968a" strokeWidth={3} />{i < shown && m === "ok" && <path d={`M${x + 36} ${yy - 2} l5 6 l10 -12`} fill="none" stroke={GREEN} strokeWidth={3.5} />}{i < shown && m === "x" && <path d={`M${x + 36} ${yy - 6} l12 12 M${x + 48} ${yy - 6} l-12 12`} stroke={RED} strokeWidth={3.5} />}</g>; })}
    {score && <text x={x + 34} y={y + 34} textAnchor="middle" fontFamily={HAND} fontWeight={800} fontSize={42} fill={scoreC}>{score}</text>}
  </g>
);
export const sitDesk = (lean: number, head: number): Pose => ({ ...POSES.sit(96), lean, head });
export const StudyLane: React.FC<{ g: number; hard: boolean; marks?: number; t?: number }> = ({ g, hard, marks = 99, t = 0 }) => {
  const dx = 560, sx = 400, wob = Math.sin(t * 0.9) * 8;
  const p = reach(sitDesk(hard ? 26 : 10, hard ? 30 : 16), sx, g, [dx - 40 + wob, g - 160], [dx - 90, g - 158]);
  return (
    <g>
      <rect x={0} y={g - 560} width={1080} height={560} fill="#0d0d11" />
      <rect x={0} y={g} width={1080} height={170} fill="#1a1612" /><rect x={0} y={g - 2} width={1080} height={4} fill="#3a3028" />
      {/* a window with the night outside */}
      <rect x={760} y={g - 470} width={200} height={230} fill="#0a1424" stroke="#2a2a30" strokeWidth={10} /><circle cx={900} cy={g - 420} r={18} fill="#e8e8f0" opacity={0.8} />
      <Desk x={dx} g={g} />
      <Lamp x={dx + 90} y={g - 150} />
      <rect x={sx - 40} y={g - 70} width={80} height={12} rx={4} fill="url(#pr2-wood)" stroke="#000" strokeWidth={3} /><line x1={sx} y1={g - 58} x2={sx} y2={g} stroke="#5a3b1e" strokeWidth={9} />
      <Hero x={sx} y={g} s={S} look={BOLD} pose={p} />
      {hard ? (
        <g>
          <Paper x={dx - 20} y={g - 180} marks={["x", "x", "ok", "x", "x"]} rot={-4} shown={marks} />
          <Paper x={dx + 60} y={g - 168} marks={["x", "ok", "x", "x", "ok"]} rot={6} shown={marks - 5} />
          {/* a kitchen timer counting down */}
          <g transform={`translate(${dx - 120} ${g - 176})`}><circle r={22} fill="#e0483e" stroke="#000" strokeWidth={3} /><text y={8} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={18} fill="#fff">{`28:${String(59 - (Math.floor(t / 2) % 60)).padStart(2, "0")}`}</text></g>
          <Counter x={200} y={g - 330} n="✗ ✗ ✗" c={RED} k="HARDEST SET" />
        </g>
      ) : (
        <g>
          <Paper x={dx - 10} y={g - 176} marks={["ok", "ok", "ok", "ok", "ok"]} rot={-3} shown={marks} />
          <rect x={dx + 50} y={g - 186} width={70} height={36} fill="#3a5aa0" stroke="#000" strokeWidth={2.5} /><text x={dx + 85} y={g - 162} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={14} fill="#fff">EASY</text>
          <Counter x={200} y={g - 330} n="✓ ✓ ✓" c={GREEN} k="EASY SET" />
        </g>
      )}
    </g>
  );
};
export const F2: React.FC = () => <><StudyLane g={G1} hard={false} /><StudyLane g={G2} hard /><Lanes /></>;

// ================================================================ objects only · the coal under the press
export const Coal: React.FC<{ x: number; y: number; w?: number; crumbled?: boolean }> = ({ x, y, w = 130, crumbled }) => {
  const pts: V[] = [[-0.5, 0.1], [-0.38, -0.32], [-0.08, -0.5], [0.3, -0.42], [0.5, -0.08], [0.42, 0.28], [0.06, 0.42], [-0.34, 0.36]];
  const P = (q: V, k = 1): string => `${(x + q[0] * w * k).toFixed(1)} ${(y + q[1] * w * 0.8 * k).toFixed(1)}`;
  if (crumbled) return <g>{Array.from({ length: 9 }, (_, i) => { const cx = x - w * 0.5 + rnd(i) * w, cy = y + w * 0.3 - rnd(i + 7) * w * 0.25, r = 8 + rnd(i + 3) * 16; return <path key={i} d={`M${cx - r} ${cy} L${cx - r * 0.3} ${cy - r} L${cx + r} ${cy - r * 0.4} L${cx + r * 0.6} ${cy + r * 0.5} Z`} fill="#26262c" stroke="#000" strokeWidth={2} />; })}<ellipse cx={x} cy={y + w * 0.4} rx={w * 0.7} ry={8} fill="#3a3a42" opacity={0.6} /></g>;
  return (
    <g>
      <path d={`M${pts.map((q) => P(q)).join(" L")} Z`} fill="#16161a" stroke="#000" strokeWidth={3} strokeLinejoin="round" />
      <path d={`M${P(pts[1])} L${P([0.02, -0.1])} L${P(pts[3])} M${P([0.02, -0.1])} L${P(pts[6])}`} stroke="#3a3a42" strokeWidth={2.5} fill="none" />
      <path d={`M${P(pts[1])} L${P(pts[2])} L${P([0.02, -0.1])} Z`} fill="#4a4a52" opacity={0.6} />
      <path d={`M${P(pts[3])} L${P(pts[4])} L${P([0.02, -0.1])} Z`} fill="#2e2e34" opacity={0.8} />
    </g>
  );
};
export const Diamond: React.FC<{ x: number; y: number; w?: number }> = ({ x, y, w = 120 }) => {
  const h = w * 0.95, t = y - h * 0.32;
  const crown: V[] = [[x - w / 2, t], [x - w * 0.3, t - h * 0.22], [x + w * 0.3, t - h * 0.22], [x + w / 2, t]];
  const tip: V = [x, y + h * 0.5];
  return (
    <g>
      <Rays f={10} at={[x, t]} a={0.5} color={GOLD} n={12} len={260} />
      <Glow at={[x, t]} r={200} color="#fff3c0" a={0.55} />
      <path d={`M${crown.map((q) => q.join(" ")).join(" L")} L${tip.join(" ")} Z`} fill="#f4f4f6" stroke="#000" strokeWidth={3} strokeLinejoin="round" />
      <path d={`M${x - w / 2} ${t} L${x + w / 2} ${t} M${x - w * 0.3} ${t - h * 0.22} L${x - w * 0.12} ${t} L${x} ${t - h * 0.22} L${x + w * 0.12} ${t} L${x + w * 0.3} ${t - h * 0.22} M${x - w * 0.12} ${t} L${x} ${tip[1]} L${x + w * 0.12} ${t} M${x - w / 2} ${t} L${x} ${tip[1]} L${x + w / 2} ${t}`} stroke="#8a8a92" strokeWidth={2} fill="none" />
      <path d={`M${x - w * 0.3} ${t - h * 0.22} L${x - w * 0.12} ${t} L${x - w / 2} ${t} Z`} fill="#ffffff" opacity={0.9} />
      <path d={`M${x + w * 0.12} ${t} L${x} ${tip[1]} L${x + w / 2} ${t} Z`} fill="#c8c8d0" opacity={0.8} />
      <path d={`M${x + 34} ${t - 50} l4 -16 l4 16 l16 4 l-16 4 l-4 16 l-4 -16 l-16 -4 Z`} fill="#fff" />
    </g>
  );
};
export const PressGauge: React.FC<{ x: number; y: number; v: number }> = ({ x, y, v }) => {
  const a = (-210 + 240 * v) * Math.PI / 180;
  return (
    <g>
      <circle cx={x} cy={y} r={70} fill="#e8e8ec" stroke="#2a2a30" strokeWidth={8} />
      <path d={`M${x + Math.cos(-30 * Math.PI / 180) * 56} ${y + Math.sin(-30 * Math.PI / 180) * 56} A56 56 0 0 0 ${x + Math.cos(-75 * Math.PI / 180) * 56} ${y + Math.sin(-75 * Math.PI / 180) * 56}`} fill="none" stroke={RED} strokeWidth={10} />
      {Array.from({ length: 9 }, (_, i) => { const b = (-210 + i * 30) * Math.PI / 180; return <line key={i} x1={x + Math.cos(b) * 50} y1={y + Math.sin(b) * 50} x2={x + Math.cos(b) * 60} y2={y + Math.sin(b) * 60} stroke="#333" strokeWidth={3} />; })}
      <line x1={x} y1={y} x2={x + Math.cos(a) * 52} y2={y + Math.sin(a) * 52} stroke="#111" strokeWidth={6} strokeLinecap="round" />
      <circle cx={x} cy={y} r={8} fill="#111" />
      <text x={x} y={y + 40} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={24} fill="#111">{Math.round(v * 100)}%</text>
      <text x={x} y={y + 104} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={24} fill={DIM}>PRESSURE</text>
    </g>
  );
};
export const Block: React.FC<{ x: number; y: number; t: string; w?: number }> = ({ x, y, t, w = 250 }) => (
  <g>
    <rect x={x - w / 2} y={y - 62} width={w} height={62} rx={4} fill="url(#pr3-steel)" stroke="#000" strokeWidth={3} />
    <rect x={x - w / 2 + 6} y={y - 58} width={w - 12} height={6} fill="#fff" opacity={0.25} />
    <text x={x} y={y - 20} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={30} fill="#141418">{t}</text>
  </g>
);
export const PressLane: React.FC<{ g: number; heavy: boolean; open: boolean; anim?: { pillow: number; blocks: number; gauge: number; lift: number; t: number } }> = ({ g, heavy, open, anim }) => {
  const cx = 460, top = g - 46;
  const A = anim ?? { pillow: 1, blocks: 3, gauge: heavy ? 1 : 0, lift: open ? 1 : 0, t: 0 };
  const lift = A.lift, isOpen = lift > 0.35;
  const fallY = (i: number) => -Math.pow(1 - clamp(A.blocks - i), 2) * 320;
  const squeeze = heavy && !isOpen && A.blocks >= 3 ? Math.sin(A.t * 1.7) * 1.5 : 0;
  return (
    <g>
      <rect x={0} y={g - 560} width={1080} height={560} fill="#0b0b0e" />
      <rect x={0} y={g} width={1080} height={170} fill="#141418" /><rect x={0} y={g - 2} width={1080} height={4} fill="#3a3a42" />
      {/* the press: an anvil bed, two guide columns */}
      <rect x={cx - 200} y={g - 46} width={400} height={46} fill="url(#pr3-steel)" stroke="#000" strokeWidth={3} />
      <rect x={cx - 190} y={g - 520} width={22} height={474} fill="#3a3a42" stroke="#000" strokeWidth={2} /><rect x={cx + 168} y={g - 520} width={22} height={474} fill="#3a3a42" stroke="#000" strokeWidth={2} />
      {heavy ? (
        <g transform={`translate(0 ${-190 * lift + squeeze})`} opacity={1 - 0.45 * lift}>
          <rect x={cx - 170} y={top - 130} width={340} height={26} fill="url(#pr3-steel)" stroke="#000" strokeWidth={3} />
          {A.blocks > 0 && <g transform={`translate(0 ${fallY(0)})`}><Block x={cx} y={top - 130} t="KEEPER" /></g>}{A.blocks > 1 && <g transform={`translate(0 ${fallY(1)})`}><Block x={cx} y={top - 192} t="TIMER" /></g>}{A.blocks > 2 && <g transform={`translate(0 ${fallY(2)})`}><Block x={cx} y={top - 254} t="HECKLERS" /></g>}
        </g>
      ) : (
        <g transform={`translate(${120 * lift} ${-40 * lift - (1 - A.pillow) * 260}) rotate(${-10 * lift})`}>
          <ellipse cx={cx} cy={top - 132} rx={150} ry={36} fill="#d8d8de" stroke="#000" strokeWidth={3} />
          <path d={`M${cx - 120} ${top - 140} Q${cx} ${top - 120} ${cx + 120} ${top - 138}`} fill="none" stroke="#b8b4c4" strokeWidth={3} />
          <text x={cx} y={top - 122} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={30} fill="#5a5a6a">EASY</text>
        </g>
      )}
      {isOpen ? (heavy ? <g transform={`translate(${cx} ${top - 40}) scale(${0.6 + 0.4 * clamp((lift - 0.35) / 0.4)}) translate(${-cx} ${-(top - 40)})`}><Diamond x={cx} y={top - 40} w={120} /></g> : <Coal x={cx} y={top - 48} crumbled />) : <Coal x={cx} y={top - 52} />}
      <PressGauge x={880} y={g - 330} v={A.gauge} />
    </g>
  );
};
export const FCoalA: React.FC = () => <><PressLane g={G1} heavy={false} open={false} /><PressLane g={G2} heavy open={false} /><Lanes /></>;
export const FCoalB: React.FC = () => <><PressLane g={G1} heavy={false} open /><PressLane g={G2} heavy open /><Lanes /></>;

// ================================================================ the end: two open hands, coal and a diamond
export const HandLane: React.FC<{ g: number; diamond: boolean }> = ({ g, diamond }) => {
  const x = 380, s = 1.25;
  const hold: Pose = { ...STAND, lean: 8, head: 30, hN: [104, 34], hF: [-6, 120], elbow: 1 };
  const jj = J(x, g, hold, false, s);
  return (
    <g>
      <rect x={0} y={g - 560} width={1080} height={560} fill={diamond ? "#120f08" : "#0b0b0e"} />
      {diamond && <rect x={0} y={g - 560} width={1080} height={560} fill="url(#pr3-dawn)" />}
      <Pitch g={g} />
      <Hero x={x} y={g + 40} s={s} look={BOLD} pose={hold} />
      {diamond ? <Diamond x={jj.wN[0] + 6} y={jj.wN[1] - 34} w={84} /> : <Coal x={jj.wN[0] + 6} y={jj.wN[1] - 30} w={90} />}
    </g>
  );
};
export const FEnd: React.FC = () => (
  <>
    <HandLane g={G1} diamond={false} />
    <HandLane g={G2} diamond />
    <Lanes />
    <text x={540} y={1790} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={64} fill={W}>Pressure makes diamonds.</text>
    <text x={540} y={1866} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={58} fill={GOLD}>Train under it.</text>
  </>
);

export const PRESSURED: Pose = { hip: [0, -H + 12], lean: 18, head: 46, hN: [30, 100], hF: [-40, 94], elbow: -1, fN: [22, 0], fF: [-22, 0] };
export const FOCUSED: Pose = { hip: [0, -H + 4], lean: 4, head: 26, hN: [26, 128], hF: [-18, 128], elbow: 1, fN: [30, 0], fF: [-34, 0] };
export const Referee: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 0.5 }) => (
  <Hero x={x} y={y} s={s} look={{ ...BOLD_GREY, body: "#2a2a30", far: "#1c1c22", glow: 0 }} pose={{ ...STAND, head: 8, hN: [26, 40], hF: [-6, 120], elbow: 1 }} flip shadow={0.2}
    hold={(j) => <g><rect x={j.wN[0] - 4} y={j.wN[1] - 10} width={8} height={10} fill="#e0c040" /><rect x={j.sh[0] - 14} y={j.sh[1] - 4} width={28} height={10} fill="#e0c040" opacity={0.9} /></g>} />
);

// ================================================================ v6c · the pitch, drawn like the reference (EQhrPwTjhBI): fan stripes, thin white box lines,
// the goal on the right seen at an angle with a fine net, a dense crowd with red scarves and flags, a strip of LED boards, floodlight beams
export const P0 = (g: number) => g - 285; // far edge of the pitch (under the LED boards)
export const PB = (g: number) => g + 170; // bottom of the lane
export const goalLine = (g: number, u: number): V => [800 + 300 * u, P0(g) + (PB(g) - P0(g)) * u];
export const goalLineAtY = (g: number, y: number): V => goalLine(g, (y - P0(g)) / (PB(g) - P0(g)));
export const FanPitch: React.FC<{ g: number; night?: boolean }> = ({ g, night }) => {
  const vp: V = [560, g - 1100], y0 = P0(g), y1 = PB(g);
  const xAt = (bx: number, y: number) => vp[0] + (bx - vp[0]) * ((y - vp[1]) / (y1 - vp[1]));
  const bands: React.ReactNode[] = [];
  for (let k = 0; k < 16; k++) {
    const a = -500 + k * 140, b = a + 140;
    bands.push(<path key={k} d={`M${xAt(a, y0)} ${y0} L${xAt(b, y0)} ${y0} L${b} ${y1} L${a} ${y1} Z`} fill={k % 2 ? (night ? "#1d4a3e" : "#2f8a3a") : (night ? "#183f35" : "#277a32")} />);
  }
  return (
    <g>
      {bands}
      <rect x={0} y={y0} width={1080} height={(y1 - y0) * 0.35} fill="#000" opacity={night ? 0.25 : 0.12} />
      <line x1={0} y1={y1 - 36} x2={1080} y2={y1 - 36} stroke="#f4f4ec" strokeWidth={3} opacity={0.8} />
      <line x1={0} y1={y1 - 24} x2={1080} y2={y1 - 24} stroke="#f4f4ec" strokeWidth={3} opacity={0.6} />
    </g>
  );
};
export const BoxLines2: React.FC<{ g: number }> = ({ g }) => {
  const L = "#f6f6ee", yN = g + 96, yF = g - 196, yn = g + 8, yf = g - 128;
  const gN = goalLineAtY(g, yN), gF = goalLineAtY(g, yF), sN = goalLineAtY(g, yn), sF = goalLineAtY(g, yf);
  const top = P0(g) + 22, gT = goalLineAtY(g, top);
  return (
    <g stroke={L} strokeWidth={3.5} fill="none" opacity={0.92}>
      <line x1={goalLine(g, 0)[0]} y1={goalLine(g, 0)[1]} x2={goalLine(g, 1)[0]} y2={goalLine(g, 1)[1]} />
      <line x1={0} y1={top} x2={gT[0]} y2={top} opacity={0.7} />
      <path d={`M${gN[0]} ${yN} L70 ${yN} L150 ${yF} L${gF[0]} ${yF}`} />
      <path d={`M${sN[0]} ${yn} L640 ${yn} L680 ${yf} L${sF[0]} ${yf}`} />
      <ellipse cx={430} cy={g - 50} rx={9} ry={3.5} fill={L} stroke="none" />
    </g>
  );
};
export const SPOT = (g: number): V => [430, g - 50];
/** the goal standing on the goal line: front post (near, tall), back post, crossbar, a fine net running back to the right */
export const Goal2: React.FC<{ g: number; bulge?: number }> = ({ g, bulge = 0 }) => {
  const fp = goalLine(g, 0.6), bp = goalLine(g, 0.38);
  const fh = 330, bh = 270, ft: V = [fp[0], fp[1] - fh], bt: V = [bp[0], bp[1] - bh];
  const D: V = [170, -24];
  const net: React.ReactNode[] = [];
  const mid = (a: V, b: V, u: number): V => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
  const rf: V = [fp[0] + D[0], fp[1] + D[1] + 40], rft: V = [ft[0] + D[0] * 0.8, ft[1] + D[1] + 60], rb: V = [bp[0] + D[0], bp[1] + D[1] + 30], rbt: V = [bt[0] + D[0] * 0.8, bt[1] + D[1] + 50];
  for (let i = 0; i <= 14; i++) { const u = i / 14; const a = mid(ft, fp, u), b = mid(rft, rf, u); net.push(<line key={`a${i}`} x1={a[0]} y1={a[1]} x2={b[0] + bulge * 24 * Math.sin(u * Math.PI)} y2={b[1]} />); }
  for (let i = 0; i <= 10; i++) { const u = i / 10; const a = mid(fp, rf, u), b = mid(ft, rft, u); net.push(<line key={`b${i}`} x1={a[0] + bulge * 18 * Math.sin(u * Math.PI)} y1={a[1]} x2={b[0] + bulge * 18 * Math.sin(u * Math.PI)} y2={b[1]} />); }
  for (let i = 0; i <= 10; i++) { const u = i / 10; const a = mid(ft, bt, u), b = mid(rft, rbt, u); net.push(<line key={`c${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />); }
  for (let i = 0; i <= 8; i++) { const u = i / 8; const a = mid(rft, rbt, u), b = mid(rf, rb, u); net.push(<line key={`d${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />); }
  return (
    <g>
      <g stroke="#e8e8ee" strokeWidth={1.3} opacity={0.55}>{net}</g>
      <path d={`M${rft[0]} ${rft[1]} L${rbt[0]} ${rbt[1]} L${rb[0]} ${rb[1]}`} fill="none" stroke="#c8c8d0" strokeWidth={3} />
      <path d={`M${bp[0]} ${bp[1]} L${bt[0]} ${bt[1]} L${ft[0]} ${ft[1]}`} fill="none" stroke="#f2f2f2" strokeWidth={9} strokeLinejoin="round" />
      <line x1={fp[0]} y1={fp[1]} x2={ft[0]} y2={ft[1]} stroke="#000" strokeWidth={14} strokeLinecap="round" />
      <line x1={fp[0]} y1={fp[1]} x2={ft[0]} y2={ft[1]} stroke="#fafafa" strokeWidth={10} strokeLinecap="round" />
    </g>
  );
};
export const GOAL_MOUTH = (g: number) => ({ fp: goalLine(g, 0.6), bp: goalLine(g, 0.38) });
/** the stands like the reference: rows of fans (body, arms, a red scarf held up), red flags, two red flares, camera flashes; LED boards below */
export const BigCrowd: React.FC<{ g: number; cheer?: number }> = ({ g, cheer = 0.6 }) => {
  const top = g - 560, bot = P0(g) - 36, out: React.ReactNode[] = [];
  const rows = 8;
  for (let r = 0; r < rows; r++) {
    const t = r / (rows - 1), y = top + 16 + (bot - top - 52) * t, hr = 5 + t * 2.4, step = hr * 3.4;
    for (let i = 0, x = 4 + (r % 2) * step * 0.5; x < 1084; i++, x += step * (0.9 + rnd(r * 31 + i) * 0.2)) {
      const k = r * 977 + i, up = rnd(k) < cheer, scarf = up && rnd(k + 3) < 0.45, tone = Math.round(110 + rnd(k + 1) * 110), c = `rgb(${tone},${tone},${tone + 4})`;
      const sw = hr * 0.62, sh = y + hr * 1.6;
      out.push(<g key={k} stroke={c} strokeWidth={sw} strokeLinecap="round">
        <line x1={x} y1={y + hr} x2={x} y2={y + hr * 4.4} />
        {up ? <><line x1={x} y1={sh} x2={x - hr * 1.1} y2={y - hr * 1.3} /><line x1={x} y1={sh} x2={x + hr * 1.1} y2={y - hr * 1.3} /></>
            : <><line x1={x} y1={sh} x2={x - hr * 0.8} y2={y + hr * 3.6} /><line x1={x} y1={sh} x2={x + hr * 0.8} y2={y + hr * 3.6} /></>}
        <circle cx={x} cy={y} r={hr} fill={c} stroke="none" />
        {scarf && <rect x={x - hr * 1.4} y={y - hr * 2.1} width={hr * 2.8} height={hr * 0.9} fill="#c8352e" stroke="none" />}
        {!up && rnd(k + 5) < 0.35 && <line x1={x - hr * 0.8} y1={y + hr * 1.8} x2={x + hr * 0.8} y2={y + hr * 1.8} stroke="#b02a24" strokeWidth={hr * 0.8} />}
      </g>);
    }
  }
  const flags = Array.from({ length: 12 }, (_, i) => { const x = 20 + rnd(i + 40) * 1020, y = top + 30 + rnd(i + 60) * (bot - top - 90); return <g key={`f${i}`}><line x1={x} y1={y} x2={x} y2={y + 40} stroke="#ddd" strokeWidth={2.5} /><rect x={x} y={y} width={40} height={24} fill="#c8352e" stroke="#000" strokeWidth={1} /><rect x={x + 8} y={y + 10} width={24} height={4} fill="#fff" /></g>; });
  const flares = [[140, top + 150], [520, top + 120], [880, top + 170]].map(([x, y], i) => <g key={`r${i}`}><Glow at={[x, y]} r={110} color="#ff4a3a" a={0.55} /><circle cx={x} cy={y} r={6} fill="#ffd0c0" /></g>);
  const flashes = Array.from({ length: 6 }, (_, i) => { const x = rnd(i + 90) * 1080, y = top + 20 + rnd(i + 95) * (bot - top - 40); return <g key={`x${i}`}><Glow at={[x, y]} r={34} color="#ffffff" a={0.7} /><path d={`M${x} ${y - 12} L${x + 2} ${y - 2} L${x + 12} ${y} L${x + 2} ${y + 2} L${x} ${y + 12} L${x - 2} ${y + 2} L${x - 12} ${y} L${x - 2} ${y - 2} Z`} fill="#fff" /></g>; });
  const boards = Array.from({ length: 8 }, (_, i) => <g key={`b${i}`}><rect x={i * 140} y={P0(g) - 32} width={136} height={28} fill={i % 3 === 1 ? "#d8d8dc" : i % 3 === 2 ? "#202024" : "#c8352e"} />{[0, 1, 2].map((d) => <rect key={d} x={i * 140 + 30 + d * 30} y={P0(g) - 20} width={18} height={4} fill={i % 3 === 1 ? "#9a9aa2" : "#7a1e1a"} />)}</g>);
  return <g><rect x={0} y={top} width={1080} height={bot - top + 10} fill="#121216" />{out}{flags}{flares}{flashes}<rect x={0} y={P0(g) - 36} width={1080} height={36} fill="#0c0c0f" />{boards}</g>;
};
export const EmptySeats: React.FC<{ g: number }> = ({ g }) => {
  const top = g - 560, bot = P0(g) - 34, out: React.ReactNode[] = [];
  for (let r = 0; r < 10; r++) { const y = top + 30 + r * ((bot - top - 40) / 10), w = 10 + r * 1.2; for (let x = 6; x < 1080; x += w * 1.7) out.push(<rect key={`${r}-${x}`} x={x} y={y} width={w} height={w * 0.8} fill="#1a2436" />); }
  for (let i = 0; i < 6; i++) out.push(<line key={`p${i}`} x1={i * 200 + 60} y1={top} x2={i * 200 + 60} y2={bot} stroke="#0c121c" strokeWidth={10} />);
  return <g><rect x={0} y={top} width={1080} height={bot - top + 10} fill="#0d121b" />{out}<rect x={0} y={P0(g) - 36} width={1080} height={36} fill="#0a0d12" /></g>;
};
export const Beams: React.FC<{ g: number; a?: number }> = ({ g, a = 0.08 }) => (
  <g>
    <path d={`M0 ${g - 560} L120 ${g - 560} L620 ${PB(g)} L360 ${PB(g)} Z`} fill="#ffffff" opacity={a} />
    <path d={`M1080 ${g - 560} L960 ${g - 560} L700 ${PB(g)} L960 ${PB(g)} Z`} fill="#ffffff" opacity={a * 0.8} />
  </g>
);
export const RainLines: React.FC<{ g: number }> = ({ g }) => <g stroke="#9fb4cc" strokeWidth={2} opacity={0.4}>{Array.from({ length: 80 }, (_, i) => { const x = rnd(i) * 1100, y = g - 560 + rnd(i + 50) * 700; return <line key={i} x1={x} y1={y} x2={x - 8} y2={y + 26} />; })}</g>;
export const Cone: React.FC<{ x: number; y: number }> = ({ x, y }) => <g><path d={`M${x - 10} ${y} L${x} ${y - 24} L${x + 10} ${y} Z`} fill="#e07a2a" stroke="#000" strokeWidth={2} /><rect x={x - 13} y={y - 3} width={26} height={4} fill="#e07a2a" stroke="#000" strokeWidth={1.5} /></g>;
export const KS = 0.8;
export const KickLane2: React.FC<{ g: number; stage: "practice" | "before" | "after"; good: boolean }> = ({ g, stage, good }) => {
  const final = stage !== "practice", sp = SPOT(g), kx = sp[0] - 120;
  const { fp, bp } = GOAL_MOUTH(g), kpx = (fp[0] + bp[0]) / 2 - 6, kpy = (fp[1] + bp[1]) / 2 + 6;
  const keeperLook: HeroLook = { ...GREYL, body: "#c9a640", far: "#8a7230" };
  const gloves = (j: { wN: V; wF: V }) => <g>{Glove(j.wN)}{Glove(j.wF)}</g>;
  const ballMouth: V = [fp[0] - 10, fp[1] - 250];
  let kicker: React.ReactNode = null, keeper: React.ReactNode = null, extra: React.ReactNode = null;
  if (stage === "before") {
    const pose = good ? FOCUSED : PRESSURED, kj = J(kx, g, pose, false, KS);
    kicker = <g><Hero x={kx} y={g} s={KS} look={BOLD} pose={pose} />{!good && <><Shake at={[kj.aN[0], kj.aN[1] - 40]} r={26} /><Shake at={[kj.aF[0], kj.aF[1] - 40]} r={26} /><Sweat at={kj.head} /></>}</g>;
    keeper = <Hero x={kpx} y={kpy} s={0.7} look={keeperLook} pose={{ ...KEEP_READY, hN: [80, -40], hF: [70, -30] }} flip hold={gloves} />;
    extra = <><Ball x={sp[0]} y={sp[1] - 12} r={13} />{good && <path d={`M${kj.head[0] + 10} ${kj.head[1] + 14} L${sp[0] - 4} ${sp[1] - 18}`} stroke={GOLD} strokeWidth={2.5} strokeDasharray="4 8" opacity={0.75} />}</>;
  } else if (stage === "after" && !good) {
    const kj = J(sp[0] - 40, g, KICK_OVER, false, KS);
    kicker = <g><Hero x={sp[0] - 40} y={g} s={KS} look={BOLD} pose={KICK_OVER} /><Sweat at={kj.head} /></g>;
    keeper = <Hero x={kpx} y={kpy} s={0.7} look={keeperLook} pose={KEEP_READY} flip hold={gloves} />;
    extra = <><path d={`M${sp[0] + 10} ${sp[1] - 14} Q${fp[0] - 200} ${g - 560} ${fp[0] + 40} ${g - 530}`} fill="none" stroke={W} strokeWidth={3} strokeDasharray="6 8" opacity={0.8} /><Ball x={fp[0] + 40} y={g - 530} r={13} rot={30} /></>;
  } else if (stage === "after" && good) {
    kicker = <Hero x={sp[0] + 20} y={g} s={KS} look={BOLD} pose={{ ...EMOTE.armsWide(), lean: -8 }} />;
    keeper = <Hero x={kpx - 30} y={kpy - 40} s={0.7} look={keeperLook} pose={KEEP_DIVE} flip rot={58} shadow={0} hold={gloves} />;
    extra = <><Ball x={ballMouth[0] + 30} y={ballMouth[1] + 20} r={13} /><Glow at={[ballMouth[0] + 30, ballMouth[1] + 20]} r={220} color={GOLD} a={0.35} /><Big x={250} y={g + 110} t="GOAL" c={GOLD} s={96} /></>;
  } else if (!good) {
    // practice, the easy way: a lonely evening, an empty goal, the balls all in the net
    kicker = <Hero x={sp[0] - 30} y={g} s={KS} look={BOLD} pose={KICK_LOW} />;
    extra = <>{Array.from({ length: 10 }, (_, i) => <Ball key={i} x={fp[0] + 40 + (i % 4) * 28} y={fp[1] - 8 - Math.floor(i / 4) * 20 - (i % 4) * 6} r={12} />)}</>;
  } else {
    // practice, the hard way: rain, cones, a real keeper, three teammates shouting behind him
    kicker = <Hero x={sp[0] - 30} y={g} s={KS} look={BOLD} pose={KICK_LOW} />;
    keeper = <Hero x={kpx - 30} y={kpy - 40} s={0.7} look={keeperLook} pose={KEEP_DIVE} flip rot={52} shadow={0} hold={gloves} />;
    extra = <>
      <Ball x={kpx - 250} y={kpy - 236} r={13} rot={40} /><Hit t={0} at={0} x={kpx - 250} y={kpy - 236} />
      {[[110, g + 70], [170, g + 90], [470, g + 80]].map(([x, y], i) => <Cone key={i} x={x} y={y} />)}
      {[[420, g + 40], [520, g - 120], [210, g - 150], [880, g + 60]].map(([x, y], i) => <Ball key={i} x={x} y={y} r={12} />)}
      {[0, 1, 2].map((i) => { const x = 60 + i * 70, y = g - 110, p = { ...SHOUTER, lean: -4 + i * 3 }, jj = J(x, y, p, false, 0.6); return <g key={i}><Hero x={x} y={y} s={0.6} look={GREYL} pose={p} shadow={0.15} /><Shout at={[jj.head[0] + 14, jj.head[1]]} /></g>; })}
    </>;
  }
  return (
    <g>
      <rect x={0} y={g - 560} width={1080} height={730} fill={final ? "#08080b" : "#0a0e15"} />
      {final ? <BigCrowd g={g} cheer={stage === "after" && good ? 0.9 : 0.4} /> : <EmptySeats g={g} />}
      <FanPitch g={g} night={!final} />
      <BoxLines2 g={g} />
      {final && <g>{Array.from({ length: 6 }, (_, i) => { const x = 60 + i * 44, y = P0(g) + 50; const up = stage === "after" && good && i % 2 === 0; const p: Pose = up ? { ...STAND, head: -16, hN: [30, -120], hF: [-20, -116], elbow: -1 } : { ...STAND, lean: 4, head: 14, hN: [62, -14], hF: [-62, -14], elbow: 1 }; return <Hero key={i} x={x} y={y} s={0.34} look={{ ...GREYL, body: "#8a8a94", far: "#6a6a72" }} pose={p} shadow={0.15} />; })}</g>}
      {final && <Referee x={goalLine(g, 0.2)[0] + 60} y={goalLine(g, 0.2)[1] + 10} s={0.42} />}
      <Goal2 g={g} bulge={(stage === "after" && good) || (stage === "practice" && !good) ? 1 : 0} />
      {keeper}
      {extra}
      {kicker}
      {!final && good && <RainLines g={g} />}
      <Beams g={g} a={final ? 0.07 : 0.05} />
      {final && <g transform={`translate(540 ${g - 530})`}><rect x={-130} y={-30} width={260} height={62} rx={8} fill="#0b0b0e" stroke="#4a4a52" strokeWidth={3} /><text x={-50} y={14} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={40} fill="#ffd25a">0–0</text><text x={62} y={12} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={30} fill={W}>90+4'</text></g>}
      {stage === "practice" && <Counter x={900} y={g - 400} n={good ? "4/10" : "10/10"} c={good ? RED : GREEN} k="PRACTICE" />}
    </g>
  );
};
export const FP0: React.FC = () => (
  <>
    <KickLane2 g={G1} stage="practice" good={false} />
    <KickLane2 g={G2} stage="practice" good />
    <Lanes />
    <text x={540} y={92} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={50} fill={W}>10 out of 10 in practice.</text>
    <text x={540} y={150} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={54} fill={GOLD}>Who scores?</text>
  </>
);
export const FP1: React.FC = () => <><KickLane2 g={G1} stage="before" good={false} /><KickLane2 g={G2} stage="before" good /><Lanes /><Bubble x={320} y={440} t="Everyone's watching." tail={[250, 560]} /></>;
export const FP2: React.FC = () => <><KickLane2 g={G1} stage="after" good={false} /><KickLane2 g={G2} stage="after" good /><Lanes /></>;

// ================================================================ v6c · exam room in clean side view (like the reference's office desks)
/** one student at one desk, side view: the desk top sits below the shoulder, the hands are placed ON it (IK), every kind a different pose */
export type Kind = "write" | "think" | "scratch" | "read" | "clock" | "frozen" | "lean";
export const deskTopOf = (g: number, s: number) => g - 100 * s;
export const seatPose = (kind: Kind, x: number, g: number, s: number): Pose => {
  const sc = s * S, dt = deskTopOf(g, s), paper: V = [x + 92 * s, dt - 5 * s], rest: V = [x + 62 * s, dt - 4 * s];
  const sit = (lean: number, head: number): Pose => ({ ...POSES.sit(92), lean, head, hN: [0, 0], hF: [0, 0], elbow: 1 });
  const headOf = (p: Pose) => J(x, g, p, false, sc).head;
  switch (kind) {
    case "write": return reach(sit(30, 40), x, g, paper, rest, false, sc);
    case "lean": return reach(sit(40, 46), x, g, [paper[0] - 6 * s, paper[1]], [rest[0] - 10 * s, rest[1]], false, sc);
    case "think": { const b = sit(16, 8), h = headOf(b); return { ...reach(b, x, g, [h[0] + 10 * s, h[1] + 26 * s], rest, false, sc), elbow: -1 }; }
    case "scratch": { const b = sit(22, 26), h = headOf(b); return reach(b, x, g, paper, [h[0] - 2 * s, h[1] - 22 * s], false, sc); }
    case "read": return reach(sit(-6, 22), x, g, [x + 86 * s, dt - 58 * s], [x + 74 * s, dt - 50 * s], false, sc);
    case "clock": return reach(sit(2, -24), x, g, paper, rest, false, sc);
    case "frozen": { const b = sit(4, -20), h = headOf(b); return reach(b, x, g, [paper[0], paper[1] - 34 * s], [h[0] - 2 * s, h[1] - 24 * s], false, sc); }
  }
};
export const ExamSeat: React.FC<{ x: number; g: number; s: number; kind: Kind; look: HeroLook; lines?: number; t?: number }> = ({ x, g, s, kind, look, lines = 4, t = 0 }) => {
  const dt = deskTopOf(g, s), pose = seatPose(kind, x + (kind === "write" || kind === "lean" ? Math.sin(t * 0.8 + x) * 3 : 0), g, s), pj = J(x, g, pose, false, s * S), seat = g - 70 * s;
  const raised = kind === "read";
  return (
    <g>
      {/* chair: seat under the hip, a back rest, legs */}
      <rect x={x - 34 * s} y={seat - 6 * s} width={68 * s} height={9 * s} rx={3} fill="#3a3a42" stroke="#000" strokeWidth={2} />
      <line x1={x - 28 * s} y1={seat} x2={x - 28 * s} y2={g} stroke="#2a2a30" strokeWidth={5 * s} /><line x1={x + 26 * s} y1={seat} x2={x + 26 * s} y2={g} stroke="#2a2a30" strokeWidth={5 * s} />
      <line x1={x - 32 * s} y1={seat - 4 * s} x2={x - 42 * s} y2={seat - 92 * s} stroke="#3a3a42" strokeWidth={7 * s} strokeLinecap="round" />
      <Hero x={x} y={g} s={s * S} look={look} pose={pose} shadow={0} />
      {/* desk */}
      <rect x={x + 34 * s} y={dt} width={142 * s} height={11 * s} fill="url(#pr2-wood)" stroke="#000" strokeWidth={2} />
      <line x1={x + 42 * s} y1={dt + 11 * s} x2={x + 42 * s} y2={g} stroke="#2a2a30" strokeWidth={6 * s} /><line x1={x + 168 * s} y1={dt + 11 * s} x2={x + 168 * s} y2={g} stroke="#2a2a30" strokeWidth={6 * s} />
      {raised
        ? <g transform={`rotate(-62 ${pj.wN[0]} ${pj.wN[1]})`}><rect x={pj.wN[0] - 4 * s} y={pj.wN[1] - 30 * s} width={46 * s} height={60 * s} fill="#f4f1e6" stroke="#000" strokeWidth={1.5} /></g>
        : <><rect x={x + 56 * s} y={dt - 4 * s} width={80 * s} height={4 * s} fill="#f4f1e6" />{Array.from({ length: lines }, (_, i) => <line key={i} x1={x + 60 * s} y1={dt - 2.5 * s} x2={x + 66 * s + i * 14 * s} y2={dt - 2.5 * s} stroke="#555" strokeWidth={1.4} />)}</>}
      {!raised && kind !== "think" && <line x1={pj.wN[0]} y1={pj.wN[1]} x2={pj.wN[0] + 5 * s} y2={pj.wN[1] + 20 * s} stroke="#e8c040" strokeWidth={5 * s} strokeLinecap="round" />}
    </g>
  );
};
export const ExamRoom2: React.FC<{ g: number; good: boolean; answered?: number; t?: number; bubble?: number }> = ({ g, good, answered, t = 0, bubble = 1 }) => {
  const x = 380, s = 1.0;
  const pose = seatPose(good ? "write" : "frozen", x, g, s);
  const pj = J(x, g, pose, false, s * S);
  return (
    <g>
      {/* the room: back wall with the board and the clock, a window, the floor */}
      <rect x={0} y={g - 560} width={1080} height={730} fill="#17181d" />
      <rect x={0} y={g} width={1080} height={170} fill="#2a2520" /><rect x={0} y={g - 2} width={1080} height={4} fill="#4a4036" />
      <rect x={0} y={g - 250} width={1080} height={8} fill="#24252b" />
      <rect x={620} y={g - 520} width={400} height={150} fill="#e8eaec" stroke="#5a5a62" strokeWidth={8} />
      <text x={820} y={g - 466} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={36} fill="#20304a">FINAL EXAM</text>
      <text x={820} y={g - 416} textAnchor="middle" fontFamily={HAND} fontWeight={700} fontSize={26} fill="#3a5a8a">90 min · no phones</text>
      <g transform={`translate(470 ${g - 470})`}><circle r={40} fill="#f0f0f0" stroke="#2a2a30" strokeWidth={6} />{Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={-33} x2={0} y2={-27} stroke="#333" strokeWidth={2.5} transform={`rotate(${i * 30})`} />)}<line x1={0} y1={0} x2={0} y2={-22} stroke="#111" strokeWidth={4} transform="rotate(320)" /><line x1={0} y1={0} x2={0} y2={-30} stroke="#e0483e" strokeWidth={2.5} transform="rotate(210)" /></g>
      <rect x={60} y={g - 520} width={200} height={190} fill="#0e1a2c" stroke="#3a3a42" strokeWidth={8} /><line x1={160} y1={g - 520} x2={160} y2={g - 330} stroke="#3a3a42" strokeWidth={6} />
      {/* back row: smaller, darker, each in a different pose */}
      {(["write", "read", "clock", "lean"] as Kind[]).map((k, i) => <ExamSeat key={`b${i}`} x={70 + i * 210} g={g - 150} s={0.62} kind={k} look={{ ...GREYL, body: "#5e5e66", far: "#45454c" }} t={t + i * 7} />)}
      {/* front row: two classmates, and him in the middle */}
      <ExamSeat x={70} g={g} s={1.0} kind="think" look={GREYL} />
      <ExamSeat x={x} g={g} s={s} kind={good ? "write" : "frozen"} look={BOLD} lines={good ? 6 : 1} t={t} />
      <ExamSeat x={680} g={g} s={1.0} kind="scratch" look={GREYL} />
      {/* the proctor at the front: a long wooden ruler in one hand, tapping it into the other palm */}
      {(() => { const px = 1010, base: Pose = { ...STAND, head: 12, hN: [0, 0], hF: [0, 0], elbow: 1 }, pp = reach(base, px, g, [px - 52, g - 150], [px - 30, g - 112], true, 0.72), jj = J(px, g, pp, true, 0.72);
        return <g><Hero x={px} y={g} s={0.72} look={{ ...BOLD_GREY, body: "#4a5a7a", far: "#3a4660" }} pose={pp} flip />
          <g transform={`rotate(-70 ${jj.wN[0]} ${jj.wN[1]})`}><rect x={jj.wN[0] - 150} y={jj.wN[1] - 7} width={170} height={14} fill="#e8c060" stroke="#000" strokeWidth={2} />{Array.from({ length: 16 }, (_, i) => <line key={i} x1={jj.wN[0] - 144 + i * 10} y1={jj.wN[1] - 7} x2={jj.wN[0] - 144 + i * 10} y2={jj.wN[1] - (i % 5 ? 2 : -2)} stroke="#5a4010" strokeWidth={1.5} />)}</g></g>; })()}
      {!good && <><g transform={`translate(${Math.sin(t * 2.3) * 2} 0)`}><Shake at={[pj.head[0], pj.head[1]]} r={34} /></g>{bubble > 0 && <g opacity={bubble}><Bubble x={310} y={g - 370} t="Never saw this one." tail={[pj.head[0], pj.head[1] - 40]} /></g>}</>}
      <Counter x={820} y={g - 290} n={`${answered ?? (good ? 18 : 3)}/20`} c={good ? GOLD : RED} k="ANSWERED" />
    </g>
  );
};
export const FX2: React.FC = () => <><ExamRoom2 g={G1} good={false} /><ExamRoom2 g={G2} good /><Lanes /></>;
/** the results: the paper held up in both hands, the grade in red pen */
export const ResultLane: React.FC<{ g: number; good: boolean; pop?: number }> = ({ g, good, pop = 1 }) => {
  const x = 420, s = 1.15;
  const pose: Pose = good ? { ...STAND, lean: -4, head: 6, hN: [104, -50], hF: [84, -40], elbow: 1 } : { ...STAND, lean: 16, head: 44, hN: [92, 34], hF: [72, 42], elbow: 1 };
  const pj = J(x, g, pose, false, s * S), cx = pj.wN[0] + 66, cy = pj.wN[1] - 10;
  return (
    <g>
      <rect x={0} y={g - 560} width={1080} height={730} fill="#17181d" />
      <rect x={0} y={g} width={1080} height={170} fill="#2a2520" /><rect x={0} y={g - 2} width={1080} height={4} fill="#4a4036" />
      <Hero x={x} y={g} s={s * S} look={BOLD} pose={pose} />
      <g transform={`rotate(${good ? -6 : 8} ${cx} ${cy})`}>
        <rect x={cx - 64} y={cy - 84} width={128} height={168} fill="#f4f1e6" stroke="#000" strokeWidth={3} />
        {Array.from({ length: 7 }, (_, i) => <line key={i} x1={cx - 50} y1={cy - 30 + i * 16} x2={cx + 44} y2={cy - 30 + i * 16} stroke="#9a968a" strokeWidth={2.5} />)}
        <circle cx={cx + 18} cy={cy - 46} r={40} fill="none" stroke={good ? GOLD : RED} strokeWidth={6} />
        <text x={cx + 18} y={cy - 30} textAnchor="middle" fontFamily={HAND} fontWeight={800} fontSize={46} fill={good ? GOLD : RED}>{good ? "94" : "52"}</text>
      </g>
      {good && <Glow at={[cx, cy]} r={260} color={GOLD} a={0.3} />}
      {pop > 0 && <g transform={`translate(820 ${g - 290}) scale(${0.6 + 0.4 * pop}) translate(-820 ${-(g - 290)})`} opacity={clamp(pop * 2)}><Big x={820} y={g - 260} t={good ? "94" : "52"} c={good ? GOLD : RED} s={110} /></g>}
    </g>
  );
};
export const FXR: React.FC = () => <><ResultLane g={G1} good={false} /><ResultLane g={G2} good /><Lanes /></>;

// ================================================================ v6e · the job interview (replaces the speech): practice, then the real one
export const Couch: React.FC<{ x: number; g: number; w?: number }> = ({ x, g, w = 420 }) => (
  <g><rect x={x} y={g - 110} width={w} height={70} rx={14} fill="#3a2f4a" stroke="#000" strokeWidth={3} /><rect x={x} y={g - 40} width={w} height={40} fill="#2a2236" /><rect x={x - 20} y={g - 120} width={40} height={90} rx={12} fill="#3a2f4a" stroke="#000" strokeWidth={3} /><rect x={x + w - 20} y={g - 120} width={40} height={90} rx={12} fill="#3a2f4a" stroke="#000" strokeWidth={3} /></g>
);
export const Tie2 = (j: { neck: V }) => <path d={`M${j.neck[0] - 4} ${j.neck[1] + 4} L${j.neck[0] + 4} ${j.neck[1] + 4} L${j.neck[0] + 8} ${j.neck[1] + 50} L${j.neck[0]} ${j.neck[1] + 58} L${j.neck[0] - 4} ${j.neck[1] + 50} Z`} fill="#7a1f1f" stroke="#000" strokeWidth={2} />;
export const InterviewPracticeLane: React.FC<{ g: number; hard: boolean; t?: number }> = ({ g, hard, t = 0 }) => (
  <g>
    <rect x={0} y={g - 560} width={1080} height={730} fill="#15131a" />
    <rect x={0} y={g} width={1080} height={170} fill="#241f1a" /><rect x={0} y={g - 2} width={1080} height={4} fill="#3a3028" />
    <rect x={760} y={g - 480} width={220} height={240} fill="#0a1424" stroke="#2a2a30" strokeWidth={10} />
    {hard ? (
      <g>
        {/* a mock interview: a friend in a suit with a clipboard and a timer, firing hard questions; he answers standing */}
        <rect x={560} y={g - 150} width={260} height={16} fill="url(#pr2-wood)" stroke="#000" strokeWidth={3} /><line x1={580} y1={g - 134} x2={580} y2={g} stroke="#4a3020" strokeWidth={8} /><line x1={800} y1={g - 134} x2={800} y2={g} stroke="#4a3020" strokeWidth={8} />
        <Hero x={780} y={g} s={S} look={GREYL} pose={{ ...POSES.sit(92), lean: 8, head: 0, hN: [70, 30], hF: [50, 40] }} flip hold={(j) => <g>{Tie2(j)}<rect x={j.wN[0] - 20} y={j.wN[1] - 30} width={30} height={40} fill="#c8b48a" stroke="#000" strokeWidth={2} /></g>} />
        <rect x={720} y={g - 166} width={34} height={22} rx={4} fill="#e0483e" stroke="#000" strokeWidth={2} /><text x={737} y={g - 150} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={13} fill="#fff">{`0:${String(Math.max(0, 30 - Math.floor(t / 3))).padStart(2, "0")}`}</text>
        <Hero x={360} y={g} s={S} look={BOLD} pose={{ ...STAND, head: 4 + Math.sin(t * 0.3) * 3, hN: [70 + Math.sin(t * 0.25) * 14, 30 + Math.cos(t * 0.25) * 10], hF: [30, 50], elbow: 1 }} />
        <Bubble x={700} y={g - 360} t="Your biggest failure?" tail={[760, g - 270]} />
        <Counter x={180} y={g - 420} n="HARD" c={RED} k="QUESTIONS" />
      </g>
    ) : (
      <g>
        {/* a relaxed chat on the couch: a friend asks the easy ones, both laughing */}
        <Couch x={300} g={g} />
        <Hero x={380} y={g - 40} s={S} look={BOLD} pose={{ ...POSES.sit(60), lean: -12 - Math.abs(Math.sin(t * 0.35)) * 6, head: -10 - Math.abs(Math.sin(t * 0.35)) * 8, hN: [50, 20], hF: [30, 50] }} shadow={0} />
        <Hero x={640} y={g - 40} s={S} look={GREYL} pose={{ ...POSES.sit(60), lean: -6 - Math.abs(Math.sin(t * 0.35 + 1)) * 6, head: -16, hN: [60, -10], hF: [30, 40] }} flip shadow={0} />
        <Bubble x={640} y={g - 380} t="Tell me about yourself." tail={[640, g - 290]} />
        <Counter x={180} y={g - 420} n="EASY" c={GREEN} k="QUESTIONS" />
      </g>
    )}
  </g>
);
export const InterviewRealLane: React.FC<{ g: number; good: boolean; t?: number; stamp?: number; um?: number }> = ({ g, good, t = 99, stamp = 1, um = 1 }) => {
  const you: Pose = good ? { ...POSES.sit(92), lean: 6, head: -4 + Math.sin(t * 0.3) * 4, hN: [84 + Math.sin(t * 0.28) * 16, 6 + Math.cos(t * 0.28) * 10], hF: [40, 50], elbow: 1 } : { ...POSES.sit(92), lean: 20, head: 34, hN: [40 + Math.sin(t * 2.1) * 2, 60], hF: [30, 66], elbow: 1 };
  const yj = J(300, g, you);
  return (
    <g>
      {/* an office: a glass wall, a long table, three interviewers in suits */}
      <rect x={0} y={g - 560} width={1080} height={730} fill="#14161c" />
      <rect x={0} y={g} width={1080} height={170} fill="#22242a" /><rect x={0} y={g - 2} width={1080} height={4} fill="#3a3c44" />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={40 + i * 260} y={g - 520} width={240} height={300} fill="#1c2636" stroke="#2c3646" strokeWidth={6} />)}
      <text x={540} y={g - 470} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={30} fill="#5a6478" letterSpacing={6}>INTERVIEW</text>
      {[660, 800, 940].map((x, i) => <Hero key={i} x={x} y={g} s={S} look={GREYL} pose={reach({ ...POSES.sit(92), lean: good ? 4 : 10, head: good && i === 1 ? 14 : 4, hN: [0, 0], hF: [0, 0], elbow: 1 }, x, g, [x - 96, g - 110], [x - 70, g - 108], true)} flip shadow={0} hold={Tie2} />)}
      <rect x={520} y={g - 104} width={400} height={16} fill="url(#pr2-wood)" stroke="#000" strokeWidth={3} /><rect x={530} y={g - 88} width={380} height={88} fill="#2a2a30" stroke="#000" strokeWidth={2} />
      {[560, 700, 840].map((x, i) => <rect key={i} x={x} y={g - 110} width={50} height={6} fill="#f4f1e6" />)}
      {/* the chair and him */}
      <rect x={260} y={g - 76} width={80} height={12} rx={4} fill="#3a3a42" stroke="#000" strokeWidth={2} /><line x1={300} y1={g - 64} x2={300} y2={g} stroke="#2a2a30" strokeWidth={8} /><line x1={262} y1={g - 74} x2={254} y2={g - 170} stroke="#3a3a42" strokeWidth={8} strokeLinecap="round" />
      <Hero x={300} y={g} s={S} look={BOLD} pose={you} hold={Tie2} />
      {good ? (
        <g>
          {stamp > 0 && <g transform={`translate(820 ${g - 300}) scale(${1 + (1 - stamp) * 0.8}) rotate(-12) translate(-820 ${-(g - 300)})`} opacity={clamp(stamp * 3)}><rect x={700} y={g - 340} width={240} height={80} rx={10} fill="none" stroke={GOLD} strokeWidth={8} /><text x={820} y={g - 284} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={56} fill={GOLD}>HIRED</text></g>}
          <Glow at={[500, g - 200]} r={300} color={GOLD} a={0.2 * stamp} />
        </g>
      ) : (
        <g><g transform={`translate(0 ${(t * 1.5) % 14})`}><Sweat at={yj.head} /></g><Shake at={[yj.wN[0], yj.wN[1] - 10]} r={24} />{um > 0 && <g opacity={um}><Bubble x={330} y={g - 380} t="Um..." tail={[yj.head[0] + 10, yj.head[1] - 40]} /></g>}<Bubble x={760} y={g - 380} t="Your biggest failure?" tail={[760, g - 260]} /></g>
      )}
    </g>
  );
};
export const FIP: React.FC = () => <><InterviewPracticeLane g={G1} hard={false} /><InterviewPracticeLane g={G2} hard /><Lanes /></>;
export const FIR: React.FC = () => <><InterviewRealLane g={G1} good={false} /><InterviewRealLane g={G2} good /><Lanes /></>;

// ================================================================ objects only · the anvil: an iron bar left alone vs the same bar under the hammer (B&W, gold = what it becomes, red = rust)
export const Anvil: React.FC<{ x: number; g: number }> = ({ x, g }) => (
  <g>
    <path d={`M${x - 70} ${g} L${x - 50} ${g - 60} L${x - 40} ${g - 120} L${x + 40} ${g - 120} L${x + 50} ${g - 60} L${x + 70} ${g} Z`} fill="url(#sh-grey)" stroke="#000" strokeWidth={4} />
    <path d={`M${x - 190} ${g - 170} Q${x - 120} ${g - 150} ${x - 100} ${g - 120} L${x + 150} ${g - 120} L${x + 150} ${g - 180} L${x - 60} ${g - 180} Q${x - 150} ${g - 184} ${x - 190} ${g - 170} Z`} fill="url(#pr3-steel)" stroke="#000" strokeWidth={4} />
    <rect x={x - 60} y={g - 184} width={210} height={8} fill="#fff" opacity={0.35} />
  </g>
);
export const IronBar: React.FC<{ x: number; y: number; state: "cold" | "hot" | "rust" | "blade" }> = ({ x, y, state }) => {
  if (state === "blade") return (
    <g>
      <path d={`M${x - 170} ${y - 8} L${x + 120} ${y - 14} L${x + 190} ${y - 4} L${x + 120} ${y + 6} L${x - 170} ${y + 4} Z`} fill="#f4f4f6" stroke="#000" strokeWidth={3} strokeLinejoin="round" />
      <path d={`M${x - 160} ${y - 6} L${x + 180} ${y - 5}`} stroke={GOLD} strokeWidth={3} />
      <rect x={x - 230} y={y - 14} width={60} height={24} rx={6} fill="#3a3a42" stroke="#000" strokeWidth={3} />
      <path d={`M${x + 150} ${y - 30} l4 -16 l4 16 l16 4 l-16 4 l-4 16 l-4 -16 l-16 -4 Z`} fill="#fff" />
      <Glow at={[x, y]} r={260} color={GOLD} a={0.35} />
    </g>
  );
  const fill = state === "hot" ? "#f0b040" : "#7a7a82";
  return (
    <g>
      <rect x={x - 160} y={y - 14} width={300} height={24} rx={4} fill={fill} stroke="#000" strokeWidth={3} />
      {state === "hot" && <><rect x={x - 40} y={y - 10} width={140} height={10} fill="#fff4c8" opacity={0.7} /><Glow at={[x + 20, y]} r={180} color="#ffb040" a={0.45} /></>}
      {state === "rust" && Array.from({ length: 9 }, (_, i) => <ellipse key={i} cx={x - 140 + rnd(i) * 270} cy={y - 4 + rnd(i + 3) * 10} rx={12 + rnd(i + 5) * 16} ry={6} fill="#8a3a22" opacity={0.85} />)}
    </g>
  );
};
export const Sledge: React.FC<{ hx: number; hy: number; ang: number }> = ({ hx, hy, ang }) => (
  <g transform={`rotate(${ang} ${hx} ${hy})`}>
    <rect x={hx - 8} y={hy - 330} width={16} height={280} rx={6} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} />
    <rect x={hx - 56} y={hy - 58} width={112} height={58} rx={6} fill="url(#pr3-steel)" stroke="#000" strokeWidth={4} />
  </g>
);
export const ForgeLane: React.FC<{ g: number; hit: boolean; later: boolean; phase?: number; hits?: number; reveal?: number }> = ({ g, hit, later, phase = 0, hits = 48, reveal = 1 }) => {
  const ax = 460, top = g - 180, barY = top - 12;
  // the hammer: raised (phase 0.5) and striking the bar (phase 0 / 1)
  const up = Math.sin(phase * Math.PI), hAng = 16 - 70 * up, hLift = 150 * up, sparkA = clamp(1 - phase * 5);
  return (
    <g>
      <rect x={0} y={g - 560} width={1080} height={730} fill="#0b0b0e" />
      <rect x={0} y={g} width={1080} height={170} fill="#141418" /><rect x={0} y={g - 2} width={1080} height={4} fill="#5a5a62" />
      <Anvil x={ax} g={g} />
      {hit ? (
        later ? <g opacity={reveal}><IronBar x={ax} y={barY} state="blade" /></g> : (
          <g>
            <IronBar x={ax} y={barY} state="hot" />
            <Sledge hx={ax + 40 - hLift * 0.3} hy={barY - 14 - hLift} ang={hAng} />
            {sparkA > 0 && Array.from({ length: 14 }, (_, i) => { const a = (-160 + i * 24) * (Math.PI / 180), r = (40 + rnd(i) * 70) * (0.6 + phase * 3); return <line key={i} opacity={sparkA} x1={ax + 40 + Math.cos(a) * 20} y1={barY - 10 + Math.sin(a) * 20} x2={ax + 40 + Math.cos(a) * r} y2={barY - 10 + Math.sin(a) * r} stroke={i % 3 ? GOLD : "#fff4c8"} strokeWidth={3} strokeLinecap="round" />; })}
            <Counter x={880} y={g - 320} n={`${hits}`} c={GOLD} k="HITS" />
          </g>
        )
      ) : (
        <g>
          <IronBar x={ax} y={barY} state="cold" />{later && <g opacity={reveal}><IronBar x={ax} y={barY} state="rust" /></g>}
          <Counter x={880} y={g - 320} n="0" c={later ? RED : W} k="HITS" />
        </g>
      )}
      {later && <text x={ax} y={g - 400} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={48} fill={hit ? GOLD : RED} opacity={reveal}>{hit ? "SHARP" : "RUSTED"}</text>}
      {!later && !hit && <text x={ax} y={g - 400} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={44} fill={DIM}>NO HITS</text>}
    </g>
  );
};
export const FHoseA: React.FC = () => <><ForgeLane g={G1} hit={false} later={false} /><ForgeLane g={G2} hit later={false} /><Lanes /></>;
export const FHoseB: React.FC = () => <><ForgeLane g={G1} hit={false} later /><ForgeLane g={G2} hit later /><Lanes /></>;

export const FR = [FP0, FP1, FP2, FCoalA, FCoalB, F2, FX2, FXR, FHoseA, FHoseB, FIP, FIR, FEnd];
export const Pressure3Frames: React.FC = () => {
  const F = FR[Math.min(FR.length - 1, useCurrentFrame())];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <KitDefs /><Defs />
        <defs><linearGradient id="pr3-steel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c4c6cc" /><stop offset="1" stopColor="#5a5c64" /></linearGradient><linearGradient id="pr3-coil" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#7a7c84" /><stop offset="0.5" stopColor="#e4e6ec" /><stop offset="1" stopColor="#6a6c74" /></linearGradient><linearGradient id="pr3-dawn" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffcf6a" stopOpacity={0.45} /><stop offset="1" stopColor="#000" stopOpacity={0} /></linearGradient><linearGradient id="pr2-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a87a46" /><stop offset="1" stopColor="#6a4a28" /></linearGradient></defs>
        <F />
        <Vignette a={0.3} />
      </svg>
    </AbsoluteFill>
  );
};
