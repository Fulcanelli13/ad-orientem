# Prayer original-source anchor triage — 30-record batch

**10 October 2026.** The 30 `NOT_REVIEWED` canonical Prayer records were inspected by source target rather than treating legacy `VERIFIED_PRIMARY` labels as full text certification. Machine-readable record: [`data/pray/prayer-source-anchor-triage.v1.json`](../data/pray/prayer-source-anchor-triage.v1.json).

## Results and limitation

- **30/30** records individually classified. **27** external HTML source pages inspected, **2** printed Missal PDF references held for facsimile collation, and **1** Bible target could not be independently fetched.
- The label `TEXT_PRESENT_*` means a recognisable English or Latin passage appears on a source page; it does **not** certify the complete canonical EN, FR and LA texts or translations.
- **0** additional prayers declared fully certified. The existing v3 certification and Prayer reader text remain unchanged.
- Verified UX problem: the 2021 Saint Joseph Litany originally sent users first to the decree for seven added invocations, not to the full prayer. The existing edition-witness link is corrected to the USCCB full English text, with the Holy See decree retained as supplementary authority. This is a source-link fix only.

## Triage by item

| Prayer ID | Grade | Source evidence or limitation |
|---|---|---|
| `foundations_morning_offering` | TEXT_PRESENT_EN | Published English prayer is present; app English begins with the same wording. French and Latin remain uncollated. |
| `foundations_prayer_of_adoration` | EXTERNAL_REFERENCE_UNCHECKED | Bible URL could not be independently fetched; do not infer verbatim John 20:28 text or edition alignment from the link alone. |
| `mass_confiteor` | PRINTED_FACSIMILE_UNCHECKED | PDF requires page-by-page facsimile collation; reader link exists but witness not examined in this pass. |
| `marian_consecration_immaculate_heart` | TEXT_PRESENT_SECONDARY_EN | English composition is present; secondary devotional witness, not a multilingual approved liturgical form. |
| `adoration_spiritual_communion` | TEXT_PRESENT_EN | St Alphonsus prayer appears, followed by a distinct Merry del Val prayer; do not merge them. |
| `benediction_o_salutaris` | TEXT_PRESENT_HISTORICAL_VARIANT | Historical English hymn text is on cited page; inherited English punctuation/modernisation not yet line-collated. |
| `benediction_tantum_ergo` | TEXT_PRESENT_HISTORICAL_VARIANT | Historical stanza appears on cited page; compare every stanza and translation independently. |
| `benediction_divine_praises` | TEXT_PRESENT_EN | Complete English list is on source page; exact capitalization and FR/LA text still need comparison. |
| `adoration_litany_blessed_sacrament` | TEXT_PRESENT_HISTORICAL_VARIANT | Historical full litany section is present; refrain/response pattern and current indulgences not inferred. |
| `benediction_versicles` | TEXT_PRESENT_HISTORICAL_VARIANT | Versicle/response and traditional collect appear; English reader uses a revised translation. |
| `adoration_lord_i_am_not_worthy` | PRINTED_FACSIMILE_UNCHECKED | Edition-specific PDF witness not examined; liturgical adaptation must stay separate from Matthew 8:8. |
| `mass_devotion_leonine` | HISTORICAL_SEQUENCE_PRESENT_NOT_COLLATED | Historical Leonine sequence is present (including direction to recite Hail Mary thrice); complete prayer/body not compared line-for-line. |
| `sacrament_come_holy_spirit` | TEXT_PRESENT_FORM_VARIANT | USCCB has invocation and collect, but app adds ℣/℟ labels and uses historical English form. |
| `devotion_prayer_st_michael` | TEXT_PRESENT_EN_AND_LATIN | Full Latin and English St Michael prayer present as cited by Holy See; translational variations remain. |
| `devotion_memorare_st_joseph` | TEXT_PRESENT_FORM_VARIANT | English prayer present, but app says 'my sweet protector' where site says 'my great protector'. Do not mark verbatim. |
| `devotion_consecration_christ_king` | LATIN_FORM_PRESENT_EN_UNCOLLATED | Matching Latin universal-King prayer appears after other Christ prayers; page is Latin, not evidence of app English/French translation. |
| `church_prayer_for_pope` | RELATED_FORM_NOT_EXACT | Source has current pope named and a shorter sequence; app contains generic N. plus Tu es Petrus and historical wording. Related only, not exact transcription. |
| `devotion_st_anthony_lost_items` | TEXT_PRESENT_HISTORICAL_VARIANT | Full Latin with English translation of responsory is present; edition/attribution and translation comparison remain. |
| `sacred_heart_short_prayer` | PRIMARY_LATIN_FORM_PRESENT | Apostolic Penitentiary source gives the Latin Act of Reparation; EN/FR renderings remain uncollated. |
| `sacred_heart_aspiration_trust` | RELATED_FORM_NOT_EXACT | Source quotes 'Sacred Heart of Jesus, I place all my trust in you' but app has 'Most Sacred Heart of Jesus'; contextual witness rather than same exact wording. |
| `dead_de_profundis` | TEXT_PRESENT_HISTORICAL_VARIANT | Traditional Psalm 129 appears; app and historical English vary in particulars, with 129/130 numbering distinction. |
| `devotion_litany_st_joseph` | TEXT_PRESENT_EN_REQUIRES_LANGUAGE_COLLATION | USCCB gives complete 2021 English litany and explains its approved translation; 2021 Holy See decree is supplementary original authority. |
| `devotion_ad_te_beate_ioseph` | TEXT_PRESENT_EN | Historic English prayer is appended to encyclical; compare app FR/LA and punctuation separately. |
| `traditional_veni_sancte_sequence` | TEXT_PRESENT_HISTORICAL_VARIANT | Latin sequence and historical Caswall English present; original Wikisource page title has transcription typo 'piritus'. French remains uncollated. |
| `dead_fidelium_deus` | TEXT_PRESENT_HISTORICAL_VARIANT | Traditional collect appears but app English changes wording ('grant' rather than 'give'); do not label verbatim. |
| `dead_eternal_rest_singular` | TEXT_PRESENT_FORM_VARIANT | Singular prayer appears with selectable him/her inflections; app uses combined 'him or her' as editorial rendering. |
| `sub_tuum` | TEXT_PRESENT_EN_AND_LATIN | Original Latin invocation and English translation on page; app pronouns/wording are a historical-style alternative. |
| `benediction_adoremus_ps116` | WORK_REFERENCE_INCOMPLETE | Book root has Adoremus title/short invocation, not the full Psalm 116/117 sequence shown in app; requires exact source subsection. |
| `litany_loreto_1962` | OLDER_COMPARATIVE_NOT_1962 | Historical form is a comparator and predates later Marian invocations; this is not an exact 1962-edition witness. |
| `litany_loreto_current` | TEXT_PRESENT_CURRENT_FORM | Current form contains Mother of Mercy, Mother of Hope and Solace of Migrants; avoid relabelling as 1962. |

## Highest-priority follow-ups

1. `church_prayer_for_pope`: related official Vatican News text differs in content and variables; do not advertise verbatim correspondence.
2. `benediction_adoremus_ps116`: Lasance root-level page does not supply the entire cited Psalm/Benediction composite.
3. `litany_loreto_1962`: old comparative witness is not a printed 1962 edition; do not confuse it with the separately sourced current form.
4. `devotion_memorare_st_joseph` and `sacred_heart_aspiration_trust`: apparent English phrase variants need precise source wording.
5. `mass_confiteor` and `adoration_lord_i_am_not_worthy`: facsimile collation is pending; do not infer verification from the PDF hyperlink.
6. Finish full EN/FR/LA edition-specific line collation for this 30-record batch, then reconcile the previously 18 anchor-reviewed prayer records.

## Operational boundary

Preserve the canonical 48-prayer data, source accordion, R17, Calendar, Prayer navigation, language controls, and original approval gates. No duplicate source buttons. The sole runtime-adjacent change is the exact existing Saint Joseph source URL selected by `prayEditionWitness`.
