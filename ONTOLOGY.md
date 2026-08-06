# Media Factory Ontology v1

The ontology is deliberately small. It separates what a thing is from how a provider or renderer implements it.

| Entity | Meaning | Primary record |
|---|---|---|
| Project | Isolated production boundary | `.ytvf/project.json` |
| Brief | Human intent and creative direction | `PRODUCTION_BRIEF.md` |
| Reference | Untrusted or approved contextual input | `references/reference-registry.json` |
| DesignPack | Palette, typography, layout, and motion selection | Manifest design snapshot |
| Scene | One communication goal on the timeline | `production-manifest.json` |
| Asset | Image, video, audio, caption, presenter, prompt, panel, or motion sequence | Manifest / provider receipt |
| ProviderJob | Resumable external operation identified by request hash | `provider-records/*-jobs.json` |
| Build | One deterministic composition/render attempt | `build/hyperframes/compile-receipt.json` |
| Deliverable | Validated file intended for use outside the build | `output/` and `BUILD_RECEIPT.json` |

Every durable record has a stable ID, ontology version, lifecycle state where applicable, hashes, provenance, project-relative paths, and relationships.

Trust and lifecycle are separate from file type. A Markdown context file and a PNG style image both begin quarantined. Model-use approval does not imply provider-egress approval.

Schema changes that alter entity meaning, required relationships, or trust semantics require an ontology version increase.
