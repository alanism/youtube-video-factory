# UCC Slide-Video Factory Best Practices

## Before any paid work

1. Run `pnpm ytvf plan <project>` and read the Key Message first. If it does not state the correct learner takeaway, repair the brief before creating an asset.
2. Confirm the build-plan Mermaid diagram shows the actual intended compilation path and both renditions.
3. Require explicit answers for Seedance model, resolution, sound/no-sound, and panel-transition contract. Do not infer them from “use Seedance.”
4. Require explicit audio authority. If ElevenLabs is authoritative, HeyGen is muted lip-sync. If HeyGen is authoritative, use its declared voice and dialogue-only script.
5. Lock exact UCC template IDs and a named five-color palette before generating images.

## Generate once, compose twice

- Search the asset catalog first.
- Use Image 2 to create one distinct four-panel 1:1 story sheet for each cinematic learning beat, then split it once.
- For Seedance panel sequences, create 1→2, 2→3, and 3→4 jobs only after the pilot and budget gate pass.
- Keep provider job IDs, hashes, request parameters, observed costs, and source assets. Resume jobs; never buy a blind retry.
- Reuse approved visual assets and narration timing for 16:9 and 9:16. Recompose layouts independently; do not crop or letterbox one rendition into the other.

## Compose with real templates

- Use `UCC-Slidedeck-YT-generator/src/youtube` for landscape and `media-library/templates/portrait-9x16` for portrait.
- Keep one primary visual and one communication goal per scene. Use deterministic diagrams where accuracy matters more than cinematic motion.
- Make every generated Seedance clip visibly appear in its intended final scene.
- Derive caption timing from the authoritative audio alignment; captions should be complete, readable, monotonic, and non-overlapping.
- For a portrait `squareHero`, verify the source panels, Seedance request, downloaded clip, and montage are all 1:1 before composition. A 1:1 hero uses the official 1012×1012 frame at x34/y34 with `cover`; `contain`, letterboxing, and a crop that removes a face, hand, or footwear are release blockers.
- Use the supplied reference frame as a visual acceptance test, not only as inspiration. The portrait hierarchy is: thin hero frame, full-bleed square hero, dense dark editorial panel, integrated caption phrase, outlined key-message rail, then restrained lower-left footer. Do not substitute floating cards, pills, shadows, or detached caption bars.
- Put captions inside the editorial hierarchy with reserved geometry. Run strict layout checks and inspect the real rendered caption frames; never rely on a copy-only score.

## Instagram, owned-media, and social ads

- Start with one declared 9:16 purpose: **instructional** (teach a durable skill, mechanism, or decision) or **marketing** (make one audience promise and drive one action). Do not mix both intents without an explicit priority.
- For a marketing cut, make the first second establish the audience, energy, or problem; progress through one promise, visible proof, and one primary CTA. A secondary action may appear only as subordinate CTA copy.
- For an instructional cut, organize the portrait page around concept, visual proof, actionable step, and recap. The learner outcome—not urgency—is the primary success measure.
- Use the official 9:16 reference hierarchy when a square hero is specified: true 1:1 media filling the 1012×1012 hero zone, thin frame, dense editorial lower panel, integrated captions, key-message rail, and restrained footer. Never stretch a portrait clip into that square zone or substitute floating cards, detached captions, or decorative gutters.
- Each visual must prove the current spoken or written claim. Character motion can provide energy, but community, challenge, product, or mechanism claims need visible supporting proof; do not fabricate user counts, testimonials, live UI, or outcomes.
- Keep primary mobile copy large and short. Reserve a fixed caption line inside the editorial panel before body, rail, CTA, or footer are placed; validate at phone size and at every scene transition.
- Keep the brand present but not dominant: establish it in the footer/system, then make the end-card primary CTA unmistakable. If no URL, handle, or destination is supplied, record conversion friction as a scoring limitation instead of inventing one.
- When replacing a voice, regenerate every narration clip and its alignment with the new voice ID; compare audio hashes against the previous version and rerender captions from the new alignments. Never reuse another variant’s audio merely because its scene structure matches.
- For music beds, record the exact source, gain, looping/padding treatment, and mix method. Apply the requested gain before mixing (for example, `-18dB`), keep narration authoritative, limit the final mix conservatively, and verify exact output duration after AAC encoding.
- Keep pre-mix narration masters and prior release MP4s. Deliver a new versioned output rather than overwriting a proven master.

## Release honestly

- Run strict HyperFrames checks for both aspect ratios, inspect representative and transition frames, and perform full media decode.
- Score the finished videos—not the brief or assets—using the committed rubric.
- Release only when each rendition scores 40/50 or higher, no criterion is below 3, and no blocker remains.
- Limit automated repair to three local cycles. Escalate unresolved provider, content, or template problems instead of publishing a weak output.
- Do not score, label, or deploy a release until visual template-fidelity proof exists. At minimum retain representative before/after/reference frames and record the reviewer’s finding for hero fill, body preservation, lower-panel hierarchy, captions, CTA, and footer.
- A provider receipt proves a paid request, not a usable asset. Require local dimensions, silent/audio state, endpoint continuity, and full decode before a generated clip enters a render.
- Score vertical marketing outputs with the social-media ad rubric and instructional outputs with the educational-video rubric; use both only when the brief explicitly requires both learning and conversion outcomes.

## Common workflow for Instagram 9:16 video

Use this workflow for every vertical Instagram release. The two content modes below share the same production spine, but they have different success criteria.

### 1. Classify the intent before production

Declare one primary intent in the brief:

- **Educational / instructional:** the viewer should understand a concept, mechanism, sequence, or decision and be able to apply it.
- **Marketing / advertising:** the viewer should recognize an audience-relevant promise, see credible proof, and take one clear action.

If a video needs both, declare which intent is primary and which is secondary. Do not let a call to action displace the lesson in an instructional video, or let excessive explanation bury the conversion goal in an ad.

### 2. Lock the shared technical contract

Before asset generation, record the target as 9:16, normally 1080×1920, the frame rate, duration, audio authority, caption source, provider settings, template family, palette, budget, and quality threshold. For a square-hero portrait template, audit every source panel and motion clip first: the source, Seedance input, Seedance output, montage, and final hero must all be 1:1. The approved hero must fill its exact frame with no `contain`, gutters, accidental stretching, or body-part crop.

Use the official portrait template and its reference frame as a geometry contract. Preserve the reference hierarchy: thin framed hero, dense editorial lower panel, integrated caption phrase, key-message rail, and restrained footer. A render that is technically 1080×1920 but visibly diverges from this hierarchy is not a passing template implementation.

### 3. Build the asset and audio graph once

Search the catalog before generating anything. Generate or select scene-specific visuals, split four-panel Image 2 sheets into true square panels when the hero contract requires it, and reuse the approved asset graph across versions. Generate each voice variant independently from its declared ElevenLabs ID, regenerate its alignment, and prove the final mix contains only the selected voice plus the approved music bed. Keep narration masters, alignment files, music source, gain, provider receipts, hashes, and version lineage.

The composition order is:

1. approved 1:1 or scene media;
2. template frame and editorial panel;
3. copy and alignment-derived captions inside reserved geometry;
4. narration-authoritative audio mix and optional music bed;
5. technical validation, visual inspection, rubric scoring, and delivery.

### 4. Compose for phone viewing

Design at 1080×1920, then inspect at actual phone-size scale. Reserve safe margins before placing text. Keep one primary visual and one communication goal per scene. Establish a caption region before body copy, rails, CTA, or footer; never let captions float as a detached bar or collide with other text. Test the opening, every scene boundary, all caption changes, and the final CTA at phone size.

### 5. Validate and score the finished render

Probe dimensions, frame rate, duration, codecs, audio channels, loudness/mix behavior, and full decode. Confirm that generated motion appears in the intended scene, that the authoritative voice is actually mapped, that captions cover the narration, and that no internal production language remains.

Then score the finished MP4 against the correct rubric. Do not score the brief, source stills, or provider receipts. A release fails automatically for hero gutters, a crop that removes a key body part, caption overlap, missing scene proof, wrong audio authority, or material template/reference divergence.

### Educational / instructional content

Use this scene logic unless the brief specifies a better teaching sequence:

1. **Orient:** name the concept and why it matters.
2. **Show:** present the mechanism, state, or visual example.
3. **Explain:** connect the visible evidence to the learner’s next decision or action.
4. **Recap:** restate the durable takeaway and, if appropriate, give one practice prompt.

Instructional copy should be precise, calm, and economical. Every claim needs visible proof: a diagram, labeled relationship, before/after state, controlled demonstration, or clearly framed example. Motion is a teaching aid, not evidence by itself. Use captions as a parallel readable transcript, not as a replacement for missing visual explanation.

The primary QA questions are: Can a viewer state what was learned? Is the mechanism visible? Does each step appear in the right order? Can the viewer apply it without guessing? Score with the educational rubric and block release when the lesson is visually attractive but not teachable.

### Marketing / advertising content

Use this scene logic unless the brief specifies a better campaign structure:

1. **Hook:** identify the audience, tension, desire, or problem immediately.
2. **Promise:** state one understandable benefit.
3. **Proof:** show product, community, process, or illustrative campaign evidence that supports the promise.
4. **CTA:** make one primary action unmistakable; keep any secondary action subordinate.

Marketing visuals must distinguish illustrative mockups from live product claims. Never invent user counts, testimonials, engagement metrics, functional UI behavior, QR codes, or destinations that were not supplied. Keep the product or offer present before the end card, and make the final CTA legible without competing captions or decorative elements.

The primary QA questions are: Is the audience clear in the first second? Is the promise singular? Does the visual actually prove it? Is the product recognizable? Can the viewer identify exactly what to do next? Score with the social-ad rubric; energetic character motion alone cannot substitute for proof, product presence, or conversion clarity.

### Required release record

For every Instagram version, retain the manifest, build-plan key message, scene map, template and palette IDs, source and output aspect-ratio audit, voice ID and audio hash, music gain, provider receipts and actual spend, representative reference frames, validation output, rubric scorecard, delivery path, and any repair history. If a check was not run, report it as unverified and do not label the video released.
