// Character sheet of the flat series (still, 1080x1920): Pip in four poses, Einstein at 12/14/16/26/old, the ETH examiner, the
// eight expressions on Pip's face and the four stamps. `npx remotion still src/index.ts FlatCharacterSheet out/flat-sheet.png --scale=0.5`
import React from "react";
import { AbsoluteFill } from "remotion";
import { Pip } from "./characters/pip";
import { Einstein } from "./characters/einstein";
import { Judge } from "./characters/judge";
import { Stamp } from "./props/Stamp";
import { EXPRESSIONS, ExprName } from "./expressions";
import { INK, PAL, FONT } from "./style";

export const FLAT_SHEET_W = 1080, FLAT_SHEET_H = 1920;

const Label: React.FC<{ x: number; y: number; text: string; size?: number }> = ({ x, y, text, size = 30 }) => (
  <div style={{ position: "absolute", left: x - 150, width: 300, top: y, textAlign: "center", fontFamily: FONT, fontSize: size, color: INK }}>{text}</div>
);

const S = 0.5;
export const FlatCharacterSheet: React.FC = () => {
  const expr = Object.keys(EXPRESSIONS) as ExprName[];
  return (
    <AbsoluteFill style={{ background: PAL.bgWarm }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 20, textAlign: "center", fontFamily: FONT, fontSize: 40, color: INK }}>REAL OR MYTH?  CHARACTER SHEET</div>

      {/* Pip */}
      {([["idle", "neutral"], ["point", "curious"], ["magnifier", "curious"], ["shrug", "sweat"]] as const).map(([pose, ex], i) => (
        <React.Fragment key={pose}>
          <Pip x={135 + i * 270} y={452} scale={S} pose={pose} expression={ex} blink={false} />
          <Label x={135 + i * 270} y={464} text={`PIP · ${pose}`} size={26} />
        </React.Fragment>
      ))}

      {/* Einstein 12, 14, 16 */}
      <Einstein age={12} x={200} y={822} scale={S} pose="hold_book" expression="curious" blink={false} />
      <Label x={200} y={834} text="EINSTEIN 12" />
      <Einstein age={14} x={540} y={822} scale={S} pose="write" expression="proud" blink={false} />
      <Label x={540} y={834} text="EINSTEIN 14" />
      <Einstein age={16} x={880} y={822} scale={S} pose="idle" expression="sweat" blink={false} />
      <Label x={880} y={834} text="EINSTEIN 16" />

      {/* Einstein 26, old, examiner */}
      <Einstein age={26} x={200} y={1272} scale={S} pose="one_finger" expression="smirk" blink={false} />
      <Label x={200} y={1284} text="EINSTEIN 26" />
      <Einstein age="old" x={540} y={1272} scale={S} pose="idle" expression="neutral" blink={false} />
      <Label x={540} y={1284} text="EINSTEIN OLD" />
      <Judge x={880} y={1272} scale={S} pose="hold_stamp" expression="deadpan" blink={false} />
      <Label x={880} y={1284} text="ETH EXAMINER" />

      {/* expressions (Pip), two rows of four */}
      {expr.map((e, i) => {
        const cx = 135 + (i % 4) * 270, top = 1322 + Math.floor(i / 4) * 228;
        return (
          <React.Fragment key={e}>
            <Pip x={cx} y={top + 720 * 0.5} scale={0.5} crop="head" expression={e} blink={false} />
            <Label x={cx} y={top + 212} text={e.toUpperCase()} size={22} />
          </React.Fragment>
        );
      })}

      {/* stamps */}
      {(["F", "FAILED", "REAL", "MYTH"] as const).map((k, i) => <Stamp key={k} kind={k} x={135 + i * 270} y={1856} size={120} rotate={-10 + i * 6} />)}
    </AbsoluteFill>
  );
};
