import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { initializeProject } from "../src/core/project.js";
import { serveBriefEditor } from "../src/core/brief-html.js";

const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64");

test("localhost brief editor saves Markdown and quarantines references", async () => {
  const root = await mkdtemp(join(tmpdir(), "ytvf-editor-"));
  const project = await initializeProject(join(root, "project"), "Editor");
  const editor = await serveBriefEditor(project, 0);
  try {
    const page = await fetch(editor.url);
    assert.equal(page.status, 200);
    const html = await page.text();
    assert.match(html, /Reference files/);
    assert.match(html, /Prompt and copy drafts/);
    assert.match(html, /Image prompt draft/);
    assert.match(html, /Video prompt draft/);
    assert.match(html, /Copywriting \/ script context/);
    const brief = await readFile(join(project, "PRODUCTION_BRIEF.md"), "utf8");
    const save = await fetch(new URL("/api/brief", editor.url), { method: "PUT", body: brief });
    assert.equal(save.status, 204);
    const intake = await fetch(new URL("/api/references", editor.url), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "style.png",
        contentBase64: png.toString("base64"),
        role: "style",
        provenance: "User supplied",
      }),
    });
    assert.equal(intake.status, 201);
    const draft = await fetch(new URL("/api/text-reference", editor.url), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: "Scene 01 image prompt",
        content: "Create a warm editorial image with a clear subject and no text.",
        draftType: "image",
        role: "prompt-draft",
        provenance: "User typed in brief editor",
      }),
    });
    assert.equal(draft.status, 201);
    const copyDraft = await fetch(new URL("/api/text-reference", editor.url), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: "Intro copy notes",
        content: "Open with the viewer problem, then state the transformation.",
        draftType: "copy",
        role: "copy-context",
        provenance: "User typed in brief editor",
      }),
    });
    assert.equal(copyDraft.status, 201);
    const registry = JSON.parse(await readFile(join(project, "references/reference-registry.json"), "utf8")) as {
      references: Array<{ role: string; mime: string; path: string }>;
    };
    assert.equal(registry.references.length, 3);
    assert.equal(registry.references.filter((reference) => reference.role === "prompt-draft").length, 1);
    assert.equal(registry.references.filter((reference) => reference.role === "copy-context").length, 1);
    assert.ok(registry.references.every((reference) => reference.path.startsWith("references/quarantine/")));
  } finally {
    await editor.close();
  }
});
