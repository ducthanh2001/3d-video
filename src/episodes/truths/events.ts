// The single source of time for "SMALL TRUTHS" (frames at 30 fps). Picture (Film.tsx) and sound (audio/make_audio_truths.py) read it.
// Music: 94.685 BPM (measured), one beat = 19.010 frames; every segment is 12 beats. Frames below are round(beat * 1800 / BPM).
// SYNC: in the YouTube Shorts editor add "FUNK UNIVERSO (Instrumental - Super Slowed)" starting at 0:05.07 (its beat 8):
// its 808 drop (its beat 32, 20.28 s) then lands on DROP1 = the start of segment 3 (our beat 24).
export const FPS = 30;
export const BPM = 94.685; // measured tempo of the soundtrack (FUNK UNIVERSO super slowed); see SYNC note
export const beatF = (n: number) => Math.round((n * 1800) / BPM);
export const Q = {
  S1: 0, COUNT0: 10, COUNT1: 169, MULT: 172,
  S2: 228, CUT1: 285, CUT2: 342, CUT3: 399,
  S3: 457, BOLT1: 514, BOLT2: 609, SUMMIT: 647,
  S4: 684, CRACK: 856, SPLIT: 875,
  S5: 912, GRAB1: 950, GRAB2: 1007, GRAB3: 1065, ESCAPE: 1102,
  S6: 1141, SIT: 1179, LATE: 1321, FINISH: 1330,
  S7: 1369, STOP: 1445, RESUME: 1502, LINE: 1540, TOP: 1568,
  S8: 1597, QUESTION: 1635, RESET: 1772, // trimmed so the whole Short stays under 60 s (Shorts library music limit)
  DROP1: 457, DROP2: 912, STOPBEAT: 1578, DROP3: 1597,
  LEN: 1790, // 59.67 s
};
