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
