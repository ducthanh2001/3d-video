// "DO IT UNTIL IT'S DONE." — style frames (big-set version): 0 the arena (WHAT THEY SEE) · 1 the rewind ◀◀ · 2 the dark gym
// at 5 AM (WHAT IT TOOK) · 3 the battlefield (MOST TURN BACK) · 4 the marathon wall at mile 20 · 5 the Olympic pool last lap
// · 6 the ocean row, day 47 · 7 the arena again (DO IT UNTIL IT'S DONE). Real places, real objects, emotion poses (EMOTE).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { V } from "../../kit/core";
import { HIP_H, Hero, HeroLook, Joints, POSES, Pose, run } from "../../kit/hero";
import { KitDefs, Vignette } from "../../kit/materials";
import { Glow, Rays } from "../../kit/fx";
import { EMOTE } from "../../kit/acting";
import { BOLD, BOLD_GREY, Defs, GOLD, SANS } from "../samehours/StyleFrames";
import { reach } from "../beatyesterday/StyleFrames";

export const DONE_FRAMES = 9;
export const RED = "#e0483e";
export const MONO = "Consolas, 'Courier New', monospace";
export const HERO: HeroLook = { ...BOLD };
export const GREY: HeroLook = { ...BOLD_GREY, glow: 0 };
export const DARK: HeroLook = { ...BOLD_GREY, glow: 0, body: "#6a6a72", far: "#4a4a52" };
export const AR = 142;
export const rnd = (i: number) => { const x = Math.sin(i * 91.7 + 3.1) * 43758.5; return x - Math.floor(x); };

export const Header: React.FC<{ t: string; y?: number; c?: string }> = ({ t, y = 140, c = "#f2f2f2" }) => (
  <g>
    <rect x={0} y={y - 70} width={1080} height={100} fill="#000" opacity={0.55} />
    <text x={540} y={y} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={52} letterSpacing={3} fill={c}>{t}</text>
  </g>
);
export const Tag: React.FC<{ x: number; y: number; t: string; c: string; s?: number }> = ({ x, y, t, c, s = 30 }) => (
  <g>
    <rect x={x - t.length * s * 0.32 - 16} y={y - s * 1.05} width={t.length * s * 0.64 + 32} height={s * 1.45} rx={8} fill="#0b0b0e" stroke={c} strokeWidth={3} />
    <text x={x} y={y} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={s} fill={c}>{t}</text>
  </g>
);
export const Rain: React.FC<{ n?: number; a?: number; seed?: number; slant?: number; y0?: number; y1?: number }> = ({ n = 140, a = 0.35, seed = 1, slant = -10, y0 = 0, y1 = 1920 }) => (
  <g opacity={a}>{Array.from({ length: n }, (_, i) => { const x = rnd(i + seed) * 1180 - 50, y = y0 + rnd(i * 3 + seed) * (y1 - y0), l = 30 + rnd(i + 7) * 40; return <line key={i} x1={x} y1={y} x2={x + slant} y2={y + l} stroke="#cfd6e0" strokeWidth={2} strokeLinecap="round" />; })}</g>
);

// ---------------------------------------------------------------- boxing
export const gloves = (c = "#c8c8ce") => (j: Joints) => (
  <g>{[j.wF, j.wN].map((w, i) => <g key={i}><ellipse cx={w[0]} cy={w[1]} rx={22} ry={19} fill={c} stroke="#000" strokeWidth={3} /><path d={`M${w[0] - 14} ${w[1] - 6} q10 -10 22 -4`} stroke="#fff" strokeWidth={3} fill="none" opacity={0.5} /><rect x={w[0] - 14} y={w[1] + 12} width={28} height={10} rx={3} fill="#f2f2f2" stroke="#000" strokeWidth={2} /></g>)}</g>
);
export const RING_Y = 1520;
export const Ring: React.FC = () => (
  <g>
    {/* canvas floor in slight perspective, apron skirt */}
    <path d={`M60 ${RING_Y - 70} L1020 ${RING_Y - 70} L1060 ${RING_Y} L20 ${RING_Y} Z`} fill="#d8d8dc" stroke="#000" strokeWidth={3} />
    <path d={`M60 ${RING_Y - 70} L1020 ${RING_Y - 70} L1060 ${RING_Y} L20 ${RING_Y} Z`} fill="#000" opacity={0.18} />
    <rect x={20} y={RING_Y} width={1040} height={110} fill="#141418" stroke="#000" strokeWidth={3} />
    <text x={540} y={RING_Y + 72} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={46} letterSpacing={10} fill="#3a3a42">CHAMPIONSHIP</text>
    {/* corner posts + 3 ropes */}
    {[60, 1020].map((x) => <g key={x}><rect x={x - 12} y={RING_Y - 470} width={24} height={420} rx={6} fill="#5a5a62" stroke="#000" strokeWidth={3} /><rect x={x - 20} y={RING_Y - 470} width={40} height={130} rx={8} fill={x < 500 ? "#c23a3a" : "#3a5aa0"} stroke="#000" strokeWidth={3} /></g>)}
    {[0, 1, 2].map((i) => <path key={i} d={`M60 ${RING_Y - 440 + i * 110} Q540 ${RING_Y - 420 + i * 110} 1020 ${RING_Y - 440 + i * 110}`} fill="none" stroke={i === 0 ? "#e0483e" : "#f2f2f2"} strokeWidth={9} />)}
  </g>
);
/** tiered seating with real spectators: head, shoulders, some arms up, some filming with a phone; nearer rows bigger and lit */
export const Spectators: React.FC<{ y0: number; y1: number; rows?: number; warm?: number }> = ({ y0, y1, rows = 7, warm = 1 }) => {
  const out: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    const t = r / (rows - 1), y = y0 + (y1 - y0) * t, hr = 9 + t * 12, step = hr * 3.1, tone = Math.round(70 + t * 110);
    out.push(<rect key={`b${r}`} x={0} y={y + hr * 2.4} width={1080} height={hr * 1.6} fill="#0c0c10" />);
    for (let i = 0, x = -20 + (r % 2) * step * 0.5; x < 1100; i++, x += step * (0.85 + rnd(r * 97 + i) * 0.3)) {
      const k = r * 211 + i, c = `rgb(${tone},${tone},${tone + 4})`, up = rnd(k) < 0.22, phone = !up && rnd(k + 5) < 0.12;
      out.push(
        <g key={k}>
          {up && <path d={`M${x - hr * 0.7} ${y + hr * 0.6} L${x - hr * 1.3} ${y - hr * 2.2} M${x + hr * 0.7} ${y + hr * 0.6} L${x + hr * 1.4} ${y - hr * 2.0}`} stroke={c} strokeWidth={hr * 0.55} strokeLinecap="round" />}
          <path d={`M${x - hr * 1.25} ${y + hr * 3} Q${x - hr * 1.3} ${y + hr * 0.9} ${x} ${y + hr * 0.8} Q${x + hr * 1.3} ${y + hr * 0.9} ${x + hr * 1.25} ${y + hr * 3} Z`} fill={c} />
          <circle cx={x} cy={y - hr * 0.2} r={hr} fill={c} />
          {phone && <><rect x={x + hr * 0.4} y={y - hr * 1.6} width={hr * 0.7} height={hr * 1.2} rx={2} fill="#dfe8ff" /><circle cx={x + hr * 0.75} cy={y - hr} r={hr * 1.4} fill="#dfe8ff" opacity={0.18 * warm} /></>}
        </g>,
      );
    }
  }
  return <g>{out}</g>;
};
export const Arena: React.FC<{ f?: number; warm?: number }> = ({ warm = 1 }) => (
  <g>
    <rect x={0} y={0} width={1080} height={1920} fill="#050507" />
    <rect x={0} y={420} width={1080} height={720} fill="#0a0a0d" />
    <Spectators y0={470} y1={1080} warm={warm} />
    <defs><linearGradient id="arenafade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#050507" stopOpacity={1} /><stop offset="0.45" stopColor="#050507" stopOpacity={0} /></linearGradient></defs>
    <rect x={0} y={420} width={1080} height={720} fill="url(#arenafade)" />
    {/* red flares in the crowd */}
    {[180, 470, 860].map((x, i) => <g key={i}><Glow at={[x, 620 + i * 90]} r={120} color={RED} a={0.55 * warm} /><circle cx={x} cy={620 + i * 90} r={8} fill="#ffd0c0" /></g>)}
    {/* the lighting rig and its beams */}
    <rect x={120} y={250} width={840} height={16} fill="#1e1e24" />
    {[200, 380, 700, 880].map((x, i) => <g key={i}><rect x={x - 22} y={262} width={44} height={30} rx={4} fill="#3a3a42" /><path d={`M${x - 16} 292 L${x + 16} 292 L${540 + (x - 540) * 0.35 + 180} ${RING_Y - 80} L${540 + (x - 540) * 0.35 - 180} ${RING_Y - 80} Z`} fill="#ffffff" opacity={0.05 * warm} /></g>)}
    <Glow at={[540, 1200]} r={520} color="#ffffff" a={0.12 * warm} />
  </g>
);
/** boxing trunks that follow the body: one short tube per thigh (hip → 45% of the way to the knee), a waistband square to the spine */
const trunksOn = (j: Joints, color: string, band: string) => {
  const leg = (k: V) => [j.hip, [j.hip[0] + (k[0] - j.hip[0]) * 0.48, j.hip[1] + (k[1] - j.hip[1]) * 0.48] as V] as const;
  const sp = [j.sh[0] - j.hip[0], j.sh[1] - j.hip[1]], L = Math.hypot(sp[0], sp[1]) || 1, u: V = [sp[0] / L, sp[1] / L];
  const w0: V = [j.hip[0] + u[0] * 2, j.hip[1] + u[1] * 2], w1: V = [j.hip[0] + u[0] * 22, j.hip[1] + u[1] * 22];
  const tube = (k: V, key: string) => { const [a0, a1] = leg(k); return <g key={key}><line x1={a0[0]} y1={a0[1]} x2={a1[0]} y2={a1[1]} stroke="#000" strokeWidth={50} strokeLinecap="round" /><line x1={a0[0]} y1={a0[1]} x2={a1[0]} y2={a1[1]} stroke={color} strokeWidth={44} strokeLinecap="round" /></g>; };
  return (
    <g>
      {tube(j.kF, "f")}
      {tube(j.kN, "n")}
      <line x1={w0[0]} y1={w0[1]} x2={w1[0]} y2={w1[1]} stroke="#000" strokeWidth={52} strokeLinecap="butt" />
      <line x1={w0[0]} y1={w0[1]} x2={w1[0]} y2={w1[1]} stroke={band} strokeWidth={46} strokeLinecap="butt" />
    </g>
  );
};
/** the referee's uniform over a figure: black trousers down both legs, a black belt, a bow tie at the collar */
export const REF_LOOK: HeroLook = { ...BOLD_GREY, glow: 0, body: "#cdd8e8", far: "#9aa6b8" };
export const refKit = (j: Joints) => {
  const legT = (k: V, a: V, key: string) => <g key={key}><path d={`M${j.hip[0]} ${j.hip[1]} L${k[0]} ${k[1]} L${a[0]} ${a[1]}`} stroke="#000" strokeWidth={42} fill="none" strokeLinecap="round" strokeLinejoin="round" /><path d={`M${j.hip[0]} ${j.hip[1]} L${k[0]} ${k[1]} L${a[0]} ${a[1]}`} stroke="#16161a" strokeWidth={36} fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>;
  const sp = [j.sh[0] - j.hip[0], j.sh[1] - j.hip[1]], L = Math.hypot(sp[0], sp[1]) || 1, u: V = [sp[0] / L, sp[1] / L];
  return (
    <g>
      {legT(j.kF, j.aF, "f")}{legT(j.kN, j.aN, "n")}
      <line x1={j.hip[0] + u[0] * 4} y1={j.hip[1] + u[1] * 4} x2={j.hip[0] + u[0] * 14} y2={j.hip[1] + u[1] * 14} stroke="#000" strokeWidth={44} />
      <path d={`M${j.neck[0] - 16} ${j.neck[1] + 4} L${j.neck[0]} ${j.neck[1] + 12} L${j.neck[0] - 16} ${j.neck[1] + 20} Z M${j.neck[0] + 16} ${j.neck[1] + 4} L${j.neck[0]} ${j.neck[1] + 12} L${j.neck[0] + 16} ${j.neck[1] + 20} Z`} fill="#000" />
      <circle cx={j.neck[0]} cy={j.neck[1] + 12} r={5} fill="#000" />
    </g>
  );
};
/** boxing kit on a figure: trunks drawn behind the arms, gloves on the hands */
export const boxer = (glove: string, trunks: string) => (j: Joints) => (
  <g>
    {trunksOn(j, trunks, trunks === "#2a2a30" ? GOLD : "#f2f2f2")}
    {gloves(glove)(j)}
  </g>
);
/** the back of the title belt (what the camera sees when he shows it to the crowd): dark leather, the plate's rim glinting */
/** a gold trophy cup lifted by its stem: bowl with two handles, an engraved band and a star, the stem in his fist,
 *  a black plinth with a CHAMPION plate under the hand */
export const Trophy: React.FC<{ hand: V; s?: number }> = ({ hand, s = 1 }) => (
  <g transform={`translate(${hand[0]} ${hand[1]}) scale(${s})`}>
    <defs>
      <linearGradient id="cupG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#9a6a10" /><stop offset="0.3" stopColor="#ffe9a0" /><stop offset="0.55" stopColor="#f0b830" /><stop offset="1" stopColor="#8a5a0a" /></linearGradient>
    </defs>
    <Glow at={[0, -150]} r={200} color={GOLD} a={0.6} />
    {/* handles */}
    {[-1, 1].map((k) => <path key={k} d={`M${k * 74} -230 Q${k * 150} -230 ${k * 132} -160 Q${k * 116} -110 ${k * 54} -104`} fill="none" stroke="#000" strokeWidth={22} strokeLinecap="round" />)}
    {[-1, 1].map((k) => <path key={`i${k}`} d={`M${k * 74} -230 Q${k * 150} -230 ${k * 132} -160 Q${k * 116} -110 ${k * 54} -104`} fill="none" stroke="url(#cupG)" strokeWidth={14} strokeLinecap="round" />)}
    {/* bowl */}
    <path d="M-92 -270 L92 -270 Q90 -150 30 -96 L-30 -96 Q-90 -150 -92 -270 Z" fill="url(#cupG)" stroke="#000" strokeWidth={4} strokeLinejoin="round" />
    <ellipse cx={0} cy={-270} rx={92} ry={16} fill="#ffe9a0" stroke="#000" strokeWidth={4} />
    <ellipse cx={0} cy={-270} rx={76} ry={10} fill="#9a6a10" />
    <path d="M-84 -226 Q0 -210 84 -226" stroke="#9a6a10" strokeWidth={5} fill="none" />
    <path d="M0 -206 l9 18 l20 3 l-15 14 l4 20 l-18 -10 l-18 10 l4 -20 l-15 -14 l20 -3 Z" fill="#fff6d0" stroke="#9a6a10" strokeWidth={2} />
    <path d="M-60 -258 Q-66 -180 -30 -120" stroke="#fff" strokeWidth={6} fill="none" opacity={0.45} />
    {/* stem in his fist, foot, plinth with the plate */}
    <rect x={-14} y={-98} width={28} height={70} fill="url(#cupG)" stroke="#000" strokeWidth={3} />
    <ellipse cx={0} cy={-62} rx={22} ry={10} fill="url(#cupG)" stroke="#000" strokeWidth={3} />
    <path d="M-44 -26 L44 -26 L52 0 L-52 0 Z" fill="url(#cupG)" stroke="#000" strokeWidth={3} />
    <rect x={-62} y={0} width={124} height={50} rx={4} fill="#1a1a1e" stroke="#000" strokeWidth={3} />
    <rect x={-44} y={12} width={88} height={26} rx={3} fill="url(#cupG)" />
    <text x={0} y={31} textAnchor="middle" fontFamily='"Arial Black", Impact, sans-serif' fontSize={13} fill="#3a2a06">CHAMPION</text>
  </g>
);
/** the presentation. facing "crowd": both stand with their backs to the camera, facing the arena; the champion lifts the belt
 *  high in one hand, the referee lifts his other wrist. facing "camera": the same, turned to the viewer (eyes, the belt's face). */
export const FRONT = (extra: Partial<Pose> = {}): Pose => ({ hip: [0, -HIP_H], lean: 0, head: -4, hN: [0, 0], hF: [0, 0], fN: [34, 0], fF: [-34, 0], elbow: 1, ...extra });
/** seen from behind them (they face the arena crowd, the camera is at their backs, so their right is screen right):
 *  the referee on the left, his left arm down, his right hand lifting the champion's LEFT wrist between them;
 *  the champion on the right lifts the belt in his RIGHT hand on the outside; the beaten man on his stool, hands on his head */
const Victory: React.FC<{ s?: number }> = ({ s = 0.9 }) => {
  const fy = RING_Y - 40, rx = 430, cx = 610;
  const lift: V = [520, fy - 392], beltHand: V = [cx + 104, fy - 400];
  const ref = reach(FRONT({ head: -6 }), rx, fy, [lift[0] - 4, lift[1] + 20], [rx - 50, fy - 140], false, s * 0.97);
  const champ = reach(FRONT({ head: -14 }), cx, fy, beltHand, lift, false, s);
  return (
    <g>
      <rect x={110} y={fy - 110} width={70} height={110} fill="#3a3a42" stroke="#000" strokeWidth={3} />
      <Hero x={150} y={fy} s={s * 0.9} pose={{ ...POSES.sit(110), lean: 44, head: 52, hN: [44, -28], hF: [30, -34], elbow: 1 }} look={DARK} hold={boxer("#8a2a2a", "#7a1e1e")} />
      <Glow at={[560, fy - 360]} r={340} color={GOLD} a={0.5} />
      <Hero x={cx} y={fy} s={s} pose={champ} look={HERO} hold={boxer("#e8e8ec", "#2a2a30")} />
      <Hero x={rx} y={fy} s={s * 0.97} pose={ref} look={REF_LOOK} hold={refKit} />
      <ellipse cx={lift[0] - 2} cy={lift[1] + 22} rx={15} ry={12} fill="#cdd8e8" stroke="#000" strokeWidth={3} />
      <Trophy hand={[beltHand[0], beltHand[1] + 50]} s={0.58} />
    </g>
  );
};
/** the knockout: his cross lands on the chin, the opponent goes over backwards, the referee rushes in, the crowd jumps up */
const Knockout: React.FC<{ s?: number }> = ({ s = 0.92 }) => {
  const fy = RING_Y - 40, hx = 470, ox = 690;
  const chin: V = [ox - 34, fy - 300];
  const punch = reach({ ...EMOTE.cross(), head: 10 }, hx, fy, [hx + 20, fy - 270], chin, false, s);
  const fall: Pose = { ...POSES.fallBack(), hip: [-10, -150], lean: -42, head: -40, hN: [-60, -20], hF: [-30, 40], fN: [60, -10], fF: [30, 0] };
  const ref: Pose = { ...run(0.2), lean: 14, head: 0, hN: [70, 10], hF: [40, 30] };
  return (
    <g>
      <Hero x={940} y={fy} s={s * 0.95} pose={ref} look={REF_LOOK} flip hold={refKit} />
      <Hero x={ox} y={fy} s={s} pose={fall} look={DARK} flip hold={boxer("#8a2a2a", "#7a1e1e")} />
      <Hero x={hx} y={fy} s={s} pose={punch} look={HERO} hold={boxer("#e8e8ec", "#2a2a30")} />
      {/* impact: a white burst at the chin, sweat spray, a smear behind the fist */}
      {Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return <line key={i} x1={chin[0] + Math.cos(a) * 26} y1={chin[1] + Math.sin(a) * 26} x2={chin[0] + Math.cos(a) * 66} y2={chin[1] + Math.sin(a) * 66} stroke="#f2f2f2" strokeWidth={5} strokeLinecap="round" />; })}
      {Array.from({ length: 12 }, (_, i) => <circle key={`s${i}`} cx={chin[0] + 40 + rnd(i) * 90} cy={chin[1] - 30 + rnd(i + 5) * 70} r={3 + rnd(i + 2) * 4} fill="#cfe0ff" opacity={0.8} />)}
      {[0, 1, 2].map((i) => <path key={`m${i}`} d={`M${chin[0] - 150 - i * 24} ${chin[1] + 8} l90 -4`} stroke="#f2f2f2" strokeWidth={4} opacity={0.4 - i * 0.1} />)}
      <Glow at={chin} r={140} color="#ffffff" a={0.5} />
    </g>
  );
};
const F0KO: React.FC = () => (
  <g>
    <Arena />
    <Ring />
    <Knockout />
    <Tag x={540} y={340} t="ROUND 12 · 2:51" c="#f2f2f2" s={40} />
    <Header t="WHAT THEY SEE." />
  </g>
);
const F0: React.FC = () => (
  <g>
    <Arena />
    <Ring />
    <Victory />
    <Tag x={540} y={340} t="ROUND 12 · KO" c="#f2f2f2" s={40} />
    <Header t="WHAT THEY SEE." />
  </g>
);

// ---------------------------------------------------------------- 2 · WHAT IT TOOK: the dark gym at 5 AM
const HeavyBag: React.FC<{ x: number; y: number; swing?: number }> = ({ x, y, swing = 0 }) => (
  <g transform={`rotate(${swing} ${x} ${y})`}>
    <line x1={x} y1={y} x2={x} y2={y + 140} stroke="#8a8a92" strokeWidth={4} strokeDasharray="10 6" />
    <rect x={x - 70} y={y + 140} width={140} height={360} rx={50} fill="#5a3a2a" stroke="#000" strokeWidth={4} />
    <rect x={x - 70} y={y + 180} width={140} height={14} fill="#3a2a1e" /><rect x={x - 70} y={y + 440} width={140} height={14} fill="#3a2a1e" />
    <path d={`M${x - 40} ${y + 170} Q${x - 56} ${y + 320} ${x - 40} ${y + 470}`} stroke="#fff" strokeWidth={6} fill="none" opacity={0.15} />
  </g>
);
export const F2: React.FC<{ actors?: React.ReactNode; noText?: boolean }> = ({ actors, noText }) => {
  const fl = 1560;
  return (
    <g>
      <defs><linearGradient id="gymcold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0a0d14" /><stop offset="1" stopColor="#1a1f2a" /></linearGradient></defs>
      <rect x={0} y={0} width={1080} height={fl} fill="url(#gymcold)" />
      {/* brick wall texture */}
      {Array.from({ length: 30 }, (_, r) => Array.from({ length: 9 }, (_, c) => <rect key={`${r}-${c}`} x={c * 130 - (r % 2) * 65} y={300 + r * 42} width={124} height={36} rx={3} fill="#141822" opacity={0.8} />))}
      {/* rainy window, wall clock 5:00 */}
      <rect x={70} y={420} width={300} height={380} fill="#0c1424" stroke="#2e3442" strokeWidth={10} />
      <line x1={220} y1={420} x2={220} y2={800} stroke="#2e3442" strokeWidth={8} /><line x1={70} y1={610} x2={370} y2={610} stroke="#2e3442" strokeWidth={8} />
      <g clipPath="url(#win)"><defs><clipPath id="win"><rect x={70} y={420} width={300} height={380} /></clipPath></defs><Rain n={60} a={0.6} seed={4} y0={420} y1={800} /></g>
      <circle cx={560} cy={500} r={70} fill="#e8e8ec" stroke="#000" strokeWidth={6} />
      <line x1={560} y1={500} x2={560} y2={450} stroke="#111" strokeWidth={7} strokeLinecap="round" /><line x1={560} y1={500} x2={600} y2={500} stroke="#111" strokeWidth={5} strokeLinecap="round" />
      <Tag x={560} y={630} t="5:00 AM" c="#9ab0d0" s={34} />
      {/* the one bulb */}
      <line x1={540} y1={0} x2={540} y2={220} stroke="#3a3a42" strokeWidth={4} />
      <circle cx={540} cy={232} r={16} fill="#fff6d8" />
      <Glow at={[540, 240]} r={300} color="#ffe2a0" a={0.35} />
      <path d={`M520 240 L560 240 L860 ${fl} L220 ${fl} Z`} fill="#ffe2a0" opacity={0.06} />
      {/* floor mat, jump rope, worn shoes, the bag */}
      <rect x={0} y={fl} width={1080} height={360} fill="#0e1016" />
      <rect x={140} y={fl - 6} width={800} height={14} rx={4} fill="#2a2e38" />
      {/* the bag at real height (bottom at hip level) on a chain from the beam; the coach steadies it from behind; the cross lands */}
      <rect x={560} y={240} width={520} height={22} fill="#2a2e38" />
      <line x1={820} y1={262} x2={820} y2={fl - 600} stroke="#8a8a92" strokeWidth={4} strokeDasharray="10 6" />
      {actors ?? <>
      <g transform={`rotate(-4 820 ${fl - 600})`}>
        <rect x={750} y={fl - 600} width={140} height={430} rx={52} fill="#5a3a2a" stroke="#000" strokeWidth={4} />
        <rect x={750} y={fl - 560} width={140} height={14} fill="#3a2a1e" /><rect x={750} y={fl - 220} width={140} height={14} fill="#3a2a1e" />
        <path d={`M772 ${fl - 540} Q758 ${fl - 400} 772 ${fl - 240}`} stroke="#fff" strokeWidth={6} fill="none" opacity={0.15} />
      </g>
      <Hero x={606} y={fl} s={0.88} pose={EMOTE.cross()} look={HERO} hold={boxer("#e8e8ec", "#2a2a30")} />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M742 ${fl - 300 + (i - 1.5) * 30} l-34 ${(i - 1.5) * 10}`} stroke="#f2f2f2" strokeWidth={5} strokeLinecap="round" />)}
      {[0, 1, 2].map((i) => <circle key={i} cx={640 + i * 22} cy={fl - 360 - i * 18} r={5} fill="#bdbdc4" />)}
      </>}
      {!noText && <Tag x={540} y={340} t="DAY 1,460" c="#f2f2f2" s={44} />}
      {!noText && <Header t="WHAT IT TOOK." />}
    </g>
  );
};

// ---------------------------------------------------------------- 3 · MOST TURN BACK: the battlefield
export const helmet = (j: Joints, flip = false) => {
  const k = flip ? -1 : 1, r = 38;
  return <g><path d={`M${j.head[0] - r} ${j.head[1] + 4} Q${j.head[0]} ${j.head[1] - r * 1.5} ${j.head[0] + r} ${j.head[1] + 4} Z`} fill="#9a9aa2" stroke="#000" strokeWidth={3} /><rect x={j.head[0] - r - 6} y={j.head[1] + 2} width={2 * r + 12} height={8} rx={3} fill="#6a6a72" stroke="#000" strokeWidth={2} /><line x1={j.head[0] + k * 6} y1={j.head[1] - r * 0.7} x2={j.head[0] + k * 6} y2={j.head[1] + 4} stroke="#000" strokeWidth={2} /></g>;
};
export const Shield: React.FC<{ at: V; rot?: number; arrows?: number; s?: number }> = ({ at, rot = 0, arrows = 0, s = 1 }) => (
  <g transform={`translate(${at[0]} ${at[1]}) rotate(${rot}) scale(${s})`}>
    <path d="M-70 -90 L70 -90 L70 10 Q70 80 0 110 Q-70 80 -70 10 Z" fill="#d8d8dc" stroke="#000" strokeWidth={5} />
    <path d="M-12 -84 L12 -84 L12 -20 L64 -20 L64 4 L12 4 L12 100 L-12 100 L-12 4 L-64 4 L-64 -20 L-12 -20 Z" fill={RED} opacity={0.85} />
    {Array.from({ length: arrows }, (_, i) => { const x = -50 + rnd(i) * 100, y = -70 + rnd(i + 4) * 150, a = -150 + rnd(i + 8) * 40; return <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}><line x1={0} y1={0} x2={90} y2={0} stroke="#3a2a1e" strokeWidth={4} /><path d="M80 0 l14 -8 l-4 8 l4 8 Z" fill="#e8e8ec" /></g>; })}
  </g>
);
export const Arrow: React.FC<{ x: number; y: number; a: number; l?: number }> = ({ x, y, a, l = 110 }) => (
  <g transform={`translate(${x} ${y}) rotate(${a})`}>
    <line x1={0} y1={0} x2={l} y2={0} stroke="#c8b48a" strokeWidth={4} />
    <path d={`M${l + 18} 0 L${l - 4} -9 L${l - 4} 9 Z`} fill="#e8e8ec" stroke="#000" strokeWidth={1.5} />
    <path d="M0 0 l-10 -8 l14 0 Z M0 0 l-10 8 l14 0 Z" fill="#e0483e" />
  </g>
);
export const F3: React.FC<{ actors?: React.ReactNode; noText?: boolean; still?: boolean }> = ({ actors, noText, still = true }) => {
  const fl = 1500;
  const back = { ...run(0.35), head: 10, hN: [-20, 40] as V, hF: [30, 60] as V };
  return (
    <g>
      <defs><linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0a0606" /><stop offset="0.6" stopColor="#3a1a10" /><stop offset="0.82" stopColor="#8a3a18" /><stop offset="1" stopColor="#1a0e0a" /></linearGradient></defs>
      <rect x={0} y={0} width={1080} height={fl} fill="url(#dusk)" />
      {/* far hills, dead trees, fires and smoke */}
      <path d={`M0 ${fl - 260} Q200 ${fl - 360} 420 ${fl - 280} T900 ${fl - 300} L1080 ${fl - 320} L1080 ${fl} L0 ${fl} Z`} fill="#1a0e0a" />
      {[120, 330, 520].map((x, i) => <g key={i}><Glow at={[x, fl - 250]} r={90} color="#ff7a2a" a={0.6} /><path d={`M${x - 20} ${fl - 230} q10 -50 20 -70 q10 30 20 70 Z`} fill="#ffb84a" /><path d={`M${x} ${fl - 300} q-30 -120 20 -240`} stroke="#3a3030" strokeWidth={30} fill="none" opacity={0.4} strokeLinecap="round" /></g>)}
      <path d={`M240 ${fl - 280} l0 -120 m0 50 l-40 -40 m40 10 l36 -46`} stroke="#120a08" strokeWidth={8} fill="none" />
      {/* the castle on the right: wall, battlements, gate, defenders' bows */}
      <rect x={760} y={760} width={320} height={fl - 760} fill="#2a2420" stroke="#000" strokeWidth={4} />
      {Array.from({ length: 5 }, (_, i) => <rect key={i} x={770 + i * 64} y={720} width={40} height={50} fill="#2a2420" stroke="#000" strokeWidth={3} />)}
      {Array.from({ length: 16 }, (_, r) => Array.from({ length: 5 }, (_, c) => <rect key={`${r}${c}`} x={762 + c * 64 + (r % 2) * 32} y={780 + r * 44} width={60} height={40} fill="none" stroke="#1a1612" strokeWidth={2} />))}
      <path d={`M850 ${fl} L850 ${fl - 260} Q920 ${fl - 340} 990 ${fl - 260} L990 ${fl} Z`} fill="#0a0806" stroke="#000" strokeWidth={4} />
      <line x1={1040} y1={720} x2={1040} y2={560} stroke="#5a5a62" strokeWidth={6} /><path d="M1040 562 l-90 20 l90 22 Z" fill={RED} />
      {/* arrows in the air (falling left from the wall) and stuck in the ground */}
      {still && Array.from({ length: 34 }, (_, i) => <Arrow key={i} x={60 + rnd(i) * 980} y={300 + rnd(i + 9) * 800} a={150 + rnd(i + 5) * 25} />)}
      {Array.from({ length: 30 }, (_, i) => <Arrow key={`g${i}`} x={40 + rnd(i + 50) * 760} y={fl + 10} a={-120 - rnd(i + 3) * 30} l={90} />)}
      <rect x={0} y={fl} width={1080} height={420} fill="#120c0a" />
      {actors ?? <>
      {/* TURNS BACK: dropped shield, running away (grey) · KEEPS WALKING: shield up, full of arrows, toward the gate */}
      <Shield at={[330, fl - 30]} rot={-80} s={0.7} arrows={2} />
      <Hero x={180} y={fl} s={0.82} pose={back} look={GREY} flip hold={(j) => helmet(j, true)} />
      {/* the army advancing with him, shields up, in depth behind */}
      {[[470, 0.7], [400, 0.62], [330, 0.56], [520, 0.6], [440, 0.52]].map(([x, sc], i) => <Hero key={i} x={x} y={fl - 40 - i * 14} s={sc} pose={{ ...EMOTE.shieldUp(), fN: [40 + i * 4, 0], fF: [-50, 0] }} look={DARK} hold={(j) => <g>{helmet(j)}<Shield at={[j.wN[0] + 24, j.wN[1] + 36]} rot={-8} arrows={2 + (i % 3)} s={0.95} /></g>} />)}
      {/* two more turning back */}
      <Hero x={90} y={fl - 30} s={0.6} pose={{ ...run(0.7), head: 14 }} look={DARK} flip hold={(j) => helmet(j, true)} />
      <Hero x={580} y={fl} s={0.86} pose={EMOTE.shieldUp()} look={HERO} hold={(j) => <g>{helmet(j)}<Shield at={[j.wN[0] + 26, j.wN[1] + 40]} rot={-8} arrows={9} s={0.95} /></g>} />
      </>}
      {!noText && <Tag x={190} y={fl + 110} t="TURNS BACK" c={RED} s={34} />}
      {!noText && <Tag x={600} y={fl + 110} t="KEEPS WALKING" c={GOLD} s={34} />}
      {!noText && <Header t="MOST TURN BACK." />}
    </g>
  );
};

// ---------------------------------------------------------------- 4 · the 110 m hurdles, three lanes
/** a real track hurdle in a three-quarter view: two uprights (the far one set back into the lane), a striped top board
 *  between them, L-shaped feet pointing back toward the runner; knocked = tipped forward onto the track */
export const Hurdle: React.FC<{ x: number; g: number; knocked?: boolean }> = ({ x, g, knocked }) => {
  const H = 165, dx = 34, dy = -46; // the far upright's offset (depth into the lane)
  const board = `M${x - 6} ${g - H} L${x + dx + 6} ${g - H + dy} L${x + dx + 6} ${g - H + dy + 26} L${x - 6} ${g - H + 26} Z`;
  const body = (
    <g>
      {/* far side: foot + upright */}
      <line x1={x + dx} y1={g + dy} x2={x + dx - 70} y2={g + dy} stroke="#6a6a72" strokeWidth={7} strokeLinecap="round" />
      <line x1={x + dx} y1={g + dy} x2={x + dx} y2={g - H + dy + 20} stroke="#8a8a92" strokeWidth={7} />
      {/* the top board: white with black bands, a little thickness underneath */}
      <path d={board} fill="#f2f2f2" stroke="#000" strokeWidth={3} strokeLinejoin="round" />
      {[0.2, 0.6].map((t, i) => <path key={i} d={`M${x - 6 + (dx + 12) * t} ${g - H + dy * t} L${x - 6 + (dx + 12) * (t + 0.2)} ${g - H + dy * (t + 0.2)} L${x - 6 + (dx + 12) * (t + 0.2)} ${g - H + dy * (t + 0.2) + 26} L${x - 6 + (dx + 12) * t} ${g - H + dy * t + 26} Z`} fill="#111" />)}
      <path d={`M${x - 6} ${g - H + 26} L${x + dx + 6} ${g - H + dy + 26} L${x + dx + 6} ${g - H + dy + 32} L${x - 6} ${g - H + 32} Z`} fill="#9a9aa2" />
      {/* near side: upright + foot (with its weight block) */}
      <line x1={x} y1={g} x2={x} y2={g - H + 28} stroke="#c8c8ce" strokeWidth={8} />
      <line x1={x} y1={g} x2={x - 76} y2={g} stroke="#9a9aa2" strokeWidth={8} strokeLinecap="round" />
      <rect x={x - 80} y={g - 10} width={22} height={10} rx={2} fill="#5a5a62" />
    </g>
  );
  return knocked ? <g transform={`rotate(74 ${x} ${g})`}>{body}</g> : body;
};
export const HURDLES = [200, 390, 580, 770];
/** one lane of the race: the band of stands behind, the track (dark tartan) with its lane line, the hurdles, the finish */
export const Lane: React.FC<{ y0: number; h: number; n: number; id: string; knocked?: number; children: React.ReactNode; finish?: boolean }> = ({ y0, h, n, id, knocked = -1, children, finish = true }) => {
  const g = y0 + h - 90;
  return (
    <g>
      <defs><clipPath id={id}><rect x={0} y={y0} width={1080} height={h} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        <rect x={0} y={y0} width={1080} height={h} fill="#08080b" />
        <g opacity={0.6}><Spectators y0={y0 + 40} y1={g - 200} rows={4} /></g>
        <rect x={0} y={g - 190} width={1080} height={170} fill="#0e0e12" />
        <rect x={0} y={g - 20} width={1080} height={110} fill="#4a2a24" />
        <rect x={0} y={g - 20} width={1080} height={4} fill="#f2f2f2" opacity={0.8} /><rect x={0} y={g + 60} width={1080} height={4} fill="#f2f2f2" opacity={0.8} />
        <text x={60} y={g + 50} fontFamily={SANS} fontWeight={900} fontSize={44} fill="#f2f2f2" opacity={0.5}>{n}</text>
        {finish && <><rect x={1020} y={g - 20} width={14} height={84} fill="#f2f2f2" /><rect x={1034} y={g - 260} width={8} height={260} fill="#c8c8ce" /></>}
        {HURDLES.map((x, i) => <Hurdle key={i} x={x} g={g + 44} knocked={i === knocked} />)}
        {children}
      </g>
      <rect x={0} y={y0} width={1080} height={h} fill="none" stroke="#2e2e36" strokeWidth={4} />
    </g>
  );
};
export const hurdleJump = (): Pose => ({ hip: [0, -HIP_H - 20], lean: 40, head: 2, hN: [-50, 60], hF: [110, 30], fN: [190, -70], fF: [-60, -150], elbow: 1 });
/** a strip of checkered tape along a polyline (two rows of squares) */
export const tapeAlong = (pts: V[], w = 16, key = "t") => {
  const out: React.ReactNode[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [a, b] = [pts[i], pts[i + 1]], ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI, L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const n = Math.max(1, Math.round(L / w));
    out.push(<g key={`${key}${i}`} transform={`translate(${a[0]} ${a[1]}) rotate(${ang})`}>
      <rect x={0} y={-w / 2 - 1} width={L} height={w + 2} fill="#000" />
      {Array.from({ length: n }, (_, k) => [0, 1].map((r) => <rect key={`${k}${r}`} x={(k * L) / n} y={-w / 2 + (r * w) / 2} width={L / n} height={w / 2} fill={(k + r) % 2 ? "#111" : "#f2f2f2"} />))}
    </g>);
  }
  return out;
};
/** the finish posts either side of lane 3; broken = false: the tape taut between them at chest height */
export const FinishPosts: React.FC<{ g: number; taut?: boolean }> = ({ g, taut }) => {
  const near: V = [996, g + 46], far: V = [1060, g - 10], hgt = 250;
  return (
    <g>
      <line x1={far[0]} y1={far[1]} x2={far[0]} y2={far[1] - hgt} stroke="#8a8a92" strokeWidth={8} />
      {taut && tapeAlong([[near[0], near[1] - hgt + 30], [far[0], far[1] - hgt + 30]], 16, "taut")}
      <line x1={near[0]} y1={near[1]} x2={near[0]} y2={near[1] - hgt} stroke="#d8d8dc" strokeWidth={9} />
      <rect x={near[0] - 10} y={near[1] - hgt - 14} width={20} height={16} rx={3} fill={GOLD} />
    </g>
  );
};
export const ROWS = [220, 760, 1300], RH = 520, gOf = (i: number) => ROWS[i] + RH - 70;
/** frame A: lanes 1 and 2 clear hurdle two; in lane 3 he clipped the first hurdle: it is down and so is he */
const FH1: React.FC = () => (
  <g>
    <rect x={0} y={0} width={1080} height={1920} fill="#000" />
    <Lane y0={ROWS[0]} h={RH} n={1} id="hA1"><Hero x={HURDLES[1] - 70} y={gOf(0) - 30} s={0.72} pose={hurdleJump()} look={GREY} /></Lane>
    <Lane y0={ROWS[1]} h={RH} n={2} id="hA2"><Hero x={HURDLES[1] - 90} y={gOf(1) - 24} s={0.72} pose={hurdleJump()} look={GREY} /></Lane>
    <Lane y0={ROWS[2]} h={RH} n={3} id="hA3" knocked={0}>
      <Hero x={HURDLES[0] + 150} y={gOf(2)} s={0.72} pose={EMOTE.flatFront()} look={HERO} />
      {Array.from({ length: 8 }, (_, i) => <ellipse key={i} cx={HURDLES[0] + 80 + i * 26} cy={gOf(2) - 6 - rnd(i) * 16} rx={20 + rnd(i + 3) * 14} ry={9} fill="#bdbdc4" opacity={0.25} />)}
      {[0, 1, 2].map((i) => <path key={i} d={`M${HURDLES[0] + 60} ${gOf(2) - 150 + i * 20} l-26 -8`} stroke="#f2f2f2" strokeWidth={4} strokeLinecap="round" />)}
    </Lane>
    <Tag x={540} y={ROWS[2] + 60} t="HURDLE 1" c="#f2f2f2" s={30} />
    <Header t="HE FELL AT THE FIRST HURDLE." />
  </g>
);
/** frame B: lane 1 quit halfway (bent over, walking off), lane 2 quit at the last hurdle (sitting), lane 3: scraped knee, through the tape */
const FH2: React.FC = () => (
  <g>
    <rect x={0} y={0} width={1080} height={1920} fill="#000" />
    <Lane y0={ROWS[0]} h={RH} n={1} id="hB1">
      <Hero x={560} y={gOf(0)} s={0.72} pose={EMOTE.handsOnKnees()} look={GREY} />
      <Tag x={560} y={ROWS[0] + 70} t="QUIT: TIRED" c={RED} s={30} />
    </Lane>
    <Lane y0={ROWS[1]} h={RH} n={2} id="hB2">
      <Hero x={HURDLES[3] - 80} y={gOf(1)} s={0.72} pose={{ ...POSES.sit(20), lean: 34, head: 40, hN: [40, 50], hF: [30, 56] }} look={GREY} />
      <Tag x={700} y={ROWS[1] + 70} t="QUIT: 10 m TO GO" c={RED} s={30} />
    </Lane>
    <Lane y0={ROWS[2]} h={RH} n={3} id="hB3" knocked={0}>
      <Glow at={[HURDLES[3], gOf(2) - 200]} r={220} color={GOLD} a={0.4} />
      <Hero x={HURDLES[3] - 70} y={gOf(2) - 30} s={0.72} pose={hurdleJump()} look={HERO} hold={(j) => <rect x={(j.kN[0] + j.hip[0]) / 2 - 10} y={(j.kN[1] + j.hip[1]) / 2 - 10} width={22} height={20} rx={4} fill="#f2f2f2" stroke={RED} strokeWidth={2} />} />
      <FinishPosts g={gOf(2)} taut />
      <Tag x={700} y={ROWS[2] + 70} t="KEEPS GOING" c={GOLD} s={32} />
    </Lane>
    <Header t="SOME STOP. HE KEEPS GOING." />
  </g>
);

// ---------------------------------------------------------------- 7 · DO IT UNTIL IT'S DONE: the arena, the dark gym behind it
const F7: React.FC = () => (
  <g>
    <Arena />
    {/* the ghost of the dark gym, where it was built */}
    <g opacity={0.22}><HeavyBag x={200} y={420} /><rect x={760} y={420} width={260} height={320} fill="#0c1424" stroke="#5a6478" strokeWidth={8} /><Rain n={40} a={0.8} seed={3} y0={420} y1={740} /></g>
    <Ring />
    <Victory s={0.92} />
    <Rays f={0} at={[600, 1100]} a={0.3} color={GOLD} n={14} len={1100} />
    <Tag x={540} y={340} t="DAY 1,461" c={GOLD} s={44} />
    <Header t="DO IT UNTIL IT'S DONE." c={GOLD} />
  </g>
);

export const Bedroom: React.FC<{ sleeper?: React.ReactNode; quiet?: boolean }> = ({ sleeper, quiet }) => {
  const fl = 1560;
  const snooze: Pose = { ...POSES.lie(), head: -16, hN: [-120, 70], hF: [20, 50] };
  return (
    <g>
      <defs><linearGradient id="bedcold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#07090e" /><stop offset="1" stopColor="#141820" /></linearGradient></defs>
      <rect x={0} y={0} width={1080} height={fl} fill="url(#bedcold)" />
      {/* the same rainy dark window */}
      <rect x={640} y={900} width={300} height={300} fill="#0c1424" stroke="#2e3442" strokeWidth={10} />
      <line x1={790} y1={900} x2={790} y2={1200} stroke="#2e3442" strokeWidth={8} />
      <g clipPath="url(#win2)"><defs><clipPath id="win2"><rect x={640} y={900} width={300} height={300} /></clipPath></defs><Rain n={40} a={0.6} seed={6} y0={900} y1={1200} /></g>
      {/* his gloves hanging on a nail, a cobweb on them */}
      <line x1={470} y1={930} x2={470} y2={950} stroke="#8a8a92" strokeWidth={4} />
      <path d="M470 950 L440 990 M470 950 L500 990" stroke="#5a5a62" strokeWidth={3} />
      {[440, 500].map((x, i) => <g key={i}><ellipse cx={x} cy={1020} rx={28} ry={34} fill="#8a2a2a" stroke="#000" strokeWidth={3} /><rect x={x - 16} y={1048} width={32} height={20} rx={4} fill="#d8d8dc" stroke="#000" strokeWidth={2} /></g>)}
      <path d="M410 990 q20 10 40 0 M520 996 q-14 14 -30 6" stroke="#9a9aa2" strokeWidth={1.5} fill="none" opacity={0.7} />
      {/* the bed: frame, mattress, pillow, blanket over him */}
      <rect x={120} y={fl - 170} width={700} height={70} rx={8} fill="#2a2a32" stroke="#000" strokeWidth={3} />
      <rect x={110} y={fl - 260} width={30} height={260} fill="#3a3a42" stroke="#000" strokeWidth={3} />
      <rect x={130} y={fl - 210} width={680} height={50} rx={14} fill="#c8ccd6" stroke="#000" strokeWidth={3} />
      <ellipse cx={210} cy={fl - 222} rx={70} ry={26} fill="#e8e8ec" stroke="#000" strokeWidth={3} />
      {sleeper ?? <Hero x={380} y={fl - 214} s={0.8} pose={snooze} look={DARK} shadow={0} />}
      <path d={`M330 ${fl - 236} Q460 ${fl - 280} 600 ${fl - 246} Q700 ${fl - 222} 800 ${fl - 230} L800 ${fl - 180} L330 ${fl - 180} Z`} fill="#4a5060" stroke="#000" strokeWidth={3} />
      {/* the nightstand and the alarm clock at 5:00, his hand on the snooze */}
      <rect x={-10} y={fl - 150} width={110} height={150} fill="#3a3a42" stroke="#000" strokeWidth={3} />
      <rect x={14} y={fl - 200} width={70} height={50} rx={8} fill="#111" stroke="#5a5a62" strokeWidth={3} />
      <text x={49} y={fl - 164} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={26} fill={RED}>5:00</text>
      {!quiet && <text x={130} y={fl - 300} fontFamily={SANS} fontWeight={800} fontSize={40} fill="#9a9aa2">z z z</text>}
      <rect x={0} y={fl} width={1080} height={360} fill="#0a0c10" />
    </g>
  );
};
/** the boxing comparison: top lane the night everyone saw (the belt), bottom lane the mornings nobody saw (the dark gym) */
export const BandOf: React.FC<{ y0: number; h: number; from: number; id: string; children: React.ReactNode }> = ({ y0, h, from, id, children }) => (
  <g>
    <defs><clipPath id={id}><rect x={0} y={y0} width={1080} height={h} /></clipPath></defs>
    <g clipPath={`url(#${id})`}><g transform={`translate(0 ${y0 - from})`}>{children}</g></g>
    <rect x={0} y={y0} width={1080} height={h} fill="none" stroke="#2e2e36" strokeWidth={4} />
  </g>
);
const BOX2: React.FC = () => (
  <g>
    <rect x={0} y={0} width={1080} height={1920} fill="#000" />
    <BandOf y0={220} h={790} from={830} id="bxA"><Bedroom /></BandOf>
    <BandOf y0={1050} h={790} from={830} id="bxB"><F2 /></BandOf>
    <Tag x={170} y={290} t="SKIPPED" c={RED} s={34} />
    <Tag x={170} y={1120} t="TRAINED" c={GOLD} s={34} />
    <Tag x={870} y={290} t="5:00 AM · DAY 1,460" c="#9ab0d0" s={26} />
    <Tag x={870} y={1120} t="5:00 AM · DAY 1,460" c="#9ab0d0" s={26} />
    <path d="M70 140 L40 160 L70 180 Z M110 140 L80 160 L110 180 Z" fill="#f2f2f2" />
    <Header t="4 YEARS EARLIER." />
  </g>
);
/** an indoor bouldering wall (slight overhang), the route's holds marked with tape, a TOP hold, a thick crash mat */
export const HOLDS: [number, number, number][] = [[420, 640, 22], [520, 590, 18], [470, 520, 20], [600, 470, 24], [540, 400, 18], [660, 350, 22], [590, 280, 20], [700, 220, 18], [640, 150, 26]];
export const Wall: React.FC<{ y0: number; h: number; id: string }> = ({ y0, h, id }) => (
  <g>
    <defs><linearGradient id={`${id}w`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3a3a42" /><stop offset="1" stopColor="#24242a" /></linearGradient></defs>
    <rect x={0} y={y0} width={1080} height={h} fill="#0e0e12" />
    {/* the wall panels, leaning out a little at the top */}
    <path d={`M230 ${y0 + 40} L980 ${y0 + 40} L1040 ${y0 + h - 130} L300 ${y0 + h - 130} Z`} fill={`url(#${id}w)`} stroke="#000" strokeWidth={4} />
    {Array.from({ length: 5 }, (_, i) => <line key={i} x1={230 + i * 150 + 15} y1={y0 + 40} x2={300 + i * 148 + 15} y2={y0 + h - 130} stroke="#1a1a1e" strokeWidth={3} />)}
    {/* other routes' holds, grey, and chalk smudges */}
    {Array.from({ length: 26 }, (_, i) => <ellipse key={i} cx={280 + rnd(i) * 700} cy={y0 + 70 + rnd(i + 4) * (h - 220)} rx={10 + rnd(i + 8) * 10} ry={8 + rnd(i + 2) * 8} fill="#5a5a62" stroke="#000" strokeWidth={2} />)}
    {/* the route: white holds with a tape mark, the TOP hold */}
    {HOLDS.map(([x, y, r], i) => <g key={`h${i}`}><ellipse cx={x} cy={y0 + y} rx={r} ry={r * 0.8} fill="#e8e8ec" stroke="#000" strokeWidth={3} /><ellipse cx={x - 4} cy={y0 + y - 4} rx={r * 0.5} ry={r * 0.35} fill="#fff" opacity={0.6} /><circle cx={x} cy={y0 + y} r={r * 1.5} fill="#ffffff" opacity={0.06} /></g>)}
    <rect x={610} y={y0 + 100} width={60} height={20} rx={4} fill={GOLD} /><text x={640} y={y0 + 115} textAnchor="middle" fontFamily={MONO} fontWeight={900} fontSize={15} fill="#1a1205">TOP</text>
    {/* crash mat */}
    <rect x={200} y={y0 + h - 130} width={880} height={70} rx={14} fill="#2a3a52" stroke="#000" strokeWidth={4} />
    <line x1={640} y1={y0 + h - 126} x2={640} y2={y0 + h - 64} stroke="#1a2638" strokeWidth={4} />
    <rect x={0} y={y0 + h - 60} width={1080} height={60} fill="#0a0a0c" />
  </g>
);
const ClimbLane: React.FC<{ y0: number; h: number; top?: boolean; id: string }> = ({ y0, h, top, id }) => {
  const mat = y0 + h - 130;
  const H = (k: number): V => [HOLDS[k][0], y0 + HOLDS[k][1]];
  // at the top: right hand slapping the TOP hold, left hand on the hold below, feet high on the route
  // seen from behind, flat against the wall: right hand slapping TOP, left hand on the hold below, feet spread on the route
  const cx = 612, cy = y0 + 440;
  const climb = reach(FRONT({ head: -30, fN: [52, -18], fF: [-60, 8] }), cx, cy, [H(8)[0] + 6, H(8)[1] + 4], [H(6)[0] - 4, H(6)[1] + 4], false, 0.78);
  return (
    <g>
      <defs><clipPath id={id}><rect x={0} y={y0} width={1080} height={h} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        <Wall y0={y0} h={h} id={id} />
        {top ? <>
          {/* QUIT AT #3: sitting on the mat, one climbing shoe already off in his hand, chalk bag down */}
          <Hero x={420} y={mat + 10} s={0.78} pose={{ ...POSES.sit(60), lean: 34, head: 30, hN: [96, 50], hF: [70, 64] }} look={GREY} hold={(j) => <path d={`M${j.wN[0] - 6} ${j.wN[1] - 14} l40 4 q10 10 0 20 l-44 -2 Z`} fill="#5a5a62" stroke="#000" strokeWidth={2} />} />
          <rect x={230} y={mat - 30} width={40} height={36} rx={8} fill="#3a3a42" stroke="#000" strokeWidth={2} />
        </> : <>
          {/* ATTEMPT #21: the slap on the TOP hold, a puff of chalk, feet still on the route */}
          <Hero x={cx} y={cy} s={0.78} pose={climb} look={HERO} shadow={0} />
          {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={H(8)[0] + 10 + (rnd(i) - 0.5) * 90} cy={H(8)[1] - 10 + (rnd(i + 5) - 0.5) * 60} r={8 + rnd(i + 2) * 14} fill="#ffffff" opacity={0.18} />)}
          <Glow at={H(8)} r={170} color={GOLD} a={0.55} />
          {[0, 1, 2, 3].map((i) => { const a = -1.4 + i * 0.5; return <line key={i} x1={H(8)[0] + Math.cos(a) * 40} y1={H(8)[1] + Math.sin(a) * 40} x2={H(8)[0] + Math.cos(a) * 70} y2={H(8)[1] + Math.sin(a) * 70} stroke={GOLD} strokeWidth={5} strokeLinecap="round" />; })}
        </>}
      </g>
      <rect x={0} y={y0} width={1080} height={h} fill="none" stroke="#2e2e36" strokeWidth={4} />
      <Tag x={190} y={y0 + 70} t={top ? "QUIT AT #3" : "ATTEMPT #21"} c={top ? RED : GOLD} s={32} />
      <Tag x={900} y={y0 + 70} t={top ? "FALLS: 3" : "FALLS: 20"} c="#d8d8dc" s={28} />
    </g>
  );
};
const FCLIMB: React.FC = () => (
  <g>
    <rect x={0} y={0} width={1080} height={1920} fill="#000" />
    <ClimbLane y0={220} h={800} top id="cA" />
    <ClimbLane y0={1050} h={800} id="cB" />
    <Header t="THE TOP IS ONE MORE TRY." />
  </g>
);
/** frame C, straight after FH2: the same three lanes; past the last hurdle he throws himself at the line like a swimmer off
 *  the block, arms straight out, and the checkered tape snaps on his hands; the two who quit are where they stopped */
const FH3: React.FC = () => {
  const g3 = gOf(2), lineX = 1004;
  const dive: Pose = { ...POSES.stand(), head: -6, hN: [24, -AR + 4], hF: [8, -AR + 10], fN: [26, 0], fF: [-50, 0], elbow: 1 };
  return (
    <g>
      <rect x={0} y={0} width={1080} height={1920} fill="#000" />
      <Lane y0={ROWS[0]} h={RH} n={1} id="hC1">
        <Hero x={560} y={gOf(0)} s={0.72} pose={EMOTE.handsOnKnees()} look={GREY} />
        <Tag x={560} y={ROWS[0] + 70} t="QUIT: TIRED" c={RED} s={30} />
      </Lane>
      <Lane y0={ROWS[1]} h={RH} n={2} id="hC2">
        <Hero x={HURDLES[3] - 80} y={gOf(1)} s={0.72} pose={{ ...POSES.sit(20), lean: 34, head: 40, hN: [40, 50], hF: [30, 56] }} look={GREY} />
        <Tag x={700} y={ROWS[1] + 70} t="QUIT: 10 m TO GO" c={RED} s={30} />
      </Lane>
      <Lane y0={ROWS[2]} h={RH} n={3} id="hC3" knocked={0}>
        {/* the checkered finish line painted on the track */}
        {Array.from({ length: 6 }, (_, r) => Array.from({ length: 2 }, (_, c) => (r + c) % 2 ? null : <rect key={`${r}-${c}`} x={lineX - 22 + c * 14} y={g3 - 16 + r * 14} width={14} height={14} fill="#f2f2f2" />))}
        <Glow at={[lineX - 40, g3 - 150]} r={260} color={GOLD} a={0.55} />
        {/* the dive: body nearly flat, rear foot leaving the track, hands reaching over the line */}
        <Hero x={806} y={g3} s={0.72} pose={dive} look={HERO} rot={66} hold={(j) => <rect x={(j.kN[0] + j.hip[0]) / 2 - 10} y={(j.kN[1] + j.hip[1]) / 2 - 10} width={22} height={20} rx={4} fill="#f2f2f2" stroke={RED} strokeWidth={2} />} />
        <FinishPosts g={g3} />
        {/* the snapped tape: wrapped across his chest and arms, the two ends streaming back toward the posts */}
        {tapeAlong([[996, g3 - 214], [990, g3 - 150], [982, g3 - 104], [960, g3 - 84], [930, g3 - 78], [900, g3 - 88]], 16, "w1")}
        {tapeAlong([[1060, g3 - 236], [1030, g3 - 160], [1006, g3 - 112], [980, g3 - 96], [946, g3 - 104], [912, g3 - 124], [880, g3 - 116]], 16, "w2")}
        {[0, 1, 2].map((i) => <path key={i} d={`M${600 - i * 30} ${g3 - 110 + i * 16} l-60 0`} stroke="#f2f2f2" strokeWidth={4} strokeLinecap="round" opacity={0.6 - i * 0.15} />)}
        <Tag x={700} y={ROWS[2] + 70} t="14.08 · FINISHED" c={GOLD} s={32} />
      </Lane>
      <Header t="HE GOT UP. HE FINISHED." c={GOLD} />
    </g>
  );
};
const FRAMES = [F0KO, BOX2, F0, F3, FH1, FH2, FH3, FCLIMB, F7];
export const DoneFrames: React.FC = () => {
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
