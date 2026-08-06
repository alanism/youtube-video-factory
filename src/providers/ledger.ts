import { join } from "node:path";
import type { ProviderJob } from "../types.js";
import { canonicalHash, readJson, writeJsonAtomic } from "../core/files.js";

export interface JobLedger {
  schemaVersion: 1;
  jobs: ProviderJob[];
}

export async function claimProviderJob(
  projectDirectory: string,
  provider: string,
  request: unknown,
): Promise<ProviderJob & { reused: boolean }> {
  const ledgerPath = join(projectDirectory, "provider-records", `${provider}-jobs.json`);
  let ledger: JobLedger;
  try {
    ledger = await readJson<JobLedger>(ledgerPath);
  } catch {
    ledger = { schemaVersion: 1, jobs: [] };
  }
  const requestHash = canonicalHash(request);
  const existing = ledger.jobs.find((job) => job.requestHash === requestHash);
  if (existing) return { ...existing, reused: true };
  const job: ProviderJob = {
    provider,
    requestHash,
    jobId: "",
    state: "submitted",
  };
  ledger.jobs.push(job);
  ledger.jobs.sort((left, right) => left.requestHash.localeCompare(right.requestHash));
  await writeJsonAtomic(ledgerPath, ledger);
  return { ...job, reused: false };
}

export async function recordProviderJob(
  projectDirectory: string,
  provider: string,
  job: ProviderJob,
): Promise<void> {
  const ledgerPath = join(projectDirectory, "provider-records", `${provider}-jobs.json`);
  let ledger: JobLedger;
  try {
    ledger = await readJson<JobLedger>(ledgerPath);
  } catch {
    ledger = { schemaVersion: 1, jobs: [] };
  }
  const existing = ledger.jobs.find((item) => item.requestHash === job.requestHash);
  if (existing?.jobId && job.jobId && existing.jobId !== job.jobId) {
    throw new Error("Refusing to replace an existing provider job ID.");
  }
  const next = { ...(existing ?? {}), ...job };
  ledger.jobs = ledger.jobs.filter((item) => item.requestHash !== job.requestHash);
  ledger.jobs.push(next as ProviderJob);
  ledger.jobs.sort((left, right) => left.requestHash.localeCompare(right.requestHash));
  await writeJsonAtomic(ledgerPath, ledger);
}

export function assertPaidExecutionAllowed(
  costCeilingUsd: number,
  estimateUsd: number,
  approved: boolean,
): void {
  if (!approved) throw new Error("Paid provider request has not been approved.");
  if (costCeilingUsd <= 0) throw new Error("Manifest cost ceiling must be greater than zero.");
  if (!Number.isFinite(estimateUsd)) throw new Error("Provider estimate is not finite.");
  if (estimateUsd > costCeilingUsd) {
    throw new Error(`Estimated provider cost $${estimateUsd.toFixed(4)} exceeds the $${costCeilingUsd.toFixed(4)} ceiling.`);
  }
}
