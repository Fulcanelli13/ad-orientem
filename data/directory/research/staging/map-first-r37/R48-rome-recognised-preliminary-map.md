# R48 preliminary worldwide map — Rome-recognised venues first

Date: 2026-10-10. **Source-backed research staging; no production map activation.**

## Executed acquisitions and deduplication

- R44 baseline: **1,699** worldwide provisional source markers, of which **842** were labelled Rome-recognised.
- R45 local duplicate review: **32** high-confidence source-to-pin matches and **15** failed-address aliases resolved, without extra pins.
- R46 Italian name-only recovery: **47** original venue-map coordinates acquired; **41** distinct provisional pins added and **6** reserved for venue-identity review.
- R47 direct source recovery: from **151** address-retry records, **131** original venue-map coordinate assertions acquired; **99** additional provisional pins after deduplication.
- R45 alternative name+location Nominatim queries: all **375** records processed, **519** geocoder requests, **76** candidate coordinates, **299** holds, **0** reported network errors. After joining with R46 and R47, **25** additional provisional pins.
- Final preliminary map: **1,864** provisional markers, including **1,007** labelled Rome-recognised. **165** net map-pin increase from R44.
- **1,059 / 1,537** priority registry source claims now have direct map-pin links. These are *source claims*, not 1,059 distinct physical sites.
- **30** new R45/R47 coordinate assertions remain in identity review (plus **83** older R44 name/coordinate identity holds, **6** Italian R46 holds, and **11** R43 geocoder identity holds).

## Outstanding source-claim disposition

| Coverage category | Count |
|---|---:|
| Directly linked to a pin | 1,059 |
| Failed address retry, no accepted site-scale match | 206 |
| New coordinate identity review | 30 |
| Older R44 source-marker identity review | 83 |
| R43 geocoder identity review | 11 |
| Italian R46 identity review | 6 |
| Possible existing pin, not yet confirmed | 59 |
| Locality-only | 32 |
| Missing source map marker | 45 |
| Mailing address only | 6 |
| **Total priority source claims** | **1,537** |

## Publication safeguards

This is a map-first, low-burden preliminary experience. Every added marker carries a named venue, country, sourced affiliation, source link, and actual source/geocoder coordinate. A map point is **not** certified as an entrance coordinate. OSM-derived coordinates require © OpenStreetMap contributors attribution and ODbL compliance review. Do not fabricate city-centre locations. Report affiliation as sourced; *una cum* is a liturgical commemoration, and no source-provider label can certify each individual Mass. SSPX and sedevacantist communities remain separate selectable map layers. Do not import Mass schedules yet.

GitHub Actions acquisition runs:

- [R43 alternate provider geocoding and source](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38060295946)
- [R44 source marker recovery](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38061354857)
- [R45 name-plus-address geocoding](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38062332209)
- [R46 Italian marker recovery](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38062634360)
- [R47 direct source marker recovery](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38062951300)

The updated **standalone** R48 HTML, GeoJSON, coverage CSV, and audit are generated as conversation artifacts; they are not yet stored on production `main`. Integrate only after the branch's app tests, rights and source-reconciliation gates.
