// Light presets per time of day. The sun is CAMERA-RELATIVE and frozen per shot (world.ts update()):
// az = degrees from the shot camera's forward axis (0 = sun straight ahead = backlight, +90 = screen right,
// 180 = behind camera), el = elevation. lit/shade/lift are LINEAR RGB multipliers for shade.ts (may exceed 1).
// Field names follow lighting.md 9.1 exactly (the CHAR and POST agents read them); values are tuned on renders.
type C3 = [number, number, number];
export type LightPreset = {
  az: number; el: number;
  lit: C3; shade: C3; lift: C3; lambert: number; sideK: number; term: number;      // world two-tone (shade.ts)
  charTint: C3; charShade: number; charGrad: number; bodyGrad: number; sideTint: C3; // character cards (cast.ts)
  blob: C3; actorShadow: boolean;                                                    // contact blobs / card shadows
  top: string; hor: string; skyCurve: C3; fog: string; fogNear: number; fogFar: number; sunDisc: string; // depth.md 6.5
  sunCol: string; sunI: number; sky: string; ground: string; hemiI: number;         // three lights (unpatched mats only)
  bias: number; normalBias: number;
};
export type LightName = "day" | "golden" | "dusk" | "interior";
export const LIGHTS: Record<LightName, LightPreset> = {
  day: {
    az: 75, el: 48,
    lit: [1.58, 1.5, 1.33], shade: [0.3, 0.29, 0.36], lift: [0.05, 0.06, 0.11], lambert: 0.35, sideK: 0.84, term: 0.2,
    charTint: [1.0, 0.94, 0.92], charShade: 0.86, charGrad: 0.07, bodyGrad: 0.2, sideTint: [0.92, 0.90, 0.96],
    blob: [0.62, 0.58, 0.58], actorShadow: false,
    top: "#3e7fd2", hor: "#b8d0ec", skyCurve: [0.0, 0.5, 0.6], fog: "#b8d0ec", fogNear: 25, fogFar: 300, sunDisc: "#000000",
    sunCol: "#fff3e0", sunI: 2.8, sky: "#dcecff", ground: "#b49a78", hemiI: 0.55,
    bias: -0.00025, normalBias: 0.015,
  },
  golden: {
    az: 6, el: 7,
    lit: [1.5, 0.68, 0.24], shade: [0.15, 0.15, 0.3], lift: [0.04, 0.06, 0.17], lambert: 0.35, sideK: 0.82, term: 0.07,
    charTint: [1.0, 0.78, 0.56], charShade: 0.88, charGrad: 0.1, bodyGrad: 0.25, sideTint: [0.85, 0.80, 0.95],
    blob: [0.75, 0.74, 0.9], actorShadow: true,
    top: "#6a4f8c", hor: "#ffd08a", skyCurve: [0.05, 0.6, 1.0], fog: "#efb489", fogNear: 50, fogFar: 380, sunDisc: "#ffcf9e",
    sunCol: "#ffab5e", sunI: 5.5, sky: "#d8b0b8", ground: "#8a6a60", hemiI: 0.5,
    bias: -0.0006, normalBias: 0.03,
  },
  // interior (court-room): one warm sun from the window on the left, deep warm shade, a dark timber-brown "ceiling" instead of sky
  interior: {
    az: -65, el: 42,
    lit: [1.3, 1.08, 0.78], shade: [0.24, 0.2, 0.26], lift: [0.05, 0.04, 0.07], lambert: 0.35, sideK: 0.84, term: 0.2,
    charTint: [1.0, 0.9, 0.78], charShade: 0.84, charGrad: 0.08, bodyGrad: 0.22, sideTint: [0.9, 0.84, 0.92],
    blob: [0.55, 0.5, 0.55], actorShadow: false,
    top: "#2e2224", hor: "#4a3a38", skyCurve: [0.0, 0.5, 0.6], fog: "#3a2c2c", fogNear: 18, fogFar: 140, sunDisc: "#000000",
    sunCol: "#ffd9a0", sunI: 2.6, sky: "#e8d2b0", ground: "#6a4a34", hemiI: 0.5,
    bias: -0.00025, normalBias: 0.015,
  },
  // dusk (shot 5-6): the sun is gone, only a thin orange line at the horizon; violet-blue shade everywhere, low key light
  dusk: {
    az: 6, el: 3,
    lit: [0.62, 0.42, 0.5], shade: [0.12, 0.13, 0.27], lift: [0.04, 0.05, 0.15], lambert: 0.3, sideK: 0.82, term: 0.07,
    charTint: [0.62, 0.58, 0.72], charShade: 0.88, charGrad: 0.1, bodyGrad: 0.25, sideTint: [0.7, 0.7, 0.95],
    blob: [0.6, 0.6, 0.85], actorShadow: false,
    top: "#2a2350", hor: "#e08a6a", skyCurve: [0.05, 0.6, 1.0], fog: "#6a5683", fogNear: 30, fogFar: 340, sunDisc: "#000000",
    sunCol: "#7c6aa8", sunI: 1.4, sky: "#6d6a9e", ground: "#3e3350", hemiI: 0.45,
    bias: -0.0006, normalBias: 0.03,
  },
};

/** world-only look per light (sky stops by elevation in degrees, river colours, cloud palette). All colours are
 *  ON-SCREEN targets under the current PBR-Neutral tone map; world.ts pre-inverts the tone map (shade.ts untone). */
export type WorldLook = {
  sky: { c: string[]; e: number[] };                         // 5 stops: c[i] at elevation e[i] (deg), smoothstep between
  water: { near: string; mid: string; far: string; crest: string; trough: string; glint: string; shade: C3 };
  bounce: C3;                                                 // shade.ts uBounce: albedo x bounce on shaded faces turned to the lens
  sat: number;                                                // shade.ts uSat: world albedo saturation (1 = as painted)
  cloud: { lit: string; mid: string; shade: string };
};
export const LOOK: Record<LightName, WorldLook> = {
  day: {
    // depth.md 2.2: horizon #9fb6e6 just above the skyline, upper sky #5e93d9 at ~20 deg (grade: frame top #5997e2)
    sky: { c: ["#b8d0ec", "#9cbfea", "#6a9fe0", "#4f8cdb", "#3373cc"], e: [0, 3, 8, 16, 40] },
    water: { near: "#22a7b6", mid: "#167fb2", far: "#1a5596", crest: "#7ddfe8", trough: "#0e4a80", glint: "#ffffff", shade: [0.5, 0.56, 0.72] },
    cloud: { lit: "#fbf8f1", mid: "#e1e5f3", shade: "#c3cbe9" },
    bounce: [0, 0, 0],
    sat: 1.08,
  },
  golden: {
    // sunset, not dusk: #ffd08a horizon, peach/orange through ~10 deg, warm rose at 20, muted warm mauve only near the top
    // (the golden grade adds ~+11/255 blue to shadows/mids, so these lean warm)
    sky: { c: ["#ffc47c", "#f7ae78", "#e8967c", "#c4848e", "#8a6f8a"], e: [0, 4, 10, 20, 40] },
    water: { near: "#1e3a6e", mid: "#355f96", far: "#d4a48e", crest: "#d9a088", trough: "#16294f", glint: "#ffe2b0", shade: [0.42, 0.46, 0.72] },
    cloud: { lit: "#ffd2a8", mid: "#f2a08f", shade: "#a98fc4" },
    bounce: [0.04, 0.02, 0.0],
    sat: 1.1,
  },
  interior: {
    sky: { c: ["#4a3a38", "#3e302f", "#352a2b", "#2c2326", "#241d20"], e: [0, 3, 9, 20, 45] },
    water: { near: "#1b2a58", mid: "#2a3c72", far: "#9a6a8a", crest: "#7a7ab0", trough: "#111c3e", glint: "#ffb98a", shade: [0.4, 0.44, 0.7] },
    cloud: { lit: "#6a5248", mid: "#4a3a38", shade: "#3a2c2c" },
    bounce: [0.05, 0.03, 0.02],
    sat: 1.05,
  },
  dusk: {
    sky: { c: ["#f0925e", "#b8688a", "#6a4f8c", "#3b3470", "#231d4a"], e: [0, 3, 9, 20, 45] },
    water: { near: "#1b2a58", mid: "#2a3c72", far: "#9a6a8a", crest: "#7a7ab0", trough: "#111c3e", glint: "#ffb98a", shade: [0.4, 0.44, 0.7] },
    cloud: { lit: "#e8a0a0", mid: "#a47aa8", shade: "#5a4a88" },
    bounce: [0.03, 0.02, 0.03],
    sat: 1.05,
  },
};
