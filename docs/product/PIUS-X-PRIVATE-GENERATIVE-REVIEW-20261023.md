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
