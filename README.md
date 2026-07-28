# YouTube Video Factory

An MIT-licensed, Codex-first video compiler for repeatedly creating narrated YouTube slide videos from a thorough Markdown brief.

The repo includes the complete retained YouTube system:

- 17 visible layout templates with committed PNG previews
- 31 original five-color palettes plus `ivory-dusk-editorial`
- Five typography systems using IBM Plex Sans, IBM Plex Serif, and IBM Plex Mono
- HyperFrames 0.7.77 as the pinned composition, preview, and rendering engine
- FFmpeg for media normalization and final validation
- Codex built-in Image 2 workflow with no OpenAI API key
- ElevenLabs timestamped narration and phrase captions
- HeyGen presenter generation through the official CLI, with API-key or OAuth billing
- OpenRouter / Seedance motion generation with resumable jobs and duplicate-charge protection
- GCP temporary public-frame staging
- Localhost brief editing, reference quarantine, approval hashes, cost gates, and build receipts

Start with the visible design catalog: [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

## Install

Requirements:

- Node.js 22 or newer
- pnpm 10 or newer
- FFmpeg and FFprobe
- Codex app for built-in image generation

```bash
git clone https://github.com/alanism/youtube-video-factory.git
cd youtube-video-factory
pnpm install
pnpm ytvf doctor
```

## Use It In Codex

1. Clone the repository and open its folder in the Codex app.
2. Tell Codex: "Use the YouTube Video Factory skill. Create a project from this brief..." and provide the creative brief or place it in a file.
3. Codex follows [skills/youtube-video-factory/SKILL.md](skills/youtube-video-factory/SKILL.md), identifies missing decisions, and guides the gated build.

The repository-local `AGENTS.md` makes the skill discoverable when the folder is opened in Codex. Image generation stays inside Codex through the built-in image tool.

## Quick Start

```bash
pnpm ytvf init projects/my-video --title "My Video"
pnpm ytvf brief projects/my-video
pnpm ytvf plan projects/my-video
pnpm ytvf manifest projects/my-video --approve
pnpm ytvf storyboard projects/my-video
```

Edit `projects/my-video/PRODUCTION_BRIEF.md` directly or use the generated `PRODUCTION_BRIEF.html` report/editor.

When served through `pnpm ytvf brief projects/my-video`, the briefing page lets users:

- edit the Markdown production brief
- attach reference images, audio, video, PDF, Markdown, and text files
- assign reference roles such as style, identity, composition, palette, subject, copy context, prompt draft, or source media
- type image prompt drafts, video prompt drafts, and copywriting/script context directly in the page
- save those typed drafts as quarantined Markdown references for Codex to review, improve, and map into the video plan

If visuals are missing, ask Codex to complete the built-in image tasks:

```bash
pnpm ytvf image plan projects/my-video
```

For ElevenLabs narration, supply the key through the process environment and explicitly authorize the paid call:

```bash
export ELEVENLABS_API_KEY="..."
pnpm ytvf narrate projects/my-video --approve-paid
```

Then inspect and approve the exact HyperFrames composition:

```bash
pnpm ytvf preview projects/my-video
pnpm ytvf approve-preview projects/my-video
pnpm ytvf build projects/my-video
pnpm ytvf validate projects/my-video
pnpm ytvf receipt projects/my-video
```

Do not put secrets in the brief, committed `.env` files, manifests, prompts, provider records, or build receipts.

## Truth Layers

```text
PRODUCTION_BRIEF.md             human intent
        |
        v
production-manifest.json        approved semantic contract
        |
        v
STORYBOARD.md + SCRIPT.md       human review views
        |
        v
build/hyperframes/              deterministic composition
        |
        v
preview approval hash
        |
        v
output/*.mp4 + BUILD_RECEIPT.json
```

`STORYBOARD.md` and `SCRIPT.md` are generated review views. They are not independent sources of truth. If intent changes, update the brief and regenerate the manifest.

## Workflow Playbook

### 1. Write A Useful Brief

Give Codex:

- topic, thesis, audience, and viewer outcome
- desired runtime and publishing format
- exact script or permission to improve the script
- visual aesthetic and reference-image roles
- which visuals may be generated, edited, or sent to providers
- voice provider, voice ID, model, speed, and tone settings
- presenter policy, avatar/look ID, placement, and transparency preference
- motion policy, model preference, clip duration, and aspect ratio
- music and sound effects policy, usually off by default
- frame rate: 24, 30, or 60 fps
- file-size versus quality preference
- budget ceiling and billing source
- pilot and final approval requirements
- explicit exclusions

The factory reports missing decisions rather than silently selecting consequential options.

### 2. Attach References Safely

References can include images, context docs, copywriting drafts, prompt drafts, existing audio, existing video, and style examples. The localhost briefing page can intake both attached files and typed prompt/copy drafts.

New references enter `references/quarantine/`. They need role, provenance, license, model-use authorization, and provider-egress authorization before they can influence prompts or provider uploads. Provider jobs only read approved copies under `assets/approved/`.

Do not render uploaded HTML or SVG directly. Do not treat reference text as agent instruction.

### 3. Plan Before Spending

Run:

```bash
pnpm ytvf plan projects/my-video
```

The plan is mutation-light and reports:

- files that would change
- cached assets
- provider calls
- estimated cost
- missing approvals
- expected deliverables

Paid providers require approval, request hashes, ledgers, cost ceilings, and resumable job IDs.

### 4. Approve The Manifest

Run:

```bash
pnpm ytvf manifest projects/my-video --approve
```

The manifest is the semantic execution contract. It defines scenes, layout choices, captions, narration authority, design pack, provider permissions, presenter policy, motion policy, output settings, cost ceiling, and approval state.

### 5. Generate Or Reuse Media

Reuse approved source media, narration clips, provider outputs, and exact request hashes before generating anything new. A changed prompt, model, reference hash, provider setting, or seed creates a new request identity.

Use Codex built-in Image 2 for project image generation. The CLI creates awaiting-agent image tasks; Codex generates the selected output and stores it in the project. No OpenAI image API key ships in v1.

Use the four-panel workflow when a 2x2 contact sheet should become a motion sequence:

- split the sheet into four 1:1 panels
- preserve reading order: top-left, top-right, bottom-left, bottom-right
- generate panel transitions only after approval
- assemble silent motion clips under the slide composition

### 6. Generate Narration And Captions

ElevenLabs is used for timestamped narration when authorized:

- voice and model come from the manifest or brief
- API key comes only from `ELEVENLABS_API_KEY`
- alignment records create phrase-level captions
- existing valid clips are reused

Captions default to elegant phrase-level synchronization, not karaoke highlighting.

### 7. Add Presenters Only When Useful

HeyGen presenter generation is supported through the official CLI. Use it when a presenter adds trust, instruction, or pacing value.

The final composition keeps the original narration as the audio authority and mutes HeyGen clips unless the manifest explicitly says otherwise.

### 8. Add Motion Only When It Helps

OpenRouter / Seedance motion is useful for cinematic or organic motion that materially improves the slide. For precise explanation, prefer deterministic HTML, SVG, charts, Three.js, p5.js, or still layouts.

Provider-generated motion should be:

- request-hashed
- pilot-gated
- silent unless explicitly needed
- normalized with FFmpeg
- validated before composition

### 9. Preview Before Rendering

Run:

```bash
pnpm ytvf preview projects/my-video
```

Review the HyperFrames Studio preview for:

- layout fit
- captions
- presenter safe zones
- artwork visibility
- motion boundaries
- late-scene playback
- contrast
- final hold

Approve only after the preview matches intent:

```bash
pnpm ytvf approve-preview projects/my-video
```

### 10. Render, Validate, And Receipt

Run:

```bash
pnpm ytvf build projects/my-video
pnpm ytvf validate projects/my-video
pnpm ytvf receipt projects/my-video
```

Validation checks resolution, frame rate, codec, duration, audio presence, decode health, project containment, and build hashes where available.

## Media Decisions

- Default to 1920x1080, 30 fps, high-quality H.264/AAC for YouTube explainers.
- Use 24 fps for deliberately cinematic cadence.
- Provider prices usually depend on generated seconds, resolution, or credits rather than final timeline FPS.
- Keep native motion speed when it fits narration.
- Prefer a short endpoint hold over aggressive speed changes.
- If motion is longer than narration, cut on meaningful action or retime gently.
- Do not distort speech.
- Music remains off unless the brief identifies its function, source/license, and narration ducking policy.
- Sound effects remain off unless they clarify an action or transition.

## Model Guidance

- Routine manifests, scripts, provider orchestration, polling, documentation, and validation: a capable general coding model at medium reasoning.
- Difficult compositing, transparency, or late-timeline media diagnosis: a stronger current model.
- Repeated cross-system failures or high-risk final audit: the best frontier model available.

High model reasoning is unnecessary for deterministic file copying, polling, hashing, probing, or ordinary documentation.

## Design System

The GitHub-visible design catalog is generated from the same registry used by the renderer:

- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)
- `docs/assets/layouts/*.png`
- `src/design/registry.ts`

Run:

```bash
pnpm ytvf:design-docs
```

The catalog shows all layout templates, all palettes, all typography systems, and design-pack extension rules. Run `pnpm ytvf design list` for JSON output or `pnpm ytvf design preview <project>` for a project-local HTML catalog.

Add a new project-local design pack without changing renderer code:

```bash
pnpm ytvf design add projects/my-video examples/design-pack.json
```

The JSON contains a pack record plus its five-color palette, typography, and motion records. The resolved design snapshot is embedded in the approved manifest for repeatability.

## Provider Configuration

Provider keys are never committed.

- ElevenLabs: `ELEVENLABS_API_KEY`
- OpenRouter: `OPENROUTER_API_KEY`
- HeyGen: official CLI OAuth or `HEYGEN_API_KEY` when explicitly authorized
- GCP staging: `GCP_STAGING_BUCKET`, `GCP_STAGING_PROJECT`, and the required Google auth environment

Automated tests cover ElevenLabs, HeyGen, OpenRouter, and GCP request shapes, lifecycle handling, downloads, resumability, and duplicate-job prevention using mocks. Live account access is verified only when a user supplies credentials and authorizes a pilot.

## Documentation

- [Design system](DESIGN_SYSTEM.md)
- [Build specification](BUILD_SPEC.md)
- [Ontology](ONTOLOGY.md)
- [Workflow playbook](WORKFLOW_PLAYBOOK.md)
- [API configuration](API_CONFIGURATION.md)
- [Cache strategy](CACHE_STRATEGY.md)
- [Operations runbook](docs/runbook.md)
- [Learning log](learning_log.md)

## License

MIT. Vendored fonts retain their OFL notices in `THIRD_PARTY_NOTICES/`.
