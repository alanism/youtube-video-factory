import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import type { ReferenceRecord, ReferenceRole } from "../types.js";
import {
  assertContained,
  assertNoSymlink,
  canonicalHash,
  readJson,
  sanitizeIdentifier,
  sha256,
  writeJsonAtomic,
} from "./files.js";

const maximumBytes = 25 * 1024 * 1024;
const blockedExtensions = new Set([
  ".html", ".htm", ".svg", ".exe", ".dll", ".dylib", ".so", ".sh", ".zsh",
  ".bash", ".cmd", ".bat", ".app", ".jar", ".zip", ".gz", ".tar", ".7z",
]);

const signatures: Array<{ mime: string; extensions: string[]; test: (data: Buffer) => boolean }> = [
  { mime:"image/png", extensions:[".png"], test:(data)=>data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) },
  { mime:"image/jpeg", extensions:[".jpg",".jpeg"], test:(data)=>data[0]===0xff && data[1]===0xd8 && data[2]===0xff },
  { mime:"image/webp", extensions:[".webp"], test:(data)=>data.subarray(0,4).toString()==="RIFF" && data.subarray(8,12).toString()==="WEBP" },
  { mime:"video/mp4", extensions:[".mp4",".m4v"], test:(data)=>data.subarray(4,12).toString().includes("ftyp") },
  { mime:"audio/mpeg", extensions:[".mp3"], test:(data)=>data.subarray(0,3).toString()==="ID3" || (data[0]===0xff && (data[1]??0)>=0xe0) },
  { mime:"audio/wav", extensions:[".wav"], test:(data)=>data.subarray(0,4).toString()==="RIFF" && data.subarray(8,12).toString()==="WAVE" },
  { mime:"application/pdf", extensions:[".pdf"], test:(data)=>data.subarray(0,5).toString()==="%PDF-" },
  { mime:"text/markdown", extensions:[".md",".txt"], test:(data)=>!data.subarray(0,4096).includes(0) }
];

export interface IntakeRequest {
  name: string;
  contentBase64: string;
  role: ReferenceRole;
  provenance: string;
  license?: string;
}

export async function intakeReference(
  projectDirectory: string,
  request: IntakeRequest,
): Promise<ReferenceRecord> {
  const safeName = basename(request.name);
  if (safeName !== request.name || safeName.includes("..")) throw new Error("Unsafe reference filename.");
  const extension = extname(safeName).toLowerCase();
  if (blockedExtensions.has(extension)) throw new Error(`Active or archived content is not accepted: ${extension}`);
  const data = Buffer.from(request.contentBase64, "base64");
  if (data.byteLength === 0 || data.byteLength > maximumBytes) throw new Error("Reference is empty or exceeds 25 MB.");
  const signature = signatures.find((candidate) => candidate.test(data));
  if (!signature || !signature.extensions.includes(extension)) throw new Error("File extension does not match an approved file signature.");
  if (signature.mime === "application/pdf" && data.includes(Buffer.from("/JavaScript"))) {
    throw new Error("PDF with active JavaScript is not accepted.");
  }
  const hash = sha256(data);
  const id = `${sanitizeIdentifier(safeName.replace(extension, ""))}-${hash.slice(0, 12)}`;
  const registryPath = join(projectDirectory, "references/reference-registry.json");
  const registry = await readJson<{ schemaVersion: number; references: ReferenceRecord[] }>(registryPath);
  if (registry.references.some((item) => item.hash === hash)) {
    throw new Error(`Duplicate reference content: ${hash}`);
  }
  const destinationDirectory = assertContained(projectDirectory, join(projectDirectory, "references/quarantine"));
  await mkdir(destinationDirectory, { recursive: true });
  const destination = assertContained(destinationDirectory, join(destinationDirectory, `${id}${extension}`));
  await writeFile(destination, data, { flag: "wx", mode: 0o600 });
  const record: ReferenceRecord = {
    id,
    ontologyVersion: 1,
    lifecycle: "quarantined",
    originalName: safeName,
    path: `references/quarantine/${id}${extension}`,
    hash,
    role: request.role,
    mime: signature.mime,
    bytes: data.byteLength,
    provenance: request.provenance,
    ...(request.license ? { license: request.license } : {}),
    trust: "quarantined",
    modelUseAuthorized: false,
    providerEgressAuthorized: false,
    approvedProviders: [],
    relationships: {},
  };
  registry.references.push(record);
  registry.references.sort((left, right) => left.id.localeCompare(right.id));
  await writeJsonAtomic(registryPath, registry);
  return record;
}

export async function approveReference(
  projectDirectory: string,
  referenceId: string,
  mode: "model" | "provider",
  providers: string[] = [],
): Promise<ReferenceRecord> {
  const registryPath = join(projectDirectory, "references/reference-registry.json");
  const registry = await readJson<{ schemaVersion: number; references: ReferenceRecord[] }>(registryPath);
  const record = registry.references.find((item) => item.id === referenceId);
  if (!record) throw new Error(`Reference not found: ${referenceId}`);
  const source = assertContained(projectDirectory, join(projectDirectory, record.path ?? ""));
  await assertNoSymlink(source);
  const fileData = await readFile(source);
  const currentHash = sha256(fileData);
  if (currentHash !== record.hash) throw new Error("Reference content changed after intake.");
  const fileInfo = await stat(source);
  if (!fileInfo.isFile()) throw new Error("Reference is not a regular file.");
  record.lifecycle = mode === "provider" ? "approved-for-provider" : "approved-for-model";
  record.trust = record.lifecycle;
  record.modelUseAuthorized = true;
  record.providerEgressAuthorized = mode === "provider";
  record.approvedProviders = mode === "provider" ? [...new Set(providers)].sort() : [];
  await writeJsonAtomic(registryPath, registry);
  return record;
}

export function referenceApprovalHash(record: ReferenceRecord): string {
  return canonicalHash({
    id: record.id,
    hash: record.hash,
    trust: record.trust,
    providers: record.approvedProviders,
  });
}
