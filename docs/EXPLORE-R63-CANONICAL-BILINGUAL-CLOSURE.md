# Explore R63 — 58 source-enriched sacred Places

## Canonical closure
All **216 shrines** have English and French site narratives, and all **206 destination pilgrimages** have English and French pilgrimage-context paragraphs. The last 58 entries in each corpus were source-enriched instead of simply translated from generic placeholder copy. This pass rewrites 116 existing English/French original-language account fields and 116 corresponding French account fields (four fields per Place).

Six stronger official original-source hyperlinks replace reliance on contact pages for selected places (Notre-Dame des Victoires, Notre-Dame du Perpétuel-Secours, Montfort and Fleury). Existing registry source IDs are retained, and each new original URL is attached only to its exact canonical Shrine/Pilgrimage owner. See `data/shrines/research/explore-r63-source-enrichment-batch.v1.json` for 58 identity mappings and their original source hyperlinks.

## Curation rules retained
- Shrine history is separate from practices for pilgrims. These passages must never be identical English research notes.
- Apparitions and disputed relic identifications remain historically qualified.
- Westminster Abbey is an Anglican institution today despite its medieval Catholic pilgrimage history; Saint Titus at Heraklion is presently Orthodox despite its Latin-rite period. Neither is a present Catholic Mass provider merely because the physical place appears in the historical Place reader.
- The Fleury and Montecassino Benedictine relic traditions are distinct claims, not independent proofs of identity.
- Source links and physical Place IDs must stay exactly attached to their original owners. Registered HTTPS URL presence is not a guarantee of live site access; stale pages and present visitor rules require rechecking.
- No new coordinates, map pins, featured-place promotions, feast rules, TLM-directory links, tourism routing, or photograph approvals.

## Acceptance
The new `tests/explore-r63-source-enrichment.mjs` checks the entire 58-place ledger, 58 source-specific pilgrimage owners, paragraph provenance, source URLs, distinct English/FR copy and representative French Place reader renderings. The prior R61 and R62 gates remain active with non-regressive backlog assumptions. The canonical `tests/explore-surface.mjs` invokes all three.

## Next quality gate
A complete bilingual text corpus is **not** equivalent to independent editorial/source certification for every site. Continue checking unreachable or stale original pages, deeper devotional details and any rights-audited photography as separate review passes, without promoting uncertain content to a prominent featured reader.

## Ownership
Canonical data: `data/shrines/shrines-pilgrimages-seed.v1.json`. Existing source registry: `data/shrines/source-registry.v1.json`. R63 ledger is metadata only. Do not interfere with Bible Atlas integration or Mass ownership.
