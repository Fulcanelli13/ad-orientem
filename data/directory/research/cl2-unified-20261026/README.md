# CL2 — Unified location × liturgical-classification research master

**26 October 2026 · Research data only.** This folder contains the **actual records**, split into integrity-checked JSON parts. It is not another screening list, and it is not an automatically publishable directory feed.

## Canonical population

| Data | Actual rows | Safeguard |
|---|---:|---|
| Historical canonical worship-site IDs | 2,584 | Original IDs and five historical same-building aliases preserved |
| Distinct provisional physical-site anchors | 2,579 | Research sites, not currently verified/published Mass pins |
| Complete venue-source rows | 2,687 | All original B98 source fields preserved, including cautious unverified values |
| Original historical Mass timetable rows | 4,681 | All 28 original columns, in original order; 3,347 historical VERIFIED labels untouched |
| Source-level institutional/liturgical classification rows | 2,715 | Every CL1 original field and its source ID preserved |
| Exact source-ID join | 2,679 | Includes five held contradictory group assignments |
| Exact source-ID **and** group-ID join | 2,674 | Safe deterministic same-row joins |
| Classification-only source rows | 36 | Preserved as **unadmitted**, not fabricated into physical sites |
| Venue-source records lacking classification | 8 | Retained with UNKNOWN / no sourced profile |
| Source-group contradictions | 5 | Source IDs agree but assigned group IDs differ; preserve both and hold |
| Cross-master group-ID differences | 44 | Original 36 + 8, separate from five contradictions; 49 total review flags |

**Location correction result:** previous B99+B100 research updates are physically integrated into the canonical and physical rows: 693 group IDs / 1,386 individual description cells updated since B98. Of the original 806 blank descriptions, **113 remain blank**. Backfill records show whether the text came from original first-party physical evidence, a secondary directory locality, or an inherited label. In particular, a city-level name does **not** become an approved geocode or navigable address.

**Classification maturity:** 200 institutional source URLs have been structured, **but only five were opened for direct verification** during CL1. Three source-level original parish/shrine notices support the *1962 Missal* (Prandtauerkirche, Santa Croce Cagliari, Kerzenkapelle). They do not imply 1962 for every celebrant, nor an `Una Cum` assertion at the church. **Una Cum assessed as a celebration/ministry property: 0 newly established**. Do not infer canonical status or lay organization from affiliation.

## GitHub snapshot structure

- `manifest.json`: evidence digests, frozen schema/column headers, all expected counts, integrity checksums and full partition inventory.
- `site-*.json`: complete updated canonical and physical rows, effective physical anchor, research release status and site-description provenance.
- `venue-*.json`: complete unchanged 37-column source row plus exact-ID-linked full 27-column CL1 classification row where present; the 5 conflicting group links remain held.
- `mass-*.json`: complete unchanged 28-column historical timetable rows, including original order/IDs.
- `classification_orphan-*.json`: 36 B92-only source records, still unadmitted to the canonical site table.
- `identity_issue-*.json`: 44 historical ID population differences plus five source/group conflicts.

All parts have SHA-256 hashes in `manifest.json`. The complete joined dataset can be queried from a standalone SQLite database generated without original B98/B100/CL1 attachments:

```bash
python3 tools/directory/rebuild-cl2-research-snapshot.py \
  --snapshot-dir data/directory/research/cl2-unified-20261026 \
  --output /tmp/ad-orientem-cl2-research.sqlite
```

Every source part, row count, frozen group/source ID uniqueness, Mass VERIFIED label count, Una Cum source UNKNOWN status and classification counts are verified before database creation. A tampered source part is rejected. The SQLite file includes `canonical_site`, `venue_source`, `classification_source`, `mass_time`, `existing_alias`, `identity_exception`, and a `venue_with_classification` query view.

## Release boundaries

1. **Do not load any of these research JSON parts into `src/find/data-service.js` or mark public Place IDs.** The runtime publication filter and first-party release approvals are separate.
2. No automatically created ministry or celebration assignments from church-level classifications. Rites, books, Una Cum, canonical recognition, owner, lay organizer, and current celebrant are separate, source-scoped records.
3. The *five conflicting group assignments* cannot be auto-rewritten; all 36 classification-only source rows and all eight location-only rows must remain queryable until reconciled.
4. No new Mass timetable is certified or transferred from research to the app by this import. Historic 3,347 VERIFIED states do not prove 3,347 schedules are current on 26 October 2026.
5. These snapshots represent the **B98/B100 + CL1 exact source data**, not an exhaustively complete worldwide directory, and not the application's currently published map count.

## Relation to parallel branches

Source branches: site pipeline B98 #1721 → B99 #1722 → B100 #1725. Classification contract B92 [#1724](https://github.com/Fulcanelli13/ad-orientem/pull/1724). CL2 consumes both datasets, without claiming those independent branches or live application updates have merged. Preserve those branches' respective evidence claims and IDs.