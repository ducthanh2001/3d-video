// The single source of time for "THE MOUNTAIN / THE NEXT STEP" (frames at 30 fps). The sound script parses this table.
// Music: 95 BPM phonk, 1 beat = 18.947 frames, 1 bar = 75.79 frames; 24 bars = 1819 frames (60.6 s).
// DROP1 = bar 8, DROP2 = bar 15.
export const FPS = 30;
export const BPM = 95;
export const BAR = (60 / BPM) * 4 * FPS; // 75.79 frames
export const Q = {
  HOOK: 0, TOP: 100, WHIP: 112, BASE: 132,
  LABELS: 180, NUM1: 300, NUM2: 334, NUM3: 368, SIT: 450,
  STEP0: 300, STEPS_END: 520, DAY1: 540,
  DROP1: 606, INSERT0: 724, INSERT1: 760,
  SLIDE: 870, SLIDE_END: 900, LOOKUP: 990, LOOKDOWN: 1080, STAND: 1100,
  DROP2: 1137, WIDE0: 1250, WIDE1: 1440,
  SUMMIT: 1440, FLAG: 1470,
  PASS: 1620, RING: 1662, ASTAND: 1680, ASTEP: 1712,
  FINAL: 1740, LEN: 1819,
};
