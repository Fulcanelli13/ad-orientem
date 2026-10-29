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

## First traceable First Vespers composition acceptance slice (2026-11-28/29)

The next end-to-end **research** gate is implemented without building
another Office ordo or archiving/generating Office XHTML:

- `src/office/source-acceptance-slice.js` joins the previously tested
  1960 Office concurrence research handoff to an explicit *original Latin
  source metadata leaf* and exact trilingual section resolver. On civil
  Saturday **28 November 2026**, the appointed research candidate is
  First Vespers of **Sunday 29 November**. The original source identity
  must be `Tempora/Adv1-0`, with the Latin source title
  `Dominica I Adventus`. The original metadata parser now exposes only
  `sourceSectionHeaders` (section names, qualifiers, source line numbers)
  in addition to the earlier conditional Rank/Rule metadata.
  Duplicate or conditional section headings, wrong title, wrong date,
  mixed source owner, missing French and mismatched source pin all
  **withhold composition** before it is presented as a complete Hour.
- A spot check of the **actual immutable pinned original** across
  `Latin`, `English` and `Francais`
  `Tempora/Adv1-0.txt` found an explicit `[Ant 1]` section in each
  language. The `[Oratio]` section also exists, **but its ending is
  still `$Qui vivis` in all three**: it is not a complete, safely
  resolved collect at the raw-leaf layer. The research test therefore
  exercises a trilingual antiphon **component slice** and separately
  ensures unresolved collect macros block any larger section sequence.
  An antiphon slice is **not a complete first Vespers service**.
- `src/office/at-reference-resolver.js` is an additional bounded
  research resolver for explicit source `@...` dependencies, taking
  the same injected pinned parsed-source reader as Mass. It resolves
  `@:Ant Laudes` and `@Psalterium/Special/Major Special:Adv Versum 3`
  in the original language with original source-ref traces, in-flight
  source-file caching, cycle detection and limits on depth, nodes and
  source reads. **It does not guess** `$Qui vivis`,
  `&psalm(...)`, implicit unsuffixed `@Commune/C9`, alternative
  rubrics or `{:H-...:}` hymn markup. Unresolved directives
  fail closed; no fallback or loss of section provenance is allowed.
  The existing source-path validator now admits the pinned source's
  legitimate **space-containing** `Major Special` path but continues
  to reject `..`, empty/relative or `//` paths.
- `src/office/structured-hour-draft.js` preserves any optional
  per-language exact-reference trace in the resulting
  `STRUCTURED_UNVERIFIED` draft; it still cannot promote a source
  component to a complete or published Hour.

Regression test entrypoints:

    node --test tests/divine-office-source-acceptance-slice.mjs
    node --test tests/divine-office-at-reference-resolver.mjs

They use **injected fixtures** corresponding to inspected pinned-source
header and macro shapes. They do not fetch remote Office text in CI
and do not prove live browser integration, full liturgical Office
correctness or print/translation/rights certification.

**Release position:** zero complete, independently printed-collated or
published Office Hours. The first complete-Hour milestone still requires:
source-origin-aware `$...` and `&...` reference completion;
the Office-specific 1960 Ordinary/Psalterium + proper/common sections
for the full Hour in correct order; authoritative Vespers commemoration
appointment; all three language alignments; and original-print/rights
review. Until those gates exist, retain the current reader disabled and
use no scheduled annual raw-source downloads.

## Pinned standard-prayer and psalm-verse source expansion — research only

**Original source check:** at the immutable DivinumOfficium revision
`126a07f91ede04664108abb6fb20ace3f4de14b9`:

- `web/cgi-bin/DivinumOfficium/LanguageTextTools.pm` defines
  `prayer(name,language)` from the same-language
  `Psalterium/Common/Prayers.txt` source. The source has explicit
  `[Qui vivis]`, `[Qui tecum]`, `[Qui tecum eiusdem]`,
  `[Per Dominum]`, `[Per Dominum eiusdem]` and
  `[Per eumdem]` in **Latin, English and French**. Unlike the
  upstream runtime fallback, Ad Orientem rejects a missing locale
  instead of silently using the fallback text.
- `web/cgi-bin/horas/horasscripts.pl` has a `psalm` function
  that selects `Psalterium/Psalmorum/PsalmN.txt` and applies
  additional contextual rules. The pinned plain
  `Psalm116.txt` has source-numbered verses in all three languages;
  `Tempora/Pasc0-0.txt` contains a plain `&psalm(116)` call
  in a special Vespers source section. These observations do not
  establish the Gloria Patri/antiphon rules for a particular Hour.

**Implementation on PR #1950:**

- Existing `src/office/at-reference-resolver.js` supports opt-in
  `enableStandardPrayers: true` for **only the six named
  source-owned conclusions**. It reads each explicitly selected
  `Psalterium/Common/Prayers#section` via the **same injected
  parsed source host**, preserves exact per-language dependency
  traces, and blocks other `$...` macros.
- Opt-in `enablePsalmVerses: true` with caller-injected
  `readPsalmSource(path,language)` supports **only plain**
  `&psalm(N)` for 1–150. It validates pinned revision/path/language,
  psalm-number and increasing verse labels, and preserves verse
  references without synthesizing translations. Range arguments,
  missing/incorrect verses, number mismatch, unsupported operators,
  redirects or other source directives must not be treated as
  supported Psalterium composition. It does **not** silently append
  Gloria Patri, antiphons, chant accents or rubrical exceptions.
  Source content is read only on demand, not archived or generated
  for a whole year.
- `src/office/mass-host-source-bridge.js` exposes
  `createOfficeAtHostBridge`, which calls the SAME pinned
  `hostResolver.resolveSource(...)` adapter as the original
  `createOfficeMassHostBridge` — no new permanent source storage,
  app architecture, independent fetcher or Mass-calendar inference.
- `src/office/structured-hour-draft.js` keeps exact
  per-language prayer/psalm source traces, **explicitly counts
  verse-only psalm components**, and forces
  `psalmDoxologyAndAntiphonVerified: false`. The
  `source-acceptance-slice` converts ordinary source/psalm
  failures into visible `WITHHELD` results, not an incomplete
  published Hour.

The first **Advent I First Vespers** source acceptance test now
verifies two trilingual components — named antiphon and the
`[Oratio]` collect expanded by the source-owned `$Qui vivis`
section. A missing French ending withholds the entire draft.
The **Easter** test exercises `&psalm(116)` as a
**verse-only research component**, with doxology/antiphon and
complete-Hour approval remaining false.

    node --test tests/divine-office-at-reference-resolver.mjs
    node --test tests/divine-office-source-acceptance-slice.mjs
    node --test tests/divine-office-mass-bridge-and-hour-draft.mjs

**Not yet finished:** the actual context-sensitive 1960 Psalterium
choice (including complete psalm sequence), antiphon repetition,
Gloria Patri, hymn and chapters, blessings, collect conclusions
under every rule, all commemorations, seasonal exceptions,
the authoritative whole-Hour sequence, printed witness comparison,
translation alignment, rights approval and production browser route.
As a result, `completeTrilingualHours`, `certifiedHours` and
`publishedHours` remain **zero**. Do not describe the new
component tests as independently certified Hours.

## Advent I First Vespers — ten-component source sequence and five psalms

The next research milestone is an **explicit, reusable source-owner
sequence** rather than individual disconnected candidate components.
The bounded first case is civil evening **Saturday, 28 November 2026**,
for the **First Vespers of Sunday, 29 November 2026**.

Pinned original source checks at revision
`126a07f91ede04664108abb6fb20ace3f4de14b9`:

- `web/www/horas/Ordinarium/Vespera.txt` has the ordered headings:
  Incipit, Psalmi, Capitulum/Hymnus/Versus, Magnificat, possible
  Preces/Suffragium, Oratio and Conclusio. The historic
  conditions in the source must be evaluated for 1960, not emitted
  as prayers or all applied unconditionally.
- `Psalterium/Psalmi/Psalmi major.txt#[Day6 Vespera]` provides
  **five Saturday Vespers psalm portions**, specifically 143(1–8), 143(9–15), 144(1–7), 144(8–13a) and 144(13b–21),
  with antiphon stubs. All three source languages contain that
  exact numeric sequence.
- `Tempora/Adv1-0.txt#[Ant Vespera]` in **Latin** points to
  `@:Ant Laudes` and has a historical conditional line.
  **English and French do not contain this alias heading**,
  but do contain the underlying **five translated
  `[Ant Laudes]`** entries; source ownership is explicit
  and no unrelated text may be substituted.
- Other source-owner leads: proper
  `[Capitulum Laudes]`, `[Versum 1]`, `[Ant 1]` (Magnificat
  antiphon), `[Oratio]` and
  `Psalterium/Special/Major Special#[Hymnus Adv Vespera]`
  and `#[Adv Versum 3]`. The hymn has source markup;
  the chapter has `!Rom 13:11` and `$Deo gratias`.
  They are **not** certified as fully resolved.
- The Magnificat canticle text, 1960 antiphon/Gloria Patri
  placement, independent commemoration decision, exact
  seasonal conclusion and doxology, and any local variation
  remain separate completion gates. A known source section
  does not authorize a prayer or certify its position.

Implementation:

- `src/office/advent-first-vespers-source-sequence.js` requires the
  **reviewed Office-specific Saturday-to-Sunday handoff** and two
  exact pinned parsed documents **per language**, yielding five
  numerically matched psalm + antiphon **research** candidates
  and a ten-slot Office source-order manifest. It refuses a
  missing/extra source row, wrong numeric Psalm, missing
  French source, unknown macro, substituted revision/path,
  historical alias mismatch or changed office part.
- The same module has optional
  `assembleAdventFirstVespersPsalmodyResearch` consuming the
  **existing** opt-in source-backed
  `createOfficeAtReferenceResolver(...)` method
  `resolvePlainPsalmParallel`. This can read the **five
  original psalm verse sources in each of three languages**
  strictly on demand, with no archived source texts. It requires
  every language, verified number, pinned path and source
  revision; a missing French psalm withholds all five.
  **The result is still only source verses and prospective
  antiphons**, not liturgically approved psalmody, because
  Gloria Patri, antiphon repetition/placement, rubrical variants
  and printed source comparison are not certified.
- `tests/divine-office-advent-first-vespers-source-sequence.mjs`
  covers the two source files × three languages, Saturday Psalm 143/144 ranges
  (including the verse-13a/13b split), non-identical Latin vs EN/FR aliases, wrong
  source identity and six unique psalm-source leaves
  (Psalm143 and Psalm144 × three languages) with five segment projections. **Tests use injected synthetic content
  reflecting the inspected source structure**, not a falsely
  described independent printed Breviary or a live-endpoint
  validation.

Run:

    node --test tests/divine-office-advent-first-vespers-source-sequence.mjs

**Release state:** all ten components remain liturgically
unverified, `completeTrilingualHours = 0`,
`independentlyCertifiedHours = 0`,
`publishedHours = 0`. This module is a research
acceptance fixture, not an alternative Office engine.
The next real milestone is adjudicating the complete
1960 Sunday Vespers rubric and its ordered components,
then matching Latin–English–French source text against
the printed Breviary before enabling the existing reader.
No annual CGI/XHTML capture, duplicate calendar or paid
infrastructure is authorized.

## First Vespers Ordinary structure + independent Advent versicle witnesses (29 October)

The existing 2026-11-28/29 Advent I First Vespers ten-slot
source-research manifest is now supplemented by a separate
**source-structure and three-language component gate**:

- `src/office/advent-vespers-remainder-research.js`
  reviews a single transient, caller-supplied **original**
  `web/www/horas/Ordinarium/Vespera.txt` leaf at the exact
  pinned DO revision. The structural parser verifies eight
  major source markers in order: Incipit; Psalms; Chapter/Hymn/
  Versicle; Magnificat; Preces; Collect; Suffragium; Conclusion.
  It also retains the Monastic alternate chapter-responsory
  heading and the **two** source occurrences of Suffragium
  (one with a parenthetical condition). Their inclusion in the
  source does **not** authorize reciting either for Roman 1960.
  Conditional lines are counted, **not interpreted**.
- The same module checks `Tempora/Adv1-0` and
  `Psalterium/Special/Major Special` separately in Latin,
  English and French. The pinned **Latin** proper
  `[Versum 1]` explicitly points to
  `@Psalterium/Special/Major Special:Adv Versum 3`.
  The inspected English and French proper leaves lack this
  intermediate key, but each language's common Advent
  `[Adv Versum 3]` contains a verse and response.
  The module therefore reads the **actual common key in each
  locale**, rather than inventing an English or French
  translation or treating the missing alias as missing text.
- The three source-owned `Tempora/Adv1-0#Ant 1` sections
  are checked as **Magnificat antiphon candidates**. They do
  not establish the Magnificat canticle text or its repetition
  and placement rubrics.
- A changed Latin alias, newly introduced EN/FR local versicle,
  missing French component, substituted source revision/path,
  altered Ordinary ordering or disappearing variant is
  **withheld**. This adds six source-component observations
  (one verse/response and one antiphon per language) without
  increasing complete/certified Hour coverage.

`tests/divine-office-advent-vespers-remainder-research.mjs`
covers six regression cases. CI includes the new tests alongside
the corrected Saturday-Psalter psalmody (five Psalm143/144 portions), standard collect conclusion,
reference trace and annual metadata guards.

**Current release position:** original source sequencing is
better documented, not liturgically verified. The full Vespers
still needs 1960-specific Ordinary choice, antiphon repetition,
hymn/chapter and variable doxology assembly, Magnificat source
text, commemoration concurrence, printed witness collation,
trilingual alignment and rights review. Certified and published
Hours remain **zero**. No bulk CGI/XHTML capture, permanent
text archive, additional hosting or paid services are enabled.

## Critical 1960 First Vespers Psalter correction (29 October)

The prior 2026 Advent I research fixtures incorrectly used
**Sunday II Vespers** `Psalmi major#Day0 Vespera` and Psalms
109–113. This was caught by checking the **1960 Breviary General
Rubrics, no. 166(a)**: at **First Vespers of Sunday**, the
Ordinary and Psalter are from the **preceding Saturday**,
with the proper elements of the Sunday.

The correct original, pinned, trilingual source is
`Psalterium/Psalmi/Psalmi major#Day6 Vespera`. It specifies five
**portions** from only Psalms **143 and 144**:

1. Psalm 143:1–8
2. Psalm 143:9–15
3. Psalm 144:1–7
4. Psalm 144:8–13a
5. Psalm 144:13b–21

The pinned source writes `144(8-'13a')` and
`144('13b'-21)`; the French source uses typographical
curly apostrophes. The raw `Psalm143.txt` has legitimately
repeated numeric verse rows for 2, 12 and 13, and
`Psalm144.txt` has separate **13a/13b** rows. These are
source semantics, not corrupt duplications. The resolver now
enforces the exact five spans, repeated labels and same-language
origin rather than silently selecting the whole psalm.

The previous incorrect 109–113 research fixtures, assertions and
source hints were replaced; no 109–113 Vespers service was ever
published. The remaining antiphon, doxology, appointment, local
calendar and printed witness gates are still outstanding.

Rubrical witness:
https://isidore.co/divinum/www/horas/Help/Rubrics/Breviary%201960.html
(§166(a)). Source revision remains
`126a07f91ede04664108abb6fb20ace3f4de14b9`.
This correction is **mandatory** before any complete-Hour certification.


## Advent I First Vespers — 1960 rubric-sequence acceptance layer (29 October 2026)

The research source assembly's 9/10 slots are **not** nine approved liturgical slots. A separate, non-rendering pure reviewer now lives at src/office/advent-first-vespers-rubric-plan.js with regressions at tests/divine-office-advent-first-vespers-rubric-plan.mjs.

Under the 1960 Breviary Rubrics, BR 178(b) starts Vespers **directly at Deus in adiutorium**; the Pater noster and Ave Maria entries remain in the historical source inventory but are **not** obligatory Vespers opening events. BR 166(a) uses Saturday Day6 Vespera, with five Psalm 143/144 portions: 143:1–8, 143:9–15, 144:1–7, 144:8–13a, 144:13b–21. BR 190–191 puts **full** antiphons before and after all five portions and Magnificat (12 antiphon uses). BR 201 adds Gloria Patri after all five portions and Magnificat (6 instances). BR 260 excludes preces from this Saturday First Vespers. BR 204 puts the versicle after the hymn; BR 188 retains the printed hymn conclusion.

BR 247 differentiates *Dominus vobiscum* from *Domine exaudi* before the collect according to the recitation situation and ordination; a solo reciter always uses the latter. The reviewer records this branching but does not claim to have collated the actual spoken formula or dismissal. It also holds the opening Alleluia alternative, §198 psalm/canticle incipit overlap, and first-vs-second Vespers dismissal conditional. General Rubrics §§106–114 and Breviary Rubrics §§250–259 still require an independently reviewed commemoration decision. **No commemoration is invented or dismissed solely because its source slot is empty.** Local calendars are held.

This sequence is only a **rubric-ordered research witness**, not the source-authenticated published Hour. No real LA/EN/FR full-text print collation, rights approval, local-calendar adjudication, or live reader has been completed. Invariants remain 0 liturgically certified Hours, 0 approved Hours and 0 published Hours.

Primary references: [1960 Breviary Rubrics](https://isidore.co/divinum/www/horas/Help/Rubrics/Breviary%201960.html) and [1960 General Rubrics](https://isidore.co/divinum/www/horas/Help/Rubrics/General%20Rubrics.html). Next acceptance slice: a genuine, independently compared 1960/61 printed Latin Advent I First Vespers transcript and then separate English/French collation, with recitation, commemorations and publication rights adjudicated.

## Latin Advent I printed witness incipit review — finite evidence (29 Oct 2026)

New limited witness record: data/office/research/advent-i-2026-latin-print-anchors.json, checked by src/office/advent-first-vespers-latin-print-anchors.js and tests/divine-office-advent-first-vespers-latin-print-anchors.mjs.

The independently accessible [Diurnale Romanum Latin–English proof copy (2009)](https://www.latinmassschedule.com/Resources/Diurnale_Romanum__Latin_English.pdf), printed pp. 30–31 and Saturday Vespers reference p. 627, shows Advent I First Vespers, Saturday psalmody, the five proper antiphons (taken from Lauds), Romans 13:11 chapter, Magnificat antiphon and collect. Its 2009 **proof-copy** status precludes treating it as an authenticated 1961 editio typica. The [1961 Breviarium rubric scan](https://unavocesevilla.com/LIBROSLITURGICOS/BREVIARIUM%20ROMANUM.1961.pdf) supplies independent rubric rules but **does not contain the entire proper**. Its cover's "1961" cannot be transferred to the 2009 proof copy.

The reviewer checks only EIGHT short Latin incipits (five antiphons plus chapter, Magnificat antiphon and collect), exact Saturday five-portion source labels and source identities against caller-injected pinned Latin text. The upstream source revision is 126a07f91ede04664108abb6fb20ace3f4de14b9; original source blob identities for the proper and Saturday psalter are recorded. It rejects source drift, wrong day, missing Latin, the previous 109–113 regression and the 13a/13b split disappearing. It does not copy the full printed or upstream Office into this ledger, and does not fetch annual XHTML or run the CGI composer.

This is **partial source-to-printed-preview corroboration**, not a passing whole-Hour typica collation. The direct PDF page-image preview could not be loaded reliably in the review environment; verify visually against an authenticated 1961 original before release. Still uncollated: exact psalm verses/doxologies, complete antiphon texts, hymn, versicle, complete collect ending, Ordinary branches, commemoration/local calendar, three-language alignment and rights. **0 Hours certified; 0 Hours published.**

## 1961 printed Vespers Ordinary: complete Latin Magnificat lexical witness (29 October 2026)

A **new primary printed-Ordinary witness** is now recorded at data/office/research/advent-i-2026-1961-magnificat-print-hashes.json. The [1961 Breviarium Romanum, editio juxta typicam, Ordinary](https://unavocesevilla.com/LIBROSLITURGICOS/BREVIARIUM%20ROMANUM.1961.pdf) contains the actual Vespers opening on printed p.125 (PDF page index 125), *all ten Magnificat verses* (Luke 1:46–55) on printed p.126, and the collect/ending formulas on printed pp.130–131. These page images were independently inspected. They are **not** a full Advent I Proper or printed Saturday Psalter, and do not resolve those gaps.

The original pinned Latin Psalm232 single reusable canticle leaf is at revision 126a07f91ede04664108abb6fb20ace3f4de14b9, blob 954dd48b23bd1a2da7c8c79dda64e4a50df57f38. A conservative punctuation/diacritic/æ-ǽ/i–j-normalized lexical collation of the ten printed 1961 verses against that exact source matches all 10. The record stores **ten hashes and provenance, not another copy of the source text**. src/office/advent-first-vespers-1961-magnificat-lexical-check.js verifies the hashes against a single caller-injected pinned source leaf, and the CI contract uses the small single-canticle source-shape fixture (not an annual text generator). A changed word, reordered verse, missing verse, wrong source revision or fraudulent printed certification is refused.

**Acceptance boundary:** complete Latin *lexical* agreement of the shared Magnificat canticle has been witnessed. It is not full typography/chant-notation/verse-pointing collation, does not certify the source-owned full Gloria Patri wording, and does not certify the complete Advent I Hour or the English/French texts. Source-text rights and release remain unapproved.

The same printed Ordinary §47 shows that Vespers has an **opening Gloria Patri** embedded in Deus in adiutorium, besides the **five psalm doxologies plus the Magnificat doxology**. The research sequence records 1 opening + 6 after psalms/canticle = 7 Gloria Patri placements, without adding another redundant Gloria immediately after the opening source block.

Remaining full-Hour source gates: printed Saturday Psalms 143/144 with complete texts and 13a/13b divisions, Advent I proper antiphons/collect/chapter/hymn/versicle against an authoritative original, 1960 concurrence/commemorations, complete dismissal role variants, literal trilingual alignment, permission and app integration. **0 complete Hours certified; 0 published.**


## Advent I 2026 validation integrity and universal commemoration (29 October 2026)

**Correction of misleading earlier evidence:** the preceding Magnificat test fixture spelled Luke 1:51 as bráchio, while the authentic pinned Latin Git source and scanned 1961 Vespers Ordinary p.126 both read brácchio. The previous test's positive result therefore did not establish a genuine exact-source match. The fixture and this verse's lexical witness digest have been corrected. The reviewer now computes the real Git blob SHA from the *raw bytes supplied by the pinned source reader* instead of trusting a caller-provided SHA alone, and the fixture includes the exact final newline. No annual XHTML or redundant prayer archive is generated. The newer CI test must pass to count even the ten-verse limited lexical validation.

**Universal 1960 commemoration resolved for one exact evening:** RG11(a) and RG13 give 29 Nov 2026 Advent I (Class I) First Vespers on Saturday evening 28 Nov. RG108–111 admit only privileged commemorations on first-class days. The [28 Nov FSSPX Ordo](https://ordo.fsspx.org/day/2026-11-28?lang=en) lists Our Lady on Saturday (IV class) and explicitly moves to Advent I First Vespers that evening; the [29 Nov 1960 Office calendar](https://laudemus.org/?breviary_calendar=roman&breviary_rubrics=1960&date=2026-11-29&office=prima&place_id=4) lists St Saturninus as IV class, not celebrated. Neither warrants a privileged commemoration. The **universal-calendar result is no commemorations**. Research witness data/office/research/advent-i-2026-universal-commemoration.json, reviewer src/office/advent-first-vespers-universal-commemoration.js and tests now enforce that narrow decision. The rubric sequence accepts it as NO_UNIVERSAL_COMMEMORATION without generating prayer text.

**Explicit boundary:** universal does not mean every local calendar. Diocesan patron/titular/class I local commemorations require their own independent adjudication. The 145-page 1961 scanned Breviary PDF supports Ordinary and Magnificat wording but does not include the complete Advent I Proper or Psalter. The remaining principal gate is a *full printed* text collation of Saturday Psalms 143/144 and all Advent I propers, followed by LA/EN/FR alignment and rights review. Source structure checks alone are insufficient. **Zero fully certified Hours; zero published.**
