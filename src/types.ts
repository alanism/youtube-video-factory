export type LifecycleState =
  | "draft"
  | "quarantined"
  | "reviewed"
  | "approved-for-model"
  | "approved-for-provider"
  | "planned"
  | "submitted"
  | "running"
  | "complete"
  | "failed"
  | "delivered";

export type ReferenceRole =
  | "style"
  | "identity"
  | "composition"
  | "palette"
  | "subject"
  | "copy-context"
  | "prompt-draft"
  | "source-media";

export interface OntologyRecord {
  id: string;
  ontologyVersion: 1;
  lifecycle: LifecycleState;
  hash?: string;
  path?: string;
  provenance?: string;
  relationships?: Record<string, string[]>;
}

export interface Frame {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutDefinition {
  id: string;
  purpose: string;
  sourcePages: number[];
  frames: Record<string, Frame>;
  media?: Array<{
    frame: string;
    aspect: "16:9" | "4:3" | "9:16" | "1:1" | "free";
    fit: "cover" | "contain";
  }>;
  presenterSafeZones?: Frame[];
}

export interface PaletteDefinition {
  id: string;
  label: string;
  group: "channel" | "inspiration" | "factory";
  colors: [string, string, string, string, string];
  primary: string;
  secondary: string;
  surface: string;
  ink: string;
  muted: string;
}

export interface TypographyDefinition {
  id: string;
  label: string;
  description: string;
  titleFamily: string;
  bodyFamily: string;
  captionFamily: string;
  monoFamily: string;
}

export interface MotionDefinition {
  id: string;
  transition: "editorial-push" | "blur-crossfade" | "dip-to-dusk";
  transitionDuration: number;
  entrance: "rise-fade" | "fade" | "none";
}

export interface DesignPack {
  id: string;
  label: string;
  palette: string;
  typography: string;
  defaultLayout: string;
  motion: string;
}

export type AssetCategory =
  | "image"
  | "video"
  | "audio"
  | "caption"
  | "presenter"
  | "prompt"
  | "contact-sheet"
  | "panel"
  | "motion-sequence";

export interface AssetRecord extends OntologyRecord {
  category: AssetCategory;
  mime?: string;
  durationSeconds?: number;
  width?: number;
  height?: number;
  provider?: string;
}

export interface CaptionPhrase {
  id: string;
  text: string;
  start: number;
  end: number;
}

export interface SceneManifest {
  id: string;
  title: string;
  purpose: string;
  layout: string;
  durationSeconds: number;
  narration?: {
    text: string;
    asset?: string;
    provider: "elevenlabs" | "existing" | "none";
  };
  captions?: CaptionPhrase[];
  primaryVisual?: {
    asset: string;
    fit?: "cover" | "contain";
  };
  supportingVisuals?: Array<{
    asset: string;
    fit?: "cover" | "contain";
  }>;
  presenter?: {
    mode:
      | "none"
      | "portrait-left-edge"
      | "circle-top-left"
      | "circle-top-right"
      | "circle-bottom-left"
      | "circle-bottom-right";
    asset?: string;
    provider?: "heygen" | "existing";
    muted?: boolean;
  };
  overlay?: {
    text: string;
  };
  transition?: string;
}

export interface ProductionManifest {
  schemaVersion: 1;
  ontologyVersion: 1;
  id: string;
  title: string;
  briefHash: string;
  approval: {
    status: "draft" | "approved";
    approvedHash?: string;
  };
  output: {
    width: 1920;
    height: 1080;
    fps: 24 | 30 | 60;
    quality: "draft" | "standard" | "high";
    codec: "h264";
    audioCodec: "aac";
    destination: string;
  };
  designPack: string;
  design: {
    pack: DesignPack;
    palette: PaletteDefinition;
    typography: TypographyDefinition;
    motion: MotionDefinition;
  };
  autonomy: "manual" | "review-gated" | "approved-batch";
  audio: {
    music: boolean;
    soundEffects: boolean;
    captions: "phrase" | "word" | "off";
    narrationAuthority: "elevenlabs" | "existing" | "none";
  };
  providers: {
    allowed: Array<"elevenlabs" | "heygen" | "openrouter" | "gcp-staging">;
    costCeilingUsd: number;
    paidPilotRequired: boolean;
    elevenlabs?: {
      voiceId: string;
      modelId: "eleven_flash_v2_5" | string;
      speed: number;
      stability: number;
      similarityBoost: number;
    };
    heygen?: {
      avatarId: string;
      engine: "avatar_iii" | "avatar_iv";
    };
    openrouter?: {
      model: string;
    };
  };
  scenes: SceneManifest[];
}

export interface CostEstimate {
  provider: string;
  currency: "USD" | "credits" | "characters" | "unknown";
  amount: number;
  basis: string;
  authoritative: boolean;
}

export interface ProviderJob {
  provider: string;
  requestHash: string;
  jobId: string;
  state: "submitted" | "running" | "complete" | "failed";
  outputPath?: string;
  error?: string;
  usage?: Record<string, number | string | boolean>;
}

export interface ProviderContext {
  projectDirectory: string;
  manifest: ProductionManifest;
  approvedRequestHash: string;
  dryRun: boolean;
}

export interface ProviderAdapter<TRequest> {
  readonly id: string;
  verifyAccess(request: TRequest): Promise<Record<string, unknown>>;
  estimate(request: TRequest): Promise<CostEstimate>;
  submit(request: TRequest, context: ProviderContext): Promise<ProviderJob>;
  status(job: ProviderJob, context: ProviderContext): Promise<ProviderJob>;
  download(job: ProviderJob, destination: string, context: ProviderContext): Promise<ProviderJob>;
}

export interface ReferenceRecord extends OntologyRecord {
  originalName: string;
  role: ReferenceRole;
  mime: string;
  bytes: number;
  trust:
    | "quarantined"
    | "reviewed"
    | "approved-for-model"
    | "approved-for-provider";
  modelUseAuthorized: boolean;
  providerEgressAuthorized: boolean;
  approvedProviders: string[];
  license?: string;
}
