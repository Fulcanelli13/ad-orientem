# P27 — exact-feature discovery, not map publication

Date: 24 October 2026.

This pass prepares **22 source-backed candidates in 22 countries** for a **single bounded read-only OpenStreetMap Overpass discovery query** executed by an independent GitHub Actions research job. The CI invariant test is offline and does not query external services.

The input coordinates are **approximate search-region centres**. They are not mapped shrine or church coordinates. Search results are likewise unverified: the same name can belong to a chapel, gate, complex, basilica, civic monument, or a nearby separate parish. Never copy search coordinates or an OSM element into `seed-registry.v1.json` without explicit institution-to-physical-feature adjudication, country validation, duplication check, and source/OSM provenance.

The discovery workflow prints and temporarily uploads raw findings for inspection; generated JSON must be checked and committed as permanent research before artifact expiry. It never pushes map data or automatically approves a release. The strict publication gate continues to require verified OSM object and institutional source that refer to the *same physical feature*.

Baseline remains 387 Places / 685 typed sources; 105/200 first priorities with individually retrieved source excerpts, 95 without. Original protected P16 exceptions and nine Directory links remain unchanged.

Next: inspect returned feature IDs, select actual Catholic physical buildings, verify geometry and check all frozen existing IDs, then prepare P28 release manifest for only qualified unique sites. Do not automatically convert a source-screened site into a pin.

## Canonical no-duplicate audit

- `SG-INV-0728` Ouidah Basilica is already `place:BJ:immaculate-conception-basilica-ouidah` with `osm:way:402951938`. Do not publish again.
- `SG-INV-0748` Sacred Heart Cathedral, Suva already exists as `place:FJ:sacred-heart-cathedral-suva`; preserve its existing geoprovenance and no duplicate.
- `place:DE:kevelaer-gnadenkapelle` and `place:DE:kevelaer-kerzenkapelle` are separately mapped chapels; they do not stand for the basilica.
- `place:ES:santa-maria-de-montserrat-abbey` is a complex anchor, not verified Santa Cova chapel geometry.
