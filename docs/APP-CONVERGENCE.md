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

The first post-reader audit found that the modular application shell was initially only an adapter. Phase 2.2 now closes that shell-ownership gap: `AO_APP_SHELL_V1` owns capture-phase clicks on the existing visible six-destination ribbon, synchronizes its active/aria-current state, and prevents the historical ribbon listener from receiving those user clicks. The donor ribbon markup is retained as presentation while navigation authority is modular. Non-Mass surface contents are still donor-owned pending extraction.

The production `index.html` also still contains two cleanup debts that must not become permanent architecture: the embedded `AO_EMERGENCY_STABLE_V4333` runtime and a duplicated `src/mass/browser-entry.js` module tag. These are app-shell convergence items, not Mass-engine blockers. The emergency runtime may only be removed after any still-required live-session locks are owned by the final modular shell/settings path.

`tests/app-shell-journey-e2e.mjs` now exercises the complete actual-index phone journey: cold launch → Home → Calendar → Mass selection → native LIVE → cancelled leave/resume → confirmed leave → PRAY → Home → Settings. It also reloads with the persisted Mass record still present and proves that stale persistence does not reactivate the native reader or contaminate the Home route.

The app-convergence workflow therefore owns a stronger regression gate from Phase 2 onward: app-shell changes, production `index.html`, the browser entry, app-shell tests and package-script changes must run both the app-shell contract/tree-hygiene checks and the real phone/touch suite. This closes the previous gap where a pure `src/app/**` change could pass only the unit contract.

## Phase 2.1: independent application release gate

`data/presentation/app-release-gate.v1.json` now separates whole-application readiness from Mass-reader certification. The reader gate remains authoritative for the Mass subsystem; the application gate is authoritative for shell, non-Mass integration and cross-domain release readiness.

The first gate snapshot records three closed app-level findings: certified Mass subsystem ownership, complete real-shell special-structure evidence, and the Prayer Book focus/aria guard. It keeps the following work explicitly open rather than allowing reader certification to imply application convergence:

- retirement/decomposition of the emergency runtime;
- removal and lockout of the duplicated browser-entry include;
- non-Mass donor extraction/parity;

## Phase 2.3: cross-domain journey and partial persistence acceptance

The actual-index phone gate now proves modular navigation across Home, Calendar, native Mass, PRAY and Settings. While native LIVE owns the screen, a cancelled leave retains the active reader and a confirmed leave explicitly destroys the native reader surface through the app host adapter before opening PRAY. A subsequent reload proves that the retained persisted Mass record does not auto-reactivate R17 or restore an obsolete route.

This closes `CROSS_DOMAIN_PHONE_JOURNEY`. It does **not** yet close `PERSISTENCE_STATE_CONTAMINATION`: explicit reload while Mass is still interrupted, return/resume semantics, saved form/language/mode/profile continuity, and cross-module local-state isolation remain to be certified.

The app gate uses only the regression classifications `PASS`, `REGRESSION`, `STALE_SURFACE`, `MISSING_INTEGRATION` and `CRASH`. `tests/app-release-gate.mjs` ensures the listed open blockers exactly match the open findings while independently asserting that the Mass reader remains `FINAL_NATIVE_READY` with `R17_NATIVE` production default.

## Phase 2.3: cross-domain phone journey

`tests/app-shell-journey-e2e.mjs` now certifies the production app journey on 390×844 touch Chromium: cold Home → Calendar → Mass → native LIVE; a cancelled leave retains the active Mass; a confirmed leave destroys the visible native reader before opening PRAY; Home and Settings remain reachable under modular shell ownership; and a subsequent reload does not allow the persisted Mass record to auto-reactivate either native or legacy Mass.

This closes `CROSS_DOMAIN_PHONE_JOURNEY`. It also supplies partial evidence for persistence hygiene, but `PERSISTENCE_STATE_CONTAMINATION` remains open until reload while an interrupted Mass is still active, resume/return semantics, saved form/language/mode/profile continuity, and cross-module local-state isolation are explicitly exercised.

## Next promotion step

Promote the locked non-Mass donor as the visible host while retaining the current modular R17 browser entry, then remove the donor's anonymous navigation listener only when the modular shell owns the same six-destination behavior under browser tests. Do not copy its historical Mass renderer back into production.

After host promotion, extract in this order: Home/Coming Up, Calendar dashboard and pre-Mass selection entry, PRAY, Learn, Settings. Each extraction replaces one donor owner only after parity tests pass; it must not create a second visible surface for the same state.

Before calling app convergence complete:

1. The modular shell owns visible six-destination navigation and this is certified on actual index.html by `tests/app-shell-visible-owner-e2e.mjs`.
2. The full phone journey is certified on actual index.html by `tests/app-shell-journey-e2e.mjs`, including cancelled/confirmed LIVE leave behavior.
3. The emergency v43.33 runtime must be retired or decomposed into explicit final owners without losing required live-session protections.
4. The duplicate browser-entry include must be removed and locked out by production-tree hygiene.
5. Each non-Mass donor owner must be retired only after its extracted module passes parity and phone acceptance.
6. Fresh-state and stale-record isolation are covered by `tests/app-shell-journey-e2e.mjs`; interrupted-Mass reload/resume, saved form/language/mode/profile continuity and cross-module local-state isolation remain open.

## Regression gates

The app-level gate must exercise cold launch → Home → Calendar → Mass selection → native LIVE → leave/resume → PRAY → Home → Settings on real phone/touch geometry. The existing Mass convergence and phone suites remain mandatory and independent.
