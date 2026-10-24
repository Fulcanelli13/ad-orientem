# Pitrè 1900 — original-edition acquisition and 1881 source dependence

**Research date:** 24 October 2026. **Purpose:** protect and advance primary historical-source acquisition, *without* inventing observations when the original text is inaccessible.

## Source-state finding

The existing Pitrè 1900 working register, `pitre-1900-feste-patronali-original-edition-ocr-actions-wave01.v1.json`, has **129/129** source-located action/details, spanning seven main feast families and 14 named localities; these were read from the Internet Archive OCR during the prior research pass. The previous 71-pair comparisons and 47 individual exception reviews already cover all 129. Repeating those action comparisons would not add new historical evidence.

This session checked alternative original-1900 and original-1881 bibliographic witnesses:

1. [Pitrè 1900, original Michigan scan at Internet Archive](https://archive.org/details/afm3499.0021.001.umich.edu); its full OCR endpoint could not be fetched in the current session.
2. [Wikimedia public-domain scan of the same Michigan volume](https://commons.wikimedia.org/wiki/File:Biblioteca_delle_tradizioni_popolari_siciliane_(IA_afm3499.0021.001.umich.edu).pdf): approximately 632 scanned PDF pages / 21.7MB, exceeding this session's web reader. No direct visual page check completed.
3. [1900 Carlo Clausen edition, Google Books](https://books.google.com/books/about/Feste_patronali_in_Sicilia_descritte_da.html?id=RvGBAAAAMAAJ): source metadata and table-of-contents anchors visible; direct plain-text/complete PDF access returned denial and EPUB access requested CAPTCHA.
4. [Pitrè, *Spettacoli e feste popolari siciliane*, 1881, Austrian National Library copy](https://books.google.com/books/about/Spettacoli_e_feste_popolari_siciliane.html?id=b2UlhR9tqb8C), Google-digitized 2024. **Original first-edition holding identified, main text not accessed**.
5. [1881 work, independent Michigan digitization of same textual work](https://books.google.com/books/about/Spettacoli_e_feste_popolari_siciliane_de.html?id=HmGBAAAAMAAJ). Again, a second *scan* is **not** a second historical author or independent act of observation.
6. A bibliographic notice in *Archivio storico messinese* identifies Pitrè, [*Delle feste patronali in Sicilia*](https://upload.wikimedia.org/wikipedia/commons/4/4c/Archivio_storico_messinese_%28IA_archiviostoricom08unse%29.pdf), *Archivio per lo studio delle tradizioni popolari* XIX (1900), pp. 3–17 and 145–168. The notice is not a direct reading of this separately printed article, and this same-author precursor cannot serve as independent testimony merely through another imprint.

The 1881 original's Google Books contents show **“Santa Lucia” at printed page 424**. That is a high-priority comparison for the 1900 book's St Lucy May-bird-release historical description (existing `PIT1900-IT-083`, where the original author recalls discussing it in 1881). It must **not** be counted as an independent corroborating witness, even if the texts match. Older sources quoted within the 1900 work (1641 Catania history, 1834 illustration, the 1899 Sebastian Crescimanno work and account attributed to G. Russo) likewise remain unverified until directly read.

## New nonadditive machine-readable evidence gate

`data/customs/master/pitre-1900-129-original-witness-facsimile-and-1881-dependency-gates.v1.json` preserves all **129 stable original source IDs**, exact original OCR line numbers, localities, feasts, action texts, and classification. Each row explicitly holds printed-facsimile verification, historical-author independence, 1881 cross-text checks, official 1962 Roman Ritual text approval, distinct-custom certification and publication at **false**.

| Verification tier | Existing 1900 source rows | Basis |
| --- | ---: | --- |
| P0 source-critical | **25** | Folk-supernatural claims, unverified blessing/ministerial authorization, enacted sacred gestures, explicit predecessor-author citations |
| P1 context/date | **17** | Historical dates and geographic/feast variants |
| P2 standard facsimile | **87** | Other source-located descriptions still lacking original printed scan confirmation |
| **Total** | **129** | **0 new source rows** |

This is **not a second identity review**; the 71/47 identity reconciliation remains the sole prior action-relation review. It is a *source access and textual dependence* work queue.

## Untouched printed chapter acquisition targets

Three specifically identified Google Books contents/illustration anchors in the **original 1900 volume** remain outside the seven earlier sampled feast chapters: *St Rosalia/Palermo procession* (around printed p.3), *Saints Cosmas and Damian procession* (p.81) and *Assumption at Piazza Armerina* (p.557). These are **index-only anchors, not new chapter text or verified source detail counts**.

The next extraction batch must first obtain the actual paginated text (ideally public-domain source image and OCR together) and then add **100–200 new, locatable, genuinely unindexed action descriptions** across untouched chapters; source repeated in 1881/1900 and posthumous Pitrè works must be linked as same-author dependence, not doubled as separate testimony.

## Honest status and publication gate

- Combined research master: **3,114** non-deduplicated source/detail rows, unchanged.
- Original Pitrè 1900 registered first wave: **129** existing rows, already covered by earlier 71 relations + 47 exception reviews.
- Fresh Pitrè 1900/1881 original-text detail extraction **this turn: 0**, because full source text was not accessible.
- Six access routes (1900 book scan/reprints, 1881 book scans, 1900 serial notice) are **not** six independent source witnesses.
- Original page images newly checked: **0**. Original 1881 chapter passages read: **0**.
- New independently certified historical testimonies or distinct customs: **0**.
- No Calendar, application, prayers, ritual text or interface modification.

This research finding and access queue are committed on **draft PR #1572** and protected with regression assertions to prevent false source-count inflation. If original scan access becomes available, prioritize actual chapter extraction over additional rounds of lexical comparison.
