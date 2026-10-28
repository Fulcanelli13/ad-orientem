# Sacred Places P60 — Claude completed-research import

Imported: 2026-10-28. This is a **row-preserving research import, not a production release**.

## Ground truth and inventory

All **nine user-provided files** are stored in this folder in UTF-8 text, with the original 750-line completed JSONL split in order into six **125-row** shards to stay within the GitHub Contents API size limit. These shards reconstruct the original logical record sequence; the original attachments remain the source-of-record for byte-exact hashes (line endings may be normalized by the connector).

- `claude-completed-candidates.csv` — original field contract, 750 rows;
- `claude-completed-candidates-shard-01.jsonl` through `-06.jsonl` — original completed record objects, 125 each;
- `claude-new-sites.jsonl` — 302 **proposed** distinct sites, not all releasable;
- `claude-source-evidence.csv` — 1,778 individual source records;
- `claude-canonical-reuse-crosswalk.csv` — 417 screening rows: 322 frozen links, 34 proposed usable place links, 61 other nearby/distinct context rows;
- `claude-geography-exceptions.csv` — all 35 historical cases retained as research-only;
- `claude-unresolved-exceptions.csv` — 81 blocker entries covering 80 candidate IDs;
- `claude-field-coverage.json` — full explicit/inferred/unknown/conflicting splits, five cohorts;
- `claude-source-summary.md` — Claude's original claims and cautions.

The original attachments' SHA256 hashes are recorded below to allow byte-level provenance checks against externally held originals. Repacking or line-ending normalization does not rewrite the source facts.

| Original uploaded file | Original SHA256 |
| --- | --- |
| `completed_candidates_3.csv` | `62ec194a501b362e74bb340e562d3f70070e0bc981523be2db02a4fd43adbd8c` |
| `completed_candidates_3.jsonl` | `6d90a02d510b2d30175814cf863faa6e59cb92c91b1f5743cfd54aa552ec9391` |
| `new_sites_3.jsonl` | `0f35ed00d9f126d680610bd590cf981a12bc3db201ff4f66b7e45bcc3fdb2b35` |
| `source_evidence_3.csv` | `837fadc95fff7f740f1a1b35ae763e13b09eedb603b35379f47a2c538d4724c8` |
| `canonical_reuse_crosswalk_3.csv` | `72d34606aa322dc3498ce6c47e0c5865d345432d009be285f026c13b73933022` |
| `geography_exceptions_3.csv` | `6dde6595f9d6c2e9d331a23058e1c12294ebf127e4103ba9f6387c66d73a9f27` |
| `unresolved_exceptions_3.csv` | `67a5f9e1807c1e2166aa0a1e3dc3d125c0cac84b71855ead6aa6f976d5fb3500` |
| `field_coverage_3.json` | `f109171dcabf82ff4bd0628cc055ab622105a5d7c6f37f08273eb860a468e6ec` |
| `summary_3.md` | `e995a62ad04b4c03b7efb7f4474a93bfb1d431bdfd84a2565f6f442d64329cbf` |

## Correct interpretation of the new data

- 750/750 frozen IDs preserved, including the historically frozen `SG-NEW-VARALLO` and `SG-NEW-MONTSERRAT-COVA` IDs. No `SG-INV-0749` or `SG-INV-0750` existed in the frozen snapshot.
- 707/750 coordinate pairs present, including 385/428 formerly unlinked. **None of the 707 coordinates constitutes a verified footprint simply because a Plus Code or map link exists.**
- 322 frozen canonical reuse links valid on main, **34 more proposed** by Claude; 8 of the 34 overlap previously reviewed P59 proposals. The full 356 is a *source proposition*, not an authorized deduplication total.
- Crucial error: `SG-INV-0049` (Basilica of Saint John Lateran) is incorrectly proposed for `place:IT:scala-santa-rome`; nearby **Scala Santa** is a distinct building. This proximity-based match must be **rejected**, not silently carried into production. Roman diocesan records identify separate addresses.
- Some proposed distinct sites overlap one another: `SG-INV-0437` and `SG-INV-0441` are the Atotonilco sanctuary, not two independently certified new churches. The other flagged pair groups require identity review.
- Among 302 new-site rows, **27 have an OSM building/node feature reference**, while the rest mainly have site, settlement or complex coordinates. **27 are only geometry candidates** until geometry/subject QA passes.
- 252 of the 302 lack any A/B-tier evidence in their embedded source_refs; many rely primarily on GCatholic (C-tier). A/B status is not a substitute for checking physical identity.
- 43 lack coordinates; 33 have uncertain Catholic identity; 81 exception entries cover 80 unique candidates because some categories overlap.
- **No photographs** are included; image acquisition remains owned by the existing approved place-media pipeline. No direct publication edits or fees.

## Release strategy

1. Preserve raw imported evidence and separate corrected *review decisions* in `p60-reconciliation-release-gate-audit.v1.json`.
2. Review 34 proposed canonical reuses. Eight were already researched in P59; reject the Lateran/Scala Santa false merge and independently assess the remaining 25.
3. Crosscheck 27 named OSM features against exact church geometry, denominational identity, source object and the 512 live Places; produce a separately authorized production PR only for eligible sites.
4. Resolve the four known duplicate clusters, 43 missing-location and 33 uncertain-Catholic queues without adding speculative pins.
5. Run the separate existing Wikimedia Commons acquisition and approved-asset editorial pipeline for exact-site photographs. Do not link unlicensed/staged media.

Nothing in this branch changes `data/geography/seed-registry.v1.json`, approved media or live Explore.
