import test from "node:test";
import assert from "node:assert/strict";
import { parseBrief } from "../src/core/brief.js";
import { approveManifest, manifestFromBrief, validateManifest } from "../src/core/manifest.js";
import { canonicalHash } from "../src/core/files.js";
import { buildPlanMarkdown, incompleteBuildPlanMarkdown } from "../src/core/build-plan.js";

const completeBrief = `---
projectId: "test-video"
audience: "Curious adults"
deliverable: "YouTube video"
designPack: "ivory-dusk-editorial"
fps: 30
quality: "high"
music: false
captions: "phrase"
narrationAuthority: "elevenlabs"
voiceId: "voice-test"
providers: ["elevenlabs"]
costCeilingUsd: 2
renditions: ["16:9", "9:16"]
landscapeTemplate: "feature-left-16x9"
portraitTemplate: "portrait-concept-explainer"
rubricMinimum: 40
minimumCriterionScore: 3
maxRepairCycles: 3
blockers: [missing-template]
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
  const plan = incompleteBuildPlanMarkdown(brief);
  assert.match(plan, /Decision Gate — Blocked/);
});

test("the build plan gives the user a key message, exact contract, and compilation diagram", () => {
  const manifest = manifestFromBrief(parseBrief(completeBrief));
  const plan = buildPlanMarkdown(manifest);
  assert.match(plan, /## Key Message/);
  assert.match(plan, /## Learner Outcome/);
  assert.match(plan, /\`\`\`mermaid/);
  assert.match(plan, /Official UCC landscape template/);
  assert.match(plan, /Official UCC portrait template/);
});

test("an explicitly portrait-only release preserves its portrait template and palette override", () => {
  const portraitBrief = completeBrief
    .replace('renditions: ["16:9", "9:16"]\nlandscapeTemplate: "feature-left-16x9"\n', 'renditions: ["9:16"]\n')
    .replace('designPack: "ivory-dusk-editorial"', 'designPack: "ivory-dusk-editorial"\npalette: "sport-bloom"');
  const manifest = manifestFromBrief(parseBrief(portraitBrief));
  assert.equal(manifest.renditions.length, 1);
  assert.equal(manifest.renditions[0]?.id, "portrait-9x16");
  assert.equal(manifest.output.width, 1080);
  assert.equal(manifest.design.palette.id, "sport-bloom");
  assert.deepEqual(validateManifest(manifest), []);
});

test("Seedance and HeyGen decisions are blocking when their providers are authorized", () => {
  const brief = parseBrief(completeBrief.replace('providers: ["elevenlabs"]', 'providers: ["elevenlabs", "openrouter", "heygen"]'));
  for (const missing of ["motionModel", "motionResolution", "motionAudio", "motionContract", "heygenMode", "avatarId", "avatarEngine", "heygenAlphaRequired"]) {
    assert.ok(brief.missingDecisions.includes(missing), missing);
  }
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

test("portrait proof and CTA cards remain explicit manifest data", () => {
  const manifest = manifestFromBrief(parseBrief(completeBrief));
  manifest.scenes[0]!.proofCard = {
    eyebrow: "A COMMUNITY YOU CAN JOIN",
    title: "Your people are already building.",
    body: "Meet, build, and share.",
    chips: ["Meet", "Build", "Share"],
  };
  manifest.scenes[0]!.ctaCard = {
    brand: "UnCommon Core",
    primary: "Join the Server.",
    secondary: "Download UnCommon Core.",
    attribution: "Powered by Hermes Thrice Great",
  };
  assert.deepEqual(validateManifest(manifest), []);
});
