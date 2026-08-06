import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { access, mkdtemp, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { promisify } from "node:util";

const run = promisify(execFile);
const bin = resolve("bin/ytvf.mjs");

test("ytvf init creates a projects subfolder for simple project names", async () => {
  const root = await mkdtemp(join(tmpdir(), "ytvf-init-"));
  await run(process.execPath, [bin, "init", "sample-video", "--title", "Sample Video"], { cwd: root });
  const project = join(root, "projects/sample-video");
  await access(join(project, "start_here.html"));
  await access(join(project, "PRODUCTION_BRIEF.html"));
  const page = await readFile(join(project, "start_here.html"), "utf8");
  assert.match(page, /Open briefing page/);
  assert.match(page, /ytvf changes/);
});

test("ytvf init preserves explicit project paths", async () => {
  const root = await mkdtemp(join(tmpdir(), "ytvf-init-path-"));
  await run(process.execPath, [bin, "init", "custom/location", "--title", "Custom Location"], { cwd: root });
  await access(join(root, "custom/location/PRODUCTION_BRIEF.md"));
  await access(join(root, "custom/location/start_here.html"));
});
