# Morning and Evening Prayer — B08 print-text certification and proposed source tabs

**27 October 2026.** Research-only supplement to [draft PR #1785](https://github.com/Fulcanelli13/ad-orientem/pull/1785). No changes to the Prayer reader, canonical 48-ID corpus, current Morning 11 / Evening 13 cards, production translations or timer.

## Corrected consolidation: Moran 1883 vs Key of Heaven 1901

The newly recovered Night Prayer in Moran's *The Catholic Prayer Book and Manual of Meditations* overlaps **substantially** with the 1901 *Key of Heaven* evening exercise. Side-by-side source comparison identifies near identical penitential introductions, private-use Confiteor, the faithful-departed collect, the `Salva nos` antiphon and `Visita, quaesumus` collect. Some wording differs, and Moran also includes a separate long Act of Contrition and a long thanksgiving/protection passage.

**Correction to the emerging options policy:** these are not two separate user-visible prayer families merely because they occur in two books. Use the canonical `dead_fidelium_deus` family for the departed collect, one `salva-nos` antiphon family, and one `visita-quaesumus` collect family. Historical books get exact edition witnesses; distinct text is presented when meaningful. Do not suppress genuine long-form Contrition in Moran simply because Key has a similar penitential introduction.

Original Moran page witnesses: 
- [printed p.13 / scan 31](https://en.wikisource.org/wiki/Page:The_Catholic_prayer_book.djvu/31)
- [printed p.14 / scan 32](https://en.wikisource.org/wiki/Page:The_Catholic_prayer_book.djvu/32)
- [printed p.15 / scan 33](https://en.wikisource.org/wiki/Page:The_Catholic_prayer_book.djvu/33)
- [printed p.16 / scan 34](https://en.wikisource.org/wiki/Page:The_Catholic_prayer_book.djvu/34)

Compare [1901 Key of Heaven evening transcription](https://en.wikisource.org/wiki/Key_Of_Heaven/Evening_Prayers).

## B08 new complete printed-page prayer bodies

These are **five additional complete body transcriptions** checked against original printed page images; B07 had nine, so cumulative **14** complete text bodies. They are not necessarily 14 **unique devotional prayers**, and none has been approved for production.

| Edition and prayer | Printed page | Image index | Source entry | Meaning |
|---|---|---:|---|---|
| Pocket Prayer-Book, Sacred Heart Morning Offering | 8–9 | 17–18 | B04.004 | Independent long offering formulation |
| Pocket Prayer-Book, shorter Act of Faith | 9 | 18 | B04.005 | Alternative concise profession of Faith |
| Moran, Prayer for Faithful Departed | 15 | 33 | B04.059 | Version of `Fidelium Deus`—not a new family |
| Moran, `Salva nos` | 16 | 34 | B04.060 | One historical night antiphon |
| Moran, `Visita, quaesumus` | 16 | 34 | B04.061 | One historical bedtime collect |

Source-specific full text and page URLs: `data/pray/daily-prayer-print-witnesses.b08.json`. These pages were read from [the 1899 printed scan](https://en.wikisource.org/wiki/Index:TheCatholicsPocketPrayerBook.djvu) and [the 1883 printed scan](https://en.wikisource.org/wiki/Index:The_Catholic_prayer_book.djvu). The evening prayer sequence has been checked for boundaries; the full Moran p.14–15 long Act of Contrition is **not** yet independently transcribed into the B08 complete-form file.

## B08 editorial shortlist

See machine-readable `data/pray/daily-prayer-editorial-shortlist.b08.json`. This is **14 conceptual stage groups** (6 Morning + 8 Evening), with source-linked alternatives; a stage can contain separate subprayers, e.g. Faith/Hope/Charity. The file is deliberately **not** production-ready configuration and not an approved UI.

- **Morning Offering:** Moran Good Intention, Pocket Sacred Heart offering, Blessed Be God Apostleship of Prayer offering. These are meaningfully different. French 1905 combined Morning Thanksgiving/Offering is a single source prayer and must not be repeated.
- **Acts of Faith/Hope/Charity:** prefer single shared prayer identity + exact historical witness versions. Pocket concise Faith and French 1905 forms have print-checked text witnesses; many other formulae remain at chapter-only status.
- **Evening examen:** keep guided questions as guide content, not an allegedly historical vocal prayer. Add standalone historical prayer for light and conscience examination.
- **Contrition:** Lasance short evening Contrition, Moran long penitential Act, Blessed Be God form are real candidates. Printed-form and rights checks remain.
- **Night protection:** `Salva nos`, `Visita`, St Alphonsus and simple bedtime blessing are **complementary** types, so this stage can permit more than one selection rather than forcing an incorrect mutually exclusive variant-tab model.
- **For the dead:** `Fidelium Deus` and `De Profundis` are two different acts, with distinct psalm/collect boundaries; do not present one as a translation of the other.
- **Historic complete method:** a page-true Baltimore or Moran routine can be offered as a separate preset while the flexible composed Ad Orientem routine has its own provenance.
- **French language:** original text or historically verified translation only. No English editions may manufacture a 'historical' French version.

## Correct progress denominator and remaining gates

- **Seven English prayer books, 14 daypart views, 155 catalogued English occurrences; 21 French/Latin occurrences; 176 catalogued occurrences total.** They include explanatory rubrics, examination instructions and repeated subparagraphs—not 176 unique prayer texts.
- **14 complete, print-image-checked prayers** from B07 (9) and B08 (5), covering 6 French and 8 English bodies, **not** independent complete print certification of whole historical chapters.
- The five B08 entries have explicit links to the B04/B05 occurrence IDs, and a shortlist has source references checked against B01/B04/B06.
- Further full-text certification: evening Moran long Contrition; Blessed Be God/Lasance night prayers, print source of Apostleship offering, French nocturnal protection and examination.
- Then a grouped editorial choice of defaults and alternatives, historical preset QA, rights assessment, and implementation in existing Prayer reader without rewriting original canonical IDs.
- Timer: stopwatch, optional gentle duration, optionally silent meditation; **never automatically advance** the prayer cards or assign a spiritual-achievement score.
- €0, no paid tools, no contacting rights holders.

**Release status:** research branch only, draft PR, no user-facing live changes.
