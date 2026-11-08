// ThermoScenes: eight key stills of the Thermopylae episode for approval (composition frame n = scene n, 1080x1920). Not the final
// timeline: no voice yet, poses are static presets from src/flat/characters/thermo.tsx on the shared rig. Greeks face right, Persians
// face left (the same poses, flipped). Text stays in the top third and out of the right 12 % / bottom 20 % of the frame.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Pip } from "../../flat/characters/pip";
import { EPHIALTES, GREEK_GREEN, GUARD, Hoplite, LEONIDAS_ORDER, PERSIAN, PERSIAN_ARCHER, PersianFig, SPARTAN, THESPIAN, XerxesFig, spartan } from "../../flat/characters/thermo";
import { RoomWarm } from "../../flat/props/Scenes";
import { Stamp } from "../../flat/props/Stamp";
import { MythMeter } from "../../flat/ui/MythMeter";
import { BigLine, ClueChip } from "../../flat/ui/Texts";
import { FONT, INK, PAL } from "../../flat/style";

export const THERMO_SCENES = 8;
const rnd = (i: number) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// ---- backgrounds -------------------------------------------------------------------------------------------------------------
export const Sky: React.FC<{ stops: [string, string, string]; horizon: number; ground: [string, string] }> = ({ stops, horizon, ground }) => (
  <AbsoluteFill>
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: horizon + 2, background: `linear-gradient(${stops[0]} 0%, ${stops[1]} 60%, ${stops[2]} 100%)` }} />
    <div style={{ position: "absolute", left: 0, top: horizon, width: 1080, height: 1920 - horizon, background: `linear-gradient(${ground[0]}, ${ground[1]})`, borderTop: `8px solid ${INK}` }} />
  </AbsoluteFill>
);
export const Ridge: React.FC<{ pts: string; fill: string; ink?: boolean }> = ({ pts, fill, ink = true }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0 }}>
    <polygon points={pts} fill={fill} stroke={ink ? INK : "none"} strokeWidth={8} strokeLinejoin="round" />
  </svg>
);

/** a sea of Persian silhouettes: three parallel layers (far, middle, near), seeded jitter, drawn as flat shapes (no faces) */
export const Horde: React.FC<{ layers: { y: number; h: number; n: number; x0: number; x1: number; fill: string }[]; seed?: number }> = ({ layers, seed = 1 }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0 }}>
    {layers.map((L, li) => Array.from({ length: L.n }, (_, i) => {
      const x = L.x0 + ((L.x1 - L.x0) * (i + 0.5 * rnd(i + li * 50 + seed))) / L.n, hh = L.h * (0.92 + 0.16 * rnd(i * 3 + li + seed)), k = hh / 100;
      const lean = (rnd(i + 9 + li) - 0.5) * 8;
      return (
        <g key={`${li}-${i}`} transform={`translate(${x} ${L.y + (rnd(i + 5 + li) - 0.5) * L.h * 0.12}) scale(${k})`} fill={L.fill}>
          <line x1={22} y1={-10} x2={30 + lean} y2={-150} stroke={L.fill} strokeWidth={4} />
          <rect x={-16} y={-18} width={13} height={18} rx={4} />
          <rect x={3} y={-18} width={13} height={18} rx={4} />
          <path d="M-22 -22 L-17 -70 Q0 -84 17 -70 L22 -22 Z" />
          <circle cx={0} cy={-86} r={15} />
          <path d="M-16 -92 Q0 -112 16 -92 Z" />
          <rect x={-34} y={-76} width={20} height={44} rx={7} />
        </g>
      );
    }))}
  </svg>
);

export const Spark: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 54 }) => (
  <svg width={r * 4} height={r * 4} viewBox="-100 -100 200 200" style={{ position: "absolute", left: x - r * 2, top: y - r * 2, overflow: "visible" }}>
    <polygon points="0,-100 18,-30 80,-62 36,-12 100,6 34,24 62,84 6,36 -26,94 -20,26 -92,34 -34,2 -80,-60 -18,-26" fill={PAL.gold} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <circle r={26} fill="#fff6d0" />
  </svg>
);

export const Counter: React.FC<{ label: string; old: string; now: string; top: number }> = ({ label, old, now, top }) => (
  <div style={{ position: "absolute", left: 90, top, width: 770, padding: "18px 0 26px", background: PAL.paper, border: `9px solid ${INK}`, borderRadius: 36, boxShadow: "0 12px 0 rgba(27,27,47,0.35)", textAlign: "center", fontFamily: FONT, color: INK }}>
    <div style={{ fontSize: 40, letterSpacing: 4, color: "#6b6b88" }}>{label}</div>
    <div style={{ position: "relative", display: "inline-block", fontSize: 82, color: "#7a7a90", margin: "4px 0 2px" }}>{old}<div style={{ position: "absolute", left: -10, right: -10, top: "50%", height: 12, background: PAL.fail, border: `4px solid ${INK}`, borderRadius: 8, transform: "rotate(-4deg)" }} /></div>
    <div style={{ fontSize: 112, color: "#18a559", WebkitTextStroke: `10px ${INK}`, paintOrder: "stroke fill", lineHeight: 1.05 }}>{now}</div>
  </div>
);

const Meter: React.FC<{ value: number }> = ({ value }) => <MythMeter value={value} top={50} width={520} />;

// ---- scenes --------------------------------------------------------------------------------------------------------------------
/** 0: frame 0 of the episode: a small line of red shields against a sea of Persian silhouettes */
const Hook: React.FC = () => (
  <AbsoluteFill>
    <Sky stops={["#f7c98a", "#ffe3b5", "#fff0d2"]} horizon={1180} ground={["#d9b27a", "#c49a62"]} />
    <Ridge pts="0,1180 0,1000 160,940 330,1030 520,930 760,1040 1080,960 1080,1180" fill="#b8a07f" />
    <Horde seed={2} layers={[
      { y: 1215, h: 120, n: 42, x0: 130, x1: 1100, fill: "#7a6a8c" },
      { y: 1300, h: 170, n: 26, x0: 230, x1: 1120, fill: "#5a4870" },
      { y: 1450, h: 250, n: 12, x0: 400, x1: 1150, fill: "#3a2c52" },
    ]} />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => <Hoplite key={i} spec={spartan(i)} x={95 + i * 52} y={1585 + (i % 2) * 6} scale={0.33} pose="stand_firm" mood="fierce" blink={false} />)}
    <BigLine text="300 vs 1,000,000?" at={-20} top={150} size={124} />
  </AbsoluteFill>
);

/** 1: clue one (ev:count_p): the Persian count drops */
const Count: React.FC = () => (
  <AbsoluteFill>
    <Sky stops={["#f7c98a", "#ffe3b5", "#fff0d2"]} horizon={1180} ground={["#d9b27a", "#c49a62"]} />
    <Ridge pts="0,1180 0,1020 200,960 420,1040 700,950 1080,1010 1080,1180" fill="#b8a07f" />
    <Horde seed={4} layers={[
      { y: 1215, h: 110, n: 30, x0: 0, x1: 1100, fill: "#7a6a8c" },
      { y: 1320, h: 170, n: 16, x0: 0, x1: 1120, fill: "#5a4870" },
    ]} />
    <Meter value={0.25} />
    <ClueChip n={1} top={160} />
    <Counter label="PERSIANS" old="2,600,000" now="120–300K" top={420} />
    <Pip x={170} y={1700} scale={0.62} pose="point" expression="curious" blink={false} />
  </AbsoluteFill>
);

/** 2: the re-hook (ev:rehook = ev:shield_lock): the shields lock, the needle snaps back to REAL */
const Lock: React.FC = () => (
  <AbsoluteFill>
    <Sky stops={["#9fc8e8", "#cfe3f2", "#f5ecd6"]} horizon={1210} ground={["#c9a26c", "#a98250"]} />
    <Ridge pts="0,1210 0,360 140,300 300,520 380,820 440,1210" fill="#9a8a78" />
    <Ridge pts="1080,1210 1080,900 940,860 800,1000 760,1210" fill="#8a7a68" />
    <div style={{ position: "absolute", left: 590, top: 880, width: 500, height: 330, background: "#6fb6e0", borderTop: `8px solid ${INK}` }} />
    <Meter value={0} />
    <BigLine text="THE PASS?!" at={-20} top={420} size={150} color="#ff6a5f" />
    <Pip x={90} y={1590} scale={0.5} pose="shrug" expression="shock" blink={false} />
    {[0, 1, 2, 3, 4].map((i) => <Hoplite key={i} spec={spartan(i)} x={230 + i * 96} y={1560} scale={0.5} pose="shield_lock" mood="roar" blink={false} />)}
    {[0, 1, 2, 3].map((i) => <PersianFig key={i} spec={i % 2 ? PERSIAN_ARCHER : PERSIAN} x={760 + i * 70} y={1560 - (i % 2) * 6} scale={0.5} pose="persian_block" mood="fierce" blink={false} />)}
  </AbsoluteFill>
);

/** 3: ev:thrust_1: the spear meets the reed shield, a small spark, the Persian is pushed back one step */
const Thrust: React.FC = () => (
  <AbsoluteFill>
    <Sky stops={["#9fc8e8", "#cfe3f2", "#f5ecd6"]} horizon={1240} ground={["#c9a26c", "#a98250"]} />
    <Ridge pts="0,1240 0,520 150,470 330,700 420,1240" fill="#9a8a78" />
    <Ridge pts="1080,1240 1080,700 920,640 780,860 720,1240" fill="#8a7a68" />
    <Hoplite spec={spartan(2)} x={110} y={1590} scale={0.62} pose="stand_firm" mood="fierce" blink={false} />
    <Hoplite spec={spartan(1)} x={255} y={1520} scale={0.82} pose="thrust_contact" mood="roar" blink={false} />
    <PersianFig spec={PERSIAN_ARCHER} x={990} y={1560} scale={0.55} pose="persian_block" mood="fierce" blink={false} />
    <PersianFig x={840} y={1520} scale={0.82} pose="persian_stagger" mood="surprised" blink={false} />
    <Spark x={728} y={1248} r={50} />
    <BigLine text="2 DAYS. NOTHING." at={-20} top={420} size={116} color="#fff" />
  </AbsoluteFill>
);

/** 4: Ephialtes tells Xerxes about the path (ev:point) */
const Traitor: React.FC = () => (
  <AbsoluteFill>
    <Sky stops={["#c7b3d9", "#f0cfa8", "#fbe3bb"]} horizon={1240} ground={["#d7b27c", "#bf9760"]} />
    <Ridge pts="1080,1240 1080,600 900,520 760,700 640,820 520,1240" fill="#a8927a" />
    <path d="M780 1100 L720 980 L810 900 L740 800 L830 720" fill="none" stroke="#fff1c8" strokeWidth={9} strokeLinecap="round" strokeDasharray="4 22" />
    <Meter value={0.75} />
    <ClueChip n={3} top={160} />
    <BigLine text="EPHIALTES" at={-20} top={420} size={128} color={PAL.gold} />
    <Hoplite spec={EPHIALTES} x={210} y={1590} scale={0.8} pose="point_up" mood="worried" blink={false} />
    <XerxesFig x={820} y={1590} scale={0.74} mood="calm" flip blink={false} />
  </AbsoluteFill>
);

/** 5: the night path (ev:night, ev:surprise): torches climb, the guard turns his head, Pip peeks */
const Night: React.FC = () => (
  <AbsoluteFill>
    <Sky stops={["#0d1630", "#1c2a52", "#34427a"]} horizon={1300} ground={["#2a2f4a", "#1a1d33"]} />
    {Array.from({ length: 40 }, (_, i) => <div key={i} style={{ position: "absolute", left: rnd(i) * 1080, top: 40 + rnd(i + 99) * 700, width: 6, height: 6, borderRadius: 3, background: "#fff6d0", opacity: 0.4 + 0.5 * rnd(i + 5) }} />)}
    <Ridge pts="0,1300 0,1100 220,1000 520,780 820,560 1080,420 1080,1300" fill="#2b3558" />
    {Array.from({ length: 9 }, (_, i) => {
      const x = 80 + i * 105, y = 1150 - i * 90 - (i % 2) * 14;
      return (
        <React.Fragment key={i}>
          <div style={{ position: "absolute", left: x - 60, top: y - 70, width: 120, height: 120, borderRadius: 60, background: "radial-gradient(rgba(255,200,90,0.55), rgba(255,200,90,0))" }} />
          <div style={{ position: "absolute", left: x - 9, top: y - 36, width: 18, height: 30, borderRadius: 9, background: "#f28c28", border: `4px solid ${INK}` }} />
          <div style={{ position: "absolute", left: x - 4, top: y - 6, width: 8, height: 34, background: "#7a4a24", border: `3px solid ${INK}` }} />
        </React.Fragment>
      );
    })}
    <BigLine text="NIGHT PATH" at={-20} top={420} size={140} color={PAL.gold} />
    <Pip x={160} y={1560} scale={0.52} pose="shrug" expression="shock" blink={false} />
    <Hoplite spec={GUARD} x={720} y={1580} scale={0.78} pose="surprised" mood="surprised" blink={false} />
  </AbsoluteFill>
);

/** 6: Leonidas sends the army away (ev:wave_off), the small group stays (ev:stand) */
const Stay: React.FC = () => (
  <AbsoluteFill>
    <Sky stops={["#9fc8e8", "#f4cfa0", "#f9dcae"]} horizon={1240} ground={["#c9a26c", "#a98250"]} />
    <Ridge pts="0,1240 0,560 150,500 330,720 420,1240" fill="#9a8a78" />
    <BigLine text="THEY STAYED" at={-20} top={420} size={132} color="#fff" />
    {[0, 1, 2, 3].map((i) => <Hoplite key={i} spec={i % 2 ? GREEK_GREEN : SPARTAN} x={90 + i * 95} y={1420 + (i % 2) * 8} scale={0.34} pose="walk_away" mood="calm" flip blink={false} />)}
    <Hoplite spec={LEONIDAS_ORDER} x={560} y={1590} scale={0.72} pose="wave_off" mood="roar" blink={false} />
    {[0, 1, 2].map((i) => <Hoplite key={i} spec={i === 2 ? THESPIAN : spartan(i + 3)} x={760 + i * 80} y={1560 + (i % 2) * 8} scale={0.5} pose="stand_firm" mood="fierce" blink={false} />)}
  </AbsoluteFill>
);

/** 7: the verdict (ev:stamp) */
const Verdict: React.FC = () => (
  <AbsoluteFill>
    <RoomWarm />
    <Meter value={0.85} />
    <Stamp kind="MYTH" x={540} y={820} size={640} rotate={-8} />
    <div style={{ position: "absolute", left: 140, width: 640, top: 380, textAlign: "center", fontFamily: FONT, fontSize: 130, color: PAL.myth, WebkitTextStroke: `12px ${INK}`, paintOrder: "stroke fill", transform: "rotate(-8deg)" }}>MOSTLY</div>
    <Pip x={300} y={1700} scale={0.62} pose="one_finger" expression="proud" blink={false} />
  </AbsoluteFill>
);

const SCENES = [Hook, Count, Lock, Thrust, Traitor, Night, Stay, Verdict];
export const ThermoScenes: React.FC = () => {
  const f = useCurrentFrame();
  const S = SCENES[Math.min(f, SCENES.length - 1)];
  return <S />;
};
