# HyperFrames gates

HyperFrames is the required composition and rendering engine.

- Use one standalone top-level composition per deliverable.
- Set explicit root width, height, frame rate, ID, and duration.
- Use direct timed clips with explicit start, duration, and track.
- Register exactly one synchronous paused GSAP timeline.
- Use unique stable element/media IDs.
- Let HyperFrames own video/audio playback, scene timing, captions, preview, and final rendering.
- Do not use render-time clocks, live network requests, unseeded randomness, or infinite loops.

Required gate:

1. Pinned doctor payload is healthy.
2. Compiler output is deterministic across two runs.
3. Strict check with scene and transition snapshots passes.
4. Human inspects the Studio preview, especially late scenes and media seeking.
5. Exact preview composition is approved by hash.
6. High-quality render completes.
7. FFprobe and a full decode confirm resolution, FPS, codecs, duration, and clean streams.

A passing mechanical check does not substitute for preview approval.
