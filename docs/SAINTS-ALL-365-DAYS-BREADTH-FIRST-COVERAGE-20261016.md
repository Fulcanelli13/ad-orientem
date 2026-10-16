# Saints — complete-calendar source coverage and bulk identity ledger

**As of 16 October 2026 · existing Ad Orientem repository · research-only**

This is a **breadth-first inventory**, not a new Mass calendar, a biography approval exercise, or an estimate of the number of distinct canonized people. It consolidates all pre-existing available evidence in large batches without redoing the same 30 lives.

## Verified 2026 observed-calendar baseline

The source is the original `AO_RUNTIME_V8.resolver.resolveDay` tested on all **365 civil days** in the successful GitHub Actions census, using the app's live `observedCycle` and `calendarCommemorationNames` interfaces. The 2026 output contains:

| Measure | Verified |
| --- | ---: |
| Days resolved against the existing Calendar | **365/365** |
| Sanctoral principal days | **165** |
| Temporale principal days | 129 |
| Principal cycle marked *unknown* by source classification | 71 |
| Named commemoration occurrences | **117** across 112 dates |
| Candidate sanctoral principal + named commemoration source mentions | **282** |
| Dates containing at least one of those mentions | **222** |
| Distinct observed principal-sanctoral/commemoration source IDs | **282** |
| Exact observed source IDs found in archived Sanctoral observances | **240** |
| Observed source IDs not found in that historical archive | **42** |
| Historical source IDs not observed as that category in 2026 | **74** |

The frozen v43.33 historical library has 311 physical artwork/component slots across 252 nominal dates, representing **307 distinct subject keys** (not necessarily persons), linked to **314 original raw observance IDs**. At nominal dates, the independent reconciliation counted **142** exact main-source occurrences, **99** exact commemoration occurrences and **73** non-matching original observance occurrences. These are **source-observance occurrences**, not distinct people and not a guarantee of all 1962 rubrics being independently certified.

### Classification is essential

The 282 candidate mentions break down by a **lexical queue**, not by confirmed types: 187 person-title hints, 41 collective/group-title hints, 20 liturgical-event hints, 17 Marian-context hints, 10 other/unclassified hints, four angelic, two Christological and one person-associated event. The 42 missing raw source IDs include headings of different kinds: **do not call them 42 missing saints**, and do not create biography placeholders or map markers from those strings.

### Forty-two source exceptions triaged together

The 42 absent raw historical-art source IDs have now undergone a **source-title type triage in one batch**, without inventing saint identities. Provisional classes:

| Exception source type | Source IDs |
| --- | ---: |
| Individual/person-like title requiring exact owner match | **12** |
| Liturgical day, vigil, dedication or event | **16** |
| Marian feast/context | **11** |
| Christological event | **1** |
| Angelic feast | **1** |
| Collective group (*All Saints*) | **1** |
| **Total** | **42** |

The four previously unclassified heading formats (*St Barbara*, *St Peter*, *Camillus de Lellis*, *Exaltation of the Holy Cross*) were triaged by their **exact raw Calendar source IDs**; the first three are *person-like heading candidates*, and the last is a liturgical event. **This is not a person-ID or biography certification.** It narrows the manual owner review to 12 person-like source headings while the 30 other source entries require observance/art-coverage treatment, not invented lives.

## One bulk cross-owner source-key ledger

Committed: `data/saints/full-calendar-exact-source-key-ledger-20261016.v1.json`.

| Original owner family | Source records |
| --- | ---: |
| Historical Sanctoral artwork/subject keys | 307 |
| Post-1960 named canonizations | 258 |
| Doctor-of-the-Church source roster | 38 |
| Existing biography owners (6+8+16) | 30 |
| Post-1960 canonization collective records | 13 |
| Exact source-key union, excluding later collectives | 595 |
| **Exact source-key union, with later collectives** | **608** |
| Keys appearing in multiple source families | 33 |

**608 is not a number of distinct saints.** The file retains archive groups, angels, feast/events and uncertain owner mappings. Its source-owner edges and original titles are preserved. There is no synonym-based merging and no new `saint_id` approval. The 13 later martyr collectives remain exactly 13 collective records—not hundreds or thousands of presumed biographies.

## Automated source-of-truth matrix

`tools/saints/build-2026-full-calendar-coverage-matrix.mjs` is added to the established **Saints observed 1962 Calendar census 2026** CI workflow, immediately after the day-resolver, subject-demand and original historical component joins. On each run, the workflow produces:

- `saints-2026-full-365-coverage-matrix.json`: every date, exact raw Calendar source IDs, observed subject mentions, nominal archive subject/component references, source-match state and art/identity non-approval flags
- `saints-2026-observed-42-source-gaps.json`: source IDs missing from the frozen historical archive, each with observed dates/titles and no invented saint identity
- `saints-2026-coverage-report.md`: reproducible cross-owner numerical census and complete 42-source-ID review queue

The output is collected as a GitHub Actions artifact, rather than manually reviewing 365 days and pasting stale generated output into a second file. The generator fails closed on changed counts; the stored **608 exact-key ledger** has its own CI census and provenance.

## Immediate prioritization — no more serial biography reviews

1. **Canonical release:** the six-profile public candidate is isolated in [PR #1256](https://github.com/Fulcanelli13/ad-orientem/pull/1256). The broader research branch must not be wholesale merged into public Pages.
2. **Bulk calendar source queue:** classify the **42 observed source-ID exceptions by type** and establish their owning authoritative source references. This does **not** mean composing 42 lives.
3. **Bulk exact-key settlement:** bring the 608-row source-key ledger and already accepted Calendar aliases under one shared reconciliation gate. Report a *certified individual/group denominator* only once identity ambiguity is resolved.
4. **Map-first geographical expansion:** attach only sourced **physical** places to their verified persons, and bring existing approved Sacred Art image keys forward without rerating them.
5. **Coverage reporting:** maintain separate denominators for resolved observed dates, distinct source keys, certified persons, source-backed meaningful short profiles, verified map pins and approved image assets.

No new Mass/Proper, new feast, inferred person or group splitting, portrait approval, user rating change, permission request or invented coordinate results from this task.


## W76 — twelve person-like source headings and 145 existing shrine associations

The previous 42 raw-observance source-ID differences have been classified in one batch. The **12 person-like source headings** now have a distinct research reconciliation in `data/saints/observed-2026-twelve-person-source-reconciliation.v1.json`.

| Comparison of observed 2026 heading to frozen historical art/source inventory | Records |
| --- | ---: |
| Individual artwork/subject keyed to the **same nominal day**, but raw Calendar source ID differs in code, rank or colour | **9** |
| Explicitly recorded historical additional subject/companion override requiring separate context (Barbara, Martha) | **2** |
| Held contradictory/apostolic context (Peter on June 30 alongside an archive source labelled for Paul) | **1** |
| **Person-like source cases covered without inventing a new identity** | **12/12** |

The nine anchored examples include Ubaldus, Ephrem, Julia Falconieri, Camillus, Jerome Emiliani, Apollinaris, Augustine of Hippo, Didacus and Josaphat. **Their source-code differences are not approved calendar changes**: the historical red/white or class discrepancies, notably Ephrem and Augustine, remain visible. Barbara (4 December) is a distinct commemoration/art subject alongside Peter Chrysologus, not a replacement for him; Martha (29 July) is preserved separately from her archived companions. Peter's original 30 June component has a conflict with the associated St Paul commemoration source and remains on hold; neither apostle is assigned the other's art.

The all-365-day matrix generator now includes any documented *archived source subject candidate* for these 12 cases, **while preserving `saint_or_group_person_identity_id:null`**. It also outputs `saints-2026-twelve-person-source-anchors.json` into the existing GitHub Actions artifact. This is a bulk source-audit reconciliation, not twelve publishable profiles.

### Worldwide map readiness from existing source owners

Rather than requesting 145 new geocodes, the existing Sacred Geography/shrine source inventory already contains **119 distinct associated saint-name strings** and **145 shrine/place associations** referencing **121 distinct existing geolocated sites**. `data/saints/existing-shrine-geography-readiness-20261016.v1.json` keeps every original physical place ID and original source references unchanged.

| Name-to-existing-ledger triage | Name strings |
| --- | ---: |
| One full normalized name match to an existing source key | **50** |
| Multiple competing source keys for the identical name (explicit alias collisions) | **6** |
| No exact complete-name source key; cannot silently infer a person | **63** |
| **Total name strings triaged** | **119** |

All **145 links are pre-existing shrine associations with a mappable site** in the original Geography registry; none is a source-certified place of birth, death, martyrdom, home or authenticated relic. The site pins already belong to Geography. **Zero new Saints pins** have been published or invented; the 50 single-name cases remain *identity candidates*, not automatically approved people or independent geolocation records. The six ambiguous cases include historical duplicate source keys for Saints Thérèse, Anthony of Padua, Catherine of Siena, Francis de Sales, Francis of Assisi and John of the Cross.

Artwork remains with the Sacred Art owner; no five-star candidate is silently promoted into an approved or licensed reproduction. Existing user ratings are preserved.

### Release and next bulk handoff

This research and map-readiness package remains on **draft PR #1227**. Public pilot [PR #1256](https://github.com/Fulcanelli13/ad-orientem/pull/1256) is separate and unmerged. The next efficient source-owner operation is to **certify the highest-confidence person→shrine association edges in bulk** and resolve the six known duplicate-name keys, not to revisit long biographies or research random new pins. Historical source colour/rank conflicts are handed to the Calendar owner, not changed here.
