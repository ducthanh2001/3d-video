// Props for "YOUR PHONE UPGRADES EVERY YEAR. DO YOU?" (stick-film kit look: thin black outline, shaded fills, dark world).
// Everyday, believable objects: a modern phone with real-looking UI (no brands), a sketchbook whose drawing gets better with `skill`,
// apartment rooms in cross-section, sofa, desk lamp, shelf, snacks, crumpled paper, framed drawings, a laptop email, a new-phone box.
import React from "react";
import { V, clamp, lerp, noise1, rng } from "../../kit/core";
import { MAT } from "../../kit/materials";
import { ACC, Acc } from "./accent";

export const INK = "#0b0b0d";
const OL = 3;
export const UI_FONT = '"Segoe UI", Arial, sans-serif';
const T = (x: number, y: number, s = 1, r = 0) => `translate(${x} ${y}) rotate(${r}) scale(${s})`;

// ---------------------------------------------------------------- phone (front view, big for close-ups)
export type PhoneScreen = "notif" | "feed" | "off" | "lock" | "still";
export const PhoneBig: React.FC<{ x: number; y: number; s?: number; rot?: number; screen?: PhoneScreen; f?: number; time?: string; battery?: number; notifX?: number; notifA?: number; newModel?: boolean }> = ({ x, y, s = 1, rot = 0, screen = "lock", f = 0, time = "11:47", battery = 34, notifX = 0, notifA = 1, newModel }) => {
  const W = 300, H = 620, id = React.useId().replace(/:/g, "");
  const on = screen !== "off";
  return (
    <g transform={T(x, y, s, rot)}>
      <defs>
        <linearGradient id={`${id}w`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#1f3a8a" /><stop offset="55%" stopColor="#4a2a7a" /><stop offset="100%" stopColor="#0d1530" /></linearGradient>
        <clipPath id={`${id}c`}><rect x={-W / 2 + 12} y={-H / 2 + 12} width={W - 24} height={H - 24} rx={34} /></clipPath>
      </defs>
      {on && <ellipse cx={0} cy={0} rx={W * 0.95} ry={H * 0.7} fill="#4a7bff" opacity={0.16} filter="url(#k-blur30)" />}
      <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={46} fill={newModel ? "#d8d2c4" : "#1a1a1e"} stroke={INK} strokeWidth={OL} />
      <rect x={-W / 2 + 12} y={-H / 2 + 12} width={W - 24} height={H - 24} rx={34} fill={on ? `url(#${id}w)` : "#050507"} />
      <g clipPath={`url(#${id}c)`}>
        {on && <>
          {/* status bar */}
          <text x={-W / 2 + 40} y={-H / 2 + 50} fontFamily={UI_FONT} fontWeight={600} fontSize={20} fill="#fff">{time}</text>
          <rect x={W / 2 - 74} y={-H / 2 + 36} width={38} height={18} rx={4} fill="none" stroke="#fff" strokeWidth={2} />
          <rect x={W / 2 - 71} y={-H / 2 + 39} width={32 * clamp(battery / 100)} height={12} rx={2} fill={battery < 15 ? "#ff4a4a" : "#fff"} />
          <rect x={W / 2 - 35} y={-H / 2 + 41} width={3} height={8} rx={1} fill="#fff" />
        </>}
        {(screen === "lock" || screen === "notif") && <>
          <text x={0} y={-H / 2 + 170} textAnchor="middle" fontFamily={UI_FONT} fontWeight={300} fontSize={88} fill="#fff">{time}</text>
          <text x={0} y={-H / 2 + 205} textAnchor="middle" fontFamily={UI_FONT} fontSize={20} fill="#fff" opacity={0.8}>Sunday, 9:00 PM</text>
        </>}
        {screen === "notif" && (
          <g transform={`translate(${notifX} 0)`} opacity={notifA}>
            <rect x={-W / 2 + 24} y={-40} width={W - 48} height={170} rx={22} fill="#ffffff" opacity={0.86} />
            <rect x={-W / 2 + 40} y={-24} width={34} height={34} rx={9} fill="#6a4ad8" />
            <path d={`M${-W / 2 + 49} ${-16} h16 l-8 10 l8 10 h-16 l8 -10 z`} fill="#fff" />
            <text x={-W / 2 + 84} y={-1} fontFamily={UI_FONT} fontWeight={700} fontSize={17} fill="#111">SCREEN TIME</text>
            <text x={W / 2 - 40} y={-1} textAnchor="end" fontFamily={UI_FONT} fontSize={15} fill="#555">now</text>
            <text x={-W / 2 + 40} y={36} fontFamily={UI_FONT} fontWeight={700} fontSize={19} fill="#111">Weekly report</text>
            <text x={-W / 2 + 40} y={62} fontFamily={UI_FONT} fontSize={17} fill="#222">Daily average: 6h 12m</text>
            <text x={-W / 2 + 40} y={86} fontFamily={UI_FONT} fontSize={17} fill="#c0302a">▲ 23% from last week</text>
            {[0.5, 0.7, 0.62, 0.85, 0.9, 1, 0.95].map((v, i) => <rect key={i} x={-W / 2 + 40 + i * 30} y={120 - v * 22} width={20} height={v * 22} rx={3} fill="#6a4ad8" opacity={0.8} />)}
          </g>
        )}
        {screen === "feed" && Array.from({ length: 4 }, (_, i) => {
          const yy = -H / 2 + 80 + ((i * 150 - f * 9) % 600 + 600) % 600 - 40;
          const hue = [200, 330, 30, 150][(i + Math.floor(f * 9 / 600)) % 4];
          return (
            <g key={i}>
              <rect x={-W / 2 + 24} y={yy} width={W - 48} height={136} rx={14} fill={`hsl(${hue},55%,45%)`} />
              <circle cx={-W / 2 + 60} cy={yy + 30} r={14} fill="#fff" opacity={0.7} />
              <rect x={-W / 2 + 84} y={yy + 22} width={110} height={10} rx={5} fill="#fff" opacity={0.7} />
              <path d={`M${W / 2 - 60} ${yy + 104} c-8 -10 -22 -2 -14 8 l14 14 l14 -14 c8 -10 -6 -18 -14 -8 z`} fill="#ff4a6a" />
            </g>
          );
        })}
        {screen === "still" && <>
          <rect x={-W / 2 + 12} y={-H / 2 + 12} width={W - 24} height={H - 24} fill="#000" opacity={0.55} />
          <rect x={-110} y={-60} width={220} height={130} rx={18} fill="#2a2a32" />
          <text x={0} y={-10} textAnchor="middle" fontFamily={UI_FONT} fontWeight={700} fontSize={20} fill="#fff">Still watching?</text>
          <rect x={-80} y={20} width={160} height={36} rx={10} fill="#fff" /><text x={0} y={45} textAnchor="middle" fontFamily={UI_FONT} fontWeight={700} fontSize={17} fill="#111">Continue</text>
        </>}
      </g>
      <rect x={-46} y={-H / 2 + 22} width={92} height={24} rx={12} fill="#050507" />
      {/* glass highlight */}
      <path d={`M${-W / 2 + 24} ${-H / 2 + 60} L${-W / 2 + 90} ${-H / 2 + 24} L${-W / 2 + 130} ${-H / 2 + 24} L${-W / 2 + 24} ${-H / 2 + 120} Z`} fill="#fff" opacity={0.07} />
    </g>
  );
};

/** a big stick-style thumb coming from the bottom of the frame to (x, y) */
export const Thumb: React.FC<{ x: number; y: number; from?: V; w?: number }> = ({ x, y, from = [900, 2050], w = 92 }) => (
  <g fill="none" strokeLinecap="round">
    <path d={`M${from[0]} ${from[1]} Q${(from[0] + x) / 2 + 80} ${(from[1] + y) / 2 + 40} ${x} ${y}`} stroke={INK} strokeWidth={w + 8} />
    <path d={`M${from[0]} ${from[1]} Q${(from[0] + x) / 2 + 80} ${(from[1] + y) / 2 + 40} ${x} ${y}`} stroke="#f2f2f0" strokeWidth={w} />
    <ellipse cx={x + 4} cy={y + 12} rx={w * 0.26} ry={w * 0.18} fill="#e2e2e0" stroke="#b8b8b8" strokeWidth={2} transform={`rotate(-30 ${x} ${y})`} />
  </g>
);

// ---------------------------------------------------------------- the sketchbook: the same cat, drawn with growing skill (0..1)
const CAT: V[][] = [
  // body + head outline, ears, tail (design space: 0..200 wide, 0..220 high, feet at y=220)
  [[60, 220], [48, 180], [52, 140], [70, 112], [88, 100]],
  [[140, 220], [152, 180], [148, 140], [130, 112], [112, 100]],
  [[88, 100], [70, 90], [62, 66], [66, 40], [62, 10], [84, 30], [100, 26], [116, 30], [138, 10], [134, 40], [138, 66], [130, 90], [112, 100]],
  [[60, 220], [100, 214], [140, 220]],
  [[150, 214], [182, 200], [192, 170], [180, 140], [186, 124]],
  [[86, 220], [88, 180]], [[114, 220], [112, 180]],
];
export const CatDrawing: React.FC<{ x: number; y: number; s?: number; skill: number; seed?: number; color?: string }> = ({ x, y, s = 1, skill, seed = 1, color = "#2a2a30" }) => {
  const k = clamp(skill), wob = lerp(13, 0.6, Math.pow(k, 0.7)), passes = k < 0.35 ? 1 : k < 0.8 ? 2 : 1;
  // a beginner's proportions are off: big head, stretched body
  const warp = (p: V, i: number): V => {
    const headish = p[1] < 100 ? lerp(1.35, 1, k) : 1, bodyY = p[1] >= 100 ? lerp(0.8, 1, k) : 1;
    const cx = 100, cy = 100;
    return [cx + (p[0] - cx) * headish + noise1(i * 0.9 + seed * 3, seed) * wob, cy + (p[1] - cy) * (p[1] < 100 ? headish : bodyY) + noise1(i * 1.3 + 7 + seed, seed + 2) * wob];
  };
  const lines: React.ReactNode[] = [];
  CAT.forEach((pts, li) => {
    for (let pss = 0; pss < passes; pss++) {
      const ps = pts.map((p, i) => warp([p[0] + (pss ? 1.5 : 0), p[1] + (pss ? -1 : 0)], i + li * 11 + pss * 37));
      const d = ps.map((p, i) => (i ? (k > 0.6 ? `L${p[0]} ${p[1]}` : `L${p[0]} ${p[1]}`) : `M${p[0]} ${p[1]}`)).join(" ");
      lines.push(<path key={`${li}-${pss}`} d={d} fill="none" stroke={color} strokeWidth={lerp(3.4, 2.4, k)} strokeLinecap="round" strokeLinejoin="round" opacity={pss ? 0.45 : 0.9} />);
    }
  });
  const eyeY = 60 * lerp(1.2, 1, k);
  return (
    <g transform={T(x, y, s)}>
      {k > 0.55 && (
        <g opacity={clamp((k - 0.55) / 0.3)} stroke={color} strokeWidth={1.4}>
          {Array.from({ length: 14 }, (_, i) => <line key={i} x1={128 - i * 2} y1={120 + i * 7} x2={146 - i * 0.5} y2={114 + i * 7} opacity={0.55} />)}
          {Array.from({ length: 6 }, (_, i) => <line key={`h${i}`} x1={118 + i * 3} y1={70 + i * 4} x2={130} y2={64 + i * 4} opacity={0.5} />)}
          <ellipse cx={100} cy={226} rx={70} ry={6} fill={color} opacity={0.15} stroke="none" />
        </g>
      )}
      {lines}
      {/* face: dots for a beginner, real eyes with highlights for the skilled */}
      {k < 0.5
        ? <><circle cx={84 + noise1(seed) * wob} cy={eyeY} r={4} fill={color} /><circle cx={116} cy={eyeY + noise1(seed + 4) * wob} r={4} fill={color} /><path d={`M92 ${eyeY + 22} q8 6 16 0`} fill="none" stroke={color} strokeWidth={3} /></>
        : <g>
            {[86, 114].map((ex) => <g key={ex}><ellipse cx={ex} cy={60} rx={8} ry={10} fill="none" stroke={color} strokeWidth={2.4} /><ellipse cx={ex} cy={61} rx={3} ry={8} fill={color} /><circle cx={ex + 3} cy={56} r={2} fill="#fff" /></g>)}
            <path d="M96 74 l4 4 l4 -4 z" fill={color} /><path d="M100 78 q-6 8 -12 4 M100 78 q6 8 12 4" fill="none" stroke={color} strokeWidth={2} />
            {[-1, 1].map((d) => [0, 1, 2].map((i) => <line key={`${d}${i}`} x1={100 + d * 16} y1={76 + i * 4} x2={100 + d * 52} y2={70 + i * 8} stroke={color} strokeWidth={1.3} />))}
          </g>}
    </g>
  );
};

/** open sketchbook seen from above-front; `skill` drives the drawing on the right page; `label` = the day written in the corner */
export const Sketchbook: React.FC<{ x: number; y: number; s?: number; skill?: number; label?: string; blank?: boolean; closed?: boolean; seed?: number; rot?: number; torn?: number }> = ({ x, y, s = 1, skill = 0, label, blank, closed, seed = 1, rot = 0, torn = 0 }) => {
  if (closed) return (
    <g transform={T(x, y, s, rot)} stroke={INK} strokeWidth={OL} strokeLinejoin="round">
      <rect x={-130} y={-90} width={260} height={180} rx={8} fill="#2f4a3a" />
      <rect x={-130} y={-90} width={26} height={180} rx={6} fill="#22362a" />
      <rect x={-60} y={-30} width={140} height={44} rx={4} fill="#e8e2d0" strokeWidth={2} />
      <text x={10} y={0} textAnchor="middle" fontFamily='"Segoe Print", "Comic Sans MS", cursive' fontSize={20} fill="#333" stroke="none">SKETCHES</text>
    </g>
  );
  return (
    <g transform={T(x, y, s, rot)}>
      <rect x={-262} y={-178} width={524} height={356} rx={10} fill="#1e2a22" stroke={INK} strokeWidth={OL} />
      <path d="M-250 -168 L-6 -160 L-6 168 L-250 162 Z" fill="#efe9da" stroke={INK} strokeWidth={2.5} />
      <path d={`M6 -160 L250 -168 L250 162 L6 168 Z`} fill="#f4efe2" stroke={INK} strokeWidth={2.5} />
      <rect x={-8} y={-160} width={16} height={328} fill="#000" opacity={0.15} />
      {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={0} cy={-150 + i * 27} r={4} fill="none" stroke="#666" strokeWidth={2} />)}
      {!blank && <>
        <CatDrawing x={30} y={-140} s={1.0} skill={skill} seed={seed} />
        <CatDrawing x={-230} y={-60} s={0.6} skill={Math.max(0, skill - 0.25)} seed={seed + 3} color="#555" />
      </>}
      {torn > 0 && <path d={`M6 -160 L250 -168 L${250 - 30 * torn} ${-60} L${200} ${-10 + 40 * torn} L${120} ${40} L6 ${-10}`} fill="#1e2a22" stroke={INK} strokeWidth={2} />}
      {label && <text x={236} y={150} textAnchor="end" fontFamily='"Segoe Print", "Comic Sans MS", cursive' fontSize={24} fill="#7a3a2a">{label}</text>}
    </g>
  );
};
export const Pencil: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = -30 }) => (
  <g transform={T(x, y, s, rot)} stroke={INK} strokeWidth={2.5} strokeLinejoin="round">
    <rect x={-6} y={-90} width={12} height={74} fill="#f2c13b" /><rect x={-6} y={-102} width={12} height={12} fill="#e88" />
    <path d="M-6 -16 L6 -16 L0 0 Z" fill="#e8d0a8" /><path d="M-2 -5 L2 -5 L0 0 Z" fill="#333" />
  </g>
);
export const PaperBall: React.FC<{ x: number; y: number; s?: number; seed?: number }> = ({ x, y, s = 1, seed = 1 }) => {
  const r = rng(seed); const n = 11;
  const pts = Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2, rr = 24 * (0.8 + r() * 0.35); return [Math.cos(a) * rr, Math.sin(a) * rr] as V; });
  return (
    <g transform={T(x, y, s, r() * 360)}>
      <path d={`M${pts.map((p) => p.join(" ")).join(" L")} Z`} fill="#ece6d6" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
      {[0, 1, 2].map((i) => <path key={i} d={`M${pts[i * 3][0] * 0.8} ${pts[i * 3][1] * 0.8} L${(r() - 0.5) * 10} ${(r() - 0.5) * 10} L${pts[i * 3 + 2][0] * 0.7} ${pts[i * 3 + 2][1] * 0.7}`} fill="none" stroke="#9a948a" strokeWidth={1.6} />)}
    </g>
  );
};

// ---------------------------------------------------------------- apartment cross-section
export type RoomTone = "warm" | "cool" | "dark";
const WALL: Record<RoomTone, [string, string]> = { warm: ["#6a4a36", "#3e2a1e"], cool: ["#2c3550", "#171c2e"], dark: ["#1e1e24", "#101014"] };
/** one room (inner box): wallpaper with stripes, wood floor strip, baseboard, ceiling lamp; floor at y + h */
export const RoomBox: React.FC<{ x: number; y: number; w: number; h: number; tone: RoomTone; lightOn?: boolean }> = ({ x, y, w, h, tone, lightOn }) => {
  const id = React.useId().replace(/:/g, "");
  const [a, b] = WALL[tone];
  return (
    <g>
      <defs>
        <linearGradient id={`${id}w`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={a} /><stop offset="100%" stopColor={b} /></linearGradient>
        <pattern id={`${id}p`} patternUnits="userSpaceOnUse" width={48} height={48}><rect width={48} height={48} fill="none" /><rect x={0} y={0} width={3} height={48} fill="#fff" opacity={0.035} /><circle cx={24} cy={24} r={2} fill="#fff" opacity={0.04} /></pattern>
      </defs>
      <rect x={x} y={y} width={w} height={h} fill={`url(#${id}w)`} />
      <rect x={x} y={y} width={w} height={h} fill={`url(#${id}p)`} />
      <rect x={x} y={y + h - 26} width={w} height={26} fill={MAT.boards} />
      <rect x={x} y={y + h - 26} width={w} height={26} fill="#000" opacity={tone === "warm" ? 0.25 : 0.55} />
      <rect x={x} y={y + h - 40} width={w} height={14} fill="#000" opacity={0.3} />
      <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + 40} stroke={INK} strokeWidth={3} />
      <path d={`M${x + w / 2 - 34} ${y + 62} L${x + w / 2 + 34} ${y + 62} L${x + w / 2 + 18} ${y + 38} L${x + w / 2 - 18} ${y + 38} Z`} fill="#2a2a30" stroke={INK} strokeWidth={2.5} />
      {lightOn && <ellipse cx={x + w / 2} cy={y + 66} rx={30} ry={6} fill="#fff3d0" />}
    </g>
  );
};
/** concrete slab / wall piece of the building section */
export const Slab: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => (
  <g><rect x={x} y={y} width={w} height={h} fill={MAT.concrete} stroke={INK} strokeWidth={OL} /><rect x={x} y={y} width={w} height={h} fill="#000" opacity={0.45} /><rect x={x} y={y} width={w} height={4} fill="#fff" opacity={0.12} /></g>
);
/** a night city skyline band (far background) */
export const Skyline: React.FC<{ y: number; seed?: number; color?: string; lit?: number }> = ({ y, seed = 3, color = "#14182a", lit = 0.5 }) => {
  const r = rng(seed), out: React.ReactNode[] = [];
  let x = -400;
  while (x < 1500) {
    const w = 70 + r() * 120, h = 160 + r() * 520;
    out.push(<rect key={`b${x}`} x={x} y={y - h} width={w} height={h + 400} fill={color} />);
    for (let wy = y - h + 20; wy < y - 10; wy += 34) for (let wx = x + 12; wx < x + w - 14; wx += 26) if (r() < 0.22 * lit) out.push(<rect key={`${wx}-${wy}`} x={wx} y={wy} width={12} height={16} fill="#ffd27a" opacity={0.55 + r() * 0.4} />);
    x += w + 6;
  }
  return <g>{out}</g>;
};

// ---------------------------------------------------------------- furniture (side view, floor at y)
export const Sofa: React.FC<{ x: number; y: number; w?: number; color?: string }> = ({ x, y, w = 320, color = "#4a3a5a" }) => (
  <g stroke={INK} strokeWidth={OL} strokeLinejoin="round">
    <rect x={x - w / 2} y={y - 170} width={w} height={110} rx={22} fill={color} />
    <rect x={x - w / 2 - 24} y={y - 120} width={50} height={100} rx={16} fill={color} />
    <rect x={x + w / 2 - 26} y={y - 120} width={50} height={100} rx={16} fill={color} />
    <rect x={x - w / 2 + 20} y={y - 86} width={w - 40} height={50} rx={14} fill={color} />
    <rect x={x - w / 2 + 20} y={y - 86} width={w - 40} height={10} rx={5} fill="#fff" opacity={0.12} stroke="none" />
    <rect x={x - w / 2 - 6} y={y - 36} width={w + 12} height={26} rx={8} fill="#2a2030" />
    <rect x={x - w / 2 + 6} y={y - 12} width={12} height={12} fill="#1a1418" /><rect x={x + w / 2 - 18} y={y - 12} width={12} height={12} fill="#1a1418" />
  </g>
);
export const CoffeeTable: React.FC<{ x: number; y: number; w?: number }> = ({ x, y, w = 160 }) => (
  <g stroke={INK} strokeWidth={OL}>
    <rect x={x - w / 2} y={y - 70} width={w} height={14} rx={4} fill={MAT.wood} />
    <rect x={x - w / 2 + 10} y={y - 56} width={10} height={56} fill="#3a2a1e" /><rect x={x + w / 2 - 20} y={y - 56} width={10} height={56} fill="#3a2a1e" />
  </g>
);
export const SnackBag: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = -8 }) => (
  <g transform={T(x, y, s, rot)} stroke={INK} strokeWidth={2.5} strokeLinejoin="round">
    <path d="M-28 0 L-32 -70 L-26 -76 L26 -76 L32 -70 L28 0 Z" fill="#e0a030" /><rect x={-20} y={-54} width={40} height={24} rx={4} fill="#c0302a" strokeWidth={1.5} />
  </g>
);
export const Can: React.FC<{ x: number; y: number; s?: number; down?: boolean; color?: string }> = ({ x, y, s = 1, down, color = "#2a8a5a" }) => (
  <g transform={T(x, y, s, down ? 90 : 0)} stroke={INK} strokeWidth={2.5}>
    <rect x={-13} y={-46} width={26} height={46} rx={4} fill={color} /><rect x={-13} y={-46} width={26} height={6} rx={3} fill="#c8c8cc" /><rect x={-8} y={-36} width={4} height={30} fill="#fff" opacity={0.3} stroke="none" />
  </g>
);
export const DeskLamp: React.FC<{ x: number; y: number; s?: number; on?: number; flip?: boolean }> = ({ x, y, s = 1, on = 1, flip }) => (
  <g transform={`${T(x, y, s)} scale(${flip ? -1 : 1} 1)`}>
    {on > 0 && <path d="M58 -150 L130 -150 L190 0 L-10 0 Z" fill="#ffe2a0" opacity={0.2 * on} style={{ mixBlendMode: "screen" }} />}
    <g stroke={INK} strokeWidth={OL} strokeLinejoin="round" fill="#3a3a42">
      <rect x={-34} y={-12} width={68} height={12} rx={5} />
      <path d="M0 -12 L-14 -100 L60 -150" fill="none" strokeWidth={9} stroke={INK} /><path d="M0 -12 L-14 -100 L60 -150" fill="none" strokeWidth={4} stroke="#5a5a62" />
      <path d="M44 -168 L104 -150 L84 -126 L36 -140 Z" fill="#2a2a30" />
    </g>
    {on > 0 && <ellipse cx={88} cy={-138} rx={14} ry={7} fill="#fff6d8" opacity={on} />}
    {on > 0 && <circle cx={88} cy={-136} r={60} fill="#ffe2a0" opacity={0.3 * on} filter="url(#k-blur10)" />}
  </g>
);
export const Shelf: React.FC<{ x: number; y: number; w?: number; seed?: number; dusty?: boolean }> = ({ x, y, w = 220, seed = 2 }) => {
  const r = rng(seed); let bx = x + 8; const books: React.ReactNode[] = [];
  const cols = ["#8a3a3a", "#3a5a8a", "#4a7a4a", "#8a7a3a", "#5a4a7a", "#7a7a7a"];
  while (bx < x + w - 30) { const bw = 14 + r() * 14, bh = 50 + r() * 30, lean = r() < 0.12; books.push(<rect key={bx} x={bx} y={y - bh} width={bw} height={bh} rx={2} fill={cols[Math.floor(r() * cols.length)]} stroke={INK} strokeWidth={2} transform={lean ? `rotate(12 ${bx} ${y})` : undefined} />); bx += bw + 2 + (lean ? 10 : 0); }
  return <g>{books}<rect x={x} y={y} width={w} height={12} fill={MAT.wood} stroke={INK} strokeWidth={2.5} /></g>;
};
/** a framed drawing on a wall */
export const FramedArt: React.FC<{ x: number; y: number; w?: number; skill?: number; seed?: number; tilt?: number }> = ({ x, y, w = 110, skill = 0.9, seed = 1, tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt})`}>
    <rect x={-w / 2 - 8} y={-w * 0.65 - 8} width={w + 16} height={w * 1.3 + 16} fill="#2a1e14" stroke={INK} strokeWidth={2.5} />
    <rect x={-w / 2} y={-w * 0.65} width={w} height={w * 1.3} fill="#f4efe2" />
    <CatDrawing x={-w * 0.42} y={-w * 0.52} s={w / 240} skill={skill} seed={seed} />
  </g>
);
/** laptop seen from the front with an email popup */
export const LaptopMail: React.FC<{ x: number; y: number; s?: number; p?: number }> = ({ x, y, s = 1, p = 1 }) => (
  <g transform={T(x, y, s)}>
    <circle cx={0} cy={-200} r={340} fill="#bcd8ff" opacity={0.12} filter="url(#k-blur30)" />
    <rect x={-300} y={-400} width={600} height={380} rx={18} fill="#1c1c22" stroke={INK} strokeWidth={OL} />
    <rect x={-282} y={-382} width={564} height={344} rx={6} fill="#e9eef5" />
    <rect x={-282} y={-382} width={564} height={40} fill="#d6dde8" />
    {[0, 1, 2].map((i) => <circle key={i} cx={-258 + i * 22} cy={-362} r={6} fill={["#ff5f57", "#ffbd2e", "#28c840"][i]} />)}
    <g opacity={p} transform={`translate(0 ${(1 - p) * 30})`}>
      <rect x={-250} y={-326} width={500} height={270} rx={12} fill="#fff" stroke="#c8d0dc" strokeWidth={2} />
      <circle cx={-212} cy={-286} r={22} fill="#6a9ad8" /><text x={-212} y={-279} textAnchor="middle" fontFamily={UI_FONT} fontWeight={700} fontSize={20} fill="#fff">M</text>
      <text x={-178} y={-292} fontFamily={UI_FONT} fontWeight={700} fontSize={20} fill="#111">Maria L.</text>
      <text x={-178} y={-268} fontFamily={UI_FONT} fontSize={17} fill="#555">Re: your cat drawing</text>
      <text x={-226} y={-222} fontFamily={UI_FONT} fontSize={21} fill="#222">Hi! I love your cat drawing.</text>
      <text x={-226} y={-192} fontFamily={UI_FONT} fontSize={21} fill="#222">Could I buy it for</text>
      <Acc><text x={-226} y={-132} fontFamily={UI_FONT} fontWeight={800} fontSize={58} fill={ACC} stroke="#7a4a00" strokeWidth={1}>$300?</text></Acc>
      <rect x={110} y={-120} width={110} height={40} rx={10} fill="#2a6ad8" /><text x={165} y={-93} textAnchor="middle" fontFamily={UI_FONT} fontWeight={700} fontSize={18} fill="#fff">Reply</text>
    </g>
    <path d="M-340 -20 L340 -20 L380 10 L-380 10 Z" fill="#3a3a42" stroke={INK} strokeWidth={OL} strokeLinejoin="round" />
  </g>
);
/** a new-phone box (the yearly upgrade) */
export const PhoneBox: React.FC<{ x: number; y: number; s?: number; open?: boolean }> = ({ x, y, s = 1 }) => (
  <g transform={T(x, y, s)} stroke={INK} strokeWidth={2.5} strokeLinejoin="round">
    <rect x={-46} y={-100} width={92} height={100} rx={8} fill="#f2f2f4" />
    <rect x={-22} y={-86} width={44} height={74} rx={8} fill="#d8d2c4" strokeWidth={2} />
    <text x={0} y={-4} textAnchor="middle" fontFamily={UI_FONT} fontWeight={800} fontSize={13} fill="#c0302a" stroke="none">NEW</text>
  </g>
);
/** a wall calendar grid of `n` days, the first `lit` coloured */
export const DayGrid: React.FC<{ x: number; y: number; cols?: number; n?: number; lit: number; cell?: number; color?: string }> = ({ x, y, cols = 13, n = 91, lit, cell = 52, color = "#4a7bff" }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const c = i % cols, r = Math.floor(i / cols), on = i < lit;
      return <rect key={i} x={x + c * (cell + 8)} y={y + r * (cell + 8)} width={cell} height={cell} rx={8} fill={on ? color : "#1c1c24"} stroke={on ? "#9ab4ff" : "#2c2c36"} strokeWidth={2} opacity={on ? 0.95 : 1} />;
    })}
  </g>
);
