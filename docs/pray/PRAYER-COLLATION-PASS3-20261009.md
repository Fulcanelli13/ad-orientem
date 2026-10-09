# Prayer edition collation — Pass 3: Compendium and historical forms

**Date:** 9 October 2026. **Scope:** 18 anchored records from the 48 Prayer corpus; 16 Novenas remain wholly uncollated. **Authority:** Original documents below, source code `src/pray/canonical-data.js`, and the prior 64-entry matrix. **Outcome:** no claim of completed verbatim three-language certification.

## Rule applied

A primary link must identify the actual wording displayed. An authentically traditional prayer may differ from a twentieth- or twenty-first-century edition without being erroneous. Keep the text, add the appropriate original-language comparison, and never use one printed language's formulation to certify independent devotional translations in two others. "Original text available" and "text verified to this edition" are separate claims. Where source-authorized EN/FR/LA versions differ in length, identify them as distinct witness forms rather than interchangeable translations.

The machine-readable [v3 matrix](../../data/pray/prayer-source-certification-inventory.v3.json) carries all 48 prayer records and 16 novena records, 18 current comparisons, references and edition classifications. `source-collation-notices.v1.js` is a generated lightweight subset for seven material discrepancies displayed only inside the existing Prayer source drawer. No new route, edition chooser, duplicate prayer entry, or second canonical text owner is introduced.

## Direct official witnesses

- [Vatican Compendium (2005), English text and Latin originals](https://www.vatican.va/archive/compendium_ccc/documents/archive_2005_compendium-ccc_en.html), especially the Lord's Prayer and Appendix A (common prayers, Marian texts, theological acts, `Anima Christi`).
- [Vatican Compendium (2005), French text and Latin originals](https://www.vatican.va/archive/compendium_ccc/documents/archive_2005_compendium-ccc_fr.html), especially prayers from Signe de la croix through Repos éternel, Magnificat/Benedictus, Marian texts, and Acts of Faith/Hope/Charity/Contrition.
- [Early French catechism, page 164](https://fr.wikisource.org/wiki/Page:Cat%C3%A9chisme_%C3%A0_l%E2%80%99usage_de_toutes_les_%C3%A9glises_de_l%E2%80%99empire_fran%C3%A7ais.djvu/164): traditional formal-address Our Father and Creed. The page is a historic comparison, not an assertion of complete identical wording.
- [FSSP French Memorare / Souvenez-vous (2022)](https://www.fssp.org/fr/consecration-de-la-fraternite-sacerdotale-saint-pierre-au-coeur-immacule-de-marie/), supporting the common traditional lexical form distinct from the 2005 French appendix.
- [Baltimore Manual, Morning Prayers](https://en.wikisource.org/wiki/A_Manual_of_Prayers_for_the_Use_of_the_Catholic_Laity/Morning_Prayers) and [Blessed Sacrament Book, Prayers During the Day](https://en.wikisource.org/wiki/Blessed_Sacrament_Book/Prayers_During_the_Day) for the two meal-grace formulas.

## Material outcomes

| Prayer | Language | Source distinction | Action |
|---|---|---|---|
| Our Father | FR | Traditional `vous` and `ne nous laissez pas succomber`, unlike French Compendium's `tu` and `ne nous soumets pas` | Preserve traditional form; link early catechism as comparison; disclose |
| Apostles' Creed | FR | `Saint-Esprit` in traditional form versus `Esprit Saint` in the 2005 French Credo | Preserve; link historical catechism as comparison; disclose |
| Hail Holy Queen | FR | Traditional formal-address translation versus French 2005 `Salut, ô Reine` phrasing | Preserve; disclose; French exact printed-witness collation still pending |
| Memorare | FR | Common traditional version using `Verbe incarné` differs from French Compendium's `Mère du Verbe`; FSSP witnesses the traditional family | Preserve; link FSSP comparison; disclose |
| Anima Christi | EN | App English is direct prose translation of the Latin; Compendium English is a metrical poem | Preserve; distinguish translation provenance; disclose |
| Eternal Rest | FR | `lumière éternelle` in the app versus French Compendium's `lumière de ta face` | Preserve; disclose; printed traditional French witness still pending |
| Grace after meals | EN | App `benefits` versus Baltimore Manual's `mercies`; a second historical prayer book actually prints `benefits` | Add correct secondary witness; preserve; disclose |
| Act of Hope | FR | Holy See's printed French `Dans cette foi` conflicts with Latin `In hac spe` and English `In this hope` | Previously disclosed in Pass 2; do not duplicate or silently emend |

**Additional editorial distinctions:** The 2005 Compendium intentionally prints locale-specific forms of the Acts of Faith, Charity, and Contrition that are not sentence-by-sentence translations; the French Act of Charity is shorter. Common Sign of the Cross, Hail Mary, Glory Be and Guardian Angel formulas are present in the appendix, but punctuation-level or three-language verbatim certification was not asserted. Magnificat and Benedictus have Bible/office translation choices; no unqualified "1962 Vulgate parity" is inferred. The first grace is present in the cited Baltimore Manual. In every case, this was an **anchor check**, not an exhaustive word/token comparison of every witness in all languages.

## Counters and acceptance

- 64 canonical records retained: 48 prayers plus 16 novenas.
- 18 prayer records have bounded primary-source/form anchor reviews; 46 records have **NOT_REVIEWED** at this pass.
- **0 newly certified verbatim trilingual prayer records**. Historical witness attributions and variants are documented, but the full original-edition acceptance gate remains unsatisfied.
- 7 material historical-edition notices added to the Prayer reader's existing disclosure; the Act of Hope anomaly remains owned by the prior source notice, rather than duplicated.
- No actual prayer words, liturgical ownership, dates, gesture cues, personal prayer tracking or Mass runtime behaviour altered.

Next: independently collate all texts (including each of 16 Novenas, often day-specific); pin source editions and page/section ranges; compare FR/LA to the matching printed *form* rather than the English prose; assign `VERBATIM_PASS`, `AUTHORIZED_LANGUAGE_VARIANT`, `EDITORIAL_TRANSLATION`, or `UNVERIFIED` separately per language. Run both browser acceptance and static tests and confirm no export or app-shell payload regression.
