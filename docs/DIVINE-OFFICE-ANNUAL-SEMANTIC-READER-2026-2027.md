# Annual Divine Office — source-aligned semantic reader, 2026–2027

## Objective and publication boundary

The upstream Roman 1960 Latin source has already been generated for
**5,840/5,840 canonical Hour instances** across 730 dates in 2026–2027
([merged PR #2738](https://github.com/Fulcanelli13/ad-orientem/pull/2738),
[complete production-independent source generation](https://github.com/Fulcanelli13/ad-orientem/actions/runs/42607438137)).
The weekly Compline source-fetching strategy has been superseded.

This next stage converts the full-year output into a **single,
source-aligned internal reader**, without treating mere text extraction
as a liturgical certification or publishing it to the public Prayer
app. The only public Office release remains the previously certified
**44 Latin Compline dates, 28 November 2026–10 January 2027**.

## Typed source projection

`tools/office-bulk/semantic_events.py` reads all twelve compressed
monthly XHTML-extracted JSONL records per year and emits new
`semantic-YYYY-MM-la-1960.jsonl.gz` files, plus one
`semantic-audit.json` and 365 original-Latin day bundles per year.

Typed sections are established from **explicit upstream bold Latin
section markers**, not guessed from typography or a calendar:

- `Incipit` → opening;
- `Invitatorium` → invitatory;
- `Psalmi` and `Psalmi cum lectionibus` → psalmody, with Matins'
  lesson continuity preserved;
- `Hymnus` → hymn;
- `Lectio 1` … `Lectio 9`, `Lectio brevis` → lessons;
- `Capitulum Responsorium Versus` and
  `Capitulum Hymnus Versus` remain **composite sections**;
- `Canticum: Benedictus`, `Canticum: Magnificat` and
  `Canticum: Nunc dimittis` → Gospel canticles;
- `Oratio`, `Conclusio` and `Antiphona finalis B.M.V.`
  → prayers, conclusion and Marian ending;
- `Martyrologium`, `De Officio Capituli`, `Preces Feriales`
  and `Litaniæ` retain their explicit source sections.

Within each original XHTML block, **every original Latin display line**
is retained verbatim with its source block ordinal, original XHTML
`id` and line index. Where the source itself begins a line with a
documented marker (`Psalmus 4 [1]`, `Ant.`, `℣.`, `℟.`,
`Orémus.`, numbered Vulgate verse, `Nocturnus II`, etc.), it
receives a typed source-marker role. All other lines are explicitly
marked `unclassified_source_line`. The importer does **not**
split a composite `Capitulum Responsorium Versus` into conjectural
independent liturgical events or invent a prayer from unlabelled text.

Checks refuse missing original source blocks, changed ordinal order,
unrecognised bold headings, mismatched source language/rubrical
version, incomplete year and absent source-line provenance. Exceptional
missing Psalm headings or explicit source section markers are
**reported for review**, not filled with synthetic text.

All source transformations inherit the original Latin XHTML SHA-256,
EPUB member path, pinned upstream Git revision
`126a07f91ede04664108abb6fb20ace3f4de14b9`, and 1960 Roman
rubrical scope. Neither source extraction nor source-marker typing
asserts independent Office precedence, exact 1961 Mame printed
collation, Gregorian notation or approved vernacular translation.

## Precisely scoped source-format exceptions

A direct audit of all **5,840 real generated source records** found that
every Hour contains source Psalm headings, but **16 Hour records**
lack the normal *explicit bold Psalmi section title*:

| Year | Dates and Hours | Count |
| --- | --- | ---: |
| 2026 | 2–4 April, Compline (Triduum); 2 November, Prime, Terce, Sext, None and Compline | 8 |
| 2027 | 25–27 March, Compline (Triduum); 2 November, Prime, Terce, Sext, None and Compline | 8 |

These are **source-layout exceptions**, not missing Latin psalms.
The original `Psalmus` titles and verse text are still present.
They are retained in `semantic-audit.json` as
`special_format_source_review:true`, with their exact civil dates
and Hours; they are **not marked liturgically certified**. The
CI enforces exactly eight *expected source-format review cases*
per year and **zero unexpected** source-marker defects. Any new
unlabelled source psalmody group fails the semantic release gate
rather than quietly passing.

Their precise 1960 Triduum and All Souls arrangement requires
separate printed-rubric collation. This focused 16-record queue
is materially different from manually reviewing 5,840 ordinary
source records.

## One private reader for both years

`tools/office-bulk/research-reader.html` implements a responsive
Latin-only **internal research reader**:

- one civil-date control, previous/next day navigation across
  **31 December 2026 → 1 January 2027**;
- all eight canonical Roman Hours (Matins, Lauds, Prime, Terce,
  Sext, None, Vespers, Compline) accessible on every date;
- mobile 320px/390px layout, section rail, readable individual
  numbered Scripture lines and source-marked rubrics and dialogue;
- source XHTML chapter filename/hash and explicit research-only
  publication disclaimer for each Hour;
- **safe text rendering**, never injecting original XHTML via
  `innerHTML` or executing scripts from liturgical sources;
- `reader/2026/MM/DD.json` and `reader/2027/MM/DD.json` day
  bundles generated separately from the public app.

The internal website is assembled by the
`combine-private-reader` GitHub Actions job, which joins **both
complete annual source archives into one 730-day / 5,840-Hour reader**
and checks each day's exact eight Hour records and
`public_reader_authorized:false` status. It is uploaded as a
**90-day research artifact**, not deployed to GitHub Pages or packaged
into the public service worker.

The workflow uses a real Chromium acceptance test on **320px and
390px** viewports for the eight Hours, source and hymn availability,
two-year date rollover, the January Baptism / First Vespers source
cases, safe rendering and no horizontal overflow. Browser evidence
and screenshot receipts are kept in CI, not represented as physical
handset certification.

## Remaining gates before publishing the full Divine Office

The result of this step is expected to be **full-year semantic
source alignment and internal navigation**, not completed independent
liturgical certification. The next workstream must:

1. Review typed line roles against the primary Divinum Officium
   Latin source sections across all eight Hours, including composite
   Matins / Prime / little-Hour material and antiphon boundaries.
2. Reconcile the source-generated 1960 calendar and First/Second
   Vespers transitions against an independent historical Roman
   Breviary/ordo, prioritising Christmas, Epiphany, Lent, Holy Week,
   Easter, Ember days, transferred feasts and fixed-date concurrence.
3. Resolve flagged source exceptions and completeness of each
   prayer, including words that differ by source edition, before
   setting any new `liturgically_certified` value.
4. Adapt the one day/Hour/section model to Ad Orientem's permanent
   mobile Prayer UI and test live verse focus, language scope,
   local-community calendar separation and 320px/390px behavior.
5. Review the final static source dataset and licensing, then
   independently authorize a public release. Public deployment
   remains **GitHub Actions + GitHub Pages only**, no Vercel.

Source research remains distinct from public certified Compline. No
existing 65-card Mass model, Schola, public Latin Compline release or
public site navigation is changed by this pipeline.
