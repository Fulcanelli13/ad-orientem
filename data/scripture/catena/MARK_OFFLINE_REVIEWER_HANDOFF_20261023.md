# Living Catena — handoff to two independent Mark reviewers

**23 October 2026 · research-only · no approvals recorded**

The reviewer-facing deliverable is a **single self-contained HTML file**: `catena-mark-blind-review-offline.html`. It embeds all 23 mixed questions and the complete, source-integrity-checked Catena excerpts returned by the *current* pericope-local Messenger retrieval. It has no generated Father speech, AI answer key, external JavaScript, external CSS or need for a repository checkout. Original Catena links are optional when a reviewer has internet access.

## Obtaining the actual file

Open the GitHub Actions run for **Living Catena editorial source acceptance** on draft [PR #1533](https://github.com/Fulcanelli13/ad-orientem/pull/1533) and retrieve the artifact named **`living-catena-mark-blind-offline-review`**. Unzip it to obtain `catena-mark-blind-review-offline.html`. This is generated from committed code by `node tools/scripture/build-catena-mark-blind-offline.mjs` and checked by `node tests/scripture-catena-mark-offline-packet.mjs`.

The action may require repository access to download. A reviewer does **not** need repository access once sent the HTML file. It opens directly in an ordinary browser, including at a local `file://` address.

## Reviewer instructions

Send **the same HTML** separately to two independent editors, without sending the AI research dossier or the other reviewer's ratings. Each editor should:

1. Open the HTML in a browser and choose a distinct *reviewer identifier*; use their own copy.
2. Read the Scripture setting, full retrieved Father-attributed excerpt(s) and source citations for each case. Where needed, open the original Catena source link, and do not treat printed attribution as a critically authenticated author.
3. Grade **every** retrieved excerpt: 0 misleading/unsupported, 1 weak, 2 useful context, or 3 direct. Grades 2 or 3 require an exact short phrase from the displayed source. Write a reasoned qualification in their own words. For a case with no returned excerpts, grade whether abstention was appropriate, missed a source, or cannot be judged.
4. Click **Save this case** after every assessment. Because a standalone `file://` document may not have durable storage, use **Export JSON progress** regularly. Reviewers can later use **Resume from previously exported JSON** to continue, including after closing their browser.
5. Export a **23/23 complete** `catena-mark-blind-<reviewer>.json` manifest and send that manifest back. Neither export includes full Catena excerpts nor can it publish content.

**Do not send the original AI grading matrix, the seven lexical misses, or a draft answer key to the reviewers until both exports are complete.** These are *question selection* evaluations and do not represent certified patristic statements.

## Reconciliation by the project

Once two complete manifests from demonstrably independent people exist, run:

```sh
node tools/scripture/reconcile-catena-mark-blind.mjs reviewer-a.json reviewer-b.json
```

The CLI checks the frozen original source SHA-256 for every returned excerpt, verifies both case sets, and outputs grade/abstention disagreements. It refuses incomplete reviews or the same reviewer identifier. A human coordinator must independently confirm reviewer identities and adjudicate disagreements. No programmatic approval, new Messenger route, or publication is triggered.

## What remains outside this packet

This packet grades **retrieval quality**, not full original-work textual criticism, edition/translation reuse rights, or systematic doctrinal certification. Its ten selected positive examples are research pilots, **not an independent held-out release benchmark**. A separate newly curated blind set and original-work checks are still required before public release. The research and Messenger PRs remain draft.

**No human reviews have yet been received; publication approvals remain zero.**
