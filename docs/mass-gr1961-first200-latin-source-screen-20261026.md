# GR1961 — first 200 GABCs × pinned Latin Mass-source review

26 October 2026. A research screen on the **existing** permanent 1,195-score
archive. This does not amend the Calendar, the canonical 1962 reader Proper,
the Schola clock or the promotion registry.

## Frozen input

- Ad Orientem: `data/mass/chant-corpus/gr1961-proper-001.json`;
  **200** authentic source-linked research GABCs, covered by the existing
  `gr1961-proper-index.json` SHA-256 manifest.
- Original Latin witness repository: `DivinumOfficium/divinum-officium`,
  pinned commit
  `ad8783641455bae38a8eb5782b34241a7b3ff2ef`;
  **106** selected `web/www/missa/Latin/{Tempora,Sancti}/...` files,
  each recorded with its exact Git blob SHA.
- `gr1961-first200-latin-witness-screen.v1.json` records the
  file-by-file source scope and the occurrence evidence (61 rows).
  Original source spelling and liturgical-section names are preserved.
  No full original source files are copied to the app.
- These source files are **Latin source witnesses**, not independently
  certified instances of the actual selected 1962 runtime Proper.
  The production host may refer to a different year, date or variant.
  `@` source inheritance and seasonal alternate sections have **not**
  been exhaustively expanded in this targeted screening.

## Measured findings (with correct denominators)

| Status | First 200 records |
|---|---:|
| Source-section textual candidates (Introit, Offertory, Communion) | **27** |
| Pre-Gospel candidates requiring independent Gradual / Alleluia / Tract segment proof | **19** |
| **Total distinct provisional source candidates** | **46** |
| No textual occurrence inside these 106 selected Latin files | **154** |
| Candidates occurring in several different Mass source files | **8** (subset of the 46) |
| Distinct occurrences, including repeated Mass sources | **61** |
| Source files read with pinned blob SHA | **106** |
| Canonical 1962 runtime Proper matches verified | **0** |
| Musical facsimile comparisons approved | **0** |
| New chants released to the live reader | **0** |

The **154 are not rejected chants**. A limited witness screen cannot
establish their absence from the broader Missal or from Commons,
transferred/votive formularies, saints outside this sample, or source
inheritances. Likewise, the **46 cannot be called live matches**:
the exact source day, selected proper, chant alternatives, local calendar,
textual completeness and edition notation still require verification.

## Specific safeguards

- A chant title alone is never a match. Each recorded occurrence has
  immutable GregoBase ID, **correct office part**, actual `Tempora/` or
  `Sancti/` Latin source path, named section, source blob SHA and short
  visible Latin phrase.
- The `[Graduale]` source section sometimes includes the Gradual and
  Alleluia/Tract; matches within it are never allowed to assert a musical
  segment boundary without the existing three-language
  `reader-pre-gospel-chant-source.js` certification.
- The same text may occur in multiple proper sources: **eight candidate
  chants have multiple source paths**. Each must be independently resolved
  to the actually celebrated 1962 Mass. No first-match or date inference.
- No metadata candidate is promoted to a performance or a Gregorian
  score. `tools/mass/gr1961-promotion-gate.mjs` remains authoritative
  for human editorial and 1961 printed-facsimile review.

## Reproduction

`node tools/mass/reconcile-gr1961-first200-latin-sources.mjs --verify`
rebuilds all 200 statuses from the exact archived batch and pinned witness
manifest, checking original GABC SHA-256 and source file identities.
`node tests/gr1961-first200-latin-source-screen.mjs` enforces hashes,
counts, path checks and zero reader promotion.

The deterministic generated report is
`data/mass/chant-corpus/gr1961-first200-source-review.v1.json`.
All three research artifacts are committed on draft PR #1749.

## Next phase

1. Obtain actual canonical DayResolver/ProperResolver **selected**
   `properToReaderSlots` results for these 46 evidence-bearing records
   across the exact matching Mass formularies.
2. Reconstruct inherited Latin source sections and verify the whole
   chant text plus three-language pre-Gospel segmentation where needed.
3. Produce a distinct per-GregoBase-id event for `source-text verified`,
   `alternative/ambiguous`, `unavailable` and `rejected`.
4. Only after printed Graduale musical review, quality/device review and
   separately recorded human approvals may any additional score pass into
   the reader.
5. Continue next 200-record archive batch at research scale without
   duplicating the canonical GregoBase corpus.

No ongoing remote service, paid storage, proprietary recording or audio
synthesis is introduced.
