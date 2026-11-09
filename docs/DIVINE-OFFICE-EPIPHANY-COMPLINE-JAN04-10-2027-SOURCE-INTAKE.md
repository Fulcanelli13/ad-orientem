# Ad Orientem · Epiphany and Holy Family Compline · 4–10 January 2027

**The seven-date SOURCE INTAKE remains private research only.** A separate
finite certificate on this PR authorizes **4–8 January 2027** as a
Latin-only public release candidate; **9–10 January remain withheld**.

The baseline public 37-date universal Roman 1960 **Latin-only**
Compline release ends on **3 January 2027**. This intake describes
**seven civil dates**, but only the five separately certified dates
4–8 January are eligible for the later public release. The Holy Family
dates 9–10 January remain source-held; no Mass calendar, Office
translation, Ordinary or other Hour is modified. The 2 January 2027 Holy Name first-Compline psalter error
was corrected independently by [PR #2720](https://github.com/Fulcanelli13/ad-orientem/pull/2720)
before this branch was taken.

## Independent sources and precedence

- [ICRSP dated 2027 traditional Office ordo](https://icrspfrance.fr/ordo.php?d=2027-01-03):
  full civil January 2027, including Epiphany 5 January First
  Vespers, Holy Family 9 January First Vespers and Compline
  Sunday psalms. Use its **Office** notes, not Mass propers.
- [FSSPX 5 January 2027 liturgical ordo](https://ordo.fsspx.org/day/2027-01-05?lang=en&mode=liturgical):
  Tuesday IV class, St Telesphorus commemorated at Lauds;
  **First Vespers of Epiphany** in the evening.
- [FSSPX 9 January 2027 liturgical ordo](https://ordo.fsspx.org/day/2027-01-09?lang=en&mode=liturgical):
  Saturday IV class / Saturday BVM during daytime,
  **First Vespers of Holy Family** in the evening.
- [1960 General Rubrics of the Roman Breviary](https://isidore.co/divinum/www/horas/Help/Rubrics/Breviary%201960.html):
  §§167(b,h), 168(d), 171(e), 188; First Compline after
  First Vespers of an I-class feast uses Sunday psalms;
  Compline of a II-class semifestive feast uses Sunday psalms.
  **BR §166(b) Saturday psalms is the ordinary Sunday Office
  rule**; it does not replace an expressly appointed II-class
  festive Compline.

| Civil evening | Governing Compline | Office date | Source Psalms | 1960 rubric |
| --- | --- | --- | --- | --- |
| Mon 4 Jan | Christmas-season feria IV | 4 Jan | Monday 6, 7 (28 display rows) | §171(e) |
| Tue 5 Jan | **First Compline of Epiphany I** | **6 Jan** | **Sunday 4,90,133** (30) | §167(b) |
| Wed 6 Jan | Epiphany I after II Vespers | 6 Jan | Sunday 4,90,133 (30) | §167(h) |
| Thu 7 Jan | Epiphany-season feria IV | 7 Jan | Thursday 69,70 (33) | §171(e) |
| Fri 8 Jan | Epiphany-season feria IV | 8 Jan | Friday 76,85 (36) | §171(e) |
| Sat 9 Jan | **First Compline of Holy Family II** | **10 Jan** | **Sunday 4,90,133** (30), not Saturday | §168(d) |
| Sun 10 Jan | Holy Family of Jesus, Mary and Joseph II | 10 Jan | Sunday 4,90,133 (30) | §168(d) |

The source events for Monday include [6,7,7] because Psalm 7 is
printed as two source portions; for Thursday [69,70,70], and for Friday
[76,76,85]. These are **printed Psalm divisions**, not duplicate
liturgical psalms. The fixed 42 source events still project to 40
reading moments, across two recitation contexts and two ministers.

## Marian formula and Epiphany-specific textual holds

All seven dates preserve the already byte-verified pinned
`Psalterium/Mariaant#Nativiti` Latin ending of *Alma Redemptoris
Mater*, with **Post partum / Deus, qui salutis**. Epiphany is **not**
a Marian-antiphon switch. The pinned Divinum Officium Latin file's
Git blob SHA is `bf44a58ba1076b17466b88fa4004c1cab29f96ae`.

**Critical discrepancy, do not silently choose a hymn variant:**
[ICRSP dated Holy Family ordo](https://icrspfrance.fr/ordo.php?d=2027-01-03)
specifies *Complies du dimanche, ton de l'Épiphanie
(doxologie Jesu tuis)* for 9–10 January. However the authentic
1960 Roman Breviary §188 says each hymn has its **assigned Breviary
conclusion**, without an arbitrary season/feast change.
A [1962-versus-earlier rubrical comparison](https://ordorecitandi.blogspot.com/2020/01/)
specifically describes the 1962 Holy Family Te lucis as having the
**ordinary doxology**, unlike earlier books with a proper doxology.

Consequently, **the proper Holy Family Compline hymn/doxology
is not source-certified in this batch**. The pinned generic Latin
`Te lucis ante terminum` has its own source conclusion
`Præsta, Pater piíssime...`. The private reader may show this as
the actual pinned source text but must **not** claim that any Holy
Family special 1961 edition variant has been independently adjudicated.
Separately, any **Epiphany chant tone** is an editorial/music programme
issue; this Latin text-only reader must not invent melodies or replace
words based on the label *Ton de l'Épiphanie*.

For the 5 and 6 January Epiphany I-class Offices, the same distinct
question of proper chant tone and source hymn assignment is held
pending exact printed-edition cross-check; no other seven Office Hours
or bilingual text is being authorized.

## Implemented research code and release gate

The branch includes:

- `data/office/research/compline-epiphany-jan04-10-2027-source-intake.v1.json`:
  seven complete dated source hypotheses and explicit Holy Family
  hymn-doxology holds;
- `src/office/compline-epiphany-jan04-10-2027-source-gate.js`:
  immutable expected office dates, precedence, source psalms and
  **fail-closed RESEARCH_ONLY** appointments;
- `assembleJan04_10PrivateOfficeResearchReview`:
  opt-in **Latin-only source-first** parser, deliberately outside
  generic private and production Office readers;
- `tests/divine-office-epiphany-jan04-10-source-intake.mjs`:
  date mutation and doxology holds; 7 dates × 2 contexts × 2
  minister choices all remain **WITHHELD BEFORE FETCH** publicly;
- `tests/divine-office-epiphany-jan04-10-private-complete-compline.mjs`:
  **28 full private Latin projections**, correct psalms, Office-date
  rollovers, 42 source / 40 printed recitation moments;
- `tests/divine-office-private-phone-browser.mjs`:
  **14 additional 320px/390px private phone journeys** with Marian
  provenance, Latin-only display and no horizontal overflow.

**Release split and mandatory gates:** the separately source-reviewed
five-day 4–8 January certificate can be shipped without adjudicating
9–10 January, because those two dates remain withheld in every public
gate **before fetch**. The five-day public candidate must pass source-
driven Latin and native 320/390px tests. Independently adjudicate the
**Holy Family hymn/doxology** against the original 1961/1962
Compline text witness before any subsequent 9–10 January release.
Do not infer approval for 9–10 January from the five-day certificate. After any future merge, verify the
**exact commit** GitHub Pages static build, site deployment, public
offline/snapshot and 390px EN/FR LIVE–Missal/Schola regressions.
GitHub Actions + GitHub Pages exclusively, **no Vercel**.

The original 1961 Mame Psalter photofacsimile remains uncertified;
we do not claim original printed-word or engraved notation parity.
