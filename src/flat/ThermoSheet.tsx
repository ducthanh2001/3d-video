// Character sheet of the Thermopylae episode (still, 1080x1920): Pip, the Greeks, the Persians, Xerxes, Ephialtes and the three
// spear-thrust poses from the shared rig. `npx remotion still src/index.ts ThermoSheet out/thermo-sheet.png --scale=0.5`
import React from "react";
import { AbsoluteFill } from "remotion";
import { Pip } from "./characters/pip";
import { EPHIALTES, GREEK_GOLD, Hoplite, LEONIDAS, LEONIDAS_ORDER, PERSIAN_ARCHER, PersianFig, SPARTAN, THESPIAN, XerxesFig } from "./characters/thermo";
import { FONT, INK, PAL } from "./style";

export const THERMO_SHEET_W = 1080, THERMO_SHEET_H = 1920;

const Label: React.FC<{ x: number; y: number; text: string; size?: number }> = ({ x, y, text, size = 24 }) => (
  <div style={{ position: "absolute", left: x - 135, width: 270, top: y, textAlign: "center", fontFamily: FONT, fontSize: size, color: INK }}>{text}</div>
);

const S = 0.46;
export const ThermoSheet: React.FC = () => (
  <AbsoluteFill style={{ background: PAL.bgWarm }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 18, textAlign: "center", fontFamily: FONT, fontSize: 38, color: INK }}>THERMOPYLAE · CAST ON ONE RIG</div>

    {/* row 1 */}
    <Pip x={135} y={455} scale={0.4} pose="idle" expression="curious" blink={false} />
    <Label x={135} y={470} text="PIP" />
    <Hoplite x={405} y={455} scale={S} pose="stand" mood="fierce" blink={false} />
    <Label x={405} y={470} text="SPARTAN" />
    <Hoplite spec={LEONIDAS} x={675} y={455} scale={S} pose="stand_firm" mood="fierce" blink={false} />
    <Label x={675} y={470} text="LEONIDAS" />
    <Hoplite spec={THESPIAN} x={945} y={455} scale={S} pose="stand" mood="calm" blink={false} />
    <Label x={945} y={470} text="THESPIAN" />

    {/* row 2 */}
    <Hoplite spec={GREEK_GOLD} x={135} y={905} scale={S} pose="march" mood="calm" blink={false} />
    <Label x={135} y={920} text="GREEK ALLY" />
    <PersianFig x={405} y={905} scale={S} pose="persian_block" mood="fierce" blink={false} flip />
    <Label x={405} y={920} text="PERSIAN SOLDIER" />
    <PersianFig spec={PERSIAN_ARCHER} x={675} y={905} scale={S} pose="persian_block" mood="calm" blink={false} flip />
    <Label x={675} y={920} text="PERSIAN ARCHER" />
    <Hoplite spec={EPHIALTES} x={945} y={905} scale={S} pose="point_up" mood="worried" blink={false} />
    <Label x={945} y={920} text="EPHIALTES" />

    {/* row 3: Xerxes on his throne, Leonidas giving the order */}
    <XerxesFig x={200} y={1330} scale={S} mood="calm" blink={false} />
    <Label x={330} y={1360} text="XERXES" />
    <Hoplite spec={LEONIDAS_ORDER} x={560} y={1330} scale={S} pose="wave_off" mood="roar" blink={false} />
    <Label x={560} y={1345} text="LEONIDAS ORDER" />
    <Hoplite spec={SPARTAN} x={860} y={1330} scale={S} pose="walk_away" mood="calm" blink={false} flip />
    <Label x={860} y={1345} text="WALK AWAY" />

    {/* row 4: the spear thrust, three poses of the same rig */}
    {(["thrust_windup", "thrust_contact", "thrust_follow"] as const).map((p, i) => (
      <React.Fragment key={p}>
        <Hoplite x={150 + i * 320} y={1760} scale={0.36} pose={p} mood={i === 1 ? "roar" : "fierce"} blink={false} />
        <Label x={190 + i * 320} y={1782} text={p.replace("thrust_", "").toUpperCase()} size={22} />
      </React.Fragment>
    ))}
  </AbsoluteFill>
);
