# Sacred Geography — thematic heritage inventory, Batch 1

Research date: 10 October 2026  
Owning Explore research issue: [#665](https://github.com/Fulcanelli13/ad-orientem/issues/665)  
Machine-readable [38-entry source-and-feature ledger](../../data/geography/research/thematic-sacred-heritage-2026-10-10.v1.json)  
Release status: **research-only; no new canonical Place, published pin, image, pilgrimage route, apparition or relic authentication**.

## Objective and ownership

Expand discovery from named shrines and pilgrimage sites into the material and landscape heritage surrounding Catholic devotion: **Black Madonnas, holy wells, sacred grottoes and caves, monumental Calvaries/sacred mountains, ex-votos and venerable objects**. This inventory is a **feature/association index**, not a new shrine register, not an alternate European country-acquisition owner and not an additional public-map data layer.

- The **Europe seven-wave register** [merged PR #919](https://github.com/Fulcanelli13/ad-orientem/pull/919) owns European *Place candidate identities*. This thematic register yields annotation, original references and candidate-relationship handoffs only.
- The **canonical geography seed** (`data/geography/seed-registry.v1.json`, 182 published Places) alone owns published physical Place IDs.
- The **shrines/pilgrimages, relics, apparitions and customs sources of truth** continue to own their substantive claims. A Black Madonna is a devotional **image object**; a reported apparition is a **claim**; a pilgrimage is an **event/route/destination relationship**, and a sacred well can be a subordinate or separate *physical feature*.
- One sanctuary may host a statue, a fountain, an ex-voto wall, and a pilgrimage route. These are not four new canonical Place pins.

## Verified first research batch

| Research classification | Source-backed rows | Examples and source families | Preexisting or provisional relationship |
| --- | ---: | --- | --- |
| BLACK_MADONNA | **6** | Rocamadour, Le Puy, Jasna Góra, Montserrat, Toulouse–La Daurade, Oropa | Published Places at Le Puy and Jasna Góra; Rocamadour, Montserrat, Oropa already in Europe's site-candidate corpus; Toulouse relationship unassigned |
| DEVOTIONAL_WELL | **14** | 12 Brittany fountains plus St Winefride's Wales and distinct St Winefride's well at Clutton, England | Wales is an existing canonical Place; original Brittany heritage IDs recorded where available |
| SACRED_LANDSCAPE | **10** | UNESCO's complete **nine individual Sacri Monti components**, plus Kalwaria Zebrzydowska | Kalwaria already published; Varese/Oropa require linking to existing European sanctuary research without collapsing different chapels or footprints |
| SACRED_CAVE | **4** | Sainte-Baume, Montserrat Santa Cova, Massabielle (Lourdes), Grottes St-Antoine Brive | Lourdes and Brive already published; the Sainte-Baume grotto is physically distinct from Saint-Maximin |
| EX_VOTO | **3** | Rocamadour, historical Le Puy offerings, Laghet's collection | Existing or existing-Europe relationships; **Laghet already represented in Customs Atlas**; no duplicated custom entry |
| VENERATED_RELIQUARY_IMAGE | **1** | Majesté de Sainte Foy at Conques | Conques already in Europe research wave 4; relic authenticity and custody remain separately governed |
| **Total** | **38** | **25 distinct cited source URLs** | Eight records attach to published Places, eight to existing Europe research leads; 22 require a future physical-parent decision. These groups count *records*, not unique Places. |

A large proportion of the 14 holy wells are **named historic features, not major autonomous pilgrimage destinations**. This is intentional: the task is inventory and typological discovery before significance selection.

## Important factual corrections and distinctions

1. The [Rocamadour sanctuary's Vierge noire page](https://www.sanctuairerocamadour.com/sanctuaire/vierge-noire/) and French [Palissy object notice IM46206958](https://pop.culture.gouv.fr/notice/palissy/IM46206958) establish the venerated image as a separate object inside the Rocamadour sanctuary. The heritage notice explains contested dating and historical darkening; avoid definitive unsupported origin myths.
2. The [Le Puy monument owner](https://www.cathedrale-puy-en-velay.fr/en/decouvrir/histoire-du-monument) and [municipal museum](https://www.musee.patrimoine.lepuyenvelay.fr/musee-crozatier/les-collections/les-oeuvres/histoire-et-artisanat-du-velay/vierges-noires/) distinguish the original medieval image, **destroyed in 1794**, from present replacement images/copies. An image history or copy is not a surviving original.
3. The [Montserrat abbey's original image page](https://abadiamontserrat.cat/en/santuari/our-lady-of-montserrat) describes the dark Romanesque carved statue and attributes its surface colour to changes to the varnish. Do not treat it as the painted icon of [Jasna Góra](https://en.jasnagora.pl/cudowny-obraz-matki-bo%C5%BCej/); they share a research *classification*, not material type or origin.
4. The [French Brittany regional heritage index](https://patrimoine.bzh/gertrude-diffusion/dossier/IA00005972) specifically identifies **five devotional fountains in Cléden-Cap-Sizun** (St They, St Mathieu, St Trémeur, St Catherine, St Guénolé). The same commune had **87 fountains and wash-house features** of many kinds, **not 87 religious fountains**. Its [St-They individual record](https://patrimoine.bzh/gertrude-diffusion/dossier/IA00006169) documents attributed healing beliefs as history, not medical fact. The [Confort-Meilars communal inventory](https://patrimoine.bzh/gertrude-diffusion/dossier/IA00005976) identifies **two devotional fountains** (Notre-Dame and Saint Mélar), again not all local water structures. The [Pont-Croix inventory](https://patrimoine.bzh/gertrude-diffusion/dossier/IA00005969/corpus) has two individually recorded devotional fountains in a larger mundane waterworks census. The [Querrien](https://www.patrimoine.bzh/gertrude-diffusion/dossier/IA00132041), [Josselin](https://patrimoine.bzh/gertrude-diffusion/dossier/IA00121555) and [Sainte-Evette](https://pop.culture.gouv.fr/notice/merimee/IA00006183) sites are separately documented.
5. **Two distinct St Winefride sites**, not a duplicate: the current Welsh [national Catholic shrine at Holywell](https://www.stwinefridesshrine.org/) is already in our canonical Places; [Historic England record 1018702](https://historicengland.org.uk/listing/the-list/list-entry/1018702?section=official-list-entry) describes a different named medieval pilgrimage-associated well at **Clutton, Cheshire**. No present Catholic operation or visitor admission is inferred for Clutton.
6. [UNESCO's nine Sacri Monti components](https://whc.unesco.org/en/list/1068/maps/) are fully indexed at component level **9/9** for this named serial World Heritage property (Varallo, Crea, Orta, Varese, Oropa, Ossuccio, Ghiffa, Domodossola, Belmonte). They are landscape complexes with many chapels, not nine standalone Parish churches or a source census of all Italian calvaries. Polish [Kalwaria Zebrzydowska](https://whc.unesco.org/en/list/905/) is an existing multi-building pilgrim landscape, not another site duplicate.
7. The [Dominican custodians of Sainte-Baume](https://www.saintebaume.org/grotte/) and the [Franciscan custodians at Brive](https://sanctuaire-saintantoine-brive.fr/le-sanctuaire/) support current grotto sanctuary identities. A devotional cave *within* an existing complex may be a subordinate feature; Sainte-Baume and Saint-Maximin are geographically distinct and not to be combined into one Place.
8. [Rocamadour's current ex-voto submission practice](https://www.sanctuairerocamadour.com/sanctuaire/vierge-noire/), [Le Puy's historical offerings](https://www.catholique-lepuy.fr/sanctuaires/notre-dame-du-puy/) and [Laghet's ex-voto archive](https://sanctuaire-laghet.fr/ex-votos/) show why the **existing Customs Atlas DEV-009** should be enriched with source-specific attachments rather than duplicated as another custom.

## Scope audit and genuine percentages

| Defined source corpus | Verified index scope | Review status |
| --- | --- | --- |
| UNESCO 2003 serial property: Sacri Monti components | **9/9** | 100% component-name acquisition, no chapel subfeature inventory |
| Brittany Cléden-Cap-Sizun officially identified religious fountains | **5/5** | 100% name-level inventory for that one commune, not detailed georeferencing |
| Brittany Confort-Meilars religious fountains | **2/2** | 100% name-level communal list, no exact physical coordinate validation |
| Pont-Croix individually indexed devotional fountain dossiers | **2/2** | 100% names in the specified collective index |
| Worldwide Black Madonnas | **6 selected** | No global denominator or defensible completeness percentage |
| France/Brittany all devotional fountains | **12 selected French wells** | No complete regional denominator; source families discovered |
| Worldwide caves, images, ex-votos, Calvaries | **Selected first batch** | No credible global completion percentage |

## Next research queues

**Source-depth acquisition** (not another European country sweep): (1) French Palissy/Mérimée object and building notices for *Vierges noires*, destroyed originals, devotional fountains, parish enclosures, monumental calvaries and statues; (2) Brittany Regional Inventory's thematic `lieux et objets de pardon et de pèlerinage` records, with per-commune source coverage; (3) historic Catholic sanctuary source works, original monastery and diocesan image accounts; (4) nine Sacri Monti site custodians to enrich each landscape's chapel clusters, carefully separate from public-map routing; (5) non-European comparable source registers for Catholic wells, sacred caves, major Calvaries and venerated images.

**Other candidate classifications**, currently **not yet inventoried or counted**: martyrdom sites; saints' cells, tombs and life places; Eucharistic miracle traditions; relic translation routes; sacred biblical locations; historic wayside crosses/oratories; Marian image coronations; historical processions and pardons; maritime votive sanctuaries; important church-connected hermitages and holy islands. They should be tackled as discrete source-supported feature sets under their existing doctrinal/archival owners.

**Publication gate:** Never infer original statue survival, miraculous authenticity, relic authentication, exact coordinates, general access, pilgrimage schedules, chapel opening hours, route geometry, reuse rights, or new map pins from a source-index row. **Source acquisition is not canonical Place admission.**
