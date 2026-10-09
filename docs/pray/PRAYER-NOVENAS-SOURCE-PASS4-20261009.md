# Prayer — Novenas source and recitation audit, pass 4 (9 October 2026)

**Scope:** all 16 canonical Novenas; actual clickable original source access, distinction between a facsimile and a secondary devotional reproduction, and the historical nine-Tuesdays recitation sequence. Builds on [pass 3](PRAYER-COLLATION-PASS3-20261009.md) and [the original 64-record register](../../data/pray/prayer-source-certification-inventory.v3.json). Source-status registry: [novena-source-review.v1.json](../../data/pray/novena-source-review.v1.json). **This is not full day-by-day bilingual original-text certification.**

## P1: primary source URL existed but was not clickable

Every Novena record has `source.url`, but `sourceDetails(n)` rendered only the author, book, imprimatur, adaptation, and `historySources` links. Users could not open the actual cited primary text except when an optional secondary/history URL happened to point to the same page. This breaches the requirement that **every attributed text has a working, original-context hyperlink**. Corrected by introducing a single HTTPS-allowlisted direct citation in the existing source drawer, retaining supplementary witnesses, and providing bilingual source-section notes where needed. Tested for **all sixteen** source drawers at 390px mobile touch width.

## P1: the Nine Tuesdays were missing source-mandated elements

Benedict O’Donoghue, O.F.M., [*Say a Prayer to Saint Anthony* (1966)](https://www.pamphlets.info/Australia/acts1014/), section **Prayers for the Devotion of the Nine Tuesdays**, expressly says no fixed formula is obligatory, but offers the two customary invocations, then **one Our Father, Hail Mary and Glory Be followed by the Miraculous Responsory**. The 16-novena app had retained the two invocations but declared `commonPrayers:[]` and never presented the responsory in the novena, despite already owning `devotion_st_anthony_lost_items` in its canonical Prayer corpus.

Corrected without duplicating prayer text: the three common prayers are referenced by existing canonical IDs with count **1** and `closingCanonical` references the existing **Si quæris miracula** record. Both Guided and Simple readers already render that sequence. The rubric explicitly calls it the pamphlet's **customary** sequence rather than an obligation. The weekly nine-consecutive-Tuesdays calendar remains unchanged. The pamphlet-hosting site's comment about old indulgence grants is not accepted as authority concerning current Church law.

## Other linked edition distinctions

| Novena | Source distinction | Change |
|---|---|---|
| Holy Ghost/Pentecost | The 1925 [*Blessed Be God* transcription](https://en.wikisource.org/wiki/Blessed_be_God_%28Callan%29/Novena_For_Christmas) contains distinct **Novena for Christmas** and **Novena for Pentecost** sections on one page | Identify and label the Pentecost heading instead of presenting the Christmas-titled page as if it began with Pentecost |
| Christmas | Same digital page, separate 16–24 December historical nine-day form | Label its section and dates |
| Annunciation | [Hammer, *Mary, Help of Christians*](https://www.gutenberg.org/files/33671/33671-h/33671-h.htm), section III | Name the section; retain explicit **nominal fixed-date / transferred-feast unresolved** distinction, not a false 1962 transfer-aware guarantee |
| Seven Sorrows / Assumption | Same Hammer book, distinct sections IV and V | Identify which of the three separate nine-day works the source link supports |
| Our Lady of Perpetual Help | [*With God*, Wikisource scan page 699](https://en.wikisource.org/wiki/Page:Withgodbookofpra00las.djvu/699) explicitly marked **not proofread** | Explicitly tell readers this digital transcription is **not verbatim certified** |
| St Thérèse | [EWTN 24 Glory Bes](https://www.ewtn.com/catholicism/devotions/novena-of-the-twentyfour-glory-bes-to-st-therese-the-little-flower-293) is a contemporary reproduction of a 1925 practice, with the 9th–17th of each month recommended | Do not call the page an original 1925 printed prayer edition; distinguish optional feast-preparation dates |
| St Anthony | 1966 Franciscan pamphlet witnesses proposed prayers and the **weekly** nine-Tuesdays cadence | Restore missing canonical sequence; no invented nine independent texts |

The remaining Novenas retain their existing source-work links, original text, historical date metadata and current French text status; no new self-certified originals have been manufactured. Every source link gives a direct route to the external publisher, even where the source is one section of a larger work or a later transcription.

## Acceptance boundary

- **16/16** Novenas still retain exactly nine occurrences, original owners, EN and FR source-body identities, and their existing traditional-versus-suggested start policy.
- **16/16** primary source URL buttons rendered in the source drawer.
- **Eight** nuanced source-section/translation or scan warnings available where the digital witness otherwise misleads.
- St Anthony's suggested full prayer sequence restored, pointing to canonical Prayer rather than a copied version.
- **0/16** novenas newly promoted to complete two-language line-by-line certification; the historic 1966, 1883, 1925, 1857 and other originals still require full text comparison.
- Outstanding: original printed-witness facsimile of unproofread `perpetual_help`; complete French printed form collation across 16; transfer-aware Annunciation/St Joseph feast novena binding; whether other devotional closing responsories have been elided by older donor conversions; accessibility and offline availability beyond the exercised browser routes.

**No replacement of existing canonical religious texts, no new runtime engine, and no alteration of Calendar’s date resolver.**
