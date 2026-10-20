# Ad Orientem Customs Atlas — Coordinated integration, 21 October 2026

**Status: draft release branch, not merged into main.** This consolidates the two October 20 customs release PRs in one branch to prevent misleading partial deployments and count drift.

## Combined canonical provenance

| Source | New customs | Attestations | New sources | SOT-07 extensions |
|---|---:|---:|---:|---:|
| Main starting state | 17 | 75 | 81 | 1 |
| PR #1512: feast blessings | +3 | +3 | +7 | +3 |
| PR #1516: seven selective customs and Polish remembrance | +7 | +8 | +8 | +7 |
| **Coordinated candidate** | **27** | **86** | **96** | **11** |

The three blessings retain IDs `BLSS-002`, `BLSS-003`, `BLSS-004`; the seven selective customs retain `NDAY-001`, `PATR-001`, `MARI-001`, `SJOS-001`, `SANT-001`, `SCHR-001`, `SNIC-001`. `DEAD-003` gains only the independent Polish Wypominki attestation; it remains one canonical Holy Souls custom.

## App integration decisions

- **Calendar:** French/English optional notices for St Joseph (19 March), St Anthony (13 June), St Christopher (25 July), St Nicholas (6 December), Assumption herbs (15 August) and St John wine (27 December).
- **Assumption:** The Marian procession record `MARI-001` remains a regional Customs Atlas custom; it does **not** create a duplicate `assumption-marian-procession` calendar card alongside `assumption-herbs`. A real Mass/procession requires explicit ceremony/event configuration elsewhere.
- **Holy Saturday:** The Easter food blessing context is in the existing `holy-saturday` date practice card; **no `easter-foods` additional Calendar card**, and no new Mass reader event.
- **Saints and Pray:** Only existing entry points; no duplicate saint biographies, prayers or novena owners.
- **Explore/Customs Atlas:** Ten new customs are `NOT_MAPPED`, `place_id: null`. The seven worldwide and regional attestations cannot create unsupported location pins or fabricated availability claims.
- **Governance:** Existing 63-row SOT-07 source register and the seven protected negative-knowledge entries remain unchanged; appended extension IDs are source-specific, and no PR is silently treated as merged.
- **Consumer protection:** No fees, donations, external contact, map ratings, invented ritual formulae or guaranteed protection are implied.

## Tests

The coordinated branch includes both original test suites:
- `tests/customs-weiser-selective-release.mjs` (seven customs / four dated notices / Polish Wypominki).
- `tests/customs-feast-blessings-calendar.mjs` (Assumption herbs, St John wine, Holy Saturday focus).
- `tests/customs-coordinated-integration.mjs` (exact 27/86/96/11 counts, unique IDs, all 10 source-linked admissions, 6 date notices and nonduplicate Holy Saturday).
- Updated customs contract, Explore browse counts, heritage editorial snapshot delta and research ownership gates.

These run under `npm run test:customs-atlas` plus existing release checks. Merge only if required CI finishes green and source PR integration is otherwise consistent.

## Remaining Weiser editorial pipeline

The [54-draft owner reconciliation](https://github.com/Fulcanelli13/ad-orientem/blob/research/weiser-chapters-01-05-20261020/data/customs/research/weiser-54-editorial-owner-reconciliation.v1.json) records 14 existing-canonical enrichments, nine owner-content enrichments, 12 regional-only references, two related variants, two source/ritual holds and **15 distinct prospective customs**. Six provisional P0 candidates are prioritized for the *next* release. None is automatically added in this coordinated branch.

**Do not merge PR #1512 and PR #1516 separately on top of this release**; decide which coordinated PR is the superseding integration route and preserve authorial provenance and review history.

## Release gate after main advances

At review on 21 October 2026, `main` advanced to `825bd8db85f558dfa6237708f3ad6cf519dcc039` through independent Mass and Explore releases (#1515, #1502, #1517). The coordinated customs branch must be tested against the new PR merge base, not treated as approved solely because earlier tests were green on the previous base. New main changes include `package.json`, Map/Explore and Guided Folio code; the Customs Atlas integration must retain those owners. This release keeps its **27 / 86 / 96 / 11** canonical registry totals and does not change the Mass reader or explore map ownership.
