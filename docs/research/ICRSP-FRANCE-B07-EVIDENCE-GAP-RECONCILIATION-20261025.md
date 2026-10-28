# ICRSP France B07 — Evidence-based source gap registers
**25 October 2026** · Owner [#1665](https://github.com/Fulcanelli13/ad-orientem/issues/1665) · [draft PR #1666](https://github.com/Fulcanelli13/ad-orientem/pull/1666)

## What this stage actually establishes

ICRSP France's indexed library has **855 source articles**; **783** articles have structural commentary headings; **2,856 distinct panel occurrences** are recorded. These are *source-structure facts*, not 2,856 authenticated original historical extracts, verified unique passages or safe-to-publish English/French texts.

The initial content deduplication of Temporal commentary completed successfully: [Actions run 40210047111](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40210047111), with **189/189** commentary-bearing Temporal sources, **807** panel instances, zero fetch errors. It produced **753 substantial panel bodies** (character count >120), comprising **705 distinct normalized text hashes** and **48 additional repeated instances** within **28 duplicate hash groups** representing **76 panel occurrences**. Another **54 panels** were short and deliberately excluded from the substantial-content comparison.

The 28 duplicate-group source locators, family candidates, exact 193-source index and rights/edition safeguards are permanently recorded in `data/source-text/icrsp-france-temporal-189-dedup-verified.v1.json`. **Identical hosted text does not imply identical historical Mass rites.** For example, pre-1955 and later Palm Sunday, Holy Monday, Holy Tuesday and Holy Wednesday URLs reuse commentary panels while their rite assignments remain distinct; selected Ascension and Sacred Heart variants also reuse passages.

The technical false starts in the fingerprint pipeline were a Python test-quoting error, a cross-workflow Actions artifact credential failure and an escaped matrix-expression filename in the upload step. The corrected workflow **succeeded**; do not confuse earlier failures with any source extraction failure.

## Existing app coverage first — 39 major Calendar celebrations

The first genuine source-to-existing-feature comparison is `data/source-text/icrsp-france-39-major-content-gap-triage.v1.json`:

| Verified research datum | Count |
| --- | ---: |
| Existing rendered Calendar celebrations checked | **39 / 39** |
| Corresponding ICRSP article candidates | **39** |
| Source-page commentary panels represented | **164** |
| Exact matching existing `data/mass/scripture-feast-reading-supplement.v1.json` source paths | **17** |
| Not matched **in that one 55-entry feast supplement** | **22** |
| Existing Calendar customs event IDs directly checked | **2** |
| Article candidates bearing historical-variant/duplicate-text risk flags | **10** |
| Direct stable canonical feast bindings approved | **0** |
| Verified genuinely absent app features | **0** |

**Do not interpret the remaining 22 fixture titles as 22 missing Masses or 22 missing biblical contexts.** The supplementary source index covers selected feasts only; other canonical proper and Scripture registries exist, including the separate Temporal Sunday and segmented reading audits. Every row therefore says `NOT_MATCHED_IN_THIS_55_ENTRY_FEAST_SUPPLEMENT_ONLY` rather than `MISSING`. The Calendar is not rebuilt and the overview's display title is not invented as a stable canonical ID.

The two explicitly checked existing custom events are `advent-family-traditions` and `candlemas` in `src/calendar/traditional-year-v384.js#v384Events`. They remain existing Calendar experiences.

The ICRSP commentary panels are **not yet verified as present or absent** in existing Mass Explorer, Saints or Calendar explanatory text. Each row asks whether there is any substantive, independently sourceable content not already delivered, then requires original work edition, translation licence, source location and 1962 scope before publication.

### Three high-priority source conflicts / shared-text examples

1. **Holy Saturday**, `a0030_nouveau`: ICRSP index says *after 1955* whereas page H2 says *after 1951*. Neither should be silently chosen. Resolve edition against authoritative Holy Week books before importing ceremonial guidance.
2. **Palm Sunday**, `a0010_nouveau` (explicit pre-1955) versus `a0593_ancien`: three Guéranger/Schuster/Parsch commentary panels have the same normalized body hashes. Preserve one passage-research identity and both distinct rite-source identities.
3. **Holy Monday–Wednesday**: later and explicitly pre-1955 article variants share several named author blocks. Reusing a commentator excerpt does *not* transfer the pre-1955 ritual arrangement or Mass prayers to 1962.

## The entire Temporal queue — 193 articles

`data/source-text/icrsp-france-temporal-193-gap-register.v1.json` provides one source-linked row for every indexed Temporal article with H2 heading/fingerprint, original source URL, top-level ownership, fixed triage status, existing major crosswalk reference where present and dedup group memberships.

| Source triage classification | Article records |
| --- | ---: |
| Already associated with major Calendar candidate | **27** |
| Feria/weekday requiring source-order + Proper-ID matching | **80** |
| Special rite, historical variant or 1962 edition reconciliation | **52** |
| Other Temporal sources with unverified existing registry match | **26** |
| Octave-period historical/edition review | **8** |
| **Total** | **193** |

There are **189** with commentary and **4** without. Of the 193, **25** index labels explicitly signal a historical or edition distinction; **45** articles are represented in at least one confirmed shared-text hash group.

The other **12 of the 39 major-calendar source leads are Sanctoral**, outside this Temporal register. Neither `166` unlinked Temporal articles nor `22` unlinked sampled Scripture fixtures is a proven count of missing app content. These are *unresolved comparison queues*.

All records explicitly leave canonical Mass Proper IDs and Calendar stable observance IDs null, edition certification false and publication blocked. No source text is reprinted.

## Immediate work programme

**P0 — release-safe reconciliation (do first):** Compare the 52 special/historical Temporal source records and their variant links to existing 1962 source owners; keep historical variants separate. No reader cue edits here; parallel Ordo Missae audit owns those.

**P1 — genuine gap detection:** From the 39 major-celebration rows, inspect actual current explanatory Mass Explorer, Calendar and source-reference records; classify each topic as `EXISTS_WITH_EXACT_LINK`, `PARTIAL`, `NOT_OBSERVED_IN_CHECKED_OWNERS`, `RUBRICALLY_INCOMPATIBLE`, `DUPLICATE_SOURCE`, or `NEW_EVIDENCE_CANDIDATE`. Only full owner checks allow a claim of absence.

**P2 — source-first author/edition verification:** Collate the 705 distinct substantial Temporal body hash identities (not 807 repeated page panels), but only those attached to a current gap. Anchor authentic Guéranger/Schuster/Parsch work, volume/section, witness edition and any protected French translation to an externally available legal source; do not issue AI summaries as author quotations.

**P3 — extend systematic screening:** Crosswalk 80 Feria entries against existing Temporal Proper/source-path registries, then run the same source-to-existing-ID checks on 449 Sanctoral commentary pages and other domain queues. Process 150–200 source records per batch with exceptions triaged separately.

**P4 — scoped publication proposal only:** Candidate-specific owner approval for true new material, optional outbound-only sources where reproduction rights absent. Do not create a second Calendar, Mass reader, new 1962 rite, or integrate full raw commentary panels.

## Persistence, tests and acceptance criteria

- Existing combined 783-article commentary metadata and 855 detailed article metadata are held in **time-limited GitHub Actions artifacts**, not yet fully committed source-tree files. Research counts, 28 dedup groups and source audit coverage are permanently committed to research branch; this does **not** substitute for preserving all underlying evidence indefinitely.
- A source register integrity test file (`tests/test_icrsp_gap_register_integrity.py`) and read-only action (`icrsp-gap-integrity.yml`) verify 855 source identities, 193 Temporal / 39 major rows, 17 source-path matches, 28 duplicate groups / 76 occurrences, false-positive avoidance and no canonical app promotion.
- The PR is still **draft, unmerged**. No `src/` or `index.html` changes are introduced by this research branch.
- Only source URL/link metadata, titles, source IDs, occurrence counts and hashes are safe research outputs by default. *Original-work attribution, historic edition and translation/copyright verification remain separate release gates.*

**Success for this pipeline** is not publication of 2,856 hosted panels; it is a defensible per-record answer to **what we already have, what evidence is genuinely new, and whether its source and rights are good enough to use**.
