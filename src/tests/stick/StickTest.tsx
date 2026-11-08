// StickTest: a 6 s test scene for the stick-figure channel idea "you only need to see the next step". The figure walks in the dark,
// every footstep lights the tile under it (and the two ahead), he trips once, finds his balance, walks on and the last step opens a door.
// 2D only: a spotlight following the figure, a reflective floor (the world drawn again upside down under a gradient mask, slightly
// blurred), seeded dust, a vignette. Everything is a pure function of the frame; every light/dust/shake comes from events.ts.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { CONTACTS, DOOR_OPEN_FROM, DOOR_OPEN_TO, DOOR_SLIT_FROM, DOOR_X, FLOOR_Y, FRAMES, TILE_STEP, TILE_W, ringAt, tileGlow } from "./events";
import { BONE, Frame, cameraX, frameJoints, shakeAt } from "./motion";

export const STICK_FRAMES = FRAMES;
const FONT = '"Arial Black", Impact, "Segoe UI Black", sans-serif';
const FIG = "#F2F2F2", BG = "#0B0B0D", WARM = "#ffd9a0";
const sm = (x: number) => { const t = Math.min(1, Math.max(0, x)); return t * t * (3 - 2 * t); };

/** mulberry32: the seeded random of the prompt (seed 7) */
const mulberry32 = (a: number) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const DUST = (() => { const r = mulberry32(7); return Array.from({ length: 40 }, () => ({ x: r(), y: r(), v: 0.15 + r() * 0.35, s: 1.4 + r() * 2.2, ph: r() * 6.28, a: 0.25 + r() * 0.5 })); })();

type V = [number, number];
const pts = (...p: V[]) => p.map((q, i) => `${i ? "L" : "M"}${q[0].toFixed(2)} ${q[1].toFixed(2)}`).join(" ");

/** the stick figure at screen coordinates: far limbs a little dimmer, near limbs full */
const Figure: React.FC<{ q: Frame; sx: (x: number) => number; sy: number; color?: string; far?: number }> = ({ q, sx, sy, color = FIG, far = 0.72 }) => {
  const P = (v: V): V => [sx(v[0]), v[1] + sy];
  const st = { stroke: color, strokeWidth: BONE.stroke, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  const h = P(q.head);
  return (
    <g>
      <path d={pts(P(q.hip), P(q.kneeR), P(q.ankleR), P(q.toeR))} {...st} opacity={far} />
      <path d={pts(P(q.shoulder), P(q.elbowR), P(q.wristR))} {...st} opacity={far} />
      <path d={pts(P(q.hip), P(q.shoulder), P(q.neck))} {...st} />
      <circle cx={h[0]} cy={h[1]} r={BONE.head} fill={color} />
      <path d={pts(P(q.hip), P(q.kneeL), P(q.ankleL), P(q.toeL))} {...st} />
      <path d={pts(P(q.shoulder), P(q.elbowL), P(q.wristL))} {...st} />
    </g>
  );
};

export const StickTest: React.FC = () => {
  const f = useCurrentFrame();
  const q = frameJoints(f), cam = cameraX(f), sh = shakeAt(f);
  const sx = (x: number) => x - cam + sh.dx;
  const hipSx = sx(q.hip[0]);
  const open = sm((f - DOOR_OPEN_FROM) / (DOOR_OPEN_TO - DOOR_OPEN_FROM)), slit = sm((f - DOOR_SLIT_FROM) / 15);
  const doorSx = sx(DOOR_X);
  const tiles = Array.from({ length: 12 }, (_, i) => i + 1); // tiles 1..12 (12 only shows ahead of the door)
  const ringTiles = CONTACTS.map((c) => c.tile);

  // the whole lit world in screen coordinates: tiles, door, figure (drawn once, used twice: real and reflected)
  const World = (
    <g id="world">
      {tiles.map((n) => {
        const cx = sx(n * TILE_STEP), g = tileGlow(n, f);
        if (cx < -200 || cx > 1300) return null;
        return (
          <g key={n}>
            <ellipse cx={cx} cy={FLOOR_Y + 3} rx={TILE_W * 1.1} ry={30} fill="url(#glow)" opacity={g * 0.9} />
            <rect x={cx - TILE_W / 2} y={FLOOR_Y - 5} width={TILE_W} height={10} rx={5} fill={g > 0.01 ? `rgb(${Math.round(38 + 217 * g)},${Math.round(38 + 195 * g)},${Math.round(44 + 140 * g)})` : "#26262c"} />
          </g>
        );
      })}
      {ringTiles.map((n) => {
        const p = ringAt(n, f);
        if (p < 0) return null;
        const cx = sx(n * TILE_STEP);
        return <ellipse key={`r${n}`} cx={cx} cy={FLOOR_Y} rx={55 + 130 * p} ry={7 + 20 * p} fill="none" stroke={WARM} strokeWidth={3} opacity={0.85 * (1 - p)} />;
      })}
      {/* the door just beyond tile 11: a dark leaf with a thin slit of light, then it opens and the light floods out */}
      <g>
        <rect x={doorSx - 44} y={FLOOR_Y - 330} width={88} height={330} fill="#050506" />
        <rect x={doorSx - 44} y={FLOOR_Y - 330} width={88} height={330} fill="url(#doorLight)" opacity={open} />
        <rect x={doorSx - 44} y={FLOOR_Y - 330} width={88 * (1 - 0.88 * open)} height={330} fill="#17171c" stroke="#2c2c33" strokeWidth={3} />
        <rect x={doorSx - 1.5 - 14 * open} y={FLOOR_Y - 330 + 8} width={3 + 28 * open} height={314} fill={WARM} opacity={0.2 + 0.8 * slit} />
      </g>
      {open > 0 && <Figure q={q} sx={(x) => sx(x) + 4} sy={0} color="#ffb867" far={0.5 * open} />}
      <Figure q={q} sx={sx} sy={0} />
    </g>
  );

  // dust inside the spotlight: 40 seeded particles that drift upwards from frame 0 (they also slide slowly against the camera)
  const dust = DUST.map((d, i) => {
    const span = 880, y = 420 + (((d.y * span - f * d.v * 1.6) % span) + span) % span;
    const x = hipSx - 250 + ((((d.x * 500 - cam * 0.12 + Math.sin(f * 0.03 + d.ph) * 12) % 500) + 500) % 500);
    const near = 1 - Math.min(1, Math.abs(x - hipSx) / 260);
    return <circle key={i} cx={x} cy={y} r={d.s} fill="#fff" opacity={d.a * near * (0.6 + 0.4 * Math.sin(f * 0.07 + d.ph))} />;
  });
  // dust puffs at every footstep (seeded, positions from the frame since the contact)
  const puffs = CONTACTS.flatMap((c) => {
    const u = f - c.f;
    if (u < 0 || u >= 12) return [];
    const r = mulberry32(7 + c.n * 13), fx = sx(c.x);
    return Array.from({ length: c.n === 5 || c.n === 6 ? 9 : 5 }, (_, i) => {
      const a = (r() - 0.5) * 2, v = 1.2 + r() * 2.2, rise = 6 + r() * 14;
      return <circle key={`${c.n}-${i}`} cx={fx + a * v * u * 1.6 - u * 0.6} cy={FLOOR_Y - 4 - rise * Math.sin((u / 12) * Math.PI)} r={2 + r() * 2.2 * (1 - u / 14)} fill="#fff" opacity={0.5 * (1 - u / 12)} />;
    });
  });

  return (
    <AbsoluteFill style={{ background: BG }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0 }}>
        <defs>
          <radialGradient id="glow"><stop offset="0%" stopColor={WARM} stopOpacity={0.95} /><stop offset="55%" stopColor={WARM} stopOpacity={0.25} /><stop offset="100%" stopColor={WARM} stopOpacity={0} /></radialGradient>
          <radialGradient id="spot" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#fff" stopOpacity={0.16} /><stop offset="60%" stopColor="#fff" stopOpacity={0.05} /><stop offset="100%" stopColor="#fff" stopOpacity={0} /></radialGradient>
          <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fff" stopOpacity={0.2} /><stop offset="100%" stopColor="#fff" stopOpacity={0.04} /></linearGradient>
          <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#15151a" /><stop offset="100%" stopColor={BG} /></linearGradient>
          <linearGradient id="reflGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fff" stopOpacity={0.5} /><stop offset="100%" stopColor="#fff" stopOpacity={0} /></linearGradient>
          <linearGradient id="doorLight" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fff6dc" /><stop offset="100%" stopColor={WARM} /></linearGradient>
          <radialGradient id="flood"><stop offset="0%" stopColor="#fff4d8" stopOpacity={0.95} /><stop offset="45%" stopColor={WARM} stopOpacity={0.45} /><stop offset="100%" stopColor={WARM} stopOpacity={0} /></radialGradient>
          <radialGradient id="vig" cx="50%" cy="50%" r="72%"><stop offset="55%" stopColor="#000" stopOpacity={0} /><stop offset="100%" stopColor="#000" stopOpacity={0.7} /></radialGradient>
          <mask id="reflMask" maskUnits="userSpaceOnUse" x={0} y={FLOOR_Y} width={1080} height={600}><rect x={0} y={FLOOR_Y} width={1080} height={600} fill="url(#reflGrad)" /></mask>
          <filter id="soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation={2.4} /></filter>
        </defs>

        {/* floor and the spotlight that follows the figure */}
        <rect x={0} y={FLOOR_Y} width={1080} height={600} fill="url(#floorGrad)" />
        <path d={`M${hipSx - 46} 0 L${hipSx + 46} 0 L${hipSx + 300} ${FLOOR_Y} L${hipSx - 300} ${FLOOR_Y} Z`} fill="url(#cone)" opacity={0.55} />
        <ellipse cx={hipSx} cy={900} rx={380} ry={640} fill="url(#spot)" />
        <ellipse cx={hipSx} cy={FLOOR_Y + 2} rx={300} ry={46} fill="url(#glow)" opacity={0.28} />
        <line x1={0} y1={FLOOR_Y} x2={1080} y2={FLOOR_Y} stroke="#1c1c22" strokeWidth={2} />

        {/* the world and its reflection (flipped under the floor line, fading and a little blurred) */}
        <g mask="url(#reflMask)" filter="url(#soft)"><g transform={`translate(0 ${2 * FLOOR_Y}) scale(1 -1)`}><use href="#world" /></g></g>
        {World}

        <g>{dust}{puffs}</g>

        {/* the light of the door floods the whole frame */}
        <ellipse cx={doorSx} cy={FLOOR_Y - 160} rx={260 + 1000 * open} ry={300 + 1100 * open} fill="url(#flood)" opacity={0.92 * open} style={{ mixBlendMode: "screen" }} />
        <rect x={0} y={0} width={1080} height={1920} fill="url(#vig)" />
      </svg>

      {/* words: the headline from frame 0 (inside the safe area: nothing in the bottom 20 % or the right 12 %) and a slot for the channel name */}
      <div style={{ position: "absolute", left: 0, width: 950, top: 150, textAlign: "center", fontFamily: FONT, fontSize: 64, letterSpacing: 6, color: "#ececf0", opacity: 1 - 0.55 * open }}>ONE STEP AT A TIME</div>
      <div style={{ position: "absolute", left: 275, top: 1468, width: 400, height: 58, border: "2px solid #34343c", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: 24, letterSpacing: 5, color: "#4c4c55" }}>CHANNEL NAME</div>
    </AbsoluteFill>
  );
};
