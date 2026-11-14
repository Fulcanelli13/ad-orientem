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

## Phase B — pinned generator proof (28 October 2026)

Committed `src/office/generator-probe-contract.js`, `scripts/office/phase-b-generate.mjs`, `tests/divine-office-composition-probe.mjs`, and `.github/workflows/divine-office-phase-b.yml`. The generator uses Divinum Officium's own `standalone/tools/epubgen2/EofficiumXhtml.pl`, invoked with the upstream documented CGI command-line query. It derives its DO SHA from Ad Orientem's pre-existing source-transport owner and explicitly rejects an upstream checkout that differs from that SHA. Public standard GitHub-hosted runners are free under GitHub's stated billing policy; there is no private or larger runner, no new service and no stored Actions artifact.

**First CI proof:** workflow run `40699928696`, both jobs successful. Node syntax plus 11 committed contracts passed. 2026-10-28 Vespers generated at pinned SHA in three single-language outputs: Latin 15,563 UTF-8 bytes; English 16,468 bytes; French 17,904 bytes. All three passed the **document envelope** checks, with `compositionVerified:false`, `languageCompletenessVerified:false` and `published:0`. This shows the actual upstream composer executes, not that its full Office or translations are certified.

**Second smoke:** expand to four dates (2026-10-28, 2026-10-31, 2026-11-01, 2026-11-03), eight hours, three languages = 96 generated XHTML files. This is a bulk *envelope* test, not a validated 96-hour liturgical corpus. No raw XHTML may be put into the browser; output is research-only until structurally normalized, sanitized, aligned and independently checked.

**Next:** Classify generated paragraphs/sections from the actual XHTML; verify French fallback and First/Second Vespers around 31 October–1 November with independent witnesses; then create safe date/hour/locale JSON and integrate the reader. Preserve existing Tenebrae (different DO SHA) without overwriting it.

## Phase C — safe source-structure normalization (28 October 2026)

**Implementation:** `scripts/office/normalize_xhtml.py` (Python 3 standard library, `html.parser`) extracts only `<td id="Vespera1">`-style source-owned numbered cells from the full composition. It decodes characters, preserves line breaks, records source cell IDs and original positions, strips all markup/scripts/navigational links and refuses missing/noncontiguous cells, unresolved macros, mismatched source checksum, unsafe paths and absent language groups. Results are research-only `*.research.json`, with `publishable:false`, independent rubric and printed-source verification **false**. Tests: `tests/test_divine_office_normalizer.py`. No additional libraries or server.

**Provenance issue resolved:** upstream English/French Lauds/Vespers each contain an extra *non-prayer* cell `Weekday Intercessions{omit}` or `Prières fériales{omises}`, absent in Latin. This shifts source cell numbering by one. The normalizer now recognizes **only those precise whole-cell omission declarations**, records them under `omittedSourceCells` with original source ID, and excludes them from the prayer presentation ordering. A cell with actual prayer text is never dropped; regression test asserts that rule. Total pilot: 16 explicitly omitted EN/FR marker cells across four dates (not 16 missing prayers). Original source IDs remain available; source-to-display ordering is explicit, never rewritten upstream.

**Verified run:** [Divine Office Phase B #40703209756](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40703209756), both jobs passed. All **96/96** 1960 Roman Office XHTML files normalized to safe text-only JSON. **32/32** trilingual hour groups have matching **presentation section indices after omission markers are quarantined**; before the fix, 24/32 matched. 0 long exact EN/FR block matches in the coarse diagnostic, but this is **not** a test for complete French translation fidelity or the absence of English fallback inside a block. Original provenance and raw hashes recorded in ephemeral research manifest; 0 published.

**Vespers identity:** generated 31 October Latin head explicitly identifies Omnium Sanctorum (I class) and `Vespera de sequenti; nihil de præcedenti`; 1 November Vespers identifies Omnium Sanctorum. These are Divinum Officium source claims, NOT independent printed-rubric certification, and do not alone certify all texts or commemorations.

**Next release gates:** independent 1960 Office precedence/First Vespers and translated section collation, exhaustive French fallback checks, screen-reader-safe structured reader preview, 1960 rubrics day/date agreement with Ad Orientem Calendar, full-year and leap-year validation; **do not merge** until reviewed. Source-cell correspondence does not prove verse-by-verse language or text completeness.

## Sunday sung Vespers — native-only release gate (28 October 2026)

**Locked product boundary:** the complete eight-hour Office is a text-first, trilingual reader. Gregorian notation is **not** a required Office feature and will not be offered through redirects or external links. An optional `Sung Vespers` control may appear **only** when one in-app complete, matched, locally renderable Sunday Office is independently verified. First Vespers on the preceding Saturday and Second Vespers on Sunday are distinct liturgical cases; Saturday is *never* eligible just because it is Saturday. An overlapping feast must pass the Office-precedence decision, not merely the Mass Calendar's principal celebration.

**Implementation:** `src/office/sung-vespers-gate.js` defines an 18-slot **completeness policy** for the common Roman five-psalm form: opening, five antiphons and five tone assignments, chapter tone, hymn, versicle, Magnificat antiphon/tone, collect tone and dismissal. Additional commemorations must have their own verified coverage. Every proposed score must be local to the Ad Orientem bundle, SHA-identified, have clear reviewed rights, exact text correspondence, confirmed renderer output and edition provenance. The full Office itself must be independently checked against the printed Breviary. Any failed criterion yields `buttonVisible:false`. The 18-slot schema is an initial audit model, not a final guarantee that the printed 1960 rubrics demand no additional music; commissioning a sung service still requires human verification.

**Actual pilot (research-only):** 29 November 2026, Advent I, Second Vespers. `scripts/office/audit-sunday-chant.mjs` checks `asbloomf/gabc-chants` at immutable commit `5787df436f5cd432dd95bcacdc911b3488dc3a8a`. The source includes ten GABC candidate files: Deus in adjutorium, five Advent Sunday antiphons (In illa die, Jucundare, Ecce Dominus veniet, Omnes, Ecce veniet), Creator alme siderum, Rorate versicle, Ne timeas Magnificat antiphon, and Benedicamus Domino for Advent/Lent Sundays. Its `Advent1/Advent1-Vespers2.tex` identifies psalms 109–113 with tone assignments 8G, 8G*, 5a, 7c and 4A*, and Magnificat tone 8G. These are **candidate material, not an integrated score set**. The source repository has no top-level `LICENSE` file; claims elsewhere about the work being unrestricted are not assumed to settle each derived GABC file's rights. Keep `UNRESOLVED_PER_FILE` until cleared. Six candidate files contain source-specific GregorioTeX markup requiring compatibility review or faithful conversion for browser rendering. The psalm-tone assignments are currently metadata, not independently rendered complete score assets. No assets have been redistributed, no external score links are exposed and the chant control is disabled.

**Real upstream Office witness:** The pinned Divinum Officium original engine has generated and safely normalized Latin/English/French Vespers for 28 and 29 November (First/Second Sunday case): 6/6 captured, 2/2 source-section groups aligned, 0 published. Headlines identify Dominica I Adventus (I classis). This is the starting evidence for text–music collation, not the final 1960 printed rubrics verdict.

**Regression:** `tests/divine-office-native-sung.mjs` enforces date-specific Sunday eligibility, refusal of unverified existing Office JSON, all 18 slots, local scores, exact rights and proof flags, and missing commemoration coverage. A fully verified synthetic fixture proves only the gate logic, not real musical completeness. The CI `native-sung-vespers-source-audit` job pins the third-party score corpus and audits metadata, macros and Psalm-tone descriptors without persisting or publishing scores.

**Unresolved before even one native song button:** verify chant source licensing and transcription provenance; independently reconcile both Advent I Vespers texts with a printed 1960 Roman Breviary; compare proper antiphon incipits, hymn, Magnificat and commemoration order; resolve all unsupported GABC markup without altering melodies; create, license-clear and validate the psalm-tone, chapter/collect-tone and Magnificat score assets; test client-side offline-square-note SVG rendering; produce complete 18-slot evidence; then integrate behind the current Calendar/Pray reader. Absolutely no public partial Sung Vespers feature.
