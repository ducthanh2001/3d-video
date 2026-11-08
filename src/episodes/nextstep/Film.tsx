// NextStepFilm: "THE MOUNTAIN / THE NEXT STEP" 60.6 s, 1080x1920, 30 fps. Minimal black look, white/grey stick figures,
// colour only for meaning (accent pass): GOLD = the next step / steps already climbed / the summit flag, RED = the slide.
// All times come from events.ts (Q), which the sound script reads too.
import React from "react";
import { useCurrentFrame } from "remotion";
import { V, clamp, ease, lerp, prog, rng } from "../../kit/core";
import { Hero, LOOK_GREY, LOOK_WHITE, POSES, Pose, mixPose, walk } from "../../kit/hero";
import { LightPool } from "../../kit/materials";
import { Flag } from "../../kit/props";
import { Debris, Glow, ImpactRing, Rays, Sparkle } from "../../kit/fx";
import { Cam, CamKey, CamState, Flash, camAt } from "../../kit/camera";
import { Acc, TwoPass } from "../upgrade/accent";
import { Q } from "./events";
import { A_X, B_X0, CX, GROUND, N, OUTLINE, RIDGES, STEPS, SUMMIT, SUMMIT_Y, onPath } from "./mountain";

export const NEXTSTEP_FRAMES = Q.LEN;
const GOLD = "#ffb53a", RED = "#e8343a";
const MONO = '"Consolas", "Courier New", monospace';
const CAP = '"Segoe UI Semibold", "Segoe UI", Arial, sans-serif';

// ---------------------------------------------------------------- B: where on the path (float ledge index) at frame f
const HOPS = [300, 355, 410, 465];
const sAt = (f: number): number => {
  if (f < HOPS[0]) return -1;
  if (f < Q.DROP1) { let s = -1; for (const t of HOPS) s += clamp((f - t) / 18); return s; }
  if (f < Q.SLIDE) return 3 + 57 * prog(f, Q.DROP1, Q.SLIDE, "linear");
  if (f < Q.SLIDE_END) return 60 - 12 * ease.out((f - Q.SLIDE) / (Q.SLIDE_END - Q.SLIDE));
  if (f < Q.DROP2) return 48;
  if (f < Q.SUMMIT) return 48 + 76 * prog(f, Q.DROP2, Q.SUMMIT - 10, "linear");
  return N - 1;
};
const dayAt = (f: number) => (f < Q.DROP1 ? 1 : f < Q.SLIDE ? Math.round(lerp(1, 120, prog(f, Q.DROP1, Q.SLIDE, "linear"))) : f < Q.DROP2 ? 120 : Math.round(lerp(121, 365, prog(f, Q.DROP2, Q.SUMMIT - 10, "linear"))));

const lookUp: Pose = { ...POSES.stand(), lean: -8, head: -34 };
const climbPose = (s: number, hop: number): Pose => { const w = walk(s * 0.5, 0.8); return { ...w, lean: 12, head: 6, hip: [w.hip[0], w.hip[1] + Math.sin(hop * Math.PI) * 6] }; };
const lieOnLedge: Pose = { ...POSES.lie(), hN: [-120, 40], hF: [-100, 60] };

const bState = (f: number): { p: V; pose: Pose; flip: boolean; rot: number } => {
  const s = sAt(f), o = onPath(s);
  const flip = o.dir < 0;
  if (f < HOPS[0]) return { p: o.p, pose: f < Q.LABELS ? POSES.idle(f) : mixPose(POSES.idle(f), { ...POSES.stand(), head: 30, lean: 4 }, prog(f, Q.LABELS, Q.LABELS + 12)), flip: false, rot: 0 };
  if (f < Q.DROP1) {
    const moving = o.hop > 0 && o.hop < 1;
    return { p: o.p, pose: moving ? mixPose(POSES.jumpLoad(), { ...POSES.stand(), head: 30 }, o.hop) : { ...POSES.stand(), head: 30, lean: 4 }, flip, rot: 0 };
  }
  if (f < Q.SLIDE) return { p: o.p, pose: climbPose(s, o.hop), flip, rot: 0 };
  if (f < Q.SLIDE_END) return { p: [o.p[0], o.p[1]], pose: POSES.fallBack(), flip, rot: -30 * Math.sin(((f - Q.SLIDE) / 30) * Math.PI) };
  if (f < Q.LOOKUP) return { p: o.p, pose: lieOnLedge, flip, rot: 0 };
  if (f < Q.LOOKDOWN) return { p: o.p, pose: mixPose(lieOnLedge, { ...POSES.kneel(), head: -40, lean: -6 }, prog(f, Q.LOOKUP, Q.LOOKUP + 16)), flip, rot: 0 };
  if (f < Q.DROP2) return { p: o.p, pose: mixPose({ ...POSES.kneel(), head: 40 }, { ...POSES.stand(), head: 30 }, prog(f, Q.STAND, Q.DROP2)), flip, rot: 0 };
  if (f < Q.SUMMIT) return { p: o.p, pose: climbPose(s, o.hop), flip, rot: 0 };
  const plant = prog(f, Q.FLAG - 10, Q.FLAG, "out");
  return { p: o.p, pose: f < Q.FLAG + 20 ? mixPose(POSES.stand(), { ...POSES.point(), hN: [60, 60] }, plant) : POSES.celebrate(f - Q.FLAG - 20), flip: false, rot: 0 };
};

// ---------------------------------------------------------------- A at the foot of the mountain
const A_STEP: V = [A_X + 50, GROUND - 55];
const aState = (f: number): { p: V; pose: Pose; dim: number } => {
  if (f < Q.NUM1) return { p: [A_X, GROUND], pose: mixPose(POSES.idle(f), lookUp, prog(f, Q.LABELS, Q.LABELS + 14)), dim: 0 };
  const n = [Q.NUM1, Q.NUM2, Q.NUM3].filter((t) => f >= t + 10).length;
  const bend: Pose = { ...POSES.crouch(), head: 30 };
  if (f < Q.SIT) return { p: [A_X, GROUND], pose: mixPose(lookUp, bend, n / 3), dim: n * 0.1 };
  if (f < Q.ASTAND) return { p: [A_X, GROUND], pose: mixPose(bend, POSES.hugKnees(), prog(f, Q.SIT, Q.SIT + 20)), dim: 0.35 };
  if (f < Q.ASTEP) return { p: [A_X, GROUND], pose: mixPose(POSES.hugKnees(), { ...POSES.stand(), head: 20 }, prog(f, Q.ASTAND, Q.ASTAND + 20)), dim: lerp(0.35, 0, prog(f, Q.ASTAND, Q.ASTEP)) };
  const u = prog(f, Q.ASTEP, Q.ASTEP + 18);
  return { p: [lerp(A_X, A_STEP[0], u), lerp(GROUND, A_STEP[1], ease.inOut(u)) - Math.sin(u * Math.PI) * 18], pose: mixPose(POSES.jumpLoad(), { ...POSES.stand(), head: 24 }, u), dim: 0 };
};
const lookA = (dim: number) => ({ ...LOOK_GREY, body: `rgb(${200 - dim * 110},${200 - dim * 110},${200 - dim * 110})`, far: `rgb(${150 - dim * 80},${150 - dim * 80},${150 - dim * 80})` });

// ---------------------------------------------------------------- the light that runs down B's path to A (PASS -> RING)
const dotAt = (f: number): V => {
  const u = prog(f, Q.PASS, Q.RING, "inOut"), s = lerp(N - 1, -1, u);
  if (s <= -1) return A_STEP;
  return onPath(s).p;
};

// ---------------------------------------------------------------- camera
const KEYS0: CamKey[] = [
  { f: 0, x: 540, y: 1450, z: 1.0 }, { f: Q.TOP, x: 540, y: SUMMIT_Y + 150, z: 1.0, e: "in" }, { f: Q.WHIP, x: 540, y: SUMMIT_Y + 120, z: 1.08, e: "out" },
  { f: Q.BASE, x: 540, y: 1450, z: 1.0, e: "inOut" }, { f: Q.LABELS, x: 470, y: 1480, z: 1.3, e: "burst" },
  { f: Q.NUM1, x: 430, y: 1500, z: 1.45, e: "inOut" }, { f: Q.SIT, x: 460, y: 1480, z: 1.35, e: "inOut" },
  { f: Q.DAY1, x: 580, y: 1470, z: 1.5, e: "inOut" }, { f: Q.DROP1, x: 600, y: 1420, z: 1.3, e: "burst" },
];
const camState = (f: number): CamState => {
  if (f < Q.DROP1) return camAt(f, KEYS0);
  const follow = (z: number, dy = -170): CamState => { const p = onPath(sAt(f - 4)).p; return { x: lerp(p[0], CX, 0.25), y: p[1] + dy, z, r: 0 }; };
  if (f >= Q.INSERT0 && f < Q.INSERT1) return { x: A_X + 40, y: GROUND - 160, z: 1.7, r: 0 };
  if (f < Q.SLIDE) return follow(1.3);
  if (f < Q.LOOKUP) return follow(1.35);
  if (f < Q.LOOKDOWN) { const a = follow(1.35), t = ease.inOut(prog(f, Q.LOOKUP, Q.LOOKUP + 50)); return { x: lerp(a.x, CX, t), y: a.y - 700 * t, z: lerp(1.35, 0.5, t), r: 0 }; }
  if (f < Q.DROP2) { const a = follow(1.55, -110), b = { x: CX, y: follow(1).y - 700, z: 0.5 }, t = ease.burst(prog(f, Q.LOOKDOWN, Q.LOOKDOWN + 14, "linear")); return { x: lerp(b.x, a.x, t), y: lerp(b.y, a.y, t), z: lerp(b.z, a.z, t), r: 0 }; }
  if (f < Q.WIDE0) return follow(1.25);
  if (f < Q.SUMMIT) { const a = follow(1.25), t = ease.inOut(prog(f, Q.WIDE0, Q.WIDE0 + 90)); const z = lerp(1.25, 0.25, t) + 0.02 * prog(f, Q.WIDE0 + 90, Q.SUMMIT); return { x: lerp(a.x, CX, t), y: lerp(a.y, -1760, t), z, r: 0 }; }
  if (f < Q.PASS) { const t = ease.burst(prog(f, Q.SUMMIT, Q.SUMMIT + 22, "linear")); return { x: CX, y: lerp(-1760, SUMMIT_Y + 120, t), z: lerp(0.25, 1.25, t) + 0.12 * prog(f, Q.SUMMIT + 22, Q.PASS), r: 0 }; }
  if (f < Q.RING) { const d = dotAt(f - 2); return { x: lerp(d[0], CX, 0.3), y: d[1] - 100, z: 0.9, r: 0 }; }
  if (f < Q.FINAL) return { x: lerp(A_STEP[0], A_X + 60, 0.5), y: GROUND - 170 - 20 * prog(f, Q.RING, Q.FINAL), z: 1.6 + 0.1 * prog(f, Q.RING, Q.FINAL), r: 0 };
  // close on A's foot on the lit step, then pull back to the opening framing (loop)
  const t = ease.in(prog(f, Q.FINAL + 40, Q.LEN));
  return { x: lerp(A_STEP[0], 540, t), y: lerp(GROUND - 90, 1450, t), z: lerp(2.1, 1.0, t), r: 0 };
};

// ---------------------------------------------------------------- drawing
const Mountain: React.FC<{ f: number; lit: number; ring: number; redFrom?: number; redTo?: number; redA?: number }> = ({ f, lit, ring, redFrom, redTo, redA = 0 }) => {
  const id = "nsMtn";
  const litPts = STEPS.slice(0, Math.max(0, Math.floor(lit) + 1));
  return (
    <g>
      <defs><linearGradient id={id} x1="0" y1={SUMMIT_Y} x2="0" y2={GROUND} gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#3a3a42" /><stop offset="100%" stopColor="#16161a" /></linearGradient></defs>
      <path d={`M${OUTLINE.map((p) => p.join(" ")).join(" L")} Z`} fill={`url(#${id})`} />
      <path d={`M${OUTLINE.map((p) => p.join(" ")).join(" L")}`} fill="none" stroke="#d8d8d8" strokeWidth={3} opacity={0.45} />
      {RIDGES.map((r, i) => <polyline key={i} points={r.map((p) => p.join(",")).join(" ")} fill="none" stroke="#000" strokeWidth={5} opacity={0.35} />)}
      {/* the climbed path glows gold */}
      {litPts.length > 1 && <Acc><polyline points={litPts.map((p) => `${p[0]},${p[1] + 6}`).join(" ")} fill="none" stroke={GOLD} strokeWidth={10} opacity={0.35} filter="url(#k-blur10)" /></Acc>}
      {STEPS.map((p, k) => {
        const on = k <= lit;
        const ledge = <rect x={p[0] - 27} y={p[1]} width={54} height={12} rx={3} fill={on ? GOLD : "#4a4a54"} stroke="#0b0b0d" strokeWidth={2} />;
        return <g key={k}>{on ? <Acc>{ledge}</Acc> : ledge}<rect x={p[0] - 25} y={p[1] + 1} width={50} height={3} fill="#fff" opacity={0.25} /></g>;
      })}
      {redA > 0 && redFrom !== undefined && redTo !== undefined && (
        <Acc><polyline points={STEPS.slice(Math.floor(redTo), Math.ceil(redFrom) + 1).map((p) => `${p[0]},${p[1] - 4}`).join(" ")} fill="none" stroke={RED} strokeWidth={8} strokeLinecap="round" opacity={redA} /></Acc>
      )}
      {ring >= 0 && ring < N && (() => {
        const p = STEPS[ring], pulse = 0.75 + 0.25 * Math.sin(f * 0.3);
        return <Acc><LightPool cx={p[0]} cy={p[1]} rx={90} ry={40} color={GOLD} a={0.8 * pulse} /><ellipse cx={p[0]} cy={p[1] + 4} rx={44} ry={11} fill="none" stroke={GOLD} strokeWidth={3} opacity={pulse} /></Acc>;
      })()}
    </g>
  );
};

/** a heavy stone slab with a number on it (falls onto A) */
const Slab: React.FC<{ x: number; y: number; w: number; text: string; rot?: number }> = ({ x, y, w, text, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-w / 2} y={-30} width={w} height={60} rx={6} fill="#2a2a30" stroke="#d8d8d8" strokeWidth={2.5} />
    <text x={0} y={10} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={28} fill="#f2f2f2">{text}</text>
  </g>
);
const SLABS = [{ t: Q.NUM1, w: 200, text: "8,848 M" }, { t: Q.NUM2, w: 180, text: "5 YEARS" }, { t: Q.NUM3, w: 250, text: "10,000 HOURS" }];

const Rain: React.FC<{ f: number; a: number }> = ({ f, a }) => {
  if (a <= 0) return null;
  const r = rng(77);
  return (
    <g opacity={a}>
      {Array.from({ length: 110 }, (_, i) => { const x0 = r() * 1400 - 200, sp = 40 + r() * 30, y = ((r() * 2200 + f * sp) % 2200) - 140, x = x0 - (y + 140) * 0.35; return <line key={i} x1={x} y1={y} x2={x - 14} y2={y + 46} stroke="#cfd6e0" strokeWidth={2} opacity={0.35 + r() * 0.3} />; })}
      {Array.from({ length: 6 }, (_, i) => { const ph = (f * 0.03 + i * 0.17) % 1, y = 300 + i * 260; return <line key={`w${i}`} x1={1200 - ph * 1800} y1={y} x2={1200 - ph * 1800 + 260} y2={y - 20} stroke="#fff" strokeWidth={3} opacity={0.18 * Math.sin(ph * Math.PI)} />; })}
    </g>
  );
};

/** caption at the top of the frame with its own in/out frames */
const Cap: React.FC<{ f: number; a: number; b: number; lines: { t: string; color?: string }[]; y?: number; size?: number }> = ({ f, a, b, lines, y = 170, size = 42 }) => {
  if (f < a - 1 || f > b + 1) return null;
  const o = prog(f, a, a + 8) * (1 - prog(f, b - 8, b));
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: y, textAlign: "center", fontFamily: CAP, fontSize: size, letterSpacing: 3, lineHeight: 1.25, opacity: o, transform: `translateY(${(1 - o) * 12}px)`, textShadow: "0 3px 18px rgba(0,0,0,0.9)" }}>
      {lines.map((l, i) => <div key={i} style={{ color: l.color ?? "#f2f2f2" }}>{l.t}</div>)}
    </div>
  );
};

export const NextStepFilm: React.FC = () => {
  const f = useCurrentFrame();
  const b = bState(f), a = aState(f), s = sAt(f);
  const lit = f < Q.SLIDE ? Math.floor(s) : f < Q.DROP2 ? 48 + (f < Q.SLIDE_END ? Math.floor(s) - 48 : 0) : Math.floor(s);
  const ring = f < Q.LABELS ? -1 : f >= Q.SUMMIT ? -1 : f >= Q.SLIDE && f < Q.LOOKDOWN ? -1 : Math.floor(s) + 1;
  const redA = f >= Q.SLIDE ? 1 - prog(f, Q.SLIDE_END + 20, Q.LOOKDOWN) : 0;
  const cut = f === Q.INSERT0 || f === Q.INSERT1;
  const day = dayAt(f);
  const dawn = prog(f, Q.SUMMIT, Q.SUMMIT + 60);
  const B_LOOK = { ...LOOK_WHITE, glow: 0.5 };
  const doubtA = f >= Q.LOOKUP + 10 && f < Q.LOOKDOWN + 16 ? prog(f, Q.LOOKUP + 10, Q.LOOKUP + 30) * (1 - prog(f, Q.LOOKDOWN, Q.LOOKDOWN + 16)) : 0;
  const html = (
    <>
      <Cap f={f} a={6} b={Q.TOP + 6} lines={[{ t: "HOW DO YOU CLIMB THIS?" }]} />
      <Cap f={f} a={Q.SIT} b={Q.DAY1 - 4} lines={[{ t: "TOO HIGH. TOO LATE. TOO HARD." }]} />
      <Cap f={f} a={Q.DAY1} b={Q.DROP1 + 30} lines={[{ t: "DAY 1." }]} />
      <Cap f={f} a={Q.SLIDE + 6} b={Q.LOOKUP + 20} lines={[{ t: "SOME DAYS YOU SLIDE BACK." }]} />
      <Cap f={f} a={Q.LOOKDOWN} b={Q.DROP2 + 20} lines={[{ t: "LOOK DOWN." }, { t: "ONE MORE STEP.", color: GOLD }]} />
      <Cap f={f} a={Q.FLAG} b={Q.PASS - 4} lines={[{ t: "THE MOUNTAIN" }, { t: "WAS JUST STEPS." }]} />
      <Cap f={f} a={Q.RING} b={Q.FINAL - 2} lines={[{ t: "YOURS STARTS WITH ONE." }]} />
      <Cap f={f} a={Q.FINAL + 2} b={Q.LEN + 10} lines={[{ t: "DON'T CLIMB THE MOUNTAIN." }, { t: "CLIMB THE NEXT STEP.", color: GOLD }]} />
      {f >= Q.DROP1 && f < Q.SUMMIT + 30 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 290, textAlign: "center", fontFamily: MONO, fontSize: 34, letterSpacing: 6, color: "#d8d8d8", opacity: 1 - prog(f, Q.SUMMIT, Q.SUMMIT + 30) }}>DAY {String(day).padStart(3, "0")}</div>
      )}
    </>
  );
  return (
    <TwoPass f={f} bg="#030304" vig={0.6} html={html}>
      <Cam f={f} keys={[]} state={camState} blur={cut ? 0 : 0.45} maxBlur={22}
        kicks={[{ f: Q.NUM1 + 10, amp: 6 }, { f: Q.NUM2 + 10, amp: 6 }, { f: Q.NUM3 + 10, amp: 8 }, { f: Q.DROP1, amp: 10 }, { f: Q.SLIDE, amp: 20, dur: 24 }, { f: Q.DROP2, amp: 14 }, { f: Q.FLAG, amp: 12 }, { f: Q.ASTEP + 18, amp: 5 }]}>
        <rect x={-6000} y={-9000} width={13000} height={14000} fill="#030304" />
        {/* dawn behind the summit */}
        {dawn > 0 && <Acc><Glow at={[CX, SUMMIT_Y - 160]} r={1100} color={GOLD} a={0.35 * dawn} /><Rays f={f} at={[CX, SUMMIT_Y - 120]} a={0.28 * dawn} n={14} len={1800} width={4} color="#ffd88a" /></Acc>}
        {/* the goal: a small gold light on the summit, visible from the first frame */}
        {f < Q.FLAG && <Acc><Glow at={[SUMMIT[0], SUMMIT[1] - 40]} r={120} color={GOLD} a={0.9} /><circle cx={SUMMIT[0]} cy={SUMMIT[1] - 40} r={9} fill="#fff1c8" /></Acc>}
        <Mountain f={f} lit={lit} ring={ring} redFrom={60} redTo={48} redA={redA} />
        <rect x={-6000} y={GROUND} width={13000} height={3000} fill="#0a0a0c" />
        <line x1={-6000} y1={GROUND} x2={7000} y2={GROUND} stroke="#d8d8d8" strokeWidth={3} opacity={0.5} />
        {/* summit flag */}
        {f >= Q.FLAG - 4 && <Acc><Flag x={SUMMIT[0] + 30} y={SUMMIT[1] - 2} f={f} s={0.6 * ease.back(prog(f, Q.FLAG - 4, Q.FLAG + 4))} color={GOLD} pole={140} /></Acc>}
        {/* A's own first step (appears when the light reaches him) */}
        {f >= Q.RING - 2 && (
          <g>
            <Acc><rect x={A_STEP[0] - 27} y={A_STEP[1]} width={54} height={12} rx={3} fill={f >= Q.ASTEP + 18 ? GOLD : "#4a4a54"} stroke="#0b0b0d" strokeWidth={2} /></Acc>
            <Acc><LightPool cx={A_STEP[0]} cy={A_STEP[1]} rx={100} ry={44} color={GOLD} a={0.85 * prog(f, Q.RING - 2, Q.RING + 6)} /><ellipse cx={A_STEP[0]} cy={A_STEP[1] + 4} rx={46} ry={11} fill="none" stroke={GOLD} strokeWidth={3} opacity={prog(f, Q.RING, Q.RING + 6)} /></Acc>
          </g>
        )}
        {/* the travelling light */}
        {f >= Q.PASS && f < Q.RING + 4 && <Acc><Glow at={dotAt(f)} r={140} color={GOLD} a={0.9} /><circle cx={dotAt(f)[0]} cy={dotAt(f)[1]} r={10} fill="#fff4d8" /></Acc>}
        {/* A */}
        <Hero x={a.p[0]} y={a.p[1]} pose={a.pose} s={0.5} look={lookA(a.dim)} shadow={0.3} />
        {/* the numbers that crush A */}
        {SLABS.map((sl, i) => {
          if (f < sl.t) return null;
          const fall = clamp((f - sl.t) / 10), land = GROUND - lerp(178, 120, Math.min(1, (i + 1) / 3)) - 30 - i * 60;
          const sat = f >= Q.SIT;
          const restY = GROUND - 30 - i * 60, restX = A_X - 150 + (i % 2) * 14;
          const sx = sat ? lerp(A_X + 6, restX, prog(f, Q.SIT, Q.SIT + 14)) : A_X + 6;
          const sy = sat ? lerp(land, restY, ease.in(prog(f, Q.SIT, Q.SIT + 14))) : lerp(land - 900, land, ease.in(fall));
          return <Slab key={i} x={sx} y={sy} w={sl.w * 0.55} text={sl.text} rot={sat ? (i - 1) * 4 : (i - 1) * 3} />;
        })}
        {/* B */}
        <Hero x={b.p[0]} y={b.p[1]} pose={b.pose} s={0.5} flip={b.flip} rot={b.rot} look={B_LOOK} shadow={0.25} />
        {/* labels above the two at the start */}
        {f >= Q.LABELS && f < Q.DROP1 + 10 && (
          <g opacity={prog(f, Q.LABELS, Q.LABELS + 10) * (1 - prog(f, Q.DROP1 - 10, Q.DROP1 + 10))} fontFamily={CAP} fontSize={20} letterSpacing={2} textAnchor="middle">
            <text x={A_X - 10} y={GROUND - 250} fill="#bdbdbd">THE MOUNTAIN</text>
            <Acc><text x={B_X0 + 50} y={GROUND - 250} fill={GOLD}>THE NEXT STEP</text></Acc>
          </g>
        )}
        {/* the same numbers float around B when he looks up after the slide */}
        {doubtA > 0 && ["TOO HIGH", "TOO LATE", "TOO HARD", "8,848 M", "5 YEARS"].map((t, i) => {
          // sized for the pulled-back camera (z ~0.5) so they read as big as the slabs did
          const p = onPath(48).p, ang = -2.6 + i * 0.6, rr = 300 + (i % 2) * 120, drift = prog(f, Q.LOOKDOWN, Q.LOOKDOWN + 16) * 200;
          return <text key={t} x={p[0] + Math.cos(ang) * rr} y={p[1] - 420 + Math.sin(ang) * rr * 0.8 - drift} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={64} fill="#e8e8e8" opacity={doubtA * (0.7 + 0.3 * Math.sin(f * 0.2 + i))}>{t}</text>;
        })}
        {/* rock slide */}
        <Debris f={f} f0={Q.SLIDE - 4} at={onPath(64).p} n={18} seed={21} floor={onPath(48).p[1]} />
        <Debris f={f} f0={Q.SLIDE + 6} at={onPath(66).p} n={12} seed={22} floor={onPath(48).p[1]} />
        <ImpactRing f={f} f0={Q.SLIDE_END} at={onPath(48).p} size={110} color={RED} />
        <ImpactRing f={f} f0={Q.ASTEP + 18} at={A_STEP} size={90} color={GOLD} />
        {f >= Q.FLAG && f < Q.FLAG + 40 && <Sparkle f={f} at={[SUMMIT[0] + 80, SUMMIT[1] - 90]} s={1.6} />}
      </Cam>
      <Rain f={f} a={f >= Q.DROP1 + 20 && f < Q.SLIDE + 20 ? prog(f, Q.DROP1 + 20, Q.DROP1 + 40) * (1 - prog(f, Q.SLIDE, Q.SLIDE + 20)) : 0} />
      <Flash f={f} at={Q.DROP1} dur={5} />
      <Flash f={f} at={Q.DROP2} dur={6} color="#fff2d8" />
    </TwoPass>
  );
};
