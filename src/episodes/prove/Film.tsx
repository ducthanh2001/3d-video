// ProveFilm: "PROVE IT TO YOURSELF" 34.2 s (1027 frames), 1080x1920, 30 fps. Five two-lane vignettes in the competitor's visual
// language (black, grey ground bars, big grey objects with a word on them, one physical action repeated on the beat, a counter),
// gold = the payoff, red = failure. Every number of time lives in events.ts (shared with audio/make_audio_prove.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { V, clamp, ease, lerp } from "../../kit/core";
import { Hero, POSES, Pose, mixPose, run } from "../../kit/hero";
import { KitDefs, Vignette } from "../../kit/materials";
import { Glow, Rays } from "../../kit/fx";
import { Defs, GOLD, SANS } from "../samehours/StyleFrames";
import { J, reach } from "../beatyesterday/StyleFrames";
import {
  Block, CHISEL_AT, CarvedKing, Count, Effort, G1, GREY, HERO, HourBlock, HourClock, Lamp, Lanes, Mountain, Pickaxe, Polisher, RED, Rocket, S, Say, piecePoint, rnd,
} from "./V6Frames";
import { BEAT, C, Q } from "./events";

export const PROVE_FILM_FRAMES = Q.LEN;
const G2 = 1660, W = "#f2f2f2";
const b = (n: number) => n * BEAT;
const fade = (t: number, a: number, d = 8) => clamp((t - a) / d);
const pop = (t: number, a: number) => ease.back(clamp((t - a) / 9));
const Punch: React.FC<{ t: number; a: number; bb: number; l1: string; l2: string }> = ({ t, a, bb, l1, l2 }) => (
  <g>
    <g opacity={fade(t, a, 6)} transform={`translate(540 1790) scale(${0.85 + 0.15 * pop(t, a)})`}><text textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={46} fill={W}>{l1}</text></g>
    <g opacity={fade(t, bb, 6)} transform={`translate(540 1856) scale(${0.85 + 0.15 * pop(t, bb)})`}><text textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={54} fill={GOLD}>{l2}</text></g>
  </g>
);
const PopSay: React.FC<{ t: number; at: number; x: number; y: number; txt: string; tail?: number }> = ({ t, at, x, y, txt, tail }) => t < at ? null : (
  <g transform={`translate(${x} ${y}) scale(${pop(t, at)}) translate(${-x} ${-y})`}><Say x={x} y={y} t={txt} tail={tail} /></g>
);
/** the beat phase: 0 on the hit, rising to 1 just before the next one (between `from` and `to` beats) */
const beatPhase = (t: number, from: number, to: number) => { const u = t / BEAT; if (u < from - 0.5 || u > to + 0.6) return -1; return ((u % 1) + 1) % 1; };
const hitsDone = (t: number, from: number, to: number) => clamp(Math.floor(t / BEAT - from) + 1, 0, to - from + 1);
const Burst: React.FC<{ t: number; at: number; x: number; y: number; r?: number; color?: string }> = ({ t, at, x, y, r = 60, color = "#bdbdc4" }) => {
  const u = (t - at) / 12;
  if (u < 0 || u > 1) return null;
  return <g opacity={1 - u}>{Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2 + 0.3; return <line key={i} x1={x + Math.cos(a) * r * 0.3 * (1 + u)} y1={y + Math.sin(a) * r * 0.3 * (1 + u)} x2={x + Math.cos(a) * r * (0.6 + u)} y2={y + Math.sin(a) * r * (0.6 + u)} stroke={color} strokeWidth={5} strokeLinecap="round" />; })}</g>;
};
const comma = (n: number) => Math.round(n).toLocaleString("en-US");

// ================================================================ 0 · the rockets
const Seg0: React.FC<{ t: number }> = ({ t }) => {
  const launches = [C.L1, C.L2, C.L3].map((x) => b(x) - (x === 0 ? 4 : 0));
  let fails = 0, rocket: React.ReactNode = null, duck = 0;
  const debris: React.ReactNode[] = [];
  launches.forEach((a, k) => {
    const d = t - a;
    if (d >= 12) fails = k + 1;
    if (d >= -30 && d < 12) {
      const up = d < 0 ? 0 : ease.in(d / 12) * 160;
      rocket = <g>{d >= 0 && <path d={`M680 ${G2 - 20 - up} q20 ${60 + d * 3} 40 0`} fill="#ffb84a" />}<g transform={`translate(0 ${-up}) rotate(${d > 6 ? (d - 6) * 3 : 0} 700 ${G2 - 140})`}><Rocket x={700} y={G2 - 20} s={1.0} /></g></g>;
    }
    if (d >= 12 && d < 40) {
      const u = (d - 12) / 28, by = G2 - 20 - 160 - 100;
      duck = Math.max(duck, 1 - clamp((d - 30) / 10));
      debris.push(
        <g key={k} opacity={1 - u}>
          <Glow at={[700, by]} r={260 * (0.5 + u)} color={RED} a={0.6} />
          {Array.from({ length: 12 }, (_, i) => { const an = (i / 12) * Math.PI * 2; return <path key={i} d={`M700 ${by} L${700 + Math.cos(an) * (80 + 160 * ease.out(u))} ${by + Math.sin(an) * (70 + 130 * ease.out(u))}`} stroke={i % 2 ? RED : "#ffb84a"} strokeWidth={10} strokeLinecap="round" />; })}
          <circle cx={700} cy={by} r={70 * (1 - u * 0.6)} fill="#ffe7a8" />
          {Array.from({ length: 8 }, (_, i) => { const an = rnd(i + k * 9) * Math.PI * 2, dist = 60 + u * 300; return <rect key={i} x={700 + Math.cos(an) * dist} y={by + Math.sin(an) * dist + u * u * 200} width={18} height={30} fill="#8a8a92" stroke="#000" strokeWidth={2} transform={`rotate(${u * 400 + i * 40} ${700 + Math.cos(an) * dist} ${by + Math.sin(an) * dist + u * u * 200})`} />; })}
        </g>,
      );
    }
  });
  // the 4th: ignition at L4, up from LIFT
  const ig = b(C.L4), lift = b(C.LIFT);
  if (t >= ig - 30 && t >= launches[2] + 40) {
    const rise = t < lift ? 0 : ease.out(clamp((t - lift) / 50)) * 300 + (t - lift) * 0.4;
    const ry = G2 - 20 - rise, fl = t >= ig ? 1 : 0;
    rocket = (
      <g>
        {fl > 0 && Array.from({ length: 12 }, (_, i) => <circle key={i} cx={700 + (rnd(i) - 0.5) * 60 * (1 + i * 0.1)} cy={G2 - 30 - i * Math.max(8, rise / 12)} r={(30 + i * 3) * clamp((t - ig) / 10)} fill="#d8d8dc" opacity={0.3 - i * 0.02} />)}
        {t >= lift && <><Glow at={[700, ry - 120]} r={300} color={GOLD} a={0.55 * fade(t, lift, 10)} /><Rays f={t} at={[700, ry - 120]} a={0.35 * fade(t, lift, 10)} color={GOLD} n={14} len={500} /></>}
        {fl > 0 && <path d={`M680 ${ry} Q700 ${ry + 110 + Math.sin(t) * 12} 720 ${ry} Q712 ${ry + 70} 700 ${ry + 150 + Math.sin(t * 1.3) * 10} Q688 ${ry + 70} 680 ${ry} Z`} fill="#ffb84a" />}
        <Rocket x={700} y={ry} s={1.0} gold={t >= lift} />
      </g>
    );
  }
  const won = t >= lift;
  const pose: Pose = won ? mixPose(POSES.stand(), { ...POSES.armsUp(), head: -30 }, ease.out(clamp((t - lift - 4) / 10))) : duck > 0 ? mixPose(POSES.stand(), { ...POSES.crouch(), head: 20, hN: [10, -40], hF: [20, -50], elbow: -1 }, ease.out(duck)) : { ...POSES.idle(t), head: -14 };
  return (
    <g>
      <Lanes a="Waits for perfect" b="Launches anyway" />
      <Polisher t={t} web={fade(t, b(3), 60)} />
      <PopSay t={t} at={b(1.5)} x={330} y={420} txt="not perfect yet…" />
      <Count x={1040} y={290} t="LAUNCHES: 0" />
      <rect x={600} y={G2 - 20} width={200} height={20} fill="#3a3a40" stroke="#000" strokeWidth={2} />
      {Array.from({ length: fails }, (_, i) => <ellipse key={i} cx={650 + i * 50} cy={G2 - 22} rx={40} ry={8} fill="#000" opacity={0.6} />)}
      {rocket}
      {debris}
      <Hero x={330} y={G2} s={S} pose={pose} look={HERO} />
      <Count x={1040} y={1070} t={won ? "TRY 4: LIFTOFF!" : fails ? `TRY ${fails}: FAILED` : "TRY 1"} c={won ? GOLD : RED} />
      <Punch t={t} a={b(C.TXT0A)} bb={b(C.TXT0B)} l1="Perfect never takes off." l2="Trying does." />
    </g>
  );
};

// ================================================================ 1 · the block called YOU
const Seg1: React.FC<{ t: number }> = ({ t }) => {
  const ph = beatPhase(t, C.HIT0, C.HITN), done = hitsDone(t, C.HIT0, C.HITN), p = done / (C.HITN - C.HIT0 + 1);
  const pc = ease.out(clamp((done - 1 + clamp((ph < 0 ? 1 : ph) / 0.15)) / (C.HITN - C.HIT0 + 1))); // the shape changes right on each blow
  const LX = 580, LB = G2 - 40, LW = 300, LH = 440, cp = piecePoint(CHISEL_AT, pc);
  const chisel: V = [LX + cp[0] * LW - 12, LB - cp[1] * LH];
  const up = ph < 0 ? 0.6 : ph < 0.12 ? 1 - ph / 0.12 : ease.inOut((ph - 0.12) / 0.88); // 0 = on the chisel, 1 = raised
  const hammer: V = [lerp(chisel[0] - 50, chisel[0] - 80, up), lerp(chisel[1] + 6, chisel[1] - 170, up)];
  const strike = reach({ ...POSES.stand(), lean: 14 - up * 8, head: 10, fN: [50, 0], fF: [-50, 0] }, 330, G2, [chisel[0] - 50, chisel[1] + 6], hammer, false, S);
  const tj = J(330, G2, strike, false, S);
  const inspect: Pose = { ...POSES.stand(), lean: 18, head: 16 + Math.sin(t * 0.08) * 8, hN: [100, -10 + Math.sin(t * 0.1) * 14], hF: [40, 40], elbow: 1, fN: [40, 0], fF: [-30, 0] };
  const ij = J(330, G1, inspect, false, S);
  return (
    <g>
      <Lanes a="Looks for himself" b="Works on himself" />
      <Block x={720} g={G1} w={300} h={460} t="YOU" />
      <Hero x={330} y={G1} s={S} pose={inspect} look={GREY} />
      <circle cx={ij.wN[0] + 30} cy={ij.wN[1] - 14} r={30} fill="#fff" opacity={0.12} stroke="#d8d8dc" strokeWidth={6} />
      <line x1={ij.wN[0] + 8} y1={ij.wN[1] + 6} x2={ij.wN[0] - 10} y2={ij.wN[1] + 30} stroke="#d8d8dc" strokeWidth={8} />
      <PopSay t={t} at={b(1.2)} x={430} y={330} txt="where am I?" />
      <Count x={1040} y={290} t={`DAY ${Math.max(1, Math.round(p * 100))}`} />
      <Glow at={[720, G2 - 270]} r={280} color={GOLD} a={0.3 * p} />
      <rect x={560} y={G2 - 40} width={340} height={40} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} />
      <CarvedKing x0={LX} base={LB} w={LW} h={LH} p={done ? pc : 0} word />
      {Array.from({ length: Math.round(p * 26) }, (_, i) => <polygon key={i} points={`${380 + rnd(i + 9) * 560},${G2 - rnd(i) * 8} ${392 + rnd(i + 9) * 560},${G2 - 10 - rnd(i + 2) * 10} ${404 + rnd(i + 9) * 560},${G2 - rnd(i + 5) * 6}`} fill="#7a7a82" stroke="#000" strokeWidth={1.2} />)}
      {Array.from({ length: done }, (_, k) => <Burst key={k} t={t} at={b(C.HIT0 + k)} x={chisel[0] + 30} y={chisel[1]} r={80} />)}
      <line x1={tj.wN[0]} y1={tj.wN[1]} x2={chisel[0]} y2={chisel[1]} stroke="#d8d8dc" strokeWidth={8} strokeLinecap="round" />
      <rect x={tj.wF[0] - 26} y={tj.wF[1] - 30} width={52} height={30} rx={4} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} />
      <line x1={tj.wF[0]} y1={tj.wF[1]} x2={tj.wF[0] - 4} y2={tj.wF[1] + 70} stroke="#7a6a4a" strokeWidth={8} />
      <Hero x={330} y={G2} s={S} pose={strike} look={HERO} />
      <Effort at={tj.head} />
      <Count x={1040} y={1070} t={`DAY ${Math.max(1, Math.round(p * 100))}`} c={GOLD} />
      <Punch t={t} a={b(C.TXT1A)} bb={b(C.TXT1B)} l1="You won't find yourself." l2="You'll carve yourself." />
    </g>
  );
};

// ================================================================ 2 · the mountain IMPOSSIBLE
const Seg2: React.FC<{ t: number }> = ({ t }) => {
  const boom = b(C.BOOM) + 4, press = ease.out(clamp((t - b(C.BOOM) + 6) / 8));
  const plunge: Pose = { ...POSES.stand(), lean: 10 + press * 16, head: 20, hN: [60, 60 - (1 - press) * 50], hF: [50, 66 - (1 - press) * 50], fN: [40, 0], fF: [-50, 0], elbow: 1 };
  const pj = J(220, G1, plunge, false, S);
  const u = clamp((t - boom) / 60);
  const ph = beatPhase(t, C.SWING0, C.BREAK), done = hitsDone(t, C.SWING0, C.BREAK), p = done / (C.BREAK - C.SWING0 + 1);
  const up = ph < 0 ? 0 : ph < 0.12 ? 1 - ph / 0.12 : ease.inOut((ph - 0.12) / 0.88);
  const through = t >= b(C.BREAK);
  const swingP = reach({ ...POSES.stand(), lean: -10 + (1 - up) * 26, head: -10, fN: [50, 0], fF: [-50, 0] }, 560, G2, [lerp(600, 520, up), lerp(G2 - 150, G2 - 290, up)], [lerp(590, 500, up), lerp(G2 - 120, G2 - 250, up)], false, S);
  const sj = J(560, G2, swingP, false, S);
  const archH = lerp(60, 260, ease.out(p));
  const shake = t > boom && t < boom + 10 ? Math.sin(t * 3) * 6 : 0;
  return (
    <g>
      <Lanes a="Once, hard" b="Every day, a swing" />
      <g transform={`translate(${shake} 0)`}>
        <Mountain g={G1} t="IMPOSSIBLE" />
        {t > boom && <ellipse cx={612} cy={G1 - 110} rx={26} ry={16} fill="#000" opacity={0.6} />}
        {t > boom && t < boom + 70 && <g opacity={1 - u}>{Array.from({ length: 12 }, (_, i) => <circle key={i} cx={560 + rnd(i) * 160 + u * 60 * (rnd(i + 2) - 0.5)} cy={G1 - 120 - rnd(i + 4) * 220 * (0.4 + u)} r={(30 + rnd(i + 8) * 40) * (0.5 + u)} fill="#8a8a92" opacity={0.45} />)}<Glow at={[620, G1 - 140]} r={200} color={RED} a={0.6 * (1 - u)} /></g>}
      </g>
      <rect x={pj.wN[0] - 50} y={G1 - 70} width={100} height={70} rx={6} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} />
      <line x1={pj.wN[0]} y1={pj.wN[1]} x2={pj.wN[0]} y2={G1 - 70} stroke="#8a8a92" strokeWidth={8} />
      <rect x={pj.wN[0] - 34} y={pj.wN[1] - 8} width={68} height={12} rx={4} fill="#d8d8dc" stroke="#000" strokeWidth={2} />
      <path d={`M${pj.wN[0] + 50} ${G1 - 20} Q420 ${G1 + 6} 600 ${G1 - 60}`} fill="none" stroke={RED} strokeWidth={3} />
      <Hero x={220} y={G1} s={S} pose={plunge} look={GREY} />
      {t > boom && t < boom + 40 && <text x={470} y={400} fontFamily={SANS} fontWeight={900} fontSize={96 * (0.8 + 0.2 * pop(t, boom))} fill="#f2f2f2" stroke="#000" strokeWidth={6} paintOrder="stroke" transform="rotate(-8 470 400)" opacity={1 - clamp((t - boom - 25) / 15)}>BOOM!</text>}
      <Count x={1040} y={290} t="TUNNEL: 0 m" />
      <Mountain g={G2} t="IMPOSSIBLE" />
      <defs><radialGradient id="tun2" cx="50%" cy="55%" r="55%"><stop offset="0" stopColor={through ? "#ffe7a8" : "#0b0b0d"} /><stop offset="0.18" stopColor={through ? GOLD : "#0b0b0d"} /><stop offset="0.35" stopColor={through ? "#2a2418" : "#08080a"} /><stop offset="1" stopColor="#050506" /></radialGradient></defs>
      <path d={`M${700 - archH * 0.38} ${G2} V${G2 - archH * 0.58} Q${700 - archH * 0.38} ${G2 - archH} 700 ${G2 - archH} Q${700 + archH * 0.38} ${G2 - archH} ${700 + archH * 0.38} ${G2 - archH * 0.58} V${G2} Z`} fill="url(#tun2)" stroke="#000" strokeWidth={4} />
      {through && <><Rays f={t} at={[700, G2 - 120]} a={0.45 * fade(t, b(C.BREAK), 8)} color={GOLD} n={12} len={420} /><Glow at={[700, G2 - 120]} r={200} color={GOLD} a={0.5 * fade(t, b(C.BREAK), 8)} /></>}
      {Array.from({ length: Math.round(p * 22) }, (_, i) => <polygon key={i} points={`${300 + rnd(i + 2) * 280},${G2 - rnd(i) * 10} ${314 + rnd(i + 2) * 280},${G2 - 14 - rnd(i + 3) * 14} ${330 + rnd(i + 2) * 280},${G2 - rnd(i + 5) * 8}`} fill="#7a7a82" stroke="#000" strokeWidth={1.2} />)}
      <path d={`M${390 - 90 * p} ${G2} Q390 ${G2 - 90 * p} ${390 + 90 * p} ${G2} Z`} fill="#5a5a62" stroke="#000" strokeWidth={2} />
      {Array.from({ length: done }, (_, k) => <Burst key={k} t={t} at={b(C.SWING0 + k)} x={620} y={G2 - 150} r={70} />)}
      <Hero x={560} y={G2} s={S} pose={swingP} look={HERO} />
      <Pickaxe a={sj.wN} b={[sj.wF[0] + lerp(60, 40, up), sj.wF[1] - lerp(10, 70, up)]} />
      <Effort at={sj.head} />
      <Count x={1040} y={1070} t={`SWINGS: ${comma(lerp(1, 10000, Math.pow(p, 3)))}`} c={GOLD} />
      <Punch t={t} a={b(C.TXT2A)} bb={b(C.TXT2B)} l1="Big blasts make noise." l2="Small swings make tunnels." />
    </g>
  );
};

// ================================================================ 3 · the hourglass TIME
const ROWS = [4, 4, 4, 3, 3, 3, 2, 2, 2];
const BRICKS: [number, number][] = []; ROWS.forEach((w, r) => { for (let c = 0; c < w; c++) BRICKS.push([r, c]); });
const brickXY = (i: number): V => { const [r, c] = BRICKS[i], w = ROWS[r]; return [760 - (w * 70) / 2 + c * 70 + (r % 2) * 10 + 33, G2 - (r + 1) * 46 + 21]; };
const heapXY = (i: number): V => [470 + (rnd(i + 11) - 0.5) * 220, G1 - 21 - Math.floor(rnd(i + 3) * 2) * 30];
const spawnAt = (i: number) => (i / 3) * BEAT;
/** a 1h block popping out of the clock and flying to `to` (12 frames) */
const flight = (t: number, i: number, from: V, to: V): { p: V; landed: boolean; r: number } | null => {
  const u = (t - spawnAt(i)) / 12;
  if (u < 0) return null;
  if (u >= 1) return { p: to, landed: true, r: 0 };
  const e = ease.inOut(u);
  return { p: [lerp(from[0], to[0], e), lerp(from[1], to[1], e) - Math.sin(u * Math.PI) * 160], landed: false, r: u * 360 };
};
const Seg3: React.FC<{ t: number }> = ({ t }) => {
  const k = clamp(t / b(9));
  const n = Math.min(BRICKS.length, Math.floor(t / (BEAT / 3)) + 1);
  const c1: V = [190, 420], c2: V = [190, 1250];
  const lie = reach({ ...POSES.lie(), head: -14 }, 800, G1, [690, G1 - 70], undefined, false, S);
  const lj = J(800, G1, lie, false, S);
  // top: the hours fall, go grey and crumble into a heap of dust
  const crumbled = Array.from({ length: n }, (_, i) => clamp((t - spawnAt(i) - 22) / 30)).filter((d) => d >= 1).length;
  const ph = ((t / (BEAT / 3)) % 1 + 1) % 1, place = Math.sin(ph * Math.PI);
  const onTop = t >= b(C.TOP3);
  const builder = reach({ ...POSES.stand(), lean: 10, head: -10 }, 520, G2, [lerp(560, 600, place), lerp(G2 - 200, G2 - 300, place)], [lerp(550, 590, place), lerp(G2 - 180, G2 - 280, place)], false, S);
  return (
    <g>
      <Lanes a="Lets time pass" b="Builds with it" />
      <HourClock x={c1[0]} y={c1[1]} t={t} />
      <path d={`M${470 - 40 - crumbled * 5} ${G1} Q470 ${G1 - 10 - crumbled * 4} ${470 + 40 + crumbled * 5} ${G1} Z`} fill="#4a4a52" />
      {Array.from({ length: n }, (_, i) => {
        const f = flight(t, i, [c1[0], c1[1] + 110], heapXY(i));
        if (!f) return null;
        const dust = f.landed ? clamp((t - spawnAt(i) - 22) / 30) : 0;
        return dust < 1 && <HourBlock key={i} x={f.p[0]} y={f.p[1]} r={f.landed ? (rnd(i) - 0.5) * 30 : f.r} dust={dust} />;
      })}
      <Hero x={800} y={G1} s={S} pose={lie} look={GREY} shadow={0} />
      <Glow at={[lj.wN[0], lj.wN[1] - 10]} r={60} color="#8fb4ff" a={0.5} />
      <rect x={lj.wN[0] - 12} y={lj.wN[1] - 30} width={24} height={40} rx={5} fill="#cfe0ff" stroke="#000" strokeWidth={2} />
      <PopSay t={t} at={b(1)} x={760} y={430} txt="later…" />
      <Count x={1040} y={290} t={`${comma(lerp(1, 1000, k))} h`} c={RED} />
      {/* bottom: the same hours, stacked into a tower */}
      <HourClock x={c2[0]} y={c2[1]} t={t} />
      <Glow at={[760, G2 - 280]} r={300} color={GOLD} a={0.35 * (n / BRICKS.length)} />
      {Array.from({ length: n }, (_, i) => {
        const f = flight(t, i, [c2[0], c2[1] + 110], brickXY(i));
        return f && <HourBlock key={i} x={f.p[0]} y={f.p[1]} r={f.landed ? 0 : f.r} gold={BRICKS[i][0] === ROWS.length - 1 && f.landed} />;
      })}
      {!onTop && <><Hero x={520} y={G2} s={S} pose={builder} look={HERO} /><Effort at={J(520, G2, builder, false, S).head} /></>}
      {onTop && <Hero x={770} y={G2 - 9 * 46} s={0.5} pose={mixPose(POSES.stand(), { ...POSES.armsUp(), head: -12 }, ease.out(clamp((t - b(C.TOP3)) / 8)))} look={HERO} shadow={0} />}
      <Count x={1040} y={1070} t={`${comma(lerp(1, 1000, k))} h`} c={GOLD} />
      <Punch t={t} a={b(C.TXT3A)} bb={b(C.TXT3B)} l1="Time will pass anyway." l2="Let it build something." />
    </g>
  );
};

// ================================================================ 4 · the street lamps (finale)
const POSTS = Array.from({ length: 8 }, (_, i) => 380 + i * 190);
const Seg4: React.FC<{ t: number }> = ({ t }) => {
  const fails = [C.M1, C.M2, C.M3].filter((m) => t >= b(m) + 6).length;
  const lit = t >= b(C.M4), torch = t >= b(C.TORCH);
  const strikeK = [C.M1, C.M2, C.M3, C.M4].reduce((m, x) => Math.max(m, 1 - Math.abs(t - b(x)) / 6), 0);
  const lightAt = (i: number) => b(C.LAMP0 + i * C.LAMPD);
  const lamps = POSTS.map((_, i) => t >= lightAt(i));
  // he runs post to post: arrive 4 frames before its light-up, leave 4 frames after
  let hx = 180, raise = 0, running = false;
  if (torch) {
    hx = POSTS[POSTS.length - 1] - 70; raise = 1;
    for (let i = 0; i < POSTS.length; i++) {
      const arrive = lightAt(i) - 4, leave = lightAt(i) + 4, from = i === 0 ? 180 : POSTS[i - 1] - 70, depart = i === 0 ? b(C.TORCH) + 6 : lightAt(i - 1) + 4;
      if (t < arrive) { const u = clamp((t - depart) / (arrive - depart)); hx = lerp(from, POSTS[i] - 70, u); running = u > 0; raise = 0; break; }
      if (t < leave || i === POSTS.length - 1) { hx = POSTS[i] - 70; raise = clamp(1 - Math.abs(t - lightAt(i)) / 6); if (i === POSTS.length - 1 && t >= leave) raise = 1; break; }
    }
  }
  const handT: V = torch ? [hx + 60, lerp(G2 - 230, G2 - 330, raise)] : [lerp(hx + 50, hx + 90, strikeK), G2 - 200 - strikeK * 20];
  const base: Pose = running ? { ...run(t / 20), lean: 12, head: -8 } : { ...POSES.stand(), lean: 6 - raise * 10, head: torch ? -10 - raise * 16 : 14 };
  const pose = reach(base, hx, G2, handT, running ? undefined : [hx + 40, G2 - 190], false, S);
  const tj = J(hx, G2, pose, false, S);
  // camera: follows him along the road, then pulls back over the whole lit road
  const pu = ease.inOut(clamp((t - b(C.PULL0)) / (b(C.PULL1) - b(C.PULL0))));
  const camX = lerp(clamp(hx - 420, 0, 2000), 0, pu), z = lerp(1, 0.5, pu);
  const nLit = lamps.filter(Boolean).length;
  const title = fade(t, b(C.TITLE), 10);
  return (
    <g>
      <Lanes a="Waits for someone" b="Strikes again" />
      <Lamp x={580} g={G1} h={360} />
      <Hero x={500} y={G1} s={S} pose={{ ...POSES.hugKnees(), head: -10 }} look={GREY} />
      <PopSay t={t} at={b(1)} x={620} y={330} txt="someone will light it…" />
      <Count x={1040} y={290} t="WAITING" />
      <defs><clipPath id="road"><rect x={0} y={1040} width={1080} height={760} /></clipPath></defs>
      <g clipPath="url(#road)">
        <g transform={`translate(0 ${G2}) scale(${z}) translate(${-camX} ${-G2})`}>
          <rect x={-200} y={G2} width={2600} height={60} fill="#141418" />
          {nLit > 1 && <rect x={POSTS[0] - 120} y={G2 - 6} width={POSTS[nLit - 1] - POSTS[0] + 240} height={40} rx={20} fill={GOLD} opacity={0.12} />}
          {POSTS.map((x, i) => <Lamp key={i} x={x} g={G2} h={300} on={lamps[i]} f={t + i * 7} />)}
          {lamps.map((on, i) => on && <Burst key={i} t={t} at={lightAt(i)} x={POSTS[i]} y={G2 - 330} r={70} color={GOLD} />)}
          {Array.from({ length: fails }, (_, i) => <g key={i} transform={`rotate(${-30 + i * 25} ${100 + i * 36} ${G2 - 6})`}><line x1={100 + i * 36} y1={G2 - 6} x2={144 + i * 36} y2={G2 - 6} stroke="#c8b48a" strokeWidth={5} /><circle cx={146 + i * 36} cy={G2 - 6} r={6} fill={RED} /></g>)}
          {[C.M1, C.M2, C.M3].map((m, i) => { const d = t - b(m); return d >= 0 && d < 10 && <g key={i} opacity={1 - d / 10}>{Array.from({ length: 5 }, (_, k) => <line key={k} x1={tj.wN[0] + 40} y1={tj.wN[1] - 10} x2={tj.wN[0] + 40 + Math.cos(k) * 30} y2={tj.wN[1] - 10 - Math.sin(k) * 30} stroke={RED} strokeWidth={3} />)}</g>; })}
          <Hero x={hx} y={G2} s={S} pose={pose} look={HERO} />
          {!torch && <><rect x={tj.wF[0] - 22} y={tj.wF[1] - 12} width={44} height={26} rx={3} fill="#5a5a62" stroke="#000" strokeWidth={2} /><line x1={tj.wN[0]} y1={tj.wN[1]} x2={tj.wN[0] + 40} y2={tj.wN[1] - 10} stroke="#c8b48a" strokeWidth={5} />{lit && <><path d={`M${tj.wN[0] + 42} ${tj.wN[1] - 12} q-8 -16 0 -28 q8 14 0 28`} fill="#ffe7a8" /><Glow at={[tj.wN[0] + 42, tj.wN[1] - 24]} r={70} color={GOLD} a={0.8} /></>}</>}
          {torch && <><line x1={tj.wN[0]} y1={tj.wN[1]} x2={tj.wN[0] + 10} y2={tj.wN[1] - 60} stroke="#7a6a4a" strokeWidth={10} /><path d={`M${tj.wN[0] + 10} ${tj.wN[1] - 60} q${-18 + Math.sin(t * 0.7) * 6} -24 0 -56 q${18 + Math.sin(t) * 6} 32 0 56`} fill="#ffb84a" /><Glow at={[tj.wN[0] + 10, tj.wN[1] - 86]} r={130} color={GOLD} a={0.8} /></>}
        </g>
      </g>
      <Count x={1040} y={1070} t={`MATCHES: ${Math.min(4, fails + (lit ? 1 : 0))}`} c={lit ? GOLD : RED} />
      <Punch t={t} a={b(C.TXT4A)} bb={b(C.TXT4B)} l1="Nobody is coming to light it for you." l2="Strike again." />
      {title > 0 && <g opacity={title}><rect x={0} y={60} width={1080} height={130} fill="#000" opacity={0.85} /><text x={540} y={150} textAnchor="middle" fontFamily='"Arial Black", "Segoe UI Black", Impact, sans-serif' fontSize={64} letterSpacing={3} fill={GOLD}>PROVE IT TO YOURSELF</text></g>}
    </g>
  );
};

// ================================================================ assembly
const SEGS: [number, React.FC<{ t: number }>][] = [[Q.S0, Seg0], [Q.S1, Seg1], [Q.S2, Seg2], [Q.S3, Seg3], [Q.S4, Seg4]];
export const ProveFilm: React.FC<{ at?: number; noFade?: boolean }> = ({ at, noFade }) => {
  const cur = useCurrentFrame();
  const f = at ?? cur;
  let k = 0; for (let i = 0; i < SEGS.length; i++) if (f >= SEGS[i][0]) k = i;
  const [start, Seg] = SEGS[k], end = k + 1 < SEGS.length ? SEGS[k + 1][0] : Q.LEN, t = f - start;
  const black = noFade ? 0 : Math.max(k > 0 ? 1 - clamp(t / 5) : 0, k + 1 < SEGS.length ? clamp((f - (end - 5)) / 5) : 0);
  const push = 1 + 0.03 * (t / (end - start));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <KitDefs />
        <Defs />
        <g transform={`translate(540 960) scale(${push}) translate(-540 -960)`}><Seg t={t} /></g>
        <Vignette a={0.3} />
        <rect x={0} y={0} width={1080} height={1920} fill="#000" opacity={black} />
      </svg>
    </AbsoluteFill>
  );
};
