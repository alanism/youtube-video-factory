# API and Account Configuration

Credentials are runtime inputs and never project files.

## ElevenLabs

```bash
export ELEVENLABS_API_KEY="..."
```

The brief supplies `voiceId`, `voiceModel`, speed, stability, and similarity. The adapter uses the timestamped speech endpoint and saves MP3 plus alignment/caption records.

## HeyGen

API wallet:

```bash
export HEYGEN_API_KEY="..."
```

Web-subscription OAuth:

```bash
unset HEYGEN_API_KEY
heygen auth login --oauth
heygen auth status
```

The official CLI credential lives in the user's account-tooling directory, outside projects. Verify billing source and credits before generation.

## OpenRouter

```bash
export OPENROUTER_API_KEY="..."
```

The adapter reads the live video registry, estimates from its pricing record when possible, submits asynchronous jobs, persists IDs, polls, and downloads. It does not automatically retry a paid failure.

## GCP temporary frame staging

```bash
export GCP_STAGING_BUCKET="your-bucket"
export GCP_STAGING_PROJECT="your-project"
gcloud auth login
```

Only references approved for provider egress may be staged. Public objects are content-addressed and removed after dependent jobs finish.

## Codex built-in images

No `OPENAI_API_KEY` is used. The project creates awaiting-agent tasks and Codex invokes its built-in image-generation capability. This deliberately prevents accidental OpenAI API billing.
