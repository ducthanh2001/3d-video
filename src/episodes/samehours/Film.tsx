// SameHoursFilm: "SAME HOURS" 34.2 s (1027 frames), 1080x1920, 30 fps. Five wordless vignettes, two lanes acting at the SAME time
// (top = the wrong way, bottom = the right way), each action repeated on the beat with a result that grows in front of the viewer,
// one camera reveal at the end, colour only for meaning (gold = what you build, red = what burns out).
// Every number of time lives in events.ts (shared with audio/make_audio_samehours.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { V, clamp, ease, lerp } from "../../kit/core";
import { HIP_H, Hero, POSES, Pose, STRIDE, mixPose, solvePose, walk } from "../../kit/hero";
import { KitDefs, Vignette } from "../../kit/materials";
import { Glow, Rays, Sparkle, Sparks } from "../../kit/fx";
import { Cam } from "../../kit/camera";
import { BOLD, BOLD_GREY, Brick, Cliffs, Defs, Flame, GOLD, Ground, Jar, Key, Label, RED, SANS, Sand, Stone } from "./StyleFrames";
import { BEAT, C, Q } from "./events";

export const SAMEHOURS_FRAMES = Q.LEN;
const HS = 0.7; // figure scale
const G1 = 830, G2 = 1660;
const W = "#f2f2f2", DIM = "#8a8a92";

// ---------------------------------------------------------------- helpers
const fade = (t: number, a: number, d = 8) => clamp((t - a) / d);
const pop = (t: number, a: number) => ease.back(clamp((t - a) / 9));
/** world positions of a figure's joints */
const J = (x: number, y: number, pose: Pose, flip = false, s = HS) => {
  const j = solvePose(pose), k = flip ? -1 : 1;
  const w = (p: V): V => [x + k * p[0] * s, y + p[1] * s];
  return { wN: w(j.wN), wF: w(j.wF), sh: w(j.sh), head: w(j.head), hip: w(j.hip) };
};
/** a pose whose hands reach world targets (IK clamps what is out of reach) */
const reach = (base: Pose, x: number, y: number, tN: V, tF?: V, flip = false, s = HS): Pose => {
  const sh = solvePose(base).sh, k = flip ? -1 : 1;
  const loc = (t: V): V => [((t[0] - x) * k) / s - sh[0], (t[1] - y) / s - sh[1]];
  return { ...base, hN: loc(tN), hF: loc(tF ?? [tN[0] - 10 * k, tN[1] + 6]) };
};
const mid = (a: V, b: V): V => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const arc = (a: V, b: V, h: number, u: number): V => [lerp(a[0], b[0], u), lerp(a[1], b[1], u) - 4 * h * u * (1 - u)];
const STAND: Pose = POSES.stand();
const idle = (t: number, head = 0): Pose => ({ ...POSES.idle(t), head: POSES.idle(t).head + head });
/** two-stage punchline at the bottom of the frame */
const Punch: React.FC<{ t: number; a: number; b: number; l1: string; l2: string }> = ({ t, a, b, l1, l2 }) => (
  <g>
    <g opacity={fade(t, a, 6)} transform={`translate(540 1790) scale(${0.85 + 0.15 * pop(t, a)})`}><text textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={46} fill={W}>{l1}</text></g>
    <g opacity={fade(t, b, 6)} transform={`translate(540 1852) scale(${0.85 + 0.15 * pop(t, b)})`}><text textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={50} fill={GOLD}>{l2}</text></g>
  </g>
);
/** a little dust puff on impact */
const Puff: React.FC<{ t: number; at: number; x: number; y: number; w?: number }> = ({ t, at, x, y, w = 60 }) => {
  const u = (t - at) / 12;
  if (u < 0 || u > 1) return null;
  return <g opacity={(1 - u) * 0.55}>{[-1, 1].map((d) => <ellipse key={d} cx={x + d * (w * 0.5 + u * w * 0.6)} cy={y - 6 - u * 10} rx={10 + u * 16} ry={6 + u * 8} fill="#bdbdc4" />)}</g>;
};
const Flag: React.FC<{ x: number; y: number; lit: number; t: number; pole?: number }> = ({ x, y, lit, t, pole = 230 }) => {
  const wv = Math.sin(t * 0.25) * 6;
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={y - pole} stroke="#d6d6dc" strokeWidth={6} />
      <path d={`M${x} ${y - pole + 2} Q${x + 40} ${y - pole + 8 + wv} ${x + 86} ${y - pole + 22} Q${x + 40} ${y - pole + 34 - wv} ${x} ${y - pole + 46} Z`} fill="#6e6e76" />
      <path d={`M${x} ${y - pole + 2} Q${x + 40} ${y - pole + 8 + wv} ${x + 86} ${y - pole + 22} Q${x + 40} ${y - pole + 34 - wv} ${x} ${y - pole + 46} Z`} fill={GOLD} opacity={lit} />
      {lit > 0 && <Glow at={[x + 40, y - pole + 24]} r={200} color={GOLD} a={0.5 * lit} />}
    </g>
  );
};
const Counter: React.FC<{ x: number; y: number; n: number; color?: string; size?: number; anchor?: "middle" | "end" }> = ({ x, y, n, color = DIM, size = 36, anchor = "end" }) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={SANS} fontWeight={700} fontSize={size} fill={color}>DAY {n}</text>
);

// ================================================================ 1 · Scrolling / Building (the same 21 bricks)
const BW = 96, BH = 46, WX = 470, SX = 230;
const landAt = (k: number) => C.LAND0 + k * C.HALF;
const LAST = landAt(20);
const wallXY = (k: number): V => { const r = Math.floor(k / 3), c = k % 3; return [WX + c * BW + (r % 2 ? 24 : 0), G1 - (r + 1) * BH]; };
const STAIR: [number, number][] = []; for (let c = 0; c < 6; c++) for (let r = 0; r <= c; r++) STAIR.push([c, r]);
const stairXY = (k: number): V => [SX + STAIR[k][0] * BW, G2 - (STAIR[k][1] + 1) * BH];
const colDone = (c: number) => landAt(((c + 1) * (c + 2)) / 2 - 1); // when column c gets its last brick
const FallBrick: React.FC<{ t: number; k: number; at: V; gold?: boolean }> = ({ t, k, at, gold }) => {
  const L = landAt(k);
  if (t < L - 9) return null;
  const p = clamp((t - (L - 9)) / 9), dy = -360 * (1 - p * p);
  const sq = t >= L ? 1 - 0.14 * Math.max(0, 1 - (t - L) / 5) : 1;
  return (
    <g opacity={clamp((t - (L - 9)) / 3)}>
      <g transform={`translate(${at[0] + BW / 2} ${at[1] + BH + dy}) scale(${2 - sq} ${sq}) translate(${-BW / 2} ${-BH})`}><Brick x={0} y={0} w={BW} h={BH} gold={gold} /></g>
    </g>
  );
};
const Seg1: React.FC<{ t: number }> = ({ t }) => {
  // --- top: he scrolls while the hours stack up into a wall; at the end he looks up at it
  const look = ease.inOut(clamp((t - (LAST + 4)) / 14));
  const sitPhone: Pose = { hip: [0, -26], lean: lerp(16, 4, look), head: lerp(36, -14, look), hN: [62, 30 + Math.sin(t * 0.66) * 3 + look * 30], hF: [56, 36 + look * 30], fN: [118, 0], fF: [104, 0], elbow: 1 };
  const tj = J(250, G1, sitPhone);
  const phone = tj.wN;
  // --- bottom: he climbs each column the moment it is complete
  let c = -1; for (let i = 0; i < 6; i++) if (t >= colDone(i) + 2) c = i;
  const colX = (i: number) => (i < 0 ? SX - 80 : SX + i * BW + BW / 2), colY = (i: number) => (i < 0 ? G2 : G2 - (i + 1) * BH);
  const hopT = c >= 0 ? t - (colDone(c) + 2) : 99;
  let bx = colX(c), by = colY(c), bPose: Pose = idle(t, -10);
  if (hopT < 10) {
    const u = hopT / 10;
    bx = lerp(colX(c - 1), colX(c), ease.inOut(u)); by = lerp(colY(c - 1), colY(c), u) - Math.sin(u * Math.PI) * 70;
    bPose = mixPose(POSES.jumpAir(), POSES.tuck(), Math.sin(u * Math.PI) * 0.6);
  } else if (c < 5 && t > colDone(c + 1) - 5) bPose = mixPose(idle(t, -10), POSES.jumpLoad(), clamp((t - (colDone(c + 1) - 5)) / 5));
  const won = clamp((t - C.FLAG1) / 6);
  if (c === 5 && hopT >= 10) bPose = mixPose(idle(t), POSES.armsUp(), won);
  const day = 1 + Math.round(364 * clamp((t - C.LAND0) / (LAST - C.LAND0)));
  return (
    <>
      <Label y={150} t="4 hours a day" size={38} color={DIM} weight={500} />
      <Label y={230} t="Scrolling" />
      <Ground y={G1} />
      {/* the goal: a plateau with a flag, behind the wall */}
      <rect x={826} y={G1 - 6 * BH} width={214} height={6 * BH} fill="url(#sh-slab)" />
      <line x1={826} y1={G1 - 6 * BH} x2={1040} y2={G1 - 6 * BH} stroke="#9a9aa2" strokeWidth={5} />
      <Flag x={930} y={G1 - 6 * BH} lit={0} t={t} pole={200} />
      {Array.from({ length: 21 }, (_, k) => <FallBrick key={k} t={t} k={k} at={wallXY(k)} />)}
      {Array.from({ length: 21 }, (_, k) => <Puff key={k} t={t} at={landAt(k)} x={wallXY(k)[0] + BW / 2} y={wallXY(k)[1] + BH} />)}
      <Glow at={[phone[0], phone[1] - 10]} r={120} color="#7fb6ff" a={(0.38 + 0.06 * Math.sin(t * 1.3)) * (1 - look * 0.8)} />
      <Hero x={250} y={G1} s={HS} look={BOLD} pose={sitPhone} />
      <g transform={`translate(${phone[0] + 4} ${phone[1] - 16}) rotate(${-28 + look * 20})`}>
        <rect x={-15} y={-28} width={30} height={54} rx={7} fill="#1b1d24" stroke="#000" strokeWidth={3} />
        <rect x={-11} y={-23} width={22} height={42} rx={4} fill="#9cc8ff" opacity={1 - look * 0.6} />
      </g>

      <Counter x={540} y={962} n={day} color={t >= LAST ? W : "#cfcfd6"} size={52} anchor="middle" />

      <Label y={1010} t="Building" />
      <Ground y={G2} />
      <rect x={SX + 6 * BW} y={G2 - 6 * BH} width={1040 - SX - 6 * BW} height={6 * BH} fill="url(#sh-slab)" />
      <line x1={SX + 6 * BW} y1={G2 - 6 * BH} x2={1040} y2={G2 - 6 * BH} stroke="#9a9aa2" strokeWidth={5} />
      <Flag x={900} y={G2 - 6 * BH} lit={won} t={t} pole={200} />
      {won > 0 && <Rays f={t} at={[900, G2 - 6 * BH - 160]} a={0.5 * won} color={GOLD} n={14} len={700} />}
      {Array.from({ length: 21 }, (_, k) => <FallBrick key={k} t={t} k={k} at={stairXY(k)} gold />)}
      {Array.from({ length: 21 }, (_, k) => <Puff key={k} t={t} at={landAt(k)} x={stairXY(k)[0] + BW / 2} y={stairXY(k)[1] + BH} />)}
      <Glow at={[bx, by - 140]} r={160 + 120 * won} color={GOLD} a={0.12 + 0.3 * won} />
      <Hero x={bx} y={by} s={HS} look={BOLD} pose={bPose} />

      <Punch t={t} a={C.LINE1A} b={C.LINE1B} l1="Same bricks." l2="Different direction." />
    </>
  );
};

// ================================================================ 2 · Looking for shortcuts / Making the key
const DX = 700, DWD = 180, DHT = 340, KEYHOLE = (g: number): V => [DX + 30, g - DHT * 0.5];
const Door: React.FC<{ g: number; open: number; t: number }> = ({ g, open, t }) => {
  const x = DX, w = DWD, h = DHT, y = g, o = ease.out(open);
  const leafL = lerp(x, x + w + 64, o);
  return (
    <g>
      <rect x={x - 14} y={y - h - 14} width={w + 28} height={h + 14} fill="#1a1a1f" stroke="#55555e" strokeWidth={4} />
      <rect x={x} y={y - h} width={w} height={h} fill="#050506" />
      {o > 0 && <>
        <rect x={x} y={y - h} width={w} height={h} fill={GOLD} opacity={o} />
        <rect x={x} y={y - h} width={w} height={h} fill="#fff6d8" opacity={0.6 * o} />
        <path d={`M${x} ${y} L${x + w} ${y} L${x + w + 320} ${y + 92} L${x - 220} ${y + 92} Z`} fill={GOLD} opacity={0.2 * o} />
        <Rays f={t} at={[x + w / 2, y - h / 2]} a={0.55 * o} color={GOLD} n={16} len={900} />
      </>}
      {/* the leaf turns on the RIGHT hinge, toward us */}
      <path d={`M${leafL} ${y - h - 24 * o} L${x + w} ${y - h} L${x + w} ${y} L${leafL} ${y + 24 * o} Z`} fill="url(#sh-slab)" stroke="#000" strokeWidth={3} />
      {o < 0.3 && <g opacity={1 - o / 0.3}>
        <rect x={x + 18 + o * 120} y={y - h + 20} width={(w - 36) * (1 - o)} height={h * 0.38} fill="none" stroke="#4a4a54" strokeWidth={3} />
        <rect x={x + 18 + o * 120} y={y - h * 0.5 + 24} width={(w - 36) * (1 - o)} height={h * 0.4} fill="none" stroke="#4a4a54" strokeWidth={3} />
        <circle cx={x + 30} cy={y - h * 0.5} r={9} fill="#b0b0b8" />
        <path d={`M${x + 30} ${y - h * 0.5 + 14} l-5 16 h10 Z`} fill="#000" />
      </g>}
      <rect x={x + w / 2 - 92} y={y - h - 84} width={184} height={50} rx={6} fill="#26262c" stroke="#55555e" strokeWidth={3} />
      <text x={x + w / 2} y={y - h - 48} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={28} letterSpacing={3} fill={o > 0 ? GOLD : "#cfcfd6"}>SUCCESS</text>
    </g>
  );
};
const TRIES = [{ T: C.SNAP1, tag: "HACK", fx: 470 }, { T: C.SNAP2, tag: "LUCK", fx: 380 }, { T: C.SNAP3, tag: "TRICK", fx: 290 }];
const Seg2: React.FC<{ t: number }> = ({ t }) => {
  // ---------------- top: three shortcut keys, three snaps
  const TX = 610;
  const rest = (): Pose => ({ hip: [0, -HIP_H], lean: 4, head: 6, hN: [34, 92], hF: [44, 80], fN: [26, 0], fF: [-26, 0], elbow: 1 });
  const atLock = (push: number) => reach({ hip: [0, -HIP_H], lean: 10, head: 6, hN: [0, 0], hF: [0, 0], fN: [36, 0], fF: [-30, 0], elbow: 1 }, TX, G1, [KEYHOLE(G1)[0] - 62 + push, KEYHOLE(G1)[1] + 2], [TX + 40, G1 - 150]);
  let pose = rest(), keyState: "full" | "stub" | "none" = "full", shake = 0;
  for (const { T } of TRIES) {
    if (t >= T - 18 && t < T - 6) pose = mixPose(rest(), atLock(0), ease.inOut((t - (T - 18)) / 12));
    else if (t >= T - 6 && t < T) pose = atLock(ease.out((t - (T - 6)) / 6) * 6);
    else if (t >= T && t < T + 12) { pose = mixPose(atLock(6), rest(), ease.out((t - T) / 12)); keyState = "stub"; shake = Math.sin((t - T) * 2.2) * (1 - (t - T) / 12) * 8; }
  }
  // after the third snap: the stub is thrown away, nothing left: hands to the head
  const giveUp = clamp((t - (C.SNAP3 + 24)) / 12);
  if (t >= C.SNAP3 + 12) keyState = "none";
  if (giveUp > 0) pose = mixPose(rest(), { hip: [0, -HIP_H + 14], lean: 16, head: 30, hN: [6, -50], hF: [16, -58], elbow: -1, fN: [30, 0], fF: [-30, 0] }, ease.inOut(giveUp));
  pose = { ...pose, head: pose.head + shake * 0.6 };
  const tj = J(TX, G1, pose);
  const ringAt: V = giveUp > 0 ? arc(tj.wF, [TX + 60, G1 - 10], 30, clamp(giveUp * 2)) : tj.wF;
  // ---------------- bottom: filing his own key, then walking in
  const BX0 = 400;
  const filing = t < C.FILE1;
  const stroke = Math.sin((t * 2 * Math.PI) / BEAT);
  const fileP = (): Pose => reach({ hip: [0, -170], lean: 34, head: 22, hN: [0, 0], hF: [0, 0], fN: [30, 0], fF: [-44, 0], elbow: 1 }, BX0, G2, [312 + stroke * 30, G2 - 122], [292, G2 - 116], true);
  const shine = clamp((t - C.FILE0) / (C.FILE1 - C.FILE0));
  const WALK0 = C.FILE1 + 12, WALK1 = C.UNLOCK - 8, BXD = 610;
  let bx = BX0, bflip = true, bPose: Pose = fileP(), keyB: V = [292, G2 - 116], keyRot = 0, keyLift = false;
  if (!filing) {
    keyLift = true;
    const up = reach({ ...STAND, head: -14, lean: -2 }, BX0, G2, [BX0 - 50, G2 - 300], undefined, true);
    if (t < WALK0) { bPose = mixPose(fileP(), up, ease.inOut((t - C.FILE1) / 8)); }
    else if (t < WALK1) {
      const u = (t - WALK0) / (WALK1 - WALK0), x = lerp(BX0, BXD, ease.inOut(u));
      bx = x; bflip = false; bPose = { ...walk((x - BX0) / (2 * STRIDE * HS)), hN: [70, -36], elbow: 1 };
    } else { bx = BXD; bflip = false; bPose = mixPose({ ...walk(0), hN: [70, -36], elbow: 1 }, atLock(6), ease.out((t - WALK1) / 8)); }
    const bj = J(bx, G2, bPose, bflip);
    keyB = t < WALK1 ? bj.wN : [KEYHOLE(G2)[0] - 62 + 6 * ease.out((t - WALK1) / 8), KEYHOLE(G2)[1] + 2];
    keyRot = t >= C.UNLOCK ? -90 * ease.inOut((t - C.UNLOCK) / 6) : 0;
  }
  const open = clamp((t - C.OPEN) / 14);
  return (
    <>
      <Label y={230} t="Looking for shortcuts" />
      <Ground y={G1} />
      <Door g={G1} open={0} t={t} />
      <Hero x={TX} y={G1} s={HS} look={BOLD} pose={pose} />
      {/* the key in his hand / the ring of shortcuts */}
      {keyState !== "none" && <Key x={tj.wN[0]} y={tj.wN[1]} s={0.85} broken={keyState === "stub"} />}
      <g transform={`translate(${ringAt[0]} ${ringAt[1] + 16})`}>
        <circle r={18} fill="none" stroke="#a8a8b0" strokeWidth={6} />
        {TRIES.filter(({ T }) => t < T - 18).map((_, i) => <Key key={i} x={-6 + i * 8} y={20} rot={95 - i * 18} s={0.6} />)}
      </g>
      {/* snapped stubs: thrown back over the shoulder, each one tagged where it lands */}
      {TRIES.map(({ T, tag, fx }) => {
        const u = clamp((t - (T + 12)) / 14);
        if (t < T + 12) return null;
        const at = arc([TX + 60, G1 - 190], [fx, G1 - 10], 90, ease.linear(u));
        return (
          <g key={tag}>
            <Key x={at[0]} y={at[1]} rot={u * 400} s={0.75} broken />
            <g opacity={fade(t, T + 26, 6)}><Label x={fx + 14} y={G1 + 62} t={tag} size={28} color={DIM} weight={700} /></g>
          </g>
        );
      })}
      {TRIES.map(({ T }) => t >= T && t < T + 8 ? <g key={T}><Sparks f={t} f0={T} at={KEYHOLE(G1)} n={8} seed={T} /></g> : null)}

      <Label y={1010} t="Making the key" />
      <Ground y={G2} />
      <Glow at={[DX + DWD / 2, G2 - 170]} r={380} color={GOLD} a={0.4 * ease.out(open)} />
      <Door g={G2} open={open} t={t} />
      {/* workbench with the file and the gold shavings */}
      <rect x={130} y={G2 - 110} width={200} height={20} rx={4} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} />
      <path d={`M145 ${G2 - 90} L140 ${G2} M315 ${G2 - 90} L320 ${G2}`} stroke="#6a6a72" strokeWidth={10} strokeLinecap="round" />
      {Array.from({ length: Math.floor(shine * 14) }, (_, i) => <circle key={i} cx={150 + ((i * 37) % 170)} cy={G2 - 4 - (i % 3) * 3} r={3} fill={GOLD} opacity={0.85} />)}
      <Hero x={bx} y={G2} s={HS} look={BOLD} pose={bPose} flip={bflip} />
      {filing && <path d={`M${J(BX0, G2, bPose, true).wN[0] - 50} ${G2 - 130} l100 0`} stroke="#c9c9d0" strokeWidth={8} strokeLinecap="round" />}
      <g transform={`translate(${keyB[0]} ${keyB[1]})`}>
        <g transform={`scale(1 ${keyRot ? Math.max(0.15, Math.cos((keyRot * Math.PI) / 180)) : 1})`}>
          <Key x={0} y={0} s={0.95} rot={keyLift && t < WALK1 ? -40 : 0} />
          <g opacity={shine}><Key x={0} y={0} s={0.95} gold rot={keyLift && t < WALK1 ? -40 : 0} /></g>
        </g>
      </g>
      {filing && Array.from({ length: 6 }, (_, k) => { const f0 = Math.round(C.FILE0 + (k + 0.25) * BEAT); return t >= f0 && t < f0 + 22 ? <Sparks key={k} f={t} f0={f0} at={[300, G2 - 122]} n={10} seed={k + 3} /> : null; })}
      {keyLift && t < WALK1 && <Sparkle f={t} at={[keyB[0] + 30, keyB[1] - 30]} s={1.4} color={GOLD} />}
    </>
  );
};

// ================================================================ 3 · Small things first / Big things first (the jar)
const JX = 700, JW = 300, JH = 330, JL = JX - JW / 2;
const PILE: V[] = [[430, -38], [520, -38], [472, -104]]; // world x, y offset from the ground: 0 HEALTH, 1 FAMILY, 2 GOALS (on top)
const NAMES = ["HEALTH", "FAMILY", "GOALS"], SEEDS = [2, 7, 4];
const RR = 40;
const FX = 320; // figure x in both lanes
/** pick a rock from the pile and toss it so it lands at `land` on `target` */
const tossRock = (t: number, g: number, land: number, from: V, target: V) => {
  const crouchB: Pose = { hip: [-10, -118], lean: 40, head: 18, hN: [0, 0], hF: [0, 0], fN: [40, 0], fF: [-30, 0], elbow: 1 };
  const upB: Pose = { ...STAND, lean: -6, head: -8 };
  const pick = reach(crouchB, FX, g, [from[0] - 20, from[1]], [from[0] + 10, from[1] + 4]);
  const up = reach(upB, FX, g, [FX + 70, g - 300], [FX + 90, g - 296]);
  const fol: Pose = reach({ ...STAND, lean: 10 }, FX, g, [FX + 150, g - 230], [FX + 140, g - 224]);
  const a = land - 34, b = land - 24, c = land - 12;
  let pose: Pose | null = null, rock: V | null = null, flying = false;
  if (t >= a - 8 && t < a) pose = mixPose(STAND, pick, ease.inOut((t - (a - 8)) / 8));
  if (t >= a && t < b) { pose = mixPose(pick, up, ease.inOut((t - a) / 10)); }
  if (t >= b && t < c) pose = mixPose(up, { ...up, lean: -14 }, (t - b) / 12);
  if (t >= c && t < land + 10) pose = mixPose(fol, STAND, clamp((t - land) / 10));
  if (t >= a && t < c) { const jj = J(FX, g, pose!); rock = [mid(jj.wN, jj.wF)[0] + 6, mid(jj.wN, jj.wF)[1] - RR * 0.6]; }
  if (t >= c) { const jj = J(FX, g, up); const r0: V = [mid(jj.wN, jj.wF)[0] + 6, mid(jj.wN, jj.wF)[1] - RR * 0.6]; rock = arc(r0, target, 70, clamp((t - c) / 12)); flying = t < land; }
  return { pose, rock, flying, started: t >= a, done: t >= land };
};
const pourPose = (g: number): Pose => reach({ ...STAND, lean: 6, head: 10 }, FX, g, [FX + 130, g - 200], [FX + 116, g - 186]);
const Pour: React.FC<{ g: number; t: number; t0: number; t1: number; level: number }> = ({ g, t, t0, t1, level }) => {
  if (t < t0 || t > t1 + 6) return null;
  const jj = J(FX, g, pourPose(g)), m = mid(jj.wN, jj.wF);
  const mouth: V = [m[0] + 46, m[1] - 34], a = fade(t, t0, 4) * (1 - clamp((t - t1) / 6));
  return (
    <g>
      <path d={`M${mouth[0]} ${mouth[1]} Q${JX - 60} ${g - JH - 120} ${JX} ${g - JH + 10} L${JX} ${g - level}`} fill="none" stroke="#8a8a90" strokeWidth={10} strokeDasharray="10 7" strokeDashoffset={-t * 7} opacity={a} />
      <ellipse cx={JX} cy={g - level} rx={26 * a} ry={6 * a} fill="#a3a3aa" opacity={0.7} />
    </g>
  );
};
const Sack: React.FC<{ at: V; rot: number }> = ({ at, rot }) => (
  <g transform={`translate(${at[0]} ${at[1]}) rotate(${rot})`}>
    <path d="M-34 -30 Q-44 34 0 40 Q44 34 34 -30 Q20 -40 0 -36 Q-20 -40 -34 -30 Z" fill="#6e6a62" stroke="#000" strokeWidth={3} />
    <path d="M-26 -34 Q0 -50 26 -34" fill="none" stroke="#4a463e" strokeWidth={6} />
    <text x={0} y={10} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={13} fill="#d8d4c8">SMALL</text>
  </g>
);
const LayerTags: React.FC<{ g: number; level: number; tags: [string, number][] }> = ({ g, level, tags }) => (
  <g>{tags.map(([s, h]) => <g key={s} opacity={clamp((level - h - 16) / 20)}><Label x={JX} y={g - h} t={s} size={28} color="#e2e2e8" weight={500} /></g>)}</g>
);
const Seg3: React.FC<{ t: number }> = ({ t }) => {
  // ---------------- top: sand first, then the big rocks don't fit
  const lvlT = (JH - 40) * 0.9 * ease.inOut(clamp((t - C.SAND_T0) / (C.SAND_T1 - C.SAND_T0)));
  const sandTop = G1 - lvlT;
  const r1 = tossRock(t, G1, C.ROCK_T1, [PILE[2][0], G1 + PILE[2][1]], [JX, sandTop - RR * 0.55]);
  const r2 = tossRock(t, G1, C.ROCK_T2, [PILE[1][0], G1 + PILE[1][1]], [JX + 10, sandTop - RR * 1.6]);
  let topPose: Pose = t < C.SAND_T1 + 4 ? (t < C.SAND_T0 ? STAND : pourPose(G1)) : STAND;
  if (t >= C.SAND_T1 && t < C.SAND_T1 + 8) topPose = mixPose(pourPose(G1), STAND, (t - C.SAND_T1) / 8);
  if (r1.pose) topPose = r1.pose;
  if (r2.pose) topPose = r2.pose;
  const shrug = clamp((t - (C.ROCK_T2 + 12)) / 10);
  if (shrug > 0) topPose = mixPose(STAND, { hip: [0, -HIP_H], lean: 0, head: 16, hN: [74, 44], hF: [-52, 46], elbow: -1, fN: [24, 0], fF: [-24, 0] }, ease.back(shrug));
  // FAMILY hits GOALS and bounces off the jar onto the floor
  const bounce = clamp((t - C.ROCK_T2) / 20);
  const famAt: V = !r2.started ? [PILE[1][0], G1 + PILE[1][1]] : !r2.done ? r2.rock! : arc([JX + 10, sandTop - RR * 1.6], [JX + 260, G1 - RR * 0.9], 80, ease.linear(bounce));
  const goalsAt: V = !r1.started ? [PILE[2][0], G1 + PILE[2][1]] : r1.rock!;
  const goalsWob = r1.done ? Math.sin((t - C.ROCK_T1) * 0.9) * 10 * Math.max(0, 1 - (t - C.ROCK_T1) / 26) : 0;
  const sackTop: V = t < C.SAND_T1 ? (() => { const jj = J(FX, G1, pourPose(G1)), m = mid(jj.wN, jj.wF); return [m[0] + 14, m[1] - 10] as V; })() : arc([FX + 120, G1 - 200], [FX - 70, G1 - 40], 40, clamp((t - C.SAND_T1) / 10));
  // ---------------- bottom: big rocks first, then the sand fills the gaps, then the lid
  const targets: V[] = [[JX + 52, G2 - 50], [JX - 56, G2 - 50], [JX, G2 - 128]]; // HEALTH, FAMILY, GOALS resting places
  const order = [2, 0, 1]; // GOALS (top of the pile) first, then HEALTH, then FAMILY
  const lands = [C.ROCK_B1, C.ROCK_B2, C.ROCK_B3];
  const bt = order.map((ri, n) => tossRock(t, G2, lands[n], [PILE[ri][0], G2 + PILE[ri][1]], targets[n === 0 ? 1 : n === 1 ? 0 : 2]));
  const finalAt = [targets[1], targets[0], targets[2]]; // landing spot of the n-th tossed rock
  let botPose: Pose = STAND;
  bt.forEach((r) => { if (r.pose) botPose = r.pose; });
  const lvlB = (JH - 30) * ease.inOut(clamp((t - C.SAND_B0) / (C.SAND_B1 - C.SAND_B0)));
  if (t >= C.SAND_B0 - 6 && t < C.SAND_B1 + 6) botPose = mixPose(STAND, pourPose(G2), clamp((t - (C.SAND_B0 - 6)) / 6) * (1 - clamp((t - C.SAND_B1) / 6)));
  const lid = clamp((t - (C.LID - 10)) / 10), win = clamp((t - (C.LID + 4)) / 8);
  if (win > 0) botPose = mixPose(STAND, POSES.armsUp(), ease.back(win));
  const sackBot: V = t < C.SAND_B0 - 6 ? [FX - 70, G2 - 40] : t < C.SAND_B1 + 2 ? (() => { const jj = J(FX, G2, botPose), m = mid(jj.wN, jj.wF); return [m[0] + 14, m[1] - 10] as V; })() : arc([FX + 120, G2 - 200], [FX - 70, G2 - 40], 40, clamp((t - C.SAND_B1 - 2) / 10));
  const rockB = (ri: number): V => { const n = order.indexOf(ri); const r = bt[n]; return !r.started ? [PILE[ri][0], G2 + PILE[ri][1]] : r.done ? finalAt[n] : r.rock!; };
  const inJar = (ri: number) => bt[order.indexOf(ri)].done;
  return (
    <>
      <Label y={230} t="Small things first" />
      <Ground y={G1} />
      <rect x={880} y={G1 - 22} width={240} height={22} rx={6} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} transform={`rotate(-6 980 ${G1})`} />
      <Jar x={JX} y={G1} w={JW} h={JH}>
        <Sand x={JL} y={sandTop} w={JW} h={lvlT + 4} />
      </Jar>
      <LayerTags g={G1} level={lvlT} tags={[["news", 60], ["games", 140], ["phone", 220]]} />
      <Pour g={G1} t={t} t0={C.SAND_T0} t1={C.SAND_T1} level={lvlT} />
      <Stone x={PILE[0][0]} y={G1 + PILE[0][1]} r={RR} t={NAMES[0]} seed={SEEDS[0]} />
      <Stone x={famAt[0]} y={famAt[1]} r={RR} t={NAMES[1]} seed={SEEDS[1]} rot={r2.started ? (t - C.ROCK_T2) * 6 : 0} />
      <Stone x={goalsAt[0]} y={goalsAt[1]} r={RR} t={NAMES[2]} seed={SEEDS[2]} rot={goalsWob} />
      <Puff t={t} at={C.ROCK_T1} x={JX} y={sandTop} w={40} />
      <Puff t={t} at={C.ROCK_T2 + 20} x={JX + 260} y={G1} w={50} />
      <Sack at={sackTop} rot={t < C.SAND_T1 ? -70 : -70 + clamp((t - C.SAND_T1) / 10) * 70} />
      <Hero x={FX} y={G1} s={HS} look={BOLD} pose={topPose} />
      {shrug > 0 && <g opacity={shrug}><Label x={FX + 10} y={G1 - 330} t="?" size={70} color="#a8a8b0" weight={700} /></g>}

      <Label y={1010} t="Big things first" />
      <Ground y={G2} />
      <Glow at={[JX, G2 - 170]} r={300} color={GOLD} a={0.32 * win} />
      <Jar x={JX} y={G2} w={JW} h={JH}>
        <Sand x={JL} y={G2 - lvlB} w={JW} h={lvlB + 4} seed={5} />
        {[0, 1, 2].filter(inJar).map((ri) => { const p = rockB(ri); return <Stone key={ri} x={p[0]} y={p[1]} r={RR} t={NAMES[ri]} seed={SEEDS[ri]} />; })}
      </Jar>
      <LayerTags g={G2} level={lvlB} tags={[["phone", 196], ["games", 236], ["news", 276]]} />
      {[0, 1, 2].filter((ri) => !inJar(ri)).map((ri) => { const p = rockB(ri); return <Stone key={ri} x={p[0]} y={p[1]} r={RR} t={NAMES[ri]} seed={SEEDS[ri]} />; })}
      {lands.map((L) => <Puff key={L} t={t} at={L} x={JX} y={G2 - 20} w={50} />)}
      <Pour g={G2} t={t} t0={C.SAND_B0} t1={C.SAND_B1} level={lvlB} />
      <Sack at={sackBot} rot={t >= C.SAND_B0 - 6 && t < C.SAND_B1 + 2 ? -70 : 0} />
      {lid > 0 && <rect x={JL + 18} y={G2 - JH - 34 - 220 * (1 - ease.bounce(lid))} width={JW - 36} height={36} rx={6} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} />}
      <Hero x={FX} y={G2} s={HS} look={BOLD} pose={botPose} />
    </>
  );
};

// ================================================================ 4 · Burning 200% / Burning every day (the candle)
const Smoke2: React.FC<{ x: number; y: number; t: number; t0: number; color: string }> = ({ x, y, t, t0, color }) => {
  const u = (t - t0) / 60;
  if (u < 0 || u > 1.3) return null;
  const rise = u * 160, sw = Math.sin(t * 0.18) * 14;
  return <path d={`M${x} ${y} c${-18 + sw} -30 ${18 + sw} -50 0 -80 c${-18 - sw} -30 ${18 - sw} -50 0 -80`} transform={`translate(0 ${-rise * 0.5})`} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" opacity={0.75 * (1 - clamp((u - 0.4) / 0.9))} />;
};
const Seg4: React.FC<{ t: number }> = ({ t }) => {
  // ---------------- top: a candle lit at BOTH ends: blinding, fast, then nothing (DAY 30)
  const CX = 690, CY = G1 - 58, burn = clamp(t / C.OUT), len = 250 * (1 - Math.pow(burn, 1.1));
  const alive = 1 - clamp((t - C.OUT) / 6), flick = 1.45 + 0.18 * Math.sin(t * 1.1) + 0.1 * Math.sin(t * 2.7);
  const dead = clamp((t - C.OUT - 4) / 14);
  const jit = Math.sin(t * 2.1) * 7 * (1 - dead);
  const work: Pose = { hip: [0, -26], lean: 22, head: 18, hN: [82 + jit, 36], hF: [74 - jit, 42], fN: [118, 0], fF: [104, 0], elbow: 1 };
  const topPose = mixPose(work, POSES.hugKnees(), ease.inOut(dead));
  const dayT = 1 + Math.round(29 * burn);
  // ---------------- bottom: one end, a small steady flame, every day (DAY 365)
  const BX = 680, Hc = 250 - 80 * (t / 190), flameB = 1 + 0.06 * Math.sin(t * 0.7);
  const dayB = 1 + Math.round(364 * clamp(t / C.DAY365));
  const read: Pose = { hip: [0, -26], lean: 6, head: 26, hN: [70, 26], hF: [62, 34], fN: [120, 0], fF: [108, 0], elbow: 1 };
  const bj = J(330, G2, read), book = mid(bj.wN, bj.wF);
  const flipPh = ((t % (2 * BEAT)) / 8); // a page turns every two beats
  const tj = J(330, G1, work);
  const lap = mid(tj.wN, tj.wF);
  return (
    <>
      <Label y={230} t="Burning 200%" />
      <Ground y={G1} />
      <Glow at={[CX, CY - 60]} r={460} color={GOLD} a={0.7 * alive * (0.85 + 0.15 * Math.sin(t * 1.3))} />
      <rect x={560} y={G1 - 40} width={260} height={40} rx={6} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} />
      {len > 2 && <rect x={CX - len / 2} y={CY - 18} width={len} height={36} rx={8} fill="url(#sh-wax)" stroke="#000" strokeWidth={3} />}
      {alive > 0 && <>
        <Flame x={CX - len / 2} y={CY - 6} f={t} s={flick * alive} />
        <Flame x={CX + len / 2} y={CY - 6} f={t + 7} s={flick * alive} />
      </>}
      {Array.from({ length: Math.floor(burn * 6) }, (_, i) => <ellipse key={i} cx={572 + i * 44} cy={G1 - 40} rx={14} ry={5} fill="#e9e4d8" opacity={0.8} />)}
      {[0, 22, 44].map((d) => <g key={d}><Smoke2 x={CX - 10} y={CY - 10} t={t} t0={C.OUT + d} color={RED} /><Smoke2 x={CX + 10} y={CY - 10} t={t} t0={C.OUT + 10 + d} color={RED} /></g>)}
      {/* he works flat out in the bright light, then sits in the dark */}
      <g opacity={1 - dead}>
        <path d={`M${lap[0] - 40} ${lap[1] + 8} L${lap[0] + 40} ${lap[1] + 8} L${lap[0] + 30} ${lap[1] - 4} L${lap[0] - 30} ${lap[1] - 4} Z`} fill="#3a3c44" stroke="#000" strokeWidth={3} />
        <path d={`M${lap[0] + 24} ${lap[1] - 4} L${lap[0] + 46} ${lap[1] - 66} L${lap[0] - 8} ${lap[1] - 66} L${lap[0] - 24} ${lap[1] - 4} Z`} fill="#1b1d24" stroke="#000" strokeWidth={3} />
        <path d={`M${lap[0] + 18} ${lap[1] - 10} L${lap[0] + 36} ${lap[1] - 58} L${lap[0] - 2} ${lap[1] - 58} L${lap[0] - 16} ${lap[1] - 10} Z`} fill="#bcd8ff" />
      </g>
      <Hero x={330} y={G1} s={HS} look={dead > 0.5 ? BOLD_GREY : BOLD} pose={topPose} shadow={0} />
      <Counter x={1000} y={G1 + 70} n={dayT} color={t >= C.OUT ? RED : DIM} />

      <Label y={1010} t="Burning every day" />
      <Ground y={G2} />
      <Glow at={[BX, G2 - Hc - 60]} r={420} color={GOLD} a={0.42} />
      <ellipse cx={BX} cy={G2 - 6} rx={110} ry={16} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} />
      <rect x={BX - 38} y={G2 - Hc} width={76} height={Hc - 10} rx={8} fill="url(#sh-wax)" stroke="#000" strokeWidth={3} />
      <path d={`M${BX - 38} ${G2 - Hc + 20} q10 30 0 60`} fill="none" stroke="#fffaf0" strokeWidth={8} strokeLinecap="round" />
      <line x1={BX} y1={G2 - Hc} x2={BX} y2={G2 - Hc - 16} stroke="#222" strokeWidth={5} />
      <Flame x={BX} y={G2 - Hc - 10} f={t} s={flameB} />
      <Hero x={330} y={G2} s={HS} look={BOLD} pose={read} />
      <g transform={`translate(${book[0] + 4} ${book[1] - 16}) rotate(-28)`}>
        <path d="M0 0 L-46 -12 L-46 40 L0 52 Z" fill="#f2f2f2" stroke="#000" strokeWidth={3} />
        <path d="M0 0 L46 -12 L46 40 L0 52 Z" fill="#dcdcdc" stroke="#000" strokeWidth={3} />
        {flipPh < 1 && <path d={`M0 0 L${46 - 92 * ease.inOut(flipPh)} ${-12 - 10 * Math.sin(flipPh * Math.PI)} L${46 - 92 * ease.inOut(flipPh)} ${40 - 10 * Math.sin(flipPh * Math.PI)} L0 52 Z`} fill="#ffffff" stroke="#000" strokeWidth={2} />}
      </g>
      <Counter x={1000} y={G2 + 70} n={dayB} color={t >= C.DAY365 ? GOLD : DIM} />
    </>
  );
};

// ================================================================ 5 · Waiting for a bridge / Building one (camera reveal)
const GL = 330, GR = 760, PW = 56, PSTEP = 62;
const plankAt = (i: number) => C.PLANK0 + i * C.PLANKD;
const Seg5: React.FC<{ t: number }> = ({ t }) => {
  // ---------------- top: he waits, checks the time, and finally sits down
  const watchPose: Pose = { hip: [0, -HIP_H], lean: 2, head: 30, hN: [56, 12], hF: [44, 20], fN: [18, 0], fF: [-18, 0], elbow: 1 };
  const ph = t % (2 * BEAT), chk = ph < 16 ? Math.sin((ph / 16) * Math.PI) : 0;
  const tap = Math.max(0, Math.sin((t * 2 * Math.PI) / BEAT)) * 8;
  const sitDown = clamp((t - 140) / 14);
  let wPose: Pose = mixPose({ ...idle(t), fN: [16, -tap] }, watchPose, chk);
  if (sitDown > 0) wPose = mixPose(wPose, { ...POSES.sit(0), hip: [0, -24], lean: 14, head: 24, hN: [60, 60], hF: [50, 66] }, ease.inOut(sitDown));
  // ---------------- bottom: plank by plank across the gap, then the flag
  let placed = 0; for (let i = 0; i < 7; i++) if (t >= plankAt(i)) placed = i + 1;
  const xs = (i: number) => GL + i * PSTEP - 34;
  let bx = xs(0), bPose: Pose = idle(t), carry: V | null = null;
  const WALK0 = plankAt(6) + 4, WALK1 = C.FLAG5 - 6, BEND = 860;
  if (t < WALK0) {
    const i = Math.min(6, placed); // next plank to place (or 7 when all are down)
    bx = xs(placed);
    const T = plankAt(i), pl: V = [GL + i * PSTEP + PW / 2, G2 - 6];
    const kneel = reach({ hip: [-6, -110], lean: 36, head: 30, hN: [0, 0], hF: [0, 0], fN: [40, 0], fF: [-50, 0], elbow: 1 }, xs(i), G2, [pl[0] - 20, pl[1]], [pl[0] + 14, pl[1]]);
    if (placed < 7 && t >= T - 10) { bx = xs(i); const u = ease.inOut((t - (T - 10)) / 10); bPose = mixPose(idle(t), kneel, u); const jj = J(bx, G2, bPose); const from: V = [jj.sh[0] - 14, jj.sh[1] - 26]; carry = [lerp(from[0], mid(jj.wN, jj.wF)[0], u), lerp(from[1], mid(jj.wN, jj.wF)[1], u)]; }
    else if (placed > 0 && t < plankAt(placed - 1) + 10) {
      const u = (t - plankAt(placed - 1)) / 10; bx = lerp(xs(placed - 1), xs(placed), ease.inOut(u));
      bPose = mixPose(reach({ hip: [-6, -110], lean: 36, head: 30, hN: [0, 0], hF: [0, 0], fN: [40, 0], fF: [-50, 0], elbow: 1 }, bx, G2, [bx + 50, G2 - 6]), walk(u * 0.5), ease.inOut(u));
    }
  } else if (t < WALK1) {
    const u = (t - WALK0) / (WALK1 - WALK0); bx = lerp(xs(7), BEND, ease.inOut(u)); bPose = walk((bx - xs(7)) / (2 * STRIDE * HS));
  } else { bx = BEND; bPose = mixPose(STAND, POSES.armsUp(), ease.back(clamp((t - C.FLAG5) / 8))); }
  const left = 7 - placed - (carry ? 1 : 0);
  const won = clamp((t - C.FLAG5) / 8);
  const camKeys = [{ f: 0, x: 470, y: 600, z: 1.5 }, { f: C.REVEAL0, x: 470, y: 590, z: 1.56 }, { f: C.REVEAL1, x: 540, y: 960, z: 1.0, e: "burst" as const }];
  return (
    <>
      <Cam f={t} keys={camKeys} kicks={[{ f: C.FLAG5, amp: 8 }]} blur={0.12} maxBlur={6}>
        <Label y={230} t="Waiting for a bridge" />
        <Cliffs y={G1} gapL={GL} gapR={GR} />
        <Flag x={930} y={G1} lit={0} t={t} pole={220} />
        <Hero x={230} y={G1} s={HS} look={sitDown > 0.5 ? BOLD_GREY : BOLD} pose={wPose} />
        {chk > 0.3 && sitDown === 0 && (() => { const jj = J(230, G1, wPose); return <circle cx={jj.wN[0] - 4} cy={jj.wN[1]} r={9} fill="#1b1d24" stroke="#cfcfd6" strokeWidth={4} />; })()}
        <g opacity={fade(t, 16, 10)}><Label x={250} y={G1 - 330} t="Someday..." size={34} color={DIM} weight={500} /></g>

        <g opacity={fade(t, C.REVEAL0 + 6, 12)}><Label y={1010} t="Building one" /></g>
        <Cliffs y={G2} gapL={GL} gapR={GR} />
        <path d={`M${GL - 10} ${G2 - 70} Q${(GL + GR) / 2} ${G2 - 20} ${GR + 10} ${G2 - 70}`} fill="none" stroke="#8a8a92" strokeWidth={4} />
        <line x1={GL - 10} y1={G2} x2={GL - 10} y2={G2 - 80} stroke="#6a6a72" strokeWidth={10} strokeLinecap="round" />
        <line x1={GR + 10} y1={G2} x2={GR + 10} y2={G2 - 80} stroke="#6a6a72" strokeWidth={10} strokeLinecap="round" />
        {Array.from({ length: placed }, (_, i) => <rect key={i} x={GL + i * PSTEP} y={G2 - 4 + (t - plankAt(i) < 4 ? -6 * (1 - (t - plankAt(i)) / 4) : 0)} width={PW} height={20} rx={4} fill="url(#sh-gold)" stroke="#000" strokeWidth={3} />)}
        {Array.from({ length: 7 }, (_, i) => <Puff key={i} t={t} at={plankAt(i)} x={GL + i * PSTEP + PW / 2} y={G2} w={30} />)}
        <Glow at={[GL + (placed * PSTEP) / 2, G2]} r={120 + placed * 20} color={GOLD} a={0.28} />
        <Flag x={930} y={G2} lit={won} t={t} pole={220} />
        {won > 0 && <Rays f={t} at={[960, G2 - 200]} a={0.5 * won} color={GOLD} n={14} len={800} />}
        <Hero x={bx} y={G2} s={HS} look={BOLD} pose={bPose} behind={(j) => left > 0 ? (
          <g transform={`rotate(-28 ${j.sh[0]} ${j.sh[1]})`}>{Array.from({ length: left }, (_, k) => <rect key={k} x={j.sh[0] - 96} y={j.sh[1] - 34 - k * 15} width={130} height={15} rx={3} fill="url(#sh-gold)" stroke="#000" strokeWidth={3} />)}</g>
        ) : null} />
        {carry && <rect x={carry[0] - PW / 2} y={carry[1] - 10} width={PW} height={20} rx={4} fill="url(#sh-gold)" stroke="#000" strokeWidth={3} />}
      </Cam>
      <Punch t={t} a={C.LINE5A} b={C.LINE5B} l1="Nobody is coming" l2="to build it." />
    </>
  );
};

// ================================================================ assembly
const SEGS: [number, React.FC<{ t: number }>][] = [[Q.S1, Seg1], [Q.S2, Seg2], [Q.S3, Seg3], [Q.S4, Seg4], [Q.S5, Seg5]];
export const SameHoursFilm: React.FC<{ at?: number }> = ({ at }) => {
  const cur = useCurrentFrame();
  const f = at ?? cur;
  let k = 0; for (let i = 0; i < SEGS.length; i++) if (f >= SEGS[i][0]) k = i;
  const [start, Seg] = SEGS[k], end = k + 1 < SEGS.length ? SEGS[k + 1][0] : Q.LEN, t = f - start;
  const black = Math.max(k > 0 ? 1 - clamp(t / 6) : 0, k + 1 < SEGS.length ? clamp((f - (end - 6)) / 6) : 0);
  const push = 1 + 0.035 * (t / (end - start)); // a slow push-in on every vignette (the last one has its own camera)
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <KitDefs />
        <Defs />
        <g transform={k < 4 ? `translate(540 960) scale(${push}) translate(-540 -960)` : undefined}><Seg t={t} /></g>
        <text x={540} y={1900} textAnchor="middle" fontFamily={SANS} fontSize={18} letterSpacing={5} fill="#ffffff" opacity={0.16}>CHANNEL NAME</text>
        <Vignette a={0.3} />
        <rect x={0} y={0} width={1080} height={1920} fill="#000" opacity={black} />
      </svg>
    </AbsoluteFill>
  );
};
