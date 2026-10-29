# Roman Divine Office — annual release-readiness register

29 October 2026. One finite register, separate from draft research PR #1860.

## Exactly what the register counts

The 2026 civil year contains **365 days x 8 canonical hours x 3 languages = 8,760 planned source slots**. A leap year (2028) contains **8,784**. Each slot is keyed by date, Hour and language.

This is an **annual inventory**, NOT 8,760 generated Offices and NOT a completed full-year liturgical discrepancy audit. The initial report records 8,760 NOT_GENERATED, zero structurally verified, zero certified, zero approved and zero published. All results come from the actual unmerged state of PR #1860; the research compressor is not yet a public Office source.

Command (Node, no external dependencies):

    node scripts/office/build-annual-readiness-register.mjs --year 2026 --out /tmp/office-annual

Scratch outputs: 2026-office-annual-readiness.json (one record per slot); 2026-office-annual-exceptions.json (summary, candidate exceptions and known blockers). No user-facing app content, no score assets and no production routes.

## Evidence import

Optional --probe-manifest points to an actual pinned original Divinum Officium engine manifest produced by draft PR #1860. It must have the exact upstream SHA, research-only status, source SHA for every document, unchanged unverified content flags, and zero publication. A successful XHTML envelope moves a row to RAW_CAPTURED_UNVERIFIED, **not** into verified or approved status. A failed envelope does not count. Duplicates, unpinned provenance, fabricated approval or source from the wrong Hour are rejected.

The Office composer and normalizer are still draft; until an actual manifest is provided the new independent workflow correctly reports zero captured slots.

## Scoped exception queue (NOT an independent ordo)

Calendar seasons and the existing major-day overview provide **context**, not Office precedence or final commemorations. Candidate risks are Sunday First/Second Vespers, Prime's anticipated Martyrology, Holy Week/Tenebrae, major dates and All Souls special Office. None proves a real liturgical defect.

Known evidence-backed 2026 source blockers from PR #1860:
- 2 November, English Prime: source-translation mismatch in the beneficiary scope of the All Souls prayer.
- 2 November Prime: 3 November anticipated Martyrology text/edition and 2026 Luna not independently certified.
- 1 November, French Second Vespers: pinned composer omits Sunday commemoration; a reversible research-only fix was demonstrated, but the canonical pinned baseline still excludes the French preview.

The exception report says allYearDiscrepanciesActuallyChecked=false. It is not evidence that every unflagged date is correct.


## Parsing-first implementation decision (29 October 2026 — supersedes raw-capture rollout)

**Do not run the remaining 52 raw XHTML capture batches.** The seven-day
168-slot source ledger is retained only as an immutable record of the earlier
research probe, not as reader-ready coverage and not as the basis of a yearly
download/generation programme. In particular, `168/8760` describes historic
XHTML-envelope probes; it is **not** a completeness measure for prayers,
Office sections, textual certification or publication.

Ad Orientem's Office must follow the existing Mass reader's **source-first,
parser/resolver, structured-projection approach**, with no bulk downloading,
disk archive of annual XHTML, 8,760 rendered HTML files, or weekly/annual
raw-source scraping jobs:

1. Keep a pinned, attributable authority and an Office-specific 1960/1961
   ordo resolver. Reuse the Calendar's dates/seasons as context, never as a
   substitute for the Office's feast precedence, concurrence, occurrence,
   commemorations or exceptional rubrics.
2. Maintain a **reusable normalized corpus** of ordinary components:
   psalms/verses, hymns, canticles, antiphon identity, responsories, collects,
   lessons, fixed responses and rubrics. Refer to components by stable source
   IDs rather than copying shared text into each day/hour/language.
3. Resolve only the source sections actually required for the selected
   date, Hour, language and approved Office variant; parse exact source
   documents/sections **on demand** through the same kind of pinned source
   resolver used by the Mass Proper. Network retrieval for a requested
   source section is a read, not an authorisation to download and store a
   bulk archive. Cache/deduplicate parsed results using the pinned revision,
   source path, section ID, language and ruleset identity; avoid fetching
   the same psalm or other shared component repeatedly.
4. Assemble the Office as a structured sequence of these reusable
   components plus date-specific propers; preserve provenance, selection
   rules, text identity and Latin–English/French alignment, and distinguish
   first/second Vespers. No rendered upstream XHTML may enter the UI.
5. Validate with representative **liturgical equivalence test cases**
   (weekday, Sunday, saints, concurrent Vespers, Matins, Prime/Martyrology,
   All Souls, Holy Week/Tenebrae, language failures) and then a lightweight
   **365-day × eight-Hour × language dry-run** of the resolver's structured
   coverage and exceptions. Do not generate raw XHTML for each slot.
   Review a consolidated discrepancy queue rather than 52 acquisition batches.
6. Release only source-collated, rights-reviewed, liturgically approved
   structured Offices. Missing translations or unresolved precedence fail
   closed; the optional sung Sunday Vespers score gate remains separate.

**Reporting changes immediately:** track `date/hour variant resolved`,
`required section identities found`, `component reuse`,
`LA/EN/FR alignment`, `liturgical exceptions outstanding`,
`text/rubric certification`, and `reader published`.
Do not use `source files captured` as the principal progress bar.

The 168 historical source hashes remain for audit and are not invalidated by
this decision. The earlier raw-capture generator/ledger tools, if retained,
are **legacy research-only**, not an execution roadmap or a release gate.
The PR-only weekly generator/download workflow must be removed rather than
run another batch. No new paid services or persistent source archives.

## Finite four-gate completion definition

1. Annual slot inventory: 2026/2028 8-hour trilingual dates complete and uniquely keyed (this PR).
2. Parser/resolver coverage: pinned-source section selection, normalized reusable component IDs, and dry-run structural coverage; no annual raw-source capture or XHTML-generation campaign.
3. Liturgical correctness: independent 1960–61 Office precedence, proper-text, translation, exceptional-hour and local-calendar reviews; source ID, witness, page and rights retained. The remaining historical exceptions get explicit approval or quarantine.
4. Release: only independently verified Office Hours connect to existing Calendar/Pray routes, with clear unavailable-locale behavior. Sung Vespers has a separate native-notation and rights gate and does not block text release.

No further general research phases, no second Calendar, no paid services, no recurring source scrape, and no archived bulk copyrighted source. This PR does not touch the production Office, Mass or Tenebrae readers. Do not merge draft PR #1860 merely to inflate the annual capture counts.

## First source-section implementation gate (research-only)

`src/office/source-section-resolver.js` now provides an explicit
`createOfficeSectionResolver({readSource})` boundary. The caller supplies an
already parsed, same-language, exact-revision source map from the existing
source resolver. The Office module has **no downloader, upstream checkout,
generator, persistence adapter or calendar selection**. It can project one
named source section for LA/EN/FR or all three languages, caches bounded
source reads per session, and rejects missing sections, unresolved @$&
macros, unsafe source paths, and mismatched pin/path/language provenance.
Source formatting remains ordinary text for a downstream escaping renderer.

Output is `PARSED_UNVERIFIED`: `publishable=false`, no Office
precedence decision, no claim that similarly named translated sections
align by paragraph, no printed-edition certification and no permissions
clearance. This is intentionally narrower than an Office composition engine.

Test with:

    node --test tests/divine-office-source-section-resolver.mjs

The annual-readiness workflow runs this test alongside its existing
2026/2028 inventory checks. Next: adapt the production source resolver
with verified pinned-source provenance, resolve inherited `@` and `$`
references before section projection, and add an independent Office
selection/precedence layer and representative equivalence fixtures.
Only after those gates can structured hours be assembled. No raw annual
capture is needed for any of these steps.

## Source-first host bridge and structured Hour research draft

Research branch now contains two additional modules:

- `src/office/mass-host-source-bridge.js` calls the **existing Mass
  parsed-source interface** `hostResolver.resolveSource(path, language,
  diagnostic)` and accepts only its already parsed `Map` of sections. A
  source-revision assertion is mandatory: a host that does not explicitly
  expose the approved pinned revision is rejected. This is an interface
  bridge, **not yet an installed production host integration**. The existing
  Mass host may need an exposed pin property before it can be wired.
- `src/office/structured-hour-draft.js` assembles a caller-supplied ordered
  selection of exact original Office source sections into an
  `ao.office.structured-hour-draft.v1` object. It preserves unique sequence
  keys, source section identities, roles, and the original LA/EN/FR texts;
  shared source documents are parsed once per language. The function does
  not invent calendar precedence, replace proper texts with a generic
  Common, or infer translation alignment.

The research selection is deliberately **not a certified liturgical ordo**.
A composite draft is `STRUCTURED_UNVERIFIED`, with Office precedence,
whole-Hour completeness, trilingual alignment, printed-original
certification, rights and publication all false. Tests are synthetically
sourced structural fixtures, not historically verified complete Hours.
This is the narrowest safe step from source section parsing to composition.

    node --test tests/divine-office-source-section-resolver.mjs
    node --test tests/divine-office-mass-bridge-and-hour-draft.mjs

The next necessary work is to expose/verify the actual Mass host's pinned
source provenance, add an **independent Office 1960/1961 precedence and
concurrence resolver** backed by authoritative rubrics, resolve source
directives with the pinned parser, and test real selected Hours against
independent printed witnesses before any reader route. This does not need
additional raw Office captures.

## Independent Office precedence review — RG 91 / 92–114 gate

`src/office/precedence-review.js` is a conservative Office-specific
*research review* over explicitly supplied Office-calendar candidate records.
It does not infer Office selection from Mass Proper, calendar title, a civil
date, or a generator XHTML heading.

- **Occurrence:** candidate source must identify its own RG91 table category,
  class, scope, ID, and researched I/II Vespers eligibility. The gate applies
  the numbered table only when positions are distinct; ties, missing local
  proper-day information, first-class transfers and special Offices are
  withheld. Losing candidates remain unresolved until RG93–102 determine
  commemoration, omission, transfer or reassignment.
- **Concurrence:** adjacent Office-day candidates are compared under
  RG103–105; equal classes retain current II Vespers. A Saturday feria or
  Saturday BVM Office independently known to end after None can yield to
  the following Sunday's or I-class feast's I Vespers per RG13, 27, 37
  and 79. Other missing-II cases remain withheld.
- **Commemorations:** this gate *never* appoints them. RG106–114 and Breviary
  250–259 require additional ordering, exceptions, exclusion and source
  checks. The pilot's earlier Vespers commemoration reviews in PR #1860
  remain research evidence, not publication authority.
- **Special:** All Souls/Office of the Dead and the Sacred Triduum always
  require their own rubrical path; no generic Class-I substitution.

The source for these rule IDs is the 1960 Roman General Rubrics:
https://isidore.co/divinum/www/horas/Help/Rubrics/General%20Rubrics.html
and the earlier detailed Vespers gate in draft PR #1860. Structural test
fixtures are **not** independently selected complete Office days.

    node --test tests/divine-office-precedence-review.mjs

All decision outputs set `officeSelectionAuthorized=false`,
`commemorationsApproved=false`, `liturgicallyCertified=false`, and
`published=0`. A caller-provided source witness is not a verified
printed-authority signature. This module is therefore a precursor to,
not a substitute for, a real universal + local Office candidate registry,
and it is **not yet connected to production or the structured Hour
assembly**.

The next gate is to anchor these candidates to source-owned 1960 Office
calendar witness IDs and reconcile them with the existing research pilot;
then connect the review to Hour-selection and perform one consolidated
annual read-only exception sweep, with no Office XHTML batch capture.

## Precedence-to-Hour handoff and unified annual research sweep

Implemented research-only modules:

- `src/office/reviewed-hour-handoff.js` — joins the independently supplied
  Office occurrence decision (and, for Vespers, the next day's concurrence)
  to an **explicitly selected** source-section list. It checks civil evening
  date vs the appointed Office date, principal Office identity, Hour, and
  First/Second Vespers. Unknown or impeded celebrations, missing next-day
  evidence, and mismatched source selection block parsing; they do not
  trigger a Mass Proper fallback. One complete Vespers section list is still
  **not** established and the handoff can only produce
  `STRUCTURED_UNVERIFIED` drafts.
- `src/office/annual-research-sweep.js` — runs a finite in-memory
  **365 × 8** (or leap **366 × 8**) rule-status pass using only supplied
  Office-specific research candidates. The expected trilingual
  **8,760/8,784** combinations are logical coverage targets, never fetched
  or generated XHTML. Counts distinguish `researchCandidateHours` from
  `completeTrilingualHours`, independent certification and publication.
  It uses the existing annual register's known blockers as **advisory**
  records, not as Office-selection proof.
- `scripts/office/sweep-annual-research.mjs` — explicit CLI, optionally
  accepting a reviewed **metadata-only** Office candidate roster via
  `--office-days`; no source-text documents, HTTP or batch generation.
  CI runs the no-roster version for 2026 and 2028, writes reports only to
  ephemeral runner scratch and checks that neither year fabricates coverage.

Without an Office candidate roster the correct results are:

| Logical statistic | 2026 | 2028 |
| --- | ---: | ---: |
| Civil days | 365 | 366 |
| Date × Hour combinations | 2,920 | 2,928 |
| Date × Hour × language targets | 8,760 | 8,784 |
| Independently supplied Office-day records | 0 | 0 |
| Source-backed, trilingual complete Hours | 0 | 0 |
| Liturgically certified / public Hours | 0 | 0 |

The sweep's zero-roster results show **coverage visibility, not a completed
annual discrepancy audit**. The old 168 hash-only records stay an isolated
historical probe. Do not conflate them with source-identified Office days.

Testing:

    node --test tests/divine-office-reviewed-hour-handoff.mjs
    node --test tests/divine-office-annual-research-sweep.mjs
    node scripts/office/sweep-annual-research.mjs --year 2026 --out /tmp/office-sweep-2026.json

**Remaining engineering dependencies:** identify the real pinned-source
`resolveSource` host and expose verified path/revision metadata; build an
Office-specific candidate register with primary/printed-source identifiers
and local calendar exceptions; reconcile the older PR #1860 Vespers
research/commemoration gates rather than maintaining rival production
arbiters; resolve referenced `@`/`$` source directives; establish
independently collated Office-section sequences for representative Hours.
Only then run the annual sweep with genuine Office-day research candidates.

No extra downloads, permanent source-text archives, scheduled scrapes,
automatic publishing, or financial cost.

## First pinned research-witness registry: two Sunday Vespers transitions and All Souls

`data/office/research/2026-office-pilot-ordo-roster.json` is the first
*bounded exception-focused cohort* of six dates. It is NOT a proposal to
type all 365 dates by hand. The registry cites the existing pinned Office
research PR #1860; the 1960 General Rubrics for categories and Saturday/
Vespers rules; and the public SSPX 1962 Ordo day pages as corroborative
**Mass-calendar context only**. The Ordo day pages do not certify an Office
hour or its source sections, and the PR pilot does not certify printed text.
The metadata has a declared Office-research observation scope per date.

| 2026 date | Evidence envelope | Reportable issue |
| --- | --- | --- |
| 31 Oct | all-hour research generator pilot | Saturday BVM to All Saints I Vespers; following Sunday's commemoration disposition is still open |
| 1 Nov | all-hour research generator pilot | All Saints takes the principal Office; the impeded XXIII Sunday requires independent disposition / LA–FR collation |
| 2 Nov | special Office research pilot | Office of the Dead must use its own rubrics; Prime beneficiary translation and Martyrology remain blocked |
| 3 Nov | all-hour research generator pilot | ordinary feria source identity; local variations and next-day Vespers remain unreviewed |
| 28 Nov | Vespers-only research pilot | transition from Saturday BVM to Advent I |
| 29 Nov | Vespers-only research pilot | Advent I Sunday Second Vespers candidate; other Hours not witnessed in this particular pilot |

The observation-scope validator deliberately refuses a fabricated pin,
incorrect URL identity, extra Hours in a Vespers-only source pilot, or
unresolved local/Office category. It does not inspect or download the Office
texts. The metadata claims **34 source-hour headings observed** in the
prior research pilot: 4 × 8 plus 2 × Vespers. These claims are not a
verification of exact text, translation, or liturgical Office appointment.

Running the annual sweep with this dated metadata produces these
*research-only* counts, checked by CI:

- 6 submitted research day records; 4 days whose single Office precedence
  candidate passes the narrow RG91 research review.
- 15 of 2,920 date × Hour combinations have a provisional occurrence or
  Vespers candidate **and are within the recorded observation scope**.
  2,905 remain withheld. Even those 15 do **not** have verified Office
  section sequences; they do not count as complete trilingual Hours.
- **0 fully assembled/certified/published** Hours, unchanged.
- On 31 Oct and 1 Nov, the Sunday commemoration issue is deliberately
  not waived to inflate candidate counts; All Souls' special Office is
  deliberately blocked from the general 1960 occurrence path.

Reproduce without any downloads:

    node scripts/office/sweep-annual-research.mjs --year 2026 --office-days data/office/research/2026-office-pilot-ordo-roster.json --out /tmp/office-pilot-research-sweep.json
    node --test tests/divine-office-research-roster.mjs

**Scale-up method:** next ingest and normalize the *Office-specific*
universal Sanctoral/Temporal calendar descriptors from the exact pinned
source **on demand** through existing parsed-source resolution. Model
recurring rules and exception overrides once, not 365 generated XHTML
documents or hand-authored daily calendars. Keep the literal Office-day
source identity and 1960 rank/rubric source IDs, then run this single
metadata sweep, and adjudicate only its finite exceptions. Local diocesan,
ICKSP and institute-specific variations remain separate researched
overlays, not silent replacements of the universal Office.

This remains an unmerged draft research stage. No weekly captures or
additional paid hosting are enabled.

## Recurring universal source-key planner and pinned metadata-only projection

`src/office/universal-source-descriptors.js` provides the first generic
**rule-based path planner**, not another set of dated Office documents:

1. Every valid civil date proposes one `Sancti/MM-DD` **possible path**,
   including dates where the source file may not exist. An absent source
   file is not proof that a feast is absent, and a path proposal is not a
   claim that a feast is actually appointed.
2. Advent days are derived from the **movable first Sunday of Advent**
   using the existing Calendar's date arithmetic; the confirmed pinned
   source naming pattern is `Tempora/Adv{week}-{weekday}` (Sunday = 0).
   Pinned original source spot checks:
   `Latin/Tempora/Adv1-0.txt`, `Adv1-1.txt`, `Adv1-6.txt`,
   `Adv4-0.txt`, plus `Latin/Sancti/11-01.txt`,
   `11-02.txt` and `11-29.txt`.
   These are **source identities**, not an Office ordo.
3. An opt-in **one-date** reader uses the already existing
   `hostResolver.resolveSource(path,"la",diagnostic)` interface and
   projects just the `[Officium]`, `[Rank]` and `[Rule]` metadata
   (title, rank label, rule line count and conditioning indicator),
   with source pin/path/language checks and a small in-memory cache.
   It copies **no psalms, hymns, lessons, prayers, rendered XHTML or
   annual source documents** into the registry.
4. **Crucial rubrical safeguard:** the original pinned `Adv1-0`
   has an historical `Semiduplex;;6.9` Rank, while the original
   `Adv4-0` and `Sancti/11-02` contain multiple conditional
   `[Rank]` variants. These numbers are NOT RG91 table positions,
   and the host's flattened `Map` may lose conditional variants.
   The projector *always* returns null Office class, null first/second
   Vespers eligibility and null 1960 precedence; it must not silently
   construct an apparently precise universal Office calendar.
5. The existing annual research sweep now attaches **unverified path
   leads** to each date, and separately reports path planning from
   independently supplied Office-day research evidence. These
   source-key proposals never increase `researchCandidateHours`,
   `completeTrilingualHours` or certified/published counts.

| Planning count (no reads) | 2026 | 2028 |
| --- | ---: | ---: |
| Fixed-date Sanctoral path leads, existence unknown | 365 | 366 |
| Advent Temporal path leads, existence unknown | 26 | 22 |
| **Total possible source-key leads** | **391** | **388** |
| Automatically inspected or certified files | 0 | 0 |
| New Office-day appointment decisions | 0 | 0 |
| Raw XHTML acquired / archived | 0 | 0 |

The planner and metadata extraction are covered by
`tests/divine-office-universal-source-descriptors.mjs`.
CI checks both years' counts and the critical distinction
between proposed keys and independently verified text.

**Still to extend:** verify additional Temporal source-key patterns and
their recurrence rules (Christmas, Epiphany, Septuagesima, Lent,
Passiontide, Easter, Ascension, Pentecost and its octave, and
post-Pentecost), with conditional rubrics preserved. A source-key map
is **not** a complete 1960 Office-calendar engine. Only independent
ordination/precedence adjudication and complete source-derived
section sequences can authorize real daily Offices. Continue through
on-demand parsed metadata, no full-year Office XHTML batches.

## One-pass exact pinned source filename index — no content capture

A single metadata-only GitHub directory inspection of the pinned Latin
Divinum Officium `web/www/horas/Latin` source trees identified
**1,185 real file names**, with no Office text, XHTML, generators, annual
captures or content archive:

| Source owner | Exact pinned Latin filenames |
| --- | ---: |
| `Tempora` — Temporal proprium, including all seasons | **638** |
| `Sancti` — fixed Sanctoral + variant entries | **486** |
| `Commune` — shared Commons and their variants | **61** |
| **Total** | **1,185** |

The immutable, alphabetized index is in
`data/office/source-index/roman-1960-pinned-latin-filenames.json`
and cites DivinumOfficium/divinum-officium at revision
`126a07f91ede04664108abb6fb20ace3f4de14b9`. Nested
country/locale directories are **not included** and are not implicitly
certified. Filenames alone neither select a 1960 variant nor prove that
the EN/FR files exist or correspond to the Latin sections.

`src/office/pinned-filename-index.js` strictly validates that snapshot
and compares all annually generated **possible** source keys to their
exact filename presence. `Sancti/12-01`, for instance, is not present
as an exact Latin filename, but that does **not** imply that the day
lacks any Office or that a variant/Temporal/Common path cannot apply.

| Metadata-only path check | 2026 | 2028 |
| --- | ---: | ---: |
| Possible fixed Sanctoral + Advent source paths | 391 | 388 |
| Exact pinned Latin filenames listed | **311** | **307** |
| Exact filenames not listed | **80** | **81** |
| Additional Office texts read by annual sweep | **0** | **0** |
| Offices appointed or certified by filename matching | **0** | **0** |

This is substantial **source identity indexing**, not 311 liturgically
verified 2026 Offices or 311 translations. It does not attempt to
process the 638 Temporal filenames into a date-to-Office decision yet.
That requires conditional source-rule parsing and an independent 1960
Office ordo: some filenames denote historical variants, optional
observances and alternate editions.

The annual research CLI accepts `--source-index` and reports the exact
match counts without changing the earlier 15 provisional pilot Hours
or the zero verified/published status. CI validates both 2026 and
leap-year 2028 against the immutable filename index, with only
ephemeral generated metadata reports.

    node scripts/office/sweep-annual-research.mjs --year 2026 --source-index data/office/source-index/roman-1960-pinned-latin-filenames.json --out /tmp/office-filename-audit.json
    node --test tests/divine-office-pinned-filename-index.mjs

**Next correction and implementation gate:** parse *conditional* Rank
and Rule sections without flattening variants, then bind all confirmed
Temporal families (Epiphany, pre-Lent, Lent, Passiontide, Paschaltide,
Pentecost and post-Pentecost) to their real recurring dates and source
identities. Preserve competing options for independent precedence
adjudication, rather than selecting an arbitrary file by season or
historical numeric rank. No bulk source downloads are required.

## All-season Temporal recurrence and conditional rubric preservation

Implementation on draft PR #1950 adds two new **pure** research components:

- `src/office/temporal-source-leads.js`: proposes Temporal source keys
  from movable year anchors and the *actual pinned filename families*.
  Inspected source headers confirm `Quadp3-3` = Ash Wednesday,
  `Quad1-0` = First Sunday of Lent, `Quad5-0` = Passion Sunday,
  `Quad6-0` = Palm Sunday, `Pasc0-0` = Easter,
  `Pasc7-0` = Pentecost, `Pent01-0` = Trinity,
  and `Pent24-0` = the **last** Sunday after Pentecost.
  Provisional date-based key families now cover:
  Nativity/early January; Epiphany weeks; Septuagesima through
  Quinquagesima; Ash Wednesday through Holy Week; Easter through
  Pentecost; and post-Pentecost weeks with a distinct last-week key.
  Existing Advent keys remain owned by the earlier planner.
  Extended source-key identities are **not** Office appointments.
- `src/office/conditional-metadata-parser.js`: parses **only**
  source headings `[Officium]`, `[Rank]`, `[Rule]` and `[Name]`
  from an **already provided exact-pinned Latin source leaf**.
  Repeated `[Rank]` sections, bracket-header rubrical qualifiers,
  inline `(sed rubrica ...)` lines and ordinal source locations are
  preserved separately; the parser does **not** flatten competing
  historical alternatives or treat numeric source ranks as RG91
  table positions. Liturgical prose outside those metadata headings
  is not emitted. It contains no downloader, CGI code, file output
  or source archive.

**Critical after-Pentecost safety condition:** the last week is
`Pent24`, even in civil years with more than 24 after-Pentecost
Sundays. The planner must not invent `Pent25` or later. Any
intervening resumed Epiphany Sundays are flagged for separate
Office-calendar adjudication rather than silently assigned a
wrong proper. Holy Thursday through Holy Saturday are likewise
flagged for the existing special-office/Tenebrae path.

`src/office/annual-research-sweep.js` and its CLI can now opt in to
`--temporal expanded` and annotate full-year source-key leads with
the pinned filename index, while leaving the prior 2026/2028
coverage/certification totals unchanged. No source files are
fetched by this annual report. A matched exact Latin filename
still means *only* that the candidate source path exists at the
pinned revision.

Regression coverage:

    node --test tests/divine-office-temporal-source-leads.mjs
    node --test tests/divine-office-conditional-metadata-parser.mjs
    node --test tests/divine-office-expanded-temporal-sweep.mjs
    node scripts/office/sweep-annual-research.mjs --year 2026 --source-index data/office/source-index/roman-1960-pinned-latin-filenames.json --temporal expanded --out /tmp/office-all-season-2026.json

CI tests 2026 and leap-year 2028, requires all proposed keys to
balance exact pinned filename matches plus absent filenames,
and asserts zero source documents read, zero certified text
and zero published Office Hours.

**Remaining gates:** connect the metadata parser to an on-demand
original-source reader that retains all conditional branches (the
Mass-style flattened source `Map` alone is insufficient); independently
verify all Temporal date-to-source conventions including transferred
and resumed Sundays; source-specific Sanctoral precedence and
commemoration selection; assemble complete and aligned LA/EN/FR
Hours with printed witnesses and rights review. No continuous
annual source download, generator or raw XHTML archive is needed.

## Original pinned-source conditional metadata read — bounded host transport

The next parsing-first gate is implemented by
`src/office/conditional-source-reader.js`. The Mass
`hostResolver.resolveSource(...).map` is useful for exact section
projections but **flattens** conditional `[Rank]` / `[Rule]`
alternatives, so it cannot be used as evidence for assigning a 1960
Office variant. This reader takes the application's *existing* installed
source-transport-compatible `fetch` as an injected `fetchSource`,
never creates an independent downloader, and makes **only an explicit
one-leaf read** using the existing immutable DO revision.

Example of the supported integration contract (not a production entry
point and **not an Office publication operation**):

    const originalMeta = createOfficeConditionalSourceReader({
      fetchSource: installedSourceTransportFetch,
      filenameIndex: pinnedLatinFilenameIndex,
      maxDistinctReads: 12
    });
    const observed = await originalMeta.readDateLead({
      date: "2026-11-02",
      path: "Sancti/11-02"
    });
    // observed.byKind.Rank retains every conditional witness;
    // observed.class and observed.appointedOffice are null.

It checks exact filenames in the **1,185-filename pinned index**
and refuses any path that is not in that index. It pins the URL to
`raw.githubusercontent.com/DivinumOfficium/divinum-officium/`
with the immutable `DIVINUM_OFFICIUM_PIN`, disallows redirects,
requires a successful HTTP 200 original leaf, checks final URL,
caps source size, enforces a maximum number of distinct reads per
reader instance even across failures, and deduplicates simultaneous
requests. The **only cached values are the parsed, bounded conditional
metadata records**, not the source text. Browser fetch is invoked
only when `readOne` or `readDateLead` is called; there is no list
or annual read method, no periodic fetch, no filesystem output,
no Actions archive, and no generated XHTML.

**Accounting terminology:** the on-demand HTTP read of an original
leaf is not a permanent source-file download or the bulk XHTML
capture process previously cancelled. It *does* transfer the minimum
requested upstream leaf into memory momentarily for the parser.
The earlier annual metadata-only CLI remains fully offline and does
not call this reader.

`tests/divine-office-conditional-source-reader.mjs` checks the
runtime contract with injected/mock transport. It includes the
pinned original's exact All Souls Rank/Rule metadata shape, preserving
its competing historical ranks and the `No prima Vespera` directive.
It asserts that no `[Oratio]` content is returned; validates
Advent I, pinned URLs, one-leaf in-memory reuse, no arbitrary date
substitution, no redirect or 404 acceptance, size ceilings and
bounded-read exhaustion. Tests **do not** claim that the
actual production browser has invoked this adapter or that Office
sections/texts/translations have been certified.

    node --test tests/divine-office-conditional-source-reader.mjs

**Next unresolved integration:** provide the live app's existing
source transport and pinned filename manifest at the user-triggered
Office research entry point; reconcile the 1960 conditional choice
with printed Rubrics, multiple occurrences, Vespers and independent
local Ordo. Only after that can it choose specific source sections
for the eight Hours. No source archive, bulk capture, public route
or paid service is introduced by this stage.
