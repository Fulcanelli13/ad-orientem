# Sacred Atlas — consolidated 412-candidate admission board
**8 November 2026 · Owner review preparation only · Not imported or published**

This is the first complete disjoint intake of the Stage25 **412 Claude-proposed noncanonical Places** from the original 942-row source (530 then-public Sacred Places plus 412 proposals). It reconciles the **169-candidate first-intake owner packet** and the **243-candidate complementary cohort**, including the 150 individually page-screened standard/qualified candidates and the 40 original complement rows lacking source coordinates.

The authoritative machine-readable [412-record owner admission board](./sacred-atlas-412-consolidated-owner-admission-board-20261108.v1.json) retains **every candidate source ID**, its lane, submitted title, country, source/evidence links, last known illustrative point and precision, near-existing-place qualification, reuse relationships and explicit unapproved publication gates.

| Editorial route | Candidates | What an owner decision would do |
| --- | ---: | --- |
| **Owner review presentable** | **334** | May review *source site*, *display title*, *physical identity* and *illustrative location* together; no one-click release is implied |
| **Already on unmerged draft — signoff only** | **2** | Do not create duplicates of existing 535 draft Place identities |
| **Reuse existing canonical Place** | **4** | Create a devotion, alias or related-place link; **no additional pin** |
| **Historical / non-Catholic heritage** | **54** | Keep in source-aware Sacred Heritage / Historia or site-history views, **not** labelled as active Catholic churches |
| **Separate P107 draft** | **6** | Controlled by PR #2541; do not silently copy these through PR #2490 |
| **Physical-site identity holds** | **11** | Need named building/complex disambiguation or proof of current site before reviewer admission |
| **Qualified coordinate, not feature anchored** | **1** | Rakunai, PNG: pilgrimage settlement established, exact church feature unproven |
| **Total** | **412** | **0 approvals**, **0 new public pins**, **0 imports** |

These are **editorial routing counts, not 334 certified Place records**. Some have title, rite, legal-rank or map-location qualifications. A staged centre/OSM anchor must never be described as the exact entrance or a guaranteed route. The Atlas is for discovery: the user can open an external mapping/search service for navigation after seeing appropriate accuracy labels.

## Cross-system controls to preserve

**Physical Place identity vs liturgical affiliation.** A current Catholic place can be Latin, Eastern Catholic, multi-rite, heritage-only or a complex with several churches. Do not assume a 1962 Mass schedule from source labels or proximity. Corrected cases: Saint-Eugène Paris uses both 1962 and 1970 missals; Ľutina is Greek Catholic; Saint Hildegard's pilgrimage church differs from modern abbey; Ujarrás active shrine differs from ruins; Santuario del Santo Cristo de La Grita differs from nearby basilica; Bethlehem Saint Catherine is a distinct adjacent church; Santuario di Bonaria comprises distinct basilica and older chapel.

**Duplicate prevention.** Two candidate devotional/site records from the complementary 243 explicitly link to current canonical churches; additional original missing-coordinate identities have been resolved to **Rawang Saint Jude** and **Carmelo Santuario del Carmen**. These four must not create duplicate church pins. The two first-intake draft-place signoffs similarly refer to already-existing unpublished Places. The separate P107 six are not auto-promoted.

**Heritage.** Fifty-four candidates should not be labelled an operating contemporary Catholic church. Includes Nidaros, Armenian Apostolic heritage, Lalibela, demolished Heilige Stede Amsterdam and historically Catholic monuments not presently Catholic worship sites.

**Eleven identity holds and one geometry hold.** The final 150-source review includes five named holds (Lubumbashi, Blanot proposed separate miracle chapel, Cupey construction/identity, Dili Fátima, Lodonga); the early 169 includes Isiro unfinished building; the second roster includes Tianjin Lourdes and Tarlac Holy Cross physical identity; three original F-lane candidates remain Bergamo ambiguous dedication, Sittard unspecified chapel and Tshitanini prospective vs Nweli active shrine. Rakunai settlement site is retained as a coordinate lead but not an exact church location.

**Material marker corrections protected by tests.** Saint Cono chapel Florida Uruguay uses **-34.0942,-56.2112**, not the prior cathedral point **-34.09417,-56.21338**; Kildare Tully Saint Brigid's Well is not the Kilcullen namesake; La Merced León city is not the ruins at León Viejo; Urkupiña's existing San Ildefonso shrine is not proposed new basilica.

## Country-area and app integration

A proposed civil **country** requires `codes.iso_alpha2` by the current `geography-contracts.js` validation contract. **Four structurally compatible but unapproved research proposals** remain `BF`, `HT`, `TL`, `TR`.

Kosovo's user-assigned **`XK` is NOT an assigned ISO-3166-1 alpha-2 code**. Draft code now provides an *operational territory* with `geo_area_id: "geo:territory:XK"`, `area_system: "CIVIL"`, `area_type: "other"`, and `codes.operational_alpha2:"XK"`. The Atlas coverage resolver accepts only this explicit GeoArea, never a GPS-derived assumption, and the validator rejects spoofing `codes.iso_alpha2:"XK"`. This is exercised by an in-memory synthetic dataset in `tests/atlas-kosovo-operational-code.mjs`. **No fifth area or any other new area was inserted in the canonical registry.** The 4 heritage-only missing-area codes `AM`, `CY`, `ET`, `TN` remain deferred.

## Mainline reconciliation and release order

This board was assembled from the 7 Nov branch alongside an **8 Nov `main` head** which contains later directory R28 approximate-marker changes. Those CL2 Directory approvals are distinct from Sacred Atlas Place admissions. At the earlier check, the research branch was 58 commits behind the default branch, with no current file-level merge conflicts reported.

1. Validate code and 412-record board in exact-head GitHub Actions; explicitly review any failed jobs. No new Places should be imported on a green source-screening test alone.
2. Synchronize `main` **into the draft feature branch**, not the other way around, preserving 535 draft Place identities and the existing owner approvals/non-approvals; ensure downstream user-facing MapCN, Explore and Registry regressions.
3. Produce owner-review batches from the 334 presentable cases. Each admission must be an explicit decision on the named physical site, its correct title/custody/rite, and illustrative point. More approximate-location tolerance **does not imply** site identity or publication consent.
4. Add any genuinely approved areas, and only then import newly approved Place records with source references, stable Place IDs and publication checks. Never infer blanket approval from repeated "ok next" research instructions.
5. Use GitHub Actions + GitHub Pages exclusively for public release. **No Vercel deployment.**

All currently staged values remain review-only. This report is not a release authorization.
