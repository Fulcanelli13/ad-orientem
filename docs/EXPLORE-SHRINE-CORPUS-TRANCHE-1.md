# Explore Shrine Corpus — Tranche 1

This is the first corpus-expansion pass after the shared Geography, Customs, Pilgrimage, Calendar and Place-page architecture was frozen.

## Scope

Five new canonical sacred Places are added:

### France
- Cathédrale Notre-Dame de Chartres
- Sanctuaire de Sainte-Anne-d'Auray

### Ireland
- Knock Shrine
- Lough Derg — Sanctuary of Saint Patrick

### Mauritius
- Centre Père Laval, Sainte-Croix

Together with Lourdes, Laghet and Paray-le-Monial, Explore now has eight canonical sacred Places in the seed corpus.

## Why these five

They represent distinct pilgrimage patterns rather than five copies of the same feature:

- Chartres — long-distance traditional Pentecost walking pilgrimage;
- Sainte-Anne-d'Auray — Breton shrine, pilgrimage cycle and Grand Pardon;
- Knock — international Marian/Eucharistic shrine and apparition anniversary;
- Lough Derg — penitential island pilgrimage with fasting, vigil and a seasonal rather than single-date calendar;
- Père Laval — annual diocesan walking pilgrimage centered on the tomb of Blessed Jacques-Désiré Laval.

## Source policy

Shrine identity is sourced to the shrine, cathedral or diocese.

Pilgrimage route/event claims are sourced to the organization that actually owns those claims.

For Chartres this means:

- cathedral identity/address -> Cathédrale Notre-Dame de Chartres;
- walking route, three-day structure and Pentecost timing -> Notre-Dame de Chrétienté.

A new source class, DIRECT_PILGRIMAGE_ORGANIZER, exists for this reason. It prevents a direct organizer from being mislabeled as a shrine, diocese or generic secondary source.

## Geography state

The five new Places are intentionally address-only at this stage.

They may:
- appear in Explore lists;
- have canonical Place pages;
- support directions/search by canonical address;
- own Shrine, Custom and Pilgrimage relationships.

They may not publish a map point until the shared Place coordinate provenance contract passes.

The three previously locked Places — Lourdes, Laghet and Paray — remain mapped.

## Calendar

Calendar remains the only date resolver.

New semantic keys:

- feast.saint_anne -> 26 July;
- observance.knock_apparition_anniversary -> 21 August;
- feast.blessed_jacques_desire_laval -> 9 September.

Chartres reuses the existing liturgical.pentecost_monday binding.

Lough Derg is deliberately different. Its Three Day Pilgrimage is seasonal and is stored as NO_FIXED_CALENDAR_BINDING. Explore must not reduce that season to one arbitrary date.

## Traditions

The existing DEV-007 regional custom now gains an exact place-level attestation at Sainte-Anne-d'Auray for the Grand Pardon.

This does not create a new custom. It strengthens the geographic evidence for the existing custom.

## Routes

Documented but unmapped routes added:

- Saint-Sulpice, Paris -> Chartres Cathedral;
- Chemin Nicolazic at Sainte-Anne-d'Auray;
- Cathédrale Saint-Louis, Port-Louis -> Centre Père Laval;
- Église Saint-Joseph, Terre-Rouge -> Centre Père Laval.

Destination points do not substitute for route geometry.

## Resulting seed counts

- Places: 8
- Shrines: 8
- Pilgrimages: 11
- Routes: 6
- Shrine/Pilgrimage temporal links: 8
- Customs attestations: 18
- Shrine/Pilgrimage sources: 22

The next tranche should be selected from the live Directory country footprint, not from an abstract exhaustive-country list.
