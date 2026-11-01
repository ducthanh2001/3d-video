// ep001 "How to prove you're innocent in medieval England": a 37 s short, flat characters in a 3D toon world, with a few title cards.
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
import { InkPass, noInkFallback } from "./ink";
import { LensBlur, GrainEffect } from "./lensblur";
import { GradeEffect, GRADES, GRADE_STRENGTH, gradeFor } from "./grade";
import { Kit } from "./build";
import { TOTAL, FLASH_AT, SHOTS, layersAt, dofAt } from "./story";

export const EP001_FRAMES = TOTAL;

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

const useKit = () => {
  const [kit, setKit] = useState<Kit | null>(null);
  const [handle] = useState(() => delayRender("bridge kit"));
  useEffect(() => { loadKit().then((k) => { setKit(k); continueRender(handle); }); }, [handle]);
  return kit;
};

const Inner: React.FC<{ id: number; kit: Kit }> = ({ id, kit }) => {
  const f = useCurrentFrame();
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
  if (d.focus) fpt.set(...d.focus(f)); else fpt.copy(target);
  fx.lens.focus = Math.max(0.3, fpt.sub(cam.position).dot(fwd));
  fx.lens.cInf = d.cInf;
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
const ShotView: React.FC<{ id: number; kit: Kit; alpha: number }> = ({ id, kit, alpha }) => (
  <AbsoluteFill style={{ opacity: alpha }}>
    <ThreeCanvas width={1080} height={1920} {...(dprOverride() ? { dpr: dprOverride() } : {})} shadows gl={{ antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0 }}
      camera={{ fov: 40, near: 0.2, far: 1500 }}>
      <Inner id={id} kit={kit} />
    </ThreeCanvas>
  </AbsoluteFill>
);

// ---------------- title cards, stamps and the score board (screen space) ----------------
// Shorts safe zone: nothing important in the bottom 20 % (y > 1536) or the right 12 % (x > 950); the score board sits top-left.
const FONT = '"Arial Black", Impact, "Segoe UI Black", sans-serif';
const cardText = (size: number): React.CSSProperties => ({
  fontFamily: FONT, fontWeight: 900, fontSize: size, color: "#ffffff", letterSpacing: 2, lineHeight: 1.04, textAlign: "center",
  WebkitTextStroke: `${Math.max(4, Math.round(size / 11))}px #241726`, paintOrder: "stroke fill", textShadow: "0 7px 0 rgba(36,23,38,0.5)",
});
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const popScale = (f: number, f0: number) => { const u = clamp((f - f0) / 6); return u <= 0 ? 0 : 0.55 + 0.45 * (1 - (1 - u) ** 3) + 0.12 * Math.sin(Math.PI * u); };
/** [from, to, line 1, optional line 2] */
const LABELS: [number, number, string, string?][] = [
  [160, 250, "OPTION 1", "BEFORE 1219"], [274, 302, "3 DAYS"], [490, 575, "OPTION 2", "AFTER 1066"], [940, 1018, "OPTION 3", "1300s"],
  [1028, 1066, "CHURCH COURT", "LENIENT"], [1068, 1110, "KING'S COURT", "STRICT"], [1274, 1312, "THE NECK VERSE"],
];
/** [landing frame, hold until, text, colour, tilt, top] */
const STAMPS: [number, number, string, string, number, number][] = [
  [12, 148, "ACCUSED", "#d8322d", -7, 110], [428, 450, "GUILTY", "#d8322d", 6, 420], [1395, 1432, "INNOCENT", "#2f8f4a", -5, 380],
];
const BOARDS: [number, number, string, number][] = [[566, 584, "NO WITNESSES", 620], [586, 604, "NO EVIDENCE", 800]];

const Stamp: React.FC<{ f: number; s: (typeof STAMPS)[number] }> = ({ f, s: [land, until, text, col, tilt, top] }) => {
  if (f < land - 6 || f >= until) return null;
  const y = f < land ? -1000 * (1 - ((f - (land - 6)) / 6) ** 2) : 0, sq = f >= land && f < land + 4 ? 1 - 0.14 * Math.sin((Math.PI * (f - land)) / 4) : 1;
  return (
    <div style={{ position: "absolute", left: 0, right: 130, top, display: "flex", justifyContent: "center", transform: `translateY(${y}px) rotate(${tilt}deg) scaleY(${sq})` }}>
      <div style={{ border: `16px solid ${col}`, borderRadius: 18, padding: "10px 40px", background: "rgba(255,255,255,0.9)", boxShadow: "0 10px 0 rgba(36,23,38,0.35)" }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: text.length >= 8 ? 120 : 150, color: col, letterSpacing: 4, lineHeight: 1.05 }}>{text}</div>
      </div>
    </div>
  );
};

const ScoreBoard: React.FC<{ f: number }> = ({ f }) => {
  if (f < 150 || f >= 1548) return null;
  const st = (k: number): "" | "x" | "ok" | "q" => k === 0 ? (f >= 432 ? "x" : "") : k === 1 ? (f >= 805 ? "x" : "") : f >= 1397 ? "ok" : f >= 822 && f < 930 && Math.floor(f / 8) % 2 === 0 ? "q" : "";
  const shake = f >= 822 && f < 852 ? 5 * Math.sin(f * 1.8) : 0;
  return (
    <div style={{ position: "absolute", left: 48, top: 96, display: "flex", gap: 12, opacity: clamp((f - 150) / 8) }}>
      {[0, 1, 2].map((k) => {
        const v = st(k), col = v === "x" ? "#d8322d" : v === "ok" ? "#2f8f4a" : v === "q" ? "#e8c45a" : "#6a6470";
        return (
          <div key={k} style={{ width: 88, height: 88, borderRadius: 16, border: `7px solid ${v ? col : "#a8a0b0"}`, background: "rgba(255,250,240,0.92)", display: "flex", alignItems: "center", justifyContent: "center",
            transform: `translateX(${v === "x" ? shake : 0}px)`, boxShadow: "0 5px 0 rgba(36,23,38,0.35)", position: "relative" }}>
            <div style={{ position: "absolute", left: 6, top: 2, fontFamily: FONT, fontSize: 22, color: "#8a8494" }}>{k + 1}</div>
            <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 62, color: col, lineHeight: 1 }}>{v === "x" ? "✗" : v === "ok" ? "✓" : v === "q" ? "?" : ""}</div>
          </div>
        );
      })}
    </div>
  );
};

const Overlays: React.FC<{ f: number }> = ({ f }) => {
  const label = LABELS.find(([a, b]) => f >= a && f < b);
  const words = [["KNOWING", 1514], ["HOW", 1520], ["TO", 1526], ["READ", 1530]] as const;
  return (
    <>
      <ScoreBoard f={f} />
      {STAMPS.map((s) => <Stamp key={s[2]} f={f} s={s} />)}
      {label && (
        <div style={{ position: "absolute", left: 0, right: 130, top: 190, display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          transform: `scale(${popScale(f, label[0])})`, opacity: f > label[1] - 8 ? clamp((label[1] - f) / 8) : 1 }}>
          <div style={cardText(label[2].length > 9 ? 84 : label[3] ? 116 : 120)}>{label[2]}</div>
          {label[3] && <div style={cardText(label[2].length > 9 ? 70 : 80)}>{label[3]}</div>}
        </div>
      )}
      {BOARDS.map(([from, cross, text, top]) => f >= from && f < 640 && (
        <div key={text} style={{ position: "absolute", left: 90, right: 190, top, transform: `scale(${popScale(f, from)}) rotate(${top < 700 ? -3 : 3}deg)` }}>
          <div style={{ position: "relative", background: "#8a5a34", border: "10px solid #4a3220", borderRadius: 14, padding: "14px 20px", textAlign: "center", boxShadow: "0 9px 0 rgba(36,23,38,0.4)" }}>
            <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 74, color: "#fff6dc", letterSpacing: 2 }}>{text}</div>
            {f >= cross && <div style={{ position: "absolute", left: -10, right: -10, top: "50%", height: 16, background: "#d8322d", borderRadius: 8, transform: `scaleX(${clamp((f - cross) / 4)}) rotate(-4deg)`, transformOrigin: "left" }} />}
          </div>
        </div>
      ))}
      {f >= 1514 && f < 1550 && (
        <div style={{ position: "absolute", left: 60, right: 140, top: 1230, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 28px" }}>
          {words.map(([w, f0]) => <div key={w} style={{ ...cardText(118), opacity: f >= f0 ? 1 : 0, transform: `scale(${popScale(f, f0) || 0.01})` }}>{w}</div>)}
        </div>
      )}
      {f >= 1558 && (
        <div style={{ position: "absolute", left: 0, right: 130, top: 1400, display: "flex", justifyContent: "center", opacity: clamp((f - 1558) / 6) }}>
          <div style={cardText(84)}>Pick 1, 2 or 3?</div>
        </div>
      )}
    </>
  );
};

export const Ep001Short: React.FC = () => {
  const f = useCurrentFrame();
  const kit = useKit();
  if (!kit) return null;
  const flash = f >= FLASH_AT && f < FLASH_AT + 4 ? [1, 0.75, 0.45, 0.2][f - FLASH_AT] : 0;
  return (
    <AbsoluteFill style={{ background: "#cfe3f2" }}>
      {layersAt(f).map((l, i) => <ShotView key={i ? "over" : "base"} id={l.id} kit={kit} alpha={l.alpha} />)}
      <Overlays f={f} />
      {flash > 0 && <AbsoluteFill style={{ background: "#ffffff", opacity: flash }} />}
    </AbsoluteFill>
  );
};
