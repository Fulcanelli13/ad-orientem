# Phase 3 — Guide implementation, first runtime batch (10 October 2026)

This batch follows merged source audit #880 and typography fix #878. It changes **navigation and provenance**, not prayer or rubric wording.

## Mass: 48 visible cards, 30 ordinary source Guides
- Existing R17 production opens a 48-moment LIVE projection backed by a 39-step source model and a 32-entry historical Guide registry (30 ordinary moments, Asperges and post-Mass).
- The old reader used `guideForSequence` directly for the current presentation card. This returned 30 macro-level Guide copies across the 48-step LIVE projection without distinguishing inherited guidance.
- `guideForPresentationCard` now binds each visible card to its source Guide, retains source links, and assigns **INHERITED_MACRO_CONTEXT** when the visible moment is a Canon segment or a non-Canon split step.
- For inherited entries the Guide title is the current visible moment, while the source scope is identified as **Part of: [wider section]**. No claim is made that 48 independent texts have been sourced/approved.
- The real-data 48 integration test verifies a Guide and source links for each of 48 cards, including exactly 28 explicitly inherited contexts (14 Canon + 14 projected split cards). Existing paragraph and canonical event ownership is unchanged.

**Editorial follow-up:** source-check and write distinct, contextually correct instructions where the original macro guidance is too broad, with bilingual EN/FR review and phone acceptance before marking the 48 moments independently complete.

## Prayer: Dying Companion
- Retains direct access to **Now**, **Pray**, and **Commend** at every point.
- Adds a user-controlled Previous/Next progression and step indicator using the same restrained Guide navigation already used by guided daily prayers.
- Opens at **Now** each time the Dying Companion module is launched, preserving the priority to call a priest promptly.
- Preserves original bedside prayer content, original citations, the Serious Illness formation bridge, and the strict boundary between lay prayer and priest-administered sacraments.
- No background reminders, emergency calls, or simulated sacramental acts.

## Acceptance
Automated tests cover the 48-card Guide source mapping and all three Dying Companion stage boundaries. This is **source/contract validation only until phone browser CI passes**. The remaining 29 contextual and 15 practical follow-ups in the source audit have not been reclassified as resolved on the strength of these additions.
