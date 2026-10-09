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

## Substantive open product defects
1. **Minor Rogations, May 6 2024 and May 3 2027.** The current date-only engine automatically reports a fourth-class violet `Feria` sourced from `tempora:Pasc5-1:4:v`. GCatholic distinguishes a fourth-class *white* Eastertide feria and a separate second-class *violet* Rogation Mass. Under General Rubrics §§86–90 and 130(a), the violet Mass is linked to a procession or public litanies. The app must not infer that rite from the date alone. Correct the Calendar default while retaining explicit optional following-action selection in the Mass reader. Do not apply a blanket seasonal colour override.
2. **2027 commemorations omitted from the production ordo:** 30 June (St Peter under St Paul, corroborated by GCatholic only), 15 August (XIII Sunday after Pentecost under the Assumption), 30 November (Advent feria under St Andrew), 8 December (Advent feria under the Immaculate Conception). The latter three also agree with the primary source's commemoration presence. Confirm the governing commemoration rubric before correcting the shared DayResolver; preserve the principal celebration and its rank/colour.
3. **55 generic feria titles** require consistent descriptive proper names for users, not invented saints or feasts. The remaining **77 titles** have abbreviation/alias or deeper naming differences requiring passage/edition comparison. Class/colour confirmation alone has not cleared these.
4. **Principal Mass text and every individual commemoration** still require full editorial/source certification, rather than only presence comparison. An independent source's empty cell is a limit of that source, not a declaration that a date has no Mass.

## Release gate
The strict 2024/2027 comparison fails on any unclassified class/colour disagreement, a failed source download, a missing second-source day, or inability to resolve any app day. Documented rubrical source errors are preserved as adjudications; the **Rogation conditional-mode issue is explicitly open**, not reclassified as certified. Resolve the listed defects, rerun both sources, then require separate editorial signoff before advertising calendar certification.
