# Biblical Atlas — existing-source ten arcs and nine thematic reading groups (16 October 2026)

This is **navigation, not source narrative**. No AI-authored Bible retelling is introduced, no complete 73-book coverage is claimed, and no research-only theology is automatically promoted.

## Ownership and exact donor provenance
- Canonical Atlas: `src/find/bible-atlas.js` and `src/find/browser-entry.js` — existing 151 event timeline, one map, original Catholic Scripture reader, and previously merged eventKey resume (#1254).
- Existing smaller chapters: `src/find/bible-atlas-reading-chapters.js`, 37 bilingual headings and the 151 canonical eventKeys, merged #1255.
- Donor classifications: draft #1069, `data/explore/biblical-narrative-journeys-review.v1.json`, Git blob **`7d1e3a1d1ed719ac3440d1b0d180fde6a9ee5951`**, source 10 arc titles and 9 theme titles.
- Exact event–research-scene citation-only crosswalk: same draft #1069 `data/explore/biblical-reading-continuity-review.v1.json`, Git blob **`8ea13c49c0285330bc0bcfe6aa3cbcf79d14c2c8`**.

## Published navigation boundary
The existing **Stories · 37 / Récits · 37** tray gains three tabs, remaining within the original Atlas map:
1. **37 chapters:** the previously merged compact bilingual selected Scripture sequence.
2. **10 arcs:** broad journeys (History of Salvation; Beginnings; Story of Israel; Abraham; Exodus; Kingdom and Prophets; Exile and Return; Life of Christ; Apostolic Church; Apocalypse). Arc membership is calculated from original era keys, and lists the **same** 37 chapters. It does not imply source prose has been accepted for every underlying episode.
3. **9 themes:** provisional source-based comparisons with **exact** underlying Scripture-citation identity from the 183-scene donor, resolved to the canonical 151 eventKey list. The nine are Promises and Covenants; Sacrifice and Passover; God Calls His People; Prayer and Intercession; Signs and Miracles; Women of Sacred Scripture; Kingdom and Mercy; Prophecy and Fulfilment; and Journey, Exile and Homecoming.

Thematic exact matches by donor order: **3, 6, 4, 4, 16, 8, 0, 5, 5**. `theme:kingdom-and-mercy` is visible but has **no navigable source match yet**. A zero is NOT filled with an inferred or doctrinally plausible event. Overlap-only scenes, research-only typological suggestions, questionable same-verse correlations, 3,231 research genealogy entries, and unverified maps/art are all expressly excluded from publication.

Every usable row navigates a **canonical Scripture episode with its original verse/reference**. The original `data-bible-reading-start` event handler, user scene bookmark, map pin and full Catholic Scripture entry own the navigation. There is **no second timeline, new journey bookmark, research prose or source-book import**, and no automatic compression of an arc into AI storytelling. This delivers thematic browse and bounded source navigation now, while author-text review continues independently.

## Tests
- `tests/atlas-reading-arcs-themes.mjs` verifies the original 151 events, 37 chapters, ten source era-based arcs, nine original research titles, exact donor theme match counts, held zero-match theme, EN/FR, no extra map.
- Existing `tests/atlas-scripture-reading-chapters-phone.mjs` now opens the normal unflagged app on Chromium mobile, checks tabs and disclosures, confirms 12 small chapters in the Life of Christ, 16 exact Scripture matches under Signs and Miracles, and refuses unsupported Kingdom and Mercy links. It verifies event jump, native Scripture open/back, canonical reading-place resume and responsive layout at 320, 390 and 768px.
- Original CI checks must remain successful (151-event acceptance, physical map, default map, free-pan, historical and landscape sources, mobile architecture and main gate).

## Holds
Theme classifications remain editorial **provisional**: the exact Scripture match proves common citation identity with a donor research scene, not a Catholic typological or doctrinal interpretation. Scripture itself must be the only published narrative until complete original Catholic-author text/translation review is accepted. Actual physical Android drag/Follow is not certified by Playwright mobile emulation. The user’s main canonical GitHub Pages URL must deploy this commit before claiming live availability.
