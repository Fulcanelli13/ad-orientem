# B09 — Traditional Communion Prayers: choose by purpose

28 October 2026. Applies the Morning/Evening B08 distinction between *devotional purpose* and *whole historical prayer* to the existing eleven Communion prayers. No new prayer text, translations, rite or source attribution.

## Historical source preservation

The current Roman-Missal/traditional corpus owns 7 complete private prayers *before* Communion and 4 *after*. Their canonical IDs, source witnesses, English/French/Latin text, and the existing Mass Folio before/after route remain untouched.

This is **not** a fixed liturgical rite requiring all 7+4 prayers, nor should every prayer be treated as another version of the same text. The earlier direct chooser was buried in a disclosure, with a 7-/4-stop timeline occupying the prominent choice affordance.

## Six visible devotional purposes

| Phase | Purpose | Source prayer IDs | Relationship |
| --- | --- | --- | --- |
| Before | Invocation | sacrament_come_holy_spirit | One complete invocation |
| Before | Acts of preparation | foundations_act_of_faith; foundations_act_of_hope; foundations_act_of_love; sacrament_act_of_contrition | Four **distinct acts**, not versions of a single prayer |
| Before | Approaching Communion | beforeThomas; beforeAmbrose | Separate whole prayers addressing the same private preparation purpose |
| After | Union and love of Christ | adoration_anima_christi; afterBonaventure | Two **distinct compositions**, no joined or rewritten texts |
| After | Thanksgiving | afterThomas | Explicit traditional thanksgiving |
| After | Before the Crucifix | enEgo | Distinct prayer, not relabelled as pure thanksgiving |

The exact mapping is `src/pray/communion-prayer-purpose-map.js`. The shared pure classifier `src/pray/prayer-purpose-index.js` checks full coverage, uniqueness, phase membership and purpose relationship, and may be reused for Adoration/Good Death without coupling those modules' source data.

## UX and persistence

- Keep the existing two top-level phases, **Before** and **After Communion**. Surface three small purpose choices followed by immediate labelled prayer buttons for the active purpose **above the prayer card**. One tap selects a complete source prayer; no extra catalogue/details page.
- Preserve the source-owned complete prayer card, language flip, provenance, vertical scroll, horizontal swipe, and all 7/4 chapter IDs and positions. The timeline remains as secondary reading navigation rather than a required checklist. A selected purpose shows an explicit distinction between separate acts and genuinely alternative complete prayers.
- Store only the chosen source **ID** per purpose/phase under `ao.pray.communion-purpose.v1`. The remembered source reappears when the user returns to that purpose; invalid IDs fail closed. No prayer text or medical/confession content is stored. No user tracking or fees.
- The existing **Before Mass** and **Thanksgiving After Mass** Folio routes keep their previously agreed brief/full sequence and handoff behavior untouched. This module-level update does not impose choices on Mass.
- If the user chooses a devotion associated with particular indulgence conditions (e.g. En ego), preserve the existing explanatory source note; do not imply that tapping or reading on-screen satisfies those conditions.

## Acceptance

- Pure test: all eleven current prayer IDs classified exactly once; no cross-phase entries or fake alternatives; source-language texts retained; invalid saved source IDs rejected.
- Phone: 390/320px, visible direct purpose/source choice, one tap selects desired complete source, grouping of distinct acts not confused with equivalent forms, saved choice restored when moving between purposes, vertical scroll never advances the card, horizontal timeline works; screenshot actual selected St Ambrose and St Bonaventure pages.
- Required full non-browser regression, connected Prayer routes, app convergence, Mass Folio compatibility, no source rewrites.

This is the first reusable purpose-picker extraction, not a wholesale restyling of Pray. Strict €0.
