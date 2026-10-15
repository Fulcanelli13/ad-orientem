# Mystery of the Mass — complete 44-study editorial review handoff (15 October 2026)

**Status: FOUR-BATCH OFFLINE REVIEW READY; SOURCE RESEARCH ONLY; NO USER PUBLICATION APPROVALS.**

This phase ends the repeated fragment-by-fragment and ever-expanding spreadsheet review workflow, without losing any previous research. It is **not** a competing app feature, a second Mass reader, a new work parser, or a release of disputed devotional/theological prose.

## Canonical source mapping

- One durable **source-pointer-only** registry: [`data/learn/research/mystery-mass-editorial-source-register-20261015.v1.json`](../../data/learn/research/mystery-mass-editorial-source-register-20261015.v1.json).
- Preserved manuscript source: `data/learn/research/mystery-mass-source-led-narrative-drafts-20261014.v1.json`.
- Existing canonical editorial owner inventory: `data/learn/research/mystery-mass-canonical-39-owner-inventory-20261014.v1.json`.
- Result: **8 Formation chapters / 39 existing theological explanation owners / 44 unique EN-FR draft studies**, byte-for-byte inherited from the 2026-10-14 manuscript. Chapter MF02 “The body at prayer” is cross-cutting, not a 40th canonical explanation owner.
- The original 435 Mass micro-units, 42 author/witness column pairs, 139 historical verified-claim records, 955 archived evidence attachments and the 325/325 classified candidate gaps remain in the preceding master workbook and research records. Their content is *not duplicated here*.

## Actual, downloadable HTML review

[**Standalone 44-study bilingual HTML**](../review/mystery-mass-editorial-batch-review-44-20261015.html)

This is a **single file** containing the original 44 complete or concise bilingual drafts (verbatim), plus original source links where the manuscript provided them. It can be opened offline after downloading the raw HTML from GitHub. It does not execute app code or access third-party scripts.

The interface has four large batches:
1. **Preparation, Word and sacred actions** (MF01–02; MF02 has no separate study owner);
2. **Offertory and opening Roman Canon** (MF03–04);
3. **Consecration and Calvary** (MF05–06);
4. **Communion and thanksgiving** (MF07–08).

It also provides All 44, search, decision filters, short vs complete drafts, and EN+FR/EN/FR display. Each study has a distinct canonical draft ID and a human review control:
- Retain after source verification
- Replace with original author/source passage
- Revise
- Shorten
- Move to deeper explanation
- Exclude

**Review state:** browser-local storage only; user can **export and re-import one JSON file** with all 44 study IDs, existing owner/chapter and decision plus free-text reason. Exported decisions must be brought back to the editorial pipeline explicitly and reviewed for source accuracy; no browser action publishes them.

## Editorial safeguards

- Original drafts may contain AI-written bridging explanations; they are clearly marked **unapproved**, not presented as the original wording of Guéranger, Gihr, St Alphonsus or another author. User has explicitly rejected AI-written substitute theological narratives. Prefer an accurate primary-source passage or faithful EN/FR translation where evidence permits.
- Original author and catechetical exposition must retain provenance, edition and theological scope. Scripture links belong to the common Bible reader; avoid synthetic quotations.
- New study findings from the seven Offertory/private-Communion prayer groups are possible *source details attached to existing owners*, not seven commissioned essays.
- Normative Mass actor gestures, the 65–67-card LIVE reader, Low/Sung form conditions and the exact Mass text remain owned by their current app/ritus pipelines.
- Source holds from previous phases remain: a partial Creed catechetical parallel, exact-word Latin split issues, and five pending visual facsimile-page checks. They are not reasons to restart the historical census.
- Review state is **neither ecclesiastical approval nor publication permission**; no changes were made to production content or a public GitHub Pages deployment.

## Regression gate

`tests/mystery-mass-full-editorial-44-review.mjs` validates the source-pointer registry, all 44 exact EN/FR short+deep texts, eight chapters, 39 owners, four large batches, valid single-file inline JS, no remote scripts, and review/export/import UI controls. It is run by the **existing** Mystery editorial inventory GitHub Actions workflow.

## Next acceptance step

Have the user review the **entire manuscript in large batches**, not continue isolated research rounds. In parallel, preserve and reconcile primary historical source IDs for comments marked “replace”, without creating separate parallel text owners. Once the exported review JSON is received, prepare source-faithful EN/FR replacements and updated summaries only for specifically selected studies, and leave every other draft unchanged. Then link user-accepted content to existing eight Formation chapters and contextual 65–67-card reader cues; verify the actual deployed app before claiming release.
