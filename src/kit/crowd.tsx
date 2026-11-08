// Crowds for the kit.
//  <Crowd>   : a perspective block of simple people (head + body + legs) shrinking toward a vanishing point, far rows greyer;
//              each person bobs, some cheer (arms up) on a seeded schedule. Hundreds of people stay cheap (no IK).
//  <Stands>  : stadium stands: thousands of tiny seated fans as dots, with camera flashes and banners.
//  <Group>   : n full <Hero> figures in rows with their own phase offsets (marching, walking together).
import React from "react";
import { V, clamp, hash, lerp, rng } from "./core";
import { Hero, HeroLook, LOOK_GREY, Pose } from "./hero";

const INK = "#0b0b0d";

/** one simple person, feet at (0,0), height ~ 420 at s=1 */
const Pawn: React.FC<{ s: number; tone: number; arms: number; bob: number; lean: number }> = ({ s, tone, arms, bob, lean }) => {
  const c = `rgb(${tone},${tone},${tone})`, cf = `rgb(${tone * 0.78},${tone * 0.78},${tone * 0.78})`;
  const hipY = -190 + bob, shY = hipY - 120;
  const armA = lerp(8, 160, arms);
  const armEnd = (side: number): V => [side * Math.sin((armA * Math.PI) / 180) * 130, shY + 6 + Math.cos((armA * Math.PI) / 180) * 130];
  const st = { fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const line = (pts: V[], col: string, w: number) => <g {...st}><polyline points={pts.map((p) => p.join(",")).join(" ")} stroke={INK} strokeWidth={w + 6} /><polyline points={pts.map((p) => p.join(",")).join(" ")} stroke={col} strokeWidth={w} /></g>;
  return (
    <g transform={`scale(${s}) skewX(${lean})`}>
      {line([[-10, 0], [-6, hipY]], cf, 17)}
      {line([[-4, shY + 10], armEnd(-1)], cf, 15)}
      {line([[0, hipY], [0, shY]], c, 20)}
      {line([[12, 0], [6, hipY]], c, 17)}
      {line([[4, shY + 10], armEnd(1)], c, 15)}
      <circle cx={0} cy={shY - 42} r={36} fill={c} stroke={INK} strokeWidth={3} />
    </g>
  );
};

export const Crowd: React.FC<{
  f: number; rows: number; cols: number;
  /** front row: centre x, ground y, spacing between people */ x: number; y: number; gap?: number;
  /** vanishing point */ vp?: V; depth?: number;
  s?: number; seed?: number; cheer?: number; bob?: number; jitter?: number; dark?: number;
  /** skip people inside this screen box (to clear a path) */ hole?: (x: number, y: number) => boolean;
}> = ({ f, rows, cols, x, y, gap = 70, vp = [540, 700], depth = 0.16, s = 0.5, seed = 1, cheer = 0, bob = 1, jitter = 0.35, dark = 0.55, hole }) => {
  const r = rng(seed), people: { k: number; sx: number; sy: number; sc: number; tone: number; ph: number; ch: number }[] = [];
  for (let row = rows - 1; row >= 0; row--) {
    const sc = 1 / (1 + row * depth);
    for (let c = 0; c < cols; c++) {
      const jx = (r() - 0.5) * gap * jitter, jy = (r() - 0.5) * 20 * jitter;
      const wx = x + (c - (cols - 1) / 2) * gap + jx + (row % 2 ? gap / 2 : 0);
      const sx = vp[0] + (wx - vp[0]) * sc, sy = vp[1] + (y + jy - vp[1]) * sc;
      const ph = r() * 6.28, ch = r();
      if (hole?.(sx, sy)) continue;
      const tone = Math.round(lerp(238, 238 * (1 - dark), clamp(row / Math.max(1, rows - 1))));
      people.push({ k: row * 1000 + c, sx, sy, sc, tone, ph, ch });
    }
  }
  return (
    <g>
      {people.map((p) => {
        const on = cheer > 0 && hash(p.k + Math.floor((f + p.ph * 10) / 24)) < cheer;
        const arms = on ? 0.55 + 0.45 * Math.abs(Math.sin(f * 0.3 + p.ph)) : 0;
        const b = (on ? Math.abs(Math.sin(f * 0.3 + p.ph)) * -24 : Math.sin(f * 0.06 + p.ph) * 3) * bob;
        return <g key={p.k} transform={`translate(${p.sx} ${p.sy})`}><Pawn s={s * p.sc} tone={p.tone} arms={arms} bob={b} lean={Math.sin(f * 0.03 + p.ph) * 1.5} /></g>;
      })}
    </g>
  );
};

/** stadium stands: a band from y0 to y1 of tiny fans; colour from a palette; flashes twinkle; optional red banners */
export const Stands: React.FC<{ f: number; x?: number; w?: number; y0: number; y1: number; seed?: number; palette?: string[]; flashes?: number; banners?: number; lit?: number }> = ({ f, x = -200, w = 1480, y0, y1, seed = 3, palette = ["#d8d8dc", "#9a9aa2", "#6a6a72", "#c43a3a", "#ececec"], flashes = 0.004, banners = 6, lit = 1 }) => {
  const r = rng(seed), rows: React.ReactNode[] = [];
  const nRows = Math.round((y1 - y0) / 14);
  for (let i = 0; i < nRows; i++) {
    const t = i / nRows, yy = y0 + (y1 - y0) * t, size = lerp(3.2, 6.5, t), step = size * 2.3;
    const cells: React.ReactNode[] = [];
    for (let xx = x + (i % 2) * step * 0.5; xx < x + w; xx += step) {
      const c = palette[Math.floor(r() * palette.length)], k = i * 9973 + Math.round(xx);
      const jump = hash(k + Math.floor(f / 6)) < 0.08 ? -size * 0.8 : 0;
      cells.push(<g key={xx}><rect x={xx - size * 0.6} y={yy + jump} width={size * 1.2} height={size * 1.8} rx={size * 0.4} fill={c} opacity={0.75 * lit} /><circle cx={xx} cy={yy - size * 0.55 + jump} r={size * 0.55} fill={c} opacity={0.9 * lit} /></g>);
      if (hash(k * 1.3 + f * 0.917) < flashes) cells.push(<circle key={`f${xx}`} cx={xx} cy={yy} r={size * 3} fill="#fff" opacity={0.95} />);
    }
    rows.push(<g key={i}>{cells}</g>);
  }
  return (
    <g>
      <rect x={x} y={y0 - 20} width={w} height={y1 - y0 + 40} fill="#141418" />
      {rows}
      {Array.from({ length: banners }, (_, i) => { const bx = x + 80 + hash(i + seed) * (w - 200), by = y0 + hash(i * 7 + seed) * (y1 - y0) * 0.8, wv = Math.sin(f * 0.15 + i) * 4; return <rect key={`b${i}`} x={bx} y={by + wv} width={90} height={26} rx={3} fill="#e0303a" opacity={0.9} />; })}
      <rect x={x} y={y1 + 6} width={w} height={14} fill="#c43a3a" /><rect x={x} y={y1 + 20} width={w} height={6} fill="#ffffff" opacity={0.6} />
    </g>
  );
};

/** n heroes in formation, each with its own pose function (phase offset) */
export const Group: React.FC<{ n: number; x: number; y: number; dx?: number; dy?: number; pose: (i: number) => Pose; s?: number; flip?: boolean; look?: HeroLook; depthTone?: boolean }> = ({ n, x, y, dx = 70, dy = -14, pose, s = 0.6, flip, look = LOOK_GREY, depthTone = true }) => (
  <g>
    {Array.from({ length: n }, (_, k) => n - 1 - k).map((i) => {
      const g = depthTone ? Math.round(200 - i * (90 / Math.max(1, n))) : 200;
      return <Hero key={i} x={x - i * dx * (flip ? -1 : 1)} y={y + i * dy} pose={pose(i)} s={s * (1 - i * 0.02)} flip={flip} look={{ ...look, body: `rgb(${g},${g},${g})`, far: `rgb(${g * 0.7},${g * 0.7},${g * 0.7})` }} shadow={0.25} />;
    })}
  </g>
);
