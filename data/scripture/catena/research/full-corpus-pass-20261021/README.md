# Living Catena — complete canonical corpus first pass

**Source of truth:** `data/scripture/catena/manifest.v1.json` and the four existing `data/scripture/catena/{gospel}.json` packs. The pinned historical source is the Oxford/Newman *Catena Aurea* provider. **Research-only; not published to Messenger.**

The deterministic scanner `scripts/scripture-catena-first-pass.mjs` enumerates every canonical source excerpt and writes the four compact indexes plus `summary.v1.json`. The generated indexes are committed to this research branch. GitHub Actions reruns the same scanner with **read-only permissions**, verifies counts against the existing corpus manifest and requires the generated files to match the committed versions exactly. Never edit the canonical fragments to match an index.

## Coverage and actual findings

| Gospel | Catena passages | Source excerpts | Excerpts with at least one question mark | Research review batches (max 300) |
|---|---:|---:|---:|---:|
| Matthew | 278 | 4,825 | 621 | 17 |
| Mark | 104 | 1,451 | 157 | 5 |
| Luke | 245 | 3,660 | 435 | 13 |
| John | 187 | 2,756 | 674 | 10 |
| **Total** | **814** | **12,692** | **1,887** | **45** |

Source citations, Father labels, fragment ordinals and biblical verse keys always refer to the existing canonical Catena. An index row never reproduces or rewrites the Father's commentary.

There are **2,710 candidate lexical-theme groups within passages where at least two different inherited Father labels appear**, not independently reviewed patristic parallels. The corpus has **2,730 question marks in 1,887 excerpts**, but this does **not** imply 1,887 Father-authored questions: many may be biblical speech, rhetorical questions, hypothetical interlocutors or quoted opponents. Source-label and contextual flags identify material that must be checked before attribution.

## Files

- `summary.v1.json`: audited corpus totals, per-Gospel totals, flag and lexical keyword frequencies, inherited author-label counts, and exact-normalized duplicate pointers.
- `matthew-index.v1.json`, `mark-index.v1.json`, `luke-index.v1.json`, `john-index.v1.json`: one compact source-linked row per **every excerpt**, pericope group metadata, and exhaustive review queues.
- `scripts/scripture-catena-first-pass.mjs`: deterministic generator; rerunning should not alter checked-in data.
- `.github/workflows/living-catena-corpus-pass.yml`: reproducible generation and PR validation.

Each index records columns in `rowColumns`: `[pericopeId, zeroBasedSegmentOrdinal, inheritedFatherLabel, lexicalTopicCandidates, reviewFlags, sourceCharacterCount, questionMarkCount]`. Resolve original text as `pack.pericopes.find(p => p.id === pericopeId).segments[ordinal].text`. The `reviewBatches300[].rowIndexes` values address the index's `rows` array, not the canonical segment ordinals. The batches are prioritized by review signals, with original source context retained through each pointer. Because batches do not cross Gospel boundaries, there are **45** rather than the theoretical 43 obtained by dividing the entire corpus without Gospel separation.

## Review gates: source ownership before conversation

1. **Question voice:** Identify whether a question is actually formulated by the Father, by Christ or another scriptural speaker, by a fictional interlocutor, by an adversary, or by a modern editor. A punctuation flag alone does not qualify.
2. **Answer scope:** Check the whole excerpt plus nearby commentary before identifying a genuine answer; a fragment may depend on preceding words or include multiple opposing arguments.
3. **Attribution and works:** Printed Catena Father labels are inherited editorial claims; pseudo-attributions, glosses, ambiguous `ubi sup.` and `ibid.` references need source-work scrutiny.
4. **Parallel grouping:** Lexical-topic overlap is **only a search lead**. Approve a shared theological question only after verifying both Father's arguments and their nuance separately.
5. **Dialogue eligibility:** Output a Messenger question only when the question/answer relationship has been reviewed. Display the original verified Father text without AI paraphrase, synthesized Father replies or invented personal speech.

The immediate second pass is **300 original excerpts per batch**, beginning with high-risk interrogatives, then the remaining unreviewed passages; reviewed decisions should be stored as *separate* provenance records instead of overwriting these machine-generated inventories.

## Boundaries

The scan is **complete as an exhaustive lexical/source-pointer pass**, not as a semantically complete questionnaire or a publication-ready conversational corpus. Zero exact-normalized duplicate groups under the script's strict text normalization is not proof of no thematic duplication. A count of unmatched keywords reflects lexicon limits, not an absence of theological content.

Keep the St Pius X avatar and existing Living Catena Messenger work untouched. Import from Augustine/Eusebius or other external authors **only after** this original Catena coverage audit identifies a significant missing passage or argument.

## First 300-excerpt review stage (Matthew)

The first queue is **300 original Matthew excerpt pointers**, all selected by priority because they include at least one question mark. It has **not** been misreported as 300 semantically approved exchanges.

- `matthew-batch-01-300-question-triage.v1.json`: checks all **300** source pointers against exact original paragraph length, author label, Scripture pericope and question-mark offsets; retains a short surrounding question context and an expressly provisional voice-classification category. **208 ambiguous, 36 possible reported/scriptural voices, 7 explicitly framed objections, 44 potential exegetical author questions, 5 additional possible scriptural/reported voices.** This is source-based machine triage, not final speaker determination.
- `matthew-batch-01-curated-spot-review.v1.json`: **26 AI-assisted semantic spot reviews** inspecting actual excerpt arguments, including **24 passages with a relevant explanation in the same Catena excerpt and two context-incomplete passages**. No independent human second-reader approval has occurred. Reader-friendly questions are modern editorial navigation, never historical quotes.
- Four prospective cross-excerpt comparisons distinguish related arguments from falsely constructed consensus.
- `tests/scripture-catena-matthew-batch-one.mjs` enforces the 300 original source pointers and 26 higher-level spot reviews. As always, the original Father text is dereferenced from the canonical Catena; no second answer corpus is generated.

## Via Patrum feature benchmark — important change in strategy

A substantial part of our intended functionality **already exists publicly** at https://viapatrum.org/: **Ask the Fathers** returns source-linked passages to natural questions, **Topics** organizes witnesses and **Timeline** presents 100 dated, debated historical questions. Its separate **Scripture** view links works to Gospel verses. The site's own methodology documents AI-assisted Greek/Latin translations and checking, but they are not human line-by-line certified critical editions.

See [VIA_PATRUM_FEATURE_BENCHMARK_20261021.md](VIA_PATRUM_FEATURE_BENCHMARK_20261021.md) for capabilities, source and editorial comparisons and differences from our Catena.

**Policy:** borrow the conceptual retrieval/taxonomy lessons, use Via Patrum as a research **reference** and link where appropriate, but do not copy its new copyrighted English translation or assume the same Catena excerpt is present merely because a Gospel verse matches. Stop duplicating its broad generic patristic inventory. Continue only our source-specific Catena voice/context review and selectively fill independently demonstrated gaps.

## Matthew second 300-excerpt batch

The second priority review batch has **300** distinct source-linked Matthew fragments (**109** different pericopes, **420** literal question marks). Each receives source-faithful voice/context triage, including retained question-mark offsets; **209** remain lexically ambiguous. A further **47** undergo AI-assisted close reading of their actual arguments, with **42** fairly direct same-excerpt responses and **five** longer multi-stage explanations that cannot be compressed to a single response. Seven cross-Father comparison leads (21 reviewed source pointers) preserve distinctions between authors and question types.

Files: `matthew-batch-02-300-voice-triage.v1.json`, `matthew-batch-02-47-meaning-checks.v1.json`, `matthew-batch-02-seven-comparison-leads.v1.json`, and [full contextual findings](MATTHEW_BATCH02_MEANING_AND_SPEAKER_AUDIT.md). The regression check is `tests/scripture-catena-matthew-batch-two.mjs`.

**Cumulative first two batches:** **600 source excerpts** structurally screened, **73 AI-assisted semantic spot checks**, and **11** careful cross-commentary comparison leads. They are neither 600 certified Father-authored questions nor publication-ready English answers. This discovery pipeline never modifies the original Catena or produces Father speech.

## Reader-first whole-book routing (21 October)

A [source-linked catalogue and full-book priority queue](MATTHEW_READER_CATALOGUE_ACCELERATION_20261021.md) now aggregates 192 distinct existing AI-reviewed passage pointers, 31 overlapping comparison leads and all 4,633 remaining contextual-review pointers. **3,925 excerpts remain only mechanically indexed**; no new individual semantic reading is claimed. Human approval remains zero. Use `node scripts/scripture-catena-reader-routing.mjs` and `node tests/scripture-catena-reader-routing.mjs` to regenerate and validate the data.
