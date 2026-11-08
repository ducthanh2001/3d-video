// Cartoon Einstein at five ages, drawn from scratch (no photo reference): 12, 14, 16, 26 and "old" (cloud of white hair, thick
// grey moustache, gentle drooping eyes, brown sweater). Recognisable from the hair, not from copying any picture.
// The old version never sticks out its tongue (that pose is a famous photograph).
import React from "react";
import { Cloud, CharProps, FlatCharacter, FlatSpec, Tube, sw, swFill } from "../FlatCharacter";
import { INK, PAL } from "../style";

export type EinsteinAge = 12 | 14 | 16 | 26 | "old";

const BROWN = "#6b4630";

const shoes = (color: string) => (
  <g>{[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 38 + sd * 10} cy={-14} rx={36} ry={18} style={swFill(color)} />)}</g>
);
const longLegs = (color: string, shoe: string) => (
  <g>
    {[-1, 1].map((sd) => <Tube key={sd} d={`M${sd * 38} -140 L${sd * 38} -26`} w={32} fill={color} />)}
    {shoes(shoe)}
  </g>
);
const shortLegs = (shorts: string, shoe: string) => (
  <g>
    {[-1, 1].map((sd) => (
      <g key={sd}>
        <Tube d={`M${sd * 38} -110 L${sd * 38} -30`} w={26} fill={PAL.skin} />
        <Tube d={`M${sd * 38} -52 L${sd * 38} -28`} w={30} fill="#f4f4f4" />
        <Tube d={`M${sd * 38} -140 L${sd * 38} -84`} w={38} fill={shorts} />
      </g>
    ))}
    {shoes(shoe)}
  </g>
);

const wavy = (c: [number, number, number][]) => <Cloud c={c} fill={BROWN} />;

const SPECS: Record<string, FlatSpec> = {
  // 12 and 14: short wavy brown hair, round-neck shirt, shorts; smaller and younger
  "12": {
    size: 0.64, headScale: 1.1, shoulderX: 84, sleeve: "#f3ead8", legs: shortLegs("#6b5a3a", "#3a2a22"),
    torso: (
      <g>
        <ellipse cx={0} cy={-250} rx={92} ry={132} style={swFill("#f3ead8")} />
        <path d="M-40 -372 Q0 -328 40 -372" fill="none" style={sw(0.8)} />
        {[-240, -200, -160].map((by) => <circle key={by} cx={0} cy={by} r={5} fill={INK} />)}
      </g>
    ),
    hairBack: wavy([[-112, -500, 30], [112, -500, 30]]),
    hairFront: wavy([[-84, -572, 40], [-34, -592, 44], [22, -596, 44], [74, -580, 42], [112, -548, 30]]),
  },
  "14": {
    size: 0.72, headScale: 1.07, shoulderX: 86, sleeve: "#f3ead8", legs: shortLegs("#5b6275", "#3a2a22"),
    torso: (
      <g>
        <ellipse cx={0} cy={-250} rx={92} ry={132} style={swFill("#f3ead8")} />
        <path d="M-40 -372 Q0 -328 40 -372" fill="none" style={sw(0.8)} />
        <path d="M-60 -372 L-40 -250 M60 -372 L40 -250" fill="none" style={{ ...sw(0.9), stroke: "#7a4b2a" }} />
        {[-232, -196].map((by) => <circle key={by} cx={0} cy={by} r={5} fill={INK} />)}
      </g>
    ),
    hairBack: wavy([[-114, -504, 32], [114, -504, 32]]),
    hairFront: wavy([[-90, -572, 42], [-38, -594, 46], [20, -600, 46], [76, -584, 44], [114, -548, 32]]),
  },
  // 16: longer wavy hair that covers the ears, school jacket, a tense face (sweat comes from the expression)
  "16": {
    size: 0.84, headScale: 1.04, shoulderX: 88, sleeve: "#2c3e63", legs: longLegs("#6b6f7a", "#2a2230"), ears: false,
    torso: (
      <g>
        <ellipse cx={0} cy={-250} rx={92} ry={132} style={swFill("#2c3e63")} />
        <path d="M-34 -368 L0 -300 L34 -368 Z" style={swFill("#f3f3f3", 0.7)} />
        <path d="M0 -300 L0 -122" fill="none" style={sw(0.6)} />
        {[-250, -200].map((by) => <circle key={by} cx={8} cy={by} r={6} style={swFill(PAL.gold, 0.5)} />)}
      </g>
    ),
    hairBack: wavy([[-122, -520, 36], [-126, -450, 32], [-116, -396, 26], [122, -520, 36], [126, -450, 32], [116, -396, 26]]),
    hairFront: wavy([[-92, -578, 44], [-40, -598, 48], [18, -604, 48], [78, -590, 46], [118, -552, 34]]),
  },
  // 26: messy brown hair, small moustache, vest and tie
  "26": {
    size: 1, shoulderX: 88, sleeve: "#f3f3f3", legs: longLegs("#3b3b48", "#2a2230"),
    torso: (
      <g>
        <ellipse cx={0} cy={-250} rx={92} ry={132} style={swFill("#f3f3f3")} />
        <path d="M-80 -330 Q-90 -200 -60 -122 L-14 -140 L-26 -330 Z" style={swFill("#4a4458", 0.8)} />
        <path d="M80 -330 Q90 -200 60 -122 L14 -140 L26 -330 Z" style={swFill("#4a4458", 0.8)} />
        <path d="M-12 -366 L12 -366 L18 -330 L0 -190 L-18 -330 Z" style={swFill(PAL.fail, 0.7)} />
      </g>
    ),
    hairBack: wavy([[-118, -520, 34], [-120, -440, 28], [118, -520, 34], [120, -440, 28]]),
    hairFront: wavy([[-96, -580, 40], [-52, -606, 44], [0, -594, 38], [46, -614, 44], [92, -584, 40], [120, -550, 28]]),
    faceFront: <path d="M-46 -424 Q-24 -444 0 -428 Q24 -444 46 -424 Q24 -410 0 -420 Q-24 -410 -46 -424 Z" style={swFill(BROWN, 0.8)} />,
    mouthY: -398,
  },
  // old: cloud of white hair, thick grey moustache, droopy kind eyes, brown sweater
  old: {
    size: 0.98, shoulderX: 90, sleeve: "#8a5a3c", legs: longLegs("#6f7480", "#4a3226"), eyeLid: 0.22, mouthY: -386, browColor: "#8b8b86",
    torso: (
      <g>
        <ellipse cx={0} cy={-250} rx={96} ry={132} style={swFill("#8a5a3c")} />
        <path d="M-44 -372 Q0 -318 44 -372" fill="none" style={{ ...sw(1.2), stroke: "#5e3a24" }} />
        <path d="M-84 -156 Q0 -130 84 -156 L80 -128 Q0 -102 -80 -128 Z" style={swFill("#6e4529", 0.8)} />
        <path d="M-60 -290 Q-40 -240 -66 -200 M60 -290 Q40 -240 66 -200" fill="none" style={{ ...sw(0.5), stroke: "#a5714f" }} />
      </g>
    ),
    hairBack: (
      <Cloud
        c={[[-64, -628, 58], [14, -644, 64], [88, -616, 58], [-126, -574, 56], [136, -568, 56], [-158, -490, 46], [162, -486, 46], [-148, -414, 38], [152, -410, 38]]}
        fill="#f4f4f1"
      />
    ),
    hairFront: <Cloud c={[[-72, -586, 36], [-18, -600, 40], [38, -596, 40], [84, -580, 36]]} fill="#f4f4f1" />,
    faceFront: <Cloud c={[[-40, -424, 32], [40, -424, 32], [0, -430, 28]]} fill="#d6d6d0" />,
  },
};

export const Einstein: React.FC<{ age: EinsteinAge } & CharProps> = ({ age, ...p }) => <FlatCharacter spec={SPECS[String(age)]} {...p} />;
