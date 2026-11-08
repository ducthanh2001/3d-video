// Dynamic camera for the kit. The camera looks at a WORLD point (x, y) that lands on the frame centre, with zoom z and roll r.
// Keys are eased like the channel's moves (default "burst": the fastest frame is the first one, then it settles), shakes decay,
// and motion blur is computed from the camera's own speed between frame f-1 and f, so a whip pan smears by itself.
//
//   <Cam f={f} keys={[{f:0,x:540,y:960},{f:40,x:900,y:700,z:1.6,e:"burst"}]} kicks={[{f:52,amp:18}]}>
//     <Parallax d={0.3}>far hills</Parallax>   (moves at 30 % of the camera)
//     the world in world px
//   </Cam>
import React from "react";
import { AbsoluteFill } from "remotion";
import { EaseName, Key, V, clamp, ease, noise1, track } from "./core";

export type CamKey = { f: number; x: number; y: number; z?: number; r?: number; e?: EaseName };
export type CamState = { x: number; y: number; z: number; r: number };
export type Kick = { f: number; amp: number; dur?: number; rot?: number };

export const camAt = (f: number, keys: CamKey[]): CamState => {
  const k = (sel: (c: CamKey) => number): Key<number>[] => keys.map((c) => ({ f: c.f, v: sel(c), e: c.e ?? "burst" }));
  return { x: track(f, k((c) => c.x)), y: track(f, k((c) => c.y)), z: track(f, k((c) => c.z ?? 1)), r: track(f, k((c) => c.r ?? 0)) };
};

/** decaying shake offset (px) and roll (deg) from impact kicks */
export const shakeAt = (f: number, kicks: Kick[] = []) => {
  let dx = 0, dy = 0, dr = 0;
  for (const k of kicks) {
    const t = f - k.f, dur = k.dur ?? 14;
    if (t < 0 || t > dur) continue;
    const a = k.amp * Math.pow(1 - t / dur, 2);
    dx += noise1(t * 1.7, k.f) * a; dy += noise1(t * 1.9, k.f + 7) * a; dr += noise1(t * 1.3, k.f + 3) * (k.rot ?? k.amp * 0.08) * (1 - t / dur);
  }
  return { dx, dy, dr };
};

/** a gentle hand-held drift (px) for holds, so the frame is never dead still */
export const drift = (f: number, amp = 4, seed = 1): V => [noise1(f * 0.015, seed) * amp, noise1(f * 0.013, seed + 5) * amp];

type Ctx = { cam: CamState; f: number };
const CamCtx = React.createContext<Ctx>({ cam: { x: 540, y: 960, z: 1, r: 0 }, f: 0 });
export const useCam = () => React.useContext(CamCtx);

const camTransform = (c: CamState, sh = { dx: 0, dy: 0, dr: 0 }) =>
  `translate(${540 + sh.dx} ${960 + sh.dy}) rotate(${c.r + sh.dr}) scale(${c.z}) translate(${-c.x} ${-c.y})`;

export const Cam: React.FC<{
  f: number; keys: CamKey[]; kicks?: Kick[]; blur?: number; drift?: number; children: React.ReactNode; maxBlur?: number;
  /** override the solved state (for custom paths, e.g. following an object) */
  state?: (f: number) => CamState;
}> = ({ f, keys, kicks, blur = 0.5, drift: dr = 0, children, state, maxBlur = 26 }) => {
  const id = React.useId().replace(/:/g, "");
  const at = state ?? ((t: number) => camAt(t, keys));
  const c0 = at(f), c1 = at(f - 1);
  const d = dr ? drift(f, dr) : [0, 0];
  const cam = { ...c0, x: c0.x + d[0], y: c0.y + d[1] };
  const sh = shakeAt(f, kicks);
  // screen-space speed of the frame centre (pan) and of the frame corners (zoom)
  const vx = Math.abs((c0.x - c1.x) * c0.z), vy = Math.abs((c0.y - c1.y) * c0.z), vz = Math.abs(c0.z - c1.z) / Math.max(0.05, c0.z) * 260;
  const bx = blur * (vx + vz * 0.5), by = blur * (vy + vz * 0.8);
  const useBlur = bx > 0.8 || by > 0.8;
  return (
    <CamCtx.Provider value={{ cam, f }}>
      {useBlur && <defs><filter id={`${id}mb`} x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation={`${Math.min(maxBlur, bx).toFixed(2)} ${Math.min(maxBlur, by).toFixed(2)}`} /></filter></defs>}
      <g filter={useBlur ? `url(#${id}mb)` : undefined}>
        <g transform={camTransform(cam, sh)}>{children}</g>
      </g>
    </CamCtx.Provider>
  );
};

/** inside <Cam>: content that moves at a fraction d of the camera (0 = glued to the screen like a sky, 1 = normal world).
 *  `anchor` is the world point where the layer lines up with the world (default: the first camera key's target). */
export const Parallax: React.FC<{ d: number; anchor?: V; children: React.ReactNode }> = ({ d, anchor = [540, 960], children }) => {
  const { cam } = useCam();
  const sEff = 1 + (cam.z - 1) * d, sc = sEff / cam.z;
  const tx = (cam.x - anchor[0]) * (1 - d), ty = (cam.y - anchor[1]) * (1 - d);
  return <g transform={`translate(${cam.x} ${cam.y}) scale(${sc}) translate(${-cam.x} ${-cam.y}) translate(${tx} ${ty})`}>{children}</g>;
};

/** inside <Cam>: something glued to the screen (titles that must not move): undoes the camera transform */
export const Screen: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { cam } = useCam();
  return <g transform={`translate(${cam.x} ${cam.y}) scale(${1 / cam.z}) rotate(${-cam.r}) translate(-540 -960)`}>{children}</g>;
};

// ---------------------------------------------------------------- key recipes
/** push into a point until it fills the frame (then cut to the next scene at f0 + dur) */
export const zoomInto = (f0: number, dur: number, from: CamKey, target: V, zEnd = 28): CamKey[] => [
  { ...from, f: f0 },
  { f: f0 + dur, x: target[0], y: target[1], z: zEnd, r: from.r ?? 0, e: "in" },
];
/** fast whip from one framing to another: a short in-out move; the speed blur does the rest */
export const whip = (f0: number, dur: number, a: CamKey, b: Omit<CamKey, "f">): CamKey[] => [{ ...a, f: f0 }, { ...b, f: f0 + dur, e: "inOut" }];
/** follow a moving world point (an object path) with a little lag */
export const follow = (path: (f: number) => V, z = 1, lag = 4, offset: V = [0, 0]) => (f: number): CamState => {
  const p = path(f - lag);
  return { x: p[0] + offset[0], y: p[1] + offset[1], z, r: 0 };
};

// ---------------------------------------------------------------- screen transitions (draw on top of everything, in screen px)
/** white flash: 1 frame full, fades over `dur` */
export const Flash: React.FC<{ f: number; at: number; dur?: number; color?: string }> = ({ f, at, dur = 6, color = "#fff" }) => {
  const t = f - at; if (t < 0 || t > dur) return null;
  return <rect x={0} y={0} width={1080} height={1920} fill={color} opacity={Math.pow(1 - t / dur, 1.6)} />;
};
/** fade through black */
export const Dip: React.FC<{ f: number; at: number; dur?: number; color?: string }> = ({ f, at, dur = 12, color = "#000" }) => {
  const t = (f - at) / dur; if (t < -1 || t > 1) return null;
  return <rect x={0} y={0} width={1080} height={1920} fill={color} opacity={1 - Math.abs(t)} />;
};
/** crossfade between two scenes (HTML layers, so each scene can be its own <svg>) */
export const XFade: React.FC<{ f: number; at: number; dur?: number; a: React.ReactNode; b: React.ReactNode }> = ({ f, at, dur = 8, a, b }) => {
  const t = clamp((f - at) / dur);
  return (
    <>
      {t < 1 && <AbsoluteFill style={{ opacity: 1 }}>{a}</AbsoluteFill>}
      {t > 0 && <AbsoluteFill style={{ opacity: ease.inOut(t) }}>{b}</AbsoluteFill>}
    </>
  );
};
/** map frame f to the scene time while a rewind runs from `at` for `dur` frames at `speed`x backwards */
export const rewindTime = (f: number, at: number, dur: number, speed = 4) => (f < at ? f : f < at + dur ? at - (f - at) * speed : at - dur * speed + (f - at - dur));
/** the VHS rewind look: icon, tracking bands, scan lines, slight cold tint */
export const RewindFx: React.FC<{ f: number; at: number; dur: number }> = ({ f, at, dur }) => {
  const t = f - at; if (t < 0 || t > dur) return null;
  const band = (k: number) => ((t * 37 + k * 613) % 2200) - 140;
  return (
    <g>
      <rect x={0} y={0} width={1080} height={1920} fill="#7fb0ff" opacity={0.08} style={{ mixBlendMode: "screen" }} />
      {Array.from({ length: 96 }, (_, i) => <rect key={i} x={0} y={i * 20} width={1080} height={2} fill="#000" opacity={0.16} />)}
      {[0, 1].map((k) => <rect key={k} x={0} y={band(k)} width={1080} height={18 + k * 10} fill="#fff" opacity={0.12} />)}
      <g transform="translate(70 120)" opacity={0.5 + 0.5 * Math.round((t / 8) % 1 + 0.2)}>
        <path d="M44 0 L0 24 L44 48 Z M92 0 L48 24 L92 48 Z" fill="#fff" />
      </g>
    </g>
  );
};
