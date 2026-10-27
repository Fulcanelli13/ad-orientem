# Native Schola source-event itinerary — Stage A (27 October 2026)

**Implementation:** `src/mass/reader-schola-event-timeline.js` and the LIVE Reader's compact **NEXT** forecast beside the existing Schola control. It does not change the existing 65-card curated Mass sequence, introduce a music timer, or publish any unapproved GregoBase research.

## Contract

Every event is an explicit editorial **kind**, source section, optional canonical block, runtime card ID, local/performance constraint, and uncertainty/status. `buildScholaMusicItinerary` receives the **actual sourced reader cards** (65 ordinarily; source-certified 66–67 extensions and Introit-entry omissions are accepted without remapping). It resolves the event's card identity by source ownership rather than a historical 30- or 48-card number.

The registry covers the ordinary Mass's Introit, Kyrie, Gloria and priest intonation, Collect, lesson, Gradual, source-verified Alleluia/Tract/Sequence follow-up, Gospel, Homily, Credo, Offertory antiphon and optional local motet/organ, Secret and Preface, Sanctus, Canon, Consecrations, two **alternative** Benedictus performance windows, Pater, Pax, Agnus Dei, priest and faithful Communion, distribution motets, the separately printed Communion antiphon, Postcommunion, dismissal, final blessing and potential recessional. This is a **normal-form event skeleton**, not yet a universal catalogue of every traditional local organ interlude or special-rite variant.

- **Sung and Solemn:** event projections only when form and actual track availability permit. **Low:** no Schola, structural absence.
- **Gregorian Sanctus:** continuous Benedictus in the same ordinary performance. **Explicitly selected polyphonic:** possible sung Benedictus only *after* B053 Chalice Consecration; still requires a manual choir-observation button already present in the existing controller. Unknown local practice: no speculative Benedictus timing.
- **Pre-Gospel:** B022 must exist in the exact source card. Never invent an Alleluia or a Tract from merged B021 words; when it is not separately sourced, omit the independent event, leaving the unresolved segment in the existing tracked Proper.
- **Organ:** all optional organ slots have `PERMISSION_NOT_EVALUATED` and `actuallyPlaying:"UNKNOWN"`. The independent 1958 §§16b, 27, 80–85 resolver remains the sole permission authority. During Consecration the absolute no-organ rule remains source-owned, at the precise ritual cue, **not** as a claim about the entire preparation card.
- **Requiem:** omit Gloria, Credo, final blessing only with an explicitly resolved Requiem overlay. The separate Requiem Agnus wording and absolution procession are retained in their existing form/rite modules.
- **Special rites:** Asperges/Vidi aquam, Palm, Candlemas, Rogations, Holy Thursday, Easter Vigil, Requiem Absolution etc. remain governed by the existing distinct-rite registry and stage controllers. This ordinary Mass timeline does not silently insert them.

## UI and follow-up

The compact `NEXT · ...` label uses the Mass Reader's **actual current sourced card ID** and the next independently source-anchored chant card. It is explicitly described as **later in Mass order, not heard or timed**. No synthetic transitions are sent to `createNativeScholaController`; priest focus and ticker remain completely independent.

Next stages: exact permission-aware organ slots, local programme editor for a parish's Sanctus/Benedictus, source-owned post-Chalice boundary checks for a full real fixture, and validated notation assignment to these events after actual 1961 facsimile checks.
