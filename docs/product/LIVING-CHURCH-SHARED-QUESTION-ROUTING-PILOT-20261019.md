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


## Expansion pass 3 — complete apologetics intake, selected Church Crisis topics, question-retrieval reliability

**Corpus intake**: original navigational IDs now cover **154 topic candidates** — 21 for St Pius X, 98 for the Canon, and 35 for the Sacristan. Of these, **66** navigate only to known original sources; **88** have no cleared conversational source and remain unavailable for auto-answer or automatic referral. The gap count comprises the entire **60** `APOL-001…060` Canon apologetics dossiers, **25** selected Church Crisis `CR-...` dossiers, and **3** Canon ceremonial questions awaiting an exact relevant original passage. These research lists are categorically **not theological answers**; merely locating one does not certify its arguments, provenance or perspective. French question formulations are editorial search strings, not historical quotations.

The linked topic network now contains **77 source-neutral relationships** (30 new in this pass): e.g. APOL-015 ↔ original Pius X Tradition; APOL-020 ↔ Pius X papal infallibility; CR-DOC-02 ↔ APOL-021 on doctrinal development; CR-LIT-06 ↔ original Offertory and Canon Guide moments. Such links signify **research proximity**, not doctrinal conclusions, agreement or authority to merge two unfinished arguments.

### Question-quality checks and identified limits

A 51-question hand-curated EN/FR calibration set initially scored **37/51 (72.5%)** against expected routing outcomes. After adding editorial question variants and disambiguation rules, **51/51** matched the *calibrated set*. This is a development regression, **not an independent success rate**.

A separate 30-question diagnostic set initially matched **12/30**, including five **wrong specific-topic selections** (for example, sanctuary lamp → ciborium; Immaculate Heart → Marian intercession; a priest's post-consecration genuflection → Real Presence). These are important errors even though the router still generated no answers. Specific semantic guardrails and additional navigation variants brought this *same inspected diagnostic set* to **26/30** with **zero wrong specific-topic selections**. Because the fixes were informed by this set, that later result is also *no longer an independent holdout score*. Record the initial 12/30 and the remaining unknowns openly. In particular, some legitimate questions phrased quite differently from the indexed prompts still fail to retrieve a source; low lexical confidence should produce clarification or noncoverage, **not an improvised answer**.

The routing module now labels how it arrived at a proposed selection:

- `EXACT_VARIANT` — the original user phrase matches a curated question variant after normalisation; no additional interpretation confirmation required for **source navigation** (still never a character reply).
- `EXPLICIT_REFORMULATION_CHOICE` — visitor selected an offered interpretation; the selection itself confirms the intended topic.
- `LEXICAL_RANKED` — a nonliteral overlap suggests a topic but `requiresQuestionConfirmation:true` signals that any future UI must ask before treating the suggestion as the user's choice.
- `CONTEXT_FOLLOW_UP_RULE` — rule-matched follow-up based on existing topic context; also flagged for confirmation because context can be misleading.
  
Any **character handoff** independently requires explicit acceptance and an exact matched original-source destination; these two confirmations serve different purposes. No runtime UI is yet connected.

### Next technical gate

Do **not** treat a deterministic bag-of-words matcher as semantic search. To reach production quality, test on a third untouched sample of ordinary first-visit questions, realistic French rephrasings and multiple-topic questions. Add a semantic retrieval/reranking component only after the source registry is mature and with a conservative reject/clarify margin. Final answer composition belongs to the later source-fidelity and dialogue review phases, not this routing pilot.

**All active modules remain draft/research-only.** Neither PR #1406's original Catechism reader nor PR #1419's Sarto voice model nor the LIVE/Simple/Missal Mass engine was modified.
