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
5. PRAY: scoped catalogue cards, ordinary titles and muted metadata converge to the approved quiet palette. Immersive prayer readers and devotional stages are explicitly excluded.

## Deferred to the next integration slices
- Real navigable Mass setup picker/sheet; its existing setup logic and celebration selection require an owner-level audit before restyling.
- Structured Pray landing layout with exactly six illustrated feature tiles: preserve editorial group taxonomy and deep links while redesigning hierarchy.
- Consistent non-Today headers, desktop left rail, Explore draggable sheet, Formation and Settings rows.
- Art credit placement and responsive art aspect ratios on 320/390/768px viewports.
- Mass LIVE, Missal and Simple visual adjustments only after separate behaviour-regression suite passes.
- Calendar month list toggle alongside the existing grid/year wheel, never replacing existing views.

## Acceptance gates
- `node tests/design-system-coherence.mjs`
- `node tests/design-system-quiet-frame.mjs`
- Existing Home, app-shell, PRAY, Calendar and reader suites; the branch has not yet been certified against the entire repository test suite.
- Real-browser visual checks at 320, 390, 768 and desktop widths (including missing art, French strings, 200% text zoom, light/dark adaptation as supported, and safe-area handling).
- LIVE 48-card mode and all readers show no content, ritual or navigation regressions.
- Do **not merge** until visual before/after review and targeted tests are confirmed.

## Known limitation
This first P1 patch is a **foundation and scoped mobile migration**, not the entire screenshot parity redesign. The dynamic styles injected by the legacy feature owners can still compete with central CSS in some states; review computed styles in a browser before promotion.
