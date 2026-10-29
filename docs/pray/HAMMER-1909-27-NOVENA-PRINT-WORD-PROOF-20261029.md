# Hammer (1909): all 27 original novena daily prayers visually checked

**29 October 2026 — single remaining 21-body review campaign, Ad Orientem Prayer**

This completes original-page word-sequence verification of **all 27 proper English daily prayers** from Bonaventure Hammer's *Mary, Help of Christians* (1909): Annunciation (nine), Seven Sorrows (nine) and Assumption (nine). Six had already been checked; in this pass the **remaining 21 full proper day-prayer bodies** were compared directly with photographed pages from the already acquired source, **not** inferred from PDF text similarity.

The source is the [original public-domain printed-page scan with an OCR-backed text layer](https://www.catholickingdom.com/s_Library/Books/M/Mary_Help_of_Christians_HAMMER_OCR_CK.pdf), pinned in the [four-book PDF SHA register](../../data/pray/original-pdf-72-day-text-layer-screen-20261029.v1.json). The existing [single original-page review package](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40881455788/artifacts/12900457415) contains the photographs. The five initial low-OCR-score cases also used the separately captured [ten-exception pages](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40872727022). Both original-file source, SHA-256 and conversion tools remain permanently recorded; temporary GitHub image artifacts are not permanent storage.

## All 21 newly completed body proofs

PDF page identifiers below are zero-based and refer to this **specific hash-pinned scanned copy**. Printed page numbers are the numbers actually printed on each photographed page, not a blind offset conversion.

| Novena | Day | Printed page(s) | PDF page index/indices | Visual disposition |
| --- | ---: | --- | --- | --- |
| Annunciation | 1 | 97 | 101 | Entire prayer confirmed; ornate initial |
| Annunciation | 2 | 99 | 103 | Entire prayer confirmed |
| Annunciation | 3 | 101 | 105 | Entire prayer confirmed |
| Annunciation | 4 | 103 | 107 | Entire prayer confirmed |
| Annunciation | 5 | 105 | 109 | Entire prayer confirmed |
| Annunciation | 6 | 107–108 | 111–112 | Prayer genuinely spans two pages; both confirmed |
| Annunciation | 7 | 109 | 113 | Entire prayer confirmed |
| Annunciation | 9 | 114 | 119 | Entire prayer confirmed |
| Seven Sorrows | 1 | 117 | 122 | Entire prayer confirmed |
| Seven Sorrows | 2 | 120 | 125 | Entire prayer confirmed |
| Seven Sorrows | 3 | 121 | 126 | Entire prayer confirmed |
| Seven Sorrows | 4 | 123 | 128 | Entire prayer confirmed |
| Seven Sorrows | 5 | 125 | 130 | Entire prayer confirmed; **day boundary checked** |
| Seven Sorrows | 8 | 130 | 136 | Entire prayer confirmed |
| Seven Sorrows | 9 | 132 | 138 | Entire prayer confirmed |
| Assumption | 2 | 137 | 143 | Entire prayer confirmed |
| Assumption | 3 | 139 | 145 | Entire prayer confirmed |
| Assumption | 4 | 141 | 147 | Entire prayer confirmed |
| Assumption | 6 | 145 | 152 | Entire prayer confirmed |
| Assumption | 7 | 147 | 154 | Entire prayer confirmed |
| Assumption | 9 | 150 | 157 | Entire prayer confirmed |

Six previously verified Hammer prayers retain their positive proof states: Annunciation day 8, Seven Sorrows days 6 and 7, and Assumption days 1, 5 and 8. Adding the 21 completes the **Hammer proper-prayer body cohort: 27/27**.

### Specific editorial findings

1. **Five previous OCR exceptions resolved to complete proofs.** Annunciation days 1, 3, 4 and 6, and Seven Sorrows day 3 formerly had partial four-word-shingle scores because of illuminated initial capitals, line-break hyphenation and text-layer artifacts. The actual printed prayers match the app word sequence. Their earlier OCR-only dispositions are retained as provenance and upgraded only after the full prayer-image check.
2. **Annunciation day six crosses a printed page boundary.** The prayer starts on printed p.107 with “Holiest Mary” and continues on p.108, ending with the petition to save one's soul. Both photographed pages are required to verify the entire proper prayer. The older two-page window alone did not establish this.
3. **Seven Sorrows day five belongs to printed p.125, not p.126.** The next p.126 carries the sixth day's “martyrdom” prayer, which should not be mistakenly attached to day five. Verified text on p.125 concerns the meeting of Jesus carrying His cross and asks for patience and fortitude.
4. **No historical prayer wording change was required.** All 21 compared proper English word sequences match the accessible Hammer source after allowable capitalization, punctuation and printed hyphenation normalization. The code and translations remain untouched.
5. **Devotional components remain distinct.** Hammer's preparatory prayer, each day's meditation and practice, the Prayer of the Church, Litany of Loreto, Hail Mary and ejaculatory prayer must remain separate reader elements. Verifying the English *proper daily prayer body* does not separately authenticate their complete texts or order.

## Corpus-wide status

| Original book cohort | Whole proper English day bodies visually compared | Still held |
| --- | ---: | ---: |
| Callan/McHugh accessible later printing | 18 / 18 | 0 |
| Moran 1883 | 18 / 18 | 0 |
| **Hammer 1909** | **27 / 27** | **0** |
| Redemptorist *Manual of the Purgatorian Society* | 2 / 9 | 7 |
| **Total** | **65 / 72** | **7** |

All seven remaining holds belong to **Holy Souls days 1, 2, 4, 5, 6, 8 and 9**, whose historical wording was corrected from source-page photographs in the previous two PRs but whose entire proper body has not yet received a formal start-to-finish visual sign-off. Those records remain explicitly held.

### Certification boundary

* Word-sequence proof of one proper English prayer body is **not** a letter-for-letter diplomatic facsimile transcription, a verified first impression of the source book, full certification of all communal/preparatory devotional texts, historical French translation certification, or a valid contemporary indulgence grant and its conditions.
* The Callan scanned physical copy contains material later than 1933 despite original 1925 copyright. No original first-impression certificate is claimed.
* No new current indulgence claim is added based on an old 1909 printed indulgence notation.
* Only the existing [72-row, SHA-pinned day-by-day proof register](../../data/pray/original-print-72-body-visual-proof-20261029.v1.json) and source regression tests have changed in this PR; there is **no modification to prayer text, guided reader layout, completion tracking or French editorial translation**.

**Next editorial stage:** directly inspect and sign off the seven corrected Redemptorist Holy Souls proper day prayers as complete image-backed word sequences, resolving any new discrepancy before declaring 72/72 proper English bodies complete. Only then tackle separate complete devotions, historical original French, physical edition identity and current indulgences as distinct workstreams.
