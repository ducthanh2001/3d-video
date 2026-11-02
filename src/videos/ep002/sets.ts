// Static 3D dressing for ep002, four places side by side on the x axis (story.ts): Milo's little office (OF), the church
// court in France (FR), the dark synod hall in Rome (RO) and a square in Rome with a prison gate and a papal stand (PZ).
// Ground is y = 0 everywhere; rooms have no front wall (the lens stands where it would be). Boxes + painted textures only,
// so nothing is downloaded. The prison portcullis is its own group: world.ts lowers it in shot 13.
import * as THREE from "three";
import { Batch, boxGeo, V, lam } from "../ep001/build";
import { ctex, cobbleHD, planksHD, stoneHD } from "../ep001/paint";
import { OF, FR, RO, PZ } from "./story";

const mat = (k: string, c: string) => lam(`e2_${k}`, () => ({ color: c }));
const glowMat = (k: string, c: string, e: string, i = 0.9) => lam(`e2_${k}`, () => ({ color: c, emissive: new THREE.Color(e), emissiveIntensity: i }));
const box = (b: Batch, m: THREE.Material, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, tile = 0) =>
  b.add(boxGeo(V(x0, y0, z0), V(x1, y1, z1), tile), m);
const cyl = (b: Batch, m: THREE.Material, x: number, y: number, z: number, r: number, h: number, seg = 16) =>
  b.add(new THREE.CylinderGeometry(r, r, h, seg), m, new THREE.Matrix4().makeTranslation(x, y + h / 2, z));
const ball = (b: Batch, m: THREE.Material, x: number, y: number, z: number, r: number) =>
  b.add(new THREE.SphereGeometry(r, 16, 10), m, new THREE.Matrix4().makeTranslation(x, y, z));

/** a room shell: floor, back wall at z0, two side walls, beams; no front wall */
const room = (b: Batch, X: number, hw: number, z0: number, z1: number, h: number, floor: THREE.Material, wall: THREE.Material, beam: THREE.Material | null, back = true) => {
  box(b, floor, X - hw - 1, -0.3, z0 - 0.4, X + hw + 1, 0, z1, 3);
  if (back) box(b, wall, X - hw - 0.3, 0, z0 - 0.4, X + hw + 0.3, h, z0, 2.4);
  box(b, wall, X - hw - 0.3, 0, z0 - 0.4, X - hw, h, z1, 2.4);
  box(b, wall, X + hw, 0, z0 - 0.4, X + hw + 0.3, h, z1, 2.4);
  if (beam) for (let z = z0 + 0.6; z < z1; z += 2.4) box(b, beam, X - hw, h - 0.4, z - 0.15, X + hw, h - 0.1, z + 0.15);
};

// ---------------- Milo's office ----------------
export const buildOffice = (root: THREE.Object3D) => {
  const b = new Batch(), X = OF;
  const floor = lam("e2_ofloor", () => ({ map: planksHD() }));
  const wall = lam("e2_owall", () => ({ map: stoneHD("e2_owall", ["#e2cfae", "#d8c4a2", "#e8d6b8", "#cfba96"], "#9a8466") }));
  const dark = mat("odark", "#4a3020"), wood = mat("owood", "#8a5a34"), top = mat("otop", "#a06a3e");
  room(b, X, 3, -2.6, 4, 3.4, floor, wall, dark);
  // window on the left of the back wall: warm late light
  box(b, glowMat("owin", "#fff0c0", "#ffe39a"), X - 2.3, 1.3, -2.62, X - 1.3, 2.6, -2.6);
  for (const [x0, y0, x1, y1] of [[-2.4, 1.2, -2.3, 2.7], [-1.3, 1.2, -1.2, 2.7], [-2.4, 2.6, -1.2, 2.7], [-2.4, 1.2, -1.2, 1.3], [-1.85, 1.3, -1.75, 2.6], [-2.3, 1.9, -1.3, 1.98]])
    box(b, dark, X + x0, y0, -2.62, X + x1, y1, -2.56);
  // bookshelf on the right with rows of books
  box(b, dark, X + 0.95, 0, -2.6, X + 2.35, 2.35, -2.2);
  const bookCols = ["#8a3b2a", "#3f5a7a", "#5d7a3a", "#c9a14a", "#6a3a5a", "#2f5f6a", "#a8724a"];
  for (const [k, y] of [0.12, 0.62, 1.12, 1.62].entries()) {
    box(b, wood, X + 1.0, y - 0.04, -2.55, X + 2.3, y, -2.15);
    let x = X + 1.04;
    for (let i = 0; x < X + 2.2; i++) {
      const w = 0.06 + 0.05 * ((i * 7 + k * 3) % 4) / 3, h = 0.3 + 0.1 * ((i * 5 + k) % 3) / 2;
      box(b, mat(`book${(i + k) % 7}`, bookCols[(i + k) % 7]), x, y, -2.5, x + w, y + h, -2.24);
      x += w + 0.012;
    }
  }
  // a framed parchment on the wall behind the desk
  box(b, dark, X - 0.55, 2.0, -2.6, X + 0.55, 2.75, -2.55); box(b, mat("oparch", "#f1e4c0"), X - 0.47, 2.07, -2.56, X + 0.47, 2.68, -2.54);
  // desk: top, front panel, legs; papers, ink pot, candle holder
  box(b, top, X - 1.08, 0.7, -1.0, X + 1.08, 0.78, -0.15);
  box(b, wood, X - 1.02, 0.08, -0.22, X + 1.02, 0.7, -0.16);
  for (const s of [-1, 1]) box(b, dark, X + s * 1.02 - 0.06, 0, -0.98, X + s * 1.02 + 0.06, 0.7, -0.2);
  box(b, mat("ostack", "#f4ead0"), X + 0.55, 0.78, -0.82, X + 0.9, 0.86, -0.56);
  cyl(b, mat("oink", "#22202a"), X + 0.8, 0.78, -0.32, 0.04, 0.07, 12);
  cyl(b, mat("obrass", "#c9a14a"), X - 0.72, 0.78, -0.55, 0.08, 0.02, 16);
  cyl(b, glowMat("owax", "#fff6e0", "#ffe9b8", 0.25), X - 0.72, 0.8, -0.55, 0.035, 0.2, 12);
  // chair back behind Milo
  box(b, dark, X - 0.34, 0.45, -1.82, X + 0.34, 1.5, -1.74); box(b, dark, X - 0.4, 1.5, -1.84, X + 0.4, 1.58, -1.72);
  // a red rug
  box(b, mat("orug", "#8a2f2f"), X - 1.6, 0.0, -0.1, X + 1.6, 0.012, 1.6);
  b.build(root, true);
};

// ---------------- the church court in France (day) ----------------
export const DOOR = { x0: FR + 2.6, x1: FR + 3.6, z: -4.2 };
export const buildChurchCourt = (root: THREE.Object3D) => {
  const b = new Batch(), X = FR;
  const floor = lam("e2_ffloor", () => ({ map: stoneHD("e2_ffloor", ["#d8cfc0", "#cec4b2", "#e0d8ca", "#c6bba8"], "#a49886") }));
  const wall = lam("e2_fwall", () => ({ map: stoneHD("e2_fwall", ["#efe6d2", "#e6dbc4", "#f3ecdd", "#e2d5bc"], "#bfae90") }));
  const dark = mat("fdark", "#5a3a22"), mid = mat("fmid", "#8a5a34"), red = mat("fred", "#8a2f3a"), gold = mat("fgold", "#d9b84a");
  const planks = lam("e2_fplank", () => ({ map: planksHD() }));
  room(b, X, 4.6, -4.2, 8, 6, floor, wall, dark, false);
  // back wall with a doorway on the right
  box(b, wall, X - 4.9, 0, -4.6, DOOR.x0, 6, -4.2, 2.4);
  box(b, wall, DOOR.x1, 0, -4.6, X + 4.9, 6, -4.2, 2.4);
  box(b, wall, DOOR.x0, 2.3, -4.6, DOOR.x1, 6, -4.2, 2.4);
  const recess = mat("frecess", "#4a3a30");
  box(b, recess, DOOR.x0 - 0.1, 0, -5.5, DOOR.x1 + 0.1, 2.4, -5.4); box(b, recess, DOOR.x0 - 0.1, 0, -5.5, DOOR.x0, 2.4, -4.6); box(b, recess, DOOR.x1, 0, -5.5, DOOR.x1 + 0.1, 2.4, -4.6);
  box(b, recess, DOOR.x0, 2.3, -5.5, DOOR.x1, 2.4, -4.6); box(b, mat("frecfloor", "#5a4838"), DOOR.x0, 0, -5.5, DOOR.x1, 0.01, -4.2);
  box(b, dark, DOOR.x0 - 0.12, 0, -4.2, DOOR.x0, 2.42, -4.1); box(b, dark, DOOR.x1, 0, -4.2, DOOR.x1 + 0.12, 2.42, -4.1); box(b, dark, DOOR.x0 - 0.12, 2.3, -4.2, DOOR.x1 + 0.12, 2.42, -4.1);
  box(b, planks, DOOR.x1 - 0.06, 0.02, -4.1, DOOR.x1 + 0.04, 2.25, -3.15, 0.8); // the door, open into the room
  // tall bright windows and a round window over the judge
  const glass = glowMat("fglass", "#fff6d8", "#fff0b8");
  for (const wx of [-3.3, -1.45, 1.45]) {
    box(b, glass, X + wx - 0.45, 2.2, -4.22, X + wx + 0.45, 4.9, -4.2);
    box(b, dark, X + wx - 0.03, 2.2, -4.24, X + wx + 0.03, 4.9, -4.18); box(b, dark, X + wx - 0.45, 3.5, -4.24, X + wx + 0.45, 3.56, -4.18);
  }
  b.add(new THREE.CircleGeometry(0.55, 24), glass, new THREE.Matrix4().makeTranslation(X, 4.75, -4.19));
  // the judge's bench: platform, desk, red cloth, a plain gold cross above
  box(b, mid, X - 1.7, 0, -4.15, X + 1.7, 1.0, -2.7, 1.5);
  box(b, dark, X - 1.4, 1.0, -2.85, X + 1.4, 1.62, -2.65);
  box(b, red, X - 1.3, 1.06, -2.64, X + 1.3, 1.56, -2.62);
  box(b, gold, X - 0.08, 3.0, -4.2, X + 0.08, 3.9, -4.17); box(b, gold, X - 0.32, 3.55, -4.2, X + 0.32, 3.7, -4.17);
  // the empty dock for the accused, with its rail
  box(b, mid, X + 1.0, 0, -1.25, X + 2.15, 0.45, -0.8);
  box(b, dark, X + 1.0, 0.45, -1.28, X + 2.15, 0.52, -1.18);
  for (const x of [1.05, 1.6, 2.1]) box(b, dark, X + x - 0.03, 0.45, -1.26, X + x + 0.03, 0.95, -1.2);
  box(b, dark, X + 1.0, 0.95, -1.28, X + 2.15, 1.02, -1.18);
  // the lawyer's table with papers
  box(b, mid, X - 2.3, 0.72, -0.55, X - 0.7, 0.8, -0.05);
  for (const x of [-2.25, -0.75]) for (const z of [-0.5, -0.1]) box(b, dark, X + x - 0.04, 0, z - 0.04, X + x + 0.04, 0.72, z + 0.04);
  box(b, mat("fpaper", "#f4ead0"), X - 1.2, 0.8, -0.45, X - 0.85, 0.85, -0.2);
  // benches along the side walls for onlookers
  for (const s of [-1, 1]) for (const z of [-1.0, 1.4]) box(b, mid, X + s * 3.9 - 0.4, 0, z, X + s * 3.9 + 0.4, 0.45, z + 1.4);
  b.build(root, true);
};

// ---------------- the synod hall in Rome (dark) ----------------
export const THRONE = { x: RO, y: 0.7, z: -4.6 };
export const buildSynod = (root: THREE.Object3D) => {
  const b = new Batch(), X = RO;
  const floor = lam("e2_rfloor", () => ({ map: stoneHD("e2_rfloor", ["#6a5a5a", "#5e4f52", "#74625e", "#584a4e"], "#3e3236") }));
  const wall = lam("e2_rwall", () => ({ map: stoneHD("e2_rwall", ["#8a7a6e", "#7e6f66", "#94847a", "#76675e"], "#4e4440") }));
  const stone = lam("e2_rcol", () => ({ map: stoneHD("e2_rcol", ["#b8a894", "#ad9d8a", "#c2b29e", "#a69682"], "#7e705e") }));
  const step = lam("e2_rstep", () => ({ map: stoneHD("e2_rstep", ["#9a8a7e", "#8e7f74", "#a69588", "#887a6e"], "#5e5048") }));
  const red = mat("rred", "#7a2230"), purple = mat("rpurple", "#4a2a5e"), gold = mat("rgold", "#c9a14a"), dark = mat("rdark", "#3a2620");
  room(b, X, 5, -6.5, 9, 7, floor, wall, dark);
  // the dais: two broad steps
  box(b, step, X - 2.6, 0, -6.5, X + 2.6, 0.35, -2.6, 1.5);
  box(b, step, X - 1.8, 0.35, -6.5, X + 1.8, 0.7, -3.5, 1.5);
  // the throne: red seat, tall gold back with a red panel, gold arms and a crest
  const T = THRONE;
  box(b, red, X - 0.55, T.y, -5.0, X + 0.55, T.y + 0.45, -4.3);
  box(b, gold, X - 0.62, T.y, -5.18, X + 0.62, T.y + 2.45, -5.0);
  box(b, red, X - 0.46, T.y + 0.55, -5.0, X + 0.46, T.y + 2.25, -4.98);
  for (const s of [-1, 1]) { box(b, gold, X + s * 0.55 - 0.07, T.y + 0.45, -5.0, X + s * 0.55 + 0.07, T.y + 0.78, -4.3); ball(b, gold, X + s * 0.55, T.y + 0.8, -4.32, 0.08); }
  b.add(new THREE.ConeGeometry(0.22, 0.4, 4), gold, new THREE.Matrix4().makeTranslation(X, T.y + 2.65, -5.09));
  // drapes and a long red banner behind the throne
  for (const s of [-1, 1]) box(b, purple, X + s * 1.8 - 0.6, 0.7, -6.48, X + s * 1.8 + 0.6, 6.4, -6.4);
  box(b, red, X - 0.5, 3.4, -6.48, X + 0.5, 6.2, -6.42);
  // columns down both sides
  for (const s of [-1, 1]) for (const z of [-5.2, -2.2, 0.8, 3.8]) {
    cyl(b, stone, X + s * 3.7, 0, z, 0.34, 7, 18);
    box(b, stone, X + s * 3.7 - 0.45, 0, z - 0.45, X + s * 3.7 + 0.45, 0.3, z + 0.45);
    box(b, stone, X + s * 3.7 - 0.45, 6.5, z - 0.45, X + s * 3.7 + 0.45, 6.8, z + 0.45);
  }
  // candle stands on the upper step and in the hall
  const flame = glowMat("rflame", "#ffd98a", "#ffc860", 1.4);
  for (const [x, y, z] of [[-1.45, 0.7, -3.75], [1.45, 0.7, -3.75], [-2.3, 0.35, -2.85], [2.3, 0.35, -2.85]]) {
    cyl(b, dark, X + x, y, z, 0.03, 1.5, 8); cyl(b, gold, X + x, y + 1.5, z, 0.09, 0.04, 12);
    for (const dx of [-0.07, 0, 0.07]) box(b, flame, X + x + dx - 0.015, y + 1.54, z - 0.015, X + x + dx + 0.015, y + 1.66, z + 0.015);
  }
  // narrow high windows: thin cold light
  const slit = glowMat("rslit", "#c8d8f0", "#a8c0e8", 0.7);
  for (const s of [-1, 1]) box(b, slit, X + s * 3.6 - 0.2, 4.0, -6.52, X + s * 3.6 + 0.2, 5.8, -6.5);
  // benches for the clergy and the defence lectern
  for (const s of [-1, 1]) box(b, dark, X + s * 2.95 - 0.35, 0, -1.6, X + s * 2.95 + 0.35, 0.45, 3.0);
  box(b, dark, X + 1.12, 0, -0.95, X + 1.52, 0.95, -0.75);
  b.add(boxGeo(V(-0.32, -0.03, -0.2), V(0.32, 0.03, 0.2)), mat("rlect", "#5a3a22"), new THREE.Matrix4().compose(V(X + 1.32, 1.0, -0.85), new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.35, 0, 0)), V(1, 1, 1)));
  b.build(root, true);
};

// ---------------- a square in Rome (day): prison gatehouse, papal stand ----------------
/** Roman facade, 512 x 512: ochre / terracotta plaster, two rows of arched windows with green shutters, a cornice */
const romeFacade = (kind: number) => ctex(`e2_rome${kind}`, 512, 512, (g) => {
  const wall = ["#e0a65c", "#d98a5a", "#e8c07a", "#c9785a"][kind % 4];
  g.fillStyle = wall; g.fillRect(0, 0, 512, 512);
  g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(0, 0, 512, 40);
  g.fillStyle = "#f1e2c2"; g.fillRect(0, 40, 512, 16); g.fillRect(0, 270, 512, 12);
  for (const row of [0, 1]) for (const x of [70, 230, 390]) {
    const y = row ? 320 : 110, w = 56, h = row ? 120 : 110;
    g.fillStyle = "#3a5a4a"; g.fillRect(x - 18, y, w + 36, h);
    g.fillStyle = "#2a2a36"; g.beginPath(); g.moveTo(x, y + h); g.lineTo(x, y + 28); g.arc(x + w / 2, y + 28, w / 2, Math.PI, 0); g.lineTo(x + w, y + h); g.closePath(); g.fill();
    g.strokeStyle = "#f1e2c2"; g.lineWidth = 8; g.beginPath(); g.arc(x + w / 2, y + 28, w / 2 + 6, Math.PI, 0); g.stroke();
  }
  g.strokeStyle = "rgba(60,30,20,0.25)"; g.lineWidth = 3; g.strokeRect(2, 2, 508, 508);
});
const romeBlock = (b: Batch, x0: number, z0: number, x1: number, z1: number, h: number, kind: number, faceZ: number) => {
  const plaster = mat(`pzwall${kind}`, ["#d8a060", "#d08858", "#e0b878", "#c07858"][kind % 4]);
  box(b, plaster, x0, 0, z0, x1, h, z1);
  const front = lam(`e2_pzfront${kind}`, () => ({ map: romeFacade(kind) }));
  const g = new THREE.PlaneGeometry(x1 - x0, h);
  b.add(g, front, new THREE.Matrix4().makeTranslation((x0 + x1) / 2, h / 2, faceZ + 0.02));
  box(b, mat("pzroof", "#a8523a"), x0 - 0.2, h, z0 - 0.2, x1 + 0.2, h + 0.25, z1 + 0.2);
};
export const GATE = { x0: PZ - 2.3, x1: PZ - 0.9, z: -6.85, h: 2.8 };
export const buildSquare = (root: THREE.Object3D) => {
  const b = new Batch(), X = PZ;
  const cobble = lam("e2_pzcobble", () => ({ map: cobbleHD() }));
  box(b, cobble, X - 40, -0.3, -40, X + 40, 0, 40, 8);
  // the prison gatehouse: stone block with an arch, two towers, battlements, dark inside
  const grey = lam("e2_pzgrey", () => ({ map: stoneHD("e2_pzgrey", ["#a8a29a", "#9c968e", "#b2aca4", "#948e86"], "#6e6860") }));
  box(b, grey, X - 3.6, 0, -8.2, GATE.x0, 5.2, -6.8, 2); box(b, grey, GATE.x1, 0, -8.2, X + 0.4, 5.2, -6.8, 2); box(b, grey, GATE.x0, GATE.h, -8.2, GATE.x1, 5.2, -6.8, 2);
  box(b, mat("pzdark", "#26222a"), GATE.x0, 0, -8.6, GATE.x1, GATE.h, -8.2);
  b.add(boxGeo(V(GATE.x0, GATE.h - 0.02, -8.6), V(GATE.x1, GATE.h + 0.2, -6.8), 0, true), mat("pzdark", "#26222a")); // the arch ceiling (boxGeo has no bottom face by default)
  for (const s of [-1, 1]) { const cx = X - 1.6 + s * 2.4; box(b, grey, cx - 0.8, 0, -8.4, cx + 0.8, 6.6, -6.6, 2); for (const dx of [-0.6, 0, 0.6]) box(b, grey, cx + dx - 0.18, 6.6, -6.7, cx + dx + 0.18, 7.0, -6.5); }
  for (let x = X - 3.4; x < X + 0.3; x += 0.6) box(b, grey, x, 5.2, -6.95, x + 0.32, 5.6, -6.75);
  box(b, mat("pzslit", "#26222a"), X - 4.05, 3.6, -6.62, X - 3.95, 4.6, -6.58); box(b, mat("pzslit", "#26222a"), X + 0.75, 3.6, -6.62, X + 0.85, 4.6, -6.58);
  // Roman houses round the square
  romeBlock(b, X - 16, -14, X - 4.6, -9, 7.5, 0, -9);
  romeBlock(b, X + 1.4, -14, X + 9, -9.5, 8.5, 1, -9.5);
  romeBlock(b, X + 9.2, -14, X + 18, -8.5, 7, 2, -8.5);
  romeBlock(b, X - 24, -14, X - 16.2, -10, 9, 3, -10);
  // the papal stand: stone platform, balustrade, red canopy on gold poles, a building behind it
  const pale = lam("e2_pzpale", () => ({ map: stoneHD("e2_pzpale", ["#eee6d6", "#e4dac8", "#f2ebde", "#ddd2bf"], "#b8ab94") }));
  romeBlock(b, X + 1.2, -6.4, X + 4.2, -5.0, 6.5, 2, -5.0);
  box(b, pale, X + 1.5, 0, -5.0, X + 3.8, 1.2, -3.0, 1.5);
  box(b, pale, X + 1.5, 1.2, -3.12, X + 3.8, 1.28, -3.0); box(b, pale, X + 1.5, 1.62, -3.14, X + 3.8, 1.7, -2.98);
  for (let x = X + 1.6; x < X + 3.75; x += 0.22) cyl(b, pale, x, 1.28, -3.06, 0.04, 0.34, 8);
  const gold = mat("pzgold", "#d9b84a"), red = mat("pzred", "#a8283a");
  for (const [x, z] of [[1.6, -4.9], [3.7, -4.9], [1.6, -3.1], [3.7, -3.1]]) cyl(b, gold, X + x, 1.2, z, 0.05, 2.5, 10);
  box(b, red, X + 1.5, 3.7, -5.0, X + 3.8, 3.85, -3.0);
  box(b, red, X + 1.5, 3.3, -3.04, X + 3.8, 3.7, -2.98);
  for (let x = X + 1.5; x < X + 3.8; x += 0.23) box(b, gold, x, 3.26, -3.0, x + 0.1, 3.32, -2.96);
  // a well and some barrels in the square
  cyl(b, grey, X + 5.2, 0, -4.4, 0.7, 0.9, 20);
  for (const [x, z] of [[-4.6, -5.6], [-4.1, -5.9], [5.6, -6.2]]) cyl(b, mat("pzbarrel", "#8a5a34"), X + x, 0, z, 0.38, 0.9, 12);
  b.build(root, true);
};
/** the portcullis: an iron grid in the gate arch; world.ts slides it down (y offset) */
export const buildPortcullis = (root: THREE.Object3D) => {
  const b = new Batch(), grp = new THREE.Group(), iron = mat("pziron", "#3a3a44");
  for (let x = GATE.x0 + 0.08; x < GATE.x1; x += 0.2) box(b, iron, x - 0.03, 0, GATE.z - 0.04, x + 0.03, GATE.h + 0.1, GATE.z + 0.04);
  for (let y = 0.25; y < GATE.h; y += 0.4) box(b, iron, GATE.x0, y - 0.03, GATE.z - 0.05, GATE.x1, y + 0.03, GATE.z + 0.05);
  for (let x = GATE.x0 + 0.08; x < GATE.x1; x += 0.2) b.add(new THREE.ConeGeometry(0.05, 0.14, 6), iron, new THREE.Matrix4().compose(V(x, -0.05, GATE.z), new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI, 0, 0)), V(1, 1, 1)));
  b.build(grp, true);
  root.add(grp);
  return grp;
};
