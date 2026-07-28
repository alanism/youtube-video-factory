# Codex built-in image workflow

Image generation runs through Codex's built-in `imagegen` capability. It does not use `OPENAI_API_KEY` and must not silently fall back to an API charge.

1. Intake style, identity, palette, composition, context, and draft-prompt references.
2. Approve references for model use; provider egress is a separate decision.
3. Run `ytvf image plan <project>` to create deterministic awaiting-agent tasks.
4. Read the task prompt and approved references.
5. Generate one 1024×1024 high-quality pilot panel with `imagegen`.
6. Copy the selected output to the task's project-relative output path and record its hash with `ytvf image complete`.
7. Require pilot approval before generating a continuity set.
8. Generate subsequent panels using the approved pilot and adjacent continuity references.
9. Validate identity, wardrobe, props, lighting, palette, style, borders, and action continuity. Regenerate only failed panels.

For a 2×2 story sheet, run `ytvf panels split <project> --source <path> --id <sheet-id>`. It splits in reading order: top-left, top-right, bottom-left, bottom-right; detects and removes central gutters deterministically; preserves the source; and records crop rectangles and hashes in `panel-map.json`.

For a four-panel motion sequence, submit exactly three silent first/last-frame jobs: 1→2, 2→3, 3→4. Use `ytvf sequence assemble` to normalize them to a silent 480×480, 24 fps, 360-frame/15-second master. Repair weak endpoint frames without a paid retry, and let HyperFrames own narration and final timing.
