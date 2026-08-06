#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { resolve, join } from "node:path";

const project = resolve(process.argv[2] ?? "");
if (!project) throw new Error("Usage: node scripts/assemble-square-social-montages.mjs <project-directory>");
const motion = join(project, "assets/motion-square");
const output = join(project, "assets/edits-square");
await mkdir(output, { recursive: true });

const scenes = [
  { id: "01", duration: 8, clips: ["ny-01", "tx-01", "ba-01"] },
  { id: "02", duration: 7, clips: ["ny-02", "tx-02", "ba-02"] },
  { id: "03", duration: 9, clips: ["ny-03", "tx-03", "ba-03"] },
];
const receipt = [];
for (const scene of scenes) {
  const clipDuration = scene.duration / scene.clips.length;
  const inputs = scene.clips.flatMap((name) => ["-i", join(motion, `${name}-emote-4s-480p-silent-square.mp4`)]);
  const filters = scene.clips.map((_, index) => `[${index}:v]trim=duration=${clipDuration.toFixed(6)},setpts=PTS-STARTPTS,scale=640:640:flags=lanczos,fps=30[v${index}]`).join(";")
    + `;${scene.clips.map((_, index) => `[v${index}]`).join("")}concat=n=${scene.clips.length}:v=1:a=0,format=yuv420p[v]`;
  const destination = join(output, `scene-${scene.id}-montage-square.mp4`);
  const result = spawnSync("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", filters, "-map", "[v]", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-g", "30", "-keyint_min", "30", "-an", destination], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr.trim() || `Unable to assemble scene ${scene.id}.`);
  const probe = spawnSync("ffprobe", ["-v", "error", "-show_entries", "stream=codec_type,width,height,r_frame_rate", "-of", "json", destination], { encoding: "utf8" });
  const streams = JSON.parse(probe.stdout).streams ?? [];
  const video = streams.find((stream) => stream.codec_type === "video");
  if (video?.width !== 640 || video?.height !== 640 || video?.r_frame_rate !== "30/1" || streams.some((stream) => stream.codec_type === "audio")) {
    throw new Error(`Square montage validation failed for scene ${scene.id}.`);
  }
  receipt.push({ scene: scene.id, duration: scene.duration, clips: scene.clips, output: `assets/edits-square/scene-${scene.id}-montage-square.mp4`, dimensions: "640x640", fps: 30 });
}
const hash = createHash("sha256").update(JSON.stringify(receipt)).digest("hex");
await writeFile(join(output, "montage-receipt.json"), `${JSON.stringify({ schemaVersion: 1, aspectRatio: "1:1", silent: true, scenes: receipt, hash }, null, 2)}\n`);
console.log("Assembled three square, 30 fps, seek-safe hero montages.");
