// DoneThumb: thumbnails for "Do it until it's done." built on frames of the film. Frame = option.
// Text stays between y 330 and 1560 (the channel grid crops ~150 px top and bottom).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { GOLD } from "../samehours/StyleFrames";
import { DoneFilm } from "./Film";
import { Q } from "./events";

export const DONE_THUMBS = 3;
const BLACK = '"Arial Black", "Segoe UI Black", Impact, sans-serif';
const T: React.FC<{ x?: number; y: number; s: number; c: string; t: string }> = ({ x = 540, y, s, c, t }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={BLACK} fontSize={s} letterSpacing={2} fill={c} stroke="#000" strokeWidth={s * 0.09} paintOrder="stroke">{t}</text>
);
const Pill: React.FC<{ x: number; y: number; t: string; c: string; s?: number }> = ({ x, y, t, c, s = 84 }) => (
  <g>
    <rect x={x - t.length * s * 0.4 - 30} y={y - s * 0.92} width={t.length * s * 0.8 + 60} height={s * 1.28} rx={18} fill={c} stroke="#000" strokeWidth={6} />
    <text x={x} y={y} textAnchor="middle" fontFamily={BLACK} fontSize={s} fill="#000">{t}</text>
  </g>
);
const Cover: React.FC = () => <rect x={0} y={0} width={1080} height={215} fill="#000" />;
const OPTS: { at: number; over: React.FC }[] = [
  // A · SNOOZE vs 5 AM (the slap on the alarm / the bag)
  { at: Q.S1 + 62, over: () => <g><Cover /><Pill x={540} y={560} t="SNOOZE" c="#e0483e" /><Pill x={540} y={1400} t="5 AM" c={GOLD} /></g> },
  // B · QUIT vs DONE on the tall wall: the title low, the labels beside the two climbers
  { at: Q.S4 + 142, over: () => <g><Cover /><rect x={0} y={1330} width={1080} height={200} fill="#000" opacity={0.8} /><T y={1465} s={92} c="#ffffff" t="MOST CLIMB DOWN." /><Pill x={300} y={1180} t="QUIT" c="#e0483e" s={70} /><Pill x={560} y={470} t="DONE" c={GOLD} s={70} /></g> },
  // C · the knockout, the title above the ring
  { at: 68, over: () => <g><Cover /><rect x={0} y={300} width={1080} height={300} fill="#000" opacity={0.82} /><T y={430} s={100} c="#ffffff" t="DO IT UNTIL" /><T y={555} s={100} c={GOLD} t="IT'S DONE." /></g> },
];
export const DoneThumb: React.FC = () => {
  const o = OPTS[Math.min(OPTS.length - 1, useCurrentFrame())];
  const O = o.over;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <DoneFilm at={o.at} />
      <AbsoluteFill>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920"><O /></svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
