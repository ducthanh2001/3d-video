# Camera moves and transitions (for Remotion + src/kit)

Adapted from cinecode `references/camera-moves.md` (MIT, Sarp Yildiz). Write every shot's camera as one **camera line**:
**name, seconds, speed easing, target** — e.g. `pull-back reveal, 3 s, ease-in-out, from him to the whole ridge`.
Put it in the scene's first comment and implement it with the film's `Cam` (zoom `z` on world point `c`) or `src/kit/camera.tsx`
(`<Cam keys>` with per-key easing `e`, `follow(path)`, `zoomInto`, `whip`).

## Speed and easing

| Word | Moves that change size (push, pull, zoom) | Moves that sweep (pan, track) |
|---|---|---|
| slow | subject size changes ≤ 10% per second | an object takes ≥ 6 s to cross the frame |
| medium | 10–25% per second | 3–6 s to cross |
| fast | > 25% per second | 1.5–3 s (faster = whip) |

Easing: **linear** machines, a drift · **ease-in** gathering force, endings · **ease-out / `burst`** fastest on frame 0: the
hook shot · **ease-in-out** a deliberate self-contained move · **`inertia`** (motion.ts: 35% linear + 65% smoothstep) moving
on the first frame and still moving at the cut: the default inside a sequence. The first shot never starts with ease-in.

One primary move per shot plus at most one secondary (a little drift `drift()`, a small tilt). Every move has a reason:
**push = tension / importance, pull = release / reveal, track = travel, crane = scale, follow = presence, locked = let the
subject move.**

## Moves

| Name | What the viewer feels | Default | In this kit |
|---|---|---|---|
| push in (dolly in) | "this matters", tension | 3–6 s slow, inertia (ease-out at the hook) | `Cam` z 1 → 1.3 on the subject |
| pull-back reveal | surprise, irony, scale | 3–6 s slow→medium, ease-in | z 2.3 → 1 from a detail to the whole (TRUST opening, summit) |
| push-in on detail | "look here": a clue | 2–4 s slow, ease-in-out | z → 2–3 on an off-centre point |
| pan / track | scanning, linking two things, travel | 3–6 s, inertia | c moves from A to B at constant z |
| follow | presence, effort | the whole beat, lag 3–6 frames | `follow(path, z, lag)`; the subject a third in, space ahead of him |
| tilt up / crane up | awe, hope, scale | 2–4 s slow, ease-in-out | c moves up a tall object |
| dolly zoom | realisation, dread | 2–4 s, once per film | z and the background layer's scale in opposite directions |
| handheld | presence, urgency | the whole shot, subtle | `drift(f, 3–6)`; never per-frame jitter |
| impact kick | a hit, a landing | 6–12 frames | `kicks={[{ f, amp: 10–20 }]}` once per hit |
| slow motion / ramp | weight, a moment stretched | 0.25–0.5× over 0.3–0.6 s | remap t inside the segment |
| freeze frame | punctuation, "remember this" | 0.5–2 s | hold t, keep the camera drifting |

## Transitions (between segments)

| Name | Feels like | Default | How |
|---|---|---|---|
| hard cut | clarity, momentum | 0 frames | no overlap |
| match cut | connection | 0 frames + 0.3–0.6 s settle | a shape, motion or colour sits at the same place on both sides (a slope's angle → the next road's angle; headlights → firelight) |
| cross dissolve | time passing | 8–18 frames | `XFade` / overlapping segments (the films' `XF`) |
| whip pan | energy, a jump in place | 6–10 frames | `whip()` over the last frames of A and the first of B, same direction |
| flash | an impact, a reveal | 4–8 frames | `Flash` on the hit |
| smash cut | shock, contrast | 0 frames, the sound changes on the same frame | cut + a silence or a hit in the audio script |
| J-cut / L-cut | pulled forward / continuity | sound leads or trails by 0.3–1.5 s | offsets in `make_audio_*.py` |

**This channel never dips to black between scenes.** Vary the designed transitions (never the same one twice in a row);
the plain dissolve is the default joint.

**Cut seams:** a cut inside motion disappears when the motion carries across it: cut at the move's fastest moment, keep the
direction and speed on both sides (a pan right meets a pan right), a zoom keeps its sign (pushing stays pushing), the
subject and the eye's resting point line up within a tenth of the frame.

**Grow the next scene out of the last one:** zoom through something the eye is already on (a window, a label, a sun);
let the next scene grow out of something that just lit up (a lamp, a flare); a falling thing's dust clears into the next
place.

## One continuous move

When a film is one place and its drama is a change of scale (a climb, a build), make it one camera move through one
world: 3–4 beats inside the move (establish wide · follow · the close pass or push to the detail · pull away / reveal),
the camera flowing through the keys and never stopping. Sell it with real scale change, parallax layers (`<Parallax d>`:
front 1×, middle 0.5×, back 0.2×), a foreground object wiping the lens at the closest moment, and a little drift.

## Choosing

- Spend the big ones once: dolly zoom, freeze frame, smash cut, speed ramp.
- Consecutive shots differ in move, size or direction while the film keeps one visual language.
- A transition used as decoration weakens the film; it belongs to the idea (dissolve = time, whip = energy, match = connection).
