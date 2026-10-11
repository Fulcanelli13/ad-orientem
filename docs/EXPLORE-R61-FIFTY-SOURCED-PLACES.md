# Explore R61 — 50 additional bilingual, source-linked sacred Places

## Scope and counts

The R60 release covered 20 editorially featured Places. R61 extends a **complete, bilingual narrative** to **50 further canonical Places** and their **70 attached destination-pilgrimage records**, without changing the featured-menu capacity or inventing new coordinates.

As of the R61 corpus:

| Content | Counts |
| --- | ---: |
| Canonical shrine records | 216 |
| Canonical destination pilgrimages | 206 |
| Original featured Place menu | 20 (unchanged) |
| New R61 French shrine narratives | 50 |
| New R61 French pilgrimage accounts | 70 |
| Shrine records with French origin text, including earlier work | 108 |
| Pilgrimage records with French scope text, including earlier work | 94 |
| Shrines still lacking French origins | 108 |

The **source-of-truth is still `data/shrines/shrines-pilgrimages-seed.v1.json`**. The audit manifest `data/shrines/research/explore-r61-bilingual-story-batch.v1.json` indexes the 50 exact `place_id` and `shrine_id` pairs, corresponding pilgrimage IDs and existing original source URLs. It is a review ledger, not a second prose owner.

## Content and discipline

The work deliberately covers geographically dispersed sites, not fifty entries from one country. Twenty countries are represented, including France, Germany, Ireland, Poland, Belgium, Switzerland, Austria, Canada, the United States, Brazil, Mexico, Colombia, Nigeria, Uganda, Australia and New Zealand.

French prose is limited to the historical or devotional scope of the already sourced English corpus. The religious significance and the annual pilgrimage practice are distinct paragraphs. Official/diocesan sites and other original publishers are cited through the existing shrine source registry. No new saint identifications, ecclesiastical recognition declarations, approved apparition claims, Mass schedules or feast-date calculations have been manufactured.

Where an English seed included an internal editorial note about source classification (Maria Taferl), the corresponding public text now states only what the pilgrimage source establishes. Historic continuity at Bettbrunn is phrased as an attested tradition, not an unverified uninterrupted practice.

**Reader expansion is evidence-gated.** Any canonical Place now qualifies for the full story if it has:
- a French and English origin account attached to an exact Shrine ID, with its own original source;
- a French and English pilgrimage account attached to the same Shrine ID, with its own original source;
- no generic evidence-placeholder chapter masquerading as a history.

Other Places continue to expose their original records and summaries. Nothing is automatically generated at runtime. The map, physical pin ownership and the original twenty **In Focus** sites remain unchanged.

## Reader behavior and safeguards

Each eligible site presents the sanctuary account, up to three distinct pilgrimage-context paragraphs (one per canonical record), citations next to each paragraph, and optional fully sourced additional contexts. Calendar dates, novena associations, routes and exact traditional Mass venue relationships remain exclusively owned by their modules. The new reader chapter navigation appears in a Place sheet, not as another top-level Explore carousel or map overlay. Its links retain the existing 44px touch standard.

The `tests/explore-r61-bilingual-stories.mjs` regression gate cross-checks all fifty against original source IDs and URLs, canonical Place IDs and owners, plus live Place profiles for French rendering and meaningful source citations. The normal Explore unit suite imports this gate. The original R60 featured-20 and prior place/media/navigation tests are preserved.

## Next editorial queue

Another **108 shrines lack any French origin summary**. Thirty-eight nonfeatured shrines had pre-existing French origin text before R61; those records should be audited for pilgrimage coverage and only be promoted to a complete story when both paragraphs pass source-specific checking.

The backlog priority is not raw translation volume alone: source quality, genuine devotional distinctiveness, practical pilgrimage relevance and original bilingual wording must determine the next tranche. Avoid publishing a generic or stale text just to raise a coverage number.
