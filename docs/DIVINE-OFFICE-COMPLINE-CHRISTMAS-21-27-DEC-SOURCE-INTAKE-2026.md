# Roman 1960 Office — Christmas transition Compline, 21–27 December 2026

**Research intake only — NOT a production release, NOT a seven-date certification.**
Production currently authorizes the *finite* Latin-only 28 November–20 December
2026 Compline sequence, with 23 independently reviewed civil dates. Dates
21 December onward must continue to withhold *before source fetch* until their
own complete Office, Latin, UI and release tests are approved.

## Primary calendar and rubric witnesses

1. Independent dated **1960 Roman Office ordo**:
   https://breviariumgregorianum.com/ordo-2026.php (21–27 December).
   This independently identifies the Office of each date and explicitly indexes
   **I Vespers / I Compline of Christmas under 25 December**, which take place
   on the **evening of 24 December**. Do not mislabel this as an ordinary
   Thursday/Vigil Compline.
2. General Breviary rubrics **1960** §§ 165–176, in particular
   § 167(b,h) for first and second Christmas Compline, § 168(d) for a
   II-class feast, § 171(e) for ferias, § 173 for the Christmas vigil
   *special order*, § 175(e) for Christmas-octave Sunday Compline,
   and § 176 for the Sunday within the Octave:
   https://isidore.co/divinum/www/horas/Help/Rubrics/Breviary%201960.html
3. Independent traditional 2026 Vespers / concurrence corroboration:\n   - [St Thomas 21 Dec](https://ordo.fsspx.org/day/2026-12-21?lang=en): II-class feast and feria commemorated.\n   - [Vigil 24 Dec](https://ordo.fsspx.org/en/day/2026-12-24?source=nullius&texts=readings): First Vespers of the Nativity on civil Christmas Eve.\n   - [St Stephen 26 Dec](https://ordo.fsspx.org/day/2026-12-26?lang=en): **Vespers of St Stephen**, with the Sunday within the Christmas Octave commemorated, **not First Vespers of Sunday**.\n   - [Sunday 27 Dec](https://ordo.fsspx.org/day/2026-12-27?lang=en): Sunday Office, with St John commemorated.\n4. Seasonal independent guidance for **Alma Redemptoris Mater**:
   on 21–23 December the Advent `Angelus Domini` versicle/collect;
   *at Compline on 24 December* it changes to **Post partum**
   and **Deus, qui salutis**, remaining so during Christmastide:
   https://1962ordo.today/season/
5. 2026 universal calendar and concurrence cross-check:
   https://latinmasspropers.com/calendar/2026/
   Mass calendar supports *rank / saint commemoration only*; it does NOT
   authorize Compline psalm or text assignments.

## Seven candidate date-specific appointments — WITHHELD

| Civil evening | Office / concurrence (source intake) | Compline psalter research hypothesis | Marian verse & collect | Certification |
| --- | --- | --- | --- | --- |
| Mon 21 Dec | St Thomas Apostle II class; Advent feria commemorated | **Sunday**, from festive II-class rule §168(d) | Advent `Angelus Domini` | WITHHELD |
| Tue 22 Dec | II-class Advent feria | **Tuesday** (§171(e)); earlier source Psalm 11/12/15 candidates | Advent | WITHHELD |
| Wed 23 Dec | II-class Advent feria | **Wednesday** (§171(e)); earlier source Psalm 33/60 candidates | Advent | WITHHELD |
| Thu 24 Dec | Christmas Vigil I class by day; **Christmas I Vespers in evening** | **Sunday**, first festive Compline §167(b), but verify §173 exception and complete source text | **Christmas `Post partum` + `Deus, qui salutis`** | WITHHELD |
| Fri 25 Dec | Nativity of the Lord I class, after II Vespers | **Sunday** (§167(h)); full Christmas source collation needed | Christmas | WITHHELD |
| Sat 26 Dec | St Stephen Protomartyr II class; **his own II Vespers**, Sunday commemorated | **Sunday**, not Saturday; §168(d) | Christmas | WITHHELD |
| Sun 27 Dec | **Sunday within Christmas Octave**, II class; St John commemorated | **Sunday**, §175(e), §176; not a 27 Dec St John II-class Office | Christmas | WITHHELD |

These are source-informed **research hypotheses**, not executable Office
appointments. Verify each against its dated Breviary Compline (including
antiphons, short lesson, hymn, conclusion and Marian formulary). In
particular:

- **24 Dec**: the independent ordo places the **first Compline of the
  Nativity** under 25 December's liturgical Office. Explicitly resolve civil
  date 24 / liturgical officeDate 25, vigil-to-First-Vespers concurrence,
  special §173 rubrics, and Christmas Marian ending; do not bypass the
  current resolver's `CHRISTMAS_VIGIL` special-state hold.
- **26 Dec**: Saturday does **not** imply the Saturday psalter here.
  Distinguish St Stephen's II-class festive Office from I Vespers of the
  Sunday in the Octave; no generic Saturday-to-Sunday rewrite is permitted.
- **27 Dec**: Sunday in the Octave is the principal Office. St John is
  a commemoration rather than the principal Office for the date.
- The Advent **O antiphons** of 21–23 December belong to *Magnificat
  at Vespers*, not Compline's Marian antiphon.
- **No fabricated Mame 1961 facsimile certificate**: compare the complete
  pinned Latin text and state what independent witness was actually used.

## Executable source-intake guard (draft PR #2702)\n\nThe draft now includes `src/office/compline-christmas-2026-research-gate.js`\nand `tests/divine-office-christmas-source-intake.mjs`, wired to the dedicated\nOffice integration workflow. These compare all seven fixed Office, weekday,\npsalter, Marian-ending and concurrence research assertions with the external\nJSON intake ledger. Deliberate mutations of 24/26/27 December and all\n7 dates × 2 recitation contexts × 2 ministers are tested **to remain\nWITHHELD with zero network fetches**. These are **28 negative safety checks**,\nnot 28 certified complete Office recitations. Full Latin source collation\nand phone acceptance for newly released dates are still required.\n\nThe production reader, public date whitelist, general Office resolver and\nexisting 23 certified Advent dates are unchanged by this research PR.\n\n## Required implementation gates (do not merge based on this ledger)

1. Independently archive exact-date Office witnesses and independently
   compare *every new Latin string* to a suitable second Latin witness.
   Reuse prior full-word psalm certificates only where the same exact
   source text and divisions are demonstrated.
2. Add the finite dated Office calendar evidence, including
   `officeDate=2026-12-25` on **24 December evening**, precise
   first-Vespers exception and Marian `Nativiti` source section.
   Resolver must remain **research-only** unless separately authorized;
   unrelated dates and local calendars must withhold before fetch.
3. Test all seven dates in both recitation contexts and both minister
   modes (28 full variants), plus source integrity and negative tests.
   Specifically assert against wrong 24 December weekday psalms, wrong
   Marian Advent collect, wrong 26 December Saturday psalter, and wrong
   27 December St John principal Office.
4. Run 14 real phone journeys, **320px and 390px**, native Prayer reader,
   Latin-only, accessible selector, no horizontal overflow, correct Back.
5. Exact-head Required main gate, Office source integration and native
   browser gates must pass; use **GitHub Actions + GitHub Pages ONLY**.
   After merge, verify *the exact merge commit* via build, Pages publication,
   public snapshot / offline reload, and 390px EN/FR LIVE–Missal regression.
   No Vercel. Do not report this batch as live until all checks finish.

## Existing production baseline

- 14–20 Dec merged PR #2700: https://github.com/Fulcanelli13/ad-orientem/pull/2700
- Merge SHA: `2a99ce018427e0fc33065a3f94912ebc1634dec0`
- Exact-commit GitHub Pages certification:
  https://github.com/Fulcanelli13/ad-orientem/actions/runs/42543270249
- All four production jobs succeeded, independently checked 9 November 2026.

**This document changes no production reader, calendar resolver, appointment
whitelist, psalm source, translation or release workflow.**
