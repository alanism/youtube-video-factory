import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { promisify } from "node:util";
import type { CostEstimate, ProviderAdapter, ProviderContext, ProviderJob } from "../types.js";
import { canonicalHash, writeJsonAtomic } from "../core/files.js";
import { claimProviderJob, recordProviderJob } from "./ledger.js";

const execFileAsync = promisify(execFile);

export interface HeyGenAvatarRequest {
  avatarId: string;
  audioPath?: string;
  audioDurationSeconds: number;
  outputPath: string;
  script?: string;
  voiceId?: string;
  engine?: "avatar_iii" | "avatar_iv";
  resolution?: "720p" | "1080p";
  aspectRatio?: "16:9" | "9:16" | "1:1";
  outputFormat?: "webm" | "mp4";
  title?: string;
}

function findValue(value: unknown, keys: string[]): unknown {
  if (!value || typeof value !== "object") return undefined;
  for (const key of keys) {
    const child = (value as Record<string, unknown>)[key];
    if (child !== undefined && child !== null) return child;
  }
  for (const child of Object.values(value as Record<string, unknown>)) {
    const found = findValue(child, keys);
    if (found !== undefined) return found;
  }
  return undefined;
}

export class HeyGenCliAdapter implements ProviderAdapter<HeyGenAvatarRequest> {
  readonly id = "heygen";
  constructor(private readonly executable = process.env.HEYGEN_CLI_PATH ?? join(process.env.HOME ?? "", ".local/bin/heygen")) {}

  private async run(arguments_: string[]): Promise<Record<string, unknown>> {
    if (!existsSync(this.executable)) throw new Error(`HeyGen CLI is not installed at ${this.executable}.`);
    const { stdout } = await execFileAsync(this.executable, arguments_, {
      env: { ...process.env, HEYGEN_OUTPUT:"json" },
      maxBuffer:10 * 1024 * 1024,
    });
    return JSON.parse(stdout) as Record<string, unknown>;
  }

  async verifyAccess(request: HeyGenAvatarRequest): Promise<Record<string, unknown>> {
    const [auth, avatar] = await Promise.all([
      this.run(["auth","status"]),
      this.run(["avatar","get",request.avatarId]),
    ]);
    return {
      provider:this.id,
      authenticated:Boolean(findValue(auth,["authenticated","is_authenticated","logged_in"]) ?? true),
      billingMode:findValue(auth,["billing_mode","billingMode","auth_method","authMethod"]) ?? "account-configured",
      account:findValue(auth,["email","account_email","user_id","userId"]) ?? "verified",
      plan:findValue(auth,["plan","plan_name","subscription"]) ?? "not reported",
      credits:findValue(auth,["credits","remaining_credits","credit_balance"]) ?? "not reported",
      avatarId:findValue(avatar,["id","avatar_id"]),
      verified:true,
    };
  }

  async estimate(request: HeyGenAvatarRequest): Promise<CostEstimate> {
    const rate = request.engine === "avatar_iv" ? 6 : 3;
    return {
      provider:this.id,
      currency:"credits",
      amount:(request.audioDurationSeconds / 60) * rate,
      basis:`published planning rate of ${rate} credits/minute; account settlement is authoritative`,
      authoritative:false,
    };
  }

  async submit(request: HeyGenAvatarRequest, context: ProviderContext): Promise<ProviderJob> {
    if (!request.audioPath && !(request.script && request.voiceId)) throw new Error("HeyGen requires either an approved audio master or script plus HeyGen voice ID.");
    const canonical = {
      avatarId:request.avatarId,
      audioDurationSeconds:request.audioDurationSeconds,
      engine:request.engine ?? "avatar_iii",
      resolution:request.resolution ?? "1080p",
      aspectRatio:request.aspectRatio ?? "16:9",
      outputFormat:request.outputFormat ?? "webm",
      ...(request.audioPath ? { audioPath:request.audioPath } : { script:request.script, voiceId:request.voiceId }),
    };
    const claim = await claimProviderJob(context.projectDirectory, this.id, canonical);
    if (claim.reused && claim.jobId) return claim;
    if (context.dryRun) return claim;
    let assetId: string | undefined;
    if (request.audioPath) {
      const upload = await this.run(["asset","create","--file",request.audioPath]);
      assetId = String(findValue(upload,["asset_id","assetId","id"]) ?? "");
      if (!assetId) throw new Error("HeyGen returned no audio asset ID.");
    }
    const requestPath = join(context.projectDirectory,"provider-records",`heygen-${claim.requestHash}.request.json`);
    const payload = {
      type:"avatar",
      avatar_id:request.avatarId,
      ...(assetId ? { audio_asset_id:assetId } : { script:request.script, voice_id:request.voiceId }),
      engine:{ type:request.engine ?? "avatar_iii" },
      resolution:request.resolution ?? "1080p",
      aspect_ratio:request.aspectRatio ?? "16:9",
      fit:"contain",
      output_format:request.outputFormat ?? "webm",
      title:request.title ?? "YouTube Video Factory presenter",
    };
    await writeJsonAtomic(requestPath, payload);
    const created = await this.run(["video","create","-d",requestPath]);
    const videoId = String(findValue(created,["video_id","videoId","id"]) ?? "");
    if (!videoId) throw new Error("HeyGen returned no video ID.");
    const job: ProviderJob = {
      provider:this.id,
      requestHash:claim.requestHash,
      jobId:videoId,
      state:"running",
      usage:{ ...(assetId ? { audioAssetId:assetId } : { voiceId:request.voiceId ?? "" }), requestHash:canonicalHash(payload) },
    };
    await recordProviderJob(context.projectDirectory, this.id, job);
    return job;
  }

  async status(job: ProviderJob, context: ProviderContext): Promise<ProviderJob> {
    const details = await this.run(["video","get",job.jobId]);
    const rawStatus = String(findValue(details,["status"]) ?? "").toLowerCase();
    const state = ["completed","success","succeeded","ready"].includes(rawStatus) ? "complete" : ["failed","error","cancelled","canceled"].includes(rawStatus) ? "failed" : "running";
    const next: ProviderJob = {
      ...job,
      state,
      ...(state === "failed" ? { error:String(findValue(details,["error_message","message"]) ?? "HeyGen generation failed") } : {}),
      usage:{
        ...(job.usage ?? {}),
        ...(findValue(details,["duration","duration_seconds","durationSeconds"]) !== undefined ? { generatedSeconds:Number(findValue(details,["duration","duration_seconds","durationSeconds"])) } : {}),
      },
    };
    await recordProviderJob(context.projectDirectory, this.id, next);
    return next;
  }

  async download(job: ProviderJob, destination: string, context: ProviderContext): Promise<ProviderJob> {
    if (job.state !== "complete") throw new Error("HeyGen job is not complete.");
    await mkdir(dirname(destination), { recursive:true });
    await this.run(["video","download",job.jobId,"--output-path",destination,"--force"]);
    const next = { ...job, outputPath:relative(context.projectDirectory, destination) };
    await recordProviderJob(context.projectDirectory, this.id, next);
    return next;
  }
}
