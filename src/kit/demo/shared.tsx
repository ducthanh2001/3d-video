// Frame shell for kit films: one <svg> with the kit defs, the scene, vignette + grain; the title (screen-fixed, top) and the channel tag.
import React from "react";
import { AbsoluteFill } from "remotion";
import { prog } from "../core";
import { Grain, KitDefs, Vignette } from "../materials";

export const TITLE_FONT = '"Segoe UI Semibold", "Segoe UI", Arial, sans-serif';

export const Title: React.FC<{ f: number; text: string; y?: number; out?: number }> = ({ f, text, y = 330, out }) => {
  const a = prog(f, 4, 16) * (out !== undefined ? 1 - prog(f, out, out + 10) : 1);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: y, textAlign: "center", fontFamily: TITLE_FONT, fontSize: 40, letterSpacing: 3, color: "#f2f2f2", opacity: a, textShadow: "0 2px 12px rgba(0,0,0,0.8)", transform: `translateY(${(1 - a) * 10}px)` }}>
      {text}
    </div>
  );
};

export const Tag: React.FC = () => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 1600, textAlign: "center", fontFamily: '"Consolas", monospace', fontSize: 24, letterSpacing: 6, color: "#ffffff", opacity: 0.22 }}>CHANNEL NAME</div>
);

export const Shell: React.FC<{ f: number; bg?: string; title?: string; titleOut?: number; vig?: number; grain?: number; children: React.ReactNode; over?: React.ReactNode }> = ({ f, bg = "#0b0b0e", title, titleOut, vig = 0.85, grain = 0.06, children, over }) => (
  <AbsoluteFill style={{ background: bg }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      <KitDefs />
      {children}
      <Vignette a={vig} />
      {grain > 0 && <Grain f={f} a={grain} />}
      {over}
    </svg>
    {title && <Title f={f} text={title} out={titleOut} />}
    <Tag />
  </AbsoluteFill>
);
