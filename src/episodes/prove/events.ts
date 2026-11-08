// The single source of time for "PROVE IT TO YOURSELF" (frames at 30 fps). Picture (Film.tsx) and sound
// (audio/make_audio_prove.py) both read it. 94.685 BPM, one beat = 19.01 frames. If "FUNK UNIVERSO (Super Slowed)" is added in
// the Shorts editor instead of our score: start it at 0:15.21 (its beat 24) so its 808 drop (its beat 32) lands on our beat 8,
// the moment the 4th rocket lifts off.
export const FPS = 30;
export const BPM = 94.685;
export const BEAT = 1800 / BPM;
export const beatF = (n: number) => Math.round(n * BEAT);
export const Q = {
  S0: 0, // the rockets (hook)
  S1: 209, // the block called YOU (beat 11)
  S2: 399, // the mountain IMPOSSIBLE (beat 21)
  S3: 589, // the hourglass TIME (beat 31)
  S4: 779, // the street lamps (beat 41)
  LEN: 1027, // beat 54 = 34.2 s
};
// beat-local cues (beats from the segment start); the audio script reads these too
export const C = {
  // 0 · launches at beats 0, 2.5, 5 explode 12 frames after ignition; the 4th ignites at 7.5 and is up by 8; text 6 / 9.5
  L1: 0, L2: 2.5, L3: 5, L4: 7.5, LIFT: 8, TXT0A: 6, TXT0B: 9.5,
  // 1 · a hammer blow on every beat 1..9, text 7 / 8.5
  HIT0: 1, HITN: 9, TXT1A: 7, TXT1B: 8.5,
  // 2 · the plunger at 1 (boom 1.2); a pickaxe swing on every beat 1..8, breakthrough at 8; text 5 / 8.5
  BOOM: 1, SWING0: 1, BREAK: 8, TXT2A: 5, TXT2B: 8.5,
  // 3 · the clock hands out three 1h blocks per beat 0..8 (one wastes them, one stacks them), he stands on top at 8.6; text 6.5 / 8.5
  TOP3: 8.6, TXT3A: 6.5, TXT3B: 8.5,
  // 4 · matches fail on 1, 2, 3; the 4th lights at 4, the torch at 4.5; he runs the road lighting 8 posts from 5.2, one every 0.55 beat;
  //     the camera pulls back over the whole lit road 9.4-10.8; text 9.5 / 10.5; title 11.5
  M1: 1, M2: 2, M3: 3, M4: 4, TORCH: 4.5, LAMP0: 5.2, LAMPD: 0.55, LAMPN: 8, PULL0: 9.4, PULL1: 10.8, TXT4A: 9.5, TXT4B: 10.5, TITLE: 11.5,
};
