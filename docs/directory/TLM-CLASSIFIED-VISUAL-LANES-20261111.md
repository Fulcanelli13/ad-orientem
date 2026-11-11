# TLM Atlas — category-driven visual release (11 November 2026)

## Scope and intended UI

This release enforces the already-agreed visual policy **on the published
CL2 site-category census**. No new asset acquisition, photographer rights
review, source-to-building match or new affiliation is performed here.

| Site-category visual lane | CL2 sites | Hero treatment |
| --- | ---: | --- |
| Diocesan/parish context | 762 | Existing approved, exact-linked church photograph; neutral diocesan church illustration otherwise |
| Source-reported institute and religious house | 1,506 | Institution emblem or general order-family arms **only where the actual source category gives that group**; named source identity or neutral illustration if no suitable emblem |
| Mixed / hosted, lay association, source-unknown and directory-only | 312 | Neutral church/venue illustration; never inherit the host ministry's emblem |
| **Total** | **2,580** | All retain existing CL2 anchors, source IDs and place/media records |

**Important distinctions**

- Category census coverage is complete as a *visual routing decision*, not
  as verified association: **2,325** currently have a defensible positive
  source-context category and **255** remain held (181 unresolved, 74
  directory-only). Neutral is an intentional correct state, not an
  institute identity waiting to be guessed.
- An institute may celebrate Mass in a diocesan church without owning it.
  Such a venue uses a church photograph as hero, while the genuine
  source-linked ministry may retain an emblem in the separate **ministry**
  section of its profile.
- A source-reported institute or religious-family emblem is not proof
  of canonical status, endorsement, individual Mass rites, Una Cum or
  ownership. A generic **CMRI-directory** or **SSPV-directory** entry does
  not qualify for a corresponding institutional emblem by directory
  membership alone.
- For a site with an exact verified community hint, use only that specific
  source-witness community. Order-family arms explicitly identify the
  order, **not the individual monastery's coat of arms**.
- All previously approved media bytes, photos and galleries remain
  untouched. The rendering policy only decides when to display them.

## UI consistency

The category is interpreted by
`src/find/tlm-venue-visual-policy.js`, consumed by:

1. List church cards and identity fallback in `directory-card.js`.
2. Map quick previews in `explore-presentation.js`.
3. Full church profiles in `tlm-church-profile.js`.
4. MapLibre / map fallback institute-group pins in `map-runtime.js`.
5. The interior/exterior gallery renderer, now used as part of the
   diocesan church photograph lane for **classified CL2 sites**.

The 3 approved external cards and legacy/offline data without the
optional category manifest retain the existing approved-media presentation
until their category exists; this is backward compatibility, **not**
evidence of a diocesan operator.

## Required acceptance

`tests/tlm-classified-visual-lanes.mjs` guards exactly 762/1,506/312
category lanes, the preservation of approved media data, representative
source-exact FSSP/ICKSP/Benedictine examples, mixed and directory-only
negative cases, legacy category-free behavior, and consistent outputs
across card, preview, profile, gallery and map.

The release does not change scheduling, address/pins, source ministry
joins, rite, Missal, ecclesial position, Una Cum, releases or hosting.
Public deployment remains GitHub Actions and GitHub Pages only.
