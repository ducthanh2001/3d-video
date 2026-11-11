// "Pressure makes diamonds." style frames (one per beat of SCRIPT-pressure-makes-diamonds.md v4), single lane, one figure (YOU).
// Pressure = real cardboard boxes on his shoulders. Black print = real problems handed to him (FIRED, RENT); red handwriting =
// boxes he picks up himself (his own thoughts), which turn out EMPTY. A long night staircase, STEP n / 100 in the corner.
// 0 frame 0: the boss hands him the FIRED box · 1 the landlord stacks RENT · 2 Mom at the window, he picks up SHE'S ASHAMED
// · 3 five boxes, flat on the landing, a new car passes · 4 the top box slides off: empty · 5 two real boxes, climbing
// · 6 the top: HIRED, PAID, one hand.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { V } from "../../kit/core";
import { HIP_H, Hero, Joints, POSES, Pose, solvePose } from "../../kit/hero";
import { KitDefs, Vignette } from "../../kit/materials";
import { Car } from "../../kit/props";
import { Glow, Rays } from "../../kit/fx";
import { BOLD, BOLD_GREY, Defs, GOLD, SANS } from "../samehours/StyleFrames";

export const PRESSURE_FRAMES = 7;
const S = 1.05, H = HIP_H, W = "#f2f2f2", DIM = "#8a8a92", RED = "#c81e18";
const STAMP = '"Arial Black", "Segoe UI Black", Impact, sans-serif';
const HAND = '"Segoe Print", "Ink Free", "Comic Sans MS", cursive';
const STAND = POSES.stand();
const J = (x: number, y: number, pose: Pose, flip = false, s = S) => {
  const j = solvePose(pose), k = flip ? -1 : 1, w = (p: V): V => [x + k * p[0] * s, y + p[1] * s];
  return { wN: w(j.wN), wF: w(j.wF), sh: w(j.sh), head: w(j.head), hip: w(j.hip), neck: w(j.neck) };
};
const reach = (base: Pose, x: number, y: number, tN: V, tF: V, flip = false, s = S): Pose => {
  const sh = solvePose(base).sh, k = flip ? -1 : 1, loc = (t: V): V => [((t[0] - x) * k) / s - sh[0], (t[1] - y) / s - sh[1]];
  return { ...base, hN: loc(tN), hF: loc(tF) };
};

// ---------------------------------------------------------------- the cardboard box (front + top + side, a little 3/4)
type BoxSpec = { w: number; h: number; label: string; red?: boolean; empty?: boolean; open?: number; paid?: boolean };
export const Carton: React.FC<{ x: number; y: number; b: BoxSpec; rot?: number }> = ({ x, y, b, rot = 0 }) => {
  const { w, h } = b, d = w * 0.22, dy = d * 0.55;
  const l = x - w / 2, r = x + w / 2, top = y - h;
  const lines = b.label.split("|"), longest = Math.max(...lines.map((q) => q.length));
  const fs = Math.min(w / (longest * (b.red ? 0.58 : 0.66)), (h * 0.78) / lines.length);
  const op = b.open ?? 0;
  return (
    <g transform={`rotate(${rot} ${x} ${y - h / 2})`}>
      <path d={`M${r} ${top} L${r + d} ${top - dy} L${r + d} ${y - dy} L${r} ${y} Z`} fill="#87602f" stroke="#000" strokeWidth={3} strokeLinejoin="round" />
      <path d={`M${l} ${top} L${l + d} ${top - dy} L${r + d} ${top - dy} L${r} ${top} Z`} fill={op > 0 ? "#2a1d10" : "#c99a60"} stroke="#000" strokeWidth={3} strokeLinejoin="round" />
      {op === 0 && <path d={`M${x - 8} ${top} L${x - 8 + d} ${top - dy} L${x + 8 + d} ${top - dy} L${x + 8} ${top} Z`} fill="#d9c08f" opacity={0.8} />}
      {op > 0 && <g>
        <path d={`M${l} ${top} L${l - 6} ${top - h * 0.5 * op} L${l + d - 4} ${top - dy - h * 0.45 * op} L${l + d} ${top - dy} Z`} fill="#b48450" stroke="#000" strokeWidth={3} strokeLinejoin="round" />
        <path d={`M${r} ${top} L${r + 10} ${top - h * 0.5 * op} L${r + d + 8} ${top - dy - h * 0.45 * op} L${r + d} ${top - dy} Z`} fill="#a87a46" stroke="#000" strokeWidth={3} strokeLinejoin="round" />
      </g>}
      <rect x={l} y={top} width={w} height={h} fill="#b48450" stroke="#000" strokeWidth={3} />
      <line x1={l + 6} y1={top + 8} x2={r - 6} y2={top + 8} stroke="#8f6534" strokeWidth={2} opacity={0.6} />
      <g transform={b.red ? `rotate(-4 ${x} ${top + h / 2})` : undefined}>{lines.map((q, i) => <text key={i} x={x} y={top + h * 0.5 + fs * 0.36 + (i - (lines.length - 1) / 2) * fs * 1.02} textAnchor="middle" fontFamily={b.red ? HAND : STAMP} fontWeight={b.red ? 800 : 400} fontSize={fs} fill={b.red ? RED : "#16110a"}>{q}</text>)}</g>
      {b.paid && <g transform={`rotate(-14 ${x} ${top + h / 2})`}><rect x={x - 54} y={top + h / 2 - 24} width={108} height={48} rx={6} fill="none" stroke={GOLD} strokeWidth={6} /><text x={x} y={top + h / 2 + 14} textAnchor="middle" fontFamily={STAMP} fontSize={36} fill={GOLD}>PAID</text></g>}
    </g>
  );
};
const FIRED: BoxSpec = { w: 170, h: 116, label: "FIRED" };
const RENT: BoxSpec = { w: 180, h: 120, label: "RENT|$1,240" };
const ASHAMED: BoxSpec = { w: 170, h: 112, label: "SHE'S|ASHAMED", red: true };
const AHEAD: BoxSpec = { w: 164, h: 108, label: "EVERYONE'S|AHEAD", red: true };
const FAILURE: BoxSpec = { w: 156, h: 104, label: "I'M A|FAILURE", red: true };
/** a stack of boxes resting on the shoulders, behind the head; returns nodes and the stack height */
const Stack: React.FC<{ sh: V; boxes: BoxSpec[]; lean?: number; dx?: number }> = ({ sh, boxes, lean = 0, dx = -26 }) => {
  let y = sh[1] - 8;
  return (
    <g transform={`rotate(${lean} ${sh[0]} ${sh[1]})`}>
      {boxes.map((b, i) => { const n = <Carton key={i} x={sh[0] + dx + (i % 2 ? 6 : -4)} y={y} b={b} rot={(i % 2 ? 2 : -2)} />; y -= b.h; return n; })}
    </g>
  );
};
/** the pose for carrying a stack on the shoulders: both hands up on the bottom box, knees bent by `load` (0..1) */
const carryPose = (load: number, stepUp = 0): Pose => ({
  hip: [-8 - 16 * load, -H + 10 + 46 * load], lean: 10 + 26 * load, head: 14 + 16 * load,
  hN: [12, -70 + 10 * load], hF: [-22, -66 + 10 * load], elbow: -1,
  fN: [52, -stepUp], fF: [-46 - 20 * load, 0],
});

// ---------------------------------------------------------------- the staircase
const RISE = 34, TREAD = 72;
const Stairs: React.FC<{ x0: number; y0: number; n: number; from?: number }> = ({ x0, y0, n, from = 0 }) => {
  let d = `M${x0 + from * TREAD} ${y0 + 900} L${x0 + from * TREAD} ${y0 - from * RISE}`;
  for (let k = from; k < n; k++) d += ` H${x0 + (k + 1) * TREAD} V${y0 - (k + 1) * RISE}`;
  d += ` H${x0 + n * TREAD + 2000} V${y0 + 900} Z`;
  const rail: V[] = [[x0 + from * TREAD, y0 - from * RISE - 150], [x0 + n * TREAD, y0 - n * RISE - 150]];
  return (
    <g>
      <path d={d} fill="url(#pr-concrete)" stroke="#000" strokeWidth={3} />
      {Array.from({ length: n - from }, (_, i) => { const k = from + i; return <line key={k} x1={x0 + k * TREAD} y1={y0 - k * RISE} x2={x0 + (k + 1) * TREAD} y2={y0 - k * RISE} stroke="#9a9aa2" strokeWidth={4} />; })}
      {Array.from({ length: Math.floor((n - from) / 3) + 1 }, (_, i) => { const k = from + i * 3; return <line key={k} x1={x0 + k * TREAD + 20} y1={y0 - k * RISE} x2={x0 + k * TREAD + 20} y2={y0 - k * RISE - 150 - 20 * RISE / TREAD} stroke="#55555c" strokeWidth={6} />; })}
      <line x1={rail[0][0]} y1={rail[0][1]} x2={rail[1][0]} y2={rail[1][1]} stroke="#6a6a72" strokeWidth={9} strokeLinecap="round" />
    </g>
  );
};
const stepAt = (x0: number, y0: number, k: number): V => [x0 + k * TREAD + TREAD * 0.45, y0 - k * RISE];
const Counter: React.FC<{ n: number; gold?: boolean }> = ({ n, gold }) => (
  <g>
    <text x={1010} y={300} textAnchor="end" fontFamily={SANS} fontWeight={600} fontSize={34} fill={DIM}>STEP</text>
    <text x={1010} y={352} textAnchor="end" fontFamily={SANS} fontWeight={800} fontSize={52} fill={gold ? GOLD : W}>{n} <tspan fontSize={34} fill={DIM}>/ 100</tspan></text>
  </g>
);
const Q: React.FC<{ t: string; y?: number; c?: string; s?: number }> = ({ t, y = 230, c = W, s = 54 }) => <text x={540} y={y} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={s} fill={c}>{t}</text>;
const Sweat: React.FC<{ at: V }> = ({ at }) => <g>{[[-30, -10], [-44, 14], [-22, 26]].map(([dx, dy], i) => <path key={i} d={`M${at[0] + dx} ${at[1] + dy - 10} Q${at[0] + dx + 7} ${at[1] + dy + 2} ${at[0] + dx} ${at[1] + dy + 7} Q${at[0] + dx - 7} ${at[1] + dy + 2} ${at[0] + dx} ${at[1] + dy - 10}Z`} fill="#d4ecff" stroke="#000" strokeWidth={1.5} />)}</g>;
const Tie = (j: Joints) => <path d={`M${j.neck[0] - 4} ${j.neck[1] + 4} L${j.neck[0] + 4} ${j.neck[1] + 4} L${j.neck[0] + 8} ${j.neck[1] + 54} L${j.neck[0]} ${j.neck[1] + 64} L${j.neck[0] - 4} ${j.neck[1] + 54} Z`} fill="#7a1f1f" stroke="#000" strokeWidth={2} />;
const NightWall: React.FC<{ y: number }> = ({ y }) => (
  <g>
    <rect x={0} y={0} width={1080} height={1920} fill="url(#pr-night)" />
    {Array.from({ length: 9 }, (_, i) => <line key={i} x1={0} y1={y - 900 + i * 110} x2={1080} y2={y - 900 + i * 110} stroke="#1c1c22" strokeWidth={3} />)}
  </g>
);
const PrDefs: React.FC = () => (
  <defs>
    <linearGradient id="pr-concrete" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a4a52" /><stop offset="0.4" stopColor="#26262c" /><stop offset="1" stopColor="#0c0c0f" /></linearGradient>
    <linearGradient id="pr-night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0a0a0d" /><stop offset="1" stopColor="#141419" /></linearGradient>
    <linearGradient id="pr-sun" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffcf6a" stopOpacity={0.55} /><stop offset="0.5" stopColor="#ff9a3a" stopOpacity={0.12} /><stop offset="1" stopColor="#000" stopOpacity={0} /></linearGradient>
  </defs>
);

// ================================================================ frames
const F0: React.FC = () => {
  // the office door at the left, the boss hands over the FIRED box; the stairs start at the right
  const g = 1330;
  const boss = reach({ ...STAND, lean: 4, head: 6 }, 250, g, [372, g - 205], [372, g - 160]);
  const you = reach({ ...STAND, hip: [0, -H + 12], lean: -6, head: 8, fN: [26, 0], fF: [-20, 0] }, 560, g, [528, g - 200], [534, g - 156], true);
  return (
    <>
      <NightWall y={g} />
      <rect x={60} y={g - 400} width={200} height={400} fill="#ffe2a8" />
      <path d={`M60 ${g} L260 ${g} L520 ${g + 300} L-120 ${g + 300} Z`} fill="#ffe2a8" opacity={0.12} />
      <rect x={50} y={g - 410} width={220} height={410} fill="none" stroke="#2a2a30" strokeWidth={18} />
      <rect x={90} y={g - 470} width={140} height={44} rx={6} fill="#2a2a30" /><text x={160} y={g - 438} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={26} fill={DIM}>OFFICE</text>
      <Stairs x0={700} y0={g} n={12} />
      <rect x={0} y={g} width={700} height={8} fill="#8a8a92" />
      <Hero x={250} y={g} s={S} look={BOLD_GREY} pose={boss} hold={Tie} />
      <Hero x={560} y={g} s={S} look={BOLD} pose={you} flip />
      <Carton x={450} y={g - 120} b={FIRED} />
      {/* things sticking out of the box: a plant, a mug, a photo frame */}
      <g><line x1={420} y1={g - 212} x2={416} y2={g - 250} stroke="#3f6a35" strokeWidth={5} /><ellipse cx={410} cy={g - 256} rx={16} ry={9} fill="#5a8a4a" stroke="#000" strokeWidth={2} /><ellipse cx={426} cy={g - 246} rx={14} ry={8} fill="#5a8a4a" stroke="#000" strokeWidth={2} />
        <rect x={452} y={g - 236} width={26} height={30} rx={4} fill="#e8e8ec" stroke="#000" strokeWidth={2.5} /><rect x={486} y={g - 246} width={30} height={38} fill="#2a2a30" stroke="#000" strokeWidth={2.5} transform={`rotate(10 500 ${g - 228})`} /></g>
      <text x={560} y={g - 420} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={36} fill={DIM}>YOU</text>
      <Q t="How much can you carry?" y={240} />
      <Counter n={1} />
    </>
  );
};
const F1: React.FC = () => {
  // a landing: the landlord stacks RENT on top of the FIRED box
  const x0 = -260, y0 = 1560, k = 8, [x, y] = stepAt(x0, y0, k);
  const L = 0.35, you = carryPose(L);
  const yj = J(x, y, you);
  const top = yj.sh[1] - 8 - FIRED.h;
  const ll = reach({ ...STAND, lean: 8, head: 8 }, x + 250, y, [x + 40, top - 40], [x + 40, top - 10], true);
  return (
    <>
      <NightWall y={y} />
      <Stairs x0={x0} y0={y0} n={k} />
      <rect x={x0 + k * TREAD} y={y - 1} width={1400} height={8} fill="#9a9aa2" />
      <rect x={x0 + k * TREAD} y={y} width={1400} height={800} fill="url(#pr-concrete)" />
      <Hero x={x} y={y} s={S} look={BOLD} pose={you} />
      <Stack sh={yj.sh} boxes={[FIRED]} />
      <Carton x={x - 22} y={top - 2} b={RENT} rot={-6} />
      <Hero x={x + 250} y={y} s={S} look={BOLD_GREY} pose={ll} flip />
      <Sweat at={yj.head} />
      <Counter n={18} />
    </>
  );
};
const F2: React.FC = () => {
  // a landing with a lit window: Mom is watching; he picks up a box with his own handwriting on it
  const y = 1420, x = 520;
  const pick: Pose = { hip: [-16, -H + 60], lean: 44, head: 30, hN: [0, 0], hF: [-22, -60], elbow: 1, fN: [48, 0], fF: [-60, 0] };
  const you = reach(pick, x, y, [x + 150, y - 60], [x + 30, y - 300]);
  const yj = J(x, y, you);
  return (
    <>
      <NightWall y={y} />
      <rect x={0} y={y} width={1080} height={800} fill="url(#pr-concrete)" /><rect x={0} y={y - 1} width={1080} height={8} fill="#9a9aa2" />
      {/* the window: warm light, Mom standing in it, looking out */}
      <rect x={640} y={y - 700} width={300} height={330} fill="#ffd79a" stroke="#2a2a30" strokeWidth={16} />
      <line x1={790} y1={y - 700} x2={790} y2={y - 370} stroke="#2a2a30" strokeWidth={10} />
      <Glow at={[790, y - 535]} r={330} color="#ffcf8a" a={0.25} />
      <clipPath id="pr-win"><rect x={648} y={y - 692} width={284} height={314} /></clipPath>
      <g clipPath="url(#pr-win)"><Hero x={735} y={y - 220} s={0.8} look={{ ...BOLD_GREY, body: "#5a4a3a", far: "#4a3c2e", glow: 0 }} pose={{ ...STAND, hN: [30, 70], hF: [20, 76] }} flip shadow={0} /></g>
      <rect x={640} y={y - 400} width={300} height={34} fill="#2a2a30" />
      <Hero x={x} y={y} s={S} look={BOLD} pose={you} />
      <Stack sh={yj.sh} boxes={[FIRED, RENT]} lean={20} dx={-40} />
      <Carton x={x + 170} y={y} b={ASHAMED} />
      <Counter n={23} />
    </>
  );
};
const F3: React.FC = () => {
  // crushed onto hands and knees on the landing under five boxes; a new car passes on the street below
  const y = 1300, x = 400;
  const crawl: Pose = { hip: [-10, -86], lean: 74, head: 38, hN: [0, 0], hF: [0, 0], elbow: 1, fN: [-30, 0], fF: [-60, 0] };
  const you = reach(crawl, x, y, [x + 190, y - 2], [x + 170, y - 2]);
  const yj = J(x, y, you);
  const base: V = [(yj.hip[0] + yj.sh[0]) / 2, Math.min(yj.hip[1], yj.sh[1]) - 18];
  return (
    <>
      <NightWall y={y} />
      <rect x={0} y={y} width={1080} height={210} fill="url(#pr-concrete)" /><rect x={0} y={y - 1} width={1080} height={8} fill="#9a9aa2" />
      <rect x={0} y={1640} width={1080} height={300} fill="#0d0d10" /><rect x={0} y={1640} width={1080} height={5} fill="#5a5a62" />
      {Array.from({ length: 6 }, (_, i) => <rect key={i} x={i * 200 + 40} y={1720} width={100} height={8} fill="#7a7a82" />)}
      <Car x={800} y={1700} s={0.9} color="#e8ecf2" lights />
      <text x={960} y={1580} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={40} fill={DIM}>HONK</text>
      <Hero x={x} y={y} s={S} look={BOLD} pose={you} />
      <g>{(() => { let yy = base[1]; return [FIRED, RENT, ASHAMED, AHEAD, FAILURE].map((b, i) => { const n = <Carton key={i} x={base[0] + (i % 2 ? 12 : -8) + i * 6} y={yy} b={b} rot={i % 2 ? 4 : -4} />; yy -= b.h - 2; return n; }); })()}</g>
      <Sweat at={yj.head} />
      <Counter n={31} />
    </>
  );
};
const F4: React.FC = () => {
  // the top box (I'M A FAILURE) has slid off and bounced down the stairs: open, empty
  const x0 = -120, y0 = 1700, k = 9, [lx] = stepAt(x0, y0, k), y = y0 - k * RISE;
  const x = lx + 360;
  const crawl: Pose = { hip: [-10, -86], lean: 74, head: -30, hN: [0, 0], hF: [0, 0], elbow: 1, fN: [-30, 0], fF: [-60, 0] };
  const look = reach(crawl, x, y, [x + 190, y - 2], [x + 170, y - 2], true);
  const yj = J(x, y, look, true);
  const base: V = [(yj.hip[0] + yj.sh[0]) / 2, Math.min(yj.hip[1], yj.sh[1]) - 18];
  return (
    <>
      <NightWall y={y} />
      <Stairs x0={x0} y0={y0} n={k} />
      <rect x={x0 + k * TREAD} y={y - 1} width={1400} height={8} fill="#9a9aa2" /><rect x={x0 + k * TREAD} y={y} width={1400} height={600} fill="url(#pr-concrete)" />
      <Hero x={x} y={y} s={S} look={BOLD} pose={look} flip />
      <g>{(() => { let yy = base[1]; return [FIRED, RENT, ASHAMED, AHEAD].map((b, i) => { const n = <Carton key={i} x={base[0] + (i % 2 ? 12 : -8) - i * 6} y={yy} b={b} rot={i % 2 ? 4 : -5} />; yy -= b.h - 2; return n; }); })()}</g>
      {/* the empty box, bounced high, lid open, nothing inside */}
      {(() => { const [bx, by] = stepAt(x0, y0, 3); return (<g>
        <path d={`M${bx + 200} ${by - 420} Q${bx + 140} ${by - 520} ${bx + 60} ${by - 260}`} fill="none" stroke={W} strokeWidth={4} strokeDasharray="10 12" opacity={0.5} />
        <Carton x={bx + 40} y={by - 180} b={{ ...FAILURE, open: 1 }} rot={-24} />
        <text x={bx + 40} y={by - 300} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={46} fill={W}>EMPTY</text>
      </g>); })()}
      <Counter n={31} />
    </>
  );
};
const F5: React.FC = () => {
  // two real boxes on his shoulders, climbing steadily; first light of morning at the top right
  const x0 = -200, y0 = 1700, k = 9, [x, y] = stepAt(x0, y0, k);
  const you = { ...carryPose(0.3, RISE / S), fN: [TREAD * 0.75 / S, -RISE / S] as V };
  const yj = J(x, y, you);
  return (
    <>
      <NightWall y={y} />
      <rect x={0} y={0} width={1080} height={1920} fill="url(#pr-sun)" />
      <Stairs x0={x0} y0={y0} n={22} />
      <Hero x={x} y={y} s={S} look={BOLD} pose={you} />
      <Stack sh={yj.sh} boxes={[FIRED, RENT]} />
      <g transform="translate(760 980)">
        <rect x={-120} y={-80} width={240} height={150} rx={14} fill="#1c1d24" stroke="#8a8a92" strokeWidth={4} />
        <text x={0} y={-30} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={26} fill={DIM}>APPLICATIONS</text>
        <text x={0} y={40} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={72} fill={W}>37</text>
      </g>
      <Counter n={74} />
    </>
  );
};
const F6: React.FC = () => {
  // the top: a door marked HIRED, the morning sun; RENT stamped PAID; both boxes lifted with ONE hand
  const y = 1300, x = 470;
  const you: Pose = { ...STAND, lean: -2, head: -10, hN: [18, -AR() + 30], hF: [10, 120], elbow: 1 };
  const yj = J(x, y, you);
  return (
    <>
      <rect x={0} y={0} width={1080} height={1920} fill="#0c0b0a" />
      <Rays f={20} at={[980, 420]} a={0.45} color={GOLD} n={16} len={1500} />
      <Glow at={[980, 420]} r={520} color="#ffcf6a" a={0.55} />
      <rect x={0} y={y} width={1080} height={700} fill="url(#pr-concrete)" /><rect x={0} y={y - 1} width={1080} height={8} fill={GOLD} opacity={0.8} />
      <rect x={720} y={y - 330} width={180} height={330} fill="#ffe7b0" />
      <rect x={710} y={y - 340} width={200} height={340} fill="none" stroke="#2a2a30" strokeWidth={16} />
      <rect x={740} y={y - 410} width={140} height={52} rx={8} fill={GOLD} /><text x={810} y={y - 372} textAnchor="middle" fontFamily={STAMP} fontSize={34} fill="#1a1205">HIRED</text>
      <Hero x={x} y={y} s={S} look={BOLD} pose={you} />
      <Carton x={yj.wN[0] + 6} y={yj.wN[1] - 4} b={{ ...RENT, paid: true }} />
      <Carton x={yj.wN[0] + 2} y={yj.wN[1] - 4 - RENT.h} b={FIRED} />
      <Counter n={100} gold />
      <Q t="Pressure makes diamonds." y={1560} s={64} />
      <Q t="Drop the weight you made up." y={1650} c={GOLD} s={52} />
    </>
  );
};
const AR = () => 142;

const FR = [F0, F1, F2, F3, F4, F5, F6];
export const PressureFrames: React.FC = () => {
  const F = FR[Math.min(FR.length - 1, useCurrentFrame())];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <KitDefs /><Defs /><PrDefs />
        <F />
        <Vignette a={0.35} />
      </svg>
    </AbsoluteFill>
  );
};
