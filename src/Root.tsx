import { Composition } from "remotion";
import { BridgeShort, BRIDGE_FRAMES } from "./videos/bridge/Bridge";
import { AnalogShort, ANALOG_FRAMES } from "./videos/analog/Analog";
import { CharacterSheet, SHEET_W, SHEET_H } from "./series/CharacterSheet";
import { Ep001Short, EP001_FRAMES } from "./videos/ep001/Ep001";
import { MiloOptions, OPT_W, OPT_H } from "./series/MiloOptions";
import { Ep002Short, EP002_FRAMES } from "./videos/ep002/Ep002";
import { Ep003Short, EP003_FRAMES } from "./videos/ep003/Ep003";
import { FlatCharacterSheet, FLAT_SHEET_W, FLAT_SHEET_H } from "./flat/FlatCharacterSheet";
import { Ep005Short, EP005_FRAMES } from "./episodes/ep005-einstein-failed-math/Ep005";
import { Ep005Thumb } from "./episodes/ep005-einstein-failed-math/Thumb";
import { ArrowTest, ARROW_FRAMES } from "./tests/arrow/ArrowTest";
import { ThermoSheet, THERMO_SHEET_W, THERMO_SHEET_H } from "./flat/ThermoSheet";
import { ThermoScenes, THERMO_SCENES } from "./episodes/ep007-thermopylae/Scenes";
import { Ep007Short, EP007_FRAMES } from "./episodes/ep007-thermopylae/Ep007";
import { Ep007Thumb } from "./episodes/ep007-thermopylae/Thumb";
import { StickTest, STICK_FRAMES } from "./tests/stick/StickTest";
import { TruckTest, TRUCK_FRAMES } from "./tests/truck/TruckTest";
import { TwoLivesScenes, TWO_LIVES_SCENES } from "./series2/Scenes";
import { KitSheet, KIT_SHEET_PAGES } from "./kit/demo/KitSheet";
import { KitShowcase, SHOWCASE_FRAMES } from "./kit/demo/KitShowcase";
import { UpgradeBoard, UPGRADE_KEYS } from "./episodes/upgrade/Board";
import { UpgradeFilm, UPGRADE_FRAMES } from "./episodes/upgrade/Film";
import { ScrollerSheet } from "./episodes/hit100/ScrollerSheet";
import { NextStepFilm, NEXTSTEP_FRAMES } from "./episodes/nextstep/Film";
import { TruthsStyle, TRUTHS_STYLE_FRAMES } from "./episodes/truths/StyleFrames";
import { TruthsFilm, TRUTHS_FRAMES } from "./episodes/truths/Film";
import { TruthsThumb } from "./episodes/truths/Thumb";
import { SameHoursStyle, SAMEHOURS_STYLE_FRAMES } from "./episodes/samehours/StyleFrames";
import { SameHoursFilm, SAMEHOURS_FRAMES } from "./episodes/samehours/Film";
import { SameHoursThumb, SAMEHOURS_THUMBS } from "./episodes/samehours/Thumb";
import { BeatStyle, BEAT_STYLE_FRAMES } from "./episodes/beatyesterday/StyleFrames";
import { BeatHook, HOOK_OPTS } from "./episodes/beatyesterday/HookOptions";
import { TomorrowStyle, TOMORROW_STYLE_FRAMES } from "./episodes/tomorrow/StyleFrames";
import { TomorrowObjects, TOMORROW_OBJ_FRAMES } from "./episodes/tomorrow/ObjectFrames";
import { TomorrowMinimal, TOMORROW_MIN_FRAMES } from "./episodes/tomorrow/MinimalFrames";
import { TomorrowV7, TOMORROW_V7_FRAMES } from "./episodes/tomorrow/V7Frames";
import { LaughFrames, LAUGH_FRAMES } from "./episodes/laugh/Frames";
import { LaughFilm, LAUGH_FILM_FRAMES } from "./episodes/laugh/Film";
import { LaughThumb, LAUGH_THUMBS } from "./episodes/laugh/Thumb";
import { LookTestBW, LookTestMuted, LOOK_TEST_FRAMES } from "./episodes/look/BedroomTest";
import { ProveFrames, PROVE_FRAMES } from "./episodes/prove/Frames";
import { ProveV4Frames, PROVE4_FRAMES } from "./episodes/prove/V4Frames";
import { ProveV5Frames, PROVE5_FRAMES } from "./episodes/prove/V5Frames";
import { ProveV6Frames, PROVE6_FRAMES } from "./episodes/prove/V6Frames";
import { ProveFilm, PROVE_FILM_FRAMES } from "./episodes/prove/Film";
import { ProveThumb, PROVE_THUMBS } from "./episodes/prove/Thumb";
import { TrustFrames, TRUST_FRAMES } from "./episodes/trust/Frames";
import { TrustV4Frames, TRUST4_FRAMES } from "./episodes/trust/V4Frames";
import { TrustFilm, TRUST_FILM_FRAMES } from "./episodes/trust/Film";
import { TrustThumb, TRUST_THUMBS } from "./episodes/trust/Thumb";
import { QuietlyFrames, QUIETLY_FRAMES } from "./episodes/quietly/Frames";
import { ActingSheet } from "./kit/demo/ActingSheet";
import { DoneFrames, DONE_FRAMES } from "./episodes/done/Frames";
import { DoneFilm, DONE_FILM_FRAMES } from "./episodes/done/Film";
import { DoneThumb, DONE_THUMBS } from "./episodes/done/Thumb";
import { SmartFilm, SMART_FRAMES } from "./episodes/smart/Film";
import { SmartThumb, SMART_THUMBS } from "./episodes/smart/Thumb";
import { PressureFrames, PRESSURE_FRAMES } from "./episodes/pressure/Frames";
import { Pressure2Frames, PRESSURE2_FRAMES } from "./episodes/pressure/Frames2";
import { Pressure3Frames, PRESSURE3_FRAMES } from "./episodes/pressure/Frames3";
import { PressureFilm, PRESSURE_FILM_FRAMES } from "./episodes/pressure/Film";
import { UsaFrames, USA_FRAMES } from "./episodes/usa/Frames";
import { PaydayBoard, PAYDAY_KEYS } from "./episodes/payday/Board";
import { PaydayFilm, PAYDAY_FRAMES } from "./episodes/payday/Film";
import { Ep003Thumb } from "./videos/ep003/Thumb";
import { Ep002Thumb, THUMB_W, THUMB_H } from "./videos/ep002/Thumb";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="CharacterSheet" component={CharacterSheet} durationInFrames={1} fps={30} width={SHEET_W} height={SHEET_H} />
      <Composition id="MiloOptions" component={MiloOptions} durationInFrames={1} fps={30} width={OPT_W} height={OPT_H} />
      <Composition id="FlatCharacterSheet" component={FlatCharacterSheet} durationInFrames={1} fps={30} width={FLAT_SHEET_W} height={FLAT_SHEET_H} />
      <Composition id="Ep005Einstein" component={Ep005Short} durationInFrames={EP005_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="Ep005Thumb" component={Ep005Thumb} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="ArrowTest" component={ArrowTest} defaultProps={{ outcome: "glance" as const }} durationInFrames={ARROW_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="ThermoSheet" component={ThermoSheet} durationInFrames={1} fps={30} width={THERMO_SHEET_W} height={THERMO_SHEET_H} />
      <Composition id="ThermoScenes" component={ThermoScenes} durationInFrames={THERMO_SCENES} fps={30} width={1080} height={1920} />
      <Composition id="Ep007Thermopylae" component={Ep007Short} durationInFrames={EP007_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="Ep007Thumb" component={Ep007Thumb} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="KitSheet" component={KitSheet} durationInFrames={KIT_SHEET_PAGES} fps={30} width={1080} height={1920} />
      <Composition id="KitShowcase" component={KitShowcase} durationInFrames={SHOWCASE_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="UpgradeBoard" component={UpgradeBoard} durationInFrames={UPGRADE_KEYS} fps={30} width={1080} height={1920} />
      <Composition id="UpgradeFilm" component={UpgradeFilm} durationInFrames={UPGRADE_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="ScrollerSheet" component={ScrollerSheet} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="NextStepFilm" component={NextStepFilm} durationInFrames={NEXTSTEP_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="TruthsStyle" component={TruthsStyle} durationInFrames={TRUTHS_STYLE_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="TruthsFilm" component={TruthsFilm} durationInFrames={TRUTHS_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="SameHoursStyle" component={SameHoursStyle} durationInFrames={SAMEHOURS_STYLE_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="SameHoursFilm" component={SameHoursFilm} durationInFrames={SAMEHOURS_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="SameHoursThumb" component={SameHoursThumb} durationInFrames={SAMEHOURS_THUMBS} fps={30} width={1080} height={1920} />
      <Composition id="UsaFrames" component={UsaFrames} durationInFrames={USA_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="TrustV4Frames" component={TrustV4Frames} durationInFrames={TRUST4_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="TrustFilm" component={TrustFilm} durationInFrames={TRUST_FILM_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="TrustThumb" component={TrustThumb} durationInFrames={TRUST_THUMBS} fps={30} width={1080} height={1920} />
      <Composition id="QuietlyFrames" component={QuietlyFrames} durationInFrames={QUIETLY_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="ActingSheet" component={ActingSheet} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="DoneFrames" component={DoneFrames} durationInFrames={DONE_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="DoneFilm" component={DoneFilm} durationInFrames={DONE_FILM_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="DoneThumb" component={DoneThumb} durationInFrames={DONE_THUMBS} fps={30} width={1080} height={1920} />
      <Composition id="SmartFilm" component={SmartFilm} durationInFrames={SMART_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="SmartThumb" component={SmartThumb} durationInFrames={SMART_THUMBS} fps={30} width={1080} height={1920} />
      <Composition id="PressureFrames" component={PressureFrames} durationInFrames={PRESSURE_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="Pressure2Frames" component={Pressure2Frames} durationInFrames={PRESSURE2_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="Pressure3Frames" component={Pressure3Frames} durationInFrames={PRESSURE3_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="PressureFilm" component={PressureFilm} durationInFrames={PRESSURE_FILM_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="TrustFrames" component={TrustFrames} durationInFrames={TRUST_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="ProveThumb" component={ProveThumb} durationInFrames={PROVE_THUMBS} fps={30} width={1080} height={1920} />
      <Composition id="ProveFilm" component={ProveFilm} durationInFrames={PROVE_FILM_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="ProveV6Frames" component={ProveV6Frames} durationInFrames={PROVE6_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="ProveV5Frames" component={ProveV5Frames} durationInFrames={PROVE5_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="ProveV4Frames" component={ProveV4Frames} durationInFrames={PROVE4_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="ProveFrames" component={ProveFrames} durationInFrames={PROVE_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="LookTestBW" component={LookTestBW} durationInFrames={LOOK_TEST_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="LookTestMuted" component={LookTestMuted} durationInFrames={LOOK_TEST_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="LaughThumb" component={LaughThumb} durationInFrames={LAUGH_THUMBS} fps={30} width={1080} height={1920} />
      <Composition id="LaughFilm" component={LaughFilm} durationInFrames={LAUGH_FILM_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="LaughFrames" component={LaughFrames} durationInFrames={LAUGH_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="TomorrowV7" component={TomorrowV7} durationInFrames={TOMORROW_V7_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="TomorrowMinimal" component={TomorrowMinimal} durationInFrames={TOMORROW_MIN_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="TomorrowObjects" component={TomorrowObjects} durationInFrames={TOMORROW_OBJ_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="TomorrowStyle" component={TomorrowStyle} durationInFrames={TOMORROW_STYLE_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="BeatHook" component={BeatHook} durationInFrames={HOOK_OPTS} fps={30} width={1080} height={1920} />
      <Composition id="BeatStyle" component={BeatStyle} durationInFrames={BEAT_STYLE_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="TruthsThumb" component={TruthsThumb} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="PaydayBoard" component={PaydayBoard} durationInFrames={PAYDAY_KEYS} fps={30} width={1080} height={1920} />
      <Composition id="PaydayFilm" component={PaydayFilm} durationInFrames={PAYDAY_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="StickTest" component={StickTest} durationInFrames={STICK_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="TruckTest" component={TruckTest} durationInFrames={TRUCK_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="TwoLivesScenes" component={TwoLivesScenes} durationInFrames={TWO_LIVES_SCENES} fps={30} width={1080} height={1920} />
      <Composition id="Ep003Thumb" component={Ep003Thumb} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="Ep003" component={Ep003Short} durationInFrames={EP003_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="Ep002" component={Ep002Short} durationInFrames={EP002_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="Ep002Thumb" component={Ep002Thumb} durationInFrames={1} fps={30} width={THUMB_W} height={THUMB_H} />
      <Composition id="Ep001" component={Ep001Short} durationInFrames={EP001_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="AnalogShort" component={AnalogShort} durationInFrames={ANALOG_FRAMES} fps={30} width={1080} height={1920} />
      <Composition id="BridgeShort" component={BridgeShort} durationInFrames={BRIDGE_FRAMES} fps={30} width={1080} height={1920} />
    </>
  );
};
