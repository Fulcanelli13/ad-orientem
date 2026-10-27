# CL26 — final host-building reference and new dated Mass source stream

**26 October 2026 · Research only · stacked over CL25 #1772.** Never alter the main Ad Orientem directory, actual future Mass calendar, the 39 frozen FSSP pilot source IDs, or the worldwide physical-site master.

## Geospatial audit: 38/39 research-supported named worship or host references

Bad Grönenbach's inherited CL20 **spatial conflict is resolved at research-identification level**, not at doorway level:

- **Ringeisenhaus** is the correct host building: [OSM way 304721616](https://mapcarta.com/W304721616), 47.87602, 10.21716, `building=civic` Pappenheimerstraße 2.
- **Schlosskapelle** is a separately named Catholic worship feature: [OSM way 1036283953](https://mapcarta.com/W1036283953), 47.87579, 10.21727, `amenity=place_of_worship`; it is not necessarily the footprint of the whole Ringeisenhaus. Its point is about 27 m from the host's centre.
- The **Hohes Schloss** itself is a **different** building: [OSM way 304720796](https://mapcarta.com/W304720796). It previously housed the chapel, but **not** today.
- The [municipality](https://rathaus.bad-groenenbach.de/sport-freizeit-und-kultur/rund-ums-hohe-schloss/hohes-schloss-ringeisenhaus-schlosskapelle.html?cHash=0176e313b9da0b653f459892de3b5b22&fsize=0) says the former brewery in the front of Ringeisenhaus was converted to the chapel in 1939 and inaugurated in December 1941. A separate named [Wikimedia Ringeisenhaus monument record](https://commons.wikimedia.org/wiki/Category:Ringeisen-Haus_(Bad_Gr%C3%B6nenbach)) affirms the host and Pappenheimerstraße 2.

Different POI and building centroids **cannot alone establish an entrance-location conflict**: the old 40–50 m discrepancy is preserved in the CL20 research record, while CL26 adds a documented host/chapel pairing with explicit null visitor entrance. Do not overwrite the old held row. All published building/door flags stay zero.

This changes research-supported georeferences from **37/39 to 38/39**. **37** are supported by a named worship-building/chapel reference rather than *only* a host footprint (Landsberg's upstairs Ignatiuskapelle remains host-building only); this is not public release.

## The one remaining spatial/access exception: Deining-Mittersthal

The exact publicly documented [FSSP local timetable](https://petrusbruderschaft.de/pages/wo-wir-sind/deutschland/niederlassungen/mittersthal/messzeiten.php) gives `Haus St. Stola`, An der Leiten 2: Tue/Wed/Thu 18:00, Sat 08:00, with Thursday adoration after Mass until midnight. Its [own historical page](https://petrusbruderschaft.de/pages/wo-wir-sind/deutschland/niederlassungen/mittersthal/home.php) also calls the religious house **St. Sola** and describes it as a renovated farmhouse.

These variants are aliases linked to one owner-described religious residence, **not** two different FSSP Mass venues. A named institutional public timetable and street address are evidence of operations; they **do not certify a public chapel-room centroid, precise door, or unrestricted visiting access**. The syndicated [GOCATH occurrence list](https://gocath.org/de/event/hl-messe-haus-st-stola) simply expands a recurring source rule into future dates and warns visitors to check the official source; it is **not an independent date-specific operator confirmation**. Research hold and zero public pin remain.

## A second explicit-date programme — Freiburg, not in 39-site pilot

[Summorum Pontificum Freiburg e.V.'s actual August–December 2026 Adelhauser Kirche programme](https://www.alte-messe.info/_files/ugd/b4efff_d54b6c671f3b4190b2b9356ebbb1540b.pdf), dated **30 July 2026**, individually lists 14 future `ordo vetus` Mass dates between 1 November and 27 December 2026. The PDF was inspected visually across both pages. These are **local-organizer date/time/venue witnesses**, not mechanically expanded recurring rules and not guarantees against later cancellations. The document describes `ordo vetus`; it does not independently certify a particular printed missal edition.

| Month | Explicit Mass occurrences | Details |
|---|---:|---|
| November 2026 | 6 | 1 Nov 10:00 (FSSP); 2 Nov 18:30 (Godo Ganz); 8 Nov 10:00 (FSSP); 15 Nov 10:00 (FSSP); 22 and 29 Nov 10:00 (Godo Ganz) |
| December 2026 | 8 | 6 Dec 10:00 (FSSP); 8 Dec 18:30 (Godo Ganz); 13 and 20 Dec 10:00 (FSSP); 24 Dec 20:00, 25–27 Dec 10:00 (Godo Ganz) |

**6** of the 14 are labelled `Priester der FSSP`; **8** explicitly name Pfarrer Godo Ganz, who should **not** be relabelled FSSP. The source's celebrant field is distinct from the liturgical-form field.

Freiburg is **outside** CL17's frozen 39 pilot owner-source sites. Its event records therefore use only an **external key**, no invented `CL14` / `CL17` IDs. Canonical/worldwide source-site deduplication is mandatory before any new physical-site claim. This phase adds **14 new individually listed external dates** to CL25's **7 individually listed Nürnberg dates** for **21 source-listed event candidates** across the two streams. No source-listed date is approved for publication.

## Release invariants and source confidence

- Actual public Mass times, map pins, verified doors, and Una Cum: **zero changes**.
- Stable cohort: **39** pilot sites, **74** inherited historic FSSP schedule patterns, **256 supported / 176 held** wording-evidence candidates.
- 2,584 `canonical_site`, 4,681 `mass_time` baseline rows; zero mutation.
- Distinct confidence classes: `EXPLICIT_LOCAL_ORGANIZER_FUTURE_DATE_AND_TIME` versus `SYNDICATED_RECURRENT_RULE_EXPANDED_INTO_DATES`.
- Operator-published specific future date is **not** the same as an independently approved Ad Orientem occurrence.
- €0 data collection and validation. Source provenance in permanent versioned text, not expiring workflow artifacts.

After CL2–CL25 rebuild, run:

```sh
python3 tools/directory/reconcile-cl26-final-geo-and-dated-external.py \
 --db /tmp/ao-cl26.sqlite --out-dir /tmp/ao-cl26
```

The validator asserts the unchanged frozen cohorts, prevents unrelated or secondary dates from entering the owner-dated set, checks the Ringeisenhaus/Schlosskapelle/Hohes-Schloss IDs, validates source-specific local dates/celebrants, writes research-only SQLite tables with public-release columns forced to zero, and produces a 39-site ledger, 14-date Freiburg CSV, source-grading CSV and JSON summary. CI rebuilds the full research chain.

**Next phase:** move beyond two dated source feeds through bulk acquisition of *operator-published dated* schedules and exception notices across organizations, with source snapshots and strict dedup against the existing Mass Times pipeline. Do not confuse liturgical ordos (feast-day classification) with physical scheduled Masses or impose the pilot's boundary on the worldwide register.


## 27 October consolidation: exact join to the existing unified physical-site master

**No new 39-site master, no new sites and no schedule ingestion.** Following duplicate-workstream consolidation [issue #1782](https://github.com/Fulcanelli13/ad-orientem/issues/1782), this PR now includes [`existing-cl2-39-site-exact-join.json`](existing-cl2-39-site-exact-join.json) to bridge original FSSP owner source entries to **the already-frozen CL2 worldwide research groups**.

- **39/39** local owner/source site entries match **39 existing CL2 research groups and 39 existing effective physical anchors** through the exact original `historical_row` ID. The 38 German source slots originate in CL14's `original_slot_locks` (**73** historical Mass rows), while the Potsdam hospital chapel joins through the CL17 record's frozen original Mass row **20**, giving **74/74** exact Mass-row references. This mapping does not use fuzzy names, postal approximations or new site admissions.
- The earlier **38 source-backed church/host building georeferences** are now explicitly attached to those existing physical group identities with their original CL20, CL22, CL23, CL24, CL25 or CL26 evidence paths: **5 + 1 + 17 + 8 + 6 + 1 = 38**. These are research references, not surveyed entrances or newly approved map pins.
- **Deining-Mittersthal Haus St Stola** remains the one location without independently verified public chapel geometry/access; do not publish a residence-based map pin. **Landsberg Ignatiuskapelle** is upstairs and the mapped Heilig Kreuz church is a host footprint only. **Potsdam** must map to St Josefskapelle, not Raum der Stille or the hospital vehicle entrance. **Bad Grönenbach** requires Ringeisenhaus/Schlosskapelle distinction. **Recklinghausen-Grullbad** parish-office closure does not prove St Joseph church closure.
- House/street-number conflicts flagged in the original sources (e.g. Hörmannsberg Meringerstraße **2 vs 4**, Amberg Deutsche Schulgasse **2 vs 4**) remain held from visitor-navigation promotion. Existing official site IDs, historical Mass rows and Uno Cum/rite classifications are unchanged.

The **existing CL26 GitHub Actions workflow** contains an additional fail-closed, direct original-row/group/anchor join check against all six original CL2 site shards and seven Mass shards. No parallel validation workflow or supplementary timetable programme has been created.

**Next physical-site decision:** use this crosswalk when adjudicating whether each *already existing* site record needs an additional church-feature or host-building reference in the single worldwide master, and preserve nonpublication/door-accuracy gates. There is no justification to mint 39 new site IDs. Date-specific schedule evidence belongs solely to the separate worldwide timetable owner PR #1775.
