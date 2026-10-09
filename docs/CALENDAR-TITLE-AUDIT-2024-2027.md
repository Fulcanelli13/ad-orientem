# Calendar editorial title reconciliation — 2024 and 2027

**Snapshot:** [1962 two-oracle workflow 37945652431](https://github.com/Fulcanelli13/ad-orientem/actions/runs/37945652431), artifact `calendar-1962-full-year-comparison` (full daily source titles and alternatives). **Date:** 9 October 2026. **Scope:** universal Roman 1962, no local proper. **State:** editorial audit, NOT a liturgical certification.

The earlier [secondary comparison](CALENDAR-1962-SECONDARY-2024-2027.md) reported **132** title/editorial flags (66 per year, 55 generic ferias and 77 other names). The later archived after-correction run contains **131** actual title flags: **67 in 2024; 64 in 2027**. The difference is a new audit snapshot, not a case quietly declared certified. Both snapshots remain traceable.

## Auditable disposition of the 131 flags

| Category | Dates | Observed pattern | Decision / next gate |
|---|---:|---|---|
| Generic ferie | **55** | DayResolver prints `Feria`, while dated ordo describes the weekday or the Sunday from which its Mass is taken | **Open:** preserve source identity; derive weekday and Proper provenance without importing source Sunday as a new principal feast |
| Saturday BVM | **24** | DayResolver displays a seasonally varying Common Mass (`II/III/IV/V Mass of B.V.M.`); independent ordo calls the observance `Blessed Virgin Mary on Saturday` | **Calendar headline corrected from canonical Common IDs**; preserve exact Common Mass name and introit in the Mass viewer; verify alternative-votive selection under rubrics nn. 78–79 and 309 |
| Pentecost Vigil | **2** | Canonical `tempora:Pasc6-6:1:r` appears as `Saturday after the Ascension` in dated DayResolver comparisons | **Calendar headline corrected** in EN/FR by exact source identity; the canonical Mass/Proper already has a specific Pentecost Vigil resolver and is not replaced |
| Other feast names and aliases | **50** | Saint epithets, language/orthography, dedication titles, Proper-vs-day titles (e.g. Christmas midnight), Holy Saturday/Easter Vigil | **Partially corrected:** St Bibiana (2 dates) and source-labelled Advent Saturday (1); remaining require Latin Missal, EN/FR and full source-path review, not automatic title similarity |

The committed [date inventory](../data/calendar/1962-title-editorial-flags-2024-2027.v1.json) records all **131 individual dates**, with exact category, source witnesses, and explicit noncertification status. The CI artifact contains *each* original and second-source title, the production record, and the principal Mass comparison. The artifact's 91 alternative Mass entries are **not** counted as extra days.

## Separate liturgical defect: Christ the King, two years

- **2024-10-27:** `sancti:10-DU:1:w` has a displaced `tempora:Pent23-0:2:g` Sunday commemoration.
- **2027-10-31:** same principal has a displaced `tempora:Epi4-0:2:g` Sunday commemoration.
- Both independent dated entries show **no Sunday commemoration**. [1960 General Rubrics, n. 17(d)](https://isidore.co/divinum/www/horas/Help/Rubrics/General%20Rubrics.html) explicitly excludes the occurring Sunday commemoration when Christ the King replaces it.
- **Open canonical shared-owner repair:** [issue #741](https://github.com/Fulcanelli13/ad-orientem/issues/741). Do **not** simply hide the Calendar badge: source DayResolver, Proper `calendarCommemorations` and actual Collect/Secret/Postcommunion must agree.
- The two liturgical discrepancies overlap the **50 OTHER title-flag days**, but are a different dimension. Do not add 2 to the count of title flags or claim all other names are erroneous.

## Implementation/acceptance guardrails

1. Exact observed source IDs—not translated string matching—govern the small Calendar headline projection in `src/calendar/observance-headline.js`.
2. Display names are bilingual; selected Mass options, source identity, rank, colour, actual Mass formulary, commemorations and Proper composition remain untouched by the presentation correction.
3. Recheck 2024, 2027 and 2026 in actual resolved Calendar and Mass reader, not just synthetic headline unit tests. CI coverage does not certify all Propers or original title translations.
4. Continue reconciling the 55 weekday ferias and the residual other aliases against original source texts. Do not transfer an optional or alternative Mass into the principal date.
5. Distinct conditional II-class violet Rogation Mass after public litanies remains tracked under [#714](https://github.com/Fulcanelli13/ad-orientem/issues/714) and [#718](https://github.com/Fulcanelli13/ad-orientem/issues/718).

**Original witness hierarchy:** [1960 Rubrics](https://www.vatican.va/archive/aas/documents/AAS-52-1960-ocr.pdf#page=597), [Missale Online 2024](https://missale.online/festkalender/en/2024/druck) and [2027](https://missale.online/festkalender/en/2027/druck), [GCatholic 2024](https://gcatholic.org/calendar/2024/Extraordinary-en) and [2027](https://gcatholic.org/calendar/2027/Extraordinary-en); retain disagreements rather than treating either digital reconstruction as typical-edition proof.
