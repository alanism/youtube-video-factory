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

Status: TODO

Allowed files:

- Git metadata through normal commit and push only.

Binary gate:

- `git status --short`
- `git log -1 --oneline`
- remote push result

Work:

- Commit the ACDF-wrapped release candidate.
- Push to GitHub after validation evidence is recorded.

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
