import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { initializeProject } from "../src/core/project.js";
import { assertPaidExecutionAllowed, claimProviderJob, recordProviderJob } from "../src/providers/ledger.js";

test("canonical request claims prevent duplicate paid submissions", async () => {
  const root = await mkdtemp(join(tmpdir(), "ytvf-ledger-"));
  const project = await initializeProject(join(root, "project"), "Ledger");
  const request = { model: "test", duration: 5, prompt: "move" };
  const first = await claimProviderJob(project, "openrouter", request);
  assert.equal(first.reused, false);
  await recordProviderJob(project, "openrouter", { ...first, jobId: "job-123", state: "running" });
  const second = await claimProviderJob(project, "openrouter", { prompt: "move", duration: 5, model: "test" });
  assert.equal(second.reused, true);
  assert.equal(second.jobId, "job-123");
});

test("paid execution requires approval and respects the ceiling", () => {
  assert.throws(() => assertPaidExecutionAllowed(1, 0.5, false), /not been approved/);
  assert.throws(() => assertPaidExecutionAllowed(0.1, 0.2, true), /exceeds/);
  assert.doesNotThrow(() => assertPaidExecutionAllowed(1, 0.2, true));
});
