# Learning Log

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
