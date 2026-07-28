import { access, mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { escapeHtml, sanitizeIdentifier, writeJsonAtomic, writeTextAtomic } from "./files.js";

const briefTemplate = (title: string, id: string) => `---
title: "${title}"
projectId: "${id}"
audience: "Define the intended viewer"
deliverable: "YouTube video"
designPack: "ivory-dusk-editorial"
fps: 30
quality: "high"
music: false
soundEffects: false
captions: "phrase"
voiceProvider: "elevenlabs"
voiceId: ""
voiceModel: "eleven_flash_v2_5"
voiceSpeed: 0.92
voiceStability: 0.65
voiceSimilarity: 0.75
providers: ["elevenlabs"]
costCeilingUsd: 0
autonomy: "review-gated"
output: "output/${id}.mp4"
---

# ${title}

## Summary

Explain the central message, viewer outcome, tone, and exclusions.

## Scene 01: Opening

Purpose: Establish the question or promise.
Narration: Replace this with the exact narration for the opening scene.
Layout: title-circle-presenter
Duration: 7
Visual: assets/approved/opening.png

## Scene 02: Explanation

Purpose: Explain the key mechanism.
Narration: Replace this with the exact narration for the explanation.
Layout: feature-left-16x9
Duration: 10
Visual: assets/approved/explanation.mp4
`;

const projectStartPage = (title: string) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)} - Start Here</title>
  <style>
    body{margin:0;background:#24202A;color:#24202A;font-family:system-ui,-apple-system,sans-serif}
    main{width:min(920px,calc(100% - 40px));margin:42px auto;padding:54px;background:#EEE6D8;border-top:10px solid #A6793B;box-shadow:0 30px 80px #0008}
    h1{font-family:Georgia,serif;font-size:clamp(42px,7vw,78px);line-height:.96;margin:0 0 22px}
    p{font-size:20px;line-height:1.5;color:#5F5363}
    a{display:inline-block;margin:10px 12px 10px 0;padding:14px 18px;background:#24202A;color:#EEE6D8;text-decoration:none;font-weight:750}
    code{background:#D8CBB8;padding:2px 6px}
  </style>
</head>
<body>
  <main>
    <p>YouTube Video Factory project</p>
    <h1>${escapeHtml(title)}</h1>
    <p>Start by opening the production brief. Attach references and type draft prompts there, then return to Codex and ask it to build the video from this project folder.</p>
    <a href="PRODUCTION_BRIEF.html">Open briefing page</a>
    <a href="PRODUCTION_BRIEF.md">Open Markdown brief</a>
    <p>Codex command path: <code>pnpm ytvf brief &lt;this-project-folder&gt;</code></p>
  </main>
</body>
</html>
`;

export async function initializeProject(directory: string, title: string): Promise<string> {
  const target = resolve(directory);
  try {
    await access(target);
    throw new Error(`Project directory already exists: ${target}`);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Project directory already exists")) throw error;
  }
  const id = sanitizeIdentifier(title);
  const directories = [
    "references/quarantine",
    "references/style",
    "assets/approved",
    "assets/generated",
    "audio",
    "presenters",
    "motion",
    "provider-records",
    "previews",
    "validation",
    "output",
    "build/hyperframes",
    ".ytvf",
  ];
  for (const child of directories) await mkdir(join(target, child), { recursive: true });
  await writeTextAtomic(join(target, "PRODUCTION_BRIEF.md"), briefTemplate(title, id));
  await writeTextAtomic(join(target, "start_here.html"), projectStartPage(title));
  await writeJsonAtomic(join(target, "references/reference-registry.json"), {
    schemaVersion: 1,
    references: [],
  });
  await writeJsonAtomic(join(target, ".ytvf/project.json"), {
    schemaVersion: 1,
    ontologyVersion: 1,
    id,
    title,
    createdBy: "ytvf",
  });
  await writeJsonAtomic(join(target, ".ytvf/design-registry.json"), {
    schemaVersion: 1,
    designPacks: [],
    palettes: [],
    typographies: [],
    motions: [],
  });
  await writeTextAtomic(
    join(target, ".gitignore"),
    [".env", ".env.*", "references/quarantine/*", "!references/quarantine/.gitkeep", "provider-records/private/", "build/", "previews/", "validation/", "output/"].join("\n") + "\n",
  );
  await writeTextAtomic(join(target, "references/quarantine/.gitkeep"), "");
  return target;
}
