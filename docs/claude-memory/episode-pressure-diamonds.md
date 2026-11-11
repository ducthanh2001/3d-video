---
name: episode-pressure-diamonds
description: "\"Pressure makes diamonds.\" episode (2026-11-12): final structure, files, what the user approved; film rendered, thumbnail + parts not done yet"
metadata:
  node_type: memory
  type: project
  originSessionId: 4003487e-6bb2-4bd6-a79d-aff6156d16a5
  modified: 2026-11-11T17:33:38.730Z
---

Approved after many rounds (script v6.2 in video-ai/SCRIPT-pressure-makes-diamonds.md). Two lanes all film:
top "Avoids pressure" / bottom "Trains under it"; human scenes alternate with object-only scenes, 32 s:
1 penalty (practice 10/10 empty goal vs 4/10 real keeper → final 0–0 90+4', over the bar / GOAL) · 2 coal under the press
(pillow EASY vs blocks KEEPER/TIMER/HECKLERS → crumbled coal / diamond) · 3 exam (easy set vs timed hard set → ANSWERED
3/20 vs 18/20 → grades 52/94) · 4 anvil (NO HITS → RUSTED vs HITS 48 → SHARP) · 5 interview (couch "Tell me about yourself."
vs mock panel "Your biggest failure?" → "Um..." vs HIRED stamp) · 6 end: coal vs diamond in the hand, "Pressure makes
diamonds. / Train under it."

Files: src/episodes/pressure/Frames3.tsx (approved stills, every lane exported, takes animation props), Film.tsx +
events.ts (PressureFilm), audio/make_audio_pressure.py (heartbeat silence before the final kick, drop on the GOAL).
Output: out/pressure_film/pressure_final.mp4, pressure_sfx-only.mp4, youtube-text.txt; approved stills out/pressure3/01..13.
Older drafts (Frames.tsx one-lane boxes, Frames2.tsx v5) are kept in code only.

**Why:** the user rejected one-lane ideas (demons, boxes) as unclear and asked to come back to the competitor's labelled-pair format.
**How to apply:** next steps are a thumbnail (10/10 vs 4/10 "WHO SCORES?") and 15 s parts when the user asks; see
[[object-scene-rules]], [[scene-drawing-lessons]].
