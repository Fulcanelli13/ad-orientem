# Holy Week legacy-versus-main reconciliation — 10 October 2026

**Owner:** [Issue #894](https://github.com/Fulcanelli13/ad-orientem/issues/894) for text-critical work; [historical intake register #342](https://github.com/Fulcanelli13/ad-orientem/issues/342) for unique donor absorption.

**Decision: stop authoring Holy Week from scratch.** Historical ownership and text are in the preserved source files; current runtime is substantially richer in places and also has genuine gaps. An older HTML implementation is a *donor*, not the current canonical runtime nor necessarily the **printed 1962 liturgical authority**. This report is based on direct comparison of the exact preserved v43.33 archive chunk, Rebuild18 (Library), SOT-04 workbook (Library), synchronized Ordo workbook (Library), and the source files on current `main`. The exact later v43.74 binary has **not** been located, so this is not a claim that every past version has been exhausted.

## Reconciliation by rite

| Rite/area | Already in older Ad Orientem | Current canonical state | Verdict / next useful work |
| --- | --- | --- | --- |
| Palm Sunday | Blessing, distribution, procession and Mass handoff already represented | 12-event PALM graph, native reader | **Retained.** Compare source texts and Matthew Passion speaker assignments; don't redo the structure. |
| Holy Thursday Mandatum | Rebuild18 explicitly asked whether the optional washing occurred after the homily; SOT-04 already defines **six actor-scoped events**, right shoe/sock removal/washing/replacement, and `MC-0026` handoff | All six source records still in `special-days-core.v1.1.json`; Batch 8 created an optional five-text reader card **without consuming the six canonical event IDs** | **Critical integration gap**, not new theology or new choreography research. Connect the existing graph to the reader and user-specific posture/action rail. |
| Holy Thursday proper Canon | The inspected v43.33 ordinary Canon has standard `Qui pridie`; did not contain `hoc est hodie` | B08 special `Communicantes`, `Hanc igitur`, `Qui pridie` cues now source-switched | **A genuine correction.** Original printed 1962 leaf/vernacular collation still open. |
| Holy Thursday after Mass | Reposition with `Pange lingua`/`Tantum ergo` and stripping already represented | Six-event HT_POST, Psalm 21, altar-of-repose and lifecycle | **Retained and refined.** Do not confuse Mandatum with the post-Mass procession. |
| Good Friday nine solemn prayers | v43.33 contains **nine complete long Latin/English/French donor records** | Current GF payload has nine Latin intention/prayer sets but **no English or French fields** | **Vernacular source lost from active owner**; recover with exact-edition filtration. |
| Good Friday prayer 7 | Archived text has `pro omnibus fratribus ... qui in Christum credunt` | Printed-1962 owner uses `pro haereticis et schismaticis` | **Do not promote donor as 1962.** Compare later liturgical edition separately. |
| Good Friday prayer 8 | Archived text has `illuminet corda eorum` (the **2008** revision) | Current payload correctly separates `PRINTED_1962` and `HOLY_SEE_2008` | **Do not overwrite printed 1962.** Primary legislative witness: [Vatican, 4 February 2008](https://www.vatican.va/roman_curia/secretariat_state/2008/documents/rc_seg-st_20080204_nota-missale-romanum_en.html). |
| Good Friday Passion / Cross | Older donor had Passion heading, death cue and sequence for nine orations, unveiling/veneration, communion | 56-event GF graph and full Latin Passion segments; voice ownership and vernacular incomplete | **Expanded structure, partial UX/text.** Reuse speaker roles and source cue boundary work. |
| Easter Vigil *Exsultet* | Complete Latin text 4,020 characters in v43.33 | **Exactly identical, byte for byte**, to current `donor.exsultet.lat` | **Already done. Do not rewrite.** Only independent 1962 text-image certification / EN-FR QA remains. |
| Easter Vigil prophecies | Earlier v43.33 supplied four lesson references, with broad `Isaias 4:1–6`, but not complete body | Four independently sourced full Latin lessons/canticles/collects; Isaiah corrected to **4:2–6** | **Genuine improvement.** Do not revert to old summary. |
| Easter Vigil Litany | Archived v43.33 Litany I/II were descriptive prose | B06: **46 + 30** verse/response pairs in the native reader | **Genuine new textual restoration** (edition critical verification still open). |
| Easter Vigil baptismal font | Archived v43.33 was a descriptive sentence rather than the proper blessing | B07: **17** distinct prayer/ritual sections, correct selected baptistery branch | **Genuine new textual restoration** (printed-1962 comparison still open). |
| Easter Vigil baptismal vows | Old bridge had a brief summary | B06 contains exhortation, renunciations, professions and Pater | **Genuine restoration.** |
| Conditional baptisms | Earlier donor acknowledged optional baptisms but did not include the complete appropriate sacrament | Native reader holds as `RITUAL_OWNER_UNRESOLVED` | **Unresolved separate Roman Ritual Title II text**, not proof of lost complete Missal prayer. |

## Important distinction

The SOT-04 workbook describes **12 Palm**, **6 Mandatum**, **6 Holy Thursday post-Mass**, **56 Good Friday**, and **38 Easter Vigil** *canonical event records*. These are precise structural counts, **not** claims that each rite's Latin text, English/French translations, speaker assignment, icon cues, source certification and phone UX is complete.

### Practical execution order (without duplication)

1. **Recover presentation from already completed sources:** wire `SP-HT-MAND-010...060` to the B08 Mandatum reader, preserve the 1962 optional activation, actor scope and handoff; no second graph.
2. **Recover source-edition-filtered translations:** reuse historical Good Friday EN/FR as candidates. Keep 7 and 8 quarantined, compare the other seven against printed 1962 before promoting any translation.
3. **Repair precise user-facing losses:** named Passion voices, correct words for death kneel/rise, and reliable source-based Palm/GF/EV presentation.
4. **Only then perform original-1962 typica page-image and authorized translation collation.** The printed edition controls textual certification; code/CI passing proves software integration, not correctness of a liturgical book.
5. Find and checksum exact v43.74 donor before finally declaring the old-version reconciliation exhaustive.

**Reproducible gate:** `npm run test:holy-week-legacy-reconciliation` verifies archived Exsultet text equality, nine archived Good Friday EN/FR bodies, edition conflicts 7/8, the six existing Mandatum records and their presently unwired status, and 12/6/56/38 source graph denominators. The [machine-readable 20-record crosswalk](../data/mass/holy-week-legacy-reconciliation.v1.json) is the single intake for next implementation PRs.

The new crosswalk does **not** certify source text, close #894, remove old donor files or make user-facing claims about the v43.74 binary.
