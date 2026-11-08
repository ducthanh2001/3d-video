// TrustThumb: thumbnails for "You're closer than you think. Don't quit." Frame = option.
// All text sits between y 330 and 1560 (the channel grid crops ~150 px top and bottom; the Shorts UI covers the bottom).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { KitDefs, Vignette } from "../../kit/materials";
import { Defs, GOLD } from "../samehours/StyleFrames";
import { GREY, HERO, M4, SLOPE_SIT, SUMMIT, rY } from "./V4Frames";
import { V } from "../../kit/core";
import { Hero, POSES, Pose } from "../../kit/hero";
import { Glow, Rays } from "../../kit/fx";
import { J } from "../beatyesterday/StyleFrames";

export const TRUST_THUMBS = 4;
const BLACK = '"Arial Black", "Segoe UI Black", Impact, sans-serif';
const T: React.FC<{ y: number; s: number; c: string; t: string; ls?: number }> = ({ y, s, c, t, ls = 2 }) => (
  <text x={540} y={y} textAnchor="middle" fontFamily={BLACK} fontSize={s} letterSpacing={ls} fill={c} stroke="#000" strokeWidth={s * 0.08} paintOrder="stroke">{t}</text>
);
const Shade: React.FC<{ y0: number; y1: number }> = ({ y0, y1 }) => (
  <g>
    <defs><linearGradient id={`sh${y0}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity={0} /><stop offset="0.25" stopColor="#000" stopOpacity={0.8} /><stop offset="0.75" stopColor="#000" stopOpacity={0.8} /><stop offset="1" stopColor="#000" stopOpacity={0} /></linearGradient></defs>
    <rect x={0} y={y0} width={1080} height={y1 - y0} fill={`url(#sh${y0})`} />
  </g>
);
// the summit framed big: him waving the flag, the man who sat down at 8,400 m just below
const Scene: React.FC<{ z: number; cx: number; cy: number }> = ({ z, cx, cy }) => (
  <g transform={`translate(540 960) scale(${z}) translate(${-cx} ${-cy})`}><M4 t={6} noText /></g>
);
const O0: React.FC = () => (
  <g>
    <Scene z={1.9} cx={SUMMIT[0] - 120} cy={SUMMIT[1] + 160} />
    <Shade y0={1050} y1={1600} />
    <T y={1200} s={124} c={GOLD} t="1 OUT OF 100" />
    <T y={1330} s={84} c="#ffffff" t="DON'T QUIT." />
  </g>
);
const O1: React.FC = () => (
  <g>
    <Scene z={2.1} cx={SUMMIT[0] - 110} cy={(SUMMIT[1] + rY(862)) / 2 + 40} />
    <Shade y0={1080} y1={1620} />
    <T y={1220} s={96} c="#ffffff" t="YOU'RE CLOSER" />
    <T y={1340} s={96} c={GOLD} t="THAN YOU THINK" />
  </g>
);
const O2: React.FC = () => (
  <g>
    <Scene z={1.6} cx={SUMMIT[0] - 200} cy={SUMMIT[1] + 330} />
    <Shade y0={1060} y1={1520} />
    <T y={1220} s={130} c="#ffffff" t="99 QUIT." />
    <T y={1370} s={130} c={GOLD} t="1 DIDN&apos;T." />
  </g>
);
// ---- comparison
const Tag: React.FC<{ x: number; y: number; t: string; c: string; s?: number }> = ({ x, y, t, c, s = 64 }) => (
  <g>
    <rect x={x - t.length * s * 0.42 - 24} y={y - s * 0.95} width={t.length * s * 0.84 + 48} height={s * 1.3} rx={14} fill={c} stroke="#000" strokeWidth={4} />
    <text x={x} y={y} textAnchor="middle" fontFamily={BLACK} fontSize={s} fill="#000">{t}</text>
  </g>
);
// left | right, drawn big: the man who sat down in the storm vs the man waving the flag on the summit at sunrise
const LS = (x: number) => 1560 - x * 1.25; // the snow slope in the left half
const O3: React.FC = () => {
  const qx = 300, flagPose: Pose = { ...POSES.stand(), lean: -8, head: -22, hN: [50, -130], hF: [-56, -96], fN: [30, 0], fF: [-30, 0], elbow: -1 };
  const hx = 800, hy = 1130, fj = J(hx, hy, flagPose, false, 0.95), top: V = [fj.wN[0] - 6, fj.wN[1] - 190];
  return (
    <g>
      <defs>
        <clipPath id="cl"><rect x={0} y={0} width={540} height={1920} /></clipPath>
        <clipPath id="cr"><rect x={540} y={0} width={540} height={1920} /></clipPath>
        <linearGradient id="storm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#07080d" /><stop offset="1" stopColor="#262a38" /></linearGradient>
        <linearGradient id="sunr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a1408" /><stop offset="0.55" stopColor="#8a6420" /><stop offset="1" stopColor="#3a2a10" /></linearGradient>
      </defs>
      <g clipPath="url(#cl)">
        <rect x={0} y={0} width={540} height={1920} fill="url(#storm)" />
        <path d={`M0 ${LS(0)} L540 ${LS(540)} L540 1920 L0 1920 Z`} fill="#2a2a32" />
        <path d={`M0 ${LS(0)} L540 ${LS(540)} L540 ${LS(540) + 70} L0 ${LS(0) + 40} Z`} fill="#d8d8de" />
        <path d={`M0 ${LS(0) - 24} L540 ${LS(540) - 24}`} stroke="#c84a3c" strokeWidth={4} />
        <Hero x={qx} y={LS(qx) + 4} s={1.15} pose={SLOPE_SIT} look={GREY} shadow={0} flip />
        {Array.from({ length: 80 }, (_, i) => { const r = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1, r2 = Math.abs(Math.sin(i * 78.233) * 43758.5453) % 1; const px = r * 560, py = r2 * 1920; return <line key={i} x1={px} y1={py} x2={px - 30} y2={py - 13} stroke="#e8e8ec" strokeWidth={3.5} opacity={0.6} strokeLinecap="round" />; })}
      </g>
      <g clipPath="url(#cr)">
        <rect x={540} y={0} width={540} height={1920} fill="url(#sunr)" />
        <Glow at={[880, 1080]} r={520} color={GOLD} a={0.7} />
        <Rays f={0} at={[880, 1080]} a={0.45} color={GOLD} n={16} len={900} />
        <circle cx={900} cy={1110} r={170} fill="#ffe2a0" />
        <path d={`M540 1700 L${hx} ${hy} L1080 1420 L1080 1920 L540 1920 Z`} fill="#26262c" stroke="#000" strokeWidth={4} />
        <path d={`M600 1570 L${hx} ${hy} L1040 1440 L${hx + 60} ${hy + 120} L${hx - 40} ${hy + 90} Z`} fill="#f2ead8" />
        <Glow at={[hx, hy - 220]} r={260} color={GOLD} a={0.6} />
        <Hero x={hx} y={hy} s={0.95} pose={flagPose} look={HERO} />
        <line x1={fj.wN[0] - 10} y1={fj.wN[1] + 60} x2={top[0]} y2={top[1]} stroke="#e8e8ec" strokeWidth={9} strokeLinecap="round" />
        <path d={`M${top[0]} ${top[1]} q-60 -30 -120 -4 t-120 4 q12 46 -6 92 q60 -28 120 4 t120 -4 Z`} fill={GOLD} stroke="#000" strokeWidth={3} />
      </g>
      <rect x={533} y={0} width={14} height={1920} fill="#000" />
      <Shade y0={300} y1={560} />
      <T y={460} s={96} c="#ffffff" t="448 m APART" />
      <Tag x={270} y={1470} t="QUIT" c="#e0483e" s={72} />
      <Tag x={810} y={1470} t="DIDN&apos;T" c={GOLD} s={72} />
      <text x={270} y={1565} textAnchor="middle" fontFamily={BLACK} fontSize={46} fill="#d8d8dc" stroke="#000" strokeWidth={4} paintOrder="stroke">8,400 m</text>
      <text x={810} y={1565} textAnchor="middle" fontFamily={BLACK} fontSize={46} fill="#ffffff" stroke="#000" strokeWidth={4} paintOrder="stroke">8,848 m</text>
    </g>
  );
};
const OPTS = [O0, O1, O2, O3];
export const TrustThumb: React.FC = () => {
  const O = OPTS[Math.min(OPTS.length - 1, useCurrentFrame())];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <KitDefs />
        <Defs />
        <O />
        <Vignette a={0.25} />
      </svg>
    </AbsoluteFill>
  );
};
