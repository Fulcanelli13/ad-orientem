# R17 GitHub convergence delta map

Date: 2026-10-03

This branch treats current `main/index.html` as the application trunk. It does **not** import the non-Mass v3.4.18 monolith as a second app.

## Keep from current GitHub trunk

- Home / Today shell
- Calendar and saint surfaces
- PRAY and its existing prayer corpus
- Learn / catechism
- Settings shell and existing persistence
- Existing pre-Mass `AO_CELEBRATION_API` and rubrical/preflight UI
- Existing Proper retrieval/resolution until extracted behind an equivalent contract

## Replace / converge

- Mass canonical event/session engine: R17 modular engine
- Mass form resolution: LOW / MISSA CANTATA SIMPLE / MISSA CANTATA WITH INCENSE / SOLEMN
- Exceptional rites / overlays / following actions: R17 graph registry
- Mass reader state contract: MISSAL / SIMPLE / LIVE, persistent posture/position, transient gesture, audio/schola ownership
- Mass UI: converge after the R17 entry boundary is proven against the production host

## Add only if missing

From the v3.4.18 non-Mass recovery line:

- proven cross-marker corrections
- missing v4.8 icon-bank semantic assets/bindings
- final font/motion harmonization where GitHub is still older
- mobile hit-area / keyboard / safe-area hardening
- single haptics ownership repair

These are delta patches, not a wholesale PRAY transplant.

## Ignore / do not duplicate

- duplicate PRAY application shell
- second prayer database
- second settings system
- second calendar resolver
- v3.4.18 legacy Mass renderer as canonical runtime

## Current landing stage

`src/mass/browser-entry.js` is the first production boundary. It intercepts only the final `[data-ao-start-live]` action at `window` capture phase, compiles and validates the Mass through R17, and only then delegates the existing live DOM renderer.

This is intentionally transitional:

- canonical/session owner = R17
- DOM reader owner = legacy, temporarily

The next landing replaces the DOM reader while preserving this entry/session boundary.
