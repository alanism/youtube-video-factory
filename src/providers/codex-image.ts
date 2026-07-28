import { join } from "node:path";
import { canonicalHash, readJson, writeJsonAtomic } from "../core/files.js";

export interface CodexImageTask {
  schemaVersion: 1;
  id: string;
  status: "awaiting-agent" | "complete" | "rejected";
  prompt: string;
  references: Array<{ path: string; role: string; hash: string }>;
  outputPath: string;
  width: 1024;
  height: 1024;
  quality: "high";
  generationMode: "codex-built-in-imagegen";
  outputHash?: string;
}

export async function createCodexImageTask(
  projectDirectory: string,
  task: Omit<CodexImageTask, "schemaVersion" | "status" | "generationMode" | "width" | "height" | "quality">,
): Promise<CodexImageTask> {
  const value: CodexImageTask = {
    schemaVersion:1,
    status:"awaiting-agent",
    generationMode:"codex-built-in-imagegen",
    width:1024,
    height:1024,
    quality:"high",
    ...task,
  };
  const path = join(projectDirectory,".ytvf","image-tasks",`${task.id}.json`);
  try {
    const existing = await readJson<CodexImageTask>(path);
    if (canonicalHash(existing) !== canonicalHash(value) && existing.status !== "complete") {
      throw new Error(`Image task already exists with different inputs: ${task.id}`);
    }
    return existing;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Image task already exists")) throw error;
  }
  await writeJsonAtomic(path,value);
  return value;
}

export async function completeCodexImageTask(
  projectDirectory: string,
  id: string,
  outputHash: string,
): Promise<CodexImageTask> {
  const path = join(projectDirectory,".ytvf","image-tasks",`${id}.json`);
  const task = await readJson<CodexImageTask>(path);
  const complete: CodexImageTask = { ...task, status:"complete", outputHash };
  await writeJsonAtomic(path,complete);
  return complete;
}
