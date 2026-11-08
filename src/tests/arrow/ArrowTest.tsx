// Arrow test scene (one short physics beat, 180 frames, 1080x1920): an archer draws a bow, the arrow flies in slow motion and hits a
// steel plate on a wooden stand (sparks, a 7-frame shake, a flash). No blood, nobody is hit: the target is the plate.
// Everything is a pure function of the frame number (Remotion renders frames independently): the arrow path is a formula of the
// "arrow time" tau, which is a remap of the frame (x1 at the draw, x0.5 in the flight, x0.25 at the impact), sparks come from a
// fixed seed. Solids are three.js primitives with MeshToonMaterial plus an inverted-hull outline; the archer is Milo's side card.
// `outcome` only changes what the picture shows (glance / stick / stop), it makes no claim about real armour.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { Pen, bodySide } from "../../engine/toon";
import { milo, MILO_SEED } from "../../series/character";

export type Outcome = "glance" | "stick" | "stop";
export const ARROW_FRAMES = 180;
export const IMPACT_F = 112;

// ---- timing ---------------------------------------------------------------------------------------------------------------
const RELEASE = 45;
/** arrow time (in normal-speed frames): 0 at the release, x0.5 until frame 90, x0.25 afterwards */
const tauOf = (f: number) => (f < RELEASE ? 0 : f < 90 ? (f - RELEASE) * 0.5 : 22.5 + (f - 90) * 0.25);
const FLIGHT = 28; // tau at which the tip touches the plate (= frame 112)
const sm = (x: number) => { const t = Math.min(1, Math.max(0, x)); return t * t * (3 - 2 * t); };
const rnd = (i: number) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// ---- layout (metres, x to the right, archer on the left, plate on the right) -------------------------------------------------
const ARCHER_X = -6.9, BOW_X = -6.05, BOW_Y = 1.42;
const PLATE: [number, number, number] = [7.0, 1.5, 0];
const FRONT_X = PLATE[0] - 0.28; // front of the plate
const X0 = -5.75; // arrow group origin at the release (the origin is the base of the head; the head tip is 0.12 ahead)
const X_HIT = FRONT_X - 0.12;

// ---- toon materials and inverted-hull outline --------------------------------------------------------------------------------
const gradient = (() => {
  const d = new Uint8Array([70, 70, 70, 255, 160, 160, 160, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
})();
const hulls = new Map<number, THREE.MeshBasicMaterial>();
const hull = (th: number) => {
  let m = hulls.get(th);
  if (!m) {
    m = new THREE.MeshBasicMaterial({ color: "#1b1120", side: THREE.BackSide });
    m.onBeforeCompile = (s) => { s.vertexShader = s.vertexShader.replace("#include <begin_vertex>", `vec3 transformed = position + normal * ${th.toFixed(4)};`); };
    m.customProgramCacheKey = () => `hull${th}`;
    hulls.set(th, m);
  }
  return m;
};
const MAT: Record<string, THREE.MeshToonMaterial> = {};
const mat = (c: string) => (MAT[c] ??= new THREE.MeshToonMaterial({ color: c, gradientMap: gradient }));

type Vec3 = [number, number, number];
const Solid: React.FC<{ geo: THREE.BufferGeometry; color: string; th?: number; pos?: Vec3; rot?: Vec3; scale?: Vec3; shadow?: boolean }> = ({ geo, color, th = 0.022, pos, rot, scale, shadow }) => (
  <group position={pos} rotation={rot} scale={scale}>
    <mesh geometry={geo} material={mat(color)} castShadow={shadow} receiveShadow />
    {th > 0 && <mesh geometry={geo} material={hull(th)} />}
  </group>
);

/** a thin cylinder between two points */
const Rod: React.FC<{ a: Vec3; b: Vec3; r: number; color: string }> = ({ a, b, r, color }) => {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), len = d.length();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
  const geo = useMemo(() => new THREE.CylinderGeometry(r, r, 1, 6), [r]);
  return (
    <group position={A.clone().add(B).multiplyScalar(0.5).toArray()} quaternion={q} scale={[1, len, 1]}>
      <mesh geometry={geo}><meshBasicMaterial color={color} /></mesh>
    </group>
  );
};

// ---- sky, ground, props ---------------------------------------------------------------------------------------------------------
const skyTex = (() => {
  const c = document.createElement("canvas"); c.width = 4; c.height = 256;
  const g = c.getContext("2d")!, gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, "#3d78cf"); gr.addColorStop(0.55, "#8fbbe9"); gr.addColorStop(0.62, "#f3e3c3"); gr.addColorStop(1, "#f3e3c3");
  g.fillStyle = gr; g.fillRect(0, 0, 4, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
const GEO = {
  ground: new THREE.PlaneGeometry(260, 260), rock: new THREE.DodecahedronGeometry(1, 0), hill: new THREE.SphereGeometry(1, 24, 12),
  post: new THREE.CylinderGeometry(0.07, 0.08, 1, 10), cone: new THREE.ConeGeometry(0.5, 1, 7), dome: new THREE.SphereGeometry(1, 40, 28),
  sky: new THREE.SphereGeometry(300, 24, 16), box: new THREE.BoxGeometry(1, 1, 1),
  shaft: new THREE.CylinderGeometry(0.012, 0.012, 1, 8), head: new THREE.ConeGeometry(0.035, 0.12, 8), feather: new THREE.PlaneGeometry(0.16, 0.05),
  spark: new THREE.SphereGeometry(1, 6, 4),
};

const Scenery: React.FC = () => {
  const rocks = useMemo(() => Array.from({ length: 9 }, (_, i) => ({ x: -9 + rnd(i) * 20, z: -5 - rnd(i + 20) * 7 + (i % 3 === 0 ? 9 : 0), s: 0.35 + rnd(i + 40) * 0.7 })), []);
  const tufts = useMemo(() => Array.from({ length: 28 }, (_, i) => ({ x: -12 + rnd(i + 70) * 26, z: -6 + rnd(i + 90) * 11, s: 0.18 + rnd(i + 110) * 0.2 })), []);
  return (
    <>
      <mesh geometry={GEO.sky}><meshBasicMaterial map={skyTex} side={THREE.BackSide} fog={false} /></mesh>
      <mesh geometry={GEO.ground} rotation={[-Math.PI / 2, 0, 0]} material={mat("#7fb85a")} receiveShadow />
      <Solid geo={GEO.hill} color="#6fa34f" th={0} pos={[-30, -6, -90]} scale={[70, 18, 30]} />
      <Solid geo={GEO.hill} color="#5f9444" th={0} pos={[40, -8, -110]} scale={[90, 24, 30]} />
      {rocks.map((r, i) => <Solid key={i} geo={GEO.rock} color={i % 2 ? "#a8a39a" : "#8f8b84"} th={0.03} pos={[r.x, r.s * 0.35, r.z]} scale={[r.s * 1.3, r.s * 0.8, r.s]} rot={[0.2 * i, i, 0]} shadow />)}
      {tufts.map((t, i) => <Solid key={i} geo={GEO.cone} color="#4f9a3c" th={0} pos={[t.x, t.s * 0.5, t.z]} scale={[t.s, t.s * 1.6, t.s]} />)}
    </>
  );
};

// ---- the target: steel plate (a squashed dome) on a wooden stand ----------------------------------------------------------------------
const Target: React.FC<{ f: number; outcome: Outcome }> = ({ f, outcome }) => {
  const hit = f >= IMPACT_F, dt = f - IMPACT_F;
  const wob = hit ? Math.sin(dt * 0.9) * 0.012 * Math.exp(-dt / 12) : 0; // the stand shivers a little
  return (
    <group position={[PLATE[0], 0, PLATE[2]]} rotation={[0, 0, wob]}>
      <Solid geo={GEO.post} color="#8a5a32" pos={[0.05, 0.9, -0.62]} scale={[1, 1.8, 1]} shadow />
      <Solid geo={GEO.post} color="#8a5a32" pos={[0.05, 0.9, 0.62]} scale={[1, 1.8, 1]} shadow />
      <Solid geo={GEO.box} color="#9a6a3c" pos={[0.04, 0.55, 0]} scale={[0.12, 0.1, 1.4]} shadow />
      <Solid geo={GEO.box} color="#9a6a3c" pos={[0.04, 1.78, 0]} scale={[0.12, 0.1, 1.4]} shadow />
      <Solid geo={GEO.dome} color="#aab4c0" th={0.025} pos={[0, PLATE[1], 0]} scale={[0.28, 0.72, 0.58]} shadow />
      {/* a lighter patch on the plate: a cheap "polished steel" highlight */}
      <Solid geo={GEO.dome} color="#dfe8f2" th={0} pos={[-0.012, PLATE[1] + 0.3, -0.1]} scale={[0.27, 0.16, 0.3]} />
      {/* the mark: a scratch (glance) or a small dark dent (stop) */}
      {hit && outcome === "glance" && <Solid geo={GEO.box} color="#4a5360" th={0} pos={[-0.275, PLATE[1] + 0.02, -0.02]} rot={[0.5, 0, 0]} scale={[0.008, 0.008, 0.36 * sm(dt / 4)]} />}
      {hit && outcome === "stop" && <Solid geo={GEO.spark} color="#4a5360" th={0} pos={[-0.275, PLATE[1], 0]} scale={[0.012, 0.07 * sm(dt / 3), 0.07 * sm(dt / 3)]} />}
    </group>
  );
};

// ---- bow and arrow (functions of the frame) ------------------------------------------------------------------------------------------
const Bow: React.FC<{ pull: number; snap: number }> = ({ pull, snap }) => {
  const R = 0.78;
  const { geo, tipA, tipB } = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 24; i++) {
      const u = (i / 24) * 2 - 1;
      pts.push(new THREE.Vector3(0.2 * (1 - u * u) - 0.1 * pull * u * u, u * R, 0));
    }
    return { geo: new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.028, 8), tipA: pts[0], tipB: pts[24] };
  }, [pull]);
  const nockX = -0.5 * pull + 0.06 * snap;
  return (
    <group position={[BOW_X, BOW_Y, 0]} rotation={[0, -0.5, 0]}>
      <Solid geo={geo} color="#7a4a24" th={0.016} />
      <Rod a={[tipA.x, tipA.y, 0]} b={[nockX, 0, 0]} r={0.004} color="#f4efe2" />
      <Rod a={[tipB.x, tipB.y, 0]} b={[nockX, 0, 0]} r={0.004} color="#f4efe2" />
    </group>
  );
};

const ArrowMesh: React.FC<{ trail: number }> = ({ trail }) => (
  <group>
    <Solid geo={GEO.shaft} color="#e0c68a" th={0.01} pos={[-0.5, 0, 0]} rot={[0, 0, Math.PI / 2]} />
    <Solid geo={GEO.head} color="#6c7480" th={0.01} pos={[0.06, 0, 0]} rot={[0, 0, -Math.PI / 2]} />
    {[0, 1, 2].map((i) => <Solid key={i} geo={GEO.feather} color={i === 0 ? "#d8322d" : "#f2f2ea"} th={0} pos={[-0.92, 0, 0]} rot={[(i * Math.PI * 2) / 3, 0, 0]} />)}
    {trail > 0 && <mesh geometry={GEO.box} position={[-1 - 0.9 * trail, 0, 0]} scale={[1.8 * trail, 0.03, 0.03]}><meshBasicMaterial color="#ffffff" transparent opacity={0.4} /></mesh>}
  </group>
);

type ArrowState = { pos: Vec3; rot: Vec3; trail: number; broken?: { pos: Vec3; rot: Vec3 } };
/** arrow pose at frame f (after the release) for the given outcome: a flight along a gentle arc, then the outcome */
const arrowAt = (f: number, outcome: Outcome): ArrowState => {
  const tau = tauOf(f);
  const u = Math.min(tau, FLIGHT) / FLIGHT;
  const x = X0 + (X_HIT - X0) * u;
  const y = BOW_Y + (PLATE[1] - BOW_Y) * u + 0.16 * Math.sin(Math.PI * u);
  const slope = ((PLATE[1] - BOW_Y) + 0.16 * Math.PI * Math.cos(Math.PI * u)) / (X_HIT - X0); // dy/dx
  if (tau < FLIGHT) return { pos: [x, y, 0], rot: [0, 0, Math.atan(slope)], trail: 1 };
  const s = tau - FLIGHT; // time since the hit (arrow time)
  if (outcome === "stick") return { pos: [X_HIT + 0.07 * sm(s / 2), PLATE[1] + 0.02, 0.05], rot: [0, 0.12, 0.28 + 0.03 * Math.sin(s * 1.6) * Math.exp(-s / 8)], trail: 0 };
  if (outcome === "stop") {
    // the arrow breaks at the plate: the head half stays, the tail half drops away
    const bx = X_HIT - 0.12 - 0.1 * s, by = Math.max(0.05, PLATE[1] - 0.4 * s - 0.0125 * s * s + 0.07 * s), bz = 0.05 * s;
    return { pos: [X_HIT + 0.02, PLATE[1], 0], rot: [0, 0, 0.05], trail: 0, broken: { pos: [bx, by, bz], rot: [0.5 * s, 0.3 * s, -0.7 * s] } };
  }
  // glance: it skids off the plate, flips up and away
  return { pos: [X_HIT + 0.1 * s, PLATE[1] + 0.04 + 0.2 * s - 0.004 * s * s, 0.13 * s], rot: [0.1 * s, 0.04 * s, 0.35 + 0.09 * s], trail: 0 };
};

// ---- sparks, flash --------------------------------------------------------------------------------------------------------------------
const Sparks: React.FC<{ f: number; outcome: Outcome }> = ({ f, outcome }) => {
  const s = tauOf(f) - FLIGHT;
  if (s < 0 || s > 9) return null;
  const n = outcome === "stick" ? 10 : 18;
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const a = rnd(i * 3) * Math.PI * 2, e = 0.4 + rnd(i * 3 + 1) * 1.1, sp = 0.35 + rnd(i * 3 + 2) * 0.5;
        const px = FRONT_X - 0.01 - 0.12 * Math.abs(Math.cos(a)) * sp * s, py = PLATE[1] + 0.02 + sp * Math.sin(a) * e * s * 0.5 - 0.012 * s * s, pz = sp * Math.cos(a) * e * s * 0.5;
        const k = Math.max(0, 1 - s / (5 + 4 * rnd(i + 9))), r = 0.022 * k;
        return k > 0 ? <mesh key={i} geometry={GEO.spark} position={[px, py, pz]} scale={[r * 1.8, r * 0.9, r]}><meshBasicMaterial color={i % 3 ? "#ffd24a" : "#fff4c0"} /></mesh> : null;
      })}
    </>
  );
};
const Flash: React.FC<{ f: number }> = ({ f }) => {
  const d = f - IMPACT_F;
  if (d < 0 || d > 3) return null;
  const r = 0.35 * (1 - d / 4);
  return <mesh geometry={GEO.spark} position={[FRONT_X - 0.06, PLATE[1] + 0.02, 0]} scale={[r * 0.6, r, r]}><meshBasicMaterial color="#fff6d0" transparent opacity={0.9} /></mesh>;
};

// ---- the archer: Milo's side card (stand pose); the pose has no drawn bow arms yet (reported as missing) -----------------------------------
const useArcherTex = () => useMemo(() => {
  const k = 1.1, c = document.createElement("canvas");
  c.width = Math.round(600 * k); c.height = Math.round(1000 * k);
  const g = c.getContext("2d")!; g.setTransform(k, 0, 0, k, 0, 0);
  bodySide(new Pen(g), milo("medieval"), { mode: "stand", expr: "stern", seed: MILO_SEED });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}, []);
const CS = 0.00216 * 0.88; // metres per design unit (a little under the engine's, so the archer stands about 1.85 m)
const CARD = new THREE.PlaneGeometry(600 * CS, 1000 * CS);
const Archer: React.FC<{ face: number }> = ({ face }) => {
  const map = useArcherTex();
  return (
    <mesh geometry={CARD} position={[ARCHER_X, (975 - 500) * CS, 0]} rotation={[0, face, 0]}>
      <meshBasicMaterial map={map} transparent alphaTest={0.5} side={THREE.DoubleSide} />
    </mesh>
  );
};

// ---- camera -------------------------------------------------------------------------------------------------------------------------
type Cam = { pos: Vec3; look: Vec3; fov: number };
const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const cameraAt = (f: number, outcome: Outcome): Cam => {
  // 1: behind the archer's shoulder: the archer big on the left, the stand small on the right; a slow push
  if (f < 45) { const t = f / 45; return { pos: lerp3([-10.2, 1.7, 0.7], [-9.7, 1.65, 0.55], t), look: lerp3([4.5, 1.4, 0], [5.5, 1.42, 0], t), fov: 52 }; }
  // 2: follows the arrow from behind and to the side
  if (f < 90) {
    const a = arrowAt(f, outcome).pos, t = (f - 45) / 45;
    return { pos: [a[0] - 1.8 + 0.3 * t, a[1] + 0.35 - 0.1 * t, 1.0 - 0.1 * t], look: [a[0] + 0.5, a[1] - 0.02, 0], fov: 42 };
  }
  // 3: impact close-up from the side (arrow tip and plate in one frame)
  if (f < 135) { const t = (f - 90) / 45; return { pos: lerp3([4.4, 1.66, 3.5], [4.9, 1.6, 3.0], t), look: lerp3([6.5, 1.5, 0], [6.8, 1.5, 0], t), fov: 36 - 3 * t }; }
  // 4: slow push toward the mark on the plate
  const t = (f - 135) / 45;
  return { pos: lerp3([4.9, 1.6, 3.0], [5.6, 1.55, 1.9], t), look: [6.75, 1.52, 0], fov: 33 - 4 * t };
};
const Rig: React.FC<{ cam: Cam; kick: Vec3 }> = ({ cam, kick }) => {
  const { camera } = useThree();
  const c = camera as THREE.PerspectiveCamera;
  c.position.set(cam.pos[0] + kick[0], cam.pos[1] + kick[1], cam.pos[2] + kick[2]);
  c.lookAt(cam.look[0], cam.look[1], cam.look[2]);
  c.fov = cam.fov; c.updateProjectionMatrix();
  return null;
};

// ---- the scene -----------------------------------------------------------------------------------------------------------------------
const Scene: React.FC<{ outcome: Outcome }> = ({ outcome }) => {
  const f = useCurrentFrame();
  const cam = cameraAt(f, outcome);
  const d = f - IMPACT_F;
  const k = d >= 0 && d < 7 ? 1 - d / 7 : 0, sgn = d % 2 ? 1 : -1; // 7-frame shake: flips every frame, decays
  const kick: Vec3 = [0, sgn * 0.035 * k, sgn * 0.02 * k];
  const drawing = f < RELEASE;
  const pull = drawing ? sm((f - 8) / 34) : 0, snap = !drawing && f < RELEASE + 6 ? Math.sin(((f - RELEASE) / 6) * Math.PI * 3) * (1 - (f - RELEASE) / 6) : 0;
  const A = arrowAt(f, outcome);
  const face = Math.atan2(cam.pos[0] - ARCHER_X, cam.pos[2]);
  return (
    <>
      <color attach="background" args={["#8fbbe9"]} />
      <fog attach="fog" args={["#f3e3c3", 30, 150]} />
      <ambientLight intensity={1.15} />
      <directionalLight position={[-6, 12, 9]} intensity={2.2} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-14} shadow-camera-right={14} shadow-camera-top={8} shadow-camera-bottom={-8} shadow-camera-near={1} shadow-camera-far={60} />
      <Rig cam={cam} kick={kick} />
      <Scenery />
      <Target f={f} outcome={outcome} />
      <Archer face={face} />
      <Bow pull={pull} snap={snap} />
      <group position={drawing ? [X0 - 0.5 * pull, BOW_Y, 0] : A.pos} rotation={drawing ? [0, 0, 0] : A.rot}><ArrowMesh trail={drawing ? 0 : A.trail} /></group>
      {A.broken && !drawing && <group position={A.broken.pos} rotation={A.broken.rot}><Solid geo={GEO.shaft} color="#e0c68a" th={0.01} pos={[-0.3, 0, 0]} rot={[0, 0, Math.PI / 2]} scale={[1, 0.6, 1]} /></group>}
      <Sparks f={f} outcome={outcome} />
      <Flash f={f} />
    </>
  );
};

export const ArrowTest: React.FC<{ outcome?: Outcome }> = ({ outcome = "glance" }) => (
  <AbsoluteFill style={{ background: "#8fbbe9" }}>
    <ThreeCanvas width={1080} height={1920} shadows gl={{ antialias: true }} camera={{ fov: 45, near: 0.1, far: 800 }}>
      <Scene outcome={outcome} />
    </ThreeCanvas>
  </AbsoluteFill>
);
