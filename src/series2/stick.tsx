// Stickman of the "Two Lives, One Clock" series. Same body for Alex and Ben (script rule): round head, tapered black limbs, no face
// (feeling comes from posture and head tilt). Poses are given as WORLD TARGETS (hip, hands, feet) and solved with the same 2-bone IK as
// the rest of the project, so bone lengths never change. Facing right by default; `flip` mirrors the figure. A faint light rim keeps the
// black body readable on dark rooms; a soft contact shadow sits on the floor.
import React from "react";
import { ik2, V } from "../flat/rig/rig";

export const BONE = { head: 27, neck: 14, torso: 118, uArm: 68, fArm: 68, thigh: 94, shin: 94, foot: 24 };
const D = Math.PI / 180;

export type Spec = {
  hip: V;
  torso?: number; // degrees from vertical, + = toward the facing direction (90 = horizontal)
  head?: number; // extra head tilt, degrees (+ = toward the facing direction)
  handN?: V; handF?: V; // near / far hand targets (screen px)
  footN?: V; footF?: V; // near / far foot targets (the ankle)
  flip?: boolean;
  pack?: boolean; // backpack
  armN?: number; armF?: number; // relaxed arm angle (rad from straight down) when there is no target
};
export type Joints = { hip: V; shoulder: V; neck: V; head: V; elbowN: V; wristN: V; elbowF: V; wristF: V; kneeN: V; ankleN: V; toeN: V; kneeF: V; ankleF: V; toeF: V; dir: number; t: number };

export const solve = (s: Spec): Joints => {
  const dir = s.flip ? -1 : 1, t = (s.torso ?? 0) * D, hip = s.hip;
  const shoulder: V = [hip[0] + dir * BONE.torso * Math.sin(t), hip[1] - BONE.torso * Math.cos(t)];
  const ht = t + (s.head ?? 0) * D * 1;
  const neck: V = [shoulder[0] + dir * BONE.neck * Math.sin(ht), shoulder[1] - BONE.neck * Math.cos(ht)];
  const head: V = [neck[0] + dir * BONE.head * Math.sin(ht), neck[1] - BONE.head * Math.cos(ht)];
  const arm = (target: V | undefined, rest: number): [V, V] => {
    if (target) { const r = ik2(shoulder, target, BONE.uArm, BONE.fArm, dir as 1 | -1); return [r.mid, r.end]; }
    const e: V = [shoulder[0] + dir * BONE.uArm * Math.sin(rest), shoulder[1] + BONE.uArm * Math.cos(rest)];
    return [e, [e[0] + dir * BONE.fArm * Math.sin(rest * 0.5), e[1] + BONE.fArm * Math.cos(rest * 0.5)]];
  };
  const leg = (target: V | undefined, off: number): [V, V, V] => {
    const tg: V = target ?? [hip[0] + off * dir, hip[1] + BONE.thigh + BONE.shin - 3];
    const r = ik2(hip, tg, BONE.thigh, BONE.shin, -dir as 1 | -1);
    return [r.mid, r.end, [r.end[0] + dir * BONE.foot, r.end[1] + 2]];
  };
  const [eN, wN] = arm(s.handN, s.armN ?? 0.14), [eF, wF] = arm(s.handF, s.armF ?? -0.1);
  const [kN, aN, tN] = leg(s.footN, 18), [kF, aF, tF] = leg(s.footF, -20);
  return { hip, shoulder, neck, head, elbowN: eN, wristN: wN, elbowF: eF, wristF: wF, kneeN: kN, ankleN: aN, toeN: tN, kneeF: kF, ankleF: aF, toeF: tF, dir, t };
};

const Cap: React.FC<{ a: V; b: V; ra: number; rb: number }> = ({ a, b, ra, rb }) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  const p = [[a[0] + nx * ra, a[1] + ny * ra], [b[0] + nx * rb, b[1] + ny * rb], [b[0] - nx * rb, b[1] - ny * rb], [a[0] - nx * ra, a[1] - ny * ra]];
  return <g><polygon points={p.map((q) => q.join(",")).join(" ")} /><circle cx={a[0]} cy={a[1]} r={ra} /><circle cx={b[0]} cy={b[1]} r={rb} /></g>;
};

const Body: React.FC<{ j: Joints; grow?: number; far?: string; pack?: string }> = ({ j, grow = 0, far, pack }) => {
  const g = grow;
  const farLimb = (children: React.ReactNode) => <g fill={far}>{children}</g>;
  return (
    <g>
      {farLimb(<><Cap a={j.hip} b={j.kneeF} ra={8.5 + g} rb={6.5 + g} /><Cap a={j.kneeF} b={j.ankleF} ra={6.5 + g} rb={5 + g} /><Cap a={j.ankleF} b={j.toeF} ra={4.8 + g} rb={4 + g} /></>)}
      {farLimb(<><Cap a={j.shoulder} b={j.elbowF} ra={6.5 + g} rb={5.2 + g} /><Cap a={j.elbowF} b={j.wristF} ra={5.2 + g} rb={4.4 + g} /></>)}
      {pack && (() => {
        const mid: V = [j.hip[0] + (j.shoulder[0] - j.hip[0]) * 0.62, j.hip[1] + (j.shoulder[1] - j.hip[1]) * 0.62];
        const ang = (Math.atan2(j.shoulder[1] - j.hip[1], j.shoulder[0] - j.hip[0]) * 180) / Math.PI + 90;
        return <g transform={`translate(${mid[0] - j.dir * 24} ${mid[1]}) rotate(${ang})`}><rect x={-23 - g} y={-46 - g} width={46 + 2 * g} height={92 + 2 * g} rx={13} fill={g ? "currentColor" : pack} /></g>;
      })()}
      <Cap a={j.hip} b={j.shoulder} ra={10 + g} rb={8.5 + g} />
      <Cap a={j.shoulder} b={j.neck} ra={4.6 + g} rb={4.2 + g} />
      <circle cx={j.head[0]} cy={j.head[1]} r={BONE.head + g} />
      <Cap a={j.hip} b={j.kneeN} ra={8.5 + g} rb={6.5 + g} /><Cap a={j.kneeN} b={j.ankleN} ra={6.5 + g} rb={5 + g} /><Cap a={j.ankleN} b={j.toeN} ra={4.8 + g} rb={4 + g} />
      <Cap a={j.shoulder} b={j.elbowN} ra={6.5 + g} rb={5.2 + g} /><Cap a={j.elbowN} b={j.wristN} ra={5.2 + g} rb={4.4 + g} />
    </g>
  );
};

// ---------------------------------------------------------------- black-and-white mode
/** MONO = the channel look: the whole world is drawn in dark greys (a CSS grayscale + brightness filter on the "world" pass) and ONLY the stick
 *  figures and the text are drawn bright white on top (the "figs" pass), with a faint reflection on the floor. Set to false for the colour version. */
export const MONO = true;
export const MonoCtx = React.createContext<"all" | "world" | "figs">("all");

/** the frame: world pass (filtered) + figure/text pass (white, unfiltered). Children are rendered twice; Stickman and Overlay decide what shows. */
export const MonoSvg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, filter: MONO ? "grayscale(1) brightness(0.78) contrast(1.12)" : undefined }}>
      <MonoCtx.Provider value={MONO ? "world" : "all"}>{children}</MonoCtx.Provider>
    </svg>
    {MONO && (
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0 }}>
        <defs>
          <linearGradient id="reflGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fff" stopOpacity={0.75} /><stop offset="100%" stopColor="#fff" stopOpacity={0} /></linearGradient>
          <mask id="reflMask" maskUnits="userSpaceOnUse" x={-300} y={1420} width={1700} height={180}><rect x={-300} y={1420} width={1700} height={180} fill="url(#reflGrad)" /></mask>
        </defs>
        <MonoCtx.Provider value="figs"><g visibility="hidden">{children}</g></MonoCtx.Provider>
      </svg>
    )}
  </>
);

/** things that must stay bright in MONO (text, clocks on the divider): hidden in the filtered world pass, shown in the bright pass */
export const Overlay: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pass = React.useContext(MonoCtx);
  if (pass === "world") return null;
  return <g visibility="visible">{children}</g>;
};

/** the stickman: rim light behind (drawn bigger, in the rim colour), then the body. In MONO: white body, dark outline, reflection on the floor. */
export const Stickman: React.FC<{ spec: Spec; color?: string; rim?: string; rimA?: number; pack?: string; shadowY?: number; label?: string }> = ({ spec, color = "#0e0e13", rim, rimA = 0.55, pack, shadowY }) => {
  const pass = React.useContext(MonoCtx);
  if (pass === "world") return null;
  const j = solve(spec);
  const col = MONO ? "#f6f6f6" : color, far = MONO ? "#c8c8c8" : "#1c1c24";
  const pk = spec.pack ? (MONO ? "#a4a4a4" : pack ?? "#47658a") : undefined;
  const low = Math.max(j.toeN[1], j.toeF[1], j.ankleN[1], j.ankleF[1]);
  return (
    <g visibility="visible">
      {MONO && low >= 1405 && (
        <g mask="url(#reflMask)"><g transform="translate(0 2840) scale(1 -1)" opacity={0.5}><g fill={col} color={col}><Body j={j} far={far} pack={pk} /></g></g></g>
      )}
      {shadowY !== undefined && !MONO && <ellipse cx={j.hip[0] + 6} cy={shadowY + 4} rx={92} ry={13} fill="#000" opacity={0.28} />}
      {MONO ? <g fill="#000" color="#000" opacity={0.9}><Body j={j} grow={2.2} far="#000" pack={pk} /></g>
        : rim && <g fill={rim} color={rim} opacity={rimA}><Body j={j} grow={2.6} far={rim} pack={pk} /></g>}
      <g fill={col} color={col}><Body j={j} far={far} pack={pk} /></g>
    </g>
  );
};
