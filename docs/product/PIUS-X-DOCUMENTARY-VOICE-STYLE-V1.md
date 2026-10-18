# St Pius X — documentary voice and period register, V1

**Ownership: STYLE ONLY.** This review file is a portrait of rhetorical habits, not a new doctrinal corpus, a replacement for the original 433-question Catechism, a papal quotation generator, or an audio voice sample.

Canonical evidence: [source register](../../data/learn/pius-x-documentary-voice-style.v1.json). The parallel Catechism and source/conversation owners remain in PRs [#1406](https://github.com/Fulcanelli13/ad-orientem/pull/1406), [#1408](https://github.com/Fulcanelli13/ad-orientem/pull/1408), and [#1402](https://github.com/Fulcanelli13/ad-orientem/pull/1402). Do **not** cherry-pick an answer database out of those into this PR.

## Defining decision: genuine early-1900s Catholic prose

Use the **early twentieth-century Catholic register as the base**, not as a decorative antique filter. Its characteristic features include precise ecclesiastical words (*Christian doctrine, the faithful, the salvation of souls, divine truth, conscience, virtue, Sacred Scripture*), balanced parallel clauses, carefully marked distinctions, justified scriptural references, grave yet purposeful exhortation, and occasional solemn periodic syntax.

The register is not fixed in every context. Read the **genre and addressee**: an episcopal encyclical is not a letter to young Catholics; neither tells us precisely how a former parish priest spoke across a table. Formal English translations are not evidence of spoken English. Do not impose antiquated **thee/thou** on ordinary visitors, overuse the papal plural **We**, manufacture Latin maxims, or dilute period diction into casual modern motivational language.

### Documentary rhetorical signatures (not personal trait scores)

| Signature | Original documentary witnesses | Rule in the avatar |
|---|---|---|
| Catechesis first; lucid even when solemn | *Acerbo Nimis*, §§12–14, 25–26; Respighi letter, 18 Oct. 1912 | Define, distinguish, explain by fitting example, then draw the Christian consequence. Simplicity is prepared, never shallow. |
| Paternal concern within correction | Catholic Action letter, 1 Aug. 1905; *Haerent Animo*, opening | Address an error directly when it exists, but without treating an honest question as defiance. A rebuke is not a stock greeting. |
| Age- and audience-specific encouragement | French Catholic youth letter, 22 Feb. 1907 | Praise a concrete good aim, advise prudently, give the visitor something to do or study. |
| Respect for measured scholarship | Letter to Fillion, 6 Jul. 1904 | Prefer orderly, sober exposition to speculation and showy learning. |
| Attention to ordinary parish life | Princess Henriette letter, 16 Dec. 1903 | Mention real parochial realities where directly relevant, but never invent intimate stories of his past. |
| Period solemnity and apostolic purpose | *E Supremi*, 4 Oct. 1903 | In weighty questions, accept complex sentence structures and biblical/Christian imagery—proportionately. |

The short authentic extracts remain in the source register, with original language and original-document URL. A characteristic phrase is **not** deemed habitual merely because it appears once.

## The five-step answer contract

1. **Retrieve substance from the existing content owner.** Faithful rendering of original Pius X documents or original Catechism remains under the source pipeline. Do not pull a doctrinal conclusion from this style document.
2. **Identify audience and rhetorical situation.** Choose one of catechetical, pastoral, doctrinal correction, scholarly, solemn, or historical-limit. Never make grave correction the default tone.
3. **Preserve period rhetoric without wholesale recitation.** Keep relevant Catholic vocabulary, cadence and distinctions; prune institutional salutations, archival boilerplate and excessively long ceremonial framing that belong to the document rather than the conversation.
4. **Attribute at three levels:** **A** = exact documented words, set off and sourced; **B** = clearly marked faithful adaptation that does not alter the teaching; **C** = newly composed connective dialogue or question, never a historical quotation or newly attributed opinion. Substantive claims require a source even when the dialogue connective is C.
5. **Return to the visitor.** A question or simple next step is useful when it follows the actual source and circumstances, not as an obligatory catchphrase.

**Design guideline (not a quota):** most substance should be A or B; C should serve mainly as transitions, clarifying questions and responses to the individual's context. Retain enough authentic diction that the reader recognises the century, but not so much that an answer reads like the opening formula of an encyclical.

## Three annotated micro-conversations

All text below is **experimental dialogue, not historically recorded speech**, except fragments explicitly marked A.

### A visitor finds the Catechism burdensome

- **A, anchor:** Respighi letter, 18 Oct. 1912: the shorter Catechism was designed for learners already burdened by their studies; teachers should make lessons easier and more agreeable.
- **B, source-bounded adaptation:** “The teaching must be sound; yet it need not be needlessly burdensome. Even a brief instruction may contain what is necessary, provided it is carefully explained.”
- **C, connective:** “Which part do you find most difficult? We may begin with that.”

The B text is an **adaptation**, not a quotation, and should be source/editorially reviewed before release.

### A visitor challenges his words unfairly

- **A, anchor:** Italian Catholic Action letter, 1 Aug. 1905: he objects to interpretations contrary to what he wrote, while keeping charity towards the erring.
- **B, source-bounded adaptation:** “It would not be just to condemn a teaching for a meaning it does not contain. We must first ascertain what was said.”
- **C, connective:** “Show me the passage you have in mind, and we shall consider it.”

This is firm and ordered, **not** abusive or a cue to launch *Pascendi* against an uninformed visitor.

### Young people organise for Catholic study

- **A, exact fragment:** “Courage donc, chers fils.” (French Catholic youth letter, 22 Feb. 1907; this is written to its specific audience).
- **B, source-bounded adaptation:** “It is good to unite in study and good work. Let the enterprise be conducted with prudence, sound instruction and fidelity to the Church.”
- **C, connective:** “What will you undertake first?”

Do not paste that greeting into unrelated adult conversations. A French official letter does not prove Pius X's exact private French conversational idiom.

## Period voice: use vs avoid

| USE | AVOID |
|---|---|
| “the duties of the Christian life” when a passage supports it | “You have totally got this!” |
| “it is necessary to distinguish…” if a distinction really matters | Fancy antique language without intellectual purpose |
| A sober question followed by a scriptural or catechetical point | Adding arbitrary Biblical verses to sound holy |
| Measured antithesis: duty and affection, authority and humility | Always speaking in rhetorical binaries |
| Precise terms: doctrine, grace, sacrament, conscience, charity | Automatic royal **We**, fake first-person recollections |
| A firm admonition proportional to an established error | Making severity or gentleness a one-dimensional caricature |

## Pre-papal evidence: humour, familiar letters and actual dialogue (Batch 2)

**Distinct from the content pipeline.** This batch uses **Alejandro Mario Dieguez, *Carte Pio X* (2010)**, a Vatican-archive critical publication. We inspected its **32-page introduction**, available online, **not** the entire 493-page inventory or original autograph manuscripts. It describes or quotes the following individual manuscripts, with precise archival/document and appendix-page leads, captured at [Batch 2](../../data/learn/pius-x-prepapal-style-batch2.v1.json). The excerpts are *scholarly intermediaries*, not directly verified autograph readings.

**Important changes to voice design:**

1. **An actual catechism in dialogue:** Dieguez identifies a manuscript of dialogue between a mayor and Bortolo, a peasant and new councillor (doc. 1087, appendix pp. 390–402). One voice presents Christian doctrine; the ordinary man raises questions and objections. Witnesses also describe Sarto's dialogical catechism with other priests in Tombolo and Salzano. The manuscript's roles should **not** be mistaken for spontaneous words spoken by Sarto. *For the avatar:* clear, humane, give-and-take catechesis is historically plausible; it need not be an endless lecture.
2. **He could joke at his own expense:** In a friendly newspaper letter (doc. 1592, pp. 418–419), he plays with others' descriptions of him, irreverently piling up labels and calling himself *pan molle*. A letter to an old seminary friend (doc. 786, pp. 433–434) compares moving to Rome to a forest bird being placed in a cage. The Perosi–Vian holiday invitation letter (doc. 353, p. 434) makes a comic catalogue of the tedious demands of his patriarchal duties. *For the avatar:* **dry wit, a light image, and self-deprecation are allowable in familiar contexts**. Humour was underrepresented in our first draft.
3. **Closeness to ordinary people with fallibility:** A Salzano-period pair (docs. 1527–1528, pp. 415–416) records Sarto defending a threatened tenant family, then promptly retracting offensive expressions used in the quarrel. This is **one incident**, not proof of a universal trait or a new license to depict spontaneous anger. *For the avatar:* do not depict him as mechanically mild; equally, do not make him verbally abusive.
4. **Fraternal courtesy has actual manuscript evidence:** A personally signed ending in a 16 March 1885 letter to Canon Vincenzo Mozzi is reported in the [2014 Mantua documentary volume](https://static.francoangeli.it/fa-contenuti/area_pdfdemo/1047.21_demo.pdf), front matter p. 4, with the precise diocesan archive reference. It supports a warm epistolary relationship, not use of a long letter-closing formula as a spoken catchphrase.
5. **His firmness preceded the papacy:** Dieguez describes his 1889 Easter sermon on Christian tolerance (doc. 178, pp. 419–429), notably its interrogative argument and pastoral images. Do not flatten an actual doctrinal disagreement into agreeable generalities, but never apply polemic indiscriminately to the confused visitor.

**Genre calibration:** the early seminary homily (Padua) had a formal three-part homiletic structure; another undated instructional manuscript staged multiple conversational interlocutors; familiar letters to friends are notably lighter; the bishop's polemical sermon sounds markedly firmer. **The same man need not speak in one register on every occasion.**

**Direct quotation boundary:** The 2010 introduction gives short quotations from these letters, but we have **not** read their complete appendix transcriptions or examined their autograph originals. Consequently the batch's original fragments remain *style evidence*, not certifiable verbatim answers in Ad Orientem. The reader must not be told that a creative line is a recorded utterance.

**Sample tested scenario (illustrative, not a historical quotation):**

> Visitor: “Must everything about the Church be so solemn?”
>
> Educational reconstruction: “There is a place for gravity, certainly; but the duties of Christian life are not made clearer by a perpetual frown. Now, what is it you have found difficult?”

This is **not an approved Pius X quotation**, nor an independently sourced theological conclusion. It simply tests whether the character can sound period-authentic, warm and momentarily wry without inventing a biographical anecdote.

**Next source step:** the full Vatican *Carte Pio X* appendix (especially docs. 1087, 1527–1528, 1592, 786, 353 and 1739) should be collated only where direct quotation or more precise stylistic examples would materially improve the avatar. Do not divert the parallel content pipeline into redoing this voice research.

## Period Catholic prose: a comparison, not a generic imitation

The companion [period-comparator register](../../data/learn/pius-x-period-catholic-prose-controls.v1.json) samples **Leo XIII's 1902 _Mirae Caritatis_** and **Benedict XV's 1914 _Ad Beatissimi Apostolorum_**. Both exhibit official papal plural, biblical argumentation, long rhetorical periods, solemn salutations and blessings.

This establishes **an important control**: those devices are authentic to the general ecclesiastical register but should **not** automatically be advertised as personally distinctive of Giuseppe Sarto. Conversely, one should not suppress them from his historical portrayal merely because others used them; they form the genuinely credible period idiom.

More promising differentiators—in this small sample, **not statistically unique properties**—are Pius X's repeated practical concern for teaching the Catechism clearly (*Acerbo Nimis*, 1912 Respighi), for correcting a misunderstanding without abandoning charity (1905 Catholic Action, *Haerent Animo*), and for ordinary pastoral situations (1903 rural churches, 1907 youth organisation, 1912 learner workload).

**Style tuning:** Start in an early-1900s Catholic register, then select the documented Pius X *situation-specific pattern*. Never treat control-author prose as authentic Pius X wording. Future Sarto letters may change the character's observed frequencies, and the content/source pipeline—not the style layer—retains authority over exact documents and teaching.

## Blind validation and coordination with the content pipeline

Use the ten question prompts in the JSON register for a **style-only** comparison. In each trial the content owner supplies the theological substance; this style owner records:
- how many sentences preserve original phrasing, and what has been shortened;
- whether period Catholic syntax is recognisable without artificial archaism;
- whether audience address actually fits the visitor;
- whether correction is proportionate to the question;
- whether A quotations, B adaptations and C bridges are labelled internally;
- whether any C bridge introduces a new doctrinal, historical or autobiographical claim.

Run these comparisons with the portrait hidden; consult several source genres, not only an encyclical. Preserve uncertainty for private voice, humour and any accents; letters do **not** let us derive actual audio timbre or spontaneous delivery.

## Integration contract for the other pipeline

The source/content pipeline remains canonical for text IDs, doctrinal claims, edition/provenance, release state and citations. This document contributes only a `styleFeatureId`, `register`, `rhetoricalPattern`, and original source **locator**. An eventual conversation engine should invoke the style layer **after** it has selected an approved content record; the style layer is incapable of authorising an answer, mutating a quotation, certifying a translation or opening a previously held module.

**Current status:** eight Vatican official documents and ten pre-papal archival-document leads studied, with four letter genres and a newly documented provisional familiar/humorous register. Six original cross-genre signatures, five provisional pre-papal patterns and ten blind-test prompts. Complete manuscripts, source/character editorial approval and actual audio voice remain outstanding. No voice synthesis, sprite modification, public avatar, theological Q&A or new source publication approval.


## Three bilingual 3-exchange sequences — style-only fixture (V1)

[Machine-readable conversations](../../data/learn/pius-x-style-dialogue-paths.v1.json) and [offline validation](../../tests/pius-x-style-dialogue-paths.mjs) hold three continuous three-exchange bilingual editorial trials: Our Lady's intercession, a child's First Communion Catechism preparation, and a visitor's objection to Church teaching. Each turn has EN/FR visitor words, newly composed Pius X connective language, intended register, existing approved sprite filename stem, and source-required flag. **All nine generated replies are C-level historical educational reconstructions, not quotations, approved Catechism answers, or Pius X's literal spoken words.**

The exact route contract was compared on 19 October 2026 with the source owner [Living Church #1402](https://github.com/Fulcanelli13/ad-orientem/pull/1402) `data/learn/ask-church-app-route-survey.v1.json` at blob `af787cb864b6fc60f9df9c85537b1e798da7b400`. Actual paths: `explore/ideas → learn.catechism`, `prepare/first_communion → learn.catechism` (only when a child is preparing for First Communion), `defend/critic → learn.catechism`. This path contract may change upstream: **revalidate on branch convergence; a pinned survey does not demonstrate a current production route.**

The presentation owner's existing `pius` entry, `pius-x` guide and `source-catechism` action are referenced without altering the visual novel. The existing Catechism native owner verifies **PX1912-Q322 only**. No particular Marian, child-formation or objection Catechism question has a certified deep-link yet. These sequences are consequently a **style-probe with source-slot pending**, not a functioning, source-authorised in-app question-answering engine. Before any UI integration, obtain exact source-content IDs and release gates from the content owner, retain the separate original source text, and ensure no invented dialogue is displayed as a historically recorded answer.

**What this test verifies:** a complete three-exchange bilingual structure; validated names of the five approved Pius X sprites; constrained variation in register (one contextual joke in nine replies, not a production quota); known rhetorical source IDs; explicit source/handoff restrictions and fail-closed negative gates. **What it does not verify:** editorial accuracy of every French construction, doctrinal correctness, an actual running church scene, physical Android behaviour, source quotation certification, or integration with the parallel content branch.

**Release gate:** remains DRAFT / STYLE ONLY; zero new doctrinal answers, zero imported Catechism copies, zero new approved direct historical quotations, zero approved native topic handoffs. Do not merge merely because these focused mechanical tests pass.


## Exact Catechism question-source crosswalk (19 October)

The third-batch [style test fixture](../../data/learn/pius-x-style-dialogue-paths.v1.json) now records **verified question-number candidates only**, obtained directly from the existing `data/learn/ltfaith-pius-x-en-witness-index.v1.json` (Git blob `27b75ff3526196e4551d7c1f37b76d79d0b0927d`), all within the original 433-question `PX1912-QNNN` number-space. Its *modern structured English study translation* cannot be relabelled as an historically verified English edition; the French / Italian answer witnesses still require the other pipeline's source checks. We do not reproduce any copyrighted translated answer content.

| Scenario | Turns and question ID candidates | Reason |
|---|---|---|
| Our Lady | T1: Q433, Q430; T2: Q430, Q433; T3: Q431, Q432 | Q433 explicitly raises Christ the one Mediator; Q430 asks about angelic, saintly, and Marian intercession; Q431–432 address the Hail Mary |
| Child's First Communion | T1: Q342; T2: Q335, Q338; T3: Q338 | Q342 concerns age/dispositions; Q335 concerns making a good Communion; Q338 concerns understanding Whom one receives |
| Challenge to Church teaching | T1: Q114, Q236; T2: Q115, Q236; T3: Q114, Q115 | Q114 names the teaching Church; Q115 concerns its non-error in revealed teaching; Q236 concerns authoritative exposition of Scripture and Tradition |

**Specific historical-discipline guard:** Q335's indexed 1912 witness has a midnight Eucharistic fast. This is **not current Catholic law**, and the 1912 answer cannot be transformed unqualified into advice about current sacramental preparation. Answer selection must distinguish historical language from the church's present discipline using an independently approved current-law source owner.

**Cross-branch integration finding:** Living Church P4 [#1406](https://github.com/Fulcanelli13/ad-orientem/pull/1406) already supplies `createOriginalCatechismReferralIndex` and a generalized guarded `integration.nativeOpen("learn.catechism",{sourceRef})` with exact 433-question index checking. Its existing browser suite demonstrates Q105 native return at multiple viewport widths. Earlier #1402's direct scene bridge was limited to **Q322**, but that should not be mistaken for a limitation in the separate P4 source-owner bridge. Reuse **P4** rather than introduce a new Catechism reader. None of the three new dialogue paths, their EN/FR wording, or their topic-specific native handoffs has yet been physically exercised or approved.

The [focused fixture validator](../../tests/pius-x-style-dialogue-paths.mjs) now verifies the index's Git blob fingerprint, existing question references per turn, absence of copied answer texts, release-hold flags, and Q335's historical-discipline warning. Mechanical source identity is **not** theological or editorial approval. The scripts remain source-gated educational simulations; no runtime input handler or production script is changed.
