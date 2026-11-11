# Acting: figures with a soul

Learned from a frame-by-frame study (2026-11-10) of a 1.2M-view competitor Short, "One decision can change your life"
(34 s, 5 vignettes). The frames stay in `out/_ref/acting_EQhrPwTjhBI/` (gitignored, private study: never copy or publish
them). What follows is our own description of WHY its figures read as alive, turned into rules and the kit's
`src/kit/acting.ts` (`EMOTE.*` poses, `act()` pose-to-pose, `smearFrames()`), approved on the `ActingSheet` composition.

## What the study showed (one line per vignette)

- **Glory, then the truth behind it** ("what people see / don't see"): a penalty in a full stadium: run-up, the kick with a
  motion smear, the keeper's full-length dive, the scorer's jump then a knee-slide with arms wide, held ~1.5 s; the keeper
  lies flat, then kneels with his hands on the net. A rewind effect flips to the same pitch at night in the rain, alone among
  scattered balls: he misses → **hands on head** → **bent over, hands on knees** → tries again → slips, **flat on his back**,
  a still beat → **sits up**. Same place, same man, opposite light and company.
- **A burden you can see**: at a desk at night he types, **rubs his neck**, a small **storm cloud with a lightning bolt**
  appears over his head, icons of his worries (briefcase, rocket, dumbbell, books) **pop in one by one** around him, he
  stands, **hands to his head**, folds forward under them and finally **collapses** while the icons fall.
- **Scale of hardship by contrast**: knights advancing through an **arrow storm**: he walks **crouched behind his shield**,
  arrows stick in it, the crowd behind is denser and greyer, then he **draws and raises his sword**: the turn.
- **A fall is not the end**: a bike race: he crashes at the start (bike and body slide), others pass, a **bystander puts a
  hand to his head** (the audience's reaction on screen), he **pushes up on his hands → one knee → stands → remounts**,
  each stage held, then the camera **tracks** with him over bumps as he overtakes and breaks the tape.
- **An animal acts too**: a stranded fish flops from puddle to puddle, **each flop an arc with a splash and a rest**, until it
  slides into the sea and the water turns blue: effort shown by rhythm (try, rest, try), not by a face.

## The rules

1. **Pose to pose, and hold.** Each feeling is ONE clear key pose held 0.5–1.5 s (15–45 f); moves between keys are short
   (4–8 f, eased; `act()` default 6 f). Constant motion reads as noise; held silhouettes read as emotion.
2. **Line of action:** defeat = a C-curve forward, head below the shoulders (`slump`, `handsOnKnees`, `faceInHands`);
   triumph = back arched, chin up, limbs away from the body (`fistPump`, `armsWide`, `kneeSlide`); effort = lean into the
   force, low centre of gravity (`trudge`, `shieldUp`, the push and pull poses).
3. **The hands say it** (stick figures have no faces): on the head = shock or a miss · on the knees = exhaustion · over the
   face = shame · rubbing the neck = tired · a fist up = victory · arms wide = joy · a forearm over the head = bracing.
4. **Readable silhouettes:** in a key pose the limbs are away from the torso; no arm crossing the body at the key moment.
   Check at phone size (render at 0.3 scale): the feeling must read in half a second.
5. **Failure is a sequence, never a reset:** try → fail with an impact (smear, a slide, dust) → a still beat on the ground
   (8–15 f) → a reaction pose → get up in stages (`flatFront`/`flatBack` → `pushUp` → `oneKnee` → `resolve`) → try again.
6. **A second figure reacts:** the keeper, a bystander, a crowd member. Their reaction (hands on head, pointing, clapping)
   tells the viewer how to feel and doubles the moment.
7. **Make the inside visible with objects:** a storm cloud + lightning over a stressed head, worries as icons that pile up,
   rain and night for loneliness, a spotlight and a crowd for glory, a stopped clock for time lost.
8. **Same place, opposite conditions** is the strongest contrast: day/crowd vs night/rain/alone, with the same man in the same
   spot (a rewind or a light change as the transition).
9. **Fast actions get a smear** (`smearFrames()`: 2–4 ghosts, 1–2 f apart, 0.1–0.3 opacity) and an impact frame; slow
   actions get weight (anticipation, a settle).
10. **Effort has a rhythm:** try, rest, try (the fish, a climber, a lifter): the rests are what make the tries feel hard.
11. **Camera serves the acting:** hold wide (figure ~20% of the frame height) for a pose to read; track alongside for a
    race; the reveal (rewind, pull-back) comes once.

## In this kit

```ts
import { EMOTE, act, smearFrames } from "../../kit";
const pose = act(t, [
  { at: 0, pose: kickPose },
  { at: 10, pose: EMOTE.handsOnHead(), move: 5 },   // the miss
  { at: 40, pose: EMOTE.handsOnKnees() },          // exhausted
  { at: 70, pose: EMOTE.resolve(), move: 8 },      // tries again
]);
```
`ActingSheet` (`node scripts/stills.mjs ActingSheet out/kit/acting- 0 0.5`) shows every EMOTE pose; add new ones there and
approve them on the sheet before using them in a film.
