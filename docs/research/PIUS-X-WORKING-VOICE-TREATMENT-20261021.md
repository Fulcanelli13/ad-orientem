# St Pius X — working voice treatment decision for the visual novel

**21 October 2026 · Editorial recommendation only. No historical or theological approval.**

## Decision

For the **St Pius X character** in Ad Orientem, prefer a **concise, source-faithful early-twentieth-century Catholic speaking register** over a documentary narrator or newly invented papal pronouncements.

The character voice may use **faithful adaptation (B)** of the documented teaching and **minimal connective language (C)** that adds no doctrine, personal opinion, personal memory, pastoral conclusion or unsourced historical detail. **Exact historical quotation (A)** remains marked off and accompanied by the original text and locus; no experimental avatar reply is a quotation merely because it sounds period-authentic.

This direction follows the independently researched voice controls in [PR #1419](https://github.com/Fulcanelli13/ad-orientem/pull/1419) and *does not* constitute that pipeline's approval. The original source-owned bilingual answers and the 82 chapter/327 node authoring graph remain in draft [PR #1458](https://github.com/Fulcanelli13/ad-orientem/pull/1458). The locked five-sprite stage remains separately owned by [PR #1402](https://github.com/Fulcanelli13/ad-orientem/pull/1402). No cross-branch source files have been copied or modified.

## Three trial outcomes

| Candidate | Proposed treatment | Why | Status |
| --- | --- | --- | --- |
| **SPX-010 — Peter's repentance** | Source-bounded, moderate period diction; distinguish wrongdoing, sorrow and despair in response to the selected objection | Avoids repeating the opening question and keeps the subject grounded in Salzano Q198–200 | **SHORTLISTED FOR HUMAN SOURCE/VOICE REVIEW**, not character approved |
| **SPX-032 — Charitable correction** | Firm but patient, brief Catholic register; speak to the good of the neighbour, avoiding a second statement of the same objection | Corresponds to the source's documented correction-with-charity pattern in *E supremi* §13 | **SHORTLISTED FOR HUMAN SOURCE/VOICE REVIEW**, not character approved |
| **SPX-023 — Spiritual Communion** | Distinguish spiritual desire and sacramental reception in-character only as a proposed catechetical adaptation. On the individual’s eligibility to receive, switch to an **out-of-character editorial source limit** | Prevents simulated Pius X from deciding an individual visitor's sacramental disposition | **SPLIT CHARACTER/EDITORIAL**, neither line certified |

Original witness citation must be rechecked for **each substantive claim** before a selection may be promoted. A draft does not acquire authority through style or sprite staging.

## Presentation contract

1. **Default mode:** display the original *editorial* source-grounded draft under the banner **EDITORIAL SOURCE READING · NOT PAPAL SPEECH**. It is not verbatim Catechism text either.
2. **Comparison mode:** only the three named source-vs-voice trials appear, visibly labelled as **experimental**, never authentic papal quotations.
3. **Interactive choices:** use the selected voice trial's rewritten English/French question labels, not stale labels from the unchanged original. The visitor picks the first follow-up, then sees only that specific dependent continuation.
4. **Source and context:** retain the document and locus outside the stage dialogue. Editorial qualifications about anachronistic practice, modern law or a specific person's conscience are not automatically voiced by St Pius X.
5. **Visuals:** reuse the exact approved five Pius X WebP assets from the pinned PR #1402 commit. For an editorial-only sacramental limitation, **hide the character sprite**.
6. **Navigation:** Back, change subject, related chapter (when in the staged 12), source view, EN/FR and in-memory review export. Do not mislabel unavailable related chapters as openable content or imply a Chanoine answer exists without the authoritative source router.
7. **Human review:** evaluate voice, pacing and clarity in the standalone 12-scene review. Draft evaluations remain local until exported as JSON. Do not treat UI ratings as independent theological or historical approval.

## Validation and release discipline

A separate **real-browser** test has been added to `.github/workflows/pius-x-conversation-evidence-bridge.yml`, in the existing Playwright Chromium job. It stages the **actual five immutable WebP files and their manifest** from PR #1402, compares SHA-256 per file, checks mobile and desktop interactions (390px and 1280px), English/French, branch-dependent continuity, editorial-speaker safety, topic menu, exportable ratings, image decoding and horizontal overflow. It saves screenshots and sample exported review JSON in a CI artifact.

This validates browser behaviour only after the new job succeeds; screenshots and automated controls **do not** establish human visual acceptance, authenticity of reconstructed speech, independently approved translations, or permission to merge the separate branches.

## Editorial blockers before character release

- Independently check each line's theological proposition against the exact original witness and its language/edition.
- Review the chosen period diction with the PR #1419 style owner; do not manufacture faux-European archaisms, default plural *We/Nous*, or habitual paternal reproach.
- Approve English and French separately.
- Keep personal sacramental judgments, individual guilt, legal obligations and pastoral triage out of the simulated historical person's mouth.
- Reconcile the P2 host's pinned old 20-path source bridge with the appropriate **approved** dialogue selection; do not import all 327 draft nodes by changing a pin.
- Conduct a human phone/desktop stage review before claiming visual acceptance.

**Working position:** the form of speech is chosen; the **content itself is not approved**. Further speculative dialogue expansion should not supersede these approvals.
