# Ad Orientem — Item-Level Content Recovery Census, v1

**Date:** 9 October 2026  
**Working PR:** [#737 — Architecture registry](https://github.com/Fulcanelli13/ad-orientem/pull/737)  
**Master index:** [`data/app/content-item-census.v1.json`](../data/app/content-item-census.v1.json)  
**Navigation and ownership register:** [`data/app/content-navigation-registry.v1.json`](../data/app/content-navigation-registry.v1.json)

This census inventories GitHub **source identifiers** and identifies their owners, source selectors, publication classification and provisional navigation. It is **not** a declaration that every item is published, fully sourced, independently certified, user-accessible, or unique substantive content. These files do not change the runtime, layout, database or global ribbon. Inputs were read from the evolving `main` in batches during 9 October, not as an atomic immutable repository snapshot; run the contract test and compare source-file changes before merging.

## A. Inventory results: 3,849 unique typed identifiers

| Shard | Items | What those identifiers actually mean |
|---|---:|---|
| Prayer | 100 | 48 core prayer objects, 16 novenas, 14 Stations stages, 20 Rosary mysteries, 2 registered devotional programmes |
| Formation + recovery | 860 | 60 APOL dossiers, 81 CR dossiers, 433 Catechism English-question witnesses, 54 archival lessons, 55 proposed lesson-order entries, 123 research evidence records, 14 Spiritual Life lessons, 40 Latin lessons |
| Sexual Ethics | 255 | 150 questions, 50 navigational topic projections, 55 advanced debates about those same questions |
| Reference | 1,030 | 450 glossary concepts, 350 Latin lexemes, 80 phrases, 146 glossary bibliographic records, 4 disabled Scripture-edition catalogue entries |
| Explore | 1,282 | 181 places, 41 geographic areas, 177 shrines, 205 pilgrimages, 20 routes, 77 temporal links, 32 apparitions, 121 relics, 13 customs, 71 attestations, 9 directory-place links, 335 bibliography records |
| Apostolate | 45 | 36 scenarios in 6 families and 9 practice skills |
| Directory — deliberately partial | 277 | 243 provider rows from five feeds/snapshots, 20 communities and 14 source records; **not a deduplicated worldwide venue register** |
| **Total source identifiers** | **3,849** | **Not a count of unique public modules or approved standalone articles** |

The corpus IDs were verified to be globally unique at the typed-inventory level. Where an item belongs to a specialised source registry, its original upstream identifier and source index are preserved. Retired and unpublished items remain nonpublic; the index is editorial tooling.

## B. Genuine recovery findings

### 1. Formation has a publication and ownership problem, not a mandate to add 141 menu entries

The canonical register preserves **60 Apologetics** and **81 Church Crisis** titles. They are still not approved public modules. The 123-entry source/claim review ledger links to **53 distinct canonical APOL/CR dossiers**, leaving **88 dossiers not linked by that particular ledger**. This is not proof those 88 lack sources or material elsewhere. Four research records correctly point to Catechism or sacramental-formation owners rather than being forced into APOL/CR.

**Action:** Review the canonical owner for each of the 88 and crosswalk original records, other source registers, English/French claims, and actual proponent attribution. Publication only after dossier-level factual/source certification. No creation of replacement questions from a theme-band title.

### 2. Catechism materials are overlapping teaching variants, not separate complete textbooks

The source repository contains **433 St Pius X English witness question records**, **54 preserved Learn the Faith lesson IDs**, and a **55-title candidate teaching order**. The latter is explicitly a proposed editorial presentation, not 55 new certified lessons to count in addition to 54.

**Action:** Keep one Catechism doctrine owner and one native reader, with Daily Study and (when approved) a Guided Study projection. Reconcile the original wording, full question pointers, translation and claim-level source before enabling new lesson paths.

### 3. Sexual Ethics has one canonical subject owner but multiple deliberate reading depths

All **150 questions map to one of 50 canonical topic projections**. There are **55 expanded debate overlays**; these are deeper presentations for existing questions, not an independent second 55-question subject bank.

**Action:** Keep compact everyday answers prominent; show source-backed opposing arguments and responses only on demand. Audit the correctness of original source context separately from syntactic integrity. The current index does not mark the debate corpus fully independently certified.

### 4. Scripture and reference material need better shared discovery

The source describes **450 glossary concepts**, **350 Latin lexemes**, **80 phrases** and **146 glossary source records**. The four Scripture catalogue editions remain disabled for local full-text reading at this snapshot. A Scripture reference capsule may function without a fully enabled locally installed edition.

**Action:** Offer one contextual reference layer throughout Mass, Pray and Learn. For Scripture, label edition, numbering and available full text accurately; show a verified external reading source when local text is not enabled. Do not create duplicate Bible/glossary readers in each module.

### 5. Prayer already has a substantial coherent underlying corpus

The inspected source contains **48 named prayer objects, 16 novenas, 14 Stations and 20 Rosary mystery entries**, plus First Friday and First Saturday programmes. Distinguish the **15 traditional mysteries** from five later optional luminous mysteries; neither set should be silently described as the same historical structure.

**Action:** Inspect actual mobile discovery and presentation. Keep Rosary, Stations, Adoration, Confession and novena-specific workflows while sharing prayers, translations, citation controls and return-to-origin navigation. Do not manufacture additional Prayer hub cards because a text has its own ID.

### 6. Explore references are connected, not a series of unrelated duplicate maps

The inspected seed contains **181 canonical places** with 177 shrine records, 121 relic records, 32 apparition records, 205 pilgrimage records and separate customs, routes and source relations. The source-level relationship test found **zero missing referenced places for shrines, relics and apparitions**, zero unresolved pilgrimage destination shrine IDs and zero unowned custom attestations.

The already-published 39 principal relic sites and 19 second-wave sites were found in the existing loaded place/shrine/relic seed by matching IDs in the prior census. **Do not import them again.**

**Action:** Improve place-centric discovery and source verification. Treat physical location, relic claim, apparition-recognition status, public access, pilgrimage route and traditional Mass schedule as distinct attributes. A place profile can show all relevant associations without copying the source record.

### 7. Apostolate is a separate practice engine but belongs within Learn's journey

The inventory records **36 scenarios** and **nine general skills**. They are already grouped by response/help/introductory needs and provide contextual handoffs. They should remain an interactive practical experience rather than a duplicate catalogue of Apologetics questions.

**Action:** Present as **Learn → Putting Faith into Practice**. Link to canonical doctrine when available; keep unpublished dossiers gated.

## C. Directory completion is explicitly excluded from any 3,849-item "full content" claim

The directory is changing rapidly in another research pipeline. The current inventory contains **243 provider rows** from selected ICKSP, IBP, ICKSP-federated, diocesan and SSPX snapshots, not 243 confirmed unique Mass destinations. The FSSP original venues feed exceeds 1 MB and could not be reliably ingested with the available text connector; overlapping SSPX historical providers likewise require dedicated source-to-venue deduplication. Directory global completeness therefore remains **not verified**.

**Action:** Reuse the independent worldwide matrix and canonical directory contracts. Only import after authoritative ministry, physical venue, geo-precision, schedule and original-source review. Do not equate the presence of a row or a map point with a verified current Mass.

## D. Publication, route and ownership discipline

Each shard item has an exact identifier, content kind, source path, source selector, owner, publication classification and `browser_verified:false`. The master index maps each kind to a candidate/current source-level entry point, including intentionally null entry points for unpublished material.

One source item may have multiple contextual entry points, but only **one canonical content authority**:

- Calendar: dates, ranks, commemorations, transfers and programme timing.
- Mass: rite, Proper, liturgical rubrics, postures and execution; preserve R17 native.
- Pray: prayer texts, devotional execution and programme progression.
- Catechism: positive doctrine; Learn the Faith is a pedagogical projection.
- Apologetics / Church Crisis / Sexual Ethics: distinct debate owners; one reusable debate renderer may serve all three.
- Scripture / Glossary: shared references, numbering, edition and semantic definitions.
- Explore: place identity, mapped relationships and customary attestations.
- Directory: verified Mass schedules, communities and ministry relationships at a physical venue.
- Apostolate: practice scenarios and conversational guidance, not a doctrinal duplicate.

**No global navigation change is approved by this census.** The proposed five destinations (Today, Mass, Pray, Learn, Explore) still require native-phone navigation testing and retention of old links. Calendar must remain directly findable from Today, not hidden in another home dashboard.

## E. The next implementation order

1. **Content index integrity (this PR):** maintain and validate the seven typed shards, their cross-module entry-point contracts and the primary family-level registry.
2. **Resolve the 88 APOL/CR ledger-unlinked dossiers:** compare other research packs; preserve exact original quotations/positions and evidence grades; no unsourced public content.
3. **Reconcile 54 archival vs 55 proposed Catechism lessons:** maintain one doctrine owner and certify any source-first Guided Study text before publication.
4. **Directory source reconciliation in its own pipeline:** do not insert raw, overlapping provider rows as canonical worldwide venues.
5. **Mobile discoverability acceptance:** exercise public deep links, Prayer families, Formations routes, Explore lenses, Scripture context and return-to-origin in French/English.
6. **Consolidate presentation after those acceptance reports:** shared reference panels, search/discovery and changed global ribbon under a *separate* PR, preserving Calendar and Prayer owners.

## F. Verification

A cross-shard data inspection inside the connected GitHub work session verified 3,849 globally unique IDs, required source/owner fields, zero orphaned indicated Explore relations, and 150 Sexual Ethics question-to-topic assignments. The dedicated repository test is [`tests/content-item-census.mjs`](../tests/content-item-census.mjs). **That Node test has been added but not locally executed; actual phone and bilingual browser acceptance have not been performed.**

This is a useful and extensive **current-main inventory of major leaf corpora**, but not yet a complete archived-repository history, not a verified universal liturgical-day/Proper matrix, and not a certified worldwide Mass directory. All such coverage gaps remain explicit in the machine-readable master index.
