# Stick-film kit (`src/kit`)

Code library for dark, smooth stick-figure shorts: characters, materials, props, animals, crowds, effects and a dynamic camera.
Everything is an SVG React component and a **pure function of the frame** (no state, no `Math.random`). That makes every frame
reproducible and every move 30 fps smooth.

- Approval sheets: composition `KitSheet` (5 stills: poses, materials, props, animals, crowds + effects).
- Demo film: composition `KitShowcase` (1370 frames ≈ 45.7 s, 7 scenes, source in `demo/`).

```bash
node scripts/stills.mjs KitSheet out/kit/sheet- 0,1,2,3,4 0.5
npx remotion render src/index.ts KitShowcase out/kit/kit-showcase.mp4 --codec h264 --crf 18 --gl=angle --muted
```

## Scene skeleton
```tsx
import { Shell } from "./demo/shared";                // svg + KitDefs + vignette + grain + title + channel tag
<Shell f={f} title="KEEP MOVING">
  <Cam f={f} keys={[{ f: 0, x: 540, y: 1000 }, { f: 40, x: 900, y: 900, z: 1.3, e: "burst" }]} kicks={[{ f: 52, amp: 16 }]}>
    <Parallax d={0.3}><Hills y={1200} /></Parallax>     {/* moves at 30 % of the camera */}
    <Surface mat="brick" x={-500} y={0} w={2200} h={1400} tint="#3a2a5a" />
    <Hero x={500} y={1400} pose={walk(f / 40)} />
  </Cam>
</Shell>
```
Coordinates are world px. The camera puts world point (x, y) at the frame centre, with zoom `z` and roll `r` (degrees).

## Parts

| File | Contents |
|---|---|
| `core.ts` | easing (`burst` = the channel's ease-out camera move, `back`, `elastic`, `bounce`), `track` keyframes, seeded `rng`, `noise1`, `ik2` |
| `hero.tsx` | `<Hero x y pose s flip rot look hold behind>`. `POSES.*`: stand, idle, sad, armsUp, headInHands, point, think, push, carry, crouch, kneel, sit, hugKnees, lie, jumpLoad, jumpAir, tuck, wave, celebrate, fallBack, throw, kick, kickLoad. Cycles: `walk(phase)`, `run(phase)`, `climb(phase)`, `jump(t)`. Blend with `mixPose(a, b, t)`. `walkerAt(f, x0, speed)` moves the root so the feet stay planted. Looks: `LOOK_WHITE` (hero), `LOOK_GREY` (others). |
| `materials.tsx` | `<KitDefs/>` (once per svg). `MAT.*` patterns: brick, stone, wood, boards, soil, grass, concrete, asphalt, sand, fabric, tiles, stars, metal. `<Surface>`, `<Water f>` (animated), light overlays `<LightPool>`, `<Spot>`, `<Shade>`, `<Vignette>`, `<Grain f>`, shiny floor `<Reflect y>` |
| `props.tsx` | Car (line/solid, wheels spin), House (line/solid, lit windows, smoke), Castle (`p` 0→1 builds brick by brick), MoneyPile, GoldBars, Stairs, Slabs (glowing steps that appear), Ladder, Flag (waves), Trophy, Door (opens, light floods), Rock (label), Rope/chain, Wings (flap/open), Seesaw + `seesawEnds`, BedTop (top-down), DigitalClock, WallClock, Desk, Chair, Laptop, Phone, Book, Dumbbell, Window (night), Sign, Goal (net shakes), Ball, Fence, GrassTufts, Tree (sways), LampPost, Sun, Moon, Cloud, Hills |
| `animals.tsx` | `<Animal kind="goat\|dog\|cat\|horse\|sheep" pose="stand\|walk\|run\|sit\|graze\|jump" phase horns>` (shared four-legged rig, `gaitPhase(f, speed, kind)` keeps feet planted), `<Bird flap perched>`, `<Fish f>` |
| `crowd.tsx` | `<Crowd rows cols vp cheer>` (perspective block of hundreds of people, seeded cheering), `<Stands>` (thousands of stadium fans, flashes, banners), `<Group>` (n heroes in formation) |
| `fx.tsx` | `<Particles>` + presets Money, Coins, Debris, Sparks, Dust, Confetti, Shards; Rays, Glow, SpeedLines, ImpactRing, Sparkle, Crack (`p` 0→1), Motes |
| `camera.tsx` | `<Cam keys kicks drift blur state>`: automatic motion blur from camera speed, decaying shake kicks, hand-held drift. `<Parallax d>`, `<Screen>`. Recipes: `zoomInto`, `whip`, `follow(path)`. Transitions: `<Flash>`, `<Dip>`, `<XFade>`, `rewindTime()` + `<RewindFx>` (VHS rewind) |

## Rules that keep it smooth
- Drive cycles from **distance**, not time (`phase = distance / perTurn`), or the feet slide.
- Camera moves: `burst` for the channel's quick-then-settle moves, `inOut` for slow pushes; hold most frames, never dead still (`drift`).
- One accent colour per scene (red clock, gold light, green money). Everything else stays dark grey and white.
- Text stays out of the bottom 20 % (the `Shell` channel tag sits at y=1600).
