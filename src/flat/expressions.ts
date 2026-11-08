// Face presets of the flat characters. `mouthOpen` (0-1, from words.json) is applied on top of the mouth of the preset.
export type MouthKind = "flat" | "smile" | "bigsmile" | "smirk" | "frown" | "o" | "wobble";
export type ExprName = "neutral" | "curious" | "shock" | "smirk" | "proud" | "sweat" | "deadpan" | "laugh";

export type Expr = {
  browL: number; // degrees, SVG rotation: negative on the left brow = inner end up (worried)
  browR: number;
  browY: number; // vertical shift (negative = raised)
  eyeH: number; // eye height factor
  pupil: number; // pupil size factor
  lid: number; // upper eyelid, fraction of the eye covered (0-1)
  closed?: boolean; // happy squint (^ ^)
  mouth: MouthKind;
  sweat?: boolean;
  lookX?: number; // pupil offset, -1..1
  lookY?: number;
  tilt?: number; // head tilt in degrees
};

export const EXPRESSIONS: Record<ExprName, Expr> = {
  neutral: { browL: 0, browR: 0, browY: 0, eyeH: 1, pupil: 1, lid: 0, mouth: "smile" },
  curious: { browL: -4, browR: 10, browY: -10, eyeH: 1.08, pupil: 1.05, lid: 0, mouth: "o", lookY: -0.5, tilt: 5 },
  shock: { browL: -6, browR: 6, browY: -20, eyeH: 1.22, pupil: 0.6, lid: 0, mouth: "o" },
  smirk: { browL: 10, browR: -12, browY: -2, eyeH: 0.95, pupil: 1, lid: 0.28, mouth: "smirk", lookX: 0.6, tilt: -4 },
  proud: { browL: -4, browR: 4, browY: -8, eyeH: 1, pupil: 1, lid: 0.2, mouth: "bigsmile", tilt: -4, lookY: -0.2 },
  sweat: { browL: -16, browR: 16, browY: -6, eyeH: 1.05, pupil: 0.8, lid: 0, mouth: "wobble", sweat: true, lookX: -0.6 },
  deadpan: { browL: 0, browR: 0, browY: 2, eyeH: 0.95, pupil: 1, lid: 0.5, mouth: "flat" },
  laugh: { browL: -6, browR: 6, browY: -8, eyeH: 1, pupil: 1, lid: 0, closed: true, mouth: "bigsmile", tilt: 4 },
};
