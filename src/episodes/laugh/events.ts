// The single source of time for "LET THEM LAUGH" (frames at 30 fps). Picture (Film.tsx) and sound (audio/make_audio_laugh.py) read it.
// 94.685 BPM (one beat = 19.01 frames) so every action sits on the beat, and the film also sits on "FUNK UNIVERSO (Super Slowed)"
// if it is added in the Shorts editor: start that track at 0:15.84 (its beat 25) and its 808 drop (its beat 32) lands on S1 = our beat 7.
export const FPS = 30;
export const BPM = 94.685;
export const BEAT = 1800 / BPM; // frames per beat
export const beatF = (n: number) => Math.round(n * BEAT);
export const Q = {
  S0: 0, // the first stroke (hook, open loop)
  S1: 133, // the castle (beat 7)
  S2: 323, // the skate ramp (beat 17)
  S3: 494, // the food cart (beat 26)
  S4: 665, // the backpack (beat 35)
  S5: 836, // the mural (beat 44)
  LEN: 1065, // beat 56 = 35.5 s
};
// beat-local cues (in beats from the segment start); the audio script reads these too
export const C = {
  // 0 · stroke part 1 from 0.2 to 1.6, gap, part 2 from 1.9 to 2.9, the half circle 3.2-4.0, laughs 3, 4, 5, 5.5, text 5.5
  ST1A: 0.2, ST1B: 1.6, ST2A: 1.9, ST2B: 2.9, ARCA: 3.2, ARCB: 4.0, LAUGH1: 3, LAUGH2: 4, LAUGH3: 5, LAUGH4: 5.5, TXT0: 5.5,
  // 1 · a stone caught on every beat 1..9 (the 9th is FAILURE), the flag at 9.4, text 8 / 9
  CATCH0: 1, CATCHN: 9, FLAG1: 9.4, TXT1A: 8, TXT1B: 9,
  // 2 · three falls start on beats 0, 2, 4; the run that works starts on beat 6, take-off 6.9, silence 7, "wait WHAT" 7.6
  FALL1: 0, FALL2: 2, FALL3: 4, GO: 6, AIR: 6.9, HUSH: 7, WOW: 7.6, TXT2A: 5, TXT2B: 7.8,
  // 3 · a customer arrives on beats 1.5..6.5, the sign lights at 4, "one more pls" at 7.2, text 6 / 7.6
  CUST0: 1.5, OPEN3: 4, MORE: 7.2, TXT3A: 6, TXT3B: 7.6,
  // 4 · a sheet stuffed in on beats 1..5, the drop at 5.6, he runs from 6.5, text 3 / 6.6
  SHEET0: 1, DROP: 5.6, RUN: 6.5, TXT4A: 3, TXT4B: 6.6,
  // 5 · the painting fills in on beats 0..6, the camera pulls back 6-8, phones up 8, the circle 9, text 10 / 10.8
  PULL0: 6, PULL1: 8, PHONES: 8, RING: 9, TXT5A: 10, TXT5B: 10.8,
};
