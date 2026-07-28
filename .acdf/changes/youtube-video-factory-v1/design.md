# Design

## Architecture

The factory is split into four layers:

1. Human intent layer: `PRODUCTION_BRIEF.md` and `PRODUCTION_BRIEF.html`.
2. Semantic execution layer: `production-manifest.json`, schemas, provider ledgers, approval hashes.
3. Compilation layer: HyperFrames compiler, design registry, media normalization, storyboard/script generation.
4. Validation layer: tests, strict HyperFrames checks, FFmpeg probes, receipts, and learning logs.

## CLI Surface

The `ytvf` CLI exposes:

- `init`
- `brief`
- `plan`
- `manifest`
- `storyboard`
- `preview`
- `build`
- `resume`
- `validate`
- `doctor`
- `design add`
- `design preview`
- `receipt`
- provider commands for narration, presenter, motion, staging, and panel sequences

## Design System

The design registry keeps the existing YouTube visual language intact:

- 17 layouts
- 31 palettes
- five typography systems
- `ivory-dusk-editorial`

Design packs combine palette, typography, layout, and motion records. A new design pack must not require renderer source edits.

## Provider Handling

Provider adapters receive immutable approved requests. They do not parse briefs and do not read quarantined references. They record request hashes, job IDs, status, costs, retries, and outputs in sanitized records.

## Image Generation Handling

Codex built-in Image 2 is represented by awaiting-agent tasks. The CLI creates deterministic task state and Codex completes the media generation inside the Codex app. This avoids requiring an OpenAI image API key in v1.

Known future issue: completion should later verify image dimensions and decodability.

## Security

References are quarantined before model or provider use. Provider egress requires explicit approval. Secrets are process environment values only.

## Validation

Validation is intentionally split:

- Local release candidate validation: typecheck, tests, security test, build, doctor, package dry run, secret scan.
- Provider-free smoke validation: fresh project workflow.
- Live provider validation: manually approved release gates with user credentials.
