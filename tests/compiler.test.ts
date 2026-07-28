import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { initializeProject } from "../src/core/project.js";
import { approveManifest, manifestFromBrief } from "../src/core/manifest.js";
import { parseBrief } from "../src/core/brief.js";
import { compileHyperFrames } from "../src/render/hyperframes.js";
import { sha256File } from "../src/core/files.js";

const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64");

test("compiles one deterministic top-level HyperFrames composition", async () => {
  const root = await mkdtemp(join(tmpdir(), "ytvf-compile-"));
  const project = await initializeProject(join(root, "project"), "Compile");
  await writeFile(join(project, "assets/approved/one.png"), png);
  const manifest = approveManifest(manifestFromBrief(parseBrief(`---
projectId: compile
audience: viewers
deliverable: YouTube
designPack: ivory-dusk-editorial
fps: 30
music: false
captions: phrase
voiceProvider: existing
providers: []
costCeilingUsd: 0
---
# Compile
## Scene 01: One
Purpose: Explain one idea.
Narration: A sentence.
Layout: feature-left-16x9
Visual: assets/approved/one.png
Duration: 5
## Scene 02: Two
Purpose: Explain the next idea.
Narration: Another sentence.
Layout: quote
Duration: 5
`)));
  const first = await compileHyperFrames(project, manifest);
  const firstHash = await sha256File(first.compositionPath);
  const second = await compileHyperFrames(project, manifest);
  assert.equal(await sha256File(second.compositionPath), firstHash);
  const html = await readFile(first.compositionPath, "utf8");
  assert.match(html, /data-composition-id="ytvf-compile"/);
  assert.equal((html.match(/class="clip scene-clip"/g) ?? []).length, 2);
  assert.match(html, /gsap\.timeline\(\{paused:true\}\)/);
  assert.match(html, /\.scene-inner\{[^}]*opacity:0/);
  assert.match(html, /font-family:"IBM Plex Sans"/);
  assert.match(html, /font-family:"IBM Plex Serif"/);
  assert.match(html, /font-family:"IBM Plex Mono"/);
  const ids = [...html.matchAll(/data-hf-id="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length);
});
