# Living Catena — Schaff source-question and nearby-text screening

**23 October 2026 · automated, unapproved research · no permission correspondence, no human-review handoff, no public Messenger changes**

## Work completed on the already acquired 1888 print OCR

A new deterministic screening script, `scripts/scripture-catena-schaff-question-context-pilot.mjs`, reads the exact SHA-pinned full-volume scans and source-unit inventories. It re-examines every raw question-mark window in the selected **94 historical print work units**: Augustine, *The Harmony of the Gospels* (four books), and John Chrysostom, *Homilies on Matthew* (ninety homilies). Each OCR question is categorized by explicit interrogative/rhetorical wording, adjacent quotation signs, possible footnotes and editorial apparatus, prior parsing cautions, and OCR corruption.

| Metric | Augustine, *Harmony* | Chrysostom, Matthew homilies | Total |
| --- | ---: | ---: | ---: |
| Original OCR question-mark windows screened | 481 | 3,650 | **4,131** |
| Higher-priority rhetorical candidates (mechanical only) | 0 | 115 | **115** |
| Medium-priority candidates | 27 | 364 | **391** |
| Low-priority or possibly quoted/ambiguous text | 454 | 3,171 | **3,625** |
| Sampled exact source-context envelopes | 27 | 180 | **207** |

All **94 source units** have at least one inspected source-context candidate. Every sampled record carries the literal original question OCR line, original line SHA-256, source-unit ID, a longer contiguous **unmodified nearby text envelope**, its SHA-256 and line boundaries, plus cautious Catena lexical-overlap pointers. Those surrounding lines are **not called an author-owned answer**.

**Critical OCR issue:** the Augustine printed volume is two-column, and its OCR occasionally combines Scripture quotations, source commentary and different column fragments on the same OCR line (for example, at line 14,971 the line contains both travel narration and the scriptural question, "Son, why hast thou thus dealt with us?"). All Augustine candidates now receive a `two_column_harmony_OCR_alignment_unresolved` blocking flag. An unflagged Chrysostom question can likewise be quoted Scripture, a rhetorical objection or a footnote; scores prioritize investigation but cannot authenticate original authorship.

### Small literal example, not a generated Father response

In the independently acquired Chrysostom NPNF I volume X, Matthew **Homily III**, the source OCR at lines **3,086–3,092** poses a rhetorical question and supplies text immediately afterward:

- OCR question line: `But  what  kind  of  marvel  ?  it  may  be  asked.`
- Immediately following line begins: `That  the  Virgin  should  be  preserved,  and`

The exact seven-line passage, including the OCR's original hyphenation and spacing, is stored with its source SHA-256 and a flagged attribution status. This shows the research format can preserve author-like question/response material without producing new patristic prose. It **does not yet establish independent authorial ownership or original Greek-text collation**.

## Reconciliation with the previously located fourteen full-work witnesses

A separate script `scripts/scripture-catena-schaff-seed-to-scan-crosswalk.mjs` maps each of our fourteen earlier bibliographic loci into an actual SHA-256-verified **printed work unit** in the acquired historic volumes. Its research output distinguishes:

- **14/14** original-work leads located at printed book/homily-unit level;
- **10/14** historical English anchor phrases matched after punctuation/spacing normalization against the actual scan OCR;
- **4/14** not exactly recovered in that OCR: these are **transcription/OCR or translation-variation leads**, not proof the source passage is absent;
- **3/14** already linked to precise existing Catena excerpt pointers, without adding duplicates.

For Augustine, **printed chapter numbering is not yet safely resolved** from mixed two-column OCR. A link to Book III does not magically locate a line at III.XXV, nor does an OCR anchor establish patristic authorship. Chrysostom homily order is pinned, but translator notes and biblical questions still require segregation.

## Boundaries that remain in force

1. **Zero authenticated new Father questions**: scores are heuristics, not attestation.
2. **Zero verified standalone Father replies**: surrounding source OCR is context, not a certified answer boundary.
3. **Zero confirmed content absent from the 12,692-fragment Catena**: approximate lexical matches neither prove nor exclude duplication.
4. **Zero publication approvals**: nothing is automatically promoted to the 60 provisional Messenger navigation routes.
5. **No human review yet**: continue automated historical source reconstruction and controlled retrieval experiments.

The next step should prioritize **column-aware or clean public-domain alternate edition text for Augustine**, followed by footnote/Scripture extraction for Chrysostom. Only then should individual questions receive authentic word-for-word source-owned answer spans.

The reproducible outputs are generated as `dist/schaff-context-pilot/question-source-layer-pilot.v1.json` and `dist/schaff-context-pilot/schaff-seed-to-scan-crosswalk.v1.json`. The complete OCR text stays in the research artifact rather than bloating the permanent Git repository.
