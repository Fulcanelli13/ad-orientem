# Source-text bulk acquisition pivot — 15 October 2026

**Active PR:** [#1229](https://github.com/Fulcanelli13/ad-orientem/pull/1229) — draft, no production merge. **Fortescue manual page collation is FROZEN**. Earlier source-image findings remain valuable edition/locator regression fixtures; they are not the implementation's main path.

## Objective and present proof

Ad Orientem needs a **shared source library**, not 100s of critical print editions. Import **whole machine-readable works in single runs**, preserve edition/witness IDs, parse chapters/paragraphs and identify genuine exceptions. Reuse existing references from other pipelines; do not retell their interpretations or redo their verifications.

**First true whole-electronic-work demonstration delivered:** the historical English translation of Brother Lawrence, *The Practice of the Presence of God: The Best Rule of a Holy Life*, Project Gutenberg **#13871**, sourced from [pinned GITenberg commit a2c7fd57](https://github.com/GITenberg/The-Practice-of-the-Presence-of-God-the-Best-Rule-of-a-Holy-Life_13871/tree/a2c7fd571d9abbd9f35fa6e40eef2590630505a0). The complete **80,665-byte** original text and Gutenberg legal notice are preserved in `data/source-text/staging/brother-lawrence-pg13871-full.txt`.

- **22 structural units:** title/credits, preface, **4 conversations**, **15 letters**, and notes. All expected units and their order were found.
- **182 paragraphs**, **11,024 whitespace-delimited words** parsed in one run.
- **182 B-rated** passages (machine-readable, not independently proofread); **0 A** (edition-and-passage independently verified); **0 C** OCR risk on this electronic witness by current heuristic.
- **31 batch exception records:** 22 chapter-level reminders that ordinal paragraph locators will change if the source is resegmented; 9 short-paragraph inspection leads. **This is not 182 manual page-verification tasks.**
- Complete textual **source body** retained in staging, while `data/source-text/staging/brother-lawrence-pg13871-index.v1.json` is a **metadata-only index with no source passage bodies**; author/work/edition/witness, per-section passage IDs, grades, word counts and noncryptographic fingerprints retained.
- Explicit **no-production** policy. The Gutenberg listing marks #13871 public domain in the USA, but its digital text has a named publisher and untranslated provenance limits; printed translation edition and distribution compliance are not claimed globally. Its Gutenberg notice stays intact. **Do not use copyrighted edition Gutenberg #5657 edited by Lightheart**; this is a different source.

## Live execution (no special tool / human transcription per page)

Run from the repository root:

```bash
node scripts/source-text-bulk-ingest.mjs data/source-text/bulk-jobs.v1.json
```

Optional metadata-only report, under staging:

```bash
node scripts/source-text-bulk-ingest.mjs data/source-text/bulk-jobs.v1.json --out data/source-text/staging/bulk-report.json
```

Add further jobs in `data/source-text/bulk-jobs.v1.json`. A job must identify exact work, edition and witness, expected chapter IDs in order, and a complete source file (or local chapter files). The runner refuses missing/extra/reordered chapters as structurally complete; it raises OCR character faults and similar exceptions. Raw source text is not present in the exported `INDEX_ONLY` report. A source that merely lives on a website does not acquire reproduction rights from this parser.

`src/source-text/bulk-import.js` offers `stageBulkWork()` and `summarizeBulkStages()` for future batch adapters. The A/B/C ratings govern **the individual passages**, not an entire book. A = exact verified witness passage with documented editorial review; B = machine readable, suitable for discovery, navigation and carefully caveated contextual reading if rights allow; C = suspicious OCR held for correction. New exact quotations require **A**; rights clearance is separate even for A. Short or unstable ordinal passages are flagged in exception queues. Chapter IDs are tied to a pinned digital edition; ordinal paragraph anchors are **not guaranteed stable across source updates**.

## No duplicate import / cross-pipeline register

`data/source-text/bulk-reconciliation.v1.json` cross-checks the actual existing repository inventories:

| Source ownership | What already exists | Our action |
|---|---|---|
| Canonical work registry | **13** work identities | Keep authoritative registry, do not supersede |
| Additional source discovery | **10** proposed identities | Queue for whole-work edition/source acquisition |
| **Catena Aurea**, Scripture | **814** pericopes and **12,692** attributed fragments, four Gospels | Reuse existing chunked corpus, do not import again |
| Formation | **141** canonical dossiers, **408** scoped source bindings and **304** URL witness identities | Reuse exact scoped binding IDs; do not treat URLs as verified author/edition identities or as publication approval |
| 1962 Mass engine | Independent existing 65-card implementation | Never reorder cards, alter rubric cues or replace live content from an old historic source |
| Scripture and Rosary | Existing Bible reader and Rosary references | Use canonical owners' IDs, no second reader |
| First bulk pilot | **1 new electronically complete historical work** | 22 units / 182 paragraphs staged, no live text |

The 13 canonical, 10 proposals and 1 new staged work are **24 distinct work IDs in this scoped reconciliation snapshot**; this is not the number of all possible Catholic authors, total app resources, or approved readable books. Existing Catena fragments and Formation links are *not* counted as new imports.

## What remains

1. **Bulk-acquire the next full digital sources** with verified edition/translator/provenance and source or licensing status. Prefer already-structured local chapter files or old public-domain editions. Avoid unverified scans until necessary.
2. **Passages and IDs:** convert review-qualified source locators to stable chapter/paragraph IDs, rejecting undifferentiated page IDs and unstable auto-generated external links. Prioritize only passages actually linked to claims in Mass or Formation.
3. **Connect, do not duplicate:** use a non-destructive mapping `canonical source binding → edition witness → passage locator`, with original-context flag and owner/source attribution. Do not move Formation research ownership into this pipeline.
4. **UI:** provide lightweight source attribution, read-further links and optional text/chapter open. The app should not show 100s of bibliography entries or bulk OCR bodies by default.
5. **Exception-led review:** source verification budget is driven by serious text anomalies, high-value quotations, and passages supporting material claims, not the number of scanned pages. A full-book B grade is useful, not equivalent to all passages verified.
6. **Publication:** PR remains draft, the full PG source stays staged, and existing live apps/modules remain unchanged until a separate integration review.

**Current technical verification:** ten native Node 22 suites including one real complete electronic-work stage, a 2,000-paragraph synthetic stress test and cross-pipeline reconciliation. Passing tests validate structure, identity and protection policies, not the accuracy of original printed editions.
