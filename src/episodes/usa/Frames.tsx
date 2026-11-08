// "EVERY NO LED HERE" — style frames for the US audience. Five American-icon vignettes, each ending in a big payoff:
// 0 the mailbox: 46 rejection letters, then one ACCEPTED · 1 the garage that became a skyscraper · 2 a $1 lemonade stand
// that lights up the map of America · 3 "too small" → the stadium says his name · 4 finale: he hands Mom the keys to a house.
// B&W dominant; red = REJECTED / PAST DUE; gold = the payoff.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { V } from "../../kit/core";
import { Hero, HeroLook, POSES, Pose } from "../../kit/hero";
import { KitDefs, Vignette } from "../../kit/materials";
import { Glow, Rays } from "../../kit/fx";
import { Defs, GOLD, SANS } from "../samehours/StyleFrames";
import { J } from "../beatyesterday/StyleFrames";
import { Count, GREY, HERO, L1, L2, Lane, Punch, RED, S, Say, rnd } from "../prove/Frames";

export const USA_FRAMES = 5;
const g1 = L1[1] - 110, g2 = L2[1] - 110;
const BIG = '"Arial Black", "Segoe UI Black", Impact, sans-serif';

// ---------------------------------------------------------------- American props
const House: React.FC<{ x: number; g: number; w?: number; h?: number; lit?: number; big?: boolean }> = ({ x, g, w = 360, h = 220, lit = 0, big }) => (
  <g>
    <path d={`M${x - w / 2 - 20} ${g - h} L${x} ${g - h - (big ? 200 : 140)} L${x + w / 2 + 20} ${g - h} Z`} fill="#26262c" stroke="#000" strokeWidth={3} />
    <rect x={x - w / 2} y={g - h} width={w} height={h} fill="#1e1e23" stroke="#000" strokeWidth={3} />
    {Array.from({ length: Math.floor(h / 30) }, (_, i) => <line key={i} x1={x - w / 2} y1={g - h + 15 + i * 30} x2={x + w / 2} y2={g - h + 15 + i * 30} stroke="#2a2a30" strokeWidth={2} />)}
    {(big ? [-0.32, 0, 0.32] : [-0.28, 0.28]).map((k, i) => <g key={i}><rect x={x + k * w - 34} y={g - h + 40} width={68} height={70} fill={lit ? GOLD : "#0b0b0d"} opacity={lit ? 0.6 + 0.3 * lit : 1} stroke="#000" strokeWidth={3} />{lit > 0 && <Glow at={[x + k * w, g - h + 75]} r={90} color={GOLD} a={0.4 * lit} />}</g>)}
    <rect x={x - 34} y={g - 120} width={68} height={120} fill="#3a3a40" stroke="#000" strokeWidth={3} />
    <circle cx={x + 20} cy={g - 60} r={4} fill="#bdbdc4" />
    {/* picket fence */}
    {Array.from({ length: 22 }, (_, i) => <path key={i} d={`M${x - w / 2 - 120 + i * 30} ${g} v-56 l8 -10 l8 10 v56 Z`} fill="#d8d8dc" stroke="#000" strokeWidth={1.5} opacity={i > 7 && i < 14 ? 0 : 0.85} />)}
    <rect x={x - w / 2 - 120} y={g - 40} width={660} height={8} fill="#d8d8dc" opacity={0.85} />
  </g>
);
const Mailbox: React.FC<{ x: number; g: number; flag?: boolean; name?: string }> = ({ x, g, flag, name }) => (
  <g>
    <rect x={x - 6} y={g - 150} width={12} height={150} fill="#6a6a72" stroke="#000" strokeWidth={2} />
    <path d={`M${x - 60} ${g - 150} V${g - 196} Q${x - 60} ${g - 230} ${x - 26} ${g - 230} H${x + 60} V${g - 150} Z`} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} />
    {flag && <><rect x={x + 60} y={g - 230} width={8} height={56} fill={RED} stroke="#000" strokeWidth={1.5} /><rect x={x + 60} y={g - 230} width={30} height={18} fill={RED} stroke="#000" strokeWidth={1.5} /></>}
    {name && <text x={x} y={g - 176} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={20} fill="#1a1a1a">{name}</text>}
  </g>
);
const Letter: React.FC<{ x: number; y: number; r?: number; s?: number; stamp?: "no" | "yes"; torn?: boolean }> = ({ x, y, r = 0, s = 1, stamp = "no", torn }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-70} y={-46} width={140} height={92} rx={4} fill="#f2f2f2" stroke="#000" strokeWidth={2.5} />
    {[0, 1, 2].map((i) => <line key={i} x1={-54} y1={-28 + i * 14} x2={30} y2={-28 + i * 14} stroke="#bdbdc4" strokeWidth={4} />)}
    <g transform="rotate(-12)">
      <rect x={-62} y={6} width={124} height={34} rx={4} fill="none" stroke={stamp === "yes" ? GOLD : RED} strokeWidth={4} />
      <text x={0} y={32} textAnchor="middle" fontFamily={BIG} fontSize={22} fill={stamp === "yes" ? GOLD : RED}>{stamp === "yes" ? "ACCEPTED" : "REJECTED"}</text>
    </g>
    {torn && <path d="M0 -46 l-8 20 l10 18 l-10 22 l8 20 l-6 32" fill="none" stroke="#000" strokeWidth={4} />}
  </g>
);
// a simplified outline of the contiguous United States (normalized 0..1)
const USA: V[] = [[0.02, 0.1], [0.12, 0.07], [0.3, 0.09], [0.48, 0.11], [0.62, 0.12], [0.7, 0.2], [0.76, 0.17], [0.8, 0.23], [0.86, 0.15], [0.92, 0.06], [0.98, 0.11], [0.93, 0.23], [0.88, 0.32], [0.84, 0.42], [0.86, 0.52], [0.8, 0.62], [0.82, 0.8], [0.86, 0.95], [0.8, 0.92], [0.74, 0.72], [0.62, 0.74], [0.56, 0.82], [0.5, 0.97], [0.44, 0.82], [0.38, 0.72], [0.28, 0.7], [0.16, 0.62], [0.1, 0.6], [0.04, 0.44], [0, 0.26]];
const inside = (p: V, poly: V[]) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) c = !c; } return c; };

// ================================================================ 0 · HOOK: the mailbox
const F0: React.FC = () => {
  const sitP: Pose = { ...POSES.sit(40), lean: 22, head: 30, hN: [60, 50], hF: [50, 60] };
  const holdUp: Pose = { ...POSES.stand(), head: -20, hN: [50, -130], hF: [-30, 60] };
  const hj = J(560, g2, holdUp, false, S);
  return (
    <g>
      <Lane y0={L1[0]} y1={L1[1]} label="Stops at one NO" id="m1" hills={false} />
      <House x={620} g={g1} />
      <Mailbox x={260} g={g1} />
      <Hero x={380} y={g1} s={S} pose={sitP} look={GREY} />
      <Letter x={470} y={g1 - 20} r={-20} s={0.6} torn />
      <Count x={1030} y={L1[0] + 58} t="NO: 1" c={RED} />
      <Lane y0={L2[0]} y1={L2[1]} label="Keeps applying" bright id="m2" hills={false} />
      <House x={800} g={g2} lit={0.6} />
      <Mailbox x={180} g={g2} flag />
      {/* the stack of rejections, taller than him */}
      {Array.from({ length: 30 }, (_, i) => <Letter key={i} x={350 + (rnd(i) - 0.5) * 30} y={g2 - 20 - i * 15} r={(rnd(i + 9) - 0.5) * 14} s={0.62} />)}
      <Glow at={[hj.wN[0], hj.wN[1] - 30]} r={200} color={GOLD} a={0.55} />
      <Rays f={0} at={[hj.wN[0], hj.wN[1] - 30]} a={0.35} color={GOLD} n={14} len={420} />
      <Hero x={560} y={g2} s={S} pose={holdUp} look={HERO} />
      <Letter x={hj.wN[0] + 10} y={hj.wN[1] - 40} r={-6} s={0.85} stamp="yes" />
      <Count x={1030} y={L2[0] + 58} t="NO: 46" c={RED} />
      <Count x={1030} y={L2[0] + 104} t="YES: 1" c={GOLD} />
      <Punch l1="One NO stopped him." l2="46 couldn't." />
    </g>
  );
};

// ================================================================ 1 · the garage that became a skyscraper
const F1: React.FC = () => {
  const waitP: Pose = { ...POSES.sit(90), head: 26, hN: [50, 30], hF: [40, 40], elbow: 1 };
  const wj = J(420, g1, waitP, false, S);
  const gx = 540, tw = 260, tTop = L2[0] + 40;
  return (
    <g>
      <Lane y0={L1[0]} y1={L1[1]} label="Waits for an investor" id="g1" hills={false} />
      {/* a lobby: glass doors, a bench, a clock */}
      <rect x={600} y={g1 - 420} width={300} height={420} fill="#141418" stroke="#3a3a40" strokeWidth={4} />
      <line x1={750} y1={g1 - 420} x2={750} y2={g1} stroke="#3a3a40" strokeWidth={4} />
      <text x={750} y={g1 - 440} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={26} fill="#6a6a72" letterSpacing={4}>VENTURE CAPITAL</text>
      <rect x={320} y={g1 - 96} width={220} height={16} rx={4} fill="url(#sh-grey)" stroke="#000" strokeWidth={2} />
      <Hero x={420} y={g1} s={S} pose={waitP} look={GREY} />
      <rect x={wj.wN[0] - 12} y={wj.wN[1] - 22} width={24} height={40} rx={5} fill="#cfe0ff" stroke="#000" strokeWidth={2} />
      <Say x={260} y={L1[0] + 190} t="0 replies" tail={1} />
      <Count x={1030} y={L1[0] + 58} t="DAY 1,000" c="#6a6a72" />
      <Lane y0={L2[0]} y1={L2[1]} label="Starts in a garage" bright id="g2" hills={false} />
      <defs><clipPath id="gl2"><rect x={24} y={L2[0]} width={1032} height={L2[1] - L2[0]} rx={14} /></clipPath><linearGradient id="glass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3a3a42" /><stop offset="0.5" stopColor="#1e1e24" /><stop offset="1" stopColor="#101014" /></linearGradient></defs>
      <g clipPath="url(#gl2)">
        {/* the tower, rising out of the garage */}
        <Glow at={[gx, tTop + 120]} r={300} color={GOLD} a={0.35} />
        <path d={`M${gx - tw / 2} ${g2 - 150} L${gx - tw / 2 + 30} ${tTop + 60} L${gx} ${tTop} L${gx + tw / 2 - 30} ${tTop + 60} L${gx + tw / 2} ${g2 - 150} Z`} fill="url(#glass)" stroke="#000" strokeWidth={3} />
        {Array.from({ length: 70 }, (_, i) => { const r = Math.floor(i / 7), c = i % 7, y = tTop + 90 + r * 40; return y < g2 - 160 && <rect key={i} x={gx - tw / 2 + 40 + c * 27} y={y} width={18} height={24} fill={GOLD} opacity={rnd(i) < 0.7 ? 0.7 : 0.15} />; })}
        <path d={`M${gx - 30} ${tTop + 30} L${gx} ${tTop} L${gx + 30} ${tTop + 30}`} fill="none" stroke={GOLD} strokeWidth={6} />
        {/* the garage at its foot, door up, one bulb */}
        <rect x={gx - 170} y={g2 - 160} width={340} height={160} fill="#2a2a30" stroke="#000" strokeWidth={3} />
        <rect x={gx - 140} y={g2 - 130} width={280} height={130} fill="#0e0e10" />
        {Array.from({ length: 4 }, (_, i) => <rect key={i} x={gx - 140} y={g2 - 160 + i * 8} width={280} height={6} fill="#5a5a62" />)}
        <Glow at={[gx - 40, g2 - 110]} r={110} color="#fff3d6" a={0.55} />
        <rect x={gx - 70} y={g2 - 60} width={140} height={10} fill="#5a5a62" />
        <rect x={gx - 30} y={g2 - 90} width={56} height={34} rx={3} fill="#d8d8dc" stroke="#000" strokeWidth={2} />
        <Hero x={gx - 90} y={g2} s={0.42} pose={{ ...POSES.sit(60), head: 10, hN: [70, 10], hF: [60, 14] }} look={HERO} shadow={0} />
        {Array.from({ length: 4 }, (_, i) => <rect key={i} x={gx + 70 + (i % 2) * 34} y={g2 - 34 - Math.floor(i / 2) * 30} width={32} height={30} fill="#7a6a4a" stroke="#000" strokeWidth={1.5} />)}
      </g>
      <Count x={1030} y={L2[0] + 58} t="DAY 1,000" c={GOLD} />
      <Punch l1="He didn't wait for an office." l2="He started in a garage." />
    </g>
  );
};

// ================================================================ 2 · a $1 lemonade stand lights up America
const F2: React.FC = () => {
  const lie: Pose = { ...POSES.lie(), head: -20, hN: [60, -40], hF: [50, -30] };
  const mx = 300, my = L2[0] + 150, mw = 700, mh = 430;
  const map = USA.map(([x, y]) => [mx + x * mw, my + y * mh] as V);
  const dots = Array.from({ length: 420 }, (_, i) => [rnd(i) , rnd(i + 500)] as V).filter((p) => inside(p, USA)).slice(0, 140);
  return (
    <g>
      <Lane y0={L1[0]} y1={L1[1]} label="Dreams of a million" id="l1" hills={false} />
      <path d={`M300 ${g1 - 40} h460 v-60 q0 -30 -30 -30 h-400 q-30 0 -30 30 Z`} fill="#3a3a40" stroke="#000" strokeWidth={3} />
      <Hero x={600} y={g1 - 80} s={S} pose={lie} look={GREY} shadow={0} />
      <Glow at={[520, g1 - 220]} r={70} color="#8fb4ff" a={0.5} />
      <g transform={`translate(560 ${L1[0] + 210})`}>
        <ellipse cx={0} cy={0} rx={210} ry={70} fill="#fff" />
        <circle cx={-90} cy={90} r={14} fill="#fff" /><circle cx={-60} cy={120} r={8} fill="#fff" />
        <text x={0} y={16} textAnchor="middle" fontFamily={BIG} fontSize={48} fill="#1a1a1a">$1,000,000</text>
      </g>
      <Count x={1030} y={L1[0] + 58} t="SOLD: 0" c="#6a6a72" />
      <Lane y0={L2[0]} y1={L2[1]} label="Sells lemonade for $1" bright id="l2" hills={false} />
      {/* the stand where it began */}
      <rect x={70} y={g2 - 120} width={170} height={120} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} />
      <rect x={60} y={g2 - 200} width={190} height={50} rx={4} fill="#f2f2f2" stroke="#000" strokeWidth={3} />
      <text x={155} y={g2 - 166} textAnchor="middle" fontFamily={BIG} fontSize={22} fill="#1a1a1a">LEMONADE $1</text>
      {[0, 1, 2].map((i) => <rect key={i} x={95 + i * 40} y={g2 - 150} width={22} height={30} fill="#f2e2a0" stroke="#000" strokeWidth={1.5} />)}
      <Hero x={270} y={g2} s={0.42} pose={{ ...POSES.wave(3), head: -6 }} look={HERO} />
      {/* ...and where it went: stores lit coast to coast */}
      <path d={`M${map.map((p) => p.join(" ")).join(" L")} Z`} fill="#141418" stroke="#8a8a92" strokeWidth={3} />
      {dots.map(([x, y], i) => <g key={i}><circle cx={mx + x * mw} cy={my + y * mh} r={7} fill={GOLD} opacity={0.18} /><circle cx={mx + x * mw} cy={my + y * mh} r={2.6} fill={GOLD} /></g>)}
      <Glow at={[mx + mw * 0.5, my + mh * 0.5]} r={420} color={GOLD} a={0.22} />
      <path d={`M240 ${g2 - 120} Q300 ${my + mh + 20} ${mx + 0.62 * mw} ${my + 0.72 * mh}`} fill="none" stroke={GOLD} strokeWidth={3} strokeDasharray="8 10" />
      <Count x={1030} y={L2[0] + 58} t="STORES: 312" c={GOLD} />
      <Punch l1="Everyone wants a million." l2="He started with a dollar." />
    </g>
  );
};

// ================================================================ 3 · "too small" → the stadium says his name
const F3: React.FC = () => {
  const bench: Pose = { ...POSES.sit(80), lean: 24, head: 34, hN: [40, 60], hF: [30, 66] };
  const leap: Pose = { hip: [0, -170], lean: -14, head: -26, hN: [40, -150], hF: [-10, -150], fN: [40, -60], fF: [-60, -10], elbow: 1 };
  const lx = 640, ly = g2 - 170;
  return (
    <g>
      <Lane y0={L1[0]} y1={L1[1]} label="Was told “too small”" id="f1" hills={false} />
      {Array.from({ length: 6 }, (_, i) => <line key={i} x1={24} y1={g1 - 20 - i * 6} x2={1056} y2={g1 - 20 - i * 6} stroke="#2a2a30" strokeWidth={1} />)}
      <rect x={260} y={g1 - 90} width={360} height={16} rx={4} fill="url(#sh-grey)" stroke="#000" strokeWidth={2} />
      <Hero x={420} y={g1} s={0.56} pose={bench} look={GREY} />
      <Hero x={780} y={g1} s={0.74} pose={{ ...POSES.point(), hN: [120, -30], head: -10 }} flip look={{ ...GREY, body: "#7a7a82" }} />
      <Say x={760} y={L1[0] + 180} t="Too small, kid." />
      <Count x={1030} y={L1[0] + 58} t="CUT" c={RED} />
      <Lane y0={L2[0]} y1={L2[1]} label="Trained anyway" bright id="f2" stars={false} hills={false} />
      <defs><clipPath id="st2"><rect x={24} y={L2[0]} width={1032} height={L2[1] - L2[0]} rx={14} /></clipPath></defs>
      <g clipPath="url(#st2)">
        {/* stadium: stands full of phone flashes, floodlights, the goalpost */}
        <path d={`M24 ${L2[0] + 120} Q540 ${L2[0] + 40} 1056 ${L2[0] + 120} V${g2 - 140} H24 Z`} fill="#16161a" />
        {Array.from({ length: 260 }, (_, i) => <circle key={i} cx={30 + rnd(i) * 1020} cy={L2[0] + 110 + rnd(i + 300) * (g2 - L2[0] - 260)} r={rnd(i + 7) < 0.15 ? 3 : 1.6} fill={rnd(i + 7) < 0.15 ? "#fff" : "#4a4a52"} opacity={rnd(i + 7) < 0.15 ? 0.9 : 0.8} />)}
        {[120, 960].map((x) => <g key={x}><rect x={x - 50} y={L2[0] + 30} width={100} height={40} fill="#f2f2f2" /><Glow at={[x, L2[0] + 50]} r={160} color="#ffffff" a={0.6} /></g>)}
        <rect x={24} y={g2 - 140} width={1032} height={250} fill="#1c241c" />
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={60 + i * 190} y1={g2 - 140} x2={30 + i * 200} y2={g2 + 110} stroke="#f2f2f2" strokeWidth={3} opacity={0.4} />)}
        <path d={`M860 ${g2} V${g2 - 180} M800 ${g2 - 180} H920 M800 ${g2 - 180} V${g2 - 360} M920 ${g2 - 180} V${g2 - 360}`} stroke={GOLD} strokeWidth={10} fill="none" />
        <Glow at={[lx, ly - 140]} r={280} color={GOLD} a={0.45} />
        <Hero x={lx} y={ly} s={0.62} pose={leap} look={HERO} />
        <ellipse cx={lx + 6} cy={ly - 290} rx={26} ry={16} fill="#8a5a3a" stroke="#000" strokeWidth={2.5} transform={`rotate(-30 ${lx + 6} ${ly - 290})`} />
        {Array.from({ length: 30 }, (_, i) => <rect key={i} x={rnd(i + 40) * 1056} y={L2[0] + rnd(i + 80) * 500} width={8} height={14} fill={i % 3 ? "#f2f2f2" : GOLD} transform={`rotate(${rnd(i) * 180} ${rnd(i + 40) * 1056} ${L2[0] + rnd(i + 80) * 500})`} opacity={0.8} />)}
      </g>
      <rect x={300} y={L2[0] + 80} width={480} height={70} rx={8} fill="#0b0b0d" stroke={GOLD} strokeWidth={3} />
      <text x={540} y={L2[0] + 128} textAnchor="middle" fontFamily={BIG} fontSize={38} fill={GOLD}>TOUCHDOWN!</text>
      <rect x={30} y={L2[0] + 6} width={1020} height={74} fill="#000" opacity={0.55} />
      <text x={56} y={L2[0] + 58} fontFamily={SANS} fontWeight={700} fontSize={40} fill="#f2f2f2">Trained anyway</text>
      <Count x={1030} y={L2[0] + 58} t="70,000" c={GOLD} />
      <Punch l1="They said he was too small." l2="Now a stadium says his name." />
    </g>
  );
};

// ================================================================ 4 · FINALE: he hands Mom the keys
const MOM: HeroLook = { ...GREY, body: "#cfcfd4", far: "#a8a8b0", eyeColor: "#1a1a1e", eyes: "side" };
const F4: React.FC = () => {
  const G = 1500, hx = 420, mx = 640;
  const give: Pose = { ...POSES.stand(), head: 8, hN: [86, 10], hF: [-10, 120] };
  const gj = J(hx, G, give, false, 0.8);
  const mom: Pose = { ...POSES.stand(), head: 14, hN: [40, -110], hF: [30, -104], elbow: -1 };
  const mj = J(mx, G, mom, true, 0.74);
  return (
    <g>
      <defs><linearGradient id="fsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#040406" /><stop offset="1" stopColor="#1c1a16" /></linearGradient></defs>
      <rect x={0} y={0} width={1080} height={1920} fill="url(#fsky)" />
      {Array.from({ length: 80 }, (_, i) => <circle key={i} cx={rnd(i) * 1080} cy={rnd(i + 80) * 500 + 60} r={0.8 + rnd(i * 3) * 1.8} fill="#fff" opacity={0.3 + rnd(i * 7) * 0.5} />)}
      {/* the memory: the old kitchen, a PAST DUE notice — a polaroid in the sky */}
      <g transform="rotate(-6 250 330)">
        <rect x={110} y={200} width={280} height={260} fill="#e8e8ec" stroke="#000" strokeWidth={3} />
        <rect x={126} y={216} width={248} height={190} fill="#1a1a1e" />
        <rect x={150} y={330} width={200} height={10} fill="#5a5a62" />
        <circle cx={220} cy={300} r={16} fill="#8a8a92" /><rect x={208} y={314} width={24} height={40} rx={8} fill="#8a8a92" />
        <g transform="rotate(8 300 290)"><rect x={262} y={250} width={90} height={60} fill="#f2f2f2" /><text x={307} y={288} textAnchor="middle" fontFamily={BIG} fontSize={14} fill={RED}>PAST DUE</text></g>
        <text x={250} y={440} textAnchor="middle" fontFamily="'Segoe Print', cursive" fontSize={22} fill="#1a1a1e">2009</text>
      </g>
      <Glow at={[540, 980]} r={520} color={GOLD} a={0.3} />
      <House x={560} g={G} w={620} h={320} lit={1} big />
      <Mailbox x={940} g={G} name="MOM" />
      <rect x={0} y={G} width={1080} height={420} fill="#0b0b0d" />
      <line x1={0} y1={G} x2={1080} y2={G} stroke="#5a5a62" strokeWidth={3} />
      <Hero x={hx} y={G} s={0.8} pose={give} look={HERO} />
      <Hero x={mx} y={G} s={0.74} pose={mom} flip look={MOM} behind={(j) => <circle cx={j.head[0] - 24} cy={j.head[1] - 18} r={16} fill="#a8a8b0" stroke="#0b0b0d" strokeWidth={3} />} />
      {/* the keys, between them */}
      <Glow at={[gj.wN[0] + 20, gj.wN[1]]} r={90} color={GOLD} a={0.8} />
      <circle cx={gj.wN[0] + 14} cy={gj.wN[1] + 4} r={12} fill="none" stroke={GOLD} strokeWidth={5} />
      <path d={`M${gj.wN[0] + 26} ${gj.wN[1] + 4} h34 v10 m-12 -10 v8`} stroke={GOLD} strokeWidth={6} fill="none" />
      {[0, 1].map((i) => <path key={i} d={`M${mj.head[0] - 30 + i * 12} ${mj.head[1] + 20 + i * 10} q-4 8 0 14`} stroke="#d8d8dc" strokeWidth={3} fill="none" />)}
      <Punch l1="46 NOs. 1 garage. 1 dollar." l2="1 house for Mom." y={1690} />
    </g>
  );
};

const FRAMES = [F0, F1, F2, F3, F4];
export const UsaFrames: React.FC = () => {
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
