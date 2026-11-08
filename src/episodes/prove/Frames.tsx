// "PROVE IT TO YOURSELF" — style frames. Every vignette = one TRANSFORMATION (like the competitor's boulder that becomes the sun):
// 0a hook at second 0 (paper planes crashing) · 0b the 5th plane becomes a jet · 1 the stone becomes a gold statue of him
// · 2 a drop a day becomes a canyon · 3 the sand becomes a pyramid · 4 one match lights a whole city.
// Look: B&W dominant, depth layers + haze + stars, practical light, gold = the transformation, red = failure.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { V } from "../../kit/core";
import { Hero, HeroLook, POSES, Pose } from "../../kit/hero";
import { KitDefs, Vignette } from "../../kit/materials";
import { Glow, Rays } from "../../kit/fx";
import { BOLD, BOLD_GREY, Defs, GOLD, SANS } from "../samehours/StyleFrames";
import { J, reach } from "../beatyesterday/StyleFrames";

export const PROVE_FRAMES = 6;
export const MONO = "Consolas, 'Courier New', monospace";
export const RED = "#e0483e";
export const HERO: HeroLook = { ...BOLD, eyes: "side" };
export const GREY: HeroLook = { ...BOLD_GREY, glow: 0, eyes: "side", eyeColor: "#1a1a1e" };
const GOLDEN: HeroLook = { body: "#f3c766", far: "#b98a32", ink: "#2a1e08", glow: 0.5, glowColor: GOLD, width: 1.85, head: 1.18 };
export const S = 0.66;
export const rnd = (i: number) => { const x = Math.sin(i * 91.7 + 3.1) * 43758.5; return x - Math.floor(x); };
export const L1 = [150, 870], L2 = [930, 1650]; // lane tops / bottoms

// ---------------------------------------------------------------- shared look
/** a lane: night backdrop with haze, faint far hills, stars, a lit ground slab, and its label */
export const Lane: React.FC<{ y0: number; y1: number; label: string; bright?: boolean; id: string; stars?: boolean; hills?: boolean }> = ({ y0, y1, label, bright, id, stars = true, hills = true }) => {
  const g = y1 - 110;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#050507" /><stop offset="1" stopColor="#1c1c21" /></linearGradient>
        <linearGradient id={`${id}gr`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a3a41" /><stop offset="1" stopColor="#0a0a0c" /></linearGradient>
        <clipPath id={`${id}c`}><rect x={24} y={y0} width={1032} height={y1 - y0} rx={14} /></clipPath>
      </defs>
      <g clipPath={`url(#${id}c)`}>
        <rect x={24} y={y0} width={1032} height={y1 - y0} fill={`url(#${id}sky)`} />
        {stars && Array.from({ length: 34 }, (_, i) => <circle key={i} cx={30 + rnd(i + y0) * 1020} cy={y0 + 10 + rnd(i + y0 + 99) * (g - y0 - 160)} r={0.8 + rnd(i * 3 + y0) * 1.8} fill="#fff" opacity={0.25 + rnd(i * 7 + y0) * 0.5} />)}
        {hills && <path d={`M24 ${g - 60} Q200 ${g - 150} 380 ${g - 80} T760 ${g - 110} T1056 ${g - 70} V${g} H24 Z`} fill="#18181c" />}
        <rect x={24} y={g - 40} width={1032} height={60} fill="#fff" opacity={0.025} />
        <rect x={24} y={g} width={1032} height={y1 - g} fill={`url(#${id}gr)`} />
        <line x1={24} y1={g} x2={1056} y2={g} stroke="#8a8a92" strokeWidth={3} />
      </g>
      <rect x={24} y={y0} width={1032} height={y1 - y0} rx={14} fill="none" stroke="#2a2a30" strokeWidth={3} />
      <text x={56} y={y0 + 58} fontFamily={SANS} fontWeight={700} fontSize={40} fill={bright ? "#f2f2f2" : "#8a8a92"}>{label}</text>
    </g>
  );
};
export const Count: React.FC<{ x: number; y: number; t: string; c?: string; size?: number }> = ({ x, y, t, c = "#d8d8dc", size = 36 }) => (
  <text x={x} y={y} textAnchor="end" fontFamily={MONO} fontWeight={800} fontSize={size} letterSpacing={2} fill={c}>{t}</text>
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
export const Punch: React.FC<{ l1: string; l2: string; y?: number }> = ({ l1, l2, y = 1748 }) => (
  <g>
    <text x={540} y={y} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={46} fill="#f2f2f2">{l1}</text>
    <text x={540} y={y + 64} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={54} fill={GOLD}>{l2}</text>
  </g>
);
export const Smoke: React.FC<{ pts: V[]; w: number; c?: string; a?: number }> = ({ pts, w, c = "#d8d8dc", a = 0.5 }) => (
  <g>{pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={w * (0.5 + i / pts.length)} fill={c} opacity={a * (1 - i / pts.length)} />)}</g>
);

// ---------------------------------------------------------------- props
const Plane: React.FC<{ x: number; y: number; r?: number; s?: number; crumpled?: boolean; seed?: number }> = ({ x, y, r = 0, s = 1, crumpled, seed = 1 }) => crumpled
  ? <polygon points={Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2, k = 0.6 + rnd(seed * 11 + i) * 0.5; return `${x + Math.cos(a) * 30 * k * s},${y + Math.sin(a) * 22 * k * s}`; }).join(" ")} fill="#d8d8dc" stroke="#000" strokeWidth={2.5} />
  : (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d="M60 0 L-60 -26 L-40 0 Z" fill="#f2f2f4" stroke="#000" strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M60 0 L-60 18 L-40 0 Z" fill="#c8c8ce" stroke="#000" strokeWidth={2.5} strokeLinejoin="round" />
      <line x1={60} y1={0} x2={-40} y2={0} stroke="#000" strokeWidth={2} />
    </g>
  );
const Jet: React.FC<{ x: number; y: number; r: number; s?: number }> = ({ x, y, r, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <defs><linearGradient id="jetb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#9a9aa2" /></linearGradient></defs>
    <path d="M-40 -6 L-150 -96 L-104 -100 L30 -12 Z" fill="#c8c8ce" stroke="#000" strokeWidth={3} />
    <path d="M-170 -14 L-210 -70 L-186 -72 L-140 -14 Z" fill="#c8c8ce" stroke="#000" strokeWidth={3} />
    <path d="M230 0 Q200 -26 120 -28 L-190 -22 Q-214 -10 -190 14 L120 22 Q200 22 230 0 Z" fill="url(#jetb)" stroke="#000" strokeWidth={3.5} />
    <path d="M150 -20 Q190 -18 206 -6 L150 -6 Z" fill="#1a1a1e" />
    <path d="M-30 10 L-150 96 L-104 100 L40 16 Z" fill="#e8e8ec" stroke="#000" strokeWidth={3} />
    <rect x={-210} y={-12} width={22} height={22} rx={6} fill="#5a5a62" stroke="#000" strokeWidth={2} />
    <Glow at={[-216, 0]} r={60} color={GOLD} a={0.9} />
    <ellipse cx={-226} cy={0} rx={30} ry={11} fill="#fff3c4" />
  </g>
);

// ================================================================ 0a · HOOK, second 0: the crashes
const throwP: Pose = { ...POSES.throw(), lean: 6 };
const foldP: Pose = { ...POSES.stand(), head: 26, hN: [40, 30], hF: [30, 36], elbow: 1 };
const F0a: React.FC = () => {
  const g1 = L1[1] - 110, g2 = L2[1] - 110, fj = J(320, g1, foldP, false, S);
  return (
    <g>
      <Lane y0={L1[0]} y1={L1[1]} label="Waits for the perfect fold" id="a1" />
      <Hero x={320} y={g1} s={S} pose={foldP} look={GREY} />
      <Plane x={fj.wN[0] + 16} y={fj.wN[1] - 6} r={-8} s={0.7} />
      {[0, 1].map((i) => <path key={i} d={`M${fj.wN[0] - 30 + i * 70} ${fj.wN[1] - 50} q10 -16 22 0`} fill="none" stroke="#8a8a92" strokeWidth={3} />)}
      <Say x={560} y={L1[0] + 210} t="not yet…" />
      <Lane y0={L2[0]} y1={L2[1]} label="Throws anyway" bright id="a2" />
      <Hero x={220} y={g2} s={S} pose={throwP} look={HERO} />
      {/* the plane diving, smeared */}
      {[3, 2, 1].map((k) => <Plane key={k} x={560 - k * 22} y={g2 - 300 + k * 16} r={38} s={1.1} />).map((el, i) => <g key={i} opacity={0.12 + i * 0.1}>{el}</g>)}
      <Plane x={580} y={g2 - 316 + 30} r={38} s={1.1} />
      {[0, 1, 2].map((i) => <Plane key={i} x={760 + i * 90} y={g2 - 14} crumpled seed={i + 3} />)}
      <Count x={1030} y={L2[0] + 58} t="CRASHES: 3" c={RED} />
      <Punch l1="Perfect never takes off." l2="" />
    </g>
  );
};

// ================================================================ 0b · the 5th plane becomes a jet
const F0b: React.FC = () => {
  const g1 = L1[1] - 110, g2 = L2[1] - 110, fj = J(320, g1, foldP, false, S);
  const cheer: Pose = { ...POSES.armsUp(), head: -24 };
  const trail: V[] = Array.from({ length: 16 }, (_, i) => [300 + i * 38, g2 - 260 - i * i * 2.6] as V);
  return (
    <g>
      <Lane y0={L1[0]} y1={L1[1]} label="Waits for the perfect fold" id="b1" />
      <Hero x={320} y={g1} s={S} pose={{ ...foldP, head: -30 }} look={GREY} />
      <Plane x={fj.wN[0] + 16} y={fj.wN[1] - 6} r={-8} s={0.7} />
      <Lane y0={L2[0]} y1={L2[1]} label="Throws anyway" bright id="b2" />
      {[0, 1, 2, 3].map((i) => <Plane key={i} x={700 + i * 80} y={g2 - 14} crumpled seed={i + 3} />)}
      <Hero x={220} y={g2} s={S} pose={cheer} look={HERO} />
      <Count x={1030} y={L2[0] + 58} t="CRASHES: 4" c={RED} />
      {/* the contrail and the jet, breaking out across BOTH lanes */}
      <Glow at={[760, 640]} r={420} color={GOLD} a={0.35} />
      <path d={`M${trail.map((p) => p.join(" ")).join(" L")}`} fill="none" stroke={GOLD} strokeWidth={26} strokeLinecap="round" opacity={0.55} />
      <Smoke pts={trail.slice().reverse()} w={34} c="#f2e3b8" a={0.35} />
      {[0, 1, 2].map((i) => <line key={i} x1={560 - i * 30} y1={760 + i * 40} x2={420 - i * 30} y2={860 + i * 40} stroke="#d8d8dc" strokeWidth={4} strokeLinecap="round" opacity={0.6 - i * 0.15} />)}
      <Jet x={820} y={560} r={-34} s={1.15} />
      <Punch l1="Perfect never takes off." l2="Trying does." />
    </g>
  );
};

// ================================================================ 1 · the stone becomes a gold statue of him
const F1: React.FC = () => {
  const g1 = L1[1] - 110, g2 = L2[1] - 110;
  const sitP: Pose = { ...POSES.sit(70), lean: -6, head: 22, hN: [30, 70], hF: [20, 76] };
  const lookUp: Pose = { ...POSES.stand(), head: -34, hN: [50, 40], hF: [-30, 60], elbow: 1 };
  return (
    <g>
      <Lane y0={L1[0]} y1={L1[1]} label="Waits for inspiration" id="c1" />
      <defs><linearGradient id="blk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#6a6a72" /><stop offset="1" stopColor="#2a2a30" /></linearGradient></defs>
      <rect x={540} y={g1 - 430} width={360} height={430} rx={8} fill="url(#blk)" stroke="#000" strokeWidth={4} />
      <path d={`M640 ${g1 - 430} l20 70 l-30 60 l26 80 M820 ${g1 - 300} l-30 50 l20 70`} fill="none" stroke="#111" strokeWidth={4} />
      {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={545 + rnd(i + 5) * 350} cy={g1 - 430 + rnd(i + 50) * 60 + (i % 3) * 120 * rnd(i)} r={3 + rnd(i + 9) * 6} fill="#4a4f44" opacity={0.7} />)}
      <Hero x={470} y={g1} s={S} pose={sitP} look={GREY} />
      <Say x={330} y={L1[0] + 200} t="…someday" tail={1} />
      <Count x={1030} y={L1[0] + 58} t="DAY 365" c="#6a6a72" />
      <Lane y0={L2[0]} y1={L2[1]} label="Carves every day" bright id="c2" />
      {/* the statue: him, in gold, taller than the lane */}
      <Glow at={[640, g2 - 330]} r={340} color={GOLD} a={0.4} />
      <Rays f={0} at={[640, g2 - 420]} a={0.35} color={GOLD} n={14} len={600} />
      <rect x={490} y={g2 - 70} width={300} height={70} rx={6} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} />
      <Hero x={640} y={g2 - 70} s={1.0} pose={{ ...POSES.armsUp(), lean: 0, head: -10, fN: [40, 0], fF: [-40, 0] }} look={GOLDEN} shadow={0} />
      {Array.from({ length: 22 }, (_, i) => <polygon key={i} points={`${380 + rnd(i) * 560},${g2 - rnd(i + 3) * 12} ${392 + rnd(i) * 560},${g2 - 8 - rnd(i + 4) * 14} ${402 + rnd(i) * 560},${g2 - rnd(i + 6) * 10}`} fill="#7a7a82" stroke="#000" strokeWidth={1.5} />)}
      <Smoke pts={Array.from({ length: 8 }, (_, i) => [420 + i * 60, g2 - 20 - (i % 2) * 18] as V)} w={30} c="#bdbdc4" a={0.25} />
      <Hero x={300} y={g2} s={S} pose={lookUp} look={HERO} />
      <Count x={1030} y={L2[0] + 58} t="DAY 365" c={GOLD} />
      <Punch l1="You won't find yourself." l2="You'll carve yourself." />
    </g>
  );
};

// ================================================================ 2 · waves make noise, drops make canyons
const F2: React.FC = () => {
  const g1 = L1[1] - 110;
  const vp: V = [540, L2[0] + 250]; // vanishing point of the canyon
  return (
    <g>
      <Lane y0={L1[0]} y1={L1[1]} label="Once, hard" id="d1" hills={false} />
      <path d={`M600 ${g1} Q610 ${g1 - 170} 720 ${g1 - 190} Q840 ${g1 - 200} 880 ${g1 - 60} L900 ${g1} Z`} fill="url(#sh-grey)" stroke="#000" strokeWidth={4} />
      {/* the big wave, all noise: a curling crest crashing on the rock */}
      <path d={`M24 ${g1} L24 ${g1 - 120} Q140 ${g1 - 200} 260 ${g1 - 330} Q360 ${g1 - 440} 500 ${g1 - 430} Q610 ${g1 - 420} 640 ${g1 - 340} Q600 ${g1 - 380} 550 ${g1 - 360} Q500 ${g1 - 340} 520 ${g1 - 290} Q470 ${g1 - 250} 420 ${g1 - 120} Q440 ${g1 - 40} 600 ${g1} Z`} fill="#b8b8c0" stroke="#000" strokeWidth={3} />
      <path d={`M80 ${g1 - 140} Q200 ${g1 - 260} 300 ${g1 - 360} Q400 ${g1 - 430} 520 ${g1 - 410}`} fill="none" stroke="#fff" strokeWidth={10} opacity={0.7} strokeLinecap="round" />
      <path d={`M120 ${g1 - 60} Q260 ${g1 - 150} 360 ${g1 - 250}`} fill="none" stroke="#fff" strokeWidth={6} opacity={0.4} strokeLinecap="round" />
      {Array.from({ length: 36 }, (_, i) => <circle key={i} cx={560 + rnd(i) * 300} cy={g1 - 160 - rnd(i + 4) * 300} r={4 + rnd(i + 8) * 11} fill="#f2f2f2" opacity={0.8} />)}
      <Count x={1030} y={L1[0] + 58} t="SCRATCHES: 0" c="#8a8a92" />
      <Lane y0={L2[0]} y1={L2[1]} label="Every day, a drop" bright id="d2" stars={false} hills={false} />
      {/* the canyon: two cliff walls to a vanishing point, the river, the sun at the end */}
      <defs>
        <clipPath id="cny"><rect x={24} y={L2[0]} width={1032} height={L2[1] - L2[0]} rx={14} /></clipPath>
        <linearGradient id="cw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#4a4a52" /><stop offset="1" stopColor="#151518" /></linearGradient>
        <linearGradient id="cw2" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stopColor="#3a3a40" /><stop offset="1" stopColor="#101012" /></linearGradient>
      </defs>
      <g clipPath="url(#cny)">
        <Glow at={vp} r={380} color={GOLD} a={0.6} />
        <Rays f={0} at={vp} a={0.4} color={GOLD} n={16} len={700} />
        <circle cx={vp[0]} cy={vp[1] + 10} r={70} fill="#ffe7a8" />
        <path d={`M24 ${L2[0]} L${vp[0] - 40} ${vp[1] - 40} L${vp[0] - 30} ${vp[1] + 40} L24 ${L2[1]} Z`} fill="url(#cw)" stroke="#000" strokeWidth={3} />
        <path d={`M1056 ${L2[0]} L${vp[0] + 40} ${vp[1] - 40} L${vp[0] + 30} ${vp[1] + 40} L1056 ${L2[1]} Z`} fill="url(#cw2)" stroke="#000" strokeWidth={3} />
        {Array.from({ length: 9 }, (_, i) => { const k = (i + 1) / 10; return <g key={i}><line x1={24 + (vp[0] - 64) * k} y1={L2[0] + (vp[1] - L2[0] - 40) * k} x2={24 + (vp[0] - 54) * k} y2={L2[1] - (L2[1] - vp[1] - 40) * k} stroke="#000" strokeWidth={2} opacity={0.4} /><line x1={1056 - (1056 - vp[0] - 64) * k} y1={L2[0] + (vp[1] - L2[0] - 40) * k} x2={1056 - (1056 - vp[0] - 54) * k} y2={L2[1] - (L2[1] - vp[1] - 40) * k} stroke="#000" strokeWidth={2} opacity={0.4} /></g>; })}
        <path d={`M${vp[0] - 30} ${vp[1] + 40} L${vp[0] + 30} ${vp[1] + 40} L760 ${L2[1]} L320 ${L2[1]} Z`} fill="#1c1c22" />
        {Array.from({ length: 8 }, (_, i) => { const y = vp[1] + 60 + i * i * 6.5, w = 20 + i * 26; return <line key={i} x1={540 - w} y1={y} x2={540 + w} y2={y} stroke={GOLD} strokeWidth={4 + i} strokeLinecap="round" opacity={0.75 - i * 0.06} />; })}
        {/* the drop that did it, still falling */}
        <path d={`M540 ${L2[0] + 20} q-12 22 0 30 q12 -8 0 -30 Z`} fill="#f2f2f2" />
        <Hero x={190} y={L2[0] + 270} s={0.42} pose={{ ...POSES.stand(), head: 18 }} look={HERO} shadow={0} />
      </g>
      <rect x={24} y={L2[0]} width={1032} height={L2[1] - L2[0]} rx={14} fill="none" stroke="#2a2a30" strokeWidth={3} />
      <text x={56} y={L2[0] + 58} fontFamily={SANS} fontWeight={700} fontSize={40} fill="#f2f2f2">Every day, a drop</text>
      <Count x={1030} y={L2[0] + 58} t="DROPS: 10,000" c={GOLD} />
      <Punch l1="Waves make noise." l2="Drops make canyons." />
    </g>
  );
};

// ================================================================ 3 · the same sand: buried vs a pyramid
const Hourglass: React.FC<{ x: number; y: number; h: number; sandTop: number; stream?: boolean }> = ({ x, y, h, sandTop, stream }) => {
  const w = h * 0.62, m = y + h / 2;
  return (
    <g>
      <path d={`M${x - w / 2} ${y} H${x + w / 2} Q${x + w / 2} ${m - 40} ${x + 14} ${m} Q${x + w / 2} ${m + 40} ${x + w / 2} ${y + h} H${x - w / 2} Q${x - w / 2} ${m + 40} ${x - 14} ${m} Q${x - w / 2} ${m - 40} ${x - w / 2} ${y} Z`} fill="#fff" opacity={0.05} stroke="#d8d8dc" strokeWidth={5} />
      <path d={`M${x - w / 2 + 8} ${y + h - 6} L${x - w / 2 + 8} ${sandTop + 30} Q${x} ${sandTop - 30} ${x + w / 2 - 8} ${sandTop + 30} L${x + w / 2 - 8} ${y + h - 6} Z`} fill="#bdb6a4" opacity={0.85} />
      {stream && <line x1={x} y1={m} x2={x} y2={sandTop} stroke="#bdb6a4" strokeWidth={5} />}
      <rect x={x - w / 2 - 20} y={y - 18} width={w + 40} height={20} rx={6} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} />
      <rect x={x - w / 2 - 20} y={y + h - 2} width={w + 40} height={20} rx={6} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} />
    </g>
  );
};
const F3: React.FC = () => {
  const g1 = L1[1] - 110, g2 = L2[1] - 110;
  return (
    <g>
      <Lane y0={L1[0]} y1={L1[1]} label="Watches the time" id="e1" />
      <Hourglass x={560} y={L1[0] + 90} h={g1 - L1[0] - 100} sandTop={g1 - 150} stream />
      {/* buried to the neck, one hand still up */}
      <circle cx={560} cy={g1 - 178} r={24} fill="#9d9d9d" stroke="#000" strokeWidth={3} />
      {[0, 1].map((d) => <circle key={d} cx={566 + d * 10} cy={g1 - 182} r={3} fill="#1a1a1e" />)}
      <path d={`M610 ${g1 - 150} l18 -50`} stroke="#9d9d9d" strokeWidth={14} strokeLinecap="round" />
      <Count x={1030} y={L1[0] + 58} t="1,000 h" c={RED} />
      <Lane y0={L2[0]} y1={L2[1]} label="Uses the time" bright id="e2" />
      <Hourglass x={170} y={g2 - 260} h={260} sandTop={g2 - 40} />
      <defs><linearGradient id="pyr" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#e8d9a8" /><stop offset="0.5" stopColor="#bda46a" /><stop offset="0.5" stopColor="#7a6a44" /><stop offset="1" stopColor="#4a4030" /></linearGradient></defs>
      <Glow at={[640, g2 - 340]} r={340} color={GOLD} a={0.35} />
      <path d={`M360 ${g2} L640 ${g2 - 400} L920 ${g2} Z`} fill="url(#pyr)" stroke="#000" strokeWidth={4} />
      {Array.from({ length: 7 }, (_, i) => { const y = g2 - (i + 1) * 50, k = 1 - (i + 1) * 50 / 400; return <line key={i} x1={640 - 280 * k} y1={y} x2={640 + 280 * k} y2={y} stroke="#000" strokeWidth={2} opacity={0.35} />; })}
      <path d={`M640 ${g2 - 400} L920 ${g2}`} stroke={GOLD} strokeWidth={6} />
      <path d={`M300 ${g2 - 30} q60 -40 120 -10`} fill="none" stroke="#bdb6a4" strokeWidth={6} strokeDasharray="4 10" />
      <Hero x={640} y={g2 - 400} s={0.42} pose={{ ...POSES.armsUp(), head: -14 }} look={HERO} shadow={0} />
      <Count x={1030} y={L2[0] + 58} t="1,000 h" c={GOLD} />
      <Punch l1="Time will pass anyway." l2="Let it build something." />
    </g>
  );
};

// ================================================================ 4 · FINALE: one match lights a whole city
const F4: React.FC = () => {
  const G = 1500, lh: V = [880, 860];
  return (
    <g>
      <defs><linearGradient id="nsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#040406" /><stop offset="0.7" stopColor="#141418" /><stop offset="1" stopColor="#2a2418" /></linearGradient></defs>
      <rect x={0} y={0} width={1080} height={1920} fill="url(#nsky)" />
      {Array.from({ length: 90 }, (_, i) => <circle key={i} cx={rnd(i) * 1080} cy={rnd(i + 90) * 900 + 80} r={0.8 + rnd(i * 3) * 2} fill="#fff" opacity={0.3 + rnd(i * 7) * 0.6} />)}
      {/* the lighthouse beam sweeping the sky */}
      <path d={`M${lh[0]} ${lh[1]} L-200 380 L-200 620 Z`} fill={GOLD} opacity={0.22} />
      <Glow at={lh} r={140} color={GOLD} a={0.9} />
      <path d={`M${lh[0] - 40} ${G - 380} L${lh[0] - 26} ${lh[1] + 20} L${lh[0] + 26} ${lh[1] + 20} L${lh[0] + 40} ${G - 380} Z`} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} />
      {[0, 1, 2].map((i) => <rect key={i} x={lh[0] - 34 + i * 4} y={lh[1] + 80 + i * 110} width={68 - i * 8} height={22} fill="#1a1a1e" />)}
      <rect x={lh[0] - 36} y={lh[1] - 20} width={72} height={44} rx={6} fill="#ffe7a8" stroke="#000" strokeWidth={3} />
      <path d={`M${lh[0] - 44} ${lh[1] - 20} L${lh[0]} ${lh[1] - 64} L${lh[0] + 44} ${lh[1] - 20} Z`} fill="#3a3a40" stroke="#000" strokeWidth={3} />
      {/* the city: every window lit */}
      {Array.from({ length: 16 }, (_, i) => {
        const w = 60 + rnd(i + 3) * 50, h = 160 + rnd(i + 7) * 320, x = i * 68 - 20;
        return (
          <g key={i}>
            <rect x={x} y={G - 380 - h} width={w} height={h + 380} fill={i % 2 ? "#18181c" : "#202026"} stroke="#000" strokeWidth={2} />
            {Array.from({ length: Math.floor(h / 34) * 3 }, (_, k) => { const c = k % 3, r = Math.floor(k / 3); return rnd(i * 50 + k) < 0.75 && <rect key={k} x={x + 8 + c * (w - 16) / 3} y={G - 370 - h + 10 + r * 34} width={(w - 16) / 3 - 6} height={18} fill={GOLD} opacity={0.55 + rnd(k + i) * 0.4} />; })}
          </g>
        );
      })}
      <Glow at={[540, G - 420]} r={600} color={GOLD} a={0.25} />
      {/* foreground: the chain of light — candle, torch — and him with the match */}
      <rect x={0} y={G - 30} width={1080} height={460} fill="#08080a" />
      <line x1={0} y1={G - 30} x2={1080} y2={G - 30} stroke="#5a5a62" strokeWidth={3} />
      {[[300, 0], [330, 1], [350, 2]].map(([x, k], i) => <g key={i} transform={`rotate(${-70 + k * 25} ${x} ${G - 34})`}><line x1={x} y1={G - 34} x2={x + 46} y2={G - 34} stroke="#c8b48a" strokeWidth={5} /><circle cx={x + 48} cy={G - 34} r={6} fill="#2a2a2a" /></g>)}
      <rect x={420} y={G - 110} width={30} height={80} rx={4} fill="#e8e8ec" stroke="#000" strokeWidth={2} />
      <path d={`M435 ${G - 112} q-10 -20 0 -36 q10 16 0 36`} fill="#ffd27a" />
      <Glow at={[435, G - 130]} r={70} color={GOLD} a={0.7} />
      <line x1={560} y1={G - 30} x2={570} y2={G - 170} stroke="#7a6a44" strokeWidth={10} />
      <path d={`M570 ${G - 170} q-22 -30 0 -70 q22 40 0 70`} fill="#ffb84a" />
      <Glow at={[570, G - 200]} r={110} color={GOLD} a={0.7} />
      <Hero x={190} y={G - 30} s={0.6} pose={reach({ ...POSES.stand(), head: -20 }, 190, G - 30, [250, G - 200], undefined, false, 0.6)} look={HERO} />
      <path d={`M252 ${G - 206} q-8 -16 0 -30 q8 14 0 30`} fill="#ffe7a8" />
      <Glow at={[252, G - 220]} r={60} color={GOLD} a={0.9} />
      <text x={1040} y={180} textAnchor="end" fontFamily={MONO} fontWeight={800} fontSize={36} fill={RED}>MATCHES: 4</text>
      <Punch l1="Nobody is coming to light it for you." l2="Strike again." y={1680} />
    </g>
  );
};

const FRAMES = [F0a, F0b, F1, F2, F3, F4];
export const ProveFrames: React.FC = () => {
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
