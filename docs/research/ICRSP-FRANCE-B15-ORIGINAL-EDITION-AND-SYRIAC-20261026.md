# ICRSP France — Batch 15: original-language Syriac located; original printed page certification still open

**26 October 2026** · [Issue #1665](https://github.com/Fulcanelli13/ad-orientem/issues/1665) · [draft PR #1666](https://github.com/Fulcanelli13/ad-orientem/pull/1666).

## Decisive upgrade: 3/3 original-language Syriac text sections directly inspected

The previous [B14 claims](../research/ICRSP-FRANCE-B14-GUERANGER-APHRAHAT-20261026.md) had identified Aphrahat, *Demonstrations* **VIII.11, XXI.14, XXI.15** in the historical English translation, while the original Syriac remained uninspected.

An explicit original-language witness is now located in the **Digital Syriac Corpus**, which publishes **Syriac TEI text based on Jean Parisot's 1894 edition**, *Aphraatis Sapientis Persae Demonstrationes* (*Patrologia Syriaca* I.1). The Digital Syriac Corpus's electronically encoded text is distributed under **CC BY 4.0**, while the underlying old Syriac source is public domain. Critically, the project labels its TEI text **Uncorrected Transcription**. The individual original printed Parisot pages, column numbers, copy-specific variants, and translations have **not been critically checked**.

Two exact versioned XML files were read from [srophe/syriac-corpus](https://github.com/srophe/syriac-corpus) to establish genuine original-language presence rather than just finding an index or claiming to have seen a printed book.

| Witness | Digital original-language location | Concrete checks performed | Still blocked |
| --- | --- | --- | --- |
| Aphrahat, **VIII.11** | [Demonstration 8](https://syriaccorpus.org/8) · [TEI 8.xml](https://github.com/srophe/syriac-corpus/blob/main/data/tei/8.xml), section n=11, source blob `19718f295a3ab2994d24b5368e8cc02d32ac1049` | Section exists, 322 Syriac-script chars; contains written forms corresponding to **Elijah**, **Elisha**, and **widow**; consistent with the English account of two independently raised sons. | Original Parisot print pagination/wording, full philological translation and variant check |
| Aphrahat, **XXI.14** | [Demonstration 21](https://syriaccorpus.org/21) · [TEI 21.xml](https://github.com/srophe/syriac-corpus/blob/main/data/tei/21.xml), section n=14, source blob `a6f6c952b56d525812bb10006596845d4f7b7518` | Section exists, 388 Syriac-script chars; contains **Elijah**, **Jesus**, **Lazarus**; direct source-language basis for the Elijah–Christ analogue already observed in the English edition. | Critical printed-edition collation; this still does not turn 1 Kings 17 into a direct quotation or prophecy specifically of John 11 |
| Aphrahat, **XXI.15** | Same [TEI 21.xml](https://github.com/srophe/syriac-corpus/blob/main/data/tei/21.xml), section n=15 | Section exists, 411 Syriac-script chars; names **Elisha** and **Jesus**, but the exact Lazarus word is not in this section. The text's Elisha-bones witness must remain a different episode from Elisha's restoration of the Shunammite boy. | Original print, philological verse/context check, and direct comparison with correct Old Testament episode |

**Do not inflate this achievement:** locating original-language text by stable source-section boundary and distinctive names is a meaningful original-language **witness inspection**, *not* full source-critical collation, complete direct Syriac-to-English retranslation, print-page verification, attribution adjudication, or publication approval. Digital text was read as source evidence; no full Syriac passages were copied into Ad Orientem runtime.

[Syri.ac's author/work bibliography](https://syri.ac/aphrahat) and [the bibliographic authority record](https://syriaca.org/cbss/I27ZHFZF) independently ground the Parisot 1894 edition. The [historic scanned edition](https://archive.org/details/bub_gb_Sy0vAAAAMAAJ) is discoverable, **but exact target image pages have not been visually inspected**. Therefore this batch has **three digital original-language sections checked, zero printed original page/column checks**.

## Fabricius: actual 1716 digitized volume located; page 27 still unverified

Guéranger's historical Susanna footnote **`In Danielem, pag. 27. Edit. Fabricii.`** is now associated with a verifiable **1716 actual original printed volume** in the Bavarian State Library's [digitization record, identifier `bsb11759163`](https://www.digitale-sammlungen.de/de/details/bsb11759163). The public catalogue describes *S. Hippolyti Episcopi Et Martyris Opera*, vol. I, Hamburg, Christian Liebezeit, 1716, 378 scans, Latin and Greek. A separate [Google Books digitized-volume catalogue](https://books.google.com/books/about/S_Hippolyti_episcopi_et_martyris_Opera.html?id=WdFhAAAAcAAJ) confirms the publication. The BSB record marks the digitization's image usage as noncommercial-only; check institutional conditions before distributing scanned pages.

**The PDF/scan viewer did not yield verified page-27 text in this batch.** The record proves a candidate original volume is accessible, not that page 27 contains Guéranger's exact Susanna/Church passage. Both printed page and historical editorial identification remain a specific research exception. Do not confuse the historical **Fabricius p. 27** with the distinct modern **Schmidt (2010) p. 25**.

## Guéranger: 1903 bibliographic edition is not a photographic 1903 text collation

The [diocesan bibliographic record](https://lasource.diocese85.org/index.php?id=6188&l_typdoc=&lvl=indexint_see&nb_per_page_custom=25&nbr_lignes=40&page=1) and [1903-labelled historical website transcription](https://www.domgueranger.net/lannee-liturgique-le-careme-historique-mystique-pratique-prieres/) confirm the 16th edition, H. Oudin, 1903, *Le Carême*. The [association's PDF links](https://www.domgueranger.net/annee-liturgique/?lang=fr) route Carême to the Internet Archive volume `lanneliturgiqu05gu`, **catalogued as 1911**. This **cannot substantiate a claim of 1903 printed-page verification**.

For the Naaman and Susanna Guéranger passages, source paragraph **cross-host wording** was checked in B14, but no 1903 printed images. Do not assign page numbers or assert printed text identity without a source scan. Post-Pentecost **Dom Lucien Fromage authorship correction** and the **Ambrose Latin Migne locus** have already been handled by the parallel B14 author/provenance work on this same research PR; B15 does not duplicate either.

## Release, provenance and next gates

- **3/3** intended Aphrahat original-language digital TEI sections read; original Syriac text with specific name anchors and section positions recorded.
- **0/3** corresponding printed Parisot 1894 page/column confirmations; **0/1** Fabricius original page 27 confirmations; **0/2** Guéranger original 1903 Lent day paragraph confirmations.
- **0** critical Syriac lexical/theological translations approved; **0** new app publications, 1962 Mass reader changes, original-commentary text imports or permissions granted by this research.
- Rights distinction: the digital Syriac TEI declares **CC BY 4.0**, an actual licence which is separate from philological certification, from the English translation's rights, from the Bavarian library's image reuse restrictions and from the app's independent publication gate.
- The evidence belongs under the existing Scripture-compendium correspondence owner [PR #1553](https://github.com/Fulcanelli13/ad-orientem/pull/1553) via a source-linked handoff, **not** a new chronology or parallel master.

Machine-readable document: `data/source-text/icrsp-france-b15-original-language-and-print-evidence.v1.json`. Regression: `tests/test_icrsp_b15_original_language_evidence.py`. Remain on draft PR #1666, with no production changes.
