// ep002 cast as lit flat sprites in the 3D world. The machinery (canvas pool, lit card actors, unlit effect cards, contact
// blobs, blinks) is ep001's; what each shot shows is new. Milo is the channel's fixed character (series/character.ts);
// everyone else is drawn for this episode: the French judge, the rats, Pope Stephen, the wrapped and seated Formosus,
// the two later popes, Roman clergy, bearers, a guard and the crowds.
import * as THREE from "three";
import { Pen, bodyFront, fxContact, fxPuff, fxShadow, SKINS, Outfit, FrontOpts } from "../../engine/toon";
import { milo } from "../../series/character";
import { fxCalendar, fxGlow, fxConfetti } from "../ep001/cards";
import { fxRat, RatPose, fxFolder, fxSummons, fxPortrait, fxBubble, fxThink, fxShroud, fxVerdict, fxNotice, fxBanner, fxFlame, fxNextCase } from "./cards";
import { FPS, SHOTS, Q, OF, FR, RO, PZ, clamp01, smooth, easeOut } from "./story";
import { DOOR, THRONE } from "./sets";
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
/** Milo the lawyer: grey-blue wool tunic, brown hose, a black gown worn as a cloak; Milo the deacon: a plain white tunic */
const MILO_LAW = milo("medieval", { jacket: "#5f7388", hem: "#5f7388", pants: "#6a4a32", boots: "#3a2a20", sash: "#4a3426", cloak: "#2a2630" });
const MILO_DEACON = milo("medieval", { jacket: "#a8483a", hem: "#a8483a", pants: "#6a4a32", boots: "#3a2a20", sash: "#e8d8a8", cloak: undefined });
const JUDGE: Outfit = { jacket: "#8a2f3a", dress: "#8a2f3a", pants: "#2a2530", boots: "#2a2a30", skin: SKINS[2], hat: "cap", cap: "#2e2a36", moustache: "#c9c4cc", build: "stout" };
const STEPHEN: Outfit = { jacket: "#6a3488", dress: "#6a3488", cloak: "#3e1a58", pants: "#2a2530", boots: "#2a2a30", skin: SKINS[0], hat: "mitre", cap: "#efe2b8", buttons: "#d9b84a", moustache: "#3a2a20", build: "stout" };
const FORMOSUS: Outfit = { jacket: "#f4f1e8", dress: "#f4f1e8", pants: "#d8d4c8", boots: "#c9a35a", skin: "#e2e8d4", hat: "mitre", cap: "#f6f0e0", buttons: "#d9b84a" };
const THEODORE: Outfit = { jacket: "#fbf8f0", dress: "#fbf8f0", cloak: "#e8d8a8", pants: "#d8d4c8", boots: "#c9a35a", skin: SKINS[0], hat: "mitre", cap: "#fbf8f0", buttons: "#d9b84a" };
const JOHN: Outfit = { jacket: "#fbf8f0", dress: "#fbf8f0", cloak: "#b8323a", pants: "#d8d4c8", boots: "#8a2f2f", skin: SKINS[2], hat: "mitre", cap: "#f4efe2", buttons: "#c8323a", moustache: "#b8b4bc" };
const CLERIC = (v: number): Outfit => { const c = ["#3a3540", "#4a3a4a", "#2e2a36", "#5a4a3a"][v % 4]; return { jacket: c, dress: c, pants: "#2a2530", boots: "#2a2a30", skin: SKINS[v % 4], hat: "tonsure", hair: ["#6a4a32", "#2a201a", "#9a9aa2"][v % 3] }; };
const BEARER = (v: number): Outfit => ({ jacket: "#7a5a3a", hem: "#7a5a3a", pants: "#4a3a2a", boots: "#2a2a30", skin: SKINS[(v + 1) % 4], hat: "tonsure", hair: "#4a3424", sash: "#c9a35a" });
const GUARD: Outfit = { jacket: "#4a5a7a", pants: "#4a4a52", boots: "#2a2a30", skin: SKINS[3], hat: "helm", cap: "#c9a14a", moustache: "#2a201a", belt: "#6a4a2a" };
const COATS = ["#8a7a5a", "#7a6a4a", "#9a8a6a", "#6a5a4a", "#8a6a4a", "#7a8a6a", "#6e7a8a", "#a08060"];
const HAIRS = ["#2a201a", "#5a3b2a", "#8a6a3a", "#9a9aa2"];
const VIL = (v: number): Outfit => {
  const o: Outfit = { jacket: COATS[v % 8], pants: "#5a4a3a", boots: "#3a2f2a", skin: SKINS[v % 4] };
  if (v % 3 === 2) return { ...o, jacket: "#d8cfb8", dress: COATS[(v + 2) % 8], hat: "bonnet" };
  return v % 2 ? { ...o, hat: "hair", hair: HAIRS[v % 4] } : { ...o, hat: "cap", cap: COATS[(v + 3) % 8] };
};
const W_MILO: Who = { i: 4, o: MILO_LAW, okey: "milo" };
const W_DEACON: Who = { i: 4, o: MILO_DEACON, okey: "milo_deacon" };
const W_JUDGE: Who = { i: 14, o: JUDGE, okey: "judge" };
const W_STEPHEN: Who = { i: 15, o: STEPHEN, okey: "stephen" };
const W_FORMOSUS: Who = { i: 16, o: FORMOSUS, okey: "formosus" };
const W_THEODORE: Who = { i: 17, o: THEODORE, okey: "theodore" };
const W_JOHN: Who = { i: 18, o: JOHN, okey: "john" };
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

// ---- crowds ----
type CP = [number, number, number?];
type Mood = "cheer" | "hush" | "smile" | "stern" | "gasp";
const mood = (kind: Mood, i: number, t: number): FrontOpts => {
  const wv = q(Math.sin(t * 7 + i * 1.3), 30);
  switch (kind) {
    case "cheer": return { expr: i % 2 ? "laugh" : "grin", wave: i % 3 ? wv : undefined };
    case "gasp": return { expr: i % 2 ? "shock" : "nervous", look: Math.round(Math.sin(t * 1.5 + i)) };
    case "hush": return { expr: i % 3 ? "nervous" : "neutral", look: Math.round(Math.sin(t + i)) };
    case "smile": return { expr: i % 2 ? "smile_closed" : "grin" };
    default: return { expr: "stern", look: Math.round(Math.sin(t * 0.7 + i)) };
  }
};
const folk = (cam: CamInfo, out: Stage, i: number, x: number, z: number, t: number, fo: FrontOpts, y = 0, scale = 1) =>
  act(cam, out, { i: 30 + i, o: VIL(i), okey: `v${i}` }, x, y, z, t, fo, scale);
const crowd = (cam: CamInfo, out: Stage, t: number, list: CP[], kind: Mood, i0 = 0, X = 0, y = 0, sit = false) =>
  list.forEach(([x, z, s], i) => folk(cam, out, i0 + i, X + x, z, t, { ...mood(kind, i0 + i, t), ...(sit ? { mode: "sit" as const } : {}) }, y, s ?? 1));

// ---- rats: [x, z] spots, a cloak colour each ----
const RAT_CLOAKS = ["#c8453a", "#3f63a8", "#e8b03a"];
const rats = (out: Stage, f: number, spots: [number, number, number][], pose: RatPose | ((k: number) => RatPose), size = 0.36, hop = 0) => {
  spots.forEach(([x, y, z], k) => {
    const ps = typeof pose === "function" ? pose(k) : pose, t = f / FPS;
    const jit = ps === "shiver" ? 0.012 * Math.sin(f * 2.7 + k * 2) : 0;
    const blink = Math.floor(f / 4 + k * 7) % 23 === 0;
    const up = hop ? hop * Math.abs(Math.sin((f / 7) + k * 1.2)) : 0;
    out.fx.push({ key: `rat${ps}${k}${blink}${q((t * 4 + k) % 1, 6)}`, cw: 300, ch: 300, draw: (p) => fxRat(p, ps, RAT_CLOAKS[k % 3], blink, q((t * 4 + k) % 1, 6)),
      x: x + jit, y: y + size * 0.48 + up, z, w: size, h: size });
    blob(out, x, y, z, size * 0.9);
  });
};

// ================= the office (1, 7, 17, 18, 19) =================
const office = (out: Stage, f: number, open2: boolean) => {
  const X = OF, t = f / FPS;
  glow(out, X - 1.8, 1.95, -2.5, 2.6, "#ffe39a", 0.5);
  card(out, `flame${q((t * 3) % 1, 8)}`, 120, 200, (p) => fxFlame(p, q((t * 3) % 1, 8) * 6.28), X - 0.72, 1.07, -0.55, 0.07, 0.12);
  glow(out, X - 0.72, 1.08, -0.5, 0.75, "#ffc860", 0.85 + 0.1 * Math.sin(t * 11));
  card(out, "folder_rat", 400, 300, (p) => fxFolder(p, "rat"), X - 0.3, 0.785, -0.52, 0.42, 0.32, { flat: true, rot: 0.08 });
  if (!open2) card(out, "folder_pope", 400, 300, (p) => fxFolder(p, "pope"), X + 0.32, 0.785, -0.5, 0.42, 0.32, { flat: true, rot: -0.06 });
};
const SEAT: [number, number, number] = [OF, 0.38, -1.35];
const opening = (cam: CamInfo, out: Stage, t: number, f: number) => {
  office(out, f, false);
  const look = f >= Q.second - 2 ? 1 : f >= Q.first - 2 ? -1 : Math.round(Math.sin(f * 0.08));
  act(cam, out, W_MILO, ...SEAT, t, { mode: "sit", expr: f >= Q.second ? "shock" : "nervous", look, headTilt: f >= Q.first && f < Q.second ? -4 : 3 * Math.sin(f * 0.15) }, 1, false);
};
const secondFolder = (cam: CamInfo, out: Stage, t: number, f: number) => {
  const opened = f >= Q.L7 + 34;
  office(out, f, opened);
  act(cam, out, W_MILO, ...SEAT, t, { mode: "sit", expr: f < Q.L7 + 20 ? "smile_closed" : f < Q.dead7 - 2 ? "nervous" : "shock", look: f < Q.L7 + 20 ? 0 : 1 }, 1, false);
  if (opened) { const s = pop(f, Q.L7 + 34, 7); card(out, "portrait", 420, 440, fxPortrait, OF + 0.42, 0.8 + 0.24 * s, -0.42, 0.4 * s, 0.42 * s); }
};
const wonInHistory = (cam: CamInfo, out: Stage, t: number, f: number) => {
  office(out, f, true);
  act(cam, out, W_MILO, ...SEAT, t, { mode: "sit", expr: f < Q.won - 2 ? "relief" : "grin", wave: f >= Q.history - 4 && f < Q.L18 ? 0.6 : undefined, headTilt: f >= Q.history - 4 ? -5 : 0 }, 1, false);
  const [rx, rz] = at(cam, OF, -0.42, -0.22);
  if (f >= Q.L17 + 20) rats(out, f, [[rx - 0.12, 0.78, rz], [rx + 0.02, 0.78, rz + 0.04], [rx + 0.16, 0.78, rz]], f >= Q.won - 2 ? "cheer" : "stand", 0.2, f >= Q.won - 2 ? 0.03 : 0);
};
const nextCase = (cam: CamInfo, out: Stage, t: number, f: number) => {
  office(out, f, true);
  act(cam, out, W_MILO, ...SEAT, t, { mode: "sit", expr: f < Q.rooster ? "grin" : f < Q.would - 2 ? "shock" : "nervous", look: f >= Q.would ? 0 : 1 }, 1, false);
  const s = pop(f, Q.L18 + 2, 8), ang = Math.PI * smooth((f - (Q.rooster - 10)) / 12);
  const side = ang < Math.PI / 2 ? 0 : 1, w = Math.max(0.02, Math.abs(Math.cos(ang)));
  if (s > 0) card(out, `next${side}`, 520, 640, (p) => fxNextCase(p, side as 0 | 1), OF + 0.52, 1.18, -0.4, 0.42 * s * w, 0.52 * s);
};

// ================= the church court in France (2-6) =================
const courtBase = (cam: CamInfo, out: Stage, t: number, f: number, judge: FrontOpts, specs: Mood, judgeDy = 0) => {
  const X = FR;
  glow(out, X - 1.45, 3.6, -4.0, 4.0, "#fff2c0", 0.4); glow(out, X + 1.45, 3.6, -4.0, 4.0, "#fff2c0", 0.4);
  act(cam, out, W_JUDGE, X, 1.0 - judgeDy, -3.35, t, judge, 1, false);
  card(out, "summons", 300, 380, fxSummons, DOOR.x1 - 0.07, 1.45, -3.6, 0.36, 0.46, { yaw: -Math.PI / 2 });
  crowd(cam, out, t, [[-3.9, -0.6], [-3.9, 0.1], [-3.9, 1.9], [3.9, -0.4], [3.9, 1.7], [3.9, 2.4]], specs, 0, X, 0.3, true);
};
const doorRats = (out: Stage, f: number, pose: RatPose, z = -4.45) =>
  rats(out, f, [[DOOR.x0 + 0.16, 0, z], [DOOR.x0 + 0.42, 0, z - 0.12], [DOOR.x0 + 0.68, 0, z]], pose, 0.36);
const summonsShot = (cam: CamInfo, out: Stage, t: number, f: number) => {
  courtBase(cam, out, t, f, { expr: "stern", look: f >= Q.showed ? 1 : 0 }, "hush");
  act(cam, out, W_MILO, FR - 1.5, 0, -0.85, t, { expr: f >= Q.showed ? "nervous" : "neutral", prop: "scroll", look: f >= Q.summoned ? 1 : 0 });
  if (f >= Q.showed + 4) doorRats(out, f, "peek", -4.5);
};
const argument = (cam: CamInfo, out: Stage, t: number, f: number) => {
  const pointing = f >= Q.scared + 18;
  courtBase(cam, out, t, f, { expr: "stern" }, "hush");
  act(cam, out, W_MILO, FR - 1.5, 0, -0.85, t, { expr: f < Q.argument ? "grin" : pointing ? "nervous" : "grin", prop: pointing ? null : "scroll", wave: pointing ? 0.2 : undefined, look: pointing ? 1 : 0 });
  doorRats(out, f, "shiver", -4.0);
  if (f >= Q.scared - 2) { const s = pop(f, Q.scared - 2), [bx, bz] = at(cam, DOOR.x0 + 0.42, -3.9, 0.05); card(out, "bubble_scared", 560, 300, (p) => fxBubble(p, "SCARED!", -1, 92), bx, 1.0 + 0.04 * s, bz, 0.58 * s, 0.31 * s); }
};
const thinking = (cam: CamInfo, out: Stage, t: number, f: number) => {
  courtBase(cam, out, t, f, { expr: f % 40 < 20 ? "neutral" : "whistle", headTilt: -7 + 3 * Math.sin(f * 0.12), look: 1 }, "hush");
  const s = pop(f, Q.L4 + 6, 8), [bx, bz] = at(cam, FR, -3.2, 0.45);
  card(out, `think${q((f / 36) % 1, 3)}`, 400, 340, (p) => fxThink(p, q((f / 36) % 1, 3)), bx, 2.75 + 0.05 * Math.sin(f * 0.1), bz, 0.6 * s, 0.51 * s);
};
const extraTime = (cam: CamInfo, out: Stage, t: number, f: number) => {
  const nod = f < Q.round ? 0.03 * Math.max(0, Math.sin((f - Q.L5) * 0.45)) : 0;
  courtBase(cam, out, t, f, { expr: "smile_closed" }, f >= Q.round ? "cheer" : "smile", nod);
  if (f < Q.round) {
    // the judge nods; a calendar beside him flips page after page
    const k = (f - Q.extra + 4) / 6, day = 1 + Math.max(0, Math.min(5, Math.floor(k))), flip = k > 0 && k < 6 ? k % 1 : 0;
    const s = pop(f, Q.L5 + 4, 6), [cx, cz] = at(cam, FR, -2.9, 0.62);
    card(out, `cal${day}${q(flip, 6)}`, 300, 340, (p) => fxCalendar(p, day, q(flip, 6)), cx, 2.05, cz, 0.42 * s, 0.48 * s);
    return;
  }
  const hop = 0.28 * Math.abs(Math.sin((f - Q.round) * 0.28));
  act(cam, out, W_MILO, FR - 1.2, hop, -0.2, t, { expr: f < Q.round + 8 ? "relief" : "grin", wave: q(Math.sin(f * 0.6), 30) });
  rats(out, f, [[FR - 1.75, 0, 0.1], [FR - 0.65, 0, 0.15], [FR - 1.2, 0, 0.35]], "cheer", 0.36, 0.08);
};
const realOne = (cam: CamInfo, out: Stage, t: number, f: number) => {
  courtBase(cam, out, t, f, { expr: "smile_closed" }, "cheer");
  act(cam, out, W_MILO, FR - 1.2, 0.2 * Math.abs(Math.sin(f * 0.28)), -0.2, t, { expr: "grin", wave: q(Math.sin(f * 0.6), 30) });
  rats(out, f, [[FR - 1.75, 0, 0.35], [FR - 0.65, 0, 0.4], [FR - 1.25, 0, 0.75]], "cheer", 0.36, 0.08);
};

// ================= the synod hall in Rome (8-12) =================
const CLERGY: CP[] = [[-2.95, -1.2], [-2.95, 0.2], [-2.95, 1.6], [2.95, -0.9], [2.95, 0.5], [2.95, 1.9]];
const hall = (cam: CamInfo, out: Stage, t: number, f: number, formosus: boolean) => {
  const X = RO;
  for (const [x, y, z] of [[-1.45, 2.3, -3.75], [1.45, 2.3, -3.75], [-2.3, 1.95, -2.85], [2.3, 1.95, -2.85]]) glow(out, X + x, y, z, 0.8, "#ffc860", 0.7 + 0.08 * Math.sin(t * 9 + x));
  glow(out, X, 2.4, -4.9, 2.2, "#ffb860", 0.25);
  CLERGY.forEach(([x, z], i) => act(cam, out, { i: 60 + i, o: CLERIC(i), okey: `cleric${i}` }, X + x, 0.3, z, t, { mode: "sit", expr: i % 2 ? "stern" : "nervous", look: Math.round(Math.sin(t * 0.6 + i)) }, 1, false));
  if (formosus) act(cam, out, W_FORMOSUS, THRONE.x, THRONE.y + 0.3, THRONE.z + 0.05, t, { mode: "sit", expr: "neutral", blink: 1, tilt: 2 }, 1, false);
};
const stephen = (cam: CamInfo, out: Stage, t: number, fo: FrontOpts) => act(cam, out, W_STEPHEN, RO - 1.45, 0.35, -3.0, t, { expr: "stern", ...fo });
const emptyThrone = (cam: CamInfo, out: Stage, t: number, f: number) => hall(cam, out, t, f, false);
const dugUp = (cam: CamInfo, out: Stage, t: number, f: number) => {
  const seated = f >= Q.trial9 - 6;
  hall(cam, out, t, f, seated);
  stephen(cam, out, t, { wave: f < Q.sat ? q(0.4 + 0.3 * Math.sin(f * 0.3), 30) : 0.6, look: 1 });
  if (!seated && f >= Q.dug + 10) {
    // two bearers carry the wrapped figure across the upper step toward the throne
    const u = smooth((f - (Q.dug + 10)) / (Q.trial9 - 6 - (Q.dug + 10))), x = RO + 2.6 - 2.4 * u, phase = ((f - Q.dug) / 16) % 1;
    for (const [k, dx] of [[0, -0.8], [1, 0.8]] as const) act(cam, out, { i: 70 + k, o: BEARER(k), okey: `bearer${k}` }, x + dx, 0.35, -3.25, t, { mode: "stroll", phase: (phase + k * 0.5) % 1, expr: k ? "nervous" : "stern", wave: 0.0 });
    card(out, "shroud", 720, 220, fxShroud, x, 1.62, -3.2, 1.55, 0.47);
  }
  if (seated && f < Q.trial9 + 10) { const u = (f - (Q.trial9 - 6)) / 16; card(out, `puff${q(u, 30)}`, 300, 300, (p) => fxPuff(p, q(u, 30)), RO, 1.0, -4.2, 1.1, 1.1); }
};
const deacon = (cam: CamInfo, out: Stage, t: number, f: number) => {
  hall(cam, out, t, f, true);
  const close = f >= Q.defend - 4;
  if (!close) {
    // Milo is pushed in from the left by a guard, up to the lectern
    const u = smooth((f - Q.L10) / 30), x = RO - 0.2 + 1.5 * u, phase = ((f - Q.L10) / 14) % 1;
    act(cam, out, W_DEACON, x, 0, -1.15, t, { mode: u < 1 ? "stroll" : "stand", phase: u < 1 ? phase : 0, expr: "shock", tilt: u < 1 ? -6 : 0, look: 1 });
    act(cam, out, W_GUARD, x - 0.75, 0, -1.35, t, { mode: u < 1 ? "stroll" : "stand", phase: u < 1 ? (phase + 0.5) % 1 : 0, expr: "stern", wave: u < 1 ? 0.0 : undefined });
    stephen(cam, out, t, { look: 1 });
    return;
  }
  act(cam, out, W_DEACON, RO + 1.3, 0, -1.15, t, { expr: f < Q.defend + 8 ? "shock" : "nervous", look: -1 });
  if (f >= Q.defend + 8) { const s = pop(f, Q.defend + 8), [bx, bz] = at(cam, RO + 1.3, -1.15, 0.05); card(out, "bubble_honor", 560, 300, (p) => fxBubble(p, "Um... your honor?", 1, 48), bx, 1.97, bz + 0.1, 0.52 * s, 0.28 * s); }
};
const guilty = (cam: CamInfo, out: Stage, t: number, f: number) => {
  hall(cam, out, t, f, true);
  const k = f < Q.guilty - 4 ? 0 : f < Q.guilty ? (f - (Q.guilty - 4)) / 4 : f < Q.guilty + 14 ? 1 : Math.max(0, 1 - (f - Q.guilty - 14) / 6);
  stephen(cam, out, t, { prop: ["hammer", k] as ["hammer", number], expr: f >= Q.guilty ? "grin" : "stern" });
};
const butWait = (cam: CamInfo, out: Stage, t: number, f: number) => {
  hall(cam, out, t, f, true);
  const up = f >= Q.wait - 4;
  act(cam, out, W_DEACON, RO + 1.3, 0, -1.15, t, { expr: up ? "shock" : "pained", headTilt: up ? 0 : 12, blink: up ? 0 : lidAt(t, 4), look: 0 });
};

// ================= the square in Rome (13-16) =================
/** portcullis height above its closed rest: up until the word "prison", then it drops */
export const gateLift = (id: number, f: number) => (id < 13 || (id === 13 && f < Q.prison - 12) ? 2.7 : id > 13 ? 0 : 2.7 * (1 - clamp01((f - (Q.prison - 12)) / 14) ** 2));
const SQUARE: CP[] = [[-3.3, -3.6], [-2.4, -3.2], [-1.5, -3.8], [-0.6, -3.3], [0.3, -3.7], [-2.9, -2.2], [-1.9, -1.8], [-1.0, -2.3], [0.0, -2.0], [-3.6, -1.0], [-2.5, -0.6], [-1.4, -0.9], [0.6, -1.0]];
const square = (cam: CamInfo, out: Stage, t: number, f: number, kind: Mood) => {
  crowd(cam, out, t, SQUARE, kind, 10, PZ);
  [[-2.4, -3.2, "#c8453a", "#e8c45a"], [-0.6, -3.3, "#3f63a8", "#f4f1e8"], [-1.9, -1.8, "#4f9a4a", "#e8c45a"], [0.6, -1.0, "#e8c45a", "#c8453a"]].forEach(([x, z, a, b], i) => {
    const w = q(Math.sin(t * 6 + i), 6);
    card(out, `banner${i}${w}`, 260, 420, (p) => fxBanner(p, a as string, b as string, w), PZ + (x as number) + 0.2, 2.35 + 0.04 * Math.sin(t * 5 + i), z as number, 0.5, 0.81, { rot: 0.05 * Math.sin(t * 4 + i) });
  });
};
const uprising = (cam: CamInfo, out: Stage, t: number, f: number) => {
  if (f < Q.prison - 10) square(cam, out, t, f, "cheer"); // the close-up on the gate shows the gate only
  const slam = Q.prison + 2;
  if (f >= slam && f < slam + 16) { const u = (f - slam) / 16; card(out, `puff${q(u, 30)}`, 300, 300, (p) => fxPuff(p, q(u, 30)), PZ - 1.6, 0.35, -6.6, 1.8, 1.8); }
};
const podiumCrowd = (cam: CamInfo, out: Stage, t: number) => crowd(cam, out, t, [[0.9, -2.5], [1.8, -2.7], [3.1, -2.6], [4.0, -2.4]], "cheer", 40, PZ);
const cancel = (cam: CamInfo, out: Stage, t: number, f: number) => {
  podiumCrowd(cam, out, t);
  act(cam, out, W_THEODORE, PZ + 2.6, 1.2, -3.85, t, { expr: f < Q.canceled ? "smile_closed" : "grin", wave: f >= Q.canceled + 12 ? 0.4 : undefined });
  const tear = clamp01((f - (Q.canceled - 4)) / 12);
  if (tear < 1 || f < Q.canceled + 24) { const [vx, vz] = at(cam, PZ + 2.6, -3.4, 0.0); card(out, `verdict${q(tear, 24)}`, 520, 420, (p) => fxVerdict(p, q(tear, 24)), vx, 2.0 + 0.4 * tear * tear, vz, 0.62, 0.5); }
  if (f >= Q.canceled + 6) { const u = q(((f - Q.canceled) / 40) % 1, 12); card(out, `conf${u}`, 600, 600, (p) => fxConfetti(p, u), PZ + 2.6, 2.6, -3.0, 1.8, 1.8); }
};
const NOTICE: [number, number, number] = [PZ + 2.15, 2.05, -3.25];
const noCorpses = (cam: CamInfo, out: Stage, t: number, f: number) => {
  podiumCrowd(cam, out, t);
  const k = f < Q.banned - 2 ? 0.0 : f < Q.banned + 2 ? (f - (Q.banned - 2)) / 4 : f < Q.banned + 14 ? 1 : Math.max(0, 1 - (f - Q.banned - 14) / 6);
  act(cam, out, W_JOHN, PZ + 2.95, 1.2, -3.85, t, { expr: f < Q.banned ? "stern" : "smile_closed", prop: ["hammer", k] as ["hammer", number] });
  const seal = clamp01((f - (Q.banned + 2)) / 6);
  card(out, `notice${q(seal, 12)}`, 560, 460, (p) => fxNotice(p, q(seal, 12)), ...NOTICE, 0.9, 0.74, { yaw: 0 });
};
const realTwo = (cam: CamInfo, out: Stage, t: number, f: number) => {
  podiumCrowd(cam, out, t);
  act(cam, out, W_JOHN, PZ + 2.95, 1.2, -3.85, t, { expr: "smile_closed" });
  card(out, "notice1", 560, 460, (p) => fxNotice(p, 1), ...NOTICE, 0.9, 0.74, { yaw: 0 });
};

// ================= thumbnail (shot 20, Thumb.tsx) =================
const thumbnail = (cam: CamInfo, out: Stage, t: number, f: number) => {
  hall(cam, out, t, f, true);
  act(cam, out, W_MILO, RO - 0.4, 0, -1.4, t, { expr: "shock", blink: 0, look: 1, headTilt: -6 });
  // the other clients cheer at the pope's feet, on the upper step
  rats(out, f, [[RO + 0.36, 0.7, -3.85], [RO + 0.6, 0.7, -3.74], [RO + 0.84, 0.7, -3.85]], "cheer", 0.42);
};

/** everything with a face in shot `id` at frame f */
export const stage = (id: number, f: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] };
  const s = SHOTS[id - 1], t = f / FPS;
  LNAME = s.light;
  findSun(cam, SUN);
  switch (id) {
    case 1: opening(cam, out, t, f); break;
    case 2: summonsShot(cam, out, t, f); break;
    case 3: argument(cam, out, t, f); break;
    case 4: thinking(cam, out, t, f); break;
    case 5: extraTime(cam, out, t, f); break;
    case 6: realOne(cam, out, t, f); break;
    case 7: secondFolder(cam, out, t, f); break;
    case 8: emptyThrone(cam, out, t, f); break;
    case 9: dugUp(cam, out, t, f); break;
    case 10: deacon(cam, out, t, f); break;
    case 11: guilty(cam, out, t, f); break;
    case 12: butWait(cam, out, t, f); break;
    case 13: uprising(cam, out, t, f); break;
    case 14: cancel(cam, out, t, f); break;
    case 15: noCorpses(cam, out, t, f); break;
    case 16: realTwo(cam, out, t, f); break;
    case 17: wonInHistory(cam, out, t, f); break;
    case 18: nextCase(cam, out, t, f); break;
    case 19: opening(cam, out, t, 0); break;
    case 20: thumbnail(cam, out, t, f); break;
  }
  return out;
};
export { FPS };
