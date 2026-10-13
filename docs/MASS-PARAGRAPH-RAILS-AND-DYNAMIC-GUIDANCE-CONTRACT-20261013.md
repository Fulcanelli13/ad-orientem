# MASS reader — four-surface paragraph contract (decision 13 October 2026)

**Status:** USER DECISION / PERMANENT PROJECT REQUIREMENT. This document records the user's exact functional instructions. It is not a certification that the requirements are already implemented.

## Four non-negotiable surfaces

1. **Left rail:** faithful's posture **and** gestures for **each currently displayed paragraph** (canonical `AO.SM.C####` source unit), differentiated by Mass form, community participation profile and conditions. A gesture is not inferred from the priest's gesture.
2. **Right rail:** priest's **location, orientation, posture and posture-changing actions** for **each paragraph**. Positions are persistent sourced state transitions, not guessed from the schola or the reader scroll.
3. **In-text rubrics:** describe **the priest's precise actions for every prayer**, at the actual anchored words or non-text events, including order, actor, voice and conditions. Do not replace these with vague devotional prose.
4. **Second top ribbon replacement:** the existing second-top-ribbon display of posture/priest-action icons is redundant and is to be **replaced with a dynamically changing, concise textual guidance/rubric/explanation** for the *actual prayer/part currently shown*. Its purpose is **complementary** to the in-text priest-action rubrics: explain meanings, faithful norms and useful context without duplicating literal gestures already described inline. The first top mode/navigation ribbon and the original LIVE text remain intact.

The standalone Mass Formation/Guide experience remains separate. Its good existing material, the 71-event evidence ledger and original-French research feed the new guidance surface without reinstating an in-reader Guide panel.

## Architectural identity and authority

- Anchor **all four surfaces to stable source cue IDs**, not to the displayed card index. Today's production default is curated 65 cards (64 ordinarily visible), while the 48-card layout is rollback only. One source block can contain many cue paragraphs; one card can combine/split source blocks.
- Use the existing authoritative `data/presentation/reader-text-sung.v1.json` source units, and their equivalent Low-Mass donor. The source itself reports 279 priest events in Sung; it currently has **279 canonical AO.SM.C#### units plus one synthetic pause unit**, not 280 liturgical paragraphs. Do not move the synthetic pause onto a made-up prayer.
- Priest/faithful clocks remain separate in Sung and Solemn Mass. The priest may be at a different prayer or location from the publicly heard schola. Never silently treat public sung text as proof of the precise priest's current unseen action.
- Faithful default is `FOLLOW_CONGREGATION_OBSERVATIONAL`, not an invented universal 1962 pew-posture law. Only apply exact sourced profile-specific instructions or observed local practice. Preserve stand/sit/kneel/genuflect as distinct from the priest's own gestures.
- Priest stations persist until a **valid, condition-matched** successor transition; e.g. incensation, sedilia, Requiem, optional second Confiteor and the communion rail are conditional, not unconditional replacements of the underlying station.
- In-text priest rubrics use `reader-rubric-events.v1.json`, existing priest-action data and direct 1962 evidence; where research is not yet 1962-certified, mark it rather than pretending certification.
- Guidance hierarchy: (1) exact 1962 rubric, (2) norm/custom for the faithful, (3) the prayer's actual words and orthodox doctrinal meaning, (4) sourced historical explanation, (5) optional attributed devotional imagery. A nineteenth-century witness is not by itself 1962 law. No unsourced Passion-scene allegory.
- Scope the guidance by form (Low, Missa Cantata with/without incense, Solemn, Requiem and additional exceptional rites) and canonical role (priest, deacon, subdeacon, server, schola, faithful). The strict 1962 sequence excludes the historical second Confiteor unless separately selected as a local custom.
- Latin text is the authority; French editorial wording must be independently reviewed against the Latin. Modern Le Barroux translations and Clovis may be compared but must not be copied without rights. Original French Guéranger is used for source meaning, **not** for overriding modern liturgical rubrics.

## Per-paragraph coverage / acceptance

The accompanying **research-only** `data/research/mass-rail-paragraph-coverage-20261013.json` lists every current Sung source unit and attaches exact already-registered cue events for both rails and priest rubrics. Its empty arrays are **visible research gaps**, not proof that nothing happens or permission to fabricate an event.

A card is not certified simply because all its cue IDs exist in the index. Each cue must pass:
- Faithful posture resolved for the active source-backed community profile, or deliberately observational if no source.
- Faithful gestures source-backed for the active cue/condition; no priest-gesture inheritance.
- Priest station/facing/posture and hand actions correctly resolved against the independent priest event clock.
- In-text priest rubric exact and cited for every prescribed prayer action, including non-text and multi-step elevation actions.
- Ribbon explanatory text reviewed in French, grounded in prayer/source, shown on the correct paragraph, and **not** just repetition of the literal inline action.
- All branches/conditions checked; hidden/omitted 1962 parts do not leak into the normal rite.
- No mutation to frozen original Latin, translation pairing, cue IDs or production cards from this research PR.

## Existing input records

- `data/presentation/reader-text-sung.v1.json` / `reader-text-low.v1.json`
- `data/presentation/reader-postures.v1.json`: 23 existing posture events (including state-bound non-cue events)
- `data/presentation/reader-gestures.v1.json`: 59 faithful-gesture cues
- `data/presentation/reader-priest-positions.v1.json`: 49 station transitions
- `data/presentation/reader-priest-actions.v1.json`: 77 action cues
- `data/presentation/reader-rubric-events.v1.json`: 57 precise in-text rubric micro-events
- `data/mass/ritus-1962-faithful-posture-classification-batch04.v1.json`
- `data/presentation/guide-registry.v1.json` (32 historical entries)
- `data/learn/mass-formation-campion.v1.json`
- The September 21 Mass SOT v12 and 71-event research compendium; French-original Guéranger review in `docs/research/MASS-FRENCH-GUERANGER-ORIGINAL-AUDIT-20261013.md`.

**Publication status:** This commit saves the user decision and creates a source-indexed coverage baseline, **not an implemented UI**. Full paragraph-wise actor/profile and in-text review, and the replacement top ribbon, remain execution tasks.
