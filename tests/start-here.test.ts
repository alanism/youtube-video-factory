import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { allPalettes, typographies } from "../src/design/registry.js";

test("root start page is a briefing worksheet with Codex export paths", async () => {
  const page = await readFile("start_here.html", "utf8");
  for (const required of [
    "Use this page to write the first production brief",
    "Minimal Workspace briefing page",
    'id="title"',
    'id="projectId"',
    'id="deliverableType"',
    'id="outputCount"',
    'id="aspectRatio"',
    'id="imageSourcePolicy"',
    'id="frameCount"',
    'id="curriculumStandards"',
    'id="creativeLenses"',
    'id="qualityGates"',
    "Recommended reusable image path",
    "2×2 contact sheet",
    "Seedance 1.5 Pro first/last-frame transitions",
    "Disclaimer policy",
    "must not add disclaimers",
    'id="paletteGrid"',
    'id="typeGrid"',
    "font-specimen",
    "type-headline",
    "type-body",
    "type-caption",
    "type-mono",
    "A clean briefing page for turning ideas into narrated video.",
    'id="imagePrompts"',
    'id="videoPrompts"',
    'id="copyContext"',
    'id="narrationAuthority"',
    'id="motionResolution"',
    'id="motionAudio"',
    'id="heygenMode"',
    'id="heygenVoiceId"',
    'id="landscapeTemplate"',
    'id="portraitTemplate"',
    'id="scenes"',
    'id="output"',
    "Copy for Codex",
    "Download PRODUCTION_BRIEF.md",
    "Download brief.txt",
    "Browser clipboard access was blocked",
    "Use the YouTube Video Factory skill",
    "PRODUCTION_BRIEF.md",
    "docs/start-here/design.md",
    "BRIEF READINESS",
    "ytvf-start-here-draft",
    "Guided workspace overlay",
  ]) {
    assert.ok(page.includes(required), required);
  }
});

test("make changes landing page explains the project-aware revision handoff", async () => {
  const page = await readFile("make_changes.html", "utf8");
  for (const required of ["Change only what needs changing.", "ytvf changes", "CHANGE_BRIEF.md", "change-request.json", "Preserve & reuse"]) assert.ok(page.includes(required), required);
});

test("root start page supports deliverable-agnostic briefs", async () => {
  const page = await readFile("start_here.html", "utf8");
  for (const required of [
    "youtube-video",
    "image-deck",
    "slide-deck",
    "image-set",
    "motion-sequence",
    "interactive",
    "deliverableType:",
    "imageSourcePolicy:",
    "outputPattern:",
    "frameCount:",
    "education:",
    "standards: |-",
    "creativeLenses: |-",
    "qualityGates: |-",
    "disclaimerPolicy:",
    "user-authored-only",
    "fourFrameContactSheetWorkflow:",
    "Four-Frame Contact Sheet Workflow",
    "frames/frame-{##}-{slug}.png",
    "voiceProvider: \"${voiceProvider}\"",
    "interactivePlanningOnly:",
  ]) {
    assert.ok(page.includes(required), required);
  }
});

test("root start page exposes every registered palette and typography option", async () => {
  const page = await readFile("start_here.html", "utf8");
  for (const palette of allPalettes) {
    assert.ok(page.includes(`id:"${palette.id}"`), palette.id);
    assert.ok(page.includes(`label:"${palette.label}"`), palette.label);
    for (const color of palette.colors) assert.ok(page.includes(color), `${palette.id} ${color}`);
  }
  for (const typography of typographies) {
    assert.ok(page.includes(`id:"${typography.id}"`), typography.id);
    assert.ok(page.includes(`label:"${typography.label}"`), typography.label);
    assert.ok(page.includes(typography.description), typography.description);
  }
});

test("start here design spec records the Minimal Workspace system", async () => {
  const design = await readFile("docs/start-here/design.md", "utf8");
  for (const required of [
    "name: Minimal Workspace",
    "bg-primary: \"#ffffff\"",
    "font-family: \"'IBM Plex', sans-serif\"",
    "Sidebar Stack",
    "Main Layer",
    "Floating toolbars",
    "300ms cubic-bezier(0.4, 0, 0.2, 1)",
  ]) {
    assert.ok(design.includes(required), required);
  }
});
