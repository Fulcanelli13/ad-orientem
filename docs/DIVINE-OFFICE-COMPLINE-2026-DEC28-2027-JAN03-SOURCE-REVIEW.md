> **Source correction (9 November 2026):** The initial research classified
> 2 January 2027 as Saturday Compline under ordinary Sunday BR §166(b).
> The independently dated ICRSP ordo explicitly says *Complies du dimanche*
> after First Vespers of the II-class Most Holy Name. BR §168(d) governs.
> The release and associated tests have been corrected to Sunday psalms.

# Divine Office Compline — 28 December 2026 through 3 January 2027

**Status: PRIVATE RESEARCH; not yet a public Latin Compline release.**
Existing 30 universal Latin dates through **27 December 2026** remain the
public whitelist, unchanged on this branch. The new seven dates are
explicitly withheld before any public Office text is fetched.

## Independent calendar and rubric sources

1. [Breviarium Gregorianum, 2026 Office ordo](https://breviariumgregorianum.com/ordo-2026.php):
   28 Dec Holy Innocents (II), 29–31 Dec Nativity octave days (II);
   31 Dec omits its own Vespers, yielding to the next first-class feast.
2. [Rubricae Breviarii Romani, 1960](https://isidore.co/divinum/www/horas/Help/Rubrics/Breviary%201960.html):
   §168(d) II-class festive Compline = Sunday psalms; §175(e)
   **Christmas octave day Compline = Sunday psalms**, including
   29 and 30 December (not the current weekday psalms);
   §175(d) vespers yield to an ensuing I-class feast,
   §167(b) first-class Compline after First Vespers = Sunday psalms,
   §167(h) first-class II Vespers Compline = Sunday psalms,
   and §166(b) First Compline of a Sunday = Saturday psalms.
3. [FSSPX 1962 dated universal ordo, January 2027](https://ordo.fsspx.org/en/calendar/2027/1):
   Jan 1 Circumcision of Our Lord I; Jan 2 fourth-class feria;
   Jan 3 Most Holy Name of Jesus II.
4. [FSSPX 2 January 2027 Vespers concurrence](https://ordo.fsspx.org/day/2027-01-02?lang=en):
   explicitly **First Vespers of the Most Holy Name** on 2 January,
   but the *II-class semifestive* Office follows **Sunday Compline**
   per BR **§168(d)** (not Saturday under ordinary Sunday §166(b)).
   The [dated ICRSP Office ordo](https://icrspfrance.fr/ordo.php?d=2027-01-03)
   explicitly specifies: First Vespers of Holy Name, *Complies : du dim.*
5. Existing pinned MIT-licensed
   [Divinum Officium Latin Marian leaf](https://github.com/DivinumOfficium/divinum-officium/blob/126a07f91ede04664108abb6fb20ace3f4de14b9/web/www/horas/Latin/Psalterium/Mariaant.txt):
   unchanged exact byte-verified `[Nativiti]` Latin antiphon
   *Post partum* and `Deus qui salutis`; upstream Git blob SHA
   `bf44a58ba1076b17466b88fa4004c1cab29f96ae`.

None of the above are modern-calendar Mass readings substituted into
the Divine Office. The universal 1960 Office rubric and date assignment
control every entry.

## Seven explicit civil-date appointments

| Civil date | Office at Compline | Office date | Psalter | Rule |
| --- | --- | --- | --- | --- |
| Mon 28 Dec | Holy Innocents II class | 28 Dec | Sunday 4/90/133 | §168(d) |
| Tue 29 Dec | Fifth day within the Nativity Octave II | 29 Dec | Sunday 4/90/133 | §175(e) |
| Wed 30 Dec | Sixth day within the Nativity Octave II | 30 Dec | Sunday 4/90/133 | §175(e) |
| Thu 31 Dec | **First Compline of the Circumcision** | **1 Jan 2027** | Sunday 4/90/133 | §§175(d),167(b) |
| Fri 1 Jan | Circumcision, Octave Day of the Nativity, I | 1 Jan | Sunday 4/90/133 | §167(h) |
| Sat 2 Jan | **First Compline of the Most Holy Name** | **3 Jan 2027** | **Sunday 4/90/133** | §168(d) |
| Sun 3 Jan | Most Holy Name of Jesus II | 3 Jan | Sunday 4/90/133 | §168(d) |

A technical point: the first and second psalm sets correspond to **30
editorial focus frames** for each date in this batch, not to the number of
distinct liturgical source events; the Office remains 42 original source
events projected to 40 printed-ordinary moments. The *Nativiti* ending
remains until the Candlemas boundary; a civil January transition does
not reactivate the Advent formula.

## Implemented research controls

- A seven-row machine-readable date ledger
  (`data/office/research/compline-dec28-jan03-2027-source-intake.v1.json`)
  records Office date, class, precedence, psalm source family, Julian
  year crossover (civil 31 Dec / Office 1 Jan), First Vespers of the Holy
  Name (civil 2 Jan / Office 3 Jan) with **II-class Sunday Compline**,
  and negative release holds.
- A separately opted-in source-first Latin parser
  (`assembleDec28Jan03PrivateOfficeResearchReview`) prevents new
  dates from entering the ordinary private and 21–27 Dec private APIs.
- A fail-closed `reviewDec28Jan03ComplineResearch` checks every date
  and prevents an audited research match from being used as an authorization.
- Two dedicated tests in the Office integration workflow: seven distinct
  calendar appointments, mutation/negative gates, and **28 private
  complete Latin recitation combinations** (seven dates × two
  recitation contexts × two presiding minister options). Both
  exclude any authorization to publish or independently certify the
  Latin printed source.

## Outstanding before release

**Do not merge as a public release.** First run and inspect exact-head
Office and mobile CI. Then independently certify the complete 1960/1961
Latin Ordinary for this week's proper concurrence; test 14 native 320px
and 390px browser journeys, including 31 Dec–1 Jan and 2–3 Jan title/
date distinctions; introduce a separate immutable seven-date public
certificate and explicit public release gates; verify all exact-head PR
checks. Release only after the **exact merge SHA** successfully builds,
publishes to **GitHub Pages**, passes offline/snapshot checks and retains
390px EN/FR LIVE–Missal/Schola regressions. Do not deploy via Vercel.

The original 1961 Mame Psalter photographic/facsimile collation remains
uncertified and must not be claimed. No Office English/French translation,
local calendars, 4 Jan onward, or other seven canonical Hours are
authorized by this work.
