// Scene 6 "BUILD WHAT LASTS": dusk. The hero carries stones from a pile to a castle that rises brick by brick (dust on each brick).
// Halfway a VHS REWIND runs the scene backwards (the castle comes apart), then time runs forward again to the finish: windows light,
// roofs and flag drop in, rays, the camera pulls back with a burst.
import React from "react";
import { clamp, ease, lerp, prog } from "../core";
import { Hero, POSES, STRIDE, mixPose, walk } from "../hero";
import { LightPool, MAT, Shade } from "../materials";
import { Castle, Hills, Rock, Sun } from "../props";
import { Dust, Rays } from "../fx";
import { Cam, Parallax, RewindFx, rewindTime } from "../camera";
import { Shell } from "./shared";

export const S6_LEN = 270;
const G = 1450, PILE = 20, SITE = 250, CX = 720;
const RW_AT = 100, RW_DUR = 20, RW_SPEED = 3;
const BUILD = [10, 160];

/** the carrier walks pile -> site -> pile ... (one trip = 36 frames each way, 8 frames to pick up / drop) */
const carrier = (st: number) => {
  const leg = 44, cyc = leg * 2, u = ((st % cyc) + cyc) % cyc;
  const going = u < leg, k = going ? u : u - leg;
  const a = clamp((k - 4) / (leg - 8));
  const x = going ? lerp(PILE, SITE, ease.inOut(a)) : lerp(SITE, PILE, ease.inOut(a));
  const dist = Math.abs(x - PILE);
  const moving = a > 0 && a < 1;
  let pose = moving ? walk(dist / (2 * STRIDE), 0.9) : POSES.crouch();
  if (going && moving) pose = { ...pose, hN: [62, 30], hF: [52, 36], lean: 2 };
  return { x, pose, flip: !going, holding: going };
};

export const S6Castle: React.FC<{ f: number }> = ({ f }) => {
  const st = rewindTime(f, RW_AT, RW_DUR, RW_SPEED); // scene time (goes backwards during the rewind)
  const p = clamp((st - BUILD[0]) / (BUILD[1] - BUILD[0]));
  const done = clamp((st - BUILD[1]) / 18);
  const c = carrier(st);
  const lastBrickF = Math.floor(st / 6) * 6;
  const rw = f >= RW_AT && f < RW_AT + RW_DUR;
  return (
    <Shell f={f} title="BUILD WHAT LASTS" titleOut={240} bg="#140c18" vig={0.7} over={<RewindFx f={f} at={RW_AT} dur={RW_DUR} />}>
      <Cam f={f} drift={2} blur={0.4} kicks={[{ f: 240, amp: 12 }]} keys={[
        { f: 0, x: 520, y: 1150, z: 0.9 }, { f: RW_AT, x: 560, y: 1080, z: 0.98, e: "inOut" },
        { f: RW_AT + RW_DUR, x: 560, y: 1080, z: 0.9, e: "burst" }, { f: 230, x: 600, y: 1040, z: 0.98, e: "inOut" },
        { f: 246, x: 620, y: 960, z: 0.8, e: "burst" }, { f: 270, x: 620, y: 950, z: 0.78, e: "inOut" },
      ]}>
        <Parallax d={0.05} anchor={[540, 1100]}>
          <defs><linearGradient id="s6sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1b1030" /><stop offset="60%" stopColor="#6a2a5a" /><stop offset="100%" stopColor="#ff8a4a" /></linearGradient></defs>
          <rect x={-1200} y={-1200} width={3600} height={3800} fill="url(#s6sky)" />
          <Sun x={260} y={lerp(1180, 1260, prog(st, 0, 250))} r={80} color="#ff9a5a" f={f} />
        </Parallax>
        <Parallax d={0.3} anchor={[540, 1100]}><Hills y={1330} amp={200} color="#3a1e40" seed={12} peaks /></Parallax>
        <Parallax d={0.6} anchor={[540, 1100]}><Hills y={1400} amp={90} color="#2a1630" seed={6} /></Parallax>
        <LightPool cx={CX} cy={G - 300} rx={700} ry={600} color="#ffcf8a" a={0.25 + 0.4 * done} />
        <Rays f={f} at={[CX, G - 760]} a={0.45 * done} n={14} width={4} color="#ffe2a0" />
        <rect x={-1000} y={G} width={3200} height={1200} fill={MAT.soil} />
        <rect x={-1000} y={G} width={3200} height={36} fill={MAT.grass} />
        <Shade y={G} h={700} from={0.3} to={0.9} x={-1000} w={3200} />
        <Castle x={CX} y={G + 4} s={1.0} p={p} glow={done} flagF={f} />
        {p > 0 && p < 1 && <Dust f={st} f0={lastBrickF} at={[CX + Math.sin(lastBrickF) * 300, G - 40 - p * 430]} n={6} seed={lastBrickF} />}
        {[0, 1, 2, 3].map((i) => <Rock key={i} x={PILE - 70 + i * 40} y={G + 6 - (i % 2) * 20} w={70} h={36} seed={i + 4} />)}
        {st < BUILD[1] + 4 && (
          <Hero x={c.x} y={G + 6} pose={c.pose} flip={c.flip} s={0.78} hold={(j) => (c.holding ? <rect x={(j.wN[0] + j.wF[0]) / 2 - 26} y={(j.wN[1] + j.wF[1]) / 2 - 34} width={52} height={34} rx={4} fill="#9a9aa2" stroke="#0b0b0d" strokeWidth={3} /> : null)} />
        )}
        {st >= BUILD[1] + 4 && <Hero x={SITE - 20} y={G + 6} pose={mixPose(POSES.stand(), POSES.armsUp(), prog(st, BUILD[1] + 4, BUILD[1] + 14, "back"))} s={0.78} />}
      </Cam>
      {rw && <div style={{ position: "absolute", inset: 0, backdropFilter: "saturate(0.6)", background: "rgba(40,60,120,0.08)" }} />}
    </Shell>
  );
};
