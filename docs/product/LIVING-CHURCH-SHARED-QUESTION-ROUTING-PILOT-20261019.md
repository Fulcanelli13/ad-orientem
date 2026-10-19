# Living Church — shared question interpretation and handoff pilot
**19 October 2026 · Research-only · Not production-authorised**

## Decision
One question interpreter serves **St Pius X, Monsieur le Chanoine and the Sacristan**. Each still draws on its own original owner: the 433-question Catechism, Mass Explorer's original guide, or the source-backed glossary.

This pilot explicitly **does not** generate character answers, infer pastoral advice, manufacture historical speech, or duplicate the Pius X or Mass knowledge base.

## Deliverables

- [Shared data registry](../../data/learn/living-church-shared-question-routing-pilot.v1.json): **33 bilingual topic candidates** (13 Pius, 7 Canon, 13 Sacristan), of which **30 have specific original source-navigation refs** and **3 Canon topics remain source gaps**; question variants are *editorial search phrases*, not historical quotations.
- [Deterministic interpretation module](../../src/learn/living-church-shared-question-router.js): typed outputs for source-navigation, clarification, referral offer, no-coverage, and explicit accepted handoff. Pure JS; no network, language model or UI, safe for offline tests.
- [Source integrity and route tests](../../tests/living-church-shared-question-router.mjs): map every Pius QID to both the 433-question indexes, and Sacristan G-number to original source-backed glossary records. Four Canon topics point to exact existing Guide IDs: elevation `AO.CARD.015`, Roman Canon `AO.CARD.014`, Offertory `AO.CARD.010`, and Gospel `AO.CARD.007`. Three others are held: altar kiss, colours' meaning, general unidentified gestures. The route `learn.mass_explorer` alone is **not proof of topic coverage**.
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

The transfer contract also checks that the offered destination, original reference IDs and character match a genuinely source-navigable topic. Forged destination references cannot be accepted. This is independent of draft **PR #1406** (Living Church P4 canonical Catechism referrals) and draft **PR #1419** (Pius X documentary voice); neither branch is modified here.

## Integration gates

- **Corpus gathering first**: the Canon and Sacristan pipelines must supply verified topic-to-answer coverage. Reclassify `SOURCE_NAVIGATION_ONLY` only when the original owner attests answer scope and publication status.
- **Ranking upgrade**: this pilot uses simple deterministic variants and token matching. Future semantic retrieval may re-rank, but must return source IDs, flag uncertainty and use the same fail-closed response decisions. Bilingual tests must cover paraphrases, negatives, compound questions and context shifts.
- **Character speech**: content is original-source-locked; natural Pius X conversational texture may be rendered later, with the exact substantive claims source-bound. Editorial handoff wording must not be presented as historical speech.
- **Review UI**: connect only after reconciliation with P4's active scene state and the approved character sprites. Transfer acceptance must be explicit; no surprise change of character.
- **Source-fidelity review** follows completed topic collection, prior to publishing or running open-ended AI answers.

**Coverage gate correction:** An apparent character expert without a specific matching original source is *not* available for automatic referral. In particular, a question about why the priest kisses the altar is a held source gap in this pilot; an opening-Mass Guide reference that merely describes approaching the altar cannot be used as a justification for that specific explanation. Asking why liturgical colours vary similarly routes to a disambiguation with the Canon option shown as source-pending, not answer-ready.


## Expansion pass 2 — existing topics mined, not invented (19 October)

The shared registry now contains **106 English/French topic candidates**, up from the 33-topic pilot. Source ownership distribution: **21 St Pius X**, **50 Canon**, **35 Sacristan**.

| New material | New topics | Authority |
|---|---:|---|
| Additional original Catechism questions | 8 | Specific Q numbers matched to both 433-question English and Italian witness *indexes*; these indexes remain witness locators, not facsimile certification |
| Existing sanctuary-object and vestment concepts | 22 | Existing `G###` glossary records with `SOURCE_BACKED` definitions |
| Additional Mass moments | 6 | Exact published original `AO.CARD.###` Sung Guide moments |
| Canon apologetics question families | 37 | `APOL-###` IDs already in `apologetics-canonical.v1.json`, currently **FROZEN_TARGET_NOT_YET_PUBLISHED** |

Thus **66 topic records** are eligible only for *source navigation*, not original-speech simulation. **40 topics** are *explicit source gaps*: 37 unpublished apologetics dossiers and 3 Canon ceremonial questions without an exact matching approved Guide explanation.

The 37 canonical apologetics questions are useful for recognising what visitors may want to ask. The record carries a `researchRefs` pointer to the existing `APOL-###` dossier and `sourceRefs: []`. **The mere existence of a research dossier never authorises referral or an answer**. The original Canon researcher must identify and approve actual source passages before `SOURCE_NAVIGATION_ONLY` can be granted.

**47 source-neutral relationships** now connect original topic records through roles such as `DOCTRINAL_CONTEXT`, `RELATED_OBJECT`, `RITUAL_SEQUENCE`, `DISTINCT_CEREMONY`, and `OBJECTION_RESEARCH_ONLY`. They are research crosslinks, not logical inferences from several texts, not prewritten replies, and not licences to combine unsupported pastoral conclusions. All destinations and relationship statuses are checked in the router. Examples:

- Real Presence → Q331 whole Christ; original Q330 species; related Mass elevation; relevant tabernacle concept.
- Mass elevation → specifically *differentiate* minor elevation; link to the original published Guide moment and the Catechism's Real Presence teaching.
- Sacred vestments → already source-backed chasuble, stole and dalmatic glossary concepts.
- Apostolic Tradition → **unpublished** Canon `APOL-014` sola Scriptura objection (not an approved Canon answer).
- Consecration / Roman Canon → original Sung Guide moments and their ritual neighbours, without new historical text.

The 10 added English/French matching tests now check representative new source navigations, held apologetics topics and cross-character handoff cases. The focused CI validates original question IDs, glossary definition states, precise Guide moments, legitimate 47 crosslinks, 2 historical source-gap guards, explicit acceptance and referral-loop refusal. These are deterministic baseline tests, **not semantic matching certification**.

**Remaining qualification:** some question variants are hand-curated navigation strings and need realistic user-question testing before claiming high recognition accuracy. French translations of *search phrases* may be used for routing, but neither French historical response text nor original-language Pius X content has been editorially approved by this module. The 37 apologetics dossiers require their own content pipeline; do not treat their mapping into a shared index as completing apologetics research.

**This pilot remains isolated from runtime**, and neither the 433 canonical Catechism answers nor the Canon's original writings or the source glossary are overwritten.
