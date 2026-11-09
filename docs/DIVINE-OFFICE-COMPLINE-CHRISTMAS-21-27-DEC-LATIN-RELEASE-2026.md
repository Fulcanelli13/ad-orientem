# Roman 1960 Compline · finite Christmas release, 21–27 December 2026

## Product boundary

Seven independently adjudicated universal Roman 1960 **Latin-only** civil
Compline appointments, 21–27 December, extend the original approved 23-day
Advent reader to **30 explicit dates**. Public authorization is implemented
separately by `CHRISTMAS_2026_COMPLINE_RELEASE` and an immutable reviewed
calendar/text certificate in `compline-christmas-2026-release-certificate.js`.
The original `LATIN_COMPLINE_RELEASE.approvedDates` stays 23 (regression
baseline), but the public `latinComplineReleaseEligibility` accepts the
additional seven only when their separate certificate succeeds. No universal
Christmas resolver, no 28 December or later, no non-universal calendars,
no other seven Office Hours, **no English/French translations**.

This is **NOT** a facsimile/verbatim collation to the original 1961 Mame
Psalter pages. It is a release on the historically reviewed **1960 Roman
rubrics + traditional Clementine Vulgate Latin** evidence path.

## Office precedence and Christmas Eve

Independent dated 2026 Office ordo:
https://breviariumgregorianum.com/ordo-2026.php

1960 Roman Breviary rubrics:
https://divinumofficium.hu/www/horas/Help/Rubrics/Breviary%201960.html
and https://isidore.co/divinum/www/horas/Help/Rubrics/Breviary%201960.html

- **21 Dec** — Saint Thomas Apostle II class; BR §168(d) Sunday Compline
  Psalms 4,90,133; Advent Marian ending.
- **22 Dec** — II-class privileged Tuesday feria, BR §171(e);
  weekday Psalms 11,12,15; Advent Marian ending.
- **23 Dec** — II-class privileged Wednesday feria, BR §171(e);
  Psalms 33/60; Advent Marian ending.
- **24 Dec *evening*** — after First Vespers of Christmas, this is
  **First Compline of the Nativity, Office date 25 December**, first-class
  festive rubric BR **§167(b)**. Sunday Psalms 4,90,133. The special
  Christmas **Vigil** rubric BR **§173** governs the vigil Office before
  First Vespers and is not a license to substitute Thursday/Vigil Compline
  once First Vespers begins. This distinction is source-gated.
- **25 Dec** — Nativity of Our Lord, first-class, Sunday Compline
  after Second Vespers, BR §167(h).
- **26 Dec** — Saint Stephen Protomartyr II class. His own Second Vespers
  retains a commemoration of the Sunday within the Christmas Octave;
  **not** I Vespers of Sunday. Sunday Compline under BR §168(d), not Saturday
  psalms. Dated concurrence:
  https://ordo.fsspx.org/en/day/2026-12-26?source=monacensis-et-frisingensis
- **27 Dec** — Sunday within Christmas Octave principal Office;
  Saint John commemorated; Sunday Psalms by BR §§175(e),176.

## Complete Compline structure and seasonal transition

BR §§186,188 fix the Ordinary Compline hymn; §210 the short-lesson blessing;
§241 the chapter **Tu autem in nobis**; §244 the unchanged short responsory;
§248 the unchanged **Visita** collect. BR §§147,179,181 and 247 govern
the examen / initial Pater, presiding-priest or lay dialogue, and the
concluding blessing, Marian antiphon and Divinum auxilium. The original
1961 Mame Ordinary §§54–67 / pp. 132–141 already collated for the public
Advent reader is reused without inventing any Christmas Proper speech.
The existing **42 original source blocks → 40 recitation events** projection,
two blessing Amens, short Per Dominum, Confiteor and recitation choices
are retained. Note: individual Psalm *focus frames* outnumber 40 events.

On **21–23 Dec** the Latin `Psalterium/Mariaant#Advent` ends with
*Angelus Domini* / *Gratiam tuam*. From Compline on **24 December** it
switches to `Psalterium/Mariaant#Nativiti` with
*Post partum* / *Deus, qui salutis*. Independent dated seasonal source:
https://1962ordo.today/season/

The full `Psalterium/Mariaant.txt` Latin leaf is preserved **byte-for-byte**
in `data/office/research/christmas-2026-marian-latin-pinned-source.txt`
from MIT-licensed Divinum Officium revision
`126a07f91ede04664108abb6fb20ace3f4de14b9`.
The exact Git blob SHA is `bf44a58ba1076b17466b88fa4004c1cab29f96ae`.
This was compared to the upstream revision, not reconstructed
or inferred from a modern Marian booklet.

No new Psalm original wording: Sunday Latin Psalms 4/90/133 reuse the
329-word independent dual witness; Tuesday 11/12/15 and Wednesday 33/60
reuse the nine already word-collated ferial psalms (1,536 words total
with explicit documented orthographies). Psalm labels remain editorial,
not spoken Latin.

## Release gate and limits

- Seven **finite dates**, 2 recitation contexts, 2 minister options:
  **28 full positive Latin public reader tests** with exact 42→40 events,
  source links, psalm divisions, seasonal Marian text and 24 Dec
  civil/Office-date distinction.
- **14 320px/390px real public native phone journeys**, including
  compact Christmas date picker, reading, back controls, no horizontal
  overflow, and future-date zero-fetch regression.
- All old Advent/Schola/Mass reader safety workflows must stay green.
- Only after exact-head Source integration, Required main, phone/browser
  CI, and any other required checks pass can the PR leave draft and merge.
- Independently verify **the exact merged commit** via GitHub Pages
  static build, public publication, offline snapshot/service worker, and
  390px EN/FR LIVE–Missal regression. Green PR CI alone is **not** public
  deployment evidence.
- Exclusive zero-cost production pipeline: **GitHub Actions + GitHub
  Pages**. No Vercel, no paid service.
- Original Mame 1961 complete Psalter leaf and translations remain
  uncertified. Never claim exact re-typesetting of that edition.

The historical `*-SOURCE-INTAKE-2026.md` and JSON research record remain
preserved as intake evidence; their **RESEARCH_ONLY** flags do not
themselves authorize public dates. Only this separately reviewed code
certificate can do so.
