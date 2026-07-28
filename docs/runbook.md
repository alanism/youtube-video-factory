# Operations Runbook

## Start

```bash
pnpm install
pnpm ytvf doctor
```

Healthy means Node 22+, FFmpeg/FFprobe available, the pinned HyperFrames doctor payload is healthy for local rendering, and only the intended provider credentials are present.

## Test

```bash
pnpm typecheck
pnpm test
pnpm ytvf doctor
```

## Build a project

```bash
pnpm ytvf plan projects/<id>
pnpm ytvf manifest projects/<id> --approve
pnpm ytvf storyboard projects/<id>
pnpm ytvf preview projects/<id>
pnpm ytvf approve-preview projects/<id>
pnpm ytvf build projects/<id>
pnpm ytvf validate projects/<id>
pnpm ytvf receipt projects/<id>
```

## Monitoring

- Review `provider-records/*-jobs.json` for running or failed jobs.
- Compare actual provider usage with the manifest ceiling.
- Confirm no duplicate request hash has multiple job IDs.
- Inspect output and validation status in `BUILD_RECEIPT.json`.

## Recovery

- Interrupted provider work: run `pnpm ytvf resume projects/<id>` and resume the recorded job.
- Changed brief: regenerate and reapprove the manifest; previous approval is invalid.
- Changed composition after review: rerun preview; the prior preview hash cannot authorize rendering.
- Provider failure: retain the job record and request human approval before any new paid request.
- HyperFrames failure: run strict check, inspect snapshots and late-timeline media, fix the smallest deterministic cause, then repeat preview approval.

## Security incident

If a secret appears in a file, log, commit, or remote, stop provider work, revoke/rotate it, remove it from current files and Git history as appropriate, and document the exposure without copying the value into the learning log.
