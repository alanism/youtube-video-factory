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
    assert.match(await page.text(), /Reference intake/);
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
  } finally {
    await editor.close();
  }
});
