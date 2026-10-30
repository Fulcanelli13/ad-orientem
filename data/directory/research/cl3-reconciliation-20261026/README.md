# CL3 — Evidence-backed identity crosswalk and first-party physical descriptions

**26 October 2026 | Research-only overlay on CL2 PR #1729.** This does not edit the immutable, SHA-256-pinned CL2 snapshot, original source IDs, historical schedules or runtime publication feeds.

## Changes actually recorded

| CL2 exception measure | Baseline | CL3 disposition | Still held |
|---|---:|---:|---:|
| Identity exception **rows** | 49 | 9 | 40 |
| Historical source/group conflicts | 5 | 5 aliases already declared in CL2 canonical site rows | 0 |
| Classification-only group differences | 36 | 2 exact-building matches | 34 |
| Location-only classification gaps | 8 | 2 filled by these same classification matches | 6 |
| Blank site descriptions | 113 | 23 owner-directory backfills | 90 |

The seven **independent identity decisions** close nine exception rows: five exact-source historical B69 lineage aliases, and two paired classification-only / location-only differences. Do not add 7 or 9 physical sites: these are crosswalk repairs, not newly discovered buildings.

## Two additional exact-building matches

- **Capela do Oratório São José**, Belo Horizonte: `RG-B84-946B8BA59D22` → existing physical anchor `RG-B88-B1EB74BB63BD`. The [chapel owner's site](https://oratoriosaojosebh.org/comunidades-atendidas/) gives Rua Aiuruoca 148, which matches the existing canonical site; the classification-only record retains its own frozen source ID.
- **Santuario di Nostra Signora di Pontelungo**, Albenga: `RG-B89-4FFBC6AB3EC5` → existing anchor `RG-B96-8D5C0E774FAB`. Italy's [national architectural-heritage catalogue](https://catalogo.beniculturali.it/detail/ArchitecturalOrLandscapeHeritage/0700111135) identifies the sanctuary at Viale Pontelungo 89, the exact same building as the B96 location master.

Five B69 historical source/group conflicts are reconciled because the CL2 canonical site record **already lists their original B69 group ID in its own alias field** and the CL1 classification supplies that existing canonical group. Both frozen identifiers remain preserved. The sites are St Martin (Köllerbach), St Christophorus (Niederselters), Marienkapelle/Dreifaltigkeitskirche (Wiesbaden), Beata Vergine del Rosario (Trieste), and St Barbara's Chapel (Zabrze).

## Owner-sourced descriptions

23 previously blank descriptions are now held in `overlay.json` with site group ID, source URL, precision, and source-authority evidence. All 23 use the [FSSP's institutional directory](https://www.fssp.org/en/find-us/where-are-we/) and are **research descriptions, not public pins**. Addresses of houses/seminaries are not automatically public Mass venues. `STREET_ONLY` entries explicitly lack a street number. No coordinate or schedule is inferred.

## Reconstruct and validate

From the repository root:

```sh
python3 tools/directory/rebuild-cl2-research-snapshot.py \
  --snapshot-dir data/directory/research/cl2-unified-20261026 \
  --output /tmp/ad-orientem-cl2-research.sqlite
python3 tools/directory/validate-cl3-reconciliation.py
```

The CL3 validator checks all 25 CL2 shard SHA-256 values against the original manifest; all 49 historical identity exceptions and all 113 original blank site IDs; that each five B69 legacy groups is already in a frozen canonical alias list; that two classification-only source IDs are present and resolve their corresponding two location-only exceptions; exact site IDs for all 23 owner descriptions; and strict zero-public-release policy. It does not mutate the CL2 database.

## Further work

- 40 remaining exception *rows* (34 new-classification-source identity intakes and six missing classifications) require separate evidence-based dispositions. Never promote classification-only records automatically.
- 90 description blanks remain; bulk discovery should favor first-party exact building addresses, with an exception queue for low-precision places and private houses.
- The 200 institutional URLs collected in CL1 are a separate source-review workload; do not equate URL collection with manual verification.
- Live schedule currency, physical geocoding and publication are separate explicit gates. This PR changes **no public Find a Mass data** and adds **zero current VERIFIED timetables**.
