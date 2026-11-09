# Roman 1960 Divine Office · Advent II Compline, 6–13 December 2026

## Scope

Exactly eight additional **universal-calendar Latin-only** Compline civil dates,
6 through 13 December 2026, complement the already deployed eight dates
28 November–5 December. Other seven Hours, other dates, local calendars and
English/French remain forbidden until independently certified.

This batch **does not claim** an original 1961 Mame Psalter facsimile nor the
1961 printed leaf's full verbatim collation. It applies the verified 1961
ordinary sequence (42 source blocks → 40 spoken/prayed moments),
the traditional Clementine Vulgate psalter, the pinned Divinum Officium
MIT Latin sources, and the **1960 Rubrics** as separately evidenced.

## Two independent appointment sources

**Office-specific 2026 ordo**: Breviarium Gregorianum,
[Ordo of the Divine Office 2026](https://breviariumgregorianum.com/ordo-2026.php)
(December 2026; date, named Office, class and I/II Vespers/Compline links).
Unlike a Mass calendar this independently states the **Office to be said**
on each date.

**Second, independent 7 December Vespers witness**:
[Cantus Organi, Immaculate Conception Vespers](https://www.cantusorgani.org/vespers/sancti/12-08/).
Identifies **Monday 7 December 2026** as **First Vespers of the Immaculate
Conception**, not Monday Vespers of St Ambrose.

**Binding Rubricae Breviarii Romani 1960**:
[Breviary chapter IV, §§165–176](https://isidore.co/divinum/www/horas/Help/Rubrics/Breviary%201960.html),
also the [ICRSP 1960 Rubrics](https://icrspfrance.fr/textes-liturgiques.php?article=a0149_ancien).
These distinguish Saturday Compline after Sunday First Vespers
§166(b), Sunday after Second Vespers §166(h), I-class First Vespers
§167(b), I-class Second Vespers §167(h), ordinary III-class feasts
§169(e), and ferias §171(e).

The source-backed register is committed at
`src/office/compline-advent-ii-2026-ordo-witness.js`, reconciled with
`src/office/compline-advent-ii-2026-appointments.js`.
The research-only general Office-ordo resolver independently checks
each appointment against its source, civil weekday, feast family,
First-Vespers concurrence and Marian Advent leaf.

## Eight date-specific Compline profiles

| Civil day | Real Office governing Compline | Office date | Latin Psalms | Focus stichs |
| --- | --- | --- | --- | ---: |
| Sun 6 Dec | Second Sunday of Advent, I-class, **Second Vespers** §166(h) | 6 Dec | 4, 90, 133 (Sunday) | 30 |
| Mon 7 Dec | **First Vespers of Immaculate Conception**, I-class §167(b); St Ambrose III-class Office during day | **8 Dec** | 4, 90, 133 (Sunday) | 30 |
| Tue 8 Dec | Immaculate Conception, I-class, Second Vespers §167(h) | 8 Dec | 4, 90, 133 (Sunday) | 30 |
| Wed 9 Dec | Feria IV after Advent II, §171(e) | 9 Dec | 33 (two parts), 60 | 30 |
| Thu 10 Dec | Feria V after Advent II, §171(e); St Melchiades commemorated | 10 Dec | 69, 70 (two parts) | 33 |
| Fri 11 Dec | St Damasus I, III-class, §169(e) | 11 Dec | 76 (two parts), 85 | 36 |
| Sat 12 Dec | Following **First Vespers** of Gaudete, §166(b) | **13 Dec** | 87, 102 (two parts), **Saturday** | 41 |
| Sun 13 Dec | Third Sunday of Advent (Gaudete), I-class, §166(h) | 13 Dec | 4, 90, 133 (Sunday) | 30 |

This guards specifically against two serious errors: treating the
**7 December night** as St Ambrose's Monday Compline, and treating the
**12 December night** as Sunday's Psalm 4/90/133 instead of the
**Saturday Compline** of Psalm 87/102.

The Immaculate Conception I-class precedence and First-Vespers conclusion
are source-backed and kept independent of Mass-proper selection. Its
Advent Marian ending remains the pinned `Psalterium/Mariaant#Advent`
(`Alma Redemptoris Mater`, versicle and seasonal collect).

## Word-for-word Latin source boundary

No new Psalm is introduced. Each full Latin Psalter segment is already
covered by the separately archived verified source witnesses:

- Sunday Psalms **4/90/133**, 30 liturgical stichs, **329 normalized words**:
  `data/office/research/compline-sunday-2008-2023-fullword-witness.v1.json`
  independently compared to two published Roman printed psalters.
- Wednesday Psalm **33/60**, 30 stichs, **335 words**; Thursday Psalm
  **69/70**, 33 stichs, **398 words**; Friday Psalm **76/85**, 36 stichs,
  **469 words**. All are included in the independent full-word Clementine
  comparison (nine distinct ferial Psalms totaling **1,536** words,
  ten documented orthographic variants, no omitted/substituted Latin words):
  `data/office/research/compline-ferial-clementine-fullword-witness.v1.json`.
- Saturday Psalms **87/102**, 41 stichs, independent Diurnale 2008
  and Psalterium Romanum 2023 comparisons:
  `data/office/research/compline-saturday-printed-2023-fullword-witness.v1.json`
  and related Saturday complete-word ledgers.

The source family is pinned Divinum Officium MIT, revision
`126a07f91ede04664108abb6fb20ace3f4de14b9`, served with licence
and attribution. These texts cannot be silently substituted by the
Pius XII Psalter translation or an arbitrary English/French source.

## Publication and regression acceptance

The 16-date public manifest must enumerate **each date explicitly**.
For each of 6–13 December, release eligibility requires exact rank,
psalter, rubrical reason, source calendar proof, 1960
First-Vespers/officeDate alignment, Advent Marian section, prior
complete-Latin Psalm witness and the same 1961 Ordinary 42→40 projection.

Dedicated `tests/divine-office-advent-ii-complete-compline.mjs`
tests all **8 dates × 2 minister choices × 2 recitation contexts**
= **32 complete reader variants**, plus source text identity, all
125/30/33/36/41 stich counts as applicable, two Blessing Amens,
`Per Dóminum`, correct original speech markup, exact First-Vespers
Office date, refusal of unauthorized local variations and dates.

Playwright phone acceptance adds **16 browser journeys**
(8 dates at both 320px/390px) using a compact accessible
`Advent II Compline date` selector instead of eight additional stacked
buttons. It checks real fixture Latin source responses, complete
readings, correct header, dated Office labels, no horizontal overflow,
and native back navigation.

All other dates (starting **14 December**) and all other Office
Hours remain withheld before any network fetch. The first sixteen
source-reviewed dates do not automatically authorize the whole
liturgical year; the independent 2026 research ledger has
**16 reviewed and 349 further dates requiring evidence**.

Only merge on **exact-head** Office integration, Required main and
320px/390px reader CI success; then independently verify
GitHub Pages deployment, public offline/snapshot parity, 390px
LIVE/Missal/Schola EN/FR and exact merge SHA. Vercel is excluded.
