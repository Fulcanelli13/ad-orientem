# Living Church — shared question interpretation and handoff pilot
**19 October 2026 · Research-only · Not production-authorised**

## Decision
One question interpreter serves **St Pius X, Monsieur le Chanoine and the Sacristan**. Each still draws on its own original owner: the 433-question Catechism, Mass Explorer's original guide, or the source-backed glossary.

This pilot explicitly **does not** generate character answers, infer pastoral advice, manufacture historical speech, or duplicate the Pius X or Mass knowledge base.

## Deliverables

- [Shared data registry](../../data/learn/living-church-shared-question-routing-pilot.v1.json): **33 bilingual topics** (13 Pius, 7 Canon, 13 Sacristan), each with source owner and exact source IDs; question variants are *editorial search phrases*, not historical quotations.
- [Deterministic interpretation module](../../src/learn/living-church-shared-question-router.js): typed outputs for source-navigation, clarification, referral offer, no-coverage, and explicit accepted handoff. Pure JS; no network, language model or UI, safe for offline tests.
- [Source integrity and route tests](../../tests/living-church-shared-question-router.mjs): map every Pius QID to both the 433-question indexes, and Sacristan G-number to original source-backed glossary records. Canon's navigational target is existing `learn.mass_explorer` only, **not** a certified new commentary.
- [GitHub workflow](../../.github/workflows/living-church-shared-question-router.yml) for the data/module/test.

## Output contract

| Decision | What to display | What is disallowed |
|---|---|---|
| `source_navigation` | Name of existing original source/topic to open | Generated Catechism or pastoral reply |
| `clarify` | Two or three candidate interpretations, or ask what gesture/moment was meant | Silently picking a doctrinal interpretation |
| `offer_handoff` | Offer a named colleague only when destination has an identifiable source reference | Automatic character switch or fabricated assurance of an answer |
| `handoff_context` | **After explicit acceptance**, preserve original question, chosen topic, source refs, language, current and destination characters, visited characters | Resending bare text without context; infinite referral |
| `no_coverage` | Hold because no suitable source, historical source limitation or referral loop | Filling gaps with invented Catholic counsel |

All decisions include `answerText: null`. An index hit is **not** permission to pronounce a newly composed doctrinal or pastoral answer.

### Pilot examples

- “Why does the priest raise the Host?” → clarify between what happens at consecration (Pius Q325/Q329) and why the Host is raised (Canon → original Mass Explorer).
- “Why does the priest wear different colours?” → clarify physical vestments (Sacristan G081) or liturgical meaning (Canon → Mass Explorer).
- “What does that gesture mean?” without a selected gesture → require contextual clarification, no guess.
- “What is the small square over the chalice?” → suggest Sacristan, link glossary G189, switch only after user accepts.
- “Can the Pope make mistakes?” → source navigation to Pius Q116, not an invented elaboration.
- “What about His Blood?” after a Real Presence question → match Q331 in continuing context.
- “May I earn more money to support my family?” → **source coverage gap**: Pius Q85 alone does not answer that moral situation.
- “What is the *current* Eucharistic fast?” → fail closed; the historical Q335 fasting rule is not current-law guidance.

## Source ownership and release boundary

The first pilot references only currently existing source owners in `main`:

1. `data/learn/ltfaith-pius-x-it-witness-index.v1.json` and `ltfaith-pius-x-en-witness-index.v1.json`: original section-number locators checked across 433 entries. Their source status is **not full-original-facsimile or answer-by-answer certification**. Do not refer to official approval as proof Pius X personally wrote each word.
2. `data/glossary/concepts-*.v1.json`: existing glossary concepts with `SOURCE_BACKED` definitions. Object IDs in `previews/visible-mass-3d/PHASE1_SANCTUARY_PILOT_QUESTIONS_20261017.v1.json` are still **P4 research-only**; links are optional pilot metadata.
3. `src/learn/mass-explorer.js` and `src/learn/mass-moments-study.js`: route to the original published Guide. `mass-explorer-approved-studies.v1.json` presently reports `NO_APPROVED_STUDIES`, so **do not imply that the Canon's new commentary exists**.

This is independent of draft **PR #1406** (Living Church P4 canonical Catechism referrals) and draft **PR #1419** (Pius X documentary voice); neither branch is modified here.

## Integration gates

- **Corpus gathering first**: the Canon and Sacristan pipelines must supply verified topic-to-answer coverage. Reclassify `SOURCE_NAVIGATION_ONLY` only when the original owner attests answer scope and publication status.
- **Ranking upgrade**: this pilot uses simple deterministic variants and token matching. Future semantic retrieval may re-rank, but must return source IDs, flag uncertainty and use the same fail-closed response decisions. Bilingual tests must cover paraphrases, negatives, compound questions and context shifts.
- **Character speech**: content is original-source-locked; natural Pius X conversational texture may be rendered later, with the exact substantive claims source-bound. Editorial handoff wording must not be presented as historical speech.
- **Review UI**: connect only after reconciliation with P4's active scene state and the approved character sprites. Transfer acceptance must be explicit; no surprise change of character.
- **Source-fidelity review** follows completed topic collection, prior to publishing or running open-ended AI answers.
