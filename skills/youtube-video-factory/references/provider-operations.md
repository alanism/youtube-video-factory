# Provider operations

## Credentials

- ElevenLabs: `ELEVENLABS_API_KEY`
- HeyGen API wallet: `HEYGEN_API_KEY`
- HeyGen web subscription: official CLI OAuth credential outside the project; ensure the API key is unset
- OpenRouter: `OPENROUTER_API_KEY`
- GCP staging: `GCP_STAGING_BUCKET`, `GCP_STAGING_PROJECT`, authenticated `gcloud`

Never echo, log, serialize, or commit credential values.

## Paid-call gate

Before each new provider recipe:

1. Verify the authenticated account, asset access, engine/model, and billing source.
2. Retrieve a balance or credit snapshot where supported.
3. Produce an estimate and compare it to the approved manifest ceiling.
4. Canonicalize the immutable request and claim its hash in the provider ledger.
5. Require pilot approval.
6. Submit once, immediately persist the job ID, and poll with a bound.
7. Resume existing IDs after interruption. Never automatically buy a retry.
8. Save sanitized actual usage and output hashes.

The adapter contract tests prove request shapes, lifecycle handling, downloads, and idempotency without spending money. A live provider is only confirmed when a separately authorized live pilot succeeds.

## Provider roles

- ElevenLabs: timestamped narration and phrase-caption timing.
- HeyGen: presenter video. Mute it in the final composition and retain the narration master.
- OpenRouter: capability-selected motion generation such as Seedance. Do not hardcode provider-specific assumptions outside the adapter.
- GCP: temporary public input staging. Delete staged objects after dependent jobs finish.
