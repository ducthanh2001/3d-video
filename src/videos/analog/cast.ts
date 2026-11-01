// Our cast as lit flat sprites in the 3D world ("24 Shots"). Each frame every character asks for a drawing (a key + a draw
// call); the pool keeps one canvas per distinct drawing. Characters are yaw-only billboards shaded by cardShade() (scene tint,
// side gradient toward the sun, painted crescent); standing ones get a soft multiply contact blob. Effects are unlit cards.
// Cards, effects and blobs live on the NOINK layer so the world ink pass never outlines their quads.
import * as THREE from "three";
import {
  Pen, bodyFront, bodySide, fxBurst, fxShadow, fxContact, townsfolk,
  JUNE, SKINS, phoneAt, Outfit, Expr, FrontOpts, SideOpts,
} from "./toon";
import { fxNotif, fxGlow, fxShards, fxBattery, fxHandprint, fxCounter, fxPhoto, fxPlatter, dogCard } from "./cards";
import {
  FPS, D0, SHOTS, SET, BUS, BAKERY, DOG, SUNSET, J8R, clamp01, smooth, easeOut,
} from "./story";
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
let LNAME: "day" | "golden" | "dusk" = "day";
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
const CONTACT: Record<"day" | "golden" | "dusk", [number, number, number]> = { day: [0.2, 0.21, 0.33], golden: [0.24, 0.2, 0.33], dusk: [0.3, 0.3, 0.42] };
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
const seedOf = (i: number) => ((i * 5 + 3) % 7) + 1;
const upper = (i: number) => i;
void upper;

// ---------------- the cast ----------------
export type Stage = { places: Place[]; fx: FxPlace[] };

const MOD_COATS = ["#3f6fb5", "#8c3b4a", "#5d7a3a", "#b5653f", "#2f5f6a", "#7b5ac9", "#d8d8e0", "#4a4a52"];
const MOD_HAIR = ["#2a201a", "#5a3b2a", "#c9a35a", "#8a8a92"];
/** modern extras: caps, hair, buns in plain coats (no logos) */
const MOD = (v: number): Outfit => {
  const o: Outfit = { jacket: MOD_COATS[v % 8], pants: ["#3b3f52", "#4a4a4a", "#2f3a5a"][v % 3], boots: "#2a2a30", skin: SKINS[v % 4] };
  return v % 3 === 0 ? { ...o, hat: "cap", cap: MOD_COATS[(v + 3) % 8] } : v % 3 === 1 ? { ...o, hat: "hair", hair: MOD_HAIR[v % 4] } : { ...o, hat: "bun", hair: MOD_HAIR[(v + 1) % 4] };
};
const OWNER: Outfit = { jacket: "#8a5a34", pants: "#3b3f52", boots: "#2a2a30", hat: "hair", hair: "#9a9aa2", moustache: "#9a9aa2", skin: SKINS[3], build: "stout" };
void townsfolk;

const june = (cam: CamInfo, out: Stage, x: number, y: number, z: number, t: number, fo: FrontOpts, scale = 1) => {
  const f2: FrontOpts = { blink: lidAt(t, 1), ...fo };
  out.places.push(person(cam, { i: 1, o: JUNE, okey: "june" }, x, y, z, { side: false, mirror: false }, f2, {}, scale));
  blob(out, x, y, z, scale);
};
const extra = (cam: CamInfo, out: Stage, i: number, x: number, y: number, z: number, t: number, fo: FrontOpts, scale = 1) => {
  out.places.push(person(cam, { i: i + 10, o: MOD(i), okey: `m${i}` }, x, y, z, { side: false, mirror: false }, { blink: lidAt(t, i + 10), ...fo }, {}, scale));
  blob(out, x, y, z, scale);
};
const at = (cam: CamInfo, x: number, z: number, dx: number) => [x + cam.right.x * dx, z + cam.right.z * dx] as const;

/** a notification card popping up (6 f overshoot) next to a head; age in seconds */
const notif = (out: Stage, cam: CamInfo, kind: number, x: number, y: number, z: number, dx: number, dy: number, age: number, w = 0.46) => {
  if (age < 0) return;
  const pop = easeOut(age / 0.2) * (1 + 0.12 * Math.sin(Math.min(1, age / 0.2) * Math.PI)), [px, pz] = at(cam, x, z, dx);
  out.fx.push({ key: `notif${kind % 5}`, cw: 300, ch: 130, draw: (p) => fxNotif(p, kind), x: px, y: y + dy + 0.05 * Math.min(age, 1.2), z: pz, w: w * pop, h: w * pop * (130 / 300), rot: 0.06 * (kind % 3 - 1) });
};
const glow = (out: Stage, x: number, y: number, z: number, w: number, col = "#9fd8ff", a = 1) => {
  if (a <= 0) return;
  out.fx.push({ key: `glow${col}`, cw: 400, ch: 400, draw: (p) => fxGlow(p, col), x, y, z, w: w * a, h: w * a, soft: true });
};
const shutter = (out: Stage, t: number, t0: number, x: number, y: number, z: number) => {
  if (t >= t0 && t < t0 + 5 / FPS) {
    const u = (t - t0) / (5 / FPS);
    out.fx.push({ key: `burst${q(u, 30)}`, cw: 500, ch: 500, draw: (p) => fxBurst(p, q(u, 30), "#ffffff", 8, 40, 200), x, y, z, w: 0.9, h: 0.9 });
  }
};
const counter = (out: Stage, cam: CamInfo, n: number, x: number, y: number, z: number, dx: number, w = 0.34) => {
  const [px, pz] = at(cam, x, z, dx);
  out.fx.push({ key: `counter${n}`, cw: 220, ch: 220, draw: (p) => fxCounter(p, n), x: px, y, z: pz, w, h: w });
};

// ---- shot 1: the hook (f 0-161): June, a glowing phone, notifications piling up ----
const NOTIF_T = Array.from({ length: 14 }, (_, k) => 0.3 + 0.36 * k - 0.014 * k * k); // spawn times: faster and faster
const NOTIF_P: [number, number][] = [[0.34, 0.5], [-0.36, 0.42], [0.42, 0.18], [-0.44, 0.12], [0.12, 0.66], [-0.2, 0.62], [0.5, 0.82], [-0.5, 0.8], [0.3, 0.98], [-0.3, 0.96], [0.0, 1.1], [0.58, 0.46], [-0.58, 0.5], [0.0, 0.5]];
const hook = (cam: CamInfo, out: Stage, t: number) => {
  const x = 12, z = 33.0;
  june(cam, out, x, D0, z, t, { mode: "stand", expr: "neutral", prop: "phone", glow: 1, headTilt: 9, look: 0 });
  glow(out, x + 0.05, D0 + 1.12, z - 0.12, 1.5, "#9fd8ff", 0.9);
  NOTIF_T.forEach((t0, k) => { if (t0 < 5.2) notif(out, cam, k, x, D0 + 1.45, z - 0.1, NOTIF_P[k][0], NOTIF_P[k][1], t - t0); });
};

// ---- shots 2-3: the bus stop, the elevator, the bathroom ----
const busStop = (cam: CamInfo, out: Stage, t: number, f: number, close: boolean) => {
  const [bx, bz] = BUS, xs = [-3.1, -2.1, -1.0, 0.1, 1.4, 2.5, 3.4];
  xs.forEach((dx, i) => {
    if (i === 4) return;
    if (close && Math.abs(dx - 1.4) > 3.1) return;
    extra(cam, out, i, bx + dx, D0, bz - 0.5 + 0.8 * hh(i, 3), t, { mode: "stand", expr: "neutral", prop: "phone", glow: 1, headTilt: 8 + 3 * hh(i, 1), look: 0 });
  });
  june(cam, out, bx + 1.4, D0, bz - 0.5, t, { mode: "stand", expr: "neutral", prop: "phone", glow: 1, headTilt: 9 });
  const jx = bx + 1.4;
  glow(out, jx + 0.05, D0 + 1.12, bz - 0.7, 1.0, "#9fd8ff", 0.8);
  if (f >= 200 && f < 237) notif(out, cam, 2, jx, D0 + 1.55, bz - 0.6, 0.35, 0.2, (f - 198) / FPS, 0.4);
  void close;
};
const elevator = (cam: CamInfo, out: Stage, t: number, f: number) => {
  const x = SET.elevator;
  june(cam, out, x, 0, -0.2, t, { mode: "stand", expr: "neutral", prop: "phone", glow: 1, headTilt: 9 });
  glow(out, x + 0.05, 1.1, -0.35, 1.2, "#9fd8ff", 0.9);
  notif(out, cam, 1, x, 1.55, -0.3, 0.42, 0.2, (f - 296) / FPS, 0.4);
};
const bathroom = (cam: CamInfo, out: Stage, t: number, f: number) => {
  const x = SET.bath;
  june(cam, out, x, 0, -0.55, t, { mode: "stand", expr: "neutral", prop: "brush", headTilt: 3 });
  // her phone leans on the sink, still lit
  out.fx.push({ key: "sinkphone", cw: 140, ch: 240, draw: (p) => phoneAt(p, 70, 160, 3, 1, 0, 2), x: x + 0.78, y: 1.17, z: -1.0, w: 0.17, h: 0.29 });
  glow(out, x + 0.78, 1.15, -0.95, 0.9, "#9fd8ff", 0.8);
  notif(out, cam, 3, x + 0.78, 1.5, -0.95, 0.0, 0.1, (f - 333) / FPS, 0.34);
};

// ---- shots 4, 5, 6, 11: the sunset ----
const sunsetJune = (cam: CamInfo, out: Stage, t: number, f: number, id: number) => {
  const [x, z] = SUNSET;
  let fo: FrontOpts;
  if (id === 4) {
    if (f < 462) fo = { mode: "stand", back: true, headTilt: -4 };
    else if (f < 494) fo = { mode: "stand", back: true, prop: "phoneUp", headTilt: -2 };
    else fo = { mode: "stand", back: true, headTilt: 5 + 11 * smooth((f - 494) / 12) };
    shutter(out, t, 16.0, x + 0.45, D0 + 1.7, z);
    for (let k = 0; k < 4; k++) notif(out, cam, k + 1, x, D0 + 1.95, z - 0.1, -0.5 + 0.35 * k, 0.05 * (k % 2), t - (17.1 + 0.28 * k), 0.34);
  } else if (id === 5) {
    fo = { mode: "stand", back: true, headTilt: f < 578 ? 16 : 16 - 22 * smooth((f - 578) / 8) };
  } else fo = { mode: "stand", back: true, headTilt: -5 }; // shot 11: head up, phone in the pocket
  june(cam, out, x, D0, z, t, fo);
};
const phoneDies = (cam: CamInfo, out: Stage, t: number, f: number) => {
  const [x, z] = SUNSET, on = f < 685;
  let expr: Expr = "neutral", look = 0;
  if (f >= 687 && f < 700) expr = "shock";
  else if (f >= 700 && f < 706) { expr = "nervous"; look = f % 12 < 6 ? -1 : 1; }
  june(cam, out, x, D0, z, t, { mode: "stand", expr, look, prop: "phone", glow: on ? 1 : 0, headTilt: f < 687 ? 9 : 0 });
  if (on) glow(out, x + 0.05, D0 + 1.12, z - 0.12, 1.3, "#9fd8ff", 0.9);
  if (f >= 672 && f < 685) {
    notif(out, cam, 1, x, D0 + 1.7, z - 0.1, 0.2, 0.15, (f - 672) / FPS, 0.42);
    out.fx.push({ key: "battery1", cw: 300, ch: 160, draw: (p) => fxBattery(p, 0.04), x: at(cam, x, z, -0.25)[0], y: D0 + 1.35, z: at(cam, x, z, -0.25)[1] - 0.1, w: 0.32, h: 0.17 });
  }
  if (f >= 685 && f < 697) {
    const u = (f - 685) / 12, [px, pz] = at(cam, x, z, 0.2);
    out.fx.push({ key: `shards${q(u, 30)}`, cw: 500, ch: 500, draw: (p) => fxShards(p, q(u, 30)), x: px, y: D0 + 1.6, z: pz - 0.1, w: 0.9, h: 0.9 });
  }
};

// ---- shot 7: the camera shop ----
const shop = (cam: CamInfo, out: Stage, t: number, f: number) => {
  const x = SET.shop, jx = x - 0.4;
  extra(cam, out, 5, x + 1.5, 0, -1.95, t, { mode: "stand", expr: f < 918 ? "smile" : "smile_closed", headTilt: 0 });
  out.places[out.places.length - 1].draw = (p) => bodyFront(p, OWNER, { mode: "stand", expr: f < 918 ? "smile" : "smile_closed", light: 0 });
  const have = f >= 826;
  let expr: Expr = f < 826 ? "smile" : f < 866 ? "grin" : f < 918 ? "nervous" : f < 974 ? "shock" : "smile_closed";
  const look = f >= 870 && f < 918 ? (f % 16 < 8 ? -1 : 1) : 0;
  const tilt = f >= 870 && f < 918 ? 7 * Math.sin((f - 870) * 0.5) : 0;
  june(cam, out, jx, 0, -0.3, t, { mode: "stand", expr, look, tilt, prop: have ? "camera" : null, headTilt: f >= 974 ? -2 : 0 });
  if (f >= 836) counter(out, cam, 24, jx, 1.3, -0.2, 0.3, f < 866 ? 0.2 : 0.16);
};

// ---- shot 8: three pictures worth the frame ----
const lookAround = (f: number, f0: number) => ({ look: Math.round(Math.max(-1, Math.min(1, Math.sin((f - f0) * 0.09) * 1.4))), headTilt: 3 * Math.sin((f - f0) * 0.09) });
const looking = (cam: CamInfo, out: Stage, t: number, f: number) => {
  june(cam, out, 8, D0, 33.2, t, { mode: "stand", expr: f < 1075 ? "neutral" : "smile", prop: "camera", ...lookAround(f, 1021) });
};
/** raise the camera to the eye over 16 f, click on t0, lower again */
const raise = (t: number, t0: number) => {
  const u = (t - t0) * FPS;
  return u > -18 && u < 14;
};
const handprint = (cam: CamInfo, out: Stage, t: number, f: number) => {
  const [kx, kz] = BAKERY, jx = kx - 3.6, jz = kz - 0.3, up = raise(t, 37.95);
  june(cam, out, jx, D0, jz, t, { mode: "stand", expr: up ? "neutral" : "smile_closed", prop: up ? "cameraEye" : "camera", ...(up ? {} : lookAround(f, 1100)) });
  out.fx.push({ key: "handprint", cw: 300, ch: 340, draw: fxHandprint, x: kx - 0.1, y: D0 + 1.25, z: kz + 0.45, w: 0.56, h: 0.63, yaw: -Math.PI / 2 });
  shutter(out, t, 37.95, jx + 0.1, D0 + 1.0, jz - 0.2);
  counter(out, cam, t < 37.95 ? 24 : 23, jx, D0 + 0.62, jz, 0.55);
};
const dog = (cam: CamInfo, out: Stage, t: number, f: number) => {
  const [dx, dz] = DOG, jx = dx + 2.5, jz = dz - 0.3, up = raise(t, 39.7), wag = Math.sin(t * 11), blinkD = (t * 0.7) % 1 > 0.94;
  out.places.push({ key: `dog${q(wag, 8)}${blinkD}`, size: [300, 500, 0.5], x: dx, y: D0, z: dz, scale: 0.55, draw: (p) => dogCard(p, q(wag, 8), blinkD) });
  blob(out, dx, D0, dz, 0.6);
  june(cam, out, jx, D0, jz, t, { mode: "stand", expr: up ? "neutral" : "smile", prop: up ? "cameraEye" : "camera", ...(up ? {} : lookAround(f, 1158)) });
  shutter(out, t, 39.7, jx - 0.1, D0 + 1.0, jz - 0.2);
  counter(out, cam, t < 39.7 ? 23 : 22, jx, D0 + 0.62, jz, 0.55);
};
const bridgeAt5 = (cam: CamInfo, out: Stage, t: number) => {
  const up = raise(t, 41.3);
  june(cam, out, J8R[0], D0, J8R[1], t, { mode: "stand", back: true, prop: up ? "cameraEye" : null, headTilt: -2 });
  shutter(out, t, 41.3, J8R[0] - 0.4, D0 + 1.7, J8R[1]);
};

// ---- shot 9: the buffet and the small plate ----
const buffet = (cam: CamInfo, out: Stage, t: number) => {
  const x = SET.buffet;
  for (let i = 0; i < 7; i++)
    out.fx.push({ key: `platter${i % 3}`, cw: 320, ch: 200, draw: (p) => fxPlatter(p, i % 3), x: x - 2.6 + i * 0.87, y: 0.96, z: -2.05, w: 0.8, h: 0.5 });
  for (let i = 0; i < 9; i++) {
    const row = i < 5 ? 0 : 1, k = row ? i - 5 : i, dx = (row ? -1.7 + k * 1.15 : -2.3 + k * 1.15), bob = 0.025 * Math.abs(Math.sin(t * 6 + i));
    extra(cam, out, i + 20, x + dx, bob, row ? -1.0 : -0.2, t, { mode: "stand", expr: i % 3 === 0 ? "stern" : "neutral", prop: "plateB", look: 0 }, 1);
  }
};
const smallPlate = (cam: CamInfo, out: Stage, t: number) => {
  const x = SET.plate;
  june(cam, out, x, 0, -1.0, t, { mode: "sit", expr: "smile_closed", blink: 1, headTilt: 3 * Math.sin(t * 2.4) });
  out.fx.push({ key: "smallplate", cw: 200, ch: 120, draw: (p) => { p.ell(100, 70, 80, 22, "#ffffff", 5); p.ell(100, 66, 52, 12, "#e9edf3", 0); p.ell(100, 52, 20, 18, "#d6384a", 5); }, x, y: 0.43, z: -0.1, w: 0.5, h: 0.3 });
};

// ---- shot 10: the darkroom ----
const darkroom = (cam: CamInfo, out: Stage, t: number, f: number) => {
  const x = SET.dark, kinds = [0, 1, 2, 3];
  glow(out, x + 2.17, 2.65, -2.3, 3.2, "#ff4a3a", 0.9);
  kinds.forEach((k, i) => {
    const age = (f - (1498 + 8 * i)) / FPS;
    if (age < 0) return;
    const pop = easeOut(age / 0.2);
    out.fx.push({ key: `photo${k}`, cw: 300, ch: 360, draw: (p) => fxPhoto(p, k), x: x - 1.2 + i * 0.75, y: 1.78, z: -1.65, w: 0.58 * pop, h: 0.696 * pop, rot: 0.04 * (i % 2 ? 1 : -1) });
  });
  const mem = [1534, 1547, 1560];
  june(cam, out, x + 1.9, 0, -0.3, t, { mode: "stand", expr: f < 1534 ? "smile" : "smile_closed", headTilt: f < 1534 ? -5 : -2 });
  mem.forEach((f0, i) => {
    const age = (f - f0) / FPS;
    if (age < 0) return;
    const pop = easeOut(age / 0.22);
    out.fx.push({ key: `mem${i}`, cw: 300, ch: 360, draw: (p) => fxPhoto(p, i), x: x + 1.9 + (i - 1) * 0.6, y: 2.35 + 0.05 * Math.min(age, 1), z: -0.3, w: 0.42 * pop, h: 0.5 * pop, rot: 0.1 * (i - 1) });
  });
};

/** everything with a face in shot `id` at frame f */
export const stage = (id: number, f: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] };
  const s = SHOTS[id - 1], t = f / FPS;
  LNAME = s.light;
  findSun(cam, SUN);
  switch (id) {
    case 1: hook(cam, out, t); break;
    case 2: busStop(cam, out, t, f, false); break;
    case 3: if (f < 282) busStop(cam, out, t, f, true); else if (f < 320) elevator(cam, out, t, f); else bathroom(cam, out, t, f); break;
    case 4: case 5: case 11: sunsetJune(cam, out, t, f, id); break;
    case 6: phoneDies(cam, out, t, f); break;
    case 7: shop(cam, out, t, f); break;
    case 8:
      if (f < 1100) looking(cam, out, t, f); else if (f < 1158) handprint(cam, out, t, f); else if (f < 1201) dog(cam, out, t, f); else bridgeAt5(cam, out, t);
      break;
    case 9: if (f < 1332) buffet(cam, out, t); else smallPlate(cam, out, t); break;
    case 10: darkroom(cam, out, t, f); break;
  }
  return out;
};
export { FPS };
