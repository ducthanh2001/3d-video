// DoneFilm: "DO IT UNTIL IT'S DONE." 34.9 s (1046 frames), 1080x1920, 30 fps. Boxing (the KO, ◀◀ 4 years earlier: snooze vs
// the bag, the trophy) · the battlefield (shields up through the arrows) · the hurdles (falls at hurdle 1, gets up, dives at
// the line, the others quit) · the climbing wall (quits at fall 3 / tops out on attempt 21) · the end. Pose-to-pose acting
// with holds (kit/acting), cross-dissolves, every number of time in events.ts.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { V, clamp, ease } from "../../kit/core";
import { Hero, Pose, POSES, mixPose, run, walk } from "../../kit/hero";
import { KitDefs, Vignette } from "../../kit/materials";
import { Glow, Rays } from "../../kit/fx";
import { EMOTE } from "../../kit/acting";
import { Defs, GOLD, SANS } from "../samehours/StyleFrames";
import { reach } from "../beatyesterday/StyleFrames";
import {
  AR, Arena, Arrow, BandOf, Bedroom, DARK, F2, F3, FRONT, GREY, HERO, Header, Hurdle, MONO, RED, REF_LOOK,
  RING_Y, ROWS, RH, Ring, Shield, Spectators, Tag, Trophy, boxer, helmet, hurdleJump, refKit, rnd, tapeAlong,
} from "./Frames";
import { BEAT, C, Q } from "./events";

export const DONE_FILM_FRAMES = Q.LEN;
const W = "#f2f2f2";
const fade = (t: number, a: number, d = 8) => clamp((t - a) / d);
const mix = (a: Pose, b: Pose, u: number) => mixPose(a, b, ease.inOut(clamp(u)));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const Fx: React.FC<{ t: number; at: number; x: number; y: number; r?: number; c?: string; n?: number }> = ({ t, at, x, y, r = 60, c = W, n = 10 }) => {
  const u = (t - at) / 12;
  if (u < 0 || u > 1) return null;
  return <g opacity={1 - u}>{Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return <line key={i} x1={x + Math.cos(a) * r * 0.4 * (1 + u)} y1={y + Math.sin(a) * r * 0.4 * (1 + u)} x2={x + Math.cos(a) * r * (0.8 + u)} y2={y + Math.sin(a) * r * (0.8 + u)} stroke={c} strokeWidth={5} strokeLinecap="round" />; })}</g>;
};
const Dust: React.FC<{ t: number; at: number; x: number; y: number }> = ({ t, at, x, y }) => {
  const u = (t - at) / 24;
  if (u < 0 || u > 1) return null;
  return <g opacity={0.35 * (1 - u)}>{Array.from({ length: 7 }, (_, i) => <ellipse key={i} cx={x - 60 + i * 22 + u * (i - 3) * 20} cy={y - 8 - u * 20} rx={18 + u * 26} ry={8 + u * 8} fill="#bdbdc4" />)}</g>;
};
const Flashes: React.FC<{ t: number; y0: number; y1: number; rate?: number }> = ({ t, y0, y1, rate = 0.05 }) => (
  <g>{Array.from({ length: 40 }, (_, i) => rnd(i * 7 + Math.floor((t + i * 3) / 4)) < rate ? <circle key={i} cx={rnd(i) * 1080} cy={y0 + rnd(i + 9) * (y1 - y0)} r={14} fill="#fff" opacity={0.9} /> : null)}</g>
);
const Cam: React.FC<{ z: number; c: V; children: React.ReactNode }> = ({ z, c, children }) => (
  <g transform={`translate(540 960) scale(${z}) translate(${-c[0]} ${-c[1]})`}>{children}</g>
);

// ================================================================ 0 · the knockout
const Seg0: React.FC<{ t: number }> = ({ t }) => {
  const fy = RING_Y - 40, hx = 470, ox = 690, s = 0.92;
  const bob = (k: number) => Math.sin((t + k) / 5) * 4;
  const guard = (k: number): Pose => ({ ...EMOTE.guard(), hip: [-6 + Math.sin((t + k) / 9) * 6, -188 + 22 + bob(k)] });
  // him: guard, a slip when the jab comes, the wind-up, the cross, then the fist up
  const windUp: Pose = { ...EMOTE.guard(), hip: [-16, -170], lean: 4 };
  let hp: Pose = guard(0);
  if (t >= 24 && t < 40) hp = mix(guard(0), { ...guard(0), lean: 26, head: 30 }, Math.sin(((t - 24) / 16) * Math.PI));
  if (t >= 54 && t < 60) hp = mix(guard(0), windUp, (t - 54) / 6);
  if (t >= 60 && t < 65) hp = mix(windUp, EMOTE.cross(), (t - 60) / 5);
  if (t >= 65 && t < 84) hp = EMOTE.cross();
  if (t >= 84 && t < 96) hp = mix(EMOTE.cross(), EMOTE.fistPump(), (t - 84) / 12);
  if (t >= 96) hp = { ...EMOTE.fistPump(), hip: [0, -188 + Math.abs(Math.sin(t / 6)) * -10] };
  // the opponent: guard, the jab, then the punch lands: snapped back, over, flat
  const fall: Pose = { ...POSES.fallBack(), hip: [-10, -150], lean: -42, head: -40, hN: [-60, -20], hF: [-30, 40], fN: [60, -10], fF: [30, 0] };
  let op: Pose = guard(11), ox2 = ox;
  if (t >= 24 && t < 36) op = mix(guard(11), EMOTE.cross(), Math.sin(((t - 24) / 12) * Math.PI));
  if (t >= C.KO_HIT && t < 78) op = mix(guard(11), fall, (t - C.KO_HIT) / 13);
  if (t >= 78) { op = mix(fall, EMOTE.flatBack(), (t - 78) / 14); ox2 = ox + ease.out(clamp((t - 78) / 18)) * 90; }
  // the referee: watching, then running in and waving it off
  const rx = t < 70 ? 940 : lerp(940, 860, ease.out(clamp((t - 70) / 22)));
  const wave = Math.sin(t / 3) * 50;
  const refP: Pose = t < 70 ? { ...POSES.stand(), head: -4, hN: [20, 120], hF: [-10, 120] } : t < 92 ? { ...run(t / 12), head: -6 } : { ...POSES.stand(), head: 10, hN: [70 + wave, -60], hF: [70 - wave, -40] };
  return (
    <g>
      <Arena />
      <Flashes t={t} y0={470} y1={1080} rate={t > C.KO_HIT ? 0.18 : 0.04} />
      <Ring />
      <Hero x={rx} y={fy} s={s * 0.95} pose={refP} look={REF_LOOK} flip hold={refKit} />
      <Hero x={ox2} y={fy} s={s} pose={op} look={DARK} flip hold={boxer("#8a2a2a", "#7a1e1e")} />
      <Hero x={hx} y={fy} s={s} pose={hp} look={HERO} hold={boxer("#e8e8ec", "#2a2a30")} />
      <Fx t={t} at={C.KO_HIT} x={ox - 34} y={fy - 300} r={70} />
      {t >= C.KO_HIT && t < C.KO_HIT + 14 && Array.from({ length: 12 }, (_, i) => <circle key={i} cx={ox - 10 + rnd(i) * 90 + (t - C.KO_HIT) * 4} cy={fy - 330 + rnd(i + 5) * 70} r={3 + rnd(i + 2) * 4} fill="#cfe0ff" opacity={0.8} />)}
      <Tag x={540} y={340} t={t < C.KO_REF ? "ROUND 12 · 2:51" : "ROUND 12 · KO"} c={W} s={40} />
      <Header t="WHAT THEY SEE." />
    </g>
  );
};

// ================================================================ 1 · ◀◀ 4 years earlier: snooze vs the bag
const Seg1: React.FC<{ t: number }> = ({ t }) => {
  const fl = 1560;
  // top: the alarm rings; he reaches out, slaps it, pulls the arm back under, sleeps on
  const reachU = clamp((t - 40) / 18), backU = clamp((t - 70) / 15);
  const arm: V = [lerp(20, -120, ease.inOut(reachU) * (1 - ease.inOut(backU))), lerp(40, 70, ease.inOut(reachU) * (1 - ease.inOut(backU)))];
  const sleeper = <Hero x={380} y={fl - 214} s={0.8} pose={{ ...POSES.lie(), head: -16, hN: arm, hF: [20, 50] }} look={DARK} shadow={0} />;
  const ringing = t >= C.ALARM0 && t < C.SLAP;
  // bottom: punches on the beat, alternating jab / cross; the bag answers each hit
  const hits = Array.from({ length: C.PUNCHN }, (_, k) => C.PUNCH0 + k * C.PUNCHD);
  const last = hits.filter((h) => h <= t).pop();
  const since = last === undefined ? 99 : t - last;
  const k = last === undefined ? 0 : hits.indexOf(last);
  const punch = k % 2 ? EMOTE.cross() : { ...EMOTE.guard(), hN: [AR - 8, -24] as V, lean: 18 };
  const before = hits.find((h) => h > t);
  let bp: Pose = EMOTE.guard();
  if (since < 4) bp = punch;
  else if (since < 10) bp = mix(punch, EMOTE.guard(), (since - 4) / 6);
  else if (before !== undefined && before - t < 4) bp = mix(EMOTE.guard(), punch, 1 - (before - t) / 4);
  bp = { ...bp, hip: [bp.hip[0], bp.hip[1] + Math.sin(t / 5) * 3] };
  const swing = -2 + 7 * Math.exp(-since / 14) * Math.cos(since / 5);
  const gymActors = (
    <g>
      <g transform={`rotate(${swing} 820 ${fl - 600})`}>
        <rect x={750} y={fl - 600} width={140} height={430} rx={52} fill="#5a3a2a" stroke="#000" strokeWidth={4} />
        <rect x={750} y={fl - 560} width={140} height={14} fill="#3a2a1e" /><rect x={750} y={fl - 220} width={140} height={14} fill="#3a2a1e" />
      </g>
      <Hero x={606} y={fl} s={0.88} pose={bp} look={HERO} hold={boxer("#e8e8ec", "#2a2a30")} />
      {since < 6 && [0, 1, 2, 3].map((i) => <path key={i} d={`M742 ${fl - 300 + (i - 1.5) * 30} l-34 ${(i - 1.5) * 10}`} stroke={W} strokeWidth={5} strokeLinecap="round" />)}
      {since < 12 && [0, 1, 2].map((i) => <circle key={i} cx={640 + i * 22 - since * 2} cy={fl - 360 - i * 18 - since * 3} r={5} fill="#bdbdc4" />)}
    </g>
  );
  const day = 1453 + Math.min(7, Math.floor(t / 20));
  const rew = clamp(1 - t / 14);
  return (
    <g>
      <rect x={0} y={0} width={1080} height={1920} fill="#000" />
      <BandOf y0={220} h={790} from={830} id="sA"><Bedroom sleeper={sleeper} quiet={t < 85} /></BandOf>
      <BandOf y0={1050} h={790} from={830} id="sB"><F2 actors={gymActors} noText /></BandOf>
      {/* the alarm, ringing until the slap */}
      {ringing && <g transform={`translate(${49 + Math.sin(t * 2.3) * 3} ${220 + 1560 - 175 - 830})`}>{[0, 1, 2].map((i) => <path key={i} d={`M${46 + i * 16} -30 q12 30 0 60 M${-46 - i * 16} -30 q-12 30 0 60`} stroke={RED} strokeWidth={4} fill="none" opacity={0.8 - i * 0.2} />)}<text x={70} y={-40} fontFamily={MONO} fontWeight={900} fontSize={30} fill={RED}>BEEP</text></g>}
      {t >= C.SLAP && t < C.SLAP + 8 && <Glow at={[49, 220 + 1560 - 175 - 830]} r={70} color="#ffffff" a={0.6} />}
      {t >= 85 && [0, 1, 2].map((i) => { const u = ((t - 85 + i * 14) % 42) / 42; return <text key={i} x={240 + u * 60 + i * 10} y={220 + 1560 - 300 - 830 - u * 80} fontFamily={SANS} fontWeight={800} fontSize={34 + i * 6} fill="#9a9aa2" opacity={1 - u}>z</text>; })}
      <Tag x={170} y={290} t="SKIPPED" c={RED} s={34} />
      <Tag x={170} y={1120} t="TRAINED" c={GOLD} s={34} />
      <Tag x={870} y={290} t={`5:00 AM · DAY ${day.toLocaleString("en-US")}`} c="#9ab0d0" s={26} />
      <Tag x={870} y={1120} t={`5:00 AM · DAY ${day.toLocaleString("en-US")}`} c="#9ab0d0" s={26} />
      <path d="M70 140 L40 160 L70 180 Z M110 140 L80 160 L110 180 Z" fill={W} />
      <Header t="4 YEARS EARLIER." />
      {rew > 0 && <g opacity={rew}>{Array.from({ length: 96 }, (_, i) => <rect key={i} x={0} y={i * 20} width={1080} height={2} fill="#000" opacity={0.5} />)}{Array.from({ length: 30 }, (_, i) => <rect key={`n${i}`} x={rnd(i + t) * 1080} y={rnd(i + 9 + t) * 1920} width={60 + rnd(i + 3) * 200} height={4} fill="#fff" opacity={0.5} />)}</g>}
    </g>
  );
};

// ================================================================ 2 · the trophy
const Seg2: React.FC<{ t: number; end?: boolean }> = ({ t, end }) => {
  const fy = RING_Y - 40, rx = 430, cx = 610, s = 0.9;
  const up = ease.out(clamp(t / C.LIFT1)), cupU = ease.out(clamp((t - 6) / (C.CUP - 6)));
  const lift: V = [520, lerp(fy - 250, fy - 392, up)];
  const cupHand: V = [lerp(cx + 70, cx + 104, cupU), lerp(fy - 200, fy - 400, cupU)];
  const ref = reach(FRONT({ head: -6 }), rx, fy, [lift[0] - 4, lift[1] + 20], [rx - 50, fy - 140], false, s * 0.97);
  const champ = reach(FRONT({ head: -14 }), cx, fy, cupHand, lift, false, s);
  const rock = Math.sin(t / 9) * 4;
  return (
    <g>
      <Arena />
      <Flashes t={t} y0={470} y1={1080} rate={0.16} />
      <Ring />
      <rect x={110} y={fy - 110} width={70} height={110} fill="#3a3a42" stroke="#000" strokeWidth={3} />
      <Hero x={150} y={fy} s={s * 0.9} pose={{ ...POSES.sit(110), lean: 44 + rock, head: 52, hN: [44, -28], hF: [30, -34], elbow: 1 }} look={DARK} hold={boxer("#8a2a2a", "#7a1e1e")} />
      <Glow at={[560, fy - 360]} r={340} color={GOLD} a={0.5 * cupU} />
      <Hero x={cx} y={fy} s={s} pose={champ} look={HERO} hold={boxer("#e8e8ec", "#2a2a30")} />
      <Hero x={rx} y={fy} s={s * 0.97} pose={ref} look={REF_LOOK} hold={refKit} />
      <ellipse cx={lift[0] - 2} cy={lift[1] + 22} rx={15} ry={12} fill="#cdd8e8" stroke="#000" strokeWidth={3} />
      <Trophy hand={[cupHand[0], cupHand[1] + 50]} s={0.58} />
      {/* confetti */}
      {t > 20 && Array.from({ length: 60 }, (_, i) => { const y = ((rnd(i) * 1600 + (t - 20) * (6 + rnd(i + 4) * 6)) % 1500) + 200, x = rnd(i + 7) * 1080 + Math.sin(t / 8 + i) * 20; return <rect key={i} x={x} y={y} width={10} height={16} fill={i % 3 ? GOLD : W} transform={`rotate(${t * 6 + i * 40} ${x} ${y})`} opacity={0.85} />; })}
      {!end && <Tag x={540} y={340} t="ROUND 12 · KO" c={W} s={40} />}
      {!end && <Header t="WHAT THEY SEE." />}
    </g>
  );
};

// ================================================================ 3 · the battlefield: the volleys land, the men behind break and run, he walks on
const SAYS = ["Too many arrows!", "I'm out!", "Run!", "It's hopeless!", "Fall back!"];
const Bubble: React.FC<{ x: number; y: number; t: string; a: number }> = ({ x, y, t, a }) => {
  const w = t.length * 17 + 30;
  return (
    <g opacity={a} transform={`translate(${x} ${y}) scale(${0.7 + 0.3 * a}) translate(${-x} ${-y})`}>
      <rect x={x - w / 2} y={y - 50} width={w} height={46} rx={14} fill={W} stroke="#000" strokeWidth={3} />
      <path d={`M${x - 8} ${y - 6} l-4 18 l18 -18 Z`} fill={W} stroke="#000" strokeWidth={3} strokeLinejoin="round" />
      <text x={x} y={y - 18} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={28} fill="#111">{t}</text>
    </g>
  );
};
const Seg3: React.FC<{ t: number }> = ({ t }) => {
  const fl = 1500;
  const hits = [C.HIT1, C.HIT2, C.HIT3, C.HIT4];
  const sinceHit = Math.min(...hits.map((h) => (t >= h ? t - h : 99)));
  const recoil = sinceHit < 10 ? Math.sin((sinceHit / 10) * Math.PI) : 0;
  const stepPose = (ph: number, k = 0): Pose => { const w = walk(ph, 0.5); return { ...EMOTE.shieldUp(), fN: [w.fN[0] + 30 + k, w.fN[1]], fF: [w.fF[0] - 30, w.fF[1]] }; };
  const hx = 470 + t * 0.8;
  const heroPose: Pose = { ...stepPose(t / 26), lean: 28 - recoil * 16, hip: [-8 - recoil * 10, -144] };
  const shieldAt: V = [hx + 130, fl - 300];
  // the volleys: each arrow is loosed from the wall and flies 16 frames to its mark: his shield (on the hits) or the ground
  const FLY = 16;
  const marks = [
    ...hits.map((h, i) => ({ at: h, to: [shieldAt[0] + 10 - i * 6, shieldAt[1] - 30 + i * 22] as V, shield: true })),
    ...Array.from({ length: 34 }, (_, i) => ({ at: 6 + i * 4.8, to: [60 + rnd(i + 40) * 760, fl + 4] as V, shield: false })),
  ];
  const arrows = marks.map((m, i) => {
    const from: V = [1000 + rnd(i) * 120, 640 + rnd(i + 2) * 120];
    if (t < m.at - FLY) return null;
    const u = clamp((t - (m.at - FLY)) / FLY);
    if (m.shield) return null; // drawn on the shield once it lands (below)
    const p: V = [lerp(from[0], m.to[0], u), lerp(from[1], m.to[1], u) - Math.sin(u * Math.PI) * 120];
    const ang = u < 1 ? (Math.atan2(m.to[1] - from[1] + Math.cos(u * Math.PI) * -380, m.to[0] - from[0]) * 180) / Math.PI : 120 + rnd(i) * 30;
    return <Arrow key={i} x={p[0] - Math.cos((ang * Math.PI) / 180) * 110} y={p[1] - Math.sin((ang * Math.PI) / 180) * 110} a={ang} l={u < 1 ? 110 : 90} />;
  });
  const incoming = marks.filter((m) => m.shield && t >= m.at - FLY && t < m.at).map((m, i) => {
    const u = (t - (m.at - FLY)) / FLY, from: V = [1040, 680];
    const p: V = [lerp(from[0], m.to[0], u), lerp(from[1], m.to[1], u) - Math.sin(u * Math.PI) * 100];
    return <Arrow key={`s${i}`} x={p[0] - Math.cos(Math.PI * 1.1) * -110} y={p[1]} a={198} />;
  });
  const stuck = 4 + hits.filter((h) => t >= h).length * 2;
  // the men behind: advancing with him, then each in turn throws down his shield, turns and runs, shouting
  const men = [[400, 0.66], [330, 0.6], [520, 0.62], [260, 0.56], [460, 0.54]].map(([x0, sc], i) => {
    const turn = C.RUN0 + i * C.RUND, y = fl - 30 - i * 12;
    if (t < turn) return <Hero key={i} x={x0 + t * 0.7} y={y} s={sc} pose={stepPose(t / 26 + i * 0.3, i * 4)} look={DARK} hold={(j) => <g>{helmet(j)}<Shield at={[j.wN[0] + 24, j.wN[1] + 36]} rot={-8} arrows={1 + (i % 2)} s={0.95} /></g>} />;
    const xs = x0 + turn * 0.7, x = xs - (t - turn) * 7;
    return (
      <g key={i}>
        <Shield at={[xs + 40, fl - 20]} rot={-80} s={sc * 0.95} arrows={1 + (i % 2)} />
        <Hero x={x} y={y} s={sc} pose={{ ...run(t / 10 + i), head: 18 }} look={GREY} flip hold={(j) => helmet(j, true)} />
        {t - turn < 50 && <Bubble x={x + 40} y={y - sc * 420} t={SAYS[i]} a={fade(t, turn, 6) * (1 - fade(t, turn + 40, 10))} />}
      </g>
    );
  });
  const actors = (
    <g>
      {arrows}
      {men}
      <Hero x={hx} y={fl} s={0.86} pose={heroPose} look={HERO} hold={(j) => <g>{helmet(j)}<Shield at={[j.wN[0] + 26, j.wN[1] + 40]} rot={-8 + recoil * 8} arrows={stuck} s={0.95} /></g>} />
      {incoming}
      {hits.map((h, i) => <Fx key={i} t={t} at={h} x={shieldAt[0]} y={shieldAt[1]} r={50} c="#ffd27a" n={8} />)}
    </g>
  );
  return <F3 actors={actors} still={false} noText={t < 8} />;
};

// ================================================================ 4 · the hurdles: a wide tracking shot that follows him down the track
const HW = [520, 1120, 1720, 2320], FINISH = 2860, RS = 0.52, HS = 0.74; // hurdles in world x, the line, runner/hurdle scale
type Runner = { x: number; pose: Pose; lift: number };
const runnerOn = (x: number, t: number, skip = -1): Runner => {
  for (let i = 0; i < HW.length; i++) {
    if (i === skip) continue;
    const d = x - (HW[i] - 70);
    if (d > 0 && d < 130) return { x, pose: hurdleJump(), lift: Math.sin((d / 130) * Math.PI) * 34 };
  }
  return { x, pose: { ...run(x / 150), lean: 22, head: 6 }, lift: 0 };
};
/** one lane in world coordinates seen through a camera at cam (x of the left edge); the stands drift slower (parallax) */
const TrackLane: React.FC<{ y0: number; h: number; n: number; cam: number; id: string; knockedAt?: number; t: number; children: React.ReactNode }> = ({ y0, h, n, cam, id, knockedAt = 1e9, t, children }) => {
  const g = y0 + h - 80;
  const hurdle = (wx: number, i: number) => {
    const x = wx - cam, down = i === 0 && t >= knockedAt;
    return <g key={i} transform={`translate(${x} ${g + 30}) scale(${HS}) translate(${-x} ${-(g + 30)})`}><Hurdle x={x} g={g + 30} knocked={down} /></g>;
  };
  return (
    <g>
      <defs><clipPath id={id}><rect x={0} y={y0} width={1080} height={h} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        <rect x={0} y={y0} width={1080} height={h} fill="#08080b" />
        <g transform={`translate(${-((cam * 0.3) % 220)} 0)`} opacity={0.6}>{[0, 1].map((k) => <g key={k} transform={`translate(${k * 1080} 0)`}><Spectators y0={y0 + 30} y1={g - 170} rows={4} /></g>)}</g>
        <rect x={0} y={g - 160} width={1080} height={140} fill="#0e0e12" />
        <rect x={0} y={g - 20} width={1080} height={100} fill="#4a2a24" />
        <rect x={0} y={g - 20} width={1080} height={4} fill={W} opacity={0.8} /><rect x={0} y={g + 76} width={1080} height={4} fill={W} opacity={0.8} />
        {Array.from({ length: 12 }, (_, i) => { const x = i * 300 - (cam % 300); return <rect key={i} x={x} y={g + 26} width={60} height={4} fill={W} opacity={0.15} />; })}
        <text x={40} y={g + 56} fontFamily={SANS} fontWeight={900} fontSize={40} fill={W} opacity={0.5}>{n}</text>
        {HW.map(hurdle)}
        {children}
      </g>
      <rect x={0} y={y0} width={1080} height={h} fill="none" stroke="#2e2e36" strokeWidth={4} />
    </g>
  );
};
const Seg4: React.FC<{ t: number }> = ({ t }) => {
  const v = 12;
  // lane 1: clears two hurdles, slows, stops halfway bent over
  const x1 = Math.min(100 + v * t, 1400);
  const r1: Runner = 100 + v * t < 1400 ? runnerOn(x1, t) : { x: 1400, pose: t < C.Q1 ? mix({ ...run(1400 / 150), lean: 22 }, EMOTE.handsOnKnees(), (t - 108) / 14) : { ...EMOTE.handsOnKnees(), hip: [-14, -158 + Math.sin(t / 4) * 4] }, lift: 0 };
  // lane 2: clears three, sits down just before the last
  const x2 = Math.min(100 + v * t, 2150);
  const r2: Runner = 100 + v * t < 2150 ? runnerOn(x2, t) : { x: 2150, pose: mix({ ...run(2150 / 150), lean: 22 }, { ...POSES.sit(20), lean: 34, head: 40, hN: [40, 50], hF: [30, 56] }, (t - 171) / 18), lift: 0 };
  // lane 3: trips on hurdle 1, lies still, gets up in stages, runs on, dives at the line
  let r3: Runner; const rot = 0;
  const tripX = 100 + v * C.H_TRIP;
  if (t < C.H_TRIP) r3 = runnerOn(100 + v * t, t, 0);
  else if (t < C.H_TRIP + 14) r3 = { x: lerp(tripX, 620, ease.out((t - C.H_TRIP) / 14)), pose: mix({ ...run(tripX / 150), lean: 40 }, EMOTE.flatFront(), (t - C.H_TRIP) / 10), lift: 0 };
  else if (t < C.H_UP) r3 = { x: 620, pose: { ...EMOTE.flatFront(), hip: [0, -16 + Math.sin(t / 5) * 2] }, lift: 0 };
  else if (t < C.H_UP + 10) r3 = { x: 620, pose: mix(EMOTE.flatFront(), EMOTE.pushUp(), (t - C.H_UP) / 10), lift: 0 };
  else if (t < C.H_UP + 20) r3 = { x: 620, pose: mix(EMOTE.pushUp(), EMOTE.oneKnee(), (t - C.H_UP - 10) / 10), lift: 0 };
  else if (t < C.H_RUN) r3 = { x: 620, pose: mix(EMOTE.oneKnee(), EMOTE.resolve(), (t - C.H_UP - 20) / 8), lift: 0 };
  else if (t < C.H_TAPE) r3 = runnerOn(620 + 14.6 * (t - C.H_RUN), t, 0);
  else {
    // through the tape: easing up over 20 frames, arms flung out
    const x0 = 620 + 14.6 * (C.H_TAPE - C.H_RUN), d = t - C.H_TAPE, u = clamp(d / 20);
    const x = x0 + 14.6 * 20 * (u - u * u / 2);
    r3 = { x, pose: mix({ ...run(x / 150), lean: 22 }, { ...EMOTE.armsWide(), fN: [40, 0], fF: [-40, 0] }, u), lift: 0 };
  }
  const cam = clamp(r3.x - 460, 0, FINISH + 420 - 1080);
  const sx = (x: number) => x - cam;
  const g3 = ROWS[2] + RH - 80 + 30, broke = t >= C.H_TAPE, flap = Math.sin(t / 3) * 6;
  const fx = sx(FINISH);
  const header = t < C.H_RUN ? "HE FELL AT THE FIRST HURDLE." : t < C.H_TAPE ? "SOME STOP. HE KEEPS GOING." : "HE GOT UP. HE FINISHED.";
  const bandage = t >= C.H_UP + 20;
  // the line: a white strip across the lane; two posts far apart (near post at the bottom of the lane, far post set back)
  const NEAR = -70, FAR = 110, PH = 170;
  const finishOn = (g: number) => <g><rect x={fx - 6} y={g - 50} width={12} height={100} fill={W} opacity={0.9} /><line x1={fx + FAR} y1={g - 40} x2={fx + FAR} y2={g - 40 - PH} stroke="#8a8a92" strokeWidth={9} /><line x1={fx + NEAR} y1={g + 30} x2={fx + NEAR} y2={g + 30 - PH} stroke="#d8d8dc" strokeWidth={10} /><rect x={fx + NEAR - 12} y={g + 30 - PH - 16} width={24} height={18} rx={3} fill={GOLD} /><rect x={fx + FAR - 10} y={g - 40 - PH - 14} width={20} height={16} rx={3} fill={GOLD} /></g>;
  return (
    <g>
      <rect x={0} y={0} width={1080} height={1920} fill="#000" />
      <TrackLane y0={ROWS[0]} h={RH} n={1} cam={cam} id="tl1" t={t}>
        {finishOn(ROWS[0] + RH - 50)}
        <Hero x={sx(r1.x)} y={ROWS[0] + RH - 50 - r1.lift} s={RS} pose={r1.pose} look={GREY} />
        {t >= C.Q1 && <Tag x={clamp(sx(1400), 140, 940)} y={ROWS[0] + 70} t="QUIT: TIRED" c={RED} s={30} />}
      </TrackLane>
      <TrackLane y0={ROWS[1]} h={RH} n={2} cam={cam} id="tl2" t={t}>
        {finishOn(ROWS[1] + RH - 50)}
        <Hero x={sx(r2.x)} y={ROWS[1] + RH - 50 - r2.lift} s={RS} pose={r2.pose} look={GREY} />
        {t >= C.Q2 && <Tag x={clamp(sx(2150), 160, 920)} y={ROWS[1] + 70} t="QUIT: 10 m TO GO" c={RED} s={30} />}
      </TrackLane>
      <TrackLane y0={ROWS[2]} h={RH} n={3} cam={cam} id="tl3" knockedAt={C.H_TRIP} t={t}>
        {finishOn(g3 - 20)}
        <Dust t={t} at={C.H_TRIP + 6} x={sx(620)} y={g3 - 20} />
        {broke && <Glow at={[fx - 40, g3 - 150]} r={280} color={GOLD} a={0.55} />}
        <Hero x={sx(r3.x)} y={g3 - 20 - r3.lift} s={RS} pose={r3.pose} look={HERO} rot={rot} hold={(j) => bandage ? <rect x={(j.kN[0] + j.hip[0]) / 2 - 10} y={(j.kN[1] + j.hip[1]) / 2 - 10} width={22} height={20} rx={4} fill={W} stroke={RED} strokeWidth={2} /> : null} />
        {/* the tape: big, taut across the line; snapped on his hands and wrapped over him, the ends streaming */}
        {(() => {
          const nTop: V = [fx + NEAR, g3 + 10 - PH], fTop: V = [fx + FAR, g3 - 60 - PH], hx = sx(r3.x), chest = g3 - 20 - 150;
          if (!broke) return tapeAlong([nTop, fTop], 40, "taut");
          return <>{tapeAlong([nTop, [lerp(nTop[0], hx + 20, 0.6), chest + 20], [hx + 24, chest + 10], [hx - 50, chest + 18 + flap], [hx - 130, chest + 34 + flap * 1.5]], 28, "w1")}
            {tapeAlong([fTop, [lerp(fTop[0], hx + 30, 0.6), chest - 10], [hx + 30, chest - 6], [hx - 40, chest - 18 - flap], [hx - 120, chest - 8 - flap * 1.5]], 28, "w2")}</>;
        })()}
        {broke && <Tag x={clamp(fx - 220, 200, 880)} y={ROWS[2] + 70} t="14.08 · FINISHED" c={GOLD} s={32} />}
      </TrackLane>
      <Header t={header} c={broke ? GOLD : W} />
    </g>
  );
};

// ================================================================ 5 · the tall wall, a wide shot: two top-rope routes side by side
const WALL_T = 300, WALL_B = 1640, ROUTE = [320, 760];
/** route holds every 105 px up the wall, alternating left and right of the route line */
const routeHolds = (cx: number) => Array.from({ length: 13 }, (_, i) => [cx + (i % 2 ? 46 : -46) + (rnd(i + cx) - 0.5) * 20, WALL_B - 120 - i * 105] as V);
const Climber: React.FC<{ cx: number; y: number; look: typeof HERO; ph: number; head?: number; slap?: boolean }> = ({ cx, y, look, ph, head = -30, slap }) => {
  const s = 0.46, holds = routeHolds(cx);
  // the two holds just above his reach line, the high hand alternating each move
  const reachY = y - 240 * s * 1.6;
  const k = Math.max(0, holds.findIndex((h) => h[1] < reachY));
  const hi = holds[Math.min(holds.length - 1, k)], lo = holds[Math.max(0, k - 1)];
  const [hN, hF] = Math.floor(ph) % 2 ? [hi, lo] : [lo, hi];
  const top: V = [ROUTE[1] - 10, WALL_T + 60];
  const p = reach(FRONT({ head, fN: [44, -26 + Math.sin(ph * Math.PI) * 20], fF: [-48, 6 - Math.sin(ph * Math.PI) * 20] }), cx, y, slap ? top : hN, hF, false, s);
  return <Hero x={cx} y={y} s={s} pose={p} look={look} shadow={0} hold={(j) => <rect x={j.hip[0] - 22} y={j.hip[1] - 10} width={44} height={20} rx={6} fill="#26262c" stroke="#000" strokeWidth={2} />} />;
};
const Seg5: React.FC<{ t: number }> = ({ t }) => {
  // him: one move per beat (moving in the first half, resting in the second), floor to the top, the slap on TOP
  const n = (t / BEAT) * 1.6, st = Math.floor(n) + ease.inOut(clamp((n - Math.floor(n)) / 0.55));
  const yH = Math.max(WALL_T + 260, WALL_B - st * 105);
  const slap = t >= C.C_TOP;
  // the other: up to halfway, stops, looks up, shakes his head, climbs back down, walks off
  const yQup = Math.max(WALL_B - 640, WALL_B - st * 105);
  const yQ = t < C.C_SLIP ? yQup : t < 80 ? WALL_B - 640 : t < C.C_LAND ? lerp(WALL_B - 640, WALL_B, ease.inOut((t - 80) / (C.C_LAND - 80))) : WALL_B;
  const shake = t >= C.C_SLIP && t < 80 ? Math.sin((t - C.C_SLIP) / 2.5) * 22 : 0;
  const anchorH: V = [ROUTE[1], WALL_T - 10], anchorQ: V = [ROUTE[0], WALL_T - 10];
  return (
    <g>
      <rect x={0} y={0} width={1080} height={1920} fill="#08080b" />
      {/* the wall: plywood panels, the overhang shadow at the top, other routes' grey holds */}
      <rect x={90} y={WALL_T} width={900} height={WALL_B - WALL_T} fill="#2a2a32" stroke="#000" strokeWidth={4} />
      {Array.from({ length: 6 }, (_, i) => <line key={`v${i}`} x1={90 + i * 150} y1={WALL_T} x2={90 + i * 150} y2={WALL_B} stroke="#1c1c22" strokeWidth={3} />)}
      {Array.from({ length: 9 }, (_, i) => <line key={`h${i}`} x1={90} y1={WALL_T + i * 150} x2={990} y2={WALL_T + i * 150} stroke="#1c1c22" strokeWidth={3} />)}
      {Array.from({ length: 70 }, (_, i) => <ellipse key={i} cx={110 + rnd(i) * 860} cy={WALL_T + 20 + rnd(i + 5) * (WALL_B - WALL_T - 40)} rx={8 + rnd(i + 2) * 8} ry={6 + rnd(i + 3) * 7} fill="#4a4a52" stroke="#000" strokeWidth={1.5} />)}
      {/* the two routes, white holds; the top anchors; the TOP hold */}
      {ROUTE.map((cx, r) => routeHolds(cx).map((h, i) => <ellipse key={`${r}${i}`} cx={h[0]} cy={h[1]} rx={15} ry={12} fill="#e8e8ec" stroke="#000" strokeWidth={2.5} />))}
      {[anchorH, anchorQ].map((a, i) => <g key={i}><rect x={a[0] - 14} y={a[1] - 8} width={28} height={16} rx={4} fill="#9a9aa2" stroke="#000" strokeWidth={2} /></g>)}
      <rect x={ROUTE[1] - 48} y={WALL_T + 30} width={76} height={26} rx={5} fill={GOLD} /><text x={ROUTE[1] - 10} y={WALL_T + 50} textAnchor="middle" fontFamily={MONO} fontWeight={900} fontSize={18} fill="#1a1205">TOP</text>
      {/* the floor, the belayers holding the ropes */}
      <rect x={0} y={WALL_B} width={1080} height={280} fill="#14141a" />
      <rect x={90} y={WALL_B} width={900} height={30} fill="#2a3a52" />
      {[[ROUTE[0] - 150, anchorQ, yQ], [ROUTE[1] + 150, anchorH, yH]].map(([bx, a, y], i) => {
        const ax = a as V, cy = (y as number) - 100;
        return <g key={i}>
          <path d={`M${ax[0]} ${ax[1]} L${(i ? ROUTE[1] : ROUTE[0])} ${cy}`} stroke="#e0483e" strokeWidth={3} fill="none" />
          <path d={`M${ax[0]} ${ax[1]} L${bx as number} ${WALL_B - 110}`} stroke="#e0483e" strokeWidth={3} fill="none" />
          <Hero x={bx as number} y={WALL_B + 20} s={0.42} pose={{ ...POSES.stand(), head: -30, hN: [30, -30], hF: [24, 10] }} look={DARK} flip={!i} />
        </g>;
      })}
      {/* the climbers */}
      {t < C.C_LAND
        ? <Climber cx={ROUTE[0]} y={yQ} look={GREY} ph={t < C.C_SLIP ? n : 0} head={-30 + shake} />
        : <Hero x={ROUTE[0] + 40} y={WALL_B + 20} s={0.46} pose={EMOTE.slump()} look={GREY} />}
      <Climber cx={ROUTE[1]} y={yH} look={HERO} ph={n} slap={slap} />
      {slap && <><Glow at={[ROUTE[1] - 10, WALL_T + 50]} r={200} color={GOLD} a={0.6} /><Fx t={t} at={C.C_TOP} x={ROUTE[1] - 10} y={WALL_T + 50} r={70} c={GOLD} />
        {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={ROUTE[1] - 10 + (rnd(i) - 0.5) * (40 + (t - C.C_TOP) * 4)} cy={WALL_T + 40 + (rnd(i + 5) - 0.5) * (30 + (t - C.C_TOP) * 3)} r={8 + rnd(i + 2) * 12} fill={W} opacity={Math.max(0, 0.3 - (t - C.C_TOP) * 0.008)} />)}</>}
      {t >= C.C_SLIP && <Tag x={ROUTE[0]} y={WALL_B - 700} t="QUIT HALFWAY" c={RED} s={28} />}
      {t >= C.C_SLIP && t < 80 && <Bubble x={ROUTE[0] + 60} y={WALL_B - 780} t="Too high." a={fade(t, C.C_SLIP, 6)} />}
      <Tag x={ROUTE[1]} y={WALL_B + 90} t={slap ? "TOP · ATTEMPT #21" : "ATTEMPT #21"} c={GOLD} s={28} />
      <Header t="THE TOP IS ONE MORE TRY." c={slap ? GOLD : W} />
    </g>
  );
};

// ================================================================ 6 · the end: the trophy again, the dark gym behind it
const Seg6: React.FC<{ t: number }> = ({ t }) => {
  const z = 1 + 0.06 * clamp(t / 110);
  return (
    <g>
      <Cam z={z} c={[540, 1100]}>
        <Seg2 t={40 + t} end />
        <g opacity={0.22 * fade(t, 0, 20)}>
          <line x1={200} y1={0} x2={200} y2={420} stroke="#8a8a92" strokeWidth={4} strokeDasharray="10 6" />
          <rect x={130} y={420} width={140} height={360} rx={50} fill="#5a3a2a" />
          <rect x={760} y={420} width={260} height={320} fill="#0c1424" stroke="#5a6478" strokeWidth={8} />
        </g>
        <Rays f={t} at={[560, 1100]} a={0.3} color={GOLD} n={14} len={1100} />
      </Cam>
      <rect x={0} y={60} width={1080} height={110} fill="#000" opacity={0.8} />
      <Header t="DO IT UNTIL IT'S DONE." c={GOLD} />
    </g>
  );
};

// ================================================================ assembly: cross-dissolves, never black
const SEGS: [number, React.FC<{ t: number }>][] = [[Q.S0, Seg0], [Q.S1, Seg1], [Q.S2, Seg3], [Q.S3, Seg4], [Q.S4, Seg5], [Q.S5, Seg6]];
const XF = 8;
export const DoneFilm: React.FC<{ at?: number }> = ({ at }) => {
  const cur = useCurrentFrame();
  const f = at ?? cur;
  let k = 0; for (let i = 0; i < SEGS.length; i++) if (f >= SEGS[i][0]) k = i;
  const [start, Seg] = SEGS[k], end = k + 1 < SEGS.length ? SEGS[k + 1][0] : Q.LEN, t = f - start;
  const push = 1 + 0.025 * (t / (end - start));
  const nx = k + 1 < SEGS.length && f >= end - XF ? SEGS[k + 1] : null;
  const NextSeg = nx ? nx[1] : null;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <KitDefs />
        <Defs />
        <g transform={`translate(540 960) scale(${push}) translate(-540 -960)`}><Seg t={t} /></g>
        {NextSeg && <g opacity={clamp((f - (end - XF)) / XF)}><rect x={0} y={0} width={1080} height={1920} fill="#000" /><NextSeg t={0} /></g>}
        <Vignette a={0.3} />
        <rect x={0} y={0} width={1080} height={1920} fill="#000" opacity={1 - clamp(f / 4)} />
      </svg>
    </AbsoluteFill>
  );
};
export const DONE_BEAT = BEAT;
