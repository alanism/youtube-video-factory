import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { copyFile, mkdir, mkdtemp, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { initializeProject } from "../src/core/project.js";
import { parseBrief } from "../src/core/brief.js";
import { approveManifest, manifestFromBrief } from "../src/core/manifest.js";
import { compileHyperFrames } from "../src/render/hyperframes.js";
import { splitContactSheet } from "../src/media/split-contact-sheet.js";
import { assemblePanelSequence } from "../src/media/assemble-panel-sequence.js";

const privateFixture = resolve(dirname(fileURLToPath(import.meta.url)), "../../enochian");

test("forward-compiles the private 15-scene Enochian fixture when available", {
  skip: !existsSync(join(privateFixture, "video-project/scene-manifest.json")),
}, async () => {
  const sourceProject = join(privateFixture, "video-project");
  const source = JSON.parse(await readFile(join(sourceProject, "scene-manifest.json"), "utf8")) as {
    scenes: Array<{ id: string; title: string; script: string; asset: string; audio: string; sceneDuration: number }>;
  };
  assert.equal(source.scenes.length, 15);
  const root = await mkdtemp(join(tmpdir(), "ytvf-enochian-"));
  const project = await initializeProject(join(root, "project"), "Enochian Acceptance");
  const blocks: string[] = [];
  for (const scene of source.scenes) {
    const imageDestination = `assets/approved/${scene.id}.jpg`;
    const audioDestination = `audio/${scene.id}.mp3`;
    await copyFile(join(sourceProject, scene.asset), join(project, imageDestination));
    await copyFile(join(sourceProject, scene.audio), join(project, audioDestination));
    blocks.push(`## Scene ${scene.id}: ${scene.title}
Purpose: ${scene.title}
Narration: ${scene.script}
Layout: feature-left-4x3
Visual: ${imageDestination}
Duration: ${scene.sceneDuration}`);
  }
  const brief = parseBrief(`---
projectId: enochian-acceptance
audience: adult learners
deliverable: YouTube video
designPack: ivory-dusk-editorial
fps: 30
music: false
captions: phrase
voiceProvider: existing
providers: []
costCeilingUsd: 0
---
# Enochian Acceptance
${blocks.join("\n")}`);
  const manifest = approveManifest(manifestFromBrief(brief));
  manifest.scenes.forEach((scene) => {
    scene.narration!.asset = `audio/${scene.id}.mp3`;
  });
  const result = await compileHyperFrames(project, manifest);
  const html = await readFile(result.compositionPath, "utf8");
  assert.equal((html.match(/class="clip scene-clip"/g) ?? []).length, 15);
  assert.equal((html.match(/<audio /g) ?? []).length, 15);
});

test("detects and deterministically splits the supplied Enochian 2x2 contact sheet", {
  skip: !existsSync(join(privateFixture, "02-Enochian-ring.jpg")),
}, async () => {
  const root = await mkdtemp(join(tmpdir(), "ytvf-panels-"));
  const project = await initializeProject(join(root, "project"), "Panel Acceptance");
  await copyFile(join(privateFixture, "02-Enochian-ring.jpg"), join(project, "assets/approved/ring.jpg"));
  const first = await splitContactSheet(project, {
    source: "assets/approved/ring.jpg",
    sheetId: "ring",
    outputDirectory: "assets/panels/ring",
  });
  const firstMap = JSON.parse(await readFile(first.panelMapPath, "utf8")) as {
    gutters: { x: { start: number; end: number }; y: { start: number; end: number } };
    panels: Array<{ hash: string }>;
  };
  assert.equal(first.panels.length, 4);
  assert.ok(firstMap.gutters.x.start >= 620 && firstMap.gutters.x.end <= 632);
  assert.ok(firstMap.gutters.y.start >= 622 && firstMap.gutters.y.end <= 634);
  const second = await splitContactSheet(project, {
    source: "assets/approved/ring.jpg",
    sheetId: "ring",
    outputDirectory: "assets/panels/ring",
  });
  const secondMap = JSON.parse(await readFile(second.panelMapPath, "utf8")) as { panels: Array<{ hash: string }> };
  assert.deepEqual(secondMap.panels.map((panel) => panel.hash), firstMap.panels.map((panel) => panel.hash));

  const clipPaths: [string, string, string] = [
    "motion/ring/clip-01.mp4",
    "motion/ring/clip-02.mp4",
    "motion/ring/clip-03.mp4",
  ];
  await mkdir(join(project, "motion/ring"), { recursive: true });
  for (const [index, destination] of clipPaths.entries()) {
    await copyFile(
      join(privateFixture, `motion/enochian-ring-sequence/clips/transition-0${index + 1}-raw.mp4`),
      join(project, destination),
    );
  }
  const sequence = await assemblePanelSequence(project, {
    clips: clipPaths,
    finalPanel: "assets/panels/ring/panel-04.png",
    outputPath: "motion/ring/sequence.mp4",
  });
  const receipt = JSON.parse(await readFile(sequence.receiptPath, "utf8")) as {
    assembly: { totalFrames: number; fps: number; durationSeconds: number; audio: boolean };
  };
  assert.deepEqual(receipt.assembly, {
    clipFrames: [120, 119, 119],
    finalHoldFrames: 2,
    totalFrames: 360,
    fps: 24,
    durationSeconds: 15,
    audio: false,
  });
});
