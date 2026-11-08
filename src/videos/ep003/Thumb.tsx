// ep003 thumbnail (one still, 1080x1920): shot 22 of the episode world (Milo in shock, the rooster staring into the lens beside
// the egg, the crowd packed behind them) plus a two-line headline and a REAL? stamp. Headline in the top third, nothing
// important in the bottom 20 % or the right 12 % (the Shorts shelf lays the title over it). No fire, no execution.
import React from "react";
import { AbsoluteFill } from "remotion";
import { ShotView, useKit, cardText, FONT } from "./Ep003";
import { SQ } from "./story";

export const THUMB_W = 1080, THUMB_H = 1920;

export const Ep003Thumb: React.FC = () => {
  const kit = useKit();
  if (!kit) return null;
  return (
    <AbsoluteFill style={{ background: "#2a2228" }}>
      <ShotView id={22} kit={kit} alpha={1} frame={0} cInf={3} focus={[SQ + 0.4, 1.4, -0.5]} />
      {/* darken the top so the headline reads over the houses */}
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(20,10,24,0.72) 0%, rgba(20,10,24,0.38) 22%, rgba(20,10,24,0) 36%)" }} />
      <div style={{ position: "absolute", left: 0, right: 130, top: 96, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div style={{ ...cardText(76), whiteSpace: "nowrap" }}>ROOSTER ON TRIAL</div>
        <div style={{ ...cardText(118, "#ffe58a"), transform: "rotate(-3deg)", whiteSpace: "nowrap" }}>FOR AN EGG.</div>
      </div>
      <div style={{ position: "absolute", left: 44, top: 440, transform: "rotate(-8deg)" }}>
        <div style={{ border: "14px solid #d8322d", borderRadius: 18, padding: "4px 30px", background: "rgba(255,255,255,0.92)", boxShadow: "0 10px 0 rgba(36,23,38,0.4)" }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 96, color: "#d8322d", letterSpacing: 4, lineHeight: 1.05 }}>REAL?</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
