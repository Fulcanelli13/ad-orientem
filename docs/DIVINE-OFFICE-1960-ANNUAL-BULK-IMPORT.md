# Divine Office — full-year Latin source extraction (1960 Roman rubrics)

## Why the weekly Compline rollout must not be the extraction strategy

The public Prayer reader currently contains **44 individually certified Latin
Compline dates** (28 November 2026–10 January 2027), developed through
multiple seven-date PRs. That is the **publication history**, not a
sensible way to assemble a year of eight Hours.

[Divinum Officium's official standalone generator](https://github.com/DivinumOfficium/divinum-officium/tree/master/standalone/tools/epubgen2)
can already produce all eight Office Hours with its **Rubrics 1960 - 1960**
precedence engine, as a yearly EPUB. It is unnecessary to build an
independent replacement for that engine before the texts are extracted.

This changes our workflow to **one full-year generation**, **one
source/structure report** and **an exception queue**. Human liturgical
review should be reserved for disputed placements/editions, not for
granting extraction permission to every routine day.

## First real annual run — verified 9 November 2026

[GitHub Actions run #42601773798](https://github.com/Fulcanelli13/ad-orientem/actions/runs/42601773798)
has finished **SUCCESS**, with all three jobs green and actual source
generation completed for both requested years.

- **2026: 2,920/2,920** original Latin XHTML Hours, 365 civil days,
  8 canonical Hours each, **0 missing/invalid source exceptions**.
- **2027: 2,920/2,920** original Latin XHTML Hours, 365 civil days,
  8 Hours each, **0 missing/invalid source exceptions**.
- **Total: 5,840 complete generated source chapters**; all have
  SHA-256, the exact upstream revision and original EPUB member name.
- [2026 source artifact](https://github.com/Fulcanelli13/ad-orientem/actions/runs/42601773798/artifacts/13667050531),
  [2027 source artifact](https://github.com/Fulcanelli13/ad-orientem/actions/runs/42601773798/artifacts/13665874269).
  These are automatically purged **9 December 2026** unless durable
  archival is completed.

I independently inspected actual generated chapter markup from the
artifacts, not just CI summary counters: on 1 January 2026 the
eight complete Hours contain real Latin psalms, hymn texts,
readings and prayers. The original XHTML contains explicit
`<td id="MatutinumN">` source anchors, `<b>Hymnus</b>` / `<b>Oratio</b>`
and other genuine source-section labels and verse line breaks.
Those anchors and lines are now preserved in the structured importer;
we do not fabricate missing section names.

Preliminary cross-Hour scan of the actual first-run archive found
**61 dated evening-office transitions in 2026 and 62 in 2027**
(where Vespers' principal Office differs from Matins), with the
Compline title matching Vespers on every date in both years. The
new `audit_annual.py` turns this observation into an automated,
source-referenced annual precedence report. It is not itself an
independent rubrical review.

**Extraction COMPLETE, independent textual/liturgical certification
NOT COMPLETE, public release unchanged at 44 Compline dates.**

## Repeatable 2026/2027 extraction

Workflow: `.github/workflows/office-annual-bulk-source.yml`

Source pinned to upstream Divinum Officium Git revision:

`126a07f91ede04664108abb6fb20ace3f4de14b9`

The workflow sparse-checks out the exact source revision, installs the
upstream Perl/CGI generator prerequisites and runs its official
`epubgen2.sh -y YEAR -t YEAR -r 1960` independently for 2026 and 2027.
No network scraping of individual prayers and no inference of prayers
from a modern Mass calendar.

Expected output coverage:

| Year | Civil dates | Eight Hour instances |
| --- | ---: | ---: |
| 2026 | 365 | **2,920** |
| 2027 | 365 | **2,920** |
| **Total** | **730** | **5,840** |

The eight Hours are Matins, Lauds, Prime, Terce, Sext, None,
Vespers and Compline. The 1960 Hours include **Prime**; this is not a
postconciliar Liturgy of the Hours import.

The source EPUB for each year is copied to its CI research artifact
for source-by-source reproduction. The parser
`tools/office-bulk/import_epub.py` uses standard-library Python
(`zipfile`, `HTMLParser`) without extra paid dependencies. It
consumes the generator's actual dated filename contract:

`MM-DD-YYYY-N-Matutinum|Laudes|Prima|Tertia|Sexta|Nona|Vespera|Completorium.html`

For each original XHTML Hour it records:

- Exact date, canonical Latin Hour, source EPUB filename, immutable
  upstream Git commit, raw XHTML SHA-256 and explicit Latin/1960 scope.
- Ordered display blocks containing source tag, source attributes,
  visible Latin text and block ordinal. The generator's duplicated
  eight-Hour navigation menu is excluded.
- An unambiguous **research-only** status. No editorially inferred
  psalm/antiphon/lesson boundaries are passed off as source-certified
  liturgical units; all blocks retain original EPUB traceability.
- Twelve deterministic compressed JSONL files per year,
  `office-YYYY-MM-la-1960.jsonl.gz`, plus
  `manifest.json` and `exceptions.json`.
- Every expected day/Hour pair is checked. Missing, duplicated,
  unreadable, overlarge, malformed or conspicuously empty chapters
  are reported. The extraction job **fails** on incomplete coverage,
  but uploads its exception report for analysis rather than silently
  filling gaps with synthetic text.

The **two full-year generation jobs** run in parallel via a GitHub
Actions matrix. The results are research CI artifacts, **not**
automatically included in the GitHub Pages static website. The initial artifacts expire after **30 days**. A separate,
permission-scoped `archive-source-research` job now runs **only on
main-branch pushes of this reviewed pipeline**. After verifying the two
yearly manifests, original EPUB SHA-256 hashes, complete eight-Hour
coverage, section/First-Vespers audits, exceptions and research-only
flags, it creates an **immutable prerelease** with both EPUBs,
structured monthly data, source logs and the upstream MIT licence.
Its tag is
`office-source-latin-1960-2026-2027-do126a07f-ao-v1`.
It refuses to overwrite any previous archive.

**Durable GitHub archival is not yet complete until this PR is merged
and the main-branch archive job succeeds.** Source research releases
never deploy to GitHub Pages or unlock additional public Hours.

## Three genuinely different readiness states

1. **Extracted:** all eight source XHTML Hours generated and parsed
   for a complete civil year with 0 missing/invalid chapters.
2. **Validated:** structural completeness, original source-link
   resolution, 1960 precedence and special-Office exception checks
   completed. The first parser only proves level 1 and preliminary
   structural checks; it does **not** mark level 2 automatically.
3. **Published:** the canonical Ad Orientem Prayer Office reader
   renders reviewed events in the right sequence and form, with full
   320px/390px UI and rubrical acceptance, and GitHub Pages
   exact-commit publication verified.

No date automatically moves from level 1 to 2 or 3. In particular,
the legacy **44 public Compline dates remain unchanged** by this
pipeline, and all other seven Hours remain blocked on the public
reader. The new records are *entirely separate* from
`src/office/latin-compline-public-release.js` and the curated static
build.

## Next technical milestone

Once actual annual artifacts have completed, build the semantic
resolver on top of the extracted **source-aligned blocks**, with
typed `psalm`, `antiphon`, `hymn`, `lesson`, `responsory`,
`collect`, `rubric`, `commemoration` and `versicle` events.
Only assign such a type when corroborated by a source marker or
independent textual validation. Preserve every raw XHTML anchor
and original Latin word; create an exception entry rather than
guessing a missing proper.

Compare resulting date/Hour appointments to an independent
1960 Roman Office calendar, prioritizing First/Second Vespers,
Christmas, Epiphany, Candlemas, Lent, Holy Week, Triduum, the
Easter Octave, Ember Days, transferred feasts, Requiems and
local calendar variations. Then batch-integrate the generated
data into a universal, mobile-first Office reader, not another
set of seven-date manually whitelisted modules.

## Evidence and operating restrictions

- Official upstream [EPUB generator instructions](https://github.com/DivinumOfficium/divinum-officium/blob/master/standalone/tools/epubgen2/README.md)
  support the exact `-y`, `-t` and `-r 1960` options and 8 Hours.
- [Divinum Officium data format](https://github.com/DivinumOfficium/divinum-officium#data-files)
  uses bracketed sections in UTF-8 source files. Inference from the
  generated HTML is provisional until source-section semantics are
  reconciled.
- Preserve the applicable upstream MIT licence, attribution and
  source notices. Do not misrepresent original 1961 Mame printed
  Psalter facsimile collation or unsupplied English/French translations.
- **Only GitHub Actions, GitHub artifacts and GitHub Pages**,
  without Vercel or any paid deployment services.
