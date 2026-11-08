// SAME HOURS: style frames (5 vignettes, ~33 s Short). Look upgraded toward the million-view minimal shorts:
// pure black, BOLD filled pictogram figures (~15% of the frame), filled grey gradient props with a lit edge, clean title-case sans labels,
// colour only for meaning (gold = what you build / what matters, red = what burns out).
// frame 0 Scrolling/Building (bricks) · 1 Shortcuts/Making the key · 2 Small things first/Big things first (jar) · 3 Burning 200%/Every day (candle)
// · 4 Waiting for a bridge/Building one
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { V, rng } from "../../kit/core";
import { BONE, HIP_H, Hero, HeroLook, Joints, POSES, Pose } from "../../kit/hero";
import { KitDefs, Vignette } from "../../kit/materials";
import { Glow } from "../../kit/fx";

export const SAMEHOURS_STYLE_FRAMES = 5;
export const GOLD = "#ffbf3a", GOLD_D = "#b57a10", RED = "#ff3b3b";
export const SANS = '"Segoe UI Semibold", "Segoe UI", Arial, sans-serif';
export const BOLD: HeroLook = { width: 1.85, head: 1.18, glow: 0.3 };
export const BOLD_GREY: HeroLook = { width: 1.85, head: 1.18, glow: 0, body: "#8c8c92", far: "#5f5f66" };
const S = 0.7; // figure scale: ~270 px tall, like the reference shorts
const AR = BONE.uArm + BONE.fArm;
const G1 = 830, G2 = 1660; // ground lines of the top / bottom lane

// ---------------------------------------------------------------- shared pieces
export const Label: React.FC<{ y: number; t: string; size?: number; color?: string; x?: number; anchor?: "middle" | "start" | "end"; weight?: number }> = ({ y, t, size = 46, color = "#f2f2f2", x = 540, anchor = "middle", weight = 600 }) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={SANS} fontWeight={weight} fontSize={size} fill={color}>{t}</text>
);
/** the reference look: a grey ground bar that fades out at both ends, with a faint floor below */
export const Ground: React.FC<{ y: number; x0?: number; x1?: number }> = ({ y, x0 = 40, x1 = 1040 }) => {
  const id = React.useId().replace(/:/g, "");
  return (
    <g>
      <defs>
        <linearGradient id={`${id}h`} x1="0" x2="1"><stop offset="0" stopColor="#6a6a72" stopOpacity={0} /><stop offset="0.15" stopColor="#8a8a92" /><stop offset="0.85" stopColor="#8a8a92" /><stop offset="1" stopColor="#6a6a72" stopOpacity={0} /></linearGradient>
        <linearGradient id={`${id}v`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" stopOpacity={0.07} /><stop offset="1" stopColor="#ffffff" stopOpacity={0} /></linearGradient>
      </defs>
      <rect x={x0} y={y + 5} width={x1 - x0} height={90} fill={`url(#${id}v)`} />
      <rect x={x0} y={y} width={x1 - x0} height={6} fill={`url(#${id}h)`} />
    </g>
  );
};
const grad = (id: string, a: string, b: string) => <linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient>;
/** one brick; gold or grey */
export const Brick: React.FC<{ x: number; y: number; w?: number; h?: number; gold?: boolean }> = ({ x, y, w = 96, h = 46, gold }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={5} fill={gold ? "url(#sh-gold)" : "url(#sh-grey)"} stroke="#000" strokeWidth={3} />
    <rect x={x + 6} y={y + 5} width={w - 12} height={4} rx={2} fill="#fff" opacity={gold ? 0.45 : 0.25} />
  </g>
);
export const Defs: React.FC = () => (
  <defs>
    {grad("sh-gold", "#ffd978", "#c88a16")}
    {grad("sh-grey", "#9a9aa2", "#4b4b52")}
    {grad("sh-slab", "#3c3c44", "#141418")}
    <linearGradient id="sh-cliff" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a3a42" /><stop offset="1" stopColor="#000" stopOpacity={0} /></linearGradient>
    {grad("sh-wax", "#f4efe2", "#b9b2a0")}
    {grad("sh-sand", "#8a8a90", "#55555c")}
  </defs>
);
/** a lumpy rock with a word on it */
export const Stone: React.FC<{ x: number; y: number; r: number; t?: string; gold?: boolean; seed?: number; rot?: number }> = ({ x, y, r, t, gold = true, seed = 1, rot = 0 }) => {
  const R = rng(seed);
  const pts = Array.from({ length: 9 }, (_, i) => { const a = (i / 9) * Math.PI * 2, k = r * (0.84 + R() * 0.2); return [Math.cos(a) * k * 1.25, Math.sin(a) * k * 0.9] as V; });
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ") + " Z";
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={d} fill={gold ? "url(#sh-gold)" : "url(#sh-grey)"} stroke="#000" strokeWidth={4} strokeLinejoin="round" />
      <path d={`M${-r * 0.7} ${-r * 0.45} Q0 ${-r * 0.85} ${r * 0.7} ${-r * 0.5}`} fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.4} />
      {t && <text x={0} y={r * 0.16} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={r * 0.42} fill="#1a1205">{t}</text>}
    </g>
  );
};

// ---------------------------------------------------------------- 1 · Scrolling / Building (same bricks)
const sitPhone: Pose = { hip: [0, -26], lean: 16, head: 36, hN: [62, 30], hF: [56, 36], fN: [118, 0], fF: [104, 0], elbow: 1 };
const Seg1: React.FC = () => {
  const bw = 96, bh = 46;
  // top lane: 21 bricks as a WALL (3 wide x 7 high) right in front of him
  const wx = 470;
  const wall: React.ReactNode[] = [];
  for (let r = 0; r < 7; r++) {
    // running bond: odd rows = half, full, full, half (same width as 3 bricks)
    const row: [number, number][] = r % 2 ? [[0, bw / 2], [bw / 2, bw], [bw * 1.5, bw], [bw * 2.5, bw / 2]] : [[0, bw], [bw, bw], [bw * 2, bw]];
    row.forEach(([ox, w], c) => wall.push(<Brick key={`${r}-${c}`} x={wx + ox} y={G1 - (r + 1) * bh} w={w} h={bh} />));
  }
  // bottom lane: the SAME 21 bricks as a STAIRCASE (columns 1..6)
  const sx = 230;
  const stairs: React.ReactNode[] = [];
  for (let c = 0; c < 6; c++) for (let r = 0; r <= c; r++) stairs.push(<Brick key={`${c}-${r}`} gold x={sx + c * bw} y={G2 - (r + 1) * bh} w={bw} h={bh} />);
  const topStep: V = [sx + 5.5 * bw, G2 - 6 * bh];
  return (
    <g>
      <Label y={150} t="4 hours a day" size={40} color="#9a9aa2" weight={500} />
      <Label y={230} t="Scrolling" />
      <Ground y={G1} />
      {/* the goal he can no longer see */}
      <line x1={930} y1={G1} x2={930} y2={G1 - 260} stroke="#cfcfd6" strokeWidth={6} />
      <path d={`M930 ${G1 - 258} L1010 ${G1 - 236} L930 ${G1 - 214} Z`} fill="#6e6e76" />
      {wall}
      <Hero x={250} y={G1} s={S} look={BOLD} pose={sitPhone} hold={(j: Joints) => (
        <g transform={`translate(${j.wN[0] + 6} ${j.wN[1] - 22}) rotate(-28)`}>
          <rect x={-16} y={-30} width={32} height={58} rx={7} fill="#1b1d24" stroke="#000" strokeWidth={3} />
          <rect x={-12} y={-25} width={24} height={46} rx={4} fill="#9cc8ff" />
        </g>
      )} />
      <Glow at={[290, G1 - 150]} r={110} color="#7fb6ff" a={0.35} />
      <Label x={1000} y={G1 + 70} anchor="end" t="DAY 365" size={34} color="#8a8a92" />

      <Label y={1010} t="Building" />
      <Ground y={G2} />
      <line x1={sx - 120} y1={G2} x2={sx} y2={G2} stroke="#8a8a92" strokeWidth={0} />
      {stairs}
      <Glow at={[topStep[0], topStep[1] - 160]} r={220} color={GOLD} a={0.4} />
      <line x1={topStep[0] + 30} y1={topStep[1]} x2={topStep[0] + 30} y2={topStep[1] - 250} stroke="#f2f2f2" strokeWidth={6} />
      <path d={`M${topStep[0] + 30} ${topStep[1] - 248} L${topStep[0] + 112} ${topStep[1] - 226} L${topStep[0] + 30} ${topStep[1] - 204} Z`} fill={GOLD} />
      <Hero x={topStep[0] - 30} y={topStep[1]} s={S} look={BOLD} pose={POSES.armsUp()} />
      <Label x={1000} y={G2 + 70} anchor="end" t="DAY 365" size={34} color="#8a8a92" />

      <Label y={1830} t="Same bricks. Different direction." size={40} color={GOLD} />
    </g>
  );
};

// ---------------------------------------------------------------- 2 · Looking for shortcuts / Making the key
const Door: React.FC<{ x: number; y: number; open?: number }> = ({ x, y, open = 0 }) => {
  const w = 180, h = 340;
  return (
    <g>
      <rect x={x - 14} y={y - h - 14} width={w + 28} height={h + 14} fill="#1a1a1f" stroke="#55555e" strokeWidth={4} />
      {open > 0 && <>
        <rect x={x} y={y - h} width={w} height={h} fill={GOLD} />
        <rect x={x} y={y - h} width={w} height={h} fill="#fff6d8" opacity={0.6} />
        <path d={`M${x} ${y} L${x + w} ${y} L${x + w + 340} ${y + 90} L${x - 160} ${y + 90} Z`} fill={GOLD} opacity={0.18} />
      </>}
      {/* the leaf: closed = flat slab, open = swung toward us (narrow parallelogram on the hinge side) */}
      {open > 0
        ? <path d={`M${x} ${y - h} L${x - 70 * open} ${y - h - 24} L${x - 70 * open} ${y + 24} L${x} ${y} Z`} fill="url(#sh-slab)" stroke="#000" strokeWidth={3} />
        : <>
          <rect x={x} y={y - h} width={w} height={h} fill="url(#sh-slab)" stroke="#000" strokeWidth={3} />
          <rect x={x + 18} y={y - h + 20} width={w - 36} height={h * 0.38} fill="none" stroke="#4a4a54" strokeWidth={3} />
          <rect x={x + 18} y={y - h * 0.5} width={w - 36} height={h * 0.42} fill="none" stroke="#4a4a54" strokeWidth={3} />
          <circle cx={x + w - 30} cy={y - h * 0.5} r={9} fill="#b0b0b8" />
          <path d={`M${x + w - 30} ${y - h * 0.5 + 16} l-6 20 h12 Z`} fill="#000" />
        </>}
      <rect x={x + w / 2 - 92} y={y - h - 84} width={184} height={50} rx={6} fill="#26262c" stroke="#55555e" strokeWidth={3} />
      <text x={x + w / 2} y={y - h - 48} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={28} letterSpacing={3} fill={open ? GOLD : "#cfcfd6"}>SUCCESS</text>
    </g>
  );
};
export const Key: React.FC<{ x: number; y: number; rot?: number; s?: number; gold?: boolean; broken?: boolean }> = ({ x, y, rot = 0, s = 1, gold, broken }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <circle cx={0} cy={0} r={16} fill="none" stroke={gold ? GOLD : "#a8a8b0"} strokeWidth={8} />
    <path d={`M16 0 L${broken ? 46 : 74} 0`} stroke={gold ? GOLD : "#a8a8b0"} strokeWidth={8} strokeLinecap="round" />
    {!broken && <path d="M58 0 v12 M70 0 v9" stroke={gold ? GOLD : "#a8a8b0"} strokeWidth={7} strokeLinecap="round" />}
  </g>
);
const Seg2: React.FC = () => {
  const tryKey: Pose = { hip: [0, -HIP_H], lean: 10, head: 6, hN: [AR - 24, -2], hF: [70, 40], fN: [34, 0], fF: [-30, 0], elbow: 1 };
  const walkIn: Pose = { hip: [0, -HIP_H], lean: 4, head: -6, hN: [AR - 20, -6], hF: [-30, 120], fN: [40, 0], fF: [-60, 0] };
  return (
    <g>
      <Label y={230} t="Looking for shortcuts" />
      <Ground y={G1} />
      <Door x={700} y={G1} />
      <Hero x={560} y={G1} s={S} look={BOLD} pose={tryKey} hold={(j: Joints) => (
        <g>
          <Key x={j.wN[0] + 6} y={j.wN[1]} rot={-6} s={0.9} />
          <circle cx={j.wF[0]} cy={j.wF[1] + 20} r={20} fill="none" stroke="#a8a8b0" strokeWidth={6} />
          <Key x={j.wF[0] - 4} y={j.wF[1] + 44} rot={100} s={0.75} />
          <Key x={j.wF[0] + 10} y={j.wF[1] + 42} rot={70} s={0.75} />
        </g>
      )} />
      {/* broken shortcuts on the floor, each tagged */}
      {[["HACK", 190, -12], ["LUCK", 300, 18], ["TRICK", 395, -30]].map(([t, x, r]) => (
        <g key={t as string}>
          <Key x={x as number} y={G1 - 12} rot={r as number} s={0.8} broken />
          <Label x={(x as number) + 14} y={G1 + 64} t={t as string} size={26} color="#8a8a92" weight={700} />
        </g>
      ))}

      <Label y={1010} t="Making the key" />
      <Ground y={G2} />
      <Door x={700} y={G2} open={1} />
      <Glow at={[790, G2 - 170]} r={360} color={GOLD} a={0.35} />
      {/* the file and the shavings left behind */}
      <rect x={130} y={G2 - 110} width={200} height={20} rx={4} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} />
      <path d={`M145 ${G2 - 90} L140 ${G2} M315 ${G2 - 90} L320 ${G2}`} stroke="#6a6a72" strokeWidth={10} strokeLinecap="round" />
      <path d={`M170 ${G2 - 116} l90 -10`} stroke="#c9c9d0" strokeWidth={9} strokeLinecap="round" />
      <path d={`M262 ${G2 - 126} l26 -3`} stroke="#5a4a2a" strokeWidth={14} strokeLinecap="round" />
      {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={170 + i * 14} cy={G2 - 4 - (i % 3) * 2} r={3} fill={GOLD} opacity={0.8} />)}
      <Hero x={560} y={G2} s={S} look={BOLD} pose={walkIn} hold={(j: Joints) => <Key x={j.wN[0] + 4} y={j.wN[1]} gold s={0.95} />} />
    </g>
  );
};

// ---------------------------------------------------------------- 3 · Small things first / Big things first (the jar)
export const Jar: React.FC<{ x: number; y: number; w?: number; h?: number; children?: React.ReactNode; lid?: boolean }> = ({ x, y, w = 330, h = 420, children, lid }) => {
  const id = React.useId().replace(/:/g, "");
  const l = x - w / 2, r = x + w / 2, top = y - h, neck = 40;
  const body = `M${l + 20} ${top + neck + 20} Q${l} ${top + neck + 30} ${l} ${top + neck + 70} L${l} ${y - 30} Q${l} ${y} ${l + 30} ${y} L${r - 30} ${y} Q${r} ${y} ${r} ${y - 30} L${r} ${top + neck + 70} Q${r} ${top + neck + 30} ${r - 20} ${top + neck + 20} L${r - 30} ${top + neck} L${r - 30} ${top} L${l + 30} ${top} L${l + 30} ${top + neck} Z`;
  return (
    <g>
      <defs><clipPath id={id}><path d={body} /></clipPath></defs>
      <path d={body} fill="#ffffff" opacity={0.04} />
      <g clipPath={`url(#${id})`}>{children}</g>
      <path d={body} fill="none" stroke="#d6dae2" strokeWidth={6} strokeLinejoin="round" />
      <path d={`M${l + 26} ${top + neck + 90} L${l + 26} ${y - 50}`} stroke="#fff" strokeWidth={10} strokeLinecap="round" opacity={0.35} />
      {lid && <rect x={l + 18} y={top - 34} width={w - 36} height={36} rx={6} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} />}
    </g>
  );
};
export const Sand: React.FC<{ x: number; y: number; w: number; h: number; seed?: number }> = ({ x, y, w, h, seed = 3 }) => {
  const R = rng(seed);
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="url(#sh-sand)" />
      {Array.from({ length: 140 }, (_, i) => <circle key={i} cx={x + R() * w} cy={y + R() * h} r={2 + R() * 2.5} fill={R() > 0.5 ? "#a3a3aa" : "#3e3e44"} opacity={0.8} />)}
    </g>
  );
};
const Seg3: React.FC = () => {
  const jx = 600, jw = 330, jh = 430;
  const holdRock: Pose = { hip: [0, -HIP_H], lean: -6, head: 14, hN: [70, 30], hF: [58, 38], fN: [22, 0], fF: [-22, 0], elbow: 1 };
  return (
    <g>
      <Label y={230} t="Small things first" />
      <Ground y={G1} />
      <Jar x={jx} y={G1} w={jw} h={jh}>
        <Sand x={jx - jw / 2} y={G1 - jh + 40} w={jw} h={jh} />
      </Jar>
      {[["phone", G1 - 300], ["games", G1 - 200], ["news", G1 - 100]].map(([t, y]) => <Label key={t as string} x={jx} y={y as number} t={t as string} size={30} color="#d8d8de" weight={500} />)}
      {/* the big things no longer fit: one balanced on the rim, one on the floor */}
      <Stone x={jx + 10} y={G1 - jh - 20} r={62} t="GOALS" seed={4} rot={-8} />
      <Stone x={jx + 280} y={G1 - 52} r={58} t="FAMILY" seed={7} rot={6} />
      <Hero x={230} y={G1} s={S} look={BOLD} pose={holdRock} hold={(j: Joints) => <Stone x={(j.wN[0] + j.wF[0]) / 2 + 30} y={(j.wN[1] + j.wF[1]) / 2 - 24} r={56} t="HEALTH" seed={2} />} />
      <Label x={230} y={G1 - 330} t="?" size={64} color="#9a9aa2" weight={700} />

      <Label y={1010} t="Big things first" />
      <Ground y={G2} />
      <Jar x={jx} y={G2} w={jw} h={jh} lid>
        <Sand x={jx - jw / 2} y={G2 - jh + 70} w={jw} h={jh} seed={5} />
        <Stone x={jx - 70} y={G2 - 80} r={64} t="HEALTH" seed={2} />
        <Stone x={jx + 72} y={G2 - 92} r={60} t="FAMILY" seed={7} rot={8} />
        <Stone x={jx} y={G2 - 228} r={62} t="GOALS" seed={4} rot={-6} />
      </Jar>
      <Glow at={[jx, G2 - 200]} r={260} color={GOLD} a={0.25} />
      <Hero x={230} y={G2} s={S} look={BOLD} pose={POSES.armsUp()} />
    </g>
  );
};

// ---------------------------------------------------------------- 4 · Burning 200% / Burning every day (the candle)
export const Flame: React.FC<{ x: number; y: number; s?: number; f: number; rot?: number }> = ({ x, y, s = 1, f, rot = 0 }) => {
  const w = Math.sin(f * 0.5) * 3;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d={`M0 0 C-22 -18 -18 -48 ${w} -80 C18 -48 22 -18 0 0 Z`} fill={GOLD} />
      <path d={`M0 -4 C-10 -16 -8 -34 ${w * 0.6} -50 C8 -34 10 -16 0 -4 Z`} fill="#fff4cf" />
    </g>
  );
};
export const Smoke: React.FC<{ x: number; y: number; color?: string }> = ({ x, y, color = "#8a8a92" }) => (
  <path d={`M${x} ${y} c-20 -30 20 -50 0 -80 c-20 -30 20 -50 0 -80`} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" opacity={0.7} />
);
const Seg4: React.FC = () => {
  const f = 0;
  const reading: Pose = { hip: [0, -26], lean: 6, head: 26, hN: [70, 26], hF: [62, 34], fN: [120, 0], fF: [108, 0], elbow: 1 };
  const cx2 = 650, cH = 230; // bottom candle: still tall at DAY 365
  return (
    <g>
      <Label y={230} t="Burning 200%" />
      <Ground y={G1} />
      {/* a stub burnt from BOTH ends, lying on its stand, smoking red */}
      <rect x={560} y={G1 - 40} width={200} height={40} rx={6} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} />
      <rect x={612} y={G1 - 78} width={96} height={38} rx={8} fill="url(#sh-wax)" stroke="#000" strokeWidth={3} />
      <rect x={604} y={G1 - 76} width={14} height={34} rx={4} fill="#2a2a2e" />
      <rect x={702} y={G1 - 76} width={14} height={34} rx={4} fill="#2a2a2e" />
      <Smoke x={604} y={G1 - 66} color={RED} />
      <Smoke x={716} y={G1 - 66} color={RED} />
      <path d="M560 830 q30 -6 40 -18" fill="none" stroke="#d8d2c0" strokeWidth={8} strokeLinecap="round" />
      <Hero x={300} y={G1} s={S} look={BOLD_GREY} pose={POSES.hugKnees()} shadow={0} />
      <Label x={1000} y={G1 + 70} anchor="end" t="DAY 30" size={34} color={RED} />

      <Label y={1010} t="Burning every day" />
      <Ground y={G2} />
      <Glow at={[cx2, G2 - cH - 60]} r={420} color={GOLD} a={0.42} />
      <ellipse cx={cx2} cy={G2 - 6} rx={110} ry={16} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} />
      <rect x={cx2 - 38} y={G2 - cH} width={76} height={cH - 10} rx={8} fill="url(#sh-wax)" stroke="#000" strokeWidth={3} />
      <path d={`M${cx2 - 38} ${G2 - cH + 20} q10 30 0 60`} fill="none" stroke="#fffaf0" strokeWidth={8} strokeLinecap="round" />
      <line x1={cx2} y1={G2 - cH} x2={cx2} y2={G2 - cH - 16} stroke="#222" strokeWidth={5} />
      <Flame x={cx2} y={G2 - cH - 10} f={f} s={1.1} />
      <Hero x={330} y={G2} s={S} look={BOLD} pose={reading} hold={(j: Joints) => (
        <g transform={`translate(${j.wN[0] + 2} ${j.wN[1] - 18}) rotate(-30)`}>
          <path d="M0 0 L-46 -12 L-46 40 L0 52 Z" fill="#f2f2f2" stroke="#000" strokeWidth={3} />
          <path d="M0 0 L46 -12 L46 40 L0 52 Z" fill="#dcdcdc" stroke="#000" strokeWidth={3} />
        </g>
      )} />
      <Label x={1000} y={G2 + 70} anchor="end" t="DAY 365" size={34} color={GOLD} />
    </g>
  );
};

// ---------------------------------------------------------------- 5 · Waiting for a bridge / Building one
export const Cliffs: React.FC<{ y: number; gapL: number; gapR: number }> = ({ y, gapL, gapR }) => (
  <g>
    <path d={`M0 ${y} L${gapL} ${y} L${gapL - 20} ${y + 70} L${gapL + 6} ${y + 130} L${gapL - 30} ${y + 160} L0 ${y + 160} Z`} fill="url(#sh-cliff)" />
    <path d={`M1080 ${y} L${gapR} ${y} L${gapR + 24} ${y + 80} L${gapR - 6} ${y + 130} L${gapR + 30} ${y + 160} L1080 ${y + 160} Z`} fill="url(#sh-cliff)" />
    <path d={`M0 ${y} L${gapL} ${y} L${gapL - 20} ${y + 70}`} fill="none" stroke="#9a9aa2" strokeWidth={5} strokeLinejoin="round" />
    <path d={`M1080 ${y} L${gapR} ${y} L${gapR + 24} ${y + 80}`} fill="none" stroke="#9a9aa2" strokeWidth={5} strokeLinejoin="round" />
  </g>
);
const Seg5: React.FC = () => {
  const gapL = 330, gapR = 760;
  const watch: Pose = { hip: [0, -HIP_H], lean: 2, head: 30, hN: [56, 12], hF: [44, 20], fN: [18, 0], fF: [-18, 0], elbow: 1 };
  const plankW = 62, nPl = 4;
  return (
    <g>
      <Label y={230} t="Waiting for a bridge" />
      <Cliffs y={G1} gapL={gapL} gapR={gapR} />
      <line x1={900} y1={G1} x2={900} y2={G1 - 240} stroke="#cfcfd6" strokeWidth={6} />
      <path d={`M900 ${G1 - 238} L980 ${G1 - 216} L900 ${G1 - 194} Z`} fill="#6e6e76" />
      <Hero x={230} y={G1} s={S} look={BOLD} pose={watch} hold={(j: Joints) => <circle cx={j.wN[0] - 6} cy={j.wN[1]} r={11} fill="#1b1d24" stroke="#cfcfd6" strokeWidth={4} />} />
      <Label x={250} y={G1 - 330} t="Someday..." size={34} color="#8a8a92" weight={500} />

      <Label y={1010} t="Building one" />
      <Cliffs y={G2} gapL={gapL} gapR={gapR} />
      {/* guide ropes + the planks laid so far (gold) */}
      <path d={`M${gapL - 10} ${G2 - 70} Q${(gapL + gapR) / 2} ${G2 - 20} ${gapR + 10} ${G2 - 70}`} fill="none" stroke="#8a8a92" strokeWidth={4} />
      <line x1={gapL - 10} y1={G2} x2={gapL - 10} y2={G2 - 80} stroke="#6a6a72" strokeWidth={10} strokeLinecap="round" />
      <line x1={gapR + 10} y1={G2} x2={gapR + 10} y2={G2 - 80} stroke="#6a6a72" strokeWidth={10} strokeLinecap="round" />
      {Array.from({ length: nPl }, (_, i) => <rect key={i} x={gapL + i * (plankW + 6)} y={G2 - 4} width={plankW} height={22} rx={4} fill="url(#sh-gold)" stroke="#000" strokeWidth={3} />)}
      <Glow at={[gapL + nPl * (plankW + 6) / 2, G2]} r={220} color={GOLD} a={0.28} />
      {/* planks waiting on the near cliff */}
      {[0, 1, 2].map((i) => <rect key={i} x={80} y={G2 - 22 - i * 22} width={150} height={22} rx={4} fill="url(#sh-gold)" stroke="#000" strokeWidth={3} />)}
      <line x1={900} y1={G2} x2={900} y2={G2 - 240} stroke="#f2f2f2" strokeWidth={6} />
      <path d={`M900 ${G2 - 238} L980 ${G2 - 216} L900 ${G2 - 194} Z`} fill={GOLD} />
      <Hero x={gapL + nPl * (plankW + 6) - 40} y={G2 - 4} s={S} look={BOLD} pose={POSES.crouch()} hold={(j: Joints) => (
        <rect x={j.wN[0] - 20} y={j.wN[1] - 14} width={plankW} height={22} rx={4} fill="url(#sh-gold)" stroke="#000" strokeWidth={3} />
      )} />

      <Label y={1830} t="Nobody is coming to build it." size={40} color={GOLD} />
    </g>
  );
};

const SEGS = [Seg1, Seg2, Seg3, Seg4, Seg5];
export const SameHoursStyle: React.FC = () => {
  const f = useCurrentFrame();
  const Seg = SEGS[Math.min(SEGS.length - 1, f)];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <KitDefs />
        <Defs />
        <Seg />
        <text x={540} y={1890} textAnchor="middle" fontFamily={SANS} fontSize={20} letterSpacing={4} fill="#3a3a40">CHANNEL NAME</text>
        <Vignette a={0.3} />
      </svg>
    </AbsoluteFill>
  );
};
