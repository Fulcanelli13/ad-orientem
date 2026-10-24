# Pitrè 1900 — Wave07: all 60 chapters represented in the canonical research workbench

**24 October 2026. Draft PR #1572. Research-only integration; not a Calendar or customs publication.**

## Atomic research integration result

| Measure | Wave04 baseline | After Wave07 | Change |
|---|---:|---:|---:|
| Cross-source research source/detail rows, undeduplicated | 3,512 | **3,644** | +132 |
| Original 1900 Pitrè source/detail rows | 527 | **659** | +132 |
| 1900 numbered patronal chapters with indexed original-edition observations | 31/60 | **60/60** | +29 chapters |
| Chapters claimed exhaustively mined | 0 | **0** | 0 |
| Working practice proposals | 408 | **408** | 0 |
| Verified new unique customary identities | 0 | **0** | 0 |
| Newly authorized Roman Ritual formulae or approved modern Calendar entries | 0 | **0** | 0 |
| New app / Calendar publication | 0 | **0** | 0 |

## Method and counts

This pass promotes *source-observation staging into a noncanonical research catalogue* only; it does **not** promote any observation to a verified unique practice or publish a custom. Exactly **132** provisional Wave05 observations, each assigned its own stable ID `PIT1900-W05-OBS-001` through `PIT1900-W05-OBS-132`, were appended to `external_source_observations_pitre_original_1900_wave05` in the existing unified workbench. All 132 had pre-existing page, source and Italian-text evidence in Wave05. They come from **29** distinct chapter identifiers absent from the previous indexed-corpus census, so the 60-chapter inventory now records evidence at every numbered chapter. The **63 held leads** remain excluded.

The original 1900 compressed facsimile checksum remains `100e2b3164bd7a342c5c0c5d01df2a60b4635d5695dea456e9b93769866ee5ee`. The Wave06 review rendered the 105 Wave04 and 132 Wave05 source regions and inspected them in 20 contact sheets. This *does not equal whole-folio image certification*. Wave05 had three imperfect original OCR anchors; the exact PDF-text-layer replacements were adopted in the new workbench records without altering earlier intake evidence:
- `PIT1900-W05-OBS-007` — dropped intervening OCR punctuation;
- `PIT1900-W05-OBS-072` — distorted OCR punctuation around *S. Giorgio*;
- `PIT1900-W05-OBS-093` — corrupted page heading prefixed to otherwise genuine source passage.

Each newly indexed workbench row explicitly retains `individual_page_image_visually_certified:false`, `independent_source_certified:false`, `rite_approval_certified:false`, `current_calendar_continuity_certified:false`, `unique_custom_identity_certified:false`, `working_master_owner:null`, `publication_state:RESEARCH_ONLY`. These prevent a historical description of blessed objects, a popular supernatural belief or a feast-day account from being misrepresented as a verified present Roman rite or ecclesiastically approved practice.

## Updated source of truth

- `data/customs/master/comprehensive-customs-working-catalogue.v1.json` — 132 rows added in a new explicitly noncanonical observation array; previously indexed row IDs and groups preserved; counters corrected to 3,644 and 659.
- `data/customs/master/pitre-1900-complete-60-chapter-source-coverage-inventory.v1.json` — retains historical Wave04 status for comparison, adds an explicit `coverage_after_wave05` status to every one of 60 chapters; 29 new sections marked as having research-source records.
- `data/customs/master/pitre-1900-wave06-237-image-preview-review-and-3-anchor-corrections.v1.json` — source-image preview and corrected Italian locator provenance.
- `tests/customs-pitre-1900-wave07-132-catalogue-integration.mjs` — asserts individual record nonloss, 132-ID noncollision, unchanged 63 held leads, 60/60 represented, 0 full chapter exhaustions, zero identity or app promotion.
- `tests/customs-full-registry-census.mjs` and the earlier Wave04 test — updated current aggregate counts while preserving previous batch-level historical subcohort checks.
- `.github/workflows/customs-master-integrity.yml` — verifies the Wave07 integration with CI.

## Remaining gates

The original-book **chapter-entry coverage gate is now complete (60/60)**; *page-by-page exhaustion is not*. Later research should focus on systematic passage completeness for all chapters and the 63 exceptions, source dependency and theological/ritual boundary checking, and exact distinct-action deduplication. Do **not** open a new Calendar module or publish folk-efficacy and blessing claims as valid Catholic rites.

No paid archive/storage, no Mass reader change and no calendar architecture change. The in-app customs experience remains context-sensitive within the already built Ad Orientem Calendar.
