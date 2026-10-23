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