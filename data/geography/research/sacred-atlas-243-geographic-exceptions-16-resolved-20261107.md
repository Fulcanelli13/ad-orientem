# Sacred Atlas — 16 geographic exception resolutions
**7 November 2026. Research-only second pass. Zero owner-approved coordinates, zero canonical additions, zero public publication.**

This pass reconciles the **nine original F-lane physical-identity holds** and the **seven previously qualified coordinate leads** in the second-cohort 243-Place master. Review findings are recorded directly in the existing [30-case coordinate ledger](./sacred-atlas-243-30-missing-coordinates-20261107.v1.json), with original values retained where corrected. The staged coordinates are **illustrative**, not entrance/navigation-grade GPS.

## Counts and outcome

| Source cohort decision | First geographic pass | After this pass |
| --- | ---: | ---: |
| Originally missing coordinate rows | 40 | 40 |
| F-lane site coordinates staged | 21 | **24** |
| Of staged: illustrative site locations | 14 | **23** |
| Of staged: qualified uncorroborated feature lead | 7 | **1** |
| Original F-lane without any proposed coordinate | 9 | **6** |
| Other original non-new-pin lanes without coordinate | 10 | 10 |
| Total original missing-location rows still without a proposed new coordinate | 19 | **16** |
| Existing canonical Places recognized for reuse from F lane | 0 | **2** |
| Owner-accepted/imported/published | 0 | **0** |

"23 illustrative" does **not** mean the building entrance has been verified. Several are worship-precinct or commemorative-site anchors; the one remaining qualified point is Rakunai.

## Three newly staged physical-site anchors

- **SG-INV-0679 — Lembah Karmel, Cikanyere, Indonesia:** site-specific 2012 pilgrimage directions publish **-6.743222, 107.100917**, whereas a Catholic parish's 2025 pilgrimage account documents Mass at Kapel Lembah Karmel. Other records identify *Gereja Santa Teresia dari Lisieux* as a church within the complex. This is a provisional grotto/retreat-site marker, **not** a certified monastery entrance or church-specific location. Source https://www.seputarharapanindah.com/2012/02/info-tempat-ziarah-umat-katholik.html and independent parish https://theodorus.org/ziarah-rohani-ke-kapel-lembah-karmel-cikanyere/ ; church catalogue https://gcatholic.org/churches/asia-east/149479.
- **SG-INV-0475 — Jamaica:** the physical site is **Our Lady of the Angels Catholic Church, 75A Molynes Road, Kingston**, OSM church polygon approximately **18.02020,-76.81379**. The original claim of a distinct *shrine* is **unproven** and is not adopted. Rename proposed site as church/parish if eligible; no new shrine title. Sources https://jm.geoview.info/our_lady_of_the_angels_catholic_church%2C20697652138w and https://higgler.org/place/st-andrew/molynes-gardens/our-lady-of-the-angels-catholic-church.
- **SG-INV-0230 — Echt:** the exact intended Marian chapel is **Onze-Lieve-Vrouwekapel van Schilberg**, Bosstraat 33, 6101 NV Echt. Rijksmonument **14265**, built in 1691, is distinguishable from St Edith Stein's Carmelite convent chapel, St Landricus church, and the small Stations chapels. Approximate geotag **51.098033,5.881275**. https://monumentenregister.cultureelerfgoed.nl/monumenten/14265 and https://www.wikidata.org/wiki/Q17365925; pilgrimage identity independently described at https://bedevaart.meertens.knaw.nl/plaats/189.

## Six improved existing coordinate leads

- **SG-INV-0542 Quillacollo:** retained **-17.39834,-66.28153**, OSM **way 207815827**, with independent legal/title proof: Bolivian Catholic bishops' evangelization service says Church of San Ildefonso was declared **Archdiocesan Sanctuary of Our Lady of Urkupiña** by archiepiscopal decree 1998/091. The existing church **is** the Marian sanctuary. Cerro Cota is a **separate apparition/pilgrimage location**, and an announced new basilica is not identical to either. https://evangelizacion.ceb.bo/urcupina-una-fe-con-sello-de-integracion-nacional/ and https://mapcarta.com/es/W207815827
- **SG-INV-0131 Limpias:** changed imprecise original ~20m to the independent site-level marker **43.3644977,-3.4172386**. San Pedro Apóstol church **is** Santo Cristo de la Agonía sanctuary. https://www.escapadarural.com/que-hacer/limpias/iglesia-de-san-pedro-o-del-santo-cristo
- **SG-INV-0579 Kfifan:** **34.22314,35.72315** remains site-approximate, with authoritative Maronite Church records tying Sts Cyprian and Justina monastery to the Lebanese Maronite Order and a second mapped cluster of St Nimatullah Hardini shrine features. **No exact tomb-door claim.** https://maronites.church/sites/st-cyprianus-and-justina-kfifan/ and https://mapcarta.com/12891016
- **SG-INV-0454 Diriomo:** **11.87374,-86.05127** corresponds to named Candelaria diocesan sanctuary; Nicaragua's education ministry supports named current pilgrimage. Independent church photo geotag **11.874081,-86.051434** is ~40m away; the unrelated parish-family pastoral office is ~680m from the submitted site. https://www.mined.gob.ni/mapatradicionesculturapopular/listing/diriomo/ and https://mapio.org/pic/p-121546929/
- **SG-INV-0347 Letychiv:** **49.381269,27.61802** is the historic Assumption church/Dominican monastery precinct. Separate Ukrainian site inventory reports **49.3813722,27.6180249** within ~12m. The current Roman Catholic shrine is not the old icon's Lublin original. https://zabytki.in.ua/service/uk/location/object/905
- **SG-INV-0535 Saint Cono, Florida, Uruguay — material correction:** previous coordinates **-34.09417,-56.21338** locate the cathedral according to the tourism page. Correct chapel is OSM **node 2131742844** at approximately **-34.0942,-56.2112**. The original bad coordinates are retained in `prior_source_point` and forbidden by the regression test. https://mapcarta.com/es/N2131742844 and https://uruguayenvacaciones.com/floridaimagen.html

**SG-INV-0747 Rakunai, Papua New Guinea — remains a qualified coordinate lead.** A secondary pilgrimage directory publishes **-4.274543,152.126021**, but an October 2025 report distinguishes the family hamlet, catechetical site, old grave, and *Rakunai Catholic church* now housing the martyr's remains. Without a mapped exact church feature the coordinate is only the settlement/pilgrimage-precinct lead; it cannot claim a specific saint's tomb or entrance. https://www.thenational.com.pg/torots-family-proud-of-historic-moment/ and https://www.vaticannews.va/en/church/news/2025-09/peter-to-rot-canonization-interview-postulator-fr-ravaioli.html.

## Six of the original F-lane no-point decisions

| Candidate | Result | New pin? |
| --- | --- | --- |
| `SG-INV-0071` "Our Lady of Snow, Santa Maria Maggiore (Bergamo)" | **Conflated name.** Canonical Basilica S. Maria Maggiore and Madonna della Neve in Rocchetta already exist. Bergamo Diocese independently lists two further distinct sanctuaries at *Colle Gallo, Gaverina Terme* and *Foppolo*. Do not arbitrarily select one. | **No** |
| `SG-INV-0676` "Saint Jude Kuala Lumpur shrine" | **Reuse** existing Church of St Jude **Rawang, Selangor** (`place:MY:st-jude-church-rawang`), confirmed by Kuala Lumpur Archdiocese. No distinct Kuala Lumpur shrine proven. | **No** |
| `SG-INV-0229` "Chapel of Our Lady, Sittard" | Multiple real structures: *Koningin des Hemelskapel*, De Wieër at **50.99721,5.86574**; *Onze Lieve Vrouw van Smarten* Kollenberg at **50.98864,5.88014**; Marian chapel inside Basilica of Sacred Heart. Name alone does not select one. | **No until target specified** |
| `SG-INV-0233` "Heilige Stede Amsterdam" | Original miracle chapel **demolished 1908**. Historic site and continuing Stille Omgang can be modelled in heritage and linked devotion, not as extant Catholic church. | **No current church pin** |
| `SG-INV-0534` "Our Lady Mount Carmel, Colonia" | **Reuse** `place:UY:santuario-nuestra-senora-del-carmen-carmelo`, already mapped at **-33.9995625,-58.2879375**, and located in **Carmelo town in Colonia Department**, not Colonia del Sacramento. Historic *Templo Viejo* is distinct from main parish church at -33.99755,-58.28414. | **No** |
| `SG-INV-0723` "Benedict Daswa pilgrimage, Tshitanini" | Tshitanini **was the 2015 beatification event field**, and development of a purpose-built shrine is stalled over property title. The **active shrine and tomb are at Our Lady of the Assumption Church, Nweli**, separately identified by the vice-postulator and South African Catholic reporting. Nweli is not yet a separate canonical Place in the 535-Place draft; stage as a **different future candidate**, never replace its village with Tshitanini coordinates. | **No built Tshitanini shrine pin** |

Source links for each verdict are recorded inside `identity_research.source_urls` on the machine board; especially https://www.archkl.org/north-west-district, https://iglesiacatolica.org.uy/mercedes/, https://diocesibg.it/santuario/santa-maria-ad-nives-al-colle-gallo/, https://www.deanderekaart.amsterdam/en/walks/2-the-miracle-of-amsterdam, and https://www.scross.co.za/2026/02/10-years-after-beatification-how-is-the-daswa-sainthood-cause-going/.

## Engineering guardrails and next move

The revised [geography regression](../../../tests/sacred-atlas-243-geographic-reconciliation.mjs) checks **24 staged points = 23 stronger + one qualified**, all 30 original F-lane records and 40 original missing-coordinate source IDs; the exact new coordinates and corrected San Cono pin; two references to **already-existing** canonical Places in MY and UY; six no-new-pin case decisions; and 0 owner-approved/imported/published.

**Next phase** is **country-area preflight and final explicit admission planning**. Five active-Catholic country codes still require separately reviewed geo-area entries `BF`, `HT`, `TL`, `TR`, `XK` (the last is operational Kosovo code, not a formally assigned ISO-3166 alpha-2), while four heritage-only codes remain deferred `AM`, `CY`, `ET`, `TN`. The draft research PR must be synced with latest `main` before any release. No approval or live publication is implied. GitHub Actions + GitHub Pages only.
