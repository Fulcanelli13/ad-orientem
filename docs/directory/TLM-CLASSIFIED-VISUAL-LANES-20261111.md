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


## Consolidated release receipt: 42 additional source-exact sites and P107 photography

The first-party category witness overlay now comprises **164 individual
venues**. The 42 additional exact source matches include 31 LMS
discoveries, eight historical LMD records, two other-source sites and
one formerly unknown. They record **36 diocesan contexts** and **six
mixed/host contexts**; no community property title or liturgical edition
was inferred. The new overall category tally is:

| Category | Sites |
| --- | ---: |
| Priestly societies / clergy source context | 1,393 |
| Diocesan / parish context | 762 |
| Religious houses | 113 |
| Mixed / hosted | 32 |
| Lay association or local group | 25 |
| Unresolved source association | 181 |
| Directory-only group association | 74 |
| **All physical sites** | **2,580** |

There are **2,325 positive source-context classifications (90.12%)**,
with **255 still held (181 unresolved and 74 directory-only)**.

The **P107** release uses the *existing, approved photographs* in the
Sacred Places Gallery to add two exact, source-grounded Directory links:

- **Westminster Cathedral**, source `AO-B35-L-GB-91CDCC69A421` ->
  `place:GB:westminster-cathedral` (current diocesan venue witness).
- **Wallfahrtskirche Maria Vesperbild**, source
  `AO-RSCH-B69-3A43E996D0D9` ->
  `place:DE:maria-vesperbild` (same official name and street address).

This raises the currently exact-linked approved **diocesan photo
heroes from seven to nine**. It does **not** mean nine newly acquired
images: there are zero new photographic assets, all existing media
credits and permissions are preserved, and the physical 2,580 site
records have no changes. The canonical Sacred Places links increase
from 24 to 26, with the P107 receipt appended to the live release
chain. No coordinates, new Places or Mass schedule rows are added.

**Walsingham caution:** the stored, approved shrine picture depicts
the Slipper Chapel; it is deliberately not cross-linked as a photo
of the Basilica. Similar generic church names in different
localities cannot justify a photo crosswalk.

The remaining image gap after P107 is **753 diocesan-context sites
without an approved, exact-linked hero**. This is an asset-coverage
gap, not a need to revisit the rights or identity of previously
curated photos.
