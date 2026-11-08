// The single source of time for PAYDAY v3.2 (frames at 30 fps), shared with audio/make_audio_payday.py.
// The user adds "FUNK UNIVERSO (Instrumental - Super Slowed)" in the Shorts editor starting at 0:00:
// 94.685 BPM, one beat = 19.01 frames, the 808 drop lands at 20.28 s = frame 608 (DROP).
export const FPS = 30;
export const BEAT = 19.01;
export const Q = {
  // 1 hook: payday, 3 days later, rewind
  PAY: 0, LATER: 40, DRAIN1: 60, WHERE: 62, REWIND: 112, DAY1: 148, TOCORNER: 160,
  // 2 coffee
  CUPS: 180, CUP0: 192, CUPS_END: 296, SUM: 300,
  // 3 closet
  CLOSET: 330, BAGS: 352, SPILL: 380, TAGS: 420,
  // 4 2 AM
  NIGHT: 480, TAP1: 494, TAP2: 512, TAP3: 528, MORNING: 546, BOXES: 552, MINUS: 584,
  // 5 the money pile (two lanes) - the drop
  PILE: 600, DROP: 608, JAR_DONE: 640, PILE_END: 790,
  // 6 the hole in your pocket
  HOLE: 810, STOP: 930, POCKET: 938, TRAIL: 960, TOTAL: 1000,
  // 7 day 30
  DAY30: 1050, MONTHS: 1100, MONTHS_END: 1180, LOOP: 1190,
  LEN: 1230,
};
