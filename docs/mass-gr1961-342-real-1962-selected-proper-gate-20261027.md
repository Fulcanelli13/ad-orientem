# GR1961 — actual 1962 DayResolver matching gate (27 October 2026)

**PR #1749 · draft · research-only.** This is the continuation of the source-screened, single 1,195-record archive and its existing 342-record detailed candidate ledger. No new score import and no parish catalogue.

## What has been implemented

The new verifier is `tools/mass/reconcile-gr1961-342-selected-proper.mjs`:
- Takes the **actual output** of `AO_RUNTIME_V8.resolver.resolveDay(date)`. If this output, the Proper envelope, exact date, or actual Proper source identity is not ready, it fails closed.
- Runs the existing `properToReaderSlots` projection for both English and French. It compares only the selected Roman Proper's Latin text from its own slot against source-page Latin evidence in the pinned 342 ledger. Requires exact path, role, and **eight shared opening words**, never an embedded or verse-only coincidence.
- Retains independent source-path witnesses and GABC identity. A strong research text match is not automatically a match against the actually chosen Mass.
- For pre-Gospel Gradual, Alleluia or Tract, requires the existing `validatedPreGospelChantParts` proof that reconstructs the flattened source across **Latin, English and French**. Correct musical role and exact source section/boundary must also agree. A missing proof stays `SEGMENT_UNVERIFIED`; no conjectural separation.
- Ambiguous score variants are retained as `AMBIGUOUS_SCORE_VARIANT` instead of selecting whichever archive entry appears first.
- Every screened record remains at **zero** printed 1961 facsimile approvals, **zero** editorial promotions, unknown local Schola performance, and **no** auto-assigned music.

This does **not** certify the entire GABC musical text from eight shared words. Full syllabification, verses, rubrical substitutions, textual variants, neumes, pitch, accidentals and clefs remain independent reviews. Source ownership and date selection are necessary but not sufficient.

## Actual calendar sweep

`tests/gr1961-342-selected-1962-year-e2e.mjs` drives the real application (not a synthetic static source catalogue) with the production resolver for each of 365 dates in **2026**. It captures:
- days whose proper actually resolves and whose source is available;
- selected 1962 source paths;
- opening-text and role matches among the 342 research candidates;
- conflicting compatible scores;
- failed source dates and unresolved candidates.

The run prints `AO_GR1961_2026_SELECTED_PROPER_SUMMARY`, `AO_GR1961_2026_SELECTED_PROPER_OBSERVATIONS`, and `AO_GR1961_2026_SELECTED_PROPER_EXCEPTIONS` in CI logs. These are actual runtime outcomes, not fabricated screening totals. They must be reviewed and a durable source-hashed snapshot **explicitly committed** before being quoted as certified coverage. This year's observed calendar Masses do not exhaust votive options, local formularies, inherited Commons, other years or rites.

R17 now has a **separate** `gregorian-selected-1962` CI job running this sweep without being gated on the existing unrelated broad Mass phone/test jobs. The pure unit contract is also part of `test:reader-schola`.

## Baseline before runtime CI

The preceding detailed text-screen data remain **342 = 275 strong + 39 partial + 28 divergent**, based on **506** source-line occurrences across **91** source paths. **185** of those 342 are pre-Gospel candidates that require an exact segment decision; **46** path/track buckets have multiple strong research candidates. These figures are not claims that any candidate has yet been matched to an actual live 1962 source selection.

Next: inspect the real CI observation matrix and settle source/variant ambiguities in bulk, commit a durable provenance-bearing result, expand to source-inherited Commons and source-day alternatives without assuming their rubrical eligibility, then perform independent full-facsimile comparison of accepted candidates. No recording, publication, paid infrastructure, or parish-practice inference.
