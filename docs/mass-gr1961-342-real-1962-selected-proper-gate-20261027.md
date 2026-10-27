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

## CI-confirmed 365-day findings (27 October)

The first [successful independent R17 Gregorian job](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40465057870/job/122058520048), source commit `0c78faf4`, screened **all 365** calendar days, with **zero resolver failures**. Exactly **three** distinct GregoBase candidates had actual source-selected textual evidence in **four** date-specific observations: GregoBase 195 (14 September Offertory), 346 (14 September Communion), and 389 (4 and 5 October Introit). Evidence is stored permanently in `data/mass/chant-corpus/gr1961-342-selected-proper-2026-ci-observations.v1.json`, including original Latin witness blob hashes.

The [second successful R17 Gregorian job](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40465685828/job/122060404509), source commit `460faf58`, adds an **exhaustive disposition accounting** for all candidate/date matches encountered while keeping the same four positive observations:

| Measured audit dimension | Count |
| --- | ---: |
| Calendar dates resolved | 365 / 365 |
| Distinct Proper source paths encountered | 300 |
| Candidate source paths actually encountered | 74 / 91 |
| Calendar dates with at least one candidate source path | 123 |
| Candidate-date pairs inspected | 677 |
| Exact source-text matches | 4 |
| Held candidate-date pairs | 673 |
| Held — trilingual pre-Gospel segmentation not certified | 294 |
| Held — actual source-selected Latin chant text does not match | 236 |
| Held — initial textual evidence does not meet the strict matching gate | 143 |
| Distinct unresolved candidate IDs in 2026 | 290 |
| Editorial/musical approvals | 0 |

**Units matter:** 294/236/143 are candidate-**date** pairs, not distinct chants. The same GABC can appear on different calendar dates, and the 2026 calendar does not represent every possible votive, Common or regional Proper. Do not misinterpret three verified textual IDs as a 3/342 universal repertoire success rate or the other 339 as errors.

The second CI record is now preserved at `data/mass/chant-corpus/gr1961-342-selected-proper-2026-ci-diagnostics.v1.json` with immutable workflow/job/commit links and all three unresolved dispositions.

### High-volume continuation

First process trilingual named pre-Gospel proofs in bulk for selected 1962 source-path owners; these account for **294** candidate-date holds. Do not separate a Gradual and Alleluia by a shared word or sectional label alone; the host's full Latin, English and French source boundaries must reconstruct without mismatch. Next process the **236** candidate-date textual disagreements by selected Proper role and full initial phrase, isolating within-section verses and alternate formularies. Finally review the **143** lower-confidence text matches and unobserved source paths; do not relax the editorial approval gates. All three stages should use the original unified registry and leave local Schola performance unasserted.

This is progress in **classification and diagnosis**, not score publication. All 1,195 archived GABCs remain in the unapproved research bank; the 1961 printed score facsimiles still need detailed human verification before any release.
