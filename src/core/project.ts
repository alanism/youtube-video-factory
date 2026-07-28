import { access, mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { sanitizeIdentifier, writeJsonAtomic, writeTextAtomic } from "./files.js";

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
