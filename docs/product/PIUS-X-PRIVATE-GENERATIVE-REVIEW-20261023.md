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
