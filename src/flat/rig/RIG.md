# Rig of the action characters (src/flat/rig)

- Units: character units, feet at y = 0, **y grows down**, +x = the way the figure faces. Greeks are drawn facing right; Persians use the same
  poses with `flip` (so every clip works for every character). Standard figure = 600 units tall, head circle r = 120 (40 %).
- Joints (same names for everyone): `hip`, `torso`, `head`, `shoulderL/R`, `elbowL/R`, `handL/R`, `hipL/R`, `kneeL/R`, `footL/R`,
  attachment points `weaponGrip` (= far hand R) and `shieldGrip` (= near hand L). L = near side (shield arm), R = far side (weapon arm).
- Bones are fixed (`BONES` in rig.ts: legs 75 + 75, arms 80 + 82). A character's `size` scales the whole figure; proportions stay equal, so a clip fits all.
- `RigPose` gives WORLD targets for hands and feet, a hip position and a lean angle; `solve()` returns elbows and knees from the 2-bone IK
  (`ik2`). Feet are planted by giving the same world foot target in consecutive frames (foot lock); only the hip moves.
- `lerpPose(a, b, t)` blends two poses. Clips (src/flat/motion, not written yet) are lists of poses at frames with contact frames.
- A new character = a `FigSpec` (colours, helmet, shield, weapon): see src/flat/characters/thermo.tsx. Nothing else.
