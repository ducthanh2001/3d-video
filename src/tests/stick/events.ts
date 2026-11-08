// Stick-figure walk / stumble test (180 frames, 30 fps). THE one place where time lives: every foot contact is an event (frame, foot,
// world x, tile). The same event drives the lit tile, the light ring, the dust puff, the camera shake and the sound cue; nothing else
// computes its own timing. World x is in px (tile n sits at x = 150 n); frames are 30 fps.
export type Foot = "L" | "R";
export type Contact = { n: number; f: number; foot: Foot; x: number; tile: number; note: string };

export const FRAMES = 180;
export const TILE_W = 110, TILE_STEP = 150;
export const FLOOR_Y = 1320; // screen y of the floor line
export const SCREEN_X = 380; // where the figure stands on screen (the camera follows the hip)

/** the table of the prompt (step 5). The 5th contact is the trip: the toe catches the edge of tile 5 (x 695..805) and stops at 705. */
export const CONTACTS: Contact[] = [
  { n: 1, f: 12, foot: "L", x: 150, tile: 1, note: "normal step" },
  { n: 2, f: 27, foot: "R", x: 300, tile: 2, note: "" },
  { n: 3, f: 42, foot: "L", x: 450, tile: 3, note: "" },
  { n: 4, f: 57, foot: "R", x: 600, tile: 4, note: "" },
  { n: 5, f: 72, foot: "L", x: 705, tile: 5, note: "TRIP: toe catches the edge of tile 5" },
  { n: 6, f: 86, foot: "R", x: 900, tile: 6, note: "catch-balance step, ~300 px, knee bent, hip low" },
  { n: 7, f: 111, foot: "L", x: 1050, tile: 7, note: "walking on" },
  { n: 8, f: 126, foot: "R", x: 1200, tile: 8, note: "" },
  { n: 9, f: 141, foot: "L", x: 1350, tile: 9, note: "" },
  { n: 10, f: 156, foot: "R", x: 1500, tile: 10, note: "door slit starts to glow" },
  { n: 11, f: 171, foot: "L", x: 1650, tile: 11, note: "at the door: it opens, stands still until frame 180" },
];
/** contacts before the clip, so frame 0 is already mid-stride: the right foot is planted at x = 0, the left foot is swinging */
export const VIRTUAL: Contact[] = [
  { n: -1, f: -18, foot: "L", x: -150, tile: -1, note: "virtual" },
  { n: 0, f: -3, foot: "R", x: 0, tile: 0, note: "virtual: right foot planted at x = 0 at frame 0" },
];

/** frame at which a planted foot leaves the ground = the opposite foot's next contact + 2 (a short double support).
 *  The trapped left foot (contact 5) is freed later: it only leaves at frame 97, when the balance has been found. */
export const LIFT_OVERRIDE: Record<number, number> = { 5: 97 };
/** swing style of the step that ARRIVES at contact n: peak foot height (px) and an optional braking ease */
export const SWING: Record<number, { peak: number; brake?: boolean }> = { 5: { peak: 12, brake: true }, 6: { peak: 52 }, 7: { peak: 46 } };

/** camera shake: [frame, amplitude px]; 7 frames, flips sign every frame, decays */
export const SHAKES: [number, number][] = [[72, 6], [86, 10]];

export const DOOR_X = 1735; // the door stands just beyond tile 11 (tile 11 spans 1595..1705)
export const DOOR_SLIT_FROM = 156, DOOR_OPEN_FROM = 162, DOOR_OPEN_TO = 176;

const sm = (x: number) => { const t = Math.min(1, Math.max(0, x)); return t * t * (3 - 2 * t); };

/** glow of tile n at frame f (0..1): 15 % and 40 % ahead of the foot (they start 6 frames before the contact that makes them "next"),
 *  100 % at the contact that lands on it, then it settles to a 45 % trace so the path stays readable. */
export const tileGlow = (n: number, f: number): number => {
  const all = [...VIRTUAL, ...CONTACTS], by = (t: number) => all.find((q) => q.tile === t);
  const c = by(n), p1 = by(n - 1), p2 = by(n - 2);
  let g = 0;
  if (p2) g = Math.max(g, 0.15 * sm((f - (p2.f - 6)) / 6)); // two steps ahead of the foot
  if (p1) g = Math.max(g, 0.4 * sm((f - (p1.f - 6)) / 6)); // one step ahead
  if (c && f >= c.f) { const t = f - c.f; g = Math.max(g, 0.45 + 0.55 * Math.exp(-t / 7), t < 3 ? 1 : 0); }
  return Math.min(1, g);
};

/** the light ring that spreads from a tile for 8 frames after a contact: progress 0..1 or -1 when none */
export const ringAt = (tile: number, f: number): number => {
  const c = CONTACTS.find((q) => q.tile === tile);
  if (!c || f < c.f || f >= c.f + 8) return -1;
  return (f - c.f) / 8;
};

/** the sound cues of the clip (written to sfx-cues.json by check-motion.ts): one per contact + the stumble thumps + the door */
export const sfxCues = () => [
  ...CONTACTS.map((c) => ({ frame: c.f, seconds: +(c.f / 30).toFixed(3), sfx: c.n === 5 ? "toe catch (scuff + thud)" : c.n === 6 ? "heavy catch step" : "soft footstep", foot: c.foot, tile: c.tile })),
  { frame: 75, seconds: 2.5, sfx: "breath in (gasp)", foot: "-", tile: 0 },
  { frame: 156, seconds: 5.2, sfx: "door slit hum starts", foot: "-", tile: 11 },
  { frame: 171, seconds: 5.7, sfx: "door opens: warm swell", foot: "-", tile: 11 },
].sort((a, b) => a.frame - b.frame);
