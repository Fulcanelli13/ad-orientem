# Novena French Guide Parity — 9 October 2026

## Defect

The historical Novena corpus contains sixteen playable EN/FR prayer sequences. The twelve V3 donor records supply `days[].theme` and `days[].guide` as bilingual objects. The V4 normalization layer properly translates the *prayer body* but previously inherited English-only French guide metadata in five nine-day novenas.

Source-code comparison shows **45 genuinely untranslated French day headings and 27 untranslated French guide descriptions**. A forty-sixth identical English/French value, *Adoration*, is a correctly bilingual French word and must not be classified as an untranslated error.

| Novena | French headings corrected | French guide sentences corrected |
|---|---:|---:|
| Christmas (Neuvaine de Noël) | 9 | 0 |
| Corpus Christi (Fête-Dieu) | 9 | 0 |
| Annunciation (Annonciation) | 9 | 9 |
| Assumption (Assomption) | 9 | 9 |
| Seven Sorrows (Sept Douleurs) | 9 | 9 |
| **Total** | **45** | **27** |

## Implementation

The French wording is recorded once in `src/pray/novena-french-guide-parity.v1.js` and applied in `src/pray/novena-corpus-v4.js`. The preserved, locked V3 English/historical corpus is not edited. All original historical prayer words, translations of prayer bodies, source citations, day order, start dates, common-prayer recitations, novena modes, and calendar integration remain unchanged.

**Source policy:** The new French headings and guide descriptions are **editorial translations**, not French witnesses from a historical devotional edition. This module does not certify the historical French prayer translations, and it does not silently substitute reconstructed words for ancient prayer texts. The historically attested English titles remain unchanged.

## Acceptance

`tests/pray-novenas.mjs` asserts the exact 45/27 corrected field instances, all 16 canonical IDs, the original English headings/guides, immutable prayer bodies, and legitimate `Adoration` equivalence. The existing Prayer owner, Marian mobile, phone and app-shell test suites remain release gates. Full source-language collation of 16 novena prayer bodies remains **NOT CERTIFIED**.
