# Workflow Playbook

## A useful brief

Give Codex:

- Topic, thesis, audience, and viewer outcome
- Desired runtime and publishing format
- Exact script or authority to improve it
- Visual aesthetic and reference roles
- Which visuals may be generated, edited, or sent to providers
- Voice ID and voice settings
- Presenter policy and avatar ID
- Motion policy and model preference
- Music/SFX on or off
- 24, 30, or 60 fps
- File-size versus quality preference
- Budget ceiling and billing source
- Pilot and final approval requirements
- Explicit exclusions

The factory reports missing decisions rather than silently selecting consequential options.

## Reuse before generation

Reuse approved source media, narration clips, provider outputs, and exact request hashes. Generate only missing or failed scene assets. A changed prompt, model, reference hash, or provider setting creates a new request identity.

## Model guidance

- **Luna (low reasoning)**: deterministic scoped revisions, file discovery, hashing, brief formatting, palette/type swaps, and validation summaries.
- **Terra (medium reasoning)**: normal production builds, cross-media changes, provider-aware updates, and visual QA.
- **Sol (high reasoning)**: only repeated cross-system failures, security or billing risk, or a high-consequence final audit.

High reasoning is unnecessary for deterministic file copying, polling, hashing, probing, or ordinary documentation. Escalate one step only when the prior tier cannot produce a decision-complete result.

## Revision workflow

For a feedback-driven update, open `make_changes.html` through `pnpm ytvf changes <project-folder>`. Select what changes, preserve every reusable asset explicitly, and state acceptance criteria. The saved `CHANGE_BRIEF.md` and `change-request.json` bind the request to a manifest hash, prevent contradictory preservation choices, and make the requested provider rerun explicit.

## Media decisions

- Default to 30 fps for YouTube explainers. Use 24 fps for a deliberately cinematic cadence; provider prices usually depend on generated seconds, resolution, or credits rather than final timeline FPS.
- Keep native motion speed when it fits narration. Prefer a short endpoint hold over aggressive speed changes.
- If motion is longer than narration, cut on meaningful action or retime gently. Do not distort speech.
- Music remains off unless the brief identifies its function, source/license, and narration ducking policy.
- Keep HeyGen muted in the final composition and use the original narration master.

## Approval sequence

Approve the semantic manifest, one paid pilot per provider recipe, the continuity pilot for generated image sets, the Studio preview, and only then the final render.
