// Acting: emotion poses and pose-to-pose timing so a stick figure "has a soul" — every feeling is a readable silhouette
// (line of action + what the hands do), held long enough to read, linked by short eased moves.
// Rules: .claude/skills/shorts-craft/references/acting.md. Poses face right (flip the Hero for left); hands are relative to
// the shoulder (+x forward, +y down), feet to the root (ground point), hip to the root. AR ≈ 142 = a straight arm.
import { BONE, HIP_H, POSES, Pose, mixPose } from "./hero";
import { clamp, ease } from "./core";

const H = HIP_H, AR = BONE.uArm + BONE.fArm;

export const EMOTE = {
  // ---- defeat, frustration, exhaustion (C-curve forward, head below the shoulders, hands go to the head or the knees)
  /** shock / "I missed": both hands on top of the head, elbows out, chin up a little */
  handsOnHead: (): Pose => ({ hip: [0, -H], lean: -4, head: -6, hN: [2, -72], hF: [-14, -70], elbow: -1, fN: [22, 0], fF: [-20, 0] }),
  /** exhausted after effort: bent over, hands on the knees, head hanging */
  handsOnKnees: (): Pose => ({ hip: [-14, -H + 30], lean: 52, head: 24, hN: [26, 104], hF: [14, 108], elbow: 1, fN: [36, 0], fF: [-30, 0] }),
  /** shame / despair standing: face buried in both hands */
  faceInHands: (): Pose => ({ hip: [0, -H + 6], lean: 22, head: 40, hN: [52, -14], hF: [44, -6], elbow: 1, fN: [18, 0], fF: [-16, 0] }),
  /** dejected walk-off pose: shoulders dropped, head down, arms dead */
  slump: (): Pose => ({ hip: [0, -H + 8], lean: 14, head: 38, hN: [8, AR - 2], hF: [-4, AR - 2], fN: [16, 0], fF: [-14, 0] }),
  /** tired at work: one hand rubbing the back of the neck, head tilted */
  rubNeck: (): Pose => ({ hip: [0, -H], lean: 6, head: 24, hN: [-10, -34], hF: [8, AR - 12], elbow: -1, fN: [18, 0], fF: [-16, 0] }),
  /** collapsed onto a desk while seated (seat = hip height above the floor in kit units) */
  deskCollapse: (seat = 100): Pose => ({ hip: [0, -seat - 6], lean: 64, head: 30, hN: [96, 30], hF: [84, 36], fN: [BONE.thigh - 6, 0], fF: [BONE.thigh + 14, 0] }),
  /** knocked flat on the back (after a fall) */
  flatBack: (): Pose => POSES.lie(),
  /** face down on the ground, arms forward (a crash) */
  flatFront: (): Pose => ({ hip: [0, -16], lean: 86, head: -18, hN: [66, 36], hF: [52, 44], fN: [-188, -10], fF: [-176, -14] }),

  // ---- getting back up (use in this order, each held 6–10 frames)
  /** 1 · pushing up on both hands */
  pushUp: (): Pose => ({ hip: [-10, -56], lean: 66, head: -14, hN: [64, 116], hF: [52, 118], elbow: 1, fN: [-150, 0], fF: [-138, 0] }),
  /** 2 · on one knee, hand on the knee, looking ahead */
  oneKnee: (): Pose => ({ hip: [-6, -104], lean: 18, head: -10, hN: [52, 70], hF: [20, AR - 30], fN: [70, 0], fF: [-92, -4] }),
  /** 3 · standing again, chin up, fists closed */
  resolve: (): Pose => ({ hip: [0, -H], lean: 4, head: -10, hN: [22, AR - 24], hF: [-10, AR - 24], elbow: 1, fN: [26, 0], fF: [-24, 0] }),

  // ---- effort (lean into the force, low centre of gravity)
  /** bracing against something coming at him (rain, arrows, wind): crouched, forearm up over the head */
  shieldUp: (): Pose => ({ hip: [-8, -H + 44], lean: 28, head: 26, hN: [70, -24], hF: [34, 30], elbow: 1, fN: [48, 0], fF: [-56, 0] }),
  /** trudging forward under a weight */
  trudge: (): Pose => ({ hip: [0, -H + 16], lean: 26, head: 22, hN: [30, AR - 30], hF: [-24, AR - 26], fN: [44, 0], fF: [-48, 0] }),

  // ---- boxing (facing right; lead hand = near)
  /** orthodox guard: side-on, knees soft, lead fist at chin height in front, rear fist at the jaw, elbows tucked, chin down */
  guard: (): Pose => ({ hip: [-6, -H + 22], lean: 12, head: 18, hN: [46, -26], hF: [22, -16], elbow: 1, fN: [52, 0], fF: [-54, -4] }),
  /** the straight right (cross): rear arm fully extended at shoulder height, hips turned in, lead fist back at the chin, rear heel up */
  cross: (): Pose => ({ hip: [6, -H + 20], lean: 20, head: 12, hN: [26, -22], hF: [AR - 6, -4], elbow: 1, fN: [60, 0], fF: [-44, -16] }),

  // ---- triumph (arched back, limbs away from the body, chin up)
  /** one fist punched up, the other arm low */
  fistPump: (): Pose => ({ hip: [0, -H], lean: -8, head: -22, hN: [28, -AR + 18], hF: [30, 60], elbow: 1, fN: [26, 0], fF: [-26, 0] }),
  /** both arms flung wide and up, chest out */
  armsWide: (): Pose => ({ hip: [0, -H], lean: -14, head: -26, hN: [86, -104], hF: [-52, -112], fN: [34, 0], fF: [-34, 0] }),
  /** the knee-slide: on both knees, back arched, arms wide */
  kneeSlide: (): Pose => ({ hip: [0, -98], lean: -22, head: -28, hN: [92, -84], hF: [-58, -98], fN: [64, 0], fF: [-70, 0] }),
  /** looking up with hope (the light, the goal) */
  lookUp: (): Pose => ({ hip: [0, -H], lean: -6, head: -34, hN: [16, AR - 12], hF: [-8, AR - 12], fN: [20, 0], fF: [-18, 0] }),
};

/**
 * Pose-to-pose acting: a list of key poses, each HELD for `hold` frames, with an eased move of `move` frames into it.
 * keys: [{ at, pose, move? }] in frames from the beat's start; returns the pose for frame t. Default move 6 f (fast,
 * readable), never linear; the last key holds.
 */
export type ActKey = { at: number; pose: Pose; move?: number };
export const act = (t: number, keys: ActKey[]): Pose => {
  if (t <= keys[0].at) return keys[0].pose;
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i], mv = k.move ?? 6;
    if (t < k.at) return keys[i - 1].pose;
    if (t < k.at + mv) return mixPose(keys[i - 1].pose, k.pose, ease.inOut(clamp((t - k.at) / mv)));
  }
  return keys[keys.length - 1].pose;
};

/** motion smear for a fast action (a kick, a crash, a swing): earlier frames to draw as faint ghosts behind the body */
export const smearFrames = (t: number, n = 3, gap = 1.5) => Array.from({ length: n }, (_, i) => ({ t: t - (i + 1) * gap, a: 0.28 * (1 - i / n) }));
