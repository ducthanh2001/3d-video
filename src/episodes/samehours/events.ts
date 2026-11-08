// The single source of time for "SAME HOURS" (frames at 30 fps). Picture (Film.tsx) and sound (audio/make_audio_samehours.py) read it.
// 94.685 BPM (one beat = 19.01 frames), so the cut also sits on "FUNK UNIVERSO (Super Slowed)" if the channel adds it in the Shorts editor:
// start that track at 0:12.67 (its beat 20) and its 808 drop (its beat 32) lands on S2 = our beat 12.
export const FPS = 30;
export const BPM = 94.685;
export const BEAT = 1800 / BPM; // frames per beat
export const beatF = (n: number) => Math.round(n * BEAT);
export const Q = {
  S1: 0, // Scrolling / Building: 21 bricks on half-beats
  S2: 228, // Looking for shortcuts / Making the key (beat 12)
  S3: 418, // Small things first / Big things first (beat 22)
  S4: 608, // Burning 200% / Burning every day (beat 32)
  S5: 798, // Waiting for a bridge / Building one (beat 42)
  LEN: 1027, // beat 54 = 34.2 s
};
// local cue frames inside each segment (frames from the segment start); the audio script reads these too
export const C = {
  // 1 · bricks land every half beat from LAND0, the last one at LAND0 + 20*HALF; the builder reaches the flag at FLAG1
  LAND0: 10, HALF: 9.5, FLAG1: 212, LINE1A: 196, LINE1B: 207,
  // 2 · three keys snap; the made key opens the door
  SNAP1: 38, SNAP2: 86, SNAP3: 133, FILE0: 10, FILE1: 120, UNLOCK: 162, OPEN: 168,
  // 3 · top: sand 6-80, toss GOALS lands 124, FAMILY bounces off 152 · bottom: rocks land 38, 70, 102, sand 108-160, lid 172
  SAND_T0: 6, SAND_T1: 80, ROCK_T1: 124, ROCK_T2: 152, ROCK_B1: 38, ROCK_B2: 70, ROCK_B3: 102, SAND_B0: 108, SAND_B1: 160, LID: 172,
  // 4 · the double-ended candle dies at OUT (DAY 30); the steady one reaches DAY 365 at DAY365
  OUT: 112, DAY365: 175,
  // 5 · planks laid at PLANK0 + i*PLANKD (i = 0..6); camera reveal REVEAL0-REVEAL1; flag at FLAG5; text LINE5A/B
  PLANK0: 60, PLANKD: 12, REVEAL0: 98, REVEAL1: 124, FLAG5: 170, LINE5A: 182, LINE5B: 196,
};
