// Flat drawn cards for "24 Shots": the dog in a sweater, notification cards, phone glow and shards, flour handprint,
// the camera's frame counter, printed photos, buffet platters, battery. Same ink language as toon.ts. No logos, no captions;
// the only characters drawn are the frame-counter digits (they are part of the camera).
import { Pen, INK, mix, mul } from "../../engine/toon";

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

// ================= ep001 cards =================
import { SKINS } from "../../engine/toon";
const SK = SKINS[1];

/** round number badge, 200 x 200; hot = highlighted gold (the one being said) */
export const fxNumber = (p: Pen, n: number, hot: boolean) => {
  const g = p.g;
  p.ell(100, 100, 86, 86, hot ? "#ffd84a" : "#f6ecd2", 10);
  p.ell(100, 100, 66, 66, null, 4);
  g.fillStyle = INK; g.font = "bold 112px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(String(n), 100, 108);
};

/** desk calendar page, 300 x 340: day number; flip 0..1 = the old page turning away at the top */
export const fxCalendar = (p: Pen, day: number, flip: number) => {
  const g = p.g;
  p.poly(rr(20, 40, 280, 320, 18), "#fff6e0", 9);
  p.poly(rr(20, 40, 280, 100, 18), "#c8453a", 9);
  for (const x of [80, 220]) { p.ell(x, 40, 12, 20, "#3a3f55", 5); }
  g.fillStyle = INK; g.font = "bold 150px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText(String(day), 150, 220);
  if (flip > 0 && flip < 1) { // the previous page, folding down from the hinge
    const h = 220 * (1 - flip);
    p.poly([[22, 100], [278, 100], [278 + 8, 100 + h], [22 - 8, 100 + h]], "#f1e6c8", 7);
    g.fillStyle = INK; g.font = `bold ${Math.round(110 * (1 - flip))}px sans-serif`; g.fillText(String(Math.max(1, day - 1)), 150, 100 + h / 2);
  }
};

const finger = (p: Pen, x: number, y: number, w: number, h: number, a: number, fill: string) => p.ell(x, y, w, h, fill, 11, 0, 360, a);
/** a big open hand, palm to the viewer, 600 x 700: "burn" + bandage wraps (wrap 0..1), "heal" (clean skin) or "infect" (swollen, red) */
export const fxHandCU = (p: Pen, state: "burn" | "heal" | "infect", wrap: number, u: number) => {
  const sw = state === "infect" ? 1.12 : 1, skin = state === "infect" ? "#f0a090" : SK;
  const cx = 300, cy = 450;
  for (const [dx, dy, w, h, a] of [[-150, -190, 38, 105, -18], [-52, -245, 40, 120, -5], [52, -250, 40, 125, 4], [150, -205, 38, 108, 16]] as const)
    finger(p, cx + dx * sw, cy + dy * sw, w * sw, h * sw, a, skin);
  finger(p, cx - 196, cy - 20, 38 * sw, 100 * sw, -62, skin); // thumb
  p.ell(cx, cy, 170 * sw, 185 * sw, skin, 11);
  if (state === "burn") { p.ell(cx + 10, cy - 20, 60, 46, "#ff8a4a", 6); p.ell(cx + 4, cy - 28, 26, 18, "#ffd08a", 0); }
  if (state === "heal") p.arc(cx, cy + 30, 70, 30, 20, 160, 8, "#f08a78");
  if (wrap > 0 && state === "burn") {
    const n = Math.ceil(wrap * 6);
    for (let i = 0; i < n; i++) {
      const y = cy + 150 - i * 52, w = Math.min(1, wrap * 6 - i);
      p.clip([[cx - 170, cy - 185], [cx + 170, cy - 185], [cx + 170, cy + 185], [cx - 170, cy + 185]], () => p.poly([[cx - 176 * w - 0 * w, y], [cx + 176 * w, y - 24], [cx + 176 * w, y + 22], [cx - 176 * w, y + 46]], "#fffaf0", 8));
    }
  }
  if (state === "infect") { // a loose bandage end hanging and red blotches
    p.poly([[cx - 160, cy + 80], [cx + 160, cy + 60], [cx + 170, cy + 120], [cx - 150, cy + 150]], "#efe6d0", 8);
    p.ell(cx - 50, cy - 30, 34, 26, "#d8483a", 0); p.ell(cx + 70, cy + 10, 26, 20, "#d8483a", 0);
  }
  void u;
};

/** stink cloud above an infected hand, 400 x 300 */
export const fxStink = (p: Pen, t: number) => {
  const wob = 8 * Math.sin(t * 6.28);
  for (const [x, y, r] of [[120, 190 + wob, 64], [200, 150 - wob, 80], [290, 195 + wob, 62], [210, 215, 56]] as const) p.ell(x, y, r, r * 0.8, "#8fc84a", 9);
  p.ell(170, 150, 24, 14, "#b8e070", 0);
  for (const x of [110, 200, 290]) p.stroke(Array.from({ length: 8 }, (_, i) => [x + 14 * Math.sin(i * 1.3 + t * 6.28), 90 - i * 10] as [number, number]), 8, "#6aa030");
};

/** four-point sparkle, 300 x 300; t rotates it */
export const fxSpark = (p: Pen, t: number) => {
  const star = (cx: number, cy: number, R: number, a: number) => {
    const pts: [number, number][] = [];
    for (let k = 0; k < 8; k++) { const r = k % 2 ? R * 0.28 : R, b = a + (k * Math.PI) / 4; pts.push([cx + r * Math.cos(b), cy + r * Math.sin(b)]); }
    p.poly(pts, "#fff4a8", 8);
  };
  star(150, 150, 120, t * 1.2); star(60, 70, 42, -t * 2); star(240, 235, 36, t * 2.4);
};

/** the hand turns into a judge: palm with a stern face and a white cap over the fingers, 400 x 460 */
export const fxJudgeHand = (p: Pen) => {
  for (const [dx, dy, w, h, a] of [[-95, -125, 28, 70, -22], [-32, -150, 30, 80, -6], [32, -150, 30, 80, 6], [95, -125, 28, 70, 22]] as const)
    finger(p, 200 + dx, 250 + dy, w, h, a, SK);
  p.ell(200, 275, 140, 150, SK, 11);
  p.ell(200, 150, 112, 70, "#fffaf0", 9, 180, 360); // the white coif over the fingers
  p.stroke([[88, 150], [312, 150]], 9);
  p.stroke([[100, 160], [92, 230]], 5, "#d8cfb8"); p.stroke([[300, 160], [308, 230]], 5, "#d8cfb8");
  for (const s of [-1, 1]) { p.dot(200 + s * 48, 262, 8); p.stroke([[200 + s * 80, 236], [200 + s * 22, 246]], 9); }
  p.stroke([[160, 332], [240, 332]], 9);
};

/** a big book lying open with lines of text (no letters), 520 x 360 */
export const fxBigBook = (p: Pen) => {
  p.poly([[10, 90], [260, 60], [510, 90], [510, 330], [260, 350], [10, 330]], "#6a3a22", 9);
  p.poly([[26, 96], [256, 70], [256, 336], [26, 318]], "#f4ead0", 7);
  p.poly([[264, 70], [494, 96], [494, 318], [264, 336]], "#f1e6c8", 7);
  for (let i = 0; i < 9; i++) { const y = 120 + i * 24; p.stroke([[50, y + 2 - i * 0.5], [236, y - 6 + i * 0.3]], 5, "#b9a98a"); p.stroke([[284, y - 6], [470, y + 2]], 5, "#b9a98a"); }
  p.stroke([[50, 104], [110, 98]], 12, "#c8453a"); // a red initial
  p.stroke([[260, 70], [262, 346]], 8, "#6a3a22");
  p.poly([[250, 340], [270, 340], [268, 358], [260, 350], [252, 358]], "#c8453a", 5);
};

/** a plain Norman-style banner: blue field, gold band, gold ring (no real heraldry), 260 x 420 */
export const fxFlag = (p: Pen) => {
  const pts: [number, number][] = [[10, 20], [250, 36], [236, 120], [250, 210], [10, 196]];
  p.poly(pts, "#2f4f9a", 9);
  p.clip(pts, () => { p.poly([[10, 90], [250, 106], [250, 140], [10, 124]], "#e8c45a", 0); });
  p.ell(110, 112, 36, 36, null, 9);
  p.stroke([[10, 20], [10, 400]], 10, "#6a4a2a");
};

/** a white bandage cuff with stripes round a wrist, 220 x 170 */
export const fxBandage = (p: Pen) => {
  p.poly([[20, 40], [200, 20], [206, 140], [26, 156]], "#fffaf0", 9);
  for (const y of [60, 90, 120]) p.stroke([[30, y], [200, y - 14]], 6, "#d8cfb8");
  p.poly([[150, 150], [190, 160], [186, 200 - 30], [150, 150]], "#fffaf0", 6);
};

/** falling paper confetti, 600 x 600; t 0..1 */
export const fxConfetti = (p: Pen, t: number) => {
  const cols = ["#e8c45a", "#d8483a", "#3f63a8", "#4f9a4a", "#f4f1e8"];
  for (let i = 0; i < 26; i++) {
    const s = Math.sin(i * 91.7) * 43758.5, r1 = s - Math.floor(s), s2 = Math.sin(i * 17.3 + 4) * 9731.7, r2 = s2 - Math.floor(s2);
    const x = 30 + r1 * 540 + 24 * Math.sin(t * 9 + i), y = ((r2 * 600 + t * 700) % 640) - 20, a = t * 7 + i;
    const w = 20, h = 11, c = Math.cos(a), sn = Math.sin(a);
    p.poly([[x - w * c + h * sn, y - w * sn - h * c], [x + w * c + h * sn, y + w * sn - h * c], [x + w * c - h * sn, y + w * sn + h * c], [x - w * c - h * sn, y - w * sn + h * c]], cols[i % 5], 3);
  }
};

/** a magnifier bubble with an enlarged hand inside (state heal = clean + sparkle, infect = swollen + green cloud), 740 x 760; circle centre (300, 300), tail pointing down */
export const fxMagnify = (p: Pen, state: "heal" | "infect", t: number) => {
  const g = p.g;
  p.poly([[380, 510], [490, 470], [530, 745]], "#ffffff", 9); // the tail points down at the hand
  g.save(); g.beginPath(); g.arc(300, 300, 270, 0, Math.PI * 2); g.clip();
  g.fillStyle = state === "infect" ? "#f6e6da" : "#e8f6ff"; g.fillRect(0, 0, 600, 600);
  g.translate(78, 34); g.scale(0.74, 0.74);
  fxHandCU(p, state, 1, 0);
  g.restore();
  if (state === "heal") {
    const star: [number, number][] = [];
    for (let k = 0; k < 8; k++) { const r = k % 2 ? 14 : 52, b = t * 1.2 + (k * Math.PI) / 4; star.push([450 + r * Math.cos(b), 130 + r * Math.sin(b)]); }
    p.poly(star, "#fff4a8", 7);
  } else {
    const w = 8 * Math.sin(t * 6.28);
    for (const [x, y, r] of [[170, 110 + w, 40], [225, 82 - w, 50], [285, 112 + w, 38]] as const) p.ell(x, y, r, r * 0.8, "#8fc84a", 8);
  }
  p.ell(300, 300, 274, 274, null, 14);
};
