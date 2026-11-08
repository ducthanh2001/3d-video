// PROVE IT TO YOURSELF thumbnails (1080x1920), built from real frames of the film; text kept inside the channel-grid safe zone
// (the grid shows ~2:3 and cuts ~150 px top and bottom).
// 0 A "TRY 3 FAILED / TRY 4" (the explosion vs the liftoff) · 1 B liftoff + title · 2 C the lit road + title
// 3 D the king carved + "YOU'LL CARVE YOURSELF" · 4 E clean liftoff frame, no text
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ProveFilm } from "./Film";
import { GOLD } from "../samehours/StyleFrames";
import { Q } from "./events";

export const PROVE_THUMBS = 8;
const BIG = '"Arial Black", "Segoe UI Black", Impact, sans-serif';
const RED = "#e0483e";
const BOOM = Q.S0 + 16, LIFT = Q.S0 + 200, KING = Q.S2 - 2, ROAD = Q.LEN - 30, TUNNEL = Q.S3 - 2;
const T: React.FC<{ y: number; t: string; size: number; fill: string }> = ({ y, t, size, fill }) => (
  <text x={540} y={y} textAnchor="middle" fontFamily={BIG} fontSize={size} fill={fill} stroke="#000" strokeWidth={8} paintOrder="stroke">{t}</text>
);
const Over: React.FC<{ children: React.ReactNode }> = ({ children }) => <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>{children}</svg>;
/** one film frame, scaled by s, placed so world point (cx, cy) sits at screen (540, y) */
const Shot: React.FC<{ at: number; s: number; cy: number; y: number; cx?: number }> = ({ at, s, cy, y, cx = 540 }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transformOrigin: "0 0", transform: `translate(${540 - cx * s}px, ${y - cy * s}px) scale(${s})` }}>
    <ProveFilm at={at} noFade />
  </div>
);
const Half: React.FC<{ top: number; h: number; children: React.ReactNode }> = ({ top, h, children }) => (
  <div style={{ position: "absolute", left: 0, top, width: 1080, height: h, overflow: "hidden" }}><div style={{ position: "absolute", left: 0, top: -top, width: 1080, height: 1920 }}>{children}</div></div>
);

const OPTS: React.ReactNode[] = [
  // A · the failure and the liftoff, both from the bottom lane
  <>
    <Half top={0} h={960}><Shot at={BOOM} s={1.15} cy={1380} y={560} /></Half>
    <Half top={960} h={960}><Shot at={LIFT} s={1.15} cy={1360} y={1430} /></Half>
    <Over>
      <rect x={0} y={0} width={1080} height={240} fill="#000" />
      <rect x={0} y={960} width={1080} height={180} fill="#000" />
      <rect x={0} y={952} width={1080} height={16} fill={GOLD} />
      <T y={300} t="TRY 3: FAILED" size={96} fill={RED} />
      <T y={1720} t="TRY 4: LIFTOFF" size={96} fill={GOLD} />
    </Over>
  </>,
  // B · liftoff + title
  <>
    <Shot at={LIFT} s={1.25} cy={1330} y={1120} />
    <Over>
      <rect x={0} y={0} width={1080} height={840} fill="#000" />
      <T y={560} t="PROVE IT" size={150} fill="#fff" />
      <rect x={0} y={1620} width={1080} height={300} fill="#000" />
      <T y={1730} t="TO YOURSELF" size={110} fill={GOLD} />
    </Over>
  </>,
  // C · the whole lit road + title
  <>
    <Shot at={ROAD} s={1.35} cy={1500} y={1150} cx={560} />
    <Over>
      <rect x={0} y={0} width={1080} height={610} fill="#000" />
      <T y={400} t="NOBODY IS COMING" size={82} fill="#fff" />
      <T y={510} t="TO LIGHT IT" size={82} fill="#fff" />
      <rect x={0} y={1490} width={1080} height={430} fill="#000" />
      <T y={1640} t="STRIKE AGAIN" size={110} fill={GOLD} />
    </Over>
  </>,
  // D · the king he carved
  <>
    <Shot at={KING} s={1.3} cy={1430} y={1060} cx={600} />
    <Over>
      <rect x={0} y={0} width={1080} height={630} fill="#000" />
      <T y={420} t="YOU WON'T" size={110} fill="#fff" />
      <T y={540} t="FIND YOURSELF" size={96} fill="#fff" />
      <rect x={0} y={1470} width={1080} height={450} fill="#000" />
      <T y={1620} t="CARVE YOURSELF" size={96} fill={GOLD} />
    </Over>
  </>,
  // E · clean frame
  <ProveFilm at={LIFT} noFade />,
  // F · the real two-lane frame + a question
  <>
    <Shot at={LIFT} s={0.84} cy={960} y={1020} />
    <Over>
      <rect x={0} y={0} width={1080} height={300} fill="#000" />
      <T y={250} t="WHICH ONE" size={120} fill="#fff" />
      <rect x={0} y={1640} width={1080} height={280} fill="#000" />
      <T y={1740} t="ARE YOU?" size={120} fill={GOLD} />
    </Over>
  </>,
  // G · 0 tries vs 4 tries
  <>
    <Half top={0} h={960}><Shot at={LIFT} s={1.25} cy={650} y={560} cx={560} /></Half>
    <Half top={960} h={960}><Shot at={LIFT} s={1.15} cy={1400} y={1420} /></Half>
    <Over>
      <rect x={0} y={0} width={1080} height={300} fill="#000" />
      <rect x={0} y={960} width={1080} height={200} fill="#000" />
      <rect x={0} y={952} width={1080} height={16} fill={GOLD} />
      <T y={270} t="0 TRIES" size={130} fill="#9a9aa2" />
      <T y={1730} t="4 TRIES" size={130} fill={GOLD} />
    </Over>
  </>,
  // H · four payoffs in one grid + the title
  <>
    {([[LIFT, 560, 1430, 0, 0, 1.0], [KING, 640, 1420, 1, 0, 1.0], [TUNNEL, 640, 1415, 0, 1, 1.0], [ROAD, 560, 1520, 1, 1, 1.5]] as number[][]).map(([at, cx, cy, c, r, s], i) => (
      <div key={i} style={{ position: "absolute", left: c * 540, top: 300 + r * 700, width: 540, height: 700, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: -c * 540, top: -(300 + r * 700), width: 1080, height: 1920 }}><Shot at={at} s={s} cy={cy} y={300 + r * 700 + 350} cx={cx + (270 - c * 540) / s} /></div>
      </div>
    ))}
    <Over>
      <rect x={0} y={0} width={1080} height={300} fill="#000" />
      <rect x={0} y={1700} width={1080} height={220} fill="#000" />
      <line x1={540} y1={300} x2={540} y2={1700} stroke="#000" strokeWidth={10} />
      <line x1={0} y1={1000} x2={1080} y2={1000} stroke="#000" strokeWidth={10} />
      <T y={240} t="PROVE IT" size={130} fill="#fff" />
      <T y={1790} t="TO YOURSELF" size={96} fill={GOLD} />
    </Over>
  </>,
];
export const ProveThumb: React.FC = () => {
  const o = OPTS[Math.min(OPTS.length - 1, useCurrentFrame())];
  return <AbsoluteFill style={{ background: "#000" }}>{o}</AbsoluteFill>;
};
