# Pitrè 1900 original edition — all 422 indexed source details page-verified

Date: **24 October 2026**. Repository: `Fulcanelli13/ad-orientem`. Research branch: `research/customs-full-registry-census-20261023`; draft PR #1572. **This is an evidence workbench result, not a production release.**

## Outcome

Original source: **Giuseppe Pitrè**, *Feste patronali in Sicilia*, Carlo Clausen, Torino–Palermo, **1900**, vol. XXI of *Biblioteca delle tradizioni popolari siciliane*. Verified the original printed edition through the user-uploaded compressed University of Michigan / Internet Archive scan, archive item `afm3499.0021.001.umich.edu`, file SHA-256 `100e2b3164bd7a342c5c0c5d01df2a60b4635d5695dea456e9b93769866ee5ee` (4,476,151 bytes, 632 PDF pages).

Every **one of the 422 already-indexed source/detail observations** has an individual **1900 original printed page number, one-based scan PDF page number and text-matched original Italian evidence anchor**. All relevant page images were inspected in the original scanned edition, including contact sheets for systematic locality-group verification. The 422 row-to-page matches collectively touch **144 distinct scan PDF pages**. This *does not imply that all 632 pages of the book were exhaustively mined or that every 1900 custom was recovered*.

| Original-source intake | Indexed source/detail observations | Directly page-checked |
| --- | ---: | ---: |
| Original first-wave P0 critical cases | 25 | 25 |
| Original first-wave P1 dates/variants | 17 | 17 |
| Original first-wave P2 remainder | 87 | 87 |
| Subsequently extracted seven sections (stage01+stage02) | 121 | 121 |
| Subsequently extracted Wave03 six-section high-risk checks | 16 | 16 |
| Wave03 remaining six sections (this final pass) | 156 | 156 |
| **Total** | **422** | **422** |

New source rows added **in this original-page verification pass: 0**. Unified undeduplicated working corpus remains **3,407 source/detail observations**; **408 provisional groups** remain unchanged. **No unique Catholic custom certified, no historical-source independence established, no Roman Ritual / 1962 rite authenticated, no modern recurring Calendar date approved, and no app publication**.

## Second bulk verification pass: exact 156/156

The 156 records represent the **last unverified** observations from six original Pitrè historical feast sections:

| Historical feast/locality complex | Newly checked folio records |
| --- | ---: |
| Messina — Assumption, Giants and Bara/Vara | 43 |
| Ragusa — St George and St John the Baptist | 37 |
| Scicli — Madonna delle Milizie | 29 |
| Comiso — Easter encounter (*paci*) | 15 |
| Mazara del Vallo — St Vitus | 18 |
| Calatafimi — Holy Crucifix | 14 |
| **Total** | **156** |

Each record in `data/customs/master/pitre-1900-uploaded-facsimile-156-wave03-remaining-original-page-verifications.v1.json` contains its **unchanged stable ID** (`PIT1900-NEW-122` through `PIT1900-NEW-293`, excluding the 16 previously checked high-risk rows), 1900 Internet Archive OCR-line locator, action description, locality, original printed page, one-based compressed PDF scan page, and normalized Italian searchable anchor.

Each of the 156 anchors matched **exactly once** on the assigned original scan page's normalized PDF text layer; the 49 distinct relevant source-page images were reviewed. Ambiguous first-pass matches were corrected from the surrounding Italian text before promotion, including Messina's rotating machinery and formerly attached children, Scicli's Marian battle pageant, Comiso's statue encounter, Ragusa's discontinued Sarda, and the historical river animal games in Mazara.

PDF-page arithmetic was checked against the original book's running printed page numbers; Messina contains inserted plates so a single global PDF/printed offset **must not** be assumed for the entire volume. Italian evidence anchors are normalized OCR **search locators**, not exact original facsimile quotations.

## Examples of precise author-source page confirmations

- **Messina**, printed pp. 147–168 (PDF scan 209–226, with plate-related discontinuity): former municipal fair customs were already historical memories for Pitrè; the live child performers on the *Bara* belong to an earlier version and are a historical safety issue, not a suggested contemporary devotional act.
- **Ragusa**, pp. 323–332 (scan 381–390): Pitrè records the now-abandoned *Sarda* horseback procession, decorated St George breads and later St John figural displays; reported healing and claims about purported relics remain unverified.
- **Scicli**, pp. 333–341 (scan 391–399): original battle-story staging and processional angel figures, and a reported unusual sung Mass around 2 a.m.; an alleged papal *breve* remains **unverified against the original pontifical document**. The author's earlier 1881 work is **not** an independent witness.
- **Comiso**, pp. 343–348 (scan 401–406): Easter `paci` image encounters appear alongside complaints about local religious factional rivalry. These are not approved rubrics for an existing Mass reader or Calendar.
- **Mazara del Vallo**, pp. 496–500 (scan 554–558): St Vitus river and sea activities include harmful historic animal games, not a Catholic practice suitable for recommendation.
- **Calatafimi**, pp. 501–504 (scan 559–562): the local *riali* allegorical procession and its documented nonannual/decennial variants remain separate from fixed-year liturgical calendar dates.

## Canonical research state and non-loss controls

The final source page evidence was reconciled into `data/customs/master/comprehensive-customs-working-catalogue.v1.json` without changing any Pitrè stable IDs, original 71 comparison pairs, 47 original exception reviews, the 408 provisional practice groups, or the 3,407 overall source/detail row count. Original Pitrè 1900 first-wave count **129/129**, newer count **293/293**, total **422/422**.

The dated research queues with 364, 277, and 156 entries have deliberately **not been rewritten or deleted**; they remain historical snapshots describing earlier work. The **current** authoritative queue is `data/customs/master/pitre-1900-current-zero-outstanding-original-edition-page-queue.v1.json` with **zero source-page verification records remaining**.

The primary historical author, alleged miracles, old correspondence, episcopal approbation, saint's relic authenticity and any claim of continuity to the modern day remain separate gates. Pitrè frequently compiles statements from correspondents and earlier texts and should not be confused with eyewitness attestation of all 422 records. Differences between editions or between Pitrè 1881 and 1900 do not establish independence.

A dedicated CI gate `tests/customs-pitre-1900-final-422-original-page-evidence-complete.mjs` crosschecks all 156 final records against the original Wave03 stable source IDs and labels, precise PDF/printed-page correspondence, per-source Italian anchor entries, no duplicate IDs, all 422 evidence records, 144-page union, the closed page-lookup queue, and unchanged identity/Calendar/ritual/app release gates. Existing earlier-stage tests are retained to lock their own underlying historical snapshot counts while accepting the current 422/422 verified master.

## Next strategy: mine untouched chapters, not review these 422 again

The original 1900 preface describes **60 patronal feast descriptions concerning 92 Sicilian municipalities**; the newly completed verification covers *already-indexed observations* and is **not an exhaustive scan of all traditions mentioned in the volume**. Next work should inventory original chapter/locality coverage, identify chapters **not mined**, and extract substantial new observation batches with the page-addressable PDF available from the start (target 100–200 genuine source observations per full batch). Deduplicate potential overlaps and maintain original source/stable IDs. As already approved for the application, route eventual vetted customs as **context-sensitive suggestions within the existing Ad Orientem liturgical Calendar**, not a newly created Customs Atlas or parallel Calendar.

Independent ecclesiastical sources and canonical ritual texts should be checked only for claims requiring them; folk narratives, civic spectacles and local religious observances must remain distinguishable. Do not promote claims or certify 'complete Sicilian customs coverage' merely because the 422 preexisting author-source folios are located. Continue with strictly **€0** tools/storage.
