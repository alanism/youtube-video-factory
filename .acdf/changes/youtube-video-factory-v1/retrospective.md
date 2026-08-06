# Retrospective

## Learning Card: Invisible Work Burn

- Failure: Implementation progressed through a large repo build without a visible ACDF task board.
- Root cause: The work shifted from one video deliverable into a public reusable factory, but execution remained in ordinary coding-agent mode.
- Fix: Add ACDF intent, models, reference guide, authority snapshot, task board, evidence folders, receipts, runbook, and retrospective.
- Prevention: Public repo work must start with a change container before large implementation begins.
- Suggested reference update: Require ACDF wrapping before any open-source repository push.

## Learning Card: Provider Rebuild Anxiety

- Failure: Existing ElevenLabs, HeyGen, OpenRouter, and GCP work risked being re-litigated instead of preserved.
- Root cause: Mock-vs-live evidence was not clearly separated from implementation status.
- Fix: Document providers as existing implemented capabilities and require live smoke tests only when user credentials and approval are present.
- Prevention: Provider docs must state three states: implemented, mock-tested, live-verified.
- Suggested harness update: Add receipt fields for `providerImplementationStatus`, `mockStatus`, and `liveStatus`.

## Learning Card: Image 2 Completion Hardening

- Failure: The Codex Image 2 completion path may need independent output validation.
- Root cause: Built-in Codex image generation is an agent capability rather than a normal CLI API.
- Fix: Defer the validation hardening per user direction and record it explicitly.
- Prevention: v0.2.0 should add a decodability and dimensions check for completed image tasks.
- Suggested harness update: Add a focused `codex-image-output-validation` test when that issue becomes active.
