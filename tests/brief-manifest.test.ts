import test from "node:test";
import assert from "node:assert/strict";
import { parseBrief } from "../src/core/brief.js";
import { approveManifest, manifestFromBrief, validateManifest } from "../src/core/manifest.js";
import { canonicalHash } from "../src/core/files.js";

const completeBrief = `---
projectId: "test-video"
audience: "Curious adults"
deliverable: "YouTube video"
designPack: "ivory-dusk-editorial"
fps: 30
quality: "high"
music: false
captions: "phrase"
voiceProvider: "elevenlabs"
voiceId: "voice-test"
providers: ["elevenlabs"]
costCeilingUsd: 2
---
# Test Video
## Summary
A deterministic fixture.
## Scene 01: Opening
Purpose: Establish the premise.
Narration: This is the opening narration.
Layout: feature-left-16x9
Duration: 6
`;

test("brief conversion is deterministic and approval is hash-bound", () => {
  const first = approveManifest(manifestFromBrief(parseBrief(completeBrief)));
  const second = approveManifest(manifestFromBrief(parseBrief(completeBrief)));
  assert.equal(canonicalHash(first), canonicalHash(second));
  assert.deepEqual(validateManifest(first), []);
  const changed = structuredClone(first);
  changed.scenes[0]!.title = "Changed after approval";
  assert.ok(validateManifest(changed).includes("approvedHash does not match manifest"));
});

test("incomplete brief stops before manifest generation", () => {
  const brief = parseBrief("# Missing everything");
  assert.ok(brief.missingDecisions.includes("scenes"));
  assert.throws(() => manifestFromBrief(brief), /missing material decisions/);
});

test("manifest validation enforces visual limits and presenter-safe layouts", () => {
  const manifest = manifestFromBrief(parseBrief(completeBrief));
  manifest.scenes[0]!.supportingVisuals = [
    { asset: "a.png" },
    { asset: "b.png" },
    { asset: "c.png" },
  ];
  manifest.scenes[0]!.layout = "quote";
  manifest.scenes[0]!.presenter = { mode: "circle-bottom-right", asset: "presenter.webm" };
  const errors = validateManifest(manifest);
  assert.ok(errors.includes("scene 01 exceeds the three-visual layout limit"));
  assert.ok(errors.includes("scene 01 layout has no presenter safe zone"));
});
