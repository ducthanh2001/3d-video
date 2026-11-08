// Exam paper: portrait sheet with ruled lines and a free corner for the F stamp (children are drawn in paper coordinates), or the
// scoring table mode ("GENERAL (non-science)", "MATH", "PHYSICS") with red / green / pending rows.
import React from "react";
import { INK, PAL, FONT } from "../style";

export type RowState = "red" | "green" | "pending";
export type TableRow = { label: string; state: RowState; star?: boolean };

export const DEFAULT_ROWS: TableRow[] = [
  { label: "GENERAL (non-science)", state: "pending" },
  { label: "MATH", state: "pending" },
  { label: "PHYSICS", state: "pending" },
];

const ink = { stroke: INK, strokeWidth: 8, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

export const ExamPaper: React.FC<{
  x: number; y: number; width?: number; rotate?: number; mode?: "paper" | "table"; rows?: TableRow[]; title?: string; children?: React.ReactNode;
}> = ({ x, y, width = 560, rotate = 0, mode = "paper", rows = DEFAULT_ROWS, title = "EXAM", children }) => {
  const h = width * 1.36;
  return (
    <svg width={width} height={h} viewBox="0 0 560 760" style={{ position: "absolute", left: x - width / 2, top: y - h / 2, transform: `rotate(${rotate}deg)`, overflow: "visible" }}>
      <rect x={12} y={20} width={540} height={740} rx={14} fill="rgba(27,27,47,0.18)" />
      <rect x={0} y={0} width={540} height={740} rx={14} fill={PAL.paper} {...ink} />
      {mode === "paper" ? (
        <g>
          <text x={40} y={84} fontFamily={FONT} fontSize={44} fill={INK}>{title}</text>
          <line x1={40} y1={106} x2={500} y2={106} {...ink} strokeWidth={5} />
          {Array.from({ length: 11 }, (_, i) => 160 + i * 46).map((ly, i) => (
            <path key={ly} d={`M40 ${ly} L${i % 3 === 2 ? 330 : 500} ${ly}`} stroke="#b9a98a" strokeWidth={5} strokeLinecap="round" />
          ))}
          <path d="M40 120 q18 -20 30 0 t30 0 t30 0" fill="none" stroke="#2a6fd6" strokeWidth={6} strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <text x={40} y={84} fontFamily={FONT} fontSize={44} fill={INK}>REPORT CARD</text>
          <line x1={40} y1={106} x2={500} y2={106} {...ink} strokeWidth={5} />
          {rows.map((r, i) => {
            const ry = 150 + i * 170, c = r.state === "red" ? PAL.fail : r.state === "green" ? PAL.myth : "#b9a98a";
            return (
              <g key={r.label}>
                <rect x={36} y={ry} width={468} height={140} rx={18} fill={r.state === "pending" ? "#f1e7d0" : c} {...ink} />
                <text x={60} y={ry + 62} fontFamily={FONT} fontSize={r.label.length > 10 ? 30 : 46} fill={r.state === "pending" ? INK : "#fff"}>{r.label}</text>
                <text x={60} y={ry + 112} fontFamily={FONT} fontSize={30} fill={r.state === "pending" ? "#8c7f63" : "#fff"}>
                  {r.state === "red" ? "FAILED" : r.state === "green" ? "WITH DISTINCTION" : "..."}
                </text>
                {r.star && <path d="M0 -26 L8 -8 L28 -6 L13 7 L18 27 L0 16 L-18 27 L-13 7 L-28 -6 L-8 -8 Z" transform={`translate(450 ${ry + 70})`} fill={PAL.gold} {...ink} strokeWidth={6} />}
              </g>
            );
          })}
        </g>
      )}
      <g>{children}</g>
    </svg>
  );
};
