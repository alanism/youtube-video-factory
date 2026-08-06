import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const textExtensions = new Set([".ts", ".mjs", ".md", ".json", ".yaml", ".yml", ".html", ".txt", ".example"]);
const excluded = new Set(["node_modules", ".git", "dist", "snapshots", "validation"]);

async function files(directory: string): Promise<string[]> {
  const result: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (excluded.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await files(path));
    else if (textExtensions.has(extname(entry.name)) || entry.name === ".env.example") result.push(path);
  }
  return result;
}

test("repository text contains no credential-shaped values or signed URLs", async () => {
  const findings: string[] = [];
  const patterns = [
    /sk-or-v1-[A-Za-z0-9_-]{20,}/,
    /sk_[A-Za-z0-9_-]{20,}/,
    /sk-[A-Za-z0-9_-]{20,}/,
    /X-Goog-Signature=/i,
    /[?&]token=[A-Za-z0-9._~-]{20,}/i,
  ];
  for (const path of await files(root)) {
    if (path.endsWith("tests/security/secrets.test.ts")) continue;
    const content = await readFile(path, "utf8");
    for (const pattern of patterns) if (pattern.test(content)) findings.push(`${path}: ${pattern.source}`);
  }
  assert.deepEqual(findings, []);
});
