# CL23 — complete geospatial screening of the 39-site German FSSP pilot

**26 October 2026 — research only.** Stacked above CL22 #1768, CL21 #1767, CL20 #1766, and the existing CL2–CL19 research lineage. No new venue master; original frozen group IDs and user-facing Mass register are unchanged.

This phase deliberately **shifts to a bulk pass rather than repeatedly investigating two entrances**. It covers **all 32 named FSSP pilot places without a sourced geospatial point after CL22**, matching every new point to one of the 39 existing owner-named source-place IDs.

## Coverage and actual strength

| Geospatial gate | Sites |
|---|---:|
| Already CL20 research-supported church building/site reference | 5 |
| CL22 corrected historical Potsdam St Josefs-Kapelle building reference | 1 |
| CL20 Bad Grönenbach spatially conflicting candidate — **held** | 1 |
| **CL23 new source-named church/chapel spatial references** | **17** |
| **CL23 sites still lacking a defensible church-specific spatial reference** | **15** |
| **Total screened pilot sites** | **39** |

Therefore **24/39** have some candidate geospatial reference; **23/39** have supported research-level source-named points, while Bad Grönenbach is held spatially. **None of the 24 has a published, independently approved worship-entrance GPS coordinate**.

The **17 new** records are not all identical quality:
- **6** named OpenStreetMap church building ways: Hannover St Clemens, Köln Maria Hilf, Saarlouis St Petrus Canisius/Canisianum, Neckarsulm Frauenkirche, München Catholic Allerheiligenkirche am Kreuz, and Wigratzbad Sühnekirche.
- **1** separately named OpenStreetMap *node* for Wigratzbad Seminarkapelle — a Catholic chapel POI, **not** an exact building outline. It is roughly 130 m from the Sühnekirche reference, so they cannot share a single chapel pin.
- **10** other named church site coordinates or church-specific points from city/heritage/Wikimedia, Catholic community or verified regional tourism sources. They are identity-located places, **not surveyed doorways or guaranteed building polygons**.

### Individual source-georeferenced records

| ID | Named church | Coordinate type | Primary location/source |
|---|---|---|---|
| 001 | Heidelberg St Anna | Church location | [Wikimedia named church Plöck 4](https://commons.wikimedia.org/wiki/Category:St._Anna_(Heidelberg)) |
| 002 | Kiel St Nikolaus | Church-specific POI | [Named St Nikolaus Kiel](https://aroundus.com/p/6566929-propsteikirche-st.-nikolaus) |
| 003 | Hannover Basilika St Clemens | OSM church way 357786647 | [Mapped Roman Catholic basilica](https://mapcarta.com/de/W357786647) |
| 004 | Düsseldorf-Volmerswerth St Dionysius | Named church location | [Dedicated historic church record](https://de.wikipedia.org/wiki/St._Dionysius_(D%C3%BCsseldorf)) |
| 005 | Wuppertal-Barmen St Antonius | Named church location | [Wikimedia church object](https://commons.wikimedia.org/wiki/Category:St._Antonius_(Wuppertal)) |
| 010 | Köln Maria Hilf | OSM way 225722089 | [Mapped Catholic church Rolandstraße 59](https://mapcarta.com/W225722089) |
| 012 | Odenthal Heilig-Kreuz-Kapelle | Named chapel object | [Wikimedia object location Klasmühle](https://commons.wikimedia.org/wiki/Category:Heilig-Kreuz-Kirche_(Odenthal)) |
| 013 | Lindlar-Frielingsdorf St Apollinaris | Heritage/cultural church point | [KuLaDig church-specific WGS84](https://www.kuladig.de/Objektansicht/KLD-261991) |
| 015 | Saarlouis St Petrus Canisius | OSM church way 733991343 | [Mapped old Canisianum church](https://mapcarta.com/de/W733991343) |
| 016 | Stuttgart-Zuffenhausen St Albert | Secondary named church coordinate | [Church building listing](https://dewiki.de/Lexikon/Liste_von_Sakralbauten_in_Stuttgart) |
| 019 | Neckarsulm Frauenkirche | OSM church way 43376158 | [Mapped Roman Catholic Frauenkirche](https://mapcarta.com/W43376158) |
| 020 | Munich Allerheiligenkirche am Kreuz | OSM church way 48605346 | [Mapped Catholic church at Kreuzstraße 10](https://mapcarta.com/de/W48605346) |
| 021 | Ingolstadt-Oberhaunstadt St Willibald | Wikimedia church-object location | [Named church map / OSM way 112979104](https://commons.wikimedia.org/wiki/Category:St._Willibald_(Oberhaunstadt)) |
| 027 | Wigratzbad Sühnekirche | OSM church way 87807590 | [Distinct Sühnekirche](https://mapcarta.com/W87807590) |
| 031 | Neumarkt St Jobst | Named church POI | [Outdooractive church](https://www.outdooractive.com/de/poi/bayerischer-jura/st.-jobst/2603398/) |
| 032 | Türkheim Kapuzinerkirche | Regional partner church POI | [Named church of the Immaculate Conception](https://www.outdooractive.com/en/poi/allgaeu/kapuzinerkirche-maria-unbefleckte-empfaengnis-tuerkheim/1701617/) |
| 033 | Wigratzbad Seminarkapelle | OSM chapel node 2789544934 | [Distinct Catholic seminary chapel POI](https://mapcarta.com/N2789544934) |

No OSM feature ID is invented for locations where the source gives only a named coordinate; each manifest entry preserves precisely what sort of map object its evidence actually supports.

## High-risk mismatches and required suppression

- **Saarlouis:** FSSP owner lists Canisianum **Stiftstraße 18**, while named OSM church way is at **Stiftstraße 20**. These may be adjacent access and postal references; preserve both and do not claim the specific street door.
- **Wuppertal St Antonius:** Wikimedia lists **Unterdörnen 139**, while city archives and FSSP use **137**. The church identity is supported; exact entrance address remains unapproved.
- **Ingolstadt St Willibald:** original FSSP lists **Dorfplatz 4**, whereas Wikimedia named church gives **Dorfplatz 5**. The named church object point is not a final navigational door.
- **Kiel St Nikolaus:** church, parish office and day nursery share references to **Rathausstraße 5**; choose the actual church object, not a kindergarten geocode.
- **Lindlar St Apollinaris:** [KuLaDig](https://www.kuladig.de/Objektansicht/KLD-261991) gives the **church-specific coordinate** around 51.04548/7.42666. An [Outdooractive hiking/parking route](https://www.outdooractive.com/de/route/wanderung/bergisches-land/rundwanderung-frielingsdorf/190886207/) gives 51.044566/7.424758, an approach/parking reference that must **not** be substituted for the church. Older recurring dates can differ from national FSSP; route and service gates stay separate.
- **Neumarkt St Jobst:** the owner parish Sunday 10:00 and 11:15 **contradict** FSSP's historical 10:15 recurring time. The spatial POI does not approve the timetable.
- **Türkheim Kapuzinerkirche:** a verified regional tourism page identifies the precise church by name but a different street approach than the FSSP national directory. Local FSSP warns its weekday evening Mass may move to the parish church. Do not always attach an event to the Kapuzinerkirche.
- **Stuttgart St Albert:** secondary city church coordinate is not confirmed as a polygon/doorway; 70439 vs 70435 postcode must be separately resolved.
- **Munich:** the named Catholic Allerheiligenkirche at Kreuzstraße 10 is **not** the homonymous Protestant Kreuzkirche. The previously FSSP-used Damenstiftskirche may be closed; no auto-substitution.
- **Wigratzbad:** Sühnekirche, Seminarkapelle and Gnadenkapelle are **different structures**, even when a dataset lists a shared Wigratzbad postal address. The prayer-site operator's ordinary-form service clocks cannot silently replace the FSSP programme.

### Remaining 15

The generated 15-row queue distinguishes a true lack of sourced named-worship coordinate from sites with a physical-identity, house-chapel, alternate-location or office/church risk. Priority examples include Nürnberg Catholic St Georg (Bierweg 35 church vs **33 parish office**), Bonn St Michael (different Rheinbacher Straße numbering), Nußdorf outlying St Leonhard rather than parish office, Landsberg's upstairs Ignatiuskapelle rather than a whole-church point, Deining's private house chapel, and Pingsheim St Martinus vs a different historic Erftstadt-Borr venue.

## Deterministic release-safe rebuild

Using Python 3 standard library, run existing CL2–CL22 research reconstruction and then:

```sh
python3 tools/directory/reconcile-cl23-full-spatial-screen.py \
 --db /tmp/ao-cl23.sqlite --out-dir /tmp/ao-cl23
```

The code dynamically subtracts the **6 CL20 candidate IDs plus CL22's 1 additional Potsdam ID** from the 39 frozen site identities. It requires exactly **32** unmatched sites, validates all **17** new evidence records against those IDs, and exports the remaining **15** without inventing coordinates.

Outputs: a 17-source candidate CSV, 15-site hold CSV, full **39-site spatial readiness register**, and JSON metrics. Adds only two research tables `cl23_georeferenced_worship_object` and `cl23_unlocated_pilot_site`, each with enforced **zero public approval** and foreign keys into the original CL17 source-site staging table. It does not mutate any original classification, physical anchor, address or schedule release.

**Publication remains 0**: door GPS, active future Mass recurrence, public map pins, current Mass times and Una Cum claims remain unapproved. Book-evidence coverage is still **256 supported / 176 held** among the 432 historical wording candidates.

The next evidence pass should resolve the 15 site-specific physical holds, then prioritize independently approved door points and future-date Mass rules separately. This is not a justification for mass-publishing the 23 research-supported church points without explicit quality-policy authorization.
