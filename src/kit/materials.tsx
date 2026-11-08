// Painted surfaces and light for the kit. Put <KitDefs/> once inside every <svg> that uses the kit; then fill any shape with
// fill="url(#k-brick)" etc. (MAT ids below) or use <Surface>. Every tile is generated from a seed, so it never changes between frames.
// Light is drawn on top as overlays (LightPool, Spot, Shade, Vignette) so one material works in day, night and warm/cool scenes.
import React from "react";
import { rng } from "./core";

export const MAT = {
  brick: "url(#k-brick)", stone: "url(#k-stone)", wood: "url(#k-wood)", boards: "url(#k-boards)", soil: "url(#k-soil)",
  grass: "url(#k-grass)", concrete: "url(#k-concrete)", fabric: "url(#k-fabric)", metal: "url(#k-metal)", tiles: "url(#k-tiles)",
  stars: "url(#k-stars)", asphalt: "url(#k-asphalt)", sand: "url(#k-sand)",
} as const;
export type MatName = keyof typeof MAT;

const hex = (r: number, g: number, b: number) => `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
const jitter = (c: [number, number, number], r: () => number, amt: number) => { const k = (r() - 0.5) * amt; return hex(c[0] * (1 + k), c[1] * (1 + k), c[2] * (1 + k)); };

// ---------------------------------------------------------------- tiles (built once)
const brickTile = (() => {
  const r = rng(11), W = 120, Hh = 56, out: React.ReactNode[] = [];
  out.push(<rect key="m" width={480} height={224} fill="#2b1912" />);
  for (let row = 0; row < 4; row++) {
    const off = row % 2 ? W / 2 : 0;
    for (let c = -1; c < 5; c++) {
      const x = c * W + off + 3, y = row * Hh + 3, w = W - 6, h = Hh - 6, k = `${row}-${c}`;
      const base: [number, number, number] = r() < 0.15 ? [104, 52, 36] : [128, 62, 42];
      out.push(<g key={k}>
        <rect x={x} y={y} width={w} height={h} rx={3} fill={jitter(base, r, 0.35)} />
        <rect x={x} y={y} width={w} height={5} rx={2} fill="#ffffff" opacity={0.10} />
        <rect x={x} y={y + h - 6} width={w} height={6} rx={2} fill="#000" opacity={0.22} />
        {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={x + r() * w} cy={y + 6 + r() * (h - 12)} r={1 + r() * 2.2} fill={r() < 0.5 ? "#000" : "#fff"} opacity={0.12} />)}
      </g>);
    }
  }
  return out;
})();

const stoneTile = (() => {
  const r = rng(23), W = 100, Hh = 60, out: React.ReactNode[] = [<rect key="m" width={400} height={240} fill="#3a3a40" />];
  for (let row = 0; row < 4; row++) {
    const off = row % 2 ? W / 2 : 0;
    for (let c = -1; c < 5; c++) {
      const x = c * W + off + 3, y = row * Hh + 3, w = W - 6, h = Hh - 6, g = 150 + (r() - 0.5) * 34;
      out.push(<g key={`${row}-${c}`}>
        <rect x={x} y={y} width={w} height={h} rx={4} fill={hex(g, g, g + 6)} />
        <path d={`M${x + 2} ${y + h - 2} L${x + 2} ${y + 2} L${x + w - 2} ${y + 2}`} fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={3} />
        <path d={`M${x + 2} ${y + h - 2} L${x + w - 2} ${y + h - 2} L${x + w - 2} ${y + 2}`} fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={4} />
        {r() < 0.3 && <path d={`M${x + w * 0.3} ${y + 4} l8 14 l-5 12`} fill="none" stroke="#000" strokeOpacity={0.3} strokeWidth={2} />}
      </g>);
    }
  }
  return out;
})();

const woodTile = (() => {
  const r = rng(37), out: React.ReactNode[] = [];
  for (let i = 0; i < 4; i++) {
    const x = i * 90, base: [number, number, number] = [112, 76, 46];
    out.push(<rect key={`p${i}`} x={x} y={0} width={90} height={600} fill={jitter(base, r, 0.3)} />);
    for (let g = 0; g < 7; g++) {
      const gx = x + 8 + r() * 74, a = 3 + r() * 6, ph = r() * 6;
      const d = Array.from({ length: 25 }, (_, k) => `${k ? "L" : "M"}${(gx + Math.sin(k * 0.5 + ph) * a).toFixed(1)} ${k * 25}`).join(" ");
      out.push(<path key={`g${i}-${g}`} d={d} fill="none" stroke="#000" strokeOpacity={0.12 + r() * 0.1} strokeWidth={1 + r() * 1.5} />);
    }
    if (r() < 0.7) { const ky = 60 + r() * 480; out.push(<ellipse key={`k${i}`} cx={x + 20 + r() * 50} cy={ky} rx={6} ry={11} fill="none" stroke="#000" strokeOpacity={0.25} strokeWidth={2} />); }
    out.push(<rect key={`s${i}`} x={x} y={0} width={4} height={600} fill="#000" opacity={0.45} />);
    out.push(<rect key={`h${i}`} x={x + 4} y={0} width={3} height={600} fill="#fff" opacity={0.08} />);
    const cut = 150 + r() * 300; out.push(<rect key={`c${i}`} x={x} y={cut} width={90} height={3} fill="#000" opacity={0.4} />);
  }
  return out;
})();

const soilTile = (() => {
  const r = rng(51), out: React.ReactNode[] = [<rect key="b" width={400} height={400} fill="#5b3b22" />];
  for (let i = 0; i < 220; i++) out.push(<circle key={`d${i}`} cx={r() * 400} cy={r() * 400} r={1 + r() * 3} fill={r() < 0.5 ? "#3a2412" : "#7a5534"} opacity={0.6} />);
  for (let i = 0; i < 14; i++) { const x = r() * 400, y = r() * 400, rx = 6 + r() * 14; out.push(<g key={`s${i}`}><ellipse cx={x} cy={y} rx={rx} ry={rx * 0.6} fill="#8a7a6a" /><ellipse cx={x - rx * 0.2} cy={y - rx * 0.2} rx={rx * 0.6} ry={rx * 0.3} fill="#fff" opacity={0.18} /></g>); }
  return out;
})();

const grassTile = (() => {
  const r = rng(63), out: React.ReactNode[] = [<rect key="b" width={300} height={300} fill="#2f6b2a" />];
  for (let i = 0; i < 420; i++) {
    const x = r() * 300, y = r() * 300, l = 6 + r() * 10, a = (r() - 0.5) * 0.8;
    out.push(<line key={i} x1={x} y1={y} x2={x + Math.sin(a) * l} y2={y - Math.cos(a) * l} stroke={r() < 0.5 ? "#3f8a36" : "#24541f"} strokeWidth={1.6} strokeLinecap="round" />);
  }
  return out;
})();

const speckle = (seed: number, size: number, base: string, dots: [string, string], n: number, maxR = 2) => {
  const r = rng(seed), out: React.ReactNode[] = [<rect key="b" width={size} height={size} fill={base} />];
  for (let i = 0; i < n; i++) out.push(<circle key={i} cx={r() * size} cy={r() * size} r={0.6 + r() * maxR} fill={r() < 0.5 ? dots[0] : dots[1]} opacity={0.5} />);
  return out;
};
const concreteTile = speckle(71, 256, "#6d6e72", ["#55565a", "#8a8b90"], 260);
const asphaltTile = speckle(73, 256, "#2a2b2f", ["#1b1c1f", "#4a4b50"], 420, 1.6);
const sandTile = speckle(79, 256, "#d8b878", ["#b89858", "#f0d8a0"], 400, 1.4);

const fabricTile = (() => {
  const out: React.ReactNode[] = [<rect key="b" width={24} height={24} fill="#2d4f8f" />];
  for (let i = 0; i < 4; i++) { out.push(<rect key={`h${i}`} x={0} y={i * 6} width={24} height={2} fill="#fff" opacity={0.06} />); out.push(<rect key={`v${i}`} x={i * 6 + 3} y={0} width={2} height={24} fill="#000" opacity={0.08} />); }
  return out;
})();

const tilesTile = (() => {
  const r = rng(91), out: React.ReactNode[] = [<rect key="b" width={240} height={240} fill="#9aa0a6" />];
  for (let i = 0; i < 3; i++) for (let k = 0; k < 3; k++) { const g = 215 + (r() - 0.5) * 16; out.push(<g key={`${i}${k}`}><rect x={i * 80 + 2} y={k * 80 + 2} width={76} height={76} rx={3} fill={hex(g, g, g + 3)} /><rect x={i * 80 + 6} y={k * 80 + 6} width={30} height={4} rx={2} fill="#fff" opacity={0.5} /></g>); }
  return out;
})();

const starsTile = (() => {
  const r = rng(101), out: React.ReactNode[] = [];
  for (let i = 0; i < 70; i++) out.push(<circle key={i} cx={r() * 500} cy={r() * 500} r={0.5 + Math.pow(r(), 4) * 2.4} fill="#fff" opacity={0.25 + r() * 0.7} />);
  return out;
})();

// ---------------------------------------------------------------- defs
export const KitDefs: React.FC = () => (
  <defs>
    <pattern id="k-brick" patternUnits="userSpaceOnUse" width={480} height={224}>{brickTile}</pattern>
    <pattern id="k-stone" patternUnits="userSpaceOnUse" width={400} height={240}>{stoneTile}</pattern>
    <pattern id="k-wood" patternUnits="userSpaceOnUse" width={360} height={600}>{woodTile}</pattern>
    <pattern id="k-boards" patternUnits="userSpaceOnUse" width={360} height={600} patternTransform="rotate(90)">{woodTile}</pattern>
    <pattern id="k-soil" patternUnits="userSpaceOnUse" width={400} height={400}>{soilTile}</pattern>
    <pattern id="k-grass" patternUnits="userSpaceOnUse" width={300} height={300}>{grassTile}</pattern>
    <pattern id="k-concrete" patternUnits="userSpaceOnUse" width={256} height={256}>{concreteTile}</pattern>
    <pattern id="k-asphalt" patternUnits="userSpaceOnUse" width={256} height={256}>{asphaltTile}</pattern>
    <pattern id="k-sand" patternUnits="userSpaceOnUse" width={256} height={256}>{sandTile}</pattern>
    <pattern id="k-fabric" patternUnits="userSpaceOnUse" width={24} height={24}>{fabricTile}</pattern>
    <pattern id="k-tiles" patternUnits="userSpaceOnUse" width={240} height={240}>{tilesTile}</pattern>
    <pattern id="k-stars" patternUnits="userSpaceOnUse" width={500} height={500}>{starsTile}</pattern>
    <linearGradient id="k-metal" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#d9dde2" /><stop offset="35%" stopColor="#8d939b" /><stop offset="55%" stopColor="#e8ebef" /><stop offset="100%" stopColor="#6a7078" />
    </linearGradient>
    <radialGradient id="k-vig" cx="50%" cy="48%" r="72%"><stop offset="50%" stopColor="#000" stopOpacity={0} /><stop offset="100%" stopColor="#000" stopOpacity={0.75} /></radialGradient>
    <filter id="k-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={3} /><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 1.4 -0.45" /></filter>
    <filter id="k-blur4"><feGaussianBlur stdDeviation={4} /></filter>
    <filter id="k-blur10" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={10} /></filter>
    <filter id="k-blur30" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation={30} /></filter>
  </defs>
);

/** a rectangle of material with built-in light: a top highlight, a darker bottom, optional colour tint (multiply) */
export const Surface: React.FC<{ mat: MatName; x: number; y: number; w: number; h: number; tint?: string; tintA?: number; dark?: number; rx?: number; offset?: [number, number] }> = ({ mat, x, y, w, h, tint, tintA = 0.5, dark = 0.35, rx = 0, offset }) => {
  const id = React.useId().replace(/:/g, "");
  return (
    <g>
      <defs><linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#000" stopOpacity={0} /><stop offset="100%" stopColor="#000" stopOpacity={dark} /></linearGradient></defs>
      <g transform={offset ? `translate(${offset[0]} ${offset[1]})` : undefined}><rect x={x - (offset?.[0] ?? 0)} y={y - (offset?.[1] ?? 0)} width={w} height={h} rx={rx} fill={MAT[mat]} /></g>
      {tint && <rect x={x} y={y} width={w} height={h} rx={rx} fill={tint} opacity={tintA} style={{ mixBlendMode: "multiply" }} />}
      <rect x={x} y={y} width={w} height={h} rx={rx} fill={`url(#${id}s)`} />
    </g>
  );
};

/** a pool of light (screen blend): window light, lamp light, the glow around a hero */
export const LightPool: React.FC<{ cx: number; cy: number; rx: number; ry?: number; color?: string; a?: number }> = ({ cx, cy, rx, ry, color = "#ffd9a0", a = 0.6 }) => {
  const id = React.useId().replace(/:/g, "");
  return (
    <g style={{ mixBlendMode: "screen" }}>
      <defs><radialGradient id={id}><stop offset="0%" stopColor={color} stopOpacity={a} /><stop offset="45%" stopColor={color} stopOpacity={a * 0.35} /><stop offset="100%" stopColor={color} stopOpacity={0} /></radialGradient></defs>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry ?? rx} fill={`url(#${id})`} />
    </g>
  );
};

/** a stage spotlight cone from (x, top) down to a floor ellipse at floorY */
export const Spot: React.FC<{ x: number; top?: number; floorY: number; spread?: number; color?: string; a?: number; tilt?: number }> = ({ x, top = -40, floorY, spread = 280, color = "#ffffff", a = 0.22, tilt = 0 }) => {
  const id = React.useId().replace(/:/g, "");
  const bx = x + tilt;
  return (
    <g style={{ mixBlendMode: "screen" }}>
      <defs>
        <linearGradient id={`${id}c`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={a} /><stop offset="100%" stopColor={color} stopOpacity={a * 0.35} /></linearGradient>
        <radialGradient id={`${id}f`}><stop offset="0%" stopColor={color} stopOpacity={a * 2.2} /><stop offset="100%" stopColor={color} stopOpacity={0} /></radialGradient>
      </defs>
      <path d={`M${x - 40} ${top} L${x + 40} ${top} L${bx + spread} ${floorY} L${bx - spread} ${floorY} Z`} fill={`url(#${id}c)`} filter="url(#k-blur10)" />
      <ellipse cx={bx} cy={floorY} rx={spread * 1.05} ry={spread * 0.16} fill={`url(#${id}f)`} />
    </g>
  );
};

/** dark gradient band (top or bottom) to sink the frame edges */
export const Shade: React.FC<{ y: number; h: number; from?: number; to?: number; color?: string; w?: number; x?: number }> = ({ y, h, from = 0, to = 0.8, color = "#000", w = 1080, x = 0 }) => {
  const id = React.useId().replace(/:/g, "");
  return (
    <g>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={from} /><stop offset="100%" stopColor={color} stopOpacity={to} /></linearGradient></defs>
      <rect x={x} y={y} width={w} height={h} fill={`url(#${id})`} />
    </g>
  );
};

/** mirror of its children under a floor line (shiny floor): fades out over `depth` px, a little blurred */
export const Reflect: React.FC<{ y: number; a?: number; depth?: number; x?: number; w?: number; blur?: boolean; children: React.ReactNode }> = ({ y, a = 0.3, depth = 380, x = -4000, w = 12000, blur = true, children }) => {
  const id = React.useId().replace(/:/g, "");
  return (
    <g>
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1={y} x2="0" y2={y + depth} gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#fff" stopOpacity={a} /><stop offset="100%" stopColor="#fff" stopOpacity={0} /></linearGradient>
        <mask id={`${id}m`} maskUnits="userSpaceOnUse" x={x} y={y} width={w} height={depth}><rect x={x} y={y} width={w} height={depth} fill={`url(#${id}g)`} /></mask>
      </defs>
      <g mask={`url(#${id}m)`} filter={blur ? "url(#k-blur4)" : undefined}><g transform={`translate(0 ${2 * y}) scale(1 -1)`}>{children}</g></g>
    </g>
  );
};

export const Vignette: React.FC<{ a?: number }> = ({ a = 1 }) => <rect x={0} y={0} width={1080} height={1920} fill="url(#k-vig)" opacity={a} />;
/** film grain: a different noise every frame (seed = frame) */
export const Grain: React.FC<{ f: number; a?: number }> = ({ f, a = 0.07 }) => (
  <g opacity={a}>
    <filter id={`k-grain-${f % 9}`} x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f % 9} /><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.6 -0.55" /></filter>
    <rect x={0} y={0} width={1080} height={1920} filter={`url(#k-grain-${f % 9})`} style={{ mixBlendMode: "overlay" }} />
  </g>
);

/** animated water body: gradient + moving wave lines + glints; `top` is the water line */
export const Water: React.FC<{ f: number; x: number; top: number; w: number; h: number; deep?: string; shallow?: string; calm?: number }> = ({ f, x, top, w, h, deep = "#0c2f5c", shallow = "#2a7fc0", calm = 1 }) => {
  const id = React.useId().replace(/:/g, "");
  const r = rng(5);
  const lines = Array.from({ length: 26 }, () => ({ y: r(), x: r(), l: 30 + r() * 90, sp: 0.4 + r() * 0.9, ph: r() * 6 }));
  const surf = Array.from({ length: Math.ceil(w / 20) + 2 }, (_, i) => `${i ? "L" : "M"}${x + i * 20} ${top + Math.sin(i * 0.55 + f * 0.09) * 6 * calm + Math.sin(i * 0.21 - f * 0.05) * 4 * calm}`).join(" ");
  return (
    <g>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={shallow} /><stop offset="100%" stopColor={deep} /></linearGradient></defs>
      <path d={`${surf} L${x + w + 20} ${top + h} L${x} ${top + h} Z`} fill={`url(#${id})`} />
      <path d={surf} fill="none" stroke="#bfe4ff" strokeWidth={4} opacity={0.75} />
      {lines.map((l, i) => {
        const yy = top + 20 + l.y * (h - 40), xx = x + ((l.x * w + f * l.sp * 2) % w), a = 0.08 + 0.18 * (1 - l.y);
        return <path key={i} d={`M${xx} ${yy} q${l.l / 4} ${-4} ${l.l / 2} 0 t${l.l / 2} 0`} fill="none" stroke="#dff2ff" strokeWidth={2.5} opacity={a * (0.6 + 0.4 * Math.sin(f * 0.1 + l.ph))} />;
      })}
    </g>
  );
};
