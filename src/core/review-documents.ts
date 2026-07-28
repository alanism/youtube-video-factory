import { join } from "node:path";
import type { ProductionManifest } from "../types.js";
import { writeTextAtomic } from "./files.js";

export function storyboardMarkdown(manifest: ProductionManifest): string {
  const scenes = manifest.scenes.map((scene, index) => [
    `## ${String(index + 1).padStart(2, "0")} — ${scene.title}`,
    "",
    `- Purpose: ${scene.purpose}`,
    `- Layout: \`${scene.layout}\``,
    `- Duration: ${scene.durationSeconds.toFixed(3)} seconds`,
    `- Primary visual: ${scene.primaryVisual?.asset ?? "None"}`,
    `- Presenter: ${scene.presenter?.mode ?? "none"}`,
    `- Transition: ${scene.transition ?? "none"}`,
    "",
    scene.overlay?.text ? `Overlay: ${scene.overlay.text}` : "",
  ].filter(Boolean).join("\n")).join("\n\n");
  return `# Storyboard — ${manifest.title}

Generated from approved semantic manifest. Do not edit as an independent source of truth.

- Manifest approval hash: \`${manifest.approval.approvedHash ?? "NOT APPROVED"}\`
- Design pack: \`${manifest.designPack}\`
- Output: ${manifest.output.width}×${manifest.output.height} at ${manifest.output.fps} fps

${scenes}
`;
}

export function scriptMarkdown(manifest: ProductionManifest): string {
  const scenes = manifest.scenes.map((scene, index) => `## ${String(index + 1).padStart(2, "0")} — ${scene.title}

${scene.narration?.text || "_No narration._"}
`).join("\n");
  return `# Script — ${manifest.title}

Generated from approved semantic manifest. Narration authority: \`${manifest.audio.narrationAuthority}\`.

${scenes}`;
}

export async function writeReviewDocuments(
  projectDirectory: string,
  manifest: ProductionManifest,
): Promise<void> {
  await Promise.all([
    writeTextAtomic(join(projectDirectory, "STORYBOARD.md"), storyboardMarkdown(manifest)),
    writeTextAtomic(join(projectDirectory, "SCRIPT.md"), scriptMarkdown(manifest)),
  ]);
}
