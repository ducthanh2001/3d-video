// Redraw of the phone scroller (B) for "THE 100TH HIT": the old pose (slumped diagonally on a sofa) next to three new ones.
// What sells "glued to a phone": a bowed head, rounded shoulders (forward lean + head tilt), both hands close together at lap height,
// and the screen as the ONLY light, lighting the face from below.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Hero, LOOK_GREY, LOOK_WHITE, Pose } from "../../kit/hero";
import { KitDefs, LightPool, Vignette, MAT } from "../../kit/materials";
import { Phone } from "../../kit/props";

const LABEL = '"Segoe UI Semibold", "Segoe UI", Arial, sans-serif';
const INK = "#0b0b0d";

/** a park bench, side view, seat top at y - 100 */
const Bench: React.FC<{ x: number; y: number; w?: number }> = ({ x, y, w = 300 }) => (
  <g stroke={INK} strokeWidth={3}>
    <rect x={x - w / 2} y={y - 106} width={w} height={16} rx={4} fill={MAT.wood} />
    <rect x={x - w / 2 + 6} y={y - 210} width={14} height={110} rx={3} fill="#4a3424" />
    <rect x={x - w / 2} y={y - 196} width={w * 0.9} height={14} rx={4} fill={MAT.wood} />
    <rect x={x - w / 2} y={y - 160} width={w * 0.9} height={14} rx={4} fill={MAT.wood} />
    <rect x={x - w / 2 + 20} y={y - 90} width={12} height={90} fill="#2a2a30" /><rect x={x + w / 2 - 32} y={y - 90} width={12} height={90} fill="#2a2a30" />
  </g>
);

// old: lying back diagonally
const OLD: Pose = { hip: [0, -112], lean: -26, head: 34, hN: [56, 34], hF: [44, 40], fN: [168, -4], fF: [190, 0], elbow: -1 };
// 1 bench hunch: forward lean, head bowed, hands together at the lap
const HUNCH: Pose = { hip: [0, -118], lean: 28, head: 46, hN: [44, 92], hF: [34, 98], fN: [92, 0], fF: [70, 0], elbow: 1 };
// 2 floor against the wall, knees up, phone held on the knees
const FLOOR: Pose = { hip: [0, -12], lean: 6, head: 40, hN: [70, 30], hF: [60, 36], fN: [110, 0], fF: [96, -6], elbow: 1 };
// 3 the walking scroller: standing, head down, phone at chest
const ZOMBIE: Pose = { hip: [0, -188], lean: 10, head: 48, hN: [48, 58], hF: [40, 64], fN: [20, 0], fF: [-24, 0], elbow: 1 };

/** the phone in both hands + the screen light hitting the face from below */
const ScreenLight: React.FC<{ hx: number; hy: number; rot?: number }> = ({ hx, hy, rot = -60 }) => (
  <g>
    <Phone x={hx} y={hy} rot={rot} s={1.0} glow="#ffffff" />
    <path d={`M${hx - 14} ${hy - 10} L${hx + 14} ${hy - 10} L${hx + 60} ${hy - 170} L${hx - 50} ${hy - 170} Z`} fill="#ffffff" opacity={0.12} filter="url(#k-blur10)" />
  </g>
);

const Panel: React.FC<{ x: number; y: number; title: string; sub: string; children: React.ReactNode; old?: boolean }> = ({ x, y, title, sub, children, old }) => (
  <g>
    <rect x={x} y={y} width={500} height={860} rx={20} fill="#0e0e12" stroke={old ? "#5a2a2a" : "#2a2a32"} strokeWidth={3} />
    <text x={x + 250} y={y + 60} textAnchor="middle" fontFamily={LABEL} fontSize={34} fill={old ? "#c87a7a" : "#ececec"}>{title}</text>
    <text x={x + 250} y={y + 100} textAnchor="middle" fontFamily={LABEL} fontSize={22} fill="#8a8a92">{sub}</text>
    <g>{children}</g>
  </g>
);

export const ScrollerSheet: React.FC = () => {
  const B = { ...LOOK_GREY, body: "#d6d6d6", far: "#9a9aa0", glow: 0.15, glowColor: "#ffffff" };
  return (
    <AbsoluteFill style={{ background: "#060608", filter: "grayscale(1) contrast(1.1)" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <KitDefs />
        <Panel x={30} y={60} title="CŨ" sub="nằm chéo trên sofa" old>
          <rect x={60} y={680} width={440} height={180} rx={24} fill="#3a3550" stroke={INK} strokeWidth={3} />
          <Hero x={190} y={840} s={0.9} pose={OLD} look={B} hold={(j) => <Phone x={(j.wN[0] + j.wF[0]) / 2 + 6} y={(j.wN[1] + j.wF[1]) / 2 - 10} rot={-20} s={1.1} glow="#ffffff" />} />
        </Panel>
        <Panel x={550} y={60} title="1 · GHẾ BĂNG" sub="gù lưng, cúi đầu, tay ở đùi">
          <LightPool cx={800} cy={600} rx={200} color="#ffffff" a={0.25} />
          <Bench x={800} y={860} />
          <Hero x={760} y={860} s={0.9} pose={HUNCH} look={B} hold={(j) => <ScreenLight hx={(j.wN[0] + j.wF[0]) / 2 + 4} hy={(j.wN[1] + j.wF[1]) / 2 - 6} />} />
        </Panel>
        <Panel x={30} y={980} title="2 · NGỒI SÀN" sub="dựa tường, gối co, điện thoại trên gối">
          <rect x={50} y={1060} width={60} height={760} fill={MAT.concrete} stroke={INK} strokeWidth={3} /><rect x={50} y={1060} width={60} height={760} fill="#000" opacity={0.5} />
          <LightPool cx={240} cy={1680} rx={200} color="#ffffff" a={0.25} />
          <Hero x={170} y={1800} s={0.95} pose={FLOOR} look={B} hold={(j) => <ScreenLight hx={(j.wN[0] + j.wF[0]) / 2 + 4} hy={(j.wN[1] + j.wF[1]) / 2 - 8} rot={-40} />} />
        </Panel>
        <Panel x={550} y={980} title="3 · VỪA ĐI VỪA LƯỚT" sub="đứng, cổ gập, mắt dính màn hình">
          <LightPool cx={800} cy={1500} rx={200} color="#ffffff" a={0.25} />
          <Hero x={790} y={1800} s={0.95} pose={ZOMBIE} look={B} hold={(j) => <ScreenLight hx={(j.wN[0] + j.wF[0]) / 2 + 4} hy={(j.wN[1] + j.wF[1]) / 2 - 8} rot={-70} />} />
        </Panel>
        <Vignette a={0.4} />
      </svg>
    </AbsoluteFill>
  );
};
export const SCROLLER_LOOK = LOOK_WHITE;
