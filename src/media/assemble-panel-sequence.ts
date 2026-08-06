import { execFile } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { promisify } from "node:util";
import { assertContained, canonicalHash, sha256File, writeJsonAtomic } from "../core/files.js";

const execFileAsync = promisify(execFile);

export interface PanelSequenceRequest {
  clips: [string, string, string];
  finalPanel: string;
  outputPath: string;
}

async function probe(path: string): Promise<Record<string, unknown>> {
  const { stdout } = await execFileAsync("ffprobe", [
    "-v", "error", "-count_frames",
    "-show_entries", "stream=codec_name,width,height,r_frame_rate,nb_read_frames:format=duration",
    "-of", "json", path,
  ], { encoding: "utf8" });
  return JSON.parse(stdout) as Record<string, unknown>;
}

export async function assemblePanelSequence(
  projectDirectory: string,
  request: PanelSequenceRequest,
): Promise<{ outputPath: string; receiptPath: string }> {
  const clips = request.clips.map((path) => assertContained(projectDirectory, join(projectDirectory, path))) as [string, string, string];
  const finalPanel = assertContained(projectDirectory, join(projectDirectory, request.finalPanel));
  const outputPath = assertContained(projectDirectory, join(projectDirectory, request.outputPath));
  const hashes = await Promise.all([...clips, finalPanel].map(sha256File));
  const requestHash = canonicalHash({ hashes, policy: "480-square-24fps-360frames-v1" });
  const cacheDirectory = assertContained(projectDirectory, join(projectDirectory, ".ytvf/sequence-cache", requestHash));
  await mkdir(cacheDirectory, { recursive: true });
  const normalized: string[] = [];
  for (const [index, clip] of clips.entries()) {
    const destination = join(cacheDirectory, `clip-${index + 1}.mp4`);
    await execFileAsync("ffmpeg", [
      "-v", "error", "-y", "-i", clip,
      "-vf", "scale=480:480:force_original_aspect_ratio=decrease,pad=480:480:(ow-iw)/2:(oh-ih)/2,fps=24,trim=end_frame=120,setpts=PTS-STARTPTS",
      "-frames:v", "120", "-an", "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", destination,
    ]);
    normalized.push(destination);
  }
  await mkdir(dirname(outputPath), { recursive: true });
  await execFileAsync("ffmpeg", [
    "-v", "error", "-y",
    "-i", normalized[0]!, "-i", normalized[1]!, "-i", normalized[2]!,
    "-loop", "1", "-framerate", "24", "-i", finalPanel,
    "-filter_complex",
    "[0:v]trim=start_frame=0:end_frame=120,setpts=PTS-STARTPTS[v0];" +
    "[1:v]trim=start_frame=1:end_frame=120,setpts=PTS-STARTPTS[v1];" +
    "[2:v]trim=start_frame=1:end_frame=120,setpts=PTS-STARTPTS[v2];" +
    "[3:v]scale=480:480:force_original_aspect_ratio=decrease,pad=480:480:(ow-iw)/2:(oh-ih)/2,trim=end_frame=2,setpts=PTS-STARTPTS[v3];" +
    "[v0][v1][v2][v3]concat=n=4:v=1:a=0,fps=24[v]",
    "-map", "[v]", "-frames:v", "360", "-an", "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", outputPath,
  ]);
  const mediaProbe = await probe(outputPath);
  const receiptPath = `${outputPath}.receipt.json`;
  await writeJsonAtomic(receiptPath, {
    schemaVersion: 1,
    requestHash,
    inputHashes: hashes,
    normalizedClips: normalized.map((path) => path.slice(projectDirectory.length + 1)),
    assembly: {
      clipFrames: [120, 119, 119],
      finalHoldFrames: 2,
      totalFrames: 360,
      fps: 24,
      durationSeconds: 15,
      audio: false,
    },
    probe: mediaProbe,
    outputHash: await sha256File(outputPath),
  });
  return { outputPath, receiptPath };
}
