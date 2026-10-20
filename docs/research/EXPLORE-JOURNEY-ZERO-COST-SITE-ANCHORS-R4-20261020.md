# Explore D — zero-cost pilgrimage site anchors (R4)
20 October 2026 · Ad Orientem · Draft PR #1502

## Non-negotiable operating constraints

- **No outreach:** do not email, call, request licences or contact any pilgrim organizer or institution on behalf of Ad Orientem.
- **No expenditure:** do not purchase maps, paid APIs, software, route data, licences or subscriptions. Use the existing repository, openly documented public evidence and legally reusable free resources.
- Never imply a freely accessible map can be downloaded and republished. Where licensing or edition identity is unclear, link to the organizer's public information instead.
- Avoid repetitive auditing without product delivery. The following crosswalk is a direct UX improvement in the existing A+C+D atlas.

## Implemented R4 data

`data/shrines/route-stage-canonical-site-links-20261020.v1.json` supplies **15 explicit crosswalks across 13 of the 20 canonical journeys**. These do not create new geography rows; each `canonical_place_id` resolves to an existing `data/geography/seed-registry.v1.json` sacred place with independently published coordinates and provenance.

The stage ID is exact, and the stage's source text must match the stored crosswalk. Published source URL, type of geographic anchor and canonical site precision must also pass validation. No fuzzy matching, synthetic coordinate, reverse geocoding, routing API or commercial service is involved.

Two important examples:
- **Holywell:** exact St Winefride RC Church (stage 1) → separately documented Shrine & Well (stage 2), with two clickable numbered map medallions. Existing Well coordinates identify the broader complex, not a precise entrance. **No walking track is drawn.**
- **Père Laval:** Saint-Louis Cathedral, Port Louis → Centre Père Laval (complex anchor). The second pilgrimage's Terre-Rouge departure remains text-only because no independently sourced canonical `place:...` record exists for that particular church.

Other destination sites reuse the existing charted sacred-place coordinates (Chartres Cathedral, Champion Shrine, Laghet, Sainte-Anne-d'Auray, Martyrs' Shrine, Belém Nazaré Basilica, Zapopan Basilica, Sameiro and Auriesville). These are **place markers**, not an inferred route trajectory.

Explicit exclusions:
- **LMS 2026 Walsingham Priory** is not the mapped Roman Catholic Shrine. Do not reuse shrine coordinates as its route endpoint.
- **Paray fourth chapel** is not the sanctuary centroid.
- Generic city or regional origin labels are not exact meeting points; do not derive points from place names.
- `COMPLEX_ANCHOR` is a contextual anchor only, not an entrance, safe path or precision navigation point.

## Interaction & tests

- **Existing MapLibre instance** renders circular numbered stage markers while Journey is open, and clears them on route change or exit; no duplicated map engine.
- Accessible 44-pixel focus controls in the timeline center the verified sacred-site anchor without opening a paid map product.
- Unmapped stages retain the existing source-backed textual timeline; all 20 certified walking geometries remain `null`.
- `tests/explore-pilgrimage-journey.mjs` verifies exact joins, 15 links / 13 routes, two distinct Holywell sites, no Walsingham or Paray crosswalk, zero route geometry, and 20 canonical route IDs.
- `tests/explore-medallion-visual-acceptance.mjs` adds 320, 390 and 1440 px Holywell screenshots and verifies two real stage medallions, tap-to-focus and no fabricated route line.

## R5 — Open Sacred Atlas from a verified stage

The stage **number** keeps its existing role: focus the selected, independently sourced canonical sacred-site pin. The **stage name** is an accessible button opening that exact site’s existing Sacred Atlas preview. Tapping the **numbered map medallion** also opens the same Place.

This opens the **existing** C Place folio in a sheet over D, without remounting MapLibre or changing the selected pilgrimage. The Discover action expands the complete Place profile with its existing historical narratives, imagery, sources and any linked devotions. Closing the Place sheet (labelled *Return to pilgrimage journey*) reveals the original Journey rail at its previous route selection and leaves the map camera intact.

No new Place records, inferred coordinates, licence costs, organizer contact, duplicate profile engine, artificial line or GPS instructions are introduced. All stage-name links are gated by the existing `stageSiteAnchors` exact canonical crosswalk. Unmapped names remain plain text.

Browser acceptance now tests a full Holywell loop: a stage-name tap, compact Place preview, expanded profile, return to the same Journey and the same MapLibre canvas, and a second entry by map medallion into the distinct Well profile. Screenshots are captured on mobile and desktop.

## R6 — Sacred Atlas → Journey: reciprocal Place links

The C Sacred Atlas now offers a compact **Explore pilgrimage** shortcut when one documented route is associated with a selected Place. A Place with multiple canonical pilgrimages offers a **documented journeys** action that reveals all exact linked routes in the existing full Place profile. It does not choose a starting point arbitrarily.

Route associations come solely from `journeysForCanonicalPlace`: either the exact canonical `destinationPlaceId` belonging to the route or the explicit named-stage → canonical-Place crosswalk published in R4. Every eligible route retains original source URLs. No nearby-search, guessed geography, name similarity, route line or additional pilgrimage identity can establish the link.

Examples:
- **Chartres Cathedral:** opens the documented Paris–Chartres Pentecost Journey directly from its profile.
- **Centre Père Laval, Sainte-Croix:** shows both documented departures, from Saint-Louis Cathedral and Saint-Joseph Terre-Rouge, allowing deliberate selection.
- **Walsingham Catholic Shrine:** displays the LMS 2026 pilgrimage only as a **related shrine**, explicitly **NOT the edition's terminus** at the Priory grounds.

Switching into Journey clears the Place sheet and activates the established D rail over the **existing** A/C MapLibre instance. Route filters and selection remain intact; no extra map is mounted. The user can exit Journey explicitly to return to ordinary Atlas mode.

Browser coverage at 320/390/1440px checks Place → Journey exact route selection and unchanged canvas, Chartres direct access, and the two-route Père Laval chooser. Pure unit tests confirm exact canonical associations, zero phantom routes and the Walsingham distinction.

**No organizer contact or expenditure; no new map services or route geometry.**

## Next free improvements

First use available internal source-backed site anchors and place editorial profiles. If later publicly downloadable geometry exists, verify that it is both edition-matched and redistributable under a free licence **without contacting anyone or spending money**. Otherwise leave the link-only/text-only experience in place and continue other release work.
