# CL27 historical timetable → current source reconciliation (4 November 2026)

**Research only. No new Mass timetable, coordinate, venue, religious classification or public release.**

This is a **thin source-page work queue**, not a second canonical register. It reconciles **all 296 previously actionable unverified historical CL27 rows** with their original immutable `historical_row` keys on [draft PR #1775](https://github.com/Fulcanelli13/ad-orientem/pull/1775). The original October 26 snapshot is pinned by its blob SHA and must remain the authority for source-owned fields. Its 4,681 historical Mass rows must never be described as 4,681 live Masses.

## Programme census

| Measure | Count |
| --- | ---: |
| Historical source/day/time assertions indexed | 296 |
| Distinct owner/association source page URLs | 120 |
| Distinct effective physical CL2 anchors | 143 |
| Freshly reviewed historical rows | 34 |
| Distinct site cases assessed | 12 |
| Historical rows still without fresh review | 262 |
| Legacy rows with no frozen venue source ID | 5 |
| Separate historical same-place/day/time collision cases, still pending | 106 |
| Published Mass times or ecclesiastical classifications | **0** |

## Verified source scope and findings

- **Florence — eight rows:** official ICRSS programme corroborates listed weekly patterns, but actual dated exceptions and exact liturgical-book claims are not established merely by that programme: https://www.icrss.it/firenze/
- **Dallas Carmelite monastery — seven rows:** Mater Dei's official external-Mass section says 07:00 daily. Carmelite house identity is separate from the FSSP priests serving Mass; do not copy the Mater Dei parish's general 1962 assertion indiscriminately to the Carmelite house: https://materdeiparish.com/masses-devotions/
- **Birmingham Oratory — three rows:** Sunday 07:30 Latin, 10:30 Latin High Mass; Saturday 09:00 Latin. Do not infer the precise Missal from the language label: https://birminghamoratory.org.uk/mass-times/
- **Naples Rosariello — four rows:** official ICRSS section corroborates 11:00 Sunday Sung, 19:00 Sunday Low, 18:30 weekdays Low and 11:00 Saturday Low. The page lists other Naples worship sites separately: https://www.icrss.it/napoli/
- **Prague / Vejprty — three rows:** duplicate Praha-Karlov Sunday 17:00 assertions under two source IDs; Vejprty's association site lists both Friday 17:00 and 17:30, with date-aware exceptions. Do not collapse or mint Masses automatically: https://www.unavoce.cz/mse
- **Saint-Martin-d'Abbat and Conflans-sur-Loing — two rows:** ICRSP Orléans page supports the patterns but explicitly tells readers to confirm on the local apostolate website; Conflans is first Sunday of the month, **not every Sunday**: https://icrspfrance.fr/?org=27
- **Oxford Oratory — one row:** Sunday 11:00 Solemn Latin; Sunday 08:00 older-form Low is a distinct listing; a weekday 10:00 Mass is suspended: https://www.oxfordoratory.org.uk/mass-times.php
- **Słupsk — two rows:** **historical 12:30 Mass assertions are incorrect.** The SSPX district programme lists confessions at 12:30 and Sung Mass at 13:00; two aliases must map to one chapel and one potential celebration: https://www.piusx.org.pl/kaplice/zestawienie
- **East Greenmount / Buderim — four rows:** official SSPX district says Sunday 09:00 **or** 14:00, to be confirmed. Neither clock is an unconditional weekly occurrence: https://sspx.au/en/list-sspx-chapels-0

Review decisions are tied to the **34 original row identifiers** in the JSON file, not to newly generated schedule IDs. Source review does not satisfy the production identity, deduplication, date/exception, privacy, ministry-scoped book, `una cum`, canonical standing or full timetable import gates.

## Next operational lane

Work through the remaining **262 historical rows via the same 120-page source grouping** rather than one URL fetch per historical timetable row. Prioritize highest-volume owners and pages with ambiguous day/time expressions. Reconcile the 106 historical same-site/day/time collision groups on the latest canonical CL2 site/source IDs before promoting any occurrence. The five source-ID-less Mauritius rows remain individually held, even where first-party pages exist.

Use the **single existing worldwide timetable and CL27 classification pipelines**; do not merge draft #1775 wholesale, create a parallel Mass master, publish new liturgical claims from an institute label, or change `src/find` here.

Validation: `node tests/tlm-cl27-current-firstparty-review.mjs`.

## Classification evidence lane — source-scoped, not published

`classification-role-review.v1.json` records **13 distinct role observations across the same 12 physical-site anchors**: apostolate associations, self-described Oratory communities, district-listed chapels, national associations acting only as information sources, and the **separate Carmelite monastery host and FSSP/Mater Dei Mass-provider roles**.

These are **research candidates**, not independently published classifications. In every record, Una Cum, the Pope named in the Canon, ecclesial position, dated canonical standing, individual celebrant, exact Missal and rubrical book, and legal ownership remain explicitly UNKNOWN. An institutional label, a sung/high Mass name, or a liturgical language does not establish any of them. Do not bulk-promote all 2,715 historical CL27 assertions.

Production already exposes the 12 CL27 axes in `src/find/cl27-public-facets.js`. The next step is source-by-source admission through this existing presentation and canonical CL2 identity join, not a second taxonomy.

Both manifests are covered by `node tests/tlm-cl27-current-firstparty-review.mjs`.

## Wave 2 — 36 additional historical rows (70/296 cumulative)

`source-review-wave2.v1.json` adds **36 distinct October historical row keys** across **18 CL2 site anchors**, from three currently accessible first-party sources, two new to this review programme:
- [SSPX Mexico district](https://fsspx.mx/es/capillas-2) (19 historical rows): León's weekday Monday and Thursday exceptions; Guadalajara chapel/priorato distinction and duplicate 19:00 records; several first/third/fourth-Sunday-relative Friday/Saturday occurrences that cannot be expanded to weekly events; one San Ignacio Cerro Gordo versus San Antonio María Claret historical venue-label mismatch.
- [SSPX Australia/New Zealand district](https://sspx.au/en/list-sspx-chapels-0) (eight *additional* historical rows, after four already in Wave 1): Irymple and Singleton offer **alternative Sunday clocks**, with bulletin confirmation; four separate source labels in Singleton represent two alternating options at one physical site; Napier third-Sunday and Nelson occasional first-Sunday remain conditional.
- [Regina Caeli parish](https://reginacaeliparish.org/mass-and-confession-times), crosschecked against the [Houston archdiocesan parish finder](https://archgh.org/parishfinder) (nine rows): Sunday and selected weekday clock patterns corroborated, but parish warns private weekday Masses may be cancelled on short notice. First-party page embeds much schedule information dynamically; source classification is diocesan corroboration plus parish caution, not a guaranteed event.

Cumulative **70/296** original unverified claims have a new source-review decision. **226** remain without this review. **0** recurring Masses approved and **0** canonical or Una Cum claims published. The separate `classification-role-review-wave2.v1.json` contributes **18** source-reported organisational associations (13 Mexico, four ANZ, one Houston), bringing this programme to **31 role observations** across 30 sites, all research-only.

## Historical collision screen — all 106 groups triaged, none silently merged

`collision-screen-106.v1.json` preserves **106 original same-anchor/day/clock collision groups (234 historical rows)** with all original row IDs, source URLs, frequencies and Mass-type wording.

| Risk class | Groups |
| --- | ---: |
| Same slot across different historical source IDs | 75 |
| Different source Mass-type or rite label wording | 10 |
| Distinct source URLs / locale mirrors | 6 |
| Different month-week/frequency/recurrence qualifiers | 14 |
| Same-source repeated historical rows | 1 |
| **Total** | **106** |

This is algorithmic risk triage **not** human event adjudication. In particular **14 differing-frequency cases must never be automatically merged** based on a matching weekday and clock. All 106 remain pending the final current-source, calendar-date, ministry and ministry-level liturgical identity verification gates, and **0** merged event IDs have been minted.

Run the existing targeted CI check: `node tests/tlm-cl27-current-firstparty-review.mjs`.
