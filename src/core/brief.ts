import { readFile } from "node:fs/promises";
import { sha256, sanitizeIdentifier } from "./files.js";

export interface BriefScene {
  id: string;
  title: string;
  purpose: string;
  narration: string;
  layout?: string;
  visual?: string;
  supportingVisuals?: string[];
  durationSeconds?: number;
}

export interface ParsedBrief {
  raw: string;
  hash: string;
  frontmatter: Record<string, string | number | boolean | string[]>;
  title: string;
  summary: string;
  scenes: BriefScene[];
  missingDecisions: string[];
}

function parseScalar(raw: string): string | number | boolean | string[] {
  const value = raw.trim();
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  if (value.startsWith("[") && value.endsWith("]")) {
    return value
      .slice(1, -1)
      .split(",")
      .map((item) => item.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }
  return value.replace(/^["']|["']$/g, "");
}

function parseFrontmatter(raw: string): {
  values: Record<string, string | number | boolean | string[]>;
  body: string;
} {
  if (!raw.startsWith("---\n")) return { values: {}, body: raw };
  const end = raw.indexOf("\n---\n", 4);
  if (end < 0) throw new Error("Brief frontmatter is not closed with ---.");
  const values: Record<string, string | number | boolean | string[]> = {};
  for (const line of raw.slice(4, end).split("\n")) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    const separator = line.indexOf(":");
    if (separator < 1) throw new Error(`Invalid frontmatter line: ${line}`);
    values[line.slice(0, separator).trim()] = parseScalar(line.slice(separator + 1));
  }
  return { values, body: raw.slice(end + 5) };
}

function field(block: string, name: string): string | undefined {
  const expression = new RegExp(`^${name}:\\s*(.+)$`, "im");
  return expression.exec(block)?.[1]?.trim();
}

function parseScenes(body: string): BriefScene[] {
  const headers = [...body.matchAll(/^##\s+Scene\s+([^:\n]+):?\s*(.*)$/gim)];
  return headers.map((header, index) => {
    const start = (header.index ?? 0) + header[0].length;
    const end = headers[index + 1]?.index ?? body.length;
    const block = body.slice(start, end).trim();
    const rawId = header[1]?.trim() || String(index + 1);
    const title = header[2]?.trim() || field(block, "Title") || `Scene ${rawId}`;
    const layout = field(block, "Layout");
    const visual = field(block, "Visual");
    const supportingVisuals = [field(block, "Visual2") ?? field(block, "Visual 2"), field(block, "Visual3") ?? field(block, "Visual 3")].filter((value): value is string => Boolean(value));
    const duration = field(block, "Duration");
    return {
      id: sanitizeIdentifier(rawId),
      title,
      purpose: field(block, "Purpose") ?? title,
      narration: field(block, "Narration") ?? "",
      ...(layout ? { layout } : {}),
      ...(visual ? { visual } : {}),
      ...(supportingVisuals.length ? { supportingVisuals } : {}),
      ...(duration
        ? { durationSeconds: Number(duration.replace(/s$/i, "")) }
        : {}),
    };
  });
}

export function parseBrief(raw: string): ParsedBrief {
  const { values, body } = parseFrontmatter(raw.replaceAll("\r\n", "\n"));
  const title = /^#\s+(.+)$/m.exec(body)?.[1]?.trim() ?? String(values.title ?? "Untitled Video");
  const summary =
    /^##\s+Summary\s*\n+([\s\S]*?)(?=\n##\s+|$)/im.exec(body)?.[1]?.trim() ?? "";
  const scenes = parseScenes(body);
  const missingDecisions: string[] = [];
  const required = ["audience", "deliverable", "designPack", "fps", "music", "captions", "providers", "costCeilingUsd"];
  for (const key of required) {
    if (values[key] === undefined || values[key] === "") missingDecisions.push(key);
  }
  const providers = Array.isArray(values.providers) ? values.providers : [];
  if ((values.voiceProvider === "elevenlabs" || providers.includes("elevenlabs")) && !values.voiceId) {
    missingDecisions.push("voiceId");
  }
  if (providers.includes("heygen") && !values.avatarId) missingDecisions.push("avatarId");
  if (providers.includes("openrouter") && !values.motionModel) missingDecisions.push("motionModel");
  if (scenes.length === 0) missingDecisions.push("scenes");
  if (scenes.some((scene) => !scene.narration)) missingDecisions.push("scene narration");
  return {
    raw,
    hash: sha256(raw),
    frontmatter: values,
    title,
    summary,
    scenes,
    missingDecisions: [...new Set(missingDecisions)],
  };
}

export async function readBrief(path: string): Promise<ParsedBrief> {
  return parseBrief(await readFile(path, "utf8"));
}
