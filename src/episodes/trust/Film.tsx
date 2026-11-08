// TrustFilm: "You're closer than you think. Don't quit." 40.6 s (1217 frames), 1080x1920, 30 fps.
// A ridge with 100 climbers asks the question; three chapters show why people quit (#1 the car, #2 the fire, #3 the 10th swing),
// the CLIMBERS counter falling 100 → 3; dawn on the same ridge answers it: 1 out of 100. Scenes cross-dissolve (no black).
// Every number of time lives in events.ts (shared with audio/make_audio_trust.py).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { V, clamp, ease } from "../../kit/core";
import { KitDefs, Vignette } from "../../kit/materials";
import { Defs, GOLD, SANS } from "../samehours/StyleFrames";
import { CREST, CarRow, GREY, HERO, Hud, M0, M4, Quit, Ridge, SLOPE_SIT, SUMMIT, rY } from "./V4Frames";
import { Hero, HeroLook, POSES, Pose } from "../../kit/hero";
import { Glow } from "../../kit/fx";
import { J, reach } from "../beatyesterday/StyleFrames";
import { ClimbTag } from "./Frames";
import { FireScene } from "./Fire";
import { ChopScene } from "./Chop";
import { BEAT, C, Q } from "./events";

export const TRUST_FILM_FRAMES = Q.LEN;
const W = "#f2f2f2";
const b = (n: number) => n * BEAT;
const fade = (t: number, a: number, d = 8) => clamp((t - a) / d);
const pop = (t: number, a: number) => ease.back(clamp((t - a) / 9));
const lerp = (a: number, c: number, u: number) => a + (c - a) * u;
const rnd = (i: number) => { const x = Math.sin(i * 61.3 + 2.7) * 43758.5; return x - Math.floor(x); };
const Punch: React.FC<{ t: number; a: number; bb: number; l1: string; l2: string; y?: number }> = ({ t, a, bb, l1, l2, y = 1790 }) => (
  <g>
    <rect x={0} y={y - 70} width={1080} height={170} fill="#000" opacity={0.55 * fade(t, a, 6)} />
    <g opacity={fade(t, a, 6)} transform={`translate(540 ${y}) scale(${0.85 + 0.15 * pop(t, a)})`}><text textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={46} fill={W}>{l1}</text></g>
    <g opacity={fade(t, bb, 6)} transform={`translate(540 ${y + 64}) scale(${0.85 + 0.15 * pop(t, bb)})`}><text textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={54} fill={GOLD}>{l2}</text></g>
  </g>
);
/** camera: zoom z on world point c (c lands at the screen centre when z = 1 → pass [540, 960]) */
const Cam: React.FC<{ z: number; c: V; children: React.ReactNode }> = ({ z, c, children }) => (
  <g transform={`translate(540 960) scale(${z}) translate(${-c[0]} ${-c[1]})`}>{children}</g>
);
const mixV = (a: V, c: V, u: number): V => [lerp(a[0], c[0], u), lerp(a[1], c[1], u)];

// ================================================================ 0 · the ridge at night
const Seg0: React.FC<{ t: number }> = ({ t }) => {
  const u = ease.inOut(clamp((t - b(C.PULL0)) / (b(C.PULL1) - b(C.PULL0))));
  const him: V = [342, rY(342) - 40];
  return (
    <g>
      <Cam z={lerp(2.3, 1, u)} c={mixV(him, [540, 960], u)}><M0 t={t} noText /></Cam>
      <g opacity={fade(t, b(C.PULL1) - 10, 10)}><Hud alt="0 m" climbers="100" /></g>
      <Punch t={t} a={b(C.TXT0A)} bb={b(C.TXT0B)} l1="100 started." l2="How many reached the top?" />
    </g>
  );
};
// ================================================================ 1 · three sit down
const Seg1: React.FC<{ t: number }> = ({ t }) => {
  const sit = [0, 1, 2].filter((i) => t >= b(C.SIT0 + i * C.SITD)).length;
  return (
    <g>
      <Cam z={1 + 0.05 * clamp(t / 66)} c={[560, 940]}><M0 t={t + b(6.5)} sit={sit} noText /></Cam>
      <Hud alt="2,000 m" climbers={String(100 - sit)} />
      <Punch t={t} a={b(C.TXT1A)} bb={b(C.TXT1B)} l1="The climb has barely started…" l2="Why do people quit?" />
    </g>
  );
};
// ================================================================ 2 · #1 it gets heavy
const Seg2: React.FC<{ t: number }> = ({ t }) => {
  const B = t / BEAT;
  const roll = (from: number) => ease.in(clamp((B - from) / C.ROLL));
  // row 1: 150 → 380 by R1 (40%), then rolls back
  const x1 = B < C.R1 ? lerp(230, 330, B / C.R1) : lerp(330, 130, roll(C.R1));
  const v1 = Math.min(0.4, (B / C.R1) * 0.4);
  // row 2: 250 → 560 by R2 (90%), then rolls back
  const x2 = B < C.R2 ? lerp(330, 520, B / C.R2) : lerp(520, 300, roll(C.R2));
  const v2 = Math.min(0.9, (B / C.R2) * 0.9);
  // row 3: 280 → the crest by CREST3 (100%), then over and down the far side (110%)
  const x3 = B < C.CREST3 ? lerp(440, CREST, B / C.CREST3) : lerp(CREST, 920, ease.out(clamp((B - C.CREST3) / 1.6)));
  const v3 = B < C.CREST3 ? (B / C.CREST3) * 1.0 : Math.min(1.1, 1 + (B - C.CREST3) * 0.15);
  const over = x3 > CREST + 20;
  const climbers = B < C.R1 ? 97 : B < C.R2 ? Math.round(lerp(97, 70, clamp((B - C.R1) / 0.6))) : Math.round(lerp(70, 41, clamp((B - C.R2) / 0.6)));
  const hdr = pop(t, 0);
  return (
    <g>
      <g transform={`translate(0 ${(1 - hdr) * -40})`} opacity={clamp(t / 6)}><ClimbTag t={`${climbers} left…`} n={1} title="It gets heavy." /></g>
      <CarRow g={600} label="Wants it" v={v1} carX={x1} tired lean={B < C.R1 ? 46 : lerp(46, 18, clamp((B - C.R1) / 0.5))} arrow={B >= C.R1} t={t} step={B < C.R1 ? x1 / 12 : undefined} />
      <CarRow g={1080} label="Needs it" v={v2} carX={x2} tired lean={B < C.R2 ? 46 : lerp(46, 18, clamp((B - C.R2) / 0.5))} arrow={B >= C.R2} t={t + 9} step={B < C.R2 ? x2 / 12 + 1 : undefined} />
      <CarRow g={1560} label="Gives 110%" v={v3} carX={x3} over={over} t={t + 4} step={x3 / 12 + 2} />
      <Punch t={t} a={b(C.TXT2A)} bb={b(C.TXT2B)} l1="Most stop when it gets heavy." l2="The top is just past it." y={1800} />
    </g>
  );
};
// ================================================================ 3 · #2 they stop acting
const Seg3: React.FC<{ t: number }> = ({ t }) => {
  const B = t / BEAT;
  const lvTop = 0.8 - 0.72 * clamp(B / 9);
  const drops = Array.from({ length: C.LOGN }, (_, k) => C.LOG0 + k * C.LOGD);
  const done = drops.filter((d) => B >= d).length;
  const lvBot = Math.min(1, 0.4 + 0.6 * clamp(B / 8.5) + 0.04 * done * Math.max(0, 1 - (B - (drops[done - 1] ?? -9)) / 0.6) + 0.02 * Math.sin(t / 5));
  const next = drops.find((d) => B < d);
  const logU = next === undefined ? 0.05 : clamp((B - (next - 1.6)) / 1.6);
  const climbers = Math.round(lerp(41, 12, clamp((B - 2) / 4)));
  return (
    <g>
      <FireScene tag={`${climbers} left…`} n={2} title="They stop acting." lvTop={lvTop} lvBot={lvBot} logU={logU} t={t} noText />
      <Punch t={t} a={b(C.TXT3A)} bb={b(C.TXT3B)} l1="Nothing burns forever" l2="unless you keep taking action." />
    </g>
  );
};
// ================================================================ 4 · #3 they quit too early
const Seg4: React.FC<{ t: number }> = ({ t }) => {
  const B = t / BEAT;
  // stroke k lands at HIT0 + k; the stroke in progress has phase (B - landed) in [0,1)
  const landedB = clamp(Math.floor(B - C.HIT0) + 1, 0, 10);
  const sT = Math.min(9, landedB), sB = B >= C.TENTH ? 10 : Math.min(9, landedB);
  const ph = B < C.HIT0 - 0.3 ? -1 : (((B - C.HIT0) % 1) + 1) % 1;
  const quitU = clamp((B - C.QUIT) / 2.2);
  const phB = B >= C.TENTH ? Math.min(0.1, B - C.TENTH) : ph;
  const fall = B < C.TENTH ? 0 : 88 * Math.pow(clamp((B - C.TENTH) / (C.FALLEND - C.TENTH)), 2.2);
  const climbers = B < 6 ? 12 : Math.max(4, Math.round(lerp(12, 4, clamp((B - 6) / 3))));
  return (
    <g>
      <ChopScene tag={`${climbers} left…`} n={3} title="They quit too early." sT={sT} sB={sB} phT={quitU > 0 ? -1 : ph} phB={phB} quitU={quitU} fall={fall} t={t} noText />
      <Punch t={t} a={b(C.TXT4A)} bb={b(C.TXT4B)} l1="It wasn't the 10th swing." l2="It was all 10." y={1810} />
    </g>
  );
};
// ================================================================ 5 · the last stretch, in the storm
const Snow: React.FC<{ t: number; n?: number; a?: number }> = ({ t, n = 90, a = 0.8 }) => (
  <g opacity={a}>{Array.from({ length: n }, (_, i) => {
    const sp = 14 + rnd(i) * 16, x = ((rnd(i + 7) * 1400 + t * sp * 1.6) % 1400) - 200, y = ((rnd(i + 3) * 2100 + t * sp * 0.7) % 2100) - 100;
    return <line key={i} x1={x} y1={y} x2={x - sp * 1.6} y2={y - sp * 0.7} stroke="#e8e8ec" strokeWidth={1.5 + rnd(i + 9) * 2} strokeLinecap="round" opacity={0.4 + rnd(i + 11) * 0.5} />;
  })}</g>
);
/** a climber on a fixed line, the way it is done on a steep snow ridge: facing the slope, both hands on the rope ahead at
 *  shoulder height, one short step per count (moving in the first half, resting in the second), the stance foot planted */
const stepped = (n: number) => Math.floor(n) + ease.inOut(clamp((n - Math.floor(n)) / 0.55));
const SlopeClimber: React.FC<{ x0: number; n: number; len: number; s: number; look: HeroLook; lamp?: boolean }> = ({ x0, n, len, s, look, lamp }) => {
  const st = stepped(n), x = x0 + len * st, y = rY(x);
  const k = (rY(x + 20) - rY(x - 20)) / 40, d = len / 2 / s;
  const fa = d * Math.cos(Math.PI * st), fb = -fa;
  const frac = clamp((n - Math.floor(n)) / 0.55), lift = Math.sin(Math.PI * frac) * 16;
  const aMoves = Math.sin(Math.PI * st) < 0 === (Math.floor(n) % 2 === 0);
  const fN: V = [fa + 10, fa * k - (aMoves ? lift : 0)], fF: V = [fb - 6, fb * k - (aMoves ? 0 : lift)];
  // the upper hand slides up the rope while he steps, the lower one follows
  const up = 150 * s + Math.sin(Math.PI * frac) * 14 * s, low = 112 * s;
  const rN: V = [x + up, rY(x + up) - 24], rF: V = [x + low, rY(x + low) - 24];
  const base: Pose = { ...POSES.stand(), hip: [-6, -172], lean: 24, head: -18 + Math.sin(Math.PI * frac) * 6, fN, fF };
  const p = reach(base, x, y, rN, rF, false, s);
  const j = J(x, y, p, false, s);
  return (
    <g>
      {lamp && <Glow at={j.head} r={60 * s + 14} color="#ffffff" a={0.55} />}
      <Hero x={x} y={y} s={s} pose={p} look={look} shadow={0} behind={(jj) => <rect x={jj.sh[0] - 44} y={jj.sh[1] - 6} width={40} height={80} rx={9} fill="#5a5a62" stroke="#000" strokeWidth={3} />} />
      {/* the ascender clipped to the rope at his upper hand */}
      <rect x={rN[0] - 5 * s - 2} y={rN[1] - 9 * s - 2} width={10 * s + 4} height={18 * s + 4} rx={2} fill="#e0483e" stroke="#000" strokeWidth={1.5} />
    </g>
  );
};
const Bubble: React.FC<{ x: number; y: number; t: string; a: number }> = ({ x, y, t, a }) => (
  <g opacity={a} transform={`translate(${x} ${y}) scale(${0.7 + 0.3 * a}) translate(${-x} ${-y})`}>
    <rect x={x - t.length * 4.3 - 10} y={y - 26} width={t.length * 8.6 + 20} height={30} rx={8} fill="#f2f2f2" stroke="#000" strokeWidth={1.5} />
    <path d={`M${x + 6} ${y + 4} l8 10 l2 -10 Z`} fill="#f2f2f2" stroke="#000" strokeWidth={1.5} />
    <text x={x} y={y - 6} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={16} fill="#000">{t}</text>
  </g>
);
const QUITTERS: { x0: number; say: string; alt: string; sayAt: number; sitAt: number }[] = [
  { x0: 726, say: "I'm so tired.", alt: "6,800 m", sayAt: C.SAY1, sitAt: C.SIT1 },
  { x0: 786, say: "It's too cold.", alt: "7,600 m", sayAt: C.SAY2, sitAt: C.SIT2 },
  { x0: 846, say: "I can't.", alt: "8,400 m", sayAt: C.SAY3, sitAt: C.SIT3 },
];
const Seg5: React.FC<{ t: number }> = ({ t }) => {
  const B = t / BEAT;
  const QL = 8, HL = 21;
  const xh = 690 + HL * stepped(B);
  const left = 4 - QUITTERS.filter((q) => B >= q.sitAt).length;
  const z = 2.5, c: V = [xh + 50, rY(xh + 50) - 20];
  const alt = Math.round(lerp(6500, 8600, clamp(B / 10)) / 100) * 100;
  return (
    <g>
      <defs><linearGradient id="predawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#06060a" /><stop offset="1" stopColor="#1e1e26" /></linearGradient></defs>
      <rect x={0} y={0} width={1080} height={1920} fill="url(#predawn)" />
      <Cam z={z} c={c}>
        <Ridge />
        {QUITTERS.map((q, i) => {
          const xq = q.x0 + QL * stepped(Math.min(B, q.sitAt));
          const sat = B >= q.sitAt;
          return (
            <g key={i}>
              {sat ? <Quit x={xq} t={q.alt} pose={{ ...SLOPE_SIT, head: 34 + i * 3 }} /> : <SlopeClimber x0={q.x0} n={B} len={QL} s={0.24} look={GREY} lamp />}
              {B >= q.sayAt && <Bubble x={xq - 34} y={rY(xq) - 64} t={q.say} a={fade(t, b(q.sayAt), 6)} />}
            </g>
          );
        })}
        <SlopeClimber x0={690} n={B} len={HL} s={0.26} look={HERO} lamp />
      </Cam>
      <Snow t={t} />
      <Hud alt={`${alt.toLocaleString("en-US")} m`} climbers={`${left} / 100`} />
      <Punch t={t} a={b(C.TXT5A)} bb={b(C.TXT5B)} l1="Right before the top…" l2="is where most give up." />
    </g>
  );
};
// ================================================================ 6 · dawn, 1 out of 100
const Seg6: React.FC<{ t: number }> = ({ t }) => {
  const B = t / BEAT;
  const summit: V = [SUMMIT[0] - 60, SUMMIT[1] - 60];
  const pull = ease.inOut(clamp(B / C.PULL6));
  const title = fade(t, b(C.TITLE), 10);
  return (
    <g>
      <Cam z={lerp(2.2, 1, pull)} c={mixV(summit, [540, 960], pull)}><M4 t={t} noText /></Cam>
      <g opacity={1 - title}><Hud alt="8,848 m" climbers="1 / 100" gold /></g>
      <Punch t={t} a={b(C.TXT6A)} bb={b(C.TXT6B)} l1="1 out of 100." l2="Be the one who doesn't quit." />
      {title > 0 && <g opacity={title}>
        <rect x={0} y={70} width={1080} height={140} fill="#000" opacity={0.85} />
        <text x={540} y={134} textAnchor="middle" fontFamily='"Arial Black", "Segoe UI Black", Impact, sans-serif' fontSize={46} letterSpacing={2} fill={GOLD}>YOU'RE CLOSER</text>
        <text x={540} y={188} textAnchor="middle" fontFamily='"Arial Black", "Segoe UI Black", Impact, sans-serif' fontSize={46} letterSpacing={2} fill={W}>THAN YOU THINK.</text>
      </g>}
    </g>
  );
};

// ================================================================ assembly: cross-dissolves, never black
const SEGS: [number, React.FC<{ t: number }>][] = [[Q.S0, Seg0], [Q.S1, Seg1], [Q.S2, Seg2], [Q.S3, Seg3], [Q.S4, Seg4], [Q.S5, Seg5], [Q.S6, Seg6]];
const XF = 8;
export const TrustFilm: React.FC<{ at?: number }> = ({ at }) => {
  const cur = useCurrentFrame();
  const f = at ?? cur;
  let k = 0; for (let i = 0; i < SEGS.length; i++) if (f >= SEGS[i][0]) k = i;
  const [start, Seg] = SEGS[k], end = k + 1 < SEGS.length ? SEGS[k + 1][0] : Q.LEN, t = f - start;
  const push = 1 + 0.03 * (t / (end - start));
  // the next scene dissolves in over the last XF frames (it starts at its own t = 0)
  const nx = k + 1 < SEGS.length && f >= end - XF ? SEGS[k + 1] : null;
  const NextSeg = nx ? nx[1] : null;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <KitDefs />
        <Defs />
        <g transform={`translate(540 960) scale(${push}) translate(-540 -960)`}><Seg t={t} /></g>
        {NextSeg && <g opacity={clamp((f - (end - XF)) / XF)}><rect x={0} y={0} width={1080} height={1920} fill="#000" /><NextSeg t={0} /></g>}
        <Vignette a={0.3} />
        <rect x={0} y={0} width={1080} height={1920} fill="#000" opacity={1 - clamp(f / 4)} />
      </svg>
    </AbsoluteFill>
  );
};
