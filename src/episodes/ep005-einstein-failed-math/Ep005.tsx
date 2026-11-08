// "Einstein Failed Math? Real or Myth?": flat 2D short (1080x1920, 30 fps). Scenes are picked by frame (see story.ts for the cue
// table), each one wrapped in a slow push-in camera; the UI (MYTH-O-METER, CLUE chip, big line, captions) is drawn over them.
// Layout from the top: meter, big line, the scene's props, captions (45-55 %), characters. Nothing important in the bottom 20 %
// or the right 12 % (Shorts overlays).
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Pip } from "../../flat/characters/pip";
import { Einstein } from "../../flat/characters/einstein";
import { Judge } from "../../flat/characters/judge";
import { ExamPaper, TableRow } from "../../flat/props/ExamPaper";
import { Stamp } from "../../flat/props/Stamp";
import { BigBook, Chalkboard, PatentDesk } from "../../flat/props/Objects";
import { ExamHall, Office, RoomWarm } from "../../flat/props/Scenes";
import { Blackboard, ClassroomRoom, ClassStudents, Desk } from "../../flat/props/Classroom";
import { MythMeter } from "../../flat/ui/MythMeter";
import { BigLine, Captions, ClueChip } from "../../flat/ui/Texts";
import { SubscribeButton } from "../../flat/ui/SubscribeButton";
import { INK, PAL } from "../../flat/style";
import { CAPTION_WORDS } from "./captions";
import { METER_KEYS, METER_SNAP, Q, SHAKES, TOTAL, clueAt } from "./story";

export const EP005_FRAMES = TOTAL;
const HIGHLIGHT = ["MATH", "FAILED", "MYTH", "REAL", "DISTINCTION", "ONE"];
const METER_TOP = 50, METER_W = 520, BIG_TOP = 380;

/** Pip is the narrator: his mouth opens while a word is spoken */
const talk = (f: number): number => {
  const t = f / 30;
  return CAPTION_WORDS.some((w) => t >= w.s && t < w.e) ? 0.3 + 0.5 * Math.abs(Math.sin(f * 1.25)) : 0;
};

/** slow push-in, a small pop on every cut and the 7-frame shakes of the stamps */
const Cam: React.FC<{ from: number; push?: number; children: React.ReactNode }> = ({ from, push = 0.07, children }) => {
  const f = useCurrentFrame();
  const t = f - from;
  let dx = 0, dy = 0;
  for (const a of SHAKES) {
    const u = f - a;
    if (u >= 0 && u < 7) { const k = 1 - u / 7; dx += Math.sin(u * 3.1) * 14 * k; dy += Math.cos(u * 2.3) * 10 * k; }
  }
  const pop = t < 6 ? 1 + 0.04 * (1 - t / 6) : 1;
  return <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) scale(${(1 + (push * Math.min(t, 150)) / 150) * pop})` }}>{children}</AbsoluteFill>;
};


// ---- scenes -------------------------------------------------------------------------------------------------------------
/**
 * The hook (frame 0 to "Teachers love this story") and the loop frame: a classroom. Old Einstein sits behind the teacher's desk
 * in front of a blackboard that has just been stamped with a giant red F; two rows of students below him gasp, laugh and one
 * raises a hand ("?"). In the second beat Pip walks in from the right with the exam paper.
 */
export const Classroom: React.FC<{ loop?: boolean; pipFrom?: number }> = ({ loop, pipFrom }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const sweaty = f >= 40 && !loop;
  let pip: React.ReactNode = null;
  if (pipFrom !== undefined) {
    const k = spring({ frame: f - pipFrom, fps, config: { damping: 14, stiffness: 110, mass: 0.9 } });
    const t = f - pipFrom;
    pip = <Pip x={interpolate(k, [0, 1], [1400, 950])} y={1200} scale={0.75} pose={t < 44 ? "hold_paper" : "shrug"} expression={t < 44 ? "smirk" : "proud"} mouthOpen={talk(f)} />;
  }
  return (
    <AbsoluteFill>
      <ClassroomRoom board={<Blackboard x={540} y={735} width={660} title="MATH" />} />
      <Stamp kind="F" x={700} y={720} size={400} rotate={-12} at={loop ? -100 : -3} plate />
      <Einstein age="old" x={350} y={1180} scale={0.9} pose="shrug" expression={sweaty ? "sweat" : "shock"} />
      <Desk x={350} y={1010} width={540} height={170} />
      {pip}
      <ClassStudents from={loop ? f : 0} />
    </AbsoluteFill>
  );
};

const RealOrMyth: React.FC = () => (
  <AbsoluteFill>
    <RoomWarm />
    <Pip x={540} y={1820} scale={1.05} pose="idle" expression="curious" mouthOpen={talk(useCurrentFrame())} />
    <Stamp kind="REAL" x={185} y={1400} size={270} rotate={-12} at={Q.L3 + 2} />
    <Stamp kind="MYTH" x={900} y={1400} size={270} rotate={10} at={Q.myth} />
  </AbsoluteFill>
);

const ReportCard: React.FC = () => (
  <AbsoluteFill>
    <RoomWarm />
    <ExamPaper x={800} y={900} width={400} rotate={6} mode="table" />
    <Pip x={360} y={1760} scale={1.0} pose="magnifier" expression="curious" mouthOpen={talk(useCurrentFrame())} />
  </AbsoluteFill>
);

const Pencil: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const f = useCurrentFrame();
  const px = x + Math.sin(f * 0.5) * 70, py = y + Math.abs(Math.sin(f * 1.0)) * 8;
  return (
    <svg width={140} height={140} viewBox="-70 -110 140 140" style={{ position: "absolute", left: px - 70, top: py - 110, overflow: "visible" }}>
      <g transform="rotate(30)">
        <rect x={-9} y={-90} width={18} height={80} rx={4} fill={PAL.gold} stroke={INK} strokeWidth={6} />
        <path d="M-9 -10 L0 16 L9 -10 Z" fill={PAL.skin} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      </g>
    </svg>
  );
};

const Age12: React.FC = () => (
  <AbsoluteFill>
    <RoomWarm />
    <Einstein age={12} x={540} y={1610} scale={1.5} pose="write" expression="curious" />
    <BigBook x={540} y={1700} width={700} />
    <Pencil x={600} y={1300} />
  </AbsoluteFill>
);

const Age14: React.FC = () => {
  const f = useCurrentFrame();
  const lines = interpolate(f, [Q.L6 + 12, Q.L7 - 14], [0, 4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <RoomWarm />
      <Chalkboard x={540} y={860} width={640} lines={lines} />
      <Einstein age={14} x={300} y={1650} scale={1.15} pose="write" expression="proud" />
      <Pip x={800} y={1670} scale={0.75} pose="idle" expression="shock" mouthOpen={talk(f)} />
    </AbsoluteFill>
  );
};

const ReHook: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "repeating-conic-gradient(from 0deg at 50% 62%, #ffe3c0 0deg 9deg, #ffcf99 9deg 18deg)" }}>
      <Pip x={540} y={1850} scale={1.15} pose="shrug" expression="shock" mouthOpen={talk(f)} />
    </AbsoluteFill>
  );
};

const ExamRoom: React.FC = () => {
  const f = useCurrentFrame();
  const stamped = f >= Q.stamp;
  return (
    <AbsoluteFill>
      <ExamHall />
      <ExamPaper x={500} y={820} width={470} rotate={-3} title="ETH EXAM" />
      <Einstein age={16} x={240} y={1600} scale={1.1} pose="idle" expression="sweat" />
      <Judge x={800} y={1580} scale={0.88} pose={stamped ? "stamp_down" : "hold_stamp"} expression="deadpan" />
      <Stamp kind="F" x={560} y={940} size={380} rotate={-12} at={Q.stamp} />
    </AbsoluteFill>
  );
};

const ReportTable: React.FC = () => {
  const f = useCurrentFrame();
  const rows: TableRow[] = [
    { label: "GENERAL (non-science)", state: f >= Q.general ? "red" : "pending" },
    { label: "MATH", state: f >= Q.math ? "green" : "pending", star: f >= Q.math },
    { label: "PHYSICS", state: f >= Q.physics ? "green" : "pending", star: f >= Q.physics },
  ];
  return (
    <AbsoluteFill>
      <RoomWarm />
      <ExamPaper x={590} y={1180} width={560} rotate={-2} mode="table" rows={rows} />
      <Pip x={150} y={1730} scale={0.7} pose="magnifier" expression={f >= Q.distinction ? "smirk" : "curious"} mouthOpen={talk(f)} />
    </AbsoluteFill>
  );
};

const Hmm: React.FC = () => (
  <AbsoluteFill>
    <RoomWarm />
    <Pip x={540} y={1830} scale={1.1} pose="scratch_head" expression="curious" mouthOpen={talk(useCurrentFrame())} />
  </AbsoluteFill>
);

const Patent: React.FC = () => (
  <AbsoluteFill>
    <Office />
    <Einstein age={26} x={270} y={1650} scale={1.0} pose="idle" expression="proud" />
    <PatentDesk x={700} y={1430} width={720} at={Q.four} />
  </AbsoluteFill>
);

const Verdict: React.FC = () => (
  <AbsoluteFill>
    <RoomWarm />
    <ExamPaper x={540} y={850} width={600} rotate={-3} title="MATH EXAM" />
    <Stamp kind="F" x={690} y={1050} size={360} rotate={-14} at={-100} />
    <Stamp kind="MYTH" x={560} y={900} size={520} rotate={-8} at={Q.mythStamp} />
    <Einstein age="old" x={540} y={1740} scale={1.0} pose="idle" expression="smirk" look={[0.7, 0]} />
  </AbsoluteFill>
);

const OneExam: React.FC = () => {
  const f = useCurrentFrame();
  const nod = Math.sin((f - Q.L15) * 0.32) * 7;
  return (
    <AbsoluteFill>
      <RoomWarm />
      <Pip x={300} y={1720} scale={0.95} pose="one_finger" expression="proud" mouthOpen={talk(f)} />
      <Einstein age="old" x={790} y={1720 + nod} scale={0.95} pose="idle" expression="proud" />
    </AbsoluteFill>
  );
};

const Next: React.FC = () => (
  <AbsoluteFill>
    <RoomWarm />
    <Pip x={250} y={1710} scale={0.95} pose="point" expression="proud" mouthOpen={talk(useCurrentFrame())} />
  </AbsoluteFill>
);

// ---- the episode ---------------------------------------------------------------------------------------------------------
const SCENES: { from: number; push?: number; node: React.ReactNode }[] = [
  { from: 0, node: <Classroom /> },
  { from: Q.L2, push: 0.02, node: <Classroom pipFrom={Q.L2} /> },
  { from: Q.L3, node: <RealOrMyth /> },
  { from: Q.L4, node: <ReportCard /> },
  { from: Q.L5, node: <Age12 /> },
  { from: Q.L6, node: <Age14 /> },
  { from: Q.L7, push: 0.1, node: <ReHook /> },
  { from: Q.L8, node: <ExamRoom /> },
  { from: Q.L10, push: 0.12, node: <ReportTable /> },
  { from: Q.L12, node: <Hmm /> },
  { from: Q.L13, node: <Patent /> },
  { from: Q.L14, node: <Verdict /> },
  { from: Q.L15, node: <OneExam /> },
  { from: Q.L16, node: <Next /> },
  { from: Q.LOOP, push: 0, node: <Classroom loop /> },
];

export const Ep005Short: React.FC = () => {
  const f = useCurrentFrame();
  const idx = SCENES.reduce((a, s, i) => (f >= s.from ? i : a), 0);
  const sc = SCENES[idx];
  const clue = clueAt(f);
  const inLoop = f >= Q.LOOP;
  const meterOn = f >= Q.L3 - 4 && !inLoop;
  const tableScene = f >= Q.L10 && f < Q.L12;
  return (
    <AbsoluteFill style={{ background: PAL.bgWarm }}>
      <Cam key={idx} from={sc.from} push={sc.push}>{sc.node}</Cam>

      {meterOn && <MythMeter keys={METER_KEYS} snap={METER_SNAP} top={METER_TOP} width={METER_W} wobble={f >= Q.L3 && f < Q.L4 + 6} />}
      {f >= Q.L4 + 8 && !inLoop && <ClueChip n={clue.n} dingAt={clue.at} top={METER_TOP + 110} />}

      {/* big lines (<= 5 words), each from the moment it is spoken */}
      <BigLine text="EINSTEIN FAILED MATH?" at={-20} to={Q.L3 - 2} top={80} size={112} />
      <BigLine text="REAL or MYTH?" at={Q.L3} to={Q.L4} top={BIG_TOP} size={118} color={PAL.gold} />
      <BigLine text="AGE 12" at={Q.twelve} to={Q.L6} top={BIG_TOP} size={150} color={PAL.gold} />
      <BigLine text="AGE 14: CALCULUS" at={Q.L6} to={Q.L7} top={BIG_TOP} size={118} color={PAL.gold} />
      <BigLine text="HE FAILED?!" at={Q.wait} to={Q.L8} top={BIG_TOP} size={160} color="#ff6a5f" />
      <BigLine text="ETH ZURICH 1895" at={Q.L8} to={Q.stamp} top={BIG_TOP} size={120} color={PAL.white} />
      <BigLine text="FAILED" at={Q.stamp} to={Q.L10} top={BIG_TOP} size={190} color="#ff6a5f" />
      <BigLine text="NON-SCIENCE" at={Q.L10} to={Q.L11} top={BIG_TOP} size={128} color="#ff6a5f" />
      <BigLine text="MATH ✓ PHYSICS ✓" at={Q.L11} to={Q.L12} top={BIG_TOP} size={104} color="#6be39a" />
      <BigLine text="1905 · 4 PAPERS" at={Q.L13} to={Q.L14} top={BIG_TOP} size={124} color={PAL.gold} />
      <BigLine text="MYTH" at={Q.mythStamp} to={Q.L15} top={BIG_TOP - 20} size={230} color="#6be39a" />
      <BigLine text="ONE EXAM. NOT MATH." at={Q.L15 + 6} to={Q.L16} top={BIG_TOP} size={112} color={PAL.white} />
      <BigLine text="NEXT: CLEOPATRA vs MOON" at={Q.L16} to={Q.LOOP - 6} top={BIG_TOP} size={84} color={PAL.gold} />

      {/* the loop: the last frames show frame 0 again (paper, F, headline) */}
      <BigLine text="EINSTEIN FAILED MATH?" at={Q.LOOP - 6} top={80} size={112} />

      {!inLoop && <Captions words={CAPTION_WORDS} highlight={HIGHLIGHT} centerY={tableScene ? 0.45 : 0.5} />}

      {/* smaller, and moved to the fingertip of Pip's pointing hand (the button centre ends up at x 700, y 1400) */}
      <div style={{ position: "absolute", inset: 0, transform: "translate(225px, 317px) scale(0.62)", transformOrigin: "475px 1083px" }}>
        <SubscribeButton from={Q.subscribe} shrinkAt={Q.LOOP - 6} shrinkFrames={6} top={1000} />
      </div>
    </AbsoluteFill>
  );
};
