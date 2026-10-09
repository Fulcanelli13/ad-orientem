# Prayer original-text review — ten complete Compendium prayer forms

**10 October 2026 · Whole-form source comparison and editorial provenance fixes**

The source text of ten commonly used prayers was compared in each of the canonical app's English, French and Latin renderings against the published [English Compendium of the Catechism of the Catholic Church](https://www.vatican.va/archive/compendium_ccc/documents/archive_2005_compendium-ccc_en.html) and [French Compendium](https://www.vatican.va/archive/compendium_ccc/documents/archive_2005_compendium-ccc_fr.html). The English document also contains the original Latin prayer forms; the French document provides its separately published locale variants and Latin appendix.

Machine-readable findings: [`data/pray/prayer-compendium-whole-form-comparison.v1.json`](../data/pray/prayer-compendium-whole-form-comparison.v1.json).

**Scope:** 10 entire prayer forms × 3 languages = **30** examined language/source relationships. This is manual word-sequence and source-form review, **not** a diplomatic print-edition transcript, translation-rights approval, or independent verbatim publication certificate. All 48 prayer bodies are untouched; none is newly classified as fully certified.

## Item-level outcomes

| Canonical Prayer ID | English source relation | French source relation | Latin source relation |
|---|---|---|---|
| `foundations_sign_of_cross` | WORD_SEQUENCE_MATCH_PUNCTUATION | WORD_SEQUENCE_MATCH_PUNCTUATION | WORD_SEQUENCE_MATCH_ACCENTS |
| `foundations_glory_be` | WORD_SEQUENCE_MATCH_PUNCTUATION | WORD_SEQUENCE_MATCH_PUNCTUATION | WORD_SEQUENCE_MATCH_ACCENTS |
| `foundations_hail_mary` | WORD_SEQUENCE_MATCH_PUNCTUATION | WORD_SEQUENCE_MATCH_PUNCTUATION | WORD_SEQUENCE_MATCH_ACCENTS |
| `foundations_guardian_angel` | WORD_SEQUENCE_MATCH_VERSE_LAYOUT | WORD_SEQUENCE_MATCH_PUNCTUATION | WORD_SEQUENCE_MATCH_ACCENTS |
| `foundations_eternal_rest` | WORD_SEQUENCE_MATCH_PUNCTUATION | MATERIAL_TRANSLATION_DIFFERENCE | WORD_SEQUENCE_MATCH_ACCENTS |
| `foundations_our_father` | CUSTOMARY_AMEN_APPENDED | MATERIAL_TRADITIONAL_FRENCH_VARIANT | TRADITIONAL_LATIN_SPELLING_AND_AMEN |
| `foundations_act_of_faith` | WORD_SEQUENCE_MATCH_PUNCTUATION | WORD_SEQUENCE_MATCH_PUNCTUATION | WORD_SEQUENCE_MATCH_ACCENTS |
| `foundations_act_of_hope` | WORD_SEQUENCE_MATCH_PUNCTUATION | PUBLISHED_FRENCH_ANOMALY_MATCH | WORD_SEQUENCE_MATCH_ACCENTS |
| `foundations_act_of_love` | WORD_SEQUENCE_MATCH_PUNCTUATION | WORD_SEQUENCE_MATCH_HYPHENATION | WORD_SEQUENCE_MATCH_ACCENTS |
| `sacrament_act_of_contrition` | WORD_SEQUENCE_MATCH_CASE | CUSTOMARY_AMEN_APPENDED | WORD_SEQUENCE_MATCH_LIGATURE_ACCENTS |

### Material discrepancies rather than typographic noise

1. **Our Father:** French Compendium prints modern second-person address and a different temptation petition; the app deliberately retains the customary older French prayer. The app adds customary Amen to all its Pater Noster forms where the published standalone Compendium presentation stops before it. The app Latin `quotidianum` also differs from the Compendium spelling `cotidianum`. These differences do not license forced replacement.
2. **Eternal Rest:** published French Compendium asks that the light of God's face shine upon the departed, whereas the app uses the historical rendering of perpetual light. The original Latin `lux perpetua` and English support the app's traditional text.
3. **Act of Contrition:** the published French Compendium stops after `faire pénitence`, whereas the app includes a customary final `Amen`; English and Latin include a longer list of motives and near occasions. The three locale forms must not be represented as strict translations.
4. **Act of Faith and Act of Love:** the French edition contains legitimate shorter published forms; the app reproduces those traditions. The same prayer label does not imply identical paragraphs in all locales.
5. **Act of Hope:** the printed French Compendium ends with `Dans cette foi` even though the title and English/Latin endings refer to hope. The app preserves the official publication's anomalous wording; the existing one-off disclosure remains the sole warning, avoiding duplicates.
6. **Sign of the Cross, Glory Be, Hail Mary, Guardian Angel:** words and order correspond in their respective published forms, subject to punctuation, accents and verse layout. Record this as normalized word-sequence agreement only, not a fully certified republication.

### Production change — existing source drawer only

The canonical Prayer Library already offers a single collapsible *Source / provenance* drawer. This change supplies missing English/French notices for **Act of Faith, Act of Love and Act of Contrition** and adjusts **Grace After Meals** to explain correctly that the principal English witness now prints *benefits*, while the separate comparative Baltimore Manual prints *mercies*. It retains other notices and the separate Act of Hope anomaly disclosure. **No extra citation button or duplicate module is added.**

The [source-certification inventory](../data/pray/prayer-source-certification-inventory.v3.json) remains authoritative; the lightweight [Prayer collation notices](../src/pray/source-collation-notices.v1.js) now include 10 directly displayed material edition notices derived from that inventory. The [whole-form regression](../tests/prayer-compendium-whole-form.mjs) checks all 30 canonical language witnesses, 10 notice mappings and zero false certification.

### Pending before exact certification

A source review records whether phrases and ending structures correspond to an original. Exact verbatim certification additionally requires a stable edition, complete byte/typographic collation, a statement of allowable normalization, language-specific translation/provenance rights and editorial sign-off. Subsequent batches should address the remaining longer Compendium prayers and the genuinely unverified historical-source texts; do not treat this report as permission to unlock or publish a previously gated Bible edition.

The 1962 Mass reader, prayer recitation, liturgical date selection, language switch behaviour and user prayer text are unchanged.
