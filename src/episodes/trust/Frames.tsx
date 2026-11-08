// "TRUST THE PROCESS" v2 — style frames, in the competitor's language (black, grey ground bars, labelled pairs doing the same
// physical task, cutaways, counters). The bamboo is the thread through the whole film: dug up at second 0, it only shoots up
// in the last scene. 0 hook (second 0) · 1 the fog climb · 2 pushing the car (3 rows) · 3 where you look · 4 IMPOSSIBLE
// · 5 finale: year 5, the bamboo.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { V } from "../../kit/core";
import { Hero, HeroLook, POSES, Pose } from "../../kit/hero";
import { KitDefs, Vignette } from "../../kit/materials";
import { Glow, Rays } from "../../kit/fx";
import { BOLD, BOLD_GREY, Defs, GOLD, Ground, SANS } from "../samehours/StyleFrames";
import { J, reach } from "../beatyesterday/StyleFrames";

export const TRUST_FRAMES = 6;
const S = 0.72, RED = "#e0483e", MONO = "Consolas, 'Courier New', monospace", BIG = '"Arial Black", "Segoe UI Black", Impact, sans-serif';
const HERO: HeroLook = { ...BOLD };
const GREY: HeroLook = { ...BOLD_GREY, glow: 0 };
const rnd = (i: number) => { const x = Math.sin(i * 91.7 + 3.1) * 43758.5; return x - Math.floor(x); };
const Lbl: React.FC<{ x?: number; y: number; t: string; dim?: boolean }> = ({ x = 540, y, t, dim }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={42} fill={dim ? "#9a9aa2" : "#f2f2f2"}>{t}</text>
);
const Count: React.FC<{ x: number; y: number; t: string; c?: string; size?: number }> = ({ x, y, t, c = "#8a8a92", size = 36 }) => (
  <text x={x} y={y} textAnchor="end" fontFamily={MONO} fontWeight={800} fontSize={size} letterSpacing={2} fill={c}>{t}</text>
);
const Say: React.FC<{ x: number; y: number; t: string; tail?: number }> = ({ x, y, t, tail = -1 }) => {
  const w = t.length * 16 + 44;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2} y={-32} width={w} height={56} rx={18} fill="#fff" />
      <path d={`M${tail * 26} 22 l${tail * 22} 28 l${-tail * 4} -28 Z`} fill="#fff" />
      <text x={0} y={6} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={28} fill="#111">{t}</text>
    </g>
  );
};
const Punch: React.FC<{ l1: string; l2: string; y?: number }> = ({ l1, l2, y = 1790 }) => (
  <g>
    <text x={540} y={y} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={46} fill="#f2f2f2">{l1}</text>
    <text x={540} y={y + 64} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={54} fill={GOLD}>{l2}</text>
  </g>
);
/** the small corner reminder that keeps the big question open in every middle scene */
/** the climbers counter; with n + title it becomes the chapter header "#n · reason people quit" */
export const ClimbTag: React.FC<{ t: string; n?: number; title?: string }> = ({ t, n, title }) => {
  const ty = title ? 130 : 60, tx = 30;
  return (
    <g>
      {title && <>
        <rect x={30} y={34} width={96} height={68} rx={12} fill="#f0b43a" />
        <text x={78} y={82} textAnchor="middle" fontFamily="'Segoe UI', Arial, sans-serif" fontWeight={900} fontSize={42} fill="#000">#{n}</text>
        <text x={146} y={84} fontFamily="'Segoe UI', Arial, sans-serif" fontWeight={800} fontSize={46} fill="#f2f2f2">{title}</text>
      </>}
      <rect x={tx} y={ty} width={330} height={52} rx={10} fill="#141418" stroke="#3a3a40" strokeWidth={2} />
      <path d={`M${tx + 20} ${ty + 44} l18 -30 l10 14 l8 -10 l16 26 Z`} fill="#8a8a92" />
      <text x={tx + 82} y={ty + 35} fontFamily={MONO} fontWeight={800} fontSize={22} fill="#bdbdc4">CLIMBERS: {t}</text>
    </g>
  );
};
const BambooTag: React.FC = () => <ClimbTag t="…" />;

// ---------------------------------------------------------------- props
const Soil: React.FC<{ g: number; h: number; x0?: number; x1?: number }> = ({ g, h, x0 = 0, x1 = 1080 }) => (
  <g>
    <defs><linearGradient id={`soil${g}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a2a30" /><stop offset="1" stopColor="#0b0b0d" /></linearGradient></defs>
    <rect x={x0} y={g} width={x1 - x0} height={h} fill={`url(#soil${g})`} />
    {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={x0 + rnd(i + g) * (x1 - x0)} cy={g + 10 + rnd(i * 3 + g) * (h - 20)} r={1.5 + rnd(i * 7) * 3} fill="#4a4a52" opacity={0.6} />)}
    <line x1={x0} y1={g} x2={x1} y2={g} stroke="#9a9aa2" strokeWidth={3} />
  </g>
);
const Roots: React.FC<{ x: number; g: number; depth: number; spread: number; a?: number }> = ({ x, g, depth, spread, a = 1 }) => {
  const branches = Array.from({ length: 14 }, (_, i) => {
    const ang = (i / 13) * Math.PI * 0.9 + Math.PI * 0.05, len = depth * (0.5 + rnd(i + 2) * 0.5);
    const ex = x + Math.cos(ang) * spread * (0.4 + rnd(i) * 0.6) * (i % 2 ? 1 : -1), ey = g + Math.sin(ang) * len;
    return `M${x} ${g + 6} Q${(x + ex) / 2 + (rnd(i + 9) - 0.5) * 60} ${(g + ey) / 2} ${ex} ${ey}`;
  });
  return <g opacity={a} stroke="#e8e8ec" fill="none" strokeLinecap="round">{branches.map((d, i) => <path key={i} d={d} strokeWidth={4 - (i % 3)} />)}</g>;
};
const Can: React.FC<{ at: V; r?: number }> = ({ at, r = 30 }) => (
  <g transform={`translate(${at[0]} ${at[1]}) rotate(${r})`}>
    <rect x={-10} y={-20} width={56} height={40} rx={6} fill="url(#sh-grey)" stroke="#000" strokeWidth={2.5} />
    <path d="M46 -10 L84 -30" stroke="#8a8a92" strokeWidth={7} strokeLinecap="round" />
    {[0, 1, 2].map((i) => <line key={i} x1={86 + i * 4} y1={-26 + i * 6} x2={96 + i * 8} y2={10 + i * 14} stroke="#d8d8dc" strokeWidth={2} opacity={0.7} />)}
  </g>
);
const Shovel: React.FC<{ a: V; b: V }> = ({ a, b }) => (
  <g>
    <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#7a6a4a" strokeWidth={8} strokeLinecap="round" />
    <path d={`M${b[0] - 18} ${b[1]} h36 l-6 34 q-12 10 -24 0 Z`} fill="#9a9aa2" stroke="#000" strokeWidth={2.5} transform={`rotate(${(Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI - 90} ${b[0]} ${b[1]})`} />
  </g>
);
const Bamboo: React.FC<{ x: number; base: number; top: number; s?: number }> = ({ x, base, top, s = 1 }) => {
  const segs = Math.floor((base - top) / (90 * s));
  return (
    <g>
      <Glow at={[x, (base + top) / 2]} r={260} color={GOLD} a={0.35} />
      <rect x={x - 16 * s} y={top} width={32 * s} height={base - top} rx={10} fill="url(#sh-gold)" stroke="#000" strokeWidth={3} />
      {Array.from({ length: segs }, (_, i) => <rect key={i} x={x - 20 * s} y={base - (i + 1) * 90 * s} width={40 * s} height={8 * s} rx={4} fill="#b98a32" stroke="#000" strokeWidth={1.5} />)}
      {Array.from({ length: segs }, (_, i) => i % 2 === 0 && <g key={`l${i}`}><path d={`M${x} ${base - (i + 1) * 90 * s} q${50 * s} ${-30 * s} ${100 * s} ${-10 * s} q${-50 * s} ${10 * s} ${-100 * s} ${10 * s}`} fill={GOLD} opacity={0.85} /><path d={`M${x} ${base - (i + 1.5) * 90 * s} q${-50 * s} ${-30 * s} ${-100 * s} ${-10 * s} q${50 * s} ${10 * s} ${100 * s} ${10 * s}`} fill={GOLD} opacity={0.85} /></g>)}
    </g>
  );
};

// ================================================================ 0 · HOOK at second 0
const G0a = 640, G0b = 1400;
const F0: React.FC = () => {
  const dig = reach({ ...POSES.stand(), lean: 28, head: 18, fN: [50, 0], fF: [-60, 0] }, 330, G0a, [440, G0a - 10], [400, G0a - 120], false, S);
  const dj = J(330, G0a, dig, false, S);
  const water = reach({ ...POSES.stand(), lean: 10, head: 16 }, 380, G0b, [480, G0b - 150], undefined, false, S);
  const wj = J(380, G0b, water, false, S);
  return (
    <g>
      <text x={540} y={170} textAnchor="middle" fontFamily={BIG} fontSize={84} fill="#f2f2f2" stroke="#000" strokeWidth={8} paintOrder="stroke">4 years. Nothing.</text>
      <Count x={1040} y={260} t="YEAR 4" c={RED} size={40} />
      <Lbl y={280} t="Digs it up" dim />
      <Soil g={G0a} h={220} />
      {/* dirt thrown up from the shovel */}
      {Array.from({ length: 16 }, (_, i) => <circle key={i} cx={460 + rnd(i) * 160} cy={G0a - 40 - rnd(i + 4) * 160} r={4 + rnd(i + 8) * 8} fill="#4a4a52" />)}
      <path d={`M470 ${G0a} q40 -26 80 0`} fill="#0b0b0d" />
      <ellipse cx={510} cy={G0a - 80} rx={14} ry={10} fill="#cfc6a8" stroke="#000" strokeWidth={2} />
      <Hero x={330} y={G0a} s={S} pose={dig} look={GREY} />
      <Shovel a={dj.wF} b={[450, G0a - 6]} />
      <Lbl y={980} t="Waters it anyway" />
      <Soil g={G0b} h={240} />
      <Roots x={620} g={G0b} depth={210} spread={300} />
      <path d={`M600 ${G0b} q20 -16 40 0`} fill="none" stroke="#5a5a62" strokeWidth={3} />
      <Hero x={380} y={G0b} s={S} pose={water} look={HERO} />
      <Can at={wj.wN} r={20} />
      <text x={540} y={1720} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={46} fill="#f2f2f2">Most people quit here.</text>
      <text x={540} y={1780} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={34} fill={RED}>Wait for it…</text>
    </g>
  );
};

// ================================================================ 1 · the fog climb (after the camera pulled back)
const F1: React.FC = () => {
  const wall = "M340 1660 L360 1220 L420 1020 L470 780 L520 560 L560 450 L1080 450 L1080 1660 Z";
  const climb: Pose = { hip: [-30, -170], lean: 14, head: -30, hN: [40, -120], hF: [20, -90], fN: [20, -50], fF: [-10, -10], elbow: 1 };
  return (
    <g>
      <BambooTag />
      <Lbl y={230} t="Turns back  ·  Keeps climbing" />
      <defs><linearGradient id="cliff" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#5a5a62" /><stop offset="1" stopColor="#1a1a1e" /></linearGradient></defs>
      <path d={wall} fill="url(#cliff)" stroke="#000" strokeWidth={4} />
      {/* the fog below, thinning away as the camera pulls back */}
      {Array.from({ length: 9 }, (_, i) => <ellipse key={i} cx={200 + i * 110} cy={1150 + (i % 3) * 60} rx={260} ry={70} fill="#d8d8dc" opacity={0.12} />)}
      {/* the summit flag, one step above him */}
      <line x1={620} y1={450} x2={620} y2={300} stroke="#d8d8dc" strokeWidth={6} />
      <path d="M623 304 q50 14 96 0 q-12 30 0 60 q-46 14 -96 0 Z" fill={GOLD} stroke="#000" strokeWidth={2} />
      <Glow at={[660, 360]} r={200} color={GOLD} a={0.5} />
      <Hero x={510} y={575} s={0.62} pose={climb} look={HERO} />
      {/* the two who turned back, climbing down far below */}
      <Hero x={395} y={1150} s={0.55} pose={{ ...climb, head: 30 }} look={GREY} opacity={0.6} />
      <Hero x={370} y={1450} s={0.55} pose={{ ...climb, head: 30 }} look={GREY} opacity={0.5} />
      <Say x={240} y={1030} t="Is it even up there?" tail={1} />
      <Punch l1="You can't see the top." l2="That's not a reason to stop." />
    </g>
  );
};

// ================================================================ 2 · pushing the car over the hill, three rows
const Car: React.FC<{ x: number; y: number; r?: number; gold?: boolean }> = ({ x, y, r = 0, gold }) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>
    <path d="M-90 -20 L-80 -56 Q-60 -80 -20 -82 L40 -82 Q70 -78 84 -52 L96 -20 Z" fill={gold ? "url(#sh-gold)" : "url(#sh-grey)"} stroke="#000" strokeWidth={3} />
    <path d="M-50 -56 L-36 -74 H20 L44 -56 Z" fill="#141418" />
    {[-56, 56].map((d) => <circle key={d} cx={d} cy={-14} r={18} fill="#1a1a1e" stroke="#9a9aa2" strokeWidth={4} />)}
  </g>
);
const Meter: React.FC<{ x: number; y: number; v: number }> = ({ x, y, v }) => {
  const c = v > 1 ? GOLD : v > 0.8 ? "#d8d8dc" : RED;
  return (
    <g>
      <rect x={x} y={y} width={200} height={22} rx={11} fill="#141418" stroke="#5a5a62" strokeWidth={2} />
      <rect x={x + 3} y={y + 3} width={Math.min(194, 194 * v)} height={16} rx={8} fill={c} />
      <text x={x + 214} y={y + 19} fontFamily={MONO} fontWeight={800} fontSize={24} fill={c}>{Math.round(v * 100)}%</text>
    </g>
  );
};
export const F2: React.FC<{ tag?: string }> = ({ tag }) => {
  const rows: [string, number, boolean][] = [["Wants it", 0.4, false], ["Needs it", 0.9, false], ["Gives 110%", 1.1, true]];
  return (
    <g>
      <ClimbTag t={tag ?? "…"} />
      {rows.map(([lab, v, over], i) => {
        const g = 560 + i * 440, crest: V = [700, g - 200];
        const hill = `M0 ${g} L${crest[0] - 80} ${crest[1]} L${crest[0] + 40} ${crest[1]} L1080 ${g} V${g + 30} H0 Z`;
        const t = over ? 1.05 : v * 0.85, cx = lerpN(160, crest[0] - 80, t), cy = lerpN(g, crest[1], t);
        const ang = (Math.atan2(crest[1] - g, crest[0] - 80 - 0) * 180) / Math.PI;
        const pusher = reach({ ...POSES.push(), lean: 40, head: -6 }, cx - 150, cy + 20, [cx - 90, cy - 40], [cx - 96, cy - 30], false, 0.6);
        return (
          <g key={lab}>
            <text x={60} y={g - 330} fontFamily={SANS} fontWeight={700} fontSize={36} fill={over ? GOLD : "#9a9aa2"}>{lab}</text>
            <Meter x={700} y={g - 360} v={v} />
            <path d={hill} fill="#16161a" stroke="#9a9aa2" strokeWidth={3} />
            {over
              ? <><Car x={crest[0] + 140} y={crest[1] + 60} r={24} gold /><Glow at={[crest[0] + 140, crest[1] + 20]} r={160} color={GOLD} a={0.4} /><Hero x={crest[0] + 40} y={crest[1]} s={0.6} pose={POSES.armsUp()} look={HERO} /></>
              : <><Car x={cx} y={cy} r={ang} /><Hero x={cx - 150} y={cy + 20} s={0.6} pose={pusher} look={i === 0 ? GREY : HERO} rot={0} /><path d={`M${cx + 120} ${cy - 10} q30 10 50 40`} fill="none" stroke={RED} strokeWidth={4} /><path d={`M${cx + 170} ${cy + 30} l-14 -4 l6 -12`} fill="none" stroke={RED} strokeWidth={4} /></>}
          </g>
        );
      })}
      <Punch l1="Most stop when it gets heavy." l2="The top is just past it." />
    </g>
  );
};
const lerpN = (a: number, b: number, t: number) => a + (b - a) * t;

// ================================================================ 3 · where you look is where you go
const F3: React.FC = () => {
  const G1 = 830, G2 = 1660;
  const signs = (g: number) => [[260, g - 330, "SCROLL"], [560, g - 400, "PARTY"], [820, g - 330, "LATER"]] as [number, number, string][];
  return (
    <g>
      <BambooTag />
      <Lbl y={230} t="Looks at everything" dim />
      <Ground y={G1} />
      {signs(G1).map(([x, y, t]) => <g key={t}><rect x={x - 80} y={y - 30} width={160} height={52} rx={8} fill="#141418" stroke={RED} strokeWidth={3} /><text x={x} y={y + 6} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={26} fill={RED}>{t}</text><Glow at={[x, y]} r={90} color={RED} a={0.25} /></g>)}
      <path d={`M80 ${G1 - 4} Q400 ${G1 - 6} 600 ${G1 - 60} Q760 ${G1 - 120} 860 ${G1 - 40}`} fill="none" stroke="#d8d8dc" strokeWidth={6} strokeDasharray="14 10" />
      <rect x={960} y={G1 - 220} width={70} height={220} fill="#2a2a30" stroke="#3a3a40" strokeWidth={3} />
      <Hero x={640} y={G1 - 70} s={0.62} pose={{ ...POSES.fallBack(), head: -30 }} look={GREY} rot={-20} />
      <Lbl y={1010} t="Looks at the goal" />
      <Ground y={G2} />
      {signs(G2).map(([x, y, t]) => <g key={t} opacity={0.35}><rect x={x - 80} y={y - 30} width={160} height={52} rx={8} fill="#141418" stroke="#5a5a62" strokeWidth={3} /><text x={x} y={y + 6} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={26} fill="#5a5a62">{t}</text></g>)}
      <line x1={80} y1={G2 - 4} x2={960} y2={G2 - 4} stroke={GOLD} strokeWidth={6} />
      <Glow at={[995, G2 - 110]} r={200} color={GOLD} a={0.55} />
      <rect x={960} y={G2 - 220} width={70} height={220} fill="url(#sh-gold)" stroke="#000" strokeWidth={3} />
      <Hero x={820} y={G2} s={0.72} pose={{ ...POSES.stand(), lean: 6, head: -4, hN: [40, 120], hF: [-30, 124] }} look={HERO} />
      <Punch l1="Where you look," l2="is where you go." />
    </g>
  );
};

// ================================================================ 4 · IMPOSSIBLE, from far back
export const F4: React.FC<{ tag?: string }> = ({ tag }) => {
  const G = 1640, steps = 9, bw = 104, bh = 70, sx = 80;
  return (
    <g>
      <ClimbTag t={tag ?? "…"} />
      <Lbl y={230} t="From up close it looked like a wall" dim />
      <Ground y={G} />
      {Array.from({ length: steps }, (_, i) => (
        <g key={i}>
          <rect x={sx + i * bw} y={G - (i + 1) * bh} width={bw - 4} height={(i + 1) * bh} fill={i === steps - 1 ? "url(#sh-gold)" : "url(#sh-grey)"} stroke="#000" strokeWidth={3} />
          <text x={sx + i * bw + (bw - 4) / 2} y={G - (i + 1) * bh + 40} textAnchor="middle" fontFamily={BIG} fontSize={11} fill="#1a1a1e">IMPOSSIBLE</text>
        </g>
      ))}
      <Glow at={[sx + (steps - 1) * bw + 50, G - steps * bh - 120]} r={260} color={GOLD} a={0.5} />
      <Rays f={0} at={[sx + (steps - 1) * bw + 50, G - steps * bh - 120]} a={0.35} color={GOLD} n={14} len={600} />
      <Hero x={sx + (steps - 1) * bw + 50} y={G - steps * bh} s={0.6} pose={POSES.armsUp()} look={HERO} />
      <rect x={sx + 2 * bw - 40} y={G - 3 * bh - 330} width={300} height={70} rx={8} fill="none" stroke="#fff" strokeWidth={3} strokeDasharray="12 10" />
      <path d={`M${sx + 2 * bw + 110} ${G - 3 * bh - 260} l0 180`} stroke="#fff" strokeWidth={3} strokeDasharray="10 8" />
      <text x={sx + 2 * bw + 110} y={G - 3 * bh - 285} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={26} fill="#fff">this was "the wall"</text>
      <Punch l1="Impossible" l2="is just how it looks from below." />
    </g>
  );
};

// ================================================================ 5 · FINALE: year 5, the bamboo
const F5: React.FC = () => {
  const water = reach({ ...POSES.stand(), lean: -8, head: -40 }, 580, G0b, [670, G0b - 160], undefined, false, S);
  const wj = J(580, G0b, water, false, S);
  return (
    <g>
      <Count x={700} y={150} t="YEAR 5" c={GOLD} size={48} />
      <Lbl x={300} y={280} t="Digs it up" dim />
      <Soil g={G0a} h={220} />
      <Hero x={180} y={G0a} s={S} pose={{ ...POSES.stand(), head: -40, hN: [10, 130], hF: [-8, 130] }} look={GREY} />
      <Say x={330} y={420} t="…wait, what?" tail={-1} />
      <Lbl x={330} y={980} t="Waters it anyway" />
      <Soil g={G0b} h={240} />
      <Roots x={800} g={G0b} depth={230} spread={260} />
      {/* the bamboo: four years underground, then straight up through the whole screen */}
      <Bamboo x={800} base={G0b} top={-20} s={1.15} />
      {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${200 + rnd(i) * 700} ${300 + rnd(i + 5) * 1000} q10 -8 20 0 q-10 8 -20 0`} fill={GOLD} opacity={0.7} transform={`rotate(${rnd(i) * 180} ${200 + rnd(i) * 700} ${300 + rnd(i + 5) * 1000})`} />)}
      <Hero x={580} y={G0b} s={S} pose={water} look={HERO} />
      <Can at={wj.wN} r={-20} />
      <Punch l1="It was growing the whole time." l2="TRUST THE PROCESS" y={1730} />
    </g>
  );
};

const FRAMES = [F0, F1, F2, F3, F4, F5];
export const TrustFrames: React.FC = () => {
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
