import test from "node:test";
import assert from "node:assert/strict";
import { allPalettes, designPacks, layouts, palettes, typographies } from "../src/design/registry.js";

test("ships the complete YouTube design registry", () => {
  assert.equal(layouts.length, 17);
  assert.equal(palettes.length, 31);
  assert.equal(allPalettes.length, 32);
  assert.equal(typographies.length, 5);
  assert.ok(designPacks.some((pack) => pack.id === "ivory-dusk-editorial"));
  assert.equal(new Set(layouts.map((layout) => layout.id)).size, 17);
});

test("every layout frame stays within 1920x1080", () => {
  for (const layout of layouts) {
    assert.ok(Object.keys(layout.frames).length > 0, layout.id);
    for (const [name, frame] of Object.entries(layout.frames)) {
      assert.ok(frame.x >= 0 && frame.y >= 0, `${layout.id}.${name} origin`);
      assert.ok(frame.width > 0 && frame.height > 0, `${layout.id}.${name} size`);
      assert.ok(frame.x + frame.width <= 1920, `${layout.id}.${name} width`);
      assert.ok(frame.y + frame.height <= 1080, `${layout.id}.${name} height`);
    }
  }
});
