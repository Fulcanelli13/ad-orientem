# First 100 Mass Propers — source integrity defects to repair

**Source:** [PR #776](https://github.com/Fulcanelli13/ad-orientem/pull/776), successful Calendar CI [run 37984440876](https://github.com/Fulcanelli13/ad-orientem/actions/runs/37984440876), artifact `calendar-1962-full-year-comparison` containing `calendar-1962-proper-source-batch-100.json`. **Review date:** 10 October 2026. This register records discovered defects, **not** acceptance or independent critical collation.

The production `DayResolver` sampled 100 distinct source paths (50 each in 2024 and 2027) covering 30 I-class, 30 II-class, 36 III-class and 4 IV-class cases. All 100 have a Latin core and all three main oration groups. Forty-seven include commemoration compositions. These figures prove source accessibility only, **not** literal agreement with a 1962 printed Missal, absence of prayer placeholders or complete English/French text.

## Bilingual gaps — inspect these specific source paths

The independent recomputation of *rendered section slots* (not the engine's cached `languageCoverage`) found **18 English** and **4 French** missing sections. Grouped by selected source:

| Canonical source | English slots missing | French slots missing | Immediate owner/action |
| --- | ---: | ---: | --- |
| `Sancti/02-22` (22 February 2024) | 5 | 1 | Source-level inherited readings/antiphons and Gospel; recheck joined Peter–Paul orations from #767 |
| `Sancti/01-15` (15 January 2024) | 3 | 0 | Communion and two Collects: distinguish saint Proper from additional commemorations |
| `Sancti/05-25` (25 May 2027) | 3 | 3 | Gradual, Gospel and Communion in both languages |
| `Sancti/02-06` | 1 | 0 | Second Collect of composed commemoration |
| `Tempora/Quad3-3` | 1 | 0 | Second Collect of composed commemoration |
| `Tempora/Quad5-4` | 1 | 0 | Second Collect of composed commemoration |
| `Tempora/Quad1-4` | 1 | 0 | Second Collect of composed commemoration |
| `Commune/C10c` | 1 | 0 | Saturday BVM Collect |
| `Commune/C10Pasc` | 1 | 0 | Saturday BVM Collect |
| `Commune/C10t` | 1 | 0 | Saturday BVM Collect |
| **Totals** | **18** | **4** | **10 distinct source identities** |

The independent audit also finds **five false-green `languageCoverage` indications**: `Sancti/01-15`, `Sancti/02-06`, `Tempora/Quad3-3`, `Tempora/Quad5-4` and `Tempora/Quad1-4`. Coverage must be computed *after* inherited sources, commemoration stacking and proper text normalization.

## Unresolved source syntax and name placeholders

The 100 sampled Masses contain **149 unresolved token occurrences**, consisting of **126 `$Per Dominum` / `$Qui tecum` family prayer-conclusion markers** and **23 `N.` name placeholders**. These are source-format tokens, not completed liturgical text. Counts refer to occurrences, not 149 separate Masses or unique causes. Some may be appropriate internally for textual referencing; user-facing Missal/reader text must expand the correct form with person, number, language, and conclusion context. Do **not** blindly replace `N.`: the actual commemorated saint, grammatical case and all source languages must be checked individually. Fix at a single canonical text-rendering or source-normalization owner without corrupting historical source text.

## Acceptance gates for the next corrections

1. Re-run the existing production 100-source artifact; maintain zero missing Latin core and 100 resolvable main oration sets.
2. For the ten named source identities, inspect all three languages *after* inherited sections and commemorations are composed; require zero unexplained missing slots before marking them bilingual-complete. Never invent a translation or mislabel modern editorial work as an original historical edition.
3. Distinguish `$...` source directives from actual visible unexpanded abbreviations; verify context-correct Latin, English and French completions in the native Mass reader, and prohibit visible `N.` after canonical saint identification.
4. Make the source-integrity report reject false-green `languageCoverage` for any Latin-bearing final composed section; coverage must include *all* Collects, Secrets and Postcommunions, not only the principal Proper's initial nine slots.
5. Independently compare each selected Latin Proper with the 1962 Missal before claiming text certification. This is a **separate** source-critical gate, not fulfilled by download/shape validation.

The distinct conditional II-class violet Rogation Mass is tracked in its completed source-and-reader work [#714](https://github.com/Fulcanelli13/ad-orientem/issues/714) and [#718](https://github.com/Fulcanelli13/ad-orientem/issues/718); it was not sampled in this date-only audit. Do not reopen or recertify it from these figures. Exclude Good Friday, which is not a Mass.
