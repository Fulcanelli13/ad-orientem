# Worldwide Traditional Mass directory: source-first acquisition audit
**Research snapshot:** 9 October 2026  
**Purpose:** establish an honest path to more *distinct current public Mass venues* than the public AdOrientem.church catalogue, without counting duplicate entries, administrative houses, cancelled/planned sites, or geographic reference points as new parishes.

## 1. Public competitor benchmark and data-quality risks

- Homepage: 2,284 current locations, 77 countries, 5,231 listed Masses, plus three planned.
- Country browser: 77 countries whose displayed counts sum to **2,288**, four above the homepage number. Do not assume the three planned entries fully reconcile this discrepancy.
- Institute browser: 734 SSPX, 249–250 FSSP depending on page, 97 ICKSP, roughly 902–905 diocesan depending on active/planned filter.
- `/find?verified=true` currently displays only **28 matching results**, including some planned locations. This should NOT be presented as a certified count of fully current services because the filter semantics are not fully audited.
- Two independently checked **probable physical-site duplicates**:
  - Annunciation Chapel, Fort Collins: [entry A](https://adorientem.church/find/annunciation-chapel-fort-collins-4e352963), [entry B](https://adorientem.church/find/annunciation-chapel-56-fort-collins-25016d75). Both identify 290 East County Road 56.
  - Annunciation Catholic Church, Houston: [entry A](https://adorientem.church/find/annunciation-catholic-houston-f6122ff1), [entry B](https://adorientem.church/find/annunciation-catholic-church-houston-f4d0a45c). Both identify 1618 Texas Avenue and the same Sunday time.
- These examples establish that published listing totals cannot be treated as a complete deduplicated count. They do not establish a global duplicate rate.
- The example listings cite TradVillage/Mapme, described by the competitor as **third-party posts of low confidence**. Such citations are discovery evidence, NOT current public Mass confirmation.
- [Their terms](https://adorientem.church/legal/terms) explicitly permit structured location/schedule reuse with attribution to them and original sources; they ask bulk users to request a feed rather than high-rate scraping.
- [Their Press & Data page](https://adorientem.church/press) advertises custom data requests, not a publicly documented download.

## 2. Independent source universes, avoiding double counting

### First-party SSPX
- [SSPX official statistics](https://sspx.org/en/general-statistics-about-sspx-30870): **798 worldwide Mass locations** (plus **79 friendly-community** sites, separately classified).
- Official USA report (updated August 2026): **120 chapels**, distinct from **25 priories** and two retreat centres.
- Our existing SSPX Mass corpus: 613 world records; 107 US records. A nominal 13-site US gap against 120 chapels is a lead, **not** proof of 13 missing unique chapels. Compare identities and current public Mass evidence individually.
- Competitor's 262 US SSPX listings are **not** demonstrably 262 unique chapels: they exceed first-party 120-chapel statistics and contain concrete duplicate examples.

### Approved-structure directory
- [Latin Mass Directory census](https://www.latinmassdir.org/countries/): 65 countries and **1,573** entries by summing the listed venue counts in the current country table. Leading markets: US 450, France 230, Poland 117, Italy 117, UK 101, Brazil 91, Germany 87, Australia 40, Canada 39, Spain 39.
- [Their explicit scope statement](https://www.latinmassdir.org/about/) excludes SSPX and other groups outside the diocesan/approved structures. Therefore this is complementary to official SSPX sourcing, not a duplicate of the same SSPX census.
- **1,573 + 798 = 2,371** candidate source rows across largely disjoint affiliation scopes, only **87 above** the competitor homepage figure *before* deduplication, status screening, schedule review, and identity reconciliation. It is not a publishable total. Adding separately evidenced friendly communities and other traditional providers may improve the attainable unique total.
- Latin Mass Directory should be a discovery witness; original parish/bulletin/institute pages remain preferred publishing evidence.

### Present internal baseline
- 613 SSPX source-backed Mass records; 401 pre-existing source pins and 212 coarse non-routing indicators.
- 354 non-SSPX research Mass rows across diocesan (46), ICKSP federated (104), CMRI (142), RCI (31), CSPV (19), and other small communities (12). This yields **967** v19 Mass rows including SSPX. This is a raw source-row sum, not a guaranteed deduplicated physical union.
- 196 FSSP schedule-backed venues appear in the default provider. Its **404** total venues/ministry rows must NOT be counted as 404 current Mass venues.
- The default ICKSP and IBP providers include additional schedules; ICKSP must be reconciled against the existing federated 104 before any global summation.

## 3. Targeted acquisition ranking

1. **Diocesan and approved-structure Masses:** decisive completeness gap. Our v19 diocesan corpus has 46 rows; Latin Mass Directory independently lists 1,573 venues across all approved-structure communities and the competitor categorises over 900 diocesan entries. Start with its USA, France, Poland, Italy, United Kingdom, Brazil and Germany cohorts, using official Mass evidence.
2. **SSPX official global gap:** reconcile our 613 with the Society's 798-worldwide statistic and the 941 diverse official institutional/place inventory. Do not interpret the statistical difference as an automatic list of new current public Mass venues.
3. **FSSP and ICKSP:** preserve 100% mapping of *already imported* records, then reconcile central, regional, and apostolate source inventories. This is a separate coverage dimension.
4. **Traditional institutes, monasteries and independent clergy:** classify independently and require evidence of public Mass (rather than only a residence).
5. **Competitor export:** use as a *discovery and discrepancy queue*, not an authority stronger than the official page. Require provenance and source dates; no automatic publishing based on third-party listings.

Useful additional discovery sources: [Latin Mass Society listings UK](https://lms.org.uk/mass-listings-map), [LMS church register](https://lms.org.uk/list-of-churches), [Una Voce Polonia](https://www.mszatrydencka.pl/), [FSSP North American locations](https://fssp.com/locations-list/), and [SSPX United States chapels](https://sspx.org/en/list-sspx-chapels).

## 4. Engineering and release acceptance

- Preserve a permanent **venue entity identity** independent of congregation, ministry, service and third-party directory record.
- Deduplicate on verified street/place identity with name aliases and overlapping schedules; multi-community worship at one church is still one physical venue.
- Treat `SOURCE_OFFICIAL_CURRENT_MASS`, `THIRD_PARTY_UNVERIFIED`, `PLANNED`, `INACTIVE`, `RESIDENCE_ONLY`, `AMBIGUOUS_DUPLICATE`, and `NO_PUBLIC_MASS_EVIDENCE` as different statuses.
- New source row only becomes publishable after crosswalking canonical identity and obtaining current Mass evidence from official source or first-hand verification. A link to the competitor without an original source is a lead only.
- Keep official source URL as primary action. Approximate geography remains optional, labelled, and non-routing. Do not spend time on street-level GPS for directory count goals.
- Reconcile source row counts, distinct physical current Mass venues, weekly/Sunday schedule availability, geographic indicative coverage and verification age **separately**.
- Preserve credit to Ad Orientem (adorientem.church) when using its structured data, plus links to the underlying original cited sources.
- Pass crosswalk integrity, duplicate fixtures, status filters, official URL checks, and existing Find UI regressions before merge.

## 5. Data access and outstanding blockers

A sample importer has been implemented with zero automatic publication, and a request for their bulk feed has been drafted but **not sent**. Without the feed or a sufficiently complete official source crosswalk, a claim of importing their 2,284 locations would be false. The benchmark snapshot is retained in `data/directory/research/adorientem-church-public-benchmark-20261009.v1.json`.

The defensible product target is **more than 2,284 deduplicated, evidence-backed active Mass venues**; reaching that requires an official/approved-structure bulk corpus, not copying a competitor's unverified entries.
