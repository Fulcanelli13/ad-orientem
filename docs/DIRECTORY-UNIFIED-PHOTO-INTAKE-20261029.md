# Directory Photography — full CL2 intake (29 October 2026)

The frozen R49 map's 1,879 source records are NOT the worldwide Directory universe. The existing unmerged CL2 master (PR #1729) holds **2,579 consolidated physical-site research anchors** derived from 2,584 historical group IDs and five same-building aliases. It also has 2,687 venue-source rows. The current CL2 research branch additionally lists 2,308 unresolved provider/third-party lead identities, **not 2,308 proven new churches**. Those remain in CL2's own identity reconciliation queue, outside the anchor photo queue.

## Deliverables

- tools/directory/build-unified-photo-intake.py: validates checked-in CL2 site and venue shard SHA256s; builds one queue item per consolidated anchor, never per duplicate source or alias.
- All 2,687 venue rows are accounted for, with group-conflict and unknown-source cases held explicitly; R49 connects only by exact unchanged source ID.
- Emits 11 deterministic 250-record shards (last 79), audit and manifest with SHA256, country counts and source lineage, plus complete no-publication holds.
- Frozen names and source physical descriptions are search hints, NOT proof that a photographed church is the right building. No geolocation is invented.
- Read-only CI fetches the pinned original CL2 branch SHA and builds all 11 shards, then verifies unique IDs, checksums, zero approved covers and no app publication.
- Offline tests use synthetic duplicate aliases, source group conflict, source SHA tampering and forbidden public-release states.

## Source and execution

Reviewed CL2 source branch: data/cl2-unified-source-location-classification-20261026
Reviewed commit: eb67711a9886a7626916b7a145787c5e99105968
Run the script using a separate checked-out worktree of that exact commit and the unchanged main R49 file. Reject CL2 updates until source diff has been reviewed and the commit re-pinned.

## Next workflow

1. Persist the 11 complete photo-intake shards on a permanent research-only archive branch; do not change the production Find loader.
2. Source-first licensed media metadata indexing for the whole 2,579 anchor population, caching by Commons/Wikidata IDs and original SHA1.
3. Resolve rights and matching in high-volume subsets; keep unresolved subjects and the CL2 candidate lead queue unpublished.
4. Visual contact-sheet review in groups of 100–200, exterior then nave/high altar then 360°.
5. Attach approved local image assets to existing Directory cards and Sacred Places only via confirmed exact-site identities.

No photo acquisition, approval, extra map pins or verified Mass schedules is claimed by this intake release. Total direct cost remains €0, without recurring paid APIs or unbounded image downloads.
