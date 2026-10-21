# The Visible Mass P4.2 — photographic Mass Explorer bridge (17 October 2026)

Status: **experimental standalone visitor, review-only; not production**. Draft PR #1309. User-facing offline attachment: `The_Visible_Mass_P4_2_Immersive_Mass_Explorer.html` (about 23.5 MB, original CC-attributed photographic assets embedded). The attachment is not committed to Git and is not a source of truth.

## What changed since P4.1

- The visitor's **Witness the Mass** entry opens a photo-first study drawer over the current scene instead of dumping a large study document onto the sanctuary.
- It starts with the **three existing, independently sourced traditional-Mass photographs** (foot of altar, Elevation, Ecce Agnus Dei), then presents **five collapsible Mass Map phases** and the **32 original certified Sung Guide moments** (`PRE.ASPERGES`, `AO.CARD.001`–`AO.CARD.030`, `POST.MASS`).
- The offline HTML embeds *only the existing Guide moment label and short text* per step as a transparent snapshot. The published source remains `data/presentation/guide-registry.v1.json`; the production learning owner remains `src/learn/mass-explorer.js`. This snapshot will not silently update.
- Guide moments link to the existing `MF01–MF08` lessons only via curated links already owned in `src/learn/mass-moments-study.js`. Related photographs are **contextual**, not verified to depict the exact phase of both Host and Chalice elevations. The three real photographs occurred at **separate churches**, never represented as the London Oratory.
- Users can return from a Guide moment to the same phase, navigate previous/next, open a related actual ceremony photograph, and close to the original photographic scene. The six original same-photo sanctuary object markers and their research-only questions remain intact.
- No Mass reader code, LIVE's 48-card concept, Glossary G### record, object/question source register, calendar, liturgical rubric, sermon or production route was modified.

## New source adapter and contract

- `photographic-mass-explorer-bridge.mjs` dynamically projects an exact read-only 32-step map from `data/presentation/guide-registry.v1.json`, the existing Mass Map and source-verified Formation-stage links. It refuses unsupported Mass forms, uncertified registries, and incomplete stage sets.
- `tests/visible-mass-mass-explorer-bridge.mjs` adds a contract for 32 Guide identities, five phases (1/9/9/7/6), eight Formation owners, three context photos, and `AO.CARD.015/016/024` mapping. It is code committed for CI/in-repo execution; adding it is not a claim that GitHub Actions has already passed.
- The existing photo-explorer source owner and six subject/photo bindings remain in `photographic-scene-bridge.mjs` and the parallel Phase 1 research files.

## Observed checks

The **standalone HTML** passed Chromium desktop 1280×820 and mobile emulation 390×844, rendered from its embedded model (browser policy blocked direct file navigation). Checked: 32 moment controls, canonical Host consecration guide, contextual Elevation photograph and Formation stage links, returning to the map, all eight Formation stages, the six sanctuary hotspots, and error-free JavaScript in both layouts. Photographs and original P4.1 360 renderer were preserved unchanged by this pass. This is not actual handset testing.

## Before release

Real-device GPU panorama orientation and pinch performance; image and attribution QA; object hit-target precision; English/French content parity; safe lifecycle/route binding into the in-app published Mass Explorer; mobile memory and production tiled loading; review of the photo-context distinctions; canonical 48-LIVE-reader noninterference. Do not merge this PR or publish the offline snapshot without these gates.
