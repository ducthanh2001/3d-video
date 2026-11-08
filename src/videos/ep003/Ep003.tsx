// ep003 "They put a rooster on trial for laying an egg": Milo the lawyer, a rooster, a bored judge and a very guilty owner. Flat characters in a 3D toon world.
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
import { TOTAL, FLASH_AT, SHOTS, layersAt, dofAt, Q, LOOP, PANELS } from "./story";
import { SubscribeButton } from "../../series/SubscribeButton";

export const EP003_FRAMES = TOTAL;

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
export const ShotView: React.FC<{ id: number; kit: Kit; alpha: number; clip?: string; frame?: number; cInf?: number; focus?: [number, number, number] }> = ({ id, kit, alpha, clip, frame, cInf, focus }) => (
  <AbsoluteFill style={{ opacity: alpha, ...(clip ? { clipPath: clip } : {}) }}>
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

// ---------------- the egg board: three eggs that crack one by one (cute, no gore) ----------------
const EGG = "M40 4 C62 4 76 40 76 64 C76 86 60 98 40 98 C20 98 4 86 4 64 C4 40 18 4 40 4 Z";
const ZIG = "0,56 12,46 22,60 32,48 42,62 52,48 62,60 72,46 80,56";
const CRACKS = [Q.lost1 + 1, Q.lost2 + 1, Q.guilty + 1];
const EggCell: React.FC<{ f: number; crackAt: number; k: number }> = ({ f, crackAt, k }) => {
  const dt = f - crackAt, cracked = dt >= 0, split = clamp((dt - 6) / 8);
  const shake = cracked && dt < 7 ? 5 * Math.sin(dt * 2.4) : 0;
  const dim = cracked ? 0.82 : 1, fill = `rgb(${Math.round(255 * dim)},${Math.round(250 * dim)},${Math.round(240 * dim)})`;
  const id = `eg${k}`;
  return (
    <svg width="104" height="130" viewBox="-2 -14 84 118" style={{ overflow: "visible", transform: `translateX(${shake}px)`, filter: "drop-shadow(0 5px 0 rgba(36,23,38,0.35))" }}>
      <defs>
        <clipPath id={`${id}t`}><polygon points={`0,-20 ${ZIG} 80,-20`} /></clipPath>
        <clipPath id={`${id}b`}><polygon points={`0,120 ${ZIG} 80,120`} /></clipPath>
      </defs>
      {!cracked && <path d={EGG} fill="#fffaf0" stroke={INKC} strokeWidth="6" strokeLinejoin="round" />}
      {cracked && (
        <>
          <g clipPath={`url(#${id}b)`}><path d={EGG} fill={fill} stroke={INKC} strokeWidth="6" strokeLinejoin="round" /></g>
          <g clipPath={`url(#${id}t)`} transform={`translate(${-3 * split} ${-9 * split}) rotate(${-14 * split} 10 56)`}><path d={EGG} fill={fill} stroke={INKC} strokeWidth="6" strokeLinejoin="round" /></g>
          <polyline points={ZIG} fill="none" stroke={INKC} strokeWidth="4" strokeLinejoin="round" opacity={1 - split} />
          {[[-14, 20], [92, 28], [78, -6]].map(([x, y], j) => (
            <polygon key={j} points="0,0 9,-3 6,7" fill="#fffaf0" stroke={INKC} strokeWidth="2.5" transform={`translate(${40 + (x - 40) * split} ${60 + (y - 60) * split}) rotate(${j * 80 + 90 * split})`} opacity={split > 0 ? 1 - 0.6 * split : 0} />
          ))}
        </>
      )}
    </svg>
  );
};
const EggBoard: React.FC<{ f: number }> = ({ f }) => {
  if (f < Q.L2 || f >= Q.L17 + 6) return null;
  return (
    <div style={{ position: "absolute", left: 44, top: 90, display: "flex", gap: 12, opacity: clamp((f - Q.L2) / 8) * fadeOut(f, Q.L17 + 6) }}>
      {CRACKS.map((c, k) => <EggCell key={k} f={f} crackAt={c} k={k} />)}
    </div>
  );
};

/** [from, to, line 1, optional line 2, top] */
const LABELS: [number, number, string, string | undefined, number][] = [
  [Q.basel - 2, Q.real - 2, "BASEL, 1474", undefined, 230],
  [Q.roosters, Q.L7 + 20, "ROOSTERS CAN'T", "LAY EGGS", 230],
  [Q.realdef, Q.L8, "THE REAL DEFENSE", undefined, 200],
  [Q.trial - 4, Q.L12 + 6, "WHY ISN'T HE", "ON TRIAL?", 230],
  [Q.never, Q.L16 - 2, "NEVER", "PUNISHED", 230],
  [Q.L16, Q.L17 - 4, "BASEL, 1474", undefined, 230],
  [Q.next - 2, Q.L18, "NEXT CASE:", "THE TRAIN", 230],
];
const DEFENSE: [number, string][] = [[Q.inv, "INVOLUNTARY"], [Q.evil, "NO EVIL INTENT"], [Q.hurt, "NO ONE HURT"]];
/** [landing frame, hold until, text, colour, tilt, top] */
const STAMPS: [number, number, string, string, number, number][] = [
  [Q.lost1, Q.L7, "LOST", "#d8322d", -8, 360], [Q.lost2, Q.lost2 + 40, "LOST", "#d8322d", 6, 250], [Q.guilty, Q.guilty + 36, "GUILTY", "#d8322d", 6, 960], [Q.real2, Q.L17, "REAL", "#d8322d", -6, 300],
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

/** warm light at the edges of the frame for the sentence scenes (14-16): orange, no flames, no smoke */
const WarmEdge: React.FC<{ f: number }> = ({ f }) => {
  if (f < Q.L14 - 4 || f >= Q.L17 + 4) return null;
  const a = clamp((f - Q.L14) / 30) * fadeOut(f, Q.L17 + 4), flick = 0.9 + 0.1 * Math.sin(f * 0.21);
  return <div style={{ position: "absolute", inset: 0, opacity: a * flick, background: "radial-gradient(ellipse 62% 55% at 50% 50%, rgba(255,140,40,0) 55%, rgba(255,120,30,0.5) 100%)", mixBlendMode: "screen" }} />;
};

/** the white diagonal between the two split-screen panels (scene 11) */
const Split: React.FC<{ f: number }> = ({ f }) => {
  if (f < PANELS.a || f >= PANELS.b) return null;
  const k = clamp((f - PANELS.a) / 5);
  return <div style={{ position: "absolute", left: -80, width: 1240, top: 960 - 9, height: 18, background: "#ffffff", border: `5px solid ${INKC}`, transform: `rotate(-3.2deg) scaleX(${k})`, boxShadow: "0 6px 0 rgba(36,23,38,0.4)" }} />;
};

const Overlays: React.FC<{ f: number }> = ({ f }) => {
  const label = LABELS.find(([a, b]) => f >= a && f < b);
  return (
    <>
      <WarmEdge f={f} />
      <EggBoard f={f} />
      <RealOrMyth f={f} from={Q.real} to={Q.L3} />
      <Split f={f} />
      {label && (
        <div style={{ position: "absolute", left: 0, right: 130, top: label[4], display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          transform: `scale(${popScale(f, label[0])})`, opacity: fadeOut(f, label[1]) }}>
          <div style={cardText(label[2].length > 14 ? 78 : label[2].length > 10 ? 118 : 120)}>{label[2]}</div>
          {label[3] && <div style={cardText(label[3].length > 9 ? 96 : 110, "#ffe58a")}>{label[3]}</div>}
        </div>
      )}
      {f >= Q.inv && f < Q.L8 && (
        <div style={{ position: "absolute", left: 0, right: 130, top: 330, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          {DEFENSE.map(([f0, s]) => f >= f0 && (
            <div key={s} style={{ transform: `scale(${popScale(f, f0)})`, opacity: fadeOut(f, Q.L8) }}>
              <div style={{ background: "#fff6dc", border: `9px solid ${INKC}`, borderRadius: 18, padding: "6px 34px", boxShadow: "0 9px 0 rgba(36,23,38,0.45)" }}>
                <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 76, color: INKC, whiteSpace: "nowrap", letterSpacing: 2 }}>{s}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {STAMPS.map((s) => <Stamp key={s[0]} f={f} s={s} />)}
      <SubscribeButton from={Q.subscribe} shrinkAt={Q.L18 + 4} shrinkFrames={18} top={520} />
      {f >= Q.would && f < LOOP && (
        <div style={{ position: "absolute", left: 0, right: 130, top: 1330, display: "flex", justifyContent: "center", opacity: clamp((f - Q.would) / 6) }}>
          <div style={{ ...cardText(68), whiteSpace: "nowrap" }}>Would you take it?</div>
        </div>
      )}
    </>
  );
};

export const Ep003Short: React.FC = () => {
  const f = useCurrentFrame();
  const kit = useKit();
  if (!kit) return null;
  const flash = f >= FLASH_AT && f < FLASH_AT + 4 ? [1, 0.75, 0.45, 0.2][f - FLASH_AT] : 0;
  return (
    <AbsoluteFill style={{ background: "#2a2228" }}>
      {layersAt(f).map((l, i) => <ShotView key={i ? "over" : "base"} id={l.id} kit={kit} alpha={l.alpha} clip={l.clip} />)}
      <Overlays f={f} />
      {flash > 0 && <AbsoluteFill style={{ background: "#ffffff", opacity: flash }} />}
    </AbsoluteFill>
  );
};
