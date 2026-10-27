# CL27 — Integrated worldwide TLM classifications

This belongs to the **existing** Ad Orientem canonical Directory research master. It is not a new venue catalogue, spreadsheet-based pipeline, or independent source of truth. The 2,584 frozen historical IDs, their five aliases, the 2,579 distinct physical anchors, the 2,687 venue-source rows, the 2,715 class-source rows and 4,681 Mass assertions remain unchanged.

**User's 12-dimensional taxonomy**: institute/community; ecclesial position including sedevacantist and sedeprivationist; una cum; dated canonical status; liturgical rite; Missal edition; rubrical basis; organizer role; venue ownership; celebrant relationship; Mass type; and site/timetable verification. Schema: `data/directory/tlm-user-classification-taxonomy.v1.json`.

**Important distinction:** classifications apply to their true subjects, not indiscriminately to buildings.

- Physical church: stable canonical identity, address/pin, source links, factual ownership where evidenced.
- Institution/community: source-reported label and any *dated, attested* ecclesial position/status.
- Ministry/celebrant: actual relationship to venue, responsible priests and organizer, when evidenced.
- Individual celebration: Mass type, Missal and rite, `una_cum` where truly documented, exact recurring clock and exceptions.

## Full research projection from the GitHub master

The existing CL2 SQL reconstruction already stores the **complete classification rows**. The newly added program creates the missing indexed *projection by physical venue*, without changing or copying the underlying canonical records. Every source-scoped assertion remains separately queryable.

```bash
python3 tools/directory/rebuild-cl2-research-snapshot.py \
  --snapshot-dir data/directory/research/cl2-unified-20261026 \
  --output /tmp/tlm-cl2.sqlite

python3 tools/directory/build-cl27-tlm-classifications.py \
  --db /tmp/tlm-cl2.sqlite \
  --output /tmp/tlm-classification-projection.v1.json
```

Expected integrity: **2,579** anchor rows; **2,715** source claims; **2,674** safe classification→source→group joins; **five** held group conflicts, **36** classification-only orphans and **eight** source rows lacking classification. Existing source affiliation hints: **2,008** (unverified labels). Exactly **three** separately sourced owner-level 1962 book witnesses, *not* three fully documented recurring slots. New venue-level `una_cum` assertions: **zero**. No newly approved liturgical or canonical filter or map pin.

The GitHub CL27 workflow runs the above conversion and data-gate checks on the PR, using the versioned, checksum-protected CL2 shards and only Python stdlib. Derived JSON is reproducible; no costly cloud storage is needed.

## Existing TLM Find interface

In `src/find/preliminary-directory-r49.js` and `src/find/explore-presentation.js`, the **existing provisional map** now makes the source-report distinction clearer. Institute filters can distinguish FSSP, ICKSP, IBP, SSPX, AASJMV, Oratorians, Canons of St John Cantius, Transfiguration, Capuchins of Morgon and other source-listed religious communities, without moving any physical pins or changing their original 1,879 R49 records. Site details show the documented *source affiliation* and mark rite/Missal/Una Cum/ecclesial position unknown pending proof.

This interface does **not** claim that the CL2 research population has been made public. Its separate B91 three-site overlay also remains governed by its existing release gate.

## Next population work — evidence, not guessed classifications

1. Resolve institute/source-role claims using official community/parish/diocesan pages, keyed to exact source ID and the correct physical anchor; preserve mixed/lay/visiting ministries.
2. Where explicitly attested, add *source-scoped* position (including sedevacantism), recognition of pontiff, `una_cum` for celebration, and **dated** canonical-status claims. A source's organizational label alone never supplies these.
3. Link actual book/rite witnesses to corresponding individual Mass events, not the host venue; include Dominican and other local usages.
4. Expose positive public facets only once a reviewed claim has an appropriate entity ID, source, date, scope and public gate. Continue to display Unknown and source labels distinctly.

This work is stacked with the existing CL27 timetable audit PR (rather than duplicating its venue records). B92 PR #1724 has an evidence validator and contract that must be reconciled before final integration. No new public schedule, map pin, una cum or canonical claim is auto-promoted.
