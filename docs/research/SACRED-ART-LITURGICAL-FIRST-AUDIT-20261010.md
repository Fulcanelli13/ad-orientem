# Sacred art — liturgical-first acquisition audit (10 October 2026)

Status: **AUDIT ONLY — no artwork research or selection-screen implementation authorised by this document**.

Canonical editorial issue [#885](https://github.com/Fulcanelli13/ad-orientem/issues/885), registry integration [PR #887](https://github.com/Fulcanelli13/ad-orientem/pull/887).

## Auditing rules

- Use the observed, *resolved* 1962 liturgical principal for each civil date (and verify transferred/impeded feasts). Never infer I–IV class from modern feast names or a guessed date.
- A *holy day of obligation* is a distinct **territorial canonical-law category**, not a synonym for an I-class feast. Sunday is universally obligatory; other days need current applicable diocesan/bishops'-conference rules, including transfers and dispensations.
- Differentiate **(a) an acquired physical original**, **(b) a target subject meeting its minimum**, **(c) an artwork tagged to an observed 1962 day**, **(d) an aesthetically/legally approved artwork**. None implies the next.
- A related seasonal image is not an exact feast painting. Artwork may be reused between multiple authentic applications using its single canonical ID.
- Original files and research claims remain **review only**. No painting has been approved for production.

## Full source-register status

| Measure | Completed | Denominator | Completion |
|---|---:|---:|---:|
| Named subject targets meeting acquisition minimum | 92 | 168 | **54.8%** |
| Downloaded and hash-referenced original files from catalogued candidates | 166 | 181 | **91.7%** |
| Acquired originals marked museum CC0 | 163 | 166 | **98.2%** |
| Commons public-domain PD-Art/PDM originals held for rights review | 3 | 166 | **1.8% held** |
| Traditionally numbered Rosary mysteries with >=2 originals | 15 | 15 | **100%** |
| Works with final curator + publication approval | 0 | 166 | **0%** |

There are **76 under-minimum targets** and **90 missing subject-original slots**. Slots do not necessarily require 90 distinct new paintings: a legitimately relevant painting can cover multiple target IDs. Conversely, meeting a numeric subject minimum says nothing about aesthetic quality.

At the registry snapshot, **63/168 targets (37.5%) have no explicitly matched source candidate**, and **67/168 (39.9%) have no explicitly matched acquired original**. These are **strict target-tagging measures**, not a judgment that no suitable painting could already exist in the archive.

## Phase A — major feasts and liturgical seasons

| Category | Met / total | Completion | Shortfall |
|---|---:|---:|---:|
| 26 named major feasts / Triduum / principal ritual-day targets | 17 / 26 | **65.4%** | 9 targets, 14 original slots |
| 5 broad seasonal support subjects | 5 / 5 | **100%** | 0 |
| All Calendar subject targets | 22 / 31 | **71.0%** | 9 targets, 14 slots |

**Nine major-calendar targets below minimum** (downloaded originals / required):

| ID | Feast or major day | Originals | Deficit |
|---|---|---:|---:|
| `calendar.palm-sunday` | Palm Sunday | 0 / 2 | 2 |
| `calendar.holy-innocents` | Holy Innocents | 0 / 1 | 1 |
| `calendar.all-saints` | All Saints | 1 / 2 | 1 |
| `calendar.all-souls` | All Souls | 1 / 2 | 1 |
| `calendar.st-john-baptist` | Saint John Baptist | 1 / 2 | 1 |
| `calendar.transfiguration` | Transfiguration | 0 / 2 | 2 |
| `calendar.christ-king` | Christ the King | 0 / 2 | 2 |
| `calendar.sacred-heart` | Sacred Heart | 0 / 2 | 2 |
| `calendar.holy-rosary` | Our Lady of the Rosary | 0 / 2 | 2 |

A 100% general seasonal pool **does not prove** that a specific first-class Sunday, Ember Day, feast or Holy Week liturgy has a correct image.

## Phase B — holy days of obligation

**Not percentage-auditable until the jurisdiction and applicable civil-year obligation norms are verified.** The acquisition policy includes 11 universal/canonical candidates (Sunday plus ten potentially obligatory feast categories). Not all ten non-Sunday feast categories necessarily bind in France, Mauritius or another territory. The *1962 observed liturgical title may differ from the current canonical obligation title* (e.g. 1 January).

- Universal Sundays: identify and link artworks to each *observed* Sunday principal; counts are included in the rank-by-rank 2026 audit below.
- Non-Sunday holy days: determine for each jurisdiction/year whether obligatory, transferred, suppressed or exempted. Audit their images only after that mapping.
- **Coverage percentage: N/A**, not 0%; the denominator of locally binding non-Sunday dates has not been established.

## Phase C — complete 2026 observed class census

The current [2026 calendar-run evidence](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38051490229) completed all 365 production DayResolver dates (**365/365, 100% successfully resolved**) and passed 72/72 bounded independent checks. It explicitly **does not certify independent full-year parity**.

For each resolved principal, the artwork audit requires an acquired original carrying its **exact canonical `observed1962Identifiers` source ID**. The registry presently contains **zero** such observed-source links. Thus, the mapping/indexing completion is:

| Actual rank of observed 2026 principal | Days | Explicitly linked to acquired originals | Source-ID mapping completeness |
|---|---:|---:|---:|
| I class | 53 | 0 | **0.0%** |
| II class | 76 | 0 | **0.0%** |
| III class | 165 | 0 | **0.0%** |
| IV class | 71 | 0 | **0.0%** |
| **Total 2026** | **365** | **0** | **0.0%** |

**Do not misinterpret the 0% as “there are no paintings for these days.”** It measures absent auditable **day-ID-to-acquired-artwork links**, rather than scene availability. Some of the 166 originals can likely be reused after genuine subject/source correspondence is reviewed.

Year 2026 is a **single dated baseline**, not a full leap-year/transferred-feast certification. The observed-calendar-to-artwork audit must eventually include other year patterns and relevant local Proper calendars.

## Phase D — our application modules

| Module category | Targets meeting original minimum | Acquisition target completion | Additional slots |
|---|---:|---:|---:|
| Rosary (traditional + optional luminous) | 18 / 20 | **90.0%** | 2 |
| Stations of the Cross | 4 / 14 | **28.6%** | 10 |
| Devotions, recurring prayers, novenas | 17 / 26 | **65.4%** | 14 |
| Formation and sacramental scenes | 16 / 23 | **69.6%** | 11 |
| Scripture illustration subjects | 7 / 26 | **26.9%** | 19 |
| Saints and historical portraits | 8 / 28 | **28.6%** | 20 |
| **Module/non-Calendar targets** | **70 / 137** | **51.1%** | **76** |

The 15 traditional mysteries alone are **15/15 = 100% source-acquisition covered** to the minimum, but still **0% aesthetically approved**. The two unresolved Rosary targets are optional luminous mysteries (Preaching of the Kingdom, Transfiguration).

## Proposed research/approval workflow after this audit

1. **Research/acquisition**: first close major feast gaps, reconcile actual **53 first-class observed 2026 day identities**, and resolve local obligations; then module shortfalls; then source-target II, III, IV-class days. Do not mechanically buy/download quotas.
2. **Editorial and source reconciliation**: reconcile dates, exact artworks, official source, hash, medium, provenance, worldwide reuse and stable single image ID. Record explicit contextual-only alternatives.
3. **Human artwork selection — last stage**: create **one standalone review HTML** with every category and high-quality thumbnail/preview, filters, counts, provenance, large-image inspector and explicit `Accept`, `Reject`, `Needs review` options, plus optional crop/notes. It must persist decisions within the current session and **export a versioned JSON review manifest** without editing production directly. It must allow reviewed decisions to be re-imported if needed.
4. **Final acceptance**: after the user exports the JSON, validate against the canonical registry, original hashes, rights gates, 1962 observed identity and crop/mobile requirements. Only then publish approved images through the existing asset framework.

**No selection HTML is built and no existing image is auto-accepted by this audit.**

## Reproducibility and limitations

- [Master artwork candidates](../../data/calendar/sacred-art-candidates.v1.json) and [Calendar targets](../../data/calendar/sacred-art-subject-targets.v2.json)
- [Formation targets](../../data/learn/sacred-art-formation-targets.v1.json) and [explicit iconographic crosswalk](../../data/calendar/sacred-art-editorial-crosswalk.v1.json)
- [Acquisition-priority policy](../../data/calendar/sacred-art-liturgical-priorities.v1.json)
- [Repeatable source/target audit](../../tools/calendar/audit-sacred-art-modules.mjs)
- [Repeatable full-year priority audit](../../tools/calendar/report-sacred-art-liturgical-priorities.mjs)
- [Successful 2026 rank audit run](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38051490229)
- Recompute on new originals, rule changes or signed-off subject links; **do not overwrite the canonical registry from this frozen audit snapshot**.
