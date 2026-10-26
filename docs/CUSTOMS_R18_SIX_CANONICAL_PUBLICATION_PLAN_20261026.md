# R18 first six — canonical publication patch (unapproved)

Date: 26 October 2026. **Publication target is the existing Customs registry and existing Calendar only.**

This branch is based on `main`, not the stacked research PR #1723 or UI-preview PR #1736. It proposes six collision-free canonical IDs, with exact bilingual source texts, historic/regional limits and a date-mapping contract. No source data has been replaced, and no runtime article imported: **the 35 public articles in main remain unchanged**.

| Proposed ID | Existing research record | Editorial classification | Region interest | Civil day context |
| --- | --- | --- | --- | --- |
| `PATR-002` | `CANDIDATE-STPATRICK-RIBBON` | Historical Irish custom, not universally current | IE | 17 March |
| `XMAS-002` | `CANDIDATE-IRISH-CHRISTMAS-CANDLE` | National Museum folklore, household witness | IE | 24–25 December |
| `XMAS-003` | `CUST-XMAS-POLISH-HAY` | Polish Wigilia table practice, not divination | PL | 24 December |
| `SBAR-001` | `CUST-BARBARA-BRANCHES` | St Barbara domestic branches, not a Roman Mass rite | AT | 4 December |
| `XMAS-004` | `CUST-XMAS-PROVENCAL-PAIN-CALENDAL` | Provençal Gros Souper bread/charity, not priestly blessed bread | FR-PROVENCE | 24 December |
| `EPIP-004` | `CUST-EPIPHANY-SPANISH-MAGI-GIFTS` | Optional Spanish family gifts, no inferred parade | ES | 5–6 January |

PR #1642 already reserves `EPIP-003` and `CRIB-001`; no overlap. PR #1720 contains separate unapproved subjects. PR #1736 owns the six-item regional-interest preview for research UI, which must be reconciled, not silently merged alongside these canonical records.

## Release path, with fail-closed gates

1. **Owner review** confirms these are six distinct cultural or domestic actions rather than variants of the existing 35, with the proposed ID mapping.
2. **Claims and ministry review** accepts exact primary-institutional evidence and verifies no unauthorized clerical blessing or 1962 liturgical claim has slipped into copy. The Dúchas archival witness for the Irish candle retains an access qualification.
3. **EN/FR editorial approval** signs off all eight bilingual article fields for each of six subjects.
4. **Geographic and day-context acceptance** chooses browse-all with visible locality labels, and explicitly selected interest for date suggestions (IE/PL/AT/FR-PROVENCE/ES). Never infer current parish events, user location, or Roman calendar observance from a folk-custom date.
5. **Final canonical promotion diff** appends six records and source IDs to the existing `data/customs/customs-atlas-seed.v1.json` and source registry, adds the six canonical article projections in existing `src/calendar/customs-extra-articles.js`, extends the year-led browse index, and gates Calendar date matches with explicit region selection. Check against contemporaneous `main` and PR #1642 before applying the diff.
6. **Acceptance**: complete repository regression, normal Calendar date cases, catalogue/search, EN/FR rendering and phone viewport. Only then may the release PR become non-draft and be merged. Its projected count is 41, not 41 until merge.

`data/customs/customs-r18-six-canonical-release-candidate.v1.json` deliberately sets all editorial signoffs to false and `publication_allowed:false`. Automated test `tests/customs-r18-six-canonical-release-candidate.mjs` validates noncollision, dates, text, source linkage and those locks. This is not a substitute for editorial acceptance and does not authorize publication.

Important external blocker at the time of writing: PR #1736's required-main-gate run fails in `tests/production-tree-hygiene.mjs` because an **unrelated sacred-art GitHub Actions workflow has `contents: write`**. Do not bypass mandatory checks or alter the art workflow without coordinating its owner.
