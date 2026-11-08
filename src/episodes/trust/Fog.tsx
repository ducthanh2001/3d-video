// TRUST THE PROCESS · scene 3 "rowing in the fog": two rowers cross the same lake in thick fog. Top can't see the shore and
// turns back — it was 20 m away behind the fog. Bottom keeps rowing without seeing it and the bow taps the lit dock.
// Real objects: a planked wooden rowboat, oars in oarlocks, water with ripples and reflections, a timber dock on posts, a lamp.
import React from "react";
import { V } from "../../kit/core";
import { Hero, HeroLook, POSES, Pose } from "../../kit/hero";
import { Glow } from "../../kit/fx";
import { BOLD, BOLD_GREY, GOLD, SANS } from "../samehours/StyleFrames";
import { reach } from "../beatyesterday/StyleFrames";
import { ClimbTag } from "./Frames";

const MONO = "Consolas, 'Courier New', monospace";
const HERO: HeroLook = { ...BOLD };
const GREY: HeroLook = { ...BOLD_GREY, glow: 0 };
const rnd = (i: number) => { const x = Math.sin(i * 57.3 + 1.9) * 43758.5; return x - Math.floor(x); };
const PS = 0.62;

/** rowboat, side view, bow to the right; origin = the waterline under the middle. The rower sits facing the stern (left). */
const Boat: React.FC<{ id: string; look: HeroLook; slump?: boolean }> = ({ id, look, slump }) => {
  const seatY = -46, hx = -6;
  const handle: V = slump ? [-60, -70] : [-78, -92];
  const lock: V = [-30, -60];
  const blade: V = slump ? [-60, 14] : [-120, 10];
  const base: Pose = { ...POSES.sit(56), lean: slump ? 30 : 14, head: slump ? 34 : 0 };
  const pose = reach(base, hx, -6, handle, [handle[0] + 8, handle[1] + 4], true, PS);
  return (
    <g>
      <defs>
        <linearGradient id={`hull${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8a6a4c" /><stop offset="0.6" stopColor="#5a4230" /><stop offset="1" stopColor="#2a1e14" /></linearGradient>
      </defs>
      {/* far oar (behind the boat) */}
      <path d={`M${handle[0] + 10} ${handle[1] - 4} L${blade[0] + 16} ${blade[1] - 6}`} stroke="#5a4636" strokeWidth={7} strokeLinecap="round" />
      {/* inside of the hull + seat */}
      <path d={`M-180 -52 Q0 -40 186 -76 L176 -60 Q0 -30 -172 -40 Z`} fill="#2a1e14" />
      <rect x={-34} y={seatY} width={60} height={8} fill="#6a5038" />
      <Hero x={hx} y={-6} s={PS} pose={pose} look={look} flip shadow={0} />
      {/* hull: transom (stern) left, bow sweeping up right, planks */}
      <path d={`M-182 -54 Q0 -40 188 -78 Q170 -20 110 6 Q0 26 -150 10 Q-176 0 -182 -54 Z`} fill={`url(#hull${id})`} stroke="#000" strokeWidth={3} strokeLinejoin="round" />
      <path d={`M-180 -36 Q0 -22 176 -54 M-174 -16 Q0 -4 150 -28`} stroke="#000" strokeWidth={2} opacity={0.5} fill="none" />
      <path d={`M-182 -54 Q0 -40 188 -78`} stroke="#b08a62" strokeWidth={6} fill="none" strokeLinecap="round" />
      {/* near oar: handle → oarlock → blade in the water */}
      <path d={`M${handle[0]} ${handle[1]} L${lock[0]} ${lock[1]} L${blade[0]} ${blade[1]}`} stroke="#c9a77c" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx={lock[0]} cy={lock[1]} r={6} fill="#9a9aa2" stroke="#000" strokeWidth={2} />
      <ellipse cx={blade[0]} cy={blade[1] + 6} rx={12} ry={24} transform={`rotate(${slump ? 0 : 40} ${blade[0]} ${blade[1] + 6})`} fill="#c9a77c" stroke="#000" strokeWidth={2} />
    </g>
  );
};

const Water: React.FC<{ w: number; id: string; gold?: boolean }> = ({ w, id, gold }) => (
  <g>
    <defs>
      <linearGradient id={`wt${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a3640" /><stop offset="1" stopColor="#05070a" /></linearGradient>
    </defs>
    <rect x={0} y={w} width={1080} height={190} fill={`url(#wt${id})`} />
    {Array.from({ length: 34 }, (_, i) => { const x = rnd(i + 10) * 1080, y = w + 10 + rnd(i + 20) * 160, l = 30 + rnd(i + 30) * 70; return <line key={i} x1={x} y1={y} x2={x + l} y2={y} stroke="#7a8a96" strokeWidth={2} opacity={0.35} />; })}
    {gold && Array.from({ length: 9 }, (_, i) => <line key={i} x1={930 - 40 + rnd(i) * 30} y1={w + 14 + i * 16} x2={930 + 40 - rnd(i + 3) * 30} y2={w + 14 + i * 16} stroke={GOLD} strokeWidth={4} opacity={0.7 - i * 0.06} />)}
  </g>
);

/** timber dock on posts + a lamp; origin x = its left end, w = waterline */
const Dock: React.FC<{ x: number; w: number; lit?: boolean }> = ({ x, w, lit }) => (
  <g>
    {/* shore behind */}
    <path d={`M${x + 60} ${w - 40} Q${x + 160} ${w - 120} ${x + 300} ${w - 110} L1080 ${w - 130} L1080 ${w} L${x + 60} ${w} Z`} fill="#1a1e1a" />
    {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${x + 140 + i * 60} ${w - 100} l26 -150 l26 150 Z`} fill="#16241a" />)}
    {[0, 90, 180].map((d) => <rect key={d} x={x + 10 + d} y={w - 46} width={16} height={70} fill="#4a3828" stroke="#000" strokeWidth={2} />)}
    <rect x={x} y={w - 60} width={1080 - x} height={18} fill="#7a5c40" stroke="#000" strokeWidth={2.5} />
    {Array.from({ length: 8 }, (_, i) => <line key={i} x1={x + 30 + i * 34} y1={w - 60} x2={x + 30 + i * 34} y2={w - 42} stroke="#000" strokeWidth={1.5} opacity={0.6} />)}
    {/* lamp post */}
    <rect x={x + 150} y={w - 250} width={8} height={190} fill="#3a3a40" />
    <rect x={x + 140} y={w - 272} width={28} height={30} rx={4} fill={lit ? "#ffe2a0" : "#6a6a62"} stroke="#000" strokeWidth={2} />
    {lit && <Glow at={[x + 154, w - 257]} r={200} color={GOLD} a={0.7} />}
  </g>
);

/** thick fog: soft blurred banks; anything drawn after it stays sharp */
const Fog: React.FC<{ id: string; x0: number; x1: number; y0: number; y1: number; a: number }> = ({ id, x0, x1, y0, y1, a }) => (
  <g>
    <defs><filter id={`fg${id}`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={26} /></filter></defs>
    <g filter={`url(#fg${id})`} opacity={a}>
      {Array.from({ length: 22 }, (_, i) => <ellipse key={i} cx={x0 + rnd(i + 40) * (x1 - x0)} cy={y0 + rnd(i + 50) * (y1 - y0)} rx={120 + rnd(i + 60) * 120} ry={50 + rnd(i + 70) * 50} fill="#c8ccd0" opacity={0.75} />)}
    </g>
  </g>
);

const Gauge: React.FC<{ x: number; y: number; t: string; c: string }> = ({ x, y, t, c }) => (
  <g>
    <rect x={x} y={y} width={250} height={66} rx={10} fill="#0e0e10" stroke={c} strokeWidth={3} />
    <text x={x + 18} y={y + 43} fontFamily={MONO} fontWeight={800} fontSize={24} fill="#9a9aa2">SHORE</text>
    <text x={x + 232} y={y + 46} textAnchor="end" fontFamily={MONO} fontWeight={800} fontSize={36} fill={c}>{t}</text>
  </g>
);

export const FogScene: React.FC<{ tag: string }> = ({ tag }) => {
  const W1 = 790, W2 = 1530;
  return (
    <g>
      <ClimbTag t={tag} />
      {/* ---- row 1: can't see it, turns back */}
      <Dock x={720} w={W1} />
      <Water w={W1} id="a" />
      <Fog id="a" x0={360} x1={1120} y0={W1 - 330} y1={W1 + 20} a={0.8} />
      <Fog id="a2" x0={-100} x1={500} y0={W1 - 120} y1={W1 + 30} a={0.45} />
      <g transform={`translate(330 ${W1}) scale(-1 1)`}><Boat id="a" look={GREY} slump /></g>
      <path d={`M150 ${W1 - 140} q-50 -10 -90 20 m0 0 l20 -4 m-20 4 l6 18`} fill="none" stroke="#e0483e" strokeWidth={5} strokeLinecap="round" />
      <text x={60} y={W1 - 160} fontFamily={MONO} fontWeight={800} fontSize={26} fill="#e0483e">turned back</text>
      <path d={`M520 ${W1 - 30} L700 ${W1 - 30}`} stroke="#f2f2f2" strokeWidth={2.5} strokeDasharray="8 7" />
      <path d={`M520 ${W1 - 40} v20 M700 ${W1 - 40} v20`} stroke="#f2f2f2" strokeWidth={2.5} />
      <text x={610} y={W1 - 44} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={28} fill="#f2f2f2">20 m</text>
      <Gauge x={40} y={W1 - 560} t="???" c="#e0483e" />
      <text x={40} y={W1 + 150} fontFamily={SANS} fontWeight={700} fontSize={40} fill="#d8d8dc">Needs to see it</text>
      {/* ---- row 2: keeps rowing blind, arrives */}
      <Fog id="b" x0={-120} x1={520} y0={W2 - 300} y1={W2 + 20} a={0.9} />
      <Dock x={720} w={W2} lit />
      <Water w={W2} id="b" gold />
      <g transform={`translate(560 ${W2})`}><Boat id="b" look={HERO} /></g>
      {[0, 1, 2].map((i) => <path key={i} d={`M${380 - i * 60} ${W2 + 8} q-30 6 -60 0`} stroke="#d8d8dc" strokeWidth={3} fill="none" opacity={0.6 - i * 0.15} />)}
      <Gauge x={40} y={W2 - 560} t="0 m" c={GOLD} />
      <text x={40} y={W2 + 150} fontFamily={SANS} fontWeight={700} fontSize={40} fill={GOLD}>Trusts the process</text>
      <text x={540} y={1790} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={46} fill="#f2f2f2">Most turn back in the fog.</text>
      <text x={540} y={1854} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={54} fill={GOLD}>The shore was right there.</text>
    </g>
  );
};
