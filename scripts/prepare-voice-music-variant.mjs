#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";

const project = resolve(process.argv[2] ?? "");
const variant = process.argv[3];
if (!project || !["a", "b"].includes(variant)) throw new Error("Usage: node scripts/prepare-voice-music-variant.mjs <project-directory> <a|b>");

const source = join(project, `versions/${variant}-reference-fidelity/production-manifest.json`);
const manifest = JSON.parse(await readFile(source, "utf8"));
const suffix = variant === "a" ? "a-fomo" : "b-homework-reimagined";
manifest.release.version = `v4-reference-fidelity-${variant}-voice-music`;
manifest.providers.elevenlabs = { ...manifest.providers.elevenlabs, voiceId: "yjGgCw9eZqVLI4EoFn4C" };
manifest.audio = { ...manifest.audio, music: true };
manifest.output.destination = `output/uncommon-core-join-the-server-${suffix}-voice-music.mp4`;
manifest.renditions = manifest.renditions.map((rendition) => ({ ...rendition, destination: manifest.output.destination }));
manifest.approval = { status: "pending" };
await writeFile(join(project, "production-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Activated ${variant.toUpperCase()} voice-and-music manifest.`);
