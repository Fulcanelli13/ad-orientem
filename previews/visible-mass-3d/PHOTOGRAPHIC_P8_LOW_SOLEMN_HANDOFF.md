# Visible Mass P8 — Low and Solemn form differential

Status: experimental, unmerged, photographic viewer only. No change to the production Mass reader or the separate Sung LIVE 48-card architecture.

## Deliverable

The user-facing 23.6 MB standalone HTML is `The_Visible_Mass_P8_Low_and_Solemn_Forms.html`, delivered in the ChatGPT conversation rather than committed as a heavy inline Commons image payload. It extends P7 and retains P6 photo-state continuity, the six Brompton sanctuary hotspots, 32 original Sung Guide moments and eight Formation stages.

The form selector now offers:
- **Low Mass:** 21 exact canonical `MC-*` objective events, sourced from B005's certified maximal 168-event context, including altar approach, Host/Chalice Offertory, warning bell, distinct Consecration/genuflection/elevation, Communion and Last Gospel.
- **Solemn Mass:** 28 exact canonical `MC-*` objective events, sourced from B006's certified maximal 177-event single traversal; including Solemn-only initial/Offertory incensation, ministerial Pax transmission, conditional Communion-warning bell, and the same correctly distinct Consecration/elevation events.
- **Missa Cantata:** the original 15 sampled Sung cue presentation from P7, not mislabelled as either B005 or B006. The B002 objective graph expressly gates Missa Cantata, so no identical graph projection is claimed.
- **Special rites:** intentionally gated. Requiem/Asperges/Nuptial/special branches require separate source approval. The second Confiteor remains omitted in the normative 1962 objective model.

Six separate fine-grained Solemn minister annotations are visible at appropriate selected graph events: `MR62.SOL.B02.001/.009/.017/.018/.043/.044` from Ritus servandus VI–VIII research. They identify subdeacon/deacon tasks but carry the **RESEARCH_SOURCE_CHECKED_NOT_RUNTIME_CERTIFIED** status; they are *not* promoted to the objective graph, nor are their event clocks silently assigned. The Ordinary water presentation annotation expressly excludes the Requiem branch.

Source classifications: objective-event titles, order, actors, event IDs, conditions and bell evidence come from `data/mass/mc-events-01..06.v1.json`, with B005/B006 source profiles and `data/mass/mc-event-graph.v1.json`. Form-specific vocal clocks must still be reviewed; common event-graph voice fields are not naively used to claim sung Low-Mass dialogues. No universal congregational posture, ceremony reconstruction or photo proof is inferred.

## Code and checks

- `photographic-p8-form-bridge.mjs`: read-only validation and projection from existing graph, six event fragments, two B005/B006 profiles and Solemn minister research. It enforces the 21/28 selected identities, true form certifications, original event order, distinct Host/Chalice phases, Low exclusions, separate minister research status, and gated Missa Cantata.
- `tests/visible-mass-p8-form-bridge.mjs`: repository test contracts for above invariants. Workflow success is **not** claimed absent a GitHub Actions run.
- Local HTML tests on Chromium desktop 1280×820 and mobile emulation 390×844 passed: 21 Low, 28 Solemn, no Solemn-only action in Low, contextual minister annotations separate, conditional incensation toggle, two Consecrations/elevations, Communion/photo round-trip, existing P7 Sung, gate for special rites, original object return with exact still zoom/x/y, 32 original Mass Explorer index entries, and zero uncaught exceptions.
- Visual/browser tests of original photographic sanctuary and Elevation assets were repeated with all other images replaced by lightweight local placeholders to keep headless Chromium within memory budgets. This is not a true 23 MB all-image hardware test.
- Mobile presentation tightened to show actor distinction and research qualifications above the fold, with source records and navigation accessible by scroll.

## Pending gates

Actual Windows and Android hardware WebGL orientation/touch/performance; exact object marker placement; original image attribution and rights; bilingual UI; event-form voice and minister overlap rules; Low and Solemn full 168/177 traversal projection; exact form-specific links into the new 32-moment Mass Explorer and original 48 LIVE presentation; special days, processions, Requiem branches and local congregation posture settings. Keep draft PR #1309 unmerged until independent review and these source/UI gates are satisfied.
