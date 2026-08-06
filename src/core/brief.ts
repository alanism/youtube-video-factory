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
  keyMessage: string;
  learnerOutcome: string;
  scenes: BriefScene[];
  missingDecisions: string[];
}

function firstSentence(value: string): string {
  return value.split(/(?<=[.!?])\s+/u)[0]?.trim() ?? value.trim();
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
  const expression = new RegExp(`^\\s*(?:-\\s*)?${name}:\\s*(.+)$`, "im");
  return expression.exec(block)?.[1]?.trim();
}

function parseScenes(body: string): BriefScene[] {
  const headers = [...body.matchAll(/^#{2,3}\s+Scene\s+([A-Za-z0-9][A-Za-z0-9_-]*)(?:\s*(?:—|-|:)\s*(.*))?$/gim)];
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
      narration: field(block, "Narration") ?? field(block, "Narration / copy") ?? "",
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
  for (const key of [
    "renditions", "narrationAuthority", "motionModel", "motionResolution", "motionAudio", "motionContract",
    "heygenMode", "avatarId", "heygenVoiceId", "avatarEngine", "heygenAlphaRequired", "landscapeTemplate",
    "portraitTemplate", "rubricMinimum", "minimumCriterionScore", "maxRepairCycles", "blockers", "voiceId",
  ]) {
    if (values[key] === undefined) {
      const explicit = field(body, key);
      if (explicit !== undefined) values[key] = parseScalar(explicit);
    }
  }
  if (values.narrationAuthority === undefined && values.voiceProvider !== undefined) values.narrationAuthority = values.voiceProvider;
  const title = /^#\s+(.+)$/m.exec(body)?.[1]?.trim() ?? String(values.title ?? "Untitled Video");
  const summary =
    /^##\s+Summary\s*\n+([\s\S]*?)(?=\n##\s+|$)/im.exec(body)?.[1]?.trim() ?? "";
  const scenes = parseScenes(body);
  const suppliedKeyMessage = field(body, "Key Message") ?? String(values.keyMessage ?? "");
  const suppliedOutcome = field(body, "Learner Outcome") ?? String(values.learnerOutcome ?? "");
  const keyMessage = suppliedKeyMessage || firstSentence(summary) || `${title}: ${scenes[0]?.purpose ?? "define the lesson before production"}.`;
  const learnerOutcome = suppliedOutcome || scenes.at(-1)?.purpose || scenes[0]?.purpose || "State the intended learner outcome before production.";
  const missingDecisions: string[] = [];
  const required = [
    "audience", "deliverable", "designPack", "fps", "music", "captions", "providers", "costCeilingUsd",
    "renditions", "narrationAuthority", "rubricMinimum",
    "minimumCriterionScore", "maxRepairCycles", "blockers",
  ];
  for (const key of required) {
    if (values[key] === undefined || values[key] === "") missingDecisions.push(key);
  }
  const renditions = Array.isArray(values.renditions) ? values.renditions : [];
  if (renditions.includes("16:9") && (values.landscapeTemplate === undefined || values.landscapeTemplate === "")) missingDecisions.push("landscapeTemplate");
  if (renditions.includes("9:16") && (values.portraitTemplate === undefined || values.portraitTemplate === "")) missingDecisions.push("portraitTemplate");
  const providers = Array.isArray(values.providers) ? values.providers : [];
  const narrationAuthority = values.narrationAuthority;
  if (narrationAuthority === "elevenlabs" && !values.voiceId) {
    missingDecisions.push("voiceId");
  }
  if (providers.includes("heygen")) {
    for (const key of ["heygenMode", "avatarId", "avatarEngine", "heygenAlphaRequired"]) {
      if (values[key] === undefined || values[key] === "") missingDecisions.push(key);
    }
    if (narrationAuthority !== "elevenlabs" && narrationAuthority !== "heygen") missingDecisions.push("narrationAuthority (ElevenLabs or HeyGen for HeyGen)");
    if (narrationAuthority === "heygen" && !values.heygenVoiceId) missingDecisions.push("heygenVoiceId");
  }
  if (providers.includes("openrouter")) {
    for (const key of ["motionModel", "motionResolution", "motionAudio", "motionContract"]) {
      if (values[key] === undefined || values[key] === "") missingDecisions.push(key);
    }
  }
  if (scenes.length === 0) missingDecisions.push("scenes");
  if (scenes.some((scene) => !scene.narration)) missingDecisions.push("scene narration");
  return {
    raw,
    hash: sha256(raw),
    frontmatter: values,
    title,
    summary,
    keyMessage,
    learnerOutcome,
    scenes,
    missingDecisions: [...new Set(missingDecisions)],
  };
}

export async function readBrief(path: string): Promise<ParsedBrief> {
  return parseBrief(await readFile(path, "utf8"));
}
