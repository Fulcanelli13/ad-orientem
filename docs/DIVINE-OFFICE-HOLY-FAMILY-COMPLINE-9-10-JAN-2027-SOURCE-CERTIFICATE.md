# Holy Family Compline · 9–10 January 2027

**FINITE LATIN-ONLY PUBLIC RELEASE CANDIDATE — not merged or deployed.**
This releases exactly the two previously withheld civil dates 9 and
10 January 2027, extending the preceding 42 approved public Compline
dates through 8 January to 44 dates. Every other Hour and language,
local calendar and date from 11 January onward remains withheld.

## Definitive source comparison

1. **[1960 General Rubrics of the Roman Breviary, §§186–188](https://isidore.co/divinum/www/horas/Help/Rubrics/Breviary%201960.html)**:
   at Compline the hymn assigned in the Ordinary is always said (§186),
   a hymn proper to another Hour is not transferred (§187), and each
   hymn retains its own prescribed conclusion regardless of feast or
   season (§188). The distinct II-class semifestive BR §168(d) calls for
   Sunday Compline after First and Second Vespers.
2. **[ICRSP dated 2027 Office ordo](https://icrspfrance.fr/ordo.php?d=2027-01-09)**:
   9 January after First Vespers of the Holy Family II class, and
   10 January after its Second Vespers, take *Complies du dimanche, Ton
   de l'Épiphanie*. However it also explicitly writes
   `doxologie Jesu tuis`. This direction **conflicts with
   applying the 1960 §§186–188 to the assigned Te lucis ordinary
   conclusion**. It is recorded as a secondary-source difference,
   not silently suppressed.
3. **[1962 comparison from The Saint Lawrence Press](https://ordorecitandi.blogspot.com/2020/01/?m=0)**:
   explicitly distinguishes the older Holy Family proper conclusion
   from 1962 books: *At Compline and the Hours the hymns have the
   ordinary Doxology.* The [2021 comparison](https://ordorecitandi.blogspot.com/2021/01/?m=0)
   repeats this distinction. This is an independent rubric-history
   witness, not the controlling source.
4. **Exact upstream pinned Latin source (MIT; revision
   `126a07f91ede04664108abb6fb20ace3f4de14b9`)**:
   `web/www/horas/Latin/Psalterium/Special/Minor Special.txt`,
   **Git blob `34dc6ce45b64442f36de81cfac6160e733e92316`**,
   `[Hymnus Completorium]`:

   - Opening: *Te lucis ante terminum*;
   - Assigned Ordinary conclusion: *Præsta, Pater piissime... Cum
     Spiritu Paraclito regnans per omne sæculum. Amen.*

   A **different** original Holy Family proper leaf,
   `web/www/horas/Latin/Tempora/Epi1-0.txt`,
   **Git blob `df64bda0db4cae456ffe1f7a83f7a02cfefc67b0`**,
   has section `[Doxology]` with
   *Jesu, tuis obediens... Semper tibi sit gloria*. This is the
   feast's proper hymn conclusion. No approved text source attaches
   it to the Compline Ordinary under 1960 §§186–188.

**Certification decision:** the universal Roman **1960** Compline
reader shall print the unchanged **Ordinary Te lucis conclusion**,
not the older or feast-local doxology. The ICRSP phrase is preserved
as an explicit dissenting secondary-source notation. Musical
`Ton de l'Épiphanie` is a separate Schola/notation issue;
the Latin text reader does **not** claim to reproduce a melody.

## Appointments

| Civil date | Office date | Compline | Roman 1960 |
| --- | --- | --- | --- |
| Sat 9 January 2027, after Holy Family First Vespers | **10 January** | Sunday Psalms **4/90/133** | II-class BR §168(d) |
| Sun 10 January, after Holy Family Second Vespers | **10 January** | Sunday Psalms **4/90/133** | II-class BR §168(d) |

The 42 original Roman Compline source events yield 40
recitation moments, independently tested under the two recitation
contexts and two presiding-minister options. All 30 Psalm editorial
focus frames use previously independently reviewed Sunday Clementine
Vulgate Latin. `Psalterium/Mariaant#Nativiti` continues with
*Post partum* and *Deus qui salutis*, pinned Git blob
`bf44a58ba1076b17466b88fa4004c1cab29f96ae`.

## Source and security release guards

- New immutable `HOLY_FAMILY_2027_LATIN_COMPLINE_RELEASE` contains
  exactly two explicit dates. Earlier 23+7+7+5 cohorts are
  unchanged, so no general Epiphany-calendar inference is possible.
- `reviewHolyFamily2027LatinComplineCertificate` requires the
  exact dated rubrics, Office-date precedence, two original Latin
  Git blob IDs, assigned hymn text, Marian source and the recorded
  ICRSP conflict. Mutation of any of these flags or source IDs
  **fails closed**.
- At actual public source loading, before publishing frames,
  **verify three hymn stanzas from the pinned Ordinary** and the
  presence of *Te lucis* and *Præsta Pater*. A substituted
  *Jesu tuis* doxology **fails closed**.
- Dedicated tests: 2 dates × 2 recitation contexts ×
  2 ministers = **8 full positive PUBLIC Latin readings**;
  explicit injection of the proper Vespers doxology must be
  refused before the UI can publish text.
- Dedicated 320px/390px native Prayer browser acceptance must
  cover both dates and their Office date (4 new journeys),
  returning navigation and source integrity.
- **11 January onward**, other seven Office Hours, local calendars,
  English/French text and the 1961 Mame facsimile Psalter remain
  explicitly withheld.

## Independent acceptance before release

1. All exact PR-head required-main, Office source-first, real
   320px/390px phone and triggered Mass/Schola source checks green.
2. Squash merge only a frozen verified head SHA.
3. Verify the **exact merged SHA** by GitHub Pages static build,
   publication, public offline snapshot/update checks and 390px
   EN/FR LIVE–Missal/Schola regression before saying the 44-date
   version is **live**.
4. Deployment remains **GitHub Actions + GitHub Pages only**;
   no Vercel and no paid infrastructure.

This is a **traditional Vulgate text/rubrical certificate**;
not a photographed/word-for-word reproduction of the
original Mame 1961 Psalter or Gregorian chant notation.
