#!/usr/bin/env node
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseBrief, readBrief } from "./core/brief.js";
import { serveBriefEditor, writePortableBrief } from "./core/brief-html.js";
import { approveReference } from "./core/quarantine.js";
import { approveManifest, manifestFromBrief, validateManifest, type CustomDesignRegistry } from "./core/manifest.js";
import { initializeProject } from "./core/project.js";
import { writeReviewDocuments } from "./core/review-documents.js";
import { assertContained, canonicalHash, readJson, sha256File, writeJsonAtomic, writeTextAtomic } from "./core/files.js";
import { compileHyperFrames } from "./render/hyperframes.js";
import { allPalettes, designPacks, layouts, typographies } from "./design/registry.js";
import type { ProductionManifest } from "./types.js";
import { ElevenLabsAdapter } from "./providers/elevenlabs.js";
import { createCodexImageTask, completeCodexImageTask } from "./providers/codex-image.js";
import { HeyGenCliAdapter, type HeyGenAvatarRequest } from "./providers/heygen.js";
import { OpenRouterVideoAdapter, type OpenRouterVideoRequest } from "./providers/openrouter.js";
import { GcpFrameStager, type StagedFrame } from "./providers/gcp-staging.js";
import { assertPaidExecutionAllowed } from "./providers/ledger.js";
import type { ProviderJob } from "./types.js";
import { splitContactSheet } from "./media/split-contact-sheet.js";
import { assemblePanelSequence, type PanelSequenceRequest } from "./media/assemble-panel-sequence.js";

const factoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const hyperframesExecutable = join(factoryRoot, "node_modules/.bin/hyperframes");

function help(): string {
  return `YouTube Video Factory (ytvf)

Turn a decision-complete Markdown brief into an approved, narrated HyperFrames video.

Core workflow
  ytvf init <project-dir> --title "My Video"
  ytvf brief <project-dir> [--port 4178]
  ytvf plan <project-dir>
  ytvf manifest <project-dir> [--approve]
  ytvf storyboard <project-dir>
  ytvf image plan <project-dir>
  ytvf panels split <project-dir> --source <path> --id <sheet-id>
  ytvf sequence assemble <project-dir> --request sequence-request.json
  ytvf reference list <project-dir>
  ytvf reference approve <project-dir> <reference-id> --model
  ytvf reference approve <project-dir> <reference-id> --provider openrouter
  ytvf narrate <project-dir> --approve-paid
  ytvf presenter <project-dir> --request presenter-request.json --approve-paid
  ytvf motion <project-dir> --request motion-request.json --approve-paid
  ytvf preview <project-dir>
  ytvf approve-preview <project-dir>
  ytvf build <project-dir>
  ytvf validate <project-dir>
  ytvf receipt <project-dir>

Operations
  ytvf doctor
  ytvf resume <project-dir>
  ytvf design list
  ytvf design preview <project-dir>
  ytvf design add <project-dir> <design-pack.json>

Credentials are read only from the process environment. Never put keys in a brief:
  ELEVENLABS_API_KEY, HEYGEN_API_KEY, OPENROUTER_API_KEY
`;
}

function flag(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function projectArgument(position = 3): string {
  const value = process.argv[position];
  if (!value || value.startsWith("-")) throw new Error("A project directory is required.");
  return resolve(value);
}

async function loadApprovedManifest(projectDirectory: string): Promise<ProductionManifest> {
  const manifest = await readJson<ProductionManifest>(join(projectDirectory, "production-manifest.json"));
  const errors = validateManifest(manifest, projectDirectory);
  if (errors.length) throw new Error(`Manifest validation failed:\n- ${errors.join("\n- ")}`);
  if (manifest.approval.status !== "approved") throw new Error("Manifest is not approved.");
  return manifest;
}

async function loadExecutionManifest(projectDirectory: string): Promise<ProductionManifest> {
  const approved = await loadApprovedManifest(projectDirectory);
  const resolvedPath = join(projectDirectory, ".ytvf/resolved-manifest.json");
  if (!existsSync(resolvedPath)) return approved;
  const resolved = await readJson<ProductionManifest>(resolvedPath);
  if (resolved.approval.approvedHash !== approved.approval.approvedHash) {
    throw new Error("Resolved assets were produced for a different manifest approval hash.");
  }
  const executionErrors = validateManifest({ ...resolved, approval: { status: "draft" } }, projectDirectory);
  if (executionErrors.length) throw new Error(`Resolved manifest validation failed:\n- ${executionErrors.join("\n- ")}`);
  return resolved;
}

function runHyperFrames(arguments_: string[], cwd: string): Promise<void> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(hyperframesExecutable, arguments_, { cwd, stdio: "inherit", env: process.env });
    child.once("error", reject);
    child.once("exit", (code) => code === 0 ? resolvePromise() : reject(new Error(`HyperFrames exited with code ${code}.`)));
  });
}

async function commandInit(): Promise<void> {
  const directory = projectArgument();
  const title = flag("--title") ?? "Untitled YouTube Video";
  const target = await initializeProject(directory, title);
  await writePortableBrief(target);
  console.log(`Created ${target}\nOpen PRODUCTION_BRIEF.html or run: ytvf brief "${target}"`);
}

async function commandBrief(): Promise<void> {
  const projectDirectory = projectArgument();
  const port = Number(flag("--port") ?? 4178);
  const editor = await serveBriefEditor(projectDirectory, port);
  console.log(`Brief editor: ${editor.url}\nPress Ctrl-C to stop.`);
  if (process.platform === "darwin" && !hasFlag("--no-open")) {
    spawn("open", [editor.url], { detached: true, stdio: "ignore" }).unref();
  }
  await new Promise<void>((resolvePromise) => {
    const finish = async () => {
      await editor.close();
      resolvePromise();
    };
    process.once("SIGINT", finish);
    process.once("SIGTERM", finish);
  });
}

async function commandPlan(): Promise<void> {
  const projectDirectory = projectArgument();
  const brief = await readBrief(join(projectDirectory, "PRODUCTION_BRIEF.md"));
  const cached = existsSync(join(projectDirectory, "production-manifest.json"));
  console.log(JSON.stringify({
    mutationFree: true,
    project: projectDirectory,
    briefHash: brief.hash,
    missingDecisions: brief.missingDecisions,
    scenes: brief.scenes.length,
    existingManifest: cached,
    providerCalls: brief.frontmatter.providers ?? [],
    costCeilingUsd: brief.frontmatter.costCeilingUsd ?? 0,
    next: brief.missingDecisions.length ? "Complete the brief." : "Generate and approve the manifest.",
  }, null, 2));
}

async function commandManifest(): Promise<void> {
  const projectDirectory = projectArgument();
  const brief = await readBrief(join(projectDirectory, "PRODUCTION_BRIEF.md"));
  const registryPath = join(projectDirectory, ".ytvf/design-registry.json");
  const registry = existsSync(registryPath)
    ? await readJson<CustomDesignRegistry & { schemaVersion: number }>(registryPath)
    : { schemaVersion: 1, designPacks: [], palettes: [], typographies: [], motions: [] };
  let manifest = manifestFromBrief(brief, registry);
  if (hasFlag("--approve")) manifest = approveManifest(manifest);
  await writeJsonAtomic(join(projectDirectory, "production-manifest.json"), manifest);
  await writePortableBrief(projectDirectory);
  console.log(`${manifest.approval.status === "approved" ? "Approved" : "Draft"} manifest written. Hash: ${canonicalHash(manifest)}`);
}

async function commandStoryboard(): Promise<void> {
  const projectDirectory = projectArgument();
  const manifest = await loadApprovedManifest(projectDirectory);
  await writeReviewDocuments(projectDirectory, manifest);
  console.log("STORYBOARD.md and SCRIPT.md generated.");
}

async function commandImage(): Promise<void> {
  const action = process.argv[3];
  const projectDirectory = projectArgument(4);
  if (action === "plan") {
    const manifest = await loadApprovedManifest(projectDirectory);
    const referenceRegistry = await readJson<{
      references: Array<{ path?: string; role: string; hash?: string; modelUseAuthorized: boolean }>;
    }>(join(projectDirectory, "references/reference-registry.json"));
    const approvedReferences = referenceRegistry.references
      .filter((reference) => reference.modelUseAuthorized && reference.path && reference.hash)
      .map((reference) => ({ path: reference.path!, role: reference.role, hash: reference.hash! }));
    let count = 0;
    for (const scene of manifest.scenes) {
      if (scene.primaryVisual?.asset) continue;
      const outputPath = `assets/generated/${scene.id}-primary.png`;
      await createCodexImageTask(projectDirectory, {
        id: `${scene.id}-primary`,
        prompt: `Create a 1:1 high-quality editorial illustration for "${scene.title}". Purpose: ${scene.purpose}. Preserve the approved design pack and any approved style references. No text in the image.`,
        references: approvedReferences,
        outputPath,
      });
      count += 1;
    }
    console.log(`${count} Codex built-in image task(s) awaiting the agent. No OpenAI API key is used.`);
    return;
  }
  if (action === "complete") {
    const id = process.argv[5];
    const output = process.argv[6];
    if (!id || !output) throw new Error("Usage: ytvf image complete <project> <task-id> <output-path>");
    const outputPath = resolve(projectDirectory, output);
    const pending = await readJson<{ outputPath: string }>(join(projectDirectory, ".ytvf/image-tasks", `${id}.json`));
    const expected = assertContained(projectDirectory, join(projectDirectory, pending.outputPath));
    if (outputPath !== expected) throw new Error(`Image output must be saved at the task destination: ${pending.outputPath}`);
    const task = await completeCodexImageTask(projectDirectory, id, await sha256File(outputPath));
    const resolved = await loadExecutionManifest(projectDirectory);
    const sceneId = id.replace(/-primary$/, "");
    const scene = resolved.scenes.find((item) => item.id === sceneId);
    if (!scene) throw new Error(`Image generated, but scene does not exist: ${sceneId}`);
    scene.primaryVisual = { asset: task.outputPath, fit: "contain" };
    await writeJsonAtomic(join(projectDirectory, ".ytvf/resolved-manifest.json"), resolved);
    console.log(`Image task ${task.id} complete.`);
    return;
  }
  throw new Error("Usage: ytvf image plan <project> | ytvf image complete <project> <id> <output>");
}

async function commandNarrate(): Promise<void> {
  if (!hasFlag("--approve-paid")) throw new Error("Narration is a paid call. Re-run with --approve-paid after reviewing ytvf plan.");
  const projectDirectory = projectArgument();
  const manifest = await loadApprovedManifest(projectDirectory);
  const settings = manifest.providers.elevenlabs;
  if (!settings?.voiceId) throw new Error("The approved manifest has no ElevenLabs voice ID.");
  const adapter = new ElevenLabsAdapter();
  const resolved: ProductionManifest = structuredClone(manifest);
  const texts = manifest.scenes.map((scene) => scene.narration?.text ?? "");
  const access = await adapter.verifyAccess({
    voiceId: settings.voiceId, text: texts[0] ?? "Verification", outputPath: "", alignmentPath: "",
  });
  const estimatedCharacters = texts.reduce((sum, text) => sum + [...text].length, 0);
  if (typeof access.remainingCharacters === "number" && access.remainingCharacters < estimatedCharacters) {
    throw new Error(`ElevenLabs has ${access.remainingCharacters} characters remaining; this build needs approximately ${estimatedCharacters}.`);
  }
  console.log(JSON.stringify({ access, estimate: { currency: "characters", amount: estimatedCharacters } }, null, 2));
  for (const [index, scene] of resolved.scenes.entries()) {
    if (!scene.narration?.text || scene.narration.provider !== "elevenlabs") continue;
    const audioRelative = `audio/${scene.id}.mp3`;
    const alignmentRelative = `audio/${scene.id}.alignment.json`;
    const job = await adapter.submit({
      voiceId: settings.voiceId,
      text: scene.narration.text,
      outputPath: join(projectDirectory, audioRelative),
      alignmentPath: join(projectDirectory, alignmentRelative),
      modelId: settings.modelId,
      outputFormat: "mp3_44100_128",
      languageCode: "en",
      ...(texts[index - 1] ? { previousText: texts[index - 1] } : {}),
      ...(texts[index + 1] ? { nextText: texts[index + 1] } : {}),
      seed: 41001 + index,
      voiceSettings: {
        speed: settings.speed,
        stability: settings.stability,
        similarityBoost: settings.similarityBoost,
        style: 0,
        useSpeakerBoost: true,
      },
    }, {
      projectDirectory,
      manifest,
      approvedRequestHash: manifest.approval.approvedHash ?? "",
      dryRun: false,
    });
    if (job.state !== "complete") throw new Error(`Narration failed for scene ${scene.id}.`);
    const alignment = await readJson<{ captions: SceneManifestCaptions }>(join(projectDirectory, alignmentRelative));
    scene.narration.asset = audioRelative;
    scene.captions = alignment.captions;
    const last = alignment.captions.at(-1);
    if (last) scene.durationSeconds = Math.max(scene.durationSeconds, Number((last.end + 0.7).toFixed(3)));
  }
  await writeJsonAtomic(join(projectDirectory, ".ytvf/resolved-manifest.json"), resolved);
  console.log("Narration and phrase captions generated. Existing valid request hashes were reused.");
}

type SceneManifestCaptions = NonNullable<ProductionManifest["scenes"][number]["captions"]>;

async function commandReference(): Promise<void> {
  const action = process.argv[3];
  const projectDirectory = projectArgument(4);
  if (action === "list") {
    console.log(await readFile(join(projectDirectory, "references/reference-registry.json"), "utf8"));
    return;
  }
  if (action === "approve") {
    const id = process.argv[5];
    if (!id) throw new Error("A reference ID is required.");
    const provider = flag("--provider");
    if (!provider && !hasFlag("--model")) throw new Error("Choose --model or --provider <provider-id>.");
    const record = await approveReference(projectDirectory, id, provider ? "provider" : "model", provider ? [provider] : []);
    console.log(JSON.stringify({ id: record.id, trust: record.trust, approvedProviders: record.approvedProviders }, null, 2));
    return;
  }
  throw new Error("Usage: ytvf reference list <project> | ytvf reference approve <project> <id> --model|--provider <id>");
}

async function commandPanels(): Promise<void> {
  const action = process.argv[3];
  if (action !== "split") throw new Error("Usage: ytvf panels split <project> --source <path> --id <sheet-id>");
  const projectDirectory = projectArgument(4);
  const source = flag("--source");
  const sheetId = flag("--id");
  if (!source || !sheetId) throw new Error("--source and --id are required.");
  const xStart = flag("--x-start");
  const xEnd = flag("--x-end");
  const yStart = flag("--y-start");
  const yEnd = flag("--y-end");
  const explicitValues = [xStart, xEnd, yStart, yEnd];
  if (explicitValues.some(Boolean) && !explicitValues.every(Boolean)) {
    throw new Error("Explicit gutters require --x-start, --x-end, --y-start, and --y-end.");
  }
  const result = await splitContactSheet(projectDirectory, {
    source,
    sheetId,
    outputDirectory: flag("--output") ?? `assets/panels/${sheetId}`,
    ...(explicitValues.every(Boolean) ? {
      explicit: {
        x: { start: Number(xStart), end: Number(xEnd) },
        y: { start: Number(yStart), end: Number(yEnd) },
      },
    } : {}),
  });
  console.log(JSON.stringify({ panelMap: result.panelMapPath, panels: result.panels }, null, 2));
}

async function commandSequence(): Promise<void> {
  const action = process.argv[3];
  if (action !== "assemble") throw new Error("Usage: ytvf sequence assemble <project> --request <project-relative-json>");
  const projectDirectory = projectArgument(4);
  const requestFile = flag("--request");
  if (!requestFile) throw new Error("--request is required.");
  const request = await readJson<PanelSequenceRequest>(assertContained(projectDirectory, join(projectDirectory, requestFile)));
  const result = await assemblePanelSequence(projectDirectory, request);
  console.log(JSON.stringify(result, null, 2));
}

async function pollProvider(
  initial: ProviderJob,
  status: (job: ProviderJob) => Promise<ProviderJob>,
  attempts = 60,
): Promise<ProviderJob> {
  let job = initial;
  for (let index = 0; index < attempts; index += 1) {
    if (job.state === "complete" || job.state === "failed") return job;
    if (index > 0) await new Promise((resolvePromise) => setTimeout(resolvePromise, 10_000));
    job = await status(job);
  }
  throw new Error(`Provider polling timed out with resumable job ID ${job.jobId}.`);
}

async function commandPresenter(): Promise<void> {
  if (!hasFlag("--approve-paid")) throw new Error("HeyGen is a paid call. Re-run with --approve-paid after reviewing the estimate and billing source.");
  const projectDirectory = projectArgument();
  const manifest = await loadApprovedManifest(projectDirectory);
  if (!manifest.providers.allowed.includes("heygen")) throw new Error("HeyGen is not authorized by the manifest.");
  const requestFile = flag("--request");
  if (!requestFile) throw new Error("--request <project-relative-json> is required.");
  const input = await readJson<{
    audioPath: string;
    audioDurationSeconds: number;
    outputPath: string;
    sceneId?: string;
    presenterMode?: NonNullable<ProductionManifest["scenes"][number]["presenter"]>["mode"];
    title?: string;
    aspectRatio?: "16:9" | "9:16" | "1:1";
    outputFormat?: "webm" | "mp4";
  }>(assertContained(projectDirectory, join(projectDirectory, requestFile)));
  const settings = manifest.providers.heygen;
  if (!settings?.avatarId) throw new Error("The approved manifest has no HeyGen avatar ID.");
  const adapter = new HeyGenCliAdapter();
  const request: HeyGenAvatarRequest = {
    avatarId: settings.avatarId,
    audioPath: assertContained(projectDirectory, join(projectDirectory, input.audioPath)),
    audioDurationSeconds: input.audioDurationSeconds,
    outputPath: assertContained(projectDirectory, join(projectDirectory, input.outputPath)),
    engine: settings.engine,
    resolution: "1080p",
    aspectRatio: input.aspectRatio ?? "16:9",
    outputFormat: input.outputFormat ?? "webm",
    ...(input.title ? { title: input.title } : {}),
  };
  const [access, estimate] = await Promise.all([adapter.verifyAccess(request), adapter.estimate(request)]);
  if (typeof access.credits === "number" && access.credits < estimate.amount) {
    throw new Error(`HeyGen reports ${access.credits} credits; this request is estimated at ${estimate.amount.toFixed(3)} credits.`);
  }
  console.log(JSON.stringify({ billingVerification: access, estimate }, null, 2));
  const context = { projectDirectory, manifest, approvedRequestHash: manifest.approval.approvedHash ?? "", dryRun: false };
  let job = await adapter.submit(request, context);
  job = await pollProvider(job, (current) => adapter.status(current, context));
  if (job.state === "failed") throw new Error(`HeyGen job ${job.jobId} failed: ${job.error ?? "unknown error"}`);
  await adapter.download(job, request.outputPath, context);
  if (input.sceneId) {
    const resolved = await loadExecutionManifest(projectDirectory);
    const scene = resolved.scenes.find((item) => item.id === input.sceneId);
    if (!scene) throw new Error(`Presenter generated, but scene does not exist: ${input.sceneId}`);
    scene.presenter = {
      mode: input.presenterMode ?? "circle-bottom-right",
      asset: input.outputPath,
      provider: "heygen",
      muted: true,
    };
    await writeJsonAtomic(join(projectDirectory, ".ytvf/resolved-manifest.json"), resolved);
  }
  console.log(`HeyGen presenter downloaded to ${input.outputPath}`);
}

interface LocalMotionRequest {
  prompt: string;
  firstFrame: string;
  lastFrame: string;
  outputPath: string;
  duration?: number;
  resolution?: string;
  aspectRatio?: string;
  seed?: number;
  sceneId?: string;
}

async function commandMotion(): Promise<void> {
  if (!hasFlag("--approve-paid")) throw new Error("OpenRouter video is a paid call. Re-run with --approve-paid after reviewing the live estimate.");
  const projectDirectory = projectArgument();
  const manifest = await loadApprovedManifest(projectDirectory);
  if (!manifest.providers.allowed.includes("openrouter")) throw new Error("OpenRouter is not authorized by the manifest.");
  const requestFile = flag("--request");
  if (!requestFile) throw new Error("--request <project-relative-json> is required.");
  const input = await readJson<LocalMotionRequest>(assertContained(projectDirectory, join(projectDirectory, requestFile)));
  const settings = manifest.providers.openrouter;
  if (!settings?.model) throw new Error("The approved manifest has no OpenRouter motion model.");
  const firstPath = assertContained(projectDirectory, join(projectDirectory, input.firstFrame));
  const lastPath = assertContained(projectDirectory, join(projectDirectory, input.lastFrame));
  const outputPath = assertContained(projectDirectory, join(projectDirectory, input.outputPath));
  const requestIdentity = canonicalHash({
    model: settings.model,
    prompt: input.prompt,
    firstFrameHash: await sha256File(firstPath),
    lastFrameHash: await sha256File(lastPath),
    duration: input.duration ?? 5,
    resolution: input.resolution ?? "480p",
    aspectRatio: input.aspectRatio ?? "1:1",
    seed: input.seed ?? 1729,
  });
  const stager = new GcpFrameStager();
  const staged: StagedFrame[] = [];
  let safeToRelease = false;
  try {
    staged.push(await stager.stage(firstPath, manifest.id, requestIdentity));
    staged.push(await stager.stage(lastPath, manifest.id, requestIdentity));
    const request: OpenRouterVideoRequest = {
      model: settings.model,
      prompt: input.prompt,
      duration: input.duration ?? 5,
      resolution: input.resolution ?? "480p",
      aspectRatio: input.aspectRatio ?? "1:1",
      firstFrameUrl: staged[0]!.publicUrl,
      lastFrameUrl: staged[1]!.publicUrl,
      generateAudio: false,
      seed: input.seed ?? 1729,
      outputPath,
    };
    const adapter = new OpenRouterVideoAdapter();
    const [access, estimate] = await Promise.all([adapter.verifyAccess(request), adapter.estimate(request)]);
    if (estimate.currency !== "USD") throw new Error("OpenRouter did not return a usable USD estimate.");
    assertPaidExecutionAllowed(manifest.providers.costCeilingUsd, estimate.amount, true);
    console.log(JSON.stringify({ access, estimate, requestHash: requestIdentity }, null, 2));
    await writeJsonAtomic(join(projectDirectory, "provider-records", `openrouter-${requestIdentity}.staging.json`), {
      schemaVersion: 1,
      requestHash: requestIdentity,
      objects: staged.map(({ objectKey, hash }) => ({ objectKey, hash })),
    });
    const context = { projectDirectory, manifest, approvedRequestHash: manifest.approval.approvedHash ?? "", dryRun: false };
    let job = await adapter.submit(request, context);
    job = await pollProvider(job, (current) => adapter.status(current, context));
    if (job.state === "failed") throw new Error(`OpenRouter job ${job.jobId} failed: ${job.error ?? "unknown error"}`);
    await adapter.download(job, outputPath, context);
    if (input.sceneId) {
      const resolved = await loadExecutionManifest(projectDirectory);
      const scene = resolved.scenes.find((item) => item.id === input.sceneId);
      if (!scene) throw new Error(`Motion generated, but scene does not exist: ${input.sceneId}`);
      scene.primaryVisual = { asset: input.outputPath, fit: "contain" };
      await writeJsonAtomic(join(projectDirectory, ".ytvf/resolved-manifest.json"), resolved);
    }
    safeToRelease = true;
    console.log(`Motion clip downloaded to ${input.outputPath}`);
  } finally {
    if (safeToRelease) {
      for (const frame of staged) {
        try { await stager.release(frame); } catch (error) {
          console.error(`Staging cleanup required for object ${frame.objectKey}: ${error instanceof Error ? error.message : error}`);
        }
      }
    } else if (staged.length) {
      console.error("Staged frames were retained because the provider job is not safely downloaded. Use the sanitized staging record for recovery and cleanup.");
    }
  }
}

async function commandPreview(): Promise<void> {
  const projectDirectory = projectArgument();
  const manifest = await loadExecutionManifest(projectDirectory);
  const result = await compileHyperFrames(projectDirectory, manifest);
  await runHyperFrames(["check", "--strict", "--snapshots", "--at-transitions", result.directory], factoryRoot);
  if (hasFlag("--check-only")) {
    console.log(`Preview checks passed: ${result.compositionPath}`);
    return;
  }
  console.log("Mechanical checks passed. Opening HyperFrames Studio; inspect the whole timeline before approval.");
  await runHyperFrames(["preview", result.directory], factoryRoot);
}

async function commandApprovePreview(): Promise<void> {
  const projectDirectory = projectArgument();
  const manifest = await loadExecutionManifest(projectDirectory);
  const composition = join(projectDirectory, "build/hyperframes/index.html");
  if (!existsSync(composition)) throw new Error("No compiled preview exists.");
  await writeJsonAtomic(join(projectDirectory, ".ytvf/preview-approval.json"), {
    schemaVersion: 1,
    manifestApprovalHash: manifest.approval.approvedHash,
    compositionHash: await sha256File(composition),
    approved: true,
  });
  console.log("Preview approval recorded for the exact compiled composition.");
}

async function commandBuild(): Promise<void> {
  const projectDirectory = projectArgument();
  const manifest = await loadExecutionManifest(projectDirectory);
  const result = await compileHyperFrames(projectDirectory, manifest);
  const approval = await readJson<{ approved: boolean; manifestApprovalHash: string; compositionHash: string }>(
    join(projectDirectory, ".ytvf/preview-approval.json"),
  );
  if (!approval.approved
    || approval.manifestApprovalHash !== manifest.approval.approvedHash
    || approval.compositionHash !== await sha256File(result.compositionPath)) {
    throw new Error("Final render is blocked until this exact preview is explicitly approved.");
  }
  const output = resolve(projectDirectory, manifest.output.destination);
  await mkdir(dirname(output), { recursive: true });
  await runHyperFrames(["render", "--strict", "--quality", manifest.output.quality, "--fps", String(manifest.output.fps), "--output", output, result.directory], factoryRoot);
  console.log(`Rendered ${output}`);
}

async function commandValidate(): Promise<void> {
  const projectDirectory = projectArgument();
  const manifest = await loadExecutionManifest(projectDirectory);
  const errors = validateManifest(manifest, projectDirectory);
  const buildPath = join(projectDirectory, "build/hyperframes/index.html");
  if (existsSync(buildPath)) await runHyperFrames(["check", "--strict", "--at-transitions", join(projectDirectory, "build/hyperframes")], factoryRoot);
  const output = assertContained(projectDirectory, join(projectDirectory, manifest.output.destination));
  let media: Record<string, unknown> = { checked: false, reason: "final output does not exist" };
  if (existsSync(output)) {
    const probe = spawnSync("ffprobe", [
      "-v", "error", "-show_entries",
      "format=duration,format_name:stream=codec_type,codec_name,width,height,r_frame_rate,sample_rate,channels",
      "-of", "json", output,
    ], { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
    if (probe.status !== 0) errors.push(`ffprobe failed: ${probe.stderr.trim()}`);
    let parsed: { streams?: Array<Record<string, unknown>>; format?: Record<string, unknown> } = {};
    try { parsed = JSON.parse(probe.stdout) as typeof parsed; } catch { errors.push("ffprobe did not return valid JSON"); }
    const video = parsed.streams?.find((stream) => stream.codec_type === "video");
    const audio = parsed.streams?.find((stream) => stream.codec_type === "audio");
    if (video?.codec_name !== "h264") errors.push("final video codec is not H.264");
    if (video?.width !== 1920 || video?.height !== 1080) errors.push("final resolution is not 1920x1080");
    if (video?.r_frame_rate !== `${manifest.output.fps}/1`) errors.push(`final frame rate is not ${manifest.output.fps} fps`);
    if (manifest.scenes.some((scene) => scene.narration?.asset) && audio?.codec_name !== "aac") errors.push("final narration audio codec is not AAC");
    const decode = spawnSync("ffmpeg", ["-v", "error", "-i", output, "-f", "null", "-"], {
      encoding: "utf8",
      maxBuffer: 20 * 1024 * 1024,
    });
    if (decode.status !== 0 || decode.stderr.trim()) errors.push(`full decode failed: ${decode.stderr.trim()}`);
    media = { checked: true, probe: parsed, fullDecode: decode.status === 0 && !decode.stderr.trim() };
  }
  const result = {
    status: errors.length ? "FAIL" : existsSync(output) ? "PASS" : "PASS-PREVIEW-ONLY",
    manifestApprovalHash: manifest.approval.approvedHash,
    scenes: manifest.scenes.length,
    hyperframesChecked: existsSync(buildPath),
    finalMedia: media,
    errors,
  };
  await writeJsonAtomic(join(projectDirectory, "validation/validation-result.json"), result);
  console.log(JSON.stringify(result, null, 2));
  if (errors.length) process.exitCode = 1;
}

async function commandDoctor(): Promise<void> {
  const tool = (name: string, args: string[] = ["--version"]) => {
    const result = spawnSync(name, args, { encoding: "utf8" });
    return { available: result.status === 0, version: (result.stdout || result.stderr).trim().split("\n")[0] };
  };
  const hf = spawnSync(hyperframesExecutable, ["doctor", "--json"], { cwd: factoryRoot, encoding: "utf8" });
  let hyperframes: unknown = { available: false, detail: hf.stderr.trim() };
  try { hyperframes = JSON.parse(hf.stdout); } catch {}
  const checks = (hyperframes as { checks?: Array<{ name: string; ok: boolean }> }).checks ?? [];
  const required = new Set(["Node.js", "CPU", "Disk", "FFmpeg", "FFprobe", "Chrome"]);
  const compositionReady = [...required].every((name) => checks.find((check) => check.name === name)?.ok);
  const renderReady = compositionReady && Boolean(checks.find((check) => check.name === "Memory")?.ok);
  console.log(JSON.stringify({
    node: process.version,
    ffmpeg: tool("ffmpeg", ["-version"]),
    ffprobe: tool("ffprobe", ["-version"]),
    hyperframes: { compositionReady, renderReady, doctor: hyperframes },
    providers: {
      elevenlabs: { credentialPresent: Boolean(process.env.ELEVENLABS_API_KEY) },
      heygen: { apiCredentialPresent: Boolean(process.env.HEYGEN_API_KEY), cli: tool(process.env.HEYGEN_CLI_PATH ?? join(process.env.HOME ?? "", ".local/bin/heygen"), ["--version"]) },
      openrouter: { credentialPresent: Boolean(process.env.OPENROUTER_API_KEY) },
      gcpStaging: { configured: Boolean(process.env.GCP_STAGING_BUCKET && process.env.GCP_STAGING_PROJECT), cli: tool("gcloud", ["version"]) },
      codexImage2: { mode: "Codex built-in image generation; no API key" },
    },
  }, null, 2));
}

async function commandResume(): Promise<void> {
  const projectDirectory = projectArgument();
  const providers = ["elevenlabs", "heygen", "openrouter"];
  const jobs: Record<string, unknown> = {};
  for (const provider of providers) {
    const path = join(projectDirectory, "provider-records", `${provider}-jobs.json`);
    if (existsSync(path)) jobs[provider] = await readJson(path);
  }
  console.log(JSON.stringify(jobs, null, 2));
}

async function commandDesign(): Promise<void> {
  const action = process.argv[3];
  if (action === "list") {
    console.log(JSON.stringify({
      layouts: layouts.map(({ id, purpose }) => ({ id, purpose })),
      palettes: allPalettes.map(({ id, label, colors }) => ({ id, label, colors })),
      typography: typographies,
      designPacks,
    }, null, 2));
    return;
  }
  if (action === "preview") {
    const projectDirectory = projectArgument(4);
    const layoutCards = layouts.map((layout) => `<article><div class="wireframe">${Object.entries(layout.frames).map(([name, frame]) => `<i title="${name}" style="left:${frame.x / 19.2}%;top:${frame.y / 10.8}%;width:${frame.width / 19.2}%;height:${frame.height / 10.8}%"><span>${name}</span></i>`).join("")}</div><h2>${layout.id}</h2><p>${layout.purpose}</p></article>`).join("");
    const paletteCards = allPalettes.map((palette) => `<article><div class="swatches">${palette.colors.map((color) => `<i style="background:${color}"></i>`).join("")}</div><h2>${palette.label}</h2><code>${palette.id}</code></article>`).join("");
    const typeCards = typographies.map((type) => `<article><h2 style="font-family:${type.titleFamily}">${type.label}</h2><p>${type.description}</p><code>${type.id}</code></article>`).join("");
    await writeTextAtomic(join(projectDirectory, "DESIGN_CATALOG.html"), `<!doctype html><html><head><meta charset="utf-8"><title>Design Catalog</title><style>body{margin:0;padding:50px;background:#24202A;color:#EEE6D8;font-family:system-ui}h1{font:60px Georgia;margin-bottom:8px}h2{font-size:20px}section{margin:60px 0}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px}article{background:#EEE6D8;color:#24202A;padding:18px}.swatches{display:flex;height:80px}.swatches i{flex:1}.wireframe{position:relative;aspect-ratio:16/9;background:#D8CBB8;overflow:hidden}.wireframe i{position:absolute;border:2px solid #A6793B;background:#EEE6D899;overflow:hidden}.wireframe span{font:10px system-ui;color:#24202A}</style></head><body><h1>YouTube Video Factory Design Catalog</h1><p>${layouts.length} layouts · ${allPalettes.length} palettes · ${typographies.length} typography systems</p><section><h1>Layouts</h1><main>${layoutCards}</main></section><section><h1>Palettes</h1><main>${paletteCards}</main></section><section><h1>Typography</h1><main>${typeCards}</main></section></body></html>`);
    console.log(`Wrote ${join(projectDirectory, "DESIGN_CATALOG.html")}`);
    return;
  }
  if (action === "add") {
    const projectDirectory = projectArgument(4);
    const definitionPath = process.argv[5];
    if (!definitionPath) throw new Error("Usage: ytvf design add <project> <design-pack.json>");
    const definition = await readJson<{
      pack: ProductionManifest["design"]["pack"];
      palette: ProductionManifest["design"]["palette"];
      typography: ProductionManifest["design"]["typography"];
      motion: ProductionManifest["design"]["motion"];
    }>(resolve(definitionPath));
    if (definition.palette.colors.length !== 5) throw new Error("A palette must define exactly five colors.");
    if (definition.pack.palette !== definition.palette.id
      || definition.pack.typography !== definition.typography.id
      || definition.pack.motion !== definition.motion.id) {
      throw new Error("Design pack references do not match the supplied palette, typography, and motion records.");
    }
    const path = join(projectDirectory, ".ytvf/design-registry.json");
    const registry = await readJson<CustomDesignRegistry & { schemaVersion: 1 }>(path);
    const uniquePush = <T extends { id: string }>(values: T[], value: T) => {
      const existing = values.find((item) => item.id === value.id);
      if (existing && canonicalHash(existing) !== canonicalHash(value)) throw new Error(`Design ID already exists with different values: ${value.id}`);
      if (!existing) values.push(value);
      values.sort((left, right) => left.id.localeCompare(right.id));
    };
    uniquePush(registry.designPacks, definition.pack);
    uniquePush(registry.palettes, definition.palette);
    uniquePush(registry.typographies, definition.typography);
    uniquePush(registry.motions, definition.motion);
    await writeJsonAtomic(path, registry);
    console.log(`Added design pack ${definition.pack.id}. Set designPack: "${definition.pack.id}" in PRODUCTION_BRIEF.md.`);
    return;
  }
  throw new Error("Usage: ytvf design list | ytvf design preview <project> | ytvf design add <project> <file>");
}

async function commandReceipt(): Promise<void> {
  const projectDirectory = projectArgument();
  const manifest = await loadExecutionManifest(projectDirectory);
  const output = resolve(projectDirectory, manifest.output.destination);
  const validationPath = join(projectDirectory, "validation/validation-result.json");
  const validation = existsSync(validationPath)
    ? await readJson<{ status: string }>(validationPath)
    : { status: "not run" };
  const receipt = {
    schemaVersion: 1,
    project: manifest.title,
    manifestApprovalHash: manifest.approval.approvedHash,
    scenes: manifest.scenes.length,
    durationSeconds: manifest.scenes.reduce((sum, scene) => sum + scene.durationSeconds, 0),
    resolution: `${manifest.output.width}x${manifest.output.height}`,
    fps: manifest.output.fps,
    renderer: "HyperFrames 0.7.77",
    output: existsSync(output) ? manifest.output.destination : null,
    outputHash: existsSync(output) ? await sha256File(output) : null,
    validation: validation.status,
  };
  await writeJsonAtomic(join(projectDirectory, "BUILD_RECEIPT.json"), receipt);
  console.log(JSON.stringify(receipt, null, 2));
}

async function main(): Promise<void> {
  const command = process.argv[2];
  if (!command || ["help", "--help", "-h"].includes(command)) {
    console.log(help());
    return;
  }
  const commands: Record<string, () => Promise<void>> = {
    init: commandInit,
    brief: commandBrief,
    plan: commandPlan,
    manifest: commandManifest,
    storyboard: commandStoryboard,
    image: commandImage,
    reference: commandReference,
    panels: commandPanels,
    sequence: commandSequence,
    narrate: commandNarrate,
    presenter: commandPresenter,
    motion: commandMotion,
    preview: commandPreview,
    "approve-preview": commandApprovePreview,
    build: commandBuild,
    validate: commandValidate,
    doctor: commandDoctor,
    resume: commandResume,
    design: commandDesign,
    receipt: commandReceipt,
  };
  const handler = commands[command];
  if (!handler) throw new Error(`Unknown command: ${command}\n\n${help()}`);
  await handler();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
