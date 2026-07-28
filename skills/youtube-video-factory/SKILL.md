---
name: youtube-video-factory
description: Build repeatable narrated YouTube slide videos from a Markdown production brief using the repository's 17 layouts, design packs, Codex built-in image generation, ElevenLabs narration, optional HeyGen presenters, optional OpenRouter motion, and HyperFrames rendering. Use for new video projects, brief intake, frame-pack generation, provider orchestration, previews, rendering, recovery, or validation in this repository.
---

# YouTube Video Factory

Turn a thorough brief and approved references into a validated video without making the user move work to another app.

## Start every project

1. Run `pnpm install` and `pnpm ytvf doctor` at the repository root.
2. Create an isolated project with `pnpm ytvf init projects/<project-id> --title "<title>"`.
3. Ask the user to edit `PRODUCTION_BRIEF.md` or run `pnpm ytvf brief projects/<project-id>`.
4. Read [brief-contract.md](references/brief-contract.md). Stop on missing material decisions.
5. Run `pnpm ytvf plan projects/<project-id>`. This is mutation-free.
6. Generate a draft manifest, explain its consequential choices, then record approval with `pnpm ytvf manifest projects/<project-id> --approve`.
7. Generate `STORYBOARD.md` and `SCRIPT.md`.

Never write a key, token, credential, signed URL, or OAuth record into the project. Provider keys are process-environment inputs only.

## Choose the media path per scene

- Search approved project assets before generating anything.
- Use one primary communication goal and normally one primary visual per scene.
- For a missing visual, create Codex image tasks with `pnpm ytvf image plan <project>`, then follow [image-workflow.md](references/image-workflow.md). Use the built-in `imagegen` skill/tool. Do not use an OpenAI API key.
- For a 2×2 story sheet or Seedance transition sequence, use the frame-pack rules in [image-workflow.md](references/image-workflow.md).
- For narration, presenter, or motion work, read [provider-operations.md](references/provider-operations.md). Verify billing source and estimate before the first paid call.
- Keep narration as audio authority when compositing muted HeyGen presenters.

## Compose and approve

1. Generate narration and phrase captions only after manifest and paid-call approval.
2. Run `pnpm ytvf preview <project>`.
3. Inspect every scene midpoint, every transition, the late timeline, captions, safe zones, and media playback.
4. Do not record preview approval on the user's behalf. After explicit approval, run `pnpm ytvf approve-preview <project>`.
5. Run `pnpm ytvf build <project>`, `pnpm ytvf validate <project>`, and `pnpm ytvf receipt <project>`.
6. Read [hyperframes-gates.md](references/hyperframes-gates.md) before diagnosing or changing a composition.

## Recovery and learning

- Run `pnpm ytvf resume <project>` before resubmitting a provider job.
- Never automatically retry a paid request.
- Reuse cached outputs with the same canonical request hash.
- Update the project's learning log when a failure reveals a reusable prevention rule.
- Report live provider verification separately from mocked contract tests.
