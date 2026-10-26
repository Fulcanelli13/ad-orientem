# CL22 — correct Potsdam historic Mass-chapel building, not the adjacent quiet chapel

**26 October 2026. Research-only continuation stacked above CL21 PR #1767.**

CL21 established that the Alexianer hospital's `Raum der Stille / Auferstehungskapelle` is **not** its historical St Josefs chapel where the Sunday 17:00 Tridentine Mass is offered, but had no uniquely identified map geometry for the correct Catholic Mass chapel. CL22 resolves that **building-level** distinction with a source-named OpenStreetMap reference.

## Potsdam: one correct Mass chapel, one other chapel to exclude

| Object | ID and source | Research coordinate | Assessment |
|---|---|---|---|
| **Historic St. Josefskapelle — correct Mass venue** | OSM **way 301020129** ([named chapel feature](https://mapcarta.com/W301020129)) | **52.39966, 13.04481** | **Source-named Roman Catholic chapel building** accepted as non-public geographic research reference |
| **Raum der Stille / Auferstehungskapelle — different chapel** | OSM **way 31290074** ([separate quiet chapel](https://mapcarta.com/de/W31290074)) | 52.39953, 13.04499 | **Excluded as Mass venue**, cannot substitute for St Josefs |
| Campus hospital building | Other OSM and health-care ways | Variable | Neither a worship-room entrance nor the correct church map point |

These two specifically named chapel geometry references are approximately **18.9 metres apart**; an automated nearest-chapel or hospital-address lookup could readily select the **wrong** room. The [hospital's own St Josefs chapel page](https://www.alexianer-potsdam.de/st-josefs-kapelle) confirms its 1877 historic double-leaf entrance and **Sunday 17:00 Tridentine Mass**, and the [hospital chaplaincy description](https://www.alexianer-potsdam.de/st-josefs-krankenhaus/unternehmen/seelsorge) distinguishes the other `Auferstehungskapelle` nearby.

The hospital's [campus directions](https://www.alexianer-potsdam.de/orientierung) confirm **Zimmerstraße 6** for vehicle campus entry and **Allee nach Sanssouci 7** as the actual chapel/hospital address with drop-off-only vehicle access. These remain **two access records for one St Josefs worship place**, not duplicated church identities.

**Limitation:** The OSM chapel-way reference is a footprint/building-centre point, **not a GPS survey of the gilt-lettered double-leaf doorway or proof of which door is open for the next Sunday Mass**. Do not publish door-level directions from it.

## Amberg St Augustinus: portal vicinity, not a door point

[Dehio's architectural inventory](https://de.dehio.org/ausstattungsobjekt/amberg-sog-deutsche-schulkirche-st-augustinus-kanzel) locates its ornate historical main portal on the **southwest façade**.

A photographer's [19 February 2024 Schulkirche historic marker survey](https://www.hmdb.org/m.asp?m=242442) includes photographs of the main door and the **nearby southwest-corner marker**, geolocated near the intersection of Deutsche Schulgasse and Löwenwirtsgäßchen at approximately **49.44548333, 11.85493333**. That is approximately **21.3 metres** from the existing CL20 mapped Schulkirche building reference (49.44562, 11.85514). The point is **the marker vicinity, not the doorway**.

We therefore now have a visual/architectural cue for where a human verifier should inspect the door, but not a justified GPS point suitable for app navigation. This prevents falsely upgrading a photographed marker into a surveyed entrance.

## Source and release states

CL22 adds a permanent owner/OSM/photo provenance manifest and two additive research tables: `cl22_building_vs_door_research` (two sites) and `cl22_spatial_lookalike_veto` (Potsdam false chapel). Both preserve original source-place group IDs from CL17 and the CL20/CL21 exclusion of way 31290074.

The supplied standard-library Python script computes great-circle separations and validates that:
- the correct Potsdam Catholic chapel way is **301020129**, distinct from excluded **31290074**;
- the Amberg marker reference is a **vicinity clue**, not a validated door coordinate;
- the previous CL21 seven entrance assessments and five wrong-object vetoes stay unchanged;
- all door-GPS, public-map, current-recurrence and Una Cum approvals remain **zero**.

To reproduce, rebuild the CL2–CL21 SQLite using the documented preceding workflows, then:

```sh
python3 tools/directory/reconcile-cl22-correct-chapel.py \
  --db /tmp/ao-cl22.sqlite --out-dir /tmp/ao-cl22
```

Exports: `cl22_two_site_building_vs_entrance_evidence.csv` and `cl22_summary.json`. The source JSON and code are retained in GitHub permanently; temporary Actions archives are free and regenerable.

### What remains

The **39** owner-named site pilot and **74** conditional Mass rules are unchanged. The overall 432-row wording cohort remains **256 source-backed book claims / 176 held**. There are still **zero independently verified actual church-door coordinates and zero public map/schedule releases**. The next physical gate is to identify exact doorway geometry on the source-named Potsdam chapel footprint and the southwest Amberg portal, and obtain evidence that each door is usable for the intended Mass. This may require operator plans or site photographs with reliable geographic geometry; do not invent a doorway coordinate by offsetting a building centre.
