# Matthew second 300 — cross-pipeline semantic review and source-owner reconciliation

**21 October 2026 | Research-only, no publication into Living Catena Messenger**

## Actual coverage

The second 300-excerpt review queue from `matthew-index.v1.json` was source-checked twice by separate AI-based research runs. Their overlapping records must **not** be summed as if all of them were distinct or independently human validated.

| Measure | Actual result |
|---|---:|
| Source excerpts in second queue | **300** |
| Source-linked machine triage records | **300** per pipeline, **300 unique original passages** |
| First AI-assisted contextual examples | **47** |
| Complementary AI-assisted contextual examples | **58** |
| Same excerpts in both sets | **19** |
| **Distinct excerpts with AI-assisted semantic review** | **86** |
| Excerpts still machine-triaged only | **214** |
| Cross-author/argument comparisons | **7 + 6 research leads** (not 13 distinct verified question alignments) |
| Different interpretation of answer sufficiency / number of arguments | **4** |

One pass recorded 47 close readings in `matthew-batch-02-47-meaning-checks.v1.json`; the other recorded 58 in `matthew-batch-02-curated-review.v1.json`. Each remains an **AI-assisted assessment requiring independent human editorial/critical-source approval**. Neither should be presented as 47/58 authored answer pairs or a fully completed theological review of all 300.

The merged **86-pointer research coverage and four disputes** are recorded in [matthew-batch-02-parallel-review-reconciliation.v1.json](matthew-batch-02-parallel-review-reconciliation.v1.json). We preserve each original assessment rather than silently replacing or losing a parallel pipeline.

## Meaningful findings for conversational UX

**Genuine disagreement, Matthew 19:16.** Jerome (segment `catena.matthew.19.16:1`) considers the wealthy young man to be testing Jesus; Chrysostom (segment `...:2`) argues it is unsafe to call him a hypocrite, noting Mark reports Jesus loving him. Both are authentic *Catena* editorial attributions for the excerpts as printed, **not independently verified critical-edition attributions**. A grouped Messenger response must use separate author-owned quotations, explicitly indicating the difference. Do not invent a common conclusion.

**Different interpretations, Matthew 11:28.** Augustine, Gregory, Hilary, Rabanus and Jerome explain why Christ calls his yoke easy: each has a distinct route (humility, detachment, practical virtue, growth in love, relation between Gospel and Law). Lexical topic matching would only say 'burden/love'; our source-based comparison preserves their individual arguments.

**Answer incompleteness, Matthew 12:25 and 12:31.** The two parallel AI reviews differ on whether the short question excerpt offers an independently sufficient answer. Treat `catena.matthew.12.25:7` and `catena.matthew.12.31:3` as **needs surrounding context** until a longer-work read confirms they are self-contained.

**Alternatives, Matthew 13:24 and 18:15.** Augustine on bundled tares proposes then revises a timing hypothesis in the same excerpt; Origen considers competing interpretations of fraternal correction. Do not retain a speculative first hypothesis while losing its correction, or turn one side of a two-view discussion into a solitary patristic verdict.

**Source-owner defect, Matthew 26:26.** Segment `catena.matthew.26.26:12` is labelled **Lanfranc** in the canonical pack but at exact UTF-16/JavaScript string offset **215** begins `PSEUDO-DIONYSIUS. (Eccl. Hier. 3. in fin.)`. The fragment is 530 JS string units; ownership spans are **[0,215)** and **[215,530)**. Both fragments stay in the untouched source. The separate [mixed-owner anomaly](matthew-batch-02-mixed-owner-anomaly.v1.json) blocks publication and records precise expected ownership until reviewed. One long **Lanfranc** answer bubble would falsely assign the Pseudo-Dionysius paragraph.

**Distinct theological arguments, Matthew 24:36.** Jerome and Hilary both answer in their own way an Arian inference about Christ's knowledge of judgment day; do not collapse their distinct lines into a fabricated quote.

**Other significant leads:** Jerome on Joseph's genealogy and the brethren of the Lord; Augustine on the Beelzebub accusation, divine will and Jerusalem; Chrysostom on Sabbath healing, miracles and the rich youth; Damascene on the prayer of the incarnate Christ; Ambrose on Eucharistic consecration; Jerome on altered testimony at Christ's trial. The doctrinally sensitive material requires source-translation and theological review before any end-user release.

## No claims beyond evidence

- 300/300 second-batch source passages have exact Catena pointer and question-mark window triage. A question mark is not automatically Father speech.
- **86** received an AI-assisted close reading; **214** have not. Parallel views do not count as independent historical scholarly corroboration.
- Several excerpts contain **biblical questions** and **imaginary objections** (e.g. 'some one will say'), not the Father's own question.
- A source excerpt may carry **multiple authors** or **several competing arguments**; one label or one question is insufficient.
- Modern reader questions remain *editorial navigational labels* and may not be spoken by the historical Father. The displayed answers must dereference the verified original Catena source, not an AI paraphrase.
- All changes are to `data/scripture/catena/research/` and test/workflow files; no corpus replacement or Messenger interaction changes.

## Audit

Run `node tests/scripture-catena-matthew-batch-two.mjs` for the parallel pipeline's existing test and `node tests/scripture-catena-matthew-batch-two-reconciliation.mjs` for the **second dataset, 86-pointer union, four disagreements, and author break**. Both are connected to the read-only source-audit workflow.

### Next batch

Continue through Matthew's **third** 300-excerpt queue. For reader usefulness, begin more thorough **authorial-question and speaker-ownership** annotation on the passages already semantically checked; do not assume automated lexical sorting provides question labels or accurate answer mapping for every fragment. Maintain existing canonical excerpt IDs across all iterations.
