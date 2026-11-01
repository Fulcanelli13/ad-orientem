# M17 — 1961 Kyriale print witness and isolated offline score engine

**1 November 2026 · Non-public research only.** Main already includes M01–M15 music-source research and the existing independent Schola. This pass reuses PR #2111 and the earlier #1749 material; it does not recreate a renderer, import the full 1,195-score GABC archive into the reader, or alter the 65-card experience.

## Identified original printed score locations

The [CMAA scanned Solesmes 1961 Kyriale](https://media.churchmusicassociation.org/pdf/kyriale-solesmes.pdf) is a directly viewable, 162-page PDF. We inspected the printed-page **scans** at the following locations. This removes the former *facsimile access* obstacle, but **not** the editorial requirement for a full neume-by-neume / text underlay check.

| Chant | GregoBase record | 1961 printed page | Zero-based PDF page |
| --- | ---: | ---: | ---: |
| Kyrie XVI | 545 | 54* | 55 |
| Kyrie XI | 2982 | 38* | 39 |
| Kyrie VIII | 1184 | 28* | 29 (continues on 30) |
| Gloria VIII | 961 | 29* | 30 (continues on 31) |
| Credo III | 749 | 64* | 65 (starts after Credo II; continues later) |
| Sanctus VIII with Benedictus | 1384 | 30* | 31 (continues on 32) |
| Agnus VIII | 2760 | 31* | 32 |

Printed headings, expected setting and incipits are directly observable. The score file provenance and exact selections are retained in `data/research/mass-music-m17-seven-facsimile-identity.v1.json`. We **have not** compared all note heights, clef changes, neume groups, repeats, text syllables or rhythmic markings against the GABC source. Counts are exactly **7 identified printed page locations, 0 fully verified scores, 0 user-approved scores**.

## Reused offline engine: staged but unreachable by the public reader

Preserved verbatim from existing PR #2111:

- Pinned MIT-licensed Exsurge dependency and license in `assets/vendor/exsurge/`.
- `reader-chant-engraver.js`, original responsive SVG engraving engine.
- `reader-kyriale-notation-viewer.js`, an optional self-contained sheet component.
- `reader-ordinary-scores-1961.js` and `reader-kyriale-research-gabc.js`, the seven existing GABCs.
- Only the exact seven-item research lookup was appended to **current main's** `reader-kyriale-catalogue.js`. All existing 18 Masses and six Credos remain unchanged.

**Deliberately NOT copied from PR #2111:** `reader-dom.js`, `reader-schola-manual-phone.mjs`, `reader-schola-local-programme.mjs`, `sw.js`, public score buttons, or offline SW entry-point installation. No existing LIVE/Schola behaviour or visual prototype was changed. An unreferenced research component is **not a new release** and not permission to publish GABC.

`tests/reader-kyriale-notation-research-gate.mjs` parses and lays out all seven GABCs using the **real, pinned local Exsurge** at phone widths (300/370 px), verifies the seven exact mapped setting identities and original facsimile page locations, checks illegal/unknown selections fail closed, and asserts no public score-entry markup or SW first-use preload. It is imported into the existing Schola source-itinerary gate.

## Remaining work, without unnecessary re-acquisition

1. **Musical parity:** for each of the seven, compare the original GABC against its printed page with documented pitches, neume subdivisions, underlay, repeated verses, ligatures and edition-specific rhythm marks. Keep a discrepancy register; do not silently rewrite the transcription.
2. **Other families:** first complete the 1962 Proper selection and printed scan comparisons for five chants per Mass, special Alleluia/Tract/Sequence branches, Asperges/Vidi aquam, celebrant tones and the full Requiem including three All Souls formularies.
3. **Editorial approval:** present one collection review with explicit accepted/held/alternative entries. No selection automatically implies what the local Schola is performing.
4. **Only after approval:** wire the existing Exsurge viewer through the *current* 65-card Schola Music Plan using its original styles and state isolation; update SW first-use cache; run full LIVE/Missal EN/FR, low/sung/solemn/Requiem/seasonal phone and offline tests.

Do not merge older draft PR #2111 or #1749 wholesale. This M17 branch contains the non-public, main-based preparation only.
