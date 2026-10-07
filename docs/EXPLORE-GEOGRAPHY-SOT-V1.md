# Explore Geography + Place — Foundation v1

This layer provides one shared geographic identity system for Ad Orientem without merging the application domains that consume geography.

## Why it exists

Calendar answers **when**.

The TLM Directory answers **where public traditional liturgy is currently available**.

The Customs Atlas answers **where a practice is attested**.

Shrines/Pilgrimages answer **which sacred place, destination or route is involved**.

Those features need common place and area identifiers, but they must not share one undifferentiated record type.

## Ownership

The shared layer lives under `data/geography/` and `src/find/geography-contracts.js`.

It owns:

- stable geographic area ids;
- stable shared place ids;
- aliases used for discovery;
- explicit parent-area relationships;
- civil / ecclesiastical / cultural / historical hierarchy distinctions;
- map locators;
- evidence-backed Directory venue-to-place bridges.

It does **not** own:

- Directory venue schedules, ministries, affiliations or communion assertions;
- customs classification/evidence;
- shrine theology/history;
- pilgrimage event schedules or routes;
- Calendar date calculation.

## Entity separation

A Directory venue and a shared Place are deliberately different records.

Example:

`venue:...` = operational fact that a public liturgy is offered at a location.

`place:FR:...` = stable physical/named identity that may also be referenced by a shrine, custom, pilgrimage or historical record.

A confirmed `LOCATED_AT` bridge connects them. It does not collapse them.

## Area systems

The same geographic name may participate in different systems:

- `CIVIL` — countries, administrative regions, localities;
- `ECCLESIASTICAL` — dioceses, archdioceses, vicariates, ordinariates;
- `CULTURAL` — evidence scopes such as a customary region;
- `HISTORICAL` — former territories or historical customary scopes;
- `GLOBAL` — root/world scope.

No hierarchy may be inferred from display names alone.

## Safety rule

Geographic proximity is not association.

A traditional Mass venue near a shrine does not prove that the ministry serves the shrine. A custom documented in a region does not prove that every TLM community there observes it. Such relationships need explicit evidence.

## Seed registry

The initial seed contains the world root plus country identities for France, Ireland and Mauritius because they are immediately useful to current Ad Orientem research and testing. The schema is worldwide; future corpus importers may add other countries and lower-level areas without changing the contract.

## Next layer

The next implementation should introduce a machine-readable Customs Atlas attestation record:

`custom -> attestation -> geo_area/place -> period -> source -> confidence`

That layer should consume these shared ids rather than invent another geography taxonomy.
