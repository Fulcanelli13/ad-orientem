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
| Settings | `AO_SETTINGS_APP_V1` | `src/settings` |

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

This certifies `NON_MASS_DONOR_EXTRACTION.progress.learn` only. At Phase 8 the overall blocker remained open because Home enrichers and Settings extraction were unfinished.

## Phase 9: modular Settings extraction

Settings presentation and runtime ownership are now extracted into `src/settings` and owned by `AO_SETTINGS_APP_V1`. The app host routes Settings directly to that owner and fails closed if it is unavailable; normal production no longer probes `AO_SETTINGS_V4359`, `AO_SETTINGS_V4358`, `AO_SETTINGS_V4356`, or the historical `utility.settings` module. Those owners remain donor evidence only.

The modular Settings surface preserves the approved English/French control set and writes through the canonical application state owners rather than inventing a parallel preference store: language, Mass form/follow/text/participation preferences, posture and gesture profiles, Communion and Confiteor options, Sunday Asperges, text scale, reduced motion, haptics and local-posture reset. The temporary Settings sheet embedded in modular Home is retired, preserving the one-state/one-surface rule.

Sources/About remains inside Settings and is not a seventh top-level destination. D6 reader-facing source families, provenance labels, privacy text and canonical application-version ownership are native to the modular Settings presentation. `src/app/nonmass-convergence.js` no longer activates historical Settings D6 compatibility hooks during normal production.

Settings continues to obey the locked active-Mass exception. It may overlay an active native R17 session without suspending or restarting the Mass. Structural Mass changes and haptics remain governed by the single `src/app/live-session-guards.js` owner; permitted display preferences may still change. Closing Settings restores the same reader/shell surface and drops focus before hiding/removing the dialog. Production phone acceptance proves same-reader continuity, unchanged LIVE position and resolved Mass form, structural lockout, permitted display persistence, zero historical Settings visibility, zero legacy Mass starts, and no focus/`aria-hidden` warnings.

This certifies `NON_MASS_DONOR_EXTRACTION.progress.settings` as `MODULAR_PHONE_CERTIFIED`. The overall blocker remains open for the still-pending Home enrichers; Settings has no remaining extraction blocker.

## Phase 10: modular Home enrichers and final application promotion

Home enrichment ownership is now extracted into `src/home/enrichers.js`. The modular Home owns Coming Up and Daily Catechism presentation; historical `AO_COMING_UP_V4323` and donor Daily Catechism Home cards are no longer production presentation owners. The Home owner continuously removes asynchronously reinserted donor cards while preserving the underlying canonical rule and Daily Catechism services.

Coming Up retains the recovered behavioral contract—dynamic prayer timing, daily rule items and liturgical/upcoming observances—but routes visible presentation through the modular Home and canonical app destinations. Its icons and UI controls are bound to the canonical V4/V4.1.1 asset registry. Actual-index phone acceptance proves both modular enricher cards are present at cold Home and after PRAY → Home, while donor Home cards remain absent.

With Calendar, Home, PRAY, Learn and Settings all modular and phone-certified, `NON_MASS_DONOR_EXTRACTION` is closed. The application release gate is promoted to **FINAL_APP_READY** with zero open app blockers. The Mass subsystem remains independently certified as **FINAL_NATIVE_READY** with `R17_NATIVE` production default and legacy explicit rollback only.

Before calling app convergence complete:

1. The modular shell must own visible six-destination navigation rather than merely observe/delegate it. **Closed in Phase 3.**
2. The full phone journey must be automated from cold launch across Home, Calendar, Mass, PRAY and Settings. **Closed.**
3. The emergency v43.33 runtime must be retired or decomposed into explicit final owners without losing required live-session protections. **Closed: protections are modular and the embedded runtime is physically removed.**
4. The duplicate browser-entry include must be removed and locked out by production-tree hygiene. **Closed.**
5. Each non-Mass donor owner must be retired only after its extracted module passes parity and phone acceptance. **Closed for Calendar, Home, PRAY, Learn and Settings.**
6. Fresh-state, interrupted-Mass, reload/resume and cross-module persistence must be regression-tested so historical local state cannot reactivate obsolete surfaces. **Closed by the actual-index phone journey and persistence acceptance.**

## Regression gates

The app-level gate exercises cold launch → Home → Calendar → Mass selection → native LIVE → Settings overlay/restore → leave/resume → PRAY → Home → Settings, plus the modular Learn route Home → Learn → Home and Learn → PRAY/Calendar/Settings, on real phone/touch geometry. It also verifies modular Home Coming Up/Daily Catechism ownership and rejects resurfaced donor Home cards. Settings acceptance additionally proves direct modular ownership, Sources/About/version parity, preference persistence, structural lockout during LIVE, focus safety and zero historical Settings fallback. The existing Mass convergence and phone suites remain mandatory and independent.
