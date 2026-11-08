// Set pieces: a giant algebra book, a chalkboard with simple (decorative) formulas, a patent-office desk with four papers that
// fly up and arrange themselves into a "4".
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { INK, PAL, FONT } from "../style";

const ink = { stroke: INK, strokeWidth: 8, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

export const BigBook: React.FC<{ x: number; y: number; width?: number; title?: string }> = ({ x, y, width = 620, title = "ALGEBRA" }) => {
  const h = width * 0.62;
  return (
    <svg width={width} height={h} viewBox="0 0 620 384" style={{ position: "absolute", left: x - width / 2, top: y - h, overflow: "visible" }}>
      <rect x={20} y={40} width={590} height={330} rx={16} fill="#3a2a6a" {...ink} />
      <rect x={0} y={20} width={590} height={330} rx={16} fill="#6a4bb0" {...ink} />
      <rect x={52} y={64} width={486} height={110} rx={10} fill={PAL.paper} {...ink} strokeWidth={6} />
      <text x={295} y={142} textAnchor="middle" fontFamily={FONT} fontSize={74} fill={INK}>{title}</text>
      <path d="M52 230 H538 M52 270 H420" stroke={PAL.gold} strokeWidth={10} strokeLinecap="round" />
      <path d="M0 330 Q295 372 590 330" fill="none" stroke="#f1e7d0" strokeWidth={12} />
    </svg>
  );
};

const LINES = ["y = 2x + 3", "x² − 4 = 0", "∫ x dx = x²/2", "a² + b² = c²"];

/** `lines` = how many formula lines are already written (can be fractional to draw the last one) */
export const Chalkboard: React.FC<{ x: number; y: number; width?: number; lines?: number }> = ({ x, y, width = 760, lines = 4 }) => {
  const h = width * 0.66;
  return (
    <svg width={width} height={h} viewBox="0 0 760 500" style={{ position: "absolute", left: x - width / 2, top: y - h / 2, overflow: "visible" }}>
      <rect x={0} y={0} width={760} height={500} rx={14} fill="#2f5d4a" stroke="#9a6b3a" strokeWidth={22} />
      <rect x={0} y={0} width={760} height={500} rx={14} fill="none" {...ink} strokeWidth={6} />
      {LINES.map((t, i) => {
        const k = Math.max(0, Math.min(1, lines - i));
        return k > 0 ? <text key={t} x={56} y={110 + i * 90} fontFamily='"Comic Sans MS","Segoe Print",cursive' fontSize={58} fill="#f4f4ea" opacity={0.92} clipPath="inset(0)" textLength={Math.max(60, t.length * 31 * k)} lengthAdjust="spacingAndGlyphs">{k >= 1 ? t : t.slice(0, Math.ceil(t.length * k))}</text> : null;
      })}
      <rect x={30} y={468} width={120} height={14} rx={7} fill="#f4f4ea" opacity={0.85} />
    </svg>
  );
};

/** desk with four sheets; from frame `at` they rise and settle into the shape of a "4" */
export const PatentDesk: React.FC<{ x: number; y: number; width?: number; at?: number }> = ({ x, y, width = 760, at = 0 }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  // target slots forming a 4: left stroke (2 sheets stacked diagonally), bar, right stem
  const slots: [number, number, number][] = [[-110, -340, -8], [-70, -230, 6], [30, -270, 90], [118, -300, 0]];
  const h = width * 0.5;
  return (
    <div style={{ position: "absolute", left: x - width / 2, top: y - h, width, height: h + 420, overflow: "visible" }}>
      <svg width={width} height={h} viewBox="0 0 760 380" style={{ position: "absolute", left: 0, top: 420, overflow: "visible" }}>
        <rect x={0} y={90} width={760} height={34} rx={10} fill="#a86b3a" {...ink} />
        <rect x={40} y={124} width={46} height={250} fill="#8a5528" {...ink} />
        <rect x={674} y={124} width={46} height={250} fill="#8a5528" {...ink} />
        <rect x={290} y={58} width={190} height={34} rx={8} fill="#2f6f9a" {...ink} />
        <rect x={560} y={50} width={90} height={42} rx={6} fill={PAL.gold} {...ink} strokeWidth={6} />
      </svg>
      {(() => {
        const k = spring({ frame: Math.max(0, f - at - 16), fps, config: { damping: 9, stiffness: 160, mass: 0.6 } });
        return f >= at + 16 ? (
          <svg width={width} height={420} viewBox={`0 0 ${width} 420`} style={{ position: "absolute", left: 0, top: 40, overflow: "visible" }}>
            <text x={width / 2} y={330} textAnchor="middle" fontFamily={FONT} fontSize={380} fill={PAL.gold} stroke={INK} strokeWidth={14} paintOrder="stroke" style={{ transformOrigin: `${width / 2}px 230px`, transform: `scale(${k})` }}>4</text>
          </svg>
        ) : null;
      })()}
      {slots.map(([sx, sy, rot], i) => {
        const t = f - at - i * 4, k = spring({ frame: Math.max(0, t), fps, config: { damping: 11, stiffness: 120, mass: 0.8 } });
        const px = interpolate(k, [0, 1], [0, sx]), py = interpolate(k, [0, 1], [0, sy]);
        return (
          <svg key={i} width={150} height={190} viewBox="0 0 150 190" style={{ position: "absolute", left: width / 2 - 75 + px, top: 360 + py + 100, transform: `rotate(${interpolate(k, [0, 1], [-14, rot])}deg)`, opacity: t < 0 ? 0 : 1 }}>
            <rect x={6} y={6} width={130} height={170} rx={8} fill={PAL.paper} {...ink} strokeWidth={6} />
            {[44, 72, 100, 128].map((ly) => <path key={ly} d={`M26 ${ly} H116`} stroke="#b9a98a" strokeWidth={5} strokeLinecap="round" />)}
          </svg>
        );
      })}
    </div>
  );
};
