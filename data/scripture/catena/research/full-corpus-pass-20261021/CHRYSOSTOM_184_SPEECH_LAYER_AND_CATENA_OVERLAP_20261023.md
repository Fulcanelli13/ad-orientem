# Living Catena — Chrysostom speech-layer and cross-edition overlap audit

**23 October 2026 · source-faithful internal research · no human review, no public Messenger changes**

This audit processes the same 1888 public-domain English Schaff NPNF I/X printed source OCR and the frozen Oxford/Newman *Catena Aurea* Matthew corpus. The complete OCR original is immutable and validated by SHA-256. Only the research branch and its generated artifacts are affected.

## Work accomplished

The first pipeline, `scripts/scripture-catena-chrysostom-speech-layers.mjs`, classifies the previously sampled **180** question/ensuing-prose windows across all **90** Matthew homilies and **four** earlier bibliographically identified passages. Every classification is tied to the exact original source digest and text offsets; quoted substrings and OCR-delimiter defects also carry source hashes.

| Source-layer observation | Across all 184 research contexts |
| --- | ---: |
| Printed double-quotation delimiters in following text | **71** |
| Unresolved/unbalanced quotation delimiters | **24** |
| Another question mark in following text | **58** |
| Explicit reported-interlocutor cue | **3** |
| Possible quoted speaker indicator | **10** |
| **At least one visible risk requiring source-layer disambiguation** | **103** |
| No visible blocking cue under current rules, **still not independently attributed** | **81** |
| Authenticated patristic question/answer pairs | **0** |

The first classifier intentionally uses narrow evidence for printed footnotes/Scripture references and found **zero direct marker matches under those rules**. That is **not evidence that there are no footnotes or quotations**. Printed 1888 OCR can lose punctuation, interleave columns, or separate editorial apparatus by layout rather than exact keywords. Quoted text may come from Scripture, another author, or a reported objection, and the absence of printed quote marks does not prove that every word is Chrysostom's voice.

The second pipeline, `scripts/scripture-catena-chrysostom-catena-overlap.mjs`, compares **all 184** Schaff passages with the **4,825 already indexed canonical Matthew Catena excerpts**. It records actual normalized **five-word contiguous word sequences** shared by the two printed English source texts, excluding phrases so ubiquitous that they appear in more than 30 canonical excerpts. For an overlap to be recorded, at least two distinct qualifying five-word sequences must point to a single exact canonical excerpt. Every recorded sequence has a canonical Catena source pointer, the existing inherited Father heading and a test that the same words occur in both translations. Neither source text is rewritten.

| Cross-edition research status | Passages |
| --- | ---: |
| Literal overlaps including an excerpt under the inherited **Chrysostom** label | **24** |
| Literal overlaps **only** with excerpts under a different inherited label | **17** |
| No sufficiently distinctive contiguous-five-word overlap | **143** |
| **Total passages examined** | **184** |
| Unique canonical excerpt pointers surfaced as literal overlap leads | **71** |
| Earlier independently linked exact Catena pointer for Chrysostom's sower | **1** |

The **17 cross-author examples must not be counted as Chrysostom duplicates**. A common Gospel quotation or turn of phrase can occur in Augustine, Jerome, a gloss, Origen or another inherited source. The **24 inherited-Chrysostom matches** are only literal candidate overlaps, not verified complete agreement of argument or source attribution. The **143 textual nonmatches cannot be called new**, because the Oxford/Newman and NPNF English translations differ substantially. The known original-work sower connection remains pinned at `catena.matthew.13.1:17` even if its English phrase does not meet the stringent five-word matching threshold.

**Novel answers authenticated: 0. Human reviews: 0. Publication approvals: 0.**

## Remaining source ownership work

1. Inspect complete historical source pages/clear independent print transcriptions for the 24 inherited-Chrysostom overlap cases first, then the 17 cross-author examples as potential Scripture-quotation collisions. These are research comparison targets, **not human approval packets**.
2. Differentiate exact biblical quotations, imagined interlocutors, translator footnotes, heading text and homilist exposition **inside** the 180 full contexts. Keep literal quoted source subspans linked to the source.
3. Recover the homily subsection/paragraph boundaries from the original print text before calling the following prose a complete answer. Several passages contain another interrogative sentence before the presumed response has finished.
4. Compare theological substance and wording of only Father-owned material with existing Catena rows. Use `already_represented`, `original_work_has_more_context`, `original_work_has_additional_material` and `unresolved` as internal classifications, never as automated publication approval.
5. Continue the separate Augustine column-aware OCR restoration. The unresolved two-column alignment means his earlier 27 envelopes cannot yet be treated like the Chrysostom homily records.

## Reproduction and tests

After the complete original historical-volume acquisition and unit segmentation:

```sh
node scripts/scripture-catena-chrysostom-original-question-replies.mjs
node scripts/scripture-catena-chrysostom-speech-layers.mjs
node tests/scripture-catena-chrysostom-speech-layers.mjs
node scripts/scripture-catena-chrysostom-catena-overlap.mjs
node tests/scripture-catena-chrysostom-catena-overlap.mjs
```

The actual generated files are `dist/schaff-chrysostom-speech-layers/speech-layer-source-triage.v1.json` and `dist/schaff-chrysostom-catena-overlap/literal-overlap-source-evidence.v1.json`, included in the source-audit CI artifact. CI tests verify all exact OCR string offsets, SHA-256 hashes, the canonical five-word evidence against both source texts, father-label distinctions, and the unchanged *no publication* blockers.

**Successful measured execution:** [GitHub Actions source-audit run 39954099183](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39954099183), source [research artifact ID 12500599538](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39954099183/artifacts/12500599538).

The original 60 provisional Messenger routes have **not** been expanded or modified here. This work is source mining and retrieval preparation, not a human review stage.
