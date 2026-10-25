# Ask the Church — objective-to-module handoffs (research preview)

This is the canonical *routing survey* for an objective-led conversational guide that can introduce, retrieve and link to explanatory modules without duplicating their content. It does **not** modify navigation, publish the Q&A research corpus, or certify browser availability.

## Evidence surveyed
- `data/app/content-navigation-registry.v1.json`: 63 registered navigation items, including hubs, compatibility aliases and publication-gated routes.
- `data/app/guide-coverage-two-function-audit.v1.json`: information and walkthrough coverage with source-only quality markers.
- `data/app/content-items-apostolate.v1.json`: 36 scenario cards plus nine apostolate skills.
- `src/learn/presentation.js`, `src/learn/lazy-module-registry.js`: Formation launchers, including current Mass Explorer.
- `src/pray/internal-route-owner.js`, `src/pray/confession-paths.js`: prayer owners and Confession situation choices.
- `src/apostolate/browser-entry.js`: supported `open({scenarioId, practice})` and existing cross-module handoff contract.

The accompanying `data/learn/ask-church-app-route-survey.v1.json` indexes **67** distinct source-declared routes (63 navigation-registry entries and 4 additional current-source entries), 36 apostolate scenarios, 9 skills, 7 starting objectives and 26 branches. **These totals are not a count of fully reviewed explanatory modules.** Some entries are hubs, aliases, previews or modules whose Guide is incomplete. Use each row's information/walkthrough status and source file.

## Conversational sequence
1. The guide asks **what the user is trying to do**: understand, defend, practise, prepare, pray, address a general situation, or explore.
2. It asks **one pertinent situation question**. No request for a detailed confession, medical history or other sensitive narrative.
3. It provides **two or three choices of next step**, mixing relevant Q&A, situational apostolate help, and canonical in-app modules.
4. The user can skip, interrupt, return, switch objective or type freely.
5. For a source-bearing explanation, retrieve the approved passage from its **owning reader**; do not paste or regenerate independent doctrinal content.
6. For a module handoff, a deliberate user click should call the existing runtime, report whether opening succeeded, and preserve the conversation state for Back/Return.

## Key example: returning to Confession
- Clarify intent in broad terms: returning after years / asking why confession is required / preparing for a specific sacrament.
- `apostolate:HS02`: pastoral introduction to coming back after a long absence.
- `pray.confession`: actual Confession preparation, which already contains regular, returning and general-confession paths.
- `apostolate:AQ02`: apologetic explanation of why Catholics confess to priests.
- Never request lists of sins in chat, infer personal culpability, or equate a general confession with collective general absolution.

## Handoff contract to implement and accept
- **Formation**: navigate to `learn`, then use `AO_LEARN_APP_V1.openModule(id, options)` and existing canonical module ownership.
- **Prayer**: navigate to `pray`, then use `AO_MODULES.open(id, options)`, after lazy module readiness if needed.
- **Apostolate scenario**: navigate to `apostolate`, then use `AO_APOSTOLATE_APP_V1.open({scenarioId, practice:false})`. Practice mode is a separate user choice.
- **Explore**: navigate to `find`; do not claim a specific map lens has already been selected without a verified lens-selection API.
- **Current-law questions**: historical explanations cannot certify the current regulation; use the competent present source or abstain.
- **Failure and return**: never discard the conversation or claim success before a native owner confirms the handoff; support return focus and scroll state before live release.

## Digesting explanatory material safely
Some modules already have user-facing teaching, others only have short contextual notes or source links. The route survey identifies *where* evidence lives; it is **not** itself a doctrinal-answer database. A subsequent read-only adapter may extract a versioned, permitted passage from an authoritative existing owner and show a short, clearly labelled summary with its citations. Only release-approved source material can enter public answers. The 141 unpublished Apologetics/Church Crisis dossiers remain in a distinct research lane.

## Remaining gates
- Implement and browser-validate destination-specific owners (including failure and return); the 67 routing records are **source-declared, not browser-verified**.
- Add read-only per-owner explanation APIs and provenance checks instead of copying prose into this survey.
- Add robust natural-language objective detection, ambiguity handling, French and typo tests, and privacy constraints.
- Regression-test with the 48/65-card Mass reader separately; this routing work must not alter its structure or state.
- Do not create a new public Formation launcher until acceptance has been signed off.
