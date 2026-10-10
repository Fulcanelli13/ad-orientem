# Guide Phase 3 — Prayer Library and devotion context (10 October 2026)

Continuation after merged #886 and source-level two-function audit #880.

## Actual runtime changes
- **Prayer Library:** all 48 canonical prayers in nine existing groups now have a collapsed, bilingual **Guide · meaning and practice** disclosure alongside the unchanged prayer, original source/provenance links, Scripture capsule and edition warnings. The library directory gains a short **how to use** Guide. Short standalone prayers do not acquire an artificial step counter.
- **Seven Penitential Psalms:** a context Guide explains that the historical psalm order and chosen Scripture edition are separate witnesses, while the existing seven-stage practice, Scripture loading and references remain unchanged. The optional transition to the Litany of the Saints is not described as obligatory.
- **Litany of the Saints:** optional context distinguishes bounded historical transcription of the Litany proper from an independently collated 1962 ritual. Existing invocation/response sequence, personal/group mode, edition link and public-rite priority remain intact.
- **Seven Last Words:** context distinguishes Gospel wording from the separately sourced English meditation; no French historical meditation translation is invented. Existing seven-stage reader is preserved.
- **Litany of the Holy Name; Sacred Heart; Communion Treasury; Good Death:** optional bilingual Guides establish purpose, when to use the module and how to use its existing prayer/selection UI, without adding new prayer texts or transforming priestly ceremonies into private checklists.

## Provenance and editorial guardrails
- Existing source links are retained in prayer cards and source disclosures; the new Guides are paired with, not substitutes for, that evidence.
- Guide text is **source-bounded explanatory/use text** based on pre-existing corpus categories and module controls. It is not a new historical critical edition and does not certify all 48 prayers as individually collated or source-approved.
- No compulsory guided steps are added to one-line prayers or reference views; the already guided psalms, litanies and Seven Words retain their own navigation.
- Only read-only Guide/metadata views are added; no changes to canonical prayer wording, classifications, Mass text or public Formation research gates.

## Validation
`tests/prayer-guide-context-coverage.mjs` checks the 48 canonical Prayer Library records across nine categories, English/French parity, the distinction between historical/current Loreto forms, fail-closed unreviewed categories and runtime insertion anchors. It runs from `tests/app-shell-contract.mjs`. Full browser/phone acceptance and human source/editorial checking are still required before marking individual text or Guide coverage certified.

## Not covered here
Remaining Formation training journeys, sacramental preparation companions, Calendar and Explore classifications, cross-app typography outliers, and individual source-critical recovery/publishing remain tracked by the existing audit. These 48 Guide disclosures are a single module's UI coverage, not closure of the 29 contextual or 15 practical cross-app source follow-ups.
