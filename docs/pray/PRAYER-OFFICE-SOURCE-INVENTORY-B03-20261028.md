# Ad Orientem — Prayer and Divine Office Source Inventory: B03
28 October 2026 | RESEARCH ONLY | No editorial approval, prayer import, production update or UI change.

## Deliverables
1. [Full Raccolta 1866 mirror-number index](../../data/pray/raccolta-1866-complete-index.b03.json) — **189 numbered rows (1–189)** with item IDs, section, index title, provisional type, provenance, and verification state.
2. [Sensus Fidelium dedicated Novenas index](../../data/pray/sensus-calendar-novena-collection.b03.json) — **61/61 titled item links resolved** and page bodies accessed via the source index.
3. [Source-family master baseline](../../data/pray/prayer-office-source-inventory.b01.json) updated to reference B03 without changing the original 214 source observations, 25 ICKSP source-selected records, 98 ICRSP Office entries or 19 spiritual-reading collections.

## Valid coverage measurement

| Corpus level | Known denominator | Completed | Missing |
| --- | ---: | ---: | --- |
| Raccolta 1866 section links | 40 | 40 | 0 |
| Raccolta historical numbered index | 189 | 189 (188 index + 1 older corroboration) | 0 unresolved numbered slot |
| Raccolta historical headings inspected directly on section pages | 189 | 52 | 137 |
| Raccolta per-entry text fully collated/verified | 189 | 0 | 189 |
| Raccolta constituent prayer texts | UNKNOWN | UNKNOWN | UNKNOWN |
| Sensus dedicated Novenas section index page links | 61 | 61 | 0 |
| Sensus Novenas indexed pages individually opened | 61 | 61 | 0 |
| Sensus Novenas source-text editions independently authenticated | 61 | 0 | 61 |
| Sensus **whole website**, prayer-bearing source pages | UNKNOWN | UNKNOWN | UNKNOWN |
| Divine Office 1960 distinct rubrically relevant source units | UNKNOWN | UNKNOWN | UNKNOWN |

**Counts across these rows are NOT additive and do not mean unique prayers or app content.** The master B01's 214 source observations are broad leads and source-page rows. The B03 189 and 61 are subordinate content indices, and an item may appear in multiple lists.

## Research evidence
- [Historical numbered Raccolta index](https://www.liturgialatina.org/raccolta/index.htm) (online mirror of St John edition hosted as 1866).
- [Sensus Raccolta index and title/edition label](https://sensusfidelium.com/the-raccolta/).
- The online index jumps from **156** to **158**. The [1857 St John index](https://en.wikisource.org/wiki/The_Raccolta_(1857)/Index) identifies **157**, *Prayer to obtain a grace*; this title is retained with a cross-edition evidence flag. Do not imply the 1866 witness for this entry has been read.
- [Sensus Novenas dedicated index](https://sensusfidelium.com/calendar/novenas/) has 61 named links, independent of [the dynamic /tag/novena/ archive](https://sensusfidelium.com/tag/novena/). Each was followed and its individual page opened; 9 resolved through dated/archive redirects.

## Provenance / identity policies
- A historical numbered Raccolta entry is NOT necessarily one prayer: it can be an Office reference, indulgence notice, composite chaplet, nine-day sequence, psalm group or devotional custom. `components_extracted` is zero until actual sub-prayer boundaries are collated.
- The online 1866 index lists titles for §§1–189 except §157; we must compare actual edition, page and source text. The 1910 Raccolta has wholly different edition and numbering and must have its own source-witness ID.
- Single-repeat and day-specific novenas are separate *forms*, not interchangeable just because they bear the same saint or feast title.
- Other Sensus prayer-bearing material lives outside its dedicated Novenas menu: spiritual works, Guéranger, Montfort, calendar posts, tagged posts, St Francis prayers, examinations and special feast-day prayers.
- Many indexed novenas are posted on the website without exact historical attribution; older title alone is not a rights/edition guarantee. Do not infer text is pre-1962 simply from its feast or saints' names.
- No historical indulgence claims should be presented as current grants.

## Next intake passes
1. **B04 Raccolta:** verify 137 index-only historical headings against source pages or scanned original; extract individual component prayers, liturgical/Scripture references, original language, English and French witnesses; differentiate historical notices from actual text.
2. **B04 Sensus:** classify all 61 novena bodies as repeat, daily, or grouped-day forms with number of individually printed original prayers and source attribution. Reconcile the 15 tag rows and 5 extra source leads as provenance, not duplicates to delete.
3. **ICKSP:** expand beyond its first 25-source accepted register and 98 Office-subsection rows to full international site indexes, then compare original text.
4. **Divine Office:** inventory the actual 1960 source corpus by Ordinary/Psalter/Temporal/Sanctoral/Common/Office of Dead/Little Office and rubrical variants; preserve original rubrics and separately documented FR/EN witnesses.
5. **After exhaustive discovery,** deduplicate source *identities* without deleting alternative historical witness rows, then report gap statistics for each actual Pray module. No inclusion selections until that stage.
