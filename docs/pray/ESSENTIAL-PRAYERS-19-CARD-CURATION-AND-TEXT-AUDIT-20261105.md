# Ad Orientem Prayer — Essential Holy Cards V2
Date: 5 November 2026
Status: **draft review branch; no alteration to prayer bodies or source-witness metadata**

## Scope and separation of ownership

The Essential Prayers *collection* is curated from 32 to **19 entries**: 16 core devotional prayers, followed by three optional everyday prayers. The 32 original F01 Holy Card reader IDs remain valid, and all 48 canonical Prayer texts in `src/pray/canonical-data.js` remain untouched. The 13 entries removed from the *collection* are not rejected, deleted, rewritten or prevented from opening via other routes.

Content/selection first. Later work will independently implement **tap artwork/front to turn card; tap Latin prayer text to replace with the selected EN/FR vernacular; tap again to restore Latin**, without losing scroll position, actual source languages, or touch/keyboard accessibility. No such interaction is claimed by this PR.

## 16 core cards, ordered

| ID | English heading | French heading |
| --- | --- | --- |
| foundations_sign_of_cross | Sign of the Cross | Signe de la Croix |
| foundations_our_father | Our Father | Notre Père |
| foundations_hail_mary | Hail Mary | Je vous salue Marie |
| foundations_glory_be | Glory Be | Gloire au Père |
| foundations_apostles_creed | Apostles' Creed | Symbole des Apôtres |
| sacrament_act_of_contrition | Act of Contrition | Acte de contrition |
| foundations_act_of_faith | Act of Faith | Acte de foi |
| foundations_act_of_hope | Act of Hope | Acte d'espérance |
| foundations_act_of_love | **Act of Charity** | Acte de charité |
| foundations_guardian_angel | Guardian Angel Prayer | Prière à l'ange gardien |
| foundations_prayer_of_adoration | My Lord and My God | **Mon Seigneur et mon Dieu** |
| marian_memorare | **Memorare** | Souvenez-vous |
| sacrament_come_holy_spirit | Come, Holy Spirit | Venez, Esprit-Saint |
| devotion_prayer_st_michael | Prayer to Saint Michael | Prière à saint Michel Archange |
| sacred_heart_aspiration_trust | **Aspiration to the Sacred Heart** | Aspiration au Sacré-Cœur |
| foundations_eternal_rest | **Eternal Rest** | Repos éternel |

## Three daily prayers (same collection, separate group)

| ID | English heading | French heading |
| --- | --- | --- |
| foundations_grace_before_meals | Grace Before Meals | Bénédicité |
| foundations_grace_after_meals | **Thanksgiving After Meals** | Grâces après le repas |
| foundations_morning_offering | Morning Offering | Offrande du matin |

## The 13 displaced shelf entries

| ID | Appropriate permanent owner |
| --- | --- |
| mass_confiteor | Mass / Confiteor |
| marian_consecration_immaculate_heart | Marian consecrations; historical English-only source |
| adoration_anima_christi | Eucharistic / Anima Christi |
| adoration_spiritual_communion | Eucharistic / Spiritual Communion |
| benediction_versicles | Benediction |
| adoration_lord_i_am_not_worthy | Mass / Communion |
| devotion_memorare_st_joseph | Saints / St Joseph |
| devotion_consecration_christ_king | Devotions / Christ the King |
| church_prayer_for_pope | Intercessions |
| sacred_heart_short_prayer | Sacred Heart / Act of Reparation |
| devotion_ad_te_beate_ioseph | Saints / St Joseph |
| dead_fidelium_deus | Prayers for the Dead |
| dead_eternal_rest_singular | Eternal Rest — singular personal-intention variant |

These are placement recommendations, not a claim that every destination's dedicated UI has already been certified.

## Actual trilingual text inventory

- 19/19 selected records possess non-empty `la`, `en` and `fr` fields in current main.
- October 10 canonical corpus comparison showed that the 19 source texts had not been replaced. Title corrections in this branch are display-only.
- The displayed Latin text must use ordinary ecclesiastical spelling: `Sicut` and `tuum`, not `Sicvt` and `tvvm`; retain correct consonantal `v` in `Veni` and `vivis`. Do not use a blanket `v` → `u` substitution. `æ`/`œ` and attested accent marks are distinct orthographic choices, not evidence of incorrect `u/v`.
- Existing actual Latin code points in `Gloria Patri` already read `Sicut erat in principio`. A display that visibly changes this must be investigated in CSS/font rendering; the canonical Latin source does not read `Sicvt`.

## Source/translation audit — important exceptions

1. **Our Father, French:** the selected traditional French `Notre Père, qui êtes aux cieux ... ne nous laissez pas succomber` is **not** the verbatim French wording of the Vatican's 2005 `Compendium`, whose text begins `Notre Père, qui es aux cieux` and has `ne nous soumets pas`. The current record's generic `VERBATIM` source claim is therefore too broad *for that French face*. Keep the familiar traditional prayer; qualify its provenance and locate a historically appropriate original French witness before printing any precise source claim. Its Latin `quotidianum` likewise differs orthographically from this Compendium's `cotidianum`; do not silently change an established traditional Latin witness.
2. **Act of Hope, French:** the *actual* 2005 French Compendium reads `Dans cette foi, puis-je vivre et mourir` in its Act of Hope, while its accompanying Latin has `In hac spe vivere et mori statuo`, and English has `In this hope I intend to live and die`. Treat this as a documented **printed cross-language inconsistency**. Preserve the archival French source; if a devotional reading `Dans cette espérance` is introduced, mark it explicitly as a corrected/alternate reading rather than attributing the edit verbatim to the original document.
3. **Act of Faith:** English expands on Trinity, Incarnation and judgment, while the paired Latin/French use shorter confessional formulas. These are legitimate official language-face witnesses but not strict word-by-word translations. Do not promise line-locked parallelism.
4. **Act of Contrition:** the English/Latin and French traditional formulas differ in the punishment, near-occasion and penance clauses. This is a **variant** question, not a missing translation. Preserve exact sources and identify formula before any tap-toggle presentation.
5. **Act of Charity:** the published French Compendium's short prayer ends without the Latin/English final sentence and Amen. Do not append either to a text marked verbatim.
6. **Guardian Angel:** the English `Angel of God, my guardian dear` is a conventional rhyming devotional version, not a literal translation of the Latin/French `Angele Dei` text. This is appropriate as an alternate witness but must be identified as such.
7. **Morning Offering:** English and Latin preserve recognizable common intent but differ in introductory formulation. Verify actual edition attribution before claiming strict bilingual equivalence.

Remaining selected texts (Sign of Cross, Hail Mary, Glory Be, Apostles' Creed, `Dominus meus`, Memorare, `Veni Sancte Spiritus`, St Michael, Sacred Heart aspiration, Eternal Rest, before/after meals) have their three source fields preserved. This pass has **not** issued a new original-print certificate for each of their 36 vernacular faces. Earlier VERIFIED_PRIMARY flags are inherited; they must not be inflated into fresh evidence.

Primary reference:
- Vatican English Compendium, common prayers Appendix A: https://www.vatican.va/archive/compendium_ccc/documents/archive_2005_compendium-ccc_en.html
- Vatican French Compendium, common prayers Appendix A: https://www.vatican.va/archive/compendium_ccc/documents/archive_2005_compendium-ccc_fr.html

## Release boundaries

Do not merge without required CI, real 320/390px EN/FR gallery screenshots, and explicit review of category membership. This PR does **not** modify the canonical body of any prayer, claim missing translations, replace historical source witnesses, introduce artwork, or change the flip/tap language mechanics. After content/source review, implement text-tap language replacement with a separate visual acceptance gate and original full-width Latin/vernacular typography. GitHub Actions / GitHub Pages only; no Vercel.
