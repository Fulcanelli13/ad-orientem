# Mass music M12 — original 1961 score-text recheck and rubrical voice-family gaps

31 October 2026 · research only, stacked above M11 [#2166](https://github.com/Fulcanelli13/ad-orientem/pull/2166). No live Mass/music UI, runtime assignment, audio, 65-card change, or publication.

## A. What was actually rechecked

The M11 **15 unresolved occurrences** were re-examined against the **original archived GABC text** of the separate, unmerged 1,195-item [#1749](https://github.com/Fulcanelli13/ad-orientem/pull/1749) Graduale Romanum (1961) research branch, not a generic Gregorian incipit search.

This is **not** a facsimile or performed-music check. The original GABCs remain in their existing archive and were not copied. We retained only normalized Latin streams, exact original GABC SHA-256 metadata, source folio/URL, archive Git blob identities and individual 1962 donor source SHA from M11. Typographical inline tags such as `T<sc>u</sc>` must not split a word.

| Evidence class | Occurrences | What it establishes |
| --- | ---: | --- |
| Shared contiguous Latin passage ≥8 words | **6** | A substantial text overlap in an original score, but not a 1962 assignment or full text parity |
| Shared passage 4–7 words | **3** | Partial text relationship; variants and incomplete/different verses require checking |
| Longest shared passage <4 words | **6** | Insecure original score relationship; source/role and folio investigation required |
| **Total** | **15** | **12** original GregoBase score identities, **14** distinct source/score/donor combinations |

Seven occurrences have a conflict between the original GABC musical role and the role provisionally indicated by the M11 source segmentation. One **exact occurrence identity occurs twice** (GREGOBASE-63 at `Tempora/Pent20-0`); the record retains both historic occurrences without claiming two distinct missing musical works.

**Important concrete examples**:
- `GREGOBASE-850` (Gradual, archived 1961 p. 81) has **13** uninterrupted words shared with the donor line, after preserving `T<sc>u</sc>` as `Tu`. Its earlier prefix failure is at least in part a text-normalization artifact; it is **not yet a selected-Mass musical certification**.
- `GREGOBASE-143` (Offertory, 1961 p. 116) has **14** shared words; the archived stream reads `qui mihi tribuit` where the inspected donor line says `qui tribuit`. Do not silently drop `mihi`; adjudicate the actual printed witness.
- `GREGOBASE-391` (Communion, 1961 p. 310) shares **11** contiguous words and exposes `coeli`/`caeli` normalization. The candidate remains unapproved.
- `GREGOBASE-348` has **eight** matching words inside the *verse*, not at the chant's opening. A match that requires verse-aware comparison must never be mislabeled as a certified complete Proper.
- `GREGOBASE-635` shares nine words but its archived original part is **Alleluia** while the corrected M11 text segment is provisionally **Gradual**. Strong text overlap cannot override this role conflict.
- The `GREGOBASE-1380` 21st-after-Pentecost Alleluia score is already in the original archive and earlier source-referenced pilot; it differs from the donor line by preposition and Alleluia placement, not sufficient proof of omission.

The 15 cases are therefore **not** acquisition instructions for 15 new melodies. The key next decision for each is the exact 1962 Mass/Proper, correct chant role, full verse text, original 1961 folio and note-by-note fidelity. No automatic source ID changes have been made.

## B. Rubrically precise celebrant and dismissal coverage

`data/research/mass-music-m12-celebrant-special-rite-gaps.v1.json` inventories **19 source-specific research requirements**:

- **6** have existing M05 GABC source candidates: festive greeting/response; solemn and ferial Preface dialogues including `Per omnia/Amen`; Easter octave double-Alleluia dismissal; Asperges me; Vidi aquam.
- **1** has a partial candidate: the existing Pater noster **conclusion and response**, but **not the full Pater noster melodic formula**.
- **11** still require the corresponding complete, original-edition score source (ferial greeting, full solemn/ferial Collect and Postcommunion formulas, variable Preface body, Gospel, regular Ite, Benedicamus, Requiescant and aspersion conclusion).
- **1** is deliberately not a sung-score target: the **Secret prayer text**.

The **1962 Missal General Rubrics nn. 480–481** require the Secret prayers to be said silently, with only the final `Per omnia saecula saeculorum` aloud. Older or later ritual descriptions must not change this. The existing M05 Preface records already contain candidate `Per omnia / Amen` melodic pairs. Reference: https://isidore.co/divinum/www/horas/Help/Rubrics/Missal1960%20rubrics.html

**1962 nn. 507–510** distinguish the normal `Ite missa est / Deo gratias`, the processional `Benedicamus Domino / Deo gratias`, the Requiem `Requiescant in pace / Amen`, and the double Alleluia during the proper Easter octave. Do not use the pre-1962 shortcut “Mass without Gloria automatically takes Benedicamus.” The *Liber Usualis* 1961 is the principal score-book witness, subject to exact folio and note verification: https://propria.org/wp-content/uploads/2019/10/liber-usualis-1961.pdf

Every M05 item above is still an **unapproved research candidate**. Neither GregoBase CC0 status nor a compatible Latin phrase approves pitches, printed-note fidelity, performance, audio, or public score rendering. Missing or partial material is not filled by heuristic interpolation.

## C. Durable code, tests and restrictions

- `data/research/mass-music-m12-original-score-text-recheck.v1.json` — all 15 source occurrences, twelve source-GABC text-only snapshots, exact score and 1962 donor provenance, computed longest shared word positions, and all original editorial holds.
- `src/mass/reader-m12-text-recheck.js` — fail-closed evidence audit, roles, source hashes, text-span reproduction, duplicate preservation and no-publication return.
- `data/research/mass-music-m12-celebrant-special-rite-gaps.v1.json` — no-silent-Secret-error inventory with M05 source references and exact source exceptions.
- `tests/reader-mass-m12-text-recheck.mjs` — checks archive identities, 6/3/6 text evidence, 15/14/12 cardinalities, seven conflicts, no false score approval, all nineteen voice-family holds and absence of automatic reader import.
- Required `tests/reader-schola-source-itinerary.mjs` imports the M12 checks.

**Publication and merge remain closed.** No score is selected for the public reader. Full selected-Mass Proper verification, printed 1961 notes, sources for the eleven missing requirements, final complete-collection editorial review and phone/offline CI remain necessary. M11 exact-head workflow status must also be independently confirmed.

## D. Next focused music work

1. Resolve the 15 source cases by actual 1962 Proper/Graduale pages, prioritizing the six longest overlaps and known textual variants before new acquisitions; preserve all alternative scores and historical donor records.
2. Acquire **full** oration, Gospel, Pater noster, dismissal and aspersion response music from original-edition folios, retaining solemn/ferial, season, Requiem and ceremony branches without assigning melodies from a date.
3. Resume Tract/Sequence complete-note verification and other special rites, reuse the extant 1,195 score archive, then prepare **one consolidated editorial review** of the entire collection.
4. Only following approval: connect to the existing offline Exsurge viewer and approved H7/65-card R17 Mass, with independent Schola and celebrant clocks and Latin/EN/FR text.

No second score renderer, new music player, paid infrastructure, or parallel ritual experience is authorized.
