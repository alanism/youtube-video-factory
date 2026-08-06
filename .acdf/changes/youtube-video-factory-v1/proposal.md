# Proposal

## Change

Package the current YouTube Video Factory work as an ACDF-governed public repository release candidate.

## Why

The current repo contains substantial factory implementation work, but it was not yet wrapped in ACDF authority, tasking, evidence, and retrospective records. This change creates that governance layer and prepares the repo for a responsible GitHub push.

## Scope

- Add ACDF reference files.
- Add ACDF change artifacts.
- Preserve the current factory implementation.
- Document provider integrations as existing implemented capabilities.
- Mark Image 2 completion validation as future hardening.
- Run minimal local validation and capture evidence.
- Commit and push after the ACDF evidence is coherent.

## Out Of Scope

- Rebuilding provider adapters.
- Running paid provider calls.
- Fixing the Image 2 completion validator.
- Final production video rendering without preview approval.
- Moving legacy repositories or old projects.

## Rollback

The change can be rolled back by reverting the Git commit that adds the ACDF wrapper and current factory release candidate. No destructive migrations, database changes, or external infrastructure changes are part of this change.
