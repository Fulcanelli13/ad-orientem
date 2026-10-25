# R42 — priority audit of Rome-recognised traditional Mass venues

Date: 2026-10-10. Preliminary map research only. **Not a verified world census** and **not a production map activation**.

## Scope
The operational R39/R41 source registry contains 3,118 source claims. Of these, 1,529 have a reported affiliation to FSSP, ICKSP, diocesan ministries, IBP or explicitly named recognised communities. Eight further claims are generic "Religious/Monastic" and are retained with classification pending. These are **source claims**, not 1,537 distinct physical churches.

Do **not** equate *una cum* (liturgical commemoration of the Pope in the Canon) with canonical regularity. SSPX sites remain a distinct affiliation layer; no site is asserted to be personally verified "una cum" merely from its label. Sedevacantist or ambiguous groups must not be silently classified as Rome-recognised.

## Completed reconciliation
- Preliminary map R41: **1,189** markers.
- Recovered R39 geocoding artifact from [Actions run 38056058324](https://github.com/Fulcanelli13/ad-orientem/actions/runs/38056058324) includes **46** diocesan and **2** Canons of St John Cantius source-coordinate assertions.
- After exact coordinate/name deduplication: **47 additional provisional venue pins**; **1 exact-source alias** at Église Notre-Dame (Bourges) reconciled with existing FSSP pin. The FSSP affiliation was preserved and the diocesan source URL was added.
- LMD R40 source pins cross-matched by same country, distinctive venue name and locality: **21 provisional affiliation assignments** (not independently validated current liturgical status).
- R42 preliminary map therefore holds **1,236** source markers: **379** labelled Rome-recognised, **732** grouped SSPX separately, and **125** still unverified/other. All have source links and plausible coordinates; precision is not door-level certified.

## Missing pin work (Rome-recognised plus eight unassessed religious/monastic source claims)
From 1,537 source claims: **361** have direct known pin identities; **70** have possible existing name-based links; **460** have an address still requiring coordinates; **593** have locality only (not a safe site-level pin); **47** have no locatable site information; **6** hold a mailing/PO-box address. The larger claim count includes duplications and non-parish houses in source inventories. These buckets cannot be treated as a number of churches missing from the map.

**Map-first rule:** retain all available sources; prioritize the 460 address-bearing claims, then resolve venue identity of locality-only records. Do not fabricate city-centre pins or present source claims as distinct churches. No Sunday or weekday Mass times were imported, and the production map remains unchanged.

## Delivered local prototype and audit
The conversation artifact `Ad_Orientem_Una_Cum_Preliminary_R42.zip` includes the self-contained map HTML (Leaflet resources load from the network), full GeoJSON, the source-claim coverage CSV and machine-readable audit. These are staged research outputs, not yet a committed production page.
