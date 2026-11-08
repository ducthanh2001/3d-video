// TRUST THE PROCESS v4 — five different comparisons, the mountain as the thread: 0 the mountain at night, 100 at the foot
// (open loop) · 1 pushing the car (3 rows) · 2 the down escalator LIFE · 3 IMPOSSIBLE · 4 the summit above a blurred sea of
// clouds, one of a hundred (close the loop). Climbers stay sharp; only the cloud is blurred.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { V } from "../../kit/core";
import { Hero, HeroLook, POSES, Pose } from "../../kit/hero";
import { KitDefs, Vignette } from "../../kit/materials";
import { Glow, Rays } from "../../kit/fx";
import { BOLD, BOLD_GREY, Defs, GOLD, SANS } from "../samehours/StyleFrames";
import { AR, J, reach } from "../beatyesterday/StyleFrames";
import { ClimbTag } from "./Frames";
import { ChopScene } from "./Chop";
import { FireScene } from "./Fire";

export const TRUST4_FRAMES = 6;
const MONO = "Consolas, 'Courier New', monospace";
export const HERO: HeroLook = { ...BOLD };
export const GREY: HeroLook = { ...BOLD_GREY, glow: 0 };
const rnd = (i: number) => { const x = Math.sin(i * 91.7 + 3.1) * 43758.5; return x - Math.floor(x); };
export const Punch: React.FC<{ l1: string; l2: string; y?: number }> = ({ l1, l2, y = 1790 }) => (
  <g>
    <text x={540} y={y} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={46} fill="#f2f2f2">{l1}</text>
    <text x={540} y={y + 64} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={54} fill={GOLD}>{l2}</text>
  </g>
);
export const Hud: React.FC<{ alt: string; climbers: string; gold?: boolean }> = ({ alt, climbers, gold }) => (
  <g fontFamily={MONO} fontWeight={800} fontSize={32} letterSpacing={2}>
    <text x={40} y={120} fill="#9a9aa2">ALT {alt}</text>
    <text x={1040} y={120} textAnchor="end" fill={gold ? GOLD : "#e8e8ec"}>CLIMBERS {climbers}</text>
  </g>
);

export const Cloud: React.FC<{ y: number; h: number; a?: number; id: string }> = ({ y, h, a = 0.85, id }) => (
  <g>
    <defs><filter id={id} x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation={22} /></filter></defs>
    <g filter={`url(#${id})`} opacity={a}>
      {Array.from({ length: 16 }, (_, i) => <ellipse key={i} cx={-60 + i * 80} cy={y + (rnd(i) - 0.5) * h * 0.5} rx={150 + rnd(i + 3) * 90} ry={h * (0.35 + rnd(i + 5) * 0.25)} fill={i % 2 ? "#d8d8de" : "#c0c0c8"} />)}
    </g>
  </g>
);

// ---------------------------------------------------------------- a real sedan (≈2.5× a person's height in length)
/** side view, facing right; origin = the ground point under the middle of the car */
const Sedan: React.FC<{ gold?: boolean }> = ({ gold }) => {
  const body = gold ? "url(#sh-gold)" : "url(#carBody)";
  return (
    <g>
      <defs>
        <linearGradient id="carBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c8c8ce" /><stop offset="0.5" stopColor="#8a8a92" /><stop offset="1" stopColor="#4a4a52" /></linearGradient>
        <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3a3a44" /><stop offset="1" stopColor="#101014" /></linearGradient>
      </defs>
      {/* body: rear bumper → trunk → rear window → roof → windshield → hood → front bumper */}
      <path d="M-250 -46 Q-256 -96 -228 -104 L-176 -110 L-128 -168 Q-118 -178 -96 -178 L52 -178 Q70 -178 84 -166 L140 -116 L222 -104 Q252 -98 254 -60 L254 -44 Q252 -30 236 -30 L-236 -30 Q-250 -30 -250 -46 Z" fill={body} stroke="#000" strokeWidth={3.5} strokeLinejoin="round" />
      {/* windows */}
      <path d="M-160 -112 L-120 -162 Q-112 -170 -98 -170 L-26 -170 L-26 -112 Z" fill="url(#glass)" stroke="#000" strokeWidth={2.5} />
      <path d="M-14 -112 L-14 -170 L48 -170 Q62 -170 72 -160 L118 -112 Z" fill="url(#glass)" stroke="#000" strokeWidth={2.5} />
      <path d="M-150 -118 L-118 -156" stroke="#fff" strokeWidth={4} opacity={0.18} />
      {/* doors, handles, mirror */}
      <path d="M-20 -112 V-36 M-150 -112 Q-156 -70 -150 -36 M122 -110 Q128 -70 120 -36" fill="none" stroke="#000" strokeWidth={2} opacity={0.6} />
      <rect x={-70} y={-96} width={26} height={6} rx={3} fill="#2a2a30" /><rect x={50} y={-96} width={26} height={6} rx={3} fill="#2a2a30" />
      <path d="M112 -122 l16 -6 l4 10 l-16 4 Z" fill="#3a3a40" stroke="#000" strokeWidth={1.5} />
      {/* lights */}
      <path d="M226 -98 Q248 -94 250 -76 L232 -76 Z" fill="#f2efe0" stroke="#000" strokeWidth={1.5} />
      <rect x={-252} y={-94} width={14} height={22} rx={3} fill="#e0483e" stroke="#000" strokeWidth={1.5} />
      {/* bumpers */}
      <rect x={-258} y={-52} width={30} height={18} rx={6} fill="#2a2a30" stroke="#000" strokeWidth={2} />
      <rect x={228} y={-52} width={30} height={18} rx={6} fill="#2a2a30" stroke="#000" strokeWidth={2} />
      {/* wheels with rims */}
      {[-158, 156].map((x) => (
        <g key={x}>
          <path d={`M${x - 52} -30 A52 52 0 0 1 ${x + 52} -30`} fill="#000" />
          <circle cx={x} cy={-40} r={40} fill="#141418" stroke="#000" strokeWidth={3} />
          <circle cx={x} cy={-40} r={24} fill="#9a9aa2" stroke="#000" strokeWidth={2} />
          {Array.from({ length: 5 }, (_, i) => { const a = (i / 5) * Math.PI * 2; return <line key={i} x1={x} y1={-40} x2={x + Math.cos(a) * 20} y2={-40 + Math.sin(a) * 20} stroke="#4a4a52" strokeWidth={4} />; })}
          <circle cx={x} cy={-40} r={6} fill="#2a2a30" />
        </g>
      ))}
    </g>
  );
};
const CarMeter: React.FC<{ x: number; y: number; v: number }> = ({ x, y, v }) => {
  const c = v > 1 ? GOLD : v > 0.8 ? "#d8d8dc" : "#e0483e";
  return (
    <g>
      <rect x={x} y={y} width={200} height={22} rx={11} fill="#141418" stroke="#5a5a62" strokeWidth={2} />
      <rect x={x + 3} y={y + 3} width={Math.min(194, 194 * v)} height={16} rx={8} fill={c} />
      <text x={x + 214} y={y + 19} fontFamily={MONO} fontWeight={800} fontSize={24} fill={c}>{Math.round(v * 100)}%</text>
    </g>
  );
};
// ---------------------------------------------------------------- the ridge: one long diagonal climb, bottom-left → summit top-right
const RP: V[] = [[-40, 1660], [90, 1580], [200, 1500], [290, 1420], [380, 1340], [450, 1250], [540, 1160], [610, 1060], [680, 960], [740, 860], [800, 740], [850, 620], [890, 500], [915, 420], [935, 410], [980, 470], [1040, 520], [1120, 580]];
export const rY = (x: number) => {
  for (let i = 0; i < RP.length - 1; i++) { const [x0, y0] = RP[i], [x1, y1] = RP[i + 1]; if (x <= x1) return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0); }
  return RP[RP.length - 1][1];
};
export const SUMMIT: V = [925, 412];
const ROPE = 24; // the fixed line runs just above the snow
export const Ridge: React.FC<{ dawn?: boolean }> = ({ dawn }) => {
  const sky = RP.map(([x, y]) => `${x} ${y}`).join(" L");
  return (
    <g>
      <defs>
        <linearGradient id="rk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={dawn ? "#6a5a48" : "#4a4a52"} /><stop offset="0.5" stopColor="#26262c" /><stop offset="1" stopColor="#0a0a0c" /></linearGradient>
        <linearGradient id="sn" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor={dawn ? "#e8cf9a" : "#9a9aa6"} /></linearGradient>
      </defs>
      {/* far range behind, left */}
      <path d="M-20 1240 L120 1080 L230 1150 L360 940 L470 1060 L520 1000 L560 1100 L560 1920 L-20 1920 Z" fill={dawn ? "#2a2620" : "#16161a"} />
      {/* the mountain mass under the ridge */}
      <path d={`M${sky} L1120 1920 L-40 1920 Z`} fill="url(#rk)" />
      {/* rock strata parallel to the ridge + buttresses */}
      {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${RP.map(([x, y]) => `${x + 40 + i * 50} ${y + 60 + i * 70}`).join(" L")}`} fill="none" stroke="#000" strokeWidth={3} opacity={0.35} strokeDasharray={`${80 + i * 10} 40`} />)}
      {[[520, 1300], [700, 1080], [820, 900], [330, 1560]].map(([x, y], i) => <path key={i} d={`M${x} ${y} l60 -120 l50 40 l30 180 Z`} fill="#000" opacity={0.25} />)}
      {/* snow cap hugging the crest, thicker towards the summit, ragged lower edge */}
      <path d={`M${RP.slice(4).map(([x, y]) => `${x} ${y}`).join(" L")} ${RP.slice(4).reverse().map(([x, y], i, a) => { const t = 1 - i / (a.length - 1); return `L${x + 8 + rnd(i + 900) * 10} ${y + 6 + t * 80 + rnd(i + 950) * 14 * t}`; }).join(" ")} Z`} fill="url(#sn)" />
      <path d={`M${RP.slice(4).map(([x, y]) => `${x} ${y}`).join(" L")}`} fill="none" stroke="#000" strokeWidth={2.5} />
      {/* the fixed rope with anchor stakes */}
      <path d={`M${RP.slice(0, 14).map(([x, y]) => `${x} ${y - ROPE}`).join(" L")}`} fill="none" stroke={dawn ? "#e8a040" : "#c84a3c"} strokeWidth={3} />
      {RP.slice(1, 14).map(([x, y], i) => <line key={i} x1={x} y1={y + 4} x2={x} y2={y - ROPE - 6} stroke="#8a8a92" strokeWidth={3} />)}
    </g>
  );
};
/** altitude sign stuck in the snow */
/** sitting on the steep snow, facing down the mountain: bum in a scooped seat, legs down the fall line, head down */
export const SLOPE_SIT: Pose = { hip: [0, -16], lean: 14, head: 34, hN: [48, 44], hF: [40, 50], fN: [74, 98], fF: [60, 88], elbow: 1 };
const Ledge: React.FC<{ x: number; w?: number }> = ({ x, w = 22 }) => (
  <path d={`M${x - w} ${rY(x - w)} Q${x} ${rY(x) + 10} ${x + w} ${rY(x + w)}`} fill="#d8d8de" stroke="#000" strokeWidth={1.5} />
);
export const Marker: React.FC<{ x: number; t: string }> = ({ x, t }) => (
  <g>
    <line x1={x} y1={rY(x)} x2={x} y2={rY(x) - 70} stroke="#9a9aa2" strokeWidth={3} />
    <rect x={x - 70} y={rY(x) - 98} width={84} height={28} rx={4} fill="#0e0e10" stroke="#9a9aa2" strokeWidth={2} />
    <text x={x - 28} y={rY(x) - 77} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={18} fill="#d8d8dc">{t}</text>
  </g>
);
/** a climber on the ridge: feet on the slope, near hand on the fixed rope, far hand driving an ice axe uphill */
export const RidgeClimber: React.FC<{ x: number; s: number; look: HeroLook; lamp?: boolean; haul?: boolean; ph?: number }> = ({ x, s, look, lamp, haul, ph = 0 }) => {
  const y = rY(x), k = (rY(x + 20) - rY(x - 20)) / 40; // dy/dx (negative = rising to the right)
  const d = 34;
  const base: Pose = { ...POSES.stand(), hip: [-10, -150], lean: 42, head: -22, fN: [d + 8, (d + 8) * k], fF: [-d - 14, (-d - 14) * k] };
  const rope: V = [x + 70 * s, rY(x + 70 * s) - ROPE];
  const axeTip: V = [x + 150 * s, rY(x + 150 * s) + 2];
  const grip: V = [axeTip[0] - 10 * s, axeTip[1] - 90 * s];
  const sw = Math.sin(ph * Math.PI * 2) * 22 * s;
  const r1: V = [x + 60 * s + sw, rY(x + 60 * s) - ROPE - 70 * s - sw * 0.8], r2: V = [x + 120 * s - sw, rY(x + 120 * s) - ROPE - 40 * s + sw * 0.8];
  const p = haul ? reach({ ...base, lean: 36, head: -30 }, x, y, r2, r1, false, s) : reach(base, x, y, rope, grip, false, s);
  const j = J(x, y, p, false, s);
  return (
    <g>
      {lamp && <Glow at={j.head} r={60 * s + 14} color="#ffffff" a={0.55} />}
      <Hero x={x} y={y} s={s} pose={p} look={look} shadow={0} behind={(jj) => <rect x={jj.sh[0] - 44} y={jj.sh[1] - 6} width={haul ? 44 : 34} height={haul ? 96 : 70} rx={9} fill="#5a5a62" stroke="#000" strokeWidth={3} />} />
      {haul && <>
        <path d={`M${x - 160 * s} ${rY(x - 160 * s) - ROPE} L${r1[0]} ${r1[1]} L${r2[0]} ${r2[1]} L${x + 300 * s} ${rY(x + 300 * s) - ROPE}`} fill="none" stroke="#e0483e" strokeWidth={4} />
        {[0, 1, 2].map((i) => <path key={i} d={`M${j.head[0] + 30 + i * 12} ${j.head[1] - 4 - i * 8} q10 -6 20 0`} stroke="#d8d8dc" strokeWidth={3} fill="none" opacity={0.6 - i * 0.15} />)}
      </>}
      {!haul && <line x1={j.wF[0]} y1={j.wF[1]} x2={axeTip[0]} y2={axeTip[1]} stroke="#b9b9c0" strokeWidth={Math.max(2, 9 * s)} strokeLinecap="round" />}
      {!haul && <path d={`M${grip[0] - 4 * s} ${grip[1] - 6 * s} l${30 * s} ${-6 * s} l${-6 * s} ${12 * s} Z`} fill="#d8d8dc" stroke="#000" strokeWidth={1.5} />}
    </g>
  );
};

// ================================================================ 0 · night: the line of 100 headlamps on one long ridge
export const M0: React.FC<{ why?: boolean; t?: number; sit?: number; noText?: boolean }> = ({ why, t = 0, sit, noText }) => {
  const nSit = sit ?? (why ? 3 : 0), dr = t * 0.22;
  return (
  <g>
    <defs><linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#030305" /><stop offset="1" stopColor="#16161c" /></linearGradient></defs>
    <rect x={0} y={0} width={1080} height={1920} fill="url(#night)" />
    {Array.from({ length: 110 }, (_, i) => <circle key={i} cx={rnd(i) * 1080} cy={rnd(i + 90) * 1100} r={0.8 + rnd(i * 3) * 1.8} fill="#fff" opacity={0.3 + rnd(i * 7) * 0.6} />)}
    <circle cx={210} cy={300} r={52} fill="#e8e8ec" opacity={0.92} />
    <Ridge />
    {/* the goal: a faint gold glint on the summit */}
    <Glow at={SUMMIT} r={140} color={GOLD} a={0.45} />
    <Cloud y={1020} h={200} id="c0" a={0.55} />
    <Marker x={420} t="2,000 m" />
    <Marker x={700} t="5,000 m" />
    <Marker x={860} t="8,000 m" />
    {/* the queue: small climbers, every one on the rope with a headlamp; it goes on off the bottom of the screen */}
    {[150, 190, 228, 266, 304, 380, 418, 456, 494, 532].map((x0, i) => ({ x0, i, k: [3, 6, 8].indexOf(i) })).map(({ x0, i, k }) => { const x = k >= 0 && k < nSit ? x0 + 24 : x0 + dr; return k >= 0 && k < nSit
      ? <g key={i}><Ledge x={x} /><Hero x={x} y={rY(x) + 2} s={0.24} pose={SLOPE_SIT} look={GREY} shadow={0} flip /><circle cx={x - 4} cy={rY(x) - 62} r={7} fill="#e0483e" /></g>
      : <RidgeClimber key={i} x={x} s={0.24} look={GREY} lamp ph={t / 40 + i * 0.3} />; })}
    {/* him: one of the hundred, lit */}
    <RidgeClimber x={342 + dr} s={0.26} look={HERO} lamp ph={t / 36} />
    <defs><linearGradient id="btm0" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity={0} /><stop offset="0.4" stopColor="#000" stopOpacity={0.85} /><stop offset="1" stopColor="#000" /></linearGradient></defs>
    <rect x={0} y={1600} width={1080} height={320} fill="url(#btm0)" />
    {!noText && <Hud alt={why ? "2,000 m" : "0 m"} climbers={why ? "97" : "100"} />}
    {!noText && (why ? <Punch l1="The climb has barely started…" l2="Why do people quit?" /> : <Punch l1="100 started." l2="How many reached the top?" />)}
  </g>
  );
};

// ================================================================ 1 · the car  · 2 · the down escalator (realistic)
/** a steep asphalt road: lane markings, a guard rail; rises from (0, g) to a crest at (CREST, g - RISE) */
export const CREST = 700, RISE = 300, PS = 0.5, CS = 0.72;
export const slopeAt = (g: number, x: number) => (x <= CREST ? g - (x / CREST) * RISE : g - RISE + ((x - CREST) / (1080 - CREST)) * 90);
const Road: React.FC<{ g: number }> = ({ g }) => {
  const top = (x: number) => slopeAt(g, x);
  const line = `M0 ${g} L${CREST} ${g - RISE} L1080 ${top(1080)}`;
  return (
    <g>
      <defs><linearGradient id={`earth${g}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a3a40" /><stop offset="1" stopColor="#0a0a0c" /></linearGradient></defs>
      <path d={`${line} L1080 ${g + 60} L0 ${g + 60} Z`} fill={`url(#earth${g})`} />
      {[40, 90, 150].map((d, i) => <path key={i} d={`M0 ${g + d * 0.4} L${CREST} ${g - RISE + d} L1080 ${top(1080) + d}`} fill="none" stroke="#000" strokeWidth={2} opacity={0.35} strokeDasharray="60 30" />)}
      <path d={line} fill="none" stroke="#2a2a30" strokeWidth={34} strokeLinejoin="round" />
      <path d={line} fill="none" stroke="#d8d8dc" strokeWidth={3} strokeDasharray="26 22" opacity={0.6} transform="translate(0 -2)" />
      <path d={line} fill="none" stroke="#5a5a62" strokeWidth={3} transform="translate(0 16)" />
      {/* guard rail */}
      {Array.from({ length: 12 }, (_, i) => { const x = 40 + i * 90, y = top(x) - 60; return <line key={i} x1={x} y1={y} x2={x} y2={y + 42} stroke="#4a4a52" strokeWidth={6} />; })}
      <path d={`M0 ${g - 50} L${CREST} ${g - RISE - 50} L1080 ${top(1080) - 50}`} fill="none" stroke="#6a6a72" strokeWidth={7} strokeLinejoin="round" />
    </g>
  );
};
export const CarRow: React.FC<{ g: number; label: string; v: number; carX: number; over?: boolean; tired?: boolean; lean?: number; arrow?: boolean; t?: number; step?: number }> = ({ g, label, v, carX, over, tired, lean, arrow, t = 0, step }) => {
  const up = Math.atan2(RISE, CREST), angDown = Math.atan2(90, 1080 - CREST);
  const ang = carX <= CREST ? -up : angDown, cy = slopeAt(g, carX) - 14;
  const rot = (ang * 180) / Math.PI, ca = Math.cos(ang), sa = Math.sin(ang);
  const world = (lx: number, ly: number): V => [carX + ca * lx * CS - sa * ly * CS, cy + sa * lx * CS + ca * ly * CS];
  // palms flat on the back of the boot, arms straight and diagonal: the body hangs off the car at full lean
  const hN = world(-252, -94), hF = world(-254, -76);
  const base: Pose = { ...POSES.push(), lean: lean ?? (tired ? 46 : 58), head: tired ? 22 : -14, ...(step === undefined ? { fF: [-150, 26] as V, fN: [16, -4] as V } : (() => { const sn = Math.sin(step), lift = (c: number) => Math.max(0, c) * 22; const a = -70 + 80 * sn, c2 = -70 - 80 * sn; return { fN: [a, -a * 0.38 - lift(Math.cos(step))] as V, fF: [c2, -c2 * 0.38 - lift(-Math.cos(step))] as V }; })()) };
  let px = hN[0] - 40;
  for (let d = 40; d < 260; d += 2) { px = hN[0] - d; const sh = J(px, slopeAt(g, px) - 14, base, false, PS).sh; if (Math.hypot(hN[0] - sh[0], hN[1] - sh[1]) >= AR * PS * 0.93) break; }
  const py = slopeAt(g, px) - 14;
  const push = reach(base, px, py, hN, hF, false, PS);
  const pj = J(px, py, push, false, PS);
  return (
    <g>
      <CarMeter x={720} y={g - RISE - 110} v={v} />
      <Road g={g} />
      <text x={40} y={g + 46} fontFamily={SANS} fontWeight={700} fontSize={38} fill={over ? GOLD : "#d8d8dc"}>{label}</text>
      {over && <Glow at={world(0, -100)} r={220} color={GOLD} a={0.4} />}
      <g transform={`translate(${carX} ${cy}) rotate(${rot}) scale(${CS})`}><Sedan gold={over} /></g>
      {over
        ? <Hero x={CREST - 60} y={slopeAt(g, CREST - 60) - 14} s={PS} pose={{ ...POSES.armsUp(), head: -20 }} look={HERO} />
        : <>
            <Hero x={px} y={py} s={PS} pose={push} look={tired ? GREY : HERO} />
            {/* effort: sweat flying off, dust at the feet */}
            {[0, 1, 2].map((i) => <path key={i} d={`M${pj.head[0] - 30 - i * 14} ${pj.head[1] - 6 + i * 12} q-6 10 0 16`} stroke="#bdbdc4" strokeWidth={3} fill="none" />)}
            {[0, 1, 2].map((i) => <ellipse key={i} cx={px - 70 - i * 18} cy={slopeAt(g, px - 70) - 18 - i * 4} rx={10 + i * 4} ry={5 + i * 2} fill="#bdbdc4" opacity={0.25} />)}
            {(arrow ?? tired) && <path d={`M${carX + 30} ${cy - 170} q-70 6 -130 50 m0 0 l22 -2 m-22 2 l10 18`} fill="none" stroke="#e0483e" strokeWidth={5} strokeLinecap="round" />}
          </>}
    </g>
  );
};
const CarScene: React.FC<{ tag: string; n?: number; title?: string }> = ({ tag, n, title }) => (
  <g>
    <ClimbTag t={tag} n={n} title={title} />
    <CarRow g={600} label="Wants it" v={0.4} carX={380} tired />
    <CarRow g={1080} label="Needs it" v={0.9} carX={560} tired />
    <CarRow g={1560} label="Gives 110%" v={1.1} carX={900} over />
    <Punch l1="Most stop when it gets heavy." l2="The top is just past it." y={1760} />
  </g>
);

// ================================================================ 4 · dawn: the same ridge, the ones who stopped sit at their altitude
export const Quit: React.FC<{ x: number; t: string; pose: Pose }> = ({ x, t, pose }) => (
  <g>
    <Ledge x={x} />
    <Hero x={x} y={rY(x) + 2} s={0.26} pose={pose} look={GREY} shadow={0} flip />
    <rect x={x - 150} y={rY(x) + 4} width={116} height={30} rx={4} fill="#0e0e10" opacity={0.85} />
    <text x={x - 92} y={rY(x) + 26} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={20} fill="#d8d8dc">{t}</text>
  </g>
);
export const M4: React.FC<{ t?: number; noText?: boolean }> = ({ t = 0, noText }) => {
  const flag: Pose = { ...POSES.stand(), lean: -8, head: -22, hN: [50, -130], hF: [-56, -96], fN: [30, 0], fF: [-30, 0], elbow: -1 };
  const fj = J(SUMMIT[0] - 10, SUMMIT[1], flag, false, 0.36);
  const top: V = [fj.wN[0] - 4, fj.wN[1] - 70];
  const sit: Pose = SLOPE_SIT;
  const head: Pose = { ...SLOPE_SIT, lean: 30, head: 40, hN: [20, -40], hF: [30, -50], elbow: -1 };
  return (
    <g>
      <defs><linearGradient id="dawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#050507" /><stop offset="0.35" stopColor="#2a2418" /><stop offset="0.6" stopColor="#8a6a2a" /></linearGradient></defs>
      <rect x={0} y={0} width={1080} height={1920} fill="url(#dawn)" />
      {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={rnd(i) * 1080} cy={rnd(i + 50) * 300} r={0.8 + rnd(i * 3) * 1.6} fill="#fff" opacity={0.2 + rnd(i * 7) * 0.4} />)}
      {/* the sun coming up right behind the summit */}
      <Glow at={[1000, 520]} r={620} color={GOLD} a={0.55} />
      <Rays f={0} at={[1000, 520]} a={0.4} color={GOLD} n={18} len={1300} />
      <circle cx={1000} cy={520} r={130} fill="#ffe2a0" />
      <Ridge dawn />
      {/* the sea of clouds hides the lower ridge */}
      <Cloud y={1380} h={300} id="c4" a={0.9} />
      <Cloud y={1560} h={260} id="c5" a={0.95} />
      {/* where they stopped */}
      <Quit x={330} t="1,200 m" pose={sit} />
      <Quit x={560} t="4,100 m" pose={head} />
      <Quit x={740} t="6,800 m" pose={sit} />
      <Ledge x={862} />
      <Hero x={862} y={rY(862) + 2} s={0.3} pose={sit} look={GREY} shadow={0} flip />
      <text x={850} y={rY(872) + 50} textAnchor="end" fontFamily={MONO} fontWeight={800} fontSize={24} fill="#f2f2f2">8,400 m · "I can't."</text>
      {/* the summit: him, planting the flag */}
      <Glow at={[SUMMIT[0], SUMMIT[1] - 80]} r={220} color={GOLD} a={0.6} />
      <Hero x={SUMMIT[0] - 10} y={SUMMIT[1]} s={0.36} pose={flag} look={HERO} />
      {/* waving the flag overhead: pole held high and tilted, cloth rippling in the wind */}
      <line x1={fj.wN[0] - 8} y1={fj.wN[1] + 30} x2={top[0]} y2={top[1]} stroke="#e8e8ec" strokeWidth={5} strokeLinecap="round" />
      <path d={`M${top[0]} ${top[1]} q-40 ${-22 + Math.sin(t / 4) * 14} -80 ${-2 + Math.sin(t / 4 + 1) * 8} t-80 ${2 + Math.sin(t / 4 + 2) * 10} q8 32 -4 62 q40 ${-20 + Math.sin(t / 4 + 2) * 10} 80 ${2 + Math.sin(t / 4 + 1) * 8} t80 -2 Z`} fill={GOLD} stroke="#000" strokeWidth={2} transform={`translate(${top[0]} ${top[1]}) rotate(10) scale(0.72) translate(${-top[0]} ${-top[1]})`} />
      {[0, 1].map((k) => <path key={k} d={`M${top[0] - 140 - k * 14} ${top[1] + 20 + k * 20} q-14 6 -26 0`} stroke="#e8e8ec" strokeWidth={3} fill="none" opacity={0.6} />)}
      <defs><linearGradient id="btm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity={0} /><stop offset="0.4" stopColor="#000" stopOpacity={0.88} /><stop offset="1" stopColor="#000" /></linearGradient></defs>
      <rect x={0} y={1600} width={1080} height={320} fill="url(#btm)" />
      {!noText && <Hud alt="8,848 m" climbers="1 / 100" gold />}
      {!noText && <Punch l1="1 out of 100." l2="Be the one who doesn't quit." />}
    </g>
  );
};

const FRAMES: React.FC[] = [M0, () => <M0 why />, () => <CarScene tag="41 left…" n={1} title="It gets heavy." />, () => <FireScene tag="12 left…" n={2} title="They stop acting." />, () => <ChopScene tag="3 left…" n={3} title="They quit too early." />, M4];
export const TrustV4Frames: React.FC = () => {
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
