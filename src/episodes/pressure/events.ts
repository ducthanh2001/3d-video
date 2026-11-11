// The single source of time for "Pressure makes diamonds." (frames at 30 fps). Picture (Film.tsx) and sound
// (audio/make_audio_pressure.py) both read it. 94.685 BPM (one beat = 19.01 frames).
export const FPS = 30;
export const BPM = 94.685;
export const BEAT = 1800 / BPM;
export const Q = {
  S1: 0, // the penalty: practice, the final, the kick
  S2: 210, // objects: the coal under the press
  S3: 360, // the exam: study, the room, the results
  S4: 540, // objects: the anvil
  S5: 675, // the interview: practice, the real one
  S6: 840, // the end: coal and a diamond in two hands, the title
  LEN: 960, // 32.0 s
};
// local cue frames inside each segment
export const C = {
  // 1 · practice kick at P_KICK1; the final from P_FINAL; the run-up from P_RUN, the kick P_KICK, the ball lands P_IN, GOAL P_GOAL
  P_KICK1: 24, P_FINAL: 78, P_BUBBLE: 88, P_RUN: 150, P_KICK: 168, P_IN: 186, P_GOAL: 190,
  // 2 · the pillow lands C_PILLOW, the blocks drop C_B1..C_B3, the press lifts C_LIFT0..C_LIFT1
  C_PILLOW: 18, C_B1: 20, C_B2: 36, C_B3: 52, C_LIFT0: 96, C_LIFT1: 116,
  // 3 · study until X_EXAM, the exam until X_RESULT, the grade pops at X_POP
  X_EXAM: 52, X_BUBBLE: 72, X_RESULT: 126, X_POP: 140,
  // 4 · the hammer strikes every F_HIT frames from F_HIT0 until F_LATER, then the reveal
  F_HIT0: 6, F_HIT: 8, F_LATER: 88,
  // 5 · practice until I_REAL, "Um..." at I_UM, the stamp at I_STAMP
  I_REAL: 72, I_UM: 90, I_STAMP: 124,
  // 6 · the two lines of the title
  E_T1: 22, E_T2: 44,
};
