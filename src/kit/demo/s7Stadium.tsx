// Scene 7 "FINISH WHAT YOU START": a stadium at night. Thousands of fans (flashes, banners), a striped pitch in perspective,
// floodlights. The hero dribbles, kicks; the camera whips with the ball (speed blur); the keeper dives; the net shakes;
// flash + shake + confetti; the stands go wild; the camera whips back to the hero celebrating; dip to black.
import React from "react";
import { V, clamp, ease, lerp, track } from "../core";
import { Hero, LOOK_GREY, POSES, RUN_STRIDE, mixPose, run } from "../hero";
import { LightPool } from "../materials";
import { Ball, Goal } from "../props";
import { Stands } from "../crowd";
import { Confetti, ImpactRing, SpeedLines } from "../fx";
import { Cam, Dip, Flash, Parallax } from "../camera";
import { Shell } from "./shared";

export const S7_LEN = 210;
const HZ = 760, GROUND = 1420, GOAL: V = [1560, 1270], KICK = 56;
const RUN_TURN = (RUN_STRIDE * 0.84) / 0.36;
const DIVE = { hip: [0, -190] as V, lean: 0, head: -6, hN: [40, -135] as V, hF: [10, -138] as V, fN: [16, 0] as V, fF: [-20, -6] as V };
const heroX = (t: number) => lerp(150, 820, ease.inOut(clamp(t / KICK)) * 0.2 + clamp(t / KICK) * 0.8);
const ballAt = (t: number): V => {
  if (t < KICK + 2) { const hx = heroX(t); return [hx + 80 + Math.abs(Math.sin(t * 0.35)) * 20, GROUND - 22]; }
  const a = clamp((t - KICK - 2) / 22);
  if (a < 1) return [lerp(heroX(KICK) + 100, GOAL[0] + 40, a), lerp(GROUND - 22, GOAL[1] - 150, a) - Math.sin(a * Math.PI) * 160];
  const b = clamp((t - KICK - 24) / 20);
  return [GOAL[0] + 40 + b * 30, lerp(GOAL[1] - 150, GOAL[1] - 22, ease.bounce(b))];
};

export const S7Stadium: React.FC<{ f: number }> = ({ f }) => {
  const t = f, hx = heroX(Math.min(t, KICK)), ball = ballAt(t), GOAL_T = KICK + 24;
  const runP = run(((heroX(Math.min(t, KICK)) - 150) / RUN_TURN) * 1.6);
  let pose = t < KICK - 6 ? runP : t < KICK ? mixPose(runP, POSES.kickLoad(), (t - KICK + 6) / 6) : t < KICK + 10 ? mixPose(POSES.kickLoad(), POSES.kick(), clamp((t - KICK) / 3)) : mixPose(POSES.kick(), POSES.stand(), clamp((t - KICK - 10) / 10));
  if (t > 112) pose = POSES.celebrate(t - 112);
  const keeperA = clamp((t - 66) / 16);
  const camX = (tt: number) => {
    if (tt < KICK) return heroX(tt) + 160;
    if (tt < 100) return lerp(heroX(KICK) + 160, ballAt(Math.min(tt, GOAL_T + 4))[0] - 60, ease.inOut(clamp((tt - KICK) / 14)));
    return lerp(ballAt(GOAL_T + 4)[0] - 60, heroX(KICK) + 40, ease.burst(clamp((tt - 106) / 18)));
  };
  const net = t >= GOAL_T ? Math.exp(-(t - GOAL_T) / 10) * Math.sin((t - GOAL_T) * 0.9) : 0;
  const wild = t > GOAL_T;
  return (
    <Shell f={f} title="FINISH WHAT YOU START" titleOut={50} bg="#06070a" vig={0.7} over={<><Flash f={t} at={GOAL_T} dur={8} /><Dip f={t} at={S7_LEN + 4} dur={16} /></>}>
      <Cam f={f} keys={[]} blur={0.5} kicks={[{ f: GOAL_T, amp: 22 }]} state={(tt) => ({
        x: camX(tt), y: track(tt, [{ f: 0, v: 1080 }, { f: KICK, v: 1060 }, { f: GOAL_T, v: 1010, e: "inOut" }, { f: 125, v: 1080, e: "burst" }]),
        z: track(tt, [{ f: 0, v: 1 }, { f: KICK, v: 1.05 }, { f: GOAL_T + 6, v: 1.2, e: "burst" }, { f: 106, v: 1.15 }, { f: 124, v: 1.1, e: "burst" }, { f: 210, v: 1.2, e: "inOut" }]),
        r: track(tt, [{ f: 0, v: 0 }, { f: KICK, v: 0 }, { f: KICK + 8, v: -4, e: "burst" }, { f: GOAL_T + 10, v: 0 }]),
      })}>
        <Parallax d={0.5} anchor={[540, 1080]}>
          <rect x={-1600} y={-600} width={5200} height={HZ + 700} fill="#07080c" />
          <Stands f={t} x={-1400} w={4800} y0={250} y1={HZ - 30} flashes={wild ? 0.03 : 0.004} seed={7} lit={wild ? 1 : 0.85} />
          {[-300, 700, 1700].map((lx, i) => <g key={i}><rect x={lx} y={80} width={150} height={44} rx={6} fill="#f0f0f0" /><LightPool cx={lx + 75} cy={100} rx={420} a={0.5} color="#ffffff" /></g>)}
        </Parallax>
        {/* the pitch: bands that get taller toward the camera */}
        {Array.from({ length: 18 }, (_, k) => {
          const y0 = HZ + 24 * k + 5.2 * k * k, y1 = HZ + 24 * (k + 1) + 5.2 * (k + 1) * (k + 1);
          return <rect key={k} x={-2500} y={y0} width={7000} height={y1 - y0 + 1} fill={k % 2 ? "#2c7d36" : "#349440"} />;
        })}
        <rect x={-2500} y={HZ} width={7000} height={1600} fill="url(#k-grass)" opacity={0.25} />
        <LightPool cx={900} cy={1100} rx={1400} ry={500} color="#e8ffe8" a={0.2} />
        <g fill="none" stroke="#f2f2f2" strokeWidth={6} opacity={0.85}>
          <path d={`M-2000 ${HZ + 70} L4000 ${HZ + 70}`} />
          <path d={`M${GOAL[0] - 560} ${GOAL[1] + 40} L${GOAL[0] - 760} ${GOAL[1] + 330} L${GOAL[0] + 800} ${GOAL[1] + 330} L${GOAL[0] + 600} ${GOAL[1] + 40}`} />
          <ellipse cx={-200} cy={1600} rx={420} ry={110} />
        </g>
        <Goal x={GOAL[0]} y={GOAL[1] + 40} s={0.95} hit={net} />
        {/* keeper: ready crouch -> stretched dive to the left (body rotates to horizontal) -> lies on the grass */}
        {keeperA < 1
          ? <Hero x={GOAL[0] - 40 - keeperA * 200} y={GOAL[1] + 40 - Math.sin(keeperA * Math.PI) * 110} pose={keeperA > 0 ? mixPose(POSES.crouch(), DIVE, clamp(keeperA * 4)) : POSES.crouch()} rot={80 * ease.out(keeperA)} flip s={0.82} look={{ ...LOOK_GREY, body: "#d0d0d0" }} shadow={0.3 * (1 - Math.sin(keeperA * Math.PI))} />
          : <Hero x={GOAL[0] - 80} y={GOAL[1] + 40} pose={{ ...POSES.lie(), hN: [-150, -20], hF: [-140, -10] }} s={0.82} look={{ ...LOOK_GREY, body: "#d0d0d0" }} shadow={0.3} />}
        {t > KICK + 2 && t < GOAL_T && <SpeedLines f={t} at={ball} dir={-15} n={7} len={200} spread={60} a={0.6} />}
        <Ball x={ball[0]} y={ball[1]} r={24} spin={t * 22} />
        <ImpactRing f={t} f0={KICK} at={[hx + 90, GROUND - 22]} size={90} />
        <Hero x={hx} y={GROUND} pose={pose} s={1} />
        {wild && <Confetti f={t} f0={GOAL_T} at={[GOAL[0], GOAL[1] - 300]} n={70} seed={4} />}
        {t > 112 && <Confetti f={t} f0={114} at={[hx, GROUND - 600]} n={50} seed={9} />}
      </Cam>
    </Shell>
  );
};
