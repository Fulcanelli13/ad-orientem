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

## Next promotion step

Promote the locked non-Mass donor as the visible host while retaining the current modular R17 browser entry, then remove the donor's anonymous navigation listener only when the modular shell owns the same six-destination behavior under browser tests. Do not copy its historical Mass renderer back into production.

After host promotion, extract in this order: Home/Coming Up, Calendar dashboard and pre-Mass selection entry, PRAY, Learn, Settings. Each extraction replaces one donor owner only after parity tests pass; it must not create a second visible surface for the same state.

## Regression gates

The app-level gate must eventually exercise cold launch → Home → Calendar → Mass selection → native LIVE → leave/resume → PRAY → Home → Settings on real phone/touch geometry. The existing Mass convergence and phone suites remain mandatory and independent.
