// ep005 thumbnail (one still, 1080x1920): the hook scene (old Einstein shocked in front of the blackboard with the giant red F,
// the class gasping below) plus the headline and a REAL or MYTH? badge. Text stays in the top third and out of the right 12 %.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Classroom } from "./Ep005";
import { FONT, INK, PAL } from "../../flat/style";

const stroke = (px: number): React.CSSProperties => ({ WebkitTextStroke: `${px}px ${INK}`, paintOrder: "stroke fill" });

export const Ep005Thumb: React.FC = () => (
  <AbsoluteFill style={{ background: PAL.bgWarm }}>
    <Classroom loop />
    <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(255,244,224,0.0) 0%, rgba(255,244,224,0) 100%)" }} />
    <div style={{ position: "absolute", left: 0, right: 130, top: 70, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: FONT, textTransform: "uppercase", lineHeight: 1 }}>
      <div style={{ fontSize: 140, color: "#fff", ...stroke(20), transform: "rotate(-2deg)" }}>EINSTEIN</div>
      <div style={{ fontSize: 100, color: PAL.gold, ...stroke(20), transform: "rotate(-2deg)", whiteSpace: "nowrap", marginTop: 6 }}>FAILED MATH?</div>
    </div>
    <div style={{ position: "absolute", left: 60, top: 400, transform: "rotate(-5deg)", display: "flex", border: `10px solid ${INK}`, borderRadius: 24, overflow: "hidden", boxShadow: "0 12px 0 rgba(27,27,47,0.4)" }}>
      <div style={{ background: PAL.fail, color: "#fff", fontFamily: FONT, fontSize: 70, padding: "6px 26px" }}>REAL</div>
      <div style={{ background: "#fff", color: INK, fontFamily: FONT, fontSize: 46, padding: "6px 14px", display: "flex", alignItems: "center" }}>or</div>
      <div style={{ background: PAL.myth, color: "#fff", fontFamily: FONT, fontSize: 70, padding: "6px 26px" }}>MYTH?</div>
    </div>
  </AbsoluteFill>
);
