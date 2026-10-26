# CL24 — building-level publication standard (proposal, not release authorization)

**Research policy dated 26 October 2026.** This document describes a future editorial quality gate. It does **not** grant approval for any existing FSSP point, Mass date, route, public church pin, or chapel access. The original frozen German pilot has 39 sites and 74 historical Mass patterns.

## Preserve three distinct spatial objects

1. **Worship object identity**: an attested exact church, chapel, or specifically named room, not an institution, office, adjacent church, monastery, rectory, school, car park, village centre, or generic place name.
2. **Building-level map reference**: a named building footprint point, verified church POI, or directly named site coordinate. The evidence MUST declare geometry type and source ID where available; an OSM node is not an OSM footprint.
3. **Physical worship entrance**: a particular usable visitor door, floor, gate or route. NEVER infer a door from a building polygon centroid, church street number, nearby heritage marker, OSM church node, or postal address. Multi-chapel complexes need distinct room/chapel identity and visitor access.

A stable `source_place_id` from the owner-named evidence is mandatory. For alternate temporary venues, create a **separate provisional place lead** rather than overwriting the original group's physical identity or borrowing a nearby Mass timetable.

## Geography evidence grades

| Grade | Minimum permitted research claim | Not established |
|---|---|---|
| G0 ADDRESS/INSTITUTION | Name or operator mailing address, maybe historical programme | Church coordinates |
| G1 NAMED POI/SITE | Source explicitly maps the named worship place and denomination/city match | Building polygon, doorway |
| G2 NAMED BUILDING WAY | Named and crosschecked mapped footprint of the intended church/chapel | Exterior or interior worship entry |
| G3 ENTRY LOCATION | A documented specific door/route tied to the G1/G2 identity, with independent human or operator corroboration | Mass will occur on a future date |
| G4 OPERATIONAL SITE | G3 or explicitly marked building-only location, plus verified venue operation and accessibility restrictions for a *specific scheduled occurrence* | Other dates or recurring periods |

G1 or G2 is sufficient to **research-map a worship building**, but is not a public navigation guarantee. Exact entrance GPS is not universally required to someday display a *labelled building reference*, provided its own editorial release gate is explicitly approved and every unresolved conflict is disclosed. A building reference must never be styled or exported as an entrance.

## Future public building-pin gate (not automatically activated)

An editor must verify **all** of:
- Church-specific named spatial source, coordinates and feature type, version/date/URL, denomination, town, church title or disambiguating aliases; at least one independent authoritative church/operator source confirming *the same physical worship object*.
- Conflicting street numbers, campus services, shared-site chapels, building use and accessible approach documented in a searchable exception register; any unresolved **object identity** conflict BLOCKS publication.
- Explicit `pin_semantics=BUILDING_REFERENCE_ONLY`, exact source precision, and a distinct `visitor_entrance_verified=false`; map label communicates “church building, entrance not independently verified.” Do not offer door-to-door routing as if point is an entrance.
- No private-house chapel, residential coordinate or access-controlled seminary chapel location publicly exposed without clear operator permission and confirmed worshipper access arrangements.
- Independently recorded positive editorial release action for that specific point and source version. A batch count, automated validator, passing CI, building polygon, authoritative schedule, or neighbour church pin is not approval.

**Operational gate is separate**: publish a future-date Mass only with fresh FSSP/local operator evidence of (a) that exact date and clock time/rule; (b) that exact physical venue; and (c) exceptions for closure, transferred ceremonies, feast days and seasonal changes. Recurrence expansion alone does not pass. A building pin may ultimately exist with zero approved Mass instances; a Mass instance may have a valid venue identity but no approved navigational pin.

## Explicit negative controls

- Munich Catholic Allerheiligenkirche am Kreuz OSM way 48605346 != similarly named Protestant Kreuzkirche.
- Neckarsulm Frauenkirche OSM way 43376158 != nearby St Dionysius.
- Wigratzbad Sühnekirche way 87807590 != seminary chapel node 2789544934 != Gnadenkapelle; ordinary-form operator times are not FSSP times.
- Potsdam Alexianer actual Mass chapel != hospital “Raum der Stille” lookalike.
- Nürnberg church Bierweg 35 != parish office Bierweg 33; Remscheid St Josef != office 5b or nursery 5c; Blaibach Kirchplatz church != Benefiziatengasse rectory.
- Landsberg indoor upstairs Ignatiuskapelle != exterior Heilig Kreuz church polygon. It may be documented as a **host building** but must not be published as the exact liturgical room or entrance.
- Recklinghausen-Grullbad temporarily closed St Joseph != weekday replacement St Gertrudis. *Local FSSP confirms this exception* (https://petrusbruderschaft.de/pages/wo-wir-sind/deutschland/niederlassungen/recklinghausen/aktuelles.php). Do not assume Sunday or feast-day transfer details from the weekday notice, and never convert historic St Joseph rows to validated future occurrences.

## CI and release invariants

New CL24 research references are inserted into independent, additive tables only. All imported `public_pin_approved`, `surveyed_door_approved`, and `future_occurrence_approved` values are zero under SQLite CHECK constraints. Current `canonical_site` and `mass_time` row totals, stable IDs, 1962 evidence grades, Una Cum, and the 74 historical FSSP Mass patterns cannot change.

A future release tool should default-deny if any research-only record is promoted without separately passing the **building editorial / operational-calendar** gates. Record independent source provenance, access decisions, source dates and exceptional closures before publishing anything. No paid location API is needed for this research stage.
