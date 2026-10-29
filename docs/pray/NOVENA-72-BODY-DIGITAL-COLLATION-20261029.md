# Prayer: one-sweep 72-body digital collation results
**29 October 2026 · Ad Orientem · 16 programmes · PR #1966**

## Result — actual body comparison, not another ownership count

The dedicated read-only GitHub Actions run [40863452845](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40863452845) fetched **20 of 21** distinct digital source URLs, normalized their HTML and compared every actual English prayer body to its online witness with contiguous seven-word shingle overlap. The 21st, the Christ the King historical French PDF, was deliberately withheld for page-image verification.

| Component class | Number | Outcome |
| --- | ---: | --- |
| Distinct day prayers across eight nine-day source programmes | **72/72** | All at least **90% seven-word digital overlap** |
| Repeated nine-day prayer forms | **8** | 4 high overlap, 2 low due adapted English variants, 1 inaccessible PDF, 1 English text vs French-only source |
| Shared prayers / openings / short aspirations | **11** | 9 high, 1 partial closing, 1 too short for seven-word comparison |
| Total compared/classified | **91** | **85 high**, 1 partial, 2 low, 1 too short, 1 held PDF, 1 language-incomparable |

The 72 digital readings are **not** equivalent to 72 line-by-line comparison certificates against historical photographed book pages. The method establishes substantial overlap of the **app text** with the linked **digital transcription** only; it does not prove omission-free original print equivalence, historical French witnesses, present-day indulgences, or rights clearance. Historical spellings, punctuation, elisions, skipped passages and different editorial forms must be checked separately.

The complete permanent quantitative result (all 72 day scores, all 19 extra text components, **21 original HTML SHA-256 hashes**, all six exceptions) is [novena-digital-witness-bulk-result-20261029.v1.json](../../data/pray/novena-digital-witness-bulk-result-20261029.v1.json). The one-shot reproducible program is `tools/pray/bulk-digital-witness-overlap.mjs`. The CI ZIP contains fuller per-body digests but is temporary; the permanent summary in Git is the authoritative retained audit result.

### Concrete corrections from external comparison

- **St Anthony's Nine Tuesdays (1966):** the Franciscan pamphlet prints **modern-pronoun English** prayers. The app uses archaized traditional English. Text overlap was **39.33%**. It is therefore an *adaptation*, not an exact reproduction of the pamphlet; the source declaration in the existing novena corpus now says so. The pamphlet's historical indulgence instructions cannot alone certify a present-day concession; reproduction rights for the 1966 booklet remain unresolved. Do not reimport the copyrighted 1966 prose verbatim without clearance. [Pamphlet](https://www.pamphlets.info/Australia/acts1014/).
- **Immaculate Heart:** the app's English prayer retains significant passages from *The Raccolta* (1857) but changes wording and omits the separately headed Act of Praise. **51.72%** seven-word digital overlap: the original `SOURCE_LOCKED_TRADITIONAL_ENGLISH` assertion was too strong. Now qualified as **adapted traditional variant**. [1857 English witness](https://en.wikisource.org/wiki/The_Raccolta_%281857%29/Prayer_to_the_Immaculate_Heart_of_Mary).
- **Holy Souls:** each of the nine daily prayers matched its separate online day page at **95–100%**. The aggregated daily verse/intercessions showed **78.52%** overlap with day one and require section-level comparison before a claim of literal completeness. [Day 1](https://www.ecatholic2000.com/life/prayer108.shtml). The original printed edition is still unidentified.
- **Christ the King:** French PDF not fetched or examined; leave blocked. Do not read it as English source equivalence.
- **St Michael:** English repeat prayer compared to French webpage; numerical overlap intentionally not evaluated.
- **Assumption aspiration:** seven words cannot support a seven-word shingle result; manually check that small formula.

### Original print-book witnesses located — source selection, *not* print certification

- **Callan/McHugh, *Blessed Be God* (1925)**: the complete scanned **810-page** book exists at [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Blessedbegodcomp00call.pdf), associated with Wikisource's 1925 edition. This serves the Christmas and Pentecost cohorts (**18 day bodies**). Its large PDF must be page-targeted, not loaded wholesale into the Prayer reader.
- **Bonaventure Hammer, *Mary, Help of Christians* (1909)**: a dated scanned edition is at [Open Library](https://openlibrary.org/books/OL25896943M/Mary_help_of_Christians) (Internet Archive item `MaryHelpOfChristians`). It can support the **27 day bodies** and associated meditations/practices in Annunciation, Seven Sorrows and Assumption.
- **Patrick F. Moran, *The Catholic Prayer Book and Manual of Meditations* (1883)**: the original edition is listed at [Open Library](https://openlibrary.org/books/OL25895951M/The_Catholic_Prayer_Book_And_Manual_Of_Meditations) and at [Wikisource](https://en.wikisource.org/wiki/The_Catholic_Prayer_Book_and_Manual_of_Meditations). It covers St Joseph, Immaculate Conception and two repeat-form programmes (**18 day bodies, two repeat forms**).
- **Holy Souls**: the nine modern transcriptions are source-scoped but the source book's exact physical edition remains **unidentified**, so **9 day bodies** cannot be certified against that original.
  
This reduces the remaining print-review task to **three named scanned-book cohorts + Holy Souls edition identification + a finite repeat-form exception queue**, not 16 independent discovery projects.

### Next acceptance gate

Use print page numbers and available scans to compare all words in the **72 historical day prayers**, not only opening/closing anchors. Record edition/year, scan page, printed page, exact divergences and permitted normalization. Keep the ten additional shared opening/closing texts and eight repeat forms in their named original sections. Declare a full print certificate only on proof of actual page-by-page review; a digital score above 90% is not a certificate. No additional reader system, paywall, paid API, non-public prayer import or copyrighted reprint.

**Release impact:** Existing Prayer readers and the 72 historical day prayer texts are unchanged. Only two inaccurate source/provenance labels were corrected. No new current-indulgence grant has been asserted.
