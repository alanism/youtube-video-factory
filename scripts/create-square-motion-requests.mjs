#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";

const project = resolve(process.argv[2] ?? "");
const baseUrl = process.argv[3];
if (!project || !baseUrl?.startsWith("https://") || !baseUrl.includes(".netlify.app")) {
  throw new Error("Usage: node scripts/create-square-motion-requests.mjs <project-directory> <netlify-draft-url>");
}

const pairs = ["ba-02", "ba-03", "ny-01", "ny-02", "ny-03", "tx-01", "tx-02", "tx-03"];
const prompt = "Animate the same illustrated teenage characters from the exact supplied square start frame to the exact supplied square end frame with a smooth, confident synchronized social-media emote dance: rhythmic weight shift, shoulder groove, coordinated hand gestures, one clean pose accent, then settle into the end pose. Preserve identities, faces, hair, clothing, accessories, illustration linework, full bodies, and the complete square composition. Locked camera; no zoom, no crop, no text, no logos, no new people, no morphing, no extra limbs, no distorted hands, no scene changes, and no generated audio. Output a true 1:1 square video.";
const requests = join(project, "requests");
await mkdir(requests, { recursive: true });

for (const [index, pair] of pairs.entries()) {
  const request = {
    firstFrame: `assets/square-frames/${pair}-start-square.png`,
    lastFrame: `assets/square-frames/${pair}-end-square.png`,
    firstFrameUrl: `${baseUrl}/${pair}-start-square.png`,
    lastFrameUrl: `${baseUrl}/${pair}-end-square.png`,
    outputPath: `assets/motion-square/${pair}-emote-4s-480p-silent-square.mp4`,
    duration: 4,
    resolution: "480p",
    aspectRatio: "1:1",
    seed: 51008 + index,
    prompt,
  };
  await writeFile(join(requests, `motion-square-${pair}.json`), `${JSON.stringify(request, null, 2)}\n`);
}
console.log(`Created ${pairs.length} validated square-motion requests.`);
