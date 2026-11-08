// The single source of time for "TRUST THE PROCESS" — "You're closer than you think. Don't quit." (frames at 30 fps).
// Picture (Film.tsx) and sound (audio/make_audio_trust.py) both read it. 94.685 BPM, one beat = 19.01 frames.
export const FPS = 30;
export const BPM = 94.685;
export const BEAT = 1800 / BPM;
export const beatF = (n: number) => Math.round(n * BEAT);
export const Q = {
  S0: 0, // the ridge at night, 100 climbers (hook) (beat 0)
  S1: 124, // three of them sit down: "Why do people quit?" (beat 6.5)
  S2: 190, // #1 it gets heavy: three cars on the hill (beat 10)
  S3: 399, // #2 they stop acting: two campfires (beat 21)
  S4: 589, // #3 they quit too early: the 10th swing (beat 31)
  S5: 817, // the last stretch in the storm: two more sit down, he passes them (beat 43)
  S6: 1008, // dawn on the same ridge, 1 out of 100 (beat 53)
  LEN: 1217, // beat 64 = 40.6 s
};
// beat-local cues (beats from the segment start); the audio script reads these too
export const C = {
  // 0 · the camera starts on him hauling the rope and pulls back over the whole ridge 0 → 3; text 2 / 3.5
  PULL0: 0, PULL1: 3, TXT0A: 2, TXT0B: 3.5,
  // 1 · three climbers sit down at 0.4 / 1.0 / 1.6 (100 → 97); text 0.2 / 1.8
  SIT0: 0.4, SITD: 0.6, TXT1A: 0.2, TXT1B: 1.8,
  // 2 · all three push from 0; row 1 lets go at 4, row 2 at 6.5 (cars roll back 2.5 beats); row 3 tops the crest at 6.8; text 8 / 9.5
  R1: 4, R2: 6.5, ROLL: 2.5, CREST3: 6.8, TXT2A: 8, TXT2B: 9.5,
  // 3 · the top fire dies 0 → 6; a log goes on the bottom fire at 1.5, 3.5, 5.5, 7.5; text 7 / 8.5
  DIE: 6, LOG0: 1.5, LOGD: 2, LOGN: 4, TXT3A: 7, TXT3B: 8.5,
  // 4 · an axe stroke lands on every beat 0.5 … 8.5 (1 … 9) in both rows; top drops the axe at 8.9; bottom's 10th lands at 9.5,
  //     the tree falls 9.5 → 10.7; text 10 / 10.8
  HIT0: 0.5, QUIT: 8.9, TENTH: 9.5, FALLEND: 10.7, TXT4A: 10, TXT4B: 10.8,
  // 5 · storm on the upper ridge; the camera follows him up the fixed rope past three climbers: each says a line (SAYk) and sits
  //     down (SITk): 4 → 3 → 2 → 1; text 6.5 / 7.8
  SAY1: 0.5, SIT1: 1.5, SAY2: 2.5, SIT2: 3.5, SAY3: 4.5, SIT3: 5.5, TXT5A: 6.5, TXT5B: 7.8,
  // 6 · sunrise: the camera starts on him waving the flag and pulls back over the whole ridge 0 → 3.5; text 3.5 / 5; title 8
  PULL6: 3.5, TXT6A: 3.5, TXT6B: 5, TITLE: 8,
};
