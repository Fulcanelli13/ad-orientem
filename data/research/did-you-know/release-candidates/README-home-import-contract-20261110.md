# Home Did You Know — 526-card preview import contract (research only)

**Status:** PREVIEW/STAGING ONLY. This folder contains a display-model proposal with all release flags false. It is deliberately not imported, fetched or referenced by any live Home reader module. The staging data is not a publication file.

## Current application structure inspected on `main`

- `src/home/did-you-know-glossary.js` renders the Home button/card, loads approved banks, rotates by `dykHomeRotationSlot(date,...)`, and renders a fact and broad topic label.
- `src/home/dyk-published-feed.js` maintains existing published selection loaders, rendering and source modal. It verifies `editorial_approval`, `release_authorized`, bilingual signoff, semantic novelty, source references and (for some sub-banks) per-day publication scheduling. Other released banks use additional source-specific hard gates; do not bypass any of them.
- `data/did-you-know/*.json` contains actual release artifacts. A candidate record in `data/research` does not become a live fact just because it has bilingual copy or a Claude KEEP/REWRITE verdict.

## Mapping from editorial staging

| Preview property | Candidate CSV | Master CSV |
| --- | --- | --- |
| id | Fact ID | Identical Fact ID (immutable) |
| proposed_title.en / fr | Title EN / FR proposed | Original topic remains preserved only in master |
| proposed_copy.en / fr | English / French card text | Original Draft EN / FR preserved in master |
| interest_tier / score | Interest tier / Interest /5 | — |
| editorial | Claude verdict, Copy basis, Editorial caveat | — |
| research_provenance | — | Track, Origin ID, scope, source IDs, URLs, locator, source record path |
| release_gate | All false | No ownership or source clearance inferred |

## Preflight findings

- **526** display previews: **332 priority / 194 reserve**; **360 KEEP / 166 REWRITE**.
- Original IDs and bilingual proposed titles/text are complete for all 526.
- **88** master rows have an empty source folio/locator. This includes potentially normal HTML sources as well as unresolved evidence gaps: do **not** treat all as invalid or automatically mark any as verified.
- **222** source URL fields contain a PDF URL string; **304** contain other URL strings. These are unverified link shapes, not source checks.
- **5** cards have explicit proposed copy adjustments. The title `Lavabo` appears on two distinct candidate IDs, `DYK-GX14-013` and `DYK-GL-G216-01`.

## Future integration — only after owner selects and approves a batch

1. Record an explicit owner approval decision per immutable Fact ID; resolve copy proposals and collision titles.
2. Perform the appropriate primary-source, bilingual and semantic checks independently of Claude's editorial exercise; never infer `source_reference_checked`, `semantic_novelty_approved`, or final signoff from `KEEP`.
3. Implement one common candidate feed adapter or a specific release-bank adapter with **fail-closed** per-record gates. Do not change the behavior of the existing published banks or fallbacks.
4. Pass the canonical ID into the same `dykHomeRotationSlot` candidate pool after all gates pass. Ensure EN/FR title and copy reflect the reviewed selection; provide correct origin/source link behavior in the detail modal. Avoid source-author names in reader-facing card text.
5. Test language switching, missing-source fallback, mobile rendering, deterministic rotation, no duplicates and withheld-approval rejection. Release only through GitHub Actions/Pages after explicit owner signoff.

**Never attach this research preview to `src/home/dyk-published-feed.js` or `src/home/did-you-know-glossary.js` before approval.**
