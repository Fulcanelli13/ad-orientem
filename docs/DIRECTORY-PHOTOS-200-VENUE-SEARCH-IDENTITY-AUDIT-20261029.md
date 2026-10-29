# Directory Photography — search-locality correction and next bounded pilot

## Evidence as of 29 October 2026

Two frozen R49 exterior passes completed, 100 venues each:

| Measure | Records 0–99 | Records 100–199 | Combined |
|---|---:|---:|---:|
| Venues searched | 100 | 100 | 200 |
| Venues with candidate metadata | 14 | 7 | 21 |
| Exterior candidate records | 27 | 15 | 42 |
| Commons candidates labelled PUBLIC_DOMAIN | 27 | 11 | 38 |
| Openverse research-only leads | 0 | 4 | 4 |
| Verified original-byte WebP acquisitions | 0 | 0 | 0 |
| Published photos | 0 | 0 | 0 |

The second-run permanent preflight reports `available_candidates: 0`. All 42 are leads, not verified exact-site photographic assets. They are not a 42-image collection.

## Root cause

The frozen R49 master exposes an `id`, `name`, `country`, `locality`, and coordinates, but many `locality` cells are empty. Consequently, name-driven Commons/Openverse searches are missing the city. Saint dedications such as **Sacred Heart**, **Saint Peter and Paul**, and **Notre-Dame** have many unrelated churches sharing these names. The batch already returned a Peter and Paul church in Indianapolis against a different venue, and an image of a church in Frankfurt (Oder) against an Eichstätt site. The first 200 results therefore cannot be trusted as exact-place matches.

For countries with a recognizable postal suffix in their frozen R49 identity (FR, DE, CH, IT, CZ, NL, AT, PL), the source-ID trailing token(s) now supply **search locality hints**. In the US, Canada, Australia, New Zealand and Ireland, a carefully bounded final town token is used only if the expected postal/region/country suffix is present; a compound city can be abbreviated, so it is **never** presented as a verified municipality. The frozen ID and coordinate remain unchanged.

Every generated candidate declares `locality_source` as `FROZEN_VENUE_ID_POSTAL_SEARCH_HINT_NOT_VERIFIED`, `FROZEN_R49_LOCALITY_FIELD`, or `NO_LOCALITY_HINT`. This is a discovery query refinement, **not** a new claim about any venue's identity, canonical site relation, church subject, geolocation accuracy or rights.

## Exit criteria

Do **not** widen the discovery pass blindly. Re-run a non-destructive 100-site comparative pilot with city hints under a *new* versioned metadata filename, compare its exact-subject precision and CC-original shortlist rate with the old 100–199 results, and keep both exports. Any original download still requires the existing Commons title, allowed rights URL, byte SHA1, author and derivative SHA256 verification. Staged media still need visual checks and exact-site identification before publication. No Google Maps scraping, payments or scheduled runs.
