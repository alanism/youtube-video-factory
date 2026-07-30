#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { resolve, join } from "node:path";

const project = resolve(process.argv[2] ?? "");
if (!project) throw new Error("Usage: node scripts/assemble-family-emote-montages.mjs <project-directory>");
const motion = join(project, "assets/motion");
const output = join(project, "assets/edits-square");
await mkdir(output, { recursive: true });
const scenes = [
  { id: "01", duration: 7, clips: [["asian-family-emote-01-02", 3.5], ["latin-family-emote-01-02", 3.5]] },
  { id: "02", duration: 8, clips: [["white-family-emote-01-02", 8 / 3], ["asian-family-emote-02-03", 8 / 3], ["latin-family-emote-02-03", 8 / 3]] },
  { id: "03", duration: 9, clips: [["asian-family-emote-03-04", 3], ["latin-family-emote-03-04", 3], ["white-family-emote-03-04", 3]] },
  { id: "04", duration: 6, clips: [["white-family-emote-02-03", 6]] },
];
const receipt = [];
for (const scene of scenes) {
  const inputs = scene.clips.flatMap(([name]) => ["-i", join(motion, `${name}.mp4`)]);
  const filters = scene.clips.map(([_, duration], index) => {
    const hold = scene.id === "04" ? ",tpad=stop_mode=clone:stop_duration=2" : "";
    return `[${index}:v]trim=duration=${Math.min(4, duration).toFixed(6)},setpts=PTS-STARTPTS${hold},trim=duration=${duration.toFixed(6)},setpts=PTS-STARTPTS,scale=640:640:flags=lanczos,fps=30[v${index}]`;
  });
  const joined = scene.clips.map((_, index) => `[v${index}]`).join("");
  const destination = join(output, `scene-${scene.id}-montage-square.mp4`);
  const run = spawnSync("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", `${filters.join(";")};${joined}concat=n=${scene.clips.length}:v=1:a=0,format=yuv420p[v]`, "-map", "[v]", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-g", "30", "-keyint_min", "30", "-an", destination], { encoding: "utf8" });
  if (run.status !== 0) throw new Error(run.stderr.trim() || `Unable to assemble scene ${scene.id}.`);
  const probe = spawnSync("ffprobe", ["-v", "error", "-show_entries", "stream=codec_type,width,height,r_frame_rate", "-show_entries", "format=duration", "-of", "json", destination], { encoding: "utf8" });
  const parsed = JSON.parse(probe.stdout);
  const video = parsed.streams?.find((stream) => stream.codec_type === "video");
  if (video?.width !== 640 || video?.height !== 640 || video?.r_frame_rate !== "30/1" || parsed.streams?.some((stream) => stream.codec_type === "audio") || Math.abs(Number(parsed.format?.duration) - scene.duration) > 0.05) throw new Error(`Scene ${scene.id} montage validation failed.`);
  receipt.push({ scene: scene.id, duration: scene.duration, clips: scene.clips.map(([name]) => `assets/motion/${name}.mp4`), output: `assets/edits-square/scene-${scene.id}-montage-square.mp4`, dimensions: "640x640", fps: 30, silent: true });
}
const hash = createHash("sha256").update(JSON.stringify(receipt)).digest("hex");
await writeFile(join(output, "montage-receipt.json"), `${JSON.stringify({ schemaVersion: 1, aspectRatio: "1:1", scenes: receipt, hash }, null, 2)}\n`);
console.log("Assembled four square hero montages from all nine Seedance clips.");
