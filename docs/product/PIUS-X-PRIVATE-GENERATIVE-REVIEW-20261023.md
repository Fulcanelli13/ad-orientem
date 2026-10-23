# St Pius X — private model-assisted research bench (23 October 2026)

Status: REVIEW ONLY. Do not publish, merge to app, or describe as authentic papal speech.

This experimental bench is layered on the existing P6 source-owned 106-subject, 423-node offline review HTML, which remains unchanged. It adds a localhost-only Node server, an opt-in OpenAI-compatible model adapter and a visibly separate AI editorial draft folio. The browser sees no API key, model URL or provider secret, and conversations are kept only in volatile memory. No independent application, new canonical source corpus or live deployment is created.

## What works

- Visitor selects a subject from an existing papal-document adaptation and asks a free-form question. Biography, catechism reconstructive material and uncertain-source chapters are held rather than spoken by a synthetic Pope.
- The first model call composes a new research-only response using the selected existing editorial answers. A second independently instructed call attempts to verify every factual assertion against those specific passages.
- Evidence IDs must be exact source-owned node IDs. Unsupported IDs, quotation marks, invented first-person testimony, invalid/unsupported responses, missing model/verifier, or personal sacramental requests fail closed.
- The generated reply is kept visually distinct from authored original dialogue, labelled NOT AUTHENTIC PAPAL SPEECH, and links to original document locators marked NOT COLLATED. Only the approved five original expression images may be used.
- Model calls happen only after explicit local configuration and local visitor interaction. The original self-contained HTML continues to operate offline without a model.

## Private setup

Build the original P6 from the existing owners, in order:

    node tools/build-pius-x-expanded-standalone.mjs
    node tools/build-pius-x-next12-dialogues.mjs
    node tools/build-pius-x-next12-pastoral-dialogues.mjs
    node tools/build-pius-x-earlier-94-p6.mjs

Set these environment variables in your terminal:

    AO_SPX_REVIEW_MODE=1
    AO_SPX_MODEL_URL=http://127.0.0.1:11434/v1/chat/completions
    AO_SPX_MODEL=YOUR_JSON_CAPABLE_LOCAL_MODEL

Optionally set AO_SPX_MODEL_KEY on the server only. HTTPS may be used for remote compatible APIs, but external providers then receive the questions and editorial evidence. A provider is NOT bundled or guaranteed. Run:

    node tools/pius-x-generative-review.mjs

Visit http://127.0.0.1:8787 on that same computer. The review service deliberately binds loopback only; never expose it publicly, deploy it, or tunnel it. Setting AO_SPX_REVIEW_PORT to a valid port changes the local port.

## Test

    node tests/pius-x-generative-review-e2e.mjs

The CI test uses a mock model, not a provider account. It checks the exact 106/423 source inventory, unapproved status, evidence-ID gate, independent verifier refusal, historical-class refusal, CSRF guard, desktop/mobile, and generated-text separation.

## Scientific and theological limitations

The original P6 closure ledger reports ZERO independently collated original-source supporting excerpts. The current paragraphs are editorial adaptations with source locators, not approved passages. Model verification therefore measures *consistency with the supplied draft passages*, never whether those passages are historically, linguistically or doctrinally correct. A second model is fallible too. The prototype does not yet retrieve semantically across the full corpus. It uses the currently selected subject to limit risk. More sophisticated retrieval is owned separately by shared router PR #1443.

Before public or expanded testing, independently collate primary text for each claim, approve translations, obtain historical and doctrinal editorial acceptance, calibrate source retrieval on independent bilingual questions, stress-test prompt injection and run long multi-turn trials. No publication approval flags were changed.

Related owner PRs: original evidence #1458; period voice #1419; source-only shared router #1443; Living Church #1408; offline P6 stage #1551. This branch is stacked on #1551 and must not merge unapproved research.
## P2 live-model evaluation protocol (added 23 October)

The new `tools/pius-x-live-eval.mjs` is an explicitly opted-in, bounded local evaluator; unlike the mock CI it **can make real model calls** when the user supplies a compatible local or HTTPS endpoint and understands its costs and privacy implications. It does not ship an LLM, use a hidden provider, or run on import.

Build P6 first as above, configure `AO_SPX_REVIEW_MODE`, `AO_SPX_MODEL_URL`, `AO_SPX_MODEL`, and optional `AO_SPX_MODEL_KEY`. Then explicitly opt in:

    AO_SPX_LIVE_EVAL=I_ACCEPT_MODEL_COSTS_AND_DATA_TRANSFER

Run:

    node tools/pius-x-live-eval.mjs

Default evaluation: four selected, existing documentary subjects/questions plus three requests blocked before inference (personal absolution, speculative childhood testimony, forged source node). Of the four model cases, one follows an existing French answer, one poses a natural reformulation, and one probes an attempted instruction override. The selected original subjects and source IDs are recovered from the unchanged P6 corpus at runtime, not a second knowledge base. `AO_SPX_EVAL_CASES` limits the number of eligible model cases to 0–4. The model adapter performs one draft and one strict verification call for each eligible case. A single local model configured for both calls is **not an independent authority**.

Results are written to `artifacts/pius-x-study-expanded/pius-x-live-eval-PRIVATE-UNAPPROVED.json` unless the operator sets `AO_SPX_EVAL_OUTPUT`. They contain the **newly generated answer texts**, evidence IDs and review questions, so keep them private; the script requests owner-only file permissions. No API secret is printed or stored. Do not upload them to a public repository, nor share sensitive visitor chat. Only preset research scenarios are evaluated, not live visitor conversations.

The JSON records structural pass/fail, refusals, response time and evidence-ID provenance. Its manual review rubric deliberately leaves naturalness, character continuity, historical voice and claim-to-text support unrated. **Original-witness accuracy remains UNASSESSABLE** until direct primary-text collation; theological or editorial publication approval is always false. These are not model accuracy percentages or independently validated historical claims.

The CI-only counterpart `tests/pius-x-live-eval-harness.mjs` exercises all seven scenarios with **mock responses**, asserting that the three disallowed scenarios require no model call, evidence IDs are conserved and no approvals are set. Passing this mock test does not mean that a live model was used.

Remaining before public use: collate exact primary passages, create an editorially checked question gold set, stress test prompt injection and doctrinal hallucinations with several real models, review EN/FR translation, assess visitor privacy and inference costs, then seek actual content and release approvals. Stay on the existing PR stack and do not merge #1570 into the production Ad Orientem app.
## P2.1: linked multi-turn evaluation (23 October 2026)

The same local composer now has a **three-consecutive-question** test path using one existing papal-document chapter: `SPX-PILOT-01` (the beginning of *E supremi*). It selects the original author's documented chapter opening and two original authored follow-up question nodes. It does not invent a new source or create a second answer registry.

- With `AO_SPX_EVAL_MULTITURN=1`, the existing explicitly opted-in local evaluation runner appends a three-turn sequence to the same private JSON output. You can use `AO_SPX_EVAL_CHAPTER` for another **existing eligible** papal-document chapter and `AO_SPX_EVAL_LANGUAGE=en` or `fr`.
- Each new question receives only the previous **accepted** editorial drafts from that same chapter and language. Held/refused drafts do not become conversational history. Only the latest original-document opening and selected node may support factual content; prior AI answers have `contextOnly: true` and can never substantiate a new historical claim.
- Model prompts explicitly treat visitor instructions and earlier model text as untrusted context, never as a source of authority. Requests to ignore the sources or invent memories are refused before invoking a model.
- The result records supplied history length, exact repeated drafts, source-ID confinement, nonpublication, and whether each individual turn was held. It does not infer that different phrasing establishes real naturalness. A manual rubric separately asks whether the character follows the actual question, refers appropriately to previous turns, avoids repetition, retains period voice and is faithful to evidence.
- The phone/desktop browser test additionally resets the generated transcript when moving between English and French to avoid unreviewed cross-language history bleed. A different chapter also resets that transcript.
- `tests/pius-x-live-eval-harness.mjs` tests the three-turn path with a mock that deliberately repeats one answer verbatim: the repetition is detected rather than celebrated. This does **not** claim a real model was run or that historically meaningful dialogue has been verified.

**Current status:** still no configured external or localhost live inference run, no model quality score, no approved original-source quotations, and no publication permission. The documented source-class and 106/423 corpus remain unchanged.


## P2.2 — Original-language E supremi anchors (23 October 2026)

The three-turn St Pius X pilot uses the existing opening and two authored follow-ups of `SPX-PILOT-01` without editing their original owner. A separate source-witness annex at `previews/pius-x-study/evidence/pilot01-e-supremi-primary-witness.v1.json` now records eight **short Latin fragments** from the Vatican's original `E supremi` text and maps seven of them to the three dialogue IDs. The eighth records an embedded quotation from **St Anselm** as explicitly third-party testimony, not Pius X's own detailed recollection.

The source is compared with the Vatican's English and French translation pages:
- Latin: https://www.vatican.va/content/pius-x/la/encyclicals/documents/hf_p-x_enc_04101903_e-supremi.html
- French: https://www.vatican.va/content/pius-x/fr/encyclicals/documents/hf_p-x_enc_04101903_e-supremi.html
- English: https://www.vatican.va/content/pius-x/en/encyclicals/documents/hf_p-x_enc_04101903_e-supremi.html

Two findings are important. First, the original text cites St Anselm's anguish at accepting the episcopacy; Pius X adopts the analogy, but the entire Anselm narrative is **not** a literal account of Pius X's private memories. Second, the third existing answer includes the notion of returning humanity through Christ to God; the clearest supporting passage is in **§8**, outside its current listed source locus, "Opening and §§1–4". The annex flags this as a **proposed source-locus extension**. It does not silently rewrite the original record. The opening also identifies the predecessor by context, but does not name Leo XIII in that particular text; avoid describing the name as literally quoted.

The localhost review-only composer receives **short original-Latin witness anchors and editorial warnings** when the visitor has selected one of the three mapped nodes. Its verifier is now instructed to ground relevant factual claims in the Latin fragments instead of considering the unapproved editorial adaptation alone. **This is a bounded spot-check, not full passage collation, doctrinal certification, quotation authentication, or guaranteed model fact-checking.** All existing `publishingApproved` values remain false, the 106/423 owner corpus remains unchanged, and no generated output is promoted.

`tests/pius-x-primary-witness-contract.mjs` checks original chapter IDs, node ordering, original-speaker classifications, the §8 boundary flag, source pointers, and that the reviewer-only evidence reaches both the composer and mock verifier. These structural tests cannot replace expert comparison with original printed witnesses.


## P2.3 — Three more original-language document pilots (23 October 2026)

Three **additional source-witness annexes** are preserved beside the existing `E supremi` evidence. These contain short, explicitly located excerpts from the official Vatican original-language documents, exact mappings to unchanged source-owner dialogue IDs, and separately stated interpretation/attribution boundaries:

| Source and canonical subject | Original witness language | Source-owner nodes | Short anchors | Important limitation |
| --- | --- | --- | --- | --- |
| `SPX-029` — *Il fermo proposito* §3 | Italian (with separate Vatican Latin version) | 4 | 4 | The §3 passage supports corporal/spiritual works and Christian virtues; absence of any association-membership requirement is an **inference**, not a direct papal ruling |
| `SPX-NEW-012` — *Tribus circiter* §§11–12 | Latin | 4 | 7 | Reception of repentant Mariavite priests is conditional; do not turn the 1906 ruling into a present-day canonical-status determination |
| `SPX-PILOT-09` — *Haerent animo* §§15–18 | Latin | 3 | 4 | Priestly exhortation, not a universal rule imposed identically on laity; St Bernard is quoted as a distinct authority |

The new annexes are at `previews/pius-x-study/evidence/spx029-il-fermo-proposito-primary-witness.v2.json`, `spx-new012-tribus-circiter-primary-witness.v2.json`, and `pilot09-haerent-animo-primary-witness.v2.json`. They do not alter the original 106-chapter/423-answer corpus, and should not be conflated with the independently owned papal-source research PR #1458.

The private composer now loads **four** bounded original-language annexes total and supplies the appropriate Latin or Italian fragments, exact original speaker identification and editorial limitations alongside the already unapproved bilingual editorial answers. The original Latin `E supremi` annex remains fully backward compatible. The reviewer-only model verifier must compare relevant claims to these excerpts and abstain on unsupported extrapolations. Two follow-up nodes that require outside context are explicitly held *before inference*: `SPX.DIALOGUE.SPX-029.F3` (categorical membership rule) and `AO.SPX.DIALOGUE.SPX-NEW-012.FOLLOW_3` (modern canonical-status decision).

**Evidence methodology:** These are short excerpt spot checks, **not** full diplomatic transcriptions, comprehensive historical-source collation, verified EN/FR translations, doctrinal approvals, or model-accuracy measurements. Written editorialWarnings identify claims outside the text. Even when the local model and automatic verifier agree, the conclusion is never authenticated papal speech.

Public primary source pages:
- `Il fermo proposito` Italian: https://www.vatican.va/content/pius-x/it/encyclicals/documents/hf_p-x_enc_11061905_il-fermo-proposito.html
- `Tribus circiter` Latin: https://www.vatican.va/content/pius-x/la/encyclicals/documents/hf_p-x_enc_05041906_tribus-circiter.html
- `Haerent animo` Latin: https://www.vatican.va/content/pius-x/la/apost_exhortations/documents/hf_p-x_exh_19080804_haerent-animo.html

The new `tests/pius-x-primary-witness-expansion.mjs` enforces exact source-owner node ordering, stable passage IDs, original-language provenance, no publication flags, 106/423 parity, language-specific metadata and hard holds on the two unsupported future-facing questions. GitHub CI uses a mocked model only; no external provider or live model call occurs here.


## P2.4 — Evidence text verification, not just evidence ID verification (23 October 2026)

The four existing original-language primary-witness annexes are now covered by a **23/23 exact-substring audit** against the Vatican's original-language public HTML. The research annotations record each witness's exact Vatican page line and check date (23 October 2026). One earlier *E supremi* excerpt was corrected: a Vatican numbered note interrupts the Anselm quotation after `Testantur, sic ille`; the stored excerpt now ends there, rather than pretending the footnote-marked text forms one uninterrupted quotation. Speaker remains explicitly `ANSELM_QUOTED_BY_PIUS_X`.

- `tests/pius-x-primary-witness-webtext-audit.mjs` compares **all 23** recorded witness excerpts against separately transcribed, short source-context windows drawn from the four Vatican original pages. It also deliberately corrupts one witness in the independent source fixture and verifies the audit reports failure; missing page windows also fail. It does not infer that all 106 chapters are verified.
- `tools/pius-x-audit-primary-witnesses.mjs` implements the same exact-string presence check against complete official webpage HTML. Normal CI uses injected, limited source windows and performs no network request. For an **actual current website recheck**, an operator can explicitly opt in:
  
      AO_SPX_AUDIT_VATICAN_LIVE=I_WANT_TO_VERIFY_ORIGINAL_TEXT node tools/pius-x-audit-primary-witnesses.mjs

  This command fetches the four original Vatican Pius X pages, requires HTTPS and Vatican host/path, checks **every excerpt**, and prints machine-readable results. It does not call any generative model or need an API credential. Page fetch failures and missing excerpts fail closed. The command is **not claimed to have been run successfully in CI**; CI checks the independent, locally captured text instead.
- The research status is deliberately limited to **literal excerpt presence**. It does **not** independently verify the full translation, theological interpretation, adjacent context, doctrinal claims of the conversation, embedded quotations' authorial attribution beyond the manually recorded caveat, or a full primary-source collation. The script reports all these approvals as false.

The official original texts are linked in the individual annexes. This adds no new product cards, publishing approvals, quote permissions or corpus mutations. Future larger original-source batches can use the same verifier rather than repeating manual ID-only assertions.


## P2.5 — Full-corpus coverage accounting and higher-volume source batches (23 October 2026)

The original P6 remains **106 distinct subjects / 423 bilingual dialogue nodes**. Four documentary subjects, with **14 nodes**, have bounded original-language source-excerpt mapping using **23 short verified text anchors**. The other **409 nodes do not yet have one of these P2 excerpt mappings**. This is a measurable research coverage gap, **not** 409 uniformly suitable original papal statements: some are biography, approved-catechism exposition, or other historical contexts where a papal-first-person answer would be inappropriate. **Zero subjects are certified as fully authenticated**; no generated reply is release-approved.

`tools/pius-x-primary-coverage-report.mjs` now groups **all 106 existing source-owner chapters by underlying document**, normalizing Vatican language variants to one document identifier where applicable. It preserves document/source-class distinctions, counts existing dialogue nodes and excerpt-mapped nodes, and generates a prioritized **twelve-document original-source research batch** from eligible uncompleted papal-document groups. It does not fabricate citations, alter the original registry, or pretend the grouped titles prove document content.

A repeatable JSON report is written into the existing **private CI review artifact**:

    artifacts/pius-x-study-expanded/PiusX_Private_Source_Coverage.json

It contains all document-group counts and the next twelve source-document candidates. Developers can regenerate it after building P6 using:

    AO_SPX_COVERAGE_REPORT_OUTPUT=artifacts/pius-x-study-expanded/PiusX_Private_Source_Coverage.json node tools/pius-x-primary-coverage-report.mjs

The report's unit of progress is **source spot-check coverage by node**, with original-language snippet counts separately. For next batches, work by original document, assess all associated existing questions together, and attach original-language witness snippets with speaker attribution, exact source location and interpretation/translation caveats. Do not convert unsupported biography or catechism exposition into imagined personal testimony. No replacement app architecture or new canonical registry is intended.

## P2.6 — Twelve original-document groups: broad discovery completed (23 October 2026)

The preceding twelve-document suggestion is now an actual checked-in **document-to-dialogue discovery batch**, not just a proposed worklist:

    previews/pius-x-study/evidence/pius-x-next12-primary-document-discovery-20261023.v1.json

It brings together **twelve original Vatican documents**, **53 distinct existing dialogue subjects**, and all **195 existing source-owner dialogue node IDs** attached to them (including dependent dialogue nodes). None is duplicated and each retains its original source-owner filename, subject heading and source locus. A total of **8 new short original-language excerpts** were located in the Vatican pages, and **4 other document groups already have bounded earlier primary-witness annexes**. The eight newly located excerpts remain **source candidates, not promoted model evidence**; eight single fragments do NOT authenticate the contents of 195 nodes.

The documents, in discovery order: Pascendi dominici gregis (12 chapter groups / 37 nodes); Haerent animo (8 / 36); Acerbo nimis (8 / 28); E supremi (5 / 19); Pieni l'animo (4 / 16); Il fermo proposito (3 / 10); Tra le sollecitudini (3 / 9); Divino afflatu (2 / 8); Singulari quadam (2 / 8); Editae saepe (2 / 8); Tribus circiter (2 / 8); Ad diem illum laetissimum (2 / 8). These twelve documents overlap the **four** already established bounded witness pilots and must not be counted as twelve newly certified works.

Original-language Vatican pages were opened. Each document record identifies a suitable initial chapter and its actual original-node ID, a narrow short-excerpt candidate where newly located, and caveats such as historical legal context, embedded quotation attribution, or the need to extend the source locus. English/French doctrinal or historical equivalence is NOT approved. No transcript was generated by an LLM, and the original 106/423 source corpus was not modified.

Automated CI runs `tests/pius-x-next12-primary-discovery-contract.mjs`: it checks the 53 unique existing chapters, all 195 ordered node IDs against the compiled original P6, confirms 8 short fragments against independently transcribed longer source contexts, and fails if a demonstration quotation is corrupted. The test is documentary **discovery plus literal excerpt presence**, not 195 claim-level passes.

**Next gate:** promote a subset of those eight witnesses only where its excerpt literally supports an identified opening or follow-up claim and its speaker, original language and scope are unambiguous. Then extend full-node claim mapping across the 53 chapters at document level, with exceptions queues for historically overbroad legal, liturgical or doctrinal extrapolation. Treat discovery, mapped excerpts, translations and publication as separate counts.

### P2.6a — Claim-level triage of eight newly found original excerpts

After comparing the eight passage candidates with the existing source-owner *opening answers*, the research batch records **eight explicit claim-limitation reports**. Every new excerpt establishes at most a narrow subclaim; **none establishes the entire existing long answer**. The reports specify what is literally supported, what remains unattested, and the precise further source sections required. No new source excerpt has been promoted into the model's evidence annex.

- *Pascendi*: the preamble witnesses the duty to guard the deposit of faith, **not** by itself the disputed details of Modernism (agnosticism, sentiment, changing dogma).
- *Acerbo nimis*: lay catechists are attested; present safeguarding and ministerial distinctions are editorial application.
- *Pieni l'animo*: suitable ordination candidates are attested; no modern personal vocational judgement.
- *Tra le sollecitudini*: holiness and good form are explicit; universality and theatrical restrictions need additional passages.
- *Divino afflatu*: weekly complete Psalter recitation is supported; feast displacement and pastoral burden need the surrounding argument.
- *Singulari quadam*: the labour question is not merely economic; preserve the quoted earlier authority and the particular German mixed-union conditions.
- *Editae saepe*: saints' deeds are remembered and imitated; the specific examples and quoted Scriptures require separate attribution.
- *Ad diem illum*: Mary as guide to knowledge of Christ is supported; the entire doctrinal account of intercession/mediation is not attested by this single fragment.

The original eight chapter/node IDs, source-owner answers, translation flags and publication holds are unchanged. CI now requires each newly found witness to be accompanied by an explicit interpretation-gap queue and `eligibleForAutomatedModelPromotion:false`. This is substantive screening, not a claim of eight fully source-authenticated dialogues.


## P2.7 — Eight opening paragraphs in fuller primary-text context (23 October 2026)

The first twelve-document discovery round identified eight source-document groups lacking a bounded original-language source annex for their opening conversation. We returned to the original Vatican **Latin or Italian** text, locating **41 exact short fragments** across those eight documents and mapping them to the **existing opening node** of each corresponding original dialogue chapter. This is a tangible improvement over the former one-quotation-per-document approach.

    previews/pius-x-study/evidence/pius-x-next12-eight-opening-context-evidence-20261023.v1.json

The corpus remains unmodified. Every fragment records original text, official Vatican URL, original language, source line, proposition supported, speaker classification, and specific unresolved claims. Eight sample openings are covered: `SPX-PILOT-07` (*Pascendi*, 5 anchors); `SPX-NEW-021` (*Acerbo nimis*, 4); `SPX-NEW-013` (*Pieni l'animo*, 5); `SPX-EXP-037` (*Tra le sollecitudini*, 5); `SPX-NEW-003` (*Divino afflatu*, 5); `SPX-NEW-008` (*Singulari quadam*, 6); `SPX-NEW-007` (*Editae saepe*, 4); `SPX-013` (*Ad diem illum*, 7).

### Findings for editorial claims

- *Pascendi*: opening and later sections support a *connected* characterization of Modernism, identifying agnosticism, religious sentiment, evolving dogmatic formulations and the final description of a collection of heresies. Be precise that these are positions *attributed to Modernists and criticized by Pius X*, not Pius X's own beliefs.
- *Acerbo nimis*: the 1905 church directive expressly envisages lay catechetical helpers, particularly where there are few priests; it does **not** itself set modern safeguarding requirements.
- *Pieni l'animo*: the source calls on bishops to consider suitability, diocesan needs, discipline and pride in ordination candidates, but cannot pronounce upon any modern applicant's individual vocation.
- *Tra le sollecitudini*: holiness, good form, genuine art and universality are expressly described; theatrical style is criticized within its historical sacred-music policy. Do not silently rewrite present liturgical law.
- *Divino afflatu*: the multiplication of saints' offices and omission of psalms are linked to restoring weekly coverage, while the directive addresses persons obliged to the Office. Distinguish 1911 historical rubrics from the 1962 Roman rite still used by Ad Orientem.
- *Singulari quadam*: social questions, working hours, wages, moral judgment and charity between social classes occur in the text; a prominent characterization of the social question as religious and moral is **quoted earlier authority**, not original words coined by Pius X.
- *Editae saepe*: imitation of saints, the Christ-centred governing programme and named examples are supported; the original list includes **John Chrysostom** between Gregory the Great and Anselm. St Charles Borromeo is discussed subsequently. Quotations of St Paul and predecessor Popes should remain attributed.
- *Ad diem illum*: original Latin explicitly presents Mary guiding believers toward Christ, while Christ is affirmed as mediator and source of grace. An especially strong title of Marian mediation is inside a quotation attributed to **Pius IX**; the aqueduct image comes from St Bernard. No autonomous or rival mediation should be attributed to Mary.

A new structural and original-context test:

    node tests/pius-x-eight-opening-context-witnesses.mjs

It compares all 41 excerpts to **separately transcribed, longer original-language Vatican context windows**, fails on a deliberately falsified fragment, checks exact source-owner opening IDs and protects speaker attribution. It does not mean that all eight opening answers, their remaining follow-ups or the 195 nodes across the twelve-document discovery batch have undergone complete claim-level verification.

**Deliberate gate:** `newModelEvidencePromotions:0`, `newlyApprovedFullDialogues:0`. These newly widened contexts are still a *research evidence dossier*, not an authenticated papal transcript or an automatic permission for generative publication. Next work is a claim-by-claim EN/FR equivalence check and a secure, source-scoped model evaluation that can use only the supported propositions; no entire answer should pass merely because five correct excerpts were found nearby.


A separate evidence-to-claim map is maintained at `previews/pius-x-study/evidence/pius-x-eight-opening-source-claims-20261023.v1.json`. It preserves **41 narrow propositions** with the exact original-language snippets and speaker identifiers, alongside explicit unresolved claims for all eight openings. This is **claim-level original-text support** and expressly not a verified EN/FR translation, approval of the original full authored replies, or automatic permission to use the source as a generated historical quote. The existing CI check enforces exact parity with the 41 recorded primary witness IDs. The model review runtime's automatic source promotions remain at zero.


## P2.8 — Eight bilingual opening comparisons and minimal corrections (23 October 2026)

The eight opening answers selected during the twelve-document primary-source round have now been checked against their **actual rendered P6 English/French dialogue** and the 41 original Latin/Italian witness phrases:

    previews/pius-x-study/evidence/pius-x-eight-opening-bilingual-audit-20261023.v1.json

This audit attaches exact EN and FR phrase spans to original witness IDs, plus an exception queue for extra context, potentially stronger translation, embedded quotations, or modern editorial disclaimers. It records **25 aligned EN/FR claim spans** and **21 editorial cautions** across eight opening subjects. These figures describe *limited review classifications*, not percentages of correctly translated words or proof of complete source fidelity. No independent certified translation has been produced.

A useful implementation finding emerged during the first CI check: two existing openings (`SPX-NEW-013`, `SPX-NEW-021`) had already been substantially rewritten by the **P5 conversational-voice overlay**. Reviewing their original P4 source records therefore examined obsolete text rather than the actual P6 user-facing experience. The audit was repaired to use the final P5 answers; CI hashes the actual rendered EN/FR opening paragraphs and checks every reviewed text span against the rebuilt P6 source. Future reviews must always use the *resolved P6 answer* rather than an older stage input.

The remaining cautions include: `Pieni l'animo` Italian **indisciplinatezza / orgoglio della mente** can be strengthened unhelpfully by English/French words implying deliberate contempt; `Editae saepe` lists Gregory the Great, **John Chrysostom** and Anselm, while the two existing versions omit Chrysostom in their introductory comparison; `Ad diem illum` distinguishes Christ's sole redemptive authority and includes a Marian title quoted from **Pius IX**; and several answers mix historical papal voice with modern interface disclaimers. The disclaimers belong in the source/attribution UI, not unmarked pseudo-historical dialogue.

Four conservative bilingual correction proposals are recorded **without applying them** to owner data or P6 generated dialogue:

    previews/pius-x-study/evidence/pius-x-opening-bilingual-correction-proposals-20261023.v1.json

They include restoring the missing third saint's name, tightening discipline/intellectual-pride wording, crediting the apostolic admonition quoted in `Pieni l'animo`, and moving a visitor/AI disclaimer out of character speech into the source drawer. These proposals must be reconciled through the existing source/voice owners; the PR deliberately does not create another content registry or overwrite the running reader.

`tests/pius-x-eight-opening-bilingual-audit.mjs` asserts all exact source-to-translation spans, the 21 explicit cautions, the immutable canonical dialogue counts, P5/P6 overlay parity, and that the four suggested changes remain **unapplied**. **Eight openings examined, zero bilingual translations approved, zero complete answers authenticated, zero new model-evidence promotions.**


## P2.9 — Four source-fidelity edits applied in the existing editorial layers (23 October 2026)

The prior eight-opening EN/FR review identified four high-confidence changes. Those changes have now been **applied in this private, draft P2 branch** to the existing editors/source-owner layers; no new voice overlay or dialogue corpus was created:

1. **`SPX-NEW-013`, `Pieni l'animo`:** The P5 conversational-voice record now says "Indiscipline, particularly when fostered by intellectual pride" / "L'indiscipline, particulièrement lorsqu'elle est nourrie par l'orgueil de l'esprit", reflecting the original Italian `indisciplinatezza ... l'orgoglio della mente`. The previous "disdains obedience" / "méprise l'obéissance" statement strengthened the source's wording.
2. **`SPX-NEW-013` (same record):** The warning against hasty laying on of hands is explicitly identified as **the Apostle's warning to Timothy**, which Pius X quotes in the encyclical, rather than portrayed as an entirely original papal formulation.
3. **`SPX-NEW-007`, `Editae saepe`:** The existing P3 bilingual chapter now names **Gregory the Great, John Chrysostom and Anselm**. This matches the original Latin triad and corrects the earlier two-person enumeration.
4. **`SPX-013`, `Ad diem illum`:** The existing P1 bilingual opening no longer ends by discussing a supposed private reply to an **app visitor**, which is anachronistic within the visual-novel historical voice. The existing independent English/French reader labels (`EDITORIAL REVIEW · NOT A HISTORICAL TRANSCRIPT` and its French equivalent, plus the source attribution surface) remain visible; the disclaimer has not been silently deleted from the experience.

Files edited: `previews/pius-x-study/spx-p5-conversational-voice-revisions-4.v1.json`, `spx-p3-new-chapters-saints-social-4.v1.json`, and `spx-p1-openings-bio-partial-16.v1.json`. The original source-owner commits and preceding text remain available in Git history, and the stacked base PR #1551 has not been modified by these branch-only changes.

The original draft-and-suggestion pair for all four is retained in `evidence/pius-x-opening-bilingual-correction-proposals-20261023.v1.json` with the new `APPLIED_TO_PRIVATE_REVIEW_BRANCH_NOT_RELEASE_APPROVED` status. The eight-opening bilingual review sidecar now follows the **actual rendered P6 answer bytes**, and records **27 bounded EN/FR source alignments**, **17 remaining cautions**, and the four resolved cautions. These are editorial screening counts, not a certification of the French or English or a claim that the other source-backed statements were independently authenticated.

All existing **106 subjects / 423 bilingual nodes** are preserved. All model and publication gates remain false. CI regenerates the P6 standalone HTML and checks the proposed edits against the currently rendered English and French opening; no live inference or model endpoint was run.


## P2.10 — Source-only inference gate: no complete unverified P6 answer sent to a model (23 October 2026)

The most important generative-bench weakness was that the composer previously received `evidence[].text` containing **the complete unapproved EN/FR P6 editorial answer**, even when only a few original-language excerpts had been checked. A model and its verifier could agree with the draft without establishing what Pius X originally wrote. This was a documentary claim-laundering risk.

The private review composer now uses `tools/pius-x-source-only-gate.mjs` and a strict pre-inference hold. From the existing 106 original topics, **twelve** documentary subjects have sufficient *bounded original-language excerpt mappings to enter a limited experiment*: the four previously attested small pilot subjects and eight newly researched opening subjects. **Ninety-four** other openings cannot invoke a model via the private review API. In the eight newly researched chapters **only the original opening node** is eligible: all uncollated follow-up nodes are held. The earlier four pilots can use only individually mapped original-language fragments, subject to prior explicit safety/overreach holds.

For a supported input, the model receives only:

- The current visitor question and narrow topic/node ID.
- Short English editorial **glosses of specific source-backed propositions**, not the full pre-authored P6 answer.
- Each original Latin/Italian fragment, its exact source link/location, speaker/quoted-author label and interpretive cautions.
- Up to three same-subject, same-language past conversation turns as **untrusted orientation only**, never as new evidence.

Any answer whose cited node is not in this bounded evidence set is refused before inference; the old source-owner EN/FR prose is never passed as evidence. The composer and secondary verifier are prompted to abstain on other claims. This cannot mechanically prove the meaning of free-form generated natural language: the same model provider's second response is **not** independent ecclesiastical review or certification. Publication and historical-authenticity flags remain false.

`tests/pius-x-source-only-gate.mjs` checks all 106 subjects, the 12-opening research scope, eight new opening-only node limits, exclusion of existing complete P6 answers from model payloads, and refusal of uncollated subjects before any model call. `tools/pius-x-live-eval.mjs` chooses only gate-eligible research cases and replaces a previously injected long editorial-history snippet with a neutral context note. Tests still use a mock provider in CI.

**Terminology clarification:** this is a new **private experiment exposure** of previously collated candidate fragments, not a source-owner promotion, a release gate, a certified translation or a fully verified papal answer. Existing source discovery's `newModelEvidencePromotions:0` refers to **approved/persistent evidence promotion**, which remains zero; these short fragments are exposed only to an explicitly configured and opted-in trial. No paid endpoint or external model was run during this work.


## P2.10 — Turn-by-turn dialogue repetition diagnostics (23 October 2026)

The existing private `tools/pius-x-live-eval.mjs` three-turn test now records reproducible **conversation-form diagnostic signals**, distinct from source-fidelity and doctrinal checks. For each accepted *unapproved* generated draft: Unicode-aware word and sentence counts; previous-turn token Jaccard overlap; exact repeated sentences at least 35 characters long; overlap with the latest question's longer words; flags for unusually long monologues (more than 165 words or nine sentences) and unusually high previous-turn lexical overlap (at least 0.78). All are labelled `HEURISTIC_SIGNAL_NOT_QUALITY_JUDGEMENT`. They can surface repetitive mini-sermons and drift from the immediate question, but do not *prove* meaningful dialogue or historical style.

`tests/pius-x-live-eval-harness.mjs` now asserts those signals against a deliberately repetitive three-turn mock and separate French-accented, distinct-topic and verbose-answer fixtures. Model calls remain mocked in CI. The existing `tools/pius-x-source-only-gate.mjs` is untouched: only original-language snippets and narrow glosses can be sent to an optionally configured model; the full P6 editorial answer is excluded, and the eight expanded chapters still have only source-mapped **opening** nodes eligible. Their unmapped follow-ups are held. The original *E supremi* three-turn pilot remains the sequence tested for conversation continuity.

This step adds **diagnostic observability, not a live-model quality result**. It reports no approval, no model-generated papal text for public use, no verified translations, no provider identity, and no invented performance scores. A true conversational acceptance decision still requires running the optional evaluator with an explicitly configured model endpoint and assessing all claims against original-language sources.


## P2.11 — In-chat GPT-6 bilingual E supremi specimen (23 October 2026)

A concrete **six-reply English/French scripted dialogue specimen** was composed in the current GPT-6 ChatGPT text conversation, using only the eight previously checked short Latin fragments for *E supremi* and the associated original source-owner questions. This is a first content/voice specimen after the earlier architecture and mocked-model tests, **not** an external configured-provider run:

    previews/pius-x-study/evidence/pius-x-e-supremi-gpt6-inchat-bilingual-dialogue-20261023.v1.json

Two languages × three existing source-owner nodes, each reply **36–40 words in English and 36–37 words in French**, with explicit original witness IDs, neutral attribution flags and five approved sprite expressions as the only permitted vocabulary (the sample uses thoughtful, grave and explaining). The specimen deliberately avoids invented conversations, names or quotes: St Anselm's embedded testimony never becomes the Pope's personal memory; the predecessor's name is not inferred from the selected Latin line; the third turn explicitly uses **§8** for humanity-through-Christ-to-God rather than silently restricting the locus to §§1–4.

**Crucial methodological distinction:** All six replies were authored as **one scripted in-chat sequence**, not generated sequentially using the application's `configuredModel` API adapter. There was no fresh per-turn external inference, no independent second-model claim verifier, no statefulness test of the live runtime, no source or translation certification, and no score of genuine conversational responsiveness. The phrases may be useful as an editorial quality reference; they are not evidence that the deployed engine works.

`tests/pius-x-inchat-bilingual-conversation-specimen.mjs` treats those authored replies as a frozen, non-approved fixture. It replays each answer through the existing *mock* composer/verifier API for both languages, checks all seven distinct source witness IDs and exactly three original node IDs, verifies source-only payloads do not disclose the unverified full P6 answers, and counts repetitions/monologues. It explicitly asserts the fixture's `externalProviderEndpointCalled:false` and `multiturnStatefulnessTested:false` flags. Replay test passes cannot be described as a successful real-model provider run.

**Next empirical gate:** an opted-in configured real model must independently generate the three turns *sequentially* in both languages with prior accepted replies supplied only as context. Preserve the raw provider results and provider metadata privately; compare source support, history dependence, repetition, unnatural sermon length and style. Never use self-rating or a second model's unsupported approval as authentication of the source.


## P2.12 — Bilingual configured-provider acceptance gate (23 October 2026)

The decisive empirical question is whether an independently configured model endpoint can sustain **three actual sequential replies in English and three in French** from the original `E supremi` source owner, with no prior-session history leaking into a different language. The existing `tools/pius-x-live-eval.mjs` now supports `AO_SPX_EVAL_BILINGUAL=1` together with `AO_SPX_EVAL_MULTITURN=1`. It records accepted/held turns, distinct language sessions, source-ID and publication gate failures, repeated sentences, overlap and monologue diagnostics, and **actual attempted compose / verify provider requests**. No historical, stylistic, doctrinal, or bilingual authenticity approval is implied.

**Provider status:** No live endpoint or API key has been configured in this PR or this connected workflow. Critically, **GitHub Models was retired on 30 July 2026**; older suggestions to use GitHub Models with `GITHUB_TOKEN` are obsolete and were not attempted. Use an already-authorized HTTPS OpenAI-compatible endpoint or a local compatible endpoint, with model identifier and any credential provisioned securely outside Git. Do not commit secrets, post them in chat, or add an automatic GitHub Actions job that spends third-party inference credits.

**No-network readiness report (does not print API secrets):**

    AO_SPX_EVAL_READINESS_ONLY=1 node tools/pius-x-live-eval.mjs

**Once an explicitly configured provider is available:** From the project checkout with `artifacts/pius-x-study-expanded/SPX_Study_Expanded_106_P6.html` built, supply `AO_SPX_MODEL_URL`, `AO_SPX_MODEL`, and optionally `AO_SPX_MODEL_KEY` through secure environment injection, and run:

    AO_SPX_LIVE_EVAL=I_ACCEPT_MODEL_COSTS_AND_DATA_TRANSFER \
    AO_SPX_REVIEW_MODE=1 \
    AO_SPX_EVAL_CASES=0 \
    AO_SPX_EVAL_MULTITURN=1 \
    AO_SPX_EVAL_BILINGUAL=1 \
    AO_SPX_EVAL_CHAPTER=SPX-PILOT-01 \
    node tools/pius-x-live-eval.mjs

The command uses six separate composer requests **plus six separate model-verification requests** if all six draft compositions succeed (up to twelve model calls in this bounded trial). `AO_SPX_EVAL_CASES=0` keeps optional general scenarios out of the budget. It writes a local, private mode-0600 JSON record with the exact six responses and approved-source ID pointers, marks all manual ratings unreviewed, and sets a nonzero exit status if a source/publication guard fails, if no provider calls occur, or if fewer than all six supported trial questions receive an accepted research draft. Even six accepted research drafts are not a publishing pass: second-model verification is not independent philological certification.

**What was completed in CI instead:** `tests/pius-x-live-eval-harness.mjs` exercises two sequential language sessions with a mock function and verifies `history=[0,1,2,0,1,2]`. `tests/pius-x-live-bilingual-loopback-adapter.mjs` makes **twelve actual loopback HTTP requests**, six composer + six mock-verifier, against an **in-process FAKE model server**, proving that the configured adapter's HTTP transport and mode-0600 private report path work while asserting no cross-language context, no exposed secret and no release flags. Neither fake-model scenario counts as a live LLM evaluation, and no unapproved papal dialogue was published.

**Next external dependency:** supply an authorized provider/model access path and perform the actual six-turn, twelve-call run. The GitHub PR remains draft until the raw provider transcripts are assessed for first-turn directness, second-/third-turn continuity, accurate Latin-source support and embedded-author attribution. Other source/style pipelines remain independent and should not repeat this engineering work.


## P2.13 — Document-batched follow-up evidence expansion and provider dependency (23 October 2026)

The real configured language-model trial remains blocked by **provider access**, not by the six-turn harness. A connected Vercel project named `ad-orientem` was discovered, but the team **refused authorization** for even a no-decryption environment-variable metadata listing. No secret was read, no key was created, no credits were spent and no deployment was altered. Do not attempt to bypass Vercel team access or imply the endpoint is configured.

While provider access is unresolved, the eight source-documented opening subjects were processed **together** through all **22** existing associated P6 follow-ups. The original research annexes and their stable dialogue IDs were reused, not cloned:

    previews/pius-x-study/evidence/pius-x-eight-document-followup-triage-20261023.v1.json

The batch records **14 bounded original-language candidate follow-ups** and **8 explicit pre-inference holds**. The original answer paragraphs still are not themselves evidence: `tools/pius-x-source-only-gate.mjs` attaches only an approved *narrow research scope* with the individual source snippets and speaker attribution; it excludes the full authored English/French P6 answers. The hard-held follow-ups include modern personal culpability, vocational counselling after rejection, particular wage setting, subjective assessment of devotion, and claims that require a wider original passage.

One noteworthy gap was actually filled through the official **Italian** *Tra le sollecitudini* §§3–5: three new short verbatim Vatican source witnesses attest Gregorian chant as the musical model, classical polyphony's admissibility, and certain modern compositions being admitted under conditions. They support `SPX-EXP-037.F2`, whose historical answer had previously been held for lacking original paragraphs. These are excerpts, **not** a complete liturgical-law audit or a ruling about today's rubrics.

Source-only evidence coverage in the **existing twelve mapped papal-document subjects** is now **36 of 423 P6 nodes**, composed of **14** nodes from the four original primary witness annexes, **8** opening nodes from the expanded evidence dossier, and **14** newly bounded follow-ups. This is an increase from 22 to 36 mapped nodes, not a change to the underlying **106 subjects / 423 bilingual authorial nodes**. There are **67 recorded original-language research fragments** in these annexes in total (23 older + 41 prior expanded + 3 new), some re-used by several conversation nodes. The other **387** source-owner dialogue nodes have not entered this specific original-language snippet gate. None of the 36 complete answers is thereby authenticated, certified in English/French, or publication approved.

The coverage report and its CI assertions now derive each source-mapped node from the actual source-only gate, rather than repeating the obsolete 14-node earlier metric. The new source-only test covers **all 22 follow-up classifications**, checks 14 precise allowlisted excerpt sets against existing node IDs, verifies that all eight unsupported follow-ups are refused before inference, and confirms the Italian music witnesses against separate source-context excerpts.

**Next unblocked task:** original-language mining across the 53 already discovered chapters in the twelve-document batch, working in substantial documentary batches and separating narrow evidence links from full-answer approval. **Next blocked task:** an externally authorized model endpoint plus safe credential injection and, only then, a paid/real sequential English/French inference trial.


## P2.14 — Six-document bulk original-text research wave (23 October 2026)

This pass deliberately increases throughput by working against **six original Vatican source documents at once**, reusing paragraphs across all related dialogue questions rather than generating new paraphrased answers. The existing 106-subject, 423-node P6 is unchanged.

    previews/pius-x-study/evidence/pius-x-six-document-wave2-20261023.v1.json

- **Pascendi dominici gregis (Latin):** original §6 Modernist agnosticism and religious feeling plus additional original-language source witnesses for scholasticism, historical inquiry, seminary oversight and bishops' supervision of writings.
- **Acerbo nimis (Latin):** children, first Communion preparation, religious instruction in secular schools, adult catechesis beyond the homily, accessible expression, and the four-/five-year Roman Catechism subject cycle.
- **E supremi (Latin):** restoring society in Christ, charity and mildness toward those in error, perseverance and hope.
- **Il fermo proposito (Italian):** ecclesiastical oversight of Catholic action alongside appropriate temporal organizational freedom, and the material/moral needs of disadvantaged people.
- **Tribus circiter (Latin):** unauthorized Mariavite association, explicitly praiseworthy devotional practices when properly observed, false revelations and legitimate episcopal discipline. This must never become a blanket judgement of later groups.
- **Haerent animo (Latin):** priests' example, meditation on Christ, spiritual reading, personal penance and the spiritual gift desired at the Pope's priestly jubilee. Ancient scriptural or patristic excerpts cited by Pius X are not represented as papal autobiographical testimony.

**Source-acquisition volume:** **35** additional short original-language Vatican excerpts, mapped to **51** existing bilingual dialogue node IDs in **25** existing subjects. Original P6 source-owner policy identifies **four** of those subjects as `partial` and forbids papal-persona inference from them; the five associated node proposals were explicitly held (SPX-EXP-014, SPX-EXP-015, SPX-EXP-022 twice, SPX-EXP-044). **46** narrower subject/node candidate mappings across **21** other existing subjects were admitted to the **research-only** source gate. Thus the full private gate now covers **33 distinct source-owner subjects / 82 P6 node IDs** (previous 36 + new 46). **341** existing nodes remain without such a candidate original-text mapping. In total the research evidence layers record **102** source excerpts (23 original + 41 subsequent + 3 music additions + 35 six-document additions).

This is **a research eligibility gate, not authentication**. Each allowed node receives only its specific original excerpt, narrow English explanatory claim and textual attribution. Original full P6 EN/FR replies are never used as model evidence. P6 `partial` subjects cannot be admitted, however plausible the quote. The five held nodes stay in the discovery register for research but are not passed to the model.

The original Latin/Italian source documents were inspected directly at Vatican URLs in the batch record. This is *excerpt-level* inspection, not a line-by-line collation of all six full texts or a certification of the English/French answers. Embedded quotations from the Scriptures or an earlier Pope require speaker attribution at final source-verification gate. Modern personal canonical rulings, claims about live persons, disputed ecclesiastical practice and today's liturgical obligations remain out of scope unless separately attested.

CI checks all 51 node-ID research decisions, with 46 candidate admissions and five immutable P6 partial holds, all 35 added excerpt records, full research source grouping and the original 106/423 P6 structure. The aggregate coverage report reads the actual source-only gate rather than reporting the obsolete 14/36-node counts.

**Next substantive evidence batch:** address the 108 currently unmapped nodes in the original 195-node twelve-document discovery population, starting with uncovered full-papal subjects and keeping historical counterexamples, personal judgments and P6 `partial` cases separate. No other source master, replica dialogue system or publication release is created.


## P2.15 — Remaining-node sweep across six original papal documents (23 October 2026)

A larger complementary pass screens **every remaining unmapped P6 dialogue node in six Vatican-document families**, without duplicating any of the earlier source-owner records. The batch input is the existing twelve-document discovery register, earlier four original-language witness annexes, 8-opening context research, 22-follow-up triage, six-document wave2, and original **106 subjects / 423 bilingual nodes** (including added dependent follow-ups). The immutable canonical source remains the original P6 and its P1/P3/P5 owners.

    previews/pius-x-study/evidence/pius-x-six-document-wave3-20261023.v1.json

Documents are *Haerent animo* (Latin), *Pieni l'animo* (Italian), *Singulari quadam* (Latin), *Ad diem illum* (Latin), *Editae saepe* (Latin), and *Tribus circiter* (Latin). Across these works the original register contains **20 subjects / 84 existing dialogue nodes**, of which **31 already had source-only evidence entries**. We classified the **53 previously unmapped nodes** in one batch: **38** narrow original-language source candidates and **15** explicit holds, with **40** additional brief original-language Vatican text fragments. The individual counts and exemptions are logged by document, including a held modern-schism judgement in *Tribus circiter*. We did not silently promote a modern personal, wage, sacramental or ecclesiastical legal ruling.

Some concrete attribution outcomes:

- *Haerent animo*: annual priestly retreats, monthly recollection, priestly associations, spiritual reading and actual meditation-to-life duties. The original text **does** record that Pius X supported a priestly association while he was a bishop. That fact is therefore sourced as a personal testimony; invented additional private recollections remain forbidden.
- *Pieni l'animo*: Scripture and the Fathers in preaching; a prudent spiritual director in seminary; beneficial social work with priests' particular ministry safeguarded. Importantly the passages about some social institutions and preserving a priest's character are a **quotation of Leo XIII's 1902 instructions embedded in Pius X**, and retain `LEO_XIII_1902_QUOTED_BY_PIUS_X` attribution, not original Pius X wording.
- *Singulari quadam*: guarded cooperation with non-Catholics for workers' welfare, conditional toleration of mixed associations and explicit limitation to **the German situation of 1912**.
- *Ad diem illum*: Marian devotion flowing from the heart, obedience to Christ, imitation, and faith/hope/charity at Calvary. Suffering is not falsely described as absent: the Latin discussion refers to Mary's own grief.
- *Editae saepe*: encouragement of frequent Communion paired with reverence and worthy reception. A warning against unworthy approach appears in **words quoted from St Charles Borromeo** and is labelled `ST_CHARLES_BORROMEO_QUOTED_BY_PIUS_X`, not silently passed off as Pius X's own formulation.
- *Tribus circiter*: the outstanding modern-schism judgment remains **held**; historical reception and conditional restoration passages were already covered by prior annexes.

The existing `tools/pius-x-source-only-gate.mjs` and CI test now incorporate the 53 explicit new node decisions and exact original-evidence IDs without creating another content registry, overwriting previous mappings or weakening any original `partial` holds. Each admitted node yields only a **limited research claim plus Latin/Italian text**; original whole EN/FR P6 answers are withheld from inference.

**Current cumulative research coverage: 41 existing subjects / 120 of 423 nodes (28.4%) / 142 recorded short original-language excerpt records**, including 38 new candidates from this sweep. **303 nodes remain** outside the research source-only gate, and in the original twelve-document discovery population specifically **75 nodes remain** without this mapping. These numbers express bounded documentary research, **not** source-authenticated complete dialogues. Full-answer authenticity certification, bilingual editorial approval and publishing approval are all **zero**.

The new regression gates assert that the 84-node population is not inflated, all 53 newly triaged nodes are stable owner IDs, exactly 38 can be used in the research-only source gate, 15 cannot, and original P6 106/423 cards, existing six-turn test and approved sprites remain untouched. Next substantive work is the other six Vatican-document groups in the twelve-document source acquisition register, not a third parallel avatar pipeline.

**Cross-batch hold reconciliation:** of the *eight* older follow-up holds in P2.13, **two** now have newly located narrow passages in this wave (*Editae saepe*, SPX-NEW-007.FOLLOW_2, on exemplary pastors; *Ad diem illum*, SPX-013.F3, on Marian devotion and obedience to Christ). Their previous historical hold decisions remain in the source audit trail, but the current gate now allows only the newly attested limited replies. **Six** of those eight older questions remain held. This is separate from the **15** newly held wave3 nodes. The coverage report calculates these counts from the current source-only gate and preserves both historical and live status.
