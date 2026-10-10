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

## Batch 7 — original site fiche acquisition and historically qualified claims

### 27 of 27 Franciscan directory records have original links

The [Custody source index](../../data/geography/research/holy-land-custodia-sanctuary-index-2026-10-10.v1.json) now resolves **all 27 displayed original Custody listings** to a direct source: **26 dedicated sanctuary pages** and **one replacement original convent + feast-report pair for Ain Karem's Visitation** (the former directory-page click returned an error). **All 27 now have at least one source-specific historical or site-identification fact reviewed**; 18 received broader direct page reads and nine further entries were screened against primary page introductions or Custody news. Thus link acquisition and bounded focused-source-fact screening are **27/27 (100%)**; this is **not** exhaustive archaeological or entire page-text certification. No current opening hours, routes, images, copyright-guarded narrative text or coordinates were imported.

Physical identity:
- [Gethsemane original sanctuary account](https://www.custodia.org/en/sanctuaries/gethsemane-basilica-agony/) distinguishes the Basilica of the Agony, Garden of Olives and the separate nearby Grotto of the Arrest. These are site *subfeatures* and never three automatically unrelated main map pins.
- [St Francis Ad Coenaculum](https://www.custodia.org/en/sanctuaries/st-francis-ad-coenaculum/) occupies a monastery complex close to the historical Cenacle. It is **not** the Cenacle itself; their present liturgical access differs.
- [Bethany](https://www.custodia.org/en/sanctuaries/bethany/) identifies a modern Franciscan Church of Lazarus and separately the traditional Lazarus Tomb outside it; historic archaeology corroborates the place of Christian veneration, **not** certain authenticity of the remains.
- [Tabgha](https://www.custodia.org/en/sanctuaries/tabgha/) distinguishes the Chapel of the Primacy of Peter, the Benedictine Multiplication Church and the nearby Beatitudes tradition; one Tabgha-region label is not necessarily one building.
- [Tiberias](https://www.custodia.org/en/convents/tiberias-saint-peters-monastery/), [Jaffa](https://www.custodia.org/en/sanctuaries/jaffa/) and [Acre](https://www.custodia.org/en/sanctuaries/acre/) identify particular Franciscan/Catholic churches, not a pin placed arbitrarily in the city centre.
- [Ain Karem Saint John in the Desert](https://www.custodia.org/en/sanctuaries/ain-karem-st-john-desert/) includes a grotto, spring and traditional Tomb of Elizabeth; this hermitage is physically distinct from the Visitation Church and Saint John birthplace sanctuary.
- [River Jordan Baptism](https://www.custodia.org/en/sanctuaries/river-jordan-site-baptism-jesus/) is the **west-bank Qasr al-Yahud** site in this source; it is geographically distinct from east-bank Jordanian Al-Maghtas.
- [Emmaus El-Qubeibeh](https://www.custodia.org/en/sanctuaries/emmaus-el-qubeibeh/) explicitly reports historical Nicopolis and El-Qubeibeh alternatives. The traditional Gospel Emmaus location is not adjudicated as an archaeological certainty.
- [Cana](https://www.custodia.org/en/sanctuaries/cana/) identifies the Franciscan Kafr Kanna tradition and records its historical localisations; do not turn rival identifications into one exact biblical GPS claim.

**Rights:** The individual Custody pages explicitly state that their text and images may not be reused without permission. The project stores original URLs and short independently authored factual labels/qualifiers only. No protected descriptive article, photographs, maps or full text were copied into research files.

### Burial traditions: five original or institutional crosschecks

The [burial attribution crosswalk](../../data/geography/research/wikipedia-burial-attributions-2026-10-10.v1.json) now attaches primary institutional records for five cases or site associations:

| Site or attribution | Strong source | What it actually establishes |
| --- | --- | --- |
| Cave of the Patriarchs in Hebron | [UNESCO Hebron WHC record](https://whc.unesco.org/en/list/1565/) | A historic monumental compound revered by Judaism, Christianity and Islam; not independently authenticated patriarchal bones |
| Mount Nebo, Moses | [Franciscan Custody](https://www.custodia.org/en/sanctuaries/mount-nebo/) and [Studium Biblicum Franciscanum archaeological monograph index](https://sbf.custodia.org/en/publications/collectio-maior/mount-nebo-new-archaeological-excavations-i) | Memorial of Moses' view/death; **Deuteronomy 34:6 says the exact burial is unknown** |
| Tomb of the Virgin Mary | [Custody's Assumption/site custody report](https://www.custodia.org/en/news/in-the-footsteps-of-mary-jerusalem-gathers-around-the-assumption-to-rediscover-its-vocation/) | Venerated historical tomb and liturgical tradition, with Greek Orthodox and Armenian current custody under the Holy Places status quo; not proof of bodily relic custody |
| Lazarus traditional tomb | [Custody's Bethany site history](https://www.custodia.org/en/sanctuaries/bethany/) | A distinct traditional tomb in the Bethany devotional complex; archaeology and traditions are not certain identity of remains |
| Tomb of Saint Elizabeth | [St John in the Desert hermitage](https://www.custodia.org/en/sanctuaries/ain-karem-st-john-desert/) | A custodian-described traditional tomb associated with hermitage cave/spring, not proven skeletal identification |

The older seven-selected-case list continues to retain five unresolved primary-source claims, including conflicting modern attributions of figures such as Jonah and Daniel. No extra Place or Relics registry entries were authored.

### Two Marian claim decisions materially improved

| Research case | Original authority | Qualified verdict |
| --- | --- | --- |
| **Querrien — Notre-Dame de Toute-Aide, Brittany** | [Diocese of Saint-Brieuc–Tréguier](https://saintbrieuc-treguier.catholique.fr/le-diocese/le-sanctuaire/) | The living diocesan account attributes **historical episcopal authentication to Mgr Denis de La Barde in September 1652** and separately records a 1950 image coronation and 2002 diocesan shrine status. The original signed 1652 document is not acquired; record the documentary attribution accurately rather than calling the claim unapproved. |
| **Vailankanni — Our Lady of Good Health, India** | [Diocese of Thanjavur history](https://tanjorediocese.org/front/history) plus [DDF prefect's 2024 shrine letter](https://www.vaticannews.va/en/vatican-city/news/2024-08/ddf-support-india-vailankanni-marian-shrine.html) | The ordinary reports the early appearances as **longstanding oral tradition without surviving early historical records**, while the shrine's approved devotion and basilica dignity are abundantly attested. The available 2024 DDF praise of pilgrimage does **not** amount to a supernatural-authenticity declaration. |

Leżajsk, Pesqueira/Cimbres and Quito Buen Suceso remain in the **original-document acquisition queue**. Neither those cases nor Querrien/Vailankanni were added or changed in the live 32-phenomenon corpus; recognition claims are research evidence for the existing phenomena owner.

### Counts and next eligibility gates

- Global bibliography now **51** references, including five new original/institutional documents in this round; it previously held 46.
- Holy Land direct original catalogue links: **27/27**, focused original-source facts checked: **27/27** (18 broader site-text reviews plus nine introduction/news-supported reviews).
- Primary/source-institution burial/site attributions now reviewed: **5** qualified cases; this does not make five authentic tombs.
- Two apparition cases source-reviewed with divergent outcomes. All app data still unchanged.
- Worldwide 512 gross source entries, thematic 38 feature rows, 182 published Places, 232 European site research leads and 32 existing phenomena claims **have not increased from this verification work**.

**Next phase**: deepen site-level archaeology, biblical context and physically separate subfeatures beyond the initial 27-source-fact screen, deduplicate the 27 locations by physical site and nested features, acquire original diocesan statements for the remaining apparition claims, and route every accepted source-identity contribution to its domain owner before designing map pins, textual Holy Land Scripture context, or visiting directions.
