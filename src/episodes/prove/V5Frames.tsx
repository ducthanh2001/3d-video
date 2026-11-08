// "PROVE IT TO YOURSELF" v5 — the competitor's grammar applied to every frame: a BIG figure, whole body in an effort pose, hands
// ON a big object, the counter right next to the action; the payoff is shown WHILE he acts (never standing next to a result).
// 0 hook: running, the kite crashes · 1 leaning back on the string, the kite flies · 2 flashlight search vs hammer + chisel on
// a block that is becoming him · 3 a thrown bucket vs refilling the drip bucket over the rock · 4 a beach chair vs pushing his
// boat into the sea · 5 finale: snow, kneeling, the 4th match lights the bonfire; one figure still waits by the road.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { V } from "../../kit/core";
import { Hero, HeroLook, POSES, Pose, run } from "../../kit/hero";
import { KitDefs, Vignette } from "../../kit/materials";
import { Glow, Rays } from "../../kit/fx";
import { Defs, GOLD, SANS } from "../samehours/StyleFrames";
import { J, reach } from "../beatyesterday/StyleFrames";
import { Count, GREY, HERO, L1, L2, Lane, MONO, Punch, RED, Say, Smoke, rnd } from "./Frames";

export const PROVE5_FRAMES = 6;
const g1 = L1[1] - 110, g2 = L2[1] - 110, B = 0.84; // big figures
const STONE: HeroLook = { body: "#b4b4ba", far: "#8a8a92", ink: "#2a2a30", glow: 0, width: 1.9, head: 1.2 };
const Effort: React.FC<{ at: V; n?: number }> = ({ at, n = 3 }) => <g>{Array.from({ length: n }, (_, i) => <path key={i} d={`M${at[0] + 20 + i * 12} ${at[1] - 30 + i * 14} q-6 10 0 18`} stroke="#bdbdc4" strokeWidth={3} fill="none" />)}</g>;
const Speed: React.FC<{ x: number; y: number; n?: number; len?: number }> = ({ x, y, n = 3, len = 110 }) => <g>{Array.from({ length: n }, (_, i) => <line key={i} x1={x - i * 18} y1={y + i * 46} x2={x - len - i * 18} y2={y + i * 46} stroke="#8a8a92" strokeWidth={4} strokeLinecap="round" opacity={0.7 - i * 0.18} />)}</g>;

// ---------------------------------------------------------------- props
const Kite: React.FC<{ x: number; y: number; r?: number; s?: number; gold?: boolean; tail?: number }> = ({ x, y, r = 0, s = 1, gold, tail = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d={`M0 74 ${Array.from({ length: 6 }, (_, i) => `Q${Math.sin(i + tail) * 26} ${90 + i * 26} ${Math.sin(i * 1.3 + tail) * 10} ${100 + i * 30}`).join(" ")}`} fill="none" stroke="#d8d8dc" strokeWidth={3} />
    {Array.from({ length: 4 }, (_, i) => <path key={i} d={`M${Math.sin(i * 1.3 + tail) * 10 - 12} ${120 + i * 40} l12 -8 l12 8 l-12 8 Z`} fill={gold ? GOLD : "#bdbdc4"} stroke="#000" strokeWidth={1.5} />)}
    <path d="M0 -90 L56 -10 L0 74 L-56 -10 Z" fill={gold ? "url(#sh-gold)" : "#e8e8ec"} stroke="#000" strokeWidth={3.5} strokeLinejoin="round" />
    <path d="M0 -90 L0 74 M-56 -10 L56 -10" stroke="#000" strokeWidth={2.5} />
  </g>
);
const Sign: React.FC<{ x: number; g: number; dir: number; h?: number }> = ({ x, g, dir, h = 240 }) => (
  <g>
    <line x1={x} y1={g} x2={x} y2={g - h} stroke="#6a6a72" strokeWidth={8} />
    <g transform={`translate(${x} ${g - h + 30}) rotate(${dir})`}>
      <path d="M-80 -24 H70 L96 0 L70 24 H-80 Z" fill="#d8d8dc" stroke="#000" strokeWidth={3} />
      <text x={2} y={8} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={19} fill="#1a1a1a">FIND YOURSELF</text>
    </g>
  </g>
);
const Bucket: React.FC<{ x: number; y: number; r?: number; s?: number }> = ({ x, y, r = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d="M-40 -40 L40 -40 L30 40 L-30 40 Z" fill="url(#sh-grey)" stroke="#000" strokeWidth={3} />
    <path d="M-40 -40 Q0 -90 40 -40" fill="none" stroke="#000" strokeWidth={4} />
    <ellipse cx={0} cy={-40} rx={40} ry={10} fill="#2a2a30" stroke="#000" strokeWidth={2} />
  </g>
);
const Rock: React.FC<{ x: number; g: number; w: number; h: number }> = ({ x, g, w, h }) => (
  <path d={`M${x - w / 2} ${g} Q${x - w / 2} ${g - h} ${x} ${g - h} Q${x + w / 2} ${g - h} ${x + w / 2} ${g} Z`} fill="url(#sh-grey)" stroke="#000" strokeWidth={4} />
);

// ================================================================ 0 · HOOK: running, the kite crashes
const holdKite: Pose = { ...POSES.stand(), head: -26, hN: [30, -150], hF: [-10, -150], elbow: -1 };
const F0: React.FC = () => {
  const kj = J(300, g1, holdKite, false, B), rp: Pose = { ...run(0.3), lean: 22, head: -6 }, rj = J(330, g2, rp, false, B);
  return (
    <g>
      <Lane y0={L1[0]} y1={L1[1]} label="Waits for the perfect wind" id="k1" />
      <Hero x={300} y={g1} s={B} pose={holdKite} look={GREY} />
      <Kite x={(kj.wN[0] + kj.wF[0]) / 2} y={Math.min(kj.wN[1], kj.wF[1]) - 60} s={0.9} />
      <Say x={680} y={L1[0] + 210} t="not yet…" />
      <Lane y0={L2[0]} y1={L2[1]} label="Runs anyway" bright id="k2" />
      <Speed x={rj.hip[0] - 110} y={g2 - 300} />
      <Hero x={330} y={g2} s={B} pose={rp} look={HERO} />
      <path d={`M${rj.wN[0]} ${rj.wN[1]} Q560 ${g2 - 140} 720 ${g2 - 70}`} fill="none" stroke="#d8d8dc" strokeWidth={2.5} />
      <Kite x={760} y={g2 - 70} r={150} s={1} tail={2} />
      <Smoke pts={[[720, g2 - 6], [770, g2 - 12], [820, g2 - 4], [680, g2 - 8]]} w={26} c="#bdbdc4" a={0.35} />
      <Count x={1030} y={L2[0] + 58} t="CRASHES: 1" c={RED} size={40} />
      <Punch l1="Perfect never takes off." l2="" />
    </g>
  );
};

// ================================================================ 1 · leaning back on the string, the kite flies
const F1: React.FC = () => {
  const kj = J(300, g1, holdKite, false, B);
  const pull: Pose = { hip: [10, -170], lean: -22, head: -34, hN: [110, -90], hF: [90, -70], fN: [70, 0], fF: [-40, 0], elbow: 1 };
  const pj = J(260, g2, pull, false, B), k: V = [860, L2[0] + 170];
  return (
    <g>
      <Lane y0={L1[0]} y1={L1[1]} label="Waits for the perfect wind" id="k3" />
      <Hero x={300} y={g1} s={B} pose={{ ...holdKite, head: -40 }} look={GREY} />
      <Kite x={(kj.wN[0] + kj.wF[0]) / 2} y={Math.min(kj.wN[1], kj.wF[1]) - 60} s={0.9} />
      <Say x={680} y={L1[0] + 210} t="…tomorrow maybe" />
      <Lane y0={L2[0]} y1={L2[1]} label="Runs anyway" bright id="k4" />
      {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M${120 + i * 170} ${L2[0] + 300 + (i % 2) * 60} q60 -16 120 0`} fill="none" stroke="#5a5a62" strokeWidth={3} strokeLinecap="round" />)}
      {[[560, 0], [650, 1]].map(([x, i]) => <g key={i} opacity={0.3}><Kite x={x} y={g2 - 26} r={150 + i * 25} s={0.45} /></g>)}
      <Glow at={k} r={260} color={GOLD} a={0.45} />
      <line x1={pj.wN[0]} y1={pj.wN[1]} x2={k[0]} y2={k[1] + 70} stroke="#e8e8ec" strokeWidth={3} />
      <Kite x={k[0]} y={k[1]} r={18} s={1.15} gold tail={1} />
      <Hero x={260} y={g2} s={B} pose={pull} look={HERO} />
      <Effort at={pj.head} />
      <Count x={1030} y={L2[0] + 58} t="CRASHES: 3" c={RED} size={40} />
      <Punch l1="Perfect never takes off." l2="Trying does." />
    </g>
  );
};

// ================================================================ 2 · flashlight search vs hammer + chisel (the block becoming him)
const F2: React.FC = () => {
  const search: Pose = { ...POSES.stand(), lean: 8, head: 4, hN: [110, -10], hF: [40, 60], elbow: 1, fN: [40, 0], fF: [-36, 0] };
  const sj = J(380, g1, search, false, B);
  const bh = 470;
  const chisel: V = [585, g2 - 250];
  const strike = reach({ ...POSES.stand(), lean: 14, head: 10, fN: [50, 0], fF: [-50, 0] }, 330, g2, [chisel[0] - 50, chisel[1] + 6], [chisel[0] - 70, chisel[1] - 150], false, B);
  const tj = J(330, g2, strike, false, B);
  return (
    <g>
      <Lane y0={L1[0]} y1={L1[1]} label="Looks for himself" id="w1" />
      <Sign x={760} g={g1} dir={-14} />
      <Sign x={920} g={g1} dir={170} h={200} />
      <path d={`M${sj.wN[0] + 20} ${sj.wN[1] - 4} L${sj.wN[0] + 320} ${sj.wN[1] - 90} L${sj.wN[0] + 320} ${sj.wN[1] + 80} Z`} fill="#fff3d6" opacity={0.2} />
      <rect x={sj.wN[0] - 6} y={sj.wN[1] - 12} width={34} height={18} rx={4} fill="#5a5a62" stroke="#000" strokeWidth={2} />
      <Hero x={380} y={g1} s={B} pose={search} look={GREY} behind={(j) => <rect x={j.sh[0] - 72} y={j.sh[1] - 4} width={52} height={92} rx={12} fill="#5a5a62" stroke="#000" strokeWidth={3} />} />
      <Say x={200} y={L1[0] + 170} t="where am I?" tail={1} />
      <Lane y0={L2[0]} y1={L2[1]} label="Works on himself" bright id="w2" />
      {/* the block: the rough stone still on the right, HIM already standing out of it on the left */}
      <Glow at={[640, g2 - 260]} r={280} color={GOLD} a={0.3} />
      <rect x={700} y={g2 - bh} width={260} height={bh} rx={6} fill="url(#sh-grey)" stroke="#000" strokeWidth={4} />
      <path d={`M700 ${g2 - bh} l-20 70 l26 80 l-30 100 l22 90 l-18 ${bh - 340}`} fill="#4a4a52" stroke="#000" strokeWidth={4} />
      <rect x={540} y={g2 - 40} width={200} height={40} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} />
      <Hero x={630} y={g2 - 40} s={1.05} pose={{ ...POSES.stand(), head: -12, hN: [30, -150], hF: [-14, 130], fN: [24, 0], fF: [-24, 0] }} look={STONE} shadow={0} />
      {Array.from({ length: 14 }, (_, i) => <polygon key={i} points={`${chisel[0] + 10 + rnd(i) * 120},${chisel[1] - 60 + rnd(i + 3) * 120} ${chisel[0] + 22 + rnd(i) * 120},${chisel[1] - 70 + rnd(i + 3) * 120} ${chisel[0] + 18 + rnd(i) * 120},${chisel[1] - 52 + rnd(i + 3) * 120}`} fill="#bdbdc4" stroke="#000" strokeWidth={1} />)}
      {Array.from({ length: 30 }, (_, i) => <polygon key={i} points={`${360 + rnd(i + 9) * 560},${g2 - rnd(i) * 8} ${372 + rnd(i + 9) * 560},${g2 - 10 - rnd(i + 2) * 10} ${384 + rnd(i + 9) * 560},${g2 - rnd(i + 5) * 6}`} fill="#7a7a82" stroke="#000" strokeWidth={1.2} />)}
      {/* hammer coming down on the chisel, smeared */}
      <line x1={tj.wN[0]} y1={tj.wN[1]} x2={chisel[0]} y2={chisel[1]} stroke="#d8d8dc" strokeWidth={8} strokeLinecap="round" />
      {[3, 2, 1].map((k) => <g key={k} opacity={0.12 * (4 - k)} transform={`rotate(${-k * 9} ${tj.wF[0]} ${tj.wF[1] + 60})`}><rect x={tj.wF[0] - 26} y={tj.wF[1] - 30} width={52} height={30} rx={4} fill="#d8d8dc" /></g>)}
      <rect x={tj.wF[0] - 26} y={tj.wF[1] - 30} width={52} height={30} rx={4} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} />
      <line x1={tj.wF[0]} y1={tj.wF[1]} x2={tj.wF[0] - 4} y2={tj.wF[1] + 70} stroke="#7a6a4a" strokeWidth={8} />
      <Hero x={330} y={g2} s={B} pose={strike} look={HERO} />
      <Effort at={tj.head} />
      <Count x={1030} y={L2[0] + 58} t="DAY 100" c={GOLD} size={40} />
      <Punch l1="You won't find yourself." l2="You'll carve yourself." />
    </g>
  );
};

// ================================================================ 3 · a thrown bucket vs refilling the drip over the rock
const F3: React.FC = () => {
  const throwB: Pose = { ...POSES.stand(), lean: 22, head: 0, hN: [140, -50], hF: [130, -30], fN: [60, 0], fF: [-50, 0] };
  const bj = J(240, g1, throwB, false, B);
  const top: V = [600, L2[0] + 200]; // the drip bucket hanging from a tripod
  const pour = reach({ ...POSES.stand(), lean: 6, head: -24, fN: [20, 0], fF: [-20, 0] }, 410, g2 - 150, [top[0] - 60, top[1] - 50], [top[0] - 90, top[1] - 20], false, B);
  const pj = J(410, g2 - 150, pour, false, B);
  return (
    <g>
      <Lane y0={L1[0]} y1={L1[1]} label="Once, hard" id="b1" />
      <Rock x={780} g={g1} w={300} h={220} />
      <Hero x={240} y={g1} s={B} pose={throwB} look={GREY} />
      <Bucket x={bj.wN[0] + 10} y={bj.wN[1] - 10} r={-110} s={0.9} />
      <path d={`M${bj.wN[0] + 40} ${bj.wN[1] - 40} Q620 ${g1 - 460} 780 ${g1 - 230}`} fill="none" stroke="#e8e8ec" strokeWidth={34} strokeLinecap="round" opacity={0.55} />
      {Array.from({ length: 36 }, (_, i) => <circle key={i} cx={560 + rnd(i) * 440} cy={g1 - 140 - rnd(i + 3) * 320} r={4 + rnd(i + 7) * 12} fill="#e8e8ec" opacity={0.8} />)}
      <text x={600} y={L1[0] + 160} fontFamily={SANS} fontWeight={900} fontSize={86} fill="#f2f2f2" stroke="#000" strokeWidth={6} paintOrder="stroke" transform={`rotate(-8 600 ${L1[0] + 160})`}>SPLASH!</text>
      <Count x={1030} y={L1[0] + 58} t="SCRATCHES: 0" c="#8a8a92" size={40} />
      <Lane y0={L2[0]} y1={L2[1]} label="Every day, a drop" bright id="b2" />
      {/* tripod + drip bucket + the rock with a hole worn through */}
      <path d={`M${top[0] - 200} ${g2} L${top[0]} ${top[1] - 60} L${top[0] + 200} ${g2} M${top[0]} ${top[1] - 60} L${top[0] + 40} ${g2}`} stroke="#6a6a72" strokeWidth={10} fill="none" />
      <line x1={top[0]} y1={top[1] - 60} x2={top[0]} y2={top[1] - 30} stroke="#d8d8dc" strokeWidth={3} />
      <Bucket x={top[0]} y={top[1] + 10} s={0.8} />
      {[0, 1, 2].map((i) => <path key={i} d={`M${top[0]} ${top[1] + 60 + i * 70} q-9 16 0 22 q9 -6 0 -22 Z`} fill="#f2f2f2" opacity={1 - i * 0.25} />)}
      <Glow at={[top[0], g2 - 120]} r={200} color={GOLD} a={0.4} />
      <Rock x={top[0]} g={g2} w={340} h={200} />
      <ellipse cx={top[0]} cy={g2 - 160} rx={38} ry={14} fill="#0b0b0d" />
      <path d={`M${top[0]} ${g2 - 150} l-8 40 l12 40 l-10 40 l6 30`} fill="none" stroke={GOLD} strokeWidth={5} />
      {/* he climbs his step-stool every morning to refill it */}
      <rect x={350} y={g2 - 150} width={120} height={16} fill="url(#sh-grey)" stroke="#000" strokeWidth={2} />
      <line x1={360} y1={g2 - 134} x2={350} y2={g2} stroke="#5a5a62" strokeWidth={8} /><line x1={460} y1={g2 - 134} x2={470} y2={g2} stroke="#5a5a62" strokeWidth={8} />
      <Hero x={410} y={g2 - 150} s={B} pose={pour} look={HERO} shadow={0} />
      <path d={`M${pj.wN[0] - 10} ${pj.wN[1] - 24} h44 l-6 44 h-32 Z`} fill="#9a9aa2" stroke="#000" strokeWidth={2} transform={`rotate(40 ${pj.wN[0]} ${pj.wN[1]})`} />
      <path d={`M${pj.wN[0] + 40} ${pj.wN[1] - 10} q30 10 ${top[0] - pj.wN[0] - 60} 40`} fill="none" stroke="#e8e8ec" strokeWidth={6} strokeLinecap="round" />
      <Count x={1030} y={L2[0] + 58} t="DAY 1,000" c={GOLD} size={40} />
      <Punch l1="Waves make noise." l2="Drops make canyons." />
    </g>
  );
};

// ================================================================ 4 · a beach chair vs pushing his boat into the sea
const Sea: React.FC<{ y: number; y1: number; sun?: V }> = ({ y, y1, sun }) => (
  <g>
    <rect x={24} y={y} width={1032} height={y1 - y} fill="#0e0e12" />
    {Array.from({ length: 10 }, (_, i) => <line key={i} x1={60 + rnd(i) * 900} y1={y + 16 + i * 12} x2={140 + rnd(i) * 900} y2={y + 16 + i * 12} stroke="#5a5a62" strokeWidth={3} strokeLinecap="round" />)}
    {sun && Array.from({ length: 6 }, (_, i) => <line key={i} x1={sun[0] - 90 + i * 8} y1={y + 12 + i * 14} x2={sun[0] + 90 - i * 12} y2={y + 12 + i * 14} stroke={GOLD} strokeWidth={6} strokeLinecap="round" opacity={0.75 - i * 0.1} />)}
  </g>
);
const F4: React.FC = () => {
  const lounge: Pose = { ...POSES.sit(80), lean: -22, head: 8, hN: [-24, -70], hF: [-34, -60], elbow: -1 };
  const sun: V = [880, L2[0] + 300], bx = 640;
  const push = reach({ ...POSES.push(), lean: 38, head: -4, fF: [-130, 0] }, 300, g2, [bx - 230, g2 - 150], [bx - 236, g2 - 120], false, B);
  const pj = J(300, g2, push, false, B);
  return (
    <g>
      <Lane y0={L1[0]} y1={L1[1]} label="Watches the time" id="s1" hills={false} />
      <Sea y={g1 - 160} y1={g1} />
      <path d={`M24 ${g1} L24 ${g1 - 40} Q300 ${g1 - 60} 640 ${g1 - 20} L1056 ${g1} Z`} fill="#3a3a40" />
      {[0.15, 0.35, 0.55, 0.75].map((k, i) => <circle key={i} cx={100 + k * 900} cy={L1[0] + 250 - Math.sin(k * Math.PI) * 110} r={20} fill="#f2f2f2" opacity={0.12 + i * 0.1} />)}
      <path d={`M320 ${g1} L340 ${g1 - 70} L470 ${g1 - 70} L490 ${g1} M330 ${g1 - 70} L300 ${g1 - 230}`} fill="none" stroke="#6a6a72" strokeWidth={8} strokeLinecap="round" />
      <Hero x={380} y={g1} s={B} pose={lounge} look={GREY} shadow={0} />
      <path d={`M330 ${g1 - 40} L420 ${g1 - 150}`} stroke="#cfcfd4" strokeWidth={1.5} opacity={0.6} />
      <Count x={1030} y={L1[0] + 58} t="DAY 200" c="#8a8a92" size={40} />
      <Lane y0={L2[0]} y1={L2[1]} label="Uses the time" bright id="s2" hills={false} />
      <Glow at={sun} r={380} color={GOLD} a={0.55} />
      <Rays f={0} at={sun} a={0.4} color={GOLD} n={14} len={600} />
      <circle cx={sun[0]} cy={sun[1]} r={80} fill="#ffe2a0" />
      <Sea y={g2 - 170} y1={g2 - 20} sun={sun} />
      <rect x={24} y={g2 - 30} width={1032} height={30} fill="#3a3a40" />
      {/* his boat, sail up, half in the water — and him pushing it off */}
      <path d={`M${bx - 230} ${g2 - 170} Q${bx} ${g2 - 60} ${bx + 230} ${g2 - 170} L${bx + 190} ${g2 - 90} Q${bx} ${g2 - 40} ${bx - 200} ${g2 - 90} Z`} fill="url(#sh-grey)" stroke="#000" strokeWidth={4} />
      {Array.from({ length: 3 }, (_, i) => <path key={i} d={`M${bx - 210 + i * 8} ${g2 - 150 + i * 20} Q${bx} ${g2 - 60 + i * 12} ${bx + 210 - i * 8} ${g2 - 150 + i * 20}`} fill="none" stroke="#000" strokeWidth={2} opacity={0.4} />)}
      <line x1={bx} y1={g2 - 140} x2={bx} y2={g2 - 520} stroke="#d8d8dc" strokeWidth={8} />
      <path d={`M${bx + 8} ${g2 - 510} Q${bx + 160} ${g2 - 330} ${bx + 140} ${g2 - 170} L${bx + 8} ${g2 - 170} Z`} fill="#f2f2f2" stroke="#000" strokeWidth={3} />
      <path d={`M${bx - 8} ${g2 - 470} Q${bx - 100} ${g2 - 320} ${bx - 100} ${g2 - 180} L${bx - 8} ${g2 - 180} Z`} fill="#d8d8dc" stroke="#000" strokeWidth={3} />
      {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${bx + 160 + i * 30} ${g2 - 120} q14 -14 28 0`} fill="none" stroke="#d8d8dc" strokeWidth={3} />)}
      <Hero x={300} y={g2} s={B} pose={push} look={HERO} />
      <Effort at={pj.head} />
      {Array.from({ length: 6 }, (_, i) => <rect key={i} x={90 + i * 26} y={g2 - 14 - (i % 2) * 10} width={60} height={10} fill="#7a6a4a" stroke="#000" strokeWidth={1.2} transform={`rotate(${(i - 3) * 6} ${110 + i * 26} ${g2 - 10})`} />)}
      <Count x={1030} y={L2[0] + 58} t="DAY 200" c={GOLD} size={40} />
      <Punch l1="Time will pass anyway." l2="Let it build something." />
    </g>
  );
};

// ================================================================ 5 · FINALE: snow, one bonfire, the 4th match
const F5: React.FC = () => {
  const G = 1500, fire: V = [640, G - 40];
  const kneel = reach({ ...POSES.kneel(), lean: 20, head: 14 }, 450, G, [fire[0] - 110, G - 60], [fire[0] - 150, G - 90], false, 0.95);
  const kj = J(450, G, kneel, false, 0.95);
  return (
    <g>
      <defs>
        <linearGradient id="wsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#030304" /><stop offset="1" stopColor="#141418" /></linearGradient>
        <radialGradient id="warm" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor={GOLD} stopOpacity={0.5} /><stop offset="1" stopColor={GOLD} stopOpacity={0} /></radialGradient>
      </defs>
      <rect x={0} y={0} width={1080} height={1920} fill="url(#wsky)" />
      {Array.from({ length: 160 }, (_, i) => <circle key={i} cx={rnd(i) * 1080} cy={rnd(i + 160) * 1500} r={1.2 + rnd(i * 3) * 3} fill="#fff" opacity={0.25 + rnd(i * 7) * 0.5} />)}
      <path d={`M0 ${G - 260} Q240 ${G - 380} 520 ${G - 300} T1080 ${G - 320} V${G} H0 Z`} fill="#1c1c22" />
      <rect x={0} y={G} width={1080} height={420} fill="#d8d8dc" opacity={0.12} />
      <rect x={0} y={G} width={1080} height={420} fill="#0b0b0d" opacity={0.7} />
      <line x1={0} y1={G} x2={1080} y2={G} stroke="#d8d8dc" strokeWidth={3} opacity={0.5} />
      {/* the warm circle of his fire on the snow */}
      <ellipse cx={fire[0]} cy={G + 10} rx={480} ry={120} fill="url(#warm)" />
      <Glow at={[fire[0], G - 160]} r={420} color={GOLD} a={0.55} />
      <Rays f={0} at={[fire[0], G - 160]} a={0.25} color={GOLD} n={16} len={700} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={fire[0] - 110 + i * 12} y={G - 30 - i * 10} width={220 - i * 24} height={22} rx={10} fill="#5a4a32" stroke="#000" strokeWidth={2} transform={`rotate(${i % 2 ? 14 : -14} ${fire[0]} ${G - 30})`} />)}
      <path d={`M${fire[0] - 100} ${G - 40} Q${fire[0] - 120} ${G - 220} ${fire[0] - 30} ${G - 330} Q${fire[0] - 40} ${G - 220} ${fire[0]} ${G - 200} Q${fire[0] + 20} ${G - 380} ${fire[0] + 60} ${G - 300} Q${fire[0] + 120} ${G - 200} ${fire[0] + 100} ${G - 40} Z`} fill="#ffb84a" />
      <path d={`M${fire[0] - 50} ${G - 40} Q${fire[0] - 60} ${G - 160} ${fire[0]} ${G - 230} Q${fire[0] + 60} ${G - 160} ${fire[0] + 50} ${G - 40} Z`} fill="#ffe7a8" />
      {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={fire[0] - 80 + rnd(i + 3) * 160} cy={G - 360 - rnd(i + 9) * 260} r={2 + rnd(i) * 3} fill={GOLD} opacity={0.8} />)}
      {/* him, kneeling, the match still in his hand; the three that failed in the snow */}
      <Hero x={450} y={G} s={0.95} pose={kneel} look={HERO} />
      <line x1={kj.wN[0]} y1={kj.wN[1]} x2={kj.wN[0] + 46} y2={kj.wN[1] - 10} stroke="#c8b48a" strokeWidth={5} />
      <path d={`M${kj.wN[0] + 48} ${kj.wN[1] - 12} q-8 -16 0 -28 q8 14 0 28`} fill="#ffe7a8" />
      {[0, 1, 2].map((i) => <g key={i} transform={`rotate(${-30 + i * 25} ${320 + i * 40} ${G + 30})`}><line x1={320 + i * 40} y1={G + 30} x2={366 + i * 40} y2={G + 30} stroke="#c8b48a" strokeWidth={5} /><circle cx={368 + i * 40} cy={G + 30} r={6} fill={RED} /></g>)}
      {/* the others, walking in from the cold toward his fire */}
      {[[900, 0.6], [990, 0.5]].map(([x, s], i) => <Hero key={i} x={x} y={G} s={s} pose={{ ...POSES.stand(), lean: 10, head: 6, hN: [30, 40], hF: [20, 50] }} flip look={GREY} opacity={0.75} />)}
      {/* and the one still waiting by the road, in the dark */}
      <rect x={60} y={G - 130} width={16} height={130} fill="#3a3a40" />
      <rect x={30} y={G - 170} width={110} height={44} rx={4} fill="#3a3a40" stroke="#000" strokeWidth={2} />
      <text x={85} y={G - 140} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={20} fill="#8a8a92">ROAD</text>
      <Hero x={170} y={G} s={0.6} pose={{ ...POSES.hugKnees(), head: 10 }} look={GREY} opacity={0.8} />
      <Say x={250} y={G - 300} t="someone will come…" />
      <text x={1040} y={200} textAnchor="end" fontFamily={MONO} fontWeight={800} fontSize={40} fill={RED}>MATCHES: 4</text>
      <Punch l1="Nobody is coming to light it for you." l2="Strike again." y={1700} />
    </g>
  );
};

const FRAMES = [F0, F1, F2, F3, F4, F5];
export const ProveV5Frames: React.FC = () => {
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
