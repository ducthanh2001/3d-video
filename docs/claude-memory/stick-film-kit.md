---
name: stick-film-kit
description: Where the stick-figure motivational-short kit lives (video-ai/src/kit) and what style target it matches
metadata:
  node_type: memory
  type: project
  originSessionId: 4003487e-6bb2-4bd6-a79d-aff6156d16a5
  modified: 2026-11-06T04:25:10.516Z
---

On 2026-11-06 a reusable kit for dark stick-figure motivational shorts was built in the Remotion project
`C:\Users\pc\Documents\thanh\video-ai\src\kit` (hero + pose library, materials, props, animals, crowds, fx, dynamic camera),
with compositions `KitSheet` (approval stills) and `KitShowcase` (45.7 s demo) registered in `src/Root.tsx`. Docs: `src/kit/README.md`.

**Why:** the user wants shorts that match the look and smoothness of the YouTube channel @SimplyAnimatedVisuals (white outlined
stick figures, dark textured 3D-ish sets, one accent colour, camera bursts). Reference shorts were downloaded only for private study
(scratchpad); never re-upload or copy their shots/scripts.

**How to apply:** for new videos in that style, build scenes from `src/kit` (see `src/kit/demo/s*.tsx` as examples) instead of
writing new drawing code; the older `src/series2` / `src/tests/stick` code is the predecessor. The user writes in Vietnamese.
