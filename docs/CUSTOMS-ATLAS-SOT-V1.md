# Customs Atlas — Attestation Foundation v1

This layer converts the SOT-07 customary research into machine-readable entities without turning every custom into a calendar rule or map pin.

## Ownership model

The canonical relationship is:

`custom -> attestation -> geo area / place -> source evidence`

A **custom** answers what the practice is and how it is classified.

An **attestation** answers where and when that claim is evidenced.

The Geography SOT owns stable area/place identity.

Calendar owns date calculation and seasonal triggering.

Pray owns prayer bodies.

Special Days owns ceremonial mechanics.

Learn owns explanatory presentation.

## Why attestations are separate

“Pilgrimage is a Catholic devotional practice” is a universal/customary claim.

“Regional pardons are documented in France” is a geographic attestation.

“Notre-Dame de Laghet preserves an ex-voto tradition” is a place-level attestation.

Those are not interchangeable statements and therefore are not stored in one field.

## Initial corpus

The first production-safe seed contains 13 customs and 15 attestations selected from SOT-07 because their evidence is sufficiently clear for geographic classification.

It includes:

- domestic bénitiers;
- Sacred Heart family consecration and intronisation;
- relevailles;
- May Marian devotion;
- pilgrimage and local pardons;
- ex-votos;
- shrine candles;
- cemetery prayer;
- 2 November prayer for the dead;
- the French glas;
- pain bénit.

The seed is intentionally not the full 63-row SOT-07 corpus. Rows depending only on unresolved bibliographic/project evidence remain outside publication until source closure.

## Map policy

There are five states:

- `NOT_MAPPED` — global/contextual claim;
- `AREA_CONTEXT` — useful when browsing/filtering an area, but not a pin;
- `PLACE_PENDING` — direct evidence names a place, but shared Place identity has not yet been frozen;
- `PLACE` — canonical place exists and direct evidence supports the claim;
- `ROUTE` — canonical route/place structure exists and direct evidence supports it.

The initial Laghet ex-voto and Lourdes candle records are deliberately `PLACE_PENDING`. They are not canonical map pins yet.

## Source gate

A bibliographic-only or project-evidence source can preserve research context, but cannot independently authorize a place/route map claim.

Place and route claims require at least one source classified as official, primary historical, direct institutional, or direct transcription.

## Negative knowledge

HOLD and REJECT rows remain in `negative-knowledge.v1.json`.

They are map-blocked and cannot coexist with active customs of the same ID. This prevents previously rejected claims such as universal Epiphany door chalking, universal detailed glas patterns, or false fasting rules from re-entering through later UI work.

## No proximity inference

A TLM venue near a shrine does not prove that the ministry serves the shrine.

A custom documented in a region does not prove that a local traditional community observes it.

Any future Directory ↔ Custom or Community ↔ Custom association needs its own explicit evidence-backed bridge.

## Next step

The next corpus should be **Shrines & Pilgrimages**. Its first job is to assign canonical Place identities to source-backed `PLACE_PENDING` records such as Laghet and Lourdes, then add routes/events without moving their dates or ceremonial mechanics out of their current owners.
