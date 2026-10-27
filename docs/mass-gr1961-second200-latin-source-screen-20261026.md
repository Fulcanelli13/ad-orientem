# Graduale Romanum 1961 — second 200 research screen

26 October 2026. Records **201–400** from the **existing immutable 1,195-GABC archive** were screened using the **same 106 pinned Latin Proper files** as the first 200. Each of the 106 files was fetched at DivinumOfficium commit `ad8783641455bae38a8eb5782b34241a7b3ff2ef` and its exact source Git blob SHA validated against the frozen first-200 manifest.

## Counts, denominators and evidence

| Exclusive record disposition | Count |
|---|---:|
| Introit / Offertory / Communion source-line textual candidates | **28** |
| Gradual / Alleluia / Tract source-line candidates, segment not certified | **28** |
| No occurrence within the 106 sampled source files | **120** |
| Incipit not reliably searchable in this text method | **24** |
| **Total** | **200** |

**85** individual line occurrences across **56** distinct records; **12** records with occurrences in several source files. **10** candidates have an embedded incipit somewhere in the source evidence, and **10** have an Introit occurrence in a non-opening line (possible verse/reprise).

For reconciliation, only two-word-or-longer incipits were searched; abbreviated/elliptical incipits and single words can be false negatives. All nonhits and unsearchable records remain **UNRESOLVED**, never rejected. Original `@inheritance`, local and seasonal choices, variant proper assignment and source text completeness have not been established. Composite `[Graduale]` text does not identify which musical segment is sung. A text line is not musical notation or a source-verified 1962 reader selection.

## Files, reproducibility, safeguards

- `gr1961-second200-latin-witness-screen.v1.json` has pinned 106 source identities and all 85 individually traced lines.
- `gr1961-second200-source-review.v1.json` has one of four mutually exclusive statuses for **each of the 200** archive rows.
- `tools/mass/reconcile-gr1961-second200-latin-sources.mjs --verify` reconstructs the disposition and checks SHA-256 of original GABCs, batch bytes, source file identities, office parts and excerpts; no apparent source match may be silently substituted.
- `tests/gr1961-second200-latin-source-screen.mjs` asserts all counts and checks deliberate corruption and absence from live reader.

This is the existing research pipeline, not a second importer. The existing `gr1961-promotion-gate.mjs` remains the only publication mechanism. **0** newly canonical-1962-verified records, **0** facsimile approvals, **0** reader promotions. CI and device acceptance still separately required. PR remains draft.

## Next

Reconcile the **46 first-batch** and **56 second-batch** textual candidates against actual selected ProperResolver outputs; apply the existing three-language `reader-pre-gospel-chant-source.js` certification to the 19 + 28 pre-Gospel candidates, resolve inherited/variant formularies, then inspect the printed 1961 music and obtain editorial approval. Continue archive-wide research without misclassifying sample nonhits.
