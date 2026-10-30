# St Pius X — first-print witness, exact Canon handoff and old Dz facsimile gate

**20 October 2026 — PR #1458, research-only. No live Chanoine or SPX answer was published.**

## Main source correction: 1905 original print uses unnumbered D. / R. questions

The original 1905 book is **`Compendio della dottrina cristiana`**, prescribed by Pius X, printed by the **Tipografia Vaticana in Rome**, not a transcript of his personal spoken words. The [photographic scan index](https://it.wikisource.org/wiki/Indice:Compendio_della_dottrina_cristiana,_Roma,_1905.djvu) includes the original pages. Examined photographic printed pages **204, 206, 213, 214, 215 and 216** show the questions as *D.* and their answers as *R.*, **without continuous original printed question numbers**.

Accordingly, research references such as `PX1905-Q607` and `PX1905-Q652` are **digital editorial ordinal locators**. They must never be described as identifiers visibly printed in the 1905 original. When publishing a cited answer, show the historical printed chapter/page **and original Italian question incipit**, optionally an explicitly labelled editorial QID. Do not drop existing `PX1905-Q...` database IDs: they still underpin the canonical original-language mapping.

Research proof record: `data/learn/research/pius-x-original-1905-print-page-ten-corrections-20261020.v1.json`. This reconciles every one of the ten corrected bilingual turn drafts to original printed pages **202, 204, 206, 208, 209, 211, 213, 214, 215 and 216**. Six were inspected as photographic page images; the other four through page-level proofread transcription. This remains a **partial original-print passage review**, not independent published-translation certification.

Original-print examples:
- **Q652** (editorial locator): [1905 printed p. 213](https://it.wikisource.org/wiki/Pagina:Compendio_della_dottrina_cristiana,_Roma,_1905.djvu/225). The sacrificial offering definition includes destroying the offered sensible thing *in some manner*, not the broadened draft alternative “change **or** destruction.”
- **Q655–Q657**: [1905 printed p. 214](https://it.wikisource.org/wiki/Pagina:Compendio_della_dottrina_cristiana,_Roma,_1905.djvu/226), continuing on [p. 215](https://it.wikisource.org/wiki/Pagina:Compendio_della_dottrina_cristiana,_Roma,_1905.djvu/227). Preserve one and the same sacrifice and the force-of-words versus concomitance distinction.
- **Q660**: [p. 215](https://it.wikisource.org/wiki/Pagina:Compendio_della_dottrina_cristiana,_Roma,_1905.djvu/227) / [p. 216](https://it.wikisource.org/wiki/Pagina:Compendio_della_dottrina_cristiana,_Roma,_1905.djvu/228). Christ is the first and principal offerer, priest His minister.
- **Q607 / substance and species**: [p. 204](https://it.wikisource.org/wiki/Pagina:Compendio_della_dottrina_cristiana,_Roma,_1905.djvu/216). This contains the original historical spelling *transustanziazione*; bilingual editorial translation may normalize to English “transubstantiation” / French “transsubstantiation” but may not silently claim that spelling is in the historical Italian.
- **Q619**: [p. 206](https://it.wikisource.org/wiki/Pagina:Compendio_della_dottrina_cristiana,_Roma,_1905.djvu/218); **Q641**: [p. 211](https://it.wikisource.org/wiki/Pagina:Compendio_della_dottrina_cristiana,_Roma,_1905.djvu/223), explaining duration of the species.
- **Q628**: [p. 208](https://it.wikisource.org/wiki/Pagina:Compendio_della_dottrina_cristiana,_Roma,_1905.djvu/220); **Q633**: [p. 209](https://it.wikisource.org/wiki/Pagina:Compendio_della_dottrina_cristiana,_Roma,_1905.djvu/221), the historical midnight Communion fast versus nature of fasting.

The existing per-answer 200-turn source crosswalk has now been **updated, in-place on the research branch**, with `originalSource.numberingProvenance.originallyPrintedQuestionNumber=false` for **all 200 answer turns** and page-evidence references for the ten corrected drafts. Existing original QID strings were preserved.

## Chanoine: verify answers rather than infer from a topic label

[Visual-novel P2 PR #1402](https://github.com/Fulcanelli13/ad-orientem/pull/1402) contains the *actual*, source-owner maintained `src/apostolate/corpus.js` answers:
- **AQ04** `publication: READY`: “Doesn’t the Mass sacrifice Jesus again?”; EN/FR deterministic replies, linked to Trent XXII.
- **AQ05** `publication: READY`: “How can Catholics believe bread really becomes Jesus?”; EN/FR deterministic replies, linked to Trent XIII.

`src/learn/ask-church-source-digest.js` retrieves only `READY` source-owner answers and source labels through the Apostolate registry. The new CI test pins **exact P2 commit `0a920793bcdf40cc053ad0aff31132ade8185a33`** and stages those real source-owner files read-only to verify both answers and their bilingual source-linked digest. No duplicated answer was written into PR #1458.

The [shared router owner PR #1443](https://github.com/Fulcanelli13/ad-orientem/pull/1443) still marks its broad Canon topics `canon.apologetics_apol_030` and `_031` as `SOURCE_GAP`, `approvedReply:false`. Thus, **READY in the Apostolate owner is not a claim of a live Pius-X-to-Chanoine route**.

The 22 existing proposed referrals were individually checked against AQ04/AQ05:
- **10:** matched to the owner reply's **narrow** subject (actual exact/same doctrinal question, such as “Is the Mass the same sacrifice as Calvary?” or “What is the name of the conversion?”).
- **5:** thematically adjacent / only partial. A source answer cannot silently replace the asked question.
- **6:** do not answer the specific question (e.g. source-owner AQ04 does not explain Q657’s separate consecration or Q652’s definition of sacrifice).
- **1:** unrelated transition (“Which sacrament does the Catechism consider next?”), not an actual Eucharistic doctrine question.

All 22 remain **not approved for live character transfer**. The opt-in colleague switch may be shown, but must preserve original visitor question, language and evidence context, and state honestly if a specific Chanoine answer is not available. The registry lives in `data/learn/research/pius-x-chanoine-22-answer-aq04-aq05-eligibility-20261020.v1.json`.

**Do not put AQ04/AQ05 into St Pius X's mouth** or label an Apostolate answer as a newly documented personal statement by Monsieur le Chanoine.

## Old Denzinger: eight entries need photographic-number checks

`data/learn/research/pius-x-eight-old-dz-number-print-facsimile-queue-20261020.v1.json` consolidates the repeated citations into **8 separate old-number entries, 45 individual links across 42 SPX answer turns**.

| 1911 **old Dz** | Printed page *according to OCR* | Magisterium source owner |
|---:|---:|---|
| 878 | 287–288 | Trent XIII ch. V · MG-P012 |
| 884 | 290 | Trent XIII canon II · MG-P013 |
| 885 | 290 | Trent XIII canon III · MG-P014 |
| 888 | 290–291 | Trent XIII canon VI · MG-P015 |
| 940 | 312 | Trent XXII ch. II · MG-P005 |
| 941 | 312 | Trent XXII ch. III · MG-P046 |
| 948 | 314 | Trent XXII canon I · MG-P018 |
| 950 | 315 | Trent XXII canon III · MG-P019 |

Provenance: Heinrich Denzinger, `Enchiridion symbolorum`, **11th edition**, edited by Clemens Bannwart, Herder 1911. [Scan](https://archive.org/details/enchiridionsymbo00denz), [OCR](https://archive.org/stream/enchiridionsymbo00denz/enchiridionsymbo00denz_djvu.txt).

**0 photographed 1911 numbered-entry verifications**, **0 modern DS/DH concordance verifications**, **0 public Denzinger-number certifications**. These are only named-old-edition OCR *research leads*. The Magisterium source owner PR #1452, not this SPX branch, owns promotion after original-document text and original-edition number agreement.

## CI and next gate

`tests/pius-x-print-canon-denzinger-release-gate.mjs` ensures:
1. All 200 1905 Catechism source question IDs have `originallyPrintedQuestionNumber=false`.
2. Ten revised EN/FR turns map to photographed/historically proofread printed-page source locators without claiming independent review.
3. The specific 22 Canon candidate statuses are counted and none is silently allowed as an approved Chanoine character reply.
4. The genuine pinned P2 **AQ04 and AQ05** source-owner module and its read-only digest both resolve bilingual READY answers with named original council witnesses.
5. All eight 1911 old-Dz entries remain hidden from public numbered citation until photographic/edition verification.

The workflow uses a pinned read-only Git fetch rather than duplicating P2 data or merging competing research pipelines. **No public Mass, SPX, Canon, or Magisterium runtime was changed.**
