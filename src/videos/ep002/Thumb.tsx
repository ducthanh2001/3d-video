// ep002 thumbnail (one still, 1080x1920): shot 20 of the episode world (Milo in shock, the dead pope on his throne behind
// him, the rats cheering on the step) plus a two-line headline and a REAL? stamp. Headline in the top third, nothing
// important in the bottom 20 % (the Shorts shelf lays the title over it).
import React from "react";
import { AbsoluteFill } from "remotion";
import { ShotView, useKit, cardText, FONT } from "./Ep002";
import { RO } from "./story";

export const THUMB_W = 1080, THUMB_H = 1920;

export const Ep002Thumb: React.FC = () => {
  const kit = useKit();
  if (!kit) return null;
  return (
    <AbsoluteFill style={{ background: "#2a2228" }}>
      {/* focus between Milo (z -1.25) and the throne (z -4.6), a light lens so both stay readable */}
      <ShotView id={20} kit={kit} alpha={1} frame={0} cInf={2.5} focus={[RO - 0.3, 1.6, -2.1]} />
      {/* darken the top so the headline reads over the hall */}
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(20,10,24,0.72) 0%, rgba(20,10,24,0.35) 22%, rgba(20,10,24,0) 34%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 90, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <div style={cardText(124)}>HIS CLIENT</div>
        <div style={{ ...cardText(210, "#ffe58a"), transform: "rotate(-3deg)" }}>IS DEAD.</div>
      </div>
      <div style={{ position: "absolute", left: 44, top: 540, transform: "rotate(-8deg)" }}>
        <div style={{ border: "14px solid #d8322d", borderRadius: 18, padding: "4px 30px", background: "rgba(255,255,255,0.92)", boxShadow: "0 10px 0 rgba(36,23,38,0.4)" }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 96, color: "#d8322d", letterSpacing: 4, lineHeight: 1.05 }}>REAL?</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
