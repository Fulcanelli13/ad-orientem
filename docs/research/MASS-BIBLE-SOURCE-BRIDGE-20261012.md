# Mass–Bible timeline: source-first study bridge — 12 October 2026

## Production owner and scope

The Mass UI and Scripture Context already use the canonical Mass/R17 owner. **This batch does not add another Mass player**. It extends the existing `learn.mass` formation owner (eight stages, 24 claims) with two lazy study choices: (1) `The Bible in the Mass`, 26 bilingual source-linked Mass moments, and (2) `1962 Epistles and Gospels`, a filtered, original-source witness lookup over the already-merged registry.

The production `SOURCE_FIRST_LIVE_PRODUCT_48` remains exactly 48 presentation cards; the 1962 Proper selector, Low/Sung/Solemn ritual state, source-indexed Scripture overlay, calendar and icon/gesture cues are not edited. The Mass–Bible layer is **pre-publication editorial study**, and none of its IDs assert a recovered 48-card historical identity.

## Explicitly distinct editorial strata

| Stratum | Current batch | Authority and limits |
| --- | --- | --- |
| Direct biblical wording in the Missal | 6 examples | Actual prayer-phrase anchors, *not* a blanket 1962 word-by-word collation. Psalm numbers use Vulgate and modern numbering explicitly. |
| Biblical wording adapted by the Roman rite | 4 | The Gospel source does not equal the entire liturgical formula. `Sanctus`, `Agnus Dei`, `Domine non sum dignus` explicitly qualified. |
| Biblical persons explicitly named in the Canon | 3 | Abel (Genesis 4), Abraham (Genesis 22), Melchisedech (Genesis 14) are literally named in `Supra quae`; they are **not** read aloud as Genesis lessons at that point. |
| Distinct variable readings and exceptions | 3 | A Propers example is never assumed to be today's Mass; Last Gospel may vary or be omitted in some rites. |
| Narrative, doctrinal, penitential and typological interpretation | 10 | Not presented as word-for-word Missal quotations. Melchisedech/Hebrews 7 is a theological typology; Gospel parallels to `Confiteor` and `Libera nos` remain comparisons. |
| Christ-life meditation and iconography | 0 approved | Fortescue, Dujardin and other meditative/allegorical crosswalks remain outside user-facing corpus pending exact passage/source provenance. |

The **26 examples are not an exhaustive concordance** of the 1962 Mass. Each example must carry a hyperlink to the 1962 Missal witness and to the precise biblical chapter context, with bilingual explanation and any qualifier. The Missal URL serves as edition-level provenance, not as an independently collated printed page identifier.

## Examples where conflation would be a substantive error

- **Psalm 42/43 and Psalm 25/26**: distinct Vulgate vs modern Psalm numbering; an English-language citation alone cannot validate the Latin text.
- **`Domine, non sum dignus`**: Matthew 8:8 refers to the centurion and the healing of his servant (`puer meus`); the communicant's liturgical petition uses `anima mea`. It is an adaptation.
- **`Mysterium fidei`** in the 1962 chalice formula is not simply transcribed from Luke 22:20. Source-narrative links are not evidence of a word-identical Gospel verse.
- **Abraham**: Isaac is not killed in Genesis 22, even though the Canon speaks of Abraham's sacrifice.
- **`Supra quae`**: the three named Old Testament exemplars are named inside the Canon. Hebrews 7 interpretation of Melchisedech is distinct from that explicit wording.
- **Last Gospel**: avoid auto-inserting John 1 into Masses where the liturgical structure changes or omits it, including special-day conditions.
- **The Last Supper**: Paul's narrative and Luke's are contextual witnesses; do not overwrite the 1962 consecration formula with either biblical version.

## 1962 Proper reading inventory — existing GitHub main sources, independently checked as a registry structure

| Original canonical data owner | Shape inspected | Non-certification |
| --- | --- | --- |
| `data/mass/scripture-reading-witness-register.v1.json` | 50 distinct Proper source paths | External Proper Latin incipit guard, some reading holds |
| `data/mass/scripture-feast-reading-supplement.v1.json` | 55 additional distinct source paths | Major feasts and Lent/Holy Week/Ember source and branch exceptions |
| **Combined** | **105 nonduplicated source paths, 195 ordinary Epistle/Gospel slots** | Only source+Latin identity, **not** independent blanket printed-1962 certification |
| `data/mass/scripture-segmented-proper.v1.json` | **15 ordered/segmented special reading records** | Preserve discontinuous and historical/original-source exceptions; no verse-range smoothing |

The new `learn.mass` selector inspects these *existing* three files at runtime, after verifying both source status and cited Latin incipits. It does not alter the source registry, infer a selected date's Proper, publish full copyrighted Bible text, or promise full missal coverage.

The larger Proper work including chant/antiphon Scripture references and original 1962 printed-page certification is **not completed by this batch**. It must be reconciled with the separate original edition page packets before any full-year claim. A known older research status counted 100 priority printed page packets with none fully independently certified; this is **not re-certified** here.

## Research holds and future interfaces

1. **Original-word collation**: check the exact 1962 Mass prayers against the original Missal, and distinguish Hebrew/Greek/LXX, Vulgate, Douay–Rheims and Crampon chapter/verse decisions, especially Psalms and Esther.
2. **Fortescue typology**: recover the 54 research candidates and 30 original-book historical observations as source-level individual dossiers, verifying original text and authorship; keep historical liturgical explanation distinct from normative 1962 rites.
3. **Dujardin meditation**: recover the 22 linked Christ-life contemplation moments with page references. They were authored by **Fr Léopold J. Dujardin** within the older collection associated with St Alphonsus, **not by Alphonsus himself**. They must not become automatic rubrics, scripture quotations or a fake illustrated timeline.
4. **Proper Scripture mapping**: later extend beyond two standard reading slots to approved Introits, Graduals, Alleluias, Tracts, Offertories and Communions *only with the actual original Latin/1962 textual boundary*. Segmented/Ember lessons must preserve original order.
5. **Biblical Atlas**: [draft #1069](https://github.com/Fulcanelli13/ad-orientem/pull/1069) holds the 151-event chronology and linked source-typed dossiers; when that owner merges, a second separately reviewed crosswalk can connect compatible Gospel/Mass episodes without creating a second Atlas or presumed exact biblical date.
6. **R17 LIVE**: eventual optional "Biblical context" layer must project onto **actual source-owned card events**, not index=48 guessed historical cards. Unverified typology/meditation cannot appear as live rubric or priest/faithful gesture cues.

## Automated acceptance

`tests/mass-bible-source-layers.mjs` asserts all 26 bilingual classified rows, their direct missal/Bible URLs, required corrections, original 105/195 +15 witness structure, and data vetoes if status or Latin witness fails. Independent tests run for original eight-stage formation, 48-card LIVE and existing Scripture source selection.

`tests/mass-bible-study-phone.mjs` opens the actual Learn Mass reader, browses evidence filters and 105 witnessed source paths, verifies original stage return, tests absence of document overflow at 320/390/768px, and uploads source-labelled screenshots for editorial review.

**Merge gate:** This branch remains draft until original source, rights, doctrine, and mobile visual review; a green CI is not endorsement of every candidate as printed-1962 verified.
