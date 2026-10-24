# Living Catena — first full-volume Schaff OCR acquisition

**23 October 2026 · actual full-volume scan-text acquisition · research-only · no permission requests · zero publication approvals**

## Actual acquired sources, reproducibility

Historical *Nicene and Post-Nicene Fathers*, Series I, 1888 print scans from Internet Archive, extracted directly from the online archive's `_djvu.txt` OCR downloads using `scripts/scripture-catena-schaff-ocr-ingest.mjs`. No CCEL transcription was downloaded. The pinned source endpoints and volume metadata live in `schaff-ocr-source-manifest.v1.json`.

| Source | Scan | OCR SHA-256 | Raw text characters | OCR lines |
| --- | --- | --- | ---: | ---: |
| Augustine, Vol. VI | [Internet Archive scan](https://archive.org/details/aselectlibrary06unknuoft) | `d1dbf01ad9047a00252cec6ef5822c5c2131bf6cad46c5209212c1cdf9417b34` | 3,774,180 | 84,176 |
| Chrysostom, Vol. X | [Internet Archive scan](https://archive.org/details/selectlibraryofn10auguuoft) | `4be619e9e01c9c6d5538fff17ac951e18775186814aa255a5540e2955c0ca6f2` | 3,339,900 | 86,358 |

On the first **completed acquisition CI job** ([source-run](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39940463212)), both downloaded successfully. The complete raw OCR, source SHA-256s, original line locations, 7,299 question windows, context passages, per-window SHA-256 and tentative four-Gospel lexical overlap hints were uploaded as GitHub Actions [research artifact](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39940463212/artifacts/12494838609) (14-day retention; not a shipping app corpus).

## Observed initial whole-volume results

| Volume | OCR question-mark windows | Any heuristic Catena lexical hints |
| --- | ---: | ---: |
| Augustine VI | 3,621 | 932 |
| Chrysostom X | 3,678 | 634 |
| **Total** | **7,299** | **1,566** |

These are **mechanically detected question marks** and literal five-word overlap hints. They include quoted biblical questions, translator notes, publisher material, OCR artifacts and repeated printed headings. The hint counter **does not mean** 1,566 matching theological answers; lack of a hint **does not prove** novelty.

## Pinning genuine printed work ranges

Using the **actually acquired OCR**, the printed-work boundary manifest `schaff-ocr-work-scope.v1.json` now pins contiguous *provisional* work ranges to the exact above source SHA-256 values. The first pass found:

| Printed work | Approx. line interval (1-indexed) | Question-mark windows in range |
| --- | --- | ---: |
| Augustine, *Sermon on the Mount* | 500–9,384 | 150 |
| Augustine, *Harmony of the Gospels* | 10,199–32,249 | 481 |
| Augustine, Gospel sermons | 32,723–75,800 | 2,968 |
| Chrysostom, *Homilies on Matthew* | 1,071–79,086 | 3,650 |

The balance occurs in volume prefaces, translator introductions, tables/indexes and apparatus. These ranges are derived from visible printed title headers and the beginnings of indexes; **they are approximate**. Even inside a work range, an OCR question is not necessarily authored by the Father (rather than biblical speech or an explanatory editor).

The live ingestion script will now only classify these scopes when the **whole-volume source hash matches** the original acquired historical OCR exactly. A changed scan/OCR reverts to an `unclassified` state rather than silently assigning the wrong work.

## Research-only output contracts

- `NPNF1-06.raw-ocr.txt` and `NPNF1-10.raw-ocr.txt`: complete original acquired OCR, not editorially corrected.
- `NPNF1-06.question-candidates.json` and `NPNF1-10.question-candidates.json`: exact OCR context windows and line offsets, OCR window SHA-256, source URLs, unverified origin and at most three tentative Catena pointer matches.
- `summary.v1.json`: volume-level ingestion and raw detection counts.
- No full source content is injected into the production Messenger and **no question candidates are reported as independently original, new or human-approved**.

## Next high-value research pass (still before human review)

1. Restrict the first authorship-sensitive extraction to **Augustine's *Harmony* (481 raw windows)** and **Chrysostom's Matthew homilies (3,650 raw windows)**, using anchored chapter/homily divisions and stripping footnote/Scripture-quotation questions. The separate Augustine Gospel sermons should be mined subsequently, not mixed into Harmony.
2. Recover **genuine author-posed questions and nearby source-owned argument spans**. A question in a biblical quotation may be valuable Scripture metadata, but it is **not** a patristic question utterance.
3. Reconcile by work, Scripture locus and original wording with the existing 12,692 Catena fragments. Publish neither duplicate text nor inferred answers.
4. Only after paragraphs are reliably attributed should broader Messenger retrieval experiments consume the research index. There is no human review or release gate in this phase.

**Reproduction:** `node scripts/scripture-catena-schaff-ocr-ingest.mjs --volume all`. The `schaff-public-domain-volume-acquisition` CI job creates the temporary research artifact; the source-integrity regression is `node tests/scripture-catena-schaff-ocr-ingest.mjs`.
