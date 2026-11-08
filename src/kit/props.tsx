// Props of the kit. Two looks, like the reference style:
//  - SOLID: shaded shapes with a thin black outline (materials from materials.tsx, a top highlight, a darker underside);
//  - LINE: thin glowing white line art (cars, houses) for "idea" scenes.
// Unless said otherwise (x, y) is the point where the prop touches the ground (bottom centre), `s` scales it, f = frame for anything that moves.
import React from "react";
import { V, clamp, ease, hash, lerp, poly, rng } from "./core";
import { MAT, MatName } from "./materials";

export const INK = "#0b0b0d";
const OL = 3;
const T = (x: number, y: number, s = 1, r = 0) => `translate(${x} ${y}) rotate(${r}) scale(${s})`;

/** a white glow copy behind line art */
const LineGlow: React.FC<{ children: React.ReactNode; a?: number; color?: string }> = ({ children, a = 0.6, color = "#ffffff" }) => (
  <g>
    <g opacity={a} filter="url(#k-blur4)" stroke={color}>{children}</g>
    <g stroke={color}>{children}</g>
  </g>
);

// ---------------------------------------------------------------- vehicles and buildings
export const Car: React.FC<{ x: number; y: number; s?: number; f?: number; look?: "line" | "solid"; color?: string; lights?: boolean; flip?: boolean; speed?: number }> = ({ x, y, s = 1, f = 0, look = "solid", color = "#c23a3a", lights, flip, speed = 0 }) => {
  const spin = (f * speed * 180) / (Math.PI * 34);
  const body = "M-190 -40 L-190 -86 Q-186 -100 -168 -102 L-110 -106 L-66 -150 Q-58 -158 -44 -158 L70 -158 Q86 -158 96 -148 L138 -106 L176 -100 Q196 -96 198 -78 L198 -40 Z";
  const win = "M-98 -108 L-58 -146 L-2 -146 L-2 -108 Z M8 -108 L8 -146 L66 -146 Q78 -146 86 -138 L118 -108 Z";
  const wheel = (cx: number) => (
    <g transform={`translate(${cx} -34)`}>
      <circle r={36} fill={look === "line" ? "none" : "#1a1a1e"} strokeWidth={look === "line" ? 3 : OL} stroke={look === "line" ? undefined : INK} />
      <g transform={`rotate(${spin})`}>
        <circle r={17} fill={look === "line" ? "none" : "#b8bcc4"} strokeWidth={3} stroke={look === "line" ? undefined : INK} />
        {[0, 72, 144, 216, 288].map((a) => <line key={a} x1={0} y1={0} x2={0} y2={-15} transform={`rotate(${a})`} strokeWidth={3} stroke={look === "line" ? undefined : "#55585e"} />)}
      </g>
    </g>
  );
  if (look === "line") return (
    <g transform={`${T(x, y, s)} scale(${flip ? -1 : 1} 1)`} fill="none" strokeWidth={3} strokeLinejoin="round">
      <LineGlow><path d={body} /><path d={win} />{wheel(-118)}{wheel(124)}<line x1={-30} y1={-80} x2={-12} y2={-80} /><line x1={60} y1={-80} x2={78} y2={-80} /></LineGlow>
      {lights && <path d="M198 -76 L520 -130 L520 -10 Z" fill="#fff6d0" opacity={0.18} stroke="none" />}
    </g>
  );
  return (
    <g transform={`${T(x, y, s)} scale(${flip ? -1 : 1} 1)`}>
      <ellipse cx={0} cy={2} rx={210} ry={12} fill="#000" opacity={0.45} />
      <path d={body} fill={color} stroke={INK} strokeWidth={OL} strokeLinejoin="round" />
      <path d="M-186 -88 L194 -88" stroke="#fff" strokeOpacity={0.25} strokeWidth={5} />
      <path d="M-190 -60 L198 -60 L198 -40 L-190 -40 Z" fill="#000" opacity={0.25} />
      <path d={win} fill="#9fc3e0" stroke={INK} strokeWidth={OL} strokeLinejoin="round" />
      <path d="M-80 -112 L-52 -140 L-40 -140 L-68 -112 Z" fill="#fff" opacity={0.5} />
      <rect x={178} y={-92} width={20} height={14} rx={4} fill={lights ? "#fff6c0" : "#e8e2c0"} stroke={INK} strokeWidth={2} />
      <rect x={-192} y={-92} width={14} height={14} rx={3} fill="#ff4a4a" stroke={INK} strokeWidth={2} />
      {wheel(-118)}{wheel(124)}
      {lights && <path d="M198 -84 L560 -150 L560 -10 Z" fill="#fff6d0" opacity={0.2} style={{ mixBlendMode: "screen" }} />}
    </g>
  );
};

export const House: React.FC<{ x: number; y: number; s?: number; look?: "line" | "solid"; lit?: number; smoke?: number; f?: number; wall?: MatName; roof?: string }> = ({ x, y, s = 1, look = "solid", lit = 0, smoke = 0, f = 0, wall = "brick", roof = "#3c3f48" }) => {
  const W = 300, Hh = 220;
  const winR = [[-110, -170], [50, -170]] as V[];
  if (look === "line") return (
    <g transform={T(x, y, s)} fill="none" strokeWidth={3} strokeLinejoin="round">
      <LineGlow>
        <path d={`M${-W / 2} 0 L${-W / 2} ${-Hh} L0 ${-Hh - 130} L${W / 2} ${-Hh} L${W / 2} 0 Z`} />
        <path d={`M${-W / 2 - 24} ${-Hh + 14} L0 ${-Hh - 150} L${W / 2 + 24} ${-Hh + 14}`} />
        <rect x={-30} y={-110} width={60} height={110} />
        {winR.map(([wx, wy], i) => <rect key={i} x={wx} y={wy} width={60} height={56} />)}
        <path d={`M70 ${-Hh - 70} L70 ${-Hh - 120} L100 ${-Hh - 120} L100 ${-Hh - 50}`} />
      </LineGlow>
      {lit > 0 && winR.map(([wx, wy], i) => <rect key={i} x={wx} y={wy} width={60} height={56} fill="#ffd27a" opacity={lit} stroke="none" />)}
    </g>
  );
  return (
    <g transform={T(x, y, s)}>
      <rect x={-W / 2} y={-Hh} width={W} height={Hh} fill={MAT[wall]} stroke={INK} strokeWidth={OL} />
      <rect x={-W / 2} y={-Hh} width={W} height={Hh} fill="url(#k-vig)" opacity={0.0} />
      <path d={`M${-W / 2 - 26} ${-Hh + 6} L0 ${-Hh - 140} L${W / 2 + 26} ${-Hh + 6} Z`} fill={roof} stroke={INK} strokeWidth={OL} strokeLinejoin="round" />
      <path d={`M${-W / 2 - 10} ${-Hh - 4} L0 ${-Hh - 124}`} stroke="#fff" strokeOpacity={0.2} strokeWidth={6} />
      <rect x={66} y={-Hh - 120} width={34} height={70} fill="#5a5d66" stroke={INK} strokeWidth={OL} />
      <rect x={-34} y={-116} width={68} height={116} rx={4} fill="#5b3a22" stroke={INK} strokeWidth={OL} /><circle cx={20} cy={-56} r={4} fill="#e8c860" />
      {winR.map(([wx, wy], i) => (
        <g key={i}>
          <rect x={wx} y={wy} width={60} height={56} fill={lit > 0 ? `rgb(${lerp(40, 255, lit)},${lerp(44, 214, lit)},${lerp(56, 130, lit)})` : "#2a2d38"} stroke={INK} strokeWidth={OL} />
          <line x1={wx + 30} y1={wy} x2={wx + 30} y2={wy + 56} stroke={INK} strokeWidth={2.5} /><line x1={wx} y1={wy + 28} x2={wx + 60} y2={wy + 28} stroke={INK} strokeWidth={2.5} />
        </g>
      ))}
      {smoke > 0 && Array.from({ length: 6 }, (_, i) => { const t = ((f * 0.6 + i * 18) % 108) / 108; return <circle key={i} cx={83 + Math.sin(t * 6 + i) * 14 + t * 30} cy={-Hh - 130 - t * 200} r={14 + t * 30} fill="#cfcfd4" opacity={smoke * 0.45 * (1 - t)} />; })}
    </g>
  );
};

/** a castle that builds itself brick by brick as p goes 0 -> 1 (bottom rows first); `glow` lights the windows */
export const Castle: React.FC<{ x: number; y: number; s?: number; p?: number; glow?: number; flagF?: number }> = ({ x, y, s = 1, p = 1, glow = 0, flagF = 0 }) => {
  const BW = 46, BH = 30;
  // blocks: main keep 8 wide x 10 high, two towers 4 wide x 15 high
  const parts: { x0: number; w: number; h: number }[] = [{ x0: -4, w: 8, h: 10 }, { x0: -9, w: 4, h: 15 }, { x0: 5, w: 4, h: 15 }];
  const bricks: { x: number; y: number; row: number; k: number }[] = [];
  parts.forEach((pt) => { for (let r = 0; r < pt.h; r++) for (let c = 0; c < pt.w; c++) bricks.push({ x: (pt.x0 + c) * BW + (r % 2 ? BW / 2 : 0) * 0, y: -(r + 1) * BH, row: r, k: bricks.length }); });
  bricks.sort((a, b) => a.row - b.row || hash(a.k) - hash(b.k));
  const shown = Math.floor(bricks.length * clamp(p)), next = bricks.length * clamp(p) - shown;
  const roofP = clamp((p - 0.92) / 0.08);
  return (
    <g transform={T(x, y, s)}>
      {bricks.slice(0, shown + 1).map((b, i) => {
        const drop = i === shown ? (1 - ease.out(next)) * -160 : 0, op = i === shown ? next : 1;
        const g = 150 + (hash(b.k * 3) - 0.5) * 36;
        return (
          <g key={b.k} opacity={op} transform={`translate(0 ${drop})`}>
            <rect x={b.x + 1} y={b.y + 1} width={BW - 2} height={BH - 2} rx={3} fill={`rgb(${g},${g},${g + 6})`} stroke={INK} strokeWidth={2.5} />
            <rect x={b.x + 4} y={b.y + 4} width={BW - 10} height={4} rx={2} fill="#fff" opacity={0.3} />
          </g>
        );
      })}
      {/* windows and gate appear with their rows */}
      {p > 0.25 && <path d={`M-40 0 L-40 -86 Q0 -126 40 -86 L40 0 Z`} fill="#121216" stroke={INK} strokeWidth={OL} />}
      {[[-7.2, -9], [6.8, -9], [-7.2, -13], [6.8, -13], [-1.5, -7], [0.5, -7]].map(([cx, r], i) => (p > (Math.abs(r) / 15) * 0.9 ? <rect key={i} x={cx * BW} y={r * BH} width={24} height={40} rx={10} fill={glow > 0 ? `rgba(255,214,120,${0.25 + 0.75 * glow})` : "#121216"} stroke={INK} strokeWidth={2.5} /> : null))}
      {roofP > 0 && [-9, 5].map((x0) => (
        <g key={x0} opacity={roofP} transform={`translate(0 ${(1 - roofP) * -60})`}>
          <path d={`M${x0 * BW - 12} ${-15 * BH} L${(x0 + 2) * BW} ${-15 * BH - 150} L${(x0 + 4) * BW + 12} ${-15 * BH} Z`} fill="#2f3345" stroke={INK} strokeWidth={OL} strokeLinejoin="round" />
          <path d={`M${x0 * BW} ${-15 * BH - 4} L${(x0 + 2) * BW} ${-15 * BH - 140}`} stroke="#fff" strokeOpacity={0.22} strokeWidth={6} />
        </g>
      ))}
      {roofP >= 1 && <Flag x={-7 * BW} y={-15 * BH - 150} f={flagF} s={0.7} color="#e8c040" />}
    </g>
  );
};

// ---------------------------------------------------------------- money and value
export const MoneyPile: React.FC<{ x: number; y: number; w?: number; h?: number; seed?: number; f?: number }> = ({ x, y, w = 360, h = 170, seed = 1, f = 0 }) => {
  const r = rng(seed), n = Math.round((w * h) / 380);
  const items = Array.from({ length: n }, () => { const u = r(), v = Math.pow(r(), 0.8); const half = Math.sqrt(1 - v * v); return { x: (u - 0.5) * 2 * half * w * 0.5, y: -v * h * (1 - Math.abs(u - 0.5) * 0.3), rot: (r() - 0.5) * 70, c: r(), coin: r() < 0.12 }; });
  items.sort((a, b) => a.y - b.y < 0 ? 1 : -1);
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={4} rx={w * 0.56} ry={18} fill="#000" opacity={0.5} />
      <path d={`M${-w / 2} 0 Q${-w * 0.25} ${-h * 1.05} 0 ${-h} Q${w * 0.25} ${-h * 1.05} ${w / 2} 0 Z`} fill="#24552b" stroke={INK} strokeWidth={OL} />
      {items.map((it, i) => it.coin
        ? <g key={i} transform={`translate(${it.x} ${it.y})`}><ellipse rx={12} ry={6} fill="#f2c13b" stroke="#6a4a10" strokeWidth={2} /></g>
        : <g key={i} transform={`translate(${it.x} ${it.y}) rotate(${it.rot})`}><rect x={-22} y={-8} width={44} height={16} rx={2} fill={it.c < 0.5 ? "#3f8f4a" : "#4ea55a"} stroke="#14361a" strokeWidth={1.8} /><circle r={3.5} fill="#a8e0aa" opacity={0.7} /></g>)}
      {[0, 1, 2].map((k) => { const t = ((f + k * 37) % 90) / 90; const sx = (hash(k + Math.floor((f + k * 37) / 90)) - 0.5) * w * 0.6; return <circle key={k} cx={sx} cy={-h * 0.5 - t * 10} r={3 + 6 * Math.sin(t * Math.PI)} fill="#fff" opacity={Math.sin(t * Math.PI) * 0.8} />; })}
    </g>
  );
};
export const GoldBars: React.FC<{ x: number; y: number; s?: number; n?: number }> = ({ x, y, s = 1, n = 3 }) => (
  <g transform={T(x, y, s)}>
    {Array.from({ length: n }, (_, i) => { const row = i < 2 ? 0 : 1, cx = row ? 0 : (i - 0.5) * 60; return (
      <g key={i} transform={`translate(${cx} ${-row * 26})`}>
        <path d="M-30 0 L-22 -24 L22 -24 L30 0 Z" fill="#e7b52f" stroke="#5a3e08" strokeWidth={2.5} /><path d="M-20 -21 L20 -21" stroke="#fff3b8" strokeWidth={3} />
      </g>); })}
  </g>
);

// ---------------------------------------------------------------- climbing and goals
/** steps going up-right from (x, y): n steps of size (sw, sh); colours cycle (empty = stone) */
export const Stairs: React.FC<{ x: number; y: number; n: number; sw?: number; sh?: number; colors?: string[]; p?: number; mat?: MatName }> = ({ x, y, n, sw = 90, sh = 60, colors, p = 1, mat = "stone" }) => (
  <g>
    {Array.from({ length: Math.ceil(n * p) }, (_, i) => {
      const op = clamp(n * p - i), sx = x + i * sw, sy = y - (i + 1) * sh, c = colors?.[i % colors.length];
      return (
        <g key={i} opacity={op} transform={`translate(0 ${(1 - op) * 30})`}>
          <rect x={sx} y={sy} width={sw} height={(i + 1) * sh} fill={c ?? MAT[mat]} stroke={INK} strokeWidth={OL} />
          <rect x={sx + 3} y={sy + 3} width={sw - 6} height={6} fill="#fff" opacity={0.3} />
        </g>
      );
    })}
  </g>
);
/** floating step bricks (a ladder of slabs) up a wall: centre x, from y upward, gap px */
export const Slabs: React.FC<{ x: number; y: number; n: number; gap?: number; w?: number; colors?: string[]; p?: number; f?: number }> = ({ x, y, n, gap = 80, w = 70, colors = ["#e0a030", "#4aa0e0", "#c04ad0", "#40c070", "#e05050"], p = 1, f = 0 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const op = clamp(n * p - i); if (op <= 0) return null;
      const sy = y - i * gap + (1 - ease.back(op)) * 40, c = colors[i % colors.length];
      return (
        <g key={i} opacity={Math.min(1, op * 2)}>
          <rect x={x - w / 2} y={sy - 10} width={w} height={20} rx={4} fill={c} stroke={INK} strokeWidth={OL} />
          <rect x={x - w / 2 + 4} y={sy - 7} width={w - 8} height={4} rx={2} fill="#fff" opacity={0.45} />
          <ellipse cx={x} cy={sy + 6} rx={w * 0.6} ry={8} fill={c} opacity={0.25 + 0.1 * Math.sin(f * 0.1 + i)} style={{ mixBlendMode: "screen" }} />
        </g>
      );
    })}
  </g>
);
export const Ladder: React.FC<{ x: number; y: number; h: number; w?: number; rung?: number; color?: string }> = ({ x, y, h, w = 80, rung = 70, color = "#8a6a44" }) => (
  <g stroke={INK} strokeWidth={OL}>
    {Array.from({ length: Math.floor(h / rung) }, (_, i) => <rect key={i} x={x - w / 2} y={y - (i + 1) * rung} width={w} height={10} fill={color} />)}
    <rect x={x - w / 2 - 12} y={y - h} width={12} height={h} fill={color} /><rect x={x + w / 2} y={y - h} width={12} height={h} fill={color} />
  </g>
);
export const Flag: React.FC<{ x: number; y: number; f: number; s?: number; color?: string; pole?: number }> = ({ x, y, f, s = 1, color = "#e03a3a", pole = 160 }) => {
  const pts = Array.from({ length: 9 }, (_, i) => { const t = i / 8; return [8 + t * 110, -pole + Math.sin(f * 0.22 - t * 4) * 8 * t] as V; });
  const bottom = pts.slice().reverse().map(([px, py]) => [px, py + 70] as V);
  return (
    <g transform={T(x, y, s)}>
      <rect x={-4} y={-pole - 8} width={8} height={pole + 8} rx={3} fill="#c8c8cc" stroke={INK} strokeWidth={2.5} />
      <circle cx={0} cy={-pole - 10} r={7} fill="#e8d070" stroke={INK} strokeWidth={2.5} />
      <path d={`${poly(...pts)} L${poly(...bottom).slice(1)} Z`} fill={color} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
      <path d={poly(...pts.map(([px, py]) => [px, py + 8] as V))} fill="none" stroke="#fff" strokeOpacity={0.3} strokeWidth={4} />
    </g>
  );
};
export const Trophy: React.FC<{ x: number; y: number; s?: number; f?: number }> = ({ x, y, s = 1, f = 0 }) => (
  <g transform={T(x, y, s)} stroke={INK} strokeWidth={OL} strokeLinejoin="round">
    <rect x={-40} y={-26} width={80} height={26} rx={4} fill="#5a3a22" />
    <rect x={-10} y={-70} width={20} height={44} fill="#e7b52f" />
    <path d="M-50 -160 L50 -160 Q48 -88 0 -70 Q-48 -88 -50 -160 Z" fill="#f2c13b" />
    <path d="M-50 -150 Q-86 -146 -78 -112 Q-70 -92 -40 -98" fill="none" strokeWidth={9} stroke="#c8961e" /><path d="M50 -150 Q86 -146 78 -112 Q70 -92 40 -98" fill="none" strokeWidth={9} stroke="#c8961e" />
    <path d="M-32 -150 Q-30 -110 -10 -90" fill="none" stroke="#fff6c0" strokeWidth={6} opacity={0.7} />
    <circle cx={30} cy={-140} r={5 + 3 * Math.sin(f * 0.2)} fill="#fff" stroke="none" opacity={0.9} />
  </g>
);

// ---------------------------------------------------------------- symbolic objects
export const Door: React.FC<{ x: number; y: number; s?: number; open?: number; light?: string; frame?: string }> = ({ x, y, s = 1, open = 0, light = "#ffe2a8", frame = "#2a2a30" }) => (
  <g transform={T(x, y, s)}>
    <rect x={-70} y={-300} width={140} height={300} fill={light} />
    {open > 0 && <path d={`M-70 0 L70 0 L${70 + 420 * open} 260 L${-70 - 160 * open} 260 Z`} fill={light} opacity={0.35 * open} style={{ mixBlendMode: "screen" }} />}
    <path d={`M-70 -300 L${-70 + 140 * (1 - open)} ${-300 - 24 * open} L${-70 + 140 * (1 - open)} ${24 * open} L-70 0 Z`} fill="#3a2a1e" stroke={INK} strokeWidth={OL} />
    <rect x={-80} y={-310} width={160} height={310} fill="none" stroke={frame} strokeWidth={16} />
    <rect x={-80} y={-310} width={160} height={310} fill="none" stroke={INK} strokeWidth={OL} />
  </g>
);
export const Rock: React.FC<{ x: number; y: number; w?: number; h?: number; label?: string; seed?: number }> = ({ x, y, w = 220, h = 110, label, seed = 3 }) => {
  const r = rng(seed);
  const pts = Array.from({ length: 12 }, (_, i) => { const a = Math.PI + (i / 11) * Math.PI; const k = 0.82 + r() * 0.25; return [Math.cos(a) * w / 2 * k, Math.sin(a) * h * k] as V; });
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={4} rx={w * 0.58} ry={14} fill="#000" opacity={0.55} />
      <path d={`${poly(...pts)} Z`} fill="#6c6c72" stroke={INK} strokeWidth={OL} strokeLinejoin="round" />
      <path d={`${poly(...pts.slice(1, 7).map(([px, py]) => [px * 0.8, py * 0.86] as V))}`} fill="none" stroke="#fff" strokeOpacity={0.25} strokeWidth={8} strokeLinecap="round" />
      <path d={`M${-w * 0.1} ${-h * 0.3} l18 16 l-6 18`} fill="none" stroke={INK} strokeOpacity={0.5} strokeWidth={3} />
      {label && <text x={0} y={-h * 0.36} textAnchor="middle" fontFamily='"Arial Black", Impact, sans-serif' fontSize={26} letterSpacing={1} fill="#ececec">{label}</text>}
    </g>
  );
};
/** a hanging rope / chain from a to b with sag; `chain` draws links */
export const Rope: React.FC<{ a: V; b: V; sag?: number; color?: string; chain?: boolean; w?: number; f?: number }> = ({ a, b, sag = 40, color = "#c03030", chain, w = 6, f = 0 }) => {
  const mid: V = [(a[0] + b[0]) / 2 + Math.sin(f * 0.07) * sag * 0.15, (a[1] + b[1]) / 2 + sag];
  const d = `M${a[0]} ${a[1]} Q${mid[0]} ${mid[1]} ${b[0]} ${b[1]}`;
  return chain
    ? <g fill="none"><path d={d} stroke={INK} strokeWidth={w + 6} strokeDasharray="16 6" /><path d={d} stroke={color} strokeWidth={w} strokeDasharray="14 8" strokeLinecap="round" /></g>
    : <g fill="none"><path d={d} stroke={INK} strokeWidth={w + 4} strokeLinecap="round" /><path d={d} stroke={color} strokeWidth={w} strokeLinecap="round" /><path d={d} stroke="#000" strokeOpacity={0.3} strokeWidth={w * 0.4} strokeDasharray="5 7" /></g>;
};
/** a pair of feathered wings centred at (x, y) (put it at the hero's shoulders via Hero.behind); flap = phase in turns */
export const Wings: React.FC<{ x: number; y: number; s?: number; flap?: number; open?: number; glow?: number }> = ({ x, y, s = 1, flap = 0, open = 1, glow = 0.6 }) => {
  // one wing (pointing +x): a curved bone from the shoulder to the tip, three layers of feathers hanging from it,
  // longest at the tip. The whole wing rotates up/down with the flap; folded (open=0) it lies along the back.
  const wing = (side: number) => {
    const ang = lerp(-75, 8 + Math.sin(flap * Math.PI * 2) * 30, open);
    const bone = (t: number): V => [t * 190, -Math.sin(t * Math.PI * 0.9) * 46 - t * 20];
    const layer = (n: number, len0: number, len1: number, w: number, fill: string, t0: number) =>
      Array.from({ length: n }, (_, i) => {
        const t = t0 + (1 - t0) * (i / (n - 1)), [bx, by] = bone(t), len = lerp(len0, len1, t), a = lerp(70, 18, t);
        return <path key={i} transform={`translate(${bx} ${by}) rotate(${a})`} d={`M0 ${-w} Q${len * 0.55} ${-w * 1.2} ${len} 0 Q${len * 0.55} ${w * 1.2} 0 ${w} Z`} fill={fill} stroke={INK} strokeWidth={2.2} strokeLinejoin="round" />;
      });
    return (
      <g transform={`scale(${side} 1) rotate(${-ang})`}>
        {layer(9, 70, 150, 13, "#e2e2e2", 0.1)}
        {layer(8, 46, 90, 12, "#efefef", 0.05)}
        {layer(7, 28, 44, 11, "#fafafa", 0.0)}
        <path d={poly(...Array.from({ length: 9 }, (_, i) => bone(i / 8)))} fill="none" stroke={INK} strokeWidth={16} strokeLinecap="round" />
        <path d={poly(...Array.from({ length: 9 }, (_, i) => bone(i / 8)))} fill="none" stroke="#ffffff" strokeWidth={10} strokeLinecap="round" />
      </g>
    );
  };
  return (
    <g transform={T(x, y, s)}>
      {glow > 0 && <g filter="url(#k-blur10)" opacity={glow}><ellipse cx={0} cy={-20} rx={200 * open} ry={90} fill="#fff" /></g>}
      {wing(1)}{wing(-1)}
    </g>
  );
};
export const Seesaw: React.FC<{ x: number; y: number; angle: number; len?: number }> = ({ x, y, angle, len = 640 }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M-70 0 Q-60 -90 0 -96 Q60 -90 70 0 Z" fill="#6c6c72" stroke={INK} strokeWidth={OL} />
    <path d="M-40 -60 Q-20 -84 10 -86" fill="none" stroke="#fff" strokeOpacity={0.25} strokeWidth={8} strokeLinecap="round" />
    <g transform={`translate(0 -96) rotate(${angle})`}>
      <rect x={-len / 2} y={-14} width={len} height={18} rx={6} fill={MAT.wood} stroke={INK} strokeWidth={OL} />
    </g>
  </g>
);
/** end points of the seesaw plank in world px (to stand heroes on it) */
export const seesawEnds = (x: number, y: number, angle: number, len = 640): [V, V] => {
  const a = (angle * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a), cy = y - 96 - 14;
  return [[x - (len / 2 - 50) * c, cy - (len / 2 - 50) * s], [x + (len / 2 - 50) * c, cy + (len / 2 - 50) * s]];
};

// ---------------------------------------------------------------- home and work
/** bed seen from ABOVE (top-down shot), (x, y) = top-left; `sleeper` area is left for a hero drawn on top */
export const BedTop: React.FC<{ x: number; y: number; w?: number; h?: number; blanket?: number; f?: number }> = ({ x, y, w = 520, h = 900, blanket = 0.42 }) => (
  <g>
    <rect x={x - 14} y={y - 14} width={w + 28} height={h + 28} rx={18} fill={MAT.wood} stroke={INK} strokeWidth={OL} />
    <rect x={x} y={y} width={w} height={h} rx={10} fill="#e8e8ec" stroke={INK} strokeWidth={OL} />
    <rect x={x + w * 0.2} y={y + 30} width={w * 0.6} height={130} rx={40} fill="#f6f6f8" stroke={INK} strokeWidth={OL} />
    <path d={`M${x + w * 0.3} ${y + 70} Q${x + w * 0.5} ${y + 50} ${x + w * 0.7} ${y + 70}`} fill="none" stroke="#c8c8d0" strokeWidth={4} />
    <rect x={x} y={y + h * blanket} width={w} height={h * (1 - blanket)} rx={10} fill={MAT.fabric} stroke={INK} strokeWidth={OL} />
    <rect x={x} y={y + h * blanket} width={w} height={40} rx={10} fill="#3f63a8" stroke={INK} strokeWidth={OL} />
    <rect x={x} y={y + h * blanket + 40} width={w} height={h * (1 - blanket) - 40} fill="url(#k-vig)" opacity={0.5} />
  </g>
);
export const DigitalClock: React.FC<{ x: number; y: number; s?: number; text: string; color?: string }> = ({ x, y, s = 1, text, color = "#ff4a3a" }) => (
  <g transform={T(x, y, s)}>
    <rect x={-80} y={-46} width={160} height={92} rx={12} fill="#3a2a24" stroke={INK} strokeWidth={OL} />
    <rect x={-66} y={-34} width={132} height={60} rx={6} fill="#120808" />
    <text x={0} y={12} textAnchor="middle" fontFamily='"Consolas", "Courier New", monospace' fontWeight={700} fontSize={44} fill={color}>{text}</text>
    <text x={0} y={12} textAnchor="middle" fontFamily='"Consolas", "Courier New", monospace' fontWeight={700} fontSize={44} fill={color} filter="url(#k-blur4)" opacity={0.8}>{text}</text>
  </g>
);
export const WallClock: React.FC<{ x: number; y: number; r?: number; h: number; m: number; glow?: boolean }> = ({ x, y, r = 90, h, m, glow }) => {
  const ha = (h % 12) * 30 + m * 0.5, ma = m * 6;
  return (
    <g transform={`translate(${x} ${y})`}>
      {glow && <circle r={r * 1.5} fill="#fff" opacity={0.18} filter="url(#k-blur30)" />}
      <circle r={r} fill="#16161a" stroke="#e8e8e8" strokeWidth={r * 0.07} />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={-r * 0.8} x2={0} y2={-r * (i % 3 ? 0.88 : 0.72)} stroke="#e8e8e8" strokeWidth={i % 3 ? 3 : 6} transform={`rotate(${i * 30})`} />)}
      <line x1={0} y1={0} x2={0} y2={-r * 0.5} stroke="#fff" strokeWidth={r * 0.07} strokeLinecap="round" transform={`rotate(${ha})`} />
      <line x1={0} y1={0} x2={0} y2={-r * 0.76} stroke="#fff" strokeWidth={r * 0.045} strokeLinecap="round" transform={`rotate(${ma})`} />
      <circle r={r * 0.06} fill="#fff" />
    </g>
  );
};
export const Desk: React.FC<{ x: number; y: number; w?: number; h?: number }> = ({ x, y, w = 360, h = 150 }) => (
  <g stroke={INK} strokeWidth={OL}>
    <rect x={x - w / 2} y={y - h} width={w} height={20} rx={3} fill={MAT.wood} />
    <rect x={x - w / 2 + 14} y={y - h + 20} width={14} height={h - 20} fill="#4a3424" /><rect x={x + w / 2 - 28} y={y - h + 20} width={14} height={h - 20} fill="#4a3424" />
    <rect x={x + w / 2 - 130} y={y - h + 20} width={100} height={70} fill="#5b3f2a" /><line x1={x + w / 2 - 100} y1={y - h + 55} x2={x + w / 2 - 60} y2={y - h + 55} />
  </g>
);
export const Chair: React.FC<{ x: number; y: number; flip?: boolean }> = ({ x, y, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`} stroke={INK} strokeWidth={OL} fill="#3a3a42">
    <rect x={-50} y={-106} width={100} height={14} rx={4} /><rect x={-56} y={-230} width={14} height={138} rx={4} /><rect x={-44} y={-92} width={10} height={92} /><rect x={34} y={-92} width={10} height={92} />
  </g>
);
export const Laptop: React.FC<{ x: number; y: number; s?: number; glow?: string; f?: number }> = ({ x, y, s = 1, glow = "#bcd8ff", f = 0 }) => (
  <g transform={T(x, y, s)} stroke={INK} strokeWidth={OL} strokeLinejoin="round">
    <path d="M-60 0 L-46 -96 L46 -96 L60 0 Z" fill="#3a3c44" transform="skewX(-8)" />
    <path d="M-52 -8 L-40 -88 L40 -88 L52 -8 Z" fill={glow} stroke="none" transform="skewX(-8)" opacity={0.85 + 0.1 * Math.sin(f * 0.3)} />
    <rect x={-80} y={-6} width={160} height={10} rx={3} fill="#5a5c66" />
  </g>
);
export const Phone: React.FC<{ x: number; y: number; s?: number; rot?: number; glow?: string }> = ({ x, y, s = 1, rot = 0, glow = "#8fc0ff" }) => (
  <g transform={T(x, y, s, rot)}>
    <circle r={60} fill={glow} opacity={0.25} filter="url(#k-blur10)" />
    <rect x={-17} y={-32} width={34} height={64} rx={6} fill="#16161a" stroke={INK} strokeWidth={2.5} />
    <rect x={-13} y={-26} width={26} height={50} rx={3} fill={glow} />
  </g>
);
export const Book: React.FC<{ x: number; y: number; s?: number; rot?: number; color?: string; open?: boolean }> = ({ x, y, s = 1, rot = 0, color = "#c04040", open }) => (
  <g transform={T(x, y, s, rot)} stroke={INK} strokeWidth={2.5} strokeLinejoin="round">
    {open
      ? <><path d="M0 -4 Q-30 -14 -60 -6 L-60 30 Q-30 22 0 32 Z" fill="#f2f0e8" /><path d="M0 -4 Q30 -14 60 -6 L60 30 Q30 22 0 32 Z" fill="#e8e6de" /><line x1={-50} y1={4} x2={-12} y2={2} stroke="#999" strokeWidth={2} /><line x1={-50} y1={12} x2={-12} y2={10} stroke="#999" strokeWidth={2} /></>
      : <><rect x={-44} y={-30} width={88} height={60} rx={4} fill={color} /><rect x={-44} y={22} width={88} height={8} fill="#f2f0e8" /></>}
  </g>
);
export const Dumbbell: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={T(x, y, s, rot)} stroke={INK} strokeWidth={2.5}>
    <rect x={-50} y={-5} width={100} height={10} rx={4} fill="#9aa0a8" />
    {[-1, 1].map((k) => <g key={k}><rect x={k * 50 - (k > 0 ? 0 : 22)} y={-26} width={22} height={52} rx={5} fill="#2a2c32" /><rect x={k * 72 - (k > 0 ? 0 : 12)} y={-18} width={12} height={36} rx={4} fill="#2a2c32" /></g>)}
  </g>
);
export const Window: React.FC<{ x: number; y: number; w?: number; h?: number; night?: boolean; f?: number }> = ({ x, y, w = 200, h = 240, night = true, f = 0 }) => {
  const id = React.useId().replace(/:/g, "");
  return (
    <g>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={night ? "#0a1238" : "#7cc0ff"} /><stop offset="100%" stopColor={night ? "#24356e" : "#dff0ff"} /></linearGradient></defs>
      <rect x={x} y={y} width={w} height={h} fill={`url(#${id})`} />
      {night && <><rect x={x} y={y} width={w} height={h} fill={MAT.stars} /><circle cx={x + w * 0.72} cy={y + h * 0.28} r={18} fill="#f4f0d8" /><circle cx={x + w * 0.72} cy={y + h * 0.28} r={40} fill="#f4f0d8" opacity={0.15} /></>}
      {night && Array.from({ length: 3 }, (_, i) => <circle key={i} cx={x + w * (0.2 + i * 0.25)} cy={y + h * (0.3 + 0.2 * (i % 2))} r={2} fill="#fff" opacity={0.5 + 0.5 * Math.sin(f * 0.2 + i * 2)} />)}
      <rect x={x} y={y} width={w} height={h} fill="none" stroke="#3a2a1e" strokeWidth={14} />
      <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke="#3a2a1e" strokeWidth={8} /><line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} stroke="#3a2a1e" strokeWidth={8} />
      <rect x={x - 7} y={y - 7} width={w + 14} height={h + 14} fill="none" stroke={INK} strokeWidth={OL} />
    </g>
  );
};
export const Sign: React.FC<{ x: number; y: number; text: string; w?: number; s?: number; rot?: number; color?: string; ink?: string }> = ({ x, y, text, w = 200, s = 1, rot = 0, color = "#3a3c44", ink = "#f0f0f0" }) => (
  <g transform={T(x, y, s, rot)}>
    <rect x={-w / 2} y={-26} width={w} height={52} rx={6} fill={color} stroke={INK} strokeWidth={OL} />
    <rect x={-w / 2 + 4} y={-22} width={w - 8} height={6} rx={3} fill="#fff" opacity={0.15} />
    <text x={0} y={10} textAnchor="middle" fontFamily='"Arial Black", Impact, sans-serif' fontSize={26} fill={ink}>{text}</text>
  </g>
);

// ---------------------------------------------------------------- sport
export const Goal: React.FC<{ x: number; y: number; s?: number; f?: number; hit?: number }> = ({ x, y, s = 1, hit = 0 }) => (
  <g transform={T(x, y, s)}>
    <g stroke="#e8e8e8" strokeWidth={1.6} opacity={0.55}>
      {Array.from({ length: 13 }, (_, i) => <line key={`v${i}`} x1={-240 + i * 40} y1={-250} x2={-200 + i * 36 + Math.sin(i) * hit * 30} y2={0} />)}
      {Array.from({ length: 7 }, (_, i) => <line key={`h${i}`} x1={-240 + i * 6} y1={-250 + i * 40} x2={240 - i * 6} y2={-250 + i * 40 + hit * 20 * Math.sin(i)} />)}
    </g>
    <path d="M-250 0 L-250 -260 L250 -260 L250 0" fill="none" stroke="#f6f6f6" strokeWidth={14} strokeLinejoin="round" />
    <path d="M-250 0 L-250 -260 L250 -260 L250 0" fill="none" stroke={INK} strokeWidth={2} />
  </g>
);
export const Ball: React.FC<{ x: number; y: number; r?: number; spin?: number }> = ({ x, y, r = 22, spin = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${spin})`}>
    <circle r={r} fill="#f6f6f6" stroke={INK} strokeWidth={2.5} />
    <path d={`M0 ${-r * 0.4} L${r * 0.38} ${-r * 0.12} L${r * 0.24} ${r * 0.32} L${-r * 0.24} ${r * 0.32} L${-r * 0.38} ${-r * 0.12} Z`} fill={INK} />
    {[0, 72, 144, 216, 288].map((a) => <line key={a} x1={0} y1={-r * 0.4} x2={0} y2={-r} stroke={INK} strokeWidth={2} transform={`rotate(${a})`} />)}
  </g>
);

// ---------------------------------------------------------------- outdoors
export const Fence: React.FC<{ x: number; y: number; w: number; h?: number; gap?: number; color?: string }> = ({ x, y, w, h = 110, gap = 120, color = "#5a5a60" }) => (
  <g stroke={INK} strokeWidth={2.5}>
    <rect x={x} y={y - h * 0.8} width={w} height={12} fill={color} /><rect x={x} y={y - h * 0.4} width={w} height={12} fill={color} />
    {Array.from({ length: Math.floor(w / gap) + 1 }, (_, i) => <rect key={i} x={x + i * gap - 7} y={y - h} width={14} height={h} rx={3} fill={color} />)}
  </g>
);
export const GrassTufts: React.FC<{ x: number; y: number; w: number; n?: number; seed?: number; color?: string; f?: number; h?: number }> = ({ x, y, w, n = 30, seed = 4, color = "#6a6a70", f = 0, h = 26 }) => {
  const r = rng(seed);
  return (
    <g stroke={color} strokeWidth={2.2} strokeLinecap="round" fill="none">
      {Array.from({ length: n }, (_, i) => {
        const tx = x + r() * w, ty = y + r() * 30, k = 0.6 + r() * 0.8, sw = Math.sin(f * 0.05 + tx * 0.01) * 4;
        return <path key={i} d={`M${tx - 8 * k + sw} ${ty - h * k * 0.8} L${tx} ${ty} L${tx + sw} ${ty - h * k} M${tx} ${ty} L${tx + 9 * k + sw} ${ty - h * k * 0.7}`} />;
      })}
    </g>
  );
};
export const Tree: React.FC<{ x: number; y: number; s?: number; f?: number; leaf?: string; dark?: boolean }> = ({ x, y, s = 1, f = 0, leaf = "#3f7a3a", dark }) => {
  const sw = Math.sin(f * 0.04) * 3;
  const blobs: [number, number, number][] = [[0, -330, 110], [-90, -270, 80], [90, -270, 84], [-50, -400, 80], [60, -400, 78], [0, -230, 70]];
  return (
    <g transform={T(x, y, s)}>
      <path d="M-22 0 Q-18 -120 -10 -220 L10 -220 Q18 -120 22 0 Z" fill={dark ? "#2a2a2e" : "#5a3a24"} stroke={INK} strokeWidth={OL} />
      <g transform={`rotate(${sw} 0 -200)`}>
        {blobs.map(([bx, by, br], i) => <circle key={i} cx={bx} cy={by} r={br} fill={dark ? "#3a3a40" : leaf} stroke={INK} strokeWidth={OL} />)}
        {blobs.map(([bx, by, br], i) => <circle key={`h${i}`} cx={bx - br * 0.25} cy={by - br * 0.3} r={br * 0.55} fill="#fff" opacity={0.08} />)}
      </g>
    </g>
  );
};
export const LampPost: React.FC<{ x: number; y: number; s?: number; on?: number }> = ({ x, y, s = 1, on = 1 }) => (
  <g transform={T(x, y, s)}>
    {on > 0 && <path d="M-20 -440 L20 -440 L180 0 L-180 0 Z" fill="#ffe2a0" opacity={0.16 * on} style={{ mixBlendMode: "screen" }} />}
    <rect x={-8} y={-440} width={16} height={440} fill="#2a2a30" stroke={INK} strokeWidth={2.5} />
    <path d="M-34 -440 L34 -440 L22 -470 L-22 -470 Z" fill="#2a2a30" stroke={INK} strokeWidth={2.5} />
    <ellipse cx={0} cy={-436} rx={22} ry={8} fill={on > 0 ? "#fff3c8" : "#555"} />
    {on > 0 && <circle cx={0} cy={-436} r={60} fill="#ffe2a0" opacity={0.35 * on} filter="url(#k-blur10)" />}
  </g>
);
export const Sun: React.FC<{ x: number; y: number; r?: number; color?: string; f?: number }> = ({ x, y, r = 60, color = "#ffd27a", f = 0 }) => (
  <g>
    <circle cx={x} cy={y} r={r * 3} fill={color} opacity={0.18} filter="url(#k-blur30)" />
    <circle cx={x} cy={y} r={r * (1 + 0.02 * Math.sin(f * 0.1))} fill={color} />
    <circle cx={x - r * 0.2} cy={y - r * 0.2} r={r * 0.6} fill="#fff" opacity={0.25} />
  </g>
);
export const Moon: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 50 }) => (
  <g>
    <circle cx={x} cy={y} r={r * 2.6} fill="#e8eeff" opacity={0.12} filter="url(#k-blur30)" />
    <circle cx={x} cy={y} r={r} fill="#eef0e0" /><circle cx={x - r * 0.3} cy={y - r * 0.1} r={r * 0.18} fill="#000" opacity={0.08} /><circle cx={x + r * 0.25} cy={y + r * 0.3} r={r * 0.12} fill="#000" opacity={0.08} />
  </g>
);
export const Cloud: React.FC<{ x: number; y: number; s?: number; color?: string; a?: number }> = ({ x, y, s = 1, color = "#ffffff", a = 0.9 }) => (
  <g transform={T(x, y, s)} fill={color} opacity={a}>
    <ellipse cx={0} cy={0} rx={120} ry={34} /><circle cx={-50} cy={-20} r={44} /><circle cx={20} cy={-36} r={56} /><circle cx={74} cy={-12} r={36} />
  </g>
);
/** a band of rolling hills / mountains (for parallax backgrounds) */
export const Hills: React.FC<{ y: number; amp?: number; color?: string; seed?: number; w?: number; x?: number; peaks?: boolean; h?: number }> = ({ y, amp = 80, color = "#1c1c22", seed = 2, w = 3000, x = -1000, peaks, h = 1400 }) => {
  const r = rng(seed), n = 24;
  const pts = Array.from({ length: n + 1 }, (_, i) => [x + (i / n) * w, y - (peaks ? (i % 2 ? amp * (0.6 + r() * 0.8) : amp * 0.1 * r()) : amp * (0.4 + r() * 0.6))] as V);
  const d = peaks ? poly(...pts) : pts.map((p, i) => (i ? `S${p[0] - w / n / 2} ${p[1]} ${p[0]} ${p[1]}` : `M${p[0]} ${p[1]}`)).join(" ");
  return <path d={`${d} L${x + w} ${y + h} L${x} ${y + h} Z`} fill={color} />;
};
