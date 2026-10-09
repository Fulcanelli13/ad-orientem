# 1962 Roman Calendar: independent secondary source reconciliation
**Audit date:** 2026-10-09  
**Years:** 2024 (366 dates) and 2027 (365 dates)  
**Status:** Source comparison complete; day-by-day liturgical certification **not complete**.

## Sources and methodology
- Primary reconstruction: [Missale Online 2024](https://missale.online/festkalender/en/2024/druck) and [2027](https://missale.online/festkalender/en/2027/druck).
- Independent second reconstruction: [GCatholic 1962 2024](https://gcatholic.org/calendar/2024/Extraordinary-en) and [2027](https://gcatholic.org/calendar/2027/Extraordinary-en).
- Legal-rubrical arbiter: [*The New Rubrics of the Roman Breviary and Missal* (1960)](https://propria.org/wp-content/uploads/2019/10/the-new-rubrics-of-the-roman-missal-and-breviary-1960-by-rev.-patrick-l.-murphy.pdf), General Rubrics §§86–90, 119, 127–130.
- Programmatic evidence: `tools/calendar/full-year-1962-oracle.mjs`, `tools/calendar/secondary-1962-oracle.mjs`, CI artifact `calendar-1962-full-year-comparison`.

The second source lists 366 and 365 daily principal Mass entries respectively. The comparison preserves 45 and 46 alternative Mass entries instead of treating alternatives as separate liturgical days. The production resolver's principal rank/colour are compared against all 731 secondary entries. Name matching, optional Masses and commemorations must be checked separately: equality of class/colour **does not** establish textual identity or editorial certification.

## Results
| Measure | 2024 | 2027 | Total |
| --- | ---: | ---: | ---: |
| Civil dates parsed from each secondary source | 366 | 365 | 731 |
| Primary-source dates without a recorded principal Mass | 29 | 32 | 61 |
| Those blanks with matching class/colour against GCatholic | 28 | 31 | 59 |
| Known conditional Rogation/Mass-selection discrepancies among the blanks | 1 | 1 | 2 |
| Previous editorial flags whose class/colour match GCatholic | 66 | 66 | 132 |
| Of these, generic abbreviated feria titles | 29 | 26 | 55 |
| Other names requiring editorial reconciliation | 37 | 40 | 77 |
| Differences in whether a commemoration is present | 0 | 4 | 4 |
| Uncatalogued secondary class/colour disagreements | 0 | 0 | 0 |
| Digital-source Christmas Vigil colour errors overridden by original rubrics | 1 | 1 | 2 |
| Earlier Epiphany-week colour disputes corroborated by GCatholic and original rubrics | 1 | 1 | 2 |

These counts reflect the published versions retrieved at the audit date, not theological approval. Neither calendar source is itself the original typical edition; independent editions can share errors.

## Rubrically adjudicated colour disagreements
- **January 8, 2024, and January 11, 2027:** White is correct for the season through January 13 (General Rubrics §119(a)); green begins January 14 (§127(a)). The white production records and GCatholic agree. The primary source's green cells are not grounds to overwrite the liturgical rule.
- **December 24, 2024, and December 24, 2027:** The production engine's violet for the Vigil of the Nativity agrees with General Rubrics §128(a), which includes Christmas Eve. GCatholic's white cell is not to be imported.

## Status after shared-resolver corrections (9 October 2026)

**Historical comparison metrics above are retained as audit evidence, not recalculated post-fix.** All 731 published entries were compared. The 61 unrecorded first-source days remain first-source evidence gaps; the second source corroborated principal class and colour for 59, while the other two exposed the default-versus-conditional Rogation distinction. This does **not** make all 61 dates independently certified.

- **Closed, original default defects:** [PR #704](https://github.com/Fulcanelli13/ad-orientem/pull/704) corrected both ordinary Minor Rogation weekdays (IV-class white, source-backed Eastertide feria). It also restored 2027 commemorations, including St Peter beneath St Paul, the Assumption's displaced Sunday, and the early-Advent ferias. [PR #696](https://github.com/Fulcanelli13/ad-orientem/pull/696) repaired corresponding 2026 cases with source-backed Collect, Secret and Postcommunion. Original [Issue #694](https://github.com/Fulcanelli13/ad-orientem/issues/694) is closed for those fixes.
- **Still open, distinct Mass variant:** The II-class violet *Exaudivit* Rogation Mass after explicitly chosen public litanies/procession is **not** yet source-complete or accepted. [Canonical work #714](https://github.com/Fulcanelli13/ad-orientem/issues/714), [shared Mass-owner acceptance #718](https://github.com/Fulcanelli13/ad-orientem/issues/718). Do not mark this feature complete because the ordinary date-only resolver passes.
- **Still open, title review:** 55 abbreviated/generic feria labels and 77 remaining naming or editorial differences require proper source/alias reconciliation. A class/colour match alone never clears these 132 entries.
  - **Newer dated audit snapshot:** [run 37945652431](https://github.com/Fulcanelli13/ad-orientem/actions/runs/37945652431) contains **131** flagged records (67 in 2024, 64 in 2027), grouped as 55 generic ferias, 24 BVM-Saturday formulary labels, 2 Pentecost Vigil aliases and 50 other names. The previous **132** is retained as a historical first-pass figure, not silently rewritten. See [date-by-date category inventory](../data/calendar/1962-title-editorial-flags-2024-2027.v1.json) and [full reconciliation](CALENDAR-TITLE-AUDIT-2024-2027.md).
  - **Rubrical conflict:** 2024-10-27 and 2027-10-31 retain a displaced Sunday commemoration under Christ the King against General Rubrics n. 17. The source-level DayResolver/Proper repair is [#741](https://github.com/Fulcanelli13/ad-orientem/issues/741); presentation fixes cannot conceal it.
- **Still open, full textual certification:** The appointed Proper sections, permitted alternative Masses and every commemoration require separate source-level review; the automated oracle currently establishes bounded rank/colour and witness coverage, not an exhaustive critical edition.
- **Acceptance dependencies:** The independent Scripture Context v3 App Convergence test drift was corrected on `main` by [PR #731](https://github.com/Fulcanelli13/ad-orientem/pull/731) after full app/phone acceptance. This does not enlarge the Calendar's liturgical certification claim; rerun the Calendar branch against the corrected base before merging.
- **Classification pipeline completed:** [PR #727](https://github.com/Fulcanelli13/ad-orientem/pull/727) merged after year, visual, directory and full App Convergence/phone gates passed. Temporale/Sanctorale categorization now uses source IDs; this does **not** certify the 131 editorial names or the source Proper.


## Release gate
The strict 2024/2027 comparison fails on any unclassified class/colour disagreement, a failed source download, a missing second-source day, or inability to resolve any app day. Documented rubrical source disagreements remain visible. Ordinary Rogation defaults and the four 2027 commemoration omissions have been corrected, but the **explicit violet Rogation Mass remains open** and the 132 titles are not yet individually certified. Resolve the listed defects, rerun both sources, then require separate editorial signoff before advertising calendar certification.
