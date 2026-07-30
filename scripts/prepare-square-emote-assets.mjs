#!/usr/bin/env node
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { resolve, join } from "node:path";
import { createHash } from "node:crypto";

const project = resolve(process.argv[2] ?? "");
if (!project) throw new Error("Usage: node scripts/prepare-square-emote-assets.mjs <project-directory>");
const source = join(project, "assets/source");
const destination = join(project, "assets/square-frames");
const files = (await readdir(source)).filter((file) => /^emote-(ny|tx|ba)-0[1-3]\.jpg$/.test(file)).sort();
if (files.length !== 9) throw new Error(`Expected nine emote contact sheets; found ${files.length}.`);
await mkdir(destination, { recursive: true });

const records = [];
for (const file of files) {
  const stem = file.replace(/^emote-/, "").replace(/\.jpg$/, "");
  for (const [side, x] of [["start", 0], ["end", 836]]) {
    const output = join(destination, `${stem}-${side}-square.png`);
    const crop = spawnSync("ffmpeg", [
      "-v", "error", "-y", "-i", join(source, file),
      "-vf", `crop=836:836:${x}:52`, "-frames:v", "1", output,
    ], { encoding: "utf8" });
    if (crop.status !== 0) throw new Error(crop.stderr.trim() || `Unable to crop ${file}.`);
    const probe = spawnSync("ffprobe", ["-v", "error", "-show_entries", "stream=width,height", "-of", "json", output], { encoding: "utf8" });
    if (probe.status !== 0) throw new Error(`Unable to verify ${output}.`);
    const stream = JSON.parse(probe.stdout).streams?.[0] ?? {};
    if (stream.width !== 836 || stream.height !== 836) throw new Error(`${output} is not 836×836.`);
    records.push({ source: `assets/source/${file}`, output: `assets/square-frames/${stem}-${side}-square.png`, crop: { x, y: 52, width: 836, height: 836 } });
  }
}
const canonical = JSON.stringify(records);
const hash = createHash("sha256").update(canonical).digest("hex");
await writeFile(join(destination, "crop-receipt.json"), `${JSON.stringify({ schemaVersion: 1, aspectRatio: "1:1", sourceDimensions: "1672x941", panels: records, hash }, null, 2)}\n`);
console.log(`Prepared ${records.length} validated square panels. Receipt: assets/square-frames/crop-receipt.json`);
