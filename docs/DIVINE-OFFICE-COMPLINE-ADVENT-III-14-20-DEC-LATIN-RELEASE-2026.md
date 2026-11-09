# Roman 1960 Divine Office · Advent III and Ember Compline, 14–20 December 2026

## Strict scope and publication boundary

This batch proposes **seven additional universal-calendar Latin-only Compline
dates, 14–20 December 2026**, following the previously approved 16 dates
28 November–13 December. Each date needs its own independently sourced
Office/psalter appointment and exact-release certificate; this is not a
generic calendar rule that enables other dates. All other seven Hours,
English/French, local calendars and any unreviewed future date remain withheld
**before any network fetch**.

Original 1961 Mame *Psalterium* pages were **not** collated; this is the
traditional Clementine Vulgate Latin under 1960 Roman rubrics, with the
previously reviewed 1961 Mame Ordinary Compline sequencing
**42 original source events → 40 liturgical moments**. Original MIT licence
and attribution remain shipped with the pinned Divinum Officium Latin source
(revision `126a07f91ede04664108abb6fb20ace3f4de14b9`).

## Independent 1960 Office ordo / rubrics

- **Principal Office and exact 2026 date:** [Breviarium Gregorianum 2026
  Office ordo](https://breviariumgregorianum.com/ordo-2026.php), its separate
  Matins/Lauds/Minor Hours/Vespers/**Compline** appointments.
- **Ember Wednesday Compline:** [1962 Ordo Ember Wednesday,
  16 Dec](https://1962ordo.today/day/ember-wednesday-advent-2-3-2-2-2-2-2-2/),
  explicitly *Compline of the feria*, even with St Eusebius commemorated.
- **Privileged Thursday 17 Dec:** [1962 Ordo Advent Feria](https://1962ordo.today/day/feria-iii-iii-sunday-advent-2-2-2-2-2-2-2/),
  II-class; *Compline of the feria*. The 17 December **O Sapientia** is an
  antiphon at **Vespers** for Magnificat, not a substitute Compline Marian
  antiphon.
- **19 Dec concurrence:** [1962 Ordo Ember Saturday](https://1962ordo.today/day/ember-saturday-advent-2-3-2-2-2-2-2/),
  II-class with First Vespers of Advent IV and explicitly **Saturday Compline**.
- **20 Dec Sunday Compline:** [1962 Ordo Fourth Sunday](https://1962ordo.today/day/dominica-iv-adventus-3-2-2-2-2-2/),
  I-class and explicitly **Compline of Sunday**.
- **1960 Breviary rubrics:** [BR §§166(b/h), 171(e), 180–181](https://isidore.co/divinum/www/horas/Help/Rubrics/Breviary%201960.html)
  and [ICRSP Rubricae 1960](https://icrspfrance.fr/textes-liturgiques.php?article=a0149_ancien).

The Office-ordo, not any Mass feast rank or Gregorian weekday alone, is the
authority. This is **not** a pre-1955 calendar: St Eusebius does not replace
the second-class Ember Wednesday. Advent Ember Wednesday/Friday/Saturday
are not ordinary III-class ferias, yet their **Compline** follows the
appointed weekday source unless First Vespers requires a separate rule.
Dates December 17–23 are second-class Advent ferias. The season remains
the `Psalterium/Mariaant#Advent` Latin **Alma Redemptoris Mater** with its
*Advent* versicle and collect, **not** the *Post partum* Christmas Eve
variant.

## Seven exact-date release certificates

| Civil date | Roman 1960 Office | Appointed Compline | Psalm stichs | Office date |
| --- | --- | --- | ---: | --- |
| Mon 14 Dec | Monday of Advent III, III-class feria | Psalms **6**, **7** (two parts); BR §171(e) | 28 | 14 Dec |
| Tue 15 Dec | Tuesday of Advent III, III-class feria | Psalms **11, 12, 15**; BR §171(e) | 26 | 15 Dec |
| Wed 16 Dec | **Ember Wednesday**, II-class; St Eusebius commemorated | Psalms **33** (two parts), **60**; BR §171(e) | 30 | 16 Dec |
| Thu 17 Dec | Privileged Advent feria, II-class; O Sapientia at Vespers | Psalms **69**, **70** (two parts); BR §171(e) | 33 | 17 Dec |
| Fri 18 Dec | **Ember Friday**, II-class | Psalms **76** (two parts), **85**; BR §171(e) | 36 | 18 Dec |
| Sat 19 Dec | **Ember Saturday**, II-class, then I Vespers of Advent IV | Psalms **87**, **102** (two parts); BR §166(b) | 41 | **20 Dec** |
| Sun 20 Dec | **Fourth Sunday of Advent**, I-class, after II Vespers | Psalms **4, 90, 133**; BR §166(h) | 30 | 20 Dec |

The existing source-first `office-ordo-compline-resolver.js` independently
cross-checks the rank family, officeDate, actual weekday, selected psalter
and seasonal Marian section against the new
`compline-advent-iii-2026-ordo-witness.js` ledger. This cross-check remains
a *research* evidence check and cannot itself grant public permission.

## Complete Latin text evidence

Only Psalms **6 and 7** were not previously collated for this sequence.
Both complete original Latin files were extracted from pinned
Divinum Officium **at the exact MIT revision**, retaining source punctuation,
accents and recitation divisions; stichs 10 + 18 = **28**.

A completely separate independent Vulgate transcript,
[jrichter/ClementineVulgateConverter `latin/Ps.lat`](https://github.com/jrichter/ClementineVulgateConverter/blob/1f7093a14fa61374b0fe85db1965d9bd45dfdae1/latin/Ps.lat)
at revision `1f7093a14fa61374b0fe85db1965d9bd45dfdae1`, was compared against
every token after a narrowly defined orthographic-normalization method.
**123 Latin words** in Psalm 6 and **214** in Psalm 7 agree *word for word*:
**337 / 337**, with **zero spelling exceptions, omissions, insertions,
reorderings or lexical changes**. The source has two split stichs
`7:7a` and `7:7b` with editorial parenthetical cross-references
`(8a)` and `(9a)`; the new reader retains these in source provenance
but does not pronounce the cross-reference numbers.

- Source fixture: `tests/fixtures/office/advent-iii-feria-ii-compline-la.json`.
- Independent words and provenance:
  `data/office/research/compline-monday-2026-independent-clementine-fullword.v1.json`.
- Blocking full-word and intentional mutation test:
  `tests/divine-office-monday-independent-clementine-fullword.mjs`.

Tuesday, Wednesday, Thursday, Friday, Saturday and Sunday use the exact
original Latin Psalms that were **already** fully compared in the
previous published batches, without introducing new variants.

These comparisons are to a separate Clementine transcription, **not** an
assertion that the original 1961 Mame Psalter leaf was obtained and
compared word for word. No translation rights are implied.

## Acceptance and deployment

Dedicated CI `tests/divine-office-advent-iii-complete-compline.mjs`
requires **7 dates × 2 recitation contexts × 2 minister options = 28
complete Latin reader variants**, exact 42→40 source events, 28/26/30/
33/36/41/30 appointed Psalm focus stichs, two blessing Amens, one
source-consistent short `Per Dóminum` conclusion and no guessed source
words. Every unauthorized date starting **21 December**, non-universal
calendar and other seven Hours is tested to withhold **without a fetch**.

The native phone suite adds **14 real source-fed browser journeys**
(7 dates × 320px/390px), verifying the compact accessible Advent III
selector, Latin-only source requests, accurate first-Vespers `officeDate`,
reading title, no horizontal overflow, and Back navigation.

**Production gate:** exact PR-head Office integration, Required main and
phone tests must all succeed. Do not merge or call any new dates live
without independently verifying the target GitHub Pages deployment run,
including **Publish site**, snapshot/offline checks and 390px EN/FR
LIVE–Missal regression. The earlier **6–13 December** merge run
`42540118569` was **cancelled during deployment** despite a successful
build; it has been retried separately. This document records the
required evidence, not an assertion that publication has completed.

GitHub Actions + GitHub Pages only, no Vercel.
