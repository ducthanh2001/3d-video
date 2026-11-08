// Geometry of the mountain (world px): base at GROUND, summit at SUMMIT_Y, centred on CX.
// The path is N ledges zig-zagging up; ledge k has its top centre at STEPS[k]. B climbs along it with a float index s.
import { V, clamp, ease, hash, lerp, noise1 } from "../../kit/core";

export const CX = 540, GROUND = 1700, SUMMIT_Y = -5200, H = GROUND - SUMMIT_Y;
export const N = 125, RISE = 55, RUN = 34;
export const A_X = 360, B_X0 = 560;

export const halfW = (y: number) => 1150 * Math.pow(clamp((y - SUMMIT_Y) / H), 0.85) + 18;

export const STEPS: V[] = (() => {
  const out: V[] = [];
  let x = B_X0, dir = 1;
  for (let k = 0; k < N; k++) {
    const y = GROUND - RISE * (k + 1);
    const allowed = Math.max(40, halfW(y) * 0.62);
    if ((x + dir * RUN - CX) * dir > allowed) dir = -dir;
    x += dir * RUN;
    // the last ledges converge on the summit
    const pull = clamp((k - (N - 10)) / 9);
    out.push([lerp(x, CX, ease.inOut(pull)), y]);
  }
  return out;
})();
export const SUMMIT: V = [CX, SUMMIT_Y + 10];

/** silhouette polygon (jagged), plus some inner ridge lines */
export const OUTLINE: V[] = (() => {
  const L: V[] = [], R: V[] = [];
  const n = 70;
  for (let i = 0; i <= n; i++) {
    const t = i / n, y = lerp(GROUND + 60, SUMMIT_Y, t);
    const w = halfW(y) * (1 + 0.08 * noise1(i * 0.7, 3)) + (hash(i) - 0.5) * 30 * (1 - t);
    L.push([CX - w * 1.12, y]); R.push([CX + w * 1.12 + 10 * noise1(i * 0.9, 7), y]);
  }
  return [...L, [CX, SUMMIT_Y - 30] as V, ...R.reverse()];
})();
export const RIDGES: V[][] = Array.from({ length: 9 }, (_, r) => {
  const sx = CX + (hash(r * 7 + 1) - 0.5) * 900, sy = GROUND - 200 - hash(r * 3) * 3000;
  return Array.from({ length: 7 }, (_, i) => [sx + (i * 40 + noise1(i + r * 9, r) * 60) * (r % 2 ? 1 : -1) * 0.6, sy - i * 260] as V);
});

/** where B is on the path for a float index s (-1 = ground before step 0); hop arc between ledges */
export const onPath = (s: number): { p: V; dir: number; hop: number } => {
  if (s <= -1) return { p: [B_X0, GROUND], dir: 1, hop: 0 };
  const k = Math.floor(s), u = s - k;
  const a: V = k < 0 ? [B_X0, GROUND] : STEPS[Math.min(N - 1, k)];
  const b: V = STEPS[Math.min(N - 1, k + 1)];
  const e = ease.inOut(u);
  const dir = Math.sign(b[0] - a[0]) || 1;
  return { p: [lerp(a[0], b[0], e), lerp(a[1], b[1], e) - Math.sin(u * Math.PI) * 18], dir, hop: u };
};
