# 1962 Calendar — editorial source crosswalk, 9 October 2026

**Scope:** 132 **historical** naming/count flags from the archived two-witness 2024/2027 comparison (66 + 66). This is a triage register, **not** an assertion of 132 rubrical errors or an original-missal certification. Its date-level authoritative worklist is `data/calendar/1962-editorial-reconciliation-2024-2027.v1.json`.

## Evidence and differential method
- [Missale Online 2024](https://missale.online/festkalender/en/2024/druck) / [2027](https://missale.online/festkalender/en/2027/druck), independent original comparison.
- [GCatholic 1962 2024](https://gcatholic.org/calendar/2024/Extraordinary-en) / [2027](https://gcatholic.org/calendar/2027/Extraordinary-en), independent second comparison.
- [1960 original rubrics, AAS 52](https://www.vatican.va/archive/aas/documents/AAS-52-1960-ocr.pdf#page=597) prevail in source disputes.
- [Original machine-evidence workflow](https://github.com/Fulcanelli13/ad-orientem/actions/runs/37941952423) contained `calendar-1962-full-year-audit.json` and `calendar-1962-secondary-reconciliation.json`; each listed exact date, first source, second source, resolver ID, title, rank, colour and commemoration count. The grouped data register retains **every** flagged date. Do not pass title-similarity heuristics off as a critical edition.

## Results — distinct causes, mutually exclusive archived dates
| Review category | Date flags | Finding | Action |
| --- | ---: | --- | --- |
| Generic uncontextualized feria | 55 | App label `Feria`; the witnessed ordo identifies inherited Sunday/week or Christmastide/Paschal weekday | **Open**: retrieve original source-relative title and Proper lineage, never call a weekday a Sunday |
| Saturday Mass of the BVM | 24 | App lists particular Mass formulary (`Commune/C10*`), sources give generic Saturday BVM | **Calendar day headline corrected** by strict Saturday + canonical Common-ID guard; actual Mass formulary stays visible in Mass reader |
| Saint titles / recognized names | 32 | Shortened honorifics, saint/place spelling, feast naming, day vs formulary | **Open**: original Latin + agreed EN/FR nomenclature |
| Major observance synonyms | 6 | Holy Family, Holy Thursday, Easter Vigil | **Open**: check day/Mass title hierarchy without changing special rite |
| Commemoration-count discrepancies | 9 | Source count ambiguity and historical missing commemorations | **Open**: some 2027 cases already fixed in shared resolver #704, but count and three Proper prayers must be retested |
| Vigil of Pentecost mislabel | 2 | 2024-05-18 and 2027-05-15 show `Saturday after the Ascension` for `tempora:Pasc6-6:1:r` | **Corrected at Calendar display layer**, source-ID guarded |
| St Bibiana rendered St Vivian | 2 | 2024-12-02 and 2027-12-02, `sancti:12-02:3:r` | **Corrected at Calendar display layer**, source-ID guarded |
| St Paul left Latin-only | 1 | 2027-06-30, `sancti:06-30:3:r` | **Corrected at Calendar display layer**, source-ID guarded |
| Mixed-language Advent Saturday | 1 | 2024-12-14: `Sabbato after II Sunday of Advent` | **Calendar day headline corrected** in EN/FR by exact observed Temporale ID; Proper unchanged |
| **All 2024/2027 historical flags** | **132** | 55 + 24 + 32 + 6 + 9 + 2 + 2 + 1 + 1 | **30 display headline cases addressed (5 + 24 + 1)**; 102 historical cases still await further editorial examination |

## Corrective boundaries
The canonical alias families are keyed exclusively by observed IDs, not search strings, translated names or a hardcoded civil feast date. Saturday BVM additionally verifies that the resolved date is actually a Saturday; the actual selected Common Mass remains unchanged. They change neither observed day source identity nor active Proper text, Mass rank/colour, reading sequence or commemorations. **Only the Calendar’s visible title changes.** EN/FR output and failure/unknown fail-closed behavior are contract tested. The special 2026 Pentecost Vigil composition and 2024/2027 datum are not conflated. Source witnesses: [2027 GCatholic](https://gcatholic.org/calendar/2027/Extraordinary-en), [FSSPX 1962 St Bibiana](https://ordo.fsspx.org/day/2026-12-02?lang=en), [Una Voce St Paul](https://unavocelacrosse.org/feasts/commemoration-of-st-paul/).

No implementation of the explicit II-class violet Rogation Mass is implied ([#714](https://github.com/Fulcanelli13/ad-orientem/issues/714), [#718](https://github.com/Fulcanelli13/ad-orientem/issues/718)). The seasonal-year correction [PR #720](https://github.com/Fulcanelli13/ad-orientem/pull/720) is independent; do not overwrite it. Stable Temporale/Sanctorale ID classification [PR #727](https://github.com/Fulcanelli13/ad-orientem/pull/727) has merged.

## Next acceptance
Re-run independent original-oracle and shared-resolver comparisons after a release build; separate historical flags from current live app. Distinguish the 55 uncontextualized ferias from 24 deliberately precise BVM formulary labels; adjudicate 9 commemorations using complete appointed Proper prayers. Apply source-first semantic aliases in shared liturgical data only when printed evidence and EN/FR policy agree. Never mark remaining 127 as closed from a colour/class match.

## Later 2024/2027 source run and independent rubrical blocker

The [later two-oracle workflow, run 37945652431](https://github.com/Fulcanelli13/ad-orientem/actions/runs/37945652431) records **131** editorial title flags in a newer comparison snapshot: **55 generic ferias, 24 Saturday-BVM Common titles, 2 Pentecost Vigils, and 50 other name differences**. The **132** older flags above are deliberately retained as historical evidence, not silently rewritten into a false clearance claim. The later 131 counts are *title flags*, while the older 132 group also included editorial mismatches in commemoration counts. Only exact source and selected-Mass identity checks can establish which discrepancies overlap. Do not add both snapshots.

**Two distinct, confirmed 1960 rubrical conflicts remain in the shared resolver:** 2024-10-27 and 2027-10-31, Christ the King, with an occurring II-class Sunday incorrectly treated as a commemoration. The [1960 General Rubrics, n. 17(d)](https://isidore.co/divinum/www/horas/Help/Rubrics/General%20Rubrics.html) prohibit this Sunday commemoration. [Issue #741](https://github.com/Fulcanelli13/ad-orientem/issues/741) owns the **actual** DayResolver, Mass orations and proper-source repair; Calendar display aliases do not mask or repair those prayers. Do not conflate these two errors with the 131 editorial name flags.

The new display fixes are restricted to the *single existing* `src/calendar/observance-title.js` owner. Former conflicting branch [PR #745](https://github.com/Fulcanelli13/ad-orientem/pull/745) was superseded during simultaneous merging; its second `observance-headline.js` and its competing registry must **never** be introduced. Run tests on 2024-06-08, 2027-01-02 and 2024-12-14 against the **real pinned resolver**; regression for default Mass selection must not suppress the observed day headline. No claim of full title/Proper certification is made.
