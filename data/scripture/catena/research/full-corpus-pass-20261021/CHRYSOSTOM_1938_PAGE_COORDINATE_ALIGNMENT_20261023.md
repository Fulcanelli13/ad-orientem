# Living Catena — real 1888 scan-page and word-coordinate research

**23 October 2026 · all 1,938 Chrysostom structural candidates · not authenticated Father speech · no human review or Messenger promotion**

## Why this pass matters

Previous attempts used the unchanged Internet Archive `_djvu.txt` OCR of Schaff *Nicene and Post-Nicene Fathers*, Series I, Volume X (1888), which enabled accurate **homily-level** and OCR-line identification but not reliable **printed scan-page or column position**. A separate source-acquisition pipeline has now downloaded the *same historical item's* coordinate-bearing `_djvu.xml` and `_scandata.xml`, and aligned **all 1,938 structural source-question candidates** using exact contiguous six-word sequences from the original OCR.

This is **historical scanned-page evidence**, not inference from an approximate book-page calculation.

### Actual acquired historical metadata

| Original source file | Evidence |
| --- | --- |
| Internet Archive [Schaff volume X, 1888](https://archive.org/details/selectlibraryofn10auguuoft) | Historical independently scanned English print edition |
| `selectlibraryofn10auguuoft_djvu.xml` | **41,151,259 bytes**; SHA-256 `f5ac920b83c568a03bb4f22d5f7dbd4e89e93388c092b56a441c8935b428ea08` |
| `selectlibraryofn10auguuoft_scandata.xml` | **332,530 bytes**; SHA-256 `cf9aaa8eb4099af7fe0bdc082070e08681eef4eea9e866f3ddc43c9468e49782` |
| Original plain 1888 scan OCR `_djvu.txt` | SHA-256 `4be619e9e01c9c6d5538fff17ac951e18775186814aa255a5540e2955c0ca6f2` |

The DjVu XML contains **586 original page objects**, **13,426 OCR paragraph elements**, **68,672 OCR line elements** and **522,127 original word-coordinate entries**. The number of scanned objects is not the number of printed homily pages; `scandata.xml` identifies individual scan leaves and may supply printed page labels. A DjVu paragraph is OCR markup, **not** a text-critically established paragraph of Chrysostom's original work.

### Complete original-question page alignment

| Measured result | Count |
| --- | ---: |
| Original 1888 Chrysostom structural question candidates searched | **1,938/1,938** |
| **Strong** unique exact six-word scan-page matches (3+ anchors and clear next-best separation) | **1,284** |
| Weaker but unique exact six-word page matches | **634** |
| **All unique scan-page candidates** | **1,918** |
| Ambiguous ties between candidate pages | **18** |
| No qualifying original six-word phrase | **2** |
| Total unresolved printed-page locations | **20** |
| Fallback to question text spanning an earlier OCR line where the current line is too short | **21** |
| Page-order regressions among unique scan-leaf matches sorted by original OCR line | **0** |
| Independent patristic author-question or answer authentications | **0** |

For each uniquely mapped candidate, the machine-readable output now retains the **actual original scanned leaf ID**, the **printed page label from `scandata.xml` where supplied**, the **six-word phrase present in both original sources**, the actual DjVu **first/sixth word coordinates**, its original page column ordinal, OCR paragraph/line ordinal, and **both independent source SHA-256 values**. Every one of the 1,918 matched phrases/coordinate pairs was independently tested against the actual original 1888 page XML, not simply inferred from the plain-text line number. **494 distinct scan leaves** are represented by at least one uniquely matched question; the full page XML contains 586 scanned page objects.

The **634 weaker matches** are source-locators with less repetitive lexical support than the strong cohort; they are **not certified page citations**. The **20 unresolved** comprise 18 page ties and two questions without an eligible matching six-word source phrase. A generated **654-item automated exception register** combines these 20 with the 634 weak matches so the next pass can prioritize precise page-disambiguation and stronger anchors, without turning them into human-review requests.

### What has not been established

- **Question ownership:** matching a Gospel question or imagined interlocutor to an actual page does not make it a verbatim personal statement by Chrysostom.
- **Original printed paragraphs:** `<PARAGRAPH>` and `<PAGECOLUMN>` are OCR layout evidence, not historical Greek-text paragraph or authorial boundaries.
- **Answer extent:** following lines and neighboring layout elements may contain scriptural words, editorial apparatus, objections or successive rhetorical questions; page matching does not certify a complete answer.
- **Translation fidelity or Greek collation:** the 1888 English historical transcription has not been critically compared to the original Greek.
- **New content:** nothing has yet been certified as absent from the 4,825 canonical Matthew Catena segments, and nothing is authorized for user-facing Messenger dialogue.

### Implementation and quality gates

Committed code:
- `scripts/scripture-catena-schaff-layout-acquire.mjs` — independently acquires and hashes original coordinate XML and scan leaf metadata, away from production acceptance gates.
- `scripts/scripture-catena-schaff-page-align.mjs` — aligns all 1,938 source questions to genuine page/word coordinate anchors, with strict pinned original historical source hash checks and conservative confidence.
- `tests/scripture-catena-schaff-page-align.mjs` — checks **all** 1,938 original source IDs, source phrase/coordinate integrity for each of the 1,918 unique matches, 18 ambiguous cases and two not-yet-matched cases; verifies the research-only blockers.
- `.github/workflows/living-catena-corpus-pass.yml` — adds a separately isolated coordinate-layout acquisition/alignment job that consumes the source-audited historical OCR artifact, performs the checks and uploads a 7-day research artifact. An external archive outage must not break core Scripture/reader gates.

Research outputs (not a production app import):
- `dist/schaff-layout-1888/NPNF1-10.djvu.xml` and `NPNF1-10.scandata.xml`
- `dist/schaff-layout-1888/acquisition-summary.v1.json`
- `dist/schaff-chrysostom-page-alignment/all-1938-page-coordinate-hints.v1.json`
- `dist/schaff-chrysostom-page-alignment/page-alignment-exception-queue.v1.json`
- `dist/schaff-chrysostom-page-alignment/summary.v1.json`

Initial full scan acquisition is verified in [GitHub Actions run 39963492129](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39963492129). The independent all-1,938 historical page/coordinate source validation passed in [run 39965463270](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39965463270) before the addition of its new exception-queue assertions. No human reviewer is needed for this research phase.

## Next high-value research step

1. Resolve the **20 unavailable exact page locations** by adding shorter anchored source phrases and contextual page-order constraints, retaining the original text and flagging low certainty. Then strengthen the **634** uniquely but weakly matched page candidates.
2. Exploit the actual `PAGECOLUMN` / `REGION` / `PARAGRAPH` source coordinate structure **for paragraph and speaker disambiguation** across all 1,938 questions; keep printed Gospel quotations and nineteenth-century editorial footnotes as separately attributed spans.
3. Only then extract fully source-owned **verbatim patristic answer passages**, maintaining the genuine original text and exact page/source provenance and checking full arguments against the Catena. **No AI-written Father dialogue**.
4. Expand historical-source acquisition to other Schaff volumes and independently restore Augustine's genuinely more problematic two-column *Harmony* scan; do not misrepresent this completed Chrysostom page-alignment step as a finished patristic knowledge corpus.

Still on [draft research PR #1547](https://github.com/Fulcanelli13/ad-orientem/pull/1547), not merged, no Messenger changes, no copyright permission requests, no human-review handoff and **zero publication approvals**.
