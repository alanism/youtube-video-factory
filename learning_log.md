# Learning Log

## 2026-07-28 — GitHub design visibility

### Runtime design registry was not enough

- Issue: GitHub readers could not see the 17 template layouts, 31 palettes, or full IBM Plex typography system without running the CLI or reading TypeScript.
- Cause: The design registry was treated as sufficient proof, but the public repo needs visible design assets and docs.
- Fix: Add registry-generated `DESIGN_SYSTEM.md`, committed layout PNG previews, README workflow content, IBM Plex Serif and Mono assets, and docs-sync tests.
- Prevention: Any public design claim must be backed by committed docs/assets generated from the registry and validated by tests.
- Confidence: High.

## 2026-07-28 — Briefing page prompt intake

### File attachment alone did not cover prompt drafting

- Issue: The briefing page supported file uploads, but users also need to type draft prompts for images, videos, and copywriting directly into the workflow.
- Cause: Prompt drafts were treated as uploaded reference files rather than a first-class editor action.
- Fix: Add typed draft intake to `PRODUCTION_BRIEF.html`; drafts are saved as quarantined Markdown references with `prompt-draft` or `copy-context` roles.
- Prevention: The brief editor test now verifies visible draft fields and quarantined references for uploaded files plus typed drafts.
- Confidence: High.

## 2026-07-29 — Start page and project folders

### Users needed an obvious local front door

- Issue: A downloaded repo had no obvious first HTML page, and `ytvf init <name>` did not automatically create `projects/<name>/`.
- Cause: The CLI expected users to already understand the project-folder convention.
- Fix: Add root `start_here.html`, project-local `start_here.html`, and make simple init names create `projects/<slug>/` while preserving explicit paths.
- Prevention: Project-init tests now verify simple-name subfolders, explicit paths, and project start pages.
- Confidence: High.

### CLI wrapper depended on caller working directory

- Issue: Running `bin/ytvf.mjs` from a temporary project folder could not resolve `tsx`.
- Cause: The wrapper used `--import tsx`, which Node resolved from the caller's current working directory.
- Fix: Resolve `tsx/esm` from the wrapper's own package location and pass the absolute loader path.
- Prevention: Project-init tests run the CLI from a temporary directory outside the repo.
- Confidence: High.

## 2026-07-28 — ACDF wrapper added before GitHub release

### Factory work needed governance before publication

- Issue: The repository had substantial implementation work but lacked an ACDF change container, authority snapshot, task board, evidence logs, and receipts.
- Cause: The project expanded from a single video workflow into an installable open-source factory while still being executed as ordinary coding work.
- Fix: Added `.acdf/reference/` and `.acdf/changes/youtube-video-factory-v1/` with intent, models, proposal, design, tasks, risk review, authority, runbook, and retrospective.
- Prevention: Any future public factory release should start by creating the ACDF change container before broad implementation or GitHub publication.
- Confidence: High.

### Codex Image 2 completion validation deferred

- Issue: The Codex built-in Image 2 completion path may need an independent decodability and dimension check before marking generated images complete.
- Cause: Built-in Codex image generation is an agent-mediated capability rather than a normal provider API the CLI can call directly.
- Fix: Recorded the issue as a future hardening task instead of spending release-candidate effort on it now.
- Prevention: Add a focused v0.2.0 task and test when image-output validation becomes active work.
- Confidence: Medium.

### Provider integrations should not be re-litigated without evidence

- Issue: Existing ElevenLabs, HeyGen, OpenRouter, and GCP implementation work risked being treated as unknown or broken without concrete failure evidence.
- Cause: Provider implementation status, mocked test status, and live account verification status were not separated clearly enough.
- Fix: ACDF reference and risk review now distinguish implemented/mocked provider capability from manually approved live provider smoke tests.
- Prevention: Provider receipts should track implementation status, mock status, and live status separately.
- Confidence: High.

## 2026-07-28 — Public factory completion audit

### Milestone proof was mistaken for an installable factory

- Issue: The first public repository contained a HyperFrames proof but not the full 17 layouts or provider workflows users were promised.
- Cause: Publication occurred at the milestone boundary without a clone-to-first-video acceptance gate.
- Fix: Port the complete design registry; add the project CLI, Codex skill, brief editor, image tasks, provider adapters, deterministic compiler, security controls, tests, and operator documentation.
- Prevention: A public release must pass a clean-clone acceptance flow that creates a fresh project, compiles multiple layouts, exercises mocked provider lifecycles, and verifies the local skill is discoverable.
- Confidence: High.

### Image generation had an application-switching gap

- Issue: Four-panel frames had to be generated manually in another GPT application.
- Cause: The workflow treated Image 2 as an external API/provider instead of a Codex agent capability.
- Fix: Add project-local awaiting-agent image tasks and a Codex skill procedure that invokes built-in image generation, stores selected outputs in the project, and records prompt/reference/output hashes.
- Prevention: Keep judgment-heavy media generation in the Codex skill layer while the CLI owns deterministic task state and validation. Never add an API-key fallback without separate authorization.
- Confidence: High.

### Compiled full-frame scenes started visible

- Issue: The clean-clone HyperFrames check flagged incoming scene wrappers as visible before their reveal tween.
- Cause: The compiler relied on clip timing but did not declare the GSAP-controlled inner wrapper's initial opacity.
- Fix: Set `.scene-inner` to `opacity: 0` and let the single paused timeline reveal it at the scene start.
- Prevention: Keep a compiler regression assertion for the hidden initial state and run strict checks against a freshly initialized project.
- Confidence: High.

### Antique-gold folios missed small-text contrast

- Issue: HyperFrames contrast validation measured the decorative gold folio text below WCAG AA.
- Cause: Antique gold works as a rule/accent on warm ivory but is too light for 20px informational text.
- Fix: Keep gold for rules and borders; use dusk ink for folio text.
- Prevention: Separate decorative palette roles from readable text roles in the compiler and keep strict contrast enabled.
- Confidence: High.

## 2026-07-28 — Milestone 0 HyperFrames proof

### HyperFrames readiness failed under memory pressure

- Issue: The first doctor payload returned `ok: false`.
- Cause: Only 1.7 GB of 8 GB system memory was available.
- Fix: Pause before implementation and rerun after memory was released; 2.5 GB then passed the required memory check.
- Prevention: Make `ytvf doctor` a hard preflight and distinguish required local-render checks from optional transcription, local TTS/music, and Docker checks.
- Confidence: High.

### pnpm blocked transitive binary installation

- Issue: HyperFrames lint could not start because pnpm rejected unresolved build-script decisions.
- Cause: pnpm created placeholder `allowBuilds` values for five transitive packages.
- Fix: Explicitly allow only `esbuild` and `sharp`; explicitly deny the optional GenAI, ONNX, and protobuf build scripts.
- Prevention: Commit a reviewed `pnpm-workspace.yaml` build allowlist and test fresh installation in CI.
- Confidence: High.

### Nested timed video would have frozen during rendering

- Issue: HyperFrames lint reported `video_nested_in_timed_element`.
- Cause: Both the media wrapper and nested video declared timing.
- Fix: Keep timing only on the video and make the wrapper an untimed visual container.
- Prevention: Add a factory lint rule and fixture ensuring framework-managed media never sits inside another timed element.
- Confidence: High.

### Untimed wrapper lost its positioning context

- Issue: The first snapshot set showed the video hidden behind Scene 1.
- Cause: Removing `class="clip"` also removed the wrapper’s inherited `position: absolute`.
- Fix: Declare absolute positioning directly on the media shell.
- Prevention: Snapshot the opening, every transition midpoint, a late scene, and the ending even when mechanical checks pass.
- Confidence: High.

### Animation-map helper could not resolve packages through pnpm

- Issue: The choreography audit could not find its helper packages.
- Cause: The external skill script could not resolve packages through pnpm’s isolated dependency layout.
- Fix: Use the skill’s documented, version-pinned temporary bootstrap at HyperFrames 0.7.77.
- Prevention: Expose the animation map through the pinned project CLI or make the helper resolve pnpm workspace symlinks.
- Confidence: Medium.

### Transition collision flags were intentional

- Issue: The animation map marked both full-scene wrappers as colliding during the 0.7-second handoff.
- Cause: The transition deliberately overlaps outgoing and incoming scene intervals.
- Fix: Inspect transition frames and replace the muddy short-distance crossfade with a full right-rail editorial push.
- Prevention: Treat collision flags at declared transition windows as review findings, not automatic failures; visual evidence remains mandatory.
- Confidence: High.

### Strict check did not retain its requested overview snapshots

- Issue: HyperFrames strict check completed successfully with `--snapshots`, but version 0.7.77 did not leave snapshot files in the project.
- Cause: Not isolated; the standalone snapshot command worked against the same composition and browser.
- Fix: Capture the required opening, transition, late-scene, and ending frames with the pinned standalone snapshot command.
- Prevention: Add a harness assertion that expected snapshot files exist after the strict check, with standalone capture as the documented non-rendering fallback.
- Confidence: Medium.

### Repository publication happened before final render approval

- Issue: The approved release sequence originally placed public GitHub publication after acceptance testing.
- Cause: The user explicitly authorized creating and pushing the new public repository while the Milestone 0 Studio preview was still awaiting review.
- Fix: Published only the preview-ready, provider-free Milestone 0 commit; no final MP4 or provider credentials were included.
- Prevention: Keep the repository release status separate from deliverable approval and require a final acceptance checklist before tagging a public release.
- Confidence: High.

### Root start page must be the briefing surface

- Issue: The repository entry page was too close to a passive guide, while first-time users need a place to state what they want and hand that brief to Codex.
- Cause: The project-local briefing editor existed, but the root `start_here.html` did not yet behave like the first-run intake worksheet.
- Fix: Converted the root start page into a self-contained brief builder with project intent, visual direction, provider/budget policy, scene planning, image/video/copywriting prompt drafts, copy-to-Codex, Markdown download, and plain-text download.
- Prevention: Added a regression test that requires the root start page to expose briefing fields and export actions.
- Confidence: High.
