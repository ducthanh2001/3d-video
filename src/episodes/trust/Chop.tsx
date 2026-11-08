// TRUST THE PROCESS · scene 4 "the 10th swing": two men, the same tree, the same axe. Top quits at 9 (one swing left),
// bottom swings once more and the tree comes down. Real objects: bark, root flare, a wedge notch with pale wood faces,
// a layered crown, a hickory-handled axe with a steel head, a forest behind.
import React from "react";
import { V } from "../../kit/core";
import { Hero, HeroLook, POSES, Pose, walk } from "../../kit/hero";
import { Glow } from "../../kit/fx";
import { BOLD, BOLD_GREY, GOLD, SANS } from "../samehours/StyleFrames";
import { J, reach } from "../beatyesterday/StyleFrames";
import { ClimbTag } from "./Frames";

const MONO = "Consolas, 'Courier New', monospace";
const HERO: HeroLook = { ...BOLD };
const GREY: HeroLook = { ...BOLD_GREY, glow: 0 };
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 7.7) * 43758.5; return x - Math.floor(x); };
const WOOD = "#d9cdb6", WOOD_D = "#a8987c";
const PS = 0.7;

// ---------------------------------------------------------------- the tree
const TB = 116, TT = 62, TOPH = 400, NH = 128; // trunk width at the base / top, trunk height, notch height
const tw = (h: number) => TB + (TT - TB) * (h / TOPH); // trunk width at height h
// an irregular broadleaf crown built from ~40 foliage clumps (sorted back-to-front), each lit from the upper left
const BLOBS: [number, number, number][] = Array.from({ length: 42 }, (_, i) => {
  const t = rnd(i + 400) * Math.PI * 2, u = Math.sqrt(rnd(i + 500));
  return [Math.cos(t) * 225 * u, -480 + Math.sin(t) * 165 * u, 46 + rnd(i + 600) * 36] as [number, number, number];
}).sort((p, q) => q[2] - p[2]);
const inFront = (c: [number, number, number]) => Math.abs(c[0]) < 120 && c[1] > -470;
const Crown: React.FC<{ id: string; front?: boolean }> = ({ id, front }) => {
  const sel = BLOBS.map((c, i) => [c, i] as const).filter(([c]) => (front ? inFront(c) : true));
  return (
    <g>
      <defs>
        <radialGradient id={`lf${id}`} cx="0.32" cy="0.28" r="0.85"><stop offset="0" stopColor="#8fc45a" /><stop offset="0.5" stopColor="#3f7f2e" /><stop offset="1" stopColor="#173a17" /></radialGradient>
      </defs>
      {!front && <path d={`M-10 ${-TOPH + 40} Q-60 ${-TOPH - 30} -150 -470 M8 ${-TOPH + 60} Q80 ${-TOPH - 10} 160 -460 M0 ${-TOPH} Q-6 -520 -20 -600 M-30 -470 Q-110 -540 -170 -560 M30 -480 Q110 -560 150 -580`} fill="none" stroke="#3e2e22" strokeWidth={14} strokeLinecap="round" />}
      {!front && BLOBS.map(([cx, cy, r], i) => <circle key={`d${i}`} cx={cx + 12} cy={cy + 16} r={r} fill="#0c1c0c" />)}
      {sel.map(([[cx, cy, r], i]) => (
        <path key={`m${i}`} fill={`url(#lf${id})`} stroke="#0a160a" strokeWidth={2}
          d={`M${cx - r} ${cy} ` + Array.from({ length: 9 }, (_, k) => { const a0 = Math.PI + (k / 9) * Math.PI * 2, a1 = Math.PI + ((k + 1) / 9) * Math.PI * 2, rr = r * (0.9 + rnd(i * 9 + k) * 0.22), am = (a0 + a1) / 2; return `Q${cx + Math.cos(am) * rr * 1.18} ${cy + Math.sin(am) * rr * 1.18} ${cx + Math.cos(a1) * r} ${cy + Math.sin(a1) * r}`; }).join(" ")} />
      ))}
      {/* single leaves: bright on the lit upper left, deep green in the shade */}
      {sel.flatMap(([[cx, cy, r], i]) => Array.from({ length: 22 }, (_, k) => {
        const n = i * 31 + k, t = rnd(n) * Math.PI * 2, d = Math.sqrt(rnd(n + 7)) * r * 0.95;
        const x = cx + Math.cos(t) * d, y = cy + Math.sin(t) * d, lit = (Math.cos(t) * -0.6 + Math.sin(t) * -0.8) * (d / r) + (rnd(n + 3) - 0.5) * 0.6;
        const fill = lit > 0.35 ? "#b6e07a" : lit > -0.1 ? "#5f9e3f" : "#24521f";
        return <ellipse key={`l${n}`} cx={x} cy={y} rx={6 + rnd(n + 9) * 4} ry={3 + rnd(n + 5) * 2} transform={`rotate(${rnd(n + 4) * 180} ${x} ${y})`} fill={fill} opacity={0.85} />;
      }))}
    </g>
  );
};
/** origin = ground at the trunk centre. notch = depth of the felling notch (0..1 of the trunk), fall = degrees (+ = falls right) */
const Tree: React.FC<{ x: number; g: number; notch: number; fall?: number; id: string }> = ({ x, g, notch, fall = 0, id }) => {
  const wN = tw(NH), xl = -wN / 2, xr = wN / 2, depth = notch * wN;
  // stump: root flare up to the cut
  const stump = `M${-TB / 2 - 34} 0 Q${-TB / 2 - 4} -6 ${-TB / 2 + 2} -30 L${xl} ${-NH} L${xr} ${-NH} L${TB / 2 - 2} -30 Q${TB / 2 + 4} -6 ${TB / 2 + 38} 0 Z`;
  const upper = `M${xl} ${-NH} L${-TT / 2} ${-TOPH} L${TT / 2} ${-TOPH} L${xr} ${-NH} Z`;
  const bark = (y0: number, y1: number, k: number) => Array.from({ length: 7 }, (_, i) => {
    const u = (i + 0.5) / 7 - 0.5, w0 = tw(-y0), w1 = tw(-y1);
    return <path key={`${k}${i}`} d={`M${u * w0} ${y0} Q${u * (w0 + w1) / 2 + (rnd(i + k) - 0.5) * 14} ${(y0 + y1) / 2} ${u * w1} ${y1}`} stroke="#000" strokeWidth={2.5} opacity={0.45} fill="none" />;
  });
  return (
    <g transform={`translate(${x} ${g})`}>
      <defs>
        <linearGradient id={`bk${id}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#8a6e54" /><stop offset="0.45" stopColor="#5e4836" /><stop offset="1" stopColor="#241a12" /></linearGradient>
      </defs>
      {/* the falling part: hinge at the right edge of the cut */}
      <g transform={`rotate(${fall} ${xr} ${-NH})`}>
        <Crown id={id} />
        <path d={upper} fill={`url(#bk${id})`} stroke="#000" strokeWidth={3} />
        {bark(-NH - 10, -TOPH + 10, 3)}
        <Crown id={id} front />
        {/* upper face of the notch */}
        <path d={`M${xl} ${-NH - 30} L${xl + depth} ${-NH} L${xl} ${-NH}`} fill="#050506" />
        <path d={`M${xl} ${-NH - 30} L${xl + depth} ${-NH}`} stroke={WOOD} strokeWidth={6} strokeLinecap="round" />
      </g>
      <path d={stump} fill={`url(#bk${id})`} stroke="#000" strokeWidth={3} />
      {bark(-6, -NH + 4, 11)}
      {/* lower face of the notch, and the back cut once it is falling */}
      <path d={`M${xl} ${-NH} L${xl + depth} ${-NH} L${xl} ${-NH + 14}`} fill="#050506" />
      <path d={`M${xl} ${-NH + 14} L${xl + depth} ${-NH}`} stroke={WOOD_D} strokeWidth={6} strokeLinecap="round" />
      {fall > 0 && <path d={`M${xl + depth} ${-NH} L${xr} ${-NH}`} stroke={WOOD} strokeWidth={7} strokeLinecap="round" />}
      {/* wood chips */}
      {Array.from({ length: 16 }, (_, i) => {
        const cx = -150 + rnd(i + 20) * 170, cy = -3 - rnd(i + 30) * 6;
        return <rect key={i} x={cx} y={cy} width={10 + rnd(i) * 10} height={5} rx={1.5} fill={i % 3 ? WOOD : WOOD_D} transform={`rotate(${rnd(i + 2) * 70 - 35} ${cx} ${cy})`} />;
      })}
    </g>
  );
};

// ---------------------------------------------------------------- the axe: handle from the grip to the head, steel head across it
/** a felling axe: a slightly curved hickory handle with a knob at the grip end, a steel head at the other end.
 *  flat = the head lies level (a horizontal stroke seen from the side: we see its top — poll, eye and the cheeks tapering to the edge);
 *  otherwise the head is seen in profile, the bit hanging perpendicular to the handle (an axe lying on the ground). */
const Axe: React.FC<{ grip: V; head: V; profile?: boolean; up?: boolean }> = ({ grip, head, profile = true, up }) => {
  const dx = head[0] - grip[0], dy = head[1] - grip[1], L = Math.hypot(dx, dy), ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  return (
    <g transform={`translate(${grip[0]} ${grip[1]}) rotate(${ang})`}>
      {/* handle: swells at the knob, slim in the middle, thicker into the eye */}
      <path d={`M-14 -6 Q-8 -8 0 -4 Q${L * 0.45} -1 ${L - 8} -6 L${L - 8} 6 Q${L * 0.45} 5 0 4 Q-8 8 -14 6 Q-18 0 -14 -6 Z`} fill="#c9a77c" stroke="#000" strokeWidth={2.5} strokeLinejoin="round" />
      <path d={`M4 0 Q${L * 0.45} 2 ${L - 12} -1`} stroke="#a8875c" strokeWidth={1.5} fill="none" />
      {profile ? <g transform={up ? "scale(1 -1)" : undefined}>
        <path d={`M${L - 12} -12 L${L + 10} -12 L${L + 10} 4 Q${L + 20} 22 ${L + 26} 40 Q${L} 46 ${L - 26} 40 Q${L - 18} 22 ${L - 12} 4 Z`} fill="#9a9aa2" stroke="#000" strokeWidth={2.5} strokeLinejoin="round" />
        <path d={`M${L + 24} 38 Q${L} 44 ${L - 24} 38`} stroke="#f2f2f4" strokeWidth={3} fill="none" />
      </g> : <>
        {/* head from above: poll block around the eye, cheeks tapering to a bright edge */}
        <path d={`M${L - 14} -10 L${L + 6} -10 L${L + 40} -2 L${L + 40} 2 L${L + 6} 10 L${L - 14} 10 Z`} fill="#9a9aa2" stroke="#000" strokeWidth={2.5} strokeLinejoin="round" />
        <rect x={L - 14} y={-10} width={8} height={20} fill="#5a5a62" stroke="#000" strokeWidth={1.5} />
        <path d={`M${L + 26} -5 L${L + 40} -1.5 M${L + 26} 5 L${L + 40} 1.5`} stroke="#f2f2f4" strokeWidth={2} />
      </>}
    </g>
  );
};

const Counter: React.FC<{ x: number; y: number; n: number; c: string }> = ({ x, y, n, c }) => (
  <g>
    <rect x={x} y={y} width={230} height={70} rx={10} fill="#0e0e10" stroke={c} strokeWidth={3} />
    <text x={x + 18} y={y + 46} fontFamily={MONO} fontWeight={800} fontSize={26} fill="#9a9aa2">SWINGS</text>
    <text x={x + 212} y={y + 52} textAnchor="end" fontFamily={MONO} fontWeight={800} fontSize={50} fill={c}>{n}</text>
  </g>
);

/** forest far behind + soil band */
const Ground: React.FC<{ g: number; id: string }> = ({ g, id }) => (
  <g>
    <defs>
      <linearGradient id={`soil${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2e2e34" /><stop offset="1" stopColor="#060607" /></linearGradient>
    </defs>
    {Array.from({ length: 13 }, (_, i) => {
      const x = i * 90 - 20 + rnd(i + 70) * 40, h = 220 + rnd(i + 80) * 160, w = 70 + rnd(i + 90) * 30;
      return <path key={i} d={`M${x} ${g} L${x + w / 2} ${g - h} L${x + w} ${g} Z`} fill="#141418" />;
    })}
    <rect x={0} y={g} width={1080} height={90} fill={`url(#soil${id})`} />
    <line x1={0} y1={g} x2={1080} y2={g} stroke="#5a5a62" strokeWidth={3} />
    {Array.from({ length: 40 }, (_, i) => { const x = rnd(i + 200) * 1080; return <path key={i} d={`M${x} ${g} l-4 -12 M${x} ${g} l2 -15 M${x} ${g} l7 -10`} stroke="#5a5a62" strokeWidth={2} />; })}
  </g>
);

const TX = 640;
const XL = TX - tw(NH) / 2, HX = XL - 190;
const ez = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
/** one axe stroke: ph 0 = the blade in the notch; holds, rises to the wind-up over the shoulder, then whips down */
const swingAt = (g: number, ph: number) => {
  // the felling stroke: wound up over the back shoulder, the axe comes round and down so the bit bites into the notch.
  // Both hands at the end of the handle; the axe is drawn from his actual hands, the head in profile (bit perpendicular to the handle).
  const L = 124, th1 = (16 * Math.PI) / 180, th0 = (-128 * Math.PI) / 180;
  const k = ph < 0 ? 0 : ph < 0.12 ? 0 : ph < 0.7 ? ez((ph - 0.12) / 0.58) : 1 - Math.pow((ph - 0.7) / 0.3, 2);
  const an = th1 + (th0 - th1) * k, dir: V = [Math.cos(an), Math.sin(an)];
  const hImp: V = [XL + 4, g - NH - 6];
  const Ig: V = [hImp[0] - L * Math.cos(th1), hImp[1] - L * Math.sin(th1)], Wg: V = [HX + 14, g - 214];
  const target: V = [Ig[0] + (Wg[0] - Ig[0]) * k, Ig[1] + (Wg[1] - Ig[1]) * k];
  const t2: V = [target[0] + dir[0] * 26, target[1] + dir[1] * 26];
  const pose = reach({ ...POSES.stand(), hip: [-8 * k, -160 + 8 * k], lean: 26 - 32 * k, head: -2 - 6 * k, fN: [70, 0], fF: [-62, 0], elbow: 1 }, HX, g, t2, target, false, PS);
  const jj = J(HX, g, pose, false, PS);
  const grip: V = jj.wF;
  const head: V = [grip[0] + dir[0] * L, grip[1] + dir[1] * L];
  return { pose, grip, head, k };
};
const Chips: React.FC<{ g: number; age: number }> = ({ g, age }) => {
  if (age < 0 || age > 14) return null;
  const u = age / 14;
  return <g opacity={1 - u}>{Array.from({ length: 7 }, (_, i) => { const a = -2.6 + i * 0.3, d = 20 + u * (60 + rnd(i + 5) * 60), x = XL + Math.cos(a) * d, y = g - NH - 20 + Math.sin(a) * d + u * u * 60; return <rect key={i} x={x} y={y} width={12} height={5} fill={WOOD} transform={`rotate(${i * 40 + u * 300} ${x} ${y})`} />; })}</g>;
};
/** sT/sB = swings landed (top/bottom); ph = phase of the stroke in progress (-1 = still); quitU 0..1 = top walks off; fall = degrees */
export const ChopScene: React.FC<{ tag: string; n?: number; title?: string; sT?: number; sB?: number; phT?: number; phB?: number; quitU?: number; fall?: number; t?: number; noText?: boolean }> = ({ tag, n, title, sT = 9, sB = 10, phT = -1, phB = -1, quitU = 1, fall = 24, t = 0, noText }) => {
  const G1 = 870, G2 = 1660;
  const top = swingAt(G1, phT), bot = swingAt(G2, phB);
  const notchT = Math.min(0.82, sT * 0.091), notchB = Math.min(0.82, sB * 0.091);
  const walking = quitU > 0;
  const qx = HX - quitU * 160;
  const quitter: Pose = { ...walk(t / 22, 0.6), head: 26, lean: 8 };
  const ageT = phT >= 0 ? phT * 19 : -1, ageB = phB >= 0 ? phB * 19 : -1;
  return (
    <g>
      <ClimbTag t={tag} n={n} title={title} />
      {/* ---- row 1 */}
      <Ground g={G1} id="a" />
      <Tree x={TX} g={G1} notch={notchT} id="a" />
      <Chips g={G1} age={ageT} />
      {walking ? <>
        <Axe grip={[XL - 250, G1 - 8]} head={[XL - 110, G1 - 8]} up />
        <Hero x={qx} y={G1} s={PS} pose={quitter} look={GREY} flip />
        <g opacity={Math.min(1, quitU * 3)}>
          <path d={`M${XL + 20} ${G1 - NH - 14} L${XL + 120} ${G1 - NH - 120}`} stroke="#e0483e" strokeWidth={2.5} strokeDasharray="7 6" />
          <text x={XL + 128} y={G1 - NH - 126} fontFamily={MONO} fontWeight={800} fontSize={28} fill="#e0483e">1 swing left</text>
        </g>
      </> : <>
        <Hero x={HX} y={G1} s={PS} pose={top.pose} look={GREY} />
        <Axe grip={top.grip} head={top.head} />
      </>}
      <Counter x={40} y={G1 - 640} n={sT} c={walking ? "#e0483e" : "#d8d8dc"} />
      <text x={40} y={G1 + 58} fontFamily={SANS} fontWeight={700} fontSize={40} fill="#d8d8dc">Quit at 9</text>
      {/* ---- row 2 */}
      <Ground g={G2} id="b" />
      {fall > 0 && <Glow at={[TX + 140, G2 - 420]} r={330} color={GOLD} a={0.45 * Math.min(1, fall / 20)} />}
      <Tree x={TX} g={G2} notch={notchB} fall={fall} id="b" />
      <Chips g={G2} age={ageB} />
      {fall > 4 && fall < 80 && [0, 1, 2].map((i) => <path key={i} d={`M${TX + 260 + i * 40} ${G2 - 700 + i * 50 + fall * 4} q60 40 80 120`} stroke="#d8d8dc" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.7 - i * 0.15} />)}
      {fall > 70 && Array.from({ length: 10 }, (_, i) => <ellipse key={i} cx={TX + 100 + i * 40} cy={G2 - 10 - rnd(i + 300) * 30} rx={40 + rnd(i) * 30} ry={18} fill="#bdbdc4" opacity={0.25} />)}
      <Hero x={HX} y={G2} s={PS} pose={bot.pose} look={HERO} />
      <Axe grip={bot.grip} head={bot.head} />
      <Counter x={40} y={G2 - 640} n={sB} c={sB >= 10 ? GOLD : "#d8d8dc"} />
      <text x={40} y={G2 + 58} fontFamily={SANS} fontWeight={700} fontSize={40} fill={GOLD}>Swung once more</text>
      {!noText && <g>
        <text x={540} y={1818} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={46} fill="#f2f2f2">It wasn't the 10th swing.</text>
        <text x={540} y={1880} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={54} fill={GOLD}>It was all 10.</text>
      </g>}
    </g>
  );
};
