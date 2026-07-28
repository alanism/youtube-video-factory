import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("root start page is a briefing worksheet with Codex export paths", async () => {
  const page = await readFile("start_here.html", "utf8");
  for (const required of [
    "Use this page to write the first production brief",
    'id="title"',
    'id="projectId"',
    'id="imagePrompts"',
    'id="videoPrompts"',
    'id="copyContext"',
    'id="scenes"',
    'id="output"',
    "Copy for Codex",
    "Download PRODUCTION_BRIEF.md",
    "Download brief.txt",
    "Browser clipboard access was blocked",
    "Use the YouTube Video Factory skill",
    "PRODUCTION_BRIEF.md",
  ]) {
    assert.ok(page.includes(required), required);
  }
});
