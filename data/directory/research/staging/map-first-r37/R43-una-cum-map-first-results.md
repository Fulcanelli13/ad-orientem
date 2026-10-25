# R43 — Rome-recognised priority bulk pin acquisition

2026-10-10. **Provisional research map only — production Ad Orientem app unchanged.**

## Results
- Input: **460** previously unmapped address-bearing source records; affiliation sourced as diocesan, FSSP, ICKSP, IBP, Oratorians, AASJMV.
- GitHub Actions evidence: [run 38060295946](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38060295946), artifact `r43-una-cum-address-coordinate-evidence`.
- 372 sequential geocoding queries; 26 identical-query cache hits; 0 request errors, no 403/429 termination. One-off, site-scale geocoding with [Nominatim policy](https://operations.osmfoundation.org/policies/nominatim/) and © OpenStreetMap contributors / ODbL attribution.
- **85 source-address coordinate candidates**: diocesan 20, FSSP 51, ICKSP 10, IBP 1, Oratorians 2, AASJMV 1.
- Conservative deduplication against R42: **74 new provisional venue markers** and **11 coordinate proximity/identity review holds**. No name-only or arbitrary town-centre locations published.
- Separately, 11 R42 source records were attached to already-mapped church identities by explicit matching source ID or unique church name + country + postal code.
- Map totals: **1,236 → 1,310 provisional points**; Rome-recognised label **379 → 453**. SSPX remains separate at 732; other/unverified at 125.
- Explicit recognised/other religious source claims with pin identities: **446 / 1,537**. This is a source-claim linkage count, not a percentage of unique churches or worldwide coverage.

## Remaining source-claim buckets
| Bucket | Records |
| --- | ---: |
| Linked to preliminary pins | 446 |
| Address query found no acceptable site-scale match / held | 375 |
| Geocoded but possible same-site identity held | 11 |
| Possible existing aliases (unconfirmed) | 59 |
| Locality only, specific site still needed | 593 |
| No usable location evidence | 47 |
| Mailing/PO box not geocoded | 6 |
| Total | 1,537 |

## Editorial restrictions
**Una cum is a liturgical commemoration in the Roman Canon, not a direct test of canonical standing.** The map label is sourced community affiliation, not certification of each celebrant or specific Mass. SSPX, sedevacantist and unverified community categories remain separate. No Sunday or weekday schedules were imported. No home/office-only premises were turned into confirmed public Mass churches. Building/address/street points are approximate source-derived pins, not verified doors; preserve OSM attribution and source links.

## Next highest-yield work
1. Resolve 11 proximity/identity holds and 59 older possible aliases; do not duplicate physical worship venues.
2. Acquire official venue-specific address/coordinate evidence for 593 locality-only claims (especially US diocesan claims), **without placing invented town-centre pins**.
3. Recover 375 held address-site points from venue pages / independent geodata, then revalidate identities.
4. Integrate the provisional source-linked map into Ad Orientem as a labelled preliminary directory. Do not block it on Sunday times or canonical certification.
