# Divine Office — 2026–2027 calendar cross-check and independent Ordo hold

**Actual status:** 5,840/5,840 Roman 1960 Latin source Hours already
extracted and semantically arranged ([PR #2751](https://github.com/Fulcanelli13/ad-orientem/pull/2751)).
This PR does not release any additional public Office Hour.

## Independent witness attempt: source unavailable from CI

[FSSPX Ordo's published API](https://ordo.fsspx.org/en/export/api)
documents a complete **1962 Roman calendar** in one JSON request per year,
including daily principal observances, ranks, commemorations and evening
Vespers. This is a useful genuinely separate calendar engine; it still
cannot certify the verbatim **1961 Breviary text**.

The first [GitHub Actions attempt #42628420113](https://github.com/Fulcanelli13/ad-orientem/actions/runs/42628420113)
reached the endpoint but received **HTTP 403 on all requests**. It
did **not** obtain a valid independent calendar. The site is not
being probed with proxies, alternate identities or repeated bypasses.
The blocked read has been removed from required CI.

`tools/office-ordo/independent_ordo_concordance.py` remains as a
**no-network, input-file-only** comparison utility, independently
unit-tested against synthetic 730-day witnesses. It can be executed
later if authoritative original source files are legitimately obtained.
It does **not** claim a successful live audit.

## Working secondary cross-check — separately packaged, not independent

The public [Ambo 1962 traditional Roman calendar](https://github.com/igorlaguiar/ambo-liturgical-calendars)
provides a two-year, universal `general-roman` **2026/2027**
source dataset (MIT). Crucially, its maintainers **explicitly credit
Divinum Officium for its traditional-calendar names, ranks and source
material**. Thus Ambo is a useful versioned *derivative consistency
witness*, **not an independent source**, and a perfect match would
prove only consistent extraction/conversion.

We pin the exact Ambo Git revision
`af4a22a4014e9a46cadafc4c2ede4aa784f5a6f2`, and original Git
file blob IDs:
- 2026 `data/v1/1962/general-roman/2026.json`:
  `62eba8c1d0f410eb446c89d1cfb030e07529b3f8`;
- 2027 `data/v1/1962/general-roman/2027.json`:
  `923ad8de7f9b09a9746402c9560031ec79b1b565`.

`.github/workflows/office-annual-calendar-crosscheck.yml` downloads
the **already verified** 730-day private source reader from exact
main-branch [annual run #42615804676](https://github.com/Fulcanelli13/ad-orientem/actions/runs/42615804676);
it does **not** rerun the expensive two-year generator. It fetches
two pinned public GitHub JSON files and verifies both Git blob SHA-1
identities. No paid infrastructure, no additional app build, and no
publication to GitHub Pages.

`tools/office-ordo/derived_calendar_crosscheck.py` then checks:

1. All 365 civil dates per year and **all eight** source Hour records
   per date are present and source SHA, language, public-withheld flag,
   1960 scope and source-date identity are correct.
2. Principal class **I–IV** only where the original Latin Hour
   explicitly provides the machine-readable `~ II. classis`
   heading; compare against Ambo's class code. Unreadable classes
   remain unknown, **not inferred**.
3. Every 1960 source evening Matins→Vespers title transition;
   **123 source identified** across both years. The Ambo dataset has
   no evening Vespers field, so *no independent Vespers comparison is
   claimed*.
4. Secondary/alternative commemorations, source Vespers–Compline
   title divergence and 2026–2027 Triduum/All Souls source-layout
   anomalies are captured in a source-hashed review queue.

Every row retains the original Latin source title, original XHTML
SHA-256, the derivative English celebration/rank and exact
source-version fingerprints. Differences are **review candidates**,
not proofs of a liturgical error. English/Latin text-name equivalence
is not automatically asserted.

The output remains a **90-day research artifact**, no copying into
the public Prayer reader, no extra published dates.

## Real remaining gates

The **genuinely independent Office-calendar cross-check still
requires a verifiable accessible printed 1960/1961 Roman Ordo or
other original source**. A derivative calendar match cannot be
presented as that certification.

Continue with source-aligned typed Psalms, lessons, prayer conclusions,
First/Second Vespers and special rites throughout all 5,840 Hours.
The **16 source-format exceptions** are still review holds, not
missing Latin Hours.

Until documented release authorisation, the public app still has only
**44 certified Latin Compline civil dates**. No other seven Hours,
Office translations, local calendars or 1961 printed-facsimile
reproductions have been published.

GitHub Actions + GitHub Pages only; zero Vercel.
