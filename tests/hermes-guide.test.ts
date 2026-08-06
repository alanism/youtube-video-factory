import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Hermes guide explains Start Here and Codex handoff rules", async () => {
  const guide = await readFile("hermes-slide-video-maker.md", "utf8");
  for (const required of [
    "Hermes Slide Video Maker Guide",
    "start_here.html",
    "PRODUCTION_BRIEF.md",
    "Use the YouTube Video Factory skill",
    "deliverable type",
    "imageSourcePolicy",
    "fourFrameContactSheetWorkflow",
    "Seedance 1.5 Pro",
    "disclaimerPolicy: \"user-authored-only\"",
    "Do not run paid-provider commands unless",
    "pnpm ytvf init",
    "pnpm ytvf plan",
  ]) {
    assert.ok(guide.includes(required), required);
  }
});

test("README links the Hermes guide", async () => {
  const readme = await readFile("README.md", "utf8");
  assert.ok(readme.includes("[hermes-slide-video-maker.md](hermes-slide-video-maker.md)"));
});
