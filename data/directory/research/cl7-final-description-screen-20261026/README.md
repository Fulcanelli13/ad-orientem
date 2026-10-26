# CL7 — 13 additional sourced physical descriptions, 36 gaps left

**26 October 2026 · additive research, stacked on CL6 PR #1740.** This is not an application import, a new venue master, a release of Mass times or an endorsement of an external map pin.

## Outcome

- 13 physical-site descriptions, each matched to a previously **blank frozen CL2 historical group ID** and its effective physical anchor, added with source URL, evidence class, physical-site type, exact/street-only precision and limitations.
- Original description backlog **806 -> 49 after CL6 -> 36 after CL7**. Cumulative **770 / 806 (95.5%)** research descriptions now present.
- All 49 CL6-open description IDs were processed: 13 physical backfills, 36 still held. Neither city-level text nor raw inherited coordinates count as a new description.
- All 40 CL2 identity-exception flags remain open because this batch does **not** canonically admit B92-only sources; the 10 B92 source-only leads remain held for first-party crosschecking.
- The **2,579 distinct CL2 research physical anchors**, 2,584 historical IDs, 4,681 historical Mass rows and 3,347 historical VERIFIED labels remain untouched. No current-schedule release or public pin.

## Site-by-site evidence

| Frozen group | Physical building/address | Evidence | Special restriction |
|---|---|---|---|
| `RG-EC296D81D4FE` | St Mary's Church, **1043 Isabella St**, Linwood, Ontario | [Geolocated church building record](https://commons.wikimedia.org/wiki/Category:Saint_Mary_Church_(Linwood,_Ontario)) | Chaplain's [office is separately 1039 Isabella](https://stmaryslmc.ca/our-chaplain/); must not conflate church and office |
| `RG-D7F96C683345` | Holy Family, **Riverside Dr**, Britt, Ontario | [Latin Mass venue location](https://www.latinmassdir.org/venue/eglise-de-la-sainte-famille-holy-family-church-britt-canada/) | Street number disputed between Riverside Dr and Highway 526 cataloguing. No exact number promoted |
| `RG-D9AE63BE9AF8` | Our Lady of Mount Carmel, **51 Albert St E**, Hastings, Ontario | [Geolocated Catholic church footprint](https://mapcarta.com/W332456242) | Secondary geographical provenance |
| `RG-D7E36888FDF3` | St Francis of Assisi, **Outer Cove Road**, Newfoundland | [Historical diocesan church directory](https://queenscollegenl.ca/wp-content/uploads/2021/08/ChurchDirectoryStJohnsNL.pdf) | Historic 49 vs online 36 Outer Cove Road discrepancy: do not assert exact number |
| `RG-866F0FE980DA` | St Joseph, **293 Stuart St**, Sarnia | [Ontario Heritage Trust](https://www.doorsopenontario.on.ca/lambton-county-1/st-joseph-church) | Historic Mass use not new/current traditional schedule |
| `RG-FCF911BD0F54` | St Patrick, **1600 Flos Road Four West**, Phelpston/Springwater | [Geolocated church building record](https://commons.wikimedia.org/wiki/Category:St._Patrick_Church_(Phelpston,_Ontario)) | Separate from Schomberg's St Patrick church |
| `RG-42B84C1F586E` | St Ann, **120 Sherman Avenue North**, Hamilton | [Hamilton Catholic school board parish directory](https://stah.hwcdsb.ca/our_faith/parish_information) | Do not import historical Extraordinary Form times |
| `RG-3E135A9E5C09` | La Rábida Franciscan monastery, **Diseminado de la Rábida s/n, Palos de la Frontera** | [Palos municipal tourism](https://turismoenpalos.es/page/39/monasterio-rabida) | Active monastery does not imply currently offered 1962 Missal |
| `RG-EE22A08568B9` | Sant Jordi de Vallcarca, **Viaducte de Vallcarca 7–13**, Barcelona | [Archdiocese of Barcelona official property register](https://esglesia.barcelona/transparencia/) | Address range, not necessarily exact worship entrance |
| `RG-06FF8F6BD4B6` | Sacro Cuore dei Sacconi, **Via Corridoni 16**, Tolentino | [Italian traditional-Mass specialist listing](https://ritoantico.it/marche/tolentino) | Timetable/permission not approved by research import |
| `RG-44B197BD0666` | San Bernardino, **Via Pignolo 57**, Bergamo | [Official Visit Bergamo](https://www.visitbergamo.net/oggetto/chiesa-di-san-bernardino/) | **Closed since 5 March 2024 for structural work** according to tourism authority. Do not promote as operating Mass site |
| `RG-4F6045FD2887` | Oratorio dei Bianchi, **Vico della Rosa**, Rapallo | [Genoa metropolitan government](https://fuorigenova.cittametropolitana.genova.it/node/4817) | Opening by request is not an active recurring Mass |
| `RG-12ECC5D067B6` | San Sebastiano, **Via San Francesco 26**, Livorno | [ICKSP official Livorno apostolate](https://www.icrss.it/livorno/) | Physical address source supports a Catholic site; date-sensitive Mass release is separate |

Two other held review points are explicitly important. The 10 remaining classification-only sources without additional independent corroboration (nine Brazil, one Werfen Austria) remain in `ten_b92_source_only_review_holds`. In particular, a source directory returning access denied is *not* a reason to infer that a church closed; it is an evidence-access limitation. The canonical admission decision is deferred until verified identity matching against the complete existing register.

## Tests / queryable research SQLite

Run from repository root, Python 3 standard library only:

```bash
python3 tools/directory/validate-cl3-reconciliation.py
python3 tools/directory/validate-cl4-owner-screening.py
python3 tools/directory/validate-cl5-provisional-intake.py
python3 tools/directory/validate-cl6-source-reconciliation.py
python3 tools/directory/validate-cl7-final-gaps.py
python3 tools/directory/rebuild-cl7-research-index.py --output /tmp/ad-orientem-cl7.sqlite
```

Rebuild works exclusively from committed checksum-verified CL2 shards and CL3–CL7 source JSON. It adds four research-only relational tables: `cl7_description` (13), `cl7_remaining_description_queue` (49, of which 36 held), `cl7_residual_b92_hold` (10) and `cl7_release_hazard` (6). Original CL2 canonical and historical Mass rows are unchanged.

**Next:** targeted exact-building research for the 36 held descriptions (major groups Italy, Spain, Canada), then formally release qualified physical-site canonical admissions and independent contemporary schedule approvals through the existing Directory contract. No payment or metered services needed.
