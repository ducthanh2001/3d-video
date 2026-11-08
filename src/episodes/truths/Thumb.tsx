// Thumbnail of SMALL TRUTHS (1080x1920): the strongest image of the film, readable at Shorts-grid size.
// Top: gold staircase + the hero with raised arms, "×37.8". Bottom: the red dot, "×0.03". Huge "1%" contrast lines.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Hero, POSES } from "../../kit/hero";
import { KitDefs, Vignette } from "../../kit/materials";
import { Glow } from "../../kit/fx";
import { GOLD, LINE, MONO, RED } from "./StyleFrames";

const BIG = '"Arial Black", Impact, "Segoe UI Black", sans-serif';
export const TruthsThumb: React.FC = () => {
  const steps = 12, sx = 120, sw = 64, sh = 38, base = 1100;
  const top: [number, number] = [sx + steps * sw - sw / 2 + 10, base - steps * sh];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <KitDefs />
        {/* top half: 1% better */}
        <text x={540} y={120} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={46} fill="#8a8a92">EVERY DAY FOR 1 YEAR:</text>
        <text x={540} y={260} textAnchor="middle" fontFamily={BIG} fontSize={120} fill="#ffffff">1% BETTER</text>
        {Array.from({ length: steps }, (_, k) => <path key={k} d={`M${sx + k * sw} ${base - k * sh} L${sx + k * sw} ${base - (k + 1) * sh} L${sx + (k + 1) * sw} ${base - (k + 1) * sh}`} fill="none" stroke={GOLD} strokeWidth={7} opacity={0.4 + 0.6 * (k / steps)} />)}
        <line x1={20} y1={base} x2={sx} y2={base} stroke={LINE} strokeWidth={4} />
        <Glow at={[top[0], top[1] - 90]} r={260} color={GOLD} a={0.55} />
        <Hero x={top[0]} y={top[1]} s={0.62} pose={POSES.armsUp()} shadow={0} />
        <text x={110} y={760} fontFamily={MONO} fontWeight={700} fontSize={150} fill={GOLD}>×37.8</text>

        {/* bottom half: 1% worse */}
        <text x={540} y={1330} textAnchor="middle" fontFamily={BIG} fontSize={120} fill="#ffffff">1% WORSE</text>
        <path d="M20 1720 L360 1720 Q540 1820 720 1720 L1060 1720" fill="none" stroke={LINE} strokeWidth={4} />
        <Glow at={[540, 1768]} r={160} color={RED} a={0.7} />
        <circle cx={540} cy={1768} r={16} fill={RED} />
        <text x={540} y={1580} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={150} fill={RED}>×0.03</text>
        <Vignette a={0.35} />
      </svg>
    </AbsoluteFill>
  );
};
