# Cache Strategy

Cache identity is the canonical hash of immutable inputs.

- Brief cache: normalized Markdown bytes
- Manifest approval: canonical semantic manifest with draft approval state
- Image task: prompt, approved reference hashes, size, quality, and generation mode
- ElevenLabs: text, voice, model, seed, context, format, and voice settings
- HeyGen: avatar, audio hash/duration, engine, resolution, aspect, and output format
- OpenRouter: model, prompt, endpoint frames, duration, resolution, aspect, audio policy, and seed
- HyperFrames: approved/resolved manifest plus copied media hashes

Provider job ledgers are authoritative for resume. A request hash with a job ID is resumed or downloaded; it is never resubmitted automatically.

Caches are project-local. Generated build folders, previews, validation frames, and final outputs remain within the project. Secrets, OAuth tokens, signed URLs, and transient provider download URLs are never cache data.

Invalidate only the affected asset or scene. Rebuilding an unchanged project twice must produce the same manifest and composition hashes.
