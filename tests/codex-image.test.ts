import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { initializeProject } from "../src/core/project.js";
import { completeCodexImageTask, createCodexImageTask } from "../src/providers/codex-image.js";
import { sha256File } from "../src/core/files.js";

test("Codex image tasks are deterministic and require no API credential", async () => {
  const root = await mkdtemp(join(tmpdir(), "ytvf-image-"));
  const project = await initializeProject(join(root, "project"), "Image");
  const input = {
    id: "01-primary",
    prompt: "An editorial illustration",
    references: [{ path: "references/quarantine/style.png", role: "style", hash: "a".repeat(64) }],
    outputPath: "assets/generated/01-primary.png",
  };
  const first = await createCodexImageTask(project, input);
  const second = await createCodexImageTask(project, input);
  assert.deepEqual(second, first);
  assert.equal(first.generationMode, "codex-built-in-imagegen");
  const output = join(project, first.outputPath);
  await writeFile(output, Buffer.from("generated-image"));
  const complete = await completeCodexImageTask(project, first.id, await sha256File(output));
  assert.equal(complete.status, "complete");
  assert.match(complete.outputHash!, /^[a-f0-9]{64}$/);
});
