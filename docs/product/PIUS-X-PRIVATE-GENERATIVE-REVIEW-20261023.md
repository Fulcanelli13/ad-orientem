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

**Cross-batch hold reconciliation:** of the *eight* older follow-up holds in P2.13, **three** now have newly located narrow passages in this wave (*Editae saepe*, SPX-NEW-007.FOLLOW_2, on exemplary pastors; *Ad diem illum*, SPX-013.F3, on Marian devotion and obedience to Christ). Their previous historical hold decisions remain in the source audit trail, but the current gate now allows only the newly attested limited replies. **Five** of those eight older questions remain held. This is separate from the **15** newly held wave3 nodes. The coverage report calculates these counts from the current source-only gate and preserves both historical and live status.


## P2.16 — Exhaustive remaining six-document primary-text sweep (23 October 2026)

The other six *already registered* original Vatican documents were screened as a **single 60-node batch**, not as tiny one-topic research iterations:

    previews/pius-x-study/evidence/pius-x-six-document-wave4-remaining60-20261023.v1.json

They are *Pascendi dominici gregis* (Latin), *Acerbo nimis* (Latin), *E supremi* (Latin), *Il fermo proposito* (Italian), *Tra le sollecitudini* (Italian), and *Divino afflatu* (Latin). Within the authoritative twelve-document discovery register, these six contain **111** immutable original P6 node IDs. **51** of those already had original-language evidence; **60** outstanding node IDs have now been reviewed and assigned a source-bound claim or explicit hold. This is the correct denominator: the earlier estimate of 75 outstanding nodes referred to **all twelve documents**, including the fifteen still held in the six previously screened documents.

Result: **24** new narrowly source-grounded research candidates, **36** holds, including **18** inherited original P6 `partial` source-owner holds. The research file preserves **23** additional brief original Latin/Italian source fragments, official Vatican URL/line provenance, passage claim, and speaker attribution. The new candidate mappings reuse earlier excerpt IDs wherever they already exist rather than inventing duplicate texts. Three overly generous interpretations were deliberately moved to the hold queue during review: religious education as sufficient for virtue, an encyclical's restoration programme as determining dogmatic development, and a corrector's personal pride. The available text could not settle those exact questions directly.

Special attribution holds:

- *Pascendi* describes positions attributed to Modernists; the excerpted claims that religions are all true, or that belief should be insulated from historical miracle inquiry, **are not teachings endorsed by Pius X**. The Vatican I canon quoted within *Pascendi* is marked as a *conciliar statement cited by Pius X*.
- *Divino afflatu* includes a statement about varied psalmody renewing attention **quoted from St Basil**, not an independent autobiographical statement by Pius X. Its Sunday and Lenten weekday provisions are historical reform evidence, not in themselves a certified reconciliation with the 1962 missal or today's law.
- *Tra le sollecitudini* associates music with the sacred liturgical text, participation and devotion. It does not permit a theatrical performance merely because listeners enjoy it.
- *Il fermo proposito* expressly recognizes spiritual and corporal mercy and individuals' roles in charitable action, independently of the formation of large associations.

The original **twelve Vatican documents now have exhaustive research dispositions on all 195 original P6 node IDs**: **144** narrowly source-mapped research candidates and **51** explicitly unadmitted/held cases (15 in wave3, 36 in wave4). The same **144** source-mapped nodes span **47 subjects** in the overall immutable **106-subject / 423-node** authored visual-novel corpus. **279** corpus nodes remain without this specific original-text source mapping. The private research now holds **165 brief original-language evidence records** (23 first four annexes + 41 opening contexts + three sacred-music additions + 35 wave2 + 40 wave3 + 23 wave4). These are *excerpt records*, not an estimate of unique original documents or complete philological certifications.

The existing `tools/pius-x-source-only-gate.mjs` rejects every wave4 hold, preserves all P6 `partial` flags, and exposes only exact original-language excerpts and limited evidence glosses for the 24 accepted research nodes. It never treats the complete original authored English/French P6 reply as papal evidence. Dedicated regression checks validate all 60 record-to-node IDs in English and French, 24 admissions, 36 holds and the 47/144/165/279 aggregation.

**Release approvals remain zero**: no full answer approved, no original-language-to-EN/FR translation certified, no unauthorized modern individual ruling and no model provider quality test. The live provider remains unconfigured and is a distinct dependency. To scale next, triage the **228 nodes outside** this original twelve-document sample by the existing project priorities (catechetical and pastoral usefulness and source accessibility), not by bulk redoing this entire verified discovery population.


## P2.17 — Wave 5: 228-node original-owner bulk source routing (24 October 2026)

All **228 nodes outside the previously completed twelve-document evidence batch** have now been enumerated in one non-generative, source-owner-preserving classification pass. Inputs are the original P1 stages (37 + 25 + 20 chapters), their 36 dependent follow-ups, the 12 P3 chapters and the 12 P4 chapters, reconciled by immutable IDs against the twelve-document discovery register's 195 nodes. This exhausts inventory triage, **not original-language excerpt verification**: the source-only research gate still admits just **144/423**, with 165 excerpt records; the original 12-document batch has 51 holds. The new 228 classification rows create **0 new original-source excerpts, 0 new model admissions, 0 complete-answer approvals, 0 EN/FR translation approvals and 0 publication approvals**.

    previews/pius-x-study/evidence/pius-x-outside12-wave5-bulk-inventory-228-20261024.v1.json

The 228 previously out-of-scope dialogue nodes break down as follows, on only twelve existing source URLs (53 source-owner subjects):

| Source ownership family | Nodes | Subjects | Next action |
|---|---:|---:|---|
| Salzano manuscript/transcription (Giuseppe Sarto's pre-papal catechetical notebooks) | 120 | 24 | Primary Italian manuscript-text/modern-editor commentary separation, numbered-locus claim verification |
| 1905 *Catechismo Maggiore* | 59 | 14 | Historical edition and individual propositions; **not assumed personally composed by Pius X** |
| Secondary biography | 27 | 9 | Historical fact check and third-person narrator; never invented first-person papal memories |
| Five further Vatican primary papal documents | 18 | 5 | Original Latin/Italian Vatican paragraph extraction, speaker attribution and historical scope |
| *Quam singulari* Congregational decree | 4 | 1 | Congregational document distinguished from Pius X's approval |

The primary Italian Museo San Pio X Salzano presentation notes that the surviving notebooks contain Sarto's handwritten revisions, but the web presentation also includes later editorial analysis; treating the *whole page* as papal speech would be a serious error. Its 1905 *Catechismo Maggiore* preliminaries reproduce Pius X's explicit explanation that he adopted a previously episcopally approved Italian catechism with minor revisions. Thus papal prescription is not direct authorship of every question/answer. The *Quam singulari* document is a Sacred Congregation decree approved and ordered published by Pius X, not a personally authored encyclical.

**Nonredundant execution order:** (1) original-source passages in the five Vatican works; (2) the Salzano manuscript with original-vs-editorial provenance and claim-level admission; (3) catechism edition verification with an attributed catechetical narrator distinct from purported papal quotations; (4) selective biography; (5) Congregational-decree attribution. Batch against the existing sidecar, not a replica catalogue. Source-unsupported personal memories, anachronistic legal rulings and post-1905 doctrine extrapolation remain on explicit hold. Do not conflate complete node routing with completed evidence, approval, model quality, or publication.

The dedicated regression `tests/pius-x-wave5-bulk-inventory.mjs` checks that the 228 IDs plus the original 195 comprise exactly the 423 immutable P6 nodes, preserves each bilingual question and source locus, verifies all five family totals and asserts **no new node crosses the source-only model gate**. It is wired into the existing `pius-x-study-standalone-review.yml` CI; a passing run on the new commit must still be confirmed. PR #1570 remains draft and must not be merged or released on the basis of this inventory.


## P2.18 — Wave 6: five further Vatican sources, all 18 remaining papal-document nodes (24 October 2026)

This phase follows—not repeats—the Wave 5 bulk classification: all **18** remaining papal-document node IDs outside the earlier 12 Vatican groups were examined against five additional Vatican texts. All 18 existing bilingual question IDs remain fixed. The result is **14 narrow source-edition research claim candidates and 4 explicit holds**, supported by **25 short witness excerpts** and separate speaker records. These 14 records are **not yet admitted** to the private model gate: it remains at 144/423 research-bounded nodes, 165 earlier original-language excerpt records, and zero certified whole answers, translations or releases.

    previews/pius-x-study/evidence/pius-x-wave6-five-vatican-documents-evidence-18-20261024.v1.json

Five-source details: *Sacrorum antistitum* 2 candidate/1 held; *Vehementer nos* 2/1; *Iucunda sane* 3/1; *Communium rerum* 4/0; *Lacrimabili statu* 3/1. The first three have an official Vatican **Latin** edition. The last two currently provide Vatican **Italian and English** pages, not an available official Latin page; the Italian text has therefore been labelled an **attested Vatican language edition**, not automatically authenticated as the original composition language. This distinction matters for subsequent source editing and historical voice.

The explicit holds are: (1) whether the 1910 anti-Modernist oath remains legally obligatory in exactly that form today; (2) whether the 1905–06 France–Church dispute determines any user's contemporary national law; (3) whether recommending St Gregory's virtues entails copying his specific political actions; and (4) whether condemnation of abuses in *Lacrimabili statu* adjudicates every individual missionary accusation. The first two require later law; the others would involve historically unsupported universalisation.

Notable original-source attribution: *Lacrimabili statu* invokes **Benedict XIV** in quoted testimony about people professing Christianity who perpetrated eighteenth-century abuses; do not turn this into an unsourced claim about every perpetrator in 1912. Pius X's own 1912 report states that testimony received from bishops, papal delegates, missionaries, and other trustworthy people overcame his initial doubt. *Communium rerum* quotes or reports **St Anselm**, so the invitation to seek understanding and his openness to correction are separately speaker-tagged rather than new sentences directly composed by Pius X.

The regression test `tests/pius-x-wave6-five-vatican-documents.mjs` cross-checks all 18 exact bilingual owner IDs and loci against the generated P6 corpus, validates the 25 passage identifiers and speaker/edition tags, enforces the 14/4 split and asserts no admission to the research-only generative gate, no certified translations and no publication. It is included in the existing `.github/workflows/pius-x-study-standalone-review.yml`; this commit's CI outcome requires confirmation. These are carefully checked **short Vatican website excerpts**, not independent complete-text source certifications.

The remaining primary-text research load outside the twelve-document sample is **210 nodes**: 120 Salzano, 59 *Catechismo Maggiore*, 27 biography and four *Quam singulari* nodes. Favor large, author/provenance-safe catechetical extraction batches, preserving separate authorship categories. Do not create a replacement papal corpus, pretend the original P6 answers are historic quotations, merge PR #1570, or broaden the live model source gate absent separate QA.


## P2.19 — Wave 7: all 120 Salzano manuscript-linked dialogue nodes triaged (24 October 2026)

The canonical 423-node P6 corpus and Wave 5 source-routing inventory identify **120 existing dialogue nodes in 24 source-owner subjects** whose purported historical source is Giuseppe Sarto's pre-papal Salzano catechism. This Wave 7 batch examined all **24 numbered-Q&A regions** of the Museo San Pio X's Italian web transcription and recorded a decision for all **120** nodes rather than screening five or ten subjects at a time.

    previews/pius-x-study/evidence/pius-x-salzano-wave7-transcription-research-120-20261024.v1.json

The dispositions are **87 narrow topic/context candidates requiring question-level source-fidelity review**, plus **33 explicit holds**. This is manuscript *transcription-context* coverage, **not yet direct source-certified manuscript collation**: no new literal original text snippets were claimed as independent autograph evidence, no model gate ID was added, no complete answer or translation approved, and no speaker's invented reminiscences permitted. The unchanged source-only gate remains **144/423** (34.0%) with the prior **165** excerpt records; if future node admission is justified, it will require separate excerpt/speaker QA.

The museum explains that the material survives in **two manuscript notebooks**, with **252 revisions in Sarto's own hand**; the site's sequential question numbers were **added by the modern transcriber** in place of manuscript D./R. notation. The modern webpage also intersperses later editorial analysis, headings and commentary with the transcribed manuscript dialogue. Therefore every source locus is identified by **editorial question-number span** and **current museum webpage line range**, while `manuscriptFolioImageIndependentlyCollated=false` and `originalWordsReproduced=false` remain explicit in each record. There is an apparent transcription-number error in the Confirmation section: the question between 445 and 447 is printed as 406. This is logged as a provenance/numbering exception, not silently corrected into an autograph reading.

Particularly high-value, directly displayed manuscript *topics* include prayer and confession (Q509–577), charity alongside exterior observance (Q300–301 and Q369–371), spiritual versus sacramental Communion (Q476–481), Viaticum (Q493–497), Purgatory and the communion of saints (Q272–279), the Incarnation (Q86–94), one divine essence and three persons (Q71–79), and recovery of property wrongly taken (Q353–357). These may help reproduce Giuseppe Sarto's pastoral priority and dialectical teaching **after editorial text is separated from original manuscript text**.

Holds cover purported personalized judgment of the state of a soul or confession's validity, modern work schedule and sacramental-discipline rulings, speculative inferences from short Q&A, and extrapolations not established by the numbered source. Where modern medical/legal/sacramental advice is needed, a third-person editorial notice or real priest is appropriate; no synthetic pope should decide an individual's case.

The new regression `tests/pius-x-salzano-wave7-transcription-research.mjs` audits every exact node and EN/FR question, canonical source locator, editor-numbered passage, explicit author/origin limitation, the **87/33 split**, and zero newly model-admitted or published content. It is wired into the existing `.github/workflows/pius-x-study-standalone-review.yml` workflow; the current commit's CI run must be confirmed separately.

**Cross-wave accounting:** 228 nodes were originally outside the twelve-document batch. Wave 6 researched 18 Vatican-document nodes, Wave 7 screened the 120 Salzano nodes; **90 outside-batch nodes still require this type of source review** (59 *Catechismo Maggiore*, 27 secondary biographies, four *Quam singulari* Congregational decree), in addition to the original 51 twelve-document holds. The 14 Wave 6 claims and 87 Salzano candidates have deliberately **not** been treated as 101 authenticated replies. The next practical high-volume pass should be the **59 *Catechismo Maggiore* nodes**, with historical edition-level authorship rather than fabricated direct personal papal wording.


## P2.20 — Wave 8: all 59 Catechismo Maggiore 1905 nodes with Italian source excerpts (24 October 2026)

The Wave 5 bulk inventory identified **59** source-owner nodes across **14 subjects** dependent on the Italian 1905 *Compendio della dottrina cristiana* (commonly *Catechismo Maggiore*). All **59** are now triaged in a single source-checked batch against the Museo San Pio X's three numbered chapters: Creed (16 nodes), sacraments (35), and virtues/Christian duties (8). The batch records **44 exact short Italian printed-edition fragments**, with exact question numbers and current museum webpage-line locators. All 59 immutable existing English/French questions and source-owner file identities are preserved.

    previews/pius-x-study/evidence/pius-x-catechismo-maggiore-wave8-59-20261024.v1.json

Outcome: **47 short-excerpt-bounded research candidates, 12 explicit holds**, zero full-answer/translation certifications, zero new model admissions and zero publishing approvals. Holds concern personalized verdicts on salvation or Communion dispositions, declaring marriages invalid, mistaken reliance on the historical 1905 fasting discipline as present law, treating doctrinal infallibility as proof that a generated quotation is authentic, and a source-locator precision exception (Q23 affirming rational knowledge of God does not itself state a full creation-based proof). Not all historical questions are unsupported; each supported question is attached to the specific numbered catechism excerpt that directly bears on it.

**Critical authorship discipline:** the letter of Pius X to Cardinal Pietro Respighi on 14 June 1905 (official Vatican Italian: https://www.vatican.va/content/pius-x/it/letters/documents/hf_p-x_let_19050614_compendio-catechismo.html) states that he selected and prescribed a text already approved by the bishops of several Italian regions, with *lievi ritocchi* (small revisions). The source can provide substantial **doctrine of the period and Pius X's catechetical priorities**, but no individual sentence may be automatically claimed as a personally composed address or autobiographical utterance of Giuseppe Sarto. The record's speaker field distinguishes the **1905 approved catechism** from **Pius X's verifiable own papal letters, addresses and encyclicals**; the latter are higher-value witnesses for personal literary style.

**Specific editorial exceptions:** (1) The Mass's sacrificial identity and Eucharistic transubstantiation are directly discussed in Q654–656 and Q605–609; the historical wording can be quoted as 1905 catechism, not original personal papal speech. (2) Sanctifying and actual grace (Q527–533), sacraments and dispositions (Q518–519, Q538) are attested without asserting grace removes free will. (3) The catechism explicitly discusses circumstances of salvation outside visibly Catholic communion (Q169 and Q171), yet it cannot judge individual persons or relatives. (4) Preparation for Communion (Q627–639) combines permanent devotional instruction with a historical Eucharistic fast; **do not import the fast's old deadlines as contemporary law**. (5) The bounded witnesses Q518 and Q627 deliberately include the immediately preceding printed catechism question relative to two narrower chapter source loci (SPX-058, SPX-EXP-041); this is transparent source-locus extension for owner review, not silent original-owner redefinition. (6) Separate interpretive review remains necessary for the edition's older polemical examples or historically contingent rules.

**Regression contract:** `tests/pius-x-catechismo-maggiore-wave8-all59.mjs` checks exact node/question/source provenance, all 44 witness ID ownerships, 47/12 dispositions, preserved printed-text author labels, denial of modern individual verdicts, all original 423 nodes and the unchanged 144-node research model gate. The existing `.github/workflows/pius-x-study-standalone-review.yml` now executes this test. Its real CI status must still be verified independently before describing it as passed.

**Forward workload:** The originally outstanding outside-twelve-document total was 228. Wave 6 handled 18 additional Vatican-source nodes, Wave 7 handled 120 Salzano-manuscript nodes, and Wave 8 handled 59 *Catechismo Maggiore* nodes. **31 nodes remain without a source-specific triage**: 27 biographical accounts and four nodes drawn from the Congregational *Quam singulari* decree. Source triage across these 228 nodes is not the same as claim-level authentication of all nodes. The original twelve-document population's 51 holds remain separate and in force; no publication release follows automatically from complete inventory coverage.


## P2.21 — Wave 9: final 31 biography and Quam singulari nodes; complete 423-node source triage (24 October 2026)

The original P6 corpus contains exactly 423 nodes. The twelve original Vatican-document groups comprise 195 nodes, fully triaged with **144 bounded original-language source-only gate candidates and 51 explicit holds**. The remaining 228 nodes were inventoried in Wave 5, and then screened by real source family in Waves 6–9: 18 five-document Vatican nodes, 120 pre-papal Salzano manuscript-linked nodes, 59 *Catechismo Maggiore* 1905 nodes, and now **27 secondary biographical nodes plus four Congregational *Quam singulari* nodes**. Consequently, **423/423 nodes have an explicit source-triage disposition**, while **144/423 remain research-bounded in the generative source-only gate**, not fully authenticated.

    previews/pius-x-study/evidence/pius-x-wave9-biography-quam-singulari-31-20261024.v1.json

This final 31-node pass examined two historically grounded modern biographies, Museo San Pio X's genealogical study of the Sarto family (https://www.museosanpiox.it/vita-di-san-pio-x/i-sarto-dal-quattrocento-allottocento/) and the Fondazione Giuseppe Sarto's concise biography (https://www.papapiox.it/biografia/), alongside the 8 August 1910 historical Congregational decree (https://www.catholicculture.org/culture/library/view.cfm?recnum=5170). It records **24 source-line-bounded claims** across these sources and **24 bounded narrative/decree candidates**, with **seven holds**: six unsupported family/private-conversation or reconstructed-thought questions, plus one child-specific modern Communion-admission decision. More precisely, biography **21 candidates/6 holds** and decree **3 candidates/1 hold**. No original personal speech was created, no archive facsimiles were independently collated, no complete answer or translated version was certified, and no inference gate or publication status changed.

### Editorial conflicts requiring preservation

1. **Sarto family size:** Detailed Museo San Pio X genealogy says Giovanni Battista Sarto and Margherita Sanson had **11 children**, listing their firstborn Giuseppe (born 31 January 1834, died 6 February 1834), then Giuseppe Melchiorre, future Pius X, born June 1835. Fondazione's shorter biography says **10**. Do not silently flatten the count into one uncontested figure. If a number is required, reference the detailed genealogy and note the shorter summary disagrees. Avoid incorrectly calling the future pope the family's firstborn.
2. **Relative poverty:** the detailed genealogical source differentiates the property of grandfather Giuseppe Sarto and the smaller property inherited by Giovanni Battista's household. It describes the future pope's family as modest, but **not among the poorest in Riese**. A devotional retelling should not simplify this into extreme destitution or deny the family's later financial difficulties.
3. **Parental vocation support:** the detailed biography reports the father was initially displeased about continuation to the priesthood, while the foundation biography narrates Margherita declining an offer for her son to take the deceased father's municipal position after 1852. These are *secondary retrospective biographical claims*, not a verified transcript of the parents speaking, and cannot be turned into original St Pius X first-person memory or words.
4. **Sacred music early in life:** the detailed Museo Sarto account explicitly records seminary-era Holy Week composition and direction of music at Padua, years before his papacy. This gives a historical basis for a brief biography answer without inventing later papal reflections.
5. **Venice entry:** appointed patriarch in 1893, but formal entry delayed until November 1894 owing to the Italian governmental *placet* dispute. Distinguish nomination from assumption of the see.
6. **Quam singulari issuer:** the source explicitly says the **Sacred Congregation of the Discipline of the Sacraments** prescribed the rules and that Pius X formally approved and ordered publication. The current hosting page's modern author metadata must not supersede the actual 1910 institutional issuer. Norm 1 specifies use of reason around the age of seven, more or less; norms 2–3 reject mastery of the full catechism as a prerequisite; norm 4 involves the child's parent/guardian and confessor. None of these automatically makes an AI qualified to determine the eligibility of a particular child under current Church discipline.

**Research counts across all 423 nodes, NOT publication counts:**

| Source population | Triaged | Narrow/source-context candidate | Held |
|---|---:|---:|---:|
| First twelve Vatican document groups | 195 | 144 | 51 |
| Wave 6: five more Vatican documents | 18 | 14 | 4 |
| Wave 7: Salzano pre-papal catechism | 120 | 87 | 33 |
| Wave 8: 1905 Catechismo Maggiore | 59 | 47 | 12 |
| Wave 9: biographies + Quam singulari | 31 | 24 | 7 |
| **Total** | **423** | **316** | **107** |

The **316** is a heterogeneous *research-candidate inventory*, combining bounded Vatican primary-text snippets, later-transcribed manuscript topic matches, non-personally-authored printed 1905 catechism fragments, third-person biographies and a papally approved Congregational decree. It must **not** be displayed as 316 authenticated quotations, 316 certified complete dialogues, 316 generative model admissions or 316 approved products. Official source-only model gate remains **144**; all full-answer, EN/FR translation, personal-author speech and publication approvals remain **0**. Holds are not failed content automatically deserving promotion.

`tests/pius-x-wave9-biography-quam-singulari-all31.mjs` reconciles the **exact 228 immutable outside-twelve node IDs** across Waves 6–9 against Wave 5, checks both language questions and original source owner, the source-anchor link integrity, non-papal narrator ownership, historical Congregational attribution, sibling-number and family-poverty conflicts, the seven holds, plus that the existing original 144-node research-only gate is unchanged. It is now included in `.github/workflows/pius-x-study-standalone-review.yml`; CI status must still be confirmed on the latest commit.

**Next gate is NOT another screening batch.** Switch to selective claim-level verification of the highest-use source candidates, clean speaker and documentary provenance, review translation fidelity of key responses (English/French), and evaluate actual private model conversations for each persona type (direct original Pius X text, pre-papal manuscript, papally approved catechism, historical narrator, Congregational document). Prioritize catechesis, sacraments, moral and spiritual guidance; do not obsessively acquire every possible letter or minor historical anecdote. For potentially publishable exchanges, require source-matched claim evidence, historically correct speaker/source status, answer-level content review, and adversarial tests against invented first-person autobiography, modern verdicts and copyrighted text copying. Keep the established visual-novel sprite and offline app as the renderer; preserve original source owners; do not merge PR #1570 without approval.


## P2.22 — Bilingual content-and-conversation acceptance pilot, not another evidence catalogue (24 October 2026)

After the 423/423-node research classification, actual product-readiness requires more than another wave of source pointers. This acceptance pilot chooses **11 already source-gated canonical nodes** in four genuinely papal-authored Vatican documents, rather than folding in the *Catechismo Maggiore*, Salzano historical transcription, secondary biographies or a Congregational decree as if personally authored by the Pope. The four sources are the Latin *E supremi* (three dialogue turns), Latin *Haerent animo* (three), Italian *Il fermo proposito* (three), and Latin *Tribus circiter* (two). All textual witnesses were cross-referenced to the original existing source-witness annexes; **two initial witness-selector/order mistakes were found and corrected before acceptance testing**.

    previews/pius-x-study/evidence/pius-x-p22-bilingual-claim-acceptance-pilot-20261024.v1.json

There are now **22 edited bilingual response specimens** (11 English, 11 French), each attached to its immutable original node/question, exact existing source-only witness IDs, tightly bounded claim descriptions and expressly disallowed extrapolations. These are content-review drafts only: no literal papal quotations, no certified English/French translations, no claim that another style pipeline is superseded, and **no changes to the actual original P6 answers, visual-novel sprites or canonical source registry**. Full-answer human approvals remain zero. The two deliberately withheld canonical nodes are the unproved universal association-membership claim in *Il fermo proposito* and a question about applying 1906 disciplinary penalties to a modern person in *Tribus circiter*.

These specimen turns seek conversational usefulness without generic mini-essays: each directly answers the latest question. For instance, *Haerent animo* distinguishes priestly duties from lay application, while *Il fermo proposito* distinguishes spiritual and corporal mercy without assuming every contemporary work is enumerated by one Latin/Italian snippet. For *E supremi*, the relation of bringing souls to Christ and through Him to God is expressly linked to original section 8, not falsely limited to sections 1–4. *Tribus circiter* retains the specific 1906 Mariavite disciplinary setting, episcopal direction and repentance conditions; modern facultative/reconciliation decisions are held.

**Actual private-bench improvement:** `tools/pius-x-generative-review.mjs` now rejects obvious modern sacramental/canonical-status demands (English and French), even where a visitor supplies an otherwise model-eligible historical source node. This preflight abstention occurs **before** model invocation; it supplements, not replaces, the original gate's existing witnessed-ID and documentary classification rules. It deliberately does not reject general questions on how the same historical spiritual counsel may remain useful today where no personalized legal status is requested.

**Bilingual repeatable acceptance regression:** `tests/pius-x-p22-bilingual-claim-acceptance.mjs` uses the immutable 106/423 P6 source-owner corpus, checks all 11 selected EN/FR questions, original excerpt IDs, and source-class limits; then plays back all 22 edited specimens through the real source-only composer/verifier API using a **mock provider**; confirms source references and publication flags; checks two source-owner holds in both languages; executes two separate three-turn English/French source-chapter conversation sequences (12 total mock turns), checking continuity/repetition signals; and tests **six additional adversarial current-law/canonical prompts** without permitting any model call. It also checks that ordinary general spiritual questions are not accidentally withheld. The new test was added to the existing standalone-study CI workflow.

**What passing these tests proves:** exact original-node ownership, source-ID consistency, safe mock orchestration, some structural continuity metrics, deterministic held-question barriers. **What it does not prove:** source-to-claim completeness, doctrinal accuracy of all P6 answer sentences, a real live inference provider, subjective naturalness, exact period voice or faithful literary EN/FR translation. Real-model live testing remains explicitly opt-in and unconfigured; no provider cost or consent is implied here. The manual style/voice thread should review the specimens separately; do not duplicate that effort.

**Next actionable acceptance gate:** choose 5–10 highest-use source cases from this pilot, independently review every assertion and source's broader context, then obtain human EN/FR check for publication-quality passages, while collecting ~20 adversarial/multiturn test prompts per subject. Only after that can a conversational topic move from research-bounded to actually approved; the 144-node private research gate and the 423-node visual-novel library must not be represented as published authentic transcripts.


**P2.22 follow-up — exact excerpt attribution contract.** The private `composeDraft` now accepts optional `witnessIds` alongside existing `evidenceIds`. The latter continue to identify canonical source-owned dialogue nodes; the former must enumerate exact original Latin/Italian witness fragments nested under those nodes. The composer checks that every proposed excerpt ID belongs to the selected node's allowed primary witnesses, and the independent verifier must explicitly echo each cited fragment. The response returns `claimWitnesses` (ID, source URL, locus, original language, historical speaker) plus `claimWitnessStatus`; the preexisting node-level citation remains for backward compatibility. Invalid/fabricated IDs are held before the verifier. A verifier that fails to affirm cited fragments forces abstention. Legacy models that omit `witnessIds` may still produce a private draft but are explicitly marked `LEGACY_CANONICAL_NODE_REFERENCE_ONLY`. This is improved provenance granularity, **not a substantive claim or translation certification**. The P2.22 regression exercises successful exact-witness playback, forged-reference rejection, verifier failure, legacy fallback, and EN/FR current-law preflight blocks; all remain private and non-publishable.


## P2.23 — Claim-level EN/FR source fidelity and strict CI gate ordering (24 October 2026)

The follow-on work now reads the actual full neighboring Latin and Italian texts on the **official Vatican website**, not merely the witness ID register: original *E supremi* lines 46–56 and 65–69; *Haerent animo* lines 31–36, 87–90 and 96–97; *Il fermo proposito* Italian lines 39–55; and *Tribus circiter* lines 44–49 and 65–67. These are time-of-review web page locators, not guaranteed permanent pagination. Particular attention was paid to the **St Anselm quotation** embedded in *E supremi*, **St Bernard** embedded in *Haerent animo*, the clergy-specific audience, the §8 Christ-to-God source extension, and the specific 1906 Mariavite dispute.

Five of the original **11 paired English/French private editorial specimens** were refined in place (the existing research-only acceptance specimen, *not* the authoritative source-owner P6 answers): *E supremi* first follow-up removes an inference about troubled contemporary times unsupported by its exact permitted witness set, *E supremi* second follow-up aligns “humanity/hommes” with Latin *genus hominum* in §8, *Haerent animo* first follow-up removes a separate colloquy-with-God phrase not included in that node's available witness set, *Haerent animo* second follow-up makes its clergy-only audience more precise, and *Il fermo proposito* third selected dialogue substitutes the exact source triad for the editorial “instruction, example and practical assistance” extrapolation. Every correction was made in both EN and FR.

    previews/pius-x-study/evidence/pius-x-p22-bilingual-claim-acceptance-pilot-20261024.v1.json
    previews/pius-x-study/evidence/pius-x-p23-bilingual-claim-fidelity-audit-20261024.v1.json

The new P2.23 register gives **23 individual source-to-sentence claim mappings**, across the same **11 canonical P6 node IDs / 22 EN–FR edited answers**. These 23 units cite **18 distinct original Latin/Italian witness fragments**, linked to exact selected original witness IDs and the full neighboring official Vatican text. Every French sentence is paired with its English editorial sentence, and every pair is marked as **provisionally semantically equivalent**, not yet endorsed by an independent human translator. The register includes precise contextual warnings for negative scope statements (e.g. a priestly instruction is not automatically a universal lay law), embedded citations and no modern disciplinary determination. This is an *AI editorial content and language comparison*, **not** external/human editorial approval or confirmed faithful reproduction of Pius X's personal spoken voice. All **23** claim units need human qualification; English certifications 0, French certifications 0, release approvals 0.

`tests/pius-x-p23-bilingual-fidelity-review.mjs` checks that every EN and FR audited sentence exactly matches the *revised* acceptance texts, belongs to a canonical node and exact original-language witness subset in the already-admitted 144-node gate, retains correct speaker/case attribution, covers all 23 units without duplication, and preserves zero independent language/voice/publication approvals. It also regression-checks five revised texts, preserves the 423-node P6 source owner and checks clergy-heading and *E supremi* §8 source-context dependencies. The test is wired into the existing `.github/workflows/pius-x-study-standalone-review.yml`.

**CI defect found and corrected.** Review of GitHub Actions run `40025951884`, failed job `120662081311`, located a failure at the pre-existing `tests/pius-x-source-only-gate.mjs` in its first chapter-held assertion (line 259). The new modern-law preflight had returned `present_day_canonical_case_requires_current_authority` before the established documentary `followup_not_mapped_to_primary_source_claim` classification. The existing gate should retain authority over **unmapped historical nodes**. `selectEvidence` was changed so the modern-law question guard executes **after** the existing source-only node/witness hold but **before** any model call. This preserves precise legacy refusal semantics and **continues to reject** modern canonical verdicts even for originally eligible historical nodes. This fix addresses the observed failure; no claim of new green CI should be made before the current PR run actually completes.

**Release position unchanged:** research triage 423/423, 316 heterogeneous research candidates, 107 explicit holds, 144 narrow research-gated papal-document nodes; **0 historically authenticated completed conversations, 0 EN/FR translations signed off, 0 approved character-voice replies, 0 public releases**. Do not mistake the latest editorial content specimens, CI playback or papal-style evaluation for a trained and launched general conversational model. The parallel style research remains independent.


## P2.24 — Unexpected visitor regression, broader EN/FR safety and CI repair (24 October 2026)

**CI issue resolved at cause, not by disabling the test.** The CI attempt for P2.23 (`40029584436`) passed its source-only gate and P2.22 bilingual source specimens, but `tests/pius-x-p23-bilingual-fidelity-review.mjs` failed on `w.originalText.length`. Its new audit sidecar had retained the 18 original witness *IDs* and page locators without the literal primary snippets expected by the test. P2.24 restored all **18 precise Latin/Italian fragments from the existing source-witness annexes** (including the pilot `latin` representation), not from any unverified model answer or reconstructed quotation. The error was a technical incomplete sidecar field, not evidence that a particular Pius X claim was false. Do not call CI green until the newly triggered workflow confirms success.

**80 new, previously unprepared visitor prompts:** Added `previews/pius-x-study/evidence/pius-x-p24-unexpected-visitor-bank-80-20261024.v1.json` and `tests/pius-x-p24-unexpected-visitors.mjs`. Four authentically papal historical source chapters were each given ten English and ten French test prompts: **6 expected hard holds per language** and **4 source-eligible paraphrasing questions per language**; combined **48 pre-inference hard holds** and **32 legitimate source-routed prompts requiring further claim-level review**. Holds cover ignoring documented sources, made-up papal quotations, claimed secret/unrecorded private conversations and thoughts, simulated absolution, determinations of an individual's current excommunication or sacramental validity, and similarly unsupported canonical judgments. The accepted source-routed prompts are *not* treated as claims the original evidence can wholly answer or as verified natural model responses; the mock provider deliberately abstains.

**Narrow additional guards:** The existing `selectEvidence` in `tools/pius-x-generative-review.mjs` now recognizes straightforward requests for explicit *unrecorded secret testimony* and *person-specific sacramental/canonical verdicts* beyond a handful of earlier fixed phrases. They execute **after** source-only eligibility and **before** contacting any inference endpoint, preserving the documentary gate's own reasons for truly unmapped nodes. They are not a comprehensive semantic inference engine; questions phrased outside the finite regex families require source-constrained verification and conservative abstention, not unsupported fabricated answers.

**Visitor-history safety checks:** P2.24 also supplies mixed foreign-chapter and foreign-language conversation history containing malicious directions. The existing gate must discard foreign context; only same-chapter, same-language history is passed through explicitly labeled `contextOnly` and may **never** become primary evidence. The new regression checks this separation. The source-only research gate remains **144** nodes, the P6 library **423** nodes, and all new specimen authorizations, certified translations, actual live provider calls and public release approvals remain **zero**.

**Acceptance interpretation:** Passing a mock routing test is useful, but it cannot certify natural interactions or rigorous doctrines. In particular, the 32 source-eligible questions deliberately remain unapproved until their source relevance and a candidate answer's individual claims have been checked against original Latin/Italian passages. The parallel historical voice pipeline is not replaced, and a qualified translator/theologian still has not signed the EN/FR passages. PR #1570 stays draft, unmerged.


## P2.25 — Four-document free-question routing and source-level visual-novel citations (24 October 2026)

**Practical private-chat improvement, not more evidence inventory:** Until now, the source-limited private visual-novel trial always used the original card presently selected in the GUI. A user asking about the *E supremi* Christ-restoration mission while viewing its election-introduction card could therefore be sent the wrong (non-§8) witness set. The composer would then either abstain or risk a false connection between a legitimate question and irrelevant evidence. P2.25 now adds `tools/pius-x-pilot-question-router.mjs`, a **finite, manually curated, bilingual chapter-local source-intent router** for just four selected original Pius X documents: *E supremi*, *Haerent animo*, *Il fermo proposito*, and *Tribus circiter*.

Each matched question resolves to an immutable existing node ID, and that ID passes through the **unchanged original 144-node source-only evidence gate** before the private composer may run. An exact EN/FR canonical dialogue question is still matched to its original node, not guessed through loose keyword matching. The explicitly recognized free-form intentions select the nearest narrow historical evidence set (election/weakness/strength/restoration; priestly meditation/clergy audience/ministry excuse; mercy/revealed truth/virtues; Mariavite repentance, paternal correction or episcopal suitability). There is **no cross-chapter retrieval, no automatic promotion**, no new model-backed factual evidence, and no change to the 423-node original dialogue or the other, nonpilot subjects.

The review screen `previews/pius-x-study/spx-model-review-client.js` sends `autoRoute:true` only for these four source chapters. With an explicit supported intent, the server selects the correct canonical node and its original Latin/Italian witness IDs, even if the visitor was looking at a different card in the same chapter. If no curated topic can be established, the model is **not invoked**, returning `no_curated_source_match_for_free_question` instead of offering a plausible answer based on unrelated excerpts. The private `composeDraft` returns `selectedSourceNodeId` and `sourceRoute` for testing and traceability. This behavior is purposely limited to the pilot rather than pretending to be general semantic source retrieval.

**More useful citations in the visual-novel preview:** The same private review client now prefers the server-validated `claimWitnesses` references when present, with actual source ID, original Latin/Italian language, historical speaker and document locus. Older model responses with only canonical-node evidence continue to display the explicitly weaker source-node pointers. Both stay labelled **NOT COLLATED**, and no unapproved quote is rendered as authenticated Pius X dialogue. The companion Playwright E2E test now verifies witness-level citations on desktop and the node-only fallback on phone, while checking that switching languages clears cross-language history.

**Regression coverage:** `tests/pius-x-p25-intent-to-original-witness-routing.mjs` checks all **32 unprepared EN/FR source-eligible P2.24 test prompts** against the 11 already existing pilot nodes and precise original source fragment sets. It exercises a mock compose+verify chain for all 32, checks source resolution and per-fragment provenance, all existing canonical EN/FR question exact matches, **eight totally unrelated typed queries** which must be held without a model call, and source gate/card count and publication hold invariants. The mock's standardized response is *not* endorsed historical writing. This test is included in the existing St Pius X standalone CI; no paid inference, no new independent provider account and no merging of PR #1570.

**CI checkpoint:** GitHub run `40030275281` from P2.24 failed at the *prior* P2.23 claim-fidelity script because the pair “Yes.”/“Oui.” (an independently supported short affirmation in the charity dialogue) triggered a blanket five-character minimum. The P2.23 test was corrected with a highly specific exception preserving source support while leaving all other length checks intact. P2.25 changes must not be called CI-green until the associated head run actually completes. The main-gate and full standalone test outcomes remain separately reported.

**Next genuine acceptance step:** test source retrieval and conversational responsiveness on truly unprepared multi-turn bilingual interactions using an actual explicitly authorized zero-cost local provider or other private model, with qualified review of factual accuracy and historical voice. A real provider is still not configured and no second-model tests or translation sign-offs can be claimed. The historical corpus remains 423/423 triaged, and none of the 144 narrow research source-gate candidates becomes publication-certified as a result of these changes.


## P2.26 — Zero-cost, genuinely offline visual-novel source-dialogue demonstration (24 October 2026)

The existing model-assisted research panel requires a connected private model endpoint and remains opt-in. For **actual no-cost, offline usability evaluation without an inference subscription**, a separate P2.26 demonstration now compiles into **one standalone HTML file**, reusing the continuing **423-node P6 visual-novel host and its five approved fixed St Pius X sprites**. This adds a separate **private, plainly labelled editorial source-dialogue panel** and does not modify or overwrite the original P6 data, questions, P6 voice revisions, source-only research gate, or full app routes.

**Included content:** Only the existing P2.22/P2.23 source-aligned 11 original question nodes across four authentic papal documents, **22 bilingual EN/FR edited editorial responses**, and **18 short original Latin or Italian fragments** from the already audited witness annexes, with precise original-document/source URL, fragment ID, original language and locus. Each displayed response is prominently marked **editorial reconstruction, not the verbatim words of St Pius X; neither the historical voice nor English/French translations have been certified**. The historical fragment is visible as an expandable source detail with a Vatican link, without automatically downloading from the internet.

**Behavior:** Opening one of the four documented subjects in the 106-subject host shows the relevant original reviewed questions as selection buttons. Selecting or typing an *exact* reviewed question reveals the existing fixed bilingual editorial specimen and its primary Latin/Italian fragments. Free-form or private-memory questions outside those 11 have **no prewritten response**; the panel explicitly withholds an answer and does **not** improvise, invoke an LLM, perform fuzzy retrieval, or show a different document's evidence. The selected five-sprite expression is purely staging. Switching English/French or subjects clears the previous transcript and displays language-matched material. All processing takes place inside the file, without a network request or any paid provider.

**Build and delivery:** `tools/build-pius-x-p26-offline-replay.mjs` is invoked **after** the existing P6 voice-review build in `.github/workflows/pius-x-study-standalone-review.yml`. It uses `makeReviewHTML` to insert the private overlay into the unmodified P6 host, embeds only the 11 reviewed question/response pairs and 18 individually checked witnesses in an inert JSON script tag, and writes:

    artifacts/pius-x-study-expanded/SPX_P26_Offline_Source_Dialogue_Demo.html

The workflow's already-existing `pius-x-study-desktop-mobile-review` Actions artifact includes the generated HTML file (as part of `artifacts/pius-x-study-expanded/`). It can be opened locally in a modern browser; **no `localhost` server and no model configuration are required**. A single-file HTML is intentionally larger because it contains the existing source-owner corpus, all portrait assets and new replay data; do not mistake bundling the entire P6 host for publishing or approving its unreviewed 423 replies. The Actions artifact retention period is **30 days**, so it is a test deliverable, not permanent image-asset storage.

**Acceptance gate:** `tests/pius-x-p26-offline-replay-e2e.mjs` checks the original 106 chapters/423 nodes unchanged, the 4/11/22/18 reviewed material counts, all source ID and papal historical speaker constraints, one external-resource-free HTML document, desktop and mobile Playwright clicks, English and French answers, disclosure warnings, expandable Latin originals/Vatican hyperlinks, an unknown question being held, cross-language and cross-subject transcript clearing, and absence of HTTP(S) requests and JavaScript page errors. Both builder and Playwright test are included in the existing draft-PR CI workflow. CI must confirm a passing result before claiming this downloaded HTML is browser-tested.

**Conservative separation of product phases:** This is a deterministic, zero-cost review exhibit, not a functioning unlimited-knowledge Saint Pius X chatbot. The next product-quality work is still independent real conversational inference and human factual/source-language review. Do not import the demo's editorial responses into canonically approved papal speech or alter either the 423-node P6 source owner or the research gate's 144-node limits. Preserve the separate style pipeline's authority over tone.


## P2.27 — Offline related-source suggestions for 32 bilingual visitor variants (24 October 2026)

The P2.26 offline HTML has now passed both GitHub Actions workflows: standalone visual-novel review `40032040447` and required main gate `40032040454` (commit `02450bae82cc8fdfd58473ec860c52da4ff08915`). The original free offline copy was available in the existing workflow's 30-day `pius-x-study-desktop-mobile-review` artifact, alongside 106 original subjects and all five approved expression sprites.

**Real usability gain without an invented conversational model:** The offline source-dialogue panel now bundles **32 existing, previously independently triaged English/French visitor questions** from P2.24 (16 per language, four papal document chapters). Its build imports the **same P2.25 finite original-source router** used by the private generative trial and verifies that each alternative wording maps to a canonical node *among the original 11 provisionally reviewed exchanges*. The 32 question strings are stored separately as `navigationAliases`, explicitly typed `NAVIGATION_SUGGESTION_ONLY_NOT_SOURCE_ANSWER_CERTIFIED`; none receives a fabricated answer. The code rejects duplicate or cross-chapter mappings, wrong languages and disallowed node IDs at build time.

If a visitor types exactly one of the 11 original EN/FR reviewed questions, the HTML shows the existing editorial reply and the original Vatican source fragments. If the visitor types one of the 32 pre-screened alternate phrasings, the panel instead clearly says **“A related reviewed exchange exists. It may not answer every part of your question.”** It displays the *original* documented question as an explicit button, with a second confirmation click necessary before any editorial reply and evidence appear. Unsupported, unrelated, cross-chapter or invented-private-testimony questions remain held. The UI offers an example alternative wording within each chapter to expose this capability, but does not imply unlimited question understanding or semantic search.

The update stays offline as one file, contains no API calls and preserves the 423-node P6 owner and 144-node research gate. The existing P2.26 browser test was extended to assert all 32 mapping records, English **and** French two-stage related-document suggestions, absence of silently substituted answers, source §8 witness reachability, cross-chapter isolation, locale-specific transcript clearing, and no network requests or browser errors. This test is part of the existing draft-PR workflow; **a passing result for this additional stage must be observed separately** before treating the new P2.27 download as fully verified.

The underlying 22 English/French specimen responses still require human theological, translation and voice review; an exact match or suggestion only allows navigation to an *unapproved editorial paraphrase*, not certified personal papal speech or pastoral guidance.


## P2.28 — Sentence-by-sentence original-source inspection inside the offline visual novel (24 October 2026)

The P2.27 offline review was a validated bilingual UI that let a visitor open 11 source-scoped private editorial replies from four papal documents and suggested 32 related documented questions, but the **source list appeared as a whole-reply citation**, making it easy to imply that every clause was warranted by every excerpt. P2.28 remedies that deficiency without inventing any answer.

**23 individual, bilingual source-to-claim traces are now embedded at build time.** The P2.26 builder also reads the previously completed **P2.23 original-language claim-fidelity audit**: 23 individual English/French claim pairs with specific source witness ID sets and original Vatican text-window locators. It asserts a 1:1 match to each of the 11 P2.22 edited specimens, checks the claim ordinal and complete sentence string in *both* languages, verifies every supporting Latin/Italian witness against the original node's already licensed source IDs, and ensures every witness is a Pius X-authored excerpt (not the quoted St Anselm). Original Vatican web-text line coordinates remain technical locators rather than numbered paragraphs of the encyclicals. A build must fail on a changed specimen, lost witness, off-node citation, invented or orphaned claim, or any unapproved certification flag.

**UI:** Below each complete bilingual editorial reply and its original-document snippets, the offline panel offers an optional disclosure, **“Inspect sentence-by-sentence evidence” / “Examiner les sources phrase par phrase”**. Each original sentence is displayed as editorial text and matched to its own complete original-language witness snippets, each with source ID, locator and official Vatican page link. The visual treatment separates editorial interpretation from historical text, and explicitly says that correspondence remains provisional and that neither complete translation nor factual sufficiency was approved by an independent reviewer. The detailed audit is collapsed by default, minimizing repeated citation clutter in the conversational view. Existing 11 question pairs and 32 navigation-only variants work as before; related-question suggestions **still do not silently display replies**.

**Coverage and boundaries:** Four source families, 11 original question nodes, 22 EN/FR editorial response specimens, 23 sentence-level claim mappings, 18 distinct original Latin/Italian fragments and 32 alternate phrasing navigation-only examples. No source changes, no new 144-node gate admissions, no modifications to the 423 original P6 nodes, no outside network use, no live model inference and no certification or publication.

**CI:** The P2.26 browser suite now also checks that the inline corpus exposes 23 unique supported-by-witness *provisional* claim mappings and zero human signoffs, that the desktop/mobile English/French drawers show the exact audited claim text and original source excerpts, that a French switch clears the prior transcript, and that links go to the official Vatican edition. **Do not call this new P2.28 workflow green until the current branch's CI run completes.**


## P2.29 — Broad original-document source dossiers beyond the 11 scripted exchanges (24 October 2026)

**Product move from repeating the 11 scripted turns to genuinely broader offline source access:** A new read-only research surface consumes the **existing 144-node P2 original-language source gate**, not a new list of invented or automatically approved answer texts. The build enumerates the actual immutable P6 source-owner nodes with gate entries, checks them using the unchanged `selectEvidence` documentary/safety preflight, and excludes the already bundled 11 provisional bilingual scripted replies. The remaining eligible nodes are exported as **source-only dossiers**: their original EN/FR source-owner *questions*, excerpted Latin/Italian original wording, individual Vatican source URLs and loci, original speaker attribution, previous narrow English research glosses, and unresolved research cautions.

**Strict distinction: the new dossier has no new response or papal voice.** Neither the 133 possible additional nodes nor their research glosses are endorsed EN/FR papal answers. The dossier view explicitly says that a complete answer, translation and historical voice **have not been certified**, and the English original research gloss is labelled *English-only editorial research note*, including when the main interface is in French. Quoted authorities are labelled separately from direct Pius X authorship. The main P6 corpus, its existing unapproved 423 answers and the source-only model 144-node gate are left byte-for-byte unchanged; the source-only dossier data **does not embed the full P6 answer**. An original-language fragment shown below a question is not proof of everything implied by that question.

The standalone HTML now includes `previews/pius-x-study/spx-p29-source-dossier-client.js` and the matching restrained stylesheet. When a subject outside the four scripted pilot chapters has an eligible source-gated question, an **Original Source Dossier / Dossier des sources originales** section appears in the *existing* 106-subject visual novel. Choosing a question opens its original Latin/Italian fragments and the provisional notes; changing language or subject clears the source-specific view. Other chapters retain the original offline free-ask navigation; nothing is promoted to a generative speaker. The 11 provisional original replies retain their separate source-and-claim viewer.

The build records `sourceGateSize:144`, a dynamically measured `sourceDossierCount`, `sourceDossierHeldCount`, chapter coverage and distinct original-fragment count. Every one of the 144 research gate nodes must be accounted for as one of (a) the 11 already separately reviewed reply candidates, (b) a source-only dossier that passed the existing documentary preflight, or (c) a held dossier whose source or safety gate disallows it. This avoids manufacturing progress by treating screened source snippets as certified dialogue. The new CI contract checks all source dossier question IDs, document classes, original wording and source URLs, nonapproval flags, source-only semantics and bilingual desktop/mobile interaction, including the absence of outside HTTP requests.

**Release distinction:** Research-source *access* has broader coverage than the 11 source-aligned human-readable EN/FR reply specimens; fully evidenced conversational coverage is still limited to those 11 provisional responses. A real historically faithful generative voice requires further claim certification and model testing. No paid inference or user account charges are introduced.

**Validation:** The counts of actually accessible additional questions and distinct papal-document families must be taken from the first completed P2.29 Actions build output, not inferred from the 144 maximum. Do not announce the P2.29 HTML as browser-tested until the full standalone gate is confirmed green.


## P2.30 — Source-first presentation of 131 research dossiers (24 October 2026)

The P2.29 build is now **fully CI green** (St Pius X standalone study review `40038068451` and required main gate `40038068372`). GitHub's report confirms **131 additional original-source-only dossiers across 44 distinct original papal-document subjects**, drawn from **137 distinct Latin/Italian fragments**, alongside 11 separate scripted bilingual response specimens and exactly two source/safety preflight holds. The single HTML is **1,881,549 bytes** in the build log, without paid model inference, outside HTTP requests or publication approvals.

**Review UI correction:** P2.29 put source-only dossiers beneath the older unapproved original P6 character responses. This inverted provenance: the historically weaker reconstructed speech appeared before the primary text. P2.30 makes the original excerpt/questions the *default first view* in each applicable dossier chapter by inserting the dossier panel before the first P6 reply in the study container. The old P6 editorial replies, conventional follow-up choices and free-text search are **temporarily hidden**, not deleted, in those chapters until the visitor deliberately selects **“Inspect earlier unverified editorial reconstruction”** (French equivalent provided). The same button reverses to source-first; switching chapter/language resets to original source first. This does not affect the 11 reviewed bilingual script cases or the existing free-ask in chapters with no source dossier.

This is a **UI-only historical-evidence priority**, not a claim that the original Latin or Italian passages form a fluent Pope-authored response to the modern wording of each question. No one has certified English/French translation or a free-form generative answer. The immutable original P6 source-owner document, every existing research/source gate admission (144), and stored 423 nodes remain untouched. The browser test explicitly verifies the old draft stays reachable by opt-in and that default/locale state is reversible.

The updated P2.30 artifact should be presented only once its standalone GitHub CI and browser test have passed, independently of the successful P2.29 artifact.


## P2.31 / P0 — Read-only cross-source reconciliation between existing 423 turns and 1912 catechism indexes

**No new source of truth was invented.** The existing P6 `SPX_Study_Expanded_106_P6.html` remains the 106-subject/423-node dialogue source owner. The original main-branch `data/learn/ltfaith-pius-x-en-witness-index.v1.json` and `data/learn/ltfaith-pius-x-it-witness-index.v1.json` remain the paired 433-item source locators for the shorter 1912 Catechism (not full certified 1912 print collation). The research-only P0 report is generated deterministically by `tools/pius-x-p31-cross-source-reconciliation.mjs`, with the result in the temporary CI artifact at `artifacts/pius-x-study-expanded/SPX_P31_Readonly_Question_Reconciliation.json`. It is a **derivative join/audit, never a new answer library**.

The report preserves all 423 node IDs and the original EN/FR visitor questions as crosswalk context, their original chapter source URL/locus/genre and class, and detects *provisional lexical topic leads* to pinned 1912 English question stems with source QIDs. The 1912 index has only English question stems: it **cannot** demonstrate semantic identity, linguistic fidelity, original 1912 printed-edition correctness or answer sufficiency. No 1912 catechism answers or original P6 answers are copied to the derivative report. Every possible lexical lead is `LEXICAL_TOPIC_LEAD_ONLY_NOT_SAME_INTENT`, with zero approved merges, releases and theological/translation claims.

Separately, direct existing editor-number source locators for the longer 1905 Catechism and pre-papal Salzano catechism are extracted **only where the existing node explicitly cites that respective source**. They are scoped locator ranges, not identified equal intentions and **not print-original authorial Q numbers**. The independent content owner, [PR #1458](https://github.com/Fulcanelli13/ad-orientem/pull/1458), already maintains 339-question 1905 topical overlap research and 200-answer SPX/Chanoine/Denzinger comparison data, along with the 2,222 raw un-deduplicated historical-reference census. This P0 adapter references those registries by their documented upstream paths; it does not reimport/overwrite/claim approval for them.

**Explicit collision holds:** The shorter catechism Q269–271 cannot automatically settle the difference between **actual grace** and **sacramental grace** in existing `SPX-057`; the longer catechism Q527–533 provides the distinct source scope. Possible references to shorter catechism Q409–411 are also held because the modern Italian digital witness contains demonstrably later post-1929 marriage law wording. Generic words such as “must”, “make” and “know” cannot alone establish a match. The targeted cross-source test ensures every existing question survives unchanged, 433/433 English-Italian index IDs agree, author-owned answers are not copied, all candidates are unapproved, and the known grace conflict is explicitly held.

**Gate:** This is automated triage for follow-on human source/intent comparison. The exact lead count and number of held collisions must be read from the latest passing P2.31 CI artifact; neither screen positives nor negatives are authoritative semantic decisions. No new source-gate nodes, production dialogues, approved Q&A or external model calls are produced. The draft PR remains unmerged.
