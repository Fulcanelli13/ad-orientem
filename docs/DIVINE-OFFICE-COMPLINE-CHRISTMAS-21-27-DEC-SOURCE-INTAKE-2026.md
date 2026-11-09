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

## Executable source-intake guard (draft PR #2702)\n\nThe draft now includes `src/office/compline-christmas-2026-research-gate.js`\nand `tests/divine-office-christmas-source-intake.mjs`, wired to the dedicated\nOffice integration workflow. These compare all seven fixed Office, weekday,\npsalter, Marian-ending and concurrence research assertions with the external\nJSON intake ledger. Deliberate mutations of 24/26/27 December and all\n7 dates × 2 recitation contexts × 2 ministers are tested **to remain\nWITHHELD with zero network fetches**. These are **28 negative safety checks**,\nnot 28 certified complete Office recitations. Full Latin source collation\nand phone acceptance for newly released dates are still required.\n\n### Pinned Marian Latin source-byte witness\n\nThe upstream `DivinumOfficium/divinum-officium` `web/www/horas/Latin/Psalterium/Mariaant.txt` at fixed revision `126a07f91ede04664108abb6fb20ace3f4de14b9` is snapshotted unmodified at `data/office/research/christmas-2026-marian-latin-pinned-source.txt`. Its Git blob SHA-1 is `bf44a58ba1076b17466b88fa4004c1cab29f96ae`. The blocking test `tests/divine-office-christmas-marian-source.mjs` hashes the exact byte stream with the canonical Git blob header. It contrasts Latin `[Advent]` (Angelus Domini / Gratiam tuam) against `[Nativiti]` (Post partum / Deus, qui salutis), requires Christmas starting the **24 December evening**, and leaves the entire reader authorization unchanged. This is an *exact pinned-source snapshot*, **not** a word-for-word independent 1961 Mame leaf comparison or a complete Christmas Compline source certificate. Existing Divinum Officium MIT attribution remains shipped.\n\nThe production reader, public date whitelist, general Office resolver and\nexisting 23 certified Advent dates are unchanged by this research PR.\n\n## Source-fed private Latin reading proof (9 November 2026)

This draft now has a **separate, opt-in private Christmas research entry**
(`assembleChristmas2026PrivateOfficeResearchReview`), while the original
private reader and the public `LATIN_COMPLINE_RELEASE` whitelist remain
restricted to the preceding **23 certified dates** (ending 20 December).

The isolated research adapter reads exactly the pinned Latin Psalter,
Ordinary, short lesson, hymn, Compline psalms, and Marian text from the
existing proven source family, using each of the **seven fixed research
appointments**. `tests/divine-office-christmas-private-complete-compline.mjs`
checks 7 dates × 2 recitation contexts × 2 minister choices = **28
*positive, complete PRIVATE source recitation projections***. Each returns
42 original source events and 40 post-projection printed-ordinary events,
the appropriate 30/26/30/30/30/30/30 psalm focus rows, proper Office dates,
two blessing Amens and the precise `[Advent]` or `[Nativiti]` Latin
Marian source. No English/French text is asserted. These are not independently
certified public Christmas Offices; Christmas Vigil §173 / first festive
Compline textual exceptions require independent printed/source adjudication.

The private-only preview at `previews/private-divine-office.html` includes
these dates in **Latin-only** source mode. Its phone-browser suite now performs
**14 source-driven private reader journeys**, seven at 320px and seven at
390px, asserting 42/40 source/reading moments, civil versus liturgical
Office date, the exact Marian section, source-backed navigation, one-column
Latin layout and absence of horizontal overflow. The existing public Prayer
reader still refuses all 21–27 December dates *before fetch* in all 28
context/minister combinations.

The four exact-head workflows on source-and-phone commit
`718cb715a937fac7bac3438ac1a81a1b26fd0766` all PASSED:

- [Required main gate #42580879102](https://github.com/Fulcanelli13/ad-orientem/actions/runs/42580879102)
- [Office source-first integration #42580878953](https://github.com/Fulcanelli13/ad-orientem/actions/runs/42580878953)
- [320/390 private browser and native Prayer return #42580879044](https://github.com/Fulcanelli13/ad-orientem/actions/runs/42580879044)
- [Mass Preface source gate #42580879085](https://github.com/Fulcanelli13/ad-orientem/actions/runs/42580879085)

This CI evidence is **private-reader quality assurance only**, not proof
of publication-level liturgical correctness. Do not merge as a public
release and do not add dates to any published date/Hour whitelist before
all remaining source approvals.

## Required implementation gates (do not merge based on this ledger)

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
