# Divine Office · source-first 1960 Roman Calendar / Compline resolver

## Release and authority boundaries

The **28 November–5 December 2026** universal Latin Compline release is already
public at merge SHA `e9fdd0f2cd8aa6410bea39537d0d4445e68b16e2`.
GitHub Pages build, publication, 390px EN/FR LIVE–Missal and public
offline/snapshot verification all passed in
[run #42532332725](https://github.com/Fulcanelli13/ad-orientem/actions/runs/42532332725).

This increment adds a **research-only, source-first dated Roman Office ordo
resolver**, without publishing a ninth date, without expanding to any other
Hour, and without replacing the eight-date source/edition/rights release
gate. Its authority is separate from the Mass calendar.

Primary rubric: 1960 *Rubricae Breviarii Romani*, especially §§165–176
and 180–181, as republished in Latin and French by
[ICRSP, Province de France](https://icrspfrance.fr/textes-liturgiques.php?article=a0149_ancien).

The Office-specific source is a required **input**, not fabricated from a
Gregorian weekday, Mass class, an AI title, or a remote page URL. The caller
must supply a dated independent Office appointment with:
- exact Gregorian date and actual weekday;
- universal Roman Breviary 1960 source and pinned Psalter
  `Psalterium/Psalmi/Psalmi minor#Completorium`;
- independently adjudicated principal Office, occurrence,
  commemoration/transfer disposition, and any first-Vespers concurrence;
- Office family (Sunday, I/II/III-class feast, feria, vigil, Christmas
  octave or Saturday BVM), explicit source-owned Marian section and actual
  `Psalterium/Mariaant` witness;
- an affirmative finding that the selected Compline is **not** a
  Triduum, Office of the Dead, Easter/Pentecost special Office, Christmas
  Vigil, other privileged exception or proper Compline.

The resolver then verifies the expected Psalter weekday and the relevant
1960 rubric. It **cannot itself certify source authenticity**, grant a
translation right, collate the complete Hour, or authorize a public
release. Its successful result is deliberately named
`OFFICE_PSALTER_APPOINTMENT_RESEARCH_ONLY`.

## Tested rule matrix

| Independently reviewed Office | Expected Compline source | Primary rule |
| --- | --- | --- |
| Sunday after II Vespers | Sunday psalter | BR §166(h) |
| Saturday after a Sunday’s I Vespers | **Saturday** psalter | BR §166(b) |
| Before I-class feast after its own I Vespers | Sunday psalter | BR §167(b) |
| I-class feast after II Vespers | Sunday psalter | BR §167(h) |
| II-class feast | Sunday psalter | BR §168(d) |
| III-class feast | Current civil weekday | BR §169(e) |
| Saturday Office BVM | Saturday psalter, only Saturday | BR §169(e) |
| Ordinary feria or nonexceptional vigil | Current weekday | BR §171(e) |
| Days within Christmas octave without special competing Office | Sunday psalter | BR §175(e) |
| Triduum, Office of Dead, Easter/Pentecost exceptional Office, Christmas Vigil, proper Compline | **WITHHELD** until separate primary-source decision | BR §§165, 170, 177, 180–181 |

**Crucial:** the same civil date may require an officeDate belonging to
the next day after independently verified First Vespers. The resolver
refuses to infer that solely because a day is Saturday or a feast is
nearby. General Office occurrence and concurrence are separately
researched in `src/office/precedence-review.js`.

The seasonal Marian section must be independently supplied as one of the
existing pinned original source section keys:
`Advent`, `Nativiti`, `Quadragesimae`, `Paschalis`, or
`Postpentecost`. The calendar **does not guess** the antiphon from a
Gregorian month. The source-owned Marian antiphon, versicle and collect
still need a complete textual verification for any new public date.

## Exact integration

- `src/office/office-ordo-compline-resolver.js` is a pure, deterministic,
  network-free Office-ordo intake and rules engine. It validates
  authority/provenance fields, weekday, rank, Marian source, first Vespers
  and exception status, with a strict fail-closed result.
- The existing `src/office/compline-advent-2026-appointments.js` now
  cross-checks every one of its **eight fixed published appointments**
  through the new resolver. Any disagreement **withholds** the date.
  This is a second substantive gate; the separate public Latin collation
  certificate is unchanged.
- `summarizeSourceFirstComplineCoverage({year,records})` builds
  a 365/366-day annual **research ledger**, with `sourceReviewed`,
  `withheld` and `published:0` (the new resolver never releases).
  Supplying the eight existing source records for 2026 returns
  **8 source-reviewed, 357 withheld, 0 newly published by the resolver**.
  This is not a claim that other dates lack a traditional Office; it
  means their independent dated evidence has not yet entered the register.
- `tests/divine-office-source-first-calendar-resolver.mjs` covers all
  eight published dates and future-date research proofs, I-class first
  Vespers, Sunday-vs-Saturday distinction, II/III class, Christmas octave,
  exact February leap/date validation, source spoofing, Mass calendar
  substitution, no unapproved date exposure, local overlays, proper
  exceptions, and a full leap-year ledger.

`officeRouteState` and `latinComplineReleaseEligibility` remain
**independent publication boundaries**. A coherent new Office source
record cannot enable the public reader or fetch original Latin by itself.

## Next acquisition and adjudication gates

1. Acquire and independently reconcile an **Office-specific**
   dated ordo for the 1960 Roman Breviary across the intended year;
   link each principal day to a trusted primary witness, including
   occurrence, feast rank, transfers and local-scope exclusions. The
   Mass Calendar is **context only**, never authority.
2. Review concurrence for every First Vespers and feast, recording
   officeDate and actual Compline Psalter. Prioritize 6 December Advent II,
   7–8 December and privileged Christmas boundaries after this eight-day
   proof, but do **not** assume they are already certified.
3. Resolve full five-season Marian antiphon schedules and proper
   exceptional Hours. Source text includes several conditional rubrics,
   which must not be silently discarded. Verify the 1961-pattern
   traditional Vulgate, not the Pius XII alternative.
4. For each new date, run original pinned Latin source extraction,
   two recitation contexts, priest/non-priest dialogue alternatives,
   short conclusion and 42→40 Ordinary event projection, complete Psalm
   comparison, and 320px/390px reader acceptance. Only an explicit
   signed-off dated release profile can add a date to the public manifest.
5. Keep all seven other Office Hours and EN/FR translations withheld
   pending their **own** complete-text and rights certification.

## Deployment policy

GitHub repository source of truth, GitHub Actions tests, and GitHub
Pages only. No Vercel; no research raw scrape exposed in the curated
static release. A passing resolver test is research provenance only,
not a user-visible claim that the full-year Office is complete.
