# Customs source registry — Lent, Holy Week and Easter source-action intake

**Date:** 23 October 2026. **Scope:** Research master only, no production integration, no new canonical custom IDs.

## Sources and source-grade distinction

1. Helen Hull Hitchcock (editor), Women for Faith & Family, *Lent & Easter: A Sourcebook for Families*, EWTN transcription [online](https://www.ewtn.com/catholicism/library/lent--easter-a-sourcebook-for-families-10456), introduction dated 10 February 1992. **68** brief paraphrased source-action observations. **EWTN explicitly presents excerpts from the book, not a confirmed full-book edition.** Locators are online line numbers 156–374, never invented book pages.
2. Emerson and Arlene Hynes, *Lent and Holy Week in the Home* (Liturgical Press, 1977), via **seven excerpt pages** hosted by CatholicCulture ([Palm Sunday](https://www.catholicculture.org/culture/liturgicalyear/activities/view.cfm?id=511), [early Holy Week](https://www.catholicculture.org/culture/liturgicalyear/activities/view.cfm?id=512), [Holy Thursday](https://www.catholicculture.org/culture/liturgicalyear/activities/view.cfm?id=513), [Good Friday](https://www.catholicculture.org/culture/liturgicalyear/activities/view.cfm?id=514), [Holy Saturday](https://www.catholicculture.org/culture/liturgicalyear/activities/view.cfm?id=515), [Easter](https://www.catholicculture.org/culture/liturgicalyear/activities/view.cfm?id=516), [self-denial](https://www.catholicculture.org/culture/liturgicalyear/activities/view.cfm?id=114)). **57** short source-action details. Seven excerpts are NOT a certified complete transcription of the 1977 original.

Both authors provide post-1962 household guidance and derive many examples from older works. Different book/author **does not automatically prove independent regional historical witness**. The 125 records are a source mention/detail census, not unique customs, not evidence of widespread practice, and not approval of the rubrics or older domestic blessings proposed therein.

## Count and scope

- **68 + 57 = 125** source-located action observations, each with immutable research ID, claim category, and its web URL and source-line locator.
- Types: **101** author suggestions/family adaptations, **10** reported traditions, **9** historical/origin claims requiring validation, **3** public liturgical ceremony descriptions not necessarily family customs, and **2** family prayer/minister authority issues requiring primary ritual checking.
- The prior working catalogue contained **1,926 rows**, including **127 already imported French heritage-inventory detail observations** (71 Breton Pardons and 56 Basque Besta Berri), which are separately sourced in another branch pipeline.
- Working catalogue now **2,051 source/detail rows**. Breakdown: 1,025 Weiser + 70 McLoughlin + 198 Stokes + 132 Trapp/Berger/Newland excerpts + 204 Mueller/Kelly + 170 Chaney + 127 French PCI regional details + 125 this batch. The separate 100-row Mueller re-extraction remains explicitly NONADDITIVE.
- Older **408 noncanonical provisional action groups**, 56 potentially overlapping master identities, and zero newly certified distinct customs are preserved; **zero automatic merges and zero published Ad Orientem custom cards**.

## Distinguishing content accurately

The intake covers Shrove Tuesday and Septuagesima-context seasonal self-denial, Lenten reading and prayers, Passiontide devotions, palms, domestic Holy Week meal customs and suggested dramatic/symbolic rituals, Good Friday quiet, Easter water/candles/eggs/food, and Pentecost regional historical claims.

A retrospective **public liturgical rite** is not automatically a lay custom. Parochial blessing or distribution of palms, Tenebrae, and certain Ascension ceremonies belong to historical/public liturgical context; home usages such as preserving blessed palms and family recitations belong in separate action families. The **1992 treatment draws on the postconciliar calendar and disciplines**, so time-of-year claims, liturgy labels, fasting obligations and directions cannot be mapped mechanically onto Ad Orientem's authoritative 1962 Calendar. Family Passover-style symbolic suppers are recorded solely as modern proposals; they are not represented as Catholic rites or as mandatory devotional observances. Fasting and children's penance proposals are not recommended as health or legal advice.

## Reconciliation strategy and retained data

- Raw intake: `data/customs/master/lent-easter-wff92-hynes77-source-action-intake.v1.json`.
- Reversible candidate lookup: `data/customs/master/lent-easter-125-source-candidate-lookup.v1.json`.
- **125/125** rows screened against **490 working owner/group/family labels** and **901 earlier other-source records**, yielding **372 lexical retrieval hints**, **50** rows with owner-label hints, **84** with earlier-source hints and **34** without either. These categories overlap.
- Retrieval hints may be false. No-hint does **not** mean a new custom. Even a high-scoring label match does not imply historically identical actions or independent witness.
- The unified workbench preserves the source observation count and links; the existing app Calendar/rites/missal/prayer/UI remains unchanged.
- Regression assertions enforce 125 IDs, full counts, all web locators, type classification, no source loss, no promoted identities and no production changes.

## Next research gates

(1) Acquire and index independent *regional* historical and archival Easter/Passiontide evidence, prioritizing original church and ethnographic records rather than recursively mined family advice. (2) Reconcile source dependencies (Weiser → 1992 editors; Mueller and Hynes citations) before counting independent witnesses. (3) Keep liturgical celebration, pious practice, regional custom, recipe, author's adaptation, historical origin claim and unsupported folk supernatural assertion distinguishable. (4) Increase semantic action-identity adjudication with same-action, component/variant, different action and authority statuses, preserving stable IDs and no automatic mergers. (5) Only consider Calendar integrations later, without inventing another Calendar.
