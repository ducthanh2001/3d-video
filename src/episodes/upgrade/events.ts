// The single source of time for "YOUR PHONE UPGRADES EVERY YEAR. DO YOU?" (frames at 30 fps).
// Picture (Film.tsx) and sound (audio/make_audio_upgrade.py, which parses this table) both read it.
// Music: 120 BPM, one beat = 15 frames; the drop (DROP) and the final hit (HIT) sit on beats.
export const FPS = 30;
export const BEAT = 15;
export const Q = {
  HOOK: 0, NOTIF: 6, THUMB: 34, SWIPE: 52,
  MATH: 90, GRID0: 100, GRID1: 148, DAYS: 150,
  BUILD: 180, TILT: 198, WIDE: 228,
  LATE: 300, SPIN0: 302, SPIN1: 342, CAN1: 318, LAMPOFF: 330, CAN2: 346,
  BOOK: 360, FLIP1: 390, FLIP2: 420, FLIP3: 450,
  FAIL: 480, TEAR: 506, BALL: 512, THUD: 528, SILENCE: 525, LOOKUP: 555, PENCIL: 570, DROP: 585,
  YEAR: 600, ART1: 615, ART2: 630, ART3: 645, ART4: 660, ART5: 675, DOWN: 690,
  MAIL: 720, POP: 735, ZOOM: 765,
  UPG: 810, HUSH: 810,
  DAY1: 900, FACEDOWN: 906, OPEN: 918, LINE0: 932, LINE1: 972,
  END: 990, HIT: 990, LOOP: 1066,
  LEN: 1080,
};
