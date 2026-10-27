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

## CL2 unified master v2 — physical venues, ministries, timetables and shared institutional norms (27 October)

**This is the same SQLite canonical research master, not a separate directory.**
The existing checksum-verified 25-part source snapshot continues to be the single input to `rebuild-cl2-research-snapshot.py`. It now reconstructs both the original lossless tables and these in the **same database**:

| Table or view | Role |
|---|---|
| `unified_physical_site` | **2,579** actual provisional physical anchors, with all 2,584 historical IDs represented via original aliases; no duplicated venue per institute |
| `venue_source`, `source_ministry` | The 2,687 original source-venue rows plus 36 separate classification-only assertions; 2,723 source-ministry rows, including eight unclassified source records held |
| `institute_norm` | **One authoritative pair of defaults per institute**, currently FSSP, ICKSP, IBP, SSPX (Roman usage and 1962 Missal), each with its own original institutional evidence URL |
| `timetable_ministry_link` | All **4,681** original historical Mass rows, with physical-site and source-ministry links only when exact identity is safe, otherwise an explicit hold |
| `effective_source_liturgy` | Directly resolves all eligible source institute labels to an inherited norm, never labels the actual church as wholly belonging to that institute |
| `effective_mass_liturgy` | Group → source ministry → Mass time *inherited norm*, separately marked **not yet independently verified as that celebration** |
| `classification_exception` | Dated, HTTPS-evidenced explicit **ministry-level override** before **celebration-level override**, leaving source-wide group policy unchanged |

### First category-wide application

The official institute-wide default **Roman / 1962** is defined in a single file, `institution-norms.v1.json` (not one row per church).

| Institute | Source-labelled records inheriting the group rule |
|---|---:|
| FSSP | 381 |
| ICKSP | 158 |
| IBP | 31 |
| SSPX | 819 |
| **Total** | **1,389** |

These are **1,389 source-classification assertions, not 1,389 public churches or confirmed Masses**. Some are classification-only records without confirmed physical anchors. Only exact source/group joins may be treated as linked; the five group contradictions, 36 classification-only records and eight unclassified venue sources are retained. All unknown/unverified affiliations (diocesan unspecified, other institutes, shared sites, etc.) remain UNKNOWN until an approved institute norm or explicit local source exists. Institute norms may also be updated centrally without rewriting any site.

**Scopes matter:** the fact that FSSP generally uses the 1962 Missal can propagate to a *source-linked FSSP ministry*. It cannot classify every Mass in a diocesan church hosting the Fraternity. Nor is it proof of a current timetable, a personally named celebrant, canonical standing or a specific *una cum* mention. Such data occupy separate sourced scopes. The first four standard norms have citations from the official institutions and a 2022 decree; the exception table resolves individual source/ministry or Mass-specific documented departures above the institute norm.

Run and verify (Python standard library, **€0**):

```bash
python3 tools/directory/rebuild-cl2-research-snapshot.py \
  --snapshot-dir data/directory/research/cl2-unified-20261026 \
  --output /tmp/ad-orientem-unified-master.sqlite

python3 tools/directory/validate-cl2-unified-master-inheritance.py \
  --db /tmp/ad-orientem-unified-master.sqlite
```

The import remains **research-only** until exact site, ministry and current timetable release gates pass. The official rules, frozen original records, aliases and all held exceptions are kept together in this one master. Nothing in this extension modifies `src/find` or the public 1,882-pin provisional snapshot.


## Master-first worldwide venue census — revised editorial order (27 October 2026)

The work order is now **binding for this registry**:

1. **Build the ultimate list first.** Source-led worldwide physical-worship-site discovery, all traditional communities and local networks, full country coverage and exhaustive cross-provider deduplication. The end product is ONE CL2 master with admitted physical anchors, source memberships and clearly identified unresolved *candidate* identities. No apparent venue is discarded merely for lacking precise coordinates or a current Mass timetable. Document supplier/institution coverage and the date each list was exhausted; no invented "100% worldwide" conclusion.
2. **Enrich the complete master in large batches.** Extract available *name, country, locality, source/owner, institute/community, relationship, and applicable rite/Missal norm* across hundreds of sites at once. Reuse the existing eight first-party institutional norm assertions for the four named institutes and extend centrally when new group norms are sourced. Carry sources and scopes through the entire family; do **not** manually research the same rule at every church.
3. **Only then work the remaining exceptions.** Incomplete source identities, ambiguous shared buildings, conflicting labels, unsupported classifications, local departures and provenance follow-up get targeted review queues. Manual site-by-site work belongs here.
4. **Defer** precise pins/geocoding, navigation, regularly verified timetables and public release until the worldwide list is sufficiently consolidated and bulk fields have been filled. Existing historical time and geometry data are preserved as-is, not discarded; no new research effort on those tracks should displace Stage 1.

### Existing data the ultimate census must not overlook

The earlier merged research intake `data/directory/research/canonical-g0-site-admissions-b84-b90-20261026.v1.json` contains **36 G0 candidate site IDs** from B84–B90. None of those exact IDs occurs among the CL2 2,584 historical canonical site IDs. This does **not** prove 36 distinct missing churches. A country+normalized-name comparison produced **four same-name hints**, some in different cities; there are **two** explicit existing-provider links: `AASJMV-EXT-001` and `VG19-PL-LODZ-ALL-SAINTS`. A name collision or provider link alone is not an identity approval.

The CL2 SQLite builder therefore now imports all **36 leads as `unified_site_candidate`**, with frozen candidate IDs, country, locality, physical-description evidence, batch and exact original source URLs; it never promotes them into `unified_physical_site` automatically. The new **`unified_research_inventory`** view exposes 2,579 provisional accepted physical anchors **plus 36 unresolved lead records = 2,615 differently scoped inventory entries**, not 2,615 unique real churches. Every entry is in the SAME queryable CL2 research database. The 36 separate CL1/classification-only source orphans and the 49 existing identity-review flags remain preserved; they cannot be naively added to the physical total because identities may overlap.

**Next completeness gates:** systematically crosswalk all already researched organization and regional directories against this one inventory; classify each *candidate identity*, not each Mass: exact existing building / strong possible alias / new physical building supported / out-of-scope or closed / unresolved. Bring confirmed new buildings into the canonical physical table with stable lineage only when identity evidence is adequate. Track source-coverage totals and missing-region/institute queues at the *provider catalogue level*, then enrich all accepted sites in 100–200-record or larger cohorts. No independent B90/B98/CL27 directory becomes a second authority.


### Source-census consolidation, not pin enrichment (27 October 2026)

The same CL2 SQLite now reconstructs a **worldwide candidate and provider source index** from already committed repository files. These are materialized tables and a view inside CL2, **not a second register or another list to maintain manually**.

| CL2 research population | Records | Meaning |
|---|---:|---|
| `unified_physical_site` | **2,579** | Provisional physical anchors already consolidated |
| `unified_provider_coverage` | **554** | Six committed provider-feed source corpora: FSSP 286, ICKSP 94, AASJMV 6, verified-global round 19 6, official French SSPX feed 89, diocesan feed 73 |
| Exact existing CL2 source-ID links within provider feeds | **322** | Existing source identities, **not** separately certified buildings |
| Prior G0 provider crosslink | **1** | Retain existing research lead rather than duplicate |
| Additional unmatched *worship-type* provider leads | **159** | Source candidates; no physical identity or current schedule certification |
| Other unmatched provider records | **72** | Residences, missions or ambiguous/non-worship facilities; **not** added as Mass sites |
| Third-party worldwide directory source leads | **1,531** | Historical directory *listings*, not evidence of 1,531 churches offering current 1962 Mass |
| Third-party exact existing CL2 source-ID links | **87** | No duplicate site promotion |
| Unmatched third-party leads | **1,444** | Source identities held until a building-level deduplication verdict |
| Original B84–B90 G0 leads | **36** | Already staged from source master |
| **Unresolved candidate lead entries in CL2** | **1,639** | 36 G0 + 159 provider + 1,444 third-party, potentially overlapping physical places |
| **Combined CL2 inventory entries** | **4,218** | 2,579 physical anchors + 1,639 lead identities; **NOT** 4,218 distinct churches |

All **1,531** worldwide crosswalk source entries were carried forward, including **1,303** marked unmatched by the earlier *name-only* screen, **148** single name-only candidates and **80** ambiguous name candidates. **No name similarity is an approved same-building match.** Source properties, original URL references, candidate IDs, provenance and previous cautious dispositions remain queryable. Only **87** have an exact original CL2 source-ID relationship; *absence of an exact ID is not proof of a missing church*.

The third-party country census has **65** country listings, **54** successfully traversed for their recorded snapshot and **11 incomplete** (GB, IE, JP, TW, BY, KR, RU, UA, HK, IN, IL). An exhausted third-party directory listing is **not** evidence that Ad Orientem has comprehensively covered all Catholic institutions or sites in a country. Continue first-party institute, national association and diocesan source discovery after these known corpora are reconciled.

For throughput, `unified_identity_review_cohort` groups all **1,639** unresolved identity leads into **nine large batches**: eight cohorts of 200 records plus one of 39, ordered by source type and original supporting links. Their initial status is `UNRESOLVED_CANDIDATE_IDENTITY`; **zero** are automatically promoted as independently distinct physical sites, and no precise pin, current Mass time or public map entry is generated. Relevant named site and affiliation records can be enriched *after* the ultimate physical venue census is deduplicated.

Rebuild `rebuild-cl2-research-snapshot.py`, then inspect:

```sql
SELECT source_family,entries,exact_CL2_ids,prior_g0_links,
       new_unresolved_worship_leads,non_worship_or_ambiguous
FROM unified_provider_census_by_family ORDER BY source_family;

SELECT cohort_no,COUNT(*) AS unresolved_leads
FROM unified_identity_review_cohort
GROUP BY cohort_no ORDER BY cohort_no;

SELECT country,listed_source_count,discovered_source_count,source_listing_complete
FROM unified_directory_country_census
WHERE source_listing_complete=0 ORDER BY country;
```

**Next census gate:** extend the same provider/source coverage register to any other previously researched feeds, then resolve candidates by stable source IDs, source ownership and physical-building evidence *in bulk*; avoid blind name matches and do not equate the sum of unresolved leads with newly found churches. Completing exact worldwide site coverage remains an **open** milestone.


### Eighteen further institute/provider source feeds (27 October 2026)

The CL2 reconstructor now additionally ingests **18 previously committed institute and community source feeds with 791 venue/source records**, without altering physical IDs, classifications, current timetables, or public pins. The feeds include multiple SSPX regional/district snapshots plus CMRI, CSPV, RCI, Una Voce Czech, IBP and ICKSP legacy venue files. These are source-record identities, **not** 791 distinct worship buildings.

The independently passing GitHub rebuild and inheritance validation reported the following:

| Additional provider feed result | Source records |
|---|---:|
| Exact frozen CL2 venue-source ID found | 38 |
| Same frozen ID as an earlier unresolved lead | 0 |
| Unmatched worship/mission/church source lead staged | 669 |
| Ambiguous, temporary, residential, or other non-worship facility held | 84 |
| **Total screened** | **791** |

**Cumulative provider feeds**: 554 + 791 = **1,345** original source entries. **Cumulative unresolved source-lead identities**: 36 prior G0, 159 earlier provider, 669 additional provider, 1,444 third-party = **2,308 candidate records**; these may refer to the same physical locations under separate provider and third-party IDs. Thus the working `unified_research_inventory` contains 2,579 physical anchors + 2,308 unresolved identities = **4,887 differently scoped entries, emphatically not 4,887 confirmed venues**. There are **12 large review cohorts**: 11 × 200 and one of 108. Physical admissions remain **zero** from these intakes.

The latest follow-on CL2 pass also stages a **non-authoritative same-building review hint table**. It compares normalized original source addresses and names against the existing venue source/anchor registry and compares equal reported addresses among candidates. Matching strings are *review pointers only* and explicitly cannot merge physical sites or publish a map pin. Same-country name matches without corroborated address are particularly weak; neither type is a substitute for canonical building evidence. All historical source records are preserved.

This completes **a substantial existing-repository provider source import**, not the ultimate worldwide site list. Immediate next stages are (1) source-feed coverage and identity reconciliation across countries and institutes, including the 11 incompletely fetched third-party country listings, (2) evidential deduplication and acceptance of real missing physical sites in bulk, and (3) grouped category/detail enrichment. Geometry/timetables remain deferred.


#### First entire-corpus candidate identity screening — CI passed

The deterministic candidate-to-CL2 comparison now screens **all 2,308 pending source-lead identities** against the admitted-source evidence. Results: **150 unique leads have at least one exact-normalized reported address candidate** (158 source-level possible links), **471 more have only same-name-and-country candidate evidence** (697 possible source-level links), and **1,687 have neither signal**. These groups partition all 2,308 candidate identities. No pairs of pending leads had identical normalized reported addresses under the strict key in this pass. Most third-party leads omit a structured address, so a missing match does not prove the listing is a new church.

All 855 source-level possible links (158 address and 697 name-only) are **identity-review hints** in the CL2 SQLite, not accepted duplicates. Address-equal records can name distinct worship spaces within one complex, and same names across a country are routinely ambiguous. CI verifies zero automatic physical site merge, zero approved publication, same-country joins, untouched existing physical IDs, and intact institute/source inheritance. The pass ran successfully in GitHub Actions run 40464729247 (27 October 2026).

The next high-volume **master completeness** task is to resolve these leads by original first-party place evidence and reconcile remaining official/association source lists before claiming a definitive country or institute census. Precise coordinates and recurring schedules remain deferred.
