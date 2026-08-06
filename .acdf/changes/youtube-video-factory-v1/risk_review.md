# Risk Review

## Product Outcome Risk

Risk: The repo may appear technically complete but not be usable by a new Codex user.

Mitigation: Keep quickstart, project template, local skill, examples, and runbook in the repo. Run provider-free smoke validation before public release.

## Lost Template Risk

Risk: The public factory loses the slide templates that made the Enochian output valuable.

Mitigation: Treat 17 layouts, 31 palettes, five typography systems, and `ivory-dusk-editorial` as release invariants in `.acdf/reference/guide.md`.

## Provider Overclaim Risk

Risk: Mocked provider tests may be mistaken for live account verification.

Mitigation: Documentation must state that provider adapters are implemented and mock-tested, while live provider use requires user credentials and explicit approval.

## Duplicate Billing Risk

Risk: Interrupted provider jobs could be resubmitted and charged twice.

Mitigation: Provider ledgers must use request hashes and persist job IDs immediately.

## Secret Exposure Risk

Risk: Pasted keys or signed URLs could be committed.

Mitigation: Run a secret-shaped value scan and keep provider keys process-environment only.

## HyperFrames Runtime Risk

Risk: Composition checks may pass while final rendering fails under local memory pressure.

Mitigation: `ytvf doctor` is a required preflight. Final production rendering remains gated by preview approval and render-ready environment checks.

## Image 2 Completion Risk

Risk: Codex Image 2 completion can record a selected output without independent image validation.

Mitigation: Record as deferred hardening. Do not block v0.1.0 packaging per user instruction.
