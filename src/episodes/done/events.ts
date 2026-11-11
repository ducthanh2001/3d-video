// The single source of time for "DO IT UNTIL IT'S DONE." (frames at 30 fps). Picture (Film.tsx) and sound
// (audio/make_audio_done.py) both read it. 94.685 BPM, one beat = 19.01 frames; segments start on beats.
export const FPS = 30;
export const BPM = 94.685;
export const BEAT = 1800 / BPM;
export const beatF = (n: number) => Math.round(n * BEAT);
export const Q = {
  S0: 0, // the knockout (beat 0)
  S1: 133, // ◀◀ 4 years earlier: snooze vs the bag (beat 7)
  S2: 285, // the battlefield (beat 15)
  S3: 456, // the hurdles, a tracking shot (beat 24)
  S4: 722, // the climbing wall (beat 38)
  S5: 875, // the end: the trophy (beat 46)
  LEN: 989, // beat 52 = 33.0 s
};
// cues in FRAMES from the segment start (the audio script reads these too)
export const C = {
  // 0 · the opponent's jab misses (28), the cross lands (65), he hits the canvas (84), the referee waves it off (95)
  KO_JAB: 28, KO_HIT: 65, KO_FALL: 84, KO_REF: 95,
  // 1 · the referee lifts his arm (0 → 18), the trophy goes up (6 → 26), confetti from 20
  LIFT1: 18, CUP: 26,
  // 2 · the alarm rings from 10, his hand slaps it at 58; the bag is hit every 19 frames from 20, 7 punches
  ALARM0: 10, SLAP: 58, PUNCH0: 20, PUNCHD: 19, PUNCHN: 7,
  // 3 · arrows hit his shield at 30 / 70 / 110 / 150; the men behind turn and run at 40 / 62 / 84 / 106 / 128
  HIT1: 30, HIT2: 70, HIT3: 110, HIT4: 150, RUN0: 40, RUND: 22, RUNN: 5,
  // 4 · trips on hurdle 1 at 28, lies still to 62, up by 90; lane 1 stops at 110, lane 2 sits at 190; the dive 236, the tape 244
  H_TRIP: 28, H_UP: 62, H_RUN: 90, Q1: 110, Q2: 190, H_DIVE: 236, H_TAPE: 244,
  // 4 · the tall wall: the other climber stops halfway at 60 (C_SLIP: he gives up), is back on the floor at 125 (C_LAND);
  //     he slaps the TOP hold at 130
  C_SLIP: 60, C_LAND: 125, C_TOP: 130,
  // 6 · the title line at 20
  E_TITLE: 20,
};
