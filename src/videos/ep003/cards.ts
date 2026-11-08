// Flat drawn cards for ep003, same ink language as toon.ts: the rooster (one card, seven moods), the egg, the thought bubble
// in which an egg hatches a cute monster, the little red Satan shadow, the idea bulb, the steam train, the two case folders,
// the picture frame in the first scene, a feather, a leaf and a tumbleweed. Words appear only where the script asks for them.
import { Pen, INK, mix } from "../../engine/toon";

type P2 = [number, number];
const rad = (d: number) => (d * Math.PI) / 180;
const rr = (x0: number, y0: number, x1: number, y1: number, r: number, n = 6): P2[] => {
  const pts: P2[] = [];
  for (const [cx, cy, a] of [[x1 - r, y0 + r, -90], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, 90], [x0 + r, y0 + r, 180]] as const)
    for (let i = 0; i <= n; i++) pts.push([cx + r * Math.cos(rad(a + (90 * i) / n)), cy + r * Math.sin(rad(a + (90 * i) / n))]);
  return pts;
};

// ---------------- the rooster ----------------
export type RoosterPose = "stand" | "stare" | "nod" | "shock" | "proud" | "worried" | "cluck";
/** the defendant, 400 x 480 (feet at y 466): a round white rooster facing us, big eyes, red comb and wattle, a fan of tail
 *  feathers. t (0..1, quantized by the caller) drives the head bob: nod = a full nod, others = a small idle bob */
export const fxRooster = (p: Pen, pose: RoosterPose, blink: boolean, t: number) => {
  const body = "#fbf5e8", shade = "#e8dcc4", red = "#d8322d", beak = "#f2b23a", leg = "#e8b03a";
  const bob = pose === "nod" ? 20 * Math.sin(t * Math.PI * 2) : 3 * Math.sin(t * Math.PI * 2);
  const shocked = pose === "shock", sad = pose === "worried", proud = pose === "proud", up = pose === "stare";
  const jit = shocked ? 3 * Math.sin(t * 60) : 0;
  // tail fan behind the body
  const tail: [number, number, number, string][] = [[-62, 36, 112, "#2f6a4a"], [-34, 20, 126, "#c8453a"], [0, 14, 136, "#e8a43a"], [34, 20, 126, "#3f63a8"], [62, 36, 112, "#2f6a4a"]];
  for (const [a, rx, ry, c] of tail) {
    const lift = shocked ? 14 : 0, A = rad(a), cx = 200 + Math.sin(A) * (ry - 30 + lift), cy = 300 - Math.cos(A) * (ry - 30 + lift);
    p.ell(cx, cy, rx, ry, c, 7, 0, 360, a);
  }
  // legs and feet
  for (const s of [-1, 1]) {
    p.stroke([[200 + s * 38, 410], [200 + s * 38, 458]], 12, leg);
    for (const d of [-1, 0, 1]) p.stroke([[200 + s * 38, 458], [200 + s * 38 + d * 18 + s * 4, 468]], 9, leg);
  }
  // body, belly patch, wings
  p.ell(200, 330, 100 + (proud ? 8 : 0), 98 + (proud ? 8 : 0), body, 8);
  p.ell(200, 352, 58, 62, shade, 0);
  for (const s of [-1, 1]) p.ell(200 + s * 92, 336 + (shocked ? -14 : 0), 28, 54, shade, 7, 0, 360, s * (shocked ? 40 : 16));
  // head, comb, wattle, beak, eyes
  const hy = 188 + bob + jit + (up ? -10 : 0), hx = 200 + (up ? 0 : 0);
  for (const [dx, dy, r] of [[-26, -66, 20], [0, -78, 25], [26, -66, 20]] as const) p.ell(hx + dx + (shocked ? dx * 0.2 : 0), hy + dy - (shocked ? 8 : 0), r, r * 1.1, red, 7);
  p.ell(hx, hy, 66, 62, body, 8);
  p.ell(hx, hy + 56, 17, 26 + (sad ? 6 : 0), red, 6);
  const open = shocked || pose === "cluck";
  p.poly([[hx - 20, hy + 10], [hx + 20, hy + 10], [hx, hy + (open ? 44 : 34)]], beak, 6);
  if (open) p.poly([[hx - 14, hy + 20], [hx + 14, hy + 20], [hx, hy + 38]], "#5a1e28", 0);
  for (const s of [-1, 1]) {
    const ex = hx + s * 29, ey = hy - 8;
    if (blink || pose === "nod" && Math.sin(t * Math.PI * 2) > 0.2 || proud) { p.arc(ex, ey + 4, 14, 10, 200, 340, 6); continue; }
    p.ell(ex, ey, shocked ? 22 : 17, shocked ? 24 : 20, "#ffffff", 6);
    p.dot(ex + (up ? 0 : s * -2), ey + (shocked ? 0 : 3), shocked ? 5 : 8);
    if (sad) p.stroke([[ex - s * 18, ey - 28], [ex + s * 10, ey - 20]], 6);
    if (shocked) p.stroke([[ex - 12, ey - 36], [ex + 12, ey - 34]], 6);
  }
  if (sad) { p.ell(hx + 62, hy - 22, 6, 11, "#9fd4ff", 3); }
};

// ---------------- the egg ----------------
/** a hen's egg on a 200 x 260 canvas (base at y 246); crack 0..1 adds a zigzag line */
export const fxEgg = (p: Pen, crack = 0) => {
  p.ell(100, 150, 70, 92, "#fffaf0", 8);
  p.ell(72, 112, 12, 22, "#ffffff", 0, 0, 360, 20);
  if (crack > 0) {
    const pts: P2[] = [];
    for (let i = 0; i <= 8; i++) pts.push([30 + i * 17, 150 + (i % 2 ? 18 : -18)]);
    p.stroke(pts.slice(0, 1 + Math.ceil(crack * 8)), 6);
  }
};

// ---------------- the thought bubble: an egg hatches a cute monster, then the bubble pops ----------------
/** 520 x 560. t: 0-.3 egg wobbles, .3-.45 cracks, .45-.6 splits and the monster pops out, .6-.85 it waves, .85-1 the bubble pops */
export const fxMonsterBubble = (p: Pen, t: number) => {
  const pop = t > 0.85 ? (t - 0.85) / 0.15 : 0;
  if (pop >= 1) return;
  const sc = 1 + 0.25 * pop, a = 1 - pop;
  const g = p.g;
  g.save(); g.globalAlpha = a; g.translate(260, 290); g.scale(sc, sc); g.translate(-260, -290);
  for (const [x, y, r] of [[120, 530, 16], [160, 488, 24]] as const) p.ell(x, y, r, r * 0.9, "#ffffff", 6);
  const lobes: [number, number, number][] = [[140, 250, 100], [250, 170, 124], [372, 230, 106], [330, 350, 96], [190, 360, 92], [260, 290, 120]];
  for (const [x, y, r] of lobes) p.ell(x, y, r, r * 0.86, "#ffffff", 9);
  for (const [x, y, r] of lobes) p.ell(x, y, r - 7, r * 0.86 - 7, "#ffffff", 0);
  const cx = 260, cy = 290;
  if (t < 0.45) { // the egg
    const wob = t < 0.3 ? 9 * Math.sin(t * 90) : 5 * Math.sin(t * 160), crackK = t < 0.3 ? 0 : (t - 0.3) / 0.15;
    g.save(); g.translate(cx, cy + 40); g.rotate(rad(wob)); g.translate(-cx, -(cy + 40));
    p.ell(cx, cy + 20, 62, 82, "#fffaf0", 8);
    p.ell(cx - 22, cy - 10, 9, 18, "#ffffff", 0, 0, 360, 20);
    if (crackK > 0) { const pts: P2[] = []; for (let i = 0; i <= 6; i++) pts.push([cx - 62 + i * 21, cy + 24 + (i % 2 ? 16 : -16)]); p.stroke(pts.slice(0, 1 + Math.ceil(crackK * 6)), 6); }
    g.restore();
  } else {
    const k = Math.min(1, (t - 0.45) / 0.15), wave = t > 0.6 ? Math.sin((t - 0.6) * 90) : 0;
    const s = 0.4 + 0.6 * (1 - (1 - k) ** 3), my = cy + 10 - 24 * k;
    // shell halves tilting away
    for (const sg of [-1, 1]) p.poly([[cx + sg * 8, cy + 120], [cx + sg * 74, cy + 124], [cx + sg * 70, cy + 70], [cx + sg * 46, cy + 54], [cx + sg * 30, cy + 80], [cx + sg * 8, cy + 66]], "#fffaf0", 7);
    g.save(); g.translate(cx, my + 80); g.scale(s, s); g.translate(-cx, -(my + 80));
    for (const sg of [-1, 1]) { p.ell(cx + sg * 78, my + 30 + (t > 0.6 ? sg * 14 * wave : 0), 22, 36, "#7a5ab8", 6, 0, 360, sg * 30); p.poly([[cx + sg * 26, my - 62], [cx + sg * 44, my - 108], [cx + sg * 56, my - 60]], "#f4e6a0", 6); }
    p.ell(cx, my + 20, 76, 80, "#8f6fd0", 8);
    p.ell(cx, my + 46, 46, 42, "#b8a0e8", 0);
    for (const sg of [-1, 1]) { p.ell(cx + sg * 30, my, 22, 26, "#ffffff", 6); p.dot(cx + sg * 30 + sg * -2, my + 3, 9); }
    p.ell(cx, my + 56, 26, 16, "#5a1e28", 5, 0, 180);
    for (const sg of [-1, 1]) p.poly([[cx + sg * 16 - 8, my + 56], [cx + sg * 16 + 8, my + 56], [cx + sg * 16, my + 70]], "#ffffff", 3);
    g.restore();
  }
  g.restore();
  if (pop > 0) for (let i = 0; i < 9; i++) { const A = rad(i * 40 + 10), d = 150 + 150 * pop; p.ell(260 + d * Math.cos(A), 290 + d * Math.sin(A), 14 * (1 - pop) + 3, 14 * (1 - pop) + 3, "#ffffff", 5); }
};

// ---------------- Satan: a small red cartoon shadow ----------------
/** 420 x 420. Not scary: a round red blob with stubby horns, a mischievous grin, a wavy hem and an arrow-tipped tail; t wobbles it */
export const fxSatan = (p: Pen, t: number) => {
  const g = p.g, w = Math.sin(t * Math.PI * 2);
  g.save(); g.globalAlpha = 0.92;
  p.line([[250, 290], [330 + 16 * w, 330], [350, 260 + 10 * w], [386, 236 + 10 * w]], "#b8231f", 10, true);
  p.poly([[374, 214 + 10 * w], [404, 246 + 10 * w], [364, 252 + 10 * w]], "#b8231f", 6);
  const hem: P2[] = []; for (let i = 0; i <= 10; i++) hem.push([90 + i * 22, 330 + (i % 2 ? 22 : 0) + 6 * Math.sin(t * 12 + i)]);
  p.poly([[96, 150], [124, 80], [200, 56], [276, 80], [304, 150], [316, 250], ...hem.reverse(), [84, 250]], "#e8433a", 8);
  for (const s of [-1, 1]) p.poly([[200 + s * 56, 78], [200 + s * 86, 8 + 6 * w], [200 + s * 100, 76]], "#a81e1c", 7);
  p.ell(200, 220, 70, 54, "#f06a5a", 0);
  for (const s of [-1, 1]) { p.ell(200 + s * 40, 140, 22, 26, "#fff2a8", 6); p.dot(200 + s * 40 + s * 3, 144, 8); p.stroke([[200 + s * 14, 100], [200 + s * 62, 120 - 10 * s]], 7); }
  p.ell(200, 196, 44, 26, "#5a1e28", 6, 0, 180);
  for (const s of [-1, 1]) p.poly([[200 + s * 26 - 8, 196], [200 + s * 26 + 8, 196], [200 + s * 26, 212]], "#ffffff", 3);
  for (const [x, y] of [[96, 200], [304, 200]] as const) p.line([[x, y], [x + (x < 200 ? -30 : 30), y + 40 + 8 * w]], "#e8433a", 12, true);
  g.restore();
};

// ---------------- the idea bulb ----------------
/** 200 x 260 */
export const fxBulb = (p: Pen, t: number) => {
  for (let i = 0; i < 8; i++) { const a = rad(-160 + i * 42), r0 = 92 + 6 * Math.sin(t * 20 + i), r1 = 130; p.stroke([[100 + r0 * Math.cos(a), 108 + r0 * Math.sin(a)], [100 + r1 * Math.cos(a), 108 + r1 * Math.sin(a)]], 8, "#f2b83a"); }
  p.ell(100, 108, 66, 70, "#fff29a", 8);
  p.ell(78, 84, 14, 22, "#ffffff", 0, 0, 360, 24);
  p.poly(rr(66, 164, 134, 214, 8), "#9a98a4", 7);
  for (const y of [180, 196]) p.stroke([[70, y], [130, y + 4]], 5);
  p.ell(100, 218, 22, 12, "#6a6874", 5);
};

// ---------------- the steam train ----------------
/** a toy-like steam locomotive facing right, 640 x 400: green boiler with brass bands, tall chimney, a red cab, big wheels;
 *  puff 0..1 animates the steam */
export const fxTrain = (p: Pen, puff = 0) => {
  for (let k = 0; k < 3; k++) { const u = (puff + k / 3) % 1; p.ell(470 + 40 * u - k * 10, 90 - 120 * u + 30, 26 + 36 * u, 22 + 30 * u, `rgba(255,255,255,${(0.95 - 0.8 * u).toFixed(2)})`, 0); }
  p.poly([[190, 250], [470, 250], [470, 150], [190, 150]], "#2f6a4a", 8);
  p.ell(470, 200, 26, 50, "#2f6a4a", 8);
  p.poly(rr(104, 96, 214, 280, 10), "#c8453a", 8);
  p.poly([[92, 96], [226, 96], [214, 70], [104, 70]], "#6a2a28", 7);
  p.poly(rr(126, 124, 192, 188, 6), "#bfe6ff", 6);
  for (const x of [250, 330, 410]) p.stroke([[x, 152], [x, 248]], 10, "#e8c45a");
  p.poly([[396, 150], [376, 80], [440, 80], [420, 150]], "#3a3a44", 8);
  p.poly([[364, 80], [452, 80], [440, 56], [376, 56]], "#3a3a44", 7);
  p.ell(412, 144, 30, 12, "#e8c45a", 6);
  p.ell(494, 176, 14, 18, "#fff29a", 5);
  p.poly([[500, 280], [560, 330], [500, 330], [470, 300]], "#5a5a64", 7); // cowcatcher
  p.poly(rr(110, 250, 500, 296, 8), "#3a3a44", 8);
  p.stroke([[160, 316], [270, 316], [370, 316]], 10, "#8a8a94"); // the coupling rod
  for (const [x, r] of [[160, 52], [270, 44], [370, 44], [450, 36]] as const) { p.ell(x, 316, r, r, "#c8453a", 9); p.ell(x, 316, r * 0.42, r * 0.42, "#e8c45a", 5); }
};

// ---------------- folders and frame ----------------
/** a manila case folder lying on the desk, 400 x 300, with an egg and a feather (rooster file) or the steam train (train file) */
export const fxFolder3 = (p: Pen, kind: "egg" | "train") => {
  p.poly(rr(30, 20, 150, 60, 10), "#d8b26a", 6);
  p.poly(rr(16, 44, 384, 284, 12), "#e8c47a", 7);
  p.stroke([[30, 64], [370, 64]], 4, "#c49a52");
  if (kind === "egg") {
    p.ell(170, 176, 44, 58, "#fffaf0", 6); p.ell(154, 158, 7, 14, "#ffffff", 0, 0, 360, 20);
    p.ell(244, 168, 16, 62, "#fbf5e8", 5, 0, 360, 34); p.stroke([[232, 218], [262, 112]], 4, "#c9bba0");
  } else {
    const g = p.g; g.save(); g.translate(78, 78); g.scale(0.4, 0.4); fxTrain(p, 0.2); g.restore();
  }
  p.poly(rr(250, 232, 360, 264, 6), "#fff6e0", 4);
};
/** the picture frame standing on the desk in the first scene (the rooster is drawn on a card in front of it), 400 x 480 */
export const fxFrame = (p: Pen) => {
  p.poly(rr(10, 10, 390, 470, 16), "#7a4a2a", 9);
  p.poly(rr(40, 40, 360, 440, 8), "#f6ead0", 6);
  p.poly(rr(40, 40, 360, 440, 8), null, 4);
  p.stroke([[60, 60], [340, 60]], 3, "#d8c8a4");
};

// ---------------- things that blow by ----------------
/** a white feather, 120 x 260 (tilt it with the card's rot) */
export const fxFeather = (p: Pen) => {
  p.poly([[60, 18], [96, 80], [100, 150], [84, 214], [60, 246], [36, 214], [20, 150], [24, 80]], "#fbf5e8", 7);
  p.stroke([[60, 30], [60, 250]], 5, "#c9bba0");
  for (const y of [90, 130, 170]) { p.stroke([[60, y], [92, y - 16]], 3, "#d8cdb4"); p.stroke([[60, y], [28, y - 16]], 3, "#d8cdb4"); }
};
/** a dry tumbleweed (a ball of straw), 300 x 300; a rotates it */
export const fxTumble = (p: Pen, a: number) => {
  p.ell(150, 150, 120, 118, "#d6b25a", 8);
  const g = p.g;
  g.save(); g.beginPath(); g.arc(150, 150, 114, 0, Math.PI * 2); g.clip();
  for (let i = 0; i < 9; i++) {
    const A = a + (i * Math.PI) / 9, r = 112;
    p.stroke([[150 + r * Math.cos(A), 150 + r * Math.sin(A)], [150 - r * Math.cos(A), 150 - r * Math.sin(A)]], 5, "#8a6a2a");
  }
  for (let i = 0; i < 5; i++) p.arc(150, 150, 30 + i * 22, 30 + i * 20, a * 60 + i * 70, a * 60 + i * 70 + 150, 4, "#a8843a");
  g.restore();
  p.ell(150, 150, 120, 118, null, 8);
};
/** a tumbling leaf, 100 x 100 */
export const fxLeaf = (p: Pen, col = "#c8853a") => {
  p.poly([[50, 6], [88, 40], [74, 88], [50, 94], [26, 88], [12, 40]], col, 5);
  p.stroke([[50, 12], [50, 92]], 3, mix(col, INK, 0.4));
};
