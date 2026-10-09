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
- **Historical title register, partially addressed:** 132 older editorial flags (55 generic ferias, 77 other mixed editorial reasons) remain retained as source evidence. [PR #752](https://github.com/Fulcanelli13/ad-orientem/pull/752) converged canonical bilingual Saturday-BVM and Advent headlines; earlier source-ID aliases corrected the Vigils of Pentecost, St Bibiana and St Paul. **85 historical Calendar headlines are addressed (30 earlier aliases + 55 source-derived ferias); 47 archived flags remain without editorial clearance.** Neither tally establishes Mass-text certification. The latest raw-donor oracle flags 127 (65 in 2024; 62 in 2027), which is a *new snapshot*, not a remaining-error count.
- **Still open, full textual certification:** The appointed Proper sections, permitted alternative Masses and every commemoration require separate source-level review; the automated oracle currently establishes bounded rank/colour and witness coverage, not an exhaustive critical edition.
- **Commemoration ownership corrected:** [PR #753](https://github.com/Fulcanelli13/ad-orientem/pull/753) fixed the source-level Lord-feast `Set.has` membership defect and included Christ the King in the donor-derived Lord's-feast identity set. All 2024, 2026 and 2027 Christ the King probes confirm no displaced Sunday commemoration nor additional Collect, Secret or Postcommunion, while All Saints and Assumption retain their privileged Sunday orations. The full [2024/2027 source comparison](https://github.com/Fulcanelli13/ad-orientem/actions/runs/37958564284) and phone checks passed. No further Calendar-only masking is required.
- **Classification pipeline:** [Issue #721](https://github.com/Fulcanelli13/ad-orientem/issues/721) tracks the source-identity replacement for bilingual title-regex Temporale/Sanctorale classification. [PR #727](https://github.com/Fulcanelli13/ad-orientem/pull/727) is **merged**, with year, app-shell contract and full phone convergence checks passed. Its correction is language-neutral and does not certify the full calendar.


## Release gate
The strict 2024/2027 comparison fails on any unclassified class/colour disagreement, a failed source download, a missing second-source day, or inability to resolve any app day. The [9 October rerun](https://github.com/Fulcanelli13/ad-orientem/actions/runs/37958564284) passed all stages, with **0 new unclassified secondary class/colour conflicts**, 61 first-source unrecorded dates and two documented original-rubrical colour adjudications per witness pair. Ordinary Rogation defaults, 2027 commemorations and the Christ the King forbidden Sunday commemoration are corrected. **The explicit violet Rogation Mass remains open**, the remaining names need an original-source editorial review, and the 731 appointed Propers are not individually certified.

## Exact editorial worklist (follow-up batch)
[Full 132-date cause-group registry](../data/calendar/1962-editorial-reconciliation-2024-2027.v1.json) and [source/alias reconciliation](./CALENDAR-1962-EDITORIAL-CROSSWALK-20261009.md) preserve the 2024/2027 historical evidence. The canonical display projections now address **85 archived title cases**: 55 source-linked ferias, 24 Saturday-BVM dates, two Pentecost Vigils, two St Bibiana dates, one St Paul title and one Advent Saturday. **47 historical flags remain without editorial display clearance.** The latest raw-calendar-source audit independently flags **127** editorial title differences (65 + 62), a different snapshot and heuristic, not an outstanding-error count. None is declared Mass-text certified by an English/French title fix.
