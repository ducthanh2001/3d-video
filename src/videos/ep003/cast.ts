// ep003 cast as lit flat sprites in the 3D world. The machinery (canvas pool, lit card actors, unlit effect cards, contact
// blobs, blinks) is ep001/ep002's; what each shot shows is new. Milo is the channel's fixed character (series/character.ts);
// everyone else is drawn for this episode: the judge, the prosecutor, the clerk, the guard, the rooster's fat owner, the
// rooster itself (a card), the villagers, and the little effect cards (monster bubble, Satan, idea bulb, tumbleweed...).
import * as THREE from "three";
import { Pen, bodyFront, fxContact, fxPuff, fxShadow, fxNote, SKINS, Outfit, Expr, FrontOpts } from "../../engine/toon";
import { milo } from "../../series/character";
import { fxGlow } from "../ep001/cards";
import { fxBubble, fxThink, fxFlame } from "../ep002/cards";
import { fxRooster, RoosterPose, fxEgg, fxMonsterBubble, fxSatan, fxBulb, fxTrain, fxFolder3, fxFrame, fxFeather, fxTumble, fxLeaf } from "./cards";
import { FPS, SHOTS, Q, OF, SQ, SPOT, clamp01, smooth, easeOut } from "./story";
import { NOINK } from "../ep001/ink";
import { cardShade, blobMaterial, CARD_K } from "../ep001/cardshade";

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
const BODY = (() => { const g = new THREE.PlaneGeometry(600 * SU, 1000 * SU); g.translate(0, (975 - 500) * SU, 0); return g; })();
const CARD = new THREE.PlaneGeometry(1, 1);
const ROOTS = new Set<THREE.Object3D>();

export class Actor {
  mesh: THREE.Mesh; mat: THREE.MeshLambertMaterial; dmat: THREE.MeshDepthMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D, geo: THREE.BufferGeometry = BODY) {
    this.mat = cardShade(new THREE.MeshLambertMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide }));
    this.mat.alphaToCoverage = false;
    this.dmat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.customDepthMaterial = this.dmat;
    this.mesh.onBeforeRender = (r) => { const rt = r.getRenderTarget(); CARD_K.uPx.value = (rt ? rt.height : r.domElement.height) / 1920; };
    this.mesh.castShadow = false; this.mesh.receiveShadow = true; this.mesh.visible = false;
    this.mesh.rotation.order = "YXZ"; this.mesh.renderOrder = 1; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
    ROOTS.add(parent);
  }
  bind() { const t = this.r?.tex; if (t) { this.mat.map = t; this.dmat.map = t; } }
}
export class Fx {
  mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; soft: THREE.MeshBasicMaterial; blob: THREE.MeshBasicMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D) {
    this.mat = new THREE.MeshBasicMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mat.alphaToCoverage = false;
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
      if (t.generateMipmaps) { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.needsUpdate = true; }
      this.blob.map = t; this.mesh.material = this.blob; this.mesh.renderOrder = 0.5;
    }
    else { this.mat.map = t; this.soft.map = t; this.mesh.renderOrder = 0; }
  }
}

// ---------------- placements ----------------
export type Place = {
  key: string; draw: (p: Pen) => void; x: number; y: number; z: number;
  scale?: number; mirror?: boolean; yaw?: number; roll?: number; size?: [number, number, number];
};
export type FxPlace = { key: string; cw: number; ch: number; draw: (p: Pen) => void; x: number; y: number; z: number; w: number; h: number; flat?: boolean; rot?: number; soft?: boolean; yaw?: number };
export type CamInfo = { pos: THREE.Vector3; right: THREE.Vector3; sun?: THREE.Vector3 };

const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const q = (v: number, n = 120) => Math.round(v * n) / n;
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
const light2D = (cam: CamInfo, mirror: boolean) => {
  const sx = SUN.dot(cam.right) * (mirror ? -1 : 1), sy = -SUN.y;
  return Math.round(Math.atan2(sy, sx) / (Math.PI / 4)) * (Math.PI / 4);
};

// ---------------- life: blinks ----------------
const LID = [0.5, 1, 1, 0.5];
const lidAt = (t: number, i: number) => {
  const f = Math.round(t * FPS);
  let s = Math.round(-60 * hh(i, 9));
  for (let n = 0; s <= f && n < 400; n++) {
    const k = f - s;
    if (k >= 0 && k < 4) return LID[k];
    s += Math.round(15 + 54 * hh(i * 31 + n, 13));
  }
  return 0;
};
const fkey = (o: object) => JSON.stringify(o, (_k, v) => (typeof v === "number" ? q(v) : v));

type Who = { i: number; o: Outfit; okey: string };
const seedOf = (i: number) => ((i * 5 + 3) % 7) + 1; // Milo is i = 4: seedOf(4) = 3 = MILO_SEED
const person = (cam: CamInfo, who: Who, x: number, y: number, z: number, fo: FrontOpts, scale = 1): Place => {
  const d = cam.pos.distanceTo(tmp.set(x, y + 1.2, z)) / scale;
  const [w, h, k] = tier(d);
  const light = light2D(cam, false), seed = seedOf(who.i);
  const f2: FrontOpts = { ...fo, light, seed };
  return { key: `F|${who.okey}|${fkey(f2)}`, x, y, z, scale, draw: (p) => bodyFront(p, who.o, f2), size: [w, h, k] };
};
const CONTACT: Record<"day" | "golden" | "dusk" | "interior", [number, number, number]> = { day: [0.2, 0.21, 0.33], golden: [0.24, 0.2, 0.33], dusk: [0.3, 0.3, 0.42], interior: [0.3, 0.26, 0.34] };
const TAIL: [number, number, number] = [0.42, 0.44, 0.62];
const toSrgb = (v: number) => { const c = clamp01(v); return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; };
const hexOf = (c: [number, number, number], k: number) => "#" + c.map((v) => Math.round(255 * toSrgb(1 - (1 - v) * k)).toString(16).padStart(2, "0")).join("");
const blob = (out: Stage, x: number, y: number, z: number, sc = 1, k = 1) => {
  const hl = Math.hypot(SUN.x, SUN.z) || 1, ox = -SUN.x / hl, oz = -SUN.z / hl, rot = Math.atan2(-ox, -oz);
  if (LNAME === "day") {
    const el = Math.asin(Math.min(0.99, Math.max(0.1, SUN.y)));
    const len = Math.min(2.4, Math.max(0.5, 1.6 / Math.tan(el))) * sc, h = len + 0.55 * sc, c = 0.3 * h;
    const tc = hexOf(TAIL, k);
    out.fx.push({ key: `blob|shadow|${tc}`, cw: 128, ch: 256, draw: (p) => fxShadow(p, tc), x: x + ox * c, y: y + 0.018, z: z + oz * c, w: 0.72 * sc, h, flat: true, rot });
  }
  const cc = hexOf(CONTACT[LNAME], k);
  out.fx.push({ key: `blob|contact|${cc}`, cw: 128, ch: 128, draw: (p) => fxContact(p, cc), x: x + ox * 0.03 * sc, y: y + 0.022, z: z + oz * 0.03 * sc, w: 0.52 * sc, h: 0.4 * sc, flat: true, rot });
};

// ---------------- who is who ----------------
export type Stage = { places: Place[]; fx: FxPlace[] };
/** Milo the lawyer (as in ep002): grey-blue wool tunic, brown hose, a black gown worn as a cloak. The drained one has grey skin. */
const MILO_LAW = milo("medieval", { jacket: "#5f7388", hem: "#5f7388", pants: "#6a4a32", boots: "#3a2a20", sash: "#4a3426", cloak: "#2a2630" });
const MILO_GREY = milo("medieval", { jacket: "#5f7388", hem: "#5f7388", pants: "#6a4a32", boots: "#3a2a20", sash: "#4a3426", cloak: "#2a2630", skin: "#b8bdb4" });
const JUDGE: Outfit = { jacket: "#8a2f3a", dress: "#8a2f3a", pants: "#2a2530", boots: "#2a2a30", skin: SKINS[2], hat: "cap", cap: "#2e2a36", moustache: "#c9c4cc", build: "stout" };
const PROSECUTOR: Outfit = { jacket: "#26222e", dress: "#26222e", cloak: "#3a3244", pants: "#1d1b22", boots: "#1d1b22", skin: SKINS[0], hat: "cap", cap: "#1d1b22", moustache: "#3a2a20" };
const OWNER: Outfit = { jacket: "#d6a63a", pants: "#5a4a3a", boots: "#3a2f2a", skin: SKINS[1], hat: "cap", cap: "#8a6a3a", moustache: "#6a4a32", build: "stout", sash: "#7a2f2f" };
const SCRIBE: Outfit = { jacket: "#6a5a8a", dress: "#6a5a8a", pants: "#2a2530", boots: "#2a2a30", skin: SKINS[2], hat: "tonsure", hair: "#8a7a5a" };
const GUARD: Outfit = { jacket: "#4a5a7a", pants: "#4a4a52", boots: "#2a2a30", skin: SKINS[3], hat: "helm", cap: "#c9a14a", moustache: "#2a201a", belt: "#6a4a2a" };
const COATS = ["#8a7a5a", "#7a6a4a", "#9a8a6a", "#6a5a4a", "#8a6a4a", "#7a8a6a", "#6e7a8a", "#a08060"];
const HAIRS = ["#2a201a", "#5a3b2a", "#8a6a3a", "#9a9aa2"];
const VIL = (v: number): Outfit => {
  const o: Outfit = { jacket: COATS[v % 8], pants: "#5a4a3a", boots: "#3a2f2a", skin: SKINS[v % 4] };
  if (v % 3 === 2) return { ...o, jacket: "#d8cfb8", dress: COATS[(v + 2) % 8], hat: "bonnet" };
  return v % 2 ? { ...o, hat: "hair", hair: HAIRS[v % 4] } : { ...o, hat: "cap", cap: COATS[(v + 3) % 8] };
};
const W_MILO: Who = { i: 4, o: MILO_LAW, okey: "milo" };
const W_GREY: Who = { i: 4, o: MILO_GREY, okey: "milo_grey" };
const W_JUDGE: Who = { i: 14, o: JUDGE, okey: "judge" };
const W_PROS: Who = { i: 15, o: PROSECUTOR, okey: "pros" };
const W_OWNER: Who = { i: 16, o: OWNER, okey: "owner" };
const W_SCRIBE: Who = { i: 17, o: SCRIBE, okey: "scribe" };
const W_GUARD: Who = { i: 19, o: GUARD, okey: "guard" };

const act = (cam: CamInfo, out: Stage, who: Who, x: number, y: number, z: number, t: number, fo: FrontOpts, scale = 1, shadow = true) => {
  out.places.push(person(cam, who, x, y, z, { mode: "stand", blink: lidAt(t, who.i), ...fo }, scale));
  if (shadow) blob(out, x, y, z, scale);
};
const at = (cam: CamInfo, x: number, z: number, dx: number) => [x + cam.right.x * dx, z + cam.right.z * dx] as const;
const glow = (out: Stage, x: number, y: number, z: number, w: number, col: string, a = 1) => {
  if (a > 0) out.fx.push({ key: `glow${col}`, cw: 400, ch: 400, draw: (p) => fxGlow(p, col), x, y, z, w: w * a, h: w * a, soft: true });
};
const card = (out: Stage, key: string, cw: number, ch: number, draw: (p: Pen) => void, x: number, y: number, z: number, w: number, h: number, extra: Partial<FxPlace> = {}) =>
  out.fx.push({ key, cw, ch, draw, x, y, z, w, h, ...extra });
const pop = (f: number, f0: number, d = 6) => easeOut((f - f0) / d);
const hammerK = (f: number, hit: number) => (f < hit - 4 ? 0 : f < hit ? (f - (hit - 4)) / 4 : f < hit + 14 ? 1 : Math.max(0, 1 - (f - hit - 14) / 6));

// ---------------- crowds ----------------
type CP = [number, number, number?];
type Mood = "cheer" | "hush" | "smile" | "stern" | "gasp" | "freeze" | "away";
const mood = (kind: Mood, i: number, t: number): FrontOpts => {
  const wv = q(Math.sin(t * 7 + i * 1.3), 30);
  switch (kind) {
    case "cheer": return { expr: i % 2 ? "laugh" : "grin", wave: i % 3 ? wv : undefined };
    case "gasp": return { expr: i % 2 ? "shock" : "nervous", look: Math.round(Math.sin(t * 1.5 + i)) };
    case "hush": return { expr: i % 3 ? "nervous" : "neutral", look: Math.round(Math.sin(t + i)) };
    case "smile": return { expr: i % 2 ? "smile_closed" : "grin" };
    case "freeze": return { expr: i % 2 ? "nervous" : "neutral", blink: 0 };
    case "away": return { expr: i % 3 ? "neutral" : "stern", look: 1, blink: 0 };
    default: return { expr: "stern", look: Math.round(Math.sin(t * 0.7 + i)) };
  }
};
const folk = (cam: CamInfo, out: Stage, i: number, x: number, z: number, t: number, fo: FrontOpts, scale = 1) =>
  act(cam, out, { i: 30 + i, o: VIL(i), okey: `v${i}` }, x, 0, z, t, fo, scale);
// two rows packed behind Milo and the dock (they fill the background of every medium shot and the middle of the wide ones),
// plus the two flanks (the edges of the wide shots)
const ROW1: CP[] = [[-2.1, -2.2], [-1.35, -2.3], [-0.55, -2.15, 0.72], [0.35, -2.3], [1.1, -2.2], [3.0, -2.3], [3.8, -2.0], [-3.9, -2.2]];
const ROW2: CP[] = [[-2.5, -3.0], [-1.7, -3.05], [-0.9, -3.0], [-0.1, -3.05], [0.7, -3.0], [1.5, -3.05], [2.3, -3.0], [3.3, -3.05], [-3.3, -3.05], [-4.1, -3.0]];
const FLANK: CP[] = [[-5.0, -1.2], [-4.6, 0.4], [-5.3, 1.4], [-4.2, 1.2, 0.72], [4.5, -1.0], [4.9, 0.5], [4.2, 1.3], [5.4, 1.5, 0.72]];
const crowd = (cam: CamInfo, out: Stage, t: number, kind: Mood) =>
  [...ROW1.map((c, i) => [c, i] as const), ...ROW2.map((c, i) => [c, i + 10] as const), ...FLANK.map((c, i) => [c, i + 20] as const)]
    .forEach(([[x, z, s], i]) => folk(cam, out, i, SQ + x, z, t, mood(kind, i, t), s ?? 1));

// ---------------- the rooster ----------------
const rooster = (out: Stage, f: number, pose: RoosterPose, x: number, y: number, z: number, h = 0.8, t0 = 0, shadow = true) => {
  const t = f / FPS, blink = Math.floor(f / 4 + 3) % 29 === 0, ph = q(((f - t0) / (pose === "nod" ? 20 : 36)) % 1, 12), w = h * (400 / 480);
  out.fx.push({ key: `roo${pose}${blink}${ph}`, cw: 400, ch: 480, draw: (p) => fxRooster(p, pose, blink, ph), x, y: y + 0.47 * h, z, w, h });
  if (shadow) blob(out, x, y, z, h * 0.9);
  void t;
};
const egg = (out: Stage, x: number, y: number, z: number, h = 0.2) => card(out, "egg0", 200, 260, (p) => fxEgg(p, 0), x, y + h * 0.5, z, h * (200 / 260), h);

// ================= the office (1, 17, 18, 19) =================
const FRAME: [number, number, number] = [OF + 0.42, 1.0, -0.52];
const office = (out: Stage, f: number, folder: "egg" | "train" | "both" | "none", folderPos = 0) => {
  const X = OF, t = f / FPS;
  glow(out, X - 1.8, 1.95, -2.5, 2.6, "#ffe39a", 0.5);
  card(out, `flame${q((t * 3) % 1, 8)}`, 120, 200, (p) => fxFlame(p, q((t * 3) % 1, 8) * 6.28), X - 0.72, 1.07, -0.55, 0.07, 0.12);
  glow(out, X - 0.72, 1.08, -0.5, 0.75, "#ffc860", 0.85 + 0.1 * Math.sin(t * 11));
  if (folder === "egg" || folder === "both") card(out, "folder_egg", 400, 300, (p) => fxFolder3(p, "egg"), X - 0.3 - folderPos, 0.785, -0.52, 0.42, 0.32, { flat: true, rot: 0.08 });
  if (folder === "train" || folder === "both") card(out, "folder_train", 400, 300, (p) => fxFolder3(p, "train"), X + 0.32 + (folder === "train" ? folderPos : 0), 0.785, -0.5, 0.42, 0.32, { flat: true, rot: -0.06 });
};
const SEAT: [number, number, number] = [OF, 0.38, -1.35];
const opening = (cam: CamInfo, out: Stage, t: number, f: number) => {
  office(out, f, "egg");
  card(out, "frame", 400, 480, fxFrame, FRAME[0], FRAME[1], FRAME[2], 0.34, 0.41);
  if (f >= Q.rooster - 6) {
    const s = pop(f, Q.rooster - 6, 8);
    rooster(out, f, f < Q.egg ? "stare" : "cluck", FRAME[0], FRAME[1] - 0.17, FRAME[2] + 0.03, 0.3 * s, 0, false);
    egg(out, FRAME[0] + 0.27, 0.785, -0.4, 0.1 * s);
  }
  const look = f >= Q.egg - 2 ? 1 : f >= Q.rooster - 2 ? 1 : Math.round(Math.sin(f * 0.08));
  act(cam, out, W_MILO, ...SEAT, t, { mode: "sit", expr: f >= Q.egg - 2 ? "shock" : f >= Q.rooster - 2 ? "nervous" : "neutral", look, headTilt: f >= Q.rooster ? -4 : 3 * Math.sin(f * 0.15) }, 1, false);
};
const nextCase = (cam: CamInfo, out: Stage, t: number, f: number, loop: boolean) => {
  const rel = loop ? f - Q.L18 : 0;
  if (!loop) {
    // the rooster's file is closed; at "Next client" it slides off and the train file slides in
    const k = smooth((f - (Q.next - 14)) / 14), n = smooth((f - (Q.next - 4)) / 16);
    office(out, f, f < Q.next - 14 ? "egg" : "both", k * 1.4);
    out.fx = out.fx.filter((e) => e.key !== "folder_train");
    if (f >= Q.next - 4) card(out, "folder_train", 400, 300, (p) => fxFolder3(p, "train"), OF + 1.9 - 1.58 * n, 0.785, -0.5, 0.42, 0.32, { flat: true, rot: -0.06 });
    if (f >= Q.train - 2 && f < Q.subscribe) {
      for (let j = 0; j < 3; j++) { const u = q(((f - Q.train + 2 + 9 * j) / 27) % 1, 12); card(out, `steam${u}`, 300, 300, (p) => fxPuff(p, u), OF + 0.62, 0.95 + 0.4 * u, -0.4, 0.3, 0.3); }
    }
    const feel: Expr = f < Q.next ? "pained" : f < Q.train - 2 ? "nervous" : f < Q.subscribe - 2 ? "shock" : "grin";
    // at "Subscribe" he jumps to his feet and points at the button
    const up = f >= Q.subscribe - 4, hop = up ? 0.2 * Math.sin(Math.PI * clamp01((f - (Q.subscribe - 4)) / 9)) : 0;
    if (up) act(cam, out, W_MILO, OF, hop, SEAT[2], t, { mode: "stand", expr: feel, look: 1, wave: 0.55, headTilt: -3 }, 1, false);
    else act(cam, out, W_MILO, ...SEAT, t, { mode: "sit", expr: feel, look: f >= Q.next ? 1 : 0, headTilt: f < Q.next ? 6 : 0 }, 1, false);
    return;
  }
  office(out, f, "train");
  card(out, "frame", 400, 480, fxFrame, FRAME[0], FRAME[1], FRAME[2], 0.34, 0.41);
  const s = pop(f, Q.L18 + 6, 8), puff = q((f / 40) % 1, 8);
  card(out, `trainframe${puff}`, 640, 400, (p) => fxTrain(p, puff), FRAME[0], FRAME[1] - 0.04, FRAME[2] + 0.03, 0.3 * s, 0.1875 * s);
  act(cam, out, W_MILO, ...SEAT, t, { mode: "sit", expr: rel < 30 ? "grin" : "nervous", look: 1, headTilt: rel > 30 ? -4 : 0 }, 1, false);
};

// ================= the court (2 - 16) =================
type O = Partial<{
  judge: FrontOpts; milo: FrontOpts & { x?: number; grey?: boolean }; rooster: RoosterPose | null; pros: FrontOpts | null; owner: (FrontOpts & { x?: number; z?: number }) | null;
  scribe: FrontOpts | null; guard: FrontOpts | null; crowd: Mood | null; egg: boolean; t0: number;
}>;
const court = (cam: CamInfo, out: Stage, t: number, f: number, o: O) => {
  const S = SPOT, X = SQ;
  act(cam, out, W_JUDGE, X + S.judge[0], S.judge[1], S.judge[2], t, { expr: "stern", ...o.judge }, 1, false);
  act(cam, out, W_SCRIBE, X + S.scribe[0], 0, S.scribe[2], t, { expr: "neutral", prop: "scroll", headTilt: 4 * Math.sin(f * 0.5), look: -1, ...o.scribe }, 0.95);
  act(cam, out, W_GUARD, X + S.guard[0], 0, S.guard[2], t, { expr: "stern", prop: "stick", ...o.guard });
  const pr = o.pros === null ? null : { expr: "stern" as Expr, ...o.pros };
  if (pr) act(cam, out, W_PROS, X + S.prosecutor[0], 0, S.prosecutor[2], t, pr);
  const ow = o.owner === null ? null : { expr: "nervous" as Expr, ...o.owner };
  if (ow) act(cam, out, W_OWNER, X + (ow.x ?? S.owner[0]), 0, ow.z ?? S.owner[2], t, ow, 1.08);
  if (o.milo) { const m = o.milo; act(cam, out, m.grey ? W_GREY : W_MILO, X + (m.x ?? S.milo[0]), 0, S.milo[2], t, { expr: "nervous", ...m }); }
  if (o.rooster) rooster(out, f, o.rooster, X + S.dock[0], S.dock[1], S.dock[2], 0.82, o.t0 ?? 0);
  if (o.egg !== false) egg(out, X + S.egg[0], S.egg[1], S.egg[2], 0.2);
  if (o.crowd) crowd(cam, out, t, o.crowd);
};
const roosterAt = (f: number): RoosterPose =>
  f < 150 ? "stand" : f < 175 ? "cluck" : f < Q.milo3 ? "stand" : f < Q.roosters ? (f >= Q.simple ? "proud" : "stand") : f < Q.lost1 ? "proud" : f < Q.L7 + 56 ? "worried" : f < Q.satan ? "nod"
  : f < Q.L10 + 30 ? "shock" : f < Q.L13 ? "worried" : "worried";

const basel = (cam: CamInfo, out: Stage, t: number, f: number) =>
  court(cam, out, t, f, { milo: { expr: f < Q.real ? "nervous" : "neutral", prop: "scroll" }, rooster: f < 150 ? "stand" : f < 175 ? "cluck" : "stand", crowd: "hush", pros: { expr: "stern" }, owner: { expr: "nervous" } });
const judgeGavel = (cam: CamInfo, out: Stage, t: number, f: number) => {
  const startled = f >= Q.milo3, hop = startled ? 0.2 * Math.max(0, 1 - (f - Q.milo3) / 9) * Math.abs(Math.sin((f - Q.milo3) * 0.5)) : 0;
  court(cam, out, t, f, {
    judge: { expr: "stern", prop: ["hammer", hammerK(f, Q.judge3)] as ["hammer", number], look: f >= Q.judge3 ? -1 : 0, headTilt: f >= Q.judge3 ? -6 : 0 },
    milo: { expr: startled ? (f < Q.milo3 + 14 ? "shock" : "nervous") : "neutral", prop: "scroll", tilt: startled ? 5 * Math.sin(f * 1.3) * Math.max(0, 1 - (f - Q.milo3) / 18) : 0 }, rooster: "stand", crowd: "gasp",
  });
  void hop;
};
const BUBBLE_AT: [number, number, number] = [SQ + 4.6, 3.2, -1.8];
const bubbleT = (f: number) => f < 290 ? 0 : f < 338 ? 0.3 * (f - 290) / 48 : f < 355 ? 0.3 + 0.15 * (f - 338) / 17 : f < 361 ? 0.45 + 0.15 * (f - 355) / 6 : f < 370 ? 0.6 + 0.25 * (f - 361) / 9 : Math.min(1, 0.85 + 0.15 * (f - 370) / 7);
const monsters = (cam: CamInfo, out: Stage, t: number, f: number) => {
  court(cam, out, t, f, { milo: { expr: "nervous", prop: "scroll" }, rooster: "stand", crowd: f >= Q.monster ? "gasp" : "hush" });
  if (f >= 290 && f < Q.L5) {
    const bt = q(bubbleT(f), 40), s = pop(f, 290, 8);
    if (bt < 1) card(out, `mon${bt}`, 520, 560, (p) => fxMonsterBubble(p, bt), BUBBLE_AT[0], BUBBLE_AT[1], BUBBLE_AT[2], 1.35 * s, 1.45 * s);
  }
};
const firstArgument = (cam: CamInfo, out: Stage, t: number, f: number) =>
  court(cam, out, t, f, { milo: { expr: "grin", wave: f >= Q.roosters - 6 ? 0.55 : undefined, headTilt: f >= Q.roosters ? -3 : 0 }, rooster: roosterAt(f), crowd: f >= Q.roosters ? "smile" : "hush" });
const notCare = (cam: CamInfo, out: Stage, t: number, f: number) => {
  const yawn = f < 512;
  court(cam, out, t, f, {
    judge: yawn ? { expr: "whistle", blink: 1, headTilt: -8, tilt: -2 } : { expr: "neutral", wave: q(0.8 * Math.sin(f * 0.55), 30), look: 0, headTilt: 5 },
    milo: { expr: f < Q.round1 ? "grin" : f < Q.lost1 + 8 ? "pained" : "nervous", headTilt: f >= Q.lost1 ? 8 : 0 }, rooster: roosterAt(f), crowd: f >= Q.care ? "smile" : "hush",
  });
};
const PACE = (f: number) => ({ x: -1.0 + 0.55 * Math.sin((f - Q.L7) / 21), ph: (((f - Q.L7) / 12) % 1 + 1) % 1, dir: Math.cos((f - Q.L7) / 21) });
const realDefense = (cam: CamInfo, out: Stage, t: number, f: number) => {
  const p = PACE(f);
  court(cam, out, t, f, {
    milo: { x: p.x, mode: "stroll", phase: p.ph, expr: f < Q.inv ? "grin" : f < Q.hurt ? "smile" : "grin", prop: "scroll", look: p.dir > 0 ? 1 : -1 }, rooster: f >= Q.inv - 6 ? "nod" : "stand", t0: Q.inv - 6,
    scribe: { expr: "grin", headTilt: 8 * Math.sin(f * 0.9), look: -1 }, crowd: "hush",
  });
};
const hesitate = (cam: CamInfo, out: Stage, t: number, f: number) => {
  court(cam, out, t, f, { judge: { expr: f < Q.hesitates ? "neutral" : "nervous", headTilt: -7 + 3 * Math.sin(f * 0.12), look: 1 }, milo: { expr: "smile_closed", prop: "scroll" }, rooster: "stand", crowd: "hush" });
  const s = pop(f, Q.L8 + 6, 8), [bx, bz] = at(cam, SQ, -3.4, 0.5);
  card(out, `think${q((f / 36) % 1, 3)}`, 400, 340, (p) => fxThink(p, q((f / 36) % 1, 3)), bx, 2.9 + 0.05 * Math.sin(f * 0.1), bz, 0.6 * s, 0.51 * s);
};
const SATAN_PATH = (f: number) => { const u = smooth((f - Q.satan) / 16), w = f > Q.satan + 16 ? 0.06 * Math.sin((f - Q.satan) * 0.3) : 0; return [SQ - 0.9 + 2.15 * u, 2.7 - 1.0 * u + w, -0.55] as const; };
const prosecutor = (cam: CamInfo, out: Stage, t: number, f: number) => {
  const sat = f >= Q.satan;
  court(cam, out, t, f, {
    pros: { expr: "grin", wave: 0.55, headTilt: f >= Q.pros ? -5 : 0, look: 0 }, milo: { expr: sat ? "nervous" : "nervous", prop: "scroll" }, rooster: sat ? "shock" : "stand",
    scribe: { expr: sat ? "shock" : "nervous", headTilt: 0 }, crowd: sat ? "gasp" : "hush",
  });
  if (f >= Q.pros + 8 && f < Q.satan + 2) { const [px, pz] = at(cam, SQ - 3.0, -1.8, 0.0); const s = pop(f, Q.pros + 8, 8); card(out, "sat_hint", 420, 420, (p) => fxSatan(p, 0.2), px - 0.3, 3.3, pz - 0.1, 0.5 * s, 0.5 * s, { soft: true }); }
  if (f >= Q.satan - 2 && f < Q.animals + 24) {
    const [sx, sy, sz] = SATAN_PATH(f), ph = q(((f - Q.satan) / 20) % 1, 12), fade = f > Q.animals + 8 ? clamp01(1 - (f - Q.animals - 8) / 16) : 1;
    card(out, `satan${ph}`, 420, 420, (p) => fxSatan(p, ph), sx, sy, sz, 0.9 * fade, 0.9 * fade, { soft: true });
    const s = pop(f, Q.satan + 2, 6);
    const [bx, bz] = at(cam, SQ + SPOT.dock[0], SPOT.dock[2], -0.42);
    card(out, "bubble_satan", 560, 300, (p) => fxBubble(p, "SATAN?", 1, 92), bx, 1.9, bz + 0.1, 0.62 * s * fade, 0.33 * s * fade);
  }
};
const oneMove = (cam: CamInfo, out: Stage, t: number, f: number) => {
  const ideaOn = f >= Q.idea;
  court(cam, out, t, f, {
    milo: { grey: !ideaOn && f >= Q.lost2, expr: f < Q.lost2 ? "nervous" : ideaOn ? "shock" : "pained", wave: ideaOn ? 0.55 : undefined, headTilt: ideaOn ? 0 : 9, blink: f >= Q.L10 + 70 ? 0 : undefined, look: 0 },
    rooster: "worried", crowd: "stern",
  });
  if (ideaOn) { const s = pop(f, Q.idea, 6), [bx, bz] = at(cam, SQ + SPOT.milo[0], SPOT.milo[2], -0.42); const ph = q(((f - Q.idea) / 10) % 1, 8); card(out, `bulb${ph}`, 200, 260, (p) => fxBulb(p, ph), bx, 2.45, bz, 0.5 * s, 0.65 * s); }
};
const owner = (cam: CamInfo, out: Stage, t: number, f: number) => {
  const gulp = f >= 998 && f < 1012 ? 8 * Math.sin(((f - 998) / 14) * Math.PI) : 0;
  court(cam, out, t, f, {
    milo: { expr: f < Q.owner + 20 ? "grin" : f < Q.ifegg + 30 ? "grin" : "smile", wave: 0.55, headTilt: -3 },
    owner: { expr: "nervous", tilt: 2.5 * Math.sin(f * 1.7), headTilt: -gulp, look: -1 }, rooster: "worried", crowd: "gasp",
  });
};
const silence = (cam: CamInfo, out: Stage, t: number, f: number) => {
  court(cam, out, t, f, {
    judge: { expr: "neutral", blink: 0 }, milo: { expr: "nervous", blink: 0, prop: "scroll" }, owner: { expr: "nervous", blink: 0 }, pros: { expr: "stern", blink: 0 }, scribe: { expr: "nervous", blink: 0, headTilt: 0 },
    guard: { expr: "stern", blink: 0 }, rooster: "worried", crowd: "freeze",
  });
  const u = clamp01((f - Q.L12) / 58);
  card(out, `tumble${q(u * 4, 24)}`, 300, 300, (p) => fxTumble(p, q(u * 4, 24) * 6.28), SQ + 7 - 14 * u, 0.42 + 0.14 * Math.abs(Math.sin(u * 16)), 2.6, 0.85, 0.85);
  const fy = 3.1 - 2.0 * clamp01((f - Q.L12 - 10) / 48), sway = 0.45 * Math.sin((f - Q.L12) * 0.12);
  card(out, "feather", 120, 260, fxFeather, SQ + 0.5 + sway, fy, 0.9, 0.18, 0.39, { rot: 0.6 * Math.sin((f - Q.L12) * 0.12) });
  for (let k = 0; k < 3; k++) { const v = clamp01((f - Q.L12 - 8 * k) / 50), key = `leaf${k}`; card(out, key, 100, 100, (p) => fxLeaf(p, ["#c8853a", "#b8532a", "#d8a33a"][k]), SQ + 5 - 10 * v, 1.0 + 0.7 * Math.sin(v * 9 + k), 1.2 + k * 0.6, 0.2, 0.2, { rot: v * 14 + k }); }
};
const verdict = (cam: CamInfo, out: Stage, t: number, f: number, id: 13) => {
  void id;
  court(cam, out, t, f, {
    judge: { expr: f >= Q.guilty ? "grin" : "stern", prop: ["hammer", hammerK(f, Q.guilty)] as ["hammer", number] }, milo: { expr: f >= Q.guilty ? "pained" : "nervous", headTilt: f >= Q.guilty + 4 ? 10 : 0 },
    owner: { expr: f >= Q.guilty ? "grin" : "nervous" }, crowd: "gasp", rooster: f < 1143 ? "worried" : null, egg: f < 1143,
  });
};
const away = (cam: CamInfo, out: Stage, t: number, f: number, id: 14 | 15 | 16) => {
  const S = SPOT, X = SQ;
  const base = (extra: O) => court(cam, out, t, f, { judge: { expr: "neutral" }, rooster: null, egg: false, scribe: { expr: "neutral", look: 1 }, guard: { expr: "stern" }, pros: { expr: "stern", look: 1 }, ...extra });
  if (id === 14) { base({ milo: { expr: "pained", headTilt: 16, blink: 0, look: 0 }, owner: { expr: "neutral", look: 1 }, crowd: "away" }); return; }
  if (id === 16) { base({ milo: { expr: "pained", headTilt: 14, look: 0 }, owner: null, crowd: "away" }); return; }
  // 15: the owner strolls off whistling; Milo grins a little in the background, then pains
  const u = clamp01((f - Q.L15) / 52), x = S.owner[0] + 1.7 * u, z = S.owner[2] - 3.0 * u, ph = ((f - Q.L15) / 18) % 1;
  base({ milo: { expr: f < Q.never + 14 ? "smile" : "pained", headTilt: f < Q.never + 14 ? -4 : 10, look: 1 }, owner: null, crowd: "away" });
  act(cam, out, W_OWNER, X + x, 0, z, t, { mode: "stroll", phase: ph, expr: "whistle", tilt: -3, look: 0 }, 1.08);
  for (let n = 0; n < 3; n++) {
    const age = (((f - Q.L15) / 30) + n * 0.33) % 1, pp = Math.min(1, age * 6) * (age > 0.8 ? (1 - age) / 0.2 : 1);
    if (pp <= 0.02 || f < Q.L15 + 4) continue;
    const kind = n % 2, [nx, nz] = at(cam, X + x, z, 0.3 + 0.2 * age);
    card(out, `note${kind}`, 220, 260, (p) => fxNote(p, kind), nx, 2.15 + 0.7 * age, nz, 0.26 * pp, 0.31 * pp, { rot: 0.3 * Math.sin(age * 6 + n) });
  }
};

// ---- thumbnail (shot 22): Milo in shock, the rooster staring into the lens, the crowd gasping behind them ----
const thumbnail = (cam: CamInfo, out: Stage, t: number, f: number) =>
  court(cam, out, t, f, { milo: { x: -0.15, expr: "shock", prop: "scroll", blink: 0, look: 1, headTilt: -5 }, rooster: "stare", crowd: "gasp", owner: { expr: "nervous" }, judge: { expr: "stern" } });

/** everything with a face in shot `id` at frame f */
export const stage = (id: number, f: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] };
  const s = SHOTS[id - 1], t = f / FPS;
  LNAME = s.light;
  findSun(cam, SUN);
  switch (id) {
    case 1: opening(cam, out, t, f); break;
    case 2: basel(cam, out, t, f); break;
    case 3: judgeGavel(cam, out, t, f); break;
    case 4: monsters(cam, out, t, f); break;
    case 5: firstArgument(cam, out, t, f); break;
    case 6: notCare(cam, out, t, f); break;
    case 7: realDefense(cam, out, t, f); break;
    case 8: hesitate(cam, out, t, f); break;
    case 9: prosecutor(cam, out, t, f); break;
    case 10: oneMove(cam, out, t, f); break;
    case 11: case 20: case 21: owner(cam, out, t, f); break;
    case 22: thumbnail(cam, out, t, 0); break;
    case 12: silence(cam, out, t, f); break;
    case 13: verdict(cam, out, t, f, 13); break;
    case 14: away(cam, out, t, f, 14); break;
    case 15: away(cam, out, t, f, 15); break;
    case 16: away(cam, out, t, f, 16); break;
    case 17: nextCase(cam, out, t, f, false); break;
    case 18: nextCase(cam, out, t, f, true); break;
    case 19: nextCase(cam, out, t, Q.L18 + 40, true); break;
  }
  return out;
};
export { FPS };
