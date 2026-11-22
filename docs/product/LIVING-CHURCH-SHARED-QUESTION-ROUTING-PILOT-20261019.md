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


## Expansion pass 4 — exact Canon Guide references and pre-change routing probe (19 October)

This pass first froze a new **52-question English/French challenge set** in `data/learn/living-church-fresh-question-probes.v1.json` **before adding further topics or tuning**. It is assistant-authored and *not independent visitor data*. At the pre-expansion baseline, a deterministic run returned **19/52 exact intended topic or acceptable clarification**, **24 unresolved**, and **9 wrong specific-topic suggestions**. A few frozen answer-key judgements themselves need human editorial review (notably an object question about a Missal was mislabelled as chasuble; and a question about the bishop's fallibility is not necessarily a question about the Pope). Retain raw fixture and first-run results for diagnosis; do **not** retroactively call the 19/52 a validated accuracy figure.

The weak performance is significant even though all answers remain `null`: misnavigation can send users to irrelevant topics and make inappropriate colleague referrals. In current pilot, nonliteral lexical matches carry `requiresQuestionConfirmation:true` and now cannot be accepted as a handoff until **both** the topic interpretation and character switch are explicitly approved; the two decisions are separate. A source link is still not an authorised character reply.

**New existing-source material:** **18 additional specific Sung Guide moments** now have bilingual Canon navigation records, including Introit, Kyrie, Gloria, Collect, Epistle, Gradual, sermon, Credo, Orate fratres/Secret, chalice consecration, Canon continuation, Fraction/Pax Domini, Communion prayers and Communion of priest and faithful, Ecce Agnus Dei, Postcommunion and final blessing. Each is linked to an exact `AO.CARD.###` entry in the continuity-certified original 32-moment Guide. No passage was copied; this is not a publication of new historical or theological Canon commentary. The whole registry is now **172 topic candidates**, with **84 original-source navigational topics** and **88 held gaps**; 28 Canon topics refer to exact published Guide moments. The LIVE/Simple/Missal Mass reader remains untouched.

**No model capability claim:** the current variant-overlap matcher cannot reliably identify unseen nuanced user questions. The next serious production prerequisite is a separately evaluated hybrid semantic/keyword retrieval and reranking gate, with conservative abstention, exact source-ID checks, bilingual context tests, and human-reviewed source-to-claim approval *after* the corpus is gathered. The fresh test remains diagnostic even when newer code changes its outputs. The approved editorial goal is to make the three characters converse from their authentic sources, not simply direct users into a glossary or the original Missal forever.

Review ownership: this branch / PR #1443 owns only router scaffolding; Pius X source-aware style is PR #1419, P4 original Catechism / character folio is PR #1406. These parallel pipelines are not overwritten.


## Expansion pass 5 — hybrid lexical + symbolic concept retrieval prototype (19 October)

**Files**: `data/learn/living-church-symbolic-concepts.v1.json` contains a bilingual editorial mapping of **40 subject concepts** to *existing topic IDs only*. `src/learn/living-church-hybrid-question-router.js` adds an **opt-in**, review-only alternative to the unchanged deterministic router. `tests/living-church-hybrid-question-router.mjs` evaluates both against the frozen 52-question diagnostic set and exercises the source/privacy/confirmation gates.

### Implementation precision

The term **semantic** here means **symbolic subject-concept and intent-frame matching**, **not** neural embeddings, language-model similarity, NLI, or a production semantic search service. The hybrid method combines:
- A lightweight weighted lexical similarity score, using each topic's original bilingual search variants and per-language corpus IDF;
- Editorial bilingual synonym/concept matches with explicit topic IDs and no independently authored teaching;
- Source-neutral interpretation frames (person-vs-object, ceremonial action, temporal sequence, doctrinal presence and recognised personal moral applications), which affect *where to navigate*, never *what historical characters say*;
- Conservative ambiguity / source-gap rejection using the unchanged canonical resolver and original source ownership.

The hybrid component does **not** replace the P4 source-of-truth. A proposed topic is not an approved answer. All results retain `answerText:null`; `approvedReply:false`; and inferred matches have `matchEvidence.basis:"SYMBOLIC_HYBRID_RANKED"`, `usesEmbeddings:false`, and `requiresQuestionConfirmation:true`. A suggested handoff still separately requires a source-checked destination and explicit visitor consent. The interpreter cannot silently switch characters. The original router remains the default; merely adding this module does **not** wire any LIVE or visual-novel screen to it.

### Evaluation discipline

The existing 52-question set was frozen **before** this prototype was proposed in this branch, but its questions and intended topic IDs have now been inspected in the engineering process. It is assistant-authored, includes at least two questionable answer keys (a question about the priest's book was labelled with an unrelated chasuble ID, and a question about episcopal versus papal fallibility was over-specific), and is not independently sampled from visitor traffic. Numbers obtained from it are **engineering diagnostics**, not production performance metrics. Additional tuning on its failures invalidates any later claim that this fixture is untouched or independent.

The first implementation reported **19 intended topics / 23 unresolved / 10 wrong specific** for the legacy matcher, versus **25 intended / 19 unresolved / 8 wrong specific** for the symbolic hybrid. That preliminary comparison is limited by the imperfect labels and the narrow, assistant-written sample; the second-round intent-frame score, once CI confirms it, must be recorded separately without replacing the baseline.

**Production gate remains closed.** Before runtime introduction: complete topical source coverage; have domain specialists review intended question labels; collect a genuinely independent English/French first-visit evaluation set; use actual semantic embeddings or another validated model for broad paraphrase recognition; test objection/pastoral/temporal-law edge cases and high-risk false positives; retain original-source ownership and handoff consent; and complete answer-to-source fidelity verification only after topic mining is mature.


### Pass 5 measured second iteration and consent gate

A second symbolic-context pass (40 concepts) adds generic **question frames** for a person versus an object, a ceremonial action versus a physical vessel, offering at Mass, consecutive ritual moments, a Eucharistic doctrinal question and personal moral applications. Frames are intentionally small and inspectable; they **do not contain doctrinal conclusions**. For example, a question about the priest *raising* the chalice must not be sent directly to the definition of a chalice merely because the object is named. A visitor asking whether their own conduct is sinful must not be answered by opening the general definition of sin as though it determined their case.

The CI comparison on the **same already-inspected 52-question assistant-written fixture** currently reports:

| Route outcome | Legacy lexical matcher | Symbolic hybrid, initial | Symbolic hybrid, second iteration |
|---|---:|---:|---:|
| Intended topic or appropriate reformulation | 19 | 25 | **27** |
| Unresolved / safe refusal | 23 | 19 | **25** |
| Wrong specific-topic selections | 10 | 8 | **0** |

This demonstrates **zero wrong selections only for this particular inspected, non-independent fixture**. It absolutely does **not** establish production precision, recall or suitability for an uncontrolled user population. The higher refusal count is a deliberate conservative choice pending proper intent recognition. The fixture contains questionable expectations and no verified independent distribution.

### Source-navigation consent

The hybrid adapter never imports new historical character replies. All inferred candidates carry `requiresQuestionConfirmation:true`; all proposed character transfers independently require `requiresAcceptance:true`.

`confirmSourceNavigation(result, {confirmQuestion:true})` is available as an **explicit opt-in contract** for future UI wiring. It checks the entire claimed `sourceRefs` array and route against the original source-owned topic; forged or uncovered destinations fail. Without user confirmation, an inferred source-navigation candidate returns `needs_question_confirmation` rather than opening anything. A correctly matched exact phrase is eligible for navigation without an *additional* interpretation prompt, though it remains a source link, **never a licence to fabricate an avatar answer**.

**Not connected**: no user-facing UI, image/sprite staging, character-runtime response synthesizer, or P4 source corpus has been modified here. Independent test and source-content approvals still block production use.


## Expansion pass 6 — real-model embedding contract and independently labelled evaluation gate (19 October)

**A genuine embedding model is NOT packaged, downloaded, invoked or represented as tested.** This pass introduces an explicit provider contract rather than rebranding symbolic matching as embeddings.

### Embedding provider boundary

- `src/learn/living-church-embedding-candidate-router.js`: an **asynchronous optional adapter** to a model-provided bilingual vector index and query encoder. Both are mandatory before embedding ranking is enabled.
- The index must declare `AO_LIVING_CHURCH_EMBEDDING_INDEX_V1`, **the exact current catalogue signature**, an immutable model ID/revision, dimensions, language coverage `en/fr`, device/remote execution mode, complete per-language normalized vectors for all **172 source-owned topic IDs**, and `answersIncluded:false`, `approvedReply:false`. Refuse malformed/stale/partial indexes. Catalogue signature uses FNV32 for accidental version drift, **not cryptographic authenticity**.
- The model provider must return the identical model ID, immutable revision, requested language and a unit-normalised finite vector of the declared dimension; otherwise the module does not use its result.
- Preferred future execution: **on-device/offline**. When provider execution is `remote`, the adapter refuses to send the visitor's question unless `consentRemoteTransfer:true` was supplied. This cannot replace platform-level legal/privacy authorisation.
- Retrieval is conservative: trial top-similarity threshold and runner-up separation are **engineering placeholders**, not empirical calibration. A tie triggers clarification; unsupported source ownership remains a hard `no_coverage`. Inferred source navigation and character referrals require independent **question-confirmation** and **handoff-consent** checks. The previous symbolic-only route remains a visible fallback when model/index are unavailable.
- `tests/living-church-embedding-candidate-router.mjs` creates a **172-dimensional one-hot synthetic test fixture** for all 172 topics in both languages solely to exercise validation, matching contracts, tie/abstain, unavailable model, old-index refusal, source-gap and consent checks. Synthetic vectors are not evidence of understanding language or accuracy. They do not correspond to any trained multilingual model and **are never shipped as genuine embeddings**.

### Consent-respecting evaluation design

- `src/learn/living-church-evaluation-gate.js` defines an opt-in private evaluation intake and metric counter. This is **not** a harvested question dataset, nor a scored accuracy report.
- Each actual record requires a voluntarily submitted, **data-minimised/redacted** visitor question; EN or FR language; explicit permission for private research; **two distinct independent annotators**; and an adjudicated action/acceptable topic IDs. The script checks duplicate identifiers, common accidental personal contact details, source/question-variant train/test leakage, existence of referenced source-owned topic IDs, and incompatible labels.
- A public quality claim is gated on at least **25 independently annotated questions per language** (50 total), appropriate provenance and consent, and no detected schema issues. These counts are **a floor, not a statistical sufficiency guarantee**; real-world testing must include adversarial false positives, unanswered questions, changing law and referral-privacy tests. Actual visitor questions are **not to be committed to GitHub**.
- The two small examples in `tests/living-church-evaluation-gate.mjs` are labelled `SYNTHETIC_TEST_ONLY`; passing the test demonstrates schema safeguards, **not independently measured performance**.
- To test a candidate actual embedding model, first supply the exact model-index bundle via an explicitly approved source and **private** question evaluation set, then run both models on the same adjudicated cases, reporting true/false routing, abstention, clarification and ungrounded referrals separately. Do not tune the model to the test set and then call it independent.

### Remaining production locks

The shared topic registry continues to have 172 records, **84 source-navigation-only and 88 held source gaps**. No source corpus, catechism, Living Church avatar character voice, dialogue, Mass reader or artistic assets are modified. This branch/PR remains **draft and disconnected from runtime**. A trained, licensed local-capable multilingual model, its complete topic-vector index, independent human-annotated EN/FR questions, controlled privacy design and full claim-by-claim answer provenance (after content gathering) are still outstanding.


## St Pius X original-document source bridge — research-only addition

The existing shared router now indexes **184 source-only topics** (previously 172): **33 Pius X, 116 Chanoine, 35 Sacristan**. The added twelve Pius X records have **ten historically located source-navigation pointers** and **two explicit source gaps** for invented childhood personal memories and attempted diagnosis of a lay visitor's dry prayer.

The ten new pointers live in `data/learn/living-church-pius-x-historical-passage-pointers.v1.json` and refer to original documentary witnesses: Pius X's `E supremi`, `Pascendi`, `Acerbo nimis`, `Haerent animo`, `Tra le sollecitudini`, the long 1905 Catechism, Salzano manuscript transcriptions, and the 1910 dicastery decree `Quam singulari`. They are **URL-and-section locators only**, not copied sources or approved replies; first-person quotation is NOT authorized for third-party biographies, catechism answers or the dicastery decree. The source-scoped question evidence remains owned in draft [St Pius X research PR #1458](https://github.com/Fulcanelli13/ad-orientem/pull/1458).

**Cross-branch frozen evaluation:** [CI run 39267811444](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39267811444) ran the 36 previously authored alternative phrasings and 12 contextual follow-ups against this 184-topic catalog and the existing shared and symbolic-hybrid routers. Source-specific routing is still weak:

| Outcome among 48 hand-authored probes | Shared router | Hybrid router |
| --- | ---: | ---: |
| Exact intended source-navigation reference | **9** | **1** |
| Safe unresolved `no_coverage` | **27** | **39** |
| Safe no-coverage for two held personal-answer cases | **8** | **8** |
| Wrong-specific source-navigation proposal | **4** | **0** |
| Produced answer text | **0** | **0** |

The four wrong-specific shared-router routes were: Pope's policy follow-up `E supremi` → Modernism `Pascendi`, Rosary-at-Mass → generic prayer, temptation vs consent → generic sin, thanksgiving after Communion → Real Presence. All inferred navigations still demand user question confirmation; no avatar reply was fabricated.

This is a **source-owner reconciliation and executable routing baseline**, not a passed semantic-retrieval release threshold. Never add the 48 held-out text variants into the router catalog merely to obtain higher test scores. Improve query understanding with independent negative/compound French and English probes, robust intent anchoring and minimum source-scope similarity while preserving all existing source/answer safety gates. Future source navigation must actually resolve the source pointer to its historical URL through the owner's bridge; `learn.catechism` is not itself the original encyclical or Salzano document.

PR #1443 continues to own routing, PR #1458 continues to own question-level historical source research. Neither PR changes the published avatar or the existing Mass reader.


## Source-aware historical-document navigation and confirmed continuations

The shared and symbolic-hybrid question routers now use one common **source-aware historical intent gate** for the twelve PR #1458 St Pius X questions. No new interpreter or answer-generation system was created.

- Historical source-navigation topics carry **two independent bilingual facets** identifying both the historical subject and the requested doctrinal/pastoral scope. Matching an isolated word such as “priest”, “sin” or “prayer” is insufficient. The facts and identifiers remain owned by original historical document records.
- A history-specific match carries `navigationRoute:"historical.external_document"` and `documentNavigation:{url,sourceLocator,witnessClassification,sourceRef,approvedReply:false}`; the URL is taken exclusively from the original pointer registry. Without this registry, the system returns `HISTORICAL_SOURCE_POINTER_NOT_RESOLVED`, not the general Catechism screen.
- A textual match normally **requires question confirmation**. Historical contextual follow-ups may inherit the source only with `context.confirmedActiveTopicId` and a matching documentary continuation cue. Merely returning a guessed topic as `activeTopicId` does **not** confirm it.
- A held personal-life or spiritual-diagnosis case continues to return `TOPIC_SOURCE_GAP` and no speech. Cross-character transfers still need explicit visitor acceptance and confirmed question intent; altered historical URLs are rejected.
- A historical source topic proposed by generic lexical similarity without independently matching the source scope will **abstain**, except exact catalog-authored variants. The clergy-meditation topic requires mental/interior-prayer language instead of treating incidental “priest + prayer” as sufficient.

The [router-owner CI](https://github.com/Fulcanelli13/ad-orientem/pull/1443) tests fifteen additional bilingual documentary source queries, four held personal-answer questions, source URL integrity, three confirmed-context follow-ups, unconfirmed-context non-escalation and forged URL rejection. All are research tests, not live avatar rendering.

**Repeated earlier English diagnostic (48 utterances, not independent):** pinned source-aware router comparison in [PR #1458](https://github.com/Fulcanelli13/ad-orientem/pull/1458) reported **25/48 correct exact historical source navigation, 15 safe unresolved, 8 held and 0 wrong-source** for the shared router; **26/48 correct, 14 safe unresolved, 8 held and 0 wrong-source** for the hybrid router. This is a regression on already-inspected queries, **not a general recall or accuracy estimate**, and the confirmed-context simulation differs from the earlier unconfirmed follow-up evaluation.

The source bridge is now precise enough for further integration work, but still **research-only**: the app must explicitly consume `documentNavigation.url` before users can open the original page from the visual novel. The fact that a document opens does not authorize a historically voiced answer, theological approval, or application of historical disciplinary rules as present-day law.


## Fresh bilingual Pius X diagnostic — first run frozen before evaluation

A separate *new* assistant-authored 60-question bilingual evaluation was frozen in `data/learn/living-church-pius-x-fresh-bilingual-60.v1.json` before executing the router. It contains exactly **30 English + 30 French** prompts: **40** intended to have one of the ten historical source-pointer topics, **8** requiring refusal of ungrounded personal recollections or individual spiritual diagnosis, and **12** unrelated, anachronistic or otherwise outside the cited source's scope. **Eight contextual continuations** were also written before execution. No primary question was an exact normalized duplicate of current router variants, prior 52-question probe or PR #1458's earlier 48-dialogue fixture.

The first run is [GitHub Actions run 39272885295](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39272885295), with retained artifact `pius-x-fresh-bilingual-60-plus-8-report`. The immutable baseline is recorded in `data/learn/living-church-pius-x-fresh-bilingual-observed-20261019.v1.json`.

| First-run outcome among 60 new prompts | Shared | Hybrid |
| --- | ---: | ---: |
| **Exact historical original-source routing** | **10** | **10** |
| Safe unresolved historically answerable question | 28 | 28 |
| **Wrong document or unsupported referral** | **2** | **2** |
| Personal-answer restriction correctly held | 7 | 7 |
| **Unsafe source proposal for a personal spiritual diagnosis** | **1** | **1** |
| Unknown/out-of-scope safely abstained | 12 | 12 |
| **Total** | **60** | **60** |

For the source-navigable historical-document cohort, **10/40** were successfully routed for each implementation; **28/40** abstained and **2/40** misrouted. Of those ten correct source identifications, **7 were English and 3 were French**. Among **8 additional confirmed-context follow-ups**, both routers routed **2** correctly and safely left **6** unresolved.

The most concerning result was `SPXFRESH-045`: “From my distracted prayers, can you determine whether I have lost sanctifying grace?” was directed to the `SPX-PILOT-05` definition of sanctifying grace instead of enforcing `SPX-PILOT-12`'s restriction against diagnosing an individual's spiritual state. This did not produce actual speech, but still constitutes an **unsafe unsupported suggestion** requiring a fail-closed routing policy.

Other specific misses:
- `SPXFRESH-007` French lay recitation of the Rosary during Mass → `Haerent animo` priestly meditation (both engines).
- `SPXFRESH-013` English disposition after Communion → Sacristan tabernacle glossary (shared).
- `SPXFRESH-015` French recollection after receiving Communion → theological Real Presence question (hybrid).

The previously reported **25–26/48** success and zero wrong-source regression from inspected development cases **must not be described as predicted general retrieval performance**. This new diagnostic is still **not independent human testing**: it was authored by the same assistant, but was frozen and not tuned against before its first execution. From this point forward any rerun of this fixture is a **regression**, not a fresh test. Do not repair retrieval merely by pasting these exact failed utterances into the matching variants or by weakening historical source attribution.

**Required follow-up (not yet implemented):** prioritize general safe refusal for individual moral/spiritual judgment over generic doctrinal retrieval; improve role distinction between priest's interior meditation and lay participation, Eucharistic practice versus sacramental theology or objects, French-language conceptual reach, and controlled confirmed-context continuation. Keep authored answers disabled and demand a *new separately reviewed* evaluation after changes.


## Individual spiritual-verdict safety boundary — router-level fix

The fresh bilingual St Pius X diagnostic exposed a higher-priority failure: an individual visitor asked if prayer distractions meant loss of sanctifying grace, and both routers offered an unrelated doctrinal source on grace. Even without generated speech, a documentary link should **not** imply that Pius X or an indexed catechism passage has assessed the visitor's soul.

A new shared `src/learn/living-church-personal-verdict-gate.js` screen therefore runs **before** explicit topic choice, confirmed conversation context, source focus, generic lexical ranking or symbolic-hybrid ranking. For a first-person request to decide one's individual moral culpability, lost state of grace, spiritual abandonment, the validity of a particular confession or private divine judgment, it returns `no_coverage` with `UNSUPPORTED_PERSONAL_SPIRITUAL_VERDICT`, no source navigation, no character handoff and `answerText:null`. Both existing interpreters consult the same original gate; there is no duplicate avatar or doctrinal decision owner.

This is deliberately narrower than prohibiting questions containing the words *sin*, *grace*, *confession* or *prayer*. General Catechism definitions, historical questions, and requests for ordinary prayer advice remain eligible for conventional source-navigation decisions. The router does **not** infer that the visitor actually committed sin, lacks grace or needs a medical diagnosis.

The `data/learn/living-church-personal-verdict-boundary-48.v1.json` editorial fixture was committed before the implementation: **24 personal-verdict refusals and 24 permitted general-topic questions, balanced English/French**. `tests/living-church-personal-verdict-safety.mjs` asserts the gate's boundary in isolation and for both real routers, including attempts to bypass it with `chosenTopicId`, a confirmed historical conversation topic or a cross-character destination. The formerly unsafe `SPXFRESH-045` is now a named *regression* case, not new evaluation data.

**Scope:** this safety intervention does not fix French conceptual retrieval, the precision of post-Communion source routing, or the low positive document-recall score from the 60-question diagnostic. That first-run diagnostic remains frozen and its future repeats count only as regressions. No visitor replies, historical first-person claims or doctrine were published by these changes.


## Liturgical role-and-moment source differentiation — regression

A distinct research-only `src/learn/living-church-liturgical-source-scope.js` now preserves source-owner boundaries that were exposed by the earlier bilingual first-run probes. It does not generate source language or answer the visitor.

The router distinguishes four different authorities:
- **Lay Rosary during Mass:** original long 1905 Catechism `SPX-PILOT-02` rather than a priest's interior devotion.
- **The communicant's thanksgiving after reception:** Salzano editorial source `SPX-PILOT-04` rather than theology of the Real Presence or tabernacle architecture.
- **Priestly mental prayer:** `SPX-PILOT-09`, under `Haerent animo`, and only where the subject is the priest's own devotion.
- **The priest's official Mass Postcommunion oration:** the **existing** Canon/Mass Guide authority `mass.postcommunion` at `AO.CARD.027`, not Salzano. The question is handed off only with explicit visitor acceptance when asked from another character.

This distinction uses combinations of **subject, ritual time, sacramental reception and intended devotional action** in English and French, rather than mapping isolated shared words such as “priest”, “meditation”, “Communion”, or “prayer” to an arbitrary record. French apostrophes are recognized as word boundaries. If a layperson asks about generic mental prayer during Mass without an adequately identified historical passage, the router safely abstains. An exact historical URL is returned only from the pinned pointer registry, confirmation remains necessary, and altered document destinations are rejected.

**Tests:** `data/learn/living-church-pius-x-liturgical-scope-26.v1.json` is a 26-case source-scope contrast fixture frozen before the first scope implementation; `tests/living-church-liturgical-source-scope.mjs` checks those cases in both real router engines, three previously observed wrong-source errors as **regressions**, direct original-link confirmation, forged-URL rejection and the Canon's published `AO.CARD.027` ownership.

The [recorded isolated execution](https://github.com/Fulcanelli13/ad-orientem/blob/feature/living-church-shared-question-routing-20261019/data/learn/living-church-pius-x-liturgical-scope-result-20261019.v1.json) of the checked-in JavaScript passed **26/26 scope contrasts** in each router. Repeating the already-inspected 60-question English/French sample now yields, identically for both engines: **17/40 exact historical source matches, 23/40 safe unresolved, zero wrong historical source proposals; 8/8 held personal-answer questions refused; and 12/12 outside-source questions safely unresolved**. Of the 17 exact historical-source matches, ten are English and seven French. This is **developer regression performance**, not independent visitor accuracy, and no answer is certified.

The earlier diagnostic recorded 10/40 exact historical matches, 28/40 safe unresolved and two wrong-source proposals for each engine. Its first-run record remains immutable. Separate safety work already corrected a personal-spiritual-judgment misroute and was not undone by the liturgical source correction.

**Remaining product blocker:** 23/40 historically source-indexed visitor intents remain unresolved. The next stage is broader bilingual concept retrieval, not repeated synonym insertion into these evaluation fixtures. App visual-novel source openers and historically voiced replies are still not published.


## Source-owned bilingual doctrinal concept navigation — first run and guarded regression

The router now has a **seven-family St Pius X bilingual doctrinal concept index** in `data/learn/living-church-pius-x-source-concept-facets.v1.json`, with a single reusable parser in `src/learn/living-church-pius-x-source-concepts.js`. It covers historical papal-election testimony (`E supremi`), temptation versus consent (Salzano), actual and sanctifying grace (1905 long Catechism), sacred music (`Tra le sollecitudini`), Modernism (`Pascendi`), adult religious instruction (`Acerbo nimis`), and child First Communion (`Quam singulari`).

This is **constrained concept-to-source navigation**, not embeddings, a generative semantic model, doctrinal synthesis or historical character speech. Each nominated topic must match two independent bilingual facets and must resolve to an original historical passage already authorized by the St Pius X research pipeline. Ambiguous multi-document matches request clarification; no source is synthesized or copied.

The first execution of the **previously frozen, assistant-authored 46-item challenge** (`data/learn/living-church-pius-x-doctrinal-concept-frozen-46.v1.json`, including six contextual follow-ups) found **27/28 correct historical document pointers**, **1/28 safe abstention** and **zero wrong historical documents** for both engines, but **four of the 12 negative-scope probes were incorrectly assigned a document**. That observation was preserved in `data/learn/living-church-pius-x-concept-first-run-20261019.v1.json` *before* correction; it is not representative user accuracy.

The four negative failures led to **general scope boundaries** rather than question-phrase insertion: no subjective assessment of a living person's grace; no pronouncement that a church musician committed mortal sin; no conclusion that a historic 1903 decree is current universal law; and no assignment to the First Communion decree without a child/first-reception subject. These are enforced before the optional concept matcher and preserved by the hybrid router.

**Repeated, now-inspected regression** measured in isolated execution of the checked-in router code:

| Measure | Shared | Hybrid |
| --- | ---: | ---: |
| Correct source among 28 doctrinal questions | **27** | **27** |
| Safe unresolved among 28 doctrinal questions | 1 | 1 |
| Wrong historical source | **0** | **0** |
| Negative-scope questions safely refused | **12/12** | **12/12** |
| Six explicitly confirmed follow-ups routed correctly | **0/6** | **0/6** |
| Safe unresolved follow-ups | 6 | 6 |
| Previously inspected 40 historical intents (of earlier 60) correctly routed | **36** | **36** |
| Previously inspected 40 historical intents safely unresolved | 4 | 4 |
| Earlier 8 personal-answer holds | **8/8** | **8/8** |
| Earlier 12 out-of-scope declines | **12/12** | **12/12** |

All these numbers are *editorial/regression fixtures*, not real visitors, publication readiness or certified doctrinal answer counts. The 48 bilingual personal-verdict contrasts and 26 bilingual liturgical-role contrasts also passed in isolated execution. The older shared-router Mass Guide regression additionally ensures that conversational “tell me” does not misclassify the speaker as a lay participant offering private prayer. The GitHub Actions workflow is configured to execute the complete test and archive detailed output; CI must be verified separately.

A historical source pointer still requires visitor interpretation confirmation. Missing source URLs fail closed; user-forged document links and source-family ownership changes are rejected. **No approved historical answers have been generated or released.** Remaining priorities: context-aware follow-ups with legitimate explicit consent and independent bilingual human-authored evaluation, then historical prose approval through PR #1458.
