# Living Catena — Mark blind retrieval review protocol

**23 October 2026 · draft/editor-only · no publication permission**

This is an **editorial retrieval evaluation** for the existing Living Catena Messenger, not a new answer corpus and not an automated source-approval process. Its historical witnesses and AI research grades remain in draft research PR #1547; the actual Messenger and this reviewer workbench are in draft PR #1533.

## What is ready

- 23 mixed questions (ten contextual research prompts and thirteen deliberately misleading or unsupported formulations) in `editorial-mark-blind-cases.v1.json`. The reviewer-facing fixture includes only the modern question, Gospel pericope and neutral case ID, not the expected source, AI grade, whether the prompt was adversarial, or ranker scores.
- The established Catena editor workbench has a **Mark · blind review** mode. For each question, it loads the original pericope through the existing **integrity-checked** chapter loader and displays the native pericope-local Messenger's **first four actual results** with full unchanged texts, printed inherited Father labels, citations and source URLs.
- An editor assigns **0 unsupported/misleading**, **1 weak**, **2 useful context**, or **3 direct** to **every retrieved excerpt**, with a supporting exact phrase for grades 2 and 3 and a reasoned explanation. No results: mark appropriate abstention, a missed source or uncertainty. Full neighboring Catena commentary is available for context without supplying editorial answer keys.
- Reviewer-specific drafts stay local to the browser and are exported as **separate JSON manifests**. Export includes source pointer, SHA-256 digest and short verbatim evidence phrase, not a duplicate full commentary corpus. A separate reviewer identifier isolates local draft fields, but does not authenticate a person.

## Procedure for two editors

1. Reviewer A opens `previews/living-catena-editorial-workbench-20261021.html`, selects **Mark · blind review**, enters their own reviewer identifier and examines all 23 cases. They must not consult the separate AI answer-key panel or the other editor's grades while working.
2. Reviewer A exports their manifest and stores it securely outside the browser. It cannot grant publication permission. An incomplete manifest remains marked incomplete; only 23 completed cases count as a full blind pass.
3. Reviewer B repeats independently using a different reviewer identifier, without seeing Reviewer A's export.
4. Compare the two completed exports by exact case/source-pointer grades and abstention judgments. Record discrepancies and resolve them with an explicitly reasoned third-stage adjudication. Record source phrases, speaker ownership, qualifiers and any missing source.

   Run from the repository root: `node tools/scripture/reconcile-catena-mark-blind.mjs reviewer-a.json reviewer-b.json`. This rejects incomplete manifests, mismatched source hashes and the same reviewer identifier; it emits a JSON disagreement report. Do not identify the CLI comparison with genuine human independence or doctrinal signoff.
5. Only after separate historical-source, attribution, edition/translation/rights checks and explicit editorial signoff should any new **source-pointer navigation route** be proposed. Do **not** auto-create new Father speech or treat a high score as permission to publish.

The workbench is an editorial convenience, not a secure blind-study server: repository readers can inspect research data if they seek it. Genuine independent reviewing requires process discipline and external authentication of reviewer identity.

## Quality gates

Apply the existing editorial proposal: on a newly assembled *held-out* set, seek at least **85% Grade 3 or properly-labelled Grade 2** among the first four, **zero Grade 0 misleading attributed messages**, and no fabricated direct responses to unsupported questions. Measure Gospel-by-Gospel. The earlier **3/10** Mark expected-source recall is a narrow lexical diagnostic, not a human relevance score or a claim about these new grades.

**Publication approval: zero.** Dual-review exports are not self-authenticating and cannot change draft or production Messenger routes. The existing sixty provisional curated questions are unchanged.
