# Divine Office — Phase A architecture audit (28 October 2026)

## Outcome

**Extend Ad Orientem; do not create another calendar, prayer app, source registry or paid service.**
Phase A is a code-backed integration scaffold, **not** a claim that the eight hours are assembled or ready for public release.

### Canonical sources of truth and reuse

| Existing file | Verified role | Divine Office use |
| --- | --- | --- |
| `src/calendar/calendar-runtime.js` | Gets `AO_RUNTIME_V8.resolver.resolveDay(date)`; caches resolved calendar days; has failure and date-mismatch handling | Supply date-specific **calendar facts**, not a Breviary precedence decision |
| `src/calendar/contracts.js` | LiturgicalDay/Proper status, commemorations, source witness and fail-closed states | Follow established source-ready/failure discipline |
| `src/calendar/liturgical-year.js` | Date, season and Easter calculation; includes comments citing 1960 Breviary rubrics | Reuse for dates and season context, not the full Office Ordo |
| `src/mass/calendar-preflight-context.js` | Source-specific read-only Calendar-to-Mass bridge | Follow this architectural pattern, without borrowing Mass-only oration decisions |
| `src/mass/reader-proper-runtime-recovery.js` | Calls host `resolveSource(path, language, diagnostic)`; resolves trilingual Mass Proper sections | Assess whether source loading infrastructure supports `horas` paths; do NOT presume Office composition |
| `src/app/source-transport-compat.js` | Pins Divinum Officium commit `126a07f91ede04664108abb6fb20ace3f4de14b9`; explicitly rewrites some Mass Commune references to `web/www/horas` | Reuse/preserve pinned transport and diagnostics |
| `src/pray/tenebrae-1960.js` | Assembles Holy Thursday, Good Friday and Holy Saturday Matins/Lauds; checks LA/EN/FR section parity | **Working precedent** for full Office text assembly and a narrow reusable pilot |
| `src/pray/tenebrae-presentation.js` | Presents Tenebrae from its existing structured section compiler | Reuse read-only presentation patterns; do not make a duplicate Tenebrae destination |
| `src/pray/browser-entry.js` and `src/calendar/browser-entry.js` | Lazy non-Mass entry points | Future same-app reader integration |

### Important boundary: DO files are not composed Offices

Directly inspected at the existing pinned upstream revision:
`web/www/horas/Latin/Sancti/10-28.txt` contains `@Tempora/Pasc6-6:LectioJudae1`, `@Commune/C1:Lectio4`, `$Per Dominum` etc. English and French files have partially different section inventories. The source corpus therefore needs:
1. Breviary precedence, concurrence and first/second Vespers decisions;
2. hour-specific Ordinarium/Psalterium and proper/common selection;
3. recursive macro/reference resolution and language alignment;
4. completeness and provenance checks, including missing translations.

It is not safe to concatenate the raw text leaves or to reuse the **Mass Proper** as the complete Office.

### Two independently pinned DO witnesses

- General Mass source transport: `126a07f91ede04664108abb6fb20ace3f4de14b9`.
- Existing local Tenebrae compiler: `b9f8c8eb15d52b2b2c02e2ca24807cfaa73758f0`.

Keep both separately identified; **do not silently treat their texts as same-version evidence**. Resolve/version-pin the general Office engine before full-year generation. Existing Tenebrae is locally bundled for that existing devotional journey; the proposed generic Office remains online-first.

## Phase A committed proof

- `src/office/source-context.js`: strict eight-hour request contract that consumes canonical resolved Calendar state and marks independent Office composition **pending**. Includes a narrow pure adapter for the pre-existing, source-complete Tenebrae Matins/Lauds document. No HTML scrape, network request, new calendar or production UI.
- `tests/divine-office-phase-a.mjs`: synthetic contract tests for all eight hours, stale calendars, Easter-based Holy Week mapping, alignment, source revision and failure on missing French/unresolved macros. Synthetic fixtures do not certify live liturgical source quality.

## Next release gates — do not skip

1. **B1: Source-composition evaluation.** Evaluate executing the pinned original Divinum Officium composition engine offline in an existing free CI/generation job versus an independently validated alternate. Avoid GPL-3 code reuse without an explicit licensing decision. Do not depend on live third-party HTML scraping.
2. **B2: Liturgical identity differential.** Compare Mass Calendar's resolved principal day with Office-specific precedence on feria, Sunday, feast, first Vespers, transferred feast and commemorations. Resolve calendar-to-office mismatches explicitly.
3. **B3: Trilingual structural pilot.** End-to-end Lauds, Vespers and Compline on 2026-10-28 (Ss. Simon and Jude), 2026-10-31/11-01 (First/Second Vespers of All Saints) and an ordinary feria; compare against a complete rendered Breviary. Missing French is a documented hold, never silently filled.
4. **B4: Matins and exceptional-day pilot.** Compare Matins lessons, invitatory, responsories and Tenebrae 2026-04-02 through 2026-04-04 to already assembled source-owned data.
5. **B5: Delivery.** Publish small date/hour JSON with manifest, source revision, edition, language completeness, HTTP cache and fail-closed errors. Reuse current hosting and existing non-Mass lazy routes; verify €0 recurring cost within the actual platform limits before enabling any scheduled job.
6. **B6: Full-year release.** Test every hour across regular + leap-year samples, plus independently reviewed exceptional dates and source diffs; record per-hour generated/complete/verified/published counts separately.

## Correct first user-visible scope

1960-rubrics **Roman** Breviary, all eight hours, Latin and sourced English/French. Initial milestone Lauds/Vespers/Compline; full Office thereafter. Avoid new liturgical calendar, full offline Breviary, new paid backend or a duplicate Tenebrae module.

## Non-claims

- Neither the complete Office nor an Office composition engine has yet been wired.
- No online source-fetch performance, full-year coverage, real rendered-hour equality or free-tier batch execution has been measured by this Phase A scaffold.
- Printed-Breviary critical collation is separate from agreement with another presentation of Divinum Officium.
