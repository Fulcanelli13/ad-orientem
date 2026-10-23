# Living Catena — 15 missed exemplar cases: preliminary triage

**21 October 2026 · Unreviewed machine-aided investigation**

Source of truth: the exact Oxford/Newman English Catena chapter packs already
held by Ad Orientem. All excerpt IDs below use the original \`catena.<gospel>.<chapter>.<pericope>:<zero-index>\`
schema. To reproduce the complete, current four-message result list with
the original author and source link, run:

\`\`\`sh
node tools/scripture/report-catena-editorial-queue.mjs
node tools/scripture/report-catena-editorial-queue.mjs --json
\`\`\`

This note does **not** certify whether alternative commentary is
theologically sufficient. It separates mechanical retrieval defects from
potentially useful competing source excerpts. Gold exemplars in the 38-question
challenge remain unchanged.

## A. Source wording blocked or missed (seven cases)

| Case | Original intended source | Mechanically observed mismatch | Proposed review |
| --- | --- | --- | --- |
| MARK_SERVICE | Bede, Mark 10:41–45, segment 2 | Question has “greatest”; the original says “greater” and “servant of all”; over-strict long-term veto | Review safe comparative inflection handling, not unrelated semantic expansion |
| MARK_RESURRECTION | Pseudo-Jerome, Mark 16:1–8, segment 1 | “Joyful resurrection” is expressed as “happy day” and the Lord rising in triumph | Evaluate whether this is a reviewed concept bridge or a related-context label |
| MATTHEW_LEVI | Chrysostom, Matthew 9:9, segment 4 | Modern “tax collector” clashes with source “publican”, receipt of custom, and “called him”; “collector” blocks retrieval | Candidate precise historical-lexicon bridge, independent editor required |
| MATTHEW_RICH | Chrysostom, Matthew 19:16–26, segment 3 | “Struggle to follow” does not occur in its source wording; it discusses love of money | Review relevance to the full question before proposing alternatives |
| MATTHEW_TEMPLE | Jerome, Matthew 21:10–17, segment 7 | “Expel merchants” is expressed as “cast out all them that sold and bought” | Candidate narrow phrase bridge, not blanket synonyms |
| LUKE_ENEMIES | Chrysostom, Luke 6:32–36, segment 1 | “Christians” is absent despite “must love our enemies” appearing verbatim | Avoid treating general subject nouns as necessary original-text tokens |
| LUKE_NEIGHBOR | Theophylact, Luke 10:29–37, segment 3 | US “neighbor” versus source “neighbour”; “story” also absent | Normalize regional spelling separately from theological synonyms |

## B. Ranking and useful alternative possibilities (seven cases)

| Case | Original exemplar | Alternative/source issue worth reading |
| --- | --- | --- |
| MARK_BAPTISM | Bede #3, Mark 1:9–11 | Current results include Pseudo-Chrysostom on baptism and Bede on the descending dove; compare which best answers *why* Christ was baptized |
| MARK_STORM | Theophylact #4, Mark 4:35–41 | Chrysostom addresses the disciples’ fear; some higher-ranked material is more symbolic or narrative than causal |
| MARK_CHILDREN | Chrysostom #4, Mark 10:13–16 | Theophylact #5 and Bede #6 explicitly address childlike simplicity and purity; plausible direct alternative evidence |
| MATTHEW_HUMILITY | Jerome #7, Matthew 4:3–4 | Jerome states victory by humility; other sources discuss Scripture and the devil's temptation. A short but precise extract is disadvantaged |
| LUKE_PARDON | Bede #3, Luke 5:17–26 | Ambrose and Chrysostom discuss pardoning sins and bodily healing; compare these full passages, not just the snippet |
| LUKE_PRIDE | Theophylact #4, Luke 18:9–14 | A precise sentence on the Pharisee’s *standing/posture* ranks below general remarks about Pharisaic pride |
| JOHN_GRAIN | Bede #6, John 12:20–26 | Chrysostom #7 comments directly on the grain dying and bearing fruit; a potentially adequate alternative to Bede’s seed imagery |

## C. Broad topic matcher overriding a precise source (one case)

**JOHN_SPIRIT — Augustine #5, John 14:22–26.** The question asks
whether the Holy Spirit is excluded while the Father and Son dwell in the
soul. Augustine's original segment explicitly contains the precise phrase
“Holy Spirit excluded”. The generic Holy Spirit/Holy Ghost topic-selection
route previously took precedence over the literal passage.

**Technical correction in this PR:** where a three-word phrase with at least
two substantive terms occurs in a single authentic excerpt, prefer literal
source retrieval before topic expansion. This does not equate distinct
doctrines or generate a Father's answer; the UI still displays the original
text unchanged. The exact-phrase precedence has its own regression.

## Review decision and constraints

1. Grade complete, attributed source excerpts against the question, never
   against a machine-generated gloss. Use the grading protocol in
   \`EDITORIAL_REVIEW_PROTOCOL.md\`.
2. Keep the *15 exact-reference misses* distinct from the number of actual
   **answer-quality failures**. An alternate genuine source may be Grade 3
   while the nominated exemplar is absent.
3. For the seven wording-mismatch cases, distinguish commonplace historical
   or spelling variants from genuine interpretation. Any approved bridge
   must be explicitly scoped and tested for anachronistic false positives.
4. Do not train future retrieval against the challenge set and then call
   that set “held out.” Request a new independently assessed evaluation set.
5. Do not merge the draft solely because CI is green. Independent theological
   and contextual review and source-provenance acceptance still remain.

**No editor sign-off has been recorded in this file.** This is a technical
investigation and a reproducible reading queue, not a completed scholarly
certification.
