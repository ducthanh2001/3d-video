// TruckTest: a stick figure drives a truck through the night, a meteor falls and the truck blows apart; the blast throws the driver
// clear (cartoon, no gore) and he ends up sitting on the road looking at the burning wreck. 2D only, all pure functions of the frame
// (seeded particles, closed-form ballistics); every beat comes from events.ts. 1080x1920, 30 fps, 240 frames.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { F, FLOOR_Y, FRAMES, METEOR } from "./events";
import { BONE } from "../stick/motion";
import { HIT_W, Joints, WHEEL_R, ballistic, bob, cameraX, driverJoints, meteorAt, shakeAt, sm, truckX, wheelAngle, wreckX } from "./kin";

export const TRUCK_FRAMES = FRAMES;
const FIG = "#F2F2F2", BG = "#08080b";
type V = [number, number];
const mulberry32 = (a: number) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const pts = (...p: V[]) => p.map((q, i) => `${i ? "L" : "M"}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" ");
const lerpC = (a: number[], b: number[], t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const FIRE: number[][] = [[255, 246, 208], [255, 177, 58], [255, 90, 31], [58, 42, 40]];
const fireColor = (u: number) => { const k = Math.min(0.999, Math.max(0, u)) * 3, i = Math.floor(k), c = lerpC(FIRE[i], FIRE[i + 1], k - i); return `rgb(${c[0]},${c[1]},${c[2]})`; };

// ---- seeded scenery
const STARS = (() => { const r = mulberry32(11); return Array.from({ length: 90 }, () => ({ x: r() * 1080, y: r() * 880, s: 0.8 + r() * 1.6, ph: r() * 6.28 })); })();
const hills = (seed: number, amp: number, base: number) => { const r = mulberry32(seed); const p: V[] = []; for (let i = 0; i <= 16; i++) p.push([i * 100, base - amp * (0.4 + 0.6 * r())]); p[16][1] = p[0][1]; return p; };
const HILL_A = hills(3, 120, 1180), HILL_B = hills(9, 80, 1250);
const SPARKS = (() => { const r = mulberry32(21); return Array.from({ length: 46 }, () => { const a = r() * 6.283, s = 6 + r() * 16; return { vx: Math.cos(a) * s, vy: Math.sin(a) * s - 4, life: 14 + r() * 16 }; }); })();
const FIREBALL = (() => { const r = mulberry32(5); return Array.from({ length: 30 }, () => { const a = r() * 6.283, s = 2 + r() * 11; return { dx: Math.cos(a) * s, dy: Math.sin(a) * s * 0.85 - 2.4, r: 18 + r() * 52, d: Math.floor(r() * 5) }; }); })();
const SMOKE = (() => { const r = mulberry32(8); return Array.from({ length: 30 }, (_, i) => ({ t0: F.hit + 5 + i * 3.6, ox: (r() - 0.5) * 90, rise: 1.3 + r() * 1.4, r0: 16 + r() * 10, ph: r() * 6.28 })); })();
const FLAMES = (() => { const r = mulberry32(13); return Array.from({ length: 9 }, (_, i) => ({ ox: -150 + i * 50 + (r() - 0.5) * 20, h: 70 + r() * 70, w: 24 + r() * 22, ph: r() * 6.28 })); })();
const EXHAUST = (() => { const r = mulberry32(17); return Array.from({ length: 10 }, (_, i) => ({ k: i, dy: r() * 10, s: 5 + r() * 5 })); })();

// ---- the truck: local coordinates (origin = truck centre on the road, +x forward, y up is negative)
type Part = { id: string; kind: "rect" | "poly" | "wheel" | "pipe"; c: V; w?: number; h?: number; poly?: V[]; fill: string };
const PARTS: Part[] = [
  { id: "box1", kind: "rect", c: [-215, -181], w: 80, h: 190, fill: "#1d1d23" }, { id: "box2", kind: "rect", c: [-135, -181], w: 80, h: 190, fill: "#202027" }, { id: "box3", kind: "rect", c: [-70, -181], w: 50, h: 190, fill: "#1b1b21" },
  { id: "cab", kind: "poly", c: [36, -198], poly: [[-76, 112], [-76, -112], [34, -112], [76, -27], [76, 112]].map(([x, y]) => [x, y] as V), fill: "#17171c" },
  { id: "hood", kind: "poly", c: [158, -118], poly: [[-46, 32], [-46, -32], [47, -14], [47, 32]].map(([x, y]) => [x, y] as V), fill: "#1b1b21" },
  { id: "chassisA", kind: "rect", c: [-140, -78], w: 250, h: 16, fill: "#2a2a31" }, { id: "chassisB", kind: "rect", c: [85, -78], w: 240, h: 16, fill: "#2a2a31" },
  { id: "wheelR", kind: "wheel", c: [-170, -46], fill: "#111" }, { id: "wheelF", kind: "wheel", c: [140, -46], fill: "#111" },
  { id: "pipe", kind: "pipe", c: [-30, -330], w: 8, h: 56, fill: "#2a2a31" },
];
const WINDOW: V[] = [[-6, -292], [56, -292], [94, -228], [94, -112], [-6, -112]];
const DEBRIS = (() => {
  const r = mulberry32(31);
  return PARTS.map((p, i) => {
    const dx = p.c[0] + 20, dy = p.c[1] + 200, n = Math.hypot(dx, dy) || 1, sp = 5 + r() * 7;
    return { p, vx: (dx / n) * sp * 0.9 + 2 + (r() - 0.5) * 3, vy: (dy / n) * sp - 8 - r() * 5, om: (r() - 0.5) * (p.kind === "wheel" ? 0.5 : 0.36), a0: 0 + i * 0, i };
  });
})();

const Figure: React.FC<{ j: Joints; sx: (x: number) => number; sy: number }> = ({ j, sx, sy }) => {
  const P = (v: V): V => [sx(v[0]), v[1] + sy];
  const st = { stroke: FIG, strokeWidth: BONE.stroke, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  const h = P(j.head);
  return (
    <g>
      <path d={pts(P(j.hip), P(j.kneeR), P(j.ankleR), P(j.toeR))} {...st} opacity={0.72} />
      <path d={pts(P(j.shoulder), P(j.elbowR), P(j.wristR))} {...st} opacity={0.72} />
      <path d={pts(P(j.hip), P(j.shoulder), P(j.neck))} {...st} />
      <circle cx={h[0]} cy={h[1]} r={BONE.head} fill={FIG} />
      <path d={pts(P(j.hip), P(j.kneeL), P(j.ankleL), P(j.toeL))} {...st} />
      <path d={pts(P(j.shoulder), P(j.elbowL), P(j.wristL))} {...st} />
    </g>
  );
};

const Wheel: React.FC<{ x: number; y: number; ang: number; stroke?: string; fill?: string }> = ({ x, y, ang, stroke = FIG, fill = "#0c0c0f" }) => (
  <g transform={`translate(${x} ${y}) rotate(${(ang * 180) / Math.PI})`}>
    <circle r={WHEEL_R} fill={fill} stroke={stroke} strokeWidth={7} />
    <circle r={WHEEL_R - 17} fill="none" stroke="#3a3a42" strokeWidth={3} />
    {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={0} y1={0} x2={0} y2={-(WHEEL_R - 10)} stroke={stroke} strokeWidth={4} transform={`rotate(${i * 72})`} strokeLinecap="round" />)}
    <circle r={6} fill={stroke} />
  </g>
);

export const TruckTest: React.FC = () => {
  const f = useCurrentFrame();
  const cam = cameraX(f), sh = shakeAt(f);
  const sx = (x: number) => x - cam + sh.dx, syo = sh.dy;
  const pre = f < F.hit, tx = truckX(f), tb = bob(f);
  const m = meteorAt(f), mS: V = [sx(m.p[0]), m.p[1] + syo];
  const hitS: V = [sx(HIT_W[0]), HIT_W[1] + syo];
  const glowPre = f >= METEOR.start && pre ? sm((f - METEOR.start) / (F.hit - METEOR.start)) : 0;
  const t = f - F.hit; // time since the strike
  const j = driverJoints(f), driverInCab = pre;
  const wx = wreckX(f), wS = sx(wx);
  const flick = 0.85 + 0.15 * Math.sin(f * 1.7) * Math.sin(f * 0.6);

  // road furniture (parallax): poles and lane dashes follow the world
  const poles: React.ReactNode[] = [];
  for (let n = Math.floor((cam - 200) / 640); n <= Math.ceil((cam + 1300) / 640); n++) {
    const px = sx(n * 640 + 120);
    poles.push(<g key={n}><line x1={px} y1={FLOOR_Y - 4} x2={px} y2={FLOOR_Y - 380} stroke="#23232a" strokeWidth={9} /><line x1={px - 44} y1={FLOOR_Y - 350} x2={px + 44} y2={FLOOR_Y - 350} stroke="#23232a" strokeWidth={7} /><path d={`M${px + 44} ${FLOOR_Y - 350} Q${px + 340} ${FLOOR_Y - 300} ${px + 596} ${FLOOR_Y - 350}`} fill="none" stroke="#1c1c22" strokeWidth={3} /></g>);
  }
  const dashes: React.ReactNode[] = [];
  for (let n = Math.floor((cam - 100) / 220); n <= Math.ceil((cam + 1200) / 220); n++) dashes.push(<rect key={n} x={sx(n * 220)} y={FLOOR_Y + 120} width={96} height={8} rx={3} fill="#3b3b44" />);
  const hillPath = (poly: V[], par: number, fill: string) => {
    const off = -((cam * par) % 1600), out: V[] = [];
    for (let k = -1; k < 2; k++) for (const p of poly) out.push([p[0] + off + k * 1600, p[1]]);
    return <path d={pts(...out, [out[out.length - 1][0], FLOOR_Y], [out[0][0], FLOOR_Y]) + " Z"} fill={fill} />;
  };

  // ---- the strike
  const flashA = [0.92, 0.75, 0.5, 0.3, 0.15][Math.floor(t)] ?? 0;
  const ring = t >= 0 && t < 22 ? t : -1;
  const debris = t < 0 ? null : DEBRIS.map((d) => {
    const x0 = truckX(F.hit) + d.p.c[0], y0 = FLOOR_Y + d.p.c[1] + (bob(F.hit - 1) || 0);
    const rad = d.p.kind === "wheel" ? WHEEL_R : Math.min(d.p.w ?? 40, d.p.h ?? 40) / 2;
    const b = ballistic(x0, y0, d.vx, d.vy, 1.1, FLOOR_Y - rad, t);
    const ang = d.om * Math.min(t, 40) * (b.air ? 1 : 0.6), hot = Math.max(0, 1 - t / 40);
    const stroke = hot > 0.02 ? fireColor(0.5 - 0.5 * hot) : "#7d7d86", X = sx(b.x), Y = b.y + syo;
    if (d.p.kind === "wheel") return <Wheel key={d.i} x={X} y={Y} ang={d.om * Math.min(t, 60) * 1.5 + wheelAngle(F.hit)} stroke={stroke} />;
    const body = d.p.kind === "poly" ? <polygon points={d.p.poly!.map((q) => q.join(",")).join(" ")} fill={d.p.fill} stroke={stroke} strokeWidth={5} strokeLinejoin="round" /> : <rect x={-(d.p.w ?? 0) / 2} y={-(d.p.h ?? 0) / 2} width={d.p.w} height={d.p.h} fill={d.p.fill} stroke={stroke} strokeWidth={5} />;
    return <g key={d.i} transform={`translate(${X} ${Y}) rotate(${(ang * 180) / Math.PI})`}>{body}</g>;
  });

  return (
    <AbsoluteFill style={{ background: BG }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, transform: "scale(1.3)", transformOrigin: "380px 1320px" }}>
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#05060d" /><stop offset="70%" stopColor="#0d1022" /><stop offset="100%" stopColor="#1a1630" /></linearGradient>
          <radialGradient id="halo"><stop offset="0%" stopColor="#fff2cf" stopOpacity={1} /><stop offset="30%" stopColor="#ffa94a" stopOpacity={0.7} /><stop offset="100%" stopColor="#ff6a1f" stopOpacity={0} /></radialGradient>
          <radialGradient id="fireLight"><stop offset="0%" stopColor="#ff9a3a" stopOpacity={0.6} /><stop offset="100%" stopColor="#ff6a1f" stopOpacity={0} /></radialGradient>
          <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#fff0c8" stopOpacity={0.35} /><stop offset="100%" stopColor="#fff0c8" stopOpacity={0} /></linearGradient>
          <radialGradient id="vig" cx="50%" cy="50%" r="72%"><stop offset="55%" stopColor="#000" stopOpacity={0} /><stop offset="100%" stopColor="#000" stopOpacity={0.66} /></radialGradient>
          <clipPath id="win"><polygon points={WINDOW.map((q) => `${sx(tx) + q[0]},${FLOOR_Y + tb + q[1] + syo}`).join(" ")} /></clipPath>
        </defs>

        <rect width={1080} height={1920} fill="url(#sky)" />
        {STARS.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#fff" opacity={0.3 + 0.5 * Math.abs(Math.sin(f * 0.05 + s.ph))} />)}
        {hillPath(HILL_A, 0.08, "#0a0a12")}
        {hillPath(HILL_B, 0.22, "#0d0d15")}
        <rect x={0} y={FLOOR_Y} width={1080} height={600} fill="#101014" />
        <rect x={0} y={FLOOR_Y} width={1080} height={5} fill="#2a2a31" />
        <rect x={0} y={FLOOR_Y + 232} width={1080} height={4} fill="#1d1d23" />
        {dashes}
        {poles}

        {/* meteor glow on the whole scene before the strike */}
        <rect width={1080} height={1920} fill="#ff7a2a" opacity={0.16 * glowPre * glowPre} style={{ mixBlendMode: "screen" }} />

        {/* the truck: only before the strike (afterwards its parts are debris) */}
        {pre && (
          <g>
            <polygon points={`${sx(tx) + 205},${FLOOR_Y + tb - 108} ${sx(tx) + 760},${FLOOR_Y + tb - 40} ${sx(tx) + 760},${FLOOR_Y + tb + 4} ${sx(tx) + 205},${FLOOR_Y + tb - 86}`} fill="url(#beam)" />
            <g transform={`translate(${sx(tx)} ${FLOOR_Y + tb + syo})`}>
              <g stroke={FIG} strokeWidth={5} strokeLinejoin="round">
                {PARTS.filter((p) => p.kind === "rect" || p.kind === "poly" || p.kind === "pipe").map((p) => (
                  <g key={p.id} transform={`translate(${p.c[0]} ${p.c[1]})`}>
                    {p.kind === "poly" ? <polygon points={p.poly!.map((q) => q.join(",")).join(" ")} fill={p.fill} /> : <rect x={-(p.w ?? 0) / 2} y={-(p.h ?? 0) / 2} width={p.w} height={p.h} fill={p.fill} />}
                  </g>
                ))}
              </g>
              <polygon points={WINDOW.map((q) => q.join(",")).join(" ")} fill="#0a1220" stroke={FIG} strokeWidth={4} strokeLinejoin="round" />
              <circle cx={200} cy={-108} r={9} fill="#fff6d8" />
              <ellipse cx={206} cy={-108} rx={34} ry={20} fill="url(#halo)" opacity={0.55} />
            </g>
            {EXHAUST.map((e) => { const age = (f * 0.9 + e.k * 6) % 60, px = tx - 30 - age * 3.4 - e.k * 2, py = FLOOR_Y - 360 - age * 0.9 - e.dy; return <circle key={e.k} cx={sx(px)} cy={py + syo} r={e.s + age * 0.18} fill="#5a5a64" opacity={0.28 * (1 - age / 60)} />; })}
            <Wheel x={sx(tx - 170)} y={FLOOR_Y - 46 + tb + syo} ang={wheelAngle(f)} />
            <Wheel x={sx(tx + 140)} y={FLOOR_Y - 46 + tb + syo} ang={wheelAngle(f)} />
          </g>
        )}

        {/* the driver: seen through the cab window before the strike, free afterwards */}
        {driverInCab ? (
          <g clipPath="url(#win)">
            <line x1={sx(tx + 92) - 8} y1={FLOOR_Y - 190 + tb - 18 + syo} x2={sx(tx + 92) + 8} y2={FLOOR_Y - 190 + tb + 18 + syo} stroke="#8b8b94" strokeWidth={6} strokeLinecap="round" />
            <Figure j={j} sx={sx} sy={syo} />
          </g>
        ) : <Figure j={j} sx={sx} sy={syo} />}

        {/* the wreck: the bare, burning chassis coasts to a stop */}
        {t >= 0 && (
          <g>
            <rect x={wS - 260} y={FLOOR_Y - 90 + syo} width={470} height={14} rx={3} fill="#1a1a1f" stroke="#55555e" strokeWidth={4} />
            {FLAMES.map((fl, i) => {
              const life = Math.min(1, t / 8) * (1 - 0.45 * Math.min(1, Math.max(0, (t - 60) / 150))), h = fl.h * life * (0.7 + 0.3 * Math.sin(f * 0.5 + fl.ph)), w = fl.w * life, cx = wS + fl.ox, by = FLOOR_Y - 90 + syo;
              return <g key={i}><path d={`M${cx - w} ${by} Q${cx - w * 0.9} ${by - h * 0.6} ${cx} ${by - h} Q${cx + w * 0.9} ${by - h * 0.6} ${cx + w} ${by} Z`} fill="#ff6a1f" opacity={0.85} /><path d={`M${cx - w * 0.5} ${by} Q${cx - w * 0.4} ${by - h * 0.5} ${cx} ${by - h * 0.7} Q${cx + w * 0.4} ${by - h * 0.5} ${cx + w * 0.5} ${by} Z`} fill="#ffd36a" /></g>;
            })}
          </g>
        )}
        {debris}

        {/* meteor and its flaming trail */}
        {f >= METEOR.start && pre && (
          <g>
            {Array.from({ length: 52 }, (_, k) => {
              const fb = f - k * 0.55;
              if (fb < METEOR.start) return null;
              const q = meteorAt(fb), a = 1 - k / 52, jr = mulberry32(100 + k)();
              return <circle key={k} cx={sx(q.p[0]) + (jr - 0.5) * 16 * k * 0.3} cy={q.p[1] + syo + (jr - 0.5) * 10} r={Math.max(2, q.r * 0.9 * a)} fill={fireColor(0.15 + 0.75 * (k / 52))} opacity={0.75 * a} />;
            })}
            <circle cx={mS[0]} cy={mS[1]} r={m.r * 3.4} fill="url(#halo)" />
            <circle cx={mS[0]} cy={mS[1]} r={m.r} fill="#ffb347" />
            <circle cx={mS[0] - m.r * 0.2} cy={mS[1] + m.r * 0.2} r={m.r * 0.55} fill="#fff6d8" />
          </g>
        )}

        {/* explosion: shock ring, fireball, sparks, smoke */}
        {t >= 0 && (
          <g>
            {ring >= 0 && <circle cx={hitS[0]} cy={hitS[1]} r={30 + 38 * ring} fill="none" stroke="#ffe7b0" strokeWidth={2 + 10 * (1 - ring / 22)} opacity={0.8 * (1 - ring / 22)} />}
            {t < 40 && FIREBALL.map((b, i) => { const u = (t - b.d * 0.6) / 36; if (u < 0 || u > 1) return null; return <circle key={i} cx={hitS[0] + b.dx * (t - b.d * 0.6) * (1 - 0.35 * u)} cy={hitS[1] + b.dy * (t - b.d * 0.6) * (1 - 0.35 * u)} r={b.r * (0.45 + 0.9 * Math.sin(Math.min(1, u * 1.1) * 1.75)) * (u > 0.7 ? 1 - (u - 0.7) / 0.3 * 0.6 : 1)} fill={fireColor(u)} opacity={Math.max(0, 1 - u * u * 0.95)} />; })}
            {SPARKS.map((s, i) => { const tt = t; if (tt > s.life) return null; const b = ballistic(HIT_W[0], HIT_W[1], s.vx, s.vy, 0.9, FLOOR_Y - 2, tt, 0.3); return <circle key={i} cx={sx(b.x)} cy={b.y + syo} r={3.2 * (1 - tt / s.life) + 0.8} fill="#ffd36a" />; })}
            {SMOKE.map((s, i) => {
              const age = f - s.t0; if (age < 0 || age > 95) return null;
              return <circle key={i} cx={sx(wreckX(s.t0) + s.ox + Math.sin(age * 0.06 + s.ph) * 22 + age * 0.5)} cy={FLOOR_Y - 120 - age * s.rise + syo} r={s.r0 + age * 0.75} fill="#2f2f37" opacity={0.42 * (1 - age / 95)} />;
            })}
          </g>
        )}

        {/* fire light on the road after the strike */}
        {t >= 0 && <ellipse cx={wS - 40} cy={FLOOR_Y - 40} rx={620} ry={420} fill="url(#fireLight)" opacity={Math.min(1, t / 10) * flick * 0.8} style={{ mixBlendMode: "screen" }} />}
        <rect width={1080} height={1920} fill="url(#vig)" />
        {flashA > 0 && <rect width={1080} height={1920} fill="#fff2d6" opacity={flashA} />}
      </svg>
    </AbsoluteFill>
  );
};
