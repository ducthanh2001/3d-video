// PaydayBoard: key frames of PAYDAY v3 for approval (frame n = key frame n). Minimal competitor grammar:
// pure black, one thin ground line, white stick figures, objects as plain white line icons, GOLD = money, RED = alarm.
// 0 payday (meter full) · 1 three days later (meter 8%) · 2 "it's only $6" · 3 want / need · 4 spend-then-save / save-then-spend
// 5 "I'll save what's left" · 6 the leaks · 7 day 30
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { V } from "../../kit/core";
import { Hero, LOOK_WHITE, POSES, Pose, walk } from "../../kit/hero";
import { KitDefs } from "../../kit/materials";
import { MoneyPile as KitMoneyPile } from "../../kit/props";

import { GOLD, RED, LBL, MONO } from "../truths/StyleFrames";

export const PAYDAY_KEYS = 10;
// same identity as the published "1% better" video: colours, label font, monospace numbers
export const W = "#f2f2f2", G = "#8a8a90";
export const CAP = LBL;
export const BIG = MONO;
export const SW = 5; // icon stroke

// ---------------------------------------------------------------- shared pieces
export const Ground: React.FC<{ y: number }> = ({ y }) => <line x1={0} y1={y} x2={1080} y2={y} stroke="#5a5a60" strokeWidth={3} />;
export const Label: React.FC<{ y: number; t: string; color?: string; size?: number }> = ({ y, t, color = W, size = 34 }) => (
  <text x={540} y={y} textAnchor="middle" fontFamily={CAP} fontWeight={600} fontSize={size} letterSpacing={4} fill={color}>{t}</text>
);
/** the $ meter: white frame, gold (or red) fill from the bottom, a $ above */
export const Meter: React.FC<{ x: number; y: number; w?: number; h?: number; p: number; red?: boolean; glow?: boolean }> = ({ x, y, w = 70, h = 220, p, red, glow = true }) => {
  const c = red ? RED : GOLD, fh = (h - 12) * p;
  return (
    <g>
      {glow && p > 0.05 && <rect x={x - 10} y={y + h - fh - 16} width={w + 20} height={fh + 22} rx={20} fill={c} opacity={0.25} filter="url(#k-blur10)" />}
      <text x={x + w / 2} y={y - 18} textAnchor="middle" fontFamily={BIG} fontSize={w * 0.62} fill={W}>$</text>
      <rect x={x} y={y} width={w} height={h} rx={12} fill="none" stroke={W} strokeWidth={SW} />
      <rect x={x + 6} y={y + h - 6 - fh} width={w - 12} height={fh} rx={7} fill={c} />
      <text x={x + w / 2} y={y + h + 46} textAnchor="middle" fontFamily={BIG} fontSize={30} fill={c}>{Math.round(p * 100)}%</text>
    </g>
  );
};
export const Corner: React.FC<{ p: number; red?: boolean }> = ({ p, red }) => <Meter x={950} y={120} w={44} h={140} p={p} red={red} glow={false} />;
export const Fig: React.FC<{ x: number; y: number; pose: Pose; s?: number; flip?: boolean; hold?: Parameters<typeof Hero>[0]["hold"]; grey?: boolean }> = ({ x, y, pose, s = 0.8, flip, hold, grey }) => (
  <Hero x={x} y={y} pose={pose} s={s} flip={flip} hold={hold} shadow={0} look={grey ? { ...LOOK_WHITE, body: "#bdbdbd", far: "#7a7a80", glow: 0.2 } : { ...LOOK_WHITE, glow: 0.35 }} />
);
export const scratch: Pose = { ...POSES.stand(), head: 14, hN: [30, -40], elbow: -1 };

// line icons (all drawn around (0,0), white stroke, black fill)
export const Cup: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="#000" stroke={W} strokeWidth={SW / s} strokeLinejoin="round">
    <path d="M-30 -60 L30 -60 L22 0 L-22 0 Z" /><rect x={-36} y={-74} width={72} height={14} rx={4} /><path d="M27 -46 Q48 -42 40 -22 Q34 -12 24 -16" fill="none" />
  </g>
);
export const Cart: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={W} strokeWidth={SW} strokeLinejoin="round" strokeLinecap="round">
    <path d="M-150 -170 L-120 -170 L-96 -50 L110 -50 L130 -140 L-110 -140" />
    {[-60, -10, 40, 90].map((vx) => <line key={vx} x1={vx} y1={-140} x2={vx - 4} y2={-50} strokeWidth={2.5} />)}
    <line x1={-104} y1={-95} x2={120} y2={-95} strokeWidth={2.5} />
    <circle cx={-70} cy={-22} r={18} fill="#000" /><circle cx={90} cy={-22} r={18} fill="#000" />
  </g>
);
export const Item: React.FC<{ kind: "shoe" | "phones" | "watch" | "box" | "bag"; x: number; y: number; s?: number; r?: number }> = ({ kind, x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} fill="#000" stroke={W} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">
    {kind === "shoe" && <path d="M-40 10 L-40 -20 Q-20 -22 -8 -10 Q20 -4 40 0 L40 10 Z" />}
    {kind === "phones" && <><path d="M-26 6 Q-26 -30 0 -30 Q26 -30 26 6" fill="none" /><rect x={-34} y={-4} width={14} height={22} rx={5} /><rect x={20} y={-4} width={14} height={22} rx={5} /></>}
    {kind === "watch" && <><circle r={20} /><line x1={0} y1={0} x2={0} y2={-12} /><line x1={0} y1={0} x2={9} y2={0} /><rect x={-9} y={-38} width={18} height={18} /><rect x={-9} y={20} width={18} height={18} /></>}
    {kind === "box" && <><rect x={-28} y={-28} width={56} height={56} rx={4} /><line x1={-28} y1={-8} x2={28} y2={-8} /></>}
    {kind === "bag" && <><rect x={-26} y={-24} width={52} height={50} rx={5} /><path d="M-12 -24 Q-12 -42 0 -42 Q12 -42 12 -24" fill="none" /></>}
  </g>
);
/** a pitcher (the salary) tilted by `tilt` degrees, gold inside */
const Pitcher: React.FC<{ x: number; y: number; tilt?: number; level?: number }> = ({ x, y, tilt = 0, level = 0.6 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt})`}>
    <clipPath id={`pc${x}${y}`}><path d="M-40 -90 L40 -90 L50 0 L-50 0 Z" /></clipPath>
    <rect x={-60} y={-90 * level} width={120} height={90 * level} fill={GOLD} clipPath={`url(#pc${x}${y})`} />
    <path d="M-40 -90 L40 -90 L50 0 L-50 0 Z" fill="none" stroke={W} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M40 -90 L62 -104" stroke={W} strokeWidth={SW} strokeLinecap="round" />
    <path d="M-44 -70 Q-80 -60 -70 -30 Q-62 -14 -47 -18" fill="none" stroke={W} strokeWidth={SW} />
    <text x={0} y={-30} textAnchor="middle" fontFamily={BIG} fontSize={26} fill="#000">$2,000</text>
  </g>
);
/** a glass jar with a gold level; label under it */
/** a glass jar filled with a stack of green dollar bills up to `level` */
export const Jar: React.FC<{ x: number; y: number; level: number; label?: string; w?: number; h?: number }> = ({ x, y, level, label, w = 110, h = 140 }) => (
  <g transform={`translate(${x} ${y})`}>
    {level > 0.02 && <rect x={-w / 2 - 10} y={-h * level - 10} width={w + 20} height={h * level + 10} rx={16} fill="#4ea55a" opacity={0.22} filter="url(#k-blur10)" />}
    {Array.from({ length: Math.max(0, Math.round((h * level - 6) / 13)) }, (_, i) => (
      <rect key={i} x={-w / 2 + 8 + (i % 2) * 3} y={-8 - (i + 1) * 13} width={w - 19} height={12} rx={2} fill={i % 2 ? "#4ea55a" : "#3f8f4a"} stroke="#14361a" strokeWidth={1.5} />
    ))}
    <rect x={-w / 2} y={-h} width={w} height={h} rx={14} fill="none" stroke={W} strokeWidth={SW} />
    <rect x={-w / 2 - 6} y={-h - 18} width={w + 12} height={18} rx={4} fill="#000" stroke={W} strokeWidth={4} />
    {label && <text x={0} y={34} textAnchor="middle" fontFamily={CAP} fontWeight={700} fontSize={24} letterSpacing={2} fill={G}>{label}</text>}
  </g>
);
export const SmallCup: React.FC<{ x: number; y: number; level: number }> = ({ x, y, level }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-24} y={-60 * level} width={48} height={60 * level} fill={GOLD} />
    <path d="M-28 -64 L28 -64 L22 0 L-22 0 Z" fill="none" stroke={W} strokeWidth={4} strokeLinejoin="round" />
  </g>
);
const Pour: React.FC<{ from: V; to: V }> = ({ from, to }) => (
  <path d={`M${from[0]} ${from[1]} Q${from[0] + 10} ${(from[1] + to[1]) / 2} ${to[0]} ${to[1]}`} fill="none" stroke={GOLD} strokeWidth={9} strokeLinecap="round" />
);

export const Frame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920"><KitDefs />{children}
      <text x={540} y={1790} textAnchor="middle" fontFamily={CAP} fontSize={20} letterSpacing={6} fill="#ffffff" opacity={0.18}>CHANNEL NAME</text>
    </svg>
  </AbsoluteFill>
);

// ---------------------------------------------------------------- key frames
const K0 = () => (
  <Frame>
    <Label y={420} t="PAYDAY" size={44} />
    <Ground y={1300} />
    <Meter x={640} y={800} w={130} h={420} p={1} />
    <Fig x={400} y={1300 - 70} pose={POSES.celebrate(4)} s={0.95} />
  </Frame>
);
const K1 = () => (
  <Frame>
    <Label y={420} t="3 DAYS LATER" size={44} />
    <Label y={490} t="WHERE DID IT GO?" size={30} color={G} />
    <Ground y={1300} />
    <Meter x={640} y={800} w={130} h={420} p={0.08} red />
    <Fig x={400} y={1300} pose={scratch} s={0.95} />
  </Frame>
);
const K2 = () => (
  <Frame>
    <Corner p={0.82} />
    <Label y={420} t={'"IT\'S ONLY $6"'} size={40} />
    <Ground y={1500} />
    {Array.from({ length: 22 }, (_, i) => { const c = i % 2, r = Math.floor(i / 2); return <Cup key={i} x={660 + c * 92} y={1500 - r * 80} s={0.95} />; })}
    <Fig x={330} y={1500} pose={{ ...POSES.stand(), head: -24, lean: -4 }} s={0.85} />
    <text x={330} y={1060} textAnchor="middle" fontFamily={BIG} fontSize={64} fill={GOLD}>$132</text>
    <text x={330} y={1110} textAnchor="middle" fontFamily={CAP} fontWeight={600} fontSize={26} fill={G}>$6 × 22 DAYS</text>
  </Frame>
);
/** v3 (replaced by the closet in v3.1, kept as an alternate) */
export const K3_WantNeed = () => (
  <Frame>
    <Corner p={0.55} />
    <Label y={330} t="WANT" />
    <Ground y={860} />
    <Fig x={210} y={860} pose={POSES.push()} s={0.7} />
    <Cart x={430} y={860} s={0.95} />
    {(["shoe", "phones", "watch", "box", "bag", "shoe"] as const).map((k, i) => <Item key={i} kind={k} x={350 + (i % 3) * 70} y={760 - Math.floor(i / 3) * 60} s={0.9} r={(i - 2) * 9} />)}
    {/* the pile slides into NEVER USED */}
    <g transform="translate(830 860)">
      <rect x={-110} y={-150} width={220} height={150} fill="#000" stroke={W} strokeWidth={SW} />
      <path d="M-110 -150 L-140 -190 M110 -150 L140 -190" stroke={W} strokeWidth={SW} />
      <text x={0} y={-62} textAnchor="middle" fontFamily={BIG} fontSize={28} fill={RED}>NEVER</text>
      <text x={0} y={-28} textAnchor="middle" fontFamily={BIG} fontSize={28} fill={RED}>USED</text>
    </g>
    <Item kind="box" x={760} y={640} s={0.8} r={20} /><Item kind="shoe" x={840} y={600} s={0.8} r={-30} />
    <path d="M560 720 Q680 560 790 650" fill="none" stroke={G} strokeWidth={3} strokeDasharray="10 12" />
    <Label y={1070} t="NEED" />
    <Ground y={1600} />
    <Fig x={210} y={1600} pose={POSES.push()} s={0.7} />
    <Cart x={430} y={1600} s={0.95} />
    <Item kind="bag" x={420} y={1500} s={1} />
  </Frame>
);
const pourPose: Pose = { hip: [0, -188], lean: 6, head: 18, hN: [96, -10], hF: [84, 10], fN: [22, 0], fF: [-20, 0] };
/** v3 (replaced by the money pile in v3.1, kept as an alternate) */
export const K4_Pour = () => (
  <Frame>
    <Corner p={0.35} />
    <Label y={330} t="SPEND, THEN SAVE" />
    <Ground y={860} />
    <Fig x={170} y={860} pose={pourPose} s={0.7} />
    <Pitcher x={290} y={700} tilt={58} level={0.15} />
    <Pour from={[352, 690]} to={[412, 796]} />
    {[0.9, 0.85, 0.95, 0.8, 0.9, 0.7].map((l, i) => <SmallCup key={i} x={420 + i * 74} y={860} level={l} />)}
    <Jar x={930} y={860} level={0.03} label="SAVINGS" />
    <text x={930} y={640} textAnchor="middle" fontFamily={BIG} fontSize={34} fill={RED}>$0</text>
    <Label y={1070} t="SAVE, THEN SPEND" />
    <Ground y={1600} />
    <Fig x={170} y={1600} pose={pourPose} s={0.7} />
    <Pitcher x={290} y={1440} tilt={58} level={0.4} />
    <Pour from={[352, 1430]} to={[420, 1520]} />
    <Jar x={440} y={1600} level={0.55} label="SAVINGS" />
    {[0.0, 0.0, 0.0, 0.0, 0.0].map((l, i) => <SmallCup key={i} x={600 + i * 74} y={1600} level={l} />)}
    <text x={440} y={1400} textAnchor="middle" fontFamily={BIG} fontSize={34} fill={GOLD}>+$400</text>
  </Frame>
);
/** v3 alternate (dropped in v3.2: same idea as the money pile) */
export const K5_Left = () => {
  const letters = ["L", "E", "F", "T"];
  return (
    <Frame>
      <Corner p={0.12} red />
      <Label y={700} t={"\"I'LL SAVE WHAT'S"} size={56} />
      {letters.map((c, i) => <text key={c} x={390 + i * 100} y={820 + [0, 120, 300, 520][i]} textAnchor="middle" fontFamily={CAP} fontWeight={700} fontSize={110} fill={W} opacity={[1, 0.8, 0.55, 0.3][i]} transform={`rotate(${[0, 18, -34, 62][i]} ${390 + i * 100} ${820 + [0, 120, 300, 520][i]})`}>{c}</text>)}
      <Ground y={1500} />
      <Fig x={540} y={1500} pose={{ ...POSES.sad() }} s={0.8} />
      <text x={540} y={1640} textAnchor="middle" fontFamily={BIG} fontSize={56} fill={RED}>$0 LEFT</text>
    </Frame>
  );
};
/** v3 alternate (replaced by the hole in your pocket in v3.2) */
export const K6_Bucket = () => (
  <Frame>
    <Corner p={0.05} red />
    <Label y={420} t="THE LEAKS" size={44} />
    <Ground y={1500} />
    {/* tap */}
    <path d="M540 640 L540 700 L620 700" fill="none" stroke={W} strokeWidth={SW} />
    <rect x={518} y={700} width={44} height={30} fill="#000" stroke={W} strokeWidth={4} />
    <line x1={540} y1={730} x2={540} y2={1050} stroke={GOLD} strokeWidth={14} strokeLinecap="round" />
    {/* bucket */}
    <clipPath id="bk"><path d="M380 1000 L700 1000 L660 1460 L420 1460 Z" /></clipPath>
    <rect x={360} y={1300} width={360} height={170} fill={GOLD} clipPath="url(#bk)" />
    <path d="M380 1000 L700 1000 L660 1460 L420 1460 Z" fill="none" stroke={W} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M380 1000 Q540 900 700 1000" fill="none" stroke={W} strokeWidth={4} />
    {([[410, 1330, "$15/mo", -1], [430, 1410, "$15/mo", -1], [668, 1330, "$12/mo", 1], [650, 1410, "$9/mo", 1]] as [number, number, string, number][]).map(([hx, hy, t, d], i) => (
      <g key={i}>
        <circle cx={hx} cy={hy} r={7} fill="#000" stroke={W} strokeWidth={3} />
        <path d={`M${hx} ${hy} Q${hx + d * 60} ${hy + 10} ${hx + d * 70} 1496`} fill="none" stroke={GOLD} strokeWidth={6} strokeLinecap="round" />
        <text x={hx + d * 120} y={hy + 8} textAnchor="middle" fontFamily={BIG} fontSize={26} fill={RED}>{t}</text>
      </g>
    ))}
    <text x={540} y={1640} textAnchor="middle" fontFamily={BIG} fontSize={50} fill={GOLD}>$51 × 12 = $612 / YEAR</text>
  </Frame>
);
const K7 = () => (
  <Frame>
    <Label y={360} t="DAY 30." size={44} />
    <Label y={430} t="SAME SALARY. DIFFERENT ORDER." size={30} color={G} />
    <Ground y={1400} />
    <Meter x={230} y={900} w={110} h={360} p={0} red />
    <Fig x={170} y={1400} pose={POSES.sad()} s={0.75} grey />
    <Meter x={640} y={900} w={110} h={360} p={0.2} />
    <Jar x={850} y={1400} level={0.9} w={130} h={180} />
    <Fig x={600} y={1400} pose={{ ...POSES.stand(), head: -6 }} s={0.75} />
    <text x={850} y={1150} textAnchor="middle" fontFamily={BIG} fontSize={44} fill={GOLD}>$4,800</text>
    <text x={850} y={1192} textAnchor="middle" fontFamily={CAP} fontWeight={600} fontSize={24} fill={G}>/ YEAR</text>
  </Frame>
);

// ---------------------------------------------------------------- v3.1: money pile, closet, 2 AM cart
/** a pile of green dollar bills (the kit's MoneyPile, the same look as the competitor's money heap); amount 0..1 shrinks it */
export const MoneyPile: React.FC<{ x: number; y: number; w?: number; h?: number; amount: number; seed?: number }> = ({ x, y, w = 380, h = 200, amount, seed = 1 }) => {
  if (amount <= 0.01) return null;
  return <KitMoneyPile x={x} y={y} w={w * (0.4 + 0.6 * amount)} h={h * amount} seed={seed} f={30} />;
};
/** a dollar bill flying off the pile (t 0..1 along an arc), fluttering */
export const FlyingCoin: React.FC<{ from: V; to: V; t: number }> = ({ from, to, t }) => {
  const x = from[0] + (to[0] - from[0]) * t, y = from[1] + (to[1] - from[1]) * t - Math.sin(t * Math.PI) * 80;
  return <Bill x={x} y={y} r={-20 + t * 60} />;
};
export const BILL = "#3f8f4a", BILL_INK = "#14361a";
export const Bill: React.FC<{ x: number; y: number; r?: number; s?: number }> = ({ x, y, r = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-26} y={-12} width={52} height={24} rx={3} fill={BILL} stroke={BILL_INK} strokeWidth={2} />
    <rect x={-20} y={-7} width={40} height={14} rx={2} fill="none" stroke="#9fd9a2" strokeWidth={1.5} opacity={0.7} />
    <circle r={5} fill="#9fd9a2" opacity={0.8} />
  </g>
);
export const sitOn = (seatPx: number, s: number): Pose => ({ ...POSES.sit(seatPx / s), lean: 2, head: 4 });
export const Shirt: React.FC<{ x: number; y: number; s?: number; r?: number; tag?: boolean }> = ({ x, y, s = 1, r = 0, tag }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d="M-30 -36 L-12 -42 Q0 -32 12 -42 L30 -36 L44 -14 L30 -6 L26 -16 L26 40 L-26 40 L-26 -16 L-30 -6 L-44 -14 Z" fill="#000" stroke={W} strokeWidth={4} strokeLinejoin="round" />
    {tag && <><line x1={26} y1={-14} x2={50} y2={8} stroke={RED} strokeWidth={2} /><rect x={44} y={6} width={22} height={14} rx={2} fill={RED} /></>}
  </g>
);
export const Parcel: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="#000" stroke={W} strokeWidth={4} strokeLinejoin="round">
    <rect x={-40} y={-56} width={80} height={56} rx={3} /><line x1={0} y1={-56} x2={0} y2={0} strokeWidth={3} /><line x1={-40} y1={-40} x2={40} y2={-40} strokeWidth={3} />
  </g>
);

const KCloset = () => (
  <Frame>
    <Corner p={0.6} />
    <Label y={420} t={'"I HAVE NOTHING TO WEAR."'} size={38} />
    <Ground y={1450} />
    {/* wardrobe, doors open, stuffed */}
    <g transform="translate(700 1450)">
      <rect x={-170} y={-520} width={340} height={520} fill="#000" stroke={W} strokeWidth={SW} />
      <path d="M-170 -520 L-250 -490 L-250 -20 L-170 0" fill="#000" stroke={W} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M170 -520 L250 -490 L250 -20 L170 0" fill="#000" stroke={W} strokeWidth={SW} strokeLinejoin="round" />
      <line x1={-160} y1={-470} x2={160} y2={-470} stroke={W} strokeWidth={4} />
      {Array.from({ length: 7 }, (_, i) => <Shirt key={i} x={-130 + i * 44} y={-400} s={0.9} tag={i % 2 === 0} />)}
      {Array.from({ length: 6 }, (_, i) => <Shirt key={`b${i}`} x={-120 + i * 48} y={-230} s={0.85} r={(i - 2.5) * 6} tag={i % 3 === 1} />)}
      <Shirt x={-60} y={-40} s={0.9} r={-70} tag /><Shirt x={40} y={-30} s={0.9} r={80} /><Shirt x={150} y={-20} s={0.8} r={15} tag />
    </g>
    <text x={700} y={1530} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={30} fill={RED}>TAGS STILL ON</text>
    <Fig x={280} y={1450} pose={scratch} s={0.85} hold={(j) => <g transform={`translate(${j.wF[0]} ${j.wF[1]})`}><Item kind="bag" x={0} y={34} s={1.1} /></g>} />
    <Item kind="bag" x={190} y={1424} s={1.1} /><Item kind="bag" x={380} y={1424} s={1.1} />
  </Frame>
);
const KPileStart = () => (
  <Frame>
    <Corner p={1} />
    <Label y={330} t="SPEND, THEN SAVE" />
    <Ground y={860} />
    <MoneyPile x={400} y={860} amount={1} seed={1} />
    <Fig x={390} y={860 - 196} pose={sitOn(10, 0.7)} s={0.7} />
    <Jar x={880} y={860} level={0} label="SAVINGS" />
    <Label y={1070} t="SAVE, THEN SPEND" />
    <Ground y={1600} />
    <MoneyPile x={400} y={1600} amount={1} seed={2} />
    <Fig x={390} y={1600 - 196} pose={sitOn(10, 0.7)} s={0.7} />
    <Jar x={880} y={1600} level={0} label="SAVINGS" />
  </Frame>
);
const KPileEnd = () => (
  <Frame>
    <Corner p={0.3} />
    <Label y={330} t="SPEND, THEN SAVE" />
    <Ground y={860} />
    <MoneyPile x={400} y={860} amount={0.12} seed={1} />
    <Fig x={380} y={860} pose={POSES.hugKnees()} s={0.7} />
    {[0.2, 0.5, 0.8].map((t, i) => <FlyingCoin key={i} from={[420, 820]} to={[[640, 700, 760][i], 700]} t={t} />)}
    <Item kind="bag" x={640} y={780} s={0.9} /><Cup x={710} y={820} s={0.6} /><Shirt x={770} y={790} s={0.7} />
    <Jar x={930} y={860} level={0.03} label="SAVINGS" />
    <text x={930} y={680} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={34} fill={RED}>$0</text>
    <Label y={1070} t="SAVE, THEN SPEND" />
    <Ground y={1600} />
    <MoneyPile x={380} y={1600} amount={0.55} seed={2} />
    <Fig x={370} y={1600 - 110} pose={sitOn(10, 0.7)} s={0.7} />
    <Jar x={860} y={1600} level={0.6} label="SAVINGS" />
    <FlyingCoin from={[480, 1500]} to={[850, 1470]} t={0.6} />
    <text x={860} y={1400} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={34} fill={GOLD}>+$400</text>
  </Frame>
);
const K2am = () => (
  <Frame>
    <Corner p={0.25} />
    <Label y={420} t="2:07 AM" size={44} />
    <Label y={490} t={'"ADD TO CART"'} size={30} color={G} />
    <Ground y={1300} />
    {/* bed side view */}
    <g stroke={W} strokeWidth={SW} fill="#000" strokeLinejoin="round">
      <rect x={120} y={1180} width={480} height={60} rx={10} />
      <rect x={110} y={1080} width={24} height={220} rx={6} /><rect x={590} y={1150} width={24} height={150} rx={6} />
      <rect x={140} y={1146} width={110} height={36} rx={14} />
    </g>
    <Fig x={300} y={1180} pose={{ hip: [0, -24], lean: -80, head: -30, hN: [70, -40], hF: [60, -30], fN: [200, -14], fF: [194, -10], elbow: -1 }} s={0.7} flip
      hold={(j) => <g transform={`translate(${j.wN[0] + 8} ${j.wN[1] - 18}) rotate(20)`}><rect x={-14} y={-26} width={28} height={50} rx={5} fill="#f2f2f2" /><rect x={-10} y={-20} width={20} height={38} rx={2} fill="#000" /><circle r={44} fill="#fff" opacity={0.18} filter="url(#k-blur10)" /></g>} />
    {/* next morning: parcels at the door */}
    <g stroke={W} strokeWidth={SW} fill="none"><rect x={780} y={860} width={170} height={440} /><circle cx={930} cy={1090} r={6} fill={W} /></g>
    {[[720, 1300, 1], [800, 1300, 1.1], [880, 1300, 0.9], [760, 1244, 0.9], [850, 1236, 1], [800, 1180, 0.8], [960, 1300, 0.8]].map(([px, py, ps], i) => <Parcel key={i} x={px} y={py} s={ps} />)}
    <text x={840} y={1370} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={30} fill={RED}>-$240</text>
  </Frame>
);

// ---------------------------------------------------------------- v3.2: the hole in your pocket (replaces the bucket)
export const WASTE = ["SNACK $3", "DELIVERY FEE $5", "ENERGY DRINK $4", "IMPULSE BUY $20", "LATE FEE $25", "SNACK $3", "ENERGY DRINK $4", "DELIVERY FEE $5"];
export const pocketHole = (j: { hip: V }) => (
  <g transform={`translate(${j.hip[0] - 14} ${j.hip[1] + 6})`}>
    <path d="M-9 -7 L-3 -11 L2 -6 L8 -10 L10 -2 L5 4 L8 9 L-1 8 L-6 11 L-9 4 Z" fill="#000" stroke={W} strokeWidth={2.5} strokeLinejoin="round" />
  </g>
);
const KHoleWalk = () => (
  <Frame>
    <Corner p={0.2} />
    <Label y={420} t="THE HOLE IN YOUR POCKET" size={40} />
    <Ground y={1250} />
    <Fig x={760} y={1250} pose={walk(0.15)} s={0.9} hold={pocketHole} />
    {/* bills falling out behind him, the older ones lying on the ground with what they were spent on */}
    <Bill x={690} y={1010} r={-25} s={1.2} /><Bill x={640} y={1110} r={30} s={1.2} />
    {/* labels alternate between two rows so they never overlap */}
    {[560, 360, 160].map((bx, i) => (
      <g key={bx}>
        <Bill x={bx} y={1238} r={(i % 2 ? 1 : -1) * 12} s={1.1} />
        <line x1={bx} y1={1256} x2={bx} y2={i % 2 ? 1330 : 1282} stroke="#5a2a2a" strokeWidth={2} />
        <text x={bx} y={i % 2 ? 1362 : 1312} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={26} fill={RED}>{WASTE[i]}</text>
      </g>
    ))}
    <path d="M760 1060 L700 1000" stroke={G} strokeWidth={2} strokeDasharray="6 8" />
  </Frame>
);
export const ROAD: V[] = [[90, 1740], [990, 1740], [990, 1490], [90, 1490], [90, 1240], [990, 1240], [990, 990], [600, 990]];
export const alongRoad = (d: number): { p: V; ang: number } => {
  let rest = d;
  for (let i = 1; i < ROAD.length; i++) {
    const a = ROAD[i - 1], b = ROAD[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (rest <= L) { const t = rest / L; return { p: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], ang: Math.atan2(b[1] - a[1], b[0] - a[0]) }; }
    rest -= L;
  }
  return { p: ROAD[ROAD.length - 1], ang: 0 };
};
const KHoleTrail = () => {
  const total = ROAD.slice(1).reduce((s, b, i) => s + Math.hypot(b[0] - ROAD[i][0], b[1] - ROAD[i][1]), 0);
  const n = Math.floor(total / 62);
  return (
    <Frame>
      <Corner p={0.03} red />
      <Label y={360} t="1 MONTH LATER" size={40} />
      <polyline points={ROAD.map((q) => q.join(",")).join(" ")} fill="none" stroke="#3a3a40" strokeWidth={3} />
      {Array.from({ length: n }, (_, i) => {
        const { p } = alongRoad(i * 62 + 20);
        return <Bill key={i} x={p[0] + ((i * 37) % 11) - 5} y={p[1] - 8} r={((i * 53) % 50) - 25} s={0.75} />;
      })}
      {[3, 11, 19, 27, 35].map((k, i) => { const { p } = alongRoad(k * 62 + 20); return <text key={k} x={p[0]} y={p[1] + 40} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={20} fill={RED} opacity={0.85}>{WASTE[i]}</text>; })}
      {/* at the end of the road: hand in the empty pocket */}
      <Fig x={560} y={990} pose={{ ...POSES.stand(), head: 34, hN: [-24, 112], elbow: 1 }} s={0.6} hold={pocketHole} />
      <text x={680} y={900} textAnchor="start" fontFamily={MONO} fontWeight={700} fontSize={44} fill={RED}>$0</text>
      <text x={540} y={500} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={58} fill={RED}>= $265 / MONTH</text>
      <text x={540} y={560} textAnchor="middle" fontFamily={MONO} fontSize={28} fill={G}>$3,180 / YEAR</text>
    </Frame>
  );
};

const KEYS = [K0, K1, K2, KCloset, K2am, KPileStart, KPileEnd, KHoleWalk, KHoleTrail, K7];
export const PaydayBoard: React.FC = () => { const f = useCurrentFrame(); const K = KEYS[Math.min(KEYS.length - 1, f)]; return <K />; };
