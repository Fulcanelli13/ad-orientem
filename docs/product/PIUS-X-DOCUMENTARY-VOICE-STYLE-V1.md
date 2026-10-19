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

## Pre-papal Sarto: informal voice attested by original-letter editions

A second, separate [archival style register](../../data/learn/pius-x-prepapal-conversational-evidence.v1.json) now tracks **six individually locatable cases** drawn from Alejandro M. Dieguez's Vatican-archive edition, *Carte Pio X* (2010), as identified and discussed in his 2014 historical analysis. This is **not** a duplication of the primary historical-content pipeline: these are manner-of-expression observations only, not newly rewritten doctrine or authorised quotations.

The informal letters reveal **situational humour and self-deprecation** about advancement (the promotion rumour and a friend’s proposed Roman appointment), a playful inversion between master and secretary, a colloquial image, and some documented impatience with administrative complexity. The archival scholar also identifies a **question-and-objection catechetical dialogue** between a mayor and the peasant councillor Bortolo and an episode in which Sarto promptly corrected offensive words he used while defending a threatened poor family.

These observations significantly refine the earlier profile. **He was neither a permanently stern censor nor a bland kindly instructor.** He could be conversational, lively, corrective, self-deprecating and practical. The humour is **documented but not quantified**; do not auto-insert a joke in every response. Equally, the single episode of impatience is not a licence to be rude to visitors. The period Catholic register remains, while familiar correspondence supports a distinctly less ceremonious mode.

Important textual boundary: scholarly discussion includes quoted fragments and archival page references, but only a **complete checked original letter** licenses a contextual historical quotation in the app. Citations to the 2010 edition at pp. 390–402, 415–416 and 432–434 identify the next original passages to consult. A described dialogue does not supply its missing lines. The style pipeline makes no claim to his recorded acoustic voice or Italian regional pronunciation.

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


## Source-bounded explanatory dialogues — editorial V2 (19 October 2026)

The previously scripted three-encounter bilingual scenarios have been **substantively rewritten in their existing source-only fixture**: [`pius-x-style-dialogue-paths.v1.json`](../../data/learn/pius-x-style-dialogue-paths.v1.json). The nine replies now directly explain the visitor's concern before suggesting a follow-up; they no longer default to merely telling the visitor to consult a reference. The three voices remain proportionate: pastoral clarification, one brief familiar joke in a child's lesson, and precise doctrinal correction. Existing approved character sprites remain unchanged.

| Dialogue | Concrete explanation in the reconstructed voice | Independent source/evidence selectors |
|---|---|---|
| Our Lady, exchange 1 | Adoration due to God versus honour of the saints; Mary never a second saviour | `PX1912-Q430, Q433`; Pius X, [*Ad Diem Illum Laetissimum*, §§13–14](https://www.vatican.va/content/pius-x/en/encyclicals/documents/hf_p-x_enc_02021904_ad-diem-illum-laetissimum.html) |
| Our Lady, exchange 2 | Christ alone the source of grace; Marian intercession entirely dependent on His merits | `Q430, Q433`; *Ad Diem* §§10–14 |
| Our Lady, exchange 3 | The Hail Mary asks for prayer in life and at death, directing devotion towards Christ | `Q431, Q432`; *Ad Diem* §§5–8 |
| Child's Communion, exchange 1 | Questioning is normal; complete mastery of the Catechism is not a prerequisite; distinguish Holy Communion from ordinary bread | `Q342`; [*Quam Singulari* (1910), norms 2–3](https://www.papalencyclicals.net/pius10/p10quam.htm) |
| Child's Communion, exchange 2 | Help the child understand Whom she receives and approach Him reverently; do not rely on mere rote recitation | `Q335, Q338`; *Quam Singulari* norms 2–3; [*Acerbo Nimis*, §§13–14, 26](https://www.vatican.va/content/pius-x/en/encyclicals/documents/hf_p-x_enc_15041905_acerbo-nimis.html) |
| Child's Communion, exchange 3 | Repeat patiently; catechetical formation must continue after First Communion | `Q342`; *Quam Singulari* norms 1–3; *Acerbo Nimis* §§24–26 |
| Church teaching, exchange 1 | Christian faith responds to God's revelation, guarded by the teaching Church | `Q232, Q114, Q236` |
| Church teaching, exchange 2 | Distinguish the Magisterium's authoritative teaching from an individual's passing opinion; not every clerical remark is infallible | `Q114, Q115, Q116, Q236` |
| Church teaching, exchange 3 | Identify the precise doctrine and meaning contested; faithfully transmit, rather than invent, the deposit of faith | `Q235, Q236, Q114` |

### Source/provenance boundaries

1. **All nine utterances are newly written educational reconstructions (fidelity level C).** They are not authentic spoken sentences of Giuseppe Sarto. The underlying doctrinal ideas are referenced by precise question IDs and/or papal document loci, but the generated English and French prose is **not** original Catechism translation. No authentic first-person memories are introduced.
2. The original 433-question English witness index represents a **modern structured translation**, not a certified historical English edition. Italian 1912 and French 1913 original answer-level verification belongs to the content pipeline; **no claim of complete collation or bilingual editorial certification** is made here.
3. The 1910 *Quam Singulari* text cited in translation is a decree issued by the Sacred Congregation of the Discipline of the Sacraments during Pius X's pontificate, not a recorded personal conversation or autograph quotation of the pope. Its norms 2–3 directly support the reasoning about a child's comprehension, but these dialogues are not quotations from that decree.
4. **Current-law guard:** `Q335` includes a **1912 midnight Eucharistic fast** and must not be offered as the Catholic Church's present fasting discipline. The new dialogues omit the historical duration; the P4 source-navigation review keeps the explicit warning.
5. In the Church-authority example, distinguish the scope of infallibility from casual opinions, pastoral remarks, or every sentence spoken by a priest; the shorter Catechism's teaching must not be inflated into a claim of unrestricted personal infallibility.
6. The nine generated replies remain **draft, review-gated, runtimeImportAllowed=false**, with historical-style, doctrinal, English and French editorial approvals all false. P4 [#1406](https://github.com/Fulcanelli13/ad-orientem/pull/1406) has only source-indexed study-topic navigation; it does **not** import these reconstructed speeches. If a later review-mode scene wishes to preview such lines, require an explicit historical-simulation disclosure and a separate publication boundary.

The [mechanical validator](../../tests/pius-x-style-dialogue-paths.mjs) now checks each revised turn for declared claim IDs and source locators, real existing question IDs, meaningful explanatory length, accurate historical/decree attribution labels, the Q335 warning, and release-gate invariants. A green code test establishes **registry consistency**, not theological truth or historical impersonation accuracy. Human review remains required.


## Common one-person voice review (19 October 2026)

The [unified documentary assessment](../../data/learn/pius-x-unified-documentary-voice-review.v1.json) establishes a single character across familiar, instructive and authoritative registers. It reconciles the separate St Pius X doctrine/biography pipeline and the present **style-only** work. Its nine style invariants are *editorial heuristics anchored to identified sources*, **not** authentic phrases or a machine-authorised conversational persona.

### Editorial review outcome — nine V2 turns

| Case | Turn 1 | Turn 2 | Turn 3 |
| --- | --- | --- | --- |
| Our Lady's intercession | Retain with local edit: recognise the visitor's concern | **Revise locally:** avoid repeating turn 1 and abstract "treasury" language | Retain with local edit: keep the concrete Hail Mary practice |
| Child's First Communion | **Revise locally:** remove unverified "teacher well occupied" joke | Retain with local edit: one practical catechetical question | **Revise locally:** remove invented examination aphorism and compress instruction |
| Church teaching authority | Retain with local edit: decisive distinction and precise question | Retain with local edit: keep magisterial/individual remark distinction | **Revise locally:** respond plainly before repeating previous doctrine |

**Editorial score:** 5 retain with local edits, 4 revise locally; **zero turns approved for publication**. The V2 texts have *not* been overwritten by this assessment. Alter only an identified problem while preserving reviewed canonical substance and EN/FR correspondence.

### Evidence and speech provenance

- A clear, simple teaching method is a documented prescription of [*Acerbo Nimis*](https://www.vatican.va/content/pius-x/en/encyclicals/documents/hf_p-x_enc_15041905_acerbo-nimis.html), but it does not document a particular invented exchange.
- [Sarto's pre-papal evidence register](../../data/learn/pius-x-prepapal-style-batch2.v1.json) records several letters described or excerpted by Dieguez. Their humour, self-correction and attention to ordinary circumstances are **contextual evidence**, not permission to fabricate a humorous first-person memory or catchphrase.
- The complete Mayor–Bortolo dialogue, Dieguez doc. 1087 pp. 390–402, **has not been read**. Its described structure is useful, but its wording cannot be invoked as a verbatim voice witness.
- The doctrine owner controls original Catechism substance and ecclesiastical accuracy; this voice review controls only rhetorical/genre fit. Historical French or Italian autograph-level diction has not been certified; English and French need **independent editorial review**.
- Treat modern English translations of encyclicals as reliable access to their published teaching, **not** direct evidence of Sarto's English speaking habits. Distinguish authorial letters, official documents, prepared catechetical literature and later testimonies.
- Every simulated statement remains newly composed educational speech, explicitly distinct from exact source quotation. Avoid implying documented motives, feelings, jokes or personal conversations.
- Keep historical **Q335** fasting discipline distinguished from current law, and keep the native original-Catechism source owner intact.

### Mechanical quality gates after reconciliation

[The style test](../../tests/pius-x-style-dialogue-paths.mjs) now validates exact source references, traceable editorial reviews covering 9/9 turns, non-publication, and absence of unsupported manuscript/translation approval. **No fixed minimum dialogue length, mandatory humour count or rhetorical-question quota** is imposed. A passing automated test means the provenance structure is consistent; it **never** certifies the reconstructed wording as historically characteristic of Sarto.

**Cross-pipeline handoff:** [P4 source-owned St Pius X navigation](https://github.com/Fulcanelli13/ad-orientem/pull/1406) should not import this review matrix or nine C-level dialogue replies into public runtime. Content specialists may refine claims and sources without creating a new style-owner database. The style pipeline should apply local textual edits only after reviewing the original source passage and visitor context.

**Implementation update (19 October):** Four identified replies (Marian #2, First Communion #1 and #3, Church-authority #3) were locally revised in both EN/FR, preserving their documentary claim and source IDs. The other five V2 replies were left unchanged. The review matrix records these as applied **but still subject to historical, doctrinal and bilingual editorial clearance**; no source-based quotation or public avatar speech was approved.


## Original-language source audit and critical translation hazard (19 October 2026)

The [nine-turn original-language source collation](../../data/learn/pius-x-original-language-collation.v1.json) is a **read-only source-critical assessment**, not a new answer owner. It records nine cross-checked witnesses, individual source verdicts for all nine simulated replies, and four hazards. Original source texts have not been copied wholesale into the avatar.

**Confirmed online textual discrepancy — `Ad Diem Illum Laetissimum` (1904).** The [Vatican Latin](https://www.vatican.va/content/pius-x/la/encyclicals/documents/hf_p-x_enc_02021904_ad-diem-illum-laetissimum.html) explicitly says it is *far from us* to assign Mary the divine power to produce supernatural grace; the [Vatican French](https://www.vatican.va/content/pius-x/fr/encyclicals/documents/hf_p-x_enc_02021904_ad-diem-illum-laetissimum.html) agrees. In contrast, the current [Vatican Italian webpage](https://www.vatican.va/content/pius-x/it/encyclicals/documents/hf_p-x_enc_02021904_ad-diem-illum-laetissimum.html) reads `È dunque evidente che noi dobbiamo attribuire alla Madre di Dio una virtù produttrice di grazie`. This **appears to omit or reverse the Latin negation** and is also at odds with the Italian passage's adjacent affirmation that Christ is the source. The erroneous-passage hypothesis requires confirmation against a printed Italian edition; do not treat a website's official hosting as proof that one web translation is faultless. Use the Latin for the decisive doctrinal distinction and preserve Mary's derivative/intercessory role rather than claiming independent production of grace.

**Checked Latin sources.** [*Acerbo Nimis* Latin](https://www.vatican.va/content/pius-x/la/encyclicals/documents/hf_p-x_enc_15041905_acerbo-nimis.html) confirms instruction should be practical, accurate, accessible and prepared; [*Quam Singulari*, norms II–III, DH 3531–3532](https://theofons.net/it/ds/3100) confirms full doctrinal knowledge is not required before First Communion, that the child distinguishes Eucharistic from common bread, and that instruction continues afterwards. *Quam Singulari* is a **congregational decree approved under Pius X**, not a personal conversational autograph. The Latin DH witness is an excerpt rather than a direct inspection of the complete AAS 2 (1910) 577–583 original.

**Original Italian 1912 approval letter.** The [Italian letter to Cardinal Pietro Respighi, 18 October 1912](https://www.vatican.va/content/pius-x/it/letters/documents/hf_p-x_let_19121018_catechismo.html) confirms Pius X personally examined and approved the abridged catechism, consulted bishops, and aimed to reduce the educational burden on children. It does **not** certify the modern structured English 433-answer witness as Pius X's personal Italian speech.

**Question-index precision.** Q342 relates to the **age of the Easter Communion obligation**; use *Quam Singulari* for criteria of first reception. For the question asking whom a child receives, the existing modern English witness's **Q325** speaks directly to the Real Presence, whereas **Q335** mixes preparation and a historically obsolete midnight Eucharistic fast. Therefore the draft child's second exchange now uses **Q325 + Q338** instead of Q335 + Q338. The P4 content/source owner [#1406](https://github.com/Fulcanelli13/ad-orientem/pull/1406) received the source issue; no app route or original Catechism answer changed in this STYLE workstream.

**Remaining evidence limitations:** The complete original 1912 Italian catechism questions have not yet been collated here; its present English structured witness remains a modern translation. Nor have the complete Bortolo dialogue or autograph personal letters been inspected. The French and English reconstructed avatar replies are **educational inventions** whose textual and doctrinal accuracy needs human editorial approval; no green test can substitute for that approval.


### Targeted original-Italian Catechism comparison — same research batch

The previously unresolved **specific question-level Italian transcription** has now been checked for **15 relevant questions**: Q114–116; Q232, Q235–236; Q325, Q329, Q335, Q338, Q342; Q430–433. The pinned original-language transcription is [`gustavo-depaula/ember`, `it/` at commit `65d10046...`](https://github.com/gustavo-depaula/ember/tree/65d10046c19b610a4307ef273a751ceeb3c4f153/content/books/pius-x-catechism/it), while an independent [Italian edition transcription](https://www.linuxpac.it/catechismo-della-dottrina-cristiana-1912-detto-di-san-pio-x) corroborates the numbering and Italian content of the **10 Marian and faith/Church teaching questions**. This is a comparison of **modern transcriptions of the 1912 Italian Catechism**, **not** direct inspection of a 1912 printed volume or the autograph of Sarto.

Specific conclusions: Q433's Italian uses `per essi, e solo per essi` for the saints' derivative intercessory power; Q116 explicitly qualifies the Pope's infallibility by defining faith and morals as Pastor and Teacher of all Christians; Q325 directly describes the Host as Christ's true Body after consecration; Q335 explicitly contains `essere digiuno dalla mezzanotte`, the **historical** fast; Q342 concerns *comunione pasquale*, not an exhaustive First Communion readiness checklist. These check the theological *anchors* of the avatar scripts more securely than the modern English index alone, but do **not** approve any reconstructed EN/FR dialogue or allow a text from a compiled catechism to be labelled spontaneous speech of Pius X.

See [targeted collated question list](../../data/learn/pius-x-original-language-collation.v1.json) for all 15 QIDs, URLs and source-convergence status.


## Personal correspondence benchmark — three contrasting cases (19 October 2026)

The [three-passage source-first benchmark](../../data/learn/pius-x-personal-voice-benchmark.v1.json) is the next step beyond calibrating three theoretical personas or revising generic theological paragraphs. It adds **two pre-papal autograph letters known through partial catalogue quotations** and one papal manuscript letter made available through images and a modern English translation. All three retain original-genre and access limitations.

| Historical situation | What is actually documented | Editorial voice effect, not alleged verbatim speech |
| --- | --- | --- |
| [1896 reference about Angelo Roso](https://www.galileumautografi.com/autografo.php?id=6633) | Sarto, as Patriarch of Venice, observes a mill worker's gradual honest advancement and gives concrete information about family circumstances in a handwritten letter to Marchese Guerrieri Gonzaga. We have only dealer-quoted fragments, not a complete diplomatic transcription. | Attend to occupation, effort, conduct and family facts before making a judgment; no blanket jovial-populist stance or invented first-person acquaintance. |
| [1892 handwritten condolence](https://www.galileumauctions.com/schedaautografo.php?id=3448&nome=autografo-di-giuseppe-sarto-futuro-papa-pio-x-lettera-condoglianze-) | In a Mantua letter to a countess, Sarto recognises her years of sacrifice and sorrow, offers Christian consolation and hope. The sales catalogue quotes only short Italian fragments. | Speak to the actual loss and sacrifice before general consolation; avoid guaranteed eternal outcomes, forced tenderness or a sermon detached from the mourner. |
| [1908 original handwritten crown-of-thorns correction](https://www.newliturgicalmovement.org/2025/02/a-handwritten-1908-letter-from-st-pius.html) | Pius X recognises devotion but objects to replacing the symbolic crown of thorns with a gold crown, substantiating the judgment through the Passion and liturgical hymns. A translated full letter and manuscript photographs are available; original Italian not independently transcribed in this review. | Recognise worthy intention, then give a decisive theological correction grounded in a concrete object, without staging confrontational performance. |

The benchmark supplies **three explicitly composed EN/FR educational examples** with a separate source ID, the portion that can genuinely be supported, the invented connective/visitor text, and unapproved historical/doctrinal/translation flags. These are *not* imported into the Pius X folio, not part of the original 433 Catechism answers, and not authentic spoken quotations.

Important editorial change: examples are now drawn from **different personal situations** rather than forcing a catechism formula into every encounter. Do not transfer an 1892 condolence manner mechanically to Church controversies, nor a 1908 papal correction to an anxious child. The differences are contextual reactions of **one** person, not three disconnected artificial personalities.

The authentic early catechetical Mayor–Bortolo document 1087 remains identified in Dieguez, *Carte Pio X*, pp. 390–402, but its full text is still unavailable to this review. The letter-source excerpts likewise remain incomplete, so the benchmark cannot certify exact spontaneous Italian syntax or a statistical fingerprint of his speech.


## Expanded Sarto correspondence and eight source-first contrasts (19 October, batch 9)

**Historical source improvement:** The archival review now includes [eleven individually locatable personal/secretariat witnesses](../../data/learn/pius-x-personal-correspondence-evidence.v2.json), mostly Sarto's own drafts and documented marginalia, in addition to the previous [three personal scenarios](../../data/learn/pius-x-personal-voice-benchmark.v1.json). Especially valuable is Sergio M. Pagano's [research on the *Segretariola*](https://parrocchiariesepiox.it/san-pio-x/opinioni-e-news-pio-x/505-gli-inediti-sulla-segretariola-di-pio-x), which reproduces extracts with archive box, protocol and date references from the *Archivio particolare di Pio X*. A separate [1886 letter in Capuchin convent custody](https://www.parrocchiariesepiox.it/san-pio-x/opinioni-e-news-pio-x/314-san-pio-x-e-i-cappuccini-veneti) attests lightly teasing a friend, then requesting prayers. Historical parish sources also reproduce [an earlier vocational caution involving his nephew](https://parrocchiariesepiox.it/san-pio-x?id=9&start=40&view=category) and a [1880 self-assessing letter](https://www.parrocchiariesepiox.it/san-pio-x/opinioni-e-news-pio-x/550-profezie-e-profeti-nella-vita-di-san-pio-x).

**A foundational source distinction:** Sarto sometimes **wrote the draft with his own hand but grammatically in the secretary's third-person voice**, then directed that it be dispatched with Bressan's signature. The original autograph composition, public signer, narrated speaker and final dispatched text must be distinct metadata fields. Neither every Bressan-signed dispatch nor every published Vatican letter is a transparent transcript of what Sarto casually said in person.

**Unexpected anti-hagiographic finding:** In a documented 15 August 1908 reply, he rejected fabricated or unverified edifying anecdotes, including the claim that he went barefoot to school *in order to spare his parents' expense*. This is a hard negative gate for biographical avatar dialogue. The fact that a story flatters him cannot substitute for documentary testimony.

The new [eight EN/FR contrastive evaluation scenarios](../../data/learn/pius-x-personal-voice-contrastive-eval.v1.json) deliberately cover uncertain childhood memories, vocational discernment, parochial rumours, friendly teasing, procedural access, flattering fiction, disputed authorship and immoderate correspondence. Each has a source-specific rationale, a plausible educational response, a **negative counterexample to avoid** and an explicitly unapproved grading state. Example outcomes to look for:

- **Personal life question:** Does the persona resist repeating an undocumented barefoot-childhood story, even when it sounds touching?
- **Child and vocation:** Does it balance genuine encouragement with the difficult question of discerning a true priestly calling?
- **A worried acquaintance:** Does it offer sober practical counsel rather than an invented affectionate formula?
- **A familiar friend:** Can it occasionally show light humour and still request prayers without making humour obligatory?
- **Source scholarship:** Does it distinguish the Pope's own handwritten draft from a secretary's signature instead of inventing one-to-one authorship?
- **A long distressed memorial:** Does private impatience *not* turn into insulting an ordinary visitor?

The fixture test only checks source records, example completeness, archival limits, attribution boundaries and the fact that **no example or French/English turn is approved**. It never judges whether dialogue is historically authentic through arbitrary word-count or numerical personality scores. Existing nine topic dialogues and P4's canonical Catechism reader are deliberately untouched.

**Outstanding:** original manuscripts have not been inspected; the complete Mayor–Bortolo dialogue is still not available; much of the supporting wording is reproduced by scholars, not collated from autograph photographs. Full or authoritative modern French/English renditions remain pending. No release or runtime import is permitted.


## Review-only visual-novel staging (19 October 2026)

**Working interactive HTML comparator:** [`previews/pius-x-voice-scene-review-20261019.html`](../../previews/pius-x-voice-scene-review-20261019.html). This is a **standalone editorial review page**, not a second P4 Living Church Folio or an imported conversational production system.

The preview renders **14 distinct scenarios / 20 EN+FR exchanges**, drawn directly into the HTML at commit time from the existing three topic-dialogue cases, three documentary personal-letter benchmarks, and eight contrastive evaluation cases. No further simulated dialogue is invented by the UI. It uses the **exact five approved Pius X expressions and papal-study background** from P4's pinned immutable head [`8af296fc7e8...`](https://github.com/Fulcanelli13/ad-orientem/tree/8af296fc7e8ca632883546b54721270c8ef0ef59/assets/living-church), loaded via a public image URL. The text, code, source metadata and local ratings function in a saved HTML file; the external artwork still requires connectivity.

**Reviewer workflow:** choose Teaching (3), Personal (3) or Voice tests (8); step through each conversation turn; switch EN/FR; open the Evidence pane to follow original Vatican, 1912 Italian Catechism transcription or identified autograph/historical source links; assess *naturalness*, *character continuity* and *length/rhythm* (0–5), then export local ratings and detailed comments as JSON. Ratings do **not** certify authenticity or theological correctness and are stored in the user's own browser, not transmitted to GitHub.

The document demonstrates the missing acceptance test—**one consistent personality reacting differently to different visitor circumstances**. A high rating does not approve a hypothetical reply for publication. The HTML is not loaded in `src/learn/`, does not modify the canonical Catechism source owner, and never routes a new simulated utterance into the production P4 character reader. It preserves explicit non-quotation disclosures. [`tests/pius-x-voice-scene-preview.mjs`](../../tests/pius-x-voice-scene-preview.mjs) verifies frame counts, content/source IDs, five poses, interactive controls, JavaScript syntax, provenance links and review-only gating; the focused GitHub workflow watches the page and test.

**Publication gate remains closed.** All C-level reconstructed speech needs doctrinal, historical, English/French and scene-editorial approval before any separate production task may consider integrating it with the source-owned Catechism. Actual screenshot/visual quality review in a browser is an additional required gate; automated tests are structural only.


## User-rated voice reset — remove editorial filler (19 October 2026)

A user rated six directly compared Catechism/voice conversations: **Q433 3/5, Q325 3/5, Q363 2/5, Q116 3/5, Q206 3/5, Q85 3/5**, mean **2.83/5**. Explicit rejection: *"too many fillers that removes credibility ... why are you adding so many comments? where do they come from?"*

**Source of the defect:** the earlier STYLE registry asked for a regular opening acknowledgement, definition, illustration and final application/encouragement. Those editorial scaffolding requirements generated unsourced phrases (e.g. "We must be precise", "You need not pretend", added prayers, artificially tidy closing morals). They were **not** authenticated utterances by Sarto or literal original Catechism propositions. Good Catholic advice does not become appropriate dialogue merely by being harmless.

**Binding correction:** The registry's catechetical, pastoral, correction and familiar registers now begin with the **original answer's distinctive proposition and necessary conditions**. The operative norm is **one original proposition → one necessary contextual bridge → stop**. An analogy, reassurance, exhortation, biographical aside or practical consequence is *not* part of a mandatory response template. Any new claim must be recorded as original-source proposition, independently sourced secondary claim, necessary marked inference, or discarded unsupported padding. Preserve exact theology and period diction where evidence supports them; naturalness is not measured by length.

The [review matrix](../../data/learn/pius-x-unified-documentary-voice-review.v1.json) records the **six concise source-minimal revised examples** and identifies what is direct evidence versus necessary contextual inference (e.g., Q116 on definitions and Q85 on family livelihood). These are **review examples only**, not additions to the canonical 433-question Catechism, published conversations, or independently authenticated historical speech. The previously authored fourteen-scenario HTML is unchanged and should not be mistaken for the newly calibrated voice. A passing source-fidelity test checks the review contract; it is not a performance or historical diction certification.

**Next review priority:** assess the revised sentences side-by-side in chat, not automatically writing yet more pastoral elaborations or commissioning another prototype. In particular, revise any additional sentence that the reader cannot trace to the exact Catechism question or a specifically cited witness.


## Superseding user clarification — conversational *style* is welcome; editorial *substance* is not (19 October 2026)

The user clarified after rating six in-chat samples: **"pastoral comments and AI conclusions are exactly what we want to avoid... for conversational padding, its not so bad as we give the avatar st piusX's voice."** This **supersedes** the prior overly mechanical "source proposition → minimum connective → stop" model where it could be mistaken for a ban on natural speech.

**Two separate layers:**
1. **Content, closed:** each doctrinal proposition, moral judgment, pastoral instruction, personal experience or practical conclusion in the character's answer must come from an identifiable original Pius X writing, authenticated original Catechism Q&A, or separately authorised historical source with precise locus. No editorial 'common sense' inference, unsourced reassuring comment or pastoral coda may be placed into Pius X's mouth. Genuine advice from the original source is permitted because it is **original content**, not AI pastoral invention.
2. **Voice, open but disciplined:** the same original propositions may be recast in conversational cadence, suitable order, direct address, light spoken transitions, and historically documented syntax or idiom. Neutral connective language need not pretend to be a historical quotation. It must not smuggle in an additional claim, conclusion, attitude or anecdote. This is **not** a requirement to produce telegram-length speech.

**Six-item corrective disposition:** the previous user ratings remain Q433 3, Q325 3, Q363 2, Q116 3, Q206 3, Q85 3 (mean 2.83/5). The [user-calibrated review register](../../data/learn/pius-x-unified-documentary-voice-review.v1.json) now records **five source-locked sample reconstructions** and **one held source gap**. Q85 explains why Christ chose poverty but **does not answer** whether a particular visitor may improve family income: delete the unsourced "That does not forbid an honest livelihood" claim and hold that scenario until a directly applicable source is found. Q116's defined infallibility condition does not by itself entitle the avatar to elaborate personal comments on every papal remark. Q363 should give the source's definition rather than a new spiritual practice or moral psychology.

**Acceptance test:** underline each independently meaningful assertion in the draft. It must point to a specific source phrase or already authorised textual passage. If it does not, it is *blocked content*. Stylistic elements (e.g., a simple "Certainly" or a change in word order) may remain where they change no factual, theological or practical meaning. Conversely, an extra sourced sentence is permitted even if longer. Content owner must certify clauses; style owner calibrates historically informed phrasing. The earlier nine V2 dialogue drafts and 14-scene comparator are **pre-clarification**, not cleared for publication.

This revision is a direct correction to our earlier tendency to confuse pastoral realism with permission to invent pastoral advice. No public character runtime or original catechism has been modified.
