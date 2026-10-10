# Full Mass restoration — old Ad Orientem versus modular GitHub (10 October 2026)

## Core decision

Restore the old **Change Mass / pre-Mass selector** as a first-class native Mass module while retaining a **single canonical R17 reader**. There are three independent choices, not one list of mutually-exclusive Mass labels:

1. **Celebration/Proper** — what is actually being offered: Mass of the day, votive, Requiem, Nuptial, approved special formulary; its rank, actual Proper and permitted changes must be resolved first.
2. **Ceremonial form** — Low, Missa Cantata without incense, Missa Cantata with incense, Solemn; this controls priest/minister/choir event topology and gesture/posture projections, not the identity of the prayers.
3. **Reader view** — MISSAL (parallel texts), SIMPLE (heard participation), LIVE (cue rails); these are presentation modes, not a way to change the underlying Mass.

**Good Friday is not a Mass**, so the ordinary form chooser is disabled for that distinct rite. Easter Vigil has its own integrated structure. Requiem, Nuptial and Votive are NOT fifth/sixth/seventh ceremonial forms: each can compose over a permitted Low, Sung or Solemn celebration where the proper and rubrics authorize it.

## Recovered old-version evidence

| Old source / recovery generation | Recovered ownership now in GitHub |
| --- | --- |
| v43.57 / v1.74c | Low Mass, 63 source moments / 275 canonical reader cues; Low reader form-state |
| v43.58 | Solemn Mass with deacon/subdeacon actor roles |
| MC-CERT (22 Sept) / v43.73 | Missa Cantata distinct subprofiles, no deacon/subdeacon |
| v43.73 special-days recovery | Requiem overlay, Absolution after Mass, Asperges, Palm, Ash, Candlemas, Corpus Christi procession |
| v16 Nuptial / v21 supplementary recovery | Nuptial 1962 source/insertions; 30 supplementary/votive families + trilingual Proper slots; Proper gate remains authoritative |
| v0.12.6 / v1.80–v1.83 | Native-style reader experience and later 48-card focus evolution; preserve existing production R17/R19 runtime |

These are **historical coverage records**, not new re-certifications of every calendar date, language or venue. Current source authorities: \`data/mass/form-registry.v2.json\`, \`data/mass/rite-overlay-registry.v1.json\`, \`src/mass/session-engine.js\`, \`src/mass/host-adapter.js\`, \`data/presentation/mass-definitive-convergence.v1.json\`.

## Implemented in this first restoration pass

- An **in-app pre-Mass ceremonial-form chooser**, mounted before Start Mass and visible within the already-present Mass preflight, in English and French.
- It exposes the exact four certified ceremonial forms, including the two independently researched Missa Cantata variants. No "Solemn minus ministers" shortcut.
- User choice is **session-only**. It overrides the host's old form setting **for R17 preparation only**, leaving the celebration/Proper source, date, calendar rank and reader mode unchanged.
- **Five working Change Mass shortcuts**: Mass of the day, Votive, Requiem, Nuptial, Other. Each calls the existing `AO_CELEBRATION_API.openChangeMass()` and clicks the established source-owned category control. The user then chooses the exact formulary/circumstance in that owner; no Proper is guessed from the category tap.
- A clear **actual celebration summary** (Mass of the day / Votive / Requiem / Nuptial / Good Friday / Easter Vigil), derived from the source-owning host resolver, not computed from the chosen form.
- Selection resets on a change of Mass date; Good Friday disables form selection. No unsupported type is forced into an ordinary Mass.
- The original category and formulary picker remains **authoritative**; the new shortcuts navigate into it. The redundant old *Sung/Low* button grid is hidden while the native four-form selector is mounted. Explicit source absence continues to block Start.

## Completion criteria for the entire module

The next Mass entry work should integrate the category subpages/formulary catalogue inside the new selector rather than navigating through the old Change Mass sheet, and retire that historical UI **only after direct parity verification**. It must reconnect the full approved Proper catalogue (including seasonal Marian votives, All Souls formularies and the different Requiem classes) without assuming every votive is freely permitted on every date. Confirm generated actualMass/proper/overlays from the same single selected celebration, not from a static card label.

Then attach the optional rites and lifecycle switches (Asperges/Vidi aquam, Palm, Ash, Candlemas, Rogations, Nuptial, Absolution, Holy Thursday, Easter Vigil, Corpus Christi and generic processions) with the appropriate calendar, rank and physical-action gates. Optional processions **must never be activated by calendar date alone**.

Finally prove 390px phone acceptance, language fallbacks, reader mode switches, 48-card guide/card mapping, focus controls, posture profiles, Schola state and celebration changes at the **pre-Mass stage**. Switching source texts mid-Mass should not silently reset or reinterpret a live event stream. Require fresh source-resolved preflight rather than swapping the Proper beneath an ongoing Mass.

## Verification requirements

- \`npm run test:full-mass-preflight\` — 4 forms × 4 categories; same source Proper; explicit overlay; Good Friday firewall and fail-closed unknown form.
- \`npm run test:full-mass-phone\` — 390px touch; selected form follows R17; actual category and language; date reset; Good Friday blocked; no horizontal overflow.
- Existing R17 Mass convergence, app convergence and visual workflows remain mandatory.
