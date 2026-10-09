# Prayer — Novena text collation, pass 5 (9 October 2026)

## Scope and evidence

This pass compares the *actual prayer text* (not merely its metadata) of **27 day-specific English prayers** with historical digital book transcriptions, and examines the **27 paired French translations** for the original-language/editorial distinction. It additionally maps **27 day-specific original meditations and practical resolutions** in the 1909 Hammer book that have not been reproduced in the current app. All 16 Novenas remain part of the single canonical corpus; the source-audit extension is [v2](../../data/pray/novena-source-review.v2.json), an annotated successor to [v1](../../data/pray/novena-source-review.v1.json), not a second prayer runtime.

### 1. Christmas: nine English source bodies correspond to the original digital witness

Witness: Callan and McHugh, [*Blessed Be God* (1925), **Novena for Christmas**](https://en.wikisource.org/wiki/Blessed_be_God_(Callan)/Novena_For_Christmas). Its nine prayers correspond to December **16–24** with a daily Pater, Ave and Gloria. All nine corresponding English body texts were read against the source transcription: substantial wording and day order agree, apart from normalized typography and capitalization. The app intentionally does **not** include the historical indulgence statement as a current entitlement. All nine French bodies are explicitly editorial translations: no independent original French printing of this exact English text has been selected.

### 2. Pentecost: nine English source bodies correspond to a *different section* of the same page

Witness: [*Blessed Be God* (1925), **Novena for Pentecost**](https://en.wikisource.org/wiki/Blessed_be_God_(Callan)/Novena_For_Christmas), beginning with **First Day** after the separately titled Christmas and Holy Name sections. The nine printed day headings and prayer texts correspond to the app's English sequence, including the gifts of Wisdom, Understanding, Counsel, Fortitude, Knowledge, Piety and holy Fear. The digital transcription has the eccentric fifth-day punctuation `souls, Make`, whereas the app regularizes it to two sentences; this is not evidence of a changed invocation. The appended Our Father, Hail Mary and Glory Be remain reused from the single canonical Prayer corpus. French translations are editorial renderings, **not** a certified historical French edition.

### 3. St Joseph: nine historical English prayers and shared responses

Witness: [*The Catholic Prayer Book and Manual of Meditations* (Moran, 1883), **Novena of St Joseph**](https://en.wikisource.org/wiki/The_Catholic_Prayer_Book_and_Manual_of_Meditations/Novena_of_St._Joseph). The original specifically prescribes **three Our Fathers and three Hail Marys every day**, alongside one of the nine distinct day-prayers. The app retains this structure and the prayers' English content agrees with the digital transcription at the reviewed source-body level.

Wikisource shows apparent transcription/typography artifacts: day seven prints `as 1 ought` where the app reads `as I ought`; day eight prints `of your, unworthy client` and `divine, favour`, with normalized punctuation in the app. This pass documents the exact differences; no claimed facsimile-based emendation or silent overwrite has been made. All nine French day-prayers are editorial translations.

### 4. Major omission: full historical meditation and practice are absent on 27 Marian days

Witness: Bonaventure Hammer, O.F.M., [*Mary, Help of Christians* (Benziger, 1909; Gutenberg English text)](https://www.gutenberg.org/files/33671/33671-h/33671-h.htm). Sections III (Annunciation), IV (Seven Sorrows) and V (Assumption) each prescribe **nine daily meditations, each with its own MEDITATION and PRACTICE text**, in addition to the preparatory prayer, Church prayer, personal prayer, Hail Mary and ejaculation. The app currently presents its short bilingual editorial guide and the selected prayer sequence, **not those full historical meditation/practice paragraphs**. Calling these three modules complete transcriptions would therefore be wrong.

The [v2 source-review matrix](../../data/pray/novena-source-review.v2.json) enumerates **every one of the 27 printed historical day titles**, their source location, and the two unreproduced daily components. To prevent confusion, each of the three existing `Sources & edition` drawers now explains the distinction in English and French and links to the complete historical book. The Assumption source's historical meditation describing Mary's death should remain distinguished from a defined dogmatic proposition. No 1909 historical prose or unverified translation was invented in this patch.

### Measured scope and remaining acceptance

| Measure | Status |
| --- | --- |
| Canonical Novenas | 16/16 unchanged |
| Known unique Novena prayer-body units (V4 corpus) | 91 |
| Day-specific prayer bodies in corpus | 72 (8 novenas × 9) |
| Distinct other/common/repeated prayer bodies | 19 |
| English day-body correspondence checks in this pass | **27/72** |
| Paired editorial French translation meaning reviews | **27**, with **zero** independent French historic-edition certificates |
| Missing original Hammer Meditation and Practice pairs identified | **27/27**, explicitly held |
| Complete printed-facsimile verbatim certificates added | **0** |
| Production-facing changed wording of historical prayer bodies | **0** |

"Correspondence" here means the English bodies were read and compared against the accessible historical **digital transcription** and their text, sequence and shared prayers materially agree, with observed orthographic and transcription normalization. It is **not** a claim of independent collation against photographs of every original 1883 or 1925 printed page, and does **not** certify independent French primary originals.

The next high-value batch should compare the remaining five nine-day source sets (45 body prayers) and eight repeated/shared forms, then recover the 27 full Hammer meditations and practices (and corresponding French translations with explicit `EDITORIAL_TRANSLATION` provenance) under discreet optional expanders. No canonical prayer body has been changed in this pass, because no substantive religious wording error was substantiated by the comparison.
