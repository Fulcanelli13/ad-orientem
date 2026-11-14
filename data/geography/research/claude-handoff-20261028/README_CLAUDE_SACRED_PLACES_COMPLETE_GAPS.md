# Ad Orientem Sacred Places — Claude bulk completion handoff
**Date:** 28 October 2026
**Mission:** Fill missing data now. Do not create another planning/review cycle. Do not acquire or evaluate images.

## Operating instruction
Work from this research branch: `research/sacred-places-p51-150-bulk-reconciliation-20261028`.
The previous work established a 750-candidate frozen historical inventory, including a 500-candidate acquisition subset. Latest working master: **322/750 linked to published canonical IDs**, **428/750 not linked**, of which **349/500 acquisition leads** remain unresolved. **512 published physical Places**, **810 typed source records**, **35 historical mapping-exception records (33 open)**. The first 150 priority cases have 17 research-level precise building candidates, while 34 high-priority cases still have no individual geometry review. These populations overlap: do not add 750 + 500 + 150 + 349 or assume all unlinked records are new sites. None of the 17 candidate features is authorized for release.

**Deliver a completed research dataset for ALL 750 candidate IDs**, with particular effort on the 428 currently unlinked, the 349 acquisition subset, the 34 priority cases still lacking feature work, and all mapping exceptions. Also discover genuinely missing distinct Catholic sacred sites when Catholic institutional directories reveal them. Do not stop at the 150-priority slice, do not stop after 100 records, and do not ask the user to review each batch. Process internally in 100–200 record batches, then provide one consolidated final result.

For the already-linked 322, preserve the exact crosswalk and add only demonstrably missing attributes. For genuinely new places, prefer a distinctive, source-backed canonical proposal. Existing canonical IDs must remain immutable. The whole task is **research-only**, not production publication.

## Authoritative input data (read ALL before editing)
- **Current 750-row frozen candidate master + 35 mapping exceptions:** https://github.com/Fulcanelli13/ad-orientem/blob/research/sacred-places-p51-150-bulk-reconciliation-20261028/data/geography/research/claude-handoff-20261028/sacred-places-r70-p56-candidate750-snapshot.v1.json
- **Output record and deliverable schema:** https://github.com/Fulcanelli13/ad-orientem/blob/research/sacred-places-p51-150-bulk-reconciliation-20261028/data/geography/research/claude-handoff-20261028/CLAUDE_COMPLETED_RECORD_SCHEMA.v1.json
- **P51 prioritized 150 source and identity register:** https://github.com/Fulcanelli13/ad-orientem/blob/research/sacred-places-p51-150-bulk-reconciliation-20261028/data/geography/research/sacred-places-p51-150-bulk-reconciliation-20261028.v1.json
- **P52 47 previously missing source URLs:** https://github.com/Fulcanelli13/ad-orientem/blob/research/sacred-places-p51-150-bulk-reconciliation-20261028/data/geography/research/sacred-places-p52-47-source-discovery-20261028.v1.json
- **P52 exact-feature checks:** https://github.com/Fulcanelli13/ad-orientem/blob/research/sacred-places-p51-150-bulk-reconciliation-20261028/data/geography/research/sacred-places-p52-five-geometry-feature-adjudications.v1.json
- **P53 15 already-live canonical crosswalks:** https://github.com/Fulcanelli13/ad-orientem/blob/research/sacred-places-p51-150-bulk-reconciliation-20261028/data/geography/research/sacred-places-p53-15-existing-place-crosswalks.v1.json
- **P53 3 building feature candidates:** https://github.com/Fulcanelli13/ad-orientem/blob/research/sacred-places-p51-150-bulk-reconciliation-20261028/data/geography/research/sacred-places-p53-three-disambiguated-exact-building-features.v1.json
- **P53 explicit incorrect-feature holds:** https://github.com/Fulcanelli13/ad-orientem/blob/research/sacred-places-p51-150-bulk-reconciliation-20261028/data/geography/research/sacred-places-p53-five-geometry-false-positive-holds.v1.json
- **P54 118-case typed physical site triage:** https://github.com/Fulcanelli13/ad-orientem/blob/research/sacred-places-p51-150-bulk-reconciliation-20261028/data/geography/research/sacred-places-p54-118-feature-gates-bulk-triage.v1.json
- **P55 86-case source and building-feature work:** https://github.com/Fulcanelli13/ad-orientem/blob/research/sacred-places-p51-150-bulk-reconciliation-20261028/data/geography/research/sacred-places-p55-86-source-join-and-building-gates.v1.json
- **P56 55-case physical site work:** https://github.com/Fulcanelli13/ad-orientem/blob/research/sacred-places-p51-150-bulk-reconciliation-20261028/data/geography/research/sacred-places-p56-55-physical-site-adjudication.v1.json
- **Canonical 512 published Place registry on main:** https://github.com/Fulcanelli13/ad-orientem/blob/research/sacred-places-p51-150-bulk-reconciliation-20261028/data/geography/seed-registry.v1.json
- **Canonical 810 source assertions on main:** https://github.com/Fulcanelli13/ad-orientem/blob/research/sacred-places-p51-150-bulk-reconciliation-20261028/data/shrines/source-registry.v1.json
- **Full native master workbook:** https://docs.google.com/spreadsheets/d/1UOIKCk4REJQYV_Q5AIDd82fJmAEWmgbgHYP-2-ZeSlU/edit — supplied as an exported `.xlsx` alongside this handoff if Claude cannot access the connected Google Sheet.
- **Research PR:** https://github.com/Fulcanelli13/ad-orientem/pull/1835 (draft, unmerged, existing source of P51–P56 research decisions). The workbook contains P55 and P56 tabs.
- **Separate overlapping P50 release PRs:** #1737, #1741 and #1743. Seven distinct proposed sites; they are NOT already published, and overlapping proposed IDs must never be summed.
- Respect and cross-check each original reference, citation URL, institutional site, candidate source, source registry record and geographic boundary.

## Specific columns to finish for EVERY site
Provide values, or an explicit `unknown` when unavailable. Populate the following and preserve existing values unless a stronger source demonstrates a correction:
1. Identity: frozen candidate ID; chosen official name and useful local-language aliases; exact matching canonical ID or proposed *new distinct* ID; denomination and whether Catholic today, historic Catholic, other Christian heritage, secularized, shared, or disputed.
2. Geographic identity: modern ISO country (separate from historical country), province/district, city/locality, actual street/site address when given, exact Catholic church/shrine/sanctuary/building/chapel/crypt/tomb name. If no street address exists, a source-backed map location is acceptable. Do not invent a street number.
3. Geometry: precise latitude/longitude if supportable, OSM type and ID, named physical feature, geometry tier (`EXACT_BUILDING_POLYGON`, `EXACT_BUILDING_NODE`, `EXACT_SITE_POINT`, `COMPLEX_OR_PRECINCT_ONLY`, `SETTLEMENT_ONLY`, `UNLOCATED`). Distinguish building footprint from land-use polygon, visitor centre, car park, nearby church, historic ruins or a multi-stop route.
4. **Google Maps click-through**: return a working Google Maps search URL based on supported exact coordinates/address; no fabricated Google Place ID. When the location is only an approximate precinct, label it as such rather than falsely claiming the front door.
5. Catholic context: Latin/Eastern Catholic rite where reliably known; diocese/eparchy; order/institute or congregation when reliably known; parish/shrine custodian; living pilgrimage site vs cultural monument/archaeology. Infer stable institutional facts from authoritative sources when sensible, **mark fields as inferred and assign confidence**. Do not guess current Mass schedule, miracle approvals, official basilica/shrine dignities or ecclesial jurisdiction.
6. Sources: authoritative custodian or diocese URL first, then government/heritage/OSM geometry link; any supporting secondary page; precisely state what each source supports, issuer, retrieval date, and source tier. De-duplicate sources and preserve historic source provenance.
7. Collision handling: match against all 512 canonical Places and 810 sources; return crosswalk, not a new pin, for any same physical entity. Keep nearby sub-sites separate where truly distinct; record parent complex and distinct child IDs.

## Research rather than endless verification
- **Fill gaps**. Work through all sites instead of generating batches of plans, exception-only memos, or asking permission for each group. Infer straightforward values where the institute, custodian or correctly named mapped feature is persuasive. Mark `INFERRED`, evidence URL and `HIGH/MEDIUM/LOW` confidence. No field should be left empty just because exhaustive certainty is unavailable.
- When exact church geometry is unavailable, retain best *supported* site-level GPS or address and label its precision honestly. This is a valid research completion, not a blocker.
- Record conflicts and uncertainty in the row and continue. Do not force ambiguous facts into `VERIFIED`.
- Prioritize meaningful missing data: identity, deduplication, country/address, precise site geometry, ecclesiastical type, source URL. Don't invest the whole budget hunting obscure ancillary metadata.
- Use official Catholic and heritage sources, Google Maps/OSM/Wikidata as corroborative mapping leads, targeted search in the local language, and Church/site directories. Do not assume search snippets alone prove a building footprint.
- Prove negative/confessional distinctions where needed: Church of England, Church in Wales, Church of Sweden, Lutheran, Coptic/Greek Orthodox, archaeological Catholic past; these may have Catholic *historical* relevance but cannot be labeled active Roman Catholic sites.
- No manual outreach to shrine administrators, churches, proprietors or photographers. No subscriptions, paid API, metered cloud, paid geocoding, copyrighted bulk imagery or deployment charges.

## Absolute image exclusion
**Do NOT search for, select, download, scrape, store, classify, deduplicate or license photos, paintings, maps-as-images, thumbnails or image URLs. Do not add photo columns or image-rights research.** OpenAI/ChatGPT will handle the whole image-acquisition and quality-selection program separately, after the structured registry is ready.

## Delivery contract — actual finished data, not a proposal
Follow the linked `CLAUDE_COMPLETED_RECORD_SCHEMA.v1.json`. Create a new branch from the P51–P56 research branch (e.g., `research/sacred-places-claude-bulk-completion-20261028`), then store in `data/geography/research/claude-completed/`:
- `completed_candidates.csv` and `completed_candidates.jsonl`: **750 rows / 750 unique frozen candidate IDs**, all relevant columns (even when unknown) with evidence and confidence.
- `new_sites.jsonl`: distinct new physical sites (not duplicates) found in Catholic institutional sources.
- `source_evidence.csv`: URL, publisher, exact claim, evidence tier, confidence, candidate ID.
- `canonical_reuse_crosswalk.csv`: candidate ID → exact existing canonical Place ID with reason.
- `geography_exceptions.csv`: disposition for all 35 historical exception records, including remaining unresolved cases.
- `field_coverage.json`: per-column counts and percentages of **explicit source-backed**, **inferred**, **unknown**, **conflicting**; denominators stated; 750/500/150 cohort boundaries and distinct new site counts.
- `unresolved_exceptions.csv`: only genuine residual ambiguity with concise next-source pointer.
- `summary.md`: sites added as *research leads*, existing canonical matches, fields completed, geometry tiers, source coverage, country/confessional corrections, remaining blockers.

**Acceptance checks:** 750 unique IDs; 500 acquisition subset preserved; 35 mapping exceptions accounted for; every row includes a disposition and confidence/evidence tier; no existing canonical ID changed; no duplicated canonical physical sites; no misclassified non-Catholic active sites; no fabricated Google Maps or OSM IDs; all inference flagged; no photo work; zero production mutations.

Do not write directly into `data/geography/seed-registry.v1.json`, `data/shrines/source-registry.v1.json` or the native live Google Sheet. Do not merge any PR or trigger production deployment. Submit the completed research as its own branch/PR. **We will perform the independent review and publication here after delivery.**

## Execution directive to Claude
**Proceed immediately with research and data completion, not review planning.** Continue until all 750 existing records have complete output dispositions and the 428 unlinked records have been researched to the best supportable geographic and institutional precision; use appropriate confidence and unknown labels. Do not pause after a batch to request user approval. Return one consolidated finished data package and its field-by-field coverage percentages. If tool/session usage runs short, preserve machine-readable completed rows and resume the remaining frozen IDs in the next session without restarting the research.
