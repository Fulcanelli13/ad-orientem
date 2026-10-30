# Living Catena — actual Schaff source-unit segmentation (23 October 2026)

**Automated research only.** Neither a source-critical edition nor a reader-approved catalogue of the Fathers' own questions. This stage does not require or request human review or permissions.

## Completed extraction

The 1888 NPNF first-series scan OCR acquired and pinned earlier has now been partitioned by authentic visible printed headings:

| Printed primary work | Source units recovered | Question-mark OCR windows assigned | Five-word lexical overlap hints with Catena |
| --- | ---: | ---: | ---: |
| Augustine, *The Harmony of the Gospels* | **4 books** | **481** | **222** |
| Chrysostom, *Homilies on Matthew* | **90 homilies** | **3,650** | **610** |
| **Together** | **94** | **4,131** | **832** |

The remaining whole-volume OCR question windows belong to other Augustine writings, introductions, footnotes, indexes and miscellaneous printed material outside these two selected works; they remain acquired, but are not mislabeled as *Harmony* or Chrysostom's homilies.

**Source evidence:** [whole-corpus acquisition and segmentation CI](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39942816346); [source OCR and 94-unit segmentation artifact](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39942816346/artifacts/12496672480). The accepted automated regression checks **every recovered unit's SHA-256**, **every original question line and surrounding text SHA-256**, the 94 headings, all 4,131 assigned windows and the exact two full-volume input hashes.

## What is actually stored

`scripts/scripture-catena-schaff-section-ingest.mjs` reads the previously acquired **unmodified** scan OCR and question windows. Its generated `NPNF1-06.source-units-and-questions.v1.json` and `NPNF1-10.source-units-and-questions.v1.json` contain, for each unit:

- immutable source edition SHA-256, printed title and book/homily ordinal, first and last line in the source OCR, original printed heading string, and SHA-256 of that entire OCR unit;
- for each question-mark candidate, the precise source unit, original OCR question line, full surrounding source text and both text hashes, as well as preliminary possible lexical overlaps with canonical Catena pointer IDs;
- explicit flags distinguishing possible Scripture quotations, printed notes, near-heading occurrences, corrupted OCR and **unverified** rhetorical author-question candidates;
- `authorQuestionConfirmed: false`, `authorReplyVerified: false`, `novelBeyondCatena: false`, `publicationEligible: false` for all candidates.

Printed homily headings have been enumerated **I–XC**, with three OCR mistakes transparently retained and normalized at the *heading index* only: `11` → `II`, `XXXL` → `XXXI`, `XXXIL` → `XXXII`. Original source text is unchanged.

The four *Harmony* book headings are reliable enough for book-level units. **The printed Augustine chapter headings are not yet sufficiently reliable for section boundaries**: two-column OCR places some chapter headings out of numeric order (e.g. Book IV chapter II before chapter I). We must not silently assign question/answer words to the wrong chapter. Homily-level segmentation is a more stable first source unit for Chrysostom.

The latest extraction now records **123 visible Augustine chapter-heading candidates** across those four books, preserving every original heading line and SHA-256. These are chapter *locators*, not 123 completed chapter text sections: some expected numbered headings are missing from OCR and others appear out of order. The regression explicitly tests these limitations so future code cannot silently convert uncertain headings into authoritative chapter boundaries.

## Internal triage result, not an author attribution claim

| Screening class | Augustine *Harmony* | Chrysostom Matthew |
| --- | ---: | ---: |
| No simple Scripture/footnote/heading flag detected; possible author rhetoric **unconfirmed** | 459 | 3,350 |
| Needs source-layer disambiguation from simple warning flags | 22 | 300 |

These are **mechanical, conservative warning flags** and do *not* make the 3,809 unflagged items authentic patristic questions. An unflagged OCR question could still be Christ's quoted words, Augustine's paraphrase of an opponent, the translator's insertion, or a scanning error.

The 832 lexical Catena hints are only token-overlap signals. Neither their presence nor absence establishes whether the whole original-work argument occurs in the existing 12,692-segment Catena registry.

## Next research pass: source-owned answers without fabricated Father prose

1. For Augustine *Harmony*, recover chapter boundaries from the printed headings and verified 1888 page scans, allowing **multiple ambiguous line-range candidates** rather than arbitrarily choosing a misordered OCR marker.
2. Within each chapter or Chrysostom homily, use quoted biblical incipits, visible footnotes and work text layout to distinguish **Father's own question**, **imagined interlocutor/objection**, **Scripture quoted as a question**, **editor's question**, and **OCR uncertainty**. Store original text spans and line/page provenance, never AI reconstructions.
3. For a securely Father-owned question, keep the surrounding response paragraphs and opposing or alternative explanations **verbatim**. Avoid deleting context in order to make a short answer look direct.
4. Classify each retained source span against the frozen Catena: `already_in_catena`, `same_argument_extended_original_work`, `material_only_in_original_work`, or `unresolved`. Unlike keyword overlap, semantic equivalence requires inspecting both source passages.
5. Only use this resulting *research* index for measured search experiments, with abstention where confidence is poor. **No Messenger answer generation and no human review yet**.

No copyright-permission requests, no reader architecture changes and no publication approvals.
