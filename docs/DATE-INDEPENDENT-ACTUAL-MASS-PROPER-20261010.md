# Mass actually celebrated — date-independent source selection

**Scope:** The Mass has three independent identities: (1) its actual date and ordinary 1962 calendar entry, (2) its actually celebrated formulary or source day, (3) Low, Missa Cantata (simple/incense) or Solemn ceremonial form. A celebration is not inferred from the liturgical date.

## Implemented

- A **Mass actually celebrated** source-date lookup works for arbitrary ISO dates, including across years. It reads the same production `DayResolver.resolveDay(sourceDate)`, without changing the current Calendar, and it displays the source title/path before selection.
- It retains the actual Mass date in R17 while recording the chosen Proper's source date and title.
- The date-independent path is accessible in pre-Mass preparation and independent from the existing Votive, Requiem and Nuptial categories. Returning to a host category or changing the Mass date invalidates the local selection. Choices are for the session only.
- It uses original Latin, English and French text as resolved by the canonical DayResolver and existing reader source-recovery path. The selected reader language must have all required text slots, including complete sets of orations.
- It **removes commemorations belonging only to the source day's calendar**. On a different Sunday Mass date, it requires a specific user choice: add the actual Sunday's Collect, Secret and Postcommunion, or choose no Sunday commemoration. These three texts come from the actual Sunday's source-resolved Proper. If any is unavailable, the reader refuses to prepare.
- `actualMassSourceDate`, `actualMassSourcePath` and `sundayCommemoration` remain in source diagnostics. No historical Oct-4 hardcoded exception is reintroduced.

## Rubrical authority boundary

The new option is an **observational Mass follower**: it assists someone attending a Mass that the church has actually announced, and does not itself certify that choosing a given formulary on a given day was permitted by the 1962 rubrics. External solemnities must not all be classified as unrestricted II-class votives.

1962 General Rubrics, nn. 356–361, distinguish solemnities authorized by law from those established by indult or particular local circumstances. See [original Latin 1962 Missal](https://la.wikisource.org/wiki/Pagina:Missale_Romanum_1962.pdf/24) and [English rubrics](https://maternalheart.org/library/1962rubrics.pdf). The app therefore records `permissionStatus = NOT_INDEPENDENTLY_VERIFIED` and never fabricates an II-class rank or claims automatic permission on a Sunday. Source-text readiness and liturgical authorization are different gates.

**Incomplete:** automatic canonical decision about particular-calendar patronal privileges, Sunday commemorations, masses with licensed local indults, special Missal formulary exceptions, separate seasonal propers or available editions. The selector does not issue clerical authorization. Select an explicit Sunday commemoration matching the actual liturgy, not an unsupported inferred universal rule.

## Acceptance

`npm run test:observed-mass` plus `test:full-mass-preflight`: dates October 2026 and 2027, unrelated November feast/feria, source/host readiness, French/English availability, source-day commemoration leakage, exact Sunday three-orations and clean R17 session identity.

`test:full-mass-phone`: 390px phone, date lookup, source title, explicit Sunday choice, selected actual date source, no leak on next Mass date.
