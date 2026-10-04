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

The first post-reader audit found that the modular application shell is present but is still an adapter rather than the visible owner. `AO_APP_SHELL_V1` is explicitly passive, while the historical global ribbon still owns click navigation and the non-Mass surfaces remain monolith-owned.

The production `index.html` also still contains two cleanup debts that must not become permanent architecture: the embedded `AO_EMERGENCY_STABLE_V4333` runtime and a duplicated `src/mass/browser-entry.js` module tag. These are app-shell convergence items, not Mass-engine blockers. The emergency runtime may only be removed after any still-required live-session locks are owned by the final modular shell/settings path.

The existing real-shell browser tests prove native Mass ownership and phone geometry for certified Mass/special-rite paths, but they do not yet exercise the complete application journey through visible navigation. In particular, they do not currently prove cold launch → Home → Calendar → Mass selection → native LIVE → leave/resume → PRAY → Home → Settings.

The app-convergence workflow therefore owns a stronger regression gate from Phase 2 onward: app-shell changes, production `index.html`, the browser entry, app-shell tests and package-script changes must run both the app-shell contract/tree-hygiene checks and the real phone/touch suite. This closes the previous gap where a pure `src/app/**` change could pass only the unit contract.

## Next promotion step

Promote the locked non-Mass donor as the visible host while retaining the current modular R17 browser entry, then remove the donor's anonymous navigation listener only when the modular shell owns the same six-destination behavior under browser tests. Do not copy its historical Mass renderer back into production.

After host promotion, extract in this order: Home/Coming Up, Calendar dashboard and pre-Mass selection entry, PRAY, Learn, Settings. Each extraction replaces one donor owner only after parity tests pass; it must not create a second visible surface for the same state.

Before calling app convergence complete:

1. The modular shell must own visible six-destination navigation rather than merely observe/delegate it.
2. The full phone journey must be automated from cold launch across Home, Calendar, Mass, PRAY and Settings.
3. The emergency v43.33 runtime must be retired or decomposed into explicit final owners without losing required live-session protections.
4. The duplicate browser-entry include must be removed and locked out by production-tree hygiene.
5. Each non-Mass donor owner must be retired only after its extracted module passes parity and phone acceptance.

## Regression gates

The app-level gate must exercise cold launch → Home → Calendar → Mass selection → native LIVE → leave/resume → PRAY → Home → Settings on real phone/touch geometry. The existing Mass convergence and phone suites remain mandatory and independent.
