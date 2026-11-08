// TruthsFilm: "SMALL TRUTHS" 60.6 s (1819 frames), 1080x1920, 30 fps. 8 minimal segments of 12 beats (95 BPM) each, in the
// competitor-proven look: pure black, thin grey ground lines, small white stick figures, single-stroke props, colour only for meaning.
// All times come from events.ts (shared with audio/make_audio_truths.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { V, clamp, ease, lerp } from "../../kit/core";
import { Hero, POSES, Pose, STRIDE, mixPose, walk, run, solvePose, LOOK_WHITE } from "../../kit/hero";
import { KitDefs } from "../../kit/materials";
import { Confetti, Crack, Dust, Glow, Particles, Rays, Sparkle, Sparks } from "../../kit/fx";
import { Cam } from "../../kit/camera";
import { Phone, Rock } from "../../kit/props";
import { haul, pant, reachBack, scramble, sitChin, slopeWalk, slump } from "./acting";
import { GOLD, GREY, LBL, LINE, Label, MONO, Mountain, RED, INK } from "./StyleFrames";
import { Q, beatF } from "./events";

export const TRUTHS_FRAMES = Q.LEN;
const W = "#f2f2f2";

// ---------------------------------------------------------------- shared bits
const Num: React.FC<{ x: number; y: number; t: string; size?: number; color?: string; a?: number; anchor?: "start" | "middle" | "end" }> = ({ x, y, t, size = 56, color = W, a = 1, anchor = "middle" }) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={MONO} fontWeight={700} fontSize={size} fill={color} opacity={a}>{t}</text>
);
const pop = (f: number, at: number) => ease.back(clamp((f - at) / 8));
const fadeIn = (f: number, at: number, d = 10) => clamp((f - at) / d);
/** x positions of a walker with a per-frame speed function, from frame a to f */

// ---------------------------------------------------------------- 1 + 8 · 1% better / 1% worse
const STEPS = 14, SX = 150, SW = 52, SH = 34, BASE = 820;
const OnePercent: React.FC<{ f: number; p: number; mult: number; formula: number }> = ({ f, p, mult, formula }) => {
  const day = Math.max(1, Math.round(1 + 364 * p));
  const q = p * STEPS, fr = q - Math.floor(q);
  const hx = SX + q * SW + 10, hy = BASE - (Math.min(STEPS, Math.floor(q)) + ease.inOut(fr) * (q < STEPS ? 1 : 0)) * SH - Math.sin(fr * Math.PI) * 10 * (p < 1 ? 1 : 0);
  const topPose = p >= 1 ? mixPose(POSES.stand(), POSES.armsUp(), clamp(mult)) : walk(q * 0.55);
  const shrink = 1 - 0.93 * ease.in(p), dip = 80 * p;
  const tint = Math.round(lerp(242, 255, p)), gb = Math.round(lerp(242, 60, p));
  const bLook = { ...LOOK_WHITE, body: `rgb(${tint},${gb},${gb})`, far: `rgb(${tint * 0.75},${gb * 0.75},${gb * 0.75})`, glow: 0.4 * (1 - p) };
  const bottomPose = p > 0 ? mixPose(walk(f * 0.03, 0.3), POSES.sad(), clamp(p * 2)) : POSES.stand();
  return (
    <g>
      {Array.from({ length: STEPS }, (_, k) => q >= k - 0.5 ? (
        <path key={k} d={`M${SX + k * SW} ${BASE - k * SH} L${SX + k * SW} ${BASE - (k + 1) * SH} L${SX + (k + 1) * SW} ${BASE - (k + 1) * SH}`} fill="none" stroke={GOLD} strokeWidth={4} opacity={(0.35 + 0.65 * (k / STEPS)) * clamp((q - k + 1) * 2)} />
      ) : null)}
      <line x1={40} y1={BASE} x2={SX} y2={BASE} stroke={LINE} strokeWidth={3} />
      {p > 0.6 && <Glow at={[hx, hy - 60]} r={170} color={GOLD} a={0.4 * clamp((p - 0.6) / 0.4)} />}
      <Hero x={hx} y={hy} s={0.42} pose={topPose} shadow={0} />
      <g opacity={clamp(mult)} transform={`translate(330 430) scale(${0.6 + 0.4 * clamp(mult)})`}><Num x={0} y={0} t="×37.8" size={64} color={GOLD} anchor="start" /></g>

      <Num x={540} y={975} t={`DAY ${day}`} />

      <path d={`M40 1560 L${540 - 120 - dip * 0.5} 1560 Q540 ${1560 + dip} ${540 + 120 + dip * 0.5} 1560 L1040 1560`} fill="none" stroke={LINE} strokeWidth={3} />
      {shrink > 0.12
        ? <Hero x={540} y={1560 + dip * 0.5} s={0.42 * shrink} pose={bottomPose} look={bLook} shadow={0} />
        : <><circle cx={540} cy={1560 + dip * 0.45} r={9} fill={RED} /><Glow at={[540, 1560 + dip * 0.45]} r={70} color={RED} a={0.5} /></>}
      <g opacity={clamp(mult)} transform={`translate(600 1500) scale(${0.6 + 0.4 * clamp(mult)})`}><Num x={0} y={0} t="×0.03" size={64} color={RED} anchor="start" /></g>
      <text x={540} y={1700} textAnchor="middle" fontFamily={MONO} fontSize={26} fill="#6a6a72" opacity={formula}>1.01^365 = 37.8   ·   0.99^365 = 0.03</text>
    </g>
  );
};
const Seg1: React.FC<{ f: number }> = ({ f }) => {
  const p = ease.inOut(clamp((f - Q.COUNT0) / (Q.COUNT1 - Q.COUNT0)));
  return (
    <>
      <Cam f={f} keys={[{ f: 0, x: 540, y: 960, z: 1.06 }, { f: Q.S2, x: 540, y: 960, z: 1.0, e: "inOut" }]} kicks={[{ f: Q.MULT, amp: 14 }]}>
        <OnePercent f={f} p={p} mult={pop(f, Q.MULT)} formula={fadeIn(f, Q.MULT + 14)} />
      </Cam>
      <Label y={170} t="1% BETTER EVERY DAY" opacity={fadeIn(f, 2, 6)} />
      <Label y={1150} t="1% WORSE EVERY DAY" opacity={fadeIn(f, 2, 6)} />
    </>
  );
};
const Seg8: React.FC<{ f: number }> = ({ f }) => {
  const reset = f >= Q.RESET;
  return (
    <>
      <Cam f={f} keys={[{ f: Q.S8, x: 540, y: 960, z: 1.0 }, { f: Q.RESET, x: 540, y: 960, z: 1.06, e: "inOut" }]} kicks={[{ f: Q.DROP3, amp: 12 }]}>
        <OnePercent f={f} p={reset ? 0 : 1} mult={reset ? 0 : 1} formula={reset ? 0 : 1} />
      </Cam>
      <Label y={170} t="1% BETTER EVERY DAY" />
      <Label y={1150} t="1% WORSE EVERY DAY" />
      {!reset && <g opacity={fadeIn(f, Q.QUESTION, 8)}>
        <rect x={0} y={1010} width={1080} height={110} fill="#000" opacity={0.75} />
        <text x={540} y={1082} textAnchor="middle" fontFamily={LBL} fontSize={50} letterSpacing={2} fill={W}>WHICH ONE ARE YOU <tspan fill={GOLD}>BUILDING?</tspan></text>
      </g>}
    </>
  );
};

// ---------------------------------------------------------------- 2 · carrying / dropping excuses
const EXC = ["TIRED", "NO TIME", "TOMORROW"];
const HS = 0.5; // figure scale in the two-lane segments
const HS2 = 0.6; // the haulers (segment 2) are drawn a little bigger
/** world position of a joint of a Hero drawn at (x, y) with scale s (flip mirrors x) */
const jw = (x: number, y: number, s: number, p: V, flip = false): V => [x + (flip ? -1 : 1) * p[0] * s, y + p[1] * s];
/** small breath puffs in front of a panting figure's head */
const Breath: React.FC<{ f: number; at: V; dir?: number }> = ({ f, at, dir = 1 }) => (
  <g>{[0, 1].map((k) => { const t = ((f + k * 9) % 18) / 18; return <circle key={k} cx={at[0] + dir * (18 + t * 34)} cy={at[1] + 4 - t * 16} r={5 + t * 8} fill="#ffffff" opacity={0.35 * (1 - t)} />; })}</g>
);
/** a rock with the excuse written on it */
const ExcuseRock: React.FC<{ x: number; y: number; t: string; seed: number; a?: number }> = ({ x, y, t, seed, a = 1 }) => (
  <g opacity={a}>
    <Rock x={x} y={y} w={t.length > 6 ? 176 : 150} h={78} seed={seed} />
    <text x={x} y={y - 24} textAnchor="middle" fontFamily='"Arial Black", Impact, sans-serif' fontSize={t.length > 6 ? 22 : 24} fill="#f0f0f0">{t}</text>
  </g>
);
/** the hauler's timeline: speed (px/frame), pose, and whether he is panting, for one lane */
type Haul = { v: number; pose: (dist: number, t: number) => Pose; pant: boolean };
const Seg2: React.FC<{ f: number }> = ({ f }) => {
  const t0 = Q.S2, cuts = [Q.CUT1, Q.CUT2, Q.CUT3].map((c) => c - t0);
  const gT = 820, gB = 1780, X0 = 600;
  // TOP: hauls all three rocks, stops twice to catch his breath, ends on his knees
  const top = (t: number): Haul => {
    if ((t >= 66 && t < 98) || (t >= 150 && t < 186)) return { v: 0, pose: (_, tt) => pant(tt), pant: true };
    if (t >= 205) return { v: 0, pose: () => mixPose(pant(t), POSES.kneel(), clamp((t - 205) / 10)), pant: true };
    return { v: 0.9, pose: (d) => haul(d / (2 * STRIDE * 0.42), 1), pant: false };
  };
  // BOTTOM: same strain, but before every cut he stops, reaches back and cuts one rope; each cut straightens him and speeds him up
  const nCut = (t: number) => cuts.filter((c) => t >= c).length;
  const bot = (t: number): Haul => {
    const reach = cuts.find((c) => t >= c - 12 && t < c);
    if (reach !== undefined) return { v: 0, pose: () => mixPose(haul(0, 1 - nCut(t) / 3), reachBack(), clamp((t - reach + 12) / 6)), pant: false };
    const n = nCut(t);
    if (n >= 3) { const r = clamp((t - cuts[2]) / 10); return { v: lerp(2, 11, r), pose: (d) => (r < 1 ? mixPose(haul(d / 240, 0), run(d / 410), r) : run(d / 410)), pant: false }; }
    return { v: [0.9, 1.7, 2.6][n], pose: (d) => haul(d / (2 * STRIDE * 0.42), 1 - n / 3), pant: false };
  };
  const pos = (lane: (t: number) => Haul, tEnd: number) => { let x = X0; for (let t = 0; t < tEnd; t++) x += lane(t).v; return x; };
  const t = f - t0;
  const tx = pos(top, t), bx = pos(bot, t);
  const topH = top(t), botH = bot(t);
  const tPose = topH.pose(tx - X0, t), bPose = botH.pose(bx - X0, t);
  const rockX = (hx: number, k: number) => hx - 175 - k * 190;
  const ropes = (hx: number, g: number, pose: Pose, alive: boolean[]) => {
    const j = solvePose(pose), hand = jw(hx, g, HS2, j.wN), sh = jw(hx, g, HS2, j.sh);
    return alive.map((ok, k) => ok && <path key={k} d={`M${hand[0]} ${hand[1]} L${sh[0] - 6} ${sh[1] - 6} L${rockX(hx, k) + 60} ${g - 44}`} fill="none" stroke="#a8a8b0" strokeWidth={3} />);
  };
  const tJ = solvePose(tPose);
  // the FARTHEST rock is cut first (TOMORROW, then NO TIME, then TIRED) so a dropped rock is never dragged through
  const cutAt = (k: number) => cuts[2 - k];
  const cutRockX = (k: number) => rockX(pos(bot, cutAt(k)), k);
  const fast = nCut(t) >= 3 && t > cuts[2] + 6;
  return (
    <>
      <Cam f={f} keys={[{ f: Q.S2, x: 540, y: 960, z: 1.0 }, { f: Q.S3, x: 540, y: 960, z: 1.04, e: "inOut" }]} kicks={cuts.map((c) => ({ f: c + t0, amp: 7, dur: 8 }))}>
        <line x1={0} y1={gT} x2={1080} y2={gT} stroke={LINE} strokeWidth={3} />
        {ropes(tx, gT, tPose, [true, true, true])}
        {EXC.map((s, k) => <ExcuseRock key={k} x={rockX(tx, k)} y={gT} t={s} seed={k + 5} />)}
        {topH.v > 0 && <Dust f={f} f0={f - (t % 14)} at={[rockX(tx, 2) - 80, gT - 6]} n={5} seed={t % 14} />}
        <Hero x={tx} y={gT} s={HS2} pose={tPose} look={GREY} shadow={0} />
        {topH.pant && <Breath f={f} at={jw(tx, gT, HS2, tJ.head)} />}

        <line x1={0} y1={gB} x2={1080} y2={gB} stroke={LINE} strokeWidth={3} />
        {ropes(bx, gB, bPose, [0, 1, 2].map((k) => t < cutAt(k)))}
        {EXC.map((s, k) => { const cut = t >= cutAt(k); return <g key={k}>
          <ExcuseRock x={cut ? cutRockX(k) : rockX(bx, k)} y={gB} t={s} seed={k + 5} a={cut ? 1 - 0.55 * clamp((t - cutAt(k)) / 30) : 1} />
          {cut && <line x1={cutRockX(k) + 60} y1={gB - 40} x2={cutRockX(k) + 120} y2={gB - 4} stroke="#a8a8b0" strokeWidth={3} opacity={0.6} />}
        </g>; })}
        {[0, 1, 2].map((k) => <Sparks key={k} f={f} f0={cutAt(k) + t0} at={[cutRockX(k) + 110, gB - 70]} n={16} seed={k + 3} />)}
        {fast && <Glow at={[bx, gB - 90]} r={150} color={GOLD} a={0.35} />}
        <Hero x={bx} y={gB} s={HS2} pose={bPose} shadow={0} />
      </Cam>
      <Label y={170} t="CARRYING EXCUSES" />
      <Label y={1130} t="DROPPING THEM" />
    </>
  );
};

// ---------------------------------------------------------------- 3 · waiting / starting anyway
const ridge = (x: number, y: number, w: number, h: number): V[] => [[x, y], [x + w * 0.3, y - h * 0.55], [x + w * 0.38, y - h * 0.5], [x + w * 0.62, y - h]];
const along = (pts: V[], u: number): V => {
  const L = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1])), tot = L.reduce((a, b) => a + b, 0);
  let d = clamp(u) * tot;
  for (let i = 0; i < L.length; i++) { if (d <= L[i]) { const k = d / L[i]; return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)]; } d -= L[i]; }
  return pts[pts.length - 1];
};
const Seg3: React.FC<{ f: number }> = ({ f }) => {
  const t = f - Q.S3, b1 = Q.BOLT1 - Q.S3, b2 = Q.BOLT2 - Q.S3, top = Q.SUMMIT - Q.S3;
  const bolt = (at: number) => clamp(1 - Math.abs(f - at - 3) / 10);
  const flash = Math.max(bolt(Q.BOLT1), bolt(Q.BOLT2));
  // THE WAITER: chin on hand on a rock, looking up at the cloud. Bolt 1: jumps up, takes two steps toward the mountain,
  // the light dies, shoulders drop, walks back, sits. Bolt 2: only half rises, sits back. After the summit: head down.
  const SEAT_X = 150, SEAT = 112;
  const sitting = sitChin(SEAT, t > top ? 18 : -24);
  let wx = SEAT_X, wPose: Pose = sitting, wFlip = false;
  if (t >= b1 && t < b1 + 8) wPose = mixPose(sitting, POSES.stand(), ease.out((t - b1) / 8));
  else if (t >= b1 + 8 && t < b1 + 34) { wx = lerp(SEAT_X, SEAT_X + 90, (t - b1 - 8) / 26); wPose = walk((wx - SEAT_X) / (2 * STRIDE), 1); }
  else if (t >= b1 + 34 && t < b1 + 44) { wx = SEAT_X + 90; wPose = mixPose(POSES.stand(), slump(), (t - b1 - 34) / 10); }
  else if (t >= b1 + 44 && t < b1 + 68) { wx = lerp(SEAT_X + 90, SEAT_X, (t - b1 - 44) / 24); wFlip = true; wPose = { ...walk((SEAT_X + 90 - wx) / (2 * STRIDE * 0.7), 0.7), head: 26, lean: 10 }; }
  else if (t >= b1 + 68 && t < b1 + 78) wPose = mixPose(slump(), sitting, (t - b1 - 68) / 10);
  else if (t >= b2 && t < b2 + 20) wPose = mixPose(sitting, POSES.stand(), 0.45 * Math.sin(((t - b2) / 20) * Math.PI));
  // THE CLIMBER: scrambles up the first steep face, rests on the shelf panting, walks across it, scrambles the last face
  // (slips once, slides back, keeps going), stands on the summit and raises his arms.
  const pts = ridge(20, 1820, 820, 540);
  const seg = pts.slice(1).map((p, i) => ({ a: (Math.atan2(pts[i][1] - p[1], p[0] - pts[i][0]) * 180) / Math.PI, L: Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]) }));
  const L1 = seg[0].L, L2 = seg[1].L, L3 = seg[2].L, total = L1 + L2 + L3;
  const dAt = (tt: number) => {
    if (tt < 8) return 0;
    if (tt < 72) return L1 * ((tt - 8) / 64);
    if (tt < 96) return L1;
    if (tt < 112) return L1 + L2 * ((tt - 96) / 16);
    if (tt < 140) return L1 + L2 + L3 * 0.45 * ((tt - 112) / 28);
    if (tt < 148) return L1 + L2 + L3 * (0.45 - 0.12 * ease.out((tt - 140) / 8)); // the slip
    if (tt < top) return L1 + L2 + L3 * lerp(0.33, 1, (tt - 148) / (top - 148));
    return total;
  };
  const d = dAt(t), u = d / total, pos = along(pts, u);
  const k = d < L1 ? 0 : d < L1 + L2 ? 1 : 2;
  let cPose: Pose;
  if (t >= top) cPose = mixPose(POSES.stand(), POSES.armsUp(), pop(f, Q.SUMMIT));
  else if (t >= 72 && t < 96) cPose = pant(t, 0);
  else if (t >= 140 && t < 148) cPose = mixPose(scramble(d / 120, seg[2].a), { ...POSES.fallBack(), lean: 10 }, Math.sin(((t - 140) / 8) * Math.PI) * 0.6);
  else if (k === 1) cPose = slopeWalk((d - L1) / (2 * STRIDE * 0.7), seg[1].a, 0.7, 0.6);
  else cPose = scramble(d / 120, seg[k].a);
  const atTop = t >= top;
  const cJ = solvePose(cPose);
  const climbPose = cPose;
  const cloudA = 1 - clamp((f - Q.SUMMIT) / 20) * 0.7;
  return (
    <>
      <Cam f={f} keys={[{ f: Q.S3, x: 540, y: 960, z: 1.0 }, { f: Q.S4, x: 540, y: 960, z: 1.04, e: "inOut" }]} kicks={[{ f: Q.BOLT1, amp: 8 }, { f: Q.BOLT2, amp: 8 }, { f: Q.SUMMIT, amp: 6 }]}>
        <Mountain x={240} y={880} w={820} h={640} />
        <line x1={40} y1={880} x2={1040} y2={880} stroke={LINE} strokeWidth={3} />
        <g opacity={cloudA}>
          <path d="M120 330 q20 -40 70 -30 q30 -40 80 -10 q50 -10 60 30 q30 10 10 40 l-210 0 q-30 -10 -10 -30 z" fill="none" stroke="#9a9aa2" strokeWidth={3} />
          <path d="M210 372 l-24 56 l26 -4 l-20 60 l50 -78 l-28 4 l20 -38 z" fill={GOLD} opacity={0.25 + 0.75 * flash} />
          {flash > 0 && <Glow at={[214, 420]} r={200} color={GOLD} a={0.6 * flash} />}
          <text x={214} y={540} textAnchor="middle" fontFamily={MONO} fontSize={22} fill={GOLD} opacity={0.4 + 0.6 * flash}>MOTIVATION</text>
        </g>
        <Rock x={SEAT_X + 10} y={880} w={120} h={50} seed={9} />
        <Hero x={wx} y={880} s={0.42} pose={wPose} flip={wFlip} look={GREY} shadow={0} />
        {flash > 0 && <Glow at={[214, 420]} r={900} color="#fff6d8" a={0.18 * flash} />}

        <Mountain x={20} y={1820} w={820} h={540} />
        <line x1={0} y1={1820} x2={1080} y2={1820} stroke={LINE} strokeWidth={3} />
        {Array.from({ length: 80 }, (_, i) => { const x = ((i * 137) % 1080) + 0, y = 1200 + ((((i * 211) % 600) + (f - Q.S3) * 26) % 600); return <line key={i} x1={x} y1={y} x2={x - 8} y2={y + 34} stroke="#8a8a92" strokeWidth={2} opacity={0.5} />; })}
        {atTop && <Glow at={[pos[0], pos[1] - 60]} r={190} color={GOLD} a={0.45 * pop(f, Q.SUMMIT)} />}
        <Hero x={pos[0]} y={pos[1]} s={0.4} pose={climbPose} shadow={0} />
        {t >= 72 && t < 96 && <Breath f={f} at={jw(pos[0], pos[1], 0.4, cJ.head)} />}
      </Cam>
      <Label y={170} t="WAITING TO FEEL READY" />
      <Label y={1150} t="STARTING ANYWAY" />
    </>
  );
};

// ---------------------------------------------------------------- 4 · drop by drop
const STONE_L = "M250 1500 L210 1180 L330 980 L540 930 L520 1060 L566 1150 L512 1290 L548 1500 Z";
const STONE_R = "M540 930 L780 1010 L870 1220 L830 1500 L548 1500 L512 1290 L566 1150 L520 1060 Z";
const CRACK: V[] = [[540, 930], [520, 1060], [566, 1150], [512, 1290], [548, 1500]];
const COUNTS = [1, 2, 3, 10, 50, 200, 700, 1500, 3000, 3650];
const Seg4: React.FC<{ f: number }> = ({ f }) => {
  const hits = COUNTS.map((_, k) => Q.S4 + beatF(k) + 10);
  const nHit = hits.filter((h) => f >= h).length;
  const count = nHit ? COUNTS[nHit - 1] : 0;
  const crackP = clamp((nHit - 3) / 6);
  const split = ease.out(clamp((f - Q.SPLIT) / 14));
  const seg = Math.max(1, Math.round(crackP * (CRACK.length - 1)));
  const late = f >= Q.CRACK;
  return (
    <>
      <Cam f={f} keys={[{ f: Q.S4, x: 540, y: 1000, z: 1.0 }, { f: Q.SPLIT, x: 540, y: 1080, z: 1.1, e: "inOut" }, { f: Q.S5, x: 540, y: 1080, z: 1.12 }]} kicks={[...hits.map((h) => ({ f: h, amp: 2.5, dur: 6 })), { f: Q.SPLIT, amp: 18 }]}>
        <line x1={540} y1={480} x2={540} y2={700} stroke="#9ab4ff" strokeWidth={2} strokeDasharray="4 18" opacity={0.4} />
        {hits.map((h, k) => { const t0 = h - 10, a = (f - t0) / 10; if (a < 0 || a > 1 || f >= Q.SPLIT) return null; const y = lerp(500, 922, a * a); return <path key={k} d={`M540 ${y} q-12 22 0 30 q12 -8 0 -30 z`} fill="#d8e6ff" />; })}
        {hits.map((h, k) => <Particles key={k} f={f} f0={h} n={6} at={[540, 930]} seed={k + 40} speed={[3, 7]} cone={140} gravity={0.5} life={[10, 16]} draw={(p) => <circle cx={p.x} cy={p.y} r={4 * p.s} fill="#d8e6ff" opacity={p.a} />} />)}
        {split > 0 && <Rays f={f} at={[540, 1200]} a={0.6 * split} n={14} width={4} color={GOLD} />}
        <Glow at={[540, 1200]} r={200 + 200 * split} color={GOLD} a={0.15 + 0.5 * crackP} />
        <g transform={`translate(${-60 * split} ${10 * split}) rotate(${-6 * split} 380 1500)`}><path d={STONE_L} fill="#121216" stroke="#d8d8dc" strokeWidth={4} strokeLinejoin="round" /></g>
        <g transform={`translate(${60 * split} ${10 * split}) rotate(${6 * split} 700 1500)`}><path d={STONE_R} fill="#121216" stroke="#d8d8dc" strokeWidth={4} strokeLinejoin="round" /></g>
        {crackP > 0 && split === 0 && <polyline points={CRACK.slice(0, seg + 1).map((p) => p.join(",")).join(" ")} fill="none" stroke={GOLD} strokeWidth={6} strokeLinejoin="round" />}
        {nHit > 0 && <Crack at={[540, 940]} p={clamp(nHit / 6)} size={60} color="#d8d8dc" width={3} seed={7} />}
        <line x1={60} y1={1500} x2={1020} y2={1500} stroke={LINE} strokeWidth={3} />
        {split > 0 && <Sparkle f={f} at={[540, 1150]} s={2} />}
      </Cam>
      <Label y={250} t="ONE DROP DOES NOTHING." color={late ? "#6a6a72" : "#e8e8e8"} />
      <Label y={310} t="EVERY DAY DOES EVERYTHING." opacity={fadeIn(f, Q.CRACK, 8)} />
      <Num x={540} y={430} t={`DROP #${count.toLocaleString("en-US")}`} size={48} />
    </>
  );
};

// ---------------------------------------------------------------- 5 · the bucket
const HEADS: V[] = [[330, 1080], [400, 1060], [470, 1090], [560, 1070], [630, 1085], [700, 1065]];
const Seg5: React.FC<{ f: number }> = ({ f }) => {
  // The climber is INSIDE the bucket, at its right wall: he jumps, catches the rim with both hands, pulls himself up until his
  // head is over the edge; the two nearest people grab his head and wrist and yank him back down (x3). The 4th time he hoists
  // himself onto the rim, jumps down outside and raises his arms. While inside he is drawn behind the bucket's front wall.
  const grabs = [Q.GRAB1, Q.GRAB2, Q.GRAB3];
  const RIM = 1128, SC = 0.48, IN_X = 770;
  const ROOT_LOW = 1520, ROOT_HANG = RIM + 212, ROOT_TOP = RIM + 112; // hidden / hanging from the rim / head and shoulders over the rim
  const HANG: Pose = { hip: [0, -180], lean: 0, head: -14, hN: [30, -138], hF: [4, -138], fN: [10, -4], fF: [-14, 2] };
  // top of the pull-up: hands pressed on the rim below the shoulders (rim is ~70 local units under the shoulder here)
  const PULL: Pose = { hip: [0, -180], lean: 4, head: -6, hN: [56, 64], hF: [24, 66], fN: [16, -30], fF: [-10, -10], elbow: 1 };
  const starts = [Q.S5 + 6, ...grabs.map((g) => g + 16)];
  let rootY = ROOT_LOW, pose: Pose = HANG, grab = 0, x = IN_X;
  for (let k = 0; k < 4; k++) {
    const s = starts[k], end = k < 3 ? grabs[k] : Q.ESCAPE;
    if (f >= s && f < end) {
      const jump = clamp((f - s) / 8), pull = ease.inOut(clamp((f - s - 8) / Math.max(1, end - s - 8)));
      rootY = f < s + 8 ? lerp(ROOT_LOW, ROOT_HANG, ease.out(jump)) : lerp(ROOT_HANG, ROOT_TOP, pull);
      pose = f < s + 8 ? HANG : mixPose(HANG, PULL, pull);
    }
    if (k < 3 && f >= grabs[k] && f < grabs[k] + 16) {
      grab = f < grabs[k] + 4 ? clamp((f - grabs[k]) / 4) : 1;
      rootY = f < grabs[k] + 4 ? ROOT_TOP : lerp(ROOT_TOP, ROOT_LOW, ease.in(clamp((f - grabs[k] - 4) / 10)));
      pose = f < grabs[k] + 4 ? PULL : HANG;
    }
  }
  // escape: hoist onto the rim (10 f), jump down outside (16 f), land and raise the arms
  const e1 = clamp((f - Q.ESCAPE) / 10), e2 = clamp((f - Q.ESCAPE - 10) / 16), out = f >= Q.ESCAPE;
  if (out) {
    if (e2 <= 0) { x = lerp(IN_X, 812, e1); rootY = lerp(ROOT_TOP, RIM, ease.out(e1)); pose = mixPose(PULL, POSES.crouch(), e1); }
    else { x = lerp(812, 940, e2); rootY = lerp(RIM, 1620, e2 * e2) - Math.sin(e2 * Math.PI) * 90; pose = e2 < 1 ? mixPose(POSES.jumpAir(), POSES.tuck(), Math.sin(e2 * Math.PI)) : POSES.stand(); }
    if (f >= Q.ESCAPE + 26) pose = mixPose(POSES.jumpLoad(), POSES.armsUp(), pop(f, Q.ESCAPE + 28));
  }
  // the bucket narrows toward the bottom: keep the climber (feet ~10 px right of the root) inside the slanted wall
  if (!out) x = Math.min(IN_X, 830 - ((rootY - 1130) / 490) * 80 - 46);
  const landed = f >= Q.ESCAPE + 26;
  const j = solvePose(pose), W2 = (p: V): V => [x + p[0] * SC, rootY + p[1] * SC];
  const targets: V[] = [W2(j.head), W2(j.wN)];
  const climber = <Hero x={x} y={rootY} s={SC} pose={pose} shadow={0} />;
  const grabbers = grab > 0 && !out ? [[700, 1095], [630, 1110]].map(([sx, sy], i) => {
    const tg = targets[i], tx = lerp(sx + 20, tg[0], grab), ty = lerp(sy - 60, tg[1], grab);
    return (
      <g key={i}>
        <path d={`M${sx} ${sy} Q${(sx + tx) / 2} ${Math.min(sy, ty) - 50} ${tx} ${ty}`} fill="none" stroke={INK} strokeWidth={17} strokeLinecap="round" />
        <path d={`M${sx} ${sy} Q${(sx + tx) / 2} ${Math.min(sy, ty) - 50} ${tx} ${ty}`} fill="none" stroke="#8a8a90" strokeWidth={11} strokeLinecap="round" />
        <circle cx={tx} cy={ty} r={11} fill={RED} stroke={INK} strokeWidth={2} />
      </g>
    );
  }) : null;
  return (
    <>
      <Cam f={f} keys={[{ f: Q.S5, x: 540, y: 1150, z: 1.0 }, { f: Q.ESCAPE, x: 600, y: 1100, z: 1.08, e: "inOut" }, { f: Q.S6, x: 600, y: 1080, z: 1.12, e: "burst" }]} kicks={grabs.map((g) => ({ f: g + 12, amp: 9 }))}>
        <path d="M250 1130 A290 26 0 0 1 830 1130" fill="none" stroke="#d8d8dc" strokeWidth={5} />
        {HEADS.map(([hx, hy], i) => {
          const wave = Math.sin(f * 0.25 + i) * 12;
          return (
            <g key={i} stroke="#8a8a90" strokeLinecap="round">
              <line x1={hx - 10} y1={hy + 30} x2={hx - 40 + wave} y2={hy - 50 - (i % 3) * 14} strokeWidth={11} />
              <line x1={hx + 10} y1={hy + 30} x2={hx + 34 - wave} y2={hy - 40 - (i % 2) * 20} strokeWidth={11} />
              <line x1={hx} y1={hy + 26} x2={hx} y2={hy + 140} strokeWidth={14} />
              <circle cx={hx} cy={hy} r={26} fill="#8a8a90" stroke={INK} strokeWidth={3} />
            </g>
          );
        })}
        {!out && climber}
        {grabbers}
        <path d="M250 1130 A290 26 0 0 0 830 1130 L750 1620 L330 1620 Z" fill="#0c0c10" />
        <path d="M250 1130 L330 1620 L750 1620 L830 1130" fill="none" stroke="#d8d8dc" strokeWidth={5} strokeLinejoin="round" />
        <path d="M250 1130 A290 26 0 0 0 830 1130" fill="none" stroke="#d8d8dc" strokeWidth={5} />
        <line x1={60} y1={1620} x2={1020} y2={1620} stroke={LINE} strokeWidth={3} />
        {landed && <Glow at={[x, rootY - 90]} r={170} color={GOLD} a={0.45 * pop(f, Q.ESCAPE + 28)} />}
        {out && climber}
      </Cam>
      <Label y={250} t="NOT EVERYONE" />
      <Label y={300} t="WANTS YOU TO CLIMB OUT" />
    </>
  );
};

// ---------------------------------------------------------------- 6 · talent / work race
// ONE race on ONE track, so the overtaking is visible. "TALENT" bolts ahead, looks back, lies down on his back scrolling
// his phone; "WORK" jogs at the same pace the whole time, passes him, breaks the finish tape; TALENT jumps up too late.
const LIE_PHONE = (f: number): Pose => ({ hip: [0, -16], lean: -84, head: -6, hN: [-24, -96 + Math.sin(f * 0.5) * 3], hF: [-36, -92], fN: [74, 0], fF: [58, 0], elbow: 1 });
const Tag: React.FC<{ x: number; y: number; t: string; color: string }> = ({ x, y, t, color }) => (
  <g><text x={x} y={y} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={26} fill={color}>{t}</text><path d={`M${x - 8} ${y + 8} l8 10 l8 -10 z`} fill={color} /></g>
);
const Seg6: React.FC<{ f: number }> = ({ f }) => {
  const t = f - Q.S6, G = 1250, START = 90, FIN = 990, S = 0.55;
  const sit = Q.SIT - Q.S6, late = Q.LATE - Q.S6, fin = Q.FINISH - Q.S6;
  // WORK: steady jog from t=8 that reaches the finish exactly at FINISH
  const vW = (FIN - START) / (fin - 8);
  const wx = START + Math.max(0, Math.min(t, fin) - 8) * vW;
  // TALENT: sprint, slow down, look back, lie down; wake at LATE, sprint again, reach the line after WORK
  const vT = (tt: number) => (tt < 8 ? 0 : tt < sit ? Math.min(19, (tt - 8) * 2.2) : tt < sit + 8 ? 19 * (1 - (tt - sit) / 8) : tt < late + 6 ? 0 : 18);
  let tx = START; for (let k = 0; k < t; k++) tx += vT(k);
  tx = Math.min(tx, FIN + 30);
  const lookBack = t >= sit + 8 && t < sit + 20, lying = t >= sit + 26 && t < late, gettingDown = t >= sit + 20 && t < sit + 26;
  let tPose: Pose;
  if (t < 8) tPose = POSES.crouch();
  else if (t < sit + 8) tPose = run((tx - START) / 410);
  else if (lookBack) tPose = mixPose(POSES.stand(), { ...POSES.stand(), head: -10 }, 0.5);
  else if (gettingDown) tPose = mixPose(POSES.crouch(), LIE_PHONE(f), (t - sit - 20) / 6);
  else if (lying) tPose = LIE_PHONE(f);
  else if (t < late + 6) tPose = mixPose(LIE_PHONE(f), POSES.jumpLoad(), (t - late) / 6);
  else if (tx < FIN + 30) tPose = run((tx - START) / 410);
  else tPose = slump();
  const won = t >= fin;
  const wPose: Pose = t < 8 ? POSES.crouch() : won ? POSES.celebrate(t - fin) : { ...walk((wx - START) / (2 * STRIDE * 1.1), 1.1), lean: 12, head: 4 };
  const tJ = solvePose(tPose), wJ = solvePose(wPose);
  const tHead = jw(tx, G, S, tJ.head, lookBack), wHead = jw(wx, G, S, wJ.head);
  const tape = clamp((t - fin) / 10);
  return (
    <>
      <Cam f={f} keys={[{ f: Q.S6, x: 540, y: 1100, z: 1.0 }, { f: Q.FINISH, x: 600, y: 1100, z: 1.04, e: "inOut" }, { f: Q.S7, x: 620, y: 1080, z: 1.1, e: "burst" }]} kicks={[{ f: Q.FINISH, amp: 12 }]}>
        <line x1={0} y1={G} x2={1080} y2={G} stroke={LINE} strokeWidth={3} />
        {[0, 1, 2, 3, 4, 5, 6].map((k) => <line key={k} x1={START + k * 150} y1={G + 18} x2={START + k * 150 + 60} y2={G + 18} stroke="#2a2a30" strokeWidth={3} />)}
        <line x1={START} y1={G - 10} x2={START} y2={G + 10} stroke="#c8c8d0" strokeWidth={4} />
        <text x={START} y={G + 50} textAnchor="middle" fontFamily={MONO} fontSize={20} fill="#6a6a72">START</text>
        {/* finish: two posts and a tape that snaps when WORK crosses it */}
        <line x1={FIN} y1={G} x2={FIN} y2={G - 220} stroke={GOLD} strokeWidth={4} />
        {tape <= 0 ? <line x1={FIN} y1={G - 110} x2={FIN + 2} y2={G - 112} stroke={GOLD} strokeWidth={10} strokeLinecap="round" />
          : <><path d={`M${FIN} ${G - 110} q${20 + 30 * tape} ${40 * tape} ${30 * tape} ${90 * tape}`} fill="none" stroke={GOLD} strokeWidth={6} /><path d={`M${FIN} ${G - 112} q${-20 - 30 * tape} ${40 * tape} ${-30 * tape} ${90 * tape}`} fill="none" stroke={GOLD} strokeWidth={6} /></>}
        {t >= 14 && t < sit + 6 && <SpeedLinesT f={f} at={[tx - 40, G - 100]} />}
        <Hero x={tx} y={G} s={S} pose={tPose} flip={lookBack} look={GREY} shadow={0}
          hold={lying || gettingDown ? (j) => <Phone x={(j.wN[0] + j.wF[0]) / 2} y={(j.wN[1] + j.wF[1]) / 2 - 6} rot={180} s={1.1} glow="#ffffff" /> : undefined} />
        {won && <><Glow at={[FIN, G - 120]} r={240} color={GOLD} a={0.45} /><Confetti f={f} f0={Q.FINISH} at={[FIN, G - 260]} n={50} seed={6} /></>}
        <Hero x={wx} y={G} s={S} pose={wPose} shadow={0} />
        <Tag x={tHead[0]} y={(lying ? G - 120 : tHead[1] - 50)} t="TALENT" color="#8a8a92" />
        <Tag x={wHead[0]} y={wHead[1] - 50} t="WORK" color={W} />
      </Cam>
      <Label y={330} t="HARD WORK BEATS TALENT" size={40} />
      <Label y={395} t="WHEN TALENT DOESN'T WORK HARD." size={34} color={GOLD} opacity={fadeIn(f, Q.FINISH + 4, 8)} />
    </>
  );
};
const SpeedLinesT: React.FC<{ f: number; at: V }> = ({ f, at }) => (
  <g>{[0, 1, 2, 3].map((k) => { const y = at[1] - 30 + k * 26, l = 60 + ((k * 37 + f * 9) % 50); return <line key={k} x1={at[0] - l - 20} y1={y} x2={at[0] - 20} y2={y} stroke="#9a9aa2" strokeWidth={3} strokeLinecap="round" opacity={0.6} />; })}</g>
);

// ---------------------------------------------------------------- 7 · rest / quit
const Seg7: React.FC<{ f: number }> = ({ f }) => {
  const slope = (g: number, u: number): V => [80 + 860 * u, g - 480 * u];
  const gT = 880, gB = 1820;
  // both climb the same slope and get equally tired; at STOP both bend over panting. Then the top one sits on the rock,
  // rests, gets up and walks on (slowly) to the flag; the bottom one turns round and walks back down with his head low.
  const A = (Math.atan2(480, 860) * 180) / Math.PI, LEN = Math.hypot(860, 480);
  const uUp = (t: number) => 0.45 * clamp((t - Q.S7 - 6) / (Q.STOP - Q.S7 - 6));
  const P1 = Q.STOP + 18, DOWN0 = Q.STOP + 26, DOWN1 = Q.STOP + 86;
  const uTop = f < Q.RESUME ? uUp(f) : lerp(0.45, 1, clamp((f - Q.RESUME) / (Q.TOP - Q.RESUME)));
  const uBot = f < DOWN0 ? uUp(f) : lerp(0.45, 0, clamp((f - DOWN0) / (DOWN1 - DOWN0)));
  const pT = slope(gT, uTop), pB = slope(gB, uBot);
  const topAt = f >= Q.TOP;
  const tiredUp = (u: number) => clamp(u / 0.45) * 0.7;
  const topPose: Pose = topAt ? mixPose(POSES.stand(), POSES.armsUp(), pop(f, Q.TOP))
    : f < Q.STOP ? slopeWalk((uTop * LEN) / (2 * STRIDE * 0.7), A, 0.7, tiredUp(uTop))
    : f < P1 ? pant(f, A)
    : f < Q.RESUME ? mixPose(pant(f, A), POSES.sit(64), clamp((f - P1) / 8))
    : f < Q.RESUME + 8 ? mixPose(POSES.sit(64), slopeWalk(0, A, 0.6, 0.5), (f - Q.RESUME) / 8)
    : slopeWalk((uTop * LEN) / (2 * STRIDE * 0.6), A, 0.6, 0.5);
  const botPose: Pose = f < Q.STOP ? slopeWalk((uBot * LEN) / (2 * STRIDE * 0.7), A, 0.7, tiredUp(uBot))
    : f < P1 ? pant(f, A)
    : f < DOWN0 ? mixPose(pant(f, A), slump(), (f - P1) / 8)
    : f < DOWN1 ? { ...slopeWalk(((0.45 - uBot) * LEN) / (2 * STRIDE * 0.6), -A, 0.6, 0.3), head: 34 }
    : slump();
  const bJ = solvePose(botPose), tJ = solvePose(topPose);
  const Flag = ({ g, lit }: { g: number; lit: boolean }) => { const [x, y] = slope(g, 1); return <g><line x1={x} y1={y} x2={x} y2={y - 120} stroke="#c8c8d0" strokeWidth={4} /><path d={`M${x} ${y - 120} l60 18 l-60 18 z`} fill={lit ? GOLD : "#5a5a62"} />{lit && <Glow at={[x, y - 100]} r={150} color={GOLD} a={0.45} />}</g>; };
  return (
    <>
      <Cam f={f} keys={[{ f: Q.S7, x: 540, y: 960, z: 1.0 }, { f: Q.S8, x: 540, y: 960, z: 1.04, e: "inOut" }]} kicks={[{ f: Q.TOP, amp: 10 }]}>
        {[gT, gB].map((g, i) => { const a = slope(g, 0), b = slope(g, 1); return <g key={i}><line x1={0} y1={g} x2={a[0]} y2={a[1]} stroke={LINE} strokeWidth={3} /><line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#9a9aa2" strokeWidth={4} /><line x1={b[0]} y1={b[1]} x2={1080} y2={b[1]} stroke={LINE} strokeWidth={3} /></g>; })}
        {(() => { const [rx, ry] = slope(gT, 0.45); return <path d={`M${rx - 50} ${ry + 26} q10 -40 50 -44 q40 4 50 30 z`} fill="#1a1a1e" stroke="#9a9aa2" strokeWidth={3} />; })()}
        <Flag g={gT} lit={topAt} /><Flag g={gB} lit={false} />
        <Hero x={pT[0]} y={pT[1]} s={HS} pose={topPose} shadow={0} />
        <Hero x={pB[0]} y={pB[1]} s={HS} pose={botPose} flip={f >= DOWN0} look={f >= DOWN0 ? GREY : LOOK_WHITE} shadow={0} />
        {f >= Q.STOP && f < P1 + 4 && <><Breath f={f} at={jw(pT[0], pT[1], HS, tJ.head)} /><Breath f={f} at={jw(pB[0], pB[1], HS, bJ.head)} /></>}
      </Cam>
      <Label y={170} t="RESTING" />
      <Label y={1110} t="QUITTING" />
      <g opacity={fadeIn(f, Q.LINE, 8)}>
        <rect x={0} y={930} width={1080} height={110} fill="#000" opacity={0.8} />
        <text x={540} y={1002} textAnchor="middle" fontFamily={LBL} fontSize={46} letterSpacing={2} fill={W}>REST IF YOU MUST. <tspan fill={GOLD}>DON'T QUIT.</tspan></text>
      </g>
    </>
  );
};

// ---------------------------------------------------------------- assembly
const SEGS: [number, React.FC<{ f: number }>][] = [[Q.S1, Seg1], [Q.S2, Seg2], [Q.S3, Seg3], [Q.S4, Seg4], [Q.S5, Seg5], [Q.S6, Seg6], [Q.S7, Seg7], [Q.S8, Seg8]];
export const TruthsFilm: React.FC = () => {
  const f = useCurrentFrame();
  let k = 0; for (let i = 0; i < SEGS.length; i++) if (f >= SEGS[i][0]) k = i;
  const S = SEGS[k][1], start = SEGS[k][0], end = k + 1 < SEGS.length ? SEGS[k + 1][0] : Q.LEN;
  const black = Math.max(k > 0 ? 1 - clamp((f - start) / 6) : 0, k + 1 < SEGS.length ? clamp((f - (end - 5)) / 5) : 0);
  const stopBeat = 0; // (the old one-beat blackout belonged to our own score; the Shorts soundtrack has no stop there)
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <KitDefs />
        <S f={f} />
        <text x={540} y={1880} textAnchor="middle" fontFamily={MONO} fontSize={20} letterSpacing={6} fill="#ffffff" opacity={0.18}>CHANNEL NAME</text>
        <rect x={0} y={0} width={1080} height={1920} fill="#000" opacity={Math.max(black, stopBeat)} />
      </svg>
    </AbsoluteFill>
  );
};
