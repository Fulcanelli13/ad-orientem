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

## Final Kyrie VIII: the choir changes **inside the ninth invocation**

The primary 1961 *Graduale Romanum*, `De ritibus servandis in cantu Missae`, §II, establishes nine Kyrie/Christe invocations and says the concluding Kyrie can be divided by the simple and double asterisk. In the **three-part** version printed for Kyrie VIII, the parts are sung in order by the cantors or first choir group, the second choir group (repeating the preceding melody), and **both groups together**. This is a performer/phrase division, **not three additional Kyrie invocations**. [1961 rubric text, printed p. XXIV](https://fliphtml5.com/tlnkj/pybi/Graduale_Romanum_1961/23/) and [1961 Kyrie VIII page 29*](https://gregobase.selapa.net/sources/2/906.png).

The ninth source cue stays **`AO.SM.C0052`**, with three subordinate original-GABC subphrases rather than any new Mass card or cue. The other eight Kyrie and Christe invocations are sung alternately with cantors or choirs, but which local group starts is **not asserted**. Review-only implementation: `src/mass/reader-kyrie-viii-cantor-turns-review.js`; regression: `tests/schola-kyrie-viii-final-cantor-turns.mjs`.

The two star markers and exact GABC fragments are preserved as evidence for future notation/performance highlighting; no local performance or exact singing time is observed. These new performance-role annotations do **not** constitute musical proof or editorial permission to publish the score.

## Three separate historical printed witnesses — 10 November 2026

Original printed folios have now been located and inspected at the edition/layout level:

| Historical witness | Original printed page | Scan link | Current audit |
|---|---|---|---|
| *Graduale Romanum* (Solesmes 1961) | 28* and 29* | [28*](https://gregobase.selapa.net/sources/2/905.png) · [29*](https://gregobase.selapa.net/sources/2/906.png) | Primary score; source identity, four melodic phrases, repeats and final performer stars corroborated |
| *Liber Usualis* (Solesmes 1961) | 37 | [p. 37](https://gregobase.selapa.net/sources/3/148.png) | Separate original printed witness with the four phrases and final star handoffs |
| *Chants of the Church* (Solesmes 1956) | 19 | [p. 19](https://gregobase.selapa.net/sources/5/34.png) | Separate printed witness with the Latin score and an English gloss below it |

These are **three published printed layouts**, not proof that three unrelated editors independently transcribed every neume. The currently pinned GregoBase GABC has a single editorial lineage. Comparing its rendering to another image of that same GABC is not independent musical validation.

### Source-mark audit ledger

`scripts/schola/kyrie-viii-three-witness-neume-ledger.mjs` enumerates the original pinned GABC by source line: **13 + 9 + 10 + 13 = 45 printed-source marks**, including parenthesised neume/clef/bar groups, the first Kyrie intonation star, all three printed repeat directives and two final Kyrie performance asterisks. These create **135 specific print-comparison tasks** across the three historical witnesses. All tasks remain `NOT_EXAMINED_NOTE_BY_NOTE` and **zero** are certified.

This count represents **GABC token groups / structural source marks**, not 45 individual musical notes. A neume group can contain several pitched signs. The source score's historical editorial changes deserve particular attention: the Christe punctum-to-virga correction, a final Kyrie virga correction, relocated puncta morae, and alterations/half spaces. See [GregoBase source revision history](https://gregobase.selapa.net/chant.php?id=1184). Neither the source-mark count nor prior Exsurge mobile rendering is evidence that those notes have been checked against all three printed scores.

The existing offline [Kyrie VIII editorial gallery](../../scripts/schola/build-kyrie-viii-review-gallery.mjs) now links all three witnesses and displays the 45 raw units in four separate melody sections. The printed images are **linked rather than redistributed**. Musical publication is still blocked pending explicit note/pitch/rhythm certification and an independent owner editorial decision.

## Direct printed-symbol comparison completed — 10 November 2026

The visual check of the 1961 *Graduale Romanum* (28*–29*) and 1961 *Liber Usualis* (37) has established the presence and position of **six structural signs in each witness**. This is a source **rubric/printing-symbol check**, not a pitched-music proofread.

| Source-mark ID | Printed sign | Graduale 1961 | Liber Usualis 1961 | Meaning |
|---|---|---|---|---|
| `K8-L01-U05` | `*` | [28*](https://gregobase.selapa.net/sources/2/905.png) | [37](https://gregobase.selapa.net/sources/3/148.png) | Opening Kyrie intonation boundary |
| `K8-L01-U12` | `iij.` | [28*](https://gregobase.selapa.net/sources/2/905.png) | [37](https://gregobase.selapa.net/sources/3/148.png) | Opening Kyrie repeated three times |
| `K8-L02-U08` | `iij.` | [28*](https://gregobase.selapa.net/sources/2/905.png) | [37](https://gregobase.selapa.net/sources/3/148.png) | Christe repeated three times |
| `K8-L03-U09` | `ij.` | [29*](https://gregobase.selapa.net/sources/2/906.png) | [37](https://gregobase.selapa.net/sources/3/148.png) | Returning Kyrie repeated twice |
| `K8-L04-U04` | `*` | [29*](https://gregobase.selapa.net/sources/2/906.png) | [37](https://gregobase.selapa.net/sources/3/148.png) | Single-star split in final Kyrie |
| `K8-L04-U07` | `**` | [29*](https://gregobase.selapa.net/sources/2/906.png) | [37](https://gregobase.selapa.net/sources/3/148.png) | Full choir enters at double star |

**Current quantified position:** 45 GABC source-unit groups × 3 printed witnesses = **135 possible item–witness comparisons**; **12 structural-marker visual observations** recorded; **123 item–witness comparisons not yet visually reviewed**; **zero certified note-by-note pitch/neume/rhythm comparisons** and **zero musical/publication approvals**. All original printed signs need editorial confirmation before musical approval. The 1956 *Chants of the Church* p. 19 remains unexamined at this token-by-token level.

### Keep the 1961 and 1974 chant transcriptions separate

A published [1974 *Graduale* Kyrie VIII GABC transcription](https://en.gregorianum.org/wiki/Missa_VIII_%28Missa_de_Angelis%29) uses `bis` in the initial two invocations and different note grouping, hyphenation and editorial spacing. Those differences can be legitimate consequences of a later printed source and/or a different liturgical presentation; they **must not be silently substituted** into the pinned *Graduale Romanum* 1961 source used for the 1962 Mass reader. This edition comparison is a conflict screen, not an independent verification of 1961 pitch values.

## Opening Kyrie pitch inventory — source GABC decomposed

The opening Kyrie (1961 `Graduale Romanum` p. 28*, `AO.SM.C0044–C0046`) has been decomposed from the exact SHA-locked GregoBase transcription. There are **eight pitched GABC neume groups representing 25 encoded noteheads**, with the seven sung Latin syllables spanning those groups (the melisma after the intonation star continues the preceding `e`). This is a code transcription inventory, **not a comparison claim about the printed music**.

| GABC group | Source ID | Encoded sung pitches (case retained) | Non-sung sign |
|---|---|---|---|
| `(d)` | `K8-L01-U02` | `d` | — |
| `(gxfgh)` | `K8-L01-U03` | `f g h` | `gx` = flat sign |
| `(h.ivHGh.)` | `K8-L01-U04` | `h i H G h` | — |
| `(/[-2]kvIH'Ghih.)` | `K8-L01-U06` | `k I H G h i h` | typographical space directive |
| `(gxhvFE'Dgf)` | `K8-L01-U08` | `h F E D g f` | `gx` = flat sign |
| `(e')` | `K8-L01-U09` | `e` | — |
| `(e)` | `K8-L01-U10` | `e` | — |
| `(d.)` | `K8-L01-U11` | `d` | — |

**Why this matters:** In GABC, a letter followed by `x` is a *flat at that staff position*, not an extra sung note. Naively counting all `[a-m]` glyph letters would overcount two `g`s and falsely report 27 pitches. Correct inventory: **25 noteheads + 2 non-sung accidental glyphs**. Capital note letters are italic/diamond (puncta inclinata), not a separate octave; period denotes punctum mora, apostrophe vertical episema, and suffix `v` a virga stem. See the [Gregorio notation reference](https://gregorio-project.github.io/gabc/details.html) and [GABC pitch shape reference](https://gregorio-project.github.io/gabc/).

The code records each source group, encoded pitch letters, the accidental glyphs and rhythmic-symbol flags, original scan links, and separate counters **zero** for pitch positions, noteheads, accidental glyphs and rhythmic signs independently certified from print. The parser is a way to make that next visual comparison reproducible. It does not prove the source transcription is faithful to every original staff glyph. Source-specific file: `scripts/schola/kyrie-viii-opening-pitch-inventory.mjs`; strict gate: `tests/schola-kyrie-viii-opening-pitch-inventory.mjs`. The latest offline nine-cue gallery includes the eight-group pitch inventory alongside the actual phone score images.

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

## Completed technical review — source-locked offline phone rendering

Dedicated [CI run 42779203593](https://github.com/Fulcanelli13/ad-orientem/actions/runs/42779203593) (10 November 2026) rendered all nine **unapproved** source-specific excerpts with the existing bundled Exsurge library: **9/9 at 320px and 9/9 at 390px**. All 18 SVGs remained inside the phone viewport, and all **18/18** GABC-to-SVG lyric mappings validated exactly.

This uncovered a real decorated-initial segmentation detail: Exsurge displays the `K` and `Y-` of the first `KY` as adjacent text nodes. The strict follower now combines those nodes for **the first syllable only**, after checking the exact concatenated Latin identity. The rest of the original syllables must match individually, in order. Unit tests reject incorrect initials and changed middle syllables. No sounds or actual choir timing were inferred.

These results establish the **technical engraving and alignment** of the candidate GABC excerpts—not independent musical note-by-note verification or editorial approval.

## Outstanding proof actions

1. Perform independent high-resolution print comparison of all four musical phrases with particular attention to historical punctuation and alterations.
2. Confirm that the derived per-cue `(c3)` headers and removal of printed `iij.` / `ij.` repeat annotations do not alter the intended staff music or lyric positioning.
3. Once editorially approved, run an actual 65-card LIVE reader session with the true selected Kyrie VIII score, confirming the nine individual cues, source Latin, mobile scroll/syllable timing, and no false local-choir performance inference. (The isolated offline Exsurge and glyph-alignment tests above are already green.)
4. Only after these pass, record an explicit musical/editorial approval before changing `APPROVED_MASS_INLINE_GABC` and `SCHOLA_DOCK_SCORE_APPROVALS` and testing a public release.

**Policy:** Do not substitute a modern Ordinary-form six-invocation Kyrie for this 1962 nine-invocation text; do not infer which Mass VIII setting a local choir actually sings; do not use priest card movement or estimated notation timing as evidence of observed music; do not publish the research GABC as an approved Schola score.
