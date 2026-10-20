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


## Semantic vocabulary reconciliation (20 October continuation)

The final display names are **user-owned data**, not keywords used as runtime event identifiers. Example: the physical asset `v46_priest_elevate_chalice_rich` has the user name "Priest offers Chalice", and is therefore bound to `OFFERS CHALICE`, *never* `ELEVATES CHALICE`. The latter belongs to `ao_elevation_chalice` ("Elevation Chalice").

`mass-icon-final-semantic-lexicon-20261020.v1.json` is the sole alias/candidate table for this staging branch. This table maps **precisely** between source terminology and immutable approved asset IDs; it is not a fuzzy substring search.

The initial source crosswalk was expanded with 32 approved, actor-scoped semantic reuses:
- 23 faithful "Bow head" / "Bow the head" records → the generic user-approved "Faithful Bow" asset, while the **exact source text** retains the head-bow distinction (it is not a rubric to bow profoundly)
- 8 priest "STRIKES BREAST" records → user-approved generic "Breast Strike", with actor and strike count from the source cue
- 1 priest "PROFOUND BOW" record → the approved "Priest bow Adoration" visual

Result: faithful gestures **49/59** assigned; priest actions **61/77** assigned. Remaining null illustrations are classified rather than being automatically substituted.

### Not every null icon is a gap

* `C0075 READS EPISTLE`, `C0086 PROCLAIMS GOSPEL`: already represented by current station and voice lanes
* `TURNS TO MISSAL`, `TURNS TO ALTAR`: position/orientation changes; do not duplicate as unsupported action artwork
* `C0096 Et incarnatus`: calendar/posture conditional resolver; branching candidates preserved for standing, sitting and exceptional Christmas/Annunciation cases
* `C0174` and `C0179` elevations: kneeling, reverence and looking are separate phases; the approved icon named "Look" must appear only on an attention cue, not be misread as audio "Listen"
* `C0125 LAVABO`: "servant pours water" depicts the minister's role; cannot be falsely assigned as the priest's own action icon
* `C0124 RECEIVES INCENSE`: incensing the faithful depicts a different recipient
* `C0088 KISSES GOSPEL`: kissing the altar is a different object
* `C0204 MINOR ELEVATION`: not a full Elevation
* `C0242 SHOWS SACRED HOST`: not Consecration elevation
* `C0265 BLESSES PEOPLE`: the approved "Priest indulgence" illustration must not silently become a final blessing

Any source cue without an exact or qualified reusable image remains textual until an actor-, rite-, and object-correct mapping is established.

### Packaging and deployment

These are **staged assignments and candidate resolver conditions**. They are not wired into the production `reader-icons.js`; first import and integrity-check all required originals, then resolve exact source cue IDs and display ownership in the actual Mass reader. Do not activate source-only cue candidates by fuzzy text matching.

Run `node tests/mass-final-icon-crosswalk.mjs` on this branch. The main reader’s ordinary 48-card structure and source event timing are unchanged.
