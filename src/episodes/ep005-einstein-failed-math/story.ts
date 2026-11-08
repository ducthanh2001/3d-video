// Timeline of "Einstein Failed Math? Real or Myth?" (ep005). Frames at 30 fps. Cue = word onset x 30 - 2 (the picture reacts a
// hair before the word). Sentence starts (L*) come from the real speech onset in voice/ep005/voice.wav, words from words.json.
// The audio script (audio/make_audio_ep005.py) reads the Q table below, so re-timing the picture re-times the sound.
import { MeterKey } from "../../flat/ui/MythMeter";

export const Q = {
  L1: 0, L2: 62, L3: 112, myth: 129, L4: 169, L5: 225, clue1: 231, twelve: 253, L6: 354, calculus: 401,
  L7: 459, wait: 461, L8: 537, eth: 625, L9: 692, stamp: 702, L10: 745, general: 815, section: 821,
  L11: 860, math: 863, physics: 876, distinction: 898, L12: 943, L13: 1026, patent: 1055, four: 1077, papers: 1083,
  L14: 1157, mythStamp: 1173, L15: 1251, one: 1260, L16: 1330, subscribe: 1392, LOOP: 1428, END: 1452,
};
export const TOTAL = Q.END;

export const METER_KEYS: MeterKey[] = [
  { f: Q.calculus, value: 0.3 },
  { f: Q.L7, value: 0 }, // the re-hook snaps the needle back to REAL
  { f: Q.distinction, value: 0.65 },
  { f: Q.papers, value: 0.9 },
  { f: Q.mythStamp, value: 1 },
];
export const METER_SNAP = [Q.L7];

/** CLUE n/3 and the frame it last changed */
export const clueAt = (f: number): { n: number; at: number } => {
  if (f >= Q.four) return { n: 3, at: Q.four };
  if (f >= Q.section) return { n: 2, at: Q.section };
  if (f >= Q.clue1) return { n: 1, at: Q.clue1 };
  return { n: 0, at: Q.L4 + 8 };
};

/** whole-frame shakes: the stamps (7 frames) and the re-hook */
export const SHAKES = [0, Q.L7, Q.stamp, Q.mythStamp];
