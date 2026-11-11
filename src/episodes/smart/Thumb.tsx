// SmartThumb: thumbnails for "Work smart, not just hard." built on frames of the film. Frame = option.
// Text stays between y 330 and 1560 (the channel grid crops ~150 px top and bottom).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { GOLD } from "../samehours/StyleFrames";
import { SmartFilm } from "./Film";
import { Q } from "./events";

export const SMART_THUMBS = 3;
const BLACK = '"Arial Black", "Segoe UI Black", Impact, sans-serif';
const T: React.FC<{ x?: number; y: number; s: number; c: string; t: string }> = ({ x = 540, y, s, c, t }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={BLACK} fontSize={s} letterSpacing={2} fill={c} stroke="#000" strokeWidth={s * 0.09} paintOrder="stroke">{t}</text>
);
const Pill: React.FC<{ x?: number; y: number; t: string; c: string; s?: number }> = ({ x = 540, y, t, c, s = 84 }) => (
  <g>
    <rect x={x - t.length * s * 0.4 - 30} y={y - s * 0.92} width={t.length * s * 0.8 + 60} height={s * 1.28} rx={18} fill={c} stroke="#000" strokeWidth={6} />
    <text x={x} y={y} textAnchor="middle" fontFamily={BLACK} fontSize={s} fill="#000">{t}</text>
  </g>
);
const RED = "#e0483e";
/** hide the film's small labels so only the thumbnail words show */
const Covers: React.FC = () => <g><rect x={0} y={0} width={1080} height={330} fill="#000" /><rect x={0} y={960} width={1080} height={140} fill="#000" /></g>;
const OPTS: { at: number; over: React.FC }[] = [
  // A · the boulder: pushing with everything vs one hand on a lever
  { at: Q.S1 + 90, over: () => <g><Covers /><Pill y={330} t="HARD" c={RED} s={76} /><T y={480} s={88} c="#ffffff" t="WHO WINS?" /><Pill y={1060} t="SMART" c={GOLD} s={76} /></g> },
  // B · the escalators
  { at: Q.S2 + 60, over: () => <g><rect x={0} y={0} width={1080} height={180} fill="#000" /><rect x={300} y={975} width={480} height={120} fill="#000" /><Pill y={262} t="BUSY" c={RED} s={72} /><Pill y={1040} t="PRODUCTIVE" c={GOLD} s={72} /></g> },
  // C · the dominoes
  { at: Q.S5 + 128, over: () => <g><Covers /><Pill y={400} t="PUSH HARDER" c={RED} s={72} /><Pill y={1060} t="START SMALL" c={GOLD} s={72} /></g> },
];
export const SmartThumb: React.FC = () => {
  const o = OPTS[Math.min(OPTS.length - 1, useCurrentFrame())];
  const O = o.over;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <SmartFilm at={o.at} />
      <AbsoluteFill>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920"><O /></svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
