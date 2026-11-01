// Static 3D dressing for "24 Shots": the bus stop and the bakery annex on the quay, plus six small open-top rooms
// (elevator, bathroom, camera shop, buffet, low table, darkroom) parked far east of the town (x >= 2000, floor at y = 0).
// Rooms have no ceiling and no front wall: the lens sits where the front wall would be, the sun still lights them.
import * as THREE from "three";
import { Batch, boxGeo, V, lam } from "./build";
import { ctex } from "./paint";
import { D0, SET, BUS, BAKERY } from "./story";

const mat = (k: string, c: string) => lam(`an_${k}`, () => ({ color: c }));
const tiles = (k: string, bg: string, grout: string, n = 4) => lam(`an_tex_${k}`, () => ({
  map: (() => {
    const t = ctex(`an_tile_${k}`, 256, 256, (g) => {
      g.fillStyle = bg; g.fillRect(0, 0, 256, 256);
      g.strokeStyle = grout; g.lineWidth = 6;
      for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo((i * 256) / n, 0); g.lineTo((i * 256) / n, 256); g.stroke(); g.beginPath(); g.moveTo(0, (i * 256) / n); g.lineTo(256, (i * 256) / n); g.stroke(); }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 1);
    return t;
  })(),
}));
const box = (b: Batch, m: THREE.Material, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, tile = 0) =>
  b.add(boxGeo(V(x0, y0, z0), V(x1, y1, z1), tile), m);
const cyl = (b: Batch, m: THREE.Material, x: number, y: number, z: number, r: number, h: number, seg = 18) =>
  b.add(new THREE.CylinderGeometry(r, r, h, seg), m, new THREE.Matrix4().makeTranslation(x, y + h / 2, z));

/** open-top room centred at x = cx on the z axis: back wall at z = -d/2, side walls, floor */
const room = (b: Batch, cx: number, w: number, d: number, h: number, wall: THREE.Material, floor: THREE.Material, tile = 0) => {
  const t = 0.2;
  box(b, floor, cx - w / 2 - 2, -0.3, -d / 2 - 2, cx + w / 2 + 2, 0, d / 2 + 6);
  box(b, wall, cx - w / 2 - t, 0, -d / 2 - t, cx + w / 2 + t, h, -d / 2, tile);
  box(b, wall, cx - w / 2 - t, 0, -d / 2, cx - w / 2, h, d / 2 + 6, tile);
  box(b, wall, cx + w / 2, 0, -d / 2, cx + w / 2 + t, h, d / 2 + 6, tile);
};

export const buildSets = (root: THREE.Object3D) => {
  const b = new Batch();
  const steel = mat("steel", "#b9bec9"), steelD = mat("steelD", "#8d93a3"), dark = mat("dark", "#2a2c36"), black = mat("black", "#1d1e26");
  const wood = mat("wood", "#a8724a"), woodD = mat("woodD", "#7a4f33"), white = mat("white", "#f6f4ee");
  const lamp = lam("an_lamp", () => ({ color: "#ffe9b0", emissive: new THREE.Color("#ffd37a"), emissiveIntensity: 0.8 }));

  // ---- bus stop on the quay: slab, glass back, roof, bench, sign pole ----
  const [bx, bz] = BUS, glass = mat("glass", "#a9d3ea"), roof = mat("busroof", "#3f6fb5"), pole = mat("pole", "#5a5f6e");
  box(b, mat("slab", "#b9b2a6"), bx - 3.4, D0, bz - 1.3, bx + 3.4, D0 + 0.12, bz + 1.3);
  box(b, glass, bx - 3.2, D0 + 0.12, bz + 1.0, bx + 3.2, D0 + 2.3, bz + 1.06);
  for (const x of [-3.2, 0, 3.2]) box(b, pole, bx + x - 0.06, D0 + 0.12, bz + 0.95, bx + x + 0.06, D0 + 2.4, bz + 1.1);
  box(b, roof, bx - 3.5, D0 + 2.4, bz - 0.2, bx + 3.5, D0 + 2.62, bz + 1.4);
  box(b, wood, bx - 2.2, D0 + 0.5, bz + 0.45, bx + 0.4, D0 + 0.58, bz + 0.85);
  box(b, woodD, bx - 2.1, D0 + 0.12, bz + 0.5, bx - 1.95, D0 + 0.5, bz + 0.8);
  box(b, woodD, bx + 0.2, D0 + 0.12, bz + 0.5, bx + 0.35, D0 + 0.5, bz + 0.8);
  cyl(b, pole, bx + 4.4, D0, bz - 0.3, 0.06, 2.7, 8);
  cyl(b, mat("signblue", "#2f6fd0"), bx + 4.4, D0 + 2.6, bz - 0.3, 0.42, 0.06, 24);

  // ---- bakery annex facing -x: cream wall, brown door, striped awning ----
  const [kx, kz] = BAKERY, wall = mat("bakery", "#f2dcb0"), door = mat("bakedoor", "#7a4a2a"), red = mat("awnred", "#d6384a");
  box(b, wall, kx, D0, kz - 3.2, kx + 1.0, D0 + 3.6, kz + 3.2);
  box(b, door, kx - 0.08, D0, kz - 0.8, kx, D0 + 2.3, kz + 0.8);
  box(b, mat("doorframe", "#e8cfa4"), kx - 0.1, D0 + 2.3, kz - 0.95, kx + 0.02, D0 + 2.45, kz + 0.95);
  for (let i = 0; i < 8; i++) { // awning stripes sloping down toward -x
    const z0 = kz - 1.6 + i * 0.4, m = i % 2 ? white : red;
    b.add(boxGeo(V(0, 0, 0), V(1.0, 0.07, 0.4)), m, new THREE.Matrix4().compose(V(kx - 1.0, D0 + 2.8, z0), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -0.32)), V(1, 1, 1)));
  }
  box(b, mat("window", "#8fb8d8"), kx - 0.06, D0 + 1.1, kz + 1.5, kx, D0 + 2.4, kz + 2.8);
  box(b, mat("window", "#8fb8d8"), kx - 0.06, D0 + 1.1, kz - 2.8, kx, D0 + 2.4, kz - 1.5);

  // ---- elevator: brushed-steel cabin, closed doors, display, hand rail ----
  const E = SET.elevator;
  room(b, E, 2.2, 2.4, 2.6, steel, mat("elevfloor", "#4a4d58"));
  box(b, steelD, E - 0.9, 0, -1.2, E - 0.02, 2.2, -1.15); box(b, steelD, E + 0.02, 0, -1.2, E + 0.9, 2.2, -1.15);
  box(b, black, E - 0.02, 0, -1.19, E + 0.02, 2.2, -1.14);
  box(b, dark, E - 0.45, 2.3, -1.19, E + 0.45, 2.55, -1.12);
  for (const z of [-0.5, 0.2]) box(b, mat("rail", "#d7dae3"), E - 1.08, 0.95, z - 0.45, E - 1.02, 1.02, z + 0.45);
  for (let i = 0; i < 6; i++) box(b, i === 4 ? lamp : steelD, E + 1.0, 1.0 + (i >> 1) * 0.16, -0.4 + (i & 1) * 0.16, E + 1.1, 1.1 + (i >> 1) * 0.16, -0.3 + (i & 1) * 0.16);

  // ---- bathroom: teal tile, mirror over a sink ----
  const B = SET.bath;
  room(b, B, 3.2, 3.0, 3.0, tiles("bath", "#e8f3f2", "#9ec7c5"), mat("bathfloor", "#c9d6d6"), 0.8);
  box(b, mat("mirrorframe", "#d7dae3"), B - 0.8, 1.3, -1.5, B + 0.8, 2.4, -1.46);
  box(b, mat("mirror", "#bfe3f5"), B - 0.72, 1.38, -1.46, B + 0.72, 2.32, -1.44);
  box(b, white, B - 0.6, 0.0, -1.5, B + 0.6, 0.85, -0.95);
  box(b, white, B - 0.7, 0.85, -1.5, B + 0.7, 0.95, -0.9);
  cyl(b, steel, B, 0.95, -1.35, 0.03, 0.22, 8);
  box(b, mat("towel", "#d6384a"), B + 1.1, 1.4, -1.5, B + 1.5, 2.2, -1.42);

  // ---- camera shop: wooden shelves of old cameras, counter ----
  const S = SET.shop;
  room(b, S, 6.0, 5.0, 3.4, mat("shopwall", "#c98f5a"), mat("shopfloor", "#7a5a3a"));
  for (const y of [0.9, 1.6, 2.3]) {
    box(b, woodD, S - 2.8, y, -2.5, S + 2.8, y + 0.07, -2.05);
    for (let i = 0; i < 9; i++) {
      const x = S - 2.5 + i * 0.62 + (y > 1 ? 0.15 : 0), c = i % 3 === 0 ? steel : black;
      box(b, c, x, y + 0.07, -2.4, x + 0.3, y + 0.28, -2.25);
      box(b, steelD, x, y + 0.28, -2.4, x + 0.3, y + 0.32, -2.25);
      cyl(b, dark, x + 0.15, y + 0.12, -2.22, 0.07, 0.07, 12);
    }
  }
  box(b, wood, S + 0.9, 0, -1.6, S + 3.0, 1.0, -0.6); box(b, woodD, S + 0.85, 1.0, -1.65, S + 3.05, 1.06, -0.55);
  box(b, mat("rug", "#b5543c"), S - 2.2, 0.01, -1.0, S + 0.4, 0.03, 1.6);

  // ---- buffet: long white table crowded with platters ----
  const F = SET.buffet;
  room(b, F, 9, 6, 3.6, mat("buffwall", "#f3d2b8"), mat("bufffloor", "#cbbba6"));
  box(b, white, F - 3.8, 0, -2.5, F + 3.8, 0.95, -1.6);
  box(b, mat("cloth", "#d6384a"), F - 3.85, 0.9, -2.55, F + 3.85, 0.96, -1.55);
  box(b, mat("buffsign", "#ffd84a"), F - 1.6, 2.5, -2.95, F + 1.6, 3.1, -2.88);

  // ---- low table for one small plate ----
  const P = SET.plate;
  room(b, P, 4, 4, 3.2, mat("platewall", "#e9efe4"), mat("platefloor", "#b9a07a"));
  box(b, mat("window2", "#cfe8f5"), P - 1.0, 1.1, -2.0, P + 1.0, 2.5, -1.96);
  box(b, wood, P - 0.55, 0.3, -0.55, P + 0.55, 0.38, 0.55); for (const [dx, dz] of [[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]]) box(b, woodD, P + dx - 0.04, 0, dz - 0.04 - 0.05, P + dx + 0.04, 0.3, dz + 0.04 - 0.05);
  cyl(b, mat("vase", "#7fbf4d"), P + 0.35, 0.38, -0.3, 0.05, 0.14, 10);
  box(b, mat("cushion", "#7b5ac9"), P - 0.45, 0.0, 0.85, P + 0.45, 0.12, 1.55);

  // ---- darkroom: maroon walls, trays, a clothesline ----
  const D = SET.dark;
  room(b, D, 6, 5, 3.2, mat("darkwall", "#b83a2e"), mat("darkfloor", "#2e1620"));
  box(b, black, D + 1.4, 0, -2.3, D + 2.9, 0.95, -1.3);
  for (const k of [0, 1, 2]) box(b, mat("tray" + k, k === 1 ? "#d6384a" : "#8d93a3"), D + 1.5 + k * 0.45, 0.95, -2.2, D + 1.85 + k * 0.45, 1.02, -1.45);
  b.add(new THREE.CylinderGeometry(0.012, 0.012, 5.4, 6), black, new THREE.Matrix4().compose(V(D, 2.25, -1.7), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2)), V(1, 1, 1)));
  for (const x of [-2.7, 2.7]) cyl(b, black, D + x, 0, -1.7, 0.03, 2.28, 6);
  box(b, lamp, D + 2.0, 2.45, -2.45, D + 2.35, 2.85, -2.3);

  b.build(root, true);
};
