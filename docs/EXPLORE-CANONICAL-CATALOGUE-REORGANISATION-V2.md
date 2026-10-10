# Explore: canonical catalogue and evidence-led geography (v2)

Status: **implementation in stages**. This is a non-destructive migration proposal based on the 10 October 2026 active `main` inventories. Do not treat active seed counts as completion of accumulated research.

## Product decision

Explore should answer two different questions without mixing their records:

1. **What is it?** Read a practice, relic subject, apparition claim, shrine, or pilgrimage in a subject-first catalogue.
2. **Where is it?** Open a canonical Place page or a map for physical destinations and source-backed occurrences.

The map is a **view of locatable evidence**, not a taxonomy of Catholic customs. A country is neither a custom owner nor evidence of exclusivity; a widespread practice can have local variants. Never infer worldwide prevalence merely because two or more countries are attested.

## Separate identity, normative status, provenance and distribution

A custom needs distinct fields for:

- **Identity:** one stable `custom_id`, title, family, definitions and practical description.
- **Normative status:** universal liturgical obligation, discipline of a specified rite/period, voluntary devotion, local custom or historical witness. These are not interchangeable.
- **Distribution assessment:** `UNASSESSED`, `UNIVERSAL_NORM`, `WIDESPREAD_ATTESTED`, `REGIONAL`, `LOCAL`, `HISTORICAL_ONLY`. This is a sourced editorial determination, not a deduction from the presence of map pins.
- **Attestations:** many-to-one `attestation_id -> custom_id`; area, period, institution or exact Place, with linked witnesses.
- **Variants:** local expression, terminology, procedure or timing attached to the same canonical custom **unless** primary evidence establishes a genuinely distinct practice.
- **Guide:** what the practice means, how it is undertaken (where appropriate), whether voluntary/obligatory, and its sources. Calendar calculates dates; Pray owns prayer texts; Mass owns ceremonial cues.

Keep `custom_class` in the v1 database until editorial crosswalks and evidence review are complete. It mixes status and geographic character today (for example, `FRENCH_CATHOLIC_CUSTOM`), and must not be silently reinterpreted as a finding of exclusivity.

### Concrete examples

- **May devotion, cemetery prayer, ex-votos and votive candles:** one canonical concept each; French or other witnesses belong under *attested history and local expression*. No separate country article unless the local form is genuinely distinct.
- **Pardons in Brittany:** a regional expression associated with local feast/pilgrimage observances, not a synonym for all worldwide shrine anniversaries. The current `DEV-007` umbrella (36 attestations) needs editorial subdivision by **practice variant**, not by country.
- **Pain bénit and relevailles:** maintain historical/normative qualification. Documentation in France does not establish that only France practiced them.
- **Lourdes, Laghet, Paray:** shrine and physical Place pages own locations; devotion and family custom records cite them as attested places, not competing map entities.

## Content ownership

| User-facing section | Canonical entity | Core navigation | Map policy |
| --- | --- | --- | --- |
| Customs & Catholic life | Custom / variant / guide | Theme, season, life event, historical status | Only attested locations as supporting links |
| Shrines & sacred places | Shrine -> shared Place | Dedication, saint, sanctuary type, region | Primary: physical Place |
| Relics | Subject -> attributed object -> custody claim -> Place | Saint or subject, object type, claimed authenticity/custody | Place pins only for verified location evidence; never conflate custody with independent authentication |
| Apparitions & sacred phenomena | Historical claim -> ecclesiastical reception -> associated Place | Subject, period, reception status | Place-based only; preserve recognition distinctions |
| Pilgrimages | Journey/event -> destination shrine -> route/temporal link | Destination, devotion, pilgrimage type | Destination pins; route line only with documented geometry |
| TLM directory | Venue -> source-backed liturgical offering | Location, affiliation, schedule | Venue pin; no inferred link to a shrine or custom |

**One Place ID is reused.** Multiple content records may legitimately point to one place. Do not invent a community ↔ shrine, Mass ↔ pilgrimage or custom ↔ venue affiliation from proximity.

## Existing data to reconcile, not discard

Active published counts in the inspected seed:

- `data/customs/customs-atlas-seed.v1.json`: 13 customs, 71 attestations. The source-of-truth notes additional SOT-07 research outside the seed; the full source rows must be reconciled before claiming completion.
- `data/customs/novena-context-links.v1.json`: 18 novena context links; these belong as context/deep links, not as independent customary practices.
- `data/shrines/shrines-pilgrimages-seed.v1.json`: 178 shrines, 206 pilgrimages, 20 routes, 77 temporal links.
- `data/explore/sacred-phenomena-seed.v1.json`: 32 apparition and 122 relic **site claims**.
- `data/explore/worldwide-relic-subject-census.research.v1.json`: 161 research-only subjects, 75 legacy object crosswalks, 22 custody evidence records, plus later research waves. These are not 161 independently certified relics.
- `data/geography/seed-registry.v1.json`: 182 shared Places and 41 geographic areas.
- `data/customary/catholic-life-salvage.v1.json`: customs/relic/sacramental claims needing canonical ownership and source review.

Never report `89 Traditions` as 89 customs: this is currently 71 attestation + 18 novena-context discovery items.

## Migration order

### A. Repair discovery without rewriting evidence (this branch)

- Default the Home Traditions shortcut to **Practices**, not Map.
- Collapse custom attestations into **one** list item per `custom_id`; show all places/evidence in an expandable detail.
- Preserve the original attestation records, source links, exact Place deep links and attested-place map as secondary.
- Keep novena context links searchable but out of the default customs tally.
- Protect the existing `place_id` aggregation, TLM Directory data and calendar ownership.

### B. Inventory and canonical crosswalk

- Reconcile published customs with the unreleased SOT-07 corpus, Catholic Life salvage and any older traditional-life explanations.
- Build one deduplicated custom crosswalk: legacy id, canonical owner id, variant id if required, record status, source coverage, guide coverage, French-world relevance, prior UI location, migration outcome.
- Track `PUBLISHED`, `SOURCE_REVIEW`, `HOLD`, `REJECT` separately. No invented universal claim or lost negative knowledge.
- Split umbrella topics where evidence describes different practices. Do not split merely because the same custom occurs at different shrines.

### C. Subject-first relic reconciliation

- Treat `worldwide-relic-subject-census.research.v1.json` as editorial research until every selected relation is source-reviewed and intentionally promoted.
- Deduplicate saint/subject aliases without merging different relic objects or custody claims.
- Preserve distinct object, custody, attribution and canonical-authentication review fields; use one shared Place where appropriate.
- Map a curated principal site only when its specific Place evidence passes existing provenance gates. No pin for every dispersed fragment.

### D. Shrine/pilgrimage reconciliation

- Identify same-site, same-destination and same-event duplicates separately; one shrine site may support multiple legitimate pilgrimages.
- Move shrine history, relic custody, related prayers and pilgrimages into linked sections of a single Place profile, without collapsing their independent owners.
- Use documented destinations and routes; no fabricated recurring dates or route geometry.

### E. Guides, bilingual presentation and verification

- Each published record has a clear explanatory guide, source links at claim level, English/French terminology, scope/status labels and appropriate cross-links.
- French-world relevance is an editorial selection rule for *regional-custom discovery*, not evidence that a practice is exclusively French. Universal Catholic practice may be documented by French witnesses.
- Run schema/source audits; compare before/after IDs, counts, related-place relations, map evidence and search retrieval. Reject any migration losing provenance or editorial negative knowledge.

## Acceptance gates

1. 13 active customs appear as 13 default practice entries, while all 71 attestations remain retrievable under them and location-specific records retain their original IDs.
2. The 18 novena-context links remain reachable through search/calendar context without inflating the customary-practice count.
3. Selecting a source-backed example opens the correct shared Place profile; the 58 attested Place pins in the underlying source projection remain unchanged.
4. Global/general claims never generate an invented point; maps show source-backed physical places only.
5. No new parish, shrine, TLM venue, relic object or pilgrimage is asserted from proximity, similarly named institutions, or unreviewed research.
6. Registry consolidation begins **after** source-of-truth crosswalks are checked and the canonical browsing model is stable; do not bulk-import directly into the old geo-first lists.
