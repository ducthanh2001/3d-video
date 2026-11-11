---
name: shorts-craft-skill
description: "Project skill video-ai/.claude/skills/shorts-craft (camera, motion, anti-AI writing rules adapted from cinecode) + src/kit/motion.ts helpers; read it before writing scripts or animating scenes"
metadata:
  node_type: memory
  type: reference
  originSessionId: 4003487e-6bb2-4bd6-a79d-aff6156d16a5
  modified: 2026-11-09T15:54:55.924Z
---

`video-ai/.claude/skills/shorts-craft/` (added 2026-11-09 at the user's request): SKILL.md + references/camera.md,
motion.md, writing.md, adapted from github.com/sarpstar/cinecode (MIT; LICENSE-cinecode.txt kept). cinecode itself was
NOT installed: its SKILL.md adds UserPromptSubmit/PreToolUse/Stop hooks that enforce its own HTML/three.js pipeline.
Helpers in `src/kit/motion.ts` (exported from src/kit): inertia, spring/springF + SPRING, anticipate, stagger, arc,
lagged, startFor, WEIGHT, stepped.

2026-11-10: added references/acting.md (frame study of competitor EQhrPwTjhBI "One decision can change your life";
frames kept only in out/_ref/acting_EQhrPwTjhBI, never in the skill because the repo is pushed) + src/kit/acting.ts
(EMOTE poses, act() pose-to-pose with holds, smearFrames) + ActingSheet composition. The user wants every frame to have
"soul": readable held emotion poses, failure as a sequence, a reacting bystander.

**How to apply:** sessions often start in ai-gen-video-history, where the project skill does not auto-load: open the
references by path before writing a script/captions (writing.md) or building/fixing camera moves and figure motion
(camera.md, motion.md). Channel rules in [[competitor-top4-breakdown]], [[realistic-objects]], [[action-with-object]]
still win over the references.
