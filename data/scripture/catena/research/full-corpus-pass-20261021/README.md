# Living Catena — complete canonical corpus first pass

**Source of truth:** `data/scripture/catena/manifest.v1.json` and the four existing `data/scripture/catena/{gospel}.json` packs. The pinned historical source is the Oxford/Newman *Catena Aurea* provider. **Research-only; not published to Messenger.**

The deterministic scanner `scripts/scripture-catena-first-pass.mjs` enumerates every canonical source excerpt and writes the four compact indexes plus `summary.v1.json`. GitHub Actions runs the same scanner, verifies counts against the existing corpus manifest, and persists the generated research files to this branch. Never edit the canonical fragments to match an index.

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
