// The eras Milo gets thrown into: palette + the closest accessories `Outfit` can draw + a real-clothing note for the writer.
// Colours are muted so the red cap stays the loudest thing in the frame.
import type { Outfit } from "../engine/toon";

export type Era = "ancient_greece" | "ancient_rome" | "ancient_egypt" | "medieval" | "tudor" | "victorian";
export const ERA_ORDER: Era[] = ["ancient_greece", "ancient_rome", "ancient_egypt", "medieval", "tudor", "victorian"];

export type EraInfo = {
  label: string;
  /** what the Outfit fields carry for this era (jacket, pants, boots are required; Milo's fixed parts are added by milo()) */
  outfit: Pick<Outfit, "jacket" | "pants" | "boots"> & Partial<Outfit>;
  /** how the era is approximated with the drawing code we have */
  approx: string;
  /** real clothing facts, so scripts do not invent */
  note: string;
};

export const ERAS: Record<Era, EraInfo> = {
  ancient_greece: {
    label: "Ancient Greece",
    outfit: { jacket: "#e4d6b4", dress: "#f3ead6", pants: "#c9b48a", boots: "#a8724a" },
    approx: "`dress` = the chiton down to the knees, `jacket` = the cloak seen at the shoulders, tan sandals as boots. No pins, no himation drape.",
    note: "Men wore a chiton (a tunic of linen or wool, belted, pinned at the shoulders), often with a himation cloak over it, and sandals or bare feet.",
  },
  ancient_rome: {
    label: "Ancient Rome",
    outfit: { jacket: "#a8323a", dress: "#f7f5ee", pants: "#c9b48a", boots: "#7a4b2a" },
    approx: "`dress` = the white toga, `jacket` = the red tunic showing at the shoulders. No draped fold over the arm.",
    note: "The toga was formal wear for citizens; everyday clothing was a belted tunic. A toga with a purple stripe marked magistrates and boys of citizen families.",
  },
  ancient_egypt: {
    label: "Ancient Egypt",
    outfit: { jacket: "#e9b98a", dress: "#f6efdc", pants: "#d8c29a", boots: "#c9a35a" },
    approx: "`jacket` in a skin-like tone reads as a bare chest, `dress` = linen kilt (drawn longer than a real kilt). No collar necklace, no wig.",
    note: "Men commonly wore a linen kilt (shendyt) with a bare chest, papyrus or leather sandals, and broad collar necklaces; linen was the main cloth.",
  },
  medieval: {
    label: "Medieval Europe",
    outfit: { jacket: "#d6c9a8", hem: "#d6c9a8", cloak: "#4f7a3c", pants: "#6a4a32", boots: "#2f241c", sash: "#4a3426" },
    approx: "Undyed wool tunic to the knee (`hem`) with the `sash` band as a leather belt, moss-green cloak (`cloak`) behind the shoulders. Front view only for now.",
    note: "Ordinary people wore a knee-length belted tunic over linen shirts and hose, with wool cloaks and hoods against the weather; dyes were mostly earthy.",
  },
  tudor: {
    label: "Tudor England",
    outfit: { jacket: "#7a1f2b", pants: "#23232e", boots: "#3a2a20", buttons: "#d9b84a" },
    approx: "Burgundy doublet with gold buttons over dark hose. No ruff, no flat cap (the red baseball cap replaces headwear).",
    note: "Men wore a doublet and hose with a shirt, and ruff collars became fashionable in the second half of the 16th century; flat caps were common.",
  },
  victorian: {
    label: "Victorian Britain",
    outfit: { jacket: "#2f3a4a", pants: "#5a5a62", boots: "#1d1b22", buttons: "#c9a14a" },
    approx: "Dark frock coat with brass buttons, grey trousers, black boots. No waistcoat, no pocket watch, no top hat.",
    note: "Men's day wear was a frock coat or sack coat with waistcoat and trousers, usually with a hat; the top hat was standard for formal occasions.",
  },
};
