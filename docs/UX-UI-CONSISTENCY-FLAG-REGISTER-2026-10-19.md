# Ad Orientem — Cross-app UX/UI consistency flags

**First pass:** 19 October 2026 · **Baseline:** `main` after PRs #1462, #1464, #1466, #1469, #1472, #1473 and #1475.  
**Evidence:** source review plus the [Visual acceptance run #39270332290](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39270332290), artifact `app-visual-acceptance` (named captures below).  
**Scope:** eight routable top-level surfaces, Scripture overlay, visible nested Calendar / Prayer / Formation readers, and targeted Explore styling. The 63 route entries in `data/app/content-navigation-registry.v1.json` include aliases, nested content and unpublished research: **63 is not a count of visually certified screens.**

## Accepted visual/navigation standard

- Sacred dark palette and dynamic liturgical colour through `src/app/design-system.js` and `src/app/liturgical-theme.js`; restrained sacred typography and icon bank, not duplicated hard-coded palette variants.
- Five-slot ribbon: Today · Mass · Pray · Formation · Explore; Calendar and Settings remain separate navigable surfaces.
- Finite devotional cards: horizontally swipe, vertically scroll prayer text, use one source-owned accessible positional indicator, and reserve prominent actions for genuine exits, recitation/rite boundaries and privacy-sensitive actions.
- No overlay, sticky rail, duplicated heading or optional settings should obscure the current reading focus or the 44px minimum usable control size.
- Avoid extrapolating the Mass LIVE interaction system into other modules where their source-owned structure requires a different UI; protect the existing 48-card LIVE reader and liturgical cues.

## Flag registry

| ID | Surface / page | Severity | Evidence status | Specific discrepancy | Recommendation & test |
| --- | --- | --- | --- | --- | --- |
| UX-01 | **Today → embedded Calendar → Month** (`home`, inline picker) | **P1** | **Observed in capture; runtime obstruction not yet verified** | `02d-calendar-month.png` contains a second Today / Month / Liturgical Year strip visibly crossing the October day grid, on top of the month Previous / Today / Next strip and the global five-slot ribbon. **Correction:** this capture shows **Today's embedded Month view**; the strip is the Home-owned `.aoTodayV2Tabs` (`src/home/today-v2-styles.js`), not the standalone Calendar's `.aoCalV2Tabs`. Standalone Calendar CSS must not be modified on this evidence. A full-page screenshot may displace a sticky element, so this is *not yet proof* of an everyday hit-test obstruction. | Validate actual 320px and 390px viewport scrolling and touch targets. Confirm whether the Home tab is legitimately sticky, and dates remain unobstructed. Capture scrolled screenshots before altering sticky positioning. |
| UX-02 | **Formation → Serve Low Mass** (`learn.serve_mass.responses`) | **P2** | **Confirmed screenshot + code** | `04d-learn-low-mass-responses.png` renders a 15-item trainer as a large, independent Previous / Next button row plus “1 / 15” counter. `src/learn/traditional-life.js` owns `data-ao-tradlearn-trainer` controls. This does not use the app's quieter finite-card navigation/progress idiom; `Reveal response` is the meaningful training action. | Keep `Reveal response` and source text; assess whether the 15 prompts can use a single positional indicator and consistent touch/keyboard card changes. Do not remove explicit Next if the drill needs it until alternate navigation is verified. |
| UX-03 | **Pray → Prayer Library → Single prayer** (example: Act of Contrition) | **P2** | **Confirmed screenshot** | `03b-pray-library-prayer.png` repeats “Act of Contrition” in both the full page header and the inner prayer card. A one-card “01” timeline/underline and repeated “Prayer Library” context consume significant space before the actual prayer. | Treat a single prayer as a single reading surface: suppress redundant one-of-one progress and duplicate card title while keeping individual/group recitation and source disclosure. Verify back-to-library and language toggles. |
| UX-04 | **Pray → Morning & Evening → Guided** | **P2** | **Confirmed screenshot; interpretation to review** | `03g-pray-morning-guided.png` places a large near-empty gradient/frontispiece above a second dot-position row and the first actual prayer. The header, state indicator and decorative block consume more of the initial viewport than comparable guided readers. | Check whether the gradient is an intended meaningful asset or a placeholder. Prefer approved sacred imagery if relevant; otherwise reduce it, keep one readable stage-progress owner, and place the prayer higher. |
| UX-05 | **Pray → Novenas → Browse** | **P3** | **Confirmed screenshot; primarily aesthetic** | `03f-pray-novenas.png` mixes the deep app background with large opaque light-grey notice/cards; these attract more attention than the novena choice. It differs from the quieter reusable prayer-card grammar. | Review colour contrast and semantic prominence without removing Now & Approaching, traditional/suggested start distinction or progress. Use liturgical accent tokens rather than a new palette. |
| UX-06 | **Scripture → Full-screen Bible library/reader** | **P2** | **Confirmed source-token drift; not screenshot-certified** | `src/scripture/styles.js` defines a self-contained `#ao-scripture-overlay` with hard-coded colours, Georgia/Garamond, and literal z-index `2147483647!important`, instead of shared `--ao-*` text, surfaces and elevation tokens. This may be legitimate for full-screen takeover but should be reconciled, not assumed harmless. | Compare the actual Bible overlay at 320/390px against the Mass/Formation reading typography, active liturgical accent and close/back behavior. Replace conflicting literal tokens when proven safe; retain the Bible's content distinctions. |
| UX-07 | **Explore → Sacred Geography / Saints / place sheets** | **P2 – verification priority** | **Source-level divergence; no matching visual capture in artifact** | `src/find/heritage-style.js` includes a large independent set of direct dark/gold colours and card styles, while the shared system covers `#ao-find-modular-root`. `src/find/saints-presentation.js` similarly has distinct styling. *Stylistic inconsistency itself has not been visually established.* | Capture Explore home, map, place sheet and saint biography at 320/390px; compare header, cards, shadows, fonts, icon asset rendering and overlay interaction before touching the map framework. |
| UX-08 | **Apostolate → Scenarios and handoffs** | **P3 – coverage gap** | **Not visually inspected** | Apostolate is routable in `src/app/contracts.js`, but the current named visual-acceptance screenshot artifact has no Apostolate page. The global design system's shared root selector list also does not include `#ao-apostolate-root`; feature styling may already compensate. | Add one home and one in-scenario screenshot and verify 44px controls, return context, dark palette, accents and back behavior. Do not claim the page is broken before inspection. |
| UX-09 | **Pray → Adoration / Benediction cinematic entry** | **P3 – timing/contrast verification** | **Capture-frame only** | `03e-pray-adoration-arrival.png` and `03g-pray-benediction-blessing.png` include a deliberately dark “Solemn moment” transition. On the captured frame the Continue action and explanatory text are very dim. This might be an animation midpoint, not a settled UI defect. | Add a settled/end-of-motion contrast capture, including reduced-motion setting. Preserve sacred restraint but ensure Continue remains legible and tappable. |

## Current status, not flagged as regressions

- **Mass LIVE, Missal and Simple:** retained independent ribbon/rail/focus grammar; do not infer visual failure merely because they differ from Prayer. Current CI has separate reader and language-parity gates.
- **Stations, Seven Psalms, Forty Hours, Benediction, Adoration, Confession, Litany, Seven Words and Divine Mercy:** their recently merged swipe/progress changes passed dedicated acceptance. Monitor rather than reopening the same arrow-button work.
- **Calendar Year wheel and Formation sacramental guides:** the available captures show coherent solemn typography; no broad redesign justified from this review.
- **Settings and main Today/Home:** captured with shared global navigation. No specific blocking inconsistency established in this pass.

## Evidence limitations and acceptance

1. Visual captures are from one GitHub Actions run, at device-width 390px unless otherwise labelled; they do not prove interactive behavior at 320px, 390px and wide desktop across every route.
2. For UX-01 distinguish a true sticky/hit-target collision from a Playwright full-page screenshot compositing artifact **before changing code**.
3. For UX-06/07/08 obtain screenshots first, then change only proven presentation discrepancies.
4. Any correction requires side-by-side before/after captures, mobile swipe/scroll and keyboard checks, language parity, source/ritual ownership, and the relevant existing CI gates.
5. Keep statuses separate: **confirmed mismatch**, **visual candidate**, and **test-coverage gap**. Do not promote a candidate to “broken” without a runtime reproduction.

## Recommended execution order

**Batch A:** UX-01 Calendar sticky tab verification/fix; UX-03 Prayer Library single-card de-duplication; UX-02 Formation trainer progress.  
**Batch B:** UX-04 Morning/Evening first-viewport compression; UX-09 settled cinematic contrast; UX-05 Novena palette polish.  
**Batch C:** first capture Explore + Scripture + Apostolate, then resolve token/spacing divergences demonstrated by the evidence.

This register flags pages and supplies a test plan; it does not silently modify canonical prayer texts, rite controllers, geography records or the 48-card Mass LIVE architecture.
