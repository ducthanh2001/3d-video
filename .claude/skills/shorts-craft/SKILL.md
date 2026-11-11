---
name: shorts-craft
description: >-
  Craft rules for the motivational stick-film Shorts in this repo (Remotion + src/kit): how to write the on-screen words
  so they do not read as AI-made, how to move the camera and cut between scenes, and how to animate figures and objects
  so nothing looks stiff. Use whenever a script, a beat table, on-screen text, title or description is written or revised,
  whenever a scene, a camera move, a transition or a figure's action is built or fixed in src/episodes/, and when the user
  says the motion "looks fake / too fast / stiff", the words "sound like AI", or asks for better camera moves or transitions.
---

# shorts-craft

Three references, opened only when the step needs them (read the section, not the whole file):

| When | Open |
|---|---|
| writing or revising a script, beat table, captions, punch lines, title, description | `references/writing.md` |
| choosing a camera move, a transition between scenes, a cut point | `references/camera.md` |
| animating a figure, an object, a counter, a label; fixing "stiff", "too fast", "floating" | `references/motion.md` |
| a figure must show a feeling (defeat, effort, triumph, stress), a fall and getting up, a reaction; "no soul / no emotion" | `references/acting.md` |

Helpers for all of it live in `src/kit/motion.ts` (exported from `src/kit`): `inertia`, `spring` / `springF` + `SPRING`,
`anticipate`, `stagger`, `arc`, `lagged`, `startFor`, `WEIGHT`, `stepped`; emotion poses and pose-to-pose timing in
`src/kit/acting.ts` (`EMOTE.*`, `act`, `smearFrames`), approved on the `ActingSheet` composition. Camera tools are in `src/kit/camera.tsx`
(`Cam` keys with `e`, `follow`, `zoomInto`, `whip`, `XFade`, `Flash`, `Dip`) and in each film's own `Cam` wrapper.

## The channel's rules come first

These are this channel's measured rules (see docs/claude-memory/); the references never override them:

- **Frame 0 is literal and readable at a glance:** labelled figures acting on a real object, moving from the first frame.
  No metaphor to decode. A hook is a question the film owes the viewer, answered at the end.
- **Labelled pairs (or 3 rows) doing the same physical task;** the easy option looks better first, the cost shows later.
  A counter or meter runs through the film.
- **Real objects, real scale, real physics** (docs/claude-memory/realistic-objects.md): hands touch what they push or hold,
  things rest on surfaces, fall the right way, effort shows in the body.
- **B&W dominant; gold = success, red = failure;** other colours only when they mean something (green growth, phone blue),
  natural objects may keep their natural colour.
- **No black dips between scenes;** cross-dissolves or match transitions, one visual system throughout.
- One time source per film: `events.ts` (beats at 94.685 BPM unless the film says otherwise); picture and the audio script
  both read it.

## Every scene, before rendering stills

1. **Write the beat:** what the viewer must understand in one sentence with the sound off (the muted test).
2. **One lead per moment:** name the hero of each beat; everything else moves less, later, smaller.
3. **Pick the camera line:** `name, seconds, easing, target` (references/camera.md). One primary move per shot.
4. **Cause before effect:** list each action and its reaction 2–4 frames later (a hit → chips; a step → snow; a log → flare).
5. **Acting check** (references/acting.md): every figure that matters has one held key pose per feeling, readable
   by its hands and line of action; a failure plays as a sequence; someone on screen reacts.
6. **Timing check:** heavy = slow start, firm stop; every start eases or anticipates, every stop settles and holds 4–6 frames;
   living things never move at constant speed; effortful progress is `stepped()` (move, rest, move).
7. **Words check** (references/writing.md): ≤ 6 words per card, ≤ 9 per line, no banned phrase, no dash, the line adds what
   the picture cannot, the key word lands within 0.5 s of the image that answers it.

## Review on strips, not single stills

Render 6–12 frames across each key move (`node scripts/stills.mjs <Comp> <prefix> <f1,f2,...> 0.3`, then `ffmpeg … hstack`)
and check: the eye finds the lead within half a second; cause precedes effect; no equal gaps on a living move (linear);
no pops; hands on the object at contact; the landing frame sits on the cue.

Attribution: the camera, motion and writing rules are adapted from **cinecode** by Sarp Yildiz (MIT,
https://github.com/sarpstar/cinecode, see `LICENSE-cinecode.txt`), rewritten for Remotion and this kit. None of cinecode's
hooks or scripts are installed here.
