// Scene 4 "ENJOY THE SMALL THINGS": a farm at sunrise (the colour scene). Layered hills (parallax), a swaying tree, a grazing sheep,
// a horse running far away, birds crossing. The hero throws a ball, the dog runs after it, the ball rolls into the pond (ground
// cut-away with water and fish), a fish jumps. The camera follows the ball, settles, then bursts in on the fish.
import React from "react";
import { V, clamp, ease, lerp, prog } from "../core";
import { Hero, POSES, mixPose } from "../hero";
import { LightPool, MAT, Shade, Water } from "../materials";
import { Ball, Cloud, Fence, GrassTufts, Hills, Sun, Tree } from "../props";
import { Animal, Bird, Fish, gaitPhase } from "../animals";
import { ImpactRing, Particles } from "../fx";
import { Cam, Dip, Parallax } from "../camera";
import { Shell } from "./shared";

export const S4_LEN = 200;
const G = 1300, POND: [number, number] = [1250, 2250], DEEP = 520;

const ballAt = (t: number): V => {
  if (t < 24) return [330, G - 300];
  if (t < 56) { const a = (t - 24) / 32; return [lerp(330, 1100, a), lerp(G - 300, G - 22, a) - Math.sin(a * Math.PI) * 380]; }
  if (t < 70) { const a = (t - 56) / 14; return [lerp(1100, 1230, a), G - 22 - Math.sin(a * Math.PI) * 110]; }
  if (t < 80) { const a = (t - 70) / 10; return [lerp(1230, 1330, a), G - 22 + a * a * 52]; }
  return [Math.min(1460, 1330 + (t - 80) * 1.1), G + 22 + Math.sin(t * 0.15) * 4];
};
const dogSpeed = (i: number) => (i < 26 ? 0 : Math.min(14, (i - 26) * 1.6));
const DOGX: number[] = (() => { const a = [380]; for (let i = 0; i < S4_LEN + 5; i++) a.push(Math.min(1150, a[i] + dogSpeed(i))); return a; })();
const fishJump = (t: number): { p: V; rot: number } | null => {
  const a = (t - 118) / 30; if (a < 0 || a > 1) return null;
  const x = lerp(1700, 1880, a), y = G + 70 - Math.sin(a * Math.PI) * 330, dy = -Math.cos(a * Math.PI) * 330 * Math.PI, dx = 180;
  return { p: [x, y], rot: (Math.atan2(dy, dx) * 180) / Math.PI };
};
const drop = (p: { x: number; y: number; a: number; s: number }) => <circle cx={p.x} cy={p.y} r={6 * p.s} fill="#cfeaff" stroke="#0b0b0d" strokeWidth={2} opacity={p.a} />;

export const S4Farm: React.FC<{ f: number }> = ({ f }) => {
  const t = f;
  const dogX = DOGX[Math.min(DOGX.length - 1, t)], dogMoving = dogSpeed(t) > 0 && dogX < 1150;
  const throwA = prog(t, 12, 22, "inOut") * (1 - prog(t, 28, 40));
  const heroPose = t < 12 ? POSES.idle(t) : mixPose(mixPose(POSES.stand(), POSES.throw(), throwA), POSES.point(), prog(t, 40, 52));
  const b = ballAt(t), fj = fishJump(t);
  return (
    <Shell f={f} title="ENJOY THE SMALL THINGS" titleOut={110} bg="#1a1830" vig={0.55} over={<Dip f={t} at={S4_LEN} dur={12} />}>
      <Cam f={f} drift={2} blur={0.5} keys={[
        { f: 0, x: 560, y: 1060, z: 0.95 }, { f: 24, x: 580, y: 1060, z: 0.95 },
        { f: 60, x: 1050, y: 1020, z: 1.0, e: "inOut" }, { f: 84, x: 1350, y: 1120, z: 1.05, e: "burst" },
        { f: 116, x: 1420, y: 1120, z: 1.08, e: "inOut" }, { f: 128, x: 1790, y: 1080, z: 1.35, e: "burst" },
        { f: 165, x: 1700, y: 1090, z: 1.2, e: "inOut" }, { f: 200, x: 1600, y: 1090, z: 1.12, e: "inOut" },
      ]}>
        {/* sky glued to the screen, sun and hills in parallax */}
        <Parallax d={0} anchor={[540, 1060]}>
          <defs><linearGradient id="s4sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1d2350" /><stop offset="55%" stopColor="#c06a7a" /><stop offset="100%" stopColor="#ffb86a" /></linearGradient></defs>
          <rect x={-2000} y={-1000} width={6000} height={3400} fill="url(#s4sky)" />
          <Sun x={760} y={lerp(1180, 860, prog(t, 0, 200, "out"))} r={70} f={t} color="#ffd890" />
          <Cloud x={200} y={520} s={1.2} a={0.25} color="#ffd9e0" /><Cloud x={900} y={420} s={0.8} a={0.2} color="#ffd9e0" />
        </Parallax>
        <Parallax d={0.2} anchor={[540, 1060]}><Hills y={1140} amp={220} color="#4a3a6a" seed={4} peaks /></Parallax>
        <Parallax d={0.45} anchor={[540, 1060]}>
          <Hills y={1220} amp={120} color="#3a3058" seed={9} />
          <Animal kind="horse" x={-300 + t * 9} y={1205} s={0.32} pose="run" phase={gaitPhase(t, 9 / 0.32, "horse", true)} f={t} look={{ body: "#cfc8e0", far: "#9a92b0", glow: 0 }} shadow={0} />
        </Parallax>
        <Parallax d={0.7} anchor={[540, 1060]}>
          {[0, 1, 2].map((i) => <Bird key={i} x={-300 + t * 7 + i * 110} y={560 + i * 40 + Math.sin(t * 0.08 + i) * 14} s={0.5 - i * 0.06} flap={t * 0.11 + i * 0.3} />)}
        </Parallax>
        <LightPool cx={760} cy={1100} rx={900} ry={500} color="#ffb070" a={0.35} />
        {/* ground with a cut-away pond */}
        <path d={`M-1200 ${G} L${POND[0]} ${G} Q${POND[0] + 60} ${G + DEEP} ${POND[0] + 260} ${G + DEEP} L${POND[1] - 260} ${G + DEEP} Q${POND[1] - 60} ${G + DEEP} ${POND[1]} ${G} L4000 ${G} L4000 3000 L-1200 3000 Z`} fill={MAT.soil} />
        <rect x={-1200} y={G} width={POND[0] + 1200} height={46} fill={MAT.grass} /><rect x={POND[1]} y={G} width={1800} height={46} fill={MAT.grass} />
        <Shade y={G + 40} h={800} from={0.15} to={0.8} x={-1200} w={5200} />
        <Fence x={-700} y={G + 6} w={1880} color="#4a4048" />
        <Tree x={-240} y={G + 10} s={0.95} f={t} leaf="#3d6a34" />
        <Animal kind="sheep" x={60} y={G + 30} s={0.62} pose="graze" f={t} />
        <GrassTufts x={-800} y={G - 4} w={2050} n={70} color="#3a6a30" f={t} />
        <clipPath id="s4pond"><path d={`M${POND[0]} ${G} Q${POND[0] + 60} ${G + DEEP} ${POND[0] + 260} ${G + DEEP} L${POND[1] - 260} ${G + DEEP} Q${POND[1] - 60} ${G + DEEP} ${POND[1]} ${G} L${POND[1]} ${G - 200} L${POND[0]} ${G - 200} Z`} /></clipPath>
        <g clipPath="url(#s4pond)"><Water f={t} x={POND[0] - 20} top={G + 16} w={POND[1] - POND[0] + 40} h={DEEP} shallow="#3a9ad0" deep="#123a6a" /></g>
        <Fish x={1500 + Math.sin(t * 0.02) * 120} y={G + 300} f={t} s={0.9} flip={Math.cos(t * 0.02) < 0} />
        <Fish x={2000 - t * 1.2} y={G + 400} f={t + 9} s={0.7} flip color="#e8a040" belly="#ffe2b0" />
        {fj && <g transform={`rotate(${fj.rot} ${fj.p[0]} ${fj.p[1]})`}><Fish x={fj.p[0]} y={fj.p[1]} f={t * 2} s={0.75} color="#9ab8d8" /></g>}
        <Particles f={t} f0={118} n={14} at={[1700, G + 18]} seed={31} speed={[5, 11]} cone={70} gravity={0.6} life={[20, 30]} draw={drop} />
        <Particles f={t} f0={148} n={14} at={[1880, G + 18]} seed={33} speed={[5, 11]} cone={70} gravity={0.6} life={[20, 30]} draw={drop} />
        <Particles f={t} f0={80} n={16} at={[1330, G + 18]} seed={35} speed={[5, 12]} cone={70} gravity={0.6} life={[20, 30]} draw={drop} />
        <ImpactRing f={t} f0={80} at={[1330, G + 24]} size={150} color="#dff2ff" flat={0.18} />
        <ImpactRing f={t} f0={148} at={[1880, G + 24]} size={130} color="#dff2ff" flat={0.18} />
        {/* characters */}
        <Hero x={260} y={G + 20} pose={heroPose} s={0.9} shadow={0.35} look={{ glow: 0.25 }} />
        <Animal kind="dog" x={dogX} y={G + 26} s={0.85} pose={dogMoving ? "run" : t < 26 ? "sit" : "stand"} phase={gaitPhase(t, 14, "dog", true)} f={t} look={{ glow: 0.2 }} />
        <Ball x={b[0]} y={b[1]} r={22} spin={t * 14 * clamp(1 - (t - 80) / 30)} />
        {t >= 56 && t < 60 && <ImpactRing f={t} f0={56} at={[1100, G]} size={70} />}
      </Cam>
      {t < 10 && <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: 1 - ease.out(t / 10) }} />}
    </Shell>
  );
};
