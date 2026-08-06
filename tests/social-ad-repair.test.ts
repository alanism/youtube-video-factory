import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { ProductionManifest } from "../src/types.js";

const project = resolve(import.meta.dirname, "../../projects/uncommon-core-join-the-server-vertical");

async function readManifest(path: string): Promise<ProductionManifest> {
  return JSON.parse(await readFile(path, "utf8")) as ProductionManifest;
}

test("social-ad repair variants retain proof cards, CTA hierarchy, and portrait delivery", async () => {
  const manifests = await Promise.all([
    readManifest(join(project, "versions/a-85/production-manifest.json")),
    readManifest(join(project, "versions/b-85/production-manifest.json")),
  ]);
  for (const manifest of manifests) {
    assert.equal(manifest.output.width, 1080);
    assert.equal(manifest.output.height, 1920);
    assert.equal(manifest.output.fps, 30);
    assert.equal(manifest.release.qualityGate.rubricMinimum, 85);
    for (const scene of manifest.scenes.slice(0, 3)) assert.ok(scene.proofCard, `scene ${scene.id} must prove its claim`);
    const cta = manifest.scenes[3]?.ctaCard;
    assert.equal(cta?.brand, "UnCommon Core");
    assert.equal(cta?.primary, "Join the Server.");
    assert.equal(cta?.secondary, "Download UnCommon Core.");
    assert.equal(manifest.scenes.some((scene) => /hook with|convert the dance|deliver one unambiguous/i.test(`${scene.title} ${scene.purpose}`)), false);
  }
});
