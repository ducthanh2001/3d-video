// "PROVE THEM WRONG. QUIETLY." — style frames (6 vignettes, ~33 s). Each vignette has its own place (gym, night street,
// living room / desk, phone / workbench, armchair / marathon, the gym again), a one-line statement header from frame 0,
// real objects at real scale, B&W with gold = what he builds, red = the doubt. Two-lane vignettes sit in rounded cards
// with a label tab (not the bare ground bars of SAME HOURS).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { V } from "../../kit/core";
import { BONE, Hero, HeroLook, POSES, Pose, run } from "../../kit/hero";
import { KitDefs, Vignette } from "../../kit/materials";
import { Glow, Rays } from "../../kit/fx";
import { BOLD, BOLD_GREY, Defs, GOLD, SANS } from "../samehours/StyleFrames";
import { J, reach } from "../beatyesterday/StyleFrames";

export const QUIETLY_FRAMES = 6;
const RED = "#e0483e";
const MONO = "Consolas, 'Courier New', monospace";
const HERO: HeroLook = { ...BOLD };
const GREY: HeroLook = { ...BOLD_GREY, glow: 0 };
const AR = BONE.uArm + BONE.fArm;
const rnd = (i: number) => { const x = Math.sin(i * 91.7 + 3.1) * 43758.5; return x - Math.floor(x); };

// ---------------------------------------------------------------- shared
export const Header: React.FC<{ t: string; y?: number }> = ({ t, y = 140 }) => (
  <text x={540} y={y} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={50} letterSpacing={3} fill="#f2f2f2">{t}</text>
);
export const Counter: React.FC<{ x: number; y: number; t: string; c?: string; s?: number; anchor?: "start" | "middle" | "end" }> = ({ x, y, t, c = "#d8d8dc", s = 40, anchor = "end" }) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={MONO} fontWeight={800} fontSize={s} fill={c}>{t}</text>
);
/** a rounded panel with a label tab: one lane of a two-lane vignette */
export const Card: React.FC<{ y: number; h: number; label: string; gold?: boolean; children: React.ReactNode; id: string }> = ({ y, h, label, gold, children, id }) => (
  <g>
    <defs><clipPath id={id}><rect x={40} y={y} width={1000} height={h} rx={28} /></clipPath></defs>
    <rect x={40} y={y} width={1000} height={h} rx={28} fill="#0b0b0e" />
    <g clipPath={`url(#${id})`}>{children}</g>
    <rect x={40} y={y} width={1000} height={h} rx={28} fill="none" stroke={gold ? "#8a6a20" : "#2e2e36"} strokeWidth={3} />
    <rect x={70} y={y + 26} width={label.length * 22 + 40} height={52} rx={12} fill={gold ? GOLD : "#2a2a30"} />
    <text x={90} y={y + 63} fontFamily={SANS} fontWeight={800} fontSize={34} fill={gold ? "#1a1205" : "#d8d8dc"}>{label}</text>
  </g>
);
export const Bubble: React.FC<{ x: number; y: number; t: string; red?: boolean; tail?: number; s?: number }> = ({ x, y, t, red, tail = -1, s = 30 }) => {
  const w = t.length * s * 0.52 + 36, h = s * 1.7;
  return (
    <g>
      <rect x={x - w / 2} y={y - h} width={w} height={h} rx={h / 2.6} fill={red ? "#2a0f0e" : "#f2f2f2"} stroke={red ? RED : "#000"} strokeWidth={3} />
      <path d={`M${x + tail * 10} ${y - 2} l${tail * 22} 26 l${-tail * 4} -26 Z`} fill={red ? "#2a0f0e" : "#f2f2f2"} stroke={red ? RED : "#000"} strokeWidth={3} strokeLinejoin="round" />
      <text x={x} y={y - h * 0.32} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={s} fill={red ? "#ff8a80" : "#111"}>{t}</text>
    </g>
  );
};
export const Floor: React.FC<{ y: number; x0?: number; x1?: number; tone?: string }> = ({ y, x0 = 0, x1 = 1080, tone = "#3a3a42" }) => (
  <g>
    <rect x={x0} y={y} width={x1 - x0} height={6} fill={tone} />
    <rect x={x0} y={y + 6} width={x1 - x0} height={80} fill="#ffffff" opacity={0.04} />
  </g>
);

// ---------------------------------------------------------------- gym props
/** an olympic barbell: bar from a to b, plates of `kg` each side (0 = the empty 20 kg bar) */
const Barbell: React.FC<{ a: V; b: V; plates?: number; gold?: boolean }> = ({ a, b, plates = 0, gold }) => {
  const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI, L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const plate = (x: number, i: number) => <rect key={`${x}${i}`} x={x} y={-62 + i * 6} width={22} height={124 - i * 12} rx={4} fill={gold ? "url(#sh-gold)" : i % 2 ? "#3a3a42" : "#26262c"} stroke="#000" strokeWidth={3} />;
  return (
    <g transform={`translate(${a[0]} ${a[1]}) rotate(${ang})`}>
      <rect x={-20} y={-5} width={L + 40} height={10} rx={4} fill="#c8c8ce" stroke="#000" strokeWidth={2.5} />
      {[0, L].map((x, k) => <rect key={k} x={x + (k ? -2 : -18)} y={-11} width={20} height={22} rx={3} fill="#9a9aa2" stroke="#000" strokeWidth={2} />)}
      {Array.from({ length: plates }, (_, i) => plate(-44 - i * 24, Math.min(i, 2)))}
      {Array.from({ length: plates }, (_, i) => plate(L + 22 + i * 24, Math.min(i, 2)))}
    </g>
  );
};
const PlateRack: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <rect x={x - 6} y={y - 300} width={12} height={300} fill="#3a3a42" stroke="#000" strokeWidth={2} />
    <rect x={x - 70} y={y - 14} width={140} height={14} rx={4} fill="#2a2a30" stroke="#000" strokeWidth={2} />
    {[0, 1, 2].map((k) => [0, 1].map((s) => <rect key={`${k}${s}`} x={x + (s ? 8 : -26) + (s ? k * 4 : -k * 4)} y={y - 260 + k * 80} width={18} height={70 + k * 10} rx={4} fill={k === 2 ? "#3a3a42" : "#26262c"} stroke="#000" strokeWidth={2.5} />))}
  </g>
);
const GymBack: React.FC<{ fl: number; warm?: boolean }> = ({ fl, warm }) => (
  <g>
    <defs><linearGradient id="gymwall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#050506" /><stop offset="1" stopColor="#1a1a20" /></linearGradient></defs>
    <rect x={0} y={0} width={1080} height={fl} fill="url(#gymwall)" />
    {/* mirror panels on the back wall */}
    {[0, 1, 2, 3].map((i) => <rect key={i} x={60 + i * 250} y={fl - 620} width={210} height={460} fill="#16161c" stroke="#26262e" strokeWidth={4} />)}
    {[0, 1, 2, 3].map((i) => <path key={i} d={`M${90 + i * 250} ${fl - 600} l60 0 l-90 120 l-30 0 Z`} fill="#ffffff" opacity={0.03} />)}
    {/* rubber floor tiles in perspective */}
    <rect x={0} y={fl} width={1080} height={1920 - fl} fill="#0d0d10" />
    {Array.from({ length: 9 }, (_, i) => <line key={i} x1={540 + (i - 4) * 120} y1={fl} x2={540 + (i - 4) * 420} y2={1920} stroke="#1c1c22" strokeWidth={3} />)}
    {[0, 1, 2].map((i) => <line key={i} x1={0} y1={fl + 60 + i * i * 70} x2={1080} y2={fl + 60 + i * i * 70} stroke="#1c1c22" strokeWidth={3} />)}
    <rect x={300} y={fl - 4} width={480} height={30} rx={4} fill={warm ? "#3a2a10" : "#1e1e24"} stroke="#000" strokeWidth={2} />
  </g>
);
const laugh = (k: number): Pose => k % 3 === 0
  ? { ...POSES.point(), head: -16, hF: [30, 66] }
  : k % 3 === 1 ? { ...POSES.stand(), lean: -10, head: -24, hN: [34, 70], hF: [26, 76], elbow: -1 } : { ...POSES.stand(), lean: 18, head: 10, hN: [40, 40], hF: [30, 46], elbow: -1 };
const clap: Pose = { ...POSES.stand(), lean: 2, head: -6, hN: [58, 22], hF: [52, 28], elbow: -1 };

/** the lifter: barbell overhead (or at the shoulders) at x, the bar drawn from his solved hands */
const Lifter: React.FC<{ x: number; y: number; s: number; plates: number; gold?: boolean; strain?: boolean }> = ({ x, y, s, plates, gold, strain }) => {
  const base: Pose = { ...POSES.stand(), fN: [44, 0], fF: [-40, 0], head: strain ? -6 : -10 };
  const sh = J(x, y, base, false, s).sh;
  const hy = sh[1] - AR * s * 0.92;
  const p = reach(base, x, y, [x + 120 * s, hy], [x - 110 * s, hy], false, s);
  const j = J(x, y, p, false, s);
  return (
    <g>
      <Hero x={x} y={y} s={s} pose={p} look={HERO} />
      <Barbell a={[j.wF[0] - 40 * s, (j.wF[1] + j.wN[1]) / 2]} b={[j.wN[0] + 40 * s, (j.wF[1] + j.wN[1]) / 2]} plates={plates} gold={gold} />
      {strain && [0, 1, 2].map((i) => <path key={i} d={`M${j.head[0] + 40 + i * 12} ${j.head[1] - 10 + i * 14} q8 -6 16 0`} stroke="#d8d8dc" strokeWidth={3} fill="none" />)}
    </g>
  );
};

// ================================================================ 1 · THEY LAUGHED AT DAY 1 (the gym, hook)
const F1: React.FC = () => {
  const fl = 1540;
  return (
    <g>
      <GymBack fl={fl} />
      <PlateRack x={130} y={fl} />
      <PlateRack x={950} y={fl} />
      <Rays f={0} at={[540, 0]} a={0.18} color="#ffffff" n={6} len={1500} />
      <path d={`M440 0 L640 0 L820 ${fl + 40} L260 ${fl + 40} Z`} fill="#ffffff" opacity={0.06} />
      {/* the gym crowd laughing, both sides */}
      {[110, 220, 330].map((x, k) => <Hero key={k} x={x} y={fl + 40} s={0.66} pose={laugh(k)} look={GREY} />)}
      {[750, 860, 970].map((x, k) => <Hero key={k} x={x} y={fl + 40} s={0.66} pose={laugh(k + 1)} look={GREY} flip />)}
      <Lifter x={540} y={fl} s={1.05} plates={0} />
      <Bubble x={220} y={1150} t="Empty bar?" red tail={1} s={40} />
      <Bubble x={820} y={1060} t="He'll quit by Friday." red tail={-1} s={36} />
      <Bubble x={300} y={930} t="LOL" red tail={1} s={40} />
      <Counter x={540} y={300} t="DAY 1" anchor="middle" s={80} />
      <Counter x={540} y={720} t="20 kg" anchor="middle" s={40} c="#9a9aa2" />
      <Header t="THEY LAUGHED AT DAY 1." />
    </g>
  );
};

// ================================================================ 2 · "IT WON'T LAST A MONTH." (a food truck, month 1 / month 24)
const FoodTruck: React.FC<{ x: number; y: number; lit?: boolean; open?: boolean; vendor?: React.ReactNode; id: string }> = ({ x, y, lit, open = true, vendor, id }) => (
  <g transform={`translate(${x} ${y})`}>
    <defs><clipPath id={id}><rect x={-200} y={-250} width={300} height={130} rx={6} /></clipPath></defs>
    {/* box body + cab */}
    <path d="M-260 -40 L-260 -300 Q-260 -316 -244 -316 L170 -316 Q186 -316 186 -300 L186 -40 Z" fill="#d8d8dc" stroke="#000" strokeWidth={4} />
    <path d="M186 -40 L186 -220 L262 -220 Q286 -220 296 -196 L320 -120 L320 -40 Z" fill="#c8c8ce" stroke="#000" strokeWidth={4} />
    <path d="M200 -206 L258 -206 Q274 -206 282 -188 L300 -132 L200 -132 Z" fill="#26262c" stroke="#000" strokeWidth={3} />
    <rect x={-260} y={-90} width={446} height={20} fill={lit ? GOLD : "#8a8a92"} stroke="#000" strokeWidth={2} />
    {/* serving window, awning, menu */}
    <rect x={-200} y={-250} width={300} height={130} rx={6} fill={lit ? "#ffe2a0" : "#3a3a42"} stroke="#000" strokeWidth={4} />
    <g clipPath={`url(#${id})`}>{vendor}</g>
    {open && <path d="M-216 -256 L116 -256 L136 -296 L-236 -296 Z" fill={lit ? GOLD : "#6a6a72"} stroke="#000" strokeWidth={3} />}
    {open && Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${-236 + i * 53} -256 q26 22 53 0`} fill={i % 2 ? "#f2f2f2" : lit ? "#c88a16" : "#4a4a52"} stroke="#000" strokeWidth={2} />)}
    <rect x={-200} y={-120} width={300} height={14} fill="#5a5a62" stroke="#000" strokeWidth={2} />
    <rect x={-120} y={-360} width={140} height={40} rx={6} fill="#26262c" stroke="#000" strokeWidth={2} />
    <text x={-50} y={-330} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={30} fill={lit ? GOLD : "#d8d8dc"}>TACOS</text>
    {/* wheels */}
    {[-150, 230].map((wx) => <g key={wx}><circle cx={wx} cy={-30} r={40} fill="#141418" stroke="#000" strokeWidth={3} /><circle cx={wx} cy={-30} r={18} fill="#8a8a92" /></g>)}
  </g>
);
const StringLights: React.FC<{ x0: number; x1: number; y: number; on?: boolean }> = ({ x0, x1, y, on }) => (
  <g>
    <path d={`M${x0} ${y} Q${(x0 + x1) / 2} ${y + 60} ${x1} ${y}`} fill="none" stroke="#4a4a52" strokeWidth={3} />
    {Array.from({ length: 9 }, (_, i) => { const t = (i + 0.5) / 9, x = x0 + (x1 - x0) * t, yy = y + 4 * 60 * t * (1 - t) / 1; return <g key={i}>{on && <circle cx={x} cy={yy + 10} r={18} fill={GOLD} opacity={0.25} />}<circle cx={x} cy={yy + 10} r={7} fill={on ? "#ffe2a0" : "#5a5a62"} /></g>; })}
  </g>
);
const F2: React.FC = () => {
  const g1 = 880, g2 = 1640;
  const customer = (k: number): Pose => ({ ...POSES.stand(), head: k % 2 ? 6 : -4, hN: [14, AR - 8], hF: [-10, AR - 8] });
  return (
    <g>
      <Header t={'"IT WON\'T LAST A MONTH."'} />
      <Card y={210} h={720} label="MONTH 1" id="c2a">
        <Floor y={g1} x0={40} x1={1040} />
        <StringLights x0={60} x1={1020} y={330} />
        <FoodTruck x={600} y={g1} id="ft1" vendor={<Hero x={-50} y={-40} s={0.5} pose={{ ...POSES.stand(), head: 18, hN: [30, 50], hF: [24, 56] }} look={HERO} />} />
        <Hero x={190} y={g1} s={0.52} pose={{ ...POSES.stand(), head: -6, hN: [20, 40], hF: [-24, 60] }} look={GREY} flip />
        <Bubble x={220} y={590} t="Won't last a month." red tail={1} s={28} />
      </Card>
      <Card y={970} h={720} label="MONTH 24" gold id="c2b">
        <Floor y={g2} x0={40} x1={1040} />
        <StringLights x0={60} x1={1020} y={1090} on />
        <Glow at={[540, g2 - 240]} r={300} color={GOLD} a={0.35} />
        <FoodTruck x={720} y={g2} lit id="ft2" vendor={<Hero x={-60} y={-40} s={0.5} pose={{ ...POSES.stand(), head: -4, hN: [-70, 30], hF: [-60, 40] }} look={HERO} flip />} />
        {/* the line round the block, running off the left edge */}
        {Array.from({ length: 8 }, (_, k) => <Hero key={k} x={410 - k * 62} y={g2} s={0.46} pose={customer(k)} look={GREY} />)}
      </Card>
    </g>
  );
};

// ================================================================ 3 · THE RED F (believes it / studies at night)
const TestPaper: React.FC<{ x: number; y: number; grade: string; c: string; rot?: number; s?: number; crumpled?: boolean }> = ({ x, y, grade, c, rot = 0, s = 1, crumpled }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {crumpled
      ? <path d="M-50 -30 L-20 -48 L18 -36 L52 -46 L46 -6 L58 30 L20 44 L-16 34 L-54 42 L-44 4 Z" fill="#e8e8ec" stroke="#000" strokeWidth={3} strokeLinejoin="round" />
      : <rect x={-70} y={-90} width={140} height={180} rx={4} fill="#f2f2f2" stroke="#000" strokeWidth={3} />}
    {!crumpled && [0, 1, 2, 3, 4].map((i) => <line key={i} x1={-50} y1={-30 + i * 22} x2={40} y2={-30 + i * 22} stroke="#9a9aa2" strokeWidth={4} />)}
    <text x={crumpled ? 0 : 36} y={crumpled ? 14 : -44} textAnchor="middle" fontFamily='"Segoe Print", "Comic Sans MS", cursive' fontWeight={900} fontSize={crumpled ? 44 : 64} fill={c}>{grade}</text>
    {!crumpled && <circle cx={36} cy={-64} r={38} fill="none" stroke={c} strokeWidth={5} />}
  </g>
);
export const Couch: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`} stroke="#000" strokeWidth={3}>
    <rect x={-180} y={-150} width={360} height={90} rx={22} fill="#3a3a42" />
    <rect x={-190} y={-80} width={380} height={60} rx={14} fill="#4a4a52" />
    <rect x={-210} y={-120} width={50} height={100} rx={16} fill="#3a3a42" /><rect x={160} y={-120} width={50} height={100} rx={16} fill="#3a3a42" />
    <rect x={-180} y={-20} width={14} height={20} fill="#26262c" /><rect x={166} y={-20} width={14} height={20} fill="#26262c" />
  </g>
);
export const TV: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <Glow at={[x, y - 120]} r={160} color="#7fb6ff" a={0.35} />
    <rect x={x - 130} y={y - 200} width={260} height={160} rx={8} fill="#9cc8ff" stroke="#000" strokeWidth={5} />
    <rect x={x - 20} y={y - 40} width={40} height={30} fill="#26262c" /><rect x={x - 70} y={y - 12} width={140} height={12} rx={4} fill="#26262c" />
  </g>
);
const DeskLamp: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <path d={`M${x + 70} ${y - 150} L${x - 40} ${y} L${x + 220} ${y} Z`} fill="#ffe2a0" opacity={0.18} />
    <rect x={x - 30} y={y - 10} width={60} height={10} rx={3} fill="#3a3a42" stroke="#000" strokeWidth={2} />
    <path d={`M${x} ${y - 10} L${x + 20} ${y - 110} L${x + 70} ${y - 150}`} stroke="#5a5a62" strokeWidth={8} fill="none" strokeLinecap="round" />
    <path d={`M${x + 50} ${y - 170} L${x + 110} ${y - 140} L${x + 84} ${y - 120} L${x + 40} ${y - 146} Z`} fill="#8a8a92" stroke="#000" strokeWidth={3} />
    <circle cx={x + 82} cy={y - 128} r={9} fill="#fff6d8" />
    <Glow at={[x + 82, y - 128]} r={140} color={GOLD} a={0.5} />
  </g>
);
const StudyDesk: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g stroke="#000" strokeWidth={3}>
    <rect x={x - 200} y={y - 170} width={400} height={22} rx={4} fill="#6a5038" />
    <rect x={x - 186} y={y - 148} width={16} height={148} fill="#4a3828" /><rect x={x + 170} y={y - 148} width={16} height={148} fill="#4a3828" />
  </g>
);
const F3: React.FC = () => {
  const g1 = 880, g2 = 1640;
  const slump: Pose = { ...POSES.sit(118), lean: -14, head: 20, hN: [40, 60], hF: [30, 70] };
  const write: Pose = { ...POSES.sit(118), lean: 26, head: 22, hN: [92, 6], hF: [74, 12] };
  return (
    <g>
      <Header t="THE RED F." />
      <Card y={210} h={720} label="Believes it" id="c3a">
        <Floor y={g1} x0={40} x1={1040} />
        <TV x={830} y={g1 - 120} />
        <rect x={720} y={g1 - 120} width={220} height={120} fill="#26262c" stroke="#000" strokeWidth={3} />
        <Couch x={380} y={g1} />
        <Hero x={380} y={g1} s={0.62} pose={slump} look={GREY} />
        <TestPaper x={600} y={g1 - 30} grade="F" c={RED} crumpled s={1.1} />
        <TestPaper x={160} y={g1 - 520} grade="F" c={RED} rot={-8} s={0.9} />
      </Card>
      <Card y={970} h={720} label="Studies at night" gold id="c3b">
        <Floor y={g2} x0={40} x1={1040} />
        {/* night window */}
        <rect x={760} y={1110} width={200} height={240} fill="#0e1424" stroke="#2a2a32" strokeWidth={6} />
        <circle cx={900} cy={1160} r={22} fill="#e8e8ec" opacity={0.8} />
        <StudyDesk x={540} y={g2} />
        <DeskLamp x={640} y={g2 - 170} />
        <rect x={360} y={g2 - 196} width={150} height={26} rx={3} fill="#f2f2f2" stroke="#000" strokeWidth={2} />
        <rect x={500} y={1360} width={18} height={14} fill="#3a3a42" />
        <Hero x={330} y={g2} s={0.62} pose={write} look={HERO} />
        <rect x={250} y={g2 - 118} width={150} height={16} fill="#3a3a42" stroke="#000" strokeWidth={2} />
        {/* the old F pinned up, the new A beside it */}
        <TestPaper x={180} y={g2 - 520} grade="F" c={RED} rot={-6} s={0.8} />
        <Glow at={[400, g2 - 520]} r={120} color={GOLD} a={0.5} />
        <TestPaper x={400} y={g2 - 520} grade="A" c={GOLD} rot={4} s={0.9} />
        <Counter x={1000} y={g2 + 50} t="NIGHT 120" c={GOLD} s={32} />
      </Card>
    </g>
  );
};

// ================================================================ 4 · REPLY OR WORK (comments / workbench)
const Comment: React.FC<{ x: number; y: number; t: string; me?: boolean }> = ({ x, y, t, me }) => {
  const w = t.length * 21 + 90;
  return (
    <g>
      <rect x={x} y={y} width={w} height={70} rx={18} fill={me ? "#2a3a52" : "#1e1e24"} stroke={me ? "#7fb6ff" : "#3a3a42"} strokeWidth={3} />
      <circle cx={x + 34} cy={y + 35} r={18} fill={me ? "#7fb6ff" : "#5a5a62"} />
      <text x={x + 66} y={y + 46} fontFamily={SANS} fontWeight={700} fontSize={36} fill={me ? "#cfe0ff" : "#bdbdc4"}>{t}</text>
    </g>
  );
};
const Workbench: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g stroke="#000" strokeWidth={3}>
    <rect x={x - 230} y={y - 150} width={460} height={28} rx={4} fill="#8a6a4c" />
    <rect x={x - 214} y={y - 122} width={20} height={122} fill="#5e4836" /><rect x={x + 194} y={y - 122} width={20} height={122} fill="#5e4836" />
    <rect x={x - 200} y={y - 60} width={400} height={14} fill="#5e4836" />
    {/* tools: saw, hammer, clamp */}
    <path d={`M${x - 190} ${y - 150} l120 -6 l0 -26 l-100 4 Z`} fill="#b9b9c0" />
    <rect x={x - 66} y={y - 186} width={20} height={36} rx={3} fill="#5e4836" />
  </g>
);
const BuiltChair: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g stroke="#000" strokeWidth={4} strokeLinejoin="round">
    <rect x={x - 70} y={y - 140} width={140} height={22} rx={4} fill="url(#sh-gold)" />
    <rect x={x - 66} y={y - 118} width={16} height={118} fill="url(#sh-gold)" /><rect x={x + 50} y={y - 118} width={16} height={118} fill="url(#sh-gold)" />
    <rect x={x + 50} y={y - 300} width={16} height={160} fill="url(#sh-gold)" />
    {[0, 1, 2].map((i) => <rect key={i} x={x + 14} y={y - 290 + i * 46} width={52} height={14} rx={3} fill="url(#sh-gold)" />)}
  </g>
);
const F4: React.FC = () => {
  const g1 = 880, g2 = 1640;
  const typing: Pose = { ...POSES.sit(110), lean: 20, head: 34, hN: [60, 24], hF: [52, 30], elbow: 1 };
  const sand = reach({ ...POSES.stand(), lean: 30, head: 16, fN: [40, 0], fF: [-56, 0] }, 330, g2, [420, g2 - 270], [404, g2 - 250], false, 0.62);
  return (
    <g>
      <Header t="REPLY OR WORK." />
      <Card y={210} h={720} label="Argues in the comments" id="c4a">
        <Floor y={g1} x0={40} x1={1040} />
        <rect x={150} y={g1 - 110} width={150} height={110} rx={10} fill="#3a3a42" stroke="#000" strokeWidth={3} />
        <Hero x={230} y={g1} s={0.62} pose={typing} look={GREY} hold={(j) => <g transform={`translate(${j.wN[0] + 6} ${j.wN[1] - 18}) rotate(-24)`}><rect x={-15} y={-28} width={30} height={54} rx={6} fill="#1b1d24" stroke="#000" strokeWidth={3} /><rect x={-11} y={-23} width={22} height={42} rx={3} fill="#9cc8ff" /></g>} />
        <Glow at={[300, g1 - 230]} r={110} color="#7fb6ff" a={0.35} />
        <Comment x={380} y={300} t="you're wrong" />
        <Comment x={460} y={385} t="no, YOU are" me />
        <Comment x={400} y={470} t="lol prove it" />
        <Comment x={480} y={555} t="I will. watch." me />
        <Comment x={420} y={640} t="ok bro" />
        <Comment x={500} y={725} t="..." me />
        <Counter x={1000} y={g1 + 50} t="3h 12m" c={RED} s={32} />
      </Card>
      <Card y={970} h={720} label="Builds" gold id="c4b">
        <Floor y={g2} x0={40} x1={1040} />
        <Glow at={[460, g2 - 300]} r={260} color={GOLD} a={0.35} />
        <Workbench x={760} y={g2} />
        <BuiltChair x={460} y={g2} />
        <Hero x={330} y={g2} s={0.62} pose={sand} look={HERO} />
        {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={430 + rnd(i) * 60} cy={g2 - 230 + rnd(i + 5) * 40} r={3} fill="#d9cdb6" />)}
        <Counter x={1000} y={g2 + 50} t="3h 12m" c={GOLD} s={32} />
      </Card>
    </g>
  );
};

// ================================================================ 5 · "TOO OLD TO START." (agrees / starts at 50)
const Armchair: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`} stroke="#000" strokeWidth={3}>
    <rect x={-100} y={-250} width={60} height={200} rx={20} fill="#3a3a42" />
    <rect x={-100} y={-110} width={200} height={70} rx={18} fill="#4a4a52" />
    <rect x={60} y={-150} width={44} height={110} rx={14} fill="#3a3a42" />
    <rect x={-90} y={-40} width={12} height={40} fill="#26262c" /><rect x={80} y={-40} width={12} height={40} fill="#26262c" />
  </g>
);
const FinishArch: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <rect x={x - 10} y={y - 420} width={20} height={420} fill="#5a5a62" stroke="#000" strokeWidth={2} />
    <rect x={x + 290} y={y - 420} width={20} height={420} fill="#5a5a62" stroke="#000" strokeWidth={2} />
    <rect x={x - 20} y={y - 470} width={340} height={70} rx={8} fill="#26262c" stroke="#000" strokeWidth={3} />
    <text x={x + 150} y={y - 422} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={44} letterSpacing={4} fill={GOLD}>FINISH</text>
  </g>
);
const F5: React.FC = () => {
  const g1 = 880, g2 = 1640;
  const sitTv: Pose = { ...POSES.sit(108), lean: -16, head: 8, hN: [60, 50], hF: [40, 60] };
  const rp = run(0.18);
  return (
    <g>
      <Header t={'"TOO OLD TO START."'} />
      <Card y={210} h={720} label="Agrees" id="c5a">
        <Floor y={g1} x0={40} x1={1040} />
        <TV x={820} y={g1 - 120} />
        <rect x={710} y={g1 - 120} width={220} height={120} fill="#26262c" stroke="#000" strokeWidth={3} />
        <Armchair x={340} y={g1} />
        <Hero x={330} y={g1 - 40} s={0.62} pose={sitTv} look={GREY} />
        <Counter x={1000} y={g1 + 50} t="AGE 52" s={32} />
        <Bubble x={420} y={560} t="Too old for that." red tail={-1} s={28} />
      </Card>
      <Card y={970} h={720} label="Starts at 50" gold id="c5b">
        <Floor y={g2} x0={40} x1={1040} />
        {/* road lines + spectators' barrier */}
        {Array.from({ length: 6 }, (_, i) => <rect key={i} x={70 + i * 170} y={g2 + 30} width={90} height={8} fill="#3a3a42" />)}
        <Glow at={[700, g2 - 300]} r={300} color={GOLD} a={0.4} />
        <FinishArch x={560} y={g2} />
        {/* the tape breaking across his chest */}
        <path d={`M580 ${g2 - 250} L650 ${g2 - 262}`} stroke={GOLD} strokeWidth={6} />
        <path d={`M760 ${g2 - 262} Q820 ${g2 - 240} 860 ${g2 - 210}`} stroke={GOLD} strokeWidth={6} fill="none" />
        <Hero x={700} y={g2} s={0.62} pose={{ ...rp, head: -14, hN: [50, -AR + 40], hF: [-40, -AR + 50] }} look={HERO} />
        <rect x={686} y={g2 - 300} width={44} height={34} rx={4} fill="#f2f2f2" stroke="#000" strokeWidth={2} />
        <text x={708} y={g2 - 276} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={18} fill="#111">50</text>
        <Counter x={1000} y={g2 + 50} t="AGE 52 · 42.2 km" c={GOLD} s={30} />
      </Card>
    </g>
  );
};

// ================================================================ 6 · SAY NOTHING. SHOW THEM. (the same gym, a year later: loops to frame 1)
const F6: React.FC = () => {
  const fl = 1540;
  return (
    <g>
      <GymBack fl={fl} warm />
      <PlateRack x={130} y={fl} />
      <PlateRack x={950} y={fl} />
      <Glow at={[540, 700]} r={520} color={GOLD} a={0.45} />
      <Rays f={0} at={[540, 0]} a={0.3} color={GOLD} n={8} len={1500} />
      <path d={`M440 0 L640 0 L820 ${fl + 40} L260 ${fl + 40} Z`} fill={GOLD} opacity={0.1} />
      {[110, 220, 330].map((x, k) => <Hero key={k} x={x} y={fl + 40} s={0.66} pose={clap} look={GREY} />)}
      {[750, 860, 970].map((x, k) => <Hero key={k} x={x} y={fl + 40} s={0.66} pose={clap} look={GREY} flip />)}
      {[170, 280, 810, 920].map((x, k) => <path key={k} d={`M${x} 1180 l-14 -14 M${x + 10} 1104 l0 -20 M${x + 20} 1110 l14 -14`} stroke="#d8d8dc" strokeWidth={4} strokeLinecap="round" />)}
      <Lifter x={540} y={fl} s={1.05} plates={3} gold strain />
      <Counter x={540} y={300} t="DAY 365" anchor="middle" s={80} c={GOLD} />
      <Counter x={540} y={720} t="140 kg" anchor="middle" s={40} c={GOLD} />
      <Header t="SAY NOTHING. SHOW THEM." />
    </g>
  );
};

const FRAMES = [F1, F2, F3, F4, F5, F6];
export const QuietlyFrames: React.FC = () => {
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
