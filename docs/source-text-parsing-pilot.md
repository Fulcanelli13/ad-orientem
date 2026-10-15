# Source Parsing & Interactive Reading — independent pilot

Scope: this pipeline is complementary to the other Ad Orientem pipelines. It does not modify Mass, Formation, Calendar, Prayer, Scripture, Explore, their research, or their user interfaces. None of the new source-text modules are imported by a production route.

## Deliverables

- data/source-text/work-candidates.v1.json holds 13 metadata-only references to the canonical works pilot in separate PR #1212. The original work/edition/witness/source and rights decisions remain with the reference pipeline. No third-party text has been copied.
- src/source-text/contracts.js requires work, edition, witness and explicit editorial reproduction status. Undecided copyright and translation rights block parsing or packaging.
- src/source-text/parse.js implements conservative, deterministic limited clean HTML and plain-text extraction, preserving sections, paragraph/list/quotation locators and source identity. Unsupported markup fails closed. This is not arbitrary HTML scraping or PDF OCR.
- src/source-text/package.js produces independent per-work manifests and numbered passage chunks. The initial index is text-free.
- src/source-text/reader.js provides passage lookup, next/previous and metadata-only search without fetching body chunks. Full-text search loads text only on an explicit request and caches chunks within the current session.
- previews/source-text-parsing-pilot.html is a standalone browser demonstration, NOT an app page, using seven project-authored passages across three chunks.

## Source identity, rights and editorial control

An edition-specific work identifier, edition identifier and specific textual witness travel with each passage. The default locator combines named section and paragraph ordinal. Future production works with stable original anchors should use data-source-anchor or a reviewed migration table: insertion of paragraphs otherwise changes some generated IDs.

PROJECT_AUTHORED_DEMO requires demoOnly=true and is not approved as published catechetical or historical content. REPRODUCTION_CLEARED with an explicit review ID is an editorial gate, not automatic legal proof: the source-owning editorial process must genuinely verify language, specific edition, copyright and any translation rights.

Existing third-party scans, papal texts, catechisms and spiritual works remain metadata-only until the appropriate permission/edition and passage checks are completed. URLs and author death dates alone never clear reproduction rights.

## Interaction and size

Other pipeline owners can optionally request a precise passage, continue reading and return to their existing screen. This pilot registers no global route, changes no app module and adds no second Bible engine. Commentary has separate authorship and claims; it must not be inserted into a primary-text paragraph.

The demo is small. Manifest and chunk byte counts are reported to show the separation of initial metadata from body fetches; those numbers do not establish whole-app speed improvement. Future milestones should measure gzip transfer, cold startup, caching, request count, peak memory and offline behaviour on representative books. Full-text search currently scans chunks only when selected, and needs an optional remote or downloaded index for very large corpora.

## Verification

Run: node tests/source-text-pilot.mjs

The dedicated source-text pilot workflow executes that check in Node 22. Required tests cover deterministic IDs across equivalent clean HTML/plain-text, CRLF normalisation, byte-identical generated chunks, rights gate, malformed HTML rejection, chunk/edition integrity, precise passage opening and lazy loading. Do not merge or connect to live routes before source-owner agreement, user review and browser/mobile acceptance.


## Phase 2 — acquisition discovery and synthetic scale validation (15 October 2026)

**Work discovery is not text acquisition.** `data/source-text/acquisition-expansion.v1.json` references the existing 13-work candidate inventory without overwriting it and nominates ten *additional* works for canonical-owner review. The ten are prospective IDs only, not certified common work IDs or full texts. Evidence pointers refer to existing Mass, Formation and reference research. Proposed Denzinger work identity deliberately leaves its edition, revised numbering and DS/DH concordance unresolved. The two Hume works remain distinct opponent originals. Fortescue's historical study must not be confused with his ceremonial handbook.

Four **reuse** decisions prohibit duplicate packs: (1) Scripture and its 73-book edition-specific system, (2) existing Catena Aurea pericope/father chunks, (3) 200 Rosary source references with collation holds and (4) Formation's existing scoped source/witness crosswalk. Formation's 304 URL witnesses are *not* 304 distinct books, textual editions or authorised reproductions. No existing owner module, production route, or prayer body is modified.

`src/source-text/edition-adapters.js` is a strict preparation layer for **human-inspected local extracts**, not a general web scraper and not PDF/OCR. All adapters require a matching, explicit work+edition+witness identity, rights review ID, source document ID and passage collation review ID. They are:

- `numbered-paragraphs-v1`: named headings plus explicit `[paragraph-key] Text` lines, with stable section-relative source anchors.
- `anchored-clean-html-v1`: curated clean HTML where every passage element has a reviewed `data-source-anchor`.
- `reviewed-plain-sections-v1`: headed text, explicitly acknowledging `ORDINAL_REVIEWED` locator stability (IDs may move if lines are inserted).

None of these names confers approval on a particular publisher's edition. A proposed papal original, Denzinger printing, Thomas Aquinas question/article translation, Guéranger volume or scanned ceremonial manual requires a separate acquisition and rights/collation decision from its owning pipeline **before** loading its actual body text. The parser itself cannot grant that decision. Keep a printed page/paragraph/Q&A locator separate from a host URL, and never merge translations or versioned doctrinal numbering under one textual witness.

### Synthetic scale regression and limits

Run both `node tests/source-text-pilot.mjs` and `node tests/source-text-acquisition-scale.mjs` (dedicated Node 22 PR workflow). The added suite generates **1,200 entirely synthetic passages** across **24 logical sections** and packages them into 24 chunks. It tests stable explicitly anchored IDs after an insertion, metadata search with zero chunk loads, first passage with one chunk load, first chunk reuse, opt-in full-text requests, mismatched review/edition rejection, denied rights, unsafe markup and missing anchor failure. The test prints actual uncompressed metadata and passage-body byte counts at runtime.

These tests do **not** certify actual larger works, support for raw Vatican/CCEL HTML structures, OCR, scholarly apparatus, browser rendering, low-memory phones, full-text indexing at corpus scale, offline caching or production app performance. Browser/mobile acceptance, real edition adapter fixtures (only after rights clearance), gzip/network cold-start profiling and provenance review are still required. Do not merge this draft PR on synthetic tests alone.
