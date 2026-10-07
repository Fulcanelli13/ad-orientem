# Explore Place Profiles v1

Explore now has a canonical Place page above the individual Shrine, Tradition, Novena-context and Pilgrimage records.

The purpose is aggregation without identity collapse.

## Ownership

A Place page is keyed only by the shared Geography `place_id`.

It may aggregate:

- Shrine records whose `place_id` is that exact Place;
- place-level Custom attestations;
- place-level Novena context records;
- Pilgrimage destinations attached to a Shrine at that Place;
- Calendar semantic relations owned by Calendar;
- TLM Directory venues only when a `directoryPlaceLink` explicitly says `LOCATED_AT`.

The Place page does not become the owner of any of those records.

## TLM safety

The Place page has a deliberately strict section: **TLM at this exact Place**.

Only `LOCATED_AT` qualifies.

The following do not qualify automatically:

- same city;
- geographic proximity;
- same postal address without a bridge;
- `COLOCATED_WITH`;
- `SAME_COMPLEX`;
- a Shrine or pilgrimage tradition occurring near a TLM venue.

If no exact link exists, the UI says so and explicitly states that this makes no claim about nearby Masses.

## Calendar

Place pages do not calculate liturgical dates.

They consume the semantic keys already attached to Pilgrimage records and ask Calendar for the next resolved date.

For example, after 7 October 2026:

- Lourdes -> Our Lady of Lourdes -> 11/02/2027;
- Laghet -> Pentecost Monday -> 17/05/2027;
- Paray-le-Monial -> Sacred Heart -> 04/06/2027.

The display remains DD/MM/YYYY.

## Sources

The Place page deduplicates source links from its underlying records and separately retains coordinate provenance from the canonical Place.

This means the page may show one geographic point while still preserving distinct evidence chains for:

- shrine identity;
- custom attestation;
- novena context;
- pilgrimage;
- map coordinate.

## Navigation

Every Place-page row opens the original Explore record in its original lens.

Cross-lens jumps clear stale search text so the selected record cannot be hidden by the search state inherited from another lens.

Individual place-backed records expose a **Place page** action.

## First profiles

The initial profile set is:

- Sanctuaire Notre-Dame de Lourdes;
- Sanctuaire Notre-Dame de Laghet;
- Sanctuaire du Sacré-Cœur de Paray-le-Monial.

The architecture is generic and will automatically support new canonical Places as the corpus expands.
