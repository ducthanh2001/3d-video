// SMALL TRUTHS: style frames in the competitor-proven minimal look (pure black, a thin grey ground line, small white stick figures,
// props as single strokes, small caps labels at the top of each lane, colour ONLY where it means something).
// frame 0 = segment 1 (1% better / worse at DAY 365) · 1 = segment 3 (waiting / starting) · 2 = segment 4 (drop by drop) · 3 = segment 5 (bucket)
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { V, rng } from "../../kit/core";
import { Hero, LOOK_GREY, LOOK_WHITE, POSES, Pose } from "../../kit/hero";
import { KitDefs } from "../../kit/materials";
import { Crack, Glow } from "../../kit/fx";

export const TRUTHS_STYLE_FRAMES = 4;
export const GOLD = "#ffbf3a", RED = "#ff3b3b", LINE = "#5a5a62", INK = "#0b0b0d";
export const MONO = '"Consolas", "Courier New", monospace';
export const LBL = '"Segoe UI Semibold", "Segoe UI", Arial, sans-serif';
export const Label: React.FC<{ y: number; t: string; color?: string; size?: number; opacity?: number }> = ({ y, t, color = "#e8e8e8", size = 34, opacity = 1 }) => (
  <text x={540} y={y} textAnchor="middle" fontFamily={LBL} fontSize={size} letterSpacing={3} fill={color} opacity={opacity}>{t}</text>
);
export const GREY = { ...LOOK_GREY, body: "#8a8a90", far: "#5e5e64", glow: 0 };

// ---------------------------------------------------------------- 1 · 1% better / worse
const Seg1: React.FC = () => {
  const steps = 14, sx = 150, sw = 52, sh = 34, base = 820;
  const top: V = [sx + steps * sw - sw / 2, base - steps * sh];
  return (
    <g>
      <Label y={170} t="1% BETTER EVERY DAY" />
      {Array.from({ length: steps }, (_, i) => <path key={i} d={`M${sx + i * sw} ${base - i * sh} L${sx + i * sw} ${base - (i + 1) * sh} L${sx + (i + 1) * sw} ${base - (i + 1) * sh}`} fill="none" stroke={GOLD} strokeWidth={4} opacity={0.35 + 0.65 * (i / steps)} />)}
      <line x1={60} y1={base} x2={sx} y2={base} stroke={LINE} strokeWidth={3} />
      <Glow at={[top[0], top[1] - 60]} r={160} color={GOLD} a={0.35} />
      <Hero x={top[0]} y={top[1]} s={0.42} pose={POSES.armsUp()} />
      <text x={330} y={430} fontFamily={MONO} fontWeight={700} fontSize={64} fill={GOLD}>×37.8</text>

      <text x={540} y={975} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={56} fill="#f2f2f2">DAY 365</text>

      <Label y={1150} t="1% WORSE EVERY DAY" />
      <path d="M60 1560 L420 1560 Q540 1640 660 1560 L1020 1560" fill="none" stroke={LINE} strokeWidth={3} />
      <circle cx={540} cy={1596} r={9} fill={RED} />
      <Glow at={[540, 1596]} r={70} color={RED} a={0.5} />
      <text x={600} y={1500} fontFamily={MONO} fontWeight={700} fontSize={64} fill={RED}>×0.03</text>
      <text x={540} y={1700} textAnchor="middle" fontFamily={MONO} fontSize={26} fill="#6a6a72">1.01^365 = 37.8   ·   0.99^365 = 0.03</text>
    </g>
  );
};

// ---------------------------------------------------------------- 3 · waiting / starting
/** a tall mountain: dark face with a lit left slope, bright outline, a snow cap; returns nothing else (climbers are placed by the caller) */
export const Mountain: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => {
  const id = React.useId().replace(/:/g, "");
  const P = (u: number, v: number): V => [x + w * u, y - h * v];
  const ridge: V[] = [P(0, 0), P(0.3, 0.55), P(0.38, 0.5), P(0.62, 1), P(0.74, 0.82), P(0.82, 0.86), P(1, 0)];
  const d = ridge.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ");
  const peak = P(0.62, 1);
  return (
    <g>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2a2a30" /><stop offset="100%" stopColor="#0c0c0f" /></linearGradient></defs>
      <path d={`${d} Z`} fill={`url(#${id})`} />
      {/* lit left face */}
      <path d={`M${P(0.3, 0.55).join(" ")} L${P(0.38, 0.5).join(" ")} L${peak.join(" ")} L${P(0.58, 0.2).join(" ")} L${P(0.22, 0.05).join(" ")} Z`} fill="#ffffff" opacity={0.05} />
      {/* snow cap */}
      <path d={`M${P(0.55, 0.86).join(" ")} L${peak.join(" ")} L${P(0.68, 0.9).join(" ")} L${P(0.64, 0.84).join(" ")} L${P(0.6, 0.88).join(" ")} Z`} fill="#e8e8ec" />
      <path d={d} fill="none" stroke="#c8c8d0" strokeWidth={4} strokeLinejoin="round" />
    </g>
  );
};
const Seg3: React.FC = () => {
  const r = rng(4);
  return (
    <g>
      <Label y={170} t="WAITING TO FEEL READY" />
      <Mountain x={240} y={880} w={820} h={640} />
      <line x1={40} y1={880} x2={1040} y2={880} stroke={LINE} strokeWidth={3} />
      <g fill="none" stroke="#9a9aa2" strokeWidth={3}><path d="M120 330 q20 -40 70 -30 q30 -40 80 -10 q50 -10 60 30 q30 10 10 40 l-210 0 q-30 -10 -10 -30 z" /></g>
      <path d="M210 372 l-24 56 l26 -4 l-20 60 l50 -78 l-28 4 l20 -38 z" fill={GOLD} />
      <Glow at={[214, 420]} r={110} color={GOLD} a={0.4} />
      <text x={214} y={540} textAnchor="middle" fontFamily={MONO} fontSize={22} fill={GOLD}>MOTIVATION</text>
      <Hero x={170} y={880} s={0.42} pose={{ ...POSES.hugKnees(), head: -30 }} look={GREY} shadow={0} />

      <Label y={1150} t="STARTING ANYWAY" />
      <Mountain x={20} y={1820} w={820} h={540} />
      <line x1={0} y1={1820} x2={1080} y2={1820} stroke={LINE} strokeWidth={3} />
      {Array.from({ length: 80 }, (_, i) => { const x = r() * 1080, y = 1200 + r() * 600; return <line key={i} x1={x} y1={y} x2={x - 8} y2={y + 34} stroke="#8a8a92" strokeWidth={2} opacity={0.55} />; })}
      {/* the climber near the summit, on the left ridge (between u 0.38 and 0.62 of the mountain) */}
      <Hero x={20 + 820 * 0.52} y={1820 - 540 * 0.79} s={0.4} pose={{ ...POSES.push(), lean: 34 }} />
      <Glow at={[20 + 820 * 0.62, 1820 - 540]} r={120} color={GOLD} a={0.35} />
    </g>
  );
};

// ---------------------------------------------------------------- 4 · drop by drop
const Seg4: React.FC = () => {
  const stone = "M250 1500 L210 1180 L330 980 L560 930 L780 1010 L870 1220 L830 1500 Z";
  return (
    <g>
      <Label y={250} t="ONE DROP DOES NOTHING." color="#7a7a82" />
      <Label y={310} t="EVERY DAY DOES EVERYTHING." />
      <text x={540} y={430} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={48} fill="#f2f2f2">DROP #3,650</text>
      <line x1={540} y1={480} x2={540} y2={700} stroke="#9ab4ff" strokeWidth={2} strokeDasharray="4 18" opacity={0.6} />
      <path d="M540 780 q-14 26 0 34 q14 -8 0 -34 z" fill="#d8e6ff" />
      <path d={stone} fill="#121216" stroke="#d8d8dc" strokeWidth={4} strokeLinejoin="round" />
      <path d="M540 930 L520 1060 L566 1150 L512 1290 L548 1500" fill="none" stroke={GOLD} strokeWidth={6} strokeLinejoin="round" />
      <Glow at={[540, 1200]} r={260} color={GOLD} a={0.45} />
      <Crack at={[540, 940]} p={0.5} size={60} color="#d8d8dc" width={3} seed={7} />
      <line x1={60} y1={1500} x2={1020} y2={1500} stroke={LINE} strokeWidth={3} />
    </g>
  );
};

// ---------------------------------------------------------------- 5 · the bucket
const Seg5: React.FC = () => {
  const grab = (x: number, y: number, tx: number, ty: number) => (
    <g>
      <path d={`M${x} ${y} Q${(x + tx) / 2 - 20} ${(y + ty) / 2 + 30} ${tx} ${ty}`} fill="none" stroke={INK} strokeWidth={17} strokeLinecap="round" />
      <path d={`M${x} ${y} Q${(x + tx) / 2 - 20} ${(y + ty) / 2 + 30} ${tx} ${ty}`} fill="none" stroke="#8a8a90" strokeWidth={11} strokeLinecap="round" />
      <circle cx={tx} cy={ty} r={10} fill={RED} stroke={INK} strokeWidth={2} />
    </g>
  );
  const heads: V[] = [[330, 1080], [400, 1060], [470, 1090], [560, 1070], [630, 1085], [700, 1065]];
  return (
    <g>
      <Label y={250} t="NOT EVERYONE" />
      <Label y={300} t="WANTS YOU TO CLIMB OUT" />
      {/* back rim, then the crowd (heads and raised arms above the rim), then the bucket body hides their bodies */}
      <path d="M250 1130 A290 26 0 0 1 830 1130" fill="none" stroke="#d8d8dc" strokeWidth={5} />
      {heads.map(([hx, hy], i) => (
        <g key={i} stroke="#8a8a90" strokeLinecap="round">
          <line x1={hx - 10} y1={hy + 30} x2={hx - 40 + (i % 2) * 14} y2={hy - 50 - (i % 3) * 14} strokeWidth={11} />
          <line x1={hx + 10} y1={hy + 30} x2={hx + 34} y2={hy - 40 - (i % 2) * 20} strokeWidth={11} />
          <line x1={hx} y1={hy + 26} x2={hx} y2={hy + 140} strokeWidth={14} />
          <circle cx={hx} cy={hy} r={26} fill="#8a8a90" stroke={INK} strokeWidth={3} />
        </g>
      ))}
      <path d="M250 1130 A290 26 0 0 0 830 1130 L750 1620 L330 1620 Z" fill="#0c0c10" />
      <path d="M250 1130 L330 1620 L750 1620 L830 1130" fill="none" stroke="#d8d8dc" strokeWidth={5} strokeLinejoin="round" />
      <path d="M250 1130 A290 26 0 0 0 830 1130" fill="none" stroke="#d8d8dc" strokeWidth={5} />
      <Hero x={820} y={1080} s={0.48} pose={{ hip: [0, -150], lean: 20, head: -20, hN: [60, -110], hF: [40, -120], fN: [10, 40], fF: [-40, 90] } as Pose} />
      {grab(700, 1175, 800, 1135)}
      {grab(760, 1200, 790, 1170)}
      <line x1={60} y1={1620} x2={1020} y2={1620} stroke={LINE} strokeWidth={3} />
    </g>
  );
};

const FRAMES = [Seg1, Seg3, Seg4, Seg5];
export const TruthsStyle: React.FC = () => {
  const f = useCurrentFrame();
  const S = FRAMES[Math.min(FRAMES.length - 1, f)];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <KitDefs />
        <S />
        <text x={540} y={1860} textAnchor="middle" fontFamily={MONO} fontSize={20} letterSpacing={6} fill="#ffffff" opacity={0.18}>CHANNEL NAME</text>
      </svg>
    </AbsoluteFill>
  );
};
export const TRUTHS_LOOK = LOOK_WHITE;
