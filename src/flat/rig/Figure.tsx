// drawCharacter for the action characters: one SVG figure from a FigSpec (what it looks like) + a RigPose (where the joints are).
// Draw order (near = the shield side, far = the weapon side): legs, cloak, far arm + weapon, torso + skirt, head + helmet, near
// arm, shield. Style is src/flat/style.ts: round head, thick ink, flat colours, tube limbs, ball hands.
import React, { useId } from "react";
import { INK, PAL, STROKE } from "../style";
import { Cloud, Tube, sw, swFill } from "../FlatCharacter";
import { BONES, RigPose, V, solve } from "./rig";

export type HelmetKind = "hoplite" | "hoplite_big" | "turban" | "crown" | "hood" | "none";
export type ShieldSpec = { kind: "round" | "reed"; color: string; rim: string; mark?: "ring" | "dot" | "stripe" | "none" };
export type WeaponKind = "spear" | "short_spear" | "bow" | "torch" | "none";
export type Mood = "calm" | "stern" | "shout" | "worried" | "surprised" | "smile" | "fierce" | "roar";

export type FigSpec = {
  size: number; // 1 = the standard figure (600 units tall)
  skin: string;
  hair?: string;
  helmet: HelmetKind;
  helmetColor?: string; // bronze for hoplites, cloth for turbans
  crest?: string;
  beard?: { color: string; size: number; style?: "cloud" | "point" };
  /** a cape over the shoulders (drawn over the torso, under the head) */
  mantle?: string;
  tunic: string; // torso / skirt colour
  armor?: string; // bronze cuirass over the tunic
  pattern?: { kind: "diamond" | "stripe"; color: string };
  skirt: "short" | "robe" | "none";
  skirtColor?: string;
  legColor: string; // thighs (skin for Greeks, trousers for Persians)
  greaves?: string;
  boots: string;
  cloak?: string;
  shield?: ShieldSpec;
  weapon: WeaponKind;
  shaft?: string;
  brow?: string;
};

export type FigureProps = {
  spec: FigSpec; pose: RigPose; x: number; y: number; scale?: number; flip?: boolean; mood?: Mood; look?: number; blink?: boolean;
  /** extra decoration drawn in character coordinates (a throne, a flame), behind the figure */
  behind?: React.ReactNode;
};

const BRONZE = "#c99a3c", BRONZE_D = "#9b7226";
const clean = (s: string) => s.replace(/[^a-zA-Z0-9]/g, "");
const polar = (c: V, r: number, deg: number): V => [c[0] + r * Math.sin((deg * Math.PI) / 180), c[1] - r * Math.cos((deg * Math.PI) / 180)];

/** a ball hand with a thumb (the thumb sticks out forward and up) */
const HandBall: React.FC<{ at: V; skin: string; r?: number }> = ({ at: [x, y], skin, r = 19 }) => (
  <g>
    <ellipse cx={x + 12} cy={y - 11} rx={8} ry={12} transform={`rotate(32 ${x + 12} ${y - 11})`} style={swFill(skin)} />
    <circle cx={x} cy={y} r={r} style={swFill(skin)} />
  </g>
);

const Limb: React.FC<{ a: V; b: V; c: V; w: number; c1: string; c2: string }> = ({ a, b, c, w, c1, c2 }) => (
  <g>
    <Tube d={`M${a[0]} ${a[1]} L${b[0]} ${b[1]}`} w={w} fill={c1} />
    <Tube d={`M${b[0]} ${b[1]} L${c[0]} ${c[1]}`} w={w} fill={c2} />
    <circle cx={b[0]} cy={b[1]} r={w / 2} fill={c1} />
  </g>
);

const Spear: React.FC<{ grip: V; angle: number; len: number; back: number; shaft: string }> = ({ grip, angle, len, back, shaft }) => {
  const d: V = [Math.cos((angle * Math.PI) / 180), Math.sin((angle * Math.PI) / 180)];
  const butt: V = [grip[0] - d[0] * back, grip[1] - d[1] * back], tip: V = [grip[0] + d[0] * len, grip[1] + d[1] * len];
  const n: V = [-d[1], d[0]], hb: V = [tip[0] - d[0] * 56, tip[1] - d[1] * 56], hf: V = [tip[0] + d[0] * 30, tip[1] + d[1] * 30];
  return (
    <g>
      <Tube d={`M${butt[0]} ${butt[1]} L${tip[0] - d[0] * 40} ${tip[1] - d[1] * 40}`} w={11} fill={shaft} />
      <path d={`M${hb[0]} ${hb[1]} Q${hb[0] + n[0] * 17} ${hb[1] + n[1] * 17} ${hf[0]} ${hf[1]} Q${hb[0] - n[0] * 17} ${hb[1] - n[1] * 17} ${hb[0]} ${hb[1]} Z`} style={swFill("#c8d0d8", 0.8)} />
    </g>
  );
};

const Torch: React.FC<{ grip: V; angle: number }> = ({ grip, angle }) => {
  const d: V = [Math.cos((angle * Math.PI) / 180), Math.sin((angle * Math.PI) / 180)], tip: V = [grip[0] + d[0] * 110, grip[1] + d[1] * 110];
  return (
    <g>
      <Tube d={`M${grip[0] - d[0] * 40} ${grip[1] - d[1] * 40} L${tip[0]} ${tip[1]}`} w={12} fill="#7a4a24" />
      <ellipse cx={tip[0]} cy={tip[1] - 34} rx={26} ry={42} style={swFill("#f28c28", 0.9)} />
      <ellipse cx={tip[0]} cy={tip[1] - 26} rx={13} ry={26} fill={PAL.gold} />
    </g>
  );
};

const Bow: React.FC<{ hand: V }> = ({ hand }) => (
  <g>
    <path d={`M${hand[0] + 10} ${hand[1] - 130} Q${hand[0] + 70} ${hand[1]} ${hand[0] + 10} ${hand[1] + 130}`} fill="none" style={{ ...sw(1.6), strokeWidth: `calc(10px + var(--sw) * 2)` }} />
    <path d={`M${hand[0] + 10} ${hand[1] - 130} Q${hand[0] + 70} ${hand[1]} ${hand[0] + 10} ${hand[1] + 130}`} fill="none" stroke="#7a4a24" strokeWidth={10} strokeLinecap="round" />
    <path d={`M${hand[0] + 10} ${hand[1] - 130} L${hand[0] - 20} ${hand[1]} L${hand[0] + 10} ${hand[1] + 130}`} fill="none" stroke="#f4efe2" strokeWidth={3} />
  </g>
);

const Shield: React.FC<{ s: ShieldSpec; at: V; id: string }> = ({ s, at, id }) => {
  if (s.kind === "round") {
    const c: V = [at[0] + 28, at[1] - 4], r = 124, bronze = "#d9a73e", dark = "#8a6420";
    return (
      <g>
        <circle cx={c[0] + 7} cy={c[1] + 9} r={r} fill="rgba(27,27,47,0.22)" />
        <circle cx={c[0]} cy={c[1]} r={r} style={swFill(bronze, 1.4)} />
        <circle cx={c[0]} cy={c[1]} r={r - 17} style={swFill(s.color, 1)} />
        <path d={`M${c[0] - r + 30} ${c[1] - 20} A${r - 30} ${r - 30} 0 0 1 ${c[0] + 6} ${c[1] - r + 28}`} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={14} strokeLinecap="round" />
        <circle cx={c[0]} cy={c[1]} r={r - 17} fill="none" stroke={dark} strokeWidth={5} />
        <circle cx={c[0]} cy={c[1]} r={r * 0.56} fill="none" stroke={bronze} strokeWidth={7} />
        {s.mark === "ring" && <circle cx={c[0]} cy={c[1]} r={r * 0.36} fill="none" stroke={s.rim} strokeWidth={8} />}
        {s.mark === "stripe" && <path d={`M${c[0] - r + 24} ${c[1]} H${c[0] + r - 24}`} stroke={s.rim} strokeWidth={20} />}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const q = polar(c, r - 8, i * 45); return <circle key={i} cx={q[0]} cy={q[1]} r={5} fill={dark} />; })}
        <circle cx={c[0]} cy={c[1]} r={s.mark === "dot" ? 34 : 24} style={swFill(bronze, 0.9)} />
        <circle cx={c[0] - 7} cy={c[1] - 8} r={8} fill="rgba(255,255,255,0.55)" />
      </g>
    );
  }
  const c: V = [at[0] + 30, at[1] - 22], w = 150, h = 215;
  return (
    <g>
      <clipPath id={`sc${id}`}><rect x={c[0] - w / 2} y={c[1] - h / 2} width={w} height={h} rx={26} /></clipPath>
      <rect x={c[0] - w / 2} y={c[1] - h / 2} width={w} height={h} rx={26} style={swFill(s.color, 1.2)} />
      <g clipPath={`url(#sc${id})`} stroke={s.rim} strokeWidth={5} opacity={0.75}>
        {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${c[0] - w / 2} ${c[1] - h / 2 + i * 30} l${w} ${w}`} />)}
        {Array.from({ length: 9 }, (_, i) => <path key={`b${i}`} d={`M${c[0] + w / 2} ${c[1] - h / 2 + i * 30} l${-w} ${w}`} />)}
      </g>
      <rect x={c[0] - w / 2} y={c[1] - h / 2} width={w} height={h} rx={26} fill="none" style={{ ...sw(1.2), stroke: INK }} />
      <path d={`M${c[0] - w / 2 + 14} ${c[1] - h / 2 + 12} H${c[0] + w / 2 - 14}`} stroke={s.rim} strokeWidth={9} strokeLinecap="round" />
    </g>
  );
};

const Face: React.FC<{ mood: Mood; look: number; blink: boolean; brow: string; skin: string; id: string }> = ({ mood, look, blink, brow, skin, id }) => {
  const angry = mood === "fierce" || mood === "roar";
  const big = mood === "surprised" ? 1.2 : mood === "stern" ? 0.82 : angry ? 0.74 : 1;
  const bs: Record<Mood, number> = { calm: 0, stern: 16, shout: 12, worried: -16, surprised: -6, smile: -3, fierce: 30, roar: 34 };
  const lift = mood === "surprised" ? -14 : mood === "worried" ? -6 : angry ? 22 : 0;
  const eyes: V[] = [[22, -10], [78, -10]];
  return (
    <g>
      {eyes.map(([ex, ey], i) => (
        <g key={i}>
          {blink ? <path d={`M${ex - 16} ${ey} h32`} style={sw(1)} /> : (
            <>
              <clipPath id={`${id}${i}`}><ellipse cx={ex} cy={ey} rx={21} ry={28 * big} /></clipPath>
              <ellipse cx={ex} cy={ey} rx={21} ry={28 * big} style={swFill("#fff", 0.9)} />
              <circle cx={ex + 7 + look * 4} cy={ey + 2} r={mood === "surprised" ? 6 : angry ? 8.5 : 9.5} fill={INK} />
            </>
          )}
          <path d={`M${ex - 24} ${ey - 40 + lift} L${ex + 24} ${ey - 40 + lift}`} transform={`rotate(${i === 0 ? bs[mood] : -bs[mood]} ${ex} ${ey - 40 + lift})`} fill="none" style={{ ...sw(angry ? 2.1 : 1.5), stroke: brow }} />
        </g>
      ))}
      {mood === "roar" ? (
        <g>
          <path d="M26 40 Q58 28 92 40 Q96 92 58 98 Q22 92 26 40 Z" style={swFill(PAL.dark, 0.9)} />
          <path d="M30 42 Q58 33 88 42 L86 56 Q58 50 32 56 Z" fill="#fff" />
          <ellipse cx={58} cy={88} rx={20} ry={9} fill="#e8707a" />
        </g>
      ) : mood === "fierce" ? (
        <g>
          <path d="M24 48 Q58 40 94 48 L90 76 Q58 84 28 76 Z" style={swFill("#fff", 0.9)} />
          <path d="M26 62 H92 M44 46 V80 M60 44 V82 M76 46 V80" fill="none" style={{ ...sw(0.55), stroke: INK }} />
        </g>
      ) : mood === "shout" || mood === "surprised" ? <ellipse cx={58} cy={52} rx={mood === "shout" ? 24 : 14} ry={mood === "shout" ? 24 : 20} style={swFill(PAL.dark, 0.9)} />
        : mood === "worried" ? <path d="M30 56 q14 -14 28 0 t28 0" fill="none" style={sw(1)} />
        : mood === "stern" ? <path d="M32 54 h52" fill="none" style={sw(1.1)} />
        : <path d="M32 46 Q58 70 86 44" fill="none" style={sw(1.1)} />}
    </g>
  );
};

/** helmet / headdress, in head coordinates (head centre = 0,0, radius 120) */
const Headgear: React.FC<{ spec: FigSpec }> = ({ spec }) => {
  const c = spec.helmetColor ?? BRONZE;
  switch (spec.helmet) {
    case "hoplite":
    case "hoplite_big": {
      const big = spec.helmet === "hoplite_big", crest = spec.crest ?? "#d8322d", R0 = big ? 128 : 124, th = big ? 74 : 54;
      const hl = "#ecc96a", cr: V = [0, -6];
      const N = 18, outer: V[] = [], inner: V[] = [];
      for (let k = 0; k <= N; k++) {
        const t = k / N, a = -104 + 172 * t, w = th * Math.pow(Math.sin(Math.PI * Math.min(1, 0.12 + t * 0.88)), 0.7) + 5;
        outer.push(polar(cr, R0 + w, a)); inner.push(polar(cr, R0 - 2, a));
      }
      const crestPath = "M" + outer.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" L") + " L" + inner.reverse().map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" L") + " Z";
      return (
        <g>
          {/* neck guard flaring at the back, then the horsehair crest, then the dome */}
          <path d="M-96 -30 Q-150 10 -146 66 Q-100 84 -58 60 Z" style={swFill(c, 1.2)} />
          <path d={crestPath} style={swFill(crest, 1.3)} />
          {Array.from({ length: 9 }, (_, k) => { const a = -86 + k * 17, p1 = polar(cr, R0 + 4, a), p2 = polar(cr, R0 + th * 0.8, a); return <path key={k} d={`M${p1[0]} ${p1[1]} L${p2[0]} ${p2[1]}`} stroke="rgba(0,0,0,0.28)" strokeWidth={4} strokeLinecap="round" />; })}
          <path d="M-124 -44 A128 128 0 0 1 124 -44 Q0 -30 -124 -44 Z" style={swFill(c, 1.4)} />
          <path d="M-84 -92 Q-30 -128 40 -112" fill="none" stroke={hl} strokeWidth={13} strokeLinecap="round" />
          <path d="M-126 -44 Q0 -26 126 -44" fill="none" style={{ ...sw(1.5), stroke: BRONZE_D }} />
          {/* brow ridge, nose guard between the eyes, cheek plate with an ear hole and rivets */}
          <path d="M44 -34 L58 -34 L54 18 L48 18 Z" style={swFill(c, 0.8)} />
          <path d="M-124 -44 Q-132 40 -84 82 Q-40 70 -34 -4 Q-36 -40 -40 -44 Z" style={swFill(c, 1.2)} />
          <ellipse cx={-80} cy={14} rx={14} ry={20} fill={BRONZE_D} />
          {[-110, -84, -58].map((rx) => <circle key={rx} cx={rx} cy={-30} r={5.5} fill={hl} />)}
        </g>
      );
    }
    case "turban":
      return (
        <g>
          <path d="M-126 -30 A130 130 0 0 1 126 -30 Q0 -44 -126 -30 Z" style={swFill(c, 1.3)} />
          <path d="M-100 -96 Q0 -66 112 -84 M-122 -62 Q0 -30 124 -58" fill="none" style={{ ...sw(0.8), stroke: "#12324f" }} />
          <ellipse cx={-118} cy={-6} rx={30} ry={50} transform="rotate(14 -118 -6)" style={swFill(c, 1)} />
        </g>
      );
    case "crown":
      return (
        <g>
          <path d="M-126 -30 A130 130 0 0 1 126 -30 Q0 -44 -126 -30 Z" style={swFill(PAL.gold, 1.3)} />
          <path d="M-84 -98 L-70 -262 L70 -262 L84 -98 Z" style={swFill(PAL.gold, 1.3)} />
          <path d="M-76 -150 H76 M-72 -200 H72" fill="none" style={{ ...sw(0.7), stroke: "#b8860b" }} />
          {[-40, 0, 40].map((gx) => <circle key={gx} cx={gx} cy={-226} r={13} style={swFill(PAL.fail, 0.7)} />)}
          <path d="M-70 -262 L-70 -292 L-35 -268 L0 -296 L35 -268 L70 -292 L70 -262 Z" style={swFill(PAL.gold, 1.1)} />
        </g>
      );
    case "hood":
      return (
        <g>
          <path d="M-70 -118 Q-108 -196 -150 -214 Q-60 -222 20 -140 Z" style={swFill(c, 1.3)} />
          <path fillRule="evenodd" d="M0 -148 A148 148 0 1 1 -0.1 -148 Z M44 -92 C112 -92 120 0 106 54 C84 104 28 108 8 66 C -8 22 6 -92 44 -92 Z" style={swFill(c, 1.4)} />
          <path d="M44 -92 C112 -92 120 0 106 54 C84 104 28 108 8 66 C -8 22 6 -92 44 -92 Z" fill="none" stroke="#4b4f57" strokeWidth={12} strokeLinejoin="round" />
          <path d="M-96 -60 Q-70 20 -78 96 M-60 -88 Q-30 -20 -40 70" fill="none" style={{ ...sw(0.6), stroke: "rgba(27,27,47,0.5)" }} />
        </g>
      );
    default:
      return spec.hair ? <Cloud c={[[-86, -78, 40], [-34, -104, 44], [28, -108, 44], [82, -84, 40]]} fill={spec.hair} /> : null;
  }
};

export const Figure: React.FC<FigureProps> = ({ spec, pose, x, y, scale = 1, flip, mood = "calm", look = 0, blink = false, behind }) => {
  const uid = clean(useId()), j = solve(pose), s = scale * spec.size;
  const swU = (STROKE * Math.min(1, Math.max(0.55, s / 0.6))) / Math.max(0.2, s);
  const sway = pose.sway ?? 0, hip = j.hip;
  const w = pose.weaponAngle ?? 0;
  const armW = 27, legW = 34;
  const skirtColor = spec.skirtColor ?? spec.tunic;
  const patId = `pt${uid}`;
  const torsoShape = <ellipse cx={hip[0]} cy={hip[1] - 100} rx={72} ry={118} />;
  const skirtPath = spec.skirt === "robe"
    ? `M${hip[0] - 80} ${hip[1] - 40} L${hip[0] - 104} ${hip[1] + 112} Q${hip[0]} ${hip[1] + 130} ${hip[0] + 104} ${hip[1] + 112} L${hip[0] + 80} ${hip[1] - 40} Z`
    : `M${hip[0] - 76} ${hip[1] - 30} L${hip[0] - 90} ${hip[1] + 58} Q${hip[0]} ${hip[1] + 74} ${hip[0] + 90} ${hip[1] + 58} L${hip[0] + 76} ${hip[1] - 30} Z`;
  const farArm = (
    <g>
      <Limb a={j.shoulderR} b={j.elbowR} c={j.handR} w={armW} c1={spec.tunic} c2={spec.skin} />
      {pose.point && (() => { const dx = j.handR[0] - j.elbowR[0], dy = j.handR[1] - j.elbowR[1], l = Math.hypot(dx, dy) || 1; return <Tube d={`M${j.handR[0]} ${j.handR[1]} L${j.handR[0] + (dx / l) * 52} ${j.handR[1] + (dy / l) * 52}`} w={15} fill={spec.skin} />; })()}
      {pose.point ? <circle cx={j.handR[0]} cy={j.handR[1]} r={19} style={swFill(spec.skin)} /> : <HandBall at={j.handR} skin={spec.skin} />}
    </g>
  );
  const vb = { x: -520, y: -900, w: 1040, h: 960 };
  const headTilt = pose.headTilt ?? 0;
  return (
    <svg width={vb.w * s} height={vb.h * s} viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
      style={{ position: "absolute", left: x + vb.x * s, top: y + vb.y * s, overflow: "visible", ["--sw" as string]: `${swU}px`, transform: flip ? "scaleX(-1)" : undefined, transformOrigin: `${-vb.x * s}px 0` }}>
      {spec.pattern && (
        <defs>
          <pattern id={patId} width={spec.pattern.kind === "diamond" ? 46 : 28} height={spec.pattern.kind === "diamond" ? 46 : 28} patternUnits="userSpaceOnUse">
            {spec.pattern.kind === "diamond" ? <path d="M23 6 L40 23 L23 40 L6 23 Z" fill="none" stroke={spec.pattern.color} strokeWidth={5} /> : <path d="M0 14 H28" stroke={spec.pattern.color} strokeWidth={7} />}
          </pattern>
        </defs>
      )}
      {behind}
      {/* legs: far then near; Greeks bare thighs + greaves, Persians trousers */}
      <Limb a={j.hipR} b={j.kneeR} c={j.footR} w={legW} c1={spec.legColor} c2={spec.greaves ?? spec.legColor} />
      <ellipse cx={j.footR[0] + 12} cy={j.footR[1] + 8} rx={36} ry={17} style={swFill(spec.boots)} />
      <Limb a={j.hipL} b={j.kneeL} c={j.footL} w={legW} c1={spec.legColor} c2={spec.greaves ?? spec.legColor} />
      <ellipse cx={j.footL[0] + 12} cy={j.footL[1] + 8} rx={36} ry={17} style={swFill(spec.boots)} />

      <g transform={`rotate(${j.lean} ${hip[0]} ${hip[1]})`}>
        {spec.cloak && <path d={`M${hip[0] - 4} ${hip[1] - 196} C${hip[0] - 70} ${hip[1] - 190} ${hip[0] - 118 - sway} ${hip[1] - 120} ${hip[0] - 132 - sway} ${hip[1] + 40} L${hip[0] - 120 - sway} ${hip[1] + 104} Q${hip[0] - 60} ${hip[1] + 124} ${hip[0] - 8} ${hip[1] + 92} Z`} style={swFill(spec.cloak, 1.2)} />}
      </g>

      {/* far arm and weapon */}
      {spec.weapon === "spear" && <Spear grip={j.weaponGrip} angle={w} len={470} back={180} shaft={spec.shaft ?? "#8a5a32"} />}
      {spec.weapon === "short_spear" && <Spear grip={j.weaponGrip} angle={w} len={300} back={110} shaft={spec.shaft ?? "#8a5a32"} />}
      {!pose.armFront && farArm}

      <g transform={`rotate(${j.lean} ${hip[0]} ${hip[1]})`}>
        {/* tunic skirt, torso, cuirass */}
        <path d={skirtPath} style={swFill(skirtColor, 1.2)} />
        {spec.pattern && spec.skirt === "robe" && <path d={skirtPath} fill={`url(#${patId})`} />}
        <g style={swFill(spec.tunic, 1.3)}>{torsoShape}</g>
        {spec.pattern && <g fill={`url(#${patId})`}>{torsoShape}</g>}
        {spec.armor && <path d={`M${hip[0] - 62} ${hip[1] - 176} Q${hip[0]} ${hip[1] - 214} ${hip[0] + 62} ${hip[1] - 176} L${hip[0] + 54} ${hip[1] - 70} Q${hip[0]} ${hip[1] - 46} ${hip[0] - 54} ${hip[1] - 70} Z`} style={swFill(spec.armor, 1.1)} />}
        {spec.armor && <path d={`M${hip[0] - 40} ${hip[1] - 150} Q${hip[0]} ${hip[1] - 130} ${hip[0] + 40} ${hip[1] - 150}`} fill="none" style={{ ...sw(0.6), stroke: BRONZE_D }} />}
        <path d={`M${hip[0] - 62} ${hip[1] - 66} Q${hip[0]} ${hip[1] - 38} ${hip[0] + 62} ${hip[1] - 66}`} fill="none" style={{ ...sw(0.7), stroke: INK }} />
        {spec.mantle && <path d={`M${hip[0] - 104} ${hip[1] - 150} Q${hip[0] - 96} ${hip[1] - 232} ${hip[0]} ${hip[1] - 236} Q${hip[0] + 96} ${hip[1] - 232} ${hip[0] + 104} ${hip[1] - 150} Q${hip[0]} ${hip[1] - 120} ${hip[0] - 104} ${hip[1] - 150} Z`} style={swFill(spec.mantle, 1.3)} />}
        {spec.mantle && <path d={`M${hip[0] - 60} ${hip[1] - 150} Q${hip[0] - 52} ${hip[1] - 100} ${hip[0] - 60} ${hip[1] - 60} M${hip[0] + 46} ${hip[1] - 148} Q${hip[0] + 56} ${hip[1] - 100} ${hip[0] + 44} ${hip[1] - 62}`} fill="none" style={{ ...sw(0.6), stroke: "rgba(27,27,47,0.55)" }} />}
        {/* head */}
        <g transform={`translate(${hip[0]} ${hip[1] - BONES.head}) rotate(${headTilt})`}>
          <circle cx={0} cy={0} r={120} style={swFill(spec.skin, 1.3)} />
          {spec.helmet !== "hood" && <Headgear spec={spec} />}
          {spec.helmet === "hood" && <Headgear spec={spec} />}
          {spec.beard && spec.beard.style === "point" && <path d="M14 64 Q22 130 66 158 Q104 128 104 58 Q60 86 14 64 Z" style={swFill(spec.beard.color, 1)} />}
          {spec.beard && spec.beard.style !== "point" && <Cloud c={[[56, 86, 30 * spec.beard.size], [92, 62, 24 * spec.beard.size], [20, 98, 28 * spec.beard.size], [-18, 78, 24 * spec.beard.size]]} fill={spec.beard.color} />}
          <Face mood={mood} look={look} blink={blink} brow={spec.brow ?? INK} skin={spec.skin} id={`fc${uid}`} />
        </g>
      </g>

      {pose.armFront && farArm}
      {/* the torch is held in front of the face, so it is drawn over the head */}
      {spec.weapon === "torch" && <Torch grip={j.weaponGrip} angle={w} />}
      {/* near arm (hand hidden behind the shield) and the shield */}
      <Limb a={j.shoulderL} b={j.elbowL} c={j.handL} w={armW} c1={spec.tunic} c2={spec.skin} />
      <HandBall at={j.handL} skin={spec.skin} />
      {spec.weapon === "bow" && <Bow hand={j.handL} />}
      {spec.shield && <Shield s={spec.shield} at={j.shieldGrip} id={uid} />}
    </svg>
  );
};
