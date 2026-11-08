// "I'LL START TOMORROW" v5 style frames: one person, one room, a DIFFERENT object per vignette (like SAME HOURS):
// laptop, dumbbell, dollar jar, book. Black & white + gold accent only. Top lane = Tomorrow (buys it, tries once, quits; the object
// turns into something else: a dusty corner piece, a clothes rack, a coaster), bottom lane = Today (it hurts, keeps going).
// 0 DAY 365 hook (same room, transformed) · 1 DAY 1 everyone starts · 2 laptop · 3 dumbbell · 4 dollar jar · 5 book · 6 your move
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { V, rng } from "../../kit/core";
import { HIP_H, Hero, POSES, Pose } from "../../kit/hero";
import { KitDefs, Vignette } from "../../kit/materials";
import { Glow } from "../../kit/fx";
import { BOLD, Defs, GOLD, SANS } from "../samehours/StyleFrames";
import { GB, GT, J, Punch, S, reach } from "../beatyesterday/StyleFrames";
import { Bed, Breath, COLD, Calendar, Center, Clock, F4, LaneLabel, Medals, Mood, Nightstand, NoteWall, Note, Sweat, Wall, Window, lieSlam } from "./StyleFrames";

export const TOMORROW_OBJ_FRAMES = 7;
const W = "#f2f2f2", CARD = "#8e8a84";

// ---------------------------------------------------------------- objects
/** a laptop seen from the side-front; screen: "next" = streaming autoplay countdown, "course" = a lesson with a gold progress bar */
const Laptop: React.FC<{ x: number; y: number; screen: "next" | "course" | "off"; p?: number; s?: number; dusty?: boolean }> = ({ x, y, screen, p = 0.5, s = 1, dusty }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-150 0 L150 0 L170 16 L-170 16 Z" fill="#5a5a5e" stroke="#000" strokeWidth={3} />
    <rect x={-140} y={-190} width={280} height={186} rx={10} fill="#1a1a1c" stroke="#000" strokeWidth={4} />
    <rect x={-128} y={-178} width={256} height={162} rx={4} fill={screen === "course" ? "#e8e8ec" : screen === "next" ? "#0c0c0e" : "#141416"} />
    {screen === "next" && <>
      <Glow at={[0, -100]} r={160} color="#ffffff" a={0.35} />
      <path d="M-22 -128 L30 -98 L-22 -68 Z" fill="#f2f2f2" />
      <text x={0} y={-36} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={18} fill="#cfcfd4">Next episode in 5</text>
      <rect x={-100} y={-28} width={200} height={6} rx={3} fill="#3a3a3e" /><rect x={-100} y={-28} width={160} height={6} rx={3} fill="#f2f2f2" />
    </>}
    {screen === "course" && <>
      <text x={-112} y={-150} fontFamily={SANS} fontWeight={800} fontSize={18} fill="#1a1a1a">LESSON {Math.round(1 + p * 59)} / 60</text>
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={-112} y={-136 + i * 18} width={[180, 140, 200, 120, 160][i]} height={8} rx={4} fill="#9a9aa2" />)}
      <rect x={-112} y={-38} width={224} height={14} rx={7} fill="#cfcfd4" stroke="#000" strokeWidth={1.5} />
      <rect x={-112} y={-38} width={224 * p} height={14} rx={7} fill={GOLD} />
    </>}
    {dusty && Array.from({ length: 18 }, (_, i) => <circle key={i} cx={-130 + ((i * 41) % 260)} cy={-190 + (i % 2) * 3} r={3} fill="#bdb8ae" opacity={0.8} />)}
  </g>
);
export const HeldWeight: React.FC<{ at: V; size: number; kg: string; gold?: boolean }> = ({ at, size, kg, gold }) => (
  <g transform={`translate(${at[0]} ${at[1]})`}>
    <rect x={-size * 0.9} y={-5} width={size * 1.8} height={10} fill="#9a9aa2" stroke="#000" strokeWidth={2} />
    <rect x={-size * 1.25} y={-size * 0.45} width={size * 0.4} height={size * 0.9} rx={5} fill={gold ? "url(#sh-gold)" : "#3a3a3e"} stroke="#000" strokeWidth={3} />
    <rect x={size * 0.85} y={-size * 0.45} width={size * 0.4} height={size * 0.9} rx={5} fill={gold ? "url(#sh-gold)" : "#3a3a3e"} stroke="#000" strokeWidth={3} />
    <text x={0} y={-size * 0.6} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={Math.max(20, size * 0.5)} fill={gold ? GOLD : "#e8e8ec"}>{kg}</text>
  </g>
);
export const Cobweb: React.FC<{ x: number; y: number; r?: number; flip?: boolean }> = ({ x, y, r = 90, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`} opacity={0.7}>
    {[0, 25, 50, 75, 90].map((a) => <line key={a} x1={0} y1={0} x2={Math.cos((a * Math.PI) / 180) * r} y2={Math.sin((a * Math.PI) / 180) * r} stroke="#cfcfd4" strokeWidth={1.5} />)}
    {[0.35, 0.6, 0.85].map((k) => <path key={k} d={`M${r * k} 0 Q${r * k * 0.8} ${r * k * 0.5} ${r * k * 0.7} ${r * k * 0.7} Q${r * k * 0.4} ${r * k * 0.85} 0 ${r * k}`} fill="none" stroke="#cfcfd4" strokeWidth={1.5} />)}
  </g>
);
export const Dumbbell: React.FC<{ x: number; g: number; s?: number; kg?: string }> = ({ x, g, s = 1, kg }) => (
  <g transform={`translate(${x} ${g}) scale(${s})`}>
    {kg && <text x={0} y={-56} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={26} fill="#cfcfd4">{kg}</text>}
    <rect x={-60} y={-22} width={120} height={14} fill="#9a9aa2" stroke="#000" strokeWidth={2} />
    <rect x={-84} y={-46} width={30} height={46} rx={6} fill="#3a3a3e" stroke="#000" strokeWidth={3} />
    <rect x={54} y={-46} width={30} height={46} rx={6} fill="#3a3a3e" stroke="#000" strokeWidth={3} />
  </g>
);
/** clothes thrown over the dumbbell: it became a clothes rack */
const Clothes: React.FC<{ x: number; g: number }> = ({ x, g }) => (
  <g>
    <path d={`M${x - 100} ${g - 4} Q${x - 80} ${g - 70} ${x - 20} ${g - 60} L${x + 20} ${g - 66} Q${x + 70} ${g - 74} ${x + 96} ${g - 2} Z`} fill="#5a5a5e" stroke="#000" strokeWidth={3} />
    <path d={`M${x - 60} ${g - 58} q30 -26 70 -10 l40 -6 q20 10 10 30 l-30 30 l-80 0 Z`} fill="#8a8a8e" stroke="#000" strokeWidth={3} />
    <path d={`M${x + 30} ${g - 64} l40 70`} stroke="#3a3a3e" strokeWidth={10} strokeLinecap="round" />
  </g>
);
const Box: React.FC<{ x: number; y: number; w?: number; h?: number; open?: boolean }> = ({ x, y, w = 130, h = 90, open }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={CARD} stroke="#000" strokeWidth={3} />
    <rect x={x + w / 2 - 8} y={y} width={16} height={h} fill="#b5b0a8" opacity={0.8} />
    <path d={`M${x + 20} ${y + h - 26} q${w / 2 - 20} 16 ${w - 40} 0`} fill="none" stroke="#2a2a2a" strokeWidth={4} />
    <path d={`M${x + w - 26} ${y + h - 32} l6 6 l-8 4`} fill="none" stroke="#2a2a2a" strokeWidth={4} />
    {open && <><path d={`M${x} ${y} l-30 -40 l${w / 2} 0 l30 40 Z`} fill="#a8a49c" stroke="#000" strokeWidth={3} /><path d={`M${x + w} ${y} l30 -40 l${-w / 2} 0 l-30 40 Z`} fill="#a8a49c" stroke="#000" strokeWidth={3} /></>}
  </g>
);
const BoxPile: React.FC<{ x: number; g: number; n: number }> = ({ x, g, n }) => {
  const R = rng(n + 3);
  const spots: [number, number, number, number][] = [];
  for (let i = 0; i < n; i++) { const row = Math.floor(i / 3), col = i % 3; spots.push([x + col * 120 + (row % 2) * 50 + R() * 10, g - (row + 1) * 84, 110 + R() * 30, 80 + R() * 10]); }
  return <g>{spots.map(([bx, by, w, h], i) => <Box key={i} x={bx} y={by} w={w} h={h} />)}</g>;
};
/** a one-dollar bill (greyscale paper, the "$" in the gold accent) */
export const Bill: React.FC<{ x: number; y: number; r?: number; s?: number }> = ({ x, y, r = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-44} y={-20} width={88} height={40} rx={3} fill="#d9dcd3" stroke="#3a3a3e" strokeWidth={2} />
    <rect x={-38} y={-14} width={76} height={28} rx={2} fill="none" stroke="#8a8c84" strokeWidth={1.5} />
    <ellipse cx={0} cy={0} rx={12} ry={11} fill="#c4c8be" stroke="#8a8c84" strokeWidth={1.5} />
    <text x={-30} y={-2} fontFamily={SANS} fontWeight={800} fontSize={11} fill="#3a3a3e">1</text>
    <text x={30} y={12} textAnchor="end" fontFamily={SANS} fontWeight={800} fontSize={11} fill="#3a3a3e">1</text>
    <text x={0} y={6} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={16} fill={GOLD}>$</text>
  </g>
);
/** a savings jar filling with folded dollar bills */
export const Jar: React.FC<{ x: number; g: number; fill: number; dusty?: boolean }> = ({ x, g, fill, dusty }) => {
  const w = 150, h = 200, R = rng(7), n = Math.round(fill * 30);
  const id = `jar${x}${g}`;
  return (
    <g>
      <defs><clipPath id={id}><rect x={x - w / 2 + 6} y={g - h + 30} width={w - 12} height={h - 36} rx={18} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>{Array.from({ length: n }, (_, i) => <Bill key={i} x={x - 40 + R() * 80} y={g - 20 - (i / 30) * (h - 50) - R() * 10} r={R() * 70 - 35} s={0.8} />)}</g>
      {fill > 0.3 && <Glow at={[x, g - h * fill * 0.5]} r={120} color={GOLD} a={0.18} />}
      <rect x={x - w / 2} y={g - h + 24} width={w} height={h - 24} rx={22} fill="#ffffff" opacity={0.05} stroke="#d6dae2" strokeWidth={5} />
      <rect x={x - w / 2 + 18} y={g - h} width={w - 36} height={30} rx={6} fill="#4a4a4e" stroke="#000" strokeWidth={3} />
      <rect x={x - 30} y={g - h + 10} width={60} height={8} fill="#000" />
      <path d={`M${x - w / 2 + 20} ${g - h + 60} v${h - 100}`} stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={0.3} />
      {dusty && Array.from({ length: 14 }, (_, i) => <circle key={i} cx={x - 60 + ((i * 41) % 120)} cy={g - h - 2 + (i % 3) * 3} r={3} fill="#bdb8ae" opacity={0.8} />)}
    </g>
  );
};
const Table: React.FC<{ x0: number; x1: number; g: number; h?: number }> = ({ x0, x1, g, h = 170 }) => (
  <g>
    <rect x={x0} y={g - h} width={x1 - x0} height={20} rx={4} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} />
    <path d={`M${x0 + 20} ${g - h + 20} V${g} M${x1 - 20} ${g - h + 20} V${g}`} stroke="#4b4b52" strokeWidth={12} />
  </g>
);
export const BookFlat: React.FC<{ x: number; y: number; w?: number; t?: number; gold?: boolean }> = ({ x, y, w = 150, t = 26, gold }) => (
  <g>
    <rect x={x} y={y - t} width={w} height={t} rx={3} fill={gold ? "url(#sh-gold)" : "#d8d8dc"} stroke="#000" strokeWidth={2.5} />
    <rect x={x + w - 14} y={y - t + 3} width={10} height={t - 6} fill="#f2f2f2" />
  </g>
);
export const Mug: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <rect x={x - 30} y={y - 70} width={60} height={70} rx={8} fill="#cfcfd4" stroke="#000" strokeWidth={3} />
    <path d={`M${x + 30} ${y - 54} q28 4 22 26 q-4 14 -22 12`} fill="none" stroke="#000" strokeWidth={6} />
    <path d={`M${x + 30} ${y - 54} q28 4 22 26 q-4 14 -22 12`} fill="none" stroke="#cfcfd4" strokeWidth={3} />
    {[0, 1].map((i) => <path key={i} d={`M${x - 12 + i * 20} ${y - 80} q-10 -16 0 -32 q10 -16 0 -30`} fill="none" stroke="#9a9aa2" strokeWidth={3} opacity={0.6} />)}
    <circle cx={x - 26} cy={y + 2} r={34} fill="none" stroke="#5a4a3a" strokeWidth={3} opacity={0.5} />
  </g>
);
const Tally: React.FC<{ x: number; y: number; n: number }> = ({ x, y, n }) => (
  <g>
    <rect x={x - 16} y={y - 16} width={330} height={190} rx={6} fill="#e8e8ec" stroke="#000" strokeWidth={3} />
    {Array.from({ length: Math.ceil(n / 5) }, (_, gi) => {
      const gx = x + (gi % 5) * 62, gy = y + Math.floor(gi / 5) * 56, k = Math.min(5, n - gi * 5);
      return <g key={gi}>{Array.from({ length: Math.min(4, k) }, (_, i) => <line key={i} x1={gx + i * 10} y1={gy} x2={gx + i * 10} y2={gy + 40} stroke="#1a1a1a" strokeWidth={4} />)}{k === 5 && <line x1={gx - 6} y1={gy + 34} x2={gx + 38} y2={gy + 6} stroke="#1a1a1a" strokeWidth={4} />}</g>;
    })}
  </g>
);
const Bags: React.FC<{ x: number; g: number }> = ({ x, g }) => (
  <g>
    {[[0, 140, 120], [110, 120, 150], [210, 130, 110]].map(([dx, w, h], i) => (
      <g key={i}>
        <path d={`M${x + dx} ${g} l10 ${-h} h${w - 20} l10 ${h} Z`} fill={i === 1 ? "#d8d8dc" : "#9a9aa2"} stroke="#000" strokeWidth={3} />
        <path d={`M${x + dx + w * 0.3} ${g - h} q${w * 0.2} -40 ${w * 0.4} 0`} fill="none" stroke="#000" strokeWidth={4} />
        <text x={x + dx + w / 2} y={g - h / 2} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={20} fill="#1a1a1a">{["SHOP", "NEW", "SALE"][i]}</text>
      </g>
    ))}
  </g>
);

// ---------------------------------------------------------------- poses
/** a biceps curl: near forearm up, weight at the shoulder, far arm hanging */
export const curl = (x: number, g: number): Pose => ({ ...POSES.stand(), lean: -6, head: 10, hN: [44, -14], hF: [-10, 132], elbow: -1 });
/** an overhead press, both arms up, knees soft */
export const press = (x: number, g: number): Pose => ({ ...POSES.stand(), hip: [0, -HIP_H + 10], lean: -4, head: -16, hN: [24, -120], hF: [-20, -116], elbow: -1, fN: [34, 0], fF: [-34, 0] });
export const Shake: React.FC<{ at: V }> = ({ at }) => (
  <g>{[0, 1].map((i) => <path key={i} d={`M${at[0] - 70 - i * 14} ${at[1] - 10 + i * 18} q-8 8 0 16 q8 8 0 16`} fill="none" stroke="#bdbdc4" strokeWidth={3} />)}{[0, 1].map((i) => <path key={i} d={`M${at[0] + 70 + i * 14} ${at[1] - 10 + i * 18} q8 8 0 16 q-8 8 0 16`} fill="none" stroke="#bdbdc4" strokeWidth={3} />)}</g>
);

const Sofa: React.FC<{ x: number; g: number }> = ({ x, g }) => (
  <g>
    <rect x={x} y={g - 96} width={330} height={70} rx={14} fill="#333336" stroke="#000" strokeWidth={3} />
    <rect x={x} y={g - 186} width={330} height={96} rx={14} fill="#2c2c30" stroke="#000" strokeWidth={3} />
    <rect x={x - 18} y={g - 136} width={40} height={110} rx={12} fill="#333336" stroke="#000" strokeWidth={3} />
    <rect x={x + 10} y={g - 26} width={14} height={26} fill="#2c2c30" /><rect x={x + 306} y={g - 26} width={14} height={26} fill="#2c2c30" />
  </g>
);
const PhoneLight: React.FC<{ at: V }> = ({ at }) => (
  <g><Glow at={[at[0], at[1] + 30]} r={150} color="#ffffff" a={0.4} /><rect x={at[0] - 16} y={at[1] - 30} width={32} height={50} rx={6} fill="#e8e8ec" stroke="#000" strokeWidth={3} /></g>
);
const Lanes: React.FC<{ center: string; warmCx?: number; coldCx?: number }> = ({ center, warmCx = 540, coldCx = 540 }) => (
  <g>
    <Wall y0={120} g={GT} /><Mood y0={120} g={GT} cx={coldCx} />
    <Center t={center} />
    <Wall y0={1000} g={GB} warm /><Mood y0={1000} g={GB} warm cx={warmCx} />
  </g>
);
const Labels: React.FC = () => <><LaneLabel y={190} t="Tomorrow" /><LaneLabel y={1062} t="Today" warm /></>;

// ================================================================ 0 · DAY 365: the same room, transformed
const H0: React.FC = () => {
  const BX = 340, BTOP = GT - 110, alarm: V = [640, GT - 168];
  const marks: ("x" | "o" | "")[] = Array.from({ length: 35 }, () => "x");
  const pr = press(300, GB), pj = J(300, GB, pr);
  return (
    <g>
      <Lanes center="DAY 365" coldCx={420} warmCx={420} />
      <NoteWall x0={640} y0={270} w={380} h={280} n={24} old />
      <Bed x0={80} x1={560} g={GT} head="right" />
      <Laptop x={250} y={GT - 112} screen="next" s={0.45} />
      <Nightstand x={640} g={GT} />
      <Clock x={alarm[0]} y={alarm[1] + 20} t="9:47" ring />
      <Hero x={BX} y={BTOP} s={S} pose={lieSlam(BX, BTOP, [alarm[0] - 10, alarm[1] - 10])} flip look={COLD} shadow={0} />
      <path d={`M120 ${BTOP - 20} Q300 ${BTOP - 70} 470 ${BTOP - 30} L470 ${BTOP + 4} L120 ${BTOP + 4} Z`} fill="#3a3a3e" stroke="#000" strokeWidth={3} />
      <Clothes x={790} g={GT} />
      <Dumbbell x={790} g={GT} s={0.9} />
      <Jar x={950} g={GT - 24} fill={0.03} dusty />
      <Cobweb x={1075} y={125} r={120} flip />

      <Window x={470} y={1090} kind="dawn" w={170} h={170} />
      <Calendar x={690} y={1090} marks={marks} title="DAY 365" s={0.9} />
      <Medals x={100} y={1110} n={4} />
      <Glow at={[pj.wN[0], pj.wN[1]]} r={240} color={GOLD} a={0.3} />
      <Hero x={300} y={GB} s={S} pose={pr} look={BOLD} />
      <HeldWeight at={[(pj.wN[0] + pj.wF[0]) / 2, (pj.wN[1] + pj.wF[1]) / 2]} size={46} kg="20 kg" gold />
      <Jar x={520} g={GB - 24} fill={1} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <BookFlat key={i} x={640} y={GB - 24 - i * 28} gold={i === 6} />)}
      <Table x0={810} x1={1040} g={GB - 24} h={150} />
      <Laptop x={925} y={GB - 174} screen="course" p={1} s={0.62} />

      <Labels />
      <text x={540} y={1840} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={66} fill={W}>Same person. Same room.</text>
    </g>
  );
};

// ================================================================ 1 · DAY 1: everyone starts
const H1: React.FC = () => {
  const lift = reach({ ...POSES.stand(), head: -20, lean: -6 }, 360, GT, [430, GT - 400], [300, GT - 380]);
  const lj = J(360, GT, lift);
  const c = curl(480, GB), cj = J(480, GB, c);
  return (
    <g>
      <Lanes center="DAY 1" coldCx={420} warmCx={480} />
      {/* he buys EVERYTHING on day 1 */}
      <Bags x={560} g={GT - 24} />
      <Laptop x={900} y={GT - 24} screen="off" s={0.5} />
      <Note x={880} y={GT - 190} t="NEW ME!" r={6} s={1.1} />
      <Dumbbell x={200} g={GT - 24} s={0.9} kg="20 kg" />
      <Hero x={360} y={GT} s={S} pose={lift} look={COLD} />
      <Box x={lj.wN[0] - 50} y={lj.wN[1] - 70} w={110} h={70} open />

      {/* day 1, one small thing: the lightest weight, and it is still hard */}
      <Tally x={700} y={1110} n={5} />
      <Hero x={480} y={GB} s={S} pose={c} look={BOLD} />
      <HeldWeight at={cj.wN} size={22} kg="2 kg" />
      <Sweat at={cj.head} n={3} /><Breath at={[cj.head[0] + 10, cj.head[1] + 10]} />
      <Shake at={[cj.wN[0], cj.wN[1] + 10]} />

      <Labels />
      <Punch l1="Day 1." l2="Everyone starts." />
    </g>
  );
};

// ================================================================ 2 · the laptop
const H2: React.FC = () => {
  const watch: Pose = { ...POSES.sit(101), lean: -16, head: 6, hN: [60, 50], hF: [50, 60] };
  const type = reach({ ...POSES.sit(118), lean: 18, head: 22 }, 300, GB, [520, GB - 196], [500, GB - 192]);
  return (
    <g>
      <Lanes center="DAY 14" coldCx={460} warmCx={460} />
      <Sofa x={180} g={GT - 24} />
      <Hero x={300} y={GT - 24} s={S} pose={watch} look={COLD} shadow={0} />
      <Table x0={600} x1={900} g={GT - 24} h={120} />
      <Laptop x={750} y={GT - 144} screen="next" s={0.9} />
      {[0, 1, 2].map((i) => <rect key={i} x={620 + i * 46} y={GT - 168} width={30} height={22} rx={4} fill="#5a5a5e" stroke="#000" strokeWidth={2} />)}

      <Table x0={380} x1={760} g={GB - 24} h={170} />
      <Laptop x={570} y={GB - 194} screen="course" p={0.23} s={0.9} />
      <path d={`M${740} ${GB - 194} l-20 -150 l-80 -36`} fill="none" stroke="#5a5a62" strokeWidth={8} strokeLinecap="round" />
      <rect x={180} y={GB - 142} width={110} height={18} rx={4} fill="#4b4b52" /><path d={`M190 ${GB - 124} V${GB - 24} M280 ${GB - 124} V${GB - 24}`} stroke="#4b4b52" strokeWidth={10} />
      <Hero x={300} y={GB} s={S} pose={type} look={BOLD} />

      <Labels />
      <Punch l1="Same laptop." l2="Different screen." />
    </g>
  );
};

// ================================================================ 3 · the dumbbell
const H3: React.FC = () => {
  const pr = press(470, GB), j = J(470, GB, pr);
  const walkSnack = reach({ ...POSES.stand(), head: 18 }, 380, GT, [430, GT - 250], undefined);
  const wj = J(380, GT, walkSnack);
  return (
    <g>
      <Lanes center="DAY 60" coldCx={600} warmCx={480} />
      <Clothes x={700} g={GT - 24} />
      <Dumbbell x={700} g={GT - 24} />
      <Hero x={380} y={GT} s={S} pose={walkSnack} look={COLD} />
      <path d={`M${wj.wN[0] - 10} ${wj.wN[1] - 30} l40 0 l-6 60 l-28 0 Z`} fill="#9a9aa2" stroke="#000" strokeWidth={3} />
      <text x={wj.wN[0] + 10} y={wj.wN[1] + 4} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={13} fill="#1a1a1a">CHIPS</text>

      <Tally x={660} y={1100} n={60} />
      <Dumbbell x={220} g={GB - 24} s={0.7} kg="2 kg" />
      <Hero x={470} y={GB} s={S} pose={pr} look={BOLD} />
      <HeldWeight at={[(j.wN[0] + j.wF[0]) / 2, (j.wN[1] + j.wF[1]) / 2]} size={46} kg="20 kg" />
      <Sweat at={j.head} n={4} /><Breath at={[j.head[0] + 10, j.head[1] + 10]} />
      <Shake at={[(j.wN[0] + j.wF[0]) / 2, (j.wN[1] + j.wF[1]) / 2 + 30]} />

      <Labels />
      <Punch l1="Same dumbbell." l2="Different use." />
    </g>
  );
};

// ================================================================ 4 · the savings jar
const H4: React.FC = () => {
  const open = reach({ ...POSES.crouch(), head: 30 }, 460, GT, [560, GT - 110], [530, GT - 100]);
  const drop = reach({ ...POSES.stand(), head: 24 }, 420, GB, [535, GB - 400]);
  const dj = J(420, GB, drop);
  return (
    <g>
      <Lanes center="DAY 150" coldCx={600} warmCx={520} />
      <BoxPile x={640} g={GT - 24} n={7} />
      <Box x={520} y={GT - 24 - 90} w={130} h={90} open />
      <Hero x={460} y={GT} s={S} pose={open} look={COLD} />
      <Table x0={90} x1={330} g={GT - 24} h={150} />
      <Jar x={210} g={GT - 174} fill={0.03} dusty />

      <Table x0={430} x1={690} g={GB - 24} h={150} />
      <Jar x={560} g={GB - 174} fill={0.55} />
      <Bill x={dj.wN[0] + 14} y={dj.wN[1] + 18} r={-70} s={1.1} />
      <Hero x={420} y={GB} s={S} pose={drop} look={BOLD} />
      <Calendar x={760} y={1100} marks={Array.from({ length: 35 }, (_, i) => (i < 30 ? "x" : ""))} title="DAY 150" s={0.9} />

      <Labels />
      <Punch l1="$1." l2="Every single day." />
    </g>
  );
};

// ================================================================ 5 · the book
const H5: React.FC = () => {
  const phoneSit = reach({ ...POSES.sit(118), lean: 12, head: 30 }, 300, GT, [400, GT - 230], [390, GT - 220]);
  const pj = J(300, GT, phoneSit);
  const readSit = reach({ ...POSES.sit(118), lean: 26, head: 34 }, 300, GB, [430, GB - 190], [400, GB - 186]);
  return (
    <g>
      <Lanes center="DAY 300" coldCx={500} warmCx={420} />
      <Table x0={360} x1={760} g={GT - 24} h={170} />
      <BookFlat x={520} y={GT - 194} w={170} t={34} />
      <Mug x={600} y={GT - 228} />
      <rect x={180} y={GT - 142} width={110} height={18} rx={4} fill="#4b4b52" /><path d={`M190 ${GT - 124} V${GT - 24} M280 ${GT - 124} V${GT - 24}`} stroke="#4b4b52" strokeWidth={10} />
      <Hero x={300} y={GT} s={S} pose={phoneSit} look={COLD} />
      <PhoneLight at={pj.wN} />

      <Table x0={360} x1={760} g={GB - 24} h={170} />
      <path d={`M${700} ${GB - 194} l-30 -150 l-90 -40`} fill="none" stroke="#5a5a62" strokeWidth={8} strokeLinecap="round" />
      <path d={`M520 ${GB - 404} l80 -20 l20 60 Z`} fill="#3a3a42" stroke="#000" strokeWidth={3} />
      <path d={`M540 ${GB - 364} L380 ${GB - 194} L700 ${GB - 194} Z`} fill="#ffffff" opacity={0.08} />
      <path d={`M400 ${GB - 196} l70 -10 l70 10 l-70 6 Z`} fill="#f2f2f2" stroke="#000" strokeWidth={2} />
      {Array.from({ length: 11 }, (_, i) => <BookFlat key={i} x={820 + (i % 2) * 6} y={GB - 24 - i * 30} w={160} t={28} gold={i === 10} />)}
      <rect x={180} y={GB - 142} width={110} height={18} rx={4} fill="#4b4b52" /><path d={`M190 ${GB - 124} V${GB - 24} M280 ${GB - 124} V${GB - 24}`} stroke="#4b4b52" strokeWidth={10} />
      <Hero x={300} y={GB} s={S} pose={readSit} look={BOLD} />

      <Labels />
      <Punch l1="Same book." l2="One of them read it." />
    </g>
  );
};

const FRAMES = [H0, H1, H2, H3, H4, H5, F4];
export const TomorrowObjects: React.FC = () => {
  const F = FRAMES[Math.min(FRAMES.length - 1, useCurrentFrame())];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <KitDefs />
        <Defs />
        <F />
        <text x={540} y={1905} textAnchor="middle" fontFamily={SANS} fontSize={18} letterSpacing={5} fill="#ffffff" opacity={0.16}>CHANNEL NAME</text>
        <Vignette a={0.45} />
      </svg>
    </AbsoluteFill>
  );
};
