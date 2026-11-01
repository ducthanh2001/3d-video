import { Composition } from "remotion";
import { BridgeShort, BRIDGE_FRAMES } from "./videos/bridge/Bridge";
import { AnalogShort, ANALOG_FRAMES } from "./videos/analog/Analog";
import { CharacterSheet, SHEET_W, SHEET_H } from "./series/CharacterSheet";
import { Ep001Short, EP001_FRAMES } from "./videos/ep001/Ep001";
import { MiloOptions, OPT_W, OPT_H } from "./series/MiloOptions";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="CharacterSheet" component={CharacterSheet} durationInFrames={1} fps={30} width={SHEET_W} height={SHEET_H} />
      <Composition id="MiloOptions" component={MiloOptions} durationInFrames={1} fps={30} width={OPT_W} height={OPT_H} />
      <Composition id="Ep001" component={Ep001Short} durationInFrames={EP001_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="AnalogShort" component={AnalogShort} durationInFrames={ANALOG_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="BridgeShort" component={BridgeShort} durationInFrames={BRIDGE_FRAMES} fps={30} width={1080} height={1920} />
    </>
  );
};
