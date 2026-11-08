// Scene 2 "EARN EVERY STEP": a brick wall at night. A grey figure sits on a money pile throwing bills; the white hero hops up glowing
// slabs that appear one by one to a flag. Camera tilts up step by step (burst eases), ends with a whip up (motion blur) into scene 3.
import React from "react";
import { clamp, ease, lerp, prog } from "../core";
import { Hero, LOOK_GREY, POSES, mixPose } from "../hero";
import { LightPool, Shade, Surface } from "../materials";
import { Flag, MoneyPile, Slabs } from "../props";
import { Money, Sparkle, Confetti } from "../fx";
import { Cam } from "../camera";
import { Shell } from "./shared";

export const S2_LEN = 200;
const FLOOR = 1500, SX = 760, GAP = 150, N = 11, HOP = 13, T0 = 22;
const slabTop = (k: number) => (k < 0 ? FLOOR : FLOOR - 120 - k * GAP - 10);

/** hero on level k (-1 = floor); hop k goes from level k-1 to level k during [T0 + k*HOP, T0 + (k+1)*HOP) */
const heroAt = (t: number) => {
  const k = Math.floor((t - T0) / HOP);
  if (k < 0) return { y: FLOOR, pose: POSES.idle(t), lift: 0, level: -1 };
  if (k >= N) { const c = t - (T0 + N * HOP); return { y: slabTop(N - 1), pose: c < 6 ? mixPose(POSES.jumpLoad(), POSES.armsUp(), c / 6) : POSES.celebrate(c), lift: 0, level: N - 1 }; }
  const a = (t - T0 - k * HOP) / HOP;
  const y0 = slabTop(k - 1), y1 = slabTop(k);
  const y = lerp(y0, y1, ease.inOut(a)), lift = Math.sin(a * Math.PI) * 70;
  const pose = a < 0.2 ? mixPose(POSES.stand(), POSES.jumpLoad(), a / 0.2) : a < 0.75 ? mixPose(POSES.jumpLoad(), POSES.tuck(), (a - 0.2) / 0.55) : mixPose(POSES.tuck(), POSES.stand(), (a - 0.75) / 0.25);
  return { y, pose, lift, level: k };
};

export const S2Wall: React.FC<{ f: number }> = ({ f }) => {
  const t = f, h = heroAt(t);
  const camY = (tt: number) => {
    const hh = heroAt(tt - 4);
    const base = Math.min(1080, hh.y - 330);
    return base - prog(tt, 186, 200, "in") * 2600; // whip up at the end
  };
  const slabP = clamp((t - 8) / (T0 + N * HOP - 18)) ;
  return (
    <Shell f={f} title="EARN EVERY STEP" titleOut={60} bg="#0a0708">
      <Cam f={f} keys={[]} state={(tt) => ({ x: lerp(540, 640, prog(tt, 10, 40)), y: camY(tt), z: lerp(0.92, 1.08, prog(tt, 10, 60)), r: 0 })} blur={0.6} drift={3}>
        <Surface mat="brick" x={-600} y={-2000} w={2400} h={FLOOR + 2000} tint="#3a2a5a" tintA={0.55} dark={0.2} />
        <Shade y={-2000} h={1200} from={0.85} to={0} x={-600} w={2400} />
        <LightPool cx={SX} cy={h.y - 200} rx={420} ry={520} color="#ffe8c0" a={0.28} />
        <LightPool cx={240} cy={FLOOR - 250} rx={380} color="#7dffa0" a={0.12} />
        <rect x={-600} y={FLOOR} width={2400} height={900} fill="url(#k-concrete)" />
        <rect x={-600} y={FLOOR} width={2400} height={900} fill="#000" opacity={0.6} />
        <Slabs x={SX} y={FLOOR - 120} n={N} gap={GAP} p={slabP} f={t} w={90} />
        <Flag x={SX + 110} y={slabTop(N - 1) + 60} f={t} s={0.8} pole={200} />
        <MoneyPile x={240} y={FLOOR} w={420} h={210} f={t} />
        <Hero x={250} y={FLOOR - 196} pose={mixPose(POSES.sit(10), POSES.throw(), Math.max(0, Math.sin(t * 0.18)))} look={LOOK_GREY} s={0.95} shadow={0} />
        {[10, 46, 82, 118, 154].map((f0, i) => <Money key={i} f={t} f0={f0} at={[300, FLOOR - 400]} n={10} seed={i + 2} up={10} />)}
        <Hero x={SX} y={h.y - h.lift} pose={h.pose} s={0.82} shadow={h.lift > 5 ? 0 : 0.4} />
        {t > T0 + N * HOP && <Confetti f={t} f0={T0 + N * HOP} at={[SX, slabTop(N - 1) - 200]} n={50} />}
        <Sparkle f={t} at={[SX + 140, slabTop(N - 1) - 120]} s={1.2} />
      </Cam>
    </Shell>
  );
};
