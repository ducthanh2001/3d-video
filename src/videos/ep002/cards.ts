// Flat drawn cards for ep002, same ink language as toon.ts: the three rats, the two case folders, the summons, speech and
// thought bubbles, the wrapped figure the bearers carry, the verdict paper that tears, the 898 notice, banners, the candle
// flame and the NEXT CASE card with the rooster. Words appear only where the script asks for them.
import { Pen, INK, mix, bodyFront, Outfit } from "../../engine/toon";

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
const text = (p: Pen, s: string, x: number, y: number, size: number, col = INK, font = "900") => {
  const g = p.g;
  g.font = `${font} ${size}px "Arial Black", Impact, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = col;
  g.fillText(s, x, y);
};

// ---------------- the rats ----------------
export type RatPose = "stand" | "shiver" | "cheer" | "peek";
/** a small upright cartoon rat on a 300 x 300 canvas (feet at y 288): round ears, pink nose, a tiny cloak open at the front.
 *  scared = wide eyes and paws at the mouth; cheer = arms up and a grin; blink closes the eyes; t animates whiskers / arms */
export const fxRat = (p: Pen, pose: RatPose, cloak: string, blink: boolean, t: number) => {
  const fur = "#a4a2b4", dark = mix(fur, INK, 0.25), pink = "#f2a8b8", scared = pose === "shiver" || pose === "peek";
  // tail
  p.line([[182, 268], [246, 262], [262, 220], [240, 196 + 6 * Math.sin(t * 6)]], pink, 8);
  // feet and body
  p.ell(122, 282, 20, 9, pink, 5); p.ell(178, 282, 20, 9, pink, 5);
  p.ell(150, 220, 58, 64, fur, 7);
  p.ell(150, 236, 32, 40, "#e2dfea", 0);
  // cloak flaps over the shoulders, open at the front
  p.poly([[96, 178], [134, 176], [124, 268], [86, 258]], cloak, 6);
  p.poly([[204, 178], [166, 176], [176, 268], [214, 258]], cloak, 6);
  p.stroke([[116, 180], [184, 180]], 8, mix(cloak, INK, 0.35));
  // arms
  if (pose === "cheer") {
    const w = 8 * Math.sin(t * 10);
    p.line([[110, 196], [80, 150 + w], [76, 118 + w]], fur, 11); p.line([[190, 196], [220, 150 - w], [224, 118 - w]], fur, 11);
    p.ell(76, 112 + w, 11, 11, pink, 5); p.ell(224, 112 - w, 11, 11, pink, 5);
  } else if (scared) {
    p.line([[112, 200], [128, 178], [140, 160]], fur, 11); p.line([[188, 200], [172, 178], [160, 160]], fur, 11);
  } else {
    p.line([[110, 198], [100, 232]], fur, 11); p.line([[190, 198], [200, 232]], fur, 11);
  }
  // head: ears, face, snout
  for (const s of [-1, 1]) { p.ell(150 + s * 52, 70, 32, 32, fur, 7); p.ell(150 + s * 52, 72, 19, 19, pink, 0); }
  p.ell(150, 118, 60, 52, fur, 7);
  p.ell(150, 140, 28, 20, mix(fur, "#ffffff", 0.3), 0);
  p.ell(150, 128, 9, 7, "#e86e88", 3);
  for (const s of [-1, 1]) for (const k of [-1, 1]) p.stroke([[150 + s * 22, 136 + k * 5], [150 + s * 66, 128 + k * 12 + 3 * Math.sin(t * 8 + k)]], 3, dark);
  for (const s of [-1, 1]) {
    const ex = 150 + s * 24, ey = 108;
    if (blink) p.stroke([[ex - 8, ey], [ex + 8, ey]], 5);
    else if (scared) { p.ell(ex, ey, 12, 13, "#ffffff", 4); p.dot(ex + s * 2, ey + 2, 5); }
    else if (pose === "cheer") p.arc(ex, ey + 4, 9, 7, 200, 340, 5);
    else p.ell(ex, ey, 6, 8, INK, 0);
  }
  if (pose === "cheer") p.ell(150, 152, 12, 9, "#5a1e28", 3, 0, 180);
  else if (scared) { p.ell(150, 154, 6, 7, "#5a1e28", 3); p.ell(140, 162, 11, 9, pink, 4); p.ell(160, 162, 11, 9, pink, 4); }
  else p.arc(150, 148, 8, 4, 20, 160, 4);
};

// ---------------- folders, summons, portrait ----------------
const PAW = (p: Pen, cx: number, cy: number, s: number, col: string) => {
  p.ell(cx, cy + 10 * s, 22 * s, 18 * s, col, 0);
  for (const [dx, dy] of [[-24, -14], [-9, -26], [9, -26], [24, -14]]) p.ell(cx + dx * s, cy + dy * s, 7 * s, 9 * s, col, 0);
};
const MITRE = (p: Pen, cx: number, cy: number, s: number, col: string, trim: string) => {
  const pts: P2[] = [[cx - 30 * s, cy + 34 * s], [cx - 34 * s, cy - 2 * s], [cx - 16 * s, cy - 30 * s], [cx, cy - 44 * s], [cx + 16 * s, cy - 30 * s], [cx + 34 * s, cy - 2 * s], [cx + 30 * s, cy + 34 * s]];
  p.poly(pts, col, 5 * s);
  p.clip(pts, () => { p.band([[cx - 40 * s, cy + 24 * s], [cx + 40 * s, cy + 24 * s]], trim, 10 * s, 0); p.band([[cx, cy + 34 * s], [cx, cy - 44 * s]], trim, 8 * s, 0); });
  p.poly(pts, null, 5 * s);
};
/** a manila case folder lying on the desk, 400 x 300, with an emblem on the cover */
export const fxFolder = (p: Pen, kind: "rat" | "pope") => {
  p.poly(rr(30, 20, 150, 60, 10), "#d8b26a", 6);
  p.poly(rr(16, 44, 384, 284, 12), "#e8c47a", 7);
  p.stroke([[30, 64], [370, 64]], 4, "#c49a52");
  if (kind === "rat") PAW(p, 200, 170, 1.6, "#6a4a3a");
  else MITRE(p, 200, 168, 1.5, "#fffaf0", "#d9b84a");
  p.poly(rr(250, 230, 360, 262, 6), "#fff6e0", 4);
};
/** the summons nailed to the door, 300 x 380: parchment, writing lines, a little rat sketch, red wax seal */
export const fxSummons = (p: Pen) => {
  p.poly([[20, 30], [282, 20], [290, 352], [14, 362]], "#f4e6c4", 7);
  for (let i = 0; i < 6; i++) p.stroke([[50, 70 + i * 26], [250 - (i % 2) * 40, 68 + i * 26]], 6, "#9a8460");
  p.ell(110, 268, 34, 22, "#8a8494", 4); p.ell(84, 252, 12, 12, "#8a8494", 4); p.stroke([[142, 274], [180, 262]], 4);
  p.ell(222, 300, 32, 32, "#c8323a", 6); p.ell(222, 300, 18, 18, null, 3);
  p.dot(150, 30, 8, "#5a5a62");
};
const POPE_PALE: Outfit = { jacket: "#f4f1e8", dress: "#f4f1e8", pants: "#d8d4c8", boots: "#c9a35a", skin: "#e2e8d4", hat: "mitre", cap: "#f6f0e0", buttons: "#d9b84a" };
/** the second folder held open: a portrait of the dead pope (pale, eyes shut), 420 x 440 */
export const fxPortrait = (p: Pen) => {
  p.poly(rr(10, 30, 410, 430, 14), "#e8c47a", 8);
  p.poly(rr(46, 58, 374, 400, 8), "#f8f0dc", 6);
  const g = p.g;
  p.clip(rr(52, 64, 368, 394, 6), () => {
    g.save(); g.translate(30, 66); g.scale(0.6, 0.6);
    bodyFront(new Pen(g), POPE_PALE, { mode: "stand", expr: "neutral", blink: 1, seed: 6 });
    g.restore();
  });
  p.poly(rr(46, 58, 374, 400, 8), null, 6);
  p.stroke([[300, 20], [318, 70]], 7, "#7a7a84"); // paper clip
};

// ---------------- bubbles ----------------
/** speech bubble with a tail toward the lower left (dir -1) or lower right (1), 560 x 300 */
export const fxBubble = (p: Pen, s: string, dir: -1 | 1, size = 70) => {
  const tx = dir < 0 ? 140 : 420;
  p.poly([[tx - 30, 200], [tx + 30, 200], [tx - dir * -70, 290]], "#ffffff", 8);
  p.ell(280, 128, 262, 104, "#ffffff", 9);
  p.poly([[tx - 26, 196], [tx + 26, 196], [tx - dir * -64, 280]], "#ffffff", 0);
  text(p, s, 280, 132, size);
};
/** thought cloud over the judge, 400 x 340: three dots that fill in turn (t 0..1 loops), small puffs down to the head */
export const fxThink = (p: Pen, t: number) => {
  for (const [x, y, r] of [[112, 300, 16], [150, 262, 24]] as const) p.ell(x, y, r, r * 0.9, "#ffffff", 6);
  const lobes: [number, number, number][] = [[120, 150, 64], [200, 110, 78], [290, 140, 66], [250, 200, 62], [160, 205, 58]];
  for (const [x, y, r] of lobes) p.ell(x, y, r, r * 0.85, "#ffffff", 8);
  for (const [x, y, r] of lobes) p.ell(x, y, r - 6, r * 0.85 - 6, "#ffffff", 0);
  for (let k = 0; k < 3; k++) p.ell(150 + k * 55, 160, 13, 13, (t * 3) % 3 >= k ? INK : "#d8d2dc", 0);
};

// ---------------- Rome ----------------
/** the figure the bearers carry: a long white wrapped bundle with rope ties and a mitre tip at the head end, 720 x 220 */
export const fxShroud = (p: Pen) => {
  MITRE(p, 648, 104, 1.1, "#f6f0e0", "#d9b84a");
  p.poly(rr(40, 64, 640, 176, 54), "#f8f6f0", 8);
  p.ell(590, 118, 46, 54, "#f1eee6", 0);
  for (const x of [170, 330, 490]) p.band([[x, 60], [x - 10, 180]], "#c9a35a", 10, 3);
  p.stroke([[80, 100], [600, 92]], 4, "#dedad0");
};
/** the verdict on a sheet, 520 x 420; tear 0 whole .. 1 two halves flying apart with scraps */
export const fxVerdict = (p: Pen, tear: number) => {
  const sheet = (shape: P2[], dx: number, dy: number, a: number) => {
    const R = (q: P2[]) => rot(q.map(([x, y]) => [x + dx, y + dy] as P2), a, 260 + dx, 210 + dy);
    const pts = R(shape);
    p.poly(pts, "#f8eed6", 7);
    p.clip(pts, () => {
      for (let i = 0; i < 7; i++) p.stroke(R([[70, 90 + i * 34], [450, 90 + i * 34]]), 7, "#a89470");
      const [sx, sy] = R([[380, 330]])[0];
      p.ell(sx, sy, 34, 34, "#c8323a", 6);
    });
  };
  if (tear <= 0) { sheet([[40, 40], [480, 40], [480, 380], [40, 380]], 0, 0, 0); return; }
  const jag: P2[] = []; // the torn edge, top to bottom
  for (let i = 0; i <= 10; i++) jag.push([260 + (i % 2 ? 12 : -12), 40 + i * 34]);
  const e = 1 - (1 - tear) ** 2;
  sheet([[40, 40], ...jag, [40, 380]], -60 * e, 20 * e, -0.35 * e);
  sheet([...jag, [480, 380], [480, 40]], 60 * e, 20 * e, 0.35 * e);
  for (let i = 0; i < 7; i++) {
    const a = rad(i * 51 + 20), d = 60 + 160 * e, c: P2 = [260 + d * Math.cos(a), 200 + d * Math.sin(a) * 0.7 + 60 * e];
    p.poly(rot([[c[0] - 12, c[1] - 8], [c[0] + 14, c[1] - 4], [c[0] + 4, c[1] + 12]], a + 6 * e, c[0], c[1]), "#f8eed6", 4);
  }
};
/** the 898 notice on a wooden board, 560 x 460; seal 0..1 = the red seal stamped on */
export const fxNotice = (p: Pen, seal: number) => {
  p.poly(rr(16, 16, 544, 444, 18), "#8a5a34", 9);
  p.poly(rr(46, 44, 514, 416, 8), "#f6ead0", 6);
  text(p, "NO MORE", 280, 120, 66);
  text(p, "CORPSE", 280, 210, 80, "#7a2230");
  text(p, "TRIALS", 280, 300, 80, "#7a2230");
  if (seal > 0) {
    const s = 0.6 + 0.4 * Math.min(1, seal) + 0.25 * Math.sin(Math.PI * Math.min(1, seal));
    p.ell(470, 372, 40 * s, 40 * s, "#c8323a", 6); p.ell(470, 372, 24 * s, 24 * s, null, 4);
    p.stroke([[470 - 11 * s, 372], [470 + 11 * s, 372]], 5); p.stroke([[470, 372 - 11 * s], [470, 372 + 11 * s]], 5);
  }
};
/** a plain two-colour cloth banner on a pole (no real heraldry), 260 x 420; wob animates the free edge */
export const fxBanner = (p: Pen, a: string, b: string, wob: number) => {
  const pts: P2[] = [[20, 24], [240, 30 + 8 * wob], [226, 110], [244, 196 - 8 * wob], [20, 190]];
  p.poly(pts, a, 8);
  p.clip(pts, () => p.poly([[20, 90], [250, 96 + 8 * wob], [250, 130], [20, 124]], b, 0));
  p.poly(pts, null, 8);
  p.stroke([[20, 16], [20, 410]], 11, "#6a4a2a");
};

// ---------------- the office ----------------
/** a candle flame, 120 x 200; t flickers it */
export const fxFlame = (p: Pen, t: number) => {
  const w = 1 + 0.08 * Math.sin(t * 13), lean = 6 * Math.sin(t * 7);
  p.poly([[60 - 26 * w, 160], [60 + 26 * w, 160], [60 + 18 * w + lean * 0.5, 110], [60 + lean, 30], [60 - 18 * w + lean * 0.5, 110]], "#ff9f2e", 5);
  p.poly([[60 - 13, 156], [60 + 13, 156], [60 + 9 + lean * 0.3, 120], [60 + lean * 0.6, 76], [60 - 9 + lean * 0.3, 120]], "#ffe58a", 0);
  p.stroke([[60, 160], [60, 186]], 6);
};
/** a cartoon rooster next to a small egg on a cream card (the back of NEXT CASE), drawn into (x, y) with scale s */
const rooster = (p: Pen, x: number, y: number, s: number) => {
  const P = (dx: number, dy: number): P2 => [x + dx * s, y + dy * s];
  for (const [dx, dy, rx, ry, a, c] of [[-120, -60, 40, 90, -30, "#2f6a4a"], [-100, -80, 34, 86, -10, "#c8453a"], [-80, -90, 30, 76, 10, "#e8a43a"]] as const)
    p.ell(...P(dx, dy), rx * s, ry * s, c, 6 * s, 0, 360, a);
  for (const sx of [-24, 18]) { p.stroke([P(sx, 70), P(sx, 120)], 9 * s, "#e8b03a"); p.stroke([P(sx - 18, 124), P(sx + 20, 124)], 8 * s, "#e8b03a"); }
  p.ell(...P(0, 20), 90 * s, 74 * s, "#f6efe0", 7 * s);
  p.ell(...P(-14, 34), 46 * s, 30 * s, "#e4d8c0", 0, 0, 360, -15);
  p.ell(...P(64, -64), 46 * s, 50 * s, "#f6efe0", 7 * s);
  for (const [dx, r] of [[44, 15], [64, 18], [84, 15]] as const) p.ell(...P(dx, -116), r * s, r * s, "#d8323a", 5 * s);
  p.poly([P(104, -70), P(140, -58), P(104, -48)], "#f2b83a", 5 * s);
  p.ell(...P(104, -34), 11 * s, 17 * s, "#d8323a", 4 * s);
  p.ell(...P(76, -74), 12 * s, 13 * s, "#ffffff", 4 * s); p.dot(...P(79, -72), 5 * s);
  p.arc(...P(76, -96), 12 * s, 5 * s, 200, 340, 4 * s);
  p.ell(...P(170, 100), 34 * s, 44 * s, "#fffaf0", 6 * s); // the egg
  p.ell(...P(160, 86), 8 * s, 12 * s, "#ffffff", 0);
};
/** NEXT CASE card, 520 x 640. side 0 = front (title), 1 = back (rooster + egg) */
export const fxNextCase = (p: Pen, side: 0 | 1) => {
  if (side === 0) {
    p.poly(rr(16, 16, 504, 624, 26), "#7a2230", 9);
    p.poly(rr(40, 40, 480, 600, 18), null, 5);
    p.g.strokeStyle = "#d9b84a"; p.g.lineWidth = 6; p.path(rr(40, 40, 480, 600, 18), true); p.g.stroke();
    text(p, "NEXT", 260, 260, 118, "#fff6dc"); text(p, "CASE", 260, 390, 118, "#fff6dc");
    text(p, "?", 260, 520, 90, "#d9b84a");
  } else {
    p.poly(rr(16, 16, 504, 624, 26), "#fff6dc", 9);
    p.g.strokeStyle = "#d9b84a"; p.g.lineWidth = 6; p.path(rr(40, 40, 480, 600, 18), true); p.g.stroke();
    rooster(p, 220, 330, 1.25);
  }
};
