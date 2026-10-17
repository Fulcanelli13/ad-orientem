# The Visible Mass — M1 unified experience acceptance contract
Date: 18 October 2026  
Status: **review implementation, NOT public release**. Existing Ad Orientem Formation reviewer is gated by `?aoVisibleMassReview=1`; PR #1309 must remain draft until independent editorial, rights, visual, language and real-device approvals.

## Why this exists
This is the single UX contract that constrains subsequent work; it supersedes the idea of extending each P2–P8 photographic prototype independently. **One authentic photographic environment, one foreground context folio, three explicit visitor states, four non-linear guided entrance trails, original source-owned explanations.** This milestone does not authorize AI chat, new Mass rules or public educational answers.

## Visitor states (implemented in original photographic sanctuary pilot)
| State | Photo | Context | Enter | Exit |
| --- | --- | --- | --- | --- |
| **Explore** (default) | Dominant/full content width | Guide, research and object folios absent from the foreground | Arrival, close/free-explore | Tap a verified hotspot → Understand; Discover choice → Discover |
| **Discover** | Always visible, same scene and pose | Only the compact dialogue folio with all four route choices and a single current suggestion | Explicit Discover tab, Return to guide, switching trails | Explore freely/Skip path → Explore; Follow a source-backed suggestion → Understand |
| **Understand** | Still visible and source-labelled | Only the selected object, original G### definition, original VMQ question/detail, research warnings and conditional Mass Explorer handoffs | Tapping an object or guide question | Close → original Explore/Discover context; Return to Guide → Discover |

`#experience-nav` is shared; the **Understand** tab is unavailable before an object has actually been selected. The viewer hides its duplicate heading when embedded in the native app but retains the occasion selector and photograph-source link. The Ad Orientem global bottom ribbon remains in the parent shell. No separate student-facing route or competing inspector.

## Navigation and trust boundaries
- Same-photo **six hotspots only**: AL01 high altar, AL06 altar crucifix, AL07 candlesticks, AL19 retable, SN02 Communion rail, SN04 steps. Other physically identified subjects remain reachable through explicitly sourced *separate* inspection photographs or related-object questions, not fabricated same-photo markers.
- Each guided scene focus is a pan over genuine photo coordinates, **not** a 3D walk, priest reenactment or altered historical photograph. Respect reduced-motion preferences; standard Explore selection clears guide-specific focus.
- Existing 4 trail IDs and `VMQ` graph persist. A question is globally visited only once its source-owned detail is opened. Skip individual recommendation != read. Skip trail != read or delete. Visitors can switch immediately without replay and resume from the same browser session.
- The current 97 historic/functional research answers remain **draft**. Four specific candidate VMQ questions are held, and all 134 questions still belong to the Phase 1 registry. Do not turn draft prose into published teaching; do not infer rubrics from the 1907–1914 historical sources.
- Existing G### glossary definitions, 32-moment published Mass Explorer, traditional 1962 form events and 48-card LIVE reader retain their individual owners. No new liturgical texts or authorial persona.

## Technical acceptance
The following should pass on the draft branch after each relevant modification:
1. `tests/visible-mass-guided-trail-graph.mjs` — canonical source IDs, six photo objects, 20 researched/4 held trial questions, original research and publication gates.
2. `tests/visible-mass-guided-folio.mjs` — per-trail skips, global actually-read IDs, switching, session restoration, direct original question navigation.
3. `tests/visible-mass-sanctuary-hotspot-contract.mjs` — no fabricated hotspots, glossary source ownership, three-state semantic contract.
4. `tests/visible-mass-sanctuary-photo-browser.mjs` — desktop and 390px phone Chromium: Explore/Discover/Understand, six photo subjects, object-sheet visibility, source detail, route skipping and reloading.
5. Existing Formation/PR and R17 Mass integration gates. **No modification to the Mass reader.**

## Unresolved acceptance and future stages
- M1 still needs visual editorial approval on **actual Windows browser and Android phone**, including source-image texture/orientation, reader-mode accessibility, high-altar hotspot finger placement and exact photo credit/rights verification. Automated phone emulation alone does not certify final UX.
- M2: improve authored narrative pacing and alternative connections; not merely list questions in order. Do **not** add voice/persona or gamification.
- M3: approve the first coherent set of doctrinal/historical explanations and French translation.
- M4: consolidate genuine 360° P6 panoramic continuity and labelled scene changes without geometry fiction.
- M5: optional *Ask the Guide* context-aware retrieval ONLY after accepted M1–M4; fail closed for unsupported questions.
- M6: expand photo evidence and accredited ceremonial context to more objects/forms only from original source registries.

## Definition of approved visitor experience
A newcomer can inspect the altar without starting a lesson; an investigator can start at the retable, switch to the crucifix and skip a candle question; a returning visitor retains previous questions without compulsory replay; a liturgical learner can open certified Mass Explorer context and return to the authentic church. **No content is generated solely to create a transition.**
