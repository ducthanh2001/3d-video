// THE ONE place where time lives for the Thermopylae episode (30 fps). Every beat is an event at a frame; picture (clips, sparks, shake,
// meter, chips), sound (audio/make_audio_ep007.py reads this table and writes sfx-cues.json) and captions all read the SAME frame.
// Nothing else in the episode may compute its own timing.
// Frames = real word onset in voice/ep007/voice.wav x 30 - 2 (the picture leads the word by 2 frames). Sentence starts (L*) use the
// first audible sample. The script's table has the same events 1-2 s earlier because its line 3 (17 words) cannot be spoken in 4.5 s:
// the events keep the script's ORDER and wording, only their clock follows the real voice (see the audit in the final report).
import { MeterKey } from "../../flat/ui/MythMeter";

export const Q = {
  // script beat names (the ones PROMPT-thermopylae-characters-and-action.md asks for)
  reveal: 0, meter_on: 84, count_p: 227, count_g: 380, rehook: 435, thrust_1: 551, thrust_2: 570,
  point: 716, night: 746, surprise: 820, wave_off: 883, stand: 933, stamp: 1013,
  // extra beats the picture and sound need
  million: 39, herodotus: 163, clue1: 141, clue2: 324, not300: 359, subscribe: 1210,
  // sentence starts = scene cuts
  L1: 0, L2: 84, L3: 138, L4: 324, L5: 431, L6: 499, L7: 606, L8: 654, L9: 746, L10: 870, L11: 998, L12: 1054, L13: 1149,
  LOOP: 1252, END: 1282,
};
export const TOTAL = Q.END;

/** the needle: 25 % at count_p, 60 % at count_g, back to REAL at the re-hook, 75 % at the Ephialtes line, 85 % at the stamp */
export const METER_KEYS: MeterKey[] = [
  { f: Q.count_p, value: 0.25 }, { f: Q.count_g, value: 0.6 }, { f: Q.rehook, value: 0 }, { f: Q.L8, value: 0.75 }, { f: Q.stamp, value: 0.85 },
];
export const METER_SNAP = [Q.rehook];

export const clueAt = (f: number): { n: number; at: number } =>
  f >= Q.L8 ? { n: 3, at: Q.L8 } : f >= Q.clue2 ? { n: 2, at: Q.clue2 } : f >= Q.clue1 ? { n: 1, at: Q.clue1 } : { n: 0, at: Q.L2 + 6 };

/** camera shake: 7 frames, flips sign every frame, decays. The shield lock and the stamp hit hardest, the spear hits lightly. */
const SHAKES: [number, number][] = [[Q.rehook, 1], [Q.thrust_1, 0.45], [Q.thrust_2, 0.45], [Q.stamp, 1]];
export const shakeAt = (f: number): { dx: number; dy: number } => {
  let dx = 0, dy = 0;
  for (const [c, amp] of SHAKES) {
    const u = f - c;
    if (u >= 0 && u < 7) { const k = (1 - u / 7) * amp, s = u % 2 ? 1 : -1; dx += s * 15 * k; dy += -s * 11 * k; }
  }
  return { dx, dy };
};

/** every event in time order (used by the audit and the sound script) */
export const EVENT_NAMES = (Object.keys(Q) as (keyof typeof Q)[]).filter((k) => !/^L\d+$/.test(k) && k !== "END" && k !== "LOOP").sort((a, b) => Q[a] - Q[b]);
