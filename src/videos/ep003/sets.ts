// Static 3D dressing for ep003: the village square of Basel at x = SQ (story.ts). Milo's office is ep002's (ep002/sets.ts, x = 2000).
// The square is an open-air court: a judge's platform under a striped awning at the back, the rooster's little dock with its
// rail, a velvet stool for the egg ("the evidence"), Milo's table, the clerk's desk, timber houses all round, a well, hay,
// barrels. Ground is y = 0; boxes + painted textures only, so nothing is downloaded.
import * as THREE from "three";
import { Batch, boxGeo, V, lam } from "../ep001/build";
import { cobbleHD, grassHD, planksHD, stoneHD } from "../ep001/paint";
import { house } from "../ep001/sets";
import { SQ } from "./story";

const mat = (k: string, c: string) => lam(`e3_${k}`, () => ({ color: c }));
const box = (b: Batch, m: THREE.Material, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, tile = 0) =>
  b.add(boxGeo(V(x0, y0, z0), V(x1, y1, z1), tile), m);
const cyl = (b: Batch, m: THREE.Material, x: number, y: number, z: number, r: number, h: number, seg = 16) =>
  b.add(new THREE.CylinderGeometry(r, r, h, seg), m, new THREE.Matrix4().makeTranslation(x, y + h / 2, z));

export const buildSquare = (root: THREE.Object3D) => {
  const b = new Batch(), X = SQ;
  const grass = lam("e3_grass", () => ({ map: grassHD() })), cobble = lam("e3_cobble", () => ({ map: cobbleHD() })), planks = lam("e3_planks", () => ({ map: planksHD() }));
  const stone = lam("e3_stone", () => ({ map: stoneHD("e3_stone", ["#c9bcaa", "#bfb19f", "#d1c5b4", "#b8aa97"], "#958776") }));
  const wood = mat("wood", "#8a5a34"), dark = mat("dark", "#4a3020"), red = mat("red", "#a8283a"), cream = mat("cream", "#f4ead0"), gold = mat("gold", "#d9b84a");
  // ground: a wide meadow with the cobbled square in the middle
  box(b, grass, X - 120, -0.4, -120, X + 120, -0.02, 120, 40);
  box(b, cobble, X - 13, -0.3, -10, X + 13, 0, 16, 6);
  // timber houses all round: a back row behind the judge, a row each side
  [[-10.5, -11.5, 0, 6.5, 5, 5.2, 0], [-4, -11.8, 0, 6, 5, 6, 1], [2.8, -11.5, 0, 7, 5, 5.4, 2], [9.5, -12, 0, 6.5, 5, 6.2, 3], [15.5, -11, 0, 6, 5, 4.8, 4]].forEach(([x, z, yaw, w, d, h, k]) => house(b, X + x, z, yaw, w, d, h, k));
  [[-13, -5, Math.PI / 2, 6, 5, 5.4, 5], [-13, 2, Math.PI / 2, 6, 5, 4.8, 0], [-13, 9, Math.PI / 2, 6, 5, 5.8, 2], [13, -5, -Math.PI / 2, 6, 5, 5, 1], [13, 2, -Math.PI / 2, 6, 5, 5.6, 4], [13, 9, -Math.PI / 2, 6, 5, 4.9, 3]]
    .forEach(([x, z, yaw, w, d, h, k]) => house(b, X + x, z, yaw, w, d, h, k));
  // the judge's platform with steps, a desk with a red cloth, an awning on gold poles
  box(b, planks, X - 2.3, 0, -5.5, X + 2.3, 0.9, -3.2, 1.5);
  box(b, planks, X - 0.9, 0, -3.2, X + 0.9, 0.45, -2.8, 1.5);
  box(b, dark, X - 1.5, 0.9, -3.85, X + 1.5, 1.55, -3.55);
  box(b, red, X - 1.4, 0.95, -3.54, X + 1.4, 1.5, -3.52);
  box(b, gold, X - 0.25, 1.05, -3.51, X + 0.25, 1.4, -3.5);
  for (const s of [-1, 1]) cyl(b, gold, X + s * 2.15, 0.9, -5.2, 0.06, 2.9, 10);
  box(b, red, X - 2.6, 3.7, -5.6, X + 2.6, 3.82, -3.0);
  for (let i = 0; i < 10; i++) box(b, i % 2 ? cream : red, X - 2.6 + i * 0.52, 3.3, -3.04, X - 2.6 + (i + 1) * 0.52 - 0.04, 3.7, -3.0);
  // the dock: a plank pen with corner posts and a rail on three sides (open at the front so nobody is hidden)
  box(b, planks, X + 0.25, 0, -1.35, X + 1.35, 0.5, -0.65, 1.0);
  for (const [x, z] of [[0.3, -1.3], [1.3, -1.3], [0.3, -0.7], [1.3, -0.7]]) box(b, dark, X + x - 0.04, 0.5, z - 0.04, X + x + 0.04, 1.15, z + 0.04);
  box(b, dark, X + 0.26, 1.08, -1.32, X + 1.34, 1.14, -1.26); box(b, dark, X + 0.26, 1.08, -1.32, X + 0.32, 1.14, -0.68); box(b, dark, X + 1.28, 1.08, -1.32, X + 1.34, 1.14, -0.68);
  // the evidence: an egg on a velvet stool
  cyl(b, wood, X + 1.95, 0, -1.0, 0.2, 0.7, 14);
  cyl(b, mat("velvet", "#7a2230"), X + 1.95, 0.7, -1.0, 0.24, 0.06, 18);
  // Milo's table, the prosecutor's lectern, the clerk's desk
  box(b, wood, X - 3.1, 0.74, -1.25, X - 1.7, 0.8, -0.6);
  for (const x of [-3.05, -1.75]) for (const z of [-1.2, -0.65]) box(b, dark, X + x - 0.04, 0, z - 0.04, X + x + 0.04, 0.74, z + 0.04);
  box(b, cream, X - 2.7, 0.8, -1.12, X - 2.35, 0.84, -0.9); box(b, mat("tome", "#6a3a22"), X - 2.15, 0.8, -1.15, X - 1.85, 0.9, -0.9);
  box(b, dark, X - 3.35, 0, -1.45, X - 2.65, 1.0, -1.15); box(b, wood, X - 3.4, 1.0, -1.5, X - 2.6, 1.06, -1.1);
  box(b, wood, X - 3.4, 0.72, -3.0, X - 2.0, 0.78, -2.45);
  for (const x of [-3.35, -2.05]) for (const z of [-2.95, -2.5]) box(b, dark, X + x - 0.04, 0, z - 0.04, X + x + 0.04, 0.72, z + 0.04);
  cyl(b, mat("ink", "#22202a"), X - 2.2, 0.78, -2.7, 0.04, 0.07, 10); box(b, cream, X - 3.1, 0.78, -2.85, X - 2.7, 0.8, -2.6);
  // a market stall, a well, hay, barrels
  box(b, wood, X + 7.2, 0, -7.3, X + 9.6, 0.9, -6.5); for (const x of [7.2, 9.5]) box(b, dark, X + x - 0.05, 0.9, -7.3, X + x + 0.05, 2.7, -7.2);
  for (let i = 0; i < 6; i++) box(b, i % 2 ? cream : red, X + 7.1 + i * 0.42, 2.6, -7.35, X + 7.1 + (i + 1) * 0.42 - 0.03, 2.75, -6.2);
  cyl(b, stone, X - 7.2, 0, -5.5, 0.75, 0.9, 20);
  box(b, dark, X - 7.9, 0.9, -5.6, X - 7.8, 2.3, -5.5); box(b, dark, X - 6.6, 0.9, -5.6, X - 6.5, 2.3, -5.5); box(b, wood, X - 8.0, 2.3, -5.7, X - 6.4, 2.45, -5.4);
  const hay = mat("hay", "#d6b25a");
  box(b, hay, X - 9.3, 0, -3.6, X - 8.1, 0.9, -2.6); box(b, hay, X - 9.0, 0.9, -3.4, X - 8.2, 1.6, -2.8); box(b, hay, X + 8.6, 0, -2.4, X + 9.8, 0.9, -1.4);
  for (const [x, z] of [[-5.9, -6.9], [-5.2, -7.2], [6.3, -6.6], [10.4, -4.2]]) cyl(b, mat("barrel", "#8a5a34"), X + x, 0, z, 0.4, 0.95, 12);
  // trees behind the houses and hills on the horizon
  const trunk = mat("trunk", "#6a4a32"), leaf = mat("leaf", "#5e9a4a"), leaf2 = mat("leaf2", "#6aa84f");
  [[-20, -18], [-8, -20], [6, -21], [18, -19], [-26, -4], [26, -3], [-24, 12], [25, 11]].forEach(([x, z], i) => {
    cyl(b, trunk, X + x, 0, z, 0.35, 2.6, 7);
    b.add(new THREE.ConeGeometry(2.6 + (i % 3) * 0.3, 6.5 + (i % 2), 8), i % 2 ? leaf : leaf2, new THREE.Matrix4().makeTranslation(X + x, 5.6, z));
  });
  const hill = new THREE.SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2);
  [[-90, -120, 120, 30, 70], [70, -150, 150, 38, 80], [180, -40, 100, 26, 90], [-170, -20, 100, 24, 100], [0, -240, 200, 46, 100]].forEach(([x, z, sx, sy, sz], i) =>
    b.add(hill, i % 2 ? mat("hillB", "#6aa24e") : mat("hillA", "#78b257"), new THREE.Matrix4().compose(V(X + x, -2, z), new THREE.Quaternion(), V(sx, sy, sz))));
  b.build(root, true);
};
