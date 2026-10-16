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
