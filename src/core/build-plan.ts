import type { ParsedBrief } from "./brief.js";
import type { ProductionManifest } from "../types.js";

const questions: Record<string, string> = {
  motionModel: "Which OpenRouter Seedance model is approved?",
  motionResolution: "What Seedance resolution should be used?",
  motionAudio: "Should Seedance generate sound, or must it be silent?",
  motionContract: "What approved Seedance motion contract should be used?",
  narrationAuthority: "Should final narration come from ElevenLabs or HeyGen?",
  heygenMode: "Is HeyGen required, optional, or disabled?",
  avatarId: "Which approved HeyGen avatar/look should be used?",
  avatarEngine: "Which HeyGen engine should be used?",
  heygenAlphaRequired: "Must HeyGen output include transparency?",
  landscapeTemplate: "Which official UCC landscape template should be used?",
  portraitTemplate: "Which official UCC portrait template should be used?",
};

function tableCell(value: string): string {
  return value.replaceAll("|", "\\|").replaceAll("\n", " ");
}

export function incompleteBuildPlanMarkdown(brief: ParsedBrief): string {
  const missing = brief.missingDecisions.map((decision) => `- **${decision}:** ${questions[decision] ?? `Specify ${decision} in the production brief.`}`).join("\n");
  return `# Build Plan — ${brief.title}

## Key Message

${brief.keyMessage}

## Learner Outcome

${brief.learnerOutcome}

## Decision Gate — Blocked

No media, paid-provider, or render work may start until the following decisions are added to the brief:

${missing}
`;
}

export function buildPlanMarkdown(manifest: ProductionManifest): string {
  const templateLines = manifest.renditions.map((rendition) => `- UCC ${rendition.aspectRatio} template: \`${rendition.defaultTemplate}\` from \`${rendition.templateSource}\``).join("\n");
  const openrouter = manifest.providers.openrouter;
  const heygen = manifest.providers.heygen;
  const sceneRows = manifest.scenes.map((scene) => `| ${tableCell(scene.id)} | ${tableCell(scene.purpose)} | ${tableCell(scene.primaryVisual?.asset ?? "Image 2 task / deterministic visual")} | ${tableCell(scene.narration?.provider ?? "none")} | ${tableCell(scene.primaryVisual?.asset ?? "shared asset pending")} |`).join("\n");
  return `# Build Plan — ${manifest.title}

## Key Message

${manifest.release.keyMessage}

## Learner Outcome

${manifest.release.learnerOutcome}

## Visual and Audio Contract

${templateLines}
- Palette: **${manifest.design.palette.label}** — ${manifest.design.palette.colors.map((color) => `\`${color}\``).join(" ")}
- Narration authority: **${manifest.audio.narrationAuthority}**
- Seedance: \`${openrouter?.model ?? "not enabled"}\`, ${openrouter?.resolution ?? "n/a"}, ${openrouter ? (openrouter.generateAudio ? "generated sound" : "silent") : "n/a"}, ${openrouter?.motionContract ?? "n/a"}
- Presenter: **${heygen?.mode ?? "disabled"}**${heygen ? ` — ${heygen.engine}, alpha required: ${heygen.alphaRequired}` : ""}
- Release gate: **${manifest.release.qualityGate.rubricMinimum}/50**, no criterion below ${manifest.release.qualityGate.minimumCriterionScore}, maximum ${manifest.release.qualityGate.maxRepairCycles} repair cycles

## Scene Plan

| Scene | Key idea | Visual proof | Speaker/audio | Shared source asset |
|---|---|---|---|---|
${sceneRows}

## Compilation Diagram

\`\`\`mermaid
flowchart LR
    B["Approved brief + manifest"] --> K["Codex writes Key Message"]
    K --> D["Build plan: scenes, templates, palette, providers"]
    D --> I["Image 2 scene-specific four-panel assets"]
    I --> E["Declared narration authority + alignment"]
    I --> S["Seedance via OpenRouter: 1→2, 2→3, 3→4"]
    E --> H{"HeyGen enabled?"}
    H -- Yes --> P["HeyGen Avatar III using declared audio authority"]
    H -- No --> C["Compose shared asset graph"]
    P --> C
    S --> C
    C --> L["Official UCC landscape template: 16:9"]
    C --> V["Official UCC portrait template: 9:16"]
    L --> Q["Mechanical, visual, and rubric QA"]
    V --> Q
    Q --> R{"Each rendition passes release gate?"}
    R -- No --> F["Repair within manifest limit"]
    F --> Q
    R -- Yes --> N["Netlify delivery + HyperFrames editor"]
\`\`\`

## Validation Gates

- Validate official-template source paths, palette tokens, shared-asset coverage, provider receipts, captions, codecs, full decode, and deployment paths.
- Score each rendition independently with the committed educational-video rubric.
- Do not release when a blocker is present, the total is below the release gate, or any criterion is below the minimum score.
`;
}
