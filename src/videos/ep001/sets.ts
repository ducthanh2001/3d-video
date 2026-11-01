// Static 3D dressing for ep001: a medieval village green (timber-framed houses, well, market stall, hay, trees, hills, a far-off gallows
// frame with just a rope) and, far to the east at x = 1000, the court-room (open top, no front wall: the lens stands where it would be).
// Ground is y = 0 everywhere. Everything is built from boxes / quads with painted textures so it needs no downloaded models.
import * as THREE from "three";
import { Batch, boxGeo, quad, tri, V, lam } from "./build";
import { ctex, cobbleHD, grassHD, planksHD, stoneHD } from "./paint";
import { INT, CHURCH, STABLE, GALLOWS } from "./story";

const mat = (k: string, c: string) => lam(`e1_${k}`, () => ({ color: c }));
const box = (b: Batch, m: THREE.Material, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, tile = 0) =>
  b.add(boxGeo(V(x0, y0, z0), V(x1, y1, z1), tile), m);
const cyl = (b: Batch, m: THREE.Material, x: number, y: number, z: number, r: number, h: number, seg = 14) =>
  b.add(new THREE.CylinderGeometry(r, r, h, seg), m, new THREE.Matrix4().makeTranslation(x, y + h / 2, z));
const flat = (x0: number, x1: number, z0: number, z1: number, u: number, v: number, y = 0) => {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute([x0, y, z1, x1, y, z1, x1, y, z0, x0, y, z1, x1, y, z0, x0, y, z0], 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, u, 0, u, v, 0, 0, u, v, 0, v], 2));
  return g;
};

/** white plaster with dark timber framing and two windows, 512 x 384 */
const facade = (kind: number) => ctex(`e1_facade${kind}`, 512, 384, (g) => {
  const wall = ["#efe6d2", "#e8dcc2", "#f1eadb"][kind % 3];
  g.fillStyle = wall; g.fillRect(0, 0, 512, 384);
  g.strokeStyle = "#3a2a20"; g.lineWidth = 16; g.lineCap = "round";
  const line = (x0: number, y0: number, x1: number, y1: number) => { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); };
  g.strokeRect(8, 8, 496, 368);
  line(8, 190, 504, 190); line(170, 8, 170, 376); line(340, 8, 340, 376);
  if (kind % 2) { line(8, 190, 170, 8); line(504, 190, 340, 8); } else { line(170, 190, 8, 376); line(340, 190, 504, 376); }
  for (const x of [60, 395]) { // windows
    g.fillStyle = "#2e3a4a"; g.fillRect(x, 60, 56, 90);
    g.fillStyle = "#8fb8d8"; g.fillRect(x + 6, 66, 44, 36);
    g.strokeStyle = "#3a2a20"; g.lineWidth = 6; g.strokeRect(x, 60, 56, 90); line(x + 28, 60, x + 28, 150); line(x, 105, x + 56, 105);
  }
  g.fillStyle = "#5a3a22"; g.fillRect(215, 235, 82, 141); // door
  g.strokeStyle = "#3a2a20"; g.lineWidth = 8; g.strokeRect(215, 235, 82, 141);
  g.fillStyle = "#c9a35a"; g.beginPath(); g.arc(280, 310, 5, 0, 7); g.fill();
});

const house = (b: Batch, cx: number, cz: number, yaw: number, w: number, d: number, h: number, kind: number) => {
  const M = new THREE.Matrix4().compose(V(cx, 0, cz), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0)), V(1, 1, 1));
  const plaster = mat("plaster", "#e8dcc2"), roof = mat(`roof${kind % 2}`, kind % 2 ? "#7a4a32" : "#a8864a"), rh = 0.5 * w * 0.55;
  const front = lam(`e1_facadeM${kind % 3}`, () => ({ map: facade(kind) }));
  b.add(boxGeo(V(-w / 2, 0, -d / 2), V(w / 2, h, d / 2)), plaster, M);
  b.add(quad(V(-w / 2, 0, d / 2 + 0.02), V(w / 2, 0, d / 2 + 0.02), V(w / 2, h, d / 2 + 0.02), V(-w / 2, h, d / 2 + 0.02)), front, M);
  b.add(quad(V(-w / 2 - 0.3, h, d / 2 + 0.3), V(w / 2 + 0.3, h, d / 2 + 0.3), V(w / 2 + 0.3, h + rh, 0), V(-w / 2 - 0.3, h + rh, 0)), roof, M);
  b.add(quad(V(w / 2 + 0.3, h, -d / 2 - 0.3), V(-w / 2 - 0.3, h, -d / 2 - 0.3), V(-w / 2 - 0.3, h + rh, 0), V(w / 2 + 0.3, h + rh, 0)), roof, M);
  b.add(tri(V(w / 2, h, d / 2), V(w / 2, h, -d / 2), V(w / 2, h + rh, 0)), plaster, M);
  b.add(tri(V(-w / 2, h, -d / 2), V(-w / 2, h, d / 2), V(-w / 2, h + rh, 0)), plaster, M);
};

export const buildVillage = (root: THREE.Object3D) => {
  const b = new Batch();
  const grass = lam("e1_grass", () => ({ map: grassHD() })), cobble = lam("e1_cobble", () => ({ map: cobbleHD() }));
  b.add(flat(-900, 900, -900, 900, 450, 450, -0.02), grass);
  b.add(flat(-11, 11, -9, 9, 5.5, 4.5, 0.01), cobble);
  // houses: a back row facing the green and one on each side
  [[-13, -14, 0, 6.5, 5, 4.6, 0], [-6, -15, 0, 6, 5, 5.2, 1], [1.5, -14.5, 0, 7, 5, 4.8, 2], [9, -15, 0, 6.5, 5, 5.6, 3], [15.5, -13, 0, 6, 5, 4.4, 4],
    [-16, -3, Math.PI / 2, 6, 5, 4.8, 5], [-16, 5, Math.PI / 2, 6, 5, 4.4, 0], [16.5, -4, -Math.PI / 2, 6, 5, 5, 1], [16.5, 4, -Math.PI / 2, 6, 5, 4.5, 2]]
    .forEach(([x, z, yaw, w, d, h, k]) => house(b, x, z, yaw, w, d, h, k));
  // well, market stall, hay, barrels
  const stone = lam("e1_stone", () => ({ map: stoneHD("e1_stone", ["#c9bcaa", "#bfb19f", "#d1c5b4", "#b8aa97"], "#958776") }));
  cyl(b, stone, 4.8, 0, -6.2, 0.75, 0.95, 18);
  box(b, mat("wood", "#7a5a3a"), 4.15, 0.95, -6.35, 4.3, 2.4, -6.05); box(b, mat("wood", "#7a5a3a"), 5.3, 0.95, -6.35, 5.45, 2.4, -6.05);
  box(b, mat("woodroof", "#8a5a34"), 4.0, 2.4, -6.6, 5.6, 2.55, -5.8);
  box(b, mat("stalltable", "#a8724a"), -7.4, 0, -6.6, -5.2, 0.95, -5.6);
  for (let i = 0; i < 6; i++) box(b, mat(i % 2 ? "stallw" : "stallr", i % 2 ? "#f4f1e8" : "#c8453a"), -7.6 + i * 0.42, 2.45 - i * 0.0, -7.0, -7.2 + i * 0.42, 2.6, -5.4);
  box(b, mat("postL", "#7a5a3a"), -7.6, 0, -7.0, -7.45, 2.5, -6.85); box(b, mat("postR", "#7a5a3a"), -5.1, 0, -7.0, -4.95, 2.5, -6.85);
  box(b, mat("brazier", "#3a3a42"), -2.15, 0, -0.25, -1.65, 0.45, 0.25); box(b, mat("coals", "#d8541c"), -2.1, 0.45, -0.2, -1.7, 0.5, 0.2);
  const hay = mat("hay", "#d6b25a");
  box(b, hay, 6.6, 0, -4.6, 7.9, 0.9, -3.6); box(b, hay, 6.9, 0.9, -4.4, 7.9, 1.7, -3.8); box(b, hay, -9.2, 0, -3.4, -8.0, 0.9, -2.4);
  for (const [x, z] of [[-3.1, -7.6], [-2.4, -7.9], [8.6, -6.8]]) cyl(b, mat("barrel", "#8a5a34"), x, 0, z, 0.42, 0.95, 12);
  // trees and hills
  const trunk = mat("trunk", "#6a4a32"), leaf = mat("leaf", "#5e9a4a"), leaf2 = mat("leaf2", "#6aa84f");
  [[-24, -22], [-18, -28], [22, -24], [27, -18], [-30, -8], [30, -6], [-12, -34], [8, -36], [0, -30], [14, -30]].forEach(([x, z], i) => {
    cyl(b, trunk, x, 0, z, 0.3, 2.4, 7);
    b.add(new THREE.ConeGeometry(2.4 + (i % 3) * 0.3, 6 + (i % 2), 8), i % 2 ? leaf : leaf2, new THREE.Matrix4().makeTranslation(x, 5.2, z));
  });
  const hill = new THREE.SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2);
  [[-120, -170, 130, 34, 80], [60, -210, 170, 44, 90], [190, -80, 120, 30, 100], [-210, -30, 110, 28, 110], [0, -330, 230, 52, 110]].forEach(([x, z, sx, sy, sz], i) =>
    b.add(hill, i % 2 ? mat("hillB", "#6aa24e") : mat("hillA", "#78b257"), new THREE.Matrix4().compose(V(x, -2, z), new THREE.Quaternion(), V(sx, sy, sz))));
  b.build(root, true);
};

/** a gallows frame on open grass: two posts, a beam and a rope. Nobody on it. Only shown in shot 7 (see world.ts). */
export const buildGallows = (root: THREE.Object3D) => {
  const b = new Batch(), grp = new THREE.Group(), gx = GALLOWS[0], gz = GALLOWS[1], wood = mat("gwood", "#5a4030");
  box(b, wood, gx - 1.3, 0, gz - 0.12, gx - 1.1, 4.6, gz + 0.12); box(b, wood, gx + 1.1, 0, gz - 0.12, gx + 1.3, 4.6, gz + 0.12);
  box(b, wood, gx - 1.5, 4.4, gz - 0.14, gx + 1.5, 4.7, gz + 0.14);
  box(b, wood, gx - 1.9, 0, gz - 1.0, gx + 1.9, 0.5, gz + 1.0);
  cyl(b, mat("rope", "#c9a35a"), gx, 3.0, gz, 0.03, 1.4, 6);
  b.add(new THREE.TorusGeometry(0.22, 0.035, 6, 18), mat("rope", "#c9a35a"), new THREE.Matrix4().makeTranslation(gx, 2.85, gz));
  b.build(grp, true);
  root.add(grp);
  return grp;
};

export const buildCourtroom = (root: THREE.Object3D) => {
  const b = new Batch(), X = INT;
  const floor = lam("e1_floor", () => ({ map: planksHD() })), wall = lam("e1_cwall", () => ({ map: stoneHD("e1_cwall", ["#d8c7a8", "#cdbb9a", "#e0d0b2", "#c4b08f"], "#8a7660") }));
  const dark = mat("cdark", "#5a3a22"), mid = mat("cmid", "#7a5230"), red = mat("cred", "#8a2f2f"), gold = mat("cgold", "#c9a14a");
  box(b, floor, X - 6, -0.3, -3.6, X + 6, 0, 9, 3);
  box(b, wall, X - 4.2, 0, -3.8, X + 4.2, 4.4, -3.4, 2.4); // back wall
  box(b, wall, X - 4.4, 0, -3.8, X - 4.0, 4.4, 9, 2.4); box(b, wall, X + 4.0, 0, -3.8, X + 4.4, 4.4, 9, 2.4); // side walls
  // beams across the top
  for (const z of [-2.5, 0.2, 2.9, 5.6]) box(b, dark, X - 4.0, 4.0, z - 0.15, X + 4.0, 4.3, z + 0.15);
  // window in the back wall (the one warm light) with its frame
  const glassC = lam("e1_window", () => ({ color: "#fff0c0", emissive: new THREE.Color("#ffe39a"), emissiveIntensity: 0.9 }));
  box(b, glassC, X - 3.2, 1.7, -3.4, X - 1.8, 3.5, -3.38);
  box(b, dark, X - 3.3, 1.6, -3.4, X - 3.2, 3.6, -3.36); box(b, dark, X - 1.8, 1.6, -3.4, X - 1.7, 3.6, -3.36);
  box(b, dark, X - 3.3, 3.5, -3.4, X - 1.7, 3.6, -3.36); box(b, dark, X - 3.3, 1.6, -3.4, X - 1.7, 1.7, -3.36); box(b, dark, X - 2.55, 1.7, -3.4, X - 2.45, 3.5, -3.36);
  // judge's raised bench: platform, desk, red hanging
  box(b, mid, X - 1.9, 0, -3.3, X + 1.9, 1.15, -1.6, 1.5);
  box(b, dark, X - 1.5, 1.15, -1.9, X + 1.5, 1.75, -1.6);
  box(b, red, X - 1.4, 1.2, -1.58, X + 1.4, 1.7, -1.56);
  box(b, gold, X - 0.2, 1.3, -1.57, X + 0.2, 1.6, -1.55);
  // lectern for the book, benches along the sides
  box(b, dark, X - 0.35, 0, 0.85, X + 0.35, 0.75, 1.25); box(b, mid, X - 0.5, 0.75, 0.7, X + 0.5, 0.82, 1.4);
  for (const s of [-1, 1]) for (const z of [-0.6, 1.6, 3.8]) box(b, mid, s > 0 ? X + 2.6 : X - 3.4, 0, z, s > 0 ? X + 3.8 : X - 2.6, 0.5, z + 0.5);
  // a banner on each side of the bench
  for (const s of [-1, 1]) box(b, red, X + s * 2.5 - 0.3, 1.8, -3.36, X + s * 2.5 + 0.3, 3.6, -3.34);
  b.build(root, true);
};

/** the church court at x = 1100: pale plaster, big bright windows, a LOW dais: everybody smiles here */
export const buildChurchCourt = (root: THREE.Object3D) => {
  const b = new Batch(), X = CHURCH;
  const floor = lam("e1_cfloor", () => ({ map: planksHD() })), wall = lam("e1_chwall", () => ({ map: stoneHD("e1_chwall", ["#efe6d2", "#e8dcc2", "#f1eadb", "#e4d8bc"], "#b8a888") }));
  const wood = mat("chwood", "#a8724a"), dark = mat("chdark", "#6a4a32"), gold = mat("chgold", "#d9b84a");
  box(b, floor, X - 6, -0.3, -3.6, X + 6, 0, 9, 3);
  box(b, wall, X - 4.2, 0, -3.8, X + 4.2, 4.4, -3.4, 2.4); box(b, wall, X - 4.4, 0, -3.8, X - 4.0, 4.4, 9, 2.4); box(b, wall, X + 4.0, 0, -3.8, X + 4.4, 4.4, 9, 2.4);
  const glass = lam("e1_chglass", () => ({ color: "#fff6d8", emissive: new THREE.Color("#fff0b8"), emissiveIntensity: 0.9 }));
  for (const wx of [-2.6, 0, 2.6]) { box(b, glass, X + wx - 0.6, 1.4, -3.4, X + wx + 0.6, 3.6, -3.38); box(b, dark, X + wx - 0.04, 1.4, -3.4, X + wx + 0.04, 3.6, -3.36); box(b, dark, X + wx - 0.6, 2.45, -3.4, X + wx + 0.6, 2.53, -3.36); }
  for (const z of [-2.5, 0.2, 2.9, 5.6]) box(b, dark, X - 4.0, 4.0, z - 0.15, X + 4.0, 4.3, z + 0.15);
  box(b, wood, X - 2.0, 0, -3.1, X + 2.0, 0.35, -1.9, 1.5);       // low dais
  box(b, dark, X - 1.2, 0.35, -2.2, X + 1.2, 0.95, -1.95);        // desk
  box(b, gold, X - 0.25, 1.0, -3.3, X + 0.25, 2.2, -3.28); box(b, gold, X - 0.7, 1.55, -3.3, X + 0.7, 1.75, -3.28); // a plain gold cross
  for (const s of [-1, 1]) for (const z of [0.2, 2.4]) box(b, wood, X + s * 2.4 - 0.5, 0, z, X + s * 2.4 + 0.5, 0.5, z + 0.5);
  b.build(root, true);
};

/** the stable at x = 1200: plank walls, hay on the floor, stall dividers, a lantern */
export const buildStable = (root: THREE.Object3D) => {
  const b = new Batch(), X = STABLE;
  const planks = lam("e1_splank", () => ({ map: planksHD() })), dirt = mat("sdirt", "#8a6a44"), hay = mat("shay", "#d6b25a"), dark = mat("sdark", "#4a3424");
  box(b, dirt, X - 6, -0.3, -3.6, X + 6, 0, 9);
  box(b, planks, X - 4.2, 0, -3.8, X + 4.2, 4.2, -3.4, 1.2); box(b, planks, X - 4.4, 0, -3.8, X - 4.0, 4.2, 9, 1.2); box(b, planks, X + 4.0, 0, -3.8, X + 4.4, 4.2, 9, 1.2);
  for (const x of [-3, -1.2, 0.6, 2.4]) box(b, dark, X + x - 0.07, 0, -3.4, X + x + 0.07, 3.8, -3.3);   // posts
  for (const x of [-2.4, 1.6]) { box(b, planks, X + x, 0, -3.3, X + x + 1.6, 1.4, -2.9, 1.0); box(b, dark, X + x - 0.05, 1.4, -3.3, X + x + 1.65, 1.5, -2.9); } // stall fronts
  for (const [x, z, w] of [[-1.6, -0.6, 1.2], [1.6, -0.4, 1.4], [-2.4, 1.2, 1.0], [2.5, 1.3, 1.1], [0.2, -1.2, 1.0]] as const) box(b, hay, X + x, 0, z, X + x + w, 0.55, z + 0.7); // hay bales
  box(b, mat("bucket", "#8a5a34"), X + 1.0, 0, 1.4, X + 1.4, 0.4, 1.8);
  const lamp = lam("e1_slamp", () => ({ color: "#ffd98a", emissive: new THREE.Color("#ffc860"), emissiveIntensity: 0.9 }));
  box(b, lamp, X - 2.2, 2.6, -3.3, X - 1.9, 3.0, -3.0); box(b, dark, X - 2.12, 3.0, -3.25, X - 2.0, 3.6, -3.15);
  b.build(root, true);
};
