# The Visible Mass — Living Glossary P1 (experimental)

## Goal
A scene-first, photographic **living glossary** for the **1962 traditional Roman Mass**; never an unrelated gallery. The virtual church is the discovery surface. Each clickable object reuses the existing canonical glossary G### record, with detailed photography, historical/technical illustration, source and licence, and (when approved) Sacred Art links.

## October 17 prototype
- Combined the existing offline 2.5D sanctuary explorer with an object-photography review panel. Delivered to the user as a 3.2MB, single-file HTML prototype. The single scene remains AI-generated, with simulated depth; this is *not* an authentic 3D reconstruction.
- 22 glossary concepts are represented; 20 have candidate photographic/illustrative references. There are 36 candidate assignments, corresponding to 27 unique Commons filenames requested (one temporary asset download failure).
- The source-owned entries are read from `data/glossary/concepts-001-150.v1.json`, `...151-300...`, and `...301-450...`, not independently re-authored content. The offline HTML embeds a snapshot.
- Existing reviewer scores are preserved when the same Commons image is reused, notably Benzinger centre altar card 5/5 and Venetian cards 3/5.
- Image metadata distinguishes object photographs, context-only altar views, technical illustrations, and historically earlier examples. These are **candidates**, not approved liturgical photographs or approved artwork.
- Browser acceptance: Chromium tested scene load, catalogue (36 photo candidates + 2 uncovered concepts), family filters, 0–5 scores, glossary panel opening, back navigation and ratings-export control; no JavaScript exceptions. Mobile catalogue rendered at 390×844.

## Gaps, not fake completion
1. **G187 corporal** and **G188 purificator**: no isolated photographic example acquired; do not silently reuse an unrelated cloth.
2. **G214 Roman Missal**: historic manuscript and contextual view are **not** an authenticated 1962 Missal close-up.
3. **G215 missal stand**, **G184 credence table**, and **G195 incense boat**: current images are contextual, not approved macro object photography.
4. Sacred Art/paintings must be linked by canonical Sacred Art record ID after the established curation; avoid duplicate catalogues and don't use historical paintings as 1962 rubrical evidence.
5. The current scene cannot support unrestricted real 3D walking, and side rooms/objects need their own scenes or 3D assets.

## Acquisition & delivery
- Builder: `tools/build-visible-mass-living-object-photos.py`
- GitHub Action: `.github/workflows/visible-mass-living-object-photos.yml`
- Its HTML acquisition artifact contains a 20-object photo rating catalogue and per-image Commons source/creator/licence data. Frontend 5D integration is currently a **local proof**, not merged.
- Keep this draft PR unmerged until actual-user acceptance of imagery and navigation. Do not change any production Mass-reader behaviour.
