# Shrines & Pilgrimages — Source of Truth v1

This layer gives Explore a canonical way to represent sacred destinations and pilgrimages without turning the Directory, Calendar or Customs Atlas into competing databases.

## Core relationship

`Place -> Shrine -> Pilgrimage -> Route / Temporal Link`

The shared Geography SOT owns physical map identity and address.

The Shrine record owns devotional/historical identity.

The Pilgrimage record owns the journey or destination-pilgrimage identity.

The Route record owns source-backed route structure.

The Temporal Link records only a semantic relationship to Calendar.

## Initial anchors

The first locked places are:

- Sanctuaire Notre-Dame de Lourdes;
- Sanctuaire Notre-Dame de Laghet;
- Sanctuaire du Sacré-Cœur de Paray-le-Monial.

These were selected because the existing Customs Atlas already contains direct source-backed place claims for Lourdes, Laghet and Paray, and official shrine sources provide clean current identities.

## Customs integration

Two former `PLACE_PENDING` attestations are promoted:

- Laghet ex-votos -> canonical Laghet Place;
- Lourdes votive candles -> canonical Lourdes Place.

Paray receives two additional place-level attestations for family consecration and intronisation of the Sacred Heart image. The broader French-world attestations remain in place; the exact Paray records are additional evidence, not replacements.

## Pilgrimages

v1 distinguishes four identities:

1. general pilgrimage to Lourdes;
2. general pilgrimage to Notre-Dame de Laghet;
3. annual Paillon Pays de Nice deanery pilgrimage to Laghet;
4. Sacred Heart pilgrimage at Paray-le-Monial.

The Laghet deanery walking route and the Paray four-stage pilgrim path are both `DOCUMENTED_UNMAPPED`. Their sources establish the routes, but v1 does not invent map geometry.

## Calendar ownership

This SOT does not contain recurring dates.

It contains Calendar-owned semantic bindings:

- `feast.our_lady_of_lourdes`;
- `liturgical.pentecost_monday`;
- `feast.sacred_heart`.

The source evidence proves the relationship. Calendar now resolves all three keys through `calendar-semantic-registry-v1`, and the Shrine records are `BOUND_TO_CALENDAR`. The Shrine corpus still stores no recurring date arithmetic.

Date/month/day, Easter offsets, RRULEs and private recurrence logic are explicitly rejected by the validator.

## Map coordinates

The shared Geography SOT now carries provenance-locked point coordinates for Lourdes, Laghet and Paray.

- **Laghet** uses the shrine's own published GPS coordinate.
- **Paray-le-Monial** uses the official sanctuary pilgrim-path coordinate as a `complex_anchor`, rather than pretending it is an exact boundary or entrance.
- **Lourdes** uses an explicitly attributed OpenStreetMap shrine node because the official shrine material supplies the canonical address but not a GPS point.

These coordinates belong to the canonical Place, not to the Shrine, Custom or Pilgrimage records. Explore may therefore reuse one point across those lenses without creating new identity or association claims.

Route geometry remains independent and unpublished unless separately sourced.

## Directory separation

A shrine Place may later also contain or sit near a TLM Directory venue. That physical relationship must not imply:

- that an institute operates the shrine;
- that the shrine offers the traditional Mass;
- that a nearby traditional community observes the shrine custom;
- that a pilgrimage belongs to a community.

Any such association requires its own evidence-backed bridge.

## Explore projection

The Explore projection consumes these canonical Place coordinates across the Shrines, Traditions and Pilgrimages lenses. The same point may be reused for records referring to the same Place, but this never establishes an association with a nearby Directory/TLM venue.

The next research expansion can therefore add more shrine/pilgrimage places incrementally without changing the map architecture.
