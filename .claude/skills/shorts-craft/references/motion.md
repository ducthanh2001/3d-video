# Motion inside the frame (figures, objects, counters, text)

Adapted from cinecode `references/motion.md` (MIT, Sarp Yildiz) for 30 fps and this kit (`Hero`, `POSES`, `mixPose`,
`reach`, `J`, `walk`/`run`/`climb`, `src/kit/motion.ts`). Most "made by a computer" motion comes from four habits:
everything moves at once, moves run at constant speed, things start and stop dead, and every part stops on the same frame.

## 1. Order

- **One lead per moment.** The hero of the beat makes the biggest or first move; supporting things move less, later, smaller.
- **Lead or reveal:** the hero moves first and the context answers, or the context settles and the hero arrives 3–6 frames later.
- **Cause before effect:** the hand before the cup, the axe before the chips, the log before the flare. Reactions 2–4 frames later, never on the same frame.
- **One trigger, one start:** things reacting to one event start within one frame of each other and move away from it.
- **A third at a time:** with three or more movers, about a third make their main move together (staggered rows: `stagger`).

## 2. Timing (30 fps)

| What moves | Duration |
|---|---|
| a small accent (tick, blink, badge, counter digit) | 4–6 f |
| a label, card or word entering | 8–12 f |
| an object crossing part of the frame | 15–30 f |
| something large, heavy, solemn (a car, a falling tree) | 25–45 f |
| ambient life (breath, flicker, sway, snow) | 2–20 s loops |

- Twice the distance ≈ 1.3× the time; across the whole frame 1.8–2×.
- **Weight is timing:** heavy starts slowly and stops firmly; light starts quickly and drifts in. `WEIGHT`: metal 1.2×, rubber 0.8× (15–25% overshoot), water 1.5×, paper 1.0× (3–5%), smoke 2×, glass 0.9×.
- **Exits are 65–75% of entrances.**
- **Hold after a landing:** 4–6 frames of stillness (only ambient life) before the next main move.
- **Effortful progress is stepped:** pushing a car, climbing a fixed rope, hauling: move during part of each count, rest in the rest (`stepped(n)`), feet planted while the body moves.

## 3. Easing

- Entrances ease out, exits ease in, moves within the frame ease in and out, loops use a sine.
- **Linear only for machines** (a clock hand, a conveyor, a progress bar, a drift). A living, thrown or falling thing never moves linearly.
- **No pops:** every start eases or anticipates, every stop settles — unless it is a hard hit on purpose.
- One easing family per group; only start times differ.

## 4. The principles that remove stiffness

| Principle | Do | Numbers / helper |
|---|---|---|
| Anticipation | a small move the opposite way first (a wind-up before an axe stroke, a crouch before a jump) | 10–20% of the move, 3–6 f · `anticipate(t)` |
| Follow-through & overlap | parts hanging off a body (a flag, a backpack, a rope, hair, a cable) start after it and stop after it | start 1–4 f later, stop 2–5 f later · `lagged(f, 3)` |
| Secondary action | a smaller reaction supporting the main one (dust after a step, chips after a hit, a flare after a log) | 30–50% of the main move's size, 1–2 f after |
| Arcs | living things travel on curves (a thrown log, an arm, a head turn) | bow 5–20% · `arc(a, b, t, 0.12)` |
| Squash & stretch | only in a cartoon moment; never on realistic objects | — |
| Overshoot by tone | realistic 0% · calm 2–5% · accent 5–10% · playful 15–25% (once) | `springF(f, f0, SPRING.lively, 2)` |
| Counter-motion | the background answers the hero by 20–30% the other way; parallax layers 1× / 0.5× / 0.2× | `<Parallax d>` |
| Ambient life | in a held shot something small keeps moving | breath (hip ±1.5), snow, flicker, sway; slow, near the edges |

## 5. Springs in words (`spring`, `springF`)

firm 1.0 (none, weight, realism) · soft 0.8 (~1.5%) · lively 0.7 (~5%, labels, cards, counters) · bouncy 0.5 (~16%) ·
elastic 0.4 (~25%, one punchline) · rubber 0.3 (cartoon, once). 1–1.5 Hz big, 2–3 Hz standard, 4+ Hz snappy.
Settles in ≈ 0.64 / (zeta × hz) s.

## 6. Stagger (`stagger`)

1 f tight (letters, particles) · 2–3 f standard (rows, icons, a crowd sitting down) · 3–5 f dramatic. A set finishes within
~0.5 s unless the build is the action. Reading order for words; centre-out for a burst; reverse for exits.

## 7. Figures (this kit)

- **Contact is truth:** hands are placed with `reach()` onto the object's real points (a car's boot, a rope, an axe handle),
  and the object is drawn FROM the solved hands (`J(...).wN / wF`), never the other way round.
- **Feet:** a standing or pushing figure's feet sit on the ground line of its slope (foot y = foot x × slope); walking uses
  `walk(phase)` with the phase driven by distance travelled, so feet do not slide.
- **The eyes lead:** the head turns toward the next thing a few frames before the body.
- **Hold a reaction 0.5–1 s** before the next action (a man sits down, then the next line).
- **Tools in profile:** an axe, a hammer, a shovel read only from the side of their head; choose strokes where that profile
  shows (a downward felling stroke), not ones that show the tool edge-on.
- **A sitting figure on a slope** sits in the snow with legs down the fall line, never on an invisible chair.

## 8. On the beat

The landing (contact, the end of the ease) is the frame on the beat: the move starts its own duration before the cue and
the wind-up earlier still (`startFor(cueF, moveF, windUpF)`). Sound hits (`make_audio_*.py`) go on the contact frame.

## 9. Review on strips

For each key move render 6–12 frames across it and check: one lead, found within half a second · cause before effect ·
no equal gaps on a living move · no pops · contact frames correct · the landing on the cue · a 4–6 f hold after it.
