# Divine Office — extracted Compline core

**Purpose:** Split tested, reusable 1960 Roman Compline code from oversized draft PR #1950 without publishing an Office or adding a public Prayer route.

## Scope

This branch is based directly on `main`, not on the research branch. It extracts the pinned text reader, common source-section parser, seven weekday psalm profiles, eight explicit Advent I 2026 civil-date appointments (28 November–5 December), source-preserving 42-block trilingual Compline model and regression tests. The 30 November St Andrew II-class appointment uses Sunday Compline; the 2–4 December III-class celebrations use their corresponding weekday psalms. Unreviewed dates are withheld.

The reader uses exactly the pinned upstream Divinum Officium revision `126a07f91ede04664108abb6fb20ace3f4de14b9`; there is no new online provider, backend, paid service, annual raw capture or persistence. Source fixtures contain only texts required to reproduce the eight bounded integration tests.

## Prayer integration — intentionally disabled

`src/pray/divine-office-readiness-gate.js` establishes the *read-only* interface for a future Prayer-module handoff. It returns explicit internal research eligibility and public-release flags. It does **not** register `pray.divine_office`, update `INTERNAL_PRAYER_VIEWS`, add homepage or navigation links, install a lazy module, or enable public routing. All liturgical, translation, local-calendar and source-rights approval fields remain false. This is a safety prerequisite to integration, not a product launch.

## Research and release boundaries

The private First Vespers proof, printed-witness ledgers, 168-record historical annual source index, general metadata sweeps and unapproved texts stay in draft PR #1950. **Do not merge #1950 as a single release.** Future First Vespers and other canonical Hours should use smaller subsequent PRs following the same source-first pattern. This focused PR does not include the Vespers prototype or its private browser HTML. It also does not certify these Compline Hours for published public prayer.

### Acceptance

The focused GitHub workflow runs syntax checks, complete source-first Saturday and Tuesday Compline tests, all seven ordinary-week psalm profiles, eight actual December appointments and the fail-closed Prayer integration gate. No deployment, app bundle mutation or GitHub Pages publication is performed.
