# Living Catena — editorial retrieval review protocol

**Status:** Candidate evaluation queue, **not yet independently reviewed**.  
**Source:** *Catena Aurea*, Oxford/Newman English edition (1841–45), as
pinned by the canonical Ad Orientem corpus. The Father labels are inherited
historical attributions, not necessarily independently authenticated
modern critical-edition authorship.

## Scope and baseline

The test fixtures are:
- \`editorial-acceptance.v1.json\` — 11 earlier question/source exemplars and
  5 intentionally unsupported questions, now used as a regression test.
- \`editorial-challenge.v1.json\` — 38 *additional* independently selected
  questions spanning all four Gospels, with 16 unsupported-query probes.
  Here “independently selected” means selected without using the ranking
  results; it **does not** mean assessed by an independent human reviewer.

Initial machine-evaluated results on 21 October 2026:

| Gospel | Selected exemplar appears in top four |
| --- | ---: |
| Matthew | 5/9 |
| Mark | 5/10 |
| Luke | 6/10 |
| John | 7/9 |
| **Expanded sample** | **23/38 (60.5%)** |

All 16 unsupported queries in the expanded sample returned **no attributed
Father message**, after conservative source-attestation checks. The earlier
11-item exemplar set remained 11/11. Both samples are too small to estimate
general theological relevance or consumer satisfaction.

**These are exact-reference recall metrics, not independent grades of answer
quality.** Other returned source extracts may be relevant, possibly more
relevant, and can only be adjudicated after reading their full context.

## Blind review procedure

1. Present the human reviewer with the biblical verse, the user's question,
   and the first four retrieved **full unabridged source excerpts**, in the
   sequence actually shown. Hide the preselected target ordinal and ranker
   scores. Keep Father attribution and source citation visible.
2. Require the reviewer to open the original Catena source for each
   excerpt. The words in the bubble must match the source verbatim, with
   source range, historical name and any authorship qualification preserved.
3. Grade each excerpt on the four-level scale below. Reviewers should mark
   exactly which source words support the grade, not produce a new
   theological explanation in a Father's voice.
4. Have a second reviewer independently assess the same case. Resolve
   disagreements with a written adjudication. Do **not** alter the question
   or target reference after seeing retrieval results simply to make tests
   pass. A new eligible original passage can be *added* as an accepted
   reference only after independent source and contextual review.
5. Separate the 16 unsupported cases: no fabricated speech, no materially
   misleading snippet presented as a reply, and an explicit abstention or
   source-navigation explanation.
6. Evaluate desktop and narrow-phone presentation: source labels should
   remain attached to the correct message; “from another passage” and
   “related source wording — not a direct answer” must be unmistakable.

### Result grade

| Grade | Meaning |
| --- | --- |
| 3 — Direct | Original words address the stated question in the appropriate biblical and theological context |
| 2 — Useful context | Authentic excerpt clarifies a closely related issue; the UI does **not** pretend it answers the question directly |
| 1 — Weak | True excerpt with coincidental vocabulary or remote relevance that would distract the reader |
| 0 — Unsupported/misleading | Wrong context, misleading implication, missing original proof, invented wording or broken attribution |

Treat Grade 0 as a blocking defect, particularly when the interface implies
that an author answered an anachronistic question. Distinguish “no exact
exemplar retrieved” from “no useful excerpt retrieved.”

## Review recording schema

A review record should identify:
- fixture ID and complete user question;
- displayed message IDs in order, with source citations;
- reviewer ID, independent date and second reviewer ID;
- grade for each message, source phrase/span and rationale;
- whether “direct”, “related”, “from elsewhere” and edition/author labels
  were accurate in the UI;
- adjudication decision, any alternate accepted **original segment IDs**
  (with independent source checks), and unresolved provenance concerns.

Never replace the canonical Catena registry with an editorial answer bank.
The accepted segment IDs only measure retrieval; actual message text must
always come from the verified pack loader.

## Publication gate — proposal, not yet certified

For a representative, reviewer-adjudicated held-out set, aim for at least
85% of questions with a Grade 3 or properly-labelled Grade 2 excerpt among
the first four, **zero** Grade 0 messages, and **zero** fabricated responses to
unsupported prompts. Audit Gospel-by-Gospel, not solely aggregate. These
thresholds are proposed release criteria, not results already achieved.

The current 38-item challenge is a diagnostic set. It should not be used as
the sole final held-out measure after algorithm changes. A larger fresh
human-curated test set and a second editor are still needed.
