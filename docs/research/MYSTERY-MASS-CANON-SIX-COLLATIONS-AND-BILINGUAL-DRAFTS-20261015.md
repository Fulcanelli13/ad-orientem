# Mystery of the Mass — Canon original-edition transcription pass, six merges and five theological questions

**15 October 2026 — branch-only research; not publication approval**

The prior [32 same-author case ledger](../../data/learn/research/mystery-mass-canon-32-comparison-adjudication-20261015.v1.json) and [39→65–67 handoff](../../data/learn/research/mystery-mass-39-to-curated65-67-source-author-handoff-20261015.v1.json) are kept intact. This targeted continuation did not re-audit all 422 historical evidence records and did not create another source/work identity register.

## Source witness integrity

| Author or corpus | Text consulted | What is **verified** | What is **not** yet verified |
|---|---|---|---|
| Guéranger, *Explication des prières de la sainte messe* | [1885 second-edition online French transcription](https://www.domgueranger.net/explication-des-prieres-de-la-sainte-messe-2/) | French source passages for Memento, Hanc igitur, Quam oblationem, Supra quae, Supplices | Comparison with original paper pages, autograph of the lectures, accuracy of stenographic notes |
| St Alphonsus, *Short Explanation of the Prayers of Mass* | [1887 Grimm-edited English Centenary edition vol. VI](https://en.wikisource.org/wiki/The_Complete_Ascetical_Works_of_St._Alphonsus/Volume_6/The_Sacrifice_of_Jesus_Christ/Short_Explanation_of_the_Prayers_of_Mass) and [1887 edition notice](https://en.wikisource.org/wiki/The_Complete_Ascetical_Works_of_St._Alphonsus/Volume_6/The_Sacrifice_of_Jesus_Christ) | Accessible English passage and editor's historical source uncertainty | Complete original Italian and French source collation (printed p.46 / scan 48 of English edition now visually confirmed; no Italian autograph checked) |
| Nicholas Gihr, *The Holy Sacrifice of the Mass* | [1902 English translation/OCR](https://archive.org/stream/holysacrificeofm00gihriala/holysacrificeofm00gihriala_djvu.txt), §61 pp.658–660 | Accessible OCR at internally marked printed pages for Abel, Abraham and Melchisedech | Original German sixth edition, original paper-page image proof and OCR character-by-character certification |
| St Thomas Aquinas, *Summa Theologiae* III q.83 a.4 ad 7–9 | [Parallel Latin and English edition/transcription](https://www.logicmuseum.com/wiki/Authors/Thomas_Aquinas/Summa_Theologiae/Part_III/Q83) | Latin and translated passages distinguish fruitful consecration, devotion of patriarchs and angel interpretations | Critical Latin manuscript/edition collation |

**Bibliographic correction of substance.** St Alphonsus died in 1787; Guéranger was born in 1805. Hence the unnamed **French source that Alphonsus himself cites** cannot be Guéranger, even though their Christological interpretations resemble one another. The **1887 English editor's notice** considers *L'Idée du Sacerdoce et du Sacrifice de Jésus-Christ* associated with de Condren / an Oratorian edition and openly says the source identification is uncertain. This is a **source-provenance research lead**, not an approved canonical author/witness ID. Do not import it as a proven source, nor silently assert independence of two parallel readings.

The Guéranger volume's own foreword calls its material notes collected from conferences and cautions that unfaithful note-taking may account for inaccuracies. Attribute as *Guéranger conference notes (1885 ed.)*, not demonstrably autograph verbatim text.

## Six candidate consolidations — verified in accessible historical text

| Two source IDs (both preserved) | Canon cue | Source-level disposition |
|---|---|---|
| `VER-032 / I062` (Alphonsus) | `AO.SM.C0187` | One account of two interpretations of the holy Angel. Created angel vs Christ remains an **attributed variant**, not an editor's dogmatic ruling |
| `VER-045 / I006` (Guéranger) | `AO.SM.C0156` | Faith and devotion of the attendants: one concise explanation, separate source lineage retained |
| `VER-049 / I016` (Guéranger) | `AO.SM.C0164` | One word-level *rationabilem* explanation; preserve separate cross gestures and later Eucharistic change |
| `VER-057 / I054` (Gihr) | `AO.SM.C0186` | Abel's faith and innocent blood form one subpassage; heavenly fire is **explicit conjecture** |
| `VER-058 / I056` (Gihr) | `AO.SM.C0186` | Abraham's offering typology; **Isaac was not killed** |
| `VER-059 / I058` (Gihr) | `AO.SM.C0186` | Melchisedech priestly typology; do **not** claim Genesis 14 says bread and wine were ritually sacrificed |

These are comparisons of original/translated editions as online transcriptions. **Printed-page image collations completed: one of six — St Alphonsus printed p.46 / scan 48.** No original claim ID was deleted, merged or registered again.

## Five interpretative dossiers

1. **`AO.CANON.10` — *Supplices te rogamus*.** Guéranger directly identifies the Angel as Christ, Aquinas gives both readings, and the 1887 Alphonsus translation prefers the angel's prayer-presentation interpretation. The prayer is not a physical removal of the Body of Christ or sacramental species.
2. **`AO.CANON.09` — *Supra quae*.** The prayer's comparison with Abel, Abraham and Melchisedech regards the offerers' devotion, not parity with Christ's sacrifice. Each biblical type stays distinct.
3. **`AO.CANON.05` — *Quam oblationem*.** The five words, spiritual/mystical readings and associated crosses are separate layers. Aquinas's *ut nobis* reading is not identical to Guéranger's lexical gloss.
4. **`AO.CANON.04` — *Hanc igitur*.** The extended hands may be contemplated using Old Testament sacrificial parallels, but historical direct derivation is **unproved**; the rubrical action still requires its independent priest-action record.
5. **`AO.CANON.07` — chalice consecration.** The received Roman form relates to several New Testament witnesses and tradition; it is not a verbatim quotation of one biblical verse. The 1962 Missal remains controlling.

## Actual bilingual writing delivered

[Eleven EN/FR cue-level drafts](../../data/learn/research/mystery-mass-canon-six-pair-five-issue-bilingual-drafts-20261015.v1.json): **six concise** explanatory texts and **five deeper** study texts. All eleven have been validated against the exact Latin cue source and their respective `AO.CANON.*` owner; the chalice formula correctly targets curated presentation card `AO.LIVECURATED.AO.CANON.07.2`.

The content is not a new standalone module, and no content was copied directly from the older texts. Each draft inherits the relevant existing entry in [the 14 Canon critical studies](../../data/learn/research/mystery-mass-roman-canon-14-critical-narrative-20261014.v1.json) and their older bilingual manuscripts. App editorial reviewers can adopt the new micro-commentary under those original owners if independently approved.

**New regression gate:** `tests/mystery-mass-canon-source-collation-and-bilingual-drafts.mjs`, added to the existing `.github/workflows/mystery-mass-editorial-inventory.yml`. Its assertions cover the six old ID pairs, five issue IDs, no text-publication permissions, eleven EN/FR bodies, live Latin substring / Canon block matches and the inherited 65-model card IDs. GitHub Actions is the final execution proof, not the act of adding a test file.

## Remaining narrow release work

- Check remaining Guéranger and Gihr printed pages, and separately verify the 1887 English editor's anonymous-French-source notice against its printed image; Alphonsus *Supplices* printed p.46 has already been visually certified.
- Investigate whether the earlier French model underlying Alphonsus can be identified *independently*; do not register de Condren, Quesnel or any other conjecture as confirmed.
- The **1962 rubrical event for `Hanc igitur` has been resolved**: already-published priest event `AO.RUB.C0161.01`, source cue `AO.SM.C0161`; independent behavioral/user-handset acceptance remains distinct. Do not create a duplicate. Recheck historical assertions about Gregory the Great before presenting them as fact.
- Resolve Source/Reference edition, witness, rights, and reliable deep links in the existing pipeline.
- Collate and proofread bilingual new text, check overlap with 44 pre-existing bilingual research dossiers and obtain in-app editorial approval. Do not change production `Mass` or publish `learn.mystery_mass` until those independent gates pass.

[Machine-readable six/five source record](../../data/learn/research/mystery-mass-six-pair-five-issue-text-collation-20261015.v1.json) · [Eleven EN/FR micro-explanations](../../data/learn/research/mystery-mass-canon-six-pair-five-issue-bilingual-drafts-20261015.v1.json).

## Phase E — existing 1962 action and in-app gated micro-commentary (15 Oct)

**Ritus servandus VIII.4 is now resolved against a visually inspected Latin PDF page:** [the Latin Ritus, PDF page 12](https://aomoi.net/odv/tlm/ritus_servandus_lat.pdf#page=12), corroborated by the printed-1962 Missal OCR witness. The celebrant extends both hands over the offerings with palms open towards the chalice and host at *Hanc igitur*, keeping them until *Per Christum, Dominum nostrum*, at which point he joins them. The printed original 1962 facsimile page itself is **not claimed visually collated**.

The published Mass registry **already** contains `AO.RUB.C0161.01` (`PRIEST`, `HANDS OVER OBLATIONS` on `AO.SM.C0161`), gated in `src/mass/reader-canon-published-rubrics.js`. The server warning bell (`AO.RUB.C0161.02`) is separate minister timing and must never be inferred as exactly synchronous from the prayer syllables. No new gesture code or Mass engine changes are necessary.

The eleven bilingual phrase interpretations have been **integrated only into the existing unpublished Mystery review route**, by adding `src/learn/mystery-mass-canon-precision-review.js` to `src/learn/mystery-mass-review.js`. Review route stays gated by `?mysteryReview=1`. Under Mass chronology, each affected Canon owner now has one native expandable section titled *Prayer phrases / Expressions de la prière*. Short reading shows its concise editorial candidates; detailed study additionally shows deeper author comparisons. The previous **44 bilingual study dossiers**, **14 Canon studies**, existing source IDs and biblical chronological journey are untouched. The review does not imply publication or replace the production 65–67 LIVE reader.

The new CI gate checks 11 compiled review records **byte-for-byte as values against** their original research JSON and the Latin cue/canonical owner mapping. The original-only scans still need attention:
- Gihr's **1902 scan** is identified at [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:The_holy_sacrifice_of_the_mass;_dogmatically,_liturgically_and_ascetically_explained_(IA_holysacrificeofm00gihriala).pdf), 788 image pages / 72MB. Target printed pp.658–660, but scan page offset was **not established**, and direct file retrieval failed.
- Guéranger's **1885 second edition** is catalogued as a scanned [KU Leuven original in Google Books](https://books.google.com/books/about/Explication_des_pri%C3%A8res_et_des_c%C3%A9r%C3%A9mo.html?id=7Dl_LJtRf78C); published contents place *Memento des vivants* at p.126 and *Quam oblationem* p.140. Individual original pages **not inspected**.
- St Alphonsus **1887 English Centenary volume VI** is [catalogued with scan download options](https://openlibrary.org/books/OL7036414M/The_complete_ascetical_works_of_St._Alphonsus); the exact passage is now **original printed p.46 / scan image 48, visually verified**; previous pp.56–57 locator is incorrect.

These are **three identified scanned editions, of which only the Alphonsus target page has been visually collated**. Source transcription comparisons remain six; independently visually inspected matching original author-book pair pages are **one of six**. The standalone Ritus's readable retypeset page is a genuine visual control for the liturgical rule but does not certify the separate six author passages.

Next work is therefore narrowly limited to the five remaining Guéranger/Gihr overlapping passage image collations and user/editorial acceptance of the gated English/French refinements. Do not restart the 422-claim audit.


## Phase F — exact printed-image correction (15 October, later pass)

**Significant error corrected:** the old `St Alphonsus / VER-032 / I062` locator of **printed pp.56–57** is false; those pages contain final post-Communion material and the Last Gospel. Direct inspection of the authentic original **1887 Benziger/Grimm Volume VI scan** establishes *Supplices te rogamus* on **printed p.46**, **DjVu image page 48**: [scanned and proofread page](https://en.wikisource.org/wiki/Page:Complete_ascetical_works_of_St_Alphonsus_v6.djvu/48), [original image](https://thumb.wikimedia.org/wikipedia/commons/thumb/4/49/Complete_ascetical_works_of_St_Alphonsus_v6.djvu/page48-1280px-Complete_ascetical_works_of_St_Alphonsus_v6.djvu.jpg). Both readings and the anonymous French-source attribution are visible on the paper page. This **certifies one of the six previously overlapping author-pair passages** against a printed-page image, not all six.

Related scanned pages were separately inspected or matched to the corresponding **printed pagination** (DjVu image number = printed p. +2):

| Topic | Printed page | Scanned page / checked content |
|---|---:|---|
| *Memento* and *Hanc igitur* opening | 40 | [42](https://en.wikisource.org/wiki/Page:Complete_ascetical_works_of_St_Alphonsus_v6.djvu/42) |
| *Hanc igitur* symbolic imposition and *Quam oblationem* opening | 41 | [43](https://en.wikisource.org/wiki/Page:Complete_ascetical_works_of_St_Alphonsus_v6.djvu/43) |
| Five adjectives including *rationabilem* | 42 | [44](https://en.wikisource.org/wiki/Page:Complete_ascetical_works_of_St_Alphonsus_v6.djvu/44) |
| Chalice formula: Luke, Matthew, Hebrews and tradition | 43 | [45](https://en.wikisource.org/wiki/Page:Complete_ascetical_works_of_St_Alphonsus_v6.djvu/45) |
| *pro multis* application | 44 | [46](https://en.wikisource.org/wiki/Page:Complete_ascetical_works_of_St_Alphonsus_v6.djvu/46) (page-level text, not separately image-verified) |
| *Supplices*, Angel, earlier French predecessor | 46 | [48](https://en.wikisource.org/wiki/Page:Complete_ascetical_works_of_St_Alphonsus_v6.djvu/48) |

**Status: 1/6 source overlap pairs verified by original printed-image inspection; 5/6 remain.** Guéranger's two and Gihr's three original page-image collations are still outstanding; catalogue or OCR links are not substitutes. The German and Italian originals also remain outside this narrow scan certification. All findings remain research-only; no theological or rights release gate changed.
