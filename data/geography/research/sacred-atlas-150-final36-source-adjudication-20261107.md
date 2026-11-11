# Sacred Atlas — second-cohort 150 source-scope closure (7 November 2026)

**Status: RESEARCH ONLY.** This closes the *first source-scope adjudication* of all **150** standard/qualified candidates from the 243 complement cohort. It **does not certify 150 physical sites**, verify source-point correspondence, reserve new canonical Place IDs or approve publication.

## Review ledger

| Batch | Source-scope adjudications | Key distinction |
| --- | ---: | --- |
| Previous first pass | 59 | Named-site vs scope qualification |
| Subsequent institutional pass | 38 | Custodians, classification, compound sites |
| Subsequent third pass | 17 | Tourism, diocesan and religious sources |
| Final worldwide pass | **36** | **31 corroborated named-site/complex scopes; 5 explicit holds** |
| **Combined** | **150 / 150** | **All source candidates routed, none approved for import** |

The machine-readable [150-record evidence board](./sacred-atlas-150-source-scope-evidence-20261107.v1.json) stores each inspected URL and scope qualification. These source checks are **not** an entryway GPS certification, a source-rights determination or an owner publication decision.

## Final pass — geographical results

**Mexico — 7/7 source adjudications.** INAH and named diocesan/governmental records cover: Catedral Puebla (`SG-INV-0443`), Catedral Metropolitana de México (`0442`), San Miguel del Milagro (`0438`), Señor de los Rayos Temastián (`0436`), Santo Niño de Atocha Plateros (`0439`), Señor de Chalma (`0435`), and Nuestra Señora de los Remedios above the Great Pyramid at Cholula (`0433`). For Cholula the physical church **above the pyramid**, not the archaeological park or pyramid's visitors' entrance, is the target. A municipal INAH monument record marked in-process must not be called fully certified. Sources are linked individually in the JSON.

**Peru — 3/3.** Ministry of Foreign Trade and Tourism (MINCETUR) inventory 3354 identifies Santa Rosa de Lima sanctuary/basilica at Av Tacna block 1, its house/garden and museum; inventory 34 identifies the historic **Cocharcas temple in Chincheros, Apurímac**, restored 2022 with semi-restricted access, not a distinct similarly dedicated shrine at Orcotuna/Junín or Lima. Archdiocese of Lima corroborates Las Nazarenas sanctuary of Señor de los Milagros.

**Europe — 7/7:** Speyer Cathedral official cathedral chapter; Sümeg Franciscan pilgrimage church via municipal heritage record; Pažaislis via Kaunas municipality (now Sisters of St Casimir, *not* Camaldolese); Maria Radna via Diocese of Timișoara (now diocesan clergy, *not* Franciscans); Slovenian Sveta Gora Marian basilica via Franciscan province; Slovakia Skalka via its custodian (two separate precincts, **Malá Skalka shrine versus Veľká Skalka former abbey**, whose visitor access closed Oct 31 2026); France Blanot **hold** because the historical devotion is not independent proof of a separate physical "Eucharistic miracle chapel" beyond the parish church.

**Other Americas — 4/5 independently site corroborated; one hold:** Ujarrás in Costa Rica has **an active sanctuary in Paraíso town distinct from ancient ruins in Ujarrás valley**, with a 6 km pilgrimage between them; Guatemala's Cerrito del Carmen church has secondary historic local-source corroboration pending better institutional page; Venezuela's **La Grita** has **two** different places (Basílica del Espíritu Santo and diocesan Santo Cristo sanctuary); Margarita has a diocesan basilica with custodian address; Cupey, Puerto Rico is held because visitor reporting describes a Cross/Stations and *future* church project, not independently verified completed church/shrine structure. Uruguay's Verdún (separate row) has national status encompassing hilltop statue, chapel, Way of Cross and retreat house, per episcopal conference.

**Asia-Pacific and Middle East — site-specific qualified:** Goa-Tivim is a church of Our Lady of Perpetual Succour, **not demonstrated to be a physically distinct formally designated sanctuary**; Anjara has both Marian church and venerated cave; Qannoubine monastery is **within** UNESCO Qadisha Valley but must not inherit valley centroid; Mantara Maghdouché is **Melkite Greek Catholic** grotto/church/tower complex; Colombo Kochchikade St Anthony Church identified by archdiocese, formal *National Shrine* title separately qualified; Bataan national shrine of John Paul II is at **Culis, Hermosa**, not undifferentiated Bataan; Timor-Leste's **Aitara hilltop chapel** is distinct from Soibada parish; **Dili Our Lady of Fátima shrine held** because archdiocese lists similarly named Fatima shrines outside Dili city and no distinct city shrine building is identified; Sở Kiện Vietnam minor basilica and martyrs' pilgrimage museum are different precinct features. Hanceville Our Lady of the Angels monastery and public Shrine of Most Blessed Sacrament are related campus facilities, not an automatically duplicative Place.

**Africa — source-specific outcomes:** Togo's *Notre-Dame du Lac* is corroborated by the Diocese of Aného and Vatican papal visit records. **Correct a false origin claim:** the Diocese of Aného reports an apparition narrative that followed establishment of the sanctuary, not a miracle that founded it. Lubumbashi Sainte-Marie **held** (third-party directory and Mapcarta/OSM only, primary source not resolved). Lodonga Basilica BVM **held** (GCatholic says basilica minor since 1961, but the pass lacked independent diocesan/physical church documentation).

## Five non-admission holds — do not silently promote

| Candidate | Blocker |
| --- | --- |
| `CL-CD-20261105-28` | Sainte-Marie Lubumbashi: no independent primary physical church match |
| `SG-INV-0023` | Blanot: special Eucharistic-miracle **chapel** may be a devotional feature of parish church, not established as separate building |
| `SG-INV-0471` | Cupey: planned church vs existing pilgrimage outdoor features |
| `SG-INV-0683` | Dili Fátima: ambiguous location among Fatubessi, Ramelau and Dili city |
| `CL-UG-20261105-26` | Lodonga: asserted basilica title and church building not independently corroborated |

**All five remain researched/held; they are not rejected as necessarily nonexistent.** This first source stage also leaves other titles and physical-feature details qualified (notably Colombia/Philippines/heritage/sources from prior passes).

## Remaining work, in order

1. **Coordinate/identity phase across all 243 complement candidates:** resolve the **40 missing staged latitude/longitude fields**, the **10 near-existing-place proximity flags**, and linked building/precinct distinctions, accepting illustrative points only with evidence and explicit owner decision.
2. **Nine missing country-area prerequisites:** `AM`, `BF`, `CY`, `ET`, `HT`, `TL`, `TN`, `TR`, `XK`. The country-area structure must be reviewed for actual eligible candidates and entered in a separately checked append-only manifest; not an automatic production change.
3. **Owner review:** keep the earlier first-cohort **169** distinct from complementary **243**, with 166+150 preliminarily presentable *at different review stages*, no approval inferred. The wider 243 includes 30 missing-coordinate, 23 historic-Catholic heritage, 30 non-Catholic heritage, six P107 separate-draft, two link-only reuse, two original identity-hold candidates and the 150 processed here.
4. **GitHub branch synchronization and CI** with advancing `main` before **any** owner-approved release; do not merge or publish the research branch solely because the source pass is complete. Public Atlas stays at **530**, research draft at **535**.

No Vercel deployment; GitHub Actions and GitHub Pages only.
