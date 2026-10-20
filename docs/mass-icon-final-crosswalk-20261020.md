# Mass icon final user lock and source-cue crosswalk — 20 October 2026

These data files preserve the user's exact gallery display names, immutable IDs and permanent rejection decisions. The crosswalk is a SOURCE-AUDIT stage; **it does not change the Mass reader runtime**.

* `mass-icon-final-user-lock-20261020.v1.json`: immutable inventory and historical exclusions.
* `mass-icon-final-cue-crosswalk-20261020.v1.json`: source-owned events from all seven presentation registries, with explicit actor lane, condition, selected art, exact display name and packaging state.

Rules:
1. NEVER rename a user asset, alter an original, or render a permanently rejected ID.
2. Never use a filename as liturgical semantics: source cue ID + actor + exact label controls.
3. TEXT_ONLY is a legitimate cue state; it is NOT permission to choose a closest-looking icon.
4. `ASSET_IMPORT_REQUIRED` is not app-ready. Bundle the actual approved payload and certify SHA before runtime binding.
5. Respect Mass-form and local posture profile conditions from the source registries; never flatten them.
6. Do not change the SOURCE_FIRST 48-card LIVE reader or its event ownership.
7. The ordinary final blessing, priest receiving incensation, minister-owned actions, and nonidentical priest action/position cases must remain explicit exceptions pending source-specific reconciliation.
8. A source ledger can count the same cue across multiple independent actor lanes. Do not treat row count as a count of distinct liturgical instants.

## Coverage summary
* faithful_posture: 23/23 assigned; 0 text/exception; 0 requiring asset packaging
* faithful_gesture: 26/59 assigned; 33 text/exception; 0 requiring asset packaging
* priest_action: 52/77 assigned; 25 text/exception; 40 requiring asset packaging
* priest_position: 44/49 assigned; 5 text/exception; 8 requiring asset packaging
* priest_voice: 102/126 assigned; 24 text/exception; 66 requiring asset packaging
* response: 23/23 assigned; 0 text/exception; 0 requiring asset packaging
* rubric: 0/57 assigned; 57 text/exception; 0 requiring asset packaging

Required release gates:
- zero rejected assets referenced;
- zero missing required packaged asset payloads;
- zero actor/meaning mismatches;
- zero silent fallback substitution;
- source 48-step LIVE and Low/Sung/Requiem/special rites regression tests;
- mobile icon scale and theme color verification.

A reviewed asset is not automatically suitable for every event with a superficially similar title.
