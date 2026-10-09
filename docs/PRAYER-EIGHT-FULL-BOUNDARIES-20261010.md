# Eight longer Prayer texts — full boundary and edition audit

**10 October 2026 | Source-level text boundaries; no recitation text changed**

This is the second batch after [PR #797's ten complete Compendium forms](PRAYER-10-COMPENDIUM-WHOLE-FORM-20261010.md). It covers all remaining eight of the previously anchor-reviewed **18 canonical Prayer records**: the Apostles' Creed, before/after meal prayers, Salve Regina, Memorare, Magnificat, Benedictus and Anima Christi.

The new [24-record EN/FR/Latin evidence register](../data/pray/prayer-eight-full-boundaries.v1.json) documents the beginning and end of each prayer, cited original or comparison edition, material wording variants, and any appended doxology, versicle, response or intervening material. It does not duplicate copyrighted original books in the app or certify translations verbatim.

## Original-source reading list

- [2005 English Compendium](https://www.vatican.va/archive/compendium_ccc/documents/archive_2005_compendium-ccc_en.html)
- [2005 French Compendium](https://www.vatican.va/archive/compendium_ccc/documents/archive_2005_compendium-ccc_fr.html)
- [Baltimore Manual of Prayers: Morning Prayers](https://en.wikisource.org/wiki/A_Manual_of_Prayers_for_the_Use_of_the_Catholic_Laity/Morning_Prayers)
- [Blessed Sacrament Book: Prayers During the Day](https://en.wikisource.org/wiki/Blessed_Sacrament_Book/Prayers_During_the_Day)
- [Fraternity of St Peter, French Memorare](https://www.fssp.org/fr/consecration-de-la-fraternite-sacerdotale-saint-pierre-au-coeur-immacule-de-marie/)
- [Secondary French-and-Latin grace comparison](https://hozana.org/priere/benediction/avant-apres-repas)

## Complete 8 × 3 source/edition matrix

| Prayer | English relation | French relation | Latin relation | Boundary assessed |
|---|---|---|---|---|
| `foundations_apostles_creed` | `CLOSELY_RELATED_EDITION_WITH_PHRASING_VARIANTS` | `TRADITIONAL_FRENCH_CREED_VS_2005` | `LATIN_CREED_PRINTED_WITH_ORTHOGRAPHY_VARIANTS` | Standalone Apostles' Creed, with its complete closing Amen/Thus-so-be-it |
| `foundations_grace_before_meals` | `SOURCE_FORM_ATTESTED_EN_WITH_VERSICLE_FORMAT` | `FRENCH_TRADITIONAL_FORM_SECONDARY_COMPARATOR` | `LATIN_TRADITIONAL_FORM_SECONDARY_COMPARATOR` | Meal blessing and one response Amen; later graces are separate |
| `foundations_grace_after_meals` | `HISTORICAL_BENEFITS_FORM_WITH_DELIMITED_OMISSIONS` | `FRENCH_TRADITIONAL_FORM_SECONDARY_COMPARATOR` | `LATIN_FORM_SECONDARY_COMPARATOR` | Thanksgiving and souls-of-faithful-departed response, omitting intervening Vouchsafe/Let us bless |
| `marian_hail_holy_queen` | `ANTIPHON_MATCH_UK_WITH_APPENDED_VERSICLES` | `TRADITIONAL_FRENCH_ANTIPHON_WITH_APPENDED_VERSICLES` | `LATIN_ANTIPHON_WITH_APPENDED_VERSICLES` | Salve Regina antiphon followed in app by Ora pro nobis and its response |
| `marian_memorare` | `ENGLISH_FORM_NEAR_MATCH_WORDING` | `FRENCH_TRADITIONAL_VARIANT_NOT_VERBATIM` | `LATIN_SOURCE_FORM_NORMALIZED` | Entire Memorare, no attached novena or consecration |
| `weekday_magnificat` | `ENGLISH_USA_CANTICLE_WITH_DOXOLOGY` | `FRENCH_OFFICE_TEXT_AND_MISSING_DOXOLOGY` | `LATIN_CANTICLE_ENDS_BEFORE_PRINTED_DOXOLOGY` | Luke 1:46–55, plus separate office doxology only when contextually appended |
| `weekday_benedictus` | `ENGLISH_USA_CANTICLE_WITH_DOXOLOGY` | `FRENCH_OFFICE_TEXT_AND_MISSING_DISTINCT_DOXOLOGY` | `LATIN_CANTICLE_ENDS_BEFORE_PRINTED_DOXOLOGY` | Luke 1:68–79, plus separate office doxology only when contextually appended |
| `adoration_anima_christi` | `ENGLISH_PROSE_NOT_COMPENDIUM_METRICAL_TEXT` | `FRENCH_APP_PROSE_NO_FRENCH_PRINTED_FORM_IN_COMPENDIUM` | `LATIN_PRAYER_FORM_NORMALIZED` | Complete Anima Christi, not a Communion formula or an interpolated psalm |

## Decisions with direct impact on content provenance

**Apostles' Creed.** The English app and 2005 English printed Creed differ in word order and expressions such as *is seated / sits*; the French app ends *Ainsi soit-il* and uses *Saint-Esprit*, whereas the French printed profession ends *Amen* and says *Esprit Saint*. Both the original text and the received traditional wording have to be named. The Latin original is available in the English Compendium, with editorial spelling and punctuation differences; no prayer rewrite is authorised.

**Grace Before Meals.** The Baltimore source separates the response *Amen* from the prayer as `R.`; the app concatenates it. A later historical source also gives the Latin formula, but no original French translation matching the app has been certified. The extra nearby prayers in the book do not belong to the Grace Before Meals object.

**Grace After Meals.** The Blessed Sacrament Book prints *benefits* (not the Baltimore edition's *mercies*). But its printed sequence continues with *Vouchsafe, O Lord* and *Let us bless the Lord* **before** the petition for souls of the faithful departed. The app includes the thanksgiving and souls petition without those intervening sections. Treat as an abridged composite, not as line-for-line reproduction of a contiguous chapter. The separately recorded French and Latin comparisons are **secondary**, not original-language certification.

**Salve Regina.** The app includes the Marian antiphon and appends a `Pray for us / Ora pro nobis` exchange. The Compendium supplies the antiphon, not the app's entire appended structure. French traditional `vous` also differs from the French printed `tu`. The source disclosure now distinguishes the two prayer boundaries; future work should identify the traditional post-antiphon source.

**Memorare.** The English and Latin formulas correspond substantively to published Compendium texts; the French app retains an older translation with `Verbe incarné`, longer intercession phrases and different verbs. The FSSP printed French text is a useful comparator, not exact duplication. The **Latin app says `Mater Verbi`**, in agreement with the source; do not project the French `incarné` addition back into the Latin corpus.

**Magnificat.** The English app is substantially the Compendium's USA canticle form **with** a concluding doxology. Its French differs in several phrases from the published 2005 French form and ends **without** that edition's doxology. The Latin also stops at the biblical verse. The compendium supplies a doxology, but is not by itself an original **1962 Roman Breviary** witness. This remains a separate Scripture-versus-office-text ownership decision under [Issue #799](https://github.com/Fulcanelli13/ad-orientem/issues/799).

**Benedictus.** The English app similarly includes the USA office doxology; French and Latin end after Luke 1:79. Crucially, the French Compendium's appended doxology invokes the God who is, who was and who comes, and is **not identical to the ordinary `Gloria Patri` text**. Do not simply copy the English ending into French or Latin. [Issue #799](https://github.com/Fulcanelli13/ad-orientem/issues/799) remains open until original 1962 rubric and language provenance is independently collated.

**Anima Christi.** The English Compendium publishes a metrical English poem; the app uses prose. The French Compendium source presents the Latin prayer, not an exact French prose translation. The Latin original corresponds after routine graphic accents and typography. The English/French translations may not be labelled verbatim copies of those printed prayer sections.

## Production outcome and hard gates

- The existing **Source / provenance** accordion now has **12** source notices: expanded traditional Creed, Grace After Meals and Salve Regina disclosures, and two new canticle doxology/edition cautions.
- The 64-entry prayer-and-novena provenance owner remains `data/pray/prayer-source-certification-inventory.v3.json`. The 12 lightweight source notices are generated companions, **not** a second text corpus.
- No prayer recitation words, Mass reader, Scripture source availability, Calendar, icon, font, card, title or route changed.
- The 24 evidence links are to original works **or qualified comparison texts**, not 24 exact matching editions.
- Independent original **1962** Breviary verification, textual permissions, French source authorship and full diplomatic collation remain unapproved. **Zero** prayers newly certified verbatim.

Next evidence gate: obtain original 1962 Breviary canticle rubrics and isolate doxology as a context-specific liturgical appendix where justified, verify the French domestic graces against original French printed Catholic prayer books, and audit the exact historical source of the Salve Regina versicle/response before changing canonical bodies.

## Calendar visual gate reconciliation

The earlier capture failure for this Prayer-only PR was traced to an asynchronous Calendar Day repaint collapsing the currently expanded discipline disclosure (Issue [#803](https://github.com/Fulcanelli13/ad-orientem/issues/803)). The independent Calendar UI fix in [PR #805](https://github.com/Fulcanelli13/ad-orientem/pull/805) was merged into `main` after contract, year, directory, visual capture and phone tests passed. This Prayer PR does **not** duplicate that Calendar fix; its CI must be rerun against the corrected baseline before merge.
