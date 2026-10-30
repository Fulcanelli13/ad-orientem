# Directory photography P104 — three source-backed physical church reconciliations

This batch is **distinct** from the Sacred Places canonical P104 seven-site release and does **not** modify its 529-Place registry or 22 confirmed Directory-to-Place links. The Sacred Places owner owns canonical promotion and deduplication.

| Photo | Source-backed physical site | Frozen R49 venue | Geo discrepancy | Resolution |
|---|---|---|---:|---|
| **#61 Hannover St Clemens** | [Official basilica](https://www.st-clemens-hannover.de/anfahrt/) and [independent named-building coordinates](https://www.visit-a-church.info/sacred-buildings/church/detail/1526608833421?lang=en), 52.37300, 9.72681 | FSSP existing venue | **1.6 m** | **Ready for Sacred Places owner to publish 1 canonical Place and 1 exact LOCATED_AT link**, after checking duplicate/pending work. [Basilica's own timetable](https://www.st-clemens-hannover.de/gottesdienste/) names FSSP and the extraordinary-form Sunday Mass; no Mass-time changes introduced here |
| **#71 Kolbermoor Bruder Konrad** | [SSPX chapel listing](https://map.fsspx.org/de/places/kapelle-hl-bruder-konrad), independently named [OSM building way 114455016](https://mapcarta.com/W114455016), 47.85249, 12.05936 | SSPXMAP:OPE-002331 | **1,739.5 m** from R49 marker, precision SOURCE_MARKER_UNASSESSED | **HOLD** exact link until Directory geolocation corrected; OSM lists address *Glasberg 9a*, official SSPX lists *Theodor-Fontane-Str. 7*. Both address sources need reconciliation before pretending the map pin is exact |
| **#195 Blandford Forum** | [Plymouth Diocese](https://www.plymouth-diocese.org.uk/church/blandford-forum-lady-lourdes-st-cecilia/), [parish](https://blandfordcatholics.org/contact-us/), [Wikidata-backed Commons building coordinates](https://commons.wikimedia.org/wiki/Category:Church_of_Our_Lady_of_Lourdes_and_St_Cecilia,_Blandford_Forum), 50.860163889, -2.166302778 | AO-B34-L-GB-52D1803A1F95, **research-only; no R49 row** | N/A | **HOLD** Directory LOCATED_AT link and all TLM schedule claims until an operational venue with independently verified traditional-rite identity exists |

The machine-readable [P104 evidence](./p104-three-place-evidence.json) contains complete proposed Place objects, two independent sources per location, frozen IDs, geolocation provenance and one proposed Hannover link. All three records are *proposals*; **none has been inserted in a live registry**. In-memory schema validation tests a theoretical 532 Places / 23 links but does **not** apply that change.

## Why this is progress, not publication

Hannover is now fully specified for a clean canonical Place promotion without missing identity fields. Kolbermoor has a documented **1.74 km** misplaced legacy pin, which would otherwise misdirect visitors; Blandford has a clear church building but cannot be assumed to offer a current Traditional Latin Mass. These distinctions are now permanent and test-enforced instead of hidden in image review notes.

Avoid creating competing source or Place IDs in the parallel Sacred Places branch. On owner acceptance, the correct release sequence is canonical Place + source registry + crosswalk + release-chain update, then exact confirmed Directory link with the frozen venue ID, then separate photographic pixel/rights/editorial gates. No photographer contact, no fees, no new images, no changes to calendars or Mass schedules.

Photo integrity remains **11 independently hashed originals (10 fully decoded), 20 held**, and photo identity audit remains **385 = 90 rejected + 83 corroborated research-only + 212 unresolved**. Four exact previews (#77, #110, #204, #261) remain held.

Validation: `node tests/directory-photo-p104-three-place-reconciliation.mjs`; this test is part of the existing `test:directory` chain on the research branch.
