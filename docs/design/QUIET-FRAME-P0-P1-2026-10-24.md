# Ad Orientem — Quiet Frame UI Consolidation, P0/P1
**Date:** 24 October 2026  
**Status:** review branch; not merged or visually accepted  
**Visual reference:** approved Today, Mass Setup, Pray, Mass Reader and Explore concept mockups from 24 October.

## P0: codebase reconciliation
This is **not** a new web application or separate stylesheet framework.

- Existing central owner: `src/app/design-system.js` (`ao-design-system-v2`), installed in `src/app/browser-entry.js`.
- Liturgical accent authority: `src/app/liturgical-theme.js`. The new quiet-frame **neutral surfaces** do not redefine Mass Proper colours, 1962 calendar selection, or app accent provenance.
- Home/Today presentation: `src/home/presentation.js`, `src/home/today-v2-styles.js`, `src/home/today-v2-sections.js`. Artwork from `data-ao-home-art-slot`; Mass and Calendar actions have existing handlers and must be retained.
- PRAY root and prayer readers: `src/pray/presentation-runtime.js` and `src/pray/presentation-styles.js`. The page is not a disposable template: prayer stages, registry routes, and source disclosers remain separate from its catalogue shell.
- Shared navigation: `src/app/shell-controller.js` and `src/app/browser-entry.js`; `#ao-global-ribbon` is adopted from an existing donor. The controller contains LIVE-Mass exit guards.
- Mass reader: independently governed reader DOM, 48-card LIVE state, Missal/Simple variants, posture/priest/speaker cues and Schola; explicitly **out of scope** for this P1 CSS change.
- Calendar: independently governed year wheel, day/month views, selections and observance rules; no resolver or navigation ownership changes.
- Fonts: existing A2 harmonized serif direction in PR #1490 (documentation) is a preceding design reference. The quiet-frame patch does not replace typeface files or impose system sans.
- Art/icon assets: `src/assets/asset-registry.js`, existing canonical asset IDs and artwork attribution are untouched.

## P1 scope (implemented here)
1. New tokens for #0B0F13 canvas, #141A20 cards, #1C232B raised surfaces, #ECE8DF primary and #A3ABB4 muted text, plus 8% dividers, 16px gutter/radius and 44/48/52/56px control dimensions.
2. Reusable `aoQuiet*` class vocabulary (header, card, list row, primary and secondary action) within the **existing** `design-system.js` owner. Feature owners may progressively consume these classes.
3. Shared 12px bottom tab labels and 24px icon geometry without touching ribbon routing.
4. Today: on the main mobile Today view, redundant embedded calendar switches are visually hidden, but remain available inside the embedded calendar views; artwork title is moved *visually* above artwork; original artwork slot and credit remain intact; primary and secondary actions adopt restrained spacing.
5. PRAY: six prominent source-route-backed entries (Rosary, Daily Prayer, Confession, Adoration, Stations, Novenas), three useful library rows, and an expandable complete legacy family catalogue. Illustrations come from existing asset IDs, not generated runtime images. The navigation implementation is in the existing `src/pray/presentation-runtime.js` and the root-only styling in the existing `src/pray/presentation-styles.js`. Immersive prayer readers and devotional stages are excluded.
6. PRAY phone QA was updated to assert six visible feature entries, three library rows, the ability to expand all historical families, no horizontal overflow and minimum readable text; two unrelated fixture HTTP handlers now read their files before sending headers.

## Deferred to the next integration slices
- Real navigable Mass setup picker/sheet. The existing owner is `src/mass/full-mass-preflight.js` plus `src/mass/full-mass-preflight-styles.js`. **Do not replace** the existing source-owned guided folio with an unrelated modal. It moves live Mass category, form and reader controls into stage slots and preserves source-date, Votive, Nuptial, Requiem, other Proper, optional rites and before/after prayer selections. The next slice should restyle its overview into three compact choices (Mass, celebration form, reader mode) while reusing the same live controls and launch actions.
- PRAY phone screenshot review at 320/390/430px and explicit selection tests for each of the six feature entries; the basic six-tile layout is now implemented.
- Consistent non-Today headers, desktop left rail, Explore draggable sheet, Formation and Settings rows.
- Art credit placement and responsive art aspect ratios on 320/390/768px viewports.
- Mass LIVE, Missal and Simple visual adjustments only after separate behaviour-regression suite passes.
- Calendar month list toggle alongside the existing grid/year wheel, never replacing existing views.

## Acceptance gates
- `node tests/design-system-coherence.mjs`
- `node tests/design-system-quiet-frame.mjs`
- `node tests/nonmass-phone-readability.mjs` (six-feature plus expanded library acceptance)
- Existing Home, app-shell, PRAY, Calendar and reader suites; the branch has not yet been certified against the entire repository test suite.
- Real-browser visual checks at 320, 390, 768 and desktop widths (including missing art, French strings, 200% text zoom, light/dark adaptation as supported, and safe-area handling).
- LIVE 48-card mode and all readers show no content, ritual or navigation regressions.
- Do **not merge** until visual before/after review and targeted tests are confirmed.

## Known limitation
This first P1 patch is a **foundation and scoped mobile migration**, not the entire screenshot parity redesign. The dynamic styles injected by the legacy feature owners can still compete with central CSS in some states; review computed styles in a browser before promotion.

## 24 Oct follow-up: P2a visual convergence (review branch only)
- First cleared three browser-check failures from the previous commit: non-Mass Calendar tests now enter the preserved year wheel through the visible Today seasonal link; Mass preflight tests use the visible three-choice overview rather than a hidden stage tab; Prayer route-owner test helper no longer recursively calls itself.
- Extended the **existing** central stylesheet, not a new UI owner, to cover scoped everyday chrome: Formation header and family cards, Settings header/64px rows/grouping, and Explore header and search input.
- These are *visual-only styles*. The Formation subject and text routes, Settings preference controls and persistence, and Explore mapping/geolocation/evidence workflows were not replaced or reordered.
- Deliberately retained existing five-slot ribbon architecture (Today, Mass, Pray, Formation, Explore), with Settings as a utility overlay, pending separate explicit navigation acceptance. The illustrative five-tab concept would substitute Settings for Mass; do not silently change the approved live navigation contract during palette migration.
- Acceptance pending: screenshot comparison for Formation/Settings/Explore at phone and desktop widths; map and sheet layout, French string lengths, reader/shell regressions, and baseline contrast.
