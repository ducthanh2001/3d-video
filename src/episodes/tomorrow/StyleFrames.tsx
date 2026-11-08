// "I'LL START TOMORROW" style frames (cinematic look of beatyesterday v2). Everything is a real object or a real action:
// alarm clocks, wall calendars, sticky notes, shoes, a shoebox with its tag, a finish post, a puddle, a thermometer.
// Top lane = Tomorrow (cold blue, starts hot then quits), bottom lane = Today (warm gold, struggles and keeps coming back).
// 0 DAY 365 hook · 1 DAY 1 everyone starts · 2 DAY 23 the Monday restarts vs the fall in the rain · 3 DAY 200 the sick day
// and the comeback · 4 the end: your move
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { V, rng } from "../../kit/core";
import { HIP_H, Hero, POSES, Pose, run } from "../../kit/hero";
import { KitDefs, Vignette } from "../../kit/materials";
import { Glow, Rays } from "../../kit/fx";
import { BOLD, BOLD_GREY, Defs, GOLD, SANS } from "../samehours/StyleFrames";
import { GB, GT, J, Punch, S, reach } from "../beatyesterday/StyleFrames";

export const TOMORROW_STYLE_FRAMES = 5;
// the channel style: black & white, ONE accent (gold = progress). Lanes differ by brightness, not by hue.
export const COLD = { ...BOLD_GREY, glow: 0 };
const RED = "#f2f2f2"; // (no red in this film: "alarm" digits and marks are white)
export const Mood: React.FC<{ y0: number; g: number; warm?: boolean; cx?: number }> = ({ y0, g, warm, cx = 540 }) => {
  const id = `bw${y0}`;
  return (
    <g>
      <defs><radialGradient id={id} cx={cx} cy={g - 140} r={600} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#ffffff" stopOpacity={warm ? 0.13 : 0.04} /><stop offset="1" stopColor="#ffffff" stopOpacity={0} /></radialGradient></defs>
      <rect x={0} y={y0} width={1080} height={g - y0} fill={`url(#${id})`} />
      <rect x={0} y={g} width={1080} height={5} fill={warm ? "#bdbdc4" : "#5a5a62"} />
    </g>
  );
};
export const Sweat: React.FC<{ at: V; n?: number }> = ({ at, n = 3 }) => (
  <g>{Array.from({ length: n }, (_, i) => { const x = at[0] + 30 + i * 16, y = at[1] - 20 + i * 22; return <path key={i} d={`M${x} ${y} q-8 12 0 16 q8 -4 0 -16 Z`} fill="#e8e8ec" opacity={0.9 - i * 0.2} />; })}</g>
);
export const Breath: React.FC<{ at: V }> = ({ at }) => (
  <g opacity={0.5}>{[0, 1, 2].map((i) => <circle key={i} cx={at[0] + 40 + i * 22} cy={at[1] + 14 - i * 6} r={10 + i * 6} fill="#d8d8de" opacity={0.6 - i * 0.15} />)}</g>
);
export const ICE = "#9a9aa2", W = "#f2f2f2", NOTE = "#d8d8dc", INKT = "#1a1a1a";

// ---------------------------------------------------------------- props
export const LaneLabel: React.FC<{ y: number; t: string; warm?: boolean }> = ({ y, t, warm }) => (
  <text x={540} y={y} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={50} letterSpacing={3} fill={warm ? GOLD : ICE}>{t}</text>
);
export const Center: React.FC<{ t: string }> = ({ t }) => (
  <g><rect x={380} y={920} width={320} height={64} rx={32} fill="#000" stroke="#3a3a42" strokeWidth={3} /><text x={540} y={966} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={40} fill={W}>{t}</text></g>
);
export const Wall: React.FC<{ y0: number; g: number; warm?: boolean }> = ({ y0, g, warm }) => (
  <g>
    <rect x={0} y={y0} width={1080} height={g - y0} fill={warm ? "#0e0e0e" : "#070707"} />
    <rect x={0} y={g - 24} width={1080} height={24} fill={warm ? "#1e1e1e" : "#121212"} />
  </g>
);
export const Window: React.FC<{ x: number; y: number; w?: number; h?: number; kind: "night" | "dawn" | "rain" }> = ({ x, y, w = 220, h = 240, kind }) => {
  const R = rng(x);
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={kind === "dawn" ? "#cfcfd4" : kind === "rain" ? "#141414" : "#050505"} stroke="#3a3a44" strokeWidth={6} />
      {kind === "dawn" && <circle cx={x + w * 0.55} cy={y + h * 0.75} r={50} fill="#ffffff" />}
      {kind === "night" && <circle cx={x + w * 0.75} cy={y + h * 0.25} r={18} fill="#d8d8de" />}
      {kind === "rain" && Array.from({ length: 22 }, (_, i) => { const px = x + R() * w, py = y + R() * h; return <line key={i} x1={px} y1={py} x2={px - 8} y2={py + 26} stroke="#8a8a92" strokeWidth={2} opacity={0.5} />; })}
      <path d={`M${x + w / 2} ${y} v${h} M${x} ${y + h / 2} h${w}`} stroke="#3a3a44" strokeWidth={5} />
    </g>
  );
};
export const Clock: React.FC<{ x: number; y: number; t: string; ring?: boolean; s?: number }> = ({ x, y, t, ring, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {ring && [0, 1].map((i) => <path key={i} d={`M${-70 - i * 16} -30 q-12 20 0 40 M${70 + i * 16} -30 q12 20 0 40`} fill="none" stroke={W} strokeWidth={4} opacity={0.7 - i * 0.3} />)}
    <rect x={-56} y={-40} width={112} height={64} rx={10} fill="#1c1d22" stroke="#000" strokeWidth={3} />
    <text x={0} y={6} textAnchor="middle" fontFamily='"Consolas", monospace' fontWeight={700} fontSize={36} fill={RED}>{t}</text>
  </g>
);
export const Nightstand: React.FC<{ x: number; g: number }> = ({ x, g }) => <rect x={x - 60} y={g - 130} width={120} height={130} fill="url(#sh-slab)" stroke="#000" strokeWidth={3} />;
export const Bed: React.FC<{ x0: number; x1: number; g: number; head?: "left" | "right"; blanket?: string }> = ({ x0, x1, g, head = "left", blanket = "#4a4a4e" }) => (
  <g>
    <rect x={x0} y={g - 110} width={x1 - x0} height={64} rx={12} fill="#2a2a2e" stroke="#000" strokeWidth={3} />
    <rect x={head === "left" ? x0 : x1 - 26} y={g - 240} width={26} height={240} rx={6} fill="#38383c" stroke="#000" strokeWidth={3} />
    <rect x={x0 + 10} y={g - 46} width={14} height={46} fill="#38383c" /><rect x={x1 - 24} y={g - 46} width={14} height={46} fill="#38383c" />
    <ellipse cx={head === "left" ? x0 + 80 : x1 - 80} cy={g - 116} rx={52} ry={20} fill="#cfcfd4" />
    <path d={`M${x0 + 20} ${g - 108} h${x1 - x0 - 40}`} stroke={blanket} strokeWidth={4} />
  </g>
);
/** a sticky note with a word on it */
export const Note: React.FC<{ x: number; y: number; t: string; r?: number; s?: number; old?: boolean }> = ({ x, y, t, r = 0, s = 1, old }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-46} y={-34} width={92} height={68} fill={old ? "#8e8e92" : NOTE} stroke="#000" strokeWidth={2} />
    <rect x={-46} y={-34} width={92} height={10} fill="#000" opacity={0.08} />
    <text x={0} y={8} textAnchor="middle" fontFamily='"Segoe Print", "Comic Sans MS", cursive' fontWeight={700} fontSize={t.length > 9 ? 13 : 15} fill={INKT}>{t}</text>
  </g>
);
/** a wall full of TOMORROW notes */
export const NoteWall: React.FC<{ x0: number; y0: number; w: number; h: number; n: number; seed?: number; old?: boolean }> = ({ x0, y0, w, h, n, seed = 7, old }) => {
  const R = rng(seed), words = ["TOMORROW", "TOMORROW", "START MONDAY", "TOMORROW", "NEXT WEEK"];
  return <g>{Array.from({ length: n }, (_, i) => <Note key={i} x={x0 + R() * w} y={y0 + R() * h} r={R() * 24 - 12} s={0.85 + R() * 0.2} t={words[i % words.length]} old={old} />)}</g>;
};
export const Calendar: React.FC<{ x: number; y: number; marks: ("x" | "o" | "")[]; title?: string; notes?: number; s?: number }> = ({ x, y, marks, title = "MONTH", notes = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={0} y={0} width={252} height={230} rx={6} fill="#ecebe6" stroke="#000" strokeWidth={3} />
    <rect x={0} y={0} width={252} height={40} rx={6} fill="#3a3a42" />
    <text x={126} y={28} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={22} fill={W}>{title}</text>
    {Array.from({ length: 35 }, (_, i) => {
      const cx = 8 + (i % 7) * 34, cy = 48 + Math.floor(i / 7) * 36, m = marks[i] ?? "";
      return (
        <g key={i}>
          <rect x={cx} y={cy} width={32} height={34} fill="none" stroke="#b8b6ae" strokeWidth={1.5} />
          {m === "x" && <path d={`M${cx + 6} ${cy + 6} l20 22 M${cx + 26} ${cy + 6} l-20 22`} stroke={GOLD} strokeWidth={5} strokeLinecap="round" />}
          {m === "o" && <circle cx={cx + 16} cy={cy + 17} r={13} fill="none" stroke="#7a7a82" strokeWidth={3} strokeDasharray="4 3" />}
        </g>
      );
    })}
    {Array.from({ length: notes }, (_, i) => <Note key={i} x={60 + i * 70} y={120 + (i % 2) * 50} r={i % 2 ? 8 : -10} t="START MONDAY" s={0.85} />)}
  </g>
);
export const Shoes: React.FC<{ x: number; g: number; worn?: number; dusty?: boolean; s?: number }> = ({ x, g, worn = 0, dusty, s = 1 }) => (
  <g transform={`translate(${x} ${g}) scale(${s})`}>
    {[0, 1].map((i) => (
      <g key={i} transform={`translate(${i * 70} 0)`}>
        <path d="M0 0 L0 -26 Q8 -40 30 -36 L52 -22 Q64 -18 64 -8 L64 0 Z" fill={worn > 0.5 ? "#8a8a92" : "#e8e8ec"} stroke="#000" strokeWidth={3} />
        <rect x={0} y={-6} width={64} height={6} fill={worn > 0.5 ? "#5a5a62" : "#bdbdc4"} />
        {worn > 0.5 && <path d="M20 -20 l8 6 M34 -26 l6 8" stroke="#3a3a42" strokeWidth={3} />}
      </g>
    ))}
    {dusty && Array.from({ length: 16 }, (_, i) => <circle key={i} cx={6 + (i * 37) % 128} cy={-26 - (i % 3) * 6} r={2.5} fill="#9a9488" opacity={0.8} />)}
  </g>
);
export const ShoeBox: React.FC<{ x: number; g: number }> = ({ x, g }) => (
  <g>
    <rect x={x} y={g - 80} width={170} height={80} fill="#bdbdc2" stroke="#000" strokeWidth={3} />
    <rect x={x - 6} y={g - 96} width={182} height={20} fill="#cfcfd4" stroke="#000" strokeWidth={3} />
    <text x={x + 85} y={g - 32} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={22} fill="#3a3a42">RUN</text>
    <path d={`M${x + 160} ${g - 86} q30 10 26 40`} fill="none" stroke="#666" strokeWidth={2} />
    <rect x={x + 170} y={g - 50} width={40} height={26} rx={3} fill="#fff" stroke="#000" strokeWidth={2} transform={`rotate(12 ${x + 190} ${g - 37})`} />
    <text x={x + 190} y={g - 31} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={12} fill={INKT} transform={`rotate(12 ${x + 190} ${g - 37})`}>NEW</text>
    <Note x={x + 80} y={g - 140} t="NEW ME!" r={-6} s={0.8} old />
  </g>
);
export const Plant: React.FC<{ x: number; g: number; dead?: boolean }> = ({ x, g, dead }) => (
  <g>
    {dead
      ? <><path d={`M${x} ${g - 60} q10 -60 50 -70`} fill="none" stroke="#4a4a4e" strokeWidth={6} /><ellipse cx={x + 54} cy={g - 128} rx={18} ry={8} fill="#4a4a4e" transform={`rotate(60 ${x + 54} ${g - 128})`} /><ellipse cx={x + 30} cy={g - 70} rx={16} ry={7} fill="#3a3a3e" /></>
      : <><path d={`M${x} ${g - 60} v-200`} stroke="#9a9aa2" strokeWidth={7} />{[[-40, -230], [36, -190], [-34, -140], [32, -100]].map(([dx, dy], i) => <ellipse key={i} cx={x + dx} cy={g + dy} rx={38} ry={14} fill={GOLD} transform={`rotate(${dx > 0 ? -25 : 25} ${x + dx} ${g + dy})`} />)}</>}
    <path d={`M${x - 30} ${g} l8 -60 h44 l8 60 Z`} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} />
  </g>
);
export const Medals: React.FC<{ x: number; y: number; n: number }> = ({ x, y, n }) => (
  <g>
    <rect x={x - 10} y={y - 10} width={n * 60 + 20} height={12} rx={4} fill="#4b4b52" />
    {Array.from({ length: n }, (_, i) => <g key={i}><path d={`M${x + 20 + i * 60} ${y} l-10 50 M${x + 20 + i * 60} ${y} l10 50`} stroke={i % 2 ? "#6a6a72" : "#9a9aa2"} strokeWidth={6} /><circle cx={x + 20 + i * 60} cy={y + 68} r={20 - (n - 1 - i) * 1.5} fill="url(#sh-gold)" stroke="#000" strokeWidth={2} /></g>)}
  </g>
);
export const Shelf: React.FC<{ x: number; g: number; books: number }> = ({ x, g, books }) => (
  <g>
    <rect x={x} y={g - 250} width={190} height={250} fill="url(#sh-slab)" stroke="#55555e" strokeWidth={3} />
    {[0, 1, 2].map((r) => Array.from({ length: Math.max(0, Math.min(6, books - r * 6)) }, (_, i) => <rect key={`${r}${i}`} x={x + 12 + i * 28} y={g - 240 + r * 80} width={22} height={68} rx={3} fill={(i + r) % 3 === 0 ? "#e8e8ec" : (i + r) % 3 === 1 ? "#a8a8b0" : "#6a6a72"} stroke="#000" strokeWidth={2} />))}
  </g>
);
const Road: React.FC<{ g: number; warm?: boolean }> = ({ g, warm }) => (
  <g>
    <rect x={0} y={g} width={1080} height={70} fill={warm ? "#141414" : "#0c0c0c"} />
    {Array.from({ length: 9 }, (_, i) => <rect key={i} x={i * 130 + 20} y={g + 30} width={70} height={8} fill={warm ? "#3a3a3e" : "#242428"} />)}
  </g>
);
const Lamp: React.FC<{ x: number; g: number; warm?: boolean }> = ({ x, g, warm }) => (
  <g>
    <line x1={x} y1={g} x2={x} y2={g - 520} stroke="#3a3a44" strokeWidth={10} />
    <path d={`M${x} ${g - 520} h50`} stroke="#3a3a44" strokeWidth={10} />
    <rect x={x + 30} y={g - 516} width={44} height={16} rx={4} fill="#f2f2f2" />
    <path d={`M${x + 52} ${g - 500} L${x - 140} ${g} L${x + 240} ${g} Z`} fill="#ffffff" opacity={warm ? 0.08 : 0.04} />
  </g>
);
export const PainMarks: React.FC<{ at: V }> = ({ at }) => (
  <g>{[[-1, -1], [1, -1], [1.3, 0.2]].map(([dx, dy], i) => <path key={i} d={`M${at[0] + dx * 30} ${at[1] + dy * 30} l${dx * 14} ${dy * 6} l${dx * 4} ${dy * 16} l${dx * 14} ${dy * 6}`} fill="none" stroke={RED} strokeWidth={4} strokeLinecap="round" />)}</g>
);

// ---------------------------------------------------------------- poses
const staggerMedal = (x: number, g: number): Pose => {
  const base: Pose = { hip: [0, -HIP_H + 36], lean: 30, head: 16, hN: [0, 0], hF: [0, 0], fN: [52, 0], fF: [-58, 0], elbow: -1 };
  const kn = J(x, g, base).kN;
  return { ...reach(base, x, g, [x + 110, g - 520], [kn[0] - 4, kn[1] - 6]), elbow: -1 };
};
export const lieSlam = (x: number, y: number, target: V): Pose => reach({ ...POSES.lie(), head: 30 }, x, y, target, [x + 40, y - 40], true);
const cramp = (x: number, g: number): Pose => {
  const base: Pose = { ...POSES.kneel(), lean: 40, head: 30, hN: [0, 0], hF: [0, 0] };
  const kn = J(x, g, base).kN;
  return reach(base, x, g, [kn[0] + 10, kn[1] + 30], [kn[0] - 6, kn[1] + 40]);
};
const getUp = (x: number, g: number): Pose => reach({ ...POSES.kneel(), lean: 34, head: -12 }, x, g, [x + 90, g - 4], [x + 60, g - 2]);
export const sitEdge = (seat: number): Pose => ({ ...POSES.sit(seat), lean: 18, head: 14 });

// ================================================================ 0 · DAY 365 (the hook)
const F0: React.FC = () => {
  const BX = 340, BTOP = GT - 110, alarm: V = [640, GT - 168];
  return (
    <g>
      <Wall y0={120} g={GT} />
      <Mood y0={120} g={GT} cx={420} />
      <NoteWall x0={630} y0={270} w={400} h={380} n={32} old />
      <Window x={110} y={200} kind="night" w={200} h={200} />
      <Bed x0={80} x1={560} g={GT} head="right" />
      <Nightstand x={640} g={GT} />
      <Clock x={alarm[0]} y={alarm[1] + 20} t="9:47" ring />
      <Hero x={BX} y={BTOP} s={S} pose={lieSlam(BX, BTOP, [alarm[0] - 10, alarm[1] - 10])} flip look={COLD} shadow={0} />
      <path d={`M${120} ${BTOP - 20} Q300 ${BTOP - 70} ${470} ${BTOP - 30} L470 ${BTOP + 4} L120 ${BTOP + 4} Z`} fill="#3a3a3e" stroke="#000" strokeWidth={3} />
      <ShoeBox x={800} g={GT} />

      <Center t="DAY 365" />

      <Wall y0={1000} g={GB} warm />
      <Mood y0={1000} g={GB} warm cx={620} />
      <Road g={GB} warm />
      <Rays f={0} at={[680, GB - 320]} a={0.45} color={GOLD} n={16} len={760} />
      <line x1={740} y1={GB} x2={740} y2={GB - 470} stroke={GOLD} strokeWidth={10} />
      <rect x={730} y={GB - 520} width={210} height={58} rx={6} fill={GOLD} stroke="#000" strokeWidth={3} />
      <text x={835} y={GB - 480} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={34} letterSpacing={3} fill="#1a1205">FINISH</text>
      <path d={`M700 ${GB - 250} q-60 -30 -120 10 q-40 20 -90 -6`} fill="none" stroke={GOLD} strokeWidth={8} strokeLinecap="round" />
      {(() => { const R = rng(3); return Array.from({ length: 24 }, (_, i) => { const x = 420 + R() * 560, y = 1060 + R() * 420; return <rect key={i} x={x} y={y} width={12} height={6} fill={i % 3 ? GOLD : "#fff"} transform={`rotate(${R() * 180} ${x} ${y})`} opacity={0.8} />; }); })()}
      {(() => {
        const p = staggerMedal(690, GB), j = J(690, GB, p);
        return <>
          <Glow at={[690, GB - 260]} r={260} color={GOLD} a={0.4} />
          <Hero x={690} y={GB} s={S} pose={p} look={BOLD} />
          <path d={`M${j.wN[0]} ${j.wN[1]} l-12 50 M${j.wN[0]} ${j.wN[1]} l12 50`} stroke={RED} strokeWidth={6} />
          <circle cx={j.wN[0]} cy={j.wN[1] + 70} r={28} fill="url(#sh-gold)" stroke="#000" strokeWidth={3} />
          <Glow at={[j.wN[0], j.wN[1] + 70]} r={90} color={GOLD} a={0.7} />
          <Sweat at={j.head} /><Breath at={[j.head[0] + 10, j.head[1] + 10]} />
        </>;
      })()}

      <LaneLabel y={190} t="Tomorrow" />
      <LaneLabel y={1062} t="Today" warm />
      <text x={540} y={1840} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={78} fill={W}>Same person.</text>
    </g>
  );
};

// ================================================================ 1 · DAY 1 (everyone starts)
const F1: React.FC = () => {
  const cp = cramp(420, GT), cj = J(420, GT, cp);
  const jog: Pose = { ...run(0.3), lean: 24, head: 22 }, jj = J(560, GB, jog);
  return (
    <g>
      <Wall y0={120} g={GT} />
      <Mood y0={120} g={GT} cx={420} />
      <Road g={GT} />
      <Lamp x={140} g={GT} />
      {/* he sprinted out of the door and burned out in a minute: speed lines end where he dropped */}
      {[0, 1, 2, 3].map((i) => <line key={i} x1={80} y1={GT - 120 - i * 50} x2={300 - i * 20} y2={GT - 120 - i * 50} stroke="#8a8a92" strokeWidth={5} strokeLinecap="round" opacity={0.45 - i * 0.08} />)}
      <Hero x={420} y={GT} s={S} pose={cp} look={COLD} />
      <PainMarks at={[cj.kN[0] + 10, cj.kN[1] + 40]} />
      <Sweat at={cj.head} n={4} /><Breath at={[cj.head[0] + 10, cj.head[1] + 10]} />
      <text x={760} y={GT - 330} fontFamily='"Segoe Print", "Comic Sans MS", cursive' fontWeight={700} fontSize={34} fill={ICE} opacity={0.8}>"NEW ME!"</text>

      <Center t="DAY 1" />

      <Wall y0={1000} g={GB} warm />
      <Mood y0={1000} g={GB} warm cx={560} />
      <Road g={GB} warm />
      <Lamp x={140} g={GB} warm />
      <Window x={820} y={1090} kind="dawn" w={180} h={180} />
      <line x1={960} y1={GB} x2={960} y2={GB - 170} stroke="#6a6a72" strokeWidth={8} />
      <rect x={918} y={GB - 210} width={84} height={44} rx={6} fill="#2a2a2e" stroke="#000" strokeWidth={2} />
      <text x={960} y={GB - 180} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={22} fill={W}>1 km</text>
      <Hero x={560} y={GB} s={S} pose={jog} look={BOLD} />
      <Sweat at={jj.head} n={3} /><Breath at={[jj.head[0] + 10, jj.head[1] + 10]} />
      {[0, 1].map((i) => <line key={i} x1={400 - i * 40} y1={GB - 220 + i * 50} x2={330 - i * 40} y2={GB - 220 + i * 50} stroke={GOLD} strokeWidth={4} strokeLinecap="round" opacity={0.35} />)}

      <LaneLabel y={190} t="Tomorrow" />
      <LaneLabel y={1062} t="Today" warm />
      <Punch l1="Day 1." l2="Everyone starts." />
    </g>
  );
};

// ================================================================ 2 · DAY 23 (Monday again vs the fall in the rain)
const F2: React.FC = () => {
  const R = rng(11);
  const SOFA = GT - 96, sofaLie: Pose = { ...POSES.lie(), hN: [70, -80], hF: [60, -70], head: 14 };
  const ph = J(420, SOFA, sofaLie).wN;
  const up = getUp(520, GB), uj = J(520, GB, up);
  const marks: ("x" | "o" | "")[] = Array.from({ length: 35 }, (_, i) => (i === 0 || i === 7 || i === 14 ? "x" : ""));
  return (
    <g>
      <Wall y0={120} g={GT} />
      <Mood y0={120} g={GT} cx={420} />
      <Calendar x={600} y={230} marks={marks} title="DAY 23" notes={3} s={1.3} />
      <Shoes x={60} g={GT - 24} dusty />
      <Note x={110} y={GT - 80} t="TOMORROW" r={-8} s={0.8} />
      {/* sofa */}
      <rect x={250} y={SOFA} width={330} height={70} rx={14} fill="#333336" stroke="#000" strokeWidth={3} />
      <rect x={250} y={SOFA - 90} width={330} height={96} rx={14} fill="#2c2c30" stroke="#000" strokeWidth={3} />
      <rect x={232} y={SOFA - 40} width={40} height={110} rx={12} fill="#333336" stroke="#000" strokeWidth={3} />
      <Hero x={420} y={SOFA} s={S} pose={sofaLie} look={COLD} shadow={0} />
      <Glow at={[ph[0], ph[1] + 30]} r={160} color="#ffffff" a={0.55} />
      <rect x={ph[0] - 16} y={ph[1] - 30} width={32} height={50} rx={6} fill="#e8e8ec" stroke="#000" strokeWidth={3} />

      <Center t="DAY 23" />

      <Wall y0={1000} g={GB} warm />
      <Mood y0={1000} g={GB} warm cx={520} />
      <Road g={GB} warm />
      <Lamp x={140} g={GB} warm />
      {Array.from({ length: 60 }, (_, i) => { const x = R() * 1080, y = 1010 + R() * 680; return <line key={i} x1={x} y1={y} x2={x - 10} y2={y + 34} stroke="#bdbdc4" strokeWidth={2} opacity={0.35} />; })}
      {/* the puddle he slipped into, the splash still in the air */}
      <ellipse cx={560} cy={GB + 6} rx={190} ry={20} fill="#161618" stroke="#5a5a62" strokeWidth={3} />
      {Array.from({ length: 14 }, (_, i) => { const a = (i / 13) * Math.PI, r = 90 + (i % 3) * 40; return <circle key={i} cx={560 + Math.cos(a) * r * 1.6} cy={GB - Math.sin(a) * r * 0.9} r={5 + (i % 3) * 2} fill="#cfcfd6" opacity={0.75} />; })}
      <Hero x={520} y={GB} s={S} pose={up} look={BOLD} />
      <Sweat at={uj.head} n={2} />

      <LaneLabel y={190} t="Tomorrow" />
      <LaneLabel y={1062} t="Today" warm />
    </g>
  );
};

// ================================================================ 3 · DAY 200 (the sick day, and the comeback)
const F3: React.FC = () => {
  const BX = 340, BTOP = GT - 110;
  const scroll: Pose = { ...POSES.lie(), hN: [70, -80], hF: [60, -70], head: 20 };
  const ph = J(BX, BTOP, scroll, true).wN;
  const marks: ("x" | "o" | "")[] = Array.from({ length: 35 }, (_, i) => (i < 26 ? (i === 17 ? "o" : "x") : ""));
  const seat = 112 / S;
  const tie = reach(sitEdge(seat), 300, GB, [380, GB - 20], [360, GB - 14]);
  return (
    <g>
      <Wall y0={120} g={GT} />
      <Mood y0={120} g={GT} cx={420} />
      <NoteWall x0={630} y0={270} w={400} h={380} n={30} />
      <Bed x0={80} x1={560} g={GT} head="right" />
      <Hero x={BX} y={BTOP} s={S} pose={scroll} flip look={COLD} shadow={0} />
      <path d={`M120 ${BTOP - 20} Q300 ${BTOP - 70} 470 ${BTOP - 30} L470 ${BTOP + 4} L120 ${BTOP + 4} Z`} fill="#3a3a3e" stroke="#000" strokeWidth={3} />
      <Glow at={[ph[0], ph[1] + 30]} r={160} color="#ffffff" a={0.55} />
      <rect x={ph[0] - 16} y={ph[1] - 30} width={32} height={50} rx={6} fill="#e8e8ec" stroke="#000" strokeWidth={3} />
      <Nightstand x={640} g={GT} />
      <Clock x={640} y={GT - 150} t="2:00" />
      <Shoes x={760} g={GT - 24} dusty />
      <Plant x={960} g={GT - 24} dead />

      <Center t="DAY 200" />

      <Wall y0={1000} g={GB} warm />
      <Mood y0={1000} g={GB} warm cx={420} />
      <Window x={560} y={1090} kind="dawn" w={200} h={200} />
      <Calendar x={800} y={1090} marks={marks} title="DAY 200" s={0.95} />
      <Medals x={80} y={1110} n={4} />
      <Bed x0={60} x1={330} g={GB} head="left" blanket="#5a5a5e" />
      {/* the sick day: a thermometer still on the nightstand; today he is lacing up anyway */}
      <rect x={380} y={GB - 120} width={110} height={120} fill="url(#sh-slab)" stroke="#000" strokeWidth={3} />
      <g transform={`translate(400 ${GB - 128}) rotate(-12)`}><rect x={0} y={-8} width={70} height={10} rx={5} fill="#e8e8ec" stroke="#000" strokeWidth={2} /><circle cx={0} cy={-3} r={7} fill={RED} /></g>
      <Hero x={300} y={GB} s={S} pose={tie} look={BOLD} />
      {[0, 1, 2].map((i) => <Shoes key={i} x={520 + i * 120} g={GB - 24} worn={i < 2 ? 1 : 0} s={0.8} />)}
      <Shelf x={880} g={GB - 24} books={14} />

      <LaneLabel y={190} t="Tomorrow" />
      <LaneLabel y={1062} t="Today" warm />
      <Punch l1="Starting is easy." l2="Coming back is everything." />
    </g>
  );
};

// ================================================================ 4 · the end: your move
export const F4: React.FC = () => {
  const G = 1500, seat = 112 / 1.15, x = 470;
  const hover = reach(sitEdge(seat), x, G, [680, G - 290], [600, G - 120], false, 1.15);
  return (
    <g>
      {/* one room: cold on the bed side, warm dawn from the window: the choice is in the light */}
      <rect x={0} y={0} width={1080} height={1920} fill="#050505" />
      <defs>
        <linearGradient id="split" x1="0" x2="1"><stop offset="0" stopColor="#000" stopOpacity={0} /><stop offset="0.55" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#ffffff" stopOpacity={0.14} /></linearGradient>
      </defs>
      <rect x={0} y={600} width={1080} height={900} fill="url(#split)" />
      <Window x={800} y={760} kind="dawn" w={230} h={260} />
      <path d={`M800 1020 L1030 1020 L760 ${G} L560 ${G} Z`} fill="#ffffff" opacity={0.07} />
      <Calendar x={140} y={720} marks={[]} title="DAY 1" s={1} />
      <rect x={0} y={G} width={1080} height={420} fill="#0a0a0a" />
      <Bed x0={60} x1={560} g={G} head="left" />
      <rect x={620} y={G - 150} width={140} height={150} fill="url(#sh-slab)" stroke="#000" strokeWidth={3} />
      <Clock x={690} y={G - 175} t="6:00" ring s={1.2} />
      <Shoes x={820} g={G - 2} />
      <Hero x={x} y={G} s={1.15} pose={hover} look={BOLD} />
      <text x={540} y={380} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={50} fill={W}>Tomorrow is not a day of the week.</text>
      <text x={540} y={1700} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={120} fill={GOLD}>Your move.</text>
    </g>
  );
};

const FRAMES = [F0, F1, F2, F3, F4];
export const TomorrowStyle: React.FC = () => {
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
