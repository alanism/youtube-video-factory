# YouTube Video Factory

A local-first, HyperFrames-first compiler for narrated YouTube videos.

This repository is being built in gated milestones. Milestone 0 proves that a pinned HyperFrames composition can combine a retained YouTube layout, embedded video, narration, phrase captions, and a deterministic transition without live network requests.

## Current proof

```bash
pnpm install
pnpm doctor
pnpm lint
pnpm check
pnpm preview
```

The proof composition is `index.html`. Rendering remains approval-gated after Studio preview.

## Defaults

- 1920×1080
- 30 fps
- High-quality H.264/AAC
- `ivory-dusk-editorial`
- Phrase-level captions
- Music and sound effects off
- HyperFrames owns composition and rendering
- FFmpeg owns normalization and final probing

## License

MIT. Vendored fonts retain their OFL notices in `THIRD_PARTY_NOTICES/`.
