// LET THEM LAUGH thumbnails (1080x1920), all built from real frames of the film. Text stays inside the channel-grid safe zone
// (the grid shows ~2:3 and cuts ~150 px top and bottom).
// 0 A "DAY 1 / DAY 365" split (ugly stroke vs the finished mural) · 1 B mural + "LET THEM LAUGH" · 2 C the castle
// 3 D clean mural, no text (the competitor's way) · 4 E the skate trick "47 FALLS"
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { LaughFilm } from "./Film";
import { GOLD } from "../samehours/StyleFrames";
import { Q } from "./events";

export const LAUGH_THUMBS = 5;
const BIG = '"Arial Black", "Segoe UI Black", Impact, sans-serif';
const DAY1 = Q.S0 + 125, MURAL = Q.LEN - 2, CASTLE = Q.S2 - 1, SKATE = Q.S3 - 8;
const T: React.FC<{ y: number; t: string; size: number; fill: string }> = ({ y, t, size, fill }) => (
  <text x={540} y={y} textAnchor="middle" fontFamily={BIG} fontSize={size} fill={fill} stroke="#000" strokeWidth={8} paintOrder="stroke">{t}</text>
);
const Over: React.FC<{ children: React.ReactNode }> = ({ children }) => <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>{children}</svg>;
/** one film frame, scaled by s and placed so world point (cx, cy) sits at screen (540, y) */
const Shot: React.FC<{ at: number; s: number; cy: number; y: number; cx?: number }> = ({ at, s, cy, y, cx = 540 }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transformOrigin: "0 0", transform: `translate(${540 - cx * s}px, ${y - cy * s}px) scale(${s})` }}>
    <LaughFilm at={at} noFade />
  </div>
);
const Half: React.FC<{ top: number; h: number; children: React.ReactNode }> = ({ top, h, children }) => (
  <div style={{ position: "absolute", left: 0, top, width: 1080, height: h, overflow: "hidden" }}><div style={{ position: "absolute", left: 0, top: -top, width: 1080, height: 1920 }}>{children}</div></div>
);

const OPTS: React.ReactNode[] = [
  // A · before / after on the same wall
  <>
    <Half top={0} h={960}><Shot at={DAY1} s={0.74} cy={860} y={560} /></Half>
    <Half top={960} h={960}><Shot at={MURAL} s={0.74} cy={860} y={1420} /></Half>
    <Over>
      <rect x={0} y={952} width={1080} height={16} fill={GOLD} />
      <T y={300} t="DAY 1" size={120} fill="#fff" />
      <T y={1700} t="DAY 365" size={120} fill={GOLD} />
    </Over>
  </>,
  // B · the finished mural + the title
  <>
    <Shot at={MURAL} s={0.9} cy={900} y={1000} />
    <Over>
      <rect x={0} y={0} width={1080} height={380} fill="#000" />
      <T y={318} t="LET THEM LAUGH" size={92} fill="#fff" />
      <rect x={0} y={1620} width={1080} height={300} fill="#000" />
      <T y={1720} t="THEN SHOW THEM" size={88} fill={GOLD} />
    </Over>
  </>,
  // C · the castle
  <>
    <Shot at={CASTLE} s={1.0} cy={960} y={1000} />
    <Over>
      <rect x={0} y={0} width={1080} height={360} fill="#000" />
      <T y={300} t="THEY THREW STONES" size={88} fill="#fff" />
      <rect x={0} y={1600} width={1080} height={320} fill="#000" />
      <T y={1710} t="HE BUILT A CASTLE" size={88} fill={GOLD} />
    </Over>
  </>,
  // D · clean frame, no added text
  <Shot at={MURAL} s={1} cy={960} y={960} />,
  // E · the trick after 47 falls
  <>
    <Shot at={SKATE} s={1.1} cy={1150} y={1100} />
    <Over>
      <rect x={0} y={0} width={1080} height={360} fill="#000" />
      <T y={300} t="47 FALLS" size={130} fill="#fff" />
      <rect x={0} y={1620} width={1080} height={300} fill="#000" />
      <T y={1720} t="THEY STOPPED LAUGHING" size={70} fill={GOLD} />
    </Over>
  </>,
];
export const LaughThumb: React.FC = () => {
  const o = OPTS[Math.min(OPTS.length - 1, useCurrentFrame())];
  return <AbsoluteFill style={{ background: "#000" }}>{o}</AbsoluteFill>;
};
