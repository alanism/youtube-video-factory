import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { ElevenLabsAdapter } from "../src/providers/elevenlabs.js";
import { readJson, writeJsonAtomic } from "../src/core/files.js";
import type { ProductionManifest } from "../src/types.js";

const project = resolve(process.argv[2] ?? "");
if (!project) throw new Error("Usage: node --import tsx scripts/generate-families-voice-variants.ts <project-directory>");

const variants = [
  { id: "yjgg", voiceId: "yjGgCw9eZqVLI4EoFn4C" },
  { id: "ight", voiceId: "IGhtc6Rlp3amG0PIQsnX" },
];
const base = await readJson<ProductionManifest>(join(project, ".ytvf/resolved-manifest.json"));
const adapter = new ElevenLabsAdapter();
const receipts: Array<{ id: string; voiceId: string; characters: number; audio: string[] }> = [];

for (const variant of variants) {
  const manifest = structuredClone(base);
  manifest.release.version = `v2-family-emote-${variant.id}`;
  manifest.providers.elevenlabs = { ...manifest.providers.elevenlabs!, voiceId: variant.voiceId };
  manifest.output.destination = `output/uncommon-core-families-emote-instagram-${variant.id}.mp4`;
  manifest.renditions = manifest.renditions.map((rendition) => ({ ...rendition, destination: manifest.output.destination }));
  const access = await adapter.verifyAccess({ voiceId: variant.voiceId, text: manifest.scenes[0]?.narration?.text ?? "Verification", outputPath: "", alignmentPath: "" });
  const audios: string[] = [];
  let characters = 0;
  for (const [index, scene] of manifest.scenes.entries()) {
    if (!scene.narration?.text) continue;
    const audioRelative = `audio/voice-${variant.id}/${scene.id}.mp3`;
    const alignmentRelative = `audio/voice-${variant.id}/${scene.id}.alignment.json`;
    const job = await adapter.submit({
      voiceId: variant.voiceId,
      text: scene.narration.text,
      outputPath: join(project, audioRelative),
      alignmentPath: join(project, alignmentRelative),
      modelId: manifest.providers.elevenlabs!.modelId,
      outputFormat: "mp3_44100_128",
      languageCode: "en",
      ...(manifest.scenes[index - 1]?.narration?.text ? { previousText: manifest.scenes[index - 1]!.narration!.text } : {}),
      ...(manifest.scenes[index + 1]?.narration?.text ? { nextText: manifest.scenes[index + 1]!.narration!.text } : {}),
      seed: 42001 + index,
      voiceSettings: { speed: 0.92, stability: 0.65, similarityBoost: 0.75, style: 0, useSpeakerBoost: true },
    }, { projectDirectory: project, manifest, approvedRequestHash: manifest.approval.approvedHash ?? "", dryRun: false });
    if (job.state !== "complete") throw new Error(`Voice ${variant.id} failed for scene ${scene.id}.`);
    const alignment = await readJson<{ captions: NonNullable<ProductionManifest["scenes"][number]["captions"]> }>(join(project, alignmentRelative));
    const finalCaption = alignment.captions.at(-1);
    if (finalCaption && finalCaption.end > scene.durationSeconds) throw new Error(`Voice ${variant.id} exceeds the locked scene ${scene.id} duration.`);
    scene.narration.asset = audioRelative;
    scene.captions = alignment.captions;
    audios.push(audioRelative);
    characters += [...scene.narration.text].length;
  }
  const destination = join(project, "versions", `voice-${variant.id}`, "production-manifest.json");
  await mkdir(join(project, "versions", `voice-${variant.id}`), { recursive: true });
  await writeJsonAtomic(destination, manifest);
  receipts.push({ id: variant.id, voiceId: variant.voiceId, characters, audio: audios });
  void access;
}

await writeFile(join(project, "provider-records", "voice-variants-receipt.json"), `${JSON.stringify({ schemaVersion: 1, variants: receipts }, null, 2)}\n`);
console.log(`Generated ${variants.length} aligned ElevenLabs voice variants.`);
