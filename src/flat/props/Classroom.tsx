// Classroom set pieces: the room (wall, blackboard, wooden floor), a front-of-class desk row, and the rows of students that sit
// below the teacher (back row smaller, front row bigger, each behind a desk so only head and chest show).
import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Student } from "../characters/students";
import { ExprName } from "../expressions";
import { PoseName } from "../poses";
import { FONT, INK, PAL } from "../style";

const ink = { stroke: INK, strokeWidth: 8, strokeLinejoin: "round" as const };

/** wall + wooden floor + a blackboard high on the wall (the stamp lands on it) */
export const ClassroomRoom: React.FC<{ board?: React.ReactNode }> = ({ board }) => (
  <AbsoluteFill style={{ background: "linear-gradient(#f1e3c3 0%, #e6d3aa 100%)" }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      <rect x={0} y={1230} width={1080} height={690} fill="#b98a55" />
      {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M0 ${1290 + i * 80} H1080`} stroke="#9a6f3e" strokeWidth={4} />)}
      <path d="M0 1230 H1080" {...ink} />
      <rect x={0} y={1130} width={1080} height={100} fill="#c9b184" />
      <path d="M0 1130 H1080" {...ink} strokeWidth={6} />
      {/* windows with a sliver of sky on the sides */}
      {[22, 872].map((wx) => (
        <g key={wx}>
          <rect x={wx} y={460} width={186} height={430} rx={8} fill="#bfe3f7" {...ink} />
          <path d={`M${wx + 93} 460 V890 M${wx} 675 H${wx + 186}`} {...ink} strokeWidth={6} />
        </g>
      ))}
      {/* clock */}
      <circle cx={540} cy={420} r={44} fill="#fffaf0" {...ink} />
      <path d="M540 420 V392 M540 420 L560 430" {...ink} strokeWidth={6} strokeLinecap="round" />
    </svg>
    {board}
  </AbsoluteFill>
);

export const Desk: React.FC<{ x: number; y: number; width: number; height?: number }> = ({ x, y, width, height = 70 }) => (
  <svg width={width + 20} height={height + 40} viewBox={`0 0 ${width + 20} ${height + 40}`} style={{ position: "absolute", left: x - width / 2 - 10, top: y, overflow: "visible" }}>
    <rect x={10} y={0} width={width} height={height} rx={10} fill="#c58f58" {...ink} />
    <rect x={10} y={height - 14} width={width} height={14} fill="#a8723f" />
    <rect x={10} y={0} width={width} height={height} rx={10} fill="none" {...ink} />
  </svg>
);

/** the blackboard shown above the teacher: `children` are drawn in frame coordinates on top of it */
export const Blackboard: React.FC<{ x: number; y: number; width: number; title?: string }> = ({ x, y, width, title = "MATH" }) => {
  const h = width * 0.62;
  return (
    <div style={{ position: "absolute", left: x - width / 2, top: y - h / 2, width, height: h, background: "#2f5d4a", border: `14px solid #9a6b3a`, outline: `8px solid ${INK}`, borderRadius: 10, boxShadow: "0 12px 0 rgba(27,27,47,0.25)" }}>
      <div style={{ position: "absolute", left: 40, top: 22, fontFamily: '"Comic Sans MS","Segoe Print",cursive', fontSize: 70, color: "#f4f4ea", opacity: 0.92 }}>{title}</div>
      <div style={{ position: "absolute", left: 40, top: 120, fontFamily: '"Comic Sans MS","Segoe Print",cursive', fontSize: 52, color: "#f4f4ea", opacity: 0.8 }}>2 + 2 = 4</div>
      <div style={{ position: "absolute", left: 40, top: 190, fontFamily: '"Comic Sans MS","Segoe Print",cursive', fontSize: 52, color: "#f4f4ea", opacity: 0.8 }}>x² − 1 = 0</div>
    </div>
  );
};

type Seat = { v: number; x: number; expr: ExprName[]; pose?: PoseName };
const BACK: Seat[] = [
  { v: 0, x: 140, expr: ["shock", "curious", "shock"] },
  { v: 1, x: 400, expr: ["shock", "laugh", "laugh"] },
  { v: 2, x: 680, expr: ["shock", "shock", "curious"] },
  { v: 3, x: 940, expr: ["shock", "smirk", "laugh"] },
];
const FRONT: Seat[] = [
  { v: 4, x: 210, expr: ["shock", "laugh", "laugh"] },
  { v: 5, x: 560, expr: ["shock", "curious", "curious"], pose: "one_finger" },
  { v: 2, x: 900, expr: ["shock", "shock", "smirk"] },
];

const phase = (f: number) => (f < 22 ? 0 : f < 70 ? 1 : 2);

/** both rows of students with their desks; they gasp at first, then laugh or wonder; one raises a hand with a "?" */
export const ClassStudents: React.FC<{ from?: number; rowsOnly?: "back" | "front" }> = ({ from = 0, rowsOnly }) => {
  const f = useCurrentFrame() - from, { fps } = useVideoConfig();
  const ph = phase(Math.max(0, f));
  const q = spring({ frame: Math.max(0, f - 26), fps, config: { damping: 9, stiffness: 200, mass: 0.6 } });
  const bob = (i: number) => Math.sin((f + i * 9) * 0.22) * 3;
  return (
    <>
      {rowsOnly !== "front" && (
        <>
          {BACK.map((s, i) => <Student key={`b${i}`} variant={s.v} x={s.x} y={1560 + bob(i)} scale={0.55} expression={s.expr[ph]} pose={s.pose ?? "idle"} blink={false} />)}
          <Desk x={540} y={1440} width={1060} height={80} />
        </>
      )}
      {rowsOnly !== "back" && (
        <>
          {FRONT.map((s, i) => <Student key={`f${i}`} variant={s.v} x={s.x} y={1880 + bob(i + 3)} scale={0.82} expression={s.expr[ph]} pose={s.pose ?? "idle"} blink={false} />)}
          <Desk x={540} y={1690} width={1100} height={130} />
          {f >= 26 && (
            <div style={{ position: "absolute", left: 560 - 70, top: 1236 - 60 * q, width: 140, height: 140, borderRadius: 70, background: PAL.gold, border: `8px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: 100, color: INK, transform: `scale(${q}) rotate(-6deg)` }}>?</div>
          )}
        </>
      )}
    </>
  );
};
