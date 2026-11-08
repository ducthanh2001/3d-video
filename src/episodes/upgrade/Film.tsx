// UpgradeFilm: "YOUR PHONE UPGRADES EVERY YEAR. DO YOU?" 36 s, 1080x1920, 30 fps. Black and white + one amber accent (accent.tsx).
// Every time comes from events.ts (Q), which the sound script reads too. Shots are chosen by the global frame.
import React from "react";
import { useCurrentFrame } from "remotion";
import { V, clamp, ease, lerp, prog } from "../../kit/core";
import { Hero, LOOK_WHITE, Pose } from "../../kit/hero";
import { LightPool, MAT } from "../../kit/materials";
import { Chair, Desk, Moon, Phone, Window, WallClock } from "../../kit/props";
import { Dust, Glow, ImpactRing, Motes, Sparkle } from "../../kit/fx";
import { Cam, CamKey, Flash } from "../../kit/camera";
import { Title } from "../../kit/demo/shared";
import { ACC, Acc, TwoPass } from "./accent";
import { Q } from "./events";
import { Can, CoffeeTable, DayGrid, DeskLamp, FramedArt, LaptopMail, PaperBall, Pencil, PhoneBig, PhoneBox, RoomBox, Shelf, Sketchbook, Skyline, Slab, SnackBag, Sofa, Thumb } from "./props";

export const UPGRADE_FRAMES = Q.LEN;
const BIG = '"Arial Black", Impact, "Segoe UI Black", sans-serif';

// ---------------------------------------------------------------- poses
const drawPose = (f: number, speed = 0.5): Pose => ({ hip: [0, -128], lean: 16, head: 22, hN: [104 + Math.sin(f * speed) * 7, 72 + Math.cos(f * speed * 1.3) * 3], hF: [84, 80], fN: [104, 0], fF: [124, 0] });
const ripPose: Pose = { hip: [0, -128], lean: 4, head: 4, hN: [70, -36], hF: [20, -44], fN: [104, 0], fF: [124, 0] };
const headInHands: Pose = { hip: [0, -128], lean: 34, head: 46, hN: [44, -8], hF: [30, -16], fN: [104, 0], fF: [124, 0], elbow: 1 };
const slumpPose = (f: number): Pose => ({ hip: [0, -112], lean: -26, head: 34, hN: [56, 34 + Math.sin(f * 0.7) * 2], hF: [44, 40], fN: [168, -4], fF: [190, 0], elbow: -1 });
const mix = (a: Pose, b: Pose, t: number): Pose => {
  const L = (p: V, q: V): V => [lerp(p[0], q[0], t), lerp(p[1], q[1], t)];
  return { hip: L(a.hip, b.hip), lean: lerp(a.lean, b.lean, t), head: lerp(a.head, b.head, t), hN: L(a.hN, b.hN), hF: L(a.hF, b.hF), fN: L(a.fN, b.fN), fF: L(a.fF, b.fF), elbow: t < 0.5 ? a.elbow : b.elbow };
};
const lookB = (dim: number) => ({ ...LOOK_WHITE, body: `rgb(${247 - dim * 90},${247 - dim * 90},${245 - dim * 80})`, far: `rgb(${185 - dim * 70},${185 - dim * 70},${185 - dim * 60})`, glow: 0.45 * (1 - dim) });
const pencilHold = (j: { wN: V }) => <Acc><g transform={`translate(${j.wN[0]} ${j.wN[1]}) rotate(-30)`}><rect x={-3} y={-34} width={6} height={30} fill={ACC} stroke="#0b0b0d" strokeWidth={1.5} /></g></Acc>;

// ---------------------------------------------------------------- the building
const RX = 90, RW = 900, A_Y = 340, B_Y = 960, RH = 580;
type RoomOpts = { clock: [number, number]; lamp?: number; aPose?: Pose; aA?: number; cans?: number; box?: boolean; arts?: number[]; tone?: "warm" | "dark" | "cool"; bDim?: number; balls?: number; laptop?: boolean };
const ARTS: [number, number, number, number, number][] = [[640, 150, 0.95, 2, -2], [770, 140, 0.9, 5, 3], [900, 160, 0.92, 8, -1], [700, 300, 0.85, 11, 2], [840, 290, 0.97, 14, -3]];

const RoomA: React.FC<{ f: number; o: RoomOpts }> = ({ f, o }) => {
  const y = A_Y, floor = y + RH - 20, lamp = o.lamp ?? 1;
  return (
    <g>
      <RoomBox x={RX} y={y} w={RW} h={RH} tone={o.tone ?? "warm"} lightOn={lamp > 0.5} />
      <rect x={RX} y={y} width={RW} height={RH} fill="#000" opacity={0.5 * (1 - lamp)} />
      <Window x={130} y={y + 110} w={180} h={220} f={f} />
      <WallClock x={470} y={y + 150} r={46} h={o.clock[0]} m={o.clock[1]} />
      {o.arts ? o.arts.map((p, i) => p > 0 && <g key={i} transform={`translate(${ARTS[i][0]} ${y + ARTS[i][1]}) scale(${ease.back(p)}) translate(${-ARTS[i][0]} ${-(y + ARTS[i][1])})`}><FramedArt x={ARTS[i][0]} y={y + ARTS[i][1]} w={86} skill={ARTS[i][2]} seed={ARTS[i][3]} tilt={ARTS[i][4]} /></g>) : <Shelf x={640} y={y + 200} w={220} seed={2} />}
      <Sofa x={300} y={floor} color="#5a4636" />
      <CoffeeTable x={560} y={floor} w={150} />
      <Desk x={790} y={floor} w={300} h={150} />
      <Chair x={690} y={floor} />
      <Acc><DeskLamp x={930} y={floor - 150} s={0.9} flip on={lamp} /></Acc>
      <rect x={720} y={floor - 158} width={110} height={8} rx={2} fill="#f4efe2" stroke="#0b0b0d" strokeWidth={2} />
      {o.laptop && <g transform={`translate(880 ${floor - 150}) scale(0.2)`}><LaptopMail x={0} y={0} p={1} /></g>}
      {Array.from({ length: o.balls ?? 0 }, (_, i) => <PaperBall key={i} x={600 + i * 38} y={floor - 8} s={0.6} seed={i * 5 + 3} />)}
      {(o.aA ?? 1) > 0 && <Hero x={690} y={floor} s={0.85} pose={o.aPose ?? drawPose(f)} opacity={o.aA ?? 1} hold={pencilHold} />}
      {lamp > 0 && <Acc><LightPool cx={820} cy={floor - 170} rx={260} ry={200} color={ACC} a={0.45 * lamp} /></Acc>}
    </g>
  );
};
const RoomB: React.FC<{ f: number; o: RoomOpts }> = ({ f, o }) => {
  const y = B_Y, floor = y + RH - 20, cans = o.cans ?? 0;
  return (
    <g>
      <RoomBox x={RX} y={y} w={RW} h={RH} tone="cool" />
      <rect x={RX} y={y} width={RW} height={RH} fill="#000" opacity={0.4} />
      <Window x={130} y={y + 110} w={180} h={220} f={f} />
      <WallClock x={470} y={y + 150} r={46} h={o.clock[0]} m={o.clock[1]} />
      <Shelf x={640} y={y + 200} w={220} seed={5} />
      <Sofa x={300} y={floor} color="#3a3550" />
      <CoffeeTable x={560} y={floor} w={150} />
      <Desk x={790} y={floor} w={300} h={150} />
      <Chair x={690} y={floor} />
      <Sketchbook x={790} y={floor - 160} s={0.3} closed />
      <SnackBag x={530} y={floor - 70} s={0.7} /><Can x={590} y={floor - 70} s={0.8} />
      {cans > 0 && <Can x={620} y={floor - 30} s={0.8 * Math.min(1, cans)} down color="#c0302a" />}
      {cans > 1 && <Can x={480} y={floor - 10} s={0.8 * Math.min(1, cans - 1)} down color="#2a6ac0" />}
      {o.box && <PhoneBox x={600} y={floor - 70} s={0.75} />}
      <Hero x={250} y={floor} s={0.85} pose={slumpPose(f)} look={lookB(o.bDim ?? 0.1)} hold={(j) => <Phone x={(j.wN[0] + j.wF[0]) / 2 + 6} y={(j.wN[1] + j.wF[1]) / 2 - 10} rot={-20} s={1.1} glow="#ffffff" />} />
      <LightPool cx={300} cy={floor - 300} rx={220} color="#ffffff" a={0.32 + 0.06 * Math.sin(f * 0.9)} />
    </g>
  );
};
const Building: React.FC<{ f: number; a: RoomOpts; b: RoomOpts }> = ({ f, a, b }) => (
  <g>
    <rect x={-600} y={-600} width={2280} height={3200} fill="#07080e" />
    <rect x={-600} y={-600} width={2280} height={1800} fill={MAT.stars} opacity={0.7} />
    <Moon x={930} y={180} r={36} />
    <Skyline y={1650} seed={4} color="#0e1222" lit={0.6} />
    <Slab x={60} y={300} w={960} h={40} /><Slab x={60} y={920} w={960} h={40} /><Slab x={60} y={1540} w={960} h={40} />
    <Slab x={60} y={340} w={30} h={1200} /><Slab x={990} y={340} w={30} h={1200} />
    <RoomA f={f} o={a} />
    <RoomB f={f} o={b} />
    <rect x={-600} y={1580} width={2280} height={1000} fill={MAT.asphalt} /><rect x={-600} y={1580} width={2280} height={1000} fill="#000" opacity={0.5} />
  </g>
);

// ---------------------------------------------------------------- text
const Big: React.FC<{ y: number; lines: { t: string; at: number; color?: string }[]; f: number; size?: number }> = ({ y, lines, f, size = 76 }) => (
  <div style={{ position: "absolute", left: 30, right: 30, top: y, textAlign: "center", fontFamily: BIG, fontSize: size, lineHeight: 1.12, textShadow: "0 4px 24px rgba(0,0,0,0.85)" }}>
    {lines.map((l, i) => { const p = prog(f, l.at, l.at + 6, "back"); return <div key={i} style={{ color: l.color ?? "#f4f4f4", opacity: clamp(p * 2), transform: `scale(${0.7 + 0.3 * p})` }}>{l.t}</div>; })}
  </div>
);

// ---------------------------------------------------------------- shots
const S0: React.FC<{ f: number }> = ({ f }) => {
  const nA = prog(f, Q.NOTIF, Q.NOTIF + 8, "out"), th = prog(f, Q.THUMB, Q.THUMB + 12, "out"), sw = prog(f, Q.SWIPE, Q.SWIPE + 8, "in");
  const tip: V = [lerp(1300, 850, th) + sw * 420, lerp(2250, 1110, th) - sw * 20];
  return (
    <TwoPass f={f} html={<Title f={f - 6} text="WE ALL SWIPE THIS AWAY." y={150} />}>
      <Cam f={f} keys={[{ f: 0, x: 540, y: 960, z: 1.0 }, { f: 90, x: 540, y: 980, z: 1.08, e: "inOut" }]} kicks={[{ f: Q.SWIPE + 4, amp: 7 }]}>
        <LightPool cx={540} cy={1000} rx={700} color="#ffffff" a={0.18} />
        <PhoneBig x={540} y={1000} s={1.9} screen="notif" notifX={sw * 480} notifA={nA * (1 - sw * 0.9)} time="9:00" battery={34} />
        {th > 0 && <Thumb x={tip[0]} y={tip[1]} from={[1180, 1990]} w={110} />}
        <Motes f={f} x={0} y={300} w={1080} h={1400} n={24} a={0.3} />
      </Cam>
    </TwoPass>
  );
};
const S1: React.FC<{ f: number }> = ({ f }) => {
  const lit = Math.floor(clamp((f - Q.GRID0) / (Q.GRID1 - Q.GRID0)) * 91);
  const k = lit - 1, cx = 90 + (k % 13) * 66 + 29, cy = 520 + Math.floor(k / 13) * 66 + 29;
  return (
    <TwoPass f={f} html={<Big f={f} y={250} size={70} lines={[{ t: "6H A DAY × 365", at: Q.MATH + 2 }]} />}>
      <Cam f={f} keys={[{ f: Q.MATH, x: 540, y: 960, z: 1.06 }, { f: Q.BUILD, x: 540, y: 940, z: 1.0, e: "inOut" }]} kicks={[{ f: Q.DAYS, amp: 16 }]}>
        <DayGrid x={90} y={520} cols={13} n={91} lit={lit} cell={58} color="#f2f2f2" />
        {k >= 0 && lit < 91 && <Glow at={[cx, cy]} r={90} a={0.7} />}
        <LightPool cx={540} cy={800} rx={600} color="#ffffff" a={0.12 + 0.25 * prog(f, Q.DAYS, Q.DAYS + 4) * (1 - prog(f, Q.DAYS + 4, Q.DAYS + 20))} />
      </Cam>
      {/* the big result lives in the svg so the shake moves it too */}
      <g opacity={prog(f, Q.DAYS, Q.DAYS + 3)}>
        <text x={540} y={1560} textAnchor="middle" fontFamily={BIG} fontSize={104} fill="#ffffff">= 91 DAYS</text>
        <text x={540} y={1680} textAnchor="middle" fontFamily={BIG} fontSize={104} fill="#ffffff">A YEAR.</text>
      </g>
    </TwoPass>
  );
};
const buildingKeys: CamKey[] = [
  { f: Q.BUILD, x: 540, y: 1250, z: 1.75 }, { f: Q.TILT, x: 560, y: 1245, z: 1.8, e: "inOut" },
  { f: Q.TILT + 14, x: 560, y: 640, z: 1.8, e: "burst" }, { f: Q.WIDE, x: 560, y: 640, z: 1.82, e: "inOut" },
  { f: Q.WIDE + 18, x: 540, y: 960, z: 1.0, e: "burst" }, { f: Q.BOOK, x: 540, y: 960, z: 1.08, e: "inOut" },
];
const S2: React.FC<{ f: number }> = ({ f }) => {
  const late = f >= Q.LATE;
  const mins = late ? 167 * ease.inOut(clamp((f - Q.SPIN0) / (Q.SPIN1 - Q.SPIN0))) : (f - Q.BUILD) * 0.05;
  const lamp = 1 - prog(f, Q.LAMPOFF, Q.LAMPOFF + 3);
  const leave = prog(f, Q.LAMPOFF + 2, Q.LAMPOFF + 14);
  const cans = clamp((f - Q.CAN1) / 4) + clamp((f - Q.CAN2) / 4);
  const title = late ? <Title f={f - Q.LATE} text={'"JUST ONE VIDEO."'} y={150} /> : <Title f={f - Q.WIDE - 6} text="SAME BUILDING. SAME HOUR." y={150} />;
  return (
    <TwoPass f={f} vig={0.55} html={title}>
      <Cam f={f} keys={buildingKeys} blur={0.35}>
        <Building f={f} a={{ clock: [9, mins], lamp, aA: 1 - leave, tone: "warm", balls: late ? 2 : 0 }} b={{ clock: [9, mins], cans, bDim: 0.1 + 0.25 * prog(f, Q.LATE, Q.BOOK) }} />
      </Cam>
      <Flash f={f} at={Q.BUILD} dur={4} />
    </TwoPass>
  );
};
const PAGE = "M6 -160 L250 -168 L250 162 L6 168 Z";
const S4: React.FC<{ f: number }> = ({ f }) => {
  const flips = [Q.FLIP1, Q.FLIP2, Q.FLIP3];
  const stage = flips.filter((x) => f >= x + 4).length;
  const skill = [0, 0.3, 0.62, 1][stage], label = ["DAY 1", "DAY 30", "DAY 100", "YEAR 1"][stage];
  const flipT = flips.map((x) => (f - x) / 8).find((t) => t >= 0 && t < 1);
  const pc: V = [540 + (130 + Math.sin(f * 0.45) * 40) * 1.5, 960 + (-40 + Math.cos(f * 0.33) * 50) * 1.5];
  return (
    <TwoPass f={f} bg="#120e0a" html={<Title f={f - Q.BOOK} text="THE SAME CAT. EVERY NIGHT." y={150} />}>
      <Cam f={f} keys={[{ f: Q.BOOK, x: 540, y: 960, z: 1.0 }, { f: Q.FAIL, x: 560, y: 940, z: 1.12, e: "inOut" }]} kicks={flips.map((x) => ({ f: x + 4, amp: 5, dur: 8 }))}>
        <rect x={-400} y={-400} width={1880} height={2720} fill={MAT.wood} /><rect x={-400} y={-400} width={1880} height={2720} fill="#000" opacity={0.55} />
        <Acc><LightPool cx={700} cy={600} rx={900} color={ACC} a={0.3} /></Acc>
        <Sketchbook x={540} y={960} s={1.5} skill={skill} label={label} seed={2 + stage * 3} />
        {flipT !== undefined && (
          <g transform="translate(540 960) scale(1.5)">
            <g transform={`scale(${Math.cos(flipT * Math.PI)} 1)`}><path d={PAGE} fill={Math.cos(flipT * Math.PI) > 0 ? "#f4efe2" : "#e6e0d0"} stroke="#0b0b0d" strokeWidth={2.5} /></g>
          </g>
        )}
        <Acc><Pencil x={pc[0]} y={pc[1]} rot={-30} s={1.6} /></Acc>
      </Cam>
    </TwoPass>
  );
};
const S5: React.FC<{ f: number }> = ({ f }) => {
  const floor = A_Y + RH - 20;
  let pose: Pose;
  if (f < Q.TEAR) pose = drawPose(f, 0.9);
  else if (f < Q.BALL) pose = mix(drawPose(f, 0.9), ripPose, prog(f, Q.TEAR, Q.TEAR + 4));
  else if (f < Q.SILENCE) pose = mix(ripPose, headInHands, prog(f, Q.BALL, Q.SILENCE));
  else if (f < Q.LOOKUP) pose = headInHands;
  else if (f < Q.PENCIL) pose = mix(headInHands, drawPose(f), prog(f, Q.LOOKUP, Q.PENCIL));
  else pose = drawPose(f, f >= Q.DROP ? 1.1 : 0.6);
  const ball = (() => { const t = clamp((f - Q.BALL) / (Q.THUD - Q.BALL)); return { p: [lerp(760, 560, t), lerp(floor - 190, floor - 8, t) - Math.sin(t * Math.PI) * 120] as V, on: f >= Q.BALL }; })();
  const lamp = f < Q.SILENCE ? 0.8 : f < Q.DROP ? 0.55 + 0.1 * Math.sin(f * 0.7) : 1;
  const flare = prog(f, Q.DROP, Q.DROP + 2) * (1 - prog(f, Q.DROP + 2, Q.DROP + 18));
  return (
    <TwoPass f={f} vig={0.9} html={<Title f={f - Q.FAIL} text="2:13 AM. NOBODY IS WATCHING." y={190} out={Q.PENCIL - Q.FAIL} />}>
      <Cam f={f} keys={[{ f: Q.FAIL, x: 560, y: 960, z: 1.0 }, { f: Q.SILENCE, x: 600, y: 900, z: 1.06, e: "inOut" }, { f: Q.DROP - 1, x: 690, y: 860, z: 1.3, e: "inOut" }, { f: Q.DROP + 10, x: 600, y: 940, z: 1.05, e: "burst" }, { f: Q.YEAR, x: 600, y: 940, z: 1.08 }]}
        kicks={[{ f: Q.THUD, amp: 6 }, { f: Q.DROP, amp: 20 }]}>
        <g transform="translate(-520 -260) scale(1.55)">
          <RoomBox x={RX} y={A_Y} w={RW} h={RH} tone="dark" />
          <Window x={130} y={A_Y + 110} w={180} h={220} f={f} />
          <WallClock x={470} y={A_Y + 150} r={46} h={2} m={13 + (f - Q.FAIL) * 0.02} />
          <Desk x={790} y={floor} w={300} h={150} />
          <Chair x={690} y={floor} />
          <Acc><DeskLamp x={930} y={floor - 150} s={0.9} flip on={lamp} /></Acc>
          <rect x={720} y={floor - 158} width={110} height={8} rx={2} fill="#f4efe2" stroke="#0b0b0d" strokeWidth={2} />
          {[[520, 21], [560, 3], [600, 8], [640, 11], [700, 14]].map(([px, sd], i) => <PaperBall key={i} x={px} y={floor - 8 - (i % 2) * 6} s={0.7} seed={sd} />)}
          {ball.on && <PaperBall x={ball.p[0]} y={ball.p[1]} s={0.7} seed={33} />}
          <Hero x={690} y={floor} s={0.85} pose={pose} hold={f >= Q.PENCIL || f < Q.TEAR ? pencilHold : undefined} />
          <Acc><LightPool cx={820} cy={floor - 190} rx={220 + flare * 300} ry={160 + flare * 200} color={ACC} a={0.35 + flare * 0.5} /></Acc>
        </g>
        <ImpactRing f={f} f0={Q.THUD} at={[350, 820]} size={70} />
      </Cam>
      <Flash f={f} at={Q.DROP} dur={6} color="#fff2d8" />
    </TwoPass>
  );
};
const S6: React.FC<{ f: number }> = ({ f }) => {
  const arts = [Q.ART1, Q.ART2, Q.ART3, Q.ART4, Q.ART5].map((t) => prog(f, t, t + 8, "linear"));
  return (
    <TwoPass f={f} vig={0.55} html={<Title f={f - Q.YEAR} text="ONE YEAR LATER." y={150} />}>
      <Cam f={f} blur={0.35} kicks={[Q.ART1, Q.ART2, Q.ART3, Q.ART4, Q.ART5].map((t) => ({ f: t, amp: 5, dur: 8 }))} keys={[
        { f: Q.YEAR, x: 640, y: 600, z: 1.75 }, { f: Q.DOWN, x: 660, y: 590, z: 1.85, e: "inOut" },
        { f: Q.DOWN + 12, x: 520, y: 1250, z: 1.8, e: "burst" }, { f: Q.DOWN + 20, x: 520, y: 1250, z: 1.82 }, { f: Q.MAIL, x: 540, y: 960, z: 1.0, e: "burst" },
      ]}>
        <Building f={f} a={{ clock: [9, (f - Q.YEAR) * 0.05], arts, tone: "warm", laptop: true, balls: 2, aPose: drawPose(f, 0.8) }} b={{ clock: [9, (f - Q.YEAR) * 0.05], cans: 2, box: true, bDim: 0.65 }} />
        {arts.map((p, i) => p > 0 && p < 1 && <Sparkle key={i} f={f} at={[[640, 770, 900, 700, 840][i] + 50, A_Y + [150, 140, 160, 300, 290][i] - 60]} s={1.4} ph={1.5} />)}
      </Cam>
    </TwoPass>
  );
};
const S7: React.FC<{ f: number }> = ({ f }) => (
  <TwoPass f={f} bg="#100c0a" html={<Title f={f - Q.MAIL} text="SOMEONE NOTICED." y={150} />}>
    <Cam f={f} keys={[{ f: Q.MAIL, x: 540, y: 960, z: 1.0 }, { f: Q.ZOOM, x: 520, y: 980, z: 1.04, e: "inOut" }, { f: Q.ZOOM + 14, x: 380, y: 1000, z: 1.5, e: "burst" }, { f: Q.UPG, x: 390, y: 1000, z: 1.56 }]} kicks={[{ f: Q.POP, amp: 6 }]}>
      <rect x={-400} y={1200} width={1880} height={1200} fill={MAT.wood} /><rect x={-400} y={1200} width={1880} height={1200} fill="#000" opacity={0.45} />
      <LaptopMail x={540} y={1220} s={1.55} p={prog(f, Q.POP, Q.POP + 10, "back")} />
      <Sketchbook x={560} y={1560} s={0.7} skill={1} seed={9} rot={6} />
      <LightPool cx={540} cy={800} rx={700} color="#ffffff" a={0.18} />
    </Cam>
  </TwoPass>
);
const S8: React.FC<{ f: number }> = ({ f }) => (
  <TwoPass f={f} vig={0.8} html={<Big f={f} y={200} size={72} lines={[{ t: "HIS PHONE", at: Q.UPG + 6 }, { t: "GOT AN UPGRADE.", at: Q.UPG + 14 }]} />}>
    <Cam f={f} keys={[{ f: Q.UPG, x: 540, y: 960, z: 1.0 }, { f: Q.DAY1, x: 470, y: 1000, z: 1.12, e: "inOut" }]}>
      <g transform="translate(-180 -1180) scale(1.5)">
        <RoomB f={f} o={{ clock: [9, 0], cans: 2, box: true, bDim: 0.7 }} />
      </g>
      <PhoneBig x={790} y={1430} s={0.55} screen="feed" f={f} newModel time="9:00" rot={8} />
      <PhoneBig x={600} y={1560} s={0.4} screen="off" rot={-70} />
    </Cam>
  </TwoPass>
);
const LINE: V[] = [[600, 1350], [612, 1322], [632, 1300], [660, 1290], [690, 1294], [716, 1310], [734, 1336], [742, 1362]];
const S9: React.FC<{ f: number }> = ({ f }) => {
  const drop = prog(f, Q.DAY1, Q.FACEDOWN, "in"), open = f >= Q.OPEN;
  const p = prog(f, Q.LINE0, Q.LINE1, "inOut"), n = Math.max(1, Math.round(p * (LINE.length - 1)));
  const pts = LINE.slice(0, n + 1), tip = pts[pts.length - 1];
  return (
    <TwoPass f={f} bg="#100c0a" html={<div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: '"Segoe UI Semibold", "Segoe UI", Arial, sans-serif', fontSize: 40, letterSpacing: 3, color: ACC, opacity: prog(f, Q.LINE0, Q.LINE0 + 10) }}>DAY 1.</div>}>
      <Cam f={f} keys={[{ f: Q.DAY1, x: 540, y: 1000, z: 1.0 }, { f: Q.END, x: 600, y: 1220, z: 1.22, e: "inOut" }]} kicks={[{ f: Q.FACEDOWN, amp: 10 }]}>
        <rect x={-400} y={-400} width={1880} height={2720} fill={MAT.wood} /><rect x={-400} y={-400} width={1880} height={2720} fill="#000" opacity={0.5} />
        <LightPool cx={540} cy={900} rx={700} color="#ffffff" a={0.15} />
        <g transform={`translate(470 820) rotate(-12) scale(${0.8 * (1.3 - 0.3 * drop)})`} opacity={clamp(drop * 3)}>
          <rect x={-150} y={-310} width={300} height={620} rx={46} fill="#d8d2c4" stroke="#0b0b0d" strokeWidth={3} />
          <circle cx={-80} cy={-240} r={28} fill="#2a2a30" stroke="#0b0b0d" strokeWidth={3} /><circle cx={-80} cy={-170} r={28} fill="#2a2a30" stroke="#0b0b0d" strokeWidth={3} />
        </g>
        {open ? <Sketchbook x={540} y={1420} s={0.95} blank seed={1} label="DAY 1" /> : <Sketchbook x={540} y={1420} s={1.6} closed />}
        <Dust f={f} f0={Q.OPEN} at={[540, 1420]} n={14} seed={6} />
        {f >= Q.LINE0 && <Acc>
          <polyline points={pts.map((q) => q.join(",")).join(" ")} fill="none" stroke={ACC} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={tip[0]} cy={tip[1]} r={26} fill={ACC} opacity={0.35} filter="url(#k-blur10)" />
          <Pencil x={tip[0]} y={tip[1]} rot={-35} s={1.4} />
        </Acc>}
      </Cam>
    </TwoPass>
  );
};
const S10: React.FC<{ f: number }> = ({ f }) => {
  const n = prog(f, Q.LOOP, Q.LOOP + 8, "out");
  return (
    <TwoPass f={f} bg="#050507" html={<Big f={f} y={1180} size={64} lines={[{ t: "YOUR PHONE", at: Q.END + 4 }, { t: "UPGRADES EVERY YEAR.", at: Q.END + 14 }, { t: "DO YOU?", at: Q.END + 30, color: ACC }]} />}>
      <Cam f={f} keys={[{ f: Q.END, x: 540, y: 960, z: 1.12 }, { f: Q.END + 12, x: 540, y: 960, z: 1.0, e: "burst" }, { f: Q.LEN, x: 540, y: 940, z: 1.04, e: "inOut" }]} kicks={[{ f: Q.HIT, amp: 18 }]}>
        <PhoneBig x={540} y={760} s={1.1} screen={n > 0 ? "notif" : "lock"} notifA={n} time="9:00" />
      </Cam>
      <Flash f={f} at={Q.HIT} dur={8} />
    </TwoPass>
  );
};

export const UpgradeFilm: React.FC = () => {
  const f = useCurrentFrame();
  if (f < Q.MATH) return <S0 f={f} />;
  if (f < Q.BUILD) return <S1 f={f} />;
  if (f < Q.BOOK) return <S2 f={f} />;
  if (f < Q.FAIL) return <S4 f={f} />;
  if (f < Q.YEAR) return <S5 f={f} />;
  if (f < Q.MAIL) return <S6 f={f} />;
  if (f < Q.UPG) return <S7 f={f} />;
  if (f < Q.DAY1) return <S8 f={f} />;
  if (f < Q.END) return <S9 f={f} />;
  return <S10 f={f} />;
};
