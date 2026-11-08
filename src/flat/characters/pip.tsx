// Pip: the presenter of "Real or Myth?" (fixed in every episode). Young adult: adult body proportions, round head, teal knit
// beanie with a gold pom-pom, orange scarf, freckles, big curious eyes, dark-blue coat. Carries a notebook and a magnifier.
import React from "react";
import { Cloud, CharProps, FlatCharacter, FlatSpec, Tube, sw, swFill } from "../FlatCharacter";
import { PAL } from "../style";

const TROUSERS = "#2b3a55", BOOTS = "#5a3a2a";

const legs = (
  <g>
    {[-1, 1].map((sd) => (
      <g key={sd}>
        <Tube d={`M${sd * 38} -140 L${sd * 38} -26`} w={32} fill={TROUSERS} />
        <ellipse cx={sd * 38 + sd * 10} cy={-14} rx={36} ry={18} style={swFill(BOOTS)} />
      </g>
    ))}
  </g>
);

const torso = (
  <g>
    <ellipse cx={0} cy={-250} rx={92} ry={132} style={swFill(PAL.jacket)} />
    <path d="M0 -352 L0 -122" fill="none" style={sw(0.6)} />
    <path d="M-64 -230 L-30 -230 L-30 -190 L-64 -190 Z" style={{ ...swFill("#27506f", 0.6) }} />
    {/* scarf: a band under the chin and one tail hanging down the front */}
    <path d="M-92 -352 Q0 -300 92 -352 L96 -318 Q0 -268 -96 -318 Z" style={swFill(PAL.scarf)} />
    <path d="M30 -312 L80 -304 L86 -190 L40 -184 Z" style={swFill(PAL.scarf)} />
    {[-168, -150].map((ly) => <line key={ly} x1={46} y1={ly} x2={80} y2={ly - 2} style={{ ...sw(0.4), stroke: "#b85f10" }} />)}
  </g>
);

const hairFront = (
  <g>
    <Cloud c={[[0, -648, 31]]} fill={PAL.gold} />
    <path d="M-118 -540 C-126 -668 126 -668 118 -540 Z" style={swFill(PAL.pip)} />
    <path d="M-60 -600 Q-50 -636 -30 -644" fill="none" style={{ stroke: "#7fd6d1", strokeWidth: 9, strokeLinecap: "round" }} />
    <rect x={-126} y={-572} width={252} height={44} rx={20} style={swFill(PAL.pipDark)} />
    {[-96, -64, -32, 0, 32, 64, 96].map((rx) => <line key={rx} x1={rx} y1={-564} x2={rx} y2={-536} style={{ ...sw(0.4), stroke: "#0e5f5b" }} />)}
  </g>
);

export const PIP: FlatSpec = {
  size: 1, shoulderX: 86, sleeve: PAL.jacket, freckles: true, legs, torso, hairFront,
  hairBack: <Cloud c={[[-104, -520, 26], [104, -520, 26]]} fill="#6b4630" />,
};

export const Pip: React.FC<CharProps> = (p) => <FlatCharacter spec={PIP} {...p} />;
