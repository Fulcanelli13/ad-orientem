# Final application convergence

## Authority

Production Mass authority is the modular R17 stack on `main`. The October 4 field rescue tree is historical evidence only and must not become an app-shell donor.

The non-Mass donor is the locked `Ad_Orientem_NON_MASS_HEAD_v1.html`, whose release authority identifies v43.59.30. It supplies the application-shell, Home, Settings, Calendar/Learn and final PRAY presentation contracts to recover while the monolith is decomposed.

## Locked top-level application contract

The primary destinations are exactly:

`Home · Mass · Pray · Learn · Calendar · Settings`

Sources is not a top-level destination. It belongs under Settings/About.

Legacy donor ownership during extraction:

| Surface | Donor owner / entry point | Modular target |
| --- | --- | --- |
| Home | `AO_NAV_V362.home()` | `src/app` + future `src/home` |
| Mass | domain entry only | current `src/mass` R17 production stack |
| Pray | `AO_PRAY_V435930` behind the domain shell | future `src/pray` |
| Learn | domain shell | future `src/learn` |
| Calendar | `today.calendar` | `src/calendar` |
| Settings | `AO_SETTINGS_V4359` | future `src/settings` |

The v43.59.30 PRAY runtime remains the non-Mass prayer presentation donor: one shell, one interaction vocabulary and one recitation grammar over the canonical 48-prayer corpus. It does not own Mass.

## Phase 1 landed here

`src/app/contracts.js` freezes the six-destination contract and the recovered donor ownership names.

`src/app/host-adapter.js` is the temporary anti-corruption layer around the monolith. It uses the final donor's public owners instead of DOM selectors: hard Home through `AO_NAV_V362`, domains/modules through `AO_V37_SHELL`, and Settings through the modern settings owner.

`src/app/shell-controller.js` becomes the first modular application-navigation coordinator. It preserves the locked behavior that Settings may open over an active Mass, tapping Mass while LIVE retains the session, and changing to another app domain while LIVE requires an explicit leave decision before the canonical hard-Home reset.

No Mass reader/runtime file is modified by this phase. In particular, this work must remain merge-disjoint from any native-reader cutover branch.

## Phase 2 audit: assembled-app regression gate

The first post-reader audit found that the modular application shell was present only as an adapter. Phase 3 promotes `AO_APP_SHELL_V1` to the visible six-destination ribbon owner while retaining the final donor-backed destination renderers underneath. The historical ribbon still supplies the visual markup, but its `data-ao-ribbon` click ownership is stripped after render and replaced with modular `data-ao-app-surface` ownership.

The production `index.html` also still contains two cleanup debts that must not become permanent architecture: the embedded `AO_EMERGENCY_STABLE_V4333` runtime and a duplicated `src/mass/browser-entry.js` module tag. These are app-shell convergence items, not Mass-engine blockers. The emergency runtime may only be removed after any still-required live-session locks are owned by the final modular shell/settings path.

The existing real-shell browser tests prove native Mass ownership and phone geometry for certified Mass/special-rite paths, but they do not yet exercise the complete application journey through visible navigation. In particular, they do not currently prove cold launch → Home → Calendar → Mass selection → native LIVE → leave/resume → PRAY → Home → Settings.

The app-convergence workflow therefore owns a stronger regression gate from Phase 2 onward: app-shell changes, production `index.html`, the browser entry, app-shell tests and package-script changes must run both the app-shell contract/tree-hygiene checks and the real phone/touch suite. This closes the previous gap where a pure `src/app/**` change could pass only the unit contract.

## Phase 2.1: independent application release gate

`data/presentation/app-release-gate.v1.json` now separates whole-application readiness from Mass-reader certification. The reader gate remains authoritative for the Mass subsystem; the application gate is authoritative for shell, non-Mass integration and cross-domain release readiness.

The first gate snapshot records three closed app-level findings: certified Mass subsystem ownership, complete real-shell special-structure evidence, and the Prayer Book focus/aria guard. It keeps the following work explicitly open rather than allowing reader certification to imply application convergence:

- visible modular shell ownership;
- the full cross-domain phone journey;
- retirement/decomposition of the emergency runtime;
- removal and lockout of the duplicated browser-entry include;
- non-Mass donor extraction/parity;
- persistence/state-contamination acceptance across reload, interrupted Mass and module switching.

The app gate uses only the regression classifications `PASS`, `REGRESSION`, `STALE_SURFACE`, `MISSING_INTEGRATION` and `CRASH`. `tests/app-release-gate.mjs` ensures the listed open blockers exactly match the open findings while independently asserting that the Mass reader remains `FINAL_NATIVE_READY` with `R17_NATIVE` production default.

## Phase 3: visible shell ownership

`src/app/browser-entry.js` now adopts the production `#ao-global-ribbon` as the visible modular navigation surface. It preserves the approved six-destination visual presentation while replacing the historical anonymous ribbon click owner with `AO_APP_SHELL_V1` routing.

The adoption layer rewrites ribbon buttons from `data-ao-ribbon` to `data-ao-app-surface`, stamps `data-ao-owner="AO_APP_SHELL_V1"`, keeps active-state painting synchronized with the modular shell controller, and re-adopts after any historical ribbon re-render. The underlying Home, Calendar, PRAY, Learn and Settings renderers remain temporary donors; this phase changes navigation ownership only and does not revive or modify the historical Mass renderer.

Real-shell phone acceptance now requires all six modular ribbon buttons to be present, zero legacy ribbon click attributes to remain, and the document-level shell owner to report `AO_APP_SHELL_V1` while R17 remains the production Mass owner.

## Phase 4: modular Calendar extraction

Calendar presentation ownership is now extracted from the v43.59.30 donor into `src/calendar/browser-entry.js`. The modular owner retains the donor's user-facing contract: exact-date resolution, DD/MM/YYYY Go semantics, separate Today action, seven-day navigation, Proper/readiness metadata, filtered commemorations, and returning to Home with the chosen date preserved.

The app host prefers `AO_CALENDAR_APP_V1` and only retains `today.calendar` as a fail-safe fallback. Actual-index phone acceptance requires `#ao-calendar-modular-root`, requires the app shell to report the modular Calendar owner, and rejects an active v25 donor Calendar panel. Calendar keeps the permanent six-destination app ribbon above its surface.

This closes Calendar presentation extraction only. `NON_MASS_DONOR_EXTRACTION` remains open for Home/Coming Up, PRAY, Learn and Settings.

## Next promotion step

Promote the locked non-Mass donor as the visible host while retaining the current modular R17 browser entry, then remove the donor's anonymous navigation listener only when the modular shell owns the same six-destination behavior under browser tests. Do not copy its historical Mass renderer back into production.

After host promotion, extract in this order: Home/Coming Up, Calendar dashboard and pre-Mass selection entry, PRAY, Learn, Settings. Calendar presentation is now modular and phone-certified; Home/Coming Up is the next extraction target. Each extraction replaces one donor owner only after parity tests pass; it must not create a second visible surface for the same state.

Before calling app convergence complete:

1. The modular shell must own visible six-destination navigation rather than merely observe/delegate it. **Closed in Phase 3.**
2. The full phone journey must be automated from cold launch across Home, Calendar, Mass, PRAY and Settings.
3. The emergency v43.33 runtime must be retired or decomposed into explicit final owners without losing required live-session protections.
4. The duplicate browser-entry include must be removed and locked out by production-tree hygiene.
5. Each non-Mass donor owner must be retired only after its extracted module passes parity and phone acceptance.
6. Fresh-state, interrupted-Mass, reload/resume and cross-module persistence must be regression-tested so historical local state cannot reactivate obsolete surfaces.

## Regression gates

The app-level gate must exercise cold launch → Home → Calendar → Mass selection → native LIVE → leave/resume → PRAY → Home → Settings on real phone/touch geometry. The existing Mass convergence and phone suites remain mandatory and independent.
