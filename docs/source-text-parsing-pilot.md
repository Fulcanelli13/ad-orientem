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
