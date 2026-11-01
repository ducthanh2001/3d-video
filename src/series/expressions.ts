// Acting meanings -> the faces the engine can draw (Expr in engine/toon.ts). Scripts say "confused", the drawing says "nervous".
import type { Expr } from "../engine/toon";

export type Act =
  | "confused" | "shocked" | "smug" | "laughing" | "relieved" | "dizzy" | "hurt" | "fakeCalm"
  | "deadpan" | "whistling" | "grumpy" | "happy" | "tasting";

export const ACT: Record<Act, Expr> = {
  confused: "nervous", // hoang mang (a sweat drop shows)
  shocked: "shock", // bị sốc
  smug: "grin", // đắc ý
  laughing: "laugh", // bật cười
  relieved: "relief", // nhẹ nhõm
  dizzy: "dazed", // choáng (spiral eyes)
  hurt: "pained", // đau
  fakeCalm: "smile_closed", // bình thản giả vờ
  deadpan: "neutral",
  whistling: "whistle",
  grumpy: "stern",
  happy: "smile",
  tasting: "lick",
};

/** the six faces shown on the character sheet */
export const SHEET_ACTS: Act[] = ["confused", "shocked", "smug", "laughing", "relieved", "fakeCalm"];

/** acting we will probably want and the engine cannot draw yet (not added: ask before extending toon.ts) */
export const MISSING: { act: string; wanted_for: string }[] = [
  { act: "screaming (mouth wide, eyes shut)", wanted_for: "chases, bees, anything medieval and on fire" },
  { act: "disgust", wanted_for: "period food and toilets" },
  { act: "crying / tearful", wanted_for: "the sad-beat before a twist" },
  { act: "sleeping", wanted_for: "waking up in the wrong century" },
  { act: "determined / angry", wanted_for: "a stern brow with a clenched grin; `grumpy` (stern) is the nearest" },
];
