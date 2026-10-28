# Prayer B25 — Holy Face novena: complete historical digital-English release
**29 October 2026 · Janvier/Bennett 1887 · source-owned supplement to existing Novenas reader**

## Admission and scope
A complete nine-day original-language English digital transcription of the historical Holy Face novena, associated with Abbé Pierre-Désiré Janvier, translated by Mrs A.-R. Bennett, *Manual of the Archconfraternity of the Holy Face* (Tours, 1887), printed pp.108–142. Unlike B23's outline, each day's entire text now exists in the repository: the opening invocation, full meditation with three numbered reflections, distinct act, virtue to practice, spiritual bouquet, and concluding aspirations and collect.

| Measure | B25 completion |
| --- | --- |
| Historical meditation days extracted and stored | 9 / 9 |
| Complete digital-English daily readings | 9 / 9 |
| Day-specific acts, virtues, bouquets and closing prayers | 9 / 9 |
| English witness source HTML SHA-256 | `d999ceff56b953ff3416cefa36d8fd252ebdf12eb5c630b9aed4004a5e0bb642` |
| Frozen original Novena targets | **16 / 16 unchanged** |
| Independent photographic original 1887 print collation | **NOT DONE**, disclosed |
| Original historical French and Latin prayer versions | **NOT VERIFIED**, not generated |
| Old indulgences represented as current | 0 |
| Modern appendices imported | 0 |

Source acquisition:
- Full original-language online witness: https://www.martinians.org/novena-to-the-holy-face
- Independent reprint to collate further: https://sjmoftheholyface.org/wp-content/uploads/2024/01/Original-Novena-To-the-Holy-Face.pdf
- Original book bibliography: https://holyfacechapel.org/manual-of-the-archconfraternity-of-the-holy-face-title-page/

The source was acquired through the free, read-only workflow with a strict nine-day validation pass and placed permanently in `data/pray/research/pray-b25-holy-face-janvier-1887-nine-full-english-days.v1.json` with the remote HTML checksum. It is also projected *verbatim* to the offline-capable release module `src/pray/holy-face-janvier-1887-b25.js`. The temporary one-day GitHub Actions artifact is a redundant capture, not the sole preservation copy.

**Important:** The complete online digital transcription is not the same thing as line-by-line certification against photographed pages from the 1887 original. No such certification is claimed. Its historical English text may contain transcription variations still requiring an independent editorial collation.

## One existing Novena reader
The established Novenas overview continues to contain exactly **16 bilingual canonical programmes**. It also has a separate additional historical-English group showing this Holy Face novena. The selection opens the same Novenas reader and its existing Simple and Guided controls, days 1–9, historic-source disclosure and navigation. No parallel app, new top-level Prayer family, external runtime source fetching or service bill.

- Simple shows the **entire daily English source** with original opening, reflection texts, act, virtue, bouquet, aspirations and collect.
- Guided uses existing **Prepare → Historical prayer → Close** stages; Historical prayer displays *exactly the same entire daily text*, not an editorial summary. The terminal Close stage adds no extra claimed historical prayers.
- The French interface may display editorial navigation and guided instruction in French, but the prayer body is held with an explicit **“Afficher le témoin anglais”** control; French text is not silently generated or replaced.
- Historical 1887 English source status and uncollated facsimile qualification are shown under Sources & edition. No historic indulgence presented as currently valid.

## 1962 Calendar compatibility
The nine days traditionally precede **Shrove Tuesday**, Easter minus 47 days. The day 1–9 window is Easter minus 56 through minus 48 days, ending on the Monday before Shrove Tuesday. This uses the **existing Calendar Intelligence** `EASTER_OFFSET` computation; it does not hardcode 2022 dates and is optional to start elsewhere. The original Roman 1962 calendar and 16 existing Novena date owners are unchanged.

## Tests and gate
- `tests/pray-b25-holy-face-full-novena.mjs` compares every published text against the permanently preserved original English witness, checks nine complete day bodies, 1887 scan/locale qualifications, original sixteen, and movable Shrove Tuesday.
- `test:pray-novenas` picks up that test; `test:pray-owner` runs the Novena suite via its pre-existing dependency.
- `tests/pray-all-modules-mobile.mjs` covers actual touch navigation from the sixteen Novena overview into Holy Face, all nine selectable days, full day 1 and day 9 English meditations, source closing prayers, 320px and 390px screenshots, overflow and return navigation.
- The existing Prayer family routes, sacred hymn data, Mass, liturgical calendar, and other Novenas are not modified.

## Editorial holds
1. Compare every imported 1887 paragraph against original photographed manual pages 108–142 when accessible.
2. Compare the English transcription with the independent 2024 PDF reprint for any omitted words, spelling, punctuation and day headings. Reprints are not original photographs.
3. Seek a rights-cleared, independently verified French historical version if needed. Do not produce AI-authored French prayer prose and mislabel it historical.
4. Keep modern League of St Martin/2022 consecration and other devotional additions out of Janvier's original nine days.

B25 is a **full digital-English historical reader with disclosed edition limits**, not a verified-print critical edition.
