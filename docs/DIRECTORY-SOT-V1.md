# Worldwide Traditional Latin Liturgy Directory — Foundation v1

This packet freezes the data layer before any map UI is introduced.

## Ownership

Canonical directory data belongs under `data/directory/`. Presentation code must not become the source of truth.

The governing relationship is:

`venue -> ministry/community -> liturgical usage / communion profile -> schedule -> source -> verification`

A physical venue is not an affiliation. Una-cum and communion attributes belong to a ministry or celebration, not to a building.

## Evidence rules

- `UNKNOWN` and `VARIES_*` are valid values.
- A non-UNKNOWN communion-position claim requires explicit source ids.
- Ecclesial/canonical status is represented as dated assertions from a named authority.
- Community self-description and Holy See status assertions are kept separately when they answer different questions.
- User reports and secondary directories may discover candidates, but they do not silently become canonical facts.

## SSPX first importer

`tools/directory/import-sspx.mjs` consumes the official public SSPX map API documented at:

`https://map.fsspx.org/en/api`

The importer:

- paginates the official `/places` endpoint;
- fetches full place details and schedules;
- preserves CRM ids, slugs, relationship, community name, raw schedules, sources and upstream timestamps;
- maps direct `relationship=fsspx` records to community `SSPX`;
- keeps `affiliated`, `friend` and `ecclesia_dei` records as `OTHER + REVIEW` until canonical affiliation is separately established;
- never invents email addresses when the API provides only a contact form;
- emits canonical venues, ministries, raw schedule assertions, source records, GeoJSON, validation issues, a duplicate-review ledger and an import report;
- blocks duplicate upstream identifiers;
- does not automatically merge merely co-located but structurally different houses, churches, chapels, schools or missions.

Run:

`npm run directory:import:sspx`

Optional flags:

`node tools/directory/import-sspx.mjs --lang=fr --concurrency=6 --out=data/directory/generated/sspx`

## Current SSPX communion/status handling

The community-level source registry stores separately:

1. SSPX self-description/evidence that it recognises the reigning pontiff and names the Pope/local Ordinary in the Canon; and
2. the dated Holy See/DDF status assertion issued 2 July 2026.

These are deliberately not collapsed into one scalar field.

## Not in this packet

No MapLibre UI, Near Me UI, global ribbon changes, FSSP/ICKSP/IBP importer, diocesan harvesting, user submissions, or generated live snapshot is committed by this foundation packet.

The generated SSPX corpus is intentionally derived data. It should be refreshed from the official source and reviewed through the generated validation/deduplication reports before a production map begins consuming it.
