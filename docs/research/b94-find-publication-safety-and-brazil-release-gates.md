# B94 — Universal explicit research-hold protection in Find

## Actual defect
Before B94, `src/find/data-service.js` could publish any structurally valid Directory venue unless one of the **SSPX-specific** provider checks rejected it. A venue with a correct address, an otherwise valid `venue_id`, and `publication_state: RESEARCH_ONLY_NOT_PUBLIC` passed `auditVenue` and could appear in public Find results.

## What B94 changes
`isHeldDirectoryPublication(record)` is evaluated first in `publishableDirectoryRecords`. It rejects explicit review-only publication states such as RESEARCH_ONLY, HOLD, DRAFT, STAGING, PROVISIONAL, NOT_PUBLIC, NO_PUBLIC, SOURCE_ONLY and UNCONFIRMED; the B91/B93 staged provider origin; or an explicit `research_only: true` flag.

This is an **explicit deny policy**, not a blanket status allowlist. Existing historical provider snapshots sometimes omit a publication state entirely; their approved behavior is preserved. The existing SSPX and ICKSP filters remain unchanged.

A complete valid venue marked `RESEARCH_ONLY_NOT_PUBLIC` must now fail publication, rather than relying on the B93 adapter deliberately omitting the venue ID.

## Important scope boundaries
- No new Directory provider, no new public venue or map pin, and no Mass timetable changes.
- Does not alter the B82 full research archive, B91 lean research successor, B92 validation, or B93 dry-run adapter.
- The existing `data/directory/generated/v19/aasjmv.v1.json` has source `AASJMV-EXT-001`; B91's missing research-master record should NOT be reintroduced as a duplicate app venue.
- An unknown/fraudulent source that supplies a complete normal-looking public venue without a hold flag is **not** stopped by this specific guard. A separate affirmative source-approval and site/schedule release process remains mandatory.

## B91 four proposed Brazil sites: physical/site collision review
The 26 live v19 provider snapshots contain 1,019 source records. No exact frozen source ID or named-location collision was observed for four B88 research additions. One current CMRI site in Volta Redonda, `CMRI-INT-043`, uses RJ-153 km 7 and is a **different building** from the AASJMV proposal at Rua Doutor Miguel Couto 78. These results are a screening result, not proof that no other operator or external public provider describes the same building. FSSP's larger production venues JSON was not exhaustively parsed by the connector.

Candidate release holds are recorded in `data/directory/research/b94-20261026-find-publication-gate-brazil-four-crosswalk.v1.json`.

### Release gates for each of four locations
1. Confirm exact worship building and source address, not merely community name or city.
2. Verify building/address-precision geometry, country match, attribution, and map provider identity.
3. Confirm an ongoing public 1962-Missal Mass from an appropriately dated first-party notice.
4. Certify recurring timetables independently; a once-held Mass proves neither recurrence nor current opening.
5. Reconcile all existing app provider IDs and historic research/source IDs before creating a public `venue_id`.
6. Publish only in a separate, explicitly reviewed production data change. No publication in B94.

## Testing
Run `node tests/directory-b94-research-publication-gate.mjs` and existing `node tests/directory-contracts.mjs`. The dedicated GitHub workflow tests syntax, the new real Find filtering behavior and the existing directory contracts. The tests do not require or mutate the binary XLSX research masters.
