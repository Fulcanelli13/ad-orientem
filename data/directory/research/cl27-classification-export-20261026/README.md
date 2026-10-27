# CL27 — Ad Orientem worldwide TLM classification integration

**2026-10-26 | Attached to the CL2→CL27 existing registry / PR #1775. No parallel site master.**

This consolidates the user's **independent classification axes** into the existing Directory. CL2 already includes the full 2,715 source-classification rows in checksum-pinned partitions, and 2,579 physical anchor IDs. Source data are permanent in GitHub; no expiring Actions artifacts or paid dependencies are required.

## Current exact-scope classified population

| Scope | Count | What it does and does not mean |
|---|---:|---|
| Classification source records | 2,715 | Historical sources, **not** 2,715 independently attested priests |
| Safe source-ID and group-ID joins | 2,674 | Linked to an exact CL2 historical site and its physical anchor |
| Conflicting source-group links | 5 | Explicitly held; never silently reassign a parish or chapel |
| Classification-only source entries | 36 | Not admitted as new physical sites without identity checks |
| Venue sources lacking classification | 8 | UNKNOWN, not inferred |
| Physical anchors to classify | 2,579 | Every accepted research physical location, independent of 1,879 original R49 public pins |
| Source-labelled recognized organizations | 2,008 | Searchable as **source labels**, not as an independently confirmed celebrant |
| Direct exact-owner 1962 book witnesses | 3 | Source/celebration scope only, not blanket 1962 for an entire building |
| Venue-level inferred Una Cum values | 0 | Intentionally no classification by affiliation |
| Newly public-certified doctrine, times, sites | 0 | This branch does not publish research as fact |

### Institutional source-labelled families, with evidence status preserved

SSPX (source label), FSSP, ICKSP, IBP, CMRI, AASJMV, diocesan-unspecified; additional FSVF, SSPV/CSPV, Benedictine, Oratorian, Dominican, Premonstratensian, religious community and independent clergy classifications remain available in the taxonomy but unfilled where CL2 evidence is insufficient. Distinguish a source's abbreviation from the institute **serving the Mass** and from the owner of the building.

### Liturgical edge cases remain distinct

Roman 1962 Missal / 1960 rubrical code; pre-1955 and the 1955 reforms; transitional 1965; 1970/2002 Ordinary Form even where Latin is used; Lyonese; Dominican; Carmelite; Premonstratensian; Cistercian; traditional Ambrosian (including the 1954 books); Mozarabic; and Eastern Catholic liturgies. These are **different usage classifications**, not interchangeable TLM venues. Such extended research labels do not silently become validated B92 runtime enums.

### Ecclesial and ministry distinctions

- Record sourced community, actual celebrating ministry/priest, lay or institutional organizer, and venue owner **separately**.
- `una_cum` belongs to **specific ministry/celebration**; YES/NO/VARIES/DISPUTED/UNKNOWN cannot be inferred from SSPX, diocesan, FSSP, CMRI or any other label.
- Roman Pontiff recognition, sedevacantism, sedeprivationism and dated canonical standing are independent. Positively evidenced sedevacantist places must be clearly distinguished from ordinary diocesan Mass choices.
- A named institute's web page alone does not certify every Mass's edition. Preserve explicit substitutes, including mixed programme days and the Lyonese distinction.
- For exact worship sites, an administrative office, boarding-school residence, host institution, or property entrance is not automatically the chapel itself.

## Reproducibly build the complete projected classification export

From the CL27 GitHub branch root:

```bash
python3 tools/directory/rebuild-cl2-research-snapshot.py \
  --snapshot-dir data/directory/research/cl2-unified-20261026 \
  --output /tmp/ao-cl27-classification.sqlite

python3 tools/directory/build-cl27-tlm-classifications.py \
  --db /tmp/ao-cl27-classification.sqlite \
  --output /tmp/ao-cl27-classifications.json
```

The export includes *every physical site* and all 2,715 original source classification claims, each with exact group/source IDs, source-reported affiliation, evidence URL where known, and unknown/held fields. The output is derived from GitHub's permanently committed CL2 source shards rather than published as another canonical master. The CI job builds it and tests parity and zero unwarranted releases.

## Map and review integration

The existing map projection now offers more specific **source-reported institute** filter chips (including AASJMV, Canons, Oratorians, Transfiguration, Capuchins and religious communities) without altering the 1,879 R49 pins. No Una Cum, canonical-status or 1962 filter should appear as *confirmed* until the specific celebration has independently supported evidence.

The next evidence workload is to establish actual ministries, exact liturgical editions, dates, and canonical/ecclesial status across these source-identified groups—batch by common first-party URL, preserve original asserted wording and date, and promote only individually evidenced results into the user-facing filters. Do not divert effort into accumulating new classification labels for unexamined sites without physical IDs or links.


## Institute-inheritance integration (27 October 2026)

The **only institutional policy registry** is the upstream CL2 `institute_norm` table. CL27 does not own another institute-rule file: it reads CL2 `effective_source_liturgy`, including evidence links, and projects 1,389 source-linked institutional norms (FSSP 381; ICKSP 158; IBP 31; SSPX 819). This replaces CL27's earlier blanket `liturgical_use=UNKNOWN` projection for those sources only.

CL27 keeps two different statements separate:

- `liturgical_use` and `effective_missal_edition` can be `ROMAN` / `1962` **because of an institute norm inherited by a frozen source-labelled ministry**. The `inherited_institute_policy` field links back to the two first-party rules in CL2 and `liturgical_claim_grade` explicitly identifies source-label inheritance rather than direct Mass verification.
- `missal_edition_at_source_scope` continues to identify the **three distinct direct owner-source witnesses** in original CL2 classification evidence; group policy does not inflate this count.

CL27's offline reviewer shows the distinction and can filter direct witnesses separately from institutional defaults. `institute_norm_inherited_source_ids` at a physical anchor identifies **which source ministries** have inherited defaults, not a building-wide 1962 rite. No new public 1962, Una Cum, current timetable or canonical approval is produced. The CL27 GitHub workflow asserts all four institutional category counts and the scope protections.

**Release dependency:** The 1,879 published preliminary R49 pins are a separate historical projection without a proven one-to-one identity crosswalk to CL2's 2,579 physical anchors. Do not match them by name or affiliation and copy the inherited field onto pins. First land the upstream physical-master PR chain, review source-to-pin identity joins, and use CL2 effective scoped views in the existing Find UI. Merge CL27 only after that contract is verified.


## Exact R49→CL2 physical identity integration (27 October, latest validated pass)

The public provisional R49 file has **1,879 source-identified pins**. Each R49 pin's *frozen source ID* is also an existing CL2 venue-source ID: **1,879/1,879 exact source-and-group joins**, with **zero fuzzy matches or invented site identities**. They represent **1,844 distinct CL2 physical anchors**. There are **35 duplicate-pin physical-site groups**, eight of which carry different source coordinates and require separate geometry review before a marker is chosen. The other 27 duplicate groups agree on stored coordinates but are not automatically promoted to release-ready map markers.

The full CL2 physical master still contains **735 more distinct sites without an R49 pin**; these remain a separate research-only publication backlog. For the 1,879 matched existing pins, CL2 institute norms cover **1,183 source memberships**: **FSSP 307, ICKSP 128, IBP 19, SSPX 729**. This is not 1,183 approved celebrations, public Missal classifications or distinct venues. The scope is explicitly *source-labelled ministry*. No physical venue automatically gains a rite, Missal, Una Cum or canonical status, and all current schedule claims remain subject to their separate verification gate.

The crosswalk uses no guesswork from names, nearby coordinates, websites or institutional affiliation. It also confirms the exact R49/CL2 *stored source coordinate* agreement for 1,878 pins; the 1 remaining CL2 coordinate pair is absent, not necessarily a bad R49 location. That parity is not independently verified geocoding.

The existing CL27 branch now contains:
- \`tools/directory/build-cl27-r49-unified-crosswalk.py\`: deterministic exact-ID join across **all** R49 pins, sourced CL2 ministries, physical anchors, canonical institute rules, held duplicates and absent-site backlog. The output is a derived research audit, **not a competing registry**.
- \`src/find/cl2-research-crosswalk-adapter.js\`: **nonactivated** read-only adapter capable of representing 1,844 physical-site groupings while preserving all 1,879 original source memberships and their inherited ministerial classifications. No app entry point currently invokes it.
- \`tests/directory-cl27-r49-unified-adapter.mjs\`: rejects altered source identities, altered geometry and attempted publication flags; asserts the eight spatial-conflict groups remain review-only.
- The **same CL27 workflow**, which reconstructs the CL2 SQLite, runs institutional inheritance tests, builds the crosswalk, tests the adapter and checks all publication gates at **€0**.

Run the crosswalk after CL2 SQLite has been reconstructed:

\`\`\`bash
python3 tools/directory/build-cl27-r49-unified-crosswalk.py \
  --db /tmp/ao-tlm-registry.sqlite \
  --output /tmp/ao-r49-cl2-crosswalk.json

node tests/directory-cl27-r49-unified-adapter.mjs \
  /tmp/ao-r49-cl2-crosswalk.json
\`\`\`

**Next runtime gate:** resolve eight conflicting-coordinate duplicate groups; establish explicit physical anchor-to-pin selection and preservation of multiple institute source memberships; review release rules for the 735 unpublished sites; and only then activate the read-only projection in the existing Find UI. Do not indiscriminately mark shared churches as Roman 1962 or merge scheduled Mass records by proximity.
