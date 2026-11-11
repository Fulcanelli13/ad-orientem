# Sacred Atlas — 243 complement geographic reconciliation, first complete pass
**7 November 2026 · Draft-only. No canonical Place or country-area insertion.**

This research checkpoint converts the 243 complementary Claude candidate roster into a coordinate/physical-identity decision ledger. It makes **no owner-approval inference** and does not publish pins.

## Missing latitude/longitude: all 40 source rows classified

| Decision | Records | Consequence |
| --- | ---: | --- |
| Site-level illustrative coordinate backed by official, OSM or mapped heritage data | **14** | Candidate site point staged, **not** a verified church entrance or publication |
| Coordinate located, but additional geometry or intended-building evidence needed | **7** | Source-attributed research lead staged, **not** release-ready |
| Missing-coordinate F-lane identity/title unresolved | **9** | No point assigned until identity/building clarified |
| Other lanes that must **not** trigger a new Catholic venue pin | **10** | 6 non-Catholic heritage; 1 historic Catholic heritage; 1 identity hold; 2 linked/reused canonical Places |
| **Original missing-point rows** | **40** | 21 candidate positions, 19 no position, zero imports |

The [complete 30-case missing-coordinate board](./sacred-atlas-243-30-missing-coordinates-20261107.v1.json) carries all 21 candidate coordinates, source URL, precision type, critical scope qualification and nine named holds. The ten no-new-pin original IDs are preserved separately.

### Strong coordinates and source-specific cautions

- **Le Barroux:** the Abbey itself supplies latitude **44.152875, longitude 5.098385** on its driving directions page; visitor/grounds marker only, not entrance. https://www.barroux.org/comment-venir-au-monastere/
- **Nepomuk:** Plzeň Diocese supplies **49.485329, 13.580676**; correct church name is Saint John of Nepomuk. The earlier church of Saint John Baptist was replaced at this location, so the source combined dedication is misleading. https://www.bip.cz/cs/katalog/kostely/filialni-kostel-sv-jana-nepomuckeho
- **Kirkkokari:** Finnish heritage service gives **61.14742089, 22.3255635** for the small Lake Köyliö island; this is medieval Catholic heritage, not a present parish. https://www.kyppi.fi/palveluikkuna/mjreki/read/asp/r_kohde_det.aspx?KOHDE_ID=319010019
- **Kildare Saint Brigid well:** Tully site **53.14276, -6.90804**, OpenStreetMap node 451716106, matches the Tully County Kildare historic well. A differently named St Brigid well near **Kilcullen 53.1294,-6.74184** is **not** the target. https://mapcarta.com/N451716106 and https://ihwcbc.omeka.net/items/show/289
- **Divino Niño, Bogotá:** OSM religious precinct **4.56836,-74.09584** in barrio 20 de Julio, distinct from portal bus and neighboring convent. https://mapcarta.com/es/W1393672774
- **Otuzco:** OSM Catholic sanctuary/church polygon **-7.9018,-78.56577** matching MINCETUR inventory 4027, opposite Plaza de Armas. https://mapcarta.com/W897994016
- **Portobelo:** **9.5541,-79.65466** at Iglesia San Felipe holding the Black Christ image, not a separate sanctuary building. https://mapcarta.com/36846084
- **León, Nicaragua:** active Iglesia La Merced **12.4365,-86.87903**. Do not use identically named ruins at **12.39895,-86.61717**, which are actually León Viejo. https://mapcarta.com/W305067006
- **Wellington:** Chapel of Our Lady of Compassion building **-41.32884,174.77066**, rather than center of the historic institution or current retirement/retreat grounds. https://mapcarta.com/W326643170 and https://www.compassion.org.nz/retreat-centre/chapel-of-our-lady-of-compassion
- **Quillacollo:** OSM San Ildefonso church **-17.39834,-66.28153**. A church-related Marian shrine is established there, but a proposed new Urkupiña basilica or Cerro de Cota site are different geographic features. This coordinate remains in **feature-identity review**, not the ready group. https://mapcarta.com/es/W207815827
- **Santa Rosa/Barquisimeto:** **10.05958,-69.27014** belongs to Santa Rosa Church/Divina Pastora sanctuary, not downtown Parroquia Divina Pastora. Confirmed address from the archdiocese. https://arquidiocesisdebarquisimeto.org/directorio/parroquias/parroquia-santa-rosa-de-lima/
- **Bagamoyo:** Holy Ghost Mission geotag **-6.43449722,38.89851667** covers Catholic historic mission, museum and church precinct; no fake museum-door coordinate. https://commons.wikimedia.org/wiki/Category:Holy_Ghost_Catholic_Mission_%28Bagamoyo%29

Additional positions are documented for Limpias, Kfifan, Diriomo, Onitsha, Rakunai, Ermesinde, Šmarje, Letychiv and Saint Cono, each with appropriate evidence strength, building distinctions and holds.

**Nine actionable identity/title holds without a proposed point:** Lembah Karmel (`SG-INV-0679`), Bergamo Madonna della Neve (`SG-INV-0071`), Kingston Angels (`SG-INV-0475`), Kuala Lumpur Saint Jude (`SG-INV-0676`), Echt generic Marian chapel (`SG-INV-0230`), Sittard generic Marian chapel (`SG-INV-0229`), Amsterdam Heilige Stede (`SG-INV-0233`), Colonia vs Carmelo Uruguay (`SG-INV-0534`), and Tshitanini Benedict Daswa (`SG-INV-0723`). Importing broad city coordinates here would risk misleading identity rather than solve the problem.

## Ten provisional points within 500 metres of the existing production registry

[Ten detailed source-nearest decisions](./sacred-atlas-243-proximity-area-decisions-20261107.v1.json) preserve original Stage25 distance metres and nearest Place ID.

**Nine are distinct sites or historic/non-Catholic heritage sites, not duplicate buildings:** Stará Boleslav Assumption vs St Wenceslas; Paris Sainte-Chapelle vs Notre-Dame; Mount of Olives Ascension chapel vs Dominus Flevit; Mount of Olives Pater Noster vs Dominus Flevit; Old Goa Saint Catherine/Se Cathedral vs Bom Jesus; Rome Santa Cecilia vs San Bartolomeo all'Isola; Trondheim Nidaros (Church of Norway) vs Catholic St Olav; Lima St Rose sanctuary vs Santo Domingo; Bethlehem St Catherine vs shared Church of Nativity.

**One remains a real possible duplicate:** `SG-INV-0654`, Tarlac Holy Cross, is 68.4m from the existing Risen Christ Chapel pin and cannot be admitted as a second Catholic building until the chapel/site identity is independently reconciled.

**Both proximity cases below 100m require different treatment:** Bethlehem St Catherine is independently a distinct adjacent Latin Catholic church (~29.3m), whereas Tarlac ~68.4m is identity-held. Distance is not a deduplication decision.

## Nine missing country-area definitions: only five are active-intake prerequisites

| Code | Country | Decision | Active Catholic candidate IDs |
| --- | --- | --- | --- |
| BF | Burkina Faso | Stage country-area proposal | `SG-INV-0727` Yagma |
| HT | Haiti | Stage country-area proposal | `SG-INV-0470` Port-au-Prince Perpetual Help |
| TL | Timor-Leste | Stage country-area proposal | `SG-INV-0682`, `SG-INV-0683` (latter physical identity held) |
| TR | Türkiye | Stage country-area proposal | `SG-INV-0364` Izmir Polycarp, `SG-INV-0361` Ephesus House of Mary |
| XK | Kosovo | Stage location-code proposal | `SG-INV-0349` Letnica |
| AM / CY / ET / TN | Armenia / Cyprus / Ethiopia / Tunisia | Heritage-only proposals deferred | No candidate in 150 standard/qualified/current Catholic map-intake lanes |

The `XK` code is a **pragmatic Kosovo operational identifier**, **not** a formally assigned ISO 3166-1 alpha-2 code. Preserve this distinction before inserting any `codes.iso_alpha2` entry. No civil-area objects have been inserted into `seed-registry.v1.json`; this is a typed preflight.

## Engineering and publication guardrails

The [new regression test](../../../tests/sacred-atlas-243-geographic-reconciliation.mjs) runs from Sacred Geography R87 on the draft branch. It checks **40 = 21 + 9 + 10**, exactly 14/7 differentiated point proposals, nine holds, ten near-production sites with separate identity outcomes, nine missing areas split 5/4, official vs provisional Kosovo semantics, 535 existing draft Places unchanged, and all owner/publication gates set false.

**Next:** independently resolve or classify the **nine remaining actionable F-lane identity holds**, confirm seven lower-tier coordinate leads and ask for owner approval of precise feature identities only when needed. The 169 first intake and 243 complement remain separate. Do not create pins for records that represent existing linked Places or non-Catholic heritage in the Catholic Atlas. GitHub Actions + GitHub Pages only, never Vercel.
