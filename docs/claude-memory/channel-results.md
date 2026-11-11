---
name: channel-results
description: "Performance of the user's own shorts (what worked) — use to steer the next scripts"
metadata:
  node_type: memory
  type: project
  originSessionId: 4003487e-6bb2-4bd6-a79d-aff6156d16a5
  modified: 2026-11-08T16:11:03.974Z
---

"SAME HOURS" (src/episodes/samehours, 34.2 s, 5 vignettes, bold pictogram style, own phonk score) reached ~16k views and ~70% retention
within a day (reported 2026-11-07); "1% better/worse" (truths) ~1.8k. Title "Same hours. Different results.", thumbnail E (text kept in
the grid safe zone: the channel grid crops ~150 px top and bottom of a 9:16 thumb).
Competitor theme medians (171 shorts): prove-them/haters/silence 3.9M (best), you-vs-you/past/proud 0.93M, patience/growth 0.76M,
discipline 0.42M, failure 0.29M, generic action/work ~0.17M; abstract titles ("Stoicism", "Change your mindset") flop (<10k).

User rejected "BEAT YESTERDAY" frames twice ("ảnh không hợp lí"): abstract labelled metaphors (giant "chapter 20" book, names on a
wall, mirror hallway) need reading. Rule: if a frame needs a label to be understood, redesign it with a real object + real action
(alarm/snooze, shoes in the rain, dusty book, mirror). YouTube's biggest motivational animations are relatable one-person daily
moments: THE CHOICE 26M, "I'll Start Tomorrow" 9M, DISCIPLINE (Day One Films) 5.9M, Procrastination 2.7-4.4M.

TOMORROW episode (2026-11-07): the user also rejected "room" scenes (bed, shelves, calendars, windows = too busy) and a script built
on one activity (running only). What they approved direction-wise = competitor grammar: one ground line + ONE object per lane that
TRANSFORMS (word blocks as objects, growing dumbbell row, filling $1 jar, book-as-coaster vs book stack), a different object per vignette.
The user then insisted: KEEP the TOMORROW theme (don't switch topic), and build each vignette on a competitor STRUCTURE (see
[[competitor-visual-grammar]]) with our own idea → v7 (src/episodes/tomorrow/V7Frames.tsx): note tower reveal, 3-row dominoes,
same barbell heavier-by-waiting, day machine, week/month/year. Books are already used in earlier episodes: avoid.

"LET THEM LAUGH" (src/episodes/laugh, 35.5 s, one-lane story-with-twist vignettes, posted 2026-11-07) flopped vs SAME HOURS:
1,188 views, the feed stopped pushing after ~2.5 h; stayed-to-watch 40.4% / swiped away 59.6%; avg view duration 0:22.
Diagnosis: the opening second was a dark wall with a tiny figure and a slowly drawn stroke — no instant contrast, no lane labels;
the swipe-away rate killed distribution. Lesson: frame 0 must already show the two-lane labelled contrast (as SAME HOURS did),
big bright subject, motion on frame 0; keep twists INSIDE that format rather than replacing it.

"PROVE IT TO YOURSELF" (src/episodes/prove, 34.2 s, posted 2026-11-08) also underperformed: ~1.4k views, stayed-to-watch 46%,
avg view 0:22, ~600 engaged views. The user's read: new viewers did not understand the first image and left. Diagnosis: frame 0
was a METAPHOR (a man polishing a rocket labelled MY IDEA vs a rocket exploding, lanes "Waits for perfect / Launches anyway")
that needs decoding. SAME HOURS opened on a LITERAL everyday contrast (Scrolling on a phone vs Building with bricks).
Rule now: the hook frame must be literal and relatable (phone, bed, sofa, alarm, food…) with plain lane labels; metaphors only
from the 2nd vignette on, once the viewer is in.

"YOU'RE CLOSER THAN YOU THINK. DON'T QUIT." (TRUST, src/episodes/trust, 40.6 s, posted 2026-11-09): 2,346 views in 24 h,
the feed stopped pushing at ~13 h; stayed-to-watch 62.3% / swiped 37.7%; avg view 0:27 (≈66% of 40.6 s); +2 subs; 96% Shorts feed.
Better than PROVE/LAUGH, far from SAME HOURS. Diagnosis: too long (40.6 s vs their 31–36), ONE story frame (mountain) with
7-s chapters whose payoff arrives late (the answer at 34 s), dark frame 0 with small figures, punch lines only at the END of
each scene (theirs: a one-line statement header on screen from the vignette's first frame), nothing for the viewer to project
on (no YOU) and no series identity → almost no subs.

"DO IT UNTIL IT'S DONE." (src/episodes/done, 33 s, posted 2026-11-10, the best animation/acting so far: KO → ◀◀ snooze/5 AM
lanes → shields in an arrow storm → hurdles fall-and-finish → tall climbing wall → trophy) FLOPPED: ~24 h, 254 engaged views,
stayed-to-watch 35.2% / swiped 64.8% (worst yet), avg view 0:19. Lesson: better acting does not save a weak frame 0. Frame 0 was a
wide, busy arena (crowd, three small figures, a small "WHAT THEY SEE." header) with NO labelled contrast and no open question;
the ◀◀ "4 years earlier" needs decoding. The two hooks that worked (SAME HOURS 70%, TRUST 62%) both opened on big labelled
figures doing a literal everyday task. Rule reinforced: frame 0 = two plain labels + big figures + one literal action, readable
at thumbnail size in 1 s; spectacle (arenas, battles) only after the hook.

**Why:** the user wants each next episode to grow views; this is the proven recipe.
**How to apply:** keep the SAME HOURS format (5 two-lane vignettes, ~33 s, one camera reveal, gold payoff at the end); prefer
high-median themes; see [[competitor-format]] for ideas already used and [[stick-film-kit]] for the toolkit.

2026-11-12: WORK SMART (lever/escalator/paint/maze/dominoes) 61.4% stayed, avg 0:24 of 0:34, ~1.1k views in 22 h (~2k later).
Retention after the first second is fine; the gap to SAME HOURS (70% stayed, 16k) is the first second, so fix frame 0 + title.
