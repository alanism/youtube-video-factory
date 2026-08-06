import { execFile } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { assertContained, sha256File, writeJsonAtomic } from "../core/files.js";

const execFileAsync = promisify(execFile);

interface Dimensions { width: number; height: number }
interface Bounds { start: number; end: number }

async function dimensions(path: string): Promise<Dimensions> {
  const { stdout } = await execFileAsync("ffprobe", [
    "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "json", path,
  ], { encoding: "utf8" });
  const parsed = JSON.parse(stdout) as { streams?: Dimensions[] };
  const value = parsed.streams?.[0];
  if (!value?.width || !value.height) throw new Error("Could not read contact-sheet dimensions.");
  return value;
}

function runs(values: boolean[]): Bounds[] {
  const result: Bounds[] = [];
  let start = -1;
  values.forEach((value, index) => {
    if (value && start < 0) start = index;
    if ((!value || index === values.length - 1) && start >= 0) {
      const end = value && index === values.length - 1 ? index + 1 : index;
      if (end - start >= 2) result.push({ start, end });
      start = -1;
    }
  });
  return result;
}

function selectCenterRun(candidates: Bounds[], size: number, label: string): Bounds {
  const center = size / 2;
  const ranked = candidates
    .filter((candidate) => candidate.start >= size * 0.35 && candidate.end <= size * 0.65)
    .sort((left, right) => Math.abs((left.start + left.end) / 2 - center) - Math.abs((right.start + right.end) / 2 - center));
  const selected = ranked[0];
  if (!selected) throw new Error(`No unambiguous near-white ${label} gutter was found. Supply explicit coordinates.`);
  if (ranked[1]) {
    const firstDistance = Math.abs((selected.start + selected.end) / 2 - center);
    const secondDistance = Math.abs((ranked[1].start + ranked[1].end) / 2 - center);
    if (Math.abs(firstDistance - secondDistance) < 2) {
      throw new Error(`Multiple ${label} gutter candidates are equally plausible. Supply explicit coordinates.`);
    }
  }
  return selected;
}

async function detectGutters(path: string, size: Dimensions): Promise<{ x: Bounds; y: Bounds }> {
  const { stdout } = await execFileAsync("ffmpeg", [
    "-v", "error", "-i", path, "-f", "rawvideo", "-pix_fmt", "rgb24", "-",
  ], { encoding: "buffer", maxBuffer: size.width * size.height * 3 + 1024 * 1024 });
  const data = Buffer.isBuffer(stdout) ? stdout : Buffer.from(stdout);
  const white = (offset: number) => (data[offset] ?? 0) >= 235 && (data[offset + 1] ?? 0) >= 235 && (data[offset + 2] ?? 0) >= 235;
  const columns = Array.from({ length: size.width }, (_, x) => {
    let count = 0;
    for (let y = 0; y < size.height; y += 1) if (white((y * size.width + x) * 3)) count += 1;
    return count / size.height >= 0.82;
  });
  const rows = Array.from({ length: size.height }, (_, y) => {
    let count = 0;
    for (let x = 0; x < size.width; x += 1) if (white((y * size.width + x) * 3)) count += 1;
    return count / size.width >= 0.82;
  });
  return { x: selectCenterRun(runs(columns), size.width, "vertical"), y: selectCenterRun(runs(rows), size.height, "horizontal") };
}

export interface SplitOptions {
  source: string;
  sheetId: string;
  outputDirectory: string;
  explicit?: { x: Bounds; y: Bounds };
}

export async function splitContactSheet(
  projectDirectory: string,
  options: SplitOptions,
): Promise<{ panelMapPath: string; panels: string[] }> {
  const source = assertContained(projectDirectory, join(projectDirectory, options.source));
  const outputDirectory = assertContained(projectDirectory, join(projectDirectory, options.outputDirectory));
  await mkdir(outputDirectory, { recursive: true });
  const size = await dimensions(source);
  const gutters = options.explicit ?? await detectGutters(source, size);
  if (gutters.x.start <= 0 || gutters.x.end >= size.width || gutters.y.start <= 0 || gutters.y.end >= size.height) {
    throw new Error("Gutter coordinates must fall inside the source image.");
  }
  const raw = [
    { x: 0, y: 0, width: gutters.x.start, height: gutters.y.start },
    { x: gutters.x.end, y: 0, width: size.width - gutters.x.end, height: gutters.y.start },
    { x: 0, y: gutters.y.end, width: gutters.x.start, height: size.height - gutters.y.end },
    { x: gutters.x.end, y: gutters.y.end, width: size.width - gutters.x.end, height: size.height - gutters.y.end },
  ];
  const panels: string[] = [];
  const records: Array<Record<string, unknown>> = [];
  for (const [index, crop] of raw.entries()) {
    const square = Math.min(crop.width, crop.height);
    const squareCrop = {
      x: crop.x + Math.floor((crop.width - square) / 2),
      y: crop.y + Math.floor((crop.height - square) / 2),
      width: square,
      height: square,
    };
    const filename = `panel-${String(index + 1).padStart(2, "0")}.png`;
    const destination = join(outputDirectory, filename);
    await execFileAsync("ffmpeg", [
      "-v", "error", "-y", "-i", source,
      "-vf", `crop=${squareCrop.width}:${squareCrop.height}:${squareCrop.x}:${squareCrop.y},scale=1024:1024:flags=lanczos`,
      "-frames:v", "1", destination,
    ]);
    panels.push(destination);
    records.push({
      id: `${options.sheetId}-panel-${index + 1}`,
      readingOrder: index + 1,
      crop: squareCrop,
      path: `${options.outputDirectory}/${filename}`,
      width: 1024,
      height: 1024,
      hash: await sha256File(destination),
    });
  }
  const panelMapPath = join(outputDirectory, "panel-map.json");
  await writeJsonAtomic(panelMapPath, {
    schemaVersion: 1,
    sheetId: options.sheetId,
    source: options.source,
    sourceHash: await sha256File(source),
    sourceDimensions: size,
    gutters,
    readingOrder: ["top-left", "top-right", "bottom-left", "bottom-right"],
    panels: records,
  });
  return { panelMapPath, panels };
}
