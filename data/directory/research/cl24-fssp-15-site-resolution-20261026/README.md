# CL24 — systematic resolution of 15 CL23 German FSSP spatial exceptions

**26 October 2026. Research only.** Stacked immediately above CL23 #1770. The 39 frozen owner-defined sites, 74 historical FSSP Mass patterns, 256/176 1962 wording-evidence grades, existing canonical master and all current public data remain unchanged.

## Results of the 15-item exception queue

- **8 new research-only worship-building georeferences**, each named specifically, with geospatial source and independent identity reference. Five use distinct OSM *named worship-building ways* (some tagged `building=yes`, not `building=church`); the other three use church-specific cultural/historical coordinate evidence. None is a surveyed door.
- **7 unresolved exact worship-building/chapel points**, each with a documentary reason and target search. An identity/address citation without a reliable named building coordinate does **not** count as georeferenced.
- **31/39** overall research-supported geographic building/chapel references (23 inherited CL20–23 + 8 here); **1 separately held CL20 spatial conflict**, **7 without supported research point**. Thus 32/39 have a source candidate *if* the conflicting one is counted, but 31/39 are supported.
- **0** new public map pins, verified visitor-door coordinates, published future dates, or Una Cum changes.

| CL14 source ID | Named worship place | Research result |
|---|---|---|
| 006 | St Josef, Remscheid | KuLaDig Catholic church WGS84 at 51.17199/7.20953; not office 5b or nursery 5c |
| 007 | St Joseph, Recklinghausen-Grullbad | Published church location 51.57955556/7.20147222, **operational status requiring direct verification**; weekday FSSP moved to St Gertrudis |
| 008 | St Joseph, Oberhausen-Styrum | OSM way 29047159, Catholic church building not another city St Josef |
| 009 | St Michael, Recklinghausen-Hochlarmark | Published church point 51.56191667/7.18641667; office/Care home not church |
| 011 | Annakapelle, Leverkusen-Lützenkirchen | OSM chapel building way 94701638; not St Maurinus or Kreuzkapelle |
| 014 | St Martinus, Nörvenich-Pingsheim | OSM Catholic church way 42740032; operator #5 vs map #7, not another St Martinus |
| 018 | St Leonhard, Nußdorf am Inn | OSM named church way 171690178; not St Vitus or parish address |
| 023 | Grafing Marktkirche Heilige Dreifaltigkeit | OSM Catholic church way 69721248; original FSSP Dreifaltigkeitsgasse 3 vs OSM Marktplatz 10 |
| 025 | Landsberg Ignatiuskapelle | **HELD:** mapped host church Heilig Kreuz is *not* upstairs actual liturgical room |
| 028 | Nürnberg St Georg | **HELD:** church Bierweg 35 vs office Bierweg 33, no independently sourced named footprint |
| 034 | Bonn St Michael | **HELD:** operator Rheinbacher Str 10 vs FSSP international 13 / city 1; no church-specific approved geometry |
| 035 | Augsburg St Margareth | **HELD:** historical church at Spitalgasse 1 identified, exact mapped object not independently sourced |
| 036 | Deining Haus St Stola | **HELD:** house chapel requires privacy/access confirmation before any pin |
| 037 | Garmisch Sebastianskapelle | **HELD:** FSSP local Münchner Str 1 vs international Ludwigstr 81; exact footprint pending |
| 038 | Blaibach St Elisabeth | **HELD:** church Kirchplatz 12 vs rectory Benefiziatengasse 9, no admitted geometry |

### Correction — unresolved Recklinghausen operational claim

The local FSSP [Mass-times page](https://petrusbruderschaft.de/pages/wo-wir-sind/deutschland/niederlassungen/recklinghausen/messzeitentermine.php) **still lists St Joseph** for recurring Thursday, first Friday, subsequent Saturday and feast Masses. The [local parish office listing](https://stantonius.katholisch-re.de/seelsorge-kontakte/pfarrbuero) says **the St Joseph parish office** is currently closed, **not that the church is closed**. Earlier CL24 language claiming structural closure and an FSSP weekday relocation to St Gertrudis was **not corroborated by the cited FSSP page**, so that claim is withdrawn and logged as a source conflict. Neither closure nor specific future-date Mass events are approved.

St Gertrudis is a distinct legitimate Catholic church; it must not be attached to St Joseph historical slots without direct positive dated FSSP evidence. The database stores a research-only caution and no alternative venue admission.

### Source and output contracts

See `evidence.json` for exact eight source geometries, seven explicit blockers, permanent source URLs and the closure warning. See `publication-standard.md` for three distinct object concepts and a default-deny, independently approved eventual building-level publication gate. These records are expressly **not** release authorizations.

After the existing CL2–23 reconstruction (the CI workflow does that automatically), run:

```sh
python3 tools/directory/reconcile-cl24-site-exceptions.py \
  --db /tmp/ao-cl24.sqlite \
  --out-dir /tmp/ao-cl24
```

Emits `cl24_8_new_building_references.csv`, `cl24_7_spatial_holds.csv`, `cl24_full_39_site_readiness.csv`, and `cl24_summary.json` with SQLite CHECK-constrained new research-only tables and invariant assertions. This never writes to the canonical master or Mass schedule.

**Next action:** independently review the seven remaining physical points, with exact host-room requirements for Landsberg and Deining, and separately build dated operational exception/future Mass verification. No automatic public map publication is allowed.
