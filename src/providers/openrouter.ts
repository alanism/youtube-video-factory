import { mkdir, writeFile } from "node:fs/promises";
import { dirname, relative } from "node:path";
import type { CostEstimate, ProviderAdapter, ProviderContext, ProviderJob } from "../types.js";
import { claimProviderJob, recordProviderJob } from "./ledger.js";

export interface OpenRouterVideoRequest {
  model: string;
  prompt: string;
  duration: number;
  resolution: string;
  aspectRatio: string;
  firstFrameUrl?: string;
  lastFrameUrl?: string;
  generateAudio?: boolean;
  seed?: number;
  outputPath: string;
}

interface OpenRouterModel {
  id: string;
  canonical_slug?: string;
  supported_durations?: number[];
  supported_resolutions?: string[];
  supported_aspect_ratios?: string[];
  supported_frame_images?: string[];
  pricing_skus?: Record<string, string | number>;
}

interface OpenRouterJobResponse {
  id?: string;
  status?: string;
  usage?: { cost?: number; is_byok?: boolean };
  error?: { code?: string; message?: string };
}

export class OpenRouterVideoAdapter implements ProviderAdapter<OpenRouterVideoRequest> {
  readonly id = "openrouter";
  constructor(
    private readonly fetchImplementation: typeof fetch = fetch,
    private readonly baseUrl = "https://openrouter.ai/api/v1",
  ) {}

  private apiKey(): string {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) throw new Error("OPENROUTER_API_KEY is required in the process environment.");
    return key;
  }

  private async request(path: string, init: RequestInit = {}, authenticated = true): Promise<Response> {
    const response = await this.fetchImplementation(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(authenticated ? { Authorization: `Bearer ${this.apiKey()}` } : {}),
        ...(init.headers ?? {}),
      },
    });
    if (!response.ok) throw new Error(`OpenRouter ${path} failed (${response.status}): ${await response.text()}`);
    return response;
  }

  async discoverCapabilities(): Promise<OpenRouterModel[]> {
    const response = await this.request("/videos/models", {}, false);
    return ((await response.json()) as { data?: OpenRouterModel[] }).data ?? [];
  }

  async verifyAccess(request: OpenRouterVideoRequest): Promise<Record<string, unknown>> {
    const [modelsResponse, creditsResponse] = await Promise.all([
      this.discoverCapabilities(),
      this.request("/credits"),
    ]);
    const model = modelsResponse.find((item) => item.id === request.model);
    if (!model) throw new Error(`OpenRouter model is unavailable: ${request.model}`);
    const credits = await creditsResponse.json() as Record<string, unknown>;
    return { provider: this.id, model: model.id, credits, verified: true };
  }

  async estimate(request: OpenRouterVideoRequest): Promise<CostEstimate> {
    const models = await this.discoverCapabilities();
    const model = models.find((item) => item.id === request.model);
    if (!model) throw new Error(`OpenRouter model is unavailable: ${request.model}`);
    const perSecond = Number(model.pricing_skus?.["per-video-second"]);
    if (Number.isFinite(perSecond)) {
      return { provider:this.id, currency:"USD", amount:perSecond * request.duration, basis:"live per-video-second SKU", authoritative:true };
    }
    const perToken = Number(model.pricing_skus?.video_tokens_without_audio);
    if (Number.isFinite(perToken)) {
      const dimensions = request.resolution === "480p" ? [480,480] : [720,720];
      const tokens = (dimensions[0]! * dimensions[1]! * request.duration * 24) / 1024;
      return { provider:this.id, currency:"USD", amount:tokens * perToken, basis:"live silent-video token SKU at 24 fps", authoritative:false };
    }
    return { provider:this.id, currency:"unknown", amount:Number.NaN, basis:"pricing unavailable", authoritative:false };
  }

  async submit(request: OpenRouterVideoRequest, context: ProviderContext): Promise<ProviderJob> {
    const canonical = {
      model:request.model,
      prompt:request.prompt,
      duration:request.duration,
      resolution:request.resolution,
      aspectRatio:request.aspectRatio,
      firstFrameUrl:request.firstFrameUrl,
      lastFrameUrl:request.lastFrameUrl,
      generateAudio:request.generateAudio ?? false,
      seed:request.seed ?? 1729,
    };
    const claim = await claimProviderJob(context.projectDirectory, this.id, canonical);
    if (claim.reused && claim.jobId) return claim;
    if (context.dryRun) return claim;
    const frameImages = [
      ...(request.firstFrameUrl ? [{ type:"image_url", image_url:{ url:request.firstFrameUrl }, frame_type:"first_frame" }] : []),
      ...(request.lastFrameUrl ? [{ type:"image_url", image_url:{ url:request.lastFrameUrl }, frame_type:"last_frame" }] : []),
    ];
    const response = await this.request("/videos", {
      method:"POST",
      body:JSON.stringify({
        model:request.model,
        prompt:request.prompt,
        duration:request.duration,
        resolution:request.resolution,
        aspect_ratio:request.aspectRatio,
        ...(frameImages.length ? { frame_images:frameImages } : {}),
        generate_audio:request.generateAudio ?? false,
        seed:request.seed ?? 1729,
      }),
    });
    const submitted = await response.json() as OpenRouterJobResponse;
    if (!submitted.id) throw new Error("OpenRouter returned no video job ID.");
    const job: ProviderJob = {
      provider:this.id,
      requestHash:claim.requestHash,
      jobId:submitted.id,
      state:submitted.status === "completed" ? "complete" : "running",
    };
    await recordProviderJob(context.projectDirectory, this.id, job);
    return job;
  }

  async status(job: ProviderJob, context: ProviderContext): Promise<ProviderJob> {
    const response = await this.request(`/videos/${encodeURIComponent(job.jobId)}`);
    const current = await response.json() as OpenRouterJobResponse;
    const state = current.status === "completed" ? "complete" : current.status === "failed" || current.status === "cancelled" ? "failed" : "running";
    const next: ProviderJob = {
      ...job,
      state,
      ...(current.error?.message ? { error:current.error.message } : {}),
      ...(current.usage ? { usage:{ ...(current.usage.cost !== undefined ? { cost:current.usage.cost } : {}), ...(current.usage.is_byok !== undefined ? { isByok:current.usage.is_byok } : {}) } } : {}),
    };
    await recordProviderJob(context.projectDirectory, this.id, next);
    return next;
  }

  async download(job: ProviderJob, destination: string, context: ProviderContext): Promise<ProviderJob> {
    if (job.state !== "complete") throw new Error("OpenRouter job is not complete.");
    const response = await this.request(`/videos/${encodeURIComponent(job.jobId)}/content?index=0`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    await mkdir(dirname(destination), { recursive:true });
    await writeFile(destination, bytes, { mode:0o600 });
    const next = { ...job, outputPath:relative(context.projectDirectory, destination) };
    await recordProviderJob(context.projectDirectory, this.id, next);
    return next;
  }
}
