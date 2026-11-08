// Approval sheets of the kit (one still per frame): 0 poses, 1 materials, 2 props, 3 animals, 4 crowds + effects.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Hero, POSES, Pose, jump, run, walk, climb } from "../hero";
import { KitDefs, MatName, Surface, Water, Vignette, LightPool, Spot } from "../materials";
import { Ball, Book, Car, Castle, Chair, Desk, DigitalClock, Door, Dumbbell, Flag, Goal, GoldBars, GrassTufts, House, Ladder, LampPost, Laptop, MoneyPile, Phone, Rock, Rope, Seesaw, Sign, Stairs, Tree, Trophy, WallClock, Window, Wings } from "../props";
import { Animal, Bird, Fish } from "../animals";
import { Crowd, Stands } from "../crowd";
import { Coins, Confetti, Crack, Debris, Glow, ImpactRing, Money, Motes, Rays, Shards, Sparkle, Sparks, SpeedLines } from "../fx";

export const KIT_SHEET_PAGES = 5;
const LABEL = '"Segoe UI", Arial, sans-serif';
const Label: React.FC<{ x: number; y: number; t: string }> = ({ x, y, t }) => <text x={x} y={y} textAnchor="middle" fontFamily={LABEL} fontSize={22} letterSpacing={2} fill="#8a8a92">{t}</text>;

const PosePage: React.FC = () => {
  const P = POSES;
  const items: [string, Pose][] = [
    ["stand", P.stand()], ["walk", walk(0.15)], ["run", run(0.2)], ["jump load", P.jumpLoad()],
    ["jump air", jump(18).pose], ["tuck", P.tuck()], ["sad", P.sad()], ["arms up", P.armsUp()],
    ["head in hands", P.headInHands()], ["point", P.point()], ["think", P.think()], ["push", P.push()],
    ["carry", P.carry()], ["crouch", P.crouch()], ["kneel", P.kneel()], ["sit", P.sit()],
    ["hug knees", P.hugKnees()], ["lie", P.lie()], ["climb", climb(0.25)], ["fall back", P.fallBack()],
  ];
  return (
    <>
      {items.map(([name, pose], i) => {
        const c = i % 4, r = Math.floor(i / 4), x = 150 + c * 260, y = 330 + r * 360;
        return <g key={name}><Hero x={x - (name === "lie" ? 70 : 0)} y={y} pose={pose} s={0.62} /><Label x={x} y={y + 40} t={name} /></g>;
      })}
    </>
  );
};

const MatPage: React.FC<{ f: number }> = ({ f }) => {
  const mats: MatName[] = ["brick", "stone", "wood", "boards", "soil", "grass", "concrete", "asphalt", "sand", "fabric", "tiles", "metal"];
  return (
    <>
      {mats.map((m, i) => {
        const c = i % 3, r = Math.floor(i / 3), x = 40 + c * 340, y = 60 + r * 380;
        return <g key={m}><Surface mat={m} x={x} y={y} w={320} h={320} rx={12} dark={0.25} /><Label x={x + 160} y={y + 350} t={m} /></g>;
      })}
      <Water f={f} x={40} top={1600} w={1000} h={260} />
    </>
  );
};

const PropPage: React.FC = () => {
  const F = 40;
  return (
    <>
      <Car x={280} y={200} s={0.95} look="line" />
      <Car x={800} y={200} s={0.95} lights f={F} speed={6} />
      <House x={200} y={560} s={0.8} look="line" lit={0.9} />
      <House x={560} y={560} s={0.8} lit={0.8} smoke={1} f={F} />
      <Castle x={900} y={560} s={0.45} p={1} glow={0.7} flagF={F} />
      <MoneyPile x={200} y={820} w={300} h={150} f={F} />
      <GoldBars x={430} y={820} />
      <Trophy x={580} y={820} f={F} s={0.9} />
      <Stairs x={680} y={820} n={5} sw={70} sh={45} colors={["#e0a030", "#4aa0e0", "#c04ad0", "#40c070", "#e05050"]} />
      <Flag x={1010} y={600} f={F} pole={0} s={0} />
      <Door x={120} y={1180} s={0.8} open={0.6} />
      <Rock x={360} y={1180} label="FEAR" w={240} h={100} />
      <Rope a={[470, 1080]} b={[620, 1160]} sag={50} f={F} />
      <Wings x={760} y={1080} s={0.6} flap={0.2} />
      <Seesaw x={540} y={1460} angle={-12} len={520} />
      <Ladder x={110} y={1460} h={260} />
      <Flag x={220} y={1460} f={F} />
      <Window x={800} y={1220} w={170} h={200} f={F} />
      <WallClock x={980} y={1360} r={70} h={10} m={10} glow />
      <DigitalClock x={140} y={1560} text="3:09" s={0.8} />
      <Desk x={420} y={1700} w={300} h={130} /><Laptop x={400} y={1570} s={0.8} f={F} /><Chair x={240} y={1700} />
      <Phone x={600} y={1600} rot={-14} /><Book x={680} y={1660} open /><Book x={760} y={1690} color="#3a6ac0" />
      <Dumbbell x={880} y={1690} />
      <Goal x={540} y={1890} s={0.5} /><Ball x={760} y={1870} spin={30} />
      <Tree x={980} y={1890} s={0.42} f={F} />
      <LampPost x={60} y={1890} s={0.42} />
      <GrassTufts x={820} y={1880} w={120} n={10} f={F} />
      <Sign x={300} y={1880} text="START" w={160} s={0.8} />
    </>
  );
};

const AnimalPage: React.FC = () => {
  const F = 30;
  return (
    <>
      <Animal kind="goat" x={280} y={360} pose="stand" horns={0} f={F} s={0.9} />
      <Animal kind="goat" x={780} y={360} pose="walk" phase={0.3} horns={1} f={F} s={0.9} />
      <Animal kind="dog" x={260} y={700} pose="walk" phase={0.1} f={F} />
      <Animal kind="dog" x={780} y={700} pose="sit" f={F} />
      <Animal kind="cat" x={260} y={1000} pose="stand" f={F} />
      <Animal kind="sheep" x={780} y={1000} pose="graze" f={F} />
      <Animal kind="horse" x={340} y={1420} pose="run" phase={0.25} f={F} s={0.85} />
      <Animal kind="horse" x={820} y={1420} pose="stand" f={F} s={0.6} flip />
      <Bird x={220} y={1600} flap={0.2} /><Bird x={420} y={1580} flap={0.7} s={0.8} /><Bird x={620} y={1640} perched />
      <Fish x={300} y={1820} f={F} /><Fish x={620} y={1800} f={F + 7} s={0.8} color="#e8a040" belly="#ffe2b0" /><Fish x={880} y={1840} f={F + 3} s={0.6} flip color="#7ab0e0" />
    </>
  );
};

const CrowdFxPage: React.FC = () => {
  const F = 40;
  return (
    <>
      <Stands f={F} y0={60} y1={420} />
      <Rect />
      <Crowd f={F} rows={9} cols={9} x={360} y={1150} gap={90} vp={[360, 560]} s={0.45} cheer={0.3} />
      <Rays f={F} at={[860, 700]} a={0.9} />
      <Hero x={860} y={1000} pose={POSES.armsUp()} s={0.6} />
      <Money f={F} f0={0} at={[200, 1400]} n={30} />
      <Debris f={F} f0={30} at={[540, 1350]} floor={1500} />
      <Sparks f={F} f0={34} at={[820, 1350]} />
      <Confetti f={F} f0={0} at={[540, 1700]} />
      <Coins f={F} f0={22} at={[200, 1780]} floor={1880} />
      <Shards f={F} f0={30} at={[820, 1700]} />
      <Crack at={[880, 1500]} p={0.8} size={90} color="#e8e8e8" />
      <SpeedLines f={F} at={[400, 1560]} />
      <Hero x={460} y={1640} pose={run(0.3)} s={0.4} />
      <ImpactRing f={F} f0={34} at={[700, 1890]} />
      <Sparkle f={F} at={[980, 1600]} s={1.5} /><Sparkle f={F} at={[1000, 1700]} ph={2} />
      <Glow at={[100, 1600]} r={120} color="#ffd27a" />
      <Motes f={F} x={0} y={500} w={1080} h={500} />
    </>
  );
};
const Rect: React.FC = () => <rect x={0} y={440} width={1080} height={800} fill="#121216" />;

export const KitSheet: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#0d0d10" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <KitDefs />
        {f === 0 && <><Spot x={540} floorY={1800} spread={600} a={0.08} /><PosePage /></>}
        {f === 1 && <MatPage f={f} />}
        {f === 2 && <PropPage />}
        {f === 3 && <AnimalPage />}
        {f === 4 && <CrowdFxPage />}
        {f === 0 && <Vignette a={0.6} />}
        {f === 1 && <LightPool cx={540} cy={300} rx={500} a={0.15} />}
      </svg>
    </AbsoluteFill>
  );
};
