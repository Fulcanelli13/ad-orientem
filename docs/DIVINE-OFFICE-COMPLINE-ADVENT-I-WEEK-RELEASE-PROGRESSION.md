# Divine Office · Latin Compline Advent I week release progression

## 8 November 2026 — second Saturday implementation

This increment extends **the already merged native Latin Compline reader**
from civil **Saturday 28 November 2026** to **Saturday 5 December 2026**,
the eve of Advent II, without claiming to have certified all eight days.

For both days, `Breviarium Romanum` 1960 rubrics **§166(b)** specify
**Saturday Compline after Sunday First Vespers**. The existing source
appointment records for these two dates independently name
`psalmDay = Sabbato`, `marianSection = Advent`,
`officeClass = SUNDAY_FIRST_VESPERS` and the same precise rubrical
reason. The published `Latin` source path uses the **same** appointed
Saturday antiphon, Psalm 87 and Psalm 102 (both portions), the same
`Te lucis`, `Nunc dimittis`, `Visita`, blessing Amens and Advent
`Alma Redemptoris Mater` and `Gratiam tuam` sequence. These facts are
verified on every allowed dated source load; a changed appointment
withholds the entire Hour.

*Primary rubrical witness:* [1960 Roman Breviary rubrics §166](https://isidore.co/divinum/www/horas/Help/Rubrics/Breviary%201960.html).

*Text witnesses:* [1961 printed Ordinary §§54–67](https://unavocesevilla.com/LIBROSLITURGICOS/BREVIARIUM%20ROMANUM.1961.pdf),
David Siefker's 2008 *Diurnale Romanum* Saturday Compline
(pp. 349–352), and the 2023 *Psalterium Romanum iuxta ritum 1962*
Saturday Compline (pp. 177–179). The **473 Latin words** from
the two Saturday psalms were already compared against both later
independent printed witnesses; only documented orthographic
variants remained. Neither is an actual 1961 Mame Psalter leaf.

*Source licence:* Divinum Officium at pinned revision
`126a07f91ede04664108abb6fb20ace3f4de14b9`, MIT notice and
attribution shipped in `src/office/LICENSE-DIVINUM-OFFICIUM-MIT.txt`.

## Public release matrix, civil date and Latin-only

| Civil date | Appointed Compline | Public Latin reader |
| --- | --- | --- |
| 28 Nov 2026 | Saturday after First Vespers of Advent I | Released in prior PR #2640 |
| 29 Nov 2026 | Sunday | Withheld: separate Psalms 4, 90, 133 |
| 30 Nov 2026 | Sunday Psalter for St Andrew (II class) | Withheld: separate Sunday-Psalter word witness |
| 1 Dec 2026 | Tuesday | Withheld: Psalms 11, 12, 15 |
| 2 Dec 2026 | Wednesday | Withheld: Psalm 33 (two parts), Psalm 60 |
| 3 Dec 2026 | Thursday | Withheld: Psalms 69 and 70 (two parts) |
| 4 Dec 2026 | Friday | Withheld: Psalms 76 (two parts) and 85 |
| 5 Dec 2026 | Saturday after First Vespers of Advent II | Added in this increment |

The other six days retain **private source-first research** only. No
auto-extension to another Saturday, local calendar, 2027, or a nearby
date is permitted. English and French words remain unapproved.

## Acceptance contract

- The release manifest contains exactly the two approved civil dates.
- Each approved date must independently resolve to the pinned Saturday
  universal Roman appointment; a changed rubric, Marian source or
  psalm appointment blocks publication **before** network access.
- Both dates load complete Latin-only 42 source events → 40
  printed-Ordinary reading moments, with 41 Saturday psalm display
  frames, both blessings and the short `Per Dóminum`.
- Both dates support the separately selected final-prayer examen/
  introductory Pater and priest/non-priest dialogue alternatives.
- The public page must show the **selected date**, not hardcode 28 Nov.
- 320px and 390px Chromium must open both published Saturday readers
  with pinned Latin source, a working Back button and no horizontal
  overflow.
- The other six reviewed appointments must not fetch public source.
- Keep `exact1961EditionPsalterLeafVerified=false` and
  `psalter1961VerbatimCollated=false` until the actual 1961 Mame
  Vulgate Saturday Psalter pages are obtained and checked.
- GitHub Actions + GitHub Pages only, never Vercel.

This document records the second-date implementation and its test
contract; it does **not** claim a successful production deployment
until the exact-SHA workflow has passed and been merged.
