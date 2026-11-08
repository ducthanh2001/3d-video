// BEAT YESTERDAY: alternative images for the HOOK vignette (racing them / racing yesterday).
// 0 = A HURDLES: looking at the other lanes makes you crash; looking at your own lane, you clear it, yesterday one hurdle behind.
// 1 = B PHOTO FINISH: one big image: you vs yesterday, neck and neck at the line, you win by a chest: "+1%".
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { rng } from "../../kit/core";
import { HIP_H, Hero, Pose, run } from "../../kit/hero";
import { KitDefs, Vignette } from "../../kit/materials";
import { Glow, Rays } from "../../kit/fx";
import { BOLD, BOLD_GREY, Defs, GOLD, Label, RED, SANS } from "../samehours/StyleFrames";
import { COLD, GB, GT, Ghost, J, Mood, Punch, S, Tag } from "./StyleFrames";

export const HOOK_OPTS = 2;
const ICE = "#8fb0ff", W = "#f2f2f2";

/** a side-view hurdle: two posts seen as one, a top bar, a foot */
const Hurdle: React.FC<{ x: number; g: number; gold?: boolean; tipped?: number; s?: number }> = ({ x, g, gold, tipped = 0, s = 1 }) => (
  <g transform={`translate(${x} ${g}) rotate(${tipped}) scale(${s})`}>
    <rect x={-6} y={-170} width={12} height={170} fill={gold ? GOLD : "#8a8a96"} stroke="#000" strokeWidth={2} />
    <rect x={-46} y={-182} width={92} height={22} rx={4} fill={gold ? "url(#sh-gold)" : "#e8e8ec"} stroke="#000" strokeWidth={3} />
    <rect x={-40} y={-178} width={26} height={14} fill={gold ? "#fff3c4" : RED} opacity={0.9} />
    <rect x={14} y={-178} width={26} height={14} fill={gold ? "#fff3c4" : RED} opacity={0.9} />
    <rect x={-6} y={-4} width={56} height={8} fill={gold ? GOLD : "#6a6a72"} />
  </g>
);
/** hurdler over the bar: lead leg straight ahead, trail leg folded out, arm reaching forward */
const hurdlePose: Pose = { hip: [0, -HIP_H - 40], lean: 34, head: -6, hN: [-40, 90], hF: [120, 10], fN: [190, -150], fF: [-110, -90], elbow: 1 };
const crashPose: Pose = { hip: [0, -26], lean: -84, head: 10, hN: [60, 40], hF: [40, -60], fN: [-120, -160], fF: [-170, -60] };

// ================================================================ A · hurdles
const OptA: React.FC = () => {
  const R = rng(5);
  return (
    <g>
      <Mood y0={120} g={GT} cx={480} />
      {/* the others, already far ahead in their own lanes (further back = smaller, higher) */}
      {[["HIM", 760, 0.62, GT - 70, 0.1], ["HER", 900, 0.56, GT - 120, 0.45], ["THEM", 1010, 0.5, GT - 160, 0.8]].map(([t, x, sc, g, ph]) => (
        <g key={t as string} opacity={0.85}>
          <Hero x={x as number} y={g as number} s={sc as number} pose={run(ph as number)} look={BOLD_GREY} shadow={0} />
          <Tag x={x as number} y={(g as number) - 420 * (sc as number) - 10} t={t as string} size={26} />
        </g>
      ))}
      <Hurdle x={200} g={GT} />
      <Hurdle x={560} g={GT} tipped={-78} />
      <Hurdle x={900} g={GT} />
      {/* he looked sideways, clipped the bar, and went down */}
      <g opacity={0.9}>{Array.from({ length: 10 }, (_, i) => { const a = R() * Math.PI, r = 30 + R() * 60; return <circle key={i} cx={560 + Math.cos(a) * r} cy={GT - 10 - Math.sin(a) * r * 0.5} r={6 + R() * 10} fill="#9aa4ba" opacity={0.35} />; })}</g>
      <Hero x={640} y={GT} s={S} pose={crashPose} look={COLD} shadow={0} />
      {[[0, -1], [0.7, -0.7], [-0.7, -0.7]].map(([dx, dy], i) => <line key={i} x1={600 + dx * 70} y1={GT - 120 + dy * 60} x2={600 + dx * 110} y2={GT - 120 + dy * 100} stroke="#cfd6e6" strokeWidth={5} strokeLinecap="round" />)}
      <path d={`M380 ${GT - 300} q30 -40 60 0`} fill="none" stroke={RED} strokeWidth={5} strokeDasharray="8 8" />
      <path d={`M440 ${GT - 300} l-14 -6 l4 14 Z`} fill={RED} />

      <text x={540} y={968} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={44} fill={W}>DAY 365</text>

      <Mood y0={980} g={GB} warm cx={620} />
      <Rays f={0} at={[640, GB - 300]} a={0.35} color={GOLD} n={14} len={700} />
      <Hurdle x={240} g={GB} gold />
      <Hurdle x={620} g={GB} gold />
      <Hurdle x={980} g={GB} gold />
      {/* yesterday, one hurdle behind, also mid-jump */}
      <Ghost x={170} y={GB - 30} pose={hurdlePose} />
      <Glow at={[640, GB - 260]} r={260} color={GOLD} a={0.45} />
      <Hero x={560} y={GB - 30} s={S} pose={hurdlePose} look={BOLD} shadow={0} />
      {[0, 1, 2].map((i) => <line key={i} x1={420 - i * 30} y1={GB - 330 + i * 60} x2={300 - i * 30} y2={GB - 330 + i * 60} stroke={GOLD} strokeWidth={5} strokeLinecap="round" opacity={0.6 - i * 0.15} />)}

      <Label y={200} t="Watching their lanes" />
      <Label y={1052} t="Watching your own" />
      <Punch l1="There will always be someone faster." l2="Only one race matters." />
    </g>
  );
};

// ================================================================ B · photo finish
const OptB: React.FC = () => {
  const G = 1460, LX = 600, SB = 1.55;
  const me: Pose = { ...run(0.2), lean: 26, head: -12, hN: [-70, 80], hF: [110, 30], elbow: 1 };
  const ys: Pose = { ...run(0.7), lean: 22, head: -8 };
  const mj = J(LX + 10, G, me, false, SB), yj = J(LX - 40, G, ys, false, SB);
  return (
    <g>
      {/* photo-finish strip look: vertical scan lines, a timing ruler, a gold finish line */}
      <defs><radialGradient id="pf" cx={LX} cy={G - 400} r={800} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor={GOLD} stopOpacity={0.22} /><stop offset="1" stopColor={GOLD} stopOpacity={0} /></radialGradient></defs>
      <rect x={0} y={0} width={1080} height={1920} fill="url(#pf)" />
      {Array.from({ length: 54 }, (_, i) => <line key={i} x1={i * 20} y1={560} x2={i * 20} y2={G + 40} stroke="#ffffff" strokeWidth={1} opacity={0.035} />)}
      <rect x={0} y={G} width={1080} height={10} fill="#5a5a62" />
      {Array.from({ length: 28 }, (_, i) => <g key={i}><line x1={i * 40} y1={G + 10} x2={i * 40} y2={G + (i % 5 ? 28 : 46)} stroke="#8a8a92" strokeWidth={3} />{i % 5 === 0 && <text x={i * 40 + 4} y={G + 74} fontFamily='"Consolas", monospace' fontSize={22} fill="#8a8a92">{(9.8 + i * 0.01).toFixed(2)}</text>}</g>)}
      <rect x={LX - 4} y={540} width={8} height={G - 540 + 10} fill={GOLD} />
      <Glow at={[LX, G - 300]} r={300} color={GOLD} a={0.35} />
      {/* yesterday, a hair behind */}
      <Ghost x={LX - 40} y={G} pose={ys} s={SB} tag="" a={0.55} />
      <Hero x={LX + 10} y={G} s={SB} pose={me} look={BOLD} shadow={0} />
      {/* who is who */}
      <text x={yj.head[0] - 120} y={yj.head[1] - 40} textAnchor="end" fontFamily={SANS} fontWeight={800} fontSize={40} fill={ICE}>YESTERDAY</text>
      <path d={`M${yj.head[0] - 112} ${yj.head[1] - 52} L${yj.head[0] - 50} ${yj.head[1] - 20}`} stroke={ICE} strokeWidth={4} />
      <text x={mj.head[0] + 110} y={mj.head[1] - 70} fontFamily={SANS} fontWeight={800} fontSize={48} fill={W}>TODAY</text>
      <path d={`M${mj.head[0] + 104} ${mj.head[1] - 82} L${mj.head[0] + 50} ${mj.head[1] - 30}`} stroke={W} strokeWidth={4} />
      {/* the margin: by a chest, +1% */}
      <path d={`M${LX - 30} ${G - 560} h${84} M${LX - 30} ${G - 575} v30 M${LX + 54} ${G - 575} v30`} stroke={GOLD} strokeWidth={5} />
      <text x={LX + 12} y={G - 600} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={64} fill={GOLD}>+1%</text>

      {/* the faces you are NOT racing, crossed out */}
      <g opacity={0.85}>
        {[["HIM", 300], ["HER", 540], ["THEM", 780]].map(([t, x]) => (
          <g key={t as string}>
            <text x={x as number} y={300} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={56} fill={RED} opacity={0.6}>{t}</text>
            <line x1={(x as number) - 80} y1={282} x2={(x as number) + 80} y2={282} stroke={RED} strokeWidth={7} />
          </g>
        ))}
      </g>
      <text x={540} y={410} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={44} fill={W}>PHOTO FINISH · DAY 365</text>

      <Punch l1="There will always be someone faster." l2="Only one race matters." y={1700} />
    </g>
  );
};

const OPTS = [OptA, OptB];
export const BeatHook: React.FC = () => {
  const O = OPTS[Math.min(OPTS.length - 1, useCurrentFrame())];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <KitDefs />
        <Defs />
        <O />
        <Vignette a={0.45} />
      </svg>
    </AbsoluteFill>
  );
};
