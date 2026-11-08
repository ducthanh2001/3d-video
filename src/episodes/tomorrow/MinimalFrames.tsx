// "TOMORROW" v6, in the competitor's proven grammar (the same one SAME HOURS used): pure black, ONE ground line, ONE object,
// one figure per lane, two short lane labels, colour only for meaning (gold = progress). The object itself carries the story:
// the TOMORROW block that slides away every time you reach it vs TODAY blocks that become a staircase; a row of dumbbells that
// grows; a jar of $1 bills; a book under a coffee mug vs a stack of read books.
// 0 hook (the block that runs away) · 1 dumbbells · 2 the $1 jar · 3 the book · 4 the end (tomorrow never comes / today does)
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { V, ik2, poly } from "../../kit/core";
import { BONE, Hero, HeroLook, POSES, Pose, walk } from "../../kit/hero";
import { KitDefs, Vignette } from "../../kit/materials";
import { Glow, Rays } from "../../kit/fx";
import { BOLD, BOLD_GREY, Defs, GOLD, Ground, Label, SANS } from "../samehours/StyleFrames";
import { J, Punch, reach } from "../beatyesterday/StyleFrames";
import { Cobweb, Jar, Bill } from "./ObjectFrames";

export const TOMORROW_MIN_FRAMES = 5;
const S = 0.8, G1 = 830, G2 = 1660, W = "#f2f2f2";
const GREY: HeroLook = { ...BOLD_GREY, glow: 0, eyes: "side", eyeColor: "#1a1a1e" };
const HERO: HeroLook = { ...BOLD, eyes: "side" };
const AR = BONE.uArm + BONE.fArm;

/** a word made solid: a block like the competitor's FAIL blocks, here TOMORROW (grey) or TODAY (white → gold at the top) */
const Word: React.FC<{ x: number; y: number; t: string; w?: number; h?: number; kind?: "grey" | "white" | "gold"; a?: number }> = ({ x, y, t, w = 170, h = 64, kind = "grey", a = 1 }) => (
  <g opacity={a}>
    <rect x={x} y={y - h} width={w} height={h} rx={6} fill={kind === "gold" ? "url(#sh-gold)" : kind === "white" ? "#e8e8ec" : "url(#sh-grey)"} stroke="#000" strokeWidth={3} />
    <rect x={x + 6} y={y - h + 5} width={w - 12} height={4} rx={2} fill="#fff" opacity={0.35} />
    <text x={x + w / 2} y={y - h / 2 + 11} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={h * 0.42} letterSpacing={2} fill={kind === "grey" ? "#1c1c20" : "#1a1a1a"}>{t}</text>
  </g>
);
const Slide: React.FC<{ x: number; y: number; n?: number }> = ({ x, y, n = 3 }) => (
  <g>{Array.from({ length: n }, (_, i) => <line key={i} x1={x - 20 - i * 26} y1={y - 16 - i * 14} x2={x - 70 - i * 26} y2={y - 16 - i * 14} stroke="#8a8a92" strokeWidth={4} strokeLinecap="round" opacity={0.7 - i * 0.2} />)}</g>
);
const PhoneInHand: React.FC<{ at: V }> = ({ at }) => (
  <g><Glow at={at} r={70} color="#ffffff" a={0.25} /><rect x={at[0] - 13} y={at[1] - 26} width={26} height={44} rx={5} fill="#e8e8ec" stroke="#000" strokeWidth={3} /></g>
);
const reachFwd = (x: number, g: number, ph: number): Pose => ({ ...walk(ph), lean: 14, head: -6, hN: [130, -20], elbow: 1 });
const lookPhone = (ph: number): Pose => ({ ...walk(ph, 0.6), head: 34, hN: [52, 20], hF: [40, 30], elbow: 1 });

// ================================================================ 0 · HOOK: the block that runs away / the blocks that become stairs
const M0: React.FC = () => {
  const steps = 6, bw = 120, bh = 52, sx = 200;
  const top: V = [sx + (steps - 1) * bw + bw / 2, G2 - steps * bh];
  return (
    <g>
      <Label y={230} t="Tomorrow" />
      <Ground y={G1} />
      {/* he reaches for it… it has already slid one step away (the ghost outlines are where it was) */}
      {[0, 1, 2].map((i) => <rect key={i} x={420 + i * 90} y={G1 - 90} width={300} height={90} rx={6} fill="none" stroke="#5a5a62" strokeWidth={3} strokeDasharray="10 8" opacity={0.2 + i * 0.12} />)}
      <Word x={700} y={G1} t="TOMORROW" w={320} h={90} />
      <Slide x={700} y={G1 - 10} />
      <Hero x={470} y={G1} s={S} pose={reachFwd(470, G1, 0.2)} look={GREY} />

      <Label y={1010} t="Today" />
      <Ground y={G2} />
      {Array.from({ length: steps }, (_, c) => Array.from({ length: c + 1 }, (_, r) => (
        <Word key={`${c}${r}`} x={sx + c * bw} y={G2 - r * bh} w={bw - 4} h={bh - 2} t={r === c ? "TODAY" : ""} kind={c === steps - 1 && r === c ? "gold" : "white"} />
      )))}
      <Glow at={[top[0], top[1] - 120]} r={200} color={GOLD} a={0.35} />
      <Hero x={top[0] - 10} y={top[1]} s={S} pose={{ ...walk(0.35), lean: 10 }} look={HERO} />

      <Punch l1="Tomorrow is always one step away." l2="Today is the step." y={1790} />
    </g>
  );
};

// ================================================================ 1 · the barbell (front view, like the competitor's lifters)
/** a barbell seen from the front: bar + two plates a side; `y` = bar centre */
const Barbell: React.FC<{ x: number; y: number; half?: number; gold?: boolean; dusty?: boolean }> = ({ x, y, half = 270, gold, dusty }) => {
  const plate = (px: number, h: number, k: string) => <rect key={k} x={px - 15} y={y - h / 2} width={30} height={h} rx={8} fill={gold ? "url(#sh-gold)" : "url(#sh-grey)"} stroke="#000" strokeWidth={3} />;
  return (
    <g>
      <rect x={x - half - 30} y={y - 6} width={(half + 30) * 2} height={12} rx={4} fill={gold ? "#d8d8dc" : "#7a7a82"} stroke="#000" strokeWidth={2.5} />
      {[-1, 1].map((d) => <g key={d}>{plate(x + d * (half - 30), 150, "a")}{plate(x + d * (half + 2), 118, "b")}<rect x={x + d * (half - 62) - 6} y={y - 16} width={12} height={32} rx={3} fill="#5a5a62" stroke="#000" strokeWidth={2} /></g>)}
      {dusty && Array.from({ length: 26 }, (_, i) => <circle key={i} cx={x - half - 10 + ((i * 53) % ((half + 10) * 2))} cy={y - 9 - (i % 2) * 2} r={3} fill="#9a9488" opacity={0.85} />)}
    </g>
  );
};
/** the figure seen from the FRONT (the competitor's lifters stand like this): symmetric, dot eyes, same capsule limbs as Hero.
 *  World coordinates: x = centre, g = ground; hands = world targets (left, right); `down` tilts the eyes down. */
export const Front: React.FC<{ x: number; g: number; s?: number; look: HeroLook; hands: [V, V]; feet?: number; down?: number; sink?: number }> = ({ x, g, s = S, look, hands, feet = 34, down = 0, sink = 0 }) => {
  const id = React.useId().replace(/:/g, "");
  const L = look, ink = L.ink ?? "#0b0b0d", body = L.body ?? "#f2f2f2", far = L.far ?? "#b9b9b9";
  const w = BONE.width * (L.width ?? 1) * s, ol = BONE.outline;
  const hip: V = [x, g - (BONE.thigh + BONE.shin - 2 - sink) * s], sh: V = [x, hip[1] - BONE.torso * 0.95 * s];
  const R = BONE.head * (L.head ?? 1) * s, head: V = [x, sh[1] - BONE.neck * s - R * 0.9];
  const out = (root: V, t: V, l1: number, l2: number, side: number) => {
    const a = ik2(root, t, l1 * s, l2 * s, 1), b = ik2(root, t, l1 * s, l2 * s, -1);
    return (a.mid[0] - root[0]) * side > (b.mid[0] - root[0]) * side ? a : b;
  };
  const limbs = ([-1, 1] as const).map((d) => {
    const shp: V = [x + d * w * 0.55, sh[1] + 4 * s], hp: V = [x + d * w * 0.42, hip[1]];
    const arm = out(shp, hands[d < 0 ? 0 : 1], BONE.uArm, BONE.fArm, d), leg = out(hp, [x + d * feet * s, g], BONE.thigh, BONE.shin, d);
    return { arm: [shp, arm.mid, arm.end] as V[], leg: [hp, leg.mid, leg.end] as V[] };
  });
  const cap = (pts: V[], ww: number, fill: string, k: string, key: string) => (
    <g key={key} fill="none" strokeLinecap="round" strokeLinejoin="round"><path d={poly(...pts)} stroke={k} strokeWidth={ww + ol * 2} /><path d={poly(...pts)} stroke={fill} strokeWidth={ww} /></g>
  );
  const draw = (gl: boolean) => {
    const k = gl ? "transparent" : ink, c = gl ? "#fff" : body, c2 = gl ? "#fff" : far, e = gl ? 10 : 0;
    return (
      <g>
        {limbs.map((l, i) => cap(l.leg, w + e, i === 0 ? c2 : c, k, `l${i}`))}
        {cap([hip, sh], w * 1.5 + e, c, k, "t")}
        {limbs.map((l, i) => cap(l.arm, w * 0.94 + e, i === 0 ? c2 : c, k, `a${i}`))}
        <circle cx={head[0]} cy={head[1]} r={R + (gl ? 6 : 0)} fill={gl ? c : `url(#${id}h)`} stroke={k} strokeWidth={ol} />
        {!gl && [-1, 1].map((d) => <ellipse key={d} cx={head[0] + d * R * 0.3} cy={head[1] - R * 0.1 + down * R} rx={R * 0.13} ry={R * 0.17} fill={L.eyeColor ?? "#101012"} />)}
      </g>
    );
  };
  return (
    <g>
      <defs>
        <radialGradient id={`${id}h`} cx="38%" cy="32%" r="75%"><stop offset="0%" stopColor={body} /><stop offset="70%" stopColor={body} /><stop offset="100%" stopColor={far} /></radialGradient>
        <filter id={`${id}g`} x="-60%" y="-40%" width="220%" height="180%"><feGaussianBlur stdDeviation={12} /></filter>
      </defs>
      <ellipse cx={x} cy={g + 2} rx={70} ry={9} fill="#000" opacity={0.35} />
      {(L.glow ?? 0) > 0 && <g filter={`url(#${id}g)`} opacity={L.glow}>{draw(true)}</g>}
      {draw(false)}
    </g>
  );
};
const M1: React.FC = () => {
  const bx = 540, barY = G2 - 330;
  return (
    <g>
      <Label y={230} t="Tomorrow" />
      <Ground y={G1} />
      <Front x={bx} g={G1} look={GREY} hands={[[bx - 44, G1 - 92], [bx + 44, G1 - 92]]} feet={22} down={0.3} />
      <Barbell x={bx} y={G1 - 75} dusty />
      <Cobweb x={bx + 255} y={G1 - 150} r={70} />
      <text x={bx} y={G1 - 340} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={40} letterSpacing={3} fill="#5a5a62">DAY 0</text>

      <Label y={1010} t="Today" />
      <Ground y={G2} />
      <Glow at={[bx, barY]} r={260} color={GOLD} a={0.3} />
      <Front x={bx} g={G2} look={HERO} hands={[[bx - 86, barY], [bx + 86, barY]]} feet={46} sink={6} />
      <Barbell x={bx} y={barY} gold />
      <text x={bx} y={barY - 110} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={40} letterSpacing={3} fill={GOLD}>DAY 100</text>

      <Punch l1="Starting Monday." l2="Started Monday." y={1790} />
    </g>
  );
};

// ================================================================ 2 · the $1 jar
const M2: React.FC = () => {
  const drop = reach({ ...POSES.stand(), head: 24 }, 420, G2, [560, G2 - 280], undefined, false, S), dj = J(420, G2, drop, false, S);
  return (
    <g>
      <Label y={230} t="Tomorrow" />
      <Ground y={G1} />
      <Jar x={600} g={G1} fill={0} dusty />
      <Hero x={330} y={G1} s={S} pose={lookPhone(0.6)} look={GREY} />
      <PhoneInHand at={J(330, G1, lookPhone(0.6), false, S).wN} />
      <text x={780} y={G1 - 120} fontFamily={SANS} fontWeight={800} fontSize={56} fill="#5a5a62">$0</text>

      <Label y={1010} t="Today" />
      <Ground y={G2} />
      <Jar x={600} g={G2} fill={0.6} />
      <Bill x={dj.wN[0] + 16} y={dj.wN[1] + 14} r={-70} s={1.1} />
      <Hero x={420} y={G2} s={S} pose={drop} look={HERO} />
      <text x={780} y={G2 - 120} fontFamily={SANS} fontWeight={800} fontSize={56} fill={GOLD}>$150</text>

      <Punch l1="$1." l2="Every single day." y={1790} />
    </g>
  );
};

// ================================================================ 3 · the bike: never fell vs fell twenty times and rides
type BikePts = { R: V; F: V; B: V; S: V; H: V; bar: V; r: number };
const bikePts = (x: number, g: number): BikePts => ({ R: [x - 120, g - 70], F: [x + 125, g - 70], B: [x - 5, g - 62], S: [x - 50, g - 175], H: [x + 85, g - 182], bar: [x + 70, g - 222], r: 70 });
const Bike: React.FC<{ x: number; g: number; gold?: boolean; flat?: boolean; spin?: number; a?: number; rot?: number }> = ({ x, g, gold, flat, spin = 0, a = 1, rot = 0 }) => {
  // tips over its front wheel (a crash), so it never sinks under the ground line
  const p = bikePts(x, g), fr = gold ? GOLD : "#8a8a92", tyre = "#cfcfd4";
  const frame = `M${p.R[0]} ${p.R[1]} L${p.B[0]} ${p.B[1]} L${p.S[0]} ${p.S[1]} Z M${p.S[0]} ${p.S[1]} L${p.H[0] - 6} ${p.H[1] + 12} L${p.B[0]} ${p.B[1]} M${p.H[0]} ${p.H[1]} L${p.F[0]} ${p.F[1]} M${p.H[0]} ${p.H[1]} L${p.bar[0]} ${p.bar[1]}`;
  const wheel = (c: V, isFlat: boolean) => (
    <g>
      {Array.from({ length: 8 }, (_, i) => { const an = (i / 8) * Math.PI + spin; return <line key={i} x1={c[0] - Math.cos(an) * p.r} y1={c[1] - Math.sin(an) * p.r} x2={c[0] + Math.cos(an) * p.r} y2={c[1] + Math.sin(an) * p.r} stroke="#4a4a52" strokeWidth={2} />; })}
      {isFlat
        ? <path d={`M${c[0] - p.r} ${c[1]} A${p.r} ${p.r} 0 0 1 ${c[0] + p.r} ${c[1]} Q${c[0] + p.r} ${c[1] + p.r - 8} ${c[0] + 40} ${c[1] + p.r - 2} L${c[0] - 40} ${c[1] + p.r - 2} Q${c[0] - p.r} ${c[1] + p.r - 8} ${c[0] - p.r} ${c[1]}`} fill="none" stroke={tyre} strokeWidth={10} />
        : <circle cx={c[0]} cy={c[1]} r={p.r} fill="none" stroke={tyre} strokeWidth={10} />}
      <circle cx={c[0]} cy={c[1]} r={7} fill="#5a5a62" stroke="#000" strokeWidth={2} />
    </g>
  );
  return (
    <g opacity={a} transform={`rotate(${rot} ${x + 125} ${g})`}>
      {wheel(p.R, false)}{wheel(p.F, !!flat)}
      <path d={frame} fill="none" stroke="#000" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
      <path d={frame} fill="none" stroke={fr} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M${p.bar[0] - 4} ${p.bar[1]} l34 -4`} stroke="#d8d8dc" strokeWidth={9} strokeLinecap="round" />
      <path d={`M${p.S[0] - 30} ${p.S[1] - 8} q30 -12 56 0 l-6 8 h-44 Z`} fill="#2a2a2e" stroke="#000" strokeWidth={2.5} />
      <circle cx={p.B[0]} cy={p.B[1]} r={14} fill="#3a3a3e" stroke="#000" strokeWidth={2.5} />
    </g>
  );
};
const M3: React.FC = () => {
  // tomorrow: the bike he never rode, front tyre flat, a cobweb in the back wheel; he stands next to it, hands in pockets
  const bx1 = 620, p1 = bikePts(bx1, G1);
  // today: he fell (the ghost bikes and ghost bodies on the road behind him), the last one rides away in gold
  const bx = 720, p = bikePts(bx, G2), crank = 0.9;
  const ped = (o: number): V => [p.B[0] + Math.cos(crank + o) * 30, p.B[1] + Math.sin(crank + o) * 30];
  const seat: V = [p.S[0] + 2, p.S[1] - 12];
  const loc = (w: V): V => [(w[0] - seat[0]) / S, (w[1] - G2) / S];
  const base: Pose = { hip: [0, (seat[1] - G2) / S], lean: 24, head: -14, hN: [0, 0], hF: [0, 0], fN: loc(ped(0)), fF: loc(ped(Math.PI)), elbow: 1 };
  const ride = reach(base, seat[0], G2, [p.bar[0] + 20, p.bar[1] - 2], [p.bar[0] + 12, p.bar[1] + 4], false, S);
  const ghost: HeroLook = { ...GREY, eyes: undefined };
  const rj = J(seat[0], G2, ride, false, S);
  return (
    <g>
      <Label y={230} t="Tomorrow" />
      <Ground y={G1} />
      <Bike x={bx1} g={G1} flat />
      <Cobweb x={p1.R[0] - 70} y={G1 - 140} r={64} />
      {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={p1.S[0] - 26 + ((i * 17) % 52)} cy={p1.S[1] - 14} r={2.6} fill="#9a9488" />)}
      <Hero x={330} y={G1} s={S} pose={{ ...POSES.stand(), head: 18, hN: [10, AR - 40], hF: [-6, AR - 40], elbow: -1 }} look={GREY} />
      <text x={330} y={G1 - 330} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={36} letterSpacing={3} fill="#5a5a62">FALLS: 0</text>

      <Label y={1010} t="Today" />
      <Ground y={G2} />
      {/* the falls he took to get here: tipped-over ghost bikes and bodies on the road behind him */}
      <Bike x={230} g={G2} rot={26} a={0.3} />
      <Hero x={440} y={G2} s={S} pose={POSES.lie()} look={ghost} opacity={0.28} shadow={0} rot={-6} />
      {[0, 1, 2].map((i) => <line key={i} x1={p.R[0] - 80 - i * 20} y1={G2 - 160 + i * 40} x2={p.R[0] - 150 - i * 20} y2={G2 - 160 + i * 40} stroke="#8a8a92" strokeWidth={4} strokeLinecap="round" opacity={0.7 - i * 0.18} />)}
      <Glow at={[bx, G2 - 200]} r={240} color={GOLD} a={0.3} />
      <Bike x={bx} g={G2} gold />
      <Hero x={seat[0]} y={G2} s={S} pose={ride} look={HERO} shadow={0} />
      {/* a plaster on the knee: the falls were real */}
      <g transform={`translate(${rj.kN[0]} ${rj.kN[1]}) rotate(-30)`}><rect x={-16} y={-8} width={32} height={16} rx={6} fill="#d8d8dc" stroke="#000" strokeWidth={2} /><rect x={-5} y={-6} width={10} height={12} fill="#a8a8b0" /></g>
      <text x={290} y={G2 - 330} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={36} letterSpacing={3} fill={GOLD}>FALLS: 20</text>

      <Punch l1="Never fell." l2="Never rode." y={1790} />
    </g>
  );
};

// ================================================================ 4 · the end: tomorrow never comes, today does
const M4: React.FC = () => {
  const steps = 9, bw = 92, bh = 46, sx = 140;
  const top: V = [sx + (steps - 1) * bw + bw / 2, G2 - steps * bh];
  return (
    <g>
      <Label y={230} t="Tomorrow" />
      <Ground y={G1} />
      {/* the block is now tiny, far away on the road; he sits down where he started */}
      <line x1={40} y1={G1 - 2} x2={1040} y2={G1 - 2} stroke="#2a2a2e" strokeWidth={2} />
      <g transform={`translate(960 ${G1}) scale(0.32)`}><Word x={0} y={0} t="TOMORROW" w={220} /></g>
      <Hero x={260} y={G1} s={S} pose={{ ...POSES.hugKnees(), head: 30 }} look={GREY} />

      <Label y={1010} t="Today" />
      <Ground y={G2} />
      <Rays f={0} at={[top[0], top[1] - 200]} a={0.45} color={GOLD} n={14} len={800} />
      {Array.from({ length: steps }, (_, c) => Array.from({ length: c + 1 }, (_, r) => (
        <Word key={`${c}${r}`} x={sx + c * bw} y={G2 - r * bh} w={bw - 4} h={bh - 2} t="" kind={c === steps - 1 && r === c ? "gold" : "white"} />
      )))}
      <line x1={top[0] + 30} y1={top[1]} x2={top[0] + 30} y2={top[1] - 200} stroke={W} strokeWidth={6} />
      <path d={`M${top[0] + 30} ${top[1] - 198} l80 22 l-80 22 Z`} fill={GOLD} />
      <Glow at={[top[0], top[1] - 140]} r={240} color={GOLD} a={0.45} />
      <Hero x={top[0] - 20} y={top[1]} s={S} pose={POSES.armsUp()} look={HERO} />
      <text x={300} y={1240} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={44} fill="#8a8a92">365 × TODAY</text>

      <Punch l1="Tomorrow never comes." l2="Today does." y={1790} />
    </g>
  );
};

const FRAMES = [M0, M1, M2, M3, M4];
export const TomorrowMinimal: React.FC = () => {
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
