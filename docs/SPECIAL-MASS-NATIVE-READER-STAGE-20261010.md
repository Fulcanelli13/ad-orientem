# Special Mass reader — source-owned ceremonial stage (10 October 2026)

This phase extends the contextual Full Mass preflight from PR #945 into the actual native R17 reader without making a parallel ceremonial script.

The new `reader-special-stage.js` has a single visual responsibility: reflect the currently active **source-owned liturgical rite**, and when appropriate, the exact existing reader-card title. It mounts inside the R17 stage, not in a floating modal or above the posture/priest ribbons.

The ceremonial identities are derived from live reader ownership and the resolved Mass plan. Normal Masses receive **no** marker. Requiem, votive and Nuptial Masses show a restrained identity; an actual Nuptial insertion (AO.NUPTIAL.01–03) updates to the exact blessing. Good Friday, Easter Vigil and its Mass, Asperges, Palm, Ash, Candlemas, Rogations, Absolution, Corpus Christi and ordinary following processions use native source-controller identity. A following Absolution or procession cannot be invented by the feast date or a generic label.

The exact certified Good Friday source record `GF-PASS-320`, when its R28 `deathPause` state is active, receives a muted, solemn focus treatment. The cue registry still owns the timing, kneeling and pause; this component does not issue additional rubrical instructions, music, bells, artificial holds or cinematic overlays.

**UI constraints:** 390px maximum width with no horizontal scroll; pointer events disabled; reduced-motion awareness; source-labelled words (English/French); no permanent decorative clutter on ordinary Mass; no new icon or image bank dependency.

**Validation:** `npm run test:full-mass-preflight` tests exact source stage classifications and no accidental ordinary cues; `npm run test:full-mass-phone` validates source transition, label, 390px bounds and tap-through. Full R17, app and visual workflows remain mandatory.

**Not claimed:** complete research-level certification of additional ceremonial gestures or custom transition timings for every special Mass. All gestures and postures remain source-event-owned by their existing controllers.
