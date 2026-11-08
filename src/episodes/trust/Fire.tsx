// TRUST THE PROCESS · scene 3 "feed the fire": two campfires on a cold night. Top stopped adding wood (sits on the phone):
// the fire is down to smoking embers. Bottom keeps adding logs: a big warm fire. Stopping isn't neutral — it goes out.
// Real objects: a stone ring, crossed split logs with end grain, layered flames, embers, smoke, a woodpile, a phone.
import React from "react";
import { V } from "../../kit/core";
import { Hero, HeroLook, POSES, Pose } from "../../kit/hero";
import { Glow } from "../../kit/fx";
import { BOLD, BOLD_GREY, GOLD, SANS } from "../samehours/StyleFrames";
import { J, reach } from "../beatyesterday/StyleFrames";
import { ClimbTag } from "./Frames";

const MONO = "Consolas, 'Courier New', monospace";
const HERO: HeroLook = { ...BOLD };
const GREY: HeroLook = { ...BOLD_GREY, glow: 0 };
const rnd = (i: number) => { const x = Math.sin(i * 73.9 + 5.3) * 43758.5; return x - Math.floor(x); };
const PS = 0.66;

/** a split log as a cylinder from a to b (radius r), bark sides, end grain at b */
export const Log: React.FC<{ a: V; b: V; r: number; burnt?: boolean; id: string }> = ({ a, b, r, burnt, id }) => {
  const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI, L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return (
    <g transform={`translate(${a[0]} ${a[1]}) rotate(${ang})`}>
      <defs><linearGradient id={`lg${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={burnt ? "#3a3030" : "#8a6a4c"} /><stop offset="1" stopColor={burnt ? "#0e0c0c" : "#3a2a1c"} /></linearGradient></defs>
      <rect x={0} y={-r} width={L} height={r * 2} rx={r * 0.4} fill={`url(#lg${id})`} stroke="#000" strokeWidth={2.5} />
      {[0.3, 0.6].map((k) => <path key={k} d={`M${L * 0.08} ${-r + r * 2 * k} Q${L * 0.5} ${-r + r * 2 * k + 4} ${L * 0.92} ${-r + r * 2 * k}`} stroke="#000" strokeWidth={1.5} opacity={0.5} fill="none" />)}
      {burnt && [0.2, 0.45, 0.7].map((k) => <path key={k} d={`M${L * k} ${-r * 0.6} l8 ${r * 0.5} l-6 ${r * 0.5}`} stroke="#ff7a2a" strokeWidth={3} fill="none" opacity={0.9} />)}
      <ellipse cx={L} cy={0} rx={r * 0.45} ry={r} fill={burnt ? "#1a1414" : "#d9b98a"} stroke="#000" strokeWidth={2} />
      {!burnt && <ellipse cx={L} cy={0} rx={r * 0.25} ry={r * 0.55} fill="none" stroke="#a8875c" strokeWidth={1.5} />}
    </g>
  );
};

/** one tongue of flame */
const tongue = (x: number, base: number, w: number, h: number, sway: number) =>
  `M${x - w / 2} ${base} Q${x - w * 0.6} ${base - h * 0.45} ${x + sway} ${base - h} Q${x + w * 0.55} ${base - h * 0.4} ${x + w / 2} ${base} Z`;

/** level 0..1: 1 = a big fire, ~0.1 = embers and smoke. t animates the flicker. */
export const Campfire: React.FC<{ x: number; g: number; big?: boolean; level?: number; id: string; t?: number }> = ({ x, g, big, level, id, t = 0 }) => {
  const base = g - 22, L = level ?? (big ? 1 : 0.08), burning = L > 0.3;
  const fl = (i: number) => 1 + 0.08 * Math.sin(t / 2.3 + i * 1.7) + 0.05 * Math.sin(t / 1.1 + i);
  const sw = (i: number) => Math.sin(t / 3.1 + i * 2.1) * 10;
  return (
    <g>
      <defs>
        <linearGradient id={`fo${id}`} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#ff9a2a" /><stop offset="0.6" stopColor="#e0483e" /><stop offset="1" stopColor="#e0483e" stopOpacity={0} /></linearGradient>
        <linearGradient id={`fm${id}`} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#ffe08a" /><stop offset="0.7" stopColor="#ffa030" /><stop offset="1" stopColor="#ff7a2a" stopOpacity={0} /></linearGradient>
        <linearGradient id={`fi${id}`} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#fff2b0" stopOpacity={0} /></linearGradient>
      </defs>
      {L > 0.12 && <Glow at={[x, g - 120 * L]} r={120 + 340 * L} color="#ffa030" a={0.55 * L * fl(9)} />}
      {L > 0.12 && <ellipse cx={x} cy={g + 10} rx={360 * L} ry={46} fill="#ffa030" opacity={0.18 * L} />}
      {burning ? <>
        <Log a={[x - 120, g - 10]} b={[x + 20, g - 120]} r={14} id={`${id}1`} />
        <Log a={[x + 120, g - 10]} b={[x - 10, g - 125]} r={14} id={`${id}2`} />
        <Log a={[x - 140, g - 14]} b={[x + 150, g - 18]} r={16} id={`${id}3`} />
      </> : <>
        <Log a={[x - 110, g - 12]} b={[x + 30, g - 22]} r={13} burnt id={`${id}1`} />
        <Log a={[x + 100, g - 10]} b={[x - 20, g - 30]} r={12} burnt id={`${id}2`} />
        {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={x - 70 + rnd(i) * 140} cy={g - 6 - rnd(i + 9) * 10} r={3 + rnd(i + 4) * 3} fill={i % 3 ? "#e0483e" : "#ff9a2a"} opacity={0.5 + 0.4 * Math.abs(Math.sin(t / 7 + i))} />)}
      </>}
      {Array.from({ length: 9 }, (_, i) => { const sx = x - 170 + i * 42; return <ellipse key={i} cx={sx} cy={g - 10 + (i % 2) * 4} rx={24 + rnd(i + 30) * 6} ry={16} fill="#5a5a62" stroke="#000" strokeWidth={2} />; })}
      {L > 0.05 && <>
        {[[-40, 70, 300, -20], [30, 80, 340, 16], [0, 110, 420, 6], [-80, 60, 200, -26], [80, 60, 220, 22]].map(([dx, w, h, s0], i) => <path key={`o${i}`} d={tongue(x + dx * (0.5 + 0.5 * L), base, w * (0.5 + 0.5 * L), h * L * fl(i), s0 + sw(i))} fill={`url(#fo${id})`} />)}
        {[[-24, 60, 240, -10], [24, 64, 260, 12], [0, 80, 320, 0]].map(([dx, w, h, s0], i) => <path key={`m${i}`} d={tongue(x + dx * (0.5 + 0.5 * L), base, w * (0.5 + 0.5 * L), h * L * fl(i + 5), s0 + sw(i + 5))} fill={`url(#fm${id})`} />)}
        <path d={tongue(x, base, 56 * (0.5 + 0.5 * L), 170 * L * fl(8), 4 + sw(8) * 0.5)} fill={`url(#fi${id})`} />
      </>}
      {L > 0.5 && Array.from({ length: 14 }, (_, i) => { const up = (rnd(i + 60) * 300 + t * (3 + rnd(i) * 3)) % 320; return <circle key={`s${i}`} cx={x - 120 + rnd(i + 50) * 240 + Math.sin(t / 9 + i) * 20} cy={g - 240 - up} r={2 + rnd(i + 70) * 3} fill="#ffd27a" opacity={0.9 * (1 - up / 320)} />; })}
      {L < 0.45 && [0, 1, 2].map((i) => <path key={i} d={`M${x - 20 + i * 20} ${g - 40} q${-30 + Math.sin(t / 10 + i) * 12} -60 0 -120 q${30 + Math.sin(t / 8 + i) * 12} -60 -10 -130`} stroke="#8a8a92" strokeWidth={10 - i * 2} fill="none" opacity={0.25 * (0.45 - L) / 0.37} strokeLinecap="round" />)}
    </g>
  );
};

export const Ground: React.FC<{ g: number; id: string; warm?: boolean }> = ({ g, id, warm }) => (
  <g>
    <defs><linearGradient id={`soil${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={warm ? "#3a2e24" : "#26262c"} /><stop offset="1" stopColor="#060607" /></linearGradient></defs>
    {Array.from({ length: 13 }, (_, i) => { const x = i * 90 - 20 + rnd(i + 70) * 40, h = 200 + rnd(i + 80) * 160, w = 70 + rnd(i + 90) * 30; return <path key={i} d={`M${x} ${g} L${x + w / 2} ${g - h} L${x + w} ${g} Z`} fill="#121216" />; })}
    <rect x={0} y={g} width={1080} height={90} fill={`url(#soil${id})`} />
    <line x1={0} y1={g} x2={1080} y2={g} stroke="#4a4a52" strokeWidth={3} />
  </g>
);

export const Meter: React.FC<{ x: number; y: number; v: number; c: string }> = ({ x, y, v, c }) => (
  <g>
    <text x={x} y={y - 12} fontFamily={MONO} fontWeight={800} fontSize={24} fill="#9a9aa2">FIRE</text>
    <rect x={x} y={y} width={230} height={24} rx={12} fill="#141418" stroke="#5a5a62" strokeWidth={2} />
    <rect x={x + 3} y={y + 3} width={224 * v} height={18} rx={9} fill={c} />
    <text x={x + 244} y={y + 21} fontFamily={MONO} fontWeight={800} fontSize={24} fill={c}>{Math.round(v * 100)}%</text>
  </g>
);

const FX = 640;
/** lvTop/lvBot: fire levels; logU 0..1 = the log travelling from his chest to the fire; t = frames (flicker, scrolling) */
export const FireScene: React.FC<{ tag: string; n?: number; title?: string; lvTop?: number; lvBot?: number; logU?: number; t?: number; noText?: boolean }> = ({ tag, n, title, lvTop = 0.08, lvBot = 1, logU = 0.35, t = 0, noText }) => {
  const G1 = 860, G2 = 1620;
  const phone: Pose = { ...POSES.sit(64), lean: 22, head: 30, hN: [60, 30], hF: [52, 38], elbow: 1 };
  const pj = J(330, G1, phone, false, PS);
  // the log: from low by his knees (u=0) to resting across the flames (u=1)
  const u = Math.max(0, Math.min(1, logU));
  const arc = Math.sin(u * Math.PI) * 50;
  const logA: V = [FX - 230 + u * 120, G2 - 70 - arc + u * 40], logB: V = [FX - 100 + u * 120, G2 - 110 - arc + u * 70];
  const hx = FX - 300 + u * 30;
  const lay = reach({ ...POSES.crouch(), lean: 24 + u * 16, head: -4 }, hx, G2, [logA[0] + 30, logA[1] - 8], [logA[0] + 80, logA[1] - 22], false, PS);
  return (
    <g>
      <ClimbTag t={tag} n={n} title={title} />
      <Ground g={G1} id="a" />
      <Campfire x={FX} g={G1} level={lvTop} id="a" t={t} />
      <rect x={300} y={G1 - 42} width={64} height={42} rx={6} fill="#5e4836" stroke="#000" strokeWidth={2.5} />
      <ellipse cx={332} cy={G1 - 42} rx={32} ry={7} fill="#c9a77c" stroke="#000" strokeWidth={2} />
      <Hero x={330} y={G1 - 40} s={PS} pose={phone} look={GREY} />
      <Glow at={pj.wN} r={60} color="#8fb4ff" a={0.5 + 0.1 * Math.sin(t / 5)} />
      <rect x={pj.wN[0] + 4} y={pj.wN[1] - 24} width={22} height={38} rx={4} fill="#cfe0ff" stroke="#000" strokeWidth={2} />
      <path d={`M${pj.wN[0] + 6} ${pj.wN[1] - 90 - (t % 40) * 0.5} q16 -8 30 0 q14 8 28 0`} stroke="#bdbdc4" strokeWidth={3} fill="none" opacity={0.5 * (1 - (t % 40) / 40)} />
      <Meter x={40} y={G1 - 560} v={lvTop} c={lvTop > 0.5 ? "#d8d8dc" : "#e0483e"} />
      <text x={40} y={G1 + 60} fontFamily={SANS} fontWeight={700} fontSize={40} fill="#d8d8dc">Stopped adding wood</text>
      <Ground g={G2} id="b" warm />
      {Array.from({ length: 10 }, (_, i) => { const row = i < 4 ? 0 : i < 7 ? 1 : i < 9 ? 2 : 3, k = i - [0, 4, 7, 9][row], cx = 70 + k * 46 + row * 23, cy = G2 - 22 - row * 40; return <g key={i}><circle cx={cx} cy={cy} r={22} fill="#d9b98a" stroke="#000" strokeWidth={2.5} /><circle cx={cx} cy={cy} r={12} fill="none" stroke="#a8875c" strokeWidth={1.5} /><circle cx={cx} cy={cy} r={4} fill="#a8875c" /></g>; })}
      <Campfire x={FX} g={G2} level={lvBot} id="b" t={t + 13} />
      <Hero x={hx} y={G2} s={PS} pose={lay} look={HERO} />
      <Log a={logA} b={logB} r={14} id="hand" />
      <Meter x={40} y={G2 - 560} v={lvBot} c={GOLD} />
      <text x={40} y={G2 + 60} fontFamily={SANS} fontWeight={700} fontSize={40} fill={GOLD}>Keeps adding wood</text>
      {!noText && <g>
        <text x={540} y={1790} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={46} fill="#f2f2f2">Nothing burns forever</text>
        <text x={540} y={1854} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={54} fill={GOLD}>unless you keep taking action.</text>
      </g>}
    </g>
  );
};
