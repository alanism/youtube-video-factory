import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname, relative } from "node:path";
import type { CostEstimate, ProviderAdapter, ProviderContext, ProviderJob } from "../types.js";
import { canonicalHash, writeJsonAtomic } from "../core/files.js";
import { claimProviderJob, recordProviderJob } from "./ledger.js";

export interface ElevenLabsRequest {
  voiceId: string;
  text: string;
  outputPath: string;
  alignmentPath: string;
  modelId?: string;
  outputFormat?: string;
  languageCode?: string;
  previousText?: string;
  nextText?: string;
  seed?: number;
  voiceSettings?: {
    speed: number;
    stability: number;
    similarityBoost: number;
    style: number;
    useSpeakerBoost: boolean;
  };
}

interface ElevenLabsResult {
  audio_base64?: string;
  normalized_alignment?: Alignment;
  alignment?: Alignment;
}

interface Alignment {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}

export function validateAlignment(alignment: Alignment): void {
  const { characters, character_start_times_seconds: starts, character_end_times_seconds: ends } = alignment;
  if (!Array.isArray(characters) || characters.length === 0 || characters.length !== starts.length || starts.length !== ends.length) {
    throw new Error("ElevenLabs alignment arrays are missing or inconsistent.");
  }
  for (let index = 0; index < starts.length; index += 1) {
    const start = starts[index];
    const end = ends[index];
    if (start === undefined || end === undefined || !Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end < start) {
      throw new Error(`Invalid ElevenLabs alignment at character ${index}.`);
    }
  }
}

export function wordsFromAlignment(alignment: Alignment): Array<{ text: string; start: number; end: number }> {
  const words: Array<{ text: string; start: number; end: number }> = [];
  let text = "";
  let start = 0;
  let end = 0;
  alignment.characters.forEach((character, index) => {
    if (/\s/u.test(character)) {
      if (text) words.push({ text, start, end });
      text = "";
      return;
    }
    if (!text) start = alignment.character_start_times_seconds[index] ?? 0;
    text += character;
    end = alignment.character_end_times_seconds[index] ?? start;
  });
  if (text) words.push({ text, start, end });
  return words;
}

export function phraseCaptions(words: Array<{ text: string; start: number; end: number }>) {
  const captions: Array<{ id: string; text: string; start: number; end: number }> = [];
  for (let offset = 0; offset < words.length;) {
    const remaining = words.length - offset;
    const size = remaining <= 6 ? remaining : 5;
    const slice = words.slice(offset, offset + size);
    const first = slice[0];
    const last = slice.at(-1);
    if (!first || !last) break;
    captions.push({
      id: `caption-${String(captions.length + 1).padStart(2, "0")}`,
      text: slice.map((word) => word.text).join(" "),
      start: first.start,
      end: last.end,
    });
    offset += size;
  }
  return captions;
}

export class ElevenLabsAdapter implements ProviderAdapter<ElevenLabsRequest> {
  readonly id = "elevenlabs";
  constructor(
    private readonly fetchImplementation: typeof fetch = fetch,
    private readonly baseUrl = "https://api.elevenlabs.io/v1",
  ) {}

  private apiKey(): string {
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) throw new Error("ELEVENLABS_API_KEY is required in the process environment.");
    return key;
  }

  async verifyAccess(request: ElevenLabsRequest): Promise<Record<string, unknown>> {
    const headers = { "xi-api-key": this.apiKey() };
    const [voiceResponse, subscriptionResponse] = await Promise.all([
      this.fetchImplementation(`${this.baseUrl}/voices/${encodeURIComponent(request.voiceId)}`, { headers }),
      this.fetchImplementation(`${this.baseUrl}/user/subscription`, { headers }),
    ]);
    if (!voiceResponse.ok) throw new Error(`ElevenLabs voice verification failed (${voiceResponse.status}).`);
    if (!subscriptionResponse.ok) throw new Error(`ElevenLabs subscription verification failed (${subscriptionResponse.status}).`);
    const voice = await voiceResponse.json() as Record<string, unknown>;
    const subscription = await subscriptionResponse.json() as Record<string, unknown>;
    const characterCount = Number(subscription.character_count);
    const characterLimit = Number(subscription.character_limit);
    return {
      provider: this.id,
      voiceId: voice.voice_id ?? request.voiceId,
      tier: subscription.tier ?? "not reported",
      status: subscription.status ?? "not reported",
      ...(Number.isFinite(characterCount) ? { characterCount } : {}),
      ...(Number.isFinite(characterLimit) ? { characterLimit } : {}),
      ...(Number.isFinite(characterCount) && Number.isFinite(characterLimit) ? { remainingCharacters: characterLimit - characterCount } : {}),
      verified: true,
    };
  }

  async estimate(request: ElevenLabsRequest): Promise<CostEstimate> {
    return {
      provider: this.id,
      currency: "characters",
      amount: [...request.text].length,
      basis: "characters submitted for speech generation",
      authoritative: false,
    };
  }

  async submit(request: ElevenLabsRequest, context: ProviderContext): Promise<ProviderJob> {
    const canonicalRequest = {
      voiceId: request.voiceId,
      text: request.text,
      modelId: request.modelId ?? "eleven_flash_v2_5",
      outputFormat: request.outputFormat ?? "mp3_44100_128",
      languageCode: request.languageCode ?? "en",
      seed: request.seed ?? 1729,
      voiceSettings: request.voiceSettings ?? {
        speed: 0.92,
        stability: 0.65,
        similarityBoost: 0.75,
        style: 0,
        useSpeakerBoost: true,
      },
    };
    const claim = await claimProviderJob(context.projectDirectory, this.id, canonicalRequest);
    if (claim.reused && claim.jobId) return claim;
    if (context.dryRun) return { ...claim, state: "submitted" };
    const response = await this.fetchImplementation(
      `${this.baseUrl}/text-to-speech/${encodeURIComponent(request.voiceId)}/with-timestamps?output_format=${encodeURIComponent(canonicalRequest.outputFormat)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "xi-api-key": this.apiKey() },
        body: JSON.stringify({
          text: request.text,
          model_id: canonicalRequest.modelId,
          language_code: canonicalRequest.languageCode,
          voice_settings: {
            speed: canonicalRequest.voiceSettings.speed,
            stability: canonicalRequest.voiceSettings.stability,
            similarity_boost: canonicalRequest.voiceSettings.similarityBoost,
            style: canonicalRequest.voiceSettings.style,
            use_speaker_boost: canonicalRequest.voiceSettings.useSpeakerBoost,
          },
          seed: canonicalRequest.seed,
          apply_text_normalization: "auto",
          ...(request.previousText ? { previous_text: request.previousText } : {}),
          ...(request.nextText ? { next_text: request.nextText } : {}),
        }),
      },
    );
    if (!response.ok) throw new Error(`ElevenLabs generation failed (${response.status}): ${await response.text()}`);
    const result = await response.json() as ElevenLabsResult;
    if (!result.audio_base64) throw new Error("ElevenLabs returned no audio.");
    const alignment = result.normalized_alignment ?? result.alignment;
    if (!alignment) throw new Error("ElevenLabs returned no alignment.");
    validateAlignment(alignment);
    const words = wordsFromAlignment(alignment);
    const captions = phraseCaptions(words);
    await mkdir(dirname(request.outputPath), { recursive: true });
    await mkdir(dirname(request.alignmentPath), { recursive: true });
    const temporaryAudio = `${request.outputPath}.part`;
    await writeFile(temporaryAudio, Buffer.from(result.audio_base64, "base64"), { mode: 0o600 });
    await rename(temporaryAudio, request.outputPath);
    await writeJsonAtomic(request.alignmentPath, {
      schemaVersion: 1,
      requestHash: canonicalHash(canonicalRequest),
      alignment,
      words,
      captions,
    });
    const job: ProviderJob = {
      provider: this.id,
      requestHash: claim.requestHash,
      jobId: response.headers.get("request-id") ?? claim.requestHash,
      state: "complete",
      outputPath: relative(context.projectDirectory, request.outputPath),
      usage: { characters: [...request.text].length },
    };
    await recordProviderJob(context.projectDirectory, this.id, job);
    return job;
  }

  async status(job: ProviderJob): Promise<ProviderJob> {
    return job;
  }

  async download(job: ProviderJob): Promise<ProviderJob> {
    return job;
  }
}
