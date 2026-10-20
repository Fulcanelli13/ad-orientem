# Weiser — selective customary publication, Batch 01

20 October 2026. Implementation branch: `customs/weiser-selective-release-20261020`; target: **review PR, not merge**.

## Source-of-truth and publishing boundary

The complete Weiser inventory of 568 observations, 28 chapters and research queue remains in draft research PR #1513. This branch uses eight **independently sourced** bounded facts and publishes only customs identity, attestation and optional bilingual Calendar guidance. Original SOT-07 63-row register and the seven negative-knowledge locks are unchanged.

Baseline main: 17 customs / 75 attestations / 81 sources.
This branch: **24 customs / 83 attestations / 89 sources**, representing 7 new canonical customs, 7 matched attestations, 1 Polish witness of existing DEAD-003 and 8 independent source records.

| Canonical ID | Weiser observation | Existing surface | Verified independent source | Date/guardrail |
| --- | --- | --- | --- | --- |
| NDAY-001 | WEI58-23-008 | Saints / Learn | Helen McLoughlin, *My Nameday—Come for Dessert*, 1962, EWTN | Person's explicitly selected baptismal patron only; no inferred feast |
| PATR-001 | WEI58-23-006 | Saints / Learn | French Bishops' Conference, abbey of Chantelle | Local patron and actual parish celebration; no global date |
| MARI-001 | WEI58-24-005 | Calendar / Learn via Atlas | Diocese of Paris, 2026 Assumption | 15 Aug context; no auto-procession; coordinate separately with #1512 Assumption herbs |
| SJOS-001 | WEI58-27-019 | Saints / Calendar / Learn | Diocese of Baton Rouge 2026 | 19 Mar charity/table; Sicilian custom not mandatory |
| SANT-001 | WEI58-27-023 | Saints / Calendar / Learn | French Franciscan Ermitage St-Antoine | 13 June context; Toulon 1890 charitable witness; no fund solicitation |
| SCHR-001 | WEI58-28-011 | Saints / Calendar / Learn | Diocese of Laval, 2026 | 25 July context; optional priestly blessing only where offered |
| SNIC-001 | WEI58-28-020 | Saints / Calendar / Learn | Diocese of Strasbourg | 6 Dec; regional children's observance, hagiography/folklore separated |
| DEAD-003 (existing) | WEI58-26-019 | Calendar / Pray / Atlas | Parish of Matki Bożej Ostrobramskiej, Warsaw, 2025 | November Wypominki names/prayer; no new custom or duplicate Souls card |

These independently attested customs are not asserted to be universally practised. The area identifiers mean **source geography**, not a worldwide automatic offering. All eight new attestations explicitly set `map_policy: NOT_MAPPED` and `place_id: null`. Distinct St Joseph pastries and French grape blessings are not added without their own source closure.

## Calendar UX policy

Four dated `v384Events` practice notices provide bilingual text and a single `today.calendar` action. They are **not** feast definitions, 1962 day priorities, a canon-law obligation or Mass reader control state. The existing 1962 Calendar remains the unique authority for liturgical occurrence and precedence. Name days and fête patronale have no automatic fixed calendar notice until the app can associate a real patron and locality. MARI-001 is Atlas discoverable under the Assumption feast: do not add a competing Assumption practice notice while #1512's `assumption-herbs` is open; harmonise that card before final integration.

Wypominki is source evidence for the published `DEAD-003` owner. It does **not** cause names of deceased to be uploaded, copied, indexed or publicly displayed; the application provides existing prayers instead.

## Acceptance and regression

- Tests: `npm run test:customs-atlas` now also calls `test:customs-weiser`. Covers canonical/source/geography integrity, negative locks, duplicate owner protection, date surfaces for 2026/2027/2030, bilingual date copies and month-feed uniqueness.
- Existing Explore canonical identity/grouping expected values updated; existing 58 site-specific custom pins remain unchanged.
- Heritage original 10 October audit frozen. Explicitly count seven new no-pin customs plus the Wypominki attestation independently against that snapshot.
- Does not modify LIVE 48-card architecture, 1962 date resolver, Saints biographies, Pray prayer bodies, home dashboard or Special Days scripts. No downloadable ritual text or miracle guarantee.
- Merge coordination: PR #1512 also alters Atlas/source/Calendar/tests. Resolve overlaps by preserving **both** batches' stable IDs, not replacing one or treating a second card as an acceptable fallback. No merge on unresolved test failures.

No expenses, outreach, site contact or new third-party permission workflow.
