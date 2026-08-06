# Build Specification

## Inputs

Each project is isolated under `projects/<project-id>/` and begins with:

- `PRODUCTION_BRIEF.md`
- Optional quarantined references
- Optional approved source images, video, and audio
- Process-environment provider credentials

The brief must define audience, deliverable, design pack, frame rate, quality, audio policies, provider permissions, cost ceiling, and scene intent.

## Deterministic build

1. `ytvf plan` reads the project without mutation and reports missing decisions, provider calls, cost ceiling, and cache state.
2. `ytvf manifest` validates the brief and proposes semantic execution.
3. `--approve` binds approval to the canonical manifest hash.
4. Storyboard and script are generated from that approved manifest.
5. Provider work claims a canonical request hash before submission and immediately records the provider job ID.
6. Codex built-in image outputs and provider outputs are copied into the project and hashed.
7. The compiler assembles one top-level, seekable HyperFrames composition.
8. Strict mechanical checks and snapshots run before Studio review.
9. Human preview approval is bound to the exact composition hash.
10. HyperFrames renders H.264/AAC; FFprobe and full decode validate the deliverable.
11. `BUILD_RECEIPT.json` records immutable build facts and output hashes.

## Defaults

- 1920×1080
- 30 fps
- High quality
- H.264 video and AAC audio
- `ivory-dusk-editorial`
- Phrase captions
- Music and sound effects off
- Review-gated autonomy

## Stop conditions

Stop rather than guess when a material brief decision is undefined, a reference lacks authorization, a credential or provider asset is unavailable, billing source is wrong, estimate exceeds the ceiling, a paid request lacks approval, a job fails, HyperFrames strict checks fail, or preview approval does not match the current composition.
