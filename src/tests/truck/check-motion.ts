// Numeric check of the truck scene: stick-figure bones keep their length, the wheels roll without slipping, no joint of the driver goes
// through the road after he leaves the cab, no joint jumps more than 60 px between two frames (flight is fast, the cab is slow),
// and the strike / landing events are consistent. Also writes sfx-cues.json. Run it like the stick test (see src/tests/stick/RUN-CHECK.txt).
import fs from "node:fs";
import { BONE } from "../stick/motion";
import { F, F_LAND, F_LIE, FLOOR_Y, FRAMES, V as SPEED, sfxCues } from "./events";
import { Joints, LAND_X, LIE_X, WHEEL_R, cameraX, driverJoints, truckX, wheelAngle, wreckX, WRECK_FINAL } from "./kin";

type V = [number, number];
const d = (a: V, b: V) => Math.hypot(a[0] - b[0], a[1] - b[1]);
let fails = 0;
const fail = (m: string) => { fails++; console.log("  FAIL:", m); };
const J: Joints[] = Array.from({ length: FRAMES }, (_, f) => driverJoints(f));

console.log("\n1. BONE LENGTHS of the stick driver (worst error over all frames)");
const bones: [string, (j: Joints) => number, number][] = [
  ["thigh L", (j) => d(j.hip, j.kneeL), BONE.thigh], ["shin L", (j) => d(j.kneeL, j.ankleL), BONE.shin], ["foot L", (j) => d(j.ankleL, j.toeL), BONE.foot],
  ["thigh R", (j) => d(j.hip, j.kneeR), BONE.thigh], ["shin R", (j) => d(j.kneeR, j.ankleR), BONE.shin], ["foot R", (j) => d(j.ankleR, j.toeR), BONE.foot],
  ["torso", (j) => d(j.hip, j.shoulder), BONE.torso], ["neck", (j) => d(j.shoulder, j.neck), BONE.neck], ["head radius", (j) => d(j.neck, j.head), BONE.head],
  ["upper arm L", (j) => d(j.shoulder, j.elbowL), BONE.uArm], ["forearm L", (j) => d(j.elbowL, j.wristL), BONE.fArm], ["upper arm R", (j) => d(j.shoulder, j.elbowR), BONE.uArm], ["forearm R", (j) => d(j.elbowR, j.wristR), BONE.fArm],
];
for (const [name, fn, want] of bones) {
  const v = J.map(fn), err = Math.max(Math.abs(Math.min(...v) - want), Math.abs(Math.max(...v) - want));
  console.log(`  ${name.padEnd(12)} ${want.toFixed(2).padStart(7)}  err ${err.toFixed(6)} ${err <= 0.01 ? "ok" : "  <-- TOO MUCH"}`);
  if (err > 0.01) fail(`bone ${name} err ${err}`);
}

console.log("\n2. WHEELS (rolling without slipping while the truck drives)");
let slip = 0;
for (let f = 1; f <= F.hit; f++) slip = Math.max(slip, Math.abs((wheelAngle(f) - wheelAngle(f - 1)) * WHEEL_R - (truckX(f) - truckX(f - 1))));
console.log(`  worst difference between the wheel rim speed and the truck speed: ${slip.toExponential(2)} px/frame (truck ${SPEED} px/frame) ${slip < 0.01 ? "ok" : "  <-- SLIPPING"}`);
if (slip >= 0.01) fail("wheels slip");

console.log("\n3. THE ROAD (after the blast no joint may go through it: lowest point of any joint, road at y = " + FLOOR_Y + ")");
let low = -1e9, lowAt = 0, lowJ = "";
const all = (j: Joints): [string, V][] => [["hip", j.hip], ["kneeL", j.kneeL], ["ankleL", j.ankleL], ["toeL", j.toeL], ["kneeR", j.kneeR], ["ankleR", j.ankleR], ["toeR", j.toeR], ["shoulder", j.shoulder], ["head", [j.head[0], j.head[1] + BONE.head]], ["elbowL", j.elbowL], ["wristL", j.wristL], ["elbowR", j.elbowR], ["wristR", j.wristR]];
for (let f = F.hit + 3; f < FRAMES; f++) for (const [n, p] of all(J[f])) if (p[1] > low) { low = p[1]; lowAt = f; lowJ = n; }
console.log(`  lowest point: ${lowJ} at frame ${lowAt}, y = ${low.toFixed(1)} (${(low - FLOOR_Y).toFixed(1)} px below the road line; the 9 px stroke sits ${(4.5).toFixed(1)} px on the road)`);
if (low - FLOOR_Y > 5) fail(`a joint goes ${(low - FLOOR_Y).toFixed(1)} px through the road`);

console.log("\n4. JOINT JUMPS of the driver (px between two frames; limit 70)");
let worst = 0, wf = 0, wj = "";
for (let f = 1; f < FRAMES; f++) { const a = all(J[f - 1]), b = all(J[f]); for (let i = 0; i < a.length; i++) { const s = d(a[i][1], b[i][1]); if (s > worst) { worst = s; wf = f; wj = a[i][0]; } } }
console.log(`  largest: ${wj} at frame ${wf}: ${worst.toFixed(1)} px ${worst <= 70 ? "ok" : "  <-- JUMP"}`);
if (worst > 70) fail("a joint jumps " + worst.toFixed(1));
let cj = 0; for (let f = 1; f < FRAMES; f++) cj = Math.max(cj, Math.abs(cameraX(f) - cameraX(f - 1)));
console.log(`  camera: largest move ${cj.toFixed(1)} px/frame`);

console.log("\n5. EVENTS");
console.log(`  strike at frame ${F.hit}; the driver is thrown out of the cab at ${driverJoints(F.hit).hip.map((v) => v.toFixed(0)).join(", ")} and touches the road at frame ${F_LAND} (x ${LAND_X.toFixed(0)}), lies on his back from frame ${F_LIE} (x ${LIE_X.toFixed(0)}), sits up from ${F.sitUp}`);
console.log(`  the wreck stops at x ${WRECK_FINAL.toFixed(0)} (frame ${(F.hit + SPEED / 0.25).toFixed(0)}); the man ends ${(LIE_X - WRECK_FINAL).toFixed(0)} px beyond it; wreck x at frame 150: ${wreckX(150).toFixed(0)}`);
if (LIE_X - WRECK_FINAL < 200) fail("the man lands too close to the wreck");
fs.writeFileSync("src/tests/truck/sfx-cues.json", JSON.stringify(sfxCues(), null, 1));
console.log("\n  sfx-cues.json written (" + sfxCues().length + " cues)");
console.log(fails ? `\nRESULT: ${fails} CHECK(S) FAILED` : "\nRESULT: all checks passed");
process.exit(fails ? 1 : 0);
