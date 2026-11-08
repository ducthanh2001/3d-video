// A cartoon SUBSCRIBE button with a bell, reusable in every episode: it springs in at `from`, gets "pressed" a moment later
// (the bell rings), and, when `shrinkAt` is given, shrinks away. Screen space: keep it in the middle of the frame, never in
// the Shorts-covered bottom 20 % or right 12 % (the default `top` and the 130 px right margin respect that).
// Pair it with a "ding" in the episode's audio script at `from` (frames).
import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

const FONT = '"Arial Black", Impact, "Segoe UI Black", sans-serif';
const INK = "#241726";

export type SubscribeButtonProps = {
  /** frame at which the button springs in */
  from: number;
  /** frame at which it starts shrinking away (leave unset to keep it on screen) */
  shrinkAt?: number;
  shrinkFrames?: number;
  label?: string;
  /** top edge in px of the 1080x1920 frame */
  top?: number;
};

export const SubscribeButton: React.FC<SubscribeButtonProps> = ({ from, shrinkAt, shrinkFrames = 30, label = "SUBSCRIBE", top = 700 }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  if (f < from) return null;
  const grow = spring({ frame: f - from, fps, config: { damping: 8, stiffness: 150, mass: 0.7 } });
  const shrink = shrinkAt === undefined ? 0 : Math.min(1, Math.max(0, (f - shrinkAt) / shrinkFrames));
  if (shrink >= 1) return null;
  const k = f - (from + 22), press = k >= 0 && k < 6 ? 1 - 0.07 * Math.sin((Math.PI * k) / 6) : 1;
  const ring = f - (from + 24), swing = ring >= 0 ? 22 * Math.sin(ring * 0.85) * Math.exp(-ring / 12) : 0;
  const scale = grow * press * (1 - shrink * shrink);
  return (
    <div style={{ position: "absolute", left: 0, right: 130, top, display: "flex", justifyContent: "center", transform: `scale(${scale})`, opacity: 1 - 0.6 * shrink }}>
      <div style={{ display: "flex", alignItems: "center", gap: 26, padding: "20px 38px 20px 52px", background: "#e8322d", border: `9px solid ${INK}`, borderRadius: 999, boxShadow: `0 12px 0 rgba(36,23,38,0.5), inset 0 -10px 0 rgba(0,0,0,0.16)` }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 76, color: "#ffffff", letterSpacing: 3, lineHeight: 1, WebkitTextStroke: `9px ${INK}`, paintOrder: "stroke fill" }}>{label}</div>
        <div style={{ width: 104, height: 104, borderRadius: "50%", background: "#ffffff", border: `7px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: `rotate(${swing}deg)`, transformOrigin: "36px 8px" }}>
            <path d="M36 6 C20 6 14 20 14 36 L14 46 L8 54 L64 54 L58 46 L58 36 C58 20 52 6 36 6 Z" fill="#f2b83a" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
            <circle cx="36" cy="60" r="7" fill="#f2b83a" stroke={INK} strokeWidth="5" />
          </svg>
        </div>
      </div>
    </div>
  );
};
