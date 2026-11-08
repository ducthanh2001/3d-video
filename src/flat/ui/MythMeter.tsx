// MYTH-O-METER: half-circle gauge, REAL (red) on the left, MYTH (green) on the right, needle moved by springs.
// `keys` = [{ f: frame, value: 0..1 }]: at each key frame the needle springs from the previous value to the new one.
// `wobble` adds a small swing (the "is it real?" moment). Top of the frame, inside the safe area.
import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, INK, PAL } from "../style";

export type MeterKey = { f: number; value: number };

export const meterValue = (f: number, fps: number, keys: MeterKey[], initial = 0, snap?: number[]): number => {
  let v = initial;
  for (const k of keys) {
    if (f < k.f) break;
    const stiff = snap?.includes(k.f) ? { damping: 6, stiffness: 300, mass: 0.5 } : { damping: 12, stiffness: 90, mass: 0.9 };
    v = v + (k.value - v) * spring({ frame: f - k.f, fps, config: stiff });
    // after the spring has played, the next key starts from the exact target
    if (f - k.f > 90) v = k.value;
  }
  return v;
};

export const MythMeter: React.FC<{ keys?: MeterKey[]; snap?: number[]; value?: number; top?: number; width?: number; wobble?: boolean }> = ({ keys = [], snap, value, top = 70, width = 640, wobble }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const v0 = value ?? meterValue(f, fps, keys, 0, snap);
  const v = Math.max(0, Math.min(1, v0 + (wobble ? 0.07 * Math.sin(f * 0.45) : 0)));
  const ang = -90 + 180 * v; // -90 = full REAL (left), +90 = full MYTH (right)
  const h = width * 0.62;
  const R = 270, cx = 320, cy = 300;
  const arc = (a0: number, a1: number, r: number) => {
    const p = (a: number) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    return `M${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1}`;
  };
  return (
    <svg width={width} height={h} viewBox="0 0 640 400" style={{ position: "absolute", left: (1080 - width) / 2 - 40, top, overflow: "visible" }}>
      <path d={arc(180, 360, R)} fill="none" stroke={INK} strokeWidth={96} strokeLinecap="butt" />
      <path d={arc(180, 270, R)} fill="none" stroke={PAL.fail} strokeWidth={74} />
      <path d={arc(270, 360, R)} fill="none" stroke={PAL.myth} strokeWidth={74} />
      {[0.25, 0.5, 0.75].map((t) => {
        const a = ((180 + 180 * t) * Math.PI) / 180;
        return <line key={t} x1={cx + (R - 42) * Math.cos(a)} y1={cy + (R - 42) * Math.sin(a)} x2={cx + (R + 42) * Math.cos(a)} y2={cy + (R + 42) * Math.sin(a)} stroke={INK} strokeWidth={6} />;
      })}
      <g transform={`rotate(${ang} ${cx} ${cy})`}>
        <path d={`M${cx - 12} ${cy} L${cx} ${cy - R - 18} L${cx + 12} ${cy} Z`} fill={PAL.white} stroke={INK} strokeWidth={8} strokeLinejoin="round" transform={`rotate(0 ${cx} ${cy})`} style={{ transformOrigin: `${cx}px ${cy}px` }} />
      </g>
      <circle cx={cx} cy={cy} r={26} fill={PAL.gold} stroke={INK} strokeWidth={8} />
      <text x={70} y={376} textAnchor="middle" fontFamily={FONT} fontSize={44} fill={PAL.fail} stroke={INK} strokeWidth={9} paintOrder="stroke">REAL</text>
      <text x={570} y={376} textAnchor="middle" fontFamily={FONT} fontSize={44} fill={PAL.myth} stroke={INK} strokeWidth={9} paintOrder="stroke">MYTH</text>
      <text x={cx} y={376} textAnchor="middle" fontFamily={FONT} fontSize={30} fill="#fff" stroke={INK} strokeWidth={8} paintOrder="stroke">MYTH-O-METER</text>
    </svg>
  );
};
