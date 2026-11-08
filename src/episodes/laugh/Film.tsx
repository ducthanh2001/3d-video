// LaughFilm: "LET THEM LAUGH" 35.5 s (1065 frames), 1080x1920, 30 fps. Six wordless vignettes, each a tiny story with a twist,
// drawn in the competitor's million-view look (big shaded props, filled terrain, monospace labels) in B&W + gold.
// The hook opens a question (an ugly first stroke on a huge wall) that the last vignette answers (it became the mountain).
// Every number of time lives in events.ts (shared with audio/make_audio_laugh.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { V, clamp, ease, lerp } from "../../kit/core";
import { Hero, POSES, Pose, mixPose, run, walk } from "../../kit/hero";
import { KitDefs, Vignette } from "../../kit/materials";
import { Glow, Rays } from "../../kit/fx";
import { Defs, GOLD, SANS } from "../samehours/StyleFrames";
import { J, reach } from "../beatyesterday/StyleFrames";
import {
  Arch, Board, Bubble, Cart, Floor, GHOST, GREY, HERO, MONO, Masonry, Merlons, Pack, Painter, RIDGE, Roof, Spectator,
  Stone, Tag, WORDS, Wall, ridgeD, rnd,
} from "./Frames";
import { BEAT, C, Q } from "./events";

export const LAUGH_FILM_FRAMES = Q.LEN;
const W = "#f2f2f2";
const b = (n: number) => n * BEAT;
const fade = (t: number, a: number, d = 8) => clamp((t - a) / d);
const pop = (t: number, a: number) => ease.back(clamp((t - a) / 9));
const arc = (a: V, c: V, h: number, u: number): V => [lerp(a[0], c[0], u), lerp(a[1], c[1], u) - 4 * h * u * (1 - u)];
/** a point a fraction u along a polyline */
const along = (pts: V[], u: number): V => {
  const L: number[] = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const d = clamp(u) * L[L.length - 1];
  let i = 1; while (i < L.length - 1 && L[i] < d) i++;
  const k = (d - L[i - 1]) / (L[i] - L[i - 1] || 1);
  return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)];
};
/** two-stage punchline at the bottom of the frame */
const Punch: React.FC<{ t: number; a: number; b?: number; l1: string; l2?: string; y?: number }> = ({ t, a, b: bb, l1, l2, y = 1790 }) => (
  <g>
    <g opacity={fade(t, a, 6)} transform={`translate(540 ${y}) scale(${0.85 + 0.15 * pop(t, a)})`}><text textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={46} fill={W}>{l1}</text></g>
    {l2 && bb !== undefined && <g opacity={fade(t, bb, 6)} transform={`translate(540 ${y + 62}) scale(${0.85 + 0.15 * pop(t, bb)})`}><text textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={50} fill={GOLD}>{l2}</text></g>}
  </g>
);
/** a bubble that pops in at frame `at` (and can be dimmed later) */
const PopBubble: React.FC<{ t: number; at: number; x: number; y: number; txt: string; r?: number; gold?: boolean; dimAt?: number }> = ({ t, at, x, y, txt, r, gold, dimAt }) => {
  if (t < at) return null;
  const k = pop(t, at), a = dimAt !== undefined && t > dimAt ? 1 - 0.7 * clamp((t - dimAt) / 8) : 1;
  return <g opacity={a} transform={`translate(${x} ${y}) scale(${k}) translate(${-x} ${-y})`}><Bubble x={x} y={y} t={txt} r={r} gold={gold} /></g>;
};
const Puff: React.FC<{ t: number; at: number; x: number; y: number; w?: number }> = ({ t, at, x, y, w = 60 }) => {
  const u = (t - at) / 12;
  if (u < 0 || u > 1) return null;
  return <g opacity={(1 - u) * 0.55}>{[-1, 1].map((d) => <ellipse key={d} cx={x + d * (w * 0.5 + u * w * 0.6)} cy={y - 6 - u * 10} rx={10 + u * 16} ry={6 + u * 8} fill="#bdbdc4" />)}</g>;
};
const Crowd: React.FC<{ pts: number[][]; t: number; bob?: number }> = ({ pts, t, bob = 0 }) => (
  <g>{pts.map(([x, y], i) => <Spectator key={i} x={x} y={y - Math.abs(Math.sin((t + i * 7) * 0.35)) * bob} s={0.95} tone={i % 2} />)}</g>
);

// ================================================================ 0 · HOOK: the first stroke (ugly, crooked, unfinished)
const HALF: V[] = [[560, 760], [575, 690], [620, 640], [690, 610], [760, 605], [800, 640]];
const Seg0: React.FC<{ t: number }> = ({ t }) => {
  const G = 1440;
  const p1 = clamp((t - b(C.ST1A)) / (b(C.ST1B) - b(C.ST1A))), p2 = clamp((t - b(C.ST2A)) / (b(C.ST2B) - b(C.ST2A))), p3 = clamp((t - b(C.ARCA)) / (b(C.ARCB) - b(C.ARCA)));
  const r1 = RIDGE.slice(0, 7), r2 = RIDGE.slice(8);
  const tip: V = t < b(C.ST1B) ? along(r1, p1) : t < b(C.ST2A) ? arc(r1[r1.length - 1], r2[0], 20, clamp((t - b(C.ST1B)) / (b(C.ST2A) - b(C.ST1B)))) : t < b(C.ARCA) ? along(r2, p2) : along(HALF, p3);
  const laughing = t > b(C.LAUGH1) ? 6 : 0;
  return (
    <g>
      <Tag x={540} y={250} t="DAY 1" />
      <Wall x0={60} y0={330} x1={1020} y1={G} />
      <Floor y={G} />
      <g opacity={0.1} stroke="#fff" strokeWidth={2} fill="none" strokeDasharray="10 12"><circle cx={720} cy={820} r={200} /><path d="M60 1180 L300 1100 L720 760 L1020 980" /></g>
      <Glow at={[520, 930]} r={220} color={GOLD} a={0.22 * p1} />
      <path d={ridgeD(r1)} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p1} fill="none" stroke={GOLD} strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" opacity={p1 > 0 ? 1 : 0} />
      <path d={ridgeD(r2)} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p2} fill="none" stroke={GOLD} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" opacity={p2 > 0 ? 0.85 : 0} />
      {[1, 3, 5, 9, 11].map((i, k) => {
        const at = i < 7 ? b(C.ST1A) + (i / 6) * (b(C.ST1B) - b(C.ST1A)) : b(C.ST2A) + ((i - 8) / 6) * (b(C.ST2B) - b(C.ST2A));
        const L = (40 + k * 18) * ease.out(clamp((t - at - 4) / 24));
        if (L <= 0) return null;
        return <g key={i}><line x1={RIDGE[i][0]} y1={RIDGE[i][1]} x2={RIDGE[i][0] + 2} y2={RIDGE[i][1] + L} stroke={GOLD} strokeWidth={7} strokeLinecap="round" /><circle cx={RIDGE[i][0] + 2} cy={RIDGE[i][1] + L + 4} r={7} fill={GOLD} /></g>;
      })}
      <path d={ridgeD(HALF)} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p3} fill="none" stroke={GOLD} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" opacity={p3 > 0 ? 0.7 : 0} />
      {Array.from({ length: 14 }, (_, i) => t > 10 + i * 5 && <circle key={i} cx={420 + rnd(i + 60) * 360} cy={760 + rnd(i + 70) * 330} r={2 + rnd(i + 80) * 5} fill={GOLD} opacity={0.7} />)}
      <Painter x={430} g={G} tip={[tip[0] - 10, tip[1] + 30]} />
      <Crowd t={t} bob={laughing} pts={[[120, 1660], [260, 1690], [420, 1670], [600, 1700], [780, 1670], [950, 1690]]} />
      <PopBubble t={t} at={b(C.LAUGH1)} x={170} y={1500} txt="HAHA" r={-6} />
      <PopBubble t={t} at={b(C.LAUGH2)} x={480} y={1530} txt="what is that?" r={3} />
      <PopBubble t={t} at={b(C.LAUGH3)} x={860} y={1505} txt="a 5 y/o did that" r={-4} />
      <PopBubble t={t} at={b(C.LAUGH4)} x={700} y={1585} txt="HAHA" r={6} />
      <Punch t={t} a={b(C.TXT0)} l1="They laughed at the first stroke." y={1840} />
    </g>
  );
};

// ================================================================ 1 · the castle: every stone they throw becomes a block
const G1 = 1480, BH = 54, TK = G1 - 8 * BH, TL = G1 - 11 * BH, TB = G1 - 14 * BH, PX = 760, CS = 0.62;
const CATCH_BASE: Pose = { ...POSES.stand(), lean: -8, head: -18, fN: [28, 0], fF: [-26, 0] };
const CATCH = reach(CATCH_BASE, PX, 0, [PX - 6, -252], [PX - 56, -244], false, CS);
const PLACE: Pose = { ...POSES.stand(), lean: 18, head: 20, hN: [60, 90], hF: [40, 96], fN: [28, 0], fF: [-26, 0] };
const THROW_W: Pose = { ...POSES.throw(), hN: [40, 50], hF: [-96, -60], lean: -10, head: -6 };
const THROWERS = [60, 160, 255];
const Seg1: React.FC<{ t: number }> = ({ t }) => {
  const catches = Array.from({ length: C.CATCHN - C.CATCH0 + 1 }, (_, k) => b(C.CATCH0 + k));
  // the build rises one step per catch
  const prog = catches.reduce((a, c) => a + ease.out(clamp((t - c) / 8)), 0) / catches.length;
  const topY = lerp(G1, TB - 250, prog), heroY = Math.max(topY, TK);
  const near = catches.reduce((m, c) => Math.min(m, Math.abs(t - c)), 1e9);
  const holdLast = t > catches[catches.length - 1] - 6;
  const pose = holdLast ? CATCH : near < 10 ? mixPose(PLACE, CATCH, 1 - near / 10) : PLACE;
  const hands: V = [PX - 30, heroY - 250];
  const flag = clamp((t - b(C.FLAG1)) / 10);
  return (
    <g>
      {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={rnd(i) * 1080} cy={rnd(i + 40) * 420 + 150} r={rnd(i + 80) * 2 + 0.6} fill="#fff" opacity={0.2 + rnd(i + 3) * 0.3} />)}
      <Tag x={540} y={250} t="EVERY WORD THEY THREW" size={32} dim />
      <Floor y={G1} />
      {[[20, 1], [110, 0], [205, 1], [290, 0]].map(([x, k], i) => <Hero key={`b${i}`} x={x + 40} y={G1 - 4} s={0.48} pose={k ? { ...POSES.throw(), hN: [80, -60] } : THROW_W} look={GHOST} shadow={0} opacity={0.35} />)}
      {THROWERS.map((x, i) => {
        const rel = catches.filter((_, k) => k % 3 === i).map((c) => c - 14);
        const d = rel.reduce((m, r) => (Math.abs(t - r) < Math.abs(m) ? t - r : m), 1e9);
        const p = d < 0 && d > -14 ? mixPose(POSES.throw(), THROW_W, (d + 14) / 14) : POSES.throw();
        return <Hero key={i} x={x} y={G1} s={0.52} pose={p} look={GREY} shadow={0} />;
      })}
      {/* the castle, revealed from the ground up as it is built */}
      <defs><clipPath id="build"><rect x={0} y={topY} width={1080} height={G1 - topY + 4} /></clipPath></defs>
      <Glow at={[750, 900]} r={420} color={GOLD} a={0.18 * prog} />
      <g clipPath="url(#build)">
        <Masonry x0={690} x1={830} g={G1} rows={14} bw={70} seed={90} />
        <Roof x0={690} x1={830} y={TB} h={240} id="rfB" />
        <Arch x={760} y={TB + 150} w={34} h={70} />
        <Masonry x0={440} x1={590} g={G1} rows={11} bw={75} seed={10} />
        <Roof x0={440} x1={590} y={TL} h={200} id="rfL" />
        <Arch x={515} y={TL + 170} w={34} h={66} />
        <Masonry x0={930} x1={1060} g={G1} rows={11} bw={65} seed={70} />
        <Roof x0={930} x1={1060} y={TL} h={200} id="rfR" />
        <Arch x={995} y={TL + 170} w={32} h={64} />
        <Masonry x0={590} x1={930} g={G1} rows={8} bw={85} seed={40} />
        <Merlons x0={590} x1={930} y={TK} seed={200} />
        <Glow at={[760, G1 - 90]} r={150} color={GOLD} a={0.45} />
        <Arch x={760} y={G1} w={110} h={190} />
        {[650, 870].map((x) => <Arch key={x} x={x} y={G1 - 250} w={34} h={70} />)}
      </g>
      {flag > 0 && <g><line x1={760} y1={TB - 240} x2={760} y2={TB - 240 - 160 * flag} stroke="#d8d8dc" strokeWidth={6} /><path d={`M763 ${TB - 236 - 160 * flag} q50 ${14 + Math.sin(t * 0.3) * 6} 96 0 q-12 30 0 60 q-46 ${14 - Math.sin(t * 0.3) * 6} -96 0 Z`} fill={GOLD} stroke="#000" strokeWidth={2} opacity={flag} /><Glow at={[800, TB - 380]} r={160} color={GOLD} a={0.4 * flag} /></g>}
      {catches.map((c, k) => <Puff key={k} t={t} at={c + 2} x={PX} y={Math.max(lerp(G1, TB - 250, (k + 1) / catches.length), TK)} w={50} />)}
      {/* stones in flight: thrown 14 frames before each catch */}
      {catches.map((c, k) => {
        const u = (t - (c - 14)) / 14;
        if (u < 0 || u >= 1) return null;
        const from: V = [THROWERS[k % 3] + 50, G1 - 190], p = arc(from, hands, 140, u);
        return <Stone key={k} x={p[0]} y={p[1]} w={120} h={52} t={k === catches.length - 1 ? "FAILURE" : WORDS[k % WORDS.length]} seed={k + 30} r={u * 200 - 100} />;
      })}
      <Glow at={[PX, heroY - 160]} r={220} color={GOLD} a={0.35 * prog} />
      <Hero x={PX} y={heroY} s={CS} pose={pose} look={HERO} />
      {holdLast && t >= catches[catches.length - 1] && <Stone x={hands[0]} y={hands[1] - 22} w={130} h={54} t="FAILURE" seed={77} r={-8} />}
      <Punch t={t} a={b(C.TXT1A)} b={b(C.TXT1B)} l1="They threw stones." l2="He built a castle." y={1730} />
    </g>
  );
};

// ================================================================ 2 · the skate ramp: they laughed at every fall
const G2 = 1480, RS = 0.62;
const RP0: V = [380, G2], RP1: V = [860, G2], RP2: V = [880, G2 - 420];
const ramp = (s: number): { p: V; a: number } => {
  if (s < 0.3) return { p: [150 + (s / 0.3) * 230, G2], a: 0 };
  const u = (s - 0.3) / 0.7, m = 1 - u;
  const p: V = [m * m * RP0[0] + 2 * m * u * RP1[0] + u * u * RP2[0], m * m * RP0[1] + 2 * m * u * RP1[1] + u * u * RP2[1]];
  const d: V = [2 * m * (RP1[0] - RP0[0]) + 2 * u * (RP2[0] - RP1[0]), 2 * m * (RP1[1] - RP0[1]) + 2 * u * (RP2[1] - RP1[1])];
  return { p, a: (Math.atan2(d[1], d[0]) * 180) / Math.PI };
};
const RIDE: Pose = { ...POSES.stand(), hip: [0, -165], lean: 12, head: -8, hN: [50, 60], hF: [-60, 40], fN: [34, 0], fF: [-34, 0] };
const AIR: Pose = { hip: [0, -150], lean: 14, head: -10, hN: [40, 120], hF: [-130, -10], fN: [36, -16], fF: [-34, -16], elbow: 1 };
const FALL_AT = [C.FALL1, C.FALL2, C.FALL3], FALL_N = [1, 23, 47], LAND_X = [470, 300, 560];
const Seg2: React.FC<{ t: number }> = ({ t }) => {
  // which attempt are we in?
  const fails = FALL_AT.map((a) => b(a)), go = b(C.GO);
  let rider: React.ReactNode = null;
  const ghosts: React.ReactNode[] = [];
  let falls = 0;
  fails.forEach((a, i) => {
    const d = t - a;
    if (d >= 30) { falls = FALL_N[i]; ghosts.push(<g key={i}><Hero x={LAND_X[i]} y={G2} s={RS} pose={POSES.lie()} look={GHOST} opacity={0.25} shadow={0} /><Board x={LAND_X[i] + 110} y={G2} r={170} a={0.3} /></g>); return; }
    if (d < 0 || t >= go) return;
    if (d < 16) { const r = ramp((d / 16) * 0.8); rider = <g transform={`rotate(${r.a} ${r.p[0]} ${r.p[1]})`}><Hero x={r.p[0]} y={r.p[1]} s={RS} pose={RIDE} look={HERO} shadow={0} /><Board x={r.p[0]} y={r.p[1] + 4} /></g>; return; }
    // off the board, tumbling back down
    const u = clamp((d - 16) / 12), top = ramp(0.8).p, p = arc(top, [LAND_X[i], G2], 120, ease.inOut(u));
    rider = <g><Hero x={p[0]} y={p[1]} s={RS} pose={u < 1 ? POSES.fallBack() : POSES.lie()} look={HERO} shadow={0} rot={u < 1 ? -60 * u : 0} /><Board x={lerp(top[0], LAND_X[i] + 110, u)} y={lerp(top[1] - 40, G2, u)} r={u * 170} /></g>;
    if (d >= 28) falls = FALL_N[i];
  });
  let air = 0;
  if (t >= go) {
    const d = t - go;
    if (d < 17) { const r = ramp(d / 17); rider = <g transform={`rotate(${r.a} ${r.p[0]} ${r.p[1]})`}><Hero x={r.p[0]} y={r.p[1]} s={RS} pose={RIDE} look={HERO} shadow={0} /><Board x={r.p[0]} y={r.p[1] + 4} gold /></g>; }
    else {
      const u = ease.out(clamp((d - 17) / 22)), hx = lerp(RP2[0], 600, u), hy = lerp(RP2[1], G2 - 600, u) - Math.sin(u * Math.PI) * 120 + (d > 39 ? Math.sin((d - 39) * 0.08) * 6 : 0);
      air = u;
      rider = <g transform={`rotate(${lerp(-80, -18, u)} ${hx} ${hy})`}><Hero x={hx} y={hy} s={RS} pose={mixPose(RIDE, AIR, u)} look={HERO} shadow={0} /><Board x={hx} y={hy + 6} gold /></g>;
    }
  }
  const quiet = t > b(C.HUSH);
  return (
    <g>
      <defs><linearGradient id="ramp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a4a52" /><stop offset="1" stopColor="#141416" /></linearGradient></defs>
      <Tag x={540} y={250} t={`FALLS: ${falls}`} size={40} gold={air > 0} />
      <path d={`M380 ${G2} Q860 ${G2} 880 ${G2 - 420} H1080 V${G2} Z`} fill="url(#ramp)" stroke="#000" strokeWidth={3} />
      <path d={`M380 ${G2} Q860 ${G2} 880 ${G2 - 420}`} fill="none" stroke="#bdbdc4" strokeWidth={5} />
      <rect x={872} y={G2 - 432} width={208} height={14} fill="#9a9aa2" stroke="#000" strokeWidth={2} />
      <Floor y={G2} />
      {ghosts}
      {air > 0 && <Glow at={[600, G2 - 720]} r={260} color={GOLD} a={0.4 * air} />}
      {rider}
      <Crowd t={t} bob={quiet ? 0 : 5} pts={[[140, 1700], [300, 1730], [470, 1710], [640, 1730], [820, 1710]]} />
      <PopBubble t={t} at={fails[0] + 30} x={160} y={1500} txt="HAHA" r={-6} dimAt={b(C.HUSH)} />
      <PopBubble t={t} at={fails[1] + 30} x={420} y={1530} txt="lol" r={4} dimAt={b(C.HUSH)} />
      <PopBubble t={t} at={fails[2] + 30} x={760} y={1510} txt="HAHA" r={-3} dimAt={b(C.HUSH)} />
      <PopBubble t={t} at={b(C.HUSH)} x={300} y={1580} txt="…" />
      <PopBubble t={t} at={b(C.WOW)} x={600} y={1560} txt="wait WHAT" gold />
      <Punch t={t} a={b(C.TXT2A)} b={b(C.TXT2B)} l1="They laughed at every fall." l2="Nobody laughs at the landing." y={1790} />
    </g>
  );
};

// ================================================================ 3 · the food cart: now they wait in line
const G3 = 1460, CX = 760, QS = 0.6, QUEUE = [600, 500, 400, 300, 200, 100];
const DAYS: [number, number][] = [[0, 1], [1, 7], [2, 30], [3, 60], [4, 120], [5, 200], [6, 300], [7, 365]];
const Seg3: React.FC<{ t: number }> = ({ t }) => {
  let day = 1; DAYS.forEach(([bt, d]) => { if (t >= b(bt)) day = d; });
  const open = fade(t, b(C.OPEN3), 6);
  const servePhase = t > b(2) ? Math.max(0, Math.sin(((t - b(2)) / BEAT) * Math.PI)) : 0;
  const serve = reach({ ...POSES.stand(), head: 6 }, CX + 40, G3 - 60, [lerp(CX - 60, CX - 150, servePhase), lerp(G3 - 200, G3 - 220, servePhase)], [lerp(CX - 40, CX - 120, servePhase), G3 - 214], true, QS);
  // a passer-by who laughs on day 1
  const pbx = lerp(-60, 330, clamp(t / b(2.2)));
  return (
    <g>
      <Tag x={540} y={250} t={`DAY ${day}`} gold={day === 365} size={40} />
      {t > b(7) && <g opacity={fade(t, b(7))}><Tag x={540} y={300} t="(day 1: 0 customers)" dim size={26} /></g>}
      <Floor y={G3} />
      <Glow at={[CX, G3 - 300]} r={300} color={GOLD} a={0.3 * open} />
      <Hero x={CX + 40} y={G3 - 60} s={QS} pose={serve} flip look={HERO} shadow={0} />
      <g>
        <Cart x={CX} g={G3} />
        <rect x={CX - 110} y={G3 - 400} width={220} height={58} rx={8} fill="#3a3a40" stroke="#000" strokeWidth={3} opacity={1 - open} />
        {open < 1 && <text x={CX} y={G3 - 360} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={32} fill="#8a8a92" opacity={1 - open}>OPEN</text>}
        {[0, 1, 2].map((i) => <path key={i} d={`M${CX + 55 + i * 20} ${G3 - 222} q${-10 + Math.sin(t * 0.2 + i) * 6} -20 0 -40 q${10 - Math.sin(t * 0.2 + i) * 6} -20 0 -40`} fill="none" stroke="#d8d8dc" strokeWidth={3} opacity={0.35} />)}
      </g>
      {t < b(3) && <Hero x={pbx} y={G3} s={QS} pose={walk(t / 36)} look={GREY} opacity={1 - fade(t, b(2.6))} />}
      {QUEUE.map((x, i) => {
        const at = b(C.CUST0 + i), u = clamp((t - at) / 16);
        if (t < at) return null;
        const cx = lerp(-80, x, ease.out(u));
        const pose = u < 1 ? walk((t - at) / 18) : i === 0 ? reach({ ...POSES.stand(), head: -6 }, x, G3, [CX - 160, G3 - 210], undefined, false, QS) : { ...POSES.idle(t + i * 9), head: i % 2 ? 8 : -4 };
        return <Hero key={i} x={cx} y={G3} s={QS} pose={pose} look={GREY} />;
      })}
      <PopBubble t={t} at={b(0.6)} x={260} y={G3 - 360} txt="HAHA, a cart?" r={-4} dimAt={b(3)} />
      <PopBubble t={t} at={b(C.MORE)} x={420} y={G3 - 300} txt="one more pls" gold r={3} />
      <Punch t={t} a={b(C.TXT3A)} b={b(C.TXT3B)} l1="They laughed at his little cart." l2="Now they wait in line." y={1730} />
    </g>
  );
};

// ================================================================ 4 · the backpack: carried for years, then put down
const G4 = 1420, BS = 0.62;
const SHEET_W = ["LOL", "LOSER", "QUIT", "WEIRD", "NO WAY", "GIVE UP"];
const Seg4: React.FC<{ t: number }> = ({ t }) => {
  const drop = b(C.DROP), runAt = b(C.RUN);
  const n = 1 + Array.from({ length: 5 }, (_, k) => b(C.SHEET0 + k)).filter((s) => t >= s).length;
  const year = Math.min(4, 1 + Math.floor(t / b(1.4)));
  // walking bent (slowly), then the drop, then he straightens and runs
  const wx = lerp(230, 390, clamp(t / drop));
  const lean = 20 + (n - 1) * 3.4;
  const bent: Pose = { ...walk(t / 70, 0.5), hip: [0, -170], lean, head: 30, hN: [30, 120], hF: [10, 126] };
  const stand: Pose = { ...POSES.stand(), head: -10 };
  const straight = clamp((t - drop - 4) / 12);
  let x = wx, pose: Pose = t < drop ? bent : mixPose(bent, stand, ease.out(straight));
  if (t >= runAt) { const d = t - runAt; x = wx + d * 10.5; pose = { ...run(d / 22), lean: 12, head: -10 }; }
  const bj = J(wx, G4, bent, false, BS), back: V = [(bj.sh[0] + bj.hip[0]) / 2 - 92, (bj.sh[1] + bj.hip[1]) / 2 - 70];
  const fall = clamp((t - drop) / 10), land: V = [wx - 70, G4 - 80];
  const packC: V = t < drop ? back : [lerp(back[0], land[0], fall), lerp(back[1], land[1], ease.in(fall))];
  const packR = t < drop ? 24 : lerp(24, -74, fall);
  return (
    <g>
      <Tag x={250} y={640} t={`YEAR ${year}`} dim size={30} />
      {t > b(6) && <g opacity={fade(t, b(6))}><Tag x={820} y={640} t="THE DAY HE DROPPED IT" gold size={28} /></g>}
      <Floor y={G4} />
      <g transform={`translate(540 ${G4}) scale(1.15) translate(-540 ${-G4})`}>
        {/* sheets flying in and stuffing the pack */}
        {Array.from({ length: 5 }, (_, k) => {
          const at = b(C.SHEET0 + k), u = (t - (at - 10)) / 10;
          if (u < 0 || u >= 1) return null;
          const p = arc([-40, G4 - 520 + k * 20], [back[0], back[1] - 120], 60, u);
          return <g key={k} transform={`rotate(${u * 300} ${p[0]} ${p[1]})`}><rect x={p[0] - 29} y={p[1] - 35} width={58} height={70} rx={3} fill="#e8e8ec" stroke="#000" strokeWidth={2} /><text x={p[0]} y={p[1] + 5} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={14} fill="#1a1a1e">{SHEET_W[k + 1]}</text></g>;
        })}
        <Pack c={packC} r={packR} k={0.95} n={t < drop ? n : 0} spilled={t >= drop + 10} />
        {t < drop && <line x1={bj.sh[0]} y1={bj.sh[1]} x2={back[0] + 40} y2={back[1] - 70} stroke="#3a3a40" strokeWidth={8} />}
        <Puff t={t} at={drop + 10} x={land[0]} y={G4} w={90} />
        {t >= drop + 10 && SHEET_W.slice(0, 4).map((w, i) => {
          const u = ease.out(clamp((t - drop - 10) / 12)), sx = land[0] + 60 + i * 40 * u;
          return <g key={w} transform={`rotate(${(i - 1.5) * 22 * u} ${sx + 29} ${G4 - 14})`}><rect x={sx} y={G4 - 50} width={58} height={40} rx={3} fill="#e8e8ec" stroke="#000" strokeWidth={2} opacity={0.85} /><text x={sx + 29} y={G4 - 24} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={14} fill="#1a1a1e">{w}</text></g>;
        })}
        {t >= runAt && <><Glow at={[x, G4 - 220]} r={260} color={GOLD} a={0.38 * fade(t, runAt, 10)} />{[0, 1, 2].map((i) => <line key={i} x1={x - 120 - i * 14} y1={G4 - 280 + i * 50} x2={x - 210 - i * 14} y2={G4 - 280 + i * 50} stroke="#8a8a92" strokeWidth={4} strokeLinecap="round" opacity={0.7 - i * 0.18} />)}</>}
        <Hero x={x} y={G4} s={BS} pose={pose} look={t >= drop + 6 ? HERO : GREY} />
        {t < drop && [0, 1].map((i) => <path key={i} d={`M${bj.head[0] + 30 + i * 14} ${bj.head[1] + 4 + i * 16 + (t % 20) * 0.6} q-5 10 0 16`} stroke="#9a9aa2" strokeWidth={3} fill="none" />)}
      </g>
      <Punch t={t} a={b(C.TXT4A)} b={b(C.TXT4B)} l1="He carried their words for years." l2="Then he put them down." y={1730} />
    </g>
  );
};

// ================================================================ 5 · the mural, and the Day 1 stroke is in it
const G5 = 1440;
const Seg5: React.FC<{ t: number }> = ({ t }) => {
  const sun: V = [720, 830], peak = RIDGE[RIDGE.length - 1];
  const main = `${ridgeD([[60, 1180], ...RIDGE])} L860 900 L1020 990 L1020 1300 L60 1300 Z`;
  const st = (n: number) => fade(t, b(n), 10);
  const z = lerp(1.7, 1, ease.inOut(clamp((t - b(C.PULL0)) / (b(C.PULL1) - b(C.PULL0)))));
  const phones = ease.out(clamp((t - b(C.PHONES)) / 12));
  const ring = clamp((t - b(C.RING)) / 12);
  const sc = 0.8 + 0.2 * ease.back(clamp((t - b(1)) / 12));
  return (
    <g>
      <g transform={`translate(600 900) scale(${z}) translate(-600 -900)`}>
        <defs>
          <clipPath id="mural5"><rect x={60} y={330} width={960} height={G5 - 330} /></clipPath>
          <linearGradient id="msky5" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#101014" /><stop offset="0.55" stopColor="#3a3020" /><stop offset="0.8" stopColor="#8a6a2a" /></linearGradient>
          <radialGradient id="msun5" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#fff4d0" /><stop offset="0.5" stopColor="#ffd270" /><stop offset="1" stopColor={GOLD} /></radialGradient>
          <linearGradient id="mmtn5" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a2a30" /><stop offset="1" stopColor="#09090b" /></linearGradient>
        </defs>
        <Wall x0={60} y0={330} x1={1020} y1={G5} />
        <rect x={52} y={322} width={976} height={G5 - 314} fill="none" stroke="#3a3a40" strokeWidth={6} opacity={st(0)} />
        <g clipPath="url(#mural5)">
          <rect x={60} y={330} width={960} height={G5 - 330} fill="url(#msky5)" opacity={st(0)} />
          {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M${60 + rnd(i) * 300} ${360 + i * 38} q300 ${-8 + rnd(i + 5) * 16} 700 0`} stroke="#fff" strokeWidth={10 + rnd(i + 9) * 10} strokeLinecap="round" opacity={(0.03 + rnd(i + 2) * 0.04) * st(0)} fill="none" />)}
          <g opacity={st(2)}><Rays f={t} at={sun} a={0.55} color={GOLD} n={20} len={700} /></g>
          <Glow at={sun} r={420} color={GOLD} a={0.55 * st(1)} />
          <g opacity={st(1)} transform={`translate(${sun[0]} ${sun[1]}) scale(${sc}) translate(${-sun[0]} ${-sun[1]})`}><circle cx={sun[0]} cy={sun[1]} r={190} fill="url(#msun5)" /></g>
          {[230, 270].map((r) => <circle key={r} cx={sun[0]} cy={sun[1]} r={r} fill="none" stroke={GOLD} strokeWidth={6} opacity={0.35 * st(2)} strokeDasharray="40 22" />)}
          {[[300, 560], [360, 600], [250, 630], [880, 520], [930, 560]].map(([x, y], i) => <path key={i} d={`M${x - 16 + Math.sin(t * 0.05 + i) * 6} ${y} q8 ${-10 - Math.sin(t * 0.3 + i) * 4} 16 0 q8 ${-10 - Math.sin(t * 0.3 + i) * 4} 16 0`} fill="none" stroke="#0b0b0d" strokeWidth={4} opacity={st(6)} />)}
          <path d="M60 1040 L180 930 L270 990 L400 900 L520 980 L640 920 L900 860 L1020 920 L1020 1300 L60 1300 Z" fill="#4a4a52" opacity={0.85 * st(3)} />
          <path d={main} fill="url(#mmtn5)" stroke="#000" strokeWidth={3} opacity={st(4)} />
          {/* the ridge: the Day 1 stroke, there from the start, now lit */}
          <path d={ridgeD(RIDGE)} fill="none" stroke={GOLD} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
          <path d={`M${peak[0]} ${peak[1]} L860 900 L1020 990`} fill="none" stroke="#d8b060" strokeWidth={6} opacity={0.6 * st(4)} />
          <g opacity={st(5)}>
            <g stroke="#0b0b0d" strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" fill="none">
              <path d={`M${peak[0] - 22} ${peak[1] + 2} L${peak[0]} ${peak[1] - 50} L${peak[0] + 22} ${peak[1] + 2} M${peak[0]} ${peak[1] - 50} V${peak[1] - 122} M${peak[0]} ${peak[1] - 112} l-36 -40 l-12 -38 M${peak[0]} ${peak[1] - 112} l36 -40 l12 -38`} />
            </g>
            <circle cx={peak[0]} cy={peak[1] - 150} r={21} fill="#0b0b0d" />
          </g>
          <g opacity={st(5.5)}>
            <rect x={60} y={1300} width={960} height={G5 - 1300} fill="#0e0e12" />
            {Array.from({ length: 7 }, (_, i) => <line key={i} x1={sun[0] - 120 + i * 6 + Math.sin(t * 0.1 + i) * 8} y1={1320 + i * 16} x2={sun[0] + 120 - i * 10 + Math.sin(t * 0.1 + i) * 8} y2={1320 + i * 16} stroke={GOLD} strokeWidth={8} strokeLinecap="round" opacity={0.7 - i * 0.08} />)}
            {Array.from({ length: 6 }, (_, i) => <line key={i} x1={100 + i * 70} y1={1340 + (i % 3) * 30} x2={160 + i * 70} y2={1340 + (i % 3) * 30} stroke="#5a5a62" strokeWidth={4} strokeLinecap="round" />)}
          </g>
        </g>
        {/* the surprise: the crooked stroke they laughed at, circled */}
        {ring > 0 && <g>
          <ellipse cx={(RIDGE[0][0] + RIDGE[9][0]) / 2} cy={(RIDGE[0][1] + RIDGE[9][1]) / 2} rx={210} ry={70} pathLength={1} strokeDasharray={`${ring} 1`} transform={`rotate(-38 ${(RIDGE[0][0] + RIDGE[9][0]) / 2} ${(RIDGE[0][1] + RIDGE[9][1]) / 2})`} fill="none" stroke="#fff" strokeWidth={4} />
          <g opacity={fade(t, b(C.RING + 0.5), 6)}>
            <path d="M250 1170 q-40 20 -60 70" fill="none" stroke="#fff" strokeWidth={4} />
            <text x={190} y={1275} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={30} fill="#fff">day 1</text>
          </g>
        </g>}
        <Floor y={G5} />
        <Painter x={930} g={G5} tip={[985, 1260]} s={0.5} />
        {[[120, 1690], [260, 1720], [420, 1700], [600, 1730], [780, 1700], [950, 1720]].map(([x, y], i) => {
          const ph = clamp(phones * 1.6 - i * 0.12), hx = lerp(x + 20, x + 46, ph), hy = lerp(y - 40, y - 190, ph);
          const flash = Math.max(0, 1 - Math.abs(t - b(9 + (i % 3) * 0.33) - i) / 4);
          return (
            <g key={i}>
              <Spectator x={x} y={y} s={0.95} tone={i % 2} />
              {ph > 0 && <><line x1={x + 30} y1={y - 70} x2={hx} y2={hy} stroke="#4a4a52" strokeWidth={12} strokeLinecap="round" /><Glow at={[hx + 2, hy - 24]} r={40 + flash * 60} color="#ffffff" a={0.35 + flash * 0.5} /><rect x={hx - 16} y={hy - 54} width={36} height={58} rx={6} fill="#e8e8ec" stroke="#000" strokeWidth={2.5} /></>}
            </g>
          );
        })}
      </g>
      <Tag x={540} y={250} t="DAY 365" gold />
      <Punch t={t} a={b(C.TXT5A)} b={b(C.TXT5B)} l1="They laughed at the first stroke." l2="It became the mountain." y={1820} />
    </g>
  );
};

// ================================================================ assembly
const SEGS: [number, React.FC<{ t: number }>][] = [[Q.S0, Seg0], [Q.S1, Seg1], [Q.S2, Seg2], [Q.S3, Seg3], [Q.S4, Seg4], [Q.S5, Seg5]];
export const LaughFilm: React.FC<{ at?: number; noFade?: boolean }> = ({ at, noFade }) => {
  const cur = useCurrentFrame();
  const f = at ?? cur;
  let k = 0; for (let i = 0; i < SEGS.length; i++) if (f >= SEGS[i][0]) k = i;
  const [start, Seg] = SEGS[k], end = k + 1 < SEGS.length ? SEGS[k + 1][0] : Q.LEN, t = f - start;
  const black = noFade ? 0 : Math.max(k > 0 ? 1 - clamp(t / 5) : 0, k + 1 < SEGS.length ? clamp((f - (end - 5)) / 5) : 0);
  const push = 1 + 0.035 * (t / (end - start)); // slow push-in (the mural has its own camera)
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <KitDefs />
        <Defs />
        <g transform={k < 5 ? `translate(540 960) scale(${push}) translate(-540 -960)` : undefined}><Seg t={t} /></g>
        <Vignette a={0.3} />
        <rect x={0} y={0} width={1080} height={1920} fill="#000" opacity={black} />
      </svg>
    </AbsoluteFill>
  );
};
