// Flat backgrounds: a few colour blocks and a soft gradient each. All fill the 1080x1920 frame.
import React from "react";
import { AbsoluteFill } from "remotion";
import { INK, PAL } from "../style";

const ink = { stroke: INK, strokeWidth: 8, strokeLinejoin: "round" as const };

/** warm plain room: wall, a skirting line and a floor */
export const RoomWarm: React.FC = () => (
  <AbsoluteFill style={{ background: `linear-gradient(#fff9ec 0%, ${PAL.bgWarm} 55%, #ffe6bf 100%)` }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      <rect x={0} y={1290} width={1080} height={630} fill="#e8b97a" />
      <path d="M0 1290 H1080" {...ink} />
      <circle cx={170} cy={300} r={120} fill="#ffe9b5" opacity={0.7} />
      <circle cx={960} cy={560} r={70} fill="#ffe9b5" opacity={0.6} />
    </svg>
  </AbsoluteFill>
);

/** stone exam hall: grey wall with arched windows, rows of wooden desks */
export const ExamHall: React.FC = () => (
  <AbsoluteFill style={{ background: `linear-gradient(#a6abb5 0%, ${PAL.stone} 60%, #7a7f89 100%)` }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      {[110, 450, 790].map((wx) => (
        <g key={wx}>
          <path d={`M${wx} 620 V300 A${80} ${80} 0 0 1 ${wx + 160} 300 V620 Z`} fill="#cfe6f5" {...ink} />
          <path d={`M${wx + 80} 220 V620 M${wx} 420 H${wx + 160}`} {...ink} strokeWidth={6} />
        </g>
      ))}
      {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M0 ${700 + i * 62} H1080`} stroke="#6f747e" strokeWidth={3} />)}
      <rect x={0} y={1230} width={1080} height={690} fill="#8a6a44" />
      <path d="M0 1230 H1080" {...ink} />
      {[0, 1].map((r) => (
        <g key={r}>
          <rect x={40 + r * 40} y={1660 + r * 130} width={1000 - r * 80} height={64} rx={10} fill="#b98a55" {...ink} />
          <rect x={70 + r * 40} y={1724 + r * 130} width={34} height={60} fill="#8a5a2a" {...ink} />
          <rect x={976 - r * 80} y={1724 + r * 130} width={34} height={60} fill="#8a5a2a" {...ink} />
        </g>
      ))}
    </svg>
  </AbsoluteFill>
);

/** patent office: pale wall, a window onto a Bern roofline, filing shelves */
export const Office: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(#f1e6cf 0%, #e6d4ae 100%)" }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      <rect x={120} y={260} width={380} height={470} rx={10} fill="#bfe3f7" {...ink} />
      <path d="M310 260 V730 M120 495 H500" {...ink} strokeWidth={6} />
      <path d="M120 730 L190 640 L260 690 L330 600 L400 680 L500 620 V730 Z" fill="#9aa6b8" opacity={0.8} />
      <rect x={600} y={240} width={380} height={640} rx={8} fill="#8a5a2a" {...ink} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={620} y={262 + i * 154} width={340} height={130} rx={6} fill="#a86b3a" {...ink} strokeWidth={6} />)}
      {[0, 1, 2, 3].map((i) => <rect key={i} x={760} y={310 + i * 154} width={60} height={24} rx={6} fill={PAL.gold} {...ink} strokeWidth={5} />)}
      <rect x={0} y={1280} width={1080} height={640} fill="#b98a55" />
      <path d="M0 1280 H1080" {...ink} />
    </svg>
  </AbsoluteFill>
);
