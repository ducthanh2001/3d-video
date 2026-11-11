// "Pressure makes diamonds." v5 style frames: two lanes all film, top = "Avoids pressure", bottom = "Trains under it".
// Each scene: practice (top looks better) → the real moment (top breaks, bottom shines). Real objects, real physics, no faces.
// 0 practice penalties (10/10 vs 4/10) · 1 the final 90+4' (over the bar / GOAL) · 2 study (easy ticks vs timed hard set)
// · 3 the exam room (52 / 94) · 4 speech practice (mirror vs heckling friends) · 5 the hall of 500 · 6 rain training
// · 7 race day storm (km 5 / 42 km) · 8 the end: lifted on shoulders, the night practice loop.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { V } from "../../kit/core";
import { HIP_H, Hero, HeroLook, POSES, Pose, run, solvePose } from "../../kit/hero";
import { KitDefs, Vignette } from "../../kit/materials";
import { Glow, Rays } from "../../kit/fx";
import { EMOTE } from "../../kit/acting";
import { BOLD, BOLD_GREY, Defs, GOLD, SANS } from "../samehours/StyleFrames";
import { Spectators } from "../done/Frames";

export const PRESSURE2_FRAMES = 9;
const S = 0.7, H = HIP_H, G1 = 830, G2 = 1660, W = "#f2f2f2", DIM = "#8a8a92", RED = "#e0483e", GREEN = "#4cc46a";
const HAND = '"Segoe Print", "Ink Free", "Comic Sans MS", cursive';
const STAND = POSES.stand();
const GREYL: HeroLook = { ...BOLD_GREY };
const J = (x: number, y: number, pose: Pose, flip = false, s = S) => {
  const j = solvePose(pose), k = flip ? -1 : 1, w = (p: V): V => [x + k * p[0] * s, y + p[1] * s];
  return { wN: w(j.wN), wF: w(j.wF), sh: w(j.sh), head: w(j.head), hip: w(j.hip), aN: w(j.aN), aF: w(j.aF) };
};
const reach = (base: Pose, x: number, y: number, tN: V, tF: V, flip = false, s = S): Pose => {
  const sh = solvePose(base).sh, k = flip ? -1 : 1, loc = (t: V): V => [((t[0] - x) * k) / s - sh[0], (t[1] - y) / s - sh[1]];
  return { ...base, hN: loc(tN), hF: loc(tF) };
};
const rnd = (i: number) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// ---------------------------------------------------------------- shared words
const Label: React.FC<{ y: number; t: string }> = ({ y, t }) => (
  <g><rect x={0} y={y - 50} width={1080} height={70} fill="#000" opacity={0.55} /><text x={540} y={y} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={46} fill={W}>{t}</text></g>
);
const Lanes: React.FC = () => <g><Label y={230} t="Avoids pressure" /><Label y={1010} t="Trains under it" /></g>;
const Bubble: React.FC<{ x: number; y: number; t: string; tail?: V }> = ({ x, y, t, tail }) => {
  const w = t.length * 19 + 44;
  return (
    <g>
      {tail && <path d={`M${x - 14} ${y + 26} L${tail[0]} ${tail[1]} L${x + 14} ${y + 26} Z`} fill="#f4f4f4" stroke="#000" strokeWidth={3} strokeLinejoin="round" />}
      <rect x={x - w / 2} y={y - 32} width={w} height={60} rx={28} fill="#f4f4f4" stroke="#000" strokeWidth={3} />
      <text x={x} y={y + 10} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={32} fill="#111">{t}</text>
    </g>
  );
};
const Big: React.FC<{ x: number; y: number; t: string; c: string; s?: number }> = ({ x, y, t, c, s = 64 }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={s} fill={c} stroke="#000" strokeWidth={s * 0.08} paintOrder="stroke">{t}</text>
);
const Shout: React.FC<{ at: V; dir?: number }> = ({ at, dir = 1 }) => (
  <g stroke={W} strokeWidth={4} strokeLinecap="round">{[-24, 0, 24].map((a, i) => { const r = (a * Math.PI) / 180, c = Math.cos(r) * dir, s = Math.sin(r); return <line key={i} x1={at[0] + c * 26} y1={at[1] + s * 26} x2={at[0] + c * 50} y2={at[1] + s * 50} />; })}</g>
);
const Sweat: React.FC<{ at: V; dir?: number }> = ({ at, dir = -1 }) => <g>{[[30, -14], [46, 10], [22, 24]].map(([dx, dy], i) => { const x = at[0] + dir * dx, y = at[1] + dy; return <path key={i} d={`M${x} ${y - 10} Q${x + 7} ${y + 2} ${x} ${y + 7} Q${x - 7} ${y + 2} ${x} ${y - 10}Z`} fill="#d4ecff" stroke="#000" strokeWidth={1.5} />; })}</g>;
const Shake: React.FC<{ at: V; r?: number }> = ({ at, r = 30 }) => <g stroke={W} strokeWidth={3} strokeLinecap="round" opacity={0.8}>{[-1, 1].map((d) => <path key={d} d={`M${at[0] + d * r} ${at[1] - 12} q${d * 8} 6 0 12 q${-d * 8} 6 0 12`} fill="none" />)}</g>;

// ---------------------------------------------------------------- football
const Ball: React.FC<{ x: number; y: number; r?: number; rot?: number }> = ({ x, y, r = 15, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <circle r={r} fill="#f6f6f6" stroke="#000" strokeWidth={2.5} />
    <path d={`M0 ${-r * 0.42} L${r * 0.4} ${-r * 0.13} L${r * 0.25} ${r * 0.34} L${-r * 0.25} ${r * 0.34} L${-r * 0.4} ${-r * 0.13} Z`} fill="#111" />
    {[0, 72, 144, 216, 288].map((a) => <line key={a} x1={0} y1={-r * 0.42} x2={0} y2={-r * 0.95} stroke="#111" strokeWidth={1.8} transform={`rotate(${a})`} />)}
  </g>
);
/** a full-size goal in 3/4 view, the mouth facing left: front post at x (near, lower), back post up-right (far) */
const GOAL = { FW: 170, FH: 300, BX: 150, BY: 70, BH: 250, D: 120 };
const Goal: React.FC<{ x: number; g: number; bulge?: number }> = ({ x, g, bulge = 0 }) => {
  const { FH, BX, BY, BH, D } = GOAL;
  const fTop: V = [x, g - FH], bBot: V = [x + BX, g - BY], bTop: V = [x + BX, g - BY - BH];
  const rTop: V = [x + D + BX * 0.55, g - FH + 10], rBot: V = [x + D, g - 20];
  const net: React.ReactNode[] = [];
  for (let i = 0; i <= 10; i++) { const u = i / 10, a: V = [fTop[0] + (bTop[0] - fTop[0]) * u, fTop[1] + (bTop[1] - fTop[1]) * u]; net.push(<path key={`t${i}`} d={`M${a[0]} ${a[1]} Q${a[0] + D * 0.5 + bulge * 20} ${a[1] + 10} ${a[0] + D * 0.8} ${a[1] + 20}`} fill="none" />); }
  for (let i = 0; i <= 12; i++) { const u = i / 12, a: V = [x, g - FH * u], b: V = [rBot[0] + (rTop[0] - rBot[0]) * u + bulge * 30 * Math.sin(u * Math.PI), rBot[1] + (rTop[1] - rBot[1]) * u]; net.push(<line key={`h${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />); }
  for (let i = 0; i <= 8; i++) { const u = i / 8, a: V = [x + (rBot[0] - x) * u + bulge * 26 * Math.sin(u * Math.PI), g - 4 * u], b: V = [x + (rTop[0] - x) * u + bulge * 30 * Math.sin(u * Math.PI), fTop[1] + (rTop[1] - fTop[1]) * u]; net.push(<line key={`v${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />); }
  return (
    <g>
      <g stroke="#e4e4ea" strokeWidth={1.6} opacity={0.5}>{net}</g>
      <path d={`M${bBot[0]} ${bBot[1]} L${bTop[0]} ${bTop[1]} L${fTop[0]} ${fTop[1]}`} fill="none" stroke="#d8d8de" strokeWidth={9} strokeLinejoin="round" />
      <line x1={fTop[0]} y1={fTop[1]} x2={rTop[0]} y2={rTop[1]} stroke="#9a9aa2" strokeWidth={4} />
      <line x1={x} y1={g} x2={rBot[0]} y2={rBot[1]} stroke="#9a9aa2" strokeWidth={4} />
      <line x1={x} y1={g} x2={fTop[0]} y2={fTop[1]} stroke="#f6f6f6" strokeWidth={12} strokeLinecap="round" />
      <line x1={x} y1={g} x2={fTop[0]} y2={fTop[1]} stroke="#000" strokeWidth={2} />
    </g>
  );
};
const Pitch: React.FC<{ g: number; h?: number; night?: boolean }> = ({ g, h = 170, night }) => (
  <g>
    <rect x={0} y={g} width={1080} height={h} fill={night ? "#1d3a22" : "#2a4a2c"} />
    {Array.from({ length: 6 }, (_, i) => <rect key={i} x={i * 180} y={g} width={90} height={h} fill="#ffffff" opacity={0.035} />)}
    <rect x={0} y={g - 2} width={1080} height={4} fill="#5f8a5c" />
    <rect x={0} y={g + h - 30} width={1080} height={30} fill="#000" opacity={0.5} />
  </g>
);
const KEEP_READY: Pose = { hip: [0, -H + 46], lean: 16, head: -6, hN: [56, 6], hF: [44, 14], elbow: 1, fN: [44, 0], fF: [-44, 0] };
const KEEP_DIVE: Pose = { hip: [0, -H], lean: -6, head: -10, hN: [36, -132], hF: [12, -136], fN: [24, 6], fF: [-30, 10] };
const KICK_OVER: Pose = { hip: [-8, -H + 6], lean: -24, head: -16, hN: [-56, 60], hF: [62, 12], elbow: 1, fN: [140, -150], fF: [-10, 0] };
const KICK_LOW: Pose = { hip: [10, -H + 18], lean: 12, head: 14, hN: [-40, 60], hF: [70, 30], elbow: 1, fN: [150, -60], fF: [-6, 0] };
const SHOUTER: Pose = { ...STAND, head: -14, hN: [18, -60], hF: [6, -56], elbow: -1 };
const Glove = (at: V) => <circle cx={at[0]} cy={at[1]} r={11} fill="#f0d23a" stroke="#000" strokeWidth={2.5} />;
const Counter: React.FC<{ x: number; y: number; n: string; c: string; k?: string }> = ({ x, y, n, c, k }) => (
  <g>{k && <text x={x} y={y - 58} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={28} fill={DIM}>{k}</text>}<Big x={x} y={y} t={n} c={c} s={62} /></g>
);

// ================================================================ 0 · practice penalties
const PracticeLane: React.FC<{ g: number; real: boolean }> = ({ g, real }) => {
  const gx = 760, kx = 330;
  const kp = real ? KICK_LOW : { ...KICK_LOW, lean: 6 };
  const kj = J(kx, g, kp);
  return (
    <g>
      <rect x={0} y={g - 560} width={1080} height={560} fill="#0e1116" />
      <Pitch g={g} />
      {/* the penalty spot, a bag of balls */}
      <ellipse cx={kx + 120} cy={g + 6} rx={10} ry={3} fill="#e8e8e8" />
      {[0, 1, 2].map((i) => <Ball key={i} x={120 + i * 30} y={g - 15} r={15} />)}
      <Goal x={gx} g={g} bulge={real ? 0 : 1} />
      {real ? (
        <g>
          {/* the keeper dives and gets a glove to it; the ball deflects wide */}
          <Hero x={gx + 70} y={g - 90} s={S} look={GREYL} pose={KEEP_DIVE} flip rot={52} shadow={0} hold={(j) => <g>{Glove(j.wN)}{Glove(j.wF)}</g>} />
          <Ball x={gx - 10} y={g - 330} r={15} rot={40} />
          <path d={`M${gx + 30} ${g - 280} L${gx - 10} ${g - 330}`} stroke={W} strokeWidth={3} strokeDasharray="6 6" />
          {[0, 1, 2, 3, 4, 5].map((i) => <Ball key={i} x={gx - 140 + i * 40 + (i % 2) * 12} y={g - 15} r={15} />)}
          {/* three teammates behind him, shouting */}
          {[0, 1, 2].map((i) => { const x = 50 + i * 95, y = g - 30, p = { ...SHOUTER, lean: -4 + i * 3 }, jj = J(x, y, p, false, S * 0.8); return <g key={i}><Hero x={x} y={y} s={S * 0.8} look={GREYL} pose={p} shadow={0.15} /><Shout at={[jj.head[0] + 16, jj.head[1]]} /></g>; })}
        </g>
      ) : (
        <g>{[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => <Ball key={i} x={gx + 30 + (i % 4) * 26} y={g - 15 - Math.floor(i / 4) * 24} r={14} />)}<Ball x={gx + 60} y={g - 160} r={15} /></g>
      )}
      <Hero x={kx} y={g} s={S} look={BOLD} pose={kp} />
      {!real && <path d={`M${kj.aN[0] + 20} ${kj.aN[1]} Q${gx - 100} ${g - 240} ${gx + 60} ${g - 160}`} fill="none" stroke={W} strokeWidth={3} strokeDasharray="6 8" opacity={0.6} />}
      <Counter x={900} y={g - 420} n={real ? "4/10" : "10/10"} c={real ? RED : GREEN} k="PRACTICE" />
    </g>
  );
};
const F0: React.FC = () => (
  <>
    <PracticeLane g={G1} real={false} />
    <PracticeLane g={G2} real />
    <Lanes />
    <text x={540} y={92} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={50} fill={W}>10 out of 10 in practice.</text>
    <text x={540} y={150} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={54} fill={GOLD}>Who scores?</text>
  </>
);

// ================================================================ 1 · the final, 90+4'
const Floodlight: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <line x1={x} y1={y} x2={x} y2={y + 200} stroke="#2a2a30" strokeWidth={8} />
    <rect x={x - 50} y={y - 30} width={100} height={44} rx={4} fill="#1c1c22" stroke="#3a3a42" strokeWidth={3} />
    {[0, 1, 2, 3].map((i) => <circle key={i} cx={x - 36 + i * 24} cy={y - 8} r={9} fill="#fffbe8" />)}
    <Glow at={[x, y - 8]} r={140} color="#fff6d8" a={0.5} />
  </g>
);
const Stadium: React.FC<{ g: number }> = ({ g }) => (
  <g>
    <rect x={0} y={g - 560} width={1080} height={560} fill="#06070a" />
    <g transform={`translate(0 ${g - 470}) scale(1 0.62)`}><Spectators y0={0} y1={520} rows={7} warm={1} /></g>
    <rect x={0} y={g - 140} width={1080} height={140} fill="#0a0a0d" opacity={0.6} />
    <rect x={0} y={g - 120} width={1080} height={46} fill="#1a1a20" /><text x={540} y={g - 88} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={26} fill="#5a5a62" letterSpacing={18}>FINAL · FINAL · FINAL</text>
    <Floodlight x={90} y={g - 520} /><Floodlight x={990} y={g - 520} />
    <g transform={`translate(540 ${g - 500})`}>
      <rect x={-130} y={-30} width={260} height={66} rx={8} fill="#0b0b0e" stroke="#4a4a52" strokeWidth={3} />
      <text x={-50} y={16} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={42} fill="#ffd25a">0–0</text>
      <text x={64} y={14} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={32} fill={W}>90+4'</text>
    </g>
    <Pitch g={g} night />
  </g>
);
const FinalLane: React.FC<{ g: number; scores: boolean }> = ({ g, scores }) => {
  const gx = 760, kx = 330;
  const kp = scores ? { ...EMOTE.armsWide(), lean: -10 } : { ...KICK_OVER };
  const kj = J(kx, g, kp);
  return (
    <g>
      <Stadium g={g} />
      <Goal x={gx} g={g} bulge={scores ? 1 : 0} />
      {scores ? (
        <g>
          {/* the keeper dived the right way and is a hand short; the ball is in the side netting */}
          <Hero x={gx + 80} y={g - 60} s={S} look={GREYL} pose={KEEP_DIVE} flip rot={68} shadow={0} hold={(j) => <g>{Glove(j.wN)}{Glove(j.wF)}</g>} />
          <Ball x={gx + 84} y={g - 270} r={15} />
          <Glow at={[gx + 80, g - 260]} r={260} color={GOLD} a={0.35} />
          <Big x={gx - 60} y={g - 380} t="GOAL" c={GOLD} s={80} />
        </g>
      ) : (
        <g>
          <Hero x={gx + 70} y={g} s={S} look={GREYL} pose={KEEP_READY} flip hold={(j) => <g>{Glove(j.wN)}{Glove(j.wF)}</g>} />
          {/* the ball goes high over the crossbar into the crowd */}
          <path d={`M${kj.aN[0] + 20} ${kj.aN[1]} Q${gx - 120} ${g - 520} ${gx + 120} ${g - 470}`} fill="none" stroke={W} strokeWidth={3} strokeDasharray="6 8" opacity={0.7} />
          <Ball x={gx + 120} y={g - 470} r={15} rot={30} />
        </g>
      )}
      <Hero x={kx} y={g} s={S} look={BOLD} pose={kp} />
      {!scores && <Shake at={[kj.aF[0], kj.aF[1] - 30]} />}
      {!scores && <Sweat at={kj.head} />}
    </g>
  );
};
const F1: React.FC = () => (
  <>
    <FinalLane g={G1} scores={false} />
    <FinalLane g={G2} scores />
    <Lanes />
    <Bubble x={260} y={420} t="Everyone's watching." tail={[300, 520]} />
  </>
);

// ================================================================ 2 · study at home
const Desk: React.FC<{ x: number; g: number }> = ({ x, g }) => (
  <g>
    <rect x={x - 160} y={g - 150} width={320} height={18} fill="url(#pr2-wood)" stroke="#000" strokeWidth={3} />
    <line x1={x - 140} y1={g - 132} x2={x - 140} y2={g} stroke="#5a3b1e" strokeWidth={10} /><line x1={x + 140} y1={g - 132} x2={x + 140} y2={g} stroke="#5a3b1e" strokeWidth={10} />
  </g>
);
const Lamp: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <rect x={x - 28} y={y - 8} width={56} height={10} rx={4} fill="#2a2a30" />
    <path d={`M${x} ${y - 6} L${x + 20} ${y - 110} L${x + 70} ${y - 130}`} fill="none" stroke="#3a3a42" strokeWidth={7} strokeLinejoin="round" />
    <path d={`M${x + 50} ${y - 150} L${x + 104} ${y - 128} L${x + 82} ${y - 100} Z`} fill="#3a3a42" stroke="#000" strokeWidth={3} />
    <path d={`M${x + 92} ${y - 112} L${x + 30} ${y} L${x + 200} ${y} Z`} fill="#ffe2a0" opacity={0.18} />
    <Glow at={[x + 92, y - 112]} r={160} color="#ffd890" a={0.45} />
  </g>
);
const Paper: React.FC<{ x: number; y: number; marks: ("ok" | "x" | "line")[]; rot?: number; score?: string; scoreC?: string }> = ({ x, y, marks, rot = 0, score, scoreC }) => (
  <g transform={`rotate(${rot} ${x} ${y})`}>
    <rect x={x - 70} y={y - 46} width={140} height={92} fill="#f4f1e6" stroke="#000" strokeWidth={2.5} />
    {marks.map((m, i) => { const yy = y - 30 + i * 15; return <g key={i}><line x1={x - 56} y1={yy} x2={x + 26} y2={yy} stroke="#9a968a" strokeWidth={3} />{m === "ok" && <path d={`M${x + 36} ${yy - 2} l5 6 l10 -12`} fill="none" stroke={GREEN} strokeWidth={3.5} />}{m === "x" && <path d={`M${x + 36} ${yy - 6} l12 12 M${x + 48} ${yy - 6} l-12 12`} stroke={RED} strokeWidth={3.5} />}</g>; })}
    {score && <text x={x + 34} y={y + 34} textAnchor="middle" fontFamily={HAND} fontWeight={800} fontSize={42} fill={scoreC}>{score}</text>}
  </g>
);
const sitDesk = (lean: number, head: number): Pose => ({ ...POSES.sit(96), lean, head });
const StudyLane: React.FC<{ g: number; hard: boolean }> = ({ g, hard }) => {
  const dx = 560, sx = 400;
  const p = reach(sitDesk(hard ? 26 : 10, hard ? 30 : 16), sx, g, [dx - 40, g - 160], [dx - 90, g - 158]);
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
          <Paper x={dx - 20} y={g - 180} marks={["x", "x", "ok", "x", "x"]} rot={-4} />
          <Paper x={dx + 60} y={g - 168} marks={["x", "ok", "x", "x", "ok"]} rot={6} />
          {/* a kitchen timer counting down */}
          <g transform={`translate(${dx - 120} ${g - 176})`}><circle r={22} fill="#e0483e" stroke="#000" strokeWidth={3} /><text y={8} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={18} fill="#fff">28:10</text></g>
          <Counter x={200} y={g - 330} n="✗ ✗ ✗" c={RED} k="HARDEST SET" />
        </g>
      ) : (
        <g>
          <Paper x={dx - 10} y={g - 176} marks={["ok", "ok", "ok", "ok", "ok"]} rot={-3} />
          <rect x={dx + 50} y={g - 186} width={70} height={36} fill="#3a5aa0" stroke="#000" strokeWidth={2.5} /><text x={dx + 85} y={g - 162} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={14} fill="#fff">EASY</text>
          <Counter x={200} y={g - 330} n="✓ ✓ ✓" c={GREEN} k="EASY SET" />
        </g>
      )}
    </g>
  );
};
const F2: React.FC = () => <><StudyLane g={G1} hard={false} /><StudyLane g={G2} hard /><Lanes /></>;

// ================================================================ 3 · the exam room
const ExamLane: React.FC<{ g: number; good: boolean }> = ({ g, good }) => {
  const sx = 420, dx = 560;
  const p = good ? reach(sitDesk(24, 28), sx, g, [dx - 40, g - 160], [dx - 80, g - 156]) : reach({ ...sitDesk(4, -18) }, sx, g, [dx - 50, g - 170], [sx + 20, g - 300]);
  const pj = J(sx, g, p);
  return (
    <g>
      <rect x={0} y={g - 560} width={1080} height={560} fill="#101014" />
      <rect x={0} y={g} width={1080} height={170} fill="#18181c" /><rect x={0} y={g - 2} width={1080} height={4} fill="#3a3a42" />
      {/* rows of empty desks in the back, a wall clock, the proctor walking */}
      {[0, 1, 2].map((i) => <g key={i} opacity={0.45}><rect x={40 + i * 130} y={g - 120} width={100} height={10} fill="#5a4a3a" /><line x1={50 + i * 130} y1={g - 110} x2={50 + i * 130} y2={g} stroke="#4a3a2a" strokeWidth={6} /><line x1={130 + i * 130} y1={g - 110} x2={130 + i * 130} y2={g} stroke="#4a3a2a" strokeWidth={6} /></g>)}
      <g transform={`translate(860 ${g - 430})`}><circle r={48} fill="#f0f0f0" stroke="#2a2a30" strokeWidth={8} />{Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={-40} x2={0} y2={-34} stroke="#333" strokeWidth={3} transform={`rotate(${i * 30})`} />)}<line x1={0} y1={0} x2={0} y2={-30} stroke="#111" strokeWidth={5} transform="rotate(330)" /><line x1={0} y1={0} x2={0} y2={-38} stroke="#e0483e" strokeWidth={3} transform="rotate(170)" /></g>
      <Hero x={920} y={g} s={S * 0.9} look={GREYL} pose={{ ...STAND, head: 10, hN: [10, 120], hF: [-10, 120] }} flip shadow={0.2} />
      <Desk x={dx} g={g} />
      <rect x={sx - 40} y={g - 70} width={80} height={12} rx={4} fill="url(#pr2-wood)" stroke="#000" strokeWidth={3} /><line x1={sx} y1={g - 58} x2={sx} y2={g} stroke="#5a3b1e" strokeWidth={9} />
      <Hero x={sx} y={g} s={S} look={BOLD} pose={p} />
      <Paper x={dx + 10} y={g - 176} marks={good ? ["line", "line", "line", "line", "line"] : ["line", "line"]} rot={-2} score={good ? "94" : "52"} scoreC={good ? GOLD : RED} />
      {/* the pencil in the near hand */}
      <line x1={pj.wN[0]} y1={pj.wN[1]} x2={pj.wN[0] + 12} y2={pj.wN[1] + 30} stroke="#e8c040" strokeWidth={6} strokeLinecap="round" />
      {!good && <Bubble x={300} y={g - 430} t="Never saw this one." tail={[pj.head[0] - 10, pj.head[1] - 40]} />}
      <Big x={dx + 220} y={g - 220} t={good ? "94" : "52"} c={good ? GOLD : RED} s={96} />
    </g>
  );
};
const F3: React.FC = () => <><ExamLane g={G1} good={false} /><ExamLane g={G2} good /><Lanes /></>;

// ================================================================ 4 · speech practice
const SpeechPracticeLane: React.FC<{ g: number; crowd: boolean }> = ({ g, crowd }) => {
  const sx = 330;
  const talk: Pose = { ...STAND, head: -6, hN: [70, 10], hF: [8, 60], elbow: 1 };
  return (
    <g>
      <rect x={0} y={g - 560} width={1080} height={560} fill="#0f0e12" />
      <rect x={0} y={g} width={1080} height={170} fill="#1c1814" /><rect x={0} y={g - 2} width={1080} height={4} fill="#3a3028" />
      <Hero x={sx} y={g} s={S} look={BOLD} pose={talk} hold={(j) => <rect x={j.wF[0] - 14} y={j.wF[1] - 18} width={28} height={36} fill="#f4f1e6" stroke="#000" strokeWidth={2} />} />
      {crowd ? (
        <g>
          {/* a couch, four friends: one interrupts, one films, one yawns, one points at his watch */}
          <rect x={560} y={g - 110} width={440} height={70} rx={14} fill="#3a2f4a" stroke="#000" strokeWidth={3} /><rect x={560} y={g - 40} width={440} height={40} fill="#2a2236" />
          {[0, 1, 2, 3].map((i) => {
            const x = 610 + i * 110;
            const poses: Pose[] = [{ ...POSES.sit(60), hN: [80, -40], hF: [30, 50] }, { ...POSES.sit(60), hN: [56, -20], hF: [50, -14] }, { ...POSES.sit(60), head: -30, hN: [10, -70], hF: [-10, -76], elbow: -1 }, { ...POSES.sit(60), hN: [60, 10], hF: [40, 20] }];
            const jj = J(x, g - 40, poses[i], true);
            return <g key={i}><Hero x={x} y={g - 40} s={S * 0.9} look={GREYL} pose={poses[i]} flip shadow={0} />
              {i === 0 && <Shout at={[jj.head[0] - 20, jj.head[1]]} dir={-1} />}
              {i === 1 && <g><rect x={jj.wN[0] - 16} y={jj.wN[1] - 26} width={22} height={38} rx={4} fill="#1b1d24" stroke="#000" strokeWidth={2} /><circle cx={jj.wN[0] - 5} cy={jj.wN[1] - 20} r={4} fill="#e0483e" /></g>}
              {i === 2 && <text x={jj.head[0]} y={jj.head[1] - 40} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={26} fill={DIM}>zzz</text>}
            </g>;
          })}
          <Counter x={780} y={g - 330} n="4 HECKLERS" c={RED} />
        </g>
      ) : (
        <g>
          {/* a bedroom mirror: his reflection talking back */}
          <rect x={600} y={g - 420} width={220} height={400} rx={10} fill="#1b2330" stroke="#8a8a92" strokeWidth={8} />
          <Hero x={700} y={g - 30} s={S * 0.85} look={{ ...BOLD, body: "#9aa6b8", far: "#7a869a", glow: 0 }} pose={talk} flip shadow={0} />
          <line x1={620} y1={g - 380} x2={680} y2={g - 320} stroke="#fff" strokeWidth={5} opacity={0.25} />
          <Counter x={930} y={g - 330} n="0" c={GREEN} k="AUDIENCE" />
        </g>
      )}
    </g>
  );
};
const F4: React.FC = () => <><SpeechPracticeLane g={G1} crowd={false} /><SpeechPracticeLane g={G2} crowd /><Lanes /></>;

// ================================================================ 5 · the hall of 500
const HallLane: React.FC<{ g: number; good: boolean }> = ({ g, good }) => {
  const sx = good ? 520 : 760;
  const pose: Pose = good ? { ...EMOTE.armsWide(), lean: -4, head: -10 } : { ...STAND, lean: 10, head: 34, hN: [16, 90], hF: [6, 96] };
  const pj = J(sx, g - 120, pose, !good);
  return (
    <g>
      <rect x={0} y={g - 560} width={1080} height={560} fill="#07070a" />
      {/* the stage, curtains, the spotlight cone, the mic stand */}
      <rect x={0} y={g - 140} width={1080} height={24} fill="#3a2a1e" /><rect x={0} y={g - 116} width={1080} height={116} fill="#140f0b" />
      <path d={`M0 ${g - 560} L120 ${g - 560} Q90 ${g - 340} 130 ${g - 140} L0 ${g - 140} Z`} fill="#5a1414" /><path d={`M1080 ${g - 560} L960 ${g - 560} Q990 ${g - 340} 950 ${g - 140} L1080 ${g - 140} Z`} fill="#5a1414" />
      <path d={`M${sx - 30} ${g - 560} L${sx + 30} ${g - 560} L${sx + 170} ${g - 140} L${sx - 170} ${g - 140} Z`} fill="#fff6d8" opacity={0.12} />
      <ellipse cx={sx} cy={g - 132} rx={170} ry={14} fill="#fff6d8" opacity={0.25} />
      <line x1={520} y1={g - 140} x2={520} y2={g - 290} stroke="#8a8a92" strokeWidth={4} /><circle cx={520} cy={g - 296} r={9} fill="#2a2a30" stroke="#8a8a92" strokeWidth={3} />
      <Hero x={sx} y={g - 120} s={S} look={BOLD} pose={pose} flip={!good} />
      {!good && <g><rect x={640} y={g - 150} width={28} height={36} fill="#f4f1e6" stroke="#000" strokeWidth={2} transform={`rotate(30 654 ${g - 132})`} /><Shake at={[pj.wN[0], pj.wN[1] - 10]} r={22} /></g>}
      {/* the hall: the backs of 500 heads, the front rows on their feet when it goes well */}
      <g transform={`translate(0 ${g - 110}) scale(1 0.35)`}><Spectators y0={0} y1={300} rows={6} warm={good ? 1 : 0.2} /></g>
      {good && <g>{Array.from({ length: 16 }, (_, i) => { const x = 40 + i * 66, y = g - 40 - rnd(i) * 20; return <g key={i}><path d={`M${x - 14} ${y + 40} L${x - 14} ${y + 4} Q${x} ${y - 6} ${x + 14} ${y + 4} L${x + 14} ${y + 40} Z`} fill="#8a8a92" /><circle cx={x} cy={y - 10} r={12} fill="#8a8a92" /><line x1={x - 10} y1={y} x2={x - 22} y2={y - 34} stroke="#8a8a92" strokeWidth={7} strokeLinecap="round" /><line x1={x + 10} y1={y} x2={x + 22} y2={y - 34} stroke="#8a8a92" strokeWidth={7} strokeLinecap="round" /></g>; })}<Glow at={[sx, g - 260]} r={300} color={GOLD} a={0.25} /></g>}
      <text x={170} y={g - 480} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={30} fill={DIM}>500 SEATS</text>
      {!good && <Bubble x={420} y={g - 450} t="So many people." tail={[pj.head[0] + 20, pj.head[1] - 40]} />}
    </g>
  );
};
const F5: React.FC = () => <><HallLane g={G1} good={false} /><HallLane g={G2} good /><Lanes /></>;

// ================================================================ 6 · training in the rain / staying in
const Rain: React.FC<{ g: number; n?: number; slant?: number }> = ({ g, n = 70, slant = 18 }) => (
  <g stroke="#9fb4cc" strokeWidth={2.5} opacity={0.55} strokeLinecap="round">{Array.from({ length: n }, (_, i) => { const x = rnd(i) * 1120 - 20, y = g - 560 + rnd(i + 50) * 560; return <line key={i} x1={x} y1={y} x2={x - slant} y2={y + 40} />; })}</g>
);
const Calendar: React.FC<{ x: number; y: number; full: boolean }> = ({ x, y, full }) => (
  <g>
    <rect x={x} y={y} width={230} height={170} fill="#f4f1e6" stroke="#000" strokeWidth={3} /><rect x={x} y={y} width={230} height={30} fill="#3a3a42" />
    <text x={x + 115} y={y + 22} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={18} fill="#fff">12-WEEK PLAN</text>
    {Array.from({ length: 28 }, (_, i) => { const cx = x + 18 + (i % 7) * 32, cy = y + 50 + Math.floor(i / 7) * 32, rain = [2, 5, 9, 12, 16, 20, 23, 26].includes(i), done = full || !rain; return <g key={i}><rect x={cx - 12} y={cy - 12} width={24} height={24} fill="none" stroke="#bbb" strokeWidth={1.5} />{done && <path d={`M${cx - 8} ${cy} l6 6 l10 -12`} fill="none" stroke={GREEN} strokeWidth={3} />}{rain && <text x={cx + 9} y={cy - 4} fontSize={11} fill="#3a7ac0">☂</text>}</g>; })}
  </g>
);
const RainTrainLane: React.FC<{ g: number; goes: boolean }> = ({ g, goes }) => (
  <g>
    <rect x={0} y={g - 560} width={1080} height={560} fill={goes ? "#0b0f16" : "#100f12"} />
    {goes ? (
      <g>
        <rect x={0} y={g} width={1080} height={170} fill="#1a1e24" /><rect x={0} y={g - 2} width={1080} height={4} fill="#4a5462" />
        {Array.from({ length: 6 }, (_, i) => <ellipse key={i} cx={100 + i * 170} cy={g + 16} rx={50} ry={6} fill="#9fb4cc" opacity={0.25} />)}
        <Rain g={g} />
        <Hero x={480} y={g} s={S} look={{ ...BOLD, body: "#cfd6e0" }} pose={{ ...run(0.25), head: 10, lean: 22 }} />
        <Calendar x={760} y={g - 480} full />
      </g>
    ) : (
      <g>
        <rect x={0} y={g} width={1080} height={170} fill="#1c1814" /><rect x={0} y={g - 2} width={1080} height={4} fill="#3a3028" />
        {/* inside: the couch and the TV; rain on the window */}
        <rect x={60} y={g - 470} width={260} height={240} fill="#0a1424" stroke="#2a2a30" strokeWidth={10} />
        <g transform="translate(0 0)"><clipPath id="pr2-win"><rect x={66} y={g - 464} width={248} height={228} /></clipPath><g clipPath="url(#pr2-win)"><Rain g={g} n={40} /></g></g>
        <rect x={330} y={g - 110} width={360} height={70} rx={14} fill="#3a2f4a" stroke="#000" strokeWidth={3} /><rect x={330} y={g - 40} width={360} height={40} fill="#2a2236" />
        <Hero x={480} y={g - 40} s={S} look={BOLD} pose={{ ...POSES.sit(60), lean: -14, head: -4, hN: [60, 20], hF: [40, 40] }} shadow={0} hold={(j) => <rect x={j.wN[0] - 6} y={j.wN[1] - 14} width={12} height={26} rx={3} fill="#2a2a30" />} />
        <rect x={720} y={g - 230} width={150} height={100} fill="#8fc0ff" stroke="#2a2a30" strokeWidth={8} opacity={0.85} /><Glow at={[795, g - 180]} r={160} color="#8fc0ff" a={0.3} />
        <Calendar x={790} y={g - 480} full={false} />
      </g>
    )}
  </g>
);
const F6: React.FC = () => <><RainTrainLane g={G1} goes={false} /><RainTrainLane g={G2} goes /><Lanes /></>;

// ================================================================ 7 · race day in a storm
const RaceLane: React.FC<{ g: number; finishes: boolean }> = ({ g, finishes }) => (
  <g>
    <rect x={0} y={g - 560} width={1080} height={560} fill="#0a0d12" />
    <rect x={0} y={g} width={1080} height={170} fill="#22262c" /><rect x={0} y={g - 2} width={1080} height={4} fill="#5a6270" />
    {Array.from({ length: 6 }, (_, i) => <ellipse key={i} cx={80 + i * 180} cy={g + 18} rx={60} ry={7} fill="#9fb4cc" opacity={0.25} />)}
    <Rain g={g} n={110} slant={34} />
    {finishes ? (
      <g>
        {/* the finish arch, the clock, the tape snapping across his chest */}
        <path d={`M600 ${g} L600 ${g - 400} M960 ${g} L960 ${g - 400}`} stroke="#3a3a42" strokeWidth={22} />
        <rect x={580} y={g - 460} width={400} height={80} fill="#1a1a20" stroke="#3a3a42" strokeWidth={6} /><text x={780} y={g - 405} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={44} fill={GOLD}>FINISH · 42 KM</text>
        <Hero x={760} y={g} s={S} look={{ ...BOLD, body: "#cfd6e0" }} pose={{ ...EMOTE.armsWide(), lean: -6 }} />
        <path d={`M600 ${g - 150} Q700 ${g - 130} 740 ${g - 170} M800 ${g - 175} Q880 ${g - 130} 960 ${g - 150}`} fill="none" stroke={GOLD} strokeWidth={8} />
        <Glow at={[780, g - 250]} r={300} color={GOLD} a={0.25} />
      </g>
    ) : (
      <g>
        {/* a shop awning at km 5: he stands dry under it, arms folded, the race goes past */}
        <rect x={100} y={g - 420} width={380} height={420} fill="#15151a" />
        <path d={`M80 ${g - 330} L500 ${g - 330} L470 ${g - 280} L110 ${g - 280} Z`} fill="#7a2a2a" stroke="#000" strokeWidth={3} />
        {Array.from({ length: 7 }, (_, i) => <rect key={i} x={110 + i * 52} y={g - 280} width={26} height={14} fill="#a33a3a" />)}
        <rect x={140} y={g - 250} width={300} height={250} fill="#2a2a30" opacity={0.6} />
        <Hero x={300} y={g} s={S} look={BOLD} pose={{ ...STAND, head: 18, hN: [40, 40], hF: [30, 44], elbow: 1 }} />
        <rect x={640} y={g - 230} width={90} height={60} fill="#f4f1e6" stroke="#000" strokeWidth={3} /><line x1={685} y1={g - 170} x2={685} y2={g} stroke="#8a8a92" strokeWidth={6} />
        <text x={685} y={g - 188} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={32} fill="#111">KM 5</text>
        {[0, 1].map((i) => <Hero key={i} x={840 + i * 120} y={g} s={S * 0.85} look={GREYL} pose={{ ...run(0.25 + i * 0.4), lean: 22 }} shadow={0.2} />)}
        <Bubble x={300} y={g - 470} t="Not in this." />
      </g>
    )}
  </g>
);
const F7: React.FC = () => <><RaceLane g={G1} finishes={false} /><RaceLane g={G2} finishes /><Lanes /></>;

// ================================================================ 8 · the end
const F8: React.FC = () => {
  const g1 = 860, g2 = 1600;
  const lifted: Pose = { ...EMOTE.armsWide(), fN: [30, 40], fF: [-30, 40] };
  return (
    <>
      {/* top: the stadium after the final, the winner on two teammates' shoulders, gold confetti; the other sits on the grass */}
      <Stadium g={g1} />
      <Rays f={30} at={[540, g1 - 420]} a={0.35} color={GOLD} n={14} len={700} />
      {(() => { const lj = J(530, g1 - 250, lifted); return [0, 1].map((i) => { const x = i ? 610 : 450, foot = i ? lj.aN : lj.aF, base: Pose = { ...STAND, lean: -6, head: -20, elbow: -1 }; return <Hero key={i} x={x} y={g1} s={S} look={GREYL} pose={reach(base, x, g1, [foot[0], foot[1] + 6], [foot[0] + (i ? 14 : -14), foot[1] + 10], i === 1)} flip={i === 1} />; }); })()}
      <Hero x={530} y={g1 - 250} s={S} look={BOLD} pose={lifted} shadow={0} />
      <text x={530} y={g1 - 470} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={30} fill={DIM}>YOU</text>
      {Array.from({ length: 60 }, (_, i) => <rect key={i} x={rnd(i) * 1080} y={g1 - 560 + rnd(i + 9) * 520} width={10} height={5} fill={GOLD} transform={`rotate(${rnd(i + 3) * 180} ${rnd(i) * 1080} ${g1 - 560 + rnd(i + 9) * 520})`} opacity={0.85} />)}
      <Hero x={180} y={g1} s={S} look={BOLD} pose={{ ...POSES.hugKnees(), head: 34 }} shadow={0.3} />
      <Ball x={290} y={g1 - 15} r={15} />
      {/* bottom: that night, an empty practice pitch: he puts the ball down in front of a real keeper */}
      <rect x={0} y={g1 + 170} width={1080} height={g2 - g1 - 170} fill="#07090c" />
      <Floodlight x={980} y={g2 - 500} />
      <Pitch g={g2} night />
      <Goal x={760} g={g2} />
      <Hero x={830} y={g2} s={S} look={GREYL} pose={KEEP_READY} flip hold={(j) => <g>{Glove(j.wN)}{Glove(j.wF)}</g>} />
      <Hero x={420} y={g2} s={S} look={BOLD} pose={{ ...POSES.crouch(), hN: [70, 100], hF: [60, 104] }} />
      <Ball x={500} y={g2 - 15} r={15} />
      <Hero x={200} y={g2} s={S} look={BOLD} pose={SHOUTER} />
      <Shout at={[230, g2 - 250]} />
      <text x={540} y={1780} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={64} fill={W}>Pressure makes diamonds.</text>
      <text x={540} y={1860} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={58} fill={GOLD}>Train under it.</text>
    </>
  );
};

const FR = [F0, F1, F2, F3, F4, F5, F6, F7, F8];
export const Pressure2Frames: React.FC = () => {
  const F = FR[Math.min(FR.length - 1, useCurrentFrame())];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <KitDefs /><Defs />
        <defs><linearGradient id="pr2-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a87a46" /><stop offset="1" stopColor="#6a4a28" /></linearGradient></defs>
        <F />
        <Vignette a={0.3} />
      </svg>
    </AbsoluteFill>
  );
};
