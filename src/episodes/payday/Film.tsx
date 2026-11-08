// PaydayFilm: PAYDAY v3.2 "WHERE DID IT GO?" 41 s (1230 frames), 1080x1920, 30 fps. SFX only: the user adds Funk Universo in
// the Shorts editor from 0:00 (its 808 drop = frame 608 = Q.DROP, where the money starts flying off the pile).
// Built from the approved board pieces (Board.tsx). Times: events.ts.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { V, clamp, ease, lerp, prog } from "../../kit/core";
import { POSES, Pose, STRIDE, mixPose, walk } from "../../kit/hero";
import { Cam, Flash, RewindFx } from "../../kit/camera";
import { Sparkle } from "../../kit/fx";
import { GOLD, RED } from "../truths/StyleFrames";
import { Q } from "./events";
import {
  BIG, Bill, CAP, Corner, Cup, FlyingCoin, Frame, G, Ground, Item, Jar, Label, Meter, MoneyPile, Parcel, ROAD, SW, Shirt, W, WASTE,
  Fig, alongRoad, pocketHole, scratch, sitOn,
} from "./Board";

export const PAYDAY_FRAMES = Q.LEN;
const pop = (f: number, at: number) => ease.back(clamp((f - at) / 8));
const fade = (f: number, a: number, b?: number) => clamp((f - a) / 8) * (b === undefined ? 1 : 1 - clamp((f - b) / 8));

// ---------------------------------------------------------------- 1 hook: payday -> 3 days later -> rewind
const BIGM = { x: 640, y: 800, w: 130, h: 420 }, CORNER = { x: 950, y: 120, w: 44, h: 140 };
const S1: React.FC<{ f: number }> = ({ f }) => {
  const drain = prog(f, Q.DRAIN1, Q.DRAIN1 + 14, "in"), refill = prog(f, Q.REWIND + 6, Q.DAY1, "inOut");
  const p = f < Q.REWIND ? lerp(1, 0.08, drain) : lerp(0.08, 1, refill);
  const m = ease.inOut(prog(f, Q.TOCORNER, Q.CUPS));
  const mx = lerp(BIGM.x, CORNER.x, m), my = lerp(BIGM.y, CORNER.y, m), mw = lerp(BIGM.w, CORNER.w, m), mh = lerp(BIGM.h, CORNER.h, m);
  const pose: Pose = f < Q.LATER ? POSES.celebrate(f) : f < Q.REWIND ? mixPose(POSES.stand(), scratch, prog(f, Q.DRAIN1 + 4, Q.DRAIN1 + 14)) : POSES.idle(f);
  const title = f < Q.LATER ? "PAYDAY" : f < Q.REWIND ? "3 DAYS LATER" : f < Q.DAY1 ? "LET'S REWIND." : "DAY 1.";
  return (
    <Frame>
      <Cam f={f} keys={[{ f: 0, x: 540, y: 960, z: 1.06 }, { f: Q.LATER, x: 540, y: 960, z: 1.0, e: "burst" }, { f: Q.CUPS, x: 540, y: 960, z: 1.0 }]} kicks={[{ f: Q.DRAIN1 + 14, amp: 10 }]}>
        <Label y={420} t={title} size={44} />
        {f >= Q.WHERE && f < Q.REWIND && <g opacity={fade(f, Q.WHERE)}><Label y={490} t="WHERE DID IT GO?" size={30} color={G} /></g>}
        <Ground y={1300} />
        <g opacity={1 - m}><Fig x={400} y={1300 - (f < Q.LATER ? Math.abs(Math.sin(f * 0.25)) * 40 : 0)} pose={pose} s={0.95} /></g>
        <Meter x={mx} y={my} w={mw} h={mh} p={p} red={p < 0.2} glow={m < 0.5} />
      </Cam>
      <RewindFx f={f} at={Q.REWIND} dur={Q.DAY1 - Q.REWIND} />
    </Frame>
  );
};

// ---------------------------------------------------------------- 2 "it's only $6"
const S2: React.FC<{ f: number }> = ({ f }) => {
  const n = Math.min(22, Math.max(0, Math.floor((f - Q.CUP0) / 4.75) + 1));
  return (
    <Frame>
      <Corner p={lerp(1, 0.82, prog(f, Q.CUP0, Q.CUPS_END))} />
      <Cam f={f} keys={[{ f: Q.CUPS, x: 540, y: 1180, z: 1.1 }, { f: Q.CUPS_END, x: 560, y: 1000, z: 1.0, e: "inOut" }, { f: Q.CLOSET, x: 560, y: 990, z: 1.0 }]} kicks={[{ f: Q.SUM, amp: 8 }]}>
        <Label y={420} t={'"IT\'S ONLY $6"'} size={40} />
        <Ground y={1500} />
        {Array.from({ length: n }, (_, i) => { const c = i % 2, r = Math.floor(i / 2), s = 0.95 * pop(f, Q.CUP0 + i * 4.75); return <Cup key={i} x={660 + c * 92} y={1500 - r * 80} s={Math.max(0.01, s)} />; })}
        <Fig x={330} y={1500} pose={{ ...POSES.stand(), head: -24 * clamp(n / 10), lean: -4 }} s={0.85} />
        <text x={330} y={1060} textAnchor="middle" fontFamily={BIG} fontWeight={700} fontSize={64} fill={GOLD} transform={`scale(1)`}>${6 * Math.max(1, n)}</text>
        {f >= Q.SUM && <text x={330} y={1110} textAnchor="middle" fontFamily={CAP} fontWeight={600} fontSize={26} fill={G} opacity={fade(f, Q.SUM)}>$6 × 22 DAYS</text>}
      </Cam>
    </Frame>
  );
};

// ---------------------------------------------------------------- 3 "I have nothing to wear."
const SPILL: [number, number, number][] = [[-60, -40, -70], [40, -30, 80], [150, -20, 15], [-140, -10, 40], [90, -16, -50]];
const S3: React.FC<{ f: number }> = ({ f }) => {
  const walkIn = prog(f, Q.CLOSET, Q.BAGS, "out"), fx = lerp(-60, 280, walkIn);
  const pose = f < Q.BAGS ? walk(((fx + 60) / (2 * STRIDE)) * 1.2) : scratch;
  return (
    <Frame>
      <Corner p={lerp(0.82, 0.6, prog(f, Q.BAGS, Q.TAGS))} />
      <Cam f={f} keys={[{ f: Q.CLOSET, x: 540, y: 1040, z: 1.0 }, { f: Q.NIGHT, x: 560, y: 1060, z: 1.08, e: "inOut" }]} kicks={[{ f: Q.SPILL, amp: 6 }]}>
        <Label y={420} t={'"I HAVE NOTHING TO WEAR."'} size={38} />
        <Ground y={1450} />
        <g transform="translate(700 1450)">
          <rect x={-170} y={-520} width={340} height={520} fill="#000" stroke={W} strokeWidth={SW} />
          <path d="M-170 -520 L-250 -490 L-250 -20 L-170 0" fill="#000" stroke={W} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M170 -520 L250 -490 L250 -20 L170 0" fill="#000" stroke={W} strokeWidth={SW} strokeLinejoin="round" />
          <line x1={-160} y1={-470} x2={160} y2={-470} stroke={W} strokeWidth={4} />
          {Array.from({ length: 7 }, (_, i) => <Shirt key={i} x={-130 + i * 44} y={-400 + Math.sin(f * 0.2 + i) * (f > Q.SPILL ? 3 : 0)} s={0.9} tag={i % 2 === 0} />)}
          {Array.from({ length: 6 }, (_, i) => <Shirt key={`b${i}`} x={-120 + i * 48} y={-230} s={0.85} r={(i - 2.5) * 6} tag={i % 3 === 1} />)}
          {SPILL.map(([sx, sy, sr], i) => { const t = ease.bounce(clamp((f - Q.SPILL - i * 5) / 16)); return f >= Q.SPILL + i * 5 ? <Shirt key={`s${i}`} x={sx * t} y={lerp(-300, sy, t)} s={0.9} r={sr * t} tag={i % 2 === 0} /> : null; })}
        </g>
        {f >= Q.TAGS && <text x={700} y={1530} textAnchor="middle" fontFamily={BIG} fontWeight={700} fontSize={34} fill={RED} transform={`translate(700 1520) scale(${pop(f, Q.TAGS)}) translate(-700 -1520)`}>TAGS STILL ON</text>}
        <Fig x={fx} y={1450} pose={pose} s={0.85} hold={(j) => <g transform={`translate(${j.wF[0]} ${j.wF[1]})`}><Item kind="bag" x={0} y={34} s={1.1} /></g>} />
        {f >= Q.BAGS && <><Item kind="bag" x={190} y={1424} s={1.1} /><Item kind="bag" x={380} y={1424} s={1.1} /></>}
      </Cam>
    </Frame>
  );
};

// ---------------------------------------------------------------- 4 2:07 AM add to cart -> boxes at the door
const BOXES: [number, number, number][] = [[720, 1300, 1], [800, 1300, 1.1], [880, 1300, 0.9], [960, 1300, 0.8], [760, 1244, 0.9], [850, 1236, 1], [800, 1180, 0.8]];
const S4: React.FC<{ f: number }> = ({ f }) => {
  const morning = prog(f, Q.MORNING, Q.MORNING + 10);
  return (
    <Frame>
      <Corner p={lerp(0.6, 0.45, prog(f, Q.TAP1, Q.MINUS))} />
      <Cam f={f} keys={[{ f: Q.NIGHT, x: 380, y: 1150, z: 1.35 }, { f: Q.MORNING - 4, x: 400, y: 1140, z: 1.42, e: "inOut" }, { f: Q.MORNING + 6, x: 560, y: 1060, z: 1.0, e: "burst" }, { f: Q.PILE, x: 600, y: 1060, z: 1.04 }]}
        kicks={BOXES.map((_, i) => ({ f: Q.BOXES + i * 4 + 8, amp: 3, dur: 6 }))}>
        <rect x={-200} y={-200} width={1500} height={2400} fill="#151518" opacity={0.6 * morning} />
        <Ground y={1300} />
        <g stroke={W} strokeWidth={SW} fill="#000" strokeLinejoin="round">
          <rect x={120} y={1180} width={480} height={60} rx={10} />
          <rect x={110} y={1080} width={24} height={220} rx={6} /><rect x={590} y={1150} width={24} height={150} rx={6} />
          <rect x={140} y={1146} width={110} height={36} rx={14} />
        </g>
        <Fig x={300} y={1180} pose={{ hip: [0, -24], lean: -80, head: -30, hN: [70, -40 + Math.sin(f * 0.8) * 2], hF: [60, -30], fN: [200, -14], fF: [194, -10], elbow: -1 }} s={0.7} flip
          hold={(j) => <g transform={`translate(${j.wN[0] + 8} ${j.wN[1] - 18}) rotate(20)`}><rect x={-14} y={-26} width={28} height={50} rx={5} fill="#f2f2f2" /><rect x={-10} y={-20} width={20} height={38} rx={2} fill="#000" /><circle r={44} fill="#fff" opacity={0.18 * (1 - morning)} filter="url(#k-blur10)" /></g>} />
        {[Q.TAP1, Q.TAP2, Q.TAP3].map((t, i) => f >= t && f < t + 20 ? <text key={t} x={230 + i * 20} y={1080 - (f - t) * 2} fontFamily={BIG} fontWeight={700} fontSize={26} fill={W} opacity={1 - (f - t) / 20}>+1 ADDED</text> : null)}
        <g stroke={W} strokeWidth={SW} fill="none"><rect x={780} y={860} width={170} height={440} /><circle cx={930} cy={1090} r={6} fill={W} /></g>
        {BOXES.map(([px, py, ps], i) => { const t = clamp((f - Q.BOXES - i * 4) / 8); return t > 0 ? <Parcel key={i} x={px} y={lerp(py - 500, py, ease.in(t))} s={ps} /> : null; })}
        {f >= Q.MINUS && <text x={840} y={1370} textAnchor="middle" fontFamily={BIG} fontWeight={700} fontSize={40} fill={RED} transform={`translate(840 1360) scale(${pop(f, Q.MINUS)}) translate(-840 -1360)`}>-$240</text>}
      </Cam>
      {/* titles glued to the screen (the camera zooms in at night) */}
      <Label y={420} t={morning < 0.5 ? "2:07 AM" : "NEXT MORNING"} size={44} />
      {morning < 0.5 && <Label y={490} t={'"ADD TO CART"'} size={30} color={G} />}
    </Frame>
  );
};

// ---------------------------------------------------------------- 5 the money pile (two lanes) - the drop
const TARGETS_T: V[] = [[640, 780], [710, 800], [770, 790]], TARGETS_B: V[] = [[660, 1530], [730, 1540], [800, 1530]];
const S5: React.FC<{ f: number }> = ({ f }) => {
  const s = 0.7;
  const aTop = 1 - 0.88 * prog(f, Q.DROP, Q.PILE_END, "linear"), aBot = 1 - 0.45 * prog(f, Q.JAR_DONE, Q.PILE_END, "linear");
  const topH = 200 * aTop, botH = 200 * aBot;
  const floored = prog(f, Q.PILE_END - 50, Q.PILE_END - 30);
  const topPose = mixPose(sitOn(10, s), POSES.hugKnees(), floored);
  const topY = lerp(860 - topH + 4, 860, floored);
  const jar = lerp(0, 0.6, prog(f, Q.DROP + 10, Q.JAR_DONE));
  const bills: React.ReactNode[] = [];
  if (f >= Q.DROP) for (let k = 0; Q.DROP + k * 6 < Math.min(f, Q.PILE_END - 20); k++) {
    const t = (f - (Q.DROP + k * 6)) / 24; if (t > 1) continue;
    bills.push(<FlyingCoin key={`t${k}`} from={[400, 860 - topH * 0.8]} to={TARGETS_T[k % 3]} t={t} />);
  }
  for (let k = 0; k < 5; k++) { const t = (f - (Q.DROP + k * 5)) / 22; if (t > 0 && t <= 1) bills.push(<FlyingCoin key={`j${k}`} from={[420, 1600 - 180]} to={[860, 1470]} t={t} />); }
  if (f >= Q.JAR_DONE) for (let k = 0; Q.JAR_DONE + k * 18 < Math.min(f, Q.PILE_END); k++) {
    const t = (f - (Q.JAR_DONE + k * 18)) / 24; if (t > 1) continue;
    bills.push(<FlyingCoin key={`b${k}`} from={[380, 1600 - botH * 0.8]} to={TARGETS_B[k % 3]} t={t} />);
  }
  return (
    <Frame>
      <Cam f={f} keys={[{ f: Q.PILE, x: 540, y: 1000, z: 1.04 }, { f: Q.PILE_END, x: 540, y: 980, z: 1.0, e: "inOut" }]} kicks={[{ f: Q.DROP, amp: 12 }]}>
        <Label y={330} t="SPEND, THEN SAVE" />
        <Ground y={860} />
        <MoneyPile x={400} y={860} amount={aTop} seed={1} />
        <Fig x={floored > 0.5 ? 380 : 390} y={topY} pose={topPose} s={s} />
        {f >= Q.DROP && <g opacity={fade(f, Q.DROP)}><Item kind="bag" x={640} y={780} s={0.9} /><Cup x={710} y={820} s={0.6} /><Shirt x={770} y={790} s={0.7} /></g>}
        <Jar x={930} y={860} level={0.03} label="SAVINGS" />
        {f >= Q.PILE_END - 20 && <text x={930} y={680} textAnchor="middle" fontFamily={BIG} fontWeight={700} fontSize={36} fill={RED} transform={`translate(930 670) scale(${pop(f, Q.PILE_END - 20)}) translate(-930 -670)`}>$0</text>}
        <Label y={1070} t="SAVE, THEN SPEND" />
        <Ground y={1600} />
        <MoneyPile x={380} y={1600} amount={aBot} seed={2} />
        <Fig x={370} y={1600 - botH + 4} pose={sitOn(10, s)} s={s} />
        {f >= Q.JAR_DONE && <g opacity={fade(f, Q.JAR_DONE)}><Item kind="bag" x={660} y={1530} s={0.8} /><Cup x={730} y={1560} s={0.5} /></g>}
        <Jar x={860} y={1600} level={jar} label="SAVINGS" />
        {f >= Q.JAR_DONE && <text x={860} y={1400} textAnchor="middle" fontFamily={BIG} fontWeight={700} fontSize={36} fill={GOLD} transform={`translate(860 1390) scale(${pop(f, Q.JAR_DONE)}) translate(-860 -1390)`}>+$400</text>}
        {bills}
      </Cam>
      <Flash f={f} at={Q.DROP} dur={5} />
    </Frame>
  );
};

// ---------------------------------------------------------------- 6 the hole in your pocket -> the trail
const WALK_V = 6, X0 = 200;
const walkerX = (f: number) => X0 + WALK_V * (Math.min(f, Q.STOP) - Q.HOLE);
const S6: React.FC<{ f: number }> = ({ f }) => {
  if (f < Q.TRAIL) {
    const x = walkerX(f), moving = f < Q.STOP;
    const pose: Pose = moving ? walk(((x - X0) / (2 * STRIDE)) * 1.0) : f < Q.POCKET ? POSES.stand() : { ...POSES.stand(), head: 34, hN: [-24, 112], elbow: 1 };
    const drops = Array.from({ length: Math.floor((Math.min(f, Q.STOP) - Q.HOLE) / 22) + 1 }, (_, k) => Q.HOLE + 10 + k * 22).filter((t) => t <= f);
    return (
      <Frame>
        <Corner p={lerp(0.25, 0.03, prog(f, Q.HOLE, Q.STOP))} red={f > Q.HOLE + 90} />
        <Cam f={f} keys={[]} state={(t) => ({ x: Math.min(walkerX(t) - 140, 760), y: 1010, z: 1.0, r: 0 })}>
          <line x1={-600} y1={1250} x2={2200} y2={1250} stroke="#5a5a60" strokeWidth={3} />
          {drops.map((t, k) => {
            const bx = walkerX(t) - 14, fall = clamp((f - t) / 14);
            return (
              <g key={k}>
                <Bill x={bx - fall * 18} y={lerp(1150, 1238, ease.bounce(fall))} r={(k % 2 ? 1 : -1) * (12 + (1 - fall) * 30)} s={1.1} />
                {k < 4 && fall >= 1 && <text x={bx - 18} y={k % 2 ? 1356 : 1312} textAnchor="middle" fontFamily={BIG} fontWeight={700} fontSize={22} fill={RED}>{WASTE[k]}</text>}
              </g>
            );
          })}
          <Fig x={x} y={1250} pose={pose} s={0.9} hold={pocketHole} />
          {f >= Q.POCKET && <text x={x + 110} y={1000} fontFamily={BIG} fontWeight={700} fontSize={48} fill={RED} transform={`translate(${x + 110} 990) scale(${pop(f, Q.POCKET)}) translate(${-(x + 110)} -990)`}>$0</text>}
        </Cam>
        {/* the title is glued to the screen */}
        <Label y={420} t="THE HOLE IN YOUR POCKET" size={40} />
      </Frame>
    );
  }
  const total = ROAD.slice(1).reduce((sum, b, i) => sum + Math.hypot(b[0] - ROAD[i][0], b[1] - ROAD[i][1]), 0);
  const n = Math.floor(total / 62);
  return (
    <Frame>
      <Corner p={0.03} red />
      <Cam f={f} keys={[{ f: Q.TRAIL, x: 600, y: 960, z: 2.4 }, { f: Q.TRAIL + 34, x: 540, y: 1280, z: 1.0, e: "inOut" }, { f: Q.DAY30, x: 540, y: 1270, z: 0.98 }]}>
        <polyline points={ROAD.map((q) => q.join(",")).join(" ")} fill="none" stroke="#3a3a40" strokeWidth={3} />
        {Array.from({ length: n }, (_, i) => { const { p } = alongRoad(i * 62 + 20); return <Bill key={i} x={p[0] + ((i * 37) % 11) - 5} y={p[1] - 8} r={((i * 53) % 50) - 25} s={0.75} />; })}
        {[3, 11, 19, 27, 35].map((k, i) => { const { p } = alongRoad(k * 62 + 20); return <text key={k} x={p[0]} y={p[1] + 40} textAnchor="middle" fontFamily={BIG} fontWeight={700} fontSize={20} fill={RED} opacity={0.85}>{WASTE[i]}</text>; })}
        <Fig x={560} y={990} pose={{ ...POSES.stand(), head: 34, hN: [-24, 112], elbow: 1 }} s={0.6} hold={pocketHole} />
        <text x={680} y={900} fontFamily={BIG} fontWeight={700} fontSize={44} fill={RED}>$0</text>
      </Cam>
      <Label y={360} t="1 MONTH LATER" size={40} />
      {/* totals under the road, clear of the figure */}
      {f >= Q.TOTAL && <g transform={`translate(540 1600) scale(${pop(f, Q.TOTAL)}) translate(-540 -1600)`}>
        <text x={540} y={1610} textAnchor="middle" fontFamily={BIG} fontWeight={700} fontSize={58} fill={RED}>= $265 / MONTH</text>
        <text x={540} y={1665} textAnchor="middle" fontFamily={BIG} fontSize={28} fill={G}>$3,180 / YEAR</text>
      </g>}
    </Frame>
  );
};

// ---------------------------------------------------------------- 7 day 30 -> loop
const S7: React.FC<{ f: number }> = ({ f }) => {
  const mt = prog(f, Q.MONTHS, Q.MONTHS_END, "inOut"), month = Math.max(1, Math.round(1 + 11 * mt));
  return (
    <Frame>
      <Cam f={f} keys={[{ f: Q.DAY30, x: 540, y: 1040, z: 1.06 }, { f: Q.LOOP, x: 600, y: 1080, z: 1.12, e: "inOut" }]} kicks={[{ f: Q.MONTHS_END, amp: 8 }]}>
        <Label y={360} t="DAY 30." size={44} />
        {f >= Q.DAY30 + 14 && <g opacity={fade(f, Q.DAY30 + 14)}><Label y={430} t="SAME SALARY. DIFFERENT ORDER." size={30} color={G} /></g>}
        <Ground y={1400} />
        <Meter x={230} y={900} w={110} h={360} p={0} red />
        <Fig x={170} y={1400} pose={POSES.sad()} s={0.75} grey />
        <Meter x={640} y={900} w={110} h={360} p={0.2} />
        <Jar x={850} y={1400} level={lerp(0.12, 0.92, mt)} w={130} h={180} />
        <Fig x={600} y={1400} pose={{ ...POSES.stand(), head: -6 }} s={0.75} />
        <text x={850} y={1150} textAnchor="middle" fontFamily={BIG} fontWeight={700} fontSize={44} fill={GOLD}>${(400 * month).toLocaleString("en-US")}</text>
        <text x={850} y={1192} textAnchor="middle" fontFamily={CAP} fontWeight={600} fontSize={24} fill={G}>MONTH {month}</text>
        {f >= Q.MONTHS_END && <Sparkle f={f} at={[930, 1180]} s={1.5} />}
      </Cam>
    </Frame>
  );
};

export const PaydayFilm: React.FC = () => {
  const f = useCurrentFrame();
  let shot: React.ReactNode;
  if (f < Q.CUPS) shot = <S1 f={f} />;
  else if (f < Q.CLOSET) shot = <S2 f={f} />;
  else if (f < Q.NIGHT) shot = <S3 f={f} />;
  else if (f < Q.PILE) shot = <S4 f={f} />;
  else if (f < Q.HOLE) shot = <S5 f={f} />;
  else if (f < Q.DAY30) shot = <S6 f={f} />;
  else shot = <S7 f={f} />;
  // the last 40 frames dissolve into the opening frame so the video loops
  const loop = clamp((f - Q.LOOP) / (Q.LEN - Q.LOOP));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {shot}
      {loop > 0 && <AbsoluteFill style={{ opacity: ease.inOut(loop) }}><S1 f={Math.round(loop * 12)} /></AbsoluteFill>}
    </AbsoluteFill>
  );
};
