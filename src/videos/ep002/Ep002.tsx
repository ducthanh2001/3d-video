// ep002 "Medieval Trials: Real or Myth?": Milo the lawyer, a pack of rats and a dead pope. Flat characters in a 3D toon world.
// One three.js world (world.ts) posed per frame from the story timeline (story.ts). Post chain (look-match pass):
//   InkPass (world ink lines, own pass) -> lens blur pre + main (thin-lens DOF per shot from dofAt) ->
//   [bloom (emissive only) + NEUTRAL tone mapping + colour grade] (one merged EffectPass), MSAA 4.
// Ink runs before the DOF so lines blur with what they belong to; bloom after the DOF so glows defocus with their
// source; the grade is display-referred, so it comes after tone mapping. Every pixel-sized parameter is specified at
// 1080x1920 and scaled with the output size, so stills at --scale 0.5 and the 1440x2560 final match.
// Place changes crossfade by stacking a second canvas for the fade frames; the hook ends on a 4-frame white flash.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, getInputProps, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { BlendFunction, BloomEffect, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { World, loadKit } from "./world";
import { InkPass, noInkFallback } from "../ep001/ink";
import { LensBlur, GrainEffect } from "../ep001/lensblur";
import { GradeEffect, GRADES, GRADE_STRENGTH, gradeFor } from "../ep001/grade";
import { Kit } from "../ep001/build";
import { TOTAL, FLASH_AT, SHOTS, layersAt, dofAt, Q, LOOP } from "./story";

export const EP002_FRAMES = TOTAL;

/** A/B switches for test stills only (Remotion inputProps `{ post: { ink: false, ... } }`); everything is on by default. */
type PostToggles = { ink: boolean; lens: boolean; pre: boolean; bloom: boolean; grade: boolean; grain: boolean };
const toggles = (): PostToggles => ({ ink: true, lens: true, pre: true, bloom: true, grade: true, grain: false, ...((getInputProps() as { post?: Partial<PostToggles> }).post ?? {}) });

/** Bloom for emissive sources only (depth.md 6.4). Its MIP chain always starts at 540x960 (half of 1080x1920),
 *  whatever the output size, so the glow keeps the same size relative to the frame (e-fold ~30 px at 1080p,
 *  ~1.5 % of the frame height) at 540, 1080 and 1440 widths. ADD blend: HDR-safe (SCREEN darkens values > 1). */
const makeBloom = () => {
  const b = new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.5, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true, levels: 6, radius: 0.6 });
  const mip = b.mipmapBlurPass;
  const setSize = mip.setSize.bind(mip);
  mip.setSize = (w: number, h: number) => setSize(Math.round((1920 * w) / Math.max(h, 1)), 1920);
  return b;
};

const fwd = new THREE.Vector3(), fpt = new THREE.Vector3();

export const useKit = () => {
  const [kit, setKit] = useState<Kit | null>(null);
  const [handle] = useState(() => delayRender("bridge kit"));
  useEffect(() => { loadKit().then((k) => { setKit(k); continueRender(handle); }); }, [handle]);
  return kit;
};

/** frame / cInf: fixed pose and lens for single stills (the thumbnail); the episode leaves them unset */
const Inner: React.FC<{ id: number; kit: Kit; frame?: number; cInf?: number; focus?: [number, number, number] }> = ({ id, kit, frame, cInf, focus }) => {
  const cur = useCurrentFrame(), f = frame ?? cur;
  const { camera, scene } = useThree();
  const world = useMemo(() => new World(kit), [kit]);
  const target = useMemo(() => new THREE.Vector3(), []);
  const on = useMemo(toggles, []);
  const fx = useMemo(() => ({
    ink: new InkPass(scene, camera as THREE.PerspectiveCamera),
    lens: new LensBlur({ maxCoC: 24, nearScale: 1.2 }),
    bloom: makeBloom(),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
    grade: new GradeEffect(GRADES.day, GRADE_STRENGTH.day),
    grain: new GrainEffect({ amount: 0.025, cellPx: 1.5 }), // film grain, OFF by default (inputProps post.grain): the reference measures no grain and it quadruples the file size
  }), [camera, scene]);
  useEffect(() => () => fx.ink.dispose(), [fx]);
  const post = useMemo(() => {
    // postprocessing 3.0.x types want non-null children, so collect the active passes in an array
    const passes: [string, object][] = [];
    if (on.ink) passes.push(["ink", fx.ink]);
    if (on.lens && on.pre) passes.push(["pre", fx.lens.pre]);
    if (on.lens) passes.push(["main", fx.lens.main]);
    if (on.bloom) passes.push(["bloom", fx.bloom]);
    passes.push(["tone", fx.tone]);
    if (on.grade) passes.push(["grade", fx.grade]);
    if (on.grain) passes.push(["grain", fx.grain]);
    return (
      <EffectComposer multisampling={4}>
        {passes.map(([k, o]) => <primitive key={k} object={o} dispose={null} />)}
      </EffectComposer>
    );
  }, [fx, on]);
  const cam = camera as THREE.PerspectiveCamera;
  target.copy(world.update(id, f, cam, scene));
  noInkFallback(world.root);
  // thin-lens focus: distance along the view axis to the shot's focus point (default: the camera's look target)
  const d = dofAt(f);
  cam.getWorldDirection(fwd);
  if (focus) fpt.set(...focus); else if (d.focus) fpt.set(...d.focus(f)); else fpt.copy(target);
  fx.lens.focus = Math.max(0.3, fpt.sub(cam.position).dot(fwd));
  fx.lens.cInf = cInf ?? d.cInf;
  gradeFor(fx.grade, SHOTS[id - 1].light);
  fx.grain.seed = f; // deterministic per frame
  return (
    <>
      <primitive object={world.root} dispose={null} />
      {post}
    </>
  );
};

/** test stills only: inputProps `{ post: { dpr: 0.5 } }` forces the WebGL buffer size (R3F clamps dpr to >= 1 by default) */
const dprOverride = () => (getInputProps() as { post?: { dpr?: number } }).post?.dpr;
export const ShotView: React.FC<{ id: number; kit: Kit; alpha: number; frame?: number; cInf?: number; focus?: [number, number, number] }> = ({ id, kit, alpha, frame, cInf, focus }) => (
  <AbsoluteFill style={{ opacity: alpha }}>
    <ThreeCanvas width={1080} height={1920} {...(dprOverride() ? { dpr: dprOverride() } : {})} shadows gl={{ antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0 }}
      camera={{ fov: 40, near: 0.2, far: 1500 }}>
      <Inner id={id} kit={kit} frame={frame} cInf={cInf} focus={focus} />
    </ThreeCanvas>
  </AbsoluteFill>
);


// ---------------- title cards, stamps and the score board (screen space) ----------------
// Shorts safe zone: nothing important in the bottom 20 % (y > 1536) or the right 12 % (x > 950); the score board sits top-left.
export const FONT = '"Arial Black", Impact, "Segoe UI Black", sans-serif';
export const INKC = "#241726";
export const cardText = (size: number, color = "#ffffff"): React.CSSProperties => ({
  fontFamily: FONT, fontWeight: 900, fontSize: size, color, letterSpacing: 2, lineHeight: 1.04, textAlign: "center",
  WebkitTextStroke: `${Math.max(4, Math.round(size / 11))}px ${INKC}`, paintOrder: "stroke fill", textShadow: "0 7px 0 rgba(36,23,38,0.5)",
});
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const popScale = (f: number, f0: number) => { const u = clamp((f - f0) / 6); return u <= 0 ? 0 : 0.55 + 0.45 * (1 - (1 - u) ** 3) + 0.12 * Math.sin(Math.PI * u); };
const fadeOut = (f: number, b: number) => (f > b - 6 ? clamp((b - f) / 6) : 1);
/** [from, to, line 1, optional line 2, top] */
const LABELS: [number, number, string, string | undefined, number][] = [
  [Q.L2 + 4, Q.summoned - 2, "CASE 1", "FRANCE, 1500s", 230],
  [Q.extra, Q.round, "EXTRA TIME", undefined, 250],
  [Q.L8 + 4, Q.nine - 4, "CASE 2", "ROME, 897", 230],
  [Q.L13 + 2, Q.prison - 8, "MONTHS LATER", undefined, 250],
  [Q.canceled + 4, Q.L15, "VERDICT", "CANCELED", 1230],
  [Q.L15 + 2, Q.banned - 4, "898", undefined, 250],
];
/** [landing frame, hold until, text, colour, tilt, top] */
const STAMPS: [number, number, string, string, number, number][] = [
  [Q.real1, Q.L7, "REAL", "#d8322d", -8, 560], [Q.guilty + 2, Q.L12, "GUILTY", "#d8322d", 6, 820], [Q.real2, Q.L17, "REAL", "#d8322d", -6, 1160],
];

const Stamp: React.FC<{ f: number; s: (typeof STAMPS)[number] }> = ({ f, s: [land, until, text, col, tilt, top] }) => {
  if (f < land - 6 || f >= until) return null;
  const y = f < land ? -1000 * (1 - ((f - (land - 6)) / 6) ** 2) : 0, sq = f >= land && f < land + 4 ? 1 - 0.14 * Math.sin((Math.PI * (f - land)) / 4) : 1;
  return (
    <div style={{ position: "absolute", left: 0, right: 130, top, display: "flex", justifyContent: "center", transform: `translateY(${y}px) rotate(${tilt}deg) scaleY(${sq})` }}>
      <div style={{ border: `16px solid ${col}`, borderRadius: 18, padding: "10px 48px", background: "rgba(255,255,255,0.9)", boxShadow: "0 10px 0 rgba(36,23,38,0.35)" }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: text.length >= 6 ? 130 : 170, color: col, letterSpacing: 6, lineHeight: 1.05 }}>{text}</div>
      </div>
    </div>
  );
};

/** two cells, RATS and POPE: RATS fills with a tick when Milo wins round one; POPE gets a cross at the verdict and turns
 *  over to a tick when history clears Formosus */
const ScoreBoard: React.FC<{ f: number }> = ({ f }) => {
  if (f < Q.L2 || f >= LOOP) return null;
  const flip0 = Q.won - 4, ang = 180 * clamp((f - flip0) / 10);
  const cells: { name: string; v: "" | "x" | "ok"; ang: number; pop: number }[] = [
    { name: "RATS", v: f >= Q.round ? "ok" : "", ang: 0, pop: Q.round },
    { name: "POPE", v: f >= flip0 + 5 ? "ok" : f >= Q.guilty + 2 ? "x" : "", ang, pop: f >= flip0 ? flip0 + 5 : Q.guilty + 2 },
  ];
  const shake = f >= Q.guilty + 2 && f < Q.guilty + 26 ? 5 * Math.sin(f * 1.8) : 0;
  return (
    <div style={{ position: "absolute", left: 48, top: 96, display: "flex", gap: 16, opacity: clamp((f - Q.L2) / 8) }}>
      {cells.map((c) => {
        const col = c.v === "x" ? "#d8322d" : c.v === "ok" ? "#2f8f4a" : "#6a6470";
        const back = c.ang > 90, glyphPop = c.v ? Math.max(0.01, popScale(f, c.pop)) : 1;
        return (
          <div key={c.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ width: 96, height: 96, borderRadius: 16, border: `7px solid ${c.v ? col : "#a8a0b0"}`, background: "rgba(255,250,240,0.94)", display: "flex", alignItems: "center", justifyContent: "center",
              transform: `translateX(${c.v === "x" ? shake : 0}px) perspective(500px) rotateY(${c.ang}deg)`, boxShadow: "0 5px 0 rgba(36,23,38,0.35)" }}>
              <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 68, color: col, lineHeight: 1, transform: `${back ? "scaleX(-1) " : ""}scale(${glyphPop})` }}>{c.v === "x" ? "✗" : c.v === "ok" ? "✓" : ""}</div>
            </div>
            <div style={{ ...cardText(34), WebkitTextStroke: `5px ${INKC}` }}>{c.name}</div>
          </div>
        );
      })}
    </div>
  );
};

const RealOrMyth: React.FC<{ f: number; from: number; to: number }> = ({ f, from, to }) => {
  if (f < from || f >= to) return null;
  const wob = Math.sin((f - from) * 0.35) * 6;
  return (
    <div style={{ position: "absolute", left: 0, right: 130, top: 640, display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${popScale(f, from)})`, opacity: fadeOut(f, to) }}>
      <div style={cardText(150, "#ffe58a")}>REAL</div>
      <div style={cardText(92)}>OR</div>
      <div style={{ ...cardText(150, "#ffe58a"), transform: `rotate(${wob * 0.4}deg)` }}>MYTH?</div>
    </div>
  );
};

const ClientTags: React.FC<{ f: number }> = ({ f }) => (
  <>
    {([[Q.first - 2, 90, "CLIENT 1"], [Q.second - 2, 500, "CLIENT 2"]] as const).map(([f0, left, s]) => f >= f0 && f < Q.L2 && (
      <div key={s} style={{ position: "absolute", left, top: 1170, width: 360, display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${popScale(f, f0)})`, opacity: fadeOut(f, Q.flash) }}>
        <div style={{ background: "#fff6dc", border: `8px solid ${INKC}`, borderRadius: 16, padding: "6px 22px", boxShadow: "0 7px 0 rgba(36,23,38,0.45)" }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 56, color: INKC, whiteSpace: "nowrap" }}>{s}</div>
        </div>
        <div style={{ width: 0, height: 0, borderLeft: "26px solid transparent", borderRight: "26px solid transparent", borderTop: `34px solid ${INKC}`, marginTop: -2 }} />
      </div>
    ))}
  </>
);

const Overlays: React.FC<{ f: number }> = ({ f }) => {
  const label = LABELS.find(([a, b]) => f >= a && f < b);
  const words = [["WON", Q.won], ["IN", Q.won + 5], ["HISTORY", Q.history + 2]] as const;
  return (
    <>
      <ScoreBoard f={f} />
      <ClientTags f={f} />
      {STAMPS.map((s) => <Stamp key={s[0]} f={f} s={s} />)}
      <RealOrMyth f={f} from={Q.realQ1} to={Q.L3} />
      <RealOrMyth f={f} from={Q.realQ2} to={Q.L9} />
      {label && (
        <div style={{ position: "absolute", left: 0, right: 130, top: label[4], display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          transform: `scale(${popScale(f, label[0])})`, opacity: fadeOut(f, label[1]) }}>
          <div style={cardText(label[2].length > 9 ? 96 : 120)}>{label[2]}</div>
          {label[3] && <div style={cardText(label[3].length > 9 ? 76 : 96, "#ffe58a")}>{label[3]}</div>}
        </div>
      )}
      {f >= Q.wait - 2 && f < Q.L13 && (
        <div style={{ position: "absolute", left: 0, right: 130, top: 300, display: "flex", justifyContent: "center", transform: `scale(${popScale(f, Q.wait - 2)}) rotate(-4deg)`, opacity: fadeOut(f, Q.L13) }}>
          <div style={cardText(170, "#ffe58a")}>BUT WAIT.</div>
        </div>
      )}
      {f >= Q.won && f < Q.L18 && (
        <div style={{ position: "absolute", left: 40, right: 170, top: 1150, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 30px" }}>
          {words.map(([w, f0]) => <div key={w} style={{ ...cardText(124, "#ffe58a"), opacity: f >= f0 ? 1 : 0, transform: `scale(${popScale(f, f0) || 0.01})` }}>{w}</div>)}
        </div>
      )}
      {f >= Q.would && f < LOOP && (
        <div style={{ position: "absolute", left: 0, right: 130, top: 1330, display: "flex", justifyContent: "center", opacity: clamp((f - Q.would) / 6) }}>
          <div style={{ ...cardText(68), whiteSpace: "nowrap" }}>Would you defend it?</div>
        </div>
      )}
    </>
  );
};

export const Ep002Short: React.FC = () => {
  const f = useCurrentFrame();
  const kit = useKit();
  if (!kit) return null;
  const flash = f >= FLASH_AT && f < FLASH_AT + 4 ? [1, 0.75, 0.45, 0.2][f - FLASH_AT] : 0;
  return (
    <AbsoluteFill style={{ background: "#2a2228" }}>
      {layersAt(f).map((l, i) => <ShotView key={i ? "over" : "base"} id={l.id} kit={kit} alpha={l.alpha} />)}
      <Overlays f={f} />
      {flash > 0 && <AbsoluteFill style={{ background: "#ffffff", opacity: flash }} />}
    </AbsoluteFill>
  );
};
