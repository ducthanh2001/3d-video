// LOOK TEST — a 6 s hook rebuilt with what makes the competitor's newer shorts look rich (studied 2026-11-08):
// 1 real settings with depth (wall panels, a window with moon and stars, haze)   2 practical lights (pendant cone, alarm digits,
// lit doorway)   3 more than one camera angle (wide two-lane shot, then a hard cut to a top-down close-up)   4 motion smears on
// fast moves   5 snappy timing (anticipation → hit → settle)   6 white speech bubbles with bold black text.
// Two palettes: "bw" (our black & white + gold rule) and "muted" (their desaturated night colours) so the user can choose.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { V, clamp, ease, lerp } from "../../kit/core";
import { Hero, HeroLook, POSES, Pose, mixPose, walk } from "../../kit/hero";
import { KitDefs, Vignette } from "../../kit/materials";
import { Glow } from "../../kit/fx";
import { BOLD, BOLD_GREY, Defs, GOLD, SANS } from "../samehours/StyleFrames";
import { J, reach } from "../beatyesterday/StyleFrames";

export const LOOK_TEST_FRAMES = 180;
type Pal = { wall0: string; wall1: string; panel: string; sky: string; frame: string; blanket: string; sheet: string; wood: string; digits: string; lamp: string; floor: string; haze: string };
const PAL: Record<"bw" | "muted", Pal> = {
  bw: { wall0: "#1c1c20", wall1: "#0d0d10", panel: "#26262c", sky: "#07070a", frame: "#3a3a40", blanket: "#55555d", sheet: "#d6d6da", wood: "#2c2c31", digits: "#f2f2f2", lamp: "#fff3d6", floor: "#141417", haze: "#ffffff" },
  muted: { wall0: "#222a3a", wall1: "#11151f", panel: "#2b3447", sky: "#0b1430", frame: "#3d4658", blanket: "#2f4c80", sheet: "#dcdfe6", wood: "#4a3628", digits: "#ff4a3a", lamp: "#ffd48a", floor: "#161b26", haze: "#9fb4ff" },
};
const MONO = "Consolas, 'Courier New', monospace";
const HERO: HeroLook = { ...BOLD, eyes: "side" };
const GREY: HeroLook = { ...BOLD_GREY, glow: 0, eyes: "side", eyeColor: "#1a1a1e" };
const S = 0.62;

// ---------------------------------------------------------------- set pieces
/** white rounded speech bubble, bold black text (their readable style) */
const Say: React.FC<{ x: number; y: number; t: string; k?: number; tail?: number }> = ({ x, y, t, k = 1, tail = -1 }) => {
  const w = t.length * 17 + 46;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <rect x={-w / 2} y={-34} width={w} height={60} rx={18} fill="#fff" />
      <path d={`M${tail * 30} 24 l${tail * 24} 30 l${-tail * 4} -30 Z`} fill="#fff" />
      <text x={0} y={6} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={30} fill="#111">{t}</text>
    </g>
  );
};
/** a soft light cone from a fixture (practical light) */
const Cone: React.FC<{ x: number; y: number; w: number; h: number; color: string; a: number; id: string }> = ({ x, y, w, h, color, a, id }) => (
  <g opacity={a}>
    <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity={0.55} /><stop offset="1" stopColor={color} stopOpacity={0} /></linearGradient></defs>
    <path d={`M${x - 26} ${y} L${x + 26} ${y} L${x + w / 2} ${y + h} L${x - w / 2} ${y + h} Z`} fill={`url(#${id})`} />
    <ellipse cx={x} cy={y + h} rx={w * 0.55} ry={26} fill={color} opacity={0.18} />
  </g>
);
const Room: React.FC<{ y0: number; y1: number; p: Pal; id: string; lamp: number; dawn: number; door: number; digits: string; ring: boolean; t: number }> = ({ y0, y1, p, id, lamp, dawn, door, digits, ring, t }) => {
  const fl = y1 - 70, wx = 560, wy = fl - 400;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}w`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={p.wall1} /><stop offset="1" stopColor={p.wall0} /></linearGradient>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={p.sky} /><stop offset="1" stopColor={lerpColor(p.sky, "#e8b45a", dawn * 0.8)} /></linearGradient>
        <clipPath id={`${id}c`}><rect x={30} y={y0} width={1020} height={y1 - y0} rx={10} /></clipPath>
      </defs>
      <g clipPath={`url(#${id}c)`}>
        <rect x={30} y={y0} width={1020} height={y1 - y0} fill={`url(#${id}w)`} />
        {Array.from({ length: 16 }, (_, i) => <line key={i} x1={30 + i * 66} y1={y0} x2={30 + i * 66} y2={fl} stroke={p.panel} strokeWidth={3} />)}
        {/* window: sky, moon, stars (or dawn) */}
        <rect x={wx} y={wy} width={230} height={170} fill={`url(#${id}s)`} stroke={p.frame} strokeWidth={10} />
        {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={wx + 14 + h01(i) * 200} cy={wy + 14 + h01(i + 40) * 140} r={1.6 + (i % 3) * 0.6} fill="#fff" opacity={(0.7 + 0.3 * Math.sin(t * 0.2 + i)) * (1 - dawn)} />)}
        <circle cx={wx + 175} cy={wy + 50} r={20} fill="#f2f2f2" opacity={0.9 * (1 - dawn)} />
        <line x1={wx + 115} y1={wy} x2={wx + 115} y2={wy + 170} stroke={p.frame} strokeWidth={6} />
        <line x1={wx} y1={wy + 85} x2={wx + 230} y2={wy + 85} stroke={p.frame} strokeWidth={6} />
        {/* door in the right wall, opening onto light */}
        <rect x={840} y={fl - 300} width={110} height={300} fill={door > 0 ? GOLD : p.wood} opacity={door > 0 ? 0.25 + 0.6 * door : 1} />
        <path d={`M840 ${fl - 300} L${840 + 110 * (1 - door * 0.85)} ${fl - 300 - door * 30} L${840 + 110 * (1 - door * 0.85)} ${fl + door * 30} L840 ${fl} Z`} fill={p.wood} stroke="#000" strokeWidth={3} />
        {door > 0 && <path d={`M840 ${fl} L950 ${fl} L720 ${y1} L600 ${y1} Z`} fill={GOLD} opacity={0.18 * door} />}
        {/* floor */}
        <rect x={30} y={fl} width={1020} height={y1 - fl} fill={p.floor} />
        <line x1={30} y1={fl} x2={1050} y2={fl} stroke={p.frame} strokeWidth={3} />
        {/* pendant lamp + cone */}
        <line x1={430} y1={y0} x2={430} y2={y0 + 120} stroke={p.frame} strokeWidth={3} />
        <path d={`M404 ${y0 + 140} L456 ${y0 + 140} L446 ${y0 + 118} L414 ${y0 + 118} Z`} fill={p.frame} stroke="#000" strokeWidth={2} />
        <Cone x={430} y={y0 + 140} w={420} h={fl - y0 - 120} color={p.lamp} a={lamp} id={`${id}cone`} />
        <Glow at={[430, y0 + 150]} r={70} color={p.lamp} a={0.7 * lamp} />
        {/* bed + nightstand + alarm clock */}
        <rect x={300} y={fl - 96} width={30} height={96} fill={p.wood} stroke="#000" strokeWidth={2} />
        <rect x={300} y={fl - 52} width={460} height={34} rx={6} fill={p.wood} stroke="#000" strokeWidth={2} />
        <rect x={320} y={fl - 80} width={430} height={30} rx={10} fill={p.sheet} stroke="#000" strokeWidth={2} />
        <rect x={326} y={fl - 104} width={96} height={30} rx={12} fill="#f2f2f2" stroke="#000" strokeWidth={2} />
        <rect x={160} y={fl - 110} width={110} height={110} fill={p.wood} stroke="#000" strokeWidth={2} />
        <rect x={168} y={fl - 156} width={94} height={46} rx={6} fill="#0b0b0d" stroke="#3a3a40" strokeWidth={3} />
        <text x={215} y={fl - 122} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={28} fill={p.digits} opacity={ring && Math.floor(t / 5) % 2 ? 0.35 : 1}>{digits}</text>
        {ring && [0, 1].map((i) => <path key={i} d={`M${170 - i * 14} ${fl - 170 - i * 8} q-12 16 0 32 M${262 + i * 14} ${fl - 170 - i * 8} q12 16 0 32`} fill="none" stroke={p.digits} strokeWidth={3} opacity={0.8 - i * 0.3} transform={`translate(${Math.sin(t * 2.4) * 2} 0)`} />)}
        {/* haze over everything */}
        <rect x={30} y={y0} width={1020} height={y1 - y0} fill={p.haze} opacity={0.03} />
      </g>
      <rect x={30} y={y0} width={1020} height={y1 - y0} rx={10} fill="none" stroke="#2a2a30" strokeWidth={3} />
    </g>
  );
};
const h01 = (i: number) => { const x = Math.sin(i * 91.7 + 3.1) * 43758.5; return x - Math.floor(x); };
function lerpColor(a: string, b: string, k: number) {
  const h = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const A = h(a), B = h(b);
  return `#${A.map((v, i) => Math.round(lerp(v, B[i], clamp(k))).toString(16).padStart(2, "0")).join("")}`;
}
/** draw a figure with a motion smear: faded copies at earlier times when it moves fast */
const Smear: React.FC<{ t: number; at: (t: number) => { x: number; y: number; pose: Pose; flip?: boolean }; look: HeroLook; n?: number }> = ({ t, at, look, n = 3 }) => {
  const now = at(t), prev = at(t - 1);
  const speed = Math.hypot(J(now.x, now.y, now.pose, now.flip, S).wN[0] - J(prev.x, prev.y, prev.pose, prev.flip, S).wN[0], J(now.x, now.y, now.pose, now.flip, S).wN[1] - J(prev.x, prev.y, prev.pose, prev.flip, S).wN[1]);
  const k = clamp((speed - 6) / 20);
  return (
    <g>
      {k > 0 && Array.from({ length: n }, (_, i) => { const a = at(t - (i + 1) * 1.2); return <Hero key={i} x={a.x} y={a.y} s={S} pose={a.pose} flip={a.flip} look={look} shadow={0} opacity={k * (0.32 - i * 0.09)} />; })}
      <Hero x={now.x} y={now.y} s={S} pose={now.pose} flip={now.flip} look={look} />
    </g>
  );
};

// ---------------------------------------------------------------- the shot
const SLAPS = [10, 48, 86];
const snoozeTime = (t: number) => ["5:00", "5:09", "5:18", "5:27"][SLAPS.filter((s) => t >= s + 3).length];
const Wide: React.FC<{ t: number; p: Pal }> = ({ t, p }) => {
  const T0 = 260, T1 = 900, B0 = 1000, B1 = 1640, flT = T1 - 70, flB = B1 - 70, K = 1.3;
  // top: lying in bed, slaps the alarm (anticipation: hand lifts first, then a fast hit)
  const lieAt = (tt: number) => {
    const d = SLAPS.reduce((m, s) => (Math.abs(tt - s) < Math.abs(m) ? tt - s : m), 1e9);
    const lift = d < 0 && d > -8 ? ease.out((d + 8) / 8) : 0, hit = d >= 0 && d < 10 ? 1 - ease.out(d / 10) : 0;
    const base = { ...POSES.lie(), head: -10 };
    const rest = reach(base, 560, flT - 80, [470, flT - 100]);
    const up = reach(base, 560, flT - 80, [300, flT - 260]);
    const slap = reach(base, 560, flT - 80, [225, flT - 160]);
    return { x: 560, y: flT - 80, pose: hit > 0 ? mixPose(rest, slap, hit) : mixPose(rest, up, lift) };
  };
  // bottom: already up — taps the alarm off, lamp on, stands, walks out of the door
  const upAt = (tt: number) => {
    const tap = reach(POSES.sit(80), 380, flB, [225, flB - 160]);
    if (tt < 18) return { x: 380, y: flB, pose: mixPose(POSES.sit(80), tap, tt < 9 ? ease.out(tt / 9) : 1 - ease.out((tt - 9) / 9)) };
    if (tt < 36) return { x: 380, y: flB, pose: mixPose(POSES.sit(80), POSES.stand(), ease.inOut((tt - 18) / 18)) };
    const d = tt - 36, x = 380 + d * 6.4;
    return { x, y: flB, pose: walk(d * 6.4 / 208) };
  };
  const lampB = fade(t, 12, 6), door = clamp((t - 64) / 14), gone = t > 104;
  const z = <Say x={700} y={T0 + 110} t="5 more minutes…" k={1.25 * pop(t, 26)} />;
  return (
    <g>
      <text x={540} y={200} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={60} letterSpacing={4} fill="#f2f2f2">5:00 AM</text>
      <text x={60} y={T0 - 18} fontFamily={SANS} fontWeight={700} fontSize={40} fill="#9a9aa2">Needs motivation</text>
      <defs><clipPath id="lt"><rect x={30} y={T0} width={1020} height={T1 - T0} rx={10} /></clipPath><clipPath id="lb"><rect x={30} y={B0} width={1020} height={B1 - B0} rx={10} /></clipPath></defs>
      <g clipPath="url(#lt)"><g transform={`translate(600 ${flT}) scale(${K}) translate(-600 ${-flT})`}>
      <Room y0={T0 - 120} y1={T1} p={p} id="rt" lamp={0} dawn={0} door={0} digits={snoozeTime(t)} ring={t < 120} t={t} />
      <Smear t={t} at={lieAt} look={GREY} />
      {/* the blanket over him */}
      <path d={`M470 ${flT - 92} Q560 ${flT - 130} 760 ${flT - 96} L760 ${flT - 52} L470 ${flT - 52} Z`} fill={p.blanket} stroke="#000" strokeWidth={2.5} />
      {[0, 1, 2].map((i) => <text key={i} x={420 + i * 22} y={flT - 150 - i * 26 - ((t * 0.8 + i * 12) % 30)} fontFamily={SANS} fontWeight={800} fontSize={24 + i * 6} fill="#9a9aa2" opacity={0.7}>z</text>)}
      </g></g>
      <rect x={30} y={T0} width={1020} height={T1 - T0} rx={10} fill="none" stroke="#2a2a30" strokeWidth={3} />

      <text x={60} y={B0 - 18} fontFamily={SANS} fontWeight={700} fontSize={40} fill="#f2f2f2">Does it anyway</text>
      <g clipPath="url(#lb)"><g transform={`translate(600 ${flB}) scale(${K}) translate(-600 ${-flB})`}>
      <Room y0={B0 - 120} y1={B1} p={p} id="rb" lamp={lampB} dawn={0} door={door} digits="5:00" ring={t < 9} t={t} />
      {!gone && <Smear t={t} at={upAt} look={HERO} />}
      <path d={`M470 ${flB - 82} Q560 ${flB - 70} 760 ${flB - 84} L760 ${flB - 52} L470 ${flB - 52} Z`} fill={p.blanket} stroke="#000" strokeWidth={2.5} opacity={0.9} />
      </g></g>
      <rect x={30} y={B0} width={1020} height={B1 - B0} rx={10} fill="none" stroke="#2a2a30" strokeWidth={3} />
      {t > 26 && z}
      {t > 104 && <Say x={820} y={B0 + 120} t="Already gone." k={1.25 * pop(t, 104)} tail={1} />}
    </g>
  );
};
/** hard cut: top-down close-up of the sleeper slapping the alarm (their 3:09 bed shot, our own drawing) */
const Close: React.FC<{ t: number; p: Pal }> = ({ t, p }) => {
  const d = t - 22, lift = d < 0 && d > -10 ? ease.out((d + 10) / 10) : 0, hit = d >= 0 && d < 12 ? 1 - ease.out(d / 12) : 0;
  const hand: V = hit > 0 ? [lerp(560, 300, hit), lerp(980, 820, hit)] : [lerp(560, 420, lift), lerp(980, 700, lift)];
  const handAt = (k: number): V => { const dd = k - 22, h = dd >= 0 && dd < 12 ? 1 - ease.out(dd / 12) : 0, l = dd < 0 && dd > -10 ? ease.out((dd + 10) / 10) : 0; return h > 0 ? [lerp(560, 300, h), lerp(980, 820, h)] : [lerp(560, 420, l), lerp(980, 700, l)]; };
  const sh: V = [640, 900];
  return (
    <g>
      <rect x={0} y={0} width={1080} height={1920} fill={p.wood} />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={i * 100} y1={0} x2={i * 100} y2={1920} stroke="#000" strokeWidth={4} opacity={0.35} />)}
      {/* nightstand + clock seen from above */}
      <rect x={140} y={640} width={260} height={300} rx={10} fill={p.wood} stroke="#000" strokeWidth={4} />
      <rect x={180} y={720} width={190} height={110} rx={12} fill="#0b0b0d" stroke="#3a3a40" strokeWidth={5} />
      <text x={275} y={800} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={62} fill={p.digits} opacity={Math.floor(t / 5) % 2 && t < 22 ? 0.35 : 1}>{t < 25 ? "5:27" : "5:36"}</text>
      {/* bed from above */}
      <rect x={430} y={520} width={540} height={1300} rx={20} fill={p.sheet} stroke="#000" strokeWidth={4} />
      <rect x={500} y={560} width={400} height={170} rx={50} fill="#f4f4f6" stroke="#000" strokeWidth={4} />
      <circle cx={700} cy={680} r={110} fill="#e8e8ec" stroke="#000" strokeWidth={6} />
      <path d={`M430 900 H970 V1820 H430 Z`} fill={p.blanket} stroke="#000" strokeWidth={4} />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M${480 + i * 110} ${1000 + i * 40} q60 120 20 300`} stroke="#000" strokeWidth={3} fill="none" opacity={0.25} />)}
      {/* the arm, with a smear on the fast hit */}
      {hit > 0.2 && [1, 2, 3].map((i) => { const h = handAt(t - i * 1.2); return <path key={i} d={`M${sh[0]} ${sh[1]} L${h[0]} ${h[1]}`} stroke="#e8e8ec" strokeWidth={60} strokeLinecap="round" opacity={0.25 - i * 0.06} />; })}
      <path d={`M${sh[0]} ${sh[1]} L${hand[0]} ${hand[1]}`} stroke="#000" strokeWidth={70} strokeLinecap="round" />
      <path d={`M${sh[0]} ${sh[1]} L${hand[0]} ${hand[1]}`} stroke="#e8e8ec" strokeWidth={60} strokeLinecap="round" />
      {d >= 0 && d < 8 && <g opacity={1 - d / 8}>{Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return <line key={i} x1={275 + Math.cos(a) * 90} y1={775 + Math.sin(a) * 70} x2={275 + Math.cos(a) * (130 + d * 6)} y2={775 + Math.sin(a) * (100 + d * 5)} stroke="#fff" strokeWidth={6} strokeLinecap="round" />; })}</g>}
      <Glow at={[275, 775]} r={160} color={p.digits} a={0.25} />
      <text x={760} y={500 - ((t * 1.2) % 40)} fontFamily={SANS} fontWeight={800} fontSize={70} fill="#f2f2f2" opacity={0.8}>z</text>
      <text x={820} y={440 - ((t * 1.2 + 20) % 40)} fontFamily={SANS} fontWeight={800} fontSize={90} fill="#f2f2f2" opacity={0.6}>Z</text>
      <text x={540} y={1880} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={46} fill="#f2f2f2" opacity={fade(t, 30)}>Snooze #4</text>
    </g>
  );
};
const fade = (t: number, a: number, d = 8) => clamp((t - a) / d);
const pop = (t: number, a: number) => ease.back(clamp((t - a) / 9));

export const LookTest: React.FC<{ palette: "bw" | "muted" }> = ({ palette }) => {
  const t = useCurrentFrame(), p = PAL[palette], CUT = 124;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <KitDefs />
        <Defs />
        {t < CUT ? <Wide t={t} p={p} /> : <Close t={t - CUT} p={p} />}
        <Vignette a={0.35} />
      </svg>
    </AbsoluteFill>
  );
};
export const LookTestBW: React.FC = () => <LookTest palette="bw" />;
export const LookTestMuted: React.FC = () => <LookTest palette="muted" />;
