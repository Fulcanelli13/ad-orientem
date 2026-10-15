# Saints atlas — observed 2026 source census and existing-owner bridge

Date: 15 October 2026 · [Saints draft PR #1227](https://github.com/Fulcanelli13/ad-orientem/pull/1227) · Not merged / no Calendar modification

## 1. What is now genuinely complete

[365-day owner-resolver CI pass](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38729330632) with the [complete 365-row machine-readable JSON artifact](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38729330632/artifacts/11969382750), reproducible from `tests/saints-calendar-year-census.mjs`.

| Field | Observed count |
| --- | ---: |
| Calendar days evaluated | 365/365 |
| Observed principal Sanctoral source cycle | 165 |
| Observed principal Temporale source cycle | 129 |
| Other source cycle | 71 |
| Of those other days, Feria source identity | 59 |
| Of those other days, BVM/Common Mass source identity | 12 |
| Distinct observed principal source IDs | 297 |
| Dates with at least one named commemoration | 112 |
| Total named commemoration occurrences | 117 |
| Distinct verbatim commemoration name strings | 115 |
| Days with source-labelled Proper commemorative orations | 111 |

All 365 resolved without failure on this GitHub Actions run. The 71 source-cycle 'unknown' days are overwhelmingly ordinary `feria` or common Marian Saturday Mass records, *not* 71 missing saint records or 71 unresolved dates. Source-cycle classification itself uses `src/calendar/observed-cycle.js`; this Saints audit did not change its logic.

**Critical meaning:** 165 is a count of *observed Sanctoral principal days in 2026*, **NOT 165 unique saints**. The Sanctoral contains Our Lady, liturgical events, angels, groups, and individuals. The 117 commemoration occurrences include temporale and other non-saint commemorations. Individual martyr group members must not be expanded into 2–2,000 unnecessary profile identities. Each source row preserves the original principal source ID, EN/FR title, raw rank, actual date, cycle, named commemorations and Proper prayer paths; none asserts an independent 1962-rubric authenticity verdict.

## 2. Connection with work done by other pipelines

**Calendar PR #1226** already owns the 70 protected third-class feast identities, a 38-Doctor roster, six living-sanctoral profiles, 258 named official post-1960 canonization-index persons and 13 collective martyr groups (historical corpus, not a full world-person census). Our audit provides **observed source outputs**, not substitute person, canonization, holiday or rank tables. An exact same-person link is established between:
- Saints `saint:therese-of-lisieux` and Calendar `saint.therese-lisieux`, with observed `sancti:10-03:3:w` on 3 October 2026.
- Saints `saint:claude-la-colombiere` and official Calendar-index `saint.claude-la-colombiere`, canonized in 1992; **not a 1962 automatic feast**.

And one important **do-not-merge lock**: Blessed Jacques-Désiré Laval (Mauritius) and Saint François de Montmorency-Laval (Quebec) are wholly different individuals. Sharing 'Laval' is **not** identity evidence. Margaret Mary Alacoque has an observed 17 October 2026 principal (`sancti:10-17:3:w`) but her cross-pipeline person ID is still held pending exact owner audit.

**Sacred Art PR #1231** already owns the W59/W62 historical **252 date / 311 saint/group component occurrences** (not 311 unique saints), 104 historical-ID union, 281 artwork masters, user ratings, and app-wide image requirements. Our 365-day observed principal/commemoration source census is passed over for its coverage matrix, but does not claim portrait availability, subject identity, artwork permission or publication.

**Relic owner** has 161 source subject records plus wave-specific object/custody evidence. A saint appearing in the relic census is not thereby canonically adjudicated, and reported relic custody is not authentication or proof of a lifetime location.

Two [cross-owner review comments](https://github.com/Fulcanelli13/ad-orientem/pull/1226) and [W62 input handoff](https://github.com/Fulcanelli13/ad-orientem/pull/1231) record the dependency. `data/saints/parallel-owner-identity-bridge-20261015.v1.json` contains only exact, appropriately guarded links and snapshot metadata; it does not duplicate their hundreds of source records.

## 3. Next stages — ordered to minimize repeated research

1. **Reconcile observed principals and named commemorations** against Calendar's existing 70 protected feasts, 38 Doctors and 1962 nominal Sanctoral source identity, including days displaced by 2026 precedence. Match canonical IDs first, never generic saint-name substring matching; keep martyr groups as groups.
2. **Compare 2026 with 2024/2027** before claiming fixed-date or feast-class coverage, and separate individual sanctoral principal, named commemoration, collective commemoration, Marian/Christ/event and unverified textual aliases. No extra feast added to the 1962 Mass.
3. **Reconcile historical 252-day / 311-component inventory** from W59/W62 and independent later-sanctoral persons from PR #1226 without duplicating person records. Handle 119 shrine-name strings and 161 relic subjects as evidence sources, not totals to sum with Calendar's counts.
4. **Prioritize text quality and categories:** holiness-first EN/FR biographies; source-backed Doctor/theologian/pastor/missionary/martyr/mystic tags; brief, rigorously qualified miracle/vision/stigmata accounts; no invented zero miracle count and no association of shrine cure with lifetime action.
5. **Publish only when ready:** native Explore already works with 6 initial profiles/9 Places/8 pins. Gradually extend it from canonical identities once individual source, art, geo and attribution guards are met, then human phone QA and staged release.

## 4. Hard publication rules

1962 Calendar and modern saint discovery remain independent; no silent modern feast insertion. Recognized collective saints remain one group profile unless individually historically significant. Source reference links stay compact and expandable; texts are not copied into oversized profiles. No new physical pins, no duplicate artwork masters and no portrait without current art approval. Neither the 365 source-run JSON nor its raw counts is a certified 365-day independent rubrical audit.
