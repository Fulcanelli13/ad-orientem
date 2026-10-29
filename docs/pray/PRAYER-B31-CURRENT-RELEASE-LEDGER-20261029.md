# Prayer B31 — Current Release Ledger, 29 October 2026

## Decision

**This is a release-state reconciliation only.** Do not turn it into B31 devotional expansion, do not silently change the 97-row B22 historical research crosswalk, and do not modify the 48 canonical prayer texts, 16 baseline novena IDs, or the 94-record source-ownership foundation. No new public text, prayer card, route, translation, module or paid service has been created.

The single current release overlay is:
`data/pray/prayer-corpus-current-release-overlay-b31.v1.json`

Preserved sources:
- `data/pray/prayer-corpus-editorial-acquisition-master.v1.json`: 97 original candidate decisions, priorities and URLs.
- `data/pray/prayer-corpus-release-crosswalk-b22.v1.json`: original 28 October assessment. The outdated five candidate statuses and historic short-Precious-Blood error remain legible **as historical evidence only**.
- `data/pray/prayer-corpus-ownership-foundation.v1.json`: 94 owned objects of **different record types**; 48 prayer records, 18 programme entries in that specific research ledger, 11 hymn identities and other source records. Not 94 unique prayers.
- `src/pray/canonical-data.js`: 48 frozen canonical prayer IDs.
- `src/pray/novena-corpus-v4.js`: 16 baseline novena IDs, distinct from additional Holy Face reader.

## Exact 97-row current disposition

| Disposition | Count | Meaning |
|---|---:|---|
| Source-scoped live exact records in original B22 (excluding one misclassified §40 short form) | 5 | A source-specific publicly owned text/selection exists, but this is not original-print or every-language certification |
| Five B22 distinct candidate programmes subsequently merged | 5 | In-app publication in a *source-scoped* form, potentially using another edition or editorial directions |
| Existing owners | 25 | Owner exists, not automatically the identical original wording or its visibility |
| Intent covered | 21 | Purpose met by another prayer; do not claim the named historical text was imported |
| Other module | 5 | Assigned outside the Prayer corpus proper |
| Source / rights holds | 12 | Do not import until individually cleared |
| Short Precious Blood variant-specific hold | 1 | 1857 §40 short variant is not released |
| Editorial deferrals | 19 | Preserved for research, not automatically demanded as app cards |
| Exclusions | 4 | No current product admission |
| **Total** | **97** | |

**61 addressed, routed or source-scoped implemented; 13 source/variant holds; 19 deferred; 4 excluded.** The 61 is **not** a number of distinct published historical prayer texts: it includes ownership, practical intent coverage and works belonging to other modules. No verified total of all unique prayer texts can be computed by adding the 48, 16, 94, 97, ICKSP source units or Raccolta index slots.

## Five historical B22 candidates — reconciled to merged PRs

| ID | Historical candidate | Actual publication | Qualification |
|---|---|---|---|
| AO-AQ-053 | Seven Sorrows and Joys of St Joseph | PR #1886 · 1910 Raccolta §300 seven prayers plus closing | Do not call 1857 §115 and 1910 §300 identical original photographic proofs |
| AO-AQ-062 | Holy Face 9-day novena | PR #1888 · complete 1887 Janvier/Bennett English digital transcription | Not the mixed 2022 Sensus appended form, not photographically original-edition certified |
| AO-AQ-065 | Montfort 33-day preparation | PR #1895 · 33-day programme plus consecration act | Later day-by-day scheme separately identified; do not copy protected 1987 translation |
| AO-AQ-066 | Night Adoration at Home | PR #1906 · six original editorial guided stages | At-home Sacred Heart prayer not tabernacle presence; no copied 1944 dramatic text or invented enrollment |
| AO-AQ-029 | Little Crown of Infant Jesus | PR #1915 · three Pater plus twelve Ave and Incarnation aspiration | Does not automatically include longer ICKSP medal prayers and meditations; 1940 original-photo verification pending |

All five relevant PRs were checked as merged on 29 October 2026. Release SHA is individually documented on the corresponding row.

## Critical correction — AO-AQ-047

The B22 snapshot labelled `AO-AQ-047 Short Chaplet of Precious Blood (§40)` **LIVE_EXACT**, but the actual published PR #1873 is the **distinct full form**: 33 Paters and seven mystery groups from the 1857 `Raccolta` §35 / 1910 §138 witness.

The historical **short §40 form is on HOLD** because the reproduced enumeration yields 35 Paters (5 × 7) while its surrounding rationale names 33. We must not claim the short historic form was imported or silently relabel the 33-Pater full reader as the short one. Keep this correction in the new overlay, preserving the original B22 error for auditable provenance.

## What remains unresolved, not a call to start B32 research

1. Twelve source/rights holds: AO-AQ-002, 005, 006, 007, 012, 017, 018, 022, 024, 057, 063, 078. Their individual reasons are in the overlay. Add the independent AO-AQ-047 *variant-count hold* to obtain thirteen total.
2. Nineteen deliberate editorial deferrals. No blanket release expectation.
3. Draft ICKSP selected-material PR #1800 is **not merged**; 25 selected source units do not equal 25 new public prayers. Reconcile against existing owners before any source-specific release.
4. Source authentication: the original 16-novena printed-book review remains 0/16 full print certificates and the 1887/1910/1940 digital witnesses have explicitly uncompleted photographic collation where stated.
5. Corpus numerical distinctness: the 94 owned record identities are not a deduplicated all-prayer count. Establishing such a count would require a separate *identity-based* cross-source matching pass, not arithmetic summation.

## Next bounded product gates

- **P0 app correctness:** Repair obsolete Adoration five-choice acceptance to recognize the already released sixth **Night Adoration** choice, and investigate Benediction handoff, without changing correct reader semantics simply to satisfy tests. Reconcile offline PWA size (418 vs 416), source-independent geography census and Biblical Atlas failures in their owning streams.
- **P1 app quality:** Review existing Prayer discovery cards and mobile 320/390px journeys; maintain vertically readable full texts with horizontally switched named steps, correct source disclosures and bilingual/Latin provenance. Do not create new top-level Prayer modules.
- **P2 editorial:** Fix only user-visible transcription defects and a small risk-ranked set of original-source discrepancies, explicitly documenting what remains uncertified.

**Acceptance test:** `node tests/pray-b31-current-release-ledger.mjs`, now part of the existing `npm run test:pray-owner`. It asserts the full 97-row one-to-one mapping, the split §40 hold, five evidenced merged programme rows, exact summary counts, frozen original decisions and stable 48/16/94 baselines. No runtime UI changes are introduced here.

**STOP:** After verifying the overlay and releasing it, proceed to app quality; do not open additional broad prayer acquisition phases.
