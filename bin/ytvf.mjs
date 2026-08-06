#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";

const binDirectory = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const entrypoint = resolve(binDirectory, "../src/cli.ts");
const tsxLoader = require.resolve("tsx/esm");
const result = spawnSync(
  process.execPath,
  ["--import", tsxLoader, entrypoint, ...process.argv.slice(2)],
  { stdio: "inherit", env: process.env },
);

process.exit(result.status ?? 1);
