# Living Catena — all 1,938 Chrysostom passages expanded, and 10,267 original OCR blocks indexed

**23 October 2026 · actual source-research execution · no human-review handoff, no public Messenger changes**

## What is complete

The same public-domain **1888 Schaff NPNF I/X historical English print OCR**, SHA-256 `4be619e9e01c9c6d5538fff17ac951e18775186814aa255a5540e2955c0ca6f2`, has been processed across **90/90 Chrysostom Matthew homilies**. The new tools extend the actual research scope **from 180 to all 1,938** identified *structural* question/prose candidates.

- `scripts/scripture-catena-chrysostom-full-structural-context.mjs` attaches original-source text up to 55 OCR lines before and 110 after each of the 1,938 candidate question locations, respecting homily boundaries. The historical words, exact line range and SHA-256 are preserved. **1,758 newly expanded, 180 retained byte-for-byte unchanged**.
- `scripts/scripture-catena-chrysostom-ocr-blocks.mjs` indexes nonempty source-OCR line blocks separated by OCR blank lines, retaining the original text/hashes and assigning each structural question its containing block, source text after the question mark, and the next original block. This is a **layout locator only**. Print scan OCR blank lines are not necessarily authorial paragraph boundaries.
- Tests verify every one of **1,938 original question and context SHA-256s**, original homily unit, no changed OCR text, every quoted/heading/possible-note locator, all 180 earlier text matches, every source-block reference and adjacent continuation pointer, and explicit release blockers.

## Measured historical-source coverage

| Measure | Result |
| --- | ---: |
| Full original Matthew homilies processed | **90/90** |
| Structural question/ensuing-prose research candidates | **1,938/1,938** |
| Candidates newly expanded beyond the first two-per-homily sample | **1,758** |
| Long OCR windows retained unchanged from prior pass | **180** |
| Historical OCR line occurrences across all expanded windows (with overlap) | **308,297** |
| **Distinct original homily OCR lines** covered after overlap removal | **73,531** |
| All original homily OCR lines (90 homilies) | **78,016** |
| **OCR line coverage** | **94.25%** |
| Source block candidates separated by blank OCR lines | **10,267** |
| Of those, distinct blocks containing the 1,938 structural question candidates | **1,414** |
| Questions whose OCR line has text after its first question mark | **1,726** |
| Cases whose reconstructed question span may start before the current OCR block | **627** |
| Cases with potential printed-note clue in question or next block | **71** |
| Printed OCR blank lines between nonempty blocks | **14,388** |

**Coverage** means that 73,531 of 78,016 OCR lines lie within at least one research context window. It is **not** the percentage of patristic questions successfully authenticated, nor the percentage of the underlying printed edition critically collated. The 10,267 blocks are OCR layout artifacts, **not 10,267 certified original paragraphs**.

### What the question/paragraph boundary research shows

The first question-to-block index is useful for detecting source discontinuities and potential changes of speaker. For instance, **627** question spans may begin before the OCR block that contains their question mark: a simplistic first-line-only question extraction would omit source context. **1,726** have additional text on the same OCR line after the question mark; this text may be explanatory prose, a second biblical utterance or editorial commentary. **71** have nearby possible printed-note indicators. All remain hypotheses until page-layout and quotation ownership are resolved. OCR block continuations are explicitly labeled as **not certified answers**.

Other measured source issues from the full 1,938-case extended-window audit:

- **1,913** expanded windows contain at least one printed quotation glyph (quotes may be Scripture or other speech).
- **849** structural candidates have another question mark in their initial ensuing OCR prose.
- **130** do not provide usable blank-line clues on *both* sides within 24 lines of the question.
- **338** extended windows reach one end of the original homily's indexed source range.
- **1,120** expanded windows include a plausible printed-note locator somewhere in the 166-line window.

These counts measure source formatting, **not independently certified Bible quotations, author speech or paragraph boundaries**. Counts overlap and cannot be summed. There are **zero authenticated new Father answers**, **zero proven new beyond-Catena teachings**, **zero Messenger promotions** and **zero human approvals**.

## Files and reproducibility

Committed implementation/acceptance suites:
- `scripts/scripture-catena-chrysostom-full-structural-context.mjs`
- `tests/scripture-catena-chrysostom-full-structural-context.mjs`
- `scripts/scripture-catena-chrysostom-ocr-blocks.mjs`
- `tests/scripture-catena-chrysostom-ocr-blocks.mjs`

Generated **research artifact** (not production reader data):
- `dist/schaff-chrysostom-full-structural/all-1938-long-original-source-contexts.v1.json`
- `dist/schaff-chrysostom-ocr-blocks/ocr-block-source-locators.v1.json`
- `dist/schaff-chrysostom-ocr-blocks/all-1938-question-block-links.v1.json`
- the whole underlying unmodified Schaff OCR, all 1,938 original shorter question/prose records, and prior first-pass Catena textual-overlap evidence.

**Successful source and paragraph-locator run:** [GitHub Actions run 39961921892](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39961921892), [complete source archive](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39961921892/artifacts/12504668916), with all linked unit/line/text/hash tests passed.

## Next genuine research gates

1. Reconstruct **printed-page columns, paragraph divisions and notes** for the 1,938 question locations; the 1888 plain OCR contains enough text for location, but layout clues cannot authenticate their authorship. A high-volume exception-driven page-layout pass is better than selecting only a handful of examples.
2. Classify **question speaker versus Scripture, imagined interlocutor and author exposition** with literal source subspans and page references; preserve quoted Scripture as such.
3. Recover answer text only where **actual original-source prose boundaries** are confirmed, then compare the argument itself to the existing Catena pericopes. There are **4,825 Matthew canonical excerpts**, and the existing lexical research matches do not determine theological duplication.
4. Work on the **other Schaff volumes** in parallel, and use a separate column-aware method for Augustine's *Harmony*. Avoid calling the already acquired 1888 OCR "complete source-authentication."
5. No new Messenger routes or Father utterances before a sufficiently attested source reference is available; this remains **automated research**, **not a human-review stage**.

All 1,938 original source references and expanded contexts have now been processed. We can stop redoing the original 24-case pilot and prioritize printed-layout reconstruction.
