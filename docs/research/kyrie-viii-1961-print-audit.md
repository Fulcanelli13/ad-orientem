# Schola Kyrie VIII (De Angelis) — original-print comparison dossier

**Review date:** 10 November 2026  
**Source:** GregoBase `GREGOBASE-1184`, [current GABC](https://gregobase.selapa.net/download.php?elem=1&format=gabc&id=1184), transcribed from *Graduale Romanum* (Solesmes 1961), **pp. 28*–29***.  
**Printed witness:** [folio 28*](https://gregobase.selapa.net/sources/2/905.png) · [folio 29*](https://gregobase.selapa.net/sources/2/906.png).  
**Engraved GABC comparison:** [GregoBase PNG](https://gregobase.selapa.net/download.php?format=png&id=1184).  
**Licence:** GregoBase explicitly releases chant **transcriptions** under [CC0](https://gregobase.selapa.net/?page_id=2). The scanned original print is a different source from the CC0 GABC transcription; do not infer that GregoBase's CC0 statement grants rights to every source photograph.

## Findings supported by the printed source

| Musical unit | Source cues in 1962 Mass corpus | Facsimile folio | Source text and distinct melody | Review |
|---|---|---|---|---|
| Opening Kyrie | `C0044–C0046` | 28* | One opening musical line, printed `iij.` (three invocations) | Source identity, Latin and repeat mapping checked |
| Christe | `C0047–C0049` | 28* | Separate `Christe` line, printed `iij.` | Source identity, Latin and repeat mapping checked |
| Returning Kyrie | `C0050–C0051` | 28*–29* | Third musical line crosses the folio; printed `ij.` | Page continuation and repeat mapping checked |
| Final Kyrie | `C0052` | 29* | Distinct final line, with two asterisks/intonation marks; not the preceding melody copied again | Distinct final-variant mapping checked |

The electronic source matches the *structural form* of the surviving 1961 print: Mode V, `(c3)` clef, four musical phrases, and 3 + 3 + 2 + 1 repetitions mapped to the original nine `AO.SM.C0044`–`C0052` cues. The third line is not wholly on 28*: its cadence and repetition mark are on 29*.

The source's [editorial history](https://gregobase.selapa.net/chant.php?id=1184) reports corrections involving an altered **punctum/virga** in the Christe, a final-Kyrie **virga**, repositioned **puncta morae**, changes to melismatic spacing, and alterations. Those details require deliberate comparison with the exact printed glyphs, not simply matching the rendered contours of a current GABC file.

## What has **not** been certified

The small online scans and present review do **not** establish an independent note-by-note proofread of every neume (including quilismata and ligatures), rhythmic sign (puncta morae, episemata), pitch/accidental, asterisk and print spacing. Therefore all four phrases retain:

- `pitchAndNeumeVerification: NOT_CERTIFIED`
- `engravingDifferenceReview: NOT_CERTIFIED`
- `musicalNotationVerified: false`
- `userEditorialApproval: false`
- `publication: BLOCKED`

This is a **source-anchored structural review**, not a musical-publication decision.

## Reproducible nine-cue review manifest

`node scripts/schola/prepare-kyrie-viii-review-manifest.mjs` emits nine standalone GABC research candidates, retaining:
- the correct 3 + 3 + 2 + 1 source-line allocation;
- complete original Latin and exact canonical cue/block identities;
- a separate SHA-256 for each derived full GABC excerpt;
- the printed folios, original score identity, source URL and CC0-transcription provenance;
- an explicit, non-overridable rejection of runtime publication.

`node tests/schola-kyrie-viii-review-manifest.mjs` verifies that **none** of these nine records can be selected by the approved Schola dock even if the separate promotion-row status is changed alone. Passing this technical gate is not sufficient for approval; the two independent publication checks must be certified.

## Outstanding proof actions

1. Perform independent high-resolution print comparison of all four musical phrases with particular attention to historical punctuation and alterations.
2. Confirm that the derived per-cue `(c3)` headers and removal of printed `iij.` / `ij.` repeat annotations do not alter the intended staff music or lyric positioning.
3. Verify actual Exsurge rendering of all nine derived GABC scores at 320px/390px, including one-to-one lyric/score mapping and the distinct final cue.
4. Only after these pass, record an explicit musical/editorial approval before changing `APPROVED_MASS_INLINE_GABC` and `SCHOLA_DOCK_SCORE_APPROVALS` and testing a public release.

**Policy:** Do not substitute a modern Ordinary-form six-invocation Kyrie for this 1962 nine-invocation text; do not infer which Mass VIII setting a local choir actually sings; do not use priest card movement or estimated notation timing as evidence of observed music; do not publish the research GABC as an approved Schola score.
