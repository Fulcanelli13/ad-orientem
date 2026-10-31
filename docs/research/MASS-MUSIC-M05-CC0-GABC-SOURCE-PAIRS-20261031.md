# Mass Music M05 — Seven authentic source-linked GABC research scores

31 October 2026 · stacked on M04 #2156, M03 #2154, M02 #2153, M01 #2152 · **draft**.

## Acquisition completed (not publication)

Seven original GABC transcriptions were recovered as **verbatim research copies** from the GregoBase original `download.php?elem=1&format=gabc&id=...` endpoints, each indexed to a specific 1961 Solesmes `Liber Usualis` folio:

| Score | GregoBase ID | 1961 LU | Proven text relationship | Restriction |
| --- | ---: | ---: | --- | --- |
| Preface solemn | 4449 | 109 | All three celebrant/Schola response pairs, plus `Per omnia / Amen` | 1962 solemn tone only; facsimile approval pending |
| Preface ferial | 4450 | 109 | All three celebrant/Schola response pairs, plus `Per omnia / Amen` | 1962 ferial tone only; facsimile approval pending |
| Orations festive greeting | 4487 | 98 | `Dominus vobiscum / Et cum spiritu tuo`, can be reused at Collect and Postcommunion | **Greeting only**, not the variable oration chant |
| Pater noster conclusion | 7282 | 110 | `Et ne nos inducas / Sed libera nos`, with separate `Per omnia / Amen` | **Conclusion only**, not a complete Pater noster melody |
| Asperges me | 497 | 11 | Antiphon, Psalm 50, Gloria Patri | **Omit Gloria in Passiontide** through original native rite; do not use 1974 omissions elsewhere |
| Vidi aquam | 958 | 12 | Antiphon, Psalm 117, Gloria Patri | Native Paschal branch only; do not omit Gloria per 1974 text |
| Ite Ia | 2988 | 19 | `Ite missa est, alleluia, alleluia / Deo gratias, alleluia, alleluia` | This is the **double-Alleluia formula**, not the normal Ite at all Masses |

GregoBase's declared policy states **all chant transcriptions are CC0**: https://gregobase.selapa.net/?page_id=2 . This settles the database transcription reuse licence; it does **not** certify editorial accuracy against the 1961 facsimile, source-specific permitted variation, or the rights of outside recordings.

## Exact source registry

`data/research/mass-music-m05-cc0-gabc-seven-20261031.v1.json` retains the GABC score verbatim with URL, transcriber, edition, folio, canonical target and hard `PENDING_USER_FINAL_COLLECTION_REVIEW` hold. Neither production JS, CSS nor service worker imports the new corpus.

The pure `src/mass/reader-music-gabc-source-screen.js` checks **all 26 pinned Latin text comparisons**:
- 6 + 6 verse/response text checks for the 3 Preface pairs in both solemn and ferial scores;
- 4 greeting/response checks for the Collect and Postcommunion;
- 2 checks for the Pater noster conclusion;
- 3 + 3 checks for both native aspersion antiphon/psalm/Gloria triples;
- 2 checks for the Easter double-Alleluia dismissal/response.

Unicode normalization explicitly distinguishes ordinary `æ` from accented `ǽ` in `sǽcula`. Comparison discards GABC pitch notation and punctuation ONLY for text identity screening; it does not certify melodic fidelity. All mismatches are rejected.

**Critical safety:** the `permittedPublicGregorianScore` export currently returns `null` regardless of caller-supplied approval flags. A separate trusted edition-verified, user-approved manifest must be designed and reviewed before any of the seven sources may be published. An ordinary custom parish setting or typed `Mass VIII` does not count as authorization.

## Existing pilot preserved

The seven-example offline Exsurge viewer in draft PR #2111 is **not replaced, reimplemented or merged** by M05. Future music-stage release should attach approved actual source GABCs to its existing renderer, using the same source gate for a matching celebrant/response family. PR #1749's 1,195-GABC Proper score archive remains separate, unpromoted research.

## Regression suite
`tests/reader-mass-m05-gabc-source-screen.mjs` runs in the existing `test:reader-schola` script. It checks scores, 26 source comparisons, official 1961 source references, distinct solemn/ferial encoded tunes, role-response text, corruption of Latin, licence and approval holds, Passiontide Gloria omission versus Easter Vidi, and no public import.

## Remaining musical gaps before a full user-facing Mass

1. Review the **note-by-note original facsimiles**, not just text, for these seven GABCs and ensure the 1962 books match the source selected by the Mass.
2. Extend to solemn/ferial **complete Collect/Secret/Postcommunion prayers and Pater noster tones**, their Amen responses, Gospel tones and regular Ite/Benedicamus/Requiescant.
3. Certify the **Easter octave/Pentecost dismissal conditions** from the actual selected 1962 Proper, rather than using date or the GABC's introductory caption alone.
4. Connect approved scores to the **existing offline Exsurge and H7 → R17 Mass reader** without introducing a second music system or moving the Schola/priest clocks.
5. Collect the entire editorial review batch before requesting approval; no need for individual music-choice interruptions.

No score, recording or player is yet publicly deployed. This PR is explicitly an acquisition and source-pair screening increment, not a completed Mass notation release.
