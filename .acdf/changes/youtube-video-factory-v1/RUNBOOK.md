# ACDF Runbook

## Setup

```bash
pnpm install
pnpm ytvf doctor
```

Healthy means Node.js 22 or newer is present, FFmpeg and FFprobe are present, HyperFrames responds, and provider credentials are absent unless a provider command is intentionally being run.

## Local Validation

```bash
pnpm typecheck
pnpm test
pnpm test:security
pnpm build
pnpm ytvf doctor
npm pack --dry-run
```

## Fresh Project Smoke Path

```bash
pnpm ytvf init projects/smoke --title "Smoke Test"
pnpm ytvf brief projects/smoke
pnpm ytvf plan projects/smoke
pnpm ytvf manifest projects/smoke --approve
pnpm ytvf storyboard projects/smoke
pnpm ytvf preview projects/smoke --check-only
pnpm ytvf validate projects/smoke
pnpm ytvf receipt projects/smoke
```

## Provider Use

Provider commands require explicit user approval and credentials in the process environment:

- `ELEVENLABS_API_KEY`
- `OPENROUTER_API_KEY`
- HeyGen CLI OAuth or API key
- GCP staging environment variables

Do not place keys in committed files.

## Recovery

- Interrupted provider job: run `pnpm ytvf resume projects/<id>`.
- Failed provider job: keep the job record and request human approval before any new paid request.
- Changed manifest: invalidate preview approval and rerun preview.
- HyperFrames render issue: run doctor, strict check, inspect snapshots, fix only failed scene/media, then repeat preview approval.

## Release

Commit only after validation evidence and receipts are present. Push only after checking no secret-shaped values are in tracked files.
