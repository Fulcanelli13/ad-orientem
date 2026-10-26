# CL20 — source-georeferenced building points, not invented church-door pins

**26 October 2026. Research-only staged on CL19 PR #1763.**

The 39-location source-identity pilot reached full source-screen coverage in CL19. CL20 starts the precise spatial gate using high-risk addresses and independently named churches. This phase does **not** replace the existing canonical venue master with another map, nor infer that a building centroid is the public worship entrance.

## 7 site investigations, six coordinates proposed, five research-eligible

| Source site | Research building point | Evidence maturity | Open blocker |
|---|---|---|---|
| Ried-Hörmannsberg St Peter & Paul | 48.28306, 11.02163 | **Research-level mapped church building**: OSM building way + named Wikimedia Catholic church | Meringer Straße **2 vs 4** and visitor doorway |
| Amberg Schulkirche St Augustinus | 49.44562, 11.85514 | **Research-level mapped church building**: OSM Catholic church way and Outdooractive point | Deutsche Schulgasse **2 vs 4**; dated photograph of marker near door is not surveyed doorway |
| Amberg Wallfahrtskirche Maria Hilf | approx. 49.4529, 11.8710 | **Research-level named church POI** confirmed with second church map | Church #4 vs monastery/operator mailing #3; door not established |
| Schwäbisch Gmünd St Leonhardskirche | 48.80303, 9.80474 | **Research-level named OSM church building** + city church identity | Friedhofstraße **2** vs Aalener Straße **2** approaches; Herrgottsruh chapel is separate |
| Eichstätt Heilig Kreuz | 48.88995784685476, 11.1907285451889 | **Research-level church-specific regional tourism coordinate** with further pilgrimage POI | Footprint point, **not** precise entrance |
| Bad Grönenbach Schlosskapelle | tentative 47.87579, 10.21727 | **HELD**: mapped Roman Catholic chapel and another reference disagree by several dozen metres | Correct room is in **Ringeisenhaus**, *not* neighbouring castle; doorway and mapped outline conflict |
| Potsdam St Josefs-Kapelle | **No church coordinate accepted** | **HELD**: nearby OSM `Raum der Stille` mapped to chapel way 31290074, but not proven same historic St Josefs chapel where Sunday 17:00 Mass occurs | Wrong-object risk; identify worship room rather than map another hospital space |

The six first sites are source-backed spatial candidates. **Only five** currently pass the *research building-reference* gate; zero pass **entrance-coordinate** or **publication** gates. The seventh Potsdam observation is an excluded map-object hypothesis, not a candidate geocoordinate.

## Verified travel access vs worship-door precision

The [Alexianer hospital operator](https://www.alexianer-potsdam.de/orientierung) explicitly instructs visitors arriving by **vehicle** to enter the campus via **Zimmerstraße 6**; the Allee nach Sanssouci 7 vehicular access reaches Haus St Josef only for drop-off and does not provide through passage to campus parking. Its [chapel page](https://www.alexianer-potsdam.de/st-josefs-kapelle) identifies St Josefs-Kapelle at Allee nach Sanssouci 7 and Sunday 17:00 Tridentine Mass. The building mapped as `Raum der Stille` is NOT yet proven to be the same chapel. Preserve a **verified operator-provided vehicle route** but do not mislabel it as an approved chapel-door GPS point.

Amberg Schulkirche has an independent photographed [historic marker near the church entrance](https://www.hmdb.org/m.asp?m=242442), approximately 49.4454833, 11.8549333. The marker's coordinates are **near the entrance**, not a church-door coordinate. Its OSM building center 49.44562, 11.85514 must not be substituted for the photographed marker or actual door without visual inspection.

## Provenance of mapped church points

- [Hörmannsberg mapped Catholic church way 124192379](https://mapcarta.com/de/W124192379), independently named [Wikimedia church record](https://commons.wikimedia.org/wiki/Category:St._Peter_und_Paul_(H%C3%B6rmannsberg)).
- [Amberg Schulkirche mapped Catholic way 52739490](https://mapcarta.com/W52739490), compared with [Outdooractive church point](https://www.outdooractive.com/de/poi/bayerischer-jura/schulkirche/2607904/).
- [Maria Hilf church POI](https://mapcarta.com/35839988), compared with [church-specific other POI](https://www.blutana.de/sehenswuerdigkeiten/Kirche%2BMaria%2BHilf-Amberg-9229.html) and [operator monastery contact](https://www.mariahilfberg-amberg.de/kontakt-428765.html).
- [St Leonhardskirche way 253934498](https://mapcarta.com/de/W253934498) compared to [city church identity](https://www.schwaebisch-gmuend.de/adressdetails.html?adrId=2078).
- [Eichstätt specific church address and coordinates from regional tourism](https://en.naturpark-altmuehltal.de/sehenswertes/ehemalige_kapuzinerkirche_heil-1753/?setLanguage=en), with [second pilgrimage/church POI](https://www.outdooractive.com/de/poi/altmuehltal/eichstaett-hl.-kreuz-kirche/64307374/).
- [Bad Grönenbach named OSM chapel way](https://mapcarta.com/W1036283953) and [municipality's separate Ringeisenhaus explanation](https://rathaus.bad-groenenbach.de/sport-freizeit-und-kultur/rund-ums-hohe-schloss/hohes-schloss-ringeisenhaus-schlosskapelle.html?cHash=0176e313b9da0b653f459892de3b5b22&fsize=0). **Do not use the neighbouring [Hohes Schloss way](https://mapcarta.com/W304720796).**

## Rebuild

From the full frozen CL2–CL19 research SQLite described in the CL19 workflow:

```sh
python3 tools/directory/reconcile-cl20-geospatial-candidates.py \
 --db /tmp/ao-cl20.sqlite --out-dir /tmp/ao-cl20
```

This validates source-place IDs against CL17's 39 owner-named sites and CL18/19 second-source identity tables. It calculates geodesic differences between published reference points, intentionally excludes Amberg's photographed **entrance marker** from church-footprint spatial agreement, asserts the Bad Grönenbach discrepancy is held, and explicitly rejects Potsdam's potentially unrelated `Raum der Stille` object.

Generated research-only tables: `cl20_building_spatial_candidate` (6), `cl20_rejected_object_hypothesis` (1). Outputs include six sourced candidate coordinates, two held spatial/object exceptions, confirmed Potsdam vehicle-access instructions and a summary JSON. Permanent input source citations and software are versioned in GitHub, independent of expiring free Actions downloads.

**No releases:** 0 confirmed church-door coordinates, 0 canonical physical updates, 0 public map pins, 0 approved current Mass recurrences, 0 Una Cum assertions. The prior **256 / 432** book evidence cohort and **74** pilot Mass rows are unchanged.

## Next physical gate

Identify precise visitor entrances via official parish/chapel plans or geographically identified doorways, not address matching alone. Prioritize Amberg Schulkirche (dated visible entrance evidence), Eichstätt Heilig Kreuz (regional tourism building pin), Bad Grönenbach Ringeisenhaus (room/footprint discrepancy), and Potsdam hospital chapel (possible wrong OSM building). Once a specific entrance is evidenced and source authority confirmed, it can be proposed for a separate editorial geocode approval; only thereafter combine it with dated Mass-schedule validation for possible app publication.
