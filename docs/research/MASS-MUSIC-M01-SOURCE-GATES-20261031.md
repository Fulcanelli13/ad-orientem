# Mass music M01 — shared source/material boundary (31 October 2026)

## Purpose
This is the first implementation slice of the **existing R17 LIVE/MISSAL Mass music programme**, not a new Mass engine, a new music source, a recording service, or a score release.

The reader already owns ten ordinary Schola text tracks, the 36-event ordinary expected-performance itinerary, and the native 47-event music registry across ten special-rite owners. They have different responsibilities:
- canonical 1962 text, source sections, performer and conditional rite ownership;
- a Schola tracker that may predict which chant is next, but cannot detect singing;
- a still-unapproved musical notation corpus and seven-example offline SVG pilot;
- no general released, source-matched audio repertoire.

**M01 adds one common read-only material gate** to ordinary and special-rite event projections so source-identified text can never be mistaken for a published musical score, an approved priest/response tone pair, an audio recording or actual performance.

## Code and invariant
- `src/mass/reader-music-material-gate.js` is pure and exports `sourceMusicMaterialGate`.
- `reader-schola-event-timeline.js` retains all **36** event identities and attaches `musicMaterial` to actual projected chant/priest-voice events, or `null` to non-musical events.
- `reader-schola-special-rite-itinerary.js` attaches the same marker to source-owned music in the existing native rite, conditioned on the actual rite stage and branch.
- `SOURCE_REFERENCE_PRESENT` establishes **only** that an existing source reference resolved. It is **not** a printed-score comparison, certified Latin correspondence, musical approval, or an observed performance.
- Every unapproved notation, celebrant-response tone and recording remains held. In particular, PR #1749's 1,195 GABC research rows and PR #2111's seven local SVG pilot scores **must not** become live assets by consulting this gate.
- No chant text, GABC, music file, style sheet, card, reader mode, timer, organ rule or user preference is modified.

## Seasonal and local controls
- The normal `Asperges me` and Paschal `Vidi aquam` are **exclusive** source events selected by the existing native rite; their `ORDINARY` / `PASCHAL` provenance follows the projected event. Neither melody is inferred from a civil date or the name of a user-entered parish.
- Requiem omissions, Gregorian/polyphonic Benedictus timing and the actual funeral Last Gospel branch remain owned by the existing reader and Schola controllers.
- A Kyriale setting's edition-indexed title does not prove a chosen melody has been rendered, approved, or sung.

## Regression gates
The existing `test:reader-schola` suite now verifies the common material status on ordinary events and special-rite events, preserves silent/nonmusical stages, tests the two Asperges branches, and rejects a musical content claim without a source ref.

## Next release slices
1. M02: authoritative source-text/voice-and-response pairing for the Preface, Collects, Gospel, Pater noster and the dismissal; identify prescribed solemn/ferial and rite-specific choices with **source-backed** rules. Do not guess tone from feast colour or free-text titles.
2. M03: source-matched `Asperges me` / `Vidi aquam` notation candidates and seasonal Ordinary Kyriale score linkage. Preserve existing 1962 text, individual source identities and user's editorial approval requirement.
3. M04: the actual resolved day's Gradual, Alleluia, Tract, Sequence, Offertory and Communion, including the selected 1962 Proper and permitted variants.
4. M05: completed special rites, wider approved repertoire and optional recordings with independently verified rights.

## Release policy
Leave this PR draft until latest-head required checks, R17/Schola regressions and current 320/390px phone acceptance succeed. This slice intentionally produces **no new score or recording in the UI**. Research/editorial approvals are separate from code acceptance.
