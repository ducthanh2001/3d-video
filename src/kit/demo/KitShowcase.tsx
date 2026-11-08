// KitShowcase: ~45 s vertical film that shows every part of the kit in motion (characters, materials, props, animals, crowds,
// effects, camera moves and transitions). Each scene is a pure function of its own frame.
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { S1Stage, S1_LEN } from "./s1Stage";
import { S2Wall, S2_LEN } from "./s2Wall";
import { S3Bed, S3_LEN } from "./s3Bed";
import { S4Farm, S4_LEN } from "./s4Farm";
import { S5Plaza, S5_LEN } from "./s5Plaza";
import { S6Castle, S6_LEN } from "./s6Castle";
import { S7Stadium, S7_LEN } from "./s7Stadium";

const SCENES: [React.FC<{ f: number }>, number][] = [[S1Stage, S1_LEN], [S2Wall, S2_LEN], [S3Bed, S3_LEN], [S4Farm, S4_LEN], [S5Plaza, S5_LEN], [S6Castle, S6_LEN], [S7Stadium, S7_LEN]];
export const SHOWCASE_STARTS = SCENES.map((_, i) => SCENES.slice(0, i).reduce((s, [, l]) => s + l, 0));
export const SHOWCASE_FRAMES = SCENES.reduce((s, [, l]) => s + l, 0);

const Local: React.FC<{ C: React.FC<{ f: number }> }> = ({ C }) => { const f = useCurrentFrame(); return <C f={f} />; };

export const KitShowcase: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    {SCENES.map(([C, len], i) => (
      <Sequence key={i} from={SHOWCASE_STARTS[i]} durationInFrames={len}><Local C={C} /></Sequence>
    ))}
  </AbsoluteFill>
);
