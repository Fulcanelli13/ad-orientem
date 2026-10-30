> **B07 ERRATUM (27 Oct 2026):** The B04 claim below that Moran (1883) has no Night/Evening chapter was **incorrect**. It has a *Night Prayer* beginning on printed p. 12; nine descriptive prayer components are now registered. Updated cumulative coverage is **7 English books / 14 daypart chapter views / 155 English source occurrences**, plus **21 French-source occurrences** (176 occurrences total). **Nine complete texts** (6 French, 3 English) have now been visually checked against **three original printed-page images**, but are not published. See [B07 correction and print-image verification](DAILY-PRAYER-PRINT-TEXT-VERIFICATION-B07-20261027.md). Earlier counts and claims below are historical research snapshots, not the current totals.

# Daily Prayer research B03–B04: textual overlap review and historic-manual expansion

**Date: 27 October 2026.** Existing draft [PR #1785](https://github.com/Fulcanelli13/ad-orientem/pull/1785). Research-only; production Morning/Evening and timer unchanged.

## Cumulative concordance

| Gate | Actual reviewed/captured | Warning |
|---|---:|---|
| Historical books with directly checked daily-prayer source text | **7** | Four initial, three additional |
| Daypart chapter views | **13** | The Young Man's Guide has Morning and Evening within the same source page |
| Catalogued chapter occurrences / instructions / optional forms | **146** | 93 B01 + 53 B04; not unique prayers |
| Incipit-duplicate groups adjudicated against complete web passages | **17/17 initial B02 groups** | The 41 occurrences in these groups are not all identical |
| B04 written occurrence records | **53** | 20 Pocket 1899; 21 Key 1901; 12 Moran 1883 |
| B04 content kinds | **{"prayer":45,"historical-rubric":4,"private-devotional-prayer":1,"traditional-antiphon":1,"traditional-collect":1,"source-slot-not-fixed-prayer":1}** | Rubrics are not standalone prayer tabs |
| Printed facsimile-certified distinct formulas | **0** | Further gate; do not conflate web comparison with proof of page facsimile |
| Live reader/sequence changes | **0** | Keep stable 11 Morning / 13 Evening until user accepts historical presets and defaults |

Machine records:
- `data/pray/daily-prayer-source-concordance.b01.json`
- `data/pray/daily-prayer-canonical-crosswalk.b02.json`
- `data/pray/daily-prayer-duplication-adjudication.b03.json`
- `data/pray/daily-prayer-additional-manuals.b04.json`

## Completed duplicate adjudications

All **17** initially identified shared-incipit groups have been reviewed against their actual chapter passages rather than presumed identical from their opening line.

- **Actual form distinction:** Lasance morning and evening Contrition: same beginning, **different resolution**.
- **Actual form distinction:** Lasance morning and evening Adoration: preservation during night versus gratitude at end of day.
- **Actual form distinction:** Blessed Be God / Baltimore prayers for living: **same incipit, divergent intercessions**.
- **Actual form distinction:** Blessed Be God Apostleship offering versus Lasance Apostleship offering: substantive petition/intention changes.
- **Shared formula, one selectable text:** Angel of God in Baltimore/Lasance; Visita quaesumus in Lasance 1910/1911; In manus tuas in Lasance 1910/1911; the evening Memorare; several morning aspirations, and other short text identities.
- **Text witness, not new prayer:** De Profundis remains Psalm 129 with minor English witness differences; the surrounding versicles/collect are separate prayer identities.
- **Historical rubric, not prayer:** Lasance's evening examination instructions belong to a guide, not an alternative prayer wording.
- **Same contrition with historical editorial differences:** Baltimore morning and Blessed Be God evening 'I am heartily sorry' formula; do not create two tabs for mere punctuation/Amen.

Full cluster adjudications and links are in B03 JSON. Comparisons indicate where full-source edition differences affect the app; further original printed-page work is required before final text-certification.

## New manuals used (not merely mentioned)

### The Catholic's Pocket Prayer-Book (1899)

[Morning](https://en.wikisource.org/wiki/The_Catholic%27s_pocket_prayer-book/Morning_Prayers) / [Evening](https://en.wikisource.org/wiki/The_Catholic%27s_pocket_prayer-book/Evening_Prayers).

Relevant features: first-person prayer on awakening, distinctive Sacred Heart offering in the morning, fully developed morning resolution and thanksgiving, a compact evening thanksgiving and four-part examination (thought, word, deed, omission), plus particular evening contrition. Important offering is different from Lasance's Sacred Heart offering.

### Key of Heaven (1901)

[Morning](https://en.wikisource.org/wiki/Key_Of_Heaven/Morning_Prayers) / [Evening](https://en.wikisource.org/wiki/Key_Of_Heaven/Evening_Prayers).

Important source-control finding: its Morning Prayers repeat parts of Pocket 1899 (awakening/rising prayers) and of Baltimore (Acts of Faith, Hope, Love and Contrition). **Not a source of more tabs merely for the sake of books.** It supplies distinct clothing prayer, Marian offering, a penitential evening form, and alternative night-ending wording. The Litany of the Holy Name and the Loreto Litany are printed as optional extended devotions in these sections; do not force them into all daily routines.

### Patrick F. Moran, The Catholic Prayer Book and Manual of Meditations (1883)

[Morning Prayer](https://en.wikisource.org/wiki/The_Catholic_Prayer_Book_and_Manual_of_Meditations/Morning_Prayer).

A genuinely distinct short morning exercise, including thanksgiving, good intention, a resolution aligned to a concrete fault, prayers for necessary grace, and a Guardian Angel prayer; its theological Acts are independently phrased and deserve separate variant consideration. The source recommends optional 15-minute meditation **after** morning prayer; do not misinterpret this as a required daily timer.

A separate Evening chapter was not evidenced in this source's consulted contents, so **none has been invented**.

## Early UI implications

1. **Morning Offering tabs:** Apostleship of Prayer variants, Baltimore whole-being offering, 1899 Sacred Heart offering, Moran 1883 Good Intention. User chooses; do not assume the same words because the role matches.
2. **Acts of Faith, Hope, Charity:** present family ID + edition-linked witnesses; suppress near-duplicates that differ only by spelling; expose genuinely different full formulations, including Moran.
3. **Examination of conscience:** night interface can display several historical forms; *guidance questions* are not authored prayer texts. No automated moral score.
4. **Night protection:** St Alphonsus, Visita quaesumus, Salva nos, a Marian/Guardian prayer, and In manus tuas are different kinds (full prayer, collect, antiphon, aspiration). Let user optionally combine rather than force a single choice.
5. **Historical complete routine:** allow faithful 1883 Moran or 1888 Baltimore sequence as a separate historical preset. Do not call an ad hoc compilation 'the Baltimore Manual'.
6. **Timing:** add independent optional stopwatch / gentle target / meditation timer after text/preset certification. Never automatically turn a prayer card by elapsed time.

## Next research gates

- Scan-confirm exact original page locations and text boundaries for **ready-to-promote editions** first, not every incidental rubric. This is the certification gate.
- Reconcile **B04's 53 occurrences** with B01/B02 and determine *unique prayer families and truly distinct alternate texts*, not raw entries.
- Recover edition-specific **French** morning/evening full prayers, preserving legitimate French devotional forms and source boundaries.
- Then present categorized default/alternative selection, with no postconciliar substitution and no retroactive change to the existing 48 prayer IDs.

No costs, no contacting rightsholders, no extra prayer engine or timer duplication.
