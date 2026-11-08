// "PROVE IT TO YOURSELF" v4 style frames — real, believable scenes, the same five punchlines.
// 0 hook at second 0 (the kite crashes) · 1 the kite flies · 2 looking for himself vs carving himself · 3 a bucket vs a dripping tap
// · 4 sitting on the shore vs building a boat · 5 blackout: one match, a whole street of candles, one dark window.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { V } from "../../kit/core";
import { Hero, POSES, Pose, run } from "../../kit/hero";
import { KitDefs, Vignette } from "../../kit/materials";
import { Glow, Rays } from "../../kit/fx";
import { Defs, GOLD, SANS } from "../samehours/StyleFrames";
import { J } from "../beatyesterday/StyleFrames";
import { Count, GREY, HERO, L1, L2, Lane, MONO, Punch, RED, S, Say, Smoke, rnd } from "./Frames";

export const PROVE4_FRAMES = 6;
const g1 = L1[1] - 110, g2 = L2[1] - 110;

// ---------------------------------------------------------------- props
const Kite: React.FC<{ x: number; y: number; r?: number; s?: number; gold?: boolean; tail?: number }> = ({ x, y, r = 0, s = 1, gold, tail = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d={`M0 74 ${Array.from({ length: 6 }, (_, i) => `Q${Math.sin(i + tail) * 26} ${90 + i * 26} ${Math.sin(i * 1.3 + tail) * 10} ${100 + i * 30}`).join(" ")}`} fill="none" stroke="#d8d8dc" strokeWidth={3} />
    {Array.from({ length: 4 }, (_, i) => <path key={i} d={`M${Math.sin(i * 1.3 + tail) * 10 - 12} ${120 + i * 40} l12 -8 l12 8 l-12 8 Z`} fill={gold ? GOLD : "#bdbdc4"} stroke="#000" strokeWidth={1.5} />)}
    <path d="M0 -90 L56 -10 L0 74 L-56 -10 Z" fill={gold ? "url(#sh-gold)" : "#e8e8ec"} stroke="#000" strokeWidth={3.5} strokeLinejoin="round" />
    <path d="M0 -90 L0 74 M-56 -10 L56 -10" stroke="#000" strokeWidth={2.5} />
  </g>
);
const Sign: React.FC<{ x: number; g: number; dir: number; h?: number }> = ({ x, g, dir, h = 230 }) => (
  <g>
    <line x1={x} y1={g} x2={x} y2={g - h} stroke="#6a6a72" strokeWidth={8} />
    <g transform={`translate(${x} ${g - h + 30}) rotate(${dir})`}>
      <path d="M-80 -24 H70 L96 0 L70 24 H-80 Z" fill="#d8d8dc" stroke="#000" strokeWidth={3} />
      <text x={2} y={8} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={19} fill="#1a1a1a">FIND YOURSELF</text>
    </g>
  </g>
);
const Rock: React.FC<{ x: number; g: number; w: number; h: number; split?: boolean }> = ({ x, g, w, h, split }) => {
  const d = (dx: number) => `M${x - w / 2 + dx} ${g} Q${x - w / 2 + dx} ${g - h} ${x + dx * 0.3} ${g - h} Q${x + w / 2 + dx} ${g - h} ${x + w / 2 + dx} ${g} Z`;
  if (!split) return <path d={d(0)} fill="url(#sh-grey)" stroke="#000" strokeWidth={4} />;
  return (
    <g>
      <defs><clipPath id="rl"><rect x={0} y={0} width={x - 8} height={2000} /></clipPath><clipPath id="rr"><rect x={x + 8} y={0} width={2000} height={2000} /></clipPath></defs>
      <g clipPath="url(#rl)" transform="rotate(-6 0 0)" style={{ transformOrigin: `${x - w / 2}px ${g}px` }}><path d={d(-24)} fill="url(#sh-grey)" stroke="#000" strokeWidth={4} /></g>
      <g clipPath="url(#rr)" style={{ transformOrigin: `${x + w / 2}px ${g}px` }} transform="rotate(6 0 0)"><path d={d(24)} fill="url(#sh-grey)" stroke="#000" strokeWidth={4} /></g>
    </g>
  );
};
const Clock: React.FC<{ x: number; y: number; r?: number; spin?: number }> = ({ x, y, r = 44, spin = 0 }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill="#f2f2f2" stroke="#000" strokeWidth={4} />
    <line x1={x} y1={y} x2={x + Math.sin(spin) * r * 0.75} y2={y - Math.cos(spin) * r * 0.75} stroke="#111" strokeWidth={4} strokeLinecap="round" />
    <line x1={x} y1={y} x2={x + Math.sin(spin * 0.2) * r * 0.5} y2={y - Math.cos(spin * 0.2) * r * 0.5} stroke="#111" strokeWidth={6} strokeLinecap="round" />
    {[0, 1, 2].map((i) => <path key={i} d={`M${x + r + 8 + i * 8} ${y - 20} a26 26 0 0 1 0 40`} fill="none" stroke="#d8d8dc" strokeWidth={3} opacity={0.6 - i * 0.18} />)}
  </g>
);
const Sea: React.FC<{ y: number; y1: number; sun?: V }> = ({ y, y1, sun }) => (
  <g>
    <rect x={24} y={y} width={1032} height={y1 - y} fill="#0e0e12" />
    {Array.from({ length: 10 }, (_, i) => <line key={i} x1={60 + rnd(i) * 900} y1={y + 16 + i * 14} x2={140 + rnd(i) * 900} y2={y + 16 + i * 14} stroke="#5a5a62" strokeWidth={3} strokeLinecap="round" />)}
    {sun && Array.from({ length: 6 }, (_, i) => <line key={i} x1={sun[0] - 90 + i * 8} y1={y + 12 + i * 16} x2={sun[0] + 90 - i * 12} y2={y + 12 + i * 16} stroke={GOLD} strokeWidth={6} strokeLinecap="round" opacity={0.75 - i * 0.1} />)}
  </g>
);

// ================================================================ 0 · HOOK, second 0: the kite crashes
const testWind: Pose = { ...POSES.stand(), head: -20, hN: [16, -130], hF: [40, 40], elbow: 1 };
const F0: React.FC = () => {
  const tj = J(300, g1, testWind, false, S), rp: Pose = { ...run(0.3), lean: 16 }, rj = J(330, g2, rp, false, S);
  return (
    <g>
      <Lane y0={L1[0]} y1={L1[1]} label="Waits for the perfect wind" id="k1" />
      <Hero x={300} y={g1} s={S} pose={testWind} look={GREY} />
      <Kite x={tj.wF[0] + 40} y={tj.wF[1] - 30} r={-10} s={0.75} />
      <Say x={620} y={L1[0] + 200} t="not yet…" />
      <Lane y0={L2[0]} y1={L2[1]} label="Runs anyway" bright id="k2" />
      {[0, 1, 2].map((i) => <line key={i} x1={rj.hip[0] - 90 - i * 20} y1={g2 - 230 + i * 50} x2={rj.hip[0] - 180 - i * 20} y2={g2 - 230 + i * 50} stroke="#8a8a92" strokeWidth={4} strokeLinecap="round" opacity={0.7 - i * 0.2} />)}
      <Hero x={330} y={g2} s={S} pose={rp} look={HERO} />
      {/* the kite, nose in the dirt behind him */}
      <path d={`M${rj.wN[0]} ${rj.wN[1]} Q${520} ${g2 - 120} 690 ${g2 - 60}`} fill="none" stroke="#d8d8dc" strokeWidth={2} />
      <Kite x={720} y={g2 - 60} r={150} s={0.8} tail={2} />
      <Smoke pts={[[690, g2 - 6], [730, g2 - 10], [770, g2 - 4], [650, g2 - 8]]} w={22} c="#bdbdc4" a={0.35} />
      <Count x={1030} y={L2[0] + 58} t="CRASHES: 1" c={RED} />
      <Punch l1="Perfect never takes off." l2="" />
    </g>
  );
};

// ================================================================ 1 · the kite flies
const F1: React.FC = () => {
  const tj = J(300, g1, testWind, false, S);
  const hold: Pose = { ...POSES.stand(), lean: -10, head: -36, hN: [60, -120], hF: [40, -100], fN: [30, 0], fF: [-30, 0] };
  const hj = J(250, g2, hold, false, S), k: V = [860, L2[0] + 150];
  return (
    <g>
      <Lane y0={L1[0]} y1={L1[1]} label="Waits for the perfect wind" id="k3" />
      <Hero x={300} y={g1} s={S} pose={{ ...testWind, head: -40 }} look={GREY} />
      <Kite x={tj.wF[0] + 40} y={tj.wF[1] - 30} r={-10} s={0.75} />
      <Say x={620} y={L1[0] + 200} t="…tomorrow maybe" />
      <Lane y0={L2[0]} y1={L2[1]} label="Runs anyway" bright id="k4" />
      {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M${100 + i * 170} ${L2[0] + 260 + (i % 2) * 60} q60 -16 120 0`} fill="none" stroke="#5a5a62" strokeWidth={3} strokeLinecap="round" />)}
      {[[560, 0], [640, 1], [500, 2]].map(([x, i]) => <Kite key={i} x={x} y={g2 - 26} r={150 + i * 20} s={0.4} />).map((el, i) => <g key={i} opacity={0.3}>{el}</g>)}
      <Glow at={k} r={240} color={GOLD} a={0.45} />
      <line x1={hj.wN[0]} y1={hj.wN[1]} x2={k[0]} y2={k[1] + 70} stroke="#e8e8ec" strokeWidth={3} />
      <Kite x={k[0]} y={k[1]} r={18} s={1.05} gold tail={1} />
      <Hero x={250} y={g2} s={S} pose={hold} look={HERO} />
      <Count x={1030} y={L2[0] + 58} t="CRASHES: 3" c={RED} />
      <Punch l1="Perfect never takes off." l2="Trying does." />
    </g>
  );
};

// ================================================================ 2 · looking for himself vs carving himself
const F2: React.FC = () => {
  const walkP: Pose = { ...POSES.stand(), head: 24, hN: [56, 40], hF: [44, 46], elbow: 1, fN: [30, 0], fF: [-30, 0] };
  const wj = J(520, g1, walkP, false, S);
  const carve: Pose = { ...POSES.sit(150), lean: 22, head: 24, hN: [96, 20], hF: [80, 30], elbow: 1 };
  const bench: V = [560, g2 - 170];
  return (
    <g>
      <Lane y0={L1[0]} y1={L1[1]} label="Looks for himself" id="w1" />
      <ellipse cx={540} cy={g1 + 40} rx={360} ry={44} fill="none" stroke="#5a5a62" strokeWidth={4} strokeDasharray="14 14" />
      <Sign x={200} g={g1} dir={-12} />
      <Sign x={820} g={g1} dir={168} />
      <Sign x={700} g={g1} dir={-60} h={200} />
      <Hero x={520} y={g1} s={S} pose={walkP} look={GREY} behind={(j) => <rect x={j.sh[0] - 70} y={j.sh[1] - 4} width={50} height={90} rx={12} fill="#5a5a62" stroke="#000" strokeWidth={3} />} />
      <rect x={wj.wN[0] - 6} y={wj.wN[1] - 40} width={70} height={52} fill="#d8d8dc" stroke="#000" strokeWidth={2} transform={`rotate(-10 ${wj.wN[0]} ${wj.wN[1]})`} />
      <Say x={330} y={L1[0] + 180} t="where am I?" tail={1} />
      <Lane y0={L2[0]} y1={L2[1]} label="Works on himself" bright id="w2" hills={false} />
      {/* the workbench under a lamp */}
      <path d={`M${bench[0] + 40} ${L2[0] + 90} l-40 40 h80 Z`} fill="#3a3a40" stroke="#000" strokeWidth={2} />
      <defs><linearGradient id="lampc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff3d6" stopOpacity={0.4} /><stop offset="1" stopColor="#fff3d6" stopOpacity={0} /></linearGradient></defs>
      <path d={`M${bench[0] + 20} ${L2[0] + 130} h40 L${bench[0] + 240} ${bench[1]} H${bench[0] - 160} Z`} fill="url(#lampc)" />
      <rect x={bench[0] - 280} y={bench[1]} width={600} height={24} rx={4} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} />
      {[bench[0] - 260, bench[0] + 280].map((x) => <rect key={x} x={x} y={bench[1] + 24} width={20} height={146} fill="#3a3a40" stroke="#000" strokeWidth={2} />)}
      {Array.from({ length: 26 }, (_, i) => <path key={i} d={`M${bench[0] - 200 + rnd(i) * 520} ${g2 - rnd(i + 3) * 8} q8 -10 18 -2`} fill="none" stroke="#bdb6a4" strokeWidth={3} />)}
      {/* the carved figure: him, small, finished */}
      <Glow at={[bench[0] + 160, bench[1] - 70]} r={130} color={GOLD} a={0.5} />
      <rect x={bench[0] + 130} y={bench[1] - 14} width={60} height={14} fill="#a88a5a" stroke="#000" strokeWidth={2} />
      <Hero x={bench[0] + 160} y={bench[1] - 14} s={0.3} pose={{ ...POSES.armsUp(), head: -10 }} look={{ body: "#d9b77a", far: "#a88a5a", ink: "#2a1e08", glow: 0, width: 1.9, head: 1.2 }} shadow={0} />
      <rect x={bench[0] - 80} y={bench[1] - 30} width={70} height={30} rx={6} fill="#a88a5a" stroke="#000" strokeWidth={2} opacity={0.6} />
      <rect x={bench[0] - 190} y={g2 - 106} width={90} height={14} rx={4} fill="url(#sh-grey)" stroke="#000" strokeWidth={2} />
      <line x1={bench[0] - 180} y1={g2 - 92} x2={bench[0] - 188} y2={g2} stroke="#5a5a62" strokeWidth={6} /><line x1={bench[0] - 110} y1={g2 - 92} x2={bench[0] - 102} y2={g2} stroke="#5a5a62" strokeWidth={6} />
      <Hero x={bench[0] - 140} y={g2} s={S} pose={carve} look={HERO} />
      <rect x={bench[0] - 46} y={bench[1] - 10} width={46} height={8} rx={3} fill="#d8d8dc" stroke="#000" strokeWidth={1.5} />
      <Count x={1030} y={L2[0] + 58} t="DAY 100" c={GOLD} />
      <Punch l1="You won't find yourself." l2="You'll carve yourself." />
    </g>
  );
};

// ================================================================ 3 · a bucket of water vs a dripping tap
const F3: React.FC = () => {
  const throwB: Pose = { ...POSES.stand(), lean: 18, head: 0, hN: [130, -40], hF: [120, -20], fN: [50, 0], fF: [-40, 0] };
  const bj = J(260, g1, throwB, false, S);
  return (
    <g>
      <Lane y0={L1[0]} y1={L1[1]} label="Once, hard" id="b1" />
      <Rock x={760} g={g1} w={300} h={200} />
      <Hero x={260} y={g1} s={S} pose={throwB} look={GREY} />
      <path d={`M${bj.wN[0] - 10} ${bj.wN[1] - 30} l60 0 l-8 70 l-44 0 Z`} fill="#8a8a92" stroke="#000" strokeWidth={3} transform={`rotate(-70 ${bj.wN[0]} ${bj.wN[1]})`} />
      {/* the splash: loud, big, and the rock is dry underneath */}
      {Array.from({ length: 34 }, (_, i) => <circle key={i} cx={480 + rnd(i) * 420} cy={g1 - 120 - rnd(i + 3) * 300} r={4 + rnd(i + 7) * 12} fill="#e8e8ec" opacity={0.8} />)}
      <path d={`M${bj.wN[0] + 30} ${bj.wN[1] - 40} Q560 ${g1 - 420} 760 ${g1 - 220}`} fill="none" stroke="#e8e8ec" strokeWidth={30} strokeLinecap="round" opacity={0.6} />
      <text x={560} y={L1[0] + 170} fontFamily={SANS} fontWeight={900} fontSize={84} fill="#f2f2f2" stroke="#000" strokeWidth={6} paintOrder="stroke" transform={`rotate(-8 560 ${L1[0] + 170})`}>SPLASH!</text>
      <Count x={1030} y={L1[0] + 58} t="SCRATCHES: 0" c="#8a8a92" />
      <Lane y0={L2[0]} y1={L2[1]} label="Every day, a drop" bright id="b2" hills={false} />
      {/* the tap, a drop on its way, the same rock split in two */}
      <rect x={460} y={L2[0] + 100} width={180} height={34} rx={6} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} />
      <path d={`M600 ${L2[0] + 134} v40 q0 16 -16 16 h-12`} fill="none" stroke="#000" strokeWidth={30} />
      <path d={`M600 ${L2[0] + 134} v40 q0 16 -16 16 h-12`} fill="none" stroke="#9a9aa2" strokeWidth={22} />
      <path d={`M578 ${L2[0] + 250} q-12 22 0 30 q12 -8 0 -30 Z`} fill="#f2f2f2" />
      <Glow at={[578, g2 - 160]} r={200} color={GOLD} a={0.4} />
      <Rock x={578} g={g2} w={300} h={200} split />
      <path d={`M578 ${g2 - 200} l-10 60 l14 50 l-10 50 l8 40`} fill="none" stroke={GOLD} strokeWidth={5} />
      {[0, 1, 2].map((i) => <ellipse key={i} cx={578} cy={g2 - 4} rx={60 + i * 50} ry={8 + i * 4} fill="none" stroke="#8a8a92" strokeWidth={2} opacity={0.6 - i * 0.18} />)}
      <Hero x={280} y={g2} s={S} pose={{ ...POSES.kneel(), head: 10 }} look={HERO} />
      <Count x={1030} y={L2[0] + 58} t="DAY 1,000" c={GOLD} />
      <Punch l1="Waves make noise." l2="Drops make canyons." />
    </g>
  );
};

// ================================================================ 4 · sitting on the shore vs building a boat
const F4: React.FC = () => {
  const sitP: Pose = { ...POSES.sit(80), lean: -10, head: 6 };
  const sun: V = [860, L2[0] + 330];
  return (
    <g>
      <Lane y0={L1[0]} y1={L1[1]} label="Watches the time" id="s1" hills={false} />
      <Sea y={g1 - 150} y1={g1} />
      <path d={`M24 ${g1} L24 ${g1 - 40} Q300 ${g1 - 60} 600 ${g1 - 20} L1056 ${g1} Z`} fill="#3a3a40" />
      {[0.15, 0.35, 0.55, 0.75].map((k, i) => <circle key={i} cx={100 + k * 900} cy={L1[0] + 260 - Math.sin(k * Math.PI) * 120} r={22} fill="#f2f2f2" opacity={0.15 + i * 0.1} />)}
      <Clock x={540} y={L1[0] + 120} spin={9} />
      <rect x={350} y={g1 - 110} width={140} height={14} fill="#5a5a62" stroke="#000" strokeWidth={2} />
      <line x1={370} y1={g1 - 96} x2={360} y2={g1} stroke="#5a5a62" strokeWidth={6} /><line x1={470} y1={g1 - 96} x2={480} y2={g1} stroke="#5a5a62" strokeWidth={6} />
      <Hero x={420} y={g1 - 30} s={S} pose={sitP} look={GREY} />
      {[0, 1, 2].map((i) => <path key={i} d={`M${360 + i * 6} ${g1 - 230 + i * 10} L${440 - i * 4} ${g1 - 110 + i * 6}`} stroke="#cfcfd4" strokeWidth={1.5} opacity={0.6} />)}
      <Count x={1030} y={L1[0] + 58} t="DAY 200" c="#8a8a92" />
      <Lane y0={L2[0]} y1={L2[1]} label="Uses the time" bright id="s2" hills={false} />
      <Glow at={sun} r={380} color={GOLD} a={0.55} />
      <Rays f={0} at={sun} a={0.4} color={GOLD} n={14} len={600} />
      <circle cx={sun[0]} cy={sun[1]} r={80} fill="#ffe2a0" />
      <Sea y={g2 - 160} y1={g2 + 110} sun={sun} />
      {/* his boat, sailing toward the sun */}
      <path d={`M380 ${g2 - 150} Q520 ${g2 - 80} 660 ${g2 - 150} L630 ${g2 - 100} Q520 ${g2 - 70} 410 ${g2 - 100} Z`} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} />
      <line x1={520} y1={g2 - 140} x2={520} y2={g2 - 440} stroke="#d8d8dc" strokeWidth={6} />
      <path d={`M526 ${g2 - 430} Q630 ${g2 - 300} 610 ${g2 - 160} L526 ${g2 - 160} Z`} fill="#f2f2f2" stroke="#000" strokeWidth={3} />
      <path d={`M514 ${g2 - 400} Q450 ${g2 - 280} 450 ${g2 - 170} L514 ${g2 - 170} Z`} fill="#d8d8dc" stroke="#000" strokeWidth={3} />
      <Hero x={600} y={g2 - 140} s={0.42} pose={{ ...POSES.wave(5), head: -10 }} look={HERO} shadow={0} />
      {[0, 1, 2].map((i) => <path key={i} d={`M${380 - i * 40} ${g2 - 130 + i * 6} q-30 6 -60 0`} fill="none" stroke="#bdbdc4" strokeWidth={3} opacity={0.6 - i * 0.18} />)}
      <Count x={1030} y={L2[0] + 58} t="DAY 200" c={GOLD} />
      <Punch l1="Time will pass anyway." l2="Let it build something." />
    </g>
  );
};

// ================================================================ 5 · FINALE: blackout — one match, a street of candles, one dark window
const F5: React.FC = () => {
  const cols = 4, rows = 5, bx = 70, by = 330, ww = 150, wh = 150, gx = 90, gy = 70;
  const dark = [1, 1]; // row, col of the one still waiting
  const me = [3, 2];
  return (
    <g>
      <defs><linearGradient id="bsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#050507" /><stop offset="1" stopColor="#141418" /></linearGradient></defs>
      <rect x={0} y={0} width={1080} height={1920} fill="url(#bsky)" />
      {Array.from({ length: 70 }, (_, i) => <circle key={i} cx={rnd(i) * 1080} cy={rnd(i + 70) * 220 + 40} r={0.8 + rnd(i * 3) * 1.8} fill="#fff" opacity={0.3 + rnd(i * 7) * 0.5} />)}
      <rect x={40} y={by - 60} width={1000} height={1250} fill="#18181c" stroke="#2a2a30" strokeWidth={4} />
      <rect x={30} y={by - 84} width={1020} height={28} fill="#26262c" />
      {Array.from({ length: rows * cols }, (_, i) => {
        const r = Math.floor(i / cols), c = i % cols, x = bx + c * (ww + gx) + 30, y = by + r * (wh + gy);
        const isDark = r === dark[0] && c === dark[1], isMe = r === me[0] && c === me[1];
        return (
          <g key={i}>
            {!isDark && <Glow at={[x + ww / 2, y + wh / 2]} r={isMe ? 160 : 110} color={GOLD} a={isMe ? 0.6 : 0.35} />}
            <rect x={x} y={y} width={ww} height={wh} fill={isDark ? "#0a0a0c" : "#3a2e18"} stroke="#000" strokeWidth={4} />
            {!isDark && <>
              <rect x={x + ww / 2 - 8} y={y + wh - 50} width={16} height={36} fill="#e8e8ec" />
              <path d={`M${x + ww / 2} ${y + wh - 52} q-8 -14 0 -26 q8 12 0 26`} fill="#ffd27a" />
              <circle cx={x + ww / 2 + (isMe ? -40 : 30)} cy={y + wh - 70} r={isMe ? 16 : 13} fill={isMe ? "#f2f2f2" : "#8a8a92"} />
              <rect x={x + ww / 2 + (isMe ? -50 : 20)} y={y + wh - 54} width={isMe ? 20 : 18} height={40} rx={8} fill={isMe ? "#f2f2f2" : "#8a8a92"} />
            </>}
            {isDark && <>
              <circle cx={x + 60} cy={y + 90} r={13} fill="#4a4a52" />
              <rect x={x + 50} y={y + 104} width={20} height={36} rx={8} fill="#4a4a52" />
              <rect x={x + 110} y={y + 70} width={14} height={22} rx={3} fill="#5a5a62" />
              <text x={x + 128} y={y + 62} fontFamily={MONO} fontWeight={700} fontSize={16} fill="#8a8a92">click</text>
              <Say x={x + ww / 2 + 40} y={y - 40} t="still waiting…" />
            </>}
          </g>
        );
      })}
      {/* the street, the broken matches he started with */}
      <rect x={0} y={1560} width={1080} height={360} fill="#0a0a0c" />
      <line x1={0} y1={1560} x2={1080} y2={1560} stroke="#5a5a62" strokeWidth={3} />
      {[0, 1, 2].map((i) => <g key={i} transform={`rotate(${-20 + i * 22} ${520 + i * 34} 1585)`}><line x1={500 + i * 34} y1={1585} x2={548 + i * 34} y2={1585} stroke="#c8b48a" strokeWidth={5} /><circle cx={550 + i * 34} cy={1585} r={6} fill={RED} /></g>)}
      <text x={1040} y={210} textAnchor="end" fontFamily={MONO} fontWeight={800} fontSize={36} fill={RED}>MATCHES: 4</text>
      <Punch l1="Nobody is coming to light it for you." l2="Strike again." y={1700} />
    </g>
  );
};

const FRAMES = [F0, F1, F2, F3, F4, F5];
export const ProveV4Frames: React.FC = () => {
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
