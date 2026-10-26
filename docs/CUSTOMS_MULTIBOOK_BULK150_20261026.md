# Customs — multi-book conversion wave 1 (150 source-action dossiers)

**26 October 2026 · Research-only · €0 workflow · NO PUBLICATION**

## Why this exists

The app currently publishes 35 source-linked full bilingual Customs articles. The 56-entry research master (35 published, 3 contextual, 18 unpublished) contains six EN/FR editorial fields for every working identity. Meanwhile thousands of source observations remain scattered across different books and different author's descriptions. This wave **normalizes 150 concrete action leads from multiple books at once** so that editorial work can proceed in larger, nonduplicating cohorts.

This does **not** create 150 additional verified Catholic customs. A source observation can be author advice, a variant of an existing practice, a part of a local festival, liturgical ministry, regional folklore, or a separate custom; source-to-identity decisions remain explicit.

## Counts actually achieved

| Measure | Count | Interpretation |
|---|---:|---|
| **Cross-book source-action dossiers normalized** | **150** | Each has an immutable intake key, original source URL/page/line locator, working action label, geography/date where already recorded, exact research owner, identity relation leads and its specific next gate |
| Weiser, 1958 | 50 | 50 working action groups, excluding already drafted five-release subjects |
| Stokes, 1955 | 20 | Individual family practices or author suggestions, not deduplicated identities |
| Müller, 1955 | 15 | Online 1955 witness locators, not verified historic customs |
| Chaney, 1955 | 20 | Family/Advent/Christmas source actions and textual suggestions |
| Trapp / Berger / Newland | 25 | Catholic Culture reproduced excerpts; source duplication across authors is NOT assumed independent |
| Pitrè, 1900 | 20 | Historically situated actions/components grouped under **local Sicilian festival families**, not 20 universally applicable customs |
| **Previously independently sourced narrow claims in this intake** | **12** | A source-bounded specific claim exists, not a fully approved distinct identity |
| **Original Weiser folio/action previously reviewed** | **26** | Prior genuine original-page action inspection; one group can have both source checks |
| **Existing complete EN/FR source-bounded draft profiles reused** | **12** | Faithful snapshots of prior original bilingual source work, not newly invented descriptions |
| **Previously written but unpublished EN/FR master identities isolated for review** | **18** | A separate full-length bilingual review packet already present in the 56-identity master; **not** 18 newly discovered customs |
| Additional canonical IDs, public customs, claimed source equivalences | **0** | Everything remains pending editorial and factual acceptance |

The 150 actions represent separate **intake rows**, not proven distinct customs. Some overlap the 56 working identities, the earlier 54 Weiser editorial drafts, and/or each other.

## First larger editorial review cohort: 30 units

The newly assembled `data/customs/master/customs-editorial-thirty-review-units-20261026.v1.json` supplies **30 concrete review units**, without inventing 30 unique customs:

- **18** master identities: full EN/FR titles, descriptions, histories, meanings, practices and pastoral cautions, copied exactly with their own qualified Calendar contexts and original source URLs. All remain `NOT_APPROVED`.
- **12** independently witnessed narrow-claim Weiser leads: bilingual title, historical discussion, meaning, practice, qualification and exact supporting links carried from the existing independent-source review. Their **short descriptive introductions remain explicitly missing**, not AI-invented, and identity boundaries must still be compared with the 38 canonical and 18 unpublished working identities.
- **Three** of these 12 source leads already point to named existing working owners. They may collapse as duplicate accounts or regional variants. Also distinguish Eastern Christian and cross-confessional cultural practices from Roman Catholic liturgical customs.

Thus the immediate actionable work is **18 full articles to check** and **12 rich, partly complete source-backed dossiers to reconcile**, not 30 approvals. After historical/rubrical, duplicate and EN/FR editorial decisions, only genuinely publishable identities should pass into the existing Calendar.

## Source-of-truth and assets

- `data/customs/master/customs-multibook-bulk150-20261026.v1.json` — **150 structured action dossiers**. Contains original first-hand action descriptions only if the research pipeline explicitly marked the original folio checked. Other records are source-index or secondary digital-witness observations with the exact uncertainty preserved.
- `data/customs/master/customs-18-unpublished-bilingual-editorial-review-20261026.v1.json` — **the existing 18 complete but unapproved working-master articles**, copied exactly from `working-master.v1.json` with the English and French name, description, history, meaning, practice, cautions, source IDs and existing calendar/geography context. This is the immediate publication-review cohort, subject to correction and human signoff.
- `tests/customs-multibook-bulk150.mjs` and CI workflow — checks the counts, source references, nonpublication state, ID isolation, and verbatim matching of all 18 bilingual profiles to the existing master.

The previous five source-bounded editorial release subjects (`CU-REVIEW-001..005`) are **excluded from the 50 selected Weiser groups**. They remain owned by [research PR #1610](https://github.com/Fulcanelli13/ad-orientem/pull/1610), [first-two release PR #1642](https://github.com/Fulcanelli13/ad-orientem/pull/1642), and [three-subject QA PR #1720](https://github.com/Fulcanelli13/ad-orientem/pull/1720). No second Calendar or Customs Atlas is created.

## Priority editorial strategy (higher throughput)

1. **Immediate 18-identity bilingual review cohort.** Compare each article's practice, historical attestation, ministerial status, region, source witness and 1962 Calendar association against an existing identity. Approve as canonical *only* when evidence warrants; otherwise keep as localized variant, component, historical context or another-module record. Do not publish the 18 en bloc merely because text fields are populated.
2. **12 independently witnessed action dossiers.** Source claim and bilingual copy can be reviewed faster, but deduplicate against those 18 and the already existing 38 before allocating new IDs.
3. **26 first-hand Weiser folio dossiers.** The original passage has already been inspected, so focus on independent identity witnesses, regional scope and actual action boundary rather than repeating the same page work.
4. **Remaining 150-source dossier evidence queue.** Split duplicate-practice hints, family advice vs historical custom, Pitrè village festival components and folk claims; avoid presenting similarity as corroboration. Write EN/FR historical/practice explanations only after checking exact quoted action and scope.
5. **Continue by another 100–150 actions per wave**, selecting from the remainder of the 408 Weiser groups and other ingested books, without repeating previously screened rows. Track sources, review outcomes and real user-facing approvals separately.

**Release rules:** Approved material appears as context-sensitive suggestions in the **existing Ad Orientem Calendar** only. Every card must make the region, feast/season timing, historical period, voluntary nature, source and authentic priest/lay role clear. Users can later manage their own household practices separately. No automatically scheduled parish ceremonies, false universal rubrics, new geographical pins or unapproved artwork are introduced.

**What this wave does not prove:** that the entire corpus contains 150 new unique Catholic practices, that any old book witness shows present-day parish availability, or that mechanically finding a related phrase in two books establishes independent historical corroboration.
