import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { canonicalHash, sha256File } from "./files.js";
import type { ProductionManifest } from "../types.js";

export const changeCategories = [
  "visual-design",
  "copy-captions",
  "presenter",
  "narration",
  "images",
  "motion-timing",
  "provider-settings",
  "output-format",
  "other",
] as const;

export const preserveKeys = ["images", "narration", "captions", "avatar", "motion", "timings"] as const;

export type ChangeCategory = typeof changeCategories[number];
export type PreserveKey = typeof preserveKeys[number];
export type ModelTier = "luna" | "terra" | "sol";
export type ReasoningEffort = "low" | "medium" | "high";

export interface ChangeRequest {
  schemaVersion: 1;
  id: string;
  projectId: string;
  base: {
    manifestPath: string;
    manifestHash: string;
    outputPath?: string;
    outputHash?: string;
  };
  changes: Array<{ category: ChangeCategory; instruction: string; sceneIds?: string[] }>;
  preserve: Record<PreserveKey, boolean>;
  references: string[];
  providerRegeneration: "forbidden" | "approved";
  output: { versionLabel: string; destination: string };
  acceptanceCriteria: string[];
  modelRecommendation: { tier: ModelTier; reasoning: ReasoningEffort; rationale: string };
}

export interface ChangeContext {
  projectId: string;
  title: string;
  manifestPath: string;
  manifestHash: string;
  outputPath?: string;
  outputHash?: string;
  scenes: Array<{ id: string; title: string }>;
  providers: string[];
}

export function recommendModel(changes: ChangeCategory[], providerRegeneration: "forbidden" | "approved"): ChangeRequest["modelRecommendation"] {
  const complex = changes.some((item) => ["presenter", "motion-timing", "provider-settings"].includes(item));
  const routine = changes.every((item) => ["visual-design", "copy-captions", "other"].includes(item));
  if (routine && providerRegeneration === "forbidden") {
    return { tier: "luna", reasoning: "low", rationale: "Deterministic layout, copy, or caption revision with cached media reuse." };
  }
  if (complex || providerRegeneration === "approved") {
    return { tier: "terra", reasoning: "medium", rationale: "Cross-media revision or provider-aware change that needs scoped validation." };
  }
  return { tier: "terra", reasoning: "medium", rationale: "Default for a bounded production revision." };
}

export function validateChangeRequest(request: ChangeRequest): string[] {
  const errors: string[] = [];
  if (request.schemaVersion !== 1) errors.push("schemaVersion must be 1.");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(request.id)) errors.push("id must be a lowercase slug.");
  if (!request.projectId) errors.push("projectId is required.");
  if (!request.base.manifestPath || !/^[a-f0-9]{64}$/.test(request.base.manifestHash)) errors.push("A hashed base manifest is required.");
  if (!request.changes.length || request.changes.some((item) => !item.instruction.trim())) errors.push("At least one described change is required.");
  if (request.changes.some((item) => !changeCategories.includes(item.category))) errors.push("Unknown change category.");
  if (request.changes.some((item) => item.category === "narration") && request.preserve.narration) errors.push("Narration cannot be both changed and preserved exactly.");
  if (request.changes.some((item) => item.category === "copy-captions") && request.preserve.captions) errors.push("Captions cannot be both changed and preserved exactly.");
  if (request.changes.some((item) => item.category === "images") && request.preserve.images) errors.push("Images cannot be both changed and preserved exactly.");
  if (request.changes.some((item) => item.category === "presenter") && request.preserve.avatar) errors.push("Presenter cannot be both changed and preserved exactly.");
  if (request.changes.some((item) => item.category === "motion-timing") && (request.preserve.motion || request.preserve.timings)) errors.push("Motion/timing cannot be both changed and preserved exactly.");
  if (!request.output.versionLabel || !request.output.destination) errors.push("An output version label and destination are required.");
  if (!request.acceptanceCriteria.length) errors.push("At least one acceptance criterion is required.");
  return errors;
}

export function changeBrief(request: ChangeRequest): string {
  const changed = request.changes.map((item) => `- **${item.category}:** ${item.instruction}${item.sceneIds?.length ? ` (scenes: ${item.sceneIds.join(", ")})` : ""}`).join("\n");
  const preserved = preserveKeys.filter((key) => request.preserve[key]).map((key) => `- ${key}`).join("\n") || "- None";
  return `---\nid: "${request.id}"\nprojectId: "${request.projectId}"\nbaseManifest: "${request.base.manifestPath}"\nbaseManifestHash: "${request.base.manifestHash}"\nproviderRegeneration: "${request.providerRegeneration}"\nrecommendedModel: "${request.modelRecommendation.tier}"\nreasoning: "${request.modelRecommendation.reasoning}"\noutput: "${request.output.destination}"\n---\n\n# Change Brief — ${request.output.versionLabel}\n\n## Requested Changes\n\n${changed}\n\n## Must Remain Unchanged\n\n${preserved}\n\n## Annotated References\n\n${request.references.map((reference) => `- ${reference}`).join("\n") || "- None"}\n\n## Acceptance Criteria\n\n${request.acceptanceCriteria.map((item) => `- ${item}`).join("\n")}\n\n## Build Guidance\n\nReuse matching cached artifacts. Rebuild only the affected dependency branch. Preserve the original narration master whenever narration is marked unchanged. ${request.modelRecommendation.rationale}\n`;
}

export async function readChangeContext(projectDirectoryInput: string): Promise<ChangeContext> {
  const projectDirectory = resolve(projectDirectoryInput);
  const manifestPath = join(projectDirectory, "production-manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as ProductionManifest;
  const output = resolve(projectDirectory, manifest.output.destination);
  return {
    projectId: manifest.id,
    title: manifest.title,
    manifestPath: relative(projectDirectory, manifestPath),
    manifestHash: canonicalHash(manifest),
    ...(existsSync(output) ? { outputPath: manifest.output.destination, outputHash: await sha256File(output) } : {}),
    scenes: manifest.scenes.map((scene) => ({ id: scene.id, title: scene.title })),
    providers: manifest.providers.allowed,
  };
}
