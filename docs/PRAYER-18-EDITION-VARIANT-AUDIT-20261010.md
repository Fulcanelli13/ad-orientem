# Prayer — 18 anchor-reviewed prayers: edition and locale divergence audit

**10 October 2026 · Source comparison; no Prayer text changes.**

Complements the merged [48-item provenance baseline](../data/pray/prayer-source-presentation-audit.v1.json) and the 30-record source-anchor triage in [PR #787](https://github.com/Fulcanelli13/ad-orientem/pull/787). Machine-readable register: [`data/pray/prayer-reviewed18-edition-variants.v1.json`](../data/pray/prayer-reviewed18-edition-variants.v1.json).

The previously anchor-reviewed **18/18** canonical Prayer records have been reclassified by exact source form, relevant EN/FR/LA divergence, evidence witness and next collation action. **0/18** are declared fully verbatim-certified. These were already inspected at the source-anchor level in [v3 certification inventory](../data/pray/prayer-source-certification-inventory.v3.json); this pass is a careful editorial comparison, not a full diplomatic transcript comparison.

### Original source anchors

- [Holy See English Compendium, Appendix A / Common Prayers](https://www.vatican.va/archive/compendium_ccc/documents/archive_2005_compendium-ccc_en.html)
- [Holy See French Compendium, common prayers and Latin appendices](https://www.vatican.va/archive/compendium_ccc/documents/archive_2005_compendium-ccc_fr.html)
- [Baltimore Manual (1889), Morning Prayers / Grace before and after meals](https://en.wikisource.org/wiki/A_Manual_of_Prayers_for_the_Use_of_the_Catholic_Laity/Morning_Prayers)
- [Blessed Sacrament Book, Prayers during the day](https://en.wikisource.org/wiki/Blessed_Sacrament_Book/Prayers_During_the_Day)
- [FSSP French Memorare, comparative traditional text](https://www.fssp.org/fr/consecration-de-la-fraternite-sacerdotale-saint-pierre-au-coeur-immacule-de-marie/)

## Matrix of 18 independent item decisions

| Canonical prayer | Source-form classification | Priority | Material editorial distinction / action |
|---|---|---|---|
| `foundations_sign_of_cross` | COMMON_FORM_WITH_ORTHOGRAPHY | LOW | Sign, simple doxology and wording are attested in Compendium; punctuation, capitalization, use of French hyphenation differ and full diplomatic collation is outstanding. Keep received text and normalisation policy; do not change wording. |
| `foundations_our_father` | TRADITIONAL_FRENCH_NOT_2005_FRENCH | HIGH | App French retains vous, traditional temptation petition and inherited older usage; French Compendium prayer uses a different address and petition. Latin and English retain their own witnesses. Preserve historical French, label it as such rather than attributing as exact French 2005. |
| `foundations_hail_mary` | COMMON_FORM_WITH_ORTHOGRAPHY | LOW | The Hail Mary is documented in the English/French Compendium and Latin appendix; app retains historical French wording and capitalization. Do not classify as trilingual verbatim until complete comparison. |
| `foundations_glory_be` | COMMON_FORM_WITH_ORTHOGRAPHY | LOW | Doxology's full components occur in witnesses, with ordinary capitalization and punctuation variations. Do not treat a typographic normalization as a theological correction. |
| `foundations_apostles_creed` | TRADITIONAL_FRENCH_NOT_2005_FRENCH | HIGH | French app follows older Saint-Esprit formula; 2005 French Compendium prints Esprit Saint for profession while still using Saint-Esprit within the historical narrative. Distinct locale witness. Keep traditional French as selected prayer edition; do not silently modernize. |
| `sacrament_act_of_contrition` | OFFICIAL_LOCALE_FORM_DIVERGENCE | HIGH | The French published prayer is materially shorter than Latin/English forms; these are attested local formulas, not a three-column parallel translation. Mark parallel editorial forms, not one trilingual exact quotation. |
| `foundations_act_of_faith` | OFFICIAL_LOCALE_FORM_DIVERGENCE | HIGH | English published Act expands Trinity and Christology; Latin/French print shorter formula. Their doctrinal meaning overlaps but texts are not literal translations. Preserve separately attributed official language forms. |
| `foundations_act_of_hope` | PUBLISHED_FRENCH_SOURCE_ANOMALY | HIGH | French Vatican Compendium prints Dans cette foi in the Acte d'espérance; English and Latin refer to hope. This is a witnessed published anomaly, not an app-typo assumption. Preserve exact attested French, keep existing explanation and linked witness; editorial question remains open. |
| `foundations_act_of_love` | OFFICIAL_LOCALE_FORM_DIVERGENCE | HIGH | Published French Acte de charité lacks Latin and English closing sentence, making three locales non-translation-equivalent. Keep all three official variants as separate witnesses. |
| `foundations_guardian_angel` | COMMON_FORM_WITH_ORTHOGRAPHY | LOW | English verse and Latin prose Angele Dei share the devotion but are not word-for-word paired; French follows independent rendered formula. Label version-specific English verse even if underlying invocation aligns. |
| `foundations_grace_before_meals` | HISTORICAL_EN_SOURCE_FORM | MEDIUM | Baltimore Manual Grace Before Meals supports familiar English prayer including short conclusion; French/Latin need separate edition or historical liturgical attestation. Retain citation with clear English historic witness qualification. |
| `foundations_grace_after_meals` | HISTORICAL_ALTERNATIVE_URL_PRIORITY | HIGH | App says benefits; cited Baltimore Manual first source says mercies. The separately linked Blessed Sacrament Book reproduces benefits; additional responsory sequence differs. Make Blessed Sacrament Book the main exact-form English witness; keep Baltimore only as a comparative edition and avoid duplicate links. |
| `marian_hail_holy_queen` | TRADITIONAL_FRENCH_NOT_2005_FRENCH | MEDIUM | French prayer uses traditional vous and older expressions, whereas the French Compendium prints tutoiement; EN/LA and added versicle response need independent formal segmentation. Keep French historical rendering and distinguish added ℣/℟ from bare Salve Regina antiphon. |
| `marian_memorare` | TRADITIONAL_FRENCH_COMPARATOR_VARIANT | MEDIUM | App French says recours, secours, intercession and mère du Verbe incarné; Compendium and FSSP have differing substitutions and abbreviated/variant construction. FSSP is comparable, not line-exact. Disclose FSSP as comparative variant only; preserve translation, inspect exact old French print before certifying. |
| `weekday_magnificat` | BIBLE_EDITION_LANGUAGE_VARIANT | HIGH | English app aligns substantially with USA Canticle version in Compendium; a separate UK version exists. French and Latin are distinct liturgical textual presentations; refrain/doxology distinction requires explicit identity. Assign precise USA/FR/Vulgate edition identities and Psalm/Bible reader pass-through; no blanket trilingual exactness. |
| `adoration_anima_christi` | ENGLISH_PROSE_VS_VERSE | HIGH | Compendium English is a metrical English adaptation, app English prose follows traditional Latin sense; French and Latin correspond more closely but textual endings not exact. Do not label English prose as a verbatim copy of Compendium English; identify translator/edition if possible. |
| `weekday_benedictus` | BIBLE_EDITION_LANGUAGE_VARIANT | HIGH | Compendium English canticle has an alternate liturgical rendering, app uses US-style text; French and Latin warrant separate source identity and terminal doxology ownership. Name selected scripture/office versions; do not silently swap an edition. |
| `foundations_eternal_rest` | FRENCH_OFFICIAL_VARIANT | MEDIUM | French Compendium uses light of thy face while app translates perpetual light. Latin and English support perpetual-light construction; French is not copied from 2005 witness. Mark app's traditional French translation rather than direct attribution to 2005 French appendix. |

## High-value corrections established for future source presentation

1. **French Acte d'espérance:** published French Compendium ends with *Dans cette foi*, while English and Latin refer to hope. Preserve this source-attested anomaly and its existing explanatory link until a separately witnessed correction exists.
2. **Anima Christi:** English poetry in the Holy See edition is *not* the app's English prose translation. Label the prose as a different translation, not a 2005 English transcript.
3. **Grace After Meals:** primary historical citation Baltimore prints *mercies*, app uses *benefits* attested in Blessed Sacrament Book. The correct English witness is already available as secondary context; promote it carefully as principal source only with deduplicated link controls and an explicit textual-variant explanation. No content text replacement.
4. **French common prayers:** traditional `vous`, `Saint-Esprit` and other older forms are not the same as their post-2005 French print equivalents. Preserve French tradition, and distinguish `HISTORICAL_TRANSLATION` from `2005_COMPENDIUM`.
5. **Act of Faith, Hope, Love, Contrition:** the official English, French and Latin appendices include **different-length, legitimate locale forms**, not mechanically parallel line-by-line translations. Do not force English paragraphs onto French phrases.
6. **Magnificat and Benedictus:** own Scripture/office edition identifiers, allow historical variants and check doxology placement. Neither should be silently changed by a Bible-selector setting.
7. **Memorare:** FSSP French prayer is comparative testimony only; still differs in several expressions from the app and should not be claimed a word-for-word edition source.

## Certification gate

Before changing a user-facing attribution or approving a formula as verbatim: identify exact original edition, link to the correct section, compare entire EN/FR/LA texts by segments including endings and responses, classify authorised local variations, obtain independent editorial sign-off, then test bilingual on phone, return-state and offline/error handling. Source-URL existence alone does not satisfy any of these gates.

**No R17, Calendar, prayer wording, reader layout, sources owner, ribbon, or publication-state change in this batch.**
