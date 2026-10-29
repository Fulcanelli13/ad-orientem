# Original printed novenas — ten exceptions resolved, five texts corrected

**29 October 2026 · Ad Orientem Prayer · original facsimile visual comparison**

This report follows [PR #1976](https://github.com/Fulcanelli13/ad-orientem/pull/1976): the initial four-PDF machine pass located all **72 English day-prayer bodies**, classifying 62 as high text-layer overlap and **ten** as partial. Unlike another URL/catalogue screen, this phase obtained and examined the **actual printed page images underlying all ten exceptions**, alongside the source PDF text and the existing app text.

Source files were downloaded in one bounded, free GitHub Actions job [40872727022](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40872727022), verified against previously recorded SHA-256 fingerprints and rendered as twenty-one 1800px source-page images, including the **extra printed page 205** that the earlier two-page window mistakenly omitted. The temporary PNGs are review aids, not permanent copies of whole books. Exact page references and decisions are retained in [original-print-ten-exception-resolution-20261029.v1.json](../../data/pray/original-print-ten-exception-resolution-20261029.v1.json).

## Resolution

| Novena | Day(s) | Printed source pages | Result |
| --- | --- | --- | --- |
| Hammer: Annunciation | 1, 3, 4, 6 | p97, p101, p103, p107 | **Four OCR/layout false positives**; drop capitals and hyphenated words cause the below-80% shingle scores. No verified prayer-word variation; **no edits**. |
| Hammer: Seven Sorrows | 3 | p121 | **One OCR/layout false positive**; decorative initial and divided words. **No edit**. |
| Redemptorist Holy Souls | **1** | pp199–200 | Source edition genuinely prints “how great would be my suffering,” “I wish to die,” “the blessed souls that suffer.” The N3 text paraphrased these. **Corrected English**. |
| Redemptorist Holy Souls | **2** | pp202–203 | Print opens “who have spent on earth so many years,” and uses “employ the time remaining to me in Thy love and service.” **Corrected English**. |
| Redemptorist Holy Souls | **4** | pp204–205 | Print says “I wish to die,” “all the holy souls,” “with all their heart” and “come to their assistance.” Earlier auto-window was PDF indices **202–203**, overlooking **204** (printed 205), so the page range is now corrected to **203–204**. **Corrected English and editorial French**. |
| Redemptorist Holy Souls | **6** | pp206–207 | Print says “O supreme Good” and “I wish to die,” not “God”/“I will rather die.” **Corrected English**. |
| Redemptorist Holy Souls | **9** | pp209–210 | Print says “I wish rather to die,” not “I promise rather to die.” **Corrected English and editorial French**. |

The sole printed text source for Holy Souls remains the 1894-copyright Redemptorist *Manual of the Purgatorian Society*, in a scanned edition bearing the **1907 imprimatur**. [Original printed source PDF](https://www.catholickingdom.com/s_Library/Books/M/Manual_of_the_Purgatorian_Society_OCR_CK.pdf). Do **not** claim that this physical scan was itself printed in 1894. The Hammer source remains the pictured 1909 book with an OCR-backed reading layer. [Hammer original PDF](https://www.catholickingdom.com/s_Library/Books/M/Mary_Help_of_Christians_HAMMER_OCR_CK.pdf).

### Ownership and translation discipline

The **N3 historical donor corpus** is unchanged. A clearly limited [five-day print alignment overlay](../../src/pray/novena-holy-souls-print-corrections.v1.js) changes the **existing Novena V4 English reader** only on days 1, 2, 4, 6 and 9, and refreshes editorial French **days 4 and 9** where printed “wish” is not equivalent to the previous French “promise.” French has **not** been certified against any historical French printed witness. The five Hammer day prayers and all other original English Novena bodies remain unchanged.

The [source-integrity contract](../../tests/pray-original-print-ten-exception-resolution.mjs) explicitly permits only those five different English bodies, verifies the affected printed page ranges, protects the other **67** day bodies and preserves **zero** claims of complete original-edition certification.

### What remains, without creating another research catalogue

- **Ten exception dispositions completed:** five false-positive OCR flags, five true print wording variants with targeted English fixes.
- **Four other Holy Souls prayers (3, 5, 7 and 8):** not modified. Their high extracted-text overlap does not by itself prove complete visual line-by-line identity.
- **Remaining 62 high-overlap records:** require final comprehensive page-image collation if we want full historical print certificates; this phase did **not** certify them.
- **Callan first-impression discrepancy:** original 1925 copyright versus scan containing post-1933 content remains explicitly held.
- **Indulgences and conditions:** all contemporary grants remain separate; no historical 1909 or 1907 indulgence notice is imported as a current concession.

Next: a **single, full-volume editorial proof campaign** over the 62 high-matching prayer bodies, grouping by the four original printed books. We should not restart page discovery or create tiny per-prayer review PRs.
