// PressureFilm: "Pressure makes diamonds." 32 s (960 frames), 1080x1920, 30 fps. Two lanes all film: top = avoids pressure,
// bottom = trains under it. Human scenes (the penalty, the exam, the interview) alternate with object scenes (the coal under
// the press, the anvil). Every time number lives in events.ts; the stills in Frames3.tsx are the approved look.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { V, clamp, ease, lerp } from "../../kit/core";
import { Hero, HeroLook, POSES, Pose, mixPose, run } from "../../kit/hero";
import { KitDefs, Vignette } from "../../kit/materials";
import { Glow } from "../../kit/fx";
import { EMOTE } from "../../kit/acting";
import { BOLD, Defs, GOLD, SANS } from "../samehours/StyleFrames";
import {
  BigCrowd, Beams, Big, BoxLines2, Bubble, Ball, Cone, Counter, EmptySeats, ExamRoom2, FOCUSED, FanPitch, ForgeLane, GOAL_MOUTH,
  GREYL, GREEN, Glove, Goal2, HandLane, Hit, InterviewPracticeLane, InterviewRealLane, J, KEEP_DIVE, KEEP_READY, KICK_LOW, KICK_OVER,
  KS, Lanes, P0, PRESSURED, PressLane, RED, RainLines, Referee, ResultLane, SHOUTER, SPOT, STAND, Shake, Shout, StudyLane, Sweat, W,
  G1, G2, goalLine,
} from "./Frames3";
import { C, Q } from "./events";

export const PRESSURE_FILM_FRAMES = Q.LEN;
const mix = (a: Pose, b: Pose, u: number) => mixPose(a, b, ease.inOut(clamp(u)));
const fade = (t: number, a: number, d = 8) => clamp((t - a) / d);
const XF = 8;
/** a cross-dissolve inside a segment: draw A until `at`, B from `at`, blended over XF frames */
const Switch: React.FC<{ t: number; at: number; a: React.ReactNode; b: React.ReactNode }> = ({ t, at, a, b }) => {
  const u = clamp((t - at) / XF);
  return <g>{u < 1 && a}{u > 0 && <g opacity={u}><rect x={0} y={0} width={1080} height={1920} fill="#000" />{b}</g>}</g>;
};
const keeperLook: HeroLook = { ...GREYL, body: "#c9a640", far: "#8a7230" };
const gloves = (j: { wN: V; wF: V }) => <g>{Glove(j.wN)}{Glove(j.wF)}</g>;
/** quadratic bezier point */
const qb = (a: V, c: V, b: V, u: number): V => [(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1]];
/** the run-up and the kick: root x and pose at time k (k = 0 at the start of the run, the foot meets the ball at kick) */
const kickRun = (k: number, x0: number, x1: number, kick: number, follow: Pose): { x: number; pose: Pose } => {
  if (k < 0) return { x: x0, pose: STAND };
  const runEnd = kick - 6;
  if (k < runEnd) { const u = k / runEnd, x = lerp(x0, x1 - 30, ease.inOut(u)); return { x, pose: { ...run(k * 0.09), lean: 14 } }; }
  if (k < kick) return { x: lerp(x1 - 30, x1, (k - runEnd) / 6), pose: mix(run(runEnd * 0.09), POSES.kickLoad(), (k - runEnd) / 6) };
  return { x: x1, pose: mix(POSES.kickLoad(), follow, (k - kick) / 5) };
};

// ================================================================ 1 · the penalty
const PracticeKick: React.FC<{ g: number; good: boolean; t: number }> = ({ g, good, t }) => {
  const sp = SPOT(g), { fp, bp } = GOAL_MOUTH(g), kpx = (fp[0] + bp[0]) / 2 - 6, kpy = (fp[1] + bp[1]) / 2 + 6;
  const k = kickRun(t + 2, sp[0] - 260, sp[0] - 30, C.P_KICK1 + 2, KICK_LOW);
  // the ball: on the spot, then to the net (top) or to the keeper's glove and away (bottom)
  const fly = clamp((t - C.P_KICK1) / 14);
  let ball: V = [sp[0], sp[1] - 12];
  if (t > C.P_KICK1) {
    if (!good) ball = qb([sp[0], sp[1] - 12], [fp[0] - 150, fp[1] - 260], [fp[0] + 80, fp[1] - 150], fly);
    else {
      const glove: V = [kpx - 250, kpy - 236];
      ball = fly < 1 ? qb([sp[0], sp[1] - 12], [sp[0] + 160, kpy - 300], glove, fly) : qb(glove, [glove[0] - 60, glove[1] - 120], [glove[0] - 200, glove[1] - 60], clamp((t - C.P_KICK1 - 14) / 12));
    }
  }
  const dive = clamp((t - (C.P_KICK1 + 2)) / 10);
  const scored = !good && t > C.P_KICK1 + 14;
  return (
    <g>
      <rect x={0} y={g - 560} width={1080} height={730} fill="#0a0e15" />
      <EmptySeats g={g} />
      <FanPitch g={g} night />
      <BoxLines2 g={g} />
      <Goal2 g={g} bulge={scored ? Math.max(0, 1 - (t - C.P_KICK1 - 14) / 14) : 0} />
      {!good && Array.from({ length: 9 }, (_, i) => <Ball key={i} x={fp[0] + 40 + (i % 4) * 28} y={fp[1] - 8 - Math.floor(i / 4) * 20 - (i % 4) * 6} r={12} />)}
      {good && <Hero x={lerp(kpx, kpx - 30, ease.out(dive))} y={lerp(kpy, kpy - 40, ease.out(dive))} s={0.7} look={keeperLook} pose={mix(KEEP_READY, KEEP_DIVE, dive)} flip rot={52 * ease.out(dive)} shadow={0} hold={gloves} />}
      {good && <Hit t={0} at={0} x={kpx - 250} y={kpy - 236} />}
      {good && <>{[[110, g + 70], [170, g + 90], [470, g + 80]].map(([x, y], i) => <Cone key={i} x={x} y={y} />)}{[[520, g - 120], [210, g - 150], [880, g + 60]].map(([x, y], i) => <Ball key={i} x={x} y={y} r={12} />)}
        {[0, 1, 2].map((i) => { const x = 60 + i * 70, y = g - 110, bob = Math.abs(Math.sin((t + i * 5) * 0.35)), p = { ...SHOUTER, lean: -4 + i * 3, hN: [18, -60 - bob * 16] as V, hF: [6, -56 - bob * 16] as V }, jj = J(x, y, p, false, 0.6); return <g key={i}><Hero x={x} y={y} s={0.6} look={GREYL} pose={p} shadow={0.15} /><Shout at={[jj.head[0] + 14, jj.head[1]]} /></g>; })}</>}
      <Ball x={ball[0]} y={ball[1]} r={13} rot={t * 20} />
      <Hero x={k.x} y={g} s={KS} look={BOLD} pose={k.pose} />
      {good && <g transform={`translate(0 ${(t * 14) % 26})`}><RainLines g={g} /></g>}
      <Beams g={g} a={0.05} />
      <Counter x={900} y={g - 400} n={good ? "4/10" : scored ? "10/10" : "9/10"} c={good ? RED : GREEN} k="PRACTICE" />
    </g>
  );
};
const FinalKick: React.FC<{ g: number; good: boolean; t: number }> = ({ g, good, t }) => {
  // t = frames since the final began
  const sp = SPOT(g), kx = sp[0] - 120, { fp, bp } = GOAL_MOUTH(g), kpx = (fp[0] + bp[0]) / 2 - 6, kpy = (fp[1] + bp[1]) / 2 + 6;
  const runAt = C.P_RUN - C.P_FINAL, kickAt = C.P_KICK - C.P_FINAL, inAt = C.P_IN - C.P_FINAL;
  let kickerX = kx, kpose: Pose;
  const breathe = Math.sin(t * 0.18);
  if (t < runAt) {
    kpose = good ? { ...FOCUSED, hip: [0, -FOCUSED.hip[1] * -1 + breathe * 2] as V } : { ...PRESSURED, hip: [Math.sin(t * 2.7) * 2.5, PRESSURED.hip[1]] as V, head: PRESSURED.head + Math.sin(t * 0.5) * 4 };
    if (good) kpose = { ...FOCUSED, hip: [FOCUSED.hip[0], FOCUSED.hip[1] - breathe * 3] };
  } else {
    const k = kickRun(t - runAt, kx, good ? sp[0] - 30 : sp[0] - 40, kickAt - runAt, good ? KICK_LOW : KICK_OVER);
    kickerX = k.x; kpose = k.pose;
    if (t > inAt + 2) kpose = good ? mix(KICK_LOW, { ...EMOTE.armsWide(), lean: -8 }, (t - inAt - 2) / 8) : mix(KICK_OVER, EMOTE.handsOnHead(), (t - inAt - 2) / 10);
    if (good && t > inAt + 10) kickerX = kickerX + Math.min(60, (t - inAt - 10) * 3);
  }
  const jump = good && t > inAt + 12 ? Math.abs(Math.sin((t - inAt - 12) * 0.3)) * 30 : 0;
  // the ball
  let ball: V = [sp[0], sp[1] - 12];
  const fly = clamp((t - kickAt) / (inAt - kickAt));
  if (t > kickAt) ball = good ? qb([sp[0], sp[1] - 12], [fp[0] - 220, fp[1] - 360], [fp[0] + 20, fp[1] - 230], fly) : qb([sp[0], sp[1] - 12], [fp[0] - 200, g - 600], [fp[0] + 60, g - 540], fly);
  // the keeper: sways on his line, then dives the wrong way when the ball goes in
  const sway = Math.sin(t * 0.14) * 12, dive = clamp((t - kickAt - 2) / 10);
  const keeper = good
    ? <Hero x={lerp(kpx + sway, kpx - 30, ease.out(dive))} y={lerp(kpy, kpy - 40, ease.out(dive))} s={0.7} look={keeperLook} pose={mix({ ...KEEP_READY, hN: [80, -40], hF: [70, -30] }, KEEP_DIVE, dive)} flip rot={58 * ease.out(dive)} shadow={0} hold={gloves} />
    : <Hero x={kpx + sway * (1 - clamp((t - kickAt) / 6))} y={kpy} s={0.7} look={keeperLook} pose={mix({ ...KEEP_READY, hN: [80, -40], hF: [70, -30] }, { ...KEEP_READY, head: -30 }, clamp((t - kickAt) / 8))} flip hold={gloves} />;
  const goal = good && t > inAt;
  const cheer = goal ? 0.92 : 0.4;
  // a slow push toward the kicker while he waits (the tension), released at the kick
  const push = t < runAt ? 1 + 0.06 * ease.inOut(t / runAt) : 1.06 - 0.06 * ease.out(clamp((t - runAt) / 12));
  const kj = J(kickerX, g, kpose, false, KS);
  return (
    <g>
      <rect x={0} y={g - 560} width={1080} height={730} fill="#08080b" />
      <g transform={`translate(${kx} ${g - 150}) scale(${push}) translate(${-kx} ${-(g - 150)})`}>
        <BigCrowd g={g} cheer={cheer} />
        <FanPitch g={g} />
        <BoxLines2 g={g} />
        <g>{Array.from({ length: 6 }, (_, i) => { const x = 60 + i * 44, y = P0(g) + 50; const up = goal && i % 2 === 0; const b = goal ? Math.abs(Math.sin((t + i * 4) * 0.4)) * 10 : 0; const p: Pose = up ? { ...STAND, head: -16, hN: [30, -120], hF: [-20, -116], elbow: -1 } : { ...STAND, lean: 4, head: 14, hN: [62, -14], hF: [-62, -14], elbow: 1 }; return <Hero key={i} x={x} y={y - b} s={0.34} look={{ ...GREYL, body: "#8a8a94", far: "#6a6a72" }} pose={p} shadow={0.15} />; })}</g>
        <Referee x={goalLine(g, 0.2)[0] + 60} y={goalLine(g, 0.2)[1] + 10} s={0.42} />
        <Goal2 g={g} bulge={goal ? Math.max(0, 1 - (t - inAt) / 16) : 0} />
        {keeper}
        <Ball x={ball[0]} y={ball[1]} r={13} rot={t * 24} />
        {goal && <Glow at={[fp[0] + 20, fp[1] - 230]} r={220} color={GOLD} a={0.35 * clamp((t - inAt) / 6)} />}
        <Hero x={kickerX} y={g - jump} s={KS} look={BOLD} pose={kpose} />
        {!good && t < runAt && <><Shake at={[kj.aN[0], kj.aN[1] - 40]} r={26} /><Shake at={[kj.aF[0], kj.aF[1] - 40]} r={26} /><g transform={`translate(0 ${(t * 1.4) % 16})`}><Sweat at={kj.head} /></g></>}
        {good && t < runAt && <path d={`M${kj.head[0] + 10} ${kj.head[1] + 14} L${sp[0] - 4} ${sp[1] - 18}`} stroke={GOLD} strokeWidth={2.5} strokeDasharray="4 8" opacity={0.75} />}
        <Beams g={g} a={0.07} />
      </g>
      <g transform={`translate(540 ${g - 530})`}><rect x={-130} y={-30} width={260} height={62} rx={8} fill="#0b0b0e" stroke="#4a4a52" strokeWidth={3} /><text x={-50} y={14} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={40} fill="#ffd25a">{goal ? "1–0" : "0–0"}</text><text x={62} y={12} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={30} fill={W}>90+4'</text></g>
      {goal && <g transform={`translate(250 ${g + 80}) scale(${0.7 + 0.3 * ease.back(clamp((t - inAt - 4) / 10))}) translate(-250 ${-(g + 80)})`} opacity={fade(t, inAt + 4, 4)}><Big x={250} y={g + 110} t="GOAL" c={GOLD} s={96} /></g>}
    </g>
  );
};
const Seg1: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Switch t={t} at={C.P_FINAL} a={<><PracticeKick g={G1} good={false} t={t} /><PracticeKick g={G2} good t={t} /></>} b={<><FinalKick g={G1} good={false} t={t - C.P_FINAL} /><FinalKick g={G2} good t={t - C.P_FINAL} /></>} />
    <Lanes />
    {t < C.P_FINAL + 4 && <g opacity={1 - fade(t, C.P_FINAL - 4, 6)}>
      <text x={540} y={92} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={50} fill={W}>10 out of 10 in practice.</text>
      <text x={540} y={150} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={54} fill={GOLD}>Who scores?</text>
    </g>}
    {t > C.P_BUBBLE && t < C.P_RUN && <g opacity={fade(t, C.P_BUBBLE, 6) * (1 - fade(t, C.P_RUN - 8, 8))}><Bubble x={320} y={440} t="Everyone's watching." tail={[250, 560]} /></g>}
  </>
);

// ================================================================ 2 · the coal under the press
const Seg2: React.FC<{ t: number }> = ({ t }) => {
  const pillow = ease.out(clamp(t / C.C_PILLOW));
  const blocks = clamp((t - C.C_B1) / 10) + clamp((t - C.C_B2) / 10) + clamp((t - C.C_B3) / 10);
  const gauge = ease.inOut(clamp((t - C.C_B1) / (C.C_B3 + 16 - C.C_B1)));
  const lift = ease.inOut(clamp((t - C.C_LIFT0) / (C.C_LIFT1 - C.C_LIFT0)));
  const shake = [C.C_B1, C.C_B2, C.C_B3].reduce((s, at) => s + (t > at + 10 && t < at + 16 ? Math.sin((t - at) * 3) * 6 * (1 - (t - at - 10) / 6) : 0), 0);
  return (
    <>
      <PressLane g={G1} heavy={false} open={false} anim={{ pillow, blocks: 0, gauge: 0, lift, t }} />
      <g transform={`translate(0 ${shake})`}><PressLane g={G2} heavy open={false} anim={{ pillow: 1, blocks, gauge, lift, t }} /></g>
      <Lanes />
    </>
  );
};

// ================================================================ 3 · the exam
const Seg3: React.FC<{ t: number }> = ({ t }) => {
  const marksTop = Math.floor(clamp(t / 40) * 5), marksBot = Math.floor(clamp(t / 46) * 10);
  const te = t - C.X_EXAM, ansTop = Math.min(3, Math.floor(clamp(te / 70) * 3.4)), ansBot = Math.min(18, Math.floor(clamp(te / 66) * 18));
  const pop = ease.back(clamp((t - C.X_POP) / 10));
  return (
    <>
      <Switch t={t} at={C.X_EXAM} a={<><StudyLane g={G1} hard={false} marks={marksTop} t={t} /><StudyLane g={G2} hard marks={marksBot} t={t} /></>}
        b={<Switch t={t} at={C.X_RESULT} a={<><ExamRoom2 g={G1} good={false} answered={ansTop} t={t} bubble={fade(t, C.X_BUBBLE, 6)} /><ExamRoom2 g={G2} good answered={ansBot} t={t} /></>}
          b={<><ResultLane g={G1} good={false} pop={pop} /><ResultLane g={G2} good pop={pop} /></>} />} />
      <Lanes />
    </>
  );
};

// ================================================================ 4 · the anvil
const Seg4: React.FC<{ t: number }> = ({ t }) => {
  const k = Math.max(0, (t - C.F_HIT0) / C.F_HIT), phase = k - Math.floor(k);
  const hits = Math.min(48, Math.floor(Math.pow(clamp((t - C.F_HIT0) / (C.F_LATER - C.F_HIT0)), 1.6) * 48) + (t > C.F_HIT0 ? 1 : 0));
  const reveal = ease.inOut(clamp((t - C.F_LATER - 4) / 14));
  return (
    <>
      <Switch t={t} at={C.F_LATER} a={<><ForgeLane g={G1} hit={false} later={false} /><ForgeLane g={G2} hit later={false} phase={phase} hits={hits} /></>}
        b={<><ForgeLane g={G1} hit={false} later reveal={reveal} /><ForgeLane g={G2} hit later reveal={reveal} /></>} />
      <Lanes />
    </>
  );
};

// ================================================================ 5 · the interview
const Seg5: React.FC<{ t: number }> = ({ t }) => {
  const stamp = ease.out(clamp((t - C.I_STAMP) / 6));
  return (
    <>
      <Switch t={t} at={C.I_REAL} a={<><InterviewPracticeLane g={G1} hard={false} t={t} /><InterviewPracticeLane g={G2} hard t={t} /></>}
        b={<><InterviewRealLane g={G1} good={false} t={t} um={fade(t, C.I_UM, 6)} /><InterviewRealLane g={G2} good t={t} stamp={stamp} /></>} />
      <Lanes />
    </>
  );
};

// ================================================================ 6 · the end
const Seg6: React.FC<{ t: number }> = ({ t }) => (
  <>
    <HandLane g={G1} diamond={false} />
    <HandLane g={G2} diamond />
    <Lanes />
    <g opacity={fade(t, C.E_T1, 8)}><text x={540} y={1790} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={64} fill={W}>Pressure makes diamonds.</text></g>
    <g opacity={fade(t, C.E_T2, 8)}><text x={540} y={1866} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={58} fill={GOLD}>Train under it.</text></g>
  </>
);

// ================================================================ assembly: cross-dissolves between segments, never black
const SEGS: [number, React.FC<{ t: number }>][] = [[Q.S1, Seg1], [Q.S2, Seg2], [Q.S3, Seg3], [Q.S4, Seg4], [Q.S5, Seg5], [Q.S6, Seg6]];
export const PressureFilm: React.FC<{ at?: number }> = ({ at }) => {
  const cur = useCurrentFrame();
  const f = at ?? cur;
  let k = 0; for (let i = 0; i < SEGS.length; i++) if (f >= SEGS[i][0]) k = i;
  const [start, Seg] = SEGS[k], end = k + 1 < SEGS.length ? SEGS[k + 1][0] : Q.LEN, t = f - start;
  const nx = k + 1 < SEGS.length && f >= end - XF ? SEGS[k + 1] : null;
  const NextSeg = nx ? nx[1] : null;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <KitDefs /><Defs />
        <defs>
          <linearGradient id="pr3-steel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c4c6cc" /><stop offset="1" stopColor="#5a5c64" /></linearGradient>
          <linearGradient id="pr3-coil" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#7a7c84" /><stop offset="0.5" stopColor="#e4e6ec" /><stop offset="1" stopColor="#6a6c74" /></linearGradient>
          <linearGradient id="pr3-dawn" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffcf6a" stopOpacity={0.45} /><stop offset="1" stopColor="#000" stopOpacity={0} /></linearGradient>
          <linearGradient id="pr2-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a87a46" /><stop offset="1" stopColor="#6a4a28" /></linearGradient>
        </defs>
        <Seg t={t} />
        {NextSeg && <g opacity={clamp((f - (end - XF)) / XF)}><rect x={0} y={0} width={1080} height={1920} fill="#000" /><NextSeg t={0} /></g>}
        <Vignette a={0.3} />
      </svg>
    </AbsoluteFill>
  );
};
