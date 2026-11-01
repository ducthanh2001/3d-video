// Our cast as lit flat sprites in the 3D world (ep001). Each frame every character asks for a drawing (a key + a draw call);
// the pool keeps one canvas per distinct drawing. Characters are yaw-only billboards shaded by cardShade() (scene tint, side
// gradient toward the sun, painted crescent); standing ones get a soft multiply contact blob. Effects are unlit cards.
// Cards, effects and blobs live on the NOINK layer so the world ink pass never outlines their quads.
import * as THREE from "three";
import { Pen, bodyFront, bodySide, fxBurst, fxContact, fxPuff, fxShadow, fxStars, SKINS, Outfit, Expr, FrontOpts, SideOpts } from "../../engine/toon";
import { milo } from "../../series/character";
import { fxNumber, fxCalendar, fxMagnify, fxBigBook, fxFlag, fxGlow, fxConfetti } from "./cards";
import { FPS, SHOTS, INT, CHURCH, STABLE, clamp01, smooth, easeOut, miloX2, miloHop2 } from "./story";
import { NOINK } from "./ink";
import { cardShade, blobMaterial, CARD_K } from "./cardshade";

// ---------------- canvas pool ----------------
type Entry = { cv: HTMLCanvasElement; tex: THREE.CanvasTexture; w: number; h: number };
export type Req = { key: string; w: number; h: number; k: number; draw: (p: Pen) => void; tex?: THREE.CanvasTexture };
const makeEntry = (w: number, h: number): Entry => {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return { cv, tex, w, h };
};
export class Pool {
  private live = new Map<string, Entry>();
  private free: Entry[] = [];
  private reqs: Req[] = [];
  req(key: string, w: number, h: number, k: number, draw: (p: Pen) => void) {
    const r: Req = { key: `${w}x${h}|${key}`, w, h, k, draw };
    this.reqs.push(r);
    return r;
  }
  flush() {
    const want = new Map<string, Req[]>();
    for (const r of this.reqs) { const l = want.get(r.key); if (l) l.push(r); else want.set(r.key, [r]); }
    for (const [key, e] of this.live) if (!want.has(key)) { this.live.delete(key); this.free.push(e); }
    for (const [key, rs] of want) {
      let e = this.live.get(key);
      if (!e) {
        const r = rs[0], i = this.free.findIndex((x) => x.w === r.w && x.h === r.h);
        e = i >= 0 ? this.free.splice(i, 1)[0] : makeEntry(r.w, r.h);
        const g = e.cv.getContext("2d")!;
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, e.w, e.h); g.setTransform(r.k, 0, 0, r.k, 0, 0);
        r.draw(new Pen(g));
        e.tex.needsUpdate = true;
        this.live.set(key, e);
      }
      for (const r of rs) r.tex = e.tex;
    }
    this.reqs = [];
  }
}

// ---------------- sprite meshes ----------------
const blank = (() => { const c = document.createElement("canvas"); c.width = c.height = 2; return new THREE.CanvasTexture(c); })();
export const SU = 0.00216; // metres per design unit: 1000 units = 2.16 m
export const SU_SWING = 2.3 / 1830; // swing canvas: rope of 1830 units = 2.3 m
const BODY = (() => { const g = new THREE.PlaneGeometry(600 * SU, 1000 * SU); g.translate(0, (975 - 500) * SU, 0); return g; })();
const CARD = new THREE.PlaneGeometry(1, 1);
/** world roots that hold actors (to find the scene's sun when world.ts does not pass it) */
const ROOTS = new Set<THREE.Object3D>();

/** lit flat character: cardShade() material, receives shadows (dims to the bright floor only), casts its silhouette
 *  when world.ts says so (golden). Drawn after the contact blobs (renderOrder 1). */
export class Actor {
  mesh: THREE.Mesh; mat: THREE.MeshLambertMaterial; dmat: THREE.MeshDepthMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D, geo: THREE.BufferGeometry = BODY) {
    this.mat = cardShade(new THREE.MeshLambertMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide }));
    this.mat.alphaToCoverage = false; // A2C + MSAA left 1 px sky-depth seams on blurred far cards (POST)
    this.dmat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.customDepthMaterial = this.dmat;
    // rim width is in output pixels: tell the card shader the render height (1920 = 1080 x 1920 frame)
    this.mesh.onBeforeRender = (r) => { const rt = r.getRenderTarget(); CARD_K.uPx.value = (rt ? rt.height : r.domElement.height) / 1920; };
    this.mesh.castShadow = false; this.mesh.receiveShadow = true; this.mesh.visible = false;
    this.mesh.rotation.order = "YXZ"; this.mesh.renderOrder = 1; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
    ROOTS.add(parent);
  }
  bind() { const t = this.r?.tex; if (t) { this.mat.map = t; this.dmat.map = t; } }
}
/** unlit effect card: hard cut-out (ink drawings), soft see-through (dust, mist) or a multiply ground blob */
export class Fx {
  mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; soft: THREE.MeshBasicMaterial; blob: THREE.MeshBasicMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D) {
    this.mat = new THREE.MeshBasicMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mat.alphaToCoverage = false; // A2C + MSAA left 1 px sky-depth seams on blurred far cards (POST)
    this.soft = new THREE.MeshBasicMaterial({ map: blank, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    this.blob = blobMaterial(blank);
    this.mesh = new THREE.Mesh(CARD, this.mat);
    this.mesh.visible = false; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
  }
  use(soft: boolean) { this.mesh.material = soft ? this.soft : this.mat; }
  bind() {
    const t = this.r?.tex;
    if (!t) return;
    if (this.r!.key.includes("|blob|")) {
      // no mipmaps: at grazing views the mip chain averages the blob with its white surround and it fades out
      if (t.generateMipmaps) { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.needsUpdate = true; }
      this.blob.map = t; this.mesh.material = this.blob; this.mesh.renderOrder = 0.5;
    }
    else { this.mat.map = t; this.soft.map = t; this.mesh.renderOrder = 0; }
  }
}


// ---------------- placements ----------------
export type Place = {
  key: string; draw: (p: Pen) => void; x: number; y: number; z: number;
  scale?: number; mirror?: boolean; yaw?: number; geo?: "body"; roll?: number; size?: [number, number, number];
};
/** yaw (radians) pins a card to a wall instead of billboarding it (0 faces +z, -PI/2 faces -x) */
export type FxPlace = { key: string; cw: number; ch: number; draw: (p: Pen) => void; x: number; y: number; z: number; w: number; h: number; flat?: boolean; rot?: number; soft?: boolean; yaw?: number };
/** sun = world direction TOWARD the sun (optional: when absent the scene's shadow-casting light is used) */
export type CamInfo = { pos: THREE.Vector3; right: THREE.Vector3; sun?: THREE.Vector3 };

const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const q = (v: number, n = 120) => Math.round(v * n) / n;
/** drawing resolution by distance: [canvas w, h, scale from the 600 x 1000 design]; sized for the 1440 x 2560 final */
const tier = (d: number): [number, number, number] =>
  d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];

// ---------------- light ----------------
const SUN = new THREE.Vector3(0.5, 0.75, -0.4).normalize();
const tmp = new THREE.Vector3();
let LNAME: "day" | "golden" | "dusk" | "interior" = "day";
const sunOf = (root: THREE.Object3D) => {
  let s: THREE.DirectionalLight | null = null;
  root.traverse((o) => { if (!s && o instanceof THREE.DirectionalLight && o.castShadow) s = o; });
  return s as THREE.DirectionalLight | null;
};
/** the sun of the world that is calling: the attached root whose sun target sits on this camera's view axis */
const findSun = (cam: CamInfo, out: THREE.Vector3) => {
  if (cam.sun) return out.copy(cam.sun).normalize();
  let best: THREE.DirectionalLight | null = null, err = Infinity;
  for (const r of ROOTS) {
    if (!r.parent) continue;
    const s = sunOf(r);
    if (!s) continue;
    const d = tmp.copy(s.target.position).sub(cam.pos), e = Math.abs(d.dot(cam.right)) / (d.length() || 1);
    if (e < err) { err = e; best = s; }
  }
  return best ? out.copy(best.position).sub(best.target.position).normalize() : out;
};
/** canvas angle the sun comes FROM on an upright card facing the camera, in 45-degree steps (small texture cache) */
const light2D = (cam: CamInfo, mirror: boolean) => {
  const sx = SUN.dot(cam.right) * (mirror ? -1 : 1), sy = -SUN.y;
  return Math.round(Math.atan2(sy, sx) / (Math.PI / 4)) * (Math.PI / 4);
};

// ---------------- life: blinks and reaction timing ----------------
/** reference expression and action changes land 0-3 f before the word onset */
const LEAD = 2 / FPS;
/** eyelid 0 open .. 1 shut. Reference: gaps 0.5-2.3 s, 4-frame blink half / shut / shut / half, plus a blink across
 *  every expression swap (the shut frames hide the swap) */
const LID = [0.5, 1, 1, 0.5];
const lidAt = (t: number, i: number, swaps: number[] = []) => {
  const f = Math.round(t * FPS);
  for (const ts of swaps) { const k = f - Math.round((ts - LEAD) * FPS) + 1; if (k >= 0 && k < 4) return LID[k]; }
  let s = Math.round(-60 * hh(i, 9));
  for (let n = 0; s <= f && n < 400; n++) {
    const k = f - s;
    if (k >= 0 && k < 4) return LID[k];
    s += Math.round(15 + 54 * hh(i * 31 + n, 13)); // next blink 0.5-2.3 s later
  }
  return 0;
};
const fkey = (o: object) => JSON.stringify(o, (_k, v) => (typeof v === "number" ? q(v) : v));

type Who = { i: number; o: Outfit; okey: string };
/** one character drawing in the 600 x 1000 design space, sized by distance, lit from the scene's sun */
const person = (cam: CamInfo, who: Who, x: number, y: number, z: number, view: { side: boolean; mirror: boolean }, fo: FrontOpts, so: SideOpts, scale = 1): Place & { tierKey: string } => {
  const d = cam.pos.distanceTo(tmp.set(x, y + 1.2, z)) / scale;
  const [w, h, k] = tier(d);
  const mirror = view.side && view.mirror, light = light2D(cam, mirror), seed = seedOf(who.i);
  const f2: FrontOpts = { ...fo, light, seed }, s2: SideOpts = { ...so, light, seed };
  const key = view.side ? `S|${who.okey}|${fkey(s2)}` : `F|${who.okey}|${fkey(f2)}`;
  return {
    key, x, y, z, scale, mirror, tierKey: `${w}`,
    draw: (p) => (view.side ? bodySide(p, who.o, s2) : bodyFront(p, who.o, f2)),
    size: [w, h, k],
  };
};
/** ground shadow under a standing / sitting card (review rounds 2-4), multiply, blue-violet: a TIGHT contact pool right under
 *  the feet (~.5 on screen at the core) so nobody floats, plus by day (cards cast no real shadow) a lighter soft tail
 *  stretched AWAY from the sun, length ~1.6 m / tan(sun elevation), capped. Golden: world.ts casts real card shadows. */
const CONTACT: Record<"day" | "golden" | "dusk" | "interior", [number, number, number]> = { day: [0.2, 0.21, 0.33], golden: [0.24, 0.2, 0.33], dusk: [0.3, 0.3, 0.42], interior: [0.3, 0.26, 0.34] };
const TAIL: [number, number, number] = [0.42, 0.44, 0.62];
const toSrgb = (v: number) => { const c = clamp01(v); return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; };
const hexOf = (c: [number, number, number], k: number) => "#" + c.map((v) => Math.round(255 * toSrgb(1 - (1 - v) * k)).toString(16).padStart(2, "0")).join("");
const blob = (out: Stage, x: number, y: number, z: number, sc = 1, k = 1) => {
  const hl = Math.hypot(SUN.x, SUN.z) || 1, ox = -SUN.x / hl, oz = -SUN.z / hl, rot = Math.atan2(-ox, -oz);
  if (LNAME === "day") {
    const el = Math.asin(Math.min(0.99, Math.max(0.1, SUN.y)));
    const len = Math.min(2.4, Math.max(0.5, 1.6 / Math.tan(el))) * sc, h = len + 0.55 * sc, c = 0.3 * h; // feet at v = .2 of the card
    const tc = hexOf(TAIL, k);
    out.fx.push({ key: `blob|shadow|${tc}`, cw: 128, ch: 256, draw: (p) => fxShadow(p, tc), x: x + ox * c, y: y + 0.018, z: z + oz * c,
      w: 0.72 * sc, h, flat: true, rot });
  }
  const cc = hexOf(CONTACT[LNAME], k);
  out.fx.push({ key: `blob|contact|${cc}`, cw: 128, ch: 128, draw: (p) => fxContact(p, cc), x: x + ox * 0.03 * sc, y: y + 0.022, z: z + oz * 0.03 * sc,
    w: 0.52 * sc, h: 0.4 * sc, flat: true, rot });
};
const seedOf = (i: number) => ((i * 5 + 3) % 7) + 1; // Milo is i = 4: seedOf(4) = 3 = MILO_SEED

// ---------------- the cast of ep001 ----------------
export type Stage = { places: Place[]; fx: FxPlace[] };

const COATS = ["#8a7a5a", "#7a6a4a", "#9a8a6a", "#6a5a4a", "#8a6a4a", "#7a8a6a", "#6e7a8a", "#a08060"];
const HAIRS = ["#2a201a", "#5a3b2a", "#8a6a3a", "#9a9aa2"];
/** medieval villagers: earthy coats, hair or flat caps; every third one is a woman in a bonnet and a long dress */
const VIL = (v: number): Outfit => {
  const o: Outfit = { jacket: COATS[v % 8], pants: "#5a4a3a", boots: "#3a2f2a", skin: SKINS[v % 4] };
  if (v % 3 === 2) return { ...o, jacket: "#d8cfb8", dress: COATS[(v + 2) % 8], hat: "bonnet" };
  return v % 2 ? { ...o, hat: "hair", hair: HAIRS[v % 4] } : { ...o, hat: "cap", cap: COATS[(v + 3) % 8] };
};
const PRIEST: Outfit = { jacket: "#3a3540", dress: "#3a3540", pants: "#2a2530", boots: "#2a2a30", skin: SKINS[0], hat: "tonsure", hair: "#6a4a32" };
const MONK: Outfit = { ...PRIEST, jacket: "#8a6a4a", dress: "#8a6a4a" };
const JUDGE: Outfit = { jacket: "#7a2f2f", dress: "#7a2f2f", pants: "#2a2530", boots: "#2a2a30", skin: SKINS[2], hat: "cap", cap: "#2e2a36", moustache: "#9a9aa2", build: "stout" };
const GIANT: Outfit = { jacket: "#8d949c", pants: "#4a4a52", boots: "#2a2a30", skin: SKINS[2], hat: "helm", cap: "#8d949c", moustache: "#2a201a", build: "stout", belt: "#8a5a34", buttons: "#c9ccd2", sword: true };
const NORMAN: Outfit = { jacket: "#4a5a7a", pants: "#4a4a52", boots: "#2a2a30", skin: SKINS[0], hat: "helm", cap: "#8d949c", sword: true, sash: "#c9a14a", moustache: "#5a3b2a" };
const GUARD: Outfit = { jacket: "#5a4a3a", pants: "#4a4a52", boots: "#2a2a30", skin: SKINS[3], hat: "helm", cap: "#8d949c", moustache: "#2a201a" };
const GREG: Outfit = { jacket: "#a8a8a0", pants: "#6a5a4a", boots: "#3a2f2a", skin: SKINS[0], hat: "helm", cap: "#8d949c", build: "kid", belt: "#8a5a34", buttons: "#c9ccd2", sword: true };
const MILO = milo("medieval");

const act = (cam: CamInfo, out: Stage, who: Who, x: number, y: number, z: number, t: number, fo: FrontOpts, scale = 1) => {
  out.places.push(person(cam, who, x, y, z, { side: false, mirror: false }, { mode: "stand", blink: lidAt(t, who.i), ...fo }, {}, scale));
  blob(out, x, y, z, scale);
};
const W_MILO: Who = { i: 4, o: MILO, okey: "milo" };
const W_PRIEST: Who = { i: 12, o: PRIEST, okey: "priest" };
const W_JUDGE: Who = { i: 14, o: JUDGE, okey: "judge" };
const W_GIANT: Who = { i: 16, o: GIANT, okey: "giant" };
const W_NORMAN: Who = { i: 18, o: NORMAN, okey: "norman" };
const W_GREG: Who = { i: 20, o: GREG, okey: "greg" };
const W_GUARD: Who = { i: 22, o: GUARD, okey: "guard" };
const folk = (cam: CamInfo, out: Stage, i: number, x: number, z: number, t: number, fo: FrontOpts, y = 0, scale = 1) =>
  act(cam, out, { i: 30 + i, o: VIL(i), okey: `v${i}` }, x, y, z, t, fo, scale);
const at = (cam: CamInfo, x: number, z: number, dx: number) => [x + cam.right.x * dx, z + cam.right.z * dx] as const;
const glow = (out: Stage, x: number, y: number, z: number, w: number, col: string, a = 1) => {
  if (a > 0) out.fx.push({ key: `glow${col}`, cw: 400, ch: 400, draw: (p) => fxGlow(p, col), x, y, z, w: w * a, h: w * a, soft: true });
};

// ---- crowds: how a village reacts ----
type CP = [number, number, number?];
type Mood = "accuse" | "gasp" | "cheer" | "hush" | "smile" | "stern";
const mood = (kind: Mood, i: number, t: number): FrontOpts => {
  const wv = q(Math.sin(t * 7 + i * 1.3), 30);
  switch (kind) {
    case "accuse": return { expr: i % 3 === 0 ? "laugh" : i % 3 === 1 ? "stern" : "grin", wave: i % 2 ? wv : undefined, look: Math.round(Math.sin(t * 2 + i)) };
    case "gasp": return { expr: i % 2 ? "shock" : "nervous", look: Math.round(Math.sin(t * 1.5 + i)) };
    case "cheer": return { expr: i % 2 ? "laugh" : "grin", wave: wv };
    case "hush": return { expr: i % 3 ? "nervous" : "whistle", look: Math.round(Math.sin(t + i)) };
    case "smile": return { expr: i % 2 ? "smile_closed" : "grin" };
    default: return { expr: "stern" };
  }
};
const crowd = (cam: CamInfo, out: Stage, t: number, list: CP[], kind: Mood, i0 = 0) =>
  list.forEach(([x, z, s], i) => folk(cam, out, i0 + i, x, z, t, mood(kind, i0 + i, t), 0, s ?? 1));
/** the packed crowd round Milo on the green (shots 1, 4, 18): three rows and two children, all within the frame of the opening shot */
const BIG: CP[] = [[-0.95, -1.5], [1.05, -1.5], [-0.5, -1.4, 0.72], [0.55, -1.35, 0.7], [-1.5, -2.8], [-0.55, -2.8], [0.4, -2.8], [1.35, -2.8],
  [-1.9, -4.2], [-1.2, -4.2], [-0.4, -4.2], [0.35, -4.2], [1.1, -4.2], [1.8, -4.2], [-2.2, -6], [-0.8, -6], [0.7, -6], [2.0, -6]];
/** onlookers round the arena, two rows */
const RING: CP[] = [];
for (let k = 0; k < 14; k++) { const a = Math.PI * (-0.08 + (1.16 * k) / 13); RING.push([2.7 * Math.cos(a), 0.2 - 2.3 * Math.sin(a)]); }
for (let k = 0; k < 10; k++) { const a = Math.PI * (0.0 + (1.0 * k) / 9); RING.push([3.7 * Math.cos(a), 0.0 - 3.3 * Math.sin(a)]);}

// ---- shots 1 and 18: Milo bound, the crowd, 1 - 2 - 3 ----
const accused = (cam: CamInfo, out: Stage, t: number, f: number, loop: boolean) => {
  act(cam, out, W_MILO, 0, 0, 0, t, { expr: "nervous", prop: "bound", look: Math.round(Math.sin(f * 0.13)), headTilt: 4 * Math.sin(f * 0.21) });
  act(cam, out, W_GUARD, 0.95, 0, -0.15, t, { expr: "stern", prop: "stick" });
  crowd(cam, out, t, BIG, "accuse", 0);
  [1, 2, 3].forEach((n, k) => {
    const pop = easeOut((f - (loop ? -100 : 64 + 6 * k)) / 6);
    if (pop <= 0) return;
    // shot 1: at "only one actually works" the wrong two fade and the right one (3) blinks gold; shot 18: each lights as it is said
    const fade = !loop && f >= 118 && k !== 2;
    const blink = !loop && f >= 118 && k === 2 && Math.floor(f / 4) % 2 === 0;
    const hotAt = [1584, 1594, 1606][k], hot = (loop && f >= hotAt) || blink;
    const pulse = loop && f >= hotAt && f < hotAt + 8 ? 1 + 0.3 * Math.sin((Math.PI * (f - hotAt)) / 8) : 1;
    const [px, pz] = at(cam, 0, 0, (k - 1) * 0.36);
    out.fx.push({
      key: `num${n}${hot}${fade}`, cw: 200, ch: 200, soft: fade,
      draw: (p) => { if (fade) p.g.globalAlpha = 0.28; fxNumber(p, n, hot); p.g.globalAlpha = 1; },
      x: px, y: 2.04 + (k === 1 ? 0.2 : 0) + 0.03 * Math.sin(t * 3 + k), z: pz, w: 0.32 * pop * pulse * (fade ? 0.85 : 1), h: 0.32 * pop * pulse * (fade ? 0.85 : 1),
    });
  });
};

// ---- shot 2: the priest, the iron, three hopping steps, the bandage ----
const ironTrial = (cam: CamInfo, out: Stage, t: number, f: number) => {
  const x = miloX2(f), hop = miloHop2(f), holds = f < 200, carry = f >= 200 && f < 234;
  const px = f < 222 ? -1.0 : -1.0 + (x - 0.85 + 1.0) * smooth((f - 222) / 14);
  act(cam, out, W_PRIEST, px, 0, 0.3, t, { expr: "stern", prop: holds ? "iron" : null });
  const expr: Expr = f < 203 ? "nervous" : f < 213 ? "pained" : f < 234 ? "shock" : f < 262 ? "pained" : "nervous";
  act(cam, out, W_MILO, x, hop, 0.6, t, { expr, prop: carry ? "iron" : f >= 234 ? "hand" : null, hs: f < 240 ? "plain" : f < 248 ? "wrap1" : f < 256 ? "wrap2" : "wrapped" });
  crowd(cam, out, t, [[-2.1, -1.6], [-1.1, -2.5], [-0.1, -1.8], [1.0, -2.6], [2.0, -1.8], [3.0, -2.6], [-1.6, -4.0], [0.4, -4.0], [1.8, -4.0], [2.8, -4.4]], "gasp", 3);
  if (holds) glow(out, -1.9, 0.62, 0.0, 1.1, "#ff7a2a", 0.9);
  if (holds) { const [gx, gz] = at(cam, -1.0, 0.4, 0.42); glow(out, gx, 1.25, gz, 0.9, "#ff9a3a", 0.9); }
  if (carry) { const [gx, gz] = at(cam, x, 0.7, 0.4); glow(out, gx, 1.2 + hop, gz, 0.9, "#ff9a3a", 0.9); }
  if (f >= 200 && f < 212) { const u = (f - 200) / 12, [gx, gz] = at(cam, -0.1, 0.8, 0.3); out.fx.push({ key: `puff${q(u, 30)}`, cw: 300, ch: 300, draw: (p) => fxPuff(p, q(u, 30)), x: gx, y: 1.3, z: gz, w: 0.7, h: 0.7 }); }
};

// ---- shots 3 and 4: Milo holds his own hand out; a bubble shows it enlarged (healed, then infected); afterwards it is normal again ----
const handBeat = (cam: CamInfo, out: Stage, t: number, f: number, hs: string, bubble: "heal" | "infect" | null, f0: number, expr: Expr, priestExpr: Expr, shake = 0) => {
  const mx = 0.35, mz = 0.2;
  act(cam, out, W_MILO, mx, 0, mz, t, { expr, prop: "hand", hs });
  if (bubble) {
    const pop = easeOut((f - f0) / 6), tk = q(((f % 30) / 30), 12), [bx, bz] = at(cam, mx, mz, 0.061);
    out.fx.push({ key: `mag${bubble}${tk}`, cw: 740, ch: 760, draw: (p) => fxMagnify(p, bubble, tk), x: bx, y: 2.28, z: bz + 0.3, w: 1.125 * pop, h: 1.156 * pop });
  }
  act(cam, out, W_PRIEST, -0.8, 0, 0.1, t, { expr: priestExpr, headTilt: shake });
  crowd(cam, out, t, [[-1.4, -2.6], [0.2, -2.8], [1.5, -2.6], [-0.6, -4.0], [0.9, -4.2]], "gasp", 20);
};
const days = (cam: CamInfo, out: Stage, t: number, f: number) => {
  if (f < 301) {
    const day = f < 284 ? 1 : f < 292 ? 2 : 3, flip = day === 1 ? 0 : (f - (day === 2 ? 284 : 292)) / 6, pop = easeOut((f - 273) / 6);
    out.fx.push({ key: `cal${day}${q(flip, 6)}`, cw: 300, ch: 340, draw: (p) => fxCalendar(p, day, q(flip, 6)), x: 0, y: 1.5, z: 0, w: 1.2 * pop, h: 1.36 * pop });
    return;
  }
  const infect = f >= 338;
  handBeat(cam, out, t, f, infect ? "swollen" : "plain", infect ? "infect" : "heal", infect ? 338 : 301, infect ? "pained" : "smile_closed", infect ? "stern" : "smile_closed");
};
const guilty = (cam: CamInfo, out: Stage, t: number, f: number) => {
  const back = f >= 438; // after the verdict the hand is just a hand again
  handBeat(cam, out, t, f, back ? "plain" : "swollen", back ? null : "infect", 378, f < 430 ? "pained" : "nervous", "stern", f >= 412 ? 10 * Math.sin((f - 412) * 0.55) : 0);
};

// ---- shot 5: "Fine." ----
const fine = (cam: CamInfo, out: Stage, t: number, f: number) => {
  const x = -1.3 * smooth((f - 466) / 22);
  act(cam, out, W_MILO, x, 0, 0.4, t, { expr: f < 458 ? "pained" : "neutral", wave: f >= 460 && f < 480 ? q(Math.sin(f * 0.7), 30) : undefined, headTilt: f >= 452 && f < 466 ? 6 : 0 });
  if (f >= 452 && f < 468) { const u = (f - 452) / 16; out.fx.push({ key: `puff${q(u, 30)}`, cw: 300, ch: 300, draw: (p) => fxPuff(p, q(u, 30)), x: x + 0.3, y: 1.45, z: 0.6, w: 0.6, h: 0.6 }); }
  crowd(cam, out, t, [[-2.0, -2.4], [-1.0, -3.0], [0.6, -2.6], [1.6, -3.1], [2.4, -2.5]], "stern", 20);
};

// ---- shots 6-9: trial by combat ----
const arena = (cam: CamInfo, out: Stage, t: number, f: number, id: number) => {
  out.fx.push({ key: "combatring", cw: 600, ch: 600, draw: (p) => { p.ell(300, 300, 290, 290, "rgba(150,112,70,0.55)", 0); p.ell(300, 300, 262, 262, "rgba(214,190,140,0.75)", 0); }, x: 0, y: 0.03, z: 0, w: 6.2, h: 6.2, flat: true, soft: true });
  const mk: Mood = id === 6 ? "cheer" : id === 7 && f >= 731 ? "gasp" : id === 7 ? "cheer" : id === 8 ? "gasp" : "hush";
  crowd(cam, out, t, RING.filter(([x, z]) => !(Math.abs(x + 1.7) < 0.9 && z > -1.5)), mk, 40);
  act(cam, out, W_NORMAN, -1.7, 0, -0.6, t, { expr: "stern", prop: "stick" });
  out.fx.push({ key: "flag", cw: 260, ch: 420, draw: fxFlag, x: -1.7 + 0.18, y: 2.32 + 0.03 * Math.sin(t * 5), z: -0.6, w: 0.58, h: 0.94, rot: 0.05 * Math.sin(t * 4) });
};
const NOTE_BOARD = 0; void NOTE_BOARD;
const duel = (cam: CamInfo, out: Stage, t: number, f: number, id: number) => {
  arena(cam, out, t, f, id);
  if (id === 6) { act(cam, out, W_MILO, 0.2, 0, 0.9, t, { expr: "nervous", look: Math.round(Math.sin(f * 0.1)) }); return; }
  // 7, 8: Milo at the left, Greg walks in, the giant steps out
  const greg = id === 8 ? 0.3 : 0.3 + (-2.4 - 0.3) * (1 - smooth((f - 692) / 38));
  const miloAt = id === 7 && f >= 756 ? -1.3 : -1.3;
  act(cam, out, W_MILO, miloAt, 0, 1.2, t, { expr: id === 7 ? (f < 731 ? "grin" : "shock") : "shock", wave: id === 7 && f >= 656 && f < 700 ? q(Math.sin(f * 0.5), 30) : undefined });
  if (id === 7 && f >= 690 || id === 8) {
    const flying = id === 8 && f >= 803, u = clamp01((f - 803) / 24);
    const walking = id === 7 && f < 730;
    const gx = flying ? 0.3 - 4.8 * u : greg, gy = flying ? 0.2 + 6.5 * u - 4.5 * u * u : 0;
    out.places.push(person(cam, W_GREG, gx, gy, 0.3, { side: false, mirror: false },
      { mode: walking ? "stroll" : "stand", phase: walking ? ((f - 692) / 16) % 1 : 0, blink: lidAt(t, 20), expr: flying ? "shock" : "nervous", tilt: flying ? 0 : 3 * Math.sin(f * 2.1) },
      {}, 0.95));
    if (!flying) blob(out, gx, 0, 0.3, 0.95);
    if (flying && f < 818) out.fx.push({ key: `stars${q((f - 803) / 15, 30)}`, cw: 420, ch: 210, draw: (p) => fxStars(p, q((f - 803) / 15, 30)), x: gx, y: gy + 1.25, z: 0.4, w: 1.1, h: 0.55 });
    if (id === 8 && f >= 803 && f < 810) out.fx.push({ key: `burst${q((f - 803) / 7, 30)}`, cw: 500, ch: 500, draw: (p) => fxBurst(p, q((f - 803) / 7, 30)), x: 0.4, y: 1.0, z: 0.5, w: 1.4, h: 1.4 });
  }
  if ((id === 7 && f >= 731) || id === 8) {
    const gx = id === 8 ? 1.6 : 3.8 - 2.1 * smooth((f - 731) / 32), bump = id === 7 && f < 765 ? 0.07 * Math.max(0, Math.sin(Math.PI * (((f - 731) / 8) % 1))) : 0;
    const u = id === 8 ? 1 : smooth((f - 731) / 32);
    out.fx.push({ key: "blob|contact|#5a5a7a", cw: 128, ch: 128, draw: (p) => fxContact(p, "#5a5a7a"), x: gx - 0.9, y: 0.03, z: 0.4, w: 1.2 + 3.2 * u, h: 0.9 + 2.0 * u, flat: true });
    act(cam, out, W_GIANT, gx, bump, 0.3, t, { expr: "stern" }, 1.9);
  }
  if (id === 8) for (let n = 1; n <= 4; n++) {
    const f0 = 783 + 6 * (n - 1), next = f0 + 6;
    if (f >= f0 && (f < next || n === 4) && f < 812) out.fx.push({ key: `cnt${n}`, cw: 200, ch: 200, draw: (p) => fxNumber(p, n, true), x: 0.5, y: 3.3, z: 0.6, w: 0.95 * easeOut((f - f0) / 4), h: 0.95 * easeOut((f - f0) / 4) });
  }
};
const dazedMilo = (cam: CamInfo, out: Stage, t: number, f: number) => {
  const still = f >= 828 && f < 858;
  act(cam, out, W_MILO, 0, 0, 0.3, t, { mode: "sit", expr: "dazed", headTilt: still ? 0 : 3 * Math.sin(f * 0.3) });
  out.fx.push({ key: `stars${q(((f % 30) / 30), 30)}`, cw: 420, ch: 210, draw: (p) => fxStars(p, q(((f % 30) / 30), 30)), x: 0, y: 1.4, z: 0.4, w: 0.9, h: 0.45 });
  crowd(cam, out, t, [[-1.4, -2.0], [1.4, -2.2], [-0.5, -3.4], [0.8, -3.6]], "stern", 60);
};

// ---- the courts ----
const BEHIND: CP[] = [[-1.5, -0.4], [1.5, -0.5], [-0.8, -1.0], [0.9, -1.0], [-2.0, 0.5], [2.0, 0.6]];
const kings = (cam: CamInfo, out: Stage, t: number, f: number, judgeK: number | null) => {
  const X = INT;
  glow(out, X - 2.5, 2.6, -3.0, 4.2, "#ffe39a", 0.55);
  act(cam, out, W_JUDGE, X, 1.15, -2.3, t, { expr: "stern", prop: judgeK === null ? null : ["hammer", judgeK] as ["hammer", number] });
};
const lectern = (cam: CamInfo, out: Stage, t: number, f: number, id: number) => {
  void id;
  const X = INT;
  kings(cam, out, t, f, null);
  crowd(cam, out, t, [[-1.6, -0.5], [1.6, -0.5], [-0.9, -1.1], [0.9, -1.1]], "stern", 70);
  act(cam, out, W_PRIEST, X - 1.2, 0, 0.5, t, { expr: "stern", prop: f < 982 ? "book" : null });
  act(cam, out, W_MILO, X, 0, 0.2, t, { expr: f < 1000 ? "nervous" : "shock", look: Math.round(Math.sin(f * 0.1)) });
  if (f >= 982) out.fx.push({ key: "bigbook", cw: 520, ch: 360, draw: fxBigBook, x: X, y: 1.1, z: 1.05, w: 0.8 * easeOut((f - 982) / 6), h: 0.55 * easeOut((f - 982) / 6) });
};
const churchCourt = (cam: CamInfo, out: Stage, t: number, f: number) => {
  const X = CHURCH;
  glow(out, X, 2.6, -3.0, 6.0, "#fff2c0", 0.5);
  act(cam, out, { i: 51, o: MONK, okey: "abbot" }, X, 0.35, -2.5, t, { expr: "smile_closed" });
  [[-1.4, -0.6], [1.4, -0.7], [-0.6, -1.2], [0.7, -1.3], [-2.0, 0.4], [2.0, 0.5]].forEach(([x, z], i) => act(cam, out, { i: 52 + i, o: MONK, okey: `monk${i % 3}` }, X + x, 0, z, t, { expr: i % 2 ? "laugh" : "grin", wave: undefined }));
};
const gavel = (cam: CamInfo, out: Stage, t: number, f: number) => {
  const X = INT, k = f < 1110 ? 0 : f < 1114 ? (f - 1110) / 4 : f < 1126 ? 1 : Math.max(0, 1 - (f - 1126) / 6);
  kings(cam, out, t, f, k);
  crowd(cam, out, t, [[-1.6, -0.5], [1.6, -0.5], [-0.9, -1.1], [0.9, -1.1]], "stern", 70);
  [[-1.5, 2.4, -0.9, 0.5, 10], [1.3, 2.6, 0.8, 0.6, 11]].forEach(([x0, z0, x1, z1, id], i) => {
    const u = smooth((f - 1124) / 40), phase = ((f - 1124) / 16) % 1;
    act(cam, out, { i: 80 + i, o: VIL(id), okey: `peas${i}` }, X + x0 + (x1 - x0) * u, 0, z0 + (z1 - z0) * u, t, { mode: u < 1 && f >= 1124 ? "stroll" : "stand", phase: f >= 1124 ? phase : 0, expr: "nervous" });
  });
};
const stable = (cam: CamInfo, out: Stage, t: number, f: number) => {
  const X = STABLE;
  glow(out, X - 2.0, 2.6, -2.8, 3.2, "#ffc860", 0.6);
  act(cam, out, { i: 90, o: VIL(4), okey: "farmer" }, X, 0, 0.8, t, { expr: Math.floor(f / 4) % 2 ? "whistle" : "nervous", prop: "scroll", headTilt: 8 });
};
const reading = (cam: CamInfo, out: Stage, t: number, f: number) => {
  const X = INT;
  kings(cam, out, t, f, null);
  crowd(cam, out, t, BEHIND, "hush", 100);
  const expr: Expr = f < 1340 ? "nervous" : f < 1362 ? "neutral" : Math.floor(f / 5) % 2 ? "whistle" : "neutral";
  act(cam, out, W_MILO, X, 0, 0.2, t, { expr, prop: "book", headTilt: f >= 1340 && f < 1362 ? -4 : 0 });
};
const verdict = (cam: CamInfo, out: Stage, t: number, f: number) => {
  const X = INT, k = f < 1388 ? 0 : f < 1391 ? (f - 1388) / 3 : f < 1404 ? 1 : Math.max(0, 1 - (f - 1404) / 6);
  kings(cam, out, t, f, k);
  crowd(cam, out, t, BEHIND, f >= 1397 ? "cheer" : "hush", 100);
  act(cam, out, W_MILO, X, 0, 0.2, t, { expr: f < 1397 ? "relief" : "grin", prop: "book" });
  if (f >= 1397) {
    const u = q(((f - 1397) / 30) % 1, 12);
    for (const [dx, dy] of [[-0.5, 2.9], [0.6, 2.7], [0.0, 3.2]]) out.fx.push({ key: `conf${u}`, cw: 600, ch: 600, draw: (p) => fxConfetti(p, u), x: X + dx, y: dy, z: -0.2, w: 1.6, h: 1.6 });
  }
};
const twist = (cam: CamInfo, out: Stage, t: number, f: number) => {
  const X = INT;
  kings(cam, out, t, f, null);
  crowd(cam, out, t, BEHIND, "cheer", 100);
  act(cam, out, W_MILO, X, 0, 0.2, t, { expr: f < 1470 ? "relief" : "grin", prop: "book" });
};

/** everything with a face in shot `id` at frame f */
export const stage = (id: number, f: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] };
  const s = SHOTS[id - 1], t = f / FPS;
  LNAME = s.light;
  findSun(cam, SUN);
  switch (id) {
    case 1: accused(cam, out, t, f, false); break;
    case 2: ironTrial(cam, out, t, f); break;
    case 3: days(cam, out, t, f); break;
    case 4: guilty(cam, out, t, f); break;
    case 5: fine(cam, out, t, f); break;
    case 6: case 7: case 8: duel(cam, out, t, f, id); break;
    case 9: dazedMilo(cam, out, t, f); break;
    case 10: lectern(cam, out, t, f, id); break;
    case 11: if (f < 1066) churchCourt(cam, out, t, f); else if (f < 1111) { kings(cam, out, t, f, null); crowd(cam, out, t, BEHIND, "stern", 100); } else gavel(cam, out, t, f); break;
    case 12: case 14: stable(cam, out, t, f); break;
    case 15: reading(cam, out, t, f); break;
    case 16: verdict(cam, out, t, f); break;
    case 17: twist(cam, out, t, f); break;
    case 18: accused(cam, out, t, f, true); break;
  }
  return out;
};
export { FPS };
