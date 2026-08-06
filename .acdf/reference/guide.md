# YouTube Video Factory Reference Guide

Version: 0.1.0
ACDF change: youtube-video-factory-v1

## Purpose

YouTube Video Factory is a Codex-first, HyperFrames-first compiler for narrated YouTube slide videos. A user supplies a thorough Markdown production brief, project assets, and optional provider keys. Codex and the `ytvf` CLI convert the brief into an approved manifest, storyboard, script, HyperFrames composition, preview, final MP4, validation results, and build receipts.

## Required Truth Layers

The production truth layers are ordered and non-interchangeable:

1. `PRODUCTION_BRIEF.md`: human intent, references, provider permissions, exclusions, budget, and approval requirements.
2. `production-manifest.json`: approved semantic execution contract.
3. `STORYBOARD.md` and `SCRIPT.md`: generated review documents derived from the manifest.
4. `build/hyperframes/`: deterministic HyperFrames project.
5. `output/*.mp4` and `BUILD_RECEIPT.json`: deliverables and receipt.

`STORYBOARD.md` and `SCRIPT.md` must not become independent sources of truth. If intent changes, regenerate and reapprove the manifest.

## Supported Media Capabilities

- Slide video generation from images, narration, captions, design packs, and timing records.
- Codex built-in Image 2 frame generation through agent tasks; no OpenAI image API key ships in v1.
- ElevenLabs narration and timestamp alignment with user-provided `ELEVENLABS_API_KEY`.
- HeyGen presenter generation through the official CLI, OAuth, or user-provided key where authorized.
- OpenRouter motion generation with user-provided `OPENROUTER_API_KEY`.
- GCP temporary public-frame staging with user-provided GCP environment configuration.
- Contact-sheet splitting and panel-sequence assembly.

Provider flows are existing implemented capabilities. Live execution requires explicit user credentials and approval. Mocked tests prove request shaping, ledgers, duplicate-job protection, and resume behavior; live smoke tests prove account-specific provider access.

## Design Invariants

The public factory must retain:

- All 17 YouTube slide layouts.
- All 31 original five-color palettes.
- Five typography systems.
- `ivory-dusk-editorial` with warm ivory `#EEE6D8`, parchment `#D8CBB8`, dusk ink `#24202A`, muted plum `#5F5363`, antique gold `#A6793B`, Newsreader titles, and IBM Plex Sans captions.

New design packs must be addable without renderer source changes.

## HyperFrames Contract

- HyperFrames is mandatory for composition, preview, captions, timeline seeking, presenter timing, and final rendering.
- Version `0.7.77` is pinned for v0.1.0.
- Each deliverable compiles into one standalone top-level composition.
- Root dimensions default to 1920x1080.
- Frame rate defaults to 30 fps.
- Final video defaults to high-quality H.264/AAC.
- No live network requests, render-time randomness, render-time clocks, or unbounded animation loops are allowed inside render compositions.
- FFmpeg owns media normalization, probe, decode checks, and recovery overlays when required.

## Project Layout

Each user project lives under `projects/<project-id>/` and may contain:

- `PRODUCTION_BRIEF.md`
- `PRODUCTION_BRIEF.html`
- `references/quarantine/`
- `references/reference-registry.json`
- `assets/approved/`
- `production-manifest.json`
- `STORYBOARD.md`
- `SCRIPT.md`
- `provider-records/`
- `build/`
- `output/`
- `validation/`
- `BUILD_RECEIPT.json`

Generated project artifacts must stay inside their project directory unless they are explicitly promoted to a shared media library.

## Reference Quarantine

New references enter `references/quarantine/` and must be recorded with:

- stable ID
- content hash
- provenance
- license
- role
- trust state
- model-use authorization
- provider-egress authorization
- approved provider destinations

Allowed trust states:

- `quarantined`
- `reviewed`
- `approved-for-model`
- `approved-for-provider`

Provider jobs may only read approved copies under `assets/approved/`. They must not read quarantine paths directly.

## Provider Job Rules

Every paid or privileged provider request requires:

- environment-sourced credentials only
- billing source verification where provider supports it
- available balance or plan confirmation where provider supports it
- manifest cost ceiling
- canonical request hash
- pilot or batch approval
- immediate provider job ID persistence
- bounded polling
- resume support
- sanitized usage receipt
- no automatic paid retry

Secrets, OAuth tokens, API keys, signed URLs, and transient download URLs must not be written to briefs, manifests, ledgers, logs, receipts, prompts, or catalog records.

## Known Future Hardening

Codex built-in Image 2 completion currently relies on Codex saving the selected generated image into the expected project path and recording hashes. A future hardening task should independently verify generated images are decodable and match requested dimensions before marking the image task complete. This is not a v0.1.0 release blocker.

## Validation Gates

Minimum local release gates:

- `pnpm typecheck`
- `pnpm test`
- `pnpm test:security`
- `pnpm build`
- `pnpm ytvf doctor`
- `npm pack --dry-run`
- secret-shaped value scan

Provider-free smoke gate:

- initialize a fresh project
- generate brief HTML
- plan project
- approve manifest
- generate storyboard and script
- compile HyperFrames preview/check path
- verify no provider call runs without explicit credentials and approval

Live provider gates are manual release gates, not CI gates.
