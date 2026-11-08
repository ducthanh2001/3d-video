// Scene 3 "THE NIGHT IS LONG": top-down bedroom. The hero tosses in bed, the bedside clock ticks 3:07 -> 3:09, moonlight lies on the
// floor. The camera arrives from below (end of the whip), pushes in slowly, then zooms THROUGH the clock (white flash = next scene).
import React from "react";
import { V, clamp } from "../core";
import { Hero, Pose, mixPose } from "../hero";
import { LightPool, MAT, Shade } from "../materials";
import { BedTop, Book, DigitalClock, Phone } from "../props";
import { Motes } from "../fx";
import { Cam, Flash } from "../camera";
import { Shell } from "./shared";

export const S3_LEN = 160;
const BED: V = [280, 520], CLOCK: V = [880, 640];

// seen from above, a standing pose reads as lying on the back; arms change between restless poses
const spread: Pose = { hip: [0, -190], lean: 0, head: 0, hN: [70, 40], hF: [-70, 40], fN: [22, 0], fF: [-22, 0] };
const onHead: Pose = { hip: [0, -190], lean: 0, head: 12, hN: [26, -64], hF: [-20, -66], fN: [26, 0], fF: [-12, 0], elbow: -1 };
const chest: Pose = { hip: [0, -190], lean: 0, head: -10, hN: [46, 44], hF: [-40, 48], fN: [10, 0], fF: [-30, 0], elbow: -1 };
const POSES_NIGHT = [spread, onHead, chest, onHead];

export const S3Bed: React.FC<{ f: number }> = ({ f }) => {
  const t = f;
  const k = Math.floor(t / 34) % POSES_NIGHT.length, a = clamp((t % 34) / 8);
  const pose = mixPose(POSES_NIGHT[(k + POSES_NIGHT.length - 1) % POSES_NIGHT.length], POSES_NIGHT[k], a);
  const roll = Math.sin(Math.floor(t / 34) * 2.1) * 6 * (1 - Math.abs(1 - a * 2) * 0.3);
  const clock = t < 50 ? "3:07" : t < 100 ? "3:08" : "3:09";
  const tickKick = [50, 100];
  return (
    <Shell f={f} title="THE NIGHT IS LONG" titleOut={115} bg="#07080c" over={<Flash f={t} at={S3_LEN - 2} dur={4} />}>
      <Cam
        f={f}
        keys={[
          { f: -1, x: 540, y: 2300, z: 1 },
          { f: 12, x: 540, y: 960, z: 1, e: "burst" },
          { f: 120, x: 600, y: 900, z: 1.12, e: "inOut" },
          { f: 158, x: CLOCK[0], y: CLOCK[1] + 6, z: 26, e: "in" },
        ]}
        kicks={tickKick.map((ff) => ({ f: ff, amp: 3, dur: 6 }))}
        blur={0.5}
      >
        <rect x={-600} y={-1000} width={2400} height={4200} fill={MAT.boards} />
        <rect x={-600} y={-1000} width={2400} height={4200} fill="#0c1430" opacity={0.62} />
        {/* moonlight from a window off-frame: a slanted bright patch with its window bars */}
        <g opacity={0.9} style={{ mixBlendMode: "screen" }}>
          <path d="M-80 1250 L300 1150 L420 1600 L40 1700 Z" fill="#7a9cff" opacity={0.28} filter="url(#k-blur10)" />
          <path d="M110 1200 L230 1650 M-20 1480 L360 1380" stroke="#000" strokeWidth={16} opacity={0.5} />
        </g>
        <rect x={120} y={1500} width={520} height={340} rx={30} fill="#5a2a3a" opacity={0.7} />
        <BedTop x={BED[0]} y={BED[1]} w={520} h={900} blanket={0.34} />
        {/* the sleeper: root (feet) toward the foot of the bed; blanket drawn over the legs */}
        <g transform={`rotate(${roll} 540 760)`}>
          <Hero x={540} y={1000} pose={pose} s={1.05} shadow={0} look={{ glow: 0.25 }} />
        </g>
        <rect x={BED[0]} y={BED[1] + 330} width={520} height={570} rx={10} fill={MAT.fabric} stroke="#0b0b0d" strokeWidth={3} />
        <path d={`M${BED[0]} ${BED[1] + 340} Q540 ${BED[1] + 300 + Math.sin(t * 0.1) * 6} ${BED[0] + 520} ${BED[1] + 340}`} fill="#3f63a8" stroke="#0b0b0d" strokeWidth={3} />
        <Shade y={BED[1] + 420} h={480} from={0} to={0.45} x={BED[0]} w={520} />
        {/* nightstand */}
        <rect x={810} y={520} width={180} height={240} rx={10} fill={MAT.wood} stroke="#0b0b0d" strokeWidth={3} />
        <DigitalClock x={CLOCK[0]} y={CLOCK[1]} text={clock} s={0.9} />
        <LightPool cx={CLOCK[0]} cy={CLOCK[1]} rx={260} color="#ff4a3a" a={0.25} />
        <Phone x={900} y={730} rot={20} s={0.9} glow="#4a6aff" />
        <Book x={170} y={1500} rot={-20} color="#2a5aa0" />
        <Motes f={t} x={0} y={300} w={1080} h={1400} n={30} a={0.35} />
      </Cam>
      {t > 50 && t < 62 && <rect x={0} y={0} width={1080} height={1920} fill="#ff2020" opacity={0.05 * (1 - (t - 50) / 12)} />}
    </Shell>
  );
};
