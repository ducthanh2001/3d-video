// Text pieces: ClueChip (CLUE n/3, top left), Captions (words.json -> 1-3 word groups, 45-55 % of the height, outside the Shorts
// zones) and BigLine (the big headline above the characters, 5 words at most).
import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, INK, PAL, SAFE, W } from "../style";

const stroke = (px: number): React.CSSProperties => ({ WebkitTextStroke: `${px}px ${INK}`, paintOrder: "stroke fill" });

/** `n` clues found; `dingAt` = frame at which n last changed (the chip pops, image only) */
export const ClueChip: React.FC<{ n: number; total?: number; dingAt?: number; top?: number }> = ({ n, total = 3, dingAt, top = 150 }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const pop = dingAt === undefined ? 1 : 1 + 0.35 * (1 - spring({ frame: Math.max(0, f - dingAt), fps, config: { damping: 7, stiffness: 220, mass: 0.5 } }));
  return (
    <div style={{ position: "absolute", left: 36, top, transform: `scale(${f < (dingAt ?? -1) ? 1 : pop})`, transformOrigin: "left center", background: PAL.gold, border: `8px solid ${INK}`, borderRadius: 40, padding: "6px 26px", fontFamily: FONT, fontSize: 48, color: INK, boxShadow: `0 8px 0 rgba(27,27,47,0.35)` }}>
      CLUE {n}/{total}
    </div>
  );
};

export type Word = { w: string; s: number; e: number };
export type Group = { text: string; words: string[]; from: number; to: number };

/** 1-3 word groups: a group ends at 3 words, at sentence punctuation, or at a pause of 0.35 s */
export const groupWords = (words: Word[], fps: number): Group[] => {
  const out: Group[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (!cur.length) return;
    out.push({ text: cur.map((c) => c.w).join(" "), words: cur.map((c) => c.w), from: Math.round(cur[0].s * fps), to: Math.round(cur[cur.length - 1].e * fps) });
    cur = [];
  };
  words.forEach((w, i) => {
    cur.push(w);
    const next = words[i + 1];
    if (cur.length >= 3 || /[.?!,…]$/.test(w.w) || (next && next.s - w.e > 0.35)) flush();
  });
  flush();
  return out.map((g, i) => ({ ...g, to: Math.max(g.to + 3, out[i + 1] ? Math.min(out[i + 1].from, g.to + 8) : g.to + 8) }));
};

const norm = (s: string) => s.replace(/[^a-zA-Z0-9']/g, "").toUpperCase();

export const Captions: React.FC<{ words: Word[]; highlight?: string[]; centerY?: number }> = ({ words, highlight = [], centerY = 0.5 }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const groups = React.useMemo(() => groupWords(words, fps), [words, fps]);
  const g = groups.find((c) => f >= c.from && f < c.to);
  if (!g) return null;
  const hl = highlight.map(norm);
  const k = spring({ frame: f - g.from + 3, fps, config: { damping: 11, stiffness: 260, mass: 0.5 } });
  const long = g.text.length > 16;
  return (
    <div style={{ position: "absolute", left: 80, width: SAFE.maxX - 80 - 20, top: 1920 * centerY - 80, height: 160, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", transform: `scale(${0.8 + 0.2 * k})`, opacity: Math.min(1, k * 1.4) }}>
      <div style={{ fontFamily: FONT, fontSize: long ? 82 : 100, lineHeight: 1.05, color: "#fff", textTransform: "uppercase", letterSpacing: 1, ...stroke(long ? 14 : 16) }}>
        {g.words.map((w, i) => <span key={i} style={{ color: hl.includes(norm(w)) ? PAL.gold : "#fff" }}>{w.replace(/[.,…]+$/, "")}{i < g.words.length - 1 ? " " : ""}</span>)}
      </div>
    </div>
  );
};

/** big line over the characters; `at` = frame it pops in. Keep it to 5 words. */
export const BigLine: React.FC<{ text: string; at?: number; to?: number; top?: number; color?: string; size?: number; rotate?: number }> = ({ text, at = 0, to, top = 330, color = "#fff", size = 124, rotate = -2 }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  if (f < at || (to !== undefined && f >= to)) return null;
  const k = spring({ frame: f - at, fps, config: { damping: 10, stiffness: 200, mass: 0.6 } });
  return (
    <div style={{ position: "absolute", left: 60, width: SAFE.maxX - 60 - 20, top, textAlign: "center", fontFamily: FONT, fontSize: size, lineHeight: 1.0, color, textTransform: "uppercase", transform: `rotate(${rotate}deg) scale(${0.6 + 0.4 * k})`, opacity: Math.min(1, k * 1.5), ...stroke(18), maxWidth: W }}>
      {text}
    </div>
  );
};
