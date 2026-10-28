# Ad Orientem · B16 — Prayer before and after Scripture reading

28 October 2026 · Existing Scripture reader extension, NOT a new Prayer module.

## Direct user-visible behavior

The public `src/scripture/library.js` Scripture reader renders a small, collapsed
*Prayer before reading* choice immediately before a chapter/passage, and a
*Prayer after reading* choice after the reading. No extra module, long settings
flow, new fixed prayer stage, Scripture modification, timer duplication or
external network request is introduced.

| Bible reader language | Before reading | After reading |
| --- | --- | --- |
| English | St Thomas Aquinas, *Concede mihi* (1908 historical EN) or its printed original Latin (one tap) | Lasance's Prayer after Meditation (1908 historical EN) |
| French | St Thomas Aquinas original Latin, **explicitly labelled Latin** | No text (no fabricated French translation, no unlabelled English fallback) |

The long English Lasance *Prayer before Meditation, Study, or Spiritual Reading*
remains a source-staged 1908 manuscript witness and is **NOT** public while
page 225 original image verification remains incomplete.

## Provenance and source language

All public choices draw from the existing immutable source witness registry
`src/pray/prayer-acquisition-historical-witnesses.v1.js` through
`prayerAcquisitionCandidates()`; editorial release requires exact print
verification, explicit LIVE_CLEARED, and a source language match. Printed Lasance
1908 pages 226 and 228 were checked against scan locations:
- After meditation, p.226: https://en.wikisource.org/wiki/Page:MyPrayerBookHappinessInGoodness.djvu/241
- St Thomas Aquinas, p.228: https://en.wikisource.org/wiki/Page:MyPrayerBookHappinessInGoodness.djvu/243
- Full transcribed section: https://en.wikisource.org/wiki/My_Prayer-Book/Prayers_During_the_Day

The motto printed *Omnia* is restored instead of the Wikisource OCR *Ommia*.
No obsolete indulgence grant is displayed or represented as current.

## Integration boundaries

- `src/pray/scripture-meditation-prayers.v1.js`: pure source-qualified options.
- `src/scripture/library.js`: the actual browser-mounted Scripture reader,
  one-tap native disclosures and an explicit EN/Latin choice, reader-local state.
- `src/scripture/styles.js`: secondary compact styles with keyboard accessibility.
- `tests/scripture-meditation-prayers-b16.mjs`: source, language, withheld
  text, location and disclosure gates, added to existing `npm run test:scripture`.
- `tests/prayer-corpus-editorial-acquisition-wave04.mjs`: source-release
  count updated for the two new prayer works / three language witnesses.
- Unchanged: 48 canonical prayer identities, Pius X Morning/Evening sequence,
  Rosary, Mass reader, 16 novena programme identities, Scripture edition
  selection, chapter navigation, and original app routes.

## Later candidate

A *Five Wounds* guided chaplet may become the next conditional addition after
confirming the prayer sequence and blessing-specific rubrics. The short
Precious Blood chaplet remains held over its 33-vs-35 Our Fathers discrepancy.
