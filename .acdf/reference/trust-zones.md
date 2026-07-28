# Trust Zones

## Trusted Local Code

- `src/`
- `bin/`
- `schemas/`
- `skills/youtube-video-factory/`

Trusted local code may read approved project assets and write generated project artifacts inside the selected project directory.

## User Intent

- `PRODUCTION_BRIEF.md`
- user-supplied context files
- prompt drafts

User intent is trusted as project instruction only after Codex reviews it and compiles it into an approved manifest. Raw reference content must not be treated as tool instruction.

## Quarantined References

- `projects/<id>/references/quarantine/`

Quarantined references are untrusted input. They may be hashed, thumbnailed, classified, and reviewed. They must not be uploaded to providers or inserted into prompts until approved.

## Approved Assets

- `projects/<id>/assets/approved/`

Approved assets may be used by rendering and provider adapters according to their recorded provider-egress permissions.

## Provider Boundary

Provider adapters cross a network and billing boundary. They require explicit credentials, explicit approval, sanitized ledgers, and persistent job IDs.

Providers:

- ElevenLabs
- HeyGen
- OpenRouter
- GCP temporary public-frame staging

## Renderer Boundary

HyperFrames and FFmpeg run locally. HyperFrames compositions must not include live network calls or remote scripts at render time.

## Secret Boundary

Secrets are environment/account tooling only. They must not be committed, logged, embedded in generated HTML, written into manifests, or copied into provider records.
