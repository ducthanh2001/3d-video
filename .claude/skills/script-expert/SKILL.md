---
name: script-expert
description: >-
  Script writer and script reviewer for this channel's wordless motivational Shorts (US audience): finds the angle, makes the
  idea sticky (SUCCESs) and shareable (STEPPS), writes the beat table and every on-screen word, then runs an anti-AI pass so
  captions, speech bubbles, titles, descriptions and pinned comments do not read as machine-written, and scores the result.
  Use whenever a new script, title list, caption, speech bubble, title, description or pinned comment is written or revised,
  when the user says "viết kịch bản", "duyệt / review / check kịch bản", "giống AI quá", "nghe máy móc", "kịch bản chưa hay",
  "tiêu đề", "mô tả", or asks for the next episode ideas. Works together with shorts-craft (camera, motion, acting) and the
  user-level review-kich-ban scorecard.
---

# script-expert

A Short has room for one idea and about 25 words on screen. This skill writes those words and checks them. It combines:
- the channel's own rules (docs/claude-memory and `shorts-craft/references/writing.md`),
- anti-AI writing rules adapted from **stop-slop** (Hardik Pandya, MIT) and **humanizer** (Siqi Chen, MIT),
- sticky and shareable idea frameworks adapted from **wondelai/skills** `made-to-stick` and `contagious` (Wondel.ai, MIT).

Licenses are in `licenses/`. No file from those repos is installed as-is; everything here is rewritten for wordless Shorts.

| When | Open |
|---|---|
| choosing the idea, the angle, the hook question, the twist | `references/sticky-shareable.md` |
| writing or checking any words (captions, bubbles, labels, title, description, pinned comment) | `references/anti-ai.md` |
| giving the user the review | `references/review-template.md` |

## The channel rules come first

These rules win over anything in the references:
1. **Frame 0 is literal and readable in one second** on a phone: a big figure acting on a real object, a label, a question.
2. **Real objects, real physics, visible effort.** No magic transformations. No drawn faces; feeling comes from the body.
3. **The film owes one question** set at frame 0 and answered by the last image.
4. **One twist per vignette before second 4.** A reveal, a counter that jumps, or a real object that turns out different.
5. **B&W dominant; gold = success, red = failure.**
6. Ideas the competitors already used are out (memory: competitor-format, competitor-hooks).

## Workflow (do every step, in order)

1. **Brief in one line:** who the viewer is, what they feel now, the one idea, the title promise.
2. **Diverge:** write 10 angles. Drop the first 3 (they are what anyone writes) and any already used by competitors or by
   the channel. Keep 3 that are surprising and true.
3. **Sticky check** (`sticky-shareable.md`): score the chosen angle on SUCCESs. If Simple, Concrete or Unexpected scores
   below 7, change the angle before writing scenes.
4. **Shareable check:** name the STEPPS drivers the film uses (at least two strong ones; Emotion with high arousal is
   required: awe, tension, relief, anger at an injustice; never only sad).
5. **Write the ending first:** the last image and the last line. Then the hook that sets up what the ending needs.
6. **Beat table:** each scene gets Before (the easy choice looks better) / After (the cost or the twist), the object,
   the action, the counter and the on-screen words.
7. **Anti-AI pass** (`anti-ai.md`) on every word, including the title, description and pinned comment.
8. **Cold-viewer pass:** sound off, no context. Can a stranger say what happened in one sentence? Does every effect have
   a cause they saw?
9. **Score and report** (`review-template.md`). Fix every item below the bar and re-score. Ship only PASS.

## Hard limits on words (wordless Shorts)

- On-screen card ≤ 6 words. Hook question ≤ 9 words. A speech bubble ≤ 5 words.
- One idea per line; the second line of a two-line punch is the shorter one.
- About 25 words on screen for the whole film, labels included.
- No em or en dash anywhere in the film or the title. No more than one exclamation mark in the whole film.
- Title ≤ 60 characters, a plain rule the viewer already half-believes, or a number or contrast.
- Thumbnail text differs from the title.
