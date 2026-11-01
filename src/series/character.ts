// Milo: the one character of the channel. What never changes lives in FIXED; what changes per episode comes from ERAS.
// Why a red baseball cap: it is the thumbnail / avatar anchor and the running joke (a modern cap in every era). The cap is
// only dropped on purpose, by passing { hat: null } as `extra` for a gag.
import { Outfit, SKINS } from "../engine/toon";
import { Era, ERAS } from "./eras";

export const MILO_NAME = "Milo"; // working name: change it here
/** the head shape is drawn from this seed (pass it as `seed` to bodyFront / bodySide for every Milo card) */
export const MILO_SEED = 3;
export const MILO_CAP = "#e2453c";
export const MILO_SCREEN = "#7fe3ff"; // smart watch on his left wrist

/** never changes between episodes: adult build (the channel targets adults), skin tone, red cap, smart watch */
export const FIXED: Pick<Outfit, "build" | "skin" | "hat" | "cap" | "watch"> = {
  build: "adult",
  skin: SKINS[1],
  hat: "baseball",
  cap: MILO_CAP,
  watch: MILO_SCREEN,
};

/** his own clothes before he is thrown anywhere (also the base for the expression sheet) */
export const MODERN: Pick<Outfit, "jacket" | "pants" | "boots"> & Partial<Outfit> = {
  jacket: "#3f6fb5", pants: "#3b3f52", boots: "#f4f1ea",
};

/** Milo for an era. Order: era clothes, then the fixed parts, then `extra` (so a gag can still take the cap away). */
export const milo = (era: Era | "modern", extra: Partial<Outfit> = {}): Outfit => ({
  ...(era === "modern" ? MODERN : ERAS[era].outfit),
  ...FIXED,
  ...extra,
});

/** how he acts: clumsy, panics easily, sometimes smug. Meanings -> drawn faces live in expressions.ts */
export const PERSONALITY = "clumsy, panics easily, occasionally smug";
