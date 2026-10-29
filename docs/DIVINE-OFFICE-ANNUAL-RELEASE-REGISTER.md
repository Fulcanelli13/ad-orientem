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
