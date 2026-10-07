# Explore shrine geo + Calendar bindings v1

This convergence closes two deliberate holds from the first Explore release: canonical shrine Places had addresses but no publishable coordinates, and Shrine/Pilgrimage temporal links had semantic keys but no Calendar resolver.

## Shared Place coordinate provenance

Coordinates remain locator assertions rather than identity keys.

A Place point is map-publishable only when it passes the shared provenance gate:

- valid latitude/longitude;
- supported precision;
- supported source class;
- source URL and stable source reference;
- matched country code;
- verification date;
- attribution for OSM-derived coordinates.

Initial anchors:

| Place | Point source | Precision |
| --- | --- | --- |
| Lourdes | OpenStreetMap node 4958231645 | site |
| Notre-Dame de Laghet | shrine-published GPS coordinates | site |
| Paray-le-Monial | official pilgrim-path Stage 1 coordinate | complex_anchor |

The Paray coordinate is intentionally labelled `complex_anchor`; it is a map anchor inside the sanctuary complex, not a claim that the entire sanctuary is a single point.

## Reuse across Explore

One canonical Place point may project into:

- the Shrine lens;
- a place-level Custom attestation;
- a Pilgrimage destination.

That reuse does not merge the records. Their provenance, status and owners stay separate.

Directory/TLM venues do not inherit the point and no community relationship is inferred from proximity.

## Calendar semantics

The Calendar layer now owns three explicit semantic rules:

- `feast.our_lady_of_lourdes` — fixed 11 February;
- `liturgical.pentecost_monday` — Easter + 50;
- `feast.sacred_heart` — Easter + 68.

The resolver lives in `src/calendar/intelligence.js` under `calendar-semantic-registry-v1`.

Shrine/Pilgrimage temporal links contain only:

- the semantic key;
- `BOUND_TO_CALENDAR`;
- the owning Calendar registry version;
- source evidence for the relationship.

They contain no month/day, Easter offset, RRULE or recurrence code.

## Map vs route

Destination points are now publishable.

The Laghet walking route and Paray pilgrim path remain `DOCUMENTED_UNMAPPED`. A destination pin never stands in for route geometry.
