#!/usr/bin/env node
import { copyFile, readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";

const project = resolve(process.argv[2] ?? "");
const variant = process.argv[3];
if (!project || !["a", "b"].includes(variant)) throw new Error("Usage: node scripts/activate-reference-audio.mjs <project-directory> <a|b>");
const source = variant === "a" ? join(project, "versions/a-85") : join(project, "versions/b-85");
const resolvedPath = join(project, ".ytvf/resolved-manifest.json");
const resolved = JSON.parse(await readFile(resolvedPath, "utf8"));
for (const scene of resolved.scenes) {
  const id = scene.id;
  const audio = `audio/${id}.mp3`;
  const alignment = `audio/${id}.alignment.json`;
  await copyFile(join(source, `${id}.mp3`), join(project, audio));
  await copyFile(join(source, `${id}.alignment.json`), join(project, alignment));
  const alignmentData = JSON.parse(await readFile(join(project, alignment), "utf8"));
  scene.narration = { ...scene.narration, asset: audio };
  scene.captions = alignmentData.captions;
}
await writeFile(resolvedPath, `${JSON.stringify(resolved, null, 2)}\n`);
console.log(`Activated verified ${variant.toUpperCase()} narration and alignment assets.`);
