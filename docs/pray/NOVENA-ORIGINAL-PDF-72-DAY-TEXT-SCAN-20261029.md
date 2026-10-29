# Prayer original printed-PDF scan — one-pass 72-day result

**29 October 2026.** This is a distinct execution step after PR #1973: historical **PDF files were actually downloaded and processed**, rather than only assigning novena headings to books or reusing standalone online transcriptions. They were not archived into the repository.

## Measured source coverage

The free [GitHub Actions source scan](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40869741142) acquired **four** historical PDF files from Wikimedia Commons, Internet Archive and Catholic Kingdom and compared **all 72** existing English day-prayer bodies to their extracted printed-page text layer. All four source SHA-256 fingerprints and **72 individual 0-based PDF page-window indices** are retained in [the immutable result](../../data/pray/original-pdf-72-day-text-layer-screen-20261029.v1.json).

| Source book | App day prayers | High PDF text-layer overlap | Partial PDF overlap | Source caveat |
| --- | ---: | ---: | ---: | --- |
| Callan/McHugh, *Blessed Be God* (nominal 1925 copyright) | 18 | 18 | 0 | Scan contains material dated after 1933; cannot certify it as a 1925 first impression |
| Moran, *The Catholic Prayer Book* (1883) | 18 | 18 | 0 | Alternate **original printed PDF contains pages 566–567** missing in the Wikisource DjVu image index |
| Hammer, *Mary, Help of Christians* (1909) | 27 | **22** | **5** | Internet Archive image-only PDF had no accessible prayer text layer; [OCR-backed facsimile scan](https://www.catholickingdom.com/s_Library/Books/M/Mary_Help_of_Christians_HAMMER_OCR_CK.pdf) recovered all 27 candidates |
| Redemptorist *Manual of the Purgatorian Society* (1894 copyright; 1907 imprimatur copy) | 9 | **4** | **5** | First original scanned historical source identified in previous phase; wording/OCR exceptions |
| **Total** | **72** | **62** | **10** | **0** original-print full-facsimile certificates |

**Method:** `pdftotext` from the actual downloaded PDF files, then normalized contiguous four-word matches over two adjacent PDF pages. A match of 80% or more is labelled **high**. This is a strong source-location and textual-identity screen; it **does not** prove every word, paragraph, punctuation mark or printed edition against the visual images. Zero prayers were promoted to full printed-page certification in this PR. No prayer words were changed.

## Four exact source files acquired (not preserved as paid assets)

| Scanned work | PDF pages | Extractable text pages | Original PDF SHA-256 |
| --- | ---: | ---: | --- |
| Callan | 810 | 789 | `e52be0aae5a5739855d6e9d23abc8b10e6852b8d747ca784687c618b5d31a320` |
| Moran | 641 | 635 | `7c5435a46fd95ef3269dde444b7543f9715853167641319f4da841a239e18302` |
| Hammer | 522 | 488 | `97d00390027944d6c4bfd7b5a733dd79dbc7781bd6ac52d76f0e0bc86d296afb` |
| Redemptorist Holy Souls | 256 | 253 | `3739d066b2ac6de5b31c73242552ad3726a05aa02fe5f6babf8e04155952c113` |

The workflow [`tools/pray/scan-original-print-pages.mjs`](../../tools/pray/scan-original-print-pages.mjs) is reproducible without paying or storing originals permanently. No bulk OCR computation was performed. Only preexisting searchable PDF/OCR-backed text layers were read.

### Visually inspected original pages

- **Moran:** scanned PDF page index **578**, physically printed p **566**, visibly shows the beginning of the Immaculate Conception novena, including preparatory prayers. **Directly resolves the absent pp566–567 in the separate Wikisource index**. [Alternate complete original scan](https://archive.org/download/TheCatholicPrayerBook1883/TheCatholicPrayerBook1883.pdf).
- **Redemptorist:** scanned PDF index **198**, physically printed p **199**, visibly shows the Novena for the Holy Souls and first proper prayer. [Full historical PDF](https://www.catholickingdom.com/s_Library/Books/M/Manual_of_the_Purgatorian_Society_OCR_CK.pdf).
- **Callan:** scanned PDF index **344**, printed p **295**, shows the historical novena prayerbook type, but **not** a full visual comparison of the Pentecost body.
- **Hammer:** scanned PDF index **100** shows an illustrated plate (Flight into Egypt) in the correct bound volume; it demonstrates a photographed source but **does not** visually certify the nearby Annunciation day-one prayer. Do not count this as a completed prayer-page visual match.

## Exact ten-page exception queue

| Programme | Days | Why |
| --- | --- | --- |
| Annunciation | **1, 3, 4, 6** | Four OCR-backed matches at 66–79.7% |
| Seven Sorrows | **3** | One OCR-backed match at 70.45% |
| Holy Souls | **1, 2, 4, 6, 9** | Five source-PDF text-layer matches at 66–79% |

These ten require edition/wording reconciliation before any textual correction. An OCR mismatch **must not be automatically written into the canonical Prayer text**, especially where the existing digital-transcription source is fully legible. The full per-day values and page window IDs are in the permanent result.

**Related edition warnings retained:** a different Moran Wikisource scan is missing **p566–567**; a later Callan scan cannot be labelled a certified 1925 first edition. The old Holy Souls uncertainty is already resolved to the actual Redemptorist 1894/1907 printed source, which is not automatically the same recension as another Alphonsus extract.

## Next production gate

The release only adds the bounded original-source matcher, reproducible open-source CI process, permanent 72-entry evidence report and an invariance test; it **does not** change reader text, navigation, source owners, translation, or grants. The next step is a single **image-versus-text editorial proof pass** on exactly these source-page windows, prioritizing the ten partial exceptions and the three visually uninspected cohorts; certify a day only when its whole printed prayer is visually collated. French editorial bodies and historical/current indulgences remain separately held. Keep the process bulk and zero-cost, not serial one-prayer PRs.
