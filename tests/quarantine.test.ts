import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rename, symlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { initializeProject } from "../src/core/project.js";
import { approveReference, intakeReference } from "../src/core/quarantine.js";

const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64");

test("quarantines signed content and requires explicit approval", async () => {
  const root = await mkdtemp(join(tmpdir(), "ytvf-quarantine-"));
  const project = await initializeProject(join(root, "project"), "Quarantine");
  const record = await intakeReference(project, {
    name: "reference.png",
    contentBase64: png.toString("base64"),
    role: "style",
    provenance: "User supplied",
  });
  assert.equal(record.trust, "quarantined");
  const approved = await approveReference(project, record.id, "provider", ["openrouter"]);
  assert.equal(approved.trust, "approved-for-provider");
  assert.deepEqual(approved.approvedProviders, ["openrouter"]);
});

test("rejects traversal, active content, spoofed formats, and duplicates without residue", async () => {
  const root = await mkdtemp(join(tmpdir(), "ytvf-reject-"));
  const project = await initializeProject(join(root, "project"), "Reject");
  const base = { contentBase64: png.toString("base64"), role: "style" as const, provenance: "User supplied" };
  await assert.rejects(intakeReference(project, { ...base, name: "../escape.png" }), /Unsafe/);
  await assert.rejects(intakeReference(project, { ...base, name: "active.html" }), /not accepted/);
  await assert.rejects(intakeReference(project, { ...base, name: "spoof.jpg" }), /does not match/);
  await intakeReference(project, { ...base, name: "first.png" });
  await assert.rejects(intakeReference(project, { ...base, name: "duplicate.png" }), /Duplicate/);
  const registry = JSON.parse(await readFile(join(project, "references/reference-registry.json"), "utf8")) as { references: unknown[] };
  assert.equal(registry.references.length, 1);
});

test("refuses approval when a quarantined file is replaced by a symlink", async () => {
  const root = await mkdtemp(join(tmpdir(), "ytvf-symlink-"));
  const project = await initializeProject(join(root, "project"), "Symlink");
  const record = await intakeReference(project, {
    name: "reference.png",
    contentBase64: png.toString("base64"),
    role: "style",
    provenance: "User supplied",
  });
  const original = join(project, record.path!);
  const moved = `${original}.original`;
  await rename(original, moved);
  await symlink(moved, original);
  await assert.rejects(approveReference(project, record.id, "model"), /Symlinks are not allowed/);
});
