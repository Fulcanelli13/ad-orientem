# Final application convergence

## Authority

Production Mass authority is the modular R17 stack on `main`. The October 4 field rescue tree is historical evidence only and must not become an app-shell donor.

The non-Mass donor is the locked `Ad_Orientem_NON_MASS_HEAD_v1.html`, whose release authority identifies v43.59.30. It supplies the application-shell, Home, Settings, Calendar/Learn and final PRAY presentation contracts to recover while the monolith is decomposed.

## Locked top-level application contract

The primary destinations are exactly:

`Home · Mass · Pray · Learn · Calendar · Settings`

Sources is not a top-level destination. It belongs under Settings/About.

Legacy/current ownership during extraction:

| Surface | Current production owner / entry point | Locked target / modular target |
| --- | --- | --- |
| Home | `AO_NAV_V362.home()` | `src/app` + `src/home` |
| Mass | domain entry only | current `src/mass` R17 production stack |
| Pray | `AO_PRAY_APP_V1` + modularized locked v43.59.30 `AO_PRAY_V435930` presentation | `src/pray` |
| Learn | `AO_LEARN_APP_V1` | `src/learn` |
| Calendar | `today.calendar` | `src/calendar` |
| Settings | `AO_SETTINGS_V4359` | future `src/settings` |

The locked v43.59.30 PRAY runtime is now extracted into `src/pray`: one shell, one interaction vocabulary and one recitation grammar over the canonical 48-prayer corpus. `AO_PRAY_APP_V1` owns app routing while `AO_PRAY_V435930` remains the presentation contract. The obsolete `AOTraditionalPrayerBook` may remain embedded temporarily as donor debt, but modular PRAY never falls back to it. Neither prayer surface owns Mass.

## Phase 1 landed here

`src/app/contracts.js` freezes the six-destination contract and the recovered donor ownership names.

`src/app/host-adapter.js` is the temporary anti-corruption layer around the monolith. It uses the final donor's public owners instead of DOM selectors: hard Home through `AO_NAV_V362`, domains/modules through `AO_V37_SHELL`, and Settings through the modern settings owner.

`src/app/shell-controller.js` becomes the first modular application-navigation coordinator. It preserves the locked behavior that Settings may open over an active Mass, tapping Mass while LIVE retains the session, and changing to another app domain while LIVE requires an explicit leave decision before the canonical hard-Home reset.

No Mass reader/runtime file is modified by this phase. In particular, this work must remain merge-disjoint from any native-reader cutover branch.

## Phase 2 audit: assembled-app regression gate

The first post-reader audit found that the modular application shell was present only as an adapter. Phase 3 promotes `AO_APP_SHELL_V1` to the visible six-destination ribbon owner while retaining the final donor-backed destination renderers underneath. The historical ribbon still supplies the visual markup, but its `data-ao-ribbon` click ownership is stripped after render and replaced with modular `data-ao-app-surface` ownership.

The production `index.html` no longer contains the embedded `AO_EMERGENCY_STABLE_V4333` runtime. Its live-session responsibilities were first extracted into `src/app/live-session-guards.js`, then the 74-line emergency CSS/JS layer was physically removed and regression-locked by production-tree hygiene. The duplicated `src/mass/browser-entry.js` module tag also remains removed and locked at exactly one include.

The existing real-shell browser tests prove native Mass ownership and phone geometry for certified Mass/special-rite paths, but they do not yet exercise the complete application journey through visible navigation. In particular, they do not currently prove cold launch → Home → Calendar → Mass selection → native LIVE → leave/resume → PRAY → Home → Settings.

The app-convergence workflow therefore owns a stronger regression gate from Phase 2 onward: app-shell changes, production `index.html`, the browser entry, app-shell tests and package-script changes must run both the app-shell contract/tree-hygiene checks and the real phone/touch suite. This closes the previous gap where a pure `src/app/**` change could pass only the unit contract.

## Phase 2.1: independent application release gate

`data/presentation/app-release-gate.v1.json` now separates whole-application readiness from Mass-reader certification. The reader gate remains authoritative for the Mass subsystem; the application gate is authoritative for shell, non-Mass integration and cross-domain release readiness.

The first gate snapshot records three closed app-level findings: certified Mass subsystem ownership, complete real-shell special-structure evidence, and the Prayer Book focus/aria guard. It keeps the following work explicitly open rather than allowing reader certification to imply application convergence:

- visible modular shell ownership;
- the full cross-domain phone journey;
- retirement/decomposition of the emergency runtime;
- removal and lockout of the duplicated browser-entry include; **closed**
- non-Mass donor extraction/parity;
- persistence/state-contamination acceptance across reload, interrupted Mass and module switching.

The app gate uses only the regression classifications `PASS`, `REGRESSION`, `STALE_SURFACE`, `MISSING_INTEGRATION` and `CRASH`. `tests/app-release-gate.mjs` ensures the listed open blockers exactly match the open findings while independently asserting that the Mass reader remains `FINAL_NATIVE_READY` with `R17_NATIVE` production default.

## Phase 3: visible shell ownership

`src/app/browser-entry.js` now adopts the production `#ao-global-ribbon` as the visible modular navigation surface. It preserves the approved six-destination visual presentation while replacing the historical anonymous ribbon click owner with `AO_APP_SHELL_V1` routing.

The adoption layer rewrites ribbon buttons from `data-ao-ribbon` to `data-ao-app-surface`, stamps `data-ao-owner="AO_APP_SHELL_V1"`, keeps active-state painting synchronized with the modular shell controller, and re-adopts after any historical ribbon re-render. The underlying Home, Learn and Settings renderers remain temporary donors at this phase. Calendar and PRAY presentation ownership are extracted in later phases. This phase changes navigation ownership only and does not revive or modify the historical Mass renderer.

Real-shell phone acceptance now requires all six modular ribbon buttons to be present, zero legacy ribbon click attributes to remain, and the document-level shell owner to report `AO_APP_SHELL_V1` while R17 remains the production Mass owner.

## Phase 4: modular Calendar extraction

Calendar presentation ownership is now extracted from the v43.59.30 donor into `src/calendar/browser-entry.js`. The modular owner retains the donor's user-facing contract: exact-date resolution, DD/MM/YYYY Go semantics, separate Today action, seven-day navigation, Proper/readiness metadata, filtered commemorations, and returning to Home with the chosen date preserved.

The app host prefers `AO_CALENDAR_APP_V1` and only retains `today.calendar` as a fail-safe fallback. Actual-index phone acceptance requires `#ao-calendar-modular-root`, requires the app shell to report the modular Calendar owner, and rejects an active v25 donor Calendar panel. Calendar keeps the permanent six-destination app ribbon above its surface.

This closes Calendar presentation extraction only. `NON_MASS_DONOR_EXTRACTION` remains open for Home/Coming Up, PRAY, Learn and Settings at this phase; PRAY is closed by Phase 7.

## Phase 5: modular live-session guards

The native Mass reader no longer relies on the embedded v43.33 emergency layer for application-level live-session protection. `src/app/live-session-guards.js` now owns the cross-application protections that still matter while Mass is active: the global app ribbon is suppressed, haptics are forced off, structural Mass settings are blocked, and focus is dropped before a ribbon is hidden so the historical `aria-hidden` focused-descendant failure cannot recur.

The guard recognizes the actual connected native reader, not only the historical core route, so it remains correct when modular shell navigation and the old donor route temporarily disagree. The actual-index cross-domain phone journey certifies this ownership.

`EMERGENCY_RUNTIME_RETIREMENT` is now **closed**. The historical v43.33 emergency layer has been physically removed from `index.html`; the modular guard remains the sole owner of the required live-session protections, with actual-index journey coverage.

## Phase 6: modular Home navigation ownership

`AO_HOME_APP_V1` now owns the top-level Home reset/navigation path. The modular shell no longer needs to call `AO_NAV_V362.home()` when the modular Home owner is available; it directly closes transient surfaces, clears Home-sheet/scripture state, leaves historical prepare/live/thanksgiving routes where necessary, restores Settings' Home state, and marks the existing Home surface with `data-ao-home-owner="modular-home-v1"`.

This is deliberately **not** recorded as full Home extraction yet. The visible Home card stack still contains donor-owned presentation, including Coming Up and Daily Catechism. The actual-index phone journey certifies modular Home navigation ownership while the app gate keeps Home presentation pending.

## Phase 7: modular PRAY presentation ownership

The locked v43.59.30 PRAY contract is now extracted into modular source rather than reached through the obsolete PrayerBook. `src/pray/canonical-data.js` carries the exact 48-prayer corpus from the locked non-Mass donor; `presentation-runtime.js` and `presentation-coherence.js` preserve the final v43.59.30 interaction/recitation contract; and `presentation-styles.js` preserves the approved presentation while integrating it with the persistent six-destination ribbon.

`AO_PRAY_APP_V1` owns the application route. It opens only `AO_PRAY_V435930` / `#aoPray435930`, stamps stable modular ownership, and fails closed if the final presentation is unavailable. The host adapter does not fall back to `AOTraditionalPrayerBook`. Hard Home explicitly closes modular PRAY before mounting Home, and the persistent ribbon remains physically reachable while PRAY is open.

Static regression locks verify the 48-record corpus and extracted presentation assets. Actual-index phone acceptance proves Home → PRAY → Home using the final v43.59.30 surface, verifies the obsolete `#aoPrayerBookRoot` is not open underneath it, and leaves the certified R17 Mass subsystem unchanged.

## Phase 8: modular Learn extraction

The locked v43.59.30 Learn hub is now extracted into `src/learn` and owned by `AO_LEARN_APP_V1`. The recovered donor contract is intentionally small: Daily Catechism; Understand the Mass; Traditional Catechism; Today’s Gospel; and Saint of the Day, grouped under Daily formation, Courses & study, and Today in context with the donor’s English/French copy and featured-card hierarchy.

The old v37 domain shell is no longer a production fallback for Learn. `src/app/host-adapter.js` routes Learn directly to `AO_LEARN_APP_V1` and fails closed if that owner is unavailable. The modular hub launches the existing canonical child modules without the historical `{surface:"domain",domain:"learn"}` return context, so closing a child returns to the modular hub instead of reviving `AO_V37_SHELL`. The v37 four-domain dock and its utility Sources link are compatibility navigation and are not copied into Learn; Sources remains under Settings/About and the six-destination ribbon remains owned by `AO_APP_SHELL_V1`.

Hard Home and Settings transitions explicitly close modular Learn, preventing hidden donor or modular Learn surfaces from remaining active underneath the destination. The Learn root carries stable DOM ownership markers and keeps the permanent app ribbon reachable. Actual-index phone acceptance covers Home → Learn → Home plus Learn → Pray, Calendar and Settings, checks touch geometry and focus/aria safety, rejects visible v37 Learn ownership, and verifies that no Mass reader/runtime starts during the journey.

This certifies `NON_MASS_DONOR_EXTRACTION.progress.learn` only. The overall blocker remains open because Home enrichers and Settings extraction remain unfinished.

## Next promotion step

Continue donor retirement without replacing the production host wholesale. Calendar, PRAY and Learn presentation are now modular and phone-certified. The remaining non-Mass extraction work is Home/Coming Up presentation and Settings. Each extraction replaces one donor owner only after parity tests pass and must not create a second visible surface for the same state. Do not copy any historical Mass renderer back into production.

Before calling app convergence complete:

1. The modular shell must own visible six-destination navigation rather than merely observe/delegate it. **Closed in Phase 3.**
2. The full phone journey must be automated from cold launch across Home, Calendar, Mass, PRAY and Settings.
3. The emergency v43.33 runtime must be retired or decomposed into explicit final owners without losing required live-session protections. **Closed: protections are modular and the embedded runtime is physically removed.**
4. The duplicate browser-entry include must be removed and locked out by production-tree hygiene. **Closed.**
5. Each non-Mass donor owner must be retired only after its extracted module passes parity and phone acceptance.
6. Fresh-state, interrupted-Mass, reload/resume and cross-module persistence must be regression-tested so historical local state cannot reactivate obsolete surfaces.

## Regression gates

The app-level gate must exercise cold launch → Home → Calendar → Mass selection → native LIVE → leave/resume → PRAY → Home → Settings, plus the modular Learn route Home → Learn → Home and Learn → PRAY/Calendar/Settings, on real phone/touch geometry. The existing Mass convergence and phone suites remain mandatory and independent.
