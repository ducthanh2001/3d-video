// UpgradeBoard: key frames of "YOUR PHONE UPGRADES EVERY YEAR. DO YOU?" for approval (frame n = key frame n).
// 0 hook (screen-time report swiped away) · 1 the maths (91 days) · 2 building 9:00 PM · 3 building 11:47 PM · 4 sketchbook DAY 1/100/YEAR 1
// 5 the failure (2:13 AM) · 6 building ONE YEAR LATER · 7 the email ($300) · 8 his phone got an upgrade · 9 B's first line · 10 end card
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Hero, LOOK_WHITE, Pose } from "../../kit/hero";
import { KitDefs, LightPool, Grain, Vignette, MAT } from "../../kit/materials";
import { Chair, Desk, Moon, Phone, Window, WallClock } from "../../kit/props";
import { Motes, Glow } from "../../kit/fx";
import { Title } from "../../kit/demo/shared";
import { Can, CoffeeTable, DayGrid, DeskLamp, FramedArt, LaptopMail, PaperBall, Pencil, PhoneBig, PhoneBox, RoomBox, Sketchbook, Shelf, Skyline, Slab, SnackBag, Sofa, Thumb } from "./props";

export const UPGRADE_KEYS = 11;
const BIG = '"Arial Black", Impact, "Segoe UI Black", sans-serif';

// ---------------------------------------------------------------- the building
const RX = 90, RW = 900, A_Y = 340, B_Y = 960, RH = 580;
type BState = "9pm" | "late" | "year";
const LOOK_B: (dim: number) => typeof LOOK_WHITE = (dim) => ({ ...LOOK_WHITE, body: `rgb(${247 - dim * 90},${247 - dim * 90},${245 - dim * 80})`, far: `rgb(${185 - dim * 70},${185 - dim * 70},${185 - dim * 60})`, glow: 0.45 * (1 - dim) });

/** A at the desk drawing (s = 0.85): legs under the desk, both hands on the page */
const drawPose = (f = 0): Pose => ({ hip: [0, -128], lean: 16, head: 22, hN: [104 + Math.sin(f * 0.5) * 6, 72], hF: [84, 80], fN: [104, 0], fF: [124, 0] });
/** B slumped on the sofa, phone up close */
const slumpPose: Pose = { hip: [0, -112], lean: -26, head: 34, hN: [56, 34], hF: [44, 40], fN: [168, -4], fF: [190, 0], elbow: -1 };
// elbows on the desk, both hands holding the bowed head (elbow +1 keeps the elbows down)
const headInHandsDesk: Pose = { hip: [0, -128], lean: 34, head: 46, hN: [44, -8], hF: [30, -16], fN: [104, 0], fF: [124, 0], elbow: 1 };

const Room: React.FC<{ who: "A" | "B"; y: number; state: BState; f: number }> = ({ who, y, state, f }) => {
  const fy = y + RH, floor = fy - 20;
  const late = state === "late", year = state === "year";
  const tone = who === "A" ? (late ? "dark" : "warm") : "cool";
  const clock = state === "9pm" ? { h: 9, m: 0 } : late ? { h: 11, m: 47 } : { h: 9, m: 0 };
  return (
    <g>
      <RoomBox x={RX} y={y} w={RW} h={RH} tone={tone} lightOn={who === "A" && !late} />
      {MONO && who === "B" && <rect x={RX} y={y} width={RW} height={RH} fill="#000" opacity={0.4} />}
      <Window x={130} y={y + 110} w={180} h={220} f={f} />
      <WallClock x={470} y={y + 150} r={46} h={clock.h} m={clock.m} />
      {who === "A" && year
        ? <>{[[640, y + 150, 0.95, 2, -2], [770, y + 140, 0.9, 5, 3], [900, y + 160, 0.92, 8, -1], [700, y + 300, 0.85, 11, 2], [840, y + 290, 0.97, 14, -3]].map(([ax, ay, sk, sd, tl], i) => <FramedArt key={i} x={ax} y={ay} w={86} skill={sk} seed={sd} tilt={tl} />)}</>
        : <Shelf x={640} y={y + 200} w={220} seed={who === "A" ? 2 : 5} />}
      <Sofa x={300} y={floor} color={who === "A" ? "#5a4636" : "#3a3550"} />
      <CoffeeTable x={560} y={floor} w={150} />
      <Desk x={790} y={floor} w={300} h={150} />
      <Chair x={690} y={floor} />
      {who === "A" && (
        <>
          <DeskLamp x={930} y={floor - 150} s={0.9} flip on={late ? 0 : 1} />
          <rect x={720} y={floor - 158} width={110} height={8} rx={2} fill="#f4efe2" stroke="#0b0b0d" strokeWidth={2} />
          {year && <g transform={`translate(${880} ${floor - 150}) scale(0.2)`}><LaptopMail x={0} y={0} p={1} /></g>}
          {!late && <Hero x={690} y={floor} s={0.85} pose={drawPose(f)} hold={(j) => <g transform={`translate(${j.wN[0]} ${j.wN[1]}) rotate(-30)`}><rect x={-3} y={-34} width={6} height={30} fill="#f2c13b" stroke="#0b0b0d" strokeWidth={1.5} /></g>} />}
          {!late && <LightPool cx={820} cy={floor - 170} rx={260} ry={200} color="#ffcf8a" a={0.45} />}
          {!late && <Glow at={[700, floor - 300]} r={160} color="#ffd9a0" a={0.25} />}
          {state !== "9pm" && <><PaperBall x={600} y={floor - 8} s={0.7} seed={3} /><PaperBall x={640} y={floor - 6} s={0.6} seed={8} /></>}
        </>
      )}
      {who === "B" && (
        <>
          <Sketchbook x={790} y={floor - 160} s={0.3} closed />
          <rect x={746} y={floor - 186} width={90} height={4} fill="#9a9aa0" opacity={0.6} />
          <SnackBag x={530} y={floor - 70} s={0.7} /><Can x={590} y={floor - 70} s={0.8} /><Can x={620} y={floor - 30} s={0.8} down={late || year} color="#c0302a" />
          {(late || year) && <Can x={480} y={floor - 10} s={0.8} down color="#2a6ac0" />}
          {year && <PhoneBox x={600} y={floor - 70} s={0.75} />}
          <Hero x={250} y={floor} s={0.85} pose={slumpPose} look={LOOK_B(year ? 0.65 : late ? 0.35 : 0.1)} hold={(j) => <Phone x={(j.wN[0] + j.wF[0]) / 2 + 6} y={(j.wN[1] + j.wF[1]) / 2 - 10} rot={-20} s={1.1} glow="#5a8aff" />} />
          <LightPool cx={300} cy={floor - 300} rx={220} color={MONO ? "#ffffff" : "#4a7bff"} a={MONO ? 0.4 : 0.55} />
        </>
      )}
    </g>
  );
};

const Building: React.FC<{ f: number; state: BState }> = ({ f, state }) => (
  <g>
    <defs><linearGradient id="upSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#05060e" /><stop offset="100%" stopColor="#1c2448" /></linearGradient></defs>
    <rect x={0} y={0} width={1080} height={1920} fill="url(#upSky)" />
    <rect x={0} y={0} width={1080} height={1200} fill={MAT.stars} opacity={0.7} />
    <Moon x={930} y={180} r={36} />
    <Skyline y={1650} seed={4} color="#0e1222" lit={0.6} />
    <Slab x={60} y={300} w={960} h={40} />
    <Slab x={60} y={920} w={960} h={40} />
    <Slab x={60} y={1540} w={960} h={40} />
    <Slab x={60} y={340} w={30} h={1200} /><Slab x={990} y={340} w={30} h={1200} />
    <Room who="A" y={A_Y} state={state} f={f} />
    <Room who="B" y={B_Y} state={state} f={f} />
    <rect x={0} y={1580} width={1080} height={340} fill={MAT.asphalt} /><rect x={0} y={1580} width={1080} height={340} fill="#000" opacity={0.5} />
  </g>
);

// ---------------------------------------------------------------- frames
const Big: React.FC<{ y: number; lines: string[]; size?: number; color?: string }> = ({ y, lines, size = 76, color = "#f4f4f4" }) => (
  <div style={{ position: "absolute", left: 40, right: 40, top: y, textAlign: "center", fontFamily: BIG, fontSize: size, lineHeight: 1.1, color, textShadow: "0 4px 24px rgba(0,0,0,0.8)" }}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
/** MONO = the channel look: the whole frame in black and white (grey world, white figures and light). false = colour version */
export const MONO = true;
const Frame: React.FC<{ f: number; children: React.ReactNode; html?: React.ReactNode; bg?: string; vig?: number }> = ({ f, children, html, bg = "#08080b", vig = 0.75 }) => (
  <AbsoluteFill style={{ background: bg, filter: MONO ? "grayscale(1) contrast(1.12)" : undefined }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      <KitDefs />
      {children}
      <Vignette a={vig} />
      <Grain f={f} a={0.05} />
    </svg>
    {html}
  </AbsoluteFill>
);

const K0: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} html={<Title f={40} text="WE ALL SWIPE THIS AWAY." y={150} />}>
    <LightPool cx={540} cy={1000} rx={700} color="#4a6aff" a={0.25} />
    <PhoneBig x={540} y={1000} s={1.9} screen="notif" notifX={60} time="9:00" battery={34} />
    <Thumb x={850} y={1110} from={[1180, 1960]} w={110} />
    <Motes f={f} x={0} y={300} w={1080} h={1400} n={24} a={0.3} />
  </Frame>
);
const K1: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} html={<><Big y={250} lines={["6H A DAY × 365"]} size={70} /><Big y={1500} lines={["= 91 DAYS", "A YEAR."]} size={96} color="#9ab4ff" /></>}>
    <DayGrid x={90} y={520} cols={13} n={91} lit={91} cell={58} color={MONO ? "#f2f2f2" : undefined} />
    <LightPool cx={540} cy={800} rx={600} color="#4a7bff" a={0.3} />
  </Frame>
);
const K2: React.FC<{ f: number }> = ({ f }) => <Frame f={f} vig={0.55} html={<Title f={40} text="SAME BUILDING. SAME HOUR." y={190} />}><Building f={f} state="9pm" /></Frame>;
const K3: React.FC<{ f: number }> = ({ f }) => <Frame f={f} vig={0.55} html={<Title f={40} text={'"JUST ONE VIDEO."'} y={190} />}><Building f={f} state="late" /></Frame>;
const K4: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} bg="#120e0a" html={<Title f={40} text="THE SAME CAT. EVERY NIGHT." y={150} />}>
    <rect x={0} y={0} width={1080} height={1920} fill={MAT.wood} /><rect x={0} y={0} width={1080} height={1920} fill="#000" opacity={0.55} />
    <LightPool cx={700} cy={500} rx={900} color="#ffcf8a" a={0.35} />
    <Sketchbook x={540} y={480} s={0.95} skill={0.02} label="DAY 1" seed={2} rot={-3} />
    <Sketchbook x={540} y={950} s={0.95} skill={0.5} label="DAY 100" seed={5} rot={2} />
    <Sketchbook x={540} y={1420} s={0.95} skill={1} label="YEAR 1" seed={9} rot={-1.5} />
    <Pencil x={880} y={1600} rot={-40} s={1.4} />
  </Frame>
);
const K5: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} vig={0.9} html={<Title f={40} text="2:13 AM. NOBODY IS WATCHING." y={190} />}>
    <g transform="translate(-520 -260) scale(1.55)">
      <RoomBox x={RX} y={A_Y} w={RW} h={RH} tone="dark" />
      <Window x={130} y={A_Y + 110} w={180} h={220} f={f} />
      <WallClock x={470} y={A_Y + 150} r={46} h={2} m={13} />
      <Desk x={790} y={A_Y + RH - 20} w={300} h={150} />
      <Chair x={690} y={A_Y + RH - 20} />
      <DeskLamp x={930} y={A_Y + RH - 170} s={0.9} flip on={0.7} />
      <rect x={720} y={A_Y + RH - 178} width={110} height={8} rx={2} fill="#f4efe2" stroke="#0b0b0d" strokeWidth={2} />
      {[[560, 3], [600, 8], [640, 11], [700, 14], [520, 21], [760, 25]].map(([px, sd], i) => <PaperBall key={i} x={px} y={A_Y + RH - 30 - (i % 2) * 6} s={0.7} seed={sd} />)}
      <Hero x={690} y={A_Y + RH - 20} s={0.85} pose={headInHandsDesk} />
      <LightPool cx={820} cy={A_Y + RH - 190} rx={220} ry={160} color="#ffcf8a" a={0.35} />
    </g>
  </Frame>
);
const K6: React.FC<{ f: number }> = ({ f }) => <Frame f={f} vig={0.55} html={<Title f={40} text="ONE YEAR LATER." y={190} />}><Building f={f} state="year" /></Frame>;
const K7: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} bg="#100c0a" html={<Title f={40} text="SOMEONE NOTICED." y={150} />}>
    <rect x={0} y={1200} width={1080} height={720} fill={MAT.wood} /><rect x={0} y={1200} width={1080} height={720} fill="#000" opacity={0.45} />
    <LaptopMail x={540} y={1220} s={1.55} p={1} />
    <Sketchbook x={560} y={1560} s={0.7} skill={1} seed={9} rot={6} />
    <LightPool cx={540} cy={800} rx={700} color="#bcd8ff" a={0.25} />
  </Frame>
);
const K8: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} vig={0.8} html={<Big y={200} lines={["HIS PHONE", "GOT AN UPGRADE."]} size={72} />}>
    <g transform="translate(-180 -1180) scale(1.5)">
      <Room who="B" y={B_Y} state="year" f={f} />
    </g>
    <PhoneBig x={790} y={1430} s={0.55} screen="feed" f={f} newModel time="9:00" rot={8} />
    <PhoneBig x={600} y={1560} s={0.4} screen="off" rot={-70} />
  </Frame>
);
const K9: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} bg="#100c0a" html={<><Title f={40} text="DAY 1." y={150} /></>}>
    <rect x={0} y={0} width={1080} height={1920} fill={MAT.wood} /><rect x={0} y={0} width={1080} height={1920} fill="#000" opacity={0.5} />
    <LightPool cx={540} cy={900} rx={700} color="#ffcf8a" a={0.3} />
    <g transform="translate(540 980) rotate(-6) scale(0.9)">
      <rect x={-150} y={-310} width={300} height={620} rx={46} fill="#d8d2c4" stroke="#0b0b0d" strokeWidth={3} />
      <circle cx={-80} cy={-240} r={28} fill="#2a2a30" stroke="#0b0b0d" strokeWidth={3} /><circle cx={-80} cy={-170} r={28} fill="#2a2a30" stroke="#0b0b0d" strokeWidth={3} />
    </g>
    <Sketchbook x={540} y={1420} s={0.95} blank seed={1} label="DAY 1" />
    <path d="M620 1340 q30 -40 70 -30 q40 10 50 50" fill="none" stroke="#2a2a30" strokeWidth={4} strokeLinecap="round" />
    <Pencil x={746} y={1366} rot={-35} s={1.4} />
  </Frame>
);
const K10: React.FC<{ f: number }> = ({ f }) => (
  <Frame f={f} bg="#050507" html={<Big y={1180} lines={["YOUR PHONE", "UPGRADES EVERY YEAR.", "DO YOU?"]} size={64} />}>
    <PhoneBig x={540} y={760} s={1.1} screen="lock" time="9:00" />
  </Frame>
);

const KEYS = [K0, K1, K2, K3, K4, K5, K6, K7, K8, K9, K10];
export const UpgradeBoard: React.FC = () => {
  const f = useCurrentFrame();
  const K = KEYS[Math.min(KEYS.length - 1, f)];
  return <K f={40 + f * 7} />;
};
