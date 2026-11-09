# Latin Roman Compline · 28 December 2026–3 January 2027 release candidate

**Not yet merged, not yet publicly deployed.** Additive seven-date
source-certified Latin Compline candidate, continuing the **30
previously released civil dates** (28 November–27 December) to a
**37-date finite whitelist** ending 3 January 2027. The prior
`LATIN_COMPLINE_RELEASE` 23-day Advent cohort and
`CHRISTMAS_2026_COMPLINE_RELEASE` seven-day Christmas cohort remain
immutable, auditable and unchanged.

## Independent dated source and rubrics

- [2026 traditional Office ordo, 28–31 December](https://breviariumgregorianum.com/ordo-2026.php)
- [1960 General Rubrics of the Roman Breviary](https://isidore.co/divinum/www/horas/Help/Rubrics/Breviary%201960.html)
- [2027 traditional January ordo](https://ordo.fsspx.org/en/calendar/2027/1)
- [2027-01-02, First Vespers of Holy Name](https://ordo.fsspx.org/day/2027-01-02?lang=en)
- The exact pinned Latin `Psalterium/Mariaant.txt` is byte-identical
  to Divinum Officium revision
  `126a07f91ede04664108abb6fb20ace3f4de14b9`, Git blob SHA
  `bf44a58ba1076b17466b88fa4004c1cab29f96ae`. MIT attribution
  already shipped.

| Civil | Governing Compline | Office date | Psalms | Rule |
|---|---|---|---|---|
| 28 Dec 2026 | Holy Innocents II | 28 Dec | Sun 4/90/133 | 168(d) |
| 29 Dec | Christmas octave, fifth day II | 29 Dec | **Sun 4/90/133**, not Tuesday | 175(e) |
| 30 Dec | Christmas octave, sixth day II | 30 Dec | **Sun 4/90/133**, not Wednesday | 175(e) |
| 31 Dec | First Compline of the Circumcision | **1 Jan 2027** | Sun 4/90/133 | 175(d),167(b) |
| 1 Jan 2027 | Circumcision I, octave day of Christmas | 1 Jan | Sun 4/90/133 | 167(h) |
| 2 Jan | First Compline of the Most Holy Name | **3 Jan 2027** | **Sun 4/90/133**, not Saturday | 168(d) |
| 3 Jan | Most Holy Name of Jesus II | 3 Jan | Sun 4/90/133 | 168(d) |

No 2027 general-calendar or Mass fallback is permitted. 31 Dec/2 Jan
explicitly show the following liturgical **Office date** after First
Vespers. The source-backed *Alma Redemptoris Mater* continues with
*Post partum* and *Deus, qui salutis*; civil 1 January is **not** a
return to the Advent Marian variant.

## Implemented authorizations and regression evidence

- A separate `DEC28_JAN03_LATIN_COMPLIME_RELEASE`-style finite release
  manifest (exact exported identifier
  `DEC28_JAN03_LATIN_COMPLINE_RELEASE`) explicitly lists the seven
  civil dates; only the independent hard-coded
  `reviewDec28Jan03LatinComplineCertificate` authorizes them.
- The original 30 dates remain under their previous independent
  certificates. Generic and earlier private review APIs do not
  acquire new dates; the cross-year private parser stays opt-in.
- The immutable `compline-dec28-jan03-2027-release-certificate.js`
  reconciles the Sunday/Saturday psalter, civil/Office date,
  proper feast precedence, Christmas seasonal Marian ending and
  original Latin source rights. A manipulated profile fails closed.
- `tests/divine-office-dec28-jan03-public-release.mjs` asserts **28
  full public Latin readings** (7 dates × final-prayer/other-time ×
  priest/lay-led), preserving 42 original source blocks, 40 reading
  moments, 30 focus rows, two minister dialogues and two sourced
  blessing Amens. For 2 January, the **II-class Holy Name** after First Vespers uses
  **Sunday psalms** ([4,90,133]); it must not inherit the ordinary Sunday
  First-Compline Saturday rule. The pinned source and 30 reading focus
  frames are independently asserted.
- `tests/divine-office-native-prayer-phone.mjs` now exercises **14
  additional actual native public phone journeys**: 7 exact dates on
  320px and 390px. Test catches incorrect weekday psalms on octave
  dates, the 31 Dec / 2 Jan Office rollover and Holy Name II-class psalter, missing pinned Latin
  source, reading focus/back failures and horizontal overflow.
- Negative gates forbid date **4 January 2027 onward**, every other
  canonical Hour, local calendars, and any unauthorized source fetch.
- Existing 30-date Office reading, Mass, Schola, and Prayer return
  regressions remain required to pass.

## Certification limitations

The approved text source is the already independently compared
traditional **Clementine Vulgate Latin** and published MIT-licensed
Divinum Officium pinned leaves, matched to 1960 Roman rubrics and
the independently checked 1961 Roman Ordinary. We still do **not**
claim a word-for-word facsimile collation of the original 1961
*Mame* printed **Psalter** leaf. The English/French Divine Office,
other Hours, localized calendars, other psalters and dates from
4 January onward remain unapproved.

**Mandatory release sequence:** exact PR-head Required main + Office
source integrity + 320px/390px native reader + any other triggered
checks all success; then merge a frozen SHA; then verify the exact
GitHub Pages merge-SHA build, deploy, offline snapshot and 390px
EN/FR LIVE–Missal/Schola checks. Only after the post-deployment
receipt passes can the 37-date version be represented as live.
**GitHub Actions + GitHub Pages only; no Vercel or paid hosting.**

Source-first research and negative-hold history remains intact in
`docs/DIVINE-OFFICE-COMPLINE-2026-DEC28-2027-JAN03-SOURCE-REVIEW.md`
and `data/office/research/compline-dec28-jan03-2027-source-intake.v1.json`.
Those research records deliberately retain `published:false`.

## 9 November corrective source reconciliation

The original initial release-candidate note incorrectly assigned
**Saturday psalms to 2 January** by applying ordinary Sunday BR §166(b).
The source-first ICRSP 1962 dated Office ordo instead explicitly says
[First Vespers of the Most Holy Name, *Complies du dimanche*](https://icrspfrance.fr/ordo.php?d=2027-01-03).
This is the **II-class semifestive Office, BR §168(d)**; the corrected
public certificate, source intake, phone tests and Psalm-focus calculation
now all enforce **Sunday Psalms 4,90,133 (30 focus frames)**.
The liturgical Office date remains **3 January 2027**.
