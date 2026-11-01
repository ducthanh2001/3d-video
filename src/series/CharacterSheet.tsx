// Still composition: Milo's BASE design (clothes come from each episode's script): turnaround, palette, all 14 faces, hand props.
// Plain 2D canvas, no WebGL: shows the drawing itself, not the lit 3D card.
import React, { useEffect, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender } from "remotion";
import { Expr, Pen, Prop, SKINS, bodyFront, bodySide } from "../engine/toon";
import { MILO_CAP, MILO_NAME, MILO_SCREEN, MILO_SEED, milo } from "./character";
import { ACT } from "./expressions";

export const SHEET_W = 2400, SHEET_H = 2070;
const FACES: Expr[] = ["neutral", "stern", "grin", "laugh", "whistle", "nervous", "shock", "relief", "relief_open", "dazed", "pained", "smile", "smile_closed", "lick"];
const PROPS: [string, Prop][] = [["phone", "phone"], ["book", "book"], ["scroll", "scroll"], ["mug", "mug"], ["walking stick", "stick"], ["torch", "torch"], ["hammer", ["hammer", 0.2]], ["ice cream", "icecream"]];
const HEAD = [150, 150, 300, 330] as const; // head and shoulders of a 600 x 1000 card
const INK = "#241726";

const card = (draw: (p: Pen) => void) => {
  const cv = document.createElement("canvas"); cv.width = 600; cv.height = 1000;
  draw(new Pen(cv.getContext("2d")!));
  return cv;
};

export const CharacterSheet: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [handle] = useState(() => delayRender("character sheet"));
  useEffect(() => {
    const g = ref.current!.getContext("2d")!;
    const base = milo("modern"), text = (s: string, x: number, y: number, size = 28, align: CanvasTextAlign = "center") => { g.font = `bold ${size}px sans-serif`; g.textAlign = align; g.fillStyle = INK; g.fillText(s, x, y); };
    g.fillStyle = "#f3efe6"; g.fillRect(0, 0, SHEET_W, SHEET_H); g.textBaseline = "middle";
    text(`${MILO_NAME}: base character design (clothes change with every script)`, SHEET_W / 2, 48, 46);

    // ---- turnaround ----
    const front = card((p) => bodyFront(p, base, { mode: "stand", expr: "smile", seed: MILO_SEED }));
    const side = card((p) => bodySide(p, base, { mode: "stand", expr: "smile", seed: MILO_SEED }));
    g.fillStyle = "#e6e0d2"; g.fillRect(40, 100, 1500, 800);
    g.drawImage(front, 120, 120, 450, 750); g.drawImage(side, 640, 120, 450, 750);
    text("front", 345, 885, 26); text("side", 865, 885, 26);
    // the cap and the watch up close
    g.drawImage(front, 150, 140, 300, 220, 1140, 130, 380, 280);
    text("the red cap: never changes", 1330, 440, 24);
    g.drawImage(front, 340, 560, 150, 150, 1190, 470, 280, 280);
    text("smart watch on the left wrist", 1330, 780, 24);

    // ---- palette and rules ----
    g.fillStyle = "#e6e0d2"; g.fillRect(1580, 100, 780, 800);
    text("fixed for the whole series", 1970, 135, 30);
    const sw: [string, string][] = [["skin", SKINS[1]], ["cap", MILO_CAP], ["watch", MILO_SCREEN], ["ink", INK], ["base top", "#3f6fb5"], ["base trousers", "#3b3f52"]];
    sw.forEach(([name, col], i) => {
      const x = 1620 + (i % 3) * 245, y = 175 + Math.floor(i / 3) * 150;
      g.fillStyle = col; g.fillRect(x, y, 215, 80); g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(x, y, 215, 80);
      text(`${name} ${col}`, x + 107, y + 102, 20);
    });
    ["adult build, about 3.5 heads tall", `head shape seed ${MILO_SEED}`, "baseball cap: always on (a gag may drop it)", "smart watch on the left wrist", "personality: clumsy, panics easily,", "sometimes smug", "face: dot or lidded eyes, no blush"].forEach((t, i) => text(t, 1970, 520 + i * 52, 26));

    // ---- faces ----
    text("faces (the acting meaning that uses each one)", SHEET_W / 2, 950, 34);
    const meaning = (e: Expr) => Object.entries(ACT).filter(([, v]) => v === e).map(([k]) => k).join(", ");
    FACES.forEach((e, i) => {
      const cv = card((p) => bodyFront(p, base, { mode: "stand", expr: e, seed: MILO_SEED }));
      const x = (i % 7) * 340 + 15, y = 985 + Math.floor(i / 7) * 330;
      g.drawImage(cv, ...HEAD, x + 30, y, 280, 308);
      text(e, x + 170, y + 318, 24); if (meaning(e)) text(`(${meaning(e)})`, x + 170, y + 344, 18);
    });

    // ---- props ----
    text("hand props (more are added per episode)", SHEET_W / 2, 1688, 34);
    PROPS.forEach(([, prop], i) => {
      const cv = card((p) => bodyFront(p, base, { mode: "stand", expr: "smile", seed: MILO_SEED, prop, glow: 1 }));
      g.drawImage(cv, 60, 100, 480, 560, i * 300 + 20, 1715, 260, 303); // upper body, where the hands are
    });
    PROPS.forEach(([name], i) => text(name, i * 300 + 150, 2040, 24));
    continueRender(handle);
  }, [handle]);
  return (
    <AbsoluteFill style={{ background: "#f3efe6" }}>
      <canvas ref={ref} width={SHEET_W} height={SHEET_H} style={{ width: SHEET_W, height: SHEET_H }} />
    </AbsoluteFill>
  );
};
