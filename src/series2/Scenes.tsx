// "TWO LIVES, ONE CLOCK": the twelve key frames of the script (frame n of composition `TwoLivesScenes` = scene n+1), for approval before any
// animation. Alex = warm yellow light, tidy rooms, backpack + notebook; Ben = cool blue light, messy rooms, phone in hand. Same body for both.
// Text only where the script puts text on screen; nothing in the bottom 20 % or the right 12 % of the 1080x1920 frame.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { MonoSvg, Overlay, Stickman, Spec } from "./stick";
import { BigText, Bed, Chair, Clock, Clutter, Cup, Defs, Desk, FONT, GamePhone, Laptop, Lamp, LectureLaptop, Nightstand, Notebook, Phone, Plant, Poster, Room, Shelf, Sofa, Street, Table, Window } from "./props";
import { V } from "../flat/rig/rig";
import { W3, W4, W5, W7, J1, J2, J3, J4 } from "./wide";

const FL = 1420; // floor line of every room
const WARM = "#ffcf8a", COOL = "#8fb4ff";
const PACK = "#47658a";
const rnd = (i: number) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

const stand = (x: number, flip = false, extra: Partial<Spec> = {}): Spec => ({ hip: [x, FL - 185], footN: [x + 22 * (flip ? -1 : 1), FL - 6], footF: [x - 24 * (flip ? -1 : 1), FL - 6], flip, ...extra });
const sit = (x: number, seatY: number, flip = false, extra: Partial<Spec> = {}): Spec => ({ hip: [x, seatY - 8], torso: 6, footN: [x + 108 * (flip ? -1 : 1), FL - 6], footF: [x + 140 * (flip ? -1 : 1), FL - 6], flip, ...extra });
const walk = (x: number, extra: Partial<Spec> = {}): Spec => ({ hip: [x, FL - 180], torso: 5, footN: [x + 64, FL - 6], footF: [x - 56, FL - 30], armN: -0.5, armF: 0.55, ...extra });

const Frame: React.FC<{ children: React.ReactNode; vig?: boolean }> = ({ children, vig = true }) => (
  <MonoSvg>
    <Defs />
    {children}
    {vig && <rect width={1080} height={1920} fill="url(#vig)" />}
    <Overlay><text x={540} y={1720} textAnchor="middle" fontFamily='"Segoe UI", Arial, sans-serif' fontSize={24} letterSpacing={8} fill="#6c6c6c">CHANNEL NAME</text></Overlay>
  </MonoSvg>
);
const Divider: React.FC<{ clock?: { h: number; m: number; y?: number; r?: number; label?: string } }> = ({ clock }) => (
  <g>
    <rect x={536} y={0} width={8} height={1920} fill="#0e0e13" />
    {clock && <><Clock cx={540} cy={clock.y ?? 420} r={clock.r ?? 118} hour={clock.h} min={clock.m} />{clock.label && <BigText x={340} y={(clock.y ?? 420) - (clock.r ?? 118) - 40} w={400} size={64} lines={[clock.label]} />}</>}
  </g>
);

// ---------------------------------------------------------------- 1 hook: two bedrooms, one clock
const S1: React.FC = () => (
  <Frame>
    {/* 6:00 AM: Alex opens the curtains and the sun comes in; Ben's curtains stay shut, he reaches for the phone */}
    <Room x={0} w={540} floorY={FL} wall={["#f3dcb8", "#e8c797"]} floor={["#b58c5c", "#8c6a44"]} />
    <Window x={70} y={700} w={190} h={360} sky="skyMorning" curtains="open" beam="warm" floorY={FL} />
    <Shelf x={300} y={720} w={190} seed={2} /><Plant x={470} y={FL} s={0.9} />
    <Bed x={10} y={FL} w={250} tone="warm" layer="base" /><Bed x={10} y={FL} w={250} tone="warm" layer="cover" />
    <Nightstand x={430} y={FL} tone="warm" clock="6:00" />
    <Stickman spec={stand(345, true, { handN: [268, 1030] })} rim={WARM} pack={PACK} shadowY={FL} />
    <Room x={540} w={540} floorY={FL} wall={["#4a5278", "#383f60"]} floor={["#33375a", "#232640"]} />
    <Window x={620} y={700} w={190} h={360} sky="skyMorning" curtains="closed" beam="cool" floorY={FL} />
    <Poster x={860} y={640} w={110} h={150} color="#7a4a8a" rot={-9} /><Clutter x={640} y={FL - 6} />
    <Bed x={640} y={FL} w={330} tone="cool" messy layer="base" />
    <Stickman spec={{ hip: [790, FL - 160], torso: -4, head: 40, handN: [872, FL - 262], handF: [858, FL - 256], footN: [920, FL - 158], footF: [950, FL - 156] }} rim={COOL} />
    <Phone x={886} y={FL - 272} rot={64} s={1.15} />
    <Bed x={640} y={FL} w={330} tone="cool" messy layer="cover" />
    <Nightstand x={985} y={FL} tone="cool" clock="6:00" />
    <Divider clock={{ h: 6, m: 1, y: 470 }} />
    <BigText x={0} y={170} w={1080} size={84} lines={["SAME 24 HOURS.", "DIFFERENT CHOICES."]} />
  </Frame>
);

// ---------------------------------------------------------------- 2 the same evening
const S2: React.FC = () => (
  <Frame>
    {/* 8:00 PM, same night: Alex studies with a lecture + notes; Ben plays a racing game on his phone */}
    <Room x={0} w={540} floorY={FL} wall={["#7b5b46", "#5d4333"]} floor={["#7a583b", "#52382a"]} />
    <Window x={50} y={600} w={150} h={290} sky="skyNight" /><Shelf x={290} y={640} w={200} seed={4} />
    <Desk x={110} y={FL} w={390} /><Chair x={78} y={FL} />
    <Lamp x={440} y={FL - 168} on floorY={FL} />
    <LectureLaptop x={270} y={FL - 168} s={1.3} />
    <Notebook x={430} y={FL - 178} s={0.9} rot={3} open />
    <Stickman spec={sit(66, FL - 124, false, { torso: 16, head: 18, handN: [196, FL - 178], handF: [212, FL - 180] })} rim={WARM} pack={PACK} shadowY={FL} />
    <Room x={540} w={540} floorY={FL} wall={["#27305a", "#1c2442"]} floor={["#262a42", "#181b2e"]} />
    <Window x={600} y={600} w={150} h={290} sky="skyNight" />
    <Sofa x={650} y={FL} w={330} /><Clutter x={640} y={FL - 6} />
    <Stickman spec={{ hip: [790, FL - 136], torso: 6, head: 26, handN: [872, 1228], handF: [856, 1220], footN: [900, FL - 6], footF: [926, FL - 6] }} rim="#bcd2ff" rimA={1} />
    <GamePhone x={880} y={1226} s={1.1} />
    <Divider clock={{ h: 8, m: 0, y: 470, label: "8:00 PM" }} />
  </Frame>
);

// ---------------------------------------------------------------- 3 year 1

// ---------------------------------------------------------------- 4 year 3

// ---------------------------------------------------------------- 5 year 5

// ---------------------------------------------------------------- 6 not every day
const S6: React.FC = () => (
  <Frame>
    {/* 9:30 PM: Alex is tired, closes the book and goes to rest; Ben watches a motivation video, writes huge goals and drops them */}
    <Room x={0} w={540} floorY={FL} wall={["#5a4636", "#43332a"]} floor={["#6a4c34", "#4a3426"]} />
    <Window x={50} y={600} w={150} h={290} sky="skyNight" /><Lamp x={440} y={FL - 168} on floorY={FL} /><Desk x={130} y={FL} w={320} /><Chair x={100} y={FL} />
    <g transform={`translate(300 ${FL - 190})`}><rect x={-52} y={-6} width={104} height={26} rx={4} fill="#4a78c0" stroke="#2a4a80" strokeWidth={3} /><rect x={-46} y={-12} width={92} height={10} rx={3} fill="#f2ecd8" /></g>
    <Plant x={500} y={FL} s={0.8} />
    <Stickman spec={sit(90, FL - 124, false, { torso: 18, head: 36, handN: [230, FL - 184], handF: [244, FL - 186] })} rim={WARM} pack={PACK} shadowY={FL} />
    <Room x={540} w={540} floorY={FL} wall={["#27305a", "#1c2442"]} floor={["#262a42", "#181b2e"]} />
    <Window x={900} y={600} w={130} h={290} sky="skyNight" />
    <rect x={580} y={620} width={250} height={250} rx={8} fill="#f7f2e2" stroke="#a89a70" strokeWidth={4} transform="rotate(-2 700 740)" />
    <text x={705} y={686} textAnchor="middle" fontFamily={FONT} fontSize={36} fill="#2a2a38" transform="rotate(-2 700 740)">MY GOALS</text>
    {[0, 1, 2, 3].map((i) => <rect key={i} x={612} y={716 + i * 34} width={i < 2 ? 190 - i * 26 : 80} height={11} rx={5} fill="#6a7aa8" opacity={i < 2 ? 0.9 : 0.35} transform="rotate(-2 700 740)" />)}
    <Stickman spec={stand(790, false, { handN: [852, 1190], handF: [850, 1010], torso: 4, head: 30, armF: -2.6 })} rim={COOL} />
    <Phone x={866} y={1190} rot={72} s={1.2} ui="video" />
    <Divider clock={{ h: 9, m: 30, y: 470, r: 90 }} />
  </Frame>
);

// ---------------------------------------------------------------- 7 ten years later

// ---------------------------------------------------------------- 8 the meeting (cafe)
const Cafe: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <>
    <Room x={0} w={1080} floorY={FL} wall={["#8a5a3c", "#6a4430"]} floor={["#5a3e2c", "#3a281e"]} />
    <Window x={150} y={560} w={780} h={440} sky="skyDusk" />
    <Street x={150} y={560} w={780} h={440} />
    <rect x={150} y={560} width={780} height={440} fill="none" stroke="#4a3322" strokeWidth={14} /><rect x={536} y={560} width={8} height={440} fill="#4a3322" />
    <Lamp x={120} y={420} on={false} /><circle cx={300} cy={420} r={110} fill="url(#warmGlow)" opacity={0.5} /><circle cx={780} cy={420} r={110} fill="url(#warmGlow)" opacity={0.5} />
    <Table x={310} y={FL} w={460} />
    {children}
  </>
);
const S8: React.FC = () => (
  <Frame>
    <Cafe />
    <Cup x={400} y={FL - 160} s={1.2} /><Cup x={680} y={FL - 160} s={1.2} />
    <Chair x={240} y={FL} />
    <Stickman spec={sit(250, FL - 124, false, { torso: 4, handN: [380, FL - 200] })} rim={WARM} pack={PACK} shadowY={FL} />
    <Notebook x={500} y={FL - 190} open s={1.2} rot={-3} />
    <Chair x={820} y={FL} flip />
    <Stickman spec={sit(830, FL - 124, true, { torso: 6, head: 12, handN: [700, FL - 200], handF: [690, FL - 176] })} rim={COOL} />
    <Phone x={700} y={FL - 200} rot={-30} s={1} ui="off" />
  </Frame>
);

// ---------------------------------------------------------------- 9 the line that lands
const S9: React.FC = () => (
  <Frame>
    <rect width={1080} height={1920} fill="#2e3556" />
    <circle cx={540} cy={640} r={430} fill="url(#coolGlow)" opacity={0.35} />
    <Clock cx={540} cy={620} r={250} hour={4} min={10} dark glow />
    {Array.from({ length: 14 }, (_, i) => { const x = 70 + rnd(i) * 940, y = 230 + rnd(i + 20) * 900, a = rnd(i + 40) * 80 - 40, k = 0.5 + rnd(i + 60) * 0.5; return <g key={i} transform={`translate(${x} ${y}) rotate(${a}) scale(${k})`} opacity={0.35 + 0.5 * rnd(i + 80)}><rect x={-46} y={-56} width={92} height={112} rx={6} fill="#fbf7ea" /><rect x={-46} y={-56} width={92} height={26} rx={6} fill="#d8453a" /><text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontSize={42} fill="#4a4a55">{(i * 3) % 31 + 1}</text></g>; })}
    <Room x={0} w={1080} floorY={FL + 120} wall={["#00000000", "#00000000"]} floor={["#3a4268", "#272d4a"]} />
    <Table x={300} y={FL + 120} w={480} />
    <Stickman spec={{ ...sit(250, FL - 4, false, { torso: 4, head: -40, handN: [324, FL - 48], handF: [304, FL - 46] }), footN: [358, FL + 114], footF: [388, FL + 114] }} rim={COOL} />
    <Stickman spec={{ ...sit(830, FL - 4, true, { torso: 4, head: -6, handN: [756, FL - 48], handF: [776, FL - 46] }), footN: [722, FL + 114], footF: [692, FL + 114] }} rim={WARM} pack={PACK} />
  </Frame>
);

// ---------------------------------------------------------------- 10 starting again
const S10: React.FC = () => (
  <Frame>
    <Room x={0} w={1080} floorY={FL} wall={["#f1dab6", "#e5c496"]} floor={["#b58c5c", "#8c6a44"]} />
    <Window x={640} y={600} w={300} h={400} sky="skyMorning" curtains="open" beam="warm" floorY={FL} />
    <Shelf x={90} y={720} w={260} seed={12} /><Plant x={420} y={FL} s={1} />
    <Desk x={250} y={FL} w={560} /><Chair x={230} y={FL} />
    <Laptop x={470} y={FL - 168} s={1.1} screen="timer" glow="#dff0ff" /><Notebook x={640} y={FL - 180} open s={1} rot={3} />
    <Phone x={760} y={FL - 184} rot={90} s={1} ui="off" />
    <Stickman spec={sit(215, FL - 124, false, { torso: 8, head: 8, handN: [425, FL - 176], handF: [440, FL - 178] })} rim={WARM} shadowY={FL} />
    <Clock cx={160} cy={560} r={70} hour={8} min={20} />
  </Frame>
);

// ---------------------------------------------------------------- 11 two rhythms, daylight
const S11: React.FC = () => (
  <Frame>
    {[0, 540].map((x) => <g key={x}><rect x={x} y={0} width={540} height={FL} fill="url(#skyDay)" /><rect x={x} y={FL} width={540} height={500} fill="#8a8f99" /><rect x={x} y={FL - 10} width={540} height={14} fill="#c8ccd4" /></g>)}
    {[0, 1, 2].map((i) => <rect key={i} x={30 + i * 170} y={700 - i * 50} width={120} height={FL - 700 + i * 50} fill={["#a8b4c8", "#c0c8d8", "#98a6bc"][i]} />)}
    {[0, 1, 2].map((i) => <rect key={i} x={570 + i * 170} y={680 + i * 40} width={120} height={FL - 680 - i * 40} fill={["#a8b4c8", "#c0c8d8", "#98a6bc"][i]} />)}
    <circle cx={460} cy={400} r={70} fill="#fff6d0" opacity={0.95} /><circle cx={1000} cy={400} r={70} fill="#fff6d0" opacity={0.95} />
    <Stickman spec={walk(260, { handN: [292, 1262], armF: 0.3, head: -8 })} rim={WARM} pack={PACK} shadowY={FL} />
    <Stickman spec={walk(800, { handN: [832, 1262], armF: 0.3, head: -4 })} rim={COOL} shadowY={FL} />
    <Notebook x={846} y={1262} s={0.8} rot={8} /><Notebook x={306} y={1262} s={0.7} rot={8} />
    <Divider clock={{ h: 9, m: 0, y: 470 }} />
  </Frame>
);

// ---------------------------------------------------------------- 12 the last line
const S12: React.FC = () => (
  <Frame vig>
    <rect width={1080} height={1920} fill="#0a0a10" />
    <circle cx={540} cy={830} r={460} fill="url(#warmGlow)" opacity={0.3} />
    <Clock cx={540} cy={830} r={250} hour={11} min={59} dark />
    <BigText x={0} y={1230} w={1080} size={84} lines={["DON'T WASTE", "YOUR NEXT", "24 HOURS."]} />
  </Frame>
);

const SCENES = [S1, S2, W3, J1, W4, J2, W5, J3, S6, W7, J4, S8, S9, S10, S11, S12];
export const TWO_LIVES_SCENES = SCENES.length;
export const TwoLivesScenes: React.FC = () => {
  const f = useCurrentFrame();
  const S = SCENES[Math.min(f, SCENES.length - 1)];
  return <AbsoluteFill style={{ background: "#000" }}><S /></AbsoluteFill>;
};
export type { V };
