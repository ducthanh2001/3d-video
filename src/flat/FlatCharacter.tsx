// Base of every flat character: a round head (40 % of the height), no neck, an egg torso, tube arms with ball hands. A character
// file only supplies a spec (outfit, hair, accessories); pose, expression and lip-sync come in as props. Everything is SVG, so no
// WebGL. Line weight: `--sw` is set from the figure's on-screen scale so the ink stays ~STROKE px at any size.
import React, { useId } from "react";
import { useCurrentFrame } from "remotion";
import { INK, PAL, STROKE } from "./style";
import { EXPRESSIONS, Expr, ExprName, MouthKind } from "./expressions";
import { Held, HandKind, POSES, Pose, PoseName } from "./poses";

/** stroke helpers (CSS, so they follow `--sw`) */
export const sw = (k = 1): React.CSSProperties => ({ strokeWidth: `calc(var(--sw) * ${k})`, stroke: INK, strokeLinejoin: "round", strokeLinecap: "round" });
export const swFill = (fill: string, k = 1): React.CSSProperties => ({ ...sw(k), fill });

/** a union of circles with one outline around the whole shape (hair clouds, mustaches, pom-poms) */
export const Cloud: React.FC<{ c: [number, number, number][]; fill: string }> = ({ c, fill }) => (
  <g>
    <g style={swFill(fill, 2)}>{c.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}</g>
    <g fill={fill}>{c.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}</g>
  </g>
);

/** a tube along a path with a round outline (legs) */
export const Tube: React.FC<{ d: string; w: number; fill: string }> = ({ d, w, fill }) => (
  <g fill="none">
    <path d={d} style={{ stroke: INK, strokeLinecap: "round", strokeWidth: `calc(${w}px + var(--sw) * 2)` }} />
    <path d={d} style={{ stroke: fill, strokeLinecap: "round", strokeWidth: `${w}px` }} />
  </g>
);

export type FlatSpec = {
  skin?: string;
  size: number; // 1 = adult
  headScale?: number;
  headShape?: "round" | "square";
  eyeLid?: number; // resting eyelid droop (tired / gentle eyes)
  browColor?: string;
  mouthY?: number;
  shoulderX: number;
  sleeve: string;
  armW?: number;
  legs: React.ReactNode;
  torso: React.ReactNode; // torso + outfit details + scarf, drawn before the head
  hairBack?: React.ReactNode;
  hairFront?: React.ReactNode;
  faceFront?: React.ReactNode; // glasses, mustache: over the face, under the hair front
  ears?: boolean;
  freckles?: boolean;
};

export type CharProps = {
  /** feet position in frame px */
  x: number;
  y: number;
  /** px per character unit (the adult is 600 units tall: 1 = 600 px tall) */
  scale?: number;
  pose?: PoseName;
  /** a ready-made (blended) pose; wins over `pose` */
  poseObj?: Pose;
  expression?: ExprName;
  /** 0-1, wire it to words.json (open while a word is spoken) */
  mouthOpen?: number;
  flip?: boolean;
  look?: [number, number];
  crop?: "full" | "head";
  /** override the automatic blink */
  blink?: boolean;
};

const clean = (s: string) => s.replace(/[^a-zA-Z0-9]/g, "");

const Hand: React.FC<{ at: [number, number]; dir: [number, number]; kind: HandKind; side: 1 | -1; skin: string }> = ({ at: [x, y], dir: [dx, dy], kind, side, skin }) => {
  const len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
  return (
    <g>
      {kind === "point" && <Tube d={`M${x} ${y} L${x + ux * 44} ${y + uy * 44}`} w={14} fill={skin} />}
      {kind === "finger" && <Tube d={`M${x} ${y - 4} L${x} ${y - 52}`} w={15} fill={skin} />}
      {kind !== "point" && kind !== "finger" && <ellipse cx={x + side * 15} cy={y - 10} rx={8} ry={12} transform={`rotate(${side * 30} ${x + side * 15} ${y - 10})`} style={swFill(skin)} />}
      <circle cx={x} cy={y} r={kind === "open" ? 23 : 19} style={swFill(skin)} />
    </g>
  );
};

const HeldItem: React.FC<{ held: Held; l: [number, number]; r: [number, number] }> = ({ held, l, r }) => {
  const mid: [number, number] = [(l[0] + r[0]) / 2, (l[1] + r[1]) / 2];
  const [x, y] = held.at === "both" ? mid : held.at === "l" ? l : r;
  switch (held.item) {
    case "paper":
      return (
        <g transform={`translate(${x} ${y - 20})`}>
          <rect x={-62} y={-82} width={124} height={158} rx={6} style={swFill(PAL.paper)} />
          {[-52, -30, -8, 14, 36].map((ly) => <line key={ly} x1={-42} y1={ly} x2={42} y2={ly} style={{ ...sw(0.45), stroke: "#b9a98a" }} />)}
        </g>
      );
    case "book":
      return (
        <g transform={`translate(${x} ${y - 16})`}>
          <rect x={-60} y={-56} width={120} height={104} rx={8} style={swFill("#7a4b9c")} />
          <rect x={-48} y={-44} width={96} height={80} rx={4} style={swFill(PAL.paper, 0.6)} />
          <line x1={0} y1={-44} x2={0} y2={36} style={sw(0.6)} />
        </g>
      );
    case "notebook":
      return (
        <g transform={`translate(${x} ${y - 14}) rotate(-8)`}>
          <rect x={-40} y={-56} width={80} height={104} rx={6} style={swFill(PAL.gold)} />
          {[-40, -22, -4, 14, 32].map((ly) => <circle key={ly} cx={-40} cy={ly} r={5} style={swFill(PAL.paper, 0.6)} />)}
          <line x1={-22} y1={-26} x2={26} y2={-26} style={{ ...sw(0.5), stroke: "#8a6a00" }} />
          <line x1={-22} y1={-6} x2={26} y2={-6} style={{ ...sw(0.5), stroke: "#8a6a00" }} />
        </g>
      );
    case "magnifier":
      return (
        <g transform={`translate(${x} ${y})`}>
          <line x1={0} y1={0} x2={44} y2={-60} style={{ ...sw(1.6), strokeWidth: `calc(12px + var(--sw) * 2)` }} />
          <line x1={0} y1={0} x2={44} y2={-60} style={{ stroke: "#9a5a2a", strokeWidth: 12, strokeLinecap: "round" }} />
          <circle cx={74} cy={-102} r={50} style={{ ...sw(1.4), fill: "rgba(160,225,255,0.55)" }} />
          <path d="M44 -112 A32 32 0 0 1 70 -132" style={{ stroke: "#fff", strokeWidth: 7, strokeLinecap: "round", fill: "none" }} />
        </g>
      );
    case "pencil":
      return (
        <g transform={`translate(${x} ${y}) rotate(35)`}>
          <rect x={-8} y={-62} width={16} height={74} rx={3} style={swFill(PAL.gold, 0.7)} />
          <path d="M-8 12 L0 34 L8 12 Z" style={swFill(PAL.skin, 0.7)} />
        </g>
      );
    case "stamp":
      return (
        <g transform={`translate(${x} ${y})`}>
          <rect x={-18} y={-92} width={36} height={58} rx={16} style={swFill("#7a4b2a")} />
          <rect x={-46} y={-40} width={92} height={30} rx={10} style={swFill("#a86b3a")} />
          <rect x={-40} y={-12} width={80} height={14} rx={5} style={swFill(PAL.fail)} />
        </g>
      );
  }
};

const Eye: React.FC<{ cx: number; cy: number; e: Expr; lid: number; look: [number, number]; skin: string; id: string }> = ({ cx, cy, e, lid, look, skin, id }) => {
  const ry = 36 * e.eyeH, rx = 31;
  if (e.closed) return <path d={`M${cx - 26} ${cy + 8} Q${cx} ${cy - 24} ${cx + 26} ${cy + 8}`} fill="none" style={sw(1.2)} />;
  const p = Math.max(0, Math.min(1, lid));
  const lidY = cy - ry + 2 * ry * p;
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} style={swFill(PAL.white)} />
      <clipPath id={id}><ellipse cx={cx} cy={cy} rx={rx} ry={ry} /></clipPath>
      <g clipPath={`url(#${id})`}>
        <circle cx={cx + look[0] * 11} cy={cy + look[1] * 11} r={13 * e.pupil} fill={INK} />
        <circle cx={cx + look[0] * 11 + 4} cy={cy + look[1] * 11 - 5} r={4 * e.pupil} fill="#fff" />
        {p > 0.02 && <rect x={cx - rx - 2} y={cy - ry - 2} width={rx * 2 + 4} height={lidY - (cy - ry) + 2} fill={skin} />}
        {p > 0.02 && <line x1={cx - rx} y1={lidY} x2={cx + rx} y2={lidY} style={sw(0.8)} />}
      </g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" style={sw()} />
    </g>
  );
};

const Mouth: React.FC<{ kind: MouthKind; open: number; y: number; id: string }> = ({ kind, open, y, id }) => {
  if (open > 0.05 && kind !== "bigsmile") {
    const ry = 5 + 28 * open, rx = 20 + 12 * open;
    return (
      <g transform={`translate(0 ${y})`}>
        <ellipse cx={0} cy={ry * 0.4} rx={rx} ry={ry} style={swFill(PAL.dark)} />
        <clipPath id={id}><ellipse cx={0} cy={ry * 0.4} rx={rx} ry={ry} /></clipPath>
        <ellipse cx={0} cy={ry * 1.3} rx={rx * 0.7} ry={ry * 0.5} fill="#e8707a" clipPath={`url(#${id})`} />
      </g>
    );
  }
  const big = kind === "bigsmile";
  const h = big ? 22 + 20 * open : 0;
  return (
    <g transform={`translate(0 ${y})`}>
      {kind === "flat" && <path d="M-30 6 L30 6" fill="none" style={sw(1.1)} />}
      {kind === "smile" && <path d="M-40 -2 Q0 28 40 -2" fill="none" style={sw(1.1)} />}
      {kind === "smirk" && <path d="M-34 8 Q8 14 42 -8" fill="none" style={sw(1.1)} />}
      {kind === "frown" && <path d="M-34 16 Q0 -10 34 16" fill="none" style={sw(1.1)} />}
      {kind === "wobble" && <path d="M-40 8 q10 -12 20 0 t20 0 t20 0 t20 0" fill="none" style={sw(1.1)} />}
      {kind === "o" && <ellipse cx={0} cy={10} rx={15} ry={22} style={swFill(PAL.dark)} />}
      {big && (
        <g>
          <path d={`M-52 -6 L52 -6 Q44 ${h + 12} 0 ${h + 16} Q-44 ${h + 12} -52 -6 Z`} style={swFill(PAL.dark)} />
          <path d="M-48 -4 L48 -4 L46 8 L-46 8 Z" fill="#fff" />
          <ellipse cx={0} cy={h + 8} rx={22} ry={9} fill="#e8707a" />
        </g>
      )}
    </g>
  );
};

export const FlatCharacter: React.FC<{ spec: FlatSpec } & CharProps> = ({ spec, x, y, scale = 1, pose = "idle", poseObj, expression = "neutral", mouthOpen = 0, flip, look, crop = "full", blink }) => {
  const f = useCurrentFrame();
  const uid = clean(useId());
  const e = EXPRESSIONS[expression], po = poseObj ?? POSES[pose];
  const skin = spec.skin ?? PAL.skin;
  const s = scale * spec.size;
  const swUnits = (STROKE * Math.min(1, Math.max(0.55, s / 0.6))) / Math.max(0.25, s); // thinner ink on small figures
  const doBlink = blink ?? f % 110 > 105;
  const lid = doBlink ? 1 : Math.min(0.75, e.lid + (spec.eyeLid ?? 0));
  const lk: [number, number] = look ?? [e.lookX ?? 0, e.lookY ?? 0];
  const bob = Math.sin(f / 14) * 2.5;
  const tilt = (e.tilt ?? 0) + (po.tilt ?? 0);
  const hs = spec.headScale ?? 1, mouthY = spec.mouthY ?? -405;
  const shY = -318, sx = spec.shoulderX, armW = spec.armW ?? 28;

  const arm = (side: 1 | -1) => {
    const [dx, dy] = side === 1 ? po.r : po.l;
    const bend = side === 1 ? po.bendR : po.bendL;
    const S: [number, number] = [side * sx, shY], Hd: [number, number] = [S[0] + dx, S[1] + dy];
    const len = Math.hypot(dx, dy) || 1;
    let nx = -dy / len, ny = dx / len;
    if (side * nx * 0.5 + ny < side * -nx * 0.5 - ny) { nx = -nx; ny = -ny; }
    const cx = (S[0] + Hd[0]) / 2 + nx * bend * 70, cy = (S[1] + Hd[1]) / 2 + ny * bend * 70;
    return { S, Hd, d: `M${S[0]} ${S[1]} Q${cx} ${cy} ${Hd[0]} ${Hd[1]}`, kind: (side === 1 ? po.handR : po.handL) ?? "fist" };
  };
  const aL = arm(-1), aR = arm(1);

  const headPath = spec.headShape === "square"
    ? "M-120 -480 A120 120 0 0 1 120 -480 L120 -412 Q120 -360 76 -360 L-76 -360 Q-120 -360 -120 -412 Z"
    : "M-120 -480 A120 120 0 1 1 120 -480 A120 120 0 1 1 -120 -480 Z";

  const vb = crop === "head" ? { x: -190, y: -720, w: 380, h: 420 } : { x: -300, y: -760, w: 600, h: 800 };

  return (
    <svg
      width={vb.w * s} height={vb.h * s} viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
      style={{ position: "absolute", left: x + vb.x * s, top: y + vb.y * s, overflow: crop === "head" ? "hidden" : "visible", ["--sw" as string]: `${swUnits}px`, transform: flip ? "scaleX(-1)" : undefined, transformOrigin: `${-vb.x * s}px 0` }}
    >
      {spec.legs}
      {spec.torso}
      <g transform={`translate(0 ${bob}) rotate(${tilt} 0 -380) translate(0 -480) scale(${hs}) translate(0 480)`}>
        {spec.ears !== false && [-1, 1].map((sd) => <circle key={sd} cx={sd * 118} cy={-466} r={22} style={swFill(skin)} />)}
        {spec.hairBack}
        <path d={headPath} style={swFill(skin)} />
        {spec.freckles && [[-86, -428], [-68, -418], [-96, -414], [86, -428], [68, -418], [96, -414]].map(([fx, fy], i) => <circle key={i} cx={fx} cy={fy} r={4.5} fill="#c98a5a" />)}
        <Eye cx={-48} cy={-465} e={e} lid={lid} look={lk} skin={skin} id={`eL${uid}`} />
        <Eye cx={48} cy={-465} e={e} lid={lid} look={lk} skin={skin} id={`eR${uid}`} />
        <Mouth kind={e.mouth} open={mouthOpen} y={mouthY} id={`m${uid}`} />
        {spec.faceFront}
        {e.sweat && <path d="M104 -566 Q120 -540 104 -528 Q88 -540 104 -566 Z" style={swFill("#8fd8ff", 0.8)} />}
        {spec.hairFront}
        {/* brows sit over the hair/hat so a raised brow never disappears */}
        <g style={{ ...sw(1.5), stroke: spec.browColor ?? INK }} fill="none">
          <path d="M-72 -516 L-26 -516" transform={`translate(0 ${e.browY}) rotate(${e.browL} -49 -516)`} />
          <path d="M26 -516 L72 -516" transform={`translate(0 ${e.browY}) rotate(${e.browR} 49 -516)`} />
        </g>
      </g>
      {[aL, aR].map((a, i) => (
        <g key={i} fill="none">
          <path d={a.d} style={{ stroke: INK, strokeLinecap: "round", strokeWidth: `calc(${armW}px + var(--sw) * 2)` }} />
          <path d={a.d} style={{ stroke: spec.sleeve, strokeLinecap: "round", strokeWidth: `${armW}px` }} />
        </g>
      ))}
      {po.held && <HeldItem held={po.held} l={aL.Hd} r={aR.Hd} />}
      <Hand at={aL.Hd} dir={[aL.Hd[0] - aL.S[0], aL.Hd[1] - aL.S[1]]} kind={aL.kind} side={-1} skin={skin} />
      <Hand at={aR.Hd} dir={[aR.Hd[0] - aR.S[0], aR.Hd[1] - aR.S[1]]} kind={aR.kind} side={1} skin={skin} />
    </svg>
  );
};
