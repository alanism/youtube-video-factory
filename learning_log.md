# Learning Log

## 2026-07-30 — Unified release contract after Gravity review

### A provider name was not a complete production decision

- Failure: Earlier projects could authorize OpenRouter or HeyGen while leaving Seedance resolution, generated-sound behavior, and final audio authority implicit. This allowed a pipeline to create technically valid but wrong media.
- Root cause: The v1 brief parser treated a provider list as enough configuration and the renderer assumed one 16:9 output.
- Resolution: Introduced manifest v2 with a paired rendition release, explicit Seedance model/resolution/sound/motion contract, explicit HeyGen mode and audio authority, a 40/50 rubric gate, and a maximum repair count. `ytvf plan` now produces a user-readable Key Message, scene plan, contract, and Mermaid compilation diagram before provider commands can proceed.
- Prevention: A missing Seedance or HeyGen decision is a blocking question, not a fallback. The provider command reads the approved resolution and generated-audio policy rather than accepting an implicit 480p/silent default.

### Visual correctness requires the actual UCC template contracts

- Failure: Gravity used look-alike custom layouts and initially omitted generated Seedance media, which made the video fail despite having assets and a render.
- Root cause: Template selection and asset-generation receipts were not bound to the final rendition composition.
- Resolution: Landscape compilation validates the official UCC YouTube template source; portrait compilation validates the official portrait template contract and renders a separate 1080×1920 composition from the same asset graph. Both outputs now require their own preview hash, render, validation result, and receipt entry.
- Prevention: A generated asset is not considered used until the final composition contains it. A release cannot be described as complete from a single aspect ratio or a provider receipt.

### Successful projects supplied patterns, not exemptions

- Tomoe lesson: use one scene-specific four-panel sequence per learning beat, preserve approved assets during aspect-ratio revisions, and build portrait as a real composition rather than a crop.
- Enochian lesson: preserve exact scene order, alignment-driven timing and captions, provider pilots/ledgers, endpoint validation, alpha checks, full decode, and artifact hashes.
- Guardrail: visual polish does not waive the educational rubric. Each rendition must reach 40/50, have no criterion below 3, and have no release blocker.

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

### Design choices must be visible at intake time

- Issue: Start Here collected visual direction as text/dropdowns, but users could not see and choose the actual palette chips or typography combinations from the design system.
- Cause: The design registry was visible in `DESIGN_SYSTEM.md`, but the first-run briefing page did not expose those options where the decision is made.
- Fix: Restyled Start Here with the Minimal Workspace system, added visible palette cards, visible typography cards, selected-choice summaries, and generated-brief fields for `palette` and `typography`.
- Prevention: Added tests that require every registered palette and typography system to appear on the Start Here page.
- Confidence: High.

### Typography selectors need live specimens

- Issue: Typography cards exposed the typography names and descriptions, but the boxes did not clearly show the actual font behavior.
- Cause: The first selector used a single sample line plus descriptive metadata, which made the cards feel like labels instead of type specimens.
- Fix: Added an in-card specimen stack with headline, body, caption, and mono samples using the selected IBM Plex family roles.
- Prevention: Added regression checks for the specimen elements on the Start Here page.
- Confidence: High.

### Start Here must not assume every brief is video

- Issue: A Hermes-filled image-deck brief had to manually override video-centric defaults such as MP4 output, narration, and runtime.
- Cause: The first Start Here generator was optimized for YouTube videos and lacked a structural deliverable-type decision.
- Fix: Added deliverable type selection, output specs, image source policy, optional education metadata, creative/review lenses, structured frame planning, and quality gates. Non-video briefs now export voice as `none` and can use image/deck output patterns.
- Prevention: Added regression checks for deliverable-agnostic YAML fields and image-deck output patterns.
- Confidence: High.

### Contact-sheet workflow belongs in the intake brief

- Issue: Users need to know early that a four-frame 1:1 image deck can also become a Seedance motion source, but the Start Here page did not surface that reusable path.
- Cause: The four-panel workflow existed in deeper reference docs, not at the moment where users decide output shape and asset strategy.
- Fix: Added Start Here and docs guidance recommending a 2×2 four-frame contact sheet for 1:1 image decks, with optional split-panel use for still slides or Seedance 1→2, 2→3, 3→4 transitions.
- Prevention: Added Start Here tests for the contact-sheet and Seedance guidance.
- Confidence: High.

### Disclaimers must be explicitly user-authored

- Issue: Process feedback suggested safety/disclaimer fields, but the user clarified that the factory must never auto-insert disclaimers.
- Cause: Safety review language can easily drift into generated advisory text if not constrained.
- Fix: Added Start Here and README guidance that disclaimers, warnings, or advisory language are only included when written by the user, Hermes, or another briefing agent.
- Prevention: Added Start Here tests for the user-authored-only disclaimer policy.
- Confidence: High.

### Hermes needs its own operator guide

- Issue: Hermes can fill out Start Here, but another agent still needs explicit instructions for how to produce a Codex-ready brief and where its responsibility stops.
- Cause: The repo had Codex-facing skill docs and human README docs, but not a Hermes-facing handoff guide.
- Fix: Added `hermes-slide-video-maker.md` with Start Here usage, deliverable typing, image policy, provider policy, contact-sheet strategy, disclaimer constraints, local commands, and Codex handoff wording.
- Prevention: Added a regression test requiring the Hermes guide and README link.
- Confidence: High.

### Social ads need visible proof, not just energetic media

- Issue: The initial UnCommon Core vertical cuts used character-motion footage as the only evidence for claims about challenges, projects, and community, leaving the ads visually energetic but conversion-weak.
- Cause: The portrait compiler only rendered generic title/purpose copy; it had no explicit proof-card or conversion-card contract.
- Fix: Added manifest-level deterministic proof cards for claim scenes and a dedicated CTA card for the end scene, while preserving the approved portrait template, palette, shared Seedance assets, and separate A/B narration.
- Prevention: The social-ad regression fixture now requires proof cards in scenes 1–3, the exact CTA hierarchy in scene 4, portrait delivery, and no internal production language. Score the rendered ad before release.
- Confidence: High.

### Do not spend on new motion when composition is the defect

- Issue: It was tempting to regenerate Seedance clips to improve a low social-ad score.
- Cause: The low score came from missing visual proof, CTA hierarchy, and product presence—not from broken or irrelevant motion quality.
- Fix: Re-encoded the existing montage clips for dense 30 fps seeking and added deterministic, clearly illustrative proof graphics. No additional Seedance request was submitted.
- Prevention: Classify the lowest-scoring rubric criteria before paid regeneration; use a new motion pilot only when the defect cannot be solved locally.
- Confidence: High.

### A portrait source aspect must match the hero contract before paid motion

- Failure: The UnCommon Core social-ad run split 1672×941 artwork into 836×940 portrait panels, generated 496×864 Seedance footage, then placed it in a 1012×1012 portrait hero. `contain` created visible green gutters; changing it to `cover` removed gutters by cropping heads or footwear. A claimed 87/100 score was invalid because it did not require visual proof against the supplied Tomoe portrait reference.
- Root cause: The source-aspect audit, provider output-aspect contract, and reference-frame inspection were omitted before the batch. The renderer accepted non-square hero media and a detached card layout that materially diverged from the official portrait hierarchy.
- Resolution: Deterministically cropped each approved source panel to 836×836 with a hash receipt, ran and inspected a silent 640×640 Seedance pilot, regenerated the shared square motion graph, and rebuilt the lower section as a dense editorial panel with integrated captions. The manifest now declares `squareHero: true`, 1:1 media, and 1:1 OpenRouter input/output settings; the renderer rejects `contain` for square heroes.
- Prevention: A social-ad score cannot be reported until a reviewer has inspected the rendered opening, every scene boundary, caption moments, and CTA against the reference frame. Hero gutters, body cropping, detached captions, or a materially different lower hierarchy are automatic release blockers.
- Recommended harness update: Add a fixture that fails if a `squareHero` primary asset does not probe square, if the compiled hero uses `contain`, or if the rendered hero has any background-color pixels inside its 1012×1012 frame.
- Confidence: High.

### Provider receipts are not final media validation

- Failure: OpenRouter returned accepted job receipts before all requested local files were present.
- Root cause: A provider job can be submitted or running independently of download completion.
- Resolution: Treated each receipt as resumable state only, then required a local ffprobe/decode check for 640×640, 24 fps, four-second, video-only output before adding it to a montage.
- Prevention: Count provider spend and progress by canonical job ID, but count usable media only after hash, dimensions, audio state, and decode validation.
- Confidence: High.
# 2026-07-30 — Families Emote Instagram release

- **What changed:** Built a 30-second, 9:16 UnCommon Core family campaign from three supplied square contact sheets, nine silent Seedance 1.5 Pro transitions, alignment-derived ElevenLabs narration, the official portrait template, and a sidechain-ducked owned music bed.
- **Failure:** The brief’s stale `renditions` declaration silently produced a 16:9 plus 9:16 manifest, and the generic parser included end-card wording in spoken dialogue.
- **Root cause:** The derived manifest was accepted before comparing its final rendition and narration fields against the approved scene contract.
- **Fix:** Replaced the generated manifest with a vertical-only, 30-second contract before any paid call; retained final end-card copy as visual-only.
- **Failure:** `ytvf build` rejected a preview whose stored composition hash matched the generated HTML when a resolved asset manifest was present.
- **Root cause:** The approval wrapper recompiled against resolved assets but did not consistently treat the resolved manifest as the approved execution artifact.
- **Fix:** Passed strict HyperFrames preview checks, then rendered the exact checked composition directly. Record this as a harness defect, not a visual waiver.
- **Prevention:** Add a regression test that creates narration-resolved media, approves the exact portrait composition, and verifies `ytvf build` succeeds without changing its composition hash.
- **Design QA:** Do not let a visual secondary line duplicate a contemporaneous phrase caption. At the CTA, reserve the large secondary line for the product name, and leave the narration copy to the alignment-driven caption.
# 2026-07-30 — Voice-variant audio bus repair

- **Failure:** Molly and Taylin visual exports audibly contained Alan narration even though their ElevenLabs source files and IDs were distinct.
- **Root cause:** The FFmpeg graph consumed the same voice label twice without `asplit`. FFmpeg then auto-selected the original input AAC stream to satisfy the unresolved audio branch.
- **Fix:** Created a video-only silent master, split the authoritative voice bus into separate ducking and final-mix branches, and mapped only the new mixed audio output.
- **Prevention:** Add a regression test that inspects FFmpeg stream mapping for voice variants and fails when the original master audio stream appears anywhere in the filter graph.

# 2026-07-30 — Common Instagram 9:16 workflow split by intent

- **Learning:** Educational/instructional and marketing/advertising videos can share the same 9:16 template, asset reuse, narration, caption, and validation infrastructure, but they cannot share the same definition of success.
- **Failure pattern:** Earlier vertical work mixed teaching language, campaign proof, decorative motion, and CTA behavior without declaring a primary intent. This made polished videos difficult to score honestly: an ad could be energetic but lack proof, while an instructional cut could explain too little and rely on urgency.
- **Resolution:** Documented one common workflow with two explicit sections. Instructional videos now prioritize concept → visual proof → actionable explanation → recap. Marketing videos prioritize hook → one promise → visible proof → one primary CTA.
- **Shared prevention:** Lock 9:16 geometry, source and hero aspect ratios, official portrait template hierarchy, safe areas, audio authority, alignment-derived captions, provider receipts, full decode, phone-size inspection, and final-MP4 rubric scoring before release.
- **Mode-specific prevention:** Require educational scoring to prove teachability and application; require marketing scoring to prove audience relevance, product/offer presence, claim support, and conversion clarity. Never fabricate live UI, testimonials, metrics, or destinations in either mode.
- **Recommended harness update:** Add an intent field to the manifest and make validation select the educational or social-ad rubric, scene requirements, and blocker rules from that field. Reject a release when intent is missing or when a marketing CTA is present in an instructional-only brief without an explicit secondary goal.
