// ep007 thumbnail (one still, 1080x1920): Leonidas roaring behind his red shield in the foreground, a huge dark sea of Persian
// silhouettes at sunset behind him, a giant "300" over "vs 1,000,000?" and a REAL or MYTH? badge. Text stays in the top 45 % and out of
// the right 12 %. No blood: the picture is the contrast (one small group, an enormous army).
import React from "react";
import { AbsoluteFill } from "remotion";
import { Hoplite, LEONIDAS, spartan, POSES } from "../../flat/characters/thermo";
import { FONT, INK, PAL } from "../../flat/style";
import { Horde, Ridge } from "./Scenes";

const stroke = (px: number): React.CSSProperties => ({ WebkitTextStroke: `${px}px ${INK}`, paintOrder: "stroke fill" });

export const Ep007Thumb: React.FC = () => (
  <AbsoluteFill style={{ background: "#f08a4a" }}>
    <AbsoluteFill style={{ background: "linear-gradient(#e8643a 0%, #f59a4e 38%, #fbd18a 62%, #fbe3b8 100%)" }} />
    <div style={{ position: "absolute", left: 250, top: 640, width: 560, height: 560, borderRadius: 280, background: "radial-gradient(rgba(255,244,200,0.95), rgba(255,220,140,0.0) 68%)" }} />
    <Ridge pts="0,1180 0,820 150,740 330,900 520,780 760,920 1080,800 1080,1180" fill="#b0745a" />
    <Horde seed={7} layers={[
      { y: 1010, h: 190, n: 46, x0: 0, x1: 1160, fill: "#7a5470" },
      { y: 1180, h: 300, n: 24, x0: 0, x1: 1180, fill: "#4d3558" },
      { y: 1420, h: 440, n: 9, x0: 380, x1: 1240, fill: "#2c1f3c" },
    ]} />
    <div style={{ position: "absolute", left: 0, top: 1480, width: 1080, height: 440, background: "linear-gradient(rgba(60,35,45,0), rgba(60,35,45,0.55))" }} />
    {/* the small line of Spartans in front of the sea, then the king of them all */}
    {[0, 1, 2, 3].map((i) => <Hoplite key={i} spec={spartan(i + 1)} x={620 + i * 100} y={1700 + (i % 2) * 8} scale={0.62} pose={POSES.shield_lock} mood="fierce" blink={false} />)}
    <Hoplite spec={LEONIDAS} x={300} y={1790} scale={1.28} pose={{ ...POSES.shield_lock, handL: [76, -196], handR: [20, -380], lean: 10, headTilt: -4 }} mood="roar" blink={false} />

    <div style={{ position: "absolute", left: 0, right: 110, top: 40, textAlign: "center", fontFamily: FONT, lineHeight: 0.9, textTransform: "uppercase" }}>
      <div style={{ fontSize: 330, color: PAL.gold, ...stroke(34), transform: "rotate(-3deg)", textShadow: "0 14px 0 rgba(27,27,47,0.45)" }}>300</div>
      <div style={{ fontSize: 108, color: "#fff", ...stroke(18), transform: "rotate(-2deg)", marginTop: 6, whiteSpace: "nowrap" }}>VS 1,000,000?</div>
    </div>
    <div style={{ position: "absolute", left: 52, top: 640, transform: "rotate(-6deg)", display: "flex", border: `10px solid ${INK}`, borderRadius: 26, overflow: "hidden", boxShadow: "0 12px 0 rgba(27,27,47,0.45)" }}>
      <div style={{ background: PAL.fail, color: "#fff", fontFamily: FONT, fontSize: 84, padding: "6px 28px" }}>REAL</div>
      <div style={{ background: "#fff", color: INK, fontFamily: FONT, fontSize: 50, padding: "6px 14px", display: "flex", alignItems: "center" }}>or</div>
      <div style={{ background: PAL.myth, color: "#fff", fontFamily: FONT, fontSize: 84, padding: "6px 28px" }}>MYTH?</div>
    </div>
  </AbsoluteFill>
);
