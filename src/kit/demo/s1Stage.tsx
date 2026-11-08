// Scene 1 "KEEP MOVING": a dark stage. Idle -> walk -> run (speed lines) -> jump over a rock -> land (shake, ring, dust) -> celebrate.
// Camera follows with a lag; far pillars move at 40 % (parallax); the floor reflects everything.
import React from "react";
import { clamp, prog, V } from "../core";
import { Hero, POSES, Pose, RUN_STRIDE, STRIDE, jump, mixPose, run, walk } from "../hero";
import { Reflect, Spot, Surface } from "../materials";
import { Rock } from "../props";
import { Dust, ImpactRing, Motes, SpeedLines } from "../fx";
import { Cam, Parallax } from "../camera";
import { Shell } from "./shared";

export const S1_LEN = 150;
const FLOOR = 1350;
const RUN_TURN = (RUN_STRIDE * 0.84) / 0.36;

const speed = (i: number) => {
  if (i < 20) return 0;
  if (i < 60) return 5 * clamp((i - 20) / 6);
  if (i < 90) return 5 + 13 * clamp((i - 60) / 8);
  if (i < 120) return 16;
  if (i < 134) return 16 * (1 - (i - 120) / 14);
  return 0;
};
const XS: number[] = (() => { const a = [300]; for (let i = 0; i < S1_LEN + 20; i++) a.push(a[i] + speed(i)); return a; })();
const heroX = (t: number) => XS[Math.max(0, Math.min(XS.length - 1, Math.floor(t)))];

const heroAt = (t: number): { pose: Pose; lift: number } => {
  const x = heroX(t);
  if (t < 20) return { pose: POSES.idle(t), lift: 0 };
  const w = walk((x - XS[20]) / (2 * STRIDE));
  if (t < 60) return { pose: mixPose(POSES.idle(t), w, clamp((t - 20) / 6)), lift: 0 };
  const r = run((x - XS[60]) / RUN_TURN);
  if (t < 90) return { pose: mixPose(w, r, clamp((t - 60) / 8)), lift: 0 };
  if (t < 120) { const j = jump(8 + (t - 90), 38, 230); return { pose: t < 93 ? mixPose(r, j.pose, (t - 90) / 3) : j.pose, lift: j.lift }; }
  if (t < 134) return jump(38 + (t - 120) * 0.75, 38, 230);
  return { pose: mixPose(POSES.stand(), POSES.celebrate(t - 134), clamp((t - 134) / 5)), lift: 0 };
};

export const S1Stage: React.FC<{ f: number }> = ({ f }) => {
  const t = f, x = heroX(t), h = heroAt(t), ROCK = 1180;
  const camX = (tt: number) => heroX(Math.max(0, tt - 6)) + 140;
  const world = (
    <g>
      <Rock x={ROCK} y={FLOOR} w={190} h={90} seed={7} />
      <Hero x={x} y={FLOOR - h.lift} pose={h.pose} s={1} shadow={0.4 * (1 - clamp(h.lift / 250))} />
    </g>
  );
  return (
    <Shell f={f} title="KEEP MOVING" titleOut={135}>
      <Cam f={f} keys={[]} state={(tt) => ({ x: camX(tt), y: 1080 - prog(tt, 110, 125, "out") * 30, z: 1.05 + prog(tt, 128, 150, "out") * 0.15, r: 0 })} kicks={[{ f: 120, amp: 16 }]} blur={0.25}>
        <Parallax d={0.4} anchor={[540, 1080]}>
          {Array.from({ length: 9 }, (_, i) => <Surface key={i} mat="stone" x={-300 + i * 420} y={180} w={110} h={FLOOR - 180} tint="#101018" tintA={0.85} dark={0.6} />)}
        </Parallax>
        <rect x={-2000} y={FLOOR} width={6000} height={900} fill="#0e0e12" />
        <line x1={-2000} y1={FLOOR} x2={4000} y2={FLOOR} stroke="#2a2a32" strokeWidth={2} />
        <Spot x={x + 40} floorY={FLOOR} spread={320} a={0.2} top={-200} />
        <Reflect y={FLOOR} a={0.35}>{world}</Reflect>
        {world}
        {t >= 70 && t < 118 && <SpeedLines f={t} at={[x - 30, FLOOR - 200]} n={9} len={260} spread={240} a={0.55 * clamp((t - 70) / 6) * (1 - clamp((t - 110) / 8))} />}
        <Dust f={t} f0={92} at={[heroX(92), FLOOR - 4] as V} n={8} />
        <Dust f={t} f0={120} at={[heroX(120), FLOOR - 4] as V} n={14} seed={4} />
        <ImpactRing f={t} f0={120} at={[heroX(120), FLOOR]} size={220} />
        <Motes f={t} x={x - 300} y={500} w={700} h={850} n={30} a={0.45} />
      </Cam>
    </Shell>
  );
};
