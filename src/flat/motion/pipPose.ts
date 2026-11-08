// Smooth poses for Pip (the front-facing presenter): FlatCharacter has fixed pose presets, so the scene blends two presets over a few
// frames instead of snapping. Hands/arms interpolate; the held item and hand shape switch at the half-way point.
import { POSES, Pose, PoseName } from "../poses";

const mix = (a: [number, number], b: [number, number], t: number): [number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const eio = (t: number) => { const u = Math.min(1, Math.max(0, t)); return u * u * (3 - 2 * u); };

export const lerpFlatPose = (a: Pose, b: Pose, t: number): Pose => ({
  l: mix(a.l, b.l, t), r: mix(a.r, b.r, t), bendL: a.bendL + (b.bendL - a.bendL) * t, bendR: a.bendR + (b.bendR - a.bendR) * t,
  handL: t < 0.5 ? a.handL : b.handL, handR: t < 0.5 ? a.handR : b.handR, held: t < 0.5 ? a.held : b.held, tilt: (a.tilt ?? 0) + ((b.tilt ?? 0) - (a.tilt ?? 0)) * t,
});

/** keys = [[frame, pose], ...]; each change blends over `blend` frames */
export const pipTrack = (f: number, keys: [number, PoseName][], blend = 7): Pose => {
  let i = 0;
  for (let k = 0; k < keys.length; k++) if (f >= keys[k][0]) i = k;
  const cur = POSES[keys[i][1]];
  if (i === 0) return cur;
  return lerpFlatPose(POSES[keys[i - 1][1]], cur, eio((f - keys[i][0]) / blend));
};
