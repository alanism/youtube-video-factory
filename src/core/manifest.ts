import { existsSync } from "node:fs";
import { join } from "node:path";
import { getDesignPack, getLayout, getPalette, getTypography, motions } from "../design/registry.js";
import type {
  DesignPack,
  MotionDefinition,
  PaletteDefinition,
  ProductionManifest,
  SceneManifest,
  TypographyDefinition,
} from "../types.js";
import type { ParsedBrief } from "./brief.js";
import { canonicalHash, sanitizeIdentifier } from "./files.js";

function stringValue(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function numberValue(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function booleanValue(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export interface CustomDesignRegistry {
  designPacks: DesignPack[];
  palettes: PaletteDefinition[];
  typographies: TypographyDefinition[];
  motions: MotionDefinition[];
}

export function manifestFromBrief(
  brief: ParsedBrief,
  custom: CustomDesignRegistry = { designPacks: [], palettes: [], typographies: [], motions: [] },
): ProductionManifest {
  if (brief.missingDecisions.length > 0) {
    throw new Error(`Brief is missing material decisions: ${brief.missingDecisions.join(", ")}`);
  }
  const designPack = stringValue(brief.frontmatter.designPack, "ivory-dusk-editorial");
  const pack = custom.designPacks.find((item) => item.id === designPack) ?? getDesignPack(designPack);
  const paletteId = stringValue(brief.frontmatter.palette, pack.palette);
  const typographyId = stringValue(brief.frontmatter.typography, pack.typography);
  const palette = custom.palettes.find((item) => item.id === paletteId) ?? getPalette(paletteId);
  const typography = custom.typographies.find((item) => item.id === typographyId) ?? getTypography(typographyId);
  const motion = custom.motions.find((item) => item.id === pack.motion) ?? motions.find((item) => item.id === pack.motion);
  if (!motion) throw new Error(`Unknown motion: ${pack.motion}`);
  const fps = numberValue(brief.frontmatter.fps, 30);
  if (![24, 30, 60].includes(fps)) throw new Error(`Unsupported fps: ${fps}`);
  const narrationAuthority = stringValue(brief.frontmatter.narrationAuthority, "none") as ProductionManifest["audio"]["narrationAuthority"];
  const requestedRenditions = stringArray(brief.frontmatter.renditions);
  const hasLandscape = requestedRenditions.includes("16:9");
  const hasPortrait = requestedRenditions.includes("9:16");
  if (!hasLandscape && !hasPortrait) throw new Error("At least one explicit rendition is required.");
  const scenes: SceneManifest[] = brief.scenes.map((scene, index) => {
    const layout = scene.layout ?? pack.defaultLayout;
    getLayout(layout);
    const duration = scene.durationSeconds ?? Math.max(4, scene.narration.split(/\s+/).length / 2.35 + 0.7);
    return {
      id: scene.id || String(index + 1).padStart(2, "0"),
      title: scene.title,
      purpose: scene.purpose,
      layout,
      durationSeconds: Number(duration.toFixed(3)),
      narration: {
        text: scene.narration,
        provider: narrationAuthority === "none" ? "none" : narrationAuthority === "existing" ? "existing" : narrationAuthority,
      },
      ...(scene.visual ? { primaryVisual: { asset: scene.visual, fit: "contain" } } : {}),
      ...(scene.supportingVisuals?.length
        ? { supportingVisuals: scene.supportingVisuals.map((asset) => ({ asset, fit: "contain" as const })) }
        : {}),
      presenter: { mode: "none", muted: true },
      transition: index === brief.scenes.length - 1 ? "dip-to-dusk" : stringValue(brief.frontmatter.transitionStyle, "editorial-push"),
    };
  });
  const manifest: ProductionManifest = {
    schemaVersion: 2,
    ontologyVersion: 1,
    id: sanitizeIdentifier(stringValue(brief.frontmatter.projectId, brief.title)),
    title: brief.title,
    briefHash: brief.hash,
    approval: { status: "draft" },
    output: {
      width: hasPortrait && !hasLandscape ? 1080 : 1920,
      height: hasPortrait && !hasLandscape ? 1920 : 1080,
      fps: fps as 24 | 30 | 60,
      quality: stringValue(brief.frontmatter.quality, "high") as "draft" | "standard" | "high",
      codec: "h264",
      audioCodec: "aac",
      destination: stringValue(brief.frontmatter.output, `output/${sanitizeIdentifier(brief.title)}.mp4`),
    },
    release: {
      version: stringValue(brief.frontmatter.releaseVersion, "v1"),
      keyMessage: brief.keyMessage,
      learnerOutcome: brief.learnerOutcome,
      qualityGate: {
        rubricMinimum: numberValue(brief.frontmatter.rubricMinimum, 0),
        minimumCriterionScore: numberValue(brief.frontmatter.minimumCriterionScore, 0),
        maxRepairCycles: numberValue(brief.frontmatter.maxRepairCycles, 0),
        blockers: stringArray(brief.frontmatter.blockers),
      },
    },
    renditions: [
      ...(hasLandscape ? [{
        id: "landscape-16x9" as const,
        aspectRatio: "16:9" as const,
        width: 1920 as const,
        height: 1080 as const,
        templateFamily: "ucc-youtube" as const,
        templateSource: "../UCC-Slidedeck-YT-generator/src/youtube",
        defaultTemplate: stringValue(brief.frontmatter.landscapeTemplate, pack.defaultLayout),
        destination: stringValue(brief.frontmatter.landscapeOutput, `output/${sanitizeIdentifier(brief.title)}-16x9.mp4`),
      }] : []),
      ...(hasPortrait ? [{
        id: "portrait-9x16" as const,
        aspectRatio: "9:16" as const,
        width: 1080 as const,
        height: 1920 as const,
        templateFamily: "ucc-portrait" as const,
        templateSource: "../media-library/templates/portrait-9x16",
        defaultTemplate: stringValue(brief.frontmatter.portraitTemplate, "portrait-concept-explainer"),
        destination: stringValue(brief.frontmatter.portraitOutput, `output/${sanitizeIdentifier(brief.title)}-9x16.mp4`),
      }] : []),
    ],
    designPack,
    design: { pack, palette, typography, motion },
    autonomy: stringValue(brief.frontmatter.autonomy, "review-gated") as ProductionManifest["autonomy"],
    audio: {
      music: booleanValue(brief.frontmatter.music, false),
      soundEffects: booleanValue(brief.frontmatter.soundEffects, false),
      captions: stringValue(brief.frontmatter.captions, "phrase") as "phrase" | "word" | "off",
      narrationAuthority,
    },
    providers: {
      allowed: (Array.isArray(brief.frontmatter.providers)
        ? brief.frontmatter.providers
        : ["elevenlabs"]) as ProductionManifest["providers"]["allowed"],
      costCeilingUsd: numberValue(brief.frontmatter.costCeilingUsd, 0),
      paidPilotRequired: true,
      ...(narrationAuthority === "elevenlabs" ? {
        elevenlabs: {
          voiceId: stringValue(brief.frontmatter.voiceId, ""),
          modelId: stringValue(brief.frontmatter.voiceModel, "eleven_flash_v2_5"),
          speed: numberValue(brief.frontmatter.voiceSpeed, 0.92),
          stability: numberValue(brief.frontmatter.voiceStability, 0.65),
          similarityBoost: numberValue(brief.frontmatter.voiceSimilarity, 0.75),
        },
      } : {}),
      ...(Array.isArray(brief.frontmatter.providers) && brief.frontmatter.providers.includes("heygen") ? {
        heygen: {
          mode: stringValue(brief.frontmatter.heygenMode, "disabled") as "required" | "optional" | "disabled",
          avatarId: stringValue(brief.frontmatter.avatarId, ""),
          engine: stringValue(brief.frontmatter.avatarEngine, "avatar_iii") as "avatar_iii" | "avatar_iv",
          audioAuthority: narrationAuthority === "heygen" ? "heygen" : "elevenlabs",
          ...(narrationAuthority === "heygen" ? { voiceId: stringValue(brief.frontmatter.heygenVoiceId, "") } : {}),
          alphaRequired: booleanValue(brief.frontmatter.heygenAlphaRequired, false),
        },
      } : {}),
      ...(Array.isArray(brief.frontmatter.providers) && brief.frontmatter.providers.includes("openrouter") ? {
        openrouter: {
          model: stringValue(brief.frontmatter.motionModel, "bytedance/seedance-1-5-pro"),
          resolution: stringValue(brief.frontmatter.motionResolution, "480p") as "480p" | "720p" | "1080p",
          generateAudio: booleanValue(brief.frontmatter.motionAudio, false),
          motionContract: stringValue(brief.frontmatter.motionContract, "custom") as "panel-sequence-1-2-3-4" | "custom",
        },
      } : {}),
    },
    scenes,
  };
  return manifest;
}

export function validateManifest(manifest: ProductionManifest, projectDirectory?: string): string[] {
  const errors: string[] = [];
  if (manifest.schemaVersion !== 2) errors.push("schemaVersion must be 2");
  if (manifest.ontologyVersion !== 1) errors.push("ontologyVersion must be 1");
  if (!manifest.id) errors.push("id is required");
  if (!manifest.renditions.length) errors.push("release must include at least one explicit rendition");
  if (new Set(manifest.renditions.map((item) => item.id)).size !== manifest.renditions.length) errors.push("release cannot contain duplicate renditions");
  const primary = manifest.renditions[0];
  if (primary && (manifest.output.width !== primary.width || manifest.output.height !== primary.height)) errors.push("primary output must match the first requested rendition");
  for (const rendition of manifest.renditions) {
    const expected = rendition.id === "landscape-16x9"
      ? ["16:9", 1920, 1080, "ucc-youtube"]
      : ["9:16", 1080, 1920, "ucc-portrait"];
    if (rendition.aspectRatio !== expected[0] || rendition.width !== expected[1] || rendition.height !== expected[2] || rendition.templateFamily !== expected[3]) {
      errors.push(`invalid rendition contract: ${rendition.id}`);
    }
    if (!rendition.defaultTemplate || !rendition.templateSource || !rendition.destination) errors.push(`rendition ${rendition.id} is incomplete`);
  }
  if (!manifest.release.keyMessage || !manifest.release.learnerOutcome) errors.push("release key message and learner outcome are required");
  if (manifest.release.qualityGate.rubricMinimum < 40) errors.push("rubricMinimum must be at least 40");
  if (manifest.release.qualityGate.minimumCriterionScore < 3) errors.push("minimumCriterionScore must be at least 3");
  if (manifest.release.qualityGate.maxRepairCycles < 0 || manifest.release.qualityGate.maxRepairCycles > 3) errors.push("maxRepairCycles must be between 0 and 3");
  if (!manifest.release.qualityGate.blockers.length) errors.push("at least one release blocker must be declared");
  if (![24, 30, 60].includes(manifest.output.fps)) errors.push("fps must be 24, 30, or 60");
  if (manifest.scenes.length === 0) errors.push("at least one scene is required");
  const ids = new Set<string>();
  for (const scene of manifest.scenes) {
    if (ids.has(scene.id)) errors.push(`duplicate scene id: ${scene.id}`);
    ids.add(scene.id);
    try {
      const layout = getLayout(scene.layout);
      if (scene.presenter && scene.presenter.mode !== "none" && !layout.presenterSafeZones?.length) {
        errors.push(`scene ${scene.id} layout has no presenter safe zone`);
      }
    } catch {
      errors.push(`unknown layout on ${scene.id}: ${scene.layout}`);
    }
    if ((scene.supportingVisuals?.length ?? 0) > 2) errors.push(`scene ${scene.id} exceeds the three-visual layout limit`);
    if (scene.squareHero && !scene.primaryVisual) errors.push(`scene ${scene.id} squareHero requires a primary visual`);
    if (scene.squareHero && scene.primaryVisual?.aspectRatio !== "1:1") errors.push(`scene ${scene.id} squareHero primary visual must declare 1:1 aspect ratio`);
    if (scene.squareHero && scene.primaryVisual?.fit === "contain") errors.push(`scene ${scene.id} squareHero cannot use contain fit`);
    if (scene.durationSeconds <= 0) errors.push(`scene ${scene.id} duration must be positive`);
    if (scene.captions) {
      let previousEnd = 0;
      for (const caption of scene.captions) {
        if (caption.start < previousEnd) errors.push(`scene ${scene.id} captions overlap`);
        if (caption.end > scene.durationSeconds) errors.push(`scene ${scene.id} caption exceeds duration`);
        previousEnd = caption.end;
      }
    }
    if (projectDirectory && scene.primaryVisual?.asset) {
      const candidate = join(projectDirectory, scene.primaryVisual.asset);
      if (!existsSync(candidate)) errors.push(`scene ${scene.id} visual is missing: ${scene.primaryVisual.asset}`);
    }
    if (projectDirectory) {
      for (const visual of scene.supportingVisuals ?? []) {
        const candidate = join(projectDirectory, visual.asset);
        if (!existsSync(candidate)) errors.push(`scene ${scene.id} supporting visual is missing: ${visual.asset}`);
      }
    }
  }
  if (manifest.design.pack.id !== manifest.designPack) errors.push("design snapshot does not match designPack");
  if (manifest.design.palette.colors.length !== 5) errors.push("design palette must contain five colors");
  if (manifest.providers.costCeilingUsd < 0) errors.push("costCeilingUsd cannot be negative");
  if (manifest.providers.allowed.includes("elevenlabs") && !manifest.providers.elevenlabs?.voiceId) {
    errors.push("ElevenLabs is allowed but voiceId is missing");
  }
  if (manifest.providers.allowed.includes("heygen") && !manifest.providers.heygen?.avatarId) {
    errors.push("HeyGen is allowed but avatarId is missing");
  }
  if (manifest.providers.allowed.includes("heygen") && manifest.providers.heygen?.audioAuthority !== manifest.audio.narrationAuthority) {
    errors.push("HeyGen audio authority must match the final narration authority");
  }
  if (manifest.providers.allowed.includes("openrouter") && !manifest.providers.openrouter?.model) {
    errors.push("OpenRouter is allowed but model is missing");
  }
  if (manifest.providers.allowed.includes("openrouter") && !manifest.providers.openrouter?.resolution) errors.push("OpenRouter motion resolution is missing");
  if (manifest.approval.status === "approved") {
    const approvalTarget = { ...manifest, approval: { status: "draft" as const } };
    const expected = canonicalHash(approvalTarget);
    if (manifest.approval.approvedHash !== expected) errors.push("approvedHash does not match manifest");
  }
  return errors;
}

export function approveManifest(manifest: ProductionManifest): ProductionManifest {
  const draft = { ...manifest, approval: { status: "draft" as const } };
  return {
    ...draft,
    approval: { status: "approved", approvedHash: canonicalHash(draft) },
  };
}
