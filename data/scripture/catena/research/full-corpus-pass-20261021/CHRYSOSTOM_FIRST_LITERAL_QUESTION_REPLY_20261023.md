# Living Catena — first source-exact Chrysostom question → ensuing prose research

**23 October 2026 · original 1888 English print OCR · research-only, not human-reviewed**

## What was extracted

A new reproducible tool, `scripts/scripture-catena-chrysostom-original-question-replies.mjs`, reads the **unchanged, SHA-256-checked historical Schaff NPNF I volume X OCR**, the 90 original Matthew homily unit indices, and all 3,650 question-mark windows from the preceding pipeline.

Unlike the first broad question-window pass, this tool recovers **multiline interrogative starts**, source-exact text up to the question mark, and the **immediately ensuing printed prose** (subject to OCR line/paragraph cautions), keeping exact source-line boundaries and SHA-256. It distinguishes provisional rhetorical/expository questions, reported interlocutor objections, and questions about biblical speakers. Each result has explicit **source ownership and answer-boundary unresolved** flags, source-layer risks, and the earlier tentative Catena lexical hints. It never invents an answer or relabels the modern question as something the Father said.

| Research result | Count |
|---|---:|
| Original Matthew homilies checked | **90/90** |
| Original OCR question-mark windows screened | **3,650** |
| Broad **syntactic** question + ensuing-text candidates | **1,938** |
| Distributed exact OCR question/prose envelopes (max 2 per homily) | **180** |
| Homilies represented by envelopes | **90** |
| Prior bibliography-linked question/prose witnesses additionally pinned | **4** |
| Verified authorial Greek-text answer boundaries | **0** |
| Confirmed wholly new non-Catena material | **0** |
| Publication and human approvals | **0** |

The **1,938** is deliberately a **loose machine screening count**, not a count of authentic Chrysostom Q&As. It includes false positives caused by line wrapping, quoted Scripture, rhetorical objections, a second question within the same paragraph, and footnote text. The **180** are source-exact original OCR *research snippets*; they are not 180 certified answers. The 4 prior loci are individually source-pinned but must not be counted as newly discovered material.

## Four source-owned print-context examples (the 1888 English wording)

The generated `pinnedOriginalWorkEvidence` includes the **complete unmodified OCR text**, not a synthesized response. It separates characters *at the original question mark*, not by unverified semantic interpretation.

| Prior seed | Historical work and OCR lines | Evidence for question and ensuing prose | Established Catena duplicate |
|---|---|---|---|
| `SCH-CHR-001` | Chrysostom, *Matthew* **Homily XLIV**, 42,321–42,333 | Reported hypothetical objection about sowing among thorns; the following printed prose distinguishes literal fields from souls capable of change | `catena.matthew.13.1:17` — **already indexed** |
| `SCH-CHR-002` | **Homily XLVII**, 43,840–43,844 | Expository question about why the disciples dared to ask about the tares; following prose cites Christ's words that mysteries were given to them | Not yet mapped; **do not assume novel** |
| `SCH-CHR-003` | **Homily XLVII**, 43,868–43,879 | Question about why the disciples asked about the tares rather than the leaven or mustard seed; following printed text calls the others plainer | Not yet mapped; **do not assume novel** |
| `SCH-CHR-004` | **Homily XLVII**, 44,008–44,018 | Question about why Christ continued teaching disciples privately in parables; following prose says their understanding had grown and then **quotes the Gospel**, which must be separated from Chrysostom's own words | Not yet mapped; **do not assume novel** |

We can already distinguish **two layers of speech** that must not be conflated. In Homily XLIV the rhetorical question is attributed in the translation to an imagined interlocutor (*saith one*), not necessarily a direct question in Chrysostom's own personal voice. In Homily XLVII the explanatory passages contain **direct biblical quotations**. A future author-speech segment must preserve those quotations as quotations, not transform them into new patristic speech. Printed editorial and original Greek comparison remain incomplete.

## Reproducibility and safety

After acquisition/segmentation:
```sh
node scripts/scripture-catena-chrysostom-original-question-replies.mjs
node tests/scripture-catena-chrysostom-original-question-replies.mjs
```

The generated `dist/schaff-chrysostom-replies/chrysostom-question-ensuing-prose.v1.json` includes all 180 records plus the four pinned original-work passages. The exact original 1888 OCR remains in the external research artifact, not the production reader. The test verifies all four text divisions concatenate **byte-for-byte back to the original OCR lines**, every selected source word and context hash, all 90 homily identities, and explicit no-publication invariants.

**Next internal research target:** reliably tag biblical citation subspans and nineteenth-century footnotes inside these four exemplars and the strongest per-homily candidates, then compare substantive original-work arguments with the matching canonical Catena pericopes. Augustine's two-column OCR requires a separate column-aware pipeline. **No human review workflow is being initiated.**


### Printed quotation-source boundaries — follow-up

The focused four original-work anchors now also retain **literal quoted-text subspans and SHA-256s**, and a separate flag where only one quotation delimiter is visible inside the cropped context:

- `SCH-CHR-001` (*Homily XLIV*, reported objection): no double-quoted passage in its printed ensuing-prose excerpt, but the *saith one* question is explicitly a **reported interlocutor**, not necessarily the author's direct question.
- `SCH-CHR-002` (*Homily XLVII*, disciples' confidence): one **paired printed quoted passage** within the following words; this is a candidate Gospel quotation, **not automatically authored speech**.
- `SCH-CHR-003` (*Homily XLVII*, tares versus leaven and mustard seed): one **unpaired quotation marker** in the cropped passage; the source slice cannot be treated as a complete quoted/textual unit.
- `SCH-CHR-004` (*Homily XLVII*, private explanation): one **paired printed quoted passage** representing words of the Gospel embedded in Chrysostom's exposition.

These are **typographical OCR indicators**, not independently verified Scripture-boundary or Greek-text checks. The regression asserts that the exact extracted strings and source SHA-256s match their offsets in the printed English OCR. This prevents downstream indexing from silently converting Gospel quotations or an imagined interlocutor into new patristic dialogue. The next research work remains comprehensive Gospel/footnote ownership discrimination before source-authenticated answer extraction.
