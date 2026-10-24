# Catholic Customs full research registry — historical recovery and source-omission audit

**Research date:** 23 October 2026. **Scope:** source-level customs catalogue independent of Ad Orientem integration.

## Central finding

The prior `HISTORY_ONLY` and `EXCLUDE` dispositions were **app-release screening categories**, not a reliable count of historical or reported customs in Weiser's book. All mentions remain in the research inventory. The latest research work has rescued **39 provisional historical practices** previously left as general history, including medieval Nativity/Easter dramatizations, ancient fasting, older public processions, historical hymns, Slavic Holy Thursday customs and Eastern-rite comparative practices. They are **leads**, not 39 certified independent customs.

## 181 previously non-practice routes — first label-level review completed

| Review classification | Observations | Next action |
|---|---:|---|
| Historical customary action leads | **39** | Source reading, geographic and period qualification, identity normalization |
| Named liturgical/public devotional observances | **33** | Keep clearly distinct from freely chosen household traditions |
| Liturgical feast, doctrinal or rubric context | **38** | Preserve sources; do not mint another practice from a bare feast title |
| Historical etiology/comparison | **34** | Maintain as context and scrutinize claims of origin |
| Folk action tied to contested luck/effect claims | **26** | Preserve act separately from its disputed efficacy |
| Unsupported historical etiology or efficacy claim | **8** | Retain quoted claim only as reported context, no endorsement |
| Ambiguous historical practice/context | **3** | Recheck original pages for evidence |
| **Total** | **181** | All have a review disposition, none deleted |

The three records requiring particular original-page inspection are `WEI58-14-011` (Laetare catechumenal Creed handover), `WEI58-17-001` (Easter Latin hymn tradition) and `WEI58-27-017` (married couples' devotion to St Joseph). The other index-level dispositions are also provisional: this was **not** an original-source rereading of all 181 passages.

## Previously unindexed Handbook material: printed pp. 128–129

Direct visual inspection of the publicly accessible 1958 book scan at PDF pages 145–146 yielded **six additional source observations** beyond the earlier 568-source first-pass inventory:

| Source ID | Reported custom / variant | Independent evidence |
|---|---|---|
| WEI58-ADD-001 | St Stephen's Day Wren Boys visiting, singing and receiving gifts | National Folklore Collection, Irish national intangible-heritage inventory |
| WEI58-ADD-002 | St Stephen's Day horseshoe-shaped festive breads | Weiser p.129; corroboration outstanding |
| WEI58-ADD-003 | St Stephen's Day walnut-throwing children's custom | Weiser p.129; corroboration outstanding |
| WEI58-ADD-004 | Blessed oats thrown at Mass or around domestic animals | Weiser p.129; may be a variant of existing oat blessing, not new identity |
| WEI58-ADD-005 | Blessed water or salt kept for sick horses | Weiser p.129; actual scope and rite need checking |
| WEI58-ADD-006 | Christmas-week masked household mumming | Weiser p.128; folk cultural/Christian-season relationship unresolved |

The Wren Boys entry has an independent Irish archival witness (<https://www.duchas.ie/en/cbes/4758492/4748439/5012706>) and an Irish state register (<https://nationalinventoryich.ccs.gov.ie/la-an-dreoilin-wrens-day/>). Its historically reported bird-hunting is descriptive cultural history, not a recommendation or Christian liturgical ceremony. Traditional folklore etiology must not be treated as a proven historical origin.

**Implication:** the old '568 from all 28 chapters' is a first-pass index and is demonstrably *not* an exhaustive count of every custom Weiser describes. It is now **568 original + 6 addendum = 574 individual Handbook source observations** with no source item overwritten. Additional systematic page-level checking of the 1958 book is justified.

## Updated corpus coverage

| Measure | Status |
|---|---|
| Handbook first-pass numbered observations | 568 |
| Newly page-checked Handbook omissions | +6 |
| **Handbook source observations retained** | **574** |
| Family-book direct-scan observations | 111 |
| **Two-book research source observations, avoiding preview duplicates** | **685** |
| 1958 Handbook provisional practice/variant groups | 308 |
| Historical practice leads recovered | +39 |
| **Total provisional group records** | **347**, not certified as mutually distinct |
| Older working-master identity records | 56; overlaps with provisional groups, not additive |
| Family-book records linked to at least one Handbook observation | 54 |
| Family-book records with existing master links | 16 |
| Family-book records without a proposed direct overlap | 56 |
| Original 1956 short-preview subjects now linked to direct scan | **16/16** (represented by 15 direct-scan records) |
| New app publications / final approved distinct identities | **0 / 0** |

All 181 contextual/historical/contested records have **an index-level review disposition**, but **source-level completion is not 181/181**. Historical, ritual, folk and cultural material remain separate until identity source proof.

## Data and validation

- `data/customs/master/historical-practice-recovery-ch01-28.v1.json` — 39 historically identified practice leads
- `data/customs/master/context-historical-contested-181-review.v1.json` — all 181 classified with reversible evidence-aware labels
- `data/customs/master/weiser-handbook-addendum-st-stephen.v1.json` — six printed-page-observed additions with qualifiers
- `data/customs/master/weiser-family-1956-fullscan-source-pass01.v1.json` — 111 observations and one-to-many preview correction
- `data/customs/master/weiser-two-book-relationship-review.v1.json` — 111 cross-book candidate relationships, complete previous preview coverage
- `tests/customs-full-registry-census.mjs` — source nonloss, group and relationship counts, addendum integrity
- `.github/workflows/customs-master-integrity.yml` — now runs the census test alongside existing master audit

The new source-index groups are **not final canonical practice identities**. Final distinctness must be resolved by comparing the actual performed action, participants, objects, occasion, location, historical period, and cited passages.

### Research sequence to continue

1. Systematically reread the **1958 Handbook page by page** to identify additional omissions; use a chapter/printed-page completeness ledger, not solely the original 568 labels.
2. Recheck the three ambiguous historical/context entries and source passages for the 39 rescued historical practice candidates.
3. Match the **347 provisional practice groups** (plus six addendum observations) against the older 56 working identities and 53 geographic families, conserving named regional variants and variant-level proofs.
4. Finish full 1956 family-book page-by-page source coverage, especially distinguishing the author's suggestions from attested tradition.
5. Expand through independent 20th-century Catholic customs and folk-life sources, one source per traceable assertion; never inflate distinct-custom totals using repeated mentions.

No calendar actions, Mass content, prayers, app publication, art selection, or UI were changed.
