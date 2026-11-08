// Truck + meteor test (240 frames, 30 fps, 8 s). THE one place where time and the physics constants live: the meteor strike (F.hit) drives the
// flash, the fireball, the debris, the shake, the blast that throws the driver out of the cab, the camera and the sound cues.
// Cartoon, no gore: the driver is thrown clear by the blast, tumbles, lies still, sits up and looks at the burning wreck.
export const FRAMES = 240;
export const FLOOR_Y = 1320; // screen y of the road surface
export const V = 11; // truck speed in px / frame (330 px / s) until the strike

export const F = {
  meteor: 70, // the meteor shows up at the top of the frame
  notice: 98, // the driver looks up
  startle: 104, // he jerks back and lets go of the wheel
  hit: 132, // the meteor hits the truck
  sitUp: 190, // he starts to sit up
  look: 222, // he turns his head toward the wreck and scratches it
};
/** the blast throws the driver out of the cab: initial velocity (px/frame) and gravity (px/frame^2), spin in degrees per frame */
export const BLAST = { vx: 16, vy: -24, g: 1.5, spin: 0 };
/** the hip lands when it is lower than this above the road */
export const LAND_H = 40;
/** the first frame at which the thrown driver touches the road */
export const F_LAND = (() => { for (let t = 1; t < 80; t++) { const y = -108 + BLAST.vy * t + 0.5 * BLAST.g * t * t; if (y >= -LAND_H) return F.hit + t; } return F.hit + 24; })();
/** spin (deg / frame): chosen so that he touches down lying on his back (torso at 272 deg: horizontal, head toward -x) after a full forward flip */
BLAST.spin = (272 - 4) / (F_LAND - F.hit);
export const SLIDE = { decel: 1.1, lie: 18 }; // friction (px/frame^2) and how long the tumble takes to settle on his back (frames)
export const F_LIE = F_LAND + SLIDE.lie;
/** the truck wreck coasts to a stop: deceleration px/frame^2 */
export const WRECK_DECEL = 0.25;

/** camera shake: [frame, amplitude px]; 7 frames, the sign flips every frame and decays */
export const SHAKES: [number, number][] = [[F.hit, 16], [F.hit + 8, 6], [F_LAND, 5]];

/** the meteor's path on screen is a straight line to the impact point, accelerating (see kin.ts) */
export const METEOR = { start: 78, from: [1330, -200] as [number, number] };

export const sfxCues = () => [
  { frame: 0, seconds: 0, sfx: "truck engine loop (diesel, steady)" },
  { frame: F.meteor, seconds: +(F.meteor / 30).toFixed(3), sfx: "distant rising whoosh starts" },
  { frame: F.notice, seconds: +(F.notice / 30).toFixed(3), sfx: "engine dips, driver gasp" },
  { frame: F.hit - 2, seconds: +((F.hit - 2) / 30).toFixed(3), sfx: "meteor roar peaks" },
  { frame: F.hit, seconds: +(F.hit / 30).toFixed(3), sfx: "IMPACT: explosion boom + shockwave (music and engine cut for 0.3 s)" },
  { frame: F.hit + 10, seconds: +((F.hit + 10) / 30).toFixed(3), sfx: "debris rain / metal clatter" },
  { frame: F_LAND, seconds: +(F_LAND / 30).toFixed(3), sfx: "body thump + slide" },
  { frame: F_LIE, seconds: +(F_LIE / 30).toFixed(3), sfx: "ringing ears (high tone fades), fire crackle loop begins" },
  { frame: F.sitUp, seconds: +(F.sitUp / 30).toFixed(3), sfx: "groan" },
].sort((a, b) => a.frame - b.frame);
