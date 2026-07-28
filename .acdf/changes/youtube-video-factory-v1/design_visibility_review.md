# Design Visibility Review

Source lenses: Engineering Council cards in `/Users/alannguyen/Documents/Vibe Code/UCC-video-slide-generator/Engineering_Council 2`.

## Bret Taylor: Product Outcome

Finding: GitHub readers could not evaluate the factory's visual value because the README only claimed that layouts and palettes existed.

Update: Make README self-sufficient and point immediately to a visible `DESIGN_SYSTEM.md` catalog.

## Mitchell Hashimoto: Zero-Friction Entry

Finding: A design registry hidden in TypeScript is not a usable public primitive.

Update: Generate committed PNG layout previews and Markdown tables directly from the registry.

## Ryan Lopopolo: Mechanical Harness

Finding: Documentation promises must be mechanically tied to registry reality.

Update: Add docs-sync tests proving every layout, palette, and IBM Plex family member is visible in committed docs and renderer code.

## Simon Willison / Nicholas Carlini: Evidence And Boundaries

Finding: Provider and reference handling should remain explicit and not rely on prompt wording.

Update: README now includes quarantine, provider approval, environment-only secrets, and live-provider verification boundaries in the main workflow.

## Decision

Proceed with the design visibility update as `t04-design-visibility`.
