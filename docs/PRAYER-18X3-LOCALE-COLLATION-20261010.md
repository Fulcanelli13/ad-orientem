# Canonical Prayer locale collation — 18 × 3 source relationships

**10 October 2026 · 18 prayers × 3 languages = 54 evidence cells.**

## Purpose and evidence level

The original 48-prayer corpus had only generic source/translation claims. The previously anchor-reviewed 18 prayers now have one explicit EN, FR and Latin comparison outcome each in [`data/pray/prayer-locale-collation-evidence.v1.json`](../data/pray/prayer-locale-collation-evidence.v1.json). This is **not** a blanket verbatim certification: it identifies the source's published form and the relation to the actual app version, including noncorresponding language forms. The canonical text remains intact.

The core originals were inspected directly in the [Holy See English Compendium](https://www.vatican.va/archive/compendium_ccc/documents/archive_2005_compendium-ccc_en.html) and [French Compendium](https://www.vatican.va/archive/compendium_ccc/documents/archive_2005_compendium-ccc_fr.html). For Grace Before Meals and Grace After Meals, the distinct original witnesses remain the [Baltimore Manual](https://en.wikisource.org/wiki/A_Manual_of_Prayers_for_the_Use_of_the_Catholic_Laity/Morning_Prayers) and [Blessed Sacrament Book](https://en.wikisource.org/wiki/Blessed_Sacrament_Book/Prayers_During_the_Day), respectively. Line numbers in the evidence are **web extraction coordinates**, not permanent canonical print pages or exact HTML deep-link targets.

## Results

| Audit measurement | Value |
|---|---:|
| Canonical prayer records reconciled | 18 |
| Separate EN/FR/LA comparisons classified | 54 |
| Cells with a concrete cited original or comparator | 50 |
| No independently identified original for that language | 4 |
| Fully verbatim-certified prayers | **0** |

`NORMALIZED_FORM` means the published witness supports the same formula subject to punctuation, capitals or accent modernisation. It **does not** assert a full diplomatic transcription or permission to republish an entire translation. `BIBLE_EDITION_SPECIFIC` and `SOURCE_NOT_ESTABLISHED` are publication holds, not resolved source identities.

## All 18 prayer decisions

| Prayer | English | French | Latin | Material original/form finding |
|---|---|---|---|---|
| `foundations_sign_of_cross` | NORMALIZED_FORM | NORMALIZED_FORM | NORMALIZED_FORM | EN/FR/LA prayers have the same essential formula; accents, commas and capitals differ. |
| `foundations_our_father` | ENDING_FORMAT_VARIANT | TRADITIONAL_FRENCH_NOT_2005 | ENDING_FORMAT_VARIANT | The 2005 French source uses tu and ne nous soumets pas; app uses vous and ne nous laissez pas succomber. Source EN/LA does not end with the app's customary Amen. |
| `foundations_hail_mary` | NORMALIZED_FORM | NORMALIZED_FORM | NORMALIZED_FORM | The received formula is present in each language; editorial punctuation/case differs. |
| `foundations_glory_be` | NORMALIZED_FORM | NORMALIZED_FORM | NORMALIZED_FORM | Doxology corresponds in EN, FR and LA after typography differences. |
| `foundations_apostles_creed` | NORMALIZED_FORM | TRADITIONAL_FRENCH_NOT_2005 | SOURCE_SECTION_PENDING | The creed appears in the Compendium; app French uses Saint-Esprit rather than its later French profession Esprit Saint. Distinct Latin edition anchor awaits exact section review. |
| `sacrament_act_of_contrition` | NORMALIZED_FORM | PUBLISHED_LOCALE_ENDING_DIFF | NORMALIZED_FORM | FR app concludes with customary Amen while the French 2005 published form ends after faire pénitence. English/Latin forms are structurally longer than FR. |
| `foundations_act_of_faith` | NORMALIZED_FORM | NORMALIZED_FORM | NORMALIZED_FORM | Compendium English expands Christology, while FR and LA print shorter legitimate prayers; not three parallel translations. |
| `foundations_act_of_hope` | NORMALIZED_FORM | PUBLISHED_FRENCH_ANOMALY | NORMALIZED_FORM | French app reproduces Dans cette foi published under Acte d'espérance, while EN says In this hope and LA says In hac spe. Do not silently emend. |
| `foundations_act_of_love` | NORMALIZED_FORM | NORMALIZED_FORM | NORMALIZED_FORM | Compendium French form ends earlier than English/Latin, as distinct officially published locale forms. |
| `foundations_guardian_angel` | NORMALIZED_FORM | NORMALIZED_FORM | NORMALIZED_FORM | English is metrical verse; French and Latin are different accepted language forms. |
| `foundations_grace_before_meals` | HISTORICAL_ENGLISH_FORM | SOURCE_NOT_ESTABLISHED | SOURCE_NOT_ESTABLISHED | Baltimore prayer-book confirms English wording; original FR/LA sources are still to be compared. |
| `foundations_grace_after_meals` | HISTORICAL_BENEFITS_FORM | SOURCE_NOT_ESTABLISHED | SOURCE_NOT_ESTABLISHED | Blessed Sacrament Book supports benefits, Baltimore Manual has mercies. No certified printed FR/LA pairing. |
| `marian_hail_holy_queen` | NORMALIZED_FORM_WITH_APPENDIX | TRADITIONAL_FRENCH_NOT_2005 | NORMALIZED_FORM_WITH_APPENDIX | App adds versicle and response to Salve Regina; the French antiphon uses traditional vous, unlike the Compendium. |
| `marian_memorare` | NORMALIZED_FORM | TRADITIONAL_FRENCH_COMPARATIVE | LATIN_WORDING_VARIANT | Compendium Latin uses Mater Verbi, whereas app uses Mater Verbi incarnati; FSSP French is a comparator but not exact. |
| `weekday_magnificat` | BIBLE_EDITION_SPECIFIC | BIBLE_EDITION_SPECIFIC | BIBLE_EDITION_SPECIFIC | UK and USA English canticles and distinct French/Latin liturgical texts demand edition and doxology ownership. |
| `adoration_anima_christi` | ENGLISH_PROSE_NOT_PRINTED_POEM | FRENCH_EDITION_VARIANT | NORMALIZED_FORM | The printed English 2005 Compendium is rhymed; the app prose is a separate translation. Latin agrees in core formula. |
| `weekday_benedictus` | BIBLE_EDITION_SPECIFIC | BIBLE_EDITION_SPECIFIC | BIBLE_EDITION_SPECIFIC | UK/US canticle settings differ; verify specific Scripture or office version, not blanket 3-language identity. |
| `foundations_eternal_rest` | NORMALIZED_FORM | FRENCH_TRANSLATION_NOT_2005 | NORMALIZED_FORM | App prints French lumière éternelle whereas Compendium French prints lumière de ta face; Latin and English use perpetual light. |

## Existing app source-control correction

The same **Source / provenance** accordion now opens the published **French** Compendium when the interface is French for the 16 canonical prayers whose previously recorded external witness was the Compendium. In English UI it retains the English Compendium witness, which also includes the source Latin in relevant cases.

This is a language-target selection rather than a new button. The French link says **Consulter l’édition française de référence**, not that the traditional French wording is a verbatim transcription. For explicitly different French traditional forms (Notre Père, Creed, Salve Regina, Memorare, Requiem, etc.), the existing variant notices stay in place. The separately authored historical prayers, editor-specific Missal editions, Rosary, Stations and Scripture reader are unaffected. The canonical source register continues to track the original source URL independently of display language.

## Next approval gates

- Compare the entire wording, endings, versicles and doxologies against a specific published printed edition for each `NORMALIZED_FORM` and confirm what normalization may legally or editorially be applied.
- Find appropriate independent original print witnesses for the four unsupported historical-prayer French/Latin cells.
- Investigate the long-text editions of Magnificat and Benedictus, including their English UK/US differences, Latin Vulgate and French lectionary/liturgical identities.
- Keep English poetic Anima Christi, the Act of Hope printed French anomaly, traditional French Lord's Prayer, and distinct local Acts of Faith/Love/Contrition accurately differentiated.
- Only then issue a language-specific verbatim/rights certificate after human editorial sign-off. Tests here cover recorded provenance, not authoritative publication approval.

**Out of scope:** no prayer-body text editing, no new source card, no glossary definition duplication, no Bible full-text edition unlock and no R17 reader changes.
