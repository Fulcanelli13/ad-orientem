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
