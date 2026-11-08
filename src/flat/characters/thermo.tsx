// Characters of the Thermopylae episode on the shared rig (src/flat/rig). Each one is a FigSpec; the poses are RigPose presets that every
// character can use (Persians are the same poses drawn with flip). No lambda on the shields (not in the sources): plain colours only.
// Persians are drawn as a well-dressed, organised army: patterned robes, wrapped caps, reed shields. No blood anywhere.
import { Figure, FigSpec, FigureProps } from "../rig/Figure";
import { RigPose } from "../rig/rig";
import { PAL } from "../style";
import { sw, swFill } from "../FlatCharacter";

const BRONZE = "#c99a3c", RED = "#d8322d", SKIN_G = "#e8b98a", SKIN_P = "#d9a273";

const hoplite = (cloak: string, tunic: string, crest: string, shield: FigSpec["shield"], extra: Partial<FigSpec> = {}): FigSpec => ({
  size: 1, skin: SKIN_G, helmet: "hoplite", helmetColor: BRONZE, crest, tunic, armor: BRONZE, skirt: "short", skirtColor: tunic, legColor: SKIN_G,
  greaves: BRONZE, boots: "#5a3a2a", cloak, shield, weapon: "spear", ...extra,
});

export const SPARTAN: FigSpec = hoplite("#b3212a", "#b82f2f", RED, { kind: "round", color: RED, rim: "#8f1f1f", mark: "none" });
/** Spartans differ a little in height and beard so the line is not a row of clones (i = 0..5) */
export const spartan = (i: number): FigSpec => ({
  ...SPARTAN, size: [1, 0.96, 1.04, 0.98, 1.02, 0.95][i % 6], skin: ["#e8b98a", "#dca878", "#eec39a", "#d49a6a", "#e8b98a", "#e2b080"][i % 6],
  beard: i % 3 === 1 ? { color: "#4a3020", size: 0.9 } : i % 3 === 2 ? { color: "#6b4a30", size: 0.75 } : undefined,
});
export const LEONIDAS: FigSpec = {
  ...SPARTAN, size: 1.1, helmet: "hoplite_big", cloak: "#8f1a20", beard: { color: "#4a3a30", size: 1.35 }, brow: "#2a1a14",
};
export const LEONIDAS_ORDER: FigSpec = { ...LEONIDAS, weapon: "none" }; // when he waves the army away
export const THESPIAN: FigSpec = hoplite("#2f6fb5", "#e9e3d0", "#2f6fb5", { kind: "round", color: "#eaf2fb", rim: "#2f6fb5", mark: "ring" }, { armor: "#d8d2bc" });
export const GREEK_GOLD: FigSpec = hoplite("#e0a526", "#8a4b25", "#e0a526", { kind: "round", color: "#f0c24a", rim: "#7a4f10", mark: "dot" }, { skin: "#dca878", legColor: "#dca878" });
export const GREEK_GREEN: FigSpec = hoplite("#3f8f55", "#e6dcc0", "#3f8f55", { kind: "round", color: "#cfe8d3", rim: "#2c6a3e", mark: "stripe" }, { skin: "#eec39a", legColor: "#eec39a" });

export const PERSIAN: FigSpec = {
  size: 0.98, skin: SKIN_P, helmet: "turban", helmetColor: "#1f4e79", beard: { color: "#1d1612", size: 1 }, tunic: "#2e6a8f",
  pattern: { kind: "diamond", color: PAL.gold }, skirt: "robe", skirtColor: "#2e6a8f", legColor: "#7a3b6b", boots: "#4a3020",
  shield: { kind: "reed", color: "#d9bf86", rim: "#7a5a2a" }, weapon: "short_spear",
};
export const PERSIAN_ARCHER: FigSpec = {
  ...PERSIAN, tunic: "#9a4a33", skirtColor: "#9a4a33", pattern: { kind: "stripe", color: "#f0c987" }, helmetColor: "#7a2f3f", shield: undefined, weapon: "bow",
};
export const XERXES: FigSpec = {
  size: 1.04, skin: SKIN_P, helmet: "crown", beard: { color: "#1d1612", size: 1.25 }, tunic: PAL.gold, pattern: { kind: "diamond", color: "#b8860b" },
  skirt: "robe", skirtColor: PAL.gold, legColor: "#7a2a4a", boots: "#a86b3a", cloak: "#7a1f4a", weapon: "none",
};
export const EPHIALTES: FigSpec = {
  size: 0.94, skin: "#e0b088", helmet: "hood", helmetColor: "#8a9099", beard: { color: "#8c8478", size: 0.8, style: "point" }, mantle: "#8a9099", tunic: "#6e737b", skirt: "robe",
  skirtColor: "#6e737b", legColor: "#6e737b", boots: "#4a3a2a", cloak: "#7a8089", weapon: "none",
};
export const GUARD: FigSpec = { ...GREEK_GREEN, weapon: "torch", shield: undefined, helmet: "hoplite", crest: "#3f8f55" }; // the Phocian guard on the path

// ---- pose presets (facing +x). Hands/feet are world targets; the IK finds elbows and knees ----------------------------------------------
const base: { footL: [number, number]; footR: [number, number] } = { footL: [26, -14], footR: [-26, -14] };
export const POSES = {
  stand: { ...base, handL: [58, -262], handR: [64, -312], weaponAngle: -88 },
  stand_firm: { hip: [0, -152], lean: -2, footL: [34, -14], footR: [-34, -14], handL: [66, -312], handR: [70, -330], weaponAngle: -90 },
  shield_lock: { hip: [10, -140], lean: 6, footL: [64, -14], footR: [-52, -14], handL: [66, -296], handR: [24, -372], weaponAngle: -4 },
  thrust_windup: { hip: [-10, -146], lean: -4, footL: [48, -14], footR: [-74, -14], handL: [56, -290], handR: [-66, -318], weaponAngle: -3 },
  thrust_contact: { hip: [30, -136], lean: 14, footL: [96, -14], footR: [-62, -14], handL: [60, -280], handR: [128, -318], weaponAngle: 0 },
  thrust_follow: { hip: [20, -140], lean: 9, footL: [88, -14], footR: [-64, -14], handL: [58, -282], handR: [96, -316], weaponAngle: -1 },
  persian_block: { hip: [0, -150], lean: 2, footL: [30, -14], footR: [-34, -14], handL: [66, -300], handR: [-6, -334], weaponAngle: -34 },
  persian_stagger: { hip: [-26, -146], lean: -14, footL: [6, -14], footR: [-60, -14], handL: [38, -312], handR: [-34, -340], weaponAngle: -52 },
  point_up: { hip: [-10, -150], lean: 2, footL: [20, -14], footR: [-34, -14], handL: [18, -214], handR: [210, -500], weaponAngle: -30, headTilt: 6, armFront: true, point: true },
  sit: { hip: [-14, -118], lean: 0, footL: [76, -14], footR: [52, -14], handL: [72, -108], handR: [34, -112] },
  plead: { hip: [-8, -148], lean: 8, footL: [24, -14], footR: [-30, -14], handL: [30, -230], handR: [170, -290], weaponAngle: 0, headTilt: 4, armFront: true },
  wave_off: { hip: [0, -150], lean: 3, footL: [30, -14], footR: [-30, -14], handL: [20, -218], handR: [230, -380], weaponAngle: -80, armFront: true },
  walk_away: { hip: [0, -146], lean: 3, footL: [62, -14], footR: [-58, -14], handL: [40, -250], handR: [10, -300], weaponAngle: -88 },
  surprised: { hip: [-8, -150], lean: -10, footL: [34, -14], footR: [-34, -14], handL: [30, -330], handR: [76, -300], weaponAngle: -80, headTilt: -8 },
  march: { hip: [0, -146], lean: 2, footL: [50, -14], footR: [-46, -14], handL: [56, -280], handR: [64, -310], weaponAngle: -88 },
} satisfies Record<string, RigPose>;
export type PoseName = keyof typeof POSES;

export type CharProps = Omit<FigureProps, "spec" | "pose"> & { pose?: PoseName | RigPose };
const as = (p: PoseName | RigPose | undefined, d: PoseName): RigPose => (typeof p === "object" ? p : POSES[p ?? d]);
const make = (spec: FigSpec, d: PoseName) => (p: CharProps) => <Figure spec={spec} {...p} pose={as(p.pose, d)} />;

export const Hoplite = (p: CharProps & { spec?: FigSpec }) => <Figure spec={p.spec ?? SPARTAN} {...p} pose={as(p.pose, "stand")} />;
export const LeonidasFig = make(LEONIDAS, "stand_firm");
export const PersianFig = (p: CharProps & { spec?: FigSpec }) => <Figure spec={p.spec ?? PERSIAN} {...p} pose={as(p.pose, "persian_block")} flip={p.flip ?? true} />;
export const EphialtesFig = make(EPHIALTES, "point_up");

/** the golden throne platform behind a seated Xerxes (character coordinates) */
export const THRONE = (
  <g>
    <rect x={-210} y={-6} width={360} height={46} rx={10} style={swFill("#b8860b", 1.2)} />
    <rect x={-190} y={-118} width={300} height={22} rx={8} style={swFill(PAL.gold, 1.1)} />
    <rect x={-190} y={-96} width={26} height={96} style={swFill("#d9a520", 1)} />
    <rect x={70} y={-96} width={26} height={96} style={swFill("#d9a520", 1)} />
    <path d="M-186 -118 L-186 -430 Q-186 -470 -150 -470 L-96 -470 Q-70 -470 -70 -430 L-70 -118 Z" style={swFill(PAL.gold, 1.3)} />
    <path d="M-168 -190 H-88 M-168 -260 H-88 M-168 -330 H-88" fill="none" style={{ ...sw(0.7), stroke: "#b8860b" }} />
  </g>
);
export const XerxesFig = (p: Omit<CharProps, "behind">) => <Figure spec={XERXES} {...p} pose={as(p.pose, "sit")} behind={THRONE} />;
