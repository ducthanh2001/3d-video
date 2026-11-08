// Round rubber stamp. With `at` it drops in (spring from big to size 1) and shakes for 7 frames; without `at` it is just shown.
import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PAL } from "../style";
import { FONT } from "../style";

export type StampKind = "F" | "FAILED" | "REAL" | "MYTH";
const COLOR: Record<StampKind, string> = { F: PAL.fail, FAILED: PAL.fail, REAL: PAL.fail, MYTH: PAL.myth };

export const Stamp: React.FC<{ kind: StampKind; x: number; y: number; size?: number; rotate?: number; at?: number; plate?: boolean }> = ({ kind, x, y, size = 360, rotate = -12, at, plate }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  let k = 1, dx = 0, dy = 0, op = 1;
  if (at !== undefined) {
    const t = f - at;
    if (t < 0) return null;
    k = 1 + 1.3 * (1 - spring({ frame: t, fps, config: { damping: 13, stiffness: 240, mass: 0.6 } }));
    op = Math.min(1, t / 2);
    if (t < 7) { const a = 1 - t / 7; dx = Math.sin(t * 3.1) * 12 * a; dy = Math.cos(t * 2.3) * 9 * a; }
  }
  const c = COLOR[kind];
  const fs = kind === "F" ? 190 : kind === "FAILED" ? 64 : 62;
  return (
    <svg width={size} height={size} viewBox="0 0 300 300" style={{ position: "absolute", left: x - size / 2 + dx, top: y - size / 2 + dy, opacity: op * 0.94, transform: `rotate(${rotate}deg) scale(${k})`, mixBlendMode: plate ? "normal" : "multiply" }}>
      {plate && <circle cx={150} cy={150} r={138} fill="rgba(255,250,240,0.93)" />}
      <circle cx={150} cy={150} r={138} fill="none" stroke={c} strokeWidth={13} />
      <circle cx={150} cy={150} r={114} fill="none" stroke={c} strokeWidth={5} />
      <text x={150} y={150 + fs * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={fs} fill={c}>{kind === "F" ? "F" : kind}</text>
      {kind === "FAILED" && [-1, 1].map((sd) => <path key={sd} d={`M${150 + sd * 76} 98 l${sd * 8} 14 l${sd * 16} 2 l${-sd * 12} 11 l${sd * 4} 15 l${-sd * 16} -8 l${-sd * 15} 8 l${sd * 4} -15 l${-sd * 12} -11 l${sd * 16} -2 z`} fill={c} transform={`scale(0.7) translate(${64} ${46})`} />)}
      {(kind === "REAL" || kind === "MYTH") && <text x={150} y={92} textAnchor="middle" fontFamily={FONT} fontSize={22} letterSpacing={6} fill={c}>VERDICT</text>}
    </svg>
  );
};
