// formation(): places a block of soldiers. The block moves as ONE unit (the caller moves its origin) but every soldier has his own
// breathing phase (+-3 frames), size (+-5 %) and a tiny placement jitter from a fixed seed, so the line is never a row of clones.
export type Slot = { i: number; row: number; col: number; x: number; y: number; phase: number; size: number; variant: number };

const rnd = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

export const formation = (rows: number, cols: number, spacing: number, jitter = 4, seed = 1, rowGap = 0.5 * spacing): Slot[] => {
  const out: Slot[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c, k = i + seed * 31;
      out.push({
        i, row: r, col: c,
        x: c * spacing + (rnd(k) - 0.5) * 2 * jitter + (r % 2) * spacing * 0.35,
        y: r * rowGap + (rnd(k + 7) - 0.5) * jitter,
        phase: Math.round((rnd(k + 13) - 0.5) * 6), // +-3 frames
        size: 1 + (rnd(k + 19) - 0.5) * 0.1, // +-5 %
        variant: Math.floor(rnd(k + 23) * 6),
      });
    }
  }
  return out;
};
