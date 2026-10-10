# R52 — Rome-recognised named worship site acquisition

Date: 2026-10-10. Published layer remains a provisional **traditional Mass venue** directory, not a world parish census or a verified *una cum* registry.

## Acquisition results
- [GitHub Actions R52](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38067321839) attempted **66** named worship source records through **129** country-restricted Nominatim requests; **3** precise named-place coordinate candidates, **63** held, **0** errors, no rate limit.
- All 3 candidate sources identify distinct churches, have matched postcodes/locality in the geocoder display, and were checked for coordinate collision against 1,876 existing pins:
  - FSSP **Pfarrkirche Hl. Martin**, Wolfern, Austria — OSM way 30573106; 48.0835543, 14.3779958
  - FSSP **All Saints Church**, Kempston, England — OSM way 133068853; 52.1208937, -0.5185483
  - FSSP **Our Lady of Ransom**, Kempston, England — OSM way 120924012; 52.1181962, -0.4966465
- **6** additional source claims matched physical locations already on the map (Basilica Santi Celso e Giuliano, San Simon Piccolo, Nuestra Señora del Pilar, Regina Caeli, Resurrection of Our Lord / Corpus Christi Chapel, Corpus Christi Shrine Covent Garden), without creating duplicate pins.
- Add 3 exact OpenStreetMap feature hyperlinks and 3 other venue-specific source hyperlinks; links preserve original sources and OSM attribution.

## Cumulative operational figures
- Previously 1,876 provisional world pins (1,019 Rome-recognised, 732 SSPX and 125 unknown).
- **1,879 provisional world pins**, including **1,022 source-reported Rome-recognised**; 732 SSPX and 125 unknown unchanged.
- R51 priority source records already linked: 1,156/1,537. Additional R52 6 aliases + 3 new pins = **1,165/1,537 (75.8%)**. This is a *source-record link count*, **not** a distinct-parish count.
- The **63** held named-worship entries are preserved in the R52 Action artifact for a later source-specific discovery campaign. Do not add locality centroids or institutional houses.

## Publication and quality safeguards
The "Rome-recognised" group is a sourced community label, not proof that the Pope was named in a particular Canon; use separate layers for SSPX and groups with unknown affiliation. No new Mass-time assertions, directions to approximate coordinates, diocesan juridical claims, or Mass reader changes. The app continues to show the primary source and source/map uncertainty, with © OpenStreetMap contributors and ODbL attribution.

GitHub source of truth: `data/directory/preliminary-map-r49.v1.json` retains its existing filename for compatibility; its content revision is `r52-20261010`. Tests enforce the new counts and the three exact site references.
