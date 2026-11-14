# Compline · 11–17 January 2027 — source-first Office intake

**PRIVATE RESEARCH ONLY. No public release dates are authorized here.**
The exact-commit GitHub Pages 44-date Latin Compline release has been
verified through **10 January 2027** (merged [PR #2729](https://github.com/Fulcanelli13/ad-orientem/pull/2729),
Pages workflow [#42597304377](https://github.com/Fulcanelli13/ad-orientem/actions/runs/42597304377),
rerun attempt 2 fully successful). The publication count remains 44.

## Independent dated 1960 Roman Office witnesses

- [ICRSP January 2027 dated Office ordo](https://icrspfrance.fr/ordo.php?d=2027-01-03):
  Mon/Tue after Epiphany IV-class ferias, Jan 13 II-class Baptism,
  Jan 14 St Hilary III, Jan 15 St Paul the First Hermit III,
  Jan 16 St Marcellus III *by day* but after Vespers first Compline
  of Jan 17 Second Sunday after Epiphany II, and Jan 17 Sunday Office.
- [1960 Variationes, change 24](https://icrspfrance.fr/textes-liturgiques.php?article=a0112_ancien):
  the 13 January Commemoration of the Baptism of Our Lord is **II
  class**; **at Compline** it follows Epiphany (not Wednesday Psalms).
  The change explicitly preserves ordinary weekday Psalms only at
  the *Little Hours*. Do not misapply the latter to Compline.
- [Roman Breviary General Rubrics 1960](https://isidore.co/divinum/www/horas/Help/Rubrics/Breviary%201960.html):
  §168(d) II-class feast Sunday Psalms; §166(b) Saturday First
  Compline of an ordinary Sunday; §166(h) Sunday II Compline;
  §169(e) III-class feast uses the weekday Psalter;
  §171(e) fourth-class feria uses the weekday Psalter.
- [FSSPX January 2027 Universal Roman calendar](https://ordo.fsspx.org/en/calendar/2027/1):
  independent sanctoral and temporal date classification.

## Exact seven civil evening assignments

| Civil date | Office at Compline | Governing liturgical date | Psalter | Rule |
|---|---|---|---|---|
| Mon 11 January | Epiphanytide feria IV; St Hyginus at Lauds only | 11 Jan | Mon 6/7; 28 focus rows | §171(e) |
| Tue 12 January | Epiphanytide feria IV | 12 Jan | Tue 11/12/15; 26 | §171(e) |
| Wed 13 January | **Commemoration of Baptism II** | 13 Jan | **Sun 4/90/133; 30**, not Wed | 1960 Variationes 24 / §168(d) |
| Thu 14 January | St Hilary, Bishop and Doctor III; St Felix at Lauds | 14 Jan | Thu 69/70; 33 | §169(e) |
| Fri 15 January | St Paul the First Hermit III; St Maur at Lauds | 15 Jan | Fri 76/85; 36 | §169(e) |
| Sat 16 January | **First Compline of Second Sunday after Epiphany** after its First Vespers | **17 Jan** | **Sat 87/102; 41** | §166(b) |
| Sun 17 January | Second Sunday after Epiphany II, after Second Vespers | 17 Jan | Sun 4/90/133; 30 | §166(h) |

**Important contrast:** on 9 January First Vespers of the Holy
Family II-class **feast**, BR §168(d) assigned Sunday Compline.
On 16 January, **ordinary II Sunday** First Vespers triggers Saturday
Compline under §166(b), even though First Vespers have begun. The two
conditions cannot be combined in a simple `firstVespers=>Sunday`
calendar rule.

All seven retain `Psalterium/Mariaant#Nativiti` and the exact pinned
Latin *Alma Redemptoris Mater* with *Post partum / Deus, qui salutis*,
Git blob `bf44a58ba1076b17466b88fa4004c1cab29f96ae`. No
January 13 switch back to Advent formula or to a modern calendar.
The Ordinary Compline `Te lucis` uses its assigned 1960 conclusion,
not a special Epiphany tone converted into text.

## Implemented private source checks

1. Separate finite seven-row JSON research ledger, with source URLs,
   Office date, rank, Psalms, commemorations and explicit source-text
   and public-release holds.
2. Immutable `reviewJan11_17OfficeSource` rejects changed Psalms,
   incorrect Baptism rank, 16 January incorrect Sunday Psalms, wrong
   Office-date rollover, changed Marian ending, and unreviewed dates.
   Successful **research** review never authorizes publication.
3. Isolated source-first, **Latin-only** private pinned reader and
   `assembleJan11_17PrivateOfficeResearchReview`, opt-in and separate
   from generic/private prior-week/public Office API.
4. Seven dated PSL source families, recitation context and minister
   combinations: **28 complete private Latin recitations**. Each must
   preserve the original 42 events, 40 recitation moments, 30/41 or
   weekday Psalm focus rows, Marian leaf source, two blessing Amens
   and presiding minister switch. No synthetic Latin source texts.
5. **28 public zero-fetch negative combinations** across seven dates,
   two contexts and two ministers.
6. **14 actual private browser journeys** on 320px and 390px;
   verified Office-date rollover, Latin-only source, Marian source,
   first/second reading focus and no horizontal overflow.

## Still withheld pending a later public certificate

- No public reading before independently reviewing complete
  1960/1961 original Latin Ordinary and printed Psalm portions,
  source rights, first Vespers and seasonal text; no shortcut from
  calendar research to a publishable Hour.
- No 11–17 January public selector, no English/French Office text,
  no new other Office Hours or locally adapted calendars.
- The 1961 **Mame** Psalter leaf photographic/facsimile collation
  and Gregorian notation remain uncertified; no claim of exact
  edition reproduction.
- Before public authorization: full source-first positive reading
  tests, 14 **public** native 320px/390px journeys and first
  unsupported date 18 January zero-fetch checks, exact-head Required
  main and Office/Mass regression gates, then exact-merge GitHub
  Pages build/deploy/offline snapshot and public 390px EN/FR LIVE–
  Missal/Schola acceptance. **GitHub Actions + GitHub Pages only.**
  No Vercel or paid hosting.

Research PR may be reviewed while 44-date publication remains
unchanged. Private source tests do not constitute release approval.
