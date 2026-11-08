// ETH examiner: taller, round skull with a square chin, pince-nez glasses, centre-parted hair, long black gown, a big stamp.
import React from "react";
import { Cloud, CharProps, FlatCharacter, FlatSpec, sw, swFill } from "../FlatCharacter";
import { INK } from "../style";

const GOWN = "#1a1a24", HAIR = "#2a2230";

const spec: FlatSpec = {
  size: 1.16, headShape: "square", shoulderX: 100, sleeve: GOWN, armW: 34, browColor: "#2a2230", mouthY: -402,
  legs: <g>{[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 44 + sd * 12} cy={-14} rx={38} ry={18} style={swFill("#2a1a14")} />)}</g>,
  torso: (
    <g>
      <path d="M-74 -372 Q-130 -250 -128 -40 Q0 -4 128 -40 Q130 -250 74 -372 Z" style={swFill(GOWN)} />
      <path d="M-30 -366 L0 -250 L30 -366 Z" style={swFill("#f3f3f3", 0.7)} />
      <path d="M0 -250 L0 -40" fill="none" style={{ ...sw(0.6), stroke: "#3a3a4a" }} />
    </g>
  ),
  hairBack: <Cloud c={[[-118, -520, 28], [118, -520, 28]]} fill={HAIR} />,
  hairFront: (
    <g>
      <Cloud c={[[-84, -576, 46], [-34, -590, 46], [34, -590, 46], [84, -576, 46], [-114, -532, 26], [114, -532, 26]]} fill={HAIR} />
      <path d="M0 -636 L0 -566" fill="none" style={{ ...sw(0.5), stroke: "#6a5a72" }} />
    </g>
  ),
  faceFront: (
    <g>
      {[-48, 48].map((gx) => <circle key={gx} cx={gx} cy={-465} r={42} style={{ ...sw(0.9), fill: "rgba(255,255,255,0.28)" }} />)}
      <path d="M-8 -470 Q0 -480 8 -470" fill="none" style={sw(0.8)} />
      <path d="M-90 -470 L-118 -456" fill="none" style={{ stroke: INK, strokeWidth: 4 }} />
    </g>
  ),
};

export const Judge: React.FC<CharProps> = (p) => <FlatCharacter spec={spec} {...p} expression={p.expression ?? "deadpan"} pose={p.pose ?? "hold_stamp"} />;
