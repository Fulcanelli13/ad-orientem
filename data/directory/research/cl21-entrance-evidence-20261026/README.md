# CL21 — identify actual worship portals and explicitly veto wrong map objects

**26 October 2026. Research only, stacked above CL20 PR #1766.** The existing site register and published Ad Orientem mass directory remain untouched.

CL20 found six mapped building/chapel spatial candidates for the German FSSP Mass release pilot, five accepted at **research-level building** scope and one held spatially. A seventh place, Potsdam, had an OSM campus quiet-room hypothesis explicitly held. CL21 addresses the **next distinct evidence gate: exterior entrance and approach identity** for all seven locations.

## Results

| Site | New entrance/access evidence | Geographic release |
|---|---|---|
| Amberg Schulkirche St Augustinus | Authoritative [Dehio architectural inventory](https://de.dehio.org/ausstattungsobjekt/amberg-sog-deutsche-schulkirche-st-augustinus-kanzel) explicitly places a sculpted main portal on the **southwest façade**. [Photographed historical marker](https://www.hmdb.org/m.asp?m=242442) is near that area, but its mapped point is not a survey of the portal. | **No verified GPS doorway** |
| Amberg Maria Hilf | [Sanctuary history](https://www.mariahilfberg-amberg.de/geschichte-428638.html) locates **main façade/central portal at the head of monumental steps**. A dated [May–July 2020 operator notice](https://www.mariahilfberg-amberg.de/eh-content/pages/14450/files/autoupload/dokumente/4_GDO_v-_18-05-_bis_12-07-2020.pdf) closed the main portal and used the side entrance. That historic exception cannot be assumed still active in 2026. | Main portal physically identifiable; **operational door unspecified** |
| Hörmannsberg St Peter & Paul | [Bavarian public broadcaster](https://www.br.de/radio/br-heimat/sendungen/zwoelfuhrlaeuten/schwaben/12uhr-hoermannsberg-schwaben100.html) identifies a **Gothic church portal**, but provides neither its facade bearing nor mapped doorway point. | Entrance side unknown |
| Eichstätt Heilig Kreuz | [City](https://www.eichstaett.de/sehenswertes/ehemalige_kapuzinerkirche_heil-1753/) gives church approach via **Kapuzinergasse from Ostenstraße**, and address Kapuzinergasse 2. The text's **three entrances to the Holy Sepulchre inside the church** must not be misread as three church exterior doors. | Building known; exterior door point unknown |
| Schwäbisch Gmünd St Leonhard | [Municipal church](https://www.schwaebisch-gmuend.de/adressdetails.html?adrId=2078) uses **Friedhofstraße 2** while heritage/FSSP uses **Aalener Straße 2** for the cemetery chapel. Nearby **Herrgottsruhkapelle** at Aalener Straße 4 is a different chapel. | Cemetery access/chapel door unresolved |
| Bad Grönenbach Schlosskapelle | [Municipality](https://www.bad-groenenbach.de/kultur-sehenswertes/sehenswertes/hohesschlossschlosskapelle) says the Mass chapel occupies the **front former brewery section of Ringeisenhaus**, next to—not inside—the Hohes Schloss. The CL20 mapped geometry disagreement remains. | Exact chapel room/door held |
| Potsdam St Josefs-Kapelle | Hospital [St Josefs chapel](https://www.alexianer-potsdam.de/st-josefs-kapelle) identifies the historic **two-leaf entrance**, gilded St Josephs Capelle inscription, and a St Joseph statue above the arch. Hospital [chaplaincy page](https://www.alexianer-potsdam.de/st-josefs-krankenhaus/unternehmen/seelsorge) confirms **Auferstehungskapelle / Raum der Stille is another chapel beside St Josefs**. The [patient-garden quiet chapel](https://www.alexianer-potsdam.de/st-josefs-krankenhaus/informationen-zu-aufenthalt-und-besuch/besondere-angebote/raum-der-stille) is accessed from the cafeteria. Operator [vehicle instructions](https://www.alexianer-potsdam.de/orientierung): **Zimmerstraße 6** for campus driving; **Allee nach Sanssouci 7** for Haus St Josef drop-off only, no through road. | **Do not map quiet-room OSM way 31290074 as St Josefs Mass chapel**. Historic chapel-door coordinate pending |

## Five explicit geographic false-positive exclusions

The research database now carries a dedicated `cl21_excluded_wrong_target` table preventing:
1. Potsdam `Raum der Stille / Auferstehungskapelle` — distinct from St Josefs Sunday 17:00 Mass chapel; no use of OSM way 31290074.
2. Bad Grönenbach `Hohes Schloss` — separate from its neighbouring Ringeisenhaus Schlosskapelle; do not use castle map way 304720796.
3. Schwäbisch Gmünd `Herrgottsruhkapelle` — distinct from St Leonhard cemetery church.
4. Eichstätt *interior Holy Sepulchre doorways* — no external doorway coordinates can be inferred.
5. Amberg Maria Hilf Franciscan monastery gate/contact address — not proof of which church portal is open for Mass.

These are **prohibitions on incorrect map matching**, not accepted door GPS points.

## What CL21 actually achieves

- **7/7** targeted entrances/address approaches reviewed against named, linked sources, retaining the same original CL17 physical group IDs.
- **3** entrance-architecture records with a distinctive exterior portal or owner main-door description (Amberg St Augustinus, Maria Hilf, Potsdam St Josefs).
- **5** explicitly disallowed wrong target map features/entrance interpretations.
- **0** door-coordinate approvals, **0** currently certified Mass-operation entrance gates, **0** public pins/directions and **0** newly approved future-dated Mass schedules.
- The **39** staged German owner sites, **74** pilot Mass rows, and wider **256 accepted/176 held** source-scoped book-evidence statistics remain unchanged.

A photographed door, architectural facade or tourism building point is not necessarily a GPS-surveyed, currently accessible church entrance. Published route cards must never be generated from the CL21 *unreleased research navigation notes*.

## Reproduction and permanence

Rebuild the existing CL2–CL20 SQLite research index using the documented [CL20 CI workflow](../../../../.github/workflows/directory-cl20-geospatial-candidates.yml), then run:

```sh
python3 tools/directory/reconcile-cl21-entrance-evidence.py \
  --db /tmp/ao-cl21.sqlite --out-dir /tmp/ao-cl21
```

This appends only `cl21_entrance_evidence` and `cl21_excluded_wrong_target` to the research SQLite. It verifies exact site IDs, source URLs and existence of CL20 building candidates, keeps all door coordinates **null**, and applies database `CHECK` constraints enforcing zero public approval. Its output comprises `cl21_seven_entrance_and_approach_evidence_grades.csv`, `cl21_five_explicit_wrong_object_exclusions.csv` and `cl21_summary.json`. All sources and scripts are permanently versioned in GitHub, not dependent on one-day expiring Actions artifacts.

**Next**: targeted geographic confirmation of southwest church portal at Amberg St Augustinus and historical double-leaf chapel door at Potsdam, then current-owner church-entry instructions for Amberg Maria Hilf, followed by separate door coordinates and dated Mass-recurring confirmation. Site-address precision without a specific usable worship door must remain research-only.
