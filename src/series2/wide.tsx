// Wide, stacked scenes of "Two Lives, One Clock": the top half of the frame is ALEX (warm light), the bottom half is BEN (cool light), each one a
// full-width wide shot of his surroundings, with ONE shared clock on the divider so both halves are the same moment. Success is shown with
// concrete objects: a growth chart on the wall that rises step by step for Alex (certificate -> project -> promotion + raise -> team) and
// stays flat for Ben. No wealth contrast: Alex's world is an ordinary office, Ben's an ordinary flat. Content is drawn in "room" coordinates
// (floor at y = 1420, visible band y 540..1500) and the Stack places it in the top / bottom half.
import React from "react";
import { MonoSvg, Overlay, Stickman, Spec } from "./stick";
import { Bed, Browser, Chair, Clock, Clutter, Cup, Defs, Desk, FONT, Laptop, Lamp, LectureLaptop, Notebook, Phone, Plant, Room, Shelf, Sofa, Street, Table, Whiteboard, Window } from "./props";

const FL = 1420, WARM = "#ffcf8a", COOL = "#8fb4ff", PACK = "#47658a", GREY = "#34343f";
const rnd = (i: number) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const stand = (x: number, flip = false, e: Partial<Spec> = {}): Spec => ({ hip: [x, FL - 185], footN: [x + 22 * (flip ? -1 : 1), FL - 6], footF: [x - 24 * (flip ? -1 : 1), FL - 6], flip, ...e });
const sit = (x: number, flip = false, e: Partial<Spec> = {}): Spec => ({ hip: [x, FL - 132], torso: 6, footN: [x + 108 * (flip ? -1 : 1), FL - 6], footF: [x + 140 * (flip ? -1 : 1), FL - 6], flip, ...e });
const walk = (x: number, e: Partial<Spec> = {}): Spec => ({ hip: [x, FL - 180], torso: 5, footN: [x + 64, FL - 6], footF: [x - 56, FL - 30], armN: -0.5, armF: 0.55, ...e });
const GREYMAN = { color: GREY, rim: "#c8ccd8", rimA: 0.45 };

// ---------------------------------------------------------------- stack layout
const PH = 740, DIV = 80, BAND = 715; // each tier shows room rows BAND..BAND+PH; the tiers + label band end at y = 1560 (above the Shorts bottom zone)
const Stack: React.FC<{ top: React.ReactNode; bottom: React.ReactNode; h?: number; m?: number; title?: string[]; titleColor?: string }> = ({ top, bottom, h, m, title }) => (
  <MonoSvg>
    <Defs />
    <defs><clipPath id="pTop"><rect x={0} y={0} width={1080} height={PH} /></clipPath><clipPath id="pBot"><rect x={0} y={PH + DIV} width={1080} height={PH} /></clipPath></defs>
    <g clipPath="url(#pTop)"><g transform={`translate(0 ${-BAND})`}>{top}</g></g>
    <g clipPath="url(#pBot)"><g transform={`translate(0 ${PH + DIV - BAND})`}>{bottom}</g></g>
    <rect x={0} y={PH} width={1080} height={DIV} fill="#07070a" />
    <rect x={0} y={PH + DIV + PH} width={1080} height={360} fill="#07070a" />
    <Overlay>
      {h !== undefined && <Clock cx={540} cy={PH + DIV / 2} r={36} hour={h} min={m ?? 0} glow={false} dark />}
      {title && <text x={60} y={PH + 54} fontFamily='"Segoe UI", Arial, sans-serif' fontWeight={700} fontSize={40} letterSpacing={8} fill="#ffffff">{title.join(" ")}</text>}
      <text x={540} y={1720} textAnchor="middle" fontFamily='"Segoe UI", Arial, sans-serif' fontSize={24} letterSpacing={8} fill="#6c6c6c">CHANNEL NAME</text>
    </Overlay>
  </MonoSvg>
);

// ---------------------------------------------------------------- success markers
/** the wall chart: rising bars (Alex) or a flat line (Ben); `lit` bars are filled; a flag on the top bar when `flag` */
const Growth: React.FC<{ x: number; y: number; w: number; h: number; n: number; lit: number; flat?: boolean; flag?: boolean }> = ({ x, y, w, h, n, lit, flat, flag }) => {
  const bw = (w - 36) / n, bh = (i: number) => (flat ? h * 0.26 : h * (0.18 + 0.6 * (i / Math.max(1, n - 1))));
  const top = lit > 0 ? [x + 18 + (lit - 1) * bw + bw / 2, y + h - 14 - bh(lit - 1)] : [0, 0];
  return (
    <g>
      <rect x={x - 6} y={y - 6} width={w + 12} height={h + 12} rx={10} fill="#8d9096" /><rect x={x} y={y} width={w} height={h} rx={6} fill="#f6f8fb" />
      {Array.from({ length: n }, (_, i) => <rect key={i} x={x + 18 + i * bw + 3} y={y + h - 14 - bh(i)} width={bw - 6} height={bh(i)} rx={3} fill={flat ? "#8a98bc" : i < lit ? "#2f9e6a" : "#d3d9e4"} />)}
      {flat && <line x1={x + 14} x2={x + w - 14} y1={y + h - 14 - bh(0) - 12} y2={y + h - 14 - bh(0) - 12} stroke="#b0b8cc" strokeWidth={4} strokeDasharray="10 8" />}
      {!flat && flag && lit > 0 && <g><line x1={top[0]} x2={top[0]} y1={top[1]} y2={top[1] - 46} stroke="#4a4a55" strokeWidth={4} /><polygon points={`${top[0]},${top[1] - 46} ${top[0] + 34},${top[1] - 34} ${top[0]},${top[1] - 22}`} fill="#e0443a" /></g>}
    </g>
  );
};
const Certificate: React.FC<{ x: number; y: number; w: number; h: number; l1: string; l2?: string }> = ({ x, y, w, h, l1, l2 }) => (
  <g>
    <rect x={x - 8} y={y - 8} width={w + 16} height={h + 16} fill="#5a3a22" /><rect x={x} y={y} width={w} height={h} fill="#fffaf0" stroke="#d4b25a" strokeWidth={5} />
    <text x={x + w / 2} y={y + h * 0.36} textAnchor="middle" fontFamily={FONT} fontSize={h * 0.15} fill="#6a4a1a">{l1}</text>
    {l2 && <text x={x + w / 2} y={y + h * 0.56} textAnchor="middle" fontFamily={FONT} fontSize={h * 0.15} fill="#6a4a1a">{l2}</text>}
    <circle cx={x + w / 2} cy={y + h * 0.78} r={h * 0.11} fill="#d8453a" /><polygon points={`${x + w / 2 - 10},${y + h * 0.86} ${x + w / 2 - 18},${y + h * 1.02} ${x + w / 2 - 4},${y + h * 0.96}`} fill="#d8453a" /><polygon points={`${x + w / 2 + 10},${y + h * 0.86} ${x + w / 2 + 18},${y + h * 1.02} ${x + w / 2 + 4},${y + h * 0.96}`} fill="#d8453a" />
  </g>
);
const Nameplate: React.FC<{ x: number; y: number; text: string }> = ({ x, y, text }) => (
  <g><rect x={x} y={y - 30} width={text.length * 12 + 26} height={30} rx={4} fill="#2b2e3a" stroke="#d4b25a" strokeWidth={3} /><text x={x + (text.length * 12 + 26) / 2} y={y - 9} textAnchor="middle" fontFamily={FONT} fontSize={15} fill="#ffe9a0">{text}</text></g>
);
/** envelope with a green up-arrow badge: the raise */
const Raise: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-50} y={-32} width={100} height={64} rx={5} fill="#fbf7ea" stroke="#a89a70" strokeWidth={3} /><polyline points="-50,-32 0,6 50,-32" fill="none" stroke="#a89a70" strokeWidth={3} />
    <circle cx={34} cy={22} r={22} fill="#2f9e6a" stroke="#fff" strokeWidth={3} /><polygon points="34,8 24,24 31,24 31,34 37,34 37,24 44,24" fill="#fff" />
  </g>
);
const Confetti: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => (
  <g>{Array.from({ length: 34 }, (_, i) => <rect key={i} x={x + rnd(i) * w} y={y + rnd(i + 40) * h} width={9} height={5} fill={["#e0443a", "#ffd27a", "#4a90e0", "#2f9e6a"][i % 4]} transform={`rotate(${rnd(i + 80) * 180} ${x + rnd(i) * w} ${y + rnd(i + 40) * h})`} />)}</g>
);
const Projector: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => (
  <g>
    <rect x={x - 8} y={y - 8} width={w + 16} height={h + 16} fill="#2b2e3a" /><rect x={x} y={y} width={w} height={h} fill="#f4f8ff" />
    <rect x={x + 18} y={y + 16} width={w * 0.5} height={14} rx={6} fill="#2a4a7a" />
    {[0.2, 0.4, 0.6, 0.8].map((k, i) => <rect key={k} x={x + 24 + k * (w - 90)} y={y + h - 22 - (28 + i * 26)} width={24} height={28 + i * 26} fill="#4a78c0" />)}
    <polyline points={`${x + 30},${y + h - 40} ${x + w * 0.35},${y + h - 70} ${x + w * 0.6},${y + h - 92} ${x + w - 30},${y + 50}`} fill="none" stroke="#2f9e6a" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);
const Monitor: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><rect x={-6} y={-30} width={12} height={30} fill="#2b2e3a" /><rect x={-34} y={-4} width={68} height={8} rx={3} fill="#2b2e3a" /><rect x={-60} y={-118} width={120} height={90} rx={5} fill="#1b1d26" stroke="#3a3f52" strokeWidth={3} /><rect x={-54} y={-112} width={108} height={78} fill="#dcebff" />{[0, 1, 2, 3].map((i) => <rect key={i} x={-46} y={-104 + i * 16} width={70 - i * 8} height={7} rx={3} fill="#4a78c0" opacity={0.8} />)}</g>
);

// ---------------------------------------------------------------- year 1: 8:00 PM
export const W3: React.FC = () => (
  <Stack h={8} m={0} title={["YEAR 1"]}
    top={<>
      <Room x={0} w={1080} floorY={FL} wall={["#7b5b46", "#5d4333"]} floor={["#7a583b", "#52382a"]} />
      <Window x={70} y={720} w={170} h={290} sky="skyNight" /><Shelf x={300} y={800} w={180} seed={4} />
      <Growth x={600} y={800} w={170} h={140} n={5} lit={1} />
      <Certificate x={830} y={740} w={190} h={140} l1="COURSE" l2="COMPLETE" />
      <Desk x={130} y={FL} w={440} /><Chair x={100} y={FL} /><Lamp x={500} y={FL - 168} on floorY={FL} />
      <LectureLaptop x={330} y={FL - 168} s={1.3} done /><Notebook x={470} y={FL - 178} s={0.8} open />
      <Stickman spec={sit(88, false, { torso: 8, head: 4, handN: [222, FL - 178], handF: [238, FL - 180] })} rim={WARM} pack={PACK} shadowY={FL} />
      <Plant x={1010} y={FL} s={1} />
    </>}
    bottom={<>
      <Room x={0} w={1080} floorY={FL} wall={["#27305a", "#1c2442"]} floor={["#262a42", "#181b2e"]} />
      <Window x={70} y={720} w={170} h={290} sky="skyNight" /><Clutter x={110} y={FL - 6} />
      <Growth x={600} y={800} w={170} h={140} n={5} lit={5} flat />
      <Sofa x={330} y={FL} w={340} />
      <g transform="translate(870 1060)">{[0, 1, 2, 3].map((i) => <g key={i} opacity={0.95 - i * 0.2}><rect x={-80} y={i * 46 - 20} width={170} height={38} rx={6} fill="#1e2438" stroke="#6a7ab0" strokeWidth={2} /><rect x={-72} y={i * 46 - 14} width={40} height={26} rx={3} fill="#4a5a90" /><rect x={-24} y={i * 46 - 10} width={100} height={7} rx={3} fill="#9aaad0" /></g>)}</g>
      <Stickman spec={{ hip: [480, FL - 136], torso: -4, head: 38, handN: [560, 1216], footN: [590, FL - 6], footF: [616, FL - 6], armF: 0.3 }} rim={COOL} />
      <Phone x={566} y={1198} rot={-6} s={1.4} ui="off" />
    </>}
  />
);

// ---------------------------------------------------------------- year 3: 7:00 PM
export const W4: React.FC = () => (
  <Stack h={7} m={0} title={["YEAR 3"]}
    top={<>
      <Room x={0} w={1080} floorY={FL} wall={["#e9e0d2", "#d6cab6"]} floor={["#8c8f98", "#6a6d78"]} />
      <Projector x={50} y={850} w={330} h={220} />
      <Window x={760} y={740} w={160} h={250} sky="skyDusk" />
      <Growth x={440} y={780} w={170} h={150} n={5} lit={2} />
      <Table x={560} y={FL} w={500} />
      {[640, 800, 960].map((cx, i) => <g key={cx}><Chair x={cx} y={FL} flip /><Stickman spec={sit(cx + 10, true, { torso: 0, head: 6, footN: [cx - 40, FL - 6], footF: [cx - 70, FL - 6], handN: i === 0 ? [cx - 44, 1090] : [cx - 40, FL - 176], handF: [cx - 30, FL - 178], armN: i === 0 ? -2.4 : undefined })} {...GREYMAN} /></g>)}
      <Laptop x={700} y={FL - 160} s={0.5} screen="code" /><Laptop x={880} y={FL - 160} s={0.5} screen="code" />
      <Stickman spec={stand(440, true, { handN: [350, 1010], head: 6, armF: -0.2 })} rim={WARM} pack={PACK} shadowY={FL} />
    </>}
    bottom={<>
      <Room x={0} w={1080} floorY={FL} wall={["#27305a", "#1c2442"]} floor={["#262a42", "#181b2e"]} />
      <Window x={90} y={720} w={160} h={260} sky="skyDusk" />
      <Growth x={300} y={800} w={170} h={140} n={5} lit={5} flat />
      <rect x={560} y={740} width={180} height={150} rx={6} fill="#f7f2e2" stroke="#a89a70" strokeWidth={3} />
      {Array.from({ length: 21 }, (_, i) => <g key={i}><rect x={572 + (i % 7) * 23} y={776 + Math.floor(i / 7) * 34} width={18} height={26} rx={3} fill={i < 4 ? "#ffd27a" : "#e8e2cc"} />{i < 4 && <line x1={572 + (i % 7) * 23} y1={776 + Math.floor(i / 7) * 34} x2={590 + (i % 7) * 23} y2={802 + Math.floor(i / 7) * 34} stroke="#d8453a" strokeWidth={3} />}</g>)}
      <Desk x={520} y={FL} w={420} tone="cool" /><Chair x={900} y={FL} flip />
      <Laptop x={680} y={FL - 168} s={1.2} screen="course" glow="#cfe0ff" />
      <rect x={630} y={FL - 270} width={110} height={8} rx={4} fill="#cfd8ea" /><rect x={630} y={FL - 270} width={10} height={8} rx={4} fill="#e0443a" />
      <Phone x={820} y={FL - 196} rot={84} s={1.3} />
      <Stickman spec={sit(910, true, { torso: 4, head: 26, handN: [770, FL - 178], handF: [808, FL - 190], armF: 0.2 })} rim={COOL} />
    </>}
  />
);

// ---------------------------------------------------------------- year 5: 9:00 AM
export const W5: React.FC = () => (
  <Stack h={9} m={0} title={["YEAR 5"]}
    top={<>
      <Room x={0} w={1080} floorY={FL} wall={["#eae7e0", "#d6d1c4"]} floor={["#8c8f98", "#6a6d78"]} />
      <Window x={60} y={740} w={150} h={250} sky="skyDay" /><Window x={880} y={740} w={150} h={250} sky="skyDay" />
      <Growth x={300} y={780} w={190} h={160} n={5} lit={4} flag />
      <Certificate x={560} y={760} w={180} h={130} l1="PROMOTED" />
      <Desk x={60} y={FL} w={300} /><Monitor x={200} y={FL - 168} s={1.1} /><Nameplate x={90} y={FL - 168} text="TEAM LEAD" />
            <Raise x={500} y={1040} s={1.1} rot={-8} />
      <Stickman spec={stand(400, false, { handN: [488, 1044], head: -10, armF: 0.2 })} rim={WARM} pack={PACK} shadowY={FL} />
      <Stickman spec={stand(590, true, { handN: [512, 1044], head: 4 })} {...GREYMAN} shadowY={FL} />
      <Stickman spec={stand(760, true, { handN: [722, 1118], handF: [730, 1112], head: 4 })} {...GREYMAN} shadowY={FL} /><Stickman spec={stand(880, true, { handN: [842, 1118], handF: [850, 1112], head: 4 })} {...GREYMAN} shadowY={FL} />
      <Confetti x={380} y={600} w={320} h={300} />
    </>}
    bottom={<>
      <Room x={0} w={1080} floorY={FL} wall={["#d9d4e8", "#c4bede"]} floor={["#8a8aa8", "#6a6a88"]} />
      <Window x={60} y={740} w={150} h={250} sky="skyDay" />
      <Growth x={300} y={780} w={190} h={160} n={5} lit={5} flat />
      <g transform="translate(620 780) rotate(-4)"><rect width={220} height={160} rx={6} fill="#ffe98a" stroke="#c8a830" strokeWidth={3} /><text x={110} y={66} textAnchor="middle" fontFamily={FONT} fontSize={32} fill="#3a3320">START</text><text x={110} y={116} textAnchor="middle" fontFamily={FONT} fontSize={28} fill="#3a3320">TOMORROW</text></g>
      <Desk x={640} y={FL} w={340} tone="cool" /><Browser x={690} y={FL - 440} w={250} h={200} tabs={11} /><Laptop x={800} y={FL - 168} s={1.2} screen="tabs" glow="#bcd0ff" /><Chair x={1020} y={FL} flip />
      <Cup x={680} y={FL - 168} s={0.9} steam={false} />
      <Stickman spec={sit(1030, true, { torso: 8, head: 32, handN: [838, FL - 178], handF: [852, FL - 180] })} rim={COOL} />
      <Stickman spec={stand(520, false, { handN: [600, 1090], head: -4 })} {...GREYMAN} />
      <g transform="translate(560 1000)"><circle r={20} fill="#fffaf0" stroke="#a8a08a" strokeWidth={3} /><text y={8} textAnchor="middle" fontFamily={FONT} fontSize={26} fill="#4a4a55">?</text></g>
    </>}
  />
);

// ---------------------------------------------------------------- ten years later: 6:00 PM
export const W7: React.FC = () => (
  <Stack h={6} m={0} title={["10 YEARS", "LATER"]} titleColor="#ffffff"
    top={<>
      <Room x={0} w={1080} floorY={FL} wall={["#3a4468", "#2b3354"]} floor={["#4a4d5a", "#33363f"]} />
      <Street x={80} y={800} w={420} h={FL - 800} /><rect x={80} y={800} width={420} height={FL - 800} fill="none" stroke="#2a2d3a" strokeWidth={12} />
      <Growth x={580} y={850} w={230} h={150} n={7} lit={7} flag />
      <Certificate x={850} y={850} w={70} h={52} l1="" /><Certificate x={940} y={850} w={70} h={52} l1="" />
      <Desk x={560} y={FL} w={300} /><Monitor x={680} y={FL - 168} s={1.1} /><Nameplate x={590} y={FL - 168} text="MANAGER" />
      <g transform={`translate(820 ${FL - 190})`}><rect x={-26} y={-34} width={52} height={40} rx={3} fill="#fffaf0" stroke="#a89a70" strokeWidth={3} /><circle cx={-10} cy={-18} r={6} fill="#4a4a55" /><circle cx={10} cy={-18} r={6} fill="#4a4a55" /><rect x={-16} y={-8} width={32} height={10} rx={4} fill="#4a4a55" /></g>
      <Chair x={900} y={FL} flip /><Stickman spec={sit(910, true, { torso: 8, head: 8, handN: [850, FL - 176] })} {...GREYMAN} />
      <Stickman spec={walk(330, { handN: [348, 1118], armF: 0.3, head: -6 })} rim={WARM} pack={PACK} shadowY={FL} />
      <Phone x={352} y={1100} rot={-10} s={0.75} glow="#cfe0ff" />
    </>}
    bottom={<>
      <Room x={0} w={1080} floorY={FL} wall={["#3b4068", "#2c3150"]} floor={["#2a2d44", "#1c1f33"]} />
      <Window x={110} y={800} w={190} h={260} sky="skyDusk" />
      <Growth x={560} y={850} w={210} h={150} n={7} lit={7} flat />
      <Bed x={760} y={FL} w={290} tone="cool" layer="base" /><Bed x={760} y={FL} w={290} tone="cool" layer="cover" /><Clutter x={340} y={FL - 6} />
      <Stickman spec={{ hip: [520, FL - 132], torso: 12, head: 32, handN: [450, FL - 232], handF: [478, FL - 234], footN: [440, FL - 6], footF: [466, FL - 6], flip: true }} rim={COOL} />
      <Notebook x={404} y={FL - 192} open s={1.3} rot={-12} />
      <Phone x={640} y={FL - 12} rot={90} s={0.9} ui="off" />
    </>}
  />
);

// ---------------------------------------------------------------- one step per milestone (inserted after each year)
// Alex climbs ONE stair (a milestone sits on every stair), head up; Ben walks straight along a flat road, head bowed over the phone,
// past the same kind of marker again and again. Both move the same distance to the right.
const STEP_W = 200, RISE = 75;
const stepX = (i: number) => (i === 0 ? 0 : 240 + (i - 1) * STEP_W);
const stepTop = (i: number) => FL - RISE * i;
const Sky: React.FC = () => <><rect x={0} y={0} width={1080} height={FL + 100} fill="url(#skyDay)" />{[0, 1, 2].map((i) => <ellipse key={i} cx={160 + i * 380} cy={700 + (i % 2) * 90} rx={120} ry={34} fill="#fff" opacity={0.7} />)}</>;
const MILESTONE = ["COURSE", "PROJECT", "RAISE", "TEAM"];
const Icon: React.FC<{ i: number; x: number; y: number; on: boolean }> = ({ i, x, y, on }) => (
  <g transform={`translate(${x} ${y}) scale(0.82)`} opacity={on ? 1 : 0.28}>
    {i === 1 && <Certificate x={-62} y={-92} w={124} h={88} l1="COURSE" l2="COMPLETE" />}
    {i === 2 && <g transform="translate(-70 -112)"><Projector x={0} y={0} w={140} h={92} /></g>}
    {i === 3 && <Raise x={0} y={-52} s={1.3} />}
    {i === 4 && <g><line x1={0} x2={0} y1={0} y2={-120} stroke="#4a4a55" strokeWidth={6} /><polygon points="0,-120 62,-98 0,-76" fill="#e0443a" /></g>}
  </g>
);
const Journey: React.FC<{ k: number; title?: string[] }> = ({ k, title }) => {
  const x0 = stepX(k) - 10, prev = stepTop(k - 1), hipY = prev - 37 - 6 - 130;
  return (
    <Stack title={title} titleColor="#ffd27a"
      top={<>
        <Sky /><rect x={0} y={FL} width={1080} height={100} fill="#7a8aa8" />
        {[1, 2, 3, 4].map((i) => <g key={i}><rect x={stepX(i)} y={stepTop(i)} width={i === 4 ? 1080 - stepX(i) : STEP_W} height={FL + 100 - stepTop(i)} fill={i <= k ? "#5a78b8" : "#8a98b8"} /><rect x={stepX(i)} y={stepTop(i)} width={i === 4 ? 1080 - stepX(i) : STEP_W} height={14} fill={i <= k ? "#9ab4ec" : "#b4bfd4"} /><Icon i={i} x={stepX(i) + (i === 4 ? 150 : 150)} y={stepTop(i) - 12} on={i <= k} /></g>)}
        <Stickman spec={{ hip: [x0, hipY], torso: 14, head: -14, footN: [stepX(k) + 46, stepTop(k) - 6], footF: [stepX(k) - 66, prev - 6], handN: [x0 + 96, hipY - 160], handF: [x0 - 70, hipY - 40], armF: 0.6 }} rim={WARM} pack={PACK} />
      </>}
      bottom={<>
        <Sky /><rect x={0} y={FL} width={1080} height={100} fill="#7a8aa8" /><rect x={0} y={FL - 12} width={1080} height={14} fill="#aab6d0" />
        {[0, 1, 2, 3, 4, 5].map((i) => <g key={i}><rect x={80 + i * 200 - 5} y={FL - 190} width={10} height={190} fill="#6a7088" /><circle cx={80 + i * 200} cy={FL - 196} r={14} fill="#e8ecf8" /></g>)}
        {[1, 2, 3, 4].map((i) => <g key={i} opacity={i <= k ? 1 : 0.28} transform={`translate(${stepX(i) + 138} ${FL - 14})`}>
          {i === 1 && <Phone x={0} y={-44} s={1.3} ui="feed" />}{i === 2 && <Browser x={-80} y={-130} w={160} h={120} tabs={7} />}
          {i === 3 && <g transform="translate(-52 -92) rotate(-4)"><rect width={104} height={78} rx={5} fill="#ffe98a" stroke="#c8a830" strokeWidth={3} /><text x={52} y={34} textAnchor="middle" fontFamily={FONT} fontSize={16} fill="#3a3320">START</text><text x={52} y={58} textAnchor="middle" fontFamily={FONT} fontSize={13} fill="#3a3320">TOMORROW</text></g>}
          {i === 4 && <Notebook x={0} y={-36} open s={1.1} />}</g>)}
        {[1, 2, 3].map((i) => <g key={i} opacity={i < k ? 0.5 : 0}><ellipse cx={x0 - 60 - i * 36} cy={FL - 3} rx={16} ry={5} fill="#1a1a24" /></g>)}
        <Stickman spec={{ hip: [x0, FL - 178], torso: 12, head: 40, footN: [x0 + 62, FL - 6], footF: [x0 - 56, FL - 34], handN: [x0 + 70, FL - 262], handF: [x0 - 40, FL - 150], armF: 0.2 }} rim={COOL} />
        <Phone x={x0 + 90} y={FL - 272} rot={70} s={1.1} ui="feed" />
      </>}
    />
  );
};
export const J1: React.FC = () => <Journey k={1} title={undefined} />;
export const J2: React.FC = () => <Journey k={2} title={undefined} />;
export const J3: React.FC = () => <Journey k={3} title={undefined} />;
export const J4: React.FC = () => <Journey k={4} title={undefined} />;
void MILESTONE;
export type { Spec };
export { Whiteboard, Cup, Plant };
