---
name: realistic-objects
description: "User rule for every generated frame - objects and settings must look real and physically believable (real proportions, real construction details), not icons"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 4003487e-6bb2-4bd6-a79d-aff6156d16a5
  modified: 2026-11-08T17:05:57.417Z
---

Every frame must show figures and objects that look REAL and physically believable — the user asked (2026-11-08) to
remember this for all future image generation. Corrections that led to it: car smaller than the man (→ realistic sedan,
larger than the person), hill too gentle to show effort (→ ~23° asphalt road with lane marks, guard rail, earth strata),
escalator a plain band (→ 30° escalator with treaded steps, glass balustrade, rubber handrail, truss, landings),
abstract "IMPOSSIBLE" bar-chart stairs not understood (→ chopping a real tree with an axe).

**Why:** viewers must read the scene instantly; icon-like or wrongly scaled objects look fake and confuse, and the effort
only reads when the obstacle looks physically heavy/steep.

**How to apply:**
- Real-world scale between figure and object (car ≈ 2.5× a person long, axe handle ≈ half a person, tree ≫ person).
- Draw the construction details people recognise: bark + root flare + layered crown with leaf texture; wheels/rims/windows/
  lights on cars; steps/handrail/glass on escalators; wood-handle + steel head on tools; ground with texture, background depth.
- Physics must be right: hands touch what they push/hold, objects rest on surfaces, slopes steep enough to show effort,
  things fall the way they really would.
- Show effort on the body: deep lean, braced feet, sweat, dust, chips.
- Prefer a literal real-world task over an abstract/metaphor object (bars, charts, labelled blocks).
- Natural objects keep their natural colour when realism needs it (user 2026-11-09: green leaves, brown bark and
  wooden boat/dock); figures and background stay B&W, gold = success, red = failure.
- The scene must carry the message literally (escalator "standing still = going backwards" was rejected as off-message;
  rowing blind in fog → shore 20 m away hidden = "trust the process" was the fix).
- Otherwise B&W dominant with meaningful accents — see [[style-bw-one-accent]], [[action-with-object]].
