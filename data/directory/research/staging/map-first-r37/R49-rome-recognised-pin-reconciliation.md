# R49 — Rome-recognised map-first venue reconciliation

2026-10-10. **Preliminary staging only; production Ad Orientem map unchanged.**

## Executed work

- Existing map baseline: **1,864 provisional world markers**, including **1,007 source-labelled Rome-recognised markers**.
- Reconciled the **206** prior unresolved address source records with Latin Mass Directory's published original venue map links in **three country shards**: [GitHub Actions run 38063954607](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38063954607).
- Retrieved **26** actual original source-marker coordinate assertions from the successfully parsed countries. After existing-site matching and removal of locality-only or non-worship entries, **12 provisional pins added**.
- **39** additional source claims linked to already-existing physical-site pins, preserving external source URLs. This includes several aliases from earlier identity-review buckets.
- **1,876** provisional worldwide markers in the local R49 map; **1,019** labelled Rome-recognised.
- **1,110 / 1,537** priority source claims now have a direct associated map pin.
- The original failed-address queue is reduced **206 → 180**; not all remaining 180 are worship sites.

## Added source sites (original directory coordinates, longitude/latitude)

| Source ID | Name | Country | Lon | Lat |
| --- | --- | --- | ---: | ---: |
| LMD-AFR-01 | Église Saint-Jean-Baptiste | BJ | 1.3810309 | 10.2885989 |
| LMD-AFR-02 | Lycée des Jeunes Filles (Mass venue, not classified as a parish) | BJ | 1.3814817 | 10.2860042 |
| ao-fssp-chapelle-notre-dame-de-compassion-2-place-du-marche-ch-1630-bulle-suisse | Chapelle Notre-Dame de Compassion | CH | 7.0583445 | 46.6180158 |
| ao-fssp-kirche-st-mauritius-niederwil-ch-6330-cham-suisse | Kirche St. Mauritius | CH | 8.4515625 | 47.2129375 |
| ICKSP-STG-039 | Chapelle de l'Immaculée Conception | CH | 7.4234749 | 47.3512077 |
| ao-fssp-eglise-paroissiale-saint-georges-f-72440-bouloire-france | Église paroissiale Saint-Georges | FR | 0.5558806 | 47.9727972 |
| ao-ibp-paris-centre-saint-paul-centre-saint-paul-12-rue-saint-joseph-75002-paris-metro-sentier-bourse-grands-boulevards-0 | Centre Saint-Paul | FR | 2.3444037 | 48.8686526 |
| AASJMV-EXT-002 | Capela Nossa Senhora do Líbano | BR | -43.9331 | -19.9112 |
| AASJMV-EXT-004 | Igreja Nossa Senhora do Rosário | BR | -44.5761264 | -20.0792802 |
| ao-fssp-parroquia-san-jacinto-de-guale-canton-pajan-provincia-de-manabi-guale-equateur | Parroquia San Jacinto de Guale | EC | -80.2404468 | -1.6320869 |
| LMD-AFR-03 | Chapelle Notre-Dame-de-Bonne-Délivrance | GA | 9.3638879 | 0.3288719 |
| LMD-AFR-15 | Our Lady of Fatima Chapel | UG | 32.6249117 | 0.3055991 |

All 12 retain their individual source URLs in the local R49 GeoJSON and operational CSV. Source is the [Latin Mass Directory](https://www.latinmassdir.org/), with its venue page URL and explicit map marker, not a certified church entrance point.

## Not a negative-country audit

The third acquisition shard returned HTTP-success country-listing pages but zero extracted venue links for **BE, CA, CZ, ES, GB, MQ, NG, PL and US**. These are **incomplete acquisitions**, not evidence of zero venues and not evidence that the outstanding records cannot be geocoded. Do not retry with high-frequency scraping or ignore site access restrictions.

Other holds include apparent house-only records, names consisting solely of city names, and colocated candidate pairs such as Spitalkirche St. Margareth vs St. Margareth am Milchberg in Augsburg, pending physical identity review.

## Publishing contract

Keep the preliminary map first: name, pin, source-reported affiliation, source URL, searchable map and filters. Distinguish diocesan/FSSP/ICKSP/IBP from SSPX and separately from sedevacantist groups. Source affiliation is **not** proof of actual *una cum* commemoration at an individual liturgy or church. No Sunday or weekday Mass times have been imported. Retain OSM attribution and license review. Current source map remains a local standalone artifact, not yet a production PR build asset.

Next: publish preliminary directory experience inside Ad Orientem after source/asset packaging; continue nonblocking targeted recovery of remaining 180 addresses and the identity holds.
