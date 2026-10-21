# Customs master — Phase 1 reconciliation (21 October 2026)

> **Working inventory, not a final comprehensive register or an app publication.** This repository branch is data-only. Freeze UI, artwork and module architecture decisions until the master identity and calendar gates are complete.

## Source-of-truth hierarchy

- **38 existing canonical records** are owned by `data/customs/customs-atlas-seed.v1.json` on `main`. Their identity and publication states are retained unchanged (35 published, 3 context-only).
- **4 bounded distinct P2 candidates** remain provisional, not new published customs or universal rites.
- **568 Weiser book observations, 28 chapters** are preserved one-for-one in `weiser-observations.v0.json`; observations are not synonymous with distinct customs.
- **54 bilingual Weiser editorial drafts** and their prior owner decisions are reconciled in `editorial-owner-reconciliation.v0.json`. Of their 15 formerly “new canonical” groups, 11 match current canonical identities; four remain provisional.
- **14 possible duplicate-practice groups** and **28 related-family groups** remain reversible review aids. We do not merge regional, household, liturgical and ministerial acts simply because they are related.

## What is complete and what is not

| Measure | Count | Meaning |
|---|---:|---|
| Canonical identities | 38 | Present on main; not necessarily complete descriptions for every future module use |
| Provisional distinct additions | 4 | Historical / regional P2 candidates, not publication-approved |
| Current working identity entries | **42** | Baseline **only**, not final universe |
| Weiser observations inventoried | **568** | All 28 chapters indexed |
| Explicit observation-to-master links | **50** | Identity association for editorial review only |
| Unlinked observations | **518** | **Not** 518 missing customs |
| Existing/other-owner parity to reconcile | **81** | Mostly liturgy/Calendar/Pray/Saints, avoid duplication |
| Identity/variant observations awaiting review | **286** | 145 regional, 92 candidate, 49 enrichment |
| Already assigned to other owner/regional context/ritual hold in the 54-draft pass | **26** | Subset of 286, not new customs |
| Awaiting their first explicit 54-draft owner decision | **260** | Subset of 286; next identification pass |
| Historical reference only | **117** | Research/archive, not current practice claims |
| Excluded observations | **34** | Never auto-publish |
| Independent-source P1 holds | **84** | 38 no exact match + 46 partial/indirect; overlaps the book counts |

## Working identity inventory

| ID | Name (English) | Temporal association (source context only) | State |
|---|---|---|---|
| `DOM-002` | Domestic holy-water font / bénitier de chevet | Undated / local occasion | Canonical |
| `DOM-006` | Family consecration to the Sacred Heart | Sacred Heart season / family use | Canonical |
| `DOM-007` | Intronement of a Sacred Heart image in the home | Undated / local occasion | Canonical |
| `LIFE-002` | Relevailles / blessing after childbirth | Undated / local occasion | Canonical |
| `DEV-001` | May as the month of Mary | May | Canonical |
| `DEV-006` | Pilgrimage to a shrine or holy place | Undated / local occasion | Canonical |
| `DEV-007` | Regional pardons and shrine anniversaries | Undated / local occasion | Context-only |
| `DEV-009` | Ex-votos | Undated / local occasion | Canonical |
| `DEV-010` | Votive candle at a shrine | Undated / local occasion | Canonical |
| `DEAD-001` | Prayerful cemetery visit | 02/11; November; anniversaries | Canonical |
| `DEAD-003` | Prayer for the dead on 2 November | 02/11 | Canonical |
| `BELL-004` | Glas / death bell | Undated / local occasion | Context-only |
| `FOOD-001` | Pain bénit | Undated / local occasion | Context-only |
| `DOM-003` | Using holy water at home | Undated / local occasion | Canonical |
| `DOM-011` | Keeping blessed Candlemas candles at home | 02/02 — Candlemas (date owned by Calendar) | Canonical |
| `DOM-013` | Keeping blessed Palm Sunday branches at home | Palm Sunday (calculated by Calendar) | Canonical |
| `BLSS-001` | St Blaise — blessing of throats | 03/02, St Blaise commemoration in 1962 Roman calendar; Calendar owns calculation and precedence | Canonical |
| `NDAY-001` | Baptismal patron's name day | Undated / local occasion | Canonical |
| `PATR-001` | French fête patronale / village patronal celebration | Undated / local occasion | Canonical |
| `MARI-001` | French Assumption Marian processions | 15/08 — Assumption; regional context, never automatic ritual | Canonical |
| `SJOS-001` | St Joseph's table and gifts to the poor | 19/03 — St Joseph feast; optional local family and parish practice | Canonical |
| `SANT-001` | St Anthony's Bread / Pain des pauvres | 13/06 — St Anthony of Padua; charity can be practised on any day | Canonical |
| `SCHR-001` | St Christopher — vehicles and travellers' blessing | 25/07 — St Christopher commemoration; parish event date may differ | Canonical |
| `SNIC-001` | St Nicholas's visit and small gifts to children | 06/12 — St Nicholas; regional household custom | Canonical |
| `BLSS-002` | Assumption — blessing of herbs, flowers and fruits | 15 August, Assumption; date and Mass rank owned by Calendar | Canonical |
| `BLSS-003` | St John the Evangelist — blessing of wine | 27 December, feast of St John the Apostle and Evangelist in 1962 Roman calendar | Canonical |
| `BLSS-004` | Holy Saturday — blessing of Easter foods | Holy Saturday (calculated from 1962 Easter by Calendar), with domestic use on Easter Sunday | Canonical |
| `ADVT-001` | The family Advent wreath | First Sunday of Advent; date owned by Calendar, no feast added | Canonical |
| `ADVT-002` | The Advent manger of good deeds | Advent household preparation; Calendar owns liturgical dates | Canonical |
| `ADVT-003` | Las Posadas: welcoming the Holy Family | 16–24 December in communities that actually celebrate Posadas | Canonical |
| `XMAS-001` | Sharing opłatek on Christmas Eve | 24 December as customary domestic vigil, distinct from Mass | Canonical |
| `HTHU-001` | Visiting churches on Holy Thursday | Holy Thursday, calculated from Easter by Calendar; locally open repositories only | Canonical |
| `ROGA-001` | A family Rogation prayer walk | Major Rogation 25 April and the three Minor Rogation days before Ascension; Calendar owns calculation | Canonical |
| `EPIP-001` | Epiphany star singers | 6 January, as a regional practice; visits must be locally announced | Canonical |
| `EPIP-002` | The Epiphany cake and the poor person's portion | 6 January in the 1962 calendar; household celebration date may differ | Canonical |
| `CORP-001` | Flower carpets for Corpus Christi | Corpus Christi where a real procession is celebrated locally | Canonical |
| `EAST-001` | An Easter Monday Emmaus walk | Easter Monday calculated by Calendar; regional voluntary practice | Canonical |
| `MARI-002` | A little garden dedicated to Our Lady | May or another suitable gardening season; linked to DEV-001 | Canonical |
| `CANDIDATE-STPATRICK-RIBBON` | St Patrick's ribbon cross | 17 March | Provisional P2 |
| `CANDIDATE-IRISH-CHRISTMAS-CANDLE` | The Irish Christmas candle | 24–25 December; local duration varies | Provisional P2 |
| `CANDIDATE-STJOHN-BONFIRE` | St John Baptist's community bonfire | Nativity of St John Baptist, 24 June; eve commonly 23 June | Provisional P2 |
| `CANDIDATE-EASTER-EGG-CRAFT` | Decorating Easter eggs: pisanki and pysanky | Easter season; no independently established universal Holy Saturday decorating time | Provisional P2 |

## Chapters needing identity/variant adjudication

| Weiser chapter | Observations | Unlinked candidate/regional/enrichment reviews |
|---:|---:|---:|
| 1 | 8 | 4 |
| 2 | 10 | 4 |
| 3 | 9 | 6 |
| 4 | 7 | 3 |
| 5 | 11 | 6 |
| 6 | 16 | 12 |
| 7 | 13 | 8 |
| 8 | 29 | 16 |
| 9 | 14 | 10 |
| 10 | 20 | 11 |
| 11 | 11 | 7 |
| 12 | 19 | 10 |
| 13 | 20 | 9 |
| 14 | 29 | 16 |
| 15 | 39 | 18 |
| 16 | 33 | 19 |
| 17 | 25 | 12 |
| 18 | 17 | 5 |
| 19 | 23 | 11 |
| 20 | 14 | 7 |
| 21 | 21 | 11 |
| 22 | 12 | 8 |
| 23 | 23 | 6 |
| 24 | 25 | 13 |
| 25 | 27 | 9 |
| 26 | 31 | 16 |
| 27 | 35 | 18 |
| 28 | 27 | 11 |

## Editorial decisions that remain open

1. **Adjudicate the 260 not-yet-assigned identity/variant observations** while preserving the 26 already routed to other-module content, regional history or ritual/source holds. Start with the explicit P0/P1 entries and families where duplication or ministerial-rite confusion is likely. Resolve to an existing custom, a distinct provisional custom, another owner, regional context, or justified hold.
2. **Separate dates rigorously:** fixed historical custom day, movable feast relationship, observed 1962 feast precedence, family occasion, and actual local programme are different fields; the Calendar resolver owns observed feast dates.
3. **Preserve geography and historical scope:** never turn an Irish household witness, German festival custom, French local blessing, Polish food custom or folklore into universal Roman practice.
4. **Resolve the 84 P1 independent-source holds** where worthwhile without manufacturing an attestation. Weiser alone is a bibliographic pointer, not current-practice certification.
5. **Consolidate final English/French descriptions and independent citations** for approved identities, then run a complete coverage audit. The supplementary 27 historical texts are currently draft editorial material.
6. Only **after data closure** review information architecture: Through the Year, Catholic Life, searchable historical archive, Calendar/Pray/Saints links. UI and art on PR #1530 remain on hold.

## Rules

- One practice identity, many geographically bounded witnesses. Identity, variant and overlapping practice are separate relations.
- No new canonical IDs or publication just because a source observation is marked CANDIDATE or REGIONAL.
- No inferred automatic processions, blessings, household obligations, health or supernatural guarantees.
- No raw Weiser passages reproduced as modern published copy; use independent citations and original editorial prose.
- Preserve the current Mass, Calendar, LIVE reader and all prior research branches as separate authorities.

## Machine-readable files

- `identities.v0.json` — 42 English/French working identities with calendar fields, sources and provenance.
- `weiser-observations.v0.json` — 568 immutable source locators, original triage and review status.
- `editorial-owner-reconciliation.v0.json` — 54 decisions, 15→11+4 mapping, 14 duplicate groups, 28 related-family groups.
- `coverage-and-review-queue.v0.json` — 28-chapter coverage, 286-item review queue, blocked and other-owner populations.
- `tests/customs-master-integrity.mjs` — provenance, counts, status and source gates.
