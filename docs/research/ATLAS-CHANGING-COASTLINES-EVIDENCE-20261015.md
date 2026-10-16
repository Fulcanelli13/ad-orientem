# Biblical Atlas — source-scoped changing coastlines, contextual review
**15 October 2026 · #342 · Owner:** Existing `src/find/bible-atlas.js` historical-detail sheet, not a second geography or storyline owner.

## Reason for the change

The public-domain Natural Earth physical map in opt-in `?atlasCinema=1` has **modern shorelines**. Their geometry cannot be used to infer the first-century harbour environment of St Paul's travels. This limitation is particularly material at **Ephesus** and **Miletus**, where published geoarchaeology establishes profound coastline and harbour changes. Existing 151-event Scripture references, source-qualified settlement pins, and the modern-shoreline disclaimer remain authoritative and unchanged.

The current double-opt-in `?atlasCinema=1&atlasHistory=1`, used for **historical-name research notes**, now also exposes a distinct, collapsed **Ancient landscape / Ancien paysage** evidence note **only on the existing APOSTLES-era Ephesus and Miletus stops**. These notes do not change what the Biblical narrative says or impose assistant-authored Scripture narratives. They summarize precise geographic research and link to the relevant original archaeology.

| Place | Strong contemporary evidence | Limitation |
| --- | --- | --- |
| **Ephesus** | [UNESCO Ephesus](https://whc.unesco.org/en/list/1018/) documents changing Kaystros shoreline, repeated harbour locations and Hellenistic/Roman settlements; [Stock et al. (2016)](https://doi.org/10.1002/esp.3914) reports multi-proxy harbour siltation evidence | The present estuary/coastline cannot draw a first-century port, channel route or a precise Acts scene |
| **Miletus** | [University of Hamburg, Milesian landscape](https://www.miletgrabung.uni-hamburg.de/en/milet/milet-landschaft.html) reconstructs a peninsula in the Latmian Gulf and sediment infill, with Lake Bafa a remnant; [Miletus excavations](https://www.miletgrabung.uni-hamburg.de/en/milet.html) documents the settlement's phases | No source-verified first-century shoreline polygon/harbour coordinates have been licensed, extracted or admitted; do not project Paul's Acts 20:17 meeting onto current sea-level geomorphology |

## Non-negotiable source limits

The note records are `SOURCE_ATTESTED_TOPOGRAPHIC_CHANGE_NO_GEOMETRY`; they have no GeoJSON, latitudes, longitudes or alteration rights. Ancient coastal land-water boundaries require *dated*, reproducibly traced original figures, georeferencing and independent archaeological validation. We **must not trace** an unlabeled photograph or infer historical coastlines from present-day satellite maps. Links to scholarly figures are consultative only; no reproduction or permission process is initiated. The existing modern shoreline remains unaltered.

Each UI card has a bilateral English/French interpretation and two source links. The active scene’s narrative and Scripture button, 151-event order, 35 original place identities and 22 bilingual map labels are unaffected. The card is hidden for unrelated places, other eras, ordinary `?atlasCinema=1` review, and default app.

## Acceptance and follow-up

Source tests assert all source domains, no new coordinates, two exact era/site bindings, bilingual caveat, valid Scripture and no default-mode change; 320px, 390px and 768px Chromium tests open the real app, select both canonical source stops, expand the source notes, verify cited links and existing Scripture handoff, and capture screenshots. **A passing browser capture does not certify Android touch-screen drag/Follow**, which requires a physical handset.

Additional historical-name research (#1242 and #1246) remains under the existing Phase 2 ledger. No extra gazetteer, additional chapter, original-book text or artwork was imported. This is a narrow, externally source-attested historical geography aid; *not* a release of first-century coastal geometry or new saint/Scripture content.
