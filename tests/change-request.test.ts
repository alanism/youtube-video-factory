import test from "node:test";
import assert from "node:assert/strict";
import { changeBrief, recommendModel, validateChangeRequest, type ChangeRequest } from "../src/core/change-request.js";

const base: ChangeRequest = {
  schemaVersion: 1,
  id: "tomoe-nage-v4",
  projectId: "tomoe-nage",
  base: { manifestPath: "production-manifest.json", manifestHash: "a".repeat(64) },
  changes: [{ category: "visual-design", instruction: "Use Sport Bloom palette." }],
  preserve: { images: true, narration: true, captions: true, avatar: true, motion: true, timings: true },
  references: [],
  providerRegeneration: "forbidden",
  output: { versionLabel: "v4", destination: "output/tomoe-v4.mp4" },
  acceptanceCriteria: ["The palette matches the approved direction."],
  modelRecommendation: recommendModel(["visual-design"], "forbidden"),
};

test("palette-only revisions are routed to Luna with low reasoning", () => {
  assert.deepEqual(base.modelRecommendation, { tier: "luna", reasoning: "low", rationale: "Deterministic layout, copy, or caption revision with cached media reuse." });
  assert.deepEqual(validateChangeRequest(base), []);
  assert.match(changeBrief(base), /# Change Brief — v4/);
  assert.match(changeBrief(base), /Must Remain Unchanged/);
});

test("a change cannot also preserve its matching asset branch exactly", () => {
  const conflict = { ...base, changes: [{ category: "narration" as const, instruction: "Change narration." }] };
  assert.match(validateChangeRequest(conflict).join(" "), /Narration cannot be both changed/);
});
