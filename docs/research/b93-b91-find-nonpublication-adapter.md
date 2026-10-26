# B93 — B91 research to Find dry-run boundary

**State:** Nonpublication research staging. B93 is stacked on the B92 integrity-gate branch. The B82/B91 workbook comparison must pass before staging.

## Live app architecture
- The application reads generated JSON provider files using src/find/data-service.js, not the operational XLSX.
- Its provider data/directory/generated/v19/aasjmv.v1.json already includes AASJMV-EXT-001 (Capela do Oratório São José, Belo Horizonte). The B91 master recovery is NOT a second public venue.
- The existing publishableDirectoryRecords function checks auditVenue but does not universally suppress all research-only status strings. A complete venue object marked RESEARCH_ONLY_NOT_PUBLIC could leak into the public results.
- B93 therefore emits preview data intentionally without venue_id, geo, schedules or ministries. It cannot be passed to the live loader as a working provider.

## Run locally

From repository root, after acquiring the exact original B82 and B91 XLSX files, execute:

    python3 tools/directory/stage-b91-research-only.py --baseline /path/to/B82.xlsx --candidate /path/to/B91.xlsx --repo-root . --report /tmp/b93-dryrun.json

The script runs the B92 pinned-SHA parity validator; enforces row-level physical/source identity; reads all local v19 provider snapshots; detects existing frozen source IDs; checks no published Place ID, geometry or schedule exists; and emits a review-only JSON document. It refuses to overwrite reports or write under the app source, generated directory or licensed data.

Expected: five staged research source previews; existing-provider source collision for AASJMV-EXT-001; zero new app venues, zero new app Mass schedules, zero new public pins.

## Verified evidence and limitations

Local B82/B91 full parity check passed on 26 October 2026, using pinned originals. Local adapter test used an app-provider fixture reflecting the existing AASJMV-EXT-001 record. An independent GitHub connector review covered the 27 v19 provider JSON files: among the five exact proposed source IDs, only AASJMV-EXT-001 was present, in aasjmv.v1.json. Exact source-ID matching alone cannot exclude equivalent buildings published with different IDs: further building-level identity reconciliation remains required.

CI unit tests exercise Python staging failure cases and the real Find auditVenue/publishableDirectoryRecords nonpublication boundary; CI does NOT load the uncommitted XLSX master, so a green run is NOT evidence of full workbook parity.

## Promotion boundaries

A separate reviewed release is required to map research groups to stable public venue IDs, verify owner-specific exact worship buildings and geospatial coordinates, check current source-specific 1962-Missal use, and certify each recurring schedule independently. Never turn an existing AASJMV-EXT-001 provider row into a second public pin merely because B91 admitted its missing canonical research identity. Do not automatically write to src/find or data/directory/generated.
