# B10 — Adoration & Visit: separate optional whole prayers within the Four Ends

28 October 2026. This applies the B08/B09 **purpose → existing complete source prayer** model to Ad Orientem's existing Four Ends method. The source text, historical provenance and unhurried silence are never rewritten.

## Editorial review

The currently implemented Four Ends are fixed, named **five cards**:
1. Adoration — short source-owned *My Lord and my God*.
2. Thanksgiving — personal thanks in one's own words, with optional *Glory Be* (a **doxology**, not a fabricated thanksgiving act).
3. Reparation — complete canonical Act of Contrition.
4. Petition — complete Our Father.
5. Return to silence — **no text-choice controls**.

Only **three additional purpose-appropriate, complete prayers** are sourced in the existing 48-prayer canonical book and released as optional readings:
- Adoration: *Litany of the Most Blessed Sacrament* (`adoration_litany_blessed_sacrament`), a distinct and much longer act of adoration, not an alternate textual edition of *My Lord and my God*.
- Reparation: the complete historically attributed *Act of Reparation to the Sacred Heart* (`sacred_heart_short_prayer`). Not a replacement for the Act of Contrition.
- Petition for the Church: *Prayer for the Pope* (`church_prayer_for_pope`). Distinct and narrower than the Our Father; its original printed `N.` designation must not be silently populated with a current Pope's name.

**No new Thanksgiving option** is offered: the core corpus's Thanksgiving after Communion and thanksgiving after meals are context-specific and must not be mislabeled as generic Eucharistic adoration thanksgiving. The optional *Glory Be* remains available at that stage. Nor are Mass Sequence, Office antiphons, music alone, or clergy-led Benediction prayers imported as invented alternatives.

These whole prayer texts are sourced by existing canonical IDs and source URLs, not copied into a new data file. The new map `src/pray/adoration-four-purpose-options.js` uses B09's shared `createPrayerPurposeIndex` to enforce correct purpose ownership and reject forged ID values.

## Interaction

Within a fixed Four Ends card, **after** the original complete prayer and **before** the silence cue:
- Show a restrained “Additional complete prayer (optional)” row with **None** (default) and the named eligible historical prayer. One tap selects its complete original text; None removes only this extra reading.
- Switching modifies **only the optional section**, not the base prayer, stage, focus/scroll container, timer, public rite state, action rail or silence cue. No new card or invented liturgical order.
- Store only the validated source ID per purpose as `ao.pray.adoration-four-choices.v1`. Invalid IDs fail closed and the three independent choices survive a return to that purpose. No text or prayer duration is saved.
- The existing **Visit to the tabernacle**, **Holy Hour**, **unstructured silence**, **Benediction**, and Eucharistic Treasury modules are **unchanged**. The last Four Ends card remains unstructured silence, without controls.
- This is a **separate extra prayer**, not an edition replacement and never a compulsory or indulgence-earning requirement.

## QA

- Verify all three complete historical prayers have EN/FR/LA text and a primary source URL in the canonical book; category cross-mapping is forbidden.
- Validate default None; exact ID persistence and invalid ID rejection; no reordering or rewriting any of the original five Four Ends cards.
- Phone e2e on a 390px device: select and remove Adoration litany, confirm base original text and silence remain identical and reader DOM stays mounted; choose Reparation and Prayer for Pope; confirm Thanksgiving and final silence get no selectors; confirm historical five-stop navigation and silence.
- Run unconditional `npm test` plus ICKSP/Prayer owner and real phone acceptance checks before merge.

Strict €0. No new translations, generated devotional text, rites, automatic stage progression, or sacred-art changes.
