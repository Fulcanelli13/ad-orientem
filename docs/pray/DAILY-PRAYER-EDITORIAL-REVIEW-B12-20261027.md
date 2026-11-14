# B12 — Morning and Evening Prayer: source-backed editorial decisions

**27 October 2026** · [Draft research PR #1785](https://github.com/Fulcanelli13/ad-orientem/pull/1785) · **NOT APPROVED OR MERGED**

## The last unresolved English textual opening

The Baltimore *Manual of Prayers* (New York, 1888), under **Another Form of Evening Prayers**, prints the following complete vocal petition on **printed page 82** ([digitized page 94](https://en.wikisource.org/wiki/Page:Manualofprayersf00cath.djvu/94)):

> O my God, sovereign Judge of men, who desirest not the death of a sinner, but that he should be converted and saved, enlighten my mind, that I may know the sins which I have this day committed in thought, word, or deed, and give me the grace of true contrition.

The adjacent texts `Ask of God light to discover the sins committed this day.` and `Here examine your Conscience; then say:` are **instructions**, not voiced parts of this prayer. They frame the prayer, then a silent or guided examen, then a **separate** Act of Contrition. The complete boundary has been checked against Wikisource's proofread historical page transcription and another digitized edition excerpt. **Direct original-page-image inspection has not succeeded in this pass**, so this is not an additional scan-certified item.

Registry: `data/pray/daily-prayer-evening-light-boundary.b12.json`; source occurrence `AO.DAILY.B01.038`. The English Complete Evening proposal has been updated to reference the full witness instead of the bare source occurrence.

## Proposed recitation profiles

These are **Ad Orientem composed routines**, not historically printed complete sequences attributed to Baltimore, Lasance or Moran. **Short = fewer complete prayers**, not truncated prayer wording. Complementary bedtime antiphons and collects can be combined. These choices are provisional and require user editorial selection.

| Profile | Recitation steps in current research proposal | Blocking source issue |
|---|---:|---|
| EN morning Short | 5 (3 required) | Common canonical text provenance/reuse/editorial |
| EN morning Complete | 9 (6 required) | Common canonical text provenance/reuse/editorial |
| EN evening Short | 5 (5 required) | Common canonical text provenance/reuse/editorial |
| EN evening Complete | 11 (7 required) | Baltimore examination-light image; reuse/editorial |
| FR morning Court | 2 (2 required) | Common canonical text provenance/reuse/editorial |
| FR morning Complet | 7 (2 required) | Common canonical text provenance/reuse/editorial |
| FR evening Court | 6 (6 required) | Common canonical text provenance/reuse/editorial |
| FR evening Complet | 11 (6 required) | Common canonical text provenance/reuse/editorial |

The step counts include optional candidates in each plan; they are **not** live card counts and should not replace the existing Morning 11/Evening 13 guided card architecture without a migration plan.

## Stage-by-stage choices for editorial approval

**Recommended** below means **research recommendation**, never a selection already authorized by the user. Source forms retain exact historical words in the referenced data files.

| When | Stage | Suggested original | Other documented choices | Decision rationale |
|---|---|---|---|---|
| morning EN | Adoration and Thanksgiving | [LAS1911: Almighty and eternal God, I adore Thee, and I thank Thee for all…](https://en.wikisource.org/wiki/Page:Withgodbookofpra00las.djvu/147) | [MORAN1883](https://en.wikisource.org/wiki/Page:The_Catholic_prayer_book.djvu/20) | Lasance is one complete act serving two purposes. |
| morning EN | Morning Offering | [BBG1925: O Jesus, through the Immaculate Heart of Mary, I offer Thee my prayers,…](https://en.wikisource.org/wiki/Page:Blessedbegodcomp00call.pdf/48) | [LAS1911](https://en.wikisource.org/wiki/Page:Withgodbookofpra00las.djvu/137), [LAS1911](https://en.wikisource.org/wiki/Page:Withgodbookofpra00las.djvu/137), [POCKET1899](https://en.wikisource.org/wiki/Page:TheCatholicsPocketPrayerBook.djvu/17), [MORAN1883](https://en.wikisource.org/wiki/Page:The_Catholic_prayer_book.djvu/20) | Different complete prayers and intentions; Moran historical indulgence wording requires context. |
| morning EN | Faith | [LAS1911: O my God, I believe in Thee, because Thou art Truth itself, and…](https://en.wikisource.org/wiki/Page:Withgodbookofpra00las.djvu/147) | [POCKET1899](https://en.wikisource.org/wiki/Page:TheCatholicsPocketPrayerBook.djvu/18) | Pocket is a genuinely shorter complete formulation. |
| morning EN | Hope and Charity | [LAS1911: O my God, I hope in Thee, because Thou art omnipotent, most merciful,…](https://en.wikisource.org/wiki/Page:Withgodbookofpra00las.djvu/147) | [LAS1911](https://en.wikisource.org/wiki/Page:Withgodbookofpra00las.djvu/148) | Two separate recitations in Complete; optional in Short. |
| morning EN | Petition and Resolution | [MORAN1883: O my Jesus! bear me in thy hands this day. Mary, holy Virgin!…](https://en.wikisource.org/wiki/Page:The_Catholic_prayer_book.djvu/20) | [LAS1911](https://en.wikisource.org/wiki/Page:Withgodbookofpra00las.djvu/148), [LAS1911](https://en.wikisource.org/wiki/Page:Withgodbookofpra00las.djvu/148) | Complementary rather than always competing. |
| morning FR | Thanksgiving and Offering | [FRENCH1905: Mon Dieu, je Vous remercie très humblement de toutes les grâces que Vous…](https://fr.wikisource.org/wiki/Page:Cat%C3%A9chisme_du_saint_concile_de_Trente,_1905.djvu/38) | — | French historical combined text: display once. |
| morning FR | Faith Hope and Charity | [FRENCH1905: Mon Dieu, je crois fermement toutes les vérités que Vous avez révélées et…](https://fr.wikisource.org/wiki/Page:Cat%C3%A9chisme_du_saint_concile_de_Trente,_1905.djvu/38) | [FRENCH1905](https://fr.wikisource.org/wiki/Page:Cat%C3%A9chisme_du_saint_concile_de_Trente,_1905.djvu/38), [FRENCH1905](https://fr.wikisource.org/wiki/Page:Cat%C3%A9chisme_du_saint_concile_de_Trente,_1905.djvu/38) | Three original French acts, in order. |
| evening EN | Presence and Thanksgiving | [LAS1911: Almighty and eternal God, I adore Thee, and I thank Thee for all…](https://en.wikisource.org/wiki/Page:Withgodbookofpra00las.djvu/151) | [BBG1925](https://en.wikisource.org/wiki/Page:Blessedbegodcomp00call.pdf/58), [BBG1925](https://en.wikisource.org/wiki/Page:Blessedbegodcomp00call.pdf/59) | Short uses one Lasance composite; Complete may use BBG Presence and Thanksgiving separately. |
| evening EN | Light before Examination | [BAL1888: O my God, sovereign Judge of men, who desirest not the death of…](https://en.wikisource.org/wiki/Page:Manualofprayersf00cath.djvu/94) | — | Complete independent prayer after thanksgiving; original page image still pending. |
| evening EN | Contrition | [LAS1911: O my God, I am truly sorry for having sinned, because Thou art…](https://en.wikisource.org/wiki/Page:Withgodbookofpra00las.djvu/152) | [MORAN1883](https://en.wikisource.org/wiki/Page:The_Catholic_prayer_book.djvu/32) | Concise full act vs complete lengthy 1883 penitential act. |
| evening EN | Departed | [MORAN1883: O God, the Creator and Redeemer of all the faithful, grant to the…](https://en.wikisource.org/wiki/Page:The_Catholic_prayer_book.djvu/33) | — | Traditional collect, not Psalm 129. |
| evening EN | Night protection | [MORAN1883: Visit, we beseech thee, O Lord, this habitation, and repel from it all…](https://en.wikisource.org/wiki/Page:The_Catholic_prayer_book.djvu/34) | [MORAN1883](https://en.wikisource.org/wiki/Page:The_Catholic_prayer_book.djvu/34), [LAS1911](https://en.wikisource.org/wiki/Page:Withgodbookofpra00las.djvu/155) | Antiphon, collect and St Alphonsus night prayer can coexist. |
| evening FR | Thanksgiving, examination and contrition | [FRENCH1905: Quelles actions de grâces Vous rendrai-je, ô mon Dieu, pour tous les biens…](https://fr.wikisource.org/wiki/Page:Cat%C3%A9chisme_du_saint_concile_de_Trente,_1905.djvu/42) | [FRENCH1905](https://fr.wikisource.org/wiki/Page:Cat%C3%A9chisme_du_saint_concile_de_Trente,_1905.djvu/42), [FRENCH1905](https://fr.wikisource.org/wiki/Page:Cat%C3%A9chisme_du_saint_concile_de_Trente,_1905.djvu/43) | Three separate historical prayers with an intervening guided examination. |
| evening FR | Night protection | [FRENCH1905: Bénissez, ô mon Dieu, le repos que je vais prendre pour réparer mes…](https://fr.wikisource.org/wiki/Page:Cat%C3%A9chisme_du_saint_concile_de_Trente,_1905.djvu/44) | [FRENCH1905](https://fr.wikisource.org/wiki/Page:Cat%C3%A9chisme_du_saint_concile_de_Trente,_1905.djvu/44) | Both prayers can be selected. |

## Specific acceptance decisions to obtain, stage by stage

1. **Morning Offering English:** suggested *Blessed Be God* (1925) through the Immaculate Heart. Distinct choices are Lasance's two 1911 Apostleship formulas, Pocket 1899 Eucharistic Sacred Heart offering, and Moran 1883 Good Intention (which includes a historical indulgence intention and should not be the automatic default). Source images have been checked for all these forms.
2. **Morning Faith/Hope/Charity English:** Lasance 1911 complete acts proposed in sequence. Pocket 1899 has a separate concise Faith form; it is a whole prayer, not a truncated Lasance text.
3. **Evening English Short:** one Lasance adoration/thanksgiving/light prayer, followed by distinct guided examination, short Lasance contrition and *Visita quaesumus* collect. Do not repeat the original Lasance prayer once for each of its three functions.
4. **Evening English Complete:** Blessed Be God 1925 distinct Presence and Thanksgiving prayers; Baltimore separate petition for examination light (proofread page text; image outstanding); guided examination; Lasance Contrition, with optional long Moran 1883 form; prayers for departed and bedtime protection.
5. **French:** original 1905 historical Morning Thanksgiving/Offering is a **single compound prayer**, unlike the distinct 1925 English Apostleship text. The 1905 Evening prayers have independently printed thanksgiving, examination light, contrition, a purpose of amendment, intercessions, bedtime protection and *Visita quaesumus*. Do not invent cross-language word-for-word equivalence.
6. **Historical preset fidelity:** if a user selects *the actual Lasance 1911 sequence*, it must reproduce the one-book original order, not our independently assembled Ad Orientem mix.

## Gate and ownership

- Historical prayer **identity**: stable shared prayer family.
- Exact historical **text**: source edition, page and language specific.
- Morning/Evening **sequence**: existing PRAY reader, not a second competing reader.
- Optional **time**: separate silent stopwatch/gentle target/meditation session, no clock-triggered prayer advancement or spiritual score.
- User **privacy**: do not store sensitive examen responses, sins or intimate notes by default.

**Current audit counts:** 42 original-print-image-checked complete source bodies (27 EN/15 FR); one additional complete body from historical proofread transcription (B12), print image pending; 7 historical English books; 176 total raw source occurrences including shared lines and rubrics. **Neither 42 nor 43 is a count of user-approved tabs.**

**Remaining blockers:** direct image validation of Baltimore p.82, source and reuse rights across actual deployment jurisdictions, editorial choice approval, and integration tests with the existing prayer runtime. **Do not merge PR #1785 directly into production without these steps.**
