# Tasks

## t01-acdf-wrapper

Status: DONE

Allowed files:

- `.acdf/**`
- `learning_log.md`

Binary gate:

- `find .acdf -type f`

Work:

- Create ACDF reference files.
- Create change models, proposal, design, task board, risk review, authority snapshot, runbook, and retrospective.
- Capture the Image 2 completion validator as future hardening.

## t02-release-candidate-validation

Status: DONE

Allowed files:

- `.acdf/changes/youtube-video-factory-v1/evidence/**`
- `.acdf/changes/youtube-video-factory-v1/receipts/**`
- `BUILD_RECEIPT.json`

Binary gate:

- `pnpm typecheck`
- `pnpm test`
- `pnpm test:security`
- `pnpm build`
- `pnpm ytvf doctor`
- `npm pack --dry-run`

Work:

- Run the minimal local validation pass.
- Store evidence logs.
- Write receipt.

## t03-github-publication

Status: DONE

Allowed files:

- Git metadata through normal commit and push only.

Binary gate:

- `git status --short`
- `git log -1 --oneline`
- remote push result

Work:

- Commit the ACDF-wrapped release candidate.
- Push to GitHub after validation evidence is recorded.

## t04-design-visibility

Status: DONE

Allowed files:

- `README.md`
- `DESIGN_SYSTEM.md`
- `WORKFLOW_PLAYBOOK.md`
- `package.json`
- `pnpm-lock.yaml`
- `scripts/**`
- `src/design/**`
- `src/render/**`
- `tests/**`
- `docs/assets/layouts/**`
- `assets/fonts/**`
- `THIRD_PARTY_NOTICES/**`
- `.acdf/changes/youtube-video-factory-v1/**`
- `learning_log.md`

Binary gate:

- `pnpm ytvf:design-docs`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:security`
- `pnpm build`
- `npm pack --dry-run`

Work:

- Generate committed layout PNG previews and `DESIGN_SYSTEM.md` from the design registry.
- Move the practical workflow playbook into `README.md`.
- Add IBM Plex Sans, Serif, and Mono as the visible public typography system.
- Add docs-sync tests proving GitHub docs match the registry.
- Record Engineering Council recommendations and validation evidence.

## t05-brief-intake-editor

Status: DONE

Allowed files:

- `README.md`
- `src/core/brief-html.ts`
- `src/core/quarantine.ts`
- `tests/brief-editor.test.ts`
- `.acdf/changes/youtube-video-factory-v1/**`
- `learning_log.md`

Binary gate:

- `pnpm typecheck`
- `pnpm test`
- `pnpm test:security`
- `pnpm build`

Work:

- Make the localhost briefing page clearly support file attachments and typed draft prompts for image, video, and copywriting context.
- Store typed drafts as quarantined Markdown references with roles Codex can later review and approve.
- Keep all uploads and typed drafts inside the selected project folder.
- Preserve quarantine, provenance, license, and provider-egress boundaries.

## t06-start-here-and-project-folders

Status: DONE

Allowed files:

- `README.md`
- `start_here.html`
- `bin/ytvf.mjs`
- `src/cli.ts`
- `src/core/project.ts`
- `tests/**`
- `.acdf/changes/youtube-video-factory-v1/**`
- `learning_log.md`

Binary gate:

- `pnpm typecheck`
- `pnpm test`
- `pnpm test:security`
- `pnpm build`

Work:

- Add a root `start_here.html` that gives GitHub/download users an obvious local entry point.
- Make simple `ytvf init <name>` calls create project folders under `projects/<slug>`.
- Preserve explicit project paths such as `projects/my-video`.
- Add a project-local start page that links to `PRODUCTION_BRIEF.html`.
- Keep the ACDF task list, evidence, and receipt current.

## t07-root-briefing-page

Status: DONE

Allowed files:

- `README.md`
- `start_here.html`
- `tests/start-here.test.ts`
- `.acdf/changes/youtube-video-factory-v1/**`
- `BUILD_RECEIPT.json`
- `learning_log.md`

Binary gate:

- `pnpm typecheck`
- `pnpm test`
- `pnpm test:security`
- `pnpm build`

Work:

- Make the root `start_here.html` the actual first-run briefing worksheet, not only a navigation guide.
- Let users state the video they want, list references, and draft image, video, and copywriting prompts.
- Generate Markdown suitable for copy/paste into Codex.
- Support downloading either `PRODUCTION_BRIEF.md` or a plain text brief.
- Add a regression test proving the root page exposes the briefing fields and export actions.
- Update README and learning capture.

## t08-start-here-design-selection

Status: DONE

Allowed files:

- `README.md`
- `start_here.html`
- `docs/start-here/design.md`
- `tests/start-here.test.ts`
- `.acdf/changes/youtube-video-factory-v1/**`
- `BUILD_RECEIPT.json`
- `learning_log.md`

Binary gate:

- `pnpm typecheck`
- `pnpm test`
- `pnpm test:security`
- `pnpm build`

Work:

- Restyle the root Start Here page using the Minimal Workspace design system.
- Commit a Start Here `design.md` with the approved Minimal Workspace palette, typography, spacing, layout, components, motion, and accessibility guidance.
- Make all registered color palettes visible and selectable as color-chip cards.
- Make all registered typography systems visible and selectable as typography cards.
- Include selected palette and typography in the generated brief frontmatter and visual-system section.
- Add regression tests proving the visible Start Here selectors cover every registered palette and typography option.

## t09-start-here-font-specimens

Status: DONE

Allowed files:

- `start_here.html`
- `tests/start-here.test.ts`
- `.acdf/changes/youtube-video-factory-v1/**`
- `learning_log.md`

Binary gate:

- `pnpm test -- tests/start-here.test.ts`
- `pnpm test:security`

Work:

- Show a real font specimen inside every typography card.
- Include headline, body, caption, and mono samples so users can see the typography combination before selecting it.
- Add regression coverage for the specimen markup.

## t10-deliverable-agnostic-start-here

Status: DONE

Allowed files:

- `README.md`
- `start_here.html`
- `tests/start-here.test.ts`
- `.acdf/changes/youtube-video-factory-v1/**`
- `BUILD_RECEIPT.json`
- `learning_log.md`

Binary gate:

- `pnpm typecheck`
- `pnpm test`
- `pnpm test:security`
- `pnpm build`

Work:

- Add deliverable type selection for YouTube video, image deck, slide deck, image set, motion sequence, and interactive planning.
- Add output count, aspect ratio, resolution, output format, and output naming pattern fields.
- Add image source policy so Codex can distinguish AI-generated, user-supplied, mixed, reused, or no-new-image projects.
- Add optional education/domain metadata, curriculum standards, reading level, and creative/review lenses.
- Add structured scene/frame planning and quality-gate fields.
- Ensure non-video briefs do not silently default to MP4, narration, or voice generation.
- Update generated YAML and Markdown to preserve these decisions for Codex.
- Add regression tests for deliverable-agnostic brief fields.

## Deferred image-output-hardening

Status: DEFERRED

Allowed files:

- `src/providers/codex-image.ts`
- `src/cli.ts`
- `tests/codex-image.test.ts`

Binary gate:

- `pnpm test -- tests/codex-image.test.ts`

Work:

- Verify Codex-generated Image 2 outputs are decodable images with expected dimensions before marking image tasks complete.

Reason deferred:

- User explicitly directed that this issue should be noted as a future issue and not consume current implementation tokens.
