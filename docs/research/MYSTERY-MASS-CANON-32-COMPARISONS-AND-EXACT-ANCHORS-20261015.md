# Canon — 32 same-author passage comparisons, corrected attribution and fine anchors

**15 October 2026 · Research-only · publication NOT authorised**

This document records **actual adjudication** of the 32 specific `VER-*` ↔ `I*` pairs in the pre-existing user-owned `ad_orientem_mass_passage_dedup_handoff_2026-10-15.json` (input SHA-256 `6fd84b323120e23a9000c1190c07d1fd895fc80a0215fc16e360d093e1e61342`). It is not a new census and creates no new source ID. Full case-level dispositions and proof metadata are in [the machine ledger](../../data/learn/research/mystery-mass-canon-32-comparison-adjudication-20261015.v1.json).

## 1. Result of the 32-case review

| Disposition after comparing claim summaries | Pairs |
|---|---:|
| RELATED COMPLEMENTARY | 10 |
| DIFFERENT SUBPASSAGE | 15 |
| SAME ARGUMENT SUMMARY | 6 |
| ATTRIBUTION CORRECTION | 1 |
| **TOTAL** | **32** |

- A **shared summary** means one reader explanation can incorporate both source records without deleting either source ID. It is **not** permission to discard one witness.
- A **related/complementary** record adds a qualifier, narrower topic, Scripture reference or historical context.
- A **different subpassage** means the initial match was too coarse: same author plus `AO.CANON.*` does not imply duplicate argument.
- **Attribution correction** means a misleading interpretation must be blocked pending corrected attribution. It is not a disagreement invented by the editor.

**Original detection buckets, preserved separately:** 1 strong summary paraphrase, 4 thematic candidates, 27 same-author/same-owner cases requiring review. The disposition table above is a *later semantic assessment*; these metrics answer different questions.

**Six likely same-argument summaries:**

| Two preserved evidence IDs | Canon owner | Thematic focus |
|---|---|---|
| VER-032 / I062 | AO.CANON.10 | sancti Angeli / interpretations |
| VER-045 / I006 | AO.CANON.02 | circumstantium / faith and devotion |
| VER-049 / I016 | AO.CANON.05 | rationabilem / spiritual worship |
| VER-057 / I054 | AO.CANON.09 | Gihr on Abel |
| VER-058 / I056 | AO.CANON.09 | Gihr on Abraham / Isaac |
| VER-059 / I058 | AO.CANON.09 | Gihr on Melchisedech |

**The eight existing Canon owners implicated:**

| Owner | Number of comparison pairs |
|---|---:|
| `AO.CANON.01` | 5 |
| `AO.CANON.02` | 2 |
| `AO.CANON.04` | 2 |
| `AO.CANON.05` | 4 |
| `AO.CANON.06` | 1 |
| `AO.CANON.07` | 5 |
| `AO.CANON.09` | 6 |
| `AO.CANON.10` | 7 |

## 2. Correct a real Guéranger misattribution

`VER-051` describes the `sanctus Angelus` in words that could lead readers to think Guéranger means a **created ministering angel**. The directly inspected published French transcription of [Guéranger, *Supplices te rogamus*](https://www.domgueranger.net/explication-des-prieres-de-la-sainte-messe-2/) explicitly interprets **the Angel as Christ**, the Envoy of the Father/Angel of Great Counsel. `I033` better preserves this attribution. **Do not delete** either legacy ID; correct the underlying claim summary before any app integration.

Compare:
- [St Alphonsus, *Short Explanation of the Prayers of Mass* (English translation)](https://en.wikisource.org/wiki/The_Complete_Ascetical_Works_of_St._Alphonsus/Volume_6/The_Sacrifice_of_Jesus_Christ/Short_Explanation_of_the_Prayers_of_Mass) — mentions both interpretations; expresses a preference for presentation of prayers by a ministering angel.
- [St Thomas Aquinas, *Summa Theologiae* III q.83 a.4 ad 9](https://www.ccel.org/ccel/aquinas/summa.TP_Q83_A4.html) — **allows both** the created-angel and Christological interpretations; do not say he settles the question in only one sense.

This is **attributed liturgical exegesis, not defined doctrine**.

## 3. Actual source-cue matching, not new cards

**21 exact Latin substrings** were successfully matched to their existing `AO.SM.C*` cue IDs in **current `main` `data/presentation/reader-text-sung.v1.json`**, and their owning Canon blocks were checked against `data/presentation/reader-canon-source-map.v1.json`.

These are source addresses, **not 21 independently certified original-author passages**, and none has been placed into the published UI. A single cue can contain several meaningful word-level explanation anchors, so don't multiply Mass reader cards or fake new cue IDs.

| Owner / prayer | Existing cue territory | Commentary granularity |
|---|---|---|
| `AO.CANON.04` · *Hanc igitur* | `AO.SM.C0161` | Offering/prayer, `diesque nostros`; external rubrical proof needed for priest's hands |
| `AO.CANON.05` · *Quam oblationem* | `AO.SM.C0163–C0167` | Individual epithets, three first signs of the cross, `Corpus` and `Sanguis` signs |
| `AO.CANON.07` · Consecration of Chalice | `AO.SM.C0179–C0180` | `novi et aeterni`, `mysterium fidei`, `pro multis`, memorial command |
| `AO.CANON.09` · *Supra quae* | `AO.SM.C0186` | Abel, Abraham, Melchisedech are three phrase anchors inside **one** cue |
| `AO.CANON.10` · *Supplices* | `AO.SM.C0187–C0190` | Holy Angel, heavenly altar, participation, crosses and celestial blessing |

**Crucial distinction:** a prayer text cue is not itself proof of a priest posture, action or date-specific rubric. Gesture ownership remains in the distinct source-verified 1962 rubric/actor registers.

## 4. Interpretative problems: five individually retained dossiers

| Canon owner | Problem | Source cue | Disposition |
|---|---|---|---|
| AO.CANON.10 | *Identity of holy Angel* | `AO.SM.C0187` | parallel attributed readings |
| AO.CANON.09 | *Meaning of older acceptable sacrifices* | `AO.SM.C0186` | three separate scriptural types with one theological guard |
| AO.CANON.05 | *Five epithets in Quam oblationem* | `AO.SM.C0164` | five word anchors separate lexical mystical rubrical layers |
| AO.CANON.04 | *Hands extended over the oblation* | `AO.SM.C0161` | symbolism not history of origin |
| AO.CANON.07 | *Chalice formula and biblical source attribution* | `AO.SM.C0179, AO.SM.C0180` | single cue with multiple phrase anchors |

Particularly:
- [Aquinas III q.83 a.4 ad 7](https://www.ccel.org/ccel/aquinas/summa.TP_Q83_A4.html) treats *Quam oblationem*'s petitions as concerning **fruitfulness for us**, while [Guéranger](https://www.domgueranger.net/explication-des-prieres-de-la-sainte-messe-2/) gives a lexical and spiritual reading. These are not interchangeable glosses.
- For *Supra quae*, [Gihr §61, pp.659–660](https://archive.org/stream/holysacrificeofm00gihriala/holysacrificeofm00gihriala_djvu.txt) treats Abel, Abraham and Melchisedech distinctly. His conjecture about fire on Abel's sacrifice must not be represented as a biblical fact; Isaac is spared.
- For the chalice's [received Roman formula](https://en.wikisource.org/wiki/The_Complete_Ascetical_Works_of_St._Alphonsus/Volume_6/The_Sacrifice_of_Jesus_Christ/Short_Explanation_of_the_Prayers_of_Mass), the source must not be assigned wholesale to one Gospel verse.

## 5. Explicit next gate

1. **No further broad duplicate census**. Only finish original edition, print/OCR, and author-work comparisons for the six summary pairs, the Guéranger correction and the five interpretation issues.
2. Reuse existing [Mystery PR #1193](https://github.com/Fulcanelli13/ad-orientem/pull/1193), [curated reader #1210](https://github.com/Fulcanelli13/ad-orientem/pull/1210) and canonical `src/reference` work/edition/witness contract; do not register duplicate work IDs in this pipeline.
3. Collate exact reader phrase offsets and owner-specific gesture cues for all 21 candidate anchors; a 39-owner passage can hold **multiple** explanations.
4. Write **one concise bilingual synthetic explanation per verified phrase/topic**, maintaining alternate author interpretations in the expandable study view, then perform editorial/legal rights review.
5. Keep 65–67 LIVE production, its separate 48 rollback and all other Mass forms/rites untouched until an accepted app integration.

**Verification boundary:** Direct online historical-language/translated text checks have been made for Guéranger, Alphonsus, Aquinas and 1902 Gihr OCR. **None of the 32 pairs is certified by complete page-image collation of all both original witnesses**, no final bilingual theological approval, no copyrighted book packaged, and **no runtime publication**.
