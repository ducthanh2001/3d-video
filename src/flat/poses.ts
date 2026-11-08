// Arm poses. Hands are given relative to the shoulder in character units (feet at y=0, y grows down).
export type HandKind = "fist" | "open" | "point" | "finger"; // point = finger along the arm, finger = finger up
export type HeldKind = "notebook" | "magnifier" | "paper" | "stamp" | "pencil" | "book";
export type Held = { item: HeldKind; at: "l" | "r" | "both" };

export type Pose = {
  l: [number, number];
  r: [number, number];
  bendL: number; // elbow bulge (0 = straight)
  bendR: number;
  handL?: HandKind;
  handR?: HandKind;
  held?: Held;
  tilt?: number; // extra head tilt in degrees
};

export type PoseName =
  | "idle" | "point" | "hold_paper" | "magnifier" | "shrug" | "one_finger" | "scratch_head" | "hold_stamp" | "stamp_down" | "hold_book" | "write";

export const POSES: Record<PoseName, Pose> = {
  idle: { l: [-16, 150], r: [16, 150], bendL: 0.2, bendR: 0.2 },
  point: { l: [-14, 150], r: [180, 10], bendL: 0.2, bendR: 0.1, handR: "point" },
  hold_paper: { l: [58, 115], r: [-58, 115], bendL: 0.5, bendR: 0.5, held: { item: "paper", at: "both" } },
  magnifier: { l: [30, 120], r: [112, -20], bendL: 0.5, bendR: 0.5, held: { item: "magnifier", at: "r" } },
  shrug: { l: [-52, 62], r: [52, 62], bendL: 0.9, bendR: 0.9, handL: "open", handR: "open", tilt: 7 },
  one_finger: { l: [-16, 150], r: [92, -70], bendL: 0.2, bendR: 0.5, handR: "finger" },
  scratch_head: { l: [-16, 150], r: [26, -216], bendL: 0.2, bendR: 0.8, handR: "open", tilt: 4 },
  hold_stamp: { l: [-16, 150], r: [74, -80], bendL: 0.2, bendR: 0.5, held: { item: "stamp", at: "r" } },
  stamp_down: { l: [-16, 150], r: [74, 70], bendL: 0.2, bendR: 0.3, held: { item: "stamp", at: "r" } },
  hold_book: { l: [58, 100], r: [-58, 100], bendL: 0.5, bendR: 0.5, held: { item: "book", at: "both" } },
  write: { l: [60, 120], r: [-8, 110], bendL: 0.4, bendR: 0.5, held: { item: "pencil", at: "r" } },
};
