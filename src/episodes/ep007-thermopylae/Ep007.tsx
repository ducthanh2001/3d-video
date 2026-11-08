// "300 Spartans Held Off a MILLION Persians? Real or Myth?": flat 2D short (1080x1920, 30 fps, 1282 frames). Scenes are picked by the
// sentence-start frames in events.ts; every beat (shield lock, thrusts, stamp, meter, chips, shake, sound) reads the SAME event frame.
// Greeks face right, Persians left (same clips, flipped). Text stays out of the bottom 20 % and right 12 %.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Pip } from "../../flat/characters/pip";
import { EPHIALTES, GREEK_GREEN, GUARD, Hoplite, LEONIDAS_ORDER, PERSIAN, PERSIAN_ARCHER, PersianFig, POSES, THESPIAN, XerxesFig, spartan } from "../../flat/characters/thermo";
import { solve } from "../../flat/rig/rig";
import { MARCH_REL, eio, idleBreathe, marchCycle, pointUp, shieldBlock, shieldLock, sitThrone, spearThrust, staggerBack, staggerShift, turnHeadSurprise, waveOff } from "../../flat/motion/clips";
import { formation } from "../../flat/motion/formation";
import { lerpPose } from "../../flat/rig/rig";
import { pipTrack } from "../../flat/motion/pipPose";
import { RoomWarm } from "../../flat/props/Scenes";
import { Stamp } from "../../flat/props/Stamp";
import { MythMeter } from "../../flat/ui/MythMeter";
import { BigLine, Captions, ClueChip } from "../../flat/ui/Texts";
import { SubscribeButton } from "../../flat/ui/SubscribeButton";
import { FONT, INK, PAL } from "../../flat/style";
import { Horde, Ridge, Sky, Spark } from "./Scenes";
import { CAPTION_WORDS } from "./captions";
import { MOUTH } from "./mouth";
import { METER_KEYS, METER_SNAP, Q, TOTAL, clueAt, shakeAt } from "./events";

export const EP007_FRAMES = TOTAL;
const HIGHLIGHT = ["MILLION", "MYTH", "REAL", "SEVEN", "THOUSAND", "WAIT", "MOSTLY"];
const rnd = (i: number) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** Pip is the narrator: his mouth follows the loudness of the real voice (mouth.ts), not a fixed flap */
const talk = (f: number): number => { const m = MOUTH[Math.max(0, Math.min(MOUTH.length - 1, f))] ?? 0; return m < 0.04 ? 0 : 0.1 + 0.65 * m; };

/** slow push-in (+ a zoom around a point after a cut) and the 7-frame shakes of the events */
const Cam: React.FC<{ from: number; push?: number; zoom?: number; origin?: [number, number]; shiftY?: number; children: React.ReactNode }> = ({ from, push = 0.06, zoom = 1, origin = [540, 960], shiftY = 0, children }) => {
  const f = useCurrentFrame(), t = f - from, sh = shakeAt(f);
  const pop = t < 5 ? 1 + 0.035 * (1 - t / 5) : 1;
  return <AbsoluteFill style={{ transformOrigin: `${origin[0]}px ${origin[1]}px`, transform: `translate(${sh.dx}px, ${sh.dy + shiftY}px) scale(${zoom * (1 + (push * Math.min(t, 160)) / 160) * pop})` }}>{children}</AbsoluteFill>;
};

const Persians: React.FC<{ f: number; seed: number; drift?: number; layers: Parameters<typeof Horde>[0]["layers"] }> = ({ f, seed, drift = 0.3, layers }) => (
  <div style={{ position: "absolute", inset: 0 }}>
    {layers.map((L, i) => <div key={i} style={{ position: "absolute", inset: 0, transform: `translate(${-f * drift * (0.8 + 0.2 * i)}px, ${Math.sin((f + i * 7) * 0.32) * (2 + i * 1.5)}px)` }}><Horde seed={seed} layers={[L]} /></div>)}
  </div>
);
const HORDE_FAR = [
  { y: 1215, h: 120, n: 44, x0: 100, x1: 1180, fill: "#7a6a8c" },
  { y: 1300, h: 170, n: 28, x0: 200, x1: 1200, fill: "#5a4870" },
  { y: 1450, h: 250, n: 13, x0: 400, x1: 1220, fill: "#3a2c52" },
];

// ---- scenes (each one a function of the global frame f) --------------------------------------------------------------------------------------
/** 1 and the loop frame: a short line of red shields against a sea of Persian silhouettes */
const Hook: React.FC<{ f: number; title?: boolean }> = ({ f, title = true }) => {
  const slots = React.useMemo(() => formation(1, 9, 46, 2, 3), []);
  const pulse = f >= Q.million ? 1 + 0.14 * Math.exp(-(f - Q.million) / 5) * Math.cos((f - Q.million) * 0.9) : 1;
  return (
    <AbsoluteFill>
      <Sky stops={["#f7c98a", "#ffe3b5", "#fff0d2"]} horizon={1180} ground={["#d9b27a", "#c49a62"]} />
      <Ridge pts="0,1180 0,1000 160,940 330,1030 520,930 760,1040 1080,960 1080,1180" fill="#b8a07f" />
      <Persians f={f} seed={2} layers={HORDE_FAR} />
      {slots.map((s) => <Hoplite key={s.i} spec={spartan(s.variant)} x={80 + s.x} y={1585 + s.y} scale={0.33 * s.size} pose={idleBreathe(f, POSES.stand_firm, s.phase)} mood="fierce" blink={false} />)}
      {title && <div style={{ position: "absolute", inset: 0, transformOrigin: "50% 260px", transform: `scale(${pulse})` }}><BigLine text="300 vs 1,000,000?" at={-20} top={150} size={124} /></div>}
    </AbsoluteFill>
  );
};

/** 2: Pip steps in and holds up a hand; the REAL / MYTH stamps land */
const RealOrMyth: React.FC<{ f: number }> = ({ f }) => {
  const { fps } = useVideoConfig(), k = spring({ frame: f - Q.L2, fps, config: { damping: 14, stiffness: 110, mass: 0.9 } });
  return (
    <AbsoluteFill>
      <Hook f={Q.L2} title={false} />
      <Pip x={interpolate(k, [0, 1], [-200, 300])} y={1760} scale={0.7} poseObj={pipTrack(f, [[0, "idle"], [Q.L2 + 22, "one_finger"]])} expression="curious" mouthOpen={talk(f)} />
      <Stamp kind="REAL" x={170} y={1180} size={250} rotate={-12} at={Q.L2 + 8} plate />
      <Stamp kind="MYTH" x={880} y={1180} size={250} rotate={10} at={Q.L2 + 26} plate />
    </AbsoluteFill>
  );
};

const CountCard: React.FC<{ f: number; label: string; old: string; now: string; tOld: number; tStrike: number; top: number }> = ({ f, label, old, now, tOld, tStrike, top }) => {
  const { fps } = useVideoConfig();
  if (f < tOld) return null;
  const pop = spring({ frame: f - tOld, fps, config: { damping: 12, stiffness: 160, mass: 0.6 } });
  const strike = clamp01((f - tStrike) / 6), nk = f >= tStrike + 4 ? spring({ frame: f - tStrike - 4, fps, config: { damping: 9, stiffness: 190, mass: 0.6 } }) : 0;
  return (
    <div style={{ position: "absolute", left: 90, top, width: 770, padding: "18px 0 26px", background: PAL.paper, border: `9px solid ${INK}`, borderRadius: 36, boxShadow: "0 12px 0 rgba(27,27,47,0.35)", textAlign: "center", fontFamily: FONT, color: INK, transform: `scale(${pop})` }}>
      <div style={{ fontSize: 40, letterSpacing: 4, color: "#6b6b88" }}>{label}</div>
      <div style={{ position: "relative", display: "inline-block", fontSize: 82, color: f >= tStrike ? "#7a7a90" : INK, margin: "4px 0 2px" }}>{old}
        <div style={{ position: "absolute", left: -10, width: `calc(${strike * 100}% + 20px)`, top: "50%", height: 12, background: PAL.fail, border: `4px solid ${INK}`, borderRadius: 8, transform: "rotate(-4deg)", transformOrigin: "left center", opacity: strike > 0 ? 1 : 0 }} /></div>
      <div style={{ fontSize: 112, color: "#18a559", WebkitTextStroke: `10px ${INK}`, paintOrder: "stroke fill", lineHeight: 1.05, transform: `scale(${nk})`, opacity: nk > 0 ? 1 : 0, height: 118 }}>{now}</div>
    </div>
  );
};

/** 3: clue one: Herodotus' 2.6 million is struck out and replaced by the historians' range */
const CountP: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill>
    <Sky stops={["#f7c98a", "#ffe3b5", "#fff0d2"]} horizon={1180} ground={["#d9b27a", "#c49a62"]} />
    <Ridge pts="0,1180 0,1020 200,960 420,1040 700,950 1080,1010 1080,1180" fill="#b8a07f" />
    <Persians f={f} seed={4} drift={0.2} layers={[{ y: 1215, h: 110, n: 36, x0: 0, x1: 1200, fill: "#7a6a8c" }, { y: 1320, h: 170, n: 20, x0: 0, x1: 1220, fill: "#5a4870" }]} />
    <CountCard f={f} label="PERSIANS" old="2,600,000" now="120–300K" tOld={Q.herodotus} tStrike={Q.count_p} top={420} />
    <Pip x={170} y={1700} scale={0.62} poseObj={pipTrack(f, [[0, "hold_paper"], [Q.count_p - 2, "point"]])} expression="curious" mouthOpen={talk(f)} />
  </AbsoluteFill>
);

/** 4: clue two: 300 shields, then thousands of blue and gold dots gather around them */
const CountG: React.FC<{ f: number }> = ({ f }) => {
  const slots = React.useMemo(() => formation(2, 8, 50, 2, 9), []);
  const n = Math.floor(interpolate(f, [Q.count_g, Q.count_g + 46], [0, 170], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <AbsoluteFill>
      <Sky stops={["#9fc8e8", "#cfe3f2", "#f5ecd6"]} horizon={1180} ground={["#c9a26c", "#a98250"]} />
      <Ridge pts="0,1180 0,980 220,900 480,1010 760,930 1080,1000 1080,1180" fill="#9a8a78" />
      {Array.from({ length: n }, (_, i) => {
        const x = 40 + rnd(i * 2) * 1000, y = 1230 + rnd(i * 2 + 1) * 330, born = Q.count_g + (i / 170) * 46, k = clamp01((f - born) / 4);
        return <div key={i} style={{ position: "absolute", left: x - 11, top: y - 11 - 14 * (1 - k), width: 22, height: 22, borderRadius: 11, background: i % 3 ? "#2f6fb5" : "#e0a526", border: `4px solid ${INK}`, opacity: k }} />;
      })}
      {slots.map((s) => <Hoplite key={s.i} spec={spartan(s.variant)} x={300 + s.x} y={1585 + s.y} scale={0.37 * s.size} pose={idleBreathe(f, POSES.stand_firm, s.phase)} mood="fierce" blink={false} />)}
      <CountCard f={f} label="GREEKS" old="300" now="~7,000" tOld={Q.L4 + 14} tStrike={Q.count_g} top={420} />
      <Pip x={120} y={1770} scale={0.5} pose="point" expression="curious" mouthOpen={talk(f)} />
    </AbsoluteFill>
  );
};

// the pass: a narrow gorge, mountain on the left, sea on the right
const Gorge: React.FC<{ horizon?: number }> = ({ horizon = 1210 }) => (
  <>
    <Sky stops={["#9fc8e8", "#cfe3f2", "#f5ecd6"]} horizon={horizon} ground={["#c9a26c", "#a98250"]} />
    <Ridge pts={`0,${horizon} 0,360 140,300 300,520 380,820 440,${horizon}`} fill="#9a8a78" />
    <Ridge pts={`1080,${horizon} 1080,900 940,860 800,1000 760,${horizon}`} fill="#8a7a68" />
    <div style={{ position: "absolute", left: 590, top: 880, width: 500, height: horizon - 880, background: "#6fb6e0", borderTop: `8px solid ${INK}` }} />
  </>
);

/** 5: the re-hook: the shield wall locks exactly on "wait" (ev:rehook), the screen shakes, the needle snaps back */
const Lock: React.FC<{ f: number }> = ({ f }) => {
  const sp = React.useMemo(() => formation(1, 5, 96, 3, 5), []);
  const pe = React.useMemo(() => formation(1, 4, 70, 3, 8), []);
  const after = f >= Q.rehook;
  return (
    <AbsoluteFill>
      <Gorge />
      <Pip x={90} y={1590} scale={0.5} pose="shrug" expression={after ? "shock" : "curious"} blink={false} />
      {sp.map((s) => <Hoplite key={s.i} spec={spartan(s.variant)} x={230 + s.x} y={1560 + s.y} scale={0.5 * s.size} pose={shieldLock(f, Q.rehook, POSES.stand_firm, s.phase)} mood={after ? "roar" : "fierce"} blink={false} />)}
      {pe.map((s) => <PersianFig key={s.i} spec={s.i % 2 ? PERSIAN_ARCHER : PERSIAN} x={790 + s.x} y={1560 + s.y} scale={0.5 * s.size} pose={shieldBlock(f, Q.rehook)} mood="fierce" blink={false} />)}
    </AbsoluteFill>
  );
};

/** where the spear tip of a thrusting Spartan meets the reed shield: tip position and the x/y the Persian must stand at */
const strike = (sx: number, sy: number, sS: number, pS: number) => {
  const g = solve(POSES.thrust_contact).weaponGrip, tipX = sx + (g[0] + 500) * sS, tipY = sy + g[1] * sS;
  return { tipX, tipY, px: tipX + 171 * pS - 6, py: tipY + 322 * pS };
};
const SA = { x: 300, y: 1545, s: 0.8, size: spartan(1).size }, SB = { x: 70, y: 1590, s: 0.66, size: spartan(3).size };
const PS = 0.78 * PERSIAN.size, PS2 = 0.66 * PERSIAN.size;
const STRIKE_A = strike(SA.x, SA.y, SA.s * SA.size, PS), STRIKE_B = strike(SB.x, SB.y, SB.s * SB.size, PS2);

/** 6: two days, nothing: thrust_1 and thrust_2 land on the shields (spark, stagger, shake); the picture cuts on the motion into a close-up */
const Thrust: React.FC<{ f: number }> = ({ f }) => {
  const sway = (k: number) => 5 * Math.sin((f + k) * 0.16);
  const hitA = f - Q.thrust_1, hitB = f - Q.thrust_2;
  const spark = (c: number, x: number, y: number) => (f >= c + 1 && f < c + 7 ? <Spark x={x} y={y} r={14 + 40 * Math.sin(Math.min(1, (f - c) / 6) * Math.PI)} /> : null);
  return (
    <AbsoluteFill>
      <Gorge horizon={1240} />
      <Hoplite spec={spartan(4)} x={SB.x + 260} y={1610} scale={0.52} pose={shieldLock(f, Q.rehook, POSES.stand_firm, 1)} mood="fierce" blink={false} />
      <Hoplite spec={spartan(3)} x={SB.x} y={SB.y} scale={SB.s} pose={spearThrust(f, Q.thrust_2)} mood={Math.abs(hitB + 3) < 8 ? "roar" : "fierce"} blink={false} />
      <Hoplite spec={spartan(1)} x={SA.x} y={SA.y} scale={SA.s} pose={spearThrust(f, Q.thrust_1)} mood={Math.abs(hitA + 3) < 8 ? "roar" : "fierce"} blink={false} />
      <PersianFig spec={PERSIAN_ARCHER} x={1010} y={1560} scale={0.55} pose={shieldBlock(f, Q.thrust_1)} mood="fierce" blink={false} />
      <PersianFig spec={PERSIAN} x={STRIKE_B.px + staggerShift(f, Q.thrust_2) * PS2 * -1 + sway(2)} y={STRIKE_B.py} scale={0.66} pose={staggerBack(f, Q.thrust_2)} mood={f >= Q.thrust_2 ? "surprised" : "fierce"} blink={false} />
      <PersianFig spec={PERSIAN} x={STRIKE_A.px - staggerShift(f, Q.thrust_1) * PS * -1 + sway(0)} y={STRIKE_A.py} scale={0.78} pose={staggerBack(f, Q.thrust_1)} mood={f >= Q.thrust_1 ? "surprised" : "fierce"} blink={false} />
      {spark(Q.thrust_1, STRIKE_A.tipX + 4, STRIKE_A.tipY)}
      {spark(Q.thrust_2, STRIKE_B.tipX + 4, STRIKE_B.tipY)}
    </AbsoluteFill>
  );
};

/** 7: Pip asks the audience */
const Question: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill>
    <Gorge horizon={1240} />
    <Pip x={540} y={1840} scale={1.1} poseObj={pipTrack(f, [[0, "idle"], [Q.L7 + 2, "scratch_head"]], 9)} expression="curious" mouthOpen={talk(f)} />
  </AbsoluteFill>
);

/** 8: Ephialtes walks in (march cycle, feet locked) and points up at the mountain; Xerxes sits on his throne */
const Traitor: React.FC<{ f: number }> = ({ f }) => {
  const ARRIVE = Q.point - 26, sc = 1.0, spd = MARCH_REL * sc * EPHIALTES.size, xEnd = 330;
  const walking = f < ARRIVE, x = walking ? xEnd - spd * (ARRIVE - f) : xEnd;
  const pose = f < ARRIVE ? marchCycle(f - Q.L8) : f < ARRIVE + 5 ? lerpPose(marchCycle(ARRIVE - Q.L8), POSES.stand, eio((f - ARRIVE) / 5)) : f < Q.point - 20 ? idleBreathe(f, POSES.stand, 0) : f < Q.point - 8 ? lerpPose(POSES.stand, POSES.plead, eio((f - Q.point + 20) / 8)) : pointUp(f, Q.point, POSES.plead);
  return (
    <AbsoluteFill>
      <Sky stops={["#c7b3d9", "#f0cfa8", "#fbe3bb"]} horizon={1240} ground={["#d7b27c", "#bf9760"]} />
      <Ridge pts="1080,1240 1080,600 900,520 760,700 640,820 520,1240" fill="#a8927a" />
      <path d="M780 1100 L720 980 L810 900 L740 800 L830 720" fill="none" stroke="#fff1c8" strokeWidth={9} strokeLinecap="round" strokeDasharray="4 22" opacity={clamp01((f - Q.point) / 10)} />
      <Hoplite spec={EPHIALTES} x={x} y={1590} scale={sc} pose={pose} mood={f >= Q.point ? "worried" : "calm"} blink={false} />
      <XerxesFig x={850} y={1590} scale={0.7} pose={sitThrone(f)} mood="calm" flip blink={false} />
    </AbsoluteFill>
  );
};

/** 9: night path: torches climb the slope; the guard turns in surprise (ev:surprise) and Pip covers his eyes */
const Night: React.FC<{ f: number }> = ({ f }) => {
  const t = f - Q.night, flipG = f >= Q.surprise + 4;
  const pts = Array.from({ length: 9 }, (_, i) => {
    const u = clamp01((t - i * 9) / 130) * 8.2;
    return { x: 80 + u * 105, y: 1150 - u * 90 - (Math.round(u) % 2) * 10, on: t - i * 9 > 0 };
  });
  const hands = f >= Q.surprise;
  return (
    <AbsoluteFill>
      <Sky stops={["#0d1630", "#1c2a52", "#34427a"]} horizon={1300} ground={["#2a2f4a", "#1a1d33"]} />
      {Array.from({ length: 40 }, (_, i) => <div key={i} style={{ position: "absolute", left: rnd(i) * 1080, top: 40 + rnd(i + 99) * 700, width: 6, height: 6, borderRadius: 3, background: "#fff6d0", opacity: 0.4 + 0.5 * rnd(i + 5) * (0.7 + 0.3 * Math.sin(f * 0.1 + i)) }} />)}
      <Ridge pts="0,1300 0,1100 220,1000 520,780 820,560 1080,420 1080,1300" fill="#2b3558" />
      {pts.map((p, i) => p.on && (
        <React.Fragment key={i}>
          <div style={{ position: "absolute", left: p.x - 60, top: p.y - 70, width: 120, height: 120, borderRadius: 60, background: "radial-gradient(rgba(255,200,90,0.55), rgba(255,200,90,0))" }} />
          <div style={{ position: "absolute", left: p.x - 9, top: p.y - 36 - 2 * Math.sin(f * 0.5 + i), width: 18, height: 30, borderRadius: 9, background: "#f28c28", border: `4px solid ${INK}` }} />
          <div style={{ position: "absolute", left: p.x - 4, top: p.y - 6, width: 8, height: 34, background: "#7a4a24", border: `3px solid ${INK}` }} />
        </React.Fragment>
      ))}
      <Pip x={160} y={1560} scale={0.52} pose="shrug" expression={hands ? "shock" : "curious"} blink={false} />
      {hands && [-1, 1].map((sd) => <div key={sd} style={{ position: "absolute", left: 160 + sd * 25 - 23, top: 1560 - 0.52 * 468 - 20, width: 46, height: 40, borderRadius: 20, background: PAL.skin, border: `5px solid ${INK}` }} />)}
      <Hoplite spec={GUARD} x={flipG ? 760 : 720} y={1580} scale={0.78} pose={turnHeadSurprise(f, Q.surprise, POSES.stand_firm)} flip={flipG} mood={f >= Q.surprise ? "surprised" : "calm"} blink={false} />
    </AbsoluteFill>
  );
};

/** 10: Leonidas sends the army away (ev:wave_off): most walk off to the left (march, feet locked); the small group locks shields (ev:stand) */
const Stay: React.FC<{ f: number }> = ({ f }) => {
  const sc = 0.5, leaveAt = Q.wave_off + 6, K = 0.004; // K: how fast the walkers shrink into the distance (per frame)
  const leavers = [0, 1, 2, 3, 4];
  return (
    <AbsoluteFill>
      <Sky stops={["#9fc8e8", "#f4cfa0", "#f9dcae"]} horizon={1240} ground={["#c9a26c", "#a98250"]} />
      <Ridge pts="0,1240 0,560 150,500 330,720 420,1240" fill="#9a8a78" />
      {leavers.map((i) => {
        const spec = i % 2 ? GREEK_GREEN : spartan(i), start = leaveAt + i * 2, u = Math.max(0, f - start), going = f >= start;
        // x(u) = x0 - v0 * (u - K u^2 / 2) so that dx/du = v0 * (1 - K u) = MARCH_REL * scale(u) * size: the planted foot never slides
        const x = 290 + i * 54 - MARCH_REL * sc * spec.size * (u - (K * u * u) / 2), y = 1500 + (i % 2) * 8 - u * 0.45;
        return <Hoplite key={i} spec={spec} x={x} y={y} scale={going ? sc * (1 - K * u) : sc} pose={going ? marchCycle(u + i * 3) : idleBreathe(f, POSES.stand_firm, i * 4)} flip={going} mood="calm" blink={false} />;
      })}
      <Hoplite spec={LEONIDAS_ORDER} x={620} y={1600} scale={0.74} pose={waveOff(f, Q.wave_off)} mood={f >= Q.wave_off ? "roar" : "fierce"} blink={false} />
      {[0, 1, 2].map((i) => <Hoplite key={i} spec={i === 2 ? THESPIAN : spartan(i + 3)} x={760 + i * 64} y={1580 + (i % 2) * 8} scale={0.5} pose={shieldLock(f, Q.stand, POSES.stand, i * 2)} mood="fierce" blink={false} />)}
    </AbsoluteFill>
  );
};

/** 11: verdict: the stamp lands on the event (ev:stamp) with the 7-frame shake; the needle goes to 85 % */
const Verdict: React.FC<{ f: number }> = ({ f }) => {
  const { fps } = useVideoConfig(), k = f >= Q.stamp ? spring({ frame: f - Q.stamp, fps, config: { damping: 9, stiffness: 190, mass: 0.6 } }) : 0;
  return (
    <AbsoluteFill>
      <RoomWarm />
      <Stamp kind="MYTH" x={640} y={1290} size={540} rotate={-8} at={Q.stamp} />
      <div style={{ position: "absolute", left: 130, width: 820, top: 330, textAlign: "center", fontFamily: FONT, fontSize: 150, color: PAL.myth, WebkitTextStroke: `13px ${INK}`, paintOrder: "stroke fill", transform: `rotate(-6deg) scale(${k})`, opacity: k > 0 ? 1 : 0 }}>MOSTLY</div>
      <Pip x={230} y={1740} scale={0.58} poseObj={pipTrack(f, [[0, "idle"], [Q.stamp + 6, "one_finger"]])} expression={f >= Q.stamp ? "proud" : "curious"} mouthOpen={talk(f)} />
    </AbsoluteFill>
  );
};

/** 12: a small group with raised shields in front of the pass at sunset: silhouettes, nobody hurt */
const RealStand: React.FC<{ f: number }> = ({ f }) => {
  const slots = React.useMemo(() => formation(1, 5, 172, 3, 11), []);
  return (
    <AbsoluteFill>
      <Sky stops={["#f08a4a", "#f7b46a", "#fbd9a0"]} horizon={1240} ground={["#6a4a3a", "#3f2c28"]} />
      <Ridge pts="0,1240 0,520 160,440 340,700 430,1240" fill="#7a4a3a" />
      <Ridge pts="1080,1240 1080,680 930,620 780,860 720,1240" fill="#6a3f35" />
      <div style={{ position: "absolute", left: 640, top: 760, width: 160, height: 160, borderRadius: 80, background: "radial-gradient(#fff2c0, rgba(255,220,140,0.2))" }} />
      <div style={{ position: "absolute", inset: 0, filter: "brightness(0.16) contrast(1.15)" }}>
        {slots.map((s) => <Hoplite key={s.i} spec={s.i === 2 ? THESPIAN : spartan(s.variant)} x={90 + s.x} y={1590 + s.y} scale={0.5 * s.size} pose={idleBreathe(f, POSES.stand_firm, s.phase)} mood="calm" blink={false} />)}
      </div>
    </AbsoluteFill>
  );
};

/** 13: the CTA: Pip points at the SUBSCRIBE button */
const Cta: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill>
    <RoomWarm />
    <Pip x={250} y={1710} scale={0.95} pose="point" expression="proud" mouthOpen={talk(f)} />
  </AbsoluteFill>
);

// ---- the episode ------------------------------------------------------------------------------------------------------------------------------
type Scene = { from: number; push?: number; zoom?: number; origin?: [number, number]; shiftY?: number; node: (f: number) => React.ReactNode };
const CUT_B = Q.thrust_2 - 3; // cut on the motion: the second spear is already on its way
const SCENES: Scene[] = [
  { from: Q.L1, node: (f) => <Hook f={f} /> },
  { from: Q.L2, push: 0.03, node: (f) => <RealOrMyth f={f} /> },
  { from: Q.L3, node: (f) => <CountP f={f} /> },
  { from: Q.L4, node: (f) => <CountG f={f} /> },
  { from: Q.L5, push: 0.09, node: (f) => <Lock f={f} /> },
  { from: Q.L6, push: 0.04, node: (f) => <Thrust f={f} /> },
  { from: CUT_B, push: 0.06, zoom: 1.75, origin: [STRIKE_B.tipX, STRIKE_B.tipY], shiftY: 190, node: (f) => <Thrust f={f} /> },
  { from: Q.L7, node: (f) => <Question f={f} /> },
  { from: Q.L8, node: (f) => <Traitor f={f} /> },
  { from: Q.L9, node: (f) => <Night f={f} /> },
  { from: Q.L10, node: (f) => <Stay f={f} /> },
  { from: Q.L11, node: (f) => <Verdict f={f} /> },
  { from: Q.L12, node: (f) => <RealStand f={f} /> },
  { from: Q.L13, node: (f) => <Cta f={f} /> },
  { from: Q.LOOP, push: 0, node: (f) => <Hook f={f - Q.LOOP} /> },
];

export const Ep007Short: React.FC = () => {
  const f = useCurrentFrame();
  const idx = SCENES.reduce((a, s, i) => (f >= s.from ? i : a), 0), sc = SCENES[idx], inLoop = f >= Q.LOOP;
  const clue = clueAt(f);
  return (
    <AbsoluteFill style={{ background: PAL.bgWarm }}>
      <Cam key={idx} from={sc.from} push={sc.push} zoom={sc.zoom} origin={sc.origin} shiftY={sc.shiftY}>{sc.node(f)}</Cam>

      {f >= Q.meter_on && !inLoop && <MythMeter keys={METER_KEYS} snap={METER_SNAP} top={50} width={520} wobble={f >= Q.meter_on && f < Q.L3} />}
      {f >= Q.meter_on + 6 && !inLoop && <ClueChip n={clue.n} dingAt={clue.at} top={160} />}

      <BigLine text="REAL or MYTH?" at={Q.L2} to={Q.L3} top={420} size={118} color={PAL.gold} />
      <BigLine text="THE PASS?!" at={Q.rehook} to={Q.L6} top={420} size={150} color="#ff6a5f" />
      <BigLine text="2 DAYS. NOTHING." at={Q.L6} to={Q.L7} top={420} size={116} color="#fff" />
      <BigLine text="EPHIALTES" at={Q.L8} to={Q.L9} top={420} size={128} color={PAL.gold} />
      <BigLine text="NIGHT PATH" at={Q.night} to={Q.L10} top={420} size={140} color={PAL.gold} />
      <BigLine text="THEY STAYED" at={Q.stand} to={Q.L11} top={420} size={132} color="#fff" />
      <BigLine text="NOT 300. NOT 1M." at={Q.L12} to={Q.L13} top={420} size={112} color="#fff" />
      <BigLine text="NEXT: CLEOPATRA vs MOON" at={Q.L13} to={Q.LOOP - 6} top={420} size={84} color={PAL.gold} />

      {!inLoop && <Captions words={CAPTION_WORDS} highlight={HIGHLIGHT} centerY={0.5} />}

      <div style={{ position: "absolute", inset: 0, transform: "translate(225px, 317px) scale(0.62)", transformOrigin: "475px 1083px" }}>
        <SubscribeButton from={Q.subscribe} shrinkAt={Q.LOOP - 6} shrinkFrames={6} top={1000} />
      </div>
    </AbsoluteFill>
  );
};
