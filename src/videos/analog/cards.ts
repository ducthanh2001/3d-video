// Flat drawn cards for "24 Shots": the dog in a sweater, notification cards, phone glow and shards, flour handprint,
// the camera's frame counter, printed photos, buffet platters, battery. Same ink language as toon.ts. No logos, no captions;
// the only characters drawn are the frame-counter digits (they are part of the camera).
import { Pen, INK, mix, mul } from "./toon";

type P2 = [number, number];
const rad = (d: number) => (d * Math.PI) / 180;
const rr = (x0: number, y0: number, x1: number, y1: number, r: number, n = 6): P2[] => {
  const pts: P2[] = [];
  for (const [cx, cy, a] of [[x1 - r, y0 + r, -90], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, 90], [x0 + r, y0 + r, 180]] as const)
    for (let i = 0; i <= n; i++) pts.push([cx + r * Math.cos(rad(a + (90 * i) / n)), cy + r * Math.sin(rad(a + (90 * i) / n))]);
  return pts;
};
const rot = (pts: P2[], a: number, cx: number, cy: number): P2[] =>
  pts.map(([x, y]) => [cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a), cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)]);

/** notification card on a 300 x 130 canvas: coloured badge + two text bars + a corner dot (no real app icons) */
export const fxNotif = (p: Pen, kind: number) => {
  const cols = ["#ff5a5f", "#3fb5ff", "#37c871", "#ffb83d", "#a06bff"], c = cols[kind % cols.length];
  p.poly(rr(10, 10, 290, 120, 26), "#ffffff", 8);
  p.poly(rr(26, 28, 86, 88, 16), c, 5);
  p.ell(56, 58, 12, 12, "#ffffff", 0);
  p.stroke([[106, 44], [250, 44]], 12, "#3a3f55");
  p.stroke([[106, 80], [200, 80]], 9, "#b3b8c8");
  p.ell(270, 24, 13, 13, "#ff3b30", 4);
};

/** soft cold glow on a 400 x 400 canvas (use as a soft card) */
export const fxGlow = (p: Pen, col = "#9fd8ff") => {
  const g = p.g, gr = g.createRadialGradient(200, 200, 0, 200, 200, 200);
  gr.addColorStop(0, col + "ff"); gr.addColorStop(0.45, col + "77"); gr.addColorStop(1, col + "00");
  g.fillStyle = gr; g.fillRect(0, 0, 400, 400);
};

/** a notification card breaking into shards, 500 x 500; t 0..1 */
export const fxShards = (p: Pen, t: number) => {
  const e = 1 - (1 - t) ** 3;
  for (let i = 0; i < 12; i++) {
    const a = rad(i * 30 + 11), d = 30 + 190 * e * (0.6 + 0.4 * ((i * 7) % 5) / 4), c: P2 = [250 + d * Math.cos(a), 250 + d * Math.sin(a) + 120 * t * t];
    const s = (34 - 20 * t) * (0.7 + 0.3 * (i % 3) / 2), r = a + 5 * t * (i % 2 ? 1 : -1);
    p.poly(rot([[c[0] - s, c[1] - s * 0.6], [c[0] + s, c[1] - s * 0.3], [c[0] + s * 0.4, c[1] + s * 0.7]], r, c[0], c[1]), i % 3 ? "#ffffff" : ["#ff5a5f", "#3fb5ff", "#37c871"][i % 3], 5);
  }
};

/** battery icon on a 300 x 160 canvas: pct 0..1; nearly empty = a red sliver */
export const fxBattery = (p: Pen, pct: number) => {
  p.poly(rr(20, 30, 250, 130, 22), "#f4f4f4", 10);
  p.poly(rr(252, 62, 280, 98, 8), INK, 0);
  const w = Math.max(14, 200 * pct);
  p.poly(rr(36, 46, 36 + w, 114, 10), pct < 0.2 ? "#ff3b30" : "#37c871", 0);
};

/** flour handprint on a 300 x 340 canvas: palm + four fingers + thumb, floury white with a faint grey edge */
export const fxHandprint = (p: Pen) => {
  const f = "#fffaf0", e = "#d8d2c6";
  p.ell(150, 240, 85, 80, f, 0);
  for (const [x, y, w, h, a] of [[78, 120, 22, 66, -12], [122, 78, 24, 78, -4], [170, 72, 24, 80, 3], [214, 100, 22, 70, 14]] as const)
    p.ell(x + 8, y + h * 0.9, w, h, f, 0, 0, 360, a);
  p.ell(62, 225, 30, 56, f, 0, 0, 360, -60);
  p.ell(150, 240, 85, 80, null, 4, 0, 360); // light rim
  void e;
  p.ell(120, 215, 30, 22, "#ffffff", 0); p.ell(190, 270, 24, 16, "#ffffff", 0);
};

/** film camera frame counter on a 220 x 220 canvas: round dial with the remaining shots */
export const fxCounter = (p: Pen, n: number) => {
  const g = p.g;
  p.ell(110, 110, 96, 96, "#c9ccd2", 10);
  p.ell(110, 110, 76, 76, "#f1efe6", 6);
  for (let i = 0; i < 24; i++) { const a = rad(i * 15); p.stroke([[110 + 78 * Math.cos(a), 110 + 78 * Math.sin(a)], [110 + 90 * Math.cos(a), 110 + 90 * Math.sin(a)]], 5); }
  g.fillStyle = INK; g.font = "bold 92px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(String(n), 110, 116);
};

/** printed photo (white border), 300 x 360: kind 0 bread, 1 dog, 2 bridge, 3 sky */
export const fxPhoto = (p: Pen, kind: number) => {
  p.poly(rr(8, 8, 292, 352, 14), "#fffdf6", 9);
  const x0 = 28, y0 = 28, x1 = 272, y1 = 270;
  p.clip(rr(x0, y0, x1, y1, 4), () => {
    const g = p.g, gr = g.createLinearGradient(0, y0, 0, y1);
    if (kind === 2 || kind === 3) { gr.addColorStop(0, "#6a4f8c"); gr.addColorStop(0.7, "#ffb06a"); gr.addColorStop(1, "#ffd08a"); }
    else { gr.addColorStop(0, "#bfe0ff"); gr.addColorStop(1, "#f4ead2"); }
    g.fillStyle = gr; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    if (kind === 0) { p.ell(150, 170, 80, 46, "#d9964a", 6); for (const k of [-34, 0, 34]) p.stroke([[150 + k - 8, 140], [150 + k + 8, 162]], 7, "#fbe0b0"); }
    if (kind === 1) { p.ell(150, 190, 56, 60, "#c8935a", 6); p.ell(104, 150, 18, 36, "#7a4b2a", 5, 0, 360, 15); p.ell(196, 150, 18, 36, "#7a4b2a", 5, 0, 360, -15); p.dot(130, 180, 6); p.dot(170, 180, 6); p.ell(150, 205, 14, 10, INK, 0); p.poly([[96, 232], [204, 232], [200, 268], [100, 268]], "#d6384a", 5); }
    if (kind === 2) { p.poly(rr(0, 200, 300, 230, 3), "#3a2f4a", 6); for (const x of [50, 150, 250]) p.stroke([[x, 200], [x, 168]], 5); p.stroke([[40, 170], [150, 120], [260, 170]], 4); p.ell(90, 100, 26, 26, "#ffe9b0", 0); }
    if (kind === 3) p.ell(150, 240, 50, 50, "#ffe9b0", 0);
  });
  p.poly(rr(x0, y0, x1, y1, 4), null, 6);
};

/** buffet platter on a 320 x 200 canvas: a heap of colourful food on a tray (k picks the mix) */
export const fxPlatter = (p: Pen, k: number) => {
  const mixes = [["#e0a35a", "#d6384a", "#7fbf4d", "#f2d04a"], ["#a86a3a", "#f7c6d9", "#e07a3a", "#ffffff"], ["#d6384a", "#f2d04a", "#a86a3a", "#7fbf4d"]];
  const c = mixes[k % 3];
  p.ell(160, 150, 150, 34, "#c9ccd2", 7);
  p.ell(160, 144, 128, 24, "#e9edf3", 0);
  for (let i = 0; i < 13; i++) {
    const x = 60 + (i % 7) * 33 + (i > 6 ? 16 : 0), y = i > 6 ? 98 : 124, r = 20 + (i % 3) * 3;
    p.ell(x, y - (i % 2) * 4, r, r * 0.9, c[i % 4], 5);
  }
  p.ell(160, 68, 24, 22, c[(k + 1) % 4], 5);
};

/** the dog on a 600 x 1000 design canvas (soles at y 975), facing screen-right in a striped sweater; wag = tail swing -1..1 */
export const dogCard = (p: Pen, wag: number, blink = false, light = -2.0) => {
  const fur = "#c8935a", dark = "#7a4b2a", wool = "#d6384a", cream = "#f6e9c8";
  void light;
  const ty = 800 + 22 * wag;
  p.line([[168, 842], [120, 812 + 10 * wag], [96, ty]], fur, 22);
  for (const [x, back] of [[220, true], [262, false], [400, true], [440, false]] as const) { // legs
    const c = back ? mul(fur, [0.82, 0.82, 0.82]) : fur;
    p.line([[x, 900], [x + (back ? -4 : 6), 968]], c, 26);
    p.ell(x + (back ? -4 : 12), 968, 26, 12, back ? mul(cream, [0.85, 0.85, 0.85]) : cream, 7);
  }
  const body: P2[] = [];
  for (let i = 0; i < 48; i++) { const a = rad((i * 360) / 48); body.push([320 + 150 * Math.cos(a), 850 + 82 * Math.sin(a)]); }
  p.poly(body, fur, 11);
  p.clip(body, () => { // sweater: stripes over the torso, ribbed hem
    p.poly(rr(210, 760, 460, 940, 8), wool, 0);
    for (const y of [790, 840, 890]) p.stroke([[210, y], [470, y]], 22, cream);
    p.stroke([[212, 760], [212, 940]], 12, mix(wool, INK, 0.3));
  });
  p.poly(body, null, 11);
  p.ell(452, 818, 44, 30, wool, 9, 200, 340); // collar ring
  p.line([[352, 884], [356, 940]], wool, 28); // sleeve on the front leg
  p.ell(466, 758, 74, 70, fur, 10); // head
  p.ell(536, 786, 40, 30, mix(fur, "#ffffff", 0.2), 9); // snout
  p.ell(566, 776, 11, 9, INK, 0);
  p.ell(428, 722, 28, 52, dark, 9, 0, 360, 20); // floppy ear
  if (blink) p.stroke([[480, 744], [502, 744]], 6); else p.ell(494, 744, 6, 9, INK, 0);
  p.arc(540, 800, 22, 14, 20, 150, 5);
};
