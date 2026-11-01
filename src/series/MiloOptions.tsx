// Still composition: option 3 (cloak) with the redesigned baseball cap, versus the old cap, plus head close-ups front and side.
import React, { useEffect, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender } from "remotion";
import { Pen, bodyFront, bodySide } from "../engine/toon";
import { milo, MILO_SEED } from "./character";

export const OPT_W = 2000, OPT_H = 1400;
const draw = (front: boolean, o: ReturnType<typeof milo>) => {
  const cv = document.createElement("canvas"); cv.width = 600; cv.height = 1000;
  const p = new Pen(cv.getContext("2d")!);
  if (front) bodyFront(p, o, { mode: "stand", expr: "nervous", seed: MILO_SEED }); else bodySide(p, o, { mode: "stand", expr: "nervous", seed: MILO_SEED });
  return cv;
};
const GREY_BLUE = { jacket: "#5f7388", hem: "#5f7388" };

export const MiloOptions: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [handle] = useState(() => delayRender("milo options"));
  useEffect(() => {
    const g = ref.current!.getContext("2d")!;
    g.fillStyle = "#f3efe6"; g.fillRect(0, 0, OPT_W, OPT_H);
    g.fillStyle = "#241726"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = "bold 40px sans-serif";
    g.fillText("Option 3 (cloak) with the redesigned baseball cap", OPT_W / 2, 40);
    const CW = 480, CH = 640, X0 = 40, Y0 = 90;
    const cell = (c: number, r: number, bg: string, label: string | null, paint: (x: number, y: number) => void) => {
      const x = X0 + c * (CW + 8), y = Y0 + r * (CH + 8);
      g.fillStyle = bg; g.fillRect(x, y, CW, CH); paint(x, y);
      if (label) { g.fillStyle = "#fff"; g.font = "bold 26px sans-serif"; g.textAlign = "left"; g.fillText(label, x + 12, y + 20); g.textAlign = "center"; }
    };
    const full = (cv: HTMLCanvasElement) => (x: number, y: number) => g.drawImage(cv, x + (CW - 360) / 2, y + 30, 360, 600);
    const head = (cv: HTMLCanvasElement) => (x: number, y: number) => g.drawImage(cv, ...HEAD, x + 15, y + 70, 450, 495);
    const a = milo("medieval"), b = milo("medieval", GREY_BLUE), old = milo("medieval", { hat: "cap" });
    cell(0, 0, "#9b968c", "3  cloak + new cap", full(draw(true, a)));
    cell(1, 0, "#9b968c", "3b grey-blue tunic (script)", full(draw(true, b)));
    cell(2, 0, "#c4a66a", "head: OLD cap", head(draw(true, old)));
    cell(3, 0, "#c4a66a", "head: NEW cap", head(draw(true, a)));
    cell(0, 1, "#c4a66a", null, full(draw(true, a)));
    cell(1, 1, "#c4a66a", null, full(draw(true, b)));
    cell(2, 1, "#c4a66a", "side: OLD cap", head(draw(false, old)));
    cell(3, 1, "#c4a66a", "side: NEW cap", head(draw(false, a)));
    continueRender(handle);
  }, [handle]);
  return (
    <AbsoluteFill style={{ background: "#f3efe6" }}>
      <canvas ref={ref} width={OPT_W} height={OPT_H} style={{ width: OPT_W, height: OPT_H }} />
    </AbsoluteFill>
  );
};
const HEAD = [150, 150, 300, 330] as const;
