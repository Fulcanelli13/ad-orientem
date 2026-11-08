# Ad Orientem · 1–4 December 2026 Latin Compline release certificate

## Product release scope

This increment completes the **eight reviewed consecutive civil dates** from
28 November through 5 December 2026, in the **universal Roman 1960 Office,
Latin only**. It adds precisely four weekday appointments to the existing
28–30 November and 5 December published Latin readers.

This is **not** approval to present a complete 1961 original Mame facsimile,
other dates in future years, the English or French translations, local
calendars, or any of the other seven Roman Office Hours. All remain separately
gated.

## Individual Office appointments

| Civil date | Rank and rule in 1960 Roman Office | Appointed Psalm segments | Original Latin stichs |
| --- | --- | --- | ---: |
| 1 December | Advent feria Tuesday; weekday (BR §171e) | 11; 12; 15 | 9 + 6 + 11 = 26 |
| 2 December | St Bibiana, III class; Wednesday (BR §169e) | 33:2–11; 33:12–23; 60 | 10 + 12 + 8 = 30 |
| 3 December | St Francis Xavier, III class; Thursday (BR §169e) | 69; 70:1–12; 70:13–24 | 7 + 13 + 13 = 33 |
| 4 December | St Peter Chrysologus, III class; Friday (BR §169e) | 76:2–13; 76:14–21; 85 | 12 + 8 + 16 = 36 |

The independently populated `compline-advent-2026-appointments.js` registry
stores exact civil weekday, Office class, selected psalter day, Advent Marian
section and rubrical reason for each entry. A changed or missing value
withholds the public Hour before any network fetch. Original 1960 rubrics:
https://isidore.co/divinum/www/horas/Help/Rubrics/Breviary%201960.html

All four use **Alma Redemptoris Mater** and `Gratiam tuam` in the Advent
section, retain the source-owned 1961 printed Ordinary's 40 liturgical
moments, and offer independently selected opening-examen/Pater noster and
priest/non-priest dialogue alternatives.

## Whole-word independent Latin source evidence

Nine individual Psalms, **1,536 complete spoken Latin word tokens across
125 liturgical recitation stichs**, were checked independently against the
original public-domain Clementine Vulgate Project's Latin Scripture text:

**Independent edition**: `jrichter/ClementineVulgateConverter` repository,
`latin/Ps.lat`, pinned revision
`1f7093a14fa61374b0fe85db1965d9bd45dfdae1`.
Original source:
https://github.com/jrichter/ClementineVulgateConverter/blob/1f7093a14fa61374b0fe85db1965d9bd45dfdae1/latin/Ps.lat

The nine entire normalized Psalms match the pinned Ad Orientem
Divinum Officium Vulgate **word for word**, except for exactly ten
source-specific, explicitly recorded *orthographic* variants
(`hereditas / hæreditas`, `adicies / adiicies`,
`proicias / proiicias`, `bracchium / brachium`).
No word is omitted, inserted or reordered.

Source extracts and the ten exact word-index differences are retained in
`data/office/research/compline-ferial-clementine-fullword-witness.v1.json`.
Dedicated CI test
`tests/divine-office-ferial-independent-clementine-fullword.mjs`
recompares the complete pinned Latin text with this *independently
transcribed* text and fails on **any unapproved word difference**. The
test preserves the canonical word count and source-internal verse breaks.
It is not a digest that validates a source against itself.

In addition, the appointed weekly Compline Psalm ranges appear in **two
independent printed 1962-pattern Roman Psalters**:

- David Siefker, *Diurnale Romanum* (2008), Tuesday–Friday Compline,
  printed pp. 451–453, 497–498, 540–542 and 587–589.
  https://www.latinmassschedule.com/Resources/Diurnale_Romanum__Latin_English.pdf
- Consociatio Christi Regis, *Psalterium Romanum iuxta ritum 1962* (2023),
  printed pp. 76–77, 101–102, 124–126 and 151–153.
  https://ccregis.org/psalter_lt-en.pdf

**Evidence boundary:** these printed works corroborate weekday Psalter
appointments, not a second independent full-word transcription of the
printed pages. The full 1,536-word independent collation is to the
Clementine Vulgate Project, not the two modern printed PDFs.
The original **1961 Mame Psalter leaves were never fully collated**.
`psalter1961VerbatimCollated=false` and
`exact1961EditionPsalterLeafVerified=false` remain binding.

The public native reader continues to use pinned original Latin Divinum
Officium MIT-licensed text, exact source revision
`126a07f91ede04664108abb6fb20ace3f4de14b9`. Original MIT licence
and attribution ship in `src/office/LICENSE-DIVINUM-OFFICIUM-MIT.txt`.
This approval does not extend to translations.

## Implementation and acceptance

The independent whole-word comparison is a blocking GitHub Actions Office
test. The public date whitelist contains **exactly 28, 29, 30 November,
1, 2, 3, 4 and 5 December 2026**. Other dates and Hours fail closed,
before any source fetch. Public weekday readers now show source-accurate
labels for all **125** ferial stichs including recitation subdivisions,
while preserving original numbered source text in `sourceTexts`.
Editorial parenthetical canonical verse labels in Psalms 12 and 15
are removed from *spoken* text but retained in provenance.

Each of the eight appointed Latin Hours must load **42 original source
events → 40 recitation moments**, the original short `Per Dóminum`
conclusion, both blessing Amens, Advent Marian antiphon/collect and
source-owned hymn. 320px and 390px native Chromium tests open all four
weekday readers, verify actual Latin-only source responses, absence of
horizontal overflow, native Back return and refusal of unapproved
translation sources. Every new and existing date is tested in both
recitation contexts and both minister configurations.

The PR must pass the exact-HEAD **Office integration**, **phone reader**
and **Required main gate** before merging. Deployment and byte-parity
checks must then confirm the exact merge SHA through GitHub Actions
and GitHub Pages. No Vercel pipeline or cloud spending is permitted.
