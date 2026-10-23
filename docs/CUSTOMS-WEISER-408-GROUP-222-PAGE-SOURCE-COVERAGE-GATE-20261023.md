# Customs Research — 408 provisional groups reconciled to printed pages, 222-page original-source coverage backlog

**Research date:** 23 October 2026. **Current corpus:** 2,985 undeduplicated source/detail research rows at the beginning of this source-coverage pass. **Scope:** additional provenance and research-execution planning only; no Calendar, app, 1962 Missal, prayer, identity or publication change.

## Main discovery

The 1958 *Handbook of Christian Feasts and Customs* by Francis X. Weiser, S.J., has **342 main-text printed pages** across the 28 relevant chapters, pages **3–344**. The previously committed second-pass detail database contains individually indexed material from **120** distinct printed pages, only **35.1%** of the volume's main printed-page range; **222 pages (64.9%)** have no second-pass detail observation. The **120 indexed pages are not marked exhaustively reread**. It would be wrong to describe the entire original book as fully mined.

This means the next source priority should be **systematic original-book page examination**, not further repeated extraction from twentieth-century derivative Catholic family guides.

Source: [Weiser PDF](https://www.fisheaters.com/srpdf/Weiser--ChristianFeastsandCustoms.pdf). A PDF page containing the abbreviations list was visually inspected during this pass to verify the source is an original book reproduction. **That limited check is not a review of its 342 main-text pages.** The source scan could not be fully downloaded into the runtime in this pass. The printed-page-to-PDF-image-index offset has **not** been inferred or invented; page worklists use printed page numbers only.

## Every provisional group now has an exact book-page locator

`data/customs/master/weiser-408-group-evidence-readiness-screen.v1.json` accounts for the **entire existing 408 provisional-group collection**, with immutable group IDs, source-observation IDs, original book chapter and printed page references, and separable evidence gates:

| Existing research-group source lane | Located group labels |
|---|---:|
| Main 1958 handbook working groups (308), plus historical (39) | **347** |
| Historical detail items recovered from unindexed passages | **24** |
| Earlier gap/detail review's new provisional actions | **37** |
| **All 408 provisional groups** | **408** |

All 408 groups have at least one printed-page reference. This is **a location, not proof that the exact claim was verified on the page**. Fifteen previously unassigned group labels had an explicit original-page **spot-check flag**, but an occasional spot check is not exhaustive textual or archival verification. For **149** provisional groups, at least one cited printed page has no separately indexed second-pass detail observation.

Deterministic risk-class screening assists the next editorial checks. It is **not** a Catholic doctrinal or ritual judgment:

| Source-screening queue | Group labels |
|---|---:|
| Domestic or family devotional action | **173** |
| Possible liturgical rite or blessing/custom boundary | **87** |
| Historical period/geography requiring verification | **79** |
| Public communal practice requiring precise locality | **49** |
| Folklore or non-Catholic specificity requiring special review | **20** |
| **Total** | **408** |

No action-group ID was merged, removed, certified as an independent practice or selected for production. All older 56 working identities remain unchanged. A label that says *blessing* does not prove approval in the 1962 Roman Ritual.

## Full 222-page original-source audit worklist

`data/customs/master/weiser-1958-222-uncovered-printed-page-audit-queue.v1.json` creates one reversible research task for **each** currently unrepresented main printed page, linked where possible to existing first-pass mention IDs and existing provisional group IDs. The queue divides into:

| Exact original-book printed pages | Count |
|---|---:|
| Wave 1: pages with previous first-pass observations and likely identity cross-references | **100** |
| Wave 1: pages with **no** first-pass indexed observation, distributed among chapters | **50** |
| Wave 2: remaining unrepresented pages | **72** |
| **Total unrepresented** | **222** |

Across the full 222, **159** pages have at least one first-pass mention and **63** have zero. The first wave touches **221 earlier first-pass observation entries** and **149 provisional group–page links**. It is planned work, not 150 pages already reaudited. Every task has `original_page_review_status=NOT_AUDITED`. It is possible that many pages consist only of history, theology or context and contain no new independent custom; this is why inspection precedes any practice action mining.

### Exact original-book page-review requirements

For each completed page:

1. Read the actual printed-page image/text and relevant continuation before and after; record source edition, exact page and passage, and how complete the page inspection was.
2. Retain and classify separately every concrete domestic/communal practice, formal liturgical action, reported historical origin, folkloric claim, cultural/historical context and proposal.
3. Link to pre-existing source-observation ID(s); either expand their detail **without double counting** or create a new independently identifiable source-action observation with stable ID.
4. Review actor, physical action, object, date and feast, country/locality, historical period, present-day status, and whether the action belongs to a larger festival complex rather than a standalone custom.
5. Distinguish genuine Roman Ritual authority from Weiser's historical description. Verify rites and permissions against the authoritative applicable texts; a footnote about a rite is not proof of permission to perform it.
6. Treat Weiser's citations of other authors as bibliographic dependence, **not independent confirmation**. True witness independence requires inspecting the earlier source.
7. Maintain one source row per **new** documented action/component, preserving all earlier IDs. No auto-promotion or change to the existing Ad Orientem Calendar.
8. Mark a page audited only after the full text/page has actually been inspected; the system must report exact numbers of audited pages and newly found details separately.

## Current quantitative state

- **2,985** source/detail working rows were present before this pass (the shared master may be moving forward from parallel research).
- **408/408** provisional groups mapped to printed-page locations.
- **222/342** printed pages lacking indexed second-pass detail.
- **150** source pages allocated to first page-audit wave; **72** follow.
- **0** printed pages newly and completely audited in this metadata pass.
- **0** new source details or verified distinct customs from this metadata pass.
- **0** changes to the existing Calendar, 1962 Mass, rites or app.

CI is extended with `tests/customs-weiser-readiness-pages.mjs` and a step in `.github/workflows/customs-master-integrity.yml`. The test joins all 408 groups to original source IDs and chapter-page numbers; checks the complete partition of 342 printed pages into 120 already indexed and 222 unrepresented pages; checks the 150/72 wave assignments, 50 blind spots in Wave 1, absence of verified new identities, and nonpublication status. A source-page worklist without actual page read is **not** a release gate.

### Important distinction

**Completing the research catalogue is not the same as accumulating descriptions**. Actual completion will require verified source-text coverage, stable identity and variant ownership, historical/geographical scope, rights to reproduce user-facing content, ecclesiastical authority where relevant, and publication review. The coverage queue is a prerequisite for that; it is not itself research extraction.

The work is associated with [draft PR #1572](https://github.com/Fulcanelli13/ad-orientem/pull/1572). No merge is authorized.
