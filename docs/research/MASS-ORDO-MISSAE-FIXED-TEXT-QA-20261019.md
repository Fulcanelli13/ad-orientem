# Ordo Missae (not Calendar Ordo) — fixed 1962 Mass text audit

**Date:** 19 October 2026 (Mauritius local) · **Audit PR:** #1422 · **Status:** FIRST-PASS VERIFIED DEFECTS, NO SOURCE PATCH.

## Correct scope

Audit the constant **Order of Mass**, excluding variable day Propers and liturgical-calendar Ordo. The canonical low-Mass and sung-Mass fixed prayers are in `data/presentation/reader-text-low.v1.json` and `data/presentation/reader-text-sung.v1.json`; French `data/presentation/reader-french-ordinary.v1.json` is pinned to Divinum Officium `126a07f91ede04664108abb6fb20ace3f4de14b9`. All 256 cue identities are present in both forms. The 30-Macro, 96-block corpus contains **85 Ordinary blocks and 11 variable Proper placeholders**, so Proper deficiencies must not be attributed to the fixed Ordinary.

Exact audit owner: `tests/mass-ordo-missae-fixed-text-qa.mjs`. Its CI artifact `ordo-missae-fixed-text-qa` records the suspect excerpts and actual final card text in both EN and FR, in both LOW and SUNG forms.

## Confirmed positive findings

| Status | Fixed cue / prayer | Language | Exact defective wording | Independent comparison | Origin |
| --- | --- | --- | --- | --- | --- |
| VERIFIED_GRAMMAR | `AO.SM.C0122`, `AO.SM.B036`, Offertory incensation Psalm 140:2 | EN | `Let my prayer, O Lord, like incense before You;` | An imperative/jussive verb is missing. The Latin reads `Dirigátur, Dómine, orátio mea`. Traditional 1962 Ordinary witnesses use `Let my prayer, O Lord, be directed as incense in Thy sight`. Alternate English phrasing `come like incense before You` also preserves a verb. | The same defective text is already in published Missale Meum's Ordo; donor-level inherited error |
| EDITORIAL_PUNCTUATION | `AO.SM.C0121`, `AO.SM.B036`, incense offering prayer | EN | `May this incense blessed by You, arise before You, O Lord` | The comma separates the subject phrase from its finite verb; `May this incense, which Thou hast blessed, O Lord, ascend to Thee` is one independently attested translation. | The same comma/wording appears in the published upstream Ordo |

**Source witnesses:**
- [Missale Meum fixed Ordo](https://www.missalemeum.com/en/ordo), including the same two English mistakes.
- [EWTN traditional Ordinary](https://www.ewtn.com/catholicism/library/ordinary-of-the-tridentine-mass-11210), with `be directed`.
- [Durham University Missa Cantata booklet](https://www.dur.ac.uk/media/durham-university/research-/research-centres/catholic-studies-centre-for-ccs/Missa-Cantata-liturgy-booklet-17-6-19.pdf), with the traditional English expression and primary Latin in parallel.
- [Una Voce America 1945 Lasance/Walsh bilingual Ordinary adapted for 1962](https://unavoce.org/resources/latin-english-text-for-mass/).

These confirmed defects remain in **both actual reader forms**. They are specific to the optional incensation text, not an assertion that every congregation hears these prayers or that the Canon has the same problem.

## Already corrected; do not reopen

- Canon Memento of the Dead, `AO.SM.C0194`: frozen donor omits the Latin conjunction in `lucis pacis`, but source-owned correction `SRC-PARITY-003` changes it to `lucis et pacis` **before actual card projection**.
- Sanctus–Benedictus `AO.SM.C0148`: source-owned `SRC-PARITY-001` inserts the printed cross after `Benedíctus` in the active card.
- Canon Te igitur `AO.SM.C0153`: source-owned `SRC-PARITY-002` restores bishop `N.`.
- Confiteor `AO.SM.C0023`, `AO.SM.C0237`: two accent corrections belong to the existing source overlay.
- The frozen Gloria opening is spread across `C0053` and `C0054`, which would create a misleading French sequence if concatenated literally. The shipped `ordinary-reader-composition.js` already composes coherent `Glória in excélsis Deo / Glory to God in the highest / Gloire à Dieu au plus haut des cieux` without changing canonical cue IDs.

The active card checks distinguish historical raw-donor errors from current display errors.

## Language and form consistency

- **256/256** fixed textual cue IDs present for each of LOW and SUNG.
- **256/256** fixed French cue texts populated.
- **54** LOW/SUNG literal text-cell differences correspond to priest/ministers speaker prefixes in the Latin and English rows (**zero** unexpected wording divergences after normalizing those prefixes).
- Five already-approved source overlay corrections present for each form.
- The sampler includes actual source-to-card projection, **not just raw JSON**, but is **not** a physical Android screenshot or full independent printed-Missal collation.

## What the pattern requires

1. **One versioned canonical correction mechanism** shared by LOW/SUNG, EN/FR, and all Mass reader modes. The existing source correction overlay is already the correct integration seam: extend it for reviewed English/French exact-cue replacements, preserving source, original fingerprint and revision, and never altering ceremonial cues.
2. **Review every fixed Ordo Missae passage** against independent Latin 1962 text, reliable traditional EN/FR Missals, including translations in places where a line is syntactically complete but semantically questionable. Record `VERIFIED_GRAMMAR`, `TYPOGRAPHY`, `HISTORICAL_TRANSLATION_VARIANT`, `SOURCE_TEXT_ISSUE`, and `UNVERIFIED`; machine lints alone cannot certify sacred texts.
3. **Compare actual projected cards** for Low/Sung and each language, not just raw donor payloads. The corrected Gloria proves why this matters.
4. **Add source-led regression tests**, including incensation texts and full Canon, after editorial approval. Confirm exact same text in final phone reader and print/Missal view, with local rite variants explicitly scoped.
5. Preserve these two source-specific defects as audit findings for an independently reviewed small patch; **do not run a global regex replacement across Mass data**.

## Limitations / acceptance

This is a **first-pass complete structural census** of 256 fixed cues plus targeted linguistic review and source comparison. The absence of a mechanical warning for another prayer **does not certify its Latin, English or French**. Independent page-by-page critical collation of the entire 1962 Ordinary remains open. No production Mass text changed in this PR.
