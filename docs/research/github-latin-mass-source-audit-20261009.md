# GitHub Latin-Mass ecosystem: source audit 1 (9 October 2026)

Scope: source-first comparison against the existing production modular app. This is an **audit**, not an invitation to introduce another calendar, Mass reader or translation engine. No third-party liturgical data has been copied into the application.

## Confirmed 1962 calendar discrepancy and correction

Ad Orientem's `buildMajorCelebrations` previously projected St Joseph (19 March) at its nominal date in **every** year. In **2028**, 19 March is the first-class Third Sunday of Lent, so the 1962 celebration of St Joseph is **20 March**; both [GCatholic 1962](https://gcatholic.org/calendar/2028/Extraordinary-en) and [Missale Online 1962](https://missale.online/festkalender/en/2028) agree. The date is now projected through `saintJosephObservanceDate`, with `transferredFrom` retained and regression tests.

The pure candidate-date function also handles cases when 19 March falls in Holy Week or the Easter octave, giving precedence to the Annunciation's explicitly reserved Monday after Low Sunday under the [1960 General Rubrics nn. 95–99](https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/horas/Help/Rubrics/General%20Rubrics.html). The **2035** double transfer (Annunciation 2 April, St Joseph 3 April) is currently a reasoned rubrical regression, **not** counted as an independently certified published-calendar witness. Further year-by-year validation is required.

The separately recorded `data/calendar/1962-transfer-oracle.v1.json` contains seven bounded published-date checks for 2024–2029. Each links to an external 1962-calendar witness. No current-rite transfer dates are used as 1962 oracle data. The calendar-runtime's `nextResolvedMajorCelebration` still verifies candidate dates through the actual day resolver: candidate values must never independently determine the displayed Mass, rank, title or colour.

**Still open:** full 365/366-day independent title, class, colour and commemoration comparison; transfers involving local diocesan and order calendars; 2035 cross-reference against a published 1962 Ordo. A geometric whole-year sweep is not equivalent to liturgical certification.

## Latin text audit: actual existing coverage, not a new product proposal

Inspected the existing frozen ordinary text files:

| Source file | Blocks | Cues | Nonempty Latin | Latin cues with explicit acute accent |
| --- | ---: | ---: | ---: | ---: |
| `data/presentation/reader-text-low.v1.json` | 96 | 276 | 256 | 210 |
| `data/presentation/reader-text-sung.v1.json` | 96 | 280 | 256 | 210 |

These are **stress-bearing-cue counts**, not a judgement on every Latin word's correctness; many short cues (e.g. `Amen`, `Credo`, and isolated words) do not require written stress marks. No decomposed Unicode accents were observed in either set. The existing `src/mass/canonical-text-corrections.js` already preserves a specific `oráre pro me` correction in both forms and its regression tests. Do **not** run an automatic accentuator over donor data or substitute an external translation; compare selected disputed phrases against primary texts and record adjudicated changes in the existing correction registry.

Four cue IDs contain uppercase **English editorial stage-direction placeholders** in the field named `latin`, identically in Low and Sung:
- `AO.SM.C0041`: `[INCENSES THE CROSS AND ALTAR]`
- `AO.SM.C0081`: `[GOES TO THE GOSPEL-SIDE MISSAL]`
- `AO.SM.C0155`: `[SILENT COMMEMORATION OF THE LIVING]`
- `AO.SM.C0193`: `[SILENT COMMEMORATION OF THE DEAD]`

These are not purported Latin prayers. Before editing, trace whether `ordinary-reader-composition`/the native reader expose them as prayer paragraphs or intentionally present them as rubric/state cues. Preserve canonical cue IDs and avoid changing the raw frozen donor hashes. A bilingual presentation-only treatment may be appropriate if they do render as prayer text.

## Reuse boundaries and sequenced backlog

| Source | Verified licence (repository LICENSE) | Safe research application | No direct import yet |
| --- | --- | --- | --- |
| [Missale Meum](https://github.com/mmolenda/missalemeum) | MIT (code) | Independent 1962 resolver comparison; iCal/PDF workflow design | Its Python API and Polish/English text corpus are not our runtime |
| [Divinum Officium](https://github.com/DivinumOfficium/divinum-officium) | MIT (repo LICENSE) | Text witness, original rubrics, additional historical comparisons | Multiple rubrical editions exist; use **1960** specifically |
| [Exsurge](https://github.com/bbloomf/exsurge) | MIT (code) | Optional GABC SVG rendering inside existing Schola surfaces | No new music module or obligatory large dependency |
| [Accenteur](https://github.com/BrRoman/accenteur) | Not confirmed in this pass | Editorial cross-check of difficult accents | Do not add unlicensed algorithms or overwrite source accents |
| [GregoBaseCorpus](https://github.com/bacor/gregobasecorpus) | Not independently verified in this pass | Candidate chant identification | Verify individual content rights, editions and liturgical assignment |

Priorities after this first patch:
1. Complete an **independent full-calendar comparison** of production resolver output (all days, classes, colours, commemorations, and any local variants). Publish discrepancies as evidence, not automatic corrections.
2. Audit displayed bilingual rubrics vs Latin placeholders and Ordinary/Proper source identity on representative Mass sessions; fix *verified* faults through current modular owners.
3. Only after date certification, build opt-in `.ics` export and printable Latin–French/Latin–English booklet from the resolved day/session objects. No second calendar registry.
4. Continue certified offline packs and, if actually needed, optional Schola GABC presentation.

This audit changes no existing Mass event graph, native R17 reader, Proper bindings, liturgical assets, Schola behaviour, Calendar DOM/runtime or Prayer/Formation/Directory pipeline.
