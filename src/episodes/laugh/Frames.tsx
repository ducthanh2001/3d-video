// "LET THEM LAUGH" — style frames. Drawn after the competitor's million-view look: big shaded props (gradient, volume), filled
// grey terrain instead of a bare line, monospace labels, thick white stick figures in a lot of black. B&W + gold only.
// 0 hook: the first gold stroke, the crowd laughs · S the stones: they throw words, he builds a castle out of them · 1 the skate ramp: laughed at every fall, then the trick · 2 the little food cart: now they wait in line · 3 the backpack: he carried their words for years, then put them down · 4 the wall again: the mural, the crowd photographs it
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { V } from "../../kit/core";
import { Hero, HeroLook, POSES, Pose, run, walk } from "../../kit/hero";
import { KitDefs, Vignette } from "../../kit/materials";
import { Glow, Rays } from "../../kit/fx";
import { BOLD, BOLD_GREY, Defs, GOLD, SANS } from "../samehours/StyleFrames";
import { J, Punch, reach } from "../beatyesterday/StyleFrames";

export const LAUGH_FRAMES = 6;
export const MONO = "Consolas, 'Courier New', monospace";
export const HERO: HeroLook = { ...BOLD, eyes: "side" };
export const GREY: HeroLook = { ...BOLD_GREY, glow: 0, eyes: "side", eyeColor: "#1a1a1e" };
export const GHOST: HeroLook = { ...BOLD_GREY, glow: 0 };
export const rnd = (i: number) => { const x = Math.sin(i * 91.7 + 3.1) * 43758.5; return x - Math.floor(x); };

export const Tag: React.FC<{ x: number; y: number; t: string; gold?: boolean; size?: number; dim?: boolean }> = ({ x, y, t, gold, size = 34, dim }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={size} letterSpacing={2} fill={gold ? GOLD : dim ? "#6a6a72" : "#e8e8ec"}>{t}</text>
);
/** filled terrain slab (the competitor's grounds are solid shapes, lit on the top edge) */
export const Floor: React.FC<{ y: number; h?: number }> = ({ y, h = 260 }) => {
  const id = `fl${y}`;
  return (
    <g>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a3a40" /><stop offset="1" stopColor="#000" /></linearGradient></defs>
      <rect x={0} y={y} width={1080} height={h} fill={`url(#${id})`} />
      <line x1={0} y1={y} x2={1080} y2={y} stroke="#9a9aa2" strokeWidth={3} />
    </g>
  );
};
/** a back-view spectator: head + shoulders, grey gradient */
export const Spectator: React.FC<{ x: number; y: number; s?: number; tone?: number }> = ({ x, y, s = 1, tone = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-62 0 Q-60 -70 0 -74 Q60 -70 62 0 Z" fill={tone ? "#3a3a40" : "#4a4a52"} stroke="#000" strokeWidth={3} />
    <circle cx={0} cy={-104} r={36} fill={tone ? "#4a4a52" : "#5a5a62"} stroke="#000" strokeWidth={3} />
  </g>
);
export const Bubble: React.FC<{ x: number; y: number; t: string; gold?: boolean; r?: number }> = ({ x, y, t, gold, r = 0 }) => {
  const w = t.length * 19 + 40;
  return (
    <g transform={`rotate(${r} ${x} ${y})`}>
      <rect x={x - w / 2} y={y - 32} width={w} height={50} rx={12} fill="#0b0b0d" stroke={gold ? GOLD : "#bdbdc4"} strokeWidth={3} />
      <path d={`M${x - 8} ${y + 18} l-10 18 l22 -18`} fill="#0b0b0d" stroke={gold ? GOLD : "#bdbdc4"} strokeWidth={3} strokeLinejoin="round" />
      <text x={x} y={y + 2} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={28} fill={gold ? GOLD : "#e8e8ec"}>{t}</text>
    </g>
  );
};
/** the huge dark wall with faint blocks */
export const Wall: React.FC<{ x0: number; y0: number; x1: number; y1: number }> = ({ x0, y0, x1, y1 }) => (
  <g>
    <defs><linearGradient id="lw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1c1c20" /><stop offset="1" stopColor="#2c2c32" /></linearGradient></defs>
    <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="url(#lw)" stroke="#3a3a40" strokeWidth={3} />
    {Array.from({ length: Math.floor((y1 - y0) / 70) }, (_, r) => <line key={r} x1={x0} y1={y0 + r * 70} x2={x1} y2={y0 + r * 70} stroke="#000" strokeWidth={2} opacity={0.5} />)}
    {Array.from({ length: 60 }, (_, i) => { const r = Math.floor(i / 5), c = (i % 5) * 180 + (r % 2) * 90; return <line key={i} x1={x0 + c} y1={y0 + r * 70} x2={x0 + c} y2={y0 + r * 70 + 70} stroke="#000" strokeWidth={2} opacity={0.4} />; })}
  </g>
);
/** painter with a long roller pole */
export const Painter: React.FC<{ x: number; g: number; tip: V; s?: number; look?: HeroLook }> = ({ x, g, tip, s = 0.62, look = HERO }) => {
  const p = reach({ ...POSES.stand(), lean: -6, head: -18, fN: [30, 0], fF: [-26, 0] }, x, g, [x + 40, g - 250], [x + 20, g - 200], false, s);
  const j = J(x, g, p, false, s);
  return (
    <g>
      <line x1={j.wF[0]} y1={j.wF[1]} x2={tip[0]} y2={tip[1]} stroke="#9a9aa2" strokeWidth={7} strokeLinecap="round" />
      <rect x={tip[0] - 34} y={tip[1] - 12} width={68} height={24} rx={8} fill={GOLD} stroke="#000" strokeWidth={2.5} transform={`rotate(-30 ${tip[0]} ${tip[1]})`} />
      <Hero x={x} y={g} s={s} pose={p} look={look} />
    </g>
  );
};

// ================================================================ 0 · HOOK: the first stroke — ugly, crooked, unfinished
/** the Day 1 stroke: a shaky line from the bottom-left to a point high on the wall. In the last frame the SAME line is the ridge
 *  of the mountain his painted figure stands on (the surprise). */
export const RIDGE: V[] = Array.from({ length: 15 }, (_, i) => {
  const t = i / 14, x = 300 + t * 420, y = 1110 - t * 350 - Math.sin(t * Math.PI) * 40;
  return [x + (rnd(i + 300) - 0.5) * 18, y + (rnd(i + 400) - 0.5) * 34] as V;
});
export const ridgeD = (pts: V[]) => pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
const F0: React.FC = () => {
  const G = 1440, end = RIDGE[RIDGE.length - 1];
  return (
    <g>
      <Tag x={540} y={250} t="DAY 1" />
      <Wall x0={60} y0={330} x1={1020} y1={G} />
      <Floor y={G} />
      {/* faint chalk guides nobody notices (the plan) */}
      <g opacity={0.1} stroke="#fff" strokeWidth={2} fill="none" strokeDasharray="10 12"><circle cx={720} cy={820} r={200} /><path d="M60 1180 L300 1100 L720 760 L1020 980" /></g>
      {/* the stroke itself: shaky, too thick in places, a gap, drips running down */}
      <Glow at={[520, 930]} r={220} color={GOLD} a={0.22} />
      <path d={ridgeD(RIDGE.slice(0, 7))} fill="none" stroke={GOLD} strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" />
      <path d={ridgeD(RIDGE.slice(8))} fill="none" stroke={GOLD} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
      {[1, 3, 5, 9, 11].map((i, k) => <g key={i}><line x1={RIDGE[i][0]} y1={RIDGE[i][1]} x2={RIDGE[i][0] + 2} y2={RIDGE[i][1] + 40 + k * 18} stroke={GOLD} strokeWidth={7} strokeLinecap="round" /><circle cx={RIDGE[i][0] + 2} cy={RIDGE[i][1] + 44 + k * 18} r={7} fill={GOLD} /></g>)}
      {/* a crooked half-circle he started and gave up on, and some splatter */}
      <path d="M560 760 Q575 640 690 610 Q760 600 800 640" fill="none" stroke={GOLD} strokeWidth={10} strokeLinecap="round" opacity={0.7} />
      {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={420 + rnd(i + 60) * 360} cy={760 + rnd(i + 70) * 330} r={2 + rnd(i + 80) * 5} fill={GOLD} opacity={0.7} />)}
      <Painter x={430} g={G} tip={[end[0] - 10, end[1] + 30]} />
      {/* the crowd in front, laughing */}
      {[[120, 1660], [260, 1690], [420, 1670], [600, 1700], [780, 1670], [950, 1690]].map(([x, y], i) => <Spectator key={i} x={x} y={y} s={0.95} tone={i % 2} />)}
      <Bubble x={170} y={1500} t="HAHA" r={-6} />
      <Bubble x={480} y={1530} t="what is that?" r={3} />
      <Bubble x={860} y={1505} t="a 5 y/o did that" r={-4} />
      <Bubble x={700} y={1585} t="HAHA" r={6} />
      <text x={540} y={1840} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={46} fill="#f2f2f2">They laughed at the first stroke.</text>
    </g>
  );
};

// ================================================================ S · the stones: they throw words, he stands on them
/** a rough stone with an insult carved on it */
export const Stone: React.FC<{ x: number; y: number; w?: number; h?: number; t?: string; seed?: number; r?: number }> = ({ x, y, w = 170, h = 66, t, seed = 1, r = 0 }) => {
  const pts = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2, k = 0.86 + rnd(seed * 13 + i) * 0.16;
    return `${(x + Math.cos(a) * (w / 2) * k).toFixed(1)},${(y + Math.sin(a) * (h / 2) * k).toFixed(1)}`;
  }).join(" ");
  return (
    <g transform={`rotate(${r} ${x} ${y})`}>
      <polygon points={pts} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} strokeLinejoin="round" />
      <path d={`M${x - w * 0.3} ${y - h * 0.22} q${w * 0.25} -${h * 0.18} ${w * 0.5} 0`} stroke="#fff" strokeWidth={3} fill="none" opacity={0.25} />
      {t && <text x={x} y={y + 9} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={Math.min(24, (w * 0.9) / (t.length * 0.62))} fill="#1a1a1e">{t}</text>}
    </g>
  );
};
/** a masonry block cut from a thrown stone, with the insult still on it */
export const Block: React.FC<{ x: number; y: number; w: number; h: number; t?: string; seed: number }> = ({ x, y, w, h, t, seed }) => {
  const j = (k: number) => (rnd(seed * 7 + k) - 0.5) * 6;
  return (
    <g>
      <path d={`M${x + 8 + j(1)} ${y + j(2)} L${x + w - 8 + j(3)} ${y + j(4)} Q${x + w} ${y} ${x + w + j(5) * 0.5} ${y + 10} L${x + w + j(6) * 0.5} ${y + h - 8} Q${x + w} ${y + h} ${x + w - 10} ${y + h} L${x + 10} ${y + h} Q${x} ${y + h} ${x} ${y + h - 10} L${x + j(7) * 0.5} ${y + 10} Q${x} ${y} ${x + 8 + j(1)} ${y + j(2)} Z`} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} />
      <line x1={x + 10} y1={y + 6} x2={x + w - 14} y2={y + 6} stroke="#fff" strokeWidth={2.5} opacity={0.22} />
      {t && <text x={x + w / 2} y={y + h / 2 + 7} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={Math.min(20, (w * 0.86) / (t.length * 0.6))} fill="#1a1a1e">{t}</text>}
    </g>
  );
};
export const WORDS = ["LOL", "LOSER", "QUIT", "WEIRD", "NO WAY", "HAHA", "GIVE UP", "YOU CAN'T", "NOBODY CARES", "CRINGE", "FAKE", "JOKE", "NEVER", "STOP"];
/** a run of courses (rows) of blocks, staggered, from x0 to x1, rising from g */
export const Masonry: React.FC<{ x0: number; x1: number; g: number; rows: number; bw: number; bh?: number; seed: number }> = ({ x0, x1, g, rows, bw, bh = 54, seed }) => (
  <g>
    {Array.from({ length: rows }, (_, r) => {
      const off = r % 2 ? bw / 2 : 0, out: React.ReactNode[] = [];
      for (let x = x0 - off, c = 0; x < x1; x += bw, c++) {
        const a = Math.max(x, x0), b = Math.min(x + bw, x1), k = seed + r * 11 + c;
        if (b - a < 24) continue;
        out.push(<Block key={`${r}-${c}`} x={a + 1} y={g - (r + 1) * bh + 1} w={b - a - 2} h={bh - 2} t={rnd(k) < 0.55 ? WORDS[Math.floor(rnd(k + 3) * WORDS.length)] : undefined} seed={k} />);
      }
      return <g key={r}>{out}</g>;
    })}
  </g>
);
/** a pointed roof (cone seen from the side) with shingle rows */
export const Roof: React.FC<{ x0: number; x1: number; y: number; h: number; id: string }> = ({ x0, x1, y, h, id }) => {
  const cx = (x0 + x1) / 2, o = 18;
  return (
    <g>
      <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#5a5a62" /><stop offset="0.5" stopColor="#3a3a40" /><stop offset="1" stopColor="#1e1e22" /></linearGradient></defs>
      <path d={`M${x0 - o} ${y} L${cx} ${y - h} L${x1 + o} ${y} Q${cx} ${y + 14} ${x0 - o} ${y} Z`} fill={`url(#${id})`} stroke="#000" strokeWidth={3} strokeLinejoin="round" />
      {[0.25, 0.5, 0.75].map((k) => { const yy = y - h * (1 - k), w = (x1 - x0 + o * 2) * k / 2; return <path key={k} d={`M${cx - w} ${yy} Q${cx} ${yy + 10 * k} ${cx + w} ${yy}`} fill="none" stroke="#000" strokeWidth={2} opacity={0.6} />; })}
      <line x1={cx} y1={y - h} x2={cx - (x1 - x0) * 0.2} y2={y - 6} stroke="#fff" strokeWidth={2.5} opacity={0.18} />
    </g>
  );
};
export const Arch: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => (
  <path d={`M${x - w / 2} ${y} V${y - h + w / 2} Q${x} ${y - h - w * 0.3} ${x + w / 2} ${y - h + w / 2} V${y} Z`} fill="url(#sh-gold)" stroke="#000" strokeWidth={3} />
);
export const Merlons: React.FC<{ x0: number; x1: number; y: number; seed: number }> = ({ x0, x1, y, seed }) => {
  const n = Math.max(2, Math.round((x1 - x0) / 60)), w = (x1 - x0) / (n * 2 - 1);
  return <g>{Array.from({ length: n }, (_, i) => <Block key={i} x={x0 + i * 2 * w} y={y - 36} w={w} h={36} seed={seed + i} />)}</g>;
};
const FS: React.FC = () => {
  const G = 1480, s = 0.62, bh = 54;
  const tL = G - 11 * bh, tK = G - 8 * bh, tB = G - 14 * bh, px = 760;
  // he stands on the keep's wall-walk, catching the next stone over his head
  const catchP = reach({ ...POSES.stand(), lean: -8, head: -18, fN: [28, 0], fF: [-26, 0] }, px, tK, [px - 6, tK - 252], [px - 56, tK - 244], false, s);
  const cj = J(px, tK, catchP, false, s);
  const throwers: [number, number][] = [[60, 1], [160, 0], [255, 1]];
  return (
    <g>
      {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={rnd(i) * 1080} cy={rnd(i + 40) * 420 + 150} r={rnd(i + 80) * 2 + 0.6} fill="#fff" opacity={0.2 + rnd(i + 3) * 0.3} />)}
      <Tag x={540} y={250} t="EVERY WORD THEY THREW" size={32} dim />
      <Floor y={G} />
      {/* the crowd throwing */}
      {[[20, 1], [110, 0], [205, 1], [290, 0]].map(([x, k], i) => <Hero key={`b${i}`} x={x + 40} y={G - 4} s={0.48} pose={k ? { ...POSES.throw(), hN: [80, -60] } : { ...POSES.throw(), hN: [40, 50], hF: [-96, -60], lean: -10, head: -6 }} look={GHOST} shadow={0} opacity={0.35} />)}
      {throwers.map(([x, k], i) => <Hero key={i} x={x} y={G} s={0.52} pose={k ? POSES.throw() : { ...POSES.throw(), hN: [40, 50], hF: [-96, -60], lean: -10, head: -6 }} look={GREY} shadow={0} />)}
      {/* the castle — every block is a stone they threw, the insult still on it */}
      <Glow at={[750, 900]} r={420} color={GOLD} a={0.18} />
      {/* back: the tall central tower */}
      <Masonry x0={690} x1={830} g={G} rows={14} bw={70} seed={90} />
      <Roof x0={690} x1={830} y={tB} h={240} id="rfB" />
      <Arch x={760} y={tB + 150} w={34} h={70} />
      {/* side towers */}
      <Masonry x0={440} x1={590} g={G} rows={11} bw={75} seed={10} />
      <Roof x0={440} x1={590} y={tL} h={200} id="rfL" />
      <Arch x={515} y={tL + 170} w={34} h={66} />
      <Masonry x0={930} x1={1060} g={G} rows={11} bw={65} seed={70} />
      <Roof x0={930} x1={1060} y={tL} h={200} id="rfR" />
      <Arch x={995} y={tL + 170} w={32} h={64} />
      {/* the keep in front, with its wall-walk and gate */}
      <Masonry x0={590} x1={930} g={G} rows={8} bw={85} seed={40} />
      <Merlons x0={590} x1={930} y={tK} seed={200} />
      <Glow at={[760, G - 90]} r={150} color={GOLD} a={0.45} />
      <Arch x={760} y={G} w={110} h={190} />
      {[650, 870].map((x) => <Arch key={x} x={x} y={G - 250} w={34} h={70} />)}
      {/* his flag on the tallest roof */}
      <line x1={760} y1={tB - 240} x2={760} y2={tB - 400} stroke="#d8d8dc" strokeWidth={6} />
      <path d={`M763 ${tB - 396} q50 14 96 0 q-12 30 0 60 q-46 14 -96 0 Z`} fill={GOLD} stroke="#000" strokeWidth={2} />
      {/* stones in the air */}
      {([[300, 1150, "LOL", -14], [380, 960, "QUIT", 10]] as [number, number, string, number][]).map(([x, y, t, r], i) => (
        <g key={i}>
          {[0, 1, 2].map((k) => <line key={k} x1={x - 90 - k * 10} y1={y + 12 + k * 14 - 20} x2={x - 170 - k * 10} y2={y + 40 + k * 14 - 20} stroke="#8a8a92" strokeWidth={3} strokeLinecap="round" opacity={0.6 - k * 0.15} />)}
          <Stone x={x} y={y} w={120} h={52} t={t} seed={i + 30} r={r} />
        </g>
      ))}
      <Glow at={[px, tK - 160]} r={220} color={GOLD} a={0.35} />
      <Hero x={px} y={tK} s={s} pose={catchP} look={HERO} />
      <Stone x={(cj.wN[0] + cj.wF[0]) / 2} y={Math.min(cj.wN[1], cj.wF[1]) - 22} w={130} h={54} t="FAILURE" seed={77} r={-8} />
      <Punch l1="They threw stones." l2="He built a castle." y={1730} />
    </g>
  );
};

// ================================================================ 1 · the skate ramp: they laughed at every fall
export const Board: React.FC<{ x: number; y: number; r?: number; gold?: boolean; a?: number }> = ({ x, y, r = 0, gold, a = 1 }) => (
  <g transform={`rotate(${r} ${x} ${y})`} opacity={a}>
    <path d={`M${x - 74} ${y - 10} Q${x - 84} ${y - 22} ${x - 70} ${y - 22} H${x + 70} Q${x + 84} ${y - 22} ${x + 74} ${y - 10} Z`} fill={gold ? "url(#sh-gold)" : "url(#sh-grey)"} stroke="#000" strokeWidth={3} />
    {[-46, 46].map((d) => <circle key={d} cx={x + d} cy={y - 2} r={9} fill="#d8d8dc" stroke="#000" strokeWidth={2.5} />)}
  </g>
);
const F1: React.FC = () => {
  const G = 1480, s = 0.62, hx = 600, hy = G - 600;
  // mid-air over the lip, grabbing the board: the trick he fell 47 times learning
  const air: Pose = { hip: [0, -150], lean: 14, head: -10, hN: [40, 120], hF: [-130, -10], fN: [36, -16], fF: [-34, -16], elbow: 1 };
  return (
    <g>
      <defs><linearGradient id="ramp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a4a52" /><stop offset="1" stopColor="#141416" /></linearGradient></defs>
      <Tag x={540} y={250} t="FALLS: 47" size={40} />
      {/* the quarter-pipe */}
      <path d={`M380 ${G} Q860 ${G} 880 ${G - 420} H1080 V${G} Z`} fill="url(#ramp)" stroke="#000" strokeWidth={3} />
      <path d={`M380 ${G} Q860 ${G} 880 ${G - 420}`} fill="none" stroke="#bdbdc4" strokeWidth={5} />
      <rect x={872} y={G - 432} width={208} height={14} fill="#9a9aa2" stroke="#000" strokeWidth={2} />
      <Floor y={G} />
      {/* the falls: ghosts on the floor, boards flipped, and the old laughs */}
      <Hero x={460} y={G} s={s} pose={POSES.lie()} look={GHOST} opacity={0.25} shadow={0} />
      <Board x={560} y={G} r={170} a={0.3} />
      <Hero x={240} y={G} s={s} pose={POSES.fallBack()} look={GHOST} opacity={0.2} shadow={0} rot={-30} />
      <Board x={300} y={G - 6} r={-20} a={0.25} />
      {/* now: in the air, above the lip */}
      <Glow at={[hx, hy - 120]} r={260} color={GOLD} a={0.4} />
      {[0, 1, 2].map((i) => <path key={i} d={`M${hx + 180 + i * 30} ${hy + 120 - i * 50} q-60 -40 -140 -30`} fill="none" stroke="#8a8a92" strokeWidth={3} strokeLinecap="round" opacity={0.6 - i * 0.15} />)}
      <g transform={`rotate(-18 ${hx} ${hy})`}>
        <Hero x={hx} y={hy} s={s} pose={air} look={HERO} shadow={0} />
        <Board x={hx} y={hy + 6} gold />
      </g>
      {/* the crowd: they laughed at every fall; at the landing they go quiet */}
      {[[140, 1700], [300, 1730], [470, 1710], [640, 1730]].map(([x, y], i) => <Spectator key={i} x={x} y={y} s={0.9} tone={i % 2} />)}
      <g opacity={0.3}><Bubble x={160} y={1500} t="HAHA" r={-6} /><Bubble x={420} y={1530} t="lol" r={4} /></g>
      <Bubble x={300} y={1580} t="…" />
      <Bubble x={600} y={1560} t="wait WHAT" gold />
      <text x={540} y={1840} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={44} fill="#f2f2f2">They laughed at every fall.</text>
      <text x={540} y={1900} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={50} fill={GOLD}>Nobody laughs at the landing.</text>
    </g>
  );
};

// ================================================================ 2 · the little food cart: now they wait in line
export const Cart: React.FC<{ x: number; g: number }> = ({ x, g }) => (
  <g>
    {/* awning */}
    {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${x - 150 + i * 50} ${g - 330} h50 l0 40 q-25 18 -50 0 Z`} fill={i % 2 ? "#e8e8ec" : "#5a5a62"} stroke="#000" strokeWidth={2.5} />)}
    <line x1={x - 140} y1={g - 290} x2={x - 140} y2={g - 170} stroke="#9a9aa2" strokeWidth={6} />
    <line x1={x + 140} y1={g - 290} x2={x + 140} y2={g - 170} stroke="#9a9aa2" strokeWidth={6} />
    {/* sign */}
    <rect x={x - 110} y={g - 400} width={220} height={58} rx={8} fill="url(#sh-gold)" stroke="#000" strokeWidth={3} />
    <text x={x} y={g - 360} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={32} fill="#1a1a1a">OPEN</text>
    {/* body */}
    <rect x={x - 160} y={g - 170} width={320} height={120} rx={10} fill="url(#sh-grey)" stroke="#000" strokeWidth={3} />
    <rect x={x - 170} y={g - 180} width={340} height={16} rx={4} fill="#d8d8dc" stroke="#000" strokeWidth={2} />
    {[-100, 100].map((d) => <circle key={d} cx={x + d} cy={g - 34} r={32} fill="#3a3a40" stroke="#d8d8dc" strokeWidth={5} />)}
    {/* steam from the pot */}
    <rect x={x + 40} y={g - 214} width={70} height={36} rx={6} fill="#9a9aa2" stroke="#000" strokeWidth={2.5} />
    {[0, 1, 2].map((i) => <path key={i} d={`M${x + 55 + i * 20} ${g - 222} q-10 -20 0 -40 q10 -20 0 -40`} fill="none" stroke="#d8d8dc" strokeWidth={3} opacity={0.55} />)}
  </g>
);
const F2: React.FC = () => {
  const G = 1460, cx = 760, s = 0.6;
  const serve = reach({ ...POSES.stand(), head: 6 }, cx + 40, G - 60, [cx - 150, G - 220], [cx - 120, G - 214], true, s);
  const queue = [600, 500, 400, 300, 200, 100];
  return (
    <g>
      <Tag x={540} y={250} t="DAY 365" gold size={40} />
      <Tag x={540} y={300} t="(day 1: 0 customers)" dim size={26} />
      <Floor y={G} />
      <Glow at={[cx, G - 300]} r={300} color={GOLD} a={0.3} />
      {/* he serves from behind the cart */}
      <Hero x={cx + 40} y={G - 60} s={s} pose={serve} flip look={HERO} shadow={0} />
      <Cart x={cx} g={G} />
      {/* the line: the same people who laughed at the little cart */}
      {queue.map((x, i) => <Hero key={i} x={x} y={G} s={s} pose={i === 0 ? reach({ ...POSES.stand(), head: -6 }, x, G, [cx - 160, G - 210], undefined, false, s) : { ...POSES.stand(), head: i % 2 ? 8 : -4 }} look={GREY} />)}
      <g opacity={0.3}><Bubble x={260} y={G - 360} t="HAHA, a cart?" r={-4} /></g>
      <Bubble x={420} y={G - 300} t="one more pls" gold r={3} />
      <Punch l1="They laughed at his little cart." l2="Now they wait in line." y={1730} />
    </g>
  );
};

// ================================================================ 3 · the backpack: he carried their words for years, then put them down
/** the backpack stuffed with their words; c = centre, r = tilt, k = size */
export const Pack: React.FC<{ c: V; r?: number; k?: number; spilled?: boolean; n?: number }> = ({ c, r = 0, k = 1, spilled, n = 6 }) => {
  const w = 170 * k, h = 220 * k, sheets = ["LOL", "LOSER", "QUIT", "WEIRD", "NO WAY", "GIVE UP"].slice(0, n);
  return (
    <g transform={`rotate(${r} ${c[0]} ${c[1]})`}>
      {/* their words sticking out of the top */}
      {!spilled && sheets.map((t, i) => (
        <g key={t} transform={`rotate(${(i - 2.5) * 9} ${c[0] - w / 2 + 20 + i * (w - 40) / 5} ${c[1] - h / 2})`}>
          <rect x={c[0] - w / 2 + i * (w - 40) / 5} y={c[1] - h / 2 - 56 * k} width={58 * k} height={70 * k} rx={3} fill="#e8e8ec" stroke="#000" strokeWidth={2} />
          <text x={c[0] - w / 2 + 29 * k + i * (w - 40) / 5} y={c[1] - h / 2 - 22 * k} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={Math.min(16, 50 / (t.length * 0.62)) * k} fill="#1a1a1e">{t}</text>
        </g>
      ))}
      <rect x={c[0] - w / 2} y={c[1] - h / 2} width={w} height={h} rx={34 * k} fill="url(#sh-grey)" stroke="#000" strokeWidth={3.5} />
      <rect x={c[0] - w / 2 + 18 * k} y={c[1] + h * 0.05} width={w - 36 * k} height={h * 0.34} rx={16 * k} fill="#5a5a62" stroke="#000" strokeWidth={2.5} />
      <path d={`M${c[0] - w / 2 + 10} ${c[1] - h / 2 + 30 * k} Q${c[0]} ${c[1] - h / 2 + 70 * k} ${c[0] + w / 2 - 10} ${c[1] - h / 2 + 30 * k}`} fill="none" stroke="#000" strokeWidth={3} />
      <text x={c[0]} y={c[1] + h * 0.27} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={22 * k} fill="#d8d8dc">THEIR WORDS</text>
    </g>
  );
};
const F3: React.FC = () => {
  const G = 1420, s = 0.62;
  // left: years of walking bent under it
  const bent: Pose = { ...walk(0.2, 0.5), hip: [0, -170], lean: 36, head: 30, hN: [30, 120], hF: [10, 126] };
  const bj = J(330, G, bent, false, s), back: V = [(bj.sh[0] + bj.hip[0]) / 2 - 92, (bj.sh[1] + bj.hip[1]) / 2 - 70];
  // right: upright, running, light
  const rp: Pose = { ...run(0.3), lean: 12, head: -10 }, rx = 890;
  return (
    <g>
      <Tag x={250} y={640} t="YEAR 1 … YEAR 4" dim size={28} />
      <Tag x={820} y={640} t="THE DAY HE DROPPED IT" gold size={28} />
      <Floor y={G} />
      <g transform={`translate(540 ${G}) scale(1.15) translate(-540 ${-G})`}>
      {/* bent under the backpack, sweat, slow */}
      <Pack c={back} r={24} k={0.95} />
      <line x1={bj.sh[0]} y1={bj.sh[1]} x2={back[0] + 40} y2={back[1] - 70} stroke="#3a3a40" strokeWidth={8} />
      <Hero x={330} y={G} s={s} pose={bent} look={GREY} />
      {[0, 1].map((i) => <path key={i} d={`M${bj.head[0] + 30 + i * 14} ${bj.head[1] + 4 + i * 16} q-5 10 0 16`} stroke="#9a9aa2" strokeWidth={3} fill="none" />)}
      {/* the backpack on the road, where he let it fall: their words spill out */}
      {[0, 1, 2, 3].map((i) => <circle key={i} cx={540 + i * 40 - 60} cy={G - 10 - (i % 2) * 14} r={16 + (i % 3) * 6} fill="#d8d8dc" opacity={0.14} />)}
      <Pack c={[580, G - 80]} r={-74} k={0.85} spilled />
      {(["QUIT", "LOL", "LOSER", "NO WAY"] as const).map((t, i) => <g key={t} transform={`rotate(${(i - 1.5) * 22} ${650 + i * 40} ${G - 14})`}><rect x={622 + i * 40} y={G - 50} width={58} height={40} rx={3} fill="#e8e8ec" stroke="#000" strokeWidth={2} opacity={0.85} /><text x={651 + i * 40} y={G - 24} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={14} fill="#1a1a1e">{t}</text></g>)}
      {/* light now: upright, running */}
      <Glow at={[rx, G - 220]} r={260} color={GOLD} a={0.38} />
      {[0, 1, 2].map((i) => <line key={i} x1={rx - 120 - i * 14} y1={G - 280 + i * 50} x2={rx - 210 - i * 14} y2={G - 280 + i * 50} stroke="#8a8a92" strokeWidth={4} strokeLinecap="round" opacity={0.7 - i * 0.18} />)}
      <Hero x={rx} y={G} s={s} pose={rp} look={HERO} />
      </g>
      <Punch l1="He carried their words for years." l2="Then he put them down." y={1730} />
    </g>
  );
};

// ================================================================ 4 · the wall again: the finished mural — and the Day 1 stroke is in it
const F4: React.FC = () => {
  const G = 1440, sun: V = [720, 830], peak = RIDGE[RIDGE.length - 1];
  const main = `${ridgeD([[60, 1180], ...RIDGE])} L860 900 L1020 990 L1020 1300 L60 1300 Z`;
  return (
    <g>
      <Tag x={540} y={250} t="DAY 365" gold />
      <defs>
        <clipPath id="mural"><rect x={60} y={330} width={960} height={G - 330} /></clipPath>
        <linearGradient id="msky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#101014" /><stop offset="0.55" stopColor="#3a3020" /><stop offset="0.8" stopColor="#8a6a2a" /></linearGradient>
        <radialGradient id="msun" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#fff4d0" /><stop offset="0.5" stopColor="#ffd270" /><stop offset="1" stopColor={GOLD} /></radialGradient>
        <linearGradient id="mmtn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a2a30" /><stop offset="1" stopColor="#09090b" /></linearGradient>
      </defs>
      <rect x={52} y={322} width={976} height={G - 314} fill="none" stroke="#3a3a40" strokeWidth={6} />
      <g clipPath="url(#mural)">
        <rect x={60} y={330} width={960} height={G - 330} fill="url(#msky)" />
        {/* brush texture in the sky */}
        {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M${60 + rnd(i) * 300} ${360 + i * 38} q300 ${-8 + rnd(i + 5) * 16} 700 0`} stroke="#fff" strokeWidth={10 + rnd(i + 9) * 10} strokeLinecap="round" opacity={0.03 + rnd(i + 2) * 0.04} fill="none" />)}
        <Rays f={0} at={sun} a={0.55} color={GOLD} n={20} len={700} />
        <Glow at={sun} r={420} color={GOLD} a={0.55} />
        <circle cx={sun[0]} cy={sun[1]} r={190} fill="url(#msun)" />
        {[230, 270].map((r) => <circle key={r} cx={sun[0]} cy={sun[1]} r={r} fill="none" stroke={GOLD} strokeWidth={6} opacity={0.35} strokeDasharray="40 22" />)}
        {/* birds */}
        {[[300, 560], [360, 600], [250, 630], [880, 520], [930, 560]].map(([x, y], i) => <path key={i} d={`M${x - 16} ${y} q8 -10 16 0 q8 -10 16 0`} fill="none" stroke="#0b0b0d" strokeWidth={4} />)}
        {/* far range */}
        <path d="M60 1040 L180 930 L270 990 L400 900 L520 980 L640 920 L900 860 L1020 920 L1020 1300 L60 1300 Z" fill="#4a4a52" opacity={0.85} />
        {/* the main mountain: its ridge IS the Day 1 stroke, now lit gold */}
        <path d={main} fill="url(#mmtn)" stroke="#000" strokeWidth={3} />
        <path d={ridgeD(RIDGE)} fill="none" stroke={GOLD} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
        <path d={`M${peak[0]} ${peak[1]} L860 900 L1020 990`} fill="none" stroke="#d8b060" strokeWidth={6} opacity={0.6} />
        {/* the painted figure on the summit, arms up */}
        <g stroke="#0b0b0d" strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d={`M${peak[0] - 22} ${peak[1] + 2} L${peak[0]} ${peak[1] - 50} L${peak[0] + 22} ${peak[1] + 2} M${peak[0]} ${peak[1] - 50} V${peak[1] - 122} M${peak[0]} ${peak[1] - 112} l-36 -40 l-12 -38 M${peak[0]} ${peak[1] - 112} l36 -40 l12 -38`} />
        </g>
        <circle cx={peak[0]} cy={peak[1] - 150} r={21} fill="#0b0b0d" />
        {/* lake with the sun's reflection */}
        <rect x={60} y={1300} width={960} height={G - 1300} fill="#0e0e12" />
        {Array.from({ length: 7 }, (_, i) => <line key={i} x1={sun[0] - 120 + i * 6} y1={1320 + i * 16} x2={sun[0] + 120 - i * 10} y2={1320 + i * 16} stroke={GOLD} strokeWidth={8} strokeLinecap="round" opacity={0.7 - i * 0.08} />)}
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={100 + i * 70} y1={1340 + (i % 3) * 30} x2={160 + i * 70} y2={1340 + (i % 3) * 30} stroke="#5a5a62" strokeWidth={4} strokeLinecap="round" />)}
      </g>
      {/* the surprise: circled, the crooked stroke they laughed at */}
      <ellipse cx={(RIDGE[0][0] + RIDGE[9][0]) / 2} cy={(RIDGE[0][1] + RIDGE[9][1]) / 2} rx={210} ry={70} transform={`rotate(-38 ${(RIDGE[0][0] + RIDGE[9][0]) / 2} ${(RIDGE[0][1] + RIDGE[9][1]) / 2})`} fill="none" stroke="#fff" strokeWidth={4} strokeDasharray="14 10" />
      <path d="M250 1170 q-40 20 -60 70" fill="none" stroke="#fff" strokeWidth={4} />
      <text x={190} y={1275} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={30} fill="#fff">day 1</text>
      <Floor y={G} />
      {/* the painter, small, at the foot of his wall */}
      <Painter x={930} g={G} tip={[985, 1260]} s={0.5} />
      {/* the crowd: silent now, phones up */}
      {[[120, 1690], [260, 1720], [420, 1700], [600, 1730], [780, 1700], [950, 1720]].map(([x, y], i) => (
        <g key={i}>
          <Spectator x={x} y={y} s={0.95} tone={i % 2} />
          <line x1={x + 30} y1={y - 70} x2={x + 46} y2={y - 190} stroke="#4a4a52" strokeWidth={12} strokeLinecap="round" />
          <Glow at={[x + 48, y - 214]} r={40} color="#ffffff" a={0.35} />
          <rect x={x + 30} y={y - 244} width={36} height={58} rx={6} fill="#e8e8ec" stroke="#000" strokeWidth={2.5} />
        </g>
      ))}
      <text x={540} y={1820} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={44} fill="#f2f2f2">They laughed at the first stroke.</text>
      <text x={540} y={1880} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={50} fill={GOLD}>It became the mountain.</text>
    </g>
  );
};

const FRAMES = [F0, FS, F1, F2, F3, F4];
export const LaughFrames: React.FC = () => {
  const F = FRAMES[Math.min(FRAMES.length - 1, useCurrentFrame())];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <KitDefs />
        <Defs />
        <F />
        <Vignette a={0.3} />
      </svg>
    </AbsoluteFill>
  );
};
