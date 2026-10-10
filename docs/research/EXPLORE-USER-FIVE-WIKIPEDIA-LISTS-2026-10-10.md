# Sacred Geography — five user-supplied discovery indexes

**10 October 2026; research-only; no map publication.** Work belongs to [Explore issue #665](https://github.com/Fulcanelli13/ad-orientem/issues/665) and draft [PR #923](https://github.com/Fulcanelli13/ad-orientem/pull/923).

## Source roles — not five independent canonical registries

| Supplied source | Appropriate use | Explicit limit |
| --- | --- | --- |
| [Christian pilgrimage list](https://en.wikipedia.org/wiki/List_of_Christian_pilgrimage_sites) | Worldwide discovery, including neglected Catholic sites in Asia, Africa and Latin America | Interconfessional and incomplete; not a registry of current canonically approved shrines |
| [Burial places of Abrahamic figures](https://en.wikipedia.org/wiki/List_of_burial_places_of_Abrahamic_figures) | Biblical, apostolic and historically attributed burial traditions | Overlapping and conflicting traditions; **not** relic authentication, access or Catholic custody |
| [Marian apparitions](https://en.wikipedia.org/wiki/List_of_Marian_apparitions) | Identify claims missing from the current 32-claim phenomenon corpus | Rulings may be changed or misstated; original diocese/DDF judgment must govern |
| [Holy Land Christian places](https://en.wikipedia.org/wiki/List_of_Christian_holy_places_in_the_Holy_Land) | Biblical event and physical-site research, rival geographic identifications | Multiple locations and confessions; no invented precise event GPS |
| [Christian pilgrimage category](https://en.wikipedia.org/wiki/Category:Christian_pilgrimage_sites) | Navigation to subcategories, missing terms and adjacent traditions | Just **19** top-level pages displayed; explicitly not an exhaustive taxonomy or location census |

Each source is preserved under [source routing JSON](../../data/geography/research/user-five-wikipedia-source-routing-2026-10-10.v1.json).

## Primary-source promotion: Holy Land Franciscan Custody

The [Franciscan Custody original sanctuary directory](https://www.custodia.org/en/santuari/) yielded **27 named items** in its visible list and map, now fully captured at name/index level in the [Custody register](../../data/geography/research/holy-land-custodia-sanctuary-index-2026-10-10.v1.json). **Two direct existing-Place matches** are the published Church of the Holy Sepulchre and Church of the Nativity. The other 25 are **unresolved index listings**, not 25 new sites, because the directory includes cities/towns and can include places inside a broader building complex. The separate Custody article for each site should be the next verification source.

Biblical geography needs object types beyond churches: `BIBLICAL_EVENT_SITE`, `BIBLICAL_TOMB_TRADITION`, `BIBLICAL_WELL`, `SACRED_LANDSCAPE`, `TRADITIONAL_ROUTE`, `CHURCH_OR_MONASTERY`, and `SUBSITE`. They are feature/semantic tags, **not** seven extra top-level Explore filters.

Physical site distinctions to lock:
- **Golgotha and Christ's tomb are part of the Holy Sepulchre**. Do not add independent default pins for subfeatures.
- **Cenacle and Franciscan Ad Coenaculum** are related but not automatically physically identical buildings.
- **Al-Maghtas (Jordan, east bank) and Qasr al-Yahud (west bank)** are separate baptismal pilgrimage sites.
- **Emmaus Nicopolis vs El Qubeibeh**, and **Cana Kafr Kanna vs Qana Lebanon**, are competing biblical identifications; keep separate Places and traditions rather than selecting one as certain.
- A medieval or modern processional route (Via Dolorosa, Damascus conversion route, Jesus Trail) is not exact ancient geometry and must not be synthesised from named stops.
- Country codes in research files are provisional geographical hints, **not a statement about contested sovereignty**.

## Secondary-source screening files

| Working index | Sample | Coverage claim |
| --- | ---: | --- |
| [Wikipedia category titles](../../data/geography/research/wikipedia-pilgrimage-category-names-2026-10-10.v1.json) | 19 | **19/19 displayed page titles**, including the parent-list self-reference. Subcategories and all other pilgrimage pages remain unenumerated. |
| [Biblical/Holy Land concepts](../../data/geography/research/wikipedia-holy-land-concepts-2026-10-10.v1.json) | 17 | Selected rival identifications, events and physical sites from the Wikipedia Holy Land list. |
| [Burial attributions](../../data/geography/research/wikipedia-burial-attributions-2026-10-10.v1.json) | 7 | Representative conflicting burial traditions, not full Abrahamic figures list. |
| [Apparition screen](../../data/geography/research/wikipedia-apparition-source-comparison-2026-10-10.v1.json) | 12 | Seven linked to existing `data/explore/sacred-phenomena-seed.v1.json` claims; five still require evidence review; not new admissions. |
| [Global pilgrimage overlaps](../../data/geography/research/wikipedia-world-pilgrimage-overlap-2026-10-10.v1.json) | 11 | Previously catalogued sites and selected new-source verification searches; not full 900-line list. |
| [Custody original site names](../../data/geography/research/holy-land-custodia-sanctuary-index-2026-10-10.v1.json) | 27 | Complete current visible Custody site-map labels, not all Holy Land sacred places or churches. |
| **Index observations** | **93** | Multiple lists mention the same buildings and phenomena; 93 rows are **not** unique sacred sites or new Places. |

The [2024 Dicastery for the Doctrine of the Faith norms](https://www.vatican.va/roman_curia/congregations/cfaith/documents/rc_ddf_doc_20240517_norme-fenomeni-soprannaturali_en.html) govern apparitions: a `nihil obstat` permits discerned devotion without declaring the reported event supernaturally authentic. An icon's canonical coronation, a basilica designation and a pilgrimage site's popularity each remain distinct from apparition approval. In the 12-case research comparison, the original 32-case phenomenon corpus is unchanged.

Likewise, biblical burial sites include both **Joseph's Tomb at Nablus and competing traditions**, **Jonah sites in Mosul and Halhul**, and **Mount Nebo as a site traditionally associated with Moses' death, not a proved grave** (Deut 34:6 explicitly withholds the burial location). We must preserve faith tradition, historical attestation and archaeology as separate claim statuses.

## Integration and next source expansion

Current production baseline: **182 physical Places**, **32 reported apparition phenomena**, and the Europe owner's **232 seven-wave research site leads**. Source-led research PR #923 also retains its pre-existing **512 gross source-list entries** and **38 thematic-heritage features**; none of these totals is inflated by the 93 secondary/original cross-index observations.

Next: acquire the Franciscan Custody's individual 27 site fiches, other official Christian Holy Land custodians/archaeological sources, bishop/custodian attestation for key pilgrimage sites, and the original DDF/diocesan decision for missing Marian-claim candidates. Only then identify net-new physical Places, rank editorial significance and link biblical context to Scriptures, Formation and the Calendar through existing module contracts. **The final map must stay compact.**
