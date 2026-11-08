// SAME HOURS thumbnails (1080x1920), all built from real frames of the film.
// 0 A bricks + question band · 1 B candle · 2 C door · 3 D clean frame (the competitor's way: no added text)
// 4 E "SAME HOURS" title bands · 5 F zoomed split with big lane tags
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SameHoursFilm } from "./Film";
import { GOLD, RED } from "./StyleFrames";
import { Q } from "./events";

export const SAMEHOURS_THUMBS = 6;
const BIG = '"Arial Black", "Segoe UI Black", Impact, sans-serif';
const WIN = Q.S1 + 218; // the bricks vignette at its payoff: wall vs gold staircase + flag
const T: React.FC<{ x?: number; y: number; t: string; size: number; fill: string; anchor?: "middle" | "start" }> = ({ x = 540, y, t, size, fill, anchor = "middle" }) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={BIG} fontSize={size} fill={fill} stroke="#000" strokeWidth={7} paintOrder="stroke">{t}</text>
);
const Band: React.FC<{ y: number; h: number }> = ({ y, h }) => (
  <g>
    <defs><linearGradient id={`b${y}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity={0} /><stop offset="0.25" stopColor="#000" stopOpacity={0.92} /><stop offset="0.75" stopColor="#000" stopOpacity={0.92} /><stop offset="1" stopColor="#000" stopOpacity={0} /></linearGradient></defs>
    <rect x={0} y={y} width={1080} height={h} fill={`url(#b${y})`} />
  </g>
);
const Over: React.FC<{ children: React.ReactNode }> = ({ children }) => <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>{children}</svg>;
const Mid: React.FC<{ top: string; bot: string; topColor?: string }> = ({ top, bot, topColor = "#fff" }) => (
  <Over><Band y={775} h={300} /><T y={913} t={top} size={92} fill={topColor} /><T y={1017} t={bot} size={78} fill={GOLD} /></Over>
);

const OPTS: { frame: number; zoom?: number; over?: React.ReactNode }[] = [
  { frame: WIN, over: <Mid top="4 HOURS A DAY" bot="WHICH ONE ARE YOU?" /> },
  { frame: Q.S4 + 150, over: <Mid top="200% FOR 30 DAYS" bot="OR 100% FOR A YEAR?" topColor={RED} /> },
  { frame: Q.S2 + 182, over: <Mid top="THERE IS NO" bot="SHORTCUT KEY" /> },
  { frame: WIN },
  {
    // text kept inside the channel-grid safe zone (the grid shows ~2:3, cutting ~150 px top and bottom)
    frame: WIN, zoom: 0.88, over: (
      <Over>
        <rect x={0} y={0} width={1080} height={370} fill="#000" />
        <T y={320} t="SAME HOURS" size={130} fill="#fff" />
        <rect x={0} y={1600} width={1080} height={320} fill="#000" />
        <T y={1700} t="DIFFERENT RESULTS" size={84} fill={GOLD} />
      </Over>
    ),
  },
  {
    frame: WIN, zoom: 1.15, over: (
      <Over>
        <rect x={0} y={0} width={1080} height={210} fill="#000" />
        <T y={165} t="SCROLLING" size={120} fill="#9a9aa2" />
        <rect x={0} y={900} width={1080} height={200} fill="#000" />
        <T y={1050} t="BUILDING" size={120} fill={GOLD} />
        <rect x={0} y={1800} width={1080} height={120} fill="#000" />
      </Over>
    ),
  },
];
export const SameHoursThumb: React.FC = () => {
  const o = OPTS[Math.min(OPTS.length - 1, useCurrentFrame())];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${o.zoom ?? 1})`, transformOrigin: "50% 50%" }}><SameHoursFilm at={o.frame} /></AbsoluteFill>
      {o.over}
    </AbsoluteFill>
  );
};
