// SmartFilm: "Work smart, not just hard." 34.2 s (1026 frames), 1080x1920, 30 fps. Five labelled pairs doing the SAME task at the
// same time (top = the hard way, bottom = the smart way), the smart one looks lazy or slow first and wins by a trick everyone
// knows from real life: the lever, the up escalator, the paint roller, the plan, the domino chain. The end: the smart one hands the
// lever to the hard one and together they move a rock three times bigger. Every time number lives in events.ts.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { V, clamp, ease, lerp } from "../../kit/core";
import { Face, HIP_H, Hero, POSES, Pose, STRIDE, mixPose, run, solvePose, walk } from "../../kit/hero";
import { KitDefs, Vignette } from "../../kit/materials";
import { Glow, Rays } from "../../kit/fx";
import { EMOTE } from "../../kit/acting";
import { BOLD, Defs, GOLD, Ground, Label, RED, SANS } from "../samehours/StyleFrames";
import {
  Boulder, Brush, Can, Count, D2, DIM, DOM_W, Dab, Domino, ESC, Escalator, EXIT, FloorSign, MAZE, MZ, Maze, PAINT, PAINT_D, Pebble, PlainWall,
  Plank, Puff, Roller, SmartDefs, START, Sweat, Tray, W, WALL, addV, cellXY, escTan, escY, lenV, lerpV2, mulV, normV, railY, rotV, subV,
} from "./Props";
import { BEAT, C, Q } from "./events";

export const SMART_FRAMES = Q.LEN;
const S = 0.7, G1 = 830, G2 = 1660, H = HIP_H;
const STAND = POSES.stand();
const fade = (t: number, a: number, d = 8) => clamp((t - a) / d);
const pop = (t: number, a: number) => ease.back(clamp((t - a) / 9));
const mix = (a: Pose, b: Pose, u: number) => mixPose(a, b, ease.inOut(clamp(u)));
const pulse = (t: number, per: number, ph = 0) => Math.pow(Math.max(0, Math.sin(((t + ph) / per) * 2 * Math.PI)), 2);
/** world joints of a figure */
const J = (x: number, y: number, pose: Pose, flip = false, s = S) => {
  const j = solvePose(pose), k = flip ? -1 : 1;
  const w = (p: V): V => [x + k * p[0] * s, y + p[1] * s];
  return { wN: w(j.wN), wF: w(j.wF), sh: w(j.sh), head: w(j.head), hip: w(j.hip), aN: w(j.aN), aF: w(j.aF) };
};
/** a pose whose hands reach world targets; hF given in LOCAL shoulder units when tF is not a world point */
const reach = (base: Pose, x: number, y: number, tN: V, tF?: V | null, flip = false, s = S, hFloc?: V): Pose => {
  const sh = solvePose(base).sh, k = flip ? -1 : 1;
  const loc = (t: V): V => [((t[0] - x) * k) / s - sh[0], (t[1] - y) / s - sh[1]];
  return { ...base, hN: loc(tN), hF: hFloc ?? loc(tF ?? [tN[0] - 10 * k, tN[1] + 6]) };
};
const Punch: React.FC<{ t: number; a: number; b: number; l1: string; l2: string }> = ({ t, a, b, l1, l2 }) => (
  <g>
    <g opacity={fade(t, a, 6)} transform={`translate(540 1790) scale(${0.85 + 0.15 * pop(t, a)})`}><text textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={48} fill={W}>{l1}</text></g>
    <g opacity={fade(t, b, 6)} transform={`translate(540 1856) scale(${0.85 + 0.15 * pop(t, b)})`}><text textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={54} fill={GOLD}>{l2}</text></g>
  </g>
);
/** "?" over a confused head */
const Huh: React.FC<{ at: V; a: number; s?: number }> = ({ at, a, s = 1 }) => a <= 0 ? null : (
  <text x={at[0]} y={at[1] - 30 * s} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={44 * s} fill={W} opacity={a} transform={`rotate(10 ${at[0]} ${at[1]})`}>?</text>
);
const BodyLook = BOLD;
/** faces off: the body tells it (the user's call, 2026-11-11) */
const FACES = false;

// ================================================================ 1 · Working Hard / Working Smart: the boulder
const R1 = 125, B1: V = [690, G1 - R1];
const R2 = 125, B2X = 800;
const T0: V = [745, G2 - 10], FUL: V = [650, G2 - 52], PL = 480;
const PU = normV(subV(FUL, T0)), E0: V = addV(T0, mulV(PU, PL));
const PUSH = POSES.push();
const PRESS: Pose = { hip: [-6, -H + 46], lean: 30, head: 18, hN: [0, 0], hF: [0, 0], fN: [36, 0], fF: [-32, 0] };
/** a pusher straining against a surface at x = sx (hands at two heights), with effort pulses and a slipping back foot */
const pushPose = (t: number, rx: number, g: number, hands: [V, V], live: boolean) => {
  const e = live ? pulse(t, BEAT) : 0;
  const k = Math.floor(t / (2 * BEAT)), st = t - k * 2 * BEAT - 12;
  const slip = live && k % 2 === 1 && st > 0 && st < 14 ? (st < 3 ? st / 3 : 1 - (st - 3) / 11) : 0;
  const base: Pose = { ...PUSH, hip: [-30 + 12 * e, -H + 40 + 6 * e], lean: 40 + 7 * e, head: 4 + 10 * e, fN: [34, 0], fF: [-122 - 34 * slip, 0] };
  return { pose: reach(base, rx, g, hands[0], hands[1]), e, slipAt: k * 2 * BEAT + 12 };
};
const Seg1: React.FC<{ t: number }> = ({ t }) => {
  // ---------------- top: pushes with everything; the rock never moves
  const hx = 455, live = t < C.REACT;
  const sx = (dy: number) => B1[0] - Math.sqrt(R1 * R1 - dy * dy) + 4;
  const pp = pushPose(t, hx, G1, [[sx(50), B1[1] - 50], [sx(14), B1[1] - 14]], live);
  let hp = pp.pose, hxx = hx;
  const lookDown: Pose = { ...STAND, lean: 4, head: 30, hN: [26, 118], hF: [-12, 124] };
  if (!live) {
    const u = (t - C.REACT) / 9;
    hxx = hx - 34 * ease.inOut(clamp(u));
    hp = t < C.HANDS ? mix(pushPose(C.REACT, hx, G1, [[sx(50), B1[1] - 50], [sx(14), B1[1] - 14]], true).pose, lookDown, u) : mix(lookDown, { ...EMOTE.handsOnHead(), head: 10 }, (t - C.HANDS) / 6);
  }
  const tj = J(hxx, G1, hp);
  const wob = live ? pp.e : 0;
  // ---------------- bottom: carries a plank, sets it on a stone, presses with ONE hand
  const a = t < C.PRESS0 ? 0 : -0.38 * ease.inOut((t - C.PRESS0) / (C.PRESS1 - C.PRESS0));
  const tip = addV(FUL, rotV(subV(T0, FUL), a)), end = addV(FUL, rotV(subV(E0, FUL), a));
  let bx = 220, bp: Pose = STAND, pa: V, pb: V, face: Face = "calm";
  const carryPose = (x: number, ph: number, w: number) => {
    const base = mixPose(walk(ph), STAND, w);
    const sh = J(x, G2, base).sh, c: V = [sh[0] + 4, sh[1] + 2], u: V = [Math.cos(4 * D2), Math.sin(4 * D2)];
    const A = addV(c, mulV(u, 260)), B = subV(c, mulV(u, 220));
    return { pose: reach(base, x, G2, addV(c, [46, 14]), addV(c, [-26, 12])), A, B };
  };
  if (t < C.LOWER0) {
    const u = t / C.LOWER0, x = lerp(120, 220, u);
    const cp = carryPose(x, (x - 120) / (2 * STRIDE * S) * 0.9, clamp((t - (C.LOWER0 - 6)) / 6));
    bx = x; bp = cp.pose; pa = cp.A; pb = cp.B;
  } else if (t < C.LOWER1) {
    const c0 = carryPose(220, 0, 1), u = ease.inOut((t - C.LOWER0) / (C.LOWER1 - C.LOWER0));
    pa = lerpV2(c0.A, T0, u); pb = lerpV2(c0.B, E0, u);
    const dir = normV(subV(pa, pb));
    const body = mix(STAND, { ...STAND, lean: 18, head: 22, hip: [-6, -H + 14] }, Math.sin(u * Math.PI));
    bp = reach(body, bx, G2, addV(pb, mulV(dir, 120)), addV(pb, mulV(dir, 40))); face = "focus";
  } else {
    pa = tip; pb = end;
    const onEnd: V = addV(end, [6, -12]);
    const hip: V = [-36, 104];
    if (t < C.PRESS0) {
      bp = reach({ ...POSES.idle(t), head: 6 }, bx, G2, onEnd, null, false, S, hip);
    } else if (t < C.ROLL + 4) {
      const u = (t - C.PRESS0) / (C.PRESS1 - C.PRESS0);
      const ant = t < C.PRESS0 + 4 ? Math.sin(((t - C.PRESS0) / 4) * Math.PI) : 0; // a little rise before the press
      bp = reach({ ...mix(STAND, PRESS, u), hip: [mix(STAND, PRESS, u).hip[0], mix(STAND, PRESS, u).hip[1] - ant * 8] }, bx, G2, onEnd, null, false, S, [-50, 96]);
      face = "focus";
    } else if (t < 112) {
      bp = mix(reach(PRESS, bx, G2, onEnd, null, false, S, [-50, 96]), { ...STAND, head: -6 }, (t - C.ROLL - 4) / 10); face = "smile";
    } else {
      const c = Math.sin(t * 0.9) * 8;
      bp = mix({ ...STAND, head: -6 }, { ...STAND, head: 4, hN: [48 + c, 50], hF: [42 - c, 56] }, (t - 112) / 6); face = "happy";
    }
  }
  // the boulder: lifted by the tip, then rolls away
  let bcx = B2X, bcy = G2 - R2, brot = 0;
  const lift = Math.min(0, tip[1] - T0[1]);
  if (t < C.ROLL) { bcy += lift; brot = -lift * 0.35; }
  else {
    const lift0 = Math.min(0, addV(FUL, rotV(subV(T0, FUL), -0.38))[1] - T0[1]);
    const d = 560 * ease.out(clamp((t - C.ROLL) / 46));
    const drop = clamp((t - C.ROLL) / 5), bounce = t - C.ROLL > 5 && t - C.ROLL < 15 ? Math.sin(((t - C.ROLL - 5) / 10) * Math.PI) * 9 : 0;
    bcx += d; bcy += lift0 * (1 - drop * drop) - bounce; brot = -lift0 * 0.35 + (d / R2) / D2;
  }
  const moved = bcx - B2X;
  return (
    <>
      <Label y={128} t="Who moves it first?" size={46} color={W} weight={700} />
      {/* top */}
      <Label y={230} t="Working Hard" />
      <Ground y={G1} />
      <Boulder c={[B1[0] + wob * 1.5, B1[1]]} r={R1} rot={wob * 1.4} seed={4} />
      <Puff t={t} at={pp.slipAt} x={hx - 70} y={G1} w={40} />
      <Hero x={hxx} y={G1} s={S} look={BodyLook} pose={hp} face={FACES ? live ? "strain" : "shock" : undefined} />
      <Sweat t={t} at={tj.head} dir={-1} a={live ? 1 : 0} />
      <Count x={B1[0]} y={G1 + 66} k="Moved:" v="0 cm" c={RED} />
      {/* bottom */}
      <Label y={1010} t="Working Smart" />
      <Ground y={G2} />
      <Pebble x={FUL[0]} g={G2} w={74} h={44} />
      <Boulder c={[bcx, bcy]} r={R2} rot={brot} seed={4} />
      <Puff t={t} at={C.ROLL + 5} x={B2X + 40} y={G2} w={90} />
      <Plank a={pb!} b={pa!} />
      <Hero x={bx} y={G2} s={S} look={BodyLook} pose={bp} face={FACES ? face : undefined} />
      <Count x={B2X} y={G2 + 66} k="Moved:" v={moved < 1 ? "0 cm" : `${(moved / 100).toFixed(1)} m`} c={moved < 1 ? W : GOLD} />
      <Punch t={t} a={C.LINE1A} b={C.LINE1B} l1="Hard work pushes." l2="Smart work lifts." />
    </>
  );
};

// ================================================================ 2 · Busy / Productive: the escalators
const EV = 5.6;
const onSlope = (p: Pose, k: number): Pose => ({ ...p, hip: [p.hip[0], p.hip[1] - p.hip[0] * escTan * k], fN: [p.fN[0], p.fN[1] - p.fN[0] * escTan * k], fF: [p.fF[0], p.fF[1] - p.fF[0] * escTan * k] });
const slopeK = (x: number) => (x > ESC.X0 && x < ESC.X1 ? 1 : 0);
const Seg2: React.FC<{ t: number }> = ({ t }) => {
  // ---------------- top: runs up the DOWN escalator; stays where he is
  const ph = Math.min(t, C.STOP) * 0.075;
  const steps = Math.floor(ph * 2);
  const xs = 500 + 10 * Math.sin(C.STOP * 0.12);
  let hx = t < C.STOP ? 500 + 10 * Math.sin(t * 0.12) : Math.max(ESC.X0 - 50, xs - EV * (t - C.STOP));
  if (hx <= ESC.X0 && t > C.STOP) hx = Math.max(ESC.X0 - 60, hx);
  const runP: Pose = { ...run(ph), lean: 26, head: -6 };
  const tired = mix(runP, EMOTE.handsOnKnees(), (t - C.STOP) / 8);
  const hp = onSlope(t < C.STOP ? runP : tired, slopeK(hx));
  const hy = escY(G1, hx);
  const tj = J(hx, hy, hp);
  // ---------------- bottom: stands on the UP escalator, hand on the rail
  let bx = 250 + EV * t, bp: Pose, face: Face = "calm";
  const top = ESC.X1 - 8;
  if (bx < top) {
    bp = reach(onSlope({ ...POSES.idle(t), head: -4 }, 1), bx, escY(G2, bx), [bx + 44, railY(G2, bx + 44) + 4], null, false, S, [-6, 128]);
  } else {
    const ta = (top - 250) / EV, u = clamp((t - ta) / 20);
    bx = lerp(top, 905, ease.inOut(u));
    bp = u < 1 ? walk(((bx - top) / (2 * STRIDE * S)) * 0.9) : { ...STAND, head: t > C.LIT2 ? -22 : -4 };
    face = t > C.LIT2 ? "happy" : "smile";
  }
  const by = escY(G2, bx);
  const lit = clamp((t - C.LIT2) / 6);
  return (
    <>
      <Label y={230} t="Busy" />
      <Count x={540} y={298} k="Steps:" v={`${steps}`} c={W} size={38} />
      <FloorSign x={90} y={G1 - 290} t="1F" />
      <FloorSign x={985} y={G1 - ESC.H - 190} t="2F" />
      <Escalator g={G1} t={t} dir={-1} v={EV} color={RED} />
      <Hero x={hx} y={hy} s={S} look={BodyLook} pose={hp} face={FACES ? t < C.STOP ? "strain" : "sad" : undefined} />
      <Sweat t={t} at={tj.head} dir={-1} />

      <Label y={1010} t="Productive" />
      <Count x={540} y={1078} k="Steps:" v="0" c={GOLD} size={38} />
      <FloorSign x={90} y={G2 - 290} t="1F" />
      <FloorSign x={985} y={G2 - ESC.H - 190} t="2F" lit={lit} />
      {lit > 0 && <Glow at={[985, G2 - ESC.H - 190]} r={170} color={GOLD} a={0.45 * lit} />}
      <Escalator g={G2} t={t} dir={1} v={EV} color={GOLD} floorLit={lit} />
      <Hero x={bx} y={by} s={S} look={BodyLook} pose={bp} face={FACES ? face : undefined} />
      <Punch t={t} a={C.LINE2A} b={C.LINE2B} l1="Busy is not" l2="the same as progress." />
    </>
  );
};

// ================================================================ 3 · Small Brush / Right Tool: painting the same wall
const DAB_W = 46, DAB_H = 34;
const DABS = Array.from({ length: 24 }, (_, k) => { const col = Math.floor(k / 4), row = k % 4; return { at: C.DAB0 + k * C.DAB, c: [WALL.X0 + 36 + col * 30 + (row % 2) * 12, G1 - 150 - row * 40] as V }; });
const WALL_AREA = (WALL.X1 - WALL.X0) * WALL.H;
const STRIPW = (WALL.X1 - WALL.X0) / 7;
const rollY = (u: number, g: number) => (u < 0.55 ? lerp(g - 30, g - WALL.H + 16, ease.inOut(u / 0.55)) : lerp(g - WALL.H + 16, g - 90, ease.inOut((u - 0.55) / 0.45)));
const Seg3: React.FC<{ t: number }> = ({ t }) => {
  // ---------------- top: dabs fast with a small brush, one patch at a time
  const tc = Math.min(t, C.DAB_STOP);
  const k = clamp(Math.floor((tc - C.DAB0) / C.DAB), 0, DABS.length - 1), p = (tc - DABS[k].at) / C.DAB;
  const dab = DABS[k].c, prev = DABS[Math.max(0, k - 1)].c;
  const scrub: V = [Math.sin(p * Math.PI * 4) * 12, Math.cos(p * Math.PI * 4) * 6];
  const tipT = addV(lerpV2(prev, dab, ease.inOut(clamp(p * 3))), scrub);
  let hx = lerp(prev[0], dab[0], ease.inOut(clamp(p * 3))) - 138;
  let hp = reach({ ...STAND, lean: 10 + Math.sin(t * 0.8) * 3, head: 4, fN: [24, 0], fF: [-24, 0] }, hx, G1, addV(tipT, [-46, 2]), null, false, S, [-34, 108]);
  let brushTip = tipT;
  const done1 = DABS.filter((d) => d.at + 2 <= tc).length;
  if (t > C.DAB_STOP) {
    const u = (t - C.DAB_STOP) / 10;
    hx = lerp(hx, hx - 50, ease.inOut(clamp(u)));
    hp = mix(hp, EMOTE.rubNeck(), u);
    const j = J(hx, G1, hp);
    brushTip = lerpV2(tipT, addV(j.wF, [44, -4]), ease.inOut(clamp(u)));
  }
  const pct1 = Math.round(((done1 * Math.PI * DAB_W * DAB_H) / 4 / WALL_AREA) * 100);
  // ---------------- bottom: pours, loads the roller, then rolls the wall in seven strips
  const TRAY_X = 390;
  let bx = 260, bp: Pose = STAND, R: V | null = null, wet = 0, canB: V = [TRAY_X - 70, G2], tilt = 0, stream: [V, V] | null = null;
  const crouch: Pose = { hip: [-10, -122], lean: 34, head: 24, hN: [0, 0], hF: [0, 0], fN: [42, 0], fF: [-40, 0] };
  const poleHands = (base: Pose, x: number, r: V) => {
    const sh = J(x, G2, base).sh, h1: V = [sh[0] + 66, sh[1] + 18], d = normV(subV(h1, r)), h2 = addV(h1, mulV(d, 60));
    return { pose: reach(base, x, G2, h1, h2), foot: addV(h2, mulV(d, 34)) };
  };
  let foot: V = [0, 0];
  const fill = clamp((t - C.POUR0 - 10) / 16);
  if (t < C.POUR1) {
    const u = ease.inOut(clamp((t - C.POUR0) / 14));
    tilt = 108 * u; canB = [TRAY_X - 56, G2 - 40 * u];
    const cen = addV([canB[0] + 22, canB[1]], rotV([-22, -26], tilt * D2));
    bp = reach(crouch, bx, G2, addV(cen, [6, -6]), addV(cen, [-14, 8]));
    if (tilt > 70) { const lip = addV([canB[0] + 22, canB[1]], rotV([0, -52], tilt * D2)); stream = [lip, [lip[0] + 2, G2 - 12]]; }
  } else if (t < C.UP) {
    const u = (t - C.POUR1) / (C.UP - C.POUR1);
    canB = [TRAY_X - 90, G2]; tilt = 0;
    bp = mix(crouch, STAND, u);
  } else if (t < C.ROLL0) {
    const dip = clamp((t - C.DIP0) / (C.DIP1 - C.DIP0));
    canB = [TRAY_X - 90, G2];
    R = [TRAY_X + 10 + Math.sin(dip * Math.PI * 4) * 22, G2 - 26 + (t < C.DIP0 ? -60 * (1 - (t - C.UP) / (C.DIP0 - C.UP)) : 0)];
    wet = dip > 0.3 ? 1 : 0;
    const ph = poleHands({ ...STAND, lean: 18, head: 22 }, bx, R); bp = ph.pose; foot = ph.foot;
  } else {
    canB = [TRAY_X - 90, G2]; wet = 1;
    const kk = clamp(Math.floor((t - C.ROLL0) / C.STRIP), 0, 6), u = (t - C.ROLL0 - kk * C.STRIP) / C.STRIP;
    const sx = (i: number) => WALL.X0 + STRIPW * (i + 0.5);
    if (t < C.ROLL0 + 7 * C.STRIP) {
      R = [sx(kk), rollY(u, G2)];
      bx = kk === 0 ? lerp(260, sx(0) - 178, ease.inOut(clamp(u * 3))) : lerp(sx(kk - 1) - 178, sx(kk) - 178, ease.inOut(clamp(u * 3)));
      const ph = poleHands({ ...STAND, lean: 6, head: (R[1] - (G2 - 200)) * 0.12, fN: [26, 0], fF: [-24, 0] }, bx, R); bp = ph.pose; foot = ph.foot;
    } else {
      const v = clamp((t - C.ROLL0 - 7 * C.STRIP) / 10);
      bx = sx(6) - 178;
      R = [sx(6) + 30 * v, lerp(G2 - 90, G2 - 40, v)];
      const ph = poleHands({ ...STAND, head: lerp(10, -16, v) }, bx, R); bp = ph.pose; foot = ph.foot;
    }
  }
  const strips = Array.from({ length: 7 }, (_, i) => {
    const t0 = C.ROLL0 + i * C.STRIP; if (t < t0) return 0;
    const u = clamp((t - t0) / C.STRIP); return u >= 0.55 ? 1 : (G2 - rollY(u, G2)) / (WALL.H - 16);
  });
  const pct2 = Math.round((strips.reduce((s, v) => s + Math.min(1, v), 0) / 7) * 100);
  return (
    <>
      <Label y={230} t="Small Brush" />
      <Count x={540} y={298} k="Painted:" v={`${pct1}%`} c={W} size={38} />
      <Ground y={G1} />
      <PlainWall g={G1} />
      {DABS.filter((d) => d.at + 2 <= tc).map((d, i) => <Dab key={i} c={d.c} w={DAB_W} h={DAB_H} seed={i + 3} />)}
      <Hero x={hx} y={G1} s={S} look={BodyLook} pose={hp} />
      <Brush tip={brushTip} ang={0} />
      <Sweat t={t} at={J(hx, G1, hp).head} dir={-1} a={t < C.DAB_STOP ? 1 : 0} />

      <Label y={1010} t="Right Tool" />
      <Count x={540} y={1078} k="Painted:" v={`${pct2}%`} c={pct2 > 0 ? GOLD : W} size={38} />
      <Ground y={G2} />
      <PlainWall g={G2} />
      {strips.map((v, i) => v > 0 && <rect key={i} x={WALL.X0 + STRIPW * i - (i ? 1 : 0)} y={G2 - WALL.H * Math.min(1, v + 0.02)} width={STRIPW + 2} height={WALL.H * Math.min(1, v + 0.02)} fill={PAINT} />)}
      {strips.map((v, i) => v > 0 && <line key={`l${i}`} x1={WALL.X0 + STRIPW * i + 6} y1={G2 - 6} x2={WALL.X0 + STRIPW * i + 6} y2={G2 - WALL.H * Math.min(1, v) + 4} stroke={PAINT_D} strokeWidth={2} opacity={0.5} />)}
      {pct2 >= 100 && <Glow at={[(WALL.X0 + WALL.X1) / 2, G2 - WALL.H / 2]} r={420} color={GOLD} a={0.3 * fade(t, C.ROLL0 + 7 * C.STRIP, 10)} />}
      <Tray x={TRAY_X} g={G2} fill={fill} />
      <Can b={canB} tilt={tilt} />
      {stream && <line x1={stream[0][0]} y1={stream[0][1]} x2={stream[1][0]} y2={stream[1][1]} stroke={PAINT} strokeWidth={8} strokeLinecap="round" />}
      <Hero x={bx} y={G2} s={S} look={BodyLook} pose={bp} />
      {R && <Roller r={R} base={foot} wet={wet} />}
      <Punch t={t} a={C.LINE3A} b={C.LINE3B} l1="Effort is good." l2="The right tool is better." />
    </>
  );
};

// ================================================================ 4 · Rushing / Planning: the maze
const MY1 = 336, MY2 = 1116, MS = 0.27;
const outIn = (top: number): V => { const p = cellXY(START, top); return [p[0] - MZ.CW, p[1]]; };
const outEx = (top: number): V => { const p = cellXY(EXIT, top); return [p[0] + MZ.CW * 0.9, p[1]]; };
/** the rusher's timed route: [point index, arrive time, leave time] */
const RUSH = (() => {
  const pts = MAZE.rush, out: { i: number; a: number; l: number; dead: boolean }[] = [];
  let tt = -4;
  for (let i = 0; i < pts.length; i++) {
    const dead = i > 0 && i < pts.length - 1 && `${pts[i + 1]}` === `${pts[i - 1]}`;
    const a = tt + C.RSTEP, l = a + (dead ? C.RPAUSE : 0);
    out.push({ i, a, l, dead }); tt = l;
  }
  return out;
})();
const jit = (i: number): V => [Math.sin(i * 12.9898) * 9, Math.cos(i * 78.233) * 7];
const Seg4: React.FC<{ t: number }> = ({ t }) => {
  // ---------------- top: runs in at once, every wrong turn
  const P = (i: number): V => (i < 0 ? outIn(MY1) : addV(cellXY(MAZE.rush[i], MY1), jit(i)));
  const stopAt = 150;
  const tt = Math.min(t, stopAt);
  let k = 0; while (k + 1 < RUSH.length && RUSH[k + 1].a - C.RSTEP <= tt) k++;
  const cur = RUSH[k];
  let pos: V, moving = false, dead = false;
  if (tt < cur.a) { pos = lerpV2(P(k - 1), P(k), (tt - (cur.a - C.RSTEP)) / C.RSTEP); moving = true; }
  else { pos = P(k); dead = cur.dead && tt < cur.l; }
  // face the last horizontal direction (vertical moves keep it)
  let fl = false; for (let i = 0; i <= k; i++) { const d = P(i)[0] - P(i - 1)[0]; if (Math.abs(d) > 30) fl = d < 0; }
  let rp: Pose = moving ? run(t * 0.12) : dead ? EMOTE.handsOnHead() : POSES.idle(t);
  if (t > stopAt) rp = mix(rp, { ...POSES.hugKnees() }, (t - stopAt) / 8);
  const trail: V[] = [outIn(MY1)]; for (let i = 0; i <= k; i++) trail.push(P(i)); trail.push(pos);
  // ---------------- bottom: plans on paper first, then walks it once
  const sol = MAZE.sol, SP = (i: number): V => (i < 0 ? outIn(MY2) : i >= sol.length ? outEx(MY2) : cellXY(sol[i], MY2));
  const planPts: V[] = [outIn(MY2), ...sol.map((c) => cellXY(c, MY2)), outEx(MY2)];
  const segL = planPts.slice(1).map((p, i) => lenV(subV(p, planPts[i]))), total = segL.reduce((s, v) => s + v, 0);
  const drawn = clamp((t - C.PLAN0) / (C.PLAN1 - C.PLAN0)) * total;
  const partial: V[] = [planPts[0]]; { let acc = 0; for (let i = 0; i < segL.length; i++) { if (acc + segL[i] <= drawn) { partial.push(planPts[i + 1]); acc += segL[i]; } else { partial.push(lerpV2(planPts[i], planPts[i + 1], (drawn - acc) / segL[i])); break; } } }
  const nSteps = sol.length + 1, wt = (t - C.GO) / C.STEP;
  let ppos: V = outIn(MY2), pPose: Pose, pFlip = false, arrived = false;
  const mapPose: Pose = { ...STAND, head: 18, hN: [52, 22 + Math.sin(t * 1.3) * 3], hF: [44, 30], elbow: 1 };
  if (t < C.GO) pPose = t < C.PLAN1 + 4 ? mapPose : mix(mapPose, STAND, (t - C.PLAN1 - 4) / 4);
  else if (wt < nSteps) {
    const i = Math.floor(wt), u = wt - i, a = SP(i - 1), b = SP(i);
    ppos = lerpV2(a, b, u); pPose = walk(wt * 0.5); if (Math.abs(b[0] - a[0]) > 30) pFlip = b[0] < a[0];
  } else { ppos = outEx(MY2); arrived = true; pPose = mix(STAND, EMOTE.fistPump(), (wt - nSteps) * C.STEP / 6); }
  const gold = arrived ? 1 : 0;
  const pj = J(ppos[0], ppos[1] + 24, pPose, pFlip, MS);
  const poly = (pts: V[]) => pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  return (
    <>
      <Label y={230} t="Rushing" />
      <Maze top={MY1} flagLit={0} t={t} />
      <path d={poly(trail)} fill="none" stroke={RED} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" opacity={0.75} />
      <Hero x={pos[0]} y={pos[1] + 24} s={MS} look={BodyLook} pose={rp} flip={fl} shadow={0.2} />
      <Huh at={J(pos[0], pos[1] + 24, rp, fl, MS).head} a={dead || t > stopAt ? 1 : 0} s={0.9} />

      <Label y={1010} t="Planning" />
      <Maze top={MY2} flagLit={gold} t={t} />
      <path d={poly(partial)} fill="none" stroke={GOLD} strokeWidth={6} strokeDasharray="14 10" strokeLinecap="round" opacity={0.9} />
      {gold > 0 && <Rays f={t} at={[outEx(MY2)[0] + 20, outEx(MY2)[1] - 60]} a={0.45} color={GOLD} n={12} len={420} />}
      <Hero x={ppos[0]} y={ppos[1] + 24} s={MS} look={BodyLook} pose={pPose} flip={pFlip} shadow={0.2} />
      {t < C.GO && (
        <g transform={`translate(${(pj.wN[0] + pj.wF[0]) / 2 + 4} ${(pj.wN[1] + pj.wF[1]) / 2 - 18}) rotate(-8)`}>
          <rect x={-26} y={-20} width={52} height={38} rx={3} fill="#f4f1e6" stroke="#000" strokeWidth={2.5} />
          <path d="M-18 10 H-6 V-4 H8 V-12 H18" fill="none" stroke={GOLD} strokeWidth={3} />
          <path d="M-18 -12 H-2 M4 2 V12 M-10 0 V8" stroke="#555" strokeWidth={2} />
        </g>
      )}
      <Punch t={t} a={C.LINE4A} b={C.LINE4B} l1="Plan for 5 minutes." l2="Save 5 hours." />
    </>
  );
};

// ================================================================ 5 · Push Harder / Start Small: the dominoes
const DH = Array.from({ length: 8 }, (_, i) => 14 * Math.pow(1.6, i));
const DX = (() => { const xs = [210]; for (let i = 0; i < 7; i++) xs.push(xs[i] + DH[i] * DOM_W + DH[i] * 0.45); return xs; })();
const DMAX = DH.map((_, i) => (i < 7 ? 64 : 90));
const DD = DH.map((h) => 4 + 2.4 * Math.sqrt(h / 10));
const DT = (() => { const tt = [C.FLICK]; const thc = (Math.asin(0.45) / D2); for (let i = 0; i < 7; i++) tt.push(tt[i] + DD[i] * Math.sqrt(thc / DMAX[i])); return tt; })();
const LAND = DT[7] + DD[7];
const PIPS_AB: [number, number][] = [[1, 2], [3, 1], [2, 4], [5, 2], [4, 6], [6, 3], [2, 5], [6, 6]];
const GIANT_X = 640;
const Seg5: React.FC<{ t: number }> = ({ t }) => {
  const ang = (i: number) => DMAX[i] * Math.pow(clamp((t - DT[i]) / DD[i]), 2);
  // ---------------- top: shoulders the giant domino; it does not move; slips when the other one crashes
  const hx = 524, live = t < C.SLIP;
  const pp = pushPose(t, hx, G1, [[GIANT_X + 2, G1 - 200], [GIANT_X + 2, G1 - 158]], live);
  let hp = pp.pose, hxx = hx, rot = 0;
  if (!live) {
    const u = clamp((t - C.SLIP) / 12);
    hp = mix(pp.pose, { ...EMOTE.flatFront(), hip: [0, -18] }, u);
    hxx = hx - 120 * ease.inOut(u);
  }
  const tj = J(hxx, G1, hp);
  // ---------------- bottom: sets the smallest piece, aligns, flicks it
  const kx = 120;
  const kneel: Pose = { hip: [-6, -96], lean: 44, head: 26, hN: [0, 0], hF: [0, 0], fN: [70, 0], fF: [-92, -4] };
  let bp: Pose, held: V | null = null, face: Face = "focus", bx = kx;
  if (t < C.PLACE) {
    const u = ease.inOut(t / C.PLACE);
    held = [DX[0] + 2, lerp(G2 - 70, G2, u)];
    bp = reach(kneel, kx, G2, [DX[0] + 4, held[1] - DH[0] - 4], null, false, S, [30, 120]);
  } else if (t < C.FLICK - 14) {
    const u = (t - C.PLACE) / 8;
    bp = mix(reach(kneel, kx, G2, [DX[0] + 4, G2 - DH[0] - 4], null, false, S, [30, 120]), { ...kneel, lean: 30, head: 8, hN: [60, 90], hF: [30, 120] }, u);
  } else if (t < C.FLICK + 6) {
    const u = clamp((t - (C.FLICK - 14)) / 12), back = t < C.FLICK ? 0 : clamp((t - C.FLICK) / 3);
    const tgt: V = [DX[0] - 6 + 10 * back, G2 - DH[0] - 2 - 6 * back];
    bp = mix({ ...kneel, lean: 30, head: 8, hN: [60, 90], hF: [30, 120] }, reach(kneel, kx, G2, tgt, null, false, S, [30, 120]), u);
  } else if (t < LAND + 2) {
    bp = mix(reach(kneel, kx, G2, [DX[0] + 6, G2 - 24], null, false, S, [30, 120]), { ...kneel, lean: 12, head: -10, hN: [40, 100], hF: [20, 110] }, (t - C.FLICK - 6) / 10);
    face = "smile";
  } else {
    bp = mix({ ...kneel, lean: 12, head: -10, hN: [40, 100], hF: [20, 110] }, EMOTE.fistPump(), (t - LAND - 2) / 8); face = "happy";
  }
  const shake = t > LAND && t < LAND + 10 ? Math.sin((t - LAND) * 3) * 8 * (1 - (t - LAND) / 10) : 0;
  return (
    <>
      <Label y={230} t="Push Harder" />
      <Ground y={G1} />
      <Domino x={GIANT_X} g={G1} h={DH[7]} ang={live ? pp.e * 0.4 : 0} a={6} b={6} />
      <Puff t={t} at={pp.slipAt} x={hx - 70} y={G1} w={40} />
      <Hero x={hxx} y={G1} s={S} look={BodyLook} pose={hp} face={FACES ? t < C.SLIP - 4 ? "strain" : "shock" : undefined} rot={0 + rot} />
      <Sweat t={t} at={tj.head} dir={-1} a={live ? 1 : 0} />
      <Puff t={t} at={C.SLIP + 10} x={hxx + 60} y={G1} w={60} />

      <g transform={`translate(0 ${shake})`}>
        <Label y={1010} t="Start Small" />
        <Ground y={G2} />
        {DH.map((h, i) => (i === 0 && held ? null : <Domino key={i} x={DX[i]} g={G2} h={h} ang={ang(i)} a={PIPS_AB[i][0]} b={PIPS_AB[i][1]} />))}
        {held && <Domino x={held[0]} g={held[1]} h={DH[0]} />}
        <Puff t={t} at={LAND} x={DX[7] + DH[7] * DOM_W + 120} y={G2} w={200} dur={24} />
        <Hero x={bx} y={G2} s={S} look={BodyLook} pose={bp} face={FACES ? face : undefined} />
      </g>
      <Punch t={t} a={C.LINE5A} b={C.LINE5B} l1="Start small." l2="Win big." />
    </>
  );
};

// ================================================================ 6 · the end: the smart one hands over the lever
const GE = 1380, RE = 230, BE: V = [790, GE - RE];
const ET0: V = [705, GE - 12], EF: V = [596, GE - 70], EL = 600;
const EU = normV(subV(EF, ET0)), EE0: V = addV(ET0, mulV(EU, EL));
const Seg6: React.FC<{ t: number }> = ({ t }) => {
  const a = t < C.E_PRESS0 ? 0 : -0.36 * ease.inOut((t - C.E_PRESS0) / (C.E_PRESS1 - C.E_PRESS0));
  const tip = addV(EF, rotV(subV(ET0, EF), a)), end = addV(EF, rotV(subV(EE0, EF), a));
  // the hard one (front): waits sad; turns to the plank; presses; celebrates
  const hx = 300;
  let hp: Pose = { ...EMOTE.slump(), head: 20 }, hface: Face = "sad";
  // the smart one: walks in with the plank, sets it, presses next to him
  let sx = 110, sp: Pose = STAND, pa: V, pb: V, sface: Face = "calm";
  if (t < C.E_WALK1) {
    const u = t / C.E_WALK1; sx = lerp(-120, 110, u);
    const base = mixPose(walk(((sx + 120) / (2 * STRIDE * S)) * 0.9), STAND, clamp((t - (C.E_WALK1 - 6)) / 6));
    const sh = J(sx, GE, base).sh, c: V = [sh[0] + 4, sh[1] + 2], u2: V = [Math.cos(3 * D2), Math.sin(3 * D2)];
    pa = addV(c, mulV(u2, 330)); pb = subV(c, mulV(u2, 270));
    sp = reach(base, sx, GE, addV(c, [44, 12]), addV(c, [-30, 10]));
    if (t > 16) { hp = mix(hp, { ...STAND, head: -2 }, (t - 16) / 8); hface = "worried"; }
  } else if (t < C.E_SET1) {
    const sh = J(110, GE, STAND).sh, c: V = [sh[0] + 4, sh[1] + 2], u2: V = [Math.cos(3 * D2), Math.sin(3 * D2)];
    const A0 = addV(c, mulV(u2, 330)), B0 = subV(c, mulV(u2, 270));
    const u = ease.inOut(clamp((t - C.E_SET0) / (C.E_SET1 - C.E_SET0)));
    pa = lerpV2(A0, ET0, u); pb = lerpV2(B0, EE0, u);
    const dir = normV(subV(pa, pb));
    sp = reach(STAND, sx, GE, addV(pb, mulV(dir, 60)), addV(pb, mulV(dir, 20)));
    hp = reach({ ...STAND, head: 4 }, hx, GE, addV(pb, mulV(dir, 200)), addV(pb, mulV(dir, 170)));
    hface = "smile"; sface = "smile";
  } else {
    pa = tip; pb = end;
    const u = (t - C.E_PRESS0) / (C.E_PRESS1 - C.E_PRESS0);
    const base = (k: number): Pose => mix(STAND, PRESS, k);
    const dir = normV(subV(tip, end));
    const sT = addV(end, [4, -12]), hT = addV(addV(end, mulV(dir, 190)), [0, -12]);
    if (t < C.E_ROLL + 6) {
      sp = reach(base(u), sx, GE, sT, addV(sT, mulV(dir, 26)));
      hp = reach(base(u), hx, GE, hT, addV(hT, mulV(dir, -26)));
      hface = t < C.E_PRESS0 ? "smile" : "strain"; sface = t < C.E_PRESS0 ? "smile" : "focus";
    } else {
      const k = (t - C.E_ROLL - 6) / 10;
      sp = mix(reach(base(1), sx, GE, sT, addV(sT, mulV(dir, 26))), { ...STAND, head: -6 }, k);
      hp = mix(reach(base(1), hx, GE, hT, addV(hT, mulV(dir, -26))), EMOTE.armsWide(), k);
      hface = "happy"; sface = "smile";
    }
  }
  let bcx = BE[0], bcy = BE[1], brot = 0;
  const lift = Math.min(0, tip[1] - ET0[1]);
  if (t < C.E_ROLL) { bcy += lift; brot = -lift * 0.3; }
  else {
    const lift0 = Math.min(0, addV(EF, rotV(subV(ET0, EF), -0.36))[1] - ET0[1]);
    const d = 760 * ease.out(clamp((t - C.E_ROLL) / 50));
    bcx += d; bcy += lift0 * (1 - clamp((t - C.E_ROLL) / 5)); brot = -lift0 * 0.3 + (d / RE) / D2;
  }
  const won = clamp((t - C.E_ROLL - 4) / 14);
  const shake = t > C.E_ROLL + 4 && t < C.E_ROLL + 14 ? Math.sin((t - C.E_ROLL) * 3) * 7 * (1 - (t - C.E_ROLL - 4) / 10) : 0;
  return (
    <g transform={`translate(0 ${shake})`}>
      {won > 0 && <Rays f={t} at={[620, GE - 300]} a={0.4 * won} color={GOLD} n={16} len={1300} />}
      {won > 0 && <Glow at={[540, GE - 200]} r={600} color={GOLD} a={0.25 * won} />}
      <Ground y={GE} />
      <Pebble x={EF[0]} g={GE} w={96} h={60} seed={8} />
      <Boulder c={[bcx, bcy]} r={RE} rot={brot} seed={9} />
      <Puff t={t} at={C.E_ROLL + 4} x={BE[0] + 60} y={GE} w={160} dur={24} />
      <Plank a={pb!} b={pa!} w={20} />
      <Hero x={sx} y={GE} s={S} look={BodyLook} pose={sp} face={FACES ? sface : undefined} />
      <Hero x={hx} y={GE} s={S} look={BodyLook} pose={hp} face={FACES ? hface : undefined} />
      <g opacity={1 - fade(t, C.E_PRESS0, 10)}>
        <Label x={sx} y={GE - 330} t="Smart" size={34} color={DIM} weight={600} />
        <Label x={hx} y={GE - 330} t="Hard" size={34} color={DIM} weight={600} />
      </g>
      <g opacity={fade(t, C.E_TITLE1, 6)} transform={`translate(540 520) scale(${0.85 + 0.15 * pop(t, C.E_TITLE1)})`}><text textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={92} fill={W}>Work smart,</text></g>
      <g opacity={fade(t, C.E_TITLE2, 6)} transform={`translate(540 640) scale(${0.85 + 0.15 * pop(t, C.E_TITLE2)})`}><text textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={92} fill={GOLD}>not just hard.</text></g>
    </g>
  );
};

// ================================================================ assembly: cross-dissolves, never black
const SEGS: [number, React.FC<{ t: number }>][] = [[Q.S1, Seg1], [Q.S2, Seg2], [Q.S3, Seg3], [Q.S4, Seg4], [Q.S5, Seg5], [Q.S6, Seg6]];
const XF = 8;
export const SmartFilm: React.FC<{ at?: number }> = ({ at }) => {
  const cur = useCurrentFrame();
  const f = at ?? cur;
  let k = 0; for (let i = 0; i < SEGS.length; i++) if (f >= SEGS[i][0]) k = i;
  const [start, Seg] = SEGS[k], end = k + 1 < SEGS.length ? SEGS[k + 1][0] : Q.LEN, t = f - start;
  const push = 1 + 0.03 * (t / (end - start));
  const nx = k + 1 < SEGS.length && f >= end - XF ? SEGS[k + 1] : null;
  const NextSeg = nx ? nx[1] : null;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <KitDefs />
        <Defs />
        <SmartDefs />
        <g transform={`translate(540 960) scale(${push}) translate(-540 -960)`}><Seg t={t} /></g>
        {NextSeg && <g opacity={clamp((f - (end - XF)) / XF)}><rect x={0} y={0} width={1080} height={1920} fill="#000" /><NextSeg t={0} /></g>}
        <Vignette a={0.3} />
      </svg>
    </AbsoluteFill>
  );
};
export const SMART_BEAT = BEAT;
