// "TOMORROW" v7: built on the STRUCTURES of the competitor's 431k "Start building your future" (studied frame by frame), with our
// own ideas: each vignette switches drawing system so the eye resets every ~6 s.
// H the house at dawn (still at the door vs already out) · 0 reveal (camera pans down a tower of TOMORROW notes) · 1 three rows, thin sticks + dominoes · 2 front pictograms, the same
// barbell: heavier by waiting vs stronger by lifting · 3 the $1 jar: spending vs saving · 4 the year calendar: 0/365 vs 365/365
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Hero, HeroLook, POSES, walk } from "../../kit/hero";
import { V } from "../../kit/core";
import { KitDefs, Vignette } from "../../kit/materials";
import { Glow } from "../../kit/fx";
import { BOLD, BOLD_GREY, Defs, GOLD, Ground, Label, SANS } from "../samehours/StyleFrames";
import { J, Punch, reach } from "../beatyesterday/StyleFrames";
import { Front } from "./MinimalFrames";
import { Bill, Jar } from "./ObjectFrames";

export const TOMORROW_V7_FRAMES = 6;
const GREY: HeroLook = { ...BOLD_GREY, glow: 0, eyes: "side", eyeColor: "#1a1a1e" };
const HERO: HeroLook = { ...BOLD, eyes: "side" };
const STICK: HeroLook = { body: "#f2f2f2", far: "#d6d6d6", ink: "#000", glow: 0.15, width: 0.75, head: 1.05 };
const STICK_G: HeroLook = { ...STICK, body: "#8a8a92", far: "#6a6a72", glow: 0 };
const LINE = "#d8d8dc", DIM = "#6a6a72";
const rnd = (i: number) => { const x = Math.sin(i * 91.7 + 3.1) * 43758.5; return x - Math.floor(x); };
const Row: React.FC<{ y: number; t: string; gold?: boolean }> = ({ y, t, gold }) => (
  <text x={540} y={y} textAnchor="middle" fontFamily="Impact, 'Arial Narrow', sans-serif" fontSize={40} letterSpacing={1} fill={gold ? GOLD : "#9a9aa2"}>{t}</text>
);

// ================================================================ 0 · the tower of notes (reveal): many words, one excuse
const EXCUSES = ["I'll start tomorrow", "Starting Monday", "Next week, for sure", "After the holidays", "When I'm ready",
  "New year, new me", "Just one more day", "After this video", "Maybe next month", "When I have time", "I'm too tired today",
  "First of the month", "When it's less busy", "Tomorrow. Promise."];
const Note: React.FC<{ x: number; y: number; r?: number; w?: number; a?: number; t?: string; fs?: number }> = ({ x, y, r = 0, w = 250, a = 1, t = EXCUSES[0], fs = 20 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`} opacity={a}>
    <rect x={-w / 2} y={-34} width={w} height={34} rx={2} fill="#e9e9ea" stroke="#000" strokeWidth={2.5} />
    <rect x={-w / 2} y={-34} width={w} height={6} fill="#cfcfd2" />
    <text x={0} y={-8} textAnchor="middle" fontFamily="'Segoe Print', 'Comic Sans MS', cursive" fontWeight={700} fontSize={fs} fill="#2a2a2e">{t}</text>
  </g>
);
const V0: React.FC = () => {
  const G = 1560, n = 27, top = G - n * 34;
  return (
    <g>
      <Label y={300} t="Day 365" size={50} />
      <Ground y={G} />
      {Array.from({ length: n }, (_, i) => <Note key={i} x={540 + (rnd(i) - 0.5) * 40} y={G - i * 34} w={250 + Math.round(rnd(i + 4) * 40)} r={(rnd(i + 9) - 0.5) * 6} t={EXCUSES[(i * 5) % EXCUSES.length]} />)}
      {/* the note he is putting on top right now */}
      <Note x={600} y={top - 30} r={-8} t="Tomorrow. Promise." />
      <Hero x={470} y={top} s={0.7} pose={reach({ ...POSES.stand(), lean: 6, head: 20 }, 470, top, [575, top - 52], undefined, false, 0.7)} look={GREY} />
      <text x={850} y={G - 420} fontFamily={SANS} fontWeight={800} fontSize={90} fill="#f2f2f2">365</text>
      <text x={850} y={G - 370} fontFamily={SANS} fontWeight={600} fontSize={30} fill="#8a8a92">notes</text>
      <Punch l1="Different words." l2="Same tomorrow." y={1740} />
    </g>
  );
};

// ================================================================ 1 · three rows: the dominoes
const Domino: React.FC<{ x: number; g: number; h: number; fall?: number; gold?: boolean }> = ({ x, g, h, fall = 0, gold }) => {
  const w = Math.max(12, h * 0.22);
  return <rect x={x} y={g - h} width={w} height={h} rx={3} fill={gold ? "url(#sh-gold)" : "#e8e8ec"} stroke="#000" strokeWidth={2.5} transform={`rotate(${fall} ${x + w} ${g})`} />;
};
const dominoRow = (g: number, state: "wait" | "stop" | "go") => {
  const hs = [36, 48, 64, 84, 110, 145, 190], xs = [300, 350, 410, 485, 575, 690, 830];
  return hs.map((h, i) => {
    const fallen = state === "go" ? (i < 6 ? 55 : 30) : state === "stop" ? (i < 2 ? 55 : 0) : 0;
    return <Domino key={i} x={xs[i]} g={g} h={h} fall={fallen} gold={state === "go" && i === 6} />;
  });
};
const V1: React.FC = () => {
  const rows = [640, 1080, 1520], s = 0.62;
  return (
    <g>
      <Row y={rows[0] - 300} t="Most people" />
      <Ground y={rows[0]} />
      {dominoRow(rows[0], "wait")}
      <Hero x={170} y={rows[0]} s={s} pose={{ ...POSES.think(), head: 14 }} look={STICK_G} shadow={0} />
      <g transform={`translate(215 ${rows[0] - 205})`}><rect x={0} y={-40} width={190} height={52} rx={26} fill="none" stroke={DIM} strokeWidth={3} /><text x={95} y={-6} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={26} fill="#9a9aa2">tomorrow…</text></g>

      <Row y={rows[1] - 300} t="Some people" />
      <Ground y={rows[1]} />
      {dominoRow(rows[1], "stop")}
      <Hero x={170} y={rows[1]} s={s} pose={walk(0.3)} flip look={STICK_G} shadow={0} />

      <Row y={rows[2] - 300} t="Few people" gold />
      <Ground y={rows[2]} />
      <Glow at={[880, rows[2] - 120]} r={200} color={GOLD} a={0.35} />
      {dominoRow(rows[2], "go")}
      <Hero x={190} y={rows[2]} s={s} pose={POSES.armsUp()} look={STICK} shadow={0} />

      <Punch l1="It starts small." l2="It starts today." y={1750} />
    </g>
  );
};

// ================================================================ 2 · the same barbell (front pictograms, words on the object)
const Plates: React.FC<{ x: number; y: number; n: number; gold?: boolean; half?: number }> = ({ x, y, n, gold, half = 190 }) => (
  <g>
    <rect x={x - half - 20} y={y - 6} width={(half + 20) * 2} height={12} rx={4} fill={gold ? "#d8d8dc" : "#7a7a82"} stroke="#000" strokeWidth={2.5} />
    {[-1, 1].map((d) => Array.from({ length: n }, (_, i) => (
      <rect key={`${d}${i}`} x={x + d * (half - 70 + i * 22) - 10} y={y - 60 + i * 4} width={20} height={120 - i * 8} rx={6} fill={gold ? "url(#sh-gold)" : "url(#sh-grey)"} stroke="#000" strokeWidth={2.5} />
    )))}
  </g>
);
const V2: React.FC = () => {
  const G = 1380, xl = 290, xr = 790, barR = G - 330;
  return (
    <g>
      <text x={xl} y={G - 470} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={30} fill="#9a9aa2">I'll start tomorrow</text>
      <text x={xr} y={barR - 90} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={30} fill={GOLD}>I started</text>
      <Ground y={G} />
      {/* left: waited — every day added a plate; now he cannot lift it */}
      <Front x={xl} g={G} look={GREY} hands={[[xl - 70, G - 66], [xl + 70, G - 66]]} feet={60} sink={92} down={0.35} />
      <Plates x={xl} y={G - 60} n={5} />
      {[0, 1, 2].map((i) => <path key={i} d={`M${xl - 120 + i * 110} ${G - 280} q-6 14 0 22`} stroke="#bdbdc4" strokeWidth={3} fill="none" />)}
      {/* right: the SAME weight overhead — he added a plate a day while lifting */}
      <Glow at={[xr, barR]} r={240} color={GOLD} a={0.3} />
      <Front x={xr} g={G} look={HERO} hands={[[xr - 80, barR], [xr + 80, barR]]} feet={46} sink={6} />
      <Plates x={xr} y={barR} n={5} gold />
      <Label x={xl} y={G + 80} t="Tomorrow" size={40} color="#9a9aa2" />
      <Label x={xr} y={G + 80} t="Today" size={40} />
      <Punch l1="Waiting makes it heavier." l2="Lifting makes you stronger." y={1730} />
    </g>
  );
};

// ================================================================ H · the house at dawn: still at the door vs already out
/** a line-art house in cutaway: walls, roof, a sofa inside, a door in the right wall (closed or swung open), a wall clock */
const House: React.FC<{ g: number; open?: boolean; time: string; gold?: boolean }> = ({ g, open, time, gold }) => {
  const x0 = 90, x1 = 600, top = g - 330, dh = 220;
  return (
    <g>
      <path d={`M${x0 - 30} ${top} L${(x0 + x1) / 2} ${top - 150} L${x1 + 30} ${top}`} fill="none" stroke={LINE} strokeWidth={5} strokeLinejoin="round" />
      <line x1={x0} y1={top} x2={x1} y2={top} stroke={LINE} strokeWidth={5} />
      <line x1={x0} y1={top} x2={x0} y2={g} stroke={LINE} strokeWidth={5} />
      <line x1={x1} y1={top} x2={x1} y2={g - dh} stroke={LINE} strokeWidth={5} />
      {/* sofa */}
      <path d={`M130 ${g} v-70 h40 v30 h150 v-30 h40 v70`} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} opacity={0.8} />
      <rect x={150} y={g - 120} width={180} height={52} rx={10} fill="#4a4a52" stroke="#000" strokeWidth={3} />
      {/* wall clock */}
      <rect x={130} y={top + 40} width={120} height={50} rx={8} fill="#141416" stroke={LINE} strokeWidth={3} />
      <text x={190} y={top + 76} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={30} fill={gold ? GOLD : "#9a9aa2"}>{time}</text>
      {open
        ? <><path d={`M${x1} ${g} L${x1} ${g - dh} L${x1 + 70} ${g - dh + 34} L${x1 + 70} ${g + 6} Z`} fill="#3a3a3e" stroke={LINE} strokeWidth={4} />
            <path d={`M${x1} ${g - dh} L${x1} ${g} L${x1 - 170} ${g} Z`} fill={GOLD} opacity={0.18} /></>
        : <><rect x={x1 - 8} y={g - dh} width={16} height={dh} fill="#5a5a62" stroke={LINE} strokeWidth={3} /><circle cx={x1 - 18} cy={g - 110} r={6} fill={LINE} /></>}
    </g>
  );
};
const VH: React.FC = () => {
  const G1 = 830, G2 = 1560, s = 0.7;
  // tomorrow: hand on the handle, body turned back toward the sofa — maybe tomorrow
  const hes = reach({ ...POSES.stand(), lean: -8, head: 18 }, 520, G1, [582, G1 - 110], undefined, true, s);
  // today: 5:00, the door is open, he is already outside walking into the sunrise with his bag
  const wk = walk(0.3), wj = J(820, G2, wk, false, s);
  return (
    <g>
      <Label y={230} t="Tomorrow" />
      <Ground y={G1} />
      <House g={G1} time="9:47" />
      <Hero x={520} y={G1} s={s} pose={hes} flip look={GREY} />
      <g transform={`translate(280 ${G1 - 220})`}><rect x={0} y={-40} width={250} height={52} rx={26} fill="none" stroke={DIM} strokeWidth={3} /><text x={125} y={-6} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={26} fill="#9a9aa2">maybe tomorrow…</text></g>

      <Label y={1010} t="Today" />
      <Ground y={G2} />
      {/* the sun coming up where he is going */}
      <Glow at={[1000, G2 - 70]} r={230} color={GOLD} a={0.4} />
      <path d={`M900 ${G2} A100 100 0 0 1 1100 ${G2} Z`} fill={GOLD} opacity={0.9} />
      <House g={G2} open time="5:00" gold />
      <Hero x={820} y={G2} s={s} pose={wk} look={HERO} />
      <rect x={wj.wN[0] - 24} y={wj.wN[1]} width={48} height={36} rx={5} fill="#5a5a62" stroke="#000" strokeWidth={2.5} />
      <path d={`M${wj.wN[0] - 10} ${wj.wN[1]} v-8 h20 v8`} fill="none" stroke="#000" strokeWidth={3} />

      <Punch l1="One is still deciding." l2="One already left." y={1740} />
    </g>
  );
};

// ================================================================ 3 · the $1 jar: spending it vs saving it
const Bag: React.FC<{ x: number; g: number; s?: number }> = ({ x, g, s = 1 }) => (
  <g transform={`translate(${x} ${g}) scale(${s})`}>
    <path d="M-40 0 L-34 -90 H34 L40 0 Z" fill="#cfcfd4" stroke="#000" strokeWidth={3} />
    <path d="M-16 -90 q0 -30 16 -30 q16 0 16 30" fill="none" stroke="#000" strokeWidth={4} />
    <text x={0} y={-36} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={20} fill="#3a3a42">SALE</text>
  </g>
);
const V3: React.FC = () => {
  const G1 = 830, G2 = 1560, s = 0.7, jx = 700;
  // tomorrow: "I'll start saving tomorrow" — today's $1 goes on one more thing; the jar stays empty
  const buy = { ...POSES.stand(), head: 28, hN: [56, 22] as V, hF: [44, 30] as V, elbow: 1 };
  const bj = J(300, G1, buy, false, s);
  // today: he drops $1 into the jar
  const drop = reach({ ...POSES.stand(), head: 22 }, 520, G2, [jx - 10, G2 - 240], undefined, false, s), dj = J(520, G2, drop, false, s);
  return (
    <g>
      <Label y={230} t="Tomorrow" />
      <Ground y={G1} />
      {[[110, 1], [170, 0.85], [60, 0.8]].map(([x, sc], i) => <Bag key={i} x={x} g={G1} s={sc} />)}
      <Hero x={300} y={G1} s={s} pose={buy} look={GREY} />
      <Glow at={bj.wN} r={60} color="#ffffff" a={0.25} />
      <rect x={bj.wN[0] - 12} y={bj.wN[1] - 24} width={24} height={40} rx={5} fill="#e8e8ec" stroke="#000" strokeWidth={3} />
      <text x={bj.wN[0]} y={bj.wN[1] - 2} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={8} fill="#1a1a1a">BUY</text>
      <Bill x={bj.wN[0] + 90} y={bj.wN[1] - 60} r={-30} s={0.9} />
      <Jar x={jx} g={G1} fill={0} dusty />
      <Note x={jx} y={G1 - 220} w={250} r={-4} t="Start saving tomorrow" fs={18} />
      <text x={jx + 140} y={G1 - 90} fontFamily={SANS} fontWeight={800} fontSize={52} fill="#5a5a62">$0</text>

      <Label y={1010} t="Today" />
      <Ground y={G2} />
      <Jar x={jx} g={G2} fill={0.85} />
      <Bill x={dj.wN[0] + 14} y={dj.wN[1] + 20} r={-70} s={1} />
      <Hero x={520} y={G2} s={s} pose={drop} look={HERO} />
      <text x={jx + 100} y={G2 - 230} fontFamily={SANS} fontWeight={800} fontSize={56} fill={GOLD}>$365</text>

      <Punch l1="I'll start saving tomorrow." l2="$1 a day. $365 a year." y={1740} />
    </g>
  );
};

// ================================================================ 4 · the year calendar: never marked vs every box marked
const Calendar: React.FC<{ x: number; y: number; filled: number; gold?: boolean }> = ({ x, y, filled, gold }) => {
  const cols = 25, rows = 15, cw = 22, ch = 22, w = cols * cw + 24, h = rows * ch + 70;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={10} fill="#141416" stroke={gold ? "#d8d8dc" : "#5a5a62"} strokeWidth={3} />
      <rect x={x} y={y} width={w} height={46} rx={10} fill={gold ? "#e8e8ec" : "#3a3a3e"} />
      {[0.25, 0.75].map((k) => <rect key={k} x={x + w * k - 6} y={y - 14} width={12} height={28} rx={5} fill="#9a9aa2" stroke="#000" strokeWidth={2} />)}
      <text x={x + w / 2} y={y + 33} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={28} letterSpacing={4} fill={gold ? "#1a1a1a" : "#9a9aa2"}>2026</text>
      {Array.from({ length: 365 }, (_, i) => {
        const cx = x + 12 + (i % cols) * cw, cy = y + 58 + Math.floor(i / cols) * ch;
        return i < filled
          ? <g key={i}><rect x={cx + 1} y={cy + 1} width={cw - 2} height={ch - 2} rx={3} fill={GOLD} opacity={0.9} /><path d={`M${cx + 5} ${cy + 11} l4 5 l8 -10`} stroke="#1a1a1a" strokeWidth={2.4} fill="none" /></g>
          : <rect key={i} x={cx + 1} y={cy + 1} width={cw - 2} height={ch - 2} rx={3} fill="none" stroke="#3a3a40" strokeWidth={1.5} />;
      })}
    </g>
  );
};
const V4: React.FC = () => {
  const G1 = 830, G2 = 1560, cx = 420, cy1 = G1 - 470, cy2 = G2 - 470;
  return (
    <g>
      <Label y={220} t="Tomorrow" />
      <Ground y={G1} />
      <Calendar x={cx} y={cy1} filled={0} />
      <Note x={cx + 300} y={cy1 + 230} w={270} r={-7} t="I'll start tomorrow" />
      <Hero x={200} y={G1} s={0.7} pose={{ ...POSES.hugKnees(), head: 34 }} look={GREY} />
      <text x={cx + 300} y={G1 - 520} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={34} fill="#5a5a62">0 / 365</text>

      <Label y={950} t="Today" />
      <Ground y={G2} />
      <Glow at={[cx + 300, cy2 + 200]} r={380} color={GOLD} a={0.28} />
      <Calendar x={cx} y={cy2} filled={365} gold />
      {/* he ticks the very last box */}
      <Hero x={315} y={G2} s={0.7} pose={reach({ ...POSES.stand(), lean: 2, head: -8, fN: [26, 0], fF: [-20, 0] }, 315, G2, [404, cy2 + 230], undefined, false, 0.7)} look={HERO} />
      <rect x={398} y={cy2 + 196} width={12} height={46} rx={4} fill={GOLD} stroke="#000" strokeWidth={2} transform={`rotate(30 404 ${cy2 + 230})`} />
      <text x={cx + 300} y={G2 - 520} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={34} fill={GOLD}>365 / 365</text>

      <Punch l1="Same year." l2="One of them showed up." y={1740} />
    </g>
  );
};

const FRAMES = [VH, V0, V1, V2, V3, V4];
export const TomorrowV7: React.FC = () => {
  const F = FRAMES[Math.min(FRAMES.length - 1, useCurrentFrame())];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <KitDefs />
        <Defs />
        <F />
        <text x={540} y={1900} textAnchor="middle" fontFamily={SANS} fontSize={18} letterSpacing={5} fill="#ffffff" opacity={0.16}>CHANNEL NAME</text>
        <Vignette a={0.3} />
      </svg>
    </AbsoluteFill>
  );
};
