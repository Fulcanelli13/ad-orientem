# Explore / Sacred Geography — reference-led worldwide census, Batch 1

**Research date:** 10 October 2026  
**Canonical owner:** [Explore issue #665](https://github.com/Fulcanelli13/ad-orientem/issues/665)  
**Research data:** [reference-census-2026-10-10.v1.json](../../data/geography/research/reference-census-2026-10-10.v1.json)  
**Release status:** research only; no canonical Place, shrine, pilgrimage, relic, custom, apparition or runtime changes.

## Why this batch exists

A country possessing a published map pin is **not** a national inventory. The first European pass reached 47/47 jurisdictions but the previous 187 research leads (22 matched, 165 still-unmatched) have not been certified. In the current `main` geography seed there are 182 physical `Place` records, including 44 for France, 37 for Italy, 17 for the United States, 4 for Canada, 2 for Australia, 2 for New Zealand, 1 for India and 0 for the Philippines. These are **seed counts, not estimates of real-world total sites**.

External reference works establish major omissions and, crucially, bounded source sets to audit. A French publisher reports nearly 2,900 active Marian devotional sites in a single 2019 guide, whereas the published worldwide app seed holds 178 shrine records of all kinds. The scopes differ; no global omission rate may be inferred. Likewise, the Italian ICCD census updates its diocesan inventories as research progresses; a list of dioceses with completed files does not establish an Italian national denominator.

We are therefore replacing open-ended searches with **source-level accounting**: original inventories first, physical identity crosswalk second, release selection last. The information in the JSON is discoverable research evidence, not a public catalogue.

## Source-review hierarchy

1. **Original diocesan/episcopal shrine acts, sanctuary custodians and official episcopal directories** for a site, designation or continuing pilgrimage.
2. **Heritage-ministry and academic inventories** for historic sites, objects, relic traditions and local customs (but not for asserting contemporary canonical shrine approval).
3. **Historical books and specialised dictionaries** for discovery, aliases, timelines and bibliographic references. A catalogue description is not equivalent to having transcribed the book, and reported apparitions are not automatically approved.
4. **Association and secondary indexes** to detect missing candidates, always followed by original corroboration when available.

A single **physical Place ID** may link to multiple records: shrine, pilgrimage, route, relic custody, sacred image, apparition claim and custom attestation. No duplicate pin per devotion. No proximity-inferred TLM Directory relationship.

## Sources acquired into the source ledger — 22 reference entries

| Geographic review | Key bounded inventory or reference | What has been verified | What remains |
| --- | --- | --- | --- |
| Europe — France | [Le Tourneau, *Guide des sanctuaires mariaux de France* (2019)](https://www.editionsartege.fr/product/117073/guide-des-sanctuaires-mariaux-de-france/) | Publisher's reported near-2,900 active French Marian sites, arranged by department | Full book not obtained or indexed; licensing and selection required |
| Europe — France | [Catherine Vincent, *Pour un inventaire...* (2005)](https://www.persee.fr/doc/rhef_0048-7988_2005_num_91_227_4229) | CNRS-linked inventory methodology and history | Separate extractable database/index to be found |
| Europe — Italy | [ICCD, Censimento dei santuari italiani](https://iccd.cultura.gov.it/it/progetti/5382/censimento-dei-santuari-italiani) | Official diocesan-area census index with regional files; ongoing | Harvest indexed diocesan files and count reconciled sites |
| Europe — England & Wales | [Bishops' pilgrimage resources](https://www.cbcew.org.uk/pilgrimage/) | Pilgrim Ways and shrine destinations | Routes and historical local sites need separate audit |
| Worldwide — historical | [Gumppenberg's *Atlas Marianus* (academic analysis)](https://hrcak.srce.hr/en/clanak/12006) | A study describes 1,200+ historical Marian shrines | Reconcile historical names and modern site identity; no contemporary activity assumption |
| Worldwide — apparitions | [Laurentin–Sbalchiero apparition dictionary](https://www.fayard.fr/livre/dictionnaire-des-apparitions-de-la-vierge-9782213671321/) | Publisher reports 2,400+ recorded apparition reports | Printed entries not extracted; each case needs separate recognition assessment |
| Europe — French customs | [Sébillot, *Le folk-lore de la France* (BnF)](https://catalogue.bnf.fr/ark%3A/12148/cb34087386n) | Four-volume bibliography with linked digitisation | Distinguish French Catholic practice from unrelated folklore |
| North America — Canada | [CCCB: Canada's National Shrines](https://www.cccb.ca/the-catholic-church-in-canada/canadas-national-shrines/) | Six listed national shrines | Two do not appear in current seed |
| North America — United States | [NASPA: national shrines](https://www.catholicshrines.org/national-shrines) and [USCCB heritage sites](https://www.usccb.org/sites-catholic-heritage-usa) | Concrete national designations and a separate heritage list | Compare all indexed shrines and update church-level authority |
| South America — Brazil | [IPHAN built heritage](https://www.gov.br/iphan/pt-br/patrimonio-cultural/patrimonio-material), [Espírito Santo heritage](https://www.gov.br/iphan/pt-br/superintendencias/espirito-santo/patrimonio-material) | State-protected churches, selected shrines, and searchable heritage inventories | Filter sacred sites; a 2026 CNBB Catholic heritage consultation is **still in progress** |
| Asia — Philippines | [Diocese of Malolos shrines](https://dioceseofmalolos.ph/shrines-and-pilgrimage-sites/) | Four named national shrines plus diocesan shrines on a first diocesan index | No Philippine Place in current seed; other dioceses unexamined |
| Asia — India | [Vailankanni: Vatican News on DDF correspondence](https://www.vaticannews.va/en/vatican-city/news/2024-08/ddf-support-india-vailankanni-marian-shrine.html) | Major Marian shrine established, with direct Holy See reporting | Link physical site; do not infer apparition approval |
| Africa — Kenya | [AMECEA report on Subukia](https://communications.amecea.org/index.php/2026/09/25/kenya-kccb-dedicates-october-3rd-to-national-prayer-for-peaceful-cohesion/) | National Marian pilgrimage destination in Diocese of Nakuru | Africa-wide inventory has not been found; [SECAM](https://secam.org/regional-episcopal-conferences/) supplies a conference-routing directory |
| Oceania — Australia | [Australian Jubilee pilgrimage directory](https://pilgrimsofhope.catholic.org.au/all/) | 117 paginated 2025 Jubilee pilgrimage sites | Time-bounded designated sites, not all Australian historic sites; reconcile full eight-page list |
| Oceania — New Zealand | [NZ bishops' national shrine dedication](https://www.catholic.org.nz/news/media-releases/smoa-dedication-mass) | St Mary of the Angels, Wellington, national Marian shrine dedicated 14 August 2022 | Missing in current Place seed |

The full JSON also records the country-local official source for Turin's Consolata and a secondary worldwide national-shrine index. These are discovery/evidence pointers, not wholesale content reproductions.

## Batch-1 identity crosswalk (16 leads; **not** 16 approved new Places)

The research JSON contains the exact names, localities and source keys. Counts below mean **no exact official-name match against the current 182-Place seed**, **not** verified absence from all historical research branches or the 165 European unmatched leads.

| Region | First candidates absent by exact seed-name comparison | Count |
| --- | --- | ---: |
| Europe | Santuario della Beata Vergine Consolata, Torino | 1 |
| North America | Ermitage Saint-Antoine; Bishop Velychkovsky Shrine; Juneau St Thérèse shrine; Washington national Immaculate Conception basilica | 4 |
| South America | Congonhas Bom Jesus de Matosinhos; Vila Velha Nossa Senhora da Penha | 2 |
| Asia | Four Diocese of Malolos national shrines; Our Lady of Good Health at Vailankanni | 5 |
| Africa | National Marian Shrine at Subukia, Kenya | 1 |
| Oceania | Bathurst diocesan shrine; Lutana Our Lady of Victories; St Mary of the Angels, Wellington | 3 |
| **Total** | **Source-derived research leads** | **16** |

All 16 have `place_id: null`, `published: false`, and `reconciliation_status: PENDING_CANONICAL_ID_AND_LEAD_DEDUP`. We have **not** increased the canonical 182 count, the European 165 pending count or the published 178-shrine count.

## Practical worldwide completion gate

For each country/territory and category, log:

- `source_id`, bibliographic identifier/URL, authority type, rights/access state and edition/date;
- source total when explicitly available, `entries_screened`, `eligible`, `matched`, `new_place`, `linked_existing`, `exclude`, `source_hold`;
- the exact original page, entry or statement justifying the identity, shrine/pilgrimage and significance classification;
- alias spellings, physical complex identity, country, historic/current status, and unresolved duplicate hypotheses;
- selective Catholic relevance, especially the specific French-world gate for customs;
- separate ecclesiastical recognition and apparition-claim statuses.

**Source processing %** = entries screened / entries accessible in that named source.  
**Canonical reconciliation %** = eligible entries decisively linked, newly resolved or excluded / all screened eligible entries.  
**Geographic breadth** = jurisdictions with evidence / jurisdictions targeted.  
**Worldwide site completeness %** is **undefined** unless the denominator, included sources and inclusion standard are declared.

Do not treat a book's 2,900 entries as 2,900 public pins, a 2025 Jubilee stop as a timeless major shrine, or a relic/Marian title as evidence of an independent destination.

## Next acquisition cycle: worldwide breadth, then detail

1. **Global source discovery:** for the remaining countries across Africa, Asia, both Americas, Oceania and Europe, find one or more authoritative country or diocesan catalogues; log unavailable source families as explicit gaps.
2. **Bounded extraction:** transcribe/compare accessible original indices first (Italy ICCD diocesan lists; Australia 117 Jubilee entries; Canada six; Malolos official directory; NASPA US list); process multiple countries in batches, not one pin at a time.
3. **World crosswalk:** compare all source candidates with `data/geography/seed-registry.v1.json`, all existing shrines/pilgrimages/customs/phenomena and the previously researched 187 European leads; never promote a new Place until its physical identity is resolved.
4. **Only then** address precise geo-coordinates, bios, photographs/artworks and map-level release. Preserve the original modules and source ownership. Issue #665's existing relic-census dependency still blocks premature publication of the major Marian release batch.

**No release certification is claimed. No exhaustive national denominators have been established.**

## Batch 2 completed: bounded national/diocesan index acquisition (same date)

The reference-led acquisition pass now has **211 indexed entries** from four source lists, transcribed and retained in five machine-readable files (the fifth is Italy's list-of-diocesan-source-registers, not site records):

| Index | Indexed items | Name/index acquired | Canonical status |
| --- | ---: | ---: | --- |
| [NASPA US national shrine listings](../../data/geography/research/naspa-us-national-shrines-2026-10-10.v1.json) | 72 | 72/72 (100%) | 10 proposed links to existing seed sites; rest unresolved; apparent repeated physical sites in source |
| [Australia 2025 Jubilee pilgrimage sites](../../data/geography/research/australia-jubilee-2025-sites-2026-10-10.v1.json) | 117 | 117/117 (100%) | One source-confirmed preexisting Penrose Park identity; 2025 designation not an enduring shrine status |
| [Canadian bishops' national shrine list](../../data/geography/research/canada-national-shrines-2026-10-10.v1.json) | 6 | 6/6 (100%) | Four proposed matches to canonical Place seed; two seed gaps |
| [Malolos diocesan shrine/basilica list](../../data/geography/research/malolos-shrines-2026-10-10.v1.json) | 16 | 16/16 (100%) | Four national shrines, ten diocesan shrines, two minor basilicas; no Philippine seed Place |
| **Four bounded indices combined** | **211** | **211/211** | **Not 211 new unique Places or shrines** |

Italy is a separate, deeper book/source census. The [ICCD diocesan source-list index](../../data/geography/research/italy-iccd-diocesan-source-index-2026-10-10.v1.json) records **33 listed diocesan/eparchial files**; their PDF records are unreviewed. ICCD's current publication description gives **31 Basilicata + 162 Calabria sanctuaries** in a monograph, measured at 31 December 2025, **not** 193 verified new sites in the app.

### Confirmed identity and source-quality safeguards

- The Australian index's *Shrine of Our Lady of Mercy* describes **Penrose Park**; the source site profile corroborates that this is the already seeded `place:AU:penrose-park`. No duplicate pin is justified. [Official Australian pilgrimage profile](https://pilgrimsofhope.catholic.org.au/site/shrine-of-our-lady-of-mercy/).
- The Canadian episcopal index's **four known sites** are St Joseph's Oratory, Sainte-Anne-de-Beaupré, Notre-Dame-du-Cap and Canadian Martyrs' Shrine; the **two seed gaps** are Lac-Bouchette's Saint Anthony's Hermitage and Bishop Velychkovsky Martyr's Shrine (Winnipeg). Their canonical IDs remain unassigned.
- The American association index lists both **St Gerard** and **Saint Lucy's Church/National Shrine of St Gerard** in Newark and two descriptions of **St Ann** in Scranton; these are potential duplicate physical sites, not two automatically independent records each. Ten US links are only proposed from names/location, and not yet published as authoritative bridges.
- The Malolos index lists **San Isidro Labrador** at both Pulilan and Guiguinto, which are different towns; Guiguinto's own page links point instead to **Sta Rita de Cascia**. Keep the contradiction attached to that exact record rather than forcing either title.
- NASPA and the Australian site each carry a specific identity/designation role; the latter mixes church buildings, cemeteries/graves, sacred outdoor locations and one-off Jubilee destinations. Their raw totals cannot be summed as major Catholic shrines.
- The initial 16 research leads are preserved intact, and **10/16 are now linked to a specific bounded-source index entry**, not a verified new Place. Europe’s older 165 unmatched leads remain unreconciled with this batch.

**Source index acquisition completion is 211/211 (100%) within these four selected, finite lists, but worldwide inventory completeness and worldwide eligible-site reconciliation remain unknown.** The next research work should focus on source-index coverage in other countries, especially where the seed presently has no Places, while obtaining and crosswalking Italy's many diocesan source files and the French reference-book indexes. Do not author bios or map pins from index-only records.

## Batch 3: Philippines, Chile, Ireland and African episcopal source cross-checks

Following the initial four complete bounded source lists (211 source rows), the next wave records **86 more source-index rows** across Asia, South America, Europe and Africa (there are overlapping known sources, so do not call the new row total 86 new Places). The combined index-reference row count is now **297 before any cross-list entity deduplication**. The master bibliography currently holds **34 references** covering all six inhabited continents.

| New research index | Records | Character / audit result |
| --- | ---: | --- |
| [Philippines: ACSP selected regional priorities](../../data/geography/research/philippines-acsp-priority-2026-10-10.v1.json) | 66 | 16 northern/central Luzon, 25 NCR/southern Luzon, 20 Visayas, five Mindanao. Explicit **selected** index, not entire national catalogue. |
| [Chile: episcopal pilgrimage map](../../data/geography/research/chile-episcopal-shrines-map-2026-10-10.v1.json) | 15 | All 15 displayed place labels; some ambiguous, no speculative pins. The Chilean bishops have a **broader searchable shrine register and historical feast catalogue**, still pending extraction. |
| [Ireland: episcopal national pilgrimage sites](../../data/geography/research/ireland-2025-national-pilgrimage-2026-10-10.v1.json) | 3 | Knock and Lough Derg already seeded; **Croagh Patrick not seeded**. Jubilee 2025 designation is a historical flag rather than enduring exclusive status. |
| [Africa: diocesan/episcopal priority sources](../../data/geography/research/african-episcopal-priority-2026-10-10.v1.json) | 2 | Our Lady of Lusaka is a new seed-gap lead; Kenya's Subukia is a corroboration of the first-wave candidate, **not a second physical site**. |
| **Additional source rows** | **86** | **No canonical Place count changed.** |

### National PH census is more consequential than the Malolos-only sample

The [Association of Catholic Shrines and Pilgrimages of the Philippines' official 2024 announcement](https://philippineshrines.org/2025/01/28/acsp-official-shrine-members/) reports **305 recognised shrines** (or **319 titles** if distinct dedications within one church are counted), of which **257 were enrolled association members** at the time. This is a substantive country-level denominator proposal, **not a certified count of independent physical churches**.

Internal qualifications:
- Reported region subtotals 80 + 73 + 65 + 56 + 22 = **296, not 305**. We must preserve this discrepancy rather than treating 305 as fully verified unique Places.
- The live regional pages contain entries dated 2025 after the 2024 announcement and some repeated physical sites (e.g., Saint Martha, Pateros appears under both the Diocese of Pasig and the Military Ordinariate; Cebu Our Lady of Lourdes is repeated).
- The Association's [Northern/Central Luzon](https://philippineshrines.org/northern-central-luzon/), [NCR and Southern Luzon](https://philippineshrines.org/national-capital-region-and-southern-luzon/), [Visayas](https://philippineshrines.org/visayas/) and [Mindanao](https://philippineshrines.org/mindanao/) pages list names, dioceses, declaration dates and membership states. **66 selected anchors** are now written to machine-readable research rows; full transcription of the remaining regional lists is **not finished**.
- At Guiguinto, the diocesan shrine-page heading **San Isidro Labrador** conflicts with its own St Rita links. The association regional list calls the same site **Sta Rita de Cascia**, as does the [diocese's history](https://dioceseofmalolos.ph/history/). This strengthens the St Rita interpretation but the conflicting title remains preserved for a custodian/rector check; the distinct San Isidro shrine at Pulilan is not merged into it.

### Chile is a distinct source-family breakthrough

The [Chilean Episcopal Conference](https://www.iglesia.cl/area_eclesial.php) advertises a *Buscador de Santuarios*, an old **full shrine + religious feast inventory**, and associated popular-piety source material; the [current 2025 illustrated map](https://www.iglesia.cl/48774-el-peregrinar-su-sentido-y-finalidad.html) identifies 15 sites across Chile. The illustrated map was visually checked, but 15 map labels **are not the national denominator**. The searchable [national shrine interface](https://www.iglesia.cl/santuarios.php) and its detailed index remain acquisition work. Site-name ambiguity (e.g. `Inmaculada Concepción`) requires ecclesiastical and locality evidence before physical identity.

These global geography witnesses do not automatically authorise publishing every local custom as a standalone French domestic practice. The custom atlas's French Catholic relevance editorial gate remains in force for its French-world domestic category; pilgrimage and site-local historical devotions may be evidenced in their original geographical context.

### Africa and other source-routing

The [Archdiocese of Lusaka reports an actual pilgrimage to Our Lady of Lusaka](https://lusakaarchdiocese.org/adl-2025-marian-pilgrimage/) from Roma Parish, with the annual site already corroborated historically by [AMECEA](https://communications.amecea.org/index.php/2013/08/30/zambia-pope-francis-sends-greetings-to/). Kenya's Subukia National Marian Shrine is confirmed by a [September 2026 AMECEA/KCCB report](https://communications.amecea.org/index.php/2026/09/25/kenya-kccb-dedicates-october-3rd-to-national-prayer-for-peaceful-cohesion/). The [Ghana Catholic Bishops' national diocesan directory](https://www.cbcgha.org/national-directory/) is logged strictly as a **route to diocesan sources**, not a shrine list.

PAMI's [updated sanctuary census and world Marian map](https://www.pami.info/santuari-censimento/) now provides a further authoritative cross-check for Italian and international Marian sites. **Map data not yet extracted.**

### Remaining gates

- **Full indexes:** complete the live Philippines association directory (not merely 66), Chile's diocesan shrine database and shrine-feast register, Italy's 33 listed diocesan PDFs, and open French inventories.
- **Cross-source identity:** reconcile every row with the current 182 Places, the 211 earlier indexed rows, the prior European 187 research leads and the 16 initial global candidates; a matched source title is not a verified physical Place.
- **Coverage denominator:** identify and acquire the principal institutional and printed inventories per country/diocese, recording source edition, index length, extraction percentages, contradictions and unavailability.
- **Later:** canonical Place admission, accurate pins, biographies and artwork only after identities and editorial importance pass. No source-index item is automatically approved for map publication.

## Batch 4 — four Philippine regional indexes and primary PAMI extraction

### Philippines: complete named-title transcription of four retrieved regional listings

Four new regional source files, with church/shrine titles, localities, ecclesiastical group and a reference to the original national association page, now contain the following **266 source rows**:

| Regional source | Named rows acquired | Research file |
| --- | ---: | --- |
| Northern and Central Luzon | **77** | [North ACSP regional list](../../data/geography/research/philippines-acsp-north-complete-2026-10-10.v1.json) |
| NCR + Southern Luzon | **129** | [NCR/South ACSP regional list](../../data/geography/research/philippines-acsp-ncr-southern-complete-2026-10-10.v1.json) |
| Visayas | **55** | [Visayas ACSP regional list](../../data/geography/research/philippines-acsp-visayas-index-2026-10-10.v1.json) |
| Mindanao | **5** | [Mindanao ACSP regional list](../../data/geography/research/philippines-acsp-mindanao-complete-2026-10-10.v1.json) |

The Visayas site timed out on detailed re-fetch; its **55 named rows reflect the available retrieved content through Tagbilaran**, not a certified permanent snapshot of the live page. No individual association declaration dates or membership statuses are yet structured in these regional files, even where visible on the source page. The national 2024 ACSP report still states **305** shrines and **257** members; its listed five regional counts sum to **296**. The current live pages are a different observation window, so subtracting 266 from 305 as a missing-site count would be invalid. Source: [2024 member report](https://philippineshrines.org/2025/01/28/acsp-official-shrine-members/).

The [unified crosswalk](../../data/geography/research/philippines-acsp-unified-crosswalk-2026-10-10.v1.json) preserves source-entry IDs without assigning canonical Place identities. It records:
- **Three exact repeat pairs** by normalised church name and locality: Olongapo's Mary Magdalene/San Lorenzo Ruiz, Pateros' St Martha (two ecclesiastical headings), and Cebu Punta Princesa's Our Lady of Lourdes.
- A **fourth probable repeat**: Masinloc's San Andres is listed with two locality spellings, one with `Poblacion`; independent physical inspection still required.
- All **66 former PH priority selections** now have source index pointers: 56 one-title matches, two ambiguous repeated titles and eight expanded-title/alias matches. No canonical identity approval.
- All **16 Malolos official source entries** have a corresponding ACSP named title or alias proposed, again without final site verification. Guiguinto's source inconsistency is preserved.
- The current canonical `Place` registry contains **zero PH Places**; no new map pins were published in this work.

### Italy: from bibliographic index to original source records

The [PAMI diocesan case index](../../data/geography/research/pami-italy-rwanda-diocesan-cases-2026-10-10.v1.json) records **11 named diocesan sanctuary sites from Oppido Mamertina-Palmi** ([original article](https://www.pami.info/news/i-santuari-della-diocesi-di-oppido-mamertina-palmi/)) and **two from Tricarico** ([original article](https://www.pami.info/santuari/i-santuari-della-diocesi-di-tricarico/)). These 13 Italian entries include town, original source URL, legal shrine type/date where explicitly documented, and local feast/custom keywords for future site-specific links. They are **not** automatic public map Places or samples that estimate all Italy's shrine total.

The same PAMI source family documents **Notre Dame de Fatima at Ruhengeri, Rwanda**, elevated to diocesan shrine in 2017 ([PAMI case](https://www.pami.info/santuari/sanctuaire-notre-dame-de-fatima-ruhengeri/)). This site is not the existing Kibeho canonical Place.

A further [single original Italian MODI fiche](../../data/geography/research/italy-iccd-validated-records-2026-10-10.v1.json) has been examined for **Santuario diocesano di San Giovanni Paolo II, Les Combes, Introd, Valle d'Aosta**, [official 22-page source](https://www.pami.info/censimento_santuari/schede/Santuario_San_Giovanni_Paolo_II_Aosta.pdf). It records the official identifier `ICCD_MODI_8396884055071`, diocesan sanctuary designation in 2016, and an **approximately georeferenced source coordinate** (not an entrance-verified GPS fix). The fiche says a Saint John Paul II relic moves seasonally between the sanctuary and the local parish museum; no permanent relic pin may be inferred. Its rights statement requires author and sanctuary permission for broader republication of the fiche research; only short factual discovery fields and a source link were recorded. **No PDF reproduction, text corpus, photograph or artwork was imported.**

Local Italian traditions such as San Rocco wax ex-votos, processions and San Biagio's blessing of throats are recorded **only as site-attached Italian cultural attestations**, not added wholesale to French domestic devotional customs. No new customs owner, Calendar feast or Apparition entry was created.

### Chile: original full-catalogue archive located, extraction not completed

The Chilean bishops' [Área Eclesial historical archive](https://www.iglesia.cl/area_eclesial.php) explicitly lists both an older *Catastro de Santuarios* and a *Lista de los santuarios y sus fiestas* in PDF/Excel, in addition to the online sanctuary search and the 2025 15-site illustrated map. The links returned errors in this research environment; **the underlying catalogue contents have not been read or copied**. Registering the index is progress in source discovery only. It does **not** change Chile's completed research-entry count, national denominator or app Place count.

### Combined accounting and next closure gates

The previous Batch-3 gross source list count was **297** (211 bounded listings + 66 selected PH anchors + 15 Chile map labels + 3 Irish references + 2 Africa records).

For research-source accounting, the newly transcribed **266 PH ACSP regional rows replace, rather than supplement, the previously selected 66 overlapping PH rows**. Add the 14 detailed Italian/Rwandan site records and the one separate 22-page Italian fiche:

`297 − 66 + 266 + 14 + 1 = 512`

Thus the ledger now contains **512 source-list entries across different inventories**, not 512 unique physical sites, and includes duplicates between the Malolos directory and ACSP. It has **39 source reference entries**. All 512 are research-only; no public records or map pin totals changed.

The next strict gates are (1) validate the Visayas source page's complete live tail and dates/membership statuses, (2) resolve the 2024 vs 2026 Philippine census discrepancies and deduplicate its candidate sites, (3) acquire the original Chile episcopal Excel/PDF and broaden global national-source coverage, and (4) extract the remaining 33 Italian diocesan catalogue documents in legally usable form. Map publication comes **only** after the physical identity, importance and source-rights gates, not as a by-product of index scraping.
