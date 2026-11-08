// Scene 5 "LET THE WORK SPEAK": a street at night. The camera rides with a passing car (headlights, spinning wheels, lit houses in
// parallax, lamp posts), whips ahead to a plaza where a crowd cheers a hero on a podium raising a trophy (rays, sweeping spots, confetti).
import React from "react";
import { clamp, ease, lerp, prog, track } from "../core";
import { Hero, POSES, mixPose } from "../hero";
import { LightPool, MAT, Shade, Spot, Surface } from "../materials";
import { Car, House, LampPost, Moon, Trophy } from "../props";
import { Crowd } from "../crowd";
import { Confetti, Rays } from "../fx";
import { Cam, Dip, Flash, Parallax } from "../camera";
import { Shell } from "./shared";

export const S5_LEN = 180;
const G = 1400, PODIUM = 3000;
const carX = (t: number) => -400 + t * 26;

export const S5Plaza: React.FC<{ f: number }> = ({ f }) => {
  const t = f;
  const camState = (tt: number) => {
    const ride = carX(tt - 3) + 180;
    const x = tt < 50 ? ride : lerp(carX(47) + 180, PODIUM, ease.burst(clamp((tt - 50) / 26)));
    const y = track(tt, [{ f: 0, v: 1150 }, { f: 50, v: 1150 }, { f: 76, v: 1060, e: "burst" }, { f: 180, v: 1000, e: "inOut" }]);
    const z = track(tt, [{ f: 0, v: 1 }, { f: 50, v: 1 }, { f: 76, v: 0.9, e: "burst" }, { f: 180, v: 1.06, e: "inOut" }]);
    return { x, y, z, r: 0 };
  };
  const up = prog(t, 84, 96, "back");
  const heroPose = mixPose(POSES.stand(), { ...POSES.armsUp(), hN: [30, -150], hF: [-20, -150] }, up);
  const spotTilt = Math.sin(t * 0.04) * 260;
  return (
    <Shell f={f} title="LET THE WORK SPEAK" titleOut={165} bg="#05060c" over={<><Flash f={t} at={92} dur={8} color="#fff6d8" /><Dip f={t} at={S5_LEN} dur={12} /></>}>
      <Cam f={f} keys={[]} state={camState} blur={0.45}>
        <Parallax d={0.02} anchor={[540, 1100]}>
          <defs><linearGradient id="s5sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#03040a" /><stop offset="100%" stopColor="#1a2450" /></linearGradient></defs>
          <rect x={-1000} y={-1000} width={4000} height={3600} fill="url(#s5sky)" />
          <rect x={-1000} y={-1000} width={4000} height={2200} fill={MAT.stars} opacity={0.8} />
          <Moon x={880} y={660} r={44} />
        </Parallax>
        <Parallax d={0.6} anchor={[540, 1100]}>
          {Array.from({ length: 9 }, (_, i) => <House key={i} x={-200 + i * 420} y={G - 40} s={0.95} lit={(i * 37) % 3 ? 0.9 : 0.15} smoke={i % 2} f={t} wall={i % 3 === 1 ? "stone" : "brick"} />)}
          <Shade y={G - 500} h={500} from={0} to={0.5} x={-600} w={5000} />
        </Parallax>
        <rect x={-1000} y={G} width={6000} height={1200} fill={MAT.asphalt} />
        <rect x={-1000} y={G} width={6000} height={26} fill="#4a4a52" />
        {Array.from({ length: 30 }, (_, i) => <rect key={i} x={-900 + i * 200} y={G + 150} width={110} height={12} fill="#d8d8d8" opacity={0.5} />)}
        {Array.from({ length: 7 }, (_, i) => <LampPost key={i} x={-200 + i * 700} y={G + 10} s={0.95} />)}
        {/* plaza */}
        <Spot x={PODIUM - 500} top={-400} floorY={G} spread={260} a={0.18} tilt={spotTilt + 500} />
        <Spot x={PODIUM + 500} top={-400} floorY={G} spread={260} a={0.18} tilt={-spotTilt - 500} />
        <Rays f={t} at={[PODIUM, 960]} a={0.4 * prog(t, 86, 110)} n={14} width={4} />
        <LightPool cx={PODIUM} cy={1100} rx={500} color="#fff2c8" a={0.4 * prog(t, 80, 100)} />
        <Surface mat="stone" x={PODIUM - 160} y={G - 160} w={320} h={160} dark={0.4} />
        <Hero x={PODIUM} y={G - 160} pose={heroPose} s={0.95} hold={(j) => (up > 0.5 ? <Trophy x={(j.wN[0] + j.wF[0]) / 2} y={(j.wN[1] + j.wF[1]) / 2 + 30} s={0.55} f={t} /> : null)} />
        <Car x={carX(t)} y={G + 120} f={t} speed={26} lights color="#3a6ac0" />
        <Crowd f={t} rows={8} cols={15} x={PODIUM} y={G + 520} gap={95} vp={[PODIUM, G - 260]} depth={0.18} s={0.6} cheer={t > 88 ? 0.55 : 0.08} seed={5} dark={0.6} />
        <Confetti f={t} f0={96} at={[PODIUM - 200, 760]} n={60} seed={3} />
        <Confetti f={t} f0={124} at={[PODIUM + 220, 740]} n={60} seed={8} />
      </Cam>
    </Shell>
  );
};
