// ActingSheet: every EMOTE pose on one frame, to approve the silhouettes (node scripts/stills.mjs ActingSheet out/kit/acting- 0 0.5)
import React from "react";
import { AbsoluteFill } from "remotion";
import { Hero, LOOK_WHITE } from "../hero";
import { EMOTE } from "../acting";

const NAMES = Object.keys(EMOTE) as (keyof typeof EMOTE)[];
export const ActingSheet: React.FC = () => (
  <AbsoluteFill style={{ background: "#0b0b0e" }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      {NAMES.map((n, i) => {
        const c = i % 4, r = Math.floor(i / 4), x = 140 + c * 270, y = 330 + r * 380;
        return (
          <g key={n}>
            <rect x={x - 120} y={y + 2} width={240} height={4} fill="#3a3a42" />
            <Hero x={x} y={y} s={0.62} pose={(EMOTE[n] as () => ReturnType<typeof EMOTE.slump>)()} look={LOOK_WHITE} />
            <text x={x} y={y + 50} textAnchor="middle" fontFamily="Segoe UI, Arial" fontWeight={700} fontSize={26} fill="#bdbdc4">{n}</text>
          </g>
        );
      })}
    </svg>
  </AbsoluteFill>
);
