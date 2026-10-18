# Ad Orientem Ordo — 2026 linguistic and source-quality audit

**Status: read-only evidence; no production text or Calendar precedence changes.** Dedicated Ordo PR #1420. Mass Proper grammar review remains separate in #1418.

## Corpus and scope

- All **365** 2026 source Calendar day entries reviewed for title availability and token/OCR flags.
- **48** seeded random full Calendar resolutions: 2 Sundays and 2 non-Sundays per month. EN and FR projected using the same priority as the on-screen Calendar.
- Up to nine additional named-risk sentinel dates, counted separately from the random 48.
- 31 real December source resolutions used to exercise full-month EN/FR ICS export.
- Corpus preserved as the GitHub workflow artifact `ordo-2026-language-qa`.

This audit does **not** certify every Calendar explanatory paragraph, all 12 ICS exports, physical Android rendering or the rubrical correctness of every day.

## Confirmed localization deficiencies

- **365/365** principal source day records contain an English `title`; **0/365** have independent `titleFr` or `nameFr`.
- **48/48** sampled resolved Propers have `proper.nameFr === proper.name`. The French property exists but carries an English copy.
- **43/48** randomly selected Calendar headings are identical in EN and FR. The five distinct headings result from reviewed bilingual `calendarObservanceAlias` entries.
- For all **8/8** randomly sampled dates containing a commemoration, the French commemoration name was identical to the English one.
- Typical unlocalized French display: `Easter Sunday`, `I Sunday of Lent`, `XXI Sunday after Pentecost`, `St. Damasus I`.

The original heuristic scan found **zero** token/OCR warnings in source Calendar titles. This is not a clean bill of health: duplicated language fields and inherited saint-name problems are outside those simplistic grammar rules. The sampler was strengthened to measure bilingual identity directly.

## Inherited title/saint-name defects

1. **19 June — St Juliana Falconieri.** The source calls her `St. Julia of Falconieri`, while the independent 1962 calendar calls her St Juliana Falconieri, French sainte Julienne Falconieri. The same questionable name is used by the Missale Meum upstream publication. Correct by saint/source ID rather than a broad string replacement.
   - https://manualistpress.com/liturgical-calendar/1962-missal/
   - https://www.vaticannews.va/fr/saint-du-jour/06/19/sainte-julienne-falconieri.html
   - https://www.missalemeum.com/en/calendar?fromDate=1962-06-04
2. **2 December — St Bibiana.** The raw source says `St. Vivian`. The app's Calendar already corrects the visible title using a canonical-ID bilingual alias (so the on-screen Calendar is **not** exhibiting this error). The downloaded ICS serializer has its own title selection and does not consult that alias, so raw source contamination can recur in exports.
   - https://ordo.fsspx.org/day/2026-12-02?lang=en
   - https://www.missalemeum.com/en/widgets/propers/2025-12-02?theme=light
3. **21 July — St Praxedes.** Source commemoration title `St. Praxedis Virginis` combines English `St.` with Latin `Virginis`. Both EN and FR Calendar commemoration paths inherit this. The independent 1962 Ordo says St Praxedes, Virgin / sainte Praxède, vierge.
   - https://ordo.fsspx.org/day/2026-07-21?lang=en
   - https://ordo.fsspx.org/calendar/2026/7

These are not to be conflated with the **132 older source-oracle comparison flags** in `data/calendar/1962-editorial-reconciliation-2024-2027.v1.json`: many were variants already resolved or adjudicated. Existing rank/colour corrections in `data/calendar/1962-ordo-corrections.v1.json` remain authoritative.

## Calendar versus ICS export

`src/calendar/calendar-runtime.js` prefers `calendarObservanceAlias` for source-verified display-name corrections.
`src/calendar/export-ics.js` independently builds the French summary from `proper.nameFr || day.main.titleFr || proper.name || day.main.title`; it does not consult the same aliases. The correct on-screen `Sainte Bibiane` alias can therefore diverge from the historical raw `St. Vivian` name in an export.

**December 2026 ICS verified:** All 31 days were independently resolved and both exports contained 31 events. On **2 December** the on-screen Calendar's certified title is **St Bibiana, Virgin and Martyr** / **Sainte Bibiane, vierge et martyre**, but the *actual* English and French ICS EVENT SUMMARY is **St. Vivian** in both languages. On **11 December**, both EN and FR exports say **St. Damasus I**, as the on-screen Calendar does, yet French remains untranslated. On **27 December**, both exports say **Sunday in the Octave of Christmas**: another independent proof that the French ICS export is English. This is now observed output, not merely inferred code risk. Audit CI evidence: https://github.com/Fulcanelli13/ad-orientem/actions/runs/39163670835 .

## Recommended prevention architecture

**P0 — Correct source text once, transparently.** Retain immutable historical Latin/EN/FR witnesses. Maintain exact-match reviewed editorial corrections keyed by canonical `sourcePath + section + language + original text fingerprint`. Every record preserves the original, minimal correction, source reference, editor status and reason. No global replacements; fail closed when the source revision or expected original bytes change. Saint names and Latin saint classification require different certification from modern-language proofreading.

**P0 — One bilingual Ordo title owner.** Build a reviewed EN/FR name and commemoration registry keyed by stable calendar identity; do not infer French completeness from a populated but English-copied `nameFr`. Canonical-ID approved aliases take precedence where justified. Use the same projection in on-screen Calendar and ICS; keep calendar rank, colour, precedence and Mass Proper identity untouched.

**P1 — Coverage gates, not a one-off proofreading exercise.** Audit raw imported source and the real reader/print/Calendar/ICS outputs. Add OCR-confusable forms, mixed-language Latin cases, malformed citation/reference, double words, unresolved macros and cross-language duplicate title detection. Track flagged versus reviewed versus source-verified versus fixed. Keep a rotating random sample across seasons together with fixed liturgical edge cases. A lexical scanner finds candidates; only editorial review certifies their correctness.

**Release rule:** An app that passes JavaScript tests can still have untranslated or incorrect liturgical text. Technical, linguistic, rubrical and physical-device acceptance must remain independent, evidence-based gates.

No production code or Mass Proper content was modified as part of this Ordo audit.
