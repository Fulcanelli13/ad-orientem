# M08 — Gregorian 1961 large-batch score quality screening
31 October 2026 · stacked on M07 #2161 → M06 #2159 → M05 #2157 → M04 #2156 → M03 #2154 → M02 #2153 → M01 #2152

## Completed 1,195 GABC structure screens

We inspected the **original 1,195 GABC score strings** from the pre-existing, unmerged source archive in PR #1749, across the same six archival batches. We **did not download them again**, copy the GABCs into production, or generate new performances.

Six new evidence ledgers, `data/research/mass-music-m08-source-qa-001.v1.json` through `-006.v1.json`, retain their original batch Git blob identifiers and each item’s original `GREGOBASE-N` ID, GABC SHA-256, office-part, and a machine-checked minimal structural audit:
- original source ID and published GregoBase URL agree;
- the source has a starting clef and a terminal double-barline marker;
- encoded GABC parentheses are balanced and score text is nonempty;
- item’s ID, part, folio and GABC hash agree with the corresponding M07 full-corpus record.

**Result: 1,195 / 1,195 passed these basic source-format checks. No structural exceptions found.**

IMPORTANT: This is an automated syntax/source-metadata audit, **NOT** musical syntax parsing or note-by-note equivalence to a printed 1961 score. A syntactically plausible GABC can still contain a wrong note, melodic variant, incomplete strophe, invalid 1962 day assignment or wrongly segmented text. For these criteria, **0 verified, 0 approved, 0 published**.

## All 83 Tracts separated

`data/research/mass-music-m08-83-tract-review.v1.json` screens the 83 `tr` candidates separately, not as generic Alleluia scores.

| Evidence against existing 1962 source text | Tracts |
| --- | ---: |
| Strong initial-text lead | 18 |
| Partial initial-text lead | 3 |
| Early text divergence | 5 |
| No existing source-text lead | 57 |
| **Total** | **83** |

Nineteen Tracts have a flagged source-position / role risk. These are **overlapping** flags rather than 19 additional Tracts. The 26 text leads are preliminary; none has complete full-verse musical parity or guaranteed selection in the actual 1962 Proper. The 57 lacking a lead are still valid archived research scores, not rejections.

## Five genuine 1961 Mass Sequences — exact source identity

The five traditional Mass Sequences are **not counted** in the 1,195 Proper source groups (which contain `in/gr/al/tr/of/co`, but not `sequentia`). We checked the individual GregoBase source descriptions for their historical use and original printed Solesmes 1961 folios, then corrected the M07 priority queue to retain exact, non-invented score IDs:

| Sequence | GregoBase ID | Graduale Romanum 1961 | Liber Usualis 1961 |
| --- | ---: | --- | --- |
| Victimae paschali | [1086](https://gregobase.selapa.net/chant.php?id=1086) | p. 242 | p. 780 |
| Veni Sancte Spiritus et emitte (Sequence) | [68](https://gregobase.selapa.net/chant.php?id=68) | p. 294 | p. 880 |
| Lauda Sion | [308](https://gregobase.selapa.net/chant.php?id=308) | p. 315 | p. 945 |
| Dies irae | [1198](https://gregobase.selapa.net/chant.php?id=1198) | p. 96* | p. 1810 |
| Stabat Mater | [681](https://gregobase.selapa.net/chant.php?id=681) | p. 597 | p. 1634V |

Source IDs verified from GregoBase's 1961 Solesmes witness descriptions, **not** note-by-note comparison to the scanned book. These five IDs are source candidates, not approval.

Important counterexamples recorded explicitly:
- GregoBase #181 `Veni Sancte Spiritus` is labelled as an **Alleluia**, not the Mass Sequence #68, despite sharing the 1961 Liber Usualis p. 880.
- GregoBase #18411 `Victimae paschali laudes` is an expressly speculative modern **reconstruction**; #11100 uses a 1975 Graduale Simplex; #7351 uses a 1974 Graduale; #13910 uses a 1965 Anglican witness. These are not interchangeable with the printed 1961 Solesmes Sequence #1086.
- Similarly titled 1908 Vatican chants may be useful comparison witnesses, **not** a silent replacement for 1961 Solesmes.
- The 1961 Dies irae #1198 metadata itself warns that an original printed custos was erroneous. It needs a real neume/facsimile adjudication rather than treating the transcription as exact simply because it cites the book.

The Sequences must be resolved from the **actual selected 1962 Mass** and applied with the precise prescribed-day/optional/exception rules. In particular, do not substitute postconciliar rubrics for the 1962 Mass; do not infer that every Mass in Eastertide receives the sequence.

## Implementation
- `src/mass/reader-m08-bulk-score-qa.js` is a pure research-only auditor. It checks all 1,195 source metadata/format records, all 83 Tracts, exact five 1961 Sequence IDs, source batch identity, editorial holds and source role. It cannot promote scores.
- `tests/reader-mass-m08-bulk-score-qa.mjs` runs inside the existing required `test:reader-schola`. It verifies every identity, mutated hashes, missing clefs, forged editorial approval, substituted sequence/Alleluia and missing source evidence.
- The M07 27-priority queue now has 13 exact GregoBase reference IDs rather than eight, and 14 remaining source-lead/gap entries. Counts updated in existing M07 regression test.
- No new reader controls, no downloaded score audio, no changed R17 paragraphs, icons, animation, Schola clock, organ rules or user settings.

## Remaining steps M09+
1. Establish exact **note-for-note** correspondence with photographed/printed 1961 sources for each priority piece. Maintain individual approval statuses at score level, not blanket edition confidence.
2. Check *complete Latin* text and exact stage boundary against the *actual* selected 1962 day/alternate Mass for the 342 preliminary leads, then expand beyond the currently screened 91 source Proper paths. Candidate name/incipit alone is insufficient.
3. Complete the additional solemn/ferial orations, Gospel and Pater noster, Requiem `Requiescant`, ordinary `Ite` with `Deo gratias`, `Benedicamus` and double-Alleluia seasonal applicability. Preserve multiple melodies where exact source warrants them.
4. Run mobile/offline visual acceptance of the existing Exsurge score sheet (PR #2111), then present one consolidated full collection for editorial selection, before any public release.

**Release gate:** Every record remains research-only and user approval is reserved for the final quality-screened collection. No new musical notation is visible in the public reader as a consequence of M08.
