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
narrationAuthority: existing
providers: []
costCeilingUsd: 0
renditions: [16:9, 9:16]
landscapeTemplate: feature-left-16x9
portraitTemplate: portrait-concept-explainer
rubricMinimum: 40
minimumCriterionScore: 3
maxRepairCycles: 3
blockers: [missing-template]
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
  assert.match(html, /data-composition-id="ytvf-compile-landscape-16x9"/);
  assert.equal((html.match(/class="clip scene-clip"/g) ?? []).length, 2);
  assert.match(html, /gsap\.timeline\(\{paused:true\}\)/);
  assert.match(html, /\.scene-inner\{[^}]*opacity:0/);
  assert.match(html, /font-family:"IBM Plex Sans"/);
  assert.match(html, /font-family:"IBM Plex Serif"/);
  assert.match(html, /font-family:"IBM Plex Mono"/);
  const ids = [...html.matchAll(/data-hf-id="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  const portrait = await compileHyperFrames(project, manifest, "portrait-9x16");
  const portraitHtml = await readFile(portrait.compositionPath, "utf8");
  assert.match(portraitHtml, /data-composition-id="ytvf-compile-portrait-9x16"/);
  assert.match(portraitHtml, /data-width="1080" data-height="1920"/);
  assert.match(portraitHtml, /portrait-concept-explainer/);
  assert.match(portraitHtml, /object-fit:cover/);
});

test("portrait social-ad proof and CTA cards compile as visible template elements", async () => {
  const root = await mkdtemp(join(tmpdir(), "ytvf-social-proof-"));
  const project = await initializeProject(join(root, "project"), "Social proof");
  const manifest = approveManifest(manifestFromBrief(parseBrief(`---
projectId: social-proof
audience: students
deliverable: social ad
designPack: ivory-dusk-editorial
fps: 30
music: false
captions: phrase
narrationAuthority: none
providers: []
costCeilingUsd: 0
renditions: [9:16]
portraitTemplate: portrait-concept-explainer
rubricMinimum: 85
minimumCriterionScore: 3
maxRepairCycles: 3
blockers: [missing-template]
---
# Social proof
## Scene 01: Community
Purpose: Community proof.
Narration:
Layout: feature-left-16x9
Duration: 4
## Scene 02: CTA
Purpose: CTA proof.
Narration:
Layout: quote
Duration: 4
`)));
  manifest.scenes[0]!.proofCard = { eyebrow: "COMMUNITY", title: "Build together.", body: "Meet and share.", chips: ["Meet", "Build"], illustrative: true };
  manifest.scenes[1]!.ctaCard = { brand: "UnCommon Core", primary: "Join the Server.", secondary: "Download UnCommon Core.", attribution: "Powered by Hermes Thrice Great" };
  const result = await compileHyperFrames(project, manifest, "portrait-9x16");
  const html = await readFile(result.compositionPath, "utf8");
  assert.match(html, /class="proof-card"/);
  assert.match(html, /ILLUSTRATIVE/);
  assert.match(html, /class="cta-card"/);
  assert.match(html, /Join the Server\./);
});
