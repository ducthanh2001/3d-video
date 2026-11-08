---
name: style-bw-one-accent
description: "The channel's visual style rule: black & white dominant + gold for success, plus a few MEANINGFUL accent colours (since 2026-11-08); no all-over coloured mood palette"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 4003487e-6bb2-4bd6-a79d-aff6156d16a5
  modified: 2026-11-08T04:05:17.320Z
---

Every frame is dominantly black & white (white/grey figures, grey props and rooms). Gold = success/progress/what you build.
Since 2026-11-08 the user also allows OTHER colours when they carry meaning, used sparingly as accents: red = alarm digits,
warning, fail; green = growth/progress ticks; phone-screen blue glow = distraction; warm lamp light. Not allowed: a whole scene
tinted in colour (blue walls, brown wood, blue blankets — the "muted" palette of LookTestMuted was NOT chosen).

**Why:** the user corrected all-colour frames twice ("lại không đúng style đen trắng của tôi rồi", 2026-11-07), then after the
B&W vs muted look test said: "tôi vẫn giữ đen trắng và chủ đạo và + thêm màu phù hợp khác" (2026-11-08).
**How to apply:** start from the "bw" palette of src/episodes/look/BedroomTest.tsx; add a colour only where it means something;
see [[competitor-visual-grammar]] and [[channel-results]].
