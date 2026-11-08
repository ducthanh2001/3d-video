// Classroom extras: six generic students (round heads, different skin / hair / shirts), drawn from the same FlatCharacter base.
// They are meant to sit behind desks (only head and chest show), so legs are empty.
import React from "react";
import { Cloud, CharProps, FlatCharacter, FlatSpec, swFill } from "../FlatCharacter";

type Hair = "short" | "long" | "afro" | "bun" | "spiky";

const spec = (skin: string, hair: string, shirt: string, style: Hair, glasses = false): FlatSpec => {
  const front: Record<Hair, [number, number, number][]> = {
    short: [[-84, -574, 42], [-34, -594, 46], [22, -598, 46], [76, -578, 42], [112, -542, 30]],
    long: [[-72, -574, 40], [0, -590, 44], [72, -574, 40]],
    afro: [[-72, -588, 34], [0, -602, 38], [72, -588, 34]],
    bun: [[-84, -574, 42], [-34, -594, 46], [22, -598, 46], [76, -578, 42], [112, -542, 30], [0, -656, 34]],
    spiky: [[-80, -586, 30], [-40, -616, 30], [0, -626, 30], [40, -616, 30], [80, -586, 30]],
  };
  const back: Record<Hair, [number, number, number][]> = {
    short: [[-112, -500, 30], [112, -500, 30]],
    long: [[-126, -500, 42], [-130, -420, 38], [126, -500, 42], [130, -420, 38]],
    afro: [[-70, -624, 70], [10, -654, 76], [90, -624, 70], [-135, -562, 60], [140, -562, 60]],
    bun: [[-112, -500, 30], [112, -500, 30]],
    spiky: [[-112, -500, 26], [112, -500, 26]],
  };
  return {
    size: 1, skin, shoulderX: 86, sleeve: shirt, legs: <g />, ears: style !== "long" && style !== "afro",
    torso: (
      <g>
        <ellipse cx={0} cy={-250} rx={92} ry={132} style={swFill(shirt)} />
        <path d="M-40 -372 Q0 -330 40 -372" fill="none" style={{ ...swFill("none", 0.8) }} />
      </g>
    ),
    hairBack: <Cloud c={back[style]} fill={hair} />,
    hairFront: <Cloud c={front[style]} fill={hair} />,
    faceFront: glasses ? (
      <g>
        {[-48, 48].map((gx) => <circle key={gx} cx={gx} cy={-465} r={40} style={{ ...swFill("rgba(255,255,255,0.2)", 0.8), fill: "rgba(255,255,255,0.2)" }} />)}
        <path d="M-8 -470 Q0 -480 8 -470" fill="none" style={swFill("none", 0.7)} />
      </g>
    ) : undefined,
  };
};

export const STUDENTS: FlatSpec[] = [
  spec("#f2c9a0", "#3a2a22", "#e8743b", "short", true),
  spec("#a86d45", "#1d1612", "#4a90d9", "afro"),
  spec("#f6d8bd", "#c9772a", "#7bbf6a", "long"),
  spec("#d9a273", "#1d1612", "#b85fc9", "bun"),
  spec("#f2c9a0", "#7a4a2a", "#f2c94c", "spiky", true),
  spec("#8a5a3a", "#2a1a14", "#e0566b", "short"),
];

export const Student: React.FC<{ variant: number } & CharProps> = ({ variant, ...p }) => <FlatCharacter spec={STUDENTS[variant % STUDENTS.length]} {...p} />;
