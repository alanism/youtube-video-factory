import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { allPalettes, layouts, typographies } from "../src/design/registry.js";

test("GitHub design docs expose every registered layout and palette", async () => {
  const designSystem = await readFile("DESIGN_SYSTEM.md", "utf8");
  for (const layout of layouts) {
    assert.match(designSystem, new RegExp(`### ${layout.id}`));
    const imagePath = join("docs/assets/layouts", `${layout.id}.png`);
    await access(imagePath);
    const metadata = await sharp(imagePath).metadata();
    assert.equal(metadata.width, 960, layout.id);
    assert.equal(metadata.height, 540, layout.id);
  }
  for (const palette of allPalettes) {
    assert.match(designSystem, new RegExp(`\\\`${palette.id}\\\``));
    for (const color of palette.colors) assert.ok(designSystem.includes(color), `${palette.id} ${color}`);
  }
});

test("README is self-sufficient for workflow and provider discovery", async () => {
  const readme = await readFile("README.md", "utf8");
  for (const required of [
    "Write A Useful Brief",
    "Attach References Safely",
    "Approve The Manifest",
    "Generate Narration And Captions",
    "Add Presenters Only When Useful",
    "Add Motion Only When It Helps",
    "Preview Before Rendering",
    "Render, Validate, And Receipt",
    "ElevenLabs",
    "HeyGen",
    "OpenRouter",
    "GCP",
    "Codex built-in Image 2",
    "HyperFrames",
    "FFmpeg",
  ]) {
    assert.ok(readme.includes(required), required);
  }
});

test("typography docs and renderer expose the full IBM Plex family", async () => {
  const designSystem = await readFile("DESIGN_SYSTEM.md", "utf8");
  const renderer = await readFile("src/render/hyperframes.ts", "utf8");
  const packageJson = await readFile("package.json", "utf8");
  for (const family of ["IBM Plex Sans", "IBM Plex Serif", "IBM Plex Mono"]) {
    assert.ok(designSystem.includes(family), family);
    assert.ok(renderer.includes(`font-family:"${family}"`), family);
  }
  for (const dependency of ["@fontsource-variable/ibm-plex-sans", "@fontsource/ibm-plex-serif", "@fontsource/ibm-plex-mono"]) {
    assert.ok(packageJson.includes(dependency), dependency);
  }
  const allowed = new Set(["IBM Plex Sans", "IBM Plex Serif", "IBM Plex Mono"]);
  for (const type of typographies) {
    assert.ok(allowed.has(type.titleFamily), `${type.id}.titleFamily`);
    assert.ok(allowed.has(type.bodyFamily), `${type.id}.bodyFamily`);
    assert.ok(allowed.has(type.captionFamily), `${type.id}.captionFamily`);
    assert.ok(allowed.has(type.monoFamily), `${type.id}.monoFamily`);
  }
});
