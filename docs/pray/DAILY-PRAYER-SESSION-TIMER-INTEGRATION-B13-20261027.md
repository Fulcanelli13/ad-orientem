# Morning & Evening Prayer — session timer integration (B13)

**27 October 2026 — Implementation draft [PR #1786](https://github.com/Fulcanelli13/ad-orientem/pull/1786).** Historical corpus/editorial decisions remain in [PR #1785](https://github.com/Fulcanelli13/ad-orientem/pull/1785).

## Scope now in the EXISTING reader

The currently deployed reader's canonical **11 Morning and 13 Evening cards remain the authoritative live sequences**. Neither the reader's card IDs nor existing prayer-body words are changed.

Implemented in the PR:
- `src/pray/daily-formulation-engine.js`: source-safe pure compiler for approved historical prayer variants and Short/Complete composition, with exact language, full text, source link, compound-prayer nonduplication and fail-closed release metadata checks.
- `src/pray/daily-session-timer.js`: ephemeral monotonic stopwatch with pause/resume/reset and optional targets 5/10/15/20 min, designed without persistence, event listeners, notifications or stage index ownership.
- `src/pray/traditional-pray-runtime.js`: in the existing `pray.morning_evening` module, an **opt-in collapsed Timer** button; expanding shows clock, Start/Pause/Resume, Reset and gentle targets. One session clock remains running while navigating ordinary prayer cards or the guided nightly examination. Returning home or reopening a prayer module resets it. It does not interrupt, move, or truncate a prayer.
- `src/pray/traditional-pray-styles.js`: scoped quiet controls, visible focusable buttons, accessible bilingual labels and no overlay that changes the devotional horizontal/vertical reader.
- `tests/daily-formulation-engine.mjs`: tests historical publication holds, language identity, exact body preservation, combined forms, complementary night prayer selections, 11/13 baseline, timer time and no auto navigation.
- `package.json`: adds focused Node test and includes it in the required main npm test chain.

## Prior CI failure diagnosed and corrected

Earlier draft HEAD `eee9efc5...` failed the required main gate **inside the new synthetic test fixture**, because a historical witness ID `noSource` incorrectly violated the engine's slug policy. It was corrected to `no-source` in the fixture; this does **not** relax source provenance validation. The latest amended CI jobs must pass before considering the PR ready. No passing status should be asserted merely because code has been committed.

## UI and data boundaries

- **Historical formulation tabs are intentionally not displayed in the live reader yet.** The research corpus consists of texts with pending user editorial approval and jurisdictional reuse checks. Runtime exposure is fail-closed until a release-approved manifest is checked in.
- The standalone interactive editorial preview built separately does not count as a live integration or source/reuse approval.
- Current reader shows **only the optional timer** if this feature PR is merged. No automatic Short/Complete toggle is shown until texts are approved.
- No local or remote storage of timer data, duration targets, completion marks, confession/examen content, or intimate notes.
- Formulation preferences will be stored separately by stage and language only after the approved publication manifest and reader integration are ready; `normalizedDailySelections` currently provides a pure normalizer but not persistence.

## Acceptance targets

1. Required main regression suite including new focused test succeeds.
2. Traditional Daily dual-axis phone acceptance, Pray guided cards, focus/accessibility and route back tests succeed. Any regressions addressed before promotion.
3. Verify timer is initially **collapsed** and **not running**, target reached makes only a small text notice, and no timer event changes `S.dailyStep`.
4. Verify page and route exits release the interval and time state; navigating the existing Nightly Examen subroute preserves the active prayer session.
5. UI screenshot review for 320px/desktop layout, including long French text and reduced motion.

**Release hold:** This is a draft implementation. No merge/deploy action requested; do not publish uncleared traditional texts or change Mass/Home/Calendar.
