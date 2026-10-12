# Full upstream Latin Mass source extraction — completeness checkpoint (11 October 2026)

**Status: research data extracted, edition eligibility and publication gates closed.** The 1962 Roman Missal is **not** thereby textually certified or comprehensively accounted for.

## Source inventory and executable validation

| Measure | Result |
|---|---:|
| Upstream Latin source files enumerated | **1,052** |
| Source files examined in pre-existing strict Gospel/Epistle owner | **105** |
| Additional source files extracted as machine-readable section observations | **947** |
| Additional files with Git blob identity successfully checked | **947 / 947** |
| HTTP errors or source blob mismatches in final run | **0** |
| Seasonal / non-Sanctoral additional sources | **426** |
| Sanctoral additional sources | **521** |
| Candidate chant sections in those 947 new files | **1,093** (290 + 803) |
| New files containing at least one candidate chant section | **263** (75 + 188) |
| New files without detected [Section] headings | **71** (42 + 29) |
| Raw `!` source annotation lines in all extracted sections | **2,323** (1,321 + 1,002) |
| Raw source inheritance/directive lines | **833** (101 + 732) |
| Independently edition- and biblical-text-certified new chant references | **0** |

The **1,093** count refers to section occurrences in the 947 additional source files, *not* distinct chants, Bible verses, authorized Masses, or valid publication links. Generic `[Graduale]`, specialised `[GradualeL1...]` and `[GradualeP]`, `[Sequentia]`, and `[Tractus]` remain distinct source sections. Source `!` note counts span *all sections*, including lessons and non-chant material, and cannot be added naively to the earlier 536 *chant-slot citation* note count.

## Canonical research assets

- [Upstream 1,052-file enumerated inventory](../../data/geography/research/mass-latin-upstream-directory-census-20261011.v1.json)
- [947-path uninspected source triage](../../data/geography/research/mass-1962-uninspected-source-triage-20261011.v1.json)
- [426-path seasonal section evidence](../../data/geography/research/mass-seasonal-bulk-source-audit-20261011.v1.json)
- [521-path Sanctoral section evidence](../../data/geography/research/mass-sanctoral-bulk-source-audit-20261011.v1.json)
- [Original 105-path four-chant witness index](../../data/geography/research/mass-1962-105-source-path-chant-index-20261011.v1.json)
- [Bulk extraction script](../../scripts/research/mass-source-bulk-audit.mjs) / [947-path integrity test](../../tests/mass-source-bulk-audit-947.mjs)
- [GitHub Actions workflow](../../.github/workflows/mass-source-bulk-research.yml): both families extracted, all source blob SHA-1 identifiers checked, test gates passed and research JSON persisted to this branch. GitHub Actions outputs are also retained as artifacts.

**Important distinction:** the first 105 sources have been audited with a four-slot chant lens; the new 947 have been parsed at source-section level. Harmonising them into a *single* fully source- and edition-controlled liturgical-usage relation is a subsequent phase, not implied by the combined retrieval coverage.

## What remains for actual liturgical and Bible coverage

1. **1962 identity/rubric gate.** Establish an authoritative celebration denominator from the 1962 typical edition and calendar, including saints, Commons, special rites, vigils, votive, Nuptial and Requiem. Mark source files as `1962 eligible`, `historical alternative`, `conditional`, or `unresolved` only after documentary confirmation. GitHub file count is not a calendar count.
2. **Source inheritance gate.** Resolve 833 directive-line occurrences carefully with exact path, section and cycle detection; follow printed Missal for Commons not populated in the upstream folder. The six earlier Common chant uses remain held.
3. **Musical/sequence gate.** Recover the actual Alleluia, Tract, Sequence and specialised Ember reading order, rather than assuming every `[Graduale]` equals a sung 1962 chant.
4. **Verse-text gate.** Compare actual 1962 Latin incipits and texts with Clementine Vulgate, traditional Psalm numbering, Crampon, Douay–Rheims, and Esther/Daniel edition variants. Use Matthew Hazell's index as independent *coverage discovery and discrepancy detection*, not as a substitute for Latin-source textual witnesses.
5. **Canonical Bible concordance and user experience.** Only publication-certified liturgical words feed Mass, Scripture and Atlas links; author-attributed tradition, historical typology and Dujardin's devotional meditations belong to separate connection types.

Do not modify production Mass/LIVE readers, calendar or Atlas based on these research rows. All `publishable` fields remain false.
