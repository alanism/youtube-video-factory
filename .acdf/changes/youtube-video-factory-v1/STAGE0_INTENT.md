# Stage 0 Intent

## Job To Be Done

When a creator wants to repeatedly make Enochian-style narrated slide videos on different topics, they can clone YouTube Video Factory, open it in Codex, provide a thorough Markdown brief and provider keys, and receive a validated HyperFrames-based YouTube video package without manually stitching together scripts, captions, slides, providers, and render checks.

## Primary Users

- Alan, creating repeated slide videos from local project folders.
- Open-source Codex users who can provide briefs, assets, and optional API keys.

## Success Metrics

- A fresh clone can install dependencies and run `pnpm ytvf doctor`.
- A user can initialize a new project and generate a provider-free preview from a brief.
- The repo retains the complete YouTube visual system: 17 layouts, 31 palettes, five typography systems, and `ivory-dusk-editorial`.
- Provider commands exist for ElevenLabs, HeyGen, OpenRouter, and GCP staging and require user keys plus explicit approval.
- Paid provider jobs use request hashes, ledgers, and resume behavior to avoid duplicate charges.
- No secrets are committed.

## Out Of Scope

- Sigil system migration.
- Legacy 60+ presentation template system.
- Notebook template system.
- Live provider spending during this ACDF packaging pass.
- Fixing the known Image 2 completion validation hardening issue.

## Open Questions Resolved By User Direction

- Image 2 completion validation is a known future issue, not a current blocker.
- Existing ElevenLabs, HeyGen, OpenRouter, and GCP work should be preserved and documented, not rebuilt.
