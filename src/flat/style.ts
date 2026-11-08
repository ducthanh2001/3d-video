// Shared style of the flat 2D series ("Real or Myth?"): ink, palette, proportions, safe area. Change a colour here and every
// character, prop and UI piece follows. Frame is 1080x1920.
export const W = 1080;
export const H = 1920;

export const INK = "#1b1b2f";
export const STROKE = 8; // px at 1080 wide; characters scale it with the figure so lines stay equally thick on screen
export const FONT = '"Arial Black", Impact, "Segoe UI Black", sans-serif';

export const PAL = {
  skin: "#f2c9a0",
  bgWarm: "#fff4e0",
  pip: "#1fa6a0", // Pip's beanie
  pipDark: "#168b86",
  scarf: "#f28c28",
  fail: "#e03b3b", // red: F stamp, REAL side of the meter
  myth: "#2a9d5c", // green: MYTH
  gold: "#ffd23f",
  stone: "#8a8f99", // exam-hall stone
  jacket: "#1d3f5c", // Pip's coat
  paper: "#fffaf0",
  white: "#ffffff",
  dark: "#7a2430", // inside of a mouth
};

// Character proportions (units: feet at y = 0, top of the head at y = -600; the head is 40 % of that).
export const PROPORTION = { height: 600, headDiameter: 240, headCenterY: -480 };

// Shorts overlays cover the bottom ~20 % and the right ~12 %: never put important text there.
export const SAFE = {
  bottom: H * 0.2,
  right: W * 0.12,
  maxX: W * 0.88,
  maxY: H * 0.8,
  captionTop: H * 0.45,
  captionBottom: H * 0.55,
};
