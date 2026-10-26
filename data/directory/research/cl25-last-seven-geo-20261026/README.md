# CL25 — close six of seven remaining German FSSP pilot spatial exceptions

**26 October 2026, strictly research only.** Stacked above CL24 #1771 and CL23 #1770. All 39 existing owner-named site IDs remain frozen. No alternate or new master venue is admitted.

## Results

| Gate | Count |
|---|---:|
| Frozen FSSP pilot worship places | 39 |
| Research-supported geographic building-level reference (including host building for upstairs chapel) | **37** |
| Specifically mapped exterior church/chapel building or church-site point (excluding host-only room) | **36** |
| Existing CL20 Bad Grönenbach spatial conflict | **1 held** |
| Deining-Mittersthal house chapel, no accepted public building coordinate | **1 held** |
| Independently approved church-door GPS | **0** |
| Public pins/current Mass instances/Una Cum promotions | **0** |

CL25 adds **six** source-grounded place references to CL24's 31: **five named mapped OSM buildings** (including one specifically identified *host building*, not chapel room) and **one named published church coordinate**. Their exact OSM identifiers, coordinate source URLs, owner/independent corroboration, geometry semantics and negative controls are recorded in `evidence.json`.

### Six newly geolocated worship places / host structure

| Frozen ID | Worship place | Research coordinate | Geometry and disambiguation |
|---|---|---|---|
| CL14-DE-FSSP-025 | Landsberg Ignatiuskapelle | 48.04950, 10.88024 | **HOST BUILDING ONLY**: Heilig Kreuz OSM way 87971830. Actual Ignatiuskapelle on floor 1 over sacristy, reported access by wooden stairs; NOT a mapped exact worship room or approved door |
| CL14-DE-FSSP-028 | Nürnberg Catholic St Georg | 49.487378, 11.112051 | Named Catholic church coordinate from published Nürnberger religious buildings index. NOT Bierweg 33 office, Bierweg 43 hall, or Protestant Kraftshof St Georg. No OSM church way independently identified |
| CL14-DE-FSSP-034 | Bonn St Michael | 50.73111, 7.08321 | OSM way 38572397, Catholic church building. Its map #8, parish operator #10 and FSSP international #13 are address variants; building is spatially identified, precise church entry is NOT |
| CL14-DE-FSSP-035 | Augsburg St Margareth | 48.36194, 10.90313 | OSM church way 89933886 at Spitalgasse 1. Different from nearby St Ulrich and other former convent facilities |
| CL14-DE-FSSP-037 | Garmisch Sebastianskapelle | 47.49535, 11.10875 | OSM Catholic chapel way 59100618, Münchner Str 1. Previously reported Ludwigstraße 81 variant not converted into a second worship place |
| CL14-DE-FSSP-038 | Blaibach St Elisabeth | 49.16642, 12.80857 | OSM Catholic church way 168435145, Kirchplatz 12. Parish office at Benefiziatengasse 9 must never inherit this footprint |

### Only remaining newly unlocated pilot place: private-house chapel

**CL14-DE-FSSP-036** is FSSP's `Haus St. Stola` at An der Leiten 2, Deining-Mittersthal (official FSSP spelling retained; independent listings sometimes say St Sola). A residential address without a distinct operator-verified chapel / permitted visitor-access point **is not approved as a public worship pin**. This protects the residents and avoids a fictional church geometry. The separately inherited Bad Grönenbach CL20 conflict is also still held.

## Source-dated calendar work started without publishing

The [local Nürnberg organizer](https://lateinische-messe-nuernberg.de/termine/) explicitly lists **seven future dates** (as of 26 October 2026) for the 1962 Mass at St Georg (18:00 local): 8 and 22 Nov; 13, 25 and 27 Dec 2026; 10 and 24 Jan 2027. The [Archdiocese of Bamberg](https://glauben.kirche-bamberg.de/gottesdienstzeiten/gottesdienste/ritus) explicitly says the Mass is temporarily in St Georg while work takes place in its previous St Anton venue. These are **operator-published proposed future occurrences** inside a research CSV, NOT independently editorial-approved Ad Orientem calendar entries. Do not infer further dates or automatic move back to St Anton.

### Material correction to the prior CL24 description

An earlier CL24 claim that St Joseph Recklinghausen-Grullbad was closed for structural reasons and weekday services moved to St Gertrudis **could not be verified** from the cited operator page. The [FSSP local Messzeiten/Termine page](https://petrusbruderschaft.de/pages/wo-wir-sind/deutschland/niederlassungen/recklinghausen/messzeitentermine.php) still lists St Joseph. The [parish page](https://stantonius.katholisch-re.de/seelsorge-kontakte/pfarrbuero) says the **St Joseph parish office** is currently closed, not the church. CL24 #1771 has been corrected at its source. CL25 carries that retraction as a permanent provenance and no-inference record. Neither presumed cancellation nor transfer nor the generic recurrence is sufficient for future-date publication.

## Reproducibility and zero-release invariant

The full CL2–25 CI rebuild runs the standard-library validator:

```sh
python3 tools/directory/reconcile-cl25-seven-spatial-exceptions.py \
  --db /tmp/ao-cl25.sqlite --out-dir /tmp/ao-cl25
```

(The SQLite DB must first be reconstructed with the existing CL2–24 scripts; the CI workflow does so in one step sequence.) It emits:

- `cl25_6_worship_or_host_geo_references.csv`
- `cl25_1_private_house_chapel_hold.csv`
- `cl25_7_dated_owner_mass_candidates.csv`
- `cl25_39_site_spatial_readiness.csv`
- `cl25_summary.json`

Four additive research tables track geometry, private-chapel hold, dated source-listed candidates, and operational source conflicts. SQLite enforces zero public pins, zero approved future dates, and no surveyed entrances. Original canonical 2,584 places, 4,681 `mass_time` rows, 74 frozen historical German FSSP recurring patterns, 256 supported/176 held book evidence, and Una Cum remain unchanged.

**Next action:** resolve Bad Grönenbach spatial discordance at the object level, privately establish whether the Mittersthal house chapel supports a public-facing building point, and scale operator-dated Mass candidate verification beyond one exemplary 7-date series. The entire worldwide register is much larger than this 39-site pilot; pilot coverage does not equal worldwide completion.
