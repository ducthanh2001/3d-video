// "PROVE IT TO YOURSELF" v6 — in the competitor's own visual language (the one SAME HOURS used): pure black, one grey ground bar
// per lane, thick white figures, big grey 3D objects with the WORD written on them, a physical metaphor acted out, two lane labels,
// a counter, gold only for the payoff, red only for failure.
// 0 hook: the rocket explodes · 1 the 4th rocket lifts off · 2 a block called YOU: inspected vs carved · 3 one big splash vs a
// tap opened every day · 4 time pours out of the hourglass: buried vs shovelled into bricks · 5 a dead street lamp vs a torch.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { V, clamp } from "../../kit/core";
import { Hero, HeroLook, POSES, Pose } from "../../kit/hero";
import { KitDefs, Vignette } from "../../kit/materials";
import { Glow, Rays } from "../../kit/fx";
import { BOLD, BOLD_GREY, Defs, GOLD, Ground, Label, SANS } from "../samehours/StyleFrames";
import { J, reach } from "../beatyesterday/StyleFrames";

export const PROVE6_FRAMES = 6;
export const G1 = 830, G2 = 1660, S = 0.72;
export const RED = "#e0483e", MONO = "Consolas, 'Courier New', monospace";
export const HERO: HeroLook = { ...BOLD };
export const GREY: HeroLook = { ...BOLD_GREY, glow: 0 };
export const STONE: HeroLook = { body: "#b4b4ba", far: "#8a8a92", ink: "#2a2a30", glow: 0, width: 1.85, head: 1.18 };
export const rnd = (i: number) => { const x = Math.sin(i * 91.7 + 3.1) * 43758.5; return x - Math.floor(x); };
export const Count: React.FC<{ x: number; y: number; t: string; c?: string }> = ({ x, y, t, c = "#8a8a92" }) => (
  <text x={x} y={y} textAnchor="end" fontFamily={MONO} fontWeight={800} fontSize={38} letterSpacing={2} fill={c}>{t}</text>
);
export const Word: React.FC<{ x: number; y: number; t: string; size?: number; c?: string; r?: number }> = ({ x, y, t, size = 30, c = "#1a1a1e", r = 0 }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={size} letterSpacing={2} fill={c} transform={`rotate(${r} ${x} ${y})`}>{t}</text>
);
export const Say: React.FC<{ x: number; y: number; t: string; tail?: number }> = ({ x, y, t, tail = -1 }) => {
  const w = t.length * 16 + 44;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2} y={-32} width={w} height={56} rx={18} fill="#fff" />
      <path d={`M${tail * 26} 22 l${tail * 22} 28 l${-tail * 4} -28 Z`} fill="#fff" />
      <text x={0} y={6} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={28} fill="#111">{t}</text>
    </g>
  );
};
const Punch: React.FC<{ l1: string; l2: string }> = ({ l1, l2 }) => (
  <g>
    <text x={540} y={1790} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={46} fill="#f2f2f2">{l1}</text>
    <text x={540} y={1856} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={54} fill={GOLD}>{l2}</text>
  </g>
);
export const Effort: React.FC<{ at: V }> = ({ at }) => <g>{[0, 1, 2].map((i) => <path key={i} d={`M${at[0] + 22 + i * 12} ${at[1] - 30 + i * 14} q-6 10 0 18`} stroke="#bdbdc4" strokeWidth={3} fill="none" />)}</g>;
export const Lanes: React.FC<{ a: string; b: string }> = ({ a, b }) => (
  <g>
    <Label y={230} t={a} color="#9a9aa2" />
    <Ground y={G1} />
    <Label y={1010} t={b} />
    <Ground y={G2} />
  </g>
);

// ---------------------------------------------------------------- objects (grey 3D props with words on them)
export const Rocket: React.FC<{ x: number; y: number; r?: number; s?: number; gold?: boolean }> = ({ x, y, r = 0, s = 1, gold }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d="M-40 -60 L-80 0 L-40 -10 Z M40 -60 L80 0 L40 -10 Z" fill="#6a6a72" stroke="#000" strokeWidth={3} />
    <path d="M0 -260 Q46 -200 40 -10 L-40 -10 Q-46 -200 0 -260 Z" fill={gold ? "url(#sh-gold)" : "url(#sh-grey)"} stroke="#000" strokeWidth={3.5} />
    <circle cx={0} cy={-170} r={16} fill="#1a1a1e" stroke="#000" strokeWidth={3} />
    <Word x={4} y={-104} t="MY IDEA" size={24} r={-90} />
    <rect x={-26} y={-10} width={52} height={18} fill="#4a4a52" stroke="#000" strokeWidth={2} />
  </g>
);
export const Block: React.FC<{ x: number; g: number; w: number; h: number; t?: string }> = ({ x, g, w, h, t }) => (
  <g>
    <path d={`M${x - w / 2} ${g} V${g - h} L${x - w / 2 + 30} ${g - h - 26} H${x + w / 2 + 30} V${g - 26} L${x + w / 2} ${g} Z`} fill="#3a3a40" stroke="#000" strokeWidth={3} />
    <rect x={x - w / 2} y={g - h} width={w} height={h} fill="url(#sh-grey)" stroke="#000" strokeWidth={3.5} />
    {t && <Word x={x} y={g - h / 2 + 12} t={t} size={44} />}
  </g>
);
export const Hourglass: React.FC<{ x: number; y: number; h: number; level: number }> = ({ x, y, h, level }) => {
  const w = h * 0.6, m = y + h / 2;
  return (
    <g>
      <path d={`M${x - w / 2} ${y} H${x + w / 2} Q${x + w / 2} ${m - 30} ${x + 12} ${m} Q${x + w / 2} ${m + 30} ${x + w / 2} ${y + h} H${x - w / 2} Q${x - w / 2} ${m + 30} ${x - 12} ${m} Q${x - w / 2} ${m - 30} ${x - w / 2} ${y} Z`} fill="#fff" opacity={0.05} stroke="#d8d8dc" strokeWidth={5} />
      <path d={`M${x - w / 2 + 10} ${y + 16 + (1 - level) * (h / 2 - 50)} Q${x} ${y + 30 + (1 - level) * (h / 2 - 50)} ${x + w / 2 - 10} ${y + 16 + (1 - level) * (h / 2 - 50)} L${x + 10} ${m - 6} L${x - 10} ${m - 6} Z`} fill="#bdb6a4" />
      <rect x={x - w / 2 - 16} y={y - 16} width={w + 32} height={18} rx={6} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} />
      <rect x={x - w / 2 - 16} y={y + h - 2} width={w + 32} height={18} rx={6} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} />
      <Word x={x} y={y - 30} t="TIME" size={28} c="#d8d8dc" />
    </g>
  );
};
/** time running out of the hourglass: a spout at its base, a stream, and a pile growing beside it */
export const Spill: React.FC<{ x: number; g: number; w: number; pile: number }> = ({ x, g, w, pile }) => {
  const sx = x + w / 2 + 10, px = sx + 70;
  return (
    <g>
      <path d={`M${x + w / 2 - 10} ${g - 22} h40 v14`} fill="none" stroke="#000" strokeWidth={14} />
      <path d={`M${x + w / 2 - 10} ${g - 22} h40 v14`} fill="none" stroke="#8a8a92" strokeWidth={9} />
      <path d={`M${sx + 20} ${g - 8} Q${sx + 30} ${g - 4} ${px} ${g - pile * 0.55}`} fill="none" stroke="#bdb6a4" strokeWidth={5} />
      <path d={`M${px - pile} ${g} Q${px} ${g - pile * 1.1} ${px + pile} ${g} Z`} fill="#bdb6a4" stroke="#000" strokeWidth={2} />
    </g>
  );
};
/** a stone block carved into a chess KING: p = 0 a rough block, p = 1 the finished piece (its cross turns gold).
 *  Every outline point slides from the block's edge to the king's edge, with chisel roughness that fades as it gets finer. */
const KING_R: V[] = [[1, 0], [1, 0.07], [0.88, 0.1], [0.86, 0.15], [0.74, 0.18], [0.68, 0.45], [0.64, 0.6], [0.78, 0.64], [0.78, 0.69], [0.66, 0.71], [0.72, 0.84], [0.6, 0.88], [0.54, 0.88], [0.54, 0.92], [0.62, 0.92], [0.62, 0.96], [0.54, 0.96], [0.54, 1]];
const KING: V[] = [...KING_R.map(([x, y]) => [1 - x, y] as V), ...KING_R.slice().reverse()];
const toBox = (q: V): V => { const dx = q[0] - 0.5, dy = q[1] - 0.5, k = 0.5 / Math.max(Math.abs(dx), Math.abs(dy), 1e-6); return [0.5 + dx * k, 0.5 + dy * k]; };
export const piecePoint = (i: number, p: number): V => { const a = toBox(KING[i]), z = KING[i], j = (1 - p) * 0.04; return [a[0] + (z[0] - a[0]) * p + (rnd(i * 7 + Math.floor(p * 9)) - 0.5) * j, a[1] + (z[1] - a[1]) * p + (rnd(i * 3 + Math.floor(p * 9)) - 0.5) * j]; };
export const CHISEL_AT = 5; // the outline point he works on (the left flank of the body)
export const CarvedKing: React.FC<{ x0: number; base: number; w: number; h: number; p: number; word?: boolean }> = ({ x0, base, w, h, p, word }) => {
  const P = (q: V): V => [x0 + q[0] * w, base - q[1] * h];
  const pts = KING.map((_, i) => P(piecePoint(i, p)));
  const fine = clamp((p - 0.8) / 0.2);
  return (
    <g>
      <path d={`M${pts.map((q) => q.join(" ")).join(" L")} Z`} fill="url(#sh-grey)" stroke="#000" strokeWidth={4} strokeLinejoin="round" />
      {p < 0.9 && Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${x0 + w * (0.25 + rnd(i) * 0.5)} ${base - h * (0.2 + rnd(i + 4) * 0.6)} l${10 + rnd(i) * 20} ${16 + rnd(i + 2) * 20}`} stroke="#000" strokeWidth={2} opacity={0.35 * (1 - p)} />)}
      {fine > 0 && <g opacity={fine}>
        {[[0.14, 0.12], [0.24, 0.17], [0.3, 0.6], [0.24, 0.66]].map(([x, y], i) => <line key={i} x1={P([x, y])[0]} y1={P([x, y])[1]} x2={P([1 - x, y])[0]} y2={P([1 - x, y])[1]} stroke="#000" strokeWidth={2.5} opacity={0.45} />)}
        <path d={`M${P([0.46, 0.88])[0]} ${P([0.46, 0.88])[1]} V${P([0.46, 1])[1]} H${P([0.54, 1])[0]} V${P([0.54, 0.96])[1]} H${P([0.62, 0.96])[0]} V${P([0.62, 0.92])[1]} H${P([0.54, 0.92])[0]} V${P([0.54, 0.88])[1]} Z M${P([0.46, 0.92])[0]} ${P([0.46, 0.92])[1]} H${P([0.38, 0.92])[0]} V${P([0.38, 0.96])[1]} H${P([0.46, 0.96])[0]} Z`} fill="url(#sh-gold)" stroke="#000" strokeWidth={2.5} />
        <Glow at={P([0.5, 0.94])} r={90} color={GOLD} a={0.7} />
      </g>}
      {word && <Word x={x0 + w / 2} y={base - h / 2 + 12} t="YOU" size={44} c={`rgba(26,26,30,${1 - clamp(p * 2.5)})`} />}
    </g>
  );
};
/** a big wall clock that hands out hours: each one pops out as a block marked 1h */
export const HourClock: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => (
  <g>
    <rect x={x - 12} y={y + 70} width={24} height={40} fill="#3a3a40" stroke="#000" strokeWidth={2} />
    <circle cx={x} cy={y} r={80} fill="#f2f2f2" stroke="#000" strokeWidth={5} />
    {Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return <line key={i} x1={x + Math.sin(a) * 64} y1={y - Math.cos(a) * 64} x2={x + Math.sin(a) * 74} y2={y - Math.cos(a) * 74} stroke="#111" strokeWidth={i % 3 ? 2 : 5} />; })}
    <line x1={x} y1={y} x2={x + Math.sin(t * 0.33) * 58} y2={y - Math.cos(t * 0.33) * 58} stroke="#111" strokeWidth={5} strokeLinecap="round" />
    <line x1={x} y1={y} x2={x + Math.sin(t * 0.0275) * 40} y2={y - Math.cos(t * 0.0275) * 40} stroke="#111" strokeWidth={8} strokeLinecap="round" />
    <circle cx={x} cy={y} r={6} fill="#111" />
    <Word x={x} y={y - 100} t="TIME" size={28} c="#d8d8dc" />
  </g>
);
export const HourBlock: React.FC<{ x: number; y: number; r?: number; gold?: boolean; dust?: number }> = ({ x, y, r = 0, gold, dust = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${1 - dust * 0.4})`} opacity={1 - dust * 0.85}>
    <rect x={-33} y={-21} width={66} height={42} rx={4} fill={gold ? "url(#sh-gold)" : dust > 0 ? "#6a6a72" : "#cfc6a8"} stroke="#000" strokeWidth={2.5} />
    <text x={0} y={8} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={20} fill="#1a1a1e">1h</text>
  </g>
);
/** a wooden torch post with an iron fire basket on top — lit by hand with a flame (no electricity) */
export const Lamp: React.FC<{ x: number; g: number; h: number; on?: boolean; s?: number; f?: number }> = ({ x, g, h, on, s = 1, f = 0 }) => {
  const top = g - h, w = 34 * s;
  return (
    <g>
      {on && <><ellipse cx={x} cy={g} rx={120 * s} ry={18 * s} fill={GOLD} opacity={0.16} /><Glow at={[x, top - 20 * s]} r={130 * s} color={GOLD} a={0.75} /></>}
      <rect x={x - 6 * s} y={top} width={12 * s} height={h} fill="#5a4a32" stroke="#000" strokeWidth={2} />
      {on && <path d={`M${x - w * 0.7} ${top - 6 * s} Q${x - w * 0.6 + Math.sin(f * 0.6) * 4 * s} ${top - 60 * s} ${x} ${top - 84 * s} Q${x + w * 0.6 + Math.sin(f * 0.8) * 4 * s} ${top - 60 * s} ${x + w * 0.7} ${top - 6 * s} Z`} fill="#ffb84a" />}
      {on && <path d={`M${x - w * 0.35} ${top - 6 * s} Q${x} ${top - 50 * s} ${x + w * 0.35} ${top - 6 * s} Z`} fill="#ffe7a8" />}
      <path d={`M${x - w} ${top - 24 * s} L${x + w} ${top - 24 * s} L${x + w * 0.6} ${top + 4 * s} L${x - w * 0.6} ${top + 4 * s} Z`} fill={on ? "#3a2e18" : "#2a2a30"} stroke="#6a6a72" strokeWidth={3 * s} />
      {[-0.5, 0, 0.5].map((k) => <line key={k} x1={x + k * w * 1.6} y1={top - 24 * s} x2={x + k * w} y2={top + 4 * s} stroke="#6a6a72" strokeWidth={2 * s} />)}
    </g>
  );
};

// ================================================================ 0 · HOOK: the rocket explodes
export const measure: Pose = { ...POSES.stand(), head: 14, hN: [70, -20], hF: [50, 10], elbow: 1 };
/** "waits for perfect": he polishes the rocket again and again and never launches it; cobwebs grow on it */
export const Polisher: React.FC<{ t: number; web?: number }> = ({ t, web = 1 }) => {
  const wipe = Math.sin(t * 0.45) * 60, hand: V = [636, G1 - 170 + wipe];
  const pose = reach({ ...POSES.stand(), lean: 8, head: 10 }, 520, G1, hand, [628, G1 - 150 + wipe * 0.6], false, S);
  return (
    <g>
      <rect x={580} y={G1 - 20} width={200} height={20} fill="#3a3a40" stroke="#000" strokeWidth={2} />
      <Rocket x={680} y={G1 - 20} s={1.1} />
      {/* shine */}
      {[[700, G1 - 230], [730, G1 - 120], [668, G1 - 80]].map(([x, y], i) => { const k = 0.5 + 0.5 * Math.sin(t * 0.3 + i * 2); return <path key={i} d={`M${x} ${y - 14 * k} L${x + 4} ${y - 4} L${x + 14 * k} ${y} L${x + 4} ${y + 4} L${x} ${y + 14 * k} L${x - 4} ${y + 4} L${x - 14 * k} ${y} L${x - 4} ${y - 4} Z`} fill="#fff" opacity={0.8 * k} />; })}
      {/* cobwebs from the rocket to the pad: it has never left */}
      <g opacity={web * 0.55} stroke="#cfcfd4" strokeWidth={1.5} fill="none">
        <path d={`M760 ${G1 - 20} L740 ${G1 - 90} M780 ${G1 - 20} L748 ${G1 - 70} M770 ${G1 - 20} Q760 ${G1 - 50} 744 ${G1 - 80}`} />
        <path d={`M590 ${G1 - 20} L626 ${G1 - 80} M600 ${G1 - 20} Q614 ${G1 - 46} 632 ${G1 - 64}`} />
      </g>
      <Hero x={520} y={G1} s={S} pose={pose} look={GREY} />
      <rect x={hand[0] - 14} y={hand[1] - 12} width={28} height={24} rx={4} fill="#e8e8ec" stroke="#000" strokeWidth={1.5} />
    </g>
  );
};
const TopRocket: React.FC = () => (
  <g>
    <Polisher t={8} />
    <Say x={330} y={420} t="not perfect yet…" />
    <Count x={1040} y={290} t="LAUNCHES: 0" />
  </g>
);
const F0: React.FC = () => {
  const duck: Pose = { ...POSES.crouch(), head: 20, hN: [10, -40], hF: [20, -50], elbow: -1 };
  const boom: V = [700, 1260];
  return (
    <g>
      <Lanes a="Waits for perfect" b="Launches anyway" />
      <TopRocket />
      {/* launch 1: it blew up */}
      <rect x={600} y={G2 - 20} width={200} height={20} fill="#3a3a40" stroke="#000" strokeWidth={2} />
      <Glow at={boom} r={260} color={RED} a={0.5} />
      {Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return <path key={i} d={`M${boom[0]} ${boom[1]} L${boom[0] + Math.cos(a) * (130 + rnd(i) * 80)} ${boom[1] + Math.sin(a) * (110 + rnd(i) * 70)}`} stroke={i % 2 ? RED : "#ffb84a"} strokeWidth={10} strokeLinecap="round" />; })}
      <circle cx={boom[0]} cy={boom[1]} r={70} fill="#ffe7a8" />
      {Array.from({ length: 10 }, (_, i) => <rect key={i} x={boom[0] - 200 + rnd(i + 5) * 400} y={boom[1] - 200 + rnd(i + 8) * 360} width={20} height={34} fill="#8a8a92" stroke="#000" strokeWidth={2} transform={`rotate(${rnd(i) * 360} ${boom[0] - 200 + rnd(i + 5) * 400} ${boom[1] - 200 + rnd(i + 8) * 360})`} />)}
      <Hero x={330} y={G2} s={S} pose={duck} look={HERO} />
      <Count x={1040} y={1070} t="TRY 1: FAILED" c={RED} />
      <Punch l1="Perfect never takes off." l2="" />
    </g>
  );
};

// ================================================================ 1 · the 4th rocket lifts off
const F1: React.FC = () => {
  const cheer: Pose = { ...POSES.armsUp(), head: -30 };
  return (
    <g>
      <Lanes a="Waits for perfect" b="Launches anyway" />
      <TopRocket />
      <rect x={600} y={G2 - 20} width={200} height={20} fill="#3a3a40" stroke="#000" strokeWidth={2} />
      {/* the three that failed, as scorch marks */}
      {[0, 1, 2].map((i) => <ellipse key={i} cx={650 + i * 60} cy={G2 - 22} rx={40} ry={8} fill="#000" opacity={0.6} />)}
      {/* smoke column + gold flame, rocket high */}
      {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={700 + (rnd(i) - 0.5) * 60} cy={G2 - 40 - i * 26} r={46 - i * 2.5} fill="#d8d8dc" opacity={0.28 - i * 0.015} />)}
      <Glow at={[700, 1330]} r={300} color={GOLD} a={0.55} />
      <Rays f={0} at={[700, 1330]} a={0.35} color={GOLD} n={14} len={500} />
      <path d={`M680 1360 Q700 1470 720 1360 Q712 1430 700 1510 Q688 1430 680 1360 Z`} fill="#ffb84a" />
      <path d={`M690 1360 Q700 1420 710 1360 Z`} fill="#fff3c4" />
      <Rocket x={700} y={1360} s={1.0} gold />
      <Hero x={330} y={G2} s={S} pose={cheer} look={HERO} />
      <Count x={1040} y={1070} t="TRY 4: LIFTOFF!" c={GOLD} />
      <Punch l1="Perfect never takes off." l2="Trying does." />
    </g>
  );
};

// ================================================================ 2 · a block called YOU: inspected vs carved
const F2: React.FC = () => {
  const inspect: Pose = { ...POSES.stand(), lean: 18, head: 16, hN: [100, -10], hF: [40, 40], elbow: 1, fN: [40, 0], fF: [-30, 0] };
  const ij = J(330, G1, inspect, false, S);
  const chisel: V = [580 + piecePoint(CHISEL_AT, 1)[0] * 300 - 12, G2 - 40 - piecePoint(CHISEL_AT, 1)[1] * 440];
  const strike = reach({ ...POSES.stand(), lean: 14, head: 10, fN: [50, 0], fF: [-50, 0] }, 330, G2, [chisel[0] - 50, chisel[1] + 6], [chisel[0] - 70, chisel[1] - 150], false, S);
  const tj = J(330, G2, strike, false, S);
  return (
    <g>
      <Lanes a="Looks for himself" b="Works on himself" />
      <Block x={720} g={G1} w={300} h={460} t="YOU" />
      <Hero x={330} y={G1} s={S} pose={inspect} look={GREY} />
      <circle cx={ij.wN[0] + 30} cy={ij.wN[1] - 14} r={30} fill="#fff" opacity={0.12} stroke="#d8d8dc" strokeWidth={6} />
      <line x1={ij.wN[0] + 8} y1={ij.wN[1] + 6} x2={ij.wN[0] - 10} y2={ij.wN[1] + 30} stroke="#d8d8dc" strokeWidth={8} />
      <Say x={430} y={330} t="where am I?" />
      <Count x={1040} y={290} t="DAY 100" />
      {/* the same block, carved: a chess king */}
      <Glow at={[720, G2 - 270]} r={280} color={GOLD} a={0.3} />
      <rect x={560} y={G2 - 40} width={340} height={40} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} />
      <CarvedKing x0={580} base={G2 - 40} w={300} h={440} p={1} />
      {Array.from({ length: 14 }, (_, i) => <polygon key={i} points={`${chisel[0] + 10 + rnd(i) * 120},${chisel[1] - 60 + rnd(i + 3) * 120} ${chisel[0] + 22 + rnd(i) * 120},${chisel[1] - 70 + rnd(i + 3) * 120} ${chisel[0] + 18 + rnd(i) * 120},${chisel[1] - 52 + rnd(i + 3) * 120}`} fill="#bdbdc4" stroke="#000" strokeWidth={1} />)}
      {Array.from({ length: 26 }, (_, i) => <polygon key={i} points={`${380 + rnd(i + 9) * 560},${G2 - rnd(i) * 8} ${392 + rnd(i + 9) * 560},${G2 - 10 - rnd(i + 2) * 10} ${404 + rnd(i + 9) * 560},${G2 - rnd(i + 5) * 6}`} fill="#7a7a82" stroke="#000" strokeWidth={1.2} />)}
      <line x1={tj.wN[0]} y1={tj.wN[1]} x2={chisel[0]} y2={chisel[1]} stroke="#d8d8dc" strokeWidth={8} strokeLinecap="round" />
      {[3, 2, 1].map((k) => <g key={k} opacity={0.12 * (4 - k)} transform={`rotate(${-k * 9} ${tj.wF[0]} ${tj.wF[1] + 60})`}><rect x={tj.wF[0] - 26} y={tj.wF[1] - 30} width={52} height={30} rx={4} fill="#d8d8dc" /></g>)}
      <rect x={tj.wF[0] - 26} y={tj.wF[1] - 30} width={52} height={30} rx={4} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} />
      <line x1={tj.wF[0]} y1={tj.wF[1]} x2={tj.wF[0] - 4} y2={tj.wF[1] + 70} stroke="#7a6a4a" strokeWidth={8} />
      <Hero x={330} y={G2} s={S} pose={strike} look={HERO} />
      <Effort at={tj.head} />
      <Count x={1040} y={1070} t="DAY 100" c={GOLD} />
      <Punch l1="You won't find yourself." l2="You'll carve yourself." />
    </g>
  );
};

// ================================================================ 3 · one big splash vs a tap opened every day
/** a big grey mountain with a word on it */
export const Mountain: React.FC<{ g: number; t: string }> = ({ g, t }) => (
  <g>
    <path d={`M470 ${g} L600 ${g - 330} L690 ${g - 280} L800 ${g - 470} L920 ${g - 360} L1080 ${g - 420} V${g} Z`} fill="url(#sh-grey)" stroke="#000" strokeWidth={4} />
    <path d={`M800 ${g - 470} L760 ${g - 300} L820 ${g - 200} M600 ${g - 330} L640 ${g - 200}`} fill="none" stroke="#000" strokeWidth={3} opacity={0.4} />
    <Word x={890} y={g - 290} t={t} size={38} />
  </g>
);
export const Pickaxe: React.FC<{ a: V; b: V }> = ({ a, b }) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy), ux = dx / n, uy = dy / n;
  return (
    <g>
      <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#7a6a4a" strokeWidth={9} strokeLinecap="round" />
      <path d={`M${b[0] - uy * 60 - ux * 10} ${b[1] + ux * 60 - uy * 10} Q${b[0] + ux * 16} ${b[1] + uy * 16} ${b[0] + uy * 60 - ux * 10} ${b[1] - ux * 60 - uy * 10}`} fill="none" stroke="#d8d8dc" strokeWidth={10} strokeLinecap="round" />
    </g>
  );
};
const F3: React.FC = () => {
  // top: one big blast — loud, and it barely marks the mountain
  const plunge: Pose = { ...POSES.stand(), lean: 26, head: 20, hN: [60, 60], hF: [50, 66], fN: [40, 0], fF: [-50, 0], elbow: 1 };
  const pj = J(220, G1, plunge, false, S);
  // bottom: a swing a day — the tunnel is through, light on the other side
  const swingP = reach({ ...POSES.stand(), lean: -10, head: -10, fN: [50, 0], fF: [-50, 0] }, 560, G2, [520, G2 - 290], [500, G2 - 250], false, S);
  const sj = J(560, G2, swingP, false, S);
  return (
    <g>
      <Lanes a="Once, hard" b="Every day, a swing" />
      <Mountain g={G1} t="IMPOSSIBLE" />
      <rect x={pj.wN[0] - 50} y={G1 - 70} width={100} height={70} rx={6} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} />
      <line x1={pj.wN[0]} y1={pj.wN[1]} x2={pj.wN[0]} y2={G1 - 70} stroke="#8a8a92" strokeWidth={8} />
      <rect x={pj.wN[0] - 34} y={pj.wN[1] - 8} width={68} height={12} rx={4} fill="#d8d8dc" stroke="#000" strokeWidth={2} />
      <path d={`M${pj.wN[0] + 50} ${G1 - 20} Q420 ${G1 + 6} 600 ${G1 - 60}`} fill="none" stroke={RED} strokeWidth={3} />
      <Hero x={220} y={G1} s={S} pose={plunge} look={GREY} />
      {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={560 + rnd(i) * 160} cy={G1 - 120 - rnd(i + 4) * 220} r={30 + rnd(i + 8) * 40} fill="#8a8a92" opacity={0.35} />)}
      <Glow at={[620, G1 - 140]} r={140} color={RED} a={0.4} />
      <text x={470} y={400} fontFamily={SANS} fontWeight={900} fontSize={96} fill="#f2f2f2" stroke="#000" strokeWidth={6} paintOrder="stroke" transform="rotate(-8 470 400)">BOOM!</text>
      <ellipse cx={612} cy={G1 - 110} rx={26} ry={16} fill="#000" opacity={0.6} />
      <Count x={1040} y={290} t="TUNNEL: 0 m" />
      <Mountain g={G2} t="IMPOSSIBLE" />
      {/* the tunnel: dark inside, daylight at the far end */}
      <defs><radialGradient id="tun" cx="50%" cy="55%" r="55%"><stop offset="0" stopColor="#ffe7a8" /><stop offset="0.18" stopColor={GOLD} /><stop offset="0.35" stopColor="#2a2418" /><stop offset="1" stopColor="#050506" /></radialGradient></defs>
      <path d={`M600 ${G2} V${G2 - 150} Q600 ${G2 - 260} 700 ${G2 - 260} Q800 ${G2 - 260} 800 ${G2 - 150} V${G2} Z`} fill="url(#tun)" stroke="#000" strokeWidth={4} />
      <Rays f={0} at={[700, G2 - 120]} a={0.45} color={GOLD} n={12} len={420} />
      <Glow at={[700, G2 - 120]} r={200} color={GOLD} a={0.5} />
      {Array.from({ length: 22 }, (_, i) => <polygon key={i} points={`${300 + rnd(i + 2) * 280},${G2 - rnd(i) * 10} ${314 + rnd(i + 2) * 280},${G2 - 14 - rnd(i + 3) * 14} ${330 + rnd(i + 2) * 280},${G2 - rnd(i + 5) * 8}`} fill="#7a7a82" stroke="#000" strokeWidth={1.2} />)}
      <path d={`M300 ${G2} Q380 ${G2 - 90} 480 ${G2} Z`} fill="#5a5a62" stroke="#000" strokeWidth={2} />
      <Hero x={560} y={G2} s={S} pose={swingP} look={HERO} />
      <Pickaxe a={sj.wN} b={[sj.wF[0] + 40, sj.wF[1] - 70]} />
      <Effort at={sj.head} />
      <Count x={1040} y={1070} t="SWINGS: 10,000" c={GOLD} />
      <Punch l1="Big blasts make noise." l2="Small swings make tunnels." />
    </g>
  );
};

// ================================================================ 4 · time pours out of the hourglass: buried vs shovelled into bricks
const F4: React.FC = () => {
  const lie = reach({ ...POSES.lie(), head: -14 }, 800, G1, [690, G1 - 70], undefined, false, S);
  const lj = J(800, G1, lie, false, S);
  const rows = [4, 4, 4, 3, 3, 3, 2, 2, 2];
  return (
    <g>
      <Lanes a="Lets time pass" b="Builds with it" />
      <HourClock x={190} y={420} t={40} />
      <path d={`M380 ${G1} Q470 ${G1 - 110} 560 ${G1} Z`} fill="#4a4a52" />
      {[[430, 0.2], [500, 0.5], [540, 0.8]].map(([x, d], i) => <HourBlock key={i} x={x} y={G1 - 40} r={(i - 1) * 14} dust={d} />)}
      <HourBlock x={330} y={600} r={130} />
      <Hero x={800} y={G1} s={S} pose={lie} look={GREY} shadow={0} />
      <Glow at={[lj.wN[0], lj.wN[1] - 10]} r={60} color="#8fb4ff" a={0.5} />
      <rect x={lj.wN[0] - 12} y={lj.wN[1] - 30} width={24} height={40} rx={5} fill="#cfe0ff" stroke="#000" strokeWidth={2} />
      <Say x={760} y={430} t="later…" />
      <Count x={1040} y={290} t="1,000 h" c={RED} />
      <HourClock x={190} y={1250} t={40} />
      <Glow at={[760, G2 - 280]} r={300} color={GOLD} a={0.35} />
      {rows.map((w, r) => Array.from({ length: w }, (_, c) => <HourBlock key={`${r}${c}`} x={760 - (w * 70) / 2 + c * 70 + (r % 2) * 10 + 33} y={G2 - (r + 1) * 46 + 21} gold={r === rows.length - 1} />))}
      <Hero x={770} y={G2 - 9 * 46} s={0.5} pose={{ ...POSES.armsUp(), head: -12 }} look={HERO} shadow={0} />
      <Count x={1040} y={1070} t="1,000 h" c={GOLD} />
      <Punch l1="Time will pass anyway." l2="Let it build something." />
    </g>
  );
};

// ================================================================ 5 · FINALE: a dead street lamp vs a torch lighting the road
const F5: React.FC = () => {
  const z = 0.5, posts = Array.from({ length: 8 }, (_, i) => 380 + i * 190), hx = posts[7] - 70;
  const up = reach({ ...POSES.stand(), lean: -6, head: -26 }, hx, G2, [hx + 60, G2 - 330], undefined, false, S);
  const uj = J(hx, G2, up, false, S);
  return (
    <g>
      <Lanes a="Waits for someone" b="Strikes again" />
      <Lamp x={580} g={G1} h={360} />
      <Hero x={500} y={G1} s={S} pose={{ ...POSES.hugKnees(), head: -10 }} look={GREY} />
      <Say x={620} y={330} t="someone will light it…" />
      <Count x={1040} y={290} t="WAITING" />
      {/* the whole road, lit post by post, seen from far back */}
      <g transform={`translate(0 ${G2}) scale(${z}) translate(0 ${-G2})`}>
        <rect x={-200} y={G2} width={2600} height={60} fill="#141418" />
        <rect x={posts[0] - 120} y={G2 - 6} width={posts[7] - posts[0] + 240} height={40} rx={20} fill={GOLD} opacity={0.14} />
        {posts.map((x, i) => <Lamp key={i} x={x} g={G2} h={300} on f={i * 7} />)}
        {[0, 1, 2].map((i) => <g key={i} transform={`rotate(${-30 + i * 25} ${100 + i * 36} ${G2 - 6})`}><line x1={100 + i * 36} y1={G2 - 6} x2={144 + i * 36} y2={G2 - 6} stroke="#c8b48a" strokeWidth={5} /><circle cx={146 + i * 36} cy={G2 - 6} r={6} fill={RED} /></g>)}
        <Hero x={hx} y={G2} s={S} pose={up} look={HERO} />
        <line x1={uj.wN[0]} y1={uj.wN[1]} x2={uj.wN[0] + 10} y2={uj.wN[1] - 60} stroke="#7a6a4a" strokeWidth={10} />
        <path d={`M${uj.wN[0] + 10} ${uj.wN[1] - 60} q-18 -24 0 -56 q18 32 0 56`} fill="#ffb84a" />
        <Glow at={[uj.wN[0] + 10, uj.wN[1] - 86]} r={130} color={GOLD} a={0.8} />
      </g>
      <Count x={1040} y={1070} t="MATCHES: 4" c={GOLD} />
      <Punch l1="Nobody is coming to light it for you." l2="Strike again." />
    </g>
  );
};

const FRAMES = [F0, F1, F2, F3, F4, F5];
export const ProveV6Frames: React.FC = () => {
  const F = FRAMES[Math.min(FRAMES.length - 1, useCurrentFrame())];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <KitDefs />
        <Defs />
        <F />
        <Vignette a={0.3} />
      </svg>
    </AbsoluteFill>
  );
};
