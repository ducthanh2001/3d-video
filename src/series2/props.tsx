// Props and rooms for "Two Lives, One Clock": everything is original flat vector art with a little light and shadow (gradients, glow,
// soft floor shadows). Warm yellow light = Alex's choices, cool blue light = Ben's. Coordinates are screen px of the 1080x1920 frame
// (rooms are drawn 540 px wide so two of them make a split screen).
import React from "react";
import { V } from "../flat/rig/rig";
import { MONO, Overlay } from "./stick";

const INK = "#15151b";
export const FONT = '"Arial Black", Impact, "Segoe UI Black", sans-serif';
const rnd = (i: number) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// ---------------------------------------------------------------- shared gradients
export const Defs: React.FC = () => (
  <defs>
    <radialGradient id="warmGlow"><stop offset="0%" stopColor="#ffe3a0" stopOpacity={0.9} /><stop offset="100%" stopColor="#ffb347" stopOpacity={0} /></radialGradient>
    <radialGradient id="coolGlow"><stop offset="0%" stopColor="#9db8ff" stopOpacity={0.85} /><stop offset="100%" stopColor="#4a6cff" stopOpacity={0} /></radialGradient>
    <radialGradient id="vig" cx="50%" cy="50%" r="75%"><stop offset="50%" stopColor="#000" stopOpacity={0} /><stop offset="100%" stopColor="#000" stopOpacity={0.55} /></radialGradient>
    <linearGradient id="beamWarm" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ffe9b0" stopOpacity={0.5} /><stop offset="100%" stopColor="#ffe9b0" stopOpacity={0} /></linearGradient>
    <linearGradient id="beamCool" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a8c0ff" stopOpacity={0.4} /><stop offset="100%" stopColor="#a8c0ff" stopOpacity={0} /></linearGradient>
    <linearGradient id="skyMorning" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7fc4ff" /><stop offset="100%" stopColor="#ffe3b0" /></linearGradient>
    <linearGradient id="skyNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a1030" /><stop offset="100%" stopColor="#26356a" /></linearGradient>
    <linearGradient id="skyDay" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8fd0ff" /><stop offset="100%" stopColor="#e6f4ff" /></linearGradient>
    <linearGradient id="skyDusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5b6fb0" /><stop offset="100%" stopColor="#f3b184" /></linearGradient>
  </defs>
);

// ---------------------------------------------------------------- room shell
export const Room: React.FC<{ x: number; w: number; floorY: number; wall: [string, string]; floor: [string, string]; baseboard?: string }> = ({ x, w, floorY, wall, floor, baseboard = "#00000022" }) => (
  <g>
    <defs>
      <linearGradient id={`wall${x}${wall[0]}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={wall[0]} /><stop offset="100%" stopColor={wall[1]} /></linearGradient>
      <linearGradient id={`floor${x}${floor[0]}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={floor[0]} /><stop offset="100%" stopColor={floor[1]} /></linearGradient>
    </defs>
    <rect x={x} y={0} width={w} height={floorY} fill={`url(#wall${x}${wall[0]})`} />
    <rect x={x} y={floorY} width={w} height={1920 - floorY} fill={`url(#floor${x}${floor[0]})`} />
    {Array.from({ length: 7 }, (_, i) => <line key={i} x1={x} x2={x + w} y1={floorY + 30 + i * 70 + i * i * 6} y2={floorY + 30 + i * 70 + i * i * 6} stroke="#00000018" strokeWidth={3} />)}
    <rect x={x} y={floorY - 14} width={w} height={14} fill={baseboard} />
    <line x1={x} x2={x + w} y1={floorY} y2={floorY} stroke="#0000002a" strokeWidth={3} />
  </g>
);

// ---------------------------------------------------------------- clocks, calendar, devices
export const Clock: React.FC<{ cx: number; cy: number; r: number; hour: number; min: number; glow?: boolean; dark?: boolean }> = ({ cx, cy, r, hour, min, glow = true, dark }) => {
  const ha = ((hour % 12) + min / 60) * 30, ma = min * 6, face = dark ? "#16161d" : "#f8f4ea", ink = dark ? "#f2efe6" : INK;
  return (
    <g>
      {glow && <circle cx={cx} cy={cy} r={r * 1.7} fill="url(#warmGlow)" opacity={0.55} />}
      <circle cx={cx} cy={cy + r * 0.07} r={r * 1.04} fill="#000" opacity={0.25} />
      <circle cx={cx} cy={cy} r={r} fill={face} stroke={ink} strokeWidth={r * 0.07} />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={cx} x2={cx} y1={cy - r * 0.86} y2={cy - r * (i % 3 === 0 ? 0.7 : 0.78)} stroke={ink} strokeWidth={r * (i % 3 === 0 ? 0.06 : 0.035)} strokeLinecap="round" transform={`rotate(${i * 30} ${cx} ${cy})`} />)}
      <line x1={cx} y1={cy} x2={cx} y2={cy - r * 0.5} stroke={ink} strokeWidth={r * 0.085} strokeLinecap="round" transform={`rotate(${ha} ${cx} ${cy})`} />
      <line x1={cx} y1={cy} x2={cx} y2={cy - r * 0.76} stroke={ink} strokeWidth={r * 0.05} strokeLinecap="round" transform={`rotate(${ma} ${cx} ${cy})`} />
      <circle cx={cx} cy={cy} r={r * 0.06} fill="#e0443a" />
    </g>
  );
};

export const Phone: React.FC<{ x: number; y: number; rot?: number; s?: number; glow?: string; ui?: "feed" | "video" | "off" }> = ({ x, y, rot = 0, s = 1, glow = "#7aa7ff", ui = "feed" }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {ui !== "off" && <ellipse cx={0} cy={-6} rx={90} ry={100} fill="url(#coolGlow)" opacity={0.7} />}
    <rect x={-22} y={-38} width={44} height={76} rx={8} fill="#0b0b10" stroke="#3a3a44" strokeWidth={2} />
    <rect x={-18} y={-33} width={36} height={66} rx={5} fill={ui === "off" ? "#15151b" : glow} />
    {ui === "feed" && [-24, -6, 12].map((yy) => <rect key={yy} x={-14} y={yy} width={28} height={13} rx={3} fill="#ffffff" opacity={0.65} />)}
    {ui === "video" && <><rect x={-14} y={-26} width={28} height={30} rx={3} fill="#ffffff" opacity={0.7} /><polygon points="-4,-18 -4,-4 8,-11" fill="#1b1b22" /></>}
  </g>
);

export const Notebook: React.FC<{ x: number; y: number; rot?: number; s?: number; open?: boolean; color?: string }> = ({ x, y, rot = 0, s = 1, open, color = "#e8b04a" }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {open ? (
      <>
        <rect x={-46} y={-30} width={92} height={60} rx={4} fill="#fbf7ea" stroke="#a8a08a" strokeWidth={2} />
        <line x1={0} y1={-30} x2={0} y2={30} stroke="#a8a08a" strokeWidth={2} />
        {[-18, -6, 6, 18].map((yy) => <g key={yy}><line x1={-40} x2={-6} y1={yy} y2={yy} stroke="#9aa6c0" strokeWidth={2} /><line x1={6} x2={40} y1={yy} y2={yy} stroke="#9aa6c0" strokeWidth={2} /></g>)}
      </>
    ) : (
      <>
        <rect x={-22} y={-32} width={44} height={64} rx={4} fill={color} stroke="#7a5a1a" strokeWidth={2} />
        <rect x={-22} y={-32} width={9} height={64} rx={3} fill="#00000022" />
        <rect x={-6} y={-18} width={20} height={4} rx={2} fill="#fff" opacity={0.7} /><rect x={-6} y={-8} width={14} height={4} rx={2} fill="#fff" opacity={0.5} />
      </>
    )}
  </g>
);

export const Laptop: React.FC<{ x: number; y: number; s?: number; glow?: string; screen?: "code" | "tabs" | "course" | "blank" | "timer" }> = ({ x, y, s = 1, glow = "#cfe6ff", screen = "code" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={-70} rx={150} ry={110} fill="url(#warmGlow)" opacity={screen === "tabs" ? 0 : 0.3} />
    <polygon points="-92,0 92,0 74,-118 -74,-118" fill="#1b1d26" stroke="#3a3f52" strokeWidth={3} />
    <polygon points="-82,-8 82,-8 68,-110 -68,-110" fill={glow} />
    {screen === "code" && [-96, -80, -64, -48, -32].map((yy, i) => <rect key={yy} x={-58 + (i % 2) * 8} y={yy} width={70 - (i % 3) * 14} height={7} rx={3} fill="#2a4a7a" opacity={0.8} />)}
    {screen === "course" && <><rect x={-56} y={-100} width={112} height={62} rx={4} fill="#1e2a44" /><polygon points="-10,-86 -10,-52 20,-69" fill="#ffffff" /><rect x={-56} y={-30} width={80} height={7} rx={3} fill="#2a4a7a" opacity={0.8} /></>}
    {screen === "timer" && <text x={0} y={-48} textAnchor="middle" fontFamily={FONT} fontSize={32} fill="#1d3a6a">20:00</text>}
    <rect x={-104} y={0} width={208} height={12} rx={6} fill="#2b2e3a" stroke="#3a3f52" strokeWidth={2} />
  </g>
);

export const Cup: React.FC<{ x: number; y: number; s?: number; steam?: boolean }> = ({ x, y, s = 1, steam = true }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={2} cy={4} rx={32} ry={7} fill="#000" opacity={0.2} />
    <path d="M-20 -34 H20 L16 0 H-16 Z" fill="#f4efe4" stroke="#bdb6a3" strokeWidth={2} />
    <path d="M20 -26 Q38 -24 36 -12 Q34 -2 18 -4" fill="none" stroke="#bdb6a3" strokeWidth={4} />
    <ellipse cx={0} cy={-34} rx={20} ry={5} fill="#5a3a22" />
    {steam && [-8, 4, 14].map((dx, i) => <path key={i} d={`M${dx} -42 q-6 -10 0 -18 q6 -8 0 -16`} fill="none" stroke="#fff" strokeWidth={3} opacity={0.5} strokeLinecap="round" />)}
  </g>
);

// ---------------------------------------------------------------- furniture
export const Window: React.FC<{ x: number; y: number; w: number; h: number; sky?: "skyMorning" | "skyNight" | "skyDay" | "skyDusk"; curtains?: "open" | "closed" | "none"; beam?: "warm" | "cool" | "none"; floorY?: number }> = ({ x, y, w, h, sky = "skyMorning", curtains = "none", beam = "none", floorY = 1400 }) => (
  <g>
    {beam !== "none" && <polygon points={`${x},${y + h} ${x + w},${y + h} ${x + w + 90},${floorY} ${x - 120},${floorY}`} fill={beam === "warm" ? "url(#beamWarm)" : "url(#beamCool)"} opacity={0.8} />}
    <rect x={x - 12} y={y - 12} width={w + 24} height={h + 24} rx={6} fill="#6b4a32" />
    <rect x={x} y={y} width={w} height={h} fill={`url(#${sky})`} />
    {sky === "skyNight" && Array.from({ length: 12 }, (_, i) => <circle key={i} cx={x + 10 + rnd(i) * (w - 20)} cy={y + 10 + rnd(i + 30) * h * 0.55} r={1.6 + rnd(i + 5) * 1.4} fill="#fff" opacity={0.8} />)}
    {sky === "skyMorning" && <circle cx={x + w * 0.7} cy={y + h * 0.7} r={46} fill="#fff3c8" opacity={0.9} />}
    <rect x={x + w / 2 - 4} y={y} width={8} height={h} fill="#6b4a32" /><rect x={x} y={y + h * 0.5 - 4} width={w} height={8} fill="#6b4a32" />
    {curtains === "closed" && <rect x={x - 8} y={y - 8} width={w + 16} height={h + 16} fill={sky === "skyMorning" ? "#c9d2ee" : "#3a4466"} opacity={0.96} />}
    {curtains === "open" && (<><path d={`M${x - 18} ${y - 20} q40 ${h * 0.5} 8 ${h + 40} h-30 Z`} fill="#c06a4a" /><path d={`M${x + w + 18} ${y - 20} q-40 ${h * 0.5} -8 ${h + 40} h30 Z`} fill="#c06a4a" /></>)}
    <rect x={x - 20} y={y - 24} width={w + 40} height={9} rx={4} fill="#4a3322" />
  </g>
);

export const Bed: React.FC<{ x: number; y: number; w: number; tone: "warm" | "cool"; messy?: boolean; layer?: "base" | "cover" }> = ({ x, y, w, tone, messy, layer = "base" }) => {
  const frame = tone === "warm" ? "#8a5a3a" : "#3a3550", mat = tone === "warm" ? "#f3ead8" : "#9aa3c8", blanket = tone === "warm" ? "#5a8f78" : "#46508a";
  if (layer === "cover") {
    return (
      <g>
        <path d={`M${x + 120} ${y - 150} H${x + w} V${y} H${x + 120} ${messy ? "q-20 -30 10 -50 q-26 -26 -10 -50 Z" : "Z"}`} fill={blanket} />
        {[0.3, 0.55, 0.8].map((k) => <path key={k} d={`M${x + 120 + (w - 120) * k} ${y - 148} q${messy ? 18 : 6} 70 0 146`} fill="none" stroke="#00000028" strokeWidth={3} />)}
      </g>
    );
  }
  return (
    <g>
      <ellipse cx={x + w / 2} cy={y + 8} rx={w * 0.55} ry={16} fill="#000" opacity={0.25} />
      <rect x={x} y={y - 150} width={w} height={150} rx={14} fill={mat} stroke="#00000030" strokeWidth={3} />
      <rect x={x - 14} y={y - 260} width={26} height={270} rx={8} fill={frame} /><rect x={x + w - 12} y={y - 190} width={26} height={200} rx={8} fill={frame} />
      <ellipse cx={x + 70} cy={y - 164} rx={64} ry={24} fill={tone === "warm" ? "#fffaf0" : "#c8cde8"} stroke="#00000022" strokeWidth={2} />
    </g>
  );
};

export const Nightstand: React.FC<{ x: number; y: number; tone: "warm" | "cool"; clock?: string }> = ({ x, y, tone, clock }) => (
  <g>
    <ellipse cx={x + 36} cy={y + 6} rx={50} ry={9} fill="#000" opacity={0.25} />
    <rect x={x} y={y - 110} width={72} height={110} rx={6} fill={tone === "warm" ? "#9a6a44" : "#3f3a56"} stroke="#00000030" strokeWidth={2} />
    <rect x={x + 8} y={y - 98} width={56} height={44} rx={4} fill="#00000022" /><circle cx={x + 36} cy={y - 76} r={4} fill="#d8c8a0" />
    {clock && (<g><rect x={x + 10} y={y - 142} width={52} height={32} rx={6} fill="#16161d" /><text x={x + 36} y={y - 119} textAnchor="middle" fontFamily={FONT} fontSize={20} fill="#ff5a4a">{clock}</text></g>)}
  </g>
);

export const Desk: React.FC<{ x: number; y: number; w: number; tone?: "warm" | "cool" }> = ({ x, y, w, tone = "warm" }) => (
  <g>
    <ellipse cx={x + w / 2} cy={y + 8} rx={w * 0.55} ry={14} fill="#000" opacity={0.25} />
    <rect x={x + 14} y={y - 150} width={14} height={150} fill={tone === "warm" ? "#7a5236" : "#3a3550"} /><rect x={x + w - 28} y={y - 150} width={14} height={150} fill={tone === "warm" ? "#7a5236" : "#3a3550"} />
    <rect x={x} y={y - 168} width={w} height={22} rx={5} fill={tone === "warm" ? "#a8744c" : "#4a4468"} stroke="#00000030" strokeWidth={2} />
  </g>
);

export const Chair: React.FC<{ x: number; y: number; flip?: boolean }> = ({ x, y, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
    <ellipse cx={0} cy={4} rx={50} ry={9} fill="#000" opacity={0.22} />
    <rect x={-48} y={-250} width={16} height={150} rx={6} fill="#4a5a78" /><rect x={-48} y={-124} width={104} height={20} rx={7} fill="#5a6c8c" />
    <rect x={-6} y={-104} width={12} height={104} fill="#2a2f3c" /><rect x={-40} y={-6} width={80} height={9} rx={4} fill="#2a2f3c" />
  </g>
);

export const Lamp: React.FC<{ x: number; y: number; on?: boolean; floorY?: number }> = ({ x, y, on = true, floorY }) => (
  <g>
    {on && <polygon points={`${x - 30},${y - 62} ${x + 60},${y - 62} ${x + 190},${floorY ?? y + 380} ${x - 190},${floorY ?? y + 380}`} fill="url(#beamWarm)" opacity={0.75} />}
    <rect x={x - 28} y={y - 6} width={56} height={9} rx={4} fill="#2b2e3a" />
    <polyline points={`${x},${y - 4} ${x - 10},${y - 80} ${x + 50},${y - 120}`} fill="none" stroke="#2b2e3a" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
    <path d={`M${x + 28} ${y - 134} L${x + 78} ${y - 104} L${x + 64} ${y - 84} L${x + 24} ${y - 108} Z`} fill={on ? "#ffd27a" : "#555"} stroke="#2b2e3a" strokeWidth={3} />
    {on && <ellipse cx={x + 58} cy={y - 92} rx={44} ry={36} fill="url(#warmGlow)" />}
  </g>
);

export const Shelf: React.FC<{ x: number; y: number; w: number; seed?: number }> = ({ x, y, w, seed = 1 }) => (
  <g>
    <rect x={x} y={y} width={w} height={9} rx={3} fill="#6b4a32" />
    {Array.from({ length: Math.floor(w / 15) }, (_, i) => { const h = 44 + rnd(i + seed) * 34, c = ["#c0504a", "#4a78c0", "#e0b040", "#4aa07a", "#8a5ab0", "#d8d0c0"][Math.floor(rnd(i + seed * 3) * 6)]; return <rect key={i} x={x + 6 + i * 15} y={y - h} width={12} height={h} rx={2} fill={c} stroke="#00000022" strokeWidth={1.5} />; })}
  </g>
);

export const Sofa: React.FC<{ x: number; y: number; w: number }> = ({ x, y, w }) => (
  <g>
    <ellipse cx={x + w / 2} cy={y + 8} rx={w * 0.55} ry={14} fill="#000" opacity={0.3} />
    <rect x={x} y={y - 230} width={w} height={150} rx={24} fill="#4a4f7a" />
    <rect x={x - 20} y={y - 150} width={50} height={150} rx={18} fill="#3d4168" /><rect x={x + w - 30} y={y - 150} width={50} height={150} rx={18} fill="#3d4168" />
    <rect x={x + 20} y={y - 120} width={w - 40} height={64} rx={14} fill="#565c8c" />
    <rect x={x + 30} y={y - 56} width={14} height={50} fill="#2a2d42" /><rect x={x + w - 44} y={y - 56} width={14} height={50} fill="#2a2d42" />
  </g>
);

export const Table: React.FC<{ x: number; y: number; w: number }> = ({ x, y, w }) => (
  <g>
    <ellipse cx={x + w / 2} cy={y + 8} rx={w * 0.5} ry={14} fill="#000" opacity={0.28} />
    <rect x={x + w / 2 - 12} y={y - 140} width={24} height={140} fill="#5a3a26" /><rect x={x + w / 2 - 60} y={y - 10} width={120} height={12} rx={6} fill="#5a3a26" />
    <rect x={x} y={y - 160} width={w} height={22} rx={8} fill="#b07a4a" stroke="#00000030" strokeWidth={2} />
  </g>
);

export const Calendar: React.FC<{ cx: number; cy: number; w: number; month: string; year?: string; flipping?: number }> = ({ cx, cy, w, month, year, flipping = 0 }) => {
  const h = w * 1.15, x = cx - w / 2, y = cy - h / 2;
  return (
    <g>
      <rect x={x + 8} y={y + 12} width={w} height={h} rx={12} fill="#000" opacity={0.28} />
      <rect x={x} y={y} width={w} height={h} rx={12} fill="#fbf7ea" stroke="#c8c0aa" strokeWidth={3} />
      <rect x={x} y={y} width={w} height={h * 0.2} rx={12} fill="#d8453a" />
      <rect x={x} y={y + h * 0.1} width={w} height={h * 0.1} fill="#d8453a" />
      {[0.18, 0.5, 0.82].map((k) => <circle key={k} cx={x + w * k} cy={y} r={8} fill="#2a2a32" />)}
      <text x={cx} y={y + h * 0.15} textAnchor="middle" fontFamily={FONT} fontSize={w * 0.11} fill="#fff">{month}{year ? ` ${year}` : ""}</text>
      {Array.from({ length: 35 }, (_, i) => <text key={i} x={x + w * 0.12 + (i % 7) * w * 0.126} y={y + h * 0.36 + Math.floor(i / 7) * h * 0.115} textAnchor="middle" fontFamily={FONT} fontSize={w * 0.06} fill={i % 7 === 6 ? "#d8453a" : "#4a4a55"}>{(i % 31) + 1}</text>)}
      {flipping > 0 && <polygon points={`${x},${y} ${x + w},${y} ${x + w - w * 0.12 * flipping},${y - h * 0.3 * flipping} ${x + w * 0.12 * flipping},${y - h * 0.32 * flipping}`} fill="#f3ecd8" stroke="#c8c0aa" strokeWidth={3} />}
    </g>
  );
};

export const Whiteboard: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => (
  <g>
    <rect x={x - 8} y={y - 8} width={w + 16} height={h + 16} rx={10} fill="#8d9096" />
    <rect x={x} y={y} width={w} height={h} rx={6} fill="#f6f8fb" />
    <polyline points={`${x + 24},${y + h - 30} ${x + w * 0.3},${y + h * 0.6} ${x + w * 0.5},${y + h * 0.66} ${x + w * 0.72},${y + h * 0.36} ${x + w - 24},${y + 30}`} fill="none" stroke="#2f9e6a" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
    {[0.25, 0.45, 0.65, 0.85].map((k, i) => <rect key={k} x={x + w * k - 16} y={y + h - 26 - 22 - i * 18} width={32} height={22 + i * 18} rx={3} fill="#4a78c0" opacity={0.85} />)}
    <line x1={x + 24} x2={x + 24} y1={y + 24} y2={y + h - 24} stroke="#9aa" strokeWidth={3} /><line x1={x + 24} x2={x + w - 24} y1={y + h - 24} y2={y + h - 24} stroke="#9aa" strokeWidth={3} />
  </g>
);

export const Browser: React.FC<{ x: number; y: number; w: number; h: number; tabs?: number }> = ({ x, y, w, h, tabs = 9 }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={10} fill="#eef1f6" stroke="#a8b0c0" strokeWidth={3} />
    <rect x={x} y={y} width={w} height={34} rx={10} fill="#cfd5e2" />
    {Array.from({ length: tabs }, (_, i) => <rect key={i} x={x + 8 + i * ((w - 20) / tabs)} y={y + 8} width={(w - 20) / tabs - 4} height={26} rx={6} fill={i === 0 ? "#fff" : "#b8c0d2"} stroke="#9aa3b8" strokeWidth={1.5} />)}
    {[0, 1, 2].map((i) => <rect key={i} x={x + 16} y={y + 56 + i * 26} width={w * (0.7 - i * 0.14)} height={10} rx={5} fill="#b8c0d2" />)}
  </g>
);

export const Plant: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={4} rx={36} ry={7} fill="#000" opacity={0.2} />
    <path d="M-26 -50 H26 L20 0 H-20 Z" fill="#b8643a" />
    {[-30, -12, 8, 28].map((a, i) => <path key={i} d={`M0 -50 Q${a * 1.4} -${100 + i * 14} ${a * 2} -${150 + i * 10}`} fill="none" stroke="#3f9a5a" strokeWidth={14} strokeLinecap="round" />)}
  </g>
);

export const Poster: React.FC<{ x: number; y: number; w: number; h: number; color: string; rot?: number }> = ({ x, y, w, h, color, rot = 0 }) => (
  <g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}>
    <rect x={x} y={y} width={w} height={h} fill={color} stroke="#00000030" strokeWidth={3} />
    <circle cx={x + w / 2} cy={y + h * 0.38} r={w * 0.22} fill="#ffffff" opacity={0.55} /><rect x={x + w * 0.2} y={y + h * 0.7} width={w * 0.6} height={8} rx={4} fill="#fff" opacity={0.6} />
  </g>
);

/** clutter for Ben's room: clothes, cans, a pizza box */
export const Clutter: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <path d={`M${x} ${y} q30 -26 70 -8 q18 12 -6 22 q-40 10 -64 -14 Z`} fill="#5a6a96" />
    <rect x={x + 100} y={y - 28} width={22} height={34} rx={5} fill="#c04a4a" /><rect x={x + 130} y={y - 22} width={22} height={28} rx={5} fill="#d8a838" transform={`rotate(24 ${x + 140} ${y})`} />
    <rect x={x + 190} y={y - 14} width={110} height={16} rx={3} fill="#c8a070" /><rect x={x + 196} y={y - 24} width={98} height={12} rx={3} fill="#d8b080" transform={`rotate(-6 ${x + 240} ${y - 18})`} />
  </g>
);

/** a city street seen through the cafe window: buildings with lit windows */
export const Street: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill="url(#skyDusk)" />
    {Array.from({ length: 6 }, (_, i) => { const bw = 70 + rnd(i) * 40, bx = x + i * (w / 6), bh = 120 + rnd(i + 9) * (h * 0.5); return (<g key={i}><rect x={bx} y={y + h - bh} width={bw} height={bh} fill={["#3a4468", "#4a5278", "#2f3858"][i % 3]} />{Array.from({ length: 6 }, (__, k) => <rect key={k} x={bx + 10 + (k % 2) * 28} y={y + h - bh + 14 + Math.floor(k / 2) * 34} width={16} height={20} rx={2} fill={rnd(i * 7 + k) > 0.4 ? "#ffdc8a" : "#2a3050"} />)}</g>); })}
    <rect x={x} y={y + h - 22} width={w} height={22} fill="#2a2d3a" />
  </g>
);

// ---------------------------------------------------------------- overlays
export const BigText: React.FC<{ x: number; y: number; w: number; size: number; color?: string; lines: string[]; shadow?: boolean }> = ({ x, y, w, size, color = "#ffffff", lines }) => (
  <Overlay>
    {lines.map((tx, i) => <text key={i} x={x + w / 2} y={y + i * size * 1.1} textAnchor="middle" fontFamily={MONO ? '"Segoe UI", Arial, sans-serif' : FONT} fontWeight={MONO ? 700 : 900} fontSize={size} letterSpacing={MONO ? size * 0.06 : 0} fill={MONO ? "#ffffff" : color} stroke="#000" strokeWidth={MONO ? size * 0.05 : size * 0.16} paintOrder="stroke" strokeLinejoin="round">{tx}</text>)}
  </Overlay>
);

export type { V };

// ---------------------------------------------------------------- big readable props (v2)
/** a laptop showing an online lecture: video pane with a play button, a progress bar, a notes column, chapter ticks; a warm glow */
export const LectureLaptop: React.FC<{ x: number; y: number; s?: number; done?: boolean }> = ({ x, y, s = 1, done }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={-80} rx={190} ry={130} fill="url(#warmGlow)" opacity={0.4} />
    <polygon points="-110,0 110,0 90,-146 -90,-146" fill="#1b1d26" stroke="#3a3f52" strokeWidth={3} />
    <polygon points="-99,-9 99,-9 81,-137 -81,-137" fill="#f2f7ff" />
    {done ? (
      <>
        <rect x={-62} y={-122} width={124} height={86} rx={6} fill="#fffaf0" stroke="#d4b25a" strokeWidth={4} />
        <text x={0} y={-92} textAnchor="middle" fontFamily={FONT} fontSize={16} fill="#8a6a1a">COURSE</text><text x={0} y={-72} textAnchor="middle" fontFamily={FONT} fontSize={16} fill="#8a6a1a">COMPLETE</text>
        <circle cx={0} cy={-50} r={9} fill="#2f9e6a" /><polyline points="-4,-50 -1,-46 5,-54" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
      </>
    ) : (
      <>
        <rect x={-88} y={-128} width={112} height={68} rx={4} fill="#1e2a44" />
        <circle cx={-32} cy={-94} r={15} fill="#fff" opacity={0.9} /><polygon points="-37,-102 -37,-86 -24,-94" fill="#1e2a44" />
        <rect x={-88} y={-52} width={112} height={7} rx={3} fill="#cfd8ea" /><rect x={-88} y={-52} width={64} height={7} rx={3} fill="#e0443a" />
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={32} y={-126 + i * 16} width={52 - (i % 3) * 12} height={8} rx={4} fill="#7a90b8" />)}
        {[0, 1, 2].map((i) => <rect key={i} x={-88 + i * 38} y={-36} width={30} height={14} rx={3} fill="#cfe0ff" stroke="#8aa4d8" strokeWidth={1.5} />)}
      </>
    )}
    <rect x={-122} y={0} width={244} height={13} rx={6} fill="#2b2e3a" stroke="#3a3f52" strokeWidth={2} />
  </g>
);

/** a phone held sideways, playing a racing game: road in perspective, a red car, score, two thumb pads; a strong blue glow */
export const GamePhone: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx={0} cy={-6} rx={170} ry={120} fill="url(#coolGlow)" opacity={0.8} />
    <rect x={-84} y={-44} width={168} height={88} rx={12} fill="#0b0b10" stroke="#3a3a48" strokeWidth={3} />
    <rect x={-76} y={-37} width={152} height={74} rx={7} fill="#7fc4ff" />
    <polygon points="-76,37 76,37 76,-8 -76,-8" fill="#3a8a4a" /><polygon points="-62,37 62,37 12,-8 -12,-8" fill="#3a3f4a" />
    {[0, 1, 2].map((i) => <rect key={i} x={-2.5 + 0} y={-4 + i * 14} width={5} height={7 + i * 2} fill="#fff" opacity={0.9} />)}
    <rect x={-14} y={14} width={28} height={16} rx={4} fill="#e0443a" /><rect x={-10} y={10} width={20} height={9} rx={3} fill="#ffb8b0" />
    <circle cx={28} cy={-26} r={7} fill="#ffe98a" /><text x={-70} y={-24} fontFamily={FONT} fontSize={13} fill="#fff" stroke="#16324a" strokeWidth={3} paintOrder="stroke">LVL 12</text>
    <text x={70} y={-24} textAnchor="end" fontFamily={FONT} fontSize={13} fill="#ffe98a" stroke="#16324a" strokeWidth={3} paintOrder="stroke">9,840</text>
    <circle cx={-92} cy={0} r={14} fill="#2a2a34" stroke="#55556a" strokeWidth={2} /><circle cx={92} cy={0} r={14} fill="#2a2a34" stroke="#55556a" strokeWidth={2} />
  </g>
);
