import test from "node:test";
import assert from "node:assert/strict";
import { chmod, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { initializeProject } from "../src/core/project.js";
import { approveManifest, manifestFromBrief } from "../src/core/manifest.js";
import { parseBrief } from "../src/core/brief.js";
import { ElevenLabsAdapter } from "../src/providers/elevenlabs.js";
import { OpenRouterVideoAdapter } from "../src/providers/openrouter.js";
import { HeyGenCliAdapter } from "../src/providers/heygen.js";
import { GcpFrameStager } from "../src/providers/gcp-staging.js";

const manifest = approveManifest(manifestFromBrief(parseBrief(`---
projectId: fixture
audience: viewers
deliverable: YouTube
designPack: ivory-dusk-editorial
fps: 30
music: false
captions: phrase
voiceProvider: elevenlabs
voiceId: voice
providers: [elevenlabs]
costCeilingUsd: 5
---
# Fixture
## Scene 01: Test
Purpose: Test
Narration: Hello world
`)));

test("ElevenLabs adapter verifies, generates timestamped audio, and reuses the request", async () => {
  const root = await mkdtemp(join(tmpdir(), "ytvf-eleven-"));
  const project = await initializeProject(join(root, "project"), "Eleven");
  const previous = process.env.ELEVENLABS_API_KEY;
  process.env.ELEVENLABS_API_KEY = "test-only";
  let generated = 0;
  const fetchMock: typeof fetch = async (input, init) => {
    const url = String(input);
    if (!init?.method) return new Response(JSON.stringify({ voice_id: "voice" }), { status: 200 });
    generated += 1;
    return new Response(JSON.stringify({
      audio_base64: Buffer.from("fake-mp3").toString("base64"),
      normalized_alignment: {
        characters: ["H", "i"],
        character_start_times_seconds: [0, 0.1],
        character_end_times_seconds: [0.1, 0.2],
      },
    }), { status: 200, headers: { "request-id": "request-1" } });
  };
  try {
    const adapter = new ElevenLabsAdapter(fetchMock, "https://mock");
    const request = { voiceId: "voice", text: "Hi", outputPath: join(project, "audio/one.mp3"), alignmentPath: join(project, "audio/one.json") };
    await adapter.verifyAccess(request);
    const context = { projectDirectory: project, manifest, approvedRequestHash: manifest.approval.approvedHash!, dryRun: false };
    const first = await adapter.submit(request, context);
    const second = await adapter.submit(request, context);
    assert.equal(first.state, "complete");
    assert.equal(second.jobId, first.jobId);
    assert.equal(generated, 1);
  } finally {
    if (previous === undefined) delete process.env.ELEVENLABS_API_KEY; else process.env.ELEVENLABS_API_KEY = previous;
  }
});

test("OpenRouter adapter discovers, estimates, submits, polls, and downloads", async () => {
  const root = await mkdtemp(join(tmpdir(), "ytvf-router-"));
  const project = await initializeProject(join(root, "project"), "Router");
  const previous = process.env.OPENROUTER_API_KEY;
  process.env.OPENROUTER_API_KEY = "test-only";
  const fetchMock: typeof fetch = async (input, init) => {
    const url = String(input);
    if (url.endsWith("/videos/models")) return new Response(JSON.stringify({ data: [{ id: "bytedance/seedance-1-5-pro", pricing_skus: { "per-video-second": "0.01" } }] }));
    if (url.endsWith("/credits")) return new Response(JSON.stringify({ data: { total_credits: 4 } }));
    if (url.endsWith("/videos") && init?.method === "POST") return new Response(JSON.stringify({ id: "video-1", status: "queued" }));
    if (url.endsWith("/videos/video-1/content?index=0")) return new Response(Buffer.from("video"));
    if (url.endsWith("/videos/video-1")) return new Response(JSON.stringify({ id: "video-1", status: "completed", usage: { cost: 0.05 } }));
    return new Response("missing", { status: 404 });
  };
  try {
    const adapter = new OpenRouterVideoAdapter(fetchMock, "https://mock");
    const request = { model: "bytedance/seedance-1-5-pro", prompt: "continuous motion", duration: 5, resolution: "480p", aspectRatio: "1:1", outputPath: join(project, "motion/clip.mp4") };
    assert.equal((await adapter.estimate(request)).amount, 0.05);
    await adapter.verifyAccess(request);
    const context = { projectDirectory: project, manifest, approvedRequestHash: manifest.approval.approvedHash!, dryRun: false };
    const submitted = await adapter.submit(request, context);
    const complete = await adapter.status(submitted, context);
    const downloaded = await adapter.download(complete, request.outputPath, context);
    assert.equal(downloaded.state, "complete");
    assert.equal(await readFile(request.outputPath, "utf8"), "video");
  } finally {
    if (previous === undefined) delete process.env.OPENROUTER_API_KEY; else process.env.OPENROUTER_API_KEY = previous;
  }
});

test("HeyGen CLI adapter verifies account/avatar and runs a resumable generation", async () => {
  const root = await mkdtemp(join(tmpdir(), "ytvf-heygen-"));
  const project = await initializeProject(join(root, "project"), "HeyGen");
  const executable = join(root, "heygen");
  await writeFile(executable, `#!/usr/bin/env node
const fs=require("fs");const a=process.argv.slice(2);
if(a[0]==="auth") console.log(JSON.stringify({authenticated:true,billing:"api-or-oauth"}));
else if(a[0]==="avatar") console.log(JSON.stringify({id:a[2]}));
else if(a[0]==="asset") console.log(JSON.stringify({asset_id:"asset-1"}));
else if(a[0]==="video"&&a[1]==="create") console.log(JSON.stringify({video_id:"video-1"}));
else if(a[0]==="video"&&a[1]==="get") console.log(JSON.stringify({status:"completed",duration:10}));
else if(a[0]==="video"&&a[1]==="download"){const p=a[a.indexOf("--output-path")+1];fs.mkdirSync(require("path").dirname(p),{recursive:true});fs.writeFileSync(p,"heygen-video");console.log("{}")}
`, "utf8");
  await chmod(executable, 0o755);
  const adapter = new HeyGenCliAdapter(executable);
  const audio = join(project, "audio/source.mp3");
  await writeFile(audio, "audio");
  const request = { avatarId: "avatar-1", audioPath: audio, audioDurationSeconds: 10, outputPath: join(project, "presenters/one.webm") };
  const verified = await adapter.verifyAccess(request);
  assert.equal(verified.verified, true);
  const context = { projectDirectory: project, manifest, approvedRequestHash: manifest.approval.approvedHash!, dryRun: false };
  const submitted = await adapter.submit(request, context);
  const complete = await adapter.status(submitted, context);
  const downloaded = await adapter.download(complete, request.outputPath, context);
  assert.equal(downloaded.state, "complete");
  assert.equal(await readFile(request.outputPath, "utf8"), "heygen-video");
});

test("GCP frame stager uses content-addressed objects, verifies public access, and releases", async () => {
  const root = await mkdtemp(join(tmpdir(), "ytvf-gcp-"));
  const frame = join(root, "frame.png");
  await writeFile(frame, Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64"));
  const calls: string[][] = [];
  const stager = new GcpFrameStager(
    "gs://fixture-bucket",
    "fixture-project",
    "gcloud",
    async (_executable, arguments_) => { calls.push(arguments_); return {}; },
    async () => new Response(null, { status: 200, headers: { "content-type": "image/png" } }),
  );
  const staged = await stager.stage(frame, "project", "request");
  assert.match(staged.objectKey, /^ucc-staging\/project\/request\/[a-f0-9]{64}\.png$/);
  assert.match(staged.publicUrl, /^https:\/\/storage\.googleapis\.com\/fixture-bucket\//);
  await stager.release(staged);
  assert.equal(calls[0]?.[0], "storage");
  assert.equal(calls[0]?.[1], "cp");
  assert.equal(calls[1]?.[1], "rm");
});
