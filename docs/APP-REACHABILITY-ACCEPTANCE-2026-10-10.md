# Production feature reachability — 10 October 2026

This is the current **production navigation and launcher audit**, superseding the
historical six-tab route counts in `CONTENT-REACHABILITY-AUDIT-2026-10-09.md`
without altering its archival evidence. See `data/app/content-reachability-audit.v1.json`
for the original 63 identifier census and 39 content kinds.

## Current declared entry points

| Surface | Production contract | Source owner | Evidence boundary |
| --- | --- | --- | --- |
| Ribbon | **5**: Today/Home, Mass, Pray, Learn, Explore | `src/app/contracts.js` | Current source export; actual phone nav covered separately by app-shell journey |
| Utility | **3**: Calendar, Settings, Apostolate | App-shell routes; Calendar via Home | Not additional ribbon tabs |
| Formation | **15** active published launchers | `src/learn/presentation.js` | Exact module import and return require device acceptance |
| Prayer | **23** displayed entries: 22 cards in five families, one direct Prayer Library door | `src/pray/presentation-runtime.js` | 10 cards delegate to first-use modules, 12 to the Prayer owner; Rosary remains its existing player |
| Explore | **6** existing lenses | `src/find/explore-projection.js` | Lens source existence does not certify every individual venue/place |
| Shared reference | One contextual Scripture/Glossary reference layer | `src/scripture`, `src/glossary` | Certified local Bible editions and full context claims remain gated |

The original nine research/compatibility/retired distinctions must not be
collapsed into "missing buttons". In particular, `learn.apologetics` and
`learn.church_crisis` stay unpublished; `learn.catholic_life` is retired;
`learn.seasonal_rites` is a Calendar compatibility route. Do **not** publish
uncertified content or add duplicate dashboard cards to repair this audit.

## Acceptance strengthened in this batch

- `tests/content-reachability-current.mjs` mechanically compares the actual
  production sources against the five permanent routes, three utilities,
  fifteen Formation cards, twenty-three Prayer entries, ten lazy Prayer
  routes and six Explore lenses. Integrated into `app-shell-contract`.
- `tests/pray-all-modules-mobile.mjs` now taps **all ten external Prayer
  family buttons**, verifies that the requested canonical owner and visible
  text render, and exercises return to the *same* Prayer family. It also
  checks the full displayed 23-ID set and 44px card targets. Existing tests
  separately exercise the 16 core Prayer routes, 48 individual library
  prayers, Rosary and the Formation/Calendar phone journeys.

These are acceptance tests, **not a claim of release readiness**. The phone
suite must pass on the PR SHA before asserting the ten external paths have
been verified. A source-level count alone cannot certify all 3,849 indexed
leaf items or original provenance.

## Remaining work ordered by user impact

1. Close any failing entry/return path found by the new mobile test; do not
   weaken the expected ID set or mask failed launches.
2. Extend a similar cold entry/tap/back acceptance pass to **all 15**
   Formation modules; existing formation phone tests check only selected
   modules and all eight traditional guides, not an exhaustive 15/15 tap loop.
3. Verify Explore filter/search/map pagination and source drawer for every
   publishable indexed type, **without** pretending each item has a verified
   physical location or Mass timetable.
4. Test bilingual return state and focus across Calendar → Prayer,
   Explore → Calendar and contextual Scripture/Glossary handoffs.
5. Reconcile truly hidden accepted content against
   [canonical Issue #342](https://github.com/Fulcanelli13/ad-orientem/issues/342);
   give one owner, publication status and evidence trace for each record.
   Preserve existing holds, including [Issue #271](https://github.com/Fulcanelli13/ad-orientem/issues/271)
   for exact missing non-Mass donor bytes.

Do not reopen corrected Home fallback (PR #766), the two formerly isolated
place profiles (PR #765), or the merged navigation repairs #820, #826, #831,
#834, #836 and #842 unless a new reproducible regression is found.
