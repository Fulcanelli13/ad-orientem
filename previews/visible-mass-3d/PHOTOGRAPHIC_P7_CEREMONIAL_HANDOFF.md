# The Visible Mass — P7 ceremonial immersion handoff

Date: 17 October 2026. Status: **experimental draft, unmerged; no production reader modification**.

The conversation-delivered full-photograph offline HTML is `The_Visible_Mass_P7_Ceremonial_Immersion.html` (approximately 23.6 MB). As with P6, the large embedded photographic payload is deliberately not committed. It is a visual/interaction proof, not a certified 1962 Mass simulation.

## Source-owned scope

A small **15-cue Sung/Missa Cantata sample** is projected from original canonical registry identities `AO.SM.C0001`, `C0084`, `C0111`, `C0115`, `C0119`, `C0122`, `C0161`, `C0174`, `C0181`, `C0202`, `C0222`, `C0242`, `C0246`, `C0263`, and `C0273`. These have original owner records in `reader-text-sung`, `reader-rubric-events`, `reader-priest-positions`, `reader-gestures`, and the 32-entry Sung Guide. Original exact cue IDs and macro identities are preserved. The 15 anchors are **not** a full Mass, nor substitutes for the 48-card LIVE reading presentation.

The viewer displays source-owned priest/server actions, the priest's visible station where supported, and faithful gesture guidance clearly labelled as observational / local custom rather than a universal law. The elevation provides *visual emphasis only*; no imaginary movement of the priest or Host, no audio bell count, no invented gesture sequence. Real Mass witness photos continue to state they were taken at other churches.

The form selectors for Low Mass, Solemn Mass and special rites are deliberately **fail-closed**. Those forms have different source owners or require source-parity mapping; the viewer does not pretend that the Sung cue list is their ritual event graph. Requiems, processions, Palm Sunday and other special branches cannot be inferred from a calendar date or a photograph. The three optional flags (incense, blessing and Last Gospel) are demonstration conditions only, not a complete branch engine.

## Integration and tests

- Added `photographic-p7-ceremony-bridge.mjs` to reconstruct the **selected** source cue projection with exact matching against source-owned 1962 event registries.
- Added `tests/visible-mass-p7-ceremony-bridge.mjs` to verify fifteen unique cues, Host and Chalice elevation distinction, a server bell without invented count, Communion rail station, Last Gospel genuflection, explicit conditions and rejection of unsupported forms. This is an in-repository test; GitHub workflow success is not claimed until run.
- The full single-file artifact is delivered in this conversation and retains P6/P5 scene continuity, six original sanctuary markers, 32 Guide moment links, eight Formation lessons, source labels, and original photograph credits. The main Mass reader and canonical glossary are untouched.
- Local Chromium desktop 1280x820 and mobile 390x844 tested the complete controller against an optimized image fixture and, separately, the same controller with **actual embedded 2019 Brompton high-altar and authentic Mass Elevation photographs**. Passed form switching, per-event navigation, conditional event omission, elevation treatment, Guide/photo roundtrip, return to original object and exact still-camera pose, original 32 Guide controls and zero uncaught JavaScript exceptions.
- A direct browser run containing the entire 23 MB image payload exceeded the test-runner timeout. This should not be misreported as a full-asset pass; final offline opening on user's device remains essential.
- UI fixes from review: the third More button received a distinct vertical position; P7 sampled-cue index now maps correctly after a skipped conditional cue; source object card DOM and event handlers are preserved across a Guide inspection; small-screen Previous/Next buttons are always visible; the church photograph stays visible during elevation focus.

## Acceptance before production

1. Review appearance on the user's Windows browser and Android phone; verify panorama GPU orientation and smooth pan/zoom.
2. Obtain owning pipeline approval for actual LOW and SOLEMN cue projections and branch-specific special-day events. Do not publish provisional relations as normative rubrics.
3. Review photo credits and redistribution terms, exact finger-marker positions, French language support and final performance.
4. Replace offline snapshots with lazy-loaded, live canonical read-only adapters. Preserve the 48-card LIVE reader, existing Mass Explorer, calendar and liturgical forms as separate original owners.

No merge or production deployment is authorized by this handoff.
