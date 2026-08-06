import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { ElevenLabsAdapter } from "../src/providers/elevenlabs.js";
import { readJson } from "../src/core/files.js";
import type { ProductionManifest } from "../src/types.js";

const project = resolve(process.argv[2] ?? "");
if (!project) throw new Error("Usage: node --import tsx scripts/regenerate-families-female-voice-versions.ts <project-directory>");
const variants = [{ id: "molly", voiceId: "yjGgCw9eZqVLI4EoFn4C" }, { id: "taylin", voiceId: "IGhtc6Rlp3amG0PIQsnX" }];
const manifest = await readJson<ProductionManifest>(join(project, ".ytvf/resolved-manifest.json"));
const adapter = new ElevenLabsAdapter();
const receipt: Array<{ id: string; voiceId: string; files: string[] }> = [];

for (const variant of variants) {
  await adapter.verifyAccess({ voiceId: variant.voiceId, text: manifest.scenes[0]?.narration?.text ?? "Verification", outputPath: "", alignmentPath: "" });
  const files: string[] = [];
  for (const [index, scene] of manifest.scenes.entries()) {
    if (!scene.narration?.text) continue;
    const audio = `audio/female-${variant.id}/${scene.id}.mp3`;
    const alignment = `audio/female-${variant.id}/${scene.id}.alignment.json`;
    const job = await adapter.submit({ voiceId: variant.voiceId, text: scene.narration.text, outputPath: join(project, audio), alignmentPath: join(project, alignment), modelId: "eleven_flash_v2_5", outputFormat: "mp3_44100_128", languageCode: "en", seed: 43001 + index, voiceSettings: { speed: 0.92, stability: 0.65, similarityBoost: 0.75, style: 0, useSpeakerBoost: true } }, { projectDirectory: project, manifest, approvedRequestHash: manifest.approval.approvedHash ?? "", dryRun: false });
    if (job.state !== "complete") throw new Error(`Generation failed for ${variant.id} scene ${scene.id}.`);
    files.push(audio);
  }
  receipt.push({ id: variant.id, voiceId: variant.voiceId, files });
}
await mkdir(join(project, "provider-records"), { recursive: true });
await writeFile(join(project, "provider-records", "female-voice-regeneration-receipt.json"), `${JSON.stringify({ schemaVersion: 1, variants: receipt }, null, 2)}\n`);
console.log("Regenerated two exact-ID female voice sets.");
