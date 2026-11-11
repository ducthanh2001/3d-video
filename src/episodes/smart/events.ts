// The single source of time for "Work smart, not just hard." (frames at 30 fps). Picture (Film.tsx) and sound
// (audio/make_audio_smart.py) both read it. 94.685 BPM (one beat = 19.01 frames) so the cuts also sit on "FUNK UNIVERSO".
export const FPS = 30;
export const BPM = 94.685;
export const BEAT = 1800 / BPM;
export const Q = {
  S1: 0, // Working Hard / Working Smart: the boulder and the lever
  S2: 171, // Busy / Productive: up a down escalator vs riding the up one
  S3: 342, // Small Brush / Right Tool: painting a wall
  S4: 513, // Rushing / Planning: the maze
  S5: 684, // Push Harder / Start Small: the dominoes
  S6: 855, // the end: both on the lever, the giant rock
  LEN: 1026, // 34.2 s
};
// local cue frames inside each segment
export const C = {
  // 1 · lever: plank down LOWER0-LOWER1, the one-hand press PRESS0-PRESS1, the boulder rolls at ROLL; the pusher sees it at REACT
  LOWER0: 24, LOWER1: 46, PRESS0: 76, PRESS1: 92, ROLL: 95, REACT: 108, HANDS: 122, LINE1A: 128, LINE1B: 140,
  // 2 · escalator: the runner gives up at STOP; the rider reaches the top at ARRIVE; floor sign lights at LIT2
  STOP: 112, ARRIVE: 108, LIT2: 128, LINE2A: 132, LINE2B: 144,
  // 3 · paint: brush dabs every DAB from DAB0 until DAB_STOP; the roller man pours POUR0-POUR1, stands UP, loads the roller DIP0-DIP1, rolls 7 strips from ROLL0, STRIP frames each
  DAB0: 4, DAB: 8, DAB_STOP: 146, POUR0: 4, POUR1: 30, UP: 36, DIP0: 42, DIP1: 56, ROLL0: 58, STRIP: 13, LINE3A: 148, LINE3B: 156,
  // 4 · maze: the plan is drawn PLAN0-PLAN1, the planner walks from GO at STEP frames per cell; the rusher at RSTEP per cell
  PLAN0: 4, PLAN1: 48, GO: 56, STEP: 7, RSTEP: 7, RPAUSE: 12, LINE4A: 138, LINE4B: 150,
  // 5 · dominoes: the last small piece is set at PLACE, the flick at FLICK; the pusher slips at SLIP
  PLACE: 22, FLICK: 82, SLIP: 150, LINE5A: 150, LINE5B: 160,
  // 6 · end: the plank is offered OFFER, set SET0-SET1, the two of them press PRESS0-PRESS1, the rock rolls ROLL, the title TITLE1/TITLE2
  E_WALK1: 30, E_SET0: 38, E_SET1: 60, E_PRESS0: 70, E_PRESS1: 88, E_ROLL: 90, E_TITLE1: 104, E_TITLE2: 118,
};
