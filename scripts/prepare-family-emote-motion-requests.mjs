#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";

const project = resolve(process.argv[2] ?? "");
const baseUrl = process.argv[3];
if (!project || !baseUrl?.startsWith("https://") || !baseUrl.includes(".netlify.app")) {
  throw new Error("Usage: node scripts/prepare-family-emote-motion-requests.mjs <project-directory> <netlify-draft-url>");
}

const transitions = [
  ["asian", "02", "03", 64102], ["asian", "03", "04", 64103],
  ["latin", "01", "02", 64201], ["latin", "02", "03", 64202], ["latin", "03", "04", 64203],
  ["white", "01", "02", 64301], ["white", "02", "03", 64302], ["white", "03", "04", 64303],
];
const prompt = "Use the supplied square start panel and supplied square end panel as exact first and last frames. Animate the same illustrated family performing a joyful, cool, synchronized emote dance: small rhythmic steps, coordinated shoulder groove, playful hand gestures, a clean pose accent, then a confident settle into the exact end-panel pose. Preserve every family member's identity, face, hair, clothing, denim texture, accessories, proportions, and illustration linework. Keep the camera locked in a square full-family composition with all bodies visible and no cropping. No new people, no text, no logos, no scene change, no camera zoom, no wardrobe changes, no morphing, no extra limbs, no distorted hands, and no face changes. Duration 4 seconds. Output true 1:1 at 480p. Silent; no generated audio.";
const requests = join(project, "requests");
await mkdir(requests, { recursive: true });
for (const [family, from, to, seed] of transitions) {
  const request = {
    firstFrame: `assets/frames/${family}-family/panel-${from}.png`,
    lastFrame: `assets/frames/${family}-family/panel-${to}.png`,
    firstFrameUrl: `${baseUrl}/${family}-family-panel-${from}.png`,
    lastFrameUrl: `${baseUrl}/${family}-family-panel-${to}.png`,
    outputPath: `assets/motion/${family}-family-emote-${from}-${to}.mp4`,
    duration: 4,
    resolution: "480p",
    aspectRatio: "1:1",
    panelTransition: from === "01" ? "1-2" : from === "02" ? "2-3" : "3-4",
    seed,
    prompt,
  };
  await writeFile(join(requests, `motion-${family}-${from}-${to}.json`), `${JSON.stringify(request, null, 2)}\n`);
}
console.log(`Prepared ${transitions.length} motion requests.`);
