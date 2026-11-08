// Numeric motion check of the stick-figure clip (step 6 of the prompt). It prints tables and exits with an error if anything fails:
//  1. every bone keeps its length (tolerance 0.01 px) in all 180 frames
//  2. a planted foot moves less than 0.5 px / frame in x (no sliding)
//  3. no leg is ever asked to reach farther than thigh + shin - 2 px
//  4. no joint jumps more than 40 px from one frame to the next (world and screen)
//  5. the contact table of the prompt is met exactly (frame, foot, x)
// Run: node <bundle>   (bundled with esbuild: see the command in RUN-CHECK.txt)
import fs from "node:fs";
import path from "node:path";
import { CONTACTS, FRAMES, SHAKES, sfxCues } from "./events";
import { BONE, REACH, Frame, cameraX, footAt, frameJoints, hipH, hipX } from "./motion";

type V = [number, number];
const d = (a: V, b: V) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const frames: Frame[] = Array.from({ length: FRAMES }, (_, f) => frameJoints(f));
let fails = 0;
const fail = (msg: string) => { fails++; console.log("  FAIL:", msg); };

// ---- 1. bone lengths
const bones: [string, (q: Frame) => number, number][] = [
  ["thigh L", (q) => d(q.hip, q.kneeL), BONE.thigh], ["shin L", (q) => d(q.kneeL, q.ankleL), BONE.shin], ["foot L", (q) => d(q.ankleL, q.toeL), BONE.foot],
  ["thigh R", (q) => d(q.hip, q.kneeR), BONE.thigh], ["shin R", (q) => d(q.kneeR, q.ankleR), BONE.shin], ["foot R", (q) => d(q.ankleR, q.toeR), BONE.foot],
  ["torso", (q) => d(q.hip, q.shoulder), BONE.torso], ["neck", (q) => d(q.shoulder, q.neck), BONE.neck], ["head radius", (q) => d(q.neck, q.head), BONE.head],
  ["upper arm L", (q) => d(q.shoulder, q.elbowL), BONE.uArm], ["forearm L", (q) => d(q.elbowL, q.wristL), BONE.fArm],
  ["upper arm R", (q) => d(q.shoulder, q.elbowR), BONE.uArm], ["forearm R", (q) => d(q.elbowR, q.wristR), BONE.fArm],
];
console.log("\n1. BONE LENGTHS (target, min, max, worst error over 180 frames)");
for (const [name, fn, want] of bones) {
  const v = frames.map(fn), mn = Math.min(...v), mx = Math.max(...v), err = Math.max(Math.abs(mn - want), Math.abs(mx - want));
  console.log(`  ${name.padEnd(12)} ${want.toFixed(2).padStart(7)}  min ${mn.toFixed(4)}  max ${mx.toFixed(4)}  err ${err.toFixed(5)} ${err <= 0.01 ? "ok" : "  <-- TOO MUCH"}`);
  if (err > 0.01) fail(`bone ${name} changes length by ${err.toFixed(4)} px`);
}

// ---- 2. foot slide
console.log("\n2. PLANTED FEET (max x speed while on the ground, px/frame; limit 0.5)");
for (const foot of ["L", "R"] as const) {
  let worst = 0, at = -1, planted = 0;
  for (let f = 1; f < FRAMES; f++) {
    const a = footAt(foot, f - 1), b = footAt(foot, f);
    if (a.pinned && b.pinned) { planted++; const v = Math.abs(b.x - a.x); if (v > worst) { worst = v; at = f; } }
  }
  console.log(`  foot ${foot}: ${planted} planted frames, worst speed ${worst.toFixed(4)} (frame ${at}) ${worst < 0.5 ? "ok" : "  <-- SLIDING"}`);
  if (worst >= 0.5) fail(`foot ${foot} slides ${worst.toFixed(3)} px/frame at frame ${at}`);
}

// ---- 3. IK reach
console.log("\n3. LEG REACH (hip to ankle; limit thigh + shin - 2 = " + REACH + " px)");
let maxReach = 0, maxAt = 0;
for (const q of frames) for (const dist of [q.legDistL, q.legDistR]) if (dist > maxReach) { maxReach = dist; maxAt = q.f; }
console.log(`  longest reach ${maxReach.toFixed(3)} px at frame ${maxAt}, lowest hip ${Math.min(...frames.map((q) => hipH(q.f))).toFixed(1)} px above the ankle plane`);
if (maxReach > REACH + 1e-6) fail(`a leg reaches ${maxReach.toFixed(3)} px (> ${REACH})`);

// ---- 4. jumps
console.log("\n4. JOINT JUMPS (largest move between two frames, px; limit 40)");
const joints: [string, (q: Frame) => V][] = [["hip", (q) => q.hip], ["knee L", (q) => q.kneeL], ["knee R", (q) => q.kneeR], ["ankle L", (q) => q.ankleL], ["ankle R", (q) => q.ankleR], ["toe L", (q) => q.toeL], ["toe R", (q) => q.toeR], ["shoulder", (q) => q.shoulder], ["head", (q) => q.head], ["elbow L", (q) => q.elbowL], ["wrist L", (q) => q.wristL], ["elbow R", (q) => q.elbowR], ["wrist R", (q) => q.wristR]];
for (const [name, fn] of joints) {
  let wj = 0, wf = 0, sj = 0, sf = 0;
  for (let f = 1; f < FRAMES; f++) {
    const a = fn(frames[f - 1]), b = fn(frames[f]);
    const w = d(a, b);
    const sa: V = [a[0] - cameraX(f - 1), a[1]], sb: V = [b[0] - cameraX(f), b[1]]; // screen motion WITHOUT the deliberate 7-frame impact shake
    const s = d(sa, sb);
    if (w > wj) { wj = w; wf = f; }
    if (s > sj) { sj = s; sf = f; }
  }
  console.log(`  ${name.padEnd(9)} world ${wj.toFixed(1).padStart(5)} (frame ${String(wf).padStart(3)})   screen ${sj.toFixed(1).padStart(5)} (frame ${String(sf).padStart(3)}) ${wj <= 40 && sj <= 40 ? "ok" : "  <-- JUMP"}`);
  if (wj > 40 || sj > 40) fail(`${name} jumps ${Math.max(wj, sj).toFixed(1)} px`);
}

// ---- 5. the contact table
console.log("\n5. CONTACTS (table of the prompt vs the clip)");
console.log("   #  frame foot  table x  clip x  height  planted  note");
for (const c of CONTACTS) {
  const s = footAt(c.foot, c.f), prev = footAt(c.foot, c.f - 1), ok = Math.abs(s.x - c.x) < 0.01 && s.pinned && s.y === 0;
  console.log(`  ${String(c.n).padStart(2)}  ${String(c.f).padStart(4)}   ${c.foot}   ${String(c.x).padStart(6)}  ${s.x.toFixed(2).padStart(7)}  ${s.y.toFixed(1).padStart(5)}  ${s.pinned ? "yes" : "NO "}      ${prev.pinned ? "(was planted)" : ""} ${ok ? "ok" : "<-- MISMATCH"} ${c.note}`);
  if (!ok) fail(`contact ${c.n} does not land at frame ${c.f} / x ${c.x}`);
}
const f0 = frames[0];
console.log(`\n   frame 0: left foot ${f0.footL.pinned ? "planted" : "swinging"} at x ${f0.footL.x.toFixed(1)}, right foot ${f0.footR.pinned ? "planted" : "swinging"} at x ${f0.footR.x.toFixed(1)}`);
if (f0.footL.pinned || !f0.footR.pinned || Math.abs(f0.footR.x) > 1e-6) fail("frame 0 must be mid-stride: left swinging, right planted at x = 0");
console.log("   shakes:", SHAKES.map(([f, a]) => `frame ${f}: ${a} px`).join(", "));
console.log("   camera x at frames 0/72/86/111/171:", [0, 72, 86, 111, 171].map((f) => cameraX(f).toFixed(1)).join(" / "), " hip x:", [0, 72, 86, 111, 171].map((f) => hipX(f).toFixed(1)).join(" / "));
console.log("   torso lean (deg) at 72/75/80/84/90/96/102/108/111:", [72, 75, 80, 84, 90, 96, 102, 108, 111].map((f) => frames[f].leanDeg.toFixed(1)).join(" / "));

// knee flexion of the catch step (frame 88): angle between the thigh and shin, 0 = straight leg
const kneeFlex = (q: Frame, side: "L" | "R") => { const k = side === "L" ? q.kneeL : q.kneeR, a = side === "L" ? q.ankleL : q.ankleR; const v1: V = [q.hip[0] - k[0], q.hip[1] - k[1]], v2: V = [a[0] - k[0], a[1] - k[1]]; const cos = (v1[0] * v2[0] + v1[1] * v2[1]) / (Math.hypot(...v1) * Math.hypot(...v2)); return 180 - (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI; };
console.log(`   knee flexion at frame 88: right (the catch step) ${kneeFlex(frames[88], "R").toFixed(0)} deg, left (trapped) ${kneeFlex(frames[88], "L").toFixed(0)} deg; at frame 40 (walking) ${kneeFlex(frames[40], "L").toFixed(0)} / ${kneeFlex(frames[40], "R").toFixed(0)} deg`);

const out = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "sfx-cues.json");
try { fs.writeFileSync(path.resolve(process.cwd(), "src/tests/stick/sfx-cues.json"), JSON.stringify(sfxCues(), null, 1)); console.log("\n   sfx-cues.json written (" + sfxCues().length + " cues)"); } catch { console.log("\n   (could not write sfx-cues.json to", out + ")"); }
console.log(fails ? `\nRESULT: ${fails} CHECK(S) FAILED` : "\nRESULT: all checks passed");
process.exit(fails ? 1 : 0);
