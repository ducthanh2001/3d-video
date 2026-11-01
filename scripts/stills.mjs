// usage: node scripts/stills.mjs <composition> <outPrefix> <frame,frame,...> [scale=0.5]
// Bundles once, renders each frame as a jpeg through ANGLE. Bundles go to C:\remotion-tmp (about 1.3 GB each with a big public/).
import fs from "node:fs";
const TMP = process.env.REMOTION_TMP || "C:/remotion-tmp";
fs.mkdirSync(TMP, { recursive: true });
process.env.TEMP = process.env.TMP = TMP;
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [id, prefix, frames, scale = "0.5"] = process.argv.slice(2);
const chromiumOptions = { gl: "angle" };
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
const composition = await selectComposition({ serveUrl, id, chromiumOptions });
const onBrowserLog = (l) => { if ((l.type === "error" || l.type === "warning") && !/404|Failed to load resource/.test(l.text)) console.log(`[${l.type}]`, l.text.slice(0, 300)); };
fs.mkdirSync(path.dirname(prefix), { recursive: true });
for (const f of frames.split(",").map(Number)) {
  const t0 = Date.now();
  await renderStill({ composition, serveUrl, frame: f, output: `${prefix}${f}.jpg`, imageFormat: "jpeg", jpegQuality: 88, scale: Number(scale), chromiumOptions, timeoutInMilliseconds: 180000, onBrowserLog });
  console.log("still", f, ((Date.now() - t0) / 1000).toFixed(1) + "s");
}
