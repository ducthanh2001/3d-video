// BEAT YESTERDAY: style frames v2, CINEMATIC. The payoff moment of each vignette, framed closer (figures ~1.4x bigger),
// lit for feeling (the wrong way = cold night blue, the right way = warm gold), set in real-life moments (a phone at 3 AM,
// a desk lamp at night, sweat and breath) and seen from angles that carry the meaning (looking UP at someone's giant book,
// your past selves standing in your own door frame, a silhouette backlit by TOMORROW).
// Colour code: red = other people / comparison · translucent blue-grey = YESTERDAY (the ghost of you) · gold = your progress.
// frame 0 race · 1 chapter 1 vs 20 · 2 same day x365 · 3 the wrong wall · 4 the mirror hallway
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { V, rng } from "../../kit/core";
import { BONE, HIP_H, Hero, HeroLook, POSES, Pose, run, solvePose } from "../../kit/hero";
import { KitDefs, Vignette } from "../../kit/materials";
import { Glow, Rays } from "../../kit/fx";
import { BOLD, BOLD_GREY, Defs, GOLD, Label, RED, SANS } from "../samehours/StyleFrames";

export const BEAT_STYLE_FRAMES = 5;
export const GHOST: HeroLook = { width: 1.85, head: 1.18, glow: 0.4, glowColor: "#9fb4ff", body: "#b4bed2", far: "#7d879a" };
export const COLD: HeroLook = { ...BOLD_GREY, body: "#b9c2d4", far: "#77808f", glow: 0.15, glowColor: "#8fb0ff" };
export const SIL: HeroLook = { width: 1.85, head: 1.18, body: "#121214", far: "#0a0a0c", ink: "#000", glow: 0.95, glowColor: GOLD };
export const S = 0.95, AR = BONE.uArm + BONE.fArm;
export const GT = 860, GB = 1700; // ground of the top / bottom lane
const W = "#f2f2f2", DIM = "#8a8a92", ICE = "#8fb0ff";

// ---------------------------------------------------------------- helpers
export const J = (x: number, y: number, pose: Pose, flip = false, s = S) => {
  const j = solvePose(pose), k = flip ? -1 : 1, w = (p: V): V => [x + k * p[0] * s, y + p[1] * s];
  return { wN: w(j.wN), wF: w(j.wF), sh: w(j.sh), head: w(j.head), hip: w(j.hip), kN: w(j.kN) };
};
export const reach = (base: Pose, x: number, y: number, tN: V, tF?: V, flip = false, s = S): Pose => {
  const sh = solvePose(base).sh, k = flip ? -1 : 1, loc = (t: V): V => [((t[0] - x) * k) / s - sh[0], (t[1] - y) / s - sh[1]];
  return { ...base, hN: loc(tN), hF: loc(tF ?? [tN[0] - 10 * k, tN[1] + 6]) };
};
/** lane mood: a coloured light falling on the lane from above + a lit floor with a soft reflection band */
export const Mood: React.FC<{ y0: number; g: number; warm?: boolean; cx?: number }> = ({ y0, g, warm, cx = 540 }) => {
  const id = `mood${y0}`, c = warm ? "#ffb63a" : "#5b7fd6";
  return (
    <g>
      <defs>
        <radialGradient id={id} cx={cx} cy={g - 120} r={620} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor={c} stopOpacity={warm ? 0.26 : 0.2} /><stop offset="1" stopColor={c} stopOpacity={0} /></radialGradient>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c} stopOpacity={warm ? 0.22 : 0.14} /><stop offset="1" stopColor="#000" stopOpacity={0} /></linearGradient>
        <linearGradient id={`${id}l`} x1="0" x2="1"><stop offset="0" stopColor="#888" stopOpacity={0} /><stop offset="0.2" stopColor={warm ? "#d9b46a" : "#7f8aa6"} /><stop offset="0.8" stopColor={warm ? "#d9b46a" : "#7f8aa6"} /><stop offset="1" stopColor="#888" stopOpacity={0} /></linearGradient>
      </defs>
      <rect x={0} y={y0} width={1080} height={g - y0} fill={`url(#${id})`} />
      <rect x={0} y={g} width={1080} height={110} fill={`url(#${id}f)`} />
      <rect x={0} y={g} width={1080} height={6} fill={`url(#${id}l)`} />
    </g>
  );
};
export const Punch: React.FC<{ l1: string; l2: string; y?: number }> = ({ l1, l2, y = 1808 }) => (
  <g>
    <text x={540} y={y} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={44} fill={W}>{l1}</text>
    <text x={540} y={y + 62} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={50} fill={GOLD}>{l2}</text>
  </g>
);
export const Tag: React.FC<{ x: number; y: number; t: string; color?: string; size?: number }> = ({ x, y, t, color = RED, size = 28 }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={size} letterSpacing={2} fill={color}>{t}</text>
);
export const Sweat: React.FC<{ at: V; n?: number }> = ({ at, n = 3 }) => (
  <g>{Array.from({ length: n }, (_, i) => { const x = at[0] + 30 + i * 16, y = at[1] - 20 + i * 22; return <path key={i} d={`M${x} ${y} q-8 12 0 16 q8 -4 0 -16 Z`} fill="#bcd6ff" opacity={0.9 - i * 0.2} />; })}</g>
);
export const Breath: React.FC<{ at: V }> = ({ at }) => (
  <g opacity={0.55}>{[0, 1, 2].map((i) => <circle key={i} cx={at[0] + 40 + i * 22} cy={at[1] + 14 - i * 6} r={10 + i * 6} fill="#cfd6e6" opacity={0.6 - i * 0.15} />)}</g>
);
export const Ghost: React.FC<{ x: number; y: number; pose: Pose; s?: number; flip?: boolean; tag?: string; a?: number }> = ({ x, y, pose, s = S, flip, tag = "YESTERDAY", a = 0.5 }) => {
  const j = J(x, y, pose, flip, s);
  return (
    <g>
      <g opacity={a}><Hero x={x} y={y} s={s} pose={pose} flip={flip} look={GHOST} shadow={0} /></g>
      <circle cx={j.head[0]} cy={j.head[1]} r={BONE.head * 1.18 * s + 8} fill="none" stroke={ICE} strokeWidth={2.5} strokeDasharray="6 7" opacity={a} />
      {tag && <Tag x={j.head[0]} y={j.head[1] - 46 * s - 10} t={tag} color={ICE} size={Math.max(18, 28 * s)} />}
    </g>
  );
};
export const handsOnKnees = (x: number, g: number): Pose => {
  const base: Pose = { hip: [-6, -HIP_H + 30], lean: 50, head: 34, hN: [0, 0], hF: [0, 0], fN: [36, 0], fF: [-40, 0], elbow: 1 };
  const kn = J(x, g, base).kN;
  return reach(base, x, g, [kn[0] + 6, kn[1] - 6], [kn[0] - 8, kn[1]]);
};
export const Floodlight: React.FC<{ x: number; y: number; warm?: boolean; dir?: number }> = ({ x, y, warm, dir = 1 }) => (
  <g>
    <path d={`M${x} ${y} L${x + dir * 520} ${y + 700} L${x + dir * 180} ${y + 760} Z`} fill={warm ? "#ffd27a" : "#9fb4ff"} opacity={0.07} />
    <rect x={x - 26} y={y - 16} width={52} height={32} rx={6} fill="#2a2a30" stroke="#000" strokeWidth={3} />
    <rect x={x - 20} y={y - 10} width={40} height={20} rx={4} fill={warm ? "#fff2c8" : "#dfe8ff"} />
  </g>
);

// ================================================================ 1 · Racing them / Racing yesterday
const Seg1: React.FC = () => {
  const me = handsOnKnees(360, GT), mj = J(360, GT, me);
  return (
    <g>
      <Mood y0={120} g={GT} cx={360} />
      <Floodlight x={90} y={170} />
      <Floodlight x={990} y={170} dir={-1} />
      {/* the finish line, tiny, far away on the horizon: the comparison race never ends */}
      <line x1={0} y1={GT - 150} x2={1080} y2={GT - 150} stroke="#2a2f3c" strokeWidth={2} />
      <g transform={`translate(930 ${GT - 150}) scale(0.32)`} opacity={0.6}>
        <line x1={0} y1={0} x2={0} y2={-300} stroke="#6a6a72" strokeWidth={10} />
        <rect x={-6} y={-350} width={180} height={56} fill="#3a3a42" />
        <text x={84} y={-310} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={34} fill="#9a9aa2">FINISH</text>
      </g>
      {/* others blasting past and out of frame */}
      {[["HIM", 700, 0.15, 0.9], ["HER", 860, 0.5, 0.8], ["THEM", 1030, 0.8, 0.7]].map(([t, x, ph, a]) => (
        <g key={t as string} opacity={a as number}>
          {[60, 120, 180].map((d, i) => <g key={d} opacity={0.18 - i * 0.05}><Hero x={(x as number) - d} y={GT} s={S} pose={run(ph as number)} look={BOLD_GREY} shadow={0} /></g>)}
          <Hero x={x as number} y={GT} s={S} pose={run(ph as number)} look={BOLD_GREY} shadow={0} />
          <Tag x={x as number} y={GT - 430} t={t as string} />
        </g>
      ))}
      <Hero x={360} y={GT} s={S} pose={me} look={COLD} />
      <Sweat at={mj.head} />
      <Breath at={[mj.head[0] + 10, mj.head[1] + 10]} />

      <text x={540} y={968} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={44} fill={W}>DAY 365</text>

      <Mood y0={980} g={GB} warm cx={640} />
      <Floodlight x={90} y={1040} warm />
      <Floodlight x={990} y={1040} warm dir={-1} />
      <Rays f={0} at={[660, GB - 260]} a={0.45} color={GOLD} n={16} len={760} />
      {/* yesterday, left behind, with a motion trail */}
      {[0, 1, 2].map((i) => <g key={i} opacity={0.12 + i * 0.08}><Hero x={120 + i * 30} y={GB} s={S * 0.98} pose={run(0.5 + i * 0.05)} look={GHOST} shadow={0} /></g>)}
      <Ghost x={210} y={GB} pose={run(0.62)} />
      {/* the finish post and the tape, snapped across his chest */}
      <line x1={720} y1={GB} x2={720} y2={GB - 420} stroke={GOLD} strokeWidth={9} />
      <rect x={712} y={GB - 470} width={190} height={56} rx={6} fill={GOLD} stroke="#000" strokeWidth={3} />
      <text x={807} y={GB - 430} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={32} letterSpacing={3} fill="#1a1205">FINISH</text>
      <path d={`M690 ${GB - 250} q-60 -30 -120 10 q-50 30 -110 -6`} fill="none" stroke={GOLD} strokeWidth={8} strokeLinecap="round" />
      <path d={`M730 ${GB - 250} q50 30 110 6 q40 -16 80 10`} fill="none" stroke={GOLD} strokeWidth={8} strokeLinecap="round" />
      {(() => { const R = rng(3); return Array.from({ length: 26 }, (_, i) => { const x = 480 + R() * 480, y = 1040 + R() * 520; return <rect key={i} x={x} y={y} width={12} height={6} fill={i % 3 ? GOLD : "#fff"} transform={`rotate(${R() * 180} ${x} ${y})`} opacity={0.8} />; }); })()}
      <Glow at={[680, GB - 240]} r={260} color={GOLD} a={0.45} />
      <Hero x={680} y={GB} s={S} pose={{ ...run(0.15), lean: -8, head: -26, hN: [80, -AR + 46], hF: [-58, -AR + 52], elbow: -1 }} look={BOLD} />

      <Label y={200} t="Racing them" />
      <Label y={1052} t="Racing yesterday" />
      <Punch l1="There will always be someone faster." l2="Only one race matters." />
    </g>
  );
};

// ================================================================ 2 · Chapter 1 / Chapter 20
const Seg2: React.FC = () => {
  const look: Pose = { ...POSES.stand(), lean: -10, head: -40, hN: [70, 30], hF: [-14, AR - 10], elbow: 1 };
  const lj = J(330, GT, look);
  const DX0 = 330, DTOP = GB - 170;
  const write = reach({ ...POSES.sit(118), lean: 22, head: 30 }, 250, GB, [DX0 + 120, DTOP - 6], [DX0 + 70, DTOP - 4]);
  return (
    <g>
      <Mood y0={120} g={GT} cx={420} />
      {/* someone else's chapter 20: a book so big it leaves the frame; its shadow falls over him */}
      <path d={`M560 ${GT} L180 ${GT} L180 ${GT - 40} L560 ${GT - 520} Z`} fill="#000" opacity={0.45} />
      <rect x={560} y={250} width={300} height={GT - 250} fill="url(#sh-grey)" stroke="#000" strokeWidth={5} />
      {[0.06, 0.1, 0.9, 0.94].map((u) => <rect key={u} x={570} y={250 + (GT - 250) * u} width={280} height={10} fill="#000" opacity={0.35} />)}
      <text transform={`translate(${738} ${GT - 310}) rotate(-90)`} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={74} letterSpacing={6} fill="#1c1c20">CHAPTER 20</text>
      <rect x={880} y={GT - 120} width={120} height={46} rx={6} fill="#2a1414" stroke={RED} strokeWidth={3} />
      <Tag x={940} y={GT - 87} t="THEIRS" size={26} />
      <Hero x={330} y={GT} s={S} pose={look} look={COLD} />
      <g transform={`translate(${lj.wN[0] + 10} ${lj.wN[1] - 10}) rotate(-12)`}>
        <rect x={-30} y={-40} width={60} height={80} rx={3} fill="#f2f2f2" stroke="#000" strokeWidth={3} />
        <text x={0} y={-12} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={16} fill="#1c1c20">CH. 1</text>
        {[0, 1, 2].map((i) => <line key={i} x1={-20} y1={4 + i * 10} x2={20} y2={4 + i * 10} stroke="#9a9aa2" strokeWidth={2} />)}
      </g>

      <Mood y0={980} g={GB} warm cx={480} />
      <rect x={760} y={1110} width={220} height={260} fill="#0a0d16" stroke="#3a3a44" strokeWidth={5} />
      <circle cx={920} cy={1170} r={22} fill="#e8e8ec" opacity={0.85} />
      <rect x={DX0 - 20} y={DTOP} width={430} height={22} rx={4} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} />
      <path d={`M${DX0} ${DTOP + 22} V${GB} M${DX0 + 390} ${DTOP + 22} V${GB}`} stroke="#4b4b52" strokeWidth={12} />
      <path d={`M${DX0 + 360} ${DTOP} l-30 -150 l-90 -40`} fill="none" stroke="#5a5a62" strokeWidth={8} strokeLinecap="round" />
      <path d={`M${DX0 + 180} ${DTOP - 210} l80 -20 l20 60 Z`} fill="#3a3a42" stroke="#000" strokeWidth={3} />
      <path d={`M${DX0 + 200} ${DTOP - 170} L${DX0 + 40} ${DTOP} L${DX0 + 300} ${DTOP} Z`} fill="#ffd27a" opacity={0.18} />
      <Glow at={[DX0 + 170, DTOP - 20]} r={260} color={GOLD} a={0.5} />
      {Array.from({ length: 22 }, (_, i) => <rect key={i} x={DX0 + 250 + (i % 2) * 3} y={DTOP - 12 - i * 12} width={100} height={11} rx={2} fill={i % 4 === 0 ? "#e6e2d6" : "#f4f1e8"} stroke="#000" strokeWidth={1.5} />)}
      <rect x={DX0 + 336} y={DTOP - 290} width={56} height={34} rx={4} fill={GOLD} stroke="#000" strokeWidth={2} />
      <text x={DX0 + 364} y={DTOP - 266} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={18} fill="#1a1205">CH.20</text>
      <circle cx={DX0 - 60} cy={GB - 16} r={16} fill="#e8e8ec" stroke="#000" strokeWidth={2} />
      <circle cx={DX0 - 26} cy={GB - 12} r={13} fill="#e8e8ec" stroke="#000" strokeWidth={2} />
      <rect x={180} y={GB - 118} width={110} height={18} rx={4} fill="#4b4b52" />
      <path d={`M190 ${GB - 100} V${GB} M280 ${GB - 100} V${GB} M186 ${GB - 118} V${GB - 300}`} stroke="#4b4b52" strokeWidth={10} />
      <Hero x={250} y={GB} s={S} pose={write} look={BOLD} />
      <rect x={DX0 + 90} y={DTOP - 8} width={70} height={8} fill="#f4f1e8" />

      <Label y={200} t="Comparing" x={300} />
      <Label y={1052} t="Writing" />
      <Punch l1="Don't compare your chapter 1" l2="to someone's chapter 20." />
    </g>
  );
};

// ================================================================ 3 · Same day x365 / New day x365
const Seg3: React.FC = () => {
  const R = rng(9);
  const lie: Pose = { ...POSES.lie(), hN: [70, -80], hF: [60, -70], head: 20 };
  const BX = 300, BT = GT - 110;
  const ph = J(BX, BT, lie).wN;
  return (
    <g>
      <Mood y0={120} g={GT} cx={300} />
      <rect x={640} y={250} width={300} height={300} fill="#070a12" stroke="#3a3a44" strokeWidth={6} />
      {Array.from({ length: 9 }, (_, i) => <rect key={i} x={652 + i * 32} y={430 - (i * 37) % 120} width={26} height={120 + (i * 37) % 120} fill="#10141e" />)}
      {Array.from({ length: 14 }, (_, i) => <rect key={i} x={660 + R() * 260} y={340 + R() * 190} width={6} height={8} fill="#c9a24a" opacity={0.6} />)}
      <circle cx={880} cy={300} r={22} fill="#dfe6f5" />
      <rect x={470} y={300} width={120} height={140} rx={6} fill="#e8e8ec" stroke="#000" strokeWidth={3} />
      <rect x={470} y={300} width={120} height={36} rx={6} fill={RED} />
      <text x={530} y={378} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={26} fill="#1c1c20">DAY</text>
      <text x={530} y={424} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={44} fill="#1c1c20">1</text>
      <rect x={60} y={BT} width={480} height={70} rx={12} fill="#2c2f38" stroke="#000" strokeWidth={3} />
      <rect x={60} y={BT - 120} width={26} height={230} rx={6} fill="#3a3d46" stroke="#000" strokeWidth={3} />
      <ellipse cx={130} cy={BT - 6} rx={50} ry={20} fill="#cfd3dc" />
      <Hero x={BX} y={BT} s={S} pose={lie} look={COLD} shadow={0} />
      <path d={`M${BX - 40} ${BT - 30} Q${BX + 120} ${BT - 70} ${BX + 240} ${BT - 20} L${BX + 240} ${BT + 6} L${BX - 40} ${BT + 6} Z`} fill="#3d4a66" stroke="#000" strokeWidth={3} />
      <Glow at={[ph[0], ph[1] + 30]} r={170} color="#7fb6ff" a={0.6} />
      <rect x={ph[0] - 16} y={ph[1] - 30} width={32} height={50} rx={6} fill="#9cc8ff" stroke="#000" strokeWidth={3} />
      <rect x={600} y={GT - 80} width={130} height={80} rx={6} fill="#1c1d22" stroke="#000" strokeWidth={3} />
      <text x={665} y={GT - 30} textAnchor="middle" fontFamily='"Consolas", monospace' fontWeight={700} fontSize={34} fill={RED}>3:07</text>
      {Array.from({ length: 14 }, (_, i) => (
        <g key={i} transform={`translate(${760 + R() * 260} ${GT - 8 - R() * 10}) rotate(${R() * 70 - 35}) scale(0.4)`}>
          <rect x={-60} y={-40} width={120} height={80} fill="#d8d8de" stroke="#000" strokeWidth={4} />
          <text x={0} y={16} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={40} fill={RED}>DAY 1</text>
        </g>
      ))}

      <Mood y0={980} g={GB} warm cx={760} />
      <rect x={640} y={1090} width={300} height={300} fill="#ffd27a" stroke="#5a4a2a" strokeWidth={6} />
      <circle cx={790} cy={1300} r={70} fill="#fff4cf" />
      <path d="M790 1090 v300 M640 1240 h300" stroke="#5a4a2a" strokeWidth={6} />
      <path d={`M640 1390 L940 1390 L620 ${GB} L250 ${GB} Z`} fill="#ffd27a" opacity={0.16} />
      <rect x={80} y={1140} width={120} height={140} rx={6} fill="#f2efe4" stroke="#000" strokeWidth={3} />
      <rect x={80} y={1140} width={120} height={36} rx={6} fill={GOLD} />
      <text x={140} y={1218} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={26} fill="#1c1c20">DAY</text>
      <text x={140} y={1264} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={44} fill="#1c1c20">365</text>
      {[240, 350].map((x) => <g key={x}><rect x={x} y={1150} width={90} height={70} fill="#1a1a1f" stroke={GOLD} strokeWidth={5} /><path d={`M${x + 24} 1185 l14 14 l28 -28`} stroke={GOLD} strokeWidth={5} fill="none" /></g>)}
      <rect x={70} y={GB - 230} width={180} height={230} fill="url(#sh-slab)" stroke="#55555e" strokeWidth={3} />
      {[0, 1, 2].map((r) => Array.from({ length: 6 }, (_, i) => <rect key={`${r}${i}`} x={82 + i * 27} y={GB - 220 + r * 74} width={21} height={62} rx={3} fill={(i + r) % 3 === 0 ? GOLD : (i + r) % 3 === 1 ? "#cfcfd6" : "#8a8a92"} stroke="#000" strokeWidth={2} />))}
      <path d={`M1000 ${GB} v-330`} stroke="#6a8a5a" strokeWidth={8} />
      {[[-46, -310], [42, -260], [-40, -200], [38, -140], [-34, -90]].map(([dx, dy], i) => <ellipse key={i} cx={1000 + dx} cy={GB + dy} rx={42} ry={15} fill={GOLD} transform={`rotate(${dx > 0 ? -25 : 25} ${1000 + dx} ${GB + dy})`} />)}
      <path d={`M966 ${GB} l10 -66 h48 l10 66 Z`} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} />
      <g transform={`translate(330 ${GB - 16})`}><rect x={-40} y={-6} width={80} height={12} fill="#9a9aa2" /><rect x={-58} y={-20} width={20} height={40} rx={4} fill="#4b4b52" /><rect x={38} y={-20} width={20} height={40} rx={4} fill="#4b4b52" /></g>
      <Glow at={[640, GB - 250]} r={320} color={GOLD} a={0.3} />
      <Hero x={640} y={GB} s={S} pose={{ ...POSES.armsUp(), head: -20 }} look={BOLD} />

      <Label y={200} t="Same day ×365" />
      <Label y={1052} t="New day ×365" />
      <Punch l1="Some people live 365 days." l2="Others live 1 day, 365 times." />
    </g>
  );
};

// ================================================================ 4 · The wrong wall / your own marks
const Mark: React.FC<{ x0: number; x1: number; y: number; t: string; color: string; glow?: boolean; size?: number }> = ({ x0, x1, y, t, color, glow, size = 30 }) => (
  <g>
    {glow && <Glow at={[(x0 + x1) / 2, y]} r={140} color={color} a={0.6} />}
    <line x1={x0} y1={y} x2={x1} y2={y} stroke={color} strokeWidth={7} strokeLinecap="round" />
    <text x={x1 + 14} y={y + 10} fontFamily={SANS} fontWeight={800} fontSize={size} fill={color}>{t}</text>
  </g>
);
const Seg4: React.FC = () => {
  const headTop = (g: number, s: number) => g - 410 * s;
  const ht = headTop(GT, S);
  return (
    <g>
      <Mood y0={120} g={GT} cx={540} />
      <rect x={250} y={230} width={580} height={GT - 230} fill="url(#sh-slab)" stroke="#3a3a42" strokeWidth={4} />
      {[["MIKE", 36], ["ALEX", 78], ["EMMA", 120], ["SARAH", 162], ["JAY", 204], ["...", 240]].map(([t, d], i) => <Mark key={t as string} x0={430 + (i % 2) * 30} x1={590 + (i % 2) * 30} y={ht - (d as number)} t={t as string} color={RED} />)}
      <Mark x0={480} x1={590} y={ht + 4} t="YOU" color={DIM} />
      <Hero x={530} y={GT} s={S} pose={{ ...POSES.stand(), lean: -4, head: -42, hN: [10, AR - 4], hF: [-6, AR - 4] }} look={COLD} />

      <Mood y0={980} g={GB} warm cx={560} />
      <rect x={300} y={1090} width={480} height={GB - 1090} fill="#0b0b0d" />
      <rect x={276} y={1066} width={528} height={28} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} />
      <rect x={276} y={1090} width={28} height={GB - 1090} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} />
      <rect x={776} y={1090} width={28} height={GB - 1090} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} />
      {([["2023", 0.66, 360], ["2024", 0.76, 430], ["2025", 0.86, 500]] as const).map(([t, s, x]) => (
        <g key={t}>
          <Ghost x={x} y={GB} pose={POSES.stand()} s={s} tag="" a={0.35 + (s - 0.66) * 1.2} />
          <Mark x0={690} x1={770} y={headTop(GB, s)} t={t} color="#cfd6e6" size={26} />
        </g>
      ))}
      <Mark x0={670} x1={770} y={headTop(GB, S) - 2} t="TODAY" color={GOLD} glow />
      <Hero x={600} y={GB} s={S} flip pose={{ ...POSES.stand(), head: -6, hN: [26, 96], hF: [-20, 100] }} look={BOLD} />

      <Label y={190} t="Their marks" />
      <Label y={1040} t="Your marks" />
      <Punch l1="You're not behind." l2="You're measuring the wrong wall." />
    </g>
  );
};

// ================================================================ 5 · The mirror hallway (backlit by TOMORROW)
const Mirror: React.FC<{ x: number; g: number; s: number; gold?: boolean; children?: React.ReactNode }> = ({ x, g, s, gold, children }) => {
  const w = 240 * s, h = 420 * s, id = `m${Math.round(x)}`;
  return (
    <g>
      <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={gold ? "#fff6d2" : "#2b3140"} /><stop offset="1" stopColor={gold ? GOLD : "#0e1016"} /></linearGradient></defs>
      <rect x={x - w / 2} y={g - h - 20 * s} width={w} height={h} rx={10 * s} fill={`url(#${id})`} stroke={gold ? GOLD : "#8a8a96"} strokeWidth={8 * s} />
      <path d={`M${x - w / 2 + 16 * s} ${g - h} l${40 * s} ${-40 * s} M${x - w / 2 + 16 * s} ${g - h + 60 * s} l${80 * s} ${-80 * s}`} stroke="#fff" strokeWidth={5 * s} opacity={0.25} />
      {children}
    </g>
  );
};
const Seg5: React.FC = () => {
  const FLOOR = 1500;
  const ms: [string, number, number, number][] = [["DAY 364", 330, 1430, 0.8], ["DAY 100", 170, 1330, 0.62], ["DAY 1", 58, 1258, 0.5]];
  const R = rng(4);
  const thumb: Pose = { hip: [0, -HIP_H], lean: 0, head: -10, hN: [34, -46], hF: [-8, AR - 8], fN: [16, 0], fF: [-16, 0], elbow: -1 };
  return (
    <g>
      <defs><radialGradient id="tmr" cx={880} cy={1180} r={900} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor={GOLD} stopOpacity={0.35} /><stop offset="1" stopColor={GOLD} stopOpacity={0} /></radialGradient></defs>
      <rect x={0} y={0} width={1080} height={1920} fill="url(#tmr)" />
      <path d={`M0 1180 L520 ${FLOOR} L1080 ${FLOOR} L1080 1920 L0 1920 Z`} fill="#0c0b08" />
      <path d={`M0 1180 L520 ${FLOOR} L1080 ${FLOOR}`} fill="none" stroke="#6a5a3a" strokeWidth={6} />
      <path d={`M760 ${FLOOR} L1000 ${FLOOR} L1180 1920 L380 1920 Z`} fill={GOLD} opacity={0.12} />
      {[...ms].reverse().map(([lab, x, g, sc], i) => {
        const k = ms.length - 1 - i;
        return (
          <g key={lab}>
            <Mirror x={x} g={g} s={sc}>
              {k === 2
                ? <><Glow at={[x, g - 150 * sc]} r={150} color={ICE} a={0.75} /><Ghost x={x} y={g - 24 * sc} pose={thumb} s={0.62 * sc} tag="" a={0.95} /></>
                : <Ghost x={x} y={g - 24 * sc} pose={POSES.stand()} s={0.62 * sc} tag="" a={0.35 + 0.15 * k} />}
            </Mirror>
            <text x={x} y={g - 440 * sc - 18} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={Math.max(24, 36 * sc)} fill={ICE}>{lab}</text>
          </g>
        );
      })}
      {Array.from({ length: 16 }, (_, i) => { const x = 470 + R() * 280, y = FLOOR - 4 - R() * 12, r = R() * 360; return <path key={i} d="M0 0 l22 -8 l-8 20 Z" transform={`translate(${x} ${y}) rotate(${r})`} fill={GOLD} opacity={0.9} />; })}
      <Rays f={0} at={[880, 1180]} a={0.45} color={GOLD} n={16} len={1000} />
      <Glow at={[880, 1180]} r={420} color={GOLD} a={0.55} />
      <Mirror x={880} g={FLOOR} s={1.45} gold />
      <text x={880} y={FLOOR + 70} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={46} letterSpacing={4} fill={GOLD}>TOMORROW</text>
      <Hero x={660} y={FLOOR} s={1.15} pose={{ ...POSES.stand(), head: -8, hN: [40, 92], hF: [-26, 96] }} look={SIL} shadow={0} />
      <path d={`M560 ${FLOOR + 4} L380 ${FLOOR + 40} L330 ${FLOOR + 12} Z`} fill="#000" opacity={0.6} />

      <Label y={330} t="Your only opponent:" size={54} />
      <text x={540} y={460} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={128} letterSpacing={4} fill={GOLD}>YESTERDAY.</text>
    </g>
  );
};

const SEGS = [Seg1, Seg2, Seg3, Seg4, Seg5];
export const BeatStyle: React.FC = () => {
  const Seg = SEGS[Math.min(SEGS.length - 1, useCurrentFrame())];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <KitDefs />
        <Defs />
        <Seg />
        <text x={540} y={1905} textAnchor="middle" fontFamily={SANS} fontSize={18} letterSpacing={5} fill="#ffffff" opacity={0.16}>CHANNEL NAME</text>
        <Vignette a={0.45} />
      </svg>
    </AbsoluteFill>
  );
};
