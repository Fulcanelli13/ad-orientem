# Biblical Atlas — 37 smaller Scripture reading chapters (15 October 2026)

## Ownership and provenance
This changes the **existing canonical app**, not the draft #1069 narrative, Bible genealogy, map, independent Atlas, or source parsing pipeline. The 37 chapter titles, memberships and ordered `biblical:* eventKey` IDs are a **read-only published-navigation projection** of the already classified draft #1069 source research:
- `data/explore/biblical-reading-continuity-review.v1.json`, original draft branch `feature/biblical-atlas-current-main-convergence-20261012`
- **Exact donor Git blob:** `8ea13c49c0285330bc0bcfe6aa3cbcf79d14c2c8` (37 groups; 151 unique original keys).
- Donor was explicitly `RESEARCH_ONLY_NOT_PUBLICATION_CERTIFIED` for its *authored chapter prose*, which is **not imported at all**. The labels are used solely as compact navigational headings (e.g. Creation/Fall, Jacob, Passion, St Paul), not as an original Bible-history retelling.
- The original `src/find/bible-atlas.js` `buildBibleAtlas` and `src/find/browser-entry.js` remain the one map/time/reader owner.

## User experience
At the **normal, unflagged GitHub Pages app**, open **Explore → Biblical Atlas**. The first pill on its existing one-line 11-era ribbon is **Stories · 37 / Récits · 37**. Tap for a compact vertically scrollable contents tray grouped under the 11 existing eras. Select a smaller Scripture chapter to jump **on the original timeline** to its first original event. The existing event detail's **Read Scripture** opens the original native Catholic reader; close it to return to the map and event. Every deliberate selection shares the existing device-local `biblical:* eventKey` bookmark added in #1254; revisit Atlas to resume. Nothing about opening the contents or tapping map Follow overwrites that bookmark.

All 151 selected events are partitioned in their original sequence **once and only once**; these labels do not add 151 authored biblical prose chapters. The tray explicitly identifies **selected Scripture episodes, not an abridged or complete Bible**. Source references, canonical event IDs and qualified geographical pins remain exactly unchanged. No AI-authored biblical narrative, no reconstructed dialogue, no conflation of distinct source scenes, no extrapolated routes, no maps/rights requests, no calendar/saints/art overlap.

## Evidence
- `tests/atlas-scripture-reading-chapters.mjs`: 37 chapters, 151 exactly once, 11 original eras, stable order/source keys/Scripture, English/French headings, fail-closed on source drift, and one original map.
- `tests/atlas-scripture-reading-chapters-phone.mjs`: Playwright Chromium normal **unflagged** page, 320/390/768 responsive, no document horizontal overflow, contents scroll, original Scripture open/back and canonical selected-scene persistence after app navigation; screenshot artifact for qualitative mobile layout QA.
- Existing Atlas 151, map physical, cinematic, pan/follow, contextual notes, native reader, R53 and main-gate CI must remain green.

## Remaining phases
The donor #1069 independently owns **10 proposed arcs, 39 183-scene research stories, nine cross-era themes, 37 chapter prose acceptance, and original Catholic author Schuster/Knecht source parsing**. These are not automatically certified or moved to production by this small reading-index UI. The 3,231-person genealogy research in #1018 remains unmerged, with unsafe relationship edges held. This feature does not declare a full Bible available and does not replace physical Android Chrome thumb/drag/Follow testing. The normal-app selector is designed to expose a substantive, useful chapter index without leaking unreviewed source-based claims or AI-written prose.
