# GR1961 archival source screen — all 1,195 records (26 October 2026)

## Scope and distinction
The research-only 1,195-record archive has now been **screened in full** against the **same narrow 106-file pinned Latin Mass witness sample** at DivinumOfficium commit `ad8783641455bae38a8eb5782b34241a7b3ff2ef`. The remaining four original archive batches (records 401–1,195) were screened together rather than restarting the parallel 200-record research pipeline. Each of the 106 original source files was fetched and its Git blob SHA independently compared with the existing first-200 manifest.

This is **100% initial sampling coverage**, **not 100% verified liturgical or musical coverage**. The sample covers only selected Mass formularies and does not expand inherited sources, selected 1962 form, seasonal alternatives, Common sources or separately named pre-Gospel chant components. A negative hit here is **not** a rejection, and a positive occurrence here is **not** release approval.

## Latest 795 archival records

| Disposition | Records |
|---|---:|
| Pre-Gospel source-line candidates; segment unresolved | **138** |
| Introit/Offertory/Communion source-line candidates | **102** |
| No occurrence in the selected 106 files | **470** |
| Incipit too short for this word-matching screen | **85** |
| **Total** | **795** |

This adds **240** provisional textual candidates across **357** line occurrences, including **43** records occurring in more than one sampled source file. The four original archive batch results (3–6) remain separately reported and reconcile exactly.

## Overall archive progress
- Initial text source screening: **1,195 / 1,195** archival records (100% of this **limited sampled-source screen**).
- Provisional text-bearing candidates: **342** (first two batches: 46 + 56; remaining: 240).
- Unresolved without a selected-source textual identification: **853**. Preserve for broader source discovery, alternate source forms, and short-incitpit processing.
- Newly verified canonical 1962 reader assignments: **0**.
- New 1961 musical-facsimile/editorial approvals: **0**.
- New reader score promotions: **0**.

## Seven disputed earlier pre-Gospel records
Seven GABC incipit continuations previously differed from their sampled Proper excerpts: GregoBase **38, 56, 63, 134, 249, 329, 348**. Re-screening their longer GABC text openings against all 106 source files produces **one longer textual coincidence**: *Cor meum et caro mea exsultaverunt in Deum vivum* (GregoBase 63, catalogued office part `tr`) occurs in the **Communio** section of `Sancti/05-26` at pinned Latin source line **54** (9 normalized opening words shared). This is a **cross-role coincidence**: it cannot establish that a Tract is a Communion chant or assign its notation to that Proper. No five-word continuation matches for the other six were found in this **particular 106-file sample**. These remain unresolved, not missing from the edition.

## Reproducible assets and release boundary
- `gr1961-remaining795-latin-evidence.v1.json`: pinned 106 source blob identities; 357 individual source lines; seven-candidate continuation check.
- `gr1961-remaining795-source-review.v1.json`: one exclusive disposition for each of the remaining 795 archive records.
- `gr1961-remaining795-summary.v1.json`: batch-specific and aggregate counts, fixed scope, limitation warnings.
- `tools/mass/reconcile-gr1961-remaining795-latin-sources.mjs --verify`: validates original archive SHA-256, individual GABC SHA-256, source blob SHA identity, role membership, source line and incipit text, reconstructs 795 statuses, and checks deterministic report output. This does not independently re-download source bodies from GitHub.
- `tests/gr1961-remaining795-latin-source-screen.mjs`: denominator, corruption and fail-closed regression tests.

No production imports and **no** permission to claim musical identity. Keep PR #1749 in draft until its red acceptance gates are repaired and the verified promotion mechanism separately accepts candidate reviews.

## Next work — verification, not repeated screening
1. **Selected Proper**: reconcile 342 provisional text candidates against actual resolved 1962 Proper identities and source inheritance, including variants and Commons.
2. **Pre-Gospel**: apply the existing **three-language** source segmentation ownership gate before musical assignment; do not infer chant roles from labels or shared Latin phrases.
3. **Complete edition check**: inspect real printed Graduale Romanum 1961 pages and compare transcription melodic notation with the facsimile; retain precise reviewer/source provenance.
4. **Broader discovery**: seek correct source owners for 853 unresolved entries without automatically rejecting or releasing them.
