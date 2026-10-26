# B92 — B91 research-core import acceptance gate

State: evidence-only. This workflow does not update the live application, public map, or Mass Times register.

## Artifacts

- Historical B82: Ad_Orientem_TLM_B82_Consolidated_Identity_And_Physical_View_2026-10-25.xlsx (47-sheet archive; retain separately).
- Lean B91 research successor: Ad_Orientem_B91_Lean_Consolidated_Operational_Core_2026-10-26.xlsx (9 sheets: four full operational tables and overlays).
- Exact SHA-256 fingerprints are pinned in tools/directory/validate-b91-research-core.py. Neither workbook is stored in this PR.

## Reproduce the complete workbook gate

From repository root, with both XLSX files available locally, run:

python3 tools/directory/validate-b91-research-core.py --baseline /path/to/B82.xlsx --candidate /path/to/B91.xlsx --report /tmp/b92-research-audit.json

Use the actual B82/B91 filenames, not the shortened placeholders. The script has no third-party dependencies, network calls or direct application writes. Exit code 0 means PASS; exit code 2 means BLOCKED. The generated JSON is a research audit, not an app-consumable data snapshot.

The CI workflow runs self-contained parser and integrity regression tests only. It cannot assert actual B82/B91 workbook parity without those two binary artifacts; do not mistake a green parser CI for a full accepted workbook import.

## Fail-closed acceptance invariants

1. Both complete XLSX checksums match the approved B82/B91 binaries exactly.
2. All four inherited operational tables match B82 cell-for-cell and in order, including all 28 columns of each of 4,681 MASS TIMES records.
3. Frozen group IDs and source IDs remain unique and in original order. New, unexpected formulas and columns are rejected.
4. Five B88 research additions have the documented stable group/source IDs and first-party source URLs, with zero public Place IDs, map coordinates or verified schedule counts.
5. The five exact physical-building aliases (Manchester ×1, Montréal ×2, Warrington ×1, Reading ×1) resolve to valid historical group IDs. All 2,581 historical research group records map onto 2,576 effective physical-site anchors.
6. The initial 4,681 timetable rows, including 3,347 VERIFIED statuses, remain unchanged; none of the new B88 sources receives a timetable row.
7. The candidate workbook remains research-only, not a map or schedule publication.

## Production publication remains separate

The application's Find/Directory runtime currently consumes normalized source-specific JSON records, not the Excel research register. See src/find/data-service.js, data/directory/generated/, and tools/directory/ingest-firstparty-mass-batch.mjs. Do not bypass existing first-party Mass evidence gates by copying the B91 rows directly to production.

Any subsequent production adapter needs an independently reviewed record mapping into the current Directory contract: physical venue, ministry affiliation, liturgical usage, provenance, verification and separately dated schedules. Exact map pins and current 1962 liturgical use must be verified independently. Aliases are not new physical worship sites. Existing schedules must not be redirected merely because two historical group IDs refer to one building.

The B92 work does not merge or replace PR #1701 (B88), PR #1706 (B90) or PR #1709 (B91). No automatic app publication is authorized.
