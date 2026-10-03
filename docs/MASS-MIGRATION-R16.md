# R16 — Mass GitHub migration

## Goal

Move the v1.76 Mass subsystem into the repository without changing behavior.

This is an extraction wave, not a redesign.

## What can move immediately

The following parts are already clean extraction seams and can be committed as standalone files while preserving original load order:

1. `data/mass/v1.76/low-mass.json`
2. `data/mass/v1.76/sung-mass.json`
3. R02–R06 contracts under `src/mass/contracts/`
4. R07–R13 recovery pack
5. R02–R06 form runtimes
6. R05 diagnostics
7. R14 integration UI
8. R15 hardening layer
9. attention / cinematic / salience / personal-action UI runtimes
10. diagnostic bridges and audits

## What must remain temporarily intact

`src/mass/legacy/reader-runtime-v1.76.js`

This is the 6.5 MB reader/runtime owner. It currently contains intertwined ownership for:

- reader rendering and cards;
- MISSAL/SIMPLE/LIVE;
- focus/runway lifecycle;
- priest route and voice;
- posture/gesture rails;
- Schola state/ticker;
- Mass overlay coordination;
- icon mapping;
- QA/export tools;
- transition/cinematic state.

Do not split this file merely by size. Split it only by proven ownership boundaries with a regression gate after each extraction.

## Recommended extraction order from the reader runtime

1. immutable asset/icon registry adapters;
2. calendar/rite-context helpers used by Mass;
3. overlay coordinator;
4. runtime condition resolver;
5. reader card model;
6. MISSAL renderer;
7. SIMPLE renderer;
8. LIVE focus engine;
9. priest route/voice projection;
10. faithful posture/gesture projection;
11. response projection;
12. Schola state/program;
13. bell runtime;
14. cinematics/salience;
15. QA/diagnostics.

## First Git commit

The first migration commit should contain the frozen Mass baseline, this extraction manifest, and extracted modules **without switching the production entry point**.

No behavior owner should be deleted in that commit.

## Second Git commit

Add a modular Mass bootstrap that loads the extracted files in the exact `load-order.json` order while still using `reader-runtime-v1.76.js` intact.

Acceptance: same scenario matrix and same canonical data hashes.

## Later commits

Replace one ownership area at a time inside `reader-runtime-v1.76.js`. After each successful replacement, remove only the corresponding legacy owner.

## Branch

The repository currently has `migration/v43.33`. Keep the whole-app migration isolated there or create a subordinate Mass migration branch from it when repository editing begins. Do not merge directly to `main` until Mass parity is demonstrated.