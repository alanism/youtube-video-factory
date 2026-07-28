# YouTube Video Factory

An MIT-licensed, Codex-first video compiler for repeatedly creating narrated slide videos from a thorough Markdown brief.

It includes the complete retained YouTube system:

- 17 layouts for titles, cinematic/product media, portrait media, text, comparisons, matrices, charts, open canvas, and quotes
- 31 original five-color palettes plus `ivory-dusk-editorial`
- Five typography systems
- HyperFrames 0.7.77 as the pinned composition, preview, and rendering engine
- FFmpeg for normalization and final media validation
- Codex built-in Image 2 workflow with no OpenAI API key
- ElevenLabs timestamped narration and phrase captions
- HeyGen presenter generation through the official CLI, with API-key or OAuth billing
- OpenRouter motion generation with resumable jobs and duplicate-charge protection
- Localhost brief editing, reference quarantine, approval hashes, cost gates, and build receipts

## Use it in Codex

1. Clone the repository and open its folder in the Codex app.
2. Tell Codex: “Use the YouTube Video Factory skill. Create a project from this brief…” and provide the creative brief or place it in a file.
3. Codex will follow [skills/youtube-video-factory/SKILL.md](skills/youtube-video-factory/SKILL.md), identify missing decisions, and guide the gated build.

The repository-local `AGENTS.md` makes the skill discoverable when the folder is opened in Codex. Image generation stays inside Codex through the built-in image tool.

## Install

Requirements:

- Node.js 22 or newer
- pnpm 10
- FFmpeg and FFprobe
- Codex app for built-in image generation

```bash
git clone https://github.com/alanism/youtube-video-factory.git
cd youtube-video-factory
pnpm install
pnpm ytvf doctor
```

## Create a video

```bash
pnpm ytvf init projects/my-video --title "My Video"
pnpm ytvf brief projects/my-video
pnpm ytvf plan projects/my-video
pnpm ytvf manifest projects/my-video --approve
pnpm ytvf storyboard projects/my-video
```

Edit `projects/my-video/PRODUCTION_BRIEF.md` directly or use the Ivory Dusk localhost editor. The generated `PRODUCTION_BRIEF.html` is a portable read-only report.

If visuals are missing, ask Codex to complete the built-in image tasks:

```bash
pnpm ytvf image plan projects/my-video
```

For ElevenLabs narration, supply the key through the process environment and explicitly authorize the paid call:

```bash
export ELEVENLABS_API_KEY="..."
pnpm ytvf narrate projects/my-video --approve-paid
```

Then inspect and approve the exact HyperFrames composition:

```bash
pnpm ytvf preview projects/my-video
pnpm ytvf approve-preview projects/my-video
pnpm ytvf build projects/my-video
pnpm ytvf validate projects/my-video
pnpm ytvf receipt projects/my-video
```

Do not put secrets in the brief, `.env` files committed to Git, manifests, prompts, or provider records.

## Truth layers

```text
PRODUCTION_BRIEF.md             human intent
        ↓
production-manifest.json        approved semantic contract
        ↓
STORYBOARD.md + SCRIPT.md       human review views
        ↓
build/hyperframes/              deterministic composition
        ↓
preview approval hash
        ↓
output/*.mp4 + BUILD_RECEIPT.json
```

## Documentation

- [Build specification](BUILD_SPEC.md)
- [Ontology](ONTOLOGY.md)
- [Workflow playbook](WORKFLOW_PLAYBOOK.md)
- [API configuration](API_CONFIGURATION.md)
- [Cache strategy](CACHE_STRATEGY.md)
- [Operations runbook](docs/runbook.md)
- [Learning log](learning_log.md)

## Design customization

Run `pnpm ytvf design list` to inspect all layouts, palettes, and typography systems, or `pnpm ytvf design preview <project>` for a visual catalog.

Add a new project-local design pack without changing renderer code:

```bash
pnpm ytvf design add projects/my-video my-design-pack.json
```

The JSON contains a pack record plus its five-color palette, typography, and motion records. The resolved design snapshot is embedded in the approved manifest for repeatability.
See [examples/design-pack.json](examples/design-pack.json), [examples/presenter-request.json](examples/presenter-request.json), [examples/motion-request.json](examples/motion-request.json), and [examples/sequence-request.json](examples/sequence-request.json).

## Honest provider status

Automated tests cover ElevenLabs, HeyGen, and OpenRouter request shapes, lifecycle handling, downloads, resumability, and duplicate-job prevention using mocks. Live account access is verified only when a user supplies credentials and authorizes a pilot; the project never claims a live provider is working merely because its mock passed.

## License

MIT. Vendored font files retain their OFL notices in `THIRD_PARTY_NOTICES/`.
