# Customs Atlas — visible Explore restoration (9 October 2026)

## Product ownership
- **Explore → Traditions → Customs Atlas** is the canonical atlas, not a new module.
- Home → Explore card has a direct **Open Customs Atlas** / **Ouvrir l’Atlas des coutumes** entry opening the Traditions map.
- Explore retains its four existing lenses, internal `find` route and Directory compatibility contract.

## Facets and semantics
The panel filters the *existing projection* by:
1. **Geography**: exact shared `geo_area_id` on an attestation or novena-context link, labelled from shared Geography.
2. **Historical period**: the canonical custom's exact `period_label`. It is descriptive and intentionally not converted into inferred years.
3. **Calendar context**: exact `calendar_trigger_hint` on a custom, or an explicit evidence-backed Novena association. Calendar continues to own all feast-date computation.

Facets are derived from the unfiltered Traditions corpus, so choosing one filter does not remove other options or create a second source of truth. All selected facets compose with full-text search. The **Clear filters** action resets only atlas facets and retains the current search query.

## Map and evidence boundaries
- Only `PLACE` attestations tied to a shared Place with independently publishable coordinates may produce map markers.
- `AREA_CONTEXT`, `PLACE_PENDING`, `NOT_MAPPED`, and address-only Places remain in **List**. A country/cultural-area match does not manufacture a pin.
- A documented calendar hint is not a universally observed obligation, fixed calendar event or date computed by this module.
- The existing sources and evidence notes appear in the record detail and are not duplicated in Explore.
- Novena prayers stay in PRAY, dates stay in Calendar, site identity stays in Geography.

## Acceptance
Run `npm run test:explore-surface`, `npm run test:customs-atlas`, `npm run test:explore-geography`, `npm run test:home-presentation`, `npm run test:home-owner` and `npm run test:app-shell-contract`. Inspect the Home shortcut and English/French filter controls on mobile. Confirm both List and Map, geographic filter composition, address-only fallback and return navigation.

**Known corpus limitation:** the seed is 13 canonical customs and 71 geographic attestations plus 18 Novena context records. This is a restoration of discoverability, *not* certification that every earlier SOT-07 research row has entered the production atlas, or that every attestation has a publishable pin.
