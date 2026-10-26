# Ad Orientem — 1961 Graduale Romanum bulk discovery

26 October 2026. Research-only integration in draft PR #1749.

## Live position and accounting

- Production Mass reader: **unchanged** by this bulk pipeline.
- Existing separately curated Gregorian prototypes: 12 reference scores
  (seven Ordinary examples; five source-bound Christmas Day Propers).
- Bulk import: importer and screening code verified on reproducible synthetic
  SQL fixtures; the complete pinned historical source run must finish before
  real counts are reported. **Do not count historical source links as accepted
  scores.**
- The source is an archived GregoBase SQL snapshot (repository commit
  `8851677efaccf0dccd4eb05ebff28d6f4018584c`), not the current
  2026 website database. It cannot establish live source or recording status.

## Canonical source and scope

- Repository: https://github.com/gregorio-project/GregoBase
- Pinned input: https://raw.githubusercontent.com/gregorio-project/GregoBase/8851677efaccf0dccd4eb05ebff28d6f4018584c/gregobase_online.sql
- Edition: GregoBase `sources.id=2`, `1961`, `Solesmes`,
  `Graduale Romanum`.
- Relation: `gregobase_chant_sources` joining `chant_id`, `source`,
  `page`, `sequence` and `extent` to the chant table.
- Exact chant IDs preserved as `GREGOBASE-{number}`; distinct editions,
  pages, incipits and duplicate relationships are **not** flattened away.
- Source GABC transcriptions are CC0 per GregoBase's declaration, but
  `copyrighted=1` source flags remain quarantined for investigation.

## Run locally without MySQL or subscriptions

The pinned public SQL is not committed to the app repository.

~~~sh
curl --fail --location --retry 3 \
  https://raw.githubusercontent.com/gregorio-project/GregoBase/8851677efaccf0dccd4eb05ebff28d6f4018584c/gregobase_online.sql \
  --output /tmp/gregobase-1961.sql
node tests/mass-chant-catalogue-ingest.mjs
node tests/mass-chant-catalogue-screen.mjs
node tools/mass/ingest-gregobase-1961.mjs \
  --sql /tmp/gregobase-1961.sql --out /tmp/ao-chant-discovery
node tools/mass/screen-gregobase-1961.mjs \
  --index /tmp/ao-chant-discovery --out /tmp/ao-chant-review
~~~

`.github/workflows/mass-chant-1961-bulk-discovery.yml` runs the same
process using a read-only GitHub Actions permission, without a paid service
or persistent upload of unreviewed 17 MB SQL. The job's temporary files are
**not an archive**. Because the pinned upstream file and exact importer code
remain accessible, its metadata outputs are reproducible. Persistent
catalogue shards must subsequently be committed and checksum-verified in
the Ad Orientem repository. GitHub Actions logs/artifacts must **never**
be treated as durable storage for unique editorial decisions.

## Data stages (do not conflate)

| Gate | Status | Meaning |
|---|---|---|
| G0 — Ingested source link | `HISTORICAL_SOURCE_METADATA_NOT_READER_APPROVED` | 1961 edition relationship and metadata extracted |
| G1 — Screened lead | `READY_FOR_GABC_SOURCE_REVIEW` | GABC payload flagged present; no known duplicate/copyright/classification exception |
| G1 exception | `EXCEPTION_METADATA` | Missing GABC, duplicate, copyright flag, unknown liturgical role or page |
| G2 — Acquired and hashed | Pending | Fetch *current* CC0 GABC; preserve source ID, transcription text, changes and SHA-256 |
| G3 — Music accepted | Pending | Compare clefs, pitches, neumes, episemata and repetitions with 1961 printed facsimile |
| G4 — Liturgical selection | Pending | Match exact selected 1962 Proper and musical role; exclude rites with different rubrical rules |
| G5 — Reader presentation | Pending | Regression, device test and expert approval before activating any new score |

A record's classification as Introit, Gradual, Alleluia, Tract,
Offertory, Communion or Ordinary is **not** sufficient for G4. Titles may
occur several times across feasts and even within one Mass. The native
`reader-proper-chant-crosswalk.js` still owns the fail-closed runtime match
to the actual resolved Proper slot.

## Batch strategy and reporting

The importer generates deterministic JSON shards of **200 leads**;
the screening step creates separate **200-record main/review batches** and
exception queues. Manifest reports actual linked leads, GABC-present count,
office-part categories, duplicates and copyright flags. Source checksum,
number of rows per shard and source-revision ID are mandatory. No
unsourced extrapolation of percentage coverage.

For future sessions report four distinct denominators: discovered links,
metadata-screened leads, facsimile-verified scores, and liturgically
promoted reader scores. These are not equivalent.

## No audio or unsupported storage

The Mass-preparation audio registry remains empty until authentic,
rights-cleared, quality-reviewed recordings are available. The live Mass
reader remains silent. Only the existing zero-cost GitHub workflow and
local code are used; no metered cloud storage, paid processing or temporary
Actions artifact is the source of truth.
